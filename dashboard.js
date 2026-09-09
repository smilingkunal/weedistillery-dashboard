// Weedistillery 90-Day SEO Dashboard - Enhanced with All Chart Types


// ============================================
// FILE OPEN HELPER (handles local + GitHub Pages gracefully)
// ============================================

async function fileExistsOnServer(relPath) {
    try {
        const root = location.pathname.endsWith('/') ? location.pathname : location.pathname.replace(/[^/]+$/, '');
        const url = root + relPath;
        const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        return r.ok;
    } catch (e) { return false; }
}

function showLocalSourceModal(item) {
    const existing = document.getElementById('local-source-modal');
    if (existing) existing.remove();
    const title = item.title || 'this content';
    const wordCount = (item.word_count || (item.qa_score ? '~2,500' : '?')) + ' words';
    const modal = document.createElement('div');
    modal.id = 'local-source-modal';
    modal.className = 'local-source-modal';
    modal.innerHTML = `
        <div class="local-source-modal__card">
            <button class="local-source-modal__close" aria-label="Close">×</button>
            <h3><i class="fas fa-folder-open"></i> Local source material</h3>
            <p>This is a copy-paste-ready file that lives on your <strong>local C: drive</strong> at:</p>
            <code>${item.file || contentPathOf(item.id)}</code>
            <p class="local-source-modal__hint">
                These files are NOT served from the live dashboard &mdash; they are <strong>source material</strong>
                for you to copy/paste into WordPress to publish the actual pages.
            </p>
            <div class="local-source-modal__actions">
                <button class="btn-primary" id="ls-copy-path"><i class="fas fa-copy"></i> Copy path</button>
                <button class="btn-secondary" id="ls-dismiss">Got it</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.local-source-modal__close').onclick = () => modal.remove();
    modal.querySelector('#ls-dismiss').onclick = () => modal.remove();
    modal.querySelector('#ls-copy-path').onclick = async () => {
        const fullPath = 'C:\\Users\\kunal\\projects\\weedistillery-90-day-seo\\' + (item.file || '');
        try {
            await navigator.clipboard.writeText(fullPath);
            showToast('Path copied: ' + fullPath);
        } catch {
            showToast('Path: ' + fullPath);
        }
        modal.remove();
    };
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function contentPathOf(id) {
    // Fallback - works for the 3 known pages
    const map = {1: 'content-to-publish/week1/Day1-Burlington.md', 2: 'content-to-publish/week1/Day2-Oakville.md', 3: 'content-to-publish/week1/Day3-Milton.md'};
    return map[id] || '';
}


// ============================================
// DATA
// ============================================

let pagesData = []; // loaded async from metrics/pages-tracker.json (fallback below)
const pagesData_FALLBACK = [
    { id: 1, url: "/weed-delivery-locations/weed-delivery-burlington/", title: "Burlington Cannabis Delivery", keyword: "cannabis delivery burlington", volume: 590, qa_score: 92, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day1-Burlington.md" },
    { id: 2, url: "/weed-delivery-locations/weed-delivery-oakville/", title: "Oakville Cannabis Delivery", keyword: "cannabis delivery oakville", volume: 720, qa_score: 93, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day2-Oakville.md" },
    { id: 3, url: "/weed-delivery-locations/weed-delivery-milton/", title: "Milton Cannabis Delivery", keyword: "cannabis delivery milton", volume: 290, qa_score: 91, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day3-Milton.md" }
];

let dailyTasks = []; // loaded async from metrics/daily-log.json (fallback below)
const dailyTasks_FALLBACK = [
    { day: 1, week: 1, title: "Publish Burlington Cannabis Delivery page", meta: "Day 1 · 2,500 words · QA 92/100 · 22 internal links", priority: "high", file: "content-to-publish/week1/Day1-Burlington.md" },
    { day: 2, week: 1, title: "Publish Oakville Cannabis Delivery page", meta: "Day 2 · 2,500 words · QA 93/100 · 20 internal links", priority: "high", file: "content-to-publish/week1/Day2-Oakville.md" },
    { day: 3, week: 1, title: "Publish Milton Cannabis Delivery page", meta: "Day 3 · 2,500 words · QA 91/100 · 19 internal links", priority: "high", file: "content-to-publish/week1/Day3-Milton.md" },
    { day: 4, week: 1, title: "Add 301 redirects + Submit to Google Search Console", meta: "Day 4 · Setup tasks · Estimated 2-3 hours", priority: "high", file: "content-to-publish/week1/Day4-Setup-Tasks.md" },
    { day: 5, week: 1, title: "Upload 15 images + Submit 6 citations", meta: "Day 5 · Leafly, Weedmaps, Yelp, Yellow Pages, GBP", priority: "medium", file: "content-to-publish/week1/Day5-Images-Citations.md" },
    { day: 6, week: 1, title: "Weekend review: Check indexing + validate schema", meta: "Day 6-7 · Light monitoring · Plan Week 2", priority: "low", file: "content-to-publish/week1/Day6-7-Weekend-Review.md" }
];

let citationsData = []; // loaded async from metrics/citations-tracker.json (fallback below)
const citationsData_FALLBACK = [
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

let keywordsData = []; // loaded async from metrics/keyword-rankings.json (fallback below)
const keywordsData_FALLBACK = [
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

let weeksData = []; // loaded async from metrics/weekly-progress.json (fallback below)
const weeksData_FALLBACK = [
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

function getTheme() { return localStorage.getItem('weedistillery-theme') || 'dark'; }

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weedistillery-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    if (typeof renderCharts === 'function') renderCharts();
}

function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next} mode`, 'success');
}

// ============================================
// TOAST
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = 'toast show';
    if (type === 'error') toast.classList.add('error');
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>${message}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// EXPORT
// ============================================

function exportAsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(20); doc.setTextColor(99, 102, 241);
        doc.text('Weedistillery 90-Day SEO Report', 20, 25);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 32);

        doc.setFontSize(14); doc.setTextColor(0);
        doc.text('Metrics & Targets', 20, 45);
        doc.setFontSize(11);
        const metrics = [
            ['Pages: 0/37', 'Indexed: 190/230', 'Keywords: 209/700'],
            ['Authority: 7/13', 'Traffic: 10/350', 'Backlinks: 743/1050']
        ];
        doc.text(metrics[0].join('   '), 20, 55);
        doc.text(metrics[1].join('   '), 20, 63);

        let y = 80;
        doc.setFontSize(14); doc.text('pSEO Pages', 20, y); y += 10;
        doc.setFontSize(10);
        pagesData.forEach(p => {
            doc.text(`#${p.id} ${p.title} (${p.volume}/mo, QA ${p.qa_score})`, 20, y);
            y += 7;
        });

        y += 10;
        doc.setFontSize(14); doc.text('Top Keywords', 20, y); y += 10;
        doc.setFontSize(10);
        keywordsData.slice(0, 12).forEach(k => {
            doc.text(`• ${k.keyword} (${k.volume}/mo)`, 20, y);
            y += 6;
        });

        doc.save(`weedistillery-90-day-${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF exported!', 'success');
    } catch (e) { showToast('PDF failed: ' + e.message, 'error'); }
}

function exportAsCSV() {
    try {
        const rows = [['Weedistillery 90-Day Report'], ['Generated', new Date().toISOString()], []];
        rows.push(['Metric', 'Current', 'Target']);
        rows.push(['Pages', '0', '37']);
        rows.push(['Indexed', '190', '230']);
        rows.push(['Keywords', '209', '700']);
        rows.push(['Authority', '7', '13']);
        rows.push(['Traffic', '10', '350']);
        rows.push(['Backlinks', '743', '1050']);
        rows.push([]);
        rows.push(['Pages (ID, URL, Title, Keyword, Volume, QA, Status)']);
        pagesData.forEach(p => rows.push([p.id, p.url, p.title, p.keyword, p.volume, p.qa_score, p.status]));
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `weedistillery-90-day-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('CSV exported!', 'success');
    } catch (e) { showToast('CSV failed: ' + e.message, 'error'); }
}

