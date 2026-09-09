# Weedistillery 90-Day SEO Dashboard

> **Live dashboard for tracking Programmatic SEO execution, day-by-day tasks, citations, backlinks, and metrics.**

[![Status](https://img.shields.io/badge/Status-Day%201-green)]()
[![Week](https://img.shields.io/badge/Week-1%20of%2012-blue)]()
[![Pages](https://img.shields.io/badge/Pages-3%20Published-success)]()
[![Citations](https://img.shields.io/badge/Citations-6%20Pending-yellow)]()

## 🎯 90-Day Goal Overview

| Metric | Day 0 | Day 90 Target |
|---|---|---|
| **Total pSEO Pages** | 0 new (3 ready) | **35-40** |
| **Indexed URLs** | ~190 | **~230** |
| **Ranking Keywords** | 209 | **600-800** |
| **Authority Score** | 7 | **12-15** |
| **Organic Traffic** | 10/mo | **200-500/mo** |
| **Backlinks** | 743 | **900-1,200** |
| **Citations** | 0 | **30-50** |
| **AI Citations** | 0 | **5-15** |

---

## 📊 Current Status: Week 1, Day 1

**Progress:** 0/3 pages published (3 ready to publish)

### **Live Tracking Dashboard:**

🌐 **[View Interactive Dashboard →](https://kunaldahiya.me/weedistillery-90-day-seo)** *(deployed via GitHub Pages)*

The dashboard auto-updates from:
- `metrics/daily-log.json` - Daily task completion
- `metrics/weekly-progress.json` - Weekly KPIs
- `metrics/citations-tracker.json` - Citation status
- `metrics/keyword-rankings.json` - Keyword positions
- `metrics/backlinks-tracker.json` - Backlink profile

---

## 📂 Repository Structure

```
weedistillery-90-day-seo/
├── README.md                          # This file
├── docs/
│   ├── 90-day-master-plan.md         # Full roadmap
│   ├── page-templates.md              # Reusable templates
│   ├── keyword-research.md           # Keyword database
│   └── backlink-strategy.md          # Citation + backlink plan
├── content-to-publish/                # Ready-to-publish content
│   └── week1/
│       ├── Day1-Burlington.md        # Burlington page
│       ├── Day2-Oakville.md          # Oakville page
│       ├── Day3-Milton.md            # Milton page
│       └── ...
├── metrics/                          # Tracking data (JSON)
│   ├── daily-log.json               # Daily task completion
│   ├── weekly-progress.json          # Weekly KPIs
│   ├── citations-tracker.json        # Citation submissions
│   ├── keyword-rankings.json         # Keyword positions
│   ├── backlinks-tracker.json        # Backlink profile
│   └── baseline.json                 # Day 0 baseline metrics
├── scripts/                          # Automation scripts
│   ├── check-pages.py               # Verify pages live
│   ├── update-rankings.py           # Fetch keyword data
│   └── generate-report.py           # Weekly reports
└── .github/
    └── workflows/
        └── daily-check.yml           # Automated daily checks
```

---

## 🚀 Quick Start

### **View the Dashboard:**

1. **Live Site:** [kunaldahiya.me/weedistillery-90-day-seo](https://kunaldahiya.me/weedistillery-90-day-seo)
2. **GitHub Pages:** Will auto-deploy from `main` branch

### **Update Tracking Data:**

Edit the JSON files in `/metrics/` directory:

```bash
# After completing a task today
vim metrics/daily-log.json

# Update weekly progress (Fridays)
vim metrics/weekly-progress.json

# Add new citation submission
vim metrics/citations-tracker.json
```

The dashboard auto-rebuilds when you push to GitHub.

---

## 📋 How to Use This Dashboard

### **Daily Workflow:**

1. **Morning (9 AM):** Check dashboard for today's tasks
2. **During Day:** Complete tasks from `content-to-publish/week1/DayX-*.md`
3. **Evening:** Update `metrics/daily-log.json` with what you completed
4. **Push to GitHub:** `git add . && git commit -m "Day X complete" && git push`

### **Weekly Workflow:**

1. **Friday:** Update `metrics/weekly-progress.json` with week's metrics
2. **Friday:** Run `./scripts/generate-report.py` to create weekly summary
3. **Monday:** Review report, plan next week

### **Monthly Workflow:**

1. **First of Month:** Update `metrics/baseline.json` vs `metrics/current.json`
2. **Generate monthly report:** `./scripts/generate-report.py --monthly`
3. **Adjust strategy** based on results

---

## 🎯 Week 1 Tasks (Current)

### **Day 1 (Monday) - Burlington**
- [ ] Publish Burlington page
- [ ] Add LocalBusiness schema
- [ ] Add 5 images
- [ ] Submit to Google Search Console

### **Day 2 (Tuesday) - Oakville**
- [ ] Publish Oakville page
- [ ] Add LocalBusiness schema
- [ ] Add 5 images
- [ ] Submit to GSC

### **Day 3 (Wednesday) - Milton**
- [ ] Publish Milton page
- [ ] Add LocalBusiness schema
- [ ] Add 5 images
- [ ] Submit to GSC

### **Day 4 (Thursday) - Setup**
- [ ] Add 301 redirects
- [ ] Set up rank tracking
- [ ] Document baseline metrics

### **Day 5 (Friday) - Images & Citations**
- [ ] Optimize all 15 images
- [ ] Submit to Leafly, Weedmaps, CannaReviews
- [ ] Submit to Yelp, Yellow Pages
- [ ] Create Google Business Profile

### **Day 6-7 (Weekend) - Review**
- [ ] Check indexing progress
- [ ] Validate schema
- [ ] Check citation approvals
- [ ] Plan Week 2

---

## 📊 Live Metrics (Auto-Updated)

*Dashboard auto-refreshes every 6 hours via GitHub Actions*

### **Traffic (Last 7 Days)**
- Organic Sessions: Loading from `metrics/daily-log.json`...
- Bounce Rate: Loading...
- Avg Position: Loading...

### **Indexing Status**
- Total Indexed: Loading from Search Console API...
- New This Week: Loading...
- Coverage Issues: Loading...

### **Citations**
- Submitted: Loading from `metrics/citations-tracker.json`...
- Approved: Loading...
- Pending: Loading...

### **Keywords**
- Ranking: Loading from `metrics/keyword-rankings.json`...
- Top 10: Loading...
- Page 1: Loading...

---

## 🔗 Related Resources

- **Obsidian Vault:** `C:\Users\kunal\obsidian\vault\Weedistillery 90 Day SEO\`
- **Content Files:** `/content-to-publish/week1/`
- **Live Site:** https://weedistillery.com/
- **Google Search Console:** https://search.google.com/search-console/

---

## 📞 Support

For questions about this dashboard or the 90-day plan:
- Open an issue: [GitHub Issues](../../issues)
- Check docs: [/docs/](/docs/)
- Review weekly summaries: [/metrics/](/metrics/)

---

## 📝 License

Internal use only - Weedistillery SEO Project © 2026

---

**Last Updated:** 2026-09-07
**Current Day:** Day 1 of Week 1
**Next Review:** 2026-09-14 (End of Week 1)