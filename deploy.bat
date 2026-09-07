@echo off
REM Quick deploy script for Weedistillery 90-Day SEO Dashboard
REM Usage: deploy.bat

echo.
echo ============================================
echo   Weedistillery 90-Day SEO Dashboard
echo   Quick Deploy Script
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Navigate to project directory
cd /d "C:\Users\kunal\projects\weedistillery-90-day-seo"

echo Current directory: %CD%
echo.

REM Check git status
echo Checking for changes...
git status --short
echo.

REM Ask for commit message
set /p commitmsg="Enter commit message (or press Enter for default): "
if "%commitmsg%"=="" set commitmsg=Update dashboard metrics

REM Add all changes
echo.
echo Adding files...
git add .

REM Commit
echo Committing changes...
git commit -m "%commitmsg%" 2>nul
if errorlevel 1 (
    echo No changes to commit
) else (
    echo Committed successfully
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================
    echo   First-Time Setup Required
    echo ============================================
    echo.
    echo You need to add your GitHub repository as a remote.
    echo.
    echo Steps:
    echo 1. Go to https://github.com/new
    echo 2. Create repo: weedistillery-90-day-seo
    echo 3. Copy the repo URL
    echo 4. Run this command (replace YOUR-USERNAME):
    echo    git remote add origin https://github.com/YOUR-USERNAME/weedistillery-90-day-seo.git
    echo 5. Run deploy.bat again
    echo.
    pause
    exit /b 1
)

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Push Failed
    echo ============================================
    echo.
    echo Common issues:
    echo 1. Authentication failed - use Personal Access Token, not password
    echo    Get token: https://github.com/settings/tokens
    echo 2. Remote not set - run setup steps above
    echo 3. No internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Deploy Successful!
echo ============================================
echo.
echo Your dashboard will update at:
echo https://YOUR-USERNAME.github.io/weedistillery-90-day-seo
echo.
echo (Wait 1-2 minutes for GitHub Pages to rebuild)
echo.

pause