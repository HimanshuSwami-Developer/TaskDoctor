'use strict';
// The journal's API against a real Postgres: days and history, duplicates, questions and the agenda, blockers,
// permissions, search, the writing assistant switch and the clean-up migration.
//
// Runs only with TEST_DATABASE_URL pointing at a local, throwaway database (it is wiped first), e.g.
//   createdb flowtrace_test && TEST_DATABASE_URL=postgresql://localhost/flowtrace_test npm test
// The .env database is never used.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const url = process.env.TEST_DATABASE_URL;
const local = url && /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url.replace('postgresql://localhost', 'postgresql://x@localhost'));
const skip = !url ? 'set TEST_DATABASE_URL to a local throwaway database to run the API tests' : !local ? 'TEST_DATABASE_URL must be a local database (it is wiped)' : false;

const TZ = 'Asia/Kolkata';
const localDay = (offset = 0) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.now() + offset * 864e5)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
};

test('journal API', { skip }, async (t) => {
  Object.assign(process.env, { DATABASE_URL: url, APP_TIMEZONE: TZ, GROQ_API_KEY: '' });
  const db = require('../db');
  const auth = require('../auth');
  await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await db.init();
  const { app } = require('../server');
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.close(); await db.pool.end(); });

  const today = localDay();
  const yesterday = localDay(-1);
  const P = 'p1';
  await db.query(`INSERT INTO products (id, name) VALUES ($1, 'Finzoom'), ('p2', 'Other app')`, [P]);
  const tokens = {};
  const user = async (name, access, products = [P]) => {
    const id = `u-${name}`;
    await db.query(`INSERT INTO users (id, username, name, password_hash, access, product_ids) VALUES ($1, $2, $3, 'x', $4, $5)`,
      [id, name, name[0].toUpperCase() + name.slice(1), access, products]);
    tokens[name] = auth.newToken();
    await db.query(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '1 day')`, [auth.hashToken(tokens[name]), id]);
    return id;
  };
  const alice = await user('alice', 'developer');
  const bob = await user('bob', 'tester');
  await user('carol', 'view');
  await user('erin', 'developer');
  await user('dave', 'full');
  await user('outsider', 'developer', ['p2']);
  const call = async (who, method, path, body) => {
    const res = await fetch(base + path, {
      method, headers: { 'content-type': 'application/json', cookie: `${auth.COOKIE}=${tokens[who]}` }, body: body && JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };
  const day = (who, date = '') => call(who, 'GET', `/api/done?product=${P}${date ? `&date=${date}` : ''}`);

  await t.test('done entries: added once per form, with time spent', async () => {
    const clientId = crypto.randomUUID();
    const body = { productId: P, text: 'Fixed OTP timer', minutes: '1h 30m', clientId };
    const [a, b] = await Promise.all([call('alice', 'POST', '/api/done', body), call('alice', 'POST', '/api/done', body)]);
    assert.deepEqual([a.status, b.status].sort(), [200, 201]);
    assert.equal(a.body.id, b.body.id);
    assert.equal(a.body.minutes, 90);
    const d = await day('alice');
    assert.equal(d.body.items.filter((x) => x.text === 'Fixed OTP timer').length, 1);
    // someone else cannot reuse the id
    assert.equal((await call('bob', 'POST', '/api/done', { ...body })).status, 409);
    assert.equal((await call('alice', 'POST', '/api/done', { productId: P, text: 'x', minutes: '25h' })).status, 400);
    assert.equal((await call('carol', 'POST', '/api/done', { productId: P, text: 'x' })).status, 403);
  });

  await t.test('days: each date loads its own entries; bad or future dates fall back to today', async () => {
    await db.query(`INSERT INTO done_items (id, user_id, product_id, work_date, text) VALUES ('old1', $1, $2, $3, 'Yesterday work')`, [alice, P, yesterday]);
    const y = await day('alice', yesterday);
    assert.equal(y.body.date, yesterday);
    assert.deepEqual(y.body.items.map((x) => x.text), ['Yesterday work']);
    assert.equal(typeof y.body.items[0].date, 'string');
    assert.equal(y.body.items[0].date, yesterday); // a day, not a timestamp moved by a timezone
    const now = await day('alice');
    assert.equal(now.body.date, today);
    assert.ok(!now.body.items.some((x) => x.text === 'Yesterday work'));
    for (const bad of ['2026-02-31', localDay(3), 'nope']) assert.equal((await day('alice', bad)).body.date, today, bad);
    // others' entries stay private (super admins excepted)
    assert.equal((await day('bob', yesterday)).body.items.length, 0);
  });

  await t.test('points: stages, a double tick makes one entry, and history shows what was open that day', async () => {
    const add = await call('alice', 'POST', '/api/done/todos', { productId: P, text: 'Compress KYC images', priority: 'high', estMinutes: '2h' });
    assert.equal(add.status, 201);
    assert.equal(add.body.stage, 'todo');
    assert.equal(add.body.estMinutes, 120);
    const start = await call('alice', 'PATCH', `/api/done/todos/${add.body.id}`, { stage: 'progress', nextAction: 'Ask backend for limits' });
    assert.equal(start.body.stage, 'progress');
    assert.ok(start.body.startedAt);
    assert.equal((await call('alice', 'PATCH', `/api/done/todos/${add.body.id}`, { stage: 'blocked' })).status, 400);
    assert.equal((await call('bob', 'PATCH', `/api/done/todos/${add.body.id}`, { text: 'mine now' })).status, 403);
    // written yesterday: it was open at the end of yesterday
    await db.query(`UPDATE done_todos SET created_at = now() - interval '1 day' WHERE id = $1`, [add.body.id]);
    const ticks = await Promise.all([1, 2, 3].map(() => call('alice', 'PUT', `/api/done/todos/${add.body.id}/done`, { done: true })));
    assert.ok(ticks.every((r) => r.status === 200));
    const { rows } = await db.query('SELECT count(*)::int AS n FROM done_items WHERE todo_id = $1 AND NOT is_deleted', [add.body.id]);
    assert.equal(rows[0].n, 1);
    assert.ok(!(await day('alice')).body.todos.some((x) => x.id === add.body.id));
    assert.ok((await day('alice', yesterday)).body.todos.some((x) => x.id === add.body.id));
    // untick: the entry goes, the point is open again
    await call('alice', 'PUT', `/api/done/todos/${add.body.id}/done`, { done: false });
    assert.ok((await day('alice')).body.todos.some((x) => x.id === add.body.id));
  });

  let qid;
  await t.test('questions: validation, duplicates, who sees them and the workflow', async () => {
    const q = await call('alice', 'POST', '/api/journal/questions', {
      productId: P, text: 'Should OTP resend after 30 seconds?', details: 'Timer restarts', expected: 'Keeps counting',
      apis: 'POST /api/otp/send, GET /api/otp/status', priority: 'high', assigneeId: bob, meetingDate: '',
    });
    assert.equal(q.status, 201);
    qid = q.body.question.id;
    assert.deepEqual(q.body.question.apis, ['POST /api/otp/send', 'GET /api/otp/status']);
    assert.equal(q.body.question.status, 'open');
    assert.equal(q.body.question.raisedOn, today);
    assert.equal((await call('erin', 'POST', '/api/journal/questions', { productId: P, text: 'should otp resend after 30 seconds' })).status, 409);
    assert.equal((await call('carol', 'POST', '/api/journal/questions', { productId: P, text: 'A view login asks' })).status, 403);
    assert.equal((await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'Who?', assigneeId: 'u-outsider' })).status, 400);
    assert.equal((await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'Bad day', meetingDate: '2026-02-31' })).status, 400);
    assert.equal((await call('alice', 'POST', '/api/journal/questions', { productId: P, text: '   ' })).status, 400);
    // seen by the author, the person asked and admins; not by others (or other apps)
    assert.ok((await day('bob')).body.questions.some((x) => x.id === qid));
    assert.ok((await day('dave')).body.questions.some((x) => x.id === qid));
    assert.ok(!(await day('erin')).body.questions.some((x) => x.id === qid));
    assert.equal((await call('erin', 'PATCH', `/api/journal/questions/${qid}`, { text: 'hijack' })).status, 404);
    assert.equal((await call('outsider', 'GET', `/api/done?product=${P}`)).status, 404);
    // the person asked moves it along but cannot rewrite it
    const moved = await call('bob', 'PATCH', `/api/journal/questions/${qid}`, { text: 'Rewritten', meetingDate: today });
    assert.equal(moved.body.question.text, 'Should OTP resend after 30 seconds?');
    assert.equal(moved.body.question.meetingDate, today);
    assert.equal((await call('bob', 'PUT', `/api/journal/questions/${qid}/status`, { status: 'ready' })).body.question.status, 'ready');
    assert.equal((await call('bob', 'PUT', `/api/journal/questions/${qid}/status`, { status: 'done' })).status, 400);
    assert.equal((await call('bob', 'DELETE', `/api/journal/questions/${qid}`)).status, 403);
  });

  await t.test('agenda: each question once; rolls over; resolved ones leave it', async () => {
    const agenda = async (date) => (await call('alice', 'GET', `/api/journal/agenda?product=${P}&date=${date}`)).body;
    // set for today's meeting AND ready: listed once
    let a = await agenda(today);
    assert.deepEqual(a.items.map((x) => x.id), [qid]);
    // a ready question without a meeting day is on every coming meeting until it is handled
    const other = await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'Max upload size for KYC?', priority: 'urgent' });
    await call('alice', 'PUT', `/api/journal/questions/${other.body.question.id}/status`, { status: 'ready' });
    a = await agenda(localDay(7));
    assert.deepEqual(a.items.map((x) => x.id).sort(), [qid, other.body.question.id].sort());
    assert.equal(a.items[0].id, other.body.question.id); // urgent first
    // a question only "open" with a meeting on another day is not on this one
    await call('alice', 'PUT', `/api/journal/questions/${other.body.question.id}/status`, { status: 'open' });
    await call('alice', 'PATCH', `/api/journal/questions/${other.body.question.id}`, { meetingDate: localDay(14) });
    assert.deepEqual((await agenda(localDay(7))).items.map((x) => x.id), [qid]);
    // resolved: off the agenda, answer kept, resolved today
    const r = await call('bob', 'PUT', `/api/journal/questions/${qid}/status`, { status: 'resolved', answer: 'Yes, after 30 s' });
    assert.equal(r.body.question.resolvedOn, today);
    assert.equal(r.body.question.answer, 'Yes, after 30 s');
    assert.deepEqual((await agenda(today)).items.map((x) => x.id), []);
    // sharing needs a Teams channel
    assert.equal((await call('alice', 'POST', '/api/journal/agenda/share', { productId: P, date: today })).status, 400);
  });

  await t.test('questions carry over from day to day until resolved', async () => {
    const q = await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'Is PAN optional for NRIs?' });
    const id = q.body.question.id;
    await db.query('UPDATE journal_questions SET raised_on = $2 WHERE id = $1', [id, localDay(-3)]);
    const listed = (r) => r.body.questions.filter((x) => x.id === id).length;
    assert.equal(listed(await day('alice')), 1); // still open today, once
    assert.equal(listed(await day('alice', localDay(-2))), 1);
    assert.equal(listed(await day('alice', localDay(-4))), 0); // not asked yet then
    await call('alice', 'PUT', `/api/journal/questions/${id}/status`, { status: 'resolved' });
    await db.query('UPDATE journal_questions SET resolved_on = $2 WHERE id = $1', [id, yesterday]);
    assert.equal(listed(await day('alice')), 0); // resolved before today
    assert.equal(listed(await day('alice', yesterday)), 1); // shown as resolved on its day
    // reopening it is fine; asking the same thing while it is open is not
    await call('alice', 'PUT', `/api/journal/questions/${id}/status`, { status: 'open' });
    assert.equal((await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'is pan optional for nris' })).status, 409);
  });

  await t.test('blockers: who it waits on resolves it; strangers cannot touch it', async () => {
    const todo = await call('alice', 'POST', '/api/done/todos', { productId: P, text: 'Payment flow', stage: 'progress' });
    const b = await call('alice', 'POST', '/api/journal/blockers', {
      productId: P, text: 'Waiting for sandbox keys', waitingOn: bob, nextAction: 'Ping Bob at 3', todoId: todo.body.id,
    });
    assert.equal(b.status, 201);
    const id = b.body.blocker.id;
    assert.equal(b.body.blocker.priority, 'high');
    assert.equal(b.body.blocker.todoText, 'Payment flow');
    assert.equal((await call('alice', 'POST', '/api/journal/blockers', { productId: P, text: 'x', todoId: 'nope' })).status, 400);
    assert.ok((await day('bob')).body.blockers.some((x) => x.id === id));
    assert.equal((await call('erin', 'PUT', `/api/journal/blockers/${id}/resolved`, { resolved: true })).status, 404);
    assert.equal((await call('bob', 'PATCH', `/api/journal/blockers/${id}`, { text: 'mine' })).status, 403);
    const r = await call('bob', 'PUT', `/api/journal/blockers/${id}/resolved`, { resolved: true, resolution: 'Keys sent' });
    assert.equal(r.body.blocker.resolvedOn, today);
    assert.equal(r.body.blocker.resolution, 'Keys sent');
    const again = await call('alice', 'PUT', `/api/journal/blockers/${id}/resolved`, { resolved: true, resolution: 'Keys sent on chat' });
    assert.equal(again.body.blocker.resolvedOn, today);
    assert.equal(again.body.blocker.resolution, 'Keys sent on chat');
    const open = await call('alice', 'PUT', `/api/journal/blockers/${id}/resolved`, { resolved: false });
    assert.equal(open.body.blocker.resolvedAt, null);
  });

  await t.test('search across days finds entries, questions and blockers, with % taken literally', async () => {
    const r = await call('alice', 'GET', `/api/journal/search?product=${P}&q=${encodeURIComponent('yesterday')}`);
    assert.deepEqual(r.body.done.map((x) => x.text), ['Yesterday work']);
    assert.equal((await call('alice', 'GET', `/api/journal/search?product=${P}&q=OTP`)).body.questions.length, 1);
    assert.equal((await call('alice', 'GET', `/api/journal/search?product=${P}&q=sandbox`)).body.blockers.length, 1);
    assert.equal((await call('alice', 'GET', `/api/journal/search?product=${P}&q=${encodeURIComponent('%%')}`)).body.done.length, 0);
    assert.equal((await call('alice', 'GET', `/api/journal/search?product=${P}&q=a`)).status, 400);
    assert.equal((await call('erin', 'GET', `/api/journal/search?product=${P}&q=OTP`)).body.questions.length, 0);
  });

  await t.test('resolving an issue twice at once puts it on "done today" once', async () => {
    await db.query(`INSERT INTO modules (id, product_id, name) VALUES ('m1', $1, 'Login');
                    INSERT INTO flows (id, module_id, name) VALUES ('f1', 'm1', 'OTP');
                    INSERT INTO screens (id, flow_id, name) VALUES ('s1', 'f1', 'OTP screen');
                    INSERT INTO comments (id, screen_id, text) VALUES ('c1', 's1', 'Timer resets')`.replace('$1', `'${P}'`));
    const res = await Promise.all([1, 2].map(() => call('bob', 'PATCH', '/api/comments/c1', { status: 'complete' })));
    assert.ok(res.every((r) => r.status === 200), JSON.stringify(res.map((r) => r.body)));
    const { rows } = await db.query(`SELECT count(*)::int AS n FROM done_items WHERE comment_id = 'c1' AND NOT is_deleted`);
    assert.equal(rows[0].n, 1);
  });

  await t.test('migration removes duplicate entries made before the unique indexes', async () => {
    await db.query('DROP INDEX done_items_issue_day_uq');
    await db.query(`INSERT INTO done_items (id, user_id, product_id, work_date, text, comment_id, created_at)
                    VALUES ('dup2', $1, $2, $3, 'copy', 'c1', now() + interval '1 minute')`, [bob, P, today]);
    await db.init();
    const { rows } = await db.query(`SELECT id FROM done_items WHERE comment_id = 'c1' AND NOT is_deleted`);
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].id, 'dup2'); // the first one stays
  });

  await t.test('minutes of meeting: points once, agenda questions once, three outcomes, sharing', async () => {
    const clientId = crypto.randomUUID();
    const body = { productId: P, title: 'KYC sync', date: today, attendees: [alice, bob, 'u-outsider'], clientId };
    const [a, b] = await Promise.all([call('alice', 'POST', '/api/journal/meetings', body), call('alice', 'POST', '/api/journal/meetings', body)]);
    assert.deepEqual([a.status, b.status].sort(), [200, 201]);
    const mid = a.body.meeting.id;
    assert.deepEqual(a.body.meeting.attendees, [alice, bob]); // people of other apps are dropped
    assert.equal((await call('carol', 'POST', '/api/journal/meetings', { productId: P, title: 'x' })).status, 403);
    assert.equal((await call('carol', 'GET', `/api/journal/meetings/${mid}`)).status, 200); // the team reads minutes
    assert.equal((await call('outsider', 'GET', `/api/journal/meetings/${mid}`)).status, 404);
    assert.equal((await call('alice', 'POST', '/api/journal/meetings', { productId: P, date: '2026-02-31' })).status, 400);

    const pid = crypto.randomUUID();
    await call('bob', 'POST', `/api/journal/meetings/${mid}/points`, { text: 'Resend OTP after 30 s', clientId: pid });
    const again = await call('bob', 'POST', `/api/journal/meetings/${mid}/points`, { text: 'Resend OTP after 30 s', clientId: pid });
    assert.equal(again.status, 200);
    assert.equal(again.body.points.length, 1);
    assert.equal((await call('carol', 'POST', `/api/journal/meetings/${mid}/points`, { text: 'view login' })).status, 403);

    // the agenda's questions come in once, however often they are added
    const q = await call('alice', 'POST', '/api/journal/questions', { productId: P, text: 'Can KYC be skipped for minors?', meetingDate: today });
    const first = await call('alice', 'POST', `/api/journal/meetings/${mid}/from-agenda`);
    const second = await call('alice', 'POST', `/api/journal/meetings/${mid}/from-agenda`);
    assert.ok(first.body.added >= 1);
    assert.equal(second.body.added, 0);
    const fromQ = second.body.points.find((x) => x.questionId === q.body.question.id);
    assert.ok(fromQ);

    // Done / To be discussed with / Deferred
    const point = again.body.points[0];
    assert.equal((await call('bob', 'PATCH', `/api/journal/points/${point.id}`, { status: 'discuss' })).status, 400);
    assert.equal((await call('bob', 'PATCH', `/api/journal/points/${point.id}`, { status: 'discuss', discussWith: 'u-outsider' })).status, 400);
    const disc = await call('bob', 'PATCH', `/api/journal/points/${point.id}`, { status: 'discuss', discussWith: alice });
    const p1 = disc.body.points.find((x) => x.id === point.id);
    assert.equal(p1.status, 'discuss');
    assert.equal(p1.discussWithName, 'Alice');
    const done = await call('bob', 'PATCH', `/api/journal/points/${point.id}`, { status: 'done' });
    assert.equal(done.body.points.find((x) => x.id === point.id).discussWith, null);
    // a point from a question moves the question: done → discussed; deferred → ready with no meeting day
    const d1 = await call('alice', 'PATCH', `/api/journal/points/${fromQ.id}`, { status: 'done' });
    assert.equal(d1.body.question, 'discussed');
    const d2 = await call('alice', 'PATCH', `/api/journal/points/${fromQ.id}`, { status: 'deferred' });
    assert.equal(d2.body.question, 'ready');
    const { rows: [qrow] } = await db.query('SELECT status, meeting_date FROM journal_questions WHERE id = $1', [q.body.question.id]);
    assert.deepEqual(qrow, { status: 'ready', meeting_date: null });

    // sharing needs the app's Teams channel; picked points must belong to these minutes
    assert.equal((await call('bob', 'POST', `/api/journal/meetings/${mid}/share`, { pointIds: [point.id] })).status, 400);
    await db.query(`UPDATE products SET teams_webhook = 'http://127.0.0.1:9/hook' WHERE id = $1`, [P]);
    assert.equal((await call('bob', 'POST', `/api/journal/meetings/${mid}/share`, { pointIds: ['not-here'] })).status, 400);
    assert.equal((await call('carol', 'POST', `/api/journal/meetings/${mid}/share`, {})).status, 403);
    await db.query(`UPDATE products SET teams_webhook = '' WHERE id = $1`, [P]);

    // the list counts points; only the creator (or an admin) deletes minutes
    const list = await call('bob', 'GET', `/api/journal/meetings?product=${P}`);
    const row = list.body.meetings.find((x) => x.id === mid);
    assert.equal(row.points, 2);
    assert.equal(row.done, 1);
    assert.equal((await call('bob', 'DELETE', `/api/journal/meetings/${mid}`)).status, 403);
    assert.equal((await call('alice', 'DELETE', `/api/journal/meetings/${mid}`)).status, 200);
    assert.equal((await call('alice', 'GET', `/api/journal/meetings/${mid}`)).status, 404);
  });

  await t.test('writing assistant: off without GROQ_API_KEY', async () => {
    assert.equal((await call('alice', 'GET', '/api/assist')).body.ai, false);
    assert.equal((await call('alice', 'POST', '/api/assist', { text: 'teh build' })).status, 503);
    assert.equal((await call('carol', 'POST', '/api/assist', { text: 'teh build' })).status, 403);
  });
});
