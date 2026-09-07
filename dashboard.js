// Weedistillery 90-Day SEO Dashboard JavaScript

// ============================================
// DATA SOURCES
// ============================================

const baselineData = {
    indexed_pages: 190,
    ranking_keywords: 209,
    authority_score: 7,
    organic_traffic_monthly: 10,
    backlinks_total: 743,
    referring_domains: 309,
    citations_count: 0
};

const targetData = {
    indexed_pages: 230,
    ranking_keywords: 700,
    authority_score: 13,
    organic_traffic_monthly: 350,
    backlinks_total: 1050,
    pages_target: 37
};

const pagesData = [
    {
        id: 1,
        url: "/weed-delivery-locations/weed-delivery-burlington/",
        title: "Burlington Cannabis Delivery",
        keyword: "cannabis delivery burlington",
        volume: 590,
        qa_score: 92,
        status: "ready_to_publish",
        week: 1
    },
    {
        id: 2,
        url: "/weed-delivery-locations/weed-delivery-oakville/",
        title: "Oakville Cannabis Delivery",
        keyword: "cannabis delivery oakville",
        volume: 720,
        qa_score: 93,
        status: "ready_to_publish",
        week: 1
    },
    {
        id: 3,
        url: "/weed-delivery-locations/weed-delivery-milton/",
        title: "Milton Cannabis Delivery",
        keyword: "cannabis delivery milton",
        volume: 290,
        qa_score: 91,
        status: "ready_to_publish",
        week: 1
    }
];

const dailyTasks = [
    {
        day: 1,
        week: 1,
        title: "Publish Burlington Cannabis Delivery page",
        meta: "Day 1 of Week 1 | 2,500 words | QA 92/100",
        priority: "high"
    },
    {
        day: 2,
        week: 1,
        title: "Publish Oakville Cannabis Delivery page",
        meta: "Day 2 of Week 1 | 2,500 words | QA 93/100",
        priority: "high"
    },
    {
        day: 3,
        week: 1,
        title: "Publish Milton Cannabis Delivery page",
        meta: "Day 3 of Week 1 | 2,500 words | QA 91/100",
        priority: "high"
    },
    {
        day: 4,
        week: 1,
        title: "Add 301 redirects + Submit to Google Search Console",
        meta: "Day 4 of Week 1 | Setup tasks",
        priority: "high"
    },
    {
        day: 5,
        week: 1,
        title: "Upload images + Submit 6 citations (Leafly, Weedmaps, etc.)",
        meta: "Day 5 of Week 1 | 15 images | 6 citations",
        priority: "medium"
    },
    {
        day: 6,
        week: 1,
        title: "Weekend review: Check indexing, validate schema",
        meta: "Day 6-7 of Week 1 | Light monitoring",
        priority: "low"
    }
];

const citationsData = [
    { platform: "Google Business Profile", da: 100, tier: 1, status: "pending" },
    { platform: "Leafly", da: 80, tier: 1, status: "pending" },
    { platform: "Weedmaps", da: 75, tier: 1, status: "pending" },
    { platform: "Yelp Canada", da: 70, tier: 1, status: "pending" },
    { platform: "Yellow Pages", da: 65, tier: 1, status: "pending" },
    { platform: "Bing Places", da: 90, tier: 1, status: "pending" },
    { platform: "CannaReviews", da: 60, tier: 2, status: "pending" },
    { platform: "Better Cannabis Bureau", da: 50, tier: 2, status: "pending" },
    { platform: "THC Canada", da: 50, tier: 2, status: "pending" },
    { platform: "PotGuide", da: 45, tier: 2, status: "pending" },
    { platform: "Wikileaf", da: 45, tier: 2, status: "pending" },
    { platform: "Cannabis.ca", da: 40, tier: 2, status: "pending" }
];

const keywordsData = [
    { keyword: "cannabis delivery burlington", volume: 590, status: "ready" },
    { keyword: "cannabis delivery oakville", volume: 720, status: "ready" },
    { keyword: "cannabis delivery milton", volume: 290, status: "ready" },
    { keyword: "weed delivery burlington", volume: 520, status: "ready" },
    { keyword: "weed delivery oakville", volume: 680, status: "ready" },
    { keyword: "weed delivery milton", volume: 480, status: "ready" },
    { keyword: "same day cannabis delivery burlington", volume: 170, status: "ready" },
    { keyword: "premium cannabis oakville", volume: 90, status: "ready" },
    { keyword: "marijuana delivery burlington", volume: 290, status: "ready" }
];

