// Weedistillery 90-Day SEO Dashboard - Enhanced with All Chart Types

// ============================================
// DATA
// ============================================

const pagesData = [
    { id: 1, url: "/weed-delivery-locations/weed-delivery-burlington/", title: "Burlington Cannabis Delivery", keyword: "cannabis delivery burlington", volume: 590, qa_score: 92, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day1-Burlington.md" },
    { id: 2, url: "/weed-delivery-locations/weed-delivery-oakville/", title: "Oakville Cannabis Delivery", keyword: "cannabis delivery oakville", volume: 720, qa_score: 93, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day2-Oakville.md" },
    { id: 3, url: "/weed-delivery-locations/weed-delivery-milton/", title: "Milton Cannabis Delivery", keyword: "cannabis delivery milton", volume: 290, qa_score: 91, status: "ready_to_publish", week: 1, file: "content-to-publish/week1/Day3-Milton.md" }
];

const dailyTasks = [
    { day: 1, week: 1, title: "Publish Burlington Cannabis Delivery page", meta: "Day 1 · 2,500 words · QA 92/100 · 22 internal links", priority: "high", file: "content-to-publish/week1/Day1-Burlington.md" },
    { day: 2, week: 1, title: "Publish Oakville Cannabis Delivery page", meta: "Day 2 · 2,500 words · QA 93/100 · 20 internal links", priority: "high", file: "content-to-publish/week1/Day2-Oakville.md" },
    { day: 3, week: 1, title: "Publish Milton Cannabis Delivery page", meta: "Day 3 · 2,500 words · QA 91/100 · 19 internal links", priority: "high", file: "content-to-publish/week1/Day3-Milton.md" },
    { day: 4, week: 1, title: "Add 301 redirects + Submit to Google Search Console", meta: "Day 4 · Setup tasks · Estimated 2-3 hours", priority: "high", file: "content-to-publish/week1/Day4-Setup-Tasks.md" },
    { day: 5, week: 1, title: "Upload 15 images + Submit 6 citations", meta: "Day 5 · Leafly, Weedmaps, Yelp, Yellow Pages, GBP", priority: "medium", file: "content-to-publish/week1/Day5-Images-Citations.md" },
    { day: 6, week: 1, title: "Weekend review: Check indexing + validate schema", meta: "Day 6-7 · Light monitoring · Plan Week 2", priority: "low", file: "content-to-publish/week1/Day6-7-Weekend-Review.md" }
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
        el.innerHTML = `
            <div class="task-checkbox" onclick="event.preventDefault(); event.stopPropagation(); toggleTask(this, ${i})"></div>
            <div class="task-text"><div class="task-title">${task.title}</div><div class="task-meta">${task.meta}</div></div>
            <span class="task-badge priority-${task.priority}">${task.priority}</span>`;
        container.appendChild(el);
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
        const total = dailyTasks.length, done = document.querySelectorAll('.task-item.completed').length;
        const el = document.getElementById('tasks-count');
        if (el) el.textContent = done === total ? '✓ All done!' : `${total - done} pending`;
    } catch (e) {}
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
        row.onclick = () => p.file && window.open(p.file, '_blank');
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
    keywordsData.forEach(kw => {
        const card = document.createElement('div');
        card.className = 'keyword-card';
        card.innerHTML = `<div class="keyword-text">${kw.keyword}</div><div class="keyword-meta"><span class="keyword-volume"><i class="fas fa-chart-bar"></i> ${kw.volume}/mo</span><span class="position-badge position-not-tracked">Not Tracked</span></div>`;
        grid.appendChild(card);
    });
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

function renderAll() {
    renderHeader();
    renderProgressBar();
    renderDailyTasks();
    renderPagesTable();
    renderCitations();
    renderKeywords();
    renderWeeks();
    setTimeout(() => { if (typeof Chart !== 'undefined') renderCharts(); }, 100);
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

    document.getElementById('export-link-footer')?.addEventListener('click', e => { e.preventDefault(); exportAsPDF(); });

    document.getElementById('reset-tasks-btn')?.addEventListener('click', () => {
        if (confirm('Reset all task completions?')) {
            localStorage.removeItem('weedistillery-tasks');
            location.reload();
        }
    });

    document.getElementById('keyword-search')?.addEventListener('input', e => filterKeywords(e.target.value));

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