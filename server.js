'use strict';
const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const db = require('./db');
const cloud = require('./cloud');
const auth = require('./auth');
const teams = require('./teams');
const presence = require('./presence');
const excel = require('./excel');
const journal = require('./journal');
const assist = require('./assist');
const formula = require('./public/formula');
const ExcelJS = require('exceljs');

const PORT = Number(process.env.PORT) || 4000;
const COLORS = ['slate', 'amber', 'sky', 'indigo', 'violet', 'pink', 'red', 'teal', 'green'];
const BUILT_IN_STATUSES = ['pending', 'complete']; // new issues start Pending; Complete = fixed
const DEVICES = ['app', 'web'];
const WIREFRAMES = ['form', 'list', 'dashboard', 'detail'];
const KINDS = ['screen', 'popup']; // popup = a dialog / bottom sheet shown over a screen
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const AREAS = ['frontend', 'backend', 'both']; // which side an issue is in
const ACCESS = Object.keys(auth.LEVELS);

const app = express();
app.use(express.json({ limit: '8mb' }));
// no-cache: the browser asks every time (a quick 304 when unchanged), so a new app.js / styles.css shows on the next load
app.use(express.static(path.join(__dirname, 'public'), { setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));

// Every API call except signing in needs a valid session; the signed-in user is req.user.
app.use('/api', (req, res, next) => {
  if (req.path === '/login') return next();
  const token = auth.readCookie(req, auth.COOKIE);
  if (!token) return res.status(401).json({ error: 'Please sign in' });
  db.query(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND NOT u.is_deleted`, [auth.hashToken(token)])
    .then(({ rows }) => {
      if (!rows[0]) return res.status(401).json({ error: 'Please sign in' });
      req.user = rows[0];
      next();
    })
    .catch(next);
});

// ---------------------------------------------------------------- helpers

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const text = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

function required(value, field) {
  if (!value) throw new HttpError(400, `${field} is required`);
  return value;
}

function oneOf(value, list, field) {
  if (!list.includes(value)) throw new HttpError(400, `Invalid ${field}`);
  return value;
}

// Assignees: an array of names (or one comma-separated string) → trimmed, unique, at most 10.
function people(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(list.map((x) => text(x, 60)).filter(Boolean))].slice(0, 10);
}

// An area drawn on a screen image: { x, y, w, h } as fractions (0–1) of the image, kept inside it.
function markBox(value) {
  const n = (k) => Math.round(Math.min(1, Math.max(0, Number(value && value[k]))) * 10000) / 10000;
  const b = { x: n('x'), y: n('y'), w: n('w'), h: n('h') };
  if (Object.values(b).some(Number.isNaN) || !b.w || !b.h) throw new HttpError(400, 'Invalid area');
  b.w = Math.min(b.w, 1 - b.x);
  b.h = Math.min(b.h, 1 - b.y);
  return b;
}

// ---------------------------------------------------------------- roles & permissions on issues
//
// Per app (project), its admins choose what Developers may do (products.dev_permissions):
//   create   add issues                      viewAll  see every issue of the app (else only their own)
//   status   move their issues Pending → In Progress → Release for Testing
//   assign   hand their issues to someone else   edit  change the text, priority, area and remarks of their issues
// A Developer only ever changes issues they own (comments.developer_id), never Verified / Complete / Reopened.
// Testers (and "Update tasks" logins) verify, close and reopen: any status, any issue. Admins (Full, Super admin):
// everything. Every rule is checked here, against the issue as stored; the screens only hide what isn't allowed.
const DEV_PERMISSIONS = { create: true, viewAll: true, status: true, assign: false, edit: true };
const devPermissions = (product) => ({ ...DEV_PERMISSIONS, ...((product && product.dev_permissions) || {}) });
const isAdmin = (user) => user.access === 'super' || user.access === 'full';
const isDeveloper = (user) => user.access === 'developer';
// where a Developer's work goes (and comes from: a reopened issue goes back into progress)
const DEV_TO = auth.DEVELOPER_STATUSES;
const DEV_FROM = [...DEV_TO, 'reopened'];

const productRow = (id) => live('products', id, '*');
// a name the issue's assignees use for this login
const namesOf = (u) => [u.name, u.username].filter(Boolean).map((n) => n.toLowerCase());
const mine = (user, issue) => issue.developer_id === user.id
  || (issue.assignees || []).some((n) => namesOf(user).includes(String(n).toLowerCase()));

// May this login see this issue at all? (a Developer without "view all" sees only their own)
const seesIssue = (user, issue, product) => !isDeveloper(user) || devPermissions(product).viewAll || mine(user, issue);

/** What this login may do to one issue → { status: ids it may move to (null = any), edit, assign } */
function issueRights(user, issue, product) {
  if (!isDeveloper(user)) return { status: null, edit: true, assign: true };
  const p = devPermissions(product);
  const owner = issue.developer_id === user.id;
  return {
    status: owner && p.status && DEV_FROM.includes(issue.status) ? DEV_TO : [],
    edit: owner && p.edit,
    assign: owner && p.assign,
  };
}
const NOT_YOURS = 'Only the developer this issue is assigned to can change it (or a tester or admin).';
function mayStatus(rights, from, to) {
  if (rights.status && !rights.status.includes(to)) {
    throw new HttpError(403, rights.status.length ? 'Developers move issues only to Pending, In Progress or Release for Testing. Testers verify and close them.' : NOT_YOURS);
  }
  if (rights.status && from && !DEV_FROM.includes(from)) throw new HttpError(403, 'Only a tester or admin can change a verified, closed or other issue.');
}

/**
 * The Developer to own an issue: the one picked (developerId; it must be a Developer login of this app), else among
 * the names assigned: the present owner when still named (keepId), else the first Developer named, else none.
 */
async function issueOwner(productId, developerId, names, keepId = null) {
  const { rows: devs } = await db.query(
    `SELECT id, name, username FROM users WHERE access = 'developer' AND NOT is_deleted AND (all_products OR $1 = ANY(product_ids))`, [productId]);
  if (developerId) {
    const d = devs.find((u) => u.id === developerId);
    if (!d) throw new HttpError(400, 'Pick a developer of this app');
    return d;
  }
  const named = (names || []).map((n) => devs.find((u) => namesOf(u).includes(String(n).toLowerCase()))).filter(Boolean);
  return named.find((u) => u.id === keepId) || named[0] || null;
}

// Issue status → the columns to save. Pending has no date (shown as today); any other status freezes the date it was set.
async function statusFields(status) {
  const { rows } = await db.query('SELECT id FROM statuses WHERE id = $1 AND NOT is_deleted', [status]);
  if (!rows[0]) throw new HttpError(400, 'Invalid status');
  return { status, status_date: status === 'pending' ? null : new Date(), resolved: status === 'complete' };
}

// Express 4 does not catch rejected promises — forward them to the error handler.
const route = (fn) => (req, res, next) => fn(req, res).catch(next);

async function one(sql, params) {
  const { rows } = await db.query(sql, params);
  if (!rows[0]) throw new HttpError(404, 'Not found');
  return rows[0];
}

/** UPDATE with a whitelisted set of columns, stamped with who changed it (updated_at is set by a trigger). */
async function update(table, id, fields, by) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  const set = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
  await db.query(`UPDATE ${table} SET ${set}, updated_by = $2 WHERE id = $1 AND NOT is_deleted`, [id, by, ...keys.map((k) => fields[k])]);
}

// A row that exists and is not deleted.
const live = (table, id, columns = 'id') => one(`SELECT ${columns} FROM ${table} WHERE id = $1 AND NOT is_deleted`, [id]);

// Nothing is ever removed from the database: deleting only sets is_deleted = true.
const softDelete = (table, id, by) => db.query(`UPDATE ${table} SET is_deleted = true, updated_by = $2 WHERE id = $1`, [id, by]);

// ---------------------------------------------------------------- permissions

function need(req, level) {
  if (!auth.atLeast(req.user, level)) throw new HttpError(403, 'Your login does not allow this. Ask an admin for access.');
}

// Product (app) that a row belongs to.
const PRODUCT_OF = {
  products: 'SELECT p.id AS product_id FROM products p WHERE p.id = $1 AND NOT p.is_deleted',
  modules: 'SELECT m.product_id FROM modules m WHERE m.id = $1 AND NOT m.is_deleted',
  flows: 'SELECT m.product_id FROM flows f JOIN modules m ON m.id = f.module_id WHERE f.id = $1 AND NOT f.is_deleted',
  screens: `SELECT m.product_id FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
            WHERE s.id = $1 AND NOT s.is_deleted`,
  comments: `SELECT m.product_id FROM comments c JOIN screens s ON s.id = c.screen_id JOIN flows f ON f.id = s.flow_id
             JOIN modules m ON m.id = f.module_id WHERE c.id = $1 AND NOT c.is_deleted`,
};

/** The user needs `level` and access to the row's app (other apps look like they don't exist). Returns the product id. */
async function allowed(req, table, id, level) {
  need(req, level);
  const { product_id: productId } = await one(PRODUCT_OF[table], [id]);
  if (!auth.seesProduct(req.user, productId)) throw new HttpError(404, 'Not found');
  return productId;
}

// ---------------------------------------------------------------- row → API shape (same JSON the front-end always used)

const SCREEN_SELECT = 'SELECT s.* FROM screens s';

// Who created / last changed a row and when (on every API object).
const audit = (r) => ({ createdAt: r.created_at, createdBy: r.created_by, updatedAt: r.updated_at, updatedBy: r.updated_by });

// teams: whether the app has a Teams webhook (the URL itself is only shown to super admins, in Sanity → Teams)
// version: the app's present version, from Sanity (see CURRENT_VERSION); only on the board
const toProduct = (r) => ({
  id: r.id, name: r.name, order: r.sort_order, teams: Boolean(r.teams_webhook), version: r.current_version || '',
  devPermissions: devPermissions(r), ...audit(r),
});
const toModule = (r) => ({ id: r.id, productId: r.product_id, name: r.name, order: r.sort_order, ...audit(r) });
const toFlow = (r) => ({
  id: r.id, moduleId: r.module_id, name: r.name, order: r.sort_order,
  parentFlowId: r.parent_flow_id, fromConditionId: r.from_condition_id, fromBranchId: r.from_branch_id,
  fromScreenId: r.from_screen_id,
  video: r.video_url || null,
  ...audit(r),
});
const toUser = (r) => ({
  id: r.id, username: r.username, name: r.name, access: r.access,
  allProducts: r.access === 'super' || r.all_products, productIds: r.product_ids,
  sanityTester: r.sanity_tester, teamsEmail: r.teams_email, ...audit(r),
});
const toStatus = (r) => ({ id: r.id, label: r.label, color: r.color, builtIn: BUILT_IN_STATUSES.includes(r.id), deleted: r.is_deleted, ...audit(r) });
const toComment = (r) => ({
  id: r.id, screenId: r.screen_id, text: r.text, priority: r.priority, area: r.area, developerId: r.developer_id || null,
  assignees: r.assignees, remarks: r.remarks, status: r.status, statusDate: r.status_date,
  resolved: r.status === 'complete', box: r.box || null, ...audit(r),
});

function toScreen(r) {
  if (r.type === 'condition') {
    return { id: r.id, flowId: r.flow_id, type: 'condition', name: r.name, branches: r.branches, order: r.sort_order, ...audit(r) };
  }
  return {
    id: r.id,
    flowId: r.flow_id,
    type: 'screen',
    name: r.name,
    page: r.page,
    kind: r.kind === 'popup' ? 'popup' : 'screen',
    action: r.action || '',
    device: r.device,
    wireframe: r.wireframe,
    image: r.image_url || null, // Cloudinary URL (contains a version, so replaced images are not cached)
    linkId: r.link_id,
    links: r.links || [], // areas on the image that open another screen
    order: r.sort_order,
    ...audit(r),
  };
}

const getScreen = async (id) => toScreen(await live('screens', id, '*'));

// ---------------------------------------------------------------- sign in / out

app.post('/api/login', route(async (req, res) => {
  const username = text(req.body.username, 40);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const key = `${req.ip}|${username.toLowerCase()}`;
  if (auth.throttled(key)) throw new HttpError(429, 'Too many tries. Please wait 15 minutes and try again.');
  const { rows } = await db.query('SELECT * FROM users WHERE lower(username) = lower($1) AND NOT is_deleted', [username]);
  if (!rows[0] || !(await auth.checkPassword(password, rows[0].password_hash))) {
    auth.failed(key);
    throw new HttpError(400, 'Wrong username or password');
  }
  auth.succeeded(key);
  const token = auth.newToken();
  await db.query(`INSERT INTO sessions (token_hash, user_id, expires_at, created_by, updated_by)
     VALUES ($1, $2, now() + interval '${auth.SESSION_DAYS} days', $2, $2)`, [auth.hashToken(token), rows[0].id]);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, token));
  res.json(toUser(rows[0]));
}));

app.post('/api/logout', route(async (req, res) => {
  await db.query('UPDATE sessions SET expires_at = now(), updated_by = $2 WHERE token_hash = $1',
    [auth.hashToken(auth.readCookie(req, auth.COOKIE)), req.user.id]);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, null));
  res.json({ ok: true });
}));

app.get('/api/me', (req, res) => res.json(toUser(req.user)));

// Microsoft sign-in for sending from your own Teams (direct messages, your channels); null when not set up
app.get('/api/teams/graph', (req, res) => res.json(teams.graph()));

// Your own Teams email (how people @mention and message you), filled in when you connect your Microsoft account.
// Only an empty one is filled: a super admin's choice in Admin stays.
app.put('/api/me/teams-email', route(async (req, res) => {
  const email = teamsEmail(req.body.email);
  if (!email) throw new HttpError(400, 'Teams email is required');
  if (!req.user.teams_email) await update('users', req.user.id, { teams_email: email.toLowerCase() }, req.user.id);
  res.json({ teamsEmail: req.user.teams_email || email.toLowerCase() });
}));

// ---------------------------------------------------------------- logins (admin dashboard, super admins only)

const USERNAME = /^[a-z0-9._-]{3,40}$/i;
const expireSessions = (userId, by) => db.query(
  'UPDATE sessions SET expires_at = now(), updated_by = $2 WHERE user_id = $1 AND expires_at > now()', [userId, by]);

// Only real, live products can be granted.
// The address Teams knows a person by (used to @mention them); empty = no mentions.
function teamsEmail(value) {
  const email = text(value, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Teams email does not look like an email address');
  return email;
}

async function productIds(value) {
  const ids = Array.isArray(value) ? value.filter((x) => typeof x === 'string') : [];
  const { rows } = await db.query('SELECT id FROM products WHERE id = ANY($1) AND NOT is_deleted', [ids]);
  return rows.map((r) => r.id);
}

function password(value) {
  if (typeof value !== 'string' || value.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  return value.slice(0, 200);
}

// who is online (presence.js), set once the server listens
let online = null;

// with when each login last signed in, whether it is signed in now, and whether it is online now (Admin page)
app.get('/api/users', route(async (req, res) => {
  need(req, 'super');
  const { rows } = await db.query(
    `SELECT u.*, (SELECT max(s.created_at) FROM sessions s WHERE s.user_id = u.id) AS last_sign_in,
            (SELECT count(*)::int FROM sessions s WHERE s.user_id = u.id AND s.expires_at > now()) AS active_sessions
     FROM users u WHERE NOT u.is_deleted ORDER BY u.created_at`);
  res.json(rows.map((r) => ({
    ...toUser(r), lastSignIn: r.last_sign_in, signedIn: r.active_sessions > 0,
    presence: online ? online.of(r.id) : { status: 'offline', lastSeen: null },
  })));
}));

// Sign a login out on every device (not you: that would be Sign out)
app.post('/api/users/:id/signout', route(async (req, res) => {
  need(req, 'super');
  const user = await live('users', req.params.id, '*');
  if (user.id === req.user.id) throw new HttpError(400, 'Use Sign out for your own login');
  await expireSessions(user.id, req.user.id);
  res.json({ ok: true });
}));

app.post('/api/users', route(async (req, res) => {
  need(req, 'super');
  const b = req.body;
  const username = text(b.username, 40);
  if (!USERNAME.test(username)) throw new HttpError(400, 'Username: 3–40 letters, numbers, dot, dash or underscore');
  const { rows: taken } = await db.query('SELECT id FROM users WHERE lower(username) = lower($1) AND NOT is_deleted', [username]);
  if (taken[0]) throw new HttpError(409, 'That username is already used');
  const { rows } = await db.query(
    `INSERT INTO users (id, username, name, password_hash, access, all_products, product_ids, sanity_tester, teams_email, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10) RETURNING *`,
    [randomUUID(), username, text(b.name, 80), await auth.hashPassword(password(b.password)),
      oneOf(b.access, ACCESS, 'access'), Boolean(b.allProducts), await productIds(b.productIds),
      Boolean(b.sanityTester), teamsEmail(b.teamsEmail), req.user.id]);
  res.status(201).json(toUser(rows[0]));
}));

app.patch('/api/users/:id', route(async (req, res) => {
  need(req, 'super');
  const user = await live('users', req.params.id, '*');
  const b = req.body;
  const fields = {};
  if (b.name !== undefined) fields.name = text(b.name, 80);
  if (b.access !== undefined) fields.access = oneOf(b.access, ACCESS, 'access');
  if (b.allProducts !== undefined) fields.all_products = Boolean(b.allProducts);
  if (b.productIds !== undefined) fields.product_ids = await productIds(b.productIds);
  if (b.sanityTester !== undefined) fields.sanity_tester = Boolean(b.sanityTester);
  if (b.teamsEmail !== undefined) fields.teams_email = teamsEmail(b.teamsEmail);
  if (b.password) fields.password_hash = await auth.hashPassword(password(b.password));
  if (user.id === req.user.id && fields.access && fields.access !== 'super') throw new HttpError(400, 'You cannot remove your own super admin access');
  await update('users', user.id, fields, req.user.id);
  // new password → everyone signed in as this user has to sign in again (except you, when it's your own)
  if (fields.password_hash) {
    await db.query('UPDATE sessions SET expires_at = now(), updated_by = $3 WHERE user_id = $1 AND expires_at > now() AND token_hash <> $2',
      [user.id, auth.hashToken(auth.readCookie(req, auth.COOKIE)), req.user.id]);
  }
  res.json(toUser(await live('users', user.id, '*')));
}));

app.delete('/api/users/:id', route(async (req, res) => {
  need(req, 'super');
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot delete your own login');
  await softDelete('users', req.params.id, req.user.id);
  await expireSessions(req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- board

// An app's present version: the one on its latest sanity day that has a version (set for today, or submitted)
const CURRENT_VERSION = `(SELECT r.version FROM sanity_runs r WHERE r.product_id = p.id AND r.version <> ''
  ORDER BY r.run_date DESC, r.updated_at DESC LIMIT 1)`;

// Everything a login can see: products → modules → flows (incl. branch paths) → screens → issues.
async function loadBoard(user) {
  const everything = user.access === 'super' || user.all_products;
  const seesIssues = auth.atLeast(user, 'edit'); // view-only logins see screens and videos, never issues
  const [products, modules, flows, screens, comments] = await Promise.all([
    db.query(`SELECT p.*, ${CURRENT_VERSION} AS current_version FROM products p
              WHERE NOT p.is_deleted ${everything ? '' : 'AND p.id = ANY($1)'} ORDER BY p.sort_order, p.created_at`,
      everything ? [] : [user.product_ids]),
    db.query('SELECT * FROM modules WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query('SELECT * FROM flows WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query(`${SCREEN_SELECT} WHERE NOT s.is_deleted ORDER BY s.sort_order, s.created_at`),
    seesIssues ? db.query('SELECT * FROM comments WHERE NOT is_deleted ORDER BY created_at') : { rows: [] },
  ]);
  // a Developer whose app doesn't let them see every issue gets only their own (here, so it never reaches the browser)
  const productOfScreen = new Map();
  if (isDeveloper(user)) {
    const moduleProduct = new Map(modules.rows.map((m) => [m.id, m.product_id]));
    const flowProduct = new Map(flows.rows.map((f) => [f.id, moduleProduct.get(f.module_id)]));
    screens.rows.forEach((x) => productOfScreen.set(x.id, flowProduct.get(x.flow_id)));
  }
  const productById = new Map(products.rows.map((p) => [p.id, p]));
  const commentsBy = {};
  comments.rows
    .filter((c) => !isDeveloper(user) || seesIssue(user, c, productById.get(productOfScreen.get(c.screen_id))))
    .forEach((c) => (commentsBy[c.screen_id] ||= []).push(toComment(c)));
  const screensBy = {};
  screens.rows.forEach((s) => (screensBy[s.flow_id] ||= []).push({ ...toScreen(s), comments: commentsBy[s.id] || [] }));
  // Path flows only show while their condition (in a shown flow) still has that branch, and screen paths while
  // their screen is in a shown flow; repeat for nested paths.
  let shownFlows = flows.rows;
  for (;;) {
    const ids = new Set(shownFlows.map((f) => f.id));
    const inShown = screens.rows.filter((x) => ids.has(x.flow_id));
    const branchesOf = new Map(inShown.filter((x) => x.type === 'condition').map((x) => [x.id, x.branches]));
    const plain = new Set(inShown.filter((x) => x.type !== 'condition').map((x) => x.id));
    const next = shownFlows.filter((f) => (f.from_screen_id ? plain.has(f.from_screen_id) : !f.from_condition_id
      || (branchesOf.has(f.from_condition_id) && branchesOf.get(f.from_condition_id).some((b) => b.id === f.from_branch_id))));
    if (next.length === shownFlows.length) break;
    shownFlows = next;
  }
  const flowsBy = {};
  shownFlows.forEach((f) => (flowsBy[f.module_id] ||= []).push({ ...toFlow(f), screens: screensBy[f.id] || [] }));
  const modulesBy = {};
  modules.rows.forEach((m) => (modulesBy[m.product_id] ||= []).push({ ...toModule(m), flows: flowsBy[m.id] || [] }));
  const board = products.rows.map((p) => ({ ...toProduct(p), modules: modulesBy[p.id] || [] }));

  // A branch pointing at a deleted screen shows as unset (the stored target stays until the condition is edited).
  const shown = board.flatMap((p) => p.modules).flatMap((m) => m.flows).flatMap((f) => f.screens);
  const visible = new Set(shown.map((s) => s.id));
  shown.filter((s) => s.type === 'condition').forEach((c) => {
    c.branches = c.branches.map((b) => (b.targetId && !visible.has(b.targetId) ? { ...b, targetId: null } : b));
  });
  // Navigation links to a deleted screen are hidden the same way.
  shown.filter((s) => s.links).forEach((s) => { s.links = s.links.filter((l) => visible.has(l.targetId)); });
  return board;
}

app.get('/api/board', route(async (req, res) => res.json(await loadBoard(req.user))));

// ---------------------------------------------------------------- Excel download of every task the login can see

// Flows in reading order with their number: 1, 1.1 (a branch or screen path), 1.1.1 …, 2 …
function numberedFlows(module) {
  const out = [];
  const pathsAt = (s) => module.flows.filter((f) => (s.type === 'condition'
    ? s.branches.some((b) => f.fromConditionId === s.id && f.fromBranchId === b.id)
    : f.fromScreenId === s.id));
  const walk = (flow, no) => {
    out.push({ flow, no });
    let k = 0;
    flow.screens.forEach((s) => {
      const paths = pathsAt(s);
      // a condition's paths follow its branch order
      if (s.type === 'condition') paths.sort((a, b) => s.branches.findIndex((x) => x.id === a.fromBranchId) - s.branches.findIndex((x) => x.id === b.fromBranchId));
      paths.forEach((path) => walk(path, `${no}.${(k += 1)}`));
    });
  };
  module.flows.filter((f) => !f.parentFlowId).forEach((f, i) => walk(f, String(i + 1)));
  return out;
}

app.get('/api/export', route(async (req, res) => {
  const [board, { rows: tags }] = await Promise.all([loadBoard(req.user), db.query('SELECT id, label FROM statuses')]);
  const statusName = Object.fromEntries(tags.map((t) => [t.id, t.label]));
  const PRIORITY = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };
  const AREA = { frontend: 'Frontend', backend: 'Backend', both: 'Frontend + Backend' };
  const day = (d) => (d ? new Date(d) : null);

  const book = new ExcelJS.Workbook();
  book.creator = 'FlowTrace';
  const seesIssues = auth.atLeast(req.user, 'edit');
  const issues = book.addWorksheet('Issues', { views: [{ state: 'frozen', ySplit: 1 }] });
  issues.columns = [
    { header: 'App', key: 'app', width: 14 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Flow no.', key: 'no', width: 8 }, { header: 'Flow', key: 'flow', width: 26 },
    { header: 'Screen', key: 'screen', width: 22 }, { header: 'Page', key: 'page', width: 20 },
    { header: 'Issue', key: 'text', width: 50 }, { header: 'Priority', key: 'priority', width: 10 }, { header: 'Area', key: 'area', width: 18 },
    { header: 'Status', key: 'status', width: 18 }, { header: 'Status date', key: 'statusDate', width: 13, style: { numFmt: 'dd mmm yyyy' } },
    { header: 'Assigned to', key: 'assignees', width: 24 }, { header: 'Remarks', key: 'remarks', width: 36 },
    { header: 'Added on', key: 'createdAt', width: 13, style: { numFmt: 'dd mmm yyyy' } },
  ];
  const screens = book.addWorksheet('Screens', { views: [{ state: 'frozen', ySplit: 1 }] });
  screens.columns = [
    { header: 'App', key: 'app', width: 14 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Flow no.', key: 'no', width: 8 }, { header: 'Flow', key: 'flow', width: 26 },
    { header: 'Step', key: 'step', width: 6 }, { header: 'Screen', key: 'screen', width: 24 },
    { header: 'Page', key: 'page', width: 20 }, { header: 'Type', key: 'kind', width: 8 },
    { header: 'Opens on', key: 'action', width: 24 }, { header: 'Platform', key: 'device', width: 9 },
    ...(seesIssues ? [{ header: 'Open issues', key: 'open', width: 11 }, { header: 'Total issues', key: 'total', width: 11 }] : []),
  ];

  board.forEach((p) => p.modules.forEach((m) => numberedFlows(m).forEach(({ flow, no }) => {
    flow.screens.filter((s) => s.type !== 'condition').forEach((s, i) => {
      const base = { app: p.name, module: m.name, no, flow: flow.name, screen: s.name, page: s.page };
      screens.addRow({ ...base, step: i + 1, kind: s.kind === 'popup' ? 'Popup' : 'Screen', action: s.action, device: s.device === 'web' ? 'Web' : 'App',
        open: s.comments.filter((c) => !c.resolved).length, total: s.comments.length });
      s.comments.forEach((c) => issues.addRow({
        ...base, text: c.text, priority: PRIORITY[c.priority] || c.priority, area: AREA[c.area] || '', status: statusName[c.status] || c.status,
        statusDate: day(c.status === 'pending' ? null : c.statusDate), assignees: c.assignees.join(', '),
        remarks: c.remarks, createdAt: day(c.createdAt),
      }));
    });
  })));

  [issues, screens].forEach((sheet) => {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  });
  issues.getColumn('text').alignment = { wrapText: true, vertical: 'top' };
  issues.getColumn('remarks').alignment = { wrapText: true, vertical: 'top' };
  if (!seesIssues) book.removeWorksheet(issues.id);

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="flowtrace-${stamp}.xlsx"`);
  await book.xlsx.write(res);
  res.end();
}));

