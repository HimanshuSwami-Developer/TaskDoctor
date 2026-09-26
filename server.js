'use strict';
const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const db = require('./db');
const cloud = require('./cloud');
const auth = require('./auth');
const ExcelJS = require('exceljs');

const PORT = Number(process.env.PORT) || 4000;
const COLORS = ['slate', 'amber', 'sky', 'indigo', 'violet', 'pink', 'red', 'teal', 'green'];
const BUILT_IN_STATUSES = ['pending', 'complete']; // new issues start Pending; Complete = fixed
const DEVICES = ['app', 'web'];
const WIREFRAMES = ['form', 'list', 'dashboard', 'detail'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const ACCESS = Object.keys(auth.LEVELS);

const app = express();
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

/** UPDATE with a whitelisted set of columns. */
async function update(table, id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  await db.query(`UPDATE ${table} SET ${set} WHERE id = $1 AND NOT is_deleted`, [id, ...keys.map((k) => fields[k])]);
}

// A row that exists and is not deleted.
const live = (table, id, columns = 'id') => one(`SELECT ${columns} FROM ${table} WHERE id = $1 AND NOT is_deleted`, [id]);

// Nothing is ever removed from the database: deleting only sets is_deleted = true.
const softDelete = (table, id) => db.query(`UPDATE ${table} SET is_deleted = true WHERE id = $1`, [id]);

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

const toProduct = (r) => ({ id: r.id, name: r.name, order: r.sort_order });
const toModule = (r) => ({ id: r.id, productId: r.product_id, name: r.name, order: r.sort_order });
const toFlow = (r) => ({
  id: r.id, moduleId: r.module_id, name: r.name, order: r.sort_order,
  parentFlowId: r.parent_flow_id, fromConditionId: r.from_condition_id, fromBranchId: r.from_branch_id,
  video: r.video_url || null,
});
const toUser = (r) => ({
  id: r.id, username: r.username, name: r.name, access: r.access,
  allProducts: r.access === 'super' || r.all_products, productIds: r.product_ids, createdAt: r.created_at,
});
const toStatus = (r) => ({ id: r.id, label: r.label, color: r.color, builtIn: BUILT_IN_STATUSES.includes(r.id), deleted: r.is_deleted });
const toComment = (r) => ({
  id: r.id, screenId: r.screen_id, text: r.text, priority: r.priority,
  assignees: r.assignees, remarks: r.remarks, status: r.status, statusDate: r.status_date,
  resolved: r.status === 'complete', createdAt: r.created_at,
});

function toScreen(r) {
  if (r.type === 'condition') {
    return { id: r.id, flowId: r.flow_id, type: 'condition', name: r.name, branches: r.branches, order: r.sort_order };
  }
  return {
    id: r.id,
    flowId: r.flow_id,
    type: 'screen',
    name: r.name,
    page: r.page,
    device: r.device,
    wireframe: r.wireframe,
    image: r.image_url || null, // Cloudinary URL (contains a version, so replaced images are not cached)
    linkId: r.link_id,
    order: r.sort_order,
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
  await db.query(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '${auth.SESSION_DAYS} days')`,
    [auth.hashToken(token), rows[0].id]);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, token));
  res.json(toUser(rows[0]));
}));

app.post('/api/logout', route(async (req, res) => {
  await db.query('UPDATE sessions SET expires_at = now() WHERE token_hash = $1', [auth.hashToken(auth.readCookie(req, auth.COOKIE))]);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, null));
  res.json({ ok: true });
}));

app.get('/api/me', (req, res) => res.json(toUser(req.user)));

// ---------------------------------------------------------------- logins (admin dashboard, super admins only)

const USERNAME = /^[a-z0-9._-]{3,40}$/i;
const expireSessions = (userId) => db.query('UPDATE sessions SET expires_at = now() WHERE user_id = $1 AND expires_at > now()', [userId]);

// Only real, live products can be granted.
async function productIds(value) {
  const ids = Array.isArray(value) ? value.filter((x) => typeof x === 'string') : [];
  const { rows } = await db.query('SELECT id FROM products WHERE id = ANY($1) AND NOT is_deleted', [ids]);
  return rows.map((r) => r.id);
}

function password(value) {
  if (typeof value !== 'string' || value.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  return value.slice(0, 200);
}

app.get('/api/users', route(async (req, res) => {
  need(req, 'super');
  const { rows } = await db.query('SELECT * FROM users WHERE NOT is_deleted ORDER BY created_at');
  res.json(rows.map(toUser));
}));

app.post('/api/users', route(async (req, res) => {
  need(req, 'super');
  const b = req.body;
  const username = text(b.username, 40);
  if (!USERNAME.test(username)) throw new HttpError(400, 'Username: 3–40 letters, numbers, dot, dash or underscore');
  const { rows: taken } = await db.query('SELECT id FROM users WHERE lower(username) = lower($1) AND NOT is_deleted', [username]);
  if (taken[0]) throw new HttpError(409, 'That username is already used');
  const { rows } = await db.query(
    `INSERT INTO users (id, username, name, password_hash, access, all_products, product_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [randomUUID(), username, text(b.name, 80), await auth.hashPassword(password(b.password)),
      oneOf(b.access, ACCESS, 'access'), Boolean(b.allProducts), await productIds(b.productIds)]);
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
  if (b.password) fields.password_hash = await auth.hashPassword(password(b.password));
  if (user.id === req.user.id && fields.access && fields.access !== 'super') throw new HttpError(400, 'You cannot remove your own super admin access');
  await update('users', user.id, fields);
  // new password → everyone signed in as this user has to sign in again (except you, when it's your own)
  if (fields.password_hash) {
    await db.query('UPDATE sessions SET expires_at = now() WHERE user_id = $1 AND expires_at > now() AND token_hash <> $2',
      [user.id, auth.hashToken(auth.readCookie(req, auth.COOKIE))]);
  }
  res.json(toUser(await live('users', user.id, '*')));
}));

