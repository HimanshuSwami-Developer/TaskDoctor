/* FlowTrace — writing assistant for text boxes. © 2026 FinDevelopers
 *
 * A text box with data-assist gets suggestions while you type, like a chat app's: a small card under it shows the
 * fixed text (removed words struck out, added words green) with Apply and Dismiss, and tone buttons (Professional,
 * Simple, Concise). Nothing is ever changed without Apply; Undo puts your words back as long as you have not typed
 * since.
 *
 * Two sources: quick checks in this file (no network, run on every pause) and, when the server has
 * ANTHROPIC_API_KEY, the AI (POST /api/assist, assist.js), which also does the tones.
 *
 * Node: require('./public/assist') → { check, diffWords } for the tests; browser: window.flowAssist.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.flowAssist = api;
}(typeof self !== 'undefined' ? self : this, () => {
  // ---------------------------------------------------------------- quick checks (no network)

  const TYPOS = {
    teh: 'the', adn: 'and', recieve: 'receive', recieved: 'received', seperate: 'separate', seperately: 'separately',
    definately: 'definitely', occured: 'occurred', occurence: 'occurrence', untill: 'until', wich: 'which', thier: 'their',
    becuase: 'because', beacuse: 'because', alot: 'a lot', accross: 'across', adress: 'address', begining: 'beginning',
    calender: 'calendar', enviroment: 'environment', existance: 'existence', goverment: 'government', recomend: 'recommend',
    refered: 'referred', succesful: 'successful', sucessful: 'successful', successfull: 'successful', tommorow: 'tomorrow',
    tomorow: 'tomorrow', wierd: 'weird', responce: 'response', functionallity: 'functionality', funtionality: 'functionality',
    acheive: 'achieve', aquire: 'acquire', arguement: 'argument', basicly: 'basically', commited: 'committed',
    completly: 'completely', concious: 'conscious', dependancy: 'dependency', dependancies: 'dependencies', desicion: 'decision',
    explaination: 'explanation', finaly: 'finally', fourty: 'forty', grammer: 'grammar', immediatly: 'immediately',
    independant: 'independent', informations: 'information', lenght: 'length', mantain: 'maintain', neccessary: 'necessary',
    necesary: 'necessary', noticable: 'noticeable', occassion: 'occasion', paramter: 'parameter', paramters: 'parameters',
    persue: 'pursue', posible: 'possible', prefered: 'preferred', priviledge: 'privilege', recieving: 'receiving',
    relevent: 'relevant', reponse: 'response', requirment: 'requirement', requirments: 'requirements', similiar: 'similar',
    sinlge: 'single', statment: 'statement', strech: 'stretch', suport: 'support', truely: 'truly', updation: 'update',
    usally: 'usually', verfied: 'verified', verfy: 'verify', wating: 'waiting', writting: 'writing', ofcourse: 'of course',
    dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", wont: "won't", isnt: "isn't", arent: "aren't",
    wasnt: "wasn't", couldnt: "couldn't", shouldnt: "shouldn't", wouldnt: "wouldn't", havent: "haven't", hasnt: "hasn't",
  };
  // words after which a full stop does not end a sentence
  const ABBREV = /(?:^|\s)(?:e\.g|i\.e|etc|vs|approx|incl|no|mr|mrs|ms|dr)\.$/i;
  const QUESTION_START = /^(what|why|how|when|where|which|who|whom|whose|should|shall|can|could|would|will|is|are|was|were|do|does|did|has|have|may|might)\b/i;

  // keep the case of the word it replaces: Teh → The, TEH → THE
  const sameCase = (from, to) => (from === from.toUpperCase() && from.length > 1 ? to.toUpperCase()
    : from[0] === from[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to);
  // a word that is code, a path, a link or a name with capitals inside (iOS, getUser, v1.2) is left alone
  const isPlainWord = (w) => /^[a-z]+(?:'[a-z]+)?$/.test(w);

  /**
   * Quick fixes → { text, changes: [{ kind, from, to, note }] } (text unchanged and no changes when it reads fine).
   * opts.question: the box holds a question, so a one-line question gets its "?".
   */
  function check(input, opts = {}) {
    const original = String(input == null ? '' : input);
    const changes = [];
    const note = (kind, from, to, why) => { if (changes.length < 20) changes.push({ kind, from, to, note: why }); };
    // links and `code` are kept out of every rule
    const kept = [];
    let t = original.replace(/`[^`]*`|\b[a-z][a-z0-9+.-]*:\/\/\S+|\bwww\.\S+/gi, (m) => { kept.push(m); return `\u0000${kept.length - 1}\u0000`; });

    t = t.replace(/([^\s\n])[ \t]{2,}(?=\S)/g, (m, a) => { note('punctuation', m, `${a} `, 'Extra spaces'); return `${a} `; });
    t = t.replace(/(\w)[ \t]+([,;:!?])(?=\s|$|[A-Za-z])/g, (m, a, p) => { note('punctuation', m, a + p, 'No space before punctuation'); return a + p; });
    t = t.replace(/([A-Za-z]),(?=[A-Za-z])/g, (m, a) => { note('punctuation', m, `${a}, `, 'Space after a comma'); return `${a}, `; });
    t = t.replace(/\bi\b(?!\.)('m|'ve|'ll|'d)?/g, (m, rest) => { note('grammar', m, `I${rest || ''}`, '"I" is always a capital'); return `I${rest || ''}`; });
    t = t.replace(/\b[Ii]m\b/g, (m) => { note('spelling', m, "I'm", 'Missing apostrophe'); return "I'm"; });
    t = t.replace(/\b[A-Za-z]+\b/g, (w) => {
      const fix = TYPOS[w.toLowerCase()];
      if (!fix || (w !== w.toLowerCase() && !/^[A-Z][a-z]*$/.test(w) && w !== w.toUpperCase())) return w;
      const to = sameCase(w, fix);
      note('spelling', w, to, 'Spelling');
      return to;
    });
    t = t.replace(/\b([A-Za-z]+)(\s+)\1\b/gi, (m, w, space) => {
      if (/^(that|had|ha|bye|no|very)$/i.test(w)) return m; // "that that", "had had" can be right
      note('grammar', m, w, 'Repeated word');
      return w;
    });
    // a capital at the start of the text and of each sentence (plain words only)
    t = t.replace(/(^|[.!?]\s+|\n\s*)([a-z]+(?:'[a-z]+)?)(?=[\s,;:!?]|\.(?:\s|$)|$)/g, (m, before, w, offset, all) => {
      if (!isPlainWord(w) || w.length < 2) return m;
      if (before && /^[.]/.test(before) && ABBREV.test(all.slice(0, offset + 1))) return m;
      const to = w[0].toUpperCase() + w.slice(1);
      note('grammar', w, to, 'Capital at the start of a sentence');
      return before + to;
    });
    // a one-line question ends with "?"
    if (opts.question && !t.includes('\n') && t.length <= 200 && QUESTION_START.test(t.trim()) && /[A-Za-z0-9)]$/.test(t.trim())) {
      const last = t.trim().split(/\s+/).pop();
      note('punctuation', last, `${last}?`, 'A question ends with "?"');
      t = `${t.trim()}?`;
    }
    t = t.replace(/\u0000(\d+)\u0000/g, (m, i) => kept[Number(i)]);
    return t === original ? { text: original, changes: [] } : { text: t, changes };
  }

  // ---------------------------------------------------------------- word diff (what the card shows)

  const tokens = (s) => String(s).match(/\s+|[A-Za-z0-9_'’-]+|[^\sA-Za-z0-9_'’-]/g) || [];

  /** [{ type: 'same' | 'del' | 'add', text }] turning a into b, word by word (longest common subsequence) */
  function diffWords(a, b) {
    const x = tokens(a);
    const y = tokens(b);
    if (x.length * y.length > 250000) return [{ type: 'del', text: a }, { type: 'add', text: b }];
    const n = x.length;
    const m = y.length;
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i -= 1) for (let j = m - 1; j >= 0; j -= 1) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [];
    const push = (type, text) => { const last = out[out.length - 1]; if (last && last.type === type) last.text += text; else out.push({ type, text }); };
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (x[i] === y[j]) { push('same', x[i]); i += 1; j += 1; } else if (L[i + 1][j] >= L[i][j + 1]) { push('del', x[i]); i += 1; } else { push('add', y[j]); j += 1; }
    }
    while (i < n) { push('del', x[i]); i += 1; }
    while (j < m) { push('add', y[j]); j += 1; }
    return out;
  }

  const api = { check, diffWords };
  if (typeof window === 'undefined' || !window.jQuery) return api;

  // ---------------------------------------------------------------- the card under a text box (browser)

  const $ = window.jQuery;
  const TONES = [['professional', 'Professional'], ['simple', 'Simple'], ['concise', 'Concise']];
  const WAIT = 900; // ms after the last key before checking
  const esc = (s) => $('<div>').text(s == null ? '' : s).html();
  const state = new WeakMap(); // text box → { timer, seq, dismissed: Set, sugg, undo, busy, error }
  let server = null; // GET /api/assist → { ai, tones, maxText }, asked once
  const status = () => {
    if (!server) server = $.ajax({ method: 'GET', url: '/api/assist' }).then((r) => r, () => $.Deferred().resolve({ ai: false, maxText: 2000 }));
    return server;
  };
  const stateOf = (el) => {
    if (!state.has(el)) state.set(el, { timer: null, seq: 0, dismissed: new Set(), sugg: null, undo: null, busy: '', error: '' });
    return state.get(el);
  };

  // the card sits in the box's .assist-wrap (made around it when missing)
  function cardOf(el) {
    let $wrap = $(el).closest('.assist-wrap');
    if (!$wrap.length) $wrap = $(el).wrap('<div class="assist-wrap"></div>').parent();
    let $card = $wrap.children('.assist-pop');
    if (!$card.length) $card = $('<div class="assist-pop" role="status" aria-live="polite" hidden></div>').appendTo($wrap);
    return $card;
  }

  function render(el) {
    const s = stateOf(el);
    const $card = cardOf(el);
    const words = el.value.trim().split(/\s+/).filter(Boolean).length;
    status().done((srv) => {
      const tonesOn = srv.ai && words >= 3 && el === document.activeElement;
      const showUndo = s.undo && el.value === s.undo.after;
      if (!s.sugg && !s.busy && !s.error && !showUndo && !tonesOn) { $card.attr('hidden', true).empty(); return; }
      const diff = s.sugg ? diffWords(el.value, s.sugg.text).map((p) => (p.type === 'same' ? esc(p.text)
        : `<${p.type === 'del' ? 'del' : 'ins'}>${esc(p.text)}</${p.type === 'del' ? 'del' : 'ins'}>`)).join('') : '';
      const notes = s.sugg ? [...new Set(s.sugg.changes.map((c) => c.note).filter(Boolean))].slice(0, 3) : [];
      $card.removeAttr('hidden').html(`
        ${s.sugg ? `
        <div class="assist-row">
          <span class="assist-spark" aria-hidden="true">✦</span>
          <div class="assist-text">
            <p class="assist-label">${s.sugg.tone ? `${esc(TONES.find(([k]) => k === s.sugg.tone)[1])} version` : 'Suggestion'}${s.sugg.source === 'ai' ? ' · AI' : ''}</p>
            <p class="assist-diff">${diff}</p>
            ${notes.length ? `<p class="assist-notes">${notes.map(esc).join(' · ')}</p>` : ''}
          </div>
        </div>
        <div class="assist-actions">
          <button type="button" class="assist-apply" data-assist-apply>Apply</button>
          <button type="button" class="assist-btn" data-assist-dismiss>Dismiss</button>
        </div>` : ''}
        ${s.busy ? `<p class="assist-busy"><span class="assist-dots"><i></i><i></i><i></i></span> ${esc(s.busy)}</p>` : ''}
        ${s.error ? `<p class="assist-error">${esc(s.error)} <button type="button" class="assist-btn" data-assist-retry>Retry</button></p>` : ''}
        ${showUndo ? `<p class="assist-applied">Applied. <button type="button" class="assist-btn" data-assist-undo>Undo</button></p>` : ''}
        ${tonesOn ? `<div class="assist-tones"><span>Tone</span>${TONES.map(([k, label]) => `
          <button type="button" class="assist-tone ${s.sugg && s.sugg.tone === k ? 'on' : ''}" data-assist-tone="${k}" ${s.busy ? 'disabled' : ''}>${label}</button>`).join('')}</div>` : ''}`);
    });
  }

  // a suggestion for exactly this text, unless it was dismissed for it
  function offer(el, text, sugg) {
    const s = stateOf(el);
    if (el.value !== text) return false; // typed on meanwhile: this answer is stale
    if (!sugg || sugg.text === text || (!sugg.tone && s.dismissed.has(text))) { s.sugg = null; return false; }
    s.sugg = { ...sugg, from: text };
    return true;
  }

  // quick checks at once, then the AI (when set up) for anything they cannot see
  function run(el) {
    const s = stateOf(el);
    const text = el.value;
    s.error = '';
    if (!text.trim() || s.dismissed.has(text)) { s.sugg = null; s.busy = ''; render(el); return; }
    const quick = check(text, { question: $(el).data('assist') === 'question' });
    offer(el, text, quick.changes.length ? { ...quick, source: 'local' } : null);
    render(el);
    status().done((srv) => {
      if (!srv.ai || text.trim().length < 8 || text.length > srv.maxText) return;
      const seq = ++s.seq;
      s.busy = 'Checking…';
      render(el);
      $.ajax({ method: 'POST', url: '/api/assist', contentType: 'application/json', data: JSON.stringify({ text }) })
        .done((r) => {
          if (seq !== s.seq) return;
          s.busy = '';
          // the AI reads better than the quick checks: when it finds nothing to fix, their guess goes too
          if (!r.unchanged) offer(el, text, { text: r.text, changes: r.changes, source: 'ai' });
          else if (s.sugg && s.sugg.source === 'local' && !s.sugg.tone) s.sugg = null;
          render(el);
        })
        .fail((xhr) => {
          if (seq !== s.seq) return;
          s.busy = '';
          // the quick checks still stand; a busy AI is only a note
          s.error = xhr.status === 503 || xhr.status === 429 ? '' : ((xhr.responseJSON && xhr.responseJSON.error) || 'Could not check the text.');
          render(el);
        });
    });
  }

  function tone(el, which) {
    const s = stateOf(el);
    const text = el.value;
    const seq = ++s.seq;
    s.busy = `Writing a ${which} version…`;
    s.error = '';
    render(el);
    $.ajax({ method: 'POST', url: '/api/assist', contentType: 'application/json', data: JSON.stringify({ text, tone: which }) })
      .done((r) => {
        if (seq !== s.seq) return;
        s.busy = '';
        if (!offer(el, text, { text: r.text, changes: r.changes, source: 'ai', tone: which })) s.error = r.unchanged ? 'It already reads that way.' : '';
        render(el);
      })
      .fail((xhr) => {
        if (seq !== s.seq) return;
        s.busy = '';
        s.error = (xhr.responseJSON && xhr.responseJSON.error) || 'Could not rewrite the text.';
        render(el);
      });
  }

  // put text in the box as if typed (other code listening to "input" sees it), without checking it again
  function put(el, text) {
    const s = stateOf(el);
    el.value = text;
    s.skip = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    el.setSelectionRange(text.length, text.length);
  }

  const boxOf = (btn) => $(btn).closest('.assist-wrap').find('[data-assist]')[0];

  $(document)
    .on('input', '[data-assist]', function () {
      const s = stateOf(this);
      if (s.skip !== undefined && s.skip === this.value) { s.skip = undefined; render(this); return; }
      s.skip = undefined;
      s.seq += 1; // an answer still on its way is for older words
      s.busy = '';
      if (s.sugg && this.value !== s.sugg.from) s.sugg = null;
      if (s.undo && this.value !== s.undo.after) s.undo = null;
      clearTimeout(s.timer);
      render(this);
      s.timer = setTimeout(() => run(this), WAIT);
    })
    .on('focus', '[data-assist]', function () {
      const s = stateOf(this);
      if (this.value.trim() && !s.sugg && !s.busy) { clearTimeout(s.timer); s.timer = setTimeout(() => run(this), 300); } else render(this);
    })
    .on('blur', '[data-assist]', function () {
      // tones show only while you write here; keep the card while its own buttons are used
      setTimeout(() => { if (this.isConnected && !$(document.activeElement).closest('.assist-pop').length) render(this); }, 150);
    })
    .on('mousedown', '.assist-pop button', (e) => e.preventDefault()) // keep the cursor in the box
    .on('click', '[data-assist-apply]', function () {
      const el = boxOf(this);
      const s = stateOf(el);
      if (!s.sugg || el.value !== s.sugg.from) { s.sugg = null; render(el); return; }
      s.undo = { before: el.value, after: s.sugg.text };
      s.sugg = null;
      put(el, s.undo.after);
      render(el);
    })
    .on('click', '[data-assist-undo]', function () {
      const el = boxOf(this);
      const s = stateOf(el);
      if (!s.undo || el.value !== s.undo.after) { s.undo = null; render(el); return; }
      const { before } = s.undo;
      s.undo = null;
      s.dismissed.add(before); // you wanted your words: do not offer the same fix again
      put(el, before);
      render(el);
    })
    .on('click', '[data-assist-dismiss]', function () {
      const el = boxOf(this);
      const s = stateOf(el);
      s.dismissed.add(el.value);
      s.sugg = null;
      s.error = '';
      render(el);
      el.focus();
    })
    .on('click', '[data-assist-retry]', function () { const el = boxOf(this); run(el); })
    .on('click', '[data-assist-tone]', function () { tone(boxOf(this), $(this).data('assist-tone')); });

  // Escape closes the card first (not the popup it is in)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !e.target.matches || !e.target.matches('[data-assist]')) return;
    const s = state.get(e.target);
    if (!s || !(s.sugg || s.error)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    s.dismissed.add(e.target.value);
    s.sugg = null;
    s.error = '';
    render(e.target);
  }, true);

  // a form that is sent drops the card's state for its boxes
  api.reset = (el) => { if (el && state.has(el)) { clearTimeout(state.get(el).timer); state.delete(el); } };
  return api;
}));
