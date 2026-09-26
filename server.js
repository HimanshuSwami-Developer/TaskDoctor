'use strict';
const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const db = require('./db');
const cloud = require('./cloud');

const PORT = Number(process.env.PORT) || 4000;
const COLORS = ['slate', 'amber', 'sky', 'indigo', 'violet', 'pink', 'red', 'teal', 'green'];
const BUILT_IN_STATUSES = ['pending', 'complete']; // new screens start Pending; Complete drives progress
const DEVICES = ['app', 'web'];
const WIREFRAMES = ['form', 'list', 'dashboard', 'detail'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];

const app = express();
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

// ---------------------------------------------------------------- row → API shape (same JSON the front-end always used)

const SCREEN_SELECT = 'SELECT s.* FROM screens s';

const toProduct = (r) => ({ id: r.id, name: r.name, order: r.sort_order });
const toModule = (r) => ({ id: r.id, productId: r.product_id, name: r.name, order: r.sort_order });
const toFlow = (r) => ({ id: r.id, moduleId: r.module_id, name: r.name, order: r.sort_order });
const toStatus = (r) => ({ id: r.id, label: r.label, color: r.color, builtIn: BUILT_IN_STATUSES.includes(r.id), deleted: r.is_deleted });
const toComment = (r) => ({
  id: r.id, screenId: r.screen_id, text: r.text, priority: r.priority,
  assignees: r.assignees, remarks: r.remarks, resolved: r.resolved, createdAt: r.created_at,
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
    status: r.status,
    statusDate: r.status_date,
    linkId: r.link_id,
    order: r.sort_order,
  };
}

const getScreen = async (id) => toScreen(await live('screens', id, '*'));

// ---------------------------------------------------------------- board

app.get('/api/board', route(async (req, res) => {
  const [products, modules, flows, screens, comments] = await Promise.all([
    db.query('SELECT * FROM products WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query('SELECT * FROM modules WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query('SELECT * FROM flows WHERE NOT is_deleted ORDER BY sort_order, created_at'),
    db.query(`${SCREEN_SELECT} WHERE NOT s.is_deleted ORDER BY s.sort_order, s.created_at`),
    db.query('SELECT * FROM comments WHERE NOT is_deleted ORDER BY created_at'),
  ]);
  const commentsBy = {};
  comments.rows.forEach((c) => (commentsBy[c.screen_id] ||= []).push(toComment(c)));
  const screensBy = {};
  screens.rows.forEach((s) => (screensBy[s.flow_id] ||= []).push({ ...toScreen(s), comments: commentsBy[s.id] || [] }));
  const flowsBy = {};
  flows.rows.forEach((f) => (flowsBy[f.module_id] ||= []).push({ ...toFlow(f), screens: screensBy[f.id] || [] }));
  const modulesBy = {};
  modules.rows.forEach((m) => (modulesBy[m.product_id] ||= []).push({ ...toModule(m), flows: flowsBy[m.id] || [] }));
  const board = products.rows.map((p) => ({ ...toProduct(p), modules: modulesBy[p.id] || [] }));

  // A branch pointing at a deleted screen shows as unset (the stored target stays until the condition is edited).
  const shown = board.flatMap((p) => p.modules).flatMap((m) => m.flows).flatMap((f) => f.screens);
  const visible = new Set(shown.map((s) => s.id));
  shown.filter((s) => s.type === 'condition').forEach((c) => {
    c.branches = c.branches.map((b) => (b.targetId && !visible.has(b.targetId) ? { ...b, targetId: null } : b));
  });
  res.json(board);
}));

// ---------------------------------------------------------------- status tags

// Deleted statuses are returned too (flagged) so screens still on one can show its name.
app.get('/api/statuses', route(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM statuses ORDER BY sort_order, created_at');
  res.json(rows.map(toStatus));
}));

