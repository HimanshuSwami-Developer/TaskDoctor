'use strict';
/**
 * Postgres (Neon) connection + schema.
 * DATABASE_URL comes from .env — see .env.example.
 */
require('./env');
const { Pool, types } = require('pg');

// int8 columns (sort_order) → JS number instead of string
types.setTypeParser(20, (value) => Number(value));

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string.');
  process.exit(1);
}

// Neon hands out "sslmode=require"; pg already treats it as full certificate verification,
// so say so explicitly (silences pg's deprecation warning, same security).
const connectionString = process.env.DATABASE_URL.replace(/sslmode=(prefer|require|verify-ca)\b/, 'sslmode=verify-full');
const pool = new Pool({ connectionString, max: 5 });

const SCHEMA = `
-- A product, e.g. Finzoom, Findost, IPO
CREATE TABLE IF NOT EXISTS products (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  sort_order  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modules (
  id          text PRIMARY KEY,
  product_id  text REFERENCES products(id) ON DELETE CASCADE,
  name        text NOT NULL,
  sort_order  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS modules_product_idx ON modules(product_id);

CREATE TABLE IF NOT EXISTS flows (
  id          text PRIMARY KEY,
  module_id   text NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name        text NOT NULL,
  sort_order  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS flows_module_idx ON flows(module_id);

-- A screen, or a condition step (type = 'condition') whose branches point at screens
CREATE TABLE IF NOT EXISTS screens (
  id          text PRIMARY KEY,
  flow_id     text NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'screen' CHECK (type IN ('screen', 'condition')),
  name        text NOT NULL,
  page        text NOT NULL DEFAULT '',
  device      text NOT NULL DEFAULT 'app' CHECK (device IN ('app', 'web')),
  wireframe   text NOT NULL DEFAULT 'form' CHECK (wireframe IN ('form', 'list', 'dashboard', 'detail')),
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'complete')),
  status_date timestamptz,
  link_id     text,
  image_url   text,        -- Cloudinary secure URL
  image_public_id text,    -- Cloudinary public_id (for replace / delete)
  branches    jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS screens_flow_idx ON screens(flow_id);
CREATE INDEX IF NOT EXISTS screens_link_idx ON screens(link_id);

-- Images live in Cloudinary now (was: bytea table screen_images)
ALTER TABLE screens ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE screens ADD COLUMN IF NOT EXISTS image_public_id text;
DROP TABLE IF EXISTS screen_images;

-- Issues (bugs / flaws) logged on a screen
CREATE TABLE IF NOT EXISTS comments (
  id          text PRIMARY KEY,
  screen_id   text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  text        text NOT NULL,
  priority    text NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  assignee    text NOT NULL DEFAULT '',
  remarks     text NOT NULL DEFAULT '',
  resolved    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_screen_idx ON comments(screen_id);

-- Screen status tags, managed from the UI. "pending" and "complete" are built in and cannot be removed.
CREATE TABLE IF NOT EXISTS statuses (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  color       text NOT NULL DEFAULT 'slate',
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO statuses (id, label, color, sort_order) VALUES
  ('pending', 'Pending', 'amber', 0),
  ('testing', 'Release for Testing', 'sky', 1),
  ('complete', 'Complete', 'green', 2)
ON CONFLICT (id) DO NOTHING;
ALTER TABLE screens DROP CONSTRAINT IF EXISTS screens_status_check;

-- Soft delete: deleting anything only sets is_deleted = true, rows are never removed
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE modules  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE flows    ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE screens  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- An issue can be assigned to several people (was: one "assignee" text). Old values move into the list once.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS assignees text[] NOT NULL DEFAULT '{}';
UPDATE comments SET assignees = ARRAY[assignee], assignee = '' WHERE assignee <> '';

-- Status lives on each issue now (screens.status / status_date are no longer used, kept for history).
-- "resolved" mirrors status = 'complete'; issues fixed before this change become Complete.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status_date timestamptz;
UPDATE comments SET status = 'complete', status_date = coalesce(status_date, created_at) WHERE resolved AND status = 'pending';

-- Logins. access: view | edit | full | super. A login sees the products in product_ids, or every product
-- when all_products is set (super admins always see everything).
CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  username      text NOT NULL,
  name          text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  access        text NOT NULL DEFAULT 'view' CHECK (access IN ('view', 'edit', 'full', 'super')),
  all_products  boolean NOT NULL DEFAULT false,
  product_ids   text[] NOT NULL DEFAULT '{}',
  is_deleted    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users (lower(username)) WHERE NOT is_deleted;

-- Signed-in sessions (token hash only). Signing out / password changes expire them, rows are kept.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

-- Branch paths: a flow that continues from one branch of a condition (e.g. "Sign Up › Success").
-- It sits under its parent flow and is shown only while that condition and branch exist.
ALTER TABLE flows ADD COLUMN IF NOT EXISTS parent_flow_id text;
ALTER TABLE flows ADD COLUMN IF NOT EXISTS from_condition_id text;
ALTER TABLE flows ADD COLUMN IF NOT EXISTS from_branch_id text;
CREATE INDEX IF NOT EXISTS flows_condition_idx ON flows(from_condition_id);

-- One screen recording per flow / path, stored in Cloudinary
ALTER TABLE flows ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE flows ADD COLUMN IF NOT EXISTS video_public_id text;
`;

const query = (text, params) => pool.query(text, params);

async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const init = () => pool.query(SCHEMA);

module.exports = { pool, query, tx, init };
