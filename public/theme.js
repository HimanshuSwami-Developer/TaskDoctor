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

  // Charcoal, like Linear: neutral greys (no colour cast), flat surfaces a step apart, hairline borders and soft
  // off-white text; the sidebar a shade darker than the page
  const GREY = {
    bg: {
      '#ffffff': '#1f2023', '#fcfcfd': '#1b1c1f', '#fafbff': '#232427', '#f8fafc': '#1b1c1f', '#f5f7ff': '#232427',
      '#f1f5f9': '#26272b', '#eef2f7': '#26272b', '#e2e8f0': '#2c2d31', '#cbd5e1': '#36373c',
    },
    fg: {
      '#0f172a': '#e6e6e8', '#111827': '#e6e6e8', '#1e293b': '#dcdde0', '#334155': '#c7c8cc', '#475569': '#a8aab0',
      '#64748b': '#8a8f98', '#94a3b8': '#6b6f76', '#cbd5e1': '#4a4c52', '#e2e8f0': '#3a3b40',
    },
    line: {
      '#ffffff': '#2a2b2f', '#f1f5f9': '#28292d', '#eef2f7': '#28292d', '#e2e8f0': '#2e2f33', '#cbd5e1': '#38393e', '#94a3b8': '#4d4f55',
    },
  };
  const rgba = ([r, g, b], a) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  // a colour's dark twin for a role: bg (backgrounds), fg (text, icons), line (borders)
  function twin(value, role) {
    const c = toHex(hex(value));
    if (GREY[role][c]) return GREY[role][c];
    const [h, s, l] = hsl(hex(c));
    if (role === 'bg') {
      if (l < 0.85) return c; // accents stay
      if (s < 0.2) return '#26272b'; // a near-grey tint is a raised surface
      return rgba(rgb([h, Math.max(0.5, s * 0.85), 0.6]), 0.13); // a light tint: its colour, faint and see-through
    }
    if (role === 'line') return l >= 0.75 ? (s < 0.2 ? '#303136' : rgba(rgb([h, Math.max(0.5, s * 0.85), 0.62]), 0.3)) : c;
    if (c === '#ffffff') return c; // white text on a coloured button
    return s > 0.2 && l < 0.5 ? toHex(rgb([h, Math.min(0.75, s * 0.85), 0.72])) : c; // dark coloured text → light and calm
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
    if (role === 'line' && a !== undefined && Number(a) < 0.5) {
      // a dark shadow gets deeper (it would vanish on a dark page); a coloured glow (focus ring) stays
      return Math.max(+r, +g, +b) < 80 ? `rgba(0, 0, 0, ${Math.min(0.7, Number(a) * 2.6).toFixed(2)})` : m;
    }
    const out = twin(toHex([+r, +g, +b]), role);
    if (out[0] !== '#') { // a see-through tint: its own transparency, times the colour's
      return a === undefined ? out : out.replace(/,\s*([\d.]+)\)$/, (x, k) => `, ${(Number(k) * Number(a)).toFixed(3)})`);
    }
    const t = hex(out);
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

  // Tailwind utilities used in the app, what the generated rules can't know, and the finish of the dark look:
  // flat and quiet (no glows, no gradients), one accent (#5e6ad2), chips as outlined pills with a coloured dot
  const EXTRA = `
    html.dark { color-scheme: dark; --accent: #5e6ad2; --accent-hi: #6e79d6; }
    html.dark body, html.dark .bg-slate-50 { background-color: #1f2023; color: #dcdde0; }
    html.dark ::selection { background: rgba(94, 106, 210, .45); color: #fff; }
    html.dark * { scrollbar-color: #3a3b40 transparent; }
    html.dark ::-webkit-scrollbar { width: 10px; height: 10px; }
    html.dark ::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 99px; background: #3a3b40 padding-box; }
    html.dark ::-webkit-scrollbar-thumb:hover { background-color: #4a4c52; }
    html.dark ::-webkit-scrollbar-track { background: transparent; }

    html.dark .bg-white { background-color: #1f2023; }
    html.dark .bg-slate-100, html.dark .hover\\:bg-slate-100:hover { background-color: #26272b; }
    html.dark .bg-slate-200 { background-color: #2c2d31; }
    html.dark .hover\\:bg-slate-50:hover { background-color: #232427; }
    html.dark .bg-amber-50 { background-color: rgba(242, 201, 76, .1); }
    html.dark .border-slate-100 { border-color: #28292d; }
    html.dark .border-slate-200 { border-color: #2e2f33; }
    html.dark .text-slate-900 { color: #e6e6e8; }
    html.dark .text-slate-800 { color: #dcdde0; }
    html.dark .text-slate-700 { color: #c7c8cc; }
    html.dark .text-slate-600 { color: #a8aab0; }
    html.dark .text-slate-500 { color: #8a8f98; }
    html.dark .text-slate-400 { color: #6b6f76; }
    html.dark .text-slate-300 { color: #4a4c52; }
    html.dark .text-indigo-600, html.dark .tab-add { color: #8f98e8; }
    html.dark .text-amber-700, html.dark .text-amber-800 { color: #f2c94c; }
    html.dark .skeleton { background: #2a2b2f; }
    html.dark .device.app { background: #000; }
    html.dark .device.app .notch { background: #000; }
    html.dark .sc-select.st.custom { --st-bg: color-mix(in srgb, var(--c) 16%, #1f2023); --st-fg: color-mix(in srgb, var(--c) 50%, #fff); --st-bd: color-mix(in srgb, var(--c) 35%, #1f2023); }
    html.dark img { opacity: .94; }
    html.dark .sb-logo img, html.dark .site-footer img { opacity: 1; }
    /* the navy logo would sink into the dark page: lift it to a bright blue (the white check stays white) */
    html.dark img[src$="/assets/logo.png"] { filter: brightness(2.3) saturate(1.1); }

    /* sidebar a shade darker, the page flat; bars without blur */
    html.dark .sidebar { background: #1b1c1f; border-right-color: #2a2b2f; }
    html.dark .sb-brand, html.dark .sb-foot { border-color: #2a2b2f; background: transparent; }
    html.dark .sb-title { color: #6b6f76; letter-spacing: .02em; text-transform: none; font-size: 12px; font-weight: 500; }
    html.dark .sb-item { color: #c7c8cc; font-weight: 500; }
    html.dark .sb-item:hover { background: #26272b; color: #e6e6e8; }
    html.dark .sb-item.on { background: #2c2d31; color: #f2f2f3; }
    html.dark .sb-item.on::before { display: none; }
    html.dark .sb-item.muted { color: #8a8f98; }
    html.dark .sb-ico { color: #8a8f98; }
    html.dark .sb-item.on .sb-ico, html.dark .sb-item:hover .sb-ico { color: #e6e6e8; }
    html.dark .sb-count { background: transparent; color: #6b6f76; }
    html.dark .sb-count.has { background: transparent; color: #a8aab0; }
    html.dark .sb-user, html.dark .sb-version { background: transparent; border-color: #2a2b2f; }
    html.dark .sb-user:hover, html.dark .sb-version:hover { background: #232427; }
    html.dark .sb-toggle { background: transparent; border-color: #2e2f33; color: #8a8f98; box-shadow: none; }
    html.dark .sb-toggle:hover { background: #26272b; color: #e6e6e8; }
    html.dark .sb-app { box-shadow: none; }
    html.dark .topbar, html.dark header.bg-white { background: #1f2023; border-color: #2a2b2f; }
    html.dark .site-footer { background: #1b1c1f; border-color: #2a2b2f; }

    /* buttons: one solid accent; the rest quiet */
    html.dark .btn-primary, html.dark .sb-write { background: var(--accent); color: #fff; box-shadow: none; }
    html.dark .btn-primary:hover, html.dark .sb-write:hover { background: var(--accent-hi); box-shadow: none; transform: none; }
    html.dark .btn-primary:disabled { background: #36373c; color: #8a8f98; }
    html.dark .btn-secondary { background: #26272b; border-color: #34353a; color: #dcdde0; }
    html.dark .btn-secondary:hover { background: #2c2d31; border-color: #404147; color: #f2f2f3; }
    html.dark .btn-secondary.on { background: rgba(94, 106, 210, .16); border-color: rgba(94, 106, 210, .5); color: #c9cdf5; }
    html.dark .icon-btn { color: #8a8f98; }
    html.dark .icon-btn:hover { background: #2c2d31; color: #e6e6e8; }
    html.dark .icon-btn.danger:hover { background: rgba(235, 87, 87, .14); color: #eb5757; }

    /* fields */
    html.dark .input, html.dark .adm-search, html.dark .tpick-box, html.dark .fx-box { background-color: #1b1c1f; border-color: #34353a; color: #e6e6e8; }
    html.dark .input::placeholder, html.dark .tpick-input::placeholder, html.dark .fx-input::placeholder { color: #6b6f76; }
    html.dark .input:focus, html.dark .adm-search:focus-within, html.dark .fx-box:focus-within, html.dark .tpick-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    html.dark .input:disabled { background-color: #1b1c1f; color: #6b6f76; }

    /* cards and panels: flat, a hairline border */
    html.dark .card-face, html.dark .adm-card, html.dark .adm-stat, html.dark .sheets-page { background-color: #232427; border-color: #2e2f33; box-shadow: none; }
    html.dark .popup-card, html.dark .dialog-card, html.dark .adm-panel, html.dark .sheet-share-pop, html.dark .tpick-menu, html.dark .sf-pop {
      background-color: #232427; border: 1px solid #34353a; box-shadow: 0 16px 48px rgba(0, 0, 0, .5);
    }
    html.dark .card-front:hover { border-color: #404147; box-shadow: none; }
    html.dark .preview { background: #1b1c1f; }
    html.dark .adm-stat::after { box-shadow: none; }
    html.dark .adm-stat-n { color: #f2f2f3; }

    /* chips and tags: outlined pills, quiet text; a status keeps only its colour dot */
    html.dark .chip, html.dark .tab .count, html.dark .adm-app, html.dark .stat, html.dark .import-col, html.dark .fx-chip, html.dark .adm-chip {
      background: transparent; border: 1px solid #34353a; color: #a8aab0;
    }
    html.dark .adm-chip.on, html.dark .adm-chip:hover, html.dark .fx-chip:hover { background: #2c2d31; border-color: #404147; color: #e6e6e8; }
    html.dark .adm-chip b, html.dark .adm-chip.on b { background: transparent; color: #8a8f98; }
    html.dark .access-tag { background: transparent !important; box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 35%, transparent); }
    html.dark .tp-chip { background: #2c2d31; color: #dcdde0; }

    /* tabs */
    html.dark .tab { color: #8a8f98; }
    html.dark .tab:hover { color: #e6e6e8; }
    html.dark .tab.active { color: #f2f2f3; border-bottom-color: #f2f2f3; }

    /* lists and tables: a group header a shade up, rows divided by hairlines, a quiet hover */
    html.dark .sheet-table th, html.dark .adm-table th { background: #26272b; color: #8a8f98; border-color: #2e2f33; }
    html.dark .sheet-table td, html.dark .adm-table td { border-color: #2a2b2f; }
    html.dark .sheet-table tbody tr:hover td, html.dark .adm-table tbody tr:hover td { background: #26272b; }
    html.dark .adm-table tbody tr.on td { background: #2c2d31; }
    html.dark .adm-avatar, html.dark .sb-avatar { background: #3a3b40; color: #e6e6e8; }

    /* overlays, toast, progress */
    html.dark .overlay, html.dark .dialog-overlay, html.dark .adm-backdrop.show, html.dark .sb-backdrop { background: rgba(0, 0, 0, .55); backdrop-filter: none; }
    html.dark .toast { background: #2c2d31; color: #e6e6e8; border: 1px solid #38393e; box-shadow: 0 10px 30px rgba(0, 0, 0, .5); }
    html.dark .progress::before { background: var(--accent); }
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
    /**
     * Switch light ↔ dark. from: the element clicked (the new theme spreads out from it in a circle); after(): what
     * else has to change with it (the button's icon, drawings that take the theme's colours), done in the same frame.
     * Browsers without view transitions get a short colour fade; "reduce motion" switches at once.
     */
    toggle(from, after) {
      const swap = () => {
        apply(!isDark());
        try { localStorage.setItem(KEY, isDark() ? 'dark' : 'light'); } catch (e) { /* private window: just for now */ }
        if (after) after();
      };
      const root = document.documentElement;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { swap(); return; }
      if (!document.startViewTransition) {
        root.classList.add('theme-fade');
        swap();
        clearTimeout(this.fading);
        this.fading = setTimeout(() => root.classList.remove('theme-fade'), 450);
        return;
      }
      const box = from && from.getBoundingClientRect ? from.getBoundingClientRect() : null;
      const x = box ? box.left + box.width / 2 : window.innerWidth - 40;
      const y = box ? box.top + box.height / 2 : 40;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const shift = document.startViewTransition(swap);
      shift.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
      )).catch(() => {});
    },
  };
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!saved()) apply(e.matches); });
  }
}());
