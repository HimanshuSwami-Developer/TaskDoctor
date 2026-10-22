/* FlowTrace — jQuery front-end. © 2026 FinDevelopers · Prompting by Himanshu Swami · Idea & prompts by Vishal Yadav */
$(function () {
  const COLORS = ['slate', 'amber', 'sky', 'indigo', 'violet', 'pink', 'red', 'teal', 'green'];
  const WIREFRAMES = { form: 'Form', list: 'List', dashboard: 'Dashboard', detail: 'Detail' };
  const PRIORITY = {
    urgent: { label: 'Urgent', rank: 0 },
    high: { label: 'High', rank: 1 },
    medium: { label: 'Medium', rank: 2 },
    low: { label: 'Low', rank: 3 },
  };
  // which side an issue is in (issues from before this was added have none)
  const AREA = { frontend: 'Frontend', backend: 'Backend', both: 'Frontend + Backend' };

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
    up: 'M18 15l-6-6-6 6',
    video: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z',
    play: 'M6 4l14 8-14 8z',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    down: 'M6 9l6 6 6-6',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    extend: 'M6 3v9a4 4 0 0 0 4 4h10M16 12l4 4-4 4',
    diagram: 'M3 3h7v6H3zM14 15h7v6h-7zM6.5 9v3a3 3 0 0 0 3 3H14',
    minus: 'M5 12h14',
    tap: 'M9 9l5 12 1.8-5.2L21 14zM7.2 2.2 8 5.1M5.1 8 2.2 7.2M14 4.1 12 6.2M6.2 12l-2.1 2',
    check: 'M20 6 9 17l-5-5',
    grid: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
    sort: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',
    share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
    grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  };
  const icon = (name, size = 16) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;

  let me = null; // signed-in login: { id, username, name, access, allProducts, productIds }
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
  let pen = false; // drawing areas on the large screen image
  let draft = null; // area just drawn, waiting for "Add bug" / "Add navigation"
  let pickedArea = null; // area clicked on the large image: its bugs are listed first and highlighted in the popup
  const expanded = new Set(); // issues showing full text
  const flipped = new Set(); // cards turned to the issues side

  // ---------------------------------------------------------------- helpers

  const $doc = $(document);

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
  // Path flows that continue from one branch of a condition
  const pathsOf = (condId, branchId) => allModules.flatMap((m) => m.flows).filter((f) => f.fromConditionId === condId && f.fromBranchId === branchId);
  // Path flows that branch off a plain screen
  const pathsFrom = (screenId) => allModules.flatMap((m) => m.flows).filter((f) => f.fromScreenId === screenId);
  // Paths leaving one step of a flow, in order: [{ path, from }] (from = { condition, branch } or { screen })
  const pathsAt = (s) => (isCondition(s)
    ? (s.branches || []).flatMap((b) => pathsOf(s.id, b.id).map((path) => ({ path, from: { condition: s, branch: b } })))
    : pathsFrom(s.id).map((path) => ({ path, from: { screen: s } })));
  // Every screen inside a condition's paths (and nested paths)
  const pathScreens = (c) => (c.branches || []).flatMap((b) => pathsOf(c.id, b.id))
    .flatMap((f) => f.screens.flatMap((x) => (isCondition(x) ? pathScreens(x) : [x])));
  const onlyScreens = (list) => list.filter((s) => !isCondition(s));
  const statusOf = (id) => statuses.find((x) => x.id === id) || { id, label: id, color: 'slate', deleted: true };
  const activeStatuses = () => statuses.filter((x) => !x.deleted);
  const settableStatuses = () => activeStatuses().filter((x) => !statusLocked(x.id)); // what this login may pick

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

  // ---------------------------------------------------------------- access (the server enforces it; the UI only hides what you can't use)

  const LEVELS = { view: 1, edit: 2, tester: 2, developer: 3, full: 4, super: 5 };
  const ACCESS = {
    view: { label: 'View only', hint: 'Can see screens and flow videos in their apps. Cannot see issues or change anything.' },
    edit: { label: 'Update tasks', hint: 'Can add and update issues (status, priority, assignees, remarks). Cannot change screens, images or videos.' },
    tester: { label: 'Tester', hint: 'Can add and update issues and move them to any status (Pending, Release for Testing, Complete …). Cannot change screens, images or videos.' },
    developer: { label: 'Developer', hint: 'Update tasks, plus add, rename and delete modules, flows, screens, popups and conditions (with their branch paths), drag screens into a new order, and upload screen images. Can only move an issue between Pending and Release for Testing.' },
    full: { label: 'Full', hint: 'Can do everything inside their apps: create, edit and delete modules, flows, screens and issues.' },
    super: { label: 'Super admin', hint: 'Everything in every app, plus this admin dashboard and the status tags.' },
  };
  const can = (level) => Boolean(me) && LEVELS[me.access] >= LEVELS[level];
  // Developers only switch issues between these two statuses (the server enforces it too)
  const DEV_STATUSES = ['pending', 'testing'];
  const statusLocked = (id) => Boolean(me) && me.access === 'developer' && !DEV_STATUSES.includes(id);

  // Controls that need a higher level are removed; lower logins get read-only inputs.
  // edit / tester = issues only; developer adds to that modules, flows, screens, conditions, images and card order;
  // full adds videos, copying, screen paths and flow order. View-only logins don't see issues at all.
  const NEEDS = {
    super: '[data-action="add-product"], [data-rename-product], [data-delete-product], [data-action="manage-statuses"], [data-action="admin"]',
    full: `[data-move-flow], [data-copy-screen], [data-delete-comment], [data-remove-video], [data-extend-screen], [data-move-path]`,
    developer: `[data-action="add-module"], [data-rename-module], [data-delete-module], [data-remove-image], [data-action="add-flow"], [data-rename-flow], [data-delete-flow],
      .add-screen, .dg-add-end, .dg-plus, [data-edit-screen], [data-delete-screen],
      [data-add-condition], [data-insert-condition], [data-rename-condition], [data-cond-tool], [data-add-branch], [data-remove-branch], [data-extend-path],
      [data-dg-new="condition"], [data-dg-branch-add], [data-dg-branch-remove], [data-mark-nav], [data-remove-link]`,
    edit: '.add-comment, [data-pen], [data-action="writer"], [data-remove-person], [data-bugs], [data-flip], [data-open-sheet], .issues-panel',
  };
  function applyAccess() {
    const $root = $('#products, #summary, #account, #tabs, #board, #popupBody, #sheetBody, #bugsBody, #videoBody, #diagramBody');
    Object.entries(NEEDS).forEach(([level, selector]) => { if (!can(level)) $root.find(selector).remove(); });
    if (!can('developer')) {
      $root.find('[data-upload]').closest('label').remove();
      $root.find('[data-device], [data-wireframe], [data-branch-label], [data-branch-target], [data-dg-branch-label], [data-dg-branch-target]').prop('disabled', true);
    }
    if (!can('full')) $root.find('[data-upload-video]').closest('label').remove();
    if (!can('edit')) $root.find('[data-status], [data-resolve], [data-field], [data-cycle-priority], .people-input').prop('disabled', true);
    if (statusLocked('complete')) $root.find('[data-resolve]').prop('disabled', true).attr('title', 'Developers cannot mark issues fixed');
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
        if (xhr.status === 401 && url !== '/api/login') { showLogin(); return; }
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
            ${f.options
    ? `<select class="input w-full" name="${f.name}">${f.options.map(([v, label]) => `<option value="${esc(v)}" ${v === f.value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`
    : `<input class="input w-full" name="${f.name}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 200}" autocomplete="off" ${f.required ? 'data-required' : ''}>`}
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
      $(this).find('[data-dialog-cancel], input, select').prop('disabled', true);
      onConfirm(values)
        .done(() => close(fields && fields.length ? values : true))
        .fail((xhr) => {
          busy = false;
          setBusy(submit, false);
          $(this).find('[data-dialog-cancel], input, select').prop('disabled', false);
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

  // Screen dialogs: a step is a full screen or a popup over one, and can name the action that opens it
  const KINDS = [['screen', 'Screen'], ['popup', 'Popup']];
  const isPopup = (s) => s.kind === 'popup';
  const screenFields = (s = {}, kind = s.kind || 'screen') => [
    { name: 'name', label: kind === 'popup' ? 'Popup name' : 'Screen name', value: s.name, placeholder: kind === 'popup' ? 'e.g. Order confirmation' : '', required: true },
    { name: 'kind', label: 'Type', value: kind, options: KINDS },
    { name: 'action', label: 'Opens when', value: s.action, placeholder: 'e.g. Click "Place order"' },
    { name: 'page', label: 'Page', value: s.page, placeholder: 'e.g. /signup/otp' },
  ];
  // "Click Place order → opens" tag under a card's name
  const actionTag = (s) => (s.action
    ? `<p class="action-tag" title="Opens when: ${esc(s.action)}">${icon('tap', 12)}<span>${esc(s.action)}</span></p>` : '');

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
    const img = s.image
      && `<img src="${esc(imageUrl(s.image, size))}" alt="${esc(s.name)}" loading="lazy" draggable="false" onload="this.closest('.screen').classList.add('loaded')" onerror="this.closest('.screen').classList.add('loaded')">`;
    const content = img
      ? (size === 'lg' ? `<div class="mark-layer ${pen ? 'drawing' : ''}" data-marks="${s.id}">${img}${marksHtml(s)}</div>` : img)
      : isPopup(s) ? `<div class="wf-dialog">${wireframe(s.wireframe || 'form')}</div>` : wireframe(s.wireframe || 'form');
    const screenClass = (s.image ? 'screen has-img' : 'screen') + (isPopup(s) && !s.image ? ' popup' : '');
    if (s.device === 'web') {
      return `<div class="device web ${size}"><div class="browser-bar"><i></i><i></i><i></i><span>${esc(s.page)}</span></div><div class="${screenClass}">${content}</div></div>`;
    }
    return `<div class="device app ${size}"><div class="${screenClass}"><div class="notch"></div>${content}</div></div>`;
  }

  // ---------------------------------------------------------------- marks: areas drawn on a screen image
  // Bugs and navigation links drawn on the same box make one area, shown only as one thin underline: in the status
  // colour of its most urgent open bug (Pending amber, Release for Testing sky …), or black for links only.
  // Complete bugs are no longer tied to their area. The pen icon on an area
  // lists what is on it and adds more bugs or links to the same box. Boxes are fractions (0–1) of the image.
  // (Classes are not "bug" / "link": those already style issue rows.)

  const boxStyle = (b) => `left:${b.x * 100}%;top:${b.y * 100}%;width:${b.w * 100}%;height:${b.h * 100}%`;
  const boxKey = (b) => [b.x, b.y, b.w, b.h].join(',');

  function areasOf(s) {
    const map = new Map();
    const area = (b) => {
      const key = boxKey(b);
      if (!map.has(key)) map.set(key, { key, box: b, bugs: [], links: [] });
      return map.get(key);
    };
    // a Complete bug lets go of its area (it comes back if the bug is reopened)
    (s.comments || []).filter((c) => c.box && !c.resolved).forEach((c) => area(c.box).bugs.push(c));
    (s.links || []).forEach((l) => {
      const to = findScreen(l.targetId);
      if (to) area(l.box).links.push({ ...l, to });
    });
    map.forEach((a) => { a.bugs = sortIssues(a.bugs); });
    return [...map.values()];
  }

  function marksHtml(s) {
    // link-only areas first: an area with bugs sits on top where they overlap
    return areasOf(s).sort((a, b) => Boolean(a.bugs.length) - Boolean(b.bugs.length)).map((a) => {
      const tone = a.bugs.length ? `mark-bug st-${statusOf(a.bugs[0].status).color}` : 'mark-link';
      const title = a.bugs.map((c) => c.text).concat(a.links.map((l) => `Go to ${l.to.name}`)).join('\n');
      return `<div class="mark ${tone} ${a.key === pickedArea ? 'picked' : ''}" style="${boxStyle(a.box)}" data-area="${a.key}" data-screen="${s.id}" title="${esc(title)}">
        <button class="mark-edit" data-area-menu title="Bugs and links on this area">${icon('pen', 11)}</button>
      </div>`;
    }).join('');
  }
  const areaOf = (el) => areasOf(findScreen($(el).data('screen'))).find((a) => a.key === String($(el).data('area')));

  // A menu by a box on the image. It floats over the page (fixed) so the image's scroll box can't cut it off:
  // under the box, or above it when there is no room below, and kept inside the window.
  function markMenu(layer, box, html) {
    $('.mark-menu').remove();
    const r = layer.getBoundingClientRect();
    const $menu = $(`<div class="mark-menu">${html}</div>`).appendTo('body');
    const w = $menu.outerWidth();
    const h = $menu.outerHeight();
    const top = r.top + box.y * r.height;
    const bottom = r.top + (box.y + box.h) * r.height;
    const y = bottom + 6 + h <= window.innerHeight - 8 ? bottom + 6 : Math.max(8, top - 6 - h);
    const x = Math.min(Math.max(8, r.left + box.x * r.width), window.innerWidth - w - 8);
    $menu.css({ left: x, top: y });
  }
  const addButtons = () => `
    ${can('edit') ? `<button data-mark-bug>${icon('note', 14)} Add bug</button>` : ''}
    ${can('developer') ? `<button data-mark-nav>${icon('link', 14)} Add navigation</button>` : ''}`;

  // What is on an area (its bugs, where its links go) plus Add bug / Add navigation on the same box
  function areaMenu(el) {
    const a = areaOf(el);
    if (!a) return;
    const screenId = $(el).data('screen');
    draft = { screenId, box: a.box };
    const adds = addButtons();
    markMenu($(el).closest('.mark-layer')[0], a.box, `
      ${a.bugs.map((c) => `<button data-area-pick="${a.key}" title="${esc(c.text)}"><span class="dot st st-${statusOf(c.status).color}"></span><span class="truncate">${esc(c.text)}</span></button>`).join('')}
      ${a.links.map((l) => `<div class="mark-menu-row">
        <button data-mark-go="${l.to.id}">${icon('right', 14)}<span class="truncate">Go to ${esc(l.to.name)}</span></button>
        ${can('developer') ? `<button class="mark-menu-x" data-remove-link="${l.id}" data-screen="${screenId}" title="Remove link">${icon('close', 12)}</button>` : ''}
      </div>`).join('')}
      ${adds.trim() ? `<hr>${adds}` : ''}`);
  }

  // Bring an area's bugs to the top of the issue list, highlighted (again on the same area lets go)
  function pickArea(key) {
    pickedArea = pickedArea === key ? null : key;
    renderPopup();
    afterRender({});
    const $list = $('#popupBody .bug-list');
    if ($list.length) $list[0].scrollTop = 0;
    if (pickedArea) pulse($('#popupBody .bug.picked'), 'nearest');
  }

  // Bring a marked area (or its issue) into view and pulse it
  function pulse($el, block = 'center') {
    if (!$el.length) return;
    $el[0].scrollIntoView({ behavior: 'smooth', block });
    $el.removeClass('pulse');
    setTimeout(() => $el.addClass('pulse'), 0);
    setTimeout(() => $el.removeClass('pulse'), 1600);
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
  // Developers get Pending / Release for Testing only, and a locked select on an issue in any other status.
  function statusSelect(c, extra = '') {
    const current = statusOf(c.status);
    const locked = statusLocked(c.status);
    const list = locked ? [] : settableStatuses();
    const options = list.some((x) => x.id === current.id) ? list : [current, ...list];
    const title = locked ? 'Developers can only move issues between Pending and Release for Testing' : dateText(c);
    return `<select class="status st-${current.color} ${extra}" data-status="${c.id}" title="${esc(title)}" ${locked ? 'disabled' : ''}>
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
  const areaOptions = (selected) => (AREA[selected] ? '' : '<option value="" selected disabled>Area</option>')
    + Object.entries(AREA).map(([k, label]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${label}</option>`).join('');
  const areaTag = (c) => (AREA[c.area] ? `<span class="area-tag ${c.area}">${AREA[c.area]}</span>` : '');

  // ---------------------------------------------------------------- issues (card back + popup)

  function issueRow(c, big) {
    const p = prio(c);
    const full = big || expanded.has(c.id);
    return `
      <li class="bug ${p} ${c.resolved ? 'is-fixed' : ''} ${c.id === flashId ? 'new' : ''} ${big && c.box && !c.resolved && boxKey(c.box) === pickedArea ? 'picked' : ''}" data-issue="${c.id}">
        <input type="checkbox" class="mt-0.5 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''} title="Mark fixed">
        <div class="min-w-0 flex-1">
          <div class="bug-meta">
            <button class="prio-tag ${p}" data-cycle-priority="${c.id}" title="Change priority"><span class="dot bg-${p}"></span>${PRIORITY[p].label}</button>
            ${areaTag(c)}
            ${c.box && !c.resolved ? `<button class="mark-chip" data-show-mark="${c.id}" title="Show the marked area">${icon('pen', 11)}</button>` : ''}
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
    // in the popup, the bugs of the area picked on the image go first
    const onArea = (c) => Boolean(c.box && !c.resolved && boxKey(c.box) === pickedArea);
    if (big && pickedArea) issues.sort((a, b) => onArea(b) - onArea(a));
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
          <select name="area" class="prio-select" title="Frontend or backend">${areaOptions('frontend')}</select>
          <input name="text" class="input min-w-0 flex-1 text-sm" placeholder="Add issue" autocomplete="off">
          <button class="btn-primary px-3">Add</button>
          ${peopleBox([], '', 'w-full text-xs')}
        </form>
      </div>`;
  }

  // ---------------------------------------------------------------- board

  let loaded = false;
  let routed = false; // the #flow= / #screen= / #sanity= / #done= link was opened

  function load() {
    return $.when(api('GET', '/api/me'), api('GET', '/api/board'), api('GET', '/api/statuses'))
      .done(([user], [data], [tags]) => {
        loaded = true;
        me = user;
        products = data;
        statuses = tags;
        allModules = products.flatMap((p) => p.modules);
        selectProduct(products.some((p) => p.id === productId) ? productId : products[0] && products[0].id);
        render();
        if (!$('#statusModal').hasClass('hidden')) renderStatuses();
        if (bugsView) { renderBugs(); applyAccess(); }
        if (diagram.flowId) renderDiagram();
        if (!routed) { routed = true; openFromHash(); }
      })
      .fail((xhr) => {
        if (loaded || xhr.status === 401) return;
        $('#products, #summary').empty();
        $('#board').html(`
          <div class="mx-auto mt-16 max-w-sm text-center">
            <p class="text-slate-600">Could not load FlowTrace.</p>
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
    renderAccount();
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
          <p class="text-slate-500">${can('super') ? 'No products yet. Add one, e.g. Finzoom, Findost or IPO.' : 'No apps are shared with your login yet. Ask an admin for access.'}</p>
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
    const top = m.flows.filter((f) => !f.parentFlowId); // path flows are drawn under their condition's flow
    const mIssues = mScreens.flatMap((s) => s.comments);
    const done = mIssues.filter((c) => c.resolved).length;
    const pct = mIssues.length ? Math.round((done / mIssues.length) * 100) : 0;

    $('#board').html(`
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">${esc(m.name)}</h2>
          <p class="text-sm text-slate-500">${top.length} flows${top.length < m.flows.length ? ` · ${m.flows.length - top.length} paths` : ''} · ${mScreens.length} screens</p>
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
      ${top.map((f, i) => flowTree(f, String(i + 1), i, top.length)).join('') || '<p class="py-10 text-center text-slate-500">No flows in this module.</p>'}
    `);
    initDragging();
    afterRender(saved);
  }

  // Flows of a module in reading order with their number: 1, 1.1 (branch or screen path), 1.1.1 …, 2 …
  function numberedFlows(m) {
    const out = [];
    const walk = (f, no) => {
      out.push({ flow: f, no });
      let k = 0;
      f.screens.forEach((s) => pathsAt(s).forEach(({ path }) => walk(path, `${no}.${(k += 1)}`)));
    };
    m.flows.filter((f) => !f.parentFlowId).forEach((f, i) => walk(f, String(i + 1)));
    return out;
  }

  // A flow followed by the paths leaving its steps (condition branches, extended screens), numbered 1 → 1.1, 1.2 → 1.1.1 …
  function flowTree(f, no, i, total, from) {
    let html = flowHtml(f, no, i, total, from);
    let k = 0;
    f.screens.forEach((s) => pathsAt(s).forEach(({ path, from: at }) => {
      k += 1;
      html += flowTree(path, `${no}.${k}`, 0, 0, at);
    }));
    return html;
  }

  function flowHtml(f, no, i, total, from) {
    const screens = onlyScreens(f.screens);
    const issues = screens.flatMap((s) => s.comments);
    const done = issues.filter((c) => c.resolved).length;
    const depth = no.split('.').length - 1;
    const fromScreen = from && from.screen;
    return `
      <section class="flow ${from ? 'path' : ''} ${fromScreen ? 'from-screen' : ''}" data-flow-id="${f.id}"
        ${fromScreen ? `data-from-screen="${fromScreen.id}"` : ''} style="${depth ? `--depth:${depth}` : ''}">
        ${fromScreen ? `<svg class="elbow" aria-hidden="true"><path class="line"/><path class="head"/></svg>
          <button class="elbow-grip" data-move-path="${f.id}" title="Drag onto another screen to start this flow from there"></button>` : ''}
        <div class="flow-head">
          <span class="flow-no ${from ? 'path' : ''}">${no}</span>
          <h3 class="text-base font-semibold text-slate-900">${esc(f.name)}</h3>
          ${fromScreen ? `<button class="cond-tag tone-other mt-0" data-locate="${fromScreen.id}" title="Go to the screen this flow starts from">${icon('extend', 12)} from ${esc(fromScreen.name)}</button>` : ''}
          ${from && from.condition ? `<span class="cond-tag tone-${tone(from.branch.label)} mt-0"><span class="dot"></span>from ${esc(from.condition.name)} = ${esc(from.branch.label || '—')}</span>` : ''}
          <span class="text-sm text-slate-500">${screens.length} screens · ${done}/${issues.length} issues complete</span>
          <button class="video-btn" data-diagram="${f.id}" title="See this flow and its paths as a diagram">${icon('diagram', 12)} Diagram</button>
          ${f.video
            ? `<button class="video-btn" data-play-video="${f.id}" title="Play this flow's video">${icon('play', 12)} Video</button>`
            : `<label class="video-btn add" title="Upload a screen recording of this flow">${icon('video', 12)} Add video
                <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" class="hidden" data-upload-video="${f.id}"></label>`}
          <button class="icon-btn" data-rename-flow="${f.id}" title="Rename flow">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-delete-flow="${f.id}" title="Delete flow">${icon('trash', 14)}</button>
          ${from ? '' : `
          <button class="icon-btn" data-move-flow="${f.id}" data-move="-1" title="Move up" ${i === 0 ? 'disabled' : ''}>${icon('up', 14)}</button>
          <button class="icon-btn" data-move-flow="${f.id}" data-move="1" title="Move down" ${i === total - 1 ? 'disabled' : ''}>${icon('down', 14)}</button>`}
          <div class="ml-auto flex gap-1">
            <button class="icon-btn border border-slate-200 bg-white" data-scroll="${f.id}" data-dir="-1" title="Scroll left">${icon('left')}</button>
            <button class="icon-btn border border-slate-200 bg-white" data-scroll="${f.id}" data-dir="1" title="Scroll right">${icon('right')}</button>
          </div>
        </div>
        <div class="screens" data-flow="${f.id}">
          ${f.screens.map(screenHtml).join('')}
          ${from ? '<span class="flow-end">END</span>' : ''}
          <form class="add-screen" data-flow="${f.id}">
            <span class="text-sm font-medium text-slate-700">New screen</span>
            <input name="name" class="input text-sm" placeholder="Name">
            <input name="page" class="input text-sm" placeholder="Page, e.g. /signup/otp">
            <input name="action" class="input text-sm" placeholder="Opens when, e.g. Click &quot;Place order&quot;">
            <button class="btn-primary justify-center">Add screen</button>
            <button type="button" class="btn-secondary justify-center" data-add-popup>Add popup</button>
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
        ${arrowAdd(c)}
        <div class="flex items-center gap-2">
          <span class="cond-diamond"></span>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Condition</p>
            <h4 class="truncate text-sm font-semibold text-slate-900">${esc(c.name)}</h4>
          </div>
          <button class="icon-btn" data-copy-screen="${c.id}" title="Copy condition and its paths to other flows">${icon('copy', 14)}</button>
          <button class="icon-btn" data-rename-condition="${c.id}" title="Rename">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-cond-tool data-delete-screen="${c.id}" title="Delete condition">${icon('trash', 14)}</button>
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
              ${pathsOf(c.id, b.id).map((path) => `
                <div class="flex items-center gap-2 text-xs">
                  <span class="font-medium text-slate-500">Path</span>
                  <button class="min-w-0 flex-1 truncate text-left font-medium text-indigo-600 hover:underline" data-goto-flow="${path.id}">${esc(path.name)}</button>
                  <span class="shrink-0 text-slate-400">${onlyScreens(path.screens).length} screens</span>
                </div>`).join('') || `
                <button class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline" data-extend-path="${c.id}" data-branch-id="${b.id}">${icon('plus', 12)} Extend path</button>`}
            </li>`).join('')}
        </ul>
        <button class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline" data-add-branch="${c.id}">${icon('plus', 14)} Add branch</button>
      </div>`;
  }

  // "+" on the arrow after a card: put a new condition between it and the next card
  const arrowAdd = (s) => `<button class="arrow-add" data-insert-condition="${s.id}" title="Add a condition here">${icon('plus', 12)}</button>`;

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
      <div class="card ${isPopup(s) ? 'is-popup' : ''} ${flipped.has(s.id) ? 'flipped' : ''} ${top ? `ring-${top}` : ''}" data-id="${s.id}">
        ${arrowAdd(s)}
        <div class="card-inner">
          <div class="card-face card-front">
            <div class="preview">
              ${device(s, 'sm')}
              <span class="step">${String(i + 1).padStart(2, '0')}</span>
              ${isPopup(s) ? '<span class="kind-badge">Popup</span>' : ''}
              ${top ? `<span class="prio-badge bg-${top}">${topCount} ${PRIORITY[top].label}</span>` : ''}
            </div>
            <div class="px-3 pt-3">
              <h4 class="truncate text-sm font-semibold text-slate-900">${esc(s.name)}</h4>
              <p class="truncate font-mono text-xs text-slate-500">${esc(s.page || '—')}</p>
              ${actionTag(s)}
              ${conditionTags(s)}
            </div>
            <div class="flex items-center gap-2 px-3 pt-3">
              ${deviceToggle(s)}
              <label class="icon-btn border border-slate-200" title="Upload image">${icon('upload', 14)}${fileInput(s)}</label>
            </div>
            <div class="card-foot">
              <button class="issues-btn ${open ? 'has-open' : ''}" data-flip="${s.id}">${icon('flip', 14)} Issues <span class="count">${open} open</span></button>
              <button class="icon-btn ml-auto" data-copy-screen="${s.id}" title="Copy to other flows">${icon('copy', 14)}</button>
              <button class="icon-btn" data-extend-screen="${s.id}" title="Extend a new flow from this screen">${icon('extend', 14)}</button>
              <button class="icon-btn" data-edit-screen="${s.id}" title="Edit ${isPopup(s) ? 'popup' : 'screen'}">${icon('edit', 14)}</button>
              <button class="icon-btn danger" data-delete-screen="${s.id}" title="Delete ${isPopup(s) ? 'popup' : 'screen'}">${icon('trash', 14)}</button>
            </div>
          </div>
          <div class="card-face card-back">${issuesPanel(s, false)}</div>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- screen paths: the "L" from a card down into its new flow

  // Each screen path starts at the left, like the main row, and is joined to its source card by a dashed line:
  // down from the card, left along the gutter, down again, then right into the path's first card.
  function placeElbows() {
    $('#board .flow.from-screen').each((i, sec) => {
      const card = document.querySelector(`#board .card[data-id="${$(sec).data('from-screen')}"]`);
      const elbow = sec.querySelector('.elbow');
      const first = sec.querySelector('.screens > *');
      if (!card || !elbow || !first) return;
      const row = card.closest('.screens').getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const base = sec.getBoundingClientRect();
      const f = first.getBoundingClientRect();
      // keep the start inside the row's visible part (the card may be scrolled away)
      const x = Math.min(Math.max(c.left + c.width / 2, row.left + 16), row.right - 16) - base.left;
      const top = c.bottom - base.top;
      const turn = top + 14; // run left through the gap under the parent row
      const gutter = -12; // board padding, left of both rows
      const y = f.top - base.top + 107; // card arrow height
      const end = f.left - base.left - 4;
      elbow.querySelector('.line').setAttribute('d', `M${x} ${top}V${turn}H${gutter}V${y}H${end}`);
      elbow.querySelector('.head').setAttribute('d', `M${end - 6} ${y - 5}L${end} ${y}L${end - 6} ${y + 5}`);
      const grip = sec.querySelector('.elbow-grip');
      if (grip) Object.assign(grip.style, { left: `${x}px`, top: `${top}px` });
    });
  }
  let elbowFrame = 0;
  const queueElbows = () => { cancelAnimationFrame(elbowFrame); elbowFrame = requestAnimationFrame(placeElbows); };
  window.addEventListener('resize', queueElbows);
  // flow rows scroll sideways on their own; scroll events don't bubble, so listen while capturing
  document.addEventListener('scroll', (e) => { if (e.target.classList && e.target.classList.contains('screens')) queueElbows(); }, true);

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
    placeElbows();
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
    applyAccess();
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 38)}px`;
  }

  // ---------------------------------------------------------------- issue sheet

  function sheetRow(c) {
    const p = prio(c);
    return `
      <div class="sheet-row ${p} ${c.resolved ? 'is-fixed' : ''} ${c.id === flashId ? 'new' : ''}">
        <label class="flex items-center gap-2 pt-2 text-xs font-medium text-slate-500">
          <input type="checkbox" class="h-4 w-4 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''}>
          <span class="md:hidden">Fixed</span>
        </label>
        <div><span class="cell-label">Priority</span>
          <select class="input w-full text-sm" data-field="priority" data-id="${c.id}">${priorityOptions(p)}</select></div>
        <div><span class="cell-label">Area</span>
          <select class="input w-full text-sm" data-field="area" data-id="${c.id}">${areaOptions(c.area)}</select></div>
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
      <div class="sheet-cols"><span>Fixed</span><span>Priority</span><span>Area</span><span>Status</span><span>Issue</span><span>Assigned to</span><span>Remarks</span><span>Added</span></div>
      <div class="sheet-rows" id="sheetRows">
        ${rows.map(sheetRow).join('') || '<p class="py-12 text-center text-sm text-slate-400">No issues</p>'}
      </div>
      <form class="add-comment sheet-add" data-screen="${s.id}">
        <select name="priority" class="input text-sm">${priorityOptions('medium')}</select>
        <select name="area" class="input text-sm" title="Frontend or backend">${areaOptions('frontend')}</select>
        <select name="status" class="input text-sm" title="Status">${settableStatuses().map((x) => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join('')}</select>
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

  // ---------------------------------------------------------------- flow diagram: the flow and its paths as boxes and arrows
  //
  // Each flow is a lane (a row); a path lane starts under the step it leaves from. Everything done here — a box added
  // on an arrow, a branch pointed at a screen, a rename — goes through the same API as the board, so the board's
  // screens are created and changed along with the diagram.

  const diagram = { flowId: null, zoom: 1, condId: null, menu: null }; // menu = { flowId, after }
  const DG = { w: 190, h: 76, colW: 250, rowH: 230, pad: 48, title: 26, top: 90 };
  const TONE_COLOR = { success: '#16a34a', pending: '#d97706', fail: '#dc2626', other: '#94a3b8' };
  const dgX = (col) => DG.pad + col * DG.colW;
  const dgY = (row) => DG.pad + DG.top + row * DG.rowH;

  // Lanes in rows, laid out so nothing crosses:
  // - a path lane starts one column right of the step it leaves; its arrow runs down a "trunk" under that step
  //   (a column no lane below uses) and turns right into the lane's first box
  // - paths are placed from the rightmost step back, so a trunk never passes a lane that starts left of it
  // - branch arrows between steps of one lane arc above that lane, each on its own level (see renderDiagram)
  // Numbers still read left to right, as on the board.
  function diagramLayout(root) {
    const m = allModules.find((x) => x.flows.some((f) => f.id === root.id));
    const noOf = new Map(numberedFlows(m).map((x) => [x.flow.id, x.no]));
    const lanes = [];
    const nodes = new Map();
    const walk = (f, col, from) => {
      const lane = { flow: f, row: lanes.length, col, from, no: noOf.get(f.id) || '' };
      lanes.push(lane);
      f.screens.forEach((x, i) => nodes.set(x.id, { s: x, col: col + i, row: lane.row, lane }));
      f.screens.map((x, i) => ({ x, i })).reverse().forEach(({ x, i }) =>
        pathsAt(x).slice().reverse().forEach(({ path, from: at }) => walk(path, col + i + 1, { ...at, stepId: x.id })));
    };
    walk(root, 0, null);
    const cols = Math.max(1, ...lanes.map((l) => l.col + l.flow.screens.length + 1));
    return { m, lanes, nodes, width: dgX(cols) + DG.pad, height: dgY(lanes.length) - DG.top + DG.pad / 2 };
  }

  const bezierMid = (a, b, c, d) => [(a[0] + 3 * b[0] + 3 * c[0] + d[0]) / 8, (a[1] + 3 * b[1] + 3 * c[1] + d[1]) / 8];

  function renderDiagram() {
    const root = findFlow(diagram.flowId);
    if (!root) { closeDiagram(); return; }
    const { m, lanes, nodes, width, height } = diagramLayout(root);
    const edges = [];
    const labels = [];
    const html = [];
    const arrow = (x, y, dir, color) => {
      const d = { right: `M${x - 7} ${y - 5}L${x} ${y}L${x - 7} ${y + 5}`, down: `M${x - 5} ${y - 7}L${x} ${y}L${x + 5} ${y - 7}`, up: `M${x - 5} ${y + 7}L${x} ${y}L${x + 5} ${y + 7}` }[dir];
      edges.push(`<path class="dg-head" d="${d}" style="stroke:${color}"/>`);
    };
    const plus = (x, y, flowId, after, title) =>
      html.push(`<button class="dg-plus" style="left:${x}px;top:${y}px" data-dg-insert="${flowId}" data-after="${after || ''}" title="${title}">${icon('plus', 12)}</button>`);

    lanes.forEach((lane) => {
      const { flow, row, col } = lane;
      const y = dgY(row);
      const mid = y + DG.h / 2;
      html.push(`<div class="dg-lane" style="left:${dgX(col)}px;top:${y - DG.title}px" title="${esc(flow.name)}">
        <span class="flow-no ${lane.from ? 'path' : ''}">${lane.no}</span><span class="truncate">${esc(flow.name)}</span></div>`);
      // arrows along the lane, each with a "+" to put a screen or condition between the two steps
      flow.screens.forEach((x, i) => {
        const x0 = dgX(col + i) + DG.w;
        if (i < flow.screens.length - 1) {
          const x1 = dgX(col + i + 1);
          edges.push(`<path class="dg-edge" d="M${x0} ${mid}H${x1 - 2}"/>`);
          arrow(x1 - 1, mid, 'right', '#94a3b8');
          plus((x0 + x1) / 2, mid, flow.id, x.id, 'Add a screen or condition here');
        }
      });
      // the end of the lane: a dashed box to add the next step
      const endCol = col + flow.screens.length;
      const ex = dgX(endCol);
      if (flow.screens.length) {
        edges.push(`<path class="dg-edge ghost" d="M${ex - DG.colW + DG.w} ${mid}H${ex - 2}"/>`);
      }
      html.push(`<button class="dg-add-end" style="left:${ex}px;top:${y}px" data-dg-insert="${flow.id}" data-after="${flow.screens.length ? flow.screens[flow.screens.length - 1].id : ''}">
        ${icon('plus', 14)} Add step</button>`);
      // the arrow into this lane from the step it leaves
      if (lane.from) {
        const src = nodes.get(lane.from.stepId);
        const sx = dgX(src.col) + DG.w / 2;
        const sy = dgY(src.row) + DG.h;
        const tx = dgX(col) - 2;
        const b = lane.from.branch;
        const color = b ? TONE_COLOR[tone(b.label)] : '#818cf8';
        edges.push(`<path class="dg-edge path" d="M${sx} ${sy}V${mid - 12}Q${sx} ${mid} ${sx + 12} ${mid}H${tx}" style="stroke:${color}"/>`);
        arrow(tx + 1, mid, 'right', color);
        labels.push(`<span class="dg-label" style="left:${(sx + tx) / 2 + 6}px;top:${mid}px;--tone:${color}">${b ? esc(b.label || '—') : 'extends'}</span>`);
      }
    });

    // steps; each condition's branches that show a screen in the same lane become arcs (drawn below)
    const arcs = [];
    nodes.forEach(({ s: x, col, row }) => {
      const nx = dgX(col);
      const ny = dgY(row);
      const no = onlyScreens(findFlow(x.flowId).screens).findIndex((y) => y.id === x.id) + 1;
      if (isCondition(x)) {
        const branches = x.branches || [];
        html.push(`<div class="dg-node cond ${diagram.condId === x.id ? 'active' : ''}" style="left:${nx}px;top:${ny}px" data-dg-cond="${x.id}" title="Edit branches">
          <span class="cond-diamond sm"></span>
          <div class="min-w-0 flex-1"><p class="dg-kind">Condition</p><p class="dg-name">${esc(x.name)}</p>
            <p class="dg-page">${branches.length} branch${branches.length === 1 ? '' : 'es'}</p></div>
          <div class="dg-tools">
            <button class="icon-btn sm" data-rename-condition="${x.id}" title="Rename">${icon('edit', 12)}</button>
            <button class="icon-btn sm danger" data-cond-tool data-delete-screen="${x.id}" title="Delete condition">${icon('trash', 12)}</button>
          </div>
        </div>`);
        branches.filter((b) => b.targetId && nodes.has(b.targetId) && nodes.get(b.targetId).row === row && b.targetId !== x.id)
          .forEach((b) => arcs.push({ row, from: col, to: nodes.get(b.targetId).col, branch: b, condId: x.id }));
      } else {
        const top = topPriority(x);
        const open = x.comments.filter((c) => !c.resolved).length;
        html.push(`<div class="dg-node screen ${top ? `ring-${top}` : ''}" style="left:${nx}px;top:${ny}px" data-dg-open="${x.id}" title="Open screen">
          <span class="dg-step">${String(no).padStart(2, '0')}</span>
          <div class="min-w-0 flex-1">${isPopup(x) ? '<p class="dg-kind">Popup</p>' : ''}<p class="dg-name">${esc(x.name)}</p><p class="dg-page">${esc(x.page || '—')}</p>
            ${x.action ? `<p class="dg-action">${icon('tap', 11)} ${esc(x.action)}</p>` : ''}
            ${open ? `<p class="dg-open">${open} open issue${open === 1 ? '' : 's'}</p>` : ''}</div>
          <div class="dg-tools">
            <button class="icon-btn sm" data-edit-screen="${x.id}" title="Edit screen">${icon('edit', 12)}</button>
            <button class="icon-btn sm" data-extend-screen="${x.id}" title="Extend a new flow from this screen">${icon('extend', 12)}</button>
            <button class="icon-btn sm danger" data-delete-screen="${x.id}" title="Delete screen">${icon('trash', 12)}</button>
          </div>
        </div>`);
      }
    });

    // Branch arcs rise from the right part of the condition box and drop into the right part of the target box
    // (clear of the lane title on the left). Legs sharing a box are spread apart; each arc takes the lowest level
    // whose span is free in its lane, shorter arcs first, so arcs nest instead of crossing.
    const legs = new Map();
    const leg = (key) => { const n = legs.get(key) || 0; legs.set(key, n + 1); return n; };
    const levels = new Map(); // row → [[lo, hi], …] per level
    arcs.sort((p, q) => Math.abs(p.to - p.from) - Math.abs(q.to - q.from)).forEach((arc) => {
      const color = TONE_COLOR[tone(arc.branch.label)];
      const ax = dgX(arc.from) + DG.w - 20 - leg(`${arc.row}:${arc.from}`) * 12;
      const bx = dgX(arc.to) + DG.w - 20 - leg(`${arc.row}:${arc.to}`) * 12 - (arc.to === arc.from ? 0 : 6);
      const lo = Math.min(ax, bx) - 40;
      const hi = Math.max(ax, bx) + 40;
      const used = levels.get(arc.row) || [];
      let lvl = used.findIndex((spans) => spans.every(([l, h]) => hi < l || lo > h));
      if (lvl < 0) { lvl = used.length; used.push([]); }
      used[lvl].push([lo, hi]);
      levels.set(arc.row, used);
      const ny = dgY(arc.row);
      const top = ny - DG.title - 18 - Math.min(lvl, 3) * 16;
      edges.push(`<path class="dg-edge branch" d="M${ax} ${ny}V${top + 8}Q${ax} ${top} ${ax + Math.sign(bx - ax) * 8} ${top}H${bx - Math.sign(bx - ax) * 8}Q${bx} ${top} ${bx} ${top + 8}V${ny - 3}" style="stroke:${color}"/>`);
      arrow(bx, ny - 2, 'down', color);
      labels.push(`<span class="dg-label" style="left:${(ax + bx) / 2}px;top:${top}px;--tone:${color}">${esc(arc.branch.label || '—')}</span>`);
    });

    // branch editor under the open condition
    const cond = diagram.condId && nodes.get(diagram.condId);
    if (cond && isCondition(cond.s)) html.push(diagramBranchEditor(cond, m));
    else diagram.condId = null;
    // "+" menu: what to add
    if (diagram.menu) {
      html.push(`<div class="dg-menu" style="left:${diagram.menu.x}px;top:${diagram.menu.y}px">
        <button data-dg-new="screen">${icon('plus', 14)} Screen</button>
        <button data-dg-new="popup">${icon('plus', 14)} Popup</button>
        <button data-dg-new="condition"><span class="cond-diamond sm"></span> Condition</button>
      </div>`);
    }

    const scroll = $('#diagramBody .dg-scroll')[0];
    const at = scroll ? { left: scroll.scrollLeft, top: scroll.scrollTop } : null;
    $('#diagramBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('diagram', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${esc(root.name)} · Diagram</h3>
          <p class="truncate text-xs text-slate-500">Drag a card to move it, drag the background to look around. Click a screen to open it, a condition to edit its branches, + on an arrow to add a step. Changes update the screens.</p>
        </div>
        <div class="flex items-center gap-1">
          <button class="icon-btn border border-slate-200 bg-white" data-dg-zoom="-1" title="Zoom out">${icon('minus', 14)}</button>
          <button class="min-w-[52px] rounded-md px-2 py-1 text-xs font-medium tabular-nums text-slate-600 hover:bg-slate-100" data-dg-zoom="0" title="Reset zoom">${Math.round(diagram.zoom * 100)}%</button>
          <button class="icon-btn border border-slate-200 bg-white" data-dg-zoom="1" title="Zoom in">${icon('plus', 14)}</button>
        </div>
        <button class="icon-btn" data-close-diagram title="Close">${icon('close', 18)}</button>
      </div>
      <div class="dg-scroll">
        <div class="dg-canvas" style="width:${width}px;height:${height}px;zoom:${diagram.zoom}">
          <svg class="dg-wires" width="${width}" height="${height}" aria-hidden="true">${edges.join('')}</svg>
          ${html.join('')}
          ${labels.join('')}
        </div>
      </div>`);
    if (at) Object.assign($('#diagramBody .dg-scroll')[0], { scrollLeft: at.left, scrollTop: at.top });
    applyAccess();
  }

  function diagramBranchEditor({ s: c, col, row }, m) {
    const screens = m.flows.map((f) => ({ f, list: onlyScreens(f.screens) })).filter((g) => g.list.length);
    const options = (selected) => '<option value="">Choose screen…</option>' + screens.map(({ f, list }) =>
      `<optgroup label="${esc(f.name)}">${list.map((x) => `<option value="${x.id}" ${x.id === selected ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('');
    return `
      <div class="dg-pop" style="left:${dgX(col)}px;top:${dgY(row) + DG.h + 10}px" data-dg-pop="${c.id}">
        <div class="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
          <span class="cond-diamond sm"></span>
          <p class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">${esc(c.name)}</p>
          <button class="icon-btn sm" data-dg-cond-close title="Close">${icon('close', 12)}</button>
        </div>
        <ul class="space-y-2 p-3">
          ${(c.branches || []).map((b) => `
            <li class="branch tone-${tone(b.label)}">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-slate-500">If</span>
                <input class="input min-w-0 flex-1 py-1 text-sm" value="${esc(b.label)}" placeholder="e.g. Success" data-dg-branch-label="${b.id}">
                <button class="icon-btn sm danger" data-dg-branch-remove="${b.id}" title="Remove branch">${icon('close', 12)}</button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-slate-500">Show</span>
                <select class="input min-w-0 flex-1 py-1 text-sm" data-dg-branch-target="${b.id}">${options(b.targetId)}</select>
              </div>
              ${pathsOf(c.id, b.id).map((path) => `<p class="truncate text-xs text-slate-500">Path: <span class="font-medium text-indigo-600">${esc(path.name)}</span></p>`).join('') || `
                <button class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline" data-extend-path="${c.id}" data-branch-id="${b.id}">${icon('plus', 12)} Extend path</button>`}
            </li>`).join('')}
        </ul>
        <div class="px-3 pb-3"><button class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline" data-dg-branch-add>${icon('plus', 14)} Add branch</button></div>
      </div>`;
  }

  function openDiagram(id) {
    Object.assign(diagram, { flowId: id, condId: null, menu: null });
    renderDiagram();
    $('#diagramModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }
  function closeDiagram() {
    Object.assign(diagram, { flowId: null, condId: null, menu: null });
    $('#diagramModal').addClass('hidden');
    unlockScroll();
  }

  // branches of the open condition, changed one field at a time
  const dgBranches = () => (findScreen(diagram.condId).branches || []).map((b) => ({ id: b.id, label: b.label, targetId: b.targetId || null }));
  const dgSaveBranches = (list) => api('PATCH', `/api/screens/${diagram.condId}`, { branches: list }).done(load);

  // add a screen or condition to a flow, right after `after` (or at the end)
  function dgAdd(kind, flowId, after) {
    const place = (created) => {
      const ids = findFlow(flowId).screens.map((x) => x.id);
      const at = after ? ids.indexOf(after) + 1 : ids.length;
      if (at >= ids.length) return $.Deferred().resolve().promise();
      ids.splice(at, 0, created.id);
      return api('PUT', `/api/flows/${flowId}/order`, { ids }, null, QUIET);
    };
    ask(kind === 'condition'
      ? {
        title: 'New condition',
        fields: [{ name: 'name', label: 'Condition name', placeholder: 'e.g. Mandate status', required: true }],
        confirmText: 'Add condition',
        save: (v) => api('POST', `/api/flows/${flowId}/screens`, { type: 'condition', name: v.name }, null, QUIET).then(place).done(load),
      }
      : {
        title: kind === 'popup' ? 'New popup' : 'New screen',
        fields: screenFields({}, kind),
        confirmText: kind === 'popup' ? 'Add popup' : 'Add screen',
        save: (v) => api('POST', `/api/flows/${flowId}/screens`, v, null, QUIET).then(place).done(load),
      });
  }

  $doc.on('click', '[data-diagram]', function () { openDiagram($(this).data('diagram')); });
  $doc.on('click', '[data-close-diagram]', closeDiagram);
  $('#diagramModal').on('mousedown', function (e) { if (e.target === this) closeDiagram(); });
  $doc.on('click', '[data-dg-zoom]', function () {
    const step = Number($(this).data('dg-zoom'));
    diagram.zoom = step ? Math.min(1.5, Math.max(0.4, Math.round((diagram.zoom + step * 0.1) * 10) / 10)) : 1;
    renderDiagram();
  });
  // Dragging on the diagram: on the background it pans (hand tool); on a card (full access) it picks the card up and
  // (developer access and up) drops it into a lane — a new place in its own flow or another flow of the tree, saved like drag & drop on the board.
  // A press that barely moves is still a click.
  const dgPan = { on: false, moved: false, card: null };
  const dgNodeEl = (id) => $(`#diagramBody [data-dg-open="${id}"], #diagramBody [data-dg-cond="${id}"]`);

  // Where a card dropped at canvas point (cx, cy) goes: { lane, index } (index among the lane's steps without the
  // card itself), or null outside every lane / into a path that starts from the card (it would hang off itself).
  function dgDropAt(cx, cy) {
    const { lanes, id } = dgPan.card;
    const row = Math.round((cy - dgY(0) - DG.h / 2) / DG.rowH);
    const lane = lanes[row];
    if (!lane || Math.abs(cy - (dgY(row) + DG.h / 2)) > DG.rowH / 2) return null;
    for (let l = lane; l && l.from; l = dgPan.card.nodes.get(l.from.stepId).lane) if (l.from.stepId === id) return null;
    const ids = lane.flow.screens.map((x) => x.id);
    let index = Math.min(ids.length, Math.max(0, Math.round((cx - dgX(lane.col) + (DG.colW - DG.w) / 2) / DG.colW)));
    const own = ids.indexOf(id);
    if (own >= 0 && own < index) index -= 1;
    return { lane, index };
  }

  $doc.on('mousedown', '#diagramBody .dg-scroll', function (e) {
    if (e.button !== 0 || $(e.target).closest('button, a, input, select, textarea, label, .dg-pop, .dg-menu').length) return;
    e.preventDefault(); // no text selection while dragging
    const $node = $(e.target).closest('.dg-node');
    const id = $node.data('dg-open') || $node.data('dg-cond');
    const root = findFlow(diagram.flowId);
    const card = id && can('developer') && root ? { id, ...diagramLayout(root) } : null;
    Object.assign(dgPan, { on: true, moved: false, card, x: e.clientX, y: e.clientY, left: this.scrollLeft, top: this.scrollTop });
  });
  $(window).on('mousemove', (e) => {
    if (!dgPan.on) return;
    const dx = e.clientX - dgPan.x;
    const dy = e.clientY - dgPan.y;
    if (!dgPan.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    dgPan.moved = true;
    const $scroll = $('#diagramBody .dg-scroll'); // re-found: a reload can re-render the diagram mid-drag
    const scroll = $scroll[0];
    if (!scroll) return;
    if (!dgPan.card) {
      $scroll.addClass('panning');
      Object.assign(scroll, { scrollLeft: dgPan.left - dx, scrollTop: dgPan.top - dy });
      return;
    }
    // the card follows the pointer (also when the view scrolls under it near an edge)
    const box = scroll.getBoundingClientRect();
    const edge = (v, lo, hi) => (v < lo + 40 ? -14 : v > hi - 40 ? 14 : 0);
    scroll.scrollLeft += edge(e.clientX, box.left, box.right);
    scroll.scrollTop += edge(e.clientY, box.top, box.bottom);
    const z = diagram.zoom;
    const sx = (scroll.scrollLeft - dgPan.left) / z;
    const sy = (scroll.scrollTop - dgPan.top) / z;
    $scroll.addClass('moving-card');
    dgNodeEl(dgPan.card.id).addClass('lifted').css('transform', `translate(${dx / z + sx}px, ${dy / z + sy}px)`);
    const canvas = $scroll.find('.dg-canvas')[0].getBoundingClientRect();
    const drop = dgDropAt((e.clientX - canvas.left) / z, (e.clientY - canvas.top) / z);
    let $mark = $scroll.find('.dg-drop');
    if (!drop) { $mark.remove(); return; }
    if (!$mark.length) $mark = $('<div class="dg-drop"></div>').appendTo($scroll.find('.dg-canvas'));
    // the gap before the step now at `index` (counted without the card itself)
    const others = drop.lane.flow.screens.filter((x) => x.id !== dgPan.card.id);
    const colOf = (x) => dgPan.card.nodes.get(x.id).col;
    const col = others[drop.index] ? colOf(others[drop.index]) : others.length ? colOf(others[others.length - 1]) + 1 : drop.lane.col;
    $mark.css({ left: dgX(col) - (DG.colW - DG.w) / 2, top: dgY(drop.lane.row) - 6 });
    dgPan.card.drop = drop;
  });
  $(window).on('mouseup', () => {
    if (!dgPan.on) return;
    dgPan.on = false;
    $('#diagramBody .dg-scroll').removeClass('panning moving-card').find('.dg-drop').remove();
    setTimeout(() => { dgPan.moved = false; }); // after this mouseup's click (if any) has been handled
    const { card } = dgPan;
    dgPan.card = null;
    if (!card || !dgPan.moved) return;
    dgNodeEl(card.id).removeClass('lifted').css('transform', '');
    if (!card.drop) return;
    const { lane: { flow }, index } = card.drop;
    const step = findScreen(card.id);
    const from = findFlow(step.flowId);
    const ids = flow.screens.map((x) => x.id).filter((x) => x !== card.id);
    ids.splice(index, 0, card.id);
    if (from.id === flow.id && ids.every((x, i) => x === from.screens[i].id)) return; // dropped where it was
    // show it in the new place right away, then save and reload
    from.screens = from.screens.filter((x) => x.id !== card.id);
    step.flowId = flow.id;
    flow.screens.splice(index, 0, step);
    renderDiagram();
    api('PUT', `/api/flows/${flow.id}/order`, { ids }).always(load);
  });
  // the click that ends a drag must not open the card it was released on
  document.addEventListener('click', (e) => {
    if (dgPan.moved && $(e.target).closest('#diagramBody').length) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  // clicks on the canvas: open a screen, open a condition's branches, or close what is open
  $doc.on('click', '#diagramBody .dg-canvas', function (e) {
    const $t = $(e.target);
    if ($t.closest('.dg-pop, .dg-menu, .dg-tools, [data-dg-insert]').length) return;
    const open = $t.closest('[data-dg-open]').data('dg-open');
    const cond = $t.closest('[data-dg-cond]').data('dg-cond');
    if (open) { openPopup(open); return; }
    diagram.condId = cond && cond !== diagram.condId ? cond : null;
    diagram.menu = null;
    renderDiagram();
  });
  $doc.on('click', '[data-dg-cond-close]', () => { diagram.condId = null; renderDiagram(); });
  $doc.on('click', '[data-dg-insert]', function (e) {
    e.stopPropagation();
    const canvas = $(this).closest('.dg-canvas')[0].getBoundingClientRect();
    const r = this.getBoundingClientRect();
    diagram.condId = null;
    diagram.menu = {
      flowId: $(this).data('dg-insert'),
      after: $(this).data('after') || null,
      x: (r.left - canvas.left) / diagram.zoom,
      y: (r.bottom - canvas.top) / diagram.zoom + 6,
    };
    renderDiagram();
  });
  $doc.on('click', '[data-dg-new]', function () {
    const { flowId, after } = diagram.menu;
    diagram.menu = null;
    renderDiagram();
    dgAdd($(this).data('dg-new'), flowId, after);
  });
  $doc.on('change', '[data-dg-branch-label]', function () {
    const id = $(this).data('dg-branch-label');
    dgSaveBranches(dgBranches().map((b) => (b.id === id ? { ...b, label: this.value.trim() } : b)));
  });
  $doc.on('change', '[data-dg-branch-target]', function () {
    const id = $(this).data('dg-branch-target');
    dgSaveBranches(dgBranches().map((b) => (b.id === id ? { ...b, targetId: this.value || null } : b)));
  });
  $doc.on('click', '[data-dg-branch-add]', () => dgSaveBranches(dgBranches().concat({ label: '', targetId: null })));
  $doc.on('click', '[data-dg-branch-remove]', function () {
    const gone = $(this).data('dg-branch-remove');
    const paths = pathsOf(diagram.condId, gone);
    const save = () => dgSaveBranches(dgBranches().filter((b) => b.id !== gone));
    if (!paths.length) { save(); return; }
    dialog.confirm({
      title: 'Remove this branch?',
      message: `Its path “${paths[0].name}” and the screens in it will be removed from the sheet too.`,
      confirmText: 'Remove',
      danger: true,
      onConfirm: save,
    });
  });

  // ---------------------------------------------------------------- screen popup

  function renderPopup() {
    $('.mark-menu').remove();
    const s = findScreen(openId);
    if (!s) { closePopup(); return; }
    const linked = linkedCopies(s);
    const { prev, next, at, total } = popupSiblings(s);
    $('#popupBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium tabular-nums text-slate-500" title="Screen in this flow">${at} / ${total}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-lg font-semibold text-slate-900">${esc(s.name)}</h3>
          <p class="truncate font-mono text-xs text-slate-500">${isPopup(s) ? '<span class="kind-badge static">Popup</span> ' : ''}${esc(s.page || '—')}</p>
          ${actionTag(s)}
          ${conditionTags(s)}
          ${linked.length ? `<p class="mt-1 text-xs text-slate-500">Also in: ${linked.map((l) => `<button class="text-indigo-600 hover:underline" data-goto="${l.screen.id}" data-module="${l.module.id}" data-product-id="${l.product.id}">${l.product.id !== productId ? `${esc(l.product.name)} › ` : ''}${esc(l.module.name)} › ${esc(l.flow.name)}</button>`).join(', ')}</p>` : ''}
        </div>
        <button class="btn-secondary" data-copy-screen="${s.id}">${icon('copy', 14)} Copy to flows</button>
        <button class="icon-btn" data-edit-screen="${s.id}" title="Edit screen">${icon('edit')}</button>
        <button class="icon-btn" data-close-popup title="Close">${icon('close', 18)}</button>
      </div>
      <div class="grid gap-6 p-5 md:grid-cols-[1fr_340px]">
        <div class="popup-stage">
          ${s.image ? `<div class="pen-bar">
            <button class="pen-btn ${pen ? 'on' : ''}" data-pen title="Draw a box over the image, then add a bug or a link to another screen (Esc to stop)">${icon('pen', 14)} ${pen ? 'Drawing… click to stop' : 'Pen'}</button>
          </div>` : ''}
          ${device(s, 'lg')}
        </div>
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
          <div class="issues-panel border-t border-slate-200 pt-4">${issuesPanel(s, true)}</div>
        </div>
      </div>
      <button class="popup-nav prev" data-popup-go="${prev ? prev.id : ''}" title="Previous screen in this flow (←)" ${prev ? '' : 'disabled'}>${icon('left', 20)}</button>
      ${next && next.condition
        ? `<button class="popup-nav next" data-popup-choose title="${esc(next.condition.name)}: choose where to continue (→)">${icon('right', 20)}</button>
          <div class="popup-choices hidden">
            <p class="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-semibold text-slate-900"><span class="cond-diamond sm"></span>${esc(next.condition.name)}</p>
            <p class="px-3 pb-2 text-xs text-slate-500">Continue with</p>
            ${next.choices.map((c, k) => `
              <button class="popup-choice" data-popup-go="${c.screen.id}">
                <span class="cond-tag tone-${tone(c.branch.label)} mt-0"><span class="dot"></span>${esc(c.branch.label || '—')}</span>
                <span class="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900">${esc(c.screen.name)}</span>
                ${c.flow && c.flow.id !== s.flowId ? `<span class="max-w-[90px] shrink-0 truncate text-xs text-slate-400">${esc(c.flow.name)}</span>` : ''}
                <kbd>${k + 1}</kbd>
              </button>`).join('') || '<p class="px-3 pb-3 text-sm text-slate-500">No branch leads to a screen yet.</p>'}
          </div>`
        : `<button class="popup-nav next" data-popup-go="${next ? next.id : ''}" title="Next screen in this flow (→)" ${next ? '' : 'disabled'}>${icon('right', 20)}</button>`}`);
  }

  // Where ← and → lead from a screen in its flow. Going back skips conditions; going forward into a condition
  // offers its branches instead: each one's target screen and/or the first screen of its path.
  function popupSiblings(s) {
    const f = findFlow(s.flowId);
    const steps = f ? f.screens : [s];
    const list = onlyScreens(steps);
    const i = steps.findIndex((x) => x.id === s.id);
    const prev = steps.slice(0, i).reverse().find((x) => !isCondition(x));
    let next = steps[i + 1];
    if (next && isCondition(next)) {
      const c = next;
      const choices = (c.branches || []).flatMap((branch) => {
        const target = branch.targetId && findScreen(branch.targetId);
        const starts = pathsOf(c.id, branch.id).map((path) => onlyScreens(path.screens)[0]).filter(Boolean);
        return [target, ...starts].filter(Boolean).map((screen) => ({ branch, screen, flow: findFlow(screen.flowId) }));
      });
      next = { condition: c, choices };
    }
    return { prev, next, at: list.findIndex((x) => x.id === s.id) + 1, total: list.length };
  }

  function openPopup(id) {
    if (id !== openId) pickedArea = null;
    openId = id;
    renderPopup();
    afterRender({});
    $('#popup').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closePopup() {
    openId = null;
    pen = false;
    draft = null;
    pickedArea = null;
    $('.mark-menu').remove();
    $('#popup').addClass('hidden');
    unlockScroll();
  }

  // ---------------------------------------------------------------- copy screen to other flows

  function openCopy(id) {
    const s = findScreen(id);
    const cond = isCondition(s);
    const hasIt = (f) => (cond ? f.id === s.flowId : f.screens.some((x) => x.id === s.id || (s.linkId && x.linkId === s.linkId)));
    const openCount = (cond ? pathScreens(s) : [s]).flatMap((x) => x.comments).filter((c) => !c.resolved).length;

    $('#copyForm').data('screen', s.id).html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">Copy “${esc(s.name)}” to flows</h3>
        <button type="button" class="icon-btn" data-close-copy title="Close">${icon('close', 18)}</button>
      </div>
      <div class="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4">
        <p class="text-xs text-slate-500">${cond
          ? 'The condition, its branches and every branch path with its screens (page, platform, wireframe, image) are copied. Each copy has its own issues.'
          : 'Name, page, platform, wireframe and image are copied. Each copy has its own issues.'}</p>
        ${products.flatMap((p) => p.modules.map((m) => ({ p, m }))).map(({ p, m }) => `
          <div>
            <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">${esc(p.name)} › ${esc(m.name)}</p>
            ${m.flows.map((f) => {
              const disabled = hasIt(f);
              return `<label class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${disabled ? 'text-slate-400' : 'cursor-pointer hover:bg-slate-50'}">
                <input type="checkbox" name="flowIds" value="${f.id}" class="h-4 w-4 accent-indigo-600" ${disabled ? 'disabled' : ''}>
                <span class="flex-1">${esc(f.name)}</span>
                ${disabled ? `<span class="text-xs">${cond ? 'This condition is here' : 'Already has this screen'}</span>` : `<span class="text-xs text-slate-400">${onlyScreens(f.screens).length} screens</span>`}
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
          <div class="bugs-row ${p} ${c.resolved ? 'is-fixed' : ''}">
            <div class="min-w-0">
              <p class="truncate text-xs text-slate-500">${esc(m.name)} › ${esc(f.name)}</p>
              <p class="truncate text-sm font-medium text-slate-900">${esc(s.name)}</p>
            </div>
            <div class="flex flex-col items-start gap-1"><span class="prio-tag ${p}"><span class="dot bg-${p}"></span>${PRIORITY[p].label}</span>${areaTag(c)}</div>
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
    applyAccess();
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

  // ---------------------------------------------------------------- account + sign in

  function renderAccount() {
    if (!me) { $('#account').empty(); return; }
    const current = products.find((p) => p.id === productId);
    const version = current && current.version ? current.version.replace(/^v(?=\d)/i, '') : '';
    $('#account').html(`
      ${version ? `<button class="version-tag" data-action="sanity-logs" title="Present version of ${esc(current.name)}: the latest version tested in Sanity. Opens the sanity logs.">v${esc(version)}</button>` : ''}
      <span class="account" title="${esc(ACCESS[me.access].hint)}">${icon('user', 14)} ${esc(me.name || me.username)}
        <span class="access-tag access-${me.access}">${ACCESS[me.access].label}</span></span>
      <button class="btn-secondary px-3 py-1 text-xs" data-action="sheets" title="Your own sheets: typed columns, links to flows and screens, Excel in and out">${icon('grid', 12)} Sheets</button>
      <button class="btn-secondary px-3 py-1 text-xs ${sanity ? 'on' : ''}" data-action="sanity" title="Daily sanity checklist of this app">${icon('check', 12)} Sanity</button>
      <button class="btn-secondary px-3 py-1 text-xs" data-action="done" title="What you finished today, shared on Teams">${icon('note', 12)} Done today</button>
      <button class="btn-primary px-3 py-1 text-xs" data-action="writer" title="Write an issue on any screen">${icon('plus', 12)} Write issue</button>
      <a class="btn-secondary px-3 py-1 text-xs" href="/api/export" title="Download every task as an Excel sheet">${icon('download', 12)} Excel</a>
      <button class="btn-secondary px-3 py-1 text-xs" data-action="admin">Admin</button>
      <button class="tab-add" data-action="logout">Sign out</button>`);
  }

  function showLogin() {
    if (!$('#login').hasClass('hidden')) return;
    $('.overlay, .sheet, .dialog-overlay').addClass('hidden');
    $('#login').removeClass('hidden');
    $('#loginForm .dialog-error').addClass('hidden');
    setTimeout(() => $('#loginForm [name=username]').trigger('focus'), 30);
  }

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    const $err = $(this).find('.dialog-error').addClass('hidden');
    api('POST', '/api/login', data, null, QUIET)
      .done(() => { $('#login').addClass('hidden'); this.reset(); location.reload(); })
      .fail((xhr) => $err.text(errorText(xhr)).removeClass('hidden'));
  });
  $doc.on('click', '[data-action="logout"]', () => api('POST', '/api/logout').always(() => location.reload()));

  // ---------------------------------------------------------------- admin dashboard (super admins): logins + app access

  let users = [];
  let editing = null; // user being edited, null = new login

  function renderAdmin() {
    const u = users.find((x) => x.id === editing) || null;
    const access = u ? u.access : 'view';
    const all = u ? u.allProducts : false;
    const appNames = (x) => (x.allProducts ? 'All apps' : x.productIds.map((id) => (products.find((p) => p.id === id) || {}).name).filter(Boolean).join(', ') || 'No apps');
    $('#adminBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 text-base font-semibold text-slate-900">Logins and access</h3>
        <button class="icon-btn" data-close-admin title="Close">${icon('close', 18)}</button>
      </div>
      <div class="grid gap-5 p-5 md:grid-cols-[1fr_340px]">
        <div class="min-w-0">
          <div class="admin-list">
            ${users.map((x) => `
              <div class="admin-row ${x.id === editing ? 'on' : ''}">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-slate-900">${esc(x.name || x.username)} ${x.id === me.id ? '<span class="text-xs font-normal text-slate-400">(you)</span>' : ''}</p>
                  <p class="truncate text-xs text-slate-500"><span class="font-mono">${esc(x.username)}</span> · ${esc(appNames(x))}</p>
                </div>
                ${x.sanityTester ? '<span class="access-tag sanity-tag">Sanity</span>' : ''}
                <span class="access-tag access-${x.access}">${ACCESS[x.access].label}</span>
                <button class="icon-btn" data-admin-edit="${x.id}" title="Edit">${icon('edit', 14)}</button>
                ${x.id === me.id ? '<span class="w-7"></span>' : `<button class="icon-btn danger" data-admin-delete="${x.id}" title="Delete login">${icon('trash', 14)}</button>`}
              </div>`).join('')}
          </div>
        </div>
        <form id="adminForm" class="space-y-3" autocomplete="off">
          <h4 class="text-sm font-semibold text-slate-900">${u ? `Edit ${esc(u.username)}` : 'New login'}</h4>
          <label class="block"><span class="field-label">Username</span>
            <input class="input w-full" name="username" value="${esc(u ? u.username : '')}" ${u ? 'disabled' : ''} placeholder="e.g. priya.qa" maxlength="40"></label>
          <label class="block"><span class="field-label">Name</span>
            <input class="input w-full" name="name" value="${esc(u ? u.name : '')}" placeholder="e.g. Priya Sharma" maxlength="80"></label>
          <label class="block"><span class="field-label">${u ? 'New password' : 'Password'}</span>
            <input class="input w-full" type="password" name="password" autocomplete="new-password" placeholder="${u ? 'Leave blank to keep the current one' : 'At least 8 characters'}"></label>
          <div><span class="field-label">Access</span>
            ${Object.entries(ACCESS).map(([k, a]) => `
              <label class="access-opt">
                <input type="radio" name="access" value="${k}" class="mt-0.5 accent-indigo-600" ${k === access ? 'checked' : ''} ${u && u.id === me.id && k !== 'super' ? 'disabled' : ''}>
                <span><span class="text-sm font-medium text-slate-900">${a.label}</span><span class="block text-xs text-slate-500">${a.hint}</span></span>
              </label>`).join('')}
          </div>
          <label class="access-opt">
            <input type="checkbox" name="sanityTester" class="mt-0.5 h-4 w-4 accent-indigo-600" ${u && u.sanityTester ? 'checked' : ''}>
            <span><span class="text-sm font-medium text-slate-900">Sanity tester</span><span class="block text-xs text-slate-500">On top of the access above: can run the daily sanity checklist (Done / Failed, review, version and time). Testers, developers and super admins always can.</span></span>
          </label>
          <label class="block"><span class="field-label">Teams email <span class="font-normal text-slate-400">(optional, to @mention them)</span></span>
            <input class="input w-full" name="teamsEmail" value="${esc(u ? u.teamsEmail : '')}" placeholder="e.g. priya@company.com" maxlength="120"></label>
          <div><span class="field-label">Apps this login can open</span>
            <label class="flex items-center gap-2 py-1 text-sm"><input type="checkbox" name="allProducts" class="h-4 w-4 accent-indigo-600" ${all ? 'checked' : ''}> All apps (also new ones)</label>
            ${products.map((p) => `
              <label class="flex items-center gap-2 py-1 pl-6 text-sm"><input type="checkbox" name="productIds" value="${p.id}" class="h-4 w-4 accent-indigo-600" ${u && u.productIds.includes(p.id) ? 'checked' : ''}> ${esc(p.name)}</label>`).join('') || '<p class="pl-6 text-xs text-slate-400">No apps yet</p>'}
          </div>
          <p class="dialog-error hidden"></p>
          <div class="flex justify-end gap-2 pt-1">
            ${u ? '<button type="button" class="btn-secondary" data-admin-new>Cancel</button>' : ''}
            <button class="btn-primary">${u ? 'Save changes' : 'Create login'}</button>
          </div>
        </form>
      </div>`);
    syncAppBoxes();
  }

  // Super admins and "All apps" logins see every app, so the single-app boxes don't apply.
  function syncAppBoxes() {
    const $f = $('#adminForm');
    const isSuper = $f.find('[name=access]:checked').val() === 'super';
    $f.find('[name=allProducts]').prop('disabled', isSuper);
    if (isSuper) $f.find('[name=allProducts]').prop('checked', true);
    $f.find('[name=productIds]').prop('disabled', $f.find('[name=allProducts]').is(':checked'));
  }

  const loadUsers = () => api('GET', '/api/users').done((list) => { users = list; renderAdmin(); });

  function openAdmin() {
    editing = null;
    loadUsers().done(() => {
      $('#adminModal').removeClass('hidden');
      $('body').addClass('overflow-hidden');
    });
  }

  function closeAdmin() {
    $('#adminModal').addClass('hidden');
    unlockScroll();
  }

  $doc.on('click', '[data-action="admin"]', openAdmin);
  $doc.on('click', '[data-close-admin]', closeAdmin);
  $('#adminModal').on('mousedown', function (e) { if (e.target === this) closeAdmin(); });
  $doc.on('click', '[data-admin-edit]', function () { editing = $(this).data('admin-edit'); renderAdmin(); });
  $doc.on('click', '[data-admin-new]', () => { editing = null; renderAdmin(); });
  $doc.on('change', '#adminForm [name=access], #adminForm [name=allProducts]', syncAppBoxes);
  $doc.on('submit', '#adminForm', function (e) {
    e.preventDefault();
    const $f = $(this);
    const body = {
      name: $f.find('[name=name]').val().trim(),
      access: $f.find('[name=access]:checked').val(),
      allProducts: $f.find('[name=allProducts]').is(':checked'),
      productIds: $f.find('[name=productIds]:checked').map((i, el) => el.value).get(),
      sanityTester: $f.find('[name=sanityTester]').is(':checked'),
      teamsEmail: $f.find('[name=teamsEmail]').val().trim(),
    };
    const pass = $f.find('[name=password]').val();
    if (pass) body.password = pass;
    if (!editing) body.username = $f.find('[name=username]').val().trim();
    const $err = $f.find('.dialog-error').addClass('hidden');
    const self = editing === me.id;
    api(editing ? 'PATCH' : 'POST', editing ? `/api/users/${editing}` : '/api/users', body, null, QUIET)
      .done(() => {
        toast(editing ? 'Saved' : 'Login created');
        editing = null;
        loadUsers();
        if (self) load();
      })
      .fail((xhr) => $err.text(errorText(xhr)).removeClass('hidden'));
  });
  $doc.on('click', '[data-admin-delete]', function () {
    const u = users.find((x) => x.id === $(this).data('admin-delete'));
    dialog.confirm({
      title: `Delete login “${u.username}”?`,
      message: 'They will be signed out and cannot sign in again. Their issues and history stay.',
      confirmText: 'Delete',
      danger: true,
      onConfirm: () => api('DELETE', `/api/users/${u.id}`, null, null, QUIET).done(() => { if (editing === u.id) editing = null; loadUsers(); }),
    });
  });

  // ---------------------------------------------------------------- flow videos

  let videoFlowId = null;

  function renderVideo() {
    const f = findFlow(videoFlowId);
    if (!f || !f.video) { closeVideo(); return; }
    $('#videoBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">${esc(f.name)} — Video</h3>
        <label class="btn-secondary">${icon('upload', 14)} Replace
          <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" class="hidden" data-upload-video="${f.id}"></label>
        <button class="btn-secondary" data-remove-video="${f.id}">Remove</button>
        <button class="icon-btn" data-close-video title="Close">${icon('close', 18)}</button>
      </div>
      <div class="bg-slate-900 p-3"><video class="mx-auto max-h-[75vh] w-full rounded" src="${esc(f.video)}" controls autoplay playsinline></video></div>`);
    applyAccess();
  }

  function openVideo(id) {
    videoFlowId = id;
    renderVideo();
    $('#videoModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function closeVideo() {
    videoFlowId = null;
    $('#videoBody').empty(); // stops playback
    $('#videoModal').addClass('hidden');
    unlockScroll();
  }

  $doc.on('click', '[data-play-video]', function () { openVideo($(this).data('play-video')); });
  $doc.on('click', '[data-close-video]', closeVideo);
  $('#videoModal').on('mousedown', function (e) { if (e.target === this) closeVideo(); });
  $doc.on('click', '[data-remove-video]', function () {
    const id = $(this).data('remove-video');
    dialog.confirm({
      title: 'Remove this video?', message: 'The flow will have no video until you upload one again.', confirmText: 'Remove', danger: true,
      onConfirm: () => api('DELETE', `/api/flows/${id}/video`, null, null, QUIET).done(() => { closeVideo(); load(); }),
    });
  });

  // Sent as the raw file (not JSON) with upload progress on the button.
  $doc.on('change', '[data-upload-video]', function () {
    const id = $(this).data('upload-video');
    const file = this.files[0];
    this.value = '';
    if (!file) return;
    if (!/^video\//.test(file.type)) { dialog.alert('Please choose a video file (MP4, MOV or WEBM).', 'Not a video'); return; }
    if (file.size > 100 * 1024 * 1024) { dialog.alert('Please choose a video under 100 MB.', 'Video too large'); return; }
    const label = this.closest('label');
    const $label = $(label);
    const before = $label.contents().filter((i, n) => n.nodeType === 3).last();
    const show = (t) => before.length && (before[0].textContent = ` ${t} `);
    setBusy(label, true);
    startLoading();
    $.ajax({
      method: 'POST', url: `/api/flows/${id}/video`, data: file, processData: false, contentType: file.type,
      xhr: () => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => { if (e.lengthComputable) show(`Uploading ${Math.round((e.loaded / e.total) * 100)}%`); });
        return xhr;
      },
    })
      .always(() => { setBusy(label, false); stopLoading(); })
      .done(() => { toast('Video uploaded'); load().done(() => { if (videoFlowId) renderVideo(); }); })
      .fail((xhr) => {
        show('Add video');
        if (xhr.status === 401) showLogin();
        else dialog.alert(xhr.status === 413 ? 'Please choose a video under 100 MB.' : errorText(xhr), 'Upload failed');
      });
  });

  // ---------------------------------------------------------------- issue writer: one row per issue — app → flow → screen, issue, priority …

  // what a new writer starts on; each row then keeps its own app / flow / screen
  const writer = { productId: null, flowId: null, screenId: null };

  function writerFlows(pid) {
    const p = products.find((x) => x.id === pid);
    return p ? p.modules.map((m) => ({ m, list: numberedFlows(m) })) : [];
  }

  // Fill a row's flow and screen lists, keeping its picks where they still exist
  function renderRowScreens($row) {
    const f = findFlow($row.find('[name=flow]').val());
    const list = f ? onlyScreens(f.screens) : [];
    const keep = $row.data('screen');
    const sid = list.some((x) => x.id === keep) ? keep : list[0] && list[0].id;
    $row.data('screen', sid || null);
    $row.find('[name=screen]').html(list.length
      ? list.map((x, i) => `<option value="${x.id}" ${x.id === sid ? 'selected' : ''}>${String(i + 1).padStart(2, '0')} · ${esc(x.name)}${x.page ? ` (${esc(x.page)})` : ''}</option>`).join('')
      : '<option value="">No screens in this flow</option>').prop('disabled', !list.length);
  }

  function renderRowFlows($row) {
    const groups = writerFlows($row.find('[name=product]').val() || $row.data('product'));
    const all = groups.flatMap((g) => g.list.map((x) => x.flow));
    const keep = $row.data('flow');
    const fid = all.some((f) => f.id === keep) ? keep : all[0] && all[0].id;
    $row.data('flow', fid || null);
    $row.find('[name=flow]').html(groups.map(({ m, list }) => `<optgroup label="${esc(m.name)}">${list.map(({ flow, no }) =>
      `<option value="${flow.id}" ${flow.id === fid ? 'selected' : ''}>${no} · ${esc(flow.name)}</option>`).join('')}</optgroup>`).join('')
      || '<option value="">No flows yet</option>').prop('disabled', !all.length);
    renderRowScreens($row);
  }

  // One issue as a card: where (app, flow, screen) / priority, issue, status / who (assign, remarks)
  function writerRow(at) {
    const field = (label, html) => `<label class="block min-w-0"><span class="field-label">${label}</span>${html}</label>`;
    const $row = $(`
      <div class="writer-row" data-product="${at.productId || ''}" data-flow="${at.flowId || ''}" data-screen="${at.screenId || ''}">
        <div class="writer-line where ${products.length > 1 ? 'multi' : ''}">
          ${products.length > 1 ? field('App', `<select class="input w-full" name="product">${products.map((p) =>
            `<option value="${p.id}" ${p.id === at.productId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`) : ''}
          ${field('Flow name', '<select class="input w-full" name="flow"></select>')}
          ${field('Screen name', '<select class="input w-full" name="screen"></select>')}
          <div class="writer-actions">
            <button type="button" class="icon-btn" data-add-issue title="Add another issue">${icon('plus', 16)}</button>
            <button type="button" class="icon-btn danger" data-remove-issue title="Remove this issue">${icon('close', 16)}</button>
          </div>
        </div>
        <div class="writer-line what">
          ${field('Priority', `<select class="input w-full" name="priority">${priorityOptions('medium')}</select>`)}
          ${field('Area', `<select class="input w-full" name="area">${areaOptions('frontend')}</select>`)}
          ${field('Issue', '<textarea class="input w-full" name="text" rows="1" maxlength="1000" placeholder="What is wrong?"></textarea>')}
          ${field('Status', `<select class="input w-full" name="status">${settableStatuses().map((x) => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join('')}</select>`)}
        </div>
        <div class="writer-line who">
          <div class="min-w-0"><span class="field-label">Assign to</span>${peopleBox([], '', 'text-sm')}</div>
          ${field('Remarks <span class="font-normal text-slate-400">(optional)</span>', '<input class="input w-full" name="remarks" maxlength="1000" autocomplete="off">')}
        </div>
      </div>`);
    renderRowFlows($row);
    return $row;
  }
  const rowPlace = ($row) => ({ productId: $row.find('[name=product]').val() || $row.data('product'), flowId: $row.data('flow'), screenId: $row.data('screen') });
  const growIssue = (el) => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight + 2}px`; };

  function openWriter() {
    writer.productId = products.some((p) => p.id === writer.productId) ? writer.productId : productId;
    // start from the module on screen
    const m = modules.find((x) => x.id === activeId);
    if (writer.productId === productId && m && !m.flows.some((f) => f.id === writer.flowId)) writer.flowId = m.flows[0] && m.flows[0].id;
    $('#writerForm').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 text-base font-semibold text-slate-900">Write an issue</h3>
        <button type="button" class="icon-btn" data-close-writer title="Close">${icon('close', 18)}</button>
      </div>
      <div class="writer-body px-5 py-4">
        <div class="writer-grid"></div>
      </div>
      <div class="px-5">
        <p class="dialog-error hidden"></p>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button type="button" class="btn-secondary" data-close-writer>Close</button>
        <button class="btn-primary">Add issues</button>
      </div>`);
    $('#writerForm .writer-grid').append(writerRow(writer));
    $('#writerModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
    setTimeout(() => $('#writerForm [name=text]').first().trigger('focus'), 30);
  }

  function closeWriter() {
    $('#writerModal').addClass('hidden');
    unlockScroll();
  }

  $doc.on('click', '[data-action="writer"]', openWriter);
  $doc.on('click', '[data-close-writer]', closeWriter);
  $('#writerModal').on('mousedown', function (e) { if (e.target === this) closeWriter(); });
  $doc.on('change', '#writerForm [name=product]', function () {
    const $row = $(this).closest('.writer-row').data({ product: this.value, flow: null, screen: null });
    renderRowFlows($row);
    Object.assign(writer, rowPlace($row));
  });
  $doc.on('change', '#writerForm [name=flow]', function () {
    const $row = $(this).closest('.writer-row').data({ flow: this.value, screen: null });
    renderRowScreens($row);
    Object.assign(writer, rowPlace($row));
  });
  $doc.on('change', '#writerForm [name=screen]', function () {
    const $row = $(this).closest('.writer-row').data('screen', this.value);
    Object.assign(writer, rowPlace($row));
  });
  $doc.on('input', '#writerForm [name=text]', function () { growIssue(this); });
  // + → a fresh row on the same app / flow / screen, every other field back to its default
  $doc.on('click', '#writerForm [data-add-issue]', function () {
    const $at = $(this).closest('.writer-row');
    writerRow(rowPlace($at)).insertAfter($at).find('[name=text]').trigger('focus');
  });
  $doc.on('click', '#writerForm [data-remove-issue]', function () {
    const $row = $(this).closest('.writer-row');
    const $near = $row.next('.writer-row').length ? $row.next() : $row.prev('.writer-row');
    $near.find('[name=text]').trigger('focus');
    $row.remove();
  });
  $('#writerForm').on('submit', function (e) {
    e.preventDefault();
    const $f = $(this);
    const $err = $f.find('.dialog-error').addClass('hidden');
    const $rows = $f.find('.writer-row').filter((i, el) => $(el).find('[name=text]').val().trim());
    if (!$rows.length) { $err.text('Issue is required.').removeClass('hidden'); $f.find('[name=text]').first().trigger('focus'); return; }
    const $lost = $rows.filter((i, el) => !$(el).data('screen'));
    if ($lost.length) { $err.text('Pick a screen for every issue.').removeClass('hidden'); $lost.first().find('[name=screen]').trigger('focus'); return; }
    // one at a time so the issues keep their order; a saved row leaves the form, a failed one stays to retry
    let added = 0;
    const next = (i) => {
      if (i === $rows.length) {
        toast(`${added === 1 ? 'Issue' : `${added} issues`} added`);
        // ready for the next ones, on the last place used
        const $grid = $f.find('.writer-grid');
        if (!$grid.children('.writer-row').length) $grid.append(writerRow(writer));
        $f.find('[name=text]').first().trigger('focus');
        load();
        return;
      }
      const $row = $rows.eq(i);
      api('POST', `/api/screens/${$row.data('screen')}/comments`, {
        text: $row.find('[name=text]').val().trim(),
        priority: $row.find('[name=priority]').val(),
        area: $row.find('[name=area]').val(),
        status: $row.find('[name=status]').val(),
        assignees: peopleOf($row.find('.people')),
        remarks: $row.find('[name=remarks]').val().trim(),
      }, null, QUIET)
        .done((c) => { flashId = c.id; added += 1; Object.assign(writer, rowPlace($row)); $row.remove(); next(i + 1); })
        .fail((xhr) => {
          $err.text(errorText(xhr)).removeClass('hidden');
          $row.find('[name=text]').trigger('focus');
          if (added) load();
        });
    };
    next(0);
  });

  // ---------------------------------------------------------------- drag & drop

  function saveOrder(listEl) {
    const ids = $(listEl).children('.card').map((i, el) => $(el).data('id')).get();
    return api('PUT', `/api/flows/${$(listEl).data('flow')}/order`, { ids });
  }

  function initDragging() {
    if (!can('developer')) return;
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
  $doc.on('click', '[data-product]', function () {
    selectProduct($(this).data('product'));
    render();
    if (sanity) openSanity(productId); // on the Sanity page: that app's sanity
  });
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
      title: isPopup(s) ? 'Edit popup' : 'Edit screen',
      fields: screenFields(s),
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
    const what = isCondition(s) ? 'condition' : isPopup(s) ? 'popup' : 'screen';
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

  // condition branch → its own path flow
  $doc.on('click', '[data-extend-path]', function () {
    const c = findScreen($(this).data('extend-path'));
    const b = c.branches.find((x) => x.id === $(this).data('branch-id'));
    const f = findFlow(c.flowId);
    ask({
      title: `Path for “${b.label || 'this branch'}”`,
      fields: [{ name: 'name', label: 'Path name', value: `${f.name} › ${b.label || 'Path'}`, required: true }],
      confirmText: 'Create path',
      save: (v) => api('POST', `/api/screens/${c.id}/branches/${b.id}/path`, v, null, QUIET)
        .done((path) => load().done(() => gotoFlow(path.id))),
    });
  });
  // plain screen → a new flow that continues from it
  $doc.on('click', '[data-extend-screen]', function () {
    const s = findScreen($(this).data('extend-screen'));
    const f = findFlow(s.flowId);
    ask({
      title: `New flow from “${s.name}”`,
      fields: [{ name: 'name', label: 'Flow name', value: `${f.name} › ${s.name}`, required: true }],
      confirmText: 'Create flow',
      save: (v) => api('POST', `/api/screens/${s.id}/extend`, v, null, QUIET)
        .done((path) => load().done(() => gotoFlow(path.id))),
    });
  });
  function gotoFlow(id) {
    const $f = $(`.flow[data-flow-id="${id}"]`);
    if (!$f.length) return;
    $f[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    $f.addClass('flash');
    setTimeout(() => $f.removeClass('flash'), 1600);
  }
  $doc.on('click', '[data-goto-flow]', function () { gotoFlow($(this).data('goto-flow')); });

  $doc.on('click', '[data-move-flow]', function () {
    const m = modules.find((x) => x.id === activeId);
    const ids = m.flows.map((f) => f.id);
    const from = ids.indexOf($(this).data('move-flow'));
    const to = from + Number($(this).data('move'));
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    api('PUT', `/api/modules/${m.id}/flow-order`, { ids }).done(load);
  });

  $doc.on('click', '[data-scroll]', function () {
    $(`.screens[data-flow="${$(this).data('scroll')}"]`)[0].scrollBy({ left: Number($(this).data('dir')) * 330, behavior: 'smooth' });
  });

  // popup
  $doc.on('click', '[data-close-popup]', closePopup);
  $doc.on('click', '[data-popup-go]', function () { if ($(this).data('popup-go')) openPopup($(this).data('popup-go')); });
  $doc.on('click', '[data-popup-choose]', (e) => { e.stopPropagation(); $('#popupBody .popup-choices').toggleClass('hidden'); });
  $doc.on('click', '#popupBody', (e) => { if (!$(e.target).closest('.popup-choices').length) $('#popupBody .popup-choices').addClass('hidden'); });
  // ← → step through the flow while the popup is on top and nothing is being typed
  $doc.on('keydown', (e) => {
    if (!openId || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || $(e.target).is('input, textarea, select, [contenteditable]')) return;
    if (dialog.isOpen() || sheetId || videoFlowId || bugsView || $('#copyModal, #writerModal, #statusModal, #adminModal, #doneModal, #sheetsModal, #sanityLogModal').not('.hidden').length) return;
    const s = findScreen(openId);
    const { prev, next } = s ? popupSiblings(s) : {};
    const to = e.key === 'ArrowLeft' ? prev : next;
    if (!to) return;
    e.preventDefault();
    if (to.condition) $('#popupBody .popup-choices').toggleClass('hidden');
    else openPopup(to.id);
  });
  // 1…9 pick a branch while the condition's choices are open
  $doc.on('keydown', (e) => {
    const $open = $('#popupBody .popup-choices:not(.hidden)');
    if (!openId || !$open.length || !/^[1-9]$/.test(e.key) || $(e.target).is('input, textarea, select')) return;
    const $pick = $open.find('.popup-choice').eq(Number(e.key) - 1);
    if ($pick.length) { e.preventDefault(); $pick.trigger('click'); }
  });
  $('#popup').on('mousedown', function (e) { if (e.target === this) closePopup(); });

  // marks: the pen draws a box over the large image, then it becomes a bug or a link to another screen
  const clearDraft = () => { draft = null; $('#popupBody .mark-draft, .mark-menu').remove(); };
  $doc.on('click', '[data-pen]', () => { pen = !pen; draft = null; renderPopup(); applyAccess(); });
  $doc.on('pointerdown', '.mark-layer.drawing', function (e) {
    if (e.button !== 0 || $(e.target).closest('.mark-menu, .mark-edit').length) return;
    e.preventDefault();
    const layer = this;
    const at = (ev) => {
      const r = layer.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)) };
    };
    const start = at(e);
    clearDraft();
    const $box = $('<div class="mark-draft"></div>').appendTo(layer);
    let box = null;
    const move = (ev) => {
      const p = at(ev);
      box = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
      $box.attr('style', boxStyle(box));
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const r = layer.getBoundingClientRect();
      if (!box || box.w * r.width < 8 || box.h * r.height < 8) { $box.remove(); return; } // a click, not a box
      draft = { screenId: $(layer).data('marks'), box };
      markMenu(layer, box, `${addButtons()}<button data-mark-cancel>${icon('close', 14)} Cancel</button>`);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
  $doc.on('click', '[data-mark-cancel]', clearDraft);
  // a press anywhere outside an open area menu closes it
  $doc.on('pointerdown', (e) => { if ($('.mark-menu').length && !$(e.target).closest('.mark-menu, .mark-edit, .mark-layer.drawing').length) clearDraft(); });
  document.addEventListener('scroll', (e) => { if ($('.mark-menu').length && !$(e.target).closest('.mark-menu').length) clearDraft(); }, true);
  $doc.on('click', '[data-mark-bug]', () => {
    $('.mark-menu').remove();
    const { screenId, box } = draft;
    ask({
      title: 'Add bug on this area',
      fields: [
        { name: 'text', label: 'Issue', placeholder: 'What is wrong here?', required: true, max: 1000 },
        { name: 'priority', label: 'Priority', value: 'medium', options: Object.entries(PRIORITY).map(([k, v]) => [k, v.label]) },
        { name: 'area', label: 'Area', value: 'frontend', options: Object.entries(AREA) },
      ],
      confirmText: 'Add bug',
      save: (v) => api('POST', `/api/screens/${screenId}/comments`, { ...v, box }, null, QUIET).done((c) => { flashId = c.id; draft = null; load(); }),
    }).then((v) => { if (!v) clearDraft(); });
  });
  $doc.on('click', '[data-mark-nav]', () => {
    $('.mark-menu').remove();
    const { screenId, box } = draft;
    const s = findScreen(screenId);
    const p = productOf(findFlow(s.flowId).moduleId);
    const options = p.modules.flatMap((m) => m.flows.flatMap((f) => onlyScreens(f.screens).filter((x) => x.id !== s.id)
      .map((x) => [x.id, `${m.name} › ${f.name} › ${x.name}`])));
    if (!options.length) { clearDraft(); dialog.alert('Add another screen to this app first.', 'No screen to go to'); return; }
    const { next } = popupSiblings(s);
    ask({
      title: 'Add navigation',
      fields: [{ name: 'targetId', label: 'Opens screen', value: next && next.id && next.id !== s.id ? next.id : options[0][0], options }],
      confirmText: 'Add link',
      save: (v) => api('PATCH', `/api/screens/${s.id}`, { links: [...(s.links || []), { box, targetId: v.targetId }] }, null, QUIET)
        .done(() => { draft = null; toast('Link added'); load(); }),
    }).then((v) => { if (!v) clearDraft(); });
  });
  $doc.on('click', '[data-mark-go]', function () { openPopup($(this).data('mark-go')); });
  $doc.on('click', '[data-remove-link]', function (e) {
    e.stopPropagation();
    clearDraft();
    const s = findScreen($(this).data('screen'));
    const id = $(this).data('remove-link');
    dialog.confirm({
      title: 'Remove this link?', message: 'The area will no longer open the other screen.', confirmText: 'Remove', danger: true,
      onConfirm: () => api('PATCH', `/api/screens/${s.id}`, { links: s.links.filter((l) => l.id !== id) }, null, QUIET).done(load),
    });
  });
  // Clicking an underline: an area with open bugs brings them to the top of the issue list (links on it stay
  // in the pen icon's list); a lone link opens its screen; several links are listed. The pen icon always lists
  // everything, with Add bug / Add navigation.
  $doc.on('click', '.mark[data-area]', function (e) {
    if ($(e.target).closest('[data-area-menu]').length) return;
    const a = areaOf(this);
    if (!a) return;
    if (a.bugs.length) pickArea(a.key);
    else if (!a.bugs.length && a.links.length === 1) openPopup(a.links[0].to.id);
    else areaMenu(this);
  });
  $doc.on('click', '[data-area-menu]', function (e) {
    e.stopPropagation();
    areaMenu($(this).closest('.mark')[0]);
  });
  $doc.on('click', '[data-area-pick]', function () {
    clearDraft();
    pickArea(String($(this).data('area-pick')));
  });
  $doc.on('click', '[data-show-mark]', function () {
    const c = allIssues().find((x) => x.id === $(this).data('show-mark'));
    if (!c) return;
    if (openId !== c.screenId) openPopup(c.screenId);
    setTimeout(() => pulse($(`#popupBody .mark[data-area="${boxKey(c.box)}"]`)), 50);
  });
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

  // new condition on the arrow after a card: create it, then slot it in right after that card
  $doc.on('click', '[data-insert-condition]', function (e) {
    e.stopPropagation();
    const after = $(this).data('insert-condition');
    const row = $(this).closest('.screens')[0];
    ask({
      title: `New condition after “${findScreen(after).name}”`,
      fields: [{ name: 'name', label: 'Condition name', placeholder: 'e.g. Mandate status', required: true }],
      confirmText: 'Add condition',
      save: (v) => api('POST', `/api/flows/${$(row).data('flow')}/screens`, { type: 'condition', name: v.name }, null, QUIET).then((c) => {
        const ids = $(row).children('.card').map((i, el) => $(el).data('id')).get();
        ids.splice(ids.indexOf(after) + 1, 0, c.id);
        return api('PUT', `/api/flows/${$(row).data('flow')}/order`, { ids }, null, QUIET);
      }).done(load),
    });
  });

  // Every flow inside a flow's tree: itself plus the paths leaving its steps, and theirs
  const flowTreeIds = (f) => [f.id, ...f.screens.flatMap((x) => pathsAt(x).flatMap(({ path }) => flowTreeIds(path)))];

  // drag the start of an "L" arrow onto another screen card: the path then starts from that screen
  $doc.on('pointerdown', '[data-move-path]', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    const grip = this;
    const flow = findFlow($(grip).data('move-path'));
    const own = new Set(flowTreeIds(flow));
    const $svg = $('<svg class="branch-wire" aria-hidden="true"><path class="line"/><path class="head"/></svg>').appendTo('body');
    let over = null;
    const move = (ev) => {
      const g = grip.getBoundingClientRect();
      const x0 = g.left + g.width / 2;
      const y0 = g.top + g.height / 2;
      const { clientX: x, clientY: y } = ev;
      const bend = Math.max(40, Math.abs(y - y0) / 2);
      $svg.find('.line').attr('d', `M${x0} ${y0}C${x0} ${y0 - bend} ${x} ${y + bend} ${x} ${y}`);
      $svg.find('.head').attr('d', `M${x - 5} ${y + 7}L${x} ${y}L${x + 5} ${y + 7}`);
      const $card = $(document.elementFromPoint(x, y)).closest('#board .card:not(.cond)');
      const s = $card.length && findScreen($card.data('id'));
      const next = s && s.id !== flow.fromScreenId && !own.has(s.flowId) ? $card[0] : null;
      if (next !== over) { $(over).removeClass('drop-target'); $(next).addClass('drop-target'); over = next; }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      $svg.remove();
      $(over).removeClass('drop-target');
      $('body').removeClass('wiring');
      if (!over) return;
      const to = findScreen($(over).data('id'));
      api('PUT', `/api/flows/${flow.id}/from-screen`, { screenId: to.id })
        .done(() => { toast(`${flow.name} now starts from ${to.name}`); load(); });
    };
    $('body').addClass('wiring');
    move(e);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });

  $doc.on('click', '[data-add-popup]', function () {
    const $f = $(this).closest('form');
    const flowId = $f.data('flow');
    const typed = Object.fromEntries(new FormData($f[0]));
    if (typed.name.trim()) { api('POST', `/api/flows/${flowId}/screens`, { ...typed, kind: 'popup' }).done(load); return; }
    ask({
      title: 'New popup',
      fields: screenFields({ page: typed.page, action: typed.action }, 'popup'),
      confirmText: 'Add popup',
      save: (v) => api('POST', `/api/flows/${flowId}/screens`, v, null, QUIET).done(load),
    });
  });
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
    const gone = $(this).data('remove-branch');
    const paths = pathsOf(id, gone);
    const save = () => saveBranches(id, readBranches(id).filter((b) => b.id !== gone));
    if (!paths.length) { save(); return; }
    dialog.confirm({
      title: 'Remove this branch?',
      message: `Its path “${paths[0].name}” and the screens in it will be removed from the sheet too.`,
      confirmText: 'Remove',
      danger: true,
      onConfirm: save,
    });
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
  $doc.on('click', '[data-bugs-filter]', function () { bugsView.filter = $(this).data('bugs-filter'); renderBugs(); applyAccess(); });
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
    else if (sanityLog) closeSanityLog();
    else if (sheetsView) closeSheets();
    else if (doneView) closeDone();
    else if (!$('#statusModal').hasClass('hidden')) closeStatuses();
    else if (bugsView) closeBugs();
    else if (!$('#adminModal').hasClass('hidden')) closeAdmin();
    else if (videoFlowId) closeVideo();
    else if (!$('#writerModal').hasClass('hidden')) closeWriter();
    else if (sheetId) closeSheet();
    else if ($('.mark-menu').length) clearDraft();
    else if (openId && (pen || draft)) { pen = false; draft = null; renderPopup(); applyAccess(); }
    else if (openId && $('#popupBody .popup-choices:not(.hidden)').length) $('#popupBody .popup-choices').addClass('hidden');
    else if (openId) closePopup();
    else if (diagram.flowId && (diagram.condId || diagram.menu)) { diagram.condId = null; diagram.menu = null; renderDiagram(); }
    else if (diagram.flowId) closeDiagram();
  });

  // ---------------------------------------------------------------- go to a flow / screen anywhere (any app or module)

  function showPlace(flowId) {
    if (sanity) closeSanity(); // going to a flow or screen leaves the Sanity page
    const f = findFlow(flowId);
    const p = f && productOf(f.moduleId);
    if (!p) { toast('That is no longer here'); return false; }
    selectProduct(p.id);
    activeId = f.moduleId;
    render();
    return true;
  }
  function showFlow(id) {
    if (showPlace(id)) setTimeout(() => gotoFlow(id), 50);
  }
  function showScreen(id) {
    const s = findScreen(id);
    if (s && showPlace(s.flowId)) openPopup(id);
  }

  // The logo and name go home: the board of this app at its first module, with every page and window closed
  $doc.on('click', '[data-action="home"]', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // new tab / window: let the link open
    e.preventDefault();
    if (dialog.isOpen()) dialog.cancel();
    if (!$('#copyModal').hasClass('hidden')) closeCopy();
    if (sanityLog) closeSanityLog();
    if (sheetsView) closeSheets();
    if (doneView) closeDone();
    if (!$('#statusModal').hasClass('hidden')) closeStatuses();
    if (bugsView) closeBugs();
    if (!$('#adminModal').hasClass('hidden')) closeAdmin();
    if (videoFlowId) closeVideo();
    if (!$('#writerModal').hasClass('hidden')) closeWriter();
    if (sheetId) closeSheet();
    if (openId) closePopup();
    if (diagram.flowId) closeDiagram();
    if (sanity) closeSanity();
    history.replaceState(null, '', location.pathname + location.search);
    activeId = modules[0] ? modules[0].id : null;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Links from Teams: /#flow=<id>, #screen=<id>, #sanity=<app id>[&view=logs], #done=<app id>[&tab=shared]
  function openFromHash() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (![...h.keys()].length) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (h.get('flow')) showFlow(h.get('flow'));
    else if (h.get('screen')) showScreen(h.get('screen'));
    else if (h.get('sheet')) api('GET', `/api/sheets/${encodeURIComponent(h.get('sheet'))}`).done((x) => openSheets(x.productId, x.id));
    else if (h.get('sanity') || h.get('done')) {
      const pid = h.get('sanity') || h.get('done');
      if (products.some((p) => p.id === pid)) { selectProduct(pid); render(); }
      if (h.get('sanity')) {
        const req = openSanity(productId, null, h.get('view') === 'logs' ? 'logs' : 'sheet');
        if (req && h.get('log')) req.done(() => openSanityLog(h.get('log')));
      } else openDone(productId, h.get('date'), h.get('tab') === 'shared' ? 'shared' : 'day');
    }
  }
  window.addEventListener('hashchange', () => { if (loaded) openFromHash(); });

  // Teams answers 'sent', 'off' (no channel set) or why it failed
  function teamsResult(result, sentText) {
    if (result === 'sent') toast(sentText);
    else if (result && result !== 'off') dialog.alert(`Saved, but the Teams message did not go out: ${result}`, 'Teams');
  }

  const flowLabel = (m, f) => `${m.name} › ${f.name}`;

  // ---------------------------------------------------------------- sanity testing: daily checklist of an app
  // Headings are flows of the app (tap to go there) or typed headings. Each day starts fresh; earlier days stay as history.
  // Sanity testers tick Done / Failed and write a review; a failure is posted to the app's Teams channel with the
  // owner @mentioned. The version and time are set per day; at that time the channel gets a reminder.

  // { productId, date, today, run, items, people, canRun, canManage, teams, webhook, logs,
  //   view: 'sheet' | 'logs', logFilter: { q, date } }
  let sanity = null;

  // view: the checklist ('sheet') or the logs page ('logs'); kept as it is when left out
  function openSanity(pid, date, view) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return null; }
    return $.when(
      api('GET', `/api/sanity?product=${encodeURIComponent(pid)}${date ? `&date=${date}` : ''}`),
      api('GET', `/api/sanity/logs?product=${encodeURIComponent(pid)}`),
    ).done(([d], [logs]) => {
      const fresh = !sanity;
      // rows flagged by a refused submit stay flagged until they are fixed
      const missing = sanity && sanity.productId === pid ? sanity.missing : new Set();
      const logFilter = sanity && sanity.productId === pid ? sanity.logFilter : { q: '', date: '' };
      sanity = { productId: pid, ...d, logs, missing, logFilter, view: view || (sanity && sanity.view) || 'sheet' };
      renderSanity();
      // the page takes the board's place; the address keeps it, so a refresh or a shared link comes back here
      $('#board, #tabs').addClass('hidden');
      $('#sanityPage').removeClass('hidden');
      $('[data-action="sanity"]').addClass('on');
      history.replaceState(null, '', `${location.pathname}${location.search}#sanity=${encodeURIComponent(pid)}${sanity.view === 'logs' ? '&view=logs' : ''}`);
      if (fresh) window.scrollTo(0, 0);
    });
  }
  const reloadSanity = () => sanity && openSanity(sanity.productId, sanity.date);

  function closeSanity() {
    sanity = null;
    $('#sanityPage').addClass('hidden').empty();
    $('#board, #tabs').removeClass('hidden');
    $('[data-action="sanity"]').removeClass('on');
    history.replaceState(null, '', location.pathname + location.search);
  }

  // Checklist | Logs, at the top of both pages
  const sanityViews = (d) => `<div class="seg sanity-views">
    <button data-sanity-view="sheet" class="${d.view === 'sheet' ? 'on' : ''}">${icon('check', 12)} Checklist</button>
    <button data-sanity-view="logs" class="${d.view === 'logs' ? 'on' : ''}">${icon('note', 12)} Logs <span class="text-slate-400">${d.logs.length}</span></button>
  </div>`;

  function renderSanity() {
    const d = sanity;
    if (d.view === 'logs') { renderSanityLogs(); return; }
    const p = products.find((x) => x.id === d.productId);
    const isToday = d.date === d.today;
    const run = isToday && d.canRun; // tick, review, version / time
    const flowName = (it) => (it.flowId && findFlow(it.flowId) ? findFlow(it.flowId).name : it.heading);
    const person = (id) => (d.people.find((x) => x.id === id) || {}).name || '';
    const n = d.items.length;
    const count = (st) => d.items.filter((it) => it.state === st).length;
    const used = new Set(d.items.map((it) => it.flowId).filter(Boolean));
    const flowOptions = (p ? p.modules : []).map((m) => `<optgroup label="${esc(m.name)}">${m.flows.filter((f) => !used.has(f.id))
      .map((f) => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</optgroup>`).join('');

    $('#sanityPage').html(`<div class="sanity-page">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
        <button class="btn-secondary text-sm" data-close-sanity title="Back to the board">${icon('left', 14)} Board</button>
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Sanity testing <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
          <p class="text-xs text-slate-500">${isToday ? `Today · ${fmtDate(d.date)} · resets at midnight (${esc(d.timezone)})` : `History of ${fmtDate(d.date)}`}</p>
        </div>
        ${sanityViews(d)}
        <input type="date" class="input py-1 text-sm" data-sanity-date value="${d.date}" max="${d.today}" title="Look at an earlier day">
        <a class="btn-secondary text-sm" href="/api/sanity/export?product=${encodeURIComponent(d.productId)}&date=${d.date}" title="Download this day's sheet">${icon('download', 14)} Excel</a>
        ${isToday ? '' : `<button class="btn-secondary text-sm" data-sanity-today>Today</button>`}
      </div>

      <form id="sanityRun" class="sanity-run">
        <label><span class="field-label">Version</span>
          <input class="input w-40" name="version" value="${esc(d.run ? d.run.version : '')}" placeholder="e.g. 1.12.0 (245)" maxlength="60" ${run ? '' : 'disabled'}></label>
        <label><span class="field-label">Sanity time</span>
          <input class="input w-32" type="time" name="time" value="${esc(d.run ? d.run.time : '')}" ${run ? '' : 'disabled'}></label>
        ${run ? '<button class="btn-secondary self-end">Save</button>' : ''}
        <div class="sanity-progress self-end">
          <span class="chip pass">${icon('check', 12)} ${count('pass')} / ${n} done</span>
          <span class="chip fail">${icon('close', 12)} ${count('fail')} failed</span>
          <span class="chip">${count('pending')} left</span>
        </div>
        ${run && n ? `<button type="button" class="btn-primary self-end" data-sanity-submit title="Check everything, save the log and send the report">${icon('check', 14)} Submit sanity</button>` : ''}
      </form>
      <div class="sanity-recipients">
        <span class="text-xs font-medium text-slate-500">Report goes to</span>
        ${d.recipients.map((id) => `<span class="person">${esc(person(id) || '—')}</span>`).join('') || '<span class="text-xs text-slate-400">nobody yet</span>'}
        ${d.canManage ? `
        <details class="sheet-share">
          <summary class="text-xs font-medium text-indigo-600 hover:underline">Change</summary>
          <div class="sheet-share-pop left-0 right-auto">
            <span class="field-label">@mention on Teams when a sanity is submitted</span>
            <div class="max-h-56 overflow-y-auto">${d.people.map((x) => `
              <label class="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sanity-recipient value="${x.id}" ${d.recipients.includes(x.id) ? 'checked' : ''}> ${esc(x.name)}${x.teams ? '' : ' <span class="text-xs text-slate-400">(no Teams email)</span>'}</label>`).join('')}</div>
          </div>
        </details>` : ''}
        ${d.teams ? '' : '<span class="text-xs text-amber-700">· no Teams channel yet, so reports are only kept in the logs</span>'}
      </div>
      ${isToday && d.run && d.run.time ? `<p class="px-5 pt-2 text-xs text-slate-500">${d.teams
        ? (d.run.remindedAt ? 'Teams reminder sent today.' : `Teams reminder at ${esc(d.run.time)}.`)
        : 'No Teams channel for this app yet, so no reminder goes out.'}</p>` : ''}
      ${isToday && !d.canRun ? '<p class="mx-5 mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">You can look at the sanity list. Testers and developers run it; for any other login, ask an admin to tick <b>Sanity tester</b>.</p>' : ''}

      <div class="sanity-sheet-wrap">
        <table class="sanity-sheet">
          <thead><tr>
            <th class="w-10">#</th><th class="min-w-[220px]">Heading</th><th>Status</th><th class="min-w-[220px]">Remarks</th>
            ${d.columns.map((c) => `<th class="min-w-[150px]" data-col="${c.id}"><div class="sanity-col">
              <span class="truncate">${esc(c.name)}</span>
              ${d.canManage ? `<button class="icon-btn sm" data-col-rename="${c.id}" title="Rename column">${icon('edit', 12)}</button>
                <button class="icon-btn sm danger" data-col-delete="${c.id}" title="Delete column">${icon('close', 12)}</button>` : ''}
            </div></th>`).join('')}
            <th class="w-px whitespace-nowrap">${d.canManage ? `<button class="sanity-addcol" data-col-add title="Add a column">${icon('plus', 12)} Column</button>` : ''}</th>
          </tr></thead>
          <tbody id="sanityList">
          ${d.items.map((it, i) => {
            const f = it.flowId && findFlow(it.flowId);
            const m = f && allModules.find((x) => x.id === f.moduleId);
            return `
            <tr class="sanity-row ${it.state} ${d.missing.has(it.id) && it.state === 'pending' ? 'missing' : ''}" data-item="${it.id}">
              <td><span class="sanity-no ${d.canManage ? 'drag' : ''}" title="${d.canManage ? 'Drag to reorder' : ''}">${i + 1}</span></td>
              <td>
                ${f ? `<button class="sanity-heading link" data-sanity-go="${it.flowId}" title="Go to this flow">${esc(flowName(it))} ${icon('link', 12)}</button>`
                  : `<span class="sanity-heading">${esc(flowName(it))}</span>`}
                <div class="sanity-meta">
                  ${m ? `<span>${esc(m.name)}</span>` : '<span>Manual heading</span>'}
                  ${it.resultAt && it.state !== 'pending' ? `<span>${it.state === 'pass' ? 'Done' : 'Failed'} by ${esc(person(it.resultBy) || '—')}</span>` : ''}
                  ${it.sharedAt ? `<span class="text-indigo-600">${icon('share', 11)} on Teams</span>` : ''}
                </div>
              </td>
              <td><div class="seg sanity-state">
                <button data-sanity-state="pass" class="${it.state === 'pass' ? 'on pass' : ''}" ${run ? '' : 'disabled'} title="Done">${icon('check', 13)} Done</button>
                <button data-sanity-state="fail" class="${it.state === 'fail' ? 'on fail' : ''}" ${run ? '' : 'disabled'} title="Failed: posts to Teams">${icon('close', 13)} Failed</button>
              </div></td>
              <td><textarea class="input sanity-review" data-sanity-review rows="1" maxlength="1000" placeholder="${run ? 'Remarks / what failed' : ''}" ${run ? '' : 'disabled'}>${esc(it.review)}</textarea></td>
              ${d.columns.map((c) => `<td><input class="input sanity-cell" data-sanity-cell="${c.id}" value="${esc(it.cells[c.id] || '')}" maxlength="500" ${run ? '' : 'disabled'}></td>`).join('')}
              <td><div class="flex items-center justify-end">
                ${run && d.teams && it.state === 'fail' ? `<button class="icon-btn" data-sanity-share="${it.id}" title="Share this failure on Teams again">${icon('share', 14)}</button>` : ''}
                ${d.canManage ? `<button class="icon-btn danger" data-sanity-delete="${it.id}" title="Remove from the list">${icon('trash', 14)}</button>` : ''}
              </div></td>
            </tr>`;
          }).join('') || `<tr><td colspan="${5 + d.columns.length}" class="py-10 text-center text-sm text-slate-400">No headings yet. Every flow of this app shows up here, and you can add your own below.</td></tr>`}
          </tbody>
        </table>
      </div>

      ${d.canManage ? `
      <form id="sanityAdd" class="sanity-add">
        <select class="input" name="flowId" title="A flow of this app, or a new heading">
          <option value="">New heading…</option>${flowOptions.replace(/<optgroup[^>]*><\/optgroup>/g, '')}
        </select>
        <input class="input min-w-0 flex-1" name="heading" placeholder="New row: heading, e.g. Login with OTP" maxlength="120" autocomplete="off">
        <button class="btn-primary">${icon('plus', 14)} Add</button>
        ${can('developer') && p && p.modules.length ? `
        <label class="sanity-newflow"><input type="checkbox" name="createFlow" class="h-4 w-4 accent-indigo-600">
          Also create it as a flow in <select class="input py-0.5 text-sm" name="moduleId">${p.modules.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>` : ''}
      </form>` : ''}

      <p class="sanity-logs text-xs text-slate-500">The checklist resets every day; every submitted sanity is kept in the
        <button class="font-medium text-indigo-600 hover:underline" data-sanity-view="logs">sanity logs (${d.logs.length})</button>.</p>

      ${me.access === 'super' ? `
      <details class="sanity-teams" ${d.teams ? '' : 'open'}>
        <summary>Teams channel for ${esc(p ? p.name : '')} ${d.teams ? '<span class="chip pass">connected</span>' : '<span class="chip">not set</span>'}</summary>
        <form id="teamsForm" class="mt-3 space-y-2">
          <p class="text-xs text-slate-500">In Teams, open the channel → <b>Workflows</b> → <b>Post to a channel when a webhook request is received</b>, finish the steps and paste the URL it gives you here. Logins are @mentioned by the <b>Teams email</b> set in Admin.</p>
          <div class="flex flex-wrap gap-2">
            <input class="input min-w-0 flex-1 font-mono text-xs" name="webhook" value="${esc(d.webhook || '')}" placeholder="https://…logic.azure.com/workflows/…" autocomplete="off">
            <button class="btn-secondary">Save</button>
            ${d.teams ? '<button type="button" class="btn-secondary" data-teams-test>Send test</button>' : ''}
          </div>
        </form>
      </details>` : ''}
    </div>`);

    if (d.canManage) {
      Sortable.create($('#sanityList')[0], {
        handle: '.sanity-no', animation: 150, draggable: 'tr.sanity-row',
        onEnd: () => api('PUT', '/api/sanity/order', { productId: d.productId, ids: $('#sanityList .sanity-row').map((i, el) => $(el).data('item')).get() }).done(reloadSanity),
      });
    }
    $('#sanityList .sanity-review').each((i, el) => autoGrow(el));
  }

  // ---- the sanity logs page: every submitted sanity of the app, newest first, filtered by day and text

  const shownLogs = (d) => {
    const q = d.logFilter.q.trim().toLowerCase();
    return d.logs.filter((l) => (!d.logFilter.date || l.date === d.logFilter.date)
      && (!q || [l.version, l.submittedBy, ...l.testers].join(' ').toLowerCase().includes(q)));
  };

  function sanityLogRows(list) {
    return list.map((l) => `
      <tr>
        <td class="whitespace-nowrap font-medium text-slate-900">${fmtDate(l.date)}</td>
        <td class="font-mono text-xs">${esc(l.version)}</td>
        <td><div class="flex items-center gap-2">
          <span class="log-bar"><i class="pass" style="width:${l.total ? (l.passed / l.total) * 100 : 0}%"></i><i class="fail" style="width:${l.total ? (l.failed / l.total) * 100 : 0}%"></i></span>
          <span class="chip pass">${l.passed} passed</span>${l.failed ? `<span class="chip fail">${l.failed} failed</span>` : ''}
        </div></td>
        <td class="text-sm">${esc(l.testers.join(', ') || l.submittedBy)}</td>
        <td class="whitespace-nowrap text-xs text-slate-500">${esc(l.submittedBy)} · ${new Date(l.submittedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}${l.sharedAt ? ` · <span class="text-indigo-600">on Teams</span>` : ''}</td>
        <td class="whitespace-nowrap text-right">
          <a class="btn-secondary px-2 py-1 text-xs" href="/api/sanity/logs/${l.id}/export" title="Download this report">${icon('download', 12)}</a>
          <button class="btn-secondary px-2 py-1 text-xs" data-sanity-log="${l.id}">View</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">No sanity matches this filter.</td></tr>';
  }

  function renderSanityLogs() {
    const d = sanity;
    const p = products.find((x) => x.id === d.productId);
    const latest = d.logs[0];
    const passRate = d.logs.length ? Math.round((d.logs.reduce((n, l) => n + l.passed, 0) / Math.max(1, d.logs.reduce((n, l) => n + l.total, 0))) * 100) : 0;
    $('#sanityPage').html(`<div class="sanity-page">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
        <button class="btn-secondary text-sm" data-close-sanity title="Back to the board">${icon('left', 14)} Board</button>
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Sanity logs <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
          <p class="text-xs text-slate-500">Every submitted sanity, kept for good. The checklist itself resets every day.</p>
        </div>
        ${sanityViews(d)}
      </div>

      ${d.logs.length ? `
      <div class="sanity-log-stats">
        <div><span>Last tested version</span><b class="font-mono">${esc(latest.version)}</b><small>${fmtDate(latest.date)}</small></div>
        <div><span>Submitted</span><b>${d.logs.length}</b><small>report${d.logs.length === 1 ? '' : 's'}</small></div>
        <div><span>Last result</span><b>${latest.passed} / ${latest.total}</b><small>${latest.failed ? `${latest.failed} failed` : 'all passed'}</small></div>
        <div><span>Pass rate</span><b>${passRate}%</b><small>of every heading checked</small></div>
      </div>` : ''}

      <div class="flex flex-wrap items-center gap-2 px-5 pt-4">
        <input class="input min-w-0 flex-1 py-1 text-sm" data-log-search value="${esc(d.logFilter.q)}" placeholder="Search version or person" autocomplete="off">
        <input type="date" class="input py-1 text-sm" data-log-date value="${d.logFilter.date}" max="${d.today}" title="Only this day">
        ${d.logFilter.date || d.logFilter.q ? '<button class="btn-secondary text-sm" data-log-clear>Clear</button>' : ''}
      </div>
      <div class="sanity-logs-page">
        <table class="sanity-log-table">
          <thead><tr><th>Date</th><th>Version</th><th>Result</th><th>Done by</th><th>Submitted</th><th></th></tr></thead>
          <tbody id="sanityLogRows">${d.logs.length ? sanityLogRows(shownLogs(d)) : '<tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">No sanity submitted yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`);
  }

  const sanityItemOf = (el) => sanity.items.find((it) => it.id === $(el).closest('[data-item]').data('item'));
  const saveResult = (it, body) => api('PUT', `/api/sanity/items/${it.id}/result`, body)
    .done((r) => { teamsResult(r.teams, 'Failure posted on Teams'); reloadSanity(); });

  // the Sanity button opens the page, and goes back to the board when it is already open
  $doc.on('click', '[data-action="sanity"]', () => (sanity ? closeSanity() : openSanity(productId, null, 'sheet')));
  $doc.on('click', '[data-action="sanity-logs"]', () => openSanity(productId, null, 'logs')); // the version in the header
  $doc.on('click', '[data-close-sanity]', closeSanity);
  $doc.on('click', '[data-sanity-view]', function () { openSanity(sanity.productId, sanity.date, $(this).data('sanity-view')); });
  // the logs filter redraws only the rows, so the search box keeps focus
  const filterLogs = (change) => {
    Object.assign(sanity.logFilter, change);
    $('#sanityLogRows').html(sanityLogRows(shownLogs(sanity)));
  };
  $doc.on('input', '[data-log-search]', function () { filterLogs({ q: this.value }); });
  $doc.on('change', '[data-log-date]', function () { filterLogs({ date: this.value }); renderSanityLogs(); });
  $doc.on('click', '[data-log-clear]', () => { filterLogs({ q: '', date: '' }); renderSanityLogs(); });
  $doc.on('change', '[data-sanity-date]', function () { if (this.value) openSanity(sanity.productId, this.value); });
  $doc.on('click', '[data-sanity-today]', () => openSanity(sanity.productId));
  $doc.on('submit', '#sanityRun', function (e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(this));
    // load(): the header shows the new present version
    api('PUT', '/api/sanity/run', { productId: sanity.productId, version: v.version, time: v.time }).done(() => { toast('Saved'); reloadSanity(); load(); });
  });
  $doc.on('click', '[data-sanity-state]', function () {
    const it = sanityItemOf(this);
    const state = $(this).data('sanity-state');
    const review = $(this).closest('.sanity-row').find('[data-sanity-review]').val().trim();
    saveResult(it, { state: it.state === state ? 'pending' : state, review });
  });
  $doc.on('change', '[data-sanity-review]', function () { saveResult(sanityItemOf(this), { review: this.value.trim() }); });
  $doc.on('input', '[data-sanity-review]', function () { autoGrow(this); });
  $doc.on('change', '[data-sanity-cell]', function () {
    saveResult(sanityItemOf(this), { cells: { [$(this).data('sanity-cell')]: this.value.trim() } });
  });
  $doc.on('click', '[data-col-add]', () => ask({
    title: 'New column', fields: [{ name: 'name', label: 'Column name', placeholder: 'e.g. Device, Build no., Tested on', required: true, max: 60 }],
    confirmText: 'Add column',
    save: (v) => api('POST', '/api/sanity/columns', { productId: sanity.productId, name: v.name }, null, QUIET).done(reloadSanity),
  }));
  $doc.on('click', '[data-col-rename]', function () {
    const c = sanity.columns.find((x) => x.id === $(this).data('col-rename'));
    ask({
      title: 'Rename column', fields: [{ name: 'name', label: 'Column name', value: c.name, required: true, max: 60 }],
      save: (v) => api('PATCH', `/api/sanity/columns/${c.id}`, v, null, QUIET).done(reloadSanity),
    });
  });
  $doc.on('click', '[data-col-delete]', function () {
    const c = sanity.columns.find((x) => x.id === $(this).data('col-delete'));
    dialog.confirm({
      title: `Delete column “${c.name}”?`, message: 'It disappears from the sheet and the Excel download.', confirmText: 'Delete', danger: true,
      onConfirm: () => api('DELETE', `/api/sanity/columns/${c.id}`, null, null, QUIET).done(reloadSanity),
    });
  });
  $doc.on('click', '[data-sanity-share]', function () {
    api('POST', '/api/sanity/share', { productId: sanity.productId, itemId: $(this).data('sanity-share') })
      .done((r) => { teamsResult(r.teams, 'Shared on Teams'); reloadSanity(); });
  });
  // Submit: checked here first (rows to fix are outlined), then by the server, which saves the log,
  // adds the submitter's "done today" and sends the report
  $doc.on('click', '[data-sanity-submit]', () => {
    const d = sanity;
    const version = $('#sanityRun [name=version]').val().trim();
    const unchecked = d.items.filter((it) => it.state === 'pending');
    const problems = [
      !version && 'Enter the version you tested.',
      unchecked.length && `Mark Done or Failed on ${unchecked.length} heading${unchecked.length === 1 ? '' : 's'}.`,
    ].filter(Boolean);
    if (problems.length) {
      d.missing = new Set(unchecked.map((it) => it.id));
      renderSanity();
      const $first = $('#sanityList .missing').first();
      if ($first.length) $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!version) $('#sanityRun [name=version]').addClass('invalid').trigger('focus');
      dialog.alert(problems.join(' '), 'Sanity is not complete');
      return;
    }
    const passed = d.items.filter((it) => it.state === 'pass').length;
    const to = d.recipients.map((id) => (d.people.find((x) => x.id === id) || {}).name).filter(Boolean);
    dialog.confirm({
      title: `Submit sanity for version ${version}?`,
      message: `${fmtDate(d.date)} · ${passed} passed, ${d.items.length - passed} failed of ${d.items.length}. The log is saved, it is added to your Done today${d.teams ? `, and the report goes to Teams${to.length ? ` for ${to.join(', ')}` : ''}` : ''}.`,
      confirmText: 'Submit',
      onConfirm: () => api('POST', '/api/sanity/submit', { productId: d.productId, version }, null, QUIET)
        .done((r) => {
          d.missing = new Set();
          toast('Sanity submitted: log saved');
          teamsResult(r.teams, 'Sanity submitted: report sent on Teams');
          reloadSanity();
          load();
        })
        .fail((xhr) => {
          const missing = xhr.responseJSON && xhr.responseJSON.missing;
          if (missing) { d.missing = new Set(missing); renderSanity(); }
        }),
    });
  });
  $doc.on('input', '#sanityRun [name=version]', function () { $(this).removeClass('invalid'); });
  $doc.on('change', '[data-sanity-recipient]', () => {
    const userIds = $('[data-sanity-recipient]:checked').map((i, el) => el.value).get();
    api('PUT', '/api/sanity/recipients', { productId: sanity.productId, userIds }).done(() => { sanity.recipients = userIds; toast('Saved'); });
  });
  $doc.on('click', '[data-sanity-log]', function () { openSanityLog($(this).data('sanity-log')); });
  $doc.on('click', '[data-sanity-delete]', function () {
    const it = sanity.items.find((x) => x.id === $(this).data('sanity-delete'));
    dialog.confirm({
      title: 'Remove this heading?', message: 'It leaves the sanity list (earlier days keep their result). The flow itself stays.', confirmText: 'Remove', danger: true,
      onConfirm: () => api('DELETE', `/api/sanity/items/${it.id}`, null, null, QUIET).done(reloadSanity),
    });
  });
  // picking a flow hides the typed heading and "create as a flow"
  $doc.on('change', '#sanityAdd [name=flowId]', function () {
    $('#sanityAdd [name=heading], #sanityAdd .sanity-newflow').toggleClass('hidden', Boolean(this.value));
  });
  $doc.on('submit', '#sanityAdd', function (e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(this));
    if (!v.flowId && !v.heading.trim()) { $(this).find('[name=heading]').trigger('focus'); return; }
    const body = { productId: sanity.productId, flowId: v.flowId, heading: v.flowId ? '' : v.heading };
    if (!v.flowId && v.createFlow) body.newFlowModuleId = v.moduleId;
    api('POST', '/api/sanity/items', body).done(() => {
      if (body.newFlowModuleId) load(); // the new flow shows on the board too
      reloadSanity();
    });
  });
  $doc.on('click', '[data-sanity-go]', function () { const id = $(this).data('sanity-go'); closeSanity(); showFlow(id); });
  $doc.on('submit', '#teamsForm', function (e) {
    e.preventDefault();
    api('PUT', `/api/products/${sanity.productId}/teams`, { webhook: $(this).find('[name=webhook]').val().trim() })
      .done(() => { toast('Teams channel saved'); reloadSanity(); load(); });
  });
  $doc.on('click', '[data-teams-test]', () => {
    api('POST', `/api/products/${sanity.productId}/teams/test`).done(() => toast('Test message sent to Teams'));
  });

  // ---------------------------------------------------------------- done today: what each person finished, with the screens they changed

  // { productId, date, today, items, shared, people, canClose, teams, tab: 'day' | 'shared', sharing: entry id whose picker is open }
  let doneView = null;
  let donePicked = []; // screens attached to the entry being written

  // tab: the day's entries ('day') or the ones shared with me ('shared'); kept as it is when left out
  function openDone(pid, date, tab) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return null; }
    return api('GET', `/api/done?product=${encodeURIComponent(pid)}${date ? `&date=${date}` : ''}`).done((d) => {
      if (!doneView || doneView.productId !== pid) donePicked = [];
      doneView = { productId: pid, ...d, tab: tab || (doneView && doneView.tab) || 'day', sharing: null };
      renderDone();
      $('#doneModal').removeClass('hidden');
      $('body').addClass('overflow-hidden');
    });
  }
  const reloadDone = () => doneView && openDone(doneView.productId, doneView.date);

  function closeDone() {
    doneView = null;
    $('#doneModal').addClass('hidden');
    unlockScroll();
  }

  const screenChip = (id, removable) => {
    const s = findScreen(id);
    if (!s) return '';
    const f = findFlow(s.flowId);
    return `<span class="screen-chip"><button type="button" data-done-screen="${id}" title="${esc(f ? f.name : '')} › ${esc(s.name)}">${esc(s.name)}</button>${removable ? `<button type="button" data-done-unpick="${id}" title="Remove">${icon('close', 10)}</button>` : ''}</span>`;
  };

  // One entry: text, screens, who it is shared with and whether it is closed; the author edits, shares and deletes,
  // a tester / super admin it was shared with closes it. withAuthor: on "Shared with me", say who and which day.
  function doneEntry(x, withAuthor) {
    const d = doneView;
    const name = (id) => (d.people.find((u) => u.id === id) || {}).name || '—';
    const owns = (x.userId === me.id || me.access === 'super') && can('edit');
    const closable = d.canClose && x.sharedWith.length && (x.sharedWith.includes(me.id) || me.access === 'super');
    const picking = d.sharing === x.id;
    return `
      <li class="done-item ${x.closedAt ? 'closed' : ''}">
        <div class="min-w-0 flex-1">
          ${withAuthor ? `<p class="mb-0.5 flex items-center gap-1 text-xs font-semibold text-slate-600">${icon('user', 12)} ${esc(x.userName)} <span class="font-normal text-slate-400">· ${fmtDate(x.date)}</span></p>` : ''}
          <p class="whitespace-pre-wrap text-sm text-slate-800">${esc(x.text)}</p>
          ${x.screenIds.length ? `<div class="mt-1 flex flex-wrap gap-1">${x.screenIds.map((id) => screenChip(id)).join('')}</div>` : ''}
          <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span>${new Date(x.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ${x.sharedAt ? '<span class="text-indigo-600">on Teams</span>' : ''}
            ${x.sharedWith.length ? `<span>${icon('share', 11)} shared with ${esc(x.sharedWith.map(name).join(', '))}</span>` : ''}
            ${x.closedAt ? `<span class="chip pass">${icon('check', 11)} Closed by ${esc(x.closedByName || '—')} · ${fmtDate(x.closedAt)}</span>`
              : x.sharedWith.length ? '<span class="chip">Open</span>' : ''}
          </p>
          ${picking ? `
          <form class="done-share" data-done-share-form="${x.id}">
            <span class="field-label">Share this with (they see it under Shared with me${d.teams ? ' and are @mentioned on Teams' : ''})</span>
            <div class="flex max-h-40 flex-wrap gap-x-4 gap-y-1 overflow-y-auto">${d.people.filter((u) => u.id !== x.userId).map((u) => `
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="userIds" value="${u.id}" ${x.sharedWith.includes(u.id) ? 'checked' : ''}> ${esc(u.name)}</label>`).join('')
              || '<span class="text-sm text-slate-400">Nobody else can open this app.</span>'}</div>
            <div class="mt-2 flex gap-2">
              <button class="btn-primary px-3 py-1 text-xs">${icon('share', 12)} Share</button>
              <button type="button" class="btn-secondary px-3 py-1 text-xs" data-done-share-cancel>Cancel</button>
            </div>
          </form>` : ''}
        </div>
        ${closable ? `<button class="btn-secondary shrink-0 px-2 py-1 text-xs" data-done-close="${x.id}" data-closed="${x.closedAt ? '0' : '1'}" title="${x.closedAt ? 'Open it again' : 'You checked this change: close it'}">${x.closedAt ? 'Reopen' : `${icon('check', 12)} Close`}</button>` : ''}
        ${owns ? `
          <button class="icon-btn ${picking ? 'text-indigo-600' : ''}" data-done-share-to="${x.id}" title="Share this with someone">${icon('share', 14)}</button>
          <button class="icon-btn" data-done-edit="${x.id}" title="Edit">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-done-delete="${x.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
      </li>`;
  }

  function renderDone() {
    const d = doneView;
    const p = products.find((x) => x.id === d.productId);
    const isToday = d.date === d.today;
    const mine = d.items.filter((x) => x.userId === me.id);
    const openShared = d.shared.filter((x) => !x.closedAt).length;
    const byPerson = [...new Map(d.items.map((x) => [x.userId, x.userName])).entries()]
      .sort(([a], [b]) => (b === me.id) - (a === me.id)); // you first
    const screenOptions = (p ? p.modules : []).flatMap((m) => m.flows.map((f) => `<optgroup label="${esc(flowLabel(m, f))}">${onlyScreens(f.screens)
      .filter((s) => !donePicked.includes(s.id)).map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</optgroup>`)).join('');
    const tabs = `<div class="seg">
      <button data-done-tab="day" class="${d.tab === 'day' ? 'on' : ''}">${isToday ? 'Today' : fmtDate(d.date)}</button>
      <button data-done-tab="shared" class="${d.tab === 'shared' ? 'on' : ''}">Shared with me${openShared ? ` <b class="text-indigo-600">${openShared}</b>` : ''}</button>
    </div>`;

    if (d.tab === 'shared') {
      $('#doneBody').html(`
        <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold text-slate-900">Shared with me <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
            <p class="text-xs text-slate-500">${openShared} open · ${d.shared.length - openShared} closed${d.canClose ? ' · close a change once you have checked it' : ''}</p>
          </div>
          ${tabs}
          <button class="icon-btn" data-close-done title="Close">${icon('close', 18)}</button>
        </div>
        <ul class="max-h-[65vh] space-y-1.5 overflow-y-auto px-5 py-4">
          ${d.shared.map((x) => doneEntry(x, true)).join('') || '<p class="py-10 text-center text-sm text-slate-400">Nothing has been shared with you yet.</p>'}
        </ul>`);
      return;
    }

    $('#doneBody').html(`
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Done ${isToday ? 'today' : `on ${fmtDate(d.date)}`} <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
          <p class="text-xs text-slate-500">${d.items.length} entr${d.items.length === 1 ? 'y' : 'ies'} by ${byPerson.length} ${byPerson.length === 1 ? 'person' : 'people'}</p>
        </div>
        ${tabs}
        <input type="date" class="input py-1 text-sm" data-done-date value="${d.date}" max="${d.today}">
        <button class="icon-btn" data-close-done title="Close">${icon('close', 18)}</button>
      </div>

      ${isToday && can('edit') ? `
      <form id="doneAdd" class="done-add">
        <textarea class="input w-full" name="text" rows="2" maxlength="1000" placeholder="What did you finish? e.g. Fixed OTP timer on Login, new KYC upload flow"></textarea>
        <div class="flex flex-wrap items-center gap-2">
          <select class="input max-w-xs py-1 text-sm" data-done-pick><option value="">Attach a screen you changed…</option>${screenOptions}</select>
          ${donePicked.map((id) => screenChip(id, true)).join('')}
          <button class="btn-primary ml-auto">${icon('plus', 14)} Add</button>
        </div>
      </form>` : ''}

      <div class="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4">
        ${byPerson.map(([uid, name]) => `
          <div>
            <p class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-900">${icon('user', 14)} ${esc(name)}${uid === me.id ? ' <span class="text-xs font-normal text-slate-400">(you)</span>' : ''}</p>
            <ul class="space-y-1.5">
              ${d.items.filter((x) => x.userId === uid).map((x) => doneEntry(x)).join('')}
            </ul>
          </div>`).join('') || `<p class="py-10 text-center text-sm text-slate-400">Nothing logged ${isToday ? 'yet today' : 'on this day'}.</p>`}
      </div>

      ${mine.length && can('edit') ? `
      <div class="flex items-center gap-3 border-t border-slate-200 px-5 py-3">
        <p class="flex-1 text-xs text-slate-500">${d.teams ? 'Posts your entries of this day to the app\'s Teams channel, with links to the screens.' : 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.'}</p>
        <button class="btn-primary" data-done-share ${d.teams ? '' : 'disabled'}>${icon('share', 14)} Share my day on Teams</button>
      </div>` : ''}`);
  }

  $doc.on('click', '[data-action="done"]', () => openDone(productId));
  $doc.on('click', '[data-close-done]', closeDone);
  $('#doneModal').on('mousedown', function (e) { if (e.target === this) closeDone(); });
  $doc.on('change', '[data-done-date]', function () { if (this.value) openDone(doneView.productId, this.value); });
  // keep what is typed while a screen is attached / removed
  const keepText = (fn) => { const t = $('#doneAdd [name=text]').val(); fn(); renderDone(); $('#doneAdd [name=text]').val(t); };
  $doc.on('change', '[data-done-pick]', function () { const id = this.value; if (id) keepText(() => donePicked.push(id)); });
  $doc.on('click', '[data-done-unpick]', function () { const id = $(this).data('done-unpick'); keepText(() => { donePicked = donePicked.filter((x) => x !== id); }); });
  $doc.on('submit', '#doneAdd', function (e) {
    e.preventDefault();
    const t = $(this).find('[name=text]').val().trim();
    if (!t) { $(this).find('[name=text]').trigger('focus'); return; }
    api('POST', '/api/done', { productId: doneView.productId, text: t, screenIds: donePicked }).done(() => { donePicked = []; reloadDone(); });
  });
  $doc.on('click', '[data-done-screen]', function () { const id = $(this).data('done-screen'); closeDone(); showScreen(id); });
  const doneItem = (id) => doneView.items.find((i) => i.id === id) || doneView.shared.find((i) => i.id === id);
  $doc.on('click', '[data-done-tab]', function () {
    doneView.tab = $(this).data('done-tab');
    doneView.sharing = null;
    renderDone();
  });
  $doc.on('click', '[data-done-share-to]', function () {
    const id = $(this).data('done-share-to');
    doneView.sharing = doneView.sharing === id ? null : id;
    keepText(() => {});
  });
  $doc.on('click', '[data-done-share-cancel]', () => { doneView.sharing = null; keepText(() => {}); });
  $doc.on('submit', '[data-done-share-form]', function (e) {
    e.preventDefault();
    const userIds = $(this).find('[name=userIds]:checked').map((i, el) => el.value).get();
    api('PUT', `/api/done/${$(this).data('done-share-form')}/shared-with`, { userIds }).done((r) => {
      if (!userIds.length) toast('No longer shared');
      else if (r.teams === 'sent') toast('Shared and posted on Teams');
      else { toast('Shared'); teamsResult(r.teams); }
      reloadDone();
    });
  });
  $doc.on('click', '[data-done-close]', function () {
    const closed = $(this).data('closed') === 1;
    api('PUT', `/api/done/${$(this).data('done-close')}/closed`, { closed }).done((r) => {
      toast(closed ? 'Closed' : 'Opened again');
      if (r.teams !== 'sent') teamsResult(r.teams);
      reloadDone();
    });
  });
  $doc.on('click', '[data-done-edit]', function () {
    const x = doneItem($(this).data('done-edit'));
    ask({
      title: 'Edit entry', fields: [{ name: 'text', label: 'What you did', value: x.text, required: true, max: 1000 }],
      save: (v) => api('PATCH', `/api/done/${x.id}`, v, null, QUIET).done(reloadDone),
    });
  });
  $doc.on('click', '[data-done-delete]', function () {
    const id = $(this).data('done-delete');
    dialog.confirm({ title: 'Delete this entry?', confirmText: 'Delete', danger: true, onConfirm: () => api('DELETE', `/api/done/${id}`, null, null, QUIET).done(reloadDone) });
  });
  $doc.on('click', '[data-done-share]', () => {
    api('POST', '/api/done/share', { productId: doneView.productId, date: doneView.date }).done(() => { toast('Shared on Teams'); reloadDone(); });
  });

  // ---------------------------------------------------------------- sheets: spreadsheets made inside an app
  // Typed columns (text, number, date, dropdown, checkbox, person, flow, screen), search, sort, totals, drag to
  // reorder rows, sharing (private / app can view / app can edit + editors), Excel download and import.
  // A cell saves on its own (only that cell is sent), so the grid is not redrawn while you type.

  const SHEET_TYPES = {
    text: 'Text', number: 'Number', date: 'Date', select: 'Dropdown', checkbox: 'Checkbox', person: 'Person', flow: 'Flow', screen: 'Screen',
  };
  const SHEET_SHARES = [['private', 'Private: only me and editors'], ['view', 'Everyone in the app can view'], ['edit', 'Everyone in the app can edit']];
  const TONE_TAG = { success: 'green', pending: 'amber', fail: 'red', other: 'slate' }; // dropdown value → status tag colour

  let sheetsView = null; // { productId, list, people, canCreate, doc, search, sort: { col, dir } }

  function openSheets(pid, sheetId) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return; }
    api('GET', `/api/sheets?product=${encodeURIComponent(pid)}`).done((d) => {
      const keep = sheetsView && sheetsView.productId === pid ? sheetsView : {};
      sheetsView = { productId: pid, list: d.sheets, people: d.people, canCreate: d.canCreate, doc: null, search: keep.search || '', sort: keep.sort || null };
      const id = sheetId || (keep.doc && d.sheets.some((x) => x.id === keep.doc.id) ? keep.doc.id : d.sheets[0] && d.sheets[0].id);
      $('#sheetsModal').removeClass('hidden');
      $('body').addClass('overflow-hidden');
      if (id) openSheetDoc(id); else renderSheets();
    });
  }
  function openSheetDoc(id) {
    return api('GET', `/api/sheets/${id}`).done((doc) => {
      if (!sheetsView.doc || sheetsView.doc.id !== id) { sheetsView.sort = null; sheetsView.search = ''; }
      sheetsView.doc = doc;
      renderSheets();
    });
  }
  const reloadSheet = () => sheetsView && sheetsView.doc && openSheetDoc(sheetsView.doc.id);
  const reloadSheets = (id) => sheetsView && openSheets(sheetsView.productId, id);

  function closeSheets() {
    sheetsView = null;
    $('#sheetsModal').addClass('hidden');
    unlockScroll();
  }

  const sheetPerson = (id) => (sheetsView.people.find((x) => x.id === id) || {}).name || '';
  function sheetFlows() {
    const p = products.find((x) => x.id === sheetsView.productId);
    return (p ? p.modules : []).flatMap((m) => m.flows.map((f) => ({ m, f })));
  }
  // what a cell shows as text (search, sort)
  function cellText(col, v) {
    if (v === '' || v === undefined || v === null) return '';
    if (col.type === 'checkbox') return v ? 'yes' : '';
    if (col.type === 'person') return sheetPerson(v);
    if (col.type === 'flow') { const f = findFlow(v); return f ? f.name : ''; }
    if (col.type === 'screen') { const x = findScreen(v); return x ? x.name : ''; }
    return String(v);
  }

  function sheetCell(col, row, edit) {
    const v = row.cells[col.id];
    const has = v !== undefined && v !== null && v !== '';
    const attrs = `data-sc data-row="${row.id}" data-col="${col.id}" ${edit ? '' : 'disabled'}`;
    const none = '<option value=""></option>';
    switch (col.type) {
      case 'number': return `<input class="sc-input num" type="number" step="any" value="${has ? esc(v) : ''}" ${attrs}>`;
      case 'date': return `<input class="sc-input" type="date" value="${has ? esc(v) : ''}" ${attrs}>`;
      case 'checkbox': return `<label class="sc-check"><input type="checkbox" class="h-4 w-4 accent-indigo-600" ${v ? 'checked' : ''} ${attrs}></label>`;
      case 'select': return `<select class="sc-input sc-select ${has ? `st st-${TONE_TAG[tone(v)]}` : ''}" ${attrs}>${none}${col.options.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      case 'person': return `<select class="sc-input" ${attrs}>${none}${sheetsView.people.map((x) => `<option value="${x.id}" ${x.id === v ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`;
      case 'flow': {
        const groups = {};
        sheetFlows().forEach(({ m, f }) => { (groups[m.name] ||= []).push(`<option value="${f.id}" ${f.id === v ? 'selected' : ''}>${esc(f.name)}</option>`); });
        return `<div class="sc-link"><select class="sc-input" ${attrs}>${none}${Object.entries(groups).map(([g, o]) => `<optgroup label="${esc(g)}">${o.join('')}</optgroup>`).join('')}</select>
          ${has && findFlow(v) ? `<button class="icon-btn sm" data-sheet-go-flow="${esc(v)}" title="Go to this flow">${icon('link', 12)}</button>` : ''}</div>`;
      }
      case 'screen': {
        const groups = sheetFlows().map(({ m, f }) => `<optgroup label="${esc(flowLabel(m, f))}">${onlyScreens(f.screens).map((x) => `<option value="${x.id}" ${x.id === v ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`);
        return `<div class="sc-link"><select class="sc-input" ${attrs}>${none}${groups.join('')}</select>
          ${has && findScreen(v) ? `<button class="icon-btn sm" data-sheet-go-screen="${esc(v)}" title="Open this screen">${icon('link', 12)}</button>` : ''}</div>`;
      }
      default: return `<textarea class="sc-input sc-text" rows="1" maxlength="2000" ${attrs}>${has ? esc(v) : ''}</textarea>`;
    }
  }

  // rows after search and sort (sorting is only a view; drag order is what is saved)
  function sheetRows() {
    const { doc, search, sort } = sheetsView;
    let rows = doc.rowList;
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((r) => doc.columns.some((c) => cellText(c, r.cells[c.id]).toLowerCase().includes(q)));
    const col = sort && doc.columns.find((c) => c.id === sort.col);
    if (col) {
      const key = (r) => (col.type === 'number' ? (r.cells[col.id] === '' || r.cells[col.id] === undefined ? null : Number(r.cells[col.id])) : cellText(col, r.cells[col.id]).toLowerCase());
      rows = rows.slice().sort((a, b) => {
        const x = key(a); const y = key(b);
        if (x === null || x === '') return 1; if (y === null || y === '') return -1; // empty last
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
    }
    return rows;
  }

  function sheetTotals() {
    const { doc } = sheetsView;
    const rows = sheetRows();
    if (!rows.length || !doc.columns.some((c) => c.type === 'number' || c.type === 'checkbox')) return '';
    return `<tr><td class="sc-num">Σ</td>${doc.columns.map((c) => {
      if (c.type === 'number') {
        const sum = rows.reduce((t, r) => t + (Number(r.cells[c.id]) || 0), 0);
        return `<td class="num">${sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
      }
      if (c.type === 'checkbox') return `<td>${rows.filter((r) => r.cells[c.id] === true).length} / ${rows.length}</td>`;
      return '<td></td>';
    }).join('')}<td></td></tr>`;
  }

  function renderSheets() {
    const v = sheetsView;
    const p = products.find((x) => x.id === v.productId);
    const doc = v.doc;
    const edit = doc && doc.edit;
    const rows = doc ? sheetRows() : [];
    const dragOk = edit && !v.search.trim() && !v.sort;
    $('#sheetsBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <h3 class="min-w-0 flex-1 text-lg font-semibold text-slate-900">Sheets <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
        <button class="icon-btn" data-close-sheets title="Close">${icon('close', 18)}</button>
      </div>
      <div class="sheets-layout">
        <aside class="sheets-side">
          ${v.canCreate ? `
            <button class="btn-primary w-full justify-center" data-sheet-new>${icon('plus', 14)} New sheet</button>
            <label class="btn-secondary w-full cursor-pointer justify-center">${icon('upload', 14)} Import Excel
              <input type="file" class="hidden" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-sheet-import></label>` : ''}
          <div class="mt-2 space-y-0.5">
            ${v.list.map((x) => `
              <button class="sheets-item ${doc && doc.id === x.id ? 'on' : ''}" data-sheet-open="${x.id}">
                ${icon(x.share === 'private' ? 'lock' : 'grid', 13)}<span class="min-w-0 flex-1 truncate text-left">${esc(x.name)}</span><span class="text-xs text-slate-400">${x.rows}</span>
              </button>`).join('') || '<p class="px-2 py-6 text-center text-xs text-slate-400">No sheets yet</p>'}
          </div>
        </aside>
        <section class="sheets-main">
          ${doc ? `
          <div class="sheets-bar">
            <h4 class="min-w-0 truncate text-base font-semibold text-slate-900">${esc(doc.name)}</h4>
            ${doc.manage ? `<button class="icon-btn" data-sheet-rename title="Rename sheet">${icon('edit', 14)}</button>` : ''}
            ${edit ? '' : '<span class="chip">Read only</span>'}
            <span class="text-xs text-slate-400">Owner: ${esc(sheetPerson(doc.ownerId) || '—')}</span>
            <div class="ml-auto flex flex-wrap items-center gap-2">
              <input class="input w-48 py-1 text-sm" type="search" placeholder="Search rows" value="${esc(v.search)}" data-sheet-search>
              ${doc.manage ? `
              <details class="sheet-share">
                <summary class="btn-secondary text-sm">${icon(doc.share === 'private' ? 'lock' : 'user', 14)} Share</summary>
                <div class="sheet-share-pop">
                  <span class="field-label">Who can see it</span>
                  <select class="input w-full text-sm" data-sheet-share>${SHEET_SHARES.map(([k, label]) => `<option value="${k}" ${k === doc.share ? 'selected' : ''}>${label}</option>`).join('')}</select>
                  <span class="field-label mt-3">Editors <span class="font-normal text-slate-400">(can always edit)</span></span>
                  <div class="max-h-48 overflow-y-auto">${v.people.filter((x) => x.id !== doc.ownerId).map((x) => `
                    <label class="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sheet-editor value="${x.id}" ${doc.editors.includes(x.id) ? 'checked' : ''}> ${esc(x.name)}</label>`).join('')}</div>
                  <p class="mt-2 text-xs text-slate-400">View-only logins can never edit.</p>
                </div>
              </details>` : ''}
              <a class="btn-secondary text-sm" href="/api/sheets/${doc.id}/export" title="Download as Excel">${icon('download', 14)} Excel</a>
              ${doc.manage ? `<button class="icon-btn danger" data-sheet-delete title="Delete sheet">${icon('trash', 14)}</button>` : ''}
            </div>
          </div>
          <div class="sheets-grid">
            <table class="sheet-table">
              <thead><tr>
                <th class="sc-num">#</th>
                ${doc.columns.map((c) => `
                  <th style="width:${c.width}px;min-width:${c.width}px" data-col-id="${c.id}">
                    <div class="sc-head">
                      <button class="sc-name" data-sheet-sort="${c.id}" title="Sort by ${esc(c.name)}">
                        <span class="sc-type">${SHEET_TYPES[c.type]}</span><span class="truncate">${esc(c.name)}</span>
                        ${v.sort && v.sort.col === c.id ? icon(v.sort.dir > 0 ? 'down' : 'up', 12) : ''}
                      </button>
                      ${edit ? `<button class="icon-btn sm" data-sheet-col-edit="${c.id}" title="Edit column">${icon('edit', 12)}</button>
                        <button class="icon-btn sm danger" data-sheet-col-delete="${c.id}" title="Delete column">${icon('close', 12)}</button>` : ''}
                    </div>
                  </th>`).join('')}
                <th class="sc-add">${edit ? `<button class="sanity-addcol" data-sheet-col-add>${icon('plus', 12)} Column</button>` : ''}</th>
              </tr></thead>
              <tbody id="sheetRowsBody">
                ${rows.map((r) => `
                  <tr data-row-id="${r.id}">
                    <td class="sc-num"><span class="${dragOk ? 'drag' : ''}" title="${dragOk ? 'Drag to reorder' : ''}">${doc.rowList.indexOf(r) + 1}</span></td>
                    ${doc.columns.map((c) => `<td>${sheetCell(c, r, edit)}</td>`).join('')}
                    <td class="sc-tools">${edit ? `<button class="icon-btn sm danger" data-sheet-row-delete="${r.id}" title="Delete row">${icon('trash', 12)}</button>` : ''}</td>
                  </tr>`).join('') || `<tr><td colspan="${doc.columns.length + 2}" class="py-10 text-center text-sm text-slate-400">${v.search ? 'No rows match' : 'No rows yet'}</td></tr>`}
              </tbody>
              <tfoot id="sheetTotals">${sheetTotals()}</tfoot>
            </table>
          </div>
          <div class="flex items-center gap-3 px-4 py-2 text-xs text-slate-500">
            ${edit ? `<button class="btn-secondary text-sm" data-sheet-row-add>${icon('plus', 14)} Add row</button>` : ''}
            <span>${rows.length}${rows.length !== doc.rowList.length ? ` of ${doc.rowList.length}` : ''} row${doc.rowList.length === 1 ? '' : 's'} · ${doc.columns.length} column${doc.columns.length === 1 ? '' : 's'}</span>
            ${v.sort ? '<button class="text-indigo-600 hover:underline" data-sheet-unsort>Clear sort</button>' : ''}
            ${edit && !dragOk ? '<span>Clear search and sort to drag rows.</span>' : ''}
          </div>` : `
          <div class="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
            <p class="text-sm text-slate-500">Make a sheet for anything: release checklists, test cases, device matrix, a tracker…<br>Columns can link to people, flows and screens of this app.</p>
            ${v.canCreate ? `<button class="btn-primary" data-sheet-new>${icon('plus', 14)} New sheet</button>` : ''}
          </div>`}
        </section>
      </div>`);
    $('#sheetRowsBody .sc-text').each((i, el) => autoGrow(el));
    if (dragOk) {
      Sortable.create($('#sheetRowsBody')[0], {
        handle: '.drag', animation: 150, draggable: 'tr[data-row-id]',
        onEnd: () => api('PUT', `/api/sheets/${doc.id}/row-order`, { ids: $('#sheetRowsBody tr[data-row-id]').map((i, el) => $(el).data('row-id')).get() }).done(reloadSheet),
      });
    }
  }

  // keep the search box focused while it filters
  function refilter() {
    const el = $('[data-sheet-search]')[0];
    const at = el ? el.selectionStart : 0;
    renderSheets();
    const box = $('[data-sheet-search]')[0];
    if (box) { box.focus(); box.setSelectionRange(at, at); }
  }

  const columnDialog = (c = { name: '', type: 'text', options: [] }) => [
    { name: 'name', label: 'Column name', value: c.name, placeholder: 'e.g. Device, Build, Tester', required: true, max: 60 },
    { name: 'type', label: 'Type', value: c.type, options: Object.entries(SHEET_TYPES) },
    { name: 'options', label: 'Dropdown options, comma separated (Dropdown only)', value: c.options.join(', '), placeholder: 'e.g. To do, In progress, Done', max: 600 },
  ];

  $doc.on('click', '[data-action="sheets"]', () => openSheets(productId));
  $doc.on('click', '[data-close-sheets]', closeSheets);
  $('#sheetsModal').on('mousedown', function (e) { if (e.target === this) closeSheets(); });
  $doc.on('click', '[data-sheet-open]', function () { openSheetDoc($(this).data('sheet-open')); });
  $doc.on('click', '[data-sheet-new]', () => ask({
    title: 'New sheet', fields: [{ name: 'name', label: 'Sheet name', placeholder: 'e.g. Release 1.12 checklist', required: true, max: 80 }],
    confirmText: 'Create',
    save: (val) => api('POST', '/api/sheets', { productId: sheetsView.productId, name: val.name }, null, QUIET).done((x) => reloadSheets(x.id)),
  }));
  $doc.on('change', '[data-sheet-import]', function () {
    const file = this.files[0];
    this.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { dialog.alert('Please choose an Excel file under 5 MB.', 'File too large'); return; }
    const reader = new FileReader();
    reader.onload = () => api('POST', '/api/sheets/import', { productId: sheetsView.productId, name: file.name.replace(/\.xlsx$/i, ''), dataUrl: reader.result })
      .done((x) => { toast(`Imported ${x.rows} rows, ${x.columns} columns`); reloadSheets(x.id); });
    reader.readAsDataURL(file);
  });
  $doc.on('click', '[data-sheet-rename]', () => ask({
    title: 'Rename sheet', fields: [{ name: 'name', label: 'Sheet name', value: sheetsView.doc.name, required: true, max: 80 }],
    save: (val) => api('PATCH', `/api/sheets/${sheetsView.doc.id}`, val, null, QUIET).done(() => reloadSheets(sheetsView.doc.id)),
  }));
  $doc.on('click', '[data-sheet-delete]', () => {
    const doc = sheetsView.doc;
    dialog.confirm({
      title: `Delete sheet “${doc.name}”?`, message: `Its ${doc.rowList.length} rows go with it.`, confirmText: 'Delete', danger: true,
      onConfirm: () => api('DELETE', `/api/sheets/${doc.id}`, null, null, QUIET).done(() => { sheetsView.doc = null; reloadSheets(); }),
    });
  });
  $doc.on('change', '[data-sheet-share]', function () {
    api('PATCH', `/api/sheets/${sheetsView.doc.id}`, { share: this.value }).done(() => { toast('Sharing saved'); reloadSheets(sheetsView.doc.id); });
  });
  $doc.on('change', '[data-sheet-editor]', () => {
    const editors = $('[data-sheet-editor]:checked').map((i, el) => el.value).get();
    api('PATCH', `/api/sheets/${sheetsView.doc.id}`, { editors }).done(() => { sheetsView.doc.editors = editors; toast('Editors saved'); });
  });
  $doc.on('input', '[data-sheet-search]', function () { sheetsView.search = this.value; refilter(); });
  $doc.on('click', '[data-sheet-sort]', function () {
    const col = $(this).data('sheet-sort');
    const s = sheetsView.sort;
    sheetsView.sort = !s || s.col !== col ? { col, dir: 1 } : s.dir > 0 ? { col, dir: -1 } : null; // asc → desc → off
    renderSheets();
  });
  $doc.on('click', '[data-sheet-unsort]', () => { sheetsView.sort = null; renderSheets(); });

  // a cell saves itself; the grid only redraws its totals (and the row when a link button needs to appear)
  $doc.on('change', '[data-sc]', function () {
    const { doc } = sheetsView;
    const row = doc.rowList.find((r) => r.id === $(this).data('row'));
    const col = doc.columns.find((c) => c.id === $(this).data('col'));
    const value = col.type === 'checkbox' ? this.checked : this.value.trim();
    const el = this;
    api('PATCH', `/api/sheet-rows/${row.id}`, { cells: { [col.id]: value } }, el)
      .done((saved) => {
        row.cells = saved.cells;
        $('#sheetTotals').html(sheetTotals());
        if (['select', 'flow', 'screen'].includes(col.type)) $(el).closest('td').html(sheetCell(col, row, true));
      })
      .fail(() => { el.value = row.cells[col.id] ?? ''; });
  });
  $doc.on('input', '#sheetRowsBody .sc-text', function () { autoGrow(this); });
  $doc.on('click', '[data-sheet-go-flow]', function () { const id = $(this).data('sheet-go-flow'); closeSheets(); showFlow(id); });
  $doc.on('click', '[data-sheet-go-screen]', function () { const id = $(this).data('sheet-go-screen'); closeSheets(); showScreen(id); });
  $doc.on('click', '[data-sheet-row-add]', () => {
    api('POST', `/api/sheets/${sheetsView.doc.id}/rows`, {}).done(() => reloadSheet().done(() => {
      const $last = $('#sheetRowsBody tr[data-row-id]').last();
      if ($last.length) { $last[0].scrollIntoView({ block: 'nearest' }); $last.find('[data-sc]').first().trigger('focus'); }
    }));
  });
  $doc.on('click', '[data-sheet-row-delete]', function () {
    api('DELETE', `/api/sheet-rows/${$(this).data('sheet-row-delete')}`).done(reloadSheet);
  });
  $doc.on('click', '[data-sheet-col-add]', () => ask({
    title: 'New column', fields: columnDialog(), confirmText: 'Add column',
    save: (val) => api('POST', `/api/sheets/${sheetsView.doc.id}/columns`, val, null, QUIET).done(reloadSheet),
  }));
  $doc.on('click', '[data-sheet-col-edit]', function () {
    const c = sheetsView.doc.columns.find((x) => x.id === $(this).data('sheet-col-edit'));
    ask({
      title: 'Edit column', fields: columnDialog(c),
      save: (val) => api('PATCH', `/api/sheet-columns/${c.id}`, val, null, QUIET).done(reloadSheet),
    });
  });
  $doc.on('click', '[data-sheet-col-delete]', function () {
    const c = sheetsView.doc.columns.find((x) => x.id === $(this).data('sheet-col-delete'));
    dialog.confirm({
      title: `Delete column “${c.name}”?`, message: 'Its values in every row go with it.', confirmText: 'Delete', danger: true,
      onConfirm: () => api('DELETE', `/api/sheet-columns/${c.id}`, null, null, QUIET).done(reloadSheet),
    });
  });

  // ---------------------------------------------------------------- a submitted sanity (log): the sheet as it was, Excel, share with anyone

  let sanityLog = null;

  function openSanityLog(id) {
    api('GET', `/api/sanity/logs/${id}`).done((log) => {
      sanityLog = log;
      renderSanityLog();
      $('#sanityLogModal').removeClass('hidden');
      $('body').addClass('overflow-hidden');
    });
  }
  function closeSanityLog() {
    sanityLog = null;
    $('#sanityLogModal').addClass('hidden');
    unlockScroll();
  }

  function renderSanityLog() {
    const l = sanityLog;
    const people = sanity ? sanity.people : [];
    const link = `${location.origin}/#sanity=${encodeURIComponent(l.productId)}&log=${l.id}`;
    $('#sanityLogBody').html(`
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Sanity report · ${fmtDate(l.date)} <span class="font-mono text-sm font-normal text-slate-500">v${esc(l.version)}</span></h3>
          <p class="text-xs text-slate-500">Done by ${esc(l.testers.join(', ') || l.submittedBy)} · submitted by ${esc(l.submittedBy)}, ${new Date(l.submittedAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span class="chip pass">${l.passed} / ${l.total} passed</span>
        ${l.failed ? `<span class="chip fail">${l.failed} failed</span>` : ''}
        <a class="btn-secondary text-sm" href="/api/sanity/logs/${l.id}/export">${icon('download', 14)} Excel</a>
        <button class="icon-btn" data-close-sanity-log title="Close">${icon('close', 18)}</button>
      </div>
      <div class="sanity-sheet-wrap">
        <table class="sanity-sheet">
          <thead><tr><th>#</th><th>Heading</th><th>Status</th><th>Remarks</th>${l.columns.map((c) => `<th>${esc(c)}</th>`).join('')}<th>Checked by</th></tr></thead>
          <tbody>${l.rows.map((r, i) => `
            <tr class="sanity-row ${r.state}">
              <td><span class="sanity-no">${i + 1}</span></td>
              <td><span class="sanity-heading">${esc(r.heading)}</span>${r.module ? `<div class="sanity-meta"><span>${esc(r.module)}</span></div>` : ''}</td>
              <td>${r.state === 'pass' ? `<span class="chip pass">${icon('check', 12)} Done</span>` : `<span class="chip fail">${icon('close', 12)} Failed</span>`}</td>
              <td class="whitespace-pre-wrap text-sm">${esc(r.review)}</td>
              ${l.columns.map((c) => `<td class="text-sm">${esc(r.cells[c] || '')}</td>`).join('')}
              <td class="whitespace-nowrap text-sm text-slate-600">${esc(r.checkedBy)}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
      ${can('edit') ? `
      <form id="sanityLogShare" class="border-t border-slate-200 px-5 py-4">
        <p class="text-sm font-semibold text-slate-900">Share this report</p>
        <p class="mb-2 text-xs text-slate-500">Posts it on the app's Teams channel and @mentions the people you pick. Or copy the link and send it anywhere.</p>
        <div class="flex max-h-36 flex-wrap gap-x-4 gap-y-1 overflow-y-auto">${people.map((x) => `
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="userIds" value="${x.id}"> ${esc(x.name)}</label>`).join('')}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="btn-primary" ${sanity && sanity.teams ? '' : 'disabled title="This app has no Teams channel yet"'}>${icon('share', 14)} Send on Teams</button>
          <button type="button" class="btn-secondary" data-copy-link="${esc(link)}">${icon('link', 14)} Copy link</button>
        </div>
      </form>` : ''}`);
  }

  $doc.on('click', '[data-close-sanity-log]', closeSanityLog);
  $('#sanityLogModal').on('mousedown', function (e) { if (e.target === this) closeSanityLog(); });
  $doc.on('submit', '#sanityLogShare', function (e) {
    e.preventDefault();
    const userIds = $(this).find('[name=userIds]:checked').map((i, el) => el.value).get();
    api('POST', `/api/sanity/logs/${sanityLog.id}/share`, { userIds }).done(() => {
      toast('Report sent on Teams');
      if (sanity) reloadSanity();
    });
  });
  $doc.on('click', '[data-copy-link]', function () {
    const url = $(this).data('copy-link');
    const done = () => toast('Link copied');
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => dialog.alert(url, 'Copy this link'));
    else dialog.alert(url, 'Copy this link');
  });

  load();
});
