# Product Task Sheet

Track **products → modules → flows → screens** (e.g. Finzoom, Findost, IPO), with issues logged against each screen.

HTML + jQuery + Tailwind on the frontend, Node.js + Express on the backend, data stored in **Neon Postgres**, and screen images stored in **Cloudinary** (folder `task-doctor`).

## Setup

1. Create a project at [console.neon.tech](https://console.neon.tech) and copy its **connection string**.
2. Copy `.env.example` to `.env` and paste the string in as `DATABASE_URL`. `.env` is git-ignored.
   For images, also fill in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (Cloudinary → Settings → API Keys). Without them the app still works, but image uploads are turned off.
3. Install and start. The tables are created automatically on the first start.

```bash
npm install
npm start        # or: node server — http://localhost:4000
```

Tables: `products`, `modules`, `flows`, `screens` (including conditions, whose branches are stored as `jsonb`), and `comments`. Screens store their Cloudinary image URL and public id, and deleting a screen (or anything above it) also deletes its image from Cloudinary. Deleting a product, module or flow removes everything inside it.

## Features

- **Products** (Finzoom, Findost, IPO…) are listed at the top. Pick one to see its modules. The app remembers your last product.
  - Screens can be copied into flows of other products.
- **Modules** are tabs. Each module has **flows**, and each flow shows its **screens** left to right with arrows between them. Drag cards to reorder them or move them between flows.
- **Screen cards** show an App (phone) or Web (browser) preview. The preview is a wireframe (Form, List, Dashboard or Detail) or an uploaded image. Click a card to open it in a large view.
- **Conditions:** add a decision step to a flow with *Add condition*, e.g. "Mandate status".
  - Each branch has a label and the screen to show, e.g. *If Success → Mandate Success*, *If Pending → Mandate Pending*, *If Else → Mandate Failed*.
  - Branch colours follow the label: green for success, amber for pending, red for failure, grey for anything else.
  - Each target screen shows "If Mandate status = Success". The locate button jumps to the target.
- **Copy to flows:** use the copy button on a card, or *Copy to flows* in the large view, to reuse a screen in other flows or modules.
  - The name, page, platform, wireframe and image are copied.
  - Each copy has its own status (it starts as Pending) and its own issues. You can choose to copy the open issues too.
  - The large view shows "Also in: …" with links to the other copies.
- **Issues sit on the back of each card.** Click *Issues* to flip the card.
  - Each issue has a priority (Urgent / High / Medium / Low), an assignee and remarks. Urgent and High are listed first.
  - The card outline shows the most urgent open issue.
  - The expand button opens the full-screen **issue sheet**, where every field is editable.
- **Status and date:**

| Status | Date shown |
|---|---|
| Pending | Always today's date |
| Release for Testing | The date it was released (fixed) |
| Complete | The date it was completed (fixed) |

## Files

```
server.js           API (Express + pg)
db.js               Postgres connection + schema
cloud.js            Cloudinary image upload / delete
env.js              loads .env
.env.example        DATABASE_URL template
public/             index.html, app.js, styles.css
```
