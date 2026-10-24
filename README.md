# FlowTrace

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
| View only | See the screens and flow videos in their apps. Issues are hidden completely (cards, issue counts, issue sheets, and the Excel *Issues* sheet). Nothing can be changed. |
| Update tasks | Add and update issues (status, priority, assignees, remarks, Fixed) with *Write issue* or on the cards. Screens are read only: no editing names, pages, platform, wireframe, images, condition branches or videos, and no dragging cards. Cannot delete issues. |
| Tester | Same as *Update tasks*: add and update issues and move them to **any** status (Pending, Release for Testing, Complete / Fixed, custom tags). Screens are read only. Cannot delete issues. |
| Developer | Everything *Update tasks* can do, plus add, rename and delete **modules** and **flows**; add, edit (name, page, type, "opens when", platform, wireframe) and delete **screens / popups** and upload, replace or remove their **images**; add, rename and delete **conditions**, edit their branches and extend a branch into a path; **extend a new flow from a screen**; and **drag and drop** screens to reorder them or move them to another flow (on the board and in the diagram; the diagram's + between two steps works too, for screens, popups and conditions). Can only move an issue between **Pending** and **Release for Testing**: not Complete / Fixed or any other status, and not an issue already on another status. Cannot move flows up / down, copy screens, or upload / remove flow videos. |
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
- **Extend a flow from a screen:** when several journeys share the first screens (e.g. screens 1–3 are the same and a new journey continues from screen 4), click the extend button on screen 4's card (next to edit / delete). Name the new flow and it is drawn under that card with an **L-shaped** line: down from the card, then right into the new flow's screens. It is numbered like other paths (1.1, 1.2 …), ends with END, and its header shows "from <screen>" (click it to jump back). Add screens to it as usual; a screen inside it can be extended again. Deleting the screen or its flow hides the new flow. Needs Developer access.
- **Draw a flow** (whiteboard, with FigJam's look): *Draw flow* next to *+ Add flow* draws a new flow; *Draw* in a flow's header draws steps to add to the end of that flow. Needs Developer access or above.
  - Tools (toolbar or keys): Select (V / 1), Hand (H, or hold Space), **Screen** box (R / 2), **Popup** dashed box (P / 3), **Condition** diamond (D / 4), **Arrow** (A / 5), **Sticky note** (S / 6, only a note). Drag to draw or click for the usual size, and type the name straight away. Double-click a box or an arrow to write on it. Selected boxes and stickies get a colour bar (blue, violet, yellow, green …).
  - Arrows join boxes and follow them when you move them. Drag an arrow's middle dot to bend it; a new arrow that would cross a box bends around it.
  - Move, resize (corner handles), select with a box or Shift-click, Delete, Ctrl+D duplicate, arrow keys nudge, Ctrl+Z / Ctrl+Shift+Z undo / redo, Ctrl+scroll zooms, scroll moves around.
  - **How it reads:** the box no arrow points into is the first screen (marked *Start*), and the arrows give the order. Every arrow out of a condition is a branch named after its text (Success, Failed …). A branch to a new box becomes that branch's **path** (1.1, 1.2 …); a branch to a screen already drawn points back at it. A screen with two or more arrows out starts a new flow from that screen for each extra arrow, named after the arrow's text. A condition with no arrows gets Success / Pending / Else. Sticky notes are not created.
  - The panel on the right shows what will be created, live, with anything that needs fixing (unnamed boxes, more than one start, arrows not joined). **Create flow** / **Add to flow** makes it all in one go, then the drawing is cleared. Until then the drawing is kept in this browser.
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
- **Pen (mark an area on a screen image):** in the large view of a screen with an image, click **Pen** and drag a box over the image. Then pick:
  - **Add bug**: writes an issue tied to that area (issue, priority, frontend / backend).
  - **Add navigation**: pick another screen of the app; clicking the area opens that screen.
  - Everything on the same box is one **area** with **one underline**: a thin line in the status colour of its most urgent open bug (Pending amber, Release for Testing sky, custom tags their colour), or black when it only has links. No box is drawn. A **Complete** bug is no longer tied to its area: it leaves the area's list and line (an area with nothing else left disappears), and comes back if the bug is reopened.
  - Hover an area (or turn the Pen on) for its **pen icon** at the end of the line: it lists the area's bugs and links (*Go to …*, × removes a link) and has **Add bug** / **Add navigation** to put more on the same area.
  - Clicking the underline: an area with open bugs moves them to the top of the issue list, highlighted (click again to undo), even if it also has links (those are in the pen icon's list); an area with only one link opens that screen; several links are listed. The pen chip on an issue flashes its area.
  - Esc or clicking Pen again stops drawing. Bugs need *Update tasks* or above; navigation links (add / remove) need *Developer* or above.
- **Sheets** (header, left of *Sanity*): your own spreadsheets and imported Excel files, on a **page of their own** that uses the whole window (no footer; the grid scrolls). *← Board* or the Sheets button goes back; the address (`#sheets=<app>&sheet=<id>`) keeps you there after a refresh. The panel button hides the list of sheets for more room (kept in this browser).
  - A new sheet starts with *Task, Status, Owner, Flow, Due* and three empty rows; change or delete any of them.
  - **Typed columns:** Text, Number, Date, Dropdown (your options, coloured like status tags), Checkbox, Person (a login of the app), **Flow** and **Screen** (pick one of the app's; the link button jumps to it). Changing a column's type keeps the values that fit.
  - **+ Column** adds a column; hover a header to edit or delete it. The column editor shows only what the type needs: options for a dropdown (up to 100), and for a **Formula** column a formula box with the other columns as chips to click in, Excel's function names (IF, IFS, SWITCH, AND, OR, SUM, AVERAGE, ROUND, TEXT, CONCAT, TEXTJOIN, TODAY, DATEDIF, NETWORKDAYS, WORKDAY, EOMONTH …), examples and a live preview on the first rows, plus how to show the result (number, percent, currency with its symbol, date, decimals).
  - **Formula columns** work a value out from the other cells of the row, e.g. `[Qty] * [Price]` or `IF(AND([Status] <> "Done", [Due] < TODAY()), "Late", "OK")`. Columns are named in [ ]; renaming a column keeps its formulas working. A formula may use other formula columns; a mistake shows Excel's error (#DIV/0!, #NAME?, #REF! …) in red. Results update as soon as a cell changes, sort and filter like numbers / dates / text, number results are totalled, and the Excel download keeps them as real Excel formulas. *Add row* adds a row; hover a row for its delete button; drag the row numbers to reorder.
  - Each cell saves on its own, and only that cell is sent, so two people can work in the same sheet.
  - **Search** filters rows; click a column name to sort (ascending → descending → off; sorting only changes the view). Number columns are totalled and checkboxes counted at the bottom.
  - **Filters like Excel:** the funnel on each column header opens sort (A → Z, smallest → largest, oldest → newest …), **filter by colour** (the fills and text colours in that column), a **condition** (contains, begins with, equals, is empty …; for numbers =, >, ≥, <, between; for dates on, before, after, between) and the **list of values** with counts, a search box and *(Select all)*. The list only shows values left by the other columns' filters, like Excel. Filters add up; the footer says what is filtered with *Clear filters*. They are kept per sheet in this browser.
  - **Share** (owner): *Private* (only you and the people below), *everyone in the app can view*, or *everyone in the app can edit*, plus named people who **can view** or **can edit** on top of that. Only the owner (or a super admin) renames, shares or deletes a sheet. View-only logins never edit.
  - **Share with people…** (in the Share menu): tick one or more people of the app, pick *View* or *Edit*, add a message and pick how they hear about it: **Direct message**, **My Teams chats**, **App channel** (each with a link that opens the sheet) or **Don't message** (access only). Nobody loses access they already had.
  - **Excel** downloads the sheet with numbers as numbers, dates as dates, people / flows / screens by name, filters and a SUM row. **Import Excel / CSV** reads an .xlsx (or a .csv) in detail, and **From Google Sheets** takes a Google Sheet's link (shared as "Anyone with the link can view") and reads it the same way:
    - every visible worksheet with data becomes a sheet ("File › Worksheet" when there are several); empty worksheets, empty rows and **empty columns** are left out (also a column that has a header but no values)
    - the header row is the first row (of the first 30) at least half as full as the fullest one, so title rows above it are skipped; a header merged over several columns with sub headers under it gives "Group › Sub" names
    - merged cells: a value merged down fills every row it covers; one merged across stays in its first column
    - each column gets its type from its values: a **dropdown list in Excel** (data validation) → dropdown with all its options, Yes / No → checkbox, numbers (₹1,200 too; percentages as 0–100 with "(%)" in the name), dates (also typed ones like 02/10/2026, 3 Oct 2026 or Oct 3, 2026), names / usernames / Teams emails of logins → person, a few repeated values or a Status / Priority … column → dropdown, else text; a TRUE / FALSE list (Google Sheets checkboxes) → checkbox; links give their text
    - **formulas**: a column with the same formula in every row (`=C2*D2`, `=IF(B2="Done",…)`, `=SUM(C2:F2)`) becomes a **formula column** that keeps working, with Excel's number format (%, ₹ / $ …, dates, decimals). It is checked against Excel's own results first; formulas that look at other rows, other worksheets, named ranges or functions FlowTrace does not have keep their results as values
    - **dropdowns stored the newer way** (Excel 2010+ and Google Sheets keep a list on another worksheet, and rules that look at another worksheet, in the file's extension part) are read too; a worksheet that only holds the options of dropdowns (a "Lists" sheet) is not imported as a sheet of its own
    - **colours are what Excel shows**: fixed colours, the workbook's own theme colours with their lighter / darker tint, and the old indexed palette; then **conditional formatting** on top (cell value rules, text contains / begins / ends, formula rules like `=$C2="Done"`, blanks, duplicates, top 10, above average, dates such as "today", and colour scales)
    - dropdown values are drawn in their **full Excel colour** (fill and text colour), also options **no row uses yet** (the colour the conditional formats would give them), else the colour of the app's status tag with the same name; other cells keep their own fill, text colour and bold; all of it goes back into the Excel download
    - after the import a summary shows each worksheet's rows, columns with their types and colours, and the empty columns left out
    - up to 5,000 rows and 100 columns per worksheet
  - **Send on Teams:** tick rows (or none, for every row shown after search and filters), pick the columns to send and the people, add a message, and pick where it goes: **Direct message** (each person gets it in a chat with you, from your own Teams), **My Teams chats** (tick as many people you chat with and group chats you are in as you like, searchable; the message goes to each, @mentioning the people) or **App channel** (the app's webhook channel). The last choice (and chats) is remembered. People and chats are picked in a Teams-style **To:** field: type a name, pick from the list (arrow keys + Enter work), remove a chip with its × or Backspace.
  - **Whole sheet as Excel:** when every row is being sent (all ticked, or none ticked with no search or filter) and you can edit the sheet, tick **Attach the whole sheet as Excel**. Direct messages and your chats get the .xlsx attached from your OneDrive (`FlowTrace` folder, viewable in your organisation; the first time, Microsoft asks for OneDrive access); the App channel gets a **Download Excel** button. *Share with people…* offers the same.
- **Sanity** (header): the app's daily sanity checklist, on its **own page** in place of the board. *← Board* (or the Sanity button again) goes back; switching app on the page shows that app's sanity; the address (`#sanity=<app>`) keeps you on the page after a refresh and can be shared.
  - It is a sheet: **#, Heading, Status, Remarks**, then any columns you add.
  - **Every flow of the app is already a heading** (tap it to jump to that flow); new flows join the end by themselves. A flow removed from the list stays out (pick it again under *New heading…* to bring it back).
  - Add your own rows with a typed heading. A typed heading can also be created as a new flow in a module (Developer or above). Drag the numbers to reorder.
  - **+ Column** adds your own columns (e.g. Device, Build no.) to the right of Remarks; rename or delete them from the column header. Like Status and Remarks, their values start empty each day.
  - Sanity testers tick **Done** or **Failed**, write remarks and fill the columns. Set the **version** and **sanity time** for the day.
  - **Submit sanity** (sanity testers) when the run is finished. It is only saved when the **version** is filled in and **every heading is Done or Failed** (a remark on a failure is optional); anything missing is listed and those rows are outlined in orange. The date is the day of the run.
  - Submitting saves a **log** that is kept for good (date, version, passed / failed, who checked each heading, who submitted, and a copy of the whole sheet with your columns), adds *"Sanity done on version … : n passed, n failed"* to the submitter's **Done today**, and posts the **report** to Teams, @mentioning the people under **Report goes to** (sanity testers and Full logins pick them with *Change*). Several sanities can be submitted on one day (e.g. a new build); each is its own log.
  - **Sanity logs** have their own page (*Logs* at the top of the Sanity page, or the version in the header; the address is `#sanity=<app>&view=logs`): every submitted sanity of the app, newest first, with the last tested version, number of reports, last result and pass rate on top. Search by version or person, or pick a day. Each row shows date, version, passed / failed, done by, submitted by and when, with an Excel download. **View** opens the report as it was submitted, with **Excel** and **Share this report**: pick anyone of the app to @mention on Teams, or **Copy link** (`#sanity=<app>&log=<id>`) to send it anywhere.
  - **Excel** downloads the day's sheet: heading, module, status, remarks, your columns, who checked it and when, plus the version and time.
  - The list **resets every day** at midnight (`APP_TIMEZONE`, default Asia/Kolkata). Pick an earlier date to see that day's results.
  - **Teams:** at the sanity time the app's channel gets a reminder that @mentions the sanity testers (once a day; changing the time re-arms it). A heading marked **Failed** is posted straight away with the review and a link to the flow. *Share on Teams* posts the day's summary.
  - **Testers, developers and super admins** run sanity; any other login needs the **Sanity tester** tick (Admin), on top of its access level. Sanity testers and Full logins can change the list. Everyone else can look.
  - **Teams channel** (super admins, at the bottom of Sanity): in Teams open the channel → *Workflows* → *Post to a channel when a webhook request is received*, and paste the URL it gives. *Send test* checks it. People are @mentioned by the **Teams email** on their login (Admin).
- **Done today** (header): an issue you set to **Complete** (or tick *Fixed*) is added to your Done today by itself, with its screen (and taken off again if you reopen it the same day). Everyone also writes what they finished, attaching the screens they changed (the chips open the screen). You only see your own entries (and the ones shared with you); super admins see everyone's, grouped by person. Pick a date to see an earlier day. *Share my day on Teams* posts your entries with links to the screens. You can edit or delete only your own entries.
  - **Share one entry** (the share icon on your entry): pick people of the app. They are @mentioned on Teams with the entry and its screens, and it shows under their **Shared with me** tab (open ones first, any day; the address is `#done=<app>&tab=shared`). Untick someone to stop sharing with them.
  - **Close** a shared change once you have checked it: **testers and super admins** it was shared with (super admins: any shared entry). Closing tells the author on Teams; *Reopen* opens it again. Every entry shows who it is shared with and *Open* / *Closed by … · date*.
- **Present version** (header, top right): the app's latest version from Sanity — today's version once it is set, otherwise the version of the last sanity day. Click it to open the sanity logs.
- **Links from Teams** open the app at a place: `#flow=…`, `#screen=…`, `#sanity=<app>`, `#done=<app>`, `#sheet=<sheet>`. Set `APP_URL` in `.env` so the daily reminder can link back (other messages use the address the request came from).
- **Issue status and date** (screens have no status; every issue has its own):

| Status | Date shown |
|---|---|
| Pending | Always today's date |
| Release for Testing | The date it was released (fixed) |
| Complete | The date it was completed (fixed) |
| Any status you add | The date it was set (fixed) |

- **Issues by status:** click a status count in the header (or *Open issues*) to see every issue with that status: module › flow › screen, priority, status, issue and assignees. The link icon at the end jumps to that screen. Tick issues (or none, for all listed) and **Send on Teams** with the columns you pick (screen, issue, priority, status, assignees, remarks, area, date) and people to @mention.
- **Flow videos:** every flow and branch path has *Add video* in its header. Upload a screen recording (MP4, MOV or WEBM, up to 100 MB, stored in Cloudinary), then *Video* plays it, with Replace and Remove. Needs Full access to upload or remove; View only and Update tasks logins can watch it.
- **Write issue** (header): pick the app, **flow name** and **screen name** from drop-downs, then write the issue with its priority, status, assignees and remarks. The form stays open for the next one. Tick *Send them on Teams too* to post the issues you just added (same column / people picker).
- **Teams notifications for issues:** when an issue is assigned to someone, they are @mentioned on the app's Teams channel; when its status changes, its assignees and the person who wrote it are. Assignees are matched to logins by name or username, and are @mentioned by their Teams email (Admin). Nobody is told about their own change. When you have **connected Teams**, they also get a **direct message** from you (untick it in the Teams menu).
- **Your own Teams** (*Teams* in the header, when `MS_CLIENT_ID` is set): *Connect Teams* signs in with your Microsoft work account in a popup, once per browser. Then *Send on Teams* can message people directly or post in your channels, and issue changes message people directly. Connecting also fills in your login's **Teams email** when it is empty. The **FlowTrace login → Teams email** mapping is the *Teams email* on each login in Admin (e.g. `Visha_yadav` → `vishal.yadav@myfindoc.com`).
  - Setup (Microsoft Entra admin center → App registrations → your app): platform **Single-page application** with the redirect URI `APP_URL/` (e.g. `https://task-doctor.vercel.app/`, and `http://localhost:4000/` to try it locally); **API permissions → Microsoft Graph → Delegated**: `User.Read`, `User.ReadBasic.All`, `Chat.Create`, `Chat.ReadBasic`, `ChatMessage.Send`, then **Grant admin consent** if your organisation does not let people consent themselves. Put the *Application (client) ID* and *Directory (tenant) ID* in `.env` as `MS_CLIENT_ID` and `MS_TENANT_ID`.
- **Dark theme:** the moon / sun button in the header. With no pick the app follows the system setting; the pick is kept in this browser. The dark colours are made from `styles.css` when the page loads (`public/theme.js`), so new styles get a dark look on their own; a rule starting with `html.dark` in `styles.css` sets one by hand.
- **Excel** (header): downloads `flowtrace-<date>.xlsx` of everything your login can see. *Issues* sheet: app, module, flow no., flow, screen, page, issue, priority, status, status date, assignees, remarks, added on. *Screens* sheet: every screen with its open / total issues. Both have filters on the header row.
- **Status tags:** the *Statuses* button in the header adds, renames, recolours and removes statuses. Pending and Complete are built in and cannot be removed. Issues already on a removed status keep it until you pick another one.

## Files

```
server.js           API (Express + pg)
db.js               Postgres connection + schema
cloud.js            Cloudinary image upload / delete
excel.js            Excel / CSV import: types, dropdown lists (also <extLst>), theme / indexed colours, conditional formatting, merged cells, formula columns
public/formula.js   Excel's formula language, shared by the browser (formula columns) and the server (import, export, Teams)
teams.js            Teams Adaptive Cards and the app's webhook; Microsoft sign-in settings for the browser
auth.js             Password hashing, session cookie, access levels
env.js              loads .env
.env.example        DATABASE_URL template
public/             index.html, app.js, styles.css, theme.js (light / dark), graph.js (send from your own Teams)
```

---

© 2026 FinDevelopers · Prompting by Himanshu Swami · Idea & prompts by Vishal Yadav
