'use strict';
// The gestures (public/gesture.js) on made-up hands: what must count as a snap, or as both hands raised, and what must
// not. No camera.
const test = require('node:test');
const assert = require('node:assert/strict');
const { snapDetector, measure, raiseDetector, handRaised } = require('../public/gesture');

// a hand with the given gap and curl (in hand sizes), at a real hand's size in metres (wrist → knuckle 9 cm)
function hand(gap, curl, size = 0.09) {
  const p = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  p[9] = { x: 0, y: size, z: 0 };
  p[12] = { x: 0, y: curl * size, z: 0 };
  p[4] = { x: gap * size, y: curl * size, z: 0 };
  return p;
}
// frames [gap, curl] every `ms` → the frames where it snapped
function run(frames, ms = 33, d = snapDetector()) {
  return frames.map(([gap, curl], i) => (d(hand(gap, curl), i * ms) || {}).snap).flatMap((s, i) => (s ? [i] : []));
}
const PRESSED = [[0.25, 1.4], [0.24, 1.4], [0.26, 1.39], [0.25, 1.4]];

test('measure: gap and curl in hand sizes, whatever the size of the hand', () => {
  const m = measure(hand(0.3, 1.5, 0.2));
  assert.ok(Math.abs(m.gap - 0.3) < 1e-9 && Math.abs(m.curl - 1.5) < 1e-9);
  assert.equal(measure([]), null);
});

test('a snap smoothed over a few frames (as MediaPipe shows it) counts once', () => {
  assert.deepEqual(run([...PRESSED, [0.45, 1.3], [0.7, 1.1], [0.85, 0.95], [0.9, 0.9], [0.9, 0.9]]), [5]);
});

test('a snap at 10 frames a second counts too', () => {
  assert.deepEqual(run([[0.25, 1.4], [0.25, 1.4], [0.75, 1.0], [0.8, 0.95]], 100), [2]);
});

test('a pinch that opens is not a snap: the finger straightens instead of dropping into the palm', () => {
  assert.deepEqual(run([...PRESSED, [0.5, 1.5], [0.8, 1.7], [1.0, 1.8]]), []);
});

test('opening slowly is not a snap', () => {
  assert.deepEqual(run([...PRESSED, [0.45, 1.35], [0.5, 1.3], [0.55, 1.25], [0.58, 1.2], [0.65, 1.1], [0.7, 1.0]], 100), []);
});

test('an open hand, or a hand that was never pressed, never snaps', () => {
  assert.deepEqual(run([[0.9, 1.8], [1.0, 1.0], [0.8, 0.9], [1.1, 1.9], [0.7, 0.8]]), []);
});

test('the hand out of view between pressing and opening starts over', () => {
  const d = snapDetector();
  d(hand(0.25, 1.4), 0);
  d(hand(0.25, 1.4), 33);
  assert.equal(d(hand(0.8, 0.95), 450).snap, false);
});

test('one snap per 0.9 s; the next one after that counts', () => {
  const d = snapDetector();
  const snaps = [];
  const at = (t, gap, curl) => { if (d(hand(gap, curl), t).snap) snaps.push(t); };
  at(0, 0.25, 1.4); at(33, 0.25, 1.4); at(66, 0.8, 0.95); // snap
  at(300, 0.25, 1.4); at(333, 0.25, 1.4); at(366, 0.8, 0.95); // too soon
  at(1000, 0.25, 1.4); at(1033, 0.25, 1.4); at(1066, 0.8, 0.95); // snap
  assert.deepEqual(snaps, [66, 1066]);
});

test('the state says what it saw: pressed, then released while waiting', () => {
  const d = snapDetector();
  assert.equal(d(hand(0.25, 1.4), 0).state, 'touching');
  assert.equal(d(hand(0.25, 1.4), 33).state, 'pressed');
  assert.equal(d(hand(0.5, 1.4), 66).state, 'released');
  assert.equal(d(hand(0.5, 1.4), 600).state, 'open');
});

test('fingers that only brush past each other (one frame) are not a snap', () => {
  assert.deepEqual(run([[0.9, 1.6], [0.3, 1.4], [0.8, 0.95], [0.9, 0.9]]), []);
});

test('a pinch let go at a medium pace is not a snap, even with the finger dropping', () => {
  assert.deepEqual(run([[0.3, 1.4], [0.3, 1.4], [0.4, 1.35], [0.48, 1.3], [0.55, 1.25], [0.62, 1.2], [0.66, 1.15]], 60), []);
});

test('a try that is not a snap says how far it got', () => {
  const d = snapDetector();
  d(hand(0.3, 1.4), 0);
  d(hand(0.3, 1.4), 33);
  d(hand(0.5, 1.38), 66); // apart a little, finger hardly dropped
  d(hand(0.52, 1.38), 300);
  const r = d(hand(0.52, 1.38), 450); // the try ran out (0.4 s after pressed): this frame is past it
  assert.equal(r.state, 'open');
  assert.ok(Math.abs(r.missed.gap - 0.52) < 1e-9 && Math.abs(r.missed.drop - 0.02) < 1e-9 && r.missed.speed > 5);
});

