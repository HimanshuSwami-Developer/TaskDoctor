'use strict';
/**
 * Video calls: rooms of two, signalled over the presence socket (/ws, presence.js).
 *
 * The browsers send their video to each other directly (WebRTC, peer to peer); the server only passes their offers,
 * answers and ICE candidates along, and never sees the video. A tab is in at most one room and a room holds two tabs.
 * The second to join is the "polite" one (perfect negotiation: when both offer at once, it gives way). Rooms live in
 * memory: a restart empties them, and the browsers join again when their socket comes back.
 *
 *   browser → server   { type: 'call-join', room }
 *                      { type: 'call-signal', description?, candidate? }   passed to the other tab in the room
 *                      { type: 'call-gesture', gesture }                    passed on (only GESTURES): a reaction, e.g.
 *                                                                          both hands raised, shown on both screens
 *                      { type: 'call-leave' }
 *   server → browser   { type: 'call-joined', room, polite, peer }         peer = { id, name }, or null: waiting
 *                      { type: 'call-peer', peer }                         someone joined your room
 *                      { type: 'call-left' }                               they left, or their tab closed
 *                      { type: 'call-signal', description?, candidate? }
 *                      { type: 'call-gesture', gesture }
 *                      { type: 'call-full', room }
 */
const { createHmac } = require('crypto');

const ROOM = /^[a-z0-9][a-z0-9-]{2,39}$/;
const SIZE = 2;
const GESTURES = ['both-hands-raised'];

function create() {
  const rooms = new Map(); // room → Map(ws → { id, name })
  const roomOf = new Map(); // ws → room

  const send = (ws, m) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(m)); };
  const others = (ws) => {
    const r = rooms.get(roomOf.get(ws));
    return r ? [...r.keys()].filter((x) => x !== ws) : [];
  };

  function leave(ws) {
    const room = roomOf.get(ws);
    if (!room) return;
    others(ws).forEach((o) => send(o, { type: 'call-left' }));
    roomOf.delete(ws);
    const r = rooms.get(room);
    r.delete(ws);
    if (!r.size) rooms.delete(room);
  }

  function join(ws, user, value) {
    const room = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!ROOM.test(room)) return;
    leave(ws);
    const r = rooms.get(room) || new Map();
    // full, but one of the two is this same login: that is their old socket (a dropped connection the ping sweep has
    // not closed yet, or a reloaded tab), so it makes way instead of locking them out of their own room
    if (r.size >= SIZE) {
      const stale = [...r.entries()].find(([o, info]) => o !== ws && info.id === user.id);
      if (stale) leave(stale[0]);
    }
    if (r.size >= SIZE) { send(ws, { type: 'call-full', room }); return; }
    const [other] = [...r.entries()];
    const me = { id: user.id, name: user.name || user.username };
    r.set(ws, me);
    rooms.set(room, r);
    roomOf.set(ws, room);
    send(ws, { type: 'call-joined', room, polite: Boolean(other), peer: other ? other[1] : null });
    if (other) send(other[0], { type: 'call-peer', peer: me });
  }

  // only the two fields WebRTC needs, so a tab cannot push anything else through to the other
  function signal(ws, m) {
    const out = { type: 'call-signal' };
    const d = m.description;
    if (d && typeof d === 'object' && ['offer', 'answer', 'rollback'].includes(d.type)) out.description = { type: d.type, sdp: String(d.sdp || '') };
    else if (m.candidate === null || (m.candidate && typeof m.candidate === 'object')) out.candidate = m.candidate;
    else return;
    others(ws).forEach((o) => send(o, out));
  }

  function gesture(ws, m) {
    if (GESTURES.includes(m.gesture)) others(ws).forEach((o) => send(o, { type: 'call-gesture', gesture: m.gesture }));
  }

  /** a message from a signed-in tab (user = { id, name, username }) */
  function message(ws, user, m) {
    if (m.type === 'call-join') join(ws, user, m.room);
    else if (m.type === 'call-signal') signal(ws, m);
    else if (m.type === 'call-gesture') gesture(ws, m);
    else if (m.type === 'call-leave') leave(ws);
  }

  return { message, leave, count: () => rooms.size };
}

/**
 * STUN / TURN servers for the browsers (GET /api/call/ice). STUN finds a direct path; on some networks (offices,
 * mobile data) there is none, and the video has to go through a TURN server (e.g. coturn):
 *   TURN_URLS        comma separated, e.g. turn:turn.example.com:3478,turns:turn.example.com:5349
 *   TURN_SECRET      coturn's static-auth-secret: each sign-in gets a password valid for 12 hours, or
 *   TURN_USERNAME / TURN_CREDENTIAL   one fixed login
 */
// an address without "stun:" / "turn:" / "turns:" makes the browser refuse the whole list (the call cannot start),
// so such entries are left out
const ICE_URL = /^(stun|turns?):[^\s]+$/i;
const urlList = (s) => String(s || '').split(',').map((u) => u.trim()).filter((u) => {
  if (u && !ICE_URL.test(u)) console.error(`Video calls: "${u}" is not a STUN / TURN address (it starts with stun:, turn: or turns:); left out.`);
  return u && ICE_URL.test(u);
});

function iceServers(env, userId, now = Date.now()) {
  const list = [{ urls: urlList(env.STUN_URLS || 'stun:stun.l.google.com:19302') }];
  const urls = urlList(env.TURN_URLS);
  if (!urls.length) return list;
  if (env.TURN_SECRET) {
    const username = `${Math.floor(now / 1000) + 12 * 3600}:${userId}`;
    list.push({ urls, username, credential: createHmac('sha1', env.TURN_SECRET).update(username).digest('base64') });
  } else if (env.TURN_USERNAME) list.push({ urls, username: env.TURN_USERNAME, credential: env.TURN_CREDENTIAL || '' });
  return list;
}

/**
 * Metered (metered.ca), a hosted TURN service: METERED_DOMAIN (e.g. yourapp.metered.live) and METERED_API_KEY (the
 * dashboard's "TURN credential" API key). Its API hands out the STUN / TURN servers with their logins; kept for an
 * hour, so a call does not wait on Metered each time. Without the two settings, or if Metered fails: [].
 */
function metered(env, fetchFn = globalThis.fetch) {
  let cache = { at: 0, list: [] };
  let pending = null;
  return async function get(now = Date.now()) {
    const domain = String(env.METERED_DOMAIN || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const key = String(env.METERED_API_KEY || '').trim();
    if (!domain || !key) return [];
    if (cache.list.length && now - cache.at < 60 * 60 * 1000) return cache.list;
    pending = pending || (async () => {
      try {
        const res = await fetchFn(`https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(5000) });
        const body = await res.json().catch(() => null);
        if (!res.ok || !Array.isArray(body)) throw new Error((body && body.error) || `HTTP ${res.status}`);
        const list = body.filter((s) => s && s.urls).map((s) => ({ urls: s.urls, ...(s.username ? { username: s.username, credential: s.credential } : {}) }));
        cache = { at: now, list };
      } catch (err) {
        console.error(`Video calls: Metered TURN servers could not be loaded (${err.message}); check METERED_DOMAIN and METERED_API_KEY.`);
      } finally { pending = null; }
      return cache.list; // the last good list, if any
    })();
    return pending;
  };
}

module.exports = { create, iceServers, metered, ROOM };