app.post('/api/statuses', route(async (req, res) => {
  const label = required(text(req.body.label, 40), 'Name');
  const color = COLORS.includes(req.body.color) ? req.body.color : 'slate';
  const { rows } = await db.query(
    'INSERT INTO statuses (id, label, color, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), label, color, Date.now()]);
  res.status(201).json(toStatus(rows[0]));
}));

app.patch('/api/statuses/:id', route(async (req, res) => {
  await live('statuses', req.params.id);
  const fields = {};
  if (req.body.label !== undefined) fields.label = required(text(req.body.label, 40), 'Name');
  if (req.body.color !== undefined) fields.color = oneOf(req.body.color, COLORS, 'color');
  await update('statuses', req.params.id, fields);
  res.json(toStatus(await live('statuses', req.params.id, '*')));
}));

// Screens already on a removed status keep it until someone picks another one.
app.delete('/api/statuses/:id', route(async (req, res) => {
  if (BUILT_IN_STATUSES.includes(req.params.id)) throw new HttpError(400, 'Pending and Complete cannot be removed');
  await softDelete('statuses', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- products

app.post('/api/products', route(async (req, res) => {
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query('INSERT INTO products (id, name, sort_order) VALUES ($1, $2, $3) RETURNING *', [randomUUID(), name, Date.now()]);
  res.status(201).json(toProduct(rows[0]));
}));

app.patch('/api/products/:id', route(async (req, res) => {
  const name = required(text(req.body.name), 'Name');
  res.json(toProduct(await one('UPDATE products SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

app.delete('/api/products/:id', route(async (req, res) => {
  await softDelete('products', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- modules

app.post('/api/products/:id/modules', route(async (req, res) => {
  await live('products', req.params.id);
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO modules (id, product_id, name, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now()]);
  res.status(201).json(toModule(rows[0]));
}));

app.patch('/api/modules/:id', route(async (req, res) => {
  const name = required(text(req.body.name), 'Name');
  res.json(toModule(await one('UPDATE modules SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

app.delete('/api/modules/:id', route(async (req, res) => {
  await softDelete('modules', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- flows

app.post('/api/modules/:id/flows', route(async (req, res) => {
  await live('modules', req.params.id);
  const name = required(text(req.body.name), 'Name');
  const { rows } = await db.query(
    'INSERT INTO flows (id, module_id, name, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [randomUUID(), req.params.id, name, Date.now()]);
  res.status(201).json(toFlow(rows[0]));
}));

app.patch('/api/flows/:id', route(async (req, res) => {
  const name = required(text(req.body.name), 'Name');
  res.json(toFlow(await one('UPDATE flows SET name = $2 WHERE id = $1 AND NOT is_deleted RETURNING *', [req.params.id, name])));
}));

// Drag & drop: save the new card order of a flow (cards may come from another flow).
app.put('/api/flows/:id/order', route(async (req, res) => {
  await live('flows', req.params.id);
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x) => typeof x === 'string') : [];
  await db.tx(async (client) => {
    for (const [index, id] of ids.entries()) {
      await client.query('UPDATE screens SET flow_id = $1, sort_order = $2 WHERE id = $3 AND NOT is_deleted', [req.params.id, index, id]);
    }
  });
  res.json({ ok: true });
}));

app.delete('/api/flows/:id', route(async (req, res) => {
  await softDelete('flows', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- screens + conditions

// type "condition" = a decision step, e.g. "Mandate status" → Success / Pending / Else, each leading to a screen
app.post('/api/flows/:id/screens', route(async (req, res) => {
  await live('flows', req.params.id);
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
  const screen = await live('screens', req.params.id, '*');
  const b = req.body;
  const fields = {};
  if (b.name !== undefined) fields.name = required(text(b.name), 'Name');
  if (b.page !== undefined) fields.page = text(b.page);
  if (b.device !== undefined) fields.device = oneOf(b.device, DEVICES, 'device');
  if (b.wireframe !== undefined) fields.wireframe = oneOf(b.wireframe, WIREFRAMES, 'wireframe');

  // Pending → no stored date (the sheet shows today). Any other status → date frozen when set.
  if (b.status !== undefined && b.status !== screen.status) {
    const { rows } = await db.query('SELECT id FROM statuses WHERE id = $1 AND NOT is_deleted', [b.status]);
    if (!rows[0]) throw new HttpError(400, 'Invalid status');
    fields.status = b.status;
    fields.status_date = b.status === 'pending' ? null : new Date();
  }

  if (b.branches !== undefined) {
    if (screen.type !== 'condition' || !Array.isArray(b.branches)) throw new HttpError(400, 'Invalid branches');
    const wanted = b.branches.map((x) => x && x.targetId).filter((x) => typeof x === 'string');
    const { rows } = await db.query(`SELECT id FROM screens WHERE id = ANY($1) AND type <> 'condition' AND id <> $2 AND NOT is_deleted`, [wanted, screen.id]);
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

// Deleting a screen keeps its row, image and issues (only flagged is_deleted).
app.delete('/api/screens/:id', route(async (req, res) => {
  await softDelete('screens', req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- screen images (stored in Cloudinary)

app.post('/api/screens/:id/image', route(async (req, res) => {
  await live('screens', req.params.id);
  if (!cloud.configured()) throw new HttpError(503, 'Image storage is not set up. Add the Cloudinary keys to .env and restart.');
  if (!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(req.body.dataUrl || '')) {
    throw new HttpError(400, 'Please upload a PNG, JPG, WEBP or GIF image');
  }
  const { url, publicId } = await cloud.upload(req.body.dataUrl, req.params.id);
  await db.query('UPDATE screens SET image_url = $2, image_public_id = $3 WHERE id = $1', [req.params.id, url, publicId]);
  res.json(await getScreen(req.params.id));
}));

app.delete('/api/screens/:id/image', route(async (req, res) => {
  const screen = await live('screens', req.params.id, 'image_public_id');
  await db.query('UPDATE screens SET image_url = NULL, image_public_id = NULL WHERE id = $1', [req.params.id]);
  await cloud.remove([screen.image_public_id]);
  res.json(await getScreen(req.params.id));
}));

// ---------------------------------------------------------------- copy a screen into other flows

// Each copy is independent: its own status (starts Pending), image and issues.
// Copies share a link_id so the UI can show where else the screen is used.
app.post('/api/screens/:id/copy', route(async (req, res) => {
  const source = await live('screens', req.params.id, '*');
  if (source.type === 'condition') throw new HttpError(400, 'Conditions cannot be copied');
  const flowIds = [...new Set(Array.isArray(req.body.flowIds) ? req.body.flowIds.filter((x) => typeof x === 'string') : [])];
  if (!flowIds.length) throw new HttpError(400, 'Choose at least one flow');
  const { rows: found } = await db.query('SELECT id FROM flows WHERE id = ANY($1) AND NOT is_deleted', [flowIds]);
  if (found.length !== flowIds.length) throw new HttpError(404, 'Not found');

  const linkId = source.link_id || source.id;
  const ids = await db.tx(async (client) => {
    await client.query('UPDATE screens SET link_id = $2 WHERE id = $1', [source.id, linkId]);
    const created = [];
    for (const [i, flowId] of flowIds.entries()) {
      const id = randomUUID();
      await client.query(
        `INSERT INTO screens (id, flow_id, name, page, device, wireframe, link_id, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, flowId, source.name, source.page, source.device, source.wireframe, linkId, Date.now() + i]);
      if (req.body.withIssues) {
        await client.query(
          `INSERT INTO comments (id, screen_id, text, priority, assignees, remarks)
           SELECT gen_random_uuid()::text, $1, text, priority, assignees, remarks
           FROM comments WHERE screen_id = $2 AND NOT resolved AND NOT is_deleted`,
          [id, source.id]);
      }
      created.push(id);
    }
    return created;
  });

  // each copy gets its own Cloudinary image, so replacing one never changes the other
  if (source.image_url && cloud.configured()) {
    await Promise.all(ids.map(async (id) => {
      try {
        const { url, publicId } = await cloud.upload(source.image_url, id);
        await db.query('UPDATE screens SET image_url = $2, image_public_id = $3 WHERE id = $1', [id, url, publicId]);
      } catch (err) {
        console.error(`Copying image for screen ${id} failed:`, err.message);
      }
    }));
  }

  res.status(201).json(await Promise.all(ids.map(getScreen)));
}));

// ---------------------------------------------------------------- issues

app.post('/api/screens/:id/comments', route(async (req, res) => {
  await live('screens', req.params.id);
  const { rows } = await db.query(
    `INSERT INTO comments (id, screen_id, text, priority, assignees, remarks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      randomUUID(),
      req.params.id,
      required(text(req.body.text, 1000), 'Issue'),
      PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium',
      people(req.body.assignees),
      text(req.body.remarks, 1000),
    ]);
  res.status(201).json(toComment(rows[0]));
}));

app.patch('/api/comments/:id', route(async (req, res) => {
  const b = req.body;
  const fields = {};
  if (b.resolved !== undefined) fields.resolved = Boolean(b.resolved);
  if (b.priority !== undefined) fields.priority = oneOf(b.priority, PRIORITIES, 'priority');
  if (b.text !== undefined) fields.text = required(text(b.text, 1000), 'Issue');
  if (b.assignees !== undefined) fields.assignees = people(b.assignees);
  if (b.remarks !== undefined) fields.remarks = text(b.remarks, 1000);
  await live('comments', req.params.id);
  await update('comments', req.params.id, fields);
  res.json(toComment(await one('SELECT * FROM comments WHERE id = $1', [req.params.id])));
}));

app.delete('/api/comments/:id', route(async (req, res) => {
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

db.init()
  .then(() => app.listen(PORT, () => {
    console.log(`Task sheet running at http://localhost:${PORT}`);
    if (!cloud.configured()) console.log('Image uploads are off: add the Cloudinary keys to .env to turn them on.');
  }))
  .catch((err) => {
    console.error('Could not connect to the database:', err.message);
    process.exit(1);
  });
