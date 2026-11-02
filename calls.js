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
function iceServers(env, userId, now = Date.now()) {
  const list = [{ urls: (env.STUN_URLS || 'stun:stun.l.google.com:19302').split(',').map((u) => u.trim()).filter(Boolean) }];
  const urls = (env.TURN_URLS || '').split(',').map((u) => u.trim()).filter(Boolean);
  if (!urls.length) return list;
  if (env.TURN_SECRET) {
    const username = `${Math.floor(now / 1000) + 12 * 3600}:${userId}`;
    list.push({ urls, username, credential: createHmac('sha1', env.TURN_SECRET).update(username).digest('base64') });
  } else if (env.TURN_USERNAME) list.push({ urls, username: env.TURN_USERNAME, credential: env.TURN_CREDENTIAL || '' });
  return list;
}

module.exports = { create, iceServers, ROOM };