app.delete('/api/users/:id', route(async (req, res) => {
  need(req, 'super');
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot delete your own login');
  await softDelete('users', req.params.id);
  await expireSessions(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- board

// Everything a login can see: products → modules → flows (incl. branch paths) → screens → issues.
async function loadBoard(user) {
  const everything = user.access === 'super' || user.all_products;
  const [products, modules, flows, screens, comments] = await Promise.all([
    db.query(`SELECT * FROM products WHERE NOT is_deleted ${everything ? '' : 'AND id = ANY($1)'} ORDER BY sort_order, created_at`,
      everything ? [] : [user.product_ids]),
    db.query('SELECT * FROM modules WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query('SELECT * FROM flows WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query(`${SCREEN_SELECT} WHERE NOT s.is_deleted ORDER BY s.sort_order, s.created_at`),
    db.query('SELECT * FROM comments WHERE NOT is_deleted ORDER BY created_at'),
  ]);
  const commentsBy = {};
  comments.rows.forEach((c) => (commentsBy[c.screen_id] ||= []).push(toComment(c)));
  const screensBy = {};
  screens.rows.forEach((s) => (screensBy[s.flow_id] ||= []).push({ ...toScreen(s), comments: commentsBy[s.id] || [] }));
  // Path flows only show while their condition (in a shown flow) still has that branch; repeat for nested paths.
  let shownFlows = flows.rows;
  for (;;) {
    const ids = new Set(shownFlows.map((f) => f.id));
    const branchesOf = new Map(screens.rows.filter((x) => x.type === 'condition' && ids.has(x.flow_id)).map((x) => [x.id, x.branches]));
    const next = shownFlows.filter((f) => !f.from_condition_id
      || (branchesOf.has(f.from_condition_id) && branchesOf.get(f.from_condition_id).some((b) => b.id === f.from_branch_id)));
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
  return board;
}

app.get('/api/board', route(async (req, res) => res.json(await loadBoard(req.user))));

// ---------------------------------------------------------------- Excel download of every task the login can see

// Flows in reading order with their number: 1, 1.1 (a branch path), 1.1.1 …, 2 …
function numberedFlows(module) {
  const out = [];
  const walk = (flow, no) => {
    out.push({ flow, no });
    let k = 0;
    flow.screens.filter((s) => s.type === 'condition').forEach((c) => c.branches.forEach((b) => module.flows
      .filter((f) => f.fromConditionId === c.id && f.fromBranchId === b.id)
      .forEach((path) => walk(path, `${no}.${(k += 1)}`))));
  };
  module.flows.filter((f) => !f.parentFlowId).forEach((f, i) => walk(f, String(i + 1)));
  return out;
}

app.get('/api/export', route(async (req, res) => {
  const [board, { rows: tags }] = await Promise.all([loadBoard(req.user), db.query('SELECT id, label FROM statuses')]);
  const statusName = Object.fromEntries(tags.map((t) => [t.id, t.label]));
  const PRIORITY = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };
  const day = (d) => (d ? new Date(d) : null);

  const book = new ExcelJS.Workbook();
  book.creator = 'Task Doctor';
  const issues = book.addWorksheet('Issues', { views: [{ state: 'frozen', ySplit: 1 }] });
  issues.columns = [
    { header: 'App', key: 'app', width: 14 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Flow no.', key: 'no', width: 8 }, { header: 'Flow', key: 'flow', width: 26 },
    { header: 'Screen', key: 'screen', width: 22 }, { header: 'Page', key: 'page', width: 20 },
    { header: 'Issue', key: 'text', width: 50 }, { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Status', key: 'status', width: 18 }, { header: 'Status date', key: 'statusDate', width: 13, style: { numFmt: 'dd mmm yyyy' } },
    { header: 'Assigned to', key: 'assignees', width: 24 }, { header: 'Remarks', key: 'remarks', width: 36 },
    { header: 'Added on', key: 'createdAt', width: 13, style: { numFmt: 'dd mmm yyyy' } },
  ];
  const screens = book.addWorksheet('Screens', { views: [{ state: 'frozen', ySplit: 1 }] });
  screens.columns = [
    { header: 'App', key: 'app', width: 14 }, { header: 'Module', key: 'module', width: 16 },
    { header: 'Flow no.', key: 'no', width: 8 }, { header: 'Flow', key: 'flow', width: 26 },
    { header: 'Step', key: 'step', width: 6 }, { header: 'Screen', key: 'screen', width: 24 },
    { header: 'Page', key: 'page', width: 20 }, { header: 'Platform', key: 'device', width: 9 },
    { header: 'Open issues', key: 'open', width: 11 }, { header: 'Total issues', key: 'total', width: 11 },
  ];

  board.forEach((p) => p.modules.forEach((m) => numberedFlows(m).forEach(({ flow, no }) => {
    flow.screens.filter((s) => s.type !== 'condition').forEach((s, i) => {
      const base = { app: p.name, module: m.name, no, flow: flow.name, screen: s.name, page: s.page };
      screens.addRow({ ...base, step: i + 1, device: s.device === 'web' ? 'Web' : 'App',
        open: s.comments.filter((c) => !c.resolved).length, total: s.comments.length });
      s.comments.forEach((c) => issues.addRow({
        ...base, text: c.text, priority: PRIORITY[c.priority] || c.priority, status: statusName[c.status] || c.status,
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

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="task-doctor-${stamp}.xlsx"`);
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
    'INSERT INTO statuses (id, label, color, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), label, color, Date.now()]);
  res.status(201).json(toStatus(rows[0]));
}));

app.patch('/api/statuses/:id', route(async (req, res) => {
  need(req, 'super');
  await live('statuses', req.params.id);
  const fields = {};
  if (req.body.label !== undefined) fields.label = required(text(req.body.label, 40), 'Name');
  if (req.body.color !== undefined) fields.color = oneOf(req.body.color, COLORS, 'color');
  await update('statuses', req.params.id, fields);
  res.json(toStatus(await live('statuses', req.params.id, '*')));
}));

// Issues already on a removed status keep it until someone picks another one.
app.delete('/api/statuses/:id', route(async (req, res) => {
  need(req, 'super');
  if (BUILT_IN_STATUSES.includes(req.params.id)) throw new HttpError(400, 'Pending and Complete cannot be removed');
  await softDelete('statuses', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- products

app.post('/api/products', route(async (req, res) => {
  need(req, 'super');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query('INSERT INTO products (id, name, sort_order) VALUES ($1, $2, $3) RETURNING *', [randomUUID(), name, Date.now()]);
  res.status(201).json(toProduct(rows[0]));
}));

app.patch('/api/products/:id', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'super');
  const name = required(text(req.body.name), 'Name');
  res.json(toProduct(await one('UPDATE products SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

app.delete('/api/products/:id', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'super');
  await softDelete('products', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- modules

app.post('/api/products/:id/modules', route(async (req, res) => {
  await allowed(req, 'products', req.params.id, 'full');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO modules (id, product_id, name, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now()]);
  res.status(201).json(toModule(rows[0]));
}));

app.patch('/api/modules/:id', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'full');
  const name = required(text(req.body.name), 'Name');
  res.json(toModule(await one('UPDATE modules SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

app.delete('/api/modules/:id', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'full');
  await softDelete('modules', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- flows

app.post('/api/modules/:id/flows', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'full');
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO flows (id, module_id, name, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now()]);
  res.status(201).json(toFlow(rows[0]));
}));

// Flows are numbered in this order (1, 2, 3 …); the move up / down buttons save it.
app.put('/api/modules/:id/flow-order', route(async (req, res) => {
  await allowed(req, 'modules', req.params.id, 'full');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  await db.tx(async (client) => {
    for (const [index, id] of ids.entries()) {
      await client.query('UPDATE flows SET sort_order = $2 WHERE id = $3 AND module_id = $1 AND NOT is_deleted', [req.params.id, index, id]);
    }
  });
  res.json({ ok: true });
}));

app.patch('/api/flows/:id', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  const name = required(text(req.body.name), 'Name');
  res.json(toFlow(await one('UPDATE flows SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

// Drag & drop: save the new card order of a flow (cards may come from another flow).
app.put('/api/flows/:id/order', route(async (req, res) => {
  const productId = await allowed(req, 'flows', req.params.id, 'edit');
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  const { rows } = await db.query(
    `SELECT count(*)::int AS n FROM screens s JOIN flows f ON f.id = s.flow_id JOIN modules m ON m.id = f.module_id
     WHERE s.id = ANY($1) AND m.product_id <> $2`, [ids, productId]);
  if (rows[0].n) throw new HttpError(400, 'Screens can only be moved within the same app');
  await db.tx(async (client) => {
    for (const [index, id] of ids.entries()) {
      await client.query('UPDATE screens SET flow_id = $1, sort_order = $2 WHERE id = $3 AND NOT is_deleted', [req.params.id, index, id]);
    }
  });
  res.json({ ok: true });
}));

app.delete('/api/flows/:id', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  await softDelete('flows', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- flow videos (Cloudinary), raw file body up to 100 MB

app.post('/api/flows/:id/video', express.raw({ type: 'video/*', limit: '100mb' }), route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'edit');
  if (!cloud.configured()) throw new HttpError(503, 'Video storage is not set up. Add the Cloudinary keys to .env and restart.');
  if (!Buffer.isBuffer(req.body) || !req.body.length) throw new HttpError(400, 'Please upload a video file (MP4, MOV or WEBM)');
  const { url, publicId } = await cloud.uploadVideo(req.body, req.params.id);
  const { rows } = await db.query('UPDATE flows SET video_url = $2, video_public_id = $3 WHERE id = $1 RETURNING *', [req.params.id, url, publicId]);
  res.json(toFlow(rows[0]));
}));

app.delete('/api/flows/:id/video', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'edit');
  const flow = await live('flows', req.params.id, 'video_public_id');
  const { rows } = await db.query('UPDATE flows SET video_url = NULL, video_public_id = NULL WHERE id = $1 RETURNING *', [req.params.id]);
  await cloud.remove([flow.video_public_id], 'video');
  res.json(toFlow(rows[0]));
}));

// ---------------------------------------------------------------- screens + conditions

// type "condition" = a decision step, e.g. "Mandate status" → Success / Pending / Else, each leading to a screen
app.post('/api/flows/:id/screens', route(async (req, res) => {
  await allowed(req, 'flows', req.params.id, 'full');
  const id = randomUUID();
  if (req.body.type === 'condition') {
    const name = required(text(req.body.name), 'Condition name');
    const branches = ['Success', 'Pending', 'Else'].map((label) => ({ id: randomUUID(), label, targetId: null }));
    await db.query(
      `INSERT INTO screens (id, flow_id, type, name, branches, sort_order) VALUES ($1, $2, 'condition', $3, $4, $5)`,
      [id, req.params.id, name, JSON.stringify(branches), Date.now()]);
  } else {
    const name = required(text(req.body.name), 'Screen name');
    const device = DEVICES.includes(req.body.device) ? req.body.device : 'app';
    await db.query(
      'INSERT INTO screens (id, flow_id, name, page, device, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, req.params.id, name, text(req.body.page), device, Date.now()]);
  }
  res.status(201).json(await getScreen(id));
}));

app.patch('/api/screens/:id', route(async (req, res) => {
  const productId = await allowed(req, 'screens', req.params.id, 'edit');
  const screen = await live('screens', req.params.id, '*');
  const b = req.body;
  const fields = {};
  if (b.name !== undefined) fields.name = required(text(b.name), 'Name');
  if (b.page !== undefined) fields.page = text(b.page);
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

  await update('screens', screen.id, fields);
  res.json(await getScreen(screen.id));
}));

// Extend one branch of a condition into its own path flow, named after the branch ("Sign Up › Success").
app.post('/api/screens/:id/branches/:branchId/path', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'full');
  const cond = await live('screens', req.params.id, '*');
  const branch = cond.type === 'condition' && cond.branches.find((b) => b.id === req.params.branchId);
  if (!branch) throw new HttpError(404, 'Not found');
  const flow = await live('flows', cond.flow_id, '*');
  const name = text(req.body.name) || `${flow.name} › ${branch.label || 'Path'}`;
  const { rows } = await db.query(
    `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_condition_id, from_branch_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [randomUUID(), flow.module_id, name, Date.now(), flow.id, cond.id, branch.id]);
  res.status(201).json(toFlow(rows[0]));
}));

// Deleting a screen keeps its row, image and issues (only flagged is_deleted).
app.delete('/api/screens/:id', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'full');
  await softDelete('screens', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- screen images (stored in Cloudinary)

app.post('/api/screens/:id/image', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'edit');
  if (!cloud.configured()) throw new HttpError(503, 'Image storage is not set up. Add the Cloudinary keys to .env and restart.');
  if (!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(req.body.dataUrl || '')) {
    throw new HttpError(400, 'Please upload a PNG, JPG, WEBP or GIF image');
  }
  const { url, publicId } = await cloud.upload(req.body.dataUrl, req.params.id);
  await db.query('UPDATE screens SET image_url = $2, image_public_id = $3 WHERE id = $1', [req.params.id, url, publicId]);
  res.json(await getScreen(req.params.id));
}));

app.delete('/api/screens/:id/image', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'edit');
  const screen = await live('screens', req.params.id, 'image_public_id');
  await db.query('UPDATE screens SET image_url = NULL, image_public_id = NULL WHERE id = $1', [req.params.id]);
  await cloud.remove([screen.image_public_id]);
  res.json(await getScreen(req.params.id));
}));

// ---------------------------------------------------------------- copy a screen into other flows

// Each copy is independent: its own image and issues.
// Copies share a link_id so the UI can show where else the screen is used.
// One screen copied into a flow (shares link_id with the source). Returns the new id.
async function copyScreenRow(client, source, flowId, sortOrder, withIssues) {
  const linkId = source.link_id || source.id;
  if (!source.link_id) {
    await client.query('UPDATE screens SET link_id = $2 WHERE id = $1', [source.id, linkId]);
    source.link_id = linkId;
  }
  const id = randomUUID();
  await client.query(
    `INSERT INTO screens (id, flow_id, name, page, device, wireframe, link_id, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, flowId, source.name, source.page, source.device, source.wireframe, linkId, sortOrder]);
  if (withIssues) {
    await client.query(
      `INSERT INTO comments (id, screen_id, text, priority, assignees, remarks, status, status_date)
       SELECT gen_random_uuid()::text, $1, text, priority, assignees, remarks, status, status_date
       FROM comments WHERE screen_id = $2 AND NOT resolved AND NOT is_deleted`,
      [id, source.id]);
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
    `INSERT INTO screens (id, flow_id, type, name, branches, sort_order) VALUES ($1, $2, 'condition', $3, $4, $5)`,
    [id, flowId, cond.name, JSON.stringify(branches.map(({ oldId, ...b }) => b)), sortOrder]);
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
        `INSERT INTO flows (id, module_id, name, sort_order, parent_flow_id, from_condition_id, from_branch_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pathId, flowRow[0].module_id, rename(path.name), Date.now() + i, flowId, id, b.id]);
      const { rows: steps } = await client.query(
        'SELECT * FROM screens WHERE flow_id = $1 AND NOT is_deleted ORDER BY sort_order, created_at', [path.id]);
      for (const [j, step] of steps.entries()) {
        if (step.type === 'condition') await copyConditionRow(client, step, pathId, j, ctx);
        else {
          const copyId = await copyScreenRow(client, step, pathId, j, ctx.withIssues);
          ctx.map.set(step.id, copyId);
          if (step.image_url) ctx.images.push({ id: copyId, url: step.image_url });
        }
      }
    }
  }
  return id;
}

// each copy gets its own Cloudinary image, so replacing one never changes the other
async function copyImages(images) {
  if (!images.length || !cloud.configured()) return;
  await Promise.all(images.map(async ({ id, url }) => {
    try {
      const up = await cloud.upload(url, id);
      await db.query('UPDATE screens SET image_url = $2, image_public_id = $3 WHERE id = $1', [id, up.url, up.publicId]);
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
        const ctx = { map: new Map(), images, conditions: [], withIssues };
        created.push(await copyConditionRow(client, source, flowId, Date.now() + i, ctx));
        for (const c of ctx.conditions) {
          const branches = c.branches.map(({ oldId, ...b }) => ({ ...b, targetId: ctx.map.get(b.targetId) || null }));
          await client.query('UPDATE screens SET branches = $2 WHERE id = $1', [c.id, JSON.stringify(branches)]);
        }
      } else {
        const id = await copyScreenRow(client, source, flowId, Date.now() + i, withIssues);
        if (source.image_url) images.push({ id, url: source.image_url });
        created.push(id);
      }
    }
    return created;
  });

  await copyImages(images);
  res.status(201).json(await Promise.all(ids.map(getScreen)));
}));

// ---------------------------------------------------------------- issues

app.post('/api/screens/:id/comments', route(async (req, res) => {
  await allowed(req, 'screens', req.params.id, 'edit');
  const s = await statusFields(req.body.status || 'pending');
  const { rows } = await db.query(
    `INSERT INTO comments (id, screen_id, text, priority, assignees, remarks, status, status_date, resolved)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      randomUUID(),
      req.params.id,
      required(text(req.body.text, 1000), 'Issue'),
      PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium',
      people(req.body.assignees),
      text(req.body.remarks, 1000),
      s.status, s.status_date, s.resolved,
    ]);
  res.status(201).json(toComment(rows[0]));
}));

app.patch('/api/comments/:id', route(async (req, res) => {
  await allowed(req, 'comments', req.params.id, 'edit');
  const b = req.body;
  const issue = await live('comments', req.params.id, 'status');
  const fields = {};
  // The "Fixed" tick is a shortcut: ticked → Complete, unticked → back to Pending.
  const status = b.status !== undefined ? b.status : b.resolved !== undefined ? (b.resolved ? 'complete' : 'pending') : undefined;
  if (status !== undefined && status !== issue.status) Object.assign(fields, await statusFields(status));
  if (b.priority !== undefined) fields.priority = oneOf(b.priority, PRIORITIES, 'priority');
  if (b.text !== undefined) fields.text = required(text(b.text, 1000), 'Issue');
  if (b.assignees !== undefined) fields.assignees = people(b.assignees);
  if (b.remarks !== undefined) fields.remarks = text(b.remarks, 1000);
  await update('comments', req.params.id, fields);
  res.json(toComment(await one('SELECT * FROM comments WHERE id = $1', [req.params.id])));
}));

app.delete('/api/comments/:id', route(async (req, res) => {
  await allowed(req, 'comments', req.params.id, 'full');
  await softDelete('comments', req.params.id);
  res.json({ ok: true });
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

db.init()
  .then(ensureSuperAdmin)
  .then(() => app.listen(PORT, () => {
    console.log(`Task Doctor running at http://localhost:${PORT}`);
    if (!cloud.configured()) console.log('Image uploads are off: add the Cloudinary keys to .env to turn them on.');
  }))
  .catch((err) => {
    console.error('Could not connect to the database:', err.message);
    process.exit(1);
  });
