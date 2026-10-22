'use strict';
/**
 * Microsoft Teams messages through a Workflows webhook ("Post to a channel when a webhook request is received").
 * Each app (product) has its own webhook URL, set by a super admin in Sanity → Teams channel.
 * Messages are Adaptive Cards: a title, some lines / facts, buttons that deeplink back into Task Doctor,
 * and @mentions by Teams email (the login's "Teams email" in Admin).
 */

const valid = (url) => /^https:\/\/[^\s/]+\/\S+$/.test(url || '');

/**
 * post(webhook, { title, lines, facts, actions, mentions })
 *   lines:    ['plain text', …]                (markdown allowed by Teams)
 *   facts:    [['Version', '1.4.2'], …]
 *   actions:  [['Open in Task Doctor', url], …]
 *   mentions: [{ name, email }]                 shown as one "@A @B" line
 * Resolves to 'sent'; rejects with a readable message.
 */
async function post(webhook, { title, lines = [], facts = [], actions = [], mentions = [] }) {
  if (!valid(webhook)) throw new Error('Teams webhook is not set');
  const people = mentions.filter((m) => m && m.email);
  const body = [
    { type: 'TextBlock', text: title, weight: 'Bolder', size: 'Medium', wrap: true },
    ...lines.filter(Boolean).map((text) => ({ type: 'TextBlock', text, wrap: true, spacing: 'Small' })),
  ];
  if (facts.length) body.push({ type: 'FactSet', facts: facts.filter(([, v]) => v).map(([t, v]) => ({ title: t, value: String(v) })) });
  if (people.length) body.push({ type: 'TextBlock', text: people.map((m) => `<at>${m.name}</at>`).join(' '), wrap: true });
  const card = {
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
  let res;
  try {
    res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'message', attachments: [{ contentType: 'application/vnd.microsoft.card.adaptive', contentUrl: null, content: card }] }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new Error(`Teams could not be reached (${err.name === 'TimeoutError' ? 'timed out' : err.message})`);
  }
  if (!res.ok) throw new Error(`Teams refused the message (HTTP ${res.status})`);
  return 'sent';
}

module.exports = { post, valid };
