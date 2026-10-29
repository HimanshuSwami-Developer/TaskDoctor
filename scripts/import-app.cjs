'use strict';
/**
 * Import an app map (modules → flows → screens) into FlowTrace through its API, e.g. the Findost web app:
 *
 *   FLOWTRACE_URL=http://localhost:4000 FLOWTRACE_USER=admin FLOWTRACE_PASSWORD=… node scripts/import-app.cjs scripts/findost-web.json
 *
 * - The app (product) is created when it does not exist yet (needs a Super admin login); modules, flows and
 *   screens are matched by name, so running it again only adds what is missing.
 * - A screen that is already there gets its page, "opens when", kind and wireframe corrected to the map.
 * - --images <index.json> also uploads screenshots: the index maps "Module › Flow › Screen" to { file } (a JPG / PNG
 *   next to it, e.g. made by captures/capture-findost.cjs). Screens that already have an image keep it, unless
 *   --replace-images is given. Needs image storage (Cloudinary) on the FlowTrace server.
 * - --dry-run lists what would be created or corrected and changes nothing.
 *
 * Map file: { "app": "Findost Web", "device": "web", "modules": [ { "name", "flows": [ { "name", "screens": [
 *   { "name", "page", "kind": "screen" | "popup", "action", "wireframe": "form" | "list" | "dashboard" | "detail" } ] } ] } ] }
 */
const fs = require('fs');
const path = require('path');

const WIREFRAMES = ['form', 'list', 'dashboard', 'detail'];
const KINDS = ['screen', 'popup'];

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const imagesAt = args.indexOf('--images');
const imagesFile = imagesAt >= 0 ? args[imagesAt + 1] : '';
const replaceImages = args.includes('--replace-images');
const file = args.find((a, i) => !a.startsWith('--') && (imagesAt < 0 || i !== imagesAt + 1));
const base = (process.env.FLOWTRACE_URL || 'http://localhost:4000').replace(/\/+$/, '');
const { FLOWTRACE_USER: username, FLOWTRACE_PASSWORD: password } = process.env;

if (!file) {
  console.error('Usage: node scripts/import-app.cjs <map.json> [--dry-run]');
  process.exit(1);
}
if (!username || !password) {
  console.error('Set FLOWTRACE_USER and FLOWTRACE_PASSWORD (a Super admin login to create the app).');
  process.exit(1);
}

let cookie = '';
async function api(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json', cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${(data && data.error) || text.slice(0, 200)}`);
  return data;
}

// names compare without case and extra spaces
const same = (a, b) => String(a || '').trim().replace(/\s+/g, ' ').toLowerCase() === String(b || '').trim().replace(/\s+/g, ' ').toLowerCase();

function check(map) {
  const problems = [];
  if (!map || !map.app) problems.push('"app" (the app name) is missing');
  (map.modules || []).forEach((m) => {
    if (!m.name) problems.push('a module has no name');
    (m.flows || []).forEach((f) => {
      if (!f.name) problems.push(`a flow in ${m.name} has no name`);
      (f.screens || []).forEach((s) => {
        if (!s.name) problems.push(`a screen in ${m.name} › ${f.name} has no name`);
        if (s.wireframe && !WIREFRAMES.includes(s.wireframe)) problems.push(`${s.name}: wireframe must be one of ${WIREFRAMES.join(', ')}`);
        if (s.kind && !KINDS.includes(s.kind)) problems.push(`${s.name}: kind must be screen or popup`);
      });
    });
  });
  return problems;
}

