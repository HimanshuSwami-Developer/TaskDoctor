'use strict';
/**
 * Daily work journal: the rules that need no database (days, time spent, question workflow, who may change what).
 * server.js uses them for the /api/done and /api/journal routes; test/journal.test.js checks them.
 */

const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const STAGES = ['todo', 'progress']; // a point's stage before it is ticked into Done
// Question workflow: open → ready (for discussion) → discussed → resolved; any status can go back to an earlier one
const QUESTION_STATUSES = ['open', 'ready', 'discussed', 'resolved'];
// A point of the minutes of a meeting: open, done, to be discussed with someone, or deferred to a later meeting
const POINT_STATUSES = ['open', 'done', 'discuss', 'deferred'];

// A 400 with a message the person can act on (the error handler shows messages of errors below 500)
function bad(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// 'YYYY-MM-DD' that is a real day (2026-02-31 is not)
function isDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

// a day that is today or earlier, else today (the journal has no future days)
const pastDay = (value, today) => (isDay(value) && value <= today ? value : today);

// A meeting day: any real day, or none ('' / null)
function meetingDay(value) {
  if (value === null || value === undefined || value === '') return null;
  if (!isDay(value)) throw bad('Meeting date is not a valid date');
  return value;
}

// Time spent / estimated: a number of minutes or "1h 30m", "1.5h", "45m", "2h"; nothing → null; 1 minute to 24 hours
function minutesValue(value) {
  if (value === null || value === undefined || value === '') return null;
  let mins = NaN;
  if (typeof value === 'number') mins = value;
  else if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (!s) return null;
    const m = s.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*m(?:in(?:ute)?s?)?)?$/);
    if (/^\d+$/.test(s)) mins = Number(s);
    else if (m && (m[1] || m[2])) mins = Number(m[1] || 0) * 60 + Number(m[2] || 0);
  }
  mins = Math.round(mins);
  if (!Number.isFinite(mins) || mins < 1 || mins > 1440) throw bad('Time must be between 1 minute and 24 hours, e.g. 45m or 1h 30m');
  return mins;
}

function oneOf(value, list, field, fallback) {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) return fallback;
  if (!list.includes(value)) throw bad(`Invalid ${field}`);
  return value;
}
const priority = (value, fallback) => oneOf(value, PRIORITIES, 'priority', fallback);

// Related APIs of a question: "POST /api/kyc, GET /api/user" or a list → trimmed, unique, at most 10
function apiList(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,\n]/) : [];
  return [...new Set(list.filter((x) => typeof x === 'string').map((x) => x.trim().slice(0, 120)).filter(Boolean))].slice(0, 10);
}

// A browser-made id (uuid) for a new entry, so sending the same form twice (double Enter, a retry) makes one row
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clientId = (value) => (typeof value === 'string' && UUID.test(value) ? value.toLowerCase() : null);

// Two questions are the same when their words are (case, spaces and end punctuation aside)
const sameText = (text) => String(text || '').toLowerCase().replace(/[\s]+/g, ' ').replace(/[?.!\s]+$/, '').trim();

// ILIKE pattern for a search, with % and _ taken literally
const likePattern = (q) => `%${String(q).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const isAdmin = (user) => user.access === 'super' || user.access === 'full';

/**
 * What a login may do with one question: see it, edit it (text, details, priority, who it is for), move it along the
 * workflow (status, meeting day, answer) and delete it. The author and app admins do everything; the person it is
 * assigned to moves it along.
 */
function questionRights(user, q) {
  const author = q.user_id === user.id;
  const assignee = Boolean(q.assignee_id) && q.assignee_id === user.id;
  const admin = isAdmin(user);
  const write = user.access !== 'view';
  return {
    view: author || assignee || admin,
    edit: write && (author || admin),
    move: write && (author || assignee || admin),
    remove: write && (author || admin),
  };
}

/** The columns to save when a question moves from one status to another (who moved it, on which local day). */
function questionStatusFields(from, to, { userId, today, now = new Date() }) {
  oneOf(to, QUESTION_STATUSES, 'status');
  if (from === to) return {};
  const fields = { status: to };
  const rank = QUESTION_STATUSES.indexOf(to);
  // discussed_at is kept once a question was discussed, unless it goes back before that
  if (to === 'discussed') fields.discussed_at = now;
  if (rank < QUESTION_STATUSES.indexOf('discussed')) fields.discussed_at = null;
  if (to === 'resolved') Object.assign(fields, { resolved_at: now, resolved_on: today, resolved_by: userId });
  else Object.assign(fields, { resolved_at: null, resolved_on: null, resolved_by: null });
  return fields;
}

/** Blockers: the author (and super admins) edit and delete; the person it waits on can also resolve it. */
function blockerRights(user, b) {
  const author = b.user_id === user.id;
  const write = user.access !== 'view';
  const own = author || user.access === 'super';
  return {
    view: own || b.waiting_on === user.id,
    edit: write && own,
    resolve: write && (own || b.waiting_on === user.id),
  };
}

/** Minutes are the team's: everyone with write access adds and ticks points; the creator and admins delete a meeting. */
function meetingRights(user, m) {
  const write = user.access !== 'view';
  return { edit: write, remove: write && (m.created_by === user.id || isAdmin(user)) };
}

/**
 * A point's status (and who it is to be discussed with) → the columns to save. "To be discussed" needs a person;
 * any other status clears it.
 */
function pointStatusFields(status, discussWith) {
  oneOf(status, POINT_STATUSES, 'status');
  if (status === 'discuss' && !discussWith) throw bad('Pick who it is to be discussed with');
  return { status, discuss_with: status === 'discuss' ? discussWith : null };
}

/**
 * What ticking a point of the minutes does to the question it came from: Done → Discussed; Deferred → back to
 * Ready for discussion with no meeting day, so it is on the next agenda. Resolved questions and the other statuses
 * are left alone. → the new question status, or null.
 */
function questionAfterPoint(pointStatus, questionStatus) {
  if (questionStatus === 'resolved') return null;
  if (pointStatus === 'done' && questionStatus !== 'discussed') return 'discussed';
  if (pointStatus === 'deferred') return 'ready';
  return null;
}

// SQL: a question / blocker that was open at the end of day $D (raised by then, not resolved before it).
// Resolved on that very day it still shows, as resolved, so the day's history is complete.
const OPEN_ON = (alias, day) => `${alias}.raised_on <= ${day} AND (${alias}.resolved_on IS NULL OR ${alias}.resolved_on >= ${day})`;

// SQL: the agenda of a meeting on day $M: every unresolved question set for that meeting, plus questions marked
// ready for discussion that have no meeting yet or whose meeting has passed (they roll over). One row per question.
const ON_AGENDA = (alias, day) => `${alias}.status <> 'resolved'
  AND (${alias}.meeting_date = ${day} OR (${alias}.status = 'ready' AND (${alias}.meeting_date IS NULL OR ${alias}.meeting_date < ${day})))`;

module.exports = {
  PRIORITIES, STAGES, QUESTION_STATUSES, POINT_STATUSES, meetingRights, pointStatusFields, questionAfterPoint,
  bad, isDay, pastDay, meetingDay, minutesValue, oneOf, priority, apiList, clientId, sameText, likePattern,
  questionRights, questionStatusFields, blockerRights, OPEN_ON, ON_AGENDA,
};
