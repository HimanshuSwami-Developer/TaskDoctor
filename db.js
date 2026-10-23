'use strict';
/**
 * Postgres (Neon) connection + schema.
 * DATABASE_URL comes from .env — see .env.example.
 */
require('./env');
const { Pool, types } = require('pg');

// int8 columns (sort_order) → JS number instead of string
types.setTypeParser(20, (value) => Number(value));
// date columns (sanity run day, done-today day) → 'YYYY-MM-DD' as stored, not a Date shifted by the server's timezone
types.setTypeParser(1082, (value) => value);

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

-- A screen can be a full screen or a popup shown over one, and can say which action opens it (e.g. Click "Place order")
ALTER TABLE screens ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'screen';
ALTER TABLE screens ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT '';

-- Logins. access: view (screens + videos, no issues) | edit (issues only) | tester (issues, any status) | developer (see below) | full | super. A login sees the products in product_ids, or every product
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

-- Screen paths: a flow that branches off a plain screen (drawn as an "L" under that card).
-- It is shown only while that screen exists in a shown flow.
ALTER TABLE flows ADD COLUMN IF NOT EXISTS from_screen_id text;
CREATE INDEX IF NOT EXISTS flows_screen_idx ON flows(from_screen_id);

-- Developer logins: update issues + add modules and screens, issue status only Pending <-> Release for Testing
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_access_check;
ALTER TABLE users ADD CONSTRAINT users_access_check CHECK (access IN ('view', 'edit', 'tester', 'developer', 'full', 'super'));

-- Which side of the product an issue is in: frontend | backend | both ('' = not set, issues logged before this existed)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT '';

-- Areas drawn on a screen image with the pen, as { x, y, w, h } fractions (0–1) of the image.
-- An issue can point at one area; a screen keeps navigation links [{ id, box, targetId }] that open another screen.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS box jsonb;
ALTER TABLE screens ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Teams: each app posts to its own Workflows webhook; a login's Teams email is used to @mention them.
-- Sanity testers (a flag on top of the access level) run the daily sanity checklist.
ALTER TABLE products ADD COLUMN IF NOT EXISTS teams_webhook text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sanity_tester boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS teams_email text NOT NULL DEFAULT '';

-- Sanity checklist of an app: one row per heading, linked to a flow or just a typed heading.
-- owner_id is @mentioned on Teams when the heading fails.
CREATE TABLE IF NOT EXISTS sanity_items (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products(id),
  flow_id     text REFERENCES flows(id),
  heading     text NOT NULL DEFAULT '',
  owner_id    text REFERENCES users(id),
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sanity_items_product_idx ON sanity_items(product_id);

-- One sanity run per app per day ("daily reset"): the version under test and the time it is due.
-- reminded_at is set once the Teams reminder for that time went out.
CREATE TABLE IF NOT EXISTS sanity_runs (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products(id),
  run_date    date NOT NULL,
  version     text NOT NULL DEFAULT '',
  run_time    text NOT NULL DEFAULT '',
  reminded_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, run_date)
);

-- Result of one heading in one run: pass (done) / fail, with the tester's review.
CREATE TABLE IF NOT EXISTS sanity_results (
  run_id      text NOT NULL REFERENCES sanity_runs(id),
  item_id     text NOT NULL REFERENCES sanity_items(id),
  state       text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'pass', 'fail')),
  review      text NOT NULL DEFAULT '',
  shared_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (run_id, item_id)
);

