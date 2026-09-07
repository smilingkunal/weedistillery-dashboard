#!/usr/bin/env python3
"""
Generate weekly/monthly progress reports from tracking data.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

def load_json(path):
    """Safely load JSON file"""
    p = Path(path)
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return {}

def calculate_progress():
    """Calculate current progress vs targets"""
    baseline = load_json("metrics/baseline.json")
    pages = load_json("metrics/pages-tracker.json")
    citations = load_json("metrics/citations-tracker.json")
    backlinks = load_json("metrics/backlinks-tracker.json")

    # Count published pages
    published = sum(1 for p in pages.get("pages", []) if p.get("status") in ["published", "indexed", "ranking"])
    ready = sum(1 for p in pages.get("pages", []) if p.get("status") == "ready_to_publish")

    # Count citations
    submitted = citations.get("submitted", 0)
    approved = citations.get("approved", 0)
    pending = citations.get("pending", 0)

    # Backlinks
    new_backlinks = len(backlinks.get("new_backlinks_log", []))

    # Calculate progress percentages
    targets = baseline.get("targets_day_90", {})
    progress = {
        "pages": {
            "published": published,
            "ready": ready,
            "target": targets.get("pseo_pages_published_total", 37),
            "percent": round((published / max(targets.get("pseo_pages_published_total", 37), 1)) * 100, 1)
        },
        "citations": {
            "submitted": submitted,
            "approved": approved,
            "pending": pending,
            "target": 40,
            "percent": round((submitted / 40) * 100, 1)
        },
        "backlinks": {
            "new": new_backlinks,
            "total": 743 + new_backlinks,
            "target": 1050,
            "percent": round(((743 + new_backlinks) / 1050) * 100, 1)
        }
    }

    return progress

def generate_report(period="weekly"):
    """Generate progress report"""
    progress = calculate_progress()
    today = datetime.now().strftime("%Y-%m-%d")

    report = f"""# {period.title()} Progress Report
**Generated:** {today}

## 📊 Current Progress

### Pages
- Published: **{progress['pages']['published']}** / {progress['pages']['target']} ({progress['pages']['percent']}%)
- Ready to Publish: {progress['pages']['ready']}

### Citations
- Submitted: **{progress['citations']['submitted']}** / {progress['citations']['target']} ({progress['citations']['percent']}%)
- Approved: {progress['citations']['approved']}
- Pending: {progress['citations']['pending']}

### Backlinks
- Total: **{progress['backlinks']['total']}** / {progress['backlinks']['target']} ({progress['backlinks']['percent']}%)
- New This Period: {progress['backlinks']['new']}

## 🎯 Next Actions

- Continue publishing pages per [[90-Day Master Plan]]
- Submit pending citations
- Monitor keyword rankings
- Build backlinks through guest posts
"""

    # Save report
    filename = f"metrics/{period}-report-{today}.md"
    with open(filename, 'w') as f:
        f.write(report)

    print(f"📊 {period.title()} report generated: {filename}")
    print(report)

    return report

if __name__ == "__main__":
    import sys
    period = sys.argv[1] if len(sys.argv) > 1 else "weekly"
    generate_report(period)