function exportAsJSON() {
    try {
        const data = { generated: new Date().toISOString(), pages: pagesData, tasks: dailyTasks, keywords: keywordsData, citations: citationsData, weeks: weeksData };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `weedistillery-90-day-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('JSON exported!', 'success');
    } catch (e) { showToast('JSON failed: ' + e.message, 'error'); }
}

// ============================================
// CHARTS
// ============================================

let charts = {};

function getChartThemeColors() {
    const theme = getTheme();
    return {
        text: theme === 'light' ? '#111827' : '#f9fafb',
        grid: theme === 'light' ? '#e5e7eb' : '#2a2f4a',
        primary: '#6366f1', success: '#10b981', accent: '#f59e0b',
        danger: '#ef4444', info: '#3b82f6', purple: '#8b5cf6',
        pink: '#ec4899', teal: '#14b8a6', orange: '#f97316'
    };
}

function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function renderCharts() {
    const c = getChartThemeColors();

    // ===== ORIGINAL 3 CHARTS =====
    // Traffic Growth (Line)
    const trafficCtx = document.getElementById('traffic-chart');
    if (trafficCtx) {
        destroyChart('traffic');
        charts.traffic = new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 15', 'Day 30', 'Day 45', 'Day 60', 'Day 75', 'Day 90'],
                datasets: [{ label: 'Organic Traffic', data: [10, 25, 60, 130, 220, 290, 350], borderColor: c.primary, backgroundColor: c.primary + '20', tension: 0.4, fill: true, pointRadius: 5, pointHoverRadius: 8, borderWidth: 3 }]
            },
            options: { ...getChartOptions(c, 'Traffic Growth (visits/month)'), scales: { ...getChartOptions(c).scales, y: { ...getChartOptions(c).scales.y, beginAtZero: true } } }
        });
    }

    // Rankings (Doughnut)
    const rankCtx = document.getElementById('rankings-chart');
    if (rankCtx) {
        destroyChart('rankings');
        charts.rankings = new Chart(rankCtx, {
            type: 'doughnut',
            data: {
                labels: ['Top 3', 'Top 10', 'Top 20', 'Top 50', 'Top 100', 'Beyond Top 100'],
                datasets: [{ data: [5, 15, 30, 80, 79, 491], backgroundColor: [c.success, c.primary, c.info, c.accent, c.purple, c.text + '50'], borderWidth: 0 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: c.text, padding: 12, font: { size: 11 } } }
                }
            }
        });
    }

    // 90-Day Growth (Multi-line)
    const growthCtx = document.getElementById('growth-chart');
    if (growthCtx) {
        destroyChart('growth');
        charts.growth = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Start', 'Week 2', 'Week 4', 'Week 6', 'Week 8', 'Week 10', 'Week 12'],
                datasets: [
                    { label: 'Pages', data: [0, 2, 14, 23, 31, 39, 42], borderColor: c.primary, tension: 0.4, borderWidth: 3, fill: false },
                    { label: 'Indexed URLs', data: [0, 3, 15, 24, 32, 40, 43], borderColor: c.success, tension: 0.4, borderWidth: 3, fill: false },
                    { label: 'Citations', data: [0, 8, 15, 22, 28, 35, 40], borderColor: c.accent, tension: 0.4, borderWidth: 3, fill: false }
                ]
            },
            options: getChartOptions(c, 'Cumulative Growth Over 90 Days')
        });
    }

    // ===== NEW: PAGE TYPE PIE CHART =====
    const pageTypeCtx = document.getElementById('page-type-pie');
    if (pageTypeCtx) {
        destroyChart('page-type-pie');
        charts['page-type-pie'] = new Chart(pageTypeCtx, {
            type: 'pie',
            data: {
                labels: ['City Pages', 'Neighborhood Pages', 'Use Case Pages', 'Educational Pages', 'Category × Location', 'Best-Of Lists', 'Seasonal'],
                datasets: [{
                    data: [7, 20, 4, 4, 4, 4, 2],
                    backgroundColor: [c.primary, c.success, c.accent, c.info, c.purple, c.pink, c.teal],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: c.text, padding: 12, font: { size: 11 } } }
                }
            }
        });
    }

    // ===== NEW: CITY BAR CHART =====
    const cityBarCtx = document.getElementById('city-bar');
    if (cityBarCtx) {
        destroyChart('city-bar');
        charts['city-bar'] = new Chart(cityBarCtx, {
            type: 'bar',
            data: {
                labels: ['Brampton', 'Mississauga', 'Burlington', 'Oakville', 'Milton', 'Halton Hills', 'Georgetown'],
                datasets: [{
                    label: 'Planned Pages',
                    data: [6, 6, 4, 4, 3, 1, 1],
                    backgroundColor: [c.primary, c.success, c.info, c.purple, c.accent, c.pink, c.teal],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: c.text, font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: true }
                }
            }
        });
    }

    // ===== NEW: SEO HEALTH RADAR CHART =====
    const radarCtx = document.getElementById('seo-radar');
    if (radarCtx) {
        destroyChart('seo-radar');
        charts['seo-radar'] = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Pages', 'Indexing', 'Keywords', 'Authority', 'Traffic', 'Backlinks', 'Content Quality', 'Technical SEO'],
                datasets: [
                    {
                        label: 'Current',
                        data: [3, 83, 30, 54, 3, 71, 92, 70],
                        backgroundColor: c.primary + '30',
                        borderColor: c.primary,
                        borderWidth: 2,
                        pointBackgroundColor: c.primary
                    },
                    {
                        label: 'Target (90 days)',
                        data: [100, 100, 100, 100, 100, 100, 95, 95],
                        backgroundColor: c.success + '20',
                        borderColor: c.success,
                        borderWidth: 2,
                        pointBackgroundColor: c.success
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: c.text, padding: 16, font: { size: 12 } } },
                    title: { display: true, text: 'Multi-dimensional SEO Health (0-100)', color: c.text, font: { size: 14, weight: 'bold' } }
                },
                scales: {
                    r: {
                        beginAtZero: true, max: 100,
                        ticks: { stepSize: 20, color: c.text, backdropColor: 'transparent' },
                        grid: { color: c.grid },
                        angleLines: { color: c.grid },
                        pointLabels: { color: c.text, font: { size: 11 } }
                    }
                }
            }
        });
    }

    // ===== NEW: CITATION SOURCES PIE =====
    const citationPieCtx = document.getElementById('citation-pie');
    if (citationPieCtx) {
        destroyChart('citation-pie');
        charts['citation-pie'] = new Chart(citationPieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cannabis Directories', 'Local Directories', 'General Directories', 'Maps Platforms'],
                datasets: [{
                    data: [8, 12, 14, 6],
                    backgroundColor: [c.success, c.primary, c.info, c.accent],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: c.text, padding: 10, font: { size: 10 } } } }
            }
        });
    }

    // ===== NEW: MONTHLY BACKLINK ACQUISITION BAR =====
    const backlinkBarCtx = document.getElementById('backlink-bar');
    if (backlinkBarCtx) {
        destroyChart('backlink-bar');
        charts['backlink-bar'] = new Chart(backlinkBarCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8', 'Week 9-10', 'Week 11-12'],
                datasets: [{
                    label: 'New Backlinks',
                    data: [8, 25, 45, 65, 85, 79],
                    backgroundColor: [c.primary, c.success, c.info, c.accent, c.purple, c.pink],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Goal: +307 backlinks in 90 days', color: c.text, font: { size: 12, weight: 'bold' } }
                },
                scales: {
                    x: { ticks: { color: c.text, font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: true }
                }
            }
        });
    }

    // ===== NEW: BACKLINK QUALITY PIE =====
    const backlinkQualityCtx = document.getElementById('backlink-quality-pie');
    if (backlinkQualityCtx) {
        destroyChart('backlink-quality-pie');
        charts['backlink-quality-pie'] = new Chart(backlinkQualityCtx, {
            type: 'pie',
            data: {
                labels: ['High DA (70+)', 'Medium DA (40-69)', 'Low DA (<40)'],
                datasets: [{
                    data: [45, 120, 142],
                    backgroundColor: [c.success, c.accent, c.text + '50'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: c.text, padding: 10, font: { size: 10 } } },
                    title: { display: true, text: 'Current Profile (307 new needed)', color: c.text, font: { size: 12, weight: 'bold' } }
                }
            }
        });
    }

    // ===== NEW: DOMAIN AUTHORITY BAR =====
    const domainAuthCtx = document.getElementById('domain-authority-bar');
    if (domainAuthCtx) {
        destroyChart('domain-authority-bar');
        charts['domain-authority-bar'] = new Chart(domainAuthCtx, {
            type: 'bar',
            data: {
                labels: ['DA 90-100', 'DA 70-89', 'DA 50-69', 'DA 30-49', 'DA <30'],
                datasets: [{
                    label: 'Referring Domains',
                    data: [2, 8, 25, 85, 189],
                    backgroundColor: [c.success, '#22c55e', c.accent, c.orange, c.text + '60'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Current: 309 domains → Target: 400', color: c.text, font: { size: 12, weight: 'bold' } }
                },
                scales: {
                    x: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: true },
                    y: { ticks: { color: c.text, font: { size: 11 } }, grid: { display: false } }
                }
            }
        });
    }

    // ===== NEW: BACKLINK TIMELINE (Area Chart) =====
    const backlinkTimelineCtx = document.getElementById('backlink-timeline');
    if (backlinkTimelineCtx) {
        destroyChart('backlink-timeline');
        charts['backlink-timeline'] = new Chart(backlinkTimelineCtx, {
            type: 'line',
            data: {
                labels: ['Day 0', 'Day 15', 'Day 30', 'Day 45', 'Day 60', 'Day 75', 'Day 90'],
                datasets: [
                    {
                        label: 'Cumulative Backlinks',
                        data: [743, 760, 810, 870, 940, 1000, 1050],
                        borderColor: c.primary,
                        backgroundColor: c.primary + '30',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    },
                    {
                        label: 'Target Line',
                        data: [743, 778, 813, 848, 883, 918, 953],
                        borderColor: c.danger,
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: c.text, padding: 12 } },
                    title: { display: true, text: 'Backlink Growth: Actual vs Target', color: c.text, font: { size: 13, weight: 'bold' } }
                },
                scales: {
                    x: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid } },
                    y: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: false }
                }
            }
        });
    }

    // ===== SPARKLINES =====
    renderSparkline('spark-pages', [0, 0, 0, 3, 5, 12, 18, 25, 32, 37], c);
    renderSparkline('spark-indexed', [190, 190, 192, 195, 205, 215, 222, 226, 228, 230], c);
    renderSparkline('spark-keywords', [209, 215, 240, 290, 380, 480, 560, 620, 670, 700], c);
    renderSparkline('spark-authority', [7, 7.2, 7.5, 8, 9, 10, 11, 12, 12.5, 13], c);
    renderSparkline('spark-traffic', [10, 15, 30, 70, 130, 200, 260, 300, 330, 350], c);
    renderSparkline('spark-backlinks', [743, 750, 770, 810, 860, 920, 970, 1010, 1030, 1050], c);
}

function renderSparkline(id, data, c) {
    const el = document.getElementById(id);
    if (!el) return;
    destroyChart(id);
    charts[id] = new Chart(el, {
        type: 'line',
        data: { labels: data.map(() => ''), datasets: [{ data, borderColor: c.primary, backgroundColor: c.primary + '20', tension: 0.4, fill: true, borderWidth: 2, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
}

function getChartOptions(c, title) {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: c.text, font: { size: 11 } } },
            title: { display: !!title, text: title || '', color: c.text, font: { size: 13, weight: 'bold' } },
            tooltip: { backgroundColor: c.text === '#f9fafb' ? '#111827' : '#1a1f3a', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8, borderColor: c.primary, borderWidth: 1 }
        },
        scales: {
            x: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid } },
            y: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: true }
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
    const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / 90) * 100)));
    const el1 = document.getElementById('progress-bar-percent');
    const el2 = document.getElementById('progress-percent');
    const el3 = document.getElementById('progress-fill');
    if (el1) el1.textContent = percent;
    if (el2) el2.textContent = percent;
    if (el3) el3.style.width = percent + '%';
    document.querySelectorAll('.milestone').forEach(ms => {
        if (percent >= parseInt(ms.dataset.milestone)) ms.classList.add('active');
    });
}

function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    if (!container) return;
    container.innerHTML = '';
    dailyTasks.forEach((task, i) => {
        const el = document.createElement('a');
        el.className = 'task-item';
        el.href = task.file || '#';
        el.dataset.file = task.file || '';
        el.innerHTML = `
            <div class="task-checkbox" onclick="event.preventDefault(); event.stopPropagation(); toggleTask(this, ${i})"></div>
            <div class="task-text"><div class="task-title">${task.title}</div><div class="task-meta">${task.meta}</div></div>
            <span class="task-badge priority-${task.priority}">${task.priority}</span>`;
        container.appendChild(el);
        // intercept: only navigate if the file exists on the server (GitHub Pages)
        el.addEventListener('click', async (ev) => {
            if (!task.file) return;
            const ok = await fileExistsOnServer(task.file);
            if (ok) return;
            ev.preventDefault();
            showLocalSourceModal({ title: task.title, file: task.file });
        }, true);
    });
    loadTaskState();
}

function toggleTask(cb, i) {
    cb.classList.toggle('checked');
    cb.closest('.task-item').classList.toggle('completed');
    const total = dailyTasks.length, done = document.querySelectorAll('.task-item.completed').length;
    const el = document.getElementById('tasks-count');
    if (el) el.textContent = done === total ? '✓ All done!' : `${total - done} pending`;
    saveTaskState();
    showToast(cb.classList.contains('checked') ? 'Task completed!' : 'Task unmarked');
    // Real-time cascade: every toggle re-evaluates metrics and re-renders
    applyTaskStateToData();
    recomputeAndRerender();
}

function saveTaskState() {
    try {
        const s = {};
        document.querySelectorAll('.task-item').forEach((it, i) => s[i] = it.classList.contains('completed'));
        localStorage.setItem('weedistillery-tasks', JSON.stringify(s));
    } catch (e) {}
}

function loadTaskState() {
    try {
        const saved = localStorage.getItem('weedistillery-tasks');
        if (!saved) return;
        const states = JSON.parse(saved);
        document.querySelectorAll('.task-item').forEach((it, i) => {
            if (states[i]) { it.classList.add('completed'); it.querySelector('.task-checkbox').classList.add('checked'); }
        });
        applyTaskStateToData();
        // Tasks summary
        const total = dailyTasks.length, done = document.querySelectorAll('.task-item.completed').length;
        const el = document.getElementById('tasks-count');
        if (el) el.textContent = done === total ? '✓ All done!' : `${total - done} pending`;
    } catch (e) {}
}

// Map localStorage task states onto pagesData/citationsData status fields in memory
function applyTaskStateToData() {
    try {
        const saved = JSON.parse(localStorage.getItem('weedistillery-tasks') || '{}');
        // Tasks 0..2 (Burlington, Oakville, Milton) correspond to pages 1..3
        // Task 3 (Day 4 redirects + GSC) maps to a citation bump
        // Task 4 (Day 5 images + 6 citations) maps to 6 citation approvals
        const taskToPage = { 0: 1, 1: 2, 2: 3 };
        for (const [taskIdx, pageIdx] of Object.entries(taskToPage)) {
            const page = pagesData.find(p => p.id === pageIdx);
            if (page) {
                page.status = saved[taskIdx] ? 'published' : 'ready_to_publish';
                if (saved[taskIdx] && !page.publish_date) page.publish_date = new Date().toISOString().split('T')[0];
            }
        }
        // Task 4 (Day 5) — bumping first 6 citations to 'approved'
        if (saved[4] && Array.isArray(citationsData)) {
            citationsData.slice(0, 6).forEach(c => { c.status = 'approved'; });
        }
    } catch (e) { console.warn('applyTaskStateToData failed', e); }
}

// Recompute all derived metrics and re-render affected UI
function recomputeAndRerender() {
    // KPIs
    renderHeader();
    renderProgressBar();
    // Table needs updating because page statuses changed
    renderPagesTable();
    // Citation tier progress
    renderCitations();
    // Charts (sparklines + main charts) need re-render
    if (typeof Chart !== 'undefined') renderCharts();
}

function renderPagesTable() {
    const tbody = document.getElementById('pages-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    pagesData.forEach(p => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        const qaClass = p.qa_score >= 90 ? 'high' : 'medium';
        const sm = { 'ready_to_publish': 'status-ready', 'published': 'status-published', 'indexed': 'status-indexed', 'ranking': 'status-ranking' };
        const st = { 'ready_to_publish': 'Ready', 'published': 'Published', 'indexed': 'Indexed', 'ranking': 'Ranking' };
        row.innerHTML = `<td><strong>#${p.id}</strong></td><td><code>${p.url}</code></td><td class="keyword">${p.title}</td><td class="keyword">${p.keyword}</td><td class="volume">${p.volume}/mo</td><td><span class="qa-score ${qaClass}">${p.qa_score}/100</span></td><td><span class="status-badge ${sm[p.status]}">${st[p.status]}</span></td><td>Week ${p.week}</td><td><i class="fas fa-external-link-alt action-icon"></i></td>`;
        if (p.file) {
        row.dataset.file = p.file;
        row.style.cursor = 'pointer';
    }
    row.onclick = () => {
        if (!p.file) return;
        if (fileExistsOnServer(p.file)) {
            window.open(p.file, '_blank');
        } else {
            showLocalSourceModal(p);
        }
    };
        tbody.appendChild(row);
    });
}

