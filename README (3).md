# 🐞 BUG LOG — Specimen Intake & Field Tracker

A single-file, browser-based bug tracker with a playful "field specimen" theme. Log in, sign up, and start cataloguing bugs as if they were specimens in a naturalist's journal — complete with index-card styling, rubber-stamp badges, and a pinned-note aesthetic.

![Status](https://img.shields.io/badge/status-demo-C99A3D)
![No Backend](https://img.shields.io/badge/backend-none-6B8F5C)
![Single File](https://img.shields.io/badge/build-single--file%20HTML-5B7B99)

## Overview

BUG LOG is a self-contained `index.html` file — no build step, no server, no dependencies beyond Google Fonts. It simulates a lightweight issue tracker where each bug report is treated as a "specimen," complete with a specimen number, severity stamp, and status badge.

**Important:** All data (users and bugs) lives only in browser memory (JavaScript variables) for the current tab session. Nothing is persisted to `localStorage`, `sessionStorage`, or any backend — refreshing the page resets everything to the seeded demo data.

## Features

- **Auth flow** — Log in or sign up with a username and password (in-memory only, no real authentication or encryption)
- **Demo account** — One-click "Use demo credentials" button pre-fills a working demo login (`demo` / `demo123`)
- **Specimen (bug) CRUD** — Create, edit, and delete bug reports
- **Status workflow** — Cycle each bug through Open → In Progress → Resolved with one click
- **Severity levels** — Low, Medium, High, Critical, each with distinct color-coded stamps
- **Live stats dashboard** — Counts for Open, In Progress, Resolved, and Critical specimens
- **Search & filters** — Filter by keyword, status, and severity simultaneously
- **Toast notifications** — Lightweight confirmation messages for create/update/delete actions
- **Responsive layout** — Adapts down to mobile widths
- **Accessible touches** — Focus-visible outlines, `prefers-reduced-motion` support

## Getting Started

No installation required.

1. Download `index.html` from this repository
2. Open it directly in any modern browser (Chrome, Firefox, Safari, Edge)

Or, to serve it locally:

```bash
# Python 3
python -m http.server 8000

# then visit http://localhost:8000
```

### Demo Login

| Field    | Value          |
|----------|----------------|
| Username | `demo`         |
| Password | `demo123`      |

Click **"Use demo credentials"** on the login screen to auto-fill these.

## Tech Stack

- Vanilla HTML, CSS, and JavaScript — no frameworks, no build tools
- Fonts: [Bitter](https://fonts.google.com/specimen/Bitter) (headings) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (body/UI) via Google Fonts

## Project Structure

```
.
└── index.html   # Entire application: markup, styles, and logic
```

## Known Limitations

This is a front-end demo/prototype, not a production-ready application:

- Data does not persist between page reloads or across browser tabs
- Passwords are stored and compared in plain text in memory — do not reuse real credentials
- No real backend, database, or network requests are involved
- Duplicate usernames with different casing are currently accepted (tracked as a sample bug within the app itself — see "Signup allows duplicate usernames with different casing" in the seeded demo data)

## Roadmap Ideas

- Wire up a real backend (e.g., Node/Express + database) for persistence
- Hash and salt passwords properly
- Add role-based permissions (reporter vs. maintainer)
- Add file/screenshot attachments per specimen
- Add sorting (by date, severity, status)
- Export specimens to CSV/JSON

## License

Add your preferred license here (e.g., MIT) before publishing.

## Contributing

Issues and pull requests are welcome. Please open an issue describing the change before submitting a large PR.
