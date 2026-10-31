/* FlowTrace — video calls with live effects. © 2026 FinDevelopers
 *
 * One-to-one calls, peer to peer (WebRTC). The server only introduces the two tabs (calls.js, over the presence
 * socket /ws); the video goes straight from one browser to the other, or through TURN when the network needs it.
 *
 * What you send is not the camera itself but a canvas it is drawn on:
 *   camera → <video> → MediaPipe (hand landmarks + person mask, ~30 times a second)
 *                    → Three.js (background blur / studio, and the effects as shaders) → <canvas>
 *   canvas.captureStream(30) → RTCRtpSender.replaceTrack() → the other person
 * so they see the background and the effects exactly as you do. Effects off, or this tab in the background (the
 * canvas stops drawing there), sends the plain camera instead; switching never renegotiates the call.
 *
 * Effects, started by snapping your fingers (thumb + middle finger), or with the buttons:
 *   right hand  Dust: you crumble into ash from the snap outwards, and the wind carries it off, swirling (curl
 *               noise), the fine ash rising and heavier flakes falling; then it all plays backwards and you are back
 *   left hand   Voxels: you break into 3D cubes that spin off into the room, then they walk back in, each on its
 *               own path, and build you again from the feet up, locking in with a flash of neon
 * Behind you while you are gone: the room as last seen around you (kept as you move), or the studio backdrop.
 *
 * Three.js and MediaPipe load from jsDelivr the first time the page needs them; without them (offline, no WebGL)
 * the call still works with the plain camera.
 *
 * The snap itself is found in public/gesture.js.
 *
 * window.flowCall: setup({ send, ice, icon, toast, alert, onChange }), open(el, room), room(), active(),
 *                  signal(message), reconnected(), leave()
 */