// ---------------------------------------------------------------- status tags

// Status tags of issues. Deleted ones are returned too (flagged) so issues still on one can show its name.
app.get('/api/statuses', route(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM statuses ORDER BY sort_order, created_at');
  res.json(rows.map(toStatus));
}));

app.post('/api/statuses', route(async (req, res) => {
  need(req, 'super');
  const label = required(text(req.body.label, 40), 'Name');
  const color = COLORS.includes(req.body.color) ? req.body.color : 'slate';
  const { rows } = await db.query(
    'INSERT INTO statuses (id, label, color, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
    [randomUUID(), label, color, Date.now(), req.user.id]);
  res.status(201).json(toStatus(rows[0]));
}));

app.patch('/api/statuses/:id', route(async (req, res) => {
  need(req, 'super');
  await live('statuses', req.params.id);
  const fields = {};
  if (req.body.label !== undefined) fields.label = required(text(req.body.label, 40), 'Name');
  if (req.body.color !== undefined) fields.color = oneOf(req.body.color, COLORS, 'color');
  await update('statuses', req.params.id, fields, req.user.id);
  res.json(toStatus(await live('statuses', req.params.id, '*')));
}));

// Issues already on a removed status keep it until someone picks another one.
app.delete('/api/statuses/:id', route(async (req, res) => {
  need(req, 'super');
  if (BUILT_IN_STATUSES.includes(req.params.id)) throw new HttpError(400, 'Pending and Complete cannot be removed');
  await softDelete('statuses', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- products

app.post('/api/products', route(async (req, res) => {
  need(req, 'super');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO products (id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $4) RETURNING *',
    [randomUUID(), name, Date.now(), req.user.id]);
  res.status(201).json(toProduct(rows[0]));
}));

app.patch('/api/products/:id', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'super');
  const name = required(text(req.body.name), 'Name');
  res.json(toProduct(await one('UPDATE products SET name = $2, updated_by = $3 WHERE id = $1 AND NOT is_deleted RETURNING *',
    [req.params.id, name, req.user.id])));
}));

app.delete('/api/products/:id', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'super');
  await softDelete('products', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- modules

app.post('/api/products/:id/modules', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'developer');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO modules (id, product_id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now(), req.user.id]);
  res.status(201).json(toModule(rows[0]));
}));

app.patch('/api/modules/:id', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'developer');
  const name = required(text(req.body.name), 'Name');
  res.json(toModule(await one('UPDATE modules SET name = $2, updated_by = $3 WHERE id = $1 AND NOT is_deleted RETURNING *',
    [req.params.id, name, req.user.id])));
}));

app.delete('/api/modules/:id', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'developer');
  await softDelete('modules', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- flows

app.post('/api/modules/:id/flows', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'developer');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO flows (id, module_id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now(), req.user.id]);
  res.status(201).json(toFlow(rows[0]));
}));

// Flows are numbered in this order (1, 2, 3 …); the move up / down buttons save it.
app.put('/api/modules/:id/flow-order', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'full');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  await db.tx(async (client) => {
    for (const [index, id] of ids.entries()) {
      await client.query('UPDATE flows SET sort_order = $2, updated_by = $4 WHERE id = $3 AND module_id = $1 AND NOT is_deleted',
        [req.params.id, index, id, req.user.id]);
    }
  });
  res.json({ ok: true });
}));

app.patch('/api/flows/:id', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'developer');
  const name = required(text(req.body.name), 'Name');
  res.json(toFlow(await one('UPDATE flows SET name = $2, updated_by = $3 WHERE id = $1 AND NOT is_deleted RETURNING *',
    [req.params.id, name, req.user.id])));
}));

// Drag & drop: save the new card order of a flow (cards may come from another flow).
app.put('/api/flows/:id/order', route(async (req, res) => {
  const productId = await allowed(req, 'flows', req.params.id, 'developer');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  const { rows } = await db.query(
    `SELECT count(*)::int AS n FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
     WHERE s.id = ANY($1) AND m.product_id <> $2`, [ids, productId]);
  if (rows[0].n) throw new HttpError(400, 'Screens can only be moved within the same app');
  await db.tx(async (client) => {
    for (const [index, id] of ids.entries()) {
      await client.query('UPDATE screens SET flow_id = $1, sort_order = $2, updated_by = $4 WHERE id = $3 AND NOT is_deleted',
        [req.params.id, index, id, req.user.id]);
    }
  });
  res.json({ ok: true });
}));

app.delete('/api/flows/:id', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'developer');
  await softDelete('flows', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- flow videos (Cloudinary), raw file body up to 100 MB

app.post('/api/flows/:id/video', express.raw({ type: 'video/*', limit: '100mb' }), route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  if (!cloud.configured()) throw new HttpError(503, 'Video storage is not set up. Add the Cloudinary keys to .env and restart.');
  if (!Buffer.isBuffer(req.body) || !req.body.length) throw new HttpError(400, 'Please upload a video file (MP4, MOV or WEBM)');
  const { url, publicId } = await cloud.uploadVideo(req.body, req.params.id);
  const { rows } = await db.query('UPDATE flows SET video_url = $2, video_public_id = $3, updated_by = $4 WHERE id = $1 RETURNING *',
    [req.params.id, url, publicId, req.user.id]);
  res.json(toFlow(rows[0]));
}));

app.delete('/api/flows/:id/video', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  const flow = await live('flows', req.params.id, 'video_public_id');
  const { rows } = await db.query('UPDATE flows SET video_url = NULL, video_public_id = NULL, updated_by = $2 WHERE id = $1 RETURNING *',
    [req.params.id, req.user.id]);
  await cloud.remove([flow.video_public_id], 'video');
  res.json(toFlow(rows[0]));
}));

// ---------------------------------------------------------------- screens + conditions

// type "condition" = a decision step, e.g. "Mandate status" → Success / Pending / Else, each leading to a screen
app.post('/api/flows/:id/screens', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'developer');
  const id = randomUUID();
  if (req.body.type === 'condition') {
    const name = required(text(req.body.name), 'Condition name');
    const branches = ['Success', 'Pending', 'Else'].map((label) => ({ id: randomUUID(), label, targetId: null }));
    await db.query(
      `INSERT INTO screens (id, flow_id, type, name, branches, sort_order, created_by, updated_by)
       VALUES ($1, $2, 'condition', $3, $4, $5, $6, $6)`,
      [id, req.params.id, name, JSON.stringify(branches), Date.now(), req.user.id]);
  } else {
    const name = required(text(req.body.name), 'Screen name');
    const device = DEVICES.includes(req.body.device) ? req.body.device : 'app';
    const kind = KINDS.includes(req.body.kind) ? req.body.kind : 'screen';
    await db.query(
      `INSERT INTO screens (id, flow_id, name, page, kind, action, device, sort_order, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
      [id, req.params.id, name, text(req.body.page), kind, text(req.body.action), device, Date.now(), req.user.id]);
  }
  res.status(201).json(await getScreen(id));
}));

app.patch('/api/screens/:id', route(async (req, res) => {
  const productId = await allowed(req, 'screens', req.params.id, 'developer');
  const screen = await live('screens', req.params.id, '*');
  const b = req.body;
  const fields = {};
  if (b.name !== undefined) fields.name = required(text(b.name), 'Name');
  if (b.page !== undefined) fields.page = text(b.page);
  if (b.kind !== undefined) fields.kind = oneOf(b.kind, KINDS, 'kind');
  if (b.action !== undefined) fields.action = text(b.action);
  if (b.device !== undefined) fields.device = oneOf(b.device, DEVICES, 'device');
  if (b.wireframe !== undefined) fields.wireframe = oneOf(b.wireframe, WIREFRAMES, 'wireframe');

  if (b.branches !== undefined) {
    if (screen.type !== 'condition' || !Array.isArray(b.branches)) throw new HttpError(400, 'Invalid branches');
    const wanted = b.branches.map((x) => x && x.targetId).filter((x) => typeof x === 'string');
    const { rows } = await db.query(
      `SELECT s.id FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
       WHERE s.id = ANY($1) AND s.type <> 'condition' AND s.id <> $2 AND NOT s.is_deleted AND m.product_id = $3`,
      [wanted, screen.id, productId]);
    const valid = new Set(rows.map((r) => r.id));
    fields.branches = JSON.stringify(b.branches.slice(0, 12).map((x) => ({
      id: typeof x.id === 'string' && x.id ? x.id.slice(0, 64) : randomUUID(),
      label: text(x.label, 60),
      targetId: valid.has(x.targetId) ? x.targetId : null,
    })));
  }

  // Navigation links: an area of the image that opens another screen of the same app
  if (b.links !== undefined) {
    if (screen.type === 'condition' || !Array.isArray(b.links)) throw new HttpError(400, 'Invalid links');
    const wanted = b.links.map((x) => x && x.targetId).filter((x) => typeof x === 'string');
    const { rows } = await db.query(
      `SELECT s.id FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
       WHERE s.id = ANY($1) AND s.type <> 'condition' AND s.id <> $2 AND NOT s.is_deleted AND m.product_id = $3`,
      [wanted, screen.id, productId]);
    const valid = new Set(rows.map((r) => r.id));
    const links = b.links.slice(0, 50).filter((x) => valid.has(x.targetId));
    if (links.length < b.links.length) throw new HttpError(400, 'Pick a screen in this app to go to');
    fields.links = JSON.stringify(links.map((x) => ({
      id: typeof x.id === 'string' && x.id ? x.id.slice(0, 64) : randomUUID(),
      box: markBox(x.box),
      targetId: x.targetId,
    })));
  }

  await update('screens', screen.id, fields, req.user.id);
  res.json(await getScreen(screen.id));
}));

// Extend one branch of a condition into its own path flow, named after the branch ("Sign Up › Success").
app.post('/api/screens/:id/branches/:branchId/path', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'developer');
  const cond = await live('screens', req.params.id, '*');
  const branch = cond.type === 'condition' && cond.branches.find((b) => b.id === req.params.branchId);
  if (!branch) throw new HttpError(404, 'Not found');
  const flow = await live('flows', cond.flow_id, '*');
  const name = text(req.body.name) || `${flow.name} › ${branch.label || 'Path'}`;
  const { rows } = await db.query(
    `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_condition_id, from_branch_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING *`,
    [randomUUID(), flow.module_id, name, Date.now(), flow.id, cond.id, branch.id, req.user.id]);
  res.status(201).json(toFlow(rows[0]));
}));

// Start a new flow from a plain screen, e.g. screens 1–3 are shared and a second journey continues from screen 4.
app.post('/api/screens/:id/extend', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'developer');
  const screen = await live('screens', req.params.id, '*');
  if (screen.type === 'condition') throw new HttpError(400, 'Use Extend path on a branch of the condition');
  const flow = await live('flows', screen.flow_id, '*');
  const name = text(req.body.name) || `${flow.name} › ${screen.name}`;
  const { rows } = await db.query(
    `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_screen_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *`,
    [randomUUID(), flow.module_id, name, Date.now(), flow.id, screen.id, req.user.id]);
  res.status(201).json(toFlow(rows[0]));
}));

// ---------------------------------------------------------------- flow sketch: steps drawn on the canvas, created in one go
//
// steps: [{ key, type: 'screen' | 'popup' | 'condition', name,
//           branches: [{ label, target: <key of a screen>, path: { steps } }],   (conditions)
//           extends: [{ name, steps }] }]                                         (screens: new flows from this screen)
// A branch with a path points at the path's first screen. Everything is created in one transaction.
const SKETCH_MAX = 300;
const DEFAULT_BRANCHES = ['Success', 'Pending', 'Else'];

async function buildSketch(client, req, root, steps) {
  if (!Array.isArray(steps) || !steps.length) throw new HttpError(400, 'Draw at least one screen');
  const made = new Map(); // key → { id, type }
  const conditions = []; // [{ id, branches }]: targets are set once every step exists
  let count = 0;
  let order = Date.now();
  const insertFlow = async (parent, name, from) => {
    const { rows } = await client.query(
      `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_condition_id, from_branch_id, from_screen_id, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) RETURNING *`,
      [randomUUID(), parent.module_id, required(text(name), 'Flow name'), (order += 1), parent.id,
        from.conditionId || null, from.branchId || null, from.screenId || null, req.user.id]);
    return rows[0];
  };
  // a lane's steps, in order; returns its first step
  const lane = async (flow, list, depth) => {
    if (!Array.isArray(list) || !list.length || depth > 12) throw new HttpError(400, 'Invalid sketch');
    let first = null;
    for (const step of list) {
      if (!step || typeof step !== 'object') throw new HttpError(400, 'Invalid sketch');
      const type = step.type === 'condition' ? 'condition' : 'screen';
      const key = text(step.key, 64);
      if (step.existingId) {
        if (key) made.set(key, { id: step.existingId, type });
        if (!first) first = { id: step.existingId, type };
        for (const ext of Array.isArray(step.extends) ? step.extends : []) {
          const path = await insertFlow(flow, text(ext && ext.name) || `${flow.name} › ${step.name}`, { screenId: step.existingId });
          await lane(path, ext.steps, depth + 1);
        }
        continue;
      }
      if ((count += 1) > SKETCH_MAX) throw new HttpError(400, `A sketch can create up to ${SKETCH_MAX} steps`);
      const id = randomUUID();
      if (key) made.set(key, { id, type });
      if (!first) first = { id, type };
      if (type === 'condition') {
        const name = required(text(step.name), 'Condition name');
        const drawn = Array.isArray(step.branches) ? step.branches.slice(0, 12) : [];
        const branches = (drawn.length ? drawn : DEFAULT_BRANCHES.map((label) => ({ label })))
          .map((b) => ({ id: randomUUID(), label: text(b && b.label, 60), target: text(b && b.target, 64), path: b && b.path }));
        await client.query(
          `INSERT INTO screens (id, flow_id, type, name, branches, sort_order, created_by, updated_by)
           VALUES ($1, $2, 'condition', $3, $4, $5, $6, $6)`,
          [id, flow.id, name, JSON.stringify(branches.map((b) => ({ id: b.id, label: b.label, targetId: null }))), (order += 1), req.user.id]);
        conditions.push({ id, branches });
        for (const b of branches) {
          if (!b.path) continue;
          const path = await insertFlow(flow, `${flow.name} › ${b.label || 'Path'}`, { conditionId: id, branchId: b.id });
          b.first = await lane(path, b.path.steps, depth + 1);
        }
      } else {
        const name = required(text(step.name), 'Screen name');
        await client.query(
          `INSERT INTO screens (id, flow_id, name, kind, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6)`,
          [id, flow.id, name, step.type === 'popup' ? 'popup' : 'screen', (order += 1), req.user.id]);
        for (const ext of Array.isArray(step.extends) ? step.extends : []) {
          const path = await insertFlow(flow, text(ext && ext.name) || `${flow.name} › ${name}`, { screenId: id });
          await lane(path, ext.steps, depth + 1);
        }
      }
    }
    return first;
  };
  await lane(root, steps, 0);
  // branch targets: a drawn screen, else the first screen of the branch's path (conditions can't be targets)
  for (const c of conditions) {
    const branches = c.branches.map((b) => {
      const to = (b.target && made.get(b.target)) || b.first;
      return { id: b.id, label: b.label, targetId: to && to.type !== 'condition' ? to.id : null };
    });
    await client.query('UPDATE screens SET branches = $2 WHERE id = $1', [c.id, JSON.stringify(branches)]);
  }
  return count;
}

// A sketch as a new flow of the module
app.post('/api/modules/:id/sketch', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'developer');
  const name = required(text(req.body.name), 'Flow name');
  const flow = await db.tx(async (client) => {
    const { rows } = await client.query(
      'INSERT INTO flows (id, module_id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
      [randomUUID(), req.params.id, name, Date.now(), req.user.id]);
    await buildSketch(client, req, rows[0], req.body.steps);
    return rows[0];
  });
  res.status(201).json(toFlow(flow));
}));

// A sketch added to the end of a flow
app.post('/api/flows/:id/sketch', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'developer');
  const flow = await live('flows', req.params.id, '*');
  await db.tx((client) => buildSketch(client, req, flow, req.body.steps));
  res.status(201).json(toFlow(flow));
}));

// Deleting a screen keeps its row, image and issues (only flagged is_deleted).
// Move a screen path's start (its "L" arrow) onto another screen of the same module
app.put('/api/flows/:id/from-screen', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  const flow = await live('flows', req.params.id, '*');
  if (!flow.from_screen_id) throw new HttpError(400, 'Only a flow extended from a screen can be moved');
  const screen = await live('screens', required(text(req.body.screenId), 'Screen'), '*');
  if (screen.type === 'condition') throw new HttpError(400, 'Pick a screen, not a condition');
  const from = await live('flows', screen.flow_id, '*');
  if (from.module_id !== flow.module_id) throw new HttpError(400, 'Pick a screen in the same module');
  // the new start can't sit inside this flow or any path that branches off it
  const { rows } = await db.query(
    `WITH RECURSIVE sub(id) AS (
       SELECT $1::text
       UNION
       SELECT f.id FROM flows f JOIN screens s ON s.id IN (f.from_screen_id, f.from_condition_id) JOIN sub ON s.flow_id = sub.id
       WHERE NOT f.is_deleted AND NOT s.is_deleted)
     SELECT 1 FROM sub WHERE id = $2`, [flow.id, from.id]);
  if (rows.length) throw new HttpError(400, 'A flow cannot start from one of its own screens');
  res.json(toFlow(await one('UPDATE flows SET from_screen_id = $2, parent_flow_id = $3, updated_by = $4 WHERE id = $1 RETURNING *',
    [flow.id, screen.id, from.id, req.user.id])));
}));

app.delete('/api/screens/:id', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'developer');
  await softDelete('screens', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- screen images (stored in Cloudinary)

app.post('/api/screens/:id/image', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'developer');
  if (!cloud.configured()) throw new HttpError(503, 'Image storage is not set up. Add the Cloudinary keys to .env and restart.');
  if (!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(req.body.dataUrl || '')) {
    throw new HttpError(400, 'Please upload a PNG, JPG, WEBP or GIF image');
  }
  const { url, publicId } = await cloud.upload(req.body.dataUrl, req.params.id);
  await db.query('UPDATE screens SET image_url = $2, image_public_id = $3, updated_by = $4 WHERE id = $1', [req.params.id, url, publicId, req.user.id]);
  res.json(await getScreen(req.params.id));
}));

app.delete('/api/screens/:id/image', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'developer');
  const screen = await live('screens', req.params.id, 'image_public_id');
  await db.query('UPDATE screens SET image_url = NULL, image_public_id = NULL, updated_by = $2 WHERE id = $1', [req.params.id, req.user.id]);
  await cloud.remove([screen.image_public_id]);
  res.json(await getScreen(req.params.id));
}));

// ---------------------------------------------------------------- copy a screen into other flows

// Each copy is independent: its own image and issues.
// Copies share a link_id so the UI can show where else the screen is used.
// One screen copied into a flow (shares link_id with the source). Returns the new id.
async function copyScreenRow(client, source, flowId, sortOrder, withIssues, by) {
  const linkId = source.link_id || source.id;
  if (!source.link_id) {
    await client.query('UPDATE screens SET link_id = $2, updated_by = $3 WHERE id = $1', [source.id, linkId, by]);
    source.link_id = linkId;
  }
  const id = randomUUID();
  await client.query(
    `INSERT INTO screens (id, flow_id, name, page, kind, action, device, wireframe, link_id, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
    [id, flowId, source.name, source.page, source.kind, source.action, source.device, source.wireframe, linkId, sortOrder, by]);
  if (withIssues) {
    await client.query(
      `INSERT INTO comments (id, screen_id, text, priority, area, assignees, remarks, status, status_date, created_by, updated_by)
       SELECT gen_random_uuid()::text, $1, text, priority, area, assignees, remarks, status, status_date, $3, $3
       FROM comments WHERE screen_id = $2 AND NOT resolved AND NOT is_deleted`,
      [id, source.id, by]);
  }
  return id;
}