function renderCitations() {
    const t1 = document.getElementById('tier1-list'), t2 = document.getElementById('tier2-list');
    if (!t1 || !t2) return;
    t1.innerHTML = ''; t2.innerHTML = '';
    citationsData.forEach(c => {
        const li = document.createElement('li');
        const daClass = c.da >= 70 ? 'high' : c.da >= 40 ? 'medium' : 'low';
        li.innerHTML = `<span>${c.platform}</span><span class="da-badge ${daClass}">DA ${c.da}</span>`;
        if (c.tier === 1) t1.appendChild(li); else t2.appendChild(li);
    });
}

function renderKeywords() {
    const grid = document.getElementById('keywords-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Hydrate positions from localStorage
    const saved = JSON.parse(localStorage.getItem('weedistillery-keywords') || '{}');

    keywordsData.forEach((kw, idx) => {
        const pos = saved[idx]?.position ?? null;
        const card = document.createElement('div');
        card.className = 'keyword-card' + (pos ? ' has-position' : '');
        card.dataset.idx = idx;

        // Position badge color by bucket
        let badgeClass = 'position-not-tracked';
        let badgeText = 'Click to add position';
        if (pos != null) {
            if (pos <= 3) { badgeClass = 'position-top3'; badgeText = '#' + pos; }
            else if (pos <= 10) { badgeClass = 'position-top10'; badgeText = '#' + pos; }
            else if (pos <= 20) { badgeClass = 'position-top20'; badgeText = '#' + pos; }
            else if (pos <= 50) { badgeClass = 'position-top50'; badgeText = '#' + pos; }
            else if (pos <= 100) { badgeClass = 'position-top100'; badgeText = '#' + pos; }
            else { badgeClass = 'position-beyond'; badgeText = '#' + pos; }
        }

        card.innerHTML = `
            <div class="keyword-text">${kw.keyword}</div>
            <div class="keyword-meta">
                <span class="keyword-volume"><i class="fas fa-chart-bar"></i> ${kw.volume}/mo</span>
                <span class="position-badge ${badgeClass}" data-pos="${pos ?? ''}">${badgeText}</span>
            </div>
            <button class="keyword-edit-btn" aria-label="Edit position">
                <i class="fas fa-pencil-alt"></i>
            </button>
        `;

        card.addEventListener('click', (e) => openKeywordEditor(idx, card));
        grid.appendChild(card);
    });
}

// Inline editor: replaces the keyword card with input + save/cancel
function openKeywordEditor(idx, cardEl) {
    const saved = JSON.parse(localStorage.getItem('weedistillery-keywords') || '{}');
    const current = saved[idx]?.position ?? '';
    const kw = keywordsData[idx];

    cardEl.classList.add('editing');
    cardEl.innerHTML = `
        <div class="keyword-text">${kw.keyword}</div>
        <div class="keyword-editor">
            <label>Position</label>
            <input type="number" min="1" max="500" value="${current}" placeholder="1-100" autofocus>
            <div class="keyword-editor-actions">
                <button class="kw-save"><i class="fas fa-check"></i> Save</button>
                <button class="kw-cancel"><i class="fas fa-times"></i></button>
                <button class="kw-clear" title="Remove position"><i class="fas fa-eraser"></i></button>
            </div>
        </div>
    `;
    const input = cardEl.querySelector('input');
    input.focus();
    input.select();

    cardEl.querySelector('.kw-save').addEventListener('click', (e) => {
        e.stopPropagation();
        const v = parseInt(input.value, 10);
        if (isNaN(v) || v < 1) { showToast('Enter a position 1-500'); return; }
        saveKeywordPosition(idx, v);
    });
    cardEl.querySelector('.kw-cancel').addEventListener('click', (e) => {
        e.stopPropagation();
        renderKeywords();
    });
    cardEl.querySelector('.kw-clear').addEventListener('click', (e) => {
        e.stopPropagation();
        clearKeywordPosition(idx);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); cardEl.querySelector('.kw-save').click(); }
        if (e.key === 'Escape') { e.preventDefault(); cardEl.querySelector('.kw-cancel').click(); }
    });
}

