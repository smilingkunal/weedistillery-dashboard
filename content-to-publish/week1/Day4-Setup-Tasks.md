# Day 4: Setup Tasks — Redirects, GSC, Rank Tracking

**Date:** September 11, 2026 (Day 4 of Week 1)
**Focus:** Technical setup and monitoring configuration
**Estimated Time:** 2-3 hours

---

## 🎯 TODAY'S OBJECTIVES

1. Add 301 redirects for old Burlington + Oakville URLs
2. Submit all 3 published pages to Google Search Console
3. Set up rank tracking in Semrush (or alternative)
4. Verify pages are indexing properly
5. Document baseline metrics

---

## 📋 TASK 1: Add 301 Redirects

### Why This Matters
You have 2 old URLs that currently return broken pages:
- `/weed-delivery-locations/same-day-weed-delivery-burlington/`
- `/weed-delivery-locations/oakville-weed-delivery/`

These need 301 redirects to your new canonical URLs:
- → `/weed-delivery-locations/weed-delivery-burlington/`
- → `/weed-delivery-locations/weed-delivery-oakville/`

### How to Add Redirects

#### Option A: WordPress .htaccess (Recommended)
1. Log into Cloudways → Application → File Manager
2. Navigate to `public_html/`
3. Find `.htaccess` file
4. Edit and add these lines **BEFORE** `# BEGIN WordPress`:

```apache
# BEGIN WeeDistillery Programmatic SEO Redirects
Redirect 301 /weed-delivery-locations/same-day-weed-delivery-burlington/ https://weedistillery.com/weed-delivery-locations/weed-delivery-burlington/
Redirect 301 /weed-delivery-locations/oakville-weed-delivery/ https://weedistillery.com/weed-delivery-locations/weed-delivery-oakville/
# END WeeDistillery Programmatic SEO Redirects
```

5. Save the file

#### Option B: WordPress Redirection Plugin (Easier)
1. WP Admin → Plugins → Add New
2. Search "Redirection" by John Godley
3. Install + Activate
4. Go to Tools → Redirection
5. Add New Redirect:
   - Source URL: `/weed-delivery-locations/same-day-weed-delivery-burlington/`
   - Target URL: `/weed-delivery-locations/weed-delivery-burlington/`
   - Type: 301 Redirect
6. Repeat for Oakville redirect
7. Save

### Verification
After adding redirects, test in browser:
- Visit: `https://weedistillery.com/weed-delivery-locations/same-day-weed-delivery-burlington/`
- Should redirect to: `https://weedistillery.com/weed-delivery-locations/weed-delivery-burlington/`
- Browser should show the new page

Or via terminal/curl:
```bash
curl -I https://weedistillery.com/weed-delivery-locations/same-day-weed-delivery-burlington/
```
Should return: `HTTP/1.1 301 Moved Permanently` with Location header pointing to new URL.

### Checklist
- [ ] Redirect for Burlington old URL added
- [ ] Redirect for Oakville old URL added
- [ ] Tested Burlington redirect in browser
- [ ] Tested Oakville redirect in browser
- [ ] Verified with curl (HTTP 301 response)
- [ ] Documented in WordPress admin notes

---

## 📋 TASK 2: Submit Pages to Google Search Console

### Why This Matters
Google needs to know your new pages exist. Submitting URLs in Search Console:
- Speeds up indexing (can take 1-3 days instead of 2-4 weeks)
- Helps you monitor indexing status
- Provides data on search performance

### How to Submit

1. Log into Google Search Console (`https://search.google.com/search-console/`)
2. Select your property: `weedistillery.com`
3. Go to **URL Inspection** (top search bar)
4. For each URL, paste and press Enter:
   - `https://weedistillery.com/weed-delivery-locations/weed-delivery-burlington/`
   - `https://weedistillery.com/weed-delivery-locations/weed-delivery-oakville/`
   - `https://weedistillery.com/weed-delivery-locations/weed-delivery-milton/`
5. Click **"Request Indexing"** for each URL
6. Wait for confirmation (usually 1-2 minutes)

### Also Submit Sitemap
1. In Search Console → **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Verify it shows "Success"

### Expected Timeline
- **Day 1-2:** Crawl requested
- **Day 3-7:** First crawl happens
- **Day 7-14:** Indexed and appearing in search results