/**
 * A condition copied into a flow together with every branch path (and the paths inside those paths).
 * ctx.map: old screen id → new id (to re-point branch targets), ctx.images: [{ id, url }] to copy afterwards,
 * ctx.conditions: new conditions whose branch targets are fixed once everything is copied.
 */
async function copyConditionRow(client, cond, flowId, sortOrder, ctx) {
  const id = randomUUID();
  const branches = cond.branches.map((b) => ({ ...b, id: randomUUID(), oldId: b.id }));
  await client.query(
    `INSERT INTO screens (id, flow_id, type, name, branches, sort_order, created_by, updated_by)
     VALUES ($1, $2, 'condition', $3, $4, $5, $6, $6)`,
    [id, flowId, cond.name, JSON.stringify(branches.map(({ oldId, ...b }) => b)), sortOrder, ctx.by]);
  ctx.map.set(cond.id, id);
  ctx.conditions.push({ id, branches });

  const { rows: flowRow } = await client.query('SELECT module_id, name FROM flows WHERE id = $1', [flowId]);
  const { rows: fromRow } = await client.query('SELECT name FROM flows WHERE id = $1', [cond.flow_id]);
  // "Sign Up › Success" copied into "Add Money" becomes "Add Money › Success"
  const rename = (name) => (name.startsWith(`${fromRow[0].name} ›`) ? flowRow[0].name + name.slice(fromRow[0].name.length) : name);
  for (const b of branches) {
    const { rows: paths } = await client.query(
      'SELECT * FROM flows WHERE from_condition_id = $1 AND from_branch_id = $2 AND NOT is_deleted ORDER BY sort_order, created_at',
      [cond.id, b.oldId]);
    for (const [i, path] of paths.entries()) {
      const pathId = randomUUID();
      await client.query(
        `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_condition_id, from_branch_id, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [pathId, flowRow[0].module_id, rename(path.name), Date.now() + i, flowId, id, b.id, ctx.by]);
      const { rows: steps } = await client.query(
        'SELECT * FROM screens WHERE flow_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [path.id]);
      for (const [j, step] of steps.entries()) {
        if (step.type === 'condition') await copyConditionRow(client, step, pathId, j, ctx);
        else {
          const copyId = await copyScreenRow(client, step, pathId, j, ctx.withIssues, ctx.by);
          ctx.map.set(step.id, copyId);
          if (step.image_url) ctx.images.push({ id: copyId, url: step.image_url });
        }
      }
    }
  }
  return id;
}

// each copy gets its own Cloudinary image, so replacing one never changes the other
async function copyImages(images, by) {
  if (!images.length || !cloud.configured()) return;
  await Promise.all(images.map(async ({ id, url }) => {
    try {
      const up = await cloud.upload(url, id);
      await db.query('UPDATE screens SET image_url = $2, image_public_id = $3, updated_by = $4 WHERE id = $1', [id, up.url, up.publicId, by]);
    } catch (err) {
      console.error(`Copying image for screen ${id} failed:`, err.message);
    }
  }));
}

// A condition is copied with its branches and every branch path (screens, nested conditions); targets inside
// the copied paths are re-pointed to the copies, other targets are cleared.
app.post('/api/screens/:id/copy', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'full');
  const source = await live('screens', req.params.id, '*');
  const flowIds = [...new Set(Array.isArray(req.body.flowIds) ? req.body.flowIds.filter((x) => typeof x === 'string') : [])];
  if (!flowIds.length) throw new HttpError(400, 'Choose at least one flow');
  const { rows: found } = await db.query(
    'SELECT f.id, m.product_id FROM flows f JOIN modules m ON m.id = f.module_id WHERE f.id = ANY($1) AND NOT f.is_deleted', [flowIds]);
  if (found.length !== flowIds.length || !found.every((f) => auth.seesProduct(req.user, f.product_id))) throw new HttpError(404, 'Not found');

  const withIssues = Boolean(req.body.withIssues);
  const images = [];
  const ids = await db.tx(async (client) => {
    const created = [];
    for (const [i, flowId] of flowIds.entries()) {
      if (source.type === 'condition') {
        const ctx = { map: new Map(), images, conditions: [], withIssues, by: req.user.id };
        created.push(await copyConditionRow(client, source, flowId, Date.now() + i, ctx));
        for (const c of ctx.conditions) {
          const branches = c.branches.map(({ oldId, ...b }) => ({ ...b, targetId: ctx.map.get(b.targetId) || null }));
          await client.query('UPDATE screens SET branches = $2, updated_by = $3 WHERE id = $1', [c.id, JSON.stringify(branches), req.user.id]);
        }
      } else {
        const id = await copyScreenRow(client, source, flowId, Date.now() + i, withIssues, req.user.id);
        if (source.image_url) images.push({ id, url: source.image_url });
        created.push(id);
      }
    }
    return created;
  });

  await copyImages(images, req.user.id);
  res.status(201).json(await Promise.all(ids.map(getScreen)));
}));

// ---------------------------------------------------------------- issues

// A new issue. Developers need "create"; what they add is theirs unless they may assign it to someone else.
app.post('/api/screens/:id/comments', route(async (req, res) => {
  const productId = await allowed(req, 'screens', req.params.id, 'edit');
  const product = await productRow(productId);
  const dev = isDeveloper(req.user);
  if (dev && !devPermissions(product).create) throw new HttpError(403, 'Developers cannot add issues in this app. An admin can allow it in Project settings.');
  if (dev) mayStatus({ status: DEV_TO }, null, req.body.status || 'pending');
  const s = await statusFields(req.body.status || 'pending');
  let names = people(req.body.assignees);
  let owner = await issueOwner(productId, text(req.body.developerId || '', 80), names);
  if (dev && (!owner || owner.id !== req.user.id) && !devPermissions(product).assign) owner = { id: req.user.id, name: req.user.name, username: req.user.username };
  if (owner && !names.some((n) => namesOf(owner).includes(n.toLowerCase()))) names = [personName(owner), ...names].slice(0, 10);
  const { rows } = await db.query(
    `INSERT INTO comments (id, screen_id, text, priority, assignees, remarks, status, status_date, resolved, created_by, updated_by, area, box, developer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $13) RETURNING *`,
    [
      randomUUID(),
      req.params.id,
      required(text(req.body.text, 1000), 'Issue'),
      PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium',
      names,
      text(req.body.remarks, 1000),
      s.status, s.status_date, s.resolved,
      req.user.id,
      AREAS.includes(req.body.area) ? req.body.area : 'frontend',
      req.body.box ? JSON.stringify(markBox(req.body.box)) : null, // area marked on the screen image
      owner ? owner.id : null,
    ]);
  const notify = rows[0].assignees.length ? await notifyOf(req, productId, rows[0].id, { added: rows[0].assignees }) : undefined;
  res.status(201).json({ ...toComment(rows[0]), notify });
}));

// Project settings → Roles & permissions: what Developers may do in this app (its admins: Full or Super admin)
app.put('/api/products/:id/permissions', route(async (req, res) => {
  const product = await productFor(req, req.params.id, 'full');
  const b = req.body || {};
  const next = devPermissions(product);
  Object.keys(DEV_PERMISSIONS).forEach((k) => { if (b[k] !== undefined) next[k] = Boolean(b[k]); });
  await update('products', product.id, { dev_permissions: JSON.stringify(next) }, req.user.id);
  res.json({ devPermissions: next });
}));

// Every change is checked against the issue as stored: its owner, its status and the app's Developer permissions.
app.patch('/api/comments/:id', route(async (req, res) => {
  const productId = await allowed(req, 'comments', req.params.id, 'edit');
  const product = await productRow(productId);
  const b = req.body;
  const issue = await live('comments', req.params.id, 'status, text, screen_id, assignees, developer_id');
  if (!seesIssue(req.user, issue, product)) throw new HttpError(404, 'Not found');
  const rights = issueRights(req.user, issue, product);
  const fields = {};
  // The "Fixed" tick is a shortcut: ticked → Complete, unticked → back to Pending.
  const status = b.status !== undefined ? b.status : b.resolved !== undefined ? (b.resolved ? 'complete' : 'pending') : undefined;
  if (status !== undefined && status !== issue.status) {
    mayStatus(rights, issue.status, status);
    Object.assign(fields, await statusFields(status));
  }
  const details = ['priority', 'area', 'text', 'remarks'].filter((k) => b[k] !== undefined);
  if (details.length && !rights.edit) {
    throw new HttpError(403, issue.developer_id === req.user.id ? 'Developers cannot edit issue details in this app. An admin can allow it in Project settings.' : NOT_YOURS);
  }
  if (b.priority !== undefined) fields.priority = oneOf(b.priority, PRIORITIES, 'priority');
  if (b.area !== undefined) fields.area = oneOf(b.area, AREAS, 'area');
  if (b.text !== undefined) fields.text = required(text(b.text, 1000), 'Issue');
  if (b.remarks !== undefined) fields.remarks = text(b.remarks, 1000);
  // assigning: the people named, and the Developer who owns it (picked, or the first Developer among the names).
  // A new owner takes over at once: the one before can no longer change it.
  if (b.assignees !== undefined || b.developerId !== undefined) {
    if (!rights.assign) {
      throw new HttpError(403, issue.developer_id === req.user.id ? 'Developers cannot reassign issues in this app. An admin can allow it in Project settings.'
        : issue.developer_id ? NOT_YOURS : 'Only a tester or admin can assign an unassigned issue.');
    }
    let names = b.assignees !== undefined ? people(b.assignees) : issue.assignees;
    let owner;
    if (b.developerId !== undefined) {
      owner = b.developerId ? await issueOwner(productId, text(b.developerId, 80), []) : null;
      // the old owner's name goes, the new one's comes
      if (issue.developer_id && (!owner || owner.id !== issue.developer_id)) {
        const { rows: [old] } = await db.query('SELECT name, username FROM users WHERE id = $1', [issue.developer_id]);
        if (old) names = names.filter((n) => !namesOf(old).includes(n.toLowerCase()));
      }
    } else {
      owner = await issueOwner(productId, null, names, issue.developer_id);
    }
    if (owner && !names.some((n) => namesOf(owner).includes(n.toLowerCase()))) names = [personName(owner), ...names].slice(0, 10);
    fields.assignees = names;
    fields.developer_id = owner ? owner.id : null;
  }
  await update('comments', req.params.id, fields, req.user.id);
  if (fields.status && (fields.status === 'complete') !== (issue.status === 'complete')) {
    await resolvedToday(req, productId, { id: req.params.id, ...issue, text: fields.text || issue.text }, fields.status === 'complete');
  }
  const lower = (list) => list.map((n) => n.toLowerCase());
  const added = (fields.assignees || []).filter((n) => !lower(issue.assignees || []).includes(n.toLowerCase()));
  const notify = added.length || fields.status ? await notifyOf(req, productId, req.params.id, { added, statusFrom: fields.status ? issue.status : null }) : undefined;
  res.json({ ...toComment(await one('SELECT * FROM comments WHERE id = $1', [req.params.id])), notify });
}));

// An issue set to Complete goes on the resolver's "done today" (with its screen); reopened the same day, it comes off again.
async function resolvedToday(req, productId, issue, resolved) {
  const { date } = localNow();
  if (!resolved) {
    await db.query('UPDATE done_items SET is_deleted = true, updated_by = $3 WHERE comment_id = $1 AND work_date = $2 AND NOT is_deleted',
      [issue.id, date, req.user.id]);
    return;
  }
  const { rows: [screen] } = await db.query('SELECT name FROM screens WHERE id = $1', [issue.screen_id]);
  // one entry per issue per day, even when two saves race (a unique index on live rows)
  await db.query(
    `INSERT INTO done_items (id, user_id, product_id, work_date, text, screen_ids, comment_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $2, $2)
     ON CONFLICT (comment_id, work_date) WHERE comment_id IS NOT NULL AND NOT is_deleted DO NOTHING`,
    [randomUUID(), req.user.id, productId, date, `Resolved${screen ? ` on ${screen.name}` : ''}: ${issue.text}`.slice(0, 1000), [issue.screen_id], issue.id]);
}

app.delete('/api/comments/:id', route(async (req, res) => {
  await allowed(req, 'comments', req.params.id, 'full');
  await softDelete('comments', req.params.id, req.user.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Teams, sanity testing, done today

// Days and times are the team's local ones: sanity resets at midnight there and reminders follow its clock.
const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const SANITY_STATES = ['pending', 'pass', 'fail'];

function localNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
// a real day that is today or earlier, else today
const { pastDay } = journal;

// Teams buttons open the app at a place (#flow=…, #screen=…, #sanity=…, #done=…).
// APP_URL in .env, else the address the request came in on (the scheduled reminder needs APP_URL).
function deeplink(req, hash) {
  const proto = req && String(req.headers['x-forwarded-proto'] || req.protocol).split(',')[0];
  const base = (process.env.APP_URL || (req ? `${proto}://${req.get('host')}` : '')).replace(/\/+$/, '');
  return base ? `${base}/#${hash}` : '';
}

const personName = (u) => (u && (u.name || u.username)) || '';
const mention = (u) => (u && u.teams_email ? [{ name: personName(u), email: u.teams_email }] : []);

// Post to the app's Teams channel without failing the request: 'sent', 'off' (no webhook) or the reason it failed.
async function toTeams(product, message) {
  if (!product.teams_webhook) return 'off';
  try {
    return await teams.post(product.teams_webhook, message);
  } catch (err) {
    console.error(`Teams (${product.name}):`, err.message);
    return err.message;
  }
}

/** An app the login can open, with at least `level` access. */
async function productFor(req, id, level) {
  need(req, level);
  const product = await live('products', text(id), '*');
  if (!auth.seesProduct(req.user, product.id)) throw new HttpError(404, 'Not found');
  return product;
}

// Logins that can open an app (to pick a heading's owner, and to @mention sanity testers)
const peopleOf = (productId) => db.query(
  `SELECT id, name, username, teams_email, sanity_tester, access FROM users
   WHERE NOT is_deleted AND (access = 'super' OR all_products OR $1 = ANY(product_ids))
   ORDER BY lower(coalesce(nullif(name, ''), username))`, [productId]);

// ---- sanity

// Testers, developers and super admins run sanity; other logins need the "Sanity tester" tick
const SANITY_ACCESS = ['tester', 'developer', 'super'];
const canRunSanity = (user) => user.sanity_tester || SANITY_ACCESS.includes(user.access);
const canManageSanity = (user) => canRunSanity(user) || auth.atLeast(user, 'full');
function needSanity(req, manage) {
  if (!(manage ? canManageSanity(req.user) : canRunSanity(req.user))) {
    throw new HttpError(403, manage ? 'Only sanity testers and Full logins can change the sanity list.' : 'Only testers, developers and sanity testers can run sanity. Ask an admin to tick "Sanity tester" on your login.');
  }
}

// One run per app per day; a new day starts empty with the previous run's time carried over.
async function runFor(productId, date) {
  await db.query(
    `INSERT INTO sanity_runs (id, product_id, run_date, run_time)
     SELECT $1, $2, $3::date, coalesce((SELECT run_time FROM sanity_runs WHERE product_id = $2 AND run_date < $3::date ORDER BY run_date DESC LIMIT 1), '')
     ON CONFLICT (product_id, run_date) DO NOTHING`, [randomUUID(), productId, date]);
  return one('SELECT * FROM sanity_runs WHERE product_id = $1 AND run_date = $2', [productId, date]);
}

const toSanityItem = (r) => ({
  id: r.id, flowId: r.flow_id, heading: r.flow_name || r.heading, ownerId: r.owner_id, order: r.sort_order,
  state: r.state || 'pending', review: r.review || '', cells: r.cells || {}, sharedAt: r.shared_at || null,
  resultAt: r.result_at || null, resultBy: r.result_by || null,
});

// Every flow of the app is a sanity heading on its own (new flows join the end of the list as they are made).
// A flow whose heading was removed from the list is not added again; it can be picked back by hand.
const syncFlowHeadings = (productId) => db.query(
  `INSERT INTO sanity_items (id, product_id, flow_id, heading, sort_order)
   SELECT gen_random_uuid()::text, $1, f.id, f.name,
     -- after everything already listed, in board order (module, then flow)
     (SELECT coalesce(max(sort_order), 0) FROM sanity_items WHERE product_id = $1)
       + row_number() OVER (ORDER BY m.sort_order, m.created_at, f.sort_order, f.created_at)
   FROM flows f JOIN modules m ON m.id = f.module_id
   WHERE m.product_id = $1 AND NOT f.is_deleted AND NOT m.is_deleted
     AND NOT EXISTS (SELECT 1 FROM sanity_items i WHERE i.flow_id = f.id)`, [productId]);

// Headings still shown: typed ones, and flow ones while the flow (and its module) exists. Name follows the flow.
const SANITY_ITEMS = `
  FROM sanity_items i
  LEFT JOIN flows f ON f.id = i.flow_id
  LEFT JOIN modules m ON m.id = f.module_id
  WHERE i.product_id = $1 AND NOT i.is_deleted AND (i.flow_id IS NULL OR (NOT f.is_deleted AND NOT m.is_deleted))`;

const sanityColumns = (productId) => db.query(
  'SELECT * FROM sanity_columns WHERE product_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [productId]);
const toSanityColumn = (r) => ({ id: r.id, name: r.name, order: r.sort_order });

async function sanityItem(req, id) {
  const item = await live('sanity_items', id, '*');
  const product = await productFor(req, item.product_id, 'view');
  return { item, product };
}

async function ownerFor(productId, ownerId) {
  if (!ownerId) return null;
  const { rows } = await peopleOf(productId);
  if (!rows.some((u) => u.id === ownerId)) throw new HttpError(400, 'Pick an owner who can open this app');
  return ownerId;
}

app.get('/api/sanity', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const { date: today } = localNow();
  const date = pastDay(req.query.date, today);
  const run = date === today ? await runFor(product.id, today)
    : (await db.query('SELECT * FROM sanity_runs WHERE product_id = $1 AND run_date = $2', [product.id, date])).rows[0] || null;
  await syncFlowHeadings(product.id);
  const [items, people, columns] = await Promise.all([
    db.query(
      `SELECT i.*, f.name AS flow_name, r.state, r.review, r.cells, r.shared_at, r.updated_at AS result_at, r.updated_by AS result_by
       ${SANITY_ITEMS.replace('WHERE', 'LEFT JOIN sanity_results r ON r.item_id = i.id AND r.run_id = $2 WHERE')}
       ORDER BY i.sort_order, i.created_at`, [product.id, run ? run.id : '']),
    peopleOf(product.id),
    sanityColumns(product.id),
  ]);
  res.json({
    date, today, timezone: TIMEZONE,
    run: run && { version: run.version, time: run.run_time, remindedAt: run.reminded_at },
    items: items.rows.map(toSanityItem),
    columns: columns.rows.map(toSanityColumn),
    people: people.rows.map((u) => ({ id: u.id, name: personName(u), teams: Boolean(u.teams_email) })),
    canRun: canRunSanity(req.user), canManage: canManageSanity(req.user),
    teams: Boolean(product.teams_webhook),
    webhook: req.user.access === 'super' ? product.teams_webhook : undefined,
    recipients: product.sanity_recipients,
  });
}));

// Add a heading: an existing flow, a typed heading, or a typed heading that is also created as a new flow
app.post('/api/sanity/items', route(async (req, res) => {
  const b = req.body;
  const product = await productFor(req, b.productId, 'view');
  needSanity(req, true);
  let flowId = null;
  let heading = text(b.heading, 120);
  if (b.flowId) {
    const f = await one(
      `SELECT f.id, f.name, m.product_id FROM flows f JOIN modules m ON m.id = f.module_id
       WHERE f.id = $1 AND NOT f.is_deleted AND NOT m.is_deleted`, [text(b.flowId)]);
    if (f.product_id !== product.id) throw new HttpError(400, 'Pick a flow of this app');
    flowId = f.id;
    heading = heading || f.name;
  } else if (b.newFlowModuleId) {
    need(req, 'developer');
    const m = await live('modules', text(b.newFlowModuleId), 'id, product_id');
    if (m.product_id !== product.id) throw new HttpError(400, 'Pick a module of this app');
    const { rows } = await db.query(
      'INSERT INTO flows (id, module_id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING id',
      [randomUUID(), m.id, required(heading, 'Heading'), Date.now(), req.user.id]);
    flowId = rows[0].id;
  }
  const { rows } = await db.query(
    `INSERT INTO sanity_items (id, product_id, flow_id, heading, owner_id, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *`,
    [randomUUID(), product.id, flowId, required(heading, 'Heading'), await ownerFor(product.id, text(b.ownerId)), Date.now(), req.user.id]);
  res.status(201).json(toSanityItem(rows[0]));
}));

app.patch('/api/sanity/items/:id', route(async (req, res) => {
  const { item, product } = await sanityItem(req, req.params.id);
  needSanity(req, true);
  const fields = {};
  if (req.body.heading !== undefined) fields.heading = required(text(req.body.heading, 120), 'Heading');
  if (req.body.ownerId !== undefined) fields.owner_id = await ownerFor(product.id, text(req.body.ownerId));
  await update('sanity_items', item.id, fields, req.user.id);
  res.json(toSanityItem(await live('sanity_items', item.id, '*')));
}));

app.delete('/api/sanity/items/:id', route(async (req, res) => {
  const { item } = await sanityItem(req, req.params.id);
  needSanity(req, true);
  await softDelete('sanity_items', item.id, req.user.id);
  res.json({ ok: true });
}));

app.put('/api/sanity/order', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req, true);
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  await db.tx((client) => Promise.all(ids.map((id, i) =>
    client.query('UPDATE sanity_items SET sort_order = $3, updated_by = $4 WHERE id = $1 AND product_id = $2', [id, product.id, i, req.user.id]))));
  res.json({ ok: true });
}));

