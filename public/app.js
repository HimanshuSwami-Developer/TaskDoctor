/* FlowTrace — jQuery front-end. © 2026 FinDevelopers · Prompting by Himanshu Swami · Idea & prompts by Vishal Yadav */
$(function () {
  // inside the Microsoft sign-in popup (public/graph.js): the window that opened it reads the answer and closes it
  if (window.msalPopup) { $('body').html('<p style="padding:48px 16px;text-align:center;font:14px system-ui;color:#64748b">Signing in to Microsoft…</p>'); return; }
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
    cursor: 'M5 3l6.5 17 2.4-7.1L21 10.5z',
    hand: 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15',
    box: 'M3 6h18v12H3z',
    popup: 'M3 10V6h5M16 6h5v4M21 14v4h-5M8 18H3v-4',
    diamond: 'M12 2l10 10-10 10L2 12z',
    arrow: 'M4 12h15M13 6l6 6-6 6',
    type: 'M4 7V4h16v3M9 20h6M12 4v16',
    undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
    redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
    fit: 'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5',
    sticky: 'M4 4h16v10l-6 6H4zM14 20v-6h6',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    filter: 'M3 4h18l-7 8.5V19l-4 2v-8.5z',
    panel: 'M3 3h18v18H3zM9 3v18',
    chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z',
    fork: 'M12 3v6M12 9l-6 6v5M12 9l6 6v5M3.5 17.5 6 20l2.5-2.5M15.5 17.5 18 20l2.5-2.5',
    clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    ban: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8',
    skip: 'M5 5l9 7-9 7zM18 5v14',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
    clip: 'M21 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9',
    keyboard: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
    focus: 'M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    compare: 'M8 3v18M16 3v18M3 7h5M3 12h5M16 12h5M16 17h5',
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
      [data-dg-new="condition"], [data-dg-branch-add], [data-dg-branch-remove], [data-mark-nav], [data-remove-link], [data-sketch-module], [data-sketch-flow]`,
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
      .done((r) => { if (r && r.notify) teamsNotify(r.notify); }) // an issue change: message the people on Teams
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
  let routed = false;
  let graphAsked = false; // Microsoft sign-in (public/graph.js) set up once // the #flow= / #screen= / #sanity= / #done= link was opened

  function load() {
    if (!graphAsked) {
      graphAsked = true;
      api('GET', '/api/teams/graph', null, null, QUIET).done((cfg) => window.flowGraph.setup(cfg).then(() => { if (me) renderAccount(); }));
    }
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
          <button class="btn-secondary" data-sketch-module="${m.id}" title="Draw the flow like on a whiteboard, then create its screens and conditions">${icon('pen', 14)} Draw flow</button>
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
          <button class="video-btn" data-sketch-flow="${f.id}" title="Draw more steps and add them to the end of this flow">${icon('pen', 12)} Draw</button>
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

    const branches = c.branches || [];
    const steps = findFlow(c.flowId).screens;
    const next = steps[steps.findIndex((x) => x.id === c.id) + 1];
    // a branch wired to the next card takes the place of the dashed arrow to it
    const wiredNext = Boolean(next) && branches.some((b) => b.targetId === next.id);
    return `
      <div class="card cond ${wiredNext ? 'wired-next' : ''}" data-id="${c.id}">
        ${arrowAdd(c)}
        <div class="cond-head">
          <span class="cond-badge">${icon('fork', 18)}</span>
          <div class="min-w-0 flex-1">
            <h4 class="cond-name" title="${esc(c.name)}">${esc(c.name)}</h4>
            <p class="cond-kind">Decision · ${branches.length} outcome${branches.length === 1 ? '' : 's'}</p>
          </div>
          <button class="icon-btn" data-copy-screen="${c.id}" title="Copy condition and its paths to other flows">${icon('copy', 14)}</button>
          <button class="icon-btn" data-rename-condition="${c.id}" title="Rename">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-cond-tool data-delete-screen="${c.id}" title="Delete condition">${icon('trash', 14)}</button>
        </div>
        <ul class="cond-branches">
          ${branches.map((b) => `
            <li class="cond-branch tone-${tone(b.label)}" data-branch="${b.id}">
              <div class="cb-line">
                <span class="cb-ico" title="If">${icon(TONE_ICON[tone(b.label)], 12)}</span>
                <input class="cb-input cb-label" value="${esc(b.label)}" placeholder="If… e.g. Success" title="If" data-branch-label>
                <button class="icon-btn sm danger" data-remove-branch="${b.id}" title="Remove branch">${icon('close', 12)}</button>
              </div>
              <div class="cb-line">
                <span class="cb-show" title="Show">${icon('right', 14)}</span>
                <select class="cb-input cb-target" title="Show" data-branch-target>${targetOptions(b.targetId)}</select>
                ${b.targetId ? `<button class="icon-btn sm" data-locate="${b.targetId}" title="Go to screen">${icon('locate', 14)}</button>` : ''}
              </div>
              ${pathsOf(c.id, b.id).map((path) => `
                <div class="cb-line cb-path">
                  <span class="cb-show">${icon('extend', 12)}</span>
                  <button class="min-w-0 flex-1 truncate text-left font-medium text-indigo-600 hover:underline" data-goto-flow="${path.id}">${esc(path.name)}</button>
                  <span class="shrink-0 text-slate-400">${onlyScreens(path.screens).length} screens</span>
                </div>`).join('') || `
                <button class="cb-extend" data-extend-path="${c.id}" data-branch-id="${b.id}">${icon('plus', 12)} Extend path</button>`}
              <span class="cb-port" data-port="${b.id}"></span>
            </li>`).join('')}
        </ul>
        <button class="cb-add" data-add-branch="${c.id}">${icon('plus', 14)} Add branch</button>
      </div>`;
  }

  // ---------------------------------------------------------------- condition wires: each branch drawn to the screen it shows
  //
  // One SVG behind the board's cards (it only shows in the gaps) with a line from each branch's port to its target card,
  // in the branch colour. The next card in the row is reached straight across the gap; a card further along the
  // row by a lane under the row, rising into the card; a card in another flow (a path) by the lane under the row, then
  // down the gap left of the card and in from its side. A card scrolled out of its row is wired to the row's edge.
  // Every wire is always there, faint; hovering a condition (or one branch) makes its wires glow, and tapping keeps
  // that glow until another condition or branch is tapped. Redrawn with the "L" elbows (render, resize, row scroll).
  const TONE_ICON = { success: 'check', pending: 'clock', fail: 'close', other: 'fork' };
  const WIRE_COLOR = { success: '#16a34a', pending: '#ea580c', fail: '#dc2626', other: '#64748b' };

  // a path through points with rounded corners, ending in an arrowhead
  function wirePath(pts) {
    const p = pts.filter((q, i) => !i || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length - 1; i += 1) {
      const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
      const r = Math.min(8, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, Math.hypot(c[0] - b[0], c[1] - b[1]) / 2);
      const s = (q, t) => [b[0] + Math.sign(q[0] - b[0]) * t, b[1] + Math.sign(q[1] - b[1]) * t];
      const [x1, y1] = s(a, r);
      const [x2, y2] = s(c, r);
      d += `L${x1} ${y1}Q${b[0]} ${b[1]} ${x2} ${y2}`;
    }
    const [ex, ey] = p[p.length - 1];
    const [fx, fy] = p[p.length - 2] || p[0];
    d += `L${ex} ${ey}`;
    const ang = Math.atan2(ey - fy, ex - fx);
    const head = (t) => `${ex - 7 * Math.cos(ang + t)} ${ey - 7 * Math.sin(ang + t)}`;
    return { d, head: `M${head(0.5)}L${ex} ${ey}L${head(-0.5)}` };
  }

  function placeWires() {
    const board = document.getElementById('board');
    if (!board) return;
    let svg = board.querySelector(':scope > .cond-wires');
    const conds = board.querySelectorAll('.card.cond');
    if (!conds.length) { if (svg) svg.remove(); return; }
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'cond-wires');
      svg.setAttribute('aria-hidden', 'true');
      board.prepend(svg); // first, so the cards are drawn over it
    }
    const base = board.getBoundingClientRect();
    const rel = (x, y) => [Math.round(x - base.left), Math.round(y - base.top)];
    const lanes = new Map(); // row → lanes used under it
    const out = [];
    conds.forEach((card) => {
      const row = card.closest('.screens');
      const rr = row.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      if (cr.right < rr.left || cr.right > rr.right) return; // condition scrolled out of its row
      const s = findScreen($(card).data('id'));
      (s && s.branches || []).forEach((b, i) => {
        const target = b.targetId && board.querySelector(`.card[data-id="${b.targetId}"]`);
        const port = card.querySelector(`[data-port="${b.id}"]`);
        if (!b.targetId || !port) return;
        const pr = port.getBoundingClientRect();
        const color = WIRE_COLOR[tone(b.label)];
        const tag = `class="wire" data-wire="${b.id}" data-cond="${s.id}" data-target="${b.targetId}" style="--wire:${color}"`;
        if (!target) { // a screen not on this board (another module): a short dashed stub
          const [sx, sy] = rel(pr.left + pr.width / 2, pr.top + pr.height / 2);
          const stub = wirePath([[sx, sy], [sx + 24, sy]]);
          out.push(`<g ${tag}><path class="wire-line stub" d="${stub.d}"/><path class="wire-head" d="${stub.head}"/></g>`);
          return;
        }
        const tr = target.getBoundingClientRect();
        const tRow = target.closest('.screens');
        const trr = tRow.getBoundingClientRect();
        const [px, py] = rel(pr.left + pr.width / 2, pr.top + pr.height / 2);
        const right = rel(cr.right, 0)[0];
        const mid = right + 12 + (i % 4) * 7;
        const next = tRow === row && tr.left >= cr.right && tr.left - cr.right < 80; // the card right after
        // a lane under the row, one per wire that uses it
        const lane = () => {
          const n = lanes.get(row) || 0;
          lanes.set(row, n + 1);
          return rel(0, rr.bottom)[1] + 4 + (n % 5) * 6;
        };
        const tIn = Math.min(Math.max(tr.left, trr.left), trr.right); // the target's left edge, kept inside its row
        const [tx, ty] = rel(tIn, tr.top + 107); // card arrow height
        let pts;
        if (next) {
          pts = [[px, py], [Math.min(mid, tx - 10), py], [Math.min(mid, tx - 10), ty], [tx - 2, ty]]; // the next card
        } else if (tRow === row && tr.left >= cr.right) {
          const y = lane();
          const cx = Math.min(rel(tr.left + tr.width / 2, 0)[0], rel(rr.right, 0)[0] - 12);
          const seen = tr.left + tr.width / 2 < rr.right;
          pts = [[px, py], [mid, py], [mid, y], seen ? [cx, y] : [cx + 8, y]];
          if (seen) pts.push([cx, rel(0, tr.bottom)[1] + 2]);
        } else {
          const y = lane();
          const gx = tx - 20;
          pts = [[px, py], [mid, py], [mid, y], [gx, y], [gx, ty], [tx - 2, ty]];
        }
        const { d, head } = wirePath(pts);
        // wire-flow: light running along the wire towards the screen while it glows
        out.push(`<g ${tag}><path class="wire-line" d="${d}"/><path class="wire-flow" d="${d}"/><path class="wire-head" d="${head}"/></g>`);
      });
    });
    svg.setAttribute('width', board.scrollWidth);
    svg.setAttribute('height', board.scrollHeight);
    svg.innerHTML = out.join('');
    glowWires();
  }

  // Glow: { cond, branch } (branch null = every wire of the condition). Hovering shows one for a moment; tapping
  // keeps one until another condition or branch is tapped (tapping the glowing one again lets it go).
  let wireHover = null;
  let wirePinned = null;
  const sameGlow = (a, b) => Boolean(a && b) && a.cond === b.cond && a.branch === b.branch;
  const glowOf = (el) => {
    const $el = $(el);
    return { cond: $el.closest('.card.cond').data('id'), branch: $el.closest('[data-branch]').data('branch') || null };
  };
  function glowWires() {
    const lit = [wirePinned, wireHover].filter(Boolean);
    const on = (g) => lit.some((x) => g.dataset.cond === x.cond && (!x.branch || g.dataset.wire === x.branch));
    $('#board .wire-target').removeClass('wire-target');
    $('#board .cond-branch.lit').removeClass('lit');
    $('#board .cond-wires .wire').each((i, g) => {
      g.classList.toggle('on', on(g));
      if (on(g)) {
        $(`#board .card[data-id="${g.dataset.target}"]`).addClass('wire-target').css('--wire', g.style.getPropertyValue('--wire'));
        $(`#board .cond-branch[data-branch="${g.dataset.wire}"]`).addClass('lit');
      }
    });
    $('#board .card.cond').each((i, el) => el.classList.toggle('pinned', Boolean(wirePinned) && $(el).data('id') === wirePinned.cond));
  }
  $doc.on('mouseover', '.card.cond', function (e) {
    // the gaps between branch rows keep what is glowing, so moving from one branch to the next doesn't flash them all
    if ($(e.target).closest('.cond-branches').length && !$(e.target).closest('[data-branch]').length) return;
    const g = glowOf(e.target);
    if (sameGlow(g, wireHover)) return;
    wireHover = g;
    glowWires();
  });
  $doc.on('mouseleave', '.card.cond', () => { wireHover = null; glowWires(); });
  $doc.on('click', '.card.cond', function (e) {
    const g = glowOf(e.target);
    // a tap on a field or button (editing a branch) keeps the glow on; a tap elsewhere toggles it
    const editing = $(e.target).closest('input, select, button, label').length;
    wirePinned = sameGlow(g, wirePinned) && !editing ? null : g;
    glowWires();
  });

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
    placeWires();
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
      edges.push(`<path class="dg-head" d="${d}Z" style="stroke:${color};fill:${color}"/>`); // a solid head, FigJam style
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
          arrow(x1 - 1, mid, 'right', 'var(--dg-ink)');
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
        html.push(`<div class="dg-node screen ${isPopup(x) ? 'popup' : ''} ${top ? `ring-${top}` : ''}" style="left:${nx}px;top:${ny}px" data-dg-open="${x.id}" title="Open screen">
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

  // ---------------------------------------------------------------- draw a flow: a whiteboard that turns into screens and conditions
  //
  // Boxes are screens, dashed boxes popups, diamonds conditions, and arrows join them; text notes are only notes.
  // "Create" reads the drawing (sketchPlan) and makes everything in one call:
  // - the one box no arrow points into is the first screen; following the arrows gives the order of the flow
  // - a screen with more than one arrow out continues along the unlabelled arrow that points most to the right;
  //   each other arrow starts a new flow from that screen, named after the arrow's text (Full access)
  // - every arrow out of a condition is a branch named after its text: to a box not placed yet it becomes the
  //   branch's path (1.1, 1.2 … on the board); to a screen already placed it points back at that screen
  // The drawing is kept in this browser (per module, or per flow when drawing into one) until it is created.

  const SK = { w: 170, h: 72, condW: 170, condH: 110, stickyW: 170, stickyH: 150 };
  const SK_SHAPES = ['screen', 'popup', 'condition'];
  const SK_TOOLS = [
    { id: 'select', key: 'v', no: '1', icon: 'cursor', title: 'Select and move' },
    { id: 'hand', key: 'h', no: '', icon: 'hand', title: 'Move around (or hold Space)' },
    { id: 'screen', key: 'r', no: '2', icon: 'box', title: 'Screen' },
    { id: 'popup', key: 'p', no: '3', icon: 'popup', title: 'Popup' },
    { id: 'condition', key: 'd', no: '4', icon: 'diamond', title: 'Condition' },
    { id: 'arrow', key: 'a', no: '5', icon: 'arrow', title: 'Arrow: drag from one box to another' },
    { id: 'text', key: 's', no: '6', icon: 'sticky', title: 'Sticky note (not created as a step)' },
  ];
  const sketch = { open: false, els: [], sel: new Set(), tool: 'select', zoom: 1, panX: 0, panY: 0, past: [], future: [], editing: null, drag: null };
  const skId = () => Math.random().toString(36).slice(2, 10);
  const skFind = (id) => sketch.els.find((e) => e.id === id);
  const skName = (e) => (e.text || '').replace(/\s+/g, ' ').trim();
  const skCenter = (e) => [e.x + e.w / 2, e.y + e.h / 2];
  const skSvg = () => $('#sketchBody .sk-svg')[0];

  // where the line from e's centre towards `p` leaves e (with a small gap)
  function skEdge(e, p) {
    const [cx, cy] = skCenter(e);
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    if (!dx && !dy) return [cx, cy];
    const hw = e.w / 2 + 6;
    const hh = e.h / 2 + 6;
    const t = e.type === 'condition' ? 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh) : Math.min(hw / Math.abs(dx || 1e-9), hh / Math.abs(dy || 1e-9));
    return [cx + dx * t, cy + dy * t];
  }
  // An arrow runs between the centres of the boxes it is joined to (or where an end was let go), bent by `bend`:
  // the control point of its curve sits `bend` away from the middle of that line, at a right angle.
  function skControl(a, bend = a.bend || 0) {
    const from = a.from && skFind(a.from);
    const to = a.to && skFind(a.to);
    const p1 = from ? skCenter(from) : [a.x1, a.y1];
    const p2 = to ? skCenter(to) : [a.x2, a.y2];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const n = [-(p2[1] - p1[1]) / len, (p2[0] - p1[0]) / len];
    return { from, to, p1, p2, n, mid: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2], c: [(p1[0] + p2[0]) / 2 + n[0] * bend, (p1[1] + p2[1]) / 2 + n[1] * bend] };
  }
  // its two ends, on the edge of the box each is joined to, and the curve's control point
  function skEnds(a, bend) {
    const { from, to, p1, p2, c } = skControl(a, bend);
    return [from ? skEdge(from, c) : p1, to ? skEdge(to, c) : p2, c];
  }
  // points along the arrow (for hit tests and boxes)
  function skCurve(a, bend) {
    const [p1, p2, c] = skEnds(a, bend);
    return Array.from({ length: 17 }, (_, i) => {
      const t = i / 16;
      const u = 1 - t;
      return [u * u * p1[0] + 2 * u * t * c[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * c[1] + t * t * p2[1]];
    });
  }
  const skArrowMid = (a) => skCurve(a)[8];
  const skNearArrow = (p, a, tol) => skCurve(a).some((q, i, pts) => i && skSegDist(p, pts[i - 1], q) <= tol);
  function skBox(e) {
    if (e.type !== 'arrow') return { x: e.x, y: e.y, w: e.w, h: e.h };
    const pts = skCurve(e);
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  // a new arrow that would run through another box curves around it (the smallest bend that clears every box)
  function skAutoBend(a) {
    const others = sketch.els.filter((e) => SK_SHAPES.includes(e.type) && e.id !== a.from && e.id !== a.to);
    const clear = (bend) => !skCurve(a, bend).some((q) => others.some((e) => skInside(e, q, 12)));
    a.bend = [0, -70, 70, -130, 130, -200, 200].find(clear) || 0;
  }
  const skSegDist = ([px, py], [x1, y1], [x2, y2]) => {
    const l = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    const t = l ? Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l)) : 0;
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  };
  const skInside = (e, [x, y], pad = 0) => {
    if (e.type === 'condition') {
      const [cx, cy] = skCenter(e);
      return Math.abs(x - cx) / (e.w / 2 + pad) + Math.abs(y - cy) / (e.h / 2 + pad) <= 1;
    }
    return x >= e.x - pad && x <= e.x + e.w + pad && y >= e.y - pad && y <= e.y + e.h + pad;
  };
  // topmost element at a point; arrows are easier to grab than the box under them
  function skHit(p) {
    const tol = 7 / sketch.zoom;
    const list = sketch.els.slice().reverse();
    return list.find((e) => e.type === 'arrow' && skNearArrow(p, e, tol))
      || list.find((e) => e.type !== 'arrow' && skInside(e, p, tol / 2));
  }
  const skShapeAt = (p, not) => sketch.els.slice().reverse().find((e) => SK_SHAPES.includes(e.type) && e.id !== not && skInside(e, p, 10 / sketch.zoom));


  // ---- reading the drawing

  function sketchPlan(flowName) {
    const errors = [];
    const warnings = [];
    const bad = new Set(); // ids drawn in red
    const skipped = new Set(); // ids drawn faded
    const shapes = sketch.els.filter((e) => SK_SHAPES.includes(e.type));
    const byId = new Map(shapes.map((e) => [e.id, e]));
    const quote = (e) => `“${skName(e) || 'unnamed'}”`;
    const arrows = [];
    let loose = 0;
    sketch.els.filter((e) => e.type === 'arrow').forEach((a) => {
      if (byId.has(a.from) && byId.has(a.to) && a.from !== a.to) arrows.push(a);
      else { loose += 1; skipped.add(a.id); }
    });
    if (!shapes.length) return { steps: [], errors, warnings, bad, skipped, empty: true };
    if (loose) warnings.push(`${loose} arrow${loose === 1 ? ' is' : 's are'} not joined to a box at both ends, so ${loose === 1 ? 'it is' : 'they are'} skipped.`);
    const unnamed = shapes.filter((e) => !skName(e));
    unnamed.forEach((e) => bad.add(e.id));
    if (unnamed.length) errors.push(`${unnamed.length} box${unnamed.length === 1 ? ' has' : 'es have'} no name. Double-click a box to write its name.`);

    const outs = new Map(shapes.map((e) => [e.id, []]));
    const ins = new Map(shapes.map((e) => [e.id, 0]));
    arrows.forEach((a) => { outs.get(a.from).push(a); ins.set(a.to, ins.get(a.to) + 1); });
    const leftTop = (p, q) => (p.x - q.x) || (p.y - q.y);
    const starts = shapes.filter((e) => !ins.get(e.id)).sort(leftTop);
    if (starts.length > 1) {
      starts.forEach((e) => bad.add(e.id));
      errors.push(`Only the first screen can have no arrow coming in, but ${starts.length} boxes have none: ${starts.map(quote).join(', ')}. Join them with arrows, or delete the ones you don't need.`);
    }
    const start = starts[0] || shapes.slice().sort(leftTop)[0]; // all in a loop: start top-left

    const placed = new Map(); // shape id → step
    const later = []; // conditions and screens whose other arrows are read after the lane they are in
    const walk = (first, laneName) => {
      const steps = [];
      for (let cur = first; cur && !placed.has(cur.id);) {
        const step = { key: cur.id, type: cur.type, name: skName(cur) };
        placed.set(cur.id, step);
        steps.push(step);
        const out = outs.get(cur.id);
        if (cur.type === 'condition') { later.push({ step, cond: cur, out, laneName }); break; }
        if (!out.length) break;
        const [cx, cy] = skCenter(cur);
        const ahead = (a) => { const [x, y] = skCenter(byId.get(a.to)); return (x - cx) - Math.abs(y - cy) / 2; };
        const [next, ...rest] = out.slice().sort((p, q) => (Boolean(skName(p)) - Boolean(skName(q)))
          || (placed.has(p.to) - placed.has(q.to)) || (ahead(q) - ahead(p)));
        if (rest.length) later.push({ step, screen: cur, out: rest, laneName });
        if (placed.has(next.to)) {
          skipped.add(next.id);
          warnings.push(`The arrow ${quote(cur)} → ${quote(byId.get(next.to))} is skipped: a screen can only be in one place. To go back to a screen, point a condition's branch at it.`);
          break;
        }
        cur = byId.get(next.to);
      }
      return { steps };
    };
    const root = walk(start, flowName);
    while (later.length) {
      const item = later.shift();
      if (item.cond) {
        if (item.out.some((a) => !skName(a))) warnings.push(`Name every arrow out of ${quote(item.cond)}: its text is the branch (e.g. Success). Double-click an arrow to write on it.`);
        const y = (a) => skCenter(byId.get(a.to))[1];
        item.step.branches = item.out.slice().sort((p, q) => y(p) - y(q)).map((a) => {
          const label = skName(a);
          const to = byId.get(a.to);
          if (!placed.has(to.id)) {
            const pathName = `${item.laneName} › ${label || 'Path'}`;
            return { label, path: walk(to, pathName), pathName };
          }
          if (to.type === 'condition') {
            skipped.add(a.id);
            warnings.push(`Branch “${label || '—'}” of ${quote(item.cond)} points at a condition, but a branch can only show a screen. It is left empty.`);
            return { label };
          }
          return { label, target: to.id };
        });
      } else {
        item.step.extends = item.out.map((a) => {
          const to = byId.get(a.to);
          if (placed.has(to.id)) {
            skipped.add(a.id);
            warnings.push(`The arrow ${quote(item.screen)} → ${quote(to)} is skipped: ${quote(to)} is already in the flow.`);
            return null;
          }
          const name = skName(a) || `${item.laneName} › ${item.step.name}`;
          return { name, steps: walk(to, name).steps };
        }).filter(Boolean);
        if (item.step.extends.length && !can('full')) {
          bad.add(item.screen.id);
          errors.push(`${quote(item.screen)} has more than one arrow out. Starting a new flow from a screen needs Full access: put a condition (diamond) after it instead.`);
        }
      }
    }
    const lost = shapes.filter((e) => !placed.has(e.id) && !bad.has(e.id));
    lost.forEach((e) => skipped.add(e.id));
    if (lost.length) warnings.push(`Not joined to the flow, so skipped: ${lost.map(quote).join(', ')}.`);
    return { steps: root.steps, errors, warnings, bad, skipped, startId: start.id, placed };
  }

  // ---- drawing: FigJam's look — pastel boxes with a stronger outline, sticky notes, smooth connectors

  // colours a box or a sticky can have: [fill, outline, sticky fill]
  const SK_COLORS = {
    blue: ['#d4ecff', '#0d99ff', '#b6dcff'], violet: ['#e9deff', '#9747ff', '#d9c7ff'], yellow: ['#fff1c2', '#f5a700', '#ffe589'],
    green: ['#d6f5dc', '#14ae5c', '#b8ecc4'], orange: ['#ffe2c7', '#ff8a00', '#ffd0a3'], red: ['#ffd9d4', '#f24822', '#ffc2ba'],
    pink: ['#ffd6f3', '#ff24bd', '#ffbdeb'], teal: ['#cff7f3', '#0fb9a8', '#b0efe8'], gray: ['#f0f0f0', '#8d8d8d', '#e3e3e3'],
  };
  const SK_DEFAULT = { screen: 'blue', popup: 'violet', condition: 'yellow', text: 'yellow' };
  const skColor = (e) => SK_COLORS[e.color] || SK_COLORS[SK_DEFAULT[e.type]];
  const skArrowColor = (a) => {
    const from = a.from && skFind(a.from);
    if (!from || from.type !== 'condition') return 'var(--sk-line)'; // black, white in the dark theme
    const t = tone(skName(a));
    return t === 'other' ? '#5f6b7a' : TONE_COLOR[t];
  };
  function skElementSvg(e) {
    if (e.type === 'arrow') {
      const [[x1, y1], [x2, y2], [cx, cy]] = skEnds(e);
      const color = skArrowColor(e);
      const ang = Math.atan2(y2 - cy, x2 - cx); // the curve's direction where it ends
      const back = `${x2 - 9 * Math.cos(ang)} ${y2 - 9 * Math.sin(ang)}`; // the line stops under the head
      const head = (s) => `${x2 - 13 * Math.cos(ang + s)} ${y2 - 13 * Math.sin(ang + s)}`;
      const d = Math.abs(e.bend || 0) > 1 ? `M${x1} ${y1}Q${cx} ${cy} ${back}` : `M${x1} ${y1}L${back}`;
      return `<path d="${d}" style="fill:none;stroke:${color}" stroke-width="2" stroke-linecap="round"/>
        <path d="M${x2} ${y2}L${head(0.42)}L${head(-0.42)}Z" style="fill:${color};stroke:${color}" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    const [fill, line, sticky] = skColor(e);
    if (e.type === 'text') return `<rect class="sk-sticky" x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="3" fill="${sticky}"/>`;
    if (e.type === 'condition') {
      return `<path d="M${e.x + e.w / 2} ${e.y}L${e.x + e.w} ${e.y + e.h / 2}L${e.x + e.w / 2} ${e.y + e.h}L${e.x} ${e.y + e.h / 2}Z"
        fill="${fill}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="${fill}" stroke="${line}" stroke-width="2"${e.type === 'popup' ? ' stroke-dasharray="7 5"' : ''}/>`;
  }
  function skLabelSvg(e) {
    if (sketch.editing === e.id || !e.text) return '';
    if (e.type === 'arrow') {
      const [x, y] = skArrowMid(e);
      return `<foreignObject x="${x - 110}" y="${y - 13}" width="220" height="26"><div class="sk-pill"><span style="--tone:${skArrowColor(e)}">${esc(skName(e))}</span></div></foreignObject>`;
    }
    const inset = e.type === 'condition' ? { x: e.w / 4, y: e.h / 4 } : e.type === 'text' ? { x: 12, y: 10 } : { x: 8, y: 6 };
    return `<foreignObject x="${e.x + inset.x}" y="${e.y + inset.y}" width="${Math.max(1, e.w - inset.x * 2)}" height="${Math.max(1, e.h - inset.y * 2)}">
      <div class="sk-label ${e.type}">${esc(e.text)}</div></foreignObject>`;
  }

  // the colour bar above what is selected (boxes and stickies)
  function skColorBar() {
    const $bar = $('#sketchBody .sk-colors');
    const picked = sketch.els.filter((e) => sketch.sel.has(e.id) && e.type !== 'arrow');
    if (!picked.length || sketch.drag || sketch.editing) { $bar.addClass('hidden'); return; }
    const z = sketch.zoom;
    const x0 = Math.min(...picked.map((e) => e.x));
    const x1 = Math.max(...picked.map((e) => e.x + e.w));
    const y0 = Math.min(...picked.map((e) => e.y));
    const y1 = Math.max(...picked.map((e) => e.y + e.h));
    const same = new Set(picked.map((e) => e.color || SK_DEFAULT[e.type])).size === 1 && (picked[0].color || SK_DEFAULT[picked[0].type]);
    const top = y0 * z + sketch.panY - 52;
    $bar.removeClass('hidden').css({ left: ((x0 + x1) / 2) * z + sketch.panX, top: top < 8 ? y1 * z + sketch.panY + 14 : top })
      .html(Object.entries(SK_COLORS).map(([key, [fill, line]]) =>
        `<button class="sk-swatch ${same === key ? 'on' : ''}" data-sk-color="${key}" title="${key[0].toUpperCase()}${key.slice(1)}" style="background:${fill};border-color:${line}"></button>`).join(''));
  }

  function skDraw() {
    if (!sketch.open) return;
    const { zoom: z, drag } = sketch;
    const plan = sketchPlan(skFlowName());
    const px = 1 / z; // one screen pixel, in canvas units
    const out = [];
    sketch.els.forEach((e) => {
      const cls = plan.skipped.has(e.id) ? 'sk-skipped' : '';
      out.push(`<g class="${cls}">${skElementSvg(e)}${skLabelSvg(e)}</g>`);
      if (plan.bad.has(e.id)) {
        const b = skBox(e);
        out.push(`<rect class="sk-bad" x="${b.x - 6}" y="${b.y - 6}" width="${b.w + 12}" height="${b.h + 12}" rx="14"/>`);
      }
    });
    const start = plan.startId && !plan.errors.length && skFind(plan.startId);
    if (start) out.push(`<foreignObject x="${start.x}" y="${start.y - 26}" width="90" height="22"><div class="sk-badge">${icon('play', 10)} Start</div></foreignObject>`);
    // selection
    const selected = sketch.els.filter((e) => sketch.sel.has(e.id));
    selected.forEach((e) => {
      if (e.type === 'arrow') {
        out.push(`<polyline class="sk-sel-arrow" points="${skCurve(e).map((q) => q.join(',')).join(' ')}" style="stroke-width:${10 * px}"/>`);
        if (selected.length === 1) {
          skArrowHandles(e).forEach(([x, y], i) => out.push(`<circle class="sk-handle ${i === 2 ? 'bend' : ''}" cx="${x}" cy="${y}" r="${(i === 2 ? 4 : 5) * px}" style="stroke-width:${1.5 * px}"/>`));
        }
        return;
      }
      const p = 5 * px;
      out.push(`<rect class="sk-sel" x="${e.x - p}" y="${e.y - p}" width="${e.w + 2 * p}" height="${e.h + 2 * p}" style="stroke-width:${px}"/>`);
      if (selected.length === 1) {
        skCorners(e).forEach(([x, y]) => out.push(`<rect class="sk-handle" x="${x - 4 * px}" y="${y - 4 * px}" width="${8 * px}" height="${8 * px}" style="stroke-width:${1.5 * px}"/>`));
      }
    });
    // what is being drawn right now
    if (drag && drag.kind === 'create') {
      const b = skDragBox(drag);
      out.push(drag.type === 'condition'
        ? `<path class="sk-ghost" d="M${b.x + b.w / 2} ${b.y}L${b.x + b.w} ${b.y + b.h / 2}L${b.x + b.w / 2} ${b.y + b.h}L${b.x} ${b.y + b.h / 2}Z" style="stroke-width:${1.5 * px}"/>`
        : `<rect class="sk-ghost" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="12" style="stroke-width:${1.5 * px}"/>`);
    }
    if (drag && drag.kind === 'arrow') {
      const from = drag.from && skFind(drag.from);
      const target = drag.over && skFind(drag.over);
      const end = target ? skEdge(target, from ? skCenter(from) : drag.start) : drag.cur;
      const a = from ? skEdge(from, end) : drag.start;
      out.push(`<line class="sk-ghost" x1="${a[0]}" y1="${a[1]}" x2="${end[0]}" y2="${end[1]}" style="stroke-width:${1.5 * px}"/>`);
    }
    if (drag && drag.over) {
      const t = skFind(drag.over);
      if (t) { const b = skBox(t); out.push(`<rect class="sk-target" x="${b.x - 8}" y="${b.y - 8}" width="${b.w + 16}" height="${b.h + 16}" rx="10" style="stroke-width:${2 * px}"/>`); }
    }
    if (drag && drag.kind === 'marquee') {
      const b = skDragBox(drag);
      out.push(`<rect class="sk-marquee" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" style="stroke-width:${px}"/>`);
    }
    $('#sketchBody .sk-world').attr('transform', `translate(${sketch.panX} ${sketch.panY}) scale(${z})`).html(out.join(''));
    $('#sketchBody .sk-svg').css('--grid', `${20 * z}px`).css('background-position', `${sketch.panX}px ${sketch.panY}px`);
    $('#sketchBody [data-sk-tool]').each(function () { $(this).toggleClass('active', $(this).data('sk-tool') === sketch.tool); });
    $('#sketchBody [data-sk-zoom="0"]').text(`${Math.round(z * 100)}%`);
    $('#sketchBody [data-sk-undo]').prop('disabled', !sketch.past.length);
    $('#sketchBody [data-sk-redo]').prop('disabled', !sketch.future.length);
    $('#sketchBody .sk-empty').toggleClass('hidden', sketch.els.length > 0);
    $('#sketchBody .sk-stage').attr('data-tool', sketch.space ? 'hand' : sketch.tool);
    skColorBar();
  }

  const skArrowHandles = (a) => { const [p1, p2] = skEnds(a); return [p1, p2, skArrowMid(a)]; }; // ends, then the bend
  const skCorners = (e) => [[e.x, e.y], [e.x + e.w, e.y], [e.x, e.y + e.h], [e.x + e.w, e.y + e.h]];
  const skDragBox = ({ start: [x1, y1], cur: [x2, y2] }) => ({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) });

  // ---- the side panel: what will be created

  const skFlow = () => sketch.target && sketch.target.flowId && findFlow(sketch.target.flowId);
  const skFlowName = () => { const f = skFlow(); return f ? f.name : (sketch.name || 'New flow'); };

  function skOutline(steps) {
    const nameOf = (key) => skName(skFind(key) || {});
    return `<ol class="sk-plan">${steps.map((s) => `
      <li>
        <button class="sk-step" data-sk-focus="${s.key}">
          ${s.type === 'condition' ? '<span class="cond-diamond sm"></span>' : `<span class="sk-ico ${s.type}"></span>`}
          <span class="truncate">${esc(s.name || 'unnamed')}</span>${s.type === 'popup' ? '<span class="sk-tag">Popup</span>' : ''}
        </button>
        ${s.type === 'condition' ? `<ul class="sk-branches">${(s.branches && s.branches.length ? s.branches : [{ label: 'Success' }, { label: 'Pending' }, { label: 'Else' }].map((b) => ({ ...b, auto: true }))).map((b) => `
          <li style="--tone:${TONE_COLOR[tone(b.label)]}">
            <p class="sk-branch"><span class="dot"></span>If <b>${esc(b.label || '—')}</b>
              ${b.target ? `→ back to “${esc(nameOf(b.target))}”` : b.path ? `→ path <i>${esc(b.pathName)}</i>` : b.auto ? '<span class="text-slate-400">(no arrow drawn)</span>' : '→ no screen'}</p>
            ${b.path ? skOutline(b.path.steps) : ''}
          </li>`).join('')}</ul>` : ''}
        ${(s.extends || []).map((x) => `
          <div class="sk-branches"><p class="sk-branch">${icon('extend', 12)} New flow <i>${esc(x.name)}</i></p>${skOutline(x.steps)}</div>`).join('')}
      </li>`).join('')}</ol>`;
  }

  function skPanel() {
    if (!sketch.open) return;
    const f = skFlow();
    const plan = sketchPlan(skFlowName());
    const all = [...plan.placed ? plan.placed.values() : []];
    const screens = all.filter((s) => s.type !== 'condition').length;
    const conds = all.length - screens;
    const paths = all.reduce((n, s) => n + (s.branches || []).filter((b) => b.path).length + (s.extends || []).length, 0);
    const list = (items, cls) => (items.length ? `<ul class="sk-notes ${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');
    const focused = document.activeElement && document.activeElement.matches('[data-sk-name]');
    $('#sketchBody .sk-side').html(`
      ${f ? `<p class="text-sm text-slate-600">The steps are added after the last step of <b class="text-slate-900">${esc(f.name)}</b>.</p>`
    : `<label class="block"><span class="field-label">Flow name</span>
          <input class="input w-full" data-sk-name value="${esc(sketch.name || '')}" placeholder="e.g. Sign Up, Add Money" maxlength="200" autocomplete="off"></label>`}
      <div>
        <p class="sk-h">Will be created</p>
        ${plan.empty ? '<p class="text-sm text-slate-500">Nothing yet. Draw a box to start.</p>'
    : `<p class="mb-2 text-xs text-slate-500">${screens} screen${screens === 1 ? '' : 's'} · ${conds} condition${conds === 1 ? '' : 's'} · ${paths} path${paths === 1 ? '' : 's'}</p>${skOutline(plan.steps)}`}
      </div>
      ${list(plan.errors, 'error')}
      ${list(plan.warnings, 'warn')}
      <button class="btn-primary w-full justify-center" data-sk-create ${plan.empty || plan.errors.length ? 'disabled' : ''}>${f ? 'Add to flow' : 'Create flow'}</button>
      <div class="sk-legend">
        <p class="sk-h">How it reads</p>
        <p><span class="sk-ico screen"></span> Box = screen</p>
        <p><span class="sk-ico popup"></span> Dashed box = popup</p>
        <p><span class="cond-diamond sm"></span> Diamond = condition</p>
        <p>${icon('arrow', 14)} Arrow = the next step. Out of a condition, its text is the branch (Success, Failed …).</p>
        <p>${icon('sticky', 14)} Sticky note = just a note, not created.</p>
        <p class="text-slate-400">Double-click a box or an arrow to write on it; pick a colour above what is selected. Your drawing is kept in this browser until it is created.</p>
      </div>`);
    if (focused) $('#sketchBody [data-sk-name]').trigger('focus');
  }

  // ---- history, saving, view

  function skRemember() {
    sketch.past.push(JSON.stringify(sketch.els));
    if (sketch.past.length > 100) sketch.past.shift();
    sketch.future = [];
  }
  function skSave() {
    storage('set', sketch.key, sketch.els.length || sketch.name ? JSON.stringify({ els: sketch.els, name: sketch.name }) : '');
  }
  function skChanged() { skSave(); skDraw(); skPanel(); }
  function skStep(from, to) {
    if (!from.length) return;
    to.push(JSON.stringify(sketch.els));
    sketch.els = JSON.parse(from.pop());
    sketch.sel = new Set([...sketch.sel].filter(skFind));
    skChanged();
  }

  function skWorld(e) {
    const r = skSvg().getBoundingClientRect();
    return [(e.clientX - r.left - sketch.panX) / sketch.zoom, (e.clientY - r.top - sketch.panY) / sketch.zoom];
  }
  function skZoomTo(z, at) {
    const r = skSvg().getBoundingClientRect();
    const [sx, sy] = at || [r.width / 2, r.height / 2];
    const zoom = Math.min(3, Math.max(0.2, z));
    sketch.panX = sx - ((sx - sketch.panX) * zoom) / sketch.zoom;
    sketch.panY = sy - ((sy - sketch.panY) * zoom) / sketch.zoom;
    sketch.zoom = zoom;
    skDraw();
  }
  function skFit() {
    const r = skSvg().getBoundingClientRect();
    if (!sketch.els.length) { Object.assign(sketch, { zoom: 1, panX: 80, panY: 80 }); return; }
    const boxes = sketch.els.map(skBox);
    const x0 = Math.min(...boxes.map((b) => b.x));
    const y0 = Math.min(...boxes.map((b) => b.y));
    const x1 = Math.max(...boxes.map((b) => b.x + b.w));
    const y1 = Math.max(...boxes.map((b) => b.y + b.h));
    const zoom = Math.min(1.2, Math.max(0.2, Math.min(r.width / (x1 - x0 + 160), r.height / (y1 - y0 + 160))));
    Object.assign(sketch, { zoom, panX: r.width / 2 - ((x0 + x1) / 2) * zoom, panY: r.height / 2 - ((y0 + y1) / 2) * zoom });
  }

  // ---- open / close

  function openSketch(target) {
    const key = target.flowId ? `sketch.flow.${target.flowId}` : `sketch.module.${target.moduleId}`;
    let saved = null;
    try { saved = JSON.parse(storage('get', key) || 'null'); } catch (e) { saved = null; }
    const m = allModules.find((x) => x.id === (target.moduleId || (findFlow(target.flowId) || {}).moduleId));
    Object.assign(sketch, {
      open: true, target, key, els: saved && Array.isArray(saved.els) ? saved.els : [], name: (saved && saved.name) || '',
      sel: new Set(), tool: 'select', past: [], future: [], editing: null, drag: null, space: false,
    });
    const f = skFlow();
    $('#sketchBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('pen', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${f ? `Draw into ${esc(f.name)}` : `Draw a new flow${m ? ` · ${esc(m.name)}` : ''}`}</h3>
          <p class="truncate text-xs text-slate-500">Draw boxes and join them with arrows, like on a whiteboard. When the list on the right reads right, create it: the screens, conditions and paths are made for you.</p>
        </div>
        <button class="icon-btn" data-close-sketch title="Close (your drawing is kept)">${icon('close', 18)}</button>
      </div>
      <div class="sk-body">
        <div class="sk-stage">
          <svg class="sk-svg" aria-label="Drawing canvas"><g class="sk-world"></g></svg>
          <div class="sk-island sk-toolbar">
            ${SK_TOOLS.map((t) => `<button class="sk-tool" data-sk-tool="${t.id}" title="${t.title} — ${t.key.toUpperCase()}${t.no ? ` or ${t.no}` : ''}">${icon(t.icon, 18)}${t.no ? `<span class="sk-key">${t.no}</span>` : ''}</button>`).join('')}
          </div>
          <div class="sk-island sk-corner">
            <button class="sk-tool" data-sk-undo title="Undo — Ctrl+Z">${icon('undo', 16)}</button>
            <button class="sk-tool" data-sk-redo title="Redo — Ctrl+Shift+Z">${icon('redo', 16)}</button>
            <span class="sk-sep"></span>
            <button class="sk-tool" data-sk-zoom="-1" title="Zoom out">${icon('minus', 16)}</button>
            <button class="sk-zoom" data-sk-zoom="0" title="Reset zoom">100%</button>
            <button class="sk-tool" data-sk-zoom="1" title="Zoom in">${icon('plus', 16)}</button>
            <button class="sk-tool" data-sk-fit title="Fit the drawing">${icon('fit', 16)}</button>
            <span class="sk-sep"></span>
            <button class="sk-tool danger" data-sk-clear title="Clear the canvas">${icon('trash', 16)}</button>
          </div>
          <div class="sk-island sk-colors hidden"></div>
          <div class="sk-empty">
            <p class="sk-empty-title">Draw your flow</p>
            <p>Pick <b>Screen</b> (R) and drag on the canvas, then <b>Arrow</b> (A) from one box to the next.<br>
              A <b>Condition</b> (D) splits the flow: write the branch name on each arrow out of it.</p>
          </div>
        </div>
        <aside class="sk-side"></aside>
      </div>`);
    $('#sketchModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
    const svg = skSvg();
    svg.addEventListener('wheel', skWheel, { passive: false });
    svg.addEventListener('pointerdown', skDown);
    svg.addEventListener('pointermove', skMove);
    svg.addEventListener('pointerup', skUp);
    svg.addEventListener('pointercancel', skUp);
    svg.addEventListener('dblclick', skDouble);
    skFit();
    skDraw();
    skPanel();
  }
  function closeSketch() {
    if (sketch.editing) $('#sketchBody .sk-input').trigger('blur');
    skSave();
    Object.assign(sketch, { open: false, drag: null, editing: null });
    $('#sketchModal').addClass('hidden');
    $('#sketchBody').empty();
    unlockScroll();
  }
  function skEscape() {
    if (sketch.drag) return;
    if (sketch.sel.size) { sketch.sel.clear(); skDraw(); return; }
    if (sketch.tool !== 'select') { sketch.tool = 'select'; skDraw(); return; }
    closeSketch();
  }

  // ---- pointer

  function skDown(e) {
    if (sketch.drag || (e.button !== 0 && e.button !== 1)) return;
    if (sketch.editing) $('#sketchBody .sk-input').trigger('blur');
    const p = skWorld(e);
    const { tool } = sketch;
    let drag = null;
    if (e.button === 1 || tool === 'hand' || sketch.space) {
      drag = { kind: 'pan', x: e.clientX, y: e.clientY, panX: sketch.panX, panY: sketch.panY };
    } else if (tool === 'select') {
      const one = sketch.sel.size === 1 && skFind([...sketch.sel][0]);
      const near = (q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= 8 / sketch.zoom;
      const corner = one && SK_SHAPES.includes(one.type) ? skCorners(one).findIndex(near) : -1;
      const end = one && one.type === 'arrow' ? skArrowHandles(one).findIndex(near) : -1;
      if (corner >= 0) {
        skRemember();
        drag = { kind: 'resize', id: one.id, corner, orig: { x: one.x, y: one.y, w: one.w, h: one.h } };
      } else if (end === 2) {
        skRemember();
        drag = { kind: 'bend', id: one.id };
      } else if (end >= 0) {
        skRemember();
        drag = { kind: 'end', id: one.id, end, cur: p };
      } else {
        const hit = skHit(p);
        if (hit) {
          if (e.shiftKey) { if (sketch.sel.has(hit.id)) sketch.sel.delete(hit.id); else sketch.sel.add(hit.id); }
          else if (!sketch.sel.has(hit.id)) sketch.sel = new Set([hit.id]);
          drag = { kind: 'move', start: p, moved: false };
        } else {
          if (!e.shiftKey) sketch.sel.clear();
          drag = { kind: 'marquee', start: p, cur: p };
        }
      }
    } else if (SK_SHAPES.includes(tool)) {
      drag = { kind: 'create', type: tool, start: p, cur: p };
    } else if (tool === 'arrow') {
      const from = skShapeAt(p);
      drag = { kind: 'arrow', from: from && from.id, start: p, cur: p };
    } else if (tool === 'text') {
      skAddNote(p);
      return;
    }
    sketch.drag = drag;
    if (drag) { e.preventDefault(); skSvg().setPointerCapture(e.pointerId); }
    skDraw();
  }

  function skMove(e) {
    const { drag } = sketch;
    if (!drag) {
      if (sketch.tool === 'select' && !sketch.space) $('#sketchBody .sk-stage').toggleClass('over-element', Boolean(skHit(skWorld(e))));
      return;
    }
    const p = skWorld(e);
    if (drag.kind === 'pan') {
      sketch.panX = drag.panX + e.clientX - drag.x;
      sketch.panY = drag.panY + e.clientY - drag.y;
    } else if (drag.kind === 'move') {
      const dx = p[0] - drag.start[0];
      const dy = p[1] - drag.start[1];
      if (!drag.moved) {
        if (Math.hypot(dx, dy) * sketch.zoom < 3) return;
        skRemember();
        drag.moved = true;
        // an arrow moved without the box it is joined to lets go of it
        sketch.els.filter((a) => a.type === 'arrow' && sketch.sel.has(a.id)).forEach((a) => {
          const [p1, p2] = skEnds(a);
          if (a.from && !sketch.sel.has(a.from)) { a.from = null; [a.x1, a.y1] = p1; }
          if (a.to && !sketch.sel.has(a.to)) { a.to = null; [a.x2, a.y2] = p2; }
        });
        drag.orig = new Map(sketch.els.filter((x) => sketch.sel.has(x.id)).map((x) => [x.id, { ...x }]));
      }
      drag.orig.forEach((o, id) => {
        const x = skFind(id);
        if (!x) return;
        if (x.type === 'arrow') Object.assign(x, { x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy });
        else Object.assign(x, { x: o.x + dx, y: o.y + dy });
      });
    } else if (drag.kind === 'resize') {
      const x = skFind(drag.id);
      const o = drag.orig;
      const fixed = skCorners(o)[3 - drag.corner]; // the opposite corner stays put
      const w = Math.max(40, Math.abs(p[0] - fixed[0]));
      const h = Math.max(30, Math.abs(p[1] - fixed[1]));
      Object.assign(x, { w, h, x: p[0] < fixed[0] ? fixed[0] - w : fixed[0], y: p[1] < fixed[1] ? fixed[1] - h : fixed[1] });
    } else if (drag.kind === 'bend') {
      // the curve's middle follows the pointer: it sits half way to the control point
      const a = skFind(drag.id);
      const { mid, n } = skControl(a, 0);
      const bend = 2 * ((p[0] - mid[0]) * n[0] + (p[1] - mid[1]) * n[1]);
      a.bend = Math.abs(bend) < 8 ? 0 : bend;
    } else if (drag.kind === 'end') {
      const a = skFind(drag.id);
      const other = drag.end === 0 ? a.to : a.from;
      const over = skShapeAt(p, other);
      drag.over = over && over.id;
      if (drag.end === 0) Object.assign(a, { from: null, x1: p[0], y1: p[1] });
      else Object.assign(a, { to: null, x2: p[0], y2: p[1] });
    } else {
      drag.cur = p;
      if (drag.kind === 'arrow') { const over = skShapeAt(p, drag.from); drag.over = over && over.id; }
    }
    skDraw();
  }

  function skUp(e) {
    const { drag } = sketch;
    if (!drag) return;
    sketch.drag = null;
    if (skSvg().hasPointerCapture(e.pointerId)) skSvg().releasePointerCapture(e.pointerId);
    if (drag.kind === 'pan') { skDraw(); return; }
    if (drag.kind === 'create') {
      let b = skDragBox(drag);
      const cond = drag.type === 'condition';
      if (b.w * sketch.zoom < 12 && b.h * sketch.zoom < 12) { // a click: the usual size, centred on it
        const w = cond ? SK.condW : SK.w;
        const h = cond ? SK.condH : SK.h;
        b = { x: drag.start[0] - w / 2, y: drag.start[1] - h / 2, w, h };
      }
      skRemember();
      const el = { id: skId(), type: drag.type, x: b.x, y: b.y, w: Math.max(40, b.w), h: Math.max(30, b.h), text: '' };
      sketch.els.push(el);
      sketch.sel = new Set([el.id]);
      sketch.tool = 'select';
      skChanged();
      skEdit(el.id, true);
      return;
    }
    if (drag.kind === 'arrow') {
      const far = Math.hypot(drag.cur[0] - drag.start[0], drag.cur[1] - drag.start[1]) * sketch.zoom > 12;
      if (!drag.over && !far) { skDraw(); return; }
      skRemember();
      const a = {
        id: skId(), type: 'arrow', from: drag.from || null, to: drag.over || null, text: '',
        x1: drag.start[0], y1: drag.start[1], x2: drag.cur[0], y2: drag.cur[1],
      };
      skAutoBend(a);
      sketch.els.push(a);
      sketch.sel = new Set([a.id]);
      sketch.tool = 'select';
      skChanged();
      const from = a.from && skFind(a.from);
      if (from && from.type === 'condition' && a.to) skEdit(a.id, true); // a branch: write its name
      return;
    }
    if (drag.kind === 'end') {
      const a = skFind(drag.id);
      if (drag.over) a[drag.end === 0 ? 'from' : 'to'] = drag.over;
    }
    if (drag.kind === 'marquee') {
      const m = skDragBox(drag);
      sketch.els.forEach((x) => {
        const b = skBox(x);
        if (b.x >= m.x && b.y >= m.y && b.x + b.w <= m.x + m.w && b.y + b.h <= m.y + m.h) sketch.sel.add(x.id);
      });
    }
    if (drag.kind === 'move' && !drag.moved) { skDraw(); return; }
    skChanged();
  }

  function skWheel(e) {
    e.preventDefault();
    if (sketch.editing) $('#sketchBody .sk-input').trigger('blur');
    if (e.ctrlKey || e.metaKey) {
      const r = skSvg().getBoundingClientRect();
      skZoomTo(sketch.zoom * Math.exp(-e.deltaY * 0.01), [e.clientX - r.left, e.clientY - r.top]);
      return;
    }
    sketch.panX -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
    sketch.panY -= e.shiftKey && !e.deltaX ? 0 : e.deltaY;
    skDraw();
  }

  function skDouble(e) {
    const p = skWorld(e);
    const hit = skHit(p);
    if (hit) skEdit(hit.id);
    else skAddNote(p);
  }

  // ---- writing on an element

  function skAddNote(p) {
    skRemember();
    const el = { id: skId(), type: 'text', x: p[0] - SK.stickyW / 2, y: p[1] - SK.stickyH / 2, w: SK.stickyW, h: SK.stickyH, text: '' };
    sketch.els.push(el);
    sketch.sel = new Set([el.id]);
    sketch.tool = 'select';
    skDraw();
    skEdit(el.id, true);
  }

  function skEdit(id, fresh) {
    const el = skFind(id);
    if (!el) return;
    sketch.editing = id;
    sketch.sel = new Set([id]);
    skDraw();
    const z = sketch.zoom;
    const note = el.type === 'text';
    let center;
    let width;
    if (el.type === 'arrow') {
      center = skArrowMid(el);
      width = 170;
    } else if (!note) {
      center = skCenter(el);
      width = el.type === 'condition' ? el.w * 0.62 : el.w - 12;
    }
    const $t = $('<textarea class="sk-input" spellcheck="false" rows="1"></textarea>')
      .addClass(note ? 'note' : 'center').val(el.text || '')
      .css({ fontSize: `${(note ? 15 : 14) * z}px` })
      .appendTo('#sketchBody .sk-stage');
    const t = $t[0];
    const fit = () => {
      if (note) { // the sticky's own box, writing from its top left
        $t.css({ left: (el.x + 12) * z + sketch.panX, top: (el.y + 10) * z + sketch.panY, width: (el.w - 24) * z, height: (el.h - 20) * z });
        return;
      }
      $t.css({ width: width * z, height: 'auto' });
      const h = t.scrollHeight;
      $t.css({ left: center[0] * z + sketch.panX - (width * z) / 2, top: center[1] * z + sketch.panY - h / 2, height: h });
    };
    fit();
    $t.on('input', fit)
      .on('keydown', (ev) => {
        ev.stopPropagation();
        const done = ev.key === 'Escape' || (ev.key === 'Enter' && (note ? ev.metaKey || ev.ctrlKey : !ev.shiftKey));
        if (done) { ev.preventDefault(); t.blur(); }
      })
      .on('blur', () => skEndEdit(id, t.value, fresh));
    setTimeout(() => { t.focus(); t.select(); });
  }

  function skEndEdit(id, value, fresh) {
    if (sketch.editing !== id) return;
    sketch.editing = null;
    $('#sketchBody .sk-input').remove();
    const el = skFind(id);
    if (!el) return;
    const text = el.type === 'text' ? value.replace(/\s+$/, '') : value.trim();
    if (text !== (el.text || '')) {
      if (!fresh) skRemember();
      el.text = text;
    }
    skChanged();
  }

  // ---- keys and buttons

  function skDelete() {
    if (!sketch.sel.size) return;
    skRemember();
    const gone = sketch.sel;
    sketch.els = sketch.els.filter((x) => !gone.has(x.id) && !(x.type === 'arrow' && (gone.has(x.from) || gone.has(x.to))));
    sketch.sel = new Set();
    skChanged();
  }
  function skDuplicate() {
    const picked = sketch.els.filter((x) => sketch.sel.has(x.id));
    if (!picked.length) return;
    skRemember();
    const ids = new Map(picked.map((x) => [x.id, skId()]));
    const copies = picked.map((x) => {
      const c = { ...x, id: ids.get(x.id) };
      if (c.type !== 'arrow') return Object.assign(c, { x: x.x + 24, y: x.y + 24 });
      // a copied arrow keeps a join only to a copied box
      const [p1, p2] = skEnds(x);
      Object.assign(c, { from: ids.get(x.from) || null, to: ids.get(x.to) || null, x1: p1[0] + 24, y1: p1[1] + 24, x2: p2[0] + 24, y2: p2[1] + 24 });
      return c;
    });
    sketch.els.push(...copies);
    sketch.sel = new Set(copies.map((x) => x.id));
    skChanged();
  }
  function skNudge(dx, dy) {
    const picked = sketch.els.filter((x) => sketch.sel.has(x.id));
    if (!picked.length) return;
    skRemember();
    picked.forEach((x) => {
      if (x.type !== 'arrow') { x.x += dx; x.y += dy; return; }
      if (!x.from) { x.x1 += dx; x.y1 += dy; }
      if (!x.to) { x.x2 += dx; x.y2 += dy; }
    });
    skChanged();
  }

  $doc.on('keydown', (e) => {
    if (!sketch.open || dialog.isOpen() || $(e.target).is('input, textarea, select, [contenteditable]')) return;
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); if (!sketch.space) { sketch.space = true; skDraw(); } return; }
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) skStep(sketch.future, sketch.past); else skStep(sketch.past, sketch.future); return; }
    if (mod && k === 'y') { e.preventDefault(); skStep(sketch.future, sketch.past); return; }
    if (mod && k === 'a') { e.preventDefault(); sketch.sel = new Set(sketch.els.map((x) => x.id)); skDraw(); return; }
    if (mod && k === 'd') { e.preventDefault(); skDuplicate(); return; }
    if (mod && (k === '=' || k === '+' || k === '-')) { e.preventDefault(); skZoomTo(sketch.zoom * (k === '-' ? 0.9 : 1.1)); return; }
    if (mod) return;
    if (k === 'delete' || k === 'backspace') { e.preventDefault(); skDelete(); return; }
    if (k === 'enter' && sketch.sel.size === 1) { e.preventDefault(); skEdit([...sketch.sel][0]); return; }
    const nudge = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[k];
    if (nudge) { e.preventDefault(); skNudge(nudge[0] * (e.shiftKey ? 10 : 1), nudge[1] * (e.shiftKey ? 10 : 1)); return; }
    const tool = SK_TOOLS.find((t) => t.key === k || (t.no && t.no === k));
    if (tool) { sketch.tool = tool.id; if (tool.id !== 'select') sketch.sel.clear(); skDraw(); }
  });
  $doc.on('keyup', (e) => {
    if (e.key === ' ' && sketch.space) { sketch.space = false; skDraw(); }
  });

  $doc.on('click', '[data-sketch-module]', function () { openSketch({ moduleId: $(this).data('sketch-module') }); });
  $doc.on('click', '[data-sketch-flow]', function () { openSketch({ flowId: $(this).data('sketch-flow') }); });
  $doc.on('click', '[data-close-sketch]', closeSketch);
  $('#sketchModal').on('mousedown', function (e) { if (e.target === this) closeSketch(); });
  $doc.on('click', '[data-sk-tool]', function () {
    sketch.tool = $(this).data('sk-tool');
    if (sketch.tool !== 'select') sketch.sel.clear();
    skDraw();
  });
  $doc.on('click', '[data-sk-color]', function () {
    const color = $(this).data('sk-color');
    skRemember();
    sketch.els.forEach((e) => { if (sketch.sel.has(e.id) && e.type !== 'arrow') e.color = color; });
    skChanged();
  });
  $doc.on('click', '[data-sk-undo]', () => skStep(sketch.past, sketch.future));
  $doc.on('click', '[data-sk-redo]', () => skStep(sketch.future, sketch.past));
  $doc.on('click', '[data-sk-zoom]', function () {
    const step = Number($(this).data('sk-zoom'));
    skZoomTo(step ? sketch.zoom * (step > 0 ? 1.1 : 1 / 1.1) : 1);
  });
  $doc.on('click', '[data-sk-fit]', () => { skFit(); skDraw(); });
  $doc.on('click', '[data-sk-clear]', () => {
    if (!sketch.els.length) return;
    dialog.confirm({
      title: 'Clear the canvas?',
      message: 'Everything drawn here is removed. Undo (Ctrl+Z) brings it back.',
      confirmText: 'Clear',
      danger: true,
      onConfirm: () => {
        skRemember();
        sketch.els = [];
        sketch.sel = new Set();
        skChanged();
        return $.Deferred().resolve().promise();
      },
    });
  });
  $doc.on('input', '[data-sk-name]', function () { sketch.name = this.value; skSave(); });
  $doc.on('change', '[data-sk-name]', () => skPanel()); // path names follow the flow name
  // a step in the list: select its box and bring it into view
  $doc.on('click', '[data-sk-focus]', function () {
    const el = skFind($(this).data('sk-focus'));
    if (!el) return;
    const r = skSvg().getBoundingClientRect();
    const [cx, cy] = skCenter(el);
    sketch.sel = new Set([el.id]);
    sketch.panX = r.width / 2 - cx * sketch.zoom;
    sketch.panY = r.height / 2 - cy * sketch.zoom;
    skDraw();
  });
  $doc.on('click', '[data-sk-create]', function () {
    const f = skFlow();
    const plan = sketchPlan(skFlowName());
    if (plan.empty || plan.errors.length) return;
    const name = (sketch.name || '').trim();
    if (!f && !name) {
      $('#sketchBody [data-sk-name]').addClass('invalid').trigger('focus');
      toast('Name the flow first');
      return;
    }
    const steps = plan.steps;
    const count = sketch.els.filter((x) => plan.placed.has(x.id)).length;
    const req = f
      ? api('POST', `/api/flows/${f.id}/sketch`, { steps }, this)
      : api('POST', `/api/modules/${sketch.target.moduleId}/sketch`, { name, steps }, this);
    req.done((flow) => {
      sketch.els = [];
      sketch.name = '';
      skSave();
      closeSketch();
      toast(`${count} step${count === 1 ? '' : 's'} created`);
      activeId = flow.moduleId;
      load().done(() => gotoFlow(flow.id));
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

  // ---------------------------------------------------------------- send on Teams: rows of a sheet or issues, with the columns picked
  //
  // openTeamsSend({ title, count, columns: [{ id, label, on }], people: [{ id, name, teams }], webhook, send })
  //   webhook: the app has a Teams channel (Workflows webhook, Sanity → Teams channel)
  //   send({ columns, userIds, note, mode, button }) → jqXHR. mode 'channel': the server posts to the app's channel
  //   and answers { teams, rows }; mode 'card': it answers { card, direct, people, rows } and this browser sends it
  //   from your own Teams (public/graph.js).
  // Where it goes: 'direct' = a chat with each person picked, 'mine' = a channel of a team you are in,
  // 'app' = the app's channel. The last choice (and team / channel) is remembered in this browser.

  let teamsSend = null;
  const TEAMS_TARGETS = [['direct', 'Direct message'], ['mine', 'My Teams channel'], ['app', 'App channel']];
  const teamsTargets = (webhook) => TEAMS_TARGETS.filter(([k]) => (k === 'app' ? webhook : window.flowGraph.configured()));
  const canSendTeams = (webhook) => teamsTargets(webhook).length > 0;

  // people: [{ id, name, teams, on }] (on: ticked to start with). target: where to start (else the last one used).
  // preview: html shown above the fields. after({ target, results }): called once it went out (results: direct messages).
  function openTeamsSend({ title, count, columns, people, webhook, send, target, preview, after }) {
    const targets = teamsTargets(webhook);
    if (!targets.length) { dialog.alert('This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.', 'Teams'); return; }
    const last = storage('get', 'teamsTarget');
    const start = [target, last].find((k) => targets.some(([t]) => t === k));
    teamsSend = {
      send, count, after,
      target: start || targets[0][0],
      team: storage('get', 'teamsTeam') || '', channel: storage('get', 'teamsChannel') || '', teams: null,
    };
    const pick = (name, value, label, on) => `<label class="teams-pick"><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="${name}" value="${esc(value)}" ${on ? 'checked' : ''}> ${label}</label>`;
    $('#teamsForm').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('share', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${esc(title)}</h3>
          <p class="text-xs text-slate-500">${count} row${count === 1 ? '' : 's'}${count > 40 ? ' (the first 40 are listed, with a link to the rest)' : ''}</p>
        </div>
        <button type="button" class="icon-btn" data-close-teams title="Close">${icon('close', 18)}</button>
      </div>
      <div class="space-y-4 px-5 py-4">
        ${preview || ''}
        <div>
          <span class="field-label">Send to</span>
          ${targets.length > 1 ? `<div class="seg">${targets.map(([k, label]) => `<button type="button" data-teams-target="${k}">${label}</button>`).join('')}</div>` : ''}
          <p class="mt-1.5 text-xs text-slate-500" data-teams-hint></p>
          <div class="mt-2 hidden" data-teams-mine>
            <div class="grid grid-cols-2 gap-2">
              <select class="input w-full text-sm" data-teams-team><option value="">Team…</option></select>
              <select class="input w-full text-sm" data-teams-channel><option value="">Channel…</option></select>
            </div>
            <button type="button" class="mt-1.5 text-xs text-indigo-600 hover:underline" data-teams-load>Load my teams</button>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2"><span class="field-label flex-1">Columns to send</span>
            <button type="button" class="text-xs text-indigo-600 hover:underline" data-teams-all="col">All</button>
            <button type="button" class="text-xs text-indigo-600 hover:underline" data-teams-none="col">None</button></div>
          <div class="teams-picks">${columns.map((c) => pick('col', c.id, esc(c.label), c.on !== false)).join('')}</div>
        </div>
        <div>
          <span class="field-label" data-teams-people-label>@mention</span>
          <div class="teams-picks max-h-40 overflow-y-auto">${people.map((u) => pick('user', u.id, `${esc(u.name)}${u.teams ? '' : ' <span class="text-xs text-slate-400">· no Teams email</span>'}`, Boolean(u.on))).join('')
            || '<span class="text-sm text-slate-400">Nobody else can open this app.</span>'}</div>
        </div>
        <label class="block"><span class="field-label">Message <span class="font-normal text-slate-400">(optional)</span></span>
          <textarea class="input w-full" name="note" rows="2" maxlength="1000" placeholder="e.g. Please check these before the 6 pm build"></textarea></label>
        <p class="dialog-error hidden"></p>
      </div>
      <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button type="button" class="btn-secondary" data-close-teams>Cancel</button>
        <button class="btn-primary" data-teams-submit>${icon('share', 14)} Send</button>
      </div>`);
    teamsSend.people = people;
    showTeamsTarget();
    $('#teamsModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function showTeamsTarget() {
    const t = teamsSend.target;
    const connected = Boolean(window.flowGraph.account());
    $('[data-teams-target]').each((i, el) => $(el).toggleClass('on', $(el).data('teams-target') === t));
    $('[data-teams-hint]').text({
      direct: `Each person you tick gets it in a chat with you, sent from your Teams${connected ? '' : ' (you sign in to Microsoft once)'}.`,
      mine: `Posted as you in a channel of a team you are in, @mentioning the people you tick${connected ? '' : ' (you sign in to Microsoft once)'}.`,
      app: 'Posted in this app\'s Teams channel, @mentioning the people you tick.',
    }[t]);
    $('[data-teams-people-label]').html(t === 'direct' ? 'Send to' : '@mention <span class="font-normal text-slate-400">(optional)</span>');
    $('[data-teams-submit]').html(`${icon('share', 14)} ${t === 'direct' ? 'Send messages' : 'Post on Teams'}`);
    $('[data-teams-mine]').toggleClass('hidden', t !== 'mine');
    $('[data-teams-load]').toggleClass('hidden', Boolean(teamsSend.teams));
    // with Teams connected the list loads by itself; else after a click (it may need the sign-in popup)
    if (t === 'mine' && !teamsSend.teams && connected) loadMyTeams(true);
  }

  function loadMyTeams(quiet) {
    const $err = $('#teamsForm .dialog-error');
    return window.flowGraph.teamsList().then((list) => {
      if (!teamsSend) return;
      teamsSend.teams = list;
      if (!list.some((x) => x.id === teamsSend.team)) teamsSend.team = list[0] ? list[0].id : '';
      $('[data-teams-team]').html(`<option value="">Team…</option>${list.map((x) => `<option value="${esc(x.id)}" ${x.id === teamsSend.team ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}`);
      $('[data-teams-load]').addClass('hidden');
      if (!list.length) $err.text('You are not in any team on Teams.').removeClass('hidden');
      renderAccount();
      return loadMyChannels();
    }).catch((err) => { if (!quiet) $err.text(err.message).removeClass('hidden'); });
  }
  function loadMyChannels() {
    const { team } = teamsSend;
    $('[data-teams-channel]').html('<option value="">Channel…</option>');
    if (!team) return Promise.resolve();
    return window.flowGraph.channelsOf(team).then((list) => {
      if (!teamsSend || teamsSend.team !== team) return;
      if (!list.some((x) => x.id === teamsSend.channel)) teamsSend.channel = (list.find((x) => /general/i.test(x.name)) || list[0] || {}).id || '';
      $('[data-teams-channel]').html(`<option value="">Channel…</option>${list.map((x) => `<option value="${esc(x.id)}" ${x.id === teamsSend.channel ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}`);
    }).catch((err) => $('#teamsForm .dialog-error').text(err.message).removeClass('hidden'));
  }

  function closeTeamsSend() {
    teamsSend = null;
    $('#teamsModal').addClass('hidden');
    unlockScroll();
  }
  $doc.on('click', '[data-close-teams]', closeTeamsSend);
  $('#teamsModal').on('mousedown', function (e) { if (e.target === this) closeTeamsSend(); });
  $doc.on('click', '[data-teams-all], [data-teams-none]', function () {
    const all = $(this).is('[data-teams-all]');
    $(`#teamsForm [name="${$(this).data(all ? 'teams-all' : 'teams-none')}"]`).prop('checked', all);
  });
  $doc.on('click', '[data-teams-target]', function () {
    teamsSend.target = $(this).data('teams-target');
    $('#teamsForm .dialog-error').addClass('hidden');
    showTeamsTarget();
  });
  $doc.on('click', '[data-teams-load]', () => loadMyTeams(false));
  $doc.on('change', '[data-teams-team]', function () { teamsSend.team = this.value; teamsSend.channel = ''; loadMyChannels(); });
  $doc.on('change', '[data-teams-channel]', function () { teamsSend.channel = this.value; });

  // "Sent to A, B" (+ who could not be reached, and why)
  function teamsDirectResult(results) {
    const sent = results.filter((x) => x.ok).map((x) => x.name);
    const failed = results.filter((x) => !x.ok);
    if (!failed.length) { toast(`Sent on Teams to ${sent.join(', ')}`); return; }
    dialog.alert(`${sent.length ? `Sent to ${sent.join(', ')}. ` : ''}Not sent to ${failed.map((x) => `${x.name} (${x.error})`).join(', ')}.`, sent.length ? 'Partly sent' : 'Not sent');
  }

  $('#teamsForm').on('submit', function (e) {
    e.preventDefault();
    const $f = $(this);
    const $err = $f.find('.dialog-error').addClass('hidden');
    const fail = (msg) => $err.text(msg).removeClass('hidden');
    const picked = (name) => $f.find(`[name="${name}"]:checked`).map((i, el) => el.value).get();
    const columns = picked('col');
    const userIds = picked('user');
    const { target, team, channel } = teamsSend;
    if (!columns.length) { fail('Pick at least one column.'); return; }
    if (target === 'direct' && !userIds.length) { fail('Tick who to send it to.'); return; }
    if (target === 'direct' && !teamsSend.people.some((u) => userIds.includes(u.id) && u.teams)) {
      fail('None of them has a Teams email yet. A super admin adds it to their login in Admin (or they connect Teams themselves).');
      return;
    }
    if (target === 'mine' && (!team || !channel)) { fail('Pick a team and a channel.'); return; }
    storage('set', 'teamsTarget', target);
    const button = $f.find('[data-teams-submit]')[0];
    const val = { columns, userIds, note: $f.find('[name=note]').val().trim(), button };
    const { after } = teamsSend;
    const told = (out) => { if (after) after({ target, ...out }); };
    if (target === 'app') {
      teamsSend.send({ ...val, mode: 'channel' })
        .done((r) => { closeTeamsSend(); toast(`Sent ${r.rows} row${r.rows === 1 ? '' : 's'} on Teams`); told({}); })
        .fail((xhr) => fail(errorText(xhr)));
      return;
    }
    if (target === 'mine') { storage('set', 'teamsTeam', team); storage('set', 'teamsChannel', channel); }
    setBusy(button, true);
    // sign in first, while this is still the click (browsers allow the popup then)
    const signIn = window.flowGraph.account() ? Promise.resolve() : window.flowGraph.connect();
    signIn
      .then(() => teamsSend.send({ ...val, mode: 'card' }))
      .then((r) => (target === 'direct'
        ? window.flowGraph.sendDirect(r.people, r.direct).then((results) => { closeTeamsSend(); teamsDirectResult(results); told({ results }); })
        : window.flowGraph.sendChannel(team, channel, r.card).then(() => {
          closeTeamsSend(); toast(`Posted ${r.rows} row${r.rows === 1 ? '' : 's'} on Teams`);
          told({ results: r.people.map((u) => ({ name: u.name, ok: true })) });
        })))
      .catch((err) => fail(err && err.readyState !== undefined ? errorText(err) : (err && err.message) || 'Could not send on Teams'))
      .finally(() => { setBusy(button, false); renderAccount(); });
  });

  // Issues on Teams (from the issues list or the issue writer): issues of one app
  const ISSUE_TEAMS_COLUMNS = [['where', 'Module › Flow › Screen'], ['text', 'Issue'], ['priority', 'Priority'], ['status', 'Status'],
    ['assignees', 'Assigned to'], ['remarks', 'Remarks'], ['area', 'Area', false], ['added', 'Added on', false]];
  function sendIssuesOnTeams(pid, ids) {
    if (!ids.length) { toast('Tick the issues to send'); return; }
    api('GET', `/api/products/${encodeURIComponent(pid)}/people`).done((d) => {
      openTeamsSend({
        title: `Send ${ids.length === 1 ? 'an issue' : `${ids.length} issues`} on Teams`,
        count: ids.length,
        columns: ISSUE_TEAMS_COLUMNS.map(([id, label, on]) => ({ id, label, on })),
        people: d.people.filter((u) => u.id !== me.id),
        webhook: d.teams,
        send: (val) => api('POST', '/api/issues/teams', { productId: pid, ids, columns: val.columns, userIds: val.userIds, note: val.note, mode: val.mode }, val.button, QUIET),
      });
    });
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
    bugsView.picked = new Set([...(bugsView.picked || [])].filter((id) => list.some((x) => x.c.id === id)));
    const { picked } = bugsView;
    const allPicked = list.length && list.every((x) => picked.has(x.c.id));

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
        <button class="btn-secondary text-sm" data-bugs-teams ${list.length ? '' : 'disabled'} title="${picked.size ? 'Send the ticked issues on Teams' : 'Send every issue listed on Teams (tick some to send only those)'}">
          ${icon('share', 14)} ${picked.size ? `Send ${picked.size} on Teams` : 'Send on Teams'}</button>
        <button class="icon-btn" data-close-bugs title="Close">${icon('close', 18)}</button>
      </div>
      <div class="bugs-cols"><span><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-bugs-pick-all ${allPicked ? 'checked' : ''} title="Tick every issue listed"></span><span>Module › Flow › Screen</span><span>Priority</span><span>Status</span><span>Issue</span><span>Assigned to</span><span></span></div>
      <div class="bugs-rows">
        ${list.map(({ c, s, f, m }) => {
          const p = prio(c);
          return `
          <div class="bugs-row ${p} ${c.resolved ? 'is-fixed' : ''}">
            <input type="checkbox" class="mt-1 h-4 w-4 accent-indigo-600" data-bugs-pick="${c.id}" ${picked.has(c.id) ? 'checked' : ''}>
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
      <button class="btn-secondary px-3 py-1 text-xs ${sheetsView ? 'on' : ''}" data-action="sheets" title="Your own sheets: typed columns, links to flows and screens, Excel in and out">${icon('grid', 12)} Sheets</button>
      <button class="btn-secondary px-3 py-1 text-xs ${sanity ? 'on' : ''}" data-action="sanity" title="Daily sanity checklist of this app">${icon('check', 12)} Sanity</button>
      <button class="btn-secondary px-3 py-1 text-xs" data-action="done" title="What you finished today, shared on Teams">${icon('note', 12)} Done today</button>
      <button class="btn-primary px-3 py-1 text-xs" data-action="writer" title="Write an issue on any screen">${icon('plus', 12)} Write issue</button>
      <a class="btn-secondary px-3 py-1 text-xs" href="/api/export" title="Download every task as an Excel sheet">${icon('download', 12)} Excel</a>
      <button class="btn-secondary px-3 py-1 text-xs" data-action="admin">Admin</button>
      ${teamsAccount()}
      ${themeButton()}
      <button class="tab-add" data-action="logout">Sign out</button>`);
  }
  // Your own Teams (public/graph.js): connect your Microsoft account once, then FlowTrace sends as you: direct
  // messages, posts in your channels, and a message to people when you give them an issue or change its status.
  function teamsAccount() {
    const g = window.flowGraph;
    if (!g.configured()) return '';
    const acc = g.account();
    return `<details class="sheet-share teams-account">
      <summary class="btn-secondary px-3 py-1 text-xs ${acc ? 'on' : ''}" title="${acc ? `Teams: connected as ${esc(acc.username)}` : 'Connect your Microsoft Teams'}">
        ${icon('chat', 12)} Teams${acc ? '<span class="teams-dot"></span>' : ''}</summary>
      <div class="sheet-share-pop">
        ${acc ? `
          <p class="text-sm font-semibold text-slate-900">Teams connected</p>
          <p class="truncate text-xs text-slate-500">${esc(acc.name || '')} · ${esc(acc.username)}</p>
          <label class="mt-3 flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600" data-teams-auto ${g.autoDm() ? 'checked' : ''}>
            Message people on Teams when I give them an issue or change its status</label>
          <p class="mt-1 text-xs text-slate-400">Messages go from your account, to the Teams email of their login (Admin).</p>
          <button class="btn-secondary mt-3 w-full justify-center text-sm" data-teams-disconnect>Disconnect</button>` : `
          <p class="text-sm font-semibold text-slate-900">Send from your own Teams</p>
          <p class="mt-1 text-xs leading-relaxed text-slate-500">Connect your Microsoft work account once. Then you can send rows and issues to people directly or to your channels, and people get a Teams message when you give them an issue.</p>
          <button class="btn-primary mt-3 w-full justify-center text-sm" data-teams-connect>${icon('chat', 14)} Connect Teams</button>`}
      </div></details>`;
  }
  $doc.on('click', '[data-teams-connect]', function () {
    setBusy(this, true);
    window.flowGraph.connect()
      .then((who) => {
        toast(`Teams connected: ${who.email}`);
        // your login's Teams email is filled in from it when it is empty, so others can message you too
        if (!me.teamsEmail && who.email) api('PUT', '/api/me/teams-email', { email: who.email }, null, QUIET).done((r) => { me.teamsEmail = r.teamsEmail; });
      })
      .catch((err) => dialog.alert(err.message, 'Teams'))
      .finally(() => { setBusy(this, false); renderAccount(); });
  });
  $doc.on('click', '[data-teams-disconnect]', () => window.flowGraph.disconnect().then(() => { toast('Teams disconnected'); renderAccount(); }));
  $doc.on('change', '[data-teams-auto]', function () { window.flowGraph.autoDm(this.checked); });

  // An issue was given to people or changed status: the server says who (with Teams emails); they get a direct
  // message from you when you connected Teams (quietly: never a sign-in popup here)
  function teamsNotify(n) {
    window.flowGraph.notify(n).then((res) => {
      if (!res) return;
      const told = res.filter((x) => x.ok).map((x) => x.name);
      const failed = res.filter((x) => !x.ok && x.error !== 'that is you');
      if (told.length) toast(`Told ${told.join(', ')} on Teams`);
      if (failed.length) console.warn('Teams message not sent:', failed);
    }).catch((err) => console.warn('Teams message:', err.message));
  }

  // light / dark (public/theme.js)
  const themeButton = () => {
    const dark = window.flowTheme && window.flowTheme.isDark();
    return `<button class="icon-btn" data-theme-toggle title="${dark ? 'Light theme' : 'Dark theme'}">${icon(dark ? 'sun' : 'moon', 16)}</button>`;
  };
  $doc.on('click', '[data-theme-toggle]', function () {
    if (!window.flowTheme) return;
    window.flowTheme.toggle();
    $(this).replaceWith(themeButton());
    if (diagram.flowId) renderDiagram(); // its wires take colours from the theme
    if (sketch.open) skDraw();
  });

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
        <label class="mr-auto flex items-center gap-2 text-sm text-slate-600" title="After adding, pick the columns and people and post these issues to the app's Teams channel">
          <input type="checkbox" class="h-4 w-4 accent-indigo-600" name="sendTeams" ${writer.sendTeams ? 'checked' : ''}> Send them on Teams too</label>
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
    const made = []; // { id, productId }
    writer.sendTeams = $f.find('[name=sendTeams]').prop('checked');
    const next = (i) => {
      if (i === $rows.length) {
        toast(`${added === 1 ? 'Issue' : `${added} issues`} added`);
        // "Send them on Teams too": one message per app
        if (writer.sendTeams && made.length) {
          const pid = made[0].productId;
          sendIssuesOnTeams(pid, made.filter((x) => x.productId === pid).map((x) => x.id));
        }
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
        .done((c) => { flashId = c.id; added += 1; made.push({ id: c.id, productId: rowPlace($row).productId }); Object.assign(writer, rowPlace($row)); $row.remove(); next(i + 1); })
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
    if (sheetsView) openSheets(productId); // on the Sheets page: that app's sheets
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
  $doc.on('change', '[data-bugs-pick]', function () {
    const id = $(this).data('bugs-pick');
    if (this.checked) bugsView.picked.add(id); else bugsView.picked.delete(id);
    renderBugs(); applyAccess();
  });
  $doc.on('change', '[data-bugs-pick-all]', function () {
    const ids = $('#bugsBody [data-bugs-pick]').map((i, el) => $(el).data('bugs-pick')).get();
    bugsView.picked = this.checked ? new Set(ids) : new Set();
    renderBugs(); applyAccess();
  });
  $doc.on('click', '[data-bugs-teams]', () => {
    const ids = $('#bugsBody [data-bugs-pick]').map((i, el) => $(el).data('bugs-pick')).get();
    sendIssuesOnTeams(productId, bugsView.picked.size ? ids.filter((id) => bugsView.picked.has(id)) : ids);
  });
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
    else if (teamsSend) closeTeamsSend();
    else if ($('#sheetFilterPop').length) closeFilter();
    else if (!$('#importModal').hasClass('hidden')) closeImport();
    else if (sketch.open) skEscape();
    else if (!$('#copyModal').hasClass('hidden')) closeCopy();
    else if (sanityLog) closeSanityLog();
    else if (sanity && sanity.view === 'sheet' && (sanity.focus || sanity.review || sanity.help) && !$(e.target).is('input, textarea, select')) sanityEscape();
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
    if (sanity) closeSanity(); // going to a flow or screen leaves the Sanity (or Sheets) page
    if (sheetsView) closeSheets();
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
    if (sketch.open) closeSketch();
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
    else if (h.get('sheets')) {
      if (products.some((p) => p.id === h.get('sheets'))) { selectProduct(h.get('sheets')); render(); }
      openSheets(productId);
    }
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
  // Test cases are the flows of the app (grouped by module) and typed headings. Each day starts fresh; earlier days
  // stay as history. A tester runs each case — Pass, Fail, Blocked or Not tested — with its expected / actual result,
  // steps to reproduce, remarks and evidence; everything saves as it is typed. A failure is posted to the app's Teams
  // channel with the case's developer @mentioned. Focus mode shows one case at a time; Review & submit checks the run
  // and shows the report before it is saved and sent. The version and time are set per day; at that time the channel
  // gets a reminder.

  // { productId, date, today, run, items, people, columns, canRun, canManage, teams, webhook, recipients, evidence, logs,
  //   view: 'sheet' | 'logs', missing, logFilter: { q, date, bad }, ui: { q, status, module, selected, open, cursor, shut },
  //   retestLog, focus (case id), review, help, logsTab: 'reports' | 'failures' | 'compare', compare: [older, newer], allChanges }
  let sanity = null;

  const SANITY_STATE = {
    pass: { label: 'Pass', done: 'Passed', key: 'p', icon: 'check' },
    fail: { label: 'Fail', done: 'Failed', key: 'f', icon: 'close' },
    blocked: { label: 'Blocked', done: 'Blocked', key: 'b', icon: 'ban' },
    skipped: { label: 'Not tested', done: 'Not tested', key: 'n', icon: 'skip' },
  };
  const stateLabel = (st) => (SANITY_STATE[st] ? SANITY_STATE[st].done : 'Not run');
  const stateChip = (st) => `<span class="sc-chip st-${SANITY_STATE[st] ? st : 'pending'}">${icon(SANITY_STATE[st] ? SANITY_STATE[st].icon : 'clock', 11)} ${stateLabel(st)}</span>`;
  const isBad = (st) => st === 'fail' || st === 'blocked';
  const sanityUi = () => ({ q: '', status: 'all', module: '', selected: new Set(), open: new Set(), cursor: null, shut: new Set() });
  const sanityPerson = (id) => (sanity && sanity.people.find((x) => x.id === id) || {}).name || '';
  const sanityRuns = (d) => d.date === d.today && d.canRun; // marking cases, details, version / time
  const timeText = (at) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const logWhen = (l) => `${fmtDate(l.date)} · ${new Date(l.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // view: the checklist ('sheet') or the logs page ('logs'); kept as it is when left out
  function openSanity(pid, date, view) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return null; }
    return $.when(
      api('GET', `/api/sanity?product=${encodeURIComponent(pid)}${date ? `&date=${date}` : ''}`),
      api('GET', `/api/sanity/logs?product=${encodeURIComponent(pid)}`),
    ).done(([d], [logs]) => {
      const fresh = !sanity;
      // the same app keeps what the tester set up: filters, open cases, selection, focus / review, flagged rows
      const keep = sanity && sanity.productId === pid ? sanity : null;
      const ui = keep ? keep.ui : sanityUi();
      ui.selected = new Set([...ui.selected].filter((id) => d.items.some((it) => it.id === id)));
      sanity = {
        productId: pid, ...d, logs,
        missing: keep ? keep.missing : new Set(),
        logFilter: keep ? keep.logFilter : { q: '', date: '', bad: false },
        view: view || (keep && keep.view) || 'sheet',
        ui,
        retestLog: keep ? keep.retestLog : null,
        focus: keep && keep.focus && d.items.some((it) => it.id === keep.focus) ? keep.focus : null,
        review: keep ? keep.review : false,
        help: false,
        logsTab: keep ? keep.logsTab : 'reports',
        compare: keep ? keep.compare : null,
        allChanges: keep ? keep.allChanges : false,
      };
      renderSanity();
      // the page takes the board's place; the address keeps it, so a refresh or a shared link comes back here
      if (sheetsView) closeSheets();
      $('#board, #tabs').addClass('hidden');
      $('#sanityPage').removeClass('hidden');
      $('[data-action="sanity"]').addClass('on');
      history.replaceState(null, '', `${location.pathname}${location.search}#sanity=${encodeURIComponent(pid)}${sanity.view === 'logs' ? '&view=logs' : ''}`);
      if (fresh) window.scrollTo(0, 0);
    });
  }
  // everything typed is saved first, so a reload never brings back an older value
  const reloadSanity = () => sanity && flushSanitySaves().always(() => openSanity(sanity.productId, sanity.date));

  function closeSanity() {
    flushSanitySaves();
    sanity = null;
    $('#sanityPage').addClass('hidden').empty();
    $('body').removeClass('sc-locked');
    $('#board, #tabs').removeClass('hidden');
    $('[data-action="sanity"]').removeClass('on');
    history.replaceState(null, '', location.pathname + location.search);
  }

  // Checklist | Logs, at the top of both pages
  const sanityViews = (d) => `<div class="seg sanity-views">
    <button data-sanity-view="sheet" class="${d.view === 'sheet' ? 'on' : ''}">${icon('check', 12)} Checklist</button>
    <button data-sanity-view="logs" class="${d.view === 'logs' ? 'on' : ''}">${icon('note', 12)} Logs <span class="text-slate-400">${d.logs.length}</span></button>
  </div>`;

  function sanityHeader(d, title, sub, extra = '') {
    const p = products.find((x) => x.id === d.productId);
    return `<div class="sc-header">
      <button class="btn-secondary text-sm" data-close-sanity title="Back to the board">${icon('left', 14)} Board</button>
      <div class="min-w-0 flex-1">
        <h3 class="text-lg font-semibold text-slate-900">${title} <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
        <p class="text-xs text-slate-500">${sub}</p>
      </div>
      ${sanityViews(d)}
      ${extra}
    </div>`;
  }

  // ---- retest: cases that failed or were blocked in a report (the latest one, or one picked in the logs)

  function sanityRetest(d) {
    const log = (d.retestLog && d.logs.find((l) => l.id === d.retestLog)) || d.logs[0];
    if (!log) return null;
    const bad = log.cases.filter((c) => isBad(c.state));
    if (!bad.length) return null;
    // older reports name their headings only
    return { log, byId: new Map(bad.filter((c) => c.itemId).map((c) => [c.itemId, c])), byName: new Map(bad.map((c) => [c.heading, c])) };
  }
  const retestOf = (d, it) => (d.retest ? d.retest.byId.get(it.id) || d.retest.byName.get(it.heading) || null : null);

  // ---- grouping, filters

  function caseGroup(it) {
    const f = it.flowId && findFlow(it.flowId);
    const m = f && allModules.find((x) => x.id === f.moduleId);
    return m ? { key: m.id, name: m.name } : { key: 'other', name: 'Other checks' };
  }

  function sanityVisible(d) {
    const q = d.ui.q.trim().toLowerCase();
    const st = d.ui.status;
    return d.items.filter((it) => {
      const g = caseGroup(it);
      if (d.ui.module && g.key !== d.ui.module) return false;
      if (q && ![it.heading, g.name, it.review, it.actual, it.expected, it.repro].join(' ').toLowerCase().includes(q)) return false;
      if (st === 'retest') return Boolean(retestOf(d, it));
      return st === 'all' || it.state === st;
    });
  }

  // ---- autosave: each field is saved a moment after typing stops; failures retry by themselves

  const scTimers = new Map(); // key → { timer, run }
  let scInFlight = 0;
  let scSavedAt = null;
  let scFailed = false;

  function sanitySaved() {
    const $s = $('#scSaved');
    if (!$s.length) return;
    const busy = scInFlight || scTimers.size;
    $s.toggleClass('busy', Boolean(busy)).toggleClass('error', scFailed && !busy)
      .html(scFailed && !busy ? `${icon('close', 12)} Not saved · retrying`
        : busy ? `<span class="sc-spin"></span> Saving…`
          : scSavedAt ? `${icon('check', 12)} All changes saved · ${timeText(scSavedAt)}` : `${icon('check', 12)} Saves automatically`);
  }
  function sanityAutosave(key, run, delay = 600) {
    const old = scTimers.get(key);
    if (old) clearTimeout(old.timer);
    const go = () => {
      scTimers.delete(key);
      scInFlight += 1;
      sanitySaved();
      return run()
        .done(() => { scSavedAt = new Date(); scFailed = false; })
        .fail((xhr) => {
          if (xhr.status === 401) { showLogin(); return; }
          scFailed = true;
          if (xhr.status >= 500 || !xhr.status) sanityAutosave(key, run, 4000); // offline / server trouble: try again
          else dialog.alert(errorText(xhr), 'Not saved');
        })
        .always(() => { scInFlight -= 1; sanitySaved(); });
    };
    scTimers.set(key, { timer: setTimeout(go, delay), run: go });
    sanitySaved();
  }
  // save everything waiting now (before a reload, a submit or leaving the page)
  function flushSanitySaves() {
    const waiting = [...scTimers.values()];
    waiting.forEach((x) => clearTimeout(x.timer));
    return $.when(...waiting.map((x) => x.run()));
  }
  window.addEventListener('beforeunload', (e) => {
    if (scTimers.size || scInFlight) { flushSanitySaves(); e.preventDefault(); e.returnValue = ''; }
  });

  const saveCaseField = (it, field, value) => {
    it[field] = value;
    sanityAutosave(`${it.id}:${field}`, () => api('PUT', `/api/sanity/items/${it.id}/result`, { [field]: value }, null, QUIET));
  };
  const saveCaseCell = (it, col, value) => {
    it.cells = { ...it.cells, [col]: value };
    sanityAutosave(`${it.id}:cell:${col}`, () => api('PUT', `/api/sanity/items/${it.id}/result`, { cells: { [col]: value } }, null, QUIET));
  };
  const saveExpected = (it, value) => {
    it.expected = value;
    sanityAutosave(`${it.id}:expected`, () => api('PATCH', `/api/sanity/items/${it.id}`, { expected: value }, null, QUIET));
  };

  // Mark one or more cases. The checklist changes at once; the server follows (a new failure goes to Teams).
  // Marking a case with the state it already has puts it back to "not run".
  let scFocusField = null; // after a render, put the cursor here: { id, field }
  function setSanityState(ids, state) {
    const d = sanity;
    const list = d.items.filter((it) => ids.includes(it.id));
    if (!list.length) return;
    const to = list.length === 1 && list[0].state === state ? 'pending' : state;
    const before = list.map((it) => ({ it, state: it.state, resultBy: it.resultBy, resultAt: it.resultAt }));
    list.forEach((it) => { Object.assign(it, { state: to, resultBy: me.id, resultAt: new Date().toISOString() }); d.missing.delete(it.id); });
    // a failure needs its story: open the case and start on the actual result
    if (to === 'fail' && list.length === 1) {
      d.ui.open.add(list[0].id);
      if (!list[0].actual) scFocusField = { id: list[0].id, field: 'actual' };
    }
    scInFlight += 1;
    renderSanity();
    const req = list.length === 1
      ? api('PUT', `/api/sanity/items/${list[0].id}/result`, { state: to }, null, QUIET)
      : api('PUT', '/api/sanity/results', { productId: d.productId, itemIds: list.map((it) => it.id), state: to }, null, QUIET);
    req.done((r) => {
      scSavedAt = new Date();
      scFailed = false;
      if (r.teams) {
        list.filter((it) => it.state === 'fail').forEach((it) => { it.notifyStatus = r.teams; });
        teamsResult(r.teams, list.length === 1 ? 'Failure posted on Teams' : 'Failures posted on Teams');
        if (sanity === d) renderSanity();
      }
    }).fail((xhr) => {
      before.forEach((b) => Object.assign(b.it, { state: b.state, resultBy: b.resultBy, resultAt: b.resultAt }));
      if (sanity === d) renderSanity();
      if (xhr.status === 401) showLogin(); else dialog.alert(errorText(xhr), 'Not saved');
    }).always(() => { scInFlight -= 1; sanitySaved(); });
  }

  // ---- evidence: screenshots and screen recordings, uploaded straight away (also pasted with Ctrl+V)

  function uploadEvidence(it, files) {
    [...files].forEach((file) => {
      if (!/^(image|video)\//.test(file.type)) { dialog.alert('Attach a screenshot (PNG, JPG…) or a screen recording (MP4, MOV, WEBM).', 'Not an image or video'); return; }
      if (file.size > 100 * 1024 * 1024) { dialog.alert('Please choose a file under 100 MB.', 'File too large'); return; }
      it.uploading = (it.uploading || 0) + 1;
      renderSanity();
      startLoading();
      $.ajax({
        method: 'POST', url: `/api/sanity/items/${it.id}/evidence?name=${encodeURIComponent(file.name || 'Screenshot')}`,
        data: file, processData: false, contentType: file.type,
      })
        .done((r) => { it.evidence = r.evidence; toast('Evidence attached'); })
        .fail((xhr) => {
          if (xhr.status === 401) showLogin();
          else dialog.alert(xhr.status === 413 ? 'Please choose a file under 100 MB.' : errorText(xhr), 'Upload failed');
        })
        .always(() => { it.uploading -= 1; stopLoading(); if (sanity) renderSanity(); });
    });
  }

  // ---- pieces of the checklist

  function sanityProgress(d, run) {
    const n = d.items.length;
    const count = (st) => d.items.filter((it) => it.state === st).length;
    const left = count('pending');
    const retest = d.retest ? d.items.filter((it) => retestOf(d, it)).length : 0;
    const seg = (st) => (n && count(st) ? `<i class="st-${st}" style="width:${(count(st) / n) * 100}%" title="${stateLabel(st)}: ${count(st)}"></i>` : '');
    const chip = (key, label, num, cls = '') => `<button class="sc-filter ${cls} ${d.ui.status === key ? 'on' : ''}" data-sc-status="${key}">${label} <b>${num}</b></button>`;
    return `<div class="sc-progress">
      <div class="sc-progress-row">
        <div class="sc-progress-count"><b>${n - left}</b><span>/ ${n} run</span>${left ? `<em>${left} left</em>` : n ? '<em class="all">all run</em>' : ''}</div>
        <div class="sc-bar" role="img" aria-label="${n - left} of ${n} cases run">${['pass', 'fail', 'blocked', 'skipped'].map(seg).join('')}</div>
        <span class="sc-saved" id="scSaved"></span>
        ${run && n ? `
        <button class="btn-secondary" data-sc-focus title="One case at a time (Shift+F)">${icon('focus', 14)} Focus mode</button>
        <button class="btn-primary" data-sc-review title="Check the run and send the report (R)">${icon('check', 14)} Review &amp; submit</button>` : ''}
      </div>
      <div class="sc-filters" role="group" aria-label="Show">
        ${chip('all', 'All', n)}
        ${chip('pending', 'Not run', left, 'st-pending')}
        ${chip('fail', 'Failed', count('fail'), 'st-fail')}
        ${chip('blocked', 'Blocked', count('blocked'), 'st-blocked')}
        ${retest ? chip('retest', `${icon('flip', 11)} Retest`, retest, 'st-retest') : ''}
        ${chip('pass', 'Passed', count('pass'), 'st-pass')}
        ${chip('skipped', 'Not tested', count('skipped'), 'st-skipped')}
      </div>
    </div>`;
  }

  function caseMeta(d, it) {
    const r = retestOf(d, it);
    const out = [];
    if (r) {
      const v = esc(d.retest.log.version);
      out.push(it.state === 'pass' ? `<span class="sc-badge fixed">${icon('check', 11)} Fixed since ${v}</span>`
        : isBad(it.state) ? `<span class="sc-badge still">${icon('flip', 11)} Still ${it.state === 'fail' ? 'failing' : 'blocked'} since ${v}</span>`
          : `<span class="sc-badge retest">${icon('flip', 11)} Retest · ${stateLabel(r.state).toLowerCase()} in ${v}</span>`);
    }
    out.push(`<span>${esc(caseGroup(it).name)}</span>`);
    if (it.state !== 'pending' && it.resultAt) out.push(`<span>${stateLabel(it.state)} by ${esc(sanityPerson(it.resultBy) || '—')}</span>`);
    if (it.ownerId) out.push(`<span>${icon('user', 11)} ${esc(sanityPerson(it.ownerId))}</span>`);
    if (it.evidence.length) out.push(`<span>${icon('clip', 11)} ${it.evidence.length}</span>`);
    if (it.state === 'fail') out.push(notifyBadge(it));
    return out.join('');
  }

  // how the failure's Teams message went
  const notifyBadge = (it) => (it.notifyStatus === 'sent' ? `<span class="sc-badge sent">${icon('share', 11)} ${it.ownerId ? 'Developer notified' : 'Posted on Teams'}${it.sharedAt ? ` · ${timeText(it.sharedAt)}` : ''}</span>`
    : it.notifyStatus === 'off' ? `<span class="sc-badge muted" title="This app has no Teams channel">${icon('share', 11)} Not sent: no Teams channel</span>`
      : it.notifyStatus ? `<span class="sc-badge error" title="${esc(it.notifyStatus)}">${icon('share', 11)} Teams message failed</span>` : '');

  function caseActions(it, run, big) {
    if (!run) return stateChip(it.state);
    return Object.entries(SANITY_STATE).map(([k, v]) => `<button class="sc-act ${k} ${it.state === k ? 'on' : ''}" data-sc-state="${k}"
      title="${v.label} (${v.key.toUpperCase()})" aria-pressed="${it.state === k}">${icon(v.icon, big ? 16 : 13)}<span>${v.label}</span>${big ? `<kbd>${v.key.toUpperCase()}</kbd>` : ''}</button>`).join('');
  }

  function caseDetail(d, it, run, inFocus) {
    const isToday = d.date === d.today;
    const field = (name, label, value, hint, on) => `<label class="sc-field ${name === 'actual' && it.state === 'fail' && !value ? 'wanted' : ''}">
      <span>${label}</span>
      <textarea class="input" rows="2" data-sc-field="${name}" placeholder="${run ? hint : ''}" ${on ? '' : 'disabled'} maxlength="2000">${esc(value)}</textarea>
    </label>`;
    const f = it.flowId && findFlow(it.flowId);
    return `<div class="sc-detail">
      <div class="sc-fields">
        ${inFocus ? '' : `<label class="sc-field expected"><span>Expected result</span>
          <textarea class="input" rows="2" data-sc-expected placeholder="${d.canManage && isToday ? 'What should happen (kept for every run)' : ''}" ${d.canManage && isToday ? '' : 'disabled'} maxlength="2000">${esc(it.expected)}</textarea></label>`}
        ${field('actual', 'Actual result', it.actual, 'What happened', run)}
        ${field('repro', 'Steps to reproduce', it.repro, '1. Open …\n2. Tap …', run)}
        ${field('review', 'Remarks', it.review, 'Anything else (device, network, build…)', run)}
        ${d.columns.map((c) => `<label class="sc-field small"><span>${esc(c.name)}</span>
          <input class="input" data-sc-cell="${c.id}" value="${esc(it.cells[c.id] || '')}" maxlength="500" ${run ? '' : 'disabled'}></label>`).join('')}
      </div>
      <div class="sc-evidence">
        <span class="sc-label">Evidence</span>
        <div class="sc-thumbs">
          ${it.evidence.map((e) => `<div class="sc-thumb">
            <a href="${esc(e.url)}" target="_blank" rel="noopener" title="${esc(e.name)}">${e.kind === 'video'
              ? `<span class="sc-vid">${icon('play', 18)}</span>` : `<img src="${esc(imageUrl(e.url, 'sm'))}" alt="${esc(e.name)}" loading="lazy">`}</a>
            <span class="truncate">${esc(e.name)}</span>
            ${run ? `<button class="sc-thumb-x" data-sc-evidence-remove="${e.id}" title="Remove">${icon('close', 11)}</button>` : ''}
          </div>`).join('')}
          ${it.uploading ? '<div class="sc-thumb loading"><span class="sc-spin"></span><span>Uploading…</span></div>' : ''}
          ${run ? (d.evidence
            ? `<label class="sc-attach">${icon('clip', 14)} Add screenshot or video<input type="file" class="hidden" accept="image/*,video/*" multiple data-sc-evidence></label>`
            : '<span class="sc-hint">Attachments need Cloudinary to be set up for this server.</span>')
            : (it.evidence.length ? '' : '<span class="sc-hint">None</span>')}
        </div>
        ${run && d.evidence ? '<span class="sc-hint">Tip: paste a screenshot with Ctrl+V / ⌘V while this case is open.</span>' : ''}
      </div>
      <div class="sc-foot">
        <label class="sc-dev">${icon('user', 13)} Developer
          <select class="input" data-sc-owner ${d.canManage && isToday ? '' : 'disabled'}>
            <option value="">Nobody</option>${d.people.map((x) => `<option value="${x.id}" ${x.id === it.ownerId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
          </select></label>
        ${f ? `<button class="sc-link" data-sanity-go="${it.flowId}">${icon('link', 12)} Open flow</button>` : ''}
        ${it.state === 'fail' ? notifyBadge(it) : ''}
        ${it.state === 'fail' && run && d.teams ? `<button class="sc-link" data-sanity-share="${it.id}">${icon('share', 12)} ${it.notifyStatus === 'sent' ? 'Notify again' : 'Post on Teams'}</button>` : ''}
        ${d.canManage && !inFocus ? `<button class="sc-link danger" data-sanity-delete="${it.id}">${icon('trash', 12)} Remove case</button>` : ''}
      </div>
    </div>`;
  }

  function caseRow(d, it, no, run, drag) {
    const open = d.ui.open.has(it.id);
    const picked = d.ui.selected.has(it.id);
    const retest = retestOf(d, it) && it.state === 'pending';
    return `<div class="sc-row st-${it.state} ${retest ? 'retest' : ''} ${open ? 'open' : ''} ${picked ? 'picked' : ''}
        ${d.missing.has(it.id) && it.state === 'pending' ? 'missing' : ''} ${d.ui.cursor === it.id ? 'cursor' : ''}" data-item="${it.id}">
      <div class="sc-main">
        ${run ? `<input type="checkbox" class="sc-check" data-sc-select ${picked ? 'checked' : ''} aria-label="Select ${esc(it.heading)}">` : ''}
        <span class="sc-no ${drag ? 'drag' : ''}" title="${drag ? 'Drag to reorder' : ''}">${no}</span>
        <button class="sc-title" data-sc-toggle aria-expanded="${open}">
          <span class="sc-heading">${esc(it.heading)}</span>
          <span class="sc-meta">${caseMeta(d, it)}</span>
        </button>
        <div class="sc-acts">${caseActions(it, run)}</div>
        <button class="icon-btn sc-chev" data-sc-toggle title="Details (Enter)">${icon('down', 16)}</button>
      </div>
      ${open ? caseDetail(d, it, run, false) : ''}
    </div>`;
  }

  // ---- the checklist page

  function renderSanity() {
    const d = sanity;
    if (!d) return;
    // keep the cursor where the tester is typing (the page is drawn again after every change)
    const active = document.activeElement;
    let keepFocus = null;
    if (active && $(active).closest('#sanityPage').length && $(active).is('input, textarea, select')) {
      keepFocus = {
        item: $(active).closest('[data-item]').data('item') || null,
        attrs: [...active.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `[${a.name}${a.value ? `="${a.value}"` : ''}]`).join(''),
        start: active.selectionStart, end: active.selectionEnd, overlay: $(active).closest('.sc-focus, .sc-review').length > 0,
      };
    }
    d.retest = sanityRetest(d);
    if (d.view === 'logs') renderSanityLogs(); else renderSanityChecklist(d);
    $('body').toggleClass('sc-locked', Boolean(d.view === 'sheet' && (d.focus || d.review)));
    document.documentElement.style.setProperty('--app-header', `${$('header').outerHeight() || 0}px`);
    sanitySaved();
    $('#sanityPage textarea').each((i, el) => autoGrow(el));
    if (scFocusField) {
      // in focus mode the case is the one on the card; else its row in the list
      const $where = d.focus ? $('#sanityPage .sc-focus') : $(`#sanityPage .sc-groups [data-item="${scFocusField.id}"]`);
      const el = $where.find(`[data-sc-field="${scFocusField.field}"]`)[0];
      scFocusField = null;
      if (el) { el.focus(); return; }
    }
    if (keepFocus && keepFocus.attrs) {
      const scope = keepFocus.overlay ? '#sanityPage .sc-focus, #sanityPage .sc-review' : '#sanityPage';
      const $scope = keepFocus.item ? $(scope).find(`[data-item="${keepFocus.item}"]`).addBack(`[data-item="${keepFocus.item}"]`) : $(scope);
      const el = $scope.find(keepFocus.attrs)[0];
      if (el) {
        el.focus({ preventScroll: true });
        if (typeof keepFocus.start === 'number' && el.setSelectionRange) try { el.setSelectionRange(keepFocus.start, keepFocus.end); } catch (e) { /* not a text field */ }
      }
    }
  }

  function renderSanityChecklist(d) {
    const p = products.find((x) => x.id === d.productId);
    const isToday = d.date === d.today;
    const run = sanityRuns(d);
    const visible = sanityVisible(d);
    const used = new Set(d.items.map((it) => it.flowId).filter(Boolean));
    const flowOptions = (p ? p.modules : []).map((m) => `<optgroup label="${esc(m.name)}">${m.flows.filter((f) => !used.has(f.id))
      .map((f) => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</optgroup>`).join('');
    // reordering only makes sense on the whole list
    const drag = d.canManage && isToday && d.ui.status === 'all' && !d.ui.q && !d.ui.module;
    const modulesUsed = [];
    d.items.forEach((it) => { const g = caseGroup(it); if (!modulesUsed.some((x) => x.key === g.key)) modulesUsed.push(g); });
    const groups = [];
    visible.forEach((it) => {
      const g = caseGroup(it);
      let grp = groups.find((x) => x.key === g.key);
      if (!grp) { grp = { ...g, items: [] }; groups.push(grp); }
      grp.items.push(it);
    });
    const numberOf = new Map(d.items.map((it, i) => [it.id, i + 1]));
    const allPicked = visible.length && visible.every((it) => d.ui.selected.has(it.id));

    $('#sanityPage').html(`<div class="sanity-page sc-page">
      ${sanityHeader(d, 'Sanity testing', isToday ? `Today · ${fmtDate(d.date)} · resets at midnight (${esc(d.timezone)})` : `History of ${fmtDate(d.date)} · read only`, `
        <input type="date" class="input py-1 text-sm" data-sanity-date value="${d.date}" max="${d.today}" title="Look at an earlier day">
        ${isToday ? '' : '<button class="btn-secondary text-sm" data-sanity-today>Today</button>'}
        <a class="btn-secondary text-sm" href="/api/sanity/export?product=${encodeURIComponent(d.productId)}&date=${d.date}" title="Download this day's sheet">${icon('download', 14)} Excel</a>`)}

      ${sanityProgress(d, run)}

      <form id="sanityRun" class="sc-run">
        <label><span class="field-label">Version under test</span>
          <input class="input w-44" name="version" value="${esc(d.run ? d.run.version : '')}" placeholder="e.g. 1.12.0 (245)" maxlength="60" ${run ? '' : 'disabled'}></label>
        <label><span class="field-label">Sanity time</span>
          <input class="input w-32" type="time" name="time" value="${esc(d.run ? d.run.time : '')}" ${run ? '' : 'disabled'}></label>
        ${run ? '<button class="btn-secondary self-end">Save</button>' : ''}
        <div class="sc-recipients">
          <span class="field-label">Report goes to</span>
          <div class="flex flex-wrap items-center gap-1.5">
            ${d.recipients.map((id) => `<span class="person">${esc(sanityPerson(id) || '—')}</span>`).join('') || '<span class="text-xs text-slate-400">nobody yet</span>'}
            ${d.canManage ? `
            <details class="sheet-share">
              <summary class="text-xs font-medium text-indigo-600 hover:underline">Change</summary>
              <div class="sheet-share-pop left-0 right-auto">
                <span class="field-label">@mention on Teams when a sanity is submitted</span>
                <div class="max-h-56 overflow-y-auto">${d.people.map((x) => `
                  <label class="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sanity-recipient value="${x.id}" ${d.recipients.includes(x.id) ? 'checked' : ''}> ${esc(x.name)}${x.teams ? '' : ' <span class="text-xs text-slate-400">(no Teams email)</span>'}</label>`).join('')}</div>
              </div>
            </details>` : ''}
          </div>
          <p class="text-xs text-slate-500">${d.teams
            ? (isToday && d.run && d.run.time ? (d.run.remindedAt ? 'Teams reminder sent today.' : `Teams reminder at ${esc(d.run.time)}.`) : 'Posted on the app’s Teams channel.')
            : '<span class="text-amber-700">No Teams channel yet: reports are only kept in the logs.</span>'}</p>
        </div>
      </form>
      ${isToday && !d.canRun ? '<p class="mx-5 mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">You can look at the sanity list. Testers and developers run it; for any other login, ask an admin to tick <b>Sanity tester</b>.</p>' : ''}
      ${d.retest && d.ui.status !== 'retest' && d.items.some((it) => retestOf(d, it) && it.state === 'pending') ? `
        <div class="sc-note retest">${icon('flip', 14)}
          <span><b>${d.items.filter((it) => retestOf(d, it) && it.state === 'pending').length} case(s) to retest</b> — failed or blocked in ${esc(d.retest.log.version)} (${logWhen(d.retest.log)}).</span>
          <button class="sc-link" data-sc-status="retest">Show them</button>
          ${d.retestLog ? '<button class="sc-link" data-sc-retest-clear>Back to the latest report</button>' : ''}
        </div>` : ''}

      <div class="sc-toolbar">
        ${run ? `<input type="checkbox" class="sc-check" data-sc-select-all ${allPicked ? 'checked' : ''} title="Select every case shown" aria-label="Select every case shown">` : ''}
        <label class="sc-search">${icon('search', 14)}
          <input class="input" data-sc-search value="${esc(d.ui.q)}" placeholder="Search cases, remarks, results" autocomplete="off"><kbd>/</kbd></label>
        <select class="input sc-module" data-sc-module title="Module">
          <option value="">All modules</option>${modulesUsed.map((g) => `<option value="${g.key}" ${d.ui.module === g.key ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}
        </select>
        ${d.ui.q || d.ui.module || d.ui.status !== 'all' ? '<button class="sc-link" data-sc-clear-filters>Clear filters</button>' : ''}
        <span class="flex-1"></span>
        <button class="sc-link" data-sc-expand="${groups.length && visible.every((it) => d.ui.open.has(it.id)) ? 'none' : 'all'}">${visible.length && visible.every((it) => d.ui.open.has(it.id)) ? 'Collapse all' : 'Expand all'}</button>
        <button class="icon-btn" data-sc-help title="Keyboard shortcuts (?)">${icon('keyboard', 16)}</button>
      </div>
      ${run && d.ui.selected.size ? `
      <div class="sc-bulk" role="toolbar" aria-label="Selected cases">
        <b>${d.ui.selected.size} selected</b><span>Mark as</span>
        ${Object.entries(SANITY_STATE).map(([k, v]) => `<button class="sc-act ${k}" data-sc-bulk="${k}">${icon(v.icon, 13)}<span>${v.label}</span></button>`).join('')}
        <button class="sc-act" data-sc-bulk="pending">${icon('clock', 13)}<span>Not run</span></button>
        <button class="sc-link" data-sc-select-none>Clear</button>
      </div>` : ''}

      <div class="sc-groups">
        ${groups.map((g) => {
          const all = d.items.filter((it) => caseGroup(it).key === g.key);
          const ran = all.filter((it) => it.state !== 'pending').length;
          const bad = all.filter((it) => isBad(it.state)).length;
          const shut = d.ui.shut.has(g.key);
          return `<section class="sc-group ${shut ? 'shut' : ''}">
            <button class="sc-group-head" data-sc-group="${g.key}" aria-expanded="${!shut}">
              ${icon('down', 14)}<span class="sc-group-name">${esc(g.name)}</span>
              <span class="sc-group-count">${ran}/${all.length} run</span>
              ${bad ? `<span class="sc-chip st-fail">${bad} failed / blocked</span>` : ''}
              <span class="sc-group-bar"><i style="width:${all.length ? (ran / all.length) * 100 : 0}%"></i></span>
            </button>
            ${shut ? '' : `<div class="sc-list" data-sc-list="${g.key}">${g.items.map((it) => caseRow(d, it, numberOf.get(it.id), run, drag)).join('')}</div>`}
          </section>`;
        }).join('') || `<p class="sc-empty">${d.items.length ? 'No case matches these filters.' : 'No cases yet. Every flow of this app shows up here, and you can add your own below.'}</p>`}
      </div>

      ${d.canManage ? `
      <form id="sanityAdd" class="sanity-add">
        <select class="input" name="flowId" title="A flow of this app, or a new heading">
          <option value="">New case…</option>${flowOptions.replace(/<optgroup[^>]*><\/optgroup>/g, '')}
        </select>
        <input class="input min-w-0 flex-1" name="heading" placeholder="New case, e.g. Login with OTP" maxlength="120" autocomplete="off">
        <button class="btn-primary">${icon('plus', 14)} Add case</button>
        ${can('developer') && p && p.modules.length ? `
        <label class="sanity-newflow"><input type="checkbox" name="createFlow" class="h-4 w-4 accent-indigo-600">
          Also create it as a flow in <select class="input py-0.5 text-sm" name="moduleId">${p.modules.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>` : ''}
        <div class="sc-columns">
          <span class="text-xs font-medium text-slate-500">Extra fields on every case:</span>
          ${d.columns.map((c) => `<span class="person">${esc(c.name)}
            <button type="button" data-col-rename="${c.id}" title="Rename">${icon('edit', 10)}</button>
            <button type="button" data-col-delete="${c.id}" title="Delete">${icon('close', 10)}</button></span>`).join('') || '<span class="text-xs text-slate-400">none</span>'}
          <button type="button" class="sanity-addcol" data-col-add>${icon('plus', 12)} Field</button>
        </div>
      </form>` : ''}

      <p class="sanity-logs text-xs text-slate-500">The checklist resets every day; every submitted sanity is kept in the
        <button class="font-medium text-indigo-600 hover:underline" data-sanity-view="logs">sanity logs (${d.logs.length})</button>.</p>

      ${me.access === 'super' ? `
      <details class="sanity-teams" ${d.teams ? '' : 'open'}>
        <summary>Teams channel for ${esc(p ? p.name : '')} ${d.teams ? '<span class="chip pass">connected</span>' : '<span class="chip">not set</span>'}</summary>
        <form id="sanityTeamsForm" class="mt-3 space-y-2">
          <p class="text-xs text-slate-500">In Teams, open the channel → <b>Workflows</b> → <b>Post to a channel when a webhook request is received</b>, finish the steps and paste the URL it gives you here. Logins are @mentioned by the <b>Teams email</b> set in Admin.</p>
          <div class="flex flex-wrap gap-2">
            <input class="input min-w-0 flex-1 font-mono text-xs" name="webhook" value="${esc(d.webhook || '')}" placeholder="https://…logic.azure.com/workflows/…" autocomplete="off">
            <button class="btn-secondary">Save</button>
            ${d.teams ? '<button type="button" class="btn-secondary" data-teams-test>Send test</button>' : ''}
          </div>
        </form>
      </details>` : ''}
      ${d.focus ? sanityFocusHtml(d) : ''}
      ${d.review ? sanityReviewHtml(d) : ''}
      ${d.help ? sanityHelpHtml() : ''}
    </div>`);

    if (drag) {
      $('#sanityPage .sc-list').each((i, el) => Sortable.create(el, {
        handle: '.sc-no', animation: 150, draggable: '.sc-row',
        onEnd: () => api('PUT', '/api/sanity/order', { productId: d.productId, ids: $('#sanityPage .sc-row').map((j, row) => $(row).data('item')).get() }).done(reloadSanity),
      }));
    }
  }

  // ---- focus mode: one case at a time, big buttons, keys; after a result it moves on to the next case not run

  const sanityQueue = (d) => sanityVisible(d);
  const autoNext = () => storage('get', 'sanityAutoNext') !== 'off';

  function sanityFocusHtml(d) {
    const queue = sanityQueue(d);
    const at = Math.max(0, queue.findIndex((it) => it.id === d.focus));
    const it = queue[at] || d.items.find((x) => x.id === d.focus);
    if (!it) return '';
    const run = sanityRuns(d);
    const left = d.items.filter((x) => x.state === 'pending').length;
    const r = retestOf(d, it);
    return `<div class="sc-focus st-${it.state}" data-item="${it.id}" role="dialog" aria-modal="true" aria-label="Focus mode">
      <div class="sc-focus-bar">
        <button class="btn-secondary" data-sc-focus-exit title="Back to the list (Esc)">${icon('close', 14)} Exit</button>
        <div class="sc-focus-progress">
          <span><b>Case ${at + 1}</b> of ${queue.length}${d.ui.status !== 'all' || d.ui.q || d.ui.module ? ' (filtered)' : ''} · ${left ? `${left} not run` : 'every case run'}</span>
          <div class="sc-bar">${['pass', 'fail', 'blocked', 'skipped'].map((st) => {
            const n = d.items.filter((x) => x.state === st).length;
            return n ? `<i class="st-${st}" style="width:${(n / d.items.length) * 100}%"></i>` : '';
          }).join('')}</div>
        </div>
        <label class="sc-auto"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sc-auto ${autoNext() ? 'checked' : ''}> Go to the next case not run</label>
        <span class="sc-saved" id="scSaved"></span>
      </div>
      <div class="sc-focus-body">
        <article class="sc-focus-card">
          <p class="sc-focus-kicker">${esc(caseGroup(it).name)} · case ${d.items.indexOf(it) + 1}
            ${r ? `<span class="sc-badge retest">${icon('flip', 11)} Retest · ${stateLabel(r.state).toLowerCase()} in ${esc(d.retest.log.version)}</span>` : ''}
            ${it.state !== 'pending' ? stateChip(it.state) : ''}</p>
          <h2 class="sc-focus-title">${esc(it.heading)}</h2>
          <div class="sc-expected">
            <span class="sc-label">Expected result</span>
            ${d.canManage && run
              ? `<textarea class="input" rows="2" data-sc-expected placeholder="What should happen (kept for every run)" maxlength="2000">${esc(it.expected)}</textarea>`
              : `<p>${esc(it.expected) || '<span class="text-slate-400">Not written yet</span>'}</p>`}
          </div>
          <div class="sc-focus-acts">${caseActions(it, run, true)}</div>
          ${caseDetail(d, it, run, true)}
        </article>
      </div>
      <div class="sc-focus-nav">
        <button class="btn-secondary" data-sc-focus-go="-1" ${at <= 0 ? 'disabled' : ''}>${icon('left', 14)} Previous</button>
        <span class="sc-keys"><kbd>P</kbd> pass <kbd>F</kbd> fail <kbd>B</kbd> blocked <kbd>N</kbd> not tested · <kbd>←</kbd><kbd>→</kbd> move · <kbd>Esc</kbd> exit</span>
        <button class="btn-secondary" data-sc-focus-go="1" ${at >= queue.length - 1 ? 'disabled' : ''}>Next ${icon('right', 14)}</button>
      </div>
    </div>`;
  }

  function focusMove(step) {
    const d = sanity;
    const queue = sanityQueue(d);
    const at = queue.findIndex((it) => it.id === d.focus);
    const to = queue[Math.min(queue.length - 1, Math.max(0, at + step))];
    if (to) { d.focus = to.id; d.ui.cursor = to.id; renderSanity(); }
  }
  // after a result: the next case not run, looking forward and then from the top
  function focusNextPending() {
    const d = sanity;
    const queue = sanityQueue(d);
    const at = queue.findIndex((it) => it.id === d.focus);
    const next = [...queue.slice(at + 1), ...queue.slice(0, Math.max(0, at))].find((it) => it.state === 'pending');
    if (next) { d.focus = next.id; d.ui.cursor = next.id; renderSanity(); }
    else { toast('Every case has a result'); renderSanity(); }
  }
  function openFocus(id) {
    const d = sanity;
    const queue = sanityQueue(d);
    if (!queue.length) { toast('No case matches these filters'); return; }
    const start = (id && queue.find((it) => it.id === id)) || queue.find((it) => it.id === d.ui.cursor) || queue.find((it) => it.state === 'pending') || queue[0];
    d.focus = start.id;
    d.review = false;
    renderSanity();
  }

  // ---- review & submit: everything a tester checks before the report goes out

  function teamsPreview({ title, facts, lines, mentions, where }) {
    const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    return `<div class="tp" aria-label="Teams message preview">
      <div class="tp-head"><span class="tp-app">FT</span><b>FlowTrace</b><span>${esc(where || 'App channel')}</span></div>
      <div class="tp-card">
        <p class="tp-title">${esc(title)}</p>
        ${lines.filter(Boolean).slice(0, 8).map((l) => `<p class="tp-line">${md(l)}</p>`).join('')}
        ${lines.length > 8 ? `<p class="tp-line muted">… and ${lines.length - 8} more</p>` : ''}
        <dl class="tp-facts">${facts.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        ${mentions.length ? `<p class="tp-at">${mentions.map((n) => `<span>@${esc(n)}</span>`).join(' ')}</p>` : ''}
        <span class="tp-btn">Open report</span>
      </div>
    </div>`;
  }

  function sanityReviewHtml(d) {
    const p = products.find((x) => x.id === d.productId);
    const count = (st) => d.items.filter((it) => it.state === st).length;
    const pending = d.items.filter((it) => it.state === 'pending');
    const bad = d.items.filter((it) => isBad(it.state));
    const version = d.run ? d.run.version : '';
    const retest = d.retest ? d.items.filter((it) => retestOf(d, it)) : [];
    const fixed = retest.filter((it) => it.state === 'pass');
    const still = retest.filter((it) => isBad(it.state));
    const names = d.recipients.map(sanityPerson).filter(Boolean);
    const tile = (st, label) => `<div class="sc-tile st-${st}"><b>${count(st)}</b><span>${label}</span></div>`;
    const ready = !pending.length && version;
    return `<div class="sc-review" role="dialog" aria-modal="true" aria-label="Review and submit">
      <div class="sc-review-card">
        <div class="sc-review-head">
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold text-slate-900">Review &amp; submit</h3>
            <p class="text-xs text-slate-500">${esc(p ? p.name : '')} · ${fmtDate(d.date)} · check the run, then the report is saved and sent</p>
          </div>
          <button class="icon-btn" data-sc-review-close title="Back to the checklist (Esc)">${icon('close', 18)}</button>
        </div>
        <div class="sc-review-body">
          <div class="sc-tiles">${tile('pass', 'Passed')}${tile('fail', 'Failed')}${tile('blocked', 'Blocked')}${tile('skipped', 'Not tested')}${tile('pending', 'Not run')}</div>

          ${pending.length ? `
          <div class="sc-note warn">${icon('clock', 14)}<div class="flex-1">
            <b>${pending.length} case${pending.length === 1 ? '' : 's'} not run yet.</b> Every case needs a result — pass, fail, blocked or not tested.
            <div class="sc-review-list">${pending.map((it) => `<button class="sc-link" data-sc-review-locate="${it.id}">${esc(it.heading)}</button>`).join('')}</div>
          </div><button class="btn-secondary" data-sc-focus-pending>${icon('focus', 14)} Test them in focus mode</button></div>`
          : `<div class="sc-note ok">${icon('check', 14)} Every case has a result.</div>`}

          ${retest.length ? `
          <div class="sc-note retest">${icon('flip', 14)}<span>Retest of ${esc(d.retest.log.version)}: <b>${fixed.length} fixed</b>, <b>${still.length} still failing</b>${retest.length - fixed.length - still.length ? `, ${retest.length - fixed.length - still.length} other` : ''}.</span></div>` : ''}

          <section>
            <h4 class="sc-review-title">Failed &amp; blocked <span>${bad.length}</span></h4>
            ${bad.map((it) => `<div class="sc-review-case st-${it.state}">
              <div class="flex flex-wrap items-center gap-2">${stateChip(it.state)}<b class="text-sm text-slate-900">${esc(it.heading)}</b>
                <span class="text-xs text-slate-500">${esc(caseGroup(it).name)}${it.ownerId ? ` · ${esc(sanityPerson(it.ownerId))}` : ''}</span>
                ${it.state === 'fail' ? notifyBadge(it) : ''}
                <button class="sc-link ml-auto" data-sc-review-locate="${it.id}">Edit</button></div>
              <dl class="sc-review-dl">
                ${it.expected ? `<dt>Expected</dt><dd>${esc(it.expected)}</dd>` : ''}
                <dt>Actual</dt><dd>${esc(it.actual) || '<span class="sc-missing">Not written — developers will ask</span>'}</dd>
                ${it.repro ? `<dt>Steps</dt><dd>${esc(it.repro)}</dd>` : ''}
                ${it.review ? `<dt>Remarks</dt><dd>${esc(it.review)}</dd>` : ''}
                <dt>Evidence</dt><dd>${it.evidence.length ? it.evidence.map((e) => `<a class="sc-link" href="${esc(e.url)}" target="_blank" rel="noopener">${icon(e.kind === 'video' ? 'play' : 'clip', 11)} ${esc(e.name)}</a>`).join(' ') : '<span class="text-slate-400">none</span>'}</dd>
              </dl>
            </div>`).join('') || '<p class="text-sm text-slate-500">Nothing failed or blocked.</p>'}
          </section>

          <section>
            <h4 class="sc-review-title">Report</h4>
            <div class="sc-review-report">
              <div class="space-y-3">
                <label class="block"><span class="field-label">Version you tested</span>
                  <input class="input w-full ${version ? '' : 'invalid'}" data-sc-version value="${esc(version)}" placeholder="e.g. 1.12.0 (245)" maxlength="60"></label>
                <div><span class="field-label">What happens</span>
                  <ul class="sc-review-steps">
                    <li>The log is saved for good in Sanity logs.</li>
                    <li>“Sanity done on ${esc(version || 'this version')}” is added to your Done today.</li>
                    <li>${d.teams ? `The report is posted on the app’s Teams channel${names.length ? `, @mentioning ${esc(names.join(', '))}` : ''}.` : 'No Teams channel for this app: nothing is posted.'}</li>
                  </ul>
                </div>
              </div>
              ${d.teams ? teamsPreview({
                title: `${count('fail') || count('blocked') ? '⚠️' : '✅'} Sanity report: ${p ? p.name : ''} — ${d.date}`,
                lines: bad.map((it) => `${it.state === 'fail' ? '❌' : '⛔'} **${it.heading}**${it.ownerId ? ` (${sanityPerson(it.ownerId)})` : ''}${it.review ? ` — ${it.review}` : ''}`),
                facts: [['Version', version || '—'], ['Date', d.date], ['Passed', `${count('pass')} / ${d.items.length}`], ['Failed', String(count('fail'))],
                  ['Blocked', count('blocked') ? String(count('blocked')) : ''], ['Not tested', count('skipped') ? String(count('skipped')) : '']],
                mentions: names,
              }) : ''}
            </div>
          </section>
        </div>
        <div class="sc-review-foot">
          <span class="text-sm text-slate-500">${ready ? `${count('pass')} passed, ${count('fail')} failed, ${count('blocked')} blocked, ${count('skipped')} not tested` : pending.length ? `${pending.length} not run` : 'Enter the version'}</span>
          <button class="btn-secondary" data-sc-review-close>Back</button>
          <button class="btn-primary" data-sc-submit ${ready ? '' : 'disabled'}>${icon('check', 14)} Submit sanity</button>
        </div>
      </div>
    </div>`;
  }

  function sanityHelpHtml() {
    const row = (keys, what) => `<li><span>${keys.map((k) => `<kbd>${k}</kbd>`).join(' ')}</span>${what}</li>`;
    return `<div class="sc-help" role="dialog" aria-label="Keyboard shortcuts">
      <div class="sc-help-card">
        <div class="flex items-center gap-2"><b class="flex-1 text-slate-900">Keyboard shortcuts</b><button class="icon-btn" data-sc-help title="Close">${icon('close', 16)}</button></div>
        <ul>
          ${row(['J', '↓'], 'Next case')}${row(['K', '↑'], 'Previous case')}
          ${row(['P'], 'Pass')}${row(['F'], 'Fail (opens the details)')}${row(['B'], 'Blocked')}${row(['N'], 'Not tested')}
          ${row(['Enter'], 'Open / close details')}${row(['X'], 'Select for bulk')}${row(['/'], 'Search')}
          ${row(['Shift', 'F'], 'Focus mode')}${row(['R'], 'Review & submit')}${row(['Esc'], 'Close / leave a field')}
          ${row(['Ctrl', 'V'], 'Paste a screenshot into the open case')}
        </ul>
      </div>
    </div>`;
  }

  // ---- logs: reports, failures across versions, and comparing two reports

  const logBar = (l) => `<span class="sc-bar small">${[['pass', l.passed], ['fail', l.failed], ['blocked', l.blocked], ['skipped', l.skipped]]
    .map(([st, n]) => (n && l.total ? `<i class="st-${st}" style="width:${(n / l.total) * 100}%"></i>` : '')).join('')}</span>`;
  const badCases = (l) => l.cases.filter((c) => isBad(c.state));

  // how the report went out on Teams
  function shareSummary(l) {
    const last = l.shares[l.shares.length - 1];
    if (!last) return l.sharedAt ? `<span class="sc-badge sent">${icon('share', 11)} On Teams</span>` : '<span class="text-xs text-slate-400">Not shared</span>';
    const ok = last.status === 'sent';
    const where = { channel: 'channel', direct: 'direct', mine: 'channel' }[last.target] || 'Teams';
    return `<span class="sc-badge ${ok ? 'sent' : 'error'}" title="${esc(last.status)}">${icon('share', 11)} ${ok ? `Sent · ${where}` : 'Not sent'}${l.shares.length > 1 ? ` · ${l.shares.length}×` : ''}</span>`;
  }

  const shownLogs = (d) => {
    const q = d.logFilter.q.trim().toLowerCase();
    return d.logs.filter((l) => (!d.logFilter.date || l.date === d.logFilter.date)
      && (!d.logFilter.bad || badCases(l).length)
      && (!q || [l.version, l.submittedBy, ...l.testers, ...badCases(l).map((c) => c.heading)].join(' ').toLowerCase().includes(q)));
  };

  function sanityLogRows(list) {
    const d = sanity;
    const run = sanityRuns(d);
    return list.map((l) => {
      const bad = badCases(l);
      return `<tr>
        <td class="whitespace-nowrap"><b class="text-slate-900">${fmtDate(l.date)}</b><div class="text-xs text-slate-500">${new Date(l.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
        <td class="font-mono text-xs">${esc(l.version)}</td>
        <td><div class="flex items-center gap-2">${logBar(l)}<span class="text-xs text-slate-600">${l.passed}/${l.total}</span></div></td>
        <td>${bad.length ? `<div class="sc-fails">${bad.slice(0, 3).map((c) => `<span class="sc-chip st-${c.state}" title="${esc(c.module)}">${esc(c.heading)}</span>`).join('')}${bad.length > 3 ? `<span class="text-xs text-slate-500">+${bad.length - 3}</span>` : ''}</div>` : '<span class="sc-chip st-pass">All passed</span>'}</td>
        <td class="text-sm">${esc(l.testers.join(', ') || l.submittedBy)}</td>
        <td>${shareSummary(l)}</td>
        <td class="whitespace-nowrap text-right">
          ${bad.length && run ? `<button class="btn-secondary px-2 py-1 text-xs" data-sc-retest-log="${l.id}" title="Mark these cases to retest in today's checklist">${icon('flip', 12)} Retest</button>` : ''}
          <a class="btn-secondary px-2 py-1 text-xs" href="/api/sanity/logs/${l.id}/export" title="Download this report">${icon('download', 12)}</a>
          <button class="btn-secondary px-2 py-1 text-xs" data-sanity-log="${l.id}">Open</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="py-10 text-center text-sm text-slate-400">No sanity matches this filter.</td></tr>';
  }

  // each case's results over the last reports (oldest → newest), the ones that failed at least once
  function failureHistory(d) {
    const logs = d.logs.slice(0, 10).reverse();
    const byCase = new Map();
    logs.forEach((l, i) => l.cases.forEach((c) => {
      if (!byCase.has(c.heading)) byCase.set(c.heading, { heading: c.heading, module: c.module, states: new Array(logs.length).fill(null) });
      byCase.get(c.heading).states[i] = c.state;
    }));
    const rows = [...byCase.values()].filter((r) => r.states.some(isBad)).map((r) => {
      const last = [...r.states].reverse().find(Boolean);
      return { ...r, last, fails: r.states.filter(isBad).length, today: d.items.find((it) => it.heading === r.heading) };
    }).sort((a, b) => (isBad(b.last) - isBad(a.last)) || (b.fails - a.fails));
    const run = sanityRuns(d);
    return `<p class="sc-tab-note">Cases that failed or were blocked in the last ${logs.length} report${logs.length === 1 ? '' : 's'}, oldest to newest. Repeat failures first.</p>
      <div class="sanity-logs-page"><table class="sanity-log-table">
        <thead><tr><th>Case</th><th>History</th><th>Failed</th><th>Last report</th><th>Today</th><th></th></tr></thead>
        <tbody>${rows.map((r) => `<tr>
          <td><b class="text-slate-900">${esc(r.heading)}</b><div class="text-xs text-slate-500">${esc(r.module || 'Other checks')}</div></td>
          <td><div class="sc-history">${r.states.map((st, i) => `<i class="st-${st || 'none'}" title="${esc(logs[i].version)} · ${fmtDate(logs[i].date)}: ${st ? stateLabel(st) : 'not in this report'}"></i>`).join('')}</div></td>
          <td class="text-sm">${r.fails} of ${r.states.filter(Boolean).length}</td>
          <td>${stateChip(r.last)}</td>
          <td>${r.today ? stateChip(r.today.state) : '<span class="text-xs text-slate-400">not on the list</span>'}</td>
          <td class="text-right">${r.today ? `<button class="btn-secondary px-2 py-1 text-xs" data-sc-open-case="${r.today.id}">${run ? `${icon('flip', 12)} Retest` : 'Open'}</button>` : ''}</td>
        </tr>`).join('') || '<tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">No failures in these reports.</td></tr>'}</tbody>
      </table></div>`;
  }

  function compareLogs(d) {
    if (d.logs.length < 2) return '<p class="sc-empty">Submit at least two sanity reports to compare versions.</p>';
    const [aId, bId] = d.compare && d.logs.some((l) => l.id === d.compare[0]) && d.logs.some((l) => l.id === d.compare[1]) ? d.compare : [d.logs[1].id, d.logs[0].id];
    const a = d.logs.find((l) => l.id === aId);
    const b = d.logs.find((l) => l.id === bId);
    const option = (l, sel) => `<option value="${l.id}" ${l.id === sel ? 'selected' : ''}>${esc(l.version)} · ${logWhen(l)}</option>`;
    const names = [...new Set([...a.cases, ...b.cases].map((c) => c.heading))];
    const st = (l, h) => (l.cases.find((c) => c.heading === h) || {}).state || null;
    const kind = (x, y) => {
      if (isBad(x) && y === 'pass') return 'fixed';
      if (isBad(y) && !isBad(x)) return 'broke';
      if (isBad(x) && isBad(y)) return 'still';
      return x === y ? 'same' : 'changed';
    };
    const rows = names.map((h) => ({ h, x: st(a, h), y: st(b, h), module: ([...a.cases, ...b.cases].find((c) => c.heading === h) || {}).module }))
      .map((r) => ({ ...r, k: kind(r.x, r.y) }));
    const LABEL = { fixed: 'Fixed', broke: 'New failure', still: 'Still failing', changed: 'Changed', same: 'Same' };
    const order = ['broke', 'still', 'fixed', 'changed', 'same'];
    const shown = rows.filter((r) => d.allChanges || r.k !== 'same').sort((p, q) => order.indexOf(p.k) - order.indexOf(q.k));
    const n = (k) => rows.filter((r) => r.k === k).length;
    return `<div class="sc-compare-pick">
        <label><span class="field-label">From</span><select class="input" data-sc-compare="0">${d.logs.map((l) => option(l, aId)).join('')}</select></label>
        ${icon('right', 16)}
        <label><span class="field-label">To</span><select class="input" data-sc-compare="1">${d.logs.map((l) => option(l, bId)).join('')}</select></label>
        <div class="sc-compare-sum">
          <span class="sc-chip k-broke">${n('broke')} new failure${n('broke') === 1 ? '' : 's'}</span>
          <span class="sc-chip k-still">${n('still')} still failing</span>
          <span class="sc-chip k-fixed">${n('fixed')} fixed</span>
          <span class="sc-chip">${n('changed')} changed · ${n('same')} same</span>
        </div>
      </div>
      <div class="sanity-logs-page"><table class="sanity-log-table">
        <thead><tr><th>Case</th><th>${esc(a.version)}</th><th>${esc(b.version)}</th><th>Change</th></tr></thead>
        <tbody>${shown.map((r) => `<tr class="k-${r.k}">
          <td><b class="text-slate-900">${esc(r.h)}</b><div class="text-xs text-slate-500">${esc(r.module || 'Other checks')}</div></td>
          <td>${r.x ? stateChip(r.x) : '<span class="text-xs text-slate-400">—</span>'}</td>
          <td>${r.y ? stateChip(r.y) : '<span class="text-xs text-slate-400">—</span>'}</td>
          <td><span class="sc-chip k-${r.k}">${LABEL[r.k]}</span></td>
        </tr>`).join('') || '<tr><td colspan="4" class="py-8 text-center text-sm text-slate-400">No differences.</td></tr>'}</tbody>
      </table></div>
      <label class="sc-tab-note flex items-center gap-2"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sc-all-changes ${d.allChanges ? 'checked' : ''}> Show unchanged cases too</label>`;
  }

  function renderSanityLogs() {
    const d = sanity;
    const latest = d.logs[0];
    const passRate = d.logs.length ? Math.round((d.logs.reduce((n, l) => n + l.passed, 0) / Math.max(1, d.logs.reduce((n, l) => n + l.total, 0))) * 100) : 0;
    const tab = d.logsTab;
    const tabBtn = (k, label) => `<button data-sc-logs-tab="${k}" class="${tab === k ? 'on' : ''}">${label}</button>`;
    $('#sanityPage').html(`<div class="sanity-page sc-page">
      ${sanityHeader(d, 'Sanity logs', 'Every submitted sanity, kept for good. Find failures, compare versions and retest fixes.')}
      ${d.logs.length ? `
      <div class="sanity-log-stats">
        <div><span>Last tested version</span><b class="font-mono">${esc(latest.version)}</b><small>${logWhen(latest)}</small></div>
        <div><span>Last result</span><b>${latest.passed} / ${latest.total}</b><small>${badCases(latest).length ? `${latest.failed} failed${latest.blocked ? `, ${latest.blocked} blocked` : ''}` : 'all passed'}</small></div>
        <div><span>Open failures</span><b>${badCases(latest).length}</b><small>${badCases(latest).length ? 'from the last report' : 'none'}</small></div>
        <div><span>Pass rate</span><b>${passRate}%</b><small>over ${d.logs.length} report${d.logs.length === 1 ? '' : 's'}</small></div>
      </div>` : ''}
      <div class="sc-logs-tabs">
        <div class="seg">${tabBtn('reports', `${icon('note', 12)} Reports`)}${tabBtn('failures', `${icon('close', 12)} Failures`)}${tabBtn('compare', `${icon('compare', 12)} Compare versions`)}</div>
      </div>
      ${!d.logs.length ? '<p class="sc-empty">No sanity submitted yet. Run the checklist and submit it to start the log.</p>'
        : tab === 'failures' ? failureHistory(d)
          : tab === 'compare' ? compareLogs(d)
            : `
      <div class="flex flex-wrap items-center gap-2 px-5 pt-4">
        <label class="sc-search flex-1">${icon('search', 14)}<input class="input" data-log-search value="${esc(d.logFilter.q)}" placeholder="Search version, person or a failed case" autocomplete="off"></label>
        <input type="date" class="input py-1 text-sm" data-log-date value="${d.logFilter.date}" max="${d.today}" title="Only this day">
        <button class="sc-filter st-fail ${d.logFilter.bad ? 'on' : ''}" data-log-bad>With failures</button>
        ${d.logFilter.date || d.logFilter.q || d.logFilter.bad ? '<button class="sc-link" data-log-clear>Clear</button>' : ''}
      </div>
      <div class="sanity-logs-page">
        <table class="sanity-log-table">
          <thead><tr><th>Date</th><th>Version</th><th>Result</th><th>Failed / blocked</th><th>Done by</th><th>Teams</th><th></th></tr></thead>
          <tbody id="sanityLogRows">${sanityLogRows(shownLogs(d))}</tbody>
        </table>
      </div>`}
    </div>`);
  }

  const sanityItemOf = (el) => sanity.items.find((it) => it.id === $(el).closest('[data-item]').data('item'));

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
  $doc.on('change', '[data-log-date]', function () { filterLogs({ date: this.value }); renderSanity(); });
  $doc.on('click', '[data-log-bad]', () => { sanity.logFilter.bad = !sanity.logFilter.bad; renderSanity(); });
  $doc.on('click', '[data-log-clear]', () => { Object.assign(sanity.logFilter, { q: '', date: '', bad: false }); renderSanity(); });
  $doc.on('click', '[data-sc-logs-tab]', function () { sanity.logsTab = $(this).data('sc-logs-tab'); renderSanity(); });
  $doc.on('change', '[data-sc-compare]', function () {
    const d = sanity;
    const pair = d.compare || [d.logs[1].id, d.logs[0].id];
    pair[Number($(this).data('sc-compare'))] = this.value;
    d.compare = pair;
    renderSanity();
  });
  $doc.on('change', '[data-sc-all-changes]', function () { sanity.allChanges = this.checked; renderSanity(); });
  // retest the failures of a report: today's checklist with those cases flagged and shown
  function retestFromLog(id) {
    if (sanityLog) closeSanityLog();
    Object.assign(sanity, { retestLog: id, view: 'sheet', focus: null, review: false });
    Object.assign(sanity.ui, { status: 'retest', q: '', module: '' });
    openSanity(sanity.productId, null, 'sheet');
  }
  $doc.on('click', '[data-sc-retest-log]', function () { retestFromLog($(this).data('sc-retest-log')); });
  $doc.on('click', '[data-sc-retest-clear]', () => { sanity.retestLog = null; renderSanity(); });
  // a case from the logs: today's checklist, that case open
  $doc.on('click', '[data-sc-open-case]', function () {
    const id = $(this).data('sc-open-case');
    Object.assign(sanity, { view: 'sheet', focus: null, review: false });
    Object.assign(sanity.ui, { status: 'all', q: '', module: '', cursor: id });
    sanity.ui.open.add(id);
    sanity.ui.shut.delete(caseGroup(sanity.items.find((it) => it.id === id)).key);
    openSanity(sanity.productId, null, 'sheet').done(() => {
      const $row = $(`#sanityPage .sc-row[data-item="${id}"]`);
      if ($row.length) $row[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  $doc.on('change', '[data-sanity-date]', function () { if (this.value) openSanity(sanity.productId, this.value); });
  $doc.on('click', '[data-sanity-today]', () => openSanity(sanity.productId));
  $doc.on('submit', '#sanityRun', function (e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(this));
    // load(): the header shows the new present version
    api('PUT', '/api/sanity/run', { productId: sanity.productId, version: v.version, time: v.time }).done(() => { toast('Saved'); reloadSanity(); load(); });
  });

  // filters, search, groups
  $doc.on('click', '[data-sc-status]', function () { sanity.ui.status = $(this).data('sc-status'); sanity.ui.selected.clear(); renderSanity(); });
  $doc.on('input', '[data-sc-search]', function () { sanity.ui.q = this.value; renderSanity(); });
  $doc.on('change', '[data-sc-module]', function () { sanity.ui.module = this.value; renderSanity(); });
  $doc.on('click', '[data-sc-clear-filters]', () => { Object.assign(sanity.ui, { q: '', module: '', status: 'all' }); renderSanity(); });
  $doc.on('click', '[data-sc-group]', function () {
    const k = $(this).data('sc-group');
    if (sanity.ui.shut.has(k)) sanity.ui.shut.delete(k); else sanity.ui.shut.add(k);
    renderSanity();
  });
  $doc.on('click', '[data-sc-expand]', function () {
    const all = $(this).data('sc-expand') === 'all';
    sanityVisible(sanity).forEach((it) => (all ? sanity.ui.open.add(it.id) : sanity.ui.open.delete(it.id)));
    renderSanity();
  });
  $doc.on('click', '[data-sc-toggle]', function () {
    const it = sanityItemOf(this);
    if (sanity.ui.open.has(it.id)) sanity.ui.open.delete(it.id); else sanity.ui.open.add(it.id);
    sanity.ui.cursor = it.id;
    renderSanity();
  });
  $doc.on('click', '[data-sc-help]', () => { sanity.help = !sanity.help; renderSanity(); });

  // marking, one or many
  $doc.on('click', '[data-sc-state]', function () {
    const it = sanityItemOf(this);
    sanity.ui.cursor = it.id;
    const was = it.state;
    setSanityState([it.id], $(this).data('sc-state'));
    if (sanity.focus && autoNext() && it.state !== 'fail' && it.state !== 'pending' && was !== it.state) setTimeout(focusNextPending, 250);
  });
  $doc.on('change', '[data-sc-select]', function () {
    const it = sanityItemOf(this);
    if (this.checked) sanity.ui.selected.add(it.id); else sanity.ui.selected.delete(it.id);
    renderSanity();
  });
  $doc.on('change', '[data-sc-select-all]', function () {
    const ids = sanityVisible(sanity).map((it) => it.id);
    sanity.ui.selected = this.checked ? new Set(ids) : new Set();
    renderSanity();
  });
  $doc.on('click', '[data-sc-select-none]', () => { sanity.ui.selected.clear(); renderSanity(); });
  $doc.on('click', '[data-sc-bulk]', function () {
    const ids = [...sanity.ui.selected];
    const state = $(this).data('sc-bulk');
    const go = () => { setSanityState(ids, state); sanity.ui.selected.clear(); renderSanity(); };
    if (state === 'fail' && ids.length > 1) {
      dialog.confirm({ title: `Mark ${ids.length} cases failed?`, message: sanity.teams ? 'One message lists them on Teams, @mentioning their developers.' : 'Write what happened on each of them afterwards.', confirmText: 'Mark failed', danger: true, onConfirm: go });
    } else go();
  });

  // details: saved as they are typed
  $doc.on('input', '[data-sc-field]', function () { saveCaseField(sanityItemOf(this), $(this).data('sc-field'), this.value); autoGrow(this); });
  $doc.on('input', '[data-sc-cell]', function () { saveCaseCell(sanityItemOf(this), $(this).data('sc-cell'), this.value); });
  $doc.on('input', '[data-sc-expected]', function () { saveExpected(sanityItemOf(this), this.value); autoGrow(this); });
  $doc.on('change', '[data-sc-owner]', function () {
    const it = sanityItemOf(this);
    const ownerId = this.value || null;
    api('PATCH', `/api/sanity/items/${it.id}`, { ownerId: ownerId || '' }, null, QUIET)
      .done(() => { it.ownerId = ownerId; scSavedAt = new Date(); renderSanity(); })
      .fail((xhr) => dialog.alert(errorText(xhr), 'Not saved'));
  });
  $doc.on('change', '[data-sc-evidence]', function () { const it = sanityItemOf(this); const files = [...this.files]; this.value = ''; uploadEvidence(it, files); });
  $doc.on('click', '[data-sc-evidence-remove]', function () {
    const it = sanityItemOf(this);
    const id = $(this).data('sc-evidence-remove');
    dialog.confirm({
      title: 'Remove this file?', message: 'It is taken off the case and deleted.', confirmText: 'Remove', danger: true,
      onConfirm: () => api('DELETE', `/api/sanity/items/${it.id}/evidence/${id}`, null, null, QUIET).done((r) => { it.evidence = r.evidence; renderSanity(); }),
    });
  });
  // a screenshot pasted while a case is open (focus mode, the case being typed in, or the one the cursor is on)
  document.addEventListener('paste', (e) => {
    const d = sanity;
    if (!d || d.view !== 'sheet' || d.review || !sanityRuns(d) || !d.evidence) return;
    const files = [...((e.clipboardData && e.clipboardData.files) || [])].filter((f) => /^(image|video)\//.test(f.type));
    if (!files.length) return;
    const inCase = $(e.target).closest('[data-item]').data('item');
    const id = d.focus || inCase || (d.ui.open.has(d.ui.cursor) ? d.ui.cursor : null);
    const it = id && d.items.find((x) => x.id === id);
    if (!it) { toast('Open a case first, then paste'); return; }
    e.preventDefault();
    uploadEvidence(it, files.map((f) => (f.name && f.name !== 'image.png' ? f : new File([f], `Screenshot ${timeText(new Date())}.png`, { type: f.type }))));
  });

  // focus mode
  $doc.on('click', '[data-sc-focus]', () => openFocus());
  $doc.on('click', '[data-sc-focus-exit]', () => { sanity.ui.cursor = sanity.focus; sanity.focus = null; renderSanity(); });
  $doc.on('click', '[data-sc-focus-go]', function () { focusMove(Number($(this).data('sc-focus-go'))); });
  $doc.on('change', '[data-sc-auto]', function () { storage('set', 'sanityAutoNext', this.checked ? 'on' : 'off'); });

  // review & submit
  $doc.on('click', '[data-sc-review]', () => { flushSanitySaves(); Object.assign(sanity, { review: true, focus: null, help: false }); renderSanity(); });
  $doc.on('click', '[data-sc-review-close]', () => { sanity.review = false; renderSanity(); });
  $doc.on('click', '[data-sc-review-locate]', function () {
    const id = $(this).data('sc-review-locate');
    Object.assign(sanity, { review: false });
    Object.assign(sanity.ui, { status: 'all', q: '', module: '', cursor: id });
    sanity.ui.open.add(id);
    renderSanity();
    const $row = $(`#sanityPage .sc-row[data-item="${id}"]`);
    if ($row.length) $row[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $doc.on('click', '[data-sc-focus-pending]', () => {
    Object.assign(sanity.ui, { status: 'pending', q: '', module: '' });
    sanity.review = false;
    openFocus();
  });
  $doc.on('input', '[data-sc-version]', function () {
    const d = sanity;
    d.run = { ...(d.run || {}), version: this.value.trim() };
    $(this).toggleClass('invalid', !this.value.trim());
    $('#sanityRun [name=version]').val(this.value);
    sanityAutosave('run:version', () => api('PUT', '/api/sanity/run', { productId: d.productId, version: d.run.version, time: d.run.time || '' }, null, QUIET));
    // the button and summary follow (the field keeps focus through the redraw)
    renderSanity();
  });
  // Submit: checked here, then by the server, which saves the log, adds the submitter's "done today" and sends the report
  $doc.on('click', '[data-sc-submit]', function () {
    const d = sanity;
    const version = (d.run && d.run.version || '').trim();
    const unchecked = d.items.filter((it) => it.state === 'pending');
    if (!version || unchecked.length) { d.missing = new Set(unchecked.map((it) => it.id)); renderSanity(); return; }
    flushSanitySaves().always(() => api('POST', '/api/sanity/submit', { productId: d.productId, version }, this, QUIET)
      .done((r) => {
        d.missing = new Set();
        d.review = false;
        d.retestLog = null;
        toast('Sanity submitted: log saved');
        teamsResult(r.teams, 'Sanity submitted: report sent on Teams');
        reloadSanity();
        load();
      })
      .fail((xhr) => {
        const missing = xhr.responseJSON && xhr.responseJSON.missing;
        if (missing) d.missing = new Set(missing);
        renderSanity();
        dialog.alert(errorText(xhr), 'Sanity is not complete');
      }));
  });

  // keyboard: moving, marking, opening, selecting; focus mode has its own few keys
  $doc.on('keydown', (e) => {
    const d = sanity;
    if (!d || d.view !== 'sheet' || dialog.isOpen() || teamsSend || sanityLog || e.metaKey || e.ctrlKey || e.altKey) return;
    if ($(e.target).is('input, textarea, select, [contenteditable]')) {
      if (e.key === 'Escape') e.target.blur(); // the first Esc only leaves the field
      return;
    }
    if (d.review) return;
    const run = sanityRuns(d);
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const mark = { p: 'pass', f: 'fail', b: 'blocked', n: 'skipped' }[key];
    if (e.key === '?') { e.preventDefault(); d.help = !d.help; renderSanity(); return; }
    if (d.help) return;
    if (d.focus) {
      if (mark && run && !e.shiftKey) { e.preventDefault(); $(`#sanityPage .sc-focus [data-sc-state="${mark}"]`).trigger('click'); }
      else if (key === 'ArrowRight' || key === 'j') { e.preventDefault(); focusMove(1); }
      else if (key === 'ArrowLeft' || key === 'k') { e.preventDefault(); focusMove(-1); }
      return;
    }
    const ids = $('#sanityPage .sc-row').map((i, el) => $(el).data('item')).get();
    const at = ids.indexOf(d.ui.cursor);
    const moveTo = (i) => {
      const id = ids[Math.min(ids.length - 1, Math.max(0, i))];
      if (!id) return;
      d.ui.cursor = id;
      $('#sanityPage .sc-row.cursor').removeClass('cursor');
      const $row = $(`#sanityPage .sc-row[data-item="${id}"]`).addClass('cursor');
      $row[0].scrollIntoView({ block: 'nearest' });
    };
    if (key === 'j' || key === 'ArrowDown') { e.preventDefault(); moveTo(at + 1); }
    else if (key === 'k' || key === 'ArrowUp') { e.preventDefault(); moveTo(at < 0 ? 0 : at - 1); }
    else if (key === '/') { e.preventDefault(); $('#sanityPage [data-sc-search]').trigger('focus'); }
    else if (key === 'f' && e.shiftKey) { if (run) { e.preventDefault(); openFocus(); } }
    else if (key === 'r' && run) { e.preventDefault(); $('#sanityPage [data-sc-review]').first().trigger('click'); }
    else if (at < 0) { /* the rest needs a case under the cursor */ }
    else if (key === 'Enter' || key === 'o') {
      e.preventDefault();
      if (d.ui.open.has(d.ui.cursor)) d.ui.open.delete(d.ui.cursor); else d.ui.open.add(d.ui.cursor);
      renderSanity();
    } else if (key === 'x' && run) {
      e.preventDefault();
      if (d.ui.selected.has(d.ui.cursor)) d.ui.selected.delete(d.ui.cursor); else d.ui.selected.add(d.ui.cursor);
      renderSanity();
    } else if (mark && run) {
      e.preventDefault();
      const id = d.ui.cursor;
      setSanityState([id], mark);
      // on to the next case, except after a failure (its details come first)
      if (mark !== 'fail') { const next = ids[at + 1]; if (next) { d.ui.cursor = next; renderSanity(); } }
    }
  });
  // Esc: help, then focus mode, then review (called from the page-wide Esc handler)
  function sanityEscape() {
    if (sanity.help) sanity.help = false;
    else if (sanity.focus) { sanity.ui.cursor = sanity.focus; sanity.focus = null; }
    else sanity.review = false;
    renderSanity();
  }

  // the list itself: extra fields, sharing a failure again, recipients, adding / removing cases, Teams channel
  $doc.on('click', '[data-col-add]', () => ask({
    title: 'New field on every case', fields: [{ name: 'name', label: 'Field name', placeholder: 'e.g. Device, Build no., Tested on', required: true, max: 60 }],
    confirmText: 'Add field',
    save: (v) => api('POST', '/api/sanity/columns', { productId: sanity.productId, name: v.name }, null, QUIET).done(reloadSanity),
  }));
  $doc.on('click', '[data-col-rename]', function () {
    const c = sanity.columns.find((x) => x.id === $(this).data('col-rename'));
    ask({
      title: 'Rename field', fields: [{ name: 'name', label: 'Field name', value: c.name, required: true, max: 60 }],
      save: (v) => api('PATCH', `/api/sanity/columns/${c.id}`, v, null, QUIET).done(reloadSanity),
    });
  });
  $doc.on('click', '[data-col-delete]', function () {
    const c = sanity.columns.find((x) => x.id === $(this).data('col-delete'));
    dialog.confirm({
      title: `Delete field “${c.name}”?`, message: 'It disappears from every case and the Excel download.', confirmText: 'Delete', danger: true,
      onConfirm: () => api('DELETE', `/api/sanity/columns/${c.id}`, null, null, QUIET).done(reloadSanity),
    });
  });
  $doc.on('click', '[data-sanity-share]', function () {
    const it = sanity.items.find((x) => x.id === $(this).data('sanity-share'));
    flushSanitySaves().always(() => api('POST', '/api/sanity/share', { productId: sanity.productId, itemId: it.id }, this)
      .done((r) => { it.notifyStatus = r.teams; if (r.teams === 'sent') it.sharedAt = new Date().toISOString(); teamsResult(r.teams, 'Shared on Teams'); renderSanity(); }));
  });
  $doc.on('change', '[data-sanity-recipient]', () => {
    const userIds = $('[data-sanity-recipient]:checked').map((i, el) => el.value).get();
    api('PUT', '/api/sanity/recipients', { productId: sanity.productId, userIds }).done(() => { sanity.recipients = userIds; toast('Saved'); });
  });
  $doc.on('click', '[data-sanity-log]', function () { openSanityLog($(this).data('sanity-log')); });
  $doc.on('click', '[data-sanity-delete]', function () {
    const it = sanity.items.find((x) => x.id === $(this).data('sanity-delete'));
    dialog.confirm({
      title: `Remove “${it.heading}”?`, message: 'It leaves the sanity list (earlier days keep their result). The flow itself stays.', confirmText: 'Remove', danger: true,
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
  $doc.on('submit', '#sanityTeamsForm', function (e) {
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
  // Typed columns (text, number, date, dropdown, checkbox, person, flow, screen), search, Excel-like filters, sort,
  // totals, drag to reorder rows, sharing (private / app can view / app can edit + editors), Excel download and import.
  // A cell saves on its own (only that cell is sent), so the grid is not redrawn while you type.

  const SHEET_TYPES = {
    text: 'Text', number: 'Number', date: 'Date', select: 'Dropdown', checkbox: 'Checkbox', person: 'Person', flow: 'Flow', screen: 'Screen',
  };
  const SHEET_SHARES = [['private', 'Private: only me and editors'], ['view', 'Everyone in the app can view'], ['edit', 'Everyone in the app can edit']];
  const TONE_TAG = { success: 'green', pending: 'amber', fail: 'red', other: 'slate' }; // dropdown value → status tag colour

  // { productId, list, people, canCreate, teams, doc, search, sort: { col, dir }, picked: Set of row ids (to send on Teams),
  //   filters: { columnId: { values, op, a, b, color } } (kept per sheet in this browser) }
  let sheetsView = null;

  // Sheets is a page of its own, in the board's place (like Sanity), using the whole window;
  // the address (#sheets=<app>&sheet=<id>) keeps it
  function openSheets(pid, sheetId) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return; }
    api('GET', `/api/sheets?product=${encodeURIComponent(pid)}`).done((d) => {
      if (sanity) closeSanity();
      const keep = sheetsView && sheetsView.productId === pid ? sheetsView : {};
      sheetsView = {
        productId: pid, list: d.sheets, people: d.people, canCreate: d.canCreate, teams: d.teams, doc: null,
        search: keep.search || '', sort: keep.sort || null, picked: new Set(), filters: keep.filters || {}, sheetPicks: keep.sheetPicks || new Set(),
      };
      const id = sheetId || (keep.doc && d.sheets.some((x) => x.id === keep.doc.id) ? keep.doc.id : d.sheets[0] && d.sheets[0].id);
      $('#board, #tabs').addClass('hidden');
      $('#sheetsPage').removeClass('hidden');
      $('body').addClass('sheets-open');
      $('[data-action="sheets"]').addClass('on');
      if (!keep.productId) window.scrollTo(0, 0);
      if (id) openSheetDoc(id); else renderSheets();
    });
  }
  const savedFilters = (id) => { try { return JSON.parse(storage('get', `sheetFilters.${id}`) || '{}') || {}; } catch (e) { return {}; } };
  const saveFilters = () => sheetsView.doc && storage('set', `sheetFilters.${sheetsView.doc.id}`, JSON.stringify(sheetsView.filters));
  function openSheetDoc(id) {
    return api('GET', `/api/sheets/${id}`).done((doc) => {
      if (!sheetsView.doc || sheetsView.doc.id !== id) {
        sheetsView.sort = null; sheetsView.search = ''; sheetsView.picked = new Set(); sheetsView.filters = savedFilters(id);
      }
      sheetsView.doc = doc;
      sheetsView.picked = new Set([...sheetsView.picked].filter((r) => doc.rowList.some((x) => x.id === r)));
      Object.keys(sheetsView.filters).forEach((c) => { if (!doc.columns.some((x) => x.id === c)) delete sheetsView.filters[c]; });
      renderSheets();
    });
  }
  const reloadSheet = () => sheetsView && sheetsView.doc && openSheetDoc(sheetsView.doc.id);
  const reloadSheets = (id) => sheetsView && openSheets(sheetsView.productId, id);

  function closeSheets() {
    closeFilter();
    sheetsView = null;
    $('#sheetsPage').addClass('hidden').empty();
    $('#board, #tabs').removeClass('hidden');
    $('body').removeClass('sheets-open');
    $('[data-action="sheets"]').removeClass('on');
    history.replaceState(null, '', location.pathname + location.search);
  }

  // black or white text, whichever reads better on a fill
  const readable = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111827' : '#ffffff';
  };
  // a dropdown value's look: its own fill (e.g. from Excel, drawn in full) with its text colour, or only a text
  // colour (a tint of it), else the usual one from its word
  const optionStyle = (col, v) => {
    const bg = (col.colors || {})[v];
    const fg = (col.fonts || {})[v];
    if (bg) return { cls: 'st solid', style: `style="--c:${bg};--cf:${fg || readable(bg)}"` };
    if (fg) return { cls: 'st custom', style: `style="--c:${fg}"` };
    return { cls: `st st-${TONE_TAG[tone(v)]}`, style: '' };
  };
  // a cell's own look from an imported Excel (fill, text colour, bold); dropdowns show their option's colour instead
  function cellLook(col, row) {
    const s = (row.styles || {})[col.id];
    if (!s) return '';
    const bg = col.type === 'select' ? null : s.bg;
    const fg = col.type === 'select' ? null : s.fg || (bg ? readable(bg) : null);
    if (!bg && !fg && !s.b) return '';
    return `class="sc-styled" style="${bg ? `background:${bg};` : ''}${fg ? `--sc-fg:${fg};` : ''}${s.b ? '--sc-w:600;' : ''}"`;
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
      case 'select': {
        const look = has ? optionStyle(col, v) : { cls: '', style: '' };
        return `<select class="sc-input sc-select ${look.cls}" ${look.style} ${attrs}>${none}${col.options.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      }
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

  // ---- filters, like Excel's: per column a tick list of its values, a condition (contains, >, between, before …)
  // and a colour (fill or text colour); a row is shown when it passes every column's filter

  const FILTER_OPS = {
    text: [['contains', 'Contains'], ['notContains', 'Does not contain'], ['equals', 'Equals'], ['notEquals', 'Does not equal'],
      ['begins', 'Begins with'], ['ends', 'Ends with'], ['empty', 'Is empty'], ['notEmpty', 'Is not empty']],
    number: [['eq', 'Equals'], ['ne', 'Does not equal'], ['gt', 'Greater than'], ['gte', 'Greater than or equal'], ['lt', 'Less than'],
      ['lte', 'Less than or equal'], ['between', 'Between'], ['empty', 'Is empty'], ['notEmpty', 'Is not empty']],
    date: [['on', 'On'], ['before', 'Before'], ['after', 'After'], ['between', 'Between'], ['empty', 'Is empty'], ['notEmpty', 'Is not empty']],
  };
  const NO_ARGS = ['empty', 'notEmpty'];
  const kindOf = (col) => (col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text');
  const blank = (v) => v === '' || v === undefined || v === null;
  // a cell as its filter lists it ('' = blank)
  const filterKey = (col, v) => (col.type === 'checkbox' ? (v === true ? 'Yes' : 'No') : blank(v) ? '' : cellText(col, v));
  // the colour a cell shows ('' = none)
  function cellColour(col, row) {
    const v = row.cells[col.id];
    if (col.type === 'select') return blank(v) ? '' : (col.colors || {})[v] || (col.fonts || {})[v] || '';
    const s = (row.styles || {})[col.id];
    return (s && (s.bg || s.fg)) || '';
  }

  function passes(col, row, f) {
    const v = row.cells[col.id];
    if (f.values && !f.values.includes(filterKey(col, v))) return false;
    if (f.color !== undefined && cellColour(col, row) !== f.color) return false;
    if (!f.op) return true;
    const { op, a = '', b = '' } = f;
    if (op === 'empty') return blank(v);
    if (op === 'notEmpty') return !blank(v);
    if (blank(v)) return op === 'notContains' || op === 'notEquals' || op === 'ne';
    if (col.type === 'number') {
      const n = Number(v);
      const x = Number(a);
      const y = Number(b);
      return { eq: n === x, ne: n !== x, gt: n > x, gte: n >= x, lt: n < x, lte: n <= x, between: n >= Math.min(x, y) && n <= Math.max(x, y) }[op];
    }
    if (col.type === 'date') {
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      return { on: v === a, before: v < a, after: v > a, between: v >= lo && v <= hi }[op];
    }
    const s = filterKey(col, v).toLowerCase();
    const q = String(a).toLowerCase();
    return { contains: s.includes(q), notContains: !s.includes(q), equals: s === q, notEquals: s !== q, begins: s.startsWith(q), ends: s.endsWith(q) }[op];
  }

  // rows after search, filters and sort (sorting is only a view; drag order is what is saved).
  // except: leave that column's own filter out, unsorted (the values its filter lists, like Excel)
  function sheetRows(except) {
    const { doc, search, sort, filters } = sheetsView;
    let rows = doc.rowList;
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((r) => doc.columns.some((c) => cellText(c, r.cells[c.id]).toLowerCase().includes(q)));
    doc.columns.forEach((c) => {
      const f = filters[c.id];
      if (f && c.id !== except) rows = rows.filter((r) => passes(c, r, f));
    });
    if (except) return rows;
    const col = sort && doc.columns.find((c) => c.id === sort.col);
    if (col) {
      const key = (r) => (col.type === 'number' ? (blank(r.cells[col.id]) ? null : Number(r.cells[col.id])) : cellText(col, r.cells[col.id]).toLowerCase());
      rows = rows.slice().sort((a, b) => {
        const x = key(a); const y = key(b);
        if (x === null || x === '') return 1; if (y === null || y === '') return -1; // empty last
        return (typeof x === 'number' ? x - y : x.localeCompare(y, undefined, { numeric: true })) * sort.dir;
      });
    }
    return rows;
  }
  const filtered = () => sheetsView.doc.columns.filter((c) => sheetsView.filters[c.id]);

  function closeFilter() { $('#sheetFilterPop').remove(); }
  // scrolling the grid closes it, but not the scroll that brought its button into view
  let filterOpenedAt = 0;
  const closeFilterOnScroll = () => { if (Date.now() - filterOpenedAt > 300) closeFilter(); };

  function openFilter(colId, anchor) {
    const { doc } = sheetsView;
    const col = doc.columns.find((c) => c.id === colId);
    if (!col) return;
    const f = sheetsView.filters[colId] || {};
    const base = sheetRows(colId);
    const counts = new Map();
    const colours = new Map();
    base.forEach((r) => {
      const k = filterKey(col, r.cells[col.id]);
      counts.set(k, (counts.get(k) || 0) + 1);
      const c = cellColour(col, r);
      colours.set(c, (colours.get(c) || 0) + 1);
    });
    // values the filter hides stay in the list (unticked) when no other column hides them
    (f.values || []).forEach((k) => { if (!counts.has(k)) counts.set(k, 0); });
    const order = col.type === 'select' ? (k) => (k === '' ? 1e6 : col.options.indexOf(k)) : null;
    const keys = [...counts.keys()].sort((a, b) => {
      if (a === '') return 1; if (b === '') return -1;
      if (order) return order(a) - order(b);
      if (col.type === 'number') return Number(a) - Number(b);
      return a.localeCompare(b, undefined, { numeric: true });
    });
    const label = (k) => (k === '' ? '(Blanks)' : col.type === 'date' ? fmtDate(k) : k);
    const dot = (k) => {
      const hex = col.type === 'select' && k ? (col.colors || {})[k] || (col.fonts || {})[k] : null;
      return hex ? `<i class="sf-dot" style="background:${hex}"></i>` : '';
    };
    const kind = kindOf(col);
    const sorts = { number: ['Smallest to largest', 'Largest to smallest'], date: ['Oldest to newest', 'Newest to oldest'], text: ['Sort A to Z', 'Sort Z to A'] }[kind];
    const input = kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text';
    const showColours = colours.size > 1 || f.color !== undefined;
    closeFilter();
    filterOpenedAt = Date.now();
    const $pop = $(`<div id="sheetFilterPop" class="sf-pop" data-col="${col.id}">
      <div class="sf-head"><span class="sc-type">${SHEET_TYPES[col.type]}</span><b class="truncate">${esc(col.name)}</b></div>
      <button type="button" class="sf-item" data-sf-sort="1">${icon('up', 13)} ${sorts[0]}</button>
      <button type="button" class="sf-item" data-sf-sort="-1">${icon('down', 13)} ${sorts[1]}</button>
      ${showColours ? `<div class="sf-sec">Filter by colour</div>
        <div class="sf-colors">${[...colours.keys()].sort().map((c) => `<button type="button" class="sf-swatch ${f.color === c ? 'on' : ''}" data-sf-color="${c}"
          title="${c || 'No colour'} · ${colours.get(c) || 0}" ${c ? `style="background:${c}"` : ''}>${c ? '' : '∅'}</button>`).join('')}</div>` : ''}
      <div class="sf-sec">Condition</div>
      <select class="input w-full py-1 text-xs" data-sf-op><option value="">None</option>
        ${FILTER_OPS[kind].map(([k, l]) => `<option value="${k}" ${f.op === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <div class="sf-args"><input class="input w-full py-1 text-xs" type="${input}" step="any" data-sf-a value="${esc(f.a || '')}" placeholder="Value">
        <input class="input w-full py-1 text-xs" type="${input}" step="any" data-sf-b value="${esc(f.b || '')}" placeholder="and"></div>
      <div class="sf-sec">Values</div>
      <input class="input w-full py-1 text-xs" type="search" placeholder="Search values" data-sf-q>
      <div class="sf-list">
        <label class="sf-val sf-all"><input type="checkbox" class="h-3.5 w-3.5 accent-indigo-600" data-sf-all> <span>(Select all)</span></label>
        ${keys.slice(0, 1000).map((k) => `
          <label class="sf-val" data-sf-key="${esc(label(k).toLowerCase())}"><input type="checkbox" class="h-3.5 w-3.5 accent-indigo-600" data-sf-val value="${esc(k)}" ${!f.values || f.values.includes(k) ? 'checked' : ''}>
            ${dot(k)}<span class="min-w-0 flex-1 truncate">${esc(label(k))}</span><span class="sf-count">${counts.get(k)}</span></label>`).join('')}
        ${keys.length > 1000 ? `<p class="px-1 py-1 text-xs text-slate-400">${keys.length - 1000} more: search to find them</p>` : ''}
      </div>
      <div class="sf-actions">
        <button type="button" class="mr-auto text-xs text-indigo-600 hover:underline" data-sf-clear>Clear filter</button>
        <button type="button" class="btn-secondary py-1 text-xs" data-sf-cancel>Cancel</button>
        <button type="button" class="btn-primary py-1 text-xs" data-sf-ok>OK</button>
      </div></div>`).appendTo('body');
    const box = anchor.getBoundingClientRect();
    const w = $pop.outerWidth();
    $pop.css({ left: Math.max(8, Math.min(box.left, window.innerWidth - w - 8)), top: box.bottom + 4, maxHeight: window.innerHeight - box.bottom - 16 });
    filterArgs();
    filterAll();
  }
  // the condition's inputs: none for "is empty", two for "between"
  function filterArgs() {
    const op = $('#sheetFilterPop [data-sf-op]').val();
    $('#sheetFilterPop .sf-args').toggleClass('hidden', !op || NO_ARGS.includes(op));
    $('#sheetFilterPop [data-sf-b]').toggleClass('hidden', op !== 'between');
  }
  // "(Select all)" ticked / half ticked by the values shown
  function filterAll() {
    const $vals = $('#sheetFilterPop .sf-val:not(.sf-all):not(.hidden) [data-sf-val]');
    const on = $vals.filter(':checked').length;
    $('#sheetFilterPop [data-sf-all]').prop({ checked: on > 0 && on === $vals.length, indeterminate: on > 0 && on < $vals.length });
  }

  $doc.on('click', '[data-sf-open]', function (e) {
    e.stopPropagation();
    const id = $(this).data('sf-open');
    if ($('#sheetFilterPop').data('col') === id) closeFilter(); else openFilter(id, this);
  });
  $doc.on('mousedown', (e) => { if (!$(e.target).closest('#sheetFilterPop, [data-sf-open]').length) closeFilter(); });
  $(window).on('resize', closeFilterOnScroll);
  $doc.on('click', '[data-sf-cancel]', closeFilter);
  $doc.on('change', '[data-sf-op]', filterArgs);
  $doc.on('click', '[data-sf-color]', function () {
    $(this).toggleClass('on');
    $(this).siblings().removeClass('on');
  });
  $doc.on('input', '[data-sf-q]', function () {
    const q = this.value.trim().toLowerCase();
    $('#sheetFilterPop .sf-val:not(.sf-all)').each((i, el) => $(el).toggleClass('hidden', Boolean(q) && !String($(el).attr('data-sf-key')).includes(q)));
    filterAll();
  });
  $doc.on('change', '[data-sf-all]', function () {
    $('#sheetFilterPop .sf-val:not(.sf-all):not(.hidden) [data-sf-val]').prop('checked', this.checked);
    filterAll();
  });
  $doc.on('change', '[data-sf-val]', filterAll);
  $doc.on('click', '[data-sf-sort]', function () {
    sheetsView.sort = { col: $('#sheetFilterPop').data('col'), dir: Number($(this).data('sf-sort')) };
    closeFilter();
    renderSheets();
  });
  $doc.on('click', '[data-sf-clear]', () => {
    delete sheetsView.filters[$('#sheetFilterPop').data('col')];
    saveFilters();
    closeFilter();
    renderSheets();
  });
  $doc.on('click', '[data-sf-ok]', () => {
    const $pop = $('#sheetFilterPop');
    const colId = $pop.data('col');
    const searching = Boolean($pop.find('[data-sf-q]').val().trim());
    const $vals = $pop.find('[data-sf-val]');
    // while searching, only the ticked values shown count (like Excel)
    const ticked = $pop.find(`.sf-val${searching ? ':not(.hidden)' : ''} [data-sf-val]:checked`).map((i, el) => el.value).get();
    const f = {};
    if (searching || ticked.length < $vals.length) f.values = ticked;
    const op = $pop.find('[data-sf-op]').val();
    const a = $pop.find('[data-sf-a]').val().trim();
    const b = $pop.find('[data-sf-b]').val().trim();
    if (op && (NO_ARGS.includes(op) || (a !== '' && (op !== 'between' || b !== '')))) Object.assign(f, { op, a, b });
    const $colour = $pop.find('.sf-swatch.on');
    if ($colour.length) f.color = $colour.attr('data-sf-color');
    if (Object.keys(f).length) sheetsView.filters[colId] = f; else delete sheetsView.filters[colId];
    saveFilters();
    closeFilter();
    renderSheets();
  });
  $doc.on('click', '[data-sheet-unfilter]', () => { sheetsView.filters = {}; saveFilters(); renderSheets(); });

  function sheetTotals() {
    const { doc } = sheetsView;
    const rows = sheetRows();
    if (!rows.length || !doc.columns.some((c) => c.type === 'number' || c.type === 'checkbox')) return '';
    return `<tr><td class="sc-num">Σ</td><td></td>${doc.columns.map((c) => {
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
    const by = doc ? filtered() : [];
    const dragOk = edit && !v.search.trim() && !v.sort && !by.length;
    const picked = doc ? rows.filter((r) => v.picked.has(r.id)) : [];
    const allPicked = rows.length && picked.length === rows.length;
    const sideOpen = storage('get', 'sheetsSide') !== 'closed';
    const canTeams = canSendTeams(v.teams);
    // sheets ticked in the side list to delete (only the ones you own can be)
    const mine = v.list.filter((x) => x.manage);
    v.sheetPicks = new Set([...(v.sheetPicks || [])].filter((id) => mine.some((x) => x.id === id)));
    const sheetPicks = [...v.sheetPicks];
    const allSheets = mine.length && sheetPicks.length === mine.length;
    closeFilter();
    $('#sheetsPage').html(`<div class="sheets-page">
      <div class="sheets-top">
        <button class="btn-secondary text-sm" data-close-sheets title="Back to the board">${icon('left', 14)} Board</button>
        <button class="icon-btn ${sideOpen ? 'on' : ''}" data-sheet-side title="${sideOpen ? 'Hide' : 'Show'} the list of sheets">${icon('panel', 16)}</button>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">Sheets <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span>${doc ? ` <span class="font-normal text-slate-400">›</span> ${esc(doc.name)}` : ''}</h3>
        </div>
        ${!sideOpen && v.canCreate ? `<label class="btn-secondary cursor-pointer text-sm">${icon('upload', 14)} Import Excel
          <input type="file" class="hidden" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-sheet-import></label>` : ''}
      </div>
      <div class="sheets-layout ${sideOpen ? '' : 'side-closed'}">
        <aside class="sheets-side">
          ${v.canCreate ? `
            <button class="btn-primary w-full justify-center" data-sheet-new>${icon('plus', 14)} New sheet</button>
            <label class="btn-secondary w-full cursor-pointer justify-center">${icon('upload', 14)} Import Excel
              <input type="file" class="hidden" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-sheet-import></label>` : ''}
          ${mine.length ? `
            <div class="sheets-picks">
              <label class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sheets-pick-all ${allSheets ? 'checked' : ''}> Select all</label>
              ${sheetPicks.length ? `<button class="ml-auto inline-flex items-center gap-1 font-medium text-red-600 hover:underline" data-sheets-delete>${icon('trash', 12)} Delete ${sheetPicks.length}</button>` : ''}
            </div>` : ''}
          <div class="mt-1 space-y-0.5">
            ${v.list.map((x) => `
              <div class="sheets-row">
                ${x.manage ? `<input type="checkbox" class="h-4 w-4 shrink-0 accent-indigo-600" data-sheets-pick="${x.id}" ${v.sheetPicks.has(x.id) ? 'checked' : ''} title="Select to delete">`
                  : mine.length ? '<span class="w-4 shrink-0"></span>' : ''}
                <button class="sheets-item ${doc && doc.id === x.id ? 'on' : ''}" data-sheet-open="${x.id}" title="${esc(x.name)}">
                  ${icon(x.share === 'private' ? 'lock' : 'grid', 13)}<span class="min-w-0 flex-1 truncate text-left">${esc(x.name)}</span><span class="text-xs text-slate-400">${x.rows}</span>
                </button>
              </div>`).join('') || '<p class="px-2 py-6 text-center text-xs text-slate-400">No sheets yet</p>'}
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
              ${can('edit') ? `<button class="btn-secondary text-sm" data-sheet-teams ${canTeams && rows.length ? '' : 'disabled'}
                title="${canTeams ? (picked.length ? 'Send the ticked rows on Teams' : 'Send the rows shown on Teams (tick rows to send only those)') : 'This app has no Teams channel yet'}">
                ${icon('share', 14)} ${picked.length ? `Send ${picked.length} on Teams` : 'Send on Teams'}</button>` : ''}
              ${edit && picked.length ? `<button class="btn-secondary text-sm text-red-600" data-sheet-rows-delete title="Delete the ticked rows">
                ${icon('trash', 14)} Delete ${picked.length}</button>` : ''}
              <a class="btn-secondary text-sm" href="/api/sheets/${doc.id}/export" title="Download as Excel">${icon('download', 14)} Excel</a>
              ${doc.manage ? `<button class="icon-btn danger" data-sheet-delete title="Delete sheet">${icon('trash', 14)}</button>` : ''}
            </div>
          </div>
          <div class="sheets-grid">
            <table class="sheet-table">
              <thead><tr>
                <th class="sc-num">#</th>
                <th class="sc-pick"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sheet-pick-all ${allPicked ? 'checked' : ''} title="Tick every row shown"></th>
                ${doc.columns.map((c) => `
                  <th style="width:${c.width}px;min-width:${c.width}px" data-col-id="${c.id}">
                    <div class="sc-head">
                      <button class="sc-name" data-sheet-sort="${c.id}" title="Sort by ${esc(c.name)}">
                        <span class="sc-type">${SHEET_TYPES[c.type]}</span><span class="truncate">${esc(c.name)}</span>
                        ${v.sort && v.sort.col === c.id ? icon(v.sort.dir > 0 ? 'down' : 'up', 12) : ''}
                      </button>
                      ${edit ? `<button class="icon-btn sm" data-sheet-col-edit="${c.id}" title="Edit column">${icon('edit', 12)}</button>
                        <button class="icon-btn sm danger" data-sheet-col-delete="${c.id}" title="Delete column">${icon('close', 12)}</button>` : ''}
                      <button class="icon-btn sm sc-filter ${v.filters[c.id] ? 'on' : ''}" data-sf-open="${c.id}" title="Filter and sort ${esc(c.name)}">${icon('filter', 12)}</button>
                    </div>
                  </th>`).join('')}
                <th class="sc-add">${edit ? `<button class="sanity-addcol" data-sheet-col-add>${icon('plus', 12)} Column</button>` : ''}</th>
              </tr></thead>
              <tbody id="sheetRowsBody">
                ${rows.map((r) => `
                  <tr data-row-id="${r.id}">
                    <td class="sc-num"><span class="${dragOk ? 'drag' : ''}" title="${dragOk ? 'Drag to reorder' : ''}">${doc.rowList.indexOf(r) + 1}</span></td>
                    <td class="sc-pick"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-sheet-pick="${r.id}" ${v.picked.has(r.id) ? 'checked' : ''}></td>
                    ${doc.columns.map((c) => `<td ${cellLook(c, r)}>${sheetCell(c, r, edit)}</td>`).join('')}
                    <td class="sc-tools">${edit ? `<button class="icon-btn sm danger" data-sheet-row-delete="${r.id}" title="Delete row">${icon('trash', 12)}</button>` : ''}</td>
                  </tr>`).join('') || `<tr><td colspan="${doc.columns.length + 3}" class="py-10 text-center text-sm text-slate-400">${v.search || by.length ? 'No rows match' : 'No rows yet'}</td></tr>`}
              </tbody>
              <tfoot id="sheetTotals">${sheetTotals()}</tfoot>
            </table>
          </div>
          <div class="flex flex-wrap items-center gap-3 px-4 py-2 text-xs text-slate-500">
            ${edit ? `<button class="btn-secondary text-sm" data-sheet-row-add>${icon('plus', 14)} Add row</button>` : ''}
            <span>${rows.length}${rows.length !== doc.rowList.length ? ` of ${doc.rowList.length}` : ''} row${doc.rowList.length === 1 ? '' : 's'} · ${doc.columns.length} column${doc.columns.length === 1 ? '' : 's'}</span>
            ${by.length ? `<span class="inline-flex items-center gap-1 text-indigo-600">${icon('filter', 11)} Filtered by ${esc(by.map((c) => c.name).join(', '))}</span>
              <button class="text-indigo-600 hover:underline" data-sheet-unfilter>Clear filters</button>` : ''}
            ${v.sort ? '<button class="text-indigo-600 hover:underline" data-sheet-unsort>Clear sort</button>' : ''}
            ${edit && !dragOk ? '<span>Clear search, filters and sort to drag rows.</span>' : ''}
            ${picked.length ? `<span class="text-indigo-600">${picked.length} ticked</span><button class="text-indigo-600 hover:underline" data-sheet-unpick>Untick all</button>` : ''}
          </div>` : `
          <div class="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
            <p class="text-sm text-slate-500">Make a sheet for anything: release checklists, test cases, device matrix, a tracker…<br>Columns can link to people, flows and screens of this app.</p>
            ${v.canCreate ? `<button class="btn-primary" data-sheet-new>${icon('plus', 14)} New sheet</button>` : ''}
          </div>`}
        </section>
      </div></div>`);
    history.replaceState(null, '', `${location.pathname}${location.search}#sheets=${encodeURIComponent(v.productId)}${doc ? `&sheet=${encodeURIComponent(doc.id)}` : ''}`);
    $('#sheetRowsBody .sc-text').each((i, el) => autoGrow(el));
    $('.sheets-grid').on('scroll', closeFilterOnScroll);
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

  // What an Excel import read: per worksheet its rows, columns with their types and colours, and the empty
  // columns it left out
  function showImport(x, file) {
    $('#importBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('upload', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">Imported “${esc(file)}”</h3>
          <p class="text-xs text-slate-500">${x.sheets > 1 ? `${x.sheets} sheets, ` : ''}${x.rows} rows, ${x.columns} columns</p>
        </div>
        <button class="icon-btn" data-close-import title="Close">${icon('close', 18)}</button>
      </div>
      <div class="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
        ${x.report.map((ws) => `
          <div class="import-sheet">
            <div class="flex flex-wrap items-center gap-2">
              <b class="text-sm text-slate-900">${esc(ws.name)}</b>
              <span class="chip">${ws.rows} rows</span><span class="chip">${ws.columns.length} columns</span>
              <span class="text-xs text-slate-400">header on row ${ws.header}</span>
              <button class="ml-auto text-xs text-indigo-600 hover:underline" data-import-open="${ws.id}">Open</button>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">${ws.columns.map((c) => `
              <span class="import-col"><span class="sc-type">${SHEET_TYPES[c.type]}</span>${esc(c.name)}${c.colors ? `<span class="text-slate-400">· ${c.colors} colour${c.colors === 1 ? '' : 's'}</span>` : ''}</span>`).join('')}</div>
            ${ws.styled ? `<p class="mt-2 text-xs text-slate-500">${ws.styled} cell${ws.styled === 1 ? '' : 's'} keep their colours from Excel (fills, text colours, conditional formatting).</p>` : ''}
            ${ws.skipped.length ? `<p class="mt-1 text-xs text-slate-500">Left out, no values: ${esc(ws.skipped.join(', '))}</p>` : ''}
            ${ws.more ? '<p class="mt-1 text-xs text-amber-700">Only the first 5,000 rows were imported.</p>' : ''}
          </div>`).join('')}
      </div>
      <div class="flex justify-end border-t border-slate-200 px-5 py-3"><button class="btn-primary" data-close-import>Done</button></div>`);
    $('#importModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }
  function closeImport() {
    $('#importModal').addClass('hidden');
    unlockScroll();
  }
  $doc.on('click', '[data-close-import]', closeImport);
  $('#importModal').on('mousedown', function (e) { if (e.target === this) closeImport(); });
  $doc.on('click', '[data-import-open]', function () { const id = $(this).data('import-open'); closeImport(); reloadSheets(id); });

  $doc.on('click', '[data-action="sheets"]', () => (sheetsView ? closeSheets() : openSheets(productId)));
  $doc.on('click', '[data-close-sheets]', closeSheets);
  $doc.on('click', '[data-sheet-side]', () => {
    storage('set', 'sheetsSide', storage('get', 'sheetsSide') === 'closed' ? 'open' : 'closed');
    renderSheets();
  });
  $doc.on('change', '[data-sheet-pick]', function () {
    const id = $(this).data('sheet-pick');
    if (this.checked) sheetsView.picked.add(id); else sheetsView.picked.delete(id);
    renderSheets();
  });
  $doc.on('change', '[data-sheet-pick-all]', function () {
    sheetRows().forEach((r) => (this.checked ? sheetsView.picked.add(r.id) : sheetsView.picked.delete(r.id)));
    renderSheets();
  });
  $doc.on('click', '[data-sheet-unpick]', () => { sheetsView.picked = new Set(); renderSheets(); });
  // the ticked rows that are shown (search and filters can hide ticked ones: those stay)
  $doc.on('click', '[data-sheet-rows-delete]', () => {
    const { doc, picked } = sheetsView;
    const ids = sheetRows().filter((r) => picked.has(r.id)).map((r) => r.id);
    if (!ids.length) return;
    dialog.confirm({
      title: `Delete ${ids.length} row${ids.length === 1 ? '' : 's'}?`, message: `From “${doc.name}”. This cannot be undone here.`, confirmText: 'Delete', danger: true,
      onConfirm: () => api('POST', `/api/sheets/${doc.id}/rows/delete`, { ids }, null, QUIET).done((x) => {
        ids.forEach((id) => picked.delete(id));
        toast(`${x.deleted} row${x.deleted === 1 ? '' : 's'} deleted`);
        reloadSheet();
      }),
    });
  });
  // the ticked rows (or, with none ticked, the rows shown: after search and filters), with the columns picked
  $doc.on('click', '[data-sheet-teams]', () => {
    const { doc, picked } = sheetsView;
    const shown = sheetRows();
    const rows = shown.filter((r) => picked.has(r.id));
    const send = rows.length ? rows : shown;
    openTeamsSend({
      title: `Send “${doc.name}” on Teams`,
      count: send.length,
      columns: doc.columns.map((c) => ({ id: c.id, label: c.name })),
      people: sheetsView.people,
      webhook: sheetsView.teams,
      send: (val) => api('POST', `/api/sheets/${doc.id}/teams`, {
        rowIds: send.map((r) => r.id), columnIds: val.columns, userIds: val.userIds, note: val.note, mode: val.mode,
      }, val.button, QUIET),
    });
  });
  $doc.on('change', '[data-sheets-pick]', function () {
    const id = $(this).data('sheets-pick');
    if (this.checked) sheetsView.sheetPicks.add(id); else sheetsView.sheetPicks.delete(id);
    renderSheets();
  });
  $doc.on('change', '[data-sheets-pick-all]', function () {
    sheetsView.sheetPicks = new Set(this.checked ? sheetsView.list.filter((x) => x.manage).map((x) => x.id) : []);
    renderSheets();
  });
  $doc.on('click', '[data-sheets-delete]', () => {
    const list = sheetsView.list.filter((x) => sheetsView.sheetPicks.has(x.id));
    if (!list.length) return;
    const rows = list.reduce((t, x) => t + (x.rows || 0), 0);
    dialog.confirm({
      title: `Delete ${list.length} sheet${list.length === 1 ? '' : 's'}?`,
      message: `${list.slice(0, 5).map((x) => `“${x.name}”`).join(', ')}${list.length > 5 ? ` and ${list.length - 5} more` : ''}. Their ${rows} rows go with them.`,
      confirmText: 'Delete', danger: true,
      onConfirm: () => api('POST', '/api/sheets/delete', { ids: list.map((x) => x.id) }, null, QUIET).done((x) => {
        sheetsView.sheetPicks = new Set();
        if (sheetsView.doc && list.some((s) => s.id === sheetsView.doc.id)) sheetsView.doc = null;
        toast(`${x.deleted} sheet${x.deleted === 1 ? '' : 's'} deleted`);
        reloadSheets(sheetsView.doc && sheetsView.doc.id);
      }),
    });
  });
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
    const name = file.name.replace(/\.xlsx$/i, '');
    const reader = new FileReader();
    reader.onload = () => api('POST', '/api/sheets/import', { productId: sheetsView.productId, name, dataUrl: reader.result })
      .done((x) => { reloadSheets(x.id); showImport(x, name); });
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

  // a cell saves itself; the grid only redraws its totals (and the cell when its look or link button changes)
  $doc.on('change', '[data-sc]', function () {
    const { doc } = sheetsView;
    const row = doc.rowList.find((r) => r.id === $(this).data('row'));
    const col = doc.columns.find((c) => c.id === $(this).data('col'));
    const value = col.type === 'checkbox' ? this.checked : this.value.trim();
    const el = this;
    api('PATCH', `/api/sheet-rows/${row.id}`, { cells: { [col.id]: value } }, el)
      .done((saved) => {
        row.cells = saved.cells;
        row.styles = saved.styles;
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

  // ---------------------------------------------------------------- a submitted sanity (log): the report as it was, with every case's details;
  // retest its failures, compare it with the report before, and send it on Teams (whole, failed cases only, or to the
  // cases' developers), with each share kept and shown

  let sanityLog = null;
  let sanityLogFilter = 'all'; // 'all' | 'bad'

  function openSanityLog(id) {
    api('GET', `/api/sanity/logs/${id}`).done((log) => {
      sanityLog = log;
      sanityLogFilter = log.rows.some((r) => isBad(r.state)) ? 'bad' : 'all';
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

  const LOG_TEAMS_COLUMNS = [['heading', 'Case'], ['module', 'Module'], ['state', 'Result'], ['review', 'Remarks'], ['expected', 'Expected'],
    ['actual', 'Actual'], ['repro', 'Steps to reproduce'], ['evidence', 'Evidence'], ['owner', 'Developer'], ['by', 'Checked by']];
  const LOG_TEAMS_ON = { failed: ['heading', 'module', 'state', 'review', 'actual', 'repro', 'evidence', 'owner'], all: ['heading', 'module', 'state', 'review'] };

  // scope 'failed' (only failed / blocked cases) or 'all'; devs: tick the developers of those cases and message them directly
  function sendLogOnTeams(scope, devs) {
    const l = sanityLog;
    const bad = l.rows.filter((r) => isBad(r.state));
    api('GET', `/api/products/${encodeURIComponent(l.productId)}/people`).done((p) => {
      const owners = new Set(bad.map((r) => r.ownerId).filter(Boolean));
      if (devs && !owners.size) { dialog.alert('None of the failed cases has a developer yet. Pick one under “Developer” on the case in the checklist.', 'No developers'); return; }
      const product = products.find((x) => x.id === l.productId);
      openTeamsSend({
        title: devs ? `Tell developers about ${bad.length} failed case${bad.length === 1 ? '' : 's'}` : scope === 'failed' ? `Send ${bad.length} failed case${bad.length === 1 ? '' : 's'}` : 'Send the sanity report',
        count: scope === 'failed' ? bad.length : l.rows.length,
        columns: LOG_TEAMS_COLUMNS.map(([id, label]) => ({ id, label, on: LOG_TEAMS_ON[scope].includes(id) })),
        people: p.people.filter((u) => u.id !== me.id).map((u) => ({ ...u, on: devs && owners.has(u.id) })),
        webhook: p.teams,
        target: devs ? 'direct' : null,
        preview: teamsPreview({
          title: scope === 'failed' ? `❌ Failed cases · ${product ? product.name : ''} ${l.version} (${l.date})` : `🧪 Sanity report · ${product ? product.name : ''} ${l.version} (${l.date})`,
          lines: (scope === 'failed' ? bad : l.rows).map((r) => `${{ pass: '✅', fail: '❌', blocked: '⛔' }[r.state] || '➖'} **${r.heading}**${r.owner ? ` (${r.owner})` : ''}${r.review ? ` — ${r.review}` : ''}`),
          facts: [['Version', l.version], ['Passed', `${l.passed} / ${l.total}`], ['Failed', String(l.failed)], ['Blocked', l.blocked ? String(l.blocked) : '']],
          mentions: [], where: 'Preview',
        }),
        send: (val) => api('POST', `/api/sanity/logs/${l.id}/teams`, { scope, columns: val.columns, userIds: val.userIds, note: val.note, mode: val.mode }, val.button, QUIET),
        // the channel post is kept by the server; what went from the person's own Teams is kept here
        after: ({ target, results }) => {
          const record = target === 'app' ? $.Deferred().resolve().promise() : api('POST', `/api/sanity/logs/${l.id}/shares`, {
            scope, target,
            to: (results || []).filter((x) => x.ok).map((x) => x.name),
            failed: (results || []).filter((x) => !x.ok).map((x) => `${x.name} (${x.error})`),
            status: (results || []).some((x) => !x.ok) ? ((results || []).some((x) => x.ok) ? 'partly sent' : 'not sent') : 'sent',
          }, null, QUIET);
          record.always(() => {
            if (sanityLog && sanityLog.id === l.id) openSanityLog(l.id);
            if (sanity) reloadSanity();
          });
        },
      });
    });
  }

  function renderSanityLog() {
    const l = sanityLog;
    const link = `${location.origin}/#sanity=${encodeURIComponent(l.productId)}&log=${l.id}`;
    const bad = l.rows.filter((r) => isBad(r.state));
    const rows = sanityLogFilter === 'bad' ? l.rows.filter((r) => isBad(r.state)) : l.rows;
    const list = sanity && sanity.productId === l.productId ? sanity.logs : [];
    const at = list.findIndex((x) => x.id === l.id);
    const previous = at >= 0 ? list[at + 1] : null;
    const canRetest = sanity && sanity.productId === l.productId && sanityRuns(sanity) && bad.length;
    const detail = (r) => [
      r.expected && `<dt>Expected</dt><dd>${esc(r.expected)}</dd>`,
      r.actual && `<dt>Actual</dt><dd>${esc(r.actual)}</dd>`,
      r.repro && `<dt>Steps</dt><dd>${esc(r.repro)}</dd>`,
      (r.evidence || []).length && `<dt>Evidence</dt><dd>${r.evidence.map((e) => `<a class="sc-link" href="${esc(e.url)}" target="_blank" rel="noopener">${icon(e.kind === 'video' ? 'play' : 'clip', 11)} ${esc(e.name || e.kind)}</a>`).join(' ')}</dd>`,
      ...l.columns.filter((c) => r.cells[c]).map((c) => `<dt>${esc(c)}</dt><dd>${esc(r.cells[c])}</dd>`),
    ].filter(Boolean).join('');
    $('#sanityLogBody').html(`
      <div class="sc-log-head">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Sanity report · ${fmtDate(l.date)} <span class="font-mono text-sm font-normal text-slate-500">${esc(l.version)}</span></h3>
          <p class="text-xs text-slate-500">Done by ${esc(l.testers.join(', ') || l.submittedBy)} · submitted by ${esc(l.submittedBy)}, ${new Date(l.submittedAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            ${logBar(l)}
            <span class="sc-chip st-pass">${l.passed} passed</span>
            ${l.failed ? `<span class="sc-chip st-fail">${l.failed} failed</span>` : ''}
            ${l.blocked ? `<span class="sc-chip st-blocked">${l.blocked} blocked</span>` : ''}
            ${l.skipped ? `<span class="sc-chip st-skipped">${l.skipped} not tested</span>` : ''}
            <span class="text-xs text-slate-500">of ${l.total}</span>
          </div>
        </div>
        <a class="btn-secondary text-sm" href="/api/sanity/logs/${l.id}/export">${icon('download', 14)} Excel</a>
        <button class="icon-btn" data-close-sanity-log title="Close">${icon('close', 18)}</button>
      </div>
      <div class="sc-log-tools">
        <div class="seg">
          <button data-log-filter="bad" class="${sanityLogFilter === 'bad' ? 'on' : ''}">Failed &amp; blocked <span class="text-slate-400">${bad.length}</span></button>
          <button data-log-filter="all" class="${sanityLogFilter === 'all' ? 'on' : ''}">All cases <span class="text-slate-400">${l.rows.length}</span></button>
        </div>
        <span class="flex-1"></span>
        ${canRetest ? `<button class="btn-secondary text-sm" data-sc-retest-log="${l.id}" title="Flag these cases in today's checklist">${icon('flip', 14)} Retest failures</button>` : ''}
        ${previous ? `<button class="btn-secondary text-sm" data-log-compare="${previous.id}" title="What changed since ${esc(previous.version)}">${icon('compare', 14)} Compare with ${esc(previous.version)}</button>` : ''}
        <button class="btn-secondary text-sm" data-copy-link="${esc(link)}">${icon('link', 14)} Copy link</button>
      </div>
      <div class="sc-log-cases">
        ${rows.map((r) => `<div class="sc-log-case st-${r.state}">
          <div class="sc-log-case-head">
            <span class="sc-no">${l.rows.indexOf(r) + 1}</span>
            <div class="min-w-0 flex-1"><b class="text-sm text-slate-900">${esc(r.heading)}</b>
              <div class="sc-meta">${r.module ? `<span>${esc(r.module)}</span>` : ''}${r.owner ? `<span>${icon('user', 11)} ${esc(r.owner)}</span>` : ''}${r.checkedBy ? `<span>by ${esc(r.checkedBy)}</span>` : ''}</div></div>
            ${stateChip(r.state)}
          </div>
          ${r.review ? `<p class="sc-log-remark">${esc(r.review)}</p>` : ''}
          ${detail(r) ? `<dl class="sc-review-dl">${detail(r)}</dl>` : ''}
        </div>`).join('') || '<p class="sc-empty">Nothing failed or was blocked in this report.</p>'}
      </div>
      ${can('edit') ? `
      <div class="sc-log-teams">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900">Share on Teams</p>
          <p class="text-xs text-slate-500">Post on the app's channel, message people directly or post in a channel of yours. You see the message before it goes.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${bad.length ? `<button class="btn-primary" data-log-send="failed">${icon('share', 14)} Send failed cases (${bad.length})</button>
              <button class="btn-secondary" data-log-send="devs" title="Message the developers of the failed cases">${icon('user', 14)} Notify developers</button>` : ''}
            <button class="${bad.length ? 'btn-secondary' : 'btn-primary'}" data-log-send="all">${icon('share', 14)} Send full report</button>
          </div>
        </div>
        <div class="sc-log-history">
          <p class="field-label">Sent</p>
          ${l.shares.length ? `<ul>${l.shares.slice().reverse().map((x) => `<li class="${x.status === 'sent' ? 'ok' : 'bad'}">
            ${icon(x.status === 'sent' ? 'check' : 'close', 12)}
            <span><b>${x.scope === 'failed' ? 'Failed cases' : 'Full report'}</b> · ${{ channel: 'app channel', direct: 'direct message', mine: 'your channel' }[x.target] || x.target}
              ${x.to && x.to.length ? `to ${esc(x.to.join(', '))}` : ''}
              <small>${esc(x.by)} · ${new Date(x.at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}${x.status === 'sent' ? '' : ` · ${esc(x.status)}`}${x.failed && x.failed.length ? ` · not reached: ${esc(x.failed.join(', '))}` : ''}</small></span>
          </li>`).join('')}</ul>` : `<p class="text-xs text-slate-400">${l.sharedAt ? `Posted on Teams ${new Date(l.sharedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Not shared yet.'}</p>`}
        </div>
      </div>` : ''}`);
  }

  $doc.on('click', '[data-close-sanity-log]', closeSanityLog);
  $('#sanityLogModal').on('mousedown', function (e) { if (e.target === this) closeSanityLog(); });
  $doc.on('click', '[data-log-filter]', function () { sanityLogFilter = $(this).data('log-filter'); renderSanityLog(); });
  $doc.on('click', '[data-log-send]', function () {
    const kind = $(this).data('log-send');
    sendLogOnTeams(kind === 'all' ? 'all' : 'failed', kind === 'devs');
  });
  $doc.on('click', '[data-log-compare]', function () {
    const older = $(this).data('log-compare');
    const newer = sanityLog.id;
    closeSanityLog();
    Object.assign(sanity, { view: 'logs', logsTab: 'compare', compare: [older, newer] });
    openSanity(sanity.productId, sanity.date, 'logs');
  });
  $doc.on('click', '[data-copy-link]', function () {
    const url = $(this).data('copy-link');
    const done = () => toast('Link copied');
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => dialog.alert(url, 'Copy this link'));
    else dialog.alert(url, 'Copy this link');
  });

  load();
});