### Checklist
- [ ] Burlington URL submitted
- [ ] Oakville URL submitted
- [ ] Milton URL submitted
- [ ] Sitemap.xml submitted
- [ ] Indexing requests confirmed
- [ ] Documented submission dates

---

## 📋 TASK 3: Set Up Rank Tracking

### Why This Matters
You need to track keyword rankings to measure pSEO success. Without tracking, you're flying blind.

### Option A: Semrush (Recommended - You Already Have It)
1. Log into Semrush
2. Go to **Position Tracking** → **Add Tracking**
3. Enter domain: `weedistillery.com`
4. Add keywords to track:
   - cannabis delivery burlington
   - cannabis delivery oakville
   - cannabis delivery milton
   - weed delivery burlington
   - weed delivery oakville
   - weed delivery milton
   - same day cannabis delivery burlington
   - premium cannabis oakville
   - marijuana delivery burlington
   - cannabis delivery brampton (baseline)
5. Set location: Canada, Ontario
6. Set device: Desktop + Mobile
7. Save

### Option B: Free Alternative (If Semrush Trial Expires)
Use **Google Search Console**:
1. Go to **Performance** section
2. Filter by **Page** → filter for your new URLs
3. Track **Queries** that show impressions for your pages
4. Check **Average Position** over time

### Option C: Manual Tracking (Backup)
Create a spreadsheet:
- Column A: Keyword
- Column B: Google Search Position (manual check weekly)
- Column C: Search Volume
- Column D: Notes

### Target Keywords to Track (Week 1 Priority)
| Keyword | Current Position | Target Position | Volume |
|---|---|---|---|
| cannabis delivery burlington | ? | Page 1 (top 10) | 590/mo |
| cannabis delivery oakville | ? | Page 1 (top 10) | 720/mo |
| cannabis delivery milton | ? | Page 1 (top 10) | 290/mo |
| weed delivery burlington | ? | Page 1 (top 10) | 520/mo |
| weed delivery oakville | ? | Page 1 (top 10) | 680/mo |
| weed delivery milton | ? | Page 1 (top 10) | 480/mo |

### Checklist
- [ ] Rank tracking tool set up (Semrush or alternative)
- [ ] 9 priority keywords added to tracking
- [ ] Baseline positions recorded
- [ ] Tracking dashboard accessible
- [ ] Schedule weekly check-in set

---

## 📋 TASK 4: Verify Pages Are Indexed

### How to Check
After 3-7 days from publishing, verify Google has indexed your pages.

#### Method 1: Google Search Console
1. Go to **URL Inspection**
2. Enter each URL
3. Check if status shows "URL is on Google" or "URL is not on Google"

#### Method 2: Google Search
Search for:
```
site:weedistillery.com/weed-delivery-locations/weed-delivery-burlington
```
If the URL appears in results → indexed ✅
If no results → not indexed yet (normal in first 1-2 weeks)

#### Method 3: Search Console Coverage Report
1. Go to **Coverage** → **Valid**
2. Check if your new pages appear
3. If under "Excluded" → investigate why

### Expected Timeline
- **Day 1-3:** Crawl may happen
- **Day 3-7:** Initial indexing
- **Day 7-14:** Stable in index

### If Not Indexed After 7 Days
Check:
- [ ] robots.txt not blocking
- [ ] No `noindex` meta tag
- [ ] Canonical URL is correct
- [ ] Page is returning HTTP 200 (not 404 or 500)
- [ ] Internal links pointing to page (from hub, related pages)

### Checklist
- [ ] Checked indexing for Burlington page
- [ ] Checked indexing for Oakville page
- [ ] Checked indexing for Milton page
- [ ] Documented indexing status
- [ ] Set reminder to recheck in 3 days

---

## 📋 TASK 5: Document Baseline Metrics

### Why This Matters
You can't measure improvement without knowing where you started. Document these metrics on Day 4 so you can compare at Day 90.

### Metrics to Capture

#### Traffic Metrics (from Google Analytics)
- Total organic traffic (last 7 days)
- Organic traffic to /weed-delivery-locations/ pages
- Bounce rate on new pages
- Average session duration

#### Ranking Metrics (from Semrush)
- Authority score (baseline: 7)
- Total ranking keywords (baseline: 209)
- Organic traffic estimate (baseline: 10/mo)
- Position for top 10 keywords

