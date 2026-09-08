// Weedistillery 90-Day SEO Dashboard - Enhanced JavaScript

// ============================================
// DATA
// ============================================

const baselineData = {
    indexed_pages: 190,
    ranking_keywords: 209,
    authority_score: 7,
    organic_traffic_monthly: 10,
    backlinks_total: 743,
    referring_domains: 309,
    citations_count: 0,
    ai_citations: 0,
    pseo_pages_live: 0
};

const targetData = {
    indexed_pages: 230,
    ranking_keywords: 700,
    authority_score: 13,
    organic_traffic_monthly: 350,
    backlinks_total: 1050,
    pages_target: 37,
    citations_target: 40
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
        week: 1,
        file: "content-to-publish/week1/Day1-Burlington.md"
    },
    {
        id: 2,
        url: "/weed-delivery-locations/weed-delivery-oakville/",
        title: "Oakville Cannabis Delivery",
        keyword: "cannabis delivery oakville",
        volume: 720,
        qa_score: 93,
        status: "ready_to_publish",
        week: 1,
        file: "content-to-publish/week1/Day2-Oakville.md"
    },
    {
        id: 3,
        url: "/weed-delivery-locations/weed-delivery-milton/",
        title: "Milton Cannabis Delivery",
        keyword: "cannabis delivery milton",
        volume: 290,
        qa_score: 91,
        status: "ready_to_publish",
        week: 1,
        file: "content-to-publish/week1/Day3-Milton.md"
    }
];

const dailyTasks = [
    {
        day: 1,
        week: 1,
        title: "Publish Burlington Cannabis Delivery page",
        meta: "Day 1 of Week 1 · 2,500 words · QA 92/100 · 22 internal links",
        priority: "high",
        file: "content-to-publish/week1/Day1-Burlington.md"
    },
    {
        day: 2,
        week: 1,
        title: "Publish Oakville Cannabis Delivery page",
        meta: "Day 2 of Week 1 · 2,500 words · QA 93/100 · 20 internal links",
        priority: "high",
        file: "content-to-publish/week1/Day2-Oakville.md"
    },
    {
        day: 3,
        week: 1,
        title: "Publish Milton Cannabis Delivery page",
        meta: "Day 3 of Week 1 · 2,500 words · QA 91/100 · 19 internal links",
        priority: "high",
        file: "content-to-publish/week1/Day3-Milton.md"
    },
    {
        day: 4,
        week: 1,
        title: "Add 301 redirects + Submit to Google Search Console",
        meta: "Day 4 of Week 1 · Setup tasks · Estimated 2-3 hours",
        priority: "high",
        file: "content-to-publish/week1/Day4-Setup-Tasks.md"
    },
    {
        day: 5,
        week: 1,
        title: "Upload 15 images + Submit 6 citations",
        meta: "Day 5 of Week 1 · Leafly, Weedmaps, Yelp, Yellow Pages, GBP",
        priority: "medium",
        file: "content-to-publish/week1/Day5-Images-Citations.md"
    },
    {
        day: 6,
        week: 1,
        title: "Weekend review: Check indexing + validate schema",
        meta: "Day 6-7 of Week 1 · Light monitoring · Plan Week 2",
        priority: "low",
        file: "content-to-publish/week1/Day6-7-Weekend-Review.md"
    }
];

const citationsData = [
    { platform: "Google Business Profile", da: 100, tier: 1, status: "pending" },
    { platform: "Bing Places", da: 90, tier: 1, status: "pending" },
    { platform: "Leafly", da: 80, tier: 1, status: "pending" },
    { platform: "Weedmaps", da: 75, tier: 1, status: "pending" },
    { platform: "Yelp Canada", da: 70, tier: 1, status: "pending" },
    { platform: "Yellow Pages", da: 65, tier: 1, status: "pending" },
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
    { week: 1, title: "Foundation", pages: 3, status: "current", theme: "City Pages", desc: "Burlington, Oakville, Milton" },
    { week: 2, title: "Audits", pages: 0, status: "pending", theme: "Page Audits", desc: "Audit existing Brampton + Mississauga" },
    { week: 3, title: "City Coverage", pages: 2, status: "pending", theme: "Halton Hills + Georgetown", desc: "Complete 7-city coverage" },
    { week: 4, title: "Brampton", pages: 5, status: "pending", theme: "Neighborhoods", desc: "Bram East, Downtown, Springdale" },
    { week: 5, title: "Mississauga", pages: 5, status: "pending", theme: "Neighborhoods", desc: "Square One, Port Credit, etc." },
    { week: 6, title: "Burlington + Oakville", pages: 4, status: "pending", theme: "Neighborhoods", desc: "Aldershot, Tyandaga, Kerr Village" },
    { week: 7, title: "Authority", pages: 4, status: "pending", theme: "Use Cases", desc: "Best for sleep, anxiety, pain" },
    { week: 8, title: "Education", pages: 4, status: "pending", theme: "How-To", desc: "Beginners, THC vs CBD" },
    { week: 9, title: "Categories", pages: 4, status: "pending", theme: "Category × Location", desc: "Edibles Brampton, Vapes Mississauga" },
    { week: 10, title: "Best-Of", pages: 4, status: "pending", theme: "Lists", desc: "Cheap ounces, top flowers" },
    { week: 11, title: "Seasonal", pages: 3, status: "pending", theme: "Holiday + Rural", desc: "Gift guide, Milton neighborhoods" },
    { week: 12, title: "Final Audit", pages: 3, status: "pending", theme: "Audit + Plan", desc: "Final review + next 90 days" }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDAClass(da) {
    if (da >= 70) return 'high';
    if (da >= 40) return 'medium';
    return 'low';
}

function getQAClass(score) {
    if (score >= 90) return 'high';
    if (score >= 75) return 'medium';
    return 'low';
}

function getStatusBadge(status) {
    const statusMap = {
        'ready_to_publish': { class: 'status-ready', text: 'Ready' },
        'published': { class: 'status-published', text: 'Published' },
        'indexed': { class: 'status-indexed', text: 'Indexed' },
        'ranking': { class: 'status-ranking', text: 'Ranking' }
    };
    return statusMap[status] || { class: 'status-ready', text: 'Ready' };
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderHeader() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('last-updated').textContent = dateStr;
}

function renderProgressBar() {
    // Calculate progress based on days elapsed
    const startDate = new Date('2026-09-08');
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalDays = 90;
    const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

    document.getElementById('progress-bar-percent').textContent = percent;
    document.getElementById('progress-percent').textContent = percent;
    document.getElementById('progress-fill').style.width = percent + '%';
}

function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    container.innerHTML = '';

    let pendingCount = 0;

    dailyTasks.forEach((task, index) => {
        const taskEl = document.createElement('a');
        taskEl.className = 'task-item';
        taskEl.href = task.file || '#';
        taskEl.style.textDecoration = 'none';
        taskEl.style.color = 'inherit';

        const priorityClass = `priority-${task.priority}`;

        taskEl.innerHTML = `
            <div class="task-checkbox" onclick="event.preventDefault(); event.stopPropagation(); toggleTask(this, ${index})"></div>
            <div class="task-text">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">${task.meta}</div>
            </div>
            <span class="task-badge ${priorityClass}">${task.priority}</span>
        `;

        container.appendChild(taskEl);
        pendingCount++;
    });

    document.getElementById('tasks-count').textContent = `${pendingCount} tasks`;
}

