# Google Search Console API Integration

This folder contains the Google Apps Script backend that powers real-time GSC data in the dashboard.

## 🎯 What This Does

Connects your Google Search Console property to the dashboard and automatically:

- ✅ Fetches daily performance data (clicks, impressions, CTR, position)
- ✅ Pulls top search queries (with clicks, position, CTR)
- ✅ Pulls top performing pages
- ✅ Shows device breakdown (desktop/mobile/tablet)
- ✅ Shows country distribution
- ✅ Reports sitemap submission status
- ✅ URL Inspection status (indexing verdict)
- ✅ Refreshes every 6 hours automatically

## 📋 Setup Instructions (5-Step Process)

### **Step 1: Create Apps Script Project**

1. Go to [https://script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Name it: **"Weedistillery SEO Dashboard"**
4. Click **"Untitled project"** at top → rename

### **Step 2: Add the Code**

1. Delete any default code in `Code.gs`
2. Copy the entire contents of `Code.gs` from this folder
3. Paste into the Apps Script editor
4. Press **Ctrl+S** to save

### **Step 3: Add OAuth Scope**

1. Click **⚙️ Project Settings** (left sidebar)
2. Scroll to **"Scopes"** section (or click "Show manifest" if needed)
3. Ensure these scopes are in the manifest:
   ```json
   {
     "oauthScopes": [
       "https://www.googleapis.com/auth/webmasters.readonly",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/script.send_mail",
       "https://www.googleapis.com/auth/drive"
     ]
   }
   ```
4. If you edited the manifest directly, save and reload

### **Step 4: Enable Google Search Console API Service**

1. In Apps Script editor, click **"+" → "Service"** (left sidebar)
2. Find **"Google Search Console API"**
3. Click **"Add"**
4. Verify it appears in the Services list

### **Step 5: Setup Functions (Run Once)**

You need to run these three setup functions manually **once**. Each will prompt for permissions the first time.

#### **a) Create the spreadsheet:**
1. Select `setupSpreadsheet` from function dropdown
2. Click **▶ Run**
3. Authorize when prompted
4. Copy the spreadsheet URL from execution logs

#### **b) Initial backfill (fetch 90 days of data):**
1. Select `initialBackfill` from function dropdown
2. Click **▶ Run**
3. Wait 2–5 minutes for completion
4. Check execution logs for status

#### **c) Set up auto-refresh trigger:**
1. Select `setupTriggers` from function dropdown
2. Click **▶ Run**
3. Triggers now run every 6 hours automatically

### **Step 6: Deploy as Web App**

1. Click **Deploy → New Deployment**
2. Click **⚙️ gear icon** → Select **"Web app"**
3. Configure:
   - **Description:** "Weedistillery SEO Dashboard API"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone (or "Anyone with Google account" for slight security)
4. Click **Deploy**
5. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/xxxxx/exec`)

### **Step 7: Connect Dashboard**

1. Open `data/gsc-config.json` in your project
2. Replace `"apiEndpoint": ""` with your Web App URL:
   ```json
   {
     "config": {
       "apiEndpoint": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
       "enabled": true
     }
   }
   ```
3. Save the file
4. Commit and push to GitHub:
   ```bash
   git add data/gsc-config.json
   git commit -m "Configure GSC API endpoint"
   git push
   ```
5. Dashboard now uses live GSC data

---

## 📊 What Data Gets Pulled

| **Data Type** | **Source** | **Refresh** |
|---|---|---|
| **Performance** (daily clicks/impressions/CTR/position) | GSC Search Analytics API | Every 6 hours |
| **Top Queries** (search terms bringing traffic) | GSC API | Every 6 hours |
| **Top Pages** (URLs with most clicks) | GSC API | Every 6 hours |
| **Countries** (where visitors come from) | GSC API with country dimension | Every 6 hours |
| **Devices** (desktop/mobile/tablet breakdown) | GSC API with device dimension | Every 6 hours |
| **Search Appearance** (regular results vs AMP vs Featured Snippets) | GSC API | Every 6 hours |
| **Position Distribution** (how many keywords rank in each bucket) | Custom aggregation | Every 6 hours |
| **URL Inspection** (indexing status of homepage) | GSC URL Inspection API | Every 6 hours |
| **Sitemap Status** (submission errors/warnings) | GSC Sitemaps API | Every 6 hours |

---

## 🔍 APIs Used

### **Google Search Console API** (Primary)
- **searchanalytics.query** — Performance, queries, pages, countries, devices
- **urlInspection.index.inspect** — URL index status
- **sitemaps.list** — Sitemap health

### **Google Sheets API** (Storage)
- Stores all data in structured format
- Acts as JSON API for dashboard
- Auto-formatted with headers

### **Apps Script Services**
- **DriveApp** — Create/find spreadsheet
- **SpreadsheetApp** — Write data to sheets
- **MailApp** — Error notifications
- **PropertiesService** — Store config (spreadsheet ID, site URL)

---

## 🛠️ Troubleshooting

### **"Authorization required" error**
- Run the setup function manually first
- Grant all requested permissions
- Apps Script needs OAuth approval for GSC API access

### **"Insufficient permissions" from GSC API**
- Verify your Google account has access to the GSC property
- Go to [Search Console](https://search.google.com/search-console) and confirm ownership
- Re-run `initialBackfill` after granting access

### **"Daily quota exceeded" error**
- GSC API allows ~200 requests/day for free
- Your setup uses 9 API calls per refresh (every 6 hours = 36/day)
- Well within quota limits

### **Spreadsheet not appearing**
- Check Drive at [drive.google.com](https://drive.google.com)
- Search for "Weedistillery SEO Dashboard Data"
- Run `setupSpreadsheet()` again if missing

### **Dashboard still shows mock data**
- Verify `data/gsc-config.json` has correct API endpoint
- Make sure `"enabled": true`
- Hard refresh dashboard (Ctrl + Shift + R)
- Check browser console (F12) for errors

---

## 📊 Data Structure

### Spreadsheet Tabs Created:

1. **Performance** — Daily metrics (date, clicks, impressions, CTR, position)
2. **Queries** — Top search queries
3. **Pages** — Top URLs
4. **Countries** — Traffic by country
5. **Devices** — Device breakdown
6. **SearchAppearance** — Search feature types
7. **PositionDistribution** — Keyword position buckets
8. **CrawlStats** — Google crawl data (if available)
9. **Sitemaps** — Sitemap submission status
10. **Inspection** — URL inspection results
11. **Config** — Internal configuration

---

## 🔄 Refresh Schedule

| **Trigger** | **Frequency** | **Function Called** |
|---|---|---|
| Time-based | Every 6 hours | `refreshAllData()` |
| Manual | On-demand | Run `refreshAllData()` from editor |

---

## 🆓 Cost

$0 — Google Apps Script is free, GSC API is free, Sheets storage is free (15GB limit, well above usage).

---

## 📞 Support

For issues:
1. Check Apps Script execution logs (View → Logs)
2. Verify spreadsheet exists in Drive
3. Check browser console (F12) on dashboard
4. Review `data/gsc-config.json` settings

---

**Status:** ✅ Complete - Setup takes ~15 minutes
**Auto-refresh:** Every 6 hours
**Cost:** Free forever