-- Extra columns of an app's sanity sheet (after Status and Remarks); their values are per day, in sanity_results.cells
CREATE TABLE IF NOT EXISTS sanity_columns (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products(id),
  name        text NOT NULL,
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sanity_results ADD COLUMN IF NOT EXISTS cells jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Sheets: spreadsheets people make inside an app. Columns are typed (text, number, date, select, checkbox,
-- person, flow, screen); row values live in rows.cells as { columnId: value }.
-- share: who else in the app sees it: private (owner + editors) | view | edit; editors can always edit.
CREATE TABLE IF NOT EXISTS sheets (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products(id),
  name        text NOT NULL,
  owner_id    text REFERENCES users(id),
  share       text NOT NULL DEFAULT 'edit' CHECK (share IN ('private', 'view', 'edit')),
  editors     text[] NOT NULL DEFAULT '{}',
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sheets_product_idx ON sheets(product_id);
CREATE TABLE IF NOT EXISTS sheet_columns (
  id          text PRIMARY KEY,
  sheet_id    text NOT NULL REFERENCES sheets(id),
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'date', 'select', 'checkbox', 'person', 'flow', 'screen')),
  options     text[] NOT NULL DEFAULT '{}',
  width       int NOT NULL DEFAULT 180,
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sheet_columns_sheet_idx ON sheet_columns(sheet_id);
-- dropdown option → colour ('#rrggbb'), e.g. kept from the cell colours of an imported Excel
ALTER TABLE sheet_columns ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS sheet_rows (
  id          text PRIMARY KEY,
  sheet_id    text NOT NULL REFERENCES sheets(id),
  cells       jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order  bigint NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sheet_rows_sheet_idx ON sheet_rows(sheet_id);

-- A submitted sanity: kept for good (the checklist itself resets every day). rows is a copy of the sheet as it was
-- submitted: [{ heading, module, state, review, cells: { columnName: value }, checkedBy }]; testers = who ticked rows.
CREATE TABLE IF NOT EXISTS sanity_logs (
  id           text PRIMARY KEY,
  product_id   text NOT NULL REFERENCES products(id),
  run_id       text NOT NULL REFERENCES sanity_runs(id),
  run_date     date NOT NULL,
  version      text NOT NULL,
  run_time     text NOT NULL DEFAULT '',
  passed       int NOT NULL DEFAULT 0,
  failed       int NOT NULL DEFAULT 0,
  total        int NOT NULL DEFAULT 0,
  columns      jsonb NOT NULL DEFAULT '[]'::jsonb,
  rows         jsonb NOT NULL DEFAULT '[]'::jsonb,
  testers      text[] NOT NULL DEFAULT '{}',
  shared_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sanity_logs_product_idx ON sanity_logs(product_id, run_date DESC);
-- who the sanity report is sent to (@mentioned on Teams) when a sanity is submitted
ALTER TABLE products ADD COLUMN IF NOT EXISTS sanity_recipients text[] NOT NULL DEFAULT '{}';

-- "Done today": what someone finished on a day in an app, with the screens they changed.
CREATE TABLE IF NOT EXISTS done_items (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id),
  product_id  text NOT NULL REFERENCES products(id),
  work_date   date NOT NULL,
  text        text NOT NULL,
  screen_ids  text[] NOT NULL DEFAULT '{}',
  shared_at   timestamptz,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS done_items_day_idx ON done_items(product_id, work_date);
-- an entry made by resolving an issue (taken back off if the issue is reopened the same day)
ALTER TABLE done_items ADD COLUMN IF NOT EXISTS comment_id text REFERENCES comments(id);
-- One entry can be shared with people of the app (it shows under their "Shared with me", @mentioned on Teams);
-- a tester or super admin closes it once the change is checked.
ALTER TABLE done_items ADD COLUMN IF NOT EXISTS shared_with text[] NOT NULL DEFAULT '{}';
ALTER TABLE done_items ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE done_items ADD COLUMN IF NOT EXISTS closed_by text REFERENCES users(id);
CREATE INDEX IF NOT EXISTS done_items_shared_idx ON done_items USING gin (shared_with);

-- Audit columns on every table: who created / last changed a row and when. created_by / updated_by are the
-- signed-in user (NULL for rows made by the server itself, e.g. the seeded statuses or the first super admin).
-- updated_at starts as created_at for old rows and is kept current by a trigger on every UPDATE.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products', 'modules', 'flows', 'screens', 'comments', 'statuses', 'users', 'sessions',
                          'sanity_items', 'sanity_runs', 'sanity_results', 'sanity_columns', 'sanity_logs', 'done_items',
                          'sheets', 'sheet_columns', 'sheet_rows'] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_by text REFERENCES users(id)', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_by text REFERENCES users(id)', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at timestamptz', t);
    EXECUTE format('UPDATE %I SET updated_at = created_at WHERE updated_at IS NULL', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN updated_at SET DEFAULT now(), ALTER COLUMN updated_at SET NOT NULL', t);
    EXECUTE format('CREATE OR REPLACE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t || '_updated_at', t);
  END LOOP;
END $$;
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
