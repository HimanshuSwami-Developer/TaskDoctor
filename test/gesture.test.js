'use strict';
// The finger snap (public/gesture.js) on made-up hands: what must count as a snap and what must not. No camera.
const test = require('node:test');
const assert = require('node:assert/strict');
const { snapDetector, measure } = require('../public/gesture');

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
