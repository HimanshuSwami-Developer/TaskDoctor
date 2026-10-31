/* FlowTrace — finger snap ("chutki") from MediaPipe hand landmarks. © 2026 FinDevelopers
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
 * Node: require('./public/gesture') → { snapDetector, measure } for the tests; browser: window.flowGesture.
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

  return { snapDetector, measure, DEFAULTS };
}));
