// Weedistillery 90-Day SEO Dashboard - Enhanced with Charts, Theme Toggle, Export

// ============================================
// DATA
// ============================================

const pagesData = [
    { id: 1, url: "/weed-delivery-locations/weed-delivery-burlington/", title: "Burlington Cannabis Delivery", keyword: "cannabis delivery burlington", volume: 590, qa_score: 92, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day1-Burlington.md" },
    { id: 2, url: "/weed-delivery-locations/weed-delivery-oakville/", title: "Oakville Cannabis Delivery", keyword: "cannabis delivery oakville", volume: 720, qa_score: 93, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day2-Oakville.md" },
    { id: 3, url: "/weed-delivery-locations/weed-delivery-milton/", title: "Milton Cannabis Delivery", keyword: "cannabis delivery milton", volume: 290, qa_score: 91, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day3-Milton.md" }
];

const dailyTasks = [
    { day: 1, week: 1, title: "Publish Burlington Cannabis Delivery page", meta: "Day 1 of Week 1 · 2,500 words · QA 92/100 · 22 internal links", priority: "high", file: "content-to-publish/week1/Day1-Burlington.md" },
    { day: 2, week: 1, title: "Publish Oakville Cannabis Delivery page", meta: "Day 2 of Week 1 · 2,500 words · QA 93/100 · 20 internal links", priority: "high", file: "content-to-publish/week1/Day2-Oakville.md" },
    { day: 3, week: 1, title: "Publish Milton Cannabis Delivery page", meta: "Day 3 of Week 1 · 2,500 words · QA 91/100 · 19 internal links", priority: "high", file: "content-to-publish/week1/Day3-Milton.md" },
    { day: 4, week: 1, title: "Add 301 redirects + Submit to Google Search Console", meta: "Day 4 of Week 1 · Setup tasks · Estimated 2-3 hours", priority: "high", file: "content-to-publish/week1/Day4-Setup-Tasks.md" },
    { day: 5, week: 1, title: "Upload 15 images + Submit 6 citations", meta: "Day 5 of Week 1 · Leafly, Weedmaps, Yelp, Yellow Pages, GBP", priority: "medium", file: "content-to-publish/week1/Day5-Images-Citations.md" },
    { day: 6, week: 1, title: "Weekend review: Check indexing + validate schema", meta: "Day 6-7 of Week 1 · Light monitoring · Plan Week 2", priority: "low", file: "content-to-publish/week1/Day6-7-Weekend-Review.md" }
];

const citationsData = [
    { platform: "Google Business Profile", da: 100, tier: 1 },
    { platform: "Bing Places", da: 90, tier: 1 },
    { platform: "Leafly", da: 80, tier: 1 },
    { platform: "Weedmaps", da: 75, tier: 1 },
    { platform: "Yelp Canada", da: 70, tier: 1 },
    { platform: "Yellow Pages", da: 65, tier: 1 },
    { platform: "CannaReviews", da: 60, tier: 2 },
    { platform: "Better Cannabis Bureau", da: 50, tier: 2 },
    { platform: "THC Canada", da: 50, tier: 2 },
    { platform: "PotGuide", da: 45, tier: 2 },
    { platform: "Wikileaf", da: 45, tier: 2 },
    { platform: "Cannabis.ca", da: 40, tier: 2 }
];

const keywordsData = [
    { keyword: "cannabis delivery burlington", volume: 590 },
    { keyword: "cannabis delivery oakville", volume: 720 },
    { keyword: "cannabis delivery milton", volume: 290 },
    { keyword: "weed delivery burlington", volume: 520 },
    { keyword: "weed delivery oakville", volume: 680 },
    { keyword: "weed delivery milton", volume: 480 },
    { keyword: "same day cannabis delivery burlington", volume: 170 },
    { keyword: "premium cannabis oakville", volume: 90 },
    { keyword: "marijuana delivery burlington", volume: 290 },
    { keyword: "cannabis delivery brampton", volume: 590 },
    { keyword: "cannabis delivery mississauga", volume: 480 },
    { keyword: "best indica for sleep", volume: 480 }
];

const weeksData = [
    { week: 1, title: "Foundation", pages: 3, status: "current", desc: "Burlington, Oakville, Milton" },
    { week: 2, title: "Audits", pages: 0, status: "pending", desc: "Audit Brampton + Mississauga" },
    { week: 3, title: "City Coverage", pages: 2, status: "pending", desc: "Halton Hills + Georgetown" },
    { week: 4, title: "Brampton", pages: 5, status: "pending", desc: "Bram East, Downtown, Springdale" },
    { week: 5, title: "Mississauga", pages: 5, status: "pending", desc: "Square One, Port Credit, etc." },
    { week: 6, title: "Burlington + Oakville", pages: 4, status: "pending", desc: "Aldershot, Tyandaga, Kerr Village" },
    { week: 7, title: "Authority", pages: 4, status: "pending", desc: "Best for sleep, anxiety, pain" },
    { week: 8, title: "Education", pages: 4, status: "pending", desc: "Beginners, THC vs CBD" },
    { week: 9, title: "Categories", pages: 4, status: "pending", desc: "Edibles Brampton, Vapes Mississauga" },
    { week: 10, title: "Best-Of", pages: 4, status: "pending", desc: "Cheap ounces, top flowers" },
    { week: 11, title: "Seasonal", pages: 3, status: "pending", desc: "Gift guide, Milton neighborhoods" },
    { week: 12, title: "Final Audit", pages: 3, status: "pending", desc: "Final review + next 90 days" }
];

// ============================================
// THEME MANAGEMENT
// ============================================

function getTheme() {
    return localStorage.getItem('weedistillery-theme') || 'dark';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weedistillery-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    // Re-render charts with new theme
    if (typeof renderCharts === 'function') renderCharts();
}

function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next} mode`, 'success');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.className = 'toast show';
    if (type === 'error') toast.classList.add('error');
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>${message}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function exportAsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('Weedistillery 90-Day SEO Report', 20, 25);

        // Subheader
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 32);

        // Metrics
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Current Metrics (vs. 90-Day Targets)', 20, 45);

        doc.setFontSize(11);
        const metrics = [
            ['Metric', 'Current', 'Target', 'Progress'],
            ['Pages Published', '0', '37', '0%'],
            ['Indexed URLs', '190', '230', '83%'],
            ['Ranking Keywords', '209', '700', '30%'],
            ['Authority Score', '7', '13', '54%'],
            ['Organic Traffic', '10/mo', '350/mo', '3%'],
            ['Backlinks', '743', '1050', '71%']
        ];
        let y = 55;
        metrics.forEach((row, i) => {
            doc.setFont(undefined, i === 0 ? 'bold' : 'normal');
            doc.text(row.join('   |   '), 20, y);
            y += 8;
        });

        // Pages Status
        y += 10;
        doc.setFontSize(14);
        doc.text('pSEO Pages Status', 20, y);
        y += 10;
        doc.setFontSize(10);
        pagesData.forEach(page => {
            doc.text(`#${page.id} ${page.title} (${page.keyword}, ${page.volume}/mo) - ${page.status} - QA: ${page.qa_score}/100`, 20, y);
            y += 7;
        });

        // Keywords
        y += 10;
        doc.setFontSize(14);
        doc.text('Target Keywords', 20, y);
        y += 10;
        doc.setFontSize(10);
        keywordsData.slice(0, 12).forEach(kw => {
            doc.text(`• ${kw.keyword} (${kw.volume}/mo)`, 20, y);
            y += 6;
        });

        doc.save(`weedistillery-90-day-report-${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF report exported successfully', 'success');
    } catch (e) {
        showToast('PDF export failed: ' + e.message, 'error');
    }
}

function exportAsCSV() {
    try {
        const rows = [];
        rows.push(['Weedistillery 90-Day SEO Report']);
        rows.push(['Generated', new Date().toISOString()]);
        rows.push([]);
        rows.push(['=== METRICS ===']);
        rows.push(['Metric', 'Current', 'Target']);
        rows.push(['Pages Published', '0', '37']);
        rows.push(['Indexed URLs', '190', '230']);
        rows.push(['Ranking Keywords', '209', '700']);
        rows.push(['Authority Score', '7', '13']);
        rows.push(['Organic Traffic', '10', '350']);
        rows.push(['Backlinks', '743', '1050']);
        rows.push([]);
        rows.push(['=== PAGES ===']);
        rows.push(['ID', 'URL', 'Title', 'Keyword', 'Volume', 'QA', 'Status', 'Week']);
        pagesData.forEach(p => {
            rows.push([p.id, p.url, p.title, p.keyword, p.volume, p.qa_score, p.status, p.week]);
        });
        rows.push([]);
        rows.push(['=== KEYWORDS ===']);
        rows.push(['Keyword', 'Volume']);
        keywordsData.forEach(k => rows.push([k.keyword, k.volume]));
        rows.push([]);
        rows.push(['=== TASKS ===']);
        rows.push(['Day', 'Title', 'Priority']);
        dailyTasks.forEach(t => rows.push([t.day, t.title, t.priority]));

        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weedistillery-90-day-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('CSV exported successfully', 'success');
    } catch (e) {
        showToast('CSV export failed: ' + e.message, 'error');
    }
}

function exportAsJSON() {
    try {
        const data = {
            generated: new Date().toISOString(),
            project: 'Weedistillery 90-Day SEO',
            baseline: { indexed: 190, keywords: 209, authority: 7, traffic: 10, backlinks: 743 },
            targets: { indexed: 230, keywords: 700, authority: 13, traffic: 350, backlinks: 1050, pages: 37 },
            pages: pagesData,
            tasks: dailyTasks,
            keywords: keywordsData,
            citations: citationsData,
            weeks: weeksData
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weedistillery-90-day-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('JSON exported successfully', 'success');
    } catch (e) {
        showToast('JSON export failed: ' + e.message, 'error');
    }
}

// ============================================
// CHARTS (Chart.js)
// ============================================

let charts = {};

function getChartThemeColors() {
    const theme = getTheme();
    return {
        text: theme === 'light' ? '#111827' : '#f9fafb',
        grid: theme === 'light' ? '#e5e7eb' : '#2a2f4a',
        primary: '#6366f1',
        success: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        purple: '#8b5cf6'
    };
}

function renderCharts() {
    const colors = getChartThemeColors();

    // Traffic Growth Chart (Line)
    const trafficCtx = document.getElementById('traffic-chart');
    if (trafficCtx && !charts.traffic) {
        charts.traffic = new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 15', 'Day 30', 'Day 45', 'Day 60', 'Day 75', 'Day 90'],
                datasets: [{
                    label: 'Organic Traffic',
                    data: [10, 25, 60, 130, 220, 290, 350],
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '20',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }]
            },
            options: getChartOptions(colors, 'Traffic Growth Projection (visits/month)')
        });
    }

    // Rankings Distribution Chart (Doughnut)
    const rankingsCtx = document.getElementById('rankings-chart');
    if (rankingsCtx && !charts.rankings) {
        charts.rankings = new Chart(rankingsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Top 3', 'Top 10', 'Top 20', 'Top 50', 'Top 100', 'Beyond'],
                datasets: [{
                    data: [5, 15, 30, 80, 79, 491],
                    backgroundColor: [colors.success, colors.primary, colors.info, colors.accent, colors.purple, colors.text + '50'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: colors.text, padding: 12, font: { size: 11 } }
                    },
                    title: {
                        display: true,
                        text: 'Target Distribution (700 keywords)',
                        color: colors.text,
                        font: { size: 13, weight: 'bold' }
                    }
                }
            }
        });
    }

    // 90-Day Growth Trajectory (Multi-line)
    const growthCtx = document.getElementById('growth-chart');
    if (growthCtx && !charts.growth) {
        charts.growth = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Start', 'Week 2', 'Week 4', 'Week 6', 'Week 8', 'Week 10', 'Week 12'],
                datasets: [
                    { label: 'Pages', data: [0, 2, 14, 23, 31, 39, 42], borderColor: colors.primary, backgroundColor: colors.primary + '20', tension: 0.4, fill: false, borderWidth: 3 },
                    { label: 'Indexed (+)', data: [0, 3, 15, 24, 32, 40, 43], borderColor: colors.success, backgroundColor: colors.success + '20', tension: 0.4, fill: false, borderWidth: 3 },
                    { label: 'Citations', data: [0, 8, 15, 22, 28, 35, 40], borderColor: colors.accent, backgroundColor: colors.accent + '20', tension: 0.4, fill: false, borderWidth: 3 }
                ]
            },
            options: getChartOptions(colors, 'Cumulative Growth Over 90 Days')
        });
    }

    // Sparklines on KPI cards
    renderSparkline('spark-pages', [0, 0, 0, 3, 5, 12, 18, 25, 32, 37], colors);
    renderSparkline('spark-indexed', [190, 190, 192, 195, 205, 215, 222, 226, 228, 230], colors);
    renderSparkline('spark-keywords', [209, 215, 240, 290, 380, 480, 560, 620, 670, 700], colors);
    renderSparkline('spark-authority', [7, 7.2, 7.5, 8, 9, 10, 11, 12, 12.5, 13], colors);
    renderSparkline('spark-traffic', [10, 15, 30, 70, 130, 200, 260, 300, 330, 350], colors);
    renderSparkline('spark-backlinks', [743, 750, 770, 810, 860, 920, 970, 1010, 1030, 1050], colors);
}

function renderSparkline(id, data, colors) {
    const el = document.getElementById(id);
    if (!el) return;
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    charts[id] = new Chart(el, {
        type: 'line',
        data: {
            labels: data.map((_, i) => ''),
            datasets: [{
                data: data,
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { line: { borderJoinStyle: 'round' } }
        }
    });
}

function getChartOptions(colors, title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: colors.text, font: { size: 11 } } },
            title: {
                display: true,
                text: title,
                color: colors.text,
                font: { size: 13, weight: 'bold' }
            },
            tooltip: {
                backgroundColor: colors.text === '#f9fafb' ? '#111827' : '#1a1f3a',
                titleColor: colors.text === '#f9fafb' ? '#fff' : '#f9fafb',
                bodyColor: colors.text === '#f9fafb' ? '#fff' : '#f9fafb',
                padding: 12,
                cornerRadius: 8,
                borderColor: colors.primary,
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: colors.text, font: { size: 10 } },
                grid: { color: colors.grid }
            },
            y: {
                ticks: { color: colors.text, font: { size: 10 } },
                grid: { color: colors.grid },
                beginAtZero: true
            }
        }
    };
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderHeader() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const el1 = document.getElementById('current-date');
    const el2 = document.getElementById('last-updated');
    if (el1) el1.innerHTML = `<i class="fas fa-calendar-day"></i> ${dateStr}`;
    if (el2) el2.textContent = dateStr;
}

function renderProgressBar() {
    const startDate = new Date('2026-09-08');
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalDays = 90;
    const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

    const el1 = document.getElementById('progress-bar-percent');
    const el2 = document.getElementById('progress-percent');
    const el3 = document.getElementById('progress-fill');
    if (el1) el1.textContent = percent;
    if (el2) el2.textContent = percent;
    if (el3) el3.style.width = percent + '%';

    // Update milestone indicators
    document.querySelectorAll('.milestone').forEach(ms => {
        const msVal = parseInt(ms.dataset.milestone);
        if (percent >= msVal) ms.classList.add('active');
    });
}

function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    if (!container) return;
    container.innerHTML = '';

    dailyTasks.forEach((task, index) => {
        const taskEl = document.createElement('a');
        taskEl.className = 'task-item';
        taskEl.href = task.file || '#';

        taskEl.innerHTML = `
            <div class="task-checkbox" onclick="event.preventDefault(); event.stopPropagation(); toggleTask(this, ${index})"></div>
            <div class="task-text">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">${task.meta}</div>
            </div>
            <span class="task-badge priority-${task.priority}">${task.priority}</span>
        `;
        container.appendChild(taskEl);
    });
    loadTaskState();
}

function toggleTask(checkbox, index) {
    checkbox.classList.toggle('checked');
    const taskItem = checkbox.closest('.task-item');
    taskItem.classList.toggle('completed');

    const totalTasks = dailyTasks.length;
    const completedTasks = document.querySelectorAll('.task-item.completed').length;
    const pending = totalTasks - completedTasks;

    const countEl = document.getElementById('tasks-count');
    if (countEl) {
        countEl.textContent = completedTasks === totalTasks ? '✓ All done!' : `${pending} pending`;
    }
    saveTaskState();
    showToast(checkbox.classList.contains('checked') ? 'Task completed!' : 'Task unmarked', 'success');
}

function saveTaskState() {
    try {
        const states = {};
        document.querySelectorAll('.task-item').forEach((item, index) => {
            states[index] = item.classList.contains('completed');
        });
        localStorage.setItem('weedistillery-tasks', JSON.stringify(states));
    } catch (e) {}
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
            const countEl = document.getElementById('tasks-count');
            if (countEl) {
                countEl.textContent = pending === 0 ? '✓ All done!' : `${pending} pending`;
            }
        }
    } catch (e) {}
}

function renderPagesTable() {
    const tbody = document.getElementById('pages-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    pagesData.forEach(page => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        const qaClass = page.qa_score >= 90 ? 'high' : 'medium';
        const statusMap = {
            'ready_to_publish': 'status-ready',
            'published': 'status-published',
            'indexed': 'status-indexed',
            'ranking': 'status-ranking'
        };
        const statusText = {
            'ready_to_publish': 'Ready',
            'published': 'Published',
            'indexed': 'Indexed',
            'ranking': 'Ranking'
        };

        row.innerHTML = `
            <td><strong>#${page.id}</strong></td>
            <td><code>${page.url}</code></td>
            <td class="keyword">${page.title}</td>
            <td class="keyword">${page.keyword}</td>
            <td class="volume">${page.volume}/mo</td>
            <td><span class="qa-score ${qaClass}">${page.qa_score}/100</span></td>
            <td><span class="status-badge ${statusMap[page.status]}">${statusText[page.status]}</span></td>
            <td>Week ${page.week}</td>
            <td><i class="fas fa-external-link-alt action-icon" title="Open content file"></i></td>
        `;
        row.onclick = () => page.file && window.open(page.file, '_blank');
        tbody.appendChild(row);
    });
}

function renderCitations() {
    const tier1 = document.getElementById('tier1-list');
    const tier2 = document.getElementById('tier2-list');
    if (!tier1 || !tier2) return;

    tier1.innerHTML = '';
    tier2.innerHTML = '';

    citationsData.forEach(c => {
        const li = document.createElement('li');
        const daClass = c.da >= 70 ? 'high' : c.da >= 40 ? 'medium' : 'low';
        li.innerHTML = `<span>${c.platform}</span><span class="da-badge ${daClass}">DA ${c.da}</span>`;
        if (c.tier === 1) tier1.appendChild(li);
        else tier2.appendChild(li);
    });

    // Update progress
    const total = citationsData.length;
    const fill = document.getElementById('citation-progress-fill');
    const text = document.getElementById('citation-progress-text');
    if (fill && text) {
        const percent = 0;
        fill.style.width = percent + '%';
        text.textContent = `${percent}% complete (0/${total})`;
    }
}

function renderKeywords() {
    const grid = document.getElementById('keywords-grid');
    if (!grid) return;
    grid.innerHTML = '';

    keywordsData.forEach(kw => {
        const card = document.createElement('div');
        card.className = 'keyword-card';
        card.innerHTML = `
            <div class="keyword-text">${kw.keyword}</div>
            <div class="keyword-meta">
                <span class="keyword-volume"><i class="fas fa-chart-bar"></i> ${kw.volume}/mo</span>
                <span class="position-badge position-not-tracked">Not Tracked</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterKeywords(query) {
    const cards = document.querySelectorAll('.keyword-card');
    const q = query.toLowerCase().trim();
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = !q || text.includes(q) ? '' : 'none';
    });
}