// ---- submitting a sanity: checks, a log kept for good, a "done today" entry and the report on Teams

const toSanityLog = (r, full) => ({
  id: r.id, productId: r.product_id, date: r.run_date, version: r.version, time: r.run_time,
  passed: r.passed, failed: r.failed, total: r.total, testers: r.testers, submittedBy: personName(r) || '',
  submittedById: r.created_by, submittedAt: r.created_at, sharedAt: r.shared_at,
  ...(full ? { columns: r.columns, rows: r.rows } : {}),
});
const LOG_SELECT = 'SELECT l.*, u.name, u.username FROM sanity_logs l LEFT JOIN users u ON u.id = l.created_by';

async function sanityLog(req, id) {
  const log = await one(`${LOG_SELECT} WHERE l.id = $1`, [id]);
  const product = await productFor(req, log.product_id, 'view');
  return { log, product };
}

// The report card: date, version, passed / failed, who did it, every failure with its remark
async function shareReport(req, product, log, userIds) {
  const { rows: people } = await peopleOf(product.id);
  const to = people.filter((u) => userIds.includes(u.id));
  const failed = log.rows.filter((r) => r.state === 'fail');
  const sent = await toTeams(product, {
    title: `${log.failed ? '⚠️' : '✅'} Sanity report: ${product.name} — ${log.run_date}`,
    lines: [
      ...failed.map((r) => `❌ **${r.heading}**${r.review ? ` — ${r.review}` : ''}`),
      to.length && !to.some((u) => u.teams_email) ? `For: ${to.map(personName).join(', ')}` : '',
    ],
    facts: [['Version', log.version], ['Date', log.run_date], ['Passed', `${log.passed} / ${log.total}`], ['Failed', String(log.failed)],
      ['Done by', log.testers.join(', ') || personName(req.user)], ['Submitted by', personName(log) || personName(req.user)]],
    actions: [['Open report', deeplink(req, `sanity=${product.id}&log=${log.id}`)]],
    mentions: to.flatMap(mention),
  });
  if (sent === 'sent') await db.query('UPDATE sanity_logs SET shared_at = now() WHERE id = $1', [log.id]);
  return sent;
}

app.post('/api/sanity/submit', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req);
  const { date } = localNow();
  const run = await runFor(product.id, date);
  const version = text(req.body.version !== undefined ? req.body.version : run.version, 60);
  await syncFlowHeadings(product.id);
  const [{ rows: items }, { rows: cols }, { rows: users }] = await Promise.all([
    db.query(
      `SELECT i.*, f.name AS flow_name, m.name AS module_name, r.state, r.review, r.cells, r.updated_by AS result_by
       ${SANITY_ITEMS.replace('WHERE', 'LEFT JOIN sanity_results r ON r.item_id = i.id AND r.run_id = $2 WHERE')}
       ORDER BY i.sort_order, i.created_at`, [product.id, run.id]),
    sanityColumns(product.id),
    db.query('SELECT id, name, username FROM users'),
  ]);
  // checks: a version, at least one heading, every heading Done or Failed
  const problems = [];
  if (!version) problems.push('Enter the version you tested.');
  if (!items.length) problems.push('The sanity list is empty.');
  const unchecked = items.filter((it) => !it.state || it.state === 'pending');
  if (unchecked.length) problems.push(`Mark Done or Failed on ${unchecked.length} heading${unchecked.length === 1 ? '' : 's'}: ${unchecked.slice(0, 5).map((it) => it.flow_name || it.heading).join(', ')}${unchecked.length > 5 ? '…' : ''}.`);
  if (problems.length) {
    return res.status(400).json({ error: problems.join(' '), problems, missing: unchecked.map((it) => it.id) });
  }

  const who = (id) => personName(users.find((u) => u.id === id));
  const rows = items.map((it) => ({
    heading: it.flow_name || it.heading, module: it.module_name || '', state: it.state, review: it.review || '',
    cells: Object.fromEntries(cols.map((c) => [c.name, (it.cells || {})[c.id] || ''])), checkedBy: who(it.result_by),
  }));
  const passed = rows.filter((r) => r.state === 'pass').length;
  const failed = rows.length - passed;
  const testers = [...new Set(rows.map((r) => r.checkedBy).filter(Boolean))];
  const id = randomUUID();
  await db.tx(async (client) => {
    await client.query('UPDATE sanity_runs SET version = $2, updated_by = $3 WHERE id = $1', [run.id, version, req.user.id]);
    await client.query(
      `INSERT INTO sanity_logs (id, product_id, run_id, run_date, version, run_time, passed, failed, total, columns, rows, testers, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
      [id, product.id, run.id, date, version, run.run_time, passed, failed, rows.length, JSON.stringify(cols.map((c) => c.name)), JSON.stringify(rows), testers, req.user.id]);
    // the submitter's "done today"
    await client.query(
      `INSERT INTO done_items (id, user_id, product_id, work_date, text, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $2, $2)`,
      [randomUUID(), req.user.id, product.id, date,
        `Sanity done on version ${version}: ${passed} passed, ${failed} failed of ${rows.length}${failed ? ` (failed: ${rows.filter((r) => r.state === 'fail').map((r) => r.heading).join(', ')})` : ''}`]);
  });
  const log = await one(`${LOG_SELECT} WHERE l.id = $1`, [id]);
  const sent = await shareReport(req, product, log, product.sanity_recipients);
  res.status(201).json({ log: toSanityLog(log), teams: sent });
}));

// Every submitted sanity of an app, newest first (optionally one day)
app.get('/api/sanity/logs', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const day = DATE.test(req.query.date || '') ? req.query.date : null;
  const { rows } = await db.query(
    `${LOG_SELECT} WHERE l.product_id = $1 AND ($2::date IS NULL OR l.run_date = $2::date) ORDER BY l.created_at DESC LIMIT 200`, [product.id, day]);
  res.json(rows.map((r) => toSanityLog(r)));
}));

app.get('/api/sanity/logs/:id', route(async (req, res) => {
  const { log } = await sanityLog(req, req.params.id);
  res.json(toSanityLog(log, true));
}));

// Send a report to anyone of the app (on Teams, @mentioned)
app.post('/api/sanity/logs/:id/share', route(async (req, res) => {
  const { log, product } = await sanityLog(req, req.params.id);
  need(req, 'edit');
  if (!product.teams_webhook) throw new HttpError(400, 'This app has no Teams channel yet. A super admin can add it at the bottom of the Sanity page.');
  const ids = (Array.isArray(req.body.userIds) ? req.body.userIds : []).filter((x) => typeof x === 'string');
  const sent = await shareReport(req, product, log, ids);
  if (sent !== 'sent') throw new HttpError(502, sent);
  res.json({ teams: sent });
}));

app.get('/api/sanity/logs/:id/export', route(async (req, res) => {
  const { log, product } = await sanityLog(req, req.params.id);
  const STATE = { pass: 'Done', fail: 'Failed' };
  const book = new ExcelJS.Workbook();
  book.creator = 'FlowTrace';
  const ws = book.addWorksheet('Sanity report', { views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }] });
  ws.columns = [
    { header: '#', key: 'no', width: 5 }, { header: 'Heading', key: 'heading', width: 30 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Status', key: 'status', width: 10 }, { header: 'Remarks', key: 'review', width: 40 },
    ...log.columns.map((name, i) => ({ header: name, key: `c${i}`, width: Math.max(14, Math.min(40, name.length + 4)) })),
    { header: 'Checked by', key: 'by', width: 18 },
  ];
  log.rows.forEach((r, i) => {
    const row = ws.addRow({ no: i + 1, heading: r.heading, module: r.module, status: STATE[r.state] || '', review: r.review,
      ...Object.fromEntries(log.columns.map((name, j) => [`c${j}`, r.cells[name] || ''])), by: r.checkedBy });
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r.state === 'pass' ? 'FFDCFCE7' : 'FFFEE2E2' } };
  });
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
  ws.getColumn('review').alignment = { wrapText: true, vertical: 'top' };
  ws.addRow([]);
  [['App', product.name], ['Date', log.run_date], ['Version', log.version], ['Passed', `${log.passed} / ${log.total}`], ['Failed', log.failed],
    ['Done by', log.testers.join(', ')], ['Submitted by', personName(log)], ['Submitted at', new Date(log.created_at).toLocaleString('en-GB', { timeZone: TIMEZONE })]]
    .forEach(([k, v]) => { const r = ws.addRow({ heading: k, module: v }); r.getCell('heading').font = { bold: true }; });
  const safe = product.name.replace(/[^\w-]+/g, '-');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="sanity-report-${safe}-${log.run_date}-${log.version.replace(/[^\w.-]+/g, '-')}.xlsx"`);
  await book.xlsx.write(res);
  res.end();
}));

// Who the report goes to on every submit (sanity testers and Full logins)
app.put('/api/sanity/recipients', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req, true);
  const { rows } = await peopleOf(product.id);
  const ids = (Array.isArray(req.body.userIds) ? req.body.userIds : []).filter((x) => rows.some((u) => u.id === x));
  await update('products', product.id, { sanity_recipients: ids }, req.user.id);
  res.json({ recipients: ids });
}));

// Extra columns of the sanity sheet (sanity testers and Full logins)
app.post('/api/sanity/columns', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req, true);
  const { rows } = await db.query(
    'INSERT INTO sanity_columns (id, product_id, name, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
    [randomUUID(), product.id, required(text(req.body.name, 60), 'Column name'), Date.now(), req.user.id]);
  res.status(201).json(toSanityColumn(rows[0]));
}));

app.patch('/api/sanity/columns/:id', route(async (req, res) => {
  const col = await live('sanity_columns', req.params.id, '*');
  await productFor(req, col.product_id, 'view');
  needSanity(req, true);
  await update('sanity_columns', col.id, { name: required(text(req.body.name, 60), 'Column name') }, req.user.id);
  res.json(toSanityColumn(await live('sanity_columns', col.id, '*')));
}));

app.delete('/api/sanity/columns/:id', route(async (req, res) => {
  const col = await live('sanity_columns', req.params.id, '*');
  await productFor(req, col.product_id, 'view');
  needSanity(req, true);
  await softDelete('sanity_columns', col.id, req.user.id);
  res.json({ ok: true });
}));

// The sanity sheet of one day as Excel: heading, flow, owner, status, remarks, the extra columns, who and when
app.get('/api/sanity/export', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const { date: today } = localNow();
  const date = pastDay(req.query.date, today);
  const run = date === today ? await runFor(product.id, today)
    : (await db.query('SELECT * FROM sanity_runs WHERE product_id = $1 AND run_date = $2', [product.id, date])).rows[0] || null;
  await syncFlowHeadings(product.id);
  const [{ rows: items }, { rows: cols }, { rows: people }] = await Promise.all([
    db.query(
      `SELECT i.*, f.name AS flow_name, m.name AS module_name, r.state, r.review, r.cells, r.updated_at AS result_at, r.updated_by AS result_by
       ${SANITY_ITEMS.replace('WHERE', 'LEFT JOIN sanity_results r ON r.item_id = i.id AND r.run_id = $2 WHERE')}
       ORDER BY i.sort_order, i.created_at`, [product.id, run ? run.id : '']),
    sanityColumns(product.id),
    db.query('SELECT id, name, username FROM users'),
  ]);
  const who = (id) => personName(people.find((u) => u.id === id));
  const STATE = { pending: 'Not checked', pass: 'Done', fail: 'Failed' };

  const book = new ExcelJS.Workbook();
  book.creator = 'FlowTrace';
  const sheet = book.addWorksheet('Sanity', { views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }] });
  sheet.columns = [
    { header: '#', key: 'no', width: 5 }, { header: 'Heading', key: 'heading', width: 30 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Status', key: 'status', width: 12 }, { header: 'Remarks', key: 'review', width: 40 },
    ...cols.map((c) => ({ header: c.name, key: `c_${c.id}`, width: Math.max(14, Math.min(40, c.name.length + 4)) })),
    { header: 'Checked by', key: 'by', width: 18 }, { header: 'Checked at', key: 'at', width: 18, style: { numFmt: 'dd mmm yyyy hh:mm' } },
  ];
  items.forEach((it, i) => {
    const state = it.state || 'pending';
    const row = sheet.addRow({
      no: i + 1, heading: it.flow_name || it.heading, module: it.module_name || '',
      status: STATE[state], review: it.review || '',
      ...Object.fromEntries(cols.map((c) => [`c_${c.id}`, (it.cells || {})[c.id] || ''])),
      by: state === 'pending' ? '' : who(it.result_by), at: state === 'pending' || !it.result_at ? null : new Date(it.result_at),
    });
    const fill = { pass: 'FFDCFCE7', fail: 'FFFEE2E2' }[state];
    if (fill) row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  });
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  sheet.getColumn('review').alignment = { wrapText: true, vertical: 'top' };
  // version / date / time under the table
  sheet.addRow([]);
  [['App', product.name], ['Date', date], ['Version', run ? run.version : ''], ['Sanity time', run ? run.run_time : '']]
    .forEach(([k, v]) => { const r = sheet.addRow({ heading: k, module: v }); r.getCell('heading').font = { bold: true }; });

  const safe = product.name.replace(/[^\w-]+/g, '-');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="sanity-${safe}-${date}.xlsx"`);
  await book.xlsx.write(res);
  res.end();
}));

// Today's version and time. Changing the time re-arms the Teams reminder.
app.put('/api/sanity/run', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req);
  const time = text(req.body.time, 5);
  if (time && !TIME.test(time)) throw new HttpError(400, 'Time must look like 18:30');
  const run = await runFor(product.id, localNow().date);
  const { rows } = await db.query(
    `UPDATE sanity_runs SET version = $2, run_time = $3, updated_by = $4,
       reminded_at = CASE WHEN run_time = $3 THEN reminded_at END
     WHERE id = $1 RETURNING *`, [run.id, text(req.body.version, 60), time, req.user.id]);
  res.json({ version: rows[0].version, time: rows[0].run_time, remindedAt: rows[0].reminded_at });
}));

async function shareFailure(req, product, run, item, review) {
  const [{ rows: [owner] }, { rows: [flow] }] = await Promise.all([
    db.query('SELECT name, username, teams_email FROM users WHERE id = $1 AND NOT is_deleted', [item.owner_id]),
    db.query('SELECT name FROM flows WHERE id = $1 AND NOT is_deleted', [item.flow_id]),
  ]);
  return toTeams(product, {
    title: `❌ Sanity failed: ${flow ? flow.name : item.heading}`,
    lines: [review && `**Review:** ${review}`],
    facts: [['App', product.name], ['Version', run.version || '—'], ['Date', run.run_date], ['Tested by', personName(req.user)], ['Owner', personName(owner)]],
    actions: [
      ['Open flow', flow ? deeplink(req, `flow=${item.flow_id}`) : ''],
      ['Sanity checklist', deeplink(req, `sanity=${product.id}`)],
    ],
    mentions: mention(owner),
  });
}

// Tick a heading done / failed (or back to pending) and write a review. Failing posts to Teams straight away.
app.put('/api/sanity/items/:id/result', route(async (req, res) => {
  const { item, product } = await sanityItem(req, req.params.id);
  needSanity(req);
  const run = await runFor(product.id, localNow().date);
  const { rows: [before] } = await db.query('SELECT * FROM sanity_results WHERE run_id = $1 AND item_id = $2', [run.id, item.id]);
  const state = req.body.state !== undefined ? oneOf(req.body.state, SANITY_STATES, 'state') : (before ? before.state : 'pending');
  const review = req.body.review !== undefined ? text(req.body.review, 1000) : (before ? before.review : '');
  // values of the extra columns: { columnId: 'text' }, merged into what is there
  const cells = { ...(before ? before.cells : {}) };
  if (req.body.cells && typeof req.body.cells === 'object') {
    const { rows: cols } = await sanityColumns(product.id);
    Object.entries(req.body.cells).forEach(([id, value]) => {
      if (!cols.some((c) => c.id === id)) throw new HttpError(400, 'That column no longer exists');
      cells[id] = text(value, 500);
    });
  }
  await db.query(
    `INSERT INTO sanity_results (run_id, item_id, state, review, cells, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (run_id, item_id) DO UPDATE SET state = EXCLUDED.state, review = EXCLUDED.review, cells = EXCLUDED.cells, updated_by = EXCLUDED.updated_by`,
    [run.id, item.id, state, review, JSON.stringify(cells), req.user.id]);
  let sent = null;
  if (state === 'fail' && (!before || before.state !== 'fail')) {
    sent = await shareFailure(req, product, run, item, review);
    if (sent === 'sent') await db.query('UPDATE sanity_results SET shared_at = now() WHERE run_id = $1 AND item_id = $2', [run.id, item.id]);
  }
  res.json({ state, review, cells, teams: sent });
}));

// Share again: one failed heading, or today's summary (passed / failed / left, owners of failures @mentioned)
app.post('/api/sanity/share', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'view');
  needSanity(req);
  const run = await runFor(product.id, localNow().date);
  if (req.body.itemId) {
    const { item } = await sanityItem(req, text(req.body.itemId));
    const { rows: [r] } = await db.query('SELECT * FROM sanity_results WHERE run_id = $1 AND item_id = $2', [run.id, item.id]);
    if (!r || r.state !== 'fail') throw new HttpError(400, 'Only a failed heading can be shared');
    const sent = await shareFailure(req, product, run, item, r.review);
    if (sent === 'sent') await db.query('UPDATE sanity_results SET shared_at = now() WHERE run_id = $1 AND item_id = $2', [run.id, item.id]);
    return res.json({ teams: sent });
  }
  await syncFlowHeadings(product.id);
  const { rows } = await db.query(
    `SELECT i.heading, f.name AS flow_name, coalesce(r.state, 'pending') AS state, r.review, u.name, u.username, u.teams_email
     ${SANITY_ITEMS.replace('WHERE', `LEFT JOIN sanity_results r ON r.item_id = i.id AND r.run_id = $2
       LEFT JOIN users u ON u.id = i.owner_id AND NOT u.is_deleted WHERE`)}
     ORDER BY i.sort_order, i.created_at`, [product.id, run.id]);
  if (!rows.length) throw new HttpError(400, 'The sanity list is empty');
  const count = (st) => rows.filter((r) => r.state === st).length;
  const failed = rows.filter((r) => r.state === 'fail');
  const owners = [...new Map(failed.flatMap((r) => mention(r)).map((m) => [m.email, m])).values()];
  const sent = await toTeams(product, {
    title: `${failed.length ? '⚠️' : '✅'} Sanity ${count('pending') ? 'progress' : 'done'}: ${product.name}`,
    lines: failed.map((r) => `❌ **${r.flow_name || r.heading}**${r.review ? ` — ${r.review}` : ''}`),
    facts: [['Version', run.version || '—'], ['Date', run.run_date], ['Passed', `${count('pass')} / ${rows.length}`],
      ['Failed', String(failed.length)], ['Not checked', String(count('pending'))], ['Tested by', personName(req.user)]],
    actions: [['Sanity checklist', deeplink(req, `sanity=${product.id}`)]],
    mentions: owners,
  });
  res.json({ teams: sent });
}));

// The app's Teams channel (super admins): a Workflows "post when a webhook request is received" URL
app.put('/api/products/:id/teams', route(async (req, res) => {
  const product = await productFor(req, req.params.id, 'super');
  const webhook = text(req.body.webhook, 2000);
  if (webhook && !teams.valid(webhook)) throw new HttpError(400, 'Paste the https:// URL from the Teams workflow');
  await update('products', product.id, { teams_webhook: webhook }, req.user.id);
  res.json({ teams: Boolean(webhook) });
}));

app.post('/api/products/:id/teams/test', route(async (req, res) => {
  const product = await productFor(req, req.params.id, 'super');
  if (!product.teams_webhook) throw new HttpError(400, 'Save a Teams webhook first');
  const sent = await toTeams(product, {
    title: `👋 FlowTrace is connected to this channel for ${product.name}`,
    lines: ['Sanity reminders, failures and "done today" updates will be posted here.'],
    actions: [['Open FlowTrace', deeplink(req, `sanity=${product.id}`)]],
  });
  if (sent !== 'sent') throw new HttpError(502, sent);
  res.json({ teams: sent });
}));

// Every minute: when an app's sanity time has come today, remind its channel once (@mentioning sanity testers).
// The UPDATE … WHERE reminded_at IS NULL claims the reminder, so it goes out once even with several servers.
async function sanityReminders() {
  const { date, time } = localNow();
  const { rows: apps } = await db.query(
    `SELECT p.* FROM products p WHERE NOT p.is_deleted AND p.teams_webhook <> ''
       AND (EXISTS (SELECT 1 FROM sanity_items i WHERE i.product_id = p.id AND NOT i.is_deleted)
         OR EXISTS (SELECT 1 FROM flows f JOIN modules m ON m.id = f.module_id WHERE m.product_id = p.id AND NOT f.is_deleted AND NOT m.is_deleted))`);
  for (const product of apps) {
    const run = await runFor(product.id, date);
    // due now, and not more than an hour ago (a server started late in the day doesn't remind about the morning)
    if (!TIME.test(run.run_time) || run.run_time > time || minutes(time) - minutes(run.run_time) > 60) continue;
    const { rows: claimed } = await db.query('UPDATE sanity_runs SET reminded_at = now() WHERE id = $1 AND reminded_at IS NULL RETURNING id', [run.id]);
    if (!claimed.length) continue;
    const [{ rows: people }, { rows: [{ n }] }] = await Promise.all([
      peopleOf(product.id),
      syncFlowHeadings(product.id).then(() => db.query(`SELECT count(*)::int AS n ${SANITY_ITEMS}`, [product.id])),
    ]);
    await toTeams(product, {
      title: `🧪 Sanity due: ${product.name}`,
      lines: [`${n} heading${n === 1 ? '' : 's'} to check.`],
      facts: [['Version', run.version || 'not set yet'], ['Time', run.run_time], ['Date', date]],
      actions: [['Start sanity', deeplink(null, `sanity=${product.id}`)]],
      mentions: people.filter((u) => u.sanity_tester).flatMap(mention),
    });
  }
}

// ---- done today (the daily work journal: Done, To-do, In Progress, Questions, Blockers, Shared with me)

const toDone = (r) => ({
  id: r.id, userId: r.user_id, userName: personName(r), date: r.work_date, text: r.text, screenIds: r.screen_ids,
  sharedAt: r.shared_at, sharedWith: r.shared_with, closedAt: r.closed_at, closedBy: r.closed_by, todoId: r.todo_id,
  closedByName: personName({ name: r.closer_name, username: r.closer_username }), minutes: r.minutes || null,
  issueId: r.comment_id || null, ...audit(r),
});

// Testers and super admins close an entry shared with them once they have checked the change
const canCloseDone = (user) => ['tester', 'super'].includes(user.access);

// Screens (not conditions) of this app, in the order given; others are dropped
async function appScreens(productId, ids) {
  const wanted = (Array.isArray(ids) ? ids : []).filter((x) => typeof x === 'string').slice(0, 20);
  const { rows } = await db.query(
    `SELECT s.id, s.name FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
     WHERE s.id = ANY($1) AND s.type <> 'condition' AND NOT s.is_deleted AND m.product_id = $2`, [wanted, productId]);
  return wanted.map((id) => rows.find((r) => r.id === id)).filter(Boolean);
}

async function ownDone(req, id) {
  const row = await live('done_items', id, '*');
  await productFor(req, row.product_id, 'edit');
  if (row.user_id !== req.user.id && req.user.access !== 'super') throw new HttpError(403, 'You can only change your own entries');
  return row;
}
const DONE_SELECT = `SELECT d.*, u.name, u.username, c.name AS closer_name, c.username AS closer_username
  FROM done_items d JOIN users u ON u.id = d.user_id LEFT JOIN users c ON c.id = d.closed_by`;
const doneById = async (id) => toDone(await one(`${DONE_SELECT} WHERE d.id = $1`, [id]));

// "1 h 30 min" for Teams
const timeText = (mins) => (mins >= 60 ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`);

// "• text ↳ screen links" for a Teams message
async function doneLine(req, productId, r) {
  const screens = await appScreens(productId, r.screen_ids);
  const links = screens.map((x) => { const url = deeplink(req, `screen=${x.id}`); return url ? `[${x.name}](${url})` : x.name; });
  return `• ${r.text}${r.minutes ? ` (${timeText(r.minutes)})` : ''}${links.length ? `\n  ↳ ${links.join(', ')}` : ''}`;
}

/**
 * A new row with the id the browser made for it (journal.clientId), so a form sent twice saves once: the INSERT does
 * nothing the second time and the row already saved is answered instead (it must be the same person's).
 */
async function insertOnce(sql, params, table, userId, owner = 'user_id') {
  const { rows } = await db.query(`${sql} ON CONFLICT (id) DO NOTHING RETURNING id`, params);
  if (rows[0]) return { id: rows[0].id, created: true };
  const { rows: [had] } = await db.query(`SELECT id, ${owner} AS owner FROM ${table} WHERE id = $1`, [params[0]]);
  if (!had || had.owner !== userId) throw new HttpError(409, 'This entry was already saved. Refresh and try again.');
  return { id: had.id, created: false };
}
const newId = (req) => journal.clientId(req.body.clientId) || randomUUID();

// Points in priority order (urgent first), then oldest first
const PRIORITY_ORDER = (col) => `CASE ${col} WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`;

// One day of my entries (super admins: everyone's) + every entry shared with me (open ones first, any day), my points
// that were open at the end of that day, and the questions and blockers open on it (unresolved ones carry over).
app.get('/api/done', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const { date: today } = localNow();
  const date = pastDay(req.query.date, today);
  const everyone = req.user.access === 'super';
  const [{ rows }, { rows: shared }, { rows: people }, { rows: todos }, { rows: questions }, { rows: blockers }] = await Promise.all([
    db.query(`${DONE_SELECT} WHERE d.product_id = $1 AND d.work_date = $2 AND NOT d.is_deleted AND ($3 OR d.user_id = $4) ORDER BY d.created_at`,
      [product.id, date, everyone, req.user.id]),
    db.query(`${DONE_SELECT} WHERE d.product_id = $1 AND $2 = ANY(d.shared_with) AND NOT d.is_deleted
              ORDER BY d.closed_at IS NOT NULL, d.created_at DESC LIMIT 200`, [product.id, req.user.id]),
    peopleOf(product.id),
    // a point counts on a day when it was written by then (the team's day) and not ticked off before or on it
    db.query(`SELECT t.* FROM done_todos t LEFT JOIN done_items di ON di.id = t.done_item_id
              WHERE t.product_id = $1 AND t.user_id = $2 AND NOT t.is_deleted
                AND (t.created_at AT TIME ZONE $3)::date <= $4 AND (t.done_at IS NULL OR di.work_date > $4)
              ORDER BY ${PRIORITY_ORDER('t.priority')}, t.created_at`, [product.id, req.user.id, TIMEZONE, date]),
    db.query(`${QUESTION_SELECT} WHERE q.product_id = $1 AND NOT q.is_deleted AND ${journal.OPEN_ON('q', '$2')}
                AND ($3 OR q.user_id = $4 OR q.assignee_id = $4)
              ORDER BY q.status = 'resolved', ${PRIORITY_ORDER('q.priority')}, q.raised_on, q.created_at LIMIT 300`,
    [product.id, date, isAdmin(req.user), req.user.id]),
    db.query(`${BLOCKER_SELECT} WHERE b.product_id = $1 AND NOT b.is_deleted AND ${journal.OPEN_ON('b', '$2')}
                AND ($3 OR b.user_id = $4 OR b.waiting_on = $4)
              ORDER BY b.resolved_at IS NOT NULL, ${PRIORITY_ORDER('b.priority')}, b.raised_on, b.created_at LIMIT 300`,
    [product.id, date, everyone, req.user.id]),
  ]);
  res.json({
    date, today, items: rows.map(toDone), shared: shared.map(toDone), todos: todos.map(toTodo), teams: Boolean(product.teams_webhook),
    people: people.map((u) => ({ id: u.id, name: personName(u), teams: Boolean(u.teams_email) })),
    canClose: canCloseDone(req.user),
    questions: questions.map((q) => toQuestion(q, req.user)), blockers: blockers.map((b) => toBlocker(b, req.user)),
  });
}));

