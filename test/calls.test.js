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
  c.message(x, { id: 'u3', name: 'Cy' }, { type: 'call-join', room: 'abc' });
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

test('a gesture goes to the other one in the room, and only a known one', () => {
  const c = calls.create();
  const [a, b, other] = [socket(), socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'one' });
  c.message(b, bob, { type: 'call-join', room: 'one' });
  c.message(other, bob, { type: 'call-join', room: 'two' });
  const before = other.got.length;
  c.message(a, ann, { type: 'call-gesture', gesture: 'both-hands-raised', extra: '<b>' });
  assert.deepEqual(last(b), { type: 'call-gesture', gesture: 'both-hands-raised' });
  const n = b.got.length;
  c.message(a, ann, { type: 'call-gesture', gesture: 'anything' });
  c.message(a, ann, { type: 'call-gesture' });
  assert.equal(b.got.length, n);
  assert.equal(other.got.length, before);
  assert.equal(a.got.filter((m) => m.type === 'call-gesture').length, 0);
});

test('a full room makes way for the same login joining again (its old socket is stale), not for anyone else', () => {
  const c = calls.create();
  const [a, b, aAgain, x] = [socket(), socket(), socket(), socket()];
  c.message(a, ann, { type: 'call-join', room: 'abc' });
  c.message(b, bob, { type: 'call-join', room: 'abc' });
  c.message(x, { id: 'u3', name: 'Cy' }, { type: 'call-join', room: 'abc' });
  assert.deepEqual(last(x), { type: 'call-full', room: 'abc' });
  c.message(aAgain, ann, { type: 'call-join', room: 'abc' });
  assert.deepEqual(last(aAgain), { type: 'call-joined', room: 'abc', polite: true, peer: { id: 'u2', name: 'bob' } });
  assert.deepEqual(b.got.slice(-2), [{ type: 'call-left' }, { type: 'call-peer', peer: { id: 'u1', name: 'Ann' } }]);
  c.message(a, ann, { type: 'call-signal', candidate: null }); // the stale socket is out of the room
  assert.deepEqual(last(b), { type: 'call-peer', peer: { id: 'u1', name: 'Ann' } });
});

test('ICE: addresses without stun: / turn: are left out (the browser would refuse the whole list)', () => {
  const orig = console.error; console.error = () => {};
  try {
    assert.equal(calls.iceServers({ TURN_URLS: 'app.metered.live', TURN_SECRET: 's' }, 'u1').length, 1);
    assert.deepEqual(calls.iceServers({ STUN_URLS: 'stun:a:3478, b.example.com' }, 'u1'), [{ urls: ['stun:a:3478'] }]);
  } finally { console.error = orig; }
});

test('Metered: servers from its API, kept an hour; nothing without the settings or when it fails', async () => {
  let calls_ = 0;
  const ok = async (url) => { calls_ += 1; assert.match(url, /^https:\/\/app\.metered\.live\/api\/v1\/turn\/credentials\?apiKey=k1$/);
    return { ok: true, json: async () => [{ urls: 'stun:stun.relay.metered.ca:80' }, { urls: 'turn:global.relay.metered.ca:80', username: 'u', credential: 'p' }] }; };
  const get = calls.metered({ METERED_DOMAIN: 'https://app.metered.live/', METERED_API_KEY: 'k1' }, ok);
  const list = await get(0);
  assert.deepEqual(list[1], { urls: 'turn:global.relay.metered.ca:80', username: 'u', credential: 'p' });
  await get(1000);
  assert.equal(calls_, 1);
  assert.deepEqual(await calls.metered({}, ok)(), []);
  const orig = console.error; console.error = () => {};
  try {
    const bad = calls.metered({ METERED_DOMAIN: 'app.metered.live', METERED_API_KEY: 'x' }, async () => ({ ok: false, status: 401, json: async () => ({ error: 'Invalid API Key' }) }));
    assert.deepEqual(await bad(), []);
  } finally { console.error = orig; }
});
