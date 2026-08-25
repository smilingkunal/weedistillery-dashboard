# WeeDistillery Marketing Dashboard

Live URL: **https://smilingkunal.github.io/weedistillery-dashboard/**

## What's here

| Tab | Status | Data source |
|---|---|---|
| **Top 10 Opportunities** | ✅ Live | Mock JSON (will switch to live GSC + competitor + GBP data once those APIs are wired) |
| **Blogs** | ✅ Live | Mock JSON (will switch to live content_jobs Sheet once pipeline ships) |
| Competitors | 🚧 Soon | Phase 2 |
| GBP | 🚧 Soon | Phase 2 (requires GBP quota approval from Google) |
| SEO On-Page | 🚧 Soon | Phase 2 (requires Screaming Frog crawl) |

## Status: MOCK DATA

The footer shows `MOCK DATA` because right now the dashboard reads from static JSON files (`data/opportunities.json`, `data/blogs.json`). These contain realistic examples of what real data will look like.

When the n8n content pipeline ships, these JSON files will be replaced by webhook calls to n8n endpoints that read from the live `content_jobs` data store.

## Auth

For demo/preview: **DEMO_MODE = true** in `auth.js` — any click on "Sign in with Google" shows the dashboard.

For production: Set `DEMO_MODE = false` and replace `GOOGLE_CLIENT_ID` with your Google Cloud OAuth Client ID. Only `primebridgemarketing@gmail.com` (and the other emails in `ALLOWED_EMAILS`) will be able to sign in.

### Setting up real Google OAuth (5 minutes)

1. Go to https://console.cloud.google.com/apis/credentials (use the `seo-bots-readonly` project)
2. **Create Credentials → OAuth Client ID**
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `http://localhost`
   - `https://smilingkunal.github.io`
5. Click Create → copy the Client ID (looks like `123456789-abc.apps.googleusercontent.com`)
6. In `auth.js`:
   - Replace `'REPLACE_ME.apps.googleusercontent.com'` with your actual Client ID
   - Change `const DEMO_MODE = true;` to `const DEMO_MODE = false;`
7. Commit and push — done

## Architecture

- **No backend** — pure static site hosted on GitHub Pages
- **No database** — reads JSON files (will switch to webhook calls to n8n)
- **Single-page** — vanilla JS, no framework dependencies
- **Dark theme** — matches the existing SEO bot dashboard style

## Files

```
.
├── index.html         # Main page
├── styles.css         # Dark theme styling
├── dashboard.js       # Tab rendering, filters, approve/reject
├── auth.js            # Google OAuth wrapper
├── data/
│   ├── opportunities.json   # Mock opportunities
│   └── blogs.json           # Mock blog drafts + published
└── README.md
```

## Pipeline integration plan (next session)

When the n8n content pipeline is ready:

1. Replace `fetch('data/opportunities.json')` with `fetch('https://n8n.kunaldahiya.me/webhook/dashboard/opportunities')`
2. Replace `fetch('data/blogs.json')` with `fetch('https://n8n.kunaldahiya.me/webhook/dashboard/blogs')`
3. Wire up the Grab / Approve / Reject buttons to POST to n8n webhook endpoints
4. Add 30-second auto-refresh on the Blogs tab
5. Remove the "MOCK DATA" footer pill

Estimated time: 30-45 minutes once the pipeline is working.

## Pipeline design notes

See `PIPELINE_DESIGN.md` (next to this README) for the full architecture of the n8n workflows that will eventually feed this dashboard.