app.post('/api/done', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const screens = await appScreens(product.id, req.body.screenIds);
  const { id, created } = await insertOnce(
    `INSERT INTO done_items (id, user_id, product_id, work_date, text, screen_ids, minutes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $2, $2)`,
    [newId(req), req.user.id, product.id, localNow().date, required(text(req.body.text, 1000), 'What you did'), screens.map((x) => x.id),
      journal.minutesValue(req.body.minutes)], 'done_items', req.user.id);
  res.status(created ? 201 : 200).json(await doneById(id));
}));

app.patch('/api/done/:id', route(async (req, res) => {
  const row = await ownDone(req, req.params.id);
  const fields = {};
  if (req.body.text !== undefined) fields.text = required(text(req.body.text, 1000), 'What you did');
  if (req.body.screenIds !== undefined) fields.screen_ids = (await appScreens(row.product_id, req.body.screenIds)).map((x) => x.id);
  if (req.body.minutes !== undefined) fields.minutes = journal.minutesValue(req.body.minutes);
  await update('done_items', row.id, fields, req.user.id);
  res.json(await doneById(row.id));
}));

app.delete('/api/done/:id', route(async (req, res) => {
  const row = await ownDone(req, req.params.id);
  await softDelete('done_items', row.id, req.user.id);
  res.json({ ok: true });
}));

// ---- my to-do points: noted down first, moved to In Progress, ticked off into "done today"

const toTodo = (r) => ({
  id: r.id, text: r.text, screenIds: r.screen_ids, doneAt: r.done_at, doneItemId: r.done_item_id,
  stage: r.stage, priority: r.priority, nextAction: r.next_action, startedAt: r.started_at, estMinutes: r.est_minutes || null,
  ...audit(r),
});

async function ownTodo(req, id) {
  const row = await live('done_todos', id, '*');
  await productFor(req, row.product_id, 'edit');
  if (row.user_id !== req.user.id) throw new HttpError(403, 'You can only change your own to-do points');
  return row;
}

// stage / priority / next action / estimate of a point, from a request body (only what was sent)
function todoFields(b, row = {}) {
  const fields = {};
  if (b.stage !== undefined) {
    fields.stage = journal.oneOf(b.stage, journal.STAGES, 'stage');
    if (fields.stage === 'progress' && !row.started_at) fields.started_at = new Date();
  }
  if (b.priority !== undefined) fields.priority = journal.priority(b.priority);
  if (b.nextAction !== undefined) fields.next_action = text(b.nextAction, 500);
  if (b.estMinutes !== undefined) fields.est_minutes = journal.minutesValue(b.estMinutes);
  return fields;
}

app.post('/api/done/todos', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const screens = await appScreens(product.id, req.body.screenIds);
  const f = { stage: 'todo', priority: 'medium', next_action: '', started_at: null, est_minutes: null, ...todoFields(req.body) };
  const { id, created } = await insertOnce(
    `INSERT INTO done_todos (id, user_id, product_id, text, screen_ids, stage, priority, next_action, started_at, est_minutes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $2, $2)`,
    [newId(req), req.user.id, product.id, required(text(req.body.text, 1000), 'The point'), screens.map((x) => x.id),
      f.stage, f.priority, f.next_action, f.started_at, f.est_minutes], 'done_todos', req.user.id);
  res.status(created ? 201 : 200).json(toTodo(await live('done_todos', id, '*')));
}));

app.patch('/api/done/todos/:id', route(async (req, res) => {
  const row = await ownTodo(req, req.params.id);
  const fields = todoFields(req.body, row);
  if (req.body.text !== undefined) fields.text = required(text(req.body.text, 1000), 'The point');
  if (req.body.screenIds !== undefined) fields.screen_ids = (await appScreens(row.product_id, req.body.screenIds)).map((x) => x.id);
  await update('done_todos', row.id, fields, req.user.id);
  res.json(toTodo(await live('done_todos', row.id, '*')));
}));

app.delete('/api/done/todos/:id', route(async (req, res) => {
  const row = await ownTodo(req, req.params.id);
  await softDelete('done_todos', row.id, req.user.id);
  res.json({ ok: true });
}));

// Tick a point: it becomes an entry of today's "done" (its text and screens, and the time spent if given). Untick: that
// entry goes, the point is open again. The point is locked while this runs, so two ticks at once make one entry.
app.put('/api/done/todos/:id/done', route(async (req, res) => {
  const row = await ownTodo(req, req.params.id);
  const done = Boolean(req.body.done);
  const minutes = done ? journal.minutesValue(req.body.minutes) : null;
  await db.tx(async (client) => {
    const { rows: [cur] } = await client.query('SELECT done_at, done_item_id FROM done_todos WHERE id = $1 FOR UPDATE', [row.id]);
    if (done === Boolean(cur.done_at)) return;
    if (!done) {
      if (cur.done_item_id) await client.query('UPDATE done_items SET is_deleted = true, updated_by = $2 WHERE id = $1', [cur.done_item_id, req.user.id]);
      await client.query('UPDATE done_todos SET done_at = NULL, done_item_id = NULL, updated_by = $2 WHERE id = $1', [row.id, req.user.id]);
      return;
    }
    const id = randomUUID();
    await client.query(
      `INSERT INTO done_items (id, user_id, product_id, work_date, text, screen_ids, todo_id, minutes, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $2, $2)`,
      [id, row.user_id, row.product_id, localNow().date, row.text, row.screen_ids, row.id, minutes]);
    await client.query('UPDATE done_todos SET done_at = now(), done_item_id = $2, updated_by = $3 WHERE id = $1', [row.id, id, req.user.id]);
  });
  const todo = await live('done_todos', row.id, '*');
  res.json({ todo: toTodo(todo), item: todo.done_item_id ? await doneById(todo.done_item_id) : null });
}));

// Share my day: every entry I wrote on that day, with links to the screens I changed
app.post('/api/done/share', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const { date: today } = localNow();
  const date = pastDay(req.body.date, today);
  const { rows } = await db.query(
    'SELECT * FROM done_items WHERE product_id = $1 AND user_id = $2 AND work_date = $3 AND NOT is_deleted ORDER BY created_at',
    [product.id, req.user.id, date]);
  if (!rows.length) throw new HttpError(400, 'Add what you did first');
  if (!product.teams_webhook) throw new HttpError(400, 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.');
  const lines = await Promise.all(rows.map((r) => doneLine(req, product.id, r)));
  const total = rows.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const sent = await toTeams(product, {
    title: `✅ ${personName(req.user)} — done ${date === today ? 'today' : `on ${date}`}`,
    lines,
    facts: [['App', product.name], ['Date', date], ...(total ? [['Time logged', timeText(total)]] : [])],
    actions: [['Open in FlowTrace', deeplink(req, `done=${product.id}`)]],
  });
  if (sent !== 'sent') throw new HttpError(502, sent);
  await db.query('UPDATE done_items SET shared_at = now(), updated_by = $2 WHERE id = ANY($1)', [rows.map((r) => r.id), req.user.id]);
  res.json({ teams: sent });
}));

// Share one of my entries with people of the app (the whole list; people added now are @mentioned on Teams).
// It shows under their "Shared with me" until a tester or super admin closes it.
app.put('/api/done/:id/shared-with', route(async (req, res) => {
  const row = await ownDone(req, req.params.id);
  const product = await live('products', row.product_id, '*');
  const { rows: people } = await peopleOf(product.id);
  const wanted = Array.isArray(req.body.userIds) ? req.body.userIds : [];
  const ids = people.filter((u) => u.id !== row.user_id && wanted.includes(u.id)).map((u) => u.id);
  await update('done_items', row.id, { shared_with: ids }, req.user.id);
  const added = people.filter((u) => ids.includes(u.id) && !row.shared_with.includes(u.id));
  let sent = null;
  if (added.length) {
    const { rows: [author] } = await db.query('SELECT name, username FROM users WHERE id = $1', [row.user_id]);
    sent = await toTeams(product, {
      title: `📌 ${personName(author)} shared a change with you`,
      lines: [await doneLine(req, product.id, row), added.some((u) => u.teams_email) ? '' : `For: ${added.map(personName).join(', ')}`],
      facts: [['App', product.name], ['Date', row.work_date]],
      actions: [['Open in FlowTrace', deeplink(req, `done=${product.id}&tab=shared`)]],
      mentions: added.flatMap(mention),
    });
    if (sent === 'sent') await db.query('UPDATE done_items SET shared_at = now() WHERE id = $1', [row.id]);
  }
  res.json({ item: await doneById(row.id), teams: sent });
}));

// Close (or reopen) an entry shared with me: testers and super admins, once the change is checked.
// Closing tells the author on Teams.
app.put('/api/done/:id/closed', route(async (req, res) => {
  const row = await live('done_items', req.params.id, '*');
  const product = await productFor(req, row.product_id, 'edit');
  if (!canCloseDone(req.user)) throw new HttpError(403, 'Only testers and super admins can close a shared change');
  if (req.user.access !== 'super' && !row.shared_with.includes(req.user.id)) throw new HttpError(403, 'Only people it was shared with can close it');
  const closed = Boolean(req.body.closed);
  await db.query(
    `UPDATE done_items SET closed_at = CASE WHEN $2::boolean THEN now() END, closed_by = CASE WHEN $2::boolean THEN $3::text END, updated_by = $3
     WHERE id = $1`, [row.id, closed, req.user.id]);
  let sent = null;
  if (closed && !row.closed_at) {
    const { rows: [author] } = await db.query('SELECT name, username, teams_email FROM users WHERE id = $1 AND NOT is_deleted', [row.user_id]);
    sent = await toTeams(product, {
      title: `✅ ${personName(req.user)} closed a change`,
      lines: [await doneLine(req, product.id, row)],
      facts: [['App', product.name], ['Done on', row.work_date], ['By', personName(author)]],
      actions: [['Open in FlowTrace', deeplink(req, `done=${product.id}&date=${row.work_date}`)]],
      mentions: mention(author),
    });
  }
  res.json({ item: await doneById(row.id), teams: sent });
}));

// ---- questions / doubts: collected for a meeting, open until resolved (journal.js has the workflow and rights)

const QUESTION_SELECT = `SELECT q.*, u.name, u.username, a.name AS assignee_name, a.username AS assignee_username
  FROM journal_questions q JOIN users u ON u.id = q.user_id LEFT JOIN users a ON a.id = q.assignee_id`;
const toQuestion = (r, user) => ({
  id: r.id, userId: r.user_id, userName: personName(r), raisedOn: r.raised_on, text: r.text, details: r.details,
  expected: r.expected, screenIds: r.screen_ids, apis: r.apis, priority: r.priority, assigneeId: r.assignee_id,
  assigneeName: personName({ name: r.assignee_name, username: r.assignee_username }), meetingDate: r.meeting_date,
  status: r.status, answer: r.answer, discussedAt: r.discussed_at, resolvedAt: r.resolved_at, resolvedOn: r.resolved_on,
  resolvedBy: r.resolved_by, rights: journal.questionRights(user, r), ...audit(r),
});

// A question this login may see (else it looks like it does not exist), with its app checked
async function questionFor(req, id, level = 'view') {
  const row = await live('journal_questions', text(id, 80), '*');
  const product = await productFor(req, row.product_id, level);
  if (!journal.questionRights(req.user, row).view) throw new HttpError(404, 'Not found');
  return { row, product };
}
const questionById = async (id, user) => toQuestion(await one(`${QUESTION_SELECT} WHERE q.id = $1`, [id]), user);

// Someone of the app (to assign a question, or to say who a blocker waits on); '' / null = nobody
async function personOf(productId, id, what) {
  if (!id) return null;
  const { rows } = await peopleOf(productId);
  const person = rows.find((u) => u.id === id);
  if (!person) throw new HttpError(400, `Pick ${what} from the people of this app`);
  return person;
}

// @mention the person a question is assigned to (or a blocker waits on) on the app's Teams channel; never fails the save
async function tellPerson(req, product, person, { title, line, hash }) {
  if (!person || person.id === req.user.id || !product.teams_webhook) return null;
  return toTeams(product, {
    title, lines: [line, person.teams_email ? '' : `For: ${personName(person)}`],
    facts: [['App', product.name], ['From', personName(req.user)]],
    actions: [['Open in FlowTrace', deeplink(req, hash)]],
    mentions: mention(person),
  });
}

// question fields from a request body (only what was sent); screens and person are checked against the app
async function questionFields(b, productId) {
  const fields = {};
  if (b.text !== undefined) fields.text = required(text(b.text, 1000), 'The question');
  if (b.details !== undefined) fields.details = text(b.details, 2000);
  if (b.expected !== undefined) fields.expected = text(b.expected, 2000);
  if (b.screenIds !== undefined) fields.screen_ids = (await appScreens(productId, b.screenIds)).map((x) => x.id);
  if (b.apis !== undefined) fields.apis = journal.apiList(b.apis);
  if (b.priority !== undefined) fields.priority = journal.priority(b.priority);
  if (b.assigneeId !== undefined) fields.assignee_id = (await personOf(productId, b.assigneeId, 'who answers it')) ? b.assigneeId : null;
  if (b.meetingDate !== undefined) fields.meeting_date = journal.meetingDay(b.meetingDate);
  return fields;
}

// The same question still open in this app (asked again, or the form sent twice) is not added a second time
async function sameOpenQuestion(productId, words, exceptId = '') {
  const { rows } = await db.query(
    `SELECT id, text FROM journal_questions WHERE product_id = $1 AND NOT is_deleted AND status <> 'resolved' AND id <> $2`,
    [productId, exceptId]);
  return rows.find((r) => journal.sameText(r.text) === journal.sameText(words));
}

app.post('/api/journal/questions', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const f = await questionFields({ ...req.body, text: req.body.text === undefined ? '' : req.body.text }, product.id);
  const id = newId(req);
  const dup = await sameOpenQuestion(product.id, f.text, id);
  if (dup) throw new HttpError(409, `This question is already open: "${dup.text.slice(0, 120)}"`);
  const { created } = await insertOnce(
    `INSERT INTO journal_questions (id, product_id, user_id, raised_on, text, details, expected, screen_ids, apis, priority,
       assignee_id, meeting_date, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $3, $3)`,
    [id, product.id, req.user.id, localNow().date, f.text, f.details || '', f.expected || '', f.screen_ids || [], f.apis || [],
      f.priority || 'medium', f.assignee_id || null, f.meeting_date || null], 'journal_questions', req.user.id);
  const teamsSent = created && f.assignee_id ? await tellPerson(req, product, await personOf(product.id, f.assignee_id, ''), {
    title: `❓ ${personName(req.user)} has a question for you`, line: `• ${f.text}`, hash: `done=${product.id}&tab=questions`,
  }) : null;
  res.status(created ? 201 : 200).json({ question: await questionById(id, req.user), teams: teamsSent });
}));

