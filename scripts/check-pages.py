#!/usr/bin/env python3
"""
Check if published pages are live and accessible.
Updates metrics/pages-tracker.json
"""

import json
import requests
from datetime import datetime
from pathlib import Path

PAGES_TO_CHECK = [
    {
        "id": 1,
        "url": "https://weedistillery.com/weed-delivery-locations/weed-delivery-burlington/",
        "title": "Burlington Cannabis Delivery"
    },
    {
        "id": 2,
        "url": "https://weedistillery.com/weed-delivery-locations/weed-delivery-oakville/",
        "title": "Oakville Cannabis Delivery"
    },
    {
        "id": 3,
        "url": "https://weedistillery.com/weed-delivery-locations/weed-delivery-milton/",
        "title": "Milton Cannabis Delivery"
    }
]

def check_page_status(url):
    """Check if page is live (HTTP 200)"""
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        return {
            "live": response.status_code == 200,
            "status_code": response.status_code,
            "final_url": response.url,
            "response_time": response.elapsed.total_seconds()
        }
    except Exception as e:
        return {
            "live": False,
            "error": str(e)
        }

def main():
    print("🔍 Checking page status...")

    results = []
    for page in PAGES_TO_CHECK:
        status = check_page_status(page["url"])
        status["id"] = page["id"]
        status["title"] = page["title"]
        status["url"] = page["url"]
        status["checked_at"] = datetime.now().isoformat()

        if status["live"]:
            print(f"✅ {page['title']}: Live (HTTP {status['status_code']}) - {status['response_time']:.2f}s")
        else:
            print(f"❌ {page['title']}: Not live - {status.get('error', 'Unknown error')}")

        results.append(status)

    # Update pages-tracker.json
    tracker_path = Path("metrics/pages-tracker.json")
    if tracker_path.exists():
        with open(tracker_path) as f:
            tracker = json.load(f)

        for result in results:
            for page in tracker.get("pages", []):
                if page["id"] == result["id"] and result["live"]:
                    page["status"] = "published"
                    if not page.get("publish_date"):
                        page["publish_date"] = datetime.now().isoformat()

        with open(tracker_path, 'w') as f:
            json.dump(tracker, f, indent=2)
        print(f"\n✅ Updated {tracker_path}")

    # Save check results
    output_path = Path("metrics/page-check-results.json")
    with open(output_path, 'w') as f:
        json.dump({"checked_at": datetime.now().isoformat(), "results": results}, f, indent=2)

    print(f"\n📊 Results saved to {output_path}")

if __name__ == "__main__":
    main()