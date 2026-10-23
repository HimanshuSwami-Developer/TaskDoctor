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
const CELL_STYLE = { red: 'attention', amber: 'warning', green: 'good', blue: 'accent', grey: 'emphasis' };
const TEXT_COLOR = { red: 'Attention', amber: 'Warning', green: 'Good', blue: 'Accent' };

const tableCell = (c, header) => {
  const x = c && typeof c === 'object' ? c : { text: c };
  const bg = CELL_STYLE[tone(x.bg)];
  const fg = TEXT_COLOR[tone(x.fg)];
  return {
    type: 'TableCell',
    ...(header ? { style: 'emphasis' } : bg ? { style: bg } : {}),
    items: [{ type: 'TextBlock', text: x.text === undefined || x.text === null || x.text === '' ? '—' : String(x.text), wrap: true,
      ...(header || x.b ? { weight: 'Bolder' } : {}), ...(!header && !bg && fg ? { color: fg } : {}) }],
  };
};

// A few columns: one table, a row per row. Many columns: each row as its own two-column table (field | value),
// which stays readable in a chat instead of squeezing a dozen columns side by side.
const WIDE = 4;
function tables({ columns, rows }) {
  const grid = (list, widths, firstRowAsHeaders) => ({
    type: 'Table', gridStyle: 'default', showGridLines: true, firstRowAsHeaders, spacing: 'Medium',
    columns: widths.map((width) => ({ width })),
    rows: list.map((cells, k) => ({ type: 'TableRow', cells: cells.map((c) => tableCell(c, firstRowAsHeaders && !k)) })),
  });
  if (columns.length <= WIDE) return [grid([columns, ...rows], columns.map(() => 1), true)];
  return rows.flatMap((cells, i) => [
    ...(rows.length > 1 ? [{ type: 'TextBlock', text: `Row ${i + 1}`, weight: 'Bolder', spacing: 'Large' }] : []),
    { ...grid(columns.map((name, k) => [{ text: name, b: true }, cells[k]]), [1, 3], false), spacing: rows.length > 1 ? 'Small' : 'Medium' },
  ]);
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
    version: table ? '1.5' : '1.4', // tables need 1.5
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

module.exports = { card, post, valid, graph };