// Edit a question (author, admins); the person it is assigned to may change only its meeting day and answer
app.patch('/api/journal/questions/:id', route(async (req, res) => {
  const { row, product } = await questionFor(req, req.params.id, 'edit');
  const rights = journal.questionRights(req.user, row);
  const b = { ...req.body };
  if (!rights.edit) {
    if (!rights.move) throw new HttpError(403, 'Only the person who asked, the person it is assigned to, or an admin can change this question');
    ['text', 'details', 'expected', 'screenIds', 'apis', 'priority', 'assigneeId'].forEach((k) => delete b[k]);
  }
  const fields = await questionFields(b, row.product_id);
  if (b.answer !== undefined) fields.answer = text(b.answer, 2000);
  if (fields.text) {
    const dup = await sameOpenQuestion(row.product_id, fields.text, row.id);
    if (dup && row.status !== 'resolved') throw new HttpError(409, `This question is already open: "${dup.text.slice(0, 120)}"`);
  }
  await update('journal_questions', row.id, fields, req.user.id);
  const teamsSent = fields.assignee_id && fields.assignee_id !== row.assignee_id
    ? await tellPerson(req, product, await personOf(product.id, fields.assignee_id, ''), {
      title: `❓ ${personName(req.user)} has a question for you`, line: `• ${fields.text || row.text}`, hash: `done=${product.id}&tab=questions`,
    }) : null;
  res.json({ question: await questionById(row.id, req.user), teams: teamsSent });
}));

// Move a question along: open → ready → discussed → resolved (or back). An answer can be saved with it.
app.put('/api/journal/questions/:id/status', route(async (req, res) => {
  const { row } = await questionFor(req, req.params.id, 'edit');
  if (!journal.questionRights(req.user, row).move) throw new HttpError(403, 'Only the person who asked, the person it is assigned to, or an admin can move this question');
  const fields = journal.questionStatusFields(row.status, req.body.status, { userId: req.user.id, today: localNow().date });
  if (req.body.answer !== undefined) fields.answer = text(req.body.answer, 2000);
  if (fields.status && fields.status !== 'resolved' && row.status === 'resolved') {
    const dup = await sameOpenQuestion(row.product_id, row.text, row.id);
    if (dup) throw new HttpError(409, `The same question is open again already: "${dup.text.slice(0, 120)}"`);
  }
  await update('journal_questions', row.id, fields, req.user.id);
  res.json({ question: await questionById(row.id, req.user) });
}));

app.delete('/api/journal/questions/:id', route(async (req, res) => {
  const { row } = await questionFor(req, req.params.id, 'edit');
  if (!journal.questionRights(req.user, row).remove) throw new HttpError(403, 'Only the person who asked or an admin can delete this question');
  await softDelete('journal_questions', row.id, req.user.id);
  res.json({ ok: true });
}));

// The agenda of a meeting day (default today): the unresolved questions set for it, plus those ready for discussion
// without a meeting yet or left over from an earlier one. Each question once, most urgent first.
async function agendaOf(req, productId, day) {
  const { rows } = await db.query(
    `${QUESTION_SELECT} WHERE q.product_id = $1 AND NOT q.is_deleted AND ${journal.ON_AGENDA('q', '$2')}
       AND ($3 OR q.user_id = $4 OR q.assignee_id = $4)
     ORDER BY CASE q.status WHEN 'ready' THEN 0 WHEN 'open' THEN 1 ELSE 2 END, ${PRIORITY_ORDER('q.priority')}, q.raised_on, q.created_at`,
    [productId, day, isAdmin(req.user), req.user.id]);
  return rows.map((q) => toQuestion(q, req.user));
}
const agendaDay = (value) => (journal.isDay(value) ? value : localNow().date);

app.get('/api/journal/agenda', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const date = agendaDay(req.query.date);
  res.json({ date, items: await agendaOf(req, product.id, date) });
}));

// Post the agenda to the app's Teams channel, @mentioning the people who answer the questions
app.post('/api/journal/agenda/share', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  if (!product.teams_webhook) throw new HttpError(400, 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.');
  const date = agendaDay(req.body.date);
  const items = await agendaOf(req, product.id, date);
  if (!items.length) throw new HttpError(400, 'Nothing on this agenda yet. Mark questions "Ready for discussion" or set their meeting date.');
  const { rows: people } = await peopleOf(product.id);
  const asked = people.filter((u) => items.some((q) => q.assigneeId === u.id));
  const sent = await toTeams(product, {
    title: `🗓️ Meeting agenda · ${product.name} · ${date}`,
    lines: items.map((q, i) => `${i + 1}. [${q.priority}] ${q.text}${q.assigneeName ? ` → ${q.assigneeName}` : ''}${q.expected ? `\n   Expected: ${q.expected}` : ''}${q.apis.length ? `\n   APIs: ${q.apis.join(', ')}` : ''}`),
    facts: [['Questions', String(items.length)], ['Date', date]],
    actions: [['Open in FlowTrace', deeplink(req, `done=${product.id}&tab=questions`)]],
    mentions: asked.flatMap(mention),
  });
  if (sent !== 'sent') throw new HttpError(502, sent);
  res.json({ teams: sent, count: items.length });
}));

// ---- blockers: what stops my work, who it waits on and the next action; open until resolved

const BLOCKER_SELECT = `SELECT b.*, u.name, u.username, w.name AS waiting_name, w.username AS waiting_username, t.text AS todo_text
  FROM journal_blockers b JOIN users u ON u.id = b.user_id LEFT JOIN users w ON w.id = b.waiting_on
  LEFT JOIN done_todos t ON t.id = b.todo_id AND NOT t.is_deleted`;
const toBlocker = (r, user) => ({
  id: r.id, userId: r.user_id, userName: personName(r), raisedOn: r.raised_on, text: r.text, screenIds: r.screen_ids,
  priority: r.priority, waitingOn: r.waiting_on, waitingName: personName({ name: r.waiting_name, username: r.waiting_username }),
  nextAction: r.next_action, todoId: r.todo_id, todoText: r.todo_text || '', resolution: r.resolution,
  resolvedAt: r.resolved_at, resolvedOn: r.resolved_on, resolvedBy: r.resolved_by, rights: journal.blockerRights(user, r), ...audit(r),
});
async function blockerFor(req, id) {
  const row = await live('journal_blockers', text(id, 80), '*');
  const product = await productFor(req, row.product_id, 'edit');
  if (!journal.blockerRights(req.user, row).view) throw new HttpError(404, 'Not found');
  return { row, product };
}
const blockerById = async (id, user) => toBlocker(await one(`${BLOCKER_SELECT} WHERE b.id = $1`, [id]), user);

async function blockerFields(req, b, productId) {
  const fields = {};
  if (b.text !== undefined) fields.text = required(text(b.text, 1000), 'What blocks you');
  if (b.screenIds !== undefined) fields.screen_ids = (await appScreens(productId, b.screenIds)).map((x) => x.id);
  if (b.priority !== undefined) fields.priority = journal.priority(b.priority);
  if (b.nextAction !== undefined) fields.next_action = text(b.nextAction, 500);
  if (b.waitingOn !== undefined) fields.waiting_on = (await personOf(productId, b.waitingOn, 'who it waits on')) ? b.waitingOn : null;
  if (b.todoId !== undefined) {
    fields.todo_id = null;
    if (b.todoId) {
      const { rows } = await db.query('SELECT id FROM done_todos WHERE id = $1 AND product_id = $2 AND user_id = $3 AND NOT is_deleted',
        [b.todoId, productId, req.user.id]);
      if (!rows[0]) throw new HttpError(400, 'Pick one of your own points');
      fields.todo_id = rows[0].id;
    }
  }
  return fields;
}

app.post('/api/journal/blockers', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const f = await blockerFields(req, { ...req.body, text: req.body.text === undefined ? '' : req.body.text }, product.id);
  const { id, created } = await insertOnce(
    `INSERT INTO journal_blockers (id, product_id, user_id, raised_on, text, screen_ids, priority, waiting_on, next_action, todo_id,
       created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $3, $3)`,
    [newId(req), product.id, req.user.id, localNow().date, f.text, f.screen_ids || [], f.priority || 'high', f.waiting_on || null,
      f.next_action || '', f.todo_id || null], 'journal_blockers', req.user.id);
  const teamsSent = created && f.waiting_on ? await tellPerson(req, product, await personOf(product.id, f.waiting_on, ''), {
    title: `⛔ ${personName(req.user)} is blocked, waiting on you`, line: `• ${f.text}${f.next_action ? `\n  Next: ${f.next_action}` : ''}`,
    hash: `done=${product.id}&tab=blockers`,
  }) : null;
  res.status(created ? 201 : 200).json({ blocker: await blockerById(id, req.user), teams: teamsSent });
}));

app.patch('/api/journal/blockers/:id', route(async (req, res) => {
  const { row } = await blockerFor(req, req.params.id);
  if (!journal.blockerRights(req.user, row).edit) throw new HttpError(403, 'You can only change your own blockers');
  await update('journal_blockers', row.id, await blockerFields(req, req.body, row.product_id), req.user.id);
  res.json({ blocker: await blockerById(row.id, req.user) });
}));

// Resolve (with how) or open again: the author, super admins and the person it waits on
app.put('/api/journal/blockers/:id/resolved', route(async (req, res) => {
  const { row } = await blockerFor(req, req.params.id);
  if (!journal.blockerRights(req.user, row).resolve) throw new HttpError(403, 'Only the person blocked or the person it waits on can resolve it');
  const resolved = Boolean(req.body.resolved);
  let fields = {};
  if (!resolved) fields = row.resolved_at ? { resolved_at: null, resolved_on: null, resolved_by: null } : {};
  else if (row.resolved_at) fields = { resolution: text(req.body.resolution, 1000) }; // already resolved: only the how
  else fields = { resolved_at: new Date(), resolved_on: localNow().date, resolved_by: req.user.id, resolution: text(req.body.resolution, 1000) };
  await update('journal_blockers', row.id, fields, req.user.id);
  res.json({ blocker: await blockerById(row.id, req.user) });
}));

app.delete('/api/journal/blockers/:id', route(async (req, res) => {
  const { row } = await blockerFor(req, req.params.id);
  if (!journal.blockerRights(req.user, row).edit) throw new HttpError(403, 'You can only delete your own blockers');
  await softDelete('journal_blockers', row.id, req.user.id);
  res.json({ ok: true });
}));

// ---- minutes of meeting: a meeting's points, each Done / To be discussed with someone / Deferred, shared on Teams

const toMeeting = (r, user) => ({
  id: r.id, productId: r.product_id, date: r.meeting_date, title: r.title, attendees: r.attendees, sharedAt: r.shared_at,
  points: r.points === undefined ? undefined : r.points, done: r.done_count === undefined ? undefined : r.done_count,
  createdByName: personName({ name: r.creator_name, username: r.creator_username }), rights: journal.meetingRights(user, r), ...audit(r),
});
const POINT_SELECT = `SELECT p.*, w.name AS with_name, w.username AS with_username, q.status AS question_status
  FROM journal_meeting_points p LEFT JOIN users w ON w.id = p.discuss_with LEFT JOIN journal_questions q ON q.id = p.question_id`;
const toPoint = (r) => ({
  id: r.id, meetingId: r.meeting_id, text: r.text, status: r.status, discussWith: r.discuss_with,
  discussWithName: personName({ name: r.with_name, username: r.with_username }), questionId: r.question_id,
  questionStatus: r.question_status || null, order: r.sort_order, ...audit(r),
});

async function meetingFor(req, id, level = 'view') {
  const row = await live('journal_meetings', text(id, 80), '*');
  const product = await productFor(req, row.product_id, level);
  return { row, product };
}
async function meetingWithPoints(id, user) {
  const meeting = await one(`SELECT m.*, u.name AS creator_name, u.username AS creator_username
    FROM journal_meetings m LEFT JOIN users u ON u.id = m.created_by WHERE m.id = $1`, [id]);
  const { rows } = await db.query(`${POINT_SELECT} WHERE p.meeting_id = $1 AND NOT p.is_deleted ORDER BY p.sort_order, p.created_at`, [id]);
  return { meeting: toMeeting(meeting, user), points: rows.map(toPoint) };
}
// people of the app picked as attendees (others are dropped)
async function attendeesOf(productId, value) {
  const wanted = Array.isArray(value) ? value.filter((x) => typeof x === 'string') : [];
  const { rows } = await peopleOf(productId);
  return rows.filter((u) => wanted.includes(u.id)).map((u) => u.id);
}

app.get('/api/journal/meetings', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const { rows } = await db.query(
    `SELECT m.*, u.name AS creator_name, u.username AS creator_username,
       (SELECT count(*)::int FROM journal_meeting_points p WHERE p.meeting_id = m.id AND NOT p.is_deleted) AS points,
       (SELECT count(*)::int FROM journal_meeting_points p WHERE p.meeting_id = m.id AND NOT p.is_deleted AND p.status = 'done') AS done_count
     FROM journal_meetings m LEFT JOIN users u ON u.id = m.created_by
     WHERE m.product_id = $1 AND NOT m.is_deleted ORDER BY m.meeting_date DESC, m.created_at DESC LIMIT 100`, [product.id]);
  res.json({ meetings: rows.map((r) => toMeeting(r, req.user)), canCreate: req.user.access !== 'view' });
}));

app.post('/api/journal/meetings', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const date = req.body.date ? journal.meetingDay(req.body.date) : localNow().date;
  if (!date) throw new HttpError(400, 'Meeting date is required');
  const { id, created } = await insertOnce(
    `INSERT INTO journal_meetings (id, product_id, meeting_date, title, attendees, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $6)`,
    [newId(req), product.id, date, text(req.body.title, 200) || 'Team meeting', await attendeesOf(product.id, req.body.attendees), req.user.id],
    'journal_meetings', req.user.id, 'created_by');
  res.status(created ? 201 : 200).json(await meetingWithPoints(id, req.user));
}));

app.get('/api/journal/meetings/:id', route(async (req, res) => {
  const { row } = await meetingFor(req, req.params.id);
  res.json(await meetingWithPoints(row.id, req.user));
}));

app.patch('/api/journal/meetings/:id', route(async (req, res) => {
  const { row } = await meetingFor(req, req.params.id, 'edit');
  const fields = {};
  if (req.body.title !== undefined) fields.title = required(text(req.body.title, 200), 'Meeting title');
  if (req.body.date !== undefined) {
    fields.meeting_date = journal.meetingDay(req.body.date);
    if (!fields.meeting_date) throw new HttpError(400, 'Meeting date is required');
  }
  if (req.body.attendees !== undefined) fields.attendees = await attendeesOf(row.product_id, req.body.attendees);
  await update('journal_meetings', row.id, fields, req.user.id);
  res.json(await meetingWithPoints(row.id, req.user));
}));

app.delete('/api/journal/meetings/:id', route(async (req, res) => {
  const { row } = await meetingFor(req, req.params.id, 'edit');
  if (!journal.meetingRights(req.user, row).remove) throw new HttpError(403, 'Only the person who started these minutes or an admin can delete them');
  await softDelete('journal_meetings', row.id, req.user.id);
  res.json({ ok: true });
}));

const nextPointOrder = (meetingId) => db.query(
  'SELECT coalesce(max(sort_order), 0) + 1 AS n FROM journal_meeting_points WHERE meeting_id = $1', [meetingId]).then(({ rows }) => rows[0].n);

app.post('/api/journal/meetings/:id/points', route(async (req, res) => {
  const { row } = await meetingFor(req, req.params.id, 'edit');
  const words = required(text(req.body.text, 1000), 'The point');
  const pointId = newId(req);
  const { rows } = await db.query(
    `INSERT INTO journal_meeting_points (id, meeting_id, text, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $5) ON CONFLICT (id) DO NOTHING RETURNING id`, [pointId, row.id, words, await nextPointOrder(row.id), req.user.id]);
  if (!rows[0]) {
    const { rows: [had] } = await db.query('SELECT meeting_id FROM journal_meeting_points WHERE id = $1', [pointId]);
    if (!had || had.meeting_id !== row.id) throw new HttpError(409, 'This point was already saved. Refresh and try again.');
  }
  res.status(rows[0] ? 201 : 200).json(await meetingWithPoints(row.id, req.user));
}));

// The meeting's agenda (questions set for its day, and ready ones left over) as points, each question once
app.post('/api/journal/meetings/:id/from-agenda', route(async (req, res) => {
  const { row } = await meetingFor(req, req.params.id, 'edit');
  const items = await agendaOf(req, row.product_id, row.meeting_date);
  let order = await nextPointOrder(row.id);
  let added = 0;
  for (const q of items) {
    const { rowCount } = await db.query(
      `INSERT INTO journal_meeting_points (id, meeting_id, text, question_id, sort_order, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       ON CONFLICT (meeting_id, question_id) WHERE question_id IS NOT NULL AND NOT is_deleted DO NOTHING`,
      [randomUUID(), row.id, q.text, q.id, order, req.user.id]);
    added += rowCount;
    order += rowCount;
  }
  res.json({ added, ...(await meetingWithPoints(row.id, req.user)) });
}));

// Edit a point, or tick it: Done / To be discussed with someone / Deferred (or open again). A point from a question
// moves that question along when the login may (journal.questionAfterPoint).
app.patch('/api/journal/points/:id', route(async (req, res) => {
  const point = await live('journal_meeting_points', text(req.params.id, 80), '*');
  const { row: meeting } = await meetingFor(req, point.meeting_id, 'edit');
  const fields = {};
  if (req.body.text !== undefined) fields.text = required(text(req.body.text, 1000), 'The point');
  if (req.body.status !== undefined) {
    const withId = req.body.status === 'discuss' ? (await personOf(meeting.product_id, req.body.discussWith, 'who it is to be discussed with') || {}).id : null;
    Object.assign(fields, journal.pointStatusFields(req.body.status, withId));
  }
  await update('journal_meeting_points', point.id, fields, req.user.id);
  let question = null;
  if (fields.status && point.question_id) {
    const { rows: [q] } = await db.query('SELECT * FROM journal_questions WHERE id = $1 AND NOT is_deleted', [point.question_id]);
    const to = q && journal.questionRights(req.user, q).move && journal.questionAfterPoint(fields.status, q.status);
    if (to) {
      const qf = journal.questionStatusFields(q.status, to, { userId: req.user.id, today: localNow().date });
      if (fields.status === 'deferred') qf.meeting_date = null; // on the next agenda, whenever that is
      await update('journal_questions', q.id, qf, req.user.id);
      question = to;
    }
  }
  res.json({ ...(await meetingWithPoints(meeting.id, req.user)), question });
}));

app.delete('/api/journal/points/:id', route(async (req, res) => {
  const point = await live('journal_meeting_points', text(req.params.id, 80), '*');
  const { row: meeting } = await meetingFor(req, point.meeting_id, 'edit');
  await softDelete('journal_meeting_points', point.id, req.user.id);
  res.json(await meetingWithPoints(meeting.id, req.user));
}));

const POINT_GROUPS = [['done', '✅ Done'], ['discuss', '💬 To be discussed'], ['deferred', '⏸️ Deferred'], ['open', '• Open']];

// Share the minutes on the app's Teams channel: every point, or only the ones picked; @mentions the people picked and
// everyone a shared point is to be discussed with
app.post('/api/journal/meetings/:id/share', route(async (req, res) => {
  const { row, product } = await meetingFor(req, req.params.id, 'edit');
  if (!product.teams_webhook) throw new HttpError(400, 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.');
  const { points } = await meetingWithPoints(row.id, req.user);
  const picked = Array.isArray(req.body.pointIds) && req.body.pointIds.length ? req.body.pointIds : null;
  const shared = picked ? points.filter((p) => picked.includes(p.id)) : points;
  if (!shared.length) throw new HttpError(400, picked ? 'Pick points of these minutes to share' : 'Add points to the minutes first');
  const { rows: people } = await peopleOf(product.id);
  const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [];
  const mentioned = people.filter((u) => userIds.includes(u.id) || shared.some((p) => p.discussWith === u.id));
  const lines = [];
  POINT_GROUPS.forEach(([status, label]) => {
    const list = shared.filter((p) => p.status === status);
    if (!list.length) return;
    lines.push(`**${label}**`);
    list.forEach((p) => lines.push(`- ${p.text}${status === 'discuss' ? ` → with ${p.discussWithName}` : ''}`));
  });
  const note = text(req.body.note, 500);
  const attendees = people.filter((u) => row.attendees.includes(u.id)).map(personName);
  const sent = await toTeams(product, {
    title: `📝 Minutes: ${row.title} · ${row.meeting_date}${picked ? ` (${shared.length} of ${points.length} points)` : ''}`,
    lines: [...(note ? [note, ''] : []), ...lines],
    facts: [['App', product.name], ['Date', row.meeting_date], ...(attendees.length ? [['Attended', attendees.join(', ')]] : []), ['Shared by', personName(req.user)]],
    actions: [['Open in FlowTrace', deeplink(req, `done=${product.id}&tab=minutes&meeting=${row.id}`)]],
    mentions: mentioned.flatMap(mention),
  });
  if (sent !== 'sent') throw new HttpError(502, sent);
  await db.query('UPDATE journal_meetings SET shared_at = now(), updated_by = $2 WHERE id = $1', [row.id, req.user.id]);
  res.json({ teams: sent, count: shared.length });
}));

// ---- search the journal across all days: entries, points, questions and blockers this login can see

app.get('/api/journal/search', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const q = text(req.query.q, 100);
  if (q.length < 2) throw new HttpError(400, 'Type at least 2 characters to search');
  const like = journal.likePattern(q);
  const everyone = req.user.access === 'super';
  const [{ rows: done }, { rows: todos }, { rows: questions }, { rows: blockers }] = await Promise.all([
    db.query(`${DONE_SELECT} WHERE d.product_id = $1 AND NOT d.is_deleted AND ($2 OR d.user_id = $3) AND d.text ILIKE $4
              ORDER BY d.work_date DESC, d.created_at DESC LIMIT 30`, [product.id, everyone, req.user.id, like]),
    db.query(`SELECT * FROM done_todos WHERE product_id = $1 AND user_id = $2 AND NOT is_deleted AND done_at IS NULL
                AND (text ILIKE $3 OR next_action ILIKE $3) ORDER BY created_at DESC LIMIT 30`, [product.id, req.user.id, like]),
    db.query(`${QUESTION_SELECT} WHERE q.product_id = $1 AND NOT q.is_deleted AND ($2 OR q.user_id = $3 OR q.assignee_id = $3)
                AND (q.text ILIKE $4 OR q.details ILIKE $4 OR q.expected ILIKE $4 OR q.answer ILIKE $4 OR array_to_string(q.apis, ' ') ILIKE $4)
              ORDER BY q.raised_on DESC, q.created_at DESC LIMIT 30`, [product.id, isAdmin(req.user), req.user.id, like]),
    db.query(`${BLOCKER_SELECT} WHERE b.product_id = $1 AND NOT b.is_deleted AND ($2 OR b.user_id = $3 OR b.waiting_on = $3)
                AND (b.text ILIKE $4 OR b.next_action ILIKE $4 OR b.resolution ILIKE $4)
              ORDER BY b.raised_on DESC, b.created_at DESC LIMIT 30`, [product.id, everyone, req.user.id, like]),
  ]);
  res.json({
    q, done: done.map(toDone), todos: todos.map(toTodo),
    questions: questions.map((x) => toQuestion(x, req.user)), blockers: blockers.map((x) => toBlocker(x, req.user)),
  });
}));

