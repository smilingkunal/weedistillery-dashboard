// Weedistillery Site Analysis — live cross-source health module
// Auto-runs on page load; refreshable via button.

const SITE_URL = 'https://weedistillery.com';

// Proxy helper: if ANALYSIS_PROXY_URL is set, hit the Apps Script proxy
// (which bypasses CORS). Otherwise fall back to direct fetch.
const ANALYSIS_PROXY_URL = ''; // Set this to your Apps Script web-app URL after deploy

async function proxiedFetch(kind, extraParams = {}) {
    if (ANALYSIS_PROXY_URL) {
        const params = new URLSearchParams({ type: 'siteanalysis', kind, ...extraParams });
        const r = await fetch(`${ANALYSIS_PROXY_URL}?${params}`);
        if (r.ok) {
            const j = await r.json();
            if (j.ok) return j.data;
            throw new Error(j.error || 'Proxy error');
        }
        throw new Error('Proxy HTTP ' + r.status);
    }
    // No proxy configured; let caller fall back to direct fetch
    throw new Error('NO_PROXY');
}



const ANALYSIS_SOURCES = {
    pagespeed:    { enabled: false, key: '' }, // user supplies via UI
    semrush:      { enabled: false, key: '' },
};

// ============================================
// HTTP probes (TTFB + status codes)
// ============================================
async function probeHttp() {
    const paths = [
        { path: '/',                       name: 'Homepage' },
        { path: '/shop/',                  name: 'Shop' },
        { path: '/cart/',                  name: 'Cart' },
        { path: '/my-account/',            name: 'Account' },
        { path: '/sitemap.xml',            name: 'Sitemap' },
        { path: '/sitemap_index.xml',      name: 'Sitemap Index' },
        { path: '/robots.txt',             name: 'Robots' },
        { path: '/wp-admin/',              name: 'WP Admin' },
        { path: '/wp-login.php',           name: 'Login' },
        { path: '/feed/',                  name: 'RSS Feed' },
        { path: '/?p=1',                   name: 'Sample Post' },
    ];
    const results = [];
    for (const p of paths) {
        const start = performance.now();
        try {
            const r = await fetch(SITE_URL + p.path, {
                method: 'HEAD',
                mode: 'no-cors',  // we can't read headers, but timing works
                cache: 'no-store',
            });
            const ms = Math.round(performance.now() - start);
            results.push({ ...p, status: r.status || 'opaque', ttfb_ms: ms });
        } catch (e) {
            results.push({ ...p, status: 'ERR', ttfb_ms: -1, error: e.message });
        }
    }
    return results;
}

