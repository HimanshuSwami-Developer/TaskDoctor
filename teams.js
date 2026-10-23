'use strict';
/**
 * Microsoft Teams messages through a Workflows webhook ("Post to a channel when a webhook request is received").
 * Each app (product) has its own webhook URL, set by a super admin in Sanity → Teams channel.
 * Messages are Adaptive Cards: a title, some lines / facts, buttons that deeplink back into FlowTrace,
 * and @mentions by Teams email (the login's "Teams email" in Admin).
 * The same card is also sent from the browser through Microsoft Graph (direct messages, channels the user is in).
 */

const valid = (url) => /^https:\/\/[^\s/]+\/\S+$/.test(url || '');

/**
 * card({ title, lines, facts, table, actions, mentions }) → the Adaptive Card
 *   lines:    ['plain text', …]                (markdown allowed by Teams)
 *   facts:    [['Version', '1.4.2'], …]
 *   table:    { columns: ['Task', …], rows: [[{ text, bg, fg, b }, …], …], more }   (cells with their sheet colours)
 *   actions:  [['Open in FlowTrace', url], …]
 *   mentions: [{ name, email }]                 shown as one "@A @B" line
 */
// Teams cards can't take any colour: a sheet colour ('#rrggbb') → the nearest of Teams' own (by hue)
function tone(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d < 0.12) return 'grey';
  const h = (max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  if (h < 18 || h >= 330) return 'red';
  if (h < 65) return 'amber';
  if (h < 170) return 'green';
  return 'blue';
}
const TEXT_COLOR = { red: 'Attention', amber: 'Warning', green: 'Good', blue: 'Accent' };

// A cell's text: { text, bg, fg, b } with the sheet's colour on the text (its font colour, else its fill)
const cellBlock = (c, header) => {
  const x = c && typeof c === 'object' ? c : { text: c };
  const color = header ? null : TEXT_COLOR[tone(x.fg)] || TEXT_COLOR[tone(x.bg)];
  return {
    type: 'TextBlock', text: x.text === undefined || x.text === null || x.text === '' ? '—' : String(x.text), wrap: true, size: 'Small',
    ...(header || x.b || color ? { weight: 'Bolder' } : {}), ...(color ? { color } : {}),
  };
};

// The rows as a table: short columns side by side (column names across the top, a line per row), and what doesn't
// fit across (long text, or more columns than the card is wide) as "name: value" lines under each row, full width.
// A Teams card can't scroll sideways, so nothing is squeezed letter by letter. Columns empty in every row are left out.
const cellText = (c) => String((c && typeof c === 'object' ? c.text : c) || '');
const CARD_PX = 760; // about what a Teams card has across (chat or channel, desktop)
const CHAR_PX = 6.5; // small text
const COL_PX = 14; // a column's padding and gap
const LONG = 24; // longer text than this is "long"
const LONG_MIN = 22; // a long-text column goes in the row only with at least this many characters across, else under it
function tables({ columns, rows }) {
  const keep = columns.map((_, k) => k).filter((k) => rows.some((cells) => cellText(cells[k]).trim()));
  const texts = (k) => [columns[k], ...rows.map((cells) => cellText(cells[k]))];
  // wide enough for the longest word (+1: the names are bold), and for short values whole
  const weight = (k) => 1 + Math.max(3, ...texts(k).flatMap((t) => t.split(/\s+/)).map((w) => w.length), Math.min(14, Math.max(...texts(k).map((t) => t.length))));
  const across = [];
  const below = [];
  let used = 0;
  const fits = (px) => used + px <= CARD_PX;
  // short columns first, in order; then long text across too while each still gets a readable width
  const long = (k) => rows.some((cells) => cellText(cells[k]).length > LONG);
  keep.forEach((k) => {
    const w = weight(k);
    if (!long(k) && fits(w * CHAR_PX + COL_PX)) { across.push(k); used += w * CHAR_PX + COL_PX; }
  });
  keep.filter(long).forEach((k) => {
    const w = Math.max(LONG_MIN, weight(k));
    if (fits(w * CHAR_PX + COL_PX)) { across.push(k); used += w * CHAR_PX + COL_PX; }
  });
  keep.forEach((k) => { if (!across.includes(k)) below.push(k); });
  across.sort((x, y) => x - y); // back in the sheet's order
  const widths = new Map(across.map((k) => [k, long(k) ? Math.max(LONG_MIN, weight(k)) : weight(k)]));
  // no per-cell styles (fills): a styled column gets its own padding, which squeezes it and puts the header out of line
  const line = (cells, header) => ({
    type: 'ColumnSet', spacing: 'None',
    columns: across.map((k) => ({ type: 'Column', width: widths.get(k), items: [cellBlock(cells[k], header)], verticalContentAlignment: 'Top' })),
  });
  const head = across.length ? [{ type: 'Container', spacing: 'Medium', items: [line(columns, true)] }] : [];
  return [...head, ...rows.map((cells) => ({
    type: 'Container', separator: true, spacing: across.length ? 'Small' : 'Medium',
    items: [
      ...(across.length ? [line(cells, false)] : []),
      ...(below.some((k) => cellText(cells[k]).trim()) ? [{
        type: 'FactSet', spacing: across.length ? 'Small' : 'None',
        facts: below.filter((k) => cellText(cells[k]).trim()).map((k) => ({ title: String(columns[k]), value: cellText(cells[k]) })),
      }] : []),
    ],
  }))];
}

// Teams refuses cards over ~28 KB: rows are left out from the end until it fits
const MAX_CARD = 24000;