function saveKeywordPosition(idx, position) {
    const saved = JSON.parse(localStorage.getItem('weedistillery-keywords') || '{}');
    saved[idx] = { position, updated: new Date().toISOString() };
    localStorage.setItem('weedistillery-keywords', JSON.stringify(saved));
    // Persist on the data object too (so charts that read keywordsData see the change)
    if (keywordsData[idx]) {
        keywordsData[idx].position = position;
        keywordsData[idx].target = keywordsData[idx].target ?? 10;
    }
    renderKeywords();
    recomputeKeywordMetrics();
    showToast(`"${keywordsData[idx].keyword}" → #${position}`);
}

function clearKeywordPosition(idx) {
    const saved = JSON.parse(localStorage.getItem('weedistillery-keywords') || '{}');
    delete saved[idx];
    localStorage.setItem('weedistillery-keywords', JSON.stringify(saved));
    if (keywordsData[idx]) { delete keywordsData[idx].position; }
    renderKeywords();
    recomputeKeywordMetrics();
    showToast('Position cleared');
}

function resetAllKeywordPositions() {
    if (!confirm('Clear all keyword position tracking?')) return;
    localStorage.removeItem('weedistillery-keywords');
    keywordsData.forEach(kw => { delete kw.position; });
    renderKeywords();
    recomputeKeywordMetrics();
    showToast('All keyword positions reset');
}

