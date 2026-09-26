# Task Doctor

Track **products → modules → flows → screens** (e.g. Finzoom, Findost, IPO), with issues logged against each screen.

HTML + jQuery + Tailwind on the frontend, Node.js + Express on the backend, data stored in **Neon Postgres**, and screen images stored in **Cloudinary** (folder `task-doctor`).

## Setup

1. Create a project at [console.neon.tech](https://console.neon.tech) and copy its **connection string**.
2. Copy `.env.example` to `.env` and paste the string in as `DATABASE_URL`. `.env` is git-ignored.
   For images, also fill in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (Cloudinary → Settings → API Keys). Without them the app still works, but image uploads are turned off.
   Set `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` (8+ characters). On start, if there is no super admin yet, this login is created. Changing these later does nothing once a super admin exists.
3. Install and start. The tables are created automatically on the first start.

```bash
npm install
npm start        # or: node server — http://localhost:4000
```

Tables: `products`, `modules`, `flows`, `screens` (including conditions, whose branches are stored as `jsonb`), `comments` and `statuses`. Screens store their Cloudinary image URL and public id.

Nothing is ever deleted from the database: deleting a product, module, flow, screen, issue or status only sets `is_deleted = true` on that row (images stay in Cloudinary). Deleted rows, and everything inside a deleted product / module / flow, are hidden from the sheet.

## Logins and access

Everyone signs in. The super admin opens **Admin** in the header to create logins, reset passwords and delete logins (deleted logins are only flagged, and signed out).

Each login has an **access level** and the **apps** (products) it can open: a list of apps, or *All apps* (includes apps added later).

| Access | Can do |
|---|---|
| View only | See everything in their apps. Nothing can be changed. |
| Edit | Add and update issues (status, priority, assignees, remarks, Fixed), edit screens (name, page, platform, wireframe, image, condition branches) and drag cards. Cannot create or delete modules, flows or screens, or delete issues. |
| Full | Everything inside their apps: create, rename, delete and reorder modules, flows, screens and issues, and copy screens. |
| Super admin | Everything in every app, plus products, status tags and the admin dashboard. |

The server checks every request; apps a login cannot open are hidden from it completely.

## Features

- **Products** (Finzoom, Findost, IPO…) are listed at the top. Pick one to see its modules. The app remembers your last product.
  - Screens can be copied into flows of other products.
- **Modules** are tabs. Each module has numbered **flows** (1, 2, 3 …, reorder them with the up / down arrows), and each flow shows its **screens** left to right with arrows between them. Drag cards to reorder them or move them between flows.
- **Screen cards** show an App (phone) or Web (browser) preview. The preview is a wireframe (Form, List, Dashboard or Detail) or an uploaded image. Click a card to open it in a large view.
- **Conditions:** add a decision step to a flow with *Add condition*, e.g. "Mandate status".
  - Each branch has a label and the screen to show, e.g. *If Success → Mandate Success*, *If Pending → Mandate Pending*, *If Else → Mandate Failed*.
  - Branch colours follow the label: green for success, amber for pending, red for failure, grey for anything else.
  - Each target screen shows "If Mandate status = Success". The locate button jumps to the target.
  - **Branch paths:** *Extend path* on a branch starts a new flow from that exit, named after the branch (e.g. "Sign Up › Success"). Paths are drawn under their flow, numbered 1.1, 1.2 … (paths inside paths: 1.1.1), and end with END. Removing the branch or deleting the parent flow hides its paths.
  - **Copy a condition** with its copy button: the condition, its branches and every path (with screens, images and nested conditions) are copied to the chosen flows. Copied paths are renamed after the new flow ("Add Money › Success"), branch targets inside the copied paths point at the copies, and open issues can come along.
- **Copy to flows:** use the copy button on a card, or *Copy to flows* in the large view, to reuse a screen in other flows or modules.
  - The name, page, platform, wireframe and image are copied.
  - Each copy has its own issues. You can choose to copy the open issues too (with their status).
  - The large view shows "Also in: …" with links to the other copies.
- **Issues sit on the back of each card.** Click *Issues* to flip the card.
  - Each issue has a status, a priority (Urgent / High / Medium / Low), one or more assignees and remarks. Urgent and High are listed first.
  - Ticking *Fixed* sets the issue to Complete; unticking puts it back to Pending.
  - Type a name and press Enter (or a comma) to assign someone; add as many people as you need and remove one with ×.
  - The card outline shows the most urgent open issue.
  - The expand button opens the full-screen **issue sheet**, where every field is editable.
- **Issue status and date** (screens have no status; every issue has its own):

| Status | Date shown |
|---|---|
| Pending | Always today's date |
| Release for Testing | The date it was released (fixed) |
| Complete | The date it was completed (fixed) |
| Any status you add | The date it was set (fixed) |

- **Issues by status:** click a status count in the header (or *Open issues*) to see every issue with that status: module › flow › screen, priority, status, issue and assignees. The link icon at the end jumps to that screen.
- **Flow videos:** every flow and branch path has *Add video* in its header. Upload a screen recording (MP4, MOV or WEBM, up to 100 MB, stored in Cloudinary), then *Video* plays it, with Replace and Remove. Needs Edit access.
- **Write issue** (header): pick the app, **flow name** and **screen name** from drop-downs, then write the issue with its priority, status, assignees and remarks. The form stays open for the next one.
- **Excel** (header): downloads `task-doctor-<date>.xlsx` of everything your login can see. *Issues* sheet: app, module, flow no., flow, screen, page, issue, priority, status, status date, assignees, remarks, added on. *Screens* sheet: every screen with its open / total issues. Both have filters on the header row.
- **Status tags:** the *Statuses* button in the header adds, renames, recolours and removes statuses. Pending and Complete are built in and cannot be removed. Issues already on a removed status keep it until you pick another one.

## Files

```
server.js           API (Express + pg)
db.js               Postgres connection + schema
cloud.js            Cloudinary image upload / delete
auth.js             Password hashing, session cookie, access levels
env.js              loads .env
.env.example        DATABASE_URL template
public/             index.html, app.js, styles.css
```
