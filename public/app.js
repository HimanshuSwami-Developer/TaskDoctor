/* Task Doctor — jQuery front-end */
$(function () {
  const COLORS = ['slate', 'amber', 'sky', 'indigo', 'violet', 'pink', 'red', 'teal', 'green'];
  const WIREFRAMES = { form: 'Form', list: 'List', dashboard: 'Dashboard', detail: 'Detail' };
  const PRIORITY = {
    urgent: { label: 'Urgent', rank: 0 },
    high: { label: 'High', rank: 1 },
    medium: { label: 'Medium', rank: 2 },
    low: { label: 'Low', rank: 3 },
  };

  const PATHS = {
    edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    close: 'M18 6 6 18M6 6l12 12',
    expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    flip: 'M1 4v6h6M3.5 15a9 9 0 1 0 2.1-9.4L1 10',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6',
    note: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    locate: 'M12 2v4M12 18v4M2 12h4M18 12h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    plus: 'M12 5v14M5 12h14',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  };
  const icon = (name, size = 16) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;

  let products = [];
  let statuses = []; // issue status tags, incl. removed ones (flag deleted) that some issues may still use
  let productId = storage('get', 'productId'); // remembered per browser
  let modules = []; // modules of the selected product
  let allModules = []; // modules of every product (lookups, copies, links)
  let activeId = null;
  let openId = null; // screen in the large popup
  let sheetId = null; // screen whose issue sheet is open
  let sheetFilter = 'all';
  let bugsView = null; // { status, filter } of the issues-by-status popup; status '' = every issue
  let dragging = false;
  let flashId = null; // newly added issue
  let refocus = null; // keep the cursor in the add box after adding
  const expanded = new Set(); // issues showing full text
  const flipped = new Set(); // cards turned to the issues side

  // ---------------------------------------------------------------- helpers

  function storage(op, key, value) {
    try {
      return op === 'get' ? localStorage.getItem(`taskSheet.${key}`) : localStorage.setItem(`taskSheet.${key}`, value);
    } catch (e) {
      return null;
    }
  }

  // Page scroll comes back once no popup, sheet or dialog is open.
  const unlockScroll = () => {
    if (!$('.overlay:not(.hidden), .sheet:not(.hidden), .dialog-overlay:not(.hidden)').length) $('body').removeClass('overflow-hidden');
  };
  const esc = (s) => $('<div>').text(s == null ? '' : s).html();
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const allScreens = (list) => list.flatMap((m) => m.flows).flatMap((f) => f.screens);
  const allIssues = () => allScreens(allModules).flatMap((s) => s.comments);
  const findScreen = (id) => allScreens(allModules).find((s) => s.id === id);
  const findFlow = (id) => allModules.flatMap((m) => m.flows).find((f) => f.id === id);
  const productOf = (moduleId) => products.find((p) => p.modules.some((m) => m.id === moduleId));
  const prio = (c) => (PRIORITY[c.priority] ? c.priority : 'medium');
  const isCondition = (s) => s.type === 'condition';
  const onlyScreens = (list) => list.filter((s) => !isCondition(s));
  const statusOf = (id) => statuses.find((x) => x.id === id) || { id, label: id, color: 'slate', deleted: true };
  const activeStatuses = () => statuses.filter((x) => !x.deleted);

  // Branch colour from its label: success / pending / fail / other
  function tone(label) {
    const l = (label || '').toLowerCase();
    if (/success|approved|active|paid|done|yes/.test(l)) return 'success';
    if (/pending|processing|progress|wait/.test(l)) return 'pending';
    if (/fail|reject|error|declin|cancel|expired|\bno\b/.test(l)) return 'fail';
    return 'other';
  }

  // Conditions that lead to this screen: [{ condition, branch }]
  function incomingFor(id) {
    const out = [];
    allScreens(allModules).filter(isCondition).forEach((c) =>
      (c.branches || []).forEach((b) => { if (b.targetId === id) out.push({ condition: c, branch: b }); }));
    return out;
  }

  // Where else a copied screen is used: [{ screen, flow, module, product }]
  function linkedCopies(s) {
    if (!s.linkId) return [];
    const out = [];
    products.forEach((p) => p.modules.forEach((m) => m.flows.forEach((f) => f.screens.forEach((x) => {
      if (x.linkId === s.linkId && x.id !== s.id) out.push({ screen: x, flow: f, module: m, product: p });
    }))));
    return out;
  }

  // ---------------------------------------------------------------- loading indicators
  // Every request shows the top progress bar; the control that started it shows a spinner and is disabled.

  let pending = 0;
  let barTimer = null;
  let trigger = null; // element of the click / change / submit currently being handled

  ['click', 'change', 'submit'].forEach((type) => document.addEventListener(type, (e) => {
    trigger = e.target;
    setTimeout(() => { if (trigger === e.target) trigger = null; }, 0);
  }, true));

  function busyTarget(el) {
    if (!el || !el.closest) return null;
    if (el.tagName === 'FORM') return el.querySelector('button:not([type="button"])');
    return el.closest('button, label, select, input, textarea');
  }

  function setBusy(el, on) {
    if (!el) return;
    el.classList.toggle('is-busy', on);
    if (el.tagName !== 'LABEL') el.disabled = on;
  }

  function startLoading() {
    if (pending++ === 0) {
      clearTimeout(barTimer);
      barTimer = setTimeout(() => $('#progress').addClass('on'), 120); // skip the bar for very fast requests
    }
  }

  function stopLoading() {
    pending = Math.max(0, pending - 1);
    if (!pending) {
      clearTimeout(barTimer);
      $('#progress').removeClass('on');
    }
  }

  function errorText(xhr) {
    if (xhr && xhr.status === 404) return 'This item no longer exists. It may have been deleted. Refresh the page and try again.';
    return (xhr && xhr.responseJSON && xhr.responseJSON.error) || 'Could not reach the server. Please try again.';
  }

  // opts.silent: the caller shows the error itself (e.g. inside a dialog)
  function api(method, url, data, busyEl, opts = {}) {
    const el = busyEl || busyTarget(trigger);
    setBusy(el, true);
    startLoading();
    return $.ajax({ method, url, contentType: 'application/json', data: data && JSON.stringify(data) })
      .always(() => { setBusy(el, false); stopLoading(); })
      .fail((xhr) => {
        if (opts.silent) return;
        if (xhr.status === 0 && method === 'GET') return; // offline on load: shown in the page instead
        dialog.alert(errorText(xhr));
      });
  }

  // ---------------------------------------------------------------- dialogs (instead of alert / confirm / prompt)
  //
  // dialog.open({ title, message, fields, confirmText, danger, onConfirm }) → Promise(values | null)
  //   fields:    [{ name, label, value, placeholder, required }]
  //   onConfirm: (values) => jqXHR. The dialog shows a spinner, closes when it succeeds,
  //              and stays open with the server's error message when it fails.

  const dialog = (() => {
    let resolver = null;
    let busy = false;
    const isOpen = () => !$('#dialog').hasClass('hidden');

    function close(value) {
      $('#dialog').addClass('hidden');
      unlockScroll();
      const resolve = resolver;
      resolver = null;
      busy = false;
      if (resolve) resolve(value);
    }

    function open({ title, message = '', fields = [], confirmText = 'OK', cancelText = 'Cancel', danger = false, hideCancel = false, onConfirm = null }) {
      if (resolver) close(null);
      const badge = danger ? `<span class="dialog-icon danger">${icon('trash', 18)}</span>` : '';
      $('#dialogForm').html(`
        <div class="flex items-start gap-3 px-5 pt-5">
          ${badge}
          <div class="min-w-0 flex-1">
            <h3 id="dialogTitle" class="text-base font-semibold text-slate-900">${esc(title)}</h3>
            ${message ? `<p class="mt-1 text-sm leading-relaxed text-slate-600">${esc(message)}</p>` : ''}
          </div>
        </div>
        ${fields.length ? `<div class="space-y-3 px-5 pt-4">${fields.map((f) => `
          <label class="block">
            <span class="field-label">${esc(f.label)}${f.required ? '' : ' <span class="font-normal text-slate-400">(optional)</span>'}</span>
            <input class="input w-full" name="${f.name}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 200}" autocomplete="off" ${f.required ? 'data-required' : ''}>
          </label>`).join('')}</div>` : ''}
        <p class="dialog-error mx-5 mt-3 hidden"></p>
        <div class="dialog-actions">
          ${hideCancel ? '' : `<button type="button" class="btn-secondary" data-dialog-cancel>${esc(cancelText)}</button>`}
          <button type="submit" class="${danger ? 'btn-danger-solid' : 'btn-primary'}">${esc(confirmText)}</button>
        </div>`);
      $('#dialogForm').data({ fields, onConfirm });
      $('#dialog').removeClass('hidden');
      $('body').addClass('overflow-hidden');
      setTimeout(() => {
        const input = $('#dialogForm input')[0];
        if (input) { input.focus(); input.select(); } else $('#dialogForm [type=submit]').trigger('focus');
      }, 30);
      return new Promise((resolve) => { resolver = resolve; });
    }

    function showError(msg) {
      $('#dialogForm .dialog-error').text(msg).removeClass('hidden');
    }

    $('#dialogForm').on('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      const { fields, onConfirm } = $(this).data();
      const values = {};
      (fields || []).forEach((f) => { values[f.name] = $(this).find(`[name="${f.name}"]`).val().trim(); });
      const missing = (fields || []).find((f) => f.required && !values[f.name]);
      if (missing) {
        showError(`${missing.label} is required.`);
        $(this).find(`[name="${missing.name}"]`).trigger('focus');
        return;
      }
      if (!onConfirm) { close(fields && fields.length ? values : true); return; }
      const submit = $(this).find('[type=submit]')[0];
      busy = true;
      setBusy(submit, true);
      $(this).find('[data-dialog-cancel], input').prop('disabled', true);
      onConfirm(values)
        .done(() => close(fields && fields.length ? values : true))
        .fail((xhr) => {
          busy = false;
          setBusy(submit, false);
          $(this).find('[data-dialog-cancel], input').prop('disabled', false);
          showError(errorText(xhr));
        });
    });
    $(document).on('click', '[data-dialog-cancel]', () => { if (!busy) close(null); });
    $('#dialog').on('mousedown', function (e) { if (e.target === this && !busy) close(null); });

    return {
      open,
      isOpen,
      cancel: () => { if (!busy) close(null); },
      alert: (message, title = 'Something went wrong') => open({ title, message, confirmText: 'OK', hideCancel: true }),
      confirm: (opts) => open(opts),
    };
  })();

  // Ask for one or more text values, then save them.
  function ask({ title, fields, confirmText = 'Save', save }) {
    return dialog.open({ title, fields, confirmText, onConfirm: (values) => save(values) });
  }
  const QUIET = { silent: true };

  function toast(msg) {
    $('#toast').text(msg).removeClass('hidden');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => $('#toast').addClass('hidden'), 1500);
  }

  // Issue status date: Pending shows today's date; every other status keeps the date it was set.
  function dateText(c) {
    if (c.status === 'pending') return `Today · ${fmtDate(new Date())}`;
    const word = { testing: 'Released', complete: 'Completed' }[c.status] || statusOf(c.status).label;
    return c.statusDate ? `${word} ${fmtDate(c.statusDate)}` : word;
  }

  // Open issues first (urgent → low), fixed issues last.
  function sortIssues(list) {
    return list.slice().sort((a, b) =>
      (a.resolved - b.resolved) || (PRIORITY[prio(a)].rank - PRIORITY[prio(b)].rank) || a.createdAt.localeCompare(b.createdAt));
  }

  function topPriority(s) {
    const open = sortIssues(s.comments.filter((c) => !c.resolved));
    return open.length ? prio(open[0]) : null;
  }

  // ---------------------------------------------------------------- wireframes + device frames

  function wireframe(type) {
    const head = '<div class="wf-head"><i></i><b></b></div>';
    const text = '<div class="wf-text"></div>';
    const row = '<div class="wf-row"><div class="wf-avatar"></div><div class="wf-lines"><div class="wf-text"></div><div class="wf-text short"></div></div></div>';
    const pad = (html) => `<div class="wf-pad">${html}</div>`;
    const templates = {
      form: pad('<div class="wf-title"></div>' + text + '<div class="wf-input"></div>'.repeat(3) + '<div class="wf-btn"></div>'),
      list: pad('<div class="wf-input"></div>' + row.repeat(6)),
      dashboard: pad('<div class="wf-title"></div><div class="wf-grid">' + '<div class="wf-tile"></div>'.repeat(4) + '</div><div class="wf-chart"></div>' + row.repeat(2)),
      detail: '<div class="wf-hero"></div>' + pad('<div class="wf-title"></div>' + text.repeat(4) + '<div class="wf-btn"></div>'),
    };
    return head + (templates[type] || templates.form);
  }

  // Cloudinary on-the-fly resize/compress: small for cards, full for the large view
  function imageUrl(url, size) {
    const t = size === 'sm' ? 'f_auto,q_auto,w_640' : 'f_auto,q_auto';
    return url.includes('/image/upload/') ? url.replace('/image/upload/', `/image/upload/${t}/`) : url;
  }

  function device(s, size) {
    // placeholder shimmer until the image has loaded
    const content = s.image
      ? `<img src="${esc(imageUrl(s.image, size))}" alt="${esc(s.name)}" loading="lazy" onload="this.parentNode.classList.add('loaded')" onerror="this.parentNode.classList.add('loaded')">`
      : wireframe(s.wireframe || 'form');
    const screenClass = s.image ? 'screen has-img' : 'screen';
    if (s.device === 'web') {
      return `<div class="device web ${size}"><div class="browser-bar"><i></i><i></i><i></i><span>${esc(s.page)}</span></div><div class="${screenClass}">${content}</div></div>`;
    }
    return `<div class="device app ${size}"><div class="${screenClass}"><div class="notch"></div>${content}</div></div>`;
  }

  function deviceToggle(s) {
    const d = s.device === 'web' ? 'web' : 'app';
    return `<div class="seg">
      <button data-device="app" data-id="${s.id}" class="${d === 'app' ? 'on' : ''}">App</button>
      <button data-device="web" data-id="${s.id}" class="${d === 'web' ? 'on' : ''}">Web</button>
    </div>`;
  }

  const fileInput = (s) => `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" data-upload="${s.id}">`;

  // Status of one issue. An issue still on a removed status keeps showing it until another one is picked.
  function statusSelect(c, extra = '') {
    const current = statusOf(c.status);
    const options = current.deleted ? [current, ...activeStatuses()] : activeStatuses();
    return `<select class="status st-${current.color} ${extra}" data-status="${c.id}" title="${esc(dateText(c))}">
      ${options.map((x) => `<option value="${esc(x.id)}" ${x.id === c.status ? 'selected' : ''}>${esc(x.label)}${x.deleted ? ' (removed)' : ''}</option>`).join('')}
    </select>`;
  }

  // Several people per issue: chips + a text box (Enter or comma adds, × removes).
  // data-people holds the issue id when the chips save straight away (issue sheet); empty in add forms.
  const chip = (name) => `<span class="person">${esc(name)}<button type="button" data-remove-person title="Remove">${icon('close', 10)}</button></span>`;
  const peopleBox = (names, commentId = '', extra = '') => `
    <div class="people ${extra}" data-people="${commentId}">
      ${(names || []).map(chip).join('')}
      <input class="people-input" list="people" placeholder="${names && names.length ? 'Add person' : commentId ? 'Unassigned' : 'Assign to'}" maxlength="60" autocomplete="off">
    </div>`;
  const chipsOf = ($box) => $box.find('.person').map((i, el) => $(el).text().trim()).get();
  // chips plus anything typed but not yet added
  const peopleOf = ($box) => [...new Set(chipsOf($box).concat(($box.find('.people-input').val() || '').split(',').map((x) => x.trim()).filter(Boolean)))];

  const priorityOptions = (selected) =>
    Object.entries(PRIORITY).map(([k, v]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${v.label}</option>`).join('');

  // ---------------------------------------------------------------- issues (card back + popup)

  function issueRow(c, big) {
    const p = prio(c);
    const full = big || expanded.has(c.id);
    return `
      <li class="bug ${p} ${c.resolved ? 'fixed' : ''} ${c.id === flashId ? 'new' : ''}">
        <input type="checkbox" class="mt-0.5 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''} title="Mark fixed">
        <div class="min-w-0 flex-1">
          <div class="bug-meta">
            <button class="prio-tag ${p}" data-cycle-priority="${c.id}" title="Change priority"><span class="dot bg-${p}"></span>${PRIORITY[p].label}</button>
            ${statusSelect(c, 'sm')}
            ${(c.assignees || []).map((n) => `<span class="assignee">${esc(n)}</span>`).join('')}
            ${c.remarks && !full ? `<span class="text-slate-400" title="Has remarks">${icon('note', 12)}</span>` : ''}
          </div>
          <p class="bug-text ${full ? '' : 'clamp'}" ${big ? '' : `data-expand="${c.id}"`}>${esc(c.text)}</p>
          ${c.remarks && full ? `<p class="remark">${esc(c.remarks)}</p>` : ''}
        </div>
        <button class="icon-btn sm danger" data-delete-comment="${c.id}" title="Delete">${icon('close', 12)}</button>
      </li>`;
  }

  function issuesPanel(s, big) {
    const issues = sortIssues(s.comments);
    const open = issues.filter((c) => !c.resolved).length;
    return `
      <div class="issues ${big ? 'big' : ''}">
        <div class="issues-head">
          <span class="font-semibold text-slate-900">Issues</span>
          <span class="text-slate-500">${open} open · ${issues.length} total</span>
          <button class="icon-btn ml-auto" data-open-sheet="${s.id}" title="Open issue sheet">${icon('expand')}</button>
          ${big ? '' : `<button class="icon-btn" data-flip="${s.id}" title="Back to screen">${icon('flip')}</button>`}
        </div>
        <ul class="bug-list" data-list="${s.id}">
          ${issues.map((c) => issueRow(c, big)).join('') || '<li class="empty">No issues</li>'}
        </ul>
        <form class="add-comment bug-add" data-screen="${s.id}">
          <select name="priority" class="prio-select" title="Priority">${priorityOptions('medium')}</select>
          <input name="text" class="input min-w-0 flex-1 text-sm" placeholder="Add issue" autocomplete="off">
          <button class="btn-primary px-3">Add</button>
          ${peopleBox([], '', 'w-full text-xs')}
        </form>
      </div>`;
  }

  // ---------------------------------------------------------------- board

  let loaded = false;

  function load() {
    return $.when(api('GET', '/api/board'), api('GET', '/api/statuses'))
      .done(([data], [tags]) => {
        loaded = true;
        products = data;
        statuses = tags;
        allModules = products.flatMap((p) => p.modules);
        selectProduct(products.some((p) => p.id === productId) ? productId : products[0] && products[0].id);
        render();
        if (!$('#statusModal').hasClass('hidden')) renderStatuses();
        if (bugsView) renderBugs();
      })
      .fail(() => {
        if (loaded) return;
        $('#products, #summary').empty();
        $('#board').html(`
          <div class="mx-auto mt-16 max-w-sm text-center">
            <p class="text-slate-600">Could not load Task Doctor.</p>
            <button class="btn-primary mt-4" data-action="retry">Retry</button>
          </div>`);
      });
  }

  function selectProduct(id) {
    productId = id || null;
    if (productId) storage('set', 'productId', productId);
    const product = products.find((p) => p.id === productId);
    modules = product ? product.modules : [];
    if (!modules.some((m) => m.id === activeId)) activeId = modules[0] ? modules[0].id : null;
  }

  function renderProducts() {
    const current = products.find((p) => p.id === productId);
    $('#products').html(
      products.map((p) =>
        `<button class="product ${p.id === productId ? 'active' : ''}" data-product="${p.id}">${esc(p.name)}</button>`).join('') +
      (current ? `
        <button class="icon-btn" data-rename-product="${current.id}" title="Rename product">${icon('edit', 14)}</button>
        <button class="icon-btn danger" data-delete-product="${current.id}" title="Delete product">${icon('trash', 14)}</button>` : '') +
      '<button class="tab-add" data-action="add-product">+ Add product</button>');
  }

  function render(opts = {}) {
    const saved = captureScroll();
    if (openId) renderPopup();
    if (sheetId && !opts.skipSheet) renderSheet();

    renderProducts();
    const screens = onlyScreens(allScreens(modules));
    const issues = screens.flatMap((s) => s.comments);
    const count = (st) => issues.filter((c) => c.status === st).length;
    const openIssues = issues.filter((c) => !c.resolved).length;
    const shown = statuses.filter((x) => !x.deleted || count(x.id));
    $('#summary').html(
      shown.map((x) => `<button class="stat" data-bugs="${esc(x.id)}" title="${esc(x.label)} issues"><span class="dot st st-${x.color}"></span>${esc(x.label)} <b>${count(x.id)}</b></button>`).join('') +
      `<button class="stat" data-bugs="" title="All open issues"><span class="dot dot-issues"></span>Open issues <b>${openIssues}</b></button>` +
      '<button class="tab-add" data-action="manage-statuses">Statuses</button>');

    $('#tabs').html(productId ? modules.map((m) =>
      `<button class="tab ${m.id === activeId ? 'active' : ''}" data-tab="${m.id}">${esc(m.name)}<span class="count">${onlyScreens(allScreens([m])).length}</span></button>`
    ).join('') + '<button class="tab-add" data-action="add-module">+ Add module</button>' : '');

    if (!productId) {
      $('#board').html(`
        <div class="mx-auto mt-16 max-w-sm text-center">
          <p class="text-slate-500">No products yet. Add one, e.g. Finzoom, Findost or IPO.</p>
          <button class="btn-primary mt-4" data-action="add-product">Add product</button>
        </div>`);
      afterRender(saved);
      return;
    }

    const m = modules.find((x) => x.id === activeId);
    if (!m) {
      $('#board').html(`
        <div class="mx-auto mt-16 max-w-sm text-center">
          <p class="text-slate-500">No modules yet.</p>
          <button class="btn-primary mt-4" data-action="add-module">Add module</button>
        </div>`);
      afterRender(saved);
      return;
    }

    const mScreens = onlyScreens(allScreens([m]));
    const mIssues = mScreens.flatMap((s) => s.comments);
    const done = mIssues.filter((c) => c.resolved).length;
    const pct = mIssues.length ? Math.round((done / mIssues.length) * 100) : 0;

    $('#board').html(`
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">${esc(m.name)}</h2>
          <p class="text-sm text-slate-500">${m.flows.length} flows · ${mScreens.length} screens</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-600">
          <div class="h-2 w-40 overflow-hidden rounded-full bg-slate-200"><div class="h-full bg-green-600" style="width:${pct}%"></div></div>
          <span>${done}/${mIssues.length} issues complete</span>
        </div>
        <div class="ml-auto flex gap-2">
          <button class="btn-secondary" data-rename-module="${m.id}">Rename</button>
          <button class="btn-danger" data-delete-module="${m.id}">Delete</button>
          <button class="btn-primary" data-action="add-flow" data-module="${m.id}">+ Add flow</button>
        </div>
      </div>
      ${m.flows.map(flowHtml).join('') || '<p class="py-10 text-center text-slate-500">No flows in this module.</p>'}
    `);
    initDragging();
    afterRender(saved);
  }

  function flowHtml(f) {
    const screens = onlyScreens(f.screens);
    const issues = screens.flatMap((s) => s.comments);
    const done = issues.filter((c) => c.resolved).length;
    return `
      <section class="flow">
        <div class="flow-head">
          <h3 class="text-base font-semibold text-slate-900">${esc(f.name)}</h3>
          <span class="text-sm text-slate-500">${screens.length} screens · ${done}/${issues.length} issues complete</span>
          <button class="icon-btn" data-rename-flow="${f.id}" title="Rename flow">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-delete-flow="${f.id}" title="Delete flow">${icon('trash', 14)}</button>
          <div class="ml-auto flex gap-1">
            <button class="icon-btn border border-slate-200 bg-white" data-scroll="${f.id}" data-dir="-1" title="Scroll left">${icon('left')}</button>
            <button class="icon-btn border border-slate-200 bg-white" data-scroll="${f.id}" data-dir="1" title="Scroll right">${icon('right')}</button>
          </div>
        </div>
        <div class="screens" data-flow="${f.id}">
          ${f.screens.map(screenHtml).join('')}
          <form class="add-screen" data-flow="${f.id}">
            <span class="text-sm font-medium text-slate-700">New screen</span>
            <input name="name" class="input text-sm" placeholder="Name">
            <input name="page" class="input text-sm" placeholder="Page, e.g. /signup/otp">
            <button class="btn-primary justify-center">Add screen</button>
            <button type="button" class="btn-secondary justify-center" data-add-condition>Add condition</button>
          </form>
        </div>
      </section>`;
  }

  function conditionHtml(c) {
    const m = modules.find((x) => x.id === activeId);
    const targetOptions = (selected) => '<option value="">Choose screen…</option>' + m.flows.map((f) =>
      `<optgroup label="${esc(f.name)}">${onlyScreens(f.screens).map((x) =>
        `<option value="${x.id}" ${x.id === selected ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('');

    return `
      <div class="card cond" data-id="${c.id}">
        <div class="flex items-center gap-2">
          <span class="cond-diamond"></span>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Condition</p>
            <h4 class="truncate text-sm font-semibold text-slate-900">${esc(c.name)}</h4>
          </div>
          <button class="icon-btn" data-rename-condition="${c.id}" title="Rename">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-delete-screen="${c.id}" title="Delete condition">${icon('trash', 14)}</button>
        </div>
        <ul class="mt-3 space-y-2">
          ${(c.branches || []).map((b) => `
            <li class="branch tone-${tone(b.label)}" data-branch="${b.id}">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-slate-500">If</span>
                <input class="input min-w-0 flex-1 py-1 text-sm" value="${esc(b.label)}" placeholder="e.g. Success" data-branch-label>
                <button class="icon-btn sm danger" data-remove-branch="${b.id}" title="Remove branch">${icon('close', 12)}</button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-slate-500">Show</span>
                <select class="input min-w-0 flex-1 py-1 text-sm" data-branch-target>${targetOptions(b.targetId)}</select>
                ${b.targetId ? `<button class="icon-btn sm" data-locate="${b.targetId}" title="Go to screen">${icon('locate', 14)}</button>` : ''}
              </div>
            </li>`).join('')}
        </ul>
        <button class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline" data-add-branch="${c.id}">${icon('plus', 14)} Add branch</button>
      </div>`;
  }

  function conditionTags(s) {
    return incomingFor(s.id).map(({ condition, branch }) =>
      `<p class="cond-tag tone-${tone(branch.label)}"><span class="dot"></span>If ${esc(condition.name)} = ${esc(branch.label || '—')}</p>`).join('');
  }

  function screenHtml(s, i) {
    if (isCondition(s)) return conditionHtml(s);
    const top = topPriority(s);
    const open = s.comments.filter((c) => !c.resolved).length;
    const topCount = s.comments.filter((c) => !c.resolved && prio(c) === top).length;
    return `
      <div class="card ${flipped.has(s.id) ? 'flipped' : ''} ${top ? `ring-${top}` : ''}" data-id="${s.id}">
        <div class="card-inner">
          <div class="card-face card-front">
            <div class="preview">
              ${device(s, 'sm')}
              <span class="step">${String(i + 1).padStart(2, '0')}</span>
              ${top ? `<span class="prio-badge bg-${top}">${topCount} ${PRIORITY[top].label}</span>` : ''}
            </div>
            <div class="px-3 pt-3">
              <h4 class="truncate text-sm font-semibold text-slate-900">${esc(s.name)}</h4>
              <p class="truncate font-mono text-xs text-slate-500">${esc(s.page || '—')}</p>
              ${conditionTags(s)}
            </div>
            <div class="flex items-center gap-2 px-3 pt-3">
              ${deviceToggle(s)}
              <label class="icon-btn border border-slate-200" title="Upload image">${icon('upload', 14)}${fileInput(s)}</label>
            </div>
            <div class="card-foot">
              <button class="issues-btn ${open ? 'has-open' : ''}" data-flip="${s.id}">${icon('flip', 14)} Issues <span class="count">${open} open</span></button>
              <button class="icon-btn ml-auto" data-copy-screen="${s.id}" title="Copy to other flows">${icon('copy', 14)}</button>
              <button class="icon-btn" data-edit-screen="${s.id}" title="Edit screen">${icon('edit', 14)}</button>
              <button class="icon-btn danger" data-delete-screen="${s.id}" title="Delete screen">${icon('trash', 14)}</button>
            </div>
          </div>
          <div class="card-face card-back">${issuesPanel(s, false)}</div>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- scroll / focus preservation across re-renders

  function captureScroll() {
    const saved = {};
    $('.screens').each((i, el) => { saved[`flow-${$(el).data('flow')}`] = el.scrollLeft; });
    $('.bug-list').each((i, el) => { saved[`list-${$(el).closest('#popup').length}-${$(el).data('list')}`] = el.scrollTop; });
    const rows = document.getElementById('sheetRows');
    if (rows) saved.sheet = rows.scrollTop;
    return saved;
  }

  function afterRender(saved) {
    $('.screens').each((i, el) => { el.scrollLeft = saved[`flow-${$(el).data('flow')}`] || 0; });
    $('.bug-list').each((i, el) => {
      el.scrollTop = saved[`list-${$(el).closest('#popup').length}-${$(el).data('list')}`] || 0;
      const $new = $(el).children('.new');
      if ($new.length) el.scrollTop = $new[0].offsetTop - 6;
    });
    const rows = document.getElementById('sheetRows');
    if (rows) {
      rows.scrollTop = saved.sheet || 0;
      const $new = $(rows).children('.new');
      if ($new.length) rows.scrollTop = $new[0].offsetTop - 8;
      $(rows).find('textarea').each((i, el) => autoGrow(el));
    }

    const people = [...new Set(allIssues().flatMap((c) => c.assignees || []))].sort();
    $('#people').html(people.map((n) => `<option value="${esc(n)}"></option>`).join(''));

    if (refocus) {
      const input = $(refocus.where).find(`.add-comment[data-screen="${refocus.screen}"] input[name=text]`)[0];
      if (input) input.focus({ preventScroll: true });
      refocus = null;
    }
    flashId = null;
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 38)}px`;
  }

  // ---------------------------------------------------------------- issue sheet

  function sheetRow(c) {
    const p = prio(c);
    return `
      <div class="sheet-row ${p} ${c.resolved ? 'fixed' : ''} ${c.id === flashId ? 'new' : ''}">
        <label class="flex items-center gap-2 pt-2 text-xs font-medium text-slate-500">
          <input type="checkbox" class="h-4 w-4 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''}>
          <span class="md:hidden">Fixed</span>
        </label>
        <div><span class="cell-label">Priority</span>
          <select class="input w-full text-sm" data-field="priority" data-id="${c.id}">${priorityOptions(p)}</select></div>
        <div><span class="cell-label">Status</span>
          ${statusSelect(c, 'w-full')}<span class="date mt-1 block">${dateText(c)}</span></div>
        <div><span class="cell-label">Issue</span>
          <textarea class="input cell-text w-full text-sm ${c.resolved ? 'text-slate-400 line-through' : ''}" rows="1" data-field="text" data-id="${c.id}">${esc(c.text)}</textarea></div>
        <div><span class="cell-label">Assigned to</span>
          ${peopleBox(c.assignees, c.id, 'text-sm')}</div>
        <div><span class="cell-label">Remarks</span>
          <textarea class="input cell-text w-full text-sm" rows="1" data-field="remarks" data-id="${c.id}">${esc(c.remarks || '')}</textarea></div>
        <div class="flex items-center justify-between gap-2 pt-2 text-xs text-slate-400 md:flex-col md:items-end md:pt-1">
          <span>${fmtDate(c.createdAt)}</span>
          <button class="icon-btn danger" data-delete-comment="${c.id}" title="Delete">${icon('trash', 14)}</button>
        </div>
      </div>`;
  }

  function renderSheet() {
    const s = findScreen(sheetId);
    if (!s) { closeSheet(); return; }
    const all = sortIssues(s.comments);
    const counts = { all: all.length, open: all.filter((c) => !c.resolved).length, fixed: all.filter((c) => c.resolved).length };
    const rows = all.filter((c) => sheetFilter === 'all' || (sheetFilter === 'open' ? !c.resolved : c.resolved));

    $('#sheetBody').html(`
      <div class="flex flex-wrap items-center gap-4 border-b border-slate-200 px-5 py-4">
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-lg font-semibold text-slate-900">${esc(s.name)} — Issues</h3>
          <p class="text-sm text-slate-500">${esc(s.page || '—')}</p>
        </div>
        <div class="seg">
          ${[['all', 'All'], ['open', 'Open'], ['fixed', 'Fixed']].map(([k, label]) =>
            `<button data-sheet-filter="${k}" class="${sheetFilter === k ? 'on' : ''}">${label} (${counts[k]})</button>`).join('')}
        </div>
        <button class="icon-btn" data-close-sheet title="Close">${icon('close', 18)}</button>
      </div>
      <div class="sheet-cols"><span>Fixed</span><span>Priority</span><span>Status</span><span>Issue</span><span>Assigned to</span><span>Remarks</span><span>Added</span></div>
      <div class="sheet-rows" id="sheetRows">
        ${rows.map(sheetRow).join('') || '<p class="py-12 text-center text-sm text-slate-400">No issues</p>'}
      </div>
      <form class="add-comment sheet-add" data-screen="${s.id}">
        <select name="priority" class="input text-sm">${priorityOptions('medium')}</select>
        <select name="status" class="input text-sm" title="Status">${activeStatuses().map((x) => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join('')}</select>
        <input name="text" class="input text-sm" placeholder="Issue" autocomplete="off">
        ${peopleBox([], '', 'text-sm')}
        <input name="remarks" class="input text-sm" placeholder="Remarks" autocomplete="off">
        <button class="btn-primary justify-center">Add issue</button>
      </form>`);
  }

  function openSheet(id) {
    sheetId = id;
    sheetFilter = 'all';
    renderSheet();
    afterRender({});
    $('#sheet').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closeSheet() {
    sheetId = null;
    $('#sheet').addClass('hidden');
    unlockScroll();
  }

  // ---------------------------------------------------------------- screen popup

  function renderPopup() {
    const s = findScreen(openId);
    if (!s) { closePopup(); return; }
    const linked = linkedCopies(s);
    $('#popupBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-lg font-semibold text-slate-900">${esc(s.name)}</h3>
          <p class="truncate font-mono text-xs text-slate-500">${esc(s.page || '—')}</p>
          ${conditionTags(s)}
          ${linked.length ? `<p class="mt-1 text-xs text-slate-500">Also in: ${linked.map((l) => `<button class="text-indigo-600 hover:underline" data-goto="${l.screen.id}" data-module="${l.module.id}" data-product-id="${l.product.id}">${l.product.id !== productId ? `${esc(l.product.name)} › ` : ''}${esc(l.module.name)} › ${esc(l.flow.name)}</button>`).join(', ')}</p>` : ''}
        </div>
        <button class="btn-secondary" data-copy-screen="${s.id}">${icon('copy', 14)} Copy to flows</button>
        <button class="icon-btn" data-edit-screen="${s.id}" title="Edit screen">${icon('edit')}</button>
        <button class="icon-btn" data-close-popup title="Close">${icon('close', 18)}</button>
      </div>
      <div class="grid gap-6 p-5 md:grid-cols-[1fr_340px]">
        <div class="popup-stage">${device(s, 'lg')}</div>
        <div class="space-y-5">
          <div><span class="field-label">Platform</span>${deviceToggle(s)}</div>
          <div>
            <span class="field-label">Wireframe</span>
            <select class="input w-full" data-wireframe="${s.id}" ${s.image ? 'disabled' : ''}>
              ${Object.entries(WIREFRAMES).map(([k, label]) => `<option value="${k}" ${k === (s.wireframe || 'form') ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>
          <div>
            <span class="field-label">Image</span>
            <div class="flex gap-2">
              <label class="btn-secondary">${icon('upload', 14)} ${s.image ? 'Replace' : 'Upload'}${fileInput(s)}</label>
              ${s.image ? `<button class="btn-secondary" data-remove-image="${s.id}">Remove</button>` : ''}
            </div>
          </div>
          <div class="border-t border-slate-200 pt-4">${issuesPanel(s, true)}</div>
        </div>
      </div>`);
  }

  function openPopup(id) {
    openId = id;
    renderPopup();
    afterRender({});
    $('#popup').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closePopup() {
    openId = null;
    $('#popup').addClass('hidden');
    unlockScroll();
  }

  // ---------------------------------------------------------------- copy screen to other flows

  function openCopy(id) {
    const s = findScreen(id);
    const hasIt = (f) => f.screens.some((x) => x.id === s.id || (s.linkId && x.linkId === s.linkId));
    const openCount = s.comments.filter((c) => !c.resolved).length;

    $('#copyForm').data('screen', s.id).html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">Copy “${esc(s.name)}” to flows</h3>
        <button type="button" class="icon-btn" data-close-copy title="Close">${icon('close', 18)}</button>
      </div>
      <div class="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4">
        <p class="text-xs text-slate-500">Name, page, platform, wireframe and image are copied. Each copy has its own issues.</p>
        ${products.flatMap((p) => p.modules.map((m) => ({ p, m }))).map(({ p, m }) => `
          <div>
            <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">${esc(p.name)} › ${esc(m.name)}</p>
            ${m.flows.map((f) => {
              const disabled = hasIt(f);
              return `<label class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${disabled ? 'text-slate-400' : 'cursor-pointer hover:bg-slate-50'}">
                <input type="checkbox" name="flowIds" value="${f.id}" class="h-4 w-4 accent-indigo-600" ${disabled ? 'disabled' : ''}>
                <span class="flex-1">${esc(f.name)}</span>
                ${disabled ? '<span class="text-xs">Already has this screen</span>' : `<span class="text-xs text-slate-400">${onlyScreens(f.screens).length} screens</span>`}
              </label>`;
            }).join('') || '<p class="px-2 text-sm text-slate-400">No flows</p>'}
          </div>`).join('')}
      </div>
      <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 px-5 py-3">
        ${openCount ? `<label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="withIssues" class="h-4 w-4 accent-indigo-600"> Also copy ${openCount} open issue${openCount > 1 ? 's' : ''}</label>` : ''}
        <button type="button" class="btn-secondary ml-auto" data-close-copy>Cancel</button>
        <button class="btn-primary" id="copySubmit" disabled>Copy</button>
      </div>`);
    $('#copyModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closeCopy() {
    $('#copyModal').addClass('hidden');
    unlockScroll();
  }

  // ---------------------------------------------------------------- issues by status (header counts open this)

  function renderBugs() {
    const { status, filter } = bugsView;
    if (!productId) { closeBugs(); return; }
    const rows = [];
    modules.forEach((m) => m.flows.forEach((f) => onlyScreens(f.screens).forEach((s) => {
      sortIssues(s.comments).forEach((c) => { if (!status || c.status === status) rows.push({ c, s, f, m }); });
    })));
    const counts = { open: rows.filter((x) => !x.c.resolved).length, fixed: rows.filter((x) => x.c.resolved).length, all: rows.length };
    // a single status needs no Open / Fixed split
    const list = status ? rows : rows.filter(({ c }) => filter === 'all' || (filter === 'open' ? !c.resolved : c.resolved));
    const screenCount = new Set(list.map((x) => x.s.id)).size;
    const tag = status && statusOf(status);

    $('#bugsBody').html(`
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div class="min-w-0 flex-1">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
            ${tag ? `<span class="dot st st-${tag.color}"></span>${esc(tag.label)} issues` : 'All issues'}
          </h3>
          <p class="text-sm text-slate-500">${list.length} issue${list.length === 1 ? '' : 's'} on ${screenCount} screen${screenCount === 1 ? '' : 's'}</p>
        </div>
        ${status ? '' : `<div class="seg">
          ${[['open', 'Open'], ['fixed', 'Fixed'], ['all', 'All']].map(([k, label]) =>
            `<button data-bugs-filter="${k}" class="${filter === k ? 'on' : ''}">${label} (${counts[k]})</button>`).join('')}
        </div>`}
        <button class="icon-btn" data-close-bugs title="Close">${icon('close', 18)}</button>
      </div>
      <div class="bugs-cols"><span>Module › Flow › Screen</span><span>Priority</span><span>Status</span><span>Issue</span><span>Assigned to</span><span></span></div>
      <div class="bugs-rows">
        ${list.map(({ c, s, f, m }) => {
          const p = prio(c);
          return `
          <div class="bugs-row ${p} ${c.resolved ? 'fixed' : ''}">
            <div class="min-w-0">
              <p class="truncate text-xs text-slate-500">${esc(m.name)} › ${esc(f.name)}</p>
              <p class="truncate text-sm font-medium text-slate-900">${esc(s.name)}</p>
            </div>
            <div><span class="prio-tag ${p}"><span class="dot bg-${p}"></span>${PRIORITY[p].label}</span></div>
            <div>${statusSelect(c, 'w-full')}<span class="date mt-1 block">${dateText(c)}</span></div>
            <p class="text-sm ${c.resolved ? 'text-slate-400 line-through' : 'text-slate-700'}">${esc(c.text)}${c.remarks ? `<span class="remark">${esc(c.remarks)}</span>` : ''}</p>
            <div class="flex flex-wrap gap-1">${(c.assignees || []).map((n) => `<span class="person">${esc(n)}</span>`).join('') || '<span class="text-xs text-slate-400">Unassigned</span>'}</div>
            <button class="icon-btn border border-slate-200 bg-white" data-go-screen="${s.id}" title="Go to screen">${icon('link', 14)}</button>
          </div>`;
        }).join('') || `<p class="py-12 text-center text-sm text-slate-400">No ${status || filter === 'all' ? '' : `${filter} `}issues</p>`}
      </div>`);
  }

  function openBugs(status) {
    bugsView = { status, filter: 'open' };
    renderBugs();
    $('#bugsModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closeBugs() {
    bugsView = null;
    $('#bugsModal').addClass('hidden');
    unlockScroll();
  }

  // Close the popup, switch to the screen's module and point at its card.
  function goToScreen(id) {
    const m = modules.find((x) => allScreens([x]).some((s) => s.id === id));
    if (!m) return;
    closeBugs();
    activeId = m.id;
    render();
    const $card = $(`.card[data-id="${id}"]`);
    if (!$card.length) return;
    $card[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    $card.addClass('highlight');
    setTimeout(() => $card.removeClass('highlight'), 1600);
  }

  // ---------------------------------------------------------------- manage status tags

  const colorPick = (value, attrs) => `<select class="color-pick st-${value}" title="Colour" ${attrs}>
    ${COLORS.map((c) => `<option value="${c}" ${c === value ? 'selected' : ''}>${c[0].toUpperCase()}${c.slice(1)}</option>`).join('')}
  </select>`;

  function renderStatuses() {
    const used = (id) => allIssues().filter((c) => c.status === id).length;
    $('#statusBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 text-base font-semibold text-slate-900">Status tags</h3>
        <button class="icon-btn" data-close-statuses title="Close">${icon('close', 18)}</button>
      </div>
      <div class="px-5 py-3">
        ${activeStatuses().map((x) => `
          <div class="status-row">
            ${colorPick(x.color, `data-status-color="${esc(x.id)}"`)}
            <input class="input min-w-0 flex-1 text-sm" value="${esc(x.label)}" maxlength="40" data-status-label="${esc(x.id)}">
            <span class="w-16 shrink-0 text-right text-xs text-slate-400">${used(x.id)} issues</span>
            ${x.builtIn
              ? '<span class="icon-btn cursor-default text-slate-300" title="Built in, cannot be removed">—</span>'
              : `<button class="icon-btn danger" data-delete-status="${esc(x.id)}" title="Remove status">${icon('trash', 14)}</button>`}
          </div>`).join('')}
      </div>
      <form id="addStatus" class="flex items-center gap-2 border-t border-slate-200 px-5 py-3">
        ${colorPick('indigo', 'name="color"')}
        <input name="label" class="input min-w-0 flex-1 text-sm" placeholder="New status, e.g. In review" maxlength="40" autocomplete="off">
        <button class="btn-primary">Add</button>
      </form>
      <p class="px-5 pb-4 text-xs text-slate-500">Every issue has one of these. Pending and Complete (same as ticking Fixed) are built in. Issues on a removed status keep it until you pick another.</p>`);
  }

  function openStatuses() {
    renderStatuses();
    $('#statusModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closeStatuses() {
    $('#statusModal').addClass('hidden');
    unlockScroll();
  }

  // ---------------------------------------------------------------- drag & drop

  function saveOrder(listEl) {
    const ids = $(listEl).children('.card').map((i, el) => $(el).data('id')).get();
    return api('PUT', `/api/flows/${$(listEl).data('flow')}/order`, { ids });
  }

  function initDragging() {
    $('.screens').each(function () {
      Sortable.create(this, {
        group: 'screens',
        draggable: '.card',
        filter: 'input, select, button, label, .card-back',
        preventOnFilter: false,
        animation: 150,
        delay: 150,
        delayOnTouchOnly: true,
        onStart: () => { dragging = true; },
        onEnd: (e) => {
          setTimeout(() => { dragging = false; }, 50);
          const saves = [saveOrder(e.to)];
          if (e.from !== e.to) saves.push(saveOrder(e.from));
          $.when(...saves).always(load);
        },
      });
    });
  }

  // ---------------------------------------------------------------- events

  const $doc = $(document);

  function submitForm(selector, handler) {
    $doc.on('submit', selector, function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(this));
      if (!(data.name || data.text || '').trim()) return;
      handler($(this), data).done(load);
    });
  }

  submitForm('.add-screen', ($f, d) => api('POST', `/api/flows/${$f.data('flow')}/screens`, d));
  submitForm('.add-comment', ($f, d) => api('POST', `/api/screens/${$f.data('screen')}/comments`, { ...d, assignees: peopleOf($f.find('.people')) }).done((c) => {
    flashId = c.id;
    refocus = { screen: $f.data('screen'), where: $f.closest('#sheet').length ? '#sheet' : $f.closest('#popup').length ? '#popup' : '#board' };
  }));

  $doc.on('click', '[data-action="add-module"]', () => ask({
    title: 'New module',
    fields: [{ name: 'name', label: 'Module name', placeholder: 'e.g. Onboarding, Payments', required: true }],
    confirmText: 'Add module',
    save: (v) => api('POST', `/api/products/${productId}/modules`, v, null, QUIET).done((m) => { activeId = m.id; load(); }),
  }));
  $doc.on('click', '[data-action="add-flow"]', function () {
    const moduleId = $(this).data('module');
    ask({
      title: 'New flow',
      fields: [{ name: 'name', label: 'Flow name', placeholder: 'e.g. Sign Up, Add Money', required: true }],
      confirmText: 'Add flow',
      save: (v) => api('POST', `/api/modules/${moduleId}/flows`, v, null, QUIET).done(load),
    });
  });
  $doc.on('click', '[data-action="retry"]', () => load());
  $doc.on('click', '[data-tab]', function () { activeId = $(this).data('tab'); render(); });

  // products
  $doc.on('click', '[data-product]', function () { selectProduct($(this).data('product')); render(); });
  $doc.on('click', '[data-action="add-product"]', () => ask({
    title: 'New product',
    fields: [{ name: 'name', label: 'Product name', placeholder: 'e.g. Finzoom, Findost, IPO', required: true }],
    confirmText: 'Add product',
    save: (v) => api('POST', '/api/products', v, null, QUIET).done((p) => { productId = p.id; storage('set', 'productId', p.id); load(); }),
  }));
  $doc.on('click', '[data-rename-product]', function () {
    const p = products.find((x) => x.id === $(this).data('rename-product'));
    rename('product', `/api/products/${p.id}`, p.name);
  });
  $doc.on('click', '[data-delete-product]', function () {
    const p = products.find((x) => x.id === $(this).data('delete-product'));
    remove({ title: `Delete “${p.name}”?`, message: 'All of its modules, flows, screens and issues will be deleted. This cannot be undone.', url: `/api/products/${p.id}` });
  });

  function rename(what, url, current) {
    ask({
      title: `Rename ${what}`,
      fields: [{ name: 'name', label: `${what[0].toUpperCase()}${what.slice(1)} name`, value: current, required: true }],
      save: (v) => api('PATCH', url, v, null, QUIET).done(load),
    });
  }
  $doc.on('click', '[data-rename-module]', function () {
    const m = allModules.find((x) => x.id === $(this).data('rename-module'));
    rename('module', `/api/modules/${m.id}`, m.name);
  });
  $doc.on('click', '[data-rename-flow]', function () {
    const f = findFlow($(this).data('rename-flow'));
    rename('flow', `/api/flows/${f.id}`, f.name);
  });
  $doc.on('click', '[data-edit-screen]', function () {
    const s = findScreen($(this).data('edit-screen'));
    ask({
      title: 'Edit screen',
      fields: [
        { name: 'name', label: 'Screen name', value: s.name, required: true },
        { name: 'page', label: 'Page', value: s.page, placeholder: 'e.g. /signup/otp' },
      ],
      save: (v) => api('PATCH', `/api/screens/${s.id}`, v, null, QUIET).done(load),
    });
  });

  function remove({ title, message = 'This cannot be undone.', url, confirmText = 'Delete' }) {
    dialog.confirm({ title, message, confirmText, danger: true, onConfirm: () => api('DELETE', url, null, null, QUIET).done(load) });
  }
  $doc.on('click', '[data-delete-module]', function () {
    const m = allModules.find((x) => x.id === $(this).data('delete-module'));
    remove({ title: `Delete module “${m.name}”?`, message: 'All of its flows, screens and issues will be deleted. This cannot be undone.', url: `/api/modules/${m.id}` });
  });
  $doc.on('click', '[data-delete-flow]', function () {
    const f = findFlow($(this).data('delete-flow'));
    remove({ title: `Delete flow “${f.name}”?`, message: 'All of its screens and issues will be deleted. This cannot be undone.', url: `/api/flows/${f.id}` });
  });
  $doc.on('click', '[data-delete-screen]', function () {
    const s = findScreen($(this).data('delete-screen'));
    const what = isCondition(s) ? 'condition' : 'screen';
    remove({ title: `Delete ${what} “${s.name}”?`, message: isCondition(s) ? 'Its branches will be removed. This cannot be undone.' : 'Its image and issues will be deleted too. This cannot be undone.', url: `/api/screens/${s.id}` });
  });
  $doc.on('click', '[data-delete-comment]', function () {
    const c = allIssues().find((x) => x.id === $(this).data('delete-comment'));
    remove({ title: 'Delete this issue?', message: `“${c.text.length > 80 ? `${c.text.slice(0, 80)}…` : c.text}” will be deleted. This cannot be undone.`, url: `/api/comments/${c.id}` });
  });

  $doc.on('change', '[data-status]', function () {
    api('PATCH', `/api/comments/${$(this).data('status')}`, { status: $(this).val() }).done(load);
  });
  $doc.on('change', '[data-resolve]', function () {
    api('PATCH', `/api/comments/${$(this).data('resolve')}`, { resolved: this.checked }).done(load);
  });

  // card: front opens the popup, the Issues button flips to the back
  $doc.on('click', '.card-front', function (e) {
    if (dragging || $(e.target).closest('input, select, button, label').length) return;
    openPopup($(this).closest('.card').data('id'));
  });
  $doc.on('click', '[data-flip]', function () {
    const id = $(this).data('flip');
    if (flipped.has(id)) flipped.delete(id); else flipped.add(id);
    $(`.card[data-id="${id}"]`).toggleClass('flipped');
  });

  $doc.on('click', '[data-expand]', function () {
    const id = $(this).data('expand');
    if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
    $(this).toggleClass('clamp');
  });
  $doc.on('click', '[data-cycle-priority]', function () {
    const order = ['medium', 'high', 'urgent', 'low'];
    const c = allIssues().find((x) => x.id === $(this).data('cycle-priority'));
    api('PATCH', `/api/comments/${c.id}`, { priority: order[(order.indexOf(prio(c)) + 1) % order.length] }).done(load);
  });

  $doc.on('click', '[data-scroll]', function () {
    $(`.screens[data-flow="${$(this).data('scroll')}"]`)[0].scrollBy({ left: Number($(this).data('dir')) * 330, behavior: 'smooth' });
  });

  // popup
  $doc.on('click', '[data-close-popup]', closePopup);
  $('#popup').on('mousedown', function (e) { if (e.target === this) closePopup(); });
  $doc.on('click', '[data-device]', function () {
    api('PATCH', `/api/screens/${$(this).data('id')}`, { device: $(this).data('device') }).done(load);
  });
  $doc.on('change', '[data-wireframe]', function () {
    api('PATCH', `/api/screens/${$(this).data('wireframe')}`, { wireframe: $(this).val() }).done(load);
  });
  $doc.on('change', '[data-upload]', function () {
    const id = $(this).data('upload');
    const file = this.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { dialog.alert('Please choose an image under 5 MB.', 'Image too large'); this.value = ''; return; }
    const label = this.closest('label');
    setBusy(label, true); // reading the file happens before the request starts
    const reader = new FileReader();
    reader.onload = () => api('POST', `/api/screens/${id}/image`, { dataUrl: reader.result }, label)
      .done(() => { toast('Image uploaded'); load(); });
    reader.onerror = () => { setBusy(label, false); dialog.alert('That file could not be read. Please try another image.', 'Upload failed'); };
    reader.readAsDataURL(file);
  });
  $doc.on('click', '[data-remove-image]', function () {
    remove({ title: 'Remove this image?', message: 'The screen will show its wireframe again.', confirmText: 'Remove', url: `/api/screens/${$(this).data('remove-image')}/image` });
  });

  // conditions
  function readBranches(id) {
    return $(`.card[data-id="${id}"] [data-branch]`).map((i, el) => ({
      id: $(el).data('branch'),
      label: $(el).find('[data-branch-label]').val(),
      targetId: $(el).find('[data-branch-target]').val() || null,
    })).get();
  }
  const saveBranches = (id, branches) => api('PATCH', `/api/screens/${id}`, { branches }).done(load);

  $doc.on('click', '[data-add-condition]', function () {
    const $f = $(this).closest('form');
    const flowId = $f.data('flow');
    const typed = $f.find('[name=name]').val().trim();
    if (typed) { api('POST', `/api/flows/${flowId}/screens`, { type: 'condition', name: typed }).done(load); return; }
    ask({
      title: 'New condition',
      fields: [{ name: 'name', label: 'Condition name', placeholder: 'e.g. Mandate status', required: true }],
      confirmText: 'Add condition',
      save: (v) => api('POST', `/api/flows/${flowId}/screens`, { type: 'condition', name: v.name }, null, QUIET).done(load),
    });
  });
  $doc.on('change', '[data-branch-label], [data-branch-target]', function () {
    const id = $(this).closest('.card').data('id');
    saveBranches(id, readBranches(id));
  });
  $doc.on('click', '[data-add-branch]', function () {
    const id = $(this).data('add-branch');
    saveBranches(id, readBranches(id).concat({ label: '', targetId: null }));
  });
  $doc.on('click', '[data-remove-branch]', function () {
    const id = $(this).closest('.card').data('id');
    const remove = $(this).data('remove-branch');
    saveBranches(id, readBranches(id).filter((b) => b.id !== remove));
  });
  $doc.on('click', '[data-rename-condition]', function () {
    const c = findScreen($(this).data('rename-condition'));
    rename('condition', `/api/screens/${c.id}`, c.name);
  });
  $doc.on('click', '[data-locate]', function () {
    const $card = $(`.card[data-id="${$(this).data('locate')}"]`);
    if (!$card.length) return;
    $card[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    $card.addClass('highlight');
    setTimeout(() => $card.removeClass('highlight'), 1600);
  });

  // issues by status
  $doc.on('click', '[data-bugs]', function () { openBugs(String($(this).data('bugs'))); });
  $doc.on('click', '[data-bugs-filter]', function () { bugsView.filter = $(this).data('bugs-filter'); renderBugs(); });
  $doc.on('click', '[data-close-bugs]', closeBugs);
  $('#bugsModal').on('mousedown', function (e) { if (e.target === this) closeBugs(); });
  $doc.on('click', '[data-go-screen]', function () { goToScreen($(this).data('go-screen')); });

  // status tags
  $doc.on('click', '[data-action="manage-statuses"]', openStatuses);
  $doc.on('click', '[data-close-statuses]', closeStatuses);
  $('#statusModal').on('mousedown', function (e) { if (e.target === this) closeStatuses(); });
  $doc.on('change', '[data-status-color]', function () {
    api('PATCH', `/api/statuses/${$(this).data('status-color')}`, { color: $(this).val() }).done(load);
  });
  $doc.on('change', '[data-status-label]', function () {
    const label = $(this).val().trim();
    const x = statusOf($(this).data('status-label'));
    if (!label) { $(this).val(x.label); return; }
    api('PATCH', `/api/statuses/${x.id}`, { label }).done(() => { toast('Saved'); load(); });
  });
  $doc.on('submit', '#addStatus', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    if (!data.label.trim()) return;
    api('POST', '/api/statuses', data).done(load);
  });
  $doc.on('click', '[data-delete-status]', function () {
    const x = statusOf($(this).data('delete-status'));
    remove({ title: `Remove status “${x.label}”?`, message: 'It will no longer be offered. Issues already on it keep it until you change them.', confirmText: 'Remove', url: `/api/statuses/${x.id}` });
  });

  // copy to flows
  $doc.on('click', '[data-copy-screen]', function () { openCopy($(this).data('copy-screen')); });
  $doc.on('click', '[data-close-copy]', closeCopy);
  $('#copyModal').on('mousedown', function (e) { if (e.target === this) closeCopy(); });
  $doc.on('change', '#copyForm [name=flowIds]', () => {
    const n = $('#copyForm [name=flowIds]:checked').length;
    $('#copySubmit').prop('disabled', !n).text(n ? `Copy to ${n} flow${n > 1 ? 's' : ''}` : 'Copy');
  });
  $('#copyForm').on('submit', function (e) {
    e.preventDefault();
    const flowIds = $(this).find('[name=flowIds]:checked').map((i, el) => el.value).get();
    const withIssues = $(this).find('[name=withIssues]').is(':checked');
    api('POST', `/api/screens/${$(this).data('screen')}/copy`, { flowIds, withIssues }).done(() => {
      closeCopy();
      toast(`Copied to ${flowIds.length} flow${flowIds.length > 1 ? 's' : ''}`);
      load();
    });
  });
  // "Also in" link: jump to that copy
  $doc.on('click', '[data-goto]', function () {
    selectProduct($(this).data('product-id'));
    activeId = $(this).data('module');
    openId = $(this).data('goto');
    render();
  });

  // issue sheet
  $doc.on('click', '[data-open-sheet]', function () { openSheet($(this).data('open-sheet')); });
  $doc.on('click', '[data-close-sheet]', closeSheet);
  $('#sheet').on('mousedown', function (e) { if (e.target === this) closeSheet(); });
  $doc.on('click', '[data-sheet-filter]', function () { sheetFilter = $(this).data('sheet-filter'); renderSheet(); afterRender({}); });
  $doc.on('input', '.sheet-row textarea', function () { autoGrow(this); });

  // Priority changes re-sort the sheet; text fields save without re-rendering it so typing isn't interrupted.
  $doc.on('change', '[data-field]', function () {
    const id = $(this).data('id');
    const field = $(this).data('field');
    const value = $(this).val();
    api('PATCH', `/api/comments/${id}`, { [field]: value })
      .done(() => {
        if (field === 'priority') { load(); return; }
        allIssues().find((x) => x.id === id)[field] = value;
        render({ skipSheet: true });
        toast('Saved');
      })
      .fail(() => load());
  });

  // assignees
  function savePeople($box) {
    const id = $box.data('people');
    if (!id) return;
    const assignees = chipsOf($box);
    api('PATCH', `/api/comments/${id}`, { assignees }, $box.find('.people-input')[0])
      .done(() => {
        allIssues().find((x) => x.id === id).assignees = assignees;
        render({ skipSheet: true });
        toast('Saved');
      })
      .fail(() => load());
  }
  function addPeople(input) {
    const $box = $(input).closest('.people');
    const names = input.value.split(',').map((x) => x.trim()).filter(Boolean);
    input.value = '';
    const fresh = names.filter((n) => !chipsOf($box).some((x) => x.toLowerCase() === n.toLowerCase()));
    if (!fresh.length) return;
    $(input).before(fresh.map(chip).join(''));
    input.placeholder = 'Add person';
    savePeople($box);
  }
  $doc.on('keydown', '.people-input', function (e) {
    if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) { e.preventDefault(); addPeople(this); }
    else if (e.key === 'Backspace' && !this.value) {
      const $last = $(this).prevAll('.person').first();
      if ($last.length) { $last.remove(); savePeople($(this).closest('.people')); }
    }
  });
  $doc.on('change', '.people-input', function () { if (this.value.trim()) addPeople(this); });
  $doc.on('click', '[data-remove-person]', function () {
    const $box = $(this).closest('.people');
    $(this).closest('.person').remove();
    savePeople($box);
  });
  $doc.on('click', '.people', function (e) { if (e.target === this) $(this).find('.people-input').trigger('focus'); });

  $doc.on('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (dialog.isOpen()) dialog.cancel();
    else if (!$('#copyModal').hasClass('hidden')) closeCopy();
    else if (!$('#statusModal').hasClass('hidden')) closeStatuses();
    else if (bugsView) closeBugs();
    else if (sheetId) closeSheet();
    else if (openId) closePopup();
  });

  load();
});