async function main() {
  const map = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const problems = check(map);
  if (problems.length) throw new Error(`The map has problems:\n- ${problems.join('\n- ')}`);
  const device = map.device === 'app' ? 'app' : 'web';
  const count = { modules: 0, flows: 0, screens: 0, popups: 0, corrected: 0, images: 0 };
  const images = imagesFile ? JSON.parse(fs.readFileSync(path.resolve(imagesFile), 'utf8')) : {};
  const imageDir = imagesFile ? path.dirname(path.resolve(imagesFile)) : '';
  // a screen's screenshot as a data URL, when the index has one
  const shotOf = (key) => {
    const hit = images[key];
    if (!hit || !hit.file) return null;
    const type = /\.png$/i.test(hit.file) ? 'png' : 'jpeg';
    return `data:image/${type};base64,${fs.readFileSync(path.join(imageDir, hit.file)).toString('base64')}`;
  };
  async function upload(id, key, hasImage) {
    if (hasImage && !replaceImages) return;
    const shot = shotOf(key);
    if (!shot) return;
    console.log(`    ▣ image ${key}`); count.images += 1;
    if (!dry) await api('POST', `/api/screens/${id}/image`, { dataUrl: shot });
  }

  await api('POST', '/api/login', { username, password });
  const board = await api('GET', '/api/board');
  let product = board.find((p) => same(p.name, map.app));
  if (!product) {
    console.log(`+ app ${map.app}`);
    product = dry ? { id: null, modules: [] } : { ...(await api('POST', '/api/products', { name: map.app })), modules: [] };
  }

  for (const m of map.modules || []) {
    let mod = product.modules.find((x) => same(x.name, m.name));
    if (!mod) {
      console.log(`+ module ${m.name}`); count.modules += 1;
      mod = dry ? { id: null, flows: [] } : { ...(await api('POST', `/api/products/${product.id}/modules`, { name: m.name })), flows: [] };
    }
    for (const f of m.flows || []) {
      // only top-level flows: branch paths and extensions keep their own names
      let flow = mod.flows.find((x) => !x.parentFlowId && same(x.name, f.name));
      if (!flow) {
        console.log(`  + flow ${m.name} › ${f.name}`); count.flows += 1;
        flow = dry ? { id: null, screens: [] } : { ...(await api('POST', `/api/modules/${mod.id}/flows`, { name: f.name })), screens: [] };
      }
      for (const s of f.screens || []) {
        const want = { page: s.page || '', kind: s.kind === 'popup' ? 'popup' : 'screen', action: s.action || '', wireframe: s.wireframe || 'detail' };
        const had = flow.screens.find((x) => x.type !== 'condition' && same(x.name, s.name));
        if (!had) {
          console.log(`    + ${want.kind} ${s.name} [${want.wireframe}]`); count[want.kind === 'popup' ? 'popups' : 'screens'] += 1;
          if (dry) { await upload(null, `${m.name} › ${f.name} › ${s.name}`, false); continue; }
          const made = await api('POST', `/api/flows/${flow.id}/screens`, { name: s.name, page: want.page, kind: want.kind, action: want.action, device });
          await api('PATCH', `/api/screens/${made.id}`, { wireframe: want.wireframe });
          await upload(made.id, `${m.name} › ${f.name} › ${s.name}`, false);
          continue;
        }
        await upload(had.id, `${m.name} › ${f.name} › ${s.name}`, Boolean(had.image));
        // already there: correct what differs from the map
        const fix = {};
        if (s.page !== undefined && had.page !== want.page) fix.page = want.page;
        if (s.kind !== undefined && had.kind !== want.kind) fix.kind = want.kind;
        if (s.action !== undefined && had.action !== want.action) fix.action = want.action;
        if (s.wireframe !== undefined && had.wireframe !== want.wireframe) fix.wireframe = want.wireframe;
        if (!Object.keys(fix).length) continue;
        console.log(`    ~ ${s.name}: ${Object.entries(fix).map(([k, v]) => `${k} → ${v || '(empty)'}`).join(', ')}`); count.corrected += 1;
        if (!dry) await api('PATCH', `/api/screens/${had.id}`, fix);
      }
    }
  }
  console.log(`${dry ? 'Would add' : 'Added'} ${count.modules} modules, ${count.flows} flows, ${count.screens} screens, ${count.popups} popups; `
    + `${dry ? 'would correct' : 'corrected'} ${count.corrected} screens${imagesFile ? `; ${dry ? 'would upload' : 'uploaded'} ${count.images} images` : ''}.`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