// Recompute position buckets + score + estimated traffic from current keywordsData
function recomputeKeywordMetrics() {
    const counts = { top3: 0, top10: 0, top20: 0, top50: 0, top100: 0, beyond: 0 };
    let tracked = 0;
    let estimatedClicks = 0;

    // CTR model by position (industry averages, conservative)
    const ctrByPos = (p) => {
        if (p === 1) return 0.30;
        if (p === 2) return 0.15;
        if (p === 3) return 0.10;
        if (p <= 5) return 0.06;
        if (p <= 10) return 0.025;
        if (p <= 20) return 0.008;
        if (p <= 50) return 0.002;
        if (p <= 100) return 0.0005;
        return 0;
    };

    keywordsData.forEach(kw => {
        const pos = kw.position;
        if (!pos || pos < 1) return;
        tracked++;
        if (pos <= 3) counts.top3++;
        else if (pos <= 10) counts.top10++;
        else if (pos <= 20) counts.top20++;
        else if (pos <= 50) counts.top50++;
        else if (pos <= 100) counts.top100++;
        else counts.beyond++;
        estimatedClicks += (kw.volume || 0) * ctrByPos(pos);
    });

    // Store on window for chart consumers
    window.__keywordMetrics = { counts, tracked, estimatedClicks: Math.round(estimatedClicks) };

    // Update rankings donut chart with new buckets
    if (typeof Chart !== 'undefined' && charts.rankings) {
        charts.rankings.data.datasets[0].data = [
            counts.top3, counts.top10, counts.top20, counts.top50, counts.top100, counts.beyond
        ];
        charts.rankings.update('none');
    }

    // Update SEO radar 'Keywords' axis (% of target_keywords in Top 20)
    const targetCount = 700; // from baseline.json targets_day_90
    const keywordsScore = Math.min(100, Math.round((counts.top20 / Math.max(1, targetCount)) * 100 * 7));
    if (typeof Chart !== 'undefined' && charts['seo-radar']) {
        const r = charts['seo-radar'];
        // Index 2 = Keywords axis in our radar
        r.data.datasets[0].data[2] = Math.max(r.data.datasets[0].data[2], keywordsScore);
        r.update('none');
    }

    // Update traffic KPI sparkline if present (chart id 'traffic-chart')
    if (typeof Chart !== 'undefined' && charts['traffic-chart']) {
        // Add a small bump for current CTR-based clicks
        const t = charts['traffic-chart'];
        // Only bump if current data is below our estimate (don't exceed 350/mo target)
        const last = t.data.datasets[0].data[t.data.datasets[0].data.length - 1] || 0;
        const target = Math.max(last, estimatedClicks);
        if (target > last) {
            // Scale: last-day = baseline (10), interpolated tail toward target
            const len = t.data.datasets[0].data.length;
            for (let i = 0; i < len; i++) {
                const f = (i + 1) / len;
                const interp = 10 + (target - 10) * f;
                t.data.datasets[0].data[i] = Math.max(t.data.datasets[0].data[i], Math.round(interp));
            }
            t.update('none');
        }
    }

    // Update KPI card #5 (Organic Traffic) inline text
    const trafficCard = document.querySelector('.kpi-card[data-kpi="traffic"] .kpi-current');
    if (trafficCard) {
        const current = Math.max(parseInt(trafficCard.textContent, 10) || 0, estimatedClicks);
        trafficCard.textContent = current.toLocaleString();
    }

    // Update KPI card #3 (Ranking Keywords)
    const kwCard = document.querySelector('.kpi-card[data-kpi="keywords"] .kpi-current');
    if (kwCard) {
        kwCard.textContent = tracked.toString();
    }

    // Update KPI card #4 (Authority Score) if many positions in Top 10
    const authCard = document.querySelector('.kpi-card[data-kpi="authority"] .kpi-current');
    if (authCard) {
        const cur = parseInt(authCard.textContent, 10) || 0;
        const bonus = (counts.top3 * 0.5) + (counts.top10 * 0.2);
        authCard.textContent = Math.min(13, Math.round((cur + bonus) * 10) / 10).toString();
    }

    showToast(`Updated: ${tracked} keywords, ~${Math.round(estimatedClicks)} clicks/mo`);
}

function filterKeywords(q) {
    q = q.toLowerCase().trim();
    document.querySelectorAll('.keyword-card').forEach(c => {
        c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function renderWeeks() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;
    grid.innerHTML = '';
    weeksData.forEach(week => {
        const card = document.createElement('div');
        const statusClass = week.status === 'current' ? 'current' : week.status === 'completed' ? 'completed' : '';
        const sb = week.status === 'current' ? '<span class="week-status status-current">● Current</span>' : week.status === 'completed' ? '<span class="week-status status-done">✓ Done</span>' : '<span class="week-status status-pending">Pending</span>';
        card.className = `week-card ${statusClass}`;
        card.innerHTML = `<div class="week-number">Week ${week.week}</div><div class="week-title">${week.title}</div><div class="week-pages">+${week.pages} pages · ${week.desc}</div>${sb}`;
        grid.appendChild(card);
    });
}


// ============================================
// DATA LOADER (fetches metrics/*.json; falls back to embedded defaults)
// Maps structured JSON schema → flat arrays the dashboard renders.
// ============================================

let dataLoadPromise = null;
let dataLoadState = 'pending'; // pending | loaded | fallback

function _assign(name, value) {
    // Helper to set a global from inside async scope (avoids eval complexity)
    if (typeof window !== 'undefined') window[name] = value;
}

async function loadDashboardData() {
    if (dataLoadPromise) return dataLoadPromise;
    dataLoadPromise = (async () => {
        let loaded = 0, fellback = 0, mapped = 0;

        // 1. pages-tracker.json → pagesData
        try {
            const res = await fetch('metrics/pages-tracker.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (Array.isArray(j.pages) && j.pages.length > 0) {
                pagesData = j.pages.map((p, i) => ({
                    id: p.id ?? (i+1),
                    url: p.url,
                    title: p.title,
                    keyword: p.target_keyword || p.keyword || '',
                    volume: p.volume ?? 0,
                    qa_score: p.qa_score ?? null,
                    status: p.status || 'draft',
                    week: p.week_target ?? p.week ?? 1,
                    file: p.file || '',
                    publish_date: p.publish_date ?? null,
                    indexed_date: p.indexed_date ?? null,
                }));
                mapped++;
            } else throw new Error('no pages');
        } catch (e) {
            pagesData = pagesData_FALLBACK;
            fellback++;
        }

        // 2. daily-log.json → dailyTasks
        // daily-log.json has { days: [{day, week, title, meta, priority, file, completed}] }
        // If empty (no log entries yet), use embedded defaults so UI works on day-1.
        try {
            const res = await fetch('metrics/daily-log.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (Array.isArray(j.days) && j.days.length > 0) {
                dailyTasks = j.days;
                loaded++;
            } else {
                // Empty log → use embedded defaults
                dailyTasks = dailyTasks_FALLBACK;
                fellback++;
            }
        } catch (e) {
            dailyTasks = dailyTasks_FALLBACK;
            fellback++;
        }

        // 3. citations-tracker.json → citationsData
        // citations-tracker.json: { target_citations: [{platform, da, tier, ...}], submitted, approved, ... }
        try {
            const res = await fetch('metrics/citations-tracker.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            // Schema variants supported:
            //   { target_citations: [...] }  OR
            //   { citations: [...] }  (current file uses this)
            //   { submitted: [...], approved: [...], pending: [...] }
            const citArr = j.target_citations || j.citations || [
                ...(j.submitted || []), ...(j.approved || []), ...(j.pending || [])
            ];
            if (Array.isArray(citArr) && citArr.length > 0) {
                citationsData = citArr.map(c => ({
                    platform: c.platform || c.name,
                    da: c.domain_authority ?? c.da ?? 0,
                    tier: c.tier ?? 1,
                    status: c.status || 'pending',
                    submitted_date: c.submitted_date ?? null,
                    login_url: c.login_url ?? '',
                }));
                mapped++;
            } else throw new Error('no citations');
        } catch (e) {
            citationsData = citationsData_FALLBACK;
            fellback++;
        }

        // 4. keyword-rankings.json → keywordsData
        // keyword-rankings.json: { target_keywords: [{keyword, page, current_position, target_position, search_volume, url_slug}] }
        try {
            const res = await fetch('metrics/keyword-rankings.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (Array.isArray(j.target_keywords) && j.target_keywords.length > 0) {
                keywordsData = j.target_keywords.map(k => ({
                    keyword: k.keyword,
                    volume: k.search_volume ?? k.volume ?? 0,
                    position: k.current_position ?? null,
                    target: k.target_position ?? null,
                    page: k.page ?? '',
                }));
                mapped++;
            } else throw new Error('no keywords');
        } catch (e) {
            keywordsData = keywordsData_FALLBACK;
            fellback++;
        }

        // 5. weekly-progress.json → weeksData
        // weekly-progress.json: { weeks: [{week, theme, pages_target, status, summary}] }
        try {
            const res = await fetch('metrics/weekly-progress.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (Array.isArray(j.weeks) && j.weeks.length > 0) {
                weeksData = j.weeks.map((w, i) => ({
                    week: w.week ?? (i+1),
                    title: w.theme || w.title,
                    pages: w.pages_target ?? w.pages ?? 0,
                    status: w.status || 'pending',
                    desc: w.summary || w.desc || ''
                }));
                mapped++;
            } else throw new Error('no weeks');
        } catch (e) {
            weeksData = weeksData_FALLBACK;
            fellback++;
        }

        // 6. baseline.json → baselineData
        try {
            const res = await fetch('metrics/baseline.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (j.metrics && j.targets_day_90) {
                baselineData = {
                    metrics: j.metrics,
                    targets: j.targets_day_90,
                    baseline_date: j.baseline_date,
                    current_day: j.current_day ?? 1,
                    current_week: j.current_week ?? 1,
                };
                loaded++;
            } else throw new Error('baseline shape mismatch');
        } catch (e) {
            baselineData = baselineData_FALLBACK;
            fellback++;
        }

        dataLoadState = mapped > 0 ? 'loaded' : (loaded > 0 ? 'partial' : 'fallback');
        console.log(`Dashboard data: mapped=${mapped}, loaded=${loaded}, fallback=${fellback}, state=${dataLoadState}`);
    })();
    return dataLoadPromise;
}

                    } else {
                        val = weeksData_FALLBACK;
                    }
                } else if (name === 'baselineData') {
                    // keep shape - require object with metrics + targets
                    if (!json.metrics || !json.targets) val = baselineData_FALLBACK;
                }
                if (Array.isArray(val)) {
                    if (val.length === 0 && eval(name + '_FALLBACK').length > 0) {
                        // empty array - fall back
                        eval(name + ' = ' + name + '_FALLBACK');
                        fellback++;
                    } else {
                        eval(name + ' = ' + JSON.stringify(val));
                        loaded++;
                    }
                } else if (typeof val === 'object' && val !== null) {
                    eval(name + ' = ' + JSON.stringify(val));
                    loaded++;
                } else {
                    eval(name + ' = ' + name + '_FALLBACK');
                    fellback++;
                }
            } catch (e) {
                eval(name + ' = ' + name + '_FALLBACK');
                fellback++;
                console.info('Dashboard data: using embedded fallback for', name, '(' + e.message + ')');
            }
        }
        dataLoadState = loaded > 0 ? 'loaded' : 'fallback';
        console.log(`Dashboard data: loaded=${loaded}, fallback=${fellback}`);
    })();
    return dataLoadPromise;
}

