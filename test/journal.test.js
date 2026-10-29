'use strict';
// The journal's rules (journal.js), the writing assistant's quick checks (public/assist.js) and the cleaning of AI
// answers (assist.js). No database, no network: `npm test`.
const test = require('node:test');
const assert = require('node:assert/strict');
const journal = require('../journal');
const { check, diffWords } = require('../public/assist');

process.env.ANTHROPIC_API_KEY = ''; // never call the AI from the tests
const assist = require('../assist');

test('isDay accepts only real calendar days', () => {
  assert.equal(journal.isDay('2026-10-28'), true);
  assert.equal(journal.isDay('2024-02-29'), true); // leap day
  assert.equal(journal.isDay('2026-02-29'), false);
  assert.equal(journal.isDay('2026-02-31'), false);
  assert.equal(journal.isDay('2026-13-01'), false);
  assert.equal(journal.isDay('28-10-2026'), false);
  assert.equal(journal.isDay(''), false);
  assert.equal(journal.isDay(undefined), false);
});

test('pastDay keeps a real past day and falls back to today otherwise', () => {
  const today = '2026-10-28';
  assert.equal(journal.pastDay('2026-10-01', today), '2026-10-01');
  assert.equal(journal.pastDay(today, today), today);
  assert.equal(journal.pastDay('2026-10-29', today), today); // no future days
  assert.equal(journal.pastDay('2026-02-31', today), today);
  assert.equal(journal.pastDay("2026-10-01' OR 1=1", today), today);
});

test('minutesValue reads minutes and hour / minute text', () => {
  assert.equal(journal.minutesValue(''), null);
  assert.equal(journal.minutesValue(null), null);
  assert.equal(journal.minutesValue(45), 45);
  assert.equal(journal.minutesValue('90'), 90);
  assert.equal(journal.minutesValue('45m'), 45);
  assert.equal(journal.minutesValue('45 min'), 45);
  assert.equal(journal.minutesValue('2h'), 120);
  assert.equal(journal.minutesValue('1h 30m'), 90);
  assert.equal(journal.minutesValue('1.5h'), 90);
  assert.equal(journal.minutesValue('2 hours'), 120);
  for (const bad of ['0', '25h', 'abc', '-5', '1441', 'h', 'm']) {
    assert.throws(() => journal.minutesValue(bad), (err) => err.status === 400, bad);
  }
});

test('meetingDay, priority and apiList validate their input', () => {
  assert.equal(journal.meetingDay(''), null);
  assert.equal(journal.meetingDay('2026-11-02'), '2026-11-02'); // a meeting can be in the future
  assert.throws(() => journal.meetingDay('2026-11-31'), (err) => err.status === 400);
  assert.equal(journal.priority(undefined, 'medium'), 'medium');
  assert.equal(journal.priority('urgent'), 'urgent');
  assert.throws(() => journal.priority('critical'), (err) => err.status === 400);
  assert.deepEqual(journal.apiList('POST /api/otp, GET /api/otp ,POST /api/otp,, '), ['POST /api/otp', 'GET /api/otp']);
  assert.equal(journal.apiList(Array.from({ length: 20 }, (_, i) => `GET /a/${i}`)).length, 10);
  assert.deepEqual(journal.apiList(42), []);
});

test('clientId takes only uuids; sameText ignores case, spaces and the question mark', () => {
  assert.equal(journal.clientId('3F2504E0-4F89-41D3-9A0C-0305E82C3301'), '3f2504e0-4f89-41d3-9a0c-0305e82c3301');
  assert.equal(journal.clientId('not-a-uuid'), null);
  assert.equal(journal.clientId({}), null);
  assert.equal(journal.sameText('Should OTP  resend after 30s?'), journal.sameText('should otp resend after 30s'));
  assert.notEqual(journal.sameText('Should OTP resend?'), journal.sameText('Should OTP expire?'));
  assert.equal(journal.likePattern('50%_off\\'), '%50\\%\\_off\\\\%');
});

test('questionRights: author and admins edit; assignee moves it; others see nothing', () => {
  const q = { user_id: 'a', assignee_id: 'b' };
  const user = (id, access = 'developer') => ({ id, access });
  assert.deepEqual(journal.questionRights(user('a'), q), { view: true, edit: true, move: true, remove: true });
  assert.deepEqual(journal.questionRights(user('b', 'tester'), q), { view: true, edit: false, move: true, remove: false });
  assert.deepEqual(journal.questionRights(user('c'), q), { view: false, edit: false, move: false, remove: false });
  assert.deepEqual(journal.questionRights(user('c', 'full'), q), { view: true, edit: true, move: true, remove: true });
  // a view-only login sees a question assigned to it but cannot change it
  assert.deepEqual(journal.questionRights(user('b', 'view'), q), { view: true, edit: false, move: false, remove: false });
  // no assignee: nobody is "the assignee"
  assert.equal(journal.questionRights(user(null), { user_id: 'a', assignee_id: null }).view, false);
});

test('questionStatusFields stamps discussed / resolved and clears them going back', () => {
  const now = new Date('2026-10-28T10:00:00Z');
  const ctx = { userId: 'u1', today: '2026-10-28', now };
  assert.deepEqual(journal.questionStatusFields('open', 'open', ctx), {});
  assert.deepEqual(journal.questionStatusFields('open', 'ready', ctx),
    { status: 'ready', discussed_at: null, resolved_at: null, resolved_on: null, resolved_by: null });
  assert.equal(journal.questionStatusFields('ready', 'discussed', ctx).discussed_at, now);
  const resolved = journal.questionStatusFields('discussed', 'resolved', ctx);
  assert.equal(resolved.resolved_on, '2026-10-28');
  assert.equal(resolved.resolved_by, 'u1');
  assert.equal('discussed_at' in resolved, false); // kept as it was
  const reopened = journal.questionStatusFields('resolved', 'open', ctx);
  assert.equal(reopened.resolved_on, null);
  assert.equal(reopened.discussed_at, null);
  assert.throws(() => journal.questionStatusFields('open', 'closed', ctx), (err) => err.status === 400);
});

