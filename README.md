# 💛 Spread Kindness

A simple web app where anyone with the link can share an act of kindness they performed or witnessed.
Submissions save to a Google Sheet you own. Built with plain HTML, CSS, and JavaScript — no frameworks, no server.

**Live site:** `https://<your-github-username>.github.io/Project-SpreadKindness/`

---

## What it does

- Anyone with the link can submit a kindness act
- Works for **self-reporting** ("I did something kind") or **reporting someone else** (reporter can stay anonymous)
- Always captures the name of the person who did the kind act
- Shows a live count of all acts shared so far
- All data saves instantly to a Google Sheet you own

---

## Google Sheet columns

| # | Timestamp | Kind Person's Name | Act of Kindness | Reported By | Reporting Type |
|---|-----------|-------------------|-----------------|-------------|----------------|
| 1 | 2024-01-15 10:30:00 | Priya Sharma | Helped carry groceries for an elderly neighbor | Priya Sharma | Self |
| 2 | 2024-01-15 11:45:00 | Ravi Kumar | Left an encouraging note on a coworker's desk | Anonymous | On Behalf Of |

---

## Setup (~10 minutes, one time)

### Step 1 — Create a Google Sheet

Go to [sheets.google.com](https://sheets.google.com), create a blank sheet, and leave it empty.
The script will add the header row automatically on first use.

### Step 2 — Add the Apps Script backend

1. In your Google Sheet → **Extensions → Apps Script**
2. Delete any existing code
3. Copy everything from `apps-script.js` in this repo and paste it in
4. Save with **Ctrl + S**

### Step 3 — Deploy as a Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon → select **Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone
5. Click **Deploy** and copy the URL shown
   (looks like `https://script.google.com/macros/s/ABC.../exec`)

### Step 4 — Connect the URL to the web page

Open `script.js` and replace line 2:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

Commit and push that change.

### Step 5 — Enable GitHub Pages

**Repo → Settings → Pages → Source: main branch, / (root) → Save**

Your form will be live at `https://<username>.github.io/Project-SpreadKindness/`

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | The form page |
| `style.css` | All visual styling |
| `script.js` | Form logic and Google Sheets communication |
| `apps-script.js` | Paste this into Google Apps Script |

---

## Tech stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Google Apps Script (serverless, free)
- **Database:** Google Sheets
- **Hosting:** GitHub Pages (free)