function renderWeeks() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;
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

    // Render charts after a small delay to ensure canvas is rendered
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            renderCharts();
        }
    }, 100);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    setTheme(getTheme());

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // Export dropdown
    const exportBtn = document.getElementById('export-btn');
    const exportDropdown = document.getElementById('export-dropdown');
    if (exportBtn && exportDropdown) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown.classList.toggle('active');
        });
        document.addEventListener('click', () => exportDropdown.classList.remove('active'));

        exportDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const format = link.dataset.export;
                if (format === 'pdf') exportAsPDF();
                else if (format === 'csv') exportAsCSV();
                else if (format === 'json') exportAsJSON();
                exportDropdown.classList.remove('active');
            });
        });
    }

    // Footer export link
    document.getElementById('export-link-footer')?.addEventListener('click', (e) => {
        e.preventDefault();
        exportAsPDF();
    });

    // Task reset
    document.getElementById('reset-tasks-btn')?.addEventListener('click', () => {
        if (confirm('Reset all task completions?')) {
            localStorage.removeItem('weedistillery-tasks');
            location.reload();
        }
    });

    // Keyword search
    document.getElementById('keyword-search')?.addEventListener('input', (e) => {
        filterKeywords(e.target.value);
    });

    // Chart range buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Could re-render charts with different ranges here
        });
    });

    renderAll();

    console.log('%c🌿 Weedistillery 90-Day SEO Dashboard', 'color: #6366f1; font-size: 18px; font-weight: bold;');
    console.log('%c✨ Features: Charts · Theme Toggle · PDF/CSV/JSON Export', 'color: #10b981; font-size: 12px;');
});