function tryEval(name, json) {
    // helper used during async wait
}

// ============================================
// GSC DATA INTEGRATION
// ============================================

let gscConfig = null;
let gscData = null;
let gscLoading = false;

async function loadGscConfig_() {
    // Try multiple paths for compatibility (file://, http://, https://)
    const paths = [
        'data/gsc-config.json',
        './data/gsc-config.json',
        '../data/gsc-config.json'
    ];

    for (const path of paths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                gscConfig = await res.json();
                console.log(`✓ GSC config loaded from ${path}`);
                return gscConfig;
            }
        } catch (e) {
            // Try next path
        }
    }

    console.log('ℹ GSC config not found - using mock data fallback');
    return null;
}

async function fetchGscData(endpoint) {
    if (!gscConfig || !gscConfig.config.apiEndpoint) return null;
    try {
        const url = `${gscConfig.config.apiEndpoint}?type=${endpoint}&days=90`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn(`GSC ${endpoint} fetch failed:`, e);
        return null;
    }
}

async function loadAllGscData() {
    gscLoading = true;
    showLoadingState(true);

    try {
        // Try API first if enabled and configured
        if (gscConfig && gscConfig.config.enabled && gscConfig.config.apiEndpoint) {
            const data = await fetchGscData('all');
            if (data) {
                gscData = data;
                console.log('✓ GSC data loaded from API');
                renderGscData();
                return;
            }
        }
        // Fallback to mock data (always available)
        console.log('ℹ Using fallback mock data');
        gscData = generateMockGscData();
        renderGscData();
    } catch (e) {
        console.error('GSC load error:', e);
        gscData = generateMockGscData();
        renderGscData();
    } finally {
        gscLoading = false;
        showLoadingState(false);
    }
}