// ============================================
// Sitemap parser
// ============================================
async function fetchSitemap() {
    try { return await proxiedFetch('sitemap', { url: SITE_URL }); } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('Sitemap proxy failed:', e.message); } }

    try {
        const r = await fetch(SITE_URL + '/sitemap.xml', { mode: 'cors' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const xml = await r.text();
        // Pull all <loc> entries
        const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        // Pull lastmod values
        const lastmods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(m => m[1]);
        // Detect sitemap index (referencing other sitemaps)
        const isIndex = /sitemapindex/i.test(xml);
        return {
            ok: true,
            type: isIndex ? 'index' : 'urlset',
            url_count: locs.length,
            urls: locs,
            lastmods,
            bytes: xml.length,
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// Robots.txt parser
// ============================================
async function fetchRobots() {
    try { return await proxiedFetch('robots', { url: SITE_URL }); } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('Robots proxy failed:', e.message); } }

    try {
        const r = await fetch(SITE_URL + '/robots.txt');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const txt = await r.text();
        const lines = txt.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        const userAgents = [...new Set(lines.filter(l => /^User-agent:/i.test(l)).map(l => l.split(':')[1].trim()))];
        const disallowed = lines.filter(l => /^Disallow:/i.test(l)).map(l => l.split(':')[1].trim()).filter(Boolean);
        const allowed = lines.filter(l => /^Allow:/i.test(l)).map(l => l.split(':')[1].trim()).filter(Boolean);
        const sitemaps = [...new Set(lines.filter(l => /^Sitemap:/i.test(l)).map(l => l.split(':')[1].trim()))];
        return {
            ok: true,
            user_agents: userAgents,
            disallowed_count: disallowed.length,
            allowed_count: allowed.length,
            disallowed: disallowed.slice(0, 15),
            sitemaps,
            bytes: txt.length,
            raw: txt.substring(0, 2000),
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// RDAP / WHOIS for domain registration data
// ============================================
async function fetchDomainRDAP() {
    try { return await proxiedFetch('rdap', { domain: 'weedistillery.com' }); } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('RDAP proxy failed:', e.message); } }

    try {
        const r = await fetch('https://rdap.org/domain/weedistillery.com');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        const events = data.events || [];
        const registration = events.find(e => e.eventAction === 'registration');
        const expiration  = events.find(e => e.eventAction === 'expiration');
        const lastChanged = events.find(e => e.eventAction === 'last changed');
        const entities = (data.entities || [])
            .filter(e => (e.roles || []).includes('registrar'))
            .map(e => e.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || 'Unknown');
        return {
            ok: true,
            registrar: entities[0] || 'unknown',
            registered: registration?.eventDate || null,
            expires:    expiration?.eventDate || null,
            last_changed: lastChanged?.eventDate || null,
            status: (data.status || []).filter(s => !s.startsWith('client')),
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// Wayback Machine: snapshot count + oldest/newest
// ============================================
async function fetchWayback() {
    try { return await proxiedFetch('wayback', { url: SITE_URL }); } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('Wayback proxy failed:', e.message); } }

    try {
        const r = await fetch('https://archive.org/wayback/available?url=' + encodeURIComponent(SITE_URL));
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const avail = await r.json();
        // To get total count we'd query the CDX API; sample the most recent
        const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(SITE_URL)}&output=json&limit=1&fl=timestamp,statuscode&from=20200101&to=20991231`;
        const cdxRes = await fetch(cdxUrl);
        let count = 0;
        let oldest = null, newest = null;
        if (cdxRes.ok) {
            const cdx = await cdxRes.json();
            if (cdx.length > 1) {
                count = cdx.length - 1;
                oldest = cdx[1][0];
                newest = cdx[cdx.length - 1][0];
            }
        }
        return {
            ok: true,
            snapshot_count: count,
            oldest_snapshot: oldest,
            newest_snapshot: newest,
            available_now: avail?.archived_snapshots?.closest?.available || false,
            available_url: avail?.archived_snapshots?.closest?.url || null,
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// Schema.org: scan homepage for JSON-LD types
// ============================================
async function fetchSchemaTypes() {
    try { const r = await proxiedFetch('schema', { url: SITE_URL }); return { ok: true, schema_types: r.type_list || [], count: r.type_list ? r.type_list.length : 0 }; } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('Schema proxy failed:', e.message); } }

    try {
        const r = await fetch(SITE_URL);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const html = await r.text();
        const types = new Set();
        // Match @type in JSON-LD
        const matches = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)];
        matches.forEach(m => types.add(m[1]));
        return {
            ok: true,
            schema_types: [...types],
            count: types.size,
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// PageSpeed Insights (optional API key)
// ============================================
async function fetchPageSpeed(apiKey = '') {
    try { return await proxiedFetch('pagespeed', { pagespeedKey: apiKey, strategy: 'mobile' }); } catch (e) { if (e.message !== 'NO_PROXY') { console.warn('PageSpeed proxy failed:', e.message); } }

    const url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
              + '?url=' + encodeURIComponent(SITE_URL)
              + '&strategy=mobile'
              + '&category=performance,seo,accessibility,best-practices'
              + (apiKey ? '&key=' + apiKey : '');
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status + ' — quota? Add API key');
        const j = await r.json();
        const cats = j.lighthouseResult?.categories || {};
        const audits = j.lighthouseResult?.audits || {};
        return {
            ok: true,
            performance:    Math.round((cats.performance?.score || 0) * 100),
            seo:            Math.round((cats.seo?.score || 0) * 100),
            accessibility:  Math.round((cats.accessibility?.score || 0) * 100),
            best_practices: Math.round((cats['best-practices']?.score || 0) * 100),
            lcp:  audits['largest-contentful-paint']?.displayValue  || '?',
            cls:  audits['cumulative-layout-shift']?.displayValue   || '?',
            fid:  audits['total-blocking-time']?.displayValue      || '?',
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ============================================
// Full orchestrator — runs all sources, fills all cards
// ============================================
async function runSiteAnalysis() {
    const cards = {
        server:   document.getElementById('site-card-server'),
        seo:      document.getElementById('site-card-seo'),
        speed:    document.getElementById('site-card-speed'),
        domain:   document.getElementById('site-card-domain'),
        schema:   document.getElementById('site-card-schema'),
        wayback:  document.getElementById('site-card-wayback'),
    };
    Object.values(cards).forEach(c => c && (c.classList.add('loading'), c.dataset.state = 'loading'));

    const tasks = [
        ['http',    probeHttp()],
        ['sitemap', fetchSitemap()],
        ['robots',  fetchRobots()],
        ['rdap',    fetchDomainRDAP()],
        ['wayback', fetchWayback()],
        ['schema',  fetchSchemaTypes()],
        ['speed',   fetchPageSpeed(ANALYSIS_SOURCES.pagespeed.key)],
    ];
    const results = {};
    await Promise.allSettled(tasks.map(async ([k, p]) => {
        try { results[k] = await p; } catch (e) { results[k] = { ok: false, error: e.message }; }
    }));

    renderServerCard(cards.server,   results.http);
    renderSeoCard(cards.seo,         results.sitemap, results.robots);
    renderSpeedCard(cards.speed,     results.speed);
    renderDomainCard(cards.domain,   results.rdap);
    renderWaybackCard(cards.wayback, results.wayback);
    renderSchemaCard(cards.schema,   results.schema);

    Object.values(cards).forEach(c => c && c.classList.remove('loading'));
    return results;
}

// ----- Renderers -----
function renderServerCard(el, data) {
    if (!el) return;
    if (!data) { el.innerHTML = '<div class="card-error">No data</div>'; return; }
    const rows = data.map(d => {
        const statusColor = d.status === 200 ? 'var(--success)' :
                            d.status === 301 || d.status === 302 ? 'var(--info)' :
                            d.status === 404 ? 'var(--warning)' :
                            d.status >= 500 ? 'var(--danger)' : 'var(--text-tertiary)';
        const ttfb = d.ttfb_ms < 0 ? '?' : d.ttfb_ms + 'ms';
        const ttfbColor = d.ttfb_ms < 0 ? 'var(--text-tertiary)' :
                          d.ttfb_ms < 500 ? 'var(--success)' :
                          d.ttfb_ms < 1500 ? 'var(--info)' :
                          d.ttfb_ms < 3000 ? 'var(--warning)' : 'var(--danger)';
        return `<tr>
            <td>${d.name}</td>
            <td><code>${d.path}</code></td>
            <td style="color:${statusColor}">${d.status}</td>
            <td style="color:${ttfbColor}">${ttfb}</td>
        </tr>`;
    }).join('');
    el.innerHTML = `
        <h3><i class="fas fa-server"></i> Server Probe</h3>
        <div class="data-table-container"><table class="data-table">
            <thead><tr><th>Page</th><th>Path</th><th>Status</th><th>TTFB</th></tr></thead>
            <tbody>${rows}</tbody>
        </table></div>
        <div class="card-footer">${data.length} endpoints probed live</div>
    `;
}

function renderSeoCard(el, sitemap, robots) {
    if (!el) return;
    const sm = sitemap && sitemap.ok ? `
        <div class="kv"><span>Type</span><strong>${sitemap.type}</strong></div>
        <div class="kv"><span>URLs</span><strong>${sitemap.url_count.toLocaleString()}</strong></div>
        <div class="kv"><span>Size</span><strong>${(sitemap.bytes/1024).toFixed(1)} KB</strong></div>
    ` : '<div class="card-error">Sitemap unreachable</div>';
    const rb = robots && robots.ok ? `
        <div class="kv"><span>User-agents</span><strong>${robots.user_agents.length}</strong></div>
        <div class="kv"><span>Disallowed</span><strong>${robots.disallowed_count}</strong></div>
        <div class="kv"><span>Allowed</span><strong>${robots.allowed_count}</strong></div>
        <div class="kv"><span>Sitemaps declared</span><strong>${robots.sitemaps.length}</strong></div>
    ` : '<div class="card-error">Robots.txt unreachable</div>';
    el.innerHTML = `
        <h3><i class="fas fa-sitemap"></i> SEO Crawlability</h3>
        <div class="kv-section"><h4>sitemap.xml</h4>${sm}</div>
        <div class="kv-section"><h4>robots.txt</h4>${rb}</div>
    `;
}

function renderSpeedCard(el, data) {
    if (!el) return;
    if (!data || !data.ok) {
        el.innerHTML = `
            <h3><i class="fas fa-tachometer-alt"></i> PageSpeed Insights</h3>
            <div class="card-error">${data?.error || 'No data'}</div>
            <div class="card-footer">
                <button class="filter-btn" id="pagespeed-key-btn">Add API key</button>
                <small>Optional: free key from <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank">Google</a> (10k req/day)</small>
            </div>
        `;
        document.getElementById('pagespeed-key-btn')?.addEventListener('click', () => {
            const k = prompt('PageSpeed Insights API key (optional, free):', '');
            if (k) { ANALYSIS_SOURCES.pagespeed.key = k; runSiteAnalysis(); }
        });
        return;
    }
    const dot = (s) => s >= 90 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--danger)';
    el.innerHTML = `
        <h3><i class="fas fa-tachometer-alt"></i> PageSpeed (Mobile)</h3>
        <div class="kpi-grid-mini">
            <div class="kpi-mini"><div class="kpi-mini-label">Performance</div><div class="kpi-mini-value" style="color:${dot(data.performance)}">${data.performance}</div></div>
            <div class="kpi-mini"><div class="kpi-mini-label">SEO</div><div class="kpi-mini-value" style="color:${dot(data.seo)}">${data.seo}</div></div>
            <div class="kpi-mini"><div class="kpi-mini-label">Accessibility</div><div class="kpi-mini-value" style="color:${dot(data.accessibility)}">${data.accessibility}</div></div>
            <div class="kpi-mini"><div class="kpi-mini-label">Best Practices</div><div class="kpi-mini-value" style="color:${dot(data.best_practices)}">${data.best_practices}</div></div>
        </div>
        <div class="kv-section">
            <div class="kv"><span>LCP</span><strong>${data.lcp}</strong></div>
            <div class="kv"><span>CLS</span><strong>${data.cls}</strong></div>
            <div class="kv"><span>TBT</span><strong>${data.fid}</strong></div>
        </div>
    `;
}

function renderDomainCard(el, data) {
    if (!el) return;
    if (!data || !data.ok) {
        el.innerHTML = `<h3><i class="fas fa-globe"></i> Domain Registration</h3><div class="card-error">${data?.error || 'No data'}</div>`;
        return;
    }
    el.innerHTML = `
        <h3><i class="fas fa-globe"></i> Domain Registration</h3>
        <div class="kv"><span>Registrar</span><strong>${data.registrar}</strong></div>
        <div class="kv"><span>Registered</span><strong>${data.registered ? new Date(data.registered).toLocaleDateString() : '?'}</strong></div>
        <div class="kv"><span>Expires</span><strong>${data.expires ? new Date(data.expires).toLocaleDateString() : '?'}</strong></div>
        <div class="kv"><span>Status</span><strong>${(data.status || []).join(', ') || '—'}</strong></div>
    `;
}

function renderWaybackCard(el, data) {
    if (!el) return;
    if (!data || !data.ok) {
        el.innerHTML = `<h3><i class="fas fa-history"></i> Wayback Machine</h3><div class="card-error">${data?.error || 'No data'}</div>`;
        return;
    }
    el.innerHTML = `
        <h3><i class="fas fa-history"></i> Wayback Machine</h3>
        <div class="kv"><span>Snapshots</span><strong>${data.snapshot_count.toLocaleString()}</strong></div>
        <div class="kv"><span>Oldest</span><strong>${data.oldest_snapshot || '—'}</strong></div>
        <div class="kv"><span>Newest</span><strong>${data.newest_snapshot || '—'}</strong></div>
        ${data.available_url ? `<div class="card-footer"><a href="${data.available_url}" target="_blank">View latest snapshot</a></div>` : ''}
    `;
}

function renderSchemaCard(el, data) {
    if (!el) return;
    if (!data || !data.ok) {
        el.innerHTML = `<h3><i class="fas fa-code"></i> Schema.org Markup</h3><div class="card-error">${data?.error || 'No data'}</div>`;
        return;
    }
    const types = data.schema_types.length > 0
        ? data.schema_types.map(t => `<span class="schema-tag">${t}</span>`).join(' ')
        : '<em>No schema detected on homepage</em>';
    el.innerHTML = `
        <h3><i class="fas fa-code"></i> Schema.org Markup</h3>
        <div class="kv"><span>Types found</span><strong>${data.count}</strong></div>
        <div class="schema-types">${types}</div>
        <div class="card-footer">JSON-LD detected on homepage</div>
    `;
}
