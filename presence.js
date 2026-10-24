'use strict';
/**
 * Who is online, live over a WebSocket (/ws).
 *
 * Every signed-in browser tab keeps one socket open (signed in by the same session cookie as the API) and says every
 * 30 seconds whether someone is using it (a key, a click, the mouse … in the last 2 minutes, with the tab in front).
 * From that each login is:
 *   online   a tab is open and was used in the last 2 minutes
 *   away     a tab is open, but nobody used it for 2 minutes
 *   offline  no tab open; lastSeen says when they were last here (kept in the presence table, so after a restart too)
 * Super admins get the whole list pushed to them whenever it changes ({ type: 'presence', users: [...] }); nobody else
 * gets anything (the sockets of other logins only count them as present).
 */
const { WebSocketServer } = require('ws');

const ACTIVE = 2 * 60 * 1000; // used in the last 2 minutes = online
const SWEEP = 30 * 1000;

function attach(server, { db, auth }) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 });
  // user id → { sockets: Set, lastActive: ms, lastSeen: ms, super: bool }
  const people = new Map();
  let last = ''; // the list as last sent, to send only changes

  const person = (id) => {
    if (!people.has(id)) people.set(id, { sockets: new Set(), lastActive: 0, lastSeen: 0, super: false });
    return people.get(id);
  };
  const statusOf = (p, now = Date.now()) => (!p.sockets.size ? 'offline' : now - p.lastActive <= ACTIVE ? 'online' : 'away');
  function list() {
    const now = Date.now();
    return [...people.entries()].map(([id, p]) => ({
      id, status: statusOf(p, now), lastSeen: p.lastSeen ? new Date(p.lastSeen).toISOString() : null,
    }));
  }
  /** id → { status, lastSeen } of one login (for /api/users) */
  const of = (id) => {
    const p = people.get(id);
    return p ? { status: statusOf(p), lastSeen: p.lastSeen ? new Date(p.lastSeen).toISOString() : null } : { status: 'offline', lastSeen: null };
  };

  // the list to every super admin's tabs, when it changed (or to one new tab)
  function broadcast(only) {
    const users = list();
    const body = JSON.stringify(users.map((u) => [u.id, u.status]));
    if (!only && body === last) return;
    if (!only) last = body;
    const message = JSON.stringify({ type: 'presence', users });
    const targets = only ? [only] : [...people.values()].filter((p) => p.super).flatMap((p) => [...p.sockets]);
    targets.forEach((ws) => { if (ws.readyState === ws.OPEN) ws.send(message); });
  }
  let soon = null;
  const broadcastSoon = () => { clearTimeout(soon); soon = setTimeout(() => broadcast(), 250); };

  const save = (ids) => (ids.length ? db.query(
    `INSERT INTO presence (user_id, last_seen_at) SELECT unnest($1::text[]), now()
     ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now()`, [ids]).catch((err) => console.error('Presence:', err.message)) : null);

  // when everyone was last seen, from before this start
  db.query('SELECT p.user_id, p.last_seen_at FROM presence p JOIN users u ON u.id = p.user_id WHERE NOT u.is_deleted')
    .then(({ rows }) => rows.forEach((r) => { person(r.user_id).lastSeen = new Date(r.last_seen_at).getTime(); }))
    .catch((err) => console.error('Presence:', err.message));

  wss.on('connection', async (ws, req) => {
    // only pages of this app (a page elsewhere cannot use your cookie to show you online)
    const origin = req.headers.origin;
    let from = '';
    try { from = origin ? new URL(origin).host : req.headers.host; } catch (err) { from = ''; }
    if (from !== req.headers.host) { ws.close(4403, 'Wrong origin'); return; }
    const token = auth.readCookie(req, auth.COOKIE);
    let user = null;
    if (token) {
      const { rows } = await db.query(
        `SELECT u.id, u.access FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > now() AND NOT u.is_deleted`, [auth.hashToken(token)]).catch(() => ({ rows: [] }));
      [user] = rows;
    }
    if (!user) { ws.close(4401, 'Please sign in'); return; }

    const p = person(user.id);
    p.super = user.access === 'super';
    p.sockets.add(ws);
    p.lastActive = Date.now();
    p.lastSeen = Date.now();
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    ws.on('message', (data) => {
      let m;
      try { m = JSON.parse(String(data)); } catch (err) { return; }
      if (m && m.type === 'beat') {
        p.lastSeen = Date.now();
        if (m.active) p.lastActive = Date.now();
        broadcastSoon();
      }
    });
    ws.on('close', () => {
      p.sockets.delete(ws);
      p.lastSeen = Date.now();
      if (!p.sockets.size) save([user.id]);
      broadcastSoon();
    });
    if (p.super) broadcast(ws);
    broadcastSoon();
  });

  // every 30 s: drop sockets that stopped answering, note who is still here, and send what changed (online → away)
  const timer = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.alive) { ws.terminate(); return; }
      ws.alive = false;
      ws.ping();
    });
    const here = [...people.entries()].filter(([, p]) => p.sockets.size).map(([id]) => id);
    save(here);
    broadcast();
  }, SWEEP);
  wss.on('close', () => clearInterval(timer));

  return { of, list, wss };
}

module.exports = { attach, ACTIVE };