function card({ title, lines = [], facts = [], table = null, actions = [], mentions = [] }) {
  const people = mentions.filter((m) => m && m.email);
  const body = [
    { type: 'TextBlock', text: title, weight: 'Bolder', size: 'Medium', wrap: true },
    ...lines.filter(Boolean).map((text) => ({ type: 'TextBlock', text, wrap: true, spacing: 'Small' })),
  ];
  if (facts.length) body.push({ type: 'FactSet', facts: facts.filter(([, v]) => v).map(([t, v]) => ({ title: t, value: String(v) })) });
  if (table && table.rows.length) {
    let shown = table.rows.length;
    let part = tables(table);
    while (shown > 1 && JSON.stringify(part).length > MAX_CARD) {
      shown = Math.max(1, Math.floor(shown * 0.75));
      part = tables({ ...table, rows: table.rows.slice(0, shown) });
    }
    const more = table.rows.length - shown + (table.more || 0);
    body.push(...part);
    if (more) body.push({ type: 'TextBlock', text: `… and ${more} more in FlowTrace`, wrap: true, isSubtle: true });
  }
  if (people.length) body.push({ type: 'TextBlock', text: people.map((m) => `<at>${m.name}</at>`).join(' '), wrap: true });
  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    body,
    actions: actions.filter(([, url]) => url).map(([t, url]) => ({ type: 'Action.OpenUrl', title: t, url })),
    msteams: {
      width: 'Full',
      entities: people.map((m) => ({ type: 'mention', text: `<at>${m.name}</at>`, mentioned: { id: m.email, name: m.name } })),
    },
  };
}

/** post(webhook, message): the card to a webhook. Resolves to 'sent'; rejects with a readable message. */
async function post(webhook, message) {
  if (!valid(webhook)) throw new Error('Teams webhook is not set');
  let res;
  try {
    res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'message', attachments: [{ contentType: 'application/vnd.microsoft.card.adaptive', contentUrl: null, content: card(message) }] }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new Error(`Teams could not be reached (${err.name === 'TimeoutError' ? 'timed out' : err.message})`);
  }
  if (!res.ok) throw new Error(`Teams refused the message (HTTP ${res.status})`);
  return 'sent';
}

// Microsoft Graph sign-in for the browser (an Entra app registration, single-page application platform):
// MS_CLIENT_ID and MS_TENANT_ID in .env. Both are public ids, not secrets.
const graph = () => (process.env.MS_CLIENT_ID ? { clientId: process.env.MS_CLIENT_ID, tenantId: process.env.MS_TENANT_ID || 'organizations' } : null);

// ---------------------------------------------------------------- the same message as a plain Teams message (HTML)
// Sent from your own Teams (Microsoft Graph), a message can hold an HTML table, like one pasted from Excel: Teams
// sizes its columns to their content, so nothing is squeezed. (The app's channel webhook takes cards only.)

const esc = (v) => String(v).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
// a sheet colour → one that reads on both Teams themes, by hue
const HTML_COLOR = { red: '#e5484d', amber: '#d97706', green: '#16a34a', blue: '#3b82f6' };
const MAX_HTML = 24000; // Teams refuses messages over ~28 KB

function htmlTable({ columns, rows }) {
  const keep = columns.map((_, k) => k).filter((k) => rows.some((cells) => cellText(cells[k]).trim()));
  const td = (c) => {
    const x = c && typeof c === 'object' ? c : { text: c };
    const color = HTML_COLOR[tone(x.fg)] || HTML_COLOR[tone(x.bg)];
    const text = cellText(x).trim() ? esc(cellText(x)) : '';
    return `<td>${color ? `<span style="color:${color}"><b>${text}</b></span>` : x.b ? `<b>${text}</b>` : text}</td>`;
  };
  return `<table><thead><tr>${keep.map((k) => `<th><b>${esc(columns[k])}</b></th>`).join('')}</tr></thead>`
    + `<tbody>${rows.map((cells) => `<tr>${keep.map((k) => td(cells[k])).join('')}</tr>`).join('')}</tbody></table>`;
}

/**
 * html({ title, lines, table, actions, mentions }) → { html, mentions: [{ name, email }] }
 * The @mentions are written <at id="0">Name</at>, … in order; the browser fills in who they are.
 */
function html({ title, lines = [], table = null, actions = [], mentions = [] }) {
  const people = mentions.filter((m) => m && m.email);
  const build = (shown) => {
    const more = table ? table.rows.length - shown + (table.more || 0) : 0;
    return [
      `<p><b>${esc(title)}</b></p>`,
      ...lines.filter(Boolean).map((t) => `<p>${esc(t)}</p>`),
      table && shown ? htmlTable({ ...table, rows: table.rows.slice(0, shown) }) : '',
      more ? `<p><i>… and ${more} more in FlowTrace</i></p>` : '',
      people.length ? `<p>${people.map((m, i) => `<at id="${i}">${esc(m.name)}</at>`).join(' ')}</p>` : '',
      ...actions.filter(([, url]) => url).map(([t, url]) => `<p><a href="${esc(url)}">${esc(t)}</a></p>`),
    ].join('');
  };
  let shown = table ? table.rows.length : 0;
  let out = build(shown);
  while (shown > 1 && out.length > MAX_HTML) {
    shown = Math.max(1, Math.floor(shown * 0.75));
    out = build(shown);
  }
  return { html: out, mentions: people.map(({ name, email }) => ({ name, email })) };
}

module.exports = { card, html, post, valid, graph };
