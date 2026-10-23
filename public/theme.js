/* FlowTrace — light / dark theme. © 2026 FinDevelopers
 *
 * The theme is a class on <html> ("dark"), picked in the header and kept in this browser; with no pick it follows
 * the system. The dark colours are not written by hand: when the page loads, every colour in styles.css is turned
 * into its dark twin (light backgrounds → dark, dark text → light, light tints → dark tints, accents kept or
 * lightened for text) and added as "html.dark …" rules, so a new style gets its dark look on its own.
 * Tailwind's utility classes are covered by the short list at the end; a rule in styles.css that starts with
 * "html.dark" is a hand-written dark look and wins over the made ones.
 */
(function () {
  const KEY = 'taskSheet.theme';
  const saved = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const system = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const apply = (dark) => document.documentElement.classList.toggle('dark', dark);
  apply(saved() ? saved() === 'dark' : system());

  // ---- colours

  const hex = (h) => {
    let s = h.slice(1);
    if (s.length === 3) s = s.split('').map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  };
  const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
  function hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function rgb([h, s, l]) {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }

  // greys (white and Tailwind's slate) by role
  const GREY = {
    bg: { '#ffffff': '#0f172a', '#fcfcfd': '#0b1222', '#f8fafc': '#0b1222', '#f1f5f9': '#1e293b', '#eef2f7': '#1e293b', '#e2e8f0': '#273449', '#cbd5e1': '#334155' },
    fg: { '#0f172a': '#f1f5f9', '#1e293b': '#e2e8f0', '#334155': '#cbd5e1', '#475569': '#b0bccd', '#64748b': '#94a3b8', '#94a3b8': '#7c8aa0', '#cbd5e1': '#475569', '#e2e8f0': '#334155' },
    line: { '#ffffff': '#1e293b', '#f1f5f9': '#1e293b', '#eef2f7': '#1e293b', '#e2e8f0': '#273449', '#cbd5e1': '#3b4a63', '#94a3b8': '#52627a' },
  };
  // a colour's dark twin for a role: bg (backgrounds), fg (text, icons), line (borders)
  function twin(value, role) {
    const c = toHex(hex(value));
    if (GREY[role][c]) return GREY[role][c];
    const [h, s, l] = hsl(hex(c));
    if (role === 'bg') return l >= 0.85 ? toHex(rgb([h, s * 0.55, 0.1 + (1 - l) * 1.1])) : c; // light tint → dark tint; accents stay
    if (role === 'line') return l >= 0.75 ? toHex(rgb([h, s * 0.5, 0.24 + (1 - l) * 0.3])) : c;
    if (c === '#ffffff') return c; // white text on a coloured button
    return s > 0.2 && l < 0.5 ? toHex(rgb([h, Math.min(1, s * 1.05), 0.72])) : c; // dark coloured text → light
  }
  function roleOf(prop) {
    if (/^--.*-(bg|fill)$/.test(prop) || /^background/.test(prop)) return 'bg';
    if (/^--.*-(bd|border)$/.test(prop) || /^(border|outline)/.test(prop) || prop === 'box-shadow') return 'line';
    if (/^--.*-fg$/.test(prop) || ['color', 'fill', 'stroke', 'caret-color', 'text-decoration-color'].includes(prop)) return 'fg';
    return null;
  }
  // the browser gives colours back as rgb() / rgba() (hex only inside some values): turn each into its twin,
  // keeping its transparency
  const COLOR = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/gi;
  const darkValue = (value, role) => value.replace(COLOR, (m, r, g, b, a) => {
    if (m[0] === '#') return twin(m, role);
    if (role === 'line' && a !== undefined && Number(a) < 0.5) return m; // a soft shadow stays as it is
    const t = hex(twin(toHex([+r, +g, +b]), role));
    return a === undefined ? `rgb(${t.join(', ')})` : `rgba(${t.join(', ')}, ${a})`;
  });

  // ---- styles.css → dark rules

  function darkRules(rules, out) {
    for (const rule of rules) {
      if (rule.cssRules && rule.media) { // @media: same, inside it
        const inner = [];
        darkRules(rule.cssRules, inner);
        if (inner.length) out.push(`@media ${rule.media.mediaText} { ${inner.join('\n')} }`);
        continue;
      }
      if (!rule.style || !rule.selectorText || /^html\.dark\b/.test(rule.selectorText)) continue; // already dark
      const decls = [];
      for (const prop of rule.style) {
        const role = roleOf(prop);
        const value = rule.style.getPropertyValue(prop);
        if (!role || !/#[0-9a-f]{3}|rgba?\(/i.test(value)) continue;
        const dark = darkValue(value, role);
        if (dark !== value) decls.push(`${prop}: ${dark}${rule.style.getPropertyPriority(prop) ? ' !important' : ''}`);
      }
      if (decls.length) {
        const selector = rule.selectorText.split(',').map((x) => `html.dark ${x.trim().replace(/^:root\b/, '')}`).join(', ');
        out.push(`${selector} { ${decls.join('; ')} }`);
      }
    }
  }

  // Tailwind utilities used in the app, and what the generated rules can't know
  const EXTRA = `
    html.dark { color-scheme: dark; }
    html.dark body, html.dark .bg-slate-50 { background-color: #020617; color: #e2e8f0; }
    html.dark .bg-white { background-color: #0f172a; }
    html.dark .bg-slate-100, html.dark .hover\\:bg-slate-100:hover { background-color: #1e293b; }
    html.dark .bg-slate-200 { background-color: #273449; }
    html.dark .hover\\:bg-slate-50:hover { background-color: #162033; }
    html.dark .bg-amber-50 { background-color: #2a1f0b; }
    html.dark .border-slate-100 { border-color: #1e293b; }
    html.dark .border-slate-200 { border-color: #273449; }
    html.dark .text-slate-900 { color: #f1f5f9; }
    html.dark .text-slate-800 { color: #e2e8f0; }
    html.dark .text-slate-700 { color: #cbd5e1; }
    html.dark .text-slate-600 { color: #b0bccd; }
    html.dark .text-slate-500 { color: #94a3b8; }
    html.dark .text-slate-400 { color: #7c8aa0; }
    html.dark .text-slate-300 { color: #52627a; }
    html.dark .text-indigo-600 { color: #a5b4fc; }
    html.dark .text-amber-700, html.dark .text-amber-800 { color: #fcd34d; }
    html.dark .skeleton { background: #1e293b; }
    html.dark .device.app { background: #000; }
    html.dark .device.app .notch { background: #000; }
    html.dark .sc-select.st.custom { --st-bg: color-mix(in srgb, var(--c) 24%, #0f172a); --st-fg: color-mix(in srgb, var(--c) 55%, #fff); --st-bd: color-mix(in srgb, var(--c) 50%, #0f172a); }
    html.dark img { opacity: .94; }
  `;

  function build() {
    const sheet = [...document.styleSheets].find((x) => x.href && /\/styles\.css(\?|$)/.test(x.href));
    let rules;
    try { rules = sheet && sheet.cssRules; } catch (e) { rules = null; }
    if (!rules) return false;
    const out = [];
    darkRules(rules, out);
    // before styles.css, so its own "html.dark …" rules (written by hand) win over these
    let el = document.getElementById('darkTheme');
    if (!el) { el = document.createElement('style'); el.id = 'darkTheme'; sheet.ownerNode.before(el); }
    el.textContent = `${out.join('\n')}\n${EXTRA}`;
    return true;
  }
  // styles.css is linked before this script runs at the end of the page; wait for it if it is still loading
  if (!build()) window.addEventListener('load', build);

  // ---- the header switch (app.js draws the button: [data-theme-toggle])
  const isDark = () => document.documentElement.classList.contains('dark');
  window.flowTheme = {
    isDark,
    toggle() {
      apply(!isDark());
      try { localStorage.setItem(KEY, isDark() ? 'dark' : 'light'); } catch (e) { /* private window: just for now */ }
    },
  };
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!saved()) apply(e.matches); });
  }
}());
