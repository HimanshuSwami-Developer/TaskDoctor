'use strict';
/**
 * Excel import: an .xlsx read in detail, one sheet per visible worksheet with data.
 *
 * - header row: the first row (of the first 30) that is at least half as full as the fullest one, so title rows
 *   above it are skipped; a merged group header over a row of sub headers gives "Group › Sub" names
 * - columns without a single value are left out (also when they have a header), and so are empty rows
 * - merged cells: a value merged down fills every row it covers; one merged across stays in its first column
 * - each column gets a type from its values: a dropdown list in Excel (data validation) → dropdown with its options,
 *   Yes / No → checkbox, numbers (percentages as 0–100), dates, logins of the app → person, a few repeated values
 *   (or a Status / Priority … column) → dropdown, else text; formulas give their result, links their text
 * - colours are what Excel shows: the cell's fill and font colour (fixed, theme colours of this workbook with their
 *   tint, or the old indexed palette), then conditional formatting on top (cell value, text contains, formulas,
 *   blanks, duplicates, colour scales), like Excel does
 * - a dropdown keeps the fill / text colour each value has; other cells keep their own fill, text colour and bold
 */
const ExcelJS = require('exceljs');
const DataValidationsXform = require('exceljs/lib/xlsx/xform/sheet/data-validations-xform');

// ExcelJS spreads a data validation over every cell it covers, so a whole-column dropdown (B2:B1048576) would make
// a million entries. Keep each range as written instead; listValidations() reads them as ranges.
const closeValidation = DataValidationsXform.prototype.parseClose;
DataValidationsXform.prototype.parseClose = function parseClose(name) {
  if (name !== 'dataValidation') return closeValidation.call(this, name);
  const dv = this._dataValidation;
  if (!dv.formulae || !dv.formulae.length) {
    delete dv.formulae;
    delete dv.operator;
  }
  String(this._address || '').split(/\s+/).filter(Boolean).forEach((addr) => { this.model[addr] = dv; });
  return true;
};

const MAX_SHEETS = 10;
const MAX_COLUMNS = 100;
const MAX_ROWS = 5000;
const MAX_OPTIONS = 30; // what a dropdown column can hold
const TAG_HEX = { slate: '#64748b', amber: '#d97706', sky: '#0284c7', indigo: '#4f46e5', violet: '#7c3aed', pink: '#db2777', red: '#dc2626', teal: '#0d9488', green: '#16a34a' };

// ---------------------------------------------------------------- colours

// Office's default theme, for workbooks without one: lt1, dk1, lt2, dk2, accent1–6, hlink, folHlink (Excel's theme order)
const OFFICE_THEME = ['ffffff', '000000', 'e7e6e6', '44546a', '4472c4', 'ed7d31', 'a5a5a5', 'ffc000', '5b9bd5', '70ad47', '0563c1', '954f72'];
const THEME_SLOTS = ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
// the old 64-colour palette ({ indexed }); 64 / 65 are "automatic" (no colour)
const INDEXED = [
  '000000', 'ffffff', 'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
  '000000', 'ffffff', 'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
  '800000', '008000', '000080', '808000', '800080', '008080', 'c0c0c0', '808080',
  '9999ff', '993366', 'ffffcc', 'ccffff', '660066', 'ff8080', '0066cc', 'ccccff',
  '000080', 'ff00ff', 'ffff00', '00ffff', '800080', '800000', '008080', '0000ff',
  '00ccff', 'ccffff', 'ccffcc', 'ffff99', '99ccff', 'ff99cc', 'cc99ff', 'ffcc99',
  '3366ff', '33cccc', '99cc00', 'ffcc00', 'ff9900', 'ff6600', '666699', '969696',
  '003366', '339966', '003300', '333300', '993300', '993366', '333399', '333333',
];

// The workbook's own theme colours (theme1.xml), in Excel's order
function themeOf(book) {
  const xml = String((book._themes || {}).theme1 || '');
  const scheme = (/<a:clrScheme[\s\S]*?<\/a:clrScheme>/.exec(xml) || [''])[0];
  return THEME_SLOTS.map((slot, i) => {
    const m = new RegExp(`<a:${slot}>\\s*<a:(?:srgbClr\\s+val|sysClr[^>]*?lastClr)="([0-9a-fA-F]{6})"`).exec(scheme);
    return m ? m[1].toLowerCase() : OFFICE_THEME[i];
  });
}

const hexToRgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

// Excel's tint: lighter (> 0) or darker (< 0) in HLS space, as Excel draws it
function tinted(hex, tint) {
  if (!tint) return hex;
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  l = tint < 0 ? l * (1 + tint) : l * (1 - tint) + tint;
  if (!s) return rgbToHex([l * 255, l * 255, l * 255]);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return rgbToHex([hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255]);
}

// 'rrggbb' of an Excel colour ({ argb } | { theme, tint } | { indexed }); null for none / automatic
function colour(c, theme) {
  if (!c || typeof c !== 'object') return null;
  let hex = null;
  if (typeof c.argb === 'string') hex = c.argb.slice(-6);
  else if (c.theme !== undefined) hex = theme[c.theme];
  else if (c.indexed !== undefined) hex = INDEXED[c.indexed];
  if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return null;
  return tinted(hex.toLowerCase(), c.tint);
}

