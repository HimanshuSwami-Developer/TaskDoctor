/* FlowTrace — send from your own Microsoft Teams. © 2026 FinDevelopers
 *
 * Signs in with your Microsoft work account in a popup (MSAL, an Entra app registration of type "Single-page
 * application": MS_CLIENT_ID / MS_TENANT_ID in .env) and sends Adaptive Cards made by the server through Microsoft
 * Graph, as you:
 *   - a direct (1:1) chat message to each person, found by their Teams email   (Chat.Create, ChatMessage.Send)
 *   - a post in a channel of a team you are in                                   (Team.ReadBasic.All, Channel.ReadBasic.All, ChannelMessage.Send,
 *                                                                                 User.ReadBasic.All to @mention people)
 * The sign-in is kept in this browser (localStorage) until you disconnect, so later messages need no popup.
 *
 * window.flowGraph: setup(config), ready(), account(), connect(), disconnect(), autoDm(on?),
 *                   sendDirect(people, card), teamsList(), channelsOf(teamId), sendChannel(teamId, channelId, card),
 *                   notify({ card, people })   (quiet: only when connected and auto messages are on; never a popup)
 */
window.flowGraph = (() => {
  const MSAL_URL = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.28.1/lib/msal-browser.min.js';
  const GRAPH = 'https://graph.microsoft.com/v1.0';
  const SCOPES = {
    direct: ['User.Read', 'Chat.Create', 'ChatMessage.Send'],
    channel: ['User.Read', 'User.ReadBasic.All', 'Team.ReadBasic.All', 'Channel.ReadBasic.All', 'ChannelMessage.Send'], // ReadBasic: @mentions
  };
  const PREF = 'taskSheet.teamsAutoDm';

  let config = null;
  let app = null;
  let loading = null;
  let me = null; // { id, mail, userPrincipalName, displayName } of the signed-in account

  const store = (key, value) => {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { /* private mode */ }
    return null;
  };

  function loadScript() {
    if (window.msal) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = MSAL_URL;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Microsoft sign-in could not be loaded. Check your connection.'));
      document.head.appendChild(s);
    });
  }

  /** config: { clientId, tenantId } from /api/teams/graph, or null when the server has none */
  function setup(cfg) {
    config = cfg && cfg.clientId ? cfg : null;
    if (!config) return Promise.resolve(false);
    loading = loadScript()
      .then(() => {
        app = new window.msal.PublicClientApplication({
          auth: { clientId: config.clientId, authority: `https://login.microsoftonline.com/${config.tenantId}`, redirectUri: `${location.origin}/` },
          cache: { cacheLocation: 'localStorage' },
        });
        return app.initialize();
      })
      .then(() => app.handleRedirectPromise())
      .then(() => true)
      .catch((err) => { console.error('Microsoft sign-in:', err); app = null; return false; });
    return loading;
  }

  const configured = () => Boolean(config);
  const ready = () => loading || Promise.resolve(false);
  const account = () => (app ? app.getActiveAccount() || app.getAllAccounts()[0] || null : null);
  const autoDm = (on) => {
    if (on !== undefined) store(PREF, on ? '1' : '0');
    return store(PREF) !== '0';
  };

  // An access token for kind ('direct' | 'channel'). interactive: a popup may open (only from a click).
  async function token(kind, interactive) {
    if (!config) throw new Error('Teams sign-in is not set up on this server.');
    await ready();
    if (!app) throw new Error('Microsoft sign-in could not be loaded. Refresh the page and try again.');
    const scopes = SCOPES[kind];
    const acc = account();
    if (acc) {
      try {
        return (await app.acquireTokenSilent({ scopes, account: acc })).accessToken;
      } catch (err) {
        if (!interactive) throw err;
      }
    } else if (!interactive) {
      throw new Error('Not connected to Teams');
    }
    let r;
    try {
      r = await app.acquireTokenPopup({ scopes, account: acc || undefined });
    } catch (err) {
      const code = err && err.errorCode;
      if (code === 'popup_window_error' || code === 'empty_window_error') throw new Error('Your browser blocked the Microsoft sign-in window. Allow popups for this site and try again.');
      if (code === 'user_cancelled') throw new Error('Microsoft sign-in was closed before it finished.');
      if (/AADSTS65001|consent/i.test(String(err && err.message))) throw new Error('Your organisation needs an admin to approve FlowTrace in Teams first (admin consent in Microsoft Entra).');
      throw new Error((err && err.errorMessage) || (err && err.message) || 'Microsoft sign-in failed.');
    }
    app.setActiveAccount(r.account);
    return r.accessToken;
  }

  async function call(tok, method, path, body) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const res = await fetch(`${GRAPH}${path}`, {
        method,
        headers: { Authorization: `Bearer ${tok}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 || res.status === 503) { // throttled: wait as Teams asks
        await new Promise((ok) => setTimeout(ok, Math.min(10, Number(res.headers.get('Retry-After')) || 2 ** attempt) * 1000));
        continue;
      }
      const data = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
        const err = new Error(res.status === 403 ? `Teams did not allow it (${msg})` : res.status === 404 ? `Not found in Teams (${msg})` : msg);
        err.status = res.status;
        throw err;
      }
      return data;
    }
    throw new Error('Teams is busy. Try again in a minute.');
  }

  async function whoAmI(tok) {
    if (!me) me = await call(tok, 'GET', '/me?$select=id,mail,userPrincipalName,displayName');
    return me;
  }

  /** Sign in (popup) → { name, email } of the Microsoft account */
  async function connect() {
    const tok = await token('direct', true);
    const u = await whoAmI(tok);
    return { name: u.displayName, email: (u.mail || u.userPrincipalName || '').toLowerCase() };
  }

  // Forget the sign-in in this browser (Microsoft itself stays signed in)
  function disconnect() {
    me = null;
    if (app) app.setActiveAccount(null);
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('msal.') || (config && k.includes(config.clientId)))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* private mode */ }
    return setup(config);
  }

  // A chat message: one Adaptive Card, or HTML from the server ({ html, mentions }: tables show like ones pasted from Excel).
  // @mentions in HTML need each person's Microsoft id, looked up by their Teams email; one not found stays a plain name.
  async function cardMessage(card, tok) {
    if (!card || typeof card.html !== 'string') {
      return {
        body: { contentType: 'html', content: '<attachment id="flowtrace"></attachment>' },
        attachments: [{ id: 'flowtrace', contentType: 'application/vnd.microsoft.card.adaptive', contentUrl: null, content: JSON.stringify(card) }],
      };
    }
    let content = card.html;
    const mentions = [];
    for (const [i, m] of (card.mentions || []).entries()) {
      const user = await call(tok, 'GET', `/users/${encodeURIComponent(m.email)}?$select=id,displayName`).catch(() => null);
      if (user) mentions.push({ id: i, mentionText: m.name, mentioned: { user: { id: user.id, displayName: user.displayName || m.name, userIdentityType: 'aadUser' } } });
      else content = content.replace(new RegExp(`<at id="${i}">([\\s\\S]*?)</at>`), '@$1');
    }
    return { body: { contentType: 'html', content }, ...(mentions.length ? { mentions } : {}) };
  }
  const member = (who) => ({
    '@odata.type': '#microsoft.graph.aadUserConversationMember',
    roles: ['owner'],
    'user@odata.bind': `${GRAPH}/users('${encodeURIComponent(who)}')`,
  });

  async function directTo(tok, people, card) {
    const self = await whoAmI(tok);
    const mine = [self.mail, self.userPrincipalName].filter(Boolean).map((x) => x.toLowerCase());
    const results = [];
    for (const p of people) {
      if (!p.email) { results.push({ name: p.name, ok: false, error: 'no Teams email (Admin)' }); continue; }
      if (mine.includes(p.email.toLowerCase())) { results.push({ name: p.name, ok: false, error: 'that is you' }); continue; }
      try {
        // a 1:1 chat is found again if it already exists, so this does not make a new chat each time
        const chat = await call(tok, 'POST', '/chats', { chatType: 'oneOnOne', members: [member(self.id), member(p.email)] });
        await call(tok, 'POST', `/chats/${encodeURIComponent(chat.id)}/messages`, await cardMessage(card, tok));
        results.push({ name: p.name, ok: true });
      } catch (err) {
        results.push({ name: p.name, ok: false, error: err.status === 404 ? `${p.email} is not a Teams user` : err.message });
      }
    }
    return results;
  }

  /** A direct message to each person [{ name, email }] → [{ name, ok, error }] (signs in when needed) */
  async function sendDirect(people, card) {
    return directTo(await token('direct', true), people, card);
  }

  /** Issue notices: quietly message the people, only when connected with auto messages on → results or null */
  async function notify(n) {
    if (!n || !n.people || !n.people.length || !config || !autoDm()) return null;
    await ready();
    if (!account()) return null;
    let tok;
    try { tok = await token('direct', false); } catch (err) { return null; }
    return directTo(tok, n.people, n.card);
  }

  /** Teams you are in → [{ id, name }] */
  async function teamsList() {
    const tok = await token('channel', true);
    const d = await call(tok, 'GET', '/me/joinedTeams?$select=id,displayName');
    return (d.value || []).map((t) => ({ id: t.id, name: t.displayName })).sort((a, b) => a.name.localeCompare(b.name));
  }
  async function channelsOf(teamId) {
    const tok = await token('channel', true);
    const d = await call(tok, 'GET', `/teams/${encodeURIComponent(teamId)}/channels?$select=id,displayName`);
    return (d.value || []).map((c) => ({ id: c.id, name: c.displayName }));
  }
  async function sendChannel(teamId, channelId, card) {
    const tok = await token('channel', true);
    return call(tok, 'POST', `/teams/${encodeURIComponent(teamId)}/channels/${encodeURIComponent(channelId)}/messages`, await cardMessage(card, tok));
  }

  return { setup, configured, ready, account, autoDm, connect, disconnect, sendDirect, notify, teamsList, channelsOf, sendChannel };
})();
