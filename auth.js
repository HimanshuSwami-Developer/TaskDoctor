'use strict';
/**
 * Logins: password hashing, session tokens (cookie) and access levels.
 * The first super admin comes from .env: SUPER_ADMIN_USERNAME / SUPER_ADMIN_PASSWORD.
 */
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

const COOKIE = 'td_session';
const SESSION_DAYS = 30;

// view: read only · edit: update issues / statuses / screens, add issues · full: everything inside their apps
// super: everything in every app + the admin dashboard
const LEVELS = { view: 1, edit: 2, full: 3, super: 4 };

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function checkPassword(password, stored) {
  const [kind, salt, hex] = String(stored).split('$');
  if (kind !== 'scrypt' || !salt || !hex) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// The cookie holds a random token; the database only stores its hash.
const newToken = () => crypto.randomBytes(32).toString('base64url');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function sessionCookie(req, token) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  const age = token ? SESSION_DAYS * 24 * 3600 : 0;
  return `${COOKIE}=${token || ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure}`;
}

const atLeast = (user, need) => LEVELS[user.access] >= LEVELS[need];
const seesProduct = (user, productId) => user.access === 'super' || user.all_products || user.product_ids.includes(productId);

// Slow down password guessing: 10 failed tries per username + IP, then wait 15 minutes.
const failures = new Map();
const WINDOW = 15 * 60 * 1000;
function throttled(key) {
  const f = failures.get(key);
  return Boolean(f && f.count >= 10 && Date.now() - f.first < WINDOW);
}
function failed(key) {
  const f = failures.get(key);
  if (!f || Date.now() - f.first >= WINDOW) failures.set(key, { count: 1, first: Date.now() });
  else f.count += 1;
}
const succeeded = (key) => failures.delete(key);

module.exports = {
  COOKIE, SESSION_DAYS, LEVELS,
  hashPassword, checkPassword, newToken, hashToken, readCookie, sessionCookie,
  atLeast, seesProduct, throttled, failed, succeeded,
};
