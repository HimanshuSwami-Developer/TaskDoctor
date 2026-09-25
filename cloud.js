'use strict';
/**
 * Cloudinary storage for screen images / screenshots.
 * .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (or one CLOUDINARY_URL),
 * optional CLOUDINARY_FOLDER (default "task-doctor").
 */
require('./env');
const cloudinary = require('cloudinary').v2;

const FOLDER = process.env.CLOUDINARY_FOLDER || 'task-doctor';
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
} else {
  cloudinary.config({ secure: true }); // the SDK reads CLOUDINARY_URL by itself
}

function configured() {
  const c = cloudinary.config();
  return Boolean(c.cloud_name && c.api_key && c.api_secret);
}

// Cloudinary rejects with { message, http_code } (sometimes nested under .error)
const reason = (err) => (err && (err.message || (err.error && err.error.message))) || 'unknown error';

/** Upload a data URL or a remote URL. One asset per screen, so replacing overwrites it. */
async function upload(source, screenId) {
  try {
    const r = await cloudinary.uploader.upload(source, {
      folder: FOLDER,
      public_id: `screen-${screenId}`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });
    return { url: r.secure_url, publicId: r.public_id };
  } catch (err) {
    throw Object.assign(new Error(`Image upload failed: ${reason(err)}`), { status: 502, expose: true });
  }
}

/** Best-effort delete; a failure here never blocks deleting data. */
async function remove(publicIds) {
  const ids = [...new Set(publicIds.filter(Boolean))];
  if (!ids.length || !configured()) return;
  try {
    for (let i = 0; i < ids.length; i += 100) {
      await cloudinary.api.delete_resources(ids.slice(i, i + 100), { invalidate: true });
    }
  } catch (err) {
    console.error('Cloudinary delete failed:', reason(err));
  }
}

const ping = () => cloudinary.api.ping();

module.exports = { FOLDER, configured, upload, remove, ping, reason };
