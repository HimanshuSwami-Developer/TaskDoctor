#!/usr/bin/env node
/*
 * Builds schemas/findost.json, the DB Schema page of the Findost apps: every table of the Findost database
 * (only that one, not Finzoom or Accord), its columns and the foreign keys between tables.
 *
 * Read from the findost_be code, no database connection:
 *   - migrations/*.sql   CREATE TABLE / ALTER TABLE … ADD COLUMN, REFERENCES and FOREIGN KEY, RENAME TO
 *   - src/models/*.js    the Sequelize models (types, primary keys, references) and their associations (index.js)
 * A link that is only an association with constraints: false is kept as "logical": joined in the code, not a DB key.
 *
 *   node scripts/findost-schema.cjs [path to findost_be]     (default ../../Findost/findost_be)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const BE = path.resolve(process.argv[2] || path.join(__dirname, '../../../Findost/findost_be'));
const OUT = path.join(__dirname, '../schemas/findost.json'); // served by GET /api/schema to logins that can open the app
if (!fs.existsSync(path.join(BE, 'migrations'))) { console.error(`No migrations folder in ${BE}`); process.exit(1); }

const tables = new Map(); // name → { name, note, columns: Map(name → column), sources: Set }
const fks = new Map(); // "table.col→table.col" → fk
const renames = new Map(); // old table name → new

const table = (name, source) => {
  if (!tables.has(name)) tables.set(name, { name, note: '', columns: new Map(), sources: new Set() });
  const t = tables.get(name);
  if (source) t.sources.add(source);
  return t;
};
const column = (t, name, fields) => {
  const c = t.columns.get(name) || { name, type: '', nullable: true, pk: false, unique: false, default: null, note: '' };
  // the first place that says it wins (migrations are read before the models)
  for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null && v !== '' && !c[k]) c[k] = v;
  t.columns.set(name, c);
  return c;
};
const addFk = (from, col, to, toCol, extra) => {
  const key = `${from}.${col}→${to}.${toCol}`;
  const was = fks.get(key);
  // a DB constraint (migration or model with constraints) beats a logical link; keep the first ON DELETE found
  fks.set(key, {
    from, column: col, to, toColumn: toCol,
    onDelete: (was && was.onDelete) || extra.onDelete || null,
    kind: was && was.kind === 'db' ? 'db' : extra.kind,
    sources: [...new Set([...(was ? was.sources : []), extra.source])],
  });
};

// ---------------------------------------------------------------- migrations

const unq = (s) => s.trim().replace(/"/g, '').replace(/^public\./i, '').toLowerCase();
// split on commas outside brackets
function splitTop(body) {
  const parts = []; let depth = 0; let cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}
const ON_DELETE = /ON\s+DELETE\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/i;
const REF = /REFERENCES\s+([\w."]+)\s*\(\s*([\w"]+)\s*\)/i;
const COLUMN_DEF = /^\s*("?[a-z_][\w]*"?)\s+(.+)$/is;
const NOT_COLUMNS = /^(PRIMARY|UNIQUE|CONSTRAINT|FOREIGN|CHECK|EXCLUDE|LIKE)\b/i;

function readColumn(t, def, note, file) {
  const m = def.match(COLUMN_DEF);
  if (!m) return;
  const name = unq(m[1]);
  const rest = m[2].trim();
  const type = rest.split(/\s+(?=NOT\b|NULL\b|DEFAULT\b|PRIMARY\b|REFERENCES\b|UNIQUE\b|CHECK\b|CONSTRAINT\b|GENERATED\b)/i)[0].trim();
  const dflt = rest.match(/DEFAULT\s+((?:'[^']*'(?:::\w+)?)|(?:\w+\([^)]*\))|[^\s,]+)/i);
  if (dflt && /^NULL$/i.test(dflt[1])) dflt[1] = undefined;
  const c = column(t, name, {
    type: type.toUpperCase(),
    pk: /PRIMARY\s+KEY/i.test(rest) || undefined,
    unique: /\bUNIQUE\b/i.test(rest) || undefined,
    default: dflt ? dflt[1] : undefined,
    note,
  });
  if (/NOT\s+NULL|PRIMARY\s+KEY/i.test(rest)) c.nullable = false;
  const ref = rest.match(REF);
  if (ref) addFk(t.name, name, unq(ref[1]), unq(ref[2]), { onDelete: (rest.match(ON_DELETE) || [])[1], kind: 'db', source: file });
}
function readTableConstraint(t, def, file) {
  const fk = def.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([\w."]+)\s*\(([^)]+)\)/i);
  if (fk) {
    const cols = fk[1].split(',').map(unq); const refs = fk[3].split(',').map(unq);
    cols.forEach((c, i) => addFk(t.name, c, unq(fk[2]), refs[i] || refs[0], { onDelete: (def.match(ON_DELETE) || [])[1], kind: 'db', source: file }));
  }
  const pk = def.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
  if (pk) pk[1].split(',').map(unq).forEach((c) => { const col = t.columns.get(c); if (col) { col.pk = true; col.nullable = false; } });
  const uq = !fk && def.match(/UNIQUE\s*\(([^)]+)\)/i);
  if (uq) {
    const cols = uq[1].split(',').map(unq);
    if (cols.length === 1 && t.columns.get(cols[0])) t.columns.get(cols[0]).unique = true;
    else (t.uniques = t.uniques || []).push(cols);
  }
}

// a statement's lines → [definition, trailing comment] pairs, so a column keeps the "-- what it is" written next to it
function defsWithNotes(body) {
  const lines = body.split('\n');
  const clean = []; const notes = [];
  lines.forEach((line) => {
    const at = line.indexOf('--');
    const code = at >= 0 ? line.slice(0, at) : line;
    const note = at >= 0 ? line.slice(at + 2).replace(/[─━]+/g, '').trim() : '';
    clean.push(code); notes.push(code.trim() ? note : '');
  });
  const out = []; let line = 0; let buf = ''; let depth = 0; let note = '';
  const text = clean.join('\n');
  for (const ch of text) {
    if (ch === '\n') { if (notes[line] && buf.trim()) note = note || notes[line]; line++; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push([buf.trim(), note]); buf = ''; note = ''; } else buf += ch;
  }
  if (buf.trim()) out.push([buf.trim(), note || notes[line] || '']);
  return out.filter(([d]) => d);
}

const stripComments = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => { const i = l.indexOf('--'); return i >= 0 ? l.slice(0, i) : l; }).join('\n');

const files = fs.readdirSync(path.join(BE, 'migrations')).filter((f) => f.endsWith('.sql')).sort();
for (const file of files) {
  const raw = fs.readFileSync(path.join(BE, 'migrations', file), 'utf8');
  const where = `migrations/${file}`;
  // CREATE TABLE name ( … ); — read on the raw text so column comments stay
  const create = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([\w."]+)\s*\(/gi;
  let m;
  while ((m = create.exec(raw))) {
    let depth = 1; let i = create.lastIndex; let inLineComment = false;
    for (; i < raw.length && depth; i++) {
      const ch = raw[i];
      if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
      if (ch === '-' && raw[i + 1] === '-') { inLineComment = true; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
    const body = raw.slice(create.lastIndex, i - 1);
    const t = table(unq(m[1]), where);
    // the comment block right above the CREATE says what the table is for
    if (!t.note) {
      const above = raw.slice(0, m.index).split('\n').reverse();
      const lines = [];
      for (const l of above.slice(above[0].trim() ? 0 : 1)) { if (/^\s*--/.test(l)) lines.unshift(l.replace(/^\s*--+\s?/, '').replace(/[─━=]{3,}/g, '').trim()); else break; }
      // "── Groups", "1. Campaign", "ap_sips: SIPs an AP …" → the words only
      t.note = lines.filter(Boolean).join(' ').replace(/\s+/g, ' ').replace(/^[─━\s]+|^\d+\.\s*/g, '')
        .replace(new RegExp(`^${t.name}\\s*[:—-]\\s*`, 'i'), '').slice(0, 400);
    }
    for (const [def, note] of defsWithNotes(body)) {
      if (NOT_COLUMNS.test(def)) readTableConstraint(t, def, where); else readColumn(t, def, note, where);
    }
  }
  const sql = stripComments(raw);
  // ALTER TABLE name ADD COLUMN …, ADD CONSTRAINT … FOREIGN KEY …, RENAME TO …
  for (const st of sql.split(';')) {
    const alt = st.match(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?([\w."]+)\s+([\s\S]+)/i);
    if (!alt) continue;
    const name = unq(alt[1]);
    const rename = alt[2].match(/^\s*RENAME\s+TO\s+([\w."]+)/i);
    if (rename) { renames.set(name, unq(rename[1])); continue; }
    const renameCol = alt[2].match(/^\s*RENAME\s+(?:COLUMN\s+)?([\w"]+)\s+TO\s+([\w"]+)/i);
    if (renameCol) { const t = tables.get(name); const c = t && t.columns.get(unq(renameCol[1])); if (c) { t.columns.delete(c.name); c.name = unq(renameCol[2]); t.columns.set(c.name, c); } continue; }
    for (const action of splitTop(alt[2])) {
      const add = action.match(/^\s*ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?([\s\S]+)/i);
      const drop = action.match(/^\s*DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?([\w"]+)/i);
      if (drop) { const t = tables.get(name); if (t) t.columns.delete(unq(drop[1])); continue; }
      if (!add) continue;
      const t = table(name);
      if (/^(CONSTRAINT|FOREIGN|PRIMARY|UNIQUE|CHECK)\b/i.test(add[1].trim())) readTableConstraint(t, add[1].replace(/^\s*CONSTRAINT\s+[\w"]+\s+/i, ''), where);
      else readColumn(t, add[1].trim(), '', where);
    }
  }
}

// ---------------------------------------------------------------- Sequelize models (Findost DB only)

process.env.NODE_ENV = process.env.NODE_ENV || 'schema'; // no query logging
const cwd = process.cwd();
process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), 'findost-schema-'))); // the logger makes a logs/ folder in the cwd
const beRequire = createRequire(path.join(BE, 'package.json'));
const { sequelize } = beRequire('./src/config/db');
const modelDir = path.join(BE, 'src/models');
for (const f of fs.readdirSync(modelDir).filter((x) => x.endsWith('.model.js'))) {
  try { beRequire(path.join(modelDir, f)); } catch (e) { console.warn(`skipped ${f}: ${e.message}`); }
}
beRequire(path.join(modelDir, 'index.js')); // the associations
process.chdir(cwd);

const typeOf = (a) => { try { return String(a.type.toSql ? a.type.toSql() : a.type.key || a.type).toUpperCase(); } catch (e) { return String(a.type.key || '').toUpperCase(); } };
const defaultOf = (v) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'object') return v.fn ? `${v.fn.toUpperCase()}()` : v.constructor && v.constructor.name === 'NOW' ? 'NOW()' : JSON.stringify(v);
  return typeof v === 'string' ? `'${v}'` : String(v);
};
const modelOf = new Map();
for (const model of Object.values(sequelize.models)) {
  const name = String(model.getTableName().tableName || model.getTableName()).toLowerCase();
  modelOf.set(model, name);
  const t = table(name, `src/models (${model.name})`);
  for (const a of Object.values(model.rawAttributes)) {
    const col = a.field || a.fieldName;
    const had = t.columns.has(col);
    const c = column(t, col, { type: had ? undefined : typeOf(a), default: had ? undefined : defaultOf(a.defaultValue), note: a.comment });
    if (!had) { c.nullable = a.allowNull !== false && !a.primaryKey; c.unique = Boolean(a.unique); }
    if (a.primaryKey) { c.pk = true; c.nullable = false; }
    if (a.references) {
      const to = typeof a.references.model === 'string' ? a.references.model : a.references.model.tableName || a.references.model.getTableName();
      addFk(name, col, String(to).toLowerCase(), a.references.key || 'id', { onDelete: a.onDelete, kind: 'db', source: `src/models (${model.name})` });
    }
  }
  // columns in the model's order, then the ones only a migration adds
  const order = Object.values(model.rawAttributes).map((a) => a.field || a.fieldName);
  t.columns = new Map([...t.columns].sort(([a], [b]) => (order.includes(a) ? order.indexOf(a) : 1e3) - (order.includes(b) ? order.indexOf(b) : 1e3)));
}
const fieldOf = (model, attr) => (model.rawAttributes[attr] && model.rawAttributes[attr].field) || attr;
for (const model of Object.values(sequelize.models)) {
  for (const as of Object.values(model.associations || {})) {
    const kind = as.options && as.options.constraints === false ? 'logical' : 'model';
    const source = `src/models/index.js (${model.name}.${as.associationType} ${as.target.name})`;
    const onDelete = as.options && as.options.onDelete;
    if (as.associationType === 'BelongsTo') {
      addFk(modelOf.get(as.source), fieldOf(as.source, as.foreignKey), modelOf.get(as.target), fieldOf(as.target, as.targetKey), { kind, source, onDelete });
    } else if (as.associationType === 'HasMany' || as.associationType === 'HasOne') {
      addFk(modelOf.get(as.target), fieldOf(as.target, as.foreignKey), modelOf.get(as.source), fieldOf(as.source, as.sourceKey), { kind, source, onDelete });
    } else if (as.associationType === 'BelongsToMany') {
      const through = as.through.model;
      addFk(modelOf.get(through), fieldOf(through, as.foreignKey), modelOf.get(as.source), fieldOf(as.source, as.sourceKey), { kind, source, onDelete });
      addFk(modelOf.get(through), fieldOf(through, as.otherKey), modelOf.get(as.target), fieldOf(as.target, as.targetKey), { kind, source, onDelete });
    }
  }
}
sequelize.close().catch(() => {});

// ---------------------------------------------------------------- renames, groups, write

const finalName = (n) => { let x = n; const seen = new Set(); while (renames.has(x) && !seen.has(x)) { seen.add(x); x = renames.get(x); } return x; };
for (const [from] of renames) {
  const to = finalName(from);
  const old = tables.get(from);
  if (!old) continue;
  tables.delete(from);
  const t = table(to);
  old.sources.forEach((s) => t.sources.add(s));
  t.note = t.note || old.note;
  for (const [n, c] of old.columns) if (!t.columns.has(n)) t.columns.set(n, c);
}

// what a table is about, from its name (first match)
const GROUPS = [
  ['Users & accounts', /^(users|addresses|bank_account|dp_account|nominee|segment|channels|push_tokens|findost_|ekyc_)/],
  ['Trading & holdings', /^(holdings|daily_|margin_|mtf_|orders|ap_sips)/],
  ['Payouts', /^(payout|dra_payout|partner_ranks)/],
  ['Products & requests', /^(products|user_products|requests|report_requests)/],
  ['Groups', /^(groups|group_clients|partner_group)/],
  ['Notifications', /notification|^notification_templates/],
  ['Knowledge', /^(knowledge_|podcast_|recording_)/],
  ['Campaigns', /^campaign_/],
  ['App & content', /^(app_|tickets|limechat_)/],
  ['System', /./],
];
const groupOf = (n) => GROUPS.find(([, re]) => re.test(n))[0];

const links = [...fks.values()].map((f) => ({ ...f, from: finalName(f.from), to: finalName(f.to) }))
  .filter((f) => f.from && f.to && tables.has(f.from)) // a link to a table this DB does not have still shows (it is marked missing on the page)
  .sort((a, b) => a.from.localeCompare(b.from) || a.column.localeCompare(b.column));
const out = {
  database: 'Findost',
  note: 'Findost Postgres database (DB_NAME in findost_be). Built from migrations/*.sql and the Sequelize models in src/models by scripts/findost-schema.cjs.',
  generatedAt: new Date().toISOString(),
  groups: GROUPS.map(([g]) => g),
  tables: [...tables.values()].sort((a, b) => a.name.localeCompare(b.name)).map((t) => ({
    name: t.name, group: groupOf(t.name), note: t.note,
    sources: [...t.sources],
    columns: [...t.columns.values()].map((c) => ({ ...c, nullable: Boolean(c.nullable) })),
    uniques: t.uniques || [],
  })),
  foreignKeys: links,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
// one line per column and per key, so the file stays small and a diff shows what changed
const text = JSON.stringify(out, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) && ('nullable' in v || 'toColumn' in v) ? `\u0000${JSON.stringify(v)}` : v), 2)
  .replace(/"\\u0000(.*)"/g, (_all, json) => JSON.parse(`"${json}"`));
fs.writeFileSync(OUT, `${text}\n`);
console.log(`${out.tables.length} tables, ${links.length} foreign keys (${links.filter((l) => l.kind === 'db').length} DB constraints) → ${path.relative(cwd, OUT)}`);
process.exit(0);