function toggleTask(checkbox, index) {
    checkbox.classList.toggle('checked');
    const taskItem = checkbox.closest('.task-item');
    taskItem.classList.toggle('completed');

    // Update count
    const totalTasks = dailyTasks.length;
    const completedTasks = document.querySelectorAll('.task-item.completed').length;
    const pending = totalTasks - completedTasks;

    const countEl = document.getElementById('tasks-count');
    countEl.textContent = completedTasks === totalTasks
        ? `✓ All done!`
        : `${pending} pending`;

    // Save to localStorage
    saveTaskState();
}

function saveTaskState() {
    const states = {};
    document.querySelectorAll('.task-item').forEach((item, index) => {
        states[index] = item.classList.contains('completed');
    });
    try {
        localStorage.setItem('weedistillery-tasks', JSON.stringify(states));
    } catch (e) {
        // localStorage not available
    }
}

function loadTaskState() {
    try {
        const saved = localStorage.getItem('weedistillery-tasks');
        if (saved) {
            const states = JSON.parse(saved);
            document.querySelectorAll('.task-item').forEach((item, index) => {
                if (states[index]) {
                    item.classList.add('completed');
                    item.querySelector('.task-checkbox').classList.add('checked');
                }
            });

            const totalTasks = dailyTasks.length;
            const completedTasks = document.querySelectorAll('.task-item.completed').length;
            const pending = totalTasks - completedTasks;
            document.getElementById('tasks-count').textContent = pending === 0
                ? `✓ All done!`
                : `${pending} pending`;
        }
    } catch (e) {
        // localStorage not available
    }
}

function renderPagesTable() {
    const tbody = document.getElementById('pages-table-body');
    tbody.innerHTML = '';

    pagesData.forEach(page => {
        const statusInfo = getStatusBadge(page.status);
        const qaClass = getQAClass(page.qa_score);

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => {
            if (page.file) window.open(page.file, '_blank');
        };

        row.innerHTML = `
            <td><strong>#${page.id}</strong></td>
            <td><code>${page.url}</code></td>
            <td class="keyword">${page.title}</td>
            <td class="keyword">${page.keyword}</td>
            <td class="volume">${page.volume}/mo</td>
            <td><span class="qa-score ${qaClass}">${page.qa_score}/100</span></td>
            <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
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
        const daClass = getDAClass(citation.da);

        li.innerHTML = `
            <span>${citation.platform}</span>
            <span class="da-badge ${daClass}">DA ${citation.da}</span>
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
            '<span class="position-badge position-not-tracked">Not Tracked</span>' :
            '<span class="position-badge position-tracking">Tracking</span>';

        card.innerHTML = `
            <div class="keyword-text">${kw.keyword}</div>
            <div class="keyword-meta">
                <span class="keyword-volume">📊 ${kw.volume}/mo</span>
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
            '<span class="week-status status-current">● Current</span>' :
            week.status === 'completed' ?
            '<span class="week-status status-done">✓ Done</span>' :
            '<span class="week-status status-pending">Pending</span>';

        card.className = `week-card ${statusClass}`;
        card.innerHTML = `
            <div class="week-number">Week ${week.week}</div>
            <div class="week-title">${week.title}</div>
            <div class="week-pages">+${week.pages} pages · ${week.desc}</div>
            ${statusBadge}
        `;
        grid.appendChild(card);
    });
}

function renderAll() {
    renderHeader();
    renderProgressBar();
    renderDailyTasks();
    renderPagesTable();
    renderCitations();
    renderKeywords();
    renderWeeks();

    // Load saved task state
    setTimeout(loadTaskState, 100);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    console.log('%c🌿 Weedistillery 90-Day SEO Dashboard Loaded', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%c📊 Day 1 of Week 1 | Target: 37 pages in 90 days', 'color: #10b981; font-size: 12px;');
    console.log('%c💡 Tip: Click task checkboxes to mark complete (saved locally)', 'color: #9ca3af; font-size: 11px;');
});