// A fill's colour. In conditional formats (dxf) a solid fill keeps its colour in bgColor; in cells, in fgColor.
function fillColour(fill, theme, dxf) {
  if (!fill) return null;
  if (fill.type === 'gradient') return colour(((fill.stops || [])[0] || {}).color, theme);
  if (fill.type !== 'pattern' || !fill.pattern || fill.pattern === 'none') return null;
  return dxf ? colour(fill.bgColor, theme) || colour(fill.fgColor, theme) : colour(fill.fgColor, theme) || colour(fill.bgColor, theme);
}

const isWhite = (hex) => Math.min(...hexToRgb(hex)) > 245;
const isBlack = (hex) => Math.max(...hexToRgb(hex)) < 20;
// white fills and black text are Excel's defaults: no colour of their own
const bgOf = (hex) => (hex && !isWhite(hex) ? `#${hex}` : null);
const fgOf = (hex) => (hex && !isBlack(hex) ? `#${hex}` : null);

// ---------------------------------------------------------------- addresses and values

const colNumber = (letters) => [...letters.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
// 'A1' / '$B$2' / 'C:C' / '4:4' / 'A1:D9' → { top, left, bottom, right }; null when unreadable
function parseRange(ref) {
  const clean = String(ref).replace(/^.*!/, '').replace(/\$/g, '').toUpperCase();
  const [a, b = a] = clean.split(':');
  const point = (p, end) => {
    let m = /^([A-Z]{1,3})(\d+)$/.exec(p);
    if (m) return { r: +m[2], c: colNumber(m[1]) };
    m = /^([A-Z]{1,3})$/.exec(p);
    if (m) return { r: end ? 1048576 : 1, c: colNumber(m[1]) };
    m = /^(\d+)$/.exec(p);
    if (m) return { r: +m[1], c: end ? 16384 : 1 };
    return null;
  };
  const x = point(a, false);
  const y = point(b, true);
  if (!x || !y) return null;
  return { top: Math.min(x.r, y.r), left: Math.min(x.c, y.c), bottom: Math.max(x.r, y.r), right: Math.max(x.c, y.c) };
}
const inRange = (g, r, c) => r >= g.top && r <= g.bottom && c >= g.left && c <= g.right;

// A cell's value: string, number, boolean or Date ('' when empty). Formulas give their result, links their text.
function cellPlain(cell) {
  let v = cell.value;
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    if (v.error) return '';
    if ('result' in v || 'formula' in v || 'sharedFormula' in v) v = v.result;
    else if (v.richText) v = v.richText.map((t) => t.text).join('');
    else if (v.text !== undefined) v = typeof v.text === 'object' && v.text ? (v.text.richText || []).map((t) => t.text).join('') : v.text;
    else if (v.hyperlink) v = v.hyperlink;
    if (v && typeof v === 'object' && !(v instanceof Date)) return '';
  }
  if (v === null || v === undefined) return '';
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return '';
    // a time on its own (Excel day 0): "09:30"
    if (v.getUTCFullYear() < 1901) return v.toISOString().slice(11, 16);
    return v;
  }
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  return String(v).replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

// ---------------------------------------------------------------- conditional formatting
//
// Formulas of conditional formats are worked out with a small evaluator: references (relative to the top-left
// cell of the format's range), text / numbers / TRUE / FALSE, = <> < > <= >= & + - * / ^ %, and the functions
// people use in them (AND, OR, NOT, IF, SEARCH, FIND, LEFT, RIGHT, MID, LEN, ISBLANK, ISNUMBER, COUNTIF, TODAY …).
// Anything it cannot read counts as "no match".

class XlError { constructor(code) { this.code = code; } }
const ERR = new XlError('#VALUE!');
const isErr = (v) => v instanceof XlError;
const DAY = 86400000;
const EPOCH = Date.UTC(1899, 11, 30);
const serial = (d) => (d.getTime() - EPOCH) / DAY;
const today = () => { const n = new Date(); return Math.floor((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - EPOCH) / DAY); };

// value as Excel compares it: dates are numbers, empty is ''
const xlValue = (v) => (v instanceof Date ? serial(v) : v);
const toNum = (v) => {
  if (isErr(v)) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : ERR;
};
const toStr = (v) => (isErr(v) ? v : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v === null || v === undefined ? '' : String(v));
const toBool = (v) => (isErr(v) ? v : typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : /^true$/i.test(String(v)) ? true : /^false$/i.test(String(v)) ? false : v === '' ? false : ERR);

