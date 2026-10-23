'use strict';
/**
 * Microsoft Teams messages through a Workflows webhook ("Post to a channel when a webhook request is received").
 * Each app (product) has its own webhook URL, set by a super admin in Sanity → Teams channel.
 * Messages are Adaptive Cards: a title, some lines / facts, buttons that deeplink back into FlowTrace,
 * and @mentions by Teams email (the login's "Teams email" in Admin).
 * The same card is also sent from the browser through Microsoft Graph (direct messages, channels the user is in).
 */

const valid = (url) => /^https:\/\/[^\s/]+\/\S+$/.test(url || '');

/**
 * card({ title, lines, facts, actions, mentions }) → the Adaptive Card
 *   lines:    ['plain text', …]                (markdown allowed by Teams)
 *   facts:    [['Version', '1.4.2'], …]
 *   actions:  [['Open in FlowTrace', url], …]
 *   mentions: [{ name, email }]                 shown as one "@A @B" line
 */
function card({ title, lines = [], facts = [], actions = [], mentions = [] }) {
  const people = mentions.filter((m) => m && m.email);
  const body = [
    { type: 'TextBlock', text: title, weight: 'Bolder', size: 'Medium', wrap: true },
    ...lines.filter(Boolean).map((text) => ({ type: 'TextBlock', text, wrap: true, spacing: 'Small' })),
  ];
  if (facts.length) body.push({ type: 'FactSet', facts: facts.filter(([, v]) => v).map(([t, v]) => ({ title: t, value: String(v) })) });
  if (people.length) body.push({ type: 'TextBlock', text: people.map((m) => `<at>${m.name}</at>`).join(' '), wrap: true });
  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    body,
    actions: actions.filter(([, url]) => url).map(([t, url]) => ({ type: 'Action.OpenUrl', title: t, url })),
    msteams: {
      width: 'Full',
      entities: people.map((m) => ({ type: 'mention', text: `<at>${m.name}</at>`, mentioned: { id: m.email, name: m.name } })),
    },
  };
}

/** post(webhook, message): the card to a webhook. Resolves to 'sent'; rejects with a readable message. */
async function post(webhook, message) {
  if (!valid(webhook)) throw new Error('Teams webhook is not set');
  let res;
  try {
    res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'message', attachments: [{ contentType: 'application/vnd.microsoft.card.adaptive', contentUrl: null, content: card(message) }] }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new Error(`Teams could not be reached (${err.name === 'TimeoutError' ? 'timed out' : err.message})`);
  }
  if (!res.ok) throw new Error(`Teams refused the message (HTTP ${res.status})`);
  return 'sent';
}

// Microsoft Graph sign-in for the browser (an Entra app registration, single-page application platform):
// MS_CLIENT_ID and MS_TENANT_ID in .env. Both are public ids, not secrets.
const graph = () => (process.env.MS_CLIENT_ID ? { clientId: process.env.MS_CLIENT_ID, tenantId: process.env.MS_TENANT_ID || 'organizations' } : null);

module.exports = { card, post, valid, graph };