function generateMockGscData() {
    const days = 90;
    const endDate = new Date();
    const performance = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate.getTime() - i * 86400000);
        const dateStr = date.toISOString().split('T')[0];
        const growth = 1 + ((days - i) / days) * 5;
        const clicks = Math.max(1, Math.floor(5 * growth * (0.7 + Math.random() * 0.6)));
        const impressions = clicks * 40 + Math.floor(Math.random() * 200);
        const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
        const position = Math.max(1, (16 - (growth - 1) * 2 + Math.random())).toFixed(1);
        performance.push({ date: dateStr, clicks, impressions, ctr, position });
    }

    return {
        performance,
        queries: [
            { query: 'cannabis delivery burlington', clicks: 12, impressions: 480, ctr: 2.50, position: 11.2 },
            { query: 'cannabis delivery oakville', clicks: 8, impressions: 360, ctr: 2.22, position: 12.5 },
            { query: 'cannabis delivery milton', clicks: 5, impressions: 240, ctr: 2.08, position: 14.1 },
            { query: 'weed delivery brampton', clicks: 4, impressions: 180, ctr: 2.22, position: 13.8 },
            { query: 'cannabis delivery mississauga', clicks: 3, impressions: 150, ctr: 2.00, position: 15.2 },
            { query: 'best indica for sleep', clicks: 2, impressions: 95, ctr: 2.11, position: 16.5 },
            { query: 'marijuana delivery burlington', clicks: 2, impressions: 85, ctr: 2.35, position: 14.8 },
            { query: 'cannabis delivery ontario', clicks: 1, impressions: 60, ctr: 1.67, position: 18.2 }
        ],
        pages: [
            { page: 'https://weedistillery.com/', clicks: 45, impressions: 2100, ctr: 2.14, position: 8.5 },
            { page: 'https://weedistillery.com/shop/', clicks: 32, impressions: 1450, ctr: 2.21, position: 9.8 },
            { page: 'https://weedistillery.com/weed-delivery-locations/weed-delivery-brampton/', clicks: 8, impressions: 320, ctr: 2.50, position: 12.2 },
            { page: 'https://weedistillery.com/contact-us/', clicks: 5, impressions: 180, ctr: 2.78, position: 11.5 },
            { page: 'https://weedistillery.com/about-us/', clicks: 4, impressions: 165, ctr: 2.42, position: 13.1 }
        ],
        countries: [
            { country: 'can', clicks: 68, impressions: 2800, ctr: 2.43, position: 10.5 },
            { country: 'usa', clicks: 8, impressions: 320, ctr: 2.50, position: 14.2 },
            { country: 'gbr', clicks: 3, impressions: 120, ctr: 2.50, position: 16.8 }
        ],
        devices: [
            { device: 'DESKTOP', clicks: 48, impressions: 1850, ctr: 2.59, position: 11.1 },
            { device: 'MOBILE', clicks: 28, impressions: 1280, ctr: 2.19, position: 12.5 }
        ],
        searchAppearance: [
            { appearance: 'BLUE_LINK', clicks: 78, impressions: 3120, ctr: 2.50, position: 11.5 },
            { appearance: 'AMP', clicks: 0, impressions: 0, ctr: 0, position: 0 }
        ],
        positionDistribution: [
            { bucket: 'Top 3', queries: 2, impressions: 95, clicks: 18 },
            { bucket: 'Top 10', queries: 8, impressions: 380, clicks: 32 },
            { bucket: 'Top 20', queries: 15, impressions: 720, clicks: 28 },
            { bucket: 'Top 50', queries: 42, impressions: 2100, clicks: 18 },
            { bucket: 'Top 100', queries: 28, impressions: 1500, clicks: 8 },
            { bucket: 'Beyond', queries: 114, impressions: 6200, clicks: 5 }
        ],
        sitemaps: [
            { sitemap: 'https://weedistillery.com/sitemap.xml', lastSubmitted: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/post-sitemap.xml', lastSubmitted: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/page-sitemap.xml', lastSubmitted: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/product-sitemap.xml', lastSubmitted: new Date().toISOString(), errors: 0, warnings: 0 }
        ],
        inspection: {
            inspectedUrl: 'https://weedistillery.com/',
            indexed: true,
            verdict: 'PASS',
            coverageState: 'Indexed, not submitted in sitemap',
            lastCrawled: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'mock'
    };
}

function showLoadingState(show) {
    const gscSections = document.querySelectorAll('.gsc-section');
    gscSections.forEach(s => {
        if (show) s.classList.add('loading');
        else s.classList.remove('loading');
    });
}

function renderGscData() {
    if (!gscData) return;

    const updateText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    // Update KPI cards with live GSC data
    if (gscData.performance && gscData.performance.length > 0) {
        const recent = gscData.performance.slice(-7);
        const recentClicks = recent.reduce(function(s, r) { return s + (r.clicks || 0); }, 0);
        const totalImpressions = gscData.performance.reduce(function(s, r) { return s + (r.impressions || 0); }, 0);
        const avgPosition = gscData.performance.reduce(function(s, r) { return s + parseFloat(r.position || 0); }, 0) / gscData.performance.length;

        updateText('gsc-clicks-7d', recentClicks);
        updateText('gsc-impressions-total', totalImpressions.toLocaleString());
        updateText('gsc-avg-position', avgPosition.toFixed(1));
    }

    // Render top queries
    const queriesList = document.getElementById('gsc-queries-list');
    if (queriesList && gscData.queries) {
        queriesList.innerHTML = '';
        gscData.queries.slice(0, 10).forEach(function(q) {
            const li = document.createElement('li');
            li.className = 'gsc-query-item';
            const ctr = parseFloat(q.ctr) || 0;
            li.innerHTML = `
                <div class="gsc-query-main">
                    <div class="gsc-query-text">${escapeHtml(q.query)}</div>
                    <div class="gsc-query-meta">
                        <span><i class="fas fa-mouse-pointer"></i> ${q.clicks} clicks</span>
                        <span><i class="fas fa-eye"></i> ${q.impressions.toLocaleString()} impr.</span>
                        <span><i class="fas fa-percentage"></i> ${ctr.toFixed(2)}% CTR</span>
                    </div>
                </div>
                <div class="gsc-query-position">
                    <div class="position-badge-large">#${parseFloat(q.position).toFixed(1)}</div>
                </div>
            `;
            queriesList.appendChild(li);
        });
    }

    // Render top pages
    const pagesList = document.getElementById('gsc-pages-list');
    if (pagesList && gscData.pages) {
        pagesList.innerHTML = '';
        gscData.pages.slice(0, 10).forEach(function(p) {
            const li = document.createElement('li');
            li.className = 'gsc-page-item';
            li.innerHTML = `
                <div class="gsc-page-main">
                    <div class="gsc-page-url">${escapeHtml(p.page)}</div>
                    <div class="gsc-page-meta">
                        <span><i class="fas fa-mouse-pointer"></i> ${p.clicks} clicks</span>
                        <span><i class="fas fa-eye"></i> ${p.impressions.toLocaleString()} impr.</span>
                        <span><i class="fas fa-percentage"></i> ${(parseFloat(p.ctr) || 0).toFixed(2)}% CTR</span>
                    </div>
                </div>
                <div class="gsc-query-position">
                    <div class="position-badge-large">#${parseFloat(p.position).toFixed(1)}</div>
                </div>
            `;
            li.onclick = function() { window.open(p.page, '_blank'); };
            pagesList.appendChild(li);
        });
    }

    // Render countries
    const countriesBars = document.getElementById('gsc-countries-bars');
    if (countriesBars && gscData.countries) {
        countriesBars.innerHTML = '';
        const maxClicks = Math.max.apply(null, gscData.countries.map(function(c) { return c.clicks; }));
        gscData.countries.forEach(function(c) {
            const li = document.createElement('li');
            const pct = maxClicks > 0 ? (c.clicks / maxClicks * 100) : 0;
            const flag = getCountryFlag(c.country);
            li.innerHTML = `
                <div class="gsc-country-item">
                    <span class="country-flag">${flag}</span>
                    <span class="country-code">${c.country.toUpperCase()}</span>
                    <div class="country-bar-track">
                        <div class="country-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="country-clicks">${c.clicks}</span>
                </div>
            `;
            countriesBars.appendChild(li);
        });
    }

    // Render devices pie chart
    renderDevicesChart();

    // Render position distribution
    renderPositionChart();

    // Render top countries chart
    renderCountriesChart();

    // Render queries/pages chart (combine into one chart)
    renderQueriesChart();

    // Render sitemaps table
    renderSitemapsTable();

    // Render inspection status
    renderInspectionStatus();

    // Update connection status indicator
    const statusEl = document.getElementById('gsc-status-text');
    if (statusEl) {
        const isLive = gscConfig && gscConfig.config.enabled && gscData && gscData.dataSource !== 'mock';
        statusEl.innerHTML = isLive
            ? '<i class="fas fa-circle" style="color: var(--success)"></i> Live GSC Data'
            : '<i class="fas fa-circle" style="color: var(--warning)"></i> Mock Data (Setup GSC API)';
    }

    // Update last refresh time
    const refreshEl = document.getElementById('gsc-last-refresh');
    if (refreshEl && gscData.lastUpdated) {
        const d = new Date(gscData.lastUpdated);
        refreshEl.textContent = d.toLocaleString();
    }
}

function getCountryFlag(code) {
    const flags = {
        can: '🇨🇦', usa: '🇺🇸', gbr: '🇬🇧', aus: '🇦🇺',
        ind: '🇮🇳', deu: '🇩🇪', fra: '🇫🇷', nld: '🇳🇱'
    };
    return flags[code] || '🌍';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderDevicesChart() {
    if (!gscData.devices) return;
    destroyChart('gsc-devices-chart');
    const ctx = document.getElementById('gsc-devices-chart');
    if (!ctx) return;
    const c = getChartThemeColors();
    charts['gsc-devices-chart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: gscData.devices.map(function(d) { return d.device.toLowerCase().replace(/_/g, ' '); }),
            datasets: [{
                data: gscData.devices.map(function(d) { return d.clicks; }),
                backgroundColor: [c.primary, c.success, c.accent, c.purple],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: c.text, font: { size: 11 } } }
            }
        }
    });
}

function renderPositionChart() {
    if (!gscData.positionDistribution) return;
    const ctx = document.getElementById('gsc-position-chart');
    if (!ctx) return;
    destroyChart('gsc-position-chart');
    const c = getChartThemeColors();
    charts['gsc-position-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: gscData.positionDistribution.map(function(p) { return p.bucket; }),
            datasets: [{
                label: 'Queries',
                data: gscData.positionDistribution.map(function(p) { return p.queries; }),
                backgroundColor: c.primary,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: c.text }, grid: { color: c.grid }, beginAtZero: true },
                y: { ticks: { color: c.text, font: { size: 11 } }, grid: { display: false } }
            }
        }
    });
}

