'use strict';
// Video call rooms (calls.js): who is paired with whom, what is passed along, and the TURN logins. No network.
const test = require('node:test');
const assert = require('node:assert/strict');
const calls = require('../calls');

// a socket that keeps what it was sent
const socket = () => ({ OPEN: 1, readyState: 1, got: [], send(s) { this.got.push(JSON.parse(s)); } });
const last = (ws) => ws.got[ws.got.length - 1];
const ann = { id: 'u1', name: 'Ann', username: 'ann' };
const bob = { id: 'u2', name: '', username: 'bob' };

test('the first to join waits; the second is polite and both learn who the other is', () => {
  const c = calls.create();
  const a = socket();
  const b = socket();
  c.message(a, ann, { type: 'call-join', room: 'Daily-Sync' });
  assert.deepEqual(last(a), { type: 'call-joined', room: 'daily-sync', polite: false, peer: null });
  c.message(b, bob, { type: 'call-join', room: 'daily-sync' });
  assert.deepEqual(last(b), { type: 'call-joined', room: 'daily-sync', polite: true, peer: { id: 'u1', name: 'Ann' } });
  assert.deepEqual(last(a), { type: 'call-peer', peer: { id: 'u2', name: 'bob' } });
});

test('a room holds two; bad room names are ignored', () => {
  const c = calls.create();
  const [a, b, x] = [socket(), socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'abc' });
  c.message(b, bob, { type: 'call-join', room: 'abc' });
  c.message(x, bob, { type: 'call-join', room: 'abc' });
  assert.deepEqual(last(x), { type: 'call-full', room: 'abc' });
  ['ab', '-abc', 'a b c', 'x'.repeat(41), 42, null].forEach((room) => c.message(x, bob, { type: 'call-join', room }));
  assert.equal(x.got.length, 1);
});

test('signals go only to the other one in the room, with only the WebRTC fields', () => {
  const c = calls.create();
  const [a, b, other] = [socket(), socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'one' });
  c.message(b, bob, { type: 'call-join', room: 'one' });
  c.message(other, bob, { type: 'call-join', room: 'two' });
  const before = other.got.length;
  c.message(a, ann, { type: 'call-signal', description: { type: 'offer', sdp: 'v=0', extra: 'x' }, room: 'two' });
  assert.deepEqual(last(b), { type: 'call-signal', description: { type: 'offer', sdp: 'v=0' } });
  c.message(b, bob, { type: 'call-signal', candidate: null });
  assert.deepEqual(last(a), { type: 'call-signal', candidate: null });
  const n = b.got.length;
  c.message(a, ann, { type: 'call-signal', description: { type: 'hack' } });
  c.message(a, ann, { type: 'call-signal', candidate: 'text' });
  assert.equal(b.got.length, n);
  assert.equal(other.got.length, before);
});

test('leaving, or the tab closing, tells the other one and empties the room', () => {
  const c = calls.create();
  const [a, b] = [socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'abc' });
  c.message(b, bob, { type: 'call-join', room: 'abc' });
  c.leave(b);
  assert.deepEqual(last(a), { type: 'call-left' });
  c.message(a, ann, { type: 'call-leave' });
  assert.equal(c.count(), 0);
  c.leave(a); // not in a room: nothing happens
});

test('joining another room leaves the first', () => {
  const c = calls.create();
  const [a, b] = [socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'abc' });
  c.message(b, bob, { type: 'call-join', room: 'abc' });
  c.message(b, bob, { type: 'call-join', room: 'xyz' });
  assert.deepEqual(last(a), { type: 'call-left' });
  assert.equal(c.count(), 2);
});

test('ICE: STUN by default; TURN with a 12-hour login from the shared secret, or a fixed one', () => {
  assert.deepEqual(calls.iceServers({}, 'u1'), [{ urls: ['stun:stun.l.google.com:19302'] }]);
  const [, turn] = calls.iceServers({ TURN_URLS: 'turn:t.example.com:3478, turns:t.example.com:5349', TURN_SECRET: 'secret' }, 'u1', 1000 * 1000);
  assert.deepEqual(turn.urls, ['turn:t.example.com:3478', 'turns:t.example.com:5349']);
  assert.equal(turn.username, `${1000 + 12 * 3600}:u1`);
  assert.equal(turn.credential, require('crypto').createHmac('sha1', 'secret').update(turn.username).digest('base64'));
  const [, fixed] = calls.iceServers({ TURN_URLS: 'turn:t:3478', TURN_USERNAME: 'me', TURN_CREDENTIAL: 'pw' }, 'u1');
  assert.deepEqual(fixed, { urls: ['turn:t:3478'], username: 'me', credential: 'pw' });
  assert.equal(calls.iceServers({ TURN_URLS: 'turn:t:3478' }, 'u1').length, 1); // no login: TURN left out
});