const weeksData = [
    { week: 1, title: "Foundation", pages: 3, status: "current", theme: "City Pages" },
    { week: 2, title: "Audits", pages: 0, status: "pending", theme: "Page Audits" },
    { week: 3, title: "City Coverage", pages: 2, status: "pending", theme: "Halton Hills + Georgetown" },
    { week: 4, title: "Brampton", pages: 5, status: "pending", theme: "Neighborhoods" },
    { week: 5, title: "Mississauga", pages: 5, status: "pending", theme: "Neighborhoods" },
    { week: 6, title: "Burlington + Oakville", pages: 4, status: "pending", theme: "Neighborhoods" },
    { week: 7, title: "Authority", pages: 4, status: "pending", theme: "Use Cases" },
    { week: 8, title: "Education", pages: 4, status: "pending", theme: "How-To" },
    { week: 9, title: "Categories", pages: 4, status: "pending", theme: "Category × Location" },
    { week: 10, title: "Best-Of", pages: 4, status: "pending", theme: "Lists" },
    { week: 11, title: "Seasonal", pages: 3, status: "pending", theme: "Holiday + Rural" },
    { week: 12, title: "Final Audit", pages: 3, status: "pending", theme: "Audit + Next 90" }
];

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderKPIs() {
    // Already set in HTML, but could update from JSON in future
    document.getElementById('current-week').textContent = '1';
    document.getElementById('current-day').textContent = '1';
    document.getElementById('progress-percent').textContent = '3';
}

function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    container.innerHTML = '';

    dailyTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';

        const priorityClass = task.priority === 'high' ? 'priority-high' :
                             task.priority === 'medium' ? 'priority-medium' : '';

        taskEl.innerHTML = `
            <div class="task-checkbox" onclick="this.classList.toggle('checked')"></div>
            <div class="task-text">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">${task.meta}</div>
            </div>
            <span class="task-badge ${priorityClass}">${task.priority.toUpperCase()}</span>
        `;
        container.appendChild(taskEl);
    });
}

function renderPagesTable() {
    const tbody = document.getElementById('pages-table-body');
    tbody.innerHTML = '';

    pagesData.forEach(page => {
        const statusClass = page.status === 'ready_to_publish' ? 'status-ready' :
                           page.status === 'published' ? 'status-published' :
                           page.status === 'indexed' ? 'status-indexed' :
                           page.status === 'ranking' ? 'status-ranking' : 'status-ready';

        const statusText = page.status === 'ready_to_publish' ? 'Ready to Publish' :
                          page.status === 'published' ? 'Published' :
                          page.status === 'indexed' ? 'Indexed' :
                          page.status === 'ranking' ? 'Ranking' : 'Ready';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${page.id}</td>
            <td><code>${page.url}</code></td>
            <td>${page.title}</td>
            <td>${page.keyword}</td>
            <td>${page.volume}/mo</td>
            <td><strong>${page.qa_score}</strong>/100</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>Week ${page.week}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderCitations() {
    const tier1List = document.getElementById('tier1-list');
    const tier2List = document.getElementById('tier2-list');

    tier1List.innerHTML = '';
    tier2List.innerHTML = '';

    citationsData.forEach(citation => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${citation.platform}</span>
            <span class="da-badge">DA ${citation.da}</span>
        `;

        if (citation.tier === 1) tier1List.appendChild(li);
        else tier2List.appendChild(li);
    });
}

function renderKeywords() {
    const grid = document.getElementById('keywords-grid');
    grid.innerHTML = '';

    keywordsData.forEach(kw => {
        const card = document.createElement('div');
        card.className = 'keyword-card';

        const positionBadge = kw.status === 'ready' ?
            '<span class="position-badge position-not-tracked">Not Tracked Yet</span>' :
            '<span class="position-badge position-tracking">Tracking</span>';

        card.innerHTML = `
            <div class="keyword-text">${kw.keyword}</div>
            <div class="keyword-volume">📊 ${kw.volume}/mo</div>
            <div class="keyword-position">
                ${positionBadge}
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderWeeks() {
    const grid = document.getElementById('week-grid');
    grid.innerHTML = '';

    weeksData.forEach(week => {
        const card = document.createElement('div');
        const statusClass = week.status === 'current' ? 'current' :
                           week.status === 'completed' ? 'completed' : '';

        const statusBadge = week.status === 'current' ?
            '<span class="week-status status-current">CURRENT</span>' :
            week.status === 'completed' ?
            '<span class="week-status status-done">✓ DONE</span>' :
            '<span class="week-status status-pending">PENDING</span>';

        card.className = `week-card ${statusClass}`;
        card.innerHTML = `
            <div class="week-number">Week ${week.week}</div>
            <div class="week-title">${week.title}</div>
            <div class="week-pages">+${week.pages} pages • ${week.theme}</div>
            ${statusBadge}
        `;
        grid.appendChild(card);
    });
}

function renderAll() {
    renderKPIs();
    renderDailyTasks();
    renderPagesTable();
    renderCitations();
    renderKeywords();
    renderWeeks();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    console.log('🌿 Weedistillery 90-Day SEO Dashboard Loaded');
    console.log('📊 Current: Day 1 of Week 1 | Target: 37 pages in 90 days');
});