// ---- writing assistant (assist.js): grammar / tone suggestions for the journal's text boxes

app.get('/api/assist', (req, res) => res.json({ ai: assist.configured(), tones: assist.TONES, maxText: assist.MAX_TEXT }));

app.post('/api/assist', route(async (req, res) => {
  need(req, 'edit');
  const tone = req.body.tone ? text(req.body.tone, 20) : '';
  res.json(await assist.suggest({ text: typeof req.body.text === 'string' ? req.body.text : '', tone, userId: req.user.id }));
}));

// ---------------------------------------------------------------- sheets: spreadsheets made inside an app

const SHEET_TYPES = ['text', 'number', 'date', 'select', 'checkbox', 'person', 'flow', 'screen', 'formula'];
const FORMAT_KINDS = ['', 'number', 'percent', 'currency', 'date', 'text'];
const SHEET_SHARES = ['private', 'view', 'edit'];

// Who may do what with a sheet: owner and super admins manage it (rename, share, delete); they, the editors and,
// when shared to edit, anyone in the app with Update tasks or more change columns and rows; view-only logins only look.
// Viewers are people a private sheet is shared with to look at only.
function sheetRights(user, sheet) {
  const manage = user.access === 'super' || sheet.owner_id === user.id;
  const editor = sheet.editors.includes(user.id);
  const edit = auth.atLeast(user, 'edit') && (manage || editor || sheet.share === 'edit');
  const view = edit || manage || editor || (sheet.viewers || []).includes(user.id) || sheet.share !== 'private';
  return { view, edit, manage };
}

async function sheetFor(req, id, need = 'view') {
  const sheet = await live('sheets', id, '*');
  await productFor(req, sheet.product_id, 'view');
  const rights = sheetRights(req.user, sheet);
  if (!rights.view) throw new HttpError(404, 'Not found');
  if (!rights[need]) throw new HttpError(403, need === 'manage' ? 'Only the owner of this sheet can do that.' : 'This sheet is read only for you.');
  return { sheet, rights };
}

const toSheet = (r, user) => ({
  id: r.id, productId: r.product_id, name: r.name, ownerId: r.owner_id, share: r.share, editors: r.editors, viewers: r.viewers || [],
  rows: r.row_count, ...sheetRights(user, r), ...audit(r),
});
// columns (optional): the sheet's columns, to show a formula with their names ([Qty] * [Price])
const toSheetColumn = (r, columns) => ({
  id: r.id, name: r.name, type: r.type, options: r.options, colors: r.colors || {}, fonts: r.fonts || {}, width: r.width, order: r.sort_order,
  formula: r.formula || '', format: r.format || {}, ...(columns && r.type === 'formula' ? { formulaText: formula.toNames(r.formula, columns) } : {}),
});
const toSheetRow = (r) => ({ id: r.id, cells: r.cells, styles: r.styles || {}, order: r.sort_order, updatedAt: r.updated_at, updatedBy: r.updated_by });

// columns: the sheet's other columns (a formula names them)
function columnFields(b, current = {}, columns = []) {
  const fields = {};
  if (b.name !== undefined) fields.name = required(text(b.name, 60), 'Column name');
  if (b.type !== undefined) fields.type = oneOf(b.type, SHEET_TYPES, 'column type');
  if (b.options !== undefined) {
    const list = Array.isArray(b.options) ? b.options : String(b.options).split(',');
    fields.options = [...new Set(list.map((x) => text(x, 80)).filter(Boolean))].slice(0, 100);
  }
  if ((fields.type || current.type) === 'formula') {
    if (b.formula !== undefined) {
      try {
        fields.formula = formula.toIds(text(b.formula, 2000), columns.filter((c) => c.id !== current.id));
      } catch (err) {
        throw new HttpError(400, `Formula: ${err.message}`);
      }
    }
    if (!(fields.formula || current.formula)) throw new HttpError(400, 'A formula column needs a formula, e.g. [Qty] * [Price]');
  }
  if (b.format !== undefined) {
    const f = b.format && typeof b.format === 'object' ? b.format : { kind: String(b.format || '') };
    const kind = oneOf(f.kind || '', FORMAT_KINDS, 'format');
    const decimals = Number.isInteger(Number(f.decimals)) && f.decimals !== '' && f.decimals !== undefined ? Math.max(0, Math.min(6, Number(f.decimals))) : undefined;
    fields.format = JSON.stringify({ ...(kind ? { kind } : {}), ...(decimals !== undefined ? { decimals } : {}), ...(kind === 'currency' ? { symbol: text(f.symbol || '₹', 4) } : {}) });
  }
  if ((fields.type || current.type) === 'select' && !(fields.options || current.options || []).length) throw new HttpError(400, 'A dropdown needs at least one option');
  // fill and text colours stay with the options that are still there
  if (fields.options || b.colors !== undefined || b.fonts !== undefined) {
    const options = fields.options || current.options || [];
    const keep = (sent, had) => {
      const wanted = sent && typeof sent === 'object' ? sent : had || {};
      return JSON.stringify(Object.fromEntries(options.filter((o) => /^#[0-9a-f]{6}$/i.test(wanted[o] || '')).map((o) => [o, wanted[o].toLowerCase()])));
    };
    fields.colors = keep(b.colors, current.colors);
    fields.fonts = keep(b.fonts, current.fonts);
  }
  if (b.width !== undefined) fields.width = Math.max(80, Math.min(600, Math.round(Number(b.width)) || 180));
  return fields;
}

// A cell value of a column's type ('' clears it). Links (person / flow / screen) are kept as ids; ones that
// no longer exist show as empty in the app.
function cellValue(col, value) {
  if (value === null || value === undefined || value === '') return '';
  switch (col.type) {
    case 'number': {
      const n = Number(String(value).replace(/,/g, ''));
      if (!Number.isFinite(n)) throw new HttpError(400, `${col.name}: enter a number`);
      return n;
    }
    case 'date':
      if (!DATE.test(String(value))) throw new HttpError(400, `${col.name}: pick a date`);
      return String(value);
    case 'checkbox': return value === true || value === 'true';
    case 'select': return col.options.includes(String(value)) ? String(value) : (() => { throw new HttpError(400, `${col.name}: pick one of the options`); })();
    case 'formula': throw new HttpError(400, `${col.name} is worked out by its formula`);
    default: return text(String(value), 2000);
  }
}

async function cleanCells(sheetId, cells) {
  if (!cells || typeof cells !== 'object') return {};
  const { rows: cols } = await db.query('SELECT * FROM sheet_columns WHERE sheet_id = $1 AND NOT is_deleted', [sheetId]);
  const out = {};
  Object.entries(cells).forEach(([id, value]) => {
    const col = cols.find((c) => c.id === id);
    if (!col) throw new HttpError(400, 'That column no longer exists. Refresh the sheet.');
    out[id] = cellValue(col, value);
  });
  return out;
}

app.get('/api/sheets', route(async (req, res) => {
  const product = await productFor(req, req.query.product, 'view');
  const { rows } = await db.query(
    `SELECT s.*, (SELECT count(*)::int FROM sheet_rows r WHERE r.sheet_id = s.id AND NOT r.is_deleted) AS row_count
     FROM sheets s WHERE s.product_id = $1 AND NOT s.is_deleted ORDER BY s.sort_order, s.created_at`, [product.id]);
  const { rows: people } = await peopleOf(product.id);
  res.json({
    sheets: rows.map((r) => toSheet(r, req.user)).filter((x) => x.view),
    people: people.map((u) => ({ id: u.id, name: personName(u), teams: Boolean(u.teams_email) })),
    canCreate: auth.atLeast(req.user, 'edit'),
    teams: Boolean(product.teams_webhook),
  });
}));

app.get('/api/sheets/:id', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id);
  const [cols, rows] = await Promise.all([
    db.query('SELECT * FROM sheet_columns WHERE sheet_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [sheet.id]),
    db.query('SELECT * FROM sheet_rows WHERE sheet_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [sheet.id]),
  ]);
  res.json({ ...toSheet({ ...sheet, row_count: rows.rows.length }, req.user), columns: cols.rows.map((c) => toSheetColumn(c, cols.rows)), rowList: rows.rows.map(toSheetRow) });
}));

// New sheet with a few starter columns and empty rows (all of them can be changed)
app.post('/api/sheets', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const id = randomUUID();
  await db.tx(async (client) => {
    await client.query(
      'INSERT INTO sheets (id, product_id, name, owner_id, share, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $4, $4)',
      [id, product.id, required(text(req.body.name, 80), 'Sheet name'), req.user.id, SHEET_SHARES.includes(req.body.share) ? req.body.share : 'edit', Date.now()]);
    const starter = [['Task', 'text', []], ['Status', 'select', ['To do', 'In progress', 'Done']], ['Owner', 'person', []], ['Flow', 'flow', []], ['Due', 'date', []]];
    for (const [i, [name, type, options]] of starter.entries()) {
      await client.query('INSERT INTO sheet_columns (id, sheet_id, name, type, options, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)',
        [randomUUID(), id, name, type, options, i, req.user.id]);
    }
    for (let i = 0; i < 3; i += 1) {
      await client.query('INSERT INTO sheet_rows (id, sheet_id, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $4)', [randomUUID(), id, i, req.user.id]);
    }
  });
  res.status(201).json({ id });
}));

// ---- Excel import: excel.js reads the workbook in detail (types, dropdown lists, colours, conditional formats …)

// A Google Sheets link → the spreadsheet as .xlsx (Google's own export keeps dropdowns, colours and formulas).
// Only Google's address is ever fetched, built from the id in the link.
async function googleSheet(link) {
  const id = (/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]{20,})/.exec(String(link || '').trim()) || [])[1];
  if (!id) throw new HttpError(400, 'Paste the link of a Google Sheet (https://docs.google.com/spreadsheets/d/…)');
  let res;
  try {
    res = await fetch(`https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  } catch (err) {
    throw new HttpError(502, 'Google Sheets could not be reached. Try again, or download it as .xlsx and import that.');
  }
  const type = res.headers.get('content-type') || '';
  if (!res.ok || type.includes('text/html')) {
    throw new HttpError(400, 'Google did not give the sheet: share it as “Anyone with the link can view” (or download it as .xlsx and import that).');
  }
  const size = Number(res.headers.get('content-length') || 0);
  if (size > 15 * 1024 * 1024) throw new HttpError(400, 'That Google Sheet is too large to import (over 15 MB)');
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > 15 * 1024 * 1024) throw new HttpError(400, 'That Google Sheet is too large to import (over 15 MB)');
  const title = decodeURIComponent((/filename\*=UTF-8''([^;]+)/i.exec(res.headers.get('content-disposition') || '') || [, ''])[1]).replace(/\.xlsx$/i, '');
  return { buffer, title };
}

// Excel (.xlsx), .csv or a Google Sheets link → new sheets (one per worksheet with data). Rows go in a few at a time,
// not one query per row.
app.post('/api/sheets/import', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  let buffer;
  let csv = false;
  let fromGoogle = '';
  if (req.body.url) {
    const g = await googleSheet(req.body.url);
    buffer = g.buffer;
    fromGoogle = g.title;
  } else {
    const m = /^data:([\w/.+-]*);base64,([A-Za-z0-9+/=]+)$/.exec(req.body.dataUrl || '');
    if (!m) throw new HttpError(400, 'Please choose an .xlsx or .csv file');
    buffer = Buffer.from(m[2], 'base64');
    csv = /csv|text\/plain/.test(m[1]) || /\.csv$/i.test(String(req.body.file || ''));
  }
  const [{ rows: people }, { rows: tags }] = await Promise.all([
    peopleOf(product.id),
    db.query('SELECT label, color FROM statuses WHERE NOT is_deleted'),
  ]);
  let read;
  try {
    read = await excel.readWorkbook(buffer, { people, tags, csv });
  } catch (err) {
    console.error('Excel import:', err.message);
    throw new HttpError(400, csv ? 'That file could not be read as a .csv file' : 'That file could not be read as an Excel (.xlsx) sheet');
  }
  if (!read.length) throw new HttpError(400, 'The Excel file has no data: it needs a header row and at least one filled row');
  const file = text(req.body.name, 80) || text(fromGoogle, 80) || 'Imported sheet';
  const ids = [];
  await db.tx(async (client) => {
    for (const ws of read) {
      const id = randomUUID();
      ids.push(id);
      const name = read.length > 1 ? `${file} › ${ws.name}` : file;
      await client.query('INSERT INTO sheets (id, product_id, name, owner_id, sort_order, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $4, $4)',
        [id, product.id, name.slice(0, 80), req.user.id, Date.now() + ids.length]);
      const colIds = ws.columns.map(() => randomUUID());
      for (const [i, c] of ws.columns.entries()) {
        // a formula names columns by their place ({@2}): now by id
        const f = c.type === 'formula' ? c.formula.replace(/\{@(\d+)\}/g, (x, k) => `{${colIds[+k]}}`) : '';
        await client.query(
          `INSERT INTO sheet_columns (id, sheet_id, name, type, options, colors, fonts, width, formula, format, sort_order, created_by, updated_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
          [colIds[i], id, c.name, c.type, c.options, JSON.stringify(c.colors), JSON.stringify(c.fonts), c.width, f, JSON.stringify(c.format || {}), i, req.user.id]);
      }
      // cells: { columnId: value }, styles: { columnId: { bg, fg, b } } (a cell's own colours from Excel)
      const rows = ws.rows.map((row, k) => {
        const cells = {};
        const styles = {};
        row.forEach((v, i) => { if (v !== '') cells[colIds[i]] = v; });
        ws.styles[k].forEach((s, i) => { if (s) styles[colIds[i]] = s; });
        return [randomUUID(), JSON.stringify(cells), JSON.stringify(styles), k];
      });
      for (let at = 0; at < rows.length; at += 500) {
        const part = rows.slice(at, at + 500);
        await client.query(
          `INSERT INTO sheet_rows (id, sheet_id, cells, styles, sort_order, created_by, updated_by)
           SELECT x.id, $1, x.cells, x.styles, x.ord, $2, $2 FROM unnest($3::text[], $4::jsonb[], $5::jsonb[], $6::bigint[]) AS x(id, cells, styles, ord)`,
          [id, req.user.id, part.map((r) => r[0]), part.map((r) => r[1]), part.map((r) => r[2]), part.map((r) => r[3])]);
      }
    }
  });
  // what was read, shown to the person who imported it
  const report = read.map((ws, k) => ({
    id: ids[k], name: ws.name, header: ws.header, rows: ws.rows.length, skipped: ws.skipped, more: ws.rows.length >= excel.MAX_ROWS,
    columns: ws.columns.map((c) => ({
      name: c.name, type: c.type, colors: Object.keys(c.colors).length + Object.keys(c.fonts).length,
      ...(c.type === 'formula' ? { formula: formula.toNames(c.formula, ws.columns.map((y, j) => ({ id: `@${j}`, name: y.name }))) } : {}),
    })),
    styled: ws.styles.reduce((t, r) => t + r.filter(Boolean).length, 0),
  }));
  res.status(201).json({
    id: ids[0], title: file, sheets: ids.length, rows: report.reduce((t, x) => t + x.rows, 0), columns: report.reduce((t, x) => t + x.columns.length, 0), report,
  });
}));

app.patch('/api/sheets/:id', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'manage');
  const b = req.body;
  const fields = {};
  if (b.name !== undefined) fields.name = required(text(b.name, 80), 'Sheet name');
  if (b.share !== undefined) fields.share = oneOf(b.share, SHEET_SHARES, 'sharing');
  if (b.editors !== undefined || b.viewers !== undefined) {
    const { rows } = await peopleOf(sheet.product_id);
    const of = (list) => [...new Set((Array.isArray(list) ? list : []).filter((x) => rows.some((u) => u.id === x)))];
    if (b.editors !== undefined) fields.editors = of(b.editors);
    // an editor is not also a viewer
    const editors = fields.editors || sheet.editors;
    fields.viewers = of(b.viewers !== undefined ? b.viewers : sheet.viewers).filter((x) => !editors.includes(x));
  }
  await update('sheets', sheet.id, fields, req.user.id);
  res.json({ ok: true });
}));

// Several sheets at once (ticked in the side list): only the owner can delete a sheet, so all must be yours
app.post('/api/sheets/delete', route(async (req, res) => {
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).filter((x) => typeof x === 'string'))].slice(0, 200);
  if (!ids.length) throw new HttpError(400, 'Tick at least one sheet to delete');
  const sheets = [];
  for (const id of ids) sheets.push((await sheetFor(req, id, 'manage')).sheet);
  await db.query('UPDATE sheets SET is_deleted = true, updated_by = $2 WHERE id = ANY($1)', [sheets.map((x) => x.id), req.user.id]);
  res.json({ deleted: sheets.length });
}));

app.delete('/api/sheets/:id', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'manage');
  await softDelete('sheets', sheet.id, req.user.id);
  res.json({ ok: true });
}));

app.post('/api/sheets/:id/columns', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'edit');
  const { rows: cols } = await db.query('SELECT * FROM sheet_columns WHERE sheet_id = $1 AND NOT is_deleted', [sheet.id]);
  const f = columnFields({ type: 'text', ...req.body }, {}, cols);
  required(f.name, 'Column name');
  const { rows } = await db.query(
    `INSERT INTO sheet_columns (id, sheet_id, name, type, options, formula, format, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) RETURNING *`,
    [randomUUID(), sheet.id, f.name, f.type, f.options || [], f.formula || '', f.format || '{}', Date.now(), req.user.id]);
  res.status(201).json(toSheetColumn(rows[0]));
}));

app.patch('/api/sheet-columns/:id', route(async (req, res) => {
  const col = await live('sheet_columns', req.params.id, '*');
  await sheetFor(req, col.sheet_id, 'edit');
  const { rows: cols } = await db.query('SELECT * FROM sheet_columns WHERE sheet_id = $1 AND NOT is_deleted', [col.sheet_id]);
  const fields = columnFields(req.body, col, cols);
  await update('sheet_columns', col.id, fields, req.user.id);
  // a new type: values that don't fit it are cleared from every row (a formula column holds none)
  if (fields.type && fields.type !== col.type && fields.type !== 'formula') {
    const next = { ...col, ...fields };
    const { rows } = await db.query('SELECT id, cells FROM sheet_rows WHERE sheet_id = $1 AND cells ? $2', [col.sheet_id, col.id]);
    for (const r of rows) {
      let v;
      try { v = cellValue(next, next.type === 'checkbox' ? r.cells[col.id] === true || ['yes', 'true', '1', 'done', 'x'].includes(String(r.cells[col.id]).toLowerCase()) : r.cells[col.id]); } catch (err) { v = ''; }
      await db.query('UPDATE sheet_rows SET cells = cells || jsonb_build_object($2::text, $3::jsonb) WHERE id = $1', [r.id, col.id, JSON.stringify(v)]);
    }
  }
  res.json(toSheetColumn(await live('sheet_columns', col.id, '*')));
}));

app.delete('/api/sheet-columns/:id', route(async (req, res) => {
  const col = await live('sheet_columns', req.params.id, '*');
  await sheetFor(req, col.sheet_id, 'edit');
  await softDelete('sheet_columns', col.id, req.user.id);
  res.json({ ok: true });
}));

const reorder = (table, sheetId, ids, by) => db.tx((client) => Promise.all((Array.isArray(ids) ? ids : []).filter((x) => typeof x === 'string')
  .map((id, i) => client.query(`UPDATE ${table} SET sort_order = $3, updated_by = $4 WHERE id = $1 AND sheet_id = $2`, [id, sheetId, i, by]))));

app.put('/api/sheets/:id/column-order', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'edit');
  await reorder('sheet_columns', sheet.id, req.body.ids, req.user.id);
  res.json({ ok: true });
}));

app.put('/api/sheets/:id/row-order', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'edit');
  await reorder('sheet_rows', sheet.id, req.body.ids, req.user.id);
  res.json({ ok: true });
}));

app.post('/api/sheets/:id/rows', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'edit');
  const cells = await cleanCells(sheet.id, req.body.cells);
  const { rows } = await db.query(
    `INSERT INTO sheet_rows (id, sheet_id, cells, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, (SELECT coalesce(max(sort_order), 0) + 1 FROM sheet_rows WHERE sheet_id = $2), $4, $4) RETURNING *`,
    [randomUUID(), sheet.id, JSON.stringify(cells), req.user.id]);
  res.status(201).json(toSheetRow(rows[0]));
}));

// Saves only the cells sent, merged into the row (two people editing different cells don't overwrite each other)
app.patch('/api/sheet-rows/:id', route(async (req, res) => {
  const row = await live('sheet_rows', req.params.id, '*');
  const { sheet } = await sheetFor(req, row.sheet_id, 'edit');
  const cells = await cleanCells(sheet.id, req.body.cells);
  const { rows } = await db.query('UPDATE sheet_rows SET cells = cells || $2::jsonb, updated_by = $3 WHERE id = $1 RETURNING *',
    [row.id, JSON.stringify(cells), req.user.id]);
  res.json(toSheetRow(rows[0]));
}));

app.delete('/api/sheet-rows/:id', route(async (req, res) => {
  const row = await live('sheet_rows', req.params.id, '*');
  await sheetFor(req, row.sheet_id, 'edit');
  await softDelete('sheet_rows', row.id, req.user.id);
  res.json({ ok: true });
}));

// Several rows at once (the ticked ones); only rows of this sheet are touched
app.post('/api/sheets/:id/rows/delete', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'edit');
  const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter((x) => typeof x === 'string').slice(0, 5000);
  if (!ids.length) throw new HttpError(400, 'Tick at least one row to delete');
  const { rowCount } = await db.query('UPDATE sheet_rows SET is_deleted = true, updated_by = $3 WHERE sheet_id = $1 AND id = ANY($2) AND NOT is_deleted',
    [sheet.id, ids, req.user.id]);
  res.json({ deleted: rowCount });
}));

