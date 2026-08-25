# Pipeline Design (for follow-up session)

This is the design doc for the n8n content pipeline that will eventually feed the WeeDistillery dashboard. **This is NOT yet built** — what works today is the dashboard with mock data. The pipeline is for a focused follow-up session.

## Why it's not built yet

In our first build session, we hit seven blockers in a row trying to integrate Google Sheets:
1. OAuth credential was stale (fixed)
2. OAuth re-auth still forbidden (couldn't diagnose)
3. Path A reconnect still forbidden (couldn't diagnose)
4. Public share still 401 (couldn't make it work)
5. n8n's `googleSheets` node requires OAuth2 (can't use service account)
6. n8n's Function node can't sign JWTs (no `crypto` module)
7. n8n's data tables don't support updates

We shipped the dashboard with mock data instead of sinking more hours into auth debugging. **This is the right call** — visible deliverable > blocked pipeline.

## Architecture (Option D refactor)

The pipeline uses **n8n's per-workflow staticData** as the state machine, accessed via a single "State Machine" workflow that exposes CRUD webhooks. All other workflows call this state machine instead of touching Google Sheets.

### Why staticData (not Sheets, not data tables, not variables)

| Option | Pros | Cons |
|---|---|---|
| Google Sheets | Familiar UI | OAuth dance failed; doesn't work via service account in n8n |
| n8n data tables | Built-in API | No update operation, no filter, schema-locked |
| n8n variables | Built-in | License feature: locked behind your plan |
| **n8n staticData** | Always works, no auth, persistent, fast | Requires a "helper" workflow that all others call |

### Single source of truth: `WI - State Machine` workflow

```
Webhook: POST /wi-state
  operation: read_all | read | write | update | delete | upsert
  data: {...}

Function: stateMachineCRUD
  - $getWorkflowStaticData('global') — read persistent JSON
  - if write/update: data.jobs[gap_id] = {...merged}
  - if read: return data.jobs
  - if read_all: return all jobs
```

All other workflows call this webhook instead of touching Sheets.

### Updated workflow IDs (will replace existing)

| Workflow | New webhook | Replaces |
|---|---|---|
| `WI - State Machine` | `POST /wi-state` | Sheets read/write |
| `WI - Gap Finder` | Cron M/W/F → POST /wi-state (op=write) | Same |
| `WI - Module A` (Blog Writer) | Webhook → POST /wi-state (op=update) | Same |
| `WI - Module B` (Image Gen) | Webhook → POST /wi-state (op=update) | Same |
| `WI - Module C` (Combiner) | Cron 5min → POST /wi-state (op=read) → writes new row | Same |
| `WI - Module D` (Approval) | Telegram webhook → POST /wi-state (op=update) | Same |
| `WI - Dashboard Data` | `POST /wi-dashboard-data` returns `{stats, opportunities, drafts}` | Mock JSON files |

### What's already working (reusable)

- ✅ WordPress + App Password credential: `yUx1b4NBIJZsgVbO`
- ✅ Gemini flash-lite key: `RGnJ0KcNbb7TqtDf`
- ✅ Pexels API key: `XHMr376cEBmSWe2x`
- ✅ Telegram bot token: `yiZzfp9oTq6URlbu`
- ✅ n8n data table created: `Bcpbfa0anwvGpJ9O` (40 columns, but limited ops)
- ✅ Smoke test workflow: `2RyA57ZOjlrittNO` (verifies WP/Gemini/Pexels)

### What needs to to follow this

- Build `WI - State Machine` workflow (~30 min)
- Refactor Module A first as proof (~30 min)
- Test end-to-end (~15 min)
- Replicate pattern to B/C/D (~45 min)
- Wire Mon/Wed/Fri schedule (~10 min)
- Build `WI - Dashboard Data` webhook (~15 min)
- Update dashboard to fetch from webhook (~30 min)
- End-to-end test (~15 min)
- Rotate credentials (~5 min)

**Total: ~3-4 hours focused session.**

### Cannabis compliance reminders (carry over from this session)

These are baked into the Module A prompt — don't change them:

1. NO health claims (cure, treat, heal, prevent)
2. NO targeting minors
3. NO specific THC% framed as potency contests
4. NO cross-border / US shipping references
5. NO claims about illegal activity
6. NEVER invent product names, prices, or stock
7. ALWAYS include responsible-use language
8. Be factually defensible

### Topics that should auto-denied (blocklist in Gap Finder)

Already implemented in the Gap Finder function:

- cure, heal, prevent disease, strongest thc, highest thc, most potent
- us shipping, international order, without id, fake id, minor
- beat a drug test, laced, synthetic cannabis, spice, drug test

### Image strategy

- Primary: Pexels search (verified working: 5,139 cannabis photos, 200 req/hr free)
- Fallback: placeholder via Gemini text-to-image (needs Gemini image model setup)
- "Placeholder" badge on dashboard when image failed

### Telegram bot

- `Telegram account` credential: `yiZzfp9oTq6URlbu` exists but **untested**
- Need to verify: send a test message, get a reply
- Approval flow: user replies `APPROVE <gap_id>` or `REJECT <gap_id>`

### Rotation plan (after build)

Per your security preference:

1. WordPress App Password — regenerate at wp-admin
2. Gemini API key — revoke at aistudio.google.com/apikey
3. Pexels API key — revoke at pexels.com/api
4. n8n API key — Settings → API → delete + recreate
5. Service account key — Google Cloud Console → IAM → delete key

## What I learned this session

These are lessons worth saving for future builds:

1. **Always smoke-test OAuth credentials before building workflows on top of them.** The single biggest source of wasted time was building 5 workflows, then discovering the OAuth couldn't reach the Sheet. A2-minute smoke test would have caught this upfront.

2. **n8n's Function node sandbox is restrictive** — no `crypto`, no `https`, no `fs`. For anything that needs those, use HTTP Request nodes pointing at external services or do the work before sending to n8n.

3. **Service accounts are the right answer for Sheets automation** but only if you have a place that can do JWT signing. n8n's sandbox can't. Either:
   - Use a Python helper (Option A from earlier)
   - Use staticData (Option D — recommended)
   - Switch to a different orchestrator (Zapier/Make may have better Sheets+service-account support)

4. **When stuck on auth for more than 30 min, pivot.** The cost of shipping a dashboard with mock data is dramatically lower than another hour of auth debugging. The mock data is realistic enough that the UX can be validated, and the swap to live data is straightforward when the auth works.

5. **GitHub Pages + static JSON is a perfectly valid backend for dashboards.** Sometimes the simplest architecture is the right one, especially when the data updates infrequently (3 posts/week is not real-time).