window.flowCall = (() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
  const VISION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35';
  const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  const SEG_MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';
  const FPS = 30;
  const ROOM = /^[a-z0-9][a-z0-9-]{2,39}$/;
  // ms. Dust: blowing away (you are all gone 2.4 s in; the dust drifts on), then the same paths backwards: you come
  // back together. Voxels: you break up, are gone, the cubes walk back in and build you, then they melt into the video.
  const TIMING = { ash: { away: 4600, back: 1800 }, voxel: { out: 900, gone: 400, build: 3200, settle: 700 } };
  const BG = { camera: 'Camera', blur: 'Blur', studio: 'Studio' };

  let opts = { send() {}, ice: () => Promise.resolve([]), icon: () => '', toast() {}, alert() {}, onChange() {} };
  const st = {
    el: null, // the page's element
    room: null, // the room joined (or joining)
    draft: '', // the room name typed, before joining
    peerInfo: null, // { id, name } of the other person
    status: '', // waiting | connecting | connected | failed
    media: null, // { stream, video, audio } from the camera
    fx: null, // the effects (Three.js), or null
    vision: null, // MediaPipe, or null
    note: '', // what is loading, or why effects are off
    peer: null, // { pc, polite, makingOffer, ignoreOffer, sender }
    iceServers: null,
    fxOn: true,
    bg: 'blur',
    gestures: true,
    check: false, // Gesture check shown
    mic: true,
    cam: true,
  };
  const $q = (sel) => (st.el ? st.el.querySelector(sel) : null);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const changed = () => { render(); opts.onChange(); };

  // ---------------------------------------------------------------- the page

  function open(el, room) {
    if (st.el !== el || !el.querySelector('.call-page')) mount(el);
    const r = String(room || '').trim().toLowerCase();
    if (r && !st.room) st.draft = r;
    render();
  }

  function mount(el) {
    st.el = el;
    el.innerHTML = `
      <div class="call-page">
        <div class="call-head">
          <div><h1 class="text-xl font-semibold text-slate-900">Video call</h1>
            <p class="text-sm text-slate-500">Peer to peer: the video goes straight to the other person, never through FlowTrace.</p></div>
          <p class="call-status" data-call-status></p>
        </div>
        <div class="call-stage solo" data-call-stage>
          <video class="call-remote" data-call-remote autoplay playsinline></video>
          <div class="call-wait" data-call-wait></div>
          <div class="call-check hidden" data-call-check><p>Waiting for hand tracking…</p></div>
          <div class="call-capture hidden" data-call-capture></div>
          <div class="call-self">
            <video class="call-cam" data-call-cam autoplay playsinline muted></video>
            <canvas class="call-canvas hidden" data-call-canvas></canvas>
          </div>
        </div>
        <div class="call-bar" data-call-bar></div>
        <p class="call-help">Snap your fingers (thumb and middle finger) in front of the camera:
          <b>right hand</b> turns you to dust that the wind carries off, <b>left hand</b> breaks you into cubes that walk
          back and build you again. The other person sees it too.
          Keep the whole hand in view (wrist too), in good light. Missed snaps? <b>Gesture check</b> shows what the camera sees.</p>
        <p class="call-help hidden" data-call-roomseen></p>
      </div>`;
    el.addEventListener('click', onClick);
    el.addEventListener('change', onChange);
    el.addEventListener('input', (e) => { if (e.target.matches('[data-call-room]')) st.draft = e.target.value; });
    el.addEventListener('submit', (e) => { e.preventDefault(); join(st.draft); });
  }

  function render() {
    if (!st.el) return;
    const i = opts.icon;
    const stage = $q('[data-call-stage]');
    const connected = st.status === 'connected';
    stage.classList.toggle('solo', !connected);
    $q('[data-call-remote]').classList.toggle('hidden', !connected);
    const usingFx = Boolean(st.fx && st.fxOn);
    $q('[data-call-canvas]').classList.toggle('hidden', !usingFx);
    $q('[data-call-check]').classList.toggle('hidden', !(st.check && st.vision));
    $q('[data-call-cam]').classList.toggle('call-offscreen', usingFx);

    const who = st.peerInfo ? esc(st.peerInfo.name) : 'the other person';
    const wait = !st.media ? `${i('video', 32)}<p class="font-medium">Your camera is off</p><p class="text-sm opacity-80">Join a room, or preview your camera and effects first.</p>`
      : !st.room || connected ? ''
        : st.status === 'connecting' ? `<p class="font-medium">Connecting to ${who}…</p>`
          : st.status === 'failed' ? `<p class="font-medium">Could not reach ${who}</p><p class="text-sm opacity-80">Your network blocks a direct connection. A TURN server fixes this (TURN_URLS in .env).</p>`
            : `<p class="font-medium">Waiting for someone to join <b>${esc(st.room)}</b></p><p class="text-sm opacity-80">Send them the link.</p>`;
    const $wait = $q('[data-call-wait]');
    $wait.innerHTML = wait;
    $wait.classList.toggle('hidden', !wait);
    $wait.classList.toggle('over', Boolean(st.media));

    const status = st.room ? (connected ? `<span class="call-dot"></span>In call with ${who}` : st.status === 'connecting' ? 'Connecting…' : st.status === 'failed' ? 'Connection failed' : 'Waiting…') : '';
    $q('[data-call-status]').innerHTML = [status, st.note && `<span class="text-slate-400">${esc(st.note)}</span>`].filter(Boolean).join(' · ');

    const tog = (key, on, label, title) => `<button type="button" class="btn-secondary call-tog ${on ? 'on' : 'off'}" data-call="${key}" aria-pressed="${on}" title="${esc(title)}">${label}</button>`;
    const fxReady = Boolean(st.fx);
    $q('[data-call-bar]').innerHTML = `
      ${st.room ? `
        <span class="call-chip" title="Room">${i('link', 14)} ${esc(st.room)}</span>
        <button type="button" class="btn-secondary" data-call="copy">${i('copy', 14)} Copy link</button>` : `
        <form class="call-join" data-call-form>
          <input class="input" data-call-room placeholder="room-name" maxlength="40" pattern="[a-z0-9][a-z0-9-]{2,39}" title="3 to 40 letters, numbers and dashes" value="${esc(st.draft || (st.draft = newRoom()))}">
          <button class="btn-primary">${i('video', 14)} Join call</button>
        </form>
        ${st.media ? '' : '<button type="button" class="btn-secondary" data-call="preview">Preview camera</button>'}`}
      ${st.media ? `
        <span class="call-sep"></span>
        ${tog('mic', st.mic, st.mic ? 'Mic on' : 'Mic off', 'Microphone')}
        ${tog('cam', st.cam, st.cam ? 'Camera on' : 'Camera off', 'Camera')}
        ${tog('fx', st.fxOn, st.fxOn ? 'Effects on' : 'Effects off', 'Send the effects canvas, or the plain camera')}
        <label class="call-select" title="Background">Background
          <select class="input" data-call-bg ${fxReady && st.fxOn && st.vision ? '' : 'disabled'}>
            ${Object.entries(BG).map(([k, v]) => `<option value="${k}" ${k === st.bg ? 'selected' : ''}>${v}</option>`).join('')}
          </select></label>
        ${tog('gestures', st.gestures, st.gestures ? 'Gestures on' : 'Gestures off', 'Snap your fingers to start the effects')}
        <button type="button" class="btn-secondary" data-call="capture" ${st.vision && st.fxOn ? '' : 'disabled'} title="Step out of view for a moment, so the room behind you is kept: you then vanish into your real room">Capture room</button>
        <button type="button" class="btn-secondary call-tog ${st.check ? 'on' : ''}" data-call="check" aria-pressed="${st.check}" ${st.vision ? '' : 'disabled'} title="Show what the camera sees of your hands">Gesture check</button>
        <button type="button" class="btn-secondary" data-call="ash" ${fxReady && st.fxOn ? '' : 'disabled'} title="Dust (snap with your right hand)">Dust</button>
        <button type="button" class="btn-secondary" data-call="voxel" ${fxReady && st.fxOn ? '' : 'disabled'} title="Voxels (snap with your left hand)">Voxels</button>
        <span class="call-sep"></span>
        <button type="button" class="btn-danger" data-call="leave">${st.room ? 'Leave call' : 'Stop camera'}</button>` : ''}`;
  }

  function onClick(e) {
    const b = e.target.closest('[data-call]');
    if (!b || b.disabled) return;
    const what = b.getAttribute('data-call');
    if (what === 'preview') startMedia().catch(mediaError);
    else if (what === 'leave') leave();
    else if (what === 'copy') copyLink();
    else if (what === 'mic') { st.mic = !st.mic; if (st.media.audio) st.media.audio.enabled = st.mic; render(); }
    else if (what === 'cam') { st.cam = !st.cam; st.media.video.enabled = st.cam; render(); }
    else if (what === 'fx') { st.fxOn = !st.fxOn; if (st.fxOn && !st.fx) loadEffects(); syncTrack(); render(); }
    else if (what === 'gestures') { st.gestures = !st.gestures; render(); }
    else if (what === 'check') { st.check = !st.check; render(); }
    else if (what === 'capture') captureRoom();
    else if (what === 'ash' || what === 'voxel') { if (st.fx) st.fx.trigger(what, 0.5, 0.75); }
  }
  function onChange(e) {
    if (e.target.matches('[data-call-bg]')) { st.bg = e.target.value; if (st.fx) st.fx.background(st.bg); }
  }

  function newRoom() {
    const abc = 'abcdefghjkmnpqrstuvwxyz';
    const r = crypto.getRandomValues(new Uint8Array(10));
    const s = [...r].map((n) => abc[n % abc.length]).join('');
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  }
  const link = () => `${location.origin}${location.pathname}#call=${encodeURIComponent(st.room)}`;
  function copyLink() {
    const url = link();
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(() => opts.toast('Link copied: send it to the person you want to call'))
      .catch(() => opts.alert(url, 'Call link'));
  }

  // ---------------------------------------------------------------- camera

  async function startMedia() {
    if (st.media) return st.media;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser cannot use the camera here (it needs https or localhost).');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } }, // more frames, fewer missed snaps
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    st.media = { stream, video: stream.getVideoTracks()[0], audio: stream.getAudioTracks()[0] || null };
    st.media.video.enabled = st.cam;
    if (st.media.audio) st.media.audio.enabled = st.mic;
    const cam = $q('[data-call-cam]');
    cam.srcObject = stream;
    await cam.play().catch(() => {});
    if (!cam.videoWidth) await new Promise((ok) => { cam.onloadedmetadata = ok; });
    render();
    if (st.fxOn) loadEffects();
    return st.media;
  }
  function mediaError(err) {
    const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
    opts.alert(denied ? 'FlowTrace may not use your camera. Allow it in the address bar (the camera icon) and try again.'
      : `The camera could not start: ${err && err.message ? err.message : err}`, 'Camera');
  }
  function stopMedia() {
    stopCapture();
    if (st.vision) { st.vision.stop(); st.vision = null; }
    if (st.fx) { st.fx.dispose(); st.fx = null; }
    if (st.media) st.media.stream.getTracks().forEach((t) => t.stop());
    st.media = null;
    st.note = '';
    const cam = $q('[data-call-cam]');
    if (cam) cam.srcObject = null;
  }

  // ---------------------------------------------------------------- effects: load, and MediaPipe → shader uniforms

  let loading = null;
  function loadEffects() {
    if (loading || st.fx || !st.media) return loading;
    st.note = 'Loading effects…';
    render();
    const media = st.media;
    loading = import(THREE_URL)
      .then((THREE) => {
        if (st.media !== media) return;
        st.fx = createFx(THREE, $q('[data-call-cam]'), $q('[data-call-canvas]'));
        st.fx.background(st.bg);
        syncTrack();
        st.note = 'Loading hand and background tracking…';
        render();
        return createVision($q('[data-call-cam]'), onVision).then((v) => {
          if (st.media !== media) { v.stop(); return; }
          st.vision = v;
          st.note = '';
          render();
        }, (err) => {
          console.error('Call tracking:', err);
          st.note = 'Background and gestures are off (tracking did not load)';
          render();
        });
      })
      .catch((err) => {
        console.error('Call effects:', err);
        st.note = 'Effects are off (WebGL or the network): sending the plain camera';
        render();
      })
      .finally(() => { loading = null; });
    return loading;
  }

  const snaps = {}; // one detector per hand (public/gesture.js)
  const seen = {}; // hand → its last { gap, curl, state, at }, for Gesture check
  let lastSnap = null; // { side, at }
  function onVision(now, hands, mask, mw, mh) {
    const fx = st.fx;
    if (!fx) return;
    if (mask) { fx.mask(mask, mw, mh); paintRoomSeen(); }
    const cam = $q('[data-call-cam]');
    const w = cam.videoWidth;
    const h = cam.videoHeight;
    (hands ? hands.landmarks : []).forEach((lm, n) => {
      // MediaPipe names hands as if the picture were mirrored; the camera's picture is not, so "Left" is your right hand
      const side = (hands.handedness[n] && hands.handedness[n][0] && hands.handedness[n][0].categoryName) || 'Right';
      // the world landmarks (real 3D, in metres) measure a hand turned sideways right; else the picture's, in pixels
      const world = hands.worldLandmarks && hands.worldLandmarks[n];
      const points = world && world.length ? world : lm.map((p) => ({ x: p.x * w, y: p.y * h, z: p.z * w }));
      const detect = snaps[side] || (snaps[side] = window.flowGesture.snapDetector());
      const r = detect(points, now);
      if (!r) return;
      seen[side] = { ...r, at: now, missed: r.missed ? { ...r.missed, at: now } : seen[side] && seen[side].missed };
      if (r.snap && st.gestures) {
        lastSnap = { side, at: now };
        // landmarks: y down from the top; the shaders' uv: y up from the bottom
        fx.trigger(side === 'Left' ? 'ash' : 'voxel', (lm[4].x + lm[12].x) / 2, 1 - (lm[4].y + lm[12].y) / 2);
      }
    });
    if (st.check) paintCheck(now);
  }

  // When you vanish, what shows where you were is the room the camera saw behind you; what it never saw is filled in
  // from around you (blurry). Say how much it saw, and how to let it see the rest.
  let roomShown = '';
  function paintRoomSeen() {
    const r = st.fx && st.fx.roomSeen();
    const pct = r == null ? null : Math.round(r * 20) * 5;
    const text = pct == null ? '' : pct >= 90 ? `Room behind you: ${pct}% seen. You vanish into your real room.`
      : `Room behind you: ${pct}% seen. Press Capture room and step out of view for a moment (or lean aside), and you vanish into your real room instead of a blur filled in from around you.`;
    if (text === roomShown) return;
    roomShown = text;
    const el = $q('[data-call-roomseen]');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
  }

  // Capture room (the clean plate): a 3 s countdown to step out of view, then the room is taken in, with nobody in
  // front of it, until 97 % of it is seen (or 7 s). Back in view, what is behind you is the room as it really is
  // (wall, shelves, no shadow of you), not filled in: you vanish into it, in Blur or Camera, with nothing left behind.
  let capturing = null;
  function stopCapture() {
    clearInterval(capturing);
    capturing = null;
    const el = $q('[data-call-capture]');
    if (el) el.classList.add('hidden');
  }
  function captureRoom() {
    if (capturing || !st.fx) return;
    const el = $q('[data-call-capture]');
    const started = Date.now();
    const show = (html) => { el.innerHTML = html; el.classList.remove('hidden'); };
    capturing = setInterval(() => {
      const t = (Date.now() - started) / 1000;
      const pct = Math.round((st.fx ? st.fx.frameSeen() : 0) * 100);
      if (t < 3) { show(`<b>Step out of view</b><span>${Math.ceil(3 - t)}</span><small>so the camera can see your whole room</small>`); return; }
      if (t < 10 && pct < 97) { show(`<b>Taking in your room…</b><span>${pct}%</span><small>stay out of view</small>`); return; }
      stopCapture();
      opts.toast(pct >= 97 ? `Room captured (${pct}%): come back in` : `Only ${pct}% of the room was seen: make sure nobody is in view and try again`);
    }, 200);
  }

  // Gesture check: what the camera sees of each hand, live, to find out why a snap is missed
  const frames = [];
  let painted = 0;
  function paintCheck(now) {
    frames.push(now);
    while (now - frames[0] > 1000) frames.shift();
    if (now - painted < 120) return;
    painted = now;
    const D = window.flowGesture.DEFAULTS;
    const row = (side, label) => {
      const r = seen[side];
      if (!r || now - r.at > 500) return `<p><b>${label}</b> <span class="call-check-off">not in view</span></p>`;
      const gap = r.gap <= D.pressed ? 'on' : r.gap >= D.apart ? 'far' : '';
      // the last try that was not a snap, and which limit stopped it
      const m = r.missed && now - r.missed.at < 4000 ? r.missed : null;
      const lim = (v, need, text) => `<span class="call-check-${v >= need ? 'on' : 'off'}">${text} ${v.toFixed(2)}/${need}</span>`;
      const miss = m ? `<br><span class="call-check-off">Missed:</span> ${lim(m.gap, D.apart, 'gap')} · ${lim(m.speed, D.speed, 'speed')} · ${lim(m.drop, D.drop, 'drop')}` : '';
      return `<p><b>${label}</b> gap <span class="call-check-${gap}">${r.gap.toFixed(2)}</span> · curl ${r.curl.toFixed(2)} · <span class="call-check-${r.state}">${r.state}</span>${miss}</p>`;
    };
    const fps = frames.length;
    $q('[data-call-check]').innerHTML = `
      <p><b>Your hands</b> · tracked ${fps} times a second${fps < 20 ? ' <span class="call-check-off">(low: snaps can be missed; close other tabs and apps)</span>' : ''}</p>
      ${row('Left', 'Right hand → Dust')}
      ${row('Right', 'Left hand → Voxels')}
      ${lastSnap && now - lastSnap.at < 1500 ? `<p class="call-check-snap">Snap! (${lastSnap.side === 'Left' ? 'right' : 'left'} hand)</p>` : ''}
      <p class="call-check-hint">Press thumb and middle finger together until it says <i>pressed</i> (gap ≤ ${D.pressed}), then snap:
        within ${D.within} ms the gap passes ${D.apart}, opening at ${D.speed}+ hand sizes a second, as the finger drops ${D.drop}+ into your palm.</p>`;
  }

  async function createVision(video, onFrame) {
    const { FilesetResolver, HandLandmarker, ImageSegmenter } = await import(`${VISION}/vision_bundle.mjs`);
    const files = await FilesetResolver.forVisionTasks(`${VISION}/wasm`);
    const make = (delegate) => Promise.all([
      // low presence / tracking bars: the hand stays tracked through the blur of the snap itself
      HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate }, runningMode: 'VIDEO', numHands: 2,
        minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.3, minTrackingConfidence: 0.3,
      }),
      ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: SEG_MODEL, delegate }, runningMode: 'VIDEO', outputConfidenceMasks: true, outputCategoryMask: false,
      }),
    ]);
    const [hands, seg] = await make('GPU').catch(() => make('CPU'));
    let stopped = false;
    let last = -1;
    let busy = false;
    const next = (f) => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(f) : requestAnimationFrame(f));
    // once per camera frame, not per screen frame
    const tick = (now) => {
      if (stopped) return;
      if (video.readyState >= 2 && now > last) {
        last = now;
        try {
          const t0 = performance.now();
          const found = hands.detectForVideo(video, now);
          // a slow computer: the mask only every other frame, so the hands (the snaps) keep every frame
          if (busy) { busy = false; onFrame(now, found, null, 0, 0); } else {
            seg.segmentForVideo(video, now, (r) => {
              // the last mask is the person (a one-class model has only that one); it is only valid inside this callback
              const masks = r.confidenceMasks || [];
              const m = masks[masks.length - 1];
              onFrame(now, found, m ? m.getAsFloat32Array() : null, m ? m.width : 0, m ? m.height : 0);
            });
            busy = performance.now() - t0 > 25;
          }
        } catch (err) { console.error('Call tracking:', err); }
      }
      next(tick);
    };
    next(tick);
    return { stop() { stopped = true; hands.close(); seg.close(); } };
  }

  // ---------------------------------------------------------------- effects: Three.js + GLSL

  // Simplex noise 2D (Ashima Arts / Stefan Gustavson, MIT: github.com/stegu/webgl-noise)
  const NOISE = `
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }`;
  // Simplex noise 3D (Ashima Arts / Stefan Gustavson, MIT: github.com/stegu/webgl-noise), for the wind's swirls
  const NOISE3 = `
    vec4 permute4(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise3(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0);
      vec4 p = permute4(permute4(permute4(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      vec3 ns = (1.0 / 7.0) * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }`;
  // Seconds since this point of you blew away (negative: not yet). From the snap outwards with a ragged noisy front,
  // all of you gone 2.4 s after the snap. uAshClock runs back during the return, so everything plays backwards.
  // The picture and the dust use the same age, so a pixel vanishes exactly where its particle leaves.
  const ASH = `
    uniform float uAshOn, uAshClock, uAspect;
    uniform vec2 uOrigin;
    float ashAge(vec2 uv) {
      vec2 a = vec2(uAspect, 1.0);
      return uAshClock - (distance(uv * a, uOrigin * a) * 0.6 + (snoise(uv * 6.0) * 0.5 + 0.5) * 0.4) * 1.5;
    }`;
  const MASK = 'float personAt(vec2 uv) { return texture2D(uMask, vec2(uv.x, 1.0 - uv.y)).r; }'; // the mask's rows go top down
  const QUAD_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const PLANE_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

  // The person mask, feathered: MediaPipe's mask is 256 × 256 with hard, stepped edges. Blurred on the GPU (a Gaussian,
  // across then down) twice: a little (uSoft: the edge of you, soft and smooth) and a lot (uWide: the margin round you).
  // The row fill below goes through it too (down only), to smooth it from row to row.
  const BLUR_FS = `
    uniform sampler2D uSrc;
    uniform vec2 uStep; // between two taps, in uv
    uniform bool uFlip; // the raw mask: its rows go top down
    varying vec2 vUv;
    void main() {
      vec4 sum = vec4(0.0);
      float total = 0.0;
      for (int i = -4; i <= 4; i++) {
        float w = exp(-float(i * i) / 8.0); // σ = 2 taps
        vec2 uv = vUv + uStep * float(i);
        sum += texture2D(uSrc, uFlip ? vec2(uv.x, 1.0 - uv.y) : uv) * w;
        total += w;
      }
      gl_FragColor = vec4(sum.rgb / total, 1.0);
    }`;
  // you (soft edge), and near you: a margin, smooth and round, where the camera may still show bits of you (hair,
  // shoulders and hands, where the mask is unsure, and where you were a frame ago when you move)
  const NEAR = `
    uniform sampler2D uSoft, uWide;
    float softAt(vec2 uv) { return texture2D(uSoft, uv).r; }
    float nearYou(vec2 uv) { return max(smoothstep(0.02, 0.15, texture2D(uWide, uv).r), smoothstep(0.05, 0.3, softAt(uv))); }`;

  // Calm: how long each pixel has been clear of you AND unchanged in the camera (r: up to 8 frames; g: its brightness
  // last frame). The mask is a frame or two late when you move: as you step into a spot, it still says "room" there.
  // The camera does not lag, so the change stops the learning at once, and a late mask cannot put you in the room.
  const CALM_FS = `
    uniform sampler2D uVideo, uOldCalm;
    varying vec2 vUv;
    ${NEAR}
    void main() {
      vec4 old = texture2D(uOldCalm, vUv);
      float lum = dot(texture2D(uVideo, vUv).rgb, vec3(0.299, 0.587, 0.114));
      bool calm = nearYou(vUv) < 0.05 && abs(lum - old.g) < 0.05;
      gl_FragColor = vec4(calm ? min(old.r + 0.125, 1.0) : 0.0, lum, 0.0, 1.0);
    }`;

  // The room without you: every camera pixel that is clearly not you is kept; behind you it keeps the last one seen.
  // Never learnt: you and the margin round you, or a pixel that has not been calm (above) for 8 frames in a row.
  // Learnt over a few frames, not at once. Any of it would otherwise leave a ghost of you in the room.
  const PLATE_FS = `
    uniform sampler2D uVideo, uOld, uCalm;
    varying vec2 vUv;
    ${NEAR}
    void main() {
      float settled = step(0.99, texture2D(uCalm, vUv).r);
      float now = (1.0 - nearYou(vUv)) * settled * 0.3; // how surely this is the room now, at most 30 % a frame
      vec4 old = texture2D(uOld, vUv);
      vec3 cam = texture2D(uVideo, vUv).rgb;
      // rgb: the room's own colour (never darkened by how much was seen); a: how much of it was seen
      gl_FragColor = vec4(mix(old.a > 0.0 ? old.rgb : cam, cam, now), mix(old.a, 1.0, now));
    }`;

  // The room behind you was never seen (you were in front of it): it is filled in from the room around it, so you
  // vanish into your room and not into a hole. Push-pull: halve the plate until every texel holds some seen room,
  // then come back up, each level keeping what it saw and taking the rest from the level below. The halves are kept
  // premultiplied (colour × how much was seen), so blending a seen texel with an unseen one does not darken it.
  const DOWN_FS = `
    uniform sampler2D uSrc;
    uniform vec2 uTexel;
    uniform bool uPlate; // the plate itself: own colour + how much seen, not premultiplied yet
    varying vec2 vUv;
    void main() {
      vec4 sum = vec4(0.0);
      for (int x = 0; x < 2; x++) for (int y = 0; y < 2; y++) {
        vec4 c = texture2D(uSrc, vUv + (vec2(float(x), float(y)) - 0.5) * uTexel);
        sum += uPlate ? vec4(c.rgb * c.a, c.a) : c;
      }
      gl_FragColor = sum * 0.25;
    }`;
  // The averaged fill turns a busy room into a grey smudge in the middle of a big hole. Rooms are mostly level
  // (shelves, desk, wall, skirting), so each unseen texel also takes the nearest seen room to its left and right on
  // its own row, blended by distance: the shelves and the wall go on through where you were. The averaged fill stays
  // under it, and alone where a row has no room seen on either side.
  const ROW_FS = `
    uniform sampler2D uSrc; // the plate at half size: premultiplied, alpha = how much was seen
    uniform sampler2D uPush; // the averaged fill, same size
    uniform vec2 uTexel;
    varying vec2 vUv;
    vec3 colour(vec4 c) { return c.rgb / max(c.a, 0.0001); }
    void main() {
      vec4 here = texture2D(uSrc, vUv);
      if (here.a > 0.95) { gl_FragColor = vec4(colour(here), 1.0); return; }
      // on each side: how far the room starts, and the average of its first 6 seen texels (not one: less blocky)
      vec3 left = vec3(0.0);
      vec3 right = vec3(0.0);
      float nl = 0.0;
      float nr = 0.0;
      float dl = -1.0;
      float dr = -1.0;
      for (int i = 1; i <= 200; i++) {
        float o = float(i) * uTexel.x;
        if (nl < 6.0 && vUv.x - o > 0.0) {
          vec4 c = texture2D(uSrc, vec2(vUv.x - o, vUv.y));
          if (c.a > 0.6) { left += colour(c); nl += 1.0; if (dl < 0.0) dl = float(i); }
        }
        if (nr < 6.0 && vUv.x + o < 1.0) {
          vec4 c = texture2D(uSrc, vec2(vUv.x + o, vUv.y));
          if (c.a > 0.6) { right += colour(c); nr += 1.0; if (dr < 0.0) dr = float(i); }
        }
        if ((nl >= 6.0 || vUv.x - o <= 0.0) && (nr >= 6.0 || vUv.x + o >= 1.0)) break;
      }
      left /= max(nl, 1.0);
      right /= max(nr, 1.0);
      vec3 push = texture2D(uPush, vUv).rgb;
      vec3 row = dl > 0.0 && dr > 0.0 ? mix(left, right, dl / (dl + dr)) : dl > 0.0 ? left : dr > 0.0 ? right : push;
      float trust = dl > 0.0 && dr > 0.0 ? 0.8 : dl > 0.0 || dr > 0.0 ? 0.45 : 0.0;
      gl_FragColor = vec4(mix(mix(push, row, trust), colour(here), smoothstep(0.5, 0.95, here.a)), 1.0);
    }`;

  // how much of the room behind you (where the mask says you are) was seen: r = seen there, g = you, b = seen
  const COVER_FS = `
    uniform sampler2D uMask, uPlate;
    varying vec2 vUv;
    ${MASK}
    void main() {
      float you = step(0.5, personAt(vUv));
      float seen = texture2D(uPlate, vUv).a;
      gl_FragColor = vec4(seen * you, you, seen, 1.0); // b: seen anywhere (for Capture room)
    }`;
  const UP_FS = `
    uniform sampler2D uFine, uCoarse;
    uniform vec2 uCoarseTexel;
    uniform bool uLast;
    varying vec2 vUv;
    vec3 colour(vec4 c) { return c.a > 0.0 ? c.rgb / c.a : vec3(0.0); }
    void main() {
      vec4 fine = texture2D(uFine, vUv);
      // four taps half a texel apart: smoother than one bilinear tap (no blocks or diamonds in the fill)
      vec4 coarse = 0.25 * (texture2D(uCoarse, vUv + vec2(-0.5, -0.5) * uCoarseTexel) + texture2D(uCoarse, vUv + vec2(0.5, -0.5) * uCoarseTexel)
        + texture2D(uCoarse, vUv + vec2(-0.5, 0.5) * uCoarseTexel) + texture2D(uCoarse, vUv + vec2(0.5, 0.5) * uCoarseTexel));
      // the smallest level: nothing of the room seen at all yet (no mask so far) → a dark grey
      vec3 below = uLast ? mix(vec3(0.08, 0.09, 0.11), colour(coarse), step(0.001, coarse.a)) : coarse.rgb;
      gl_FragColor = vec4(mix(below, colour(fine), clamp(fine.a * 2.0, 0.0, 1.0)), 1.0);
    }`;

  // The room without you, to show where you were: the live camera away from you; near and behind you the kept room
  // (uPlate), and where that was never seen the fill (uFill). Each blends into the next, no hard edges: the kept room
  // gives way to the fill a little inside where it was seen, over a smooth measure of how much was (uSeen: the
  // coverage of 8 × 8 plate pixels), so the seam is soft and away from any bits of you at its edge.
  const WITHOUT_YOU = `
    uniform sampler2D uVideo, uPlate, uFill, uSeen;
    ${NEAR}
    vec3 room(vec2 uv) {
      vec4 p = texture2D(uPlate, uv);
      float seen = p.a * smoothstep(0.55, 0.98, texture2D(uSeen, uv).a);
      return mix(texture2D(uFill, uv).rgb, p.rgb, seen);
    }
    vec3 clean(vec2 uv) { return mix(texture2D(uVideo, uv).rgb, room(uv), nearYou(uv)); }`;
  // the clean room, at half size every frame, for the blurred background (16 taps of it, not 16 of everything)
  const CLEAN_FS = `
    varying vec2 vUv;
    ${WITHOUT_YOU}
    void main() { gl_FragColor = vec4(clean(vUv), 1.0); }`;

  const MAIN_FS = `
    uniform sampler2D uClean;
    uniform int uBg;
    uniform float uVoxHide;
    uniform vec2 uTexel;
    varying vec2 vUv;
    ${NOISE}
    ${ASH}
    ${WITHOUT_YOU}
    vec3 studio(vec2 uv) {
      float v = clamp(1.0 - distance(uv, vec2(0.5, 0.65)) * 1.1, 0.0, 1.0);
      return mix(vec3(0.02, 0.03, 0.07), vec3(0.13, 0.16, 0.28), v);
    }
    vec3 blurred(vec2 uv) {
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 16; i++) { // a disc of 16 samples (golden angle)
        float r = sqrt(float(i) + 0.5) / 4.0;
        float a = float(i) * 2.39996;
        sum += texture2D(uClean, uv + vec2(cos(a), sin(a)) * r * uTexel * 26.0).rgb;
      }
      return sum / 16.0;
    }
    void main() {
      vec3 cam = texture2D(uVideo, vUv).rgb;
      float person = smoothstep(0.25, 0.75, softAt(vUv)); // a feathered edge, a few pixels wide
      bool fx = uAshOn + uVoxHide > 0.0;
      // the blurred background is of the room without you, so your colours do not bleed into it round your edge
      vec3 bg = uBg == 2 ? studio(vUv) : uBg == 1 ? blurred(vUv) : fx ? clean(vUv) : cam;
      float age = ashAge(vUv);
      float here = uVoxHide > 0.0 ? 1.0 - uVoxHide : uAshOn > 0.0 ? 1.0 - smoothstep(-0.02, 0.02, age) : 1.0;
      float burnt = uAshOn > 0.0 ? smoothstep(-0.35, 0.0, age) * here : 0.0; // charred just before it goes
      vec3 you = mix(cam, vec3(0.17, 0.15, 0.13), burnt * 0.85);
      gl_FragColor = vec4(mix(bg, you, person * here), 1.0);
    }`;

  // Dust: a particle every 4 px of you. When the front passes it breaks off with a small kick of its own, and from then
  // on it is carried: by the wind (uWind, away from the hand that snapped), up on the warm air (fine ash) or down
  // (heavier flakes, a few), and round in the wind's swirls. The swirls are curl noise: the curl of a 3D noise field
  // (x, y and time), which turns and eddies but never piles up or thins out. The path is integrated from the moment it
  // broke off to now in 6 steps through that moving field, so each speck really drifts with the air; it greys to ash
  // and fades over its life (2.2–3.6 s).
  const DUST_VS = `
    attribute vec2 aUv;
    attribute float aRand;
    attribute vec3 aSeed;
    uniform sampler2D uVideo, uMask;
    uniform float uPointPx;
    uniform vec2 uPlane, uWind;
    varying vec3 vColor;
    varying float vAlpha;
    ${NOISE}
    ${NOISE3}
    ${ASH}
    ${MASK}
    // the swirl at p at time t: the curl of the noise (its gradient turned a quarter)
    vec2 swirl(vec2 p, float t) {
      const float e = 0.07;
      vec3 q = vec3(p * 1.2, t * 0.35);
      float dy = snoise3(q + vec3(0.0, e, 0.0)) - snoise3(q - vec3(0.0, e, 0.0));
      float dx = snoise3(q + vec3(e, 0.0, 0.0)) - snoise3(q - vec3(e, 0.0, 0.0));
      return vec2(dy, -dx) / (2.0 * e);
    }
    void main() {
      float age = ashAge(aUv);
      float span = 2.2 + aRand * 1.4;
      float life = age / span;
      if (uAshOn < 0.5 || life <= 0.0 || life >= 1.0 || personAt(aUv) < 0.5) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // not in the air: off screen, nothing to work out
        gl_PointSize = 0.0;
        vAlpha = 0.0;
        return;
      }
      bool flake = aSeed.z < 0.15;
      vec3 p = vec3((aUv - 0.5) * uPlane, 0.0);
      vec3 kick = (aSeed - 0.5) * vec3(0.7, 0.7, 1.0); // the shatter
      float dt = age / 6.0;
      for (int i = 0; i < 6; i++) {
        float t = (float(i) + 0.5) * dt; // seconds since it broke off
        // the wind takes it over a second; flakes fall faster and faster, fine ash rises on the warm air
        vec2 wind = uWind * (flake ? 0.35 : 1.0) * (0.7 + aRand * 0.6) * min(t / 1.2, 1.0) * 0.4;
        vec2 rise = flake ? vec2(0.0, -0.5 * t) : vec2(0.0, 0.12);
        vec2 turn = swirl(p.xy, uAshClock - age + t) * 0.22 * min(t * 1.5, 1.0) * (flake ? 0.3 : 1.0);
        p += (kick * exp(-3.0 * t) + vec3(wind + rise + turn, turn.x * 0.3)) * dt;
      }
      vec3 ash = flake ? vec3(0.2, 0.18, 0.16) : vec3(0.38, 0.34, 0.3);
      vColor = mix(texture2D(uVideo, aUv).rgb, ash, smoothstep(0.05, 0.45, life));
      vAlpha = (1.0 - smoothstep(0.55, 1.0, life)) * (0.7 + 0.3 * aRand);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = uPointPx * (flake ? 1.8 : 0.9 + aRand * 0.7) * (1.0 - 0.35 * life) * (2.4142 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`;
  const DUST_FS = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5 || vAlpha < 0.01) discard;
      gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.15, d));
    }`;

  // Voxels, a cube for every 10 px block of you.
  //   out:   from the snap outwards you break into cubes that spin off into the room around you (uVoxOut 0 → 1)
  //   build: the cubes come back, each from its own place in the space around and in front of you, each on its own
  //          walk (six hops, a pause between, tumbling and wobbling less as it nears), from your feet up. Each snaps
  //          into its block of your live silhouette with a pop and a flash of neon, then turns flat and takes the
  //          camera's colour of that block (uVoxIn 0 → 1).
  //   settle: the finished tiles fade into the live video (uVoxHide 1 → 0).
  // Drawn twice: the cubes (VOXEL_FS), and a bigger, added-on copy of them for the neon glow (HALO).
  const VOXEL_VS = `
    attribute vec2 aCell;
    attribute float aRand;
    attribute vec3 aSeed;
    uniform sampler2D uVideo, uMask;
    uniform float uVoxOut, uVoxIn, uVoxHide, uAspect, uTime;
    uniform vec2 uOrigin, uPlane, uGrid;
    uniform vec3 uGlow;
    varying vec3 vColor;
    varying vec2 vFace;
    varying float vShade, vEdge, vGlow, vAlpha;
    ${MASK}
    mat3 spin(vec3 axis, float a) {
      axis = normalize(axis);
      float s = sin(a), c = cos(a), o = 1.0 - c;
      return mat3(o * axis.x * axis.x + c, o * axis.x * axis.y + axis.z * s, o * axis.z * axis.x - axis.y * s,
                  o * axis.x * axis.y - axis.z * s, o * axis.y * axis.y + c, o * axis.y * axis.z + axis.x * s,
                  o * axis.z * axis.x + axis.y * s, o * axis.y * axis.z - axis.x * s, o * axis.z * axis.z + c);
    }
    void main() {
      vec3 cam = texture2D(uVideo, aCell).rgb;
      vec2 a = vec2(uAspect, 1.0);
      float s = uPlane.x / uGrid.x;
      vec3 home = vec3((aCell - 0.5) * uPlane, 0.0);
      // its place out in the room: outwards from you, and in front of or behind you
      vec3 dir = normalize(vec3((aCell - 0.5) * a + (aSeed.xy - 0.5) * 1.4, aSeed.z * 1.7 - 0.6));
      vec3 away = home + dir * (1.4 + aRand * 2.2);
      vec3 pos;
      float size, angle, depth, video, show;
      vGlow = 0.0;
      vEdge = 1.0;
      if (uVoxIn > 0.0) {
        float start = (aCell.y * 0.65 + aRand * 0.35) * 0.55; // feet first
        float t = clamp((uVoxIn - start) / 0.4, 0.0, 1.0);
        float k = t * 6.0;
        float hop = (floor(k) + smoothstep(0.1, 0.75, fract(k))) / 6.0; // a hop, then a pause
        float e = 1.0 - (1.0 - hop) * (1.0 - hop); // slowing as it nears its place
        pos = mix(away, home, e);
        pos.y += sin(hop * 3.14159) * 0.4 * (aSeed.x - 0.35); // an arc
        pos.xy += vec2(sin(uTime * 3.1 + aRand * 40.0), cos(uTime * 2.7 + aSeed.y * 40.0)) * 0.06 * (1.0 - e);
        float locked = step(1.0, t);
        float since = clamp((uVoxIn - start - 0.4) / 0.08, 0.0, 1.0); // since it locked in (~0.25 s)
        size = mix(0.35, 0.9, smoothstep(0.0, 0.4, t)) + locked * (0.1 * since + 0.3 * sin(since * 3.14159));
        angle = (1.0 - e) * (3.0 + aRand * 7.0);
        depth = mix(1.0, 0.06, since);
        video = since;
        vGlow = t > 0.0 ? mix(0.35, 1.0, locked) * (1.0 - since * 0.85) : 0.0;
        vEdge = 1.0 - since * 0.9;
        show = smoothstep(start - 0.05, start, uVoxIn);
      } else {
        float wave = uVoxOut * 1.7 - (distance(aCell * a, uOrigin * a) * 0.5 + aRand * 0.2);
        float fly = smoothstep(0.0, 0.9, wave);
        pos = mix(home, away, fly * fly);
        size = 1.0 - fly;
        angle = fly * (2.0 + aRand * 6.0);
        depth = mix(0.06, 1.0, smoothstep(0.0, 0.25, wave));
        video = 1.0 - smoothstep(0.0, 0.4, wave);
        vGlow = smoothstep(0.0, 0.2, wave) * (1.0 - fly);
        show = 1.0;
      }
      #ifdef HALO
        size *= 1.8;
      #endif
      mat3 r = spin(vec3(aSeed.x - 0.5, 0.7, aSeed.y), angle);
      vec3 p = r * (position * vec3(s, s, s * depth) * size * show * step(0.5, personAt(aCell)));
      vShade = 0.55 + 0.45 * max(dot(r * normal, normalize(vec3(0.4, 0.6, 1.0))), 0.0);
      vColor = mix(uGlow * 0.18, cam, video); // a dark digital core in flight, your colour once in place
      vAlpha = uVoxHide;
      vFace = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + vec3(0.0, 0.0, s * depth * size * 0.5 + 0.001) + p, 1.0);
    }`;
  const VOXEL_FS = `
    uniform vec3 uGlow;
    varying vec3 vColor;
    varying vec2 vFace;
    varying float vShade, vEdge, vGlow, vAlpha;
    void main() {
      float d = max(abs(vFace.x - 0.5), abs(vFace.y - 0.5)) * 2.0; // 0 at a face's middle, 1 at its edge
      #ifdef HALO
        gl_FragColor = vec4(uGlow * vGlow * pow(1.0 - d, 2.0) * 0.55 * vAlpha, 1.0); // added onto what is behind
      #else
        float edge = smoothstep(0.78, 0.97, d);
        gl_FragColor = vec4(vColor * vShade + uGlow * (edge * vEdge + vGlow * 0.45), vAlpha);
      #endif
    }`;

  function createFx(T, video, canvas) {
    const W = Math.min(1280, video.videoWidth || 1280);
    const H = Math.round(W * (video.videoHeight || 720) / (video.videoWidth || 1280));
    const aspect = W / H;
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const camera = new T.PerspectiveCamera(45, aspect, 0.1, 50);
    camera.position.z = 1 / Math.tan(T.MathUtils.degToRad(22.5)); // the picture (2 high) fills the view exactly
    const scene = new T.Scene();

    // textures stay in the camera's own colours (no colour-space conversion), and so do the shaders' outputs
    const videoTex = new T.VideoTexture(video);
    const maskTex = (w, h, fill) => {
      const t = new T.DataTexture(new Uint8Array(w * h).fill(fill), w, h, T.RedFormat, T.UnsignedByteType);
      t.minFilter = t.magFilter = T.LinearFilter;
      t.unpackAlignment = 1;
      t.needsUpdate = true;
      return t;
    };
    const U = {
      uVideo: { value: videoTex },
      uMask: { value: maskTex(1, 1, 255) }, // until the first mask: all of the picture is "you"
      uPlate: { value: null },
      uFill: { value: null },
      uSeen: { value: null },
      uSoft: { value: null },
      uWide: { value: null },
      uClean: { value: null },
      uBg: { value: 1 },
      uAshOn: { value: 0 },
      uAshClock: { value: 0 },
      uVoxOut: { value: 0 },
      uVoxIn: { value: 0 },
      uVoxHide: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: aspect },
      uOrigin: { value: new T.Vector2(0.5, 0.5) },
      uWind: { value: new T.Vector2(0.8, 0.35) },
      uPlane: { value: new T.Vector2(2 * aspect, 2) },
      uTexel: { value: new T.Vector2(1 / W, 1 / H) },
      uGlow: { value: new T.Color(0.2, 0.85, 1.0) },
    };
    const owned = [videoTex];
    const add = (obj) => { owned.push(obj.geometry, obj.material); scene.add(obj); return obj; };

    // the picture
    add(new T.Mesh(new T.PlaneGeometry(2 * aspect, 2), new T.ShaderMaterial({ uniforms: U, vertexShader: PLANE_VS, fragmentShader: MAIN_FS })));

    // the room without you, kept in two render targets used in turn
    const PW = 640;
    const PH = Math.round(PW / aspect);
    const plates = [0, 1].map(() => new T.WebGLRenderTarget(PW, PH, { depthBuffer: false }));
    let plateAt = 0;
    U.uPlate.value = plates[0].texture;
    const calms = [0, 1].map(() => new T.WebGLRenderTarget(PW, PH, { depthBuffer: false }));
    let calmAt = 0;
    const calmMat = new T.ShaderMaterial({ uniforms: { uVideo: U.uVideo, uSoft: U.uSoft, uWide: U.uWide, uOldCalm: { value: null } }, vertexShader: QUAD_VS, fragmentShader: CALM_FS, depthTest: false });
    const plateMat = new T.ShaderMaterial({ uniforms: { uVideo: U.uVideo, uSoft: U.uSoft, uWide: U.uWide, uOld: { value: null }, uCalm: { value: null } }, vertexShader: QUAD_VS, fragmentShader: PLATE_FS, depthTest: false });
    owned.push(calmMat, ...calms);
    const plateScene = new T.Scene();
    const plateQuad = new T.Mesh(new T.PlaneGeometry(2, 2), plateMat);
    plateScene.add(plateQuad);
    owned.push(plateQuad.geometry, plateMat, ...plates);
    const pass = (material, target) => {
      plateQuad.material = material;
      renderer.setRenderTarget(target);
      renderer.render(plateScene, camera);
    };

    // the feathered masks (BLUR_FS): soft, σ ≈ 0.7 % of the height (5 px at 720p); wide, σ ≈ 3 % (the margin)
    const target = (w, h) => new T.WebGLRenderTarget(w, h, { depthBuffer: false });
    const soft = [target(256, 256), target(256, 256)];
    const wide = [target(128, 128), target(128, 128)];
    const blurMat = new T.ShaderMaterial({ uniforms: { uSrc: { value: null }, uStep: { value: new T.Vector2() }, uFlip: { value: false } }, vertexShader: QUAD_VS, fragmentShader: BLUR_FS, depthTest: false });
    owned.push(blurMat, ...soft, ...wide);
    U.uSoft.value = soft[1].texture;
    U.uWide.value = wide[1].texture;
    function blur(src, flip, sx, sy, out) {
      blurMat.uniforms.uSrc.value = src;
      blurMat.uniforms.uFlip.value = flip;
      blurMat.uniforms.uStep.value.set(sx / aspect, 0);
      pass(blurMat, out[0]);
      blurMat.uniforms.uSrc.value = out[0].texture;
      blurMat.uniforms.uFlip.value = false;
      blurMat.uniforms.uStep.value.set(0, sy);
      pass(blurMat, out[1]);
    }
    function blurMask() {
      blur(U.uMask.value, true, 0.0035, 0.0035, soft);
      blur(soft[1].texture, false, 0.015, 0.015, wide);
    }
    blurMask(); // from the first mask, "all of the picture is you", until there is a real one

    // the clean room at half size (CLEAN_FS), for the blurred background
    const cleanTarget = target(PW, PH);
    const cleanMat = new T.ShaderMaterial({ uniforms: U, vertexShader: QUAD_VS, fragmentShader: CLEAN_FS, depthTest: false });
    owned.push(cleanTarget, cleanMat);
    U.uClean.value = cleanTarget.texture;

    // the filled-in room (DOWN_FS / UP_FS): every level half the size of the one before, down to 1 × 1
    const sizes = [];
    for (let w = PW, h = PH; w > 1 || h > 1;) {
      w = Math.ceil(w / 2);
      h = Math.ceil(h / 2);
      sizes.push([w, h]);
    }
    const downs = sizes.map(([w, h]) => new T.WebGLRenderTarget(w, h, { depthBuffer: false }));
    const ups = sizes.slice(0, -1).map(([w, h]) => new T.WebGLRenderTarget(w, h, { depthBuffer: false }));
    const downMat = new T.ShaderMaterial({ uniforms: { uSrc: { value: null }, uTexel: { value: new T.Vector2() }, uPlate: { value: true } }, vertexShader: QUAD_VS, fragmentShader: DOWN_FS, depthTest: false });
    const upMat = new T.ShaderMaterial({ uniforms: { uFine: { value: null }, uCoarse: { value: null }, uCoarseTexel: { value: new T.Vector2() }, uLast: { value: false } }, vertexShader: QUAD_VS, fragmentShader: UP_FS, depthTest: false });
    const rowTarget = target(...sizes[0]);
    const rowSoft = target(...sizes[0]);
    const rowMat = new T.ShaderMaterial({ uniforms: { uSrc: { value: downs[0].texture }, uPush: { value: (ups[0] || downs[0]).texture }, uTexel: { value: new T.Vector2(1 / sizes[0][0], 1 / sizes[0][1]) } }, vertexShader: QUAD_VS, fragmentShader: ROW_FS, depthTest: false });
    owned.push(downMat, upMat, rowMat, rowTarget, rowSoft, ...downs, ...ups);
    function fill(plate) {
      let from = plate;
      let [fw, fh] = [PW, PH];
      downs.forEach((target, i) => {
        downMat.uniforms.uSrc.value = from.texture;
        downMat.uniforms.uTexel.value.set(1 / fw, 1 / fh);
        downMat.uniforms.uPlate.value = i === 0;
        pass(downMat, target);
        from = target;
        [fw, fh] = sizes[i];
      });
      for (let i = ups.length - 1; i >= 0; i--) {
        const last = i === ups.length - 1;
        upMat.uniforms.uFine.value = downs[i].texture;
        upMat.uniforms.uCoarse.value = last ? downs[i + 1].texture : ups[i + 1].texture;
        upMat.uniforms.uCoarseTexel.value.set(1 / sizes[i + 1][0], 1 / sizes[i + 1][1]);
        upMat.uniforms.uLast.value = last;
        pass(upMat, ups[i]);
      }
      pass(rowMat, rowTarget);
      blurMat.uniforms.uSrc.value = rowTarget.texture; // a little, down only (σ ≈ 3 rows)
      blurMat.uniforms.uFlip.value = false;
      blurMat.uniforms.uStep.value.set(0, 1.5 / sizes[0][1]);
      pass(blurMat, rowSoft);
      U.uFill.value = rowSoft.texture;
    }
    U.uSeen.value = downs[Math.min(2, downs.length - 1)].texture; // 8 × 8 plate pixels a texel
    fill(plates[0]);
    renderer.setRenderTarget(null);

    // the share of the room behind you already seen (COVER_FS on a small grid, read back now and then)
    const cover = new T.WebGLRenderTarget(64, 36, { depthBuffer: false });
    const coverMat = new T.ShaderMaterial({ uniforms: { uMask: U.uMask, uPlate: { value: null } }, vertexShader: QUAD_VS, fragmentShader: COVER_FS, depthTest: false });
    const coverPx = new Uint8Array(64 * 36 * 4);
    owned.push(cover, coverMat);
    let masks = 0;
    let roomSeen = null;
    let frameSeen = 0;

    // dust: a particle every 4 px
    const GW = Math.round(W / 4);
    const GH = Math.round(H / 4);
    const dustGeo = new T.BufferGeometry();
    const uvs = new Float32Array(GW * GH * 2);
    const rands = new Float32Array(GW * GH);
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const k = y * GW + x;
        uvs[k * 2] = (x + 0.5) / GW;
        uvs[k * 2 + 1] = (y + 0.5) / GH;
        rands[k] = Math.random();
      }
    }
    const seeds = (n) => Float32Array.from({ length: n * 3 }, Math.random);
    dustGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(GW * GH * 3), 3));
    dustGeo.setAttribute('aUv', new T.BufferAttribute(uvs, 2));
    dustGeo.setAttribute('aRand', new T.BufferAttribute(rands, 1));
    dustGeo.setAttribute('aSeed', new T.BufferAttribute(seeds(GW * GH), 3));
    U.uPointPx = { value: (W / GW) * 1.4 };
    const dust = add(new T.Points(dustGeo, new T.ShaderMaterial({ uniforms: U, vertexShader: DUST_VS, fragmentShader: DUST_FS, transparent: true, depthWrite: false })));
    dust.frustumCulled = false;
    dust.visible = false;

    // voxels: 128 cubes across, and their glow
    const VX = 128;
    const VY = Math.round(VX / aspect);
    U.uGrid = { value: new T.Vector2(VX, VY) };
    const boxGeo = new T.BoxGeometry(1, 1, 1);
    const cells = new Float32Array(VX * VY * 2);
    const vr = new Float32Array(VX * VY);
    for (let y = 0; y < VY; y++) {
      for (let x = 0; x < VX; x++) {
        const k = y * VX + x;
        cells[k * 2] = (x + 0.5) / VX;
        cells[k * 2 + 1] = (y + 0.5) / VY;
        vr[k] = Math.random();
      }
    }
    boxGeo.setAttribute('aCell', new T.InstancedBufferAttribute(cells, 2));
    boxGeo.setAttribute('aRand', new T.InstancedBufferAttribute(vr, 1));
    boxGeo.setAttribute('aSeed', new T.InstancedBufferAttribute(seeds(VX * VY), 3));
    const voxels = add(new T.InstancedMesh(boxGeo, new T.ShaderMaterial({ uniforms: U, vertexShader: VOXEL_VS, fragmentShader: VOXEL_FS, transparent: true }), VX * VY));
    const halo = new T.InstancedMesh(boxGeo, new T.ShaderMaterial({
      uniforms: U, vertexShader: VOXEL_VS, fragmentShader: VOXEL_FS, defines: { HALO: '' }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    }), VX * VY);
    owned.push(halo.material);
    scene.add(halo);
    halo.renderOrder = 1;
    [voxels, halo].forEach((m) => { m.frustumCulled = false; m.visible = false; });

    // the effect playing: { kind, start }
    let effect = null;
    function step(now) {
      U.uAshOn.value = 0;
      U.uVoxOut.value = 0;
      U.uVoxIn.value = 0;
      U.uVoxHide.value = 0;
      dust.visible = false;
      voxels.visible = false;
      halo.visible = false;
      if (!effect) return;
      const t = now - effect.start;
      if (effect.kind === 'ash') {
        const { away, back } = TIMING.ash;
        if (t >= away + back) { effect = null; return; }
        U.uAshOn.value = 1;
        U.uAshClock.value = (t < away ? t : away * (1 - (t - away) / back)) / 1000;
        dust.visible = true;
        return;
      }
      const { out, gone, build, settle } = TIMING.voxel;
      if (t >= out + gone + build + settle) { effect = null; return; }
      U.uVoxOut.value = Math.min(t / out, 1);
      U.uVoxIn.value = Math.min(Math.max((t - out - gone) / build, 0), 1);
      U.uVoxHide.value = t < out + gone + build ? 1 : Math.max(1 - (t - out - gone - build) / settle, 0.0001);
      voxels.visible = true;
      halo.visible = true;
    }

    const born = performance.now();
    renderer.setAnimationLoop(() => {
      const now = performance.now();
      U.uTime.value = (now - born) / 1000;
      step(now);
      if (U.uBg.value === 1) { pass(cleanMat, cleanTarget); renderer.setRenderTarget(null); }
      renderer.render(scene, camera);
    });

    const track = canvas.captureStream(FPS).getVideoTracks()[0];
    track.contentHint = 'motion';

    return {
      track,
      trigger(kind, x, y) {
        if (effect) return;
        effect = { kind, start: performance.now() };
        U.uOrigin.value.set(x, y);
        U.uWind.value.set(x < 0.5 ? 0.8 : -0.8, 0.35); // blowing away from the hand's side, and up
      },
      background(mode) { U.uBg.value = Object.keys(BG).indexOf(mode); },
      /** 0–1: how much of the room behind you was seen (null: you are not in view) */
      roomSeen: () => roomSeen,
      /** 0–1: how much of the whole picture's room was seen */
      frameSeen: () => frameSeen,
      // a person mask (0–1, rows top down) → the mask texture, then the room-without-you is brought up to date
      mask(f32, w, h) {
        let tex = U.uMask.value;
        if (tex.image.width !== w || tex.image.height !== h) {
          tex.dispose();
          tex = maskTex(w, h, 0);
          U.uMask.value = tex;
        }
        const d = tex.image.data;
        for (let i = 0; i < d.length; i++) d[i] = f32[i] * 255;
        tex.needsUpdate = true;
        blurMask();
        plateMat.uniforms.uOld.value = plates[plateAt].texture;
        plateAt ^= 1;
        calmMat.uniforms.uOldCalm.value = calms[calmAt].texture;
        calmAt ^= 1;
        pass(calmMat, calms[calmAt]);
        plateMat.uniforms.uCalm.value = calms[calmAt].texture;
        pass(plateMat, plates[plateAt]);
        fill(plates[plateAt]);
        if (masks++ % 8 === 0) {
          coverMat.uniforms.uPlate.value = plates[plateAt].texture;
          pass(coverMat, cover);
          renderer.readRenderTargetPixels(cover, 0, 0, 64, 36, coverPx);
          let seenSum = 0;
          let you = 0;
          let all = 0;
          for (let i = 0; i < coverPx.length; i += 4) { seenSum += coverPx[i]; you += coverPx[i + 1]; all += coverPx[i + 2]; }
          roomSeen = you ? seenSum / you : null;
          frameSeen = all / (255 * 64 * 36);
        }
        renderer.setRenderTarget(null);
        U.uPlate.value = plates[plateAt].texture;
      },
      dispose() {
        renderer.setAnimationLoop(null);
        track.stop();
        U.uMask.value.dispose();
        owned.forEach((x) => x.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      },
    };
  }

  // ---------------------------------------------------------------- the call (perfect negotiation, MDN)

  // what goes out: the effects canvas, or the plain camera (effects off, not loaded, or this tab in the background,
  // where the canvas stops drawing)
  const outTrack = () => (st.fx && st.fxOn && document.visibilityState === 'visible' ? st.fx.track : st.media.video);
  function syncTrack() {
    const p = st.peer;
    if (p && p.sender && st.media && p.sender.track !== outTrack()) p.sender.replaceTrack(outTrack()).catch((err) => console.error('Call:', err));
  }
  document.addEventListener('visibilitychange', syncTrack);

  const send = (m) => opts.send(m);

  async function join(value) {
    const room = String(value || '').trim().toLowerCase();
    if (!ROOM.test(room)) { opts.alert('A room name is 3 to 40 letters, numbers and dashes, starting with a letter or number.', 'Room'); return; }
    try {
      await startMedia();
      if (!st.iceServers) st.iceServers = await opts.ice();
    } catch (err) { mediaError(err); return; }
    st.room = room;
    st.draft = '';
    st.status = 'waiting';
    send({ type: 'call-join', room });
    changed();
  }

  function makePeer(polite) {
    dropPeer();
    const pc = new RTCPeerConnection({ iceServers: st.iceServers || [] });
    const peer = { pc, polite, makingOffer: false, ignoreOffer: false, sender: null };
    st.peer = peer;
    const out = new MediaStream([st.media.audio, outTrack()].filter(Boolean));
    if (st.media.audio) pc.addTrack(st.media.audio, out);
    peer.sender = pc.addTrack(outTrack(), out);

    pc.ontrack = ({ track, streams }) => {
      const v = $q('[data-call-remote]');
      if (streams[0]) { if (v.srcObject !== streams[0]) v.srcObject = streams[0]; }
      else { if (!v.srcObject) v.srcObject = new MediaStream(); v.srcObject.addTrack(track); }
      v.play().catch(() => {});
    };
    pc.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true;
        await pc.setLocalDescription();
        send({ type: 'call-signal', description: pc.localDescription });
      } catch (err) { console.error('Call:', err); } finally { peer.makingOffer = false; }
    };
    pc.onicecandidate = ({ candidate }) => send({ type: 'call-signal', candidate });
    pc.onconnectionstatechange = () => {
      if (st.peer !== peer) return;
      const s = pc.connectionState;
      if (s === 'failed') pc.restartIce();
      st.status = s === 'connected' ? 'connected' : s === 'failed' ? 'failed' : 'connecting';
      changed();
    };
    st.status = 'connecting';
  }

  function dropPeer() {
    if (st.peer) st.peer.pc.close();
    st.peer = null;
    const v = $q('[data-call-remote]');
    if (v) v.srcObject = null;
  }

  async function onSignal({ description, candidate }) {
    const peer = st.peer;
    if (!peer) return;
    const { pc } = peer;
    try {
      if (description) {
        const collision = description.type === 'offer' && (peer.makingOffer || pc.signalingState !== 'stable');
        peer.ignoreOffer = !peer.polite && collision;
        if (peer.ignoreOffer) return;
        await pc.setRemoteDescription(description);
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          send({ type: 'call-signal', description: pc.localDescription });
        }
      } else if (candidate !== undefined) {
        try { await pc.addIceCandidate(candidate); } catch (err) { if (!peer.ignoreOffer) throw err; }
      }
    } catch (err) { console.error('Call:', err); }
  }

  /** a "call-…" message from the server */
  function signal(m) {
    if (m.type === 'call-signal') { onSignal(m); return; }
    if (!st.room || !st.media) return;
    if (m.type === 'call-joined') {
      st.peerInfo = m.peer;
      if (m.peer) makePeer(true); else st.status = 'waiting';
    } else if (m.type === 'call-peer') {
      st.peerInfo = m.peer;
      makePeer(false);
      opts.toast(`${m.peer.name} joined the call`);
    } else if (m.type === 'call-left') {
      if (st.peerInfo) opts.toast(`${st.peerInfo.name} left the call`);
      dropPeer();
      st.peerInfo = null;
      st.status = 'waiting';
    } else if (m.type === 'call-full') {
      opts.alert(`Room ${m.room} already has two people in it. Pick another room name.`, 'Room full');
      st.room = null;
      st.status = '';
    }
    changed();
  }

  // the socket came back (after a drop or a server restart): join again; the other side starts over with us
  function reconnected() {
    if (!st.room) return;
    dropPeer();
    st.status = 'waiting';
    send({ type: 'call-join', room: st.room });
    changed();
  }

  function leave() {
    if (st.room) send({ type: 'call-leave' });
    dropPeer();
    stopMedia();
    st.room = null;
    st.peerInfo = null;
    st.status = '';
    changed();
  }

  return {
    setup(o) { opts = { ...opts, ...o }; },
    open,
    signal,
    reconnected,
    leave,
    room: () => st.room,
    active: () => Boolean(st.room),
  };
})();