#### Indexing Metrics (from Google Search Console)
- Total indexed pages (baseline: ~190)
- Pages indexed in last 7 days
- Crawl errors
- Mobile usability issues

#### Backlink Metrics (from Semrush)
- Total backlinks (baseline: 743)
- Referring domains (baseline: 309)
- New backlinks in last 7 days

### Template for Baseline Documentation

```
## Baseline Metrics — Day 4 (September 11, 2026)

### Traffic
- Organic traffic (7-day avg): [#] visits
- Organic traffic to /weed-delivery-locations/: [#] visits
- Bounce rate: [%]
- Avg session duration: [time]

### Rankings (Semrush)
- Authority score: [#]
- Total ranking keywords: [#]
- Organic traffic (monthly): [#]
- Top keyword: [keyword] — position [#]

### Indexing (GSC)
- Total indexed pages: [#]
- Pages indexed this week: [#]
- Crawl errors: [#]
- New pages indexed: Burlington [yes/no], Oakville [yes/no], Milton [yes/no]

### Backlinks (Semrush)
- Total backlinks: [#]
- Referring domains: [#]
- New backlinks this week: [#]
```

### Save This Document
Create a note in Obsidian:
```
Weedistillery 90 Day SEO/Metrics/Baseline - Day 4.md
```

### Checklist
- [ ] Traffic metrics captured
- [ ] Ranking metrics captured
- [ ] Indexing metrics captured
- [ ] Backlink metrics captured
- [ ] Baseline document saved
- [ ] Comparison date set (Day 90 = December 7, 2026)

---

## 🛠️ BONUS TASK: Set Up Uptime Monitoring

### Why
If your VPS goes down, you need to know immediately. The earlier diagnostic showed the web server (port 80/443) was closed.

### Free Tools
- **UptimeRobot** (`https://uptimerobot.com/`) - 50 monitors free
- **StatusCake** - 10 monitors free
- **Pingdom** - 1 monitor free

### Setup
1. Sign up for UptimeRobot (free)
2. Add Monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://weedistillery.com/`
   - Monitoring Interval: 5 minutes
3. Add Alert Contact (your email/SMS)
4. Save

### What This Does
- Pings your site every 5 minutes
- Emails/SMS you if site goes down
- Provides uptime reports

### Checklist
- [ ] UptimeRobot account created
- [ ] Monitor added for weedistillery.com
- [ ] Alert contact configured (email)
- [ ] Test alert sent and received

---

## 📊 DAILY SUMMARY

### Tasks Completed Today
- [ ] 301 redirects added and tested
- [ ] 3 pages submitted to Google Search Console
- [ ] Sitemap submitted to GSC
- [ ] Rank tracking configured
- [ ] Baseline metrics documented
- [ ] Uptime monitoring set up (bonus)

### Metrics Today
- Indexed pages: [from Day 4 check]
- New rankings: [track in Semrush]
- Traffic: [from Analytics]
- Backlinks gained: [from Semrush]

### Tomorrow's Plan (Day 5 - Friday)
- [ ] Start Week 2 audit of existing Brampton page
- [ ] Add LocalBusiness schema if missing
- [ ] Begin citation building (Leafly, Weedmaps)

---

## 🚨 TROUBLESHOOTING

### If Redirects Don't Work
- Check .htaccess syntax (no typos)
- Clear browser cache
- Test in incognito mode
- Verify with `curl -I` command

### If Pages Don't Index After 7 Days
- Check Google Search Console → Coverage
- Look for "Excluded" status and reason
- Verify canonical URL is correct (not pointing elsewhere)
- Check for `noindex` meta tag in page source

### If Rank Tracking Shows No Movement
- Normal! New pages take 2-4 weeks to rank
- Keep building content (Week 2 starts Monday)
- Focus on backlinks in Month 2+

---

**Status:** Setup day ✅  
**Time Investment:** 2-3 hours  
**Outcome:** 3 pages indexed, redirects working, monitoring active  

**Tags:** #day4 #week1 #setup #technical #redirects #tracking

**Related:**
- [[Day1 - Burlington Cannabis Delivery]]
- [[Day2 - Oakville Cannabis Delivery]]
- [[Day3 - Milton Cannabis Delivery]]