// ---------------------------------------------------------------- both hands raised

// one hand in the picture (0–1, y down), wrist at x, y, fingers up; `fist`: fingertips folded back in; `tilt`: how far
// over the hand leans (0 up, 1 sideways)
function shown(x, y, { fist = false, tilt = 0, size = 0.1 } = {}) {
  const p = Array.from({ length: 21 }, () => ({ x, y, z: 0 }));
  const at = (n) => ({ x: x + Math.sin(tilt * Math.PI / 2) * n * size, y: y - Math.cos(tilt * Math.PI / 2) * n * size, z: 0 });
  p[9] = at(1);
  [6, 10, 14, 18].forEach((j) => { p[j] = at(1.4); });
  [8, 12, 16, 20].forEach((tip) => { p[tip] = at(fist ? 0.8 : 1.9); });
  return p;
}
const UP = [shown(0.25, 0.4), shown(0.75, 0.4)];
// [hands, ms] frames → the times it fired
function raises(frames, d = raiseDetector()) {
  return frames.flatMap(([hands, t]) => (d(hands, t).fire ? [t] : []));
}
const every = (from, to, hands, ms = 33) => Array.from({ length: Math.floor((to - from) / ms) + 1 }, (_, i) => [hands, from + i * ms]);

test('a hand is raised when high, upright and open; not a fist, a low hand or one held sideways', () => {
  assert.equal(handRaised(shown(0.3, 0.45)), true);
  assert.equal(handRaised(shown(0.3, 0.45, { tilt: 0.3 })), true);
  assert.equal(handRaised(shown(0.3, 0.45, { fist: true })), false);
  assert.equal(handRaised(shown(0.3, 0.7)), true); // a camera close by: a raised hand shows lower
  assert.equal(handRaised(shown(0.3, 0.95)), false);
  assert.equal(handRaised(shown(0.3, 0.45, { tilt: 0.8 })), false);
  assert.equal(handRaised([]), false);
});

test('measured in the picture aspect: a hand leaning 60° is not upright, though a 16:9 picture squeezes it', () => {
  // the landmarks of a 16:9 picture: x in picture widths, so a sideways distance shows 16/9 times shorter
  const wide = (p) => p.map((q) => ({ ...q, x: 0.3 + (q.x - 0.3) / (16 / 9) }));
  const leaning = shown(0.3, 0.6, { tilt: 2 / 3 }); // 60° over: knuckle above the wrist by cos 60° = 0.5 hand sizes
  assert.equal(handRaised(wide(leaning), {}, 16 / 9), false);
  assert.equal(handRaised(wide(leaning), {}, 1), true); // measured without the aspect it looked upright (0.72)
  assert.equal(handRaised(wide(shown(0.3, 0.6, { tilt: 0.3 })), {}, 16 / 9), true);
});

test('both hands up fires once after the hold, however long they stay up', () => {
  assert.deepEqual(raises(every(0, 5000, UP)), [330]);
});

test('one hand up, or both up but only for a moment, never fires', () => {
  assert.deepEqual(raises(every(0, 3000, [shown(0.25, 0.4), shown(0.75, 0.95)])), []);
  assert.deepEqual(raises(every(0, 3000, [shown(0.25, 0.4)])), []);
  assert.deepEqual(raises([...every(0, 200, UP), ...every(233, 1000, [])]), []);
});

test('two raised hands right next to each other (one hand seen twice) are not both hands', () => {
  assert.deepEqual(raises(every(0, 2000, [shown(0.5, 0.4), shown(0.55, 0.4)])), []);
});

test('a frame or two without tracking is not coming down: no second fire', () => {
  assert.deepEqual(raises([...every(0, 1000, UP), [[], 1033], [[UP[0]], 1066], ...every(1100, 2000, UP)]), [330]);
});

test('a pause in tracking (no frames for a second, a busy computer) while they stay up: no second fire', () => {
  assert.deepEqual(raises([...every(0, 1000, UP), ...every(2000, 5000, UP)]), [330]);
});

test('down and up again fires again, but not within the rest', () => {
  const d = raiseDetector();
  const t1 = raises([...every(0, 600, UP), ...every(633, 1400, [])], d);
  const t2 = raises([...every(1433, 2400, UP), ...every(2433, 3000, [])], d); // within 3 s of the first: no
  const t3 = raises(every(3033, 4000, UP), d);
  assert.deepEqual([t1, t2, t3], [[330], [], [3363]]);
});

test('the state: down, rising, then up until a hand comes down', () => {
  const d = raiseDetector();
  const first = d([UP[0]], 0);
  assert.deepEqual([first.up, first.state, first.fire, first.parts.length], [1, 'down', false, 1]);
  assert.equal(d(UP, 33).state, 'rising');
  assert.equal(d(UP, 400).state, 'up');
  assert.equal(d(UP, 500).state, 'up');
  assert.equal(d([UP[0]], 533).state, 'up');
  assert.equal(d([UP[0]], 900).state, 'down');
});