// A sheet's columns and rows, and show(col, value): what a cell reads as (people / flows / screens by name,
// dates as dates, checkboxes as Yes / No; null when empty)
async function sheetContent(sheet) {
  const [{ rows: cols }, { rows }, { rows: people }, { rows: flows }, { rows: screens }] = await Promise.all([
    db.query('SELECT * FROM sheet_columns WHERE sheet_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [sheet.id]),
    db.query('SELECT * FROM sheet_rows WHERE sheet_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [sheet.id]),
    db.query('SELECT id, name, username FROM users'),
    db.query('SELECT f.id, f.name, m.name AS module FROM flows f JOIN modules m ON m.id = f.module_id WHERE m.product_id = $1', [sheet.product_id]),
    db.query(`SELECT s.id, s.name, f.name AS flow FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
              WHERE m.product_id = $1`, [sheet.product_id]),
  ]);
  const named = (list, id, label) => { const x = list.find((y) => y.id === id); return x ? label(x) : ''; };
  const linked = (col, v) => {
    if (col.type === 'person') return named(people, v, personName);
    if (col.type === 'flow') return named(flows, v, (f) => `${f.module} › ${f.name}`);
    if (col.type === 'screen') return named(screens, v, (x) => `${x.flow} › ${x.name}`);
    return v;
  };
  // formula columns: worked out per row (r.results), people / flows / screens counting by name
  if (cols.some((c) => c.type === 'formula')) {
    rows.forEach((r, k) => { r.results = formula.computeRow(cols, r.cells, linked, k + 1); });
  }
  const show = (col, v, r) => {
    if (col.type === 'formula') {
      const x = r && r.results ? r.results[col.id] : '';
      if (col.format && col.format.kind === 'date' && typeof x === 'number') return formula.fromSerial(x);
      return x === '' ? null : formula.display(x, col.format);
    }
    if (v === '' || v === undefined || v === null) return null;
    if (col.type === 'date') return new Date(`${v}T00:00:00Z`);
    if (col.type === 'checkbox') return v ? 'Yes' : 'No';
    return linked(col, v);
  };
  return { cols, rows, show };
}

// ---- send to Teams: any rows of a sheet, or any issues, with the columns picked, @mentioning the people picked

const TEAMS_ROWS = 40; // a Teams card has a size limit
const teamsValue = (v) => (v === null || v === undefined || v === '' ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).replace(/\s*\n\s*/g, ' / '));
// rows are [[column name, value, look?], …] (look: { bg, fg, b }, the cell's colours in the sheet) → a table for the card
const teamsTable = (rows) => ({
  columns: (rows[0] || []).map(([name]) => name),
  rows: rows.slice(0, TEAMS_ROWS).map((cells) => cells.map(([, v, look]) => ({ text: teamsValue(v), ...(look || {}) }))),
  more: Math.max(0, rows.length - TEAMS_ROWS),
});

// mode 'channel' posts to the app's channel (webhook, as a card). mode 'card' sends nothing: it answers the message for
// the browser to send from the person's own Teams (Microsoft Graph), as an HTML table: `card` @mentions the people picked (for a channel),
// `direct` does not (a chat with each of them), and `people` are who to message.
async function sendList(req, product, { title, rows, userIds, note, link, mode, extra = [] }) {
  if (!rows.length) throw new HttpError(400, 'Pick at least one row to send');
  const { rows: people } = await peopleOf(product.id);
  const wanted = Array.isArray(userIds) ? userIds : [];
  const message = { title, lines: [text(note, 1000)], table: teamsTable(rows), actions: [['Open in FlowTrace', link], ...extra] };
  return { ...await teamsTo(product, message, people.filter((u) => wanted.includes(u.id)), mode), rows: rows.length };
}

// A message for people `to`, by mode (see sendList): posted to the app's channel @mentioning them, or answered for
// the browser to send from the person's own Teams.
async function teamsTo(product, message, to, mode) {
  if (mode !== 'card' && !product.teams_webhook) throw new HttpError(400, 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.');
  const lines = [...message.lines];
  if (mode !== 'card' && to.some((u) => !u.teams_email)) lines.push(`For: ${to.filter((u) => !u.teams_email).map(personName).join(', ')}`);
  const full = { ...message, lines, mentions: to.flatMap(mention) };
  if (mode === 'card') {
    return {
      card: teams.html(full), direct: teams.html({ ...full, mentions: [] }),
      people: to.map((u) => ({ name: personName(u), email: u.teams_email })),
    };
  }
  const sent = await toTeams(product, full);
  if (sent !== 'sent') throw new HttpError(502, sent);
  return { teams: sent };
}

// excel: the whole sheet goes along as an Excel file. Only for people who can edit the sheet, and only when every
// row is sent (the file is the whole sheet, not the rows picked).
app.post('/api/sheets/:id/teams', route(async (req, res) => {
  const { sheet, rights } = await sheetFor(req, req.params.id);
  need(req, 'edit');
  const product = await live('products', sheet.product_id, '*');
  const { cols, rows, show } = await sheetContent(sheet);
  const wantedCols = Array.isArray(req.body.columnIds) ? req.body.columnIds : [];
  const picked = cols.filter((c) => wantedCols.includes(c.id));
  if (!picked.length) throw new HttpError(400, 'Pick at least one column to send');
  const wantedRows = new Set(Array.isArray(req.body.rowIds) ? req.body.rowIds : []);
  // a dropdown value keeps its option's colours, any other cell its own (both read from Excel on import, or set here)
  const look = (c, r) => {
    const v = r.cells[c.id];
    const own = (r.styles || {})[c.id] || {};
    const opt = c.type === 'select' && v ? { bg: (c.colors || {})[v], fg: (c.fonts || {})[v] } : {};
    const x = { bg: opt.bg || own.bg, fg: opt.fg || own.fg, b: own.b };
    return x.bg || x.fg || x.b ? x : null;
  };
  const list = rows.filter((r) => wantedRows.has(r.id)).map((r) => picked.map((c) => [c.name, show(c, r.cells[c.id], r), look(c, r)]));
  const excel = Boolean(req.body.excel);
  if (excel && !rights.edit) throw new HttpError(403, 'Only people who can edit this sheet can send it as Excel');
  if (excel && rows.some((r) => !wantedRows.has(r.id))) throw new HttpError(400, 'Excel goes only with the whole sheet: tick every row (or none, with no search or filter)');
  const out = await sendList(req, product, {
    title: `📋 ${sheet.name}`, rows: list, userIds: req.body.userIds, note: req.body.note,
    link: deeplink(req, `sheet=${sheet.id}`), mode: req.body.mode,
    extra: excel ? [['Download Excel', deeplink(req, '').replace(/\/#$/, `/api/sheets/${sheet.id}/export`)]] : [],
  });
  res.json(excel && req.body.mode === 'card' ? { ...out, excel: await excelFile(sheet) } : out);
}));

// Share a whole sheet with one or more people of the app: they can view it (or edit it) from now on, and are told on
// Teams with a link to it (mode as in sendList; 'none' only gives the access)
app.post('/api/sheets/:id/share', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id, 'manage');
  const product = await live('products', sheet.product_id, '*');
  const access = oneOf(req.body.access, ['view', 'edit'], 'access');
  const wanted = Array.isArray(req.body.userIds) ? req.body.userIds : [];
  const { rows: people } = await peopleOf(product.id);
  const to = people.filter((u) => wanted.includes(u.id) && u.id !== sheet.owner_id && u.id !== req.user.id);
  if (!to.length) throw new HttpError(400, 'Tick who to share it with');
  const ids = to.map((u) => u.id);
  // view never takes away edit: an editor picked to view stays an editor
  const editors = access === 'edit' ? [...new Set([...sheet.editors, ...ids])] : sheet.editors;
  const viewers = [...new Set([...(sheet.viewers || []), ...(access === 'view' ? ids : [])])].filter((x) => !editors.includes(x));
  await update('sheets', sheet.id, { editors, viewers }, req.user.id);
  const shared = { shared: to.length, editors, viewers };
  if (req.body.mode === 'none') { res.json(shared); return; }
  const { rows: [{ count }] } = await db.query('SELECT count(*)::int FROM sheet_rows WHERE sheet_id = $1 AND NOT is_deleted', [sheet.id]);
  // view-only logins can never edit, whatever the sheet says
  const can = access === 'edit' && to.every((u) => auth.atLeast(u, 'edit')) ? 'can edit' : 'can view';
  const message = {
    title: `📋 ${sheet.name}`,
    lines: [`${personName(req.user)} shared this sheet of ${product.name} with you (${can}, ${count} row${count === 1 ? '' : 's'}).`, text(req.body.note, 1000)],
    actions: [['Open the sheet', deeplink(req, `sheet=${sheet.id}`)],
      ...(req.body.excel ? [['Download Excel', deeplink(req, '').replace(/\/#$/, `/api/sheets/${sheet.id}/export`)]] : [])],
  };
  const sent = await teamsTo(product, message, to, req.body.mode);
  res.json({ ...shared, ...sent, ...(req.body.excel && req.body.mode === 'card' ? { excel: await excelFile(sheet) } : {}) });
}));

// Issues: the columns a message can have
const ISSUE_COLUMNS = {
  where: ['Screen', (r) => `${r.module_name} › ${r.flow_name} › ${r.screen_name}`],
  text: ['Issue', (r) => r.text],
  priority: ['Priority', (r) => r.priority[0].toUpperCase() + r.priority.slice(1)],
  status: ['Status', (r) => r.status_label || r.status],
  area: ['Area', (r) => ({ frontend: 'Frontend', backend: 'Backend', both: 'Frontend + Backend' }[r.area] || '')],
  assignees: ['Assigned to', (r) => (r.assignees || []).join(', ')],
  remarks: ['Remarks', (r) => r.remarks],
  added: ['Added on', (r) => r.created_at],
};
const ISSUE_SELECT = `SELECT c.*, s.name AS screen_name, f.name AS flow_name, m.name AS module_name, st.label AS status_label
  FROM comments c JOIN screens s ON s.id = c.screen_id JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
  LEFT JOIN statuses st ON st.id = c.status`;

// People of an app, to pick who to @mention
app.get('/api/products/:id/people', route(async (req, res) => {
  const product = await productFor(req, req.params.id, 'edit');
  const { rows } = await peopleOf(product.id);
  res.json({
    people: rows.map((u) => ({ id: u.id, name: personName(u), username: u.username, access: u.access, teams: Boolean(u.teams_email) })),
    teams: Boolean(product.teams_webhook),
  });
}));

app.post('/api/issues/teams', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string').slice(0, 500) : [];
  const { rows } = await db.query(
    `${ISSUE_SELECT} WHERE c.id = ANY($1) AND m.product_id = $2 AND NOT c.is_deleted AND NOT s.is_deleted ORDER BY array_position($1, c.id)`,
    [ids, product.id]);
  rows.splice(0, rows.length, ...rows.filter((r) => seesIssue(req.user, r, product))); // only issues this login may see
  const keys = (Array.isArray(req.body.columns) ? req.body.columns : []).filter((k) => ISSUE_COLUMNS[k]);
  if (!keys.length) throw new HttpError(400, 'Pick at least one column to send');
  const list = rows.map((r) => keys.map((k) => [ISSUE_COLUMNS[k][0], ISSUE_COLUMNS[k][1](r) || null]));
  const send = sendList(req, product, {
    title: `🐞 ${rows.length} issue${rows.length === 1 ? '' : 's'}`, rows: list, userIds: req.body.userIds, note: req.body.note,
    link: rows.length === 1 ? deeplink(req, `screen=${rows[0].screen_id}`) : deeplink(req, ''), mode: req.body.mode,
  });
  // 'card': the browser sends it from the person's own Teams and reports back (below); the app's channel is sent here
  if (req.body.mode === 'card') { res.json(await send); return; }
  const share = { productId: product.id, issueIds: rows.map((r) => r.id), target: 'app', destination: `${product.name} channel`, note: req.body.note };
  try {
    const out = await send;
    await logShare(req, { ...share, ok: true });
    res.json(out);
  } catch (err) {
    await logShare(req, { ...share, ok: false, error: err.message });
    throw err;
  }
}));

// Keep a record of an issue send on Teams (never fails the send itself)
function logShare(req, s) {
  return db.query(
    `INSERT INTO teams_shares (id, product_id, issue_ids, target, chat_id, destination, note, message_id, ok, error, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
    [randomUUID(), s.productId, s.issueIds, s.target, text(s.chatId, 200), text(s.destination, 300),
      text(s.note, 1000), text(s.messageId, 200), Boolean(s.ok), text(s.error, 1000), req.user.id])
    .catch((err) => console.error('Teams share log:', err.message));
}

// The browser sent issues from the person's own Teams (Microsoft Graph): how it went, to keep with the issues.
// Graph itself decided whether they may post there; this only records what the browser says happened.
app.post('/api/issues/teams/log', route(async (req, res) => {
  const product = await productFor(req, req.body.productId, 'edit');
  const target = ['mine', 'direct'].includes(req.body.target) ? req.body.target : null;
  if (!target) throw new HttpError(400, 'target must be mine or direct');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string').slice(0, 500) : [];
  const { rows } = await db.query(
    `SELECT c.id FROM comments c JOIN screens s ON s.id = c.screen_id JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
     WHERE c.id = ANY($1) AND m.product_id = $2`, [ids, product.id]);
  if (!rows.length) throw new HttpError(400, 'No issues of this app');
  const b = req.body;
  await logShare(req, {
    productId: product.id, issueIds: rows.map((r) => r.id), target, chatId: b.chatId,
    destination: b.destination, note: b.note, messageId: b.messageId, ok: b.ok, error: b.error,
  });
  res.status(201).json({ ok: true });
}));

// ---- issue notifications: assignees are told when an issue is given to them, and assignees and the one who
// wrote it when its status changes (never the person who made the change). Assignees are names: they are matched
// to logins of the app by name or username.
// They are @mentioned on the app's channel (webhook, in the background), and the answer carries `notify`:
// { card, people: [{ name, email }] } for the browser to message each of them directly from the signed-in
// person's own Teams (Microsoft Graph), when they connected it.

async function notifyIssue(req, productId, issueId, { added = [], statusFrom = null }) {
  const product = await live('products', productId, '*');
  const { rows: [r] } = await db.query(`${ISSUE_SELECT} WHERE c.id = $1`, [issueId]);
  if (!r) return undefined;
  const { rows: people } = await peopleOf(productId);
  const login = (name) => people.find((u) => [u.name, u.username].some((n) => n && n.toLowerCase() === String(name).toLowerCase()));
  const newly = added.map(login).filter(Boolean);
  const changed = statusFrom !== null && statusFrom !== r.status;
  const watchers = changed ? [...(r.assignees || []).map(login), people.find((u) => u.id === r.created_by)].filter(Boolean) : [];
  const to = [...new Map([...newly, ...watchers].filter((u) => u.id !== req.user.id).map((u) => [u.id, u])).values()];
  if (!to.length) return undefined;
  const { rows: [from] } = changed ? await db.query('SELECT label FROM statuses WHERE id = $1', [statusFrom]) : { rows: [] };
  const status = r.status_label || r.status;
  const message = {
    title: changed ? `🔄 ${from ? from.label : statusFrom} → ${status}: ${r.screen_name}` : `🐞 New issue for you: ${r.screen_name}`,
    lines: [r.text, r.remarks ? `_${r.remarks}_` : ''],
    facts: [['App', product.name], ['Where', `${r.module_name} › ${r.flow_name} › ${r.screen_name}`],
      ['Priority', r.priority[0].toUpperCase() + r.priority.slice(1)], ['Status', status], ['By', personName(req.user)]],
    actions: [['Open the screen', deeplink(req, `screen=${r.screen_id}`)]],
  };
  if (product.teams_webhook) {
    const missing = to.filter((u) => !u.teams_email);
    toTeams(product, { ...message, lines: [...message.lines, missing.length ? `For: ${missing.map(personName).join(', ')}` : ''], mentions: to.flatMap(mention) })
      .then((sent) => { if (sent !== 'sent') console.error('Issue notification:', sent); });
  }
  const direct = to.filter((u) => u.teams_email);
  return direct.length ? { card: teams.card(message), people: direct.map((u) => ({ name: personName(u), email: u.teams_email })) } : undefined;
}
// never fails the request that changed the issue
const notifyOf = (...args) => notifyIssue(...args).catch((err) => { console.error('Issue notification:', err.message); return undefined; });

// The sheet as Excel: numbers as numbers, dates as dates, people / flows / screens by name, totals under number columns
// A formula column's format as an Excel number format
function excelFormat(f = {}) {
  const dec = Number.isInteger(f.decimals) ? f.decimals : null;
  const places = (d) => (d ? `.${'0'.repeat(d)}` : '');
  if (f.kind === 'date') return 'dd mmm yyyy';
  if (f.kind === 'percent') return `0${places(dec === null ? 0 : dec)}%`;
  if (f.kind === 'currency') return `"${f.symbol || '₹'}"#,##0${places(dec === null ? 2 : dec)}`;
  return dec === null ? '#,##0.##' : `#,##0${places(dec)}`;
}

// The whole sheet as an Excel workbook (the download, and the file sent on Teams)
async function sheetWorkbook(sheet) {
  const { cols, rows, show } = await sheetContent(sheet);
  const book = new ExcelJS.Workbook();
  book.creator = 'FlowTrace';
  const ws = book.addWorksheet(sheet.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = cols.map((c) => ({
    header: c.name, key: c.id, width: Math.max(8, Math.round(c.width / 7)),
    style: c.type === 'date' ? { numFmt: 'dd mmm yyyy' } : c.type === 'number' ? { numFmt: '#,##0.##' } : c.type === 'formula' ? { numFmt: excelFormat(c.format) } : {},
  }));
  // a formula column stays a formula in Excel ({id} → that column's cell in the row), with its result
  const letters = new Map(cols.map((c, i) => [c.id, formula.colLetter(i + 1)]));
  const cellOf = (c, r, n) => {
    if (c.type !== 'formula') return show(c, r.cells[c.id]);
    const x = r.results ? r.results[c.id] : '';
    const result = formula.isErr(x) ? { error: x.code } : x;
    const f = c.formula.replace(/\{([\w-]+)\}/g, (m, id) => (letters.has(id) ? `${letters.get(id)}${n}` : '#REF!'));
    return { formula: f, result };
  };
  rows.forEach((r, k) => {
    const row = ws.addRow(Object.fromEntries(cols.map((c) => [c.id, cellOf(c, r, k + 2)])));
    // dropdown values keep their colours, other cells their own (from an imported Excel)
    const argb = (hex) => ({ argb: `FF${hex.slice(1).toUpperCase()}` });
    cols.forEach((c, i) => {
      const own = (r.styles || {})[c.id] || {};
      const bg = (c.type === 'select' && (c.colors || {})[r.cells[c.id]]) || own.bg;
      const fg = (c.type === 'select' && (c.fonts || {})[r.cells[c.id]]) || own.fg;
      const cell = row.getCell(i + 1);
      if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: argb(bg) };
      if (fg || own.b) cell.font = { ...(fg ? { color: argb(fg) } : {}), ...(own.b ? { bold: true } : {}) };
    });
  });
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  if (cols.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  if (rows.length && cols.some((c) => c.type === 'number')) {
    const total = ws.addRow({});
    cols.forEach((c, i) => {
      if (c.type === 'number') total.getCell(i + 1).value = { formula: `SUM(${ws.getColumn(i + 1).letter}2:${ws.getColumn(i + 1).letter}${rows.length + 1})` };
    });
    total.font = { bold: true };
    if (cols[0].type !== 'number') total.getCell(1).value = 'Total';
  }
  return book;
}
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const excelName = (sheet) => `${sheet.name.replace(/[^\w-]+/g, '-') || 'sheet'}.xlsx`;

// The file itself, for the browser to put on the sender's OneDrive and attach to the Teams message
async function excelFile(sheet) {
  const book = await sheetWorkbook(sheet);
  return { name: excelName(sheet), type: XLSX, base64: Buffer.from(await book.xlsx.writeBuffer()).toString('base64') };
}

app.get('/api/sheets/:id/export', route(async (req, res) => {
  const { sheet } = await sheetFor(req, req.params.id);
  const book = await sheetWorkbook(sheet);
  res.setHeader('Content-Type', XLSX);
  res.setHeader('Content-Disposition', `attachment; filename="${excelName(sheet)}"`);
  await book.xlsx.write(res);
  res.end();
}));

// ---------------------------------------------------------------- errors + start

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  // our own messages (e.g. "image storage not set up", "image upload failed") are safe to show
  const expose = status < 500 || err instanceof HttpError || err.expose;
  if (!expose) console.error(err);
  res.status(status).json({ error: expose ? err.message : 'Server error' });
});

// First super admin from .env, when there is none yet.
async function ensureSuperAdmin() {
  const { rows } = await db.query(`SELECT id FROM users WHERE access = 'super' AND NOT is_deleted LIMIT 1`);
  if (rows[0]) return;
  const { SUPER_ADMIN_USERNAME: username, SUPER_ADMIN_PASSWORD: pass } = process.env;
  if (!username || !pass || !USERNAME.test(username) || pass.length < 8) {
    console.log('No super admin yet: set SUPER_ADMIN_USERNAME and SUPER_ADMIN_PASSWORD (8+ characters) in .env and restart.');
    return;
  }
  await db.query(
    `INSERT INTO users (id, username, name, password_hash, access, all_products) VALUES ($1, $2, 'Super admin', $3, 'super', true)`,
    [randomUUID(), username, await auth.hashPassword(pass)]);
  console.log(`Super admin "${username}" created.`);
}

// `npm start` runs this file; the tests require it for the app and start their own server (test/journal.api.test.js)
if (require.main === module) {
  db.init()
    .then(ensureSuperAdmin)
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`FlowTrace running at http://localhost:${PORT}`);
        if (!cloud.configured()) console.log('Image uploads are off: add the Cloudinary keys to .env to turn them on.');
        if (!process.env.APP_URL) console.log('APP_URL is not set: Teams reminders will have no "Start sanity" link.');
        if (!assist.configured()) console.log('The AI writing assistant is off: add ANTHROPIC_API_KEY to .env to turn it on (quick checks still run).');
        setInterval(() => sanityReminders().catch((err) => console.error('Sanity reminders:', err.message)), 60 * 1000);
      });
      // who is online: a WebSocket on the same port (/ws)
      online = presence.attach(server, { db, auth });
    })
    .catch((err) => {
      console.error('Could not connect to the database:', err.message);
      process.exit(1);
    });
}

module.exports = { app };