// Excel's comparison: numbers before text before booleans, text without case; an empty cell is 0 / '' / FALSE
function compare(a, b) {
  const kind = (v) => (typeof v === 'number' ? 0 : typeof v === 'boolean' ? 2 : 1);
  let x = a;
  let y = b;
  if (x === '' && typeof y === 'number') x = 0;
  if (y === '' && typeof x === 'number') y = 0;
  if (x === '' && typeof y === 'boolean') x = false;
  if (y === '' && typeof x === 'boolean') y = false;
  if (kind(x) !== kind(y)) return kind(x) - kind(y);
  if (typeof x === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
  return x < y ? -1 : x > y ? 1 : 0;
}

function tokenize(src) {
  const out = [];
  const re = /\s*(?:("(?:[^"]|"")*")|((?:'[^']+'|[A-Za-z_][\w.]*)!)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![\w(])|(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([A-Za-z_][\w.]*)|(<>|<=|>=|[-+*/^&=<>(),;%]))/y;
  let m;
  let at = 0;
  while (at < src.length) {
    re.lastIndex = at;
    m = re.exec(src);
    if (!m || m.index !== at || m[0] === '') {
      if (/^\s*$/.test(src.slice(at))) break;
      return null;
    }
    at = re.lastIndex;
    if (m[1] !== undefined) out.push({ t: 'str', v: m[1].slice(1, -1).replace(/""/g, '"') });
    else if (m[3] !== undefined) out.push({ t: 'ref', v: m[3], sheet: m[2] ? m[2].slice(0, -1).replace(/^'|'$/g, '') : null });
    else if (m[4] !== undefined) out.push({ t: 'num', v: Number(m[4]) });
    else if (m[5] !== undefined) out.push({ t: 'name', v: m[5].toUpperCase().replace(/^_XLFN\./, '') });
    else out.push({ t: 'op', v: m[6] === ';' ? ',' : m[6] });
  }
  return out;
}

const FUNCTIONS = {
  AND: (args) => { let r = true; for (const a of args.flat()) { const b = toBool(a); if (isErr(b)) return b; r = r && b; } return r; },
  OR: (args) => { let r = false; for (const a of args.flat()) { const b = toBool(a); if (isErr(b)) return b; r = r || b; } return r; },
  NOT: ([a]) => { const b = toBool(a); return isErr(b) ? b : !b; },
  IF: ([c, a = true, b = false]) => { const x = toBool(c); return isErr(x) ? x : x ? a : b; },
  IFERROR: ([a, b]) => (isErr(a) ? b : a),
  ISERROR: ([a]) => isErr(a),
  ISERR: ([a]) => isErr(a),
  ISNUMBER: ([a]) => typeof a === 'number',
  ISTEXT: ([a]) => typeof a === 'string' && a !== '',
  ISBLANK: ([a]) => a === '',
  ISNA: () => false,
  SEARCH: ([find, within, start = 1]) => {
    const i = toStr(within).toLowerCase().indexOf(toStr(find).toLowerCase(), toNum(start) - 1);
    return i < 0 ? ERR : i + 1;
  },
  FIND: ([find, within, start = 1]) => { const i = toStr(within).indexOf(toStr(find), toNum(start) - 1); return i < 0 ? ERR : i + 1; },
  LEFT: ([s, n = 1]) => toStr(s).slice(0, toNum(n)),
  RIGHT: ([s, n = 1]) => { const x = toStr(s); const k = toNum(n); return k ? x.slice(-k) : ''; },
  MID: ([s, a, n]) => toStr(s).substr(toNum(a) - 1, toNum(n)),
  LEN: ([s]) => toStr(s).length,
  LOWER: ([s]) => toStr(s).toLowerCase(),
  UPPER: ([s]) => toStr(s).toUpperCase(),
  TRIM: ([s]) => toStr(s).trim().replace(/\s+/g, ' '),
  EXACT: ([a, b]) => toStr(a) === toStr(b),
  VALUE: ([a]) => toNum(a),
  ABS: ([a]) => Math.abs(toNum(a)),
  INT: ([a]) => Math.floor(toNum(a)),
  MOD: ([a, b]) => { const x = toNum(a); const y = toNum(b); return y ? x - y * Math.floor(x / y) : ERR; },
  ROUND: ([a, n = 0]) => Math.round(toNum(a) * 10 ** toNum(n)) / 10 ** toNum(n),
  ROUNDDOWN: ([a, n = 0]) => Math.trunc(toNum(a) * 10 ** toNum(n)) / 10 ** toNum(n),
  ROUNDUP: ([a, n = 0]) => { const k = 10 ** toNum(n); const x = toNum(a) * k; return (x < 0 ? Math.floor(x) : Math.ceil(x)) / k; },
  FLOOR: ([a, s = 1]) => Math.floor(toNum(a) / toNum(s)) * toNum(s),
  CEILING: ([a, s = 1]) => Math.ceil(toNum(a) / toNum(s)) * toNum(s),
  EDATE: ([a, m]) => { const d = new Date(EPOCH + toNum(a) * DAY); d.setUTCMonth(d.getUTCMonth() + toNum(m)); return (d.getTime() - EPOCH) / DAY; },
  TODAY: () => today(),
  NOW: () => (Date.now() - EPOCH) / DAY,
  DATE: ([y, m, d]) => (Date.UTC(toNum(y), toNum(m) - 1, toNum(d)) - EPOCH) / DAY,
  YEAR: ([a]) => new Date(EPOCH + toNum(a) * DAY).getUTCFullYear(),
  MONTH: ([a]) => new Date(EPOCH + toNum(a) * DAY).getUTCMonth() + 1,
  DAY: ([a]) => new Date(EPOCH + toNum(a) * DAY).getUTCDate(),
  WEEKDAY: ([a]) => new Date(EPOCH + toNum(a) * DAY).getUTCDay() + 1,
  ROW: (args, ctx) => ctx.r,
  COLUMN: (args, ctx) => ctx.c,
  TRUE: () => true,
  FALSE: () => false,
  COUNTIF: ([range, crit]) => {
    const list = Array.isArray(range) ? range : [range];
    const m = /^(<>|<=|>=|=|<|>)?(.*)$/s.exec(typeof crit === 'string' ? crit : '');
    const op = typeof crit === 'string' && m[1] ? m[1] : '=';
    const want = typeof crit === 'string' ? (m[2] !== '' && Number.isFinite(Number(m[2])) ? Number(m[2]) : m[2]) : crit;
    const like = typeof want === 'string' && /[*?]/.test(want) ? new RegExp(`^${want.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i') : null;
    return list.filter((v) => {
      if (like) return op === '=' ? like.test(toStr(v)) : !like.test(toStr(v));
      const d = compare(v, want);
      return { '=': d === 0, '<>': d !== 0, '<': d < 0, '>': d > 0, '<=': d <= 0, '>=': d >= 0 }[op];
    }).length;
  },
};
FUNCTIONS.COUNTA = ([range]) => (Array.isArray(range) ? range : [range]).filter((v) => v !== '').length;
FUNCTIONS.SUM = (args) => args.flat().reduce((t, v) => t + (typeof v === 'number' ? v : 0), 0);

// Evaluate one formula for a cell. ctx: { r, c, top, left, value(r, c) }
function evaluate(formula, ctx) {
  const tokens = tokenize(String(formula).replace(/^=/, ''));
  if (!tokens) return ERR;
  let i = 0;
  const peek = () => tokens[i];
  const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
  const cellAt = (ref) => {
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/i.exec(ref);
    const c = colNumber(m[2]);
    const r = +m[4];
    return { r: m[3] ? r : r + ctx.r - ctx.top, c: m[1] ? c : c + ctx.c - ctx.left };
  };
  function primary() {
    const t = tokens[i++];
    if (!t) return ERR;
    if (t.t === 'str' || t.t === 'num') return t.v;
    if (t.t === 'ref') {
      if (t.sheet) return ERR; // other worksheets are not followed
      const [a, b] = t.v.split(':');
      const x = cellAt(a);
      if (!b) return ctx.value(x.r, x.c);
      const y = cellAt(b);
      const list = [];
      for (let r = Math.min(x.r, y.r); r <= Math.min(Math.max(x.r, y.r), ctx.lastRow); r += 1) {
        for (let c = Math.min(x.c, y.c); c <= Math.max(x.c, y.c); c += 1) list.push(ctx.value(r, c));
      }
      return list;
    }
    if (t.t === 'name') {
      if (isOp('(')) {
        i += 1;
        const args = [];
        if (!isOp(')')) {
          do { if (args.length) i += 1; args.push(isOp(',') || isOp(')') ? '' : comparison()); } while (isOp(','));
        }
        if (!isOp(')')) return ERR;
        i += 1;
        const fn = FUNCTIONS[t.v];
        return fn ? fn(args, ctx) : ERR;
      }
      if (t.v === 'TRUE') return true;
      if (t.v === 'FALSE') return false;
      return ERR; // named ranges are not followed
    }
    if (t.v === '(') {
      const v = comparison();
      if (!isOp(')')) return ERR;
      i += 1;
      return v;
    }
    if (t.v === '-') { const v = toNum(primary()); return isErr(v) ? v : -v; }
    if (t.v === '+') return primary();
    return ERR;
  }
  function postfix() {
    let v = primary();
    while (isOp('%')) { i += 1; v = toNum(v); if (!isErr(v)) v /= 100; }
    return v;
  }
  function power() {
    let v = postfix();
    while (isOp('^')) { i += 1; const b = toNum(postfix()); const a = toNum(v); v = isErr(a) ? a : isErr(b) ? b : a ** b; }
    return v;
  }
  function product() {
    let v = power();
    while (isOp('*') || isOp('/')) {
      const op = tokens[i++].v;
      const a = toNum(v);
      const b = toNum(power());
      v = isErr(a) ? a : isErr(b) ? b : op === '*' ? a * b : b === 0 ? ERR : a / b;
    }
    return v;
  }
  function sum() {
    let v = product();
    while (isOp('+') || isOp('-')) {
      const op = tokens[i++].v;
      const a = toNum(v);
      const b = toNum(product());
      v = isErr(a) ? a : isErr(b) ? b : op === '+' ? a + b : a - b;
    }
    return v;
  }
  function concat() {
    let v = sum();
    while (isOp('&')) { i += 1; const b = toStr(sum()); const a = toStr(v); v = isErr(a) ? a : isErr(b) ? b : a + b; }
    return v;
  }
  function comparison() {
    let v = concat();
    while (peek() && peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) {
      const op = tokens[i++].v;
      const b = concat();
      if (isErr(v)) return v;
      if (isErr(b)) return b;
      const d = compare(Array.isArray(v) ? v[0] : v, Array.isArray(b) ? b[0] : b);
      v = { '=': d === 0, '<>': d !== 0, '<': d < 0, '>': d > 0, '<=': d <= 0, '>=': d >= 0 }[op];
    }
    return v;
  }
  try {
    const v = comparison();
    return i === tokens.length ? v : ERR;
  } catch (err) {
    return ERR;
  }
}

const CELL_IS = {
  equal: (v, a) => compare(v, a) === 0,
  notEqual: (v, a) => compare(v, a) !== 0,
  greaterThan: (v, a) => compare(v, a) > 0,
  lessThan: (v, a) => compare(v, a) < 0,
  greaterThanOrEqual: (v, a) => compare(v, a) >= 0,
  lessThanOrEqual: (v, a) => compare(v, a) <= 0,
  between: (v, a, b) => (compare(a, b) <= 0 ? compare(v, a) >= 0 && compare(v, b) <= 0 : compare(v, b) >= 0 && compare(v, a) <= 0),
  notBetween: (v, a, b) => !CELL_IS.between(v, a, b),
};

// The conditional formats of a worksheet, ready to apply: look(r, c) → { bg, fg, b } (only what a rule sets)
function conditionalFormats(ws, theme, value, lastRow) {
  const rules = [];
  (ws.conditionalFormattings || []).forEach((cf) => {
    const ranges = String(cf.ref || '').split(/\s+/).map(parseRange).filter(Boolean);
    if (!ranges.length) return;
    (cf.rules || []).forEach((rule) => rules.push({ rule, ranges, top: ranges[0].top, left: ranges[0].left }));
  });
  if (!rules.length) return () => ({});
  rules.sort((a, b) => (a.rule.priority || 0) - (b.rule.priority || 0));

  // values of a rule's cells, worked out once (duplicates, top 10, averages, colour scales)
  const cache = new Map();
  const tallies = new Map();
  const keyOf = (v) => (typeof v === 'string' ? `s${v.toLowerCase()}` : `${typeof v}${v}`);
  const tally = (x) => {
    if (!tallies.has(x)) {
      const counts = new Map();
      cellsOf(x).forEach((v) => counts.set(keyOf(v), (counts.get(keyOf(v)) || 0) + 1));
      tallies.set(x, counts);
    }
    return tallies.get(x);
  };
  const sortedCache = new Map();
  const sorted = (x) => {
    if (!sortedCache.has(x)) sortedCache.set(x, cellsOf(x).filter((n) => typeof n === 'number').sort((a, b) => a - b));
    return sortedCache.get(x);
  };
  const numbers = (x) => sorted(x).slice();
  const cellsOf = (x) => {
    if (!cache.has(x)) {
      const list = [];
      x.ranges.forEach((g) => {
        for (let r = g.top; r <= Math.min(g.bottom, lastRow); r += 1) {
          for (let c = g.left; c <= Math.min(g.right, MAX_COLUMNS); c += 1) list.push(xlValue(value(r, c)));
        }
      });
      cache.set(x, list);
    }
    return cache.get(x);
  };

  function scaleColour(x, v) {
    const { cfvo = [], color = [] } = x.rule;
    if (typeof v !== 'number' || cfvo.length < 2 || color.length < cfvo.length) return null;
    const nums = sorted(x);
    if (!nums.length) return null;
    const min = nums[0];
    const max = nums[nums.length - 1];
    const at = (p) => nums[Math.min(nums.length - 1, Math.max(0, Math.round((p / 100) * (nums.length - 1))))];
    const stops = cfvo.map((o, k) => {
      const n = Number(o.value);
      const pos = o.type === 'min' ? min : o.type === 'max' ? max : o.type === 'percent' ? min + ((max - min) * n) / 100
        : o.type === 'percentile' ? at(n) : Number.isFinite(n) ? n : k ? max : min;
      return { pos, hex: colour(color[k], theme) };
    });
    if (stops.some((s) => !s.hex)) return null;
    if (v <= stops[0].pos) return stops[0].hex;
    for (let k = 1; k < stops.length; k += 1) {
      if (v <= stops[k].pos) {
        const span = stops[k].pos - stops[k - 1].pos || 1;
        const f = (v - stops[k - 1].pos) / span;
        const a = hexToRgb(stops[k - 1].hex);
        const b = hexToRgb(stops[k].hex);
        return rgbToHex(a.map((n, j) => n + (b[j] - n) * f));
      }
    }
    return stops[stops.length - 1].hex;
  }

  function matches(x, r, c) {
    const { rule } = x;
    const ctx = { r, c, top: x.top, left: x.left, value: (rr, cc) => xlValue(value(rr, cc)), lastRow };
    const v = ctx.value(r, c);
    const f = rule.formulae || [];
    switch (rule.type) {
      case 'cellIs': {
        const test = CELL_IS[rule.operator];
        if (!test || !f.length) return false;
        const [a, b] = f.map((y) => evaluate(y, ctx));
        if (isErr(a) || isErr(b)) return false;
        return test(v, a, b);
      }
      case 'duplicateValues':
      case 'uniqueValues': {
        if (v === '') return false;
        const n = tally(x).get(keyOf(v)) || 0;
        return rule.type === 'duplicateValues' ? n > 1 : n === 1;
      }
      case 'top10': {
        if (typeof v !== 'number') return false;
        const nums = numbers(x).sort((a, b) => (rule.bottom ? a - b : b - a));
        const rank = Number(rule.rank) || 10;
        const n = rule.percent ? Math.max(1, Math.floor((nums.length * rank) / 100)) : rank;
        const edge = nums[Math.min(n, nums.length) - 1];
        return rule.bottom ? v <= edge : v >= edge;
      }
      case 'aboveAverage': {
        if (typeof v !== 'number') return false;
        const nums = numbers(x);
        const avg = nums.reduce((t, n) => t + n, 0) / (nums.length || 1);
        const above = rule.aboveAverage !== false;
        return rule.equalAverage ? (above ? v >= avg : v <= avg) : (above ? v > avg : v < avg);
      }
      case 'containsText': {
        if (f.length) return toBool(evaluate(f[0], ctx)) === true;
        const s = toStr(v).toLowerCase();
        const want = String(rule.text || '').toLowerCase();
        return { containsText: s.includes(want), notContains: !s.includes(want), beginsWith: s.startsWith(want), endsWith: s.endsWith(want) }[rule.operator] || false;
      }
      case 'containsBlanks': return toStr(v).trim() === '';
      case 'notContainsBlanks': return toStr(v).trim() !== '';
      case 'expression':
      case 'timePeriod':
      case 'containsErrors':
      case 'notContainsErrors':
        return f.length ? toBool(evaluate(f[0], ctx)) === true : false;
      default: return false;
    }
  }

  return (r, c) => {
    const out = {};
    for (const x of rules) {
      if (!x.ranges.some((g) => inRange(g, r, c))) continue;
      if (x.rule.type === 'colorScale') {
        if (!out.bg) { const hex = scaleColour(x, xlValue(value(r, c))); if (hex) out.bg = hex; }
        continue;
      }
      if (x.rule.type === 'dataBar' || x.rule.type === 'iconSet') continue;
      if (!matches(x, r, c)) continue;
      const style = x.rule.style || {};
      const bg = fillColour(style.fill, theme, true);
      const fg = colour(style.font && style.font.color, theme);
      if (bg && !out.bg) out.bg = bg;
      if (fg && !out.fg) out.fg = fg;
      if (style.font && style.font.bold && out.b === undefined) out.b = true;
      if (x.rule.stopIfTrue) break;
    }
    return out;
  };
}

// ---------------------------------------------------------------- dropdown lists (data validation)

// [{ range, options }] of a worksheet's "list" validations, options read from the list, a range or a name
function listValidations(ws, book) {
  const model = (ws.dataValidations && ws.dataValidations.model) || {};
  const out = [];
  Object.entries(model).forEach(([addr, dv]) => {
    if (!dv || dv.type !== 'list' || !dv.formulae || !dv.formulae[0]) return;
    const range = parseRange(addr.replace(/^range:/, ''));
    if (!range) return;
    const f = String(dv.formulae[0]).trim();
    let options = [];
    if (/^".*"$/s.test(f)) options = f.slice(1, -1).split(',');
    else {
      let ref = f.replace(/^=/, '');
      if (/^[A-Za-z_][\w.]*$/.test(ref) && !parseRange(ref)) {
        try { ref = (book.definedNames.getRanges(ref).ranges || [])[0] || ''; } catch (err) { ref = ''; }
      }
      const m = /^(?:'?([^'!]+)'?!)?(\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?)$/i.exec(ref);
      const sheet = m && (m[1] ? book.getWorksheet(m[1]) : ws);
      const g = m && parseRange(m[2]);
      if (sheet && g) {
        for (let r = g.top; r <= Math.min(g.bottom, g.top + 200); r += 1) {
          for (let c = g.left; c <= Math.min(g.right, g.left + 20); c += 1) {
            const v = cellPlain(sheet.getCell(r, c));
            options.push(v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
          }
        }
      }
    }
    options = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
    if (options.length) out.push({ range, options });
  });
  return out;
}

// ---------------------------------------------------------------- column types

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const iso = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt.toISOString().slice(0, 10) : null;
};
// 'YYYY-MM-DD' of a date value or a date written as text (2026-10-23, 23/10/2026, 23-10-26, 23 Oct 2026, Oct 23, 2026); else null
function asDate(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v !== 'string') return null;
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/.exec(v);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(?: .*)?$/.exec(v); // day first (India)
  if (m) return iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  m = /^(\d{1,2})(?:st|nd|rd|th)?[ -]([a-z]{3})[a-z]*[ -,]*(\d{4})$/i.exec(v);
  if (m && MONTHS.includes(m[2].toLowerCase())) return iso(+m[3], MONTHS.indexOf(m[2].toLowerCase()) + 1, +m[1]);
  m = /^([a-z]{3})[a-z]* (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/i.exec(v);
  if (m && MONTHS.includes(m[1].toLowerCase())) return iso(+m[3], MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2]);
  return null;
}
const YES = /^(yes|y|true|✓|✔|☑|✅)$/i;
const NO = /^(no|n|false|✗|✘|☐|❌)$/i;
// numbers, not codes: no leading zero (phone numbers, ids), at most 15 digits; "₹1,200" and "(300)" count
const asNumber = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const s = v.replace(/^[₹$€£]\s?/, '').replace(/^\((.*)\)$/, '-$1');
  if (!/^-?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(s) || /^-?0\d/.test(s) || s.replace(/\D/g, '').length > 15) return null;
  return Number(s.replace(/,/g, ''));
};
const LISTY = /status|state|priority|severity|result|stage|type|category|env|platform|module|outcome|pass|fail|phase|sprint|tag|label/i;
const WORDY = /name|title|desc|summary|issue|remark|comment|note|step|detail|expected|actual|url|link|email|id$/i;
const asText = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));

// The column type and the stored value of each cell
function columnFrom(name, values, colored, people, listOptions) {
  const filled = values.filter((v) => v !== '');
  const strings = filled.map(asText);
  const distinct = [...new Set(strings)];
  const short = distinct.every((s) => s.length <= 40 && !s.includes('\n'));
  // a dropdown in Excel stays a dropdown, with every option it has (also ones no row uses yet)
  if (listOptions && short) {
    const options = [...new Set([...listOptions.map((o) => o.slice(0, 40)), ...distinct])];
    if (options.length <= MAX_OPTIONS) return { type: 'select', options, cell: (v) => (v === '' ? '' : asText(v)) };
  }
  if (filled.every((v) => typeof v === 'boolean' || YES.test(String(v)) || NO.test(String(v)))) {
    return { type: 'checkbox', cell: (v) => (v === '' ? '' : v === true || YES.test(String(v))) };
  }
  if (filled.every((v) => asNumber(v) !== null)) return { type: 'number', cell: (v) => (v === '' ? '' : asNumber(v)) };
  if (filled.every((v) => asDate(v))) return { type: 'date', cell: (v) => (v === '' ? '' : asDate(v)) };
  const who = (s) => people.find((u) => [u.name, u.username, u.teams_email].some((n) => n && n.toLowerCase() === s.toLowerCase()));
  if (distinct.every(who)) return { type: 'person', cell: (v) => (v === '' ? '' : who(asText(v)).id) };
  const repeats = distinct.length <= Math.max(2, filled.length / 2);
  if (short && distinct.length <= 15 && !WORDY.test(name) && (LISTY.test(name) || (repeats && filled.length >= 4) || (colored && repeats))) {
    return { type: 'select', options: distinct, cell: (v) => (v === '' ? '' : asText(v)) };
  }
  return { type: 'text', cell: (v) => (v === '' ? '' : asText(v).slice(0, 2000)) };
}

// the most common colour among a list ('#rrggbb' or null)
const commonest = (list) => {
  const counts = {};
  list.filter(Boolean).forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [null])[0];
};

// ---------------------------------------------------------------- one worksheet

/**
 * → { name, header, columns: [{ name, type, options, colors, fonts, width, values }], rows: [[value]], styles: [[{ bg, fg, b } | null]],
 *     skipped: [names of empty columns] }; null when it has no data
 */
function readWorksheet(ws, { people, tags, theme, book }) {
  const width = Math.min(ws.columnCount, MAX_COLUMNS);
  const height = ws.rowCount;
  if (!width || !height) return null;

  // merged cells: down → every row gets the value, across → only the first column
  const at = (r, c) => {
    const cell = ws.getCell(r, c);
    if (cell.isMerged && cell.master && cell.master.address !== cell.address) {
      const master = cell.master;
      return { cell: master, slave: true, across: master.col !== c };
    }
    return { cell, slave: false, across: false };
  };
  const values = new Map();
  const value = (r, c) => {
    const key = r * 20000 + c;
    if (!values.has(key)) {
      const x = at(r, c);
      values.set(key, x.across ? '' : cellPlain(x.cell));
    }
    return values.get(key);
  };
  const rowValues = (r) => Array.from({ length: width }, (_, i) => value(r, i + 1));
  const filledIn = (r) => rowValues(r).filter((v) => v !== '').length;

  // header row: the first row at least half as full as the fullest of the first 30 rows
  const scan = Math.min(height, 30);
  const counts = Array.from({ length: scan }, (_, k) => filledIn(k + 1));
  const most = Math.max(...counts);
  if (!most) return null;
  let head = 0;
  for (let k = 0; k < scan && !head; k += 1) {
    if ((counts[k] >= 2 || width === 1 || most === 1) && counts[k] >= Math.ceil(most / 2)) head = k + 1;
  }
  if (!head) return null;

  // a group header merged across columns, with sub headers under it: "Group › Sub"
  const headers = rowValues(head).map(asText);
  // the header cell's merge, when it spans more than one column
  const masterAt = (c) => ws.getCell(head, c).master;
  const groups = Array.from({ length: width }, (_, i) => {
    const m = masterAt(i + 1);
    const spans = (i > 0 && masterAt(i).address === m.address) || (i + 1 < width && masterAt(i + 2).address === m.address);
    return spans ? asText(cellPlain(m)) : null;
  });
  let bodyFrom = head + 1;
  if (groups.some((g) => g) && head < height) {
    const sub = rowValues(head + 1);
    const under = sub.filter((v, i) => v !== '' && groups[i]).length;
    if (under >= 2 && sub.every((v) => v === '' || typeof v === 'string')) {
      for (let i = 0; i < width; i += 1) {
        if (groups[i]) headers[i] = sub[i] && sub[i] !== groups[i] ? `${groups[i]} › ${sub[i]}` : groups[i];
        else if (!headers[i] && sub[i]) headers[i] = sub[i];
      }
      bodyFrom = head + 2;
    }
  }

  const lastRow = Math.min(height, bodyFrom + MAX_ROWS * 2);
  const conditional = conditionalFormats(ws, theme, value, lastRow);
  const lists = listValidations(ws, book);

  // a cell's look: its own fill / font (a merged cell takes its first cell's), conditional formats on top
  const lookOf = (r, c) => {
    const { cell } = at(r, c);
    const cf = conditional(cell.row, cell.col);
    const fill = cf.bg || fillColour(cell.fill, theme, false);
    const font = cf.fg || colour(cell.font && cell.font.color, theme);
    const look = { bg: bgOf(fill), fg: fgOf(font), b: Boolean(cf.b || (cell.font && cell.font.bold)) };
    return look.bg || look.fg || look.b ? look : null;
  };

  const body = [];
  const looks = [];
  const formats = [];
  for (let r = bodyFrom; r <= height && body.length < MAX_ROWS; r += 1) {
    const vals = rowValues(r);
    if (vals.every((v) => v === '')) continue;
    body.push(vals);
    looks.push(vals.map((v, i) => (v === '' ? null : lookOf(r, i + 1))));
    formats.push(vals.map((v, i) => (typeof v === 'number' ? String(ws.getCell(r, i + 1).numFmt || '') : '')));
  }

  const used = new Map();
  const columns = [];
  const skipped = [];
  for (let i = 0; i < width; i += 1) {
    const column = ws.getColumn(i + 1);
    let colValues = body.map((row) => row[i]);
    if (colValues.every((v) => v === '')) { // an empty column is left out
      if (headers[i]) skipped.push(headers[i]);
      continue;
    }
    let name = String(headers[i] || '').replace(/\s+/g, ' ').trim().slice(0, 60) || `Column ${column.letter}`;
    // percentages: 0.25 shown as 25%
    const numeric = colValues.map((v, k) => (typeof v === 'number' ? formats[k][i] : null)).filter((x) => x !== null);
    if (numeric.length && numeric.every((f) => f.includes('%')) && colValues.every((v) => v === '' || typeof v === 'number')) {
      colValues = colValues.map((v) => (v === '' ? '' : Math.round(v * 100 * 1e6) / 1e6));
      if (!name.includes('%')) name = `${name.slice(0, 56)} (%)`;
    }
    const seen = used.get(name.toLowerCase()) || 0;
    used.set(name.toLowerCase(), seen + 1);
    if (seen) name = `${name.slice(0, 56)} ${seen + 1}`;

    const cellLooks = looks.map((l) => l[i]);
    const list = lists.find((x) => x.range.left <= i + 1 && x.range.right >= i + 1 && x.range.bottom >= bodyFrom && x.range.top <= bodyFrom + body.length);
    const col = columnFrom(name, colValues, cellLooks.some((l) => l && (l.bg || l.fg)), people, list && list.options);

    // dropdown values keep the colour they have in Excel, else the app's status tag of that name (as text colour)
    const colors = {};
    const fonts = {};
    if (col.type === 'select') {
      col.options.forEach((o) => {
        const mine = cellLooks.filter((l, k) => l && colValues[k] !== '' && col.cell(colValues[k]) === o);
        const bg = commonest(mine.map((l) => l.bg));
        const fg = commonest(mine.filter((l) => !bg || l.bg === bg).map((l) => l.fg));
        const tag = tags.find((t) => t.label.toLowerCase() === o.toLowerCase());
        if (bg) colors[o] = bg;
        if (fg) fonts[o] = fg;
        else if (!bg && tag && TAG_HEX[tag.color]) fonts[o] = TAG_HEX[tag.color];
      });
    }
    const longest = Math.max(name.length, ...colValues.map((v) => (v instanceof Date ? 11 : String(v).split('\n')[0].length)));
    columns.push({
      name, type: col.type, options: (col.options || []).slice(0, MAX_OPTIONS), colors, fonts,
      width: Math.max(90, Math.min(420, Math.round(column.width ? column.width * 7.5 + 12 : longest * 7.5 + 28))),
      values: colValues.map(col.cell),
      // other cells keep their own look (dropdowns show their option's colour instead)
      looks: col.type === 'select' ? cellLooks.map((l) => (l && l.b ? { b: true } : null)) : cellLooks,
    });
  }
  if (!columns.length) return null;
  return {
    name: ws.name,
    header: head,
    columns: columns.map(({ looks: l, ...c }) => c),
    rows: body.map((_, k) => columns.map((c) => c.values[k])),
    styles: body.map((_, k) => columns.map((c) => c.looks[k])),
    skipped,
  };
}

/** An .xlsx file (Buffer) → the worksheets with data, read as above. people: logins of the app, tags: status tags. */
async function readWorkbook(buffer, { people, tags }) {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buffer);
  const theme = themeOf(book);
  return book.worksheets.filter((ws) => ws.state === 'visible' || !ws.state).slice(0, MAX_SHEETS)
    .map((ws) => readWorksheet(ws, { people, tags, theme, book })).filter(Boolean);
}

module.exports = { readWorkbook, cellPlain, MAX_ROWS };