test('blockerRights: the person blocked edits; the person it waits on resolves', () => {
  const b = { user_id: 'a', waiting_on: 'b' };
  assert.deepEqual(journal.blockerRights({ id: 'a', access: 'developer' }, b), { view: true, edit: true, resolve: true });
  assert.deepEqual(journal.blockerRights({ id: 'b', access: 'tester' }, b), { view: true, edit: false, resolve: true });
  assert.deepEqual(journal.blockerRights({ id: 'c', access: 'full' }, b), { view: false, edit: false, resolve: false });
  assert.deepEqual(journal.blockerRights({ id: 'c', access: 'super' }, b), { view: true, edit: true, resolve: true });
});

test('minutes: point outcomes, what they do to the question, and who may change minutes', () => {
  assert.deepEqual(journal.pointStatusFields('done', 'u2'), { status: 'done', discuss_with: null });
  assert.deepEqual(journal.pointStatusFields('discuss', 'u2'), { status: 'discuss', discuss_with: 'u2' });
  assert.throws(() => journal.pointStatusFields('discuss', null), (err) => err.status === 400);
  assert.throws(() => journal.pointStatusFields('skipped', null), (err) => err.status === 400);
  assert.equal(journal.questionAfterPoint('done', 'ready'), 'discussed');
  assert.equal(journal.questionAfterPoint('done', 'discussed'), null);
  assert.equal(journal.questionAfterPoint('deferred', 'discussed'), 'ready');
  assert.equal(journal.questionAfterPoint('deferred', 'resolved'), null);
  assert.equal(journal.questionAfterPoint('discuss', 'open'), null);
  const m = { created_by: 'a' };
  assert.deepEqual(journal.meetingRights({ id: 'b', access: 'developer' }, m), { edit: true, remove: false });
  assert.deepEqual(journal.meetingRights({ id: 'a', access: 'tester' }, m), { edit: true, remove: true });
  assert.deepEqual(journal.meetingRights({ id: 'c', access: 'full' }, m), { edit: true, remove: true });
  assert.deepEqual(journal.meetingRights({ id: 'd', access: 'view' }, m), { edit: false, remove: false });
});

test('quick checks fix spelling, spacing, capitals and the question mark', () => {
  const r = check('i think teh login is  broken ,check it');
  assert.equal(r.text, 'I think the login is broken, check it');
  assert.ok(r.changes.some((c) => c.kind === 'spelling' && c.from === 'teh'));
  assert.equal(check('what is the otp timeout', { question: true }).text, 'What is the otp timeout?');
  assert.equal(check('Do the deploy').text, 'Do the deploy'); // not a question box: no "?"
  assert.equal(check('fixed the the bug in api.js. next fix e.g. kyc flow').text, 'Fixed the bug in api.js. Next fix e.g. kyc flow');
  assert.equal(check('Teh build').text, 'The build');
  assert.equal(check('dont merge yet').text, "Don't merge yet");
  assert.equal(check('Im wating for the the review').text, "I'm waiting for the review");
});

test('quick checks leave good text, code, links and identifiers alone', () => {
  for (const ok of ['All good here.', 'Fixed getUser in iOS app', 'See `teh_flag` in config', 'Docs at https://x.io/teh,b?q=1', '']) {
    const r = check(ok);
    assert.equal(r.text, ok, ok);
    assert.deepEqual(r.changes, []);
  }
});

test('diffWords marks what was removed and added', () => {
  assert.deepEqual(diffWords('teh cat sat', 'the cat sat down'), [
    { type: 'del', text: 'teh' }, { type: 'add', text: 'the' }, { type: 'same', text: ' cat sat' }, { type: 'add', text: ' down' },
  ]);
  const parts = diffWords('Same text', 'Same text');
  assert.deepEqual(parts, [{ type: 'same', text: 'Same text' }]);
  // putting the parts back together gives both texts
  const a = 'Waiting for the payment API keys from backend';
  const b = 'Waiting on backend for the payment API sandbox keys';
  const d = diffWords(a, b);
  assert.equal(d.filter((p) => p.type !== 'add').map((p) => p.text).join(''), a);
  assert.equal(d.filter((p) => p.type !== 'del').map((p) => p.text).join(''), b);
});

test('assist: off without a key, and AI answers are cleaned before they reach the browser', async () => {
  assert.equal(assist.configured(), false);
  await assert.rejects(assist.suggest({ text: 'hello', userId: 'u' }), (err) => err.status === 503);
  assert.deepEqual(assist.clean({ text: 'Same', changes: [] }, 'Same'), { text: 'Same', changes: [], unchanged: true });
  const c = assist.clean({
    text: ' Fixed the login. ',
    changes: [{ kind: 'spelling', from: 'teh', to: 'the', note: 'Spelling' }, { kind: 'weird', from: 'a', to: 'b', note: 7 }, { from: 1 }, null],
  }, 'fixed teh login');
  assert.equal(c.text, 'Fixed the login.');
  assert.equal(c.unchanged, false);
  assert.deepEqual(c.changes, [{ kind: 'spelling', from: 'teh', to: 'the', note: 'Spelling' }, { kind: 'clarity', from: 'a', to: 'b', note: '' }]);
  assert.equal(assist.clean(null, 'x').unchanged, true);
});
