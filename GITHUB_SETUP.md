# GitHub Setup Guide — Deploy in 5 Minutes

This guide walks you through deploying the Weedistillery 90-Day SEO Dashboard to GitHub Pages.

---

## 🎯 What You'll Get

After completing these steps:
- ✅ Dashboard live at `https://YOUR-USERNAME.github.io/weedistillery-90-day-seo`
- ✅ Auto-deploys on every `git push`
- ✅ GitHub Actions runs daily updates
- ✅ Free hosting forever
- ✅ Version control for all tracking data

---

## 📋 Prerequisites

- [x] GitHub account (free): https://github.com/signup
- [x] Git installed (you have this — verified)
- [x] Project files ready at `C:\Users\kunal\projects\weedistillery-90-day-seo\`

---

## 🚀 Step-by-Step Setup

### **Step 1: Create GitHub Repository** (2 minutes)

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `weedistillery-90-day-seo`
   - **Description:** "90-Day Programmatic SEO Dashboard for Weedistillery"
   - **Visibility:** Public (required for free GitHub Pages)
   - ⚠️ **DO NOT** initialize with README, .gitignore, or license (we have these)
3. Click **"Create repository"**
4. Copy the repository URL (looks like: `https://github.com/YOUR-USERNAME/weedistillery-90-day-seo.git`)

---

### **Step 2: Connect Local Repo to GitHub** (1 minute)

Open PowerShell or Git Bash and run these commands:

```bash
cd "C:\Users\kunal\projects\weedistillery-90-day-seo"

# Add GitHub as remote origin
git remote add origin https://github.com/YOUR-USERNAME/weedistillery-90-day-seo.git

# Rename branch to 'main' (GitHub standard)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR-USERNAME`** with your actual GitHub username.

If prompted for credentials:
- Username: your GitHub username
- Password: your **Personal Access Token** (NOT your GitHub password)

**To create a Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "Dashboard Deploy"
4. Expiration: 90 days (or No expiration)
5. Scopes: Check **`repo`** (full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)
8. Use this token as your password when pushing

---

### **Step 3: Enable GitHub Pages** (1 minute)

1. Go to your repo: `https://github.com/YOUR-USERNAME/weedistillery-90-day-seo`
2. Click **Settings** (top right)
3. Scroll down to **"Pages"** section (left sidebar)
4. Under **"Source"**:
   - Select: **"Deploy from a branch"**
   - Branch: **`main`**
   - Folder: **`/ (root)`**
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

---

### **Step 4: Access Your Dashboard** (30 seconds)

After deployment completes:

🌐 **Your dashboard is live at:**
```
https://YOUR-USERNAME.github.io/weedistillery-90-day-seo
```

You can also find it at:
- Repo → Settings → Pages → "Your site is live at..."

---

## 🔄 Daily Workflow After Setup

### **When you complete tasks:**

1. **Edit tracking files:**
   ```bash
   cd "C:\Users\kunal\projects\weedistillery-90-day-seo"
   notepad metrics\daily-log.json
   notepad metrics\pages-tracker.json
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Day 1: Burlington page published"
   git push
   ```

3. **Dashboard auto-updates within 1-2 minutes** ✨

---

## 🤖 GitHub Actions (Already Configured)

The workflow at `.github/workflows/daily-check.yml` will:

- ✅ Run daily at 6 AM UTC
- ✅ Check if pages are live (HTTP 200)
- ✅ Update `metrics/pages-tracker.json`
- ✅ Generate weekly reports
- ✅ Commit updates automatically
- ✅ Trigger redeployment

**To enable Actions:**
1. Go to repo → Actions tab
2. If prompted, click "I understand my workflows, enable them"

---

## 🔒 Optional: Add Custom Domain (kunaldahiya.me)

If you want to use `kunaldahiya.me/weedistillery-90-day-seo`:

### **In your repo:**
1. Create a file named `CNAME` (no extension) in the repo root
2. Add this content:
   ```
   weedistillery-90-day-seo.kunaldahiya.me
   ```
3. Commit and push

### **In your DNS (Namecheap or wherever kunaldahiya.me is managed):**
1. Add a CNAME record:
   - **Host:** `weedistillery-90-day-seo`
   - **Value:** `YOUR-USERNAME.github.io`
   - **TTL:** Automatic

### **In GitHub repo Settings → Pages:**
1. Under "Custom domain", enter: `weedistillery-90-day-seo.kunaldahiya.me`
2. Click "Save"
3. Wait for DNS check (can take 24-48 hours)

**Result:** `https://weedistillery-90-day-seo.kunaldahiya.me`

---

## 🐛 Troubleshooting

### **"Permission denied" when pushing**
- You need a Personal Access Token, not your GitHub password
- Create one: https://github.com/settings/tokens
- Use the token as your password

### **"Repository not found"**
- Check the URL — make sure username and repo name are correct
- Make sure the repo exists and is Public

### **Dashboard shows 404**
- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages shows "Your site is live"
- Verify the branch is `main` and folder is `/ (root)`

### **GitHub Actions not running**
- Go to Actions tab
- Check if workflow is enabled
- Look for error messages in workflow runs

### **Dashboard not updating after push**
- Wait 1-2 minutes for GitHub Pages to rebuild
- Check Actions tab for build status
- Hard refresh browser (Ctrl+Shift+R)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Repo exists at `https://github.com/YOUR-USERNAME/weedistillery-90-day-seo`
- [ ] All 25 files are visible in the repo
- [ ] Settings → Pages shows "Your site is live at..."
- [ ] Dashboard loads at `https://YOUR-USERNAME.github.io/weedistillery-90-day-seo`
- [ ] Dashboard shows all sections (KPIs, tasks, pages, citations)
- [ ] GitHub Actions workflow is enabled
- [ ] First commit was successful

---

## 🎉 You're Done!

Your dashboard is now:
- 🌐 Live on the internet
- 🔄 Auto-updating daily
- 📊 Tracking all metrics
- 🚀 Ready for your 90-day SEO journey

**Share your dashboard URL and start publishing!** 🚀

---

**Tags:** #github #deployment #setup #pages

**Related:**
- [[README]] - Project overview
- [[DEPLOYMENT]] - Deployment options
- [[metrics/]] - Tracking data