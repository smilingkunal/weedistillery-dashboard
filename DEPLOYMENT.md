# Deployment Guide for kunaldahiya.me

This dashboard can be deployed in two ways:
1. **GitHub Pages** (free, recommended) — `https://YOUR-USERNAME.github.io/weedistillery-90-day-seo`
2. **Custom domain** on kunaldahiya.me — `https://kunaldahiya.me/weedistillery-90-day-seo`

---

## 🚀 Option 1: GitHub Pages Deployment (Automatic)

### Setup (One-Time):

1. **Create GitHub Repository:**
   ```bash
   cd "C:\Users\kunal\projects\weedistillery-90-day-seo"
   git init
   git add .
   git commit -m "Initial commit: 90-day SEO dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/weedistillery-90-day-seo.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: `main` branch
   - Folder: `/ (root)`
   - Save

3. **Auto-Deploy:**
   - Every push to `main` triggers deployment
   - GitHub Actions workflow (already created) runs daily updates
   - Dashboard live at: `https://YOUR-USERNAME.github.io/weedistillery-90-day-seo`

### Custom Domain (Optional):

If you want it on `kunaldahiya.me`:

1. **Add CNAME file:**
   ```bash
   echo "kunaldahiya.me/weedistillery-90-day-seo" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS at Namecheap:**
   - Add CNAME record: `weedistillery-90-day-seo` → `YOUR-USERNAME.github.io`

---

## 🚀 Option 2: Direct Deployment to kunaldahiya.me

### Setup (One-Time):

1. **Access your server:**
   ```bash
   ssh kunal@kunaldahiya.me
   ```

2. **Create deployment directory:**
   ```bash
   mkdir -p ~/public_html/weedistillery-90-day-seo
   cd ~/public_html/weedistillery-90-day-seo
   ```

3. **Clone or upload repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/weedistillery-90-day-seo.git .
   ```

4. **Set up auto-updates (cron job):**
   ```bash
   crontab -e
   # Add this line:
   0 6 * * * cd ~/public_html/weedistillery-90-day-seo && git pull origin main
   ```

5. **Dashboard live at:** `https://kunaldahiya.me/weedistillery-90-day-seo`

---

## 📊 Dashboard Features

The deployed dashboard includes:

- ✅ **KPI Cards** — Pages, traffic, keywords, authority, backlinks
- ✅ **Daily Tasks Checklist** — Interactive task completion
- ✅ **Pages Tracking Table** — All 37+ pSEO pages with status
- ✅ **Citations Tracker** — 20+ citation submissions
- ✅ **Keywords Grid** — Target keywords with search volumes
- ✅ **12-Week Roadmap** — Visual progress through phases
- ✅ **Backlink Profile** — Acquisition tracking
- ✅ **Real-time Updates** — Auto-refresh from GitHub Actions

---

## 🔄 Auto-Update Flow

```
You update metrics/daily-log.json
         ↓
Git push to GitHub
         ↓
GitHub Actions triggers (daily-check.yml)
         ↓
Runs scripts/check-pages.py
         ↓
Runs scripts/generate-report.py
         ↓
Commits updated metrics
         ↓
Deploys to GitHub Pages
         ↓
Dashboard auto-updates
```

---

## 📁 File Structure

```
weedistillery-90-day-seo/
├── index.html              ← Main dashboard
├── styles.css              ← Dashboard styles
├── dashboard.js            ← Dashboard logic
├── README.md               ← Project overview
├── docs/                   ← Documentation
│   ├── 90-day-master-plan.md
│   ├── page-templates.md
│   ├── keyword-research.md
│   └── backlink-strategy.md
├── metrics/                ← Tracking data (JSON)
│   ├── baseline.json
│   ├── daily-log.json
│   ├── weekly-progress.json
│   ├── pages-tracker.json
│   ├── citations-tracker.json
│   ├── keyword-rankings.json
│   └── backlinks-tracker.json
├── content-to-publish/    ← Ready-to-publish content
│   └── week1/
│       ├── Day1-Burlington.md
│       ├── Day2-Oakville.md
│       ├── Day3-Milton.md
│       ├── Day4-Setup-Tasks.md
│       ├── Day5-Images-Citations.md
│       └── Day6-7-Weekend-Review.md
├── scripts/                ← Automation
│   ├── check-pages.py
│   └── generate-report.py
└── .github/
    └── workflows/
        └── daily-check.yml  ← Auto-update workflow
```

---

## 🚀 Quick Start Commands

```bash
# After publishing Burlington page:
# 1. Update metrics/pages-tracker.json
# 2. Update metrics/daily-log.json
# 3. Commit and push:
git add metrics/
git commit -m "Day 1: Burlington page published"
git push origin main

# Dashboard auto-updates within 1-2 minutes
```

---

## 📞 Troubleshooting

### Dashboard Not Updating?
- Check GitHub Actions tab for failed runs
- Verify metrics JSON files are valid
- Ensure no syntax errors in dashboard.js

### Custom Domain Not Working?
- DNS propagation takes 24-48 hours
- Verify CNAME record points correctly
- Check GitHub Pages custom domain settings

### Data Not Loading?
- Open browser console (F12) for errors
- Verify JSON files are valid (use jsonlint.com)
- Check file paths in dashboard.js

---

**Status:** Ready to deploy ✅
**Deployment Options:** GitHub Pages (recommended) or kunaldahiya.me
**Auto-Updates:** GitHub Actions runs daily at 6 AM UTC

**Related:**
- [[README]] - Project overview
- [[scripts/]] - Automation scripts
- [[.github/workflows/]] - Auto-update workflow