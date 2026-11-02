/* FlowTrace — finger snap ("chutki") and both hands raised, from MediaPipe hand landmarks. © 2026 FinDevelopers
 *
 * A snap, as the camera sees it: thumb tip (4) and middle fingertip (12) pressed together, then the middle finger
 * slips off and slaps down into the palm. So per hand, every frame:
 *   gap  = |thumb tip 4 − middle tip 12|   about 0.2–0.4 pressed, 0.6+ after the snap
 *   curl = |middle tip 12 − wrist 0|       falls as the finger drops into the palm (rises when a pinch just opens)
 * both in hand sizes (wrist 0 → middle knuckle 9), so near or far from the camera does not matter. The landmarks
 * are MediaPipe's world landmarks (real 3D, so a hand turned sideways still measures right) when there are any.
 *
 * Snap = pressed (held for `hold` frames: the build-up), then within `within` ms apart, opening at `speed` hand
 * sizes a second or more, with the finger at least `drop` lower than when pressed. The speed is measured from the
 * last pressed frame, not frame to frame: MediaPipe smooths a video's landmarks, so a 15 ms snap shows over 2–4
 * frames. Not a snap: fingers brushing past each other (not held), a pinch that opens (the finger straightens:
 * curl rises), or opens slowly.
 * When a try is not a snap, `missed` says what it reached (gap, speed, drop), to see which limit stopped it.
 *
 * Both hands raised ("absolute cinema"): on the picture's landmarks (0–1, y down), measured with the picture's
 * aspect (a 16:9 picture is wider than tall: x is stretched back, so a tilted hand measures right).
 * A hand is raised when it is
 *   upright  middle knuckle (9) above the wrist by `upright` hand sizes or more (straight up: 1; sideways: 0)
 *   open     3 of the 4 fingertips (8 12 16 20) farther from the wrist than their middle joints (6 10 14 18):
 *            a fist, or a hand on the chin, is not raised
 *   not low  wrist (0) above the bottom of the picture (`top` of its height): only a loose bound, as where a raised
 *            hand shows depends on the framing (a camera close by, the face out of view: the wrist at 70 %)
 * The hand's own pose is what says "raised": both open palms up, apart, held.
 * Both = two raised hands at least `apart` of the picture's width from each other: left and right are told apart by
 * where they are, not by MediaPipe's handedness, which can name both hands the same. No pose model is needed: it
 * would add a third model per frame for what the hands' place in the picture already shows.
 * It fires once both have been up `hold` ms, then not again until a hand comes down (frames without both up for
 * `lost` ms: a frame or two of bad tracking, or a pause with no frames at all, is not coming down) and at most once
 * per `rest` ms.
 *
 * Node: require('./public/gesture') → { snapDetector, measure, raiseDetector, handRaised } for the tests; browser:
 * window.flowGesture.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.flowGesture = api;
}(typeof self !== 'undefined' ? self : this, () => {
  const DEFAULTS = {
    pressed: 0.42, // gap at or below: thumb and middle finger together
    apart: 0.6, // gap at or above: apart again
    drop: 0.12, // the middle tip at least this much nearer the wrist than when pressed
    hold: 2, // frames pressed before it counts as pressed
    speed: 2, // hand sizes a second, from the last pressed frame to apart
    within: 400, // ms from the last pressed frame to apart
    lost: 300, // ms without the hand: start over
    rest: 900, // ms after a snap before the next
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

  /** { gap, curl } of one hand's 21 points (world landmarks, or image landmarks already in pixels), or null */
  function measure(p) {
    if (!p || p.length < 21) return null;
    const size = dist(p[0], p[9]);
    if (!(size > 0)) return null;
    return { gap: dist(p[4], p[12]) / size, curl: dist(p[12], p[0]) / size };
  }

  /**
   * One detector per hand: update(points, ms) → { gap, curl, state, snap, missed }
   * state: 'touching' (pressed, not held long enough yet) | 'pressed' | 'released' (pressed a moment ago, waiting
   * for the snap) | 'open'. missed (once, when a try runs out): { gap, speed, drop }, the most each reached.
   */
  function snapDetector(options) {
    const o = { ...DEFAULTS, ...options };
    let frames = 0; // pressed frames in a row
    let pressed = null; // the last pressed frame of a held press: { t, gap, curl }
    let best = null; // what the try since then reached
    let seen = -Infinity;
    let fired = -Infinity;
    return function update(points, t) {
      const m = measure(points);
      if (!m) return null;
      if (t - seen > o.lost) { frames = 0; pressed = null; best = null; }
      seen = t;
      const out = { gap: m.gap, curl: m.curl, state: 'open', snap: false, missed: null };
      if (m.gap <= o.pressed) {
        frames += 1;
        out.state = frames >= o.hold ? 'pressed' : 'touching';
        if (frames >= o.hold) pressed = { t, gap: m.gap, curl: m.curl };
        best = null;
        return out;
      }
      frames = 0;
      if (!pressed) return out;
      if (t - pressed.t > o.within) {
        out.missed = best;
        pressed = null;
        best = null;
        return out;
      }
      out.state = 'released';
      const speed = (m.gap - pressed.gap) / ((t - pressed.t) / 1000);
      const drop = pressed.curl - m.curl;
      best = best ? { gap: Math.max(best.gap, m.gap), speed: Math.max(best.speed, speed), drop: Math.max(best.drop, drop) } : { gap: m.gap, speed, drop };
      if (m.gap >= o.apart && speed >= o.speed && drop >= o.drop && t - fired >= o.rest) {
        fired = t;
        pressed = null;
        best = null;
        out.snap = true;
      }
      return out;
    };
  }

  const RAISE = {
    top: 0.85, // the wrist above this much of the picture's height, from the top
    upright: 0.6, // knuckle above the wrist, in hand sizes
    open: 3, // fingers out (of 4)
    apart: 0.2, // the two wrists at least this far apart, in picture widths
    hold: 300, // ms both up before it counts
    lost: 300, // ms of frames without both up: a hand came down
    rest: 3000, // ms after one before the next
  };

  /** one hand's 21 picture landmarks (0–1, y down), picture width / height → { wrist, upright, open }, or null */
  function raiseParts(p, aspect = 1) {
    if (!p || p.length < 21) return null;
    const flat = (a, b) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
    const size = flat(p[0], p[9]);
    if (!(size > 0)) return null;
    return {
      wrist: p[0].y,
      upright: (p[0].y - p[9].y) / size,
      open: [[8, 6], [12, 10], [16, 14], [20, 18]].filter(([tip, joint]) => flat(p[tip], p[0]) > flat(p[joint], p[0])).length,
    };
  }
  /** raised? (raiseParts against the limits) */
  function handRaised(p, options, aspect) {
    const o = { ...RAISE, ...options };
    const r = raiseParts(p, aspect);
    return Boolean(r) && r.wrist <= o.top && r.upright >= o.upright && r.open >= o.open;
  }

  /**
   * update(hands, ms, aspect) → { up, state, fire, parts }, every frame, with every hand in view (an array of 21
   * picture landmarks each; [] when none) and the picture's width / height. up: how many hands are raised (0–2);
   * state: 'down' | 'rising' (both up, not `hold` yet) | 'up' (fired, waiting for a hand to come down); fire: true
   * once per raise; parts: each hand's raiseParts, to show what stops it.
   */
  function raiseDetector(options) {
    const o = { ...RAISE, ...options };
    let since = null; // both up since
    let down = null; // since when the frames have not shown both up (while since is set)
    let fired = false; // this raise has fired
    let at = -Infinity; // when the last one fired
    return function update(hands, t, aspect = 1) {
      const parts = (hands || []).map((p) => raiseParts(p, aspect));
      const wrists = (hands || []).filter((p, i) => parts[i] && parts[i].wrist <= o.top && parts[i].upright >= o.upright && parts[i].open >= o.open)
        .map((p) => p[0].x).sort((a, b) => a - b);
      const both = wrists.length >= 2 && wrists[wrists.length - 1] - wrists[0] >= o.apart;
      if (both) {
        if (since === null) { since = t; fired = false; }
        down = null;
      } else if (since !== null) {
        if (down === null) down = t;
        if (t - down >= o.lost) { since = null; down = null; }
      }
      let fire = false;
      if (both && !fired && t - since >= o.hold && t - at >= o.rest) { fired = true; at = t; fire = true; }
      return { up: Math.min(wrists.length, 2), state: since === null ? 'down' : fired ? 'up' : 'rising', fire, parts };
    };
  }

  return { snapDetector, measure, DEFAULTS, raiseDetector, handRaised, raiseParts, RAISE };
}));