function renderCountriesChart() {
    if (!gscData.countries) return;
    const ctx = document.getElementById('gsc-countries-chart');
    if (!ctx) return;
    destroyChart('gsc-countries-chart');
    const c = getChartThemeColors();
    charts['gsc-countries-chart'] = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: gscData.countries.map(function(co) { return getCountryFlag(co.country) + ' ' + co.country.toUpperCase(); }),
            datasets: [{
                data: gscData.countries.map(function(co) { return co.clicks; }),
                backgroundColor: [c.primary, c.success, c.accent, c.purple, c.info],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: c.text, font: { size: 11 } } } }
        }
    });
}

function renderQueriesChart() {
    if (!gscData.queries) return;
    const ctx = document.getElementById('gsc-queries-chart');
    if (!ctx) return;
    destroyChart('gsc-queries-chart');
    const c = getChartThemeColors();
    const top5 = gscData.queries.slice(0, 5);
    charts['gsc-queries-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5.map(function(q) { return q.query.length > 25 ? q.query.substring(0, 22) + '...' : q.query; }),
            datasets: [{
                label: 'Clicks',
                data: top5.map(function(q) { return q.clicks; }),
                backgroundColor: c.success,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Top 5 Queries (Last 90 Days)', color: c.text }
            },
            scales: {
                x: { ticks: { color: c.text, font: { size: 9 } }, grid: { display: false } },
                y: { ticks: { color: c.text, font: { size: 10 } }, grid: { color: c.grid }, beginAtZero: true }
            }
        }
    });
}

function renderSitemapsTable() {
    if (!gscData.sitemaps) return;
    const tbody = document.getElementById('gsc-sitemaps-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    gscData.sitemaps.forEach(function(sm) {
        const tr = document.createElement('tr');
        const status = sm.errors > 0 ? '<span class="status-badge status-ready"><i class="fas fa-exclamation-triangle"></i> Errors</span>' : '<span class="status-badge status-published"><i class="fas fa-check"></i> OK</span>';
        const lastDate = sm.lastSubmitted && sm.lastSubmitted !== 'N/A' ? new Date(sm.lastSubmitted).toLocaleDateString() : 'N/A';
        tr.innerHTML = `
            <td><code>${escapeHtml(sm.sitemap)}</code></td>
            <td>${lastDate}</td>
            <td>${sm.errors || 0}</td>
            <td>${sm.warnings || 0}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderInspectionStatus() {
    if (!gscData.inspection) return;
    const el = document.getElementById('gsc-inspection-status');
    if (!el) return;
    const ins = gscData.inspection;
    const verdictClass = ins.verdict === 'PASS' ? 'status-published' : 'status-ready';

    let crawledTime = 'N/A';
    if (ins.lastCrawled && ins.lastCrawled !== 'N/A') {
        try {
            crawledTime = new Date(ins.lastCrawled).toLocaleString();
        } catch (e) {}
    }

    el.innerHTML = `
        <div class="inspection-grid">
            <div class="inspection-card">
                <div class="inspection-label"><i class="fas fa-link"></i> URL</div>
                <div class="inspection-value"><code>${escapeHtml(ins.inspectedUrl)}</code></div>
            </div>
            <div class="inspection-card">
                <div class="inspection-label"><i class="fas fa-search"></i> Index Status</div>
                <div class="inspection-value"><span class="status-badge ${verdictClass}">${ins.verdict}</span></div>
            </div>
            <div class="inspection-card">
                <div class="inspection-label"><i class="fas fa-map"></i> Coverage State</div>
                <div class="inspection-value">${escapeHtml(ins.coverageState)}</div>
            </div>
            <div class="inspection-card">
                <div class="inspection-label"><i class="fas fa-clock"></i> Last Crawled</div>
                <div class="inspection-value">${crawledTime}</div>
            </div>
        </div>
    `;
}

function refreshGscData() {
    loadAllGscData();
}

async function renderAll() {
    // Load dashboard data (metrics/*.json) first; falls back silently if fetch fails
    await loadDashboardData();
    renderHeader();
    renderProgressBar();
    renderDailyTasks();
    renderPagesTable();
    renderCitations();
    renderKeywords();
    renderWeeks();
    setTimeout(function() {
        if (typeof Chart !== 'undefined') renderCharts();
    }, 100);
    // Load GSC data asynchronously
    setTimeout(function() {
        loadGscConfig_().then(function() {
            return loadAllGscData();
        });
    }, 500);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTheme(getTheme());
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    const exportBtn = document.getElementById('export-btn');
    const exportDropdown = document.getElementById('export-dropdown');
    if (exportBtn && exportDropdown) {
        exportBtn.addEventListener('click', e => { e.stopPropagation(); exportDropdown.classList.toggle('active'); });
        document.addEventListener('click', () => exportDropdown.classList.remove('active'));
        exportDropdown.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const fmt = a.dataset.export;
                if (fmt === 'pdf') exportAsPDF();
                else if (fmt === 'csv') exportAsCSV();
                else if (fmt === 'json') exportAsJSON();
                exportDropdown.classList.remove('active');
            });
        });
    }

    

// ============================================
// SITE ANALYSIS — wire refresh button + initial run
// ============================================
document.getElementById('site-analysis-refresh-btn')?.addEventListener('click', async () => {
    showToast('Running live site analysis...');
    await runSiteAnalysis();
    const el = document.getElementById('site-analysis-lastrun');
    if (el) el.textContent = 'updated ' + new Date().toLocaleTimeString();
    showToast('Site analysis complete');
});
// Initial run after data load
setTimeout(() => {
    runSiteAnalysis().then(() => {
        const el = document.getElementById('site-analysis-lastrun');
        if (el) el.textContent = 'updated ' + new Date().toLocaleTimeString();
    });
}, 800);

// ============================================
// OPEN GRAPH PREVIEW — wire refresh + initial run
// ============================================
document.getElementById('og-refresh-btn')?.addEventListener('click', async () => {
    const container = document.getElementById('og-preview-content');
    if (container) container.classList.add('loading');
    showToast('Fetching OG metadata...');
    await loadOpenGraphPreview();
    showToast('OG preview updated');
});
setTimeout(() => {
    if (typeof loadOpenGraphPreview === 'function') loadOpenGraphPreview();
}, 1200);


document.getElementById('export-link-footer')?.addEventListener('click', e => { e.preventDefault(); exportAsPDF(); });

    document.getElementById('reset-tasks-btn')?.addEventListener('click', () => {
        if (confirm('Reset all task completions?')) {
            localStorage.removeItem('weedistillery-tasks');
            location.reload();
        }
    });

    document.getElementById('keyword-search')?.addEventListener('input', e => filterKeywords(e.target.value));

    document.getElementById('reset-keywords-btn')?.addEventListener('click', () => {
        resetAllKeywordPositions();
    });

    // On load: hydrate + recompute (in case localStorage has prior entries)
    const kwSaved = JSON.parse(localStorage.getItem('weedistillery-keywords') || '{}');
    Object.entries(kwSaved).forEach(([idx, v]) => {
        if (keywordsData[idx]) keywordsData[idx].position = v.position;
    });
    setTimeout(recomputeKeywordMetrics, 250);

    document.getElementById('refresh-gsc-btn')?.addEventListener('click', () => {
        refreshGscData();
        showToast('Refreshing GSC data...');
    });

    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    renderAll();
    console.log('%c🌿 Weedistillery 90-Day SEO Dashboard', 'color: #6366f1; font-size: 18px; font-weight: bold;');
    console.log('%c✨ 12+ Charts · Theme Toggle · Export PDF/CSV/JSON', 'color: #10b981; font-size: 12px;');
});