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
    list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
    redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
    fit: 'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5',
    sticky: 'M4 4h16v10l-6 6H4zM14 20v-6h6',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    filter: 'M3 4h18l-7 8.5V19l-4 2v-8.5z',
    panel: 'M3 3h18v18H3zM9 3v18',
    chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z',
    home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
    shield: 'M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    menu: 'M3 6h18M3 12h18M3 18h18',
    sidebar: 'M3 3h18v18H3zM9 3v18M16 10l-2 2 2 2',
    tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
    fork: 'M12 3v6M12 9l-6 6v5M12 9l6 6v5M3.5 17.5 6 20l2.5-2.5M15.5 17.5 18 20l2.5-2.5',
    clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
    bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',
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
  // a day ('YYYY-MM-DD') is that calendar day wherever the browser is: new Date('2026-10-28') alone is UTC midnight,
  // which is still the 27th west of Greenwich
  const fmtDate = (d) => new Date(typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00` : d)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
    tester: { label: 'Tester', hint: 'Adds issues and assigns them to developers; verifies fixes, closes them or reopens a failed one (any status). Cannot change screens, images or videos.' },
    developer: { label: 'Developer', hint: 'Update tasks, plus add, rename and delete modules, flows, screens, popups and conditions (with their branch paths), extend a new flow from a screen, drag screens into a new order, and upload screen images. On issues: only the ones assigned to them, Pending → In Progress → Release for Testing, as the app allows (Project settings).' },
    full: { label: 'Full', hint: 'Can do everything inside their apps: create, edit and delete modules, flows, screens and issues.' },
    super: { label: 'Super admin', hint: 'Everything in every app, plus this admin dashboard and the status tags.' },
  };
  const can = (level) => Boolean(me) && LEVELS[me.access] >= LEVELS[level];
  // ---- roles & permissions on issues (the same rules as server.js, which enforces them; here they only decide what
  // is offered). Per app its admins choose what Developers may do (Project settings → Roles & permissions):
  // create, viewAll, status (move their issues Pending → In Progress → Release for Testing), assign, edit.
  // A Developer only changes issues they own (issue.developerId); Testers verify, close and reopen; admins do all.
  const DEV_PERMISSIONS = { create: true, viewAll: true, status: true, assign: false, edit: true };
  const DEV_STATUSES = ['pending', 'progress', 'testing']; // where a Developer may move an issue they own
  const DEV_FROM = [...DEV_STATUSES, 'reopened'];
  const isDev = () => Boolean(me) && me.access === 'developer';
  const isAppAdmin = () => Boolean(me) && (me.access === 'super' || me.access === 'full');
  const devPerms = (pid = productId) => ({ ...DEV_PERMISSIONS, ...((products.find((p) => p.id === pid) || {}).devPermissions || {}) });
  // the app a screen (and so its issues) belongs to
  const appOfScreen = (screenId) => {
    const sc = findScreen(screenId);
    const f = sc && findFlow(sc.flowId);
    const m = f && allModules.find((x) => x.id === f.moduleId);
    return (m && m.productId) || productId;
  };
  // an issue is "mine" when I own it or my name is among its assignees
  const myNames = () => (me ? [me.name, me.username].filter(Boolean).map((n) => n.toLowerCase()) : []);
  const isMine = (c) => Boolean(me) && (c.developerId === me.id || (c.assignees || []).some((n) => myNames().includes(String(n).toLowerCase())));
  /** What I may do to one issue → { status: ids I may move it to (null = any), edit, assign, why } */
  function issueRights(c) {
    if (!isDev()) return { status: null, edit: true, assign: true, why: '' };
    const p = devPerms(appOfScreen(c.screenId));
    const owner = c.developerId === me.id;
    const why = !owner ? (c.developerId ? 'Only the developer this issue is assigned to can change it' : 'Unassigned: a tester or admin assigns it')
      : !DEV_FROM.includes(c.status) ? 'A tester or admin changes a verified or closed issue' : '';
    return {
      status: owner && p.status && DEV_FROM.includes(c.status) ? DEV_STATUSES : [],
      edit: owner && p.edit,
      assign: owner && p.assign,
      why: why || (!p.status ? 'Developers cannot change status in this app (Project settings)' : ''),
    };
  }
  // may I add issues in this app?
  const canCreateIssues = (pid = productId) => can('edit') && (!isDev() || devPerms(pid).create);
  // statuses a new issue may start in
  const statusLocked = (id) => isDev() && !DEV_STATUSES.includes(id);

  // Controls that need a higher level are removed; lower logins get read-only inputs.
  // edit / tester = issues only; developer adds to that modules, flows, screens, conditions, images and card order;
  // full adds videos, copying, screen paths and flow order. View-only logins don't see issues at all.
  const NEEDS = {
    super: '[data-action="add-product"], [data-rename-product], [data-delete-product], [data-action="manage-statuses"], [data-action="admin"]',
    full: `[data-app-settings], [data-move-flow], [data-copy-screen], [data-delete-comment], [data-remove-video], [data-move-path]`,
    developer: `[data-action="add-module"], [data-rename-module], [data-delete-module], [data-remove-image], [data-action="add-flow"], [data-rename-flow], [data-delete-flow],
      .add-screen, .dg-add-end, .dg-plus, [data-edit-screen], [data-delete-screen],
      [data-add-condition], [data-insert-condition], [data-rename-condition], [data-cond-tool], [data-add-branch], [data-remove-branch], [data-extend-path], [data-extend-screen],
      [data-dg-new="condition"], [data-dg-branch-add], [data-dg-branch-remove], [data-mark-nav], [data-remove-link], [data-sketch-module], [data-sketch-flow]`,
    edit: '.add-comment, [data-pen], [data-action="writer"], [data-remove-person], [data-bugs], [data-flip], [data-open-sheet], .issues-panel',
  };
  function applyAccess() {
    const $root = $('#products, #summary, #account, #sbNav, #tabs, #board, #popupBody, #sheetBody, #bugsBody, #videoBody, #diagramBody');
    Object.entries(NEEDS).forEach(([level, selector]) => { if (!can(level)) $root.find(selector).remove(); });
    if (!can('developer')) {
      $root.find('[data-upload]').closest('label').remove();
      $root.find('[data-device], [data-wireframe], [data-branch-label], [data-branch-target], [data-dg-branch-label], [data-dg-branch-target]').prop('disabled', true);
    }
    if (!can('full')) $root.find('[data-upload-video]').closest('label').remove();
    if (!can('edit')) $root.find('[data-status], [data-resolve], [data-field], [data-cycle-priority], .people-input').prop('disabled', true);
    if (isDev() && !products.some((x) => devPerms(x.id).create)) $root.find('[data-action="writer"]').remove();
    // Developers: no "add issue" where the app doesn't allow it
    if (isDev() && !devPerms().create) $root.find('.add-comment').remove();
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
  // A Developer gets Pending / In Progress / Release for Testing on an issue they own (and may move), else it's locked.
  function statusSelect(c, extra = '') {
    const current = statusOf(c.status);
    const r = issueRights(c);
    const locked = Boolean(r.status) && !r.status.length;
    const list = locked ? [] : activeStatuses().filter((x) => !r.status || r.status.includes(x.id));
    const options = list.some((x) => x.id === current.id) ? list : [current, ...list];
    const title = locked ? r.why : dateText(c);
    return `<select class="status st-${current.color} ${extra}" data-status="${c.id}" title="${esc(title)}" ${locked ? 'disabled' : ''}>
      ${options.map((x) => `<option value="${esc(x.id)}" ${x.id === c.status ? 'selected' : ''}>${esc(x.label)}${x.deleted ? ' (removed)' : ''}</option>`).join('')}
    </select>`;
  }

  // Several people per issue: chips + a text box (Enter or comma adds, × removes).
  // data-people holds the issue id when the chips save straight away (issue sheet); empty in add forms.
  const chip = (name) => `<span class="person">${esc(name)}<button type="button" data-remove-person title="Remove">${icon('close', 10)}</button></span>`;
  // locked: shown, not changeable (a Developer on an issue they may not reassign)
  const peopleBox = (names, commentId = '', extra = '', locked = false) => `
    <div class="people ${extra} ${locked ? 'locked' : ''}" data-people="${commentId}" ${locked ? 'title="Only a tester, an admin or the issue\'s developer (when allowed) can reassign it"' : ''}>
      ${(names || []).map(locked ? (n) => `<span class="person">${esc(n)}</span>` : chip).join('')}
      ${locked ? '' : `<input class="people-input" placeholder="${names && names.length ? 'Add person' : commentId ? 'Unassigned' : 'Assign to'}" maxlength="60" autocomplete="off">`}
    </div>`;

  // the Developer who owns an issue (only they, of the Developers, may change it)
  function ownerName(c) {
    if (!c.developerId) return '';
    if (me && c.developerId === me.id) return me.name || me.username;
    const u = (appPeople.get(appOfScreen(c.screenId)) || []).find((x) => x.id === c.developerId);
    return u ? u.name : (c.assignees || [])[0] || 'Developer';
  }
  const ownerChip = (c) => (c.developerId
    ? `<span class="owner-chip ${me && c.developerId === me.id ? 'me' : ''}" title="Assigned developer: only they (or a tester / admin) can change this issue">${icon('user', 11)}${esc(ownerName(c))}${me && c.developerId === me.id ? ' · you' : ''}</span>`
    : (c.resolved ? '' : '<span class="owner-chip none" title="No developer owns this issue yet: a tester or admin assigns it">No developer</span>'));
  // the owner as a choice (issue sheet): the Developer logins of the app
  function ownerSelect(c) {
    const r = issueRights(c);
    const devs = (appPeople.get(appOfScreen(c.screenId)) || []).filter((u) => u.access === 'developer');
    const opts = devs.some((u) => u.id === c.developerId) || !c.developerId ? devs : [{ id: c.developerId, name: ownerName(c) }, ...devs];
    return `<select class="input mb-1 w-full text-xs" data-owner="${c.id}" title="Assigned developer" ${r.assign ? '' : 'disabled'}>
      <option value="">No developer</option>${opts.map((u) => `<option value="${esc(u.id)}" ${u.id === c.developerId ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>`;
  }
  const chipsOf = ($box) => $box.find('.person').map((i, el) => $(el).text().trim()).get();
  // chips plus anything typed but not yet added
  const peopleOf = ($box) => [...new Set(chipsOf($box).concat(($box.find('.people-input').val() || '').split(',').map((x) => x.trim()).filter(Boolean)))];

  const priorityOptions = (selected) =>
    Object.entries(PRIORITY).map(([k, v]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${v.label}</option>`).join('');
  const areaOptions = (selected) => (AREA[selected] ? '' : '<option value="" selected disabled>Area</option>')
    + Object.entries(AREA).map(([k, label]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${label}</option>`).join('');
  const areaTag = (c) => (AREA[c.area] ? `<span class="area-tag ${c.area}">${AREA[c.area]}</span>` : '');

  // ---------------------------------------------------------------- issues (card back + popup)

  // "Fixed" (Complete): Testers and admins close issues, never a Developer
  const mayClose = (c) => { const r = issueRights(c); return !r.status || r.status.includes('complete'); };

  function issueRow(c, big) {
    const p = prio(c);
    const full = big || expanded.has(c.id);
    const r = issueRights(c);
    return `
      <li class="bug ${p} ${c.resolved ? 'is-fixed' : ''} ${c.id === flashId ? 'new' : ''} ${big && c.box && !c.resolved && boxKey(c.box) === pickedArea ? 'picked' : ''}" data-issue="${c.id}">
        <input type="checkbox" class="mt-0.5 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''} ${mayClose(c) ? 'title="Mark fixed"' : 'disabled title="A tester or admin closes issues"'}>
        <div class="min-w-0 flex-1">
          <div class="bug-meta">
            <button class="prio-tag ${p}" data-cycle-priority="${c.id}" ${r.edit ? 'title="Change priority"' : `disabled title="${esc(r.why || 'Developers cannot edit issue details here')}"`}><span class="dot bg-${p}"></span>${PRIORITY[p].label}</button>
            ${areaTag(c)}
            ${c.box && !c.resolved ? `<button class="mark-chip" data-show-mark="${c.id}" title="Show the marked area">${icon('pen', 11)}</button>` : ''}
            ${statusSelect(c, 'sm')}
            ${ownerChip(c)}
            ${(c.assignees || []).filter((n) => n !== ownerName(c)).map((n) => `<span class="assignee">${esc(n)}</span>`).join('')}
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
        connectPresence();
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

  // ---------------------------------------------------------------- the sidebar
  // Apps (each with its own colour and initials), pages, issue counts and your account. The arrow at the top folds it
  // into an icon rail (kept in this browser, set before the page shows: index.html); on a phone it is a drawer.

  const APP_COLORS = ['#4f46e5', '#0891b2', '#db2777', '#ea580c', '#16a34a', '#7c3aed', '#0d9488', '#ca8a04'];
  const appColor = (p) => APP_COLORS[[...p.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0) % APP_COLORS.length];
  const appInitials = (name) => (String(name).trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('') || '?').toUpperCase();
  const sbItem = ({ attrs = '', ico, label, on = false, extra = '', cls = '', title = label }) => `<button class="sb-item ${on ? 'on' : ''} ${cls}" ${attrs} title="${esc(title)}">
      <span class="sb-ico">${ico}</span><span class="sb-label">${label}</span>${extra}</button>`;

  function renderProducts() {
    $('#products').html(products.map((p) => `
      <div class="sb-row ${p.id === productId ? 'on' : ''}">
        <button class="sb-item app ${p.id === productId ? 'on' : ''}" data-product="${p.id}" title="${esc(p.name)}">
          <span class="sb-app" style="--app:${appColor(p)}">${esc(appInitials(p.name))}</span><span class="sb-label">${esc(p.name)}</span>
          ${p.version ? `<span class="sb-count mono">${esc(p.version.replace(/^v(?=\d)/i, ''))}</span>` : ''}</button>
        ${p.id === productId ? `<span class="sb-tools">
          <button class="icon-btn sm" data-app-settings="${p.id}" title="Project settings: roles & permissions">${icon('shield', 12)}</button>
          <button class="icon-btn sm" data-rename-product="${p.id}" title="Rename ${esc(p.name)}">${icon('edit', 12)}</button>
          <button class="icon-btn sm danger" data-delete-product="${p.id}" title="Delete ${esc(p.name)}">${icon('trash', 12)}</button></span>` : ''}
      </div>`).join('')
      + sbItem({ attrs: 'data-action="add-product"', ico: icon('plus', 15), label: 'Add product', cls: 'muted' }));
  }

  const sbCollapsed = () => document.documentElement.classList.contains('sb-collapsed');
  function showSidebarToggle() {
    const folded = sbCollapsed();
    $('[data-sidebar-toggle]').html(icon(folded ? 'right' : 'left', 16)).attr('title', folded ? 'Expand the sidebar' : 'Collapse the sidebar')
      .attr('aria-label', folded ? 'Expand the sidebar' : 'Collapse the sidebar');
    $('[data-sidebar-open]').html(icon('menu', 18));
  }
  showSidebarToggle();
  $doc.on('click', '[data-sidebar-toggle]', () => {
    document.documentElement.classList.toggle('sb-collapsed');
    storage('set', 'sidebar', sbCollapsed() ? 'collapsed' : 'open');
    $('#sidebar details[open]').prop('open', false);
    showSidebarToggle();
  });
  // phone: a drawer over the page, closed by the backdrop, Escape or going somewhere
  const closeDrawer = () => $('body').removeClass('sb-open');
  $doc.on('click', '[data-sidebar-open]', () => $('body').addClass('sb-open'));
  $doc.on('click', '[data-sidebar-close]', closeDrawer);
  $doc.on('click', '#sidebar .sb-item:not([data-teams-summary]), #sidebar a.sb-item', () => { if (window.innerWidth < 900) closeDrawer(); });
  $doc.on('keydown', (e) => { if (e.key === 'Escape' && $('body').hasClass('sb-open')) closeDrawer(); });
  // which page is open: the board, Sheets or Sanity
  const markNav = () => {
    $('[data-action="home"].sb-item').toggleClass('on', !sheetsView && !sanity && !adminView && !doneView && !templatesView);
    $('[data-action="templates"]').toggleClass('on', Boolean(templatesView));
    $('[data-action="done"]').toggleClass('on', Boolean(doneView));
    $('[data-action="admin"]').toggleClass('on', Boolean(adminView));
    $('[data-action="sheets"]').toggleClass('on', Boolean(sheetsView));
    $('[data-action="sanity"]').toggleClass('on', Boolean(sanity));
  };

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
    const badge = (n) => `<span class="sb-count ${n ? 'has' : ''}">${n}</span>`;
    const myOpen = issues.filter((c) => !c.resolved && isMine(c)).length;
    $('#summary').html(
      sbItem({ attrs: 'data-bugs="" data-scope="mine"', ico: icon('user', 15), label: 'My issues', extra: badge(myOpen), cls: 'strong', title: `Open issues assigned to you: ${myOpen}` })
      + sbItem({ attrs: 'data-bugs="" data-scope="all"', ico: '<span class="sb-dot dot-issues"></span>', label: 'Open issues', extra: badge(openIssues), title: `Open issues: ${openIssues}` })
      + shown.map((x) => sbItem({ attrs: `data-bugs="${esc(x.id)}"`, ico: `<span class="sb-dot dot st st-${x.color}"></span>`, label: esc(x.label), extra: badge(count(x.id)), title: `${x.label}: ${count(x.id)}` })).join('')
      + sbItem({ attrs: 'data-action="manage-statuses"', ico: icon('tag', 15), label: 'Statuses', cls: 'muted', title: 'Manage statuses' }));

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
        ${fromScreen ? `<svg class="elbow" aria-hidden="true">
            <path class="glow-bg"/>
            <path class="line"/>
            <path class="flow"/>
            <circle class="port" r="4.5"/>
            <path class="head"/>
          </svg>
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

  function elbowPath(pts, radius = 16) {
    let p = pts.filter((q, i) => !i || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
    p = p.filter((q, i) => {
      if (i === 0 || i === p.length - 1) return true;
      const prev = p[i - 1], next = p[i + 1];
      if ((prev[0] === q[0] && q[0] === next[0]) || (prev[1] === q[1] && q[1] === next[1])) return false;
      return true;
    });
    if (p.length < 2) return { d: '', head: '' };
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length - 1; i += 1) {
      const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
      const r = Math.min(radius, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, Math.hypot(c[0] - b[0], c[1] - b[1]) / 2);
      const s = (q, t) => [b[0] + Math.sign(q[0] - b[0]) * t, b[1] + Math.sign(q[1] - b[1]) * t];
      const [x1, y1] = s(a, r);
      const [x2, y2] = s(c, r);
      d += `L${x1} ${y1}Q${b[0]} ${b[1]} ${x2} ${y2}`;
    }
    const [ex, ey] = p[p.length - 1];
    const [fx, fy] = p[p.length - 2] || p[0];
    d += `L${ex} ${ey}`;
    const ang = Math.atan2(ey - fy, ex - fx);
    const len = 9, w = 5.5;
    const p1x = Math.round((ex - len * Math.cos(ang) + w * Math.sin(ang)) * 10) / 10;
    const p1y = Math.round((ey - len * Math.sin(ang) - w * Math.cos(ang)) * 10) / 10;
    const p2x = Math.round((ex - len * Math.cos(ang) - w * Math.sin(ang)) * 10) / 10;
    const p2y = Math.round((ey - len * Math.sin(ang) + w * Math.cos(ang)) * 10) / 10;
    const notchX = Math.round((ex - (len - 2.5) * Math.cos(ang)) * 10) / 10;
    const notchY = Math.round((ey - (len - 2.5) * Math.sin(ang)) * 10) / 10;
    const head = `M${ex} ${ey}L${p1x} ${p1y}L${notchX} ${notchY}L${p2x} ${p2y}Z`;
    return { d, head };
  }

  // Each screen path starts at the left, like the main row, and is joined to its source card by a curved flowing wire:
  // down from the card, smoothly curving along the gutter, down again, then entering the path's first card.
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
      const gutter = -14; // board padding, left of both rows
      const y = f.top - base.top + 107; // card connector height
      const end = f.left - base.left - 4;

      const pts = [
        [x, top],
        [x, turn],
        [gutter, turn],
        [gutter, y],
        [end, y],
      ];
      const { d, head } = elbowPath(pts, 16);

      const glow = elbow.querySelector('.glow-bg');
      if (glow) glow.setAttribute('d', d);
      const line = elbow.querySelector('.line');
      if (line) line.setAttribute('d', d);
      const flow = elbow.querySelector('.flow');
      if (flow) flow.setAttribute('d', d);
      const port = elbow.querySelector('.port');
      if (port) {
        port.setAttribute('cx', x);
        port.setAttribute('cy', top);
      }
      const headEl = elbow.querySelector('.head');
      if (headEl) headEl.setAttribute('d', head);

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
  // On a first visit the font, the screen images and the styles arrive after the board is drawn and move the cards:
  // draw the wires again whenever something under them settles or changes size (a reload had them cached already).
  if (document.fonts) document.fonts.ready.then(queueElbows);
  window.addEventListener('load', queueElbows);
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG' && e.target.closest('#board')) queueElbows(); }, true);
  const wireSizes = window.ResizeObserver ? new ResizeObserver(queueElbows) : null;
  const watchWires = () => {
    if (!wireSizes) return;
    wireSizes.disconnect();
    document.querySelectorAll('#board, #board .screens, #board .screens > *').forEach((el) => wireSizes.observe(el));
  };

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
    watchWires();
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

    if (productId && can('edit')) peopleOfApp(productId); // ready before anyone opens "Assign to"

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
    const r = issueRights(c);
    const ro = r.edit ? '' : `disabled title="${esc(r.why || 'Developers cannot edit issue details in this app')}"`;
    return `
      <div class="sheet-row ${p} ${c.resolved ? 'is-fixed' : ''} ${c.id === flashId ? 'new' : ''}">
        <label class="flex items-center gap-2 pt-2 text-xs font-medium text-slate-500">
          <input type="checkbox" class="h-4 w-4 accent-indigo-600" data-resolve="${c.id}" ${c.resolved ? 'checked' : ''} ${mayClose(c) ? '' : 'disabled title="A tester or admin closes issues"'}>
          <span class="md:hidden">Fixed</span>
        </label>
        <div><span class="cell-label">Priority</span>
          <select class="input w-full text-sm" data-field="priority" data-id="${c.id}" ${ro}>${priorityOptions(p)}</select></div>
        <div><span class="cell-label">Area</span>
          <select class="input w-full text-sm" data-field="area" data-id="${c.id}" ${ro}>${areaOptions(c.area)}</select></div>
        <div><span class="cell-label">Status</span>
          ${statusSelect(c, 'w-full')}<span class="date mt-1 block">${dateText(c)}</span></div>
        <div><span class="cell-label">Issue</span>
          <textarea class="input cell-text w-full text-sm ${c.resolved ? 'text-slate-400 line-through' : ''}" rows="1" data-field="text" data-id="${c.id}" ${ro}>${esc(c.text)}</textarea></div>
        <div><span class="cell-label">Assigned to</span>
          ${ownerSelect(c)}${peopleBox(c.assignees, c.id, 'text-sm', !r.assign)}</div>
        <div><span class="cell-label">Remarks</span>
          <textarea class="input cell-text w-full text-sm" rows="1" data-field="remarks" data-id="${c.id}" ${ro}>${esc(c.remarks || '')}</textarea></div>
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
  //   each other arrow starts a new flow from that screen, named after the arrow's text
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

  // ---- quick create, FigJam style: a selected box shows a dot on each side; hovering a dot turns it into an
  // arrow button and previews the next box (grey, fading in); a click makes it, joined by an arrow, ready to name.

  const SK_SIDES = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // right, below, left, above
  const SK_GAP = 80;
  // the box the dots show on: the one selected (alone)
  function skPlusTarget() {
    if (sketch.drag || sketch.editing || sketch.tool !== 'select' || sketch.space || sketch.insertMenu) return null;
    const one = sketch.sel.size === 1 && skFind([...sketch.sel][0]);
    return one && SK_SHAPES.includes(one.type) ? one : null;
  }
  function skPlusPoints(e) {
    const off = 28 / sketch.zoom;
    const [cx, cy] = skCenter(e);
    return [[e.x + e.w + off, cy], [cx, e.y + e.h + off], [e.x - off, cy], [cx, e.y - off]];
  }
  function skPlusAt(p) {
    const e = skPlusTarget();
    if (!e) return null;
    const side = skPlusPoints(e).findIndex((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= 14 / sketch.zoom);
    return side >= 0 ? { id: e.id, side } : null;
  }
  // after a condition comes a screen; otherwise the same kind (and size) as the box it grows from
  const skQuickType = (from) => (from.type === 'condition' ? 'screen' : from.type);
  const skSizeOf = (type) => (type === 'condition' ? { w: SK.condW, h: SK.condH } : { w: SK.w, h: SK.h });
  function skQuickSize(from) {
    const type = skQuickType(from);
    return type === from.type ? { w: from.w, h: from.h } : skSizeOf(type);
  }
  // where the next box on `side` of `from` goes: SK_GAP away, or beside a box already there
  function skQuickSpot(from, side) {
    const type = skQuickType(from);
    const { w, h } = skQuickSize(from);
    const [dx, dy] = SK_SIDES[side];
    const [fx, fy] = skCenter(from);
    const c = [fx + dx * (from.w / 2 + SK_GAP + w / 2), fy + dy * (from.h / 2 + SK_GAP + h / 2)];
    const busy = ([x, y]) => sketch.els.some((o) => o.type !== 'arrow'
      && x - w / 2 < o.x + o.w + 20 && x + w / 2 > o.x - 20 && y - h / 2 < o.y + o.h + 20 && y + h / 2 > o.y - 20);
    const step = dx ? h + 40 : w + 40;
    const tries = [0, 1, -1, 2, -2, 3, -3].map((k) => [c[0] + (dx ? 0 : k * step), c[1] + (dx ? k * step : 0)]);
    return { type, w, h, c: tries.find((q) => !busy(q)) || c };
  }
  // a new box next to `from` on `side` (or centred at `at`), joined to it, then its name is written
  function skQuick(id, side, at) {
    const from = skFind(id);
    if (!from) return;
    const spot = skQuickSpot(from, side);
    const { type, w, h } = spot;
    const c = at || spot.c;
    skRemember();
    const el = { id: skId(), type, x: c[0] - w / 2, y: c[1] - h / 2, w, h, text: '', ...(from.color && type === from.type ? { color: from.color } : {}) };
    sketch.els.push(el);
    const [fx, fy] = skCenter(from);
    const a = { id: skId(), type: 'arrow', from: from.id, to: el.id, text: '', x1: fx, y1: fy, x2: c[0], y2: c[1] };
    skAutoBend(a);
    sketch.els.push(a);
    skBorn(el.id);
    sketch.sel = new Set([el.id]);
    skChanged();
    // out of a condition the arrow is a branch: name it first (Enter goes on to the new box)
    if (from.type === 'condition') skEdit(a.id, true, () => skEdit(el.id, true));
    else skEdit(el.id, true);
  }
  // a box just made pops in (only while it is new: the canvas is redrawn on every change)
  function skBorn(id) { sketch.born = { id, t: Date.now() }; }
  const skIsBorn = (id) => sketch.born && sketch.born.id === id && Date.now() - sketch.born.t < 350;

  // ---- a step between two boxes: hover an arrow, click its + and pick Screen / Condition / Popup, or drop a box
  // that is not joined to anything onto an arrow. A → B becomes A → new → B; A's branch name stays on the first arrow.

  const skJoined = (a) => a && a.type === 'arrow' && a.from && a.to && skFind(a.from) && skFind(a.to);
  function skInsertTarget() {
    if (sketch.drag || sketch.editing || sketch.tool !== 'select' || sketch.space) return null;
    if (sketch.insertMenu) return skFind(sketch.insertMenu);
    const hover = sketch.hoverArrow && skFind(sketch.hoverArrow);
    if (skJoined(hover)) return hover;
    const one = sketch.sel.size === 1 && skFind([...sketch.sel][0]);
    return skJoined(one) ? one : null;
  }
  const skInsertPoint = (a) => skCurve(a)[a.text ? 12 : 8]; // beside the branch name, when there is one
  function skInsertAt(p) {
    const a = skInsertTarget();
    if (!a) return null;
    const [x, y] = skInsertPoint(a);
    return Math.hypot(p[0] - x, p[1] - y) <= 13 / sketch.zoom ? a : null;
  }
  // boxes after `start` (following the arrows), but none that lead back to `stop`: they move to make room
  function skDownstream(start, stop) {
    const arrows = sketch.els.filter((x) => x.type === 'arrow' && x.from && x.to);
    const before = new Set();
    for (const q = [stop]; q.length;) {
      const id = q.pop();
      if (before.has(id)) continue;
      before.add(id);
      arrows.forEach((x) => { if (x.to === id) q.push(x.from); });
    }
    const after = new Set();
    for (const q = [start]; q.length;) {
      const id = q.pop();
      if (after.has(id) || before.has(id)) continue;
      after.add(id);
      arrows.forEach((x) => { if (x.from === id) q.push(x.to); });
    }
    return sketch.els.filter((x) => after.has(x.id));
  }
  // A → B becomes A → el → B (el is already on the canvas)
  function skSplit(a, el) {
    const to = a.to;
    a.to = el.id;
    a.bend = 0;
    skAutoBend(a);
    const [x1, y1] = skCenter(el);
    const [x2, y2] = skCenter(skFind(to));
    const b = { id: skId(), type: 'arrow', from: el.id, to, text: el.type === 'condition' ? 'Success' : '', x1, y1, x2, y2 };
    skAutoBend(b);
    sketch.els.push(b);
  }
  // room for a w × h box on arrow a, with a gap on both sides (if there is none, its end box and what follows it
  // move along) → the centre for the box
  function skMakeRoom(a, w, h) {
    const A = skFind(a.from);
    const B = skFind(a.to);
    const [ax, ay] = skCenter(A);
    const [bx, by] = skCenter(B);
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const d = [(bx - ax) / len, (by - ay) / len];
    const need = Math.abs(d[0]) * w + Math.abs(d[1]) * h + 2 * 56;
    const [e1, e2] = [skEdge(A, [bx, by]), skEdge(B, [ax, ay])];
    const gap = Math.hypot(e2[0] - e1[0], e2[1] - e1[1]);
    if (gap < need) skDownstream(B.id, A.id).forEach((x) => { x.x += d[0] * (need - gap); x.y += d[1] * (need - gap); });
    const p1 = skEdge(A, skCenter(B));
    const p2 = skEdge(B, [ax, ay]);
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  }
  function skInsert(arrowId, type) {
    const a = skFind(arrowId);
    if (!skJoined(a)) return;
    skRemember();
    const { w, h } = skSizeOf(type);
    const mid = skMakeRoom(a, w, h);
    const el = { id: skId(), type, x: mid[0] - w / 2, y: mid[1] - h / 2, w, h, text: '' };
    sketch.els.push(el);
    skSplit(a, el);
    sketch.insertMenu = null;
    sketch.hoverArrow = null;
    skBorn(el.id);
    sketch.sel = new Set([el.id]);
    skChanged();
    skEdit(el.id, true);
  }
  // the arrow a dragged box would drop into: the box alone, joined to nothing, over a joined arrow
  function skWireUnder(el) {
    if (!el || !SK_SHAPES.includes(el.type) || sketch.els.some((x) => x.type === 'arrow' && (x.from === el.id || x.to === el.id))) return null;
    return sketch.els.find((x) => skJoined(x) && skCurve(x).slice(3, 14).some((q) => skInside(el, q))) || null;
  }

  // ---- the layer over the drawing: dots, the next-box preview and the + on an arrow. It is only redrawn when it
  // changes, so its animations play once (the drawing under it is redrawn on every move).
  function skOverlay() {
    const z = sketch.zoom;
    const px = 1 / z;
    const box = skPlusTarget();
    const wire = skInsertTarget();
    const key = JSON.stringify([z, box && [box.id, box.x, box.y, box.w, box.h, box.type], sketch.hoverPlus,
      wire && [wire.id, skInsertPoint(wire)], sketch.insertMenu, sketch.hoverInsert]);
    const $g = $('#sketchBody .sk-over').attr('transform', `translate(${sketch.panX} ${sketch.panY}) scale(${z})`);
    skInsertMenu(wire);
    if (key === sketch.overlayKey) return;
    sketch.overlayKey = key;
    const out = [];
    if (box) {
      const hovered = sketch.hoverPlus;
      if (hovered >= 0) {
        // the next box, in grey, with its arrow
        const { type, w, h, c } = skQuickSpot(box, hovered);
        const ghost = { type, x: c[0] - w / 2, y: c[1] - h / 2, w, h };
        const p1 = skEdge(box, c);
        const p2 = skEdge(ghost, skCenter(box));
        const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const head = (sgn) => `${p2[0] - 11 * Math.cos(ang + sgn * 0.5)} ${p2[1] - 11 * Math.sin(ang + sgn * 0.5)}`;
        out.push(`<g class="sk-preview">
          <path d="M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}M${head(1)}L${p2[0]} ${p2[1]}L${head(-1)}" style="stroke-width:${2.5 * px}"/>
          ${type === 'condition'
    ? `<path class="box" d="M${c[0]} ${ghost.y}L${ghost.x + w} ${c[1]}L${c[0]} ${ghost.y + h}L${ghost.x} ${c[1]}Z" style="stroke-width:${1.5 * px}"/>`
    : `<rect class="box" x="${ghost.x}" y="${ghost.y}" width="${w}" height="${h}" rx="10" style="stroke-width:${1.5 * px}"/>`}
        </g>`);
      }
      skPlusPoints(box).forEach(([x, y], i) => {
        if (i === hovered) {
          // the dot grows into a blue button with an arrow pointing where the box goes
          const deg = [-90, 0, 90, 180][i];
          out.push(`<g transform="translate(${x} ${y}) scale(${px})"><g class="sk-dot-btn">
            <circle r="15"/><path d="M0 -6V6M-5 1.5L0 6L5 1.5" transform="rotate(${deg})"/></g></g>`);
        } else {
          out.push(`<g transform="translate(${x} ${y}) scale(${px})"><circle class="sk-dot" r="5.5"/></g>`);
        }
      });
    }
    if (wire) {
      const [x, y] = skInsertPoint(wire);
      const on = sketch.hoverInsert || sketch.insertMenu === wire.id;
      out.push(`<g transform="translate(${x} ${y}) scale(${px})"><g class="sk-wire-btn ${on ? 'on' : ''}">
        <circle r="${on ? 12 : 10}"/><path d="M-4.5 0H4.5M0 -4.5V4.5"/></g></g>`);
    }
    $g.html(out.join(''));
  }
  // the little menu under an arrow's +: what to put between its two boxes
  function skInsertMenu(wire) {
    const $m = $('#sketchBody .sk-insert-menu');
    if (!sketch.insertMenu || !wire || wire.id !== sketch.insertMenu) { $m.addClass('hidden'); return; }
    const [x, y] = skInsertPoint(wire);
    $m.removeClass('hidden').css({ left: x * sketch.zoom + sketch.panX, top: y * sketch.zoom + sketch.panY + 20 });
  }

  // ---- smart guides: moving boxes snap to the edges and centres of the others (pink lines show it)
  function skSnap(boxes, dx, dy) {
    const tol = 6 / sketch.zoom;
    const b = {
      x: Math.min(...boxes.map((o) => o.x)) + dx, y: Math.min(...boxes.map((o) => o.y)) + dy,
      x2: Math.max(...boxes.map((o) => o.x + o.w)) + dx, y2: Math.max(...boxes.map((o) => o.y + o.h)) + dy,
    };
    const others = sketch.els.filter((o) => o.type !== 'arrow' && !sketch.sel.has(o.id));
    const lines = (o, axis) => (axis === 'x' ? [o.x, o.x + o.w / 2, o.x + o.w] : [o.y, o.y + o.h / 2, o.y + o.h]);
    const mine = { x: [b.x, (b.x + b.x2) / 2, b.x2], y: [b.y, (b.y + b.y2) / 2, b.y2] };
    const best = { x: null, y: null };
    ['x', 'y'].forEach((axis) => others.forEach((o) => lines(o, axis).forEach((at) => mine[axis].forEach((m) => {
      const d = at - m;
      if (Math.abs(d) <= tol && (!best[axis] || Math.abs(d) < Math.abs(best[axis].d))) best[axis] = { d, at };
    }))));
    const sx = best.x ? best.x.d : 0;
    const sy = best.y ? best.y.d : 0;
    const guides = [];
    const moved = { x: b.x + sx, y: b.y + sy, w: b.x2 - b.x, h: b.y2 - b.y };
    ['x', 'y'].forEach((axis) => {
      if (!best[axis]) return;
      const { at } = best[axis];
      const hits = [moved, ...others.filter((o) => lines(o, axis).some((v) => Math.abs(v - at) < 0.5))];
      if (axis === 'x') guides.push([at, Math.min(...hits.map((o) => o.y)), at, Math.max(...hits.map((o) => o.y + o.h))]);
      else guides.push([Math.min(...hits.map((o) => o.x)), at, Math.max(...hits.map((o) => o.x + o.w)), at]);
    });
    return { dx: dx + sx, dy: dy + sy, guides };
  }


  // ---- convert existing flow into sketch diagram elements
  function flowToSketch(root) {
    if (!root || !root.screens || !root.screens.length) return [];
    const { lanes, nodes } = diagramLayout(root);
    const els = [];
    const idMap = new Map();
    const colW = 380;
    const rowH = 260;

    lanes.forEach((lane) => {
      lane.flow.screens.forEach((s) => {
        const id = 'sk_' + s.id;
        idMap.set(s.id, id);
        const node = nodes.get(s.id);
        const isCond = isCondition(s);
        const isPop = isPopup(s);
        const type = isCond ? 'condition' : isPop ? 'popup' : 'screen';
        const w = isCond ? SK.condW : SK.w;
        const h = isCond ? SK.condH : SK.h;
        const col = node ? node.col : 0;
        const row = node ? node.row : lane.row;
        const x = 100 + col * colW;
        const y = 140 + row * rowH + (isCond ? -(SK.condH - SK.h) / 2 : 0);
        els.push({
          id,
          type,
          x,
          y,
          w,
          h,
          text: s.name,
          color: isPop ? 'violet' : isCond ? 'yellow' : 'blue',
          existing: true,
          existingId: s.id,
          stepNo: lane.no ? `${lane.no}.${col - lane.col + 1}` : '',
        });
      });
    });

    let arcIndex = 0;
    lanes.forEach((lane) => {
      lane.flow.screens.forEach((s, i) => {
        const isCond = isCondition(s);
        const next = lane.flow.screens[i + 1];

        if (!isCond) {
          if (next) {
            els.push({
              id: skId(),
              type: 'arrow',
              from: idMap.get(s.id),
              to: idMap.get(next.id),
              text: '',
              existing: true,
              bend: 0,
            });
          }
        } else {
          const branches = Array.isArray(s.branches) && s.branches.length ? s.branches : [{ label: 'Next' }];
          let usedNext = false;
          branches.forEach((b) => {
            let targetId = b.targetId;
            if (!targetId && !usedNext && next) {
              targetId = next.id;
              usedNext = true;
            }
            if (targetId && idMap.has(targetId)) {
              const targetNode = nodes.get(targetId);
              const thisNode = nodes.get(s.id);
              const span = targetNode && thisNode ? Math.abs(targetNode.col - thisNode.col) : 1;
              let bend = 0;
              if (targetNode && thisNode && targetNode.row === thisNode.row && span > 1) {
                bend = -150 - (arcIndex++ * 85) - Math.min(span, 5) * 15;
              } else if (targetNode && thisNode && targetNode.row === thisNode.row && targetNode.col < thisNode.col) {
                bend = -150 - (arcIndex++ * 85);
              }
              els.push({
                id: skId(),
                type: 'arrow',
                from: idMap.get(s.id),
                to: idMap.get(targetId),
                text: b.label || '',
                existing: true,
                bend,
              });
            }
          });
          if (next && !usedNext) {
            els.push({
              id: skId(),
              type: 'arrow',
              from: idMap.get(s.id),
              to: idMap.get(next.id),
              text: 'Continue',
              existing: true,
              bend: 0,
            });
          }
        }
      });

      // 3. Arrow from parent step into child lane
      if (lane.from && lane.from.stepId && lane.flow.screens.length) {
        const fromElId = idMap.get(lane.from.stepId);
        const toElId = idMap.get(lane.flow.screens[0].id);
        if (fromElId && toElId) {
          const label = lane.from.branch ? (lane.from.branch.label || '') : '';
          els.push({
            id: skId(),
            type: 'arrow',
            from: fromElId,
            to: toElId,
            text: label,
            existing: true,
            bend: 0,
          });
        }
      }
    });

    return els;
  }

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
      else {
        skipped.add(a.id);
        if (!a.existing) loose += 1;
      }
    });
    if (!shapes.length) return { steps: [], errors, warnings, bad, skipped, empty: true };
    if (loose) warnings.push(`${loose} arrow${loose === 1 ? ' is' : 's are'} not joined to a box at both ends, so ${loose === 1 ? 'it is' : 'they are'} skipped.`);
    const unnamed = shapes.filter((e) => !e.existing && !skName(e));
    unnamed.forEach((e) => bad.add(e.id));
    if (unnamed.length) errors.push(`${unnamed.length} box${unnamed.length === 1 ? ' has' : 'es have'} no name. Double-click a box to write its name.`);

    const outs = new Map(shapes.map((e) => [e.id, []]));
    const ins = new Map(shapes.map((e) => [e.id, 0]));
    arrows.forEach((a) => { outs.get(a.from).push(a); ins.set(a.to, ins.get(a.to) + 1); });
    const leftTop = (p, q) => (p.x - q.x) || (p.y - q.y);
    const starts = shapes.filter((e) => !ins.get(e.id)).sort(leftTop);
    const newStarts = starts.filter((e) => !e.existing);
    if (newStarts.length > 1 || (starts.length > 1 && newStarts.length > 0)) {
      newStarts.forEach((e) => bad.add(e.id));
      errors.push(`Only the first screen can have no arrow coming in, but ${newStarts.length} new boxes have none: ${newStarts.map(quote).join(', ')}. Join them with arrows, or delete the ones you don't need.`);
    }
    const start = starts[0] || shapes.slice().sort(leftTop)[0]; // all in a loop: start top-left

    const placed = new Map(); // shape id → step
    const later = []; // conditions and screens whose other arrows are read after the lane they are in
    const walk = (first, laneName) => {
      const steps = [];
      for (let cur = first; cur && !placed.has(cur.id);) {
        const step = { key: cur.id, type: cur.type, name: skName(cur) };
        if (cur.existingId) step.existingId = cur.existingId;
        if (cur.existing) step.existing = true;
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
          if (!cur.existing && !next.existing) {
            warnings.push(`The arrow ${quote(cur)} → ${quote(byId.get(next.to))} is skipped: a screen can only be in one place. To go back to a screen, point a condition's branch at it.`);
          }
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
        if (!item.cond.existing && item.out.some((a) => !skName(a))) warnings.push(`Name every arrow out of ${quote(item.cond)}: its text is the branch (e.g. Success). Double-click an arrow to write on it.`);
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
            if (!item.cond.existing) warnings.push(`Branch “${label || '—'}” of ${quote(item.cond)} points at a condition, but a branch can only show a screen. It is left empty.`);
            return { label };
          }
          return { label, target: to.id };
        });
      } else {
        item.step.extends = item.out.map((a) => {
          const to = byId.get(a.to);
          if (placed.has(to.id)) {
            skipped.add(a.id);
            if (!item.screen.existing) warnings.push(`The arrow ${quote(item.screen)} → ${quote(to)} is skipped: ${quote(to)} is already in the flow.`);
            return null;
          }
          const name = skName(a) || `${item.laneName} › ${item.step.name}`;
          return { name, steps: walk(to, name).steps };
        }).filter(Boolean);
      }
    }
    const lost = shapes.filter((e) => !placed.has(e.id) && !bad.has(e.id) && !e.existing);
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
    const badge = e.existing && e.stepNo ? `<span class="sk-step-badge">${esc(e.stepNo)}</span>` : '';
    const content = e.type === 'condition'
      ? `<div class="sk-label condition">${badge}<span>${esc(e.text)}</span></div>`
      : `<div class="sk-label ${e.type}">${badge}${esc(e.text)}</div>`;
    return `<foreignObject x="${e.x + inset.x}" y="${e.y + inset.y}" width="${Math.max(1, e.w - inset.x * 2)}" height="${Math.max(1, e.h - inset.y * 2)}">${content}</foreignObject>`;
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
    const dots = skPlusTarget() ? 30 : 0; // clear of the dots on a selected box
    const top = y0 * z + sketch.panY - 52 - dots;
    $bar.removeClass('hidden').css({ left: ((x0 + x1) / 2) * z + sketch.panX, top: top < 8 ? y1 * z + sketch.panY + 14 + dots : top })
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
      const cls = `${plan.skipped.has(e.id) ? 'sk-skipped' : ''} ${skIsBorn(e.id) ? 'sk-born' : ''}`;
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
    // a box dragged over an arrow: it goes in between
    const wire = drag && drag.wire && skFind(drag.wire);
    if (wire) out.push(`<polyline class="sk-wire" points="${skCurve(wire).map((q) => q.join(',')).join(' ')}" style="stroke-width:${6 * px}"/>`);
    if (drag && drag.guides) drag.guides.forEach(([x1, y1, x2, y2]) => out.push(`<line class="sk-guide" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke-width:${px}"/>`));
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
      // from a + handle onto empty canvas: the box that will be made there
      if (from && drag.quick !== undefined && !target) {
        const { w, h } = skQuickSize(from);
        const [x, y] = drag.cur;
        out.push(skQuickType(from) === 'condition'
          ? `<path class="sk-ghost" d="M${x} ${y - h / 2}L${x + w / 2} ${y}L${x} ${y + h / 2}L${x - w / 2} ${y}Z" style="stroke-width:${1.5 * px}"/>`
          : `<rect class="sk-ghost" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" style="stroke-width:${1.5 * px}"/>`);
      }
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
    skOverlay();
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
    const newShapes = sketch.els.filter((e) => SK_SHAPES.includes(e.type) && !e.existing);
    const existingShapes = sketch.els.filter((e) => SK_SHAPES.includes(e.type) && e.existing);

    const screens = (f ? newShapes : all).filter((s) => s.type !== 'condition').length;
    const conds = (f ? newShapes.length : all.length) - screens;
    const paths = (f ? all.filter((s) => !s.existing) : all).reduce((n, s) => n + (s.branches || []).filter((b) => b.path).length + (s.extends || []).length, 0);
    const list = (items, cls) => (items.length ? `<ul class="sk-notes ${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');
    const focused = document.activeElement && document.activeElement.matches('[data-sk-name]');

    const isCreateDisabled = plan.errors.length > 0 || (f ? newShapes.length === 0 : plan.empty);
    const createBtnText = f
      ? (newShapes.length ? `Add ${newShapes.length} step${newShapes.length === 1 ? '' : 's'} to flow` : 'Add to flow')
      : 'Create flow';

    const newStepsToOutline = f ? plan.steps.filter((s) => !s.existing) : plan.steps;

    $('#sketchBody .sk-side').html(`
      ${f ? (existingShapes.length ? `
        <div class="sk-flow-banner">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span class="sk-flow-banner-title truncate">${esc(f.name)}</span>
          </div>
          <p class="sk-flow-banner-desc">${existingShapes.length} existing step${existingShapes.length === 1 ? '' : 's'} on canvas. Select any box and click <b>+</b> to extend, or pick <b>Screen</b> (R) to draw.</p>
        </div>` : `<p class="text-sm text-slate-600">The steps are added after the last step of <b class="text-slate-900">${esc(f.name)}</b>.</p>`)
    : `<label class="block"><span class="field-label">Flow name</span>
          <input class="input w-full" data-sk-name value="${esc(sketch.name || '')}" placeholder="e.g. Sign Up, Add Money" maxlength="200" autocomplete="off"></label>`}
      <div>
        <p class="sk-h">Will be created</p>
        ${(f ? newShapes.length === 0 : plan.empty) ? '<p class="text-sm text-slate-500">Nothing yet. Draw a box to start.</p>'
    : `<p class="mb-2 text-xs text-slate-500">${screens} screen${screens === 1 ? '' : 's'} · ${conds} condition${conds === 1 ? '' : 's'} · ${paths} path${paths === 1 ? '' : 's'}</p>${skOutline(newStepsToOutline)}`}
      </div>
      ${f && newShapes.length === 0 ? '' : list(plan.errors, 'error')}
      ${f && newShapes.length === 0 ? '' : list(plan.warnings, 'warn')}
      <button class="btn-primary w-full justify-center" data-sk-create ${isCreateDisabled ? 'disabled' : ''}>${createBtnText}</button>
      <div class="sk-legend">
        <p class="sk-h">How it reads</p>
        <p><span class="sk-ico screen"></span> Box = screen</p>
        <p><span class="sk-ico popup"></span> Dashed box = popup</p>
        <p><span class="cond-diamond sm"></span> Diamond = condition</p>
        <p>${icon('arrow', 14)} Arrow = the next step. Out of a condition, its text is the branch (Success, Failed …).</p>
        <p>${icon('sticky', 14)} Sticky note = just a note, not created.</p>
        <p>${icon('plus', 14)} Select a box: hover a dot on its side to see the next box, click to add it (drag to point anywhere). While naming a box, Tab does the same (Shift+Tab: below).</p>
        <p>${icon('diamond', 14)} Hover an arrow and click its + to put a screen, condition or popup in between (the steps after it move along), or drop a loose box onto an arrow.</p>
        <p class="text-slate-400">Double-click a box or an arrow to write on it; pick a colour above what is selected. Alt-drag copies, Ctrl+C / Ctrl+V copy and paste. Your drawing is kept in this browser until it is created.</p>
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
    const targetFlow = target.flowId ? findFlow(target.flowId) : null;
    let initialEls = [];
    if (targetFlow && targetFlow.screens && targetFlow.screens.length) {
      if (!saved || !Array.isArray(saved.els) || !saved.els.length || !saved.els.some((e) => e.existing)) {
        initialEls = flowToSketch(targetFlow);
      } else {
        initialEls = saved.els;
      }
    } else if (saved && Array.isArray(saved.els)) {
      initialEls = saved.els;
    }
    Object.assign(sketch, {
      open: true, target, key, els: initialEls, name: (saved && saved.name) || '',
      sel: new Set(), tool: 'select', past: [], future: [], editing: null, drag: null, space: false, hoverPlus: -1, hoverArrow: null, hoverInsert: false,
      insertMenu: null, born: null, overlayKey: null,
    });
    const f = skFlow();
    $('#sketchBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('pen', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${f ? `Draw into ${esc(f.name)}` : `Draw a new flow${m ? ` · ${esc(m.name)}` : ''}`}</h3>
          <p class="truncate text-xs text-slate-500">Draw boxes and join them with arrows, like in FigJam: select a box and click a dot on its side for the next step. When the list on the right reads right, create it: the screens, conditions and paths are made for you.</p>
        </div>
        <button class="icon-btn" data-close-sketch title="Close (your drawing is kept)">${icon('close', 18)}</button>
      </div>
      <div class="sk-body">
        <div class="sk-stage">
          <svg class="sk-svg" aria-label="Drawing canvas"><g class="sk-world"></g><g class="sk-over"></g></svg>
          <div class="sk-island sk-insert-menu hidden">
            <span class="sk-insert-h">Add between</span>
            <button class="sk-insert-opt" data-sk-insert="screen">${icon('box', 16)} Screen</button>
            <button class="sk-insert-opt" data-sk-insert="condition">${icon('diamond', 16)} Condition</button>
            <button class="sk-insert-opt" data-sk-insert="popup">${icon('popup', 16)} Popup</button>
          </div>
          <div class="sk-island sk-toolbar">
            ${SK_TOOLS.map((t) => `<button class="sk-tool" data-sk-tool="${t.id}" title="${t.title} — ${t.key.toUpperCase()}${t.no ? ` or ${t.no}` : ''}">${icon(t.icon, 18)}${t.no ? `<span class="sk-key">${t.no}</span>` : ''}</button>`).join('')}
          </div>
          <div class="sk-island sk-corner">
            ${f && f.screens.length ? `<button class="sk-tool" data-sk-reload-flow title="Reload original flow diagram">${icon('diagram', 16)}</button>` : ''}
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
            <p>Pick <b>Screen</b> (R) and click the canvas, name it, then press <b>Tab</b> for the next screen. Or select a box
              and click a dot on any side of it. To put a step in between, hover an arrow and click its <b>+</b>.<br>
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
    svg.addEventListener('pointerleave', () => {
      if (sketch.drag || (sketch.hoverPlus < 0 && !sketch.hoverArrow)) return;
      Object.assign(sketch, { hoverPlus: -1, hoverArrow: null, hoverInsert: false });
      skDraw();
    });
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
    if (sketch.insertMenu) { sketch.insertMenu = null; skDraw(); return; }
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
    const wire = tool === 'select' && e.button === 0 && skInsertAt(p);
    if (wire) {
      sketch.insertMenu = sketch.insertMenu === wire.id ? null : wire.id;
      skDraw();
      return;
    }
    if (sketch.insertMenu) sketch.insertMenu = null;
    if (e.button === 1 || tool === 'hand' || sketch.space) {
      drag = { kind: 'pan', x: e.clientX, y: e.clientY, panX: sketch.panX, panY: sketch.panY };
    } else if (tool === 'select') {
      const one = sketch.sel.size === 1 && skFind([...sketch.sel][0]);
      const near = (q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= 8 / sketch.zoom;
      const corner = one && SK_SHAPES.includes(one.type) ? skCorners(one).findIndex(near) : -1;
      const end = one && one.type === 'arrow' ? skArrowHandles(one).findIndex(near) : -1;
      const plus = skPlusAt(p);
      if (plus) {
        // click: the next box on that side; drag: an arrow to a box, or to empty canvas for a new box there
        drag = { kind: 'arrow', from: plus.id, quick: plus.side, start: p, cur: p };
      } else if (corner >= 0) {
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
      if (sketch.tool !== 'select' || sketch.space) return;
      const p = skWorld(e);
      const plus = skPlusAt(p);
      const ins = !plus && skInsertAt(p);
      const hit = !plus && !ins && skHit(p);
      $('#sketchBody .sk-stage').toggleClass('over-element', Boolean(hit)).toggleClass('over-plus', Boolean(plus || ins));
      // an arrow under the pointer shows its +; it stays while the pointer is on the + itself
      const arrow = ins ? ins.id : hit && skJoined(hit) ? hit.id : null;
      const side = plus ? plus.side : -1;
      if (side !== sketch.hoverPlus || arrow !== sketch.hoverArrow || Boolean(ins) !== sketch.hoverInsert) {
        Object.assign(sketch, { hoverPlus: side, hoverArrow: arrow, hoverInsert: Boolean(ins) });
        skOverlay();
      }
      return;
    }
    const p = skWorld(e);
    if (drag.kind === 'pan') {
      sketch.panX = drag.panX + e.clientX - drag.x;
      sketch.panY = drag.panY + e.clientY - drag.y;
    } else if (drag.kind === 'move') {
      let dx = p[0] - drag.start[0];
      let dy = p[1] - drag.start[1];
      if (!drag.moved) {
        if (Math.hypot(dx, dy) * sketch.zoom < 3) return;
        skRemember();
        drag.moved = true;
        // Alt-drag: move copies, the originals stay where they are
        if (e.altKey) {
          const copies = skClone(skSnapshot(sketch.els.filter((x) => sketch.sel.has(x.id))), 0);
          sketch.els.push(...copies);
          sketch.sel = new Set(copies.map((x) => x.id));
        }
        // an arrow moved without the box it is joined to lets go of it
        sketch.els.filter((a) => a.type === 'arrow' && sketch.sel.has(a.id)).forEach((a) => {
          const [p1, p2] = skEnds(a);
          if (a.from && !sketch.sel.has(a.from)) { a.from = null; [a.x1, a.y1] = p1; }
          if (a.to && !sketch.sel.has(a.to)) { a.to = null; [a.x2, a.y2] = p2; }
        });
        drag.orig = new Map(sketch.els.filter((x) => sketch.sel.has(x.id)).map((x) => [x.id, { ...x }]));
      }
      const boxes = [...drag.orig.values()].filter((o) => o.type !== 'arrow');
      drag.guides = null;
      if (boxes.length) ({ dx, dy, guides: drag.guides } = skSnap(boxes, dx, dy));
      drag.orig.forEach((o, id) => {
        const x = skFind(id);
        if (!x) return;
        if (x.type === 'arrow') Object.assign(x, { x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy });
        else Object.assign(x, { x: o.x + dx, y: o.y + dy });
      });
      const alone = drag.orig.size === 1 && skFind([...drag.orig.keys()][0]);
      const wire = skWireUnder(alone);
      drag.wire = wire && wire.id;
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
      if (drag.quick !== undefined && !drag.over) { skQuick(drag.from, drag.quick, far ? drag.cur : null); return; }
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
    if (drag.kind === 'move' && drag.wire) {
      const el = skFind([...drag.orig.keys()][0]);
      const wire = skFind(drag.wire);
      if (el && skJoined(wire) && skWireUnder(el) === wire) {
        // it settles in the middle of the gap (the steps after it move along when the gap is too small)
        const mid = skMakeRoom(wire, el.w, el.h);
        Object.assign(el, { x: mid[0] - el.w / 2, y: mid[1] - el.h / 2 });
        skSplit(wire, el);
        skBorn(el.id);
      }
    }
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

  // next: what to do once the text is finished with Enter (e.g. name the new box after its branch)
  function skEdit(id, fresh, next) {
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
    let after = null;
    $t.on('input', fit)
      .on('keydown', (ev) => {
        ev.stopPropagation();
        // Tab while naming a box: the next box to its right (Shift+Tab: below), joined, ready to name
        if (ev.key === 'Tab' && SK_SHAPES.includes(el.type)) { ev.preventDefault(); after = () => skQuick(id, ev.shiftKey ? 1 : 0); t.blur(); return; }
        const done = ev.key === 'Escape' || (ev.key === 'Enter' && (note ? ev.metaKey || ev.ctrlKey : !ev.shiftKey));
        if (done) { ev.preventDefault(); if (ev.key === 'Enter') after = next; t.blur(); }
      })
      .on('blur', () => { skEndEdit(id, t.value, fresh); if (after) after(); });
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
  // copies of elements as they are drawn now (an arrow with where its ends are), safe to keep after they change
  const skSnapshot = (list) => list.map((x) => {
    if (x.type !== 'arrow') return { ...x };
    const [p1, p2] = skEnds(x);
    return { ...x, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] };
  });
  // new elements from a snapshot, `off` further down and right; a copied arrow keeps a join only to a copied box
  function skClone(snap, off) {
    const ids = new Map(snap.map((x) => [x.id, skId()]));
    return snap.map((x) => {
      const c = { ...x, id: ids.get(x.id) };
      if (c.type !== 'arrow') return Object.assign(c, { x: x.x + off, y: x.y + off });
      return Object.assign(c, { from: ids.get(x.from) || null, to: ids.get(x.to) || null, x1: x.x1 + off, y1: x.y1 + off, x2: x.x2 + off, y2: x.y2 + off });
    });
  }
  function skAdd(copies) {
    skRemember();
    sketch.els.push(...copies);
    sketch.sel = new Set(copies.map((x) => x.id));
    skChanged();
  }
  function skDuplicate() {
    const picked = sketch.els.filter((x) => sketch.sel.has(x.id));
    if (picked.length) skAdd(skClone(skSnapshot(picked), 24));
  }
  // Ctrl+C / Ctrl+X / Ctrl+V (kept while the page is open, so it also pastes into another flow's drawing)
  let skClip = null;
  function skCopy() {
    const picked = sketch.els.filter((x) => sketch.sel.has(x.id));
    if (!picked.length) return false;
    skClip = { els: skSnapshot(picked), pasted: 0 };
    return true;
  }
  function skPaste() {
    if (!skClip) return;
    skClip.pasted += 1;
    skAdd(skClone(skClip.els, 24 * skClip.pasted));
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
    if (mod && k === 'c') { if (skCopy()) e.preventDefault(); return; }
    if (mod && k === 'x') { if (skCopy()) { e.preventDefault(); skDelete(); } return; }
    if (mod && k === 'v') { if (skClip) { e.preventDefault(); skPaste(); } return; }
    if (mod && (k === '=' || k === '+' || k === '-')) { e.preventDefault(); skZoomTo(sketch.zoom * (k === '-' ? 0.9 : 1.1)); return; }
    if (mod) return;
    if (k === 'delete' || k === 'backspace') { e.preventDefault(); skDelete(); return; }
    if (k === 'enter' && sketch.sel.size === 1) { e.preventDefault(); skEdit([...sketch.sel][0]); return; }
    if (k === 'tab' && sketch.sel.size === 1 && SK_SHAPES.includes((skFind([...sketch.sel][0]) || {}).type)) {
      e.preventDefault();
      skQuick([...sketch.sel][0], e.shiftKey ? 1 : 0);
      return;
    }
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
  $doc.on('click', '[data-sk-insert]', function () { if (sketch.insertMenu) skInsert(sketch.insertMenu, $(this).data('sk-insert')); });
  $doc.on('click', '[data-sk-undo]', () => skStep(sketch.past, sketch.future));
  $doc.on('click', '[data-sk-redo]', () => skStep(sketch.future, sketch.past));
  $doc.on('click', '[data-sk-zoom]', function () {
    const step = Number($(this).data('sk-zoom'));
    skZoomTo(step ? sketch.zoom * (step > 0 ? 1.1 : 1 / 1.1) : 1);
  });
  $doc.on('click', '[data-sk-fit]', () => { skFit(); skDraw(); });
  $doc.on('click', '[data-sk-reload-flow]', function () {
    const f = skFlow();
    if (!f || !f.screens || !f.screens.length) return;
    skRemember();
    sketch.els = flowToSketch(f);
    sketch.sel = new Set();
    skFit();
    skChanged();
    toast('Flow diagram reloaded');
  });
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
  // path names follow the flow name; not redrawn in the middle of a click (the name loses focus on the press, and
  // redrawing then would swap the Create button out from under the pointer, losing the click)
  let skPressed = false;
  let skPanelLater = false;
  document.addEventListener('pointerdown', () => { skPressed = true; }, true);
  document.addEventListener('pointerup', () => {
    skPressed = false;
    if (skPanelLater) { skPanelLater = false; setTimeout(skPanel); } // after this press's click
  }, true);
  $doc.on('change', '[data-sk-name]', () => { if (skPressed) skPanelLater = true; else skPanel(); });
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
    const newCount = sketch.els.filter((x) => plan.placed.has(x.id) && !x.existing).length;
    if (f && newCount === 0) {
      toast('No new steps to add');
      return;
    }
    const steps = plan.steps;
    const count = newCount || sketch.els.filter((x) => plan.placed.has(x.id)).length;
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
        ? `<button class="popup-nav next fork" data-popup-choose title="Next is a decision: ${esc(next.condition.name)} (→)">${icon('fork', 18)}<span class="fork-n">${next.choices.length}</span></button>
          <span class="popup-nav-hint" data-popup-choose><span class="cond-diamond sm"></span>${esc(next.condition.name)}<b>${next.choices.length} way${next.choices.length === 1 ? '' : 's'}</b></span>
          ${decisionPanel(s, next)}`
        : `<button class="popup-nav next" data-popup-go="${next ? next.id : ''}" title="Next screen in this flow (→)" ${next ? '' : 'disabled'}>${icon('right', 20)}</button>`}`);
  }

  // → into a condition: a decision card over the popup. The question (the condition's name), then one card per
  // answer: "If <answer> → goes to <screen>" with a small picture of that screen, and its flow when it's another one.
  // 1…9 pick an answer, Esc (or a click outside the card) stays on this screen.
  const ANSWER_COLORS = ['#4f46e5', '#0891b2', '#7c3aed', '#db2777', '#0d9488', '#ca8a04'];
  const TONE_COLORS = { success: '#16a34a', pending: '#ea580c', fail: '#dc2626' };
  function decisionPanel(s, next) {
    const cards = next.choices.map((c, k) => {
      const color = TONE_COLORS[tone(c.branch.label)] || ANSWER_COLORS[k % ANSWER_COLORS.length];
      const thumb = c.screen.image
        ? `<img src="${esc(imageUrl(c.screen.image, 'sm'))}" alt="" loading="lazy" draggable="false">`
        : `<span class="decide-wf">${icon(isPopup(c.screen) ? 'popup' : 'grid', 18)}</span>`;
      return `<button class="popup-choice decide-opt" data-popup-go="${c.screen.id}" style="--tone:${color}">
          <span class="decide-thumb">${thumb}</span>
          <span class="decide-body">
            <span class="decide-if">If</span>
            <span class="decide-answer">${esc(c.branch.label || 'Otherwise')}</span>
            <span class="decide-goes">${icon('right', 12)} goes to</span>
            <span class="decide-target">${esc(c.screen.name)}</span>
            ${c.flow && c.flow.id !== s.flowId ? `<span class="decide-flow">${icon('fork', 11)} ${esc(c.flow.name)}</span>` : ''}
          </span>
          <kbd>${k + 1}</kbd>
        </button>`;
    }).join('');
    return `<div class="popup-choices decide hidden">
      <div class="decide-card" role="dialog" aria-label="Choose where to continue">
        <div class="decide-head">
          <span class="decide-icon"><span class="cond-diamond"></span></span>
          <div class="min-w-0 flex-1">
            <p class="decide-kicker">Next step is a decision</p>
            <h4 class="decide-q">${esc(next.condition.name)}</h4>
            <p class="decide-sub">After <b>${esc(s.name)}</b>, the app goes one of ${next.choices.length} ways. Pick the case to follow.</p>
          </div>
          <button class="icon-btn" data-decide-close title="Stay here (Esc)">${icon('close', 16)}</button>
        </div>
        <div class="decide-grid">${cards || '<p class="decide-empty">No answer of this decision leads to a screen yet. Add one on the condition in the flow.</p>'}</div>
        <p class="decide-foot"><kbd>1</kbd>–<kbd>${Math.max(1, next.choices.length)}</kbd> to pick · <kbd>Esc</kbd> to stay on this screen</p>
      </div>
    </div>`;
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
  // openTeamsSend({ title, count, columns: [{ id, label, on }], people: [{ id, name, teams }], webhook, send, log, share })
  //   webhook: the app has a Teams channel (Workflows webhook, Sanity → Teams channel)
  //   send({ columns, userIds, note, mode, access, button }) → jqXHR. mode 'channel': the server posts to the app's channel
  //   and answers { teams, rows }; mode 'card': it answers { card, direct, people, rows } and this browser sends it
  //   from your own Teams (public/graph.js); mode 'none' (share only): nothing is sent.
  //   log({ target, chatId, destination, messageId, ok, error, note }) (optional): told how a send from your own
  //   Teams went, so the server can keep a record (the server records the app's channel itself).
  //   excel (optional): the file name, when the whole sheet can go along as an Excel file (send gets { excel: true }
  //   and, for mode 'card', answers it as { excel: { name, type, base64 } } to attach from your OneDrive)
  //   share (optional): { access: 'view' | 'edit', picked: [user id] }: share a whole sheet instead of rows. There are
  //   no columns, the people ticked are who it is shared with (always needed), and "Don't message" only gives access.
  // Where it goes: 'direct' = a chat with each person picked, 'mine' = any of your own Teams chats (people you chat
  // with, group chats you are in), 'app' = the app's channel. The last choice (and chats) is remembered here.

  let teamsSend = null;
  const TEAMS_TARGETS = [['direct', 'Direct message'], ['mine', 'My Teams chats'], ['app', 'App channel']];
  const teamsTargets = (webhook) => TEAMS_TARGETS.filter(([k]) => (k === 'app' ? webhook : window.flowGraph.configured()));
  const canSendTeams = (webhook) => teamsTargets(webhook).length > 0;
  // the chats picked last time (was one chat, kept as 'teamsChat')
  const lastChats = () => {
    try { const list = JSON.parse(storage('get', 'teamsChats')); if (Array.isArray(list)) return list; } catch (e) { /* not saved yet */ }
    return [storage('get', 'teamsChat')].filter(Boolean);
  };

  // ---- a Teams-like "To:" field: people (or chats) as chips with their initials, typed to find more
  // tpick(name, [{ id, name, sub, kind }], picked Set, placeholder) → HTML; the picks stay checkboxes named `name`
  // (hidden), so the form reads them as before.
  const AVATAR_COLORS = ['#6264a7', '#c4314b', '#0f7b6c', '#ca5010', '#8764b8', '#038387', '#498205', '#986f0b'];
  const initials = (name) => (String(name).trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('') || '?').toUpperCase();
  function avatar(name, kind) {
    let h = 0;
    for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return `<span class="tp-av" style="background:${AVATAR_COLORS[h % AVATAR_COLORS.length]}">${kind === 'group' ? icon('user', 12) : esc(initials(name))}</span>`;
  }
  const tpick = (name, items, picked, placeholder) => `<div class="tpick" data-tpick="${name}">
      <div class="tpick-box"><span class="tpick-to">To:</span><span class="contents" data-tpick-chips></span>
        <input class="tpick-input" placeholder="${esc(placeholder)}" autocomplete="off" data-tpick-input></div>
      <div class="tpick-menu hidden" data-tpick-menu></div>
      <div class="hidden">${items.map((x) => `<input type="checkbox" name="${name}" value="${esc(x.id)}" data-name="${esc(x.name)}" data-sub="${esc(x.sub || '')}" data-kind="${x.kind || ''}" ${picked.has(x.id) ? 'checked' : ''}>`).join('')}</div>
    </div>`;
  const tpickBoxes = (root) => $(root).find('input[type=checkbox]');
  function tpickSync(root) {
    $(root).find('[data-tpick-chips]').html(tpickBoxes(root).filter(':checked').map((i, el) => `<span class="tp-chip">${avatar(el.dataset.name, el.dataset.kind)}
      <span class="truncate">${esc(el.dataset.name)}</span><button type="button" data-tpick-remove="${esc(el.value)}" title="Remove">${icon('close', 12)}</button></span>`).get().join(''));
    $(root).find('[data-tpick-input]').attr('placeholder', tpickBoxes(root).filter(':checked').length ? '' : $(root).find('[data-tpick-input]').data('placeholder'));
    countTeamsPicks();
  }
  function tpickMenu(root) {
    const q = $(root).find('[data-tpick-input]').val().trim().toLowerCase();
    const list = tpickBoxes(root).not(':checked').filter((i, el) => !q || el.dataset.name.toLowerCase().includes(q)).slice(0, 50).get();
    $(root).find('[data-tpick-menu]').html(list.map((el, i) => `<button type="button" class="tp-opt ${i === 0 ? 'on' : ''}" data-tpick-add="${esc(el.value)}">
        ${avatar(el.dataset.name, el.dataset.kind)}<span class="min-w-0 flex-1"><span class="block truncate">${esc(el.dataset.name)}</span>
        ${el.dataset.sub ? `<span class="tp-sub">${esc(el.dataset.sub)}</span>` : ''}</span></button>`).join('')
      || `<p class="tp-empty">${q ? 'Nobody matches' : tpickBoxes(root).length ? 'Everyone is added' : 'Nothing to pick yet'}</p>`).removeClass('hidden');
  }
  const tpickSet = (root, id, on) => {
    tpickBoxes(root).filter((i, el) => el.value === String(id)).prop('checked', on);
    tpickSync(root);
  };
  $doc.on('focus input', '[data-tpick-input]', function () { tpickMenu($(this).closest('.tpick')); });
  $doc.on('blur', '[data-tpick-input]', function () { const root = $(this).closest('.tpick'); setTimeout(() => root.find('[data-tpick-menu]').addClass('hidden'), 120); });
  $doc.on('mousedown', '[data-tpick-add]', function (e) {
    e.preventDefault(); // keep typing in the field
    const root = $(this).closest('.tpick');
    root.find('[data-tpick-input]').val('');
    tpickSet(root, $(this).data('tpick-add'), true);
    tpickMenu(root);
  });
  $doc.on('click', '[data-tpick-remove]', function () { tpickSet($(this).closest('.tpick'), $(this).data('tpick-remove'), false); });
  $doc.on('mousedown', '.tpick-box', function (e) { if (!$(e.target).closest('button, input').length) { e.preventDefault(); $(this).find('[data-tpick-input]').trigger('focus'); } });
  $doc.on('keydown', '[data-tpick-input]', function (e) {
    const root = $(this).closest('.tpick');
    const opts = root.find('[data-tpick-add]');
    const at = opts.index(opts.filter('.on'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = opts.eq(Math.max(0, Math.min(opts.length - 1, at + (e.key === 'ArrowDown' ? 1 : -1))));
      opts.removeClass('on');
      if (next.length) next.addClass('on')[0].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault(); // not the form's submit
      if (at >= 0) opts.eq(at).trigger('mousedown');
    } else if (e.key === 'Backspace' && !this.value) {
      const last = tpickBoxes(root).filter(':checked').last();
      if (last.length) tpickSet(root, last.val(), false);
    } else if (e.key === 'Escape' && !root.find('[data-tpick-menu]').hasClass('hidden')) {
      e.stopImmediatePropagation();
      root.find('[data-tpick-menu]').addClass('hidden');
    }
  });

  function openTeamsSend({ title, count, columns, people, webhook, send, log, share, excel }) {
    const targets = [...teamsTargets(webhook), ...(share ? [['none', 'Don\'t message']] : [])];
    if (!targets.length) { dialog.alert('This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.', 'Teams'); return; }
    const last = storage('get', 'teamsTarget');
    teamsSend = {
      send, count, log, share,
      target: targets.some(([k]) => k === last) ? last : targets[0][0],
      chats: null, chatPicks: new Set(lastChats()),
    };
    const pick = (name, value, label, on) => `<label class="teams-pick"><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="${name}" value="${esc(value)}" ${on ? 'checked' : ''}> ${label}</label>`;
    const allNone = (name) => `<button type="button" class="text-xs text-indigo-600 hover:underline" data-teams-all="${name}">All</button>
      <button type="button" class="text-xs text-indigo-600 hover:underline" data-teams-none="${name}">None</button>`;
    const picked = new Set(share ? share.picked || [] : []);
    $('#teamsForm').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('share', 18)}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${esc(title)}</h3>
          <p class="text-xs text-slate-500">${count} row${count === 1 ? '' : 's'}${share ? '' : count > 40 ? ' (the first 40 are listed, with a link to the rest)' : ''}</p>
        </div>
        <button type="button" class="icon-btn" data-close-teams title="Close">${icon('close', 18)}</button>
      </div>
      <div class="space-y-4 px-5 py-4">
        ${share ? `
        <div>
          <span class="field-label">They can</span>
          <div class="seg">${[['view', 'View'], ['edit', 'Edit']].map(([k, label]) => `<button type="button" data-teams-access="${k}" class="${k === share.access ? 'on' : ''}">${label}</button>`).join('')}</div>
          <p class="mt-1.5 text-xs text-slate-500">View-only logins can never edit. Nobody loses access they already have.</p>
        </div>` : ''}
        <div>
          <span class="field-label">${share ? 'Tell them on Teams' : 'Send to'}</span>
          ${targets.length > 1 ? `<div class="seg">${targets.map(([k, label]) => `<button type="button" data-teams-target="${k}">${label}</button>`).join('')}</div>` : ''}
          <p class="mt-1.5 text-xs text-slate-500" data-teams-hint></p>
          <div class="mt-2 hidden" data-teams-mine>
            <div class="flex items-center gap-2"><span class="field-label flex-1">Chats <span class="font-normal text-slate-400" data-teams-count="chat"></span></span>${allNone('chat')}</div>
            <div data-tpick-wrap="chat">${tpick('chat', [], new Set(), 'Load your chats first')}</div>
            <button type="button" class="mt-1.5 text-xs text-indigo-600 hover:underline" data-teams-load>Load my chats</button>
          </div>
        </div>
        ${columns ? `
        <div>
          <div class="flex items-center gap-2"><span class="field-label flex-1">Columns to send</span>${allNone('col')}</div>
          <div class="teams-picks pills">${columns.map((c) => pick('col', c.id, esc(c.label), c.on !== false)).join('')}</div>
        </div>` : ''}
        ${excel ? `
        <label class="tp-file"><input type="checkbox" name="excel" class="h-4 w-4 accent-indigo-600">
          <span class="tp-xls">XLS</span>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-slate-800">Attach the whole sheet as Excel</span>
            <span class="block truncate text-xs text-slate-500">${esc(excel)} · every row and column, <span data-teams-excel-how></span></span></span></label>` : ''}
        <div>
          <div class="flex items-center gap-2"><span class="field-label flex-1"><span data-teams-people-label>@mention</span> <span class="font-normal text-slate-400" data-teams-count="user"></span></span>
            ${people.length > 1 ? allNone('user') : ''}</div>
          ${people.length ? tpick('user', people.map((u) => ({ id: u.id, name: u.name, sub: u.teams ? '' : 'No Teams email yet' })), picked, 'Type a name')
            : '<p class="text-sm text-slate-400">Nobody else can open this app.</p>'}
        </div>
        <label class="block"><span class="field-label">Message <span class="font-normal text-slate-400">(optional)</span></span>
          <textarea class="input w-full" name="note" rows="2" maxlength="1000" placeholder="${share ? 'e.g. Please fill in your rows by Friday' : 'e.g. Please check these before the 6 pm build'}"></textarea></label>
        <p class="dialog-error hidden"></p>
      </div>
      <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button type="button" class="btn-secondary" data-close-teams>Cancel</button>
        <button class="btn-primary" data-teams-submit>${icon('share', 14)} Send</button>
      </div>`);
    teamsSend.people = people;
    $('#teamsForm [data-tpick-input]').each((i, el) => $(el).data('placeholder', el.placeholder));
    $('#teamsForm .tpick').each((i, el) => tpickSync(el));
    showTeamsTarget();
    $('#teamsModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }

  function showTeamsTarget() {
    const t = teamsSend.target;
    const connected = Boolean(window.flowGraph.account());
    const signIn = connected ? '' : ' (you sign in to Microsoft once)';
    $('[data-teams-target]').each((i, el) => $(el).toggleClass('on', $(el).data('teams-target') === t));
    $('[data-teams-hint]').text((teamsSend.share ? {
      direct: `Each person you tick gets access and a link to the sheet in a chat with you, sent from your Teams${signIn}.`,
      mine: `Each person you tick gets access; the link is posted as you in every chat you pick, @mentioning them${signIn}.`,
      app: 'Each person you tick gets access; the link is posted in this app\'s Teams channel, @mentioning them.',
      none: 'Each person you tick gets access. Nothing is sent on Teams: they find it under Sheets.',
    } : {
      direct: `Each person you tick gets it in a chat with you, sent from your Teams${signIn}.`,
      mine: `Sent as you to every chat you pick (people you chat with, group chats you are in), @mentioning the people you tick${signIn}.`,
      app: 'Posted in this app\'s Teams channel, @mentioning the people you tick.',
    })[t]);
    $('[data-teams-people-label]').html(teamsSend.share ? 'Share with' : t === 'direct' ? 'Send to' : '@mention <span class="font-normal text-slate-400">(optional)</span>');
    $('[data-teams-submit]').html(`${icon('share', 14)} ${teamsSend.share ? (t === 'none' ? 'Share' : 'Share and send') : t === 'direct' ? 'Send messages' : 'Post on Teams'}`);
    $('[data-teams-mine]').toggleClass('hidden', t !== 'mine');
    // the channel can't take files: it gets a Download Excel button instead; "Don't message" sends nothing
    $('.tp-file').toggleClass('hidden', t === 'none');
    $('[data-teams-excel-how]').text(t === 'app' ? 'as a Download Excel button in the post' : 'attached from your OneDrive');
    $('[data-teams-load]').toggleClass('hidden', Boolean(teamsSend.chats));
    // with Teams connected the list loads by itself; else after a click (it may need the sign-in popup)
    if (t === 'mine' && !teamsSend.chats && connected) loadMyChats(true);
  }

  // "3 picked" next to people and chats
  function countTeamsPicks() {
    $('[data-teams-count]').each((i, el) => {
      const n = $(`#teamsForm [name="${$(el).data('teams-count')}"]:checked`).length;
      $(el).text(n ? `· ${n} picked` : '');
    });
  }

  // Your chats in one list: People (1:1 chats) and Groups (group chats you are in); tick as many as you like
  function loadMyChats(quiet) {
    const $err = $('#teamsForm .dialog-error');
    return window.flowGraph.chatsList().then((list) => {
      if (!teamsSend) return;
      teamsSend.chats = list;
      $('[data-tpick-wrap="chat"]').html(tpick('chat', list.map((x) => ({ id: x.id, name: x.name, kind: x.kind, sub: x.kind === 'group' ? 'Group chat' : 'Chat' })),
        teamsSend.chatPicks, 'Type a person or group chat'));
      const $in = $('[data-tpick-wrap="chat"] [data-tpick-input]');
      $in.data('placeholder', $in.attr('placeholder'));
      tpickSync($('[data-tpick-wrap="chat"] .tpick'));
      $('[data-teams-load]').addClass('hidden');
      if (!list.length) $err.text('You have no chats on Teams yet.').removeClass('hidden');
      renderAccount();
    }).catch((err) => { if (!quiet) $err.text(err.message).removeClass('hidden'); });
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
    $('#teamsForm .tpick').each((i, el) => tpickSync(el));
    countTeamsPicks();
  });
  $doc.on('click', '[data-teams-target]', function () {
    teamsSend.target = $(this).data('teams-target');
    $('#teamsForm .dialog-error').addClass('hidden');
    showTeamsTarget();
  });
  $doc.on('click', '[data-teams-access]', function () {
    teamsSend.share.access = $(this).data('teams-access');
    $('[data-teams-access]').each((i, el) => $(el).toggleClass('on', $(el).data('teams-access') === teamsSend.share.access));
  });
  $doc.on('click', '[data-teams-load]', () => loadMyChats(false));

  // "Sent to A, B" (+ who could not be reached, and why)
  function teamsDirectResult(results) {
    const sent = results.filter((x) => x.ok).map((x) => x.name);
    const failed = results.filter((x) => !x.ok);
    if (!failed.length) { toast(`Sent on Teams to ${sent.join(', ')}`); return; }
    dialog.alert(`${sent.length ? `Sent to ${sent.join(', ')}. ` : ''}Not sent to ${failed.map((x) => `${x.name} (${x.error})`).join(', ')}.`, sent.length ? 'Partly sent' : 'Not sent');
  }

  // The same message in each chat, one after the other → [{ id, name, ok, error, messageId }]
  function sendToChats(ids, card, file) {
    const name = (id) => ((teamsSend.chats || []).find((x) => x.id === id) || {}).name || 'a chat';
    return ids.reduce((done, id) => done.then((out) => window.flowGraph.sendChat(id, card, file).then(
      (msg) => [...out, { id, name: name(id), ok: true, messageId: msg && msg.id }],
      (err) => [...out, { id, name: name(id), ok: false, error: err.message }],
    )), Promise.resolve([]));
  }

  $('#teamsForm').on('submit', function (e) {
    e.preventDefault();
    const $f = $(this);
    const $err = $f.find('.dialog-error').addClass('hidden');
    const fail = (msg) => $err.text(msg).removeClass('hidden');
    const picked = (name) => $f.find(`[name="${name}"]:checked`).map((i, el) => el.value).get();
    const { target, share } = teamsSend;
    const columns = picked('col');
    const userIds = picked('user');
    const chats = picked('chat');
    if (!share && !columns.length) { fail('Pick at least one column.'); return; }
    if (share && !userIds.length) { fail('Tick who to share it with.'); return; }
    if (target === 'direct' && !userIds.length) { fail('Tick who to send it to.'); return; }
    if (target === 'direct' && !teamsSend.people.some((u) => userIds.includes(u.id) && u.teams)) {
      fail('None of them has a Teams email yet. A super admin adds it to their login in Admin (or they connect Teams themselves).');
      return;
    }
    if (target === 'mine' && !chats.length) { fail('Tick at least one person or group chat.'); return; }
    storage('set', 'teamsTarget', target);
    const button = $f.find('[data-teams-submit]')[0];
    const val = { columns, userIds, note: $f.find('[name=note]').val().trim(), access: share && share.access, excel: $f.find('[name=excel]').prop('checked'), button };
    const what = (r) => (r.rows !== undefined ? `${r.rows} row${r.rows === 1 ? '' : 's'}` : 'the sheet');
    if (target === 'app' || target === 'none') {
      teamsSend.send({ ...val, mode: target === 'app' ? 'channel' : 'none' })
        .done((r) => {
          closeTeamsSend();
          toast(share ? `Shared with ${r.shared} ${r.shared === 1 ? 'person' : 'people'}${target === 'app' ? ' and posted on Teams' : ''}` : `Sent ${what(r)} on Teams`);
        })
        .fail((xhr) => fail(errorText(xhr)));
      return;
    }
    if (target === 'mine') storage('set', 'teamsChats', JSON.stringify(chats));
    setBusy(button, true);
    // how a send from your own Teams went, for the server's record (each chat by its Graph id, and its name)
    const { log } = teamsSend;
    const record = (entry) => { if (log) log({ target, note: val.note, ...entry }); };
    // sign in first, while this is still the click (browsers allow the popup then)
    // with an Excel the sign-in also asks for your OneDrive, so all of it is one popup
    const signIn = val.excel ? window.flowGraph.allow('files') : window.flowGraph.account() ? Promise.resolve() : window.flowGraph.connect();
    signIn
      .then(() => teamsSend.send({ ...val, mode: 'card' }))
      .then((r) => (r.excel ? window.flowGraph.uploadFile(r.excel).then((file) => ({ ...r, file })) : r))
      .then((r) => (target === 'direct'
        ? window.flowGraph.sendDirect(r.people, r.direct, r.file).then((results) => {
          const failed = results.filter((x) => !x.ok);
          record({ destination: results.map((x) => x.name).join(', '), ok: failed.length < results.length, error: failed.map((x) => `${x.name}: ${x.error}`).join('; ') });
          closeTeamsSend();
          teamsDirectResult(results);
        })
        : sendToChats(chats, r.card, r.file).then((results) => {
          results.forEach((x) => record({ chatId: x.id, destination: x.name, messageId: x.messageId, ok: x.ok, error: x.error }));
          if (!results.some((x) => x.ok)) throw new Error(results.map((x) => `${x.name}: ${x.error}`).join('; '));
          closeTeamsSend();
          if (results.every((x) => x.ok)) toast(`Posted ${what(r)} on Teams in ${results.length === 1 ? results[0].name : `${results.length} chats`}`);
          else teamsDirectResult(results);
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
        log: (entry) => api('POST', '/api/issues/teams/log', { productId: pid, ids, ...entry }, null, QUIET),
      });
    });
  }

  // ---------------------------------------------------------------- issues by status (header counts open this)

  // scope: 'mine' (issues I own or am assigned to) or 'all' (every issue of the app I may see); status filters within it
  const showsAll = () => !isDev() || devPerms().viewAll;
  function renderBugs() {
    const { status, filter } = bugsView;
    if (!productId) { closeBugs(); return; }
    if (!showsAll()) bugsView.scope = 'mine';
    const { scope } = bugsView;
    const every = [];
    modules.forEach((m) => m.flows.forEach((f) => onlyScreens(f.screens).forEach((s) => {
      sortIssues(s.comments).forEach((c) => every.push({ c, s, f, m }));
    })));
    const inScope = every.filter(({ c }) => scope !== 'mine' || isMine(c));
    const rows = inScope.filter(({ c }) => !status || c.status === status);
    const scopeCount = (k) => every.filter(({ c }) => (k !== 'mine' || isMine(c)) && (!status || c.status === status)).length;
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
            ${tag ? `<span class="dot st st-${tag.color}"></span>${esc(tag.label)}` : ''} ${scope === 'mine' ? 'My issues' : tag ? 'issues' : 'All issues'}
          </h3>
          <p class="text-sm text-slate-500">${list.length} issue${list.length === 1 ? '' : 's'} on ${screenCount} screen${screenCount === 1 ? '' : 's'}</p>
        </div>
        <div class="seg" title="${showsAll() ? '' : 'Developers see only their own issues in this app'}">
          ${[['mine', 'My issues'], ['all', 'All issues']].map(([k, label]) => `<button data-bugs-scope="${k}" class="${scope === k ? 'on' : ''}" ${k === 'all' && !showsAll() ? 'disabled' : ''}>${label} (${scopeCount(k)})</button>`).join('')}
        </div>
        <select class="input py-1 text-sm" data-bugs-status title="Status">
          <option value="">Any status</option>${activeStatuses().map((x) => `<option value="${esc(x.id)}" ${x.id === status ? 'selected' : ''}>${esc(x.label)} (${inScope.filter(({ c }) => c.status === x.id).length})</option>`).join('')}
        </select>
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
            <div class="flex flex-wrap gap-1">${ownerChip(c)}${(c.assignees || []).filter((n) => n !== ownerName(c)).map((n) => `<span class="person">${esc(n)}</span>`).join('')}</div>
            <button class="icon-btn border border-slate-200 bg-white" data-go-screen="${s.id}" title="Go to screen">${icon('link', 14)}</button>
          </div>`;
        }).join('') || `<p class="py-12 text-center text-sm text-slate-400">No ${status || filter === 'all' ? '' : `${filter} `}issues</p>`}
      </div>`);
  }

  // scope: 'mine' | 'all' (Developers start on their own issues)
  function openBugs(status, scope) {
    bugsView = { status, filter: 'open', scope: scope || (isDev() ? 'mine' : 'all') };
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
    if (!me) { $('#account, #sbNav').empty(); return; }
    const current = products.find((p) => p.id === productId);
    const version = current && current.version ? current.version.replace(/^v(?=\d)/i, '') : '';
    $('#sbNav').html(`
      <button class="sb-write" data-action="writer" title="Write an issue on any screen">${icon('plus', 16)}<span class="sb-label">Write issue</span></button>
      <a href="/" class="sb-item ${!sheetsView && !sanity && !adminView && !templatesView ? 'on' : ''}" data-action="home" title="Board: modules, flows and screens"><span class="sb-ico">${icon('home', 16)}</span><span class="sb-label">Board</span></a>
      ${sbItem({ attrs: 'data-action="sheets"', ico: icon('grid', 16), label: 'Sheets', on: Boolean(sheetsView), title: 'Sheets: typed columns, formulas, links to flows and screens, Excel in and out' })}
      ${sbItem({ attrs: 'data-action="templates"', ico: icon('mail', 16), label: 'Templates', on: Boolean(templatesView), title: 'Templates: the e-mails, WhatsApp, SMS and push messages this app sends' })}
      ${sbItem({ attrs: 'data-action="sanity"', ico: icon('check', 16), label: 'Sanity', on: Boolean(sanity), title: 'Daily sanity checklist of this app' })}
      ${sbItem({ attrs: 'data-action="done"', ico: icon('note', 16), label: 'Done today', title: 'Daily journal: done, to-do, in progress, questions and blockers' })}
      <a class="sb-item" href="/api/export" title="Download every task as an Excel sheet"><span class="sb-ico">${icon('download', 16)}</span><span class="sb-label">Excel export</span></a>
      ${sbItem({ attrs: 'data-action="admin"', ico: icon('shield', 16), label: 'Users & access', on: Boolean(adminView), title: 'Admin: logins, passwords and access' })}`);
    $('#account').html(`
      ${version ? `<button class="sb-version" data-action="sanity-logs" title="Present version of ${esc(current.name)}: the latest version tested in Sanity. Opens the sanity logs.">
        <span class="sb-ico">${icon('tag', 14)}</span><span class="sb-label">${esc(current.name)} <b>v${esc(version)}</b></span></button>` : ''}
      <div class="sb-tools-row">${teamsAccount()}${themeButton()}</div>
      <div class="sb-user" title="${esc(ACCESS[me.access].hint)}">
        <span class="sb-avatar">${esc(appInitials(me.name || me.username))}</span>
        <span class="sb-label min-w-0 flex-1"><span class="block truncate text-sm font-semibold text-slate-900">${esc(me.name || me.username)}</span>
          <span class="access-tag access-${me.access}">${ACCESS[me.access].label}</span></span>
        <button class="icon-btn sb-logout" data-action="logout" title="Sign out">${icon('logout', 16)}</button>
      </div>`);
  }
  // Your own Teams (public/graph.js): connect your Microsoft account once, then FlowTrace sends as you: direct
  // messages, posts in your channels, and a message to people when you give them an issue or change its status.
  function teamsAccount() {
    const g = window.flowGraph;
    if (!g.configured()) return '';
    const acc = g.account();
    return `<details class="sheet-share teams-account">
      <summary class="sb-item ${acc ? 'on' : ''}" data-teams-summary title="${acc ? `Teams: connected as ${esc(acc.username)}` : 'Connect your Microsoft Teams'}">
        <span class="sb-ico">${icon('chat', 16)}${acc ? '<span class="teams-dot"></span>' : ''}</span><span class="sb-label">Teams</span></summary>
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
    const button = this;
    window.flowTheme.toggle(button, () => {
      $(button).replaceWith(themeButton());
      if (diagram.flowId) renderDiagram(); // its wires take colours from the theme
      if (sketch.open) skDraw();
    });
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

  // ---------------------------------------------------------------- project settings → roles & permissions
  // Per app (project): what each role may do with its issues. Admin and Tester are fixed (shown for reference);
  // the Developer switches are this app's own and save at once (the server enforces them on every request).

  const DEV_SWITCHES = [
    ['create', 'Can create issues', 'Add bugs on the screens of this app. Off: the “Add issue” boxes and Write issue are hidden for Developers.'],
    ['viewAll', 'Can view all issues of the project', 'See every issue of this app, from Testers, Admins and other Developers. Off: only the issues assigned to them.'],
    ['status', 'Can update issue status', 'Move their own issues Pending → In Progress → Release for Testing (and a reopened one back into progress).'],
    ['assign', 'Can assign issues', 'Hand an issue they own to another person or developer. Unassigned issues are always assigned by a Tester or Admin.'],
    ['edit', 'Can edit issue details', 'Change the text, priority, area and remarks of their own issues.'],
  ];
  const ROLE_RULES = {
    admin: ['Everything on every issue of the app: create, assign, edit, delete', 'Any status, including Verified, Complete and Reopened', 'Sets these permissions'],
    tester: ['Creates issues and assigns them to a developer', 'Verifies fixes that are Released for Testing', 'Closes verified issues (Complete) or reopens a failed fix', 'Any status on any issue of the app'],
  };
  let settingsApp = null;
  let settingsRole = 'developer';

  function renderSettings() {
    const p = products.find((x) => x.id === settingsApp);
    if (!p) { closeSettings(); return; }
    const perms = devPerms(p.id);
    const flow = [['pending', 'Developer'], ['progress', 'Developer'], ['testing', 'Developer'], ['verified', 'Tester'], ['complete', 'Tester']];
    const pill = (id) => { const st = statusOf(id); return `<span class="wf-pill"><span class="dot st st-${st.color}"></span>${esc(st.label)}</span>`; };
    $('#settingsBody').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="sb-app" style="--app:${appColor(p)}">${esc(appInitials(p.name))}</span>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-semibold text-slate-900">${esc(p.name)} · Project settings</h3>
          <p class="text-xs text-slate-500">Roles &amp; permissions on this app's issues</p>
        </div>
        <button class="icon-btn" data-close-settings title="Close">${icon('close', 18)}</button>
      </div>
      <div class="space-y-5 px-5 py-4">
        <div>
          <span class="field-label">Issue workflow</span>
          <div class="wf-line">${flow.map(([id, who], k) => `${k ? `<span class="wf-arrow" title="${k <= 2 ? 'Developer' : 'Tester'}">${icon('right', 12)}</span>` : ''}${pill(id)}`).join('')}</div>
          <p class="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">Fix failed? ${pill('testing')}${icon('right', 11)}${pill('reopened')}${icon('right', 11)}${pill('progress')}
            <span>· Developers move their issues up to Release for Testing; Testers verify, close or reopen.</span></p>
        </div>
        <div>
          <div class="seg">${[['admin', 'Admin'], ['tester', 'Tester'], ['developer', 'Developer']].map(([k, label]) => `<button data-settings-role="${k}" class="${settingsRole === k ? 'on' : ''}">${label}</button>`).join('')}</div>
          ${settingsRole === 'developer' ? `
            <p class="mt-3 text-xs text-slate-500">Developers only ever change issues assigned to them. Viewing an issue never lets them change it.</p>
            <div class="mt-2 space-y-1">${DEV_SWITCHES.map(([k, label, hint]) => `
              <label class="adm-switch perm-row"><input type="checkbox" data-perm="${k}" ${perms[k] ? 'checked' : ''}><span class="adm-toggle"></span>
                <span><b>${label}</b><small>${hint}</small></span></label>`).join('')}</div>`
          : `<ul class="role-rules">${ROLE_RULES[settingsRole].map((x) => `<li>${icon('check', 13)}${esc(x)}</li>`).join('')}</ul>
             <p class="mt-2 text-xs text-slate-400">${settingsRole === 'admin' ? 'Full and Super admin logins' : 'Tester and “Update tasks” logins'} · set per login in Users &amp; access</p>`}
        </div>
      </div>`);
  }
  function openSettings(pid) {
    settingsApp = pid;
    settingsRole = 'developer';
    renderSettings();
    $('#settingsModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  }
  function closeSettings() {
    settingsApp = null;
    $('#settingsModal').addClass('hidden');
    unlockScroll();
  }
  $doc.on('click', '[data-app-settings]', function () { openSettings($(this).data('app-settings')); });
  $doc.on('click', '[data-close-settings]', closeSettings);
  $('#settingsModal').on('mousedown', function (e) { if (e.target === this) closeSettings(); });
  $doc.on('click', '[data-settings-role]', function () { settingsRole = $(this).data('settings-role'); renderSettings(); });
  $doc.on('change', '[data-perm]', function () {
    const box = this;
    const p = products.find((x) => x.id === settingsApp);
    api('PUT', `/api/products/${encodeURIComponent(settingsApp)}/permissions`, { [$(box).data('perm')]: box.checked }, box, QUIET)
      .done((r) => { p.devPermissions = r.devPermissions; toast('Permissions saved'); render(); })
      .fail(() => { box.checked = !box.checked; });
  });

  // ---------------------------------------------------------------- who is online (presence.js, a WebSocket)
  // Every tab keeps a socket open and says every 30 s whether you used it (key, click, mouse, scroll) in the last
  // 2 minutes with the tab in front. Super admins get everyone's state pushed back: online (used in the last 2 min),
  // away (a tab open, not used for 2 min) or offline (with when they were last here), shown live on Users & access.
  // The socket comes back by itself after a drop (waiting a little longer each time, up to 30 s).

  const PRESENCE_ACTIVE = 2 * 60 * 1000;
  const live = { ws: null, tries: 0, used: Date.now(), users: new Map(), beat: null };
  const markUsed = () => { live.used = Date.now(); };
  ['pointerdown', 'keydown', 'mousemove', 'wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, markUsed, { passive: true }));
  const inUse = () => document.visibilityState === 'visible' && Date.now() - live.used < PRESENCE_ACTIVE;
  const sendBeat = () => { if (live.ws && live.ws.readyState === 1) live.ws.send(JSON.stringify({ type: 'beat', active: inUse() })); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') markUsed(); sendBeat(); });

  function connectPresence() {
    if (live.ws || !me || !window.WebSocket) return;
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    live.ws = ws;
    ws.onopen = () => {
      live.tries = 0;
      sendBeat();
      clearInterval(live.beat);
      live.beat = setInterval(sendBeat, 30000);
    };
    ws.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.type !== 'presence') return;
      live.users = new Map(m.users.map((u) => [u.id, u]));
      paintPresence();
    };
    ws.onclose = (e) => {
      clearInterval(live.beat);
      live.ws = null;
      if (e.code === 4401 || e.code === 4403) return; // signed out, or not this app: no point trying again
      live.tries += 1;
      setTimeout(connectPresence, Math.min(30000, 1000 * 2 ** live.tries));
    };
  }

  // a login's state: from the socket when it has spoken, else from when the users list was loaded
  const presenceOf = (u) => live.users.get(u.id) || u.presence || { status: 'offline', lastSeen: null };
  function presenceText(u) {
    const p = presenceOf(u);
    if (p.status === 'online') return '<span class="pr pr-online"><i></i>Online</span>';
    if (p.status === 'away') return '<span class="pr pr-away"><i></i>Away</span> <span class="text-slate-400">· idle</span>';
    if (p.lastSeen && Date.now() - new Date(p.lastSeen).getTime() < PRESENCE_ACTIVE) return '<span class="pr pr-recent"><i></i>Just left</span>';
    return `<span class="pr pr-off"><i></i>Offline</span> <span class="text-slate-400">· ${p.lastSeen ? `last seen ${esc(ago(p.lastSeen))}` : 'never seen'}</span>`;
  }
  function presenceStat() {
    const states = users.map((u) => presenceOf(u).status);
    const on = states.filter((x) => x === 'online').length;
    const away = states.filter((x) => x === 'away').length;
    return `<div class="adm-stat green"><p class="adm-stat-n">${on}</p><p class="adm-stat-l">Online now</p>
      <p class="adm-stat-h">${away ? `${away} away · ` : ''}live, active in the last 2 min</p></div>`;
  }
  // only the state parts of the Users & access page, so an open form keeps what is typed
  function paintPresence() {
    if (!adminView) return;
    users.forEach((u) => {
      $(`[data-presence="${u.id}"]`).html(presenceText(u));
      $(`[data-presence-dot="${u.id}"]`).attr('class', `adm-online pr-${presenceOf(u).status}`).attr('title', presenceOf(u).status);
    });
    $('[data-presence-stat]').html(presenceStat());
  }
  // "last seen 3 min ago" and "Just left" move on by themselves
  setInterval(paintPresence, 30000);

  // ---------------------------------------------------------------- admin (super admins): its own page, like Sheets
  // People with a login: who they are, what they can do (access) and which apps they open. Summary cards on top, a
  // list to search and filter, and a panel from the right to make or change a login. A new login (or a new password)
  // ends on its credentials, to copy and send to the person: the password is shown only then.
  // The address (#admin) keeps the page after a refresh.

  let users = [];
  // { q, access: '' | level, app: '' | product id, panel: null | { id: user id | null, reset, created: { username, password } } }
  let adminView = null;

  const ago = (iso) => {
    if (!iso) return '';
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    if (min < 60 * 24) return `${Math.round(min / 60)} h ago`;
    if (min < 60 * 24 * 30) return `${Math.round(min / 1440)} d ago`;
    return fmtDate(iso);
  };
  const appNamesOf = (x) => (x.allProducts ? ['All apps'] : x.productIds.map((id) => (products.find((p) => p.id === id) || {}).name).filter(Boolean));
  // a password that reads well when sent: no 0 / O / 1 / l / I
  function newPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const marks = '@#$%&*!?';
    const rnd = new Uint32Array(14);
    crypto.getRandomValues(rnd);
    const s = [...rnd.slice(0, 12)].map((n) => chars[n % chars.length]);
    s.splice(4, 0, marks[rnd[12] % marks.length]);
    s.splice(9, 0, String(2 + (rnd[13] % 8)));
    return s.join('');
  }

  const loadUsers = () => api('GET', '/api/users').done((list) => { users = list; if (adminView) renderAdmin(); });

  function openAdmin() {
    loadUsers().done(() => {
      if (sheetsView) closeSheets();
      if (sanity) closeSanity();
      if (doneView) closeDone();
      if (templatesView) closeTemplates();
      adminView = adminView || { q: '', access: '', app: '', panel: null };
      $('#board, #tabs').addClass('hidden');
      $('#adminPage').removeClass('hidden');
      renderAdmin();
      markNav();
      history.replaceState(null, '', `${location.pathname}${location.search}#admin`);
      window.scrollTo(0, 0);
    });
  }
  function closeAdmin() {
    adminView = null;
    $('#adminPage').addClass('hidden').empty();
    $('#board, #tabs').removeClass('hidden');
    unlockScroll();
    markNav();
    history.replaceState(null, '', location.pathname + location.search);
  }

  function adminRows() {
    const { q, access, app } = adminView;
    const s = q.trim().toLowerCase();
    return users.filter((x) => (!access || x.access === access)
      && (!app || x.allProducts || x.access === 'super' || x.productIds.includes(app))
      && (!s || [x.name, x.username, x.teamsEmail, ...appNamesOf(x)].some((t) => String(t || '').toLowerCase().includes(s))));
  }

  function renderAdmin() {
    const v = adminView;
    const list = adminRows();
    const count = (k) => users.filter((x) => x.access === k).length;
    const stat = (label, n, hint, tone) => `<div class="adm-stat ${tone}"><p class="adm-stat-n">${n}</p><p class="adm-stat-l">${label}</p><p class="adm-stat-h">${hint}</p></div>`;
    $('#adminPage').html(`<div class="adm-page">
      <div class="adm-head">
        <div class="min-w-0 flex-1">
          <h2 class="adm-title">${icon('shield', 20)} Users &amp; access</h2>
          <p class="text-sm text-slate-500">Make logins, choose what each person can do and which apps they can open.</p>
        </div>
        <button class="btn-primary" data-admin-new>${icon('plus', 14)} New user</button>
      </div>
      <div class="adm-stats">
        ${stat('Logins', users.length, `${count('super')} super admin${count('super') === 1 ? '' : 's'}`, 'indigo')}
        <div data-presence-stat>${presenceStat()}</div>
        ${stat('Sanity testers', users.filter((x) => x.sanityTester || ['tester', 'developer', 'super'].includes(x.access)).length, 'can run the daily sanity', 'amber')}
        ${stat('No Teams email', users.filter((x) => !x.teamsEmail).length, 'cannot be @mentioned', 'slate')}
      </div>
      <div class="adm-card">
        <div class="adm-toolbar">
          <div class="adm-search">${icon('filter', 14)}<input type="search" placeholder="Search name, username, email or app" value="${esc(v.q)}" data-admin-q></div>
          <div class="adm-chips">
            <button class="adm-chip ${!v.access ? 'on' : ''}" data-admin-access="">All <b>${users.length}</b></button>
            ${Object.entries(ACCESS).filter(([k]) => count(k)).map(([k, a]) => `<button class="adm-chip ${v.access === k ? 'on' : ''}" data-admin-access="${k}">${a.label} <b>${count(k)}</b></button>`).join('')}
          </div>
          <select class="input py-1 text-sm" data-admin-app><option value="">Any app</option>${products.map((p) => `<option value="${p.id}" ${v.app === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
        </div>
        <div class="overflow-x-auto">
          <table class="adm-table">
            <thead><tr><th>User</th><th>Access</th><th>Apps</th><th>Teams email</th><th>Status</th><th></th></tr></thead>
            <tbody>${list.map((x) => {
              const apps = appNamesOf(x);
              return `<tr class="${v.panel && v.panel.id === x.id ? 'on' : ''}">
                <td><div class="flex items-center gap-3">
                  <span class="adm-avatar">${esc(appInitials(x.name || x.username))}<i class="adm-online" data-presence-dot="${x.id}"></i></span>
                  <div class="min-w-0"><p class="truncate font-semibold text-slate-900">${esc(x.name || x.username)}${x.id === me.id ? ' <span class="text-xs font-normal text-slate-400">(you)</span>' : ''}</p>
                    <p class="truncate font-mono text-xs text-slate-500">${esc(x.username)}</p></div></div></td>
                <td><span class="access-tag access-${x.access}" title="${esc(ACCESS[x.access].hint)}">${ACCESS[x.access].label}</span>${x.sanityTester ? ' <span class="access-tag sanity-tag">Sanity</span>' : ''}</td>
                <td><div class="adm-apps">${apps.slice(0, 3).map((n) => `<span class="adm-app">${esc(n)}</span>`).join('')}${apps.length > 3 ? `<span class="adm-app more" title="${esc(apps.slice(3).join(', '))}">+${apps.length - 3}</span>` : ''}${apps.length ? '' : '<span class="text-xs text-slate-400">No apps</span>'}</div></td>
                <td class="text-xs">${x.teamsEmail ? esc(x.teamsEmail) : '<span class="text-slate-400">—</span>'}</td>
                <td class="whitespace-nowrap text-xs" data-presence="${x.id}" title="Last sign-in: ${x.lastSignIn ? esc(ago(x.lastSignIn)) : 'never'}"></td>
                <td><div class="adm-actions">
                  <button class="icon-btn" data-admin-edit="${x.id}" title="Edit">${icon('edit', 14)}</button>
                  <button class="icon-btn" data-admin-reset="${x.id}" title="Reset password">${icon('lock', 14)}</button>
                  ${x.id === me.id ? '' : `<button class="icon-btn" data-admin-signout="${x.id}" title="Sign out on every device" ${x.signedIn ? '' : 'disabled'}>${icon('logout', 14)}</button>
                  <button class="icon-btn danger" data-admin-delete="${x.id}" title="Delete login">${icon('trash', 14)}</button>`}
                </div></td></tr>`;
            }).join('')}</tbody>
          </table>
          ${list.length ? '' : `<div class="adm-empty">${icon('user', 22)}<p>${users.length ? 'Nobody matches the search or filters.' : 'No logins yet.'}</p></div>`}
        </div>
        <p class="adm-foot">${list.length} of ${users.length} login${users.length === 1 ? '' : 's'}</p>
      </div>
      <div class="adm-backdrop ${v.panel ? 'show' : ''}" data-admin-close></div>
      <aside class="adm-panel ${v.panel ? 'show' : ''}">${v.panel ? adminPanel() : ''}</aside>
    </div>`);
    if (v.panel) syncAppBoxes();
    paintPresence();
  }

  // the panel: a login's form, or the credentials of one just made (or given a new password)
  function adminPanel() {
    const { panel } = adminView;
    if (panel.created) {
      const c = panel.created;
      return `<div class="adm-panel-head"><h3>${panel.id ? 'New password set' : 'Login created'}</h3><button class="icon-btn" data-admin-close title="Close">${icon('close', 18)}</button></div>
        <div class="adm-panel-body">
          <div class="adm-done">${icon('check', 22)}</div>
          <p class="text-center text-sm text-slate-600">Send these to <b>${esc(c.name || c.username)}</b>. The password is shown only now.</p>
          <div class="adm-cred">
            ${[['Address', location.origin], ['Username', c.username], ['Password', c.password]].map(([k, val]) => `
              <div class="adm-cred-row"><span>${k}</span><code>${esc(val)}</code><button type="button" class="icon-btn sm" data-admin-copy="${esc(val)}" title="Copy ${k.toLowerCase()}">${icon('copy', 13)}</button></div>`).join('')}
          </div>
          <button class="btn-primary w-full justify-center" data-admin-copy-all>${icon('copy', 14)} Copy login details</button>
          <button class="btn-secondary mt-2 w-full justify-center" data-admin-close>Done</button>
        </div>`;
    }
    const u = users.find((x) => x.id === panel.id) || null;
    const access = u ? u.access : 'view';
    const self = u && u.id === me.id;
    return `<form id="adminForm" autocomplete="off" class="flex h-full flex-col">
      <div class="adm-panel-head"><h3>${u ? `Edit ${esc(u.name || u.username)}` : 'New user'}</h3><button type="button" class="icon-btn" data-admin-close title="Close">${icon('close', 18)}</button></div>
      <div class="adm-panel-body">
        <section class="adm-sec"><h4>Account</h4>
          <label class="block"><span class="field-label">Username <span class="font-normal text-slate-400">(they sign in with it)</span></span>
            <input class="input w-full font-mono" name="username" value="${esc(u ? u.username : '')}" ${u ? 'disabled' : ''} placeholder="e.g. priya.qa" maxlength="40"></label>
          <label class="block"><span class="field-label">Full name</span>
            <input class="input w-full" name="name" value="${esc(u ? u.name : '')}" placeholder="e.g. Priya Sharma" maxlength="80"></label>
          <label class="block"><span class="field-label">Teams email <span class="font-normal text-slate-400">(to @mention and message them)</span></span>
            <input class="input w-full" name="teamsEmail" value="${esc(u ? u.teamsEmail : '')}" placeholder="e.g. priya@company.com" maxlength="120"></label>
        </section>
        <section class="adm-sec"><h4>Password ${u && !panel.reset ? '<span class="font-normal text-slate-400">(leave empty to keep it)</span>' : ''}</h4>
          <div class="adm-pass"><input class="input w-full font-mono" type="text" name="password" autocomplete="new-password" placeholder="${u ? 'New password' : 'At least 8 characters'}" value="${esc(panel.password || '')}">
            <button type="button" class="btn-secondary" data-admin-generate title="Make a strong password">${icon('flip', 13)} Generate</button></div>
          <p class="mt-1 text-xs text-slate-400">${u ? 'A new password signs them out on their other devices.' : 'You will see it once more after saving, to send it.'}</p>
        </section>
        <section class="adm-sec"><h4>Access</h4>
          <div class="adm-access">${Object.entries(ACCESS).map(([k, a]) => `
            <label class="adm-acc"><input type="radio" name="access" value="${k}" ${k === access ? 'checked' : ''} ${self && k !== 'super' ? 'disabled' : ''}>
              <span><b>${a.label}</b><small>${a.hint}</small></span></label>`).join('')}</div>
          <label class="adm-switch"><input type="checkbox" name="sanityTester" ${u && u.sanityTester ? 'checked' : ''}><span class="adm-toggle"></span>
            <span><b>Sanity tester</b><small>On top of the access above: runs the daily sanity checklist. Testers, developers and super admins always can.</small></span></label>
        </section>
        <section class="adm-sec"><h4>Apps</h4>
          <label class="adm-switch"><input type="checkbox" name="allProducts" ${u && u.allProducts ? 'checked' : ''}><span class="adm-toggle"></span>
            <span><b>All apps</b><small>Also apps added later. Super admins always see every app.</small></span></label>
          <div class="teams-picks pills mt-2" data-admin-apps>${products.map((p) => `
            <label class="teams-pick"><input type="checkbox" name="productIds" value="${p.id}" ${u && u.productIds.includes(p.id) ? 'checked' : ''}><span class="sb-app sm" style="--app:${appColor(p)}">${esc(appInitials(p.name))}</span>${esc(p.name)}</label>`).join('') || '<p class="text-xs text-slate-400">No apps yet</p>'}</div>
        </section>
        <p class="dialog-error hidden"></p>
      </div>
      <div class="adm-panel-foot">
        <button type="button" class="btn-secondary" data-admin-close>Cancel</button>
        <button class="btn-primary">${u ? 'Save changes' : 'Create user'}</button>
      </div>
    </form>`;
  }

  // Super admins and "All apps" logins see every app, so the single-app boxes don't apply.
  function syncAppBoxes() {
    const $f = $('#adminForm');
    const isSuper = $f.find('[name=access]:checked').val() === 'super';
    $f.find('[name=allProducts]').prop('disabled', isSuper);
    if (isSuper) $f.find('[name=allProducts]').prop('checked', true);
    const all = $f.find('[name=allProducts]').is(':checked');
    $f.find('[name=productIds]').prop('disabled', all);
    $f.find('[data-admin-apps]').toggleClass('off', all);
  }
  const openPanel = (panel) => { adminView.panel = panel; renderAdmin(); setTimeout(() => $('#adminForm input:not(:disabled)').first().trigger('focus'), 220); };
  const closePanel = () => { adminView.panel = null; renderAdmin(); };
  const copy = (textValue, what) => navigator.clipboard.writeText(textValue).then(() => toast(`${what} copied`), () => dialog.alert(textValue, what));

  $doc.on('click', '[data-action="admin"]', openAdmin);
  $doc.on('click', '[data-admin-close]', closePanel);
  $doc.on('click', '[data-admin-new]', () => openPanel({ id: null, password: newPassword() }));
  $doc.on('click', '[data-admin-edit]', function () { openPanel({ id: $(this).data('admin-edit') }); });
  $doc.on('click', '[data-admin-reset]', function () { openPanel({ id: $(this).data('admin-reset'), reset: true, password: newPassword() }); });
  $doc.on('click', '[data-admin-generate]', () => { $('#adminForm [name=password]').val(newPassword()).trigger('select'); });
  $doc.on('input', '[data-admin-q]', function () {
    adminView.q = this.value;
    const at = this.selectionStart;
    renderAdmin();
    const box = $('[data-admin-q]')[0];
    box.focus(); box.setSelectionRange(at, at);
  });
  $doc.on('click', '[data-admin-access]', function () { adminView.access = $(this).data('admin-access'); renderAdmin(); });
  $doc.on('change', '[data-admin-app]', function () { adminView.app = this.value; renderAdmin(); });
  $doc.on('change', '#adminForm [name=access], #adminForm [name=allProducts]', syncAppBoxes);
  $doc.on('click', '[data-admin-copy]', function () { copy(String($(this).data('admin-copy')), 'Copied'); });
  $doc.on('click', '[data-admin-copy-all]', () => {
    const c = adminView.panel.created;
    copy(`FlowTrace login\nAddress: ${location.origin}\nUsername: ${c.username}\nPassword: ${c.password}`, 'Login details');
  });
  $doc.on('submit', '#adminForm', function (e) {
    e.preventDefault();
    const $f = $(this);
    const { panel } = adminView;
    const editing = panel.id;
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
    api(editing ? 'PATCH' : 'POST', editing ? `/api/users/${editing}` : '/api/users', body, $f.find('.btn-primary')[0], QUIET)
      .done((u) => {
        // a new login or a new password: show the credentials to send; else back to the list
        adminView.panel = pass && !self ? { id: editing, created: { username: u.username, name: u.name, password: pass } } : null;
        toast(editing ? 'Saved' : 'User created');
        loadUsers();
        if (self) load();
      })
      .fail((xhr) => $err.text(errorText(xhr)).removeClass('hidden'));
  });
  $doc.on('click', '[data-admin-signout]', function () {
    const u = users.find((x) => x.id === $(this).data('admin-signout'));
    dialog.confirm({
      title: `Sign ${u.name || u.username} out?`, message: 'They are signed out on every device and have to sign in again.', confirmText: 'Sign out',
      onConfirm: () => api('POST', `/api/users/${u.id}/signout`, null, null, QUIET).done(() => { toast('Signed out everywhere'); loadUsers(); }),
    });
  });
  $doc.on('click', '[data-admin-delete]', function () {
    const u = users.find((x) => x.id === $(this).data('admin-delete'));
    dialog.confirm({
      title: `Delete login “${u.username}”?`,
      message: 'They will be signed out and cannot sign in again. Their issues and history stay.',
      confirmText: 'Delete',
      danger: true,
      onConfirm: () => api('DELETE', `/api/users/${u.id}`, null, null, QUIET).done(() => {
        if (adminView.panel && adminView.panel.id === u.id) adminView.panel = null;
        loadUsers();
      }),
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
  // the apps this login may add issues in (a Developer only where the app allows it)
  const writableApps = () => products.filter((p) => canCreateIssues(p.id));
  function writerRow(at) {
    const field = (label, html) => `<label class="block min-w-0"><span class="field-label">${label}</span>${html}</label>`;
    const apps = writableApps();
    const $row = $(`
      <div class="writer-row" data-product="${at.productId || ''}" data-flow="${at.flowId || ''}" data-screen="${at.screenId || ''}">
        <div class="writer-line where ${apps.length > 1 ? 'multi' : ''}">
          ${apps.length > 1 ? field('App', `<select class="input w-full" name="product">${apps.map((p) =>
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
    const apps = writableApps();
    if (!apps.length) { dialog.alert('You cannot add issues in your apps. An admin can allow it in Project settings → Roles & permissions.', 'Write issue'); return; }
    writer.productId = apps.some((p) => p.id === writer.productId) ? writer.productId : apps.some((p) => p.id === productId) ? productId : apps[0].id;
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
    if (doneView) openDone(productId); // on the journal page: that app's journal
    if (templatesView) openTemplates(productId); // on the Templates page: that app's templates
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

  // a refused change (the server checks every one) puts the issue back as it was
  $doc.on('change', '[data-status]', function () {
    api('PATCH', `/api/comments/${$(this).data('status')}`, { status: $(this).val() }).done(load).fail(load);
  });
  $doc.on('change', '[data-resolve]', function () {
    api('PATCH', `/api/comments/${$(this).data('resolve')}`, { resolved: this.checked }).done(load).fail(load);
  });
  // the issue's developer: the one before loses the right to change it, the new one gets it
  $doc.on('change', '[data-owner]', function () {
    api('PATCH', `/api/comments/${$(this).data('owner')}`, { developerId: this.value || null }).done((r) => { toast('Developer assigned'); load(); if (r && r.notify) teamsNotify(r.notify); }).fail(load);
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
    api('PATCH', `/api/comments/${c.id}`, { priority: order[(order.indexOf(prio(c)) + 1) % order.length] }).done(load).fail(load);
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
  // the decision closes from its ✕, or a click outside its card
  $doc.on('click', '#popupBody', (e) => {
    if ($(e.target).closest('[data-popup-choose]').length) return;
    if (!$(e.target).closest('.decide-card').length || $(e.target).closest('[data-decide-close]').length) $('#popupBody .popup-choices').addClass('hidden');
  });
  // ← → step through the flow while the popup is on top and nothing is being typed
  $doc.on('keydown', (e) => {
    if (!openId || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || $(e.target).is('input, textarea, select, [contenteditable]')) return;
    if (dialog.isOpen() || sheetId || videoFlowId || bugsView || $('#copyModal, #writerModal, #statusModal, #sheetsModal, #sanityLogModal').not('.hidden').length) return;
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
      $svg.find('.head').attr('d', `M${x} ${y}L${x - 6} ${y + 8}L${x} ${y + 6}L${x + 6} ${y + 8}Z`);
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

  // Hovering on a parent screen card illuminates wires for subflows extending from it
  $doc.on('mouseenter', '#board .card', function () {
    const id = $(this).data('id');
    if (id) $(`#board .flow[data-from-screen="${id}"]`).addClass('parent-screen-hovered');
  });
  $doc.on('mouseleave', '#board .card', function () {
    const id = $(this).data('id');
    if (id) $(`#board .flow[data-from-screen="${id}"]`).removeClass('parent-screen-hovered');
  });

  // Hovering on the elbow grip or from-screen tag illuminates the source card it extends from
  $doc.on('mouseenter', '.flow.from-screen .elbow-grip, .flow.from-screen [data-locate]', function () {
    const $flow = $(this).closest('.flow.from-screen');
    const fromId = $flow.data('from-screen');
    if (fromId) $(`#board .card[data-id="${fromId}"]`).addClass('source-screen-active');
  });
  $doc.on('mouseleave', '.flow.from-screen .elbow-grip, .flow.from-screen [data-locate]', function () {
    const $flow = $(this).closest('.flow.from-screen');
    const fromId = $flow.data('from-screen');
    if (fromId) $(`#board .card[data-id="${fromId}"]`).removeClass('source-screen-active');
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
  $doc.on('click', '[data-bugs]', function () { openBugs(String($(this).data('bugs')), $(this).data('scope')); });
  $doc.on('click', '[data-bugs-scope]', function () { bugsView.scope = $(this).data('bugs-scope'); renderBugs(); applyAccess(); });
  $doc.on('change', '[data-bugs-status]', function () { bugsView.status = this.value; renderBugs(); applyAccess(); });
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
  // "Assign to": a list of the people who can open the issue's app (their logins, Users & access), filtered as you
  // type. ↑ ↓ and Enter pick; a name that is not a login can still be added (Enter on "Add …").
  const appPeople = new Map(); // app id → [{ id, name, username, access }]
  function peopleOfApp(pid) {
    if (!pid) return [];
    if (!appPeople.has(pid)) {
      appPeople.set(pid, []);
      api('GET', `/api/products/${encodeURIComponent(pid)}/people`, null, null, QUIET)
        .done((d) => { appPeople.set(pid, d.people); if ($('#peopleMenu').length) peopleMenu(peopleMenuFor); else if (loaded) render(); })
        .fail(() => appPeople.delete(pid));
    }
    return appPeople.get(pid);
  }
  // the app an assignee box belongs to: the writer's row picks one, everywhere else it is the app on screen
  const boxApp = (input) => $(input).closest('[data-product]').data('product') || productId;
  let peopleMenuFor = null;
  function closePeopleMenu() { $('#peopleMenu').remove(); peopleMenuFor = null; }
  function peopleMenu(input) {
    if (!input || !document.body.contains(input)) { closePeopleMenu(); return; }
    peopleMenuFor = input;
    const $box = $(input).closest('.people');
    const taken = chipsOf($box).map((x) => x.toLowerCase());
    const q = input.value.trim().toLowerCase();
    const list = peopleOfApp(boxApp(input))
      .filter((u) => !taken.includes(u.name.toLowerCase()) && (!q || u.name.toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q)))
      .slice(0, 50);
    const exact = list.some((u) => u.name.toLowerCase() === q);
    const opts = list.map((u) => `<button type="button" class="pm-opt" data-pm-pick="${esc(u.name)}">
        <span class="pm-av">${esc(appInitials(u.name))}</span>
        <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-slate-900">${esc(u.name)}</span>
          ${u.username ? `<span class="block truncate font-mono text-xs text-slate-500">@${esc(u.username)}</span>` : ''}</span>
        ${u.access && ACCESS[u.access] ? `<span class="access-tag access-${u.access}">${ACCESS[u.access].label}</span>` : ''}
      </button>`).join('');
    const add = q && !exact ? `<button type="button" class="pm-opt pm-add" data-pm-pick="${esc(input.value.trim())}">${icon('plus', 14)}<span class="text-sm">Add “${esc(input.value.trim())}”</span></button>` : '';
    const app = products.find((p) => p.id === boxApp(input));
    let $m = $('#peopleMenu');
    if (!$m.length) $m = $('<div id="peopleMenu" class="pm" role="listbox"></div>').appendTo('body');
    $m.html(`<p class="pm-head">People in ${esc(app ? app.name : 'this app')}</p>${opts}${add}${opts || add ? '' : `<p class="pm-empty">${appPeople.get(boxApp(input)) && appPeople.get(boxApp(input)).length ? 'Everyone is added' : 'Loading people…'}</p>`}`);
    $m.find('.pm-opt').first().addClass('on');
    placePeopleMenu();
  }
  // under the box, or above it when there is no room below; it follows the box when the page or a popup scrolls
  function placePeopleMenu() {
    const $m = $('#peopleMenu');
    if (!$m.length || !peopleMenuFor || !document.body.contains(peopleMenuFor)) { closePeopleMenu(); return; }
    const $box = $(peopleMenuFor).closest('.people');
    const r = $box[0].getBoundingClientRect();
    const h = Math.min($m.outerHeight(), 300);
    const below = window.innerHeight - r.bottom > h + 12 || r.top < h + 12;
    $m.css({ left: Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 260) - 8)), width: Math.max(r.width, 260), top: below ? r.bottom + 4 : r.top - h - 4 });
  }
  $doc.on('focus input', '.people-input', function () { peopleMenu(this); });
  $doc.on('blur', '.people-input', function () {
    setTimeout(() => {
      if (document.activeElement === this) return;
      if (peopleMenuFor === this) closePeopleMenu();
      if (this.value.trim()) addPeople(this); // typed and left without picking: added as written
    }, 150);
  });
  $doc.on('mousedown', '[data-pm-pick]', function (e) {
    e.preventDefault(); // keep typing in the box
    const input = peopleMenuFor;
    if (!input) return;
    input.value = String($(this).data('pm-pick'));
    addPeople(input);
    peopleMenu(input);
  });
  $(window).on('resize', placePeopleMenu);
  document.addEventListener('scroll', (e) => { if (peopleMenuFor && !$(e.target).closest('#peopleMenu').length) placePeopleMenu(); }, true);

  $doc.on('keydown', '.people-input', function (e) {
    const $opts = $('#peopleMenu .pm-opt');
    const at = $opts.index($opts.filter('.on'));
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && $opts.length) {
      e.preventDefault();
      const next = $opts.eq(Math.max(0, Math.min($opts.length - 1, at + (e.key === 'ArrowDown' ? 1 : -1))));
      $opts.removeClass('on');
      next.addClass('on')[0].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Escape' && peopleMenuFor) { e.stopImmediatePropagation(); closePeopleMenu(); return; }
    if (e.key === 'Enter' && this.value.trim() && at >= 0) { e.preventDefault(); $opts.eq(at).trigger('mousedown'); return; }
    if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) { e.preventDefault(); addPeople(this); }
    else if (e.key === 'Backspace' && !this.value) {
      const $last = $(this).prevAll('.person').first();
      if ($last.length) { $last.remove(); savePeople($(this).closest('.people')); }
    }
  });

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
    else if (colEdit) closeColumn();
    else if (settingsApp) closeSettings();
    else if ($('#sheetFilterPop').length) closeFilter();
    else if (!$('#importModal').hasClass('hidden')) closeImport();
    else if (sketch.open) skEscape();
    else if (!$('#copyModal').hasClass('hidden')) closeCopy();
    else if (sanityLog) closeSanityLog();
    else if (doneView && doneView.editing) cancelEdit();
    else if (!$('#statusModal').hasClass('hidden')) closeStatuses();
    else if (bugsView) closeBugs();
    else if (adminView && adminView.panel) { adminView.panel = null; renderAdmin(); }
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
    if (sanity) closeSanity(); // going to a flow or screen leaves the Sanity (or Sheets, journal, Templates) page
    if (sheetsView) closeSheets();
    if (doneView) closeDone();
    if (templatesView) closeTemplates();
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
    if (templatesView) closeTemplates();
    if (!$('#statusModal').hasClass('hidden')) closeStatuses();
    if (bugsView) closeBugs();
    if (adminView) closeAdmin();
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

  // Links from Teams: /#flow=<id>, #screen=<id>, #sanity=<app id>[&view=logs], #done=<app id>[&date=…][&tab=shared|questions|blockers|…],
  // #templates=<app id>[&tab=email|whatsapp|sms|push|other]
  function openFromHash() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (![...h.keys()].length) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (h.has('admin')) { if (can('super')) openAdmin(); }
    else if (h.get('flow')) showFlow(h.get('flow'));
    else if (h.get('screen')) showScreen(h.get('screen'));
    else if (h.get('sheet')) api('GET', `/api/sheets/${encodeURIComponent(h.get('sheet'))}`).done((x) => openSheets(x.productId, x.id));
    else if (h.get('sheets')) {
      if (products.some((p) => p.id === h.get('sheets'))) { selectProduct(h.get('sheets')); render(); }
      openSheets(productId);
    }
    else if (h.get('templates')) {
      if (products.some((p) => p.id === h.get('templates'))) { selectProduct(h.get('templates')); render(); }
      openTemplates(productId, h.get('tab'));
    }
    else if (h.get('sanity') || h.get('done')) {
      const pid = h.get('sanity') || h.get('done');
      if (products.some((p) => p.id === pid)) { selectProduct(pid); render(); }
      if (h.get('sanity')) {
        const req = openSanity(productId, null, h.get('view') === 'logs' ? 'logs' : 'sheet');
        if (req && h.get('log')) req.done(() => openSanityLog(h.get('log')));
      } else openDone(productId, h.get('date'), doneTab(h.get('tab')) || 'done', h.get('meeting'));
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
      if (sheetsView) closeSheets();
      if (adminView) closeAdmin();
      if (doneView) closeDone();
      if (templatesView) closeTemplates();
      $('#board, #tabs').addClass('hidden');
      $('#sanityPage').removeClass('hidden');
      markNav();
      history.replaceState(null, '', `${location.pathname}${location.search}#sanity=${encodeURIComponent(pid)}${sanity.view === 'logs' ? '&view=logs' : ''}`);
      if (fresh) window.scrollTo(0, 0);
    });
  }
  const reloadSanity = () => sanity && openSanity(sanity.productId, sanity.date);

  function closeSanity() {
    sanity = null;
    $('#sanityPage').addClass('hidden').empty();
    $('#board, #tabs').removeClass('hidden');
    markNav();
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
        <form id="sanityTeamsForm" class="mt-3 space-y-2">
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
  $doc.on('submit', '#sanityTeamsForm', function (e) {
    e.preventDefault();
    api('PUT', `/api/products/${sanity.productId}/teams`, { webhook: $(this).find('[name=webhook]').val().trim() })
      .done(() => { toast('Teams channel saved'); reloadSanity(); load(); });
  });
  $doc.on('click', '[data-teams-test]', () => {
    api('POST', `/api/products/${sanity.productId}/teams/test`).done(() => toast('Test message sent to Teams'));
  });

  // ---------------------------------------------------------------- done today: the daily work journal
  // Tabs: Done (what each person finished, with the screens they changed), To-do and In Progress (my points, ticked off
  // into Done), Questions (doubts about how the app should work, collected into a meeting agenda), Blockers, and
  // Shared with me. A past day shows what was done and what was open at the end of that day.

  // { productId, date, today, followToday, items, shared, todos, questions, blockers, people, canClose, teams,
  //   tab, sharing: entry id whose picker is open, editing: { kind, id }, draft: values for the next new entry,
  //   draftId: id the next new entry is saved with (a form sent twice saves once), saving,
  //   search, prio, qStatus, qScope, results: search across all days, agenda: { date, items } }
  let doneView = null;
  let donePicked = []; // screens attached to the entry being written
  let doneSeq = 0; // the newest load: an answer for a day picked earlier that comes in late is dropped

  const DONE_TABS = {
    done: ['Done', 'check'], todo: ['To-do', 'list'], progress: ['In Progress', 'play'],
    questions: ['Questions', 'chat'], blockers: ['Blockers', 'lock'], minutes: ['Minutes of meeting', 'note'], shared: ['Shared with me', 'share'],
  };
  const doneTab = (tab) => (tab === 'day' ? 'done' : DONE_TABS[tab] ? tab : null); // 'day': links made before the tabs
  const Q_STATUS = { open: ['Open', 'slate'], ready: ['Ready for discussion', 'amber'], discussed: ['Discussed', 'sky'], resolved: ['Resolved', 'green'] };
  const Q_STEPS = Object.keys(Q_STATUS);

  // days are 'YYYY-MM-DD' of the team's calendar; counted in UTC so the browser's timezone never shifts them
  const dayParts = (day) => day.split('-').map(Number);
  const shiftDay = (day, n) => { const [y, m, d] = dayParts(day); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
  const daysBetween = (a, b) => { const [y1, m1, d1] = dayParts(a); const [y2, m2, d2] = dayParts(b); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); };
  const dayName = (day) => new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtMinutes = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`);
  const uuid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : (r % 4) + 8).toString(16); }));
  const prioTag = (p) => `<span class="prio-tag ${p}"><span class="dot bg-${p}"></span>${PRIORITY[p] ? PRIORITY[p].label : p}</span>`;
  const personOptions = (d, selected, none) => `<option value="">${none}</option>${d.people.map((u) => `<option value="${u.id}" ${u.id === selected ? 'selected' : ''}>${esc(u.name)}${u.id === me.id ? ' (you)' : ''}</option>`).join('')}`;

  // The journal is a page of its own, in the board's place (like Sanity); the address (#done=<app>&tab=…) keeps it.
  // tab: done | todo | progress | questions | blockers | minutes | shared; kept as it is when left out. No date: today.
  // meetingId: the minutes to show on the Minutes tab.
  function openDone(pid, date, tab, meetingId) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return null; }
    const seq = ++doneSeq;
    const keep = doneView && doneView.productId === pid ? doneView : null;
    return api('GET', `/api/done?product=${encodeURIComponent(pid)}${date ? `&date=${date}` : ''}`).done((d) => {
      if (seq !== doneSeq) return; // another day was picked meanwhile: its answer wins
      if (!keep) donePicked = [];
      doneView = {
        search: '', prio: '', qStatus: '', qScope: '', draftId: uuid(), ...(keep ? {
          search: keep.search, prio: keep.prio, qStatus: keep.qStatus, qScope: keep.qScope, draftId: keep.draftId, draft: keep.draft,
          editing: keep.editing, agenda: keep.agenda, results: keep.results, mom: keep.mom,
        } : {}),
        productId: pid, ...d, tab: doneTab(tab) || (keep && keep.tab) || 'done', sharing: null, saving: false,
        followToday: d.date === d.today, // on today: a reload after midnight moves on to the new day
      };
      if (doneView.editing && !doneTarget(doneView.editing)) doneView.editing = null;
      const fresh = $('#journalPage').hasClass('hidden');
      if (sanity) closeSanity();
      if (sheetsView) closeSheets();
      if (adminView) closeAdmin();
      if (templatesView) closeTemplates();
      renderDone();
      $('#board, #tabs').addClass('hidden');
      $('#journalPage').removeClass('hidden');
      markNav();
      doneHash();
      if (fresh) window.scrollTo(0, 0);
      if (doneView.agenda && doneView.tab === 'questions') loadAgenda(doneView.agenda.date);
      if (doneView.tab === 'minutes' && (!doneView.mom || meetingId)) loadMeetings(meetingId);
    });
  }

  // the address keeps the page, its day, tab and minutes, so a refresh or a shared link comes back here
  function doneHash() {
    const d = doneView;
    if (!d) return;
    const meeting = d.tab === 'minutes' && d.mom && d.mom.current ? `&meeting=${d.mom.current.meeting.id}` : '';
    history.replaceState(null, '', `${location.pathname}${location.search}#done=${encodeURIComponent(d.productId)}${d.followToday ? '' : `&date=${d.date}`}${d.tab === 'done' ? '' : `&tab=${d.tab}`}${meeting}`);
  }

  // what is half typed in the box at the top, to put back after the page is drawn again
  const formValues = () => {
    const vals = {};
    $('#doneAdd [name]').each((i, el) => { vals[el.name] = $(el).val(); });
    return { vals, open: $('#doneAdd details').prop('open') };
  };
  const restoreForm = ({ vals, open }) => {
    Object.entries(vals).forEach(([k, v]) => { if (v) $(`#doneAdd [name="${k}"]`).val(v); });
    if (open) $('#doneAdd details').prop('open', true);
  };
  const reloadDone = () => {
    if (!doneView) return $.Deferred().resolve();
    const typed = formValues();
    return openDone(doneView.productId, doneView.followToday ? '' : doneView.date).done(() => restoreForm(typed));
  };
  // draw again, keeping what is typed (attaching a screen, switching tabs …)
  const keepForm = (fn) => { const typed = formValues(); fn(); renderDone(); restoreForm(typed); };

  function closeDone() {
    doneView = null;
    $('#journalPage').addClass('hidden');
    $('#doneBody').empty();
    $('#board, #tabs').removeClass('hidden');
    markNav();
    history.replaceState(null, '', location.pathname + location.search);
  }

  const screenChip = (id, removable) => {
    const s = findScreen(id);
    if (!s) return '';
    const f = findFlow(s.flowId);
    return `<span class="screen-chip"><button type="button" data-done-screen="${id}" title="${esc(f ? f.name : '')} › ${esc(s.name)}">${esc(s.name)}</button>${removable ? `<button type="button" data-done-unpick="${id}" title="Remove">${icon('close', 10)}</button>` : ''}</span>`;
  };
  const screenChips = (ids) => (ids.length ? `<div class="mt-1 flex flex-wrap gap-1">${ids.map((id) => screenChip(id)).join('')}</div>` : '');
  const screenNames = (ids) => ids.map((id) => (findScreen(id) || {}).name || '');

  // One entry: text, screens, who it is shared with and whether it is closed; the author edits, shares and deletes,
  // a tester / super admin it was shared with closes it. withAuthor: on "Shared with me", say who and which day.
  function doneEntry(x, withAuthor) {
    const d = doneView;
    const name = (id) => (d.people.find((u) => u.id === id) || {}).name || '—';
    const owns = (x.userId === me.id || me.access === 'super') && can('edit');
    const closable = d.canClose && x.sharedWith.length && (x.sharedWith.includes(me.id) || me.access === 'super');
    const picking = d.sharing === x.id;
    const editing = d.editing && d.editing.id === x.id;
    return `
      <li class="done-item ${x.closedAt ? 'closed' : ''} ${editing ? 'editing' : ''}">
        <div class="min-w-0 flex-1">
          ${withAuthor ? `<p class="mb-0.5 flex items-center gap-1 text-xs font-semibold text-slate-600">${icon('user', 12)} ${esc(x.userName)} <span class="font-normal text-slate-400">· ${fmtDate(x.date)}</span></p>` : ''}
          <p class="whitespace-pre-wrap text-sm text-slate-800">${esc(x.text)}</p>
          ${screenChips(x.screenIds)}
          <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span>${new Date(x.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ${x.minutes ? `<span class="jr-time" title="Time spent">${icon('clock', 11)} ${fmtMinutes(x.minutes)}</span>` : ''}
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
        ${x.todoId && x.userId === me.id && can('edit') ? `<button class="icon-btn" data-todo-undo="${x.todoId}" title="Not done yet: back to the to-do list">${icon('undo', 14)}</button>` : ''}
        ${owns ? `
          <button class="icon-btn ${picking ? 'text-indigo-600' : ''}" data-done-share-to="${x.id}" title="Share this with someone">${icon('share', 14)}</button>
          <button class="icon-btn" data-done-edit="${x.id}" title="Edit">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-done-delete="${x.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
      </li>`;
  }

  // One point (to-do or in progress): tick it and it moves to today's done list. A past day only shows them.
  function todoItem(t) {
    const d = doneView;
    const live = d.date === d.today && can('edit');
    const progress = t.stage === 'progress';
    const since = progress && t.startedAt ? Math.max(0, Math.floor((Date.now() - new Date(t.startedAt)) / 864e5)) : null;
    const blocked = d.blockers.filter((b) => b.todoId === t.id && !b.resolvedAt);
    return `
      <li class="todo-item ${d.editing && d.editing.id === t.id ? 'editing' : ''}" data-todo="${t.id}">
        ${live ? `<button type="button" class="todo-check" data-todo-done="${t.id}" title="Done: move it to Done today" aria-label="Mark done">${icon('check', 12)}</button>` : `<span class="todo-check" aria-hidden="true"></span>`}
        <div class="min-w-0 flex-1">
          <p class="whitespace-pre-wrap text-sm text-slate-800">${esc(t.text)}</p>
          <p class="jr-meta">
            ${prioTag(t.priority)}
            ${t.estMinutes ? `<span title="Estimate">${icon('clock', 11)} ~${fmtMinutes(t.estMinutes)}</span>` : ''}
            ${since !== null ? `<span>${since ? `started ${since} day${since === 1 ? '' : 's'} ago` : 'started today'}</span>` : ''}
            ${blocked.length ? `<span class="jr-flag">${icon('lock', 11)} blocked</span>` : ''}
          </p>
          ${t.nextAction ? `<p class="jr-next">${icon('arrow', 12)} <b>Next:</b> ${esc(t.nextAction)}</p>` : ''}
          ${screenChips(t.screenIds)}
        </div>
        ${live ? `
          ${progress
    ? `<button class="icon-btn" data-todo-stage="${t.id}" data-stage="todo" title="Not working on it now: back to To-do">${icon('undo', 14)}</button>
       <button class="icon-btn" data-todo-block="${t.id}" title="Blocked: note what stops it">${icon('lock', 14)}</button>`
    : `<button class="icon-btn" data-todo-stage="${t.id}" data-stage="progress" title="Start: move to In Progress">${icon('play', 14)}</button>`}
          <button class="icon-btn" data-todo-edit="${t.id}" title="Edit">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-todo-delete="${t.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
      </li>`;
  }

  // One question: its workflow (Open → Ready → Discussed → Resolved), details for the meeting, and the answer
  function questionItem(q, numbered) {
    const d = doneView;
    const r = q.rights;
    const carried = q.raisedOn < d.date && q.status !== 'resolved';
    const [label, color] = Q_STATUS[q.status];
    const next = Q_STEPS[Q_STEPS.indexOf(q.status) + 1];
    return `
      <li class="jq ${q.status === 'resolved' ? 'resolved' : ''} ${d.editing && d.editing.id === q.id ? 'editing' : ''}">
        <div class="jq-top">
          ${numbered ? `<b class="jq-num">${numbered}.</b>` : ''}
          ${prioTag(q.priority)}
          <span class="jr-pill st-${color}">${label}</span>
          ${carried ? `<span class="jr-pill st-violet" title="Still open from an earlier day">Open since ${fmtDate(q.raisedOn)}</span>` : ''}
          ${q.meetingDate ? `<span class="jr-meta-i" title="Meeting">${icon('clock', 11)} Meeting ${fmtDate(q.meetingDate)}</span>` : ''}
          <span class="ml-auto flex items-center">
            ${r.edit ? `<button class="icon-btn" data-q-edit="${q.id}" title="Edit">${icon('edit', 14)}</button>` : ''}
            ${r.remove ? `<button class="icon-btn danger" data-q-delete="${q.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
          </span>
        </div>
        <p class="jq-text">${esc(q.text)}</p>
        ${q.details ? `<p class="jq-sub">${esc(q.details)}</p>` : ''}
        ${q.expected ? `<p class="jq-sub"><b>Expected:</b> ${esc(q.expected)}</p>` : ''}
        ${q.apis.length ? `<div class="mt-1 flex flex-wrap gap-1">${q.apis.map((a) => `<code class="jq-api">${esc(a)}</code>`).join('')}</div>` : ''}
        ${screenChips(q.screenIds)}
        ${q.answer ? `<p class="jq-answer"><b>${q.status === 'resolved' ? 'Answer' : 'Notes'}:</b> ${esc(q.answer)}</p>` : ''}
        <div class="jq-foot">
          <span>Asked by ${esc(q.userId === me.id ? 'you' : q.userName)} · ${fmtDate(q.raisedOn)}${q.assigneeId ? ` · for <b>${esc(q.assigneeId === me.id ? 'you' : q.assigneeName)}</b>` : ''}${q.resolvedOn ? ` · resolved ${fmtDate(q.resolvedOn)}` : ''}</span>
          ${r.move ? `<span class="jq-steps" role="group" aria-label="Status">${Q_STEPS.map((s) => `
            <button type="button" class="${s === q.status ? 'on' : ''} ${s === next ? 'next' : ''}" data-q-status="${q.id}" data-to="${s}" ${s === q.status ? 'disabled aria-current="step"' : ''} title="${s === q.status ? 'Now' : 'Move to'}: ${esc(Q_STATUS[s][0])}">${esc(Q_STATUS[s][0].split(' ')[0])}</button>`).join('')}</span>` : ''}
        </div>
      </li>`;
  }

  // One blocker: how long it has blocked, who it waits on, the next action, and how it was resolved
  function blockerItem(b) {
    const d = doneView;
    const days = daysBetween(b.raisedOn, b.resolvedOn || d.date);
    return `
      <li class="jb ${b.resolvedAt ? 'resolved' : ''} ${d.editing && d.editing.id === b.id ? 'editing' : ''}">
        <div class="min-w-0 flex-1">
          <p class="jr-meta">
            ${prioTag(b.priority)}
            <span class="jr-pill ${b.resolvedAt ? 'st-green' : 'st-red'}">${b.resolvedAt ? `Resolved ${fmtDate(b.resolvedOn)}` : days ? `Blocked ${days} day${days === 1 ? '' : 's'}` : 'Blocked today'}</span>
            ${b.userId !== me.id ? `<span>${icon('user', 11)} ${esc(b.userName)}</span>` : ''}
          </p>
          <p class="mt-1 whitespace-pre-wrap text-sm text-slate-800">${esc(b.text)}</p>
          ${b.waitingOn ? `<p class="jq-sub">Waiting on <b>${esc(b.waitingOn === me.id ? 'you' : b.waitingName)}</b></p>` : ''}
          ${b.nextAction ? `<p class="jr-next">${icon('arrow', 12)} <b>Next:</b> ${esc(b.nextAction)}</p>` : ''}
          ${b.todoText ? `<p class="jq-sub">${icon('list', 11)} Blocks: ${esc(b.todoText)}</p>` : ''}
          ${b.resolution ? `<p class="jq-answer"><b>Resolved:</b> ${esc(b.resolution)}</p>` : ''}
          ${screenChips(b.screenIds)}
        </div>
        ${b.rights.resolve ? (b.resolvedAt
    ? `<button class="btn-secondary shrink-0 px-2 py-1 text-xs" data-b-reopen="${b.id}">Reopen</button>`
    : `<button class="btn-secondary shrink-0 px-2 py-1 text-xs" data-b-resolve="${b.id}">${icon('check', 12)} Resolve</button>`) : ''}
        ${b.rights.edit ? `
          <button class="icon-btn" data-b-edit="${b.id}" title="Edit">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-b-delete="${b.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
      </li>`;
  }

  // ---- what each tab lists, after search and filters

  function doneLists(d) {
    const q = d.search.trim().toLowerCase();
    const has = (...fields) => !q || fields.flat().some((f) => String(f || '').toLowerCase().includes(q));
    const prio = (x) => !d.prio || x.priority === d.prio;
    const qStatus = (x) => !d.qStatus || (d.qStatus === 'unresolved' ? x.status !== 'resolved' : x.status === d.qStatus);
    const qScope = (x) => !d.qScope || (d.qScope === 'mine' ? x.userId === me.id : x.assigneeId === me.id);
    return {
      done: d.items.filter((x) => has(x.text, x.userName, screenNames(x.screenIds))),
      todo: d.todos.filter((t) => t.stage !== 'progress' && prio(t) && has(t.text, t.nextAction, screenNames(t.screenIds))),
      progress: d.todos.filter((t) => t.stage === 'progress' && prio(t) && has(t.text, t.nextAction, screenNames(t.screenIds))),
      questions: d.questions.filter((x) => prio(x) && qStatus(x) && qScope(x)
        && has(x.text, x.details, x.expected, x.answer, x.userName, x.assigneeName, x.apis, screenNames(x.screenIds))),
      blockers: d.blockers.filter((b) => prio(b) && has(b.text, b.nextAction, b.waitingName, b.todoText, b.resolution, b.userName)),
      shared: d.shared.filter((x) => has(x.text, x.userName, screenNames(x.screenIds))),
    };
  }

  // the counts on the tabs and the day's summary (before search and filters)
  function doneCounts(d) {
    const mine = d.items.filter((x) => x.userId === me.id);
    const openQ = d.questions.filter((q) => q.status !== 'resolved');
    const openB = d.blockers.filter((b) => !b.resolvedAt);
    return {
      done: d.items.length, mine: mine.length, logged: mine.reduce((s, x) => s + (x.minutes || 0), 0),
      todo: d.todos.filter((t) => t.stage !== 'progress').length, progress: d.todos.filter((t) => t.stage === 'progress').length,
      questions: openQ.length, ready: openQ.filter((q) => q.status === 'ready').length,
      blockers: openB.length, urgent: openB.filter((b) => ['urgent', 'high'].includes(b.priority)).length,
      shared: d.shared.filter((x) => !x.closedAt).length,
    };
  }

  // the item being edited in the box at the top (null when it is gone)
  function doneTarget(ed) {
    const d = doneView;
    if (!ed) return null;
    const list = { done: d.items, todo: d.todos, progress: d.todos, questions: d.questions, blockers: d.blockers }[ed.kind] || [];
    return list.find((x) => x.id === ed.id) || null;
  }

  // ---- the box at the top: what it asks for depends on the tab (and fills in when editing)

  function doneComposer(d, p) {
    const kind = d.tab;
    const ed = d.editing && d.editing.kind === kind ? doneTarget(d.editing) : null;
    const v = ed || d.draft || {};
    const screenOptions = (p ? p.modules : []).flatMap((m) => m.flows.map((f) => `<optgroup label="${esc(flowLabel(m, f))}">${onlyScreens(f.screens)
      .filter((s) => !donePicked.includes(s.id)).map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</optgroup>`)).join('');
    const screens = `
      <select class="input jr-in-sm max-w-[14rem]" data-done-pick aria-label="Attach a screen"><option value="">${kind === 'done' ? 'Attach a screen you changed…' : 'Attach a screen…'}</option>${screenOptions}</select>
      ${donePicked.map((id) => screenChip(id, true)).join('')}`;
    const prio = (def) => `<select name="priority" class="input jr-in-sm" aria-label="Priority" title="Priority">${priorityOptions(v.priority || def)}</select>`;
    const hint = {
      done: 'Log something you finished. Enter adds; Shift+Enter for a new line.',
      todo: 'Note what you will do; start it to move it to In Progress, tick it when it is done.',
      progress: 'What you are working on now, with the next step.',
      questions: 'A doubt about how the app should work. It stays open, day after day, until it is resolved.',
      blockers: 'What stops your work, who you are waiting on, and what happens next.',
    }[kind];
    const placeholder = {
      done: 'What did you finish? e.g. Fixed OTP timer on Login, new KYC upload flow',
      todo: 'Add a point… e.g. Fix OTP timer on Login',
      progress: 'What are you working on? e.g. KYC upload: compress images before sending',
      questions: 'Your question… e.g. Should the OTP screen resend automatically after 30 seconds?',
      blockers: 'What blocks you? e.g. Waiting for the payment API sandbox keys',
    }[kind];
    const extra = {
      done: `<input name="minutes" class="input jr-in-sm w-36" placeholder="Time spent, e.g. 1h 30m" value="${esc(v.minutes ? fmtMinutes(v.minutes) : '')}" aria-label="Time spent (optional)" title="Time spent (optional)">`,
      todo: `${prio('medium')}<input name="estMinutes" class="input jr-in-sm w-32" placeholder="Estimate, e.g. 2h" value="${esc(v.estMinutes ? fmtMinutes(v.estMinutes) : '')}" aria-label="Estimate (optional)">`,
      progress: `${prio('medium')}<input name="nextAction" class="input jr-in-sm min-w-[12rem] flex-1" maxlength="500" placeholder="Next action (optional)" value="${esc(v.nextAction || '')}" aria-label="Next action">`,
      blockers: `${prio('high')}
        <select name="waitingOn" class="input jr-in-sm" aria-label="Waiting on">${personOptions(d, v.waitingOn, 'Waiting on… (nobody)')}</select>
        <select name="todoId" class="input jr-in-sm max-w-[14rem]" aria-label="Blocks which point">
          <option value="">Blocks a point? (none)</option>${d.todos.map((t) => `<option value="${t.id}" ${t.id === v.todoId ? 'selected' : ''}>${esc(t.text.slice(0, 60))}</option>`).join('')}
        </select>
        <input name="nextAction" class="input jr-in-sm min-w-[12rem] flex-1" maxlength="500" placeholder="Next action, e.g. Follow up with Rahul at 3 pm" value="${esc(v.nextAction || '')}" aria-label="Next action">`,
      questions: `${prio('medium')}
        <select name="assigneeId" class="input jr-in-sm" aria-label="Who answers it">${personOptions(d, v.assigneeId, 'Ask… (anyone)')}</select>
        <label class="jr-date-label">Meeting <input type="date" name="meetingDate" class="input jr-in-sm" value="${esc(v.meetingDate || '')}"></label>`,
    }[kind];
    return `
      <form id="doneAdd" class="done-add jr-compose" novalidate>
        ${ed ? `<p class="jr-editing">${icon('edit', 12)} Editing · <button type="button" class="underline" data-done-cancel-edit>Cancel</button></p>` : `<p class="text-xs text-slate-400">${hint}</p>`}
        <div class="assist-wrap">
          <textarea class="input w-full" name="text" rows="2" maxlength="1000" placeholder="${esc(placeholder)}" data-assist="${kind === 'questions' ? 'question' : 'text'}">${esc(v.text || '')}</textarea>
        </div>
        ${kind === 'questions' ? `
        <details class="jr-more" ${ed && (v.details || v.expected || v.apis.length || v.screenIds.length) ? 'open' : ''}>
          <summary>Details for the meeting: screens, APIs, expected behaviour</summary>
          <div class="grid gap-2 pt-2 sm:grid-cols-2">
            <label class="block"><span class="field-label">Context / what is unclear</span>
              <span class="assist-wrap"><textarea class="input w-full" name="details" rows="2" maxlength="2000" data-assist="text" placeholder="e.g. On Login › OTP the timer restarts when the app comes back from background">${esc(v.details || '')}</textarea></span></label>
            <label class="block"><span class="field-label">Expected behaviour</span>
              <span class="assist-wrap"><textarea class="input w-full" name="expected" rows="2" maxlength="2000" data-assist="text" placeholder="e.g. The timer keeps counting from where it was">${esc(v.expected || '')}</textarea></span></label>
            <label class="block sm:col-span-2"><span class="field-label">Related APIs</span>
              <input class="input w-full" name="apis" maxlength="600" placeholder="e.g. POST /api/otp/send, GET /api/otp/status" value="${esc((v.apis || []).join(', '))}"></label>
          </div>
        </details>` : ''}
        <div class="flex flex-wrap items-center gap-2">
          ${extra}
          ${screens}
          <button class="btn-primary ml-auto">${ed ? `${icon('check', 14)} Save` : `${icon('plus', 14)} ${{ done: 'Add', todo: 'Add point', progress: 'Add', questions: 'Add question', blockers: 'Add blocker' }[kind]}`}</button>
        </div>
      </form>`;
  }

  // ---- the tab's list (drawn on its own while searching, so the search box keeps the cursor)

  function doneListHtml(d) {
    if (d.tab === 'minutes') return momHtml(d);
    if (d.results) return doneResultsHtml(d);
    if (d.tab === 'questions' && d.agenda) return agendaHtml(d);
    const L = doneLists(d);
    const isToday = d.date === d.today;
    const filtered = d.search || d.prio || d.qStatus || d.qScope;
    const empty = (text) => `<p class="py-10 text-center text-sm text-slate-400">${filtered ? 'Nothing matches the search or filters.' : text}</p>`;
    if (d.tab === 'shared') {
      return `<ul class="space-y-1.5">${L.shared.map((x) => doneEntry(x, true)).join('') || empty('Nothing has been shared with you yet.')}</ul>`;
    }
    if (d.tab === 'done') {
      const byPerson = [...new Map(L.done.map((x) => [x.userId, x.userName])).entries()]
        .sort(([a], [b]) => (b === me.id) - (a === me.id)); // you first
      return byPerson.map(([uid, name]) => {
        const list = L.done.filter((x) => x.userId === uid);
        const mins = list.reduce((s, x) => s + (x.minutes || 0), 0);
        return `
          <div>
            <p class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-900">${icon('user', 14)} ${esc(name)}${uid === me.id ? ' <span class="text-xs font-normal text-slate-400">(you)</span>' : ''}
              <span class="text-xs font-normal text-slate-400">${list.length} entr${list.length === 1 ? 'y' : 'ies'}${mins ? ` · ${fmtMinutes(mins)}` : ''}</span></p>
            <ul class="space-y-1.5">${list.map((x) => doneEntry(x)).join('')}</ul>
          </div>`;
      }).join('') || empty(`Nothing logged ${isToday ? 'yet today' : 'on this day'}.`);
    }
    if (d.tab === 'todo' || d.tab === 'progress') {
      const list = L[d.tab];
      return list.length ? `<ul class="space-y-1.5">${list.map(todoItem).join('')}</ul>`
        : empty(d.tab === 'todo' ? (isToday ? 'No open points. Add what you plan to do; open points stay here until you tick them.' : 'No open points at the end of this day.')
          : (isToday ? 'Nothing in progress. Start a point from To-do, or add one here.' : 'Nothing was in progress at the end of this day.'));
    }
    if (d.tab === 'questions') {
      return L.questions.length ? `<ul class="space-y-2">${L.questions.map((q) => questionItem(q)).join('')}</ul>`
        : empty('No open questions. Add a doubt about a flow, a screen or an API, and bring it to the next meeting.');
    }
    return L.blockers.length ? `<ul class="space-y-1.5">${L.blockers.map(blockerItem).join('')}</ul>` : empty('Nothing is blocking you. 🎉');
  }

  // search across all days (server): entries, open points, questions and blockers
  function doneResultsHtml(d) {
    const r = d.results;
    const total = r.done.length + r.todos.length + r.questions.length + r.blockers.length;
    const sec = (title, html) => (html ? `<div><p class="jr-sec">${title}</p><ul class="space-y-1.5">${html}</ul></div>` : '');
    return `
      <div class="jr-results-head">${icon('filter', 14)} ${total} result${total === 1 ? '' : 's'} for <b>“${esc(r.q)}”</b> across all days
        <button type="button" class="btn-secondary ml-auto px-2 py-1 text-xs" data-done-search-clear>${icon('close', 12)} Clear</button></div>
      ${sec('Done', r.done.map((x) => `
        <li class="done-item"><div class="min-w-0 flex-1">
          <p class="whitespace-pre-wrap text-sm text-slate-800">${esc(x.text)}</p>
          <p class="mt-1 text-xs text-slate-400">${x.userId === me.id ? '' : `${esc(x.userName)} · `}${fmtDate(x.date)}${x.minutes ? ` · ${fmtMinutes(x.minutes)}` : ''}</p>
        </div><button class="btn-secondary shrink-0 px-2 py-1 text-xs" data-done-goto="${x.date}">Open day</button></li>`).join(''))}
      ${sec('Open points', r.todos.map((t) => `
        <li class="done-item"><div class="min-w-0 flex-1"><p class="text-sm text-slate-800">${esc(t.text)}</p>
          <p class="jr-meta">${prioTag(t.priority)}<span>${t.stage === 'progress' ? 'In progress' : 'To-do'}</span></p></div></li>`).join(''))}
      ${sec('Questions', r.questions.map((q) => `
        <li class="done-item"><div class="min-w-0 flex-1"><p class="text-sm text-slate-800">${esc(q.text)}</p>
          <p class="jr-meta">${prioTag(q.priority)}<span class="jr-pill st-${Q_STATUS[q.status][1]}">${Q_STATUS[q.status][0]}</span><span>${fmtDate(q.raisedOn)}</span></p>
          ${q.answer ? `<p class="jq-answer"><b>Answer:</b> ${esc(q.answer)}</p>` : ''}</div></li>`).join(''))}
      ${sec('Blockers', r.blockers.map((b) => `
        <li class="done-item"><div class="min-w-0 flex-1"><p class="text-sm text-slate-800">${esc(b.text)}</p>
          <p class="jr-meta">${prioTag(b.priority)}<span>${fmtDate(b.raisedOn)}${b.resolvedOn ? ` → resolved ${fmtDate(b.resolvedOn)}` : ' · open'}</span></p></div></li>`).join(''))}
      ${total ? '' : '<p class="py-10 text-center text-sm text-slate-400">Nothing found on any day.</p>'}`;
  }

  // the meeting agenda: questions ready for discussion or set for that day, each once
  function agendaHtml(d) {
    const a = d.agenda;
    return `
      <div class="jr-agenda-head">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900">${icon('list', 14)} Meeting agenda</p>
          <p class="text-xs text-slate-500">Questions set for this meeting, plus every question marked <b>Ready for discussion</b> that has no meeting yet or was left over from an earlier one.</p>
        </div>
        <input type="date" class="input jr-in-sm" data-agenda-date value="${a.date}" aria-label="Meeting day">
        <button type="button" class="btn-secondary px-2 py-1 text-xs" data-agenda-copy ${a.items.length ? '' : 'disabled'}>${icon('copy', 12)} Copy</button>
        ${can('edit') ? `<button type="button" class="btn-secondary px-2 py-1 text-xs" data-agenda-share ${a.items.length && d.teams ? '' : 'disabled'} title="${d.teams ? 'Post the agenda to the app\'s Teams channel' : 'This app has no Teams channel yet'}">${icon('share', 12)} Teams</button>` : ''}
        <button type="button" class="icon-btn" data-agenda-close title="Back to the questions">${icon('close', 14)}</button>
      </div>
      ${a.items.length ? `<ol class="space-y-2">${a.items.map((q, i) => questionItem(q, i + 1)).join('')}</ol>`
        : '<p class="py-10 text-center text-sm text-slate-400">Nothing on this agenda. Mark questions “Ready for discussion” or set their meeting day.</p>'}`;
  }

  function renderDoneList() {
    if (!doneView) return;
    if (doneView.tab === 'minutes') { renderMom(); return; }
    $('#doneList').html(doneListHtml(doneView));
  }

  function renderDone() {
    const d = doneView;
    const p = products.find((x) => x.id === d.productId);
    const isToday = d.date === d.today;
    const c = doneCounts(d);
    const tab = d.tab;
    const writing = can('edit') && tab !== 'shared' && tab !== 'minutes' && !d.results && !(tab === 'questions' && d.agenda)
      && (isToday || (d.editing && d.editing.kind === tab));
    const metric = (key, label, value, sub, tone) => `
      <button type="button" class="jr-metric ${tab === key ? 'on' : ''} ${tone || ''}" data-done-tab="${key}">
        <span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
    const prioFilter = ['todo', 'progress', 'questions', 'blockers'].includes(tab);
    $('#doneBody').html(`
      <div class="jr-head">
        <button type="button" class="btn-secondary px-2 py-1 text-xs" data-close-done title="Back to the board">${icon('left', 12)} Board</button>
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Daily journal <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
          <p class="text-xs text-slate-500">${esc(dayName(d.date))}${isToday ? ' · today' : ''}</p>
        </div>
        <div class="jr-day" role="group" aria-label="Day">
          <button type="button" class="icon-btn" data-done-day="-1" title="Day before">${icon('left', 16)}</button>
          <input type="date" class="input jr-in-sm" data-done-date value="${d.date}" max="${d.today}" aria-label="Day">
          <button type="button" class="icon-btn" data-done-day="1" title="Next day" ${isToday ? 'disabled' : ''}>${icon('right', 16)}</button>
          ${isToday ? '' : '<button type="button" class="btn-secondary px-2 py-1 text-xs" data-done-today>Today</button>'}
        </div>
      </div>

      <div class="jr-metrics" aria-label="Summary of the day">
        ${metric('done', d.items.length !== c.mine ? 'Done (you)' : 'Done', c.mine, c.logged ? `${fmtMinutes(c.logged)} logged` : '')}
        ${metric('todo', 'To-do', c.todo, '')}
        ${metric('progress', 'In progress', c.progress, '')}
        ${metric('questions', 'Questions open', c.questions, c.ready ? `${c.ready} ready to discuss` : '')}
        ${metric('blockers', 'Blockers', c.blockers, c.urgent ? `${c.urgent} high / urgent` : '', c.blockers ? 'warn' : '')}
      </div>

      <div class="jr-tabs" role="tablist">
        ${Object.entries(DONE_TABS).map(([key, [label, ico]]) => `
          <button type="button" role="tab" aria-selected="${tab === key}" class="${tab === key ? 'on' : ''}" data-done-tab="${key}">
            ${icon(ico, 13)} ${label}${c[key] ? ` <b>${c[key]}</b>` : ''}</button>`).join('')}
      </div>

      <div class="jr-tools">
        <label class="jr-search">${icon('filter', 13)}
          <input type="search" data-done-search value="${esc(d.search)}" placeholder="${tab === 'minutes' ? 'Search the points of these minutes…' : `Search ${tab === 'shared' ? 'shared entries' : `this day's ${DONE_TABS[tab][0].toLowerCase()}`}… (Enter: all days)`}" aria-label="Search">
        </label>
        ${tab === 'minutes' ? '' : '<button type="button" class="btn-secondary px-2 py-1 text-xs" data-done-search-all title="Search every day">All days</button>'}
        ${prioFilter ? `<select class="input jr-in-sm" data-done-filter="prio" aria-label="Priority"><option value="">Any priority</option>${Object.entries(PRIORITY).map(([k, v]) => `<option value="${k}" ${d.prio === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>` : ''}
        ${tab === 'questions' ? `
          <select class="input jr-in-sm" data-done-filter="qStatus" aria-label="Status">
            <option value="">Any status</option><option value="unresolved" ${d.qStatus === 'unresolved' ? 'selected' : ''}>Not resolved</option>
            ${Q_STEPS.map((s) => `<option value="${s}" ${d.qStatus === s ? 'selected' : ''}>${Q_STATUS[s][0]}</option>`).join('')}
          </select>
          <select class="input jr-in-sm" data-done-filter="qScope" aria-label="Whose">
            <option value="">Everyone's</option><option value="mine" ${d.qScope === 'mine' ? 'selected' : ''}>Asked by me</option>
            <option value="assigned" ${d.qScope === 'assigned' ? 'selected' : ''}>Assigned to me</option>
          </select>
          <button type="button" class="btn-secondary px-2 py-1 text-xs ${d.agenda ? 'on' : ''}" data-q-agenda>${icon('list', 12)} Agenda${c.ready ? ` <b>${c.ready}</b>` : ''}</button>` : ''}
      </div>

      ${isToday || tab === 'minutes' ? '' : `<p class="jr-past">${icon('clock', 12)} You are looking at ${fmtDate(d.date)}: lists show what was open at the end of that day. <button type="button" class="underline" data-done-today>Back to today</button></p>`}
      ${writing ? doneComposer(d, p) : ''}

      <div id="doneList" class="jr-list">${doneListHtml(d)}</div>

      ${tab === 'done' && d.items.some((x) => x.userId === me.id) && can('edit') ? `
      <div class="flex items-center gap-3 border-t border-slate-200 px-5 py-3">
        <p class="flex-1 text-xs text-slate-500">${d.teams ? 'Posts your entries of this day to the app\'s Teams channel, with links to the screens.' : 'This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel.'}</p>
        <button class="btn-primary" data-done-share ${d.teams ? '' : 'disabled'}>${icon('share', 14)} Share my day on Teams</button>
      </div>` : ''}`);
    // on a narrow screen the tabs scroll sideways: keep the open one in view
    const $tabs = $('#doneBody .jr-tabs');
    const on = $tabs.find('.on')[0];
    if (on && on.offsetLeft + on.offsetWidth > $tabs[0].clientWidth) $tabs.scrollLeft(on.offsetLeft - 16);
  }

  $doc.on('click', '[data-action="done"]', () => (doneView ? closeDone() : openDone(productId)));
  $doc.on('click', '[data-close-done]', closeDone);

  // ---- days
  const goDay = (day) => {
    const d = doneView;
    d.editing = null;
    d.results = null;
    openDone(d.productId, day >= d.today ? '' : day);
  };
  $doc.on('change', '[data-done-date]', function () { if (/^\d{4}-\d{2}-\d{2}$/.test(this.value)) goDay(this.value); });
  $doc.on('click', '[data-done-day]', function () { goDay(shiftDay(doneView.date, Number($(this).data('done-day')))); });
  $doc.on('click', '[data-done-today]', () => goDay(doneView.today));
  $doc.on('click', '[data-done-goto]', function () { doneView.tab = 'done'; goDay($(this).data('done-goto')); });

  // ---- tabs, search, filters
  $doc.on('click', '[data-done-tab]', function () {
    const tab = $(this).data('done-tab');
    keepForm(() => {
      if (doneView.tab !== tab) { doneView.editing = null; doneView.prio = ''; }
      doneView.tab = tab;
      doneView.sharing = null;
      doneView.results = null;
    });
    doneHash();
    if (tab === 'minutes' && !doneView.mom) loadMeetings();
  });
  $doc.on('input', '[data-done-search]', function () {
    doneView.search = this.value;
    if (doneView.results && !this.value.trim()) { keepForm(() => { doneView.results = null; }); $('[data-done-search]').trigger('focus'); return; }
    renderDoneList();
  });
  const searchAll = () => {
    const q = doneView.search.trim();
    if (q.length < 2) { toast('Type at least 2 characters'); return; }
    api('GET', `/api/journal/search?product=${encodeURIComponent(doneView.productId)}&q=${encodeURIComponent(q)}`).done((r) => {
      if (!doneView || doneView.search.trim() !== q) return;
      keepForm(() => { doneView.results = r; });
    });
  };
  $doc.on('keydown', '[data-done-search]', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchAll(); } });
  $doc.on('click', '[data-done-search-all]', searchAll);
  $doc.on('click', '[data-done-search-clear]', () => keepForm(() => { doneView.results = null; doneView.search = ''; }));
  $doc.on('change', '[data-done-filter]', function () { doneView[$(this).data('done-filter')] = this.value; renderDoneList(); });

  // ---- the box at the top: screens, add / save, cancel an edit
  $doc.on('change', '[data-done-pick]', function () { const id = this.value; if (id) keepForm(() => donePicked.push(id)); });
  $doc.on('click', '[data-done-unpick]', function () { const id = $(this).data('done-unpick'); keepForm(() => { donePicked = donePicked.filter((x) => x !== id); }); });
  // a new entry half written when an edit starts is kept aside and comes back after the edit
  function unstash() {
    const s = doneView.stash;
    doneView.stash = null;
    if (!s || s.tab !== doneView.tab) return;
    restoreForm(s.form);
    if (s.picked.length) keepForm(() => { donePicked = s.picked; });
  }
  const cancelEdit = () => { doneView.editing = null; donePicked = []; renderDone(); unstash(); };
  $doc.on('click', '[data-done-cancel-edit]', cancelEdit);

  // start editing an item in the box at the top (on its tab)
  function startEdit(kind, id) {
    const d = doneView;
    if (!d.editing && $('#doneAdd').length) d.stash = { tab: d.tab, form: formValues(), picked: donePicked };
    d.tab = kind;
    d.editing = { kind, id };
    d.results = null;
    d.agenda = null;
    const x = doneTarget(d.editing);
    donePicked = x ? [...x.screenIds] : [];
    renderDone();
    const box = $('#doneAdd [name=text]')[0];
    if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); $('#doneAdd')[0].scrollIntoView({ block: 'nearest' }); }
  }

  $doc.on('submit', '#doneAdd', function (e) {
    e.preventDefault();
    const d = doneView;
    if (!d || d.saving) return; // one save at a time: Enter pressed twice adds one entry
    const f = {};
    $(this).find('[name]').each((i, el) => { f[el.name] = String($(el).val() || '').trim(); });
    if (!f.text) { $(this).find('[name=text]').trigger('focus'); return; }
    const kind = d.tab;
    const ed = d.editing && d.editing.kind === kind ? d.editing : null;
    const body = { text: f.text, screenIds: donePicked };
    let url;
    if (kind === 'done') {
      Object.assign(body, { minutes: f.minutes || null });
      url = ed ? `/api/done/${ed.id}` : '/api/done';
    } else if (kind === 'todo' || kind === 'progress') {
      Object.assign(body, { priority: f.priority, ...(kind === 'todo' ? { estMinutes: f.estMinutes || null } : { nextAction: f.nextAction }) });
      if (!ed) body.stage = kind;
      url = ed ? `/api/done/todos/${ed.id}` : '/api/done/todos';
    } else if (kind === 'questions') {
      Object.assign(body, {
        details: f.details || '', expected: f.expected || '', apis: f.apis || '', priority: f.priority, assigneeId: f.assigneeId || null, meetingDate: f.meetingDate || null,
      });
      url = ed ? `/api/journal/questions/${ed.id}` : '/api/journal/questions';
    } else {
      Object.assign(body, { priority: f.priority, waitingOn: f.waitingOn || null, todoId: f.todoId || null, nextAction: f.nextAction });
      url = ed ? `/api/journal/blockers/${ed.id}` : '/api/journal/blockers';
    }
    if (!ed) Object.assign(body, { productId: d.productId, clientId: d.draftId });
    d.saving = true;
    api(ed ? 'PATCH' : 'POST', url, body).done((r) => {
      if (doneView !== d) return;
      $(this).find('[name]').each((i, el) => { if (el.tagName !== 'SELECT') $(el).val(''); }); // sent: nothing to keep
      donePicked = [];
      d.editing = null;
      d.draft = null;
      d.draftId = uuid();
      if (r && r.teams && r.teams !== 'off') teamsResult(r.teams, 'Saved and posted on Teams');
      else toast(ed ? 'Saved' : 'Added');
      reloadDone().done(() => { if (ed) unstash(); $('#doneAdd [name=text]').trigger('focus'); });
    }).always(() => { d.saving = false; });
  });
  // Enter adds (Shift+Enter: a new line)
  $doc.on('keydown', '#doneAdd [name=text]', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('#doneAdd').trigger('submit'); }
  });

  // ---- points: tick (→ done today), start / pause, blocked, take back, edit, delete
  const todoDone = (id, done) => api('PUT', `/api/done/todos/${id}/done`, { done });
  $doc.on('click', '[data-todo-done]', function () {
    const id = $(this).data('todo-done');
    const $li = $(this).closest('.todo-item').addClass('ticked');
    todoDone(id, true).done(() => setTimeout(() => { toast('Moved to Done today'); reloadDone(); }, 260)).fail(() => $li.removeClass('ticked'));
  });
  $doc.on('click', '[data-todo-undo]', function () {
    todoDone($(this).data('todo-undo'), false).done(() => { toast('Back on your to-do list'); reloadDone(); });
  });
  $doc.on('click', '[data-todo-stage]', function () {
    const stage = $(this).data('stage');
    api('PATCH', `/api/done/todos/${$(this).data('todo-stage')}`, { stage }).done(() => { toast(stage === 'progress' ? 'Moved to In Progress' : 'Back to To-do'); reloadDone(); });
  });
  $doc.on('click', '[data-todo-block]', function () {
    const t = doneView.todos.find((x) => x.id === $(this).data('todo-block'));
    Object.assign(doneView, { tab: 'blockers', editing: null, results: null, draft: { todoId: t.id, priority: t.priority } });
    renderDone();
    $('#doneAdd [name=text]').trigger('focus');
  });
  $doc.on('click', '[data-todo-edit]', function () {
    const t = doneView.todos.find((x) => x.id === $(this).data('todo-edit'));
    startEdit(t.stage === 'progress' ? 'progress' : 'todo', t.id);
  });
  $doc.on('click', '[data-todo-delete]', function () {
    const id = $(this).data('todo-delete');
    dialog.confirm({ title: 'Delete this point?', confirmText: 'Delete', danger: true, onConfirm: () => api('DELETE', `/api/done/todos/${id}`, null, null, QUIET).done(reloadDone) });
  });
  $doc.on('click', '[data-done-screen]', function () { const id = $(this).data('done-screen'); closeDone(); showScreen(id); });

  // ---- done entries: share with people, close, edit, delete, share the day
  const doneItem = (id) => doneView.items.find((i) => i.id === id) || doneView.shared.find((i) => i.id === id);
  $doc.on('click', '[data-done-share-to]', function () {
    const id = $(this).data('done-share-to');
    keepForm(() => { doneView.sharing = doneView.sharing === id ? null : id; });
  });
  $doc.on('click', '[data-done-share-cancel]', () => keepForm(() => { doneView.sharing = null; }));
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
    if (doneView.items.includes(x)) { startEdit('done', x.id); return; }
    // an entry of another day, under Shared with me (super admins): a quick dialog
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

  // ---- questions: move along the workflow (resolving asks for the answer), edit, delete, agenda
  const questionOf = (id) => doneView.questions.find((q) => q.id === id) || (doneView.agenda && doneView.agenda.items.find((q) => q.id === id));
  $doc.on('click', '[data-q-status]', function () {
    const q = questionOf($(this).data('q-status'));
    const to = $(this).data('to');
    const send = (extra) => api('PUT', `/api/journal/questions/${q.id}/status`, { status: to, ...extra }, null, extra ? QUIET : undefined);
    if (to === 'resolved' || to === 'discussed') {
      ask({
        title: to === 'resolved' ? 'Resolve this question' : 'Discussed',
        fields: [{ name: 'answer', label: to === 'resolved' ? 'Answer / decision' : 'Notes from the meeting', value: q.answer, max: 2000, placeholder: to === 'resolved' ? 'e.g. Yes, resend after 30 s; backend adds a limit of 3' : 'e.g. Needs a check with the backend team' }],
        confirmText: to === 'resolved' ? 'Resolve' : 'Save',
        save: (v) => send({ answer: v.answer }).done(() => { toast(to === 'resolved' ? 'Resolved' : 'Marked as discussed'); reloadDone(); }),
      });
      return;
    }
    send().done(() => { toast(`Moved to ${Q_STATUS[to][0]}`); reloadDone(); });
  });
  $doc.on('click', '[data-q-edit]', function () { startEdit('questions', $(this).data('q-edit')); });
  $doc.on('click', '[data-q-delete]', function () {
    const id = $(this).data('q-delete');
    dialog.confirm({ title: 'Delete this question?', confirmText: 'Delete', danger: true, onConfirm: () => api('DELETE', `/api/journal/questions/${id}`, null, null, QUIET).done(reloadDone) });
  });
  const agendaSeq = { n: 0 };
  function loadAgenda(date) {
    const d = doneView;
    const seq = ++agendaSeq.n;
    return api('GET', `/api/journal/agenda?product=${encodeURIComponent(d.productId)}${date ? `&date=${date}` : ''}`).done((r) => {
      if (doneView !== d || seq !== agendaSeq.n) return;
      keepForm(() => { d.agenda = r; d.results = null; });
    });
  }
  $doc.on('click', '[data-q-agenda]', () => {
    if (doneView.agenda) { keepForm(() => { doneView.agenda = null; }); return; }
    doneView.editing = null;
    loadAgenda(doneView.today);
  });
  $doc.on('click', '[data-agenda-close]', () => keepForm(() => { doneView.agenda = null; }));
  $doc.on('change', '[data-agenda-date]', function () { if (/^\d{4}-\d{2}-\d{2}$/.test(this.value)) loadAgenda(this.value); });
  $doc.on('click', '[data-agenda-copy]', () => {
    const a = doneView.agenda;
    const p = products.find((x) => x.id === doneView.productId);
    const textOut = [`Meeting agenda · ${p ? p.name : ''} · ${fmtDate(a.date)}`, '', ...a.items.map((q, i) => [
      `${i + 1}. [${PRIORITY[q.priority].label}] ${q.text}${q.assigneeName ? ` → ${q.assigneeName}` : ''} (${Q_STATUS[q.status][0]})`,
      q.details ? `   Context: ${q.details}` : '', q.expected ? `   Expected: ${q.expected}` : '', q.apis.length ? `   APIs: ${q.apis.join(', ')}` : '',
      q.screenIds.length ? `   Screens: ${screenNames(q.screenIds).filter(Boolean).join(', ')}` : '',
    ].filter(Boolean).join('\n'))].join('\n');
    const fallback = () => { const $t = $('<textarea>').val(textOut).appendTo('body').trigger('select'); document.execCommand('copy'); $t.remove(); };
    (navigator.clipboard ? navigator.clipboard.writeText(textOut) : Promise.reject()).catch(fallback).then(() => toast('Agenda copied'));
  });
  $doc.on('click', '[data-agenda-share]', () => {
    api('POST', '/api/journal/agenda/share', { productId: doneView.productId, date: doneView.agenda.date })
      .done((r) => toast(`Agenda (${r.count}) posted on Teams`));
  });

  // ---- blockers: resolve (how), reopen, edit, delete
  $doc.on('click', '[data-b-resolve]', function () {
    const id = $(this).data('b-resolve');
    ask({
      title: 'Resolve this blocker',
      fields: [{ name: 'resolution', label: 'How was it resolved?', max: 1000, placeholder: 'e.g. Got the sandbox keys from Rahul' }],
      confirmText: 'Resolve',
      save: (v) => api('PUT', `/api/journal/blockers/${id}/resolved`, { resolved: true, resolution: v.resolution }, null, QUIET)
        .done(() => { toast('Blocker resolved'); reloadDone(); }),
    });
  });
  $doc.on('click', '[data-b-reopen]', function () {
    api('PUT', `/api/journal/blockers/${$(this).data('b-reopen')}/resolved`, { resolved: false }).done(() => { toast('Blocker open again'); reloadDone(); });
  });
  $doc.on('click', '[data-b-edit]', function () { startEdit('blockers', $(this).data('b-edit')); });
  $doc.on('click', '[data-b-delete]', function () {
    const id = $(this).data('b-delete');
    dialog.confirm({ title: 'Delete this blocker?', confirmText: 'Delete', danger: true, onConfirm: () => api('DELETE', `/api/journal/blockers/${id}`, null, null, QUIET).done(reloadDone) });
  });

  // ---- minutes of meeting: meetings on the left, the open one on the right. Each point is ticked Done, To be
  // discussed with someone, or Deferred; all points, or the ones picked, are shared on the app's Teams channel.
  // doneView.mom: { list, canCreate, current: { meeting, points }, picked: Set of point ids, share, form: 'new' | 'edit',
  //   pendingDiscuss: point id whose person is being picked, draftId }

  const POINT_STATUS = { done: 'Done', discuss: 'To be discussed', deferred: 'Deferred', open: 'Open' };

  function loadMeetings(selectId) {
    const d = doneView;
    return api('GET', `/api/journal/meetings?product=${encodeURIComponent(d.productId)}`).done((r) => {
      if (doneView !== d) return;
      const m = d.mom || { picked: new Set(), draftId: uuid() };
      d.mom = { ...m, list: r.meetings, canCreate: r.canCreate };
      const keepId = m.current && r.meetings.some((x) => x.id === m.current.meeting.id) ? m.current.meeting.id : null;
      const id = (selectId && r.meetings.some((x) => x.id === selectId) ? selectId : null) || keepId || (r.meetings[0] && r.meetings[0].id);
      if (id) openMeeting(id);
      else { d.mom.current = null; renderMom(); doneHash(); }
    });
  }
  const openMeeting = (id) => api('GET', `/api/journal/meetings/${encodeURIComponent(id)}`).done(setMeeting);

  // a meeting with its points, as the server sent it (after any change)
  function setMeeting(r) {
    const d = doneView;
    if (!d || !d.mom) return;
    const m = d.mom;
    if (!m.current || m.current.meeting.id !== r.meeting.id) { m.picked = new Set(); m.share = null; }
    m.current = r;
    m.form = null;
    m.pendingDiscuss = null;
    m.picked = new Set([...m.picked].filter((id) => r.points.some((p) => p.id === id)));
    const row = m.list.find((x) => x.id === r.meeting.id);
    const summary = { ...r.meeting, points: r.points.length, done: r.points.filter((p) => p.status === 'done').length };
    if (row) Object.assign(row, summary); else m.list.unshift(summary);
    m.list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    renderMom();
    doneHash();
  }

  // draw the minutes again, keeping a point and a note half typed
  function renderMom() {
    if (!doneView || doneView.tab !== 'minutes') return;
    const typed = { text: $('#momAdd [name=momText]').val(), note: $('#momShare [name=momNote]').val() };
    $('#doneList').html(momHtml(doneView));
    if (typed.text) $('#momAdd [name=momText]').val(typed.text);
    if (typed.note) $('#momShare [name=momNote]').val(typed.note);
  }

  const personName = (d, id) => (d.people.find((u) => u.id === id) || {}).name || '—';

  function momHtml(d) {
    const m = d.mom;
    if (!m) return '<p class="py-10 text-center text-sm text-slate-400">Loading minutes…</p>';
    const cur = m.current;
    return `
      <div class="mom">
        <aside class="mom-side" aria-label="Meetings">
          ${m.canCreate ? `<button type="button" class="btn-primary w-full justify-center" data-mom-new>${icon('plus', 14)} New minutes</button>` : ''}
          <ul class="mom-list">${m.list.map((x) => `
            <li><button type="button" class="mom-item ${cur && cur.meeting.id === x.id && !m.form ? 'on' : ''}" data-mom-open="${x.id}">
              <b>${esc(x.title)}</b>
              <span>${fmtDate(x.date)} · ${x.points ? `${x.done}/${x.points} done` : 'no points yet'}${x.sharedAt ? ' · shared' : ''}</span>
            </button></li>`).join('') || '<li class="p-2 text-xs text-slate-400">No minutes yet. Start one for your next meeting.</li>'}</ul>
        </aside>
        <section class="mom-main">
          ${m.form ? momForm(d) : cur ? momMeeting(d) : `<p class="py-10 text-center text-sm text-slate-400">${m.canCreate ? 'Start the minutes of a meeting with <b>New minutes</b>.' : 'No minutes yet.'}</p>`}
        </section>
      </div>`;
  }

  // new minutes, or the title / day / attendees of these
  function momForm(d) {
    const m = d.mom;
    const mt = m.form === 'edit' && m.current ? m.current.meeting : { title: '', date: d.today, attendees: [me.id] };
    return `
      <form id="momForm" class="mom-form" novalidate>
        <p class="text-sm font-semibold text-slate-900">${m.form === 'edit' ? 'Edit minutes' : 'New minutes'}</p>
        <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label class="block"><span class="field-label">Meeting</span>
            <input class="input w-full" name="title" maxlength="200" value="${esc(mt.title)}" placeholder="e.g. Sprint review, KYC flow sync"></label>
          <label class="block"><span class="field-label">Date</span>
            <input type="date" class="input" name="date" value="${esc(mt.date)}" required></label>
        </div>
        <span class="field-label mt-2 block">Attended</span>
        <div class="mom-people">${d.people.map((u) => `
          <label><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="attendees" value="${u.id}" ${mt.attendees.includes(u.id) ? 'checked' : ''}> ${esc(u.name)}</label>`).join('')}</div>
        <div class="mt-3 flex gap-2">
          <button class="btn-primary">${icon('check', 14)} ${m.form === 'edit' ? 'Save' : 'Start minutes'}</button>
          <button type="button" class="btn-secondary" data-mom-form-cancel>Cancel</button>
        </div>
      </form>`;
  }

  function momPoint(d, p, canEdit) {
    const m = d.mom;
    const asking = m.pendingDiscuss === p.id;
    const box = (value, label) => `
      <label class="mom-check ${value} ${p.status === value || (value === 'discuss' && asking) ? 'on' : ''}">
        <input type="checkbox" data-mom-status="${p.id}" value="${value}" ${p.status === value || (value === 'discuss' && asking) ? 'checked' : ''} ${canEdit ? '' : 'disabled'}> ${label}</label>`;
    return `
      <li class="mom-pt ${p.status}">
        <input type="checkbox" class="mom-pick h-4 w-4 accent-indigo-600" data-mom-pick="${p.id}" ${m.picked.has(p.id) ? 'checked' : ''} aria-label="Pick this point to share" title="Pick to share">
        <div class="min-w-0 flex-1">
          <p class="mom-text">${esc(p.text)}</p>
          ${p.questionId ? `<p class="jr-meta"><span>${icon('chat', 11)} From the agenda${p.questionStatus ? ` · question ${esc(Q_STATUS[p.questionStatus][0].toLowerCase())}` : ''}</span></p>` : ''}
          <div class="mom-checks" role="group" aria-label="Outcome">
            ${box('done', 'Done')}
            ${box('discuss', 'To be discussed with')}
            ${p.status === 'discuss' || asking ? `<select class="input jr-in-sm" data-mom-with="${p.id}" aria-label="To be discussed with" ${canEdit ? '' : 'disabled'}>${personOptions(d, p.discussWith, 'Pick a person…')}</select>` : ''}
            ${box('deferred', 'Deferred')}
          </div>
        </div>
        ${canEdit ? `
          <button class="icon-btn" data-mom-edit="${p.id}" title="Edit">${icon('edit', 14)}</button>
          <button class="icon-btn danger" data-mom-delete="${p.id}" title="Delete">${icon('trash', 14)}</button>` : ''}
      </li>`;
  }

  function momMeeting(d) {
    const m = d.mom;
    const { meeting: mt, points } = m.current;
    const canEdit = mt.rights.edit;
    const q = d.search.trim().toLowerCase();
    const shown = points.filter((p) => !q || [p.text, p.discussWithName].some((x) => String(x || '').toLowerCase().includes(q)));
    const n = (status) => points.filter((p) => p.status === status).length;
    const allPicked = shown.length && shown.every((p) => m.picked.has(p.id));
    const mentionDefault = new Set([...mt.attendees, ...points.filter((p) => !m.picked.size || m.picked.has(p.id)).map((p) => p.discussWith).filter(Boolean)]);
    return `
      <div class="mom-head">
        <div class="min-w-0 flex-1">
          <h4 class="text-base font-semibold text-slate-900">${esc(mt.title)}</h4>
          <p class="text-xs text-slate-500">${esc(dayName(mt.date))}${mt.createdByName ? ` · minutes by ${esc(mt.createdByName)}` : ''}${mt.sharedAt ? ` · shared on Teams ${fmtDate(mt.sharedAt)}` : ''}</p>
          ${mt.attendees.length ? `<p class="mom-att">${icon('user', 12)} ${mt.attendees.map((id) => esc(personName(d, id))).join(', ')}</p>` : ''}
        </div>
        ${canEdit ? `<button class="icon-btn" data-mom-form-edit title="Edit title, date and attendees">${icon('edit', 14)}</button>` : ''}
        ${mt.rights.remove ? `<button class="icon-btn danger" data-mom-remove title="Delete these minutes">${icon('trash', 14)}</button>` : ''}
      </div>
      <div class="mom-sum">
        <span class="jr-pill st-green">${n('done')} done</span>
        <span class="jr-pill st-amber">${n('discuss')} to be discussed</span>
        <span class="jr-pill st-slate">${n('deferred')} deferred</span>
        ${n('open') ? `<span class="jr-pill st-sky">${n('open')} open</span>` : ''}
      </div>
      <div class="mom-bar">
        <label class="mom-all"><input type="checkbox" class="h-4 w-4 accent-indigo-600" data-mom-pick-all ${allPicked ? 'checked' : ''} ${shown.length ? '' : 'disabled'}> ${m.picked.size ? `${m.picked.size} picked` : 'Pick all'}</label>
        ${canEdit ? `<button type="button" class="btn-secondary px-2 py-1 text-xs" data-mom-agenda title="Add the questions on the agenda of ${fmtDate(mt.date)} as points (each once)">${icon('list', 12)} Add agenda questions</button>` : ''}
        <span class="flex-1"></span>
        <button type="button" class="btn-secondary px-2 py-1 text-xs" data-mom-copy ${points.length ? '' : 'disabled'}>${icon('copy', 12)} Copy ${m.picked.size ? 'picked' : 'all'}</button>
        ${canEdit ? `<button type="button" class="btn-primary px-3 py-1 text-xs" data-mom-share-open ${points.length ? '' : 'disabled'}>${icon('share', 12)} Share ${m.picked.size ? `${m.picked.size} picked` : 'all points'}</button>` : ''}
      </div>
      ${m.share ? `
      <form id="momShare" class="mom-share">
        <p class="flex items-center gap-1.5 text-sm font-semibold text-slate-900">${icon('share', 13)} Share on the app's Teams channel</p>
        <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <label class="flex items-center gap-2"><input type="radio" name="momScope" value="all" ${m.picked.size ? '' : 'checked'}> All points (${points.length})</label>
          <label class="flex items-center gap-2 ${m.picked.size ? '' : 'text-slate-400'}"><input type="radio" name="momScope" value="picked" ${m.picked.size ? 'checked' : 'disabled'}> Only the picked points (${m.picked.size})</label>
        </div>
        <span class="field-label mt-2 block">@mention <span class="font-normal text-slate-400">(people a shared point is to be discussed with are always mentioned)</span></span>
        <div class="mom-people">${d.people.map((u) => `
          <label><input type="checkbox" class="h-4 w-4 accent-indigo-600" name="momMention" value="${u.id}" ${mentionDefault.has(u.id) ? 'checked' : ''}> ${esc(u.name)}${u.teams ? '' : ' <span class="text-xs text-slate-400">(no Teams email)</span>'}</label>`).join('')}</div>
        <input class="input mt-2 w-full" name="momNote" maxlength="500" placeholder="A note on top (optional), e.g. Next sync on Friday">
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <button class="btn-primary" ${d.teams ? '' : 'disabled'}>${icon('share', 14)} Post to Teams</button>
          <button type="button" class="btn-secondary" data-mom-share-cancel>Cancel</button>
          ${d.teams ? '' : '<span class="text-xs text-slate-500">This app has no Teams channel yet. A super admin can add it in Sanity → Teams channel. You can still Copy.</span>'}
        </div>
      </form>` : ''}
      <ul class="mom-points">${shown.map((p) => momPoint(d, p, canEdit)).join('')
        || `<p class="py-8 text-center text-sm text-slate-400">${q ? 'No point matches the search.' : 'No points yet. Write what was decided, or add the agenda questions.'}</p>`}</ul>
      ${canEdit ? `
      <form id="momAdd" class="mom-add">
        <div class="assist-wrap"><textarea class="input w-full" name="momText" rows="2" maxlength="1000" data-assist="text" placeholder="Add a point… e.g. OTP resends after 30 s, at most 3 times (Enter adds)"></textarea></div>
        <button class="btn-primary self-end">${icon('plus', 14)} Add point</button>
      </form>` : ''}`;
  }

  // the minutes as text (the picked points, or all), grouped by outcome
  function momText() {
    const { meeting: mt, points } = doneView.mom.current;
    const picked = doneView.mom.picked;
    const list = picked.size ? points.filter((p) => picked.has(p.id)) : points;
    const groups = ['done', 'discuss', 'deferred', 'open'].map((st) => {
      const items = list.filter((p) => p.status === st);
      return items.length ? [`${POINT_STATUS[st]}:`, ...items.map((p) => `- ${p.text}${st === 'discuss' ? ` (with ${p.discussWithName})` : ''}`)].join('\n') : '';
    }).filter(Boolean);
    const att = mt.attendees.map((id) => personName(doneView, id)).join(', ');
    return [`Minutes: ${mt.title} · ${fmtDate(mt.date)}`, att ? `Attended: ${att}` : '', '', groups.join('\n\n')].filter((x, i) => x || i === 2).join('\n');
  }
  const copyText = (textOut, done) => {
    const fallback = () => { const $t = $('<textarea>').val(textOut).appendTo('body').trigger('select'); document.execCommand('copy'); $t.remove(); };
    (navigator.clipboard ? navigator.clipboard.writeText(textOut) : Promise.reject()).catch(fallback).then(() => toast(done));
  };

  const mom = () => doneView.mom;
  const momPointOf = (id) => mom().current.points.find((p) => p.id === id);
  $doc.on('click', '[data-mom-open]', function () { mom().form = null; openMeeting($(this).data('mom-open')); });
  $doc.on('click', '[data-mom-new]', () => { mom().form = 'new'; renderMom(); $('#momForm [name=title]').trigger('focus'); });
  $doc.on('click', '[data-mom-form-edit]', () => { mom().form = 'edit'; renderMom(); $('#momForm [name=title]').trigger('focus'); });
  $doc.on('click', '[data-mom-form-cancel]', () => { mom().form = null; renderMom(); });
  $doc.on('submit', '#momForm', function (e) {
    e.preventDefault();
    const m = mom();
    const body = {
      title: $(this).find('[name=title]').val().trim() || 'Team meeting',
      date: $(this).find('[name=date]').val(),
      attendees: $(this).find('[name=attendees]:checked').map((i, el) => el.value).get(),
    };
    if (!body.date) { $(this).find('[name=date]').trigger('focus'); return; }
    const editing = m.form === 'edit';
    const req = editing ? api('PATCH', `/api/journal/meetings/${m.current.meeting.id}`, body)
      : api('POST', '/api/journal/meetings', { ...body, productId: doneView.productId, clientId: m.draftId });
    req.done((r) => { if (!editing) m.draftId = uuid(); setMeeting(r); toast(editing ? 'Saved' : 'Minutes started'); });
  });
  $doc.on('click', '[data-mom-remove]', () => {
    const mt = mom().current.meeting;
    dialog.confirm({
      title: `Delete the minutes "${mt.title}"?`, confirmText: 'Delete', danger: true,
      onConfirm: () => api('DELETE', `/api/journal/meetings/${mt.id}`, null, null, QUIET).done(() => {
        const m = mom();
        m.list = m.list.filter((x) => x.id !== mt.id);
        m.current = null;
        loadMeetings();
      }),
    });
  });

  // points: add (Enter), edit, delete, from the agenda
  $doc.on('submit', '#momAdd', function (e) {
    e.preventDefault();
    const m = mom();
    const $box = $(this).find('[name=momText]');
    const words = $box.val().trim();
    if (!words || m.saving) { $box.trigger('focus'); return; }
    m.saving = true;
    api('POST', `/api/journal/meetings/${m.current.meeting.id}/points`, { text: words, clientId: m.draftId })
      .done((r) => { m.draftId = uuid(); $box.val(''); setMeeting(r); $('#momAdd [name=momText]').trigger('focus'); })
      .always(() => { m.saving = false; });
  });
  $doc.on('keydown', '#momAdd [name=momText]', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('#momAdd').trigger('submit'); }
  });
  $doc.on('click', '[data-mom-edit]', function () {
    const p = momPointOf($(this).data('mom-edit'));
    ask({
      title: 'Edit point', fields: [{ name: 'text', label: 'Point', value: p.text, required: true, max: 1000 }],
      save: (v) => api('PATCH', `/api/journal/points/${p.id}`, v, null, QUIET).done(setMeeting),
    });
  });
  $doc.on('click', '[data-mom-delete]', function () {
    const id = $(this).data('mom-delete');
    dialog.confirm({ title: 'Delete this point?', confirmText: 'Delete', danger: true, onConfirm: () => api('DELETE', `/api/journal/points/${id}`, null, null, QUIET).done(setMeeting) });
  });
  $doc.on('click', '[data-mom-agenda]', () => {
    const mt = mom().current.meeting;
    api('POST', `/api/journal/meetings/${mt.id}/from-agenda`).done((r) => {
      setMeeting(r);
      toast(r.added ? `${r.added} agenda question${r.added === 1 ? '' : 's'} added` : `Nothing new on the agenda of ${fmtDate(mt.date)}`);
    });
  });

  // the three boxes of a point work as one choice: ticking one unticks the others; unticking leaves it open.
  // "To be discussed with" asks for the person first and saves once one is picked.
  const setPoint = (id, body) => api('PATCH', `/api/journal/points/${id}`, body).done((r) => {
    setMeeting(r);
    if (r.question) toast(`Point saved · its question is now ${Q_STATUS[r.question][0].toLowerCase()}`);
  });
  $doc.on('change', '[data-mom-status]', function () {
    const m = mom();
    const id = $(this).data('mom-status');
    const p = momPointOf(id);
    const value = this.value;
    if (!this.checked) {
      if (value === 'discuss' && m.pendingDiscuss === id && p.status !== 'discuss') { m.pendingDiscuss = null; renderMom(); return; }
      setPoint(id, { status: 'open' });
      return;
    }
    if (value === 'discuss') {
      m.pendingDiscuss = id;
      renderMom();
      $(`[data-mom-with="${id}"]`).trigger('focus');
      return;
    }
    setPoint(id, { status: value });
  });
  $doc.on('change', '[data-mom-with]', function () {
    if (this.value) setPoint($(this).data('mom-with'), { status: 'discuss', discussWith: this.value });
  });

  // picking points to share or copy
  $doc.on('change', '[data-mom-pick]', function () {
    const id = $(this).data('mom-pick');
    if (this.checked) mom().picked.add(id); else mom().picked.delete(id);
    renderMom();
  });
  $doc.on('change', '[data-mom-pick-all]', function () {
    const m = mom();
    const q = doneView.search.trim().toLowerCase();
    const shown = m.current.points.filter((p) => !q || [p.text, p.discussWithName].some((x) => String(x || '').toLowerCase().includes(q)));
    shown.forEach((p) => (this.checked ? m.picked.add(p.id) : m.picked.delete(p.id)));
    renderMom();
  });
  $doc.on('click', '[data-mom-copy]', () => copyText(momText(), 'Minutes copied'));
  $doc.on('click', '[data-mom-share-open]', () => { mom().share = {}; renderMom(); });
  $doc.on('click', '[data-mom-share-cancel]', () => { mom().share = null; renderMom(); });
  $doc.on('submit', '#momShare', function (e) {
    e.preventDefault();
    const m = mom();
    const scope = $(this).find('[name=momScope]:checked').val();
    const body = {
      pointIds: scope === 'picked' ? [...m.picked] : [],
      userIds: $(this).find('[name=momMention]:checked').map((i, el) => el.value).get(),
      note: $(this).find('[name=momNote]').val(),
    };
    api('POST', `/api/journal/meetings/${m.current.meeting.id}/share`, body).done((r) => {
      toast(`${r.count} point${r.count === 1 ? '' : 's'} posted on Teams`);
      m.share = null;
      openMeeting(m.current.meeting.id);
    });
  });

  // ---------------------------------------------------------------- sheets: spreadsheets made inside an app
  // Typed columns (text, number, date, dropdown, checkbox, person, flow, screen), search, Excel-like filters, sort,
  // totals, drag to reorder rows, sharing (private / app can view / app can edit + editors), Excel download and import.
  // A cell saves on its own (only that cell is sent), so the grid is not redrawn while you type.

  const SHEET_TYPES = {
    text: 'Text', number: 'Number', date: 'Date', select: 'Dropdown', checkbox: 'Checkbox', person: 'Person', flow: 'Flow', screen: 'Screen', formula: 'Formula',
  };
  const SHEET_SHARES = [['private', 'Private: only me and editors'], ['view', 'Everyone in the app can view'], ['edit', 'Everyone in the app can edit']];
  const TONE_TAG = { success: 'green', pending: 'amber', fail: 'red', other: 'slate' }; // dropdown value → status tag colour

  // ---------------------------------------------------------------- templates
  // The messages an app sends (e-mail, WhatsApp, SMS, push, other), one tab per channel, on a page of its own in the
  // board's place (like the journal); the address (#templates=<app>&tab=…) keeps it. They are not in the database: each
  // app has a file public/templates/<app name>.json ("Findost Web" → findost-web.json), changed in the code and deployed.

  const TPL_TABS = { email: ['Email', 'mail'], whatsapp: ['WhatsApp', 'chat'], sms: ['SMS', 'chat'], push: ['Push', 'bell'], other: ['Other', 'note'] };
  // { productId, list, tab, search, source: Set of template ids showing their HTML }
  let templatesView = null;

  function openTemplates(pid, tab) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return null; }
    const keep = templatesView && templatesView.productId === pid ? templatesView : null;
    const p = products.find((x) => x.id === pid);
    const file = `/templates/${(p ? p.name : '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.json`;
    // no file yet: the app has no templates
    return $.getJSON(file).then((d) => d, () => $.Deferred().resolve({ templates: [] }).promise()).done((d) => {
      d = { templates: tplList(d.templates) };
      const fresh = $('#templatesPage').hasClass('hidden');
      if (sanity) closeSanity();
      if (sheetsView) closeSheets();
      if (doneView) closeDone();
      if (adminView) closeAdmin();
      const counts = tplCounts(d.templates);
      const first = Object.keys(TPL_TABS).find((k) => counts[k]) || 'email';
      templatesView = {
        productId: pid, list: d.templates, search: keep ? keep.search : '', source: keep ? keep.source : new Set(),
        tab: TPL_TABS[tab] ? tab : keep ? keep.tab : first,
      };
      renderTemplates();
      $('#board, #tabs').addClass('hidden');
      $('#templatesPage').removeClass('hidden');
      markNav();
      templatesHash();
      if (fresh) window.scrollTo(0, 0);
    });
  }
  const templatesHash = () => templatesView && history.replaceState(null, '',
    `${location.pathname}${location.search}#templates=${encodeURIComponent(templatesView.productId)}&tab=${templatesView.tab}`);

  function closeTemplates() {
    templatesView = null;
    $('#templatesPage').addClass('hidden');
    $('#tplBody').empty();
    $('#board, #tabs').removeClass('hidden');
    markNav();
    history.replaceState(null, '', location.pathname + location.search);
  }

  // a variable is { name, note } or "name: what it is"; each template gets an id for the page
  const tplVar = (v) => {
    if (v && typeof v === 'object') return { name: String(v.name || ''), note: String(v.note || '') };
    const at = String(v).indexOf(': ');
    return at > 0 ? { name: String(v).slice(0, at), note: String(v).slice(at + 2) } : { name: String(v), note: '' };
  };
  const tplList = (list) => (Array.isArray(list) ? list : []).filter((t) => t && TPL_TABS[t.channel] && t.name).map((t, i) => ({
    id: `t${i}`, channel: t.channel, name: String(t.name), title: String(t.title || ''), body: String(t.body || ''),
    trigger: String(t.trigger || ''), provider: String(t.provider || ''), externalId: String(t.externalId || ''), source: String(t.source || ''),
    variables: (t.variables || []).map(tplVar).filter((x) => x.name),
  }));
  const tplCounts = (list) => list.reduce((c, t) => { c[t.channel] = (c[t.channel] || 0) + 1; return c; }, {});
  // {{name}}, ${name}, {#var#}, {1}, %name%, [[name]]: the parts filled in when the message is sent
  const TPL_VAR = /(\{\{\s*[\w.-]+\s*\}\}|\$\{\s*[\w.]+\s*\}|\{#\w+#\}|\{\d+\}|%[A-Za-z_]\w*%|\[\[\w+\]\])/g;
  const withVars = (textIn) => esc(textIn).replace(TPL_VAR, '<span class="tpl-var">$1</span>');
  // WhatsApp's own formatting: *bold*, _italic_, ~strike~
  const waFormat = (textIn) => withVars(textIn)
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|\s)_([^_\n]+)_/g, '$1<i>$2</i>').replace(/~([^~\n]+)~/g, '<s>$1</s>');
  const looksHtml = (textIn) => /<(html|body|table|div|p|br|h\d|span|a)\b/i.test(textIn || '');

  // how the message looks where it lands
  function tplPreview(t) {
    const v = templatesView;
    if (t.channel === 'email') {
      const showSource = v.source.has(t.id);
      const html = looksHtml(t.body);
      return `
        <div class="tpl-mail">
          <div class="tpl-mail-head"><span>Subject</span><b>${t.title ? withVars(t.title) : '<i class="text-slate-400">No subject</i>'}</b>
            ${html ? `<button type="button" class="tpl-link" data-tpl-source="${t.id}">${showSource ? 'Preview' : 'HTML'}</button>` : ''}</div>
          ${html && !showSource
    ? `<iframe class="tpl-frame" sandbox="" referrerpolicy="no-referrer" srcdoc="${esc(t.body).replace(/"/g, '&quot;')}" title="${esc(t.name)}"></iframe>`
    : `<pre class="tpl-text">${withVars(t.body)}</pre>`}
        </div>`;
    }
    if (t.channel === 'whatsapp') return `<div class="tpl-chat wa"><div class="tpl-bubble">${t.title ? `<b>${withVars(t.title)}</b><br>` : ''}${waFormat(t.body)}</div></div>`;
    if (t.channel === 'sms') return `<div class="tpl-chat sms"><div class="tpl-bubble">${withVars(t.body)}</div></div>`;
    if (t.channel === 'push') {
      return `<div class="tpl-push"><span class="tpl-push-ico">${icon('bell', 14)}</span><div class="min-w-0">
        <b>${t.title ? withVars(t.title) : esc(t.name)}</b><p>${withVars(t.body)}</p></div></div>`;
    }
    return `<pre class="tpl-text">${t.title ? `<b>${withVars(t.title)}</b>\n` : ''}${withVars(t.body)}</pre>`;
  }

  function tplCard(t) {
    return `
      <article class="tpl-card" data-tpl="${t.id}">
        <header class="tpl-head">
          <div class="min-w-0 flex-1">
            <h4 class="tpl-name" title="${esc(t.name)}">${esc(t.name)}</h4>
            ${t.trigger ? `<p class="tpl-trigger">${icon('clock', 12)}<span>${esc(t.trigger)}</span></p>` : ''}
          </div>
          <div class="tpl-actions">
            <button type="button" class="icon-btn" data-tpl-copy="${t.id}" title="Copy the text">${icon('copy', 14)}</button>
          </div>
        </header>
        ${t.provider || t.externalId ? `<div class="tpl-tags">${t.provider ? `<span class="tpl-tag">${esc(t.provider)}</span>` : ''}${t.externalId ? `<span class="tpl-tag mono" title="Provider template id">${esc(t.externalId)}</span>` : ''}</div>` : ''}
        ${tplPreview(t)}
        ${t.variables.length ? `<div class="tpl-vars"><span>Variables</span>${t.variables.map((x) => `<span class="tpl-var" title="${esc(x.note || '')}">${esc(x.name)}</span>`).join('')}</div>` : ''}
        ${t.source ? `<p class="tpl-source" title="Where it comes from">${esc(t.source)}</p>` : ''}
      </article>`;
  }

  function renderTemplates() {
    const v = templatesView;
    const p = products.find((x) => x.id === v.productId);
    const counts = tplCounts(v.list);
    const q = v.search.trim().toLowerCase();
    const shown = v.list.filter((t) => t.channel === v.tab
      && (!q || [t.name, t.title, t.body, t.trigger, t.provider, t.externalId].some((x) => (x || '').toLowerCase().includes(q))));
    $('#tplBody').html(`
      <div class="jr-head">
        <button type="button" class="btn-secondary px-2 py-1 text-xs" data-close-templates title="Back to the board">${icon('left', 12)} Board</button>
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Templates <span class="font-normal text-slate-400">· ${esc(p ? p.name : '')}</span></h3>
          <p class="text-xs text-slate-500">The e-mails, WhatsApp, SMS and push messages this app sends, with their variables and when they go out.</p>
        </div>
      </div>
      <div class="jr-tabs" role="tablist">
        ${Object.entries(TPL_TABS).map(([key, [label, ico]]) => `
          <button type="button" role="tab" aria-selected="${v.tab === key}" class="${v.tab === key ? 'on' : ''}" data-tpl-tab="${key}">
            ${icon(ico, 13)} ${label}${counts[key] ? ` <b>${counts[key]}</b>` : ''}</button>`).join('')}
      </div>
      <div class="jr-tools">
        <label class="jr-search">${icon('filter', 13)}
          <input type="search" data-tpl-search value="${esc(v.search)}" placeholder="Search ${TPL_TABS[v.tab][0]} templates: name, text, when it is sent…" aria-label="Search templates">
        </label>
        <span class="text-xs text-slate-500">${shown.length} of ${counts[v.tab] || 0}</span>
      </div>
      <div class="tpl-grid">
        ${shown.map(tplCard).join('') || `<p class="tpl-empty">${q ? 'No template matches the search.' : `No ${TPL_TABS[v.tab][0]} templates yet.`}</p>`}
      </div>`);
  }

  const tplById = (id) => templatesView && templatesView.list.find((t) => t.id === id);

  $doc.on('click', '[data-action="templates"]', () => (templatesView ? closeTemplates() : openTemplates(productId)));
  $doc.on('click', '[data-close-templates]', closeTemplates);
  $doc.on('click', '[data-tpl-tab]', function () { templatesView.tab = $(this).data('tpl-tab'); templatesView.search = ''; renderTemplates(); templatesHash(); });
  $doc.on('input', '[data-tpl-search]', function () {
    const pos = this.selectionStart;
    templatesView.search = this.value;
    renderTemplates();
    const box = $('[data-tpl-search]')[0];
    box.focus(); box.setSelectionRange(pos, pos);
  });
  $doc.on('click', '[data-tpl-source]', function () {
    const id = $(this).data('tpl-source');
    if (templatesView.source.has(id)) templatesView.source.delete(id); else templatesView.source.add(id);
    renderTemplates();
  });
  $doc.on('click', '[data-tpl-copy]', function () {
    const t = tplById($(this).data('tpl-copy'));
    if (t) copyText(t.title ? `${t.title}\n\n${t.body}` : t.body, 'Template copied');
  });

  // { productId, list, people, canCreate, teams, doc, search, sort: { col, dir }, picked: Set of row ids (to send on Teams),
  //   filters: { columnId: { values, op, a, b, color } } (kept per sheet in this browser) }
  let sheetsView = null;

  // Sheets is a page of its own, in the board's place (like Sanity), using the whole window;
  // the address (#sheets=<app>&sheet=<id>) keeps it
  function openSheets(pid, sheetId) {
    if (!pid) { dialog.alert('Add an app first.', 'No app'); return; }
    api('GET', `/api/sheets?product=${encodeURIComponent(pid)}`).done((d) => {
      if (sanity) closeSanity();
      if (adminView) closeAdmin();
      if (doneView) closeDone();
      if (templatesView) closeTemplates();
      const keep = sheetsView && sheetsView.productId === pid ? sheetsView : {};
      sheetsView = {
        productId: pid, list: d.sheets, people: d.people, canCreate: d.canCreate, teams: d.teams, doc: null,
        search: keep.search || '', sort: keep.sort || null, picked: new Set(), filters: keep.filters || {}, sheetPicks: keep.sheetPicks || new Set(),
      };
      const id = sheetId || (keep.doc && d.sheets.some((x) => x.id === keep.doc.id) ? keep.doc.id : d.sheets[0] && d.sheets[0].id);
      $('#board, #tabs').addClass('hidden');
      $('#sheetsPage').removeClass('hidden');
      $('body').addClass('sheets-open');
      markNav();
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
      computeFormulas(doc);
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
    markNav();
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

  // ---- formula columns: worked out in this browser (public/formula.js, the same code as the server) from the other
  // cells of the row. row.fx keeps each result as it came (to show it, errors too); row.cells gets it as a value the
  // grid sorts and filters by: a number, a date ('YYYY-MM-DD') or text. col.kind: what its results are.
  const FX = window.flowFormula;
  const fxPlain = (col, v) => (['person', 'flow', 'screen'].includes(col.type) ? cellText(col, v) : v);
  function computeFormulas(doc, only) {
    const fx = doc.columns.filter((c) => c.type === 'formula');
    if (!fx.length) return;
    (only ? [only] : doc.rowList).forEach((row) => {
      row.fx = FX.computeRow(doc.columns, row.cells, fxPlain, doc.rowList.indexOf(row) + 1);
      fx.forEach((c) => {
        const x = row.fx[c.id];
        row.cells[c.id] = FX.isErr(x) ? x.code : typeof x === 'number' && c.format.kind === 'date' ? FX.isoDay(x)
          : typeof x === 'boolean' ? (x ? 'TRUE' : 'FALSE') : x;
      });
    });
    fx.forEach((c) => {
      const vals = doc.rowList.map((r) => r.cells[c.id]).filter((v) => !blank(v));
      c.kind = c.format.kind === 'date' ? 'date' : vals.length && vals.every((v) => typeof v === 'number') ? 'number' : 'text';
    });
  }
  const fxText = (col, row) => FX.display(row.fx ? row.fx[col.id] : '', col.format);
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
    if (col.type === 'formula' && typeof v === 'number') return FX.display(v, col.format);
    if (col.type === 'formula' && col.kind === 'date' && v) return fmtDate(v);
    return String(v);
  }

  function sheetCell(col, row, edit) {
    const v = row.cells[col.id];
    const has = v !== undefined && v !== null && v !== '';
    const attrs = `data-sc data-row="${row.id}" data-col="${col.id}" ${edit ? '' : 'disabled'}`;
    const none = '<option value=""></option>';
    switch (col.type) {
      case 'number': return `<input class="sc-input num" type="number" step="any" value="${has ? esc(v) : ''}" ${attrs}>`;
      case 'formula': {
        const x = row.fx ? row.fx[col.id] : '';
        return `<div class="sc-formula ${FX.isErr(x) ? 'err' : ''} ${typeof x === 'number' ? 'num' : ''}" data-fx="${row.id}:${col.id}"
          title="= ${esc(col.formulaText || '')}${FX.isErr(x) ? ` → ${esc(x.code)}` : ''}">${esc(fxText(col, row))}</div>`;
      }
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
  const kindOf = (col) => (col.type === 'formula' ? col.kind || 'text' : col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text');
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
    if (kindOf(col) === 'number') {
      const n = Number(v);
      const x = Number(a);
      const y = Number(b);
      return { eq: n === x, ne: n !== x, gt: n > x, gte: n >= x, lt: n < x, lte: n <= x, between: n >= Math.min(x, y) && n <= Math.max(x, y) }[op];
    }
    if (kindOf(col) === 'date') {
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
      const kind = kindOf(col);
      const key = (r) => (kind === 'number' ? (blank(r.cells[col.id]) || typeof r.cells[col.id] === 'string' ? null : Number(r.cells[col.id]))
        : kind === 'date' ? String(r.cells[col.id] || '') : cellText(col, r.cells[col.id]).toLowerCase());
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
      if (kindOf(col) === 'number') return (Number(String(a).replace(/[^\d.-]/g, '')) || 0) - (Number(String(b).replace(/[^\d.-]/g, '')) || 0);
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
    // a formula column adds up too, shown in its own format (not percentages: their sum means nothing)
    const adds = (c) => c.type === 'number' || (c.type === 'formula' && c.kind === 'number' && c.format.kind !== 'percent');
    if (!rows.length || !doc.columns.some((c) => adds(c) || c.type === 'checkbox')) return '';
    return `<tr><td class="sc-num">Σ</td><td></td>${doc.columns.map((c) => {
      if (adds(c)) {
        const sum = rows.reduce((t, r) => t + (typeof r.cells[c.id] === 'number' ? r.cells[c.id] : Number(r.cells[c.id]) || 0), 0);
        return `<td class="num">${c.type === 'formula' ? esc(FX.display(sum, c.format)) : sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>`;
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
          <input type="file" class="hidden" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" data-sheet-import></label>` : ''}
      </div>
      <div class="sheets-layout ${sideOpen ? '' : 'side-closed'}">
        <aside class="sheets-side">
          ${v.canCreate ? `
            <button class="btn-primary w-full justify-center" data-sheet-new>${icon('plus', 14)} New sheet</button>
            <label class="btn-secondary w-full cursor-pointer justify-center" title="An Excel (.xlsx) or .csv file">${icon('upload', 14)} Import Excel / CSV
              <input type="file" class="hidden" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" data-sheet-import></label>
            <button class="btn-secondary w-full justify-center" data-sheet-google title="Import a Google Sheet by its link">${icon('grid', 14)} From Google Sheets</button>` : ''}
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
                  <button class="btn-primary w-full justify-center text-sm" data-sheet-share-people title="Give one or more people access and tell them on Teams">
                    ${icon('share', 14)} Share with people…</button>
                  <span class="field-label mt-3">Who can see it</span>
                  <select class="input w-full text-sm" data-sheet-share>${SHEET_SHARES.map(([k, label]) => `<option value="${k}" ${k === doc.share ? 'selected' : ''}>${label}</option>`).join('')}</select>
                  <span class="field-label mt-3">People <span class="font-normal text-slate-400">(on top of the above)</span></span>
                  <div class="max-h-48 overflow-y-auto">${v.people.filter((x) => x.id !== doc.ownerId).map((x) => {
                    const has = doc.editors.includes(x.id) ? 'edit' : doc.viewers.includes(x.id) ? 'view' : '';
                    return `<label class="flex items-center gap-2 py-0.5 text-sm"><span class="min-w-0 flex-1 truncate">${esc(x.name)}</span>
                      <select class="input w-24 py-0.5 text-xs" data-sheet-person="${x.id}">${[['', '—'], ['view', 'Can view'], ['edit', 'Can edit']]
                        .map(([k, label]) => `<option value="${k}" ${k === has ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`;
                  }).join('')}</div>
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

  // ---- the column editor: name, type and what the type needs (dropdown options; a formula and how it shows).
  // A formula names columns in [ ]: click a column or a function to put it in at the cursor, and the preview works it
  // out on the first rows as you type (the same code the grid and the server use).
  let colEdit = null;
  const FX_FORMATS = [['', 'Automatic'], ['number', 'Number'], ['percent', 'Percent'], ['currency', 'Currency'], ['date', 'Date'], ['text', 'Text']];
  const FX_EXAMPLES = [
    ['Multiply', '[Qty] * [Price]'], ['If / else', 'IF([Status] = "Done", "✓", "Pending")'], ['Days left', '[Due] - TODAY()'],
    ['Overdue', 'AND([Status] <> "Done", [Due] < TODAY())'], ['Join text', '[First name] & " " & [Last name]'],
    ['Working days', 'NETWORKDAYS([Start], [End])'], ['Grade', 'IFS([Score] >= 90, "A", [Score] >= 75, "B", TRUE, "C")'],
  ];
  function openColumn(c) {
    const { doc } = sheetsView;
    const col = c || { name: '', type: 'text', options: [], formulaText: '', format: {} };
    const others = doc.columns.filter((x) => !c || x.id !== c.id);
    colEdit = { col: c || null, type: col.type, others };
    const f = col.format || {};
    $('#columnForm').html(`
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span class="text-indigo-600">${icon('grid', 18)}</span>
        <h3 class="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">${c ? `Edit column “${esc(c.name)}”` : 'New column'}</h3>
        <button type="button" class="icon-btn" data-close-column title="Close">${icon('close', 18)}</button>
      </div>
      <div class="max-h-[72vh] space-y-4 overflow-y-auto px-5 py-4">
        <label class="block"><span class="field-label">Column name</span>
          <input class="input w-full" name="name" maxlength="60" placeholder="e.g. Device, Build, Total" value="${esc(col.name)}"></label>
        <div><span class="field-label">Type</span>
          <div class="col-types">${Object.entries(SHEET_TYPES).map(([k, label]) => `<button type="button" class="col-type ${k === col.type ? 'on' : ''}" data-col-type="${k}">${k === 'formula' ? '<b class="fx-mark">ƒx</b>' : ''}${label}</button>`).join('')}</div></div>
        <label class="block" data-col-for="select"><span class="field-label">Options <span class="font-normal text-slate-400">(comma separated, up to 100)</span></span>
          <textarea class="input w-full" name="options" rows="2" maxlength="8000" placeholder="e.g. To do, In progress, Done">${esc((col.options || []).join(', '))}</textarea></label>
        <div class="space-y-3" data-col-for="formula">
          <div class="fx-box"><span class="fx-eq">ƒx</span>
            <textarea class="fx-input" name="formula" rows="2" spellcheck="false" autocomplete="off" placeholder="[Qty] * [Price]">${esc(col.formulaText || '')}</textarea></div>
          <div data-fx-preview class="fx-preview"></div>
          <div><span class="field-label">Columns <span class="font-normal text-slate-400">(click to add)</span></span>
            <div class="fx-chips">${others.map((x) => `<button type="button" class="fx-chip" data-fx-insert="[${esc(x.name)}]"><span class="sc-type">${SHEET_TYPES[x.type]}</span>${esc(x.name)}</button>`).join('')
              || '<span class="text-xs text-slate-400">Add other columns first.</span>'}</div></div>
          <details class="fx-more"><summary>Examples</summary>
            <div class="mt-2 space-y-1">${FX_EXAMPLES.map(([t, x]) => `<button type="button" class="fx-example" data-fx-example="${esc(x)}"><b>${t}</b><code>${esc(x)}</code></button>`).join('')}</div></details>
          <details class="fx-more"><summary>Functions <span class="text-slate-400">(${FX.FUNCTION_NAMES.length}, Excel's names)</span></summary>
            <div class="fx-chips mt-2">${FX.FUNCTION_NAMES.map((n) => `<button type="button" class="fx-chip fn" data-fx-insert="${n}(">${n}</button>`).join('')}</div></details>
          <div class="grid grid-cols-3 gap-3">
            <label class="col-span-1"><span class="field-label">Show as</span>
              <select class="input w-full" name="kind">${FX_FORMATS.map(([k, label]) => `<option value="${k}" ${k === (f.kind || '') ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
            <label><span class="field-label">Decimals</span><input class="input w-full" type="number" min="0" max="6" name="decimals" value="${Number.isInteger(f.decimals) ? f.decimals : ''}" placeholder="auto"></label>
            <label data-fx-symbol><span class="field-label">Symbol</span><input class="input w-full" name="symbol" maxlength="4" value="${esc(f.symbol || '₹')}"></label>
          </div>
        </div>
        <p class="dialog-error hidden"></p>
      </div>
      <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <button type="button" class="btn-secondary" data-close-column>Cancel</button>
        <button class="btn-primary">${c ? 'Save' : 'Add column'}</button>
      </div>`);
    showColumnType();
    $('#columnModal').removeClass('hidden');
    $('body').addClass('overflow-hidden');
    $('#columnForm [name=name]').trigger('focus');
  }
  function closeColumn() {
    colEdit = null;
    $('#columnModal').addClass('hidden');
    unlockScroll();
  }
  function showColumnType() {
    const t = colEdit.type;
    $('[data-col-type]').each((i, el) => $(el).toggleClass('on', $(el).data('col-type') === t));
    $('[data-col-for]').each((i, el) => $(el).toggleClass('hidden', $(el).data('col-for') !== t));
    $('[data-fx-symbol]').toggleClass('invisible', $('#columnForm [name=kind]').val() !== 'currency');
    if (t === 'formula') fxPreview();
  }
  // the format picked in the editor
  const fxFormat = () => {
    const $f = $('#columnForm');
    const kind = $f.find('[name=kind]').val();
    const dec = $f.find('[name=decimals]').val();
    return { ...(kind ? { kind } : {}), ...(dec !== '' ? { decimals: Math.max(0, Math.min(6, Number(dec))) } : {}), ...(kind === 'currency' ? { symbol: $f.find('[name=symbol]').val() || '₹' } : {}) };
  };
  // the formula worked out on the first rows (or why it can't be)
  function fxPreview() {
    const { doc } = sheetsView;
    const text = $('#columnForm [name=formula]').val().trim();
    const $p = $('[data-fx-preview]');
    if (!text) { $p.html('<span class="text-slate-400">Write a formula: column names in [ ], like Excel\'s functions. The result shows here.</span>'); return; }
    let stored;
    try { stored = FX.toIds(text, colEdit.others); } catch (err) { $p.html(`<span class="fx-bad">${esc(err.message)}</span>`); return; }
    const me = { id: '__fx', name: 'This column', type: 'formula', formula: stored, format: fxFormat() };
    const cols = [...colEdit.others, me];
    const rows = doc.rowList.slice(0, 3);
    if (!rows.length) { $p.html('<span class="fx-ok">Looks right. Add rows to see results.</span>'); return; }
    $p.html(rows.map((r, k) => {
      const x = FX.computeRow(cols, r.cells, fxPlain, k + 1).__fx;
      return `<div class="fx-row"><span class="text-slate-400">Row ${k + 1}</span><b class="${FX.isErr(x) ? 'fx-bad' : ''}">${esc(FX.display(x, me.format) || '(empty)')}</b></div>`;
    }).join(''));
  }
  function fxInsert(snippet) {
    const el = $('#columnForm [name=formula]')[0];
    const at = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? at;
    const before = el.value.slice(0, at);
    const pad = before && !/[\s(,]$/.test(before) && !snippet.endsWith('(') ? ' ' : '';
    el.value = `${before}${pad}${snippet}${el.value.slice(end)}`;
    const caret = at + pad.length + snippet.length;
    el.focus();
    el.setSelectionRange(caret, caret);
    fxPreview();
  }
  $doc.on('click', '[data-close-column]', closeColumn);
  $('#columnModal').on('mousedown', function (e) { if (e.target === this) closeColumn(); });
  $doc.on('click', '[data-col-type]', function () { colEdit.type = $(this).data('col-type'); showColumnType(); });
  $doc.on('mousedown', '[data-fx-insert]', (e) => e.preventDefault()); // keep the cursor in the formula
  $doc.on('click', '[data-fx-insert]', function () { fxInsert(String($(this).data('fx-insert'))); });
  $doc.on('click', '[data-fx-example]', function () { $('#columnForm [name=formula]').val($(this).data('fx-example')); fxPreview(); });
  $doc.on('input', '#columnForm [name=formula], #columnForm [name=decimals], #columnForm [name=symbol]', fxPreview);
  $doc.on('change', '#columnForm [name=kind]', showColumnType);
  $('#columnForm').on('submit', function (e) {
    e.preventDefault();
    const $f = $(this);
    const $err = $f.find('.dialog-error').addClass('hidden');
    const fail = (msg) => $err.text(msg).removeClass('hidden');
    const name = $f.find('[name=name]').val().trim();
    const { type } = colEdit;
    if (!name) { fail('Give the column a name.'); return; }
    const body = { name, type };
    if (type === 'select') body.options = $f.find('[name=options]').val();
    if (type === 'formula') {
      body.formula = $f.find('[name=formula]').val().trim();
      if (!body.formula) { fail('Write the formula, e.g. [Qty] * [Price]'); return; }
      body.format = fxFormat();
    }
    const c = colEdit.col;
    api(c ? 'PATCH' : 'POST', c ? `/api/sheet-columns/${c.id}` : `/api/sheets/${sheetsView.doc.id}/columns`, body, $f.find('.btn-primary')[0], QUIET)
      .done(() => { closeColumn(); reloadSheet(); })
      .fail((xhr) => fail(errorText(xhr)));
  });

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
              <span class="import-col" ${c.formula ? `title="= ${esc(c.formula)}"` : ''}><span class="sc-type">${SHEET_TYPES[c.type]}</span>${esc(c.name)}${c.colors ? `<span class="text-slate-400">· ${c.colors} colour${c.colors === 1 ? '' : 's'}</span>` : ''}</span>`).join('')}</div>
            ${ws.columns.some((c) => c.formula) ? `<p class="mt-2 text-xs text-slate-500">${icon('grid', 11)} Formulas keep working: ${ws.columns.filter((c) => c.formula).map((c) => `<b>${esc(c.name)}</b> = <code>${esc(c.formula)}</code>`).join(' · ')}</p>` : ''}
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
    // every row of the sheet (all ticked, or none ticked with no search or filter): it can go as an Excel too,
    // when you can edit the sheet
    const whole = send.length === doc.rowList.length && doc.edit;
    openTeamsSend({
      title: `Send “${doc.name}” on Teams`,
      count: send.length,
      columns: doc.columns.map((c) => ({ id: c.id, label: c.name })),
      people: sheetsView.people,
      webhook: sheetsView.teams,
      excel: whole ? sheetExcelName(doc) : null,
      send: (val) => api('POST', `/api/sheets/${doc.id}/teams`, {
        rowIds: send.map((r) => r.id), columnIds: val.columns, userIds: val.userIds, note: val.note, mode: val.mode, excel: val.excel,
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
    if (file.size > 5 * 1024 * 1024) { dialog.alert('Please choose a file under 5 MB.', 'File too large'); return; }
    const name = file.name.replace(/\.(xlsx|csv)$/i, '');
    const reader = new FileReader();
    reader.onload = () => api('POST', '/api/sheets/import', { productId: sheetsView.productId, name, file: file.name, dataUrl: reader.result })
      .done((x) => { reloadSheets(x.id); showImport(x, name); });
    reader.readAsDataURL(file);
  });
  // A Google Sheet by its link (shared as "Anyone with the link"): the server asks Google for it as .xlsx, so its
  // dropdowns, colours and formulas come along like an Excel's
  $doc.on('click', '[data-sheet-google]', () => ask({
    title: 'Import from Google Sheets',
    fields: [{ name: 'url', label: 'Link to the Google Sheet (shared as “Anyone with the link can view”)', placeholder: 'https://docs.google.com/spreadsheets/d/…', required: true, max: 500 }],
    confirmText: 'Import',
    save: (val) => api('POST', '/api/sheets/import', { productId: sheetsView.productId, url: val.url }, null, QUIET)
      .done((x) => { reloadSheets(x.id); showImport(x, x.title || 'Google Sheet'); }),
  }));
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
  $doc.on('change', '[data-sheet-person]', () => {
    const who = (access) => $('[data-sheet-person]').filter((i, el) => el.value === access).map((i, el) => $(el).data('sheet-person')).get();
    const editors = who('edit');
    const viewers = who('view');
    api('PATCH', `/api/sheets/${sheetsView.doc.id}`, { editors, viewers }).done(() => { Object.assign(sheetsView.doc, { editors, viewers }); toast('Sharing saved'); });
  });
  const sheetExcelName = (doc) => `${doc.name.replace(/[^\w-]+/g, '-') || 'sheet'}.xlsx`; // as the server names it
  // the whole sheet, with one or more people: they get access and a link on Teams
  $doc.on('click', '[data-sheet-share-people]', function () {
    $(this).closest('details').prop('open', false);
    const { doc } = sheetsView;
    openTeamsSend({
      title: `Share “${doc.name}”`,
      count: doc.rowList.length,
      people: sheetsView.people.filter((x) => x.id !== doc.ownerId && x.id !== me.id),
      webhook: sheetsView.teams,
      share: { access: 'view' },
      excel: sheetExcelName(doc),
      send: (val) => api('POST', `/api/sheets/${doc.id}/share`, { userIds: val.userIds, access: val.access, note: val.note, mode: val.mode, excel: val.excel }, val.button, QUIET)
        .done(() => reloadSheets(doc.id)),
    });
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
        computeFormulas(doc, row);
        doc.columns.filter((c) => c.type === 'formula').forEach((c) => $(`[data-fx="${row.id}:${c.id}"]`).replaceWith(sheetCell(c, row, true)));
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
  $doc.on('click', '[data-sheet-col-add]', () => openColumn(null));
  $doc.on('click', '[data-sheet-col-edit]', function () { openColumn(sheetsView.doc.columns.find((x) => x.id === $(this).data('sheet-col-edit'))); });
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
