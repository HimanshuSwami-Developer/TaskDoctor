/* FlowTrace — formulas, the same in the browser and on the server. © 2026 FinDevelopers
 *
 * Excel's formula language, small: text / numbers / TRUE / FALSE, = <> < > <= >= & + - * / ^ %, references and the
 * functions people use (IF, IFS, SWITCH, AND, OR, SUM, AVERAGE, ROUND, TEXT, CONCAT, TEXTJOIN, TODAY, DATEDIF,
 * NETWORKDAYS, COUNTIF …). Anything it cannot read is an error value (#VALUE!, #NAME?, #DIV/0!, #REF!), like Excel.
 *
 * Two kinds of references:
 *   - A1 references (B2, $C$4, A2:D9, 'Lists'!A1): Excel's conditional formats on import (excel.js), ctx.value(r, c)
 *   - columns of a sheet, by name in what people type ([Qty] * [Price]) and by id when stored ({id} * {id}), so a
 *     renamed column keeps its formulas: a formula column works its value out from the other cells of its row.
 *
 * Node: require('./public/formula'); browser: window.flowFormula.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.flowFormula = factory();
}(typeof self !== 'undefined' ? self : this, () => {
  class XlError { constructor(code) { this.code = code; } toString() { return this.code; } }
  const ERR = new XlError('#VALUE!');
  const DIV0 = new XlError('#DIV/0!');
  const NAME = new XlError('#NAME?');
  const REF = new XlError('#REF!');
  const NA = new XlError('#N/A');
  const NUM = new XlError('#NUM!');
  const isErr = (v) => v instanceof XlError;
  const DAY = 86400000;
  const EPOCH = Date.UTC(1899, 11, 30);
  const serial = (d) => (d.getTime() - EPOCH) / DAY;
  const fromSerial = (n) => new Date(EPOCH + Math.round(n * DAY));
  const today = () => { const n = new Date(); return Math.floor((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - EPOCH) / DAY); };
  const colNumber = (letters) => [...letters.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
  const colLetter = (n) => { let s = ''; for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s; return s; };

  // value as Excel compares it: dates are numbers, empty is ''
  const xlValue = (v) => (v instanceof Date ? serial(v) : v);
  const toNum = (v) => {
    if (isErr(v)) return v;
    if (Array.isArray(v)) return toNum(v[0]);
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v === '' || v === null || v === undefined) return 0;
    const s = String(v).trim().replace(/,/g, '');
    const pct = /%$/.test(s);
    const n = Number(pct ? s.slice(0, -1) : s);
    if (Number.isFinite(n)) return pct ? n / 100 : n;
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); // a date as text ('YYYY-MM-DD') counts as its day number
    return d ? (Date.UTC(+d[1], +d[2] - 1, +d[3]) - EPOCH) / DAY : ERR;
  };
  const toStr = (v) => (isErr(v) ? v : Array.isArray(v) ? toStr(v[0]) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE')
    : v === null || v === undefined ? '' : typeof v === 'number' ? String(Math.round(v * 1e10) / 1e10) : String(v));
  const toBool = (v) => (isErr(v) ? v : Array.isArray(v) ? toBool(v[0]) : typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0
    : /^true$/i.test(String(v)) ? true : /^false$/i.test(String(v)) ? false : v === '' ? false : ERR);
  const firstErr = (list) => list.find(isErr);

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
    const re = /\s*(?:("(?:[^"]|"")*")|\{([\w@-]+)\}|\[([^\]]+)\]|((?:'[^']+'|[A-Za-z_][\w.]*)!)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![\w(])|(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\.\d+)|#(?:DIV\/0!|N\/A|NAME\?|NULL!|NUM!|REF!|VALUE!)|([A-Za-z_][\w.]*)|(<>|<=|>=|[-+*/^&=<>(),;%]))/y;
    let at = 0;
    while (at < src.length) {
      re.lastIndex = at;
      const m = re.exec(src);
      if (!m || m.index !== at || m[0] === '') {
        if (/^\s*$/.test(src.slice(at))) break;
        return null;
      }
      at = re.lastIndex;
      if (m[1] !== undefined) out.push({ t: 'str', v: m[1].slice(1, -1).replace(/""/g, '"') });
      else if (m[2] !== undefined) out.push({ t: 'field', v: m[2] });
      else if (m[3] !== undefined) out.push({ t: 'fieldName', v: m[3].trim() });
      else if (m[5] !== undefined) out.push({ t: 'ref', v: m[5], sheet: m[4] ? m[4].slice(0, -1).replace(/^'|'$/g, '') : null });
      else if (m[6] !== undefined) out.push({ t: 'num', v: Number(m[6]) });
      else if (m[0].trim().startsWith('#')) out.push({ t: 'err', v: new XlError(m[0].trim()) });
      else if (m[7] !== undefined) out.push({ t: 'name', v: m[7].toUpperCase().replace(/^_XLFN\.|^_XLWS\./, '') });
      else out.push({ t: 'op', v: m[8] === ';' ? ',' : m[8] });
    }
    return out;
  }

  // ---- functions: args are values (a range is a list); errors pass through like in Excel

  // the numbers of a function's arguments, as Excel takes them: in a range only real numbers, a value given on its
  // own also when it reads as one ("5", TRUE)
  const nums = (args) => args.flatMap((a) => (Array.isArray(a) ? a.filter((v) => typeof v === 'number')
    : a === '' || isErr(toNum(a)) ? [] : [toNum(a)]));
  const wild = (want) => new RegExp(`^${String(want).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/~\*/g, '\u0001').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\u0001/g, '\\*')}$`, 'i');
  // COUNTIF's criteria: ">5", "<>done", "a*", 7 …
  function criteria(crit) {
    const m = /^(<>|<=|>=|=|<|>)?([\s\S]*)$/.exec(typeof crit === 'string' ? crit : '');
    const op = typeof crit === 'string' && m[1] ? m[1] : '=';
    const want = typeof crit === 'string' ? (m[2] !== '' && Number.isFinite(Number(m[2])) ? Number(m[2]) : m[2]) : crit;
    const like = typeof want === 'string' && /[*?]/.test(want) ? wild(want) : null;
    return (v) => {
      if (like) return op === '=' ? like.test(toStr(v)) : !like.test(toStr(v));
      const d = compare(v, want);
      return { '=': d === 0, '<>': d !== 0, '<': d < 0, '>': d > 0, '<=': d <= 0, '>=': d >= 0 }[op];
    };
  }
  const list = (v) => (Array.isArray(v) ? v : [v]);
  const date = (n) => fromSerial(toNum(n));
  const dayNo = (d) => Math.floor((d.getTime() - EPOCH) / DAY);
  const weekday = (n) => fromSerial(n).getUTCDay(); // 0 = Sunday
  // TEXT(value, format): the formats people use: 0, 0.00, #,##0, 0%, dates (dd/mm/yyyy, d mmm yyyy, mmmm, ddd …)
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function text(v, fmt) {
    const f = toStr(fmt);
    if (/[dmy]/i.test(f.replace(/"[^"]*"/g, ''))) {
      const n = toNum(v);
      if (isErr(n)) return n;
      const d = fromSerial(n);
      const pad = (x) => String(x).padStart(2, '0');
      return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, (t) => ({
        yyyy: d.getUTCFullYear(), yy: pad(d.getUTCFullYear() % 100), mmmm: MONTH[d.getUTCMonth()], mmm: MON[d.getUTCMonth()],
        mm: pad(d.getUTCMonth() + 1), m: d.getUTCMonth() + 1, dddd: WDAY[d.getUTCDay()], ddd: WDAY[d.getUTCDay()].slice(0, 3),
        dd: pad(d.getUTCDate()), d: d.getUTCDate(),
      })[t.toLowerCase()]).replace(/"([^"]*)"/g, '$1');
    }
    const n = toNum(v);
    if (isErr(n)) return typeof v === 'string' ? v : n;
    const pct = f.includes('%');
    const dec = ((/\.([0#]+)/.exec(f) || [, ''])[1]).length;
    const x = pct ? n * 100 : n;
    const out = f.includes(',') ? x.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : x.toFixed(dec);
    const lead = (/^[^0#.,]*/.exec(f.replace(/"/g, '')) || [''])[0].replace('%', '');
    return `${lead}${out}${pct ? '%' : ''}`;
  }

  const FUNCTIONS = {
    AND: (args) => { const l = args.flat(); const e = firstErr(l); if (e) return e; return l.every((a) => toBool(a) === true); },
    OR: (args) => { const l = args.flat(); const e = firstErr(l); if (e) return e; return l.some((a) => toBool(a) === true); },
    XOR: (args) => args.flat().filter((a) => toBool(a) === true).length % 2 === 1,
    NOT: ([a]) => { const b = toBool(a); return isErr(b) ? b : !b; },
    IF: ([c, a = true, b = false]) => { const x = toBool(c); return isErr(x) ? x : x ? a : b; },
    IFS: (args) => { for (let k = 0; k + 1 < args.length; k += 2) { const x = toBool(args[k]); if (isErr(x)) return x; if (x) return args[k + 1]; } return NA; },
    SWITCH: ([v, ...rest]) => {
      for (let k = 0; k + 1 < rest.length; k += 2) if (compare(xlValue(v), rest[k]) === 0) return rest[k + 1];
      return rest.length % 2 ? rest[rest.length - 1] : NA;
    },
    CHOOSE: ([n, ...opts]) => { const k = toNum(n); return isErr(k) ? k : k >= 1 && k <= opts.length ? opts[Math.floor(k) - 1] : ERR; },
    IFERROR: ([a, b]) => (isErr(a) ? b : a),
    IFNA: ([a, b]) => (isErr(a) && a.code === '#N/A' ? b : a),
    ISERROR: ([a]) => isErr(a),
    ISERR: ([a]) => isErr(a) && a.code !== '#N/A',
    ISNA: ([a]) => isErr(a) && a.code === '#N/A',
    NA: () => NA,
    ISNUMBER: ([a]) => typeof a === 'number',
    ISTEXT: ([a]) => typeof a === 'string' && a !== '',
    ISNONTEXT: ([a]) => typeof a !== 'string' || a === '',
    ISLOGICAL: ([a]) => typeof a === 'boolean',
    ISBLANK: ([a]) => a === '',
    ISEVEN: ([a]) => Math.floor(Math.abs(toNum(a))) % 2 === 0,
    ISODD: ([a]) => Math.floor(Math.abs(toNum(a))) % 2 === 1,
    // text
    SEARCH: ([find, within, start = 1]) => {
      const s = toStr(within);
      const f = toStr(find);
      const from = toNum(start) - 1;
      if (/[*?]/.test(f)) { for (let k = from; k < s.length; k += 1) if (wild(`${f}*`).test(s.slice(k))) return k + 1; return ERR; }
      const i = s.toLowerCase().indexOf(f.toLowerCase(), from);
      return i < 0 ? ERR : i + 1;
    },
    FIND: ([find, within, start = 1]) => { const i = toStr(within).indexOf(toStr(find), toNum(start) - 1); return i < 0 ? ERR : i + 1; },
    LEFT: ([s, n = 1]) => toStr(s).slice(0, toNum(n)),
    RIGHT: ([s, n = 1]) => { const x = toStr(s); const k = toNum(n); return k ? x.slice(-k) : ''; },
    MID: ([s, a, n]) => toStr(s).substr(toNum(a) - 1, toNum(n)),
    LEN: ([s]) => toStr(s).length,
    LOWER: ([s]) => toStr(s).toLowerCase(),
    UPPER: ([s]) => toStr(s).toUpperCase(),
    PROPER: ([s]) => toStr(s).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()),
    TRIM: ([s]) => toStr(s).trim().replace(/\s+/g, ' '),
    CLEAN: ([s]) => toStr(s).replace(/[\x00-\x1f]/g, ''),
    EXACT: ([a, b]) => toStr(a) === toStr(b),
    REPT: ([s, n]) => toStr(s).repeat(Math.max(0, toNum(n))),
    SUBSTITUTE: ([s, a, b, n]) => {
      const x = toStr(s); const f = toStr(a); const t = toStr(b);
      if (!f) return x;
      if (n === undefined) return x.split(f).join(t);
      let k = 0;
      return x.replace(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (m) => (++k === toNum(n) ? t : m));
    },
    REPLACE: ([s, a, n, t]) => { const x = toStr(s); const at = toNum(a) - 1; return x.slice(0, at) + toStr(t) + x.slice(at + toNum(n)); },
    CONCAT: (args) => { const l = args.flat(); return firstErr(l) || l.map(toStr).join(''); },
    TEXTJOIN: ([sep, skip, ...args]) => {
      const l = args.flat();
      return firstErr(l) || l.filter((v) => !(toBool(skip) === true && v === '')).map(toStr).join(toStr(sep));
    },
    TEXT: ([v, f]) => text(v, f),
    VALUE: ([a]) => toNum(a),
    N: ([a]) => (typeof a === 'number' ? a : typeof a === 'boolean' ? +a : 0),
    T: ([a]) => (typeof a === 'string' ? a : ''),
    CHAR: ([n]) => String.fromCharCode(toNum(n)),
    // numbers
    SUM: (args) => nums(args).reduce((t, v) => t + v, 0),
    PRODUCT: (args) => nums(args).reduce((t, v) => t * v, 1),
    AVERAGE: (args) => { const l = nums(args); return l.length ? l.reduce((t, v) => t + v, 0) / l.length : DIV0; },
    MIN: (args) => { const l = nums(args); return l.length ? Math.min(...l) : 0; },
    MAX: (args) => { const l = nums(args); return l.length ? Math.max(...l) : 0; },
    MEDIAN: (args) => { const l = nums(args).sort((a, b) => a - b); if (!l.length) return NUM; const h = l.length >> 1; return l.length % 2 ? l[h] : (l[h - 1] + l[h]) / 2; },
    COUNT: (args) => nums(args).length,
    COUNTA: (args) => args.flat().filter((v) => v !== '').length,
    COUNTBLANK: (args) => args.flat().filter((v) => v === '').length,
    COUNTIF: ([range, crit]) => list(range).filter(criteria(crit)).length,
    SUMIF: ([range, crit, sumRange]) => { const r = list(range); const s = sumRange === undefined ? r : list(sumRange); const ok = criteria(crit); return r.reduce((t, v, k) => t + (ok(v) && typeof s[k] === 'number' ? s[k] : 0), 0); },
    AVERAGEIF: ([range, crit, avgRange]) => { const r = list(range); const s = avgRange === undefined ? r : list(avgRange); const ok = criteria(crit); const l = r.map((v, k) => (ok(v) ? s[k] : null)).filter((v) => typeof v === 'number'); return l.length ? l.reduce((t, v) => t + v, 0) / l.length : DIV0; },
    ABS: ([a]) => Math.abs(toNum(a)),
    SIGN: ([a]) => Math.sign(toNum(a)),
    SQRT: ([a]) => { const n = toNum(a); return n < 0 ? NUM : Math.sqrt(n); },
    POWER: ([a, b]) => toNum(a) ** toNum(b),
    EXP: ([a]) => Math.exp(toNum(a)),
    LN: ([a]) => { const n = toNum(a); return n <= 0 ? NUM : Math.log(n); },
    LOG10: ([a]) => { const n = toNum(a); return n <= 0 ? NUM : Math.log10(n); },
    PI: () => Math.PI,
    INT: ([a]) => Math.floor(toNum(a)),
    TRUNC: ([a, n = 0]) => Math.trunc(toNum(a) * 10 ** toNum(n)) / 10 ** toNum(n),
    MOD: ([a, b]) => { const x = toNum(a); const y = toNum(b); return y ? x - y * Math.floor(x / y) : DIV0; },
    QUOTIENT: ([a, b]) => { const y = toNum(b); return y ? Math.trunc(toNum(a) / y) : DIV0; },
    ROUND: ([a, n = 0]) => { const k = 10 ** toNum(n); const x = toNum(a) * k; return Math.sign(x) * Math.round(Math.abs(x) + 1e-9) / k; },
    ROUNDDOWN: ([a, n = 0]) => Math.trunc(toNum(a) * 10 ** toNum(n)) / 10 ** toNum(n),
    ROUNDUP: ([a, n = 0]) => { const k = 10 ** toNum(n); const x = toNum(a) * k; return (x < 0 ? Math.floor(x) : Math.ceil(x)) / k; },
    FLOOR: ([a, s = 1]) => Math.floor(toNum(a) / toNum(s)) * toNum(s),
    CEILING: ([a, s = 1]) => Math.ceil(toNum(a) / toNum(s)) * toNum(s),
    MROUND: ([a, s]) => Math.round(toNum(a) / toNum(s)) * toNum(s),
    // dates are day numbers, as in Excel
    TODAY: () => today(),
    NOW: () => (Date.now() - EPOCH) / DAY,
    DATE: ([y, m, d]) => (Date.UTC(toNum(y), toNum(m) - 1, toNum(d)) - EPOCH) / DAY,
    DATEVALUE: ([s]) => toNum(s),
    YEAR: ([a]) => date(a).getUTCFullYear(),
    MONTH: ([a]) => date(a).getUTCMonth() + 1,
    DAY: ([a]) => date(a).getUTCDate(),
    WEEKDAY: ([a, type = 1]) => { const w = date(a).getUTCDay(); return toNum(type) === 2 ? (w + 6) % 7 + 1 : toNum(type) === 3 ? (w + 6) % 7 : w + 1; },
    WEEKNUM: ([a]) => { const d = date(a); const jan1 = Date.UTC(d.getUTCFullYear(), 0, 1); return Math.floor((dayNo(d) - dayNo(new Date(jan1)) + new Date(jan1).getUTCDay()) / 7) + 1; },
    EDATE: ([a, m]) => { const d = date(a); d.setUTCMonth(d.getUTCMonth() + toNum(m)); return dayNo(d); },
    EOMONTH: ([a, m]) => { const d = date(a); return dayNo(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + toNum(m) + 1, 0))); },
    DAYS: ([end, start]) => Math.floor(toNum(end)) - Math.floor(toNum(start)),
    DATEDIF: ([s, e, unit]) => {
      const a = date(s); const b = date(e);
      if (b < a) return NUM;
      const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
      const u = toStr(unit).toUpperCase();
      if (u === 'D') return dayNo(b) - dayNo(a);
      if (u === 'M') return months;
      if (u === 'Y') return Math.floor(months / 12);
      if (u === 'YM') return months % 12;
      if (u === 'MD') return b.getUTCDate() >= a.getUTCDate() ? b.getUTCDate() - a.getUTCDate() : dayNo(b) - dayNo(new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() - 1, a.getUTCDate())));
      return ERR;
    },
    NETWORKDAYS: ([s, e, hol]) => {
      const a = Math.floor(toNum(s)); const b = Math.floor(toNum(e));
      const off = new Set(list(hol === undefined ? [] : hol).map((x) => Math.floor(toNum(x))));
      let n = 0;
      for (let d = Math.min(a, b); d <= Math.max(a, b); d += 1) if (![0, 6].includes(weekday(d)) && !off.has(d)) n += 1;
      return a <= b ? n : -n;
    },
    WORKDAY: ([s, days, hol]) => {
      const off = new Set(list(hol === undefined ? [] : hol).map((x) => Math.floor(toNum(x))));
      let d = Math.floor(toNum(s)); let left = Math.abs(toNum(days)); const step = toNum(days) < 0 ? -1 : 1;
      while (left > 0) { d += step; if (![0, 6].includes(weekday(d)) && !off.has(d)) left -= 1; }
      return d;
    },
    ROW: (args, ctx) => ctx.r,
    COLUMN: (args, ctx) => ctx.c,
    TRUE: () => true,
    FALSE: () => false,
  };
  FUNCTIONS.CONCATENATE = FUNCTIONS.CONCAT;
  FUNCTIONS.AVG = FUNCTIONS.AVERAGE;
  // what people may type, for the formula help
  const FUNCTION_NAMES = Object.keys(FUNCTIONS).filter((n) => !['TRUE', 'FALSE', 'ROW', 'COLUMN', 'AVG'].includes(n)).sort();

  // Evaluate one formula. ctx: { r, c, top, left, value(r, c), lastRow, sheet(name) → value(r, c), field(id | name) }
  function evaluate(formula, ctx) {
    const tokens = tokenize(String(formula).replace(/^\s*=/, ''));
    if (!tokens || !tokens.length) return ERR;
    let i = 0;
    const peek = () => tokens[i];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
    const cellAt = (ref) => {
      const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/i.exec(ref);
      const c = colNumber(m[2]);
      const r = +m[4];
      return { r: m[3] ? r : r + (ctx.r - (ctx.top || ctx.r)), c: m[1] ? c : c + (ctx.c - (ctx.left || ctx.c)) };
    };
    function primary() {
      const t = tokens[i++];
      if (!t) return ERR;
      if (t.t === 'str' || t.t === 'num') return t.v;
      if (t.t === 'err') return t.v;
      if (t.t === 'field' || t.t === 'fieldName') return ctx.field ? ctx.field(t.v, t.t === 'fieldName') : REF;
      if (t.t === 'ref') {
        const at = t.sheet ? ctx.sheet && ctx.sheet(t.sheet) : ctx.value;
        if (!at) return REF;
        const [a, b] = t.v.split(':');
        const x = cellAt(a);
        if (!b) return at(x.r, x.c);
        const y = cellAt(b);
        const out = [];
        for (let r = Math.min(x.r, y.r); r <= Math.min(Math.max(x.r, y.r), ctx.lastRow || Infinity); r += 1) {
          for (let c = Math.min(x.c, y.c); c <= Math.max(x.c, y.c); c += 1) out.push(at(r, c));
        }
        return out;
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
          if (!fn) return NAME;
          // IFERROR / IF* see errors as values; others give the first error of their arguments
          const lazy = ['IFERROR', 'IFNA', 'ISERROR', 'ISERR', 'ISNA', 'IF', 'IFS', 'CHOOSE', 'SWITCH', 'COUNTIF', 'COUNT', 'COUNTA', 'COUNTBLANK'];
          if (!lazy.includes(t.v)) { const e = firstErr(args.flat()); if (e) return e; }
          const v = fn(args, ctx);
          return typeof v === 'number' && !Number.isFinite(v) ? NUM : v;
        }
        if (t.v === 'TRUE') return true;
        if (t.v === 'FALSE') return false;
        return NAME; // named ranges are not followed
      }
      if (t.v === '(') {
        const v = comparison();
        if (!isOp(')')) return ERR;
        i += 1;
        return v;
      }
      if (t.v === '-') { const v = toNum(postfix()); return isErr(v) ? v : -v; }
      if (t.v === '+') return postfix();
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
        v = isErr(a) ? a : isErr(b) ? b : op === '*' ? a * b : b === 0 ? DIV0 : a / b;
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

  // ---- formula columns of a sheet

  /** The column names in a stored formula ({id} → [Name]); a column that is gone shows as [#REF] */
  function toNames(formula, columns) {
    return String(formula || '').replace(/\{([\w@-]+)\}/g, (m, id) => {
      const c = columns.find((x) => x.id === id);
      return c ? `[${c.name}]` : '[#REF]';
    });
  }
  /** What people typed ([Name], any case) → stored ({id}); throws Error('No column named …') */
  function toIds(formula, columns) {
    const src = String(formula || '').trim().replace(/^=/, '');
    let out = '';
    let inText = false;
    for (let k = 0; k < src.length; k += 1) {
      const ch = src[k];
      if (ch === '"') inText = !inText;
      if (!inText && ch === '[') {
        const end = src.indexOf(']', k);
        if (end < 0) throw new Error('A [ has no closing ]');
        const name = src.slice(k + 1, end).trim();
        const c = columns.find((x) => x.name.toLowerCase() === name.toLowerCase());
        if (!c) throw new Error(`No column named “${name}”`);
        out += `{${c.id}}`;
        k = end;
      } else out += ch;
    }
    if (!tokenize(out)) throw new Error('This formula could not be read');
    return out;
  }
  /** Column ids a stored formula uses */
  const fieldsOf = (formula) => [...String(formula || '').matchAll(/\{([\w@-]+)\}/g)].map((m) => m[1]);

  /**
   * The formula columns of one row → { columnId: value } (number, text, boolean or an XlError).
   * plain(col, v): what another column's cell counts as (people / flows / screens by name; dates 'YYYY-MM-DD' become
   * day numbers here, checkboxes TRUE / FALSE). A formula may use other formula columns; a loop is #REF!.
   */
  function computeRow(columns, cells, plain, rowNumber) {
    const byId = new Map(columns.map((c) => [c.id, c]));
    const out = {};
    const busy = new Set();
    function valueOf(c) {
      if (c.type !== 'formula') {
        const v = cells[c.id];
        if (v === '' || v === undefined || v === null) return '';
        if (c.type === 'date') return toNum(String(v));
        if (c.type === 'checkbox') return v === true;
        if (c.type === 'number') return Number(v);
        return plain ? plain(c, v) : v;
      }
      if (c.id in out) return out[c.id];
      if (busy.has(c.id)) return REF;
      busy.add(c.id);
      const v = evaluate(c.formula || '', {
        r: rowNumber || 1, c: columns.indexOf(c) + 1,
        field: (key, byName) => {
          const x = byName ? columns.find((y) => y.name.toLowerCase() === key.toLowerCase()) : byId.get(key);
          return x ? valueOf(x) : REF;
        },
      });
      busy.delete(c.id);
      out[c.id] = Array.isArray(v) ? v[0] : v;
      return out[c.id];
    }
    columns.filter((c) => c.type === 'formula').forEach(valueOf);
    return out;
  }

  /**
   * A result as it shows. format: { kind: '' | 'number' | 'percent' | 'currency' | 'date' | 'text', decimals, symbol }
   * (from the Excel it was imported from, or picked on the column)
   */
  function display(v, format) {
    const f = format || {};
    if (isErr(v)) return v.code;
    if (v === '' || v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v !== 'number') return String(v);
    const dec = Number.isInteger(f.decimals) ? f.decimals : null;
    const fixed = (n, d) => n.toLocaleString('en-IN', d === null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: d, maximumFractionDigits: d });
    if (f.kind === 'date') {
      const d = fromSerial(v);
      return Number.isNaN(d.getTime()) ? '#VALUE!' : `${String(d.getUTCDate()).padStart(2, '0')} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    }
    if (f.kind === 'percent') return `${fixed(v * 100, dec === null ? 0 : dec)}%`;
    if (f.kind === 'currency') return `${v < 0 ? '-' : ''}${f.symbol || '₹'}${fixed(Math.abs(v), dec === null ? 2 : dec)}`;
    return fixed(v, dec);
  }
  /** 'YYYY-MM-DD' of a day number (a date result) */
  const isoDay = (n) => fromSerial(n).toISOString().slice(0, 10);

  return {
    XlError, ERR, isErr, DAY, EPOCH, serial, fromSerial, isoDay, today, colNumber, colLetter, xlValue, toNum, toStr, toBool, compare,
    tokenize, evaluate, FUNCTIONS, FUNCTION_NAMES, toNames, toIds, fieldsOf, computeRow, display,
  };
}));
