/**
 * Google Apps Script Backend for Weedistillery 90-Day SEO Dashboard
 *
 * This script:
 * 1. Connects to Google Search Console API
 * 2. Fetches search analytics data (queries, pages, clicks, impressions, CTR, position)
 * 3. Writes data to a Google Sheet (which acts as a JSON API for the dashboard)
 * 4. Runs automatically every 6 hours via time-based trigger
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create new project named "Weedistillery SEO Dashboard"
 * 3. Copy this entire code into Code.gs
 * 4. Add OAuth scope: "https://www.googleapis.com/auth/webmasters.readonly"
 *    (Add manifest in Project Settings)
 * 5. Enable Google Search Console API Service in Services panel (+)
 * 6. Run `setupSpreadsheet()` to create the data sheet
 * 7. Run `initialBackfill()` to populate 90 days of data
 * 8. Set time-based trigger: `setupTriggers()` runs every 6 hours
 *
 * After setup, deploy as Web App (Deploy > New Deployment > Web App)
 * - Execute as: Me
 * - Who has access: Anyone
 * - Copy the deployment URL and paste it into the dashboard
 */

// ============================================
// CONFIGURATION
// ============================================

const SITE_URL = 'https://weedistillery.com/'; // GSC property URL
const SPREADSHEET_NAME = 'Weedistillery SEO Dashboard Data';
const DAYS_TO_FETCH = 90; // How many days of historical data
const POSITION_BUCKETS = [
    { label: 'Top 3',    min: 1,   max: 3   },
    { label: 'Top 10',   min: 1,   max: 10  },
    { label: 'Top 20',   min: 1,   max: 20  },
    { label: 'Top 50',   min: 1,   max: 50  },
    { label: 'Top 100',  min: 1,   max: 100 },
    { label: 'Beyond',   min: 101, max: 9999 }
];

// ============================================
// SETUP FUNCTIONS (Run once manually)
// ============================================

/**
 * Create or find the spreadsheet that will store all dashboard data
 * Returns the spreadsheet ID
 */
function setupSpreadsheet() {
    const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
    let ss;

    if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
        Logger.log('Existing spreadsheet found: ' + ss.getUrl());
    } else {
        ss = SpreadsheetApp.create(SPREADSHEET_NAME);
        Logger.log('Created new spreadsheet: ' + ss.getUrl());
    }

    // Setup sheet structure
    setupSheets_(ss);
    return ss.getId();
}

/**
 * Create all the sheet tabs with headers
 */
function setupSheets_(ss) {
    const sheets = {
        'Performance':       ['date', 'clicks', 'impressions', 'ctr', 'position'],
        'Queries':           ['query', 'clicks', 'impressions', 'ctr', 'position'],
        'Pages':              ['page', 'clicks', 'impressions', 'ctr', 'position'],
        'Countries':          ['country', 'clicks', 'impressions', 'ctr', 'position'],
        'Devices':            ['device', 'clicks', 'impressions', 'ctr', 'position'],
        'SearchAppearance':   ['appearance', 'clicks', 'impressions', 'ctr', 'position'],
        'PositionDistribution':['bucket', 'queries', 'impressions', 'clicks'],
        'CrawlStats':         ['date', 'pages_crawled', 'kb_downloaded', 'milliseconds'],
        'Sitemaps':           ['sitemap', 'last_submitted', 'last_downloaded', 'errors', 'warnings'],
        'Inspection':         ['page', 'last_crawled', 'indexed', 'coverage_state'],
        'Config':             ['key', 'value']
    };

    Object.keys(sheets).forEach(function(name) {
        let sheet = ss.getSheetByName(name);
        if (!sheet) {
            sheet = ss.insertSheet(name);
        }
        // Set headers
        sheet.getRange(1, 1, 1, sheets[name].length).setValues([sheets[name]]);
        sheet.getRange(1, 1, 1, sheets[name].length).setFontWeight('bold').setBackground('#6366f1').setFontColor('white');
    });

    // Store spreadsheet ID
    const configSheet = ss.getSheetByName('Config');
    configSheet.getRange(2, 1, 2, 2).setValues([
        ['spreadsheet_id', ss.getId()],
        ['site_url', SITE_URL]
    ]);

    Logger.log('Sheets set up: ' + Object.keys(sheets).join(', '));
}

/**
 * Set up time-based triggers to auto-refresh data
 */
function setupTriggers() {
    // Delete existing triggers
    ScriptApp.getProjectTriggers().forEach(function(trigger) {
        ScriptApp.deleteTrigger(trigger);
    });

    // Every 6 hours - update GSC data
    ScriptApp.newTrigger('refreshAllData')
        .timeBased()
        .everyHours(6)
        .create();

    Logger.log('Triggers set up: every 6 hours');
}

/**
 * Initial backfill: fetch last 90 days of data
 * Run this once after setup
 */
function initialBackfill() {
    Logger.log('Starting initial 90-day backfill...');
    refreshAllData();
    Logger.log('Backfill complete!');
}

// ============================================
// MAIN REFRESH FUNCTION
// ============================================

/**
 * Master function: refreshes all data from GSC
 * Called every 6 hours automatically
 */
function refreshAllData() {
    try {
        Logger.log('=== Starting GSC data refresh ===');
        const ssId = getSpreadsheetId_();
        const ss = SpreadsheetApp.openById(ssId);

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (DAYS_TO_FETCH * 24 * 60 * 60 * 1000));

        // Fetch all data types
        fetchPerformance_(ss, startDate, endDate);
        fetchQueries_(ss, startDate, endDate);
        fetchPages_(ss, startDate, endDate);
        fetchCountries_(ss, startDate, endDate);
        fetchDevices_(ss, startDate, endDate);
        fetchSearchAppearance_(ss, startDate, endDate);
        fetchPositionDistribution_(ss, startDate, endDate);
        fetchSitemaps_(ss);
        fetchInspection_(ss);

        // Update timestamp
        updateLastRefresh_(ss);

        Logger.log('=== GSC data refresh complete ===');
    } catch (e) {
        Logger.log('ERROR in refreshAllData: ' + e.toString());
        // Send email alert
        try {
            MailApp.sendEmail({
                to: Session.getActiveUser().getEmail(),
                subject: '⚠️ Weedistillery SEO Dashboard - Refresh Failed',
                body: 'Error: ' + e.toString() + '\n\nStack: ' + e.stack
            });
        } catch (e2) {
            // Email failed too
        }
    }
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

function fetchPerformance_(ss, startDate, endDate) {
    const response = SearchConsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: formatDate_(startDate),
            endDate: formatDate_(endDate),
            dimensions: ['date'],
            rowLimit: 5000
        }
    });

    const rows = (response.rows || []).map(function(row) {
        return [
            row.keys[0],
            row.clicks,
            row.impressions,
            (row.ctr * 100).toFixed(2),
            row.position.toFixed(1)
        ];
    });

    writeSheet_(ss, 'Performance', rows);
    Logger.log(`Performance: ${rows.length} rows`);
}

function fetchQueries_(ss, startDate, endDate) {
    const response = SearchConsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: formatDate_(startDate),
            endDate: formatDate_(endDate),
            dimensions: ['query'],
            rowLimit: 1000
        }
    });

    const rows = (response.rows || []).map(function(row) {
        return [
            row.keys[0],
            row.clicks,
            row.impressions,
            (row.ctr * 100).toFixed(2),
            row.position.toFixed(1)
        ];
    }).sort(function(a, b) { return b[1] - a[1]; }); // Sort by clicks

    writeSheet_(ss, 'Queries', rows);
    Logger.log(`Queries: ${rows.length} rows`);
}

function fetchPages_(ss, startDate, endDate) {
    const response = SearchConsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: formatDate_(startDate),
            endDate: formatDate_(endDate),
            dimensions: ['page'],
            rowLimit: 1000
        }
    });

    const rows = (response.rows || []).map(function(row) {
        return [
            row.keys[0],
            row.clicks,
            row.impressions,
            (row.ctr * 100).toFixed(2),
            row.position.toFixed(1)
        ];
    }).sort(function(a, b) { return b[1] - a[1]; });

    writeSheet_(ss, 'Pages', rows);
    Logger.log(`Pages: ${rows.length} rows`);
}

function fetchCountries_(ss, startDate, endDate) {
    try {
        const response = SearchConsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate_(startDate),
                endDate: formatDate_(endDate),
                dimensions: ['country'],
                rowLimit: 100
            }
        });

        const rows = (response.rows || []).map(function(row) {
            return [
                row.keys[0],
                row.clicks,
                row.impressions,
                (row.ctr * 100).toFixed(2),
                row.position.toFixed(1)
            ];
        }).sort(function(a, b) { return b[1] - a[1]; });

        writeSheet_(ss, 'Countries', rows);
        Logger.log(`Countries: ${rows.length} rows`);
    } catch (e) {
        Logger.log('Countries fetch failed (may not be available): ' + e.toString());
    }
}

function fetchDevices_(ss, startDate, endDate) {
    try {
        const response = SearchConsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate_(startDate),
                endDate: formatDate_(endDate),
                dimensions: ['device'],
                rowLimit: 10
            }
        });

        const rows = (response.rows || []).map(function(row) {
            return [
                row.keys[0],
                row.clicks,
                row.impressions,
                (row.ctr * 100).toFixed(2),
                row.position.toFixed(1)
            ];
        });

        writeSheet_(ss, 'Devices', rows);
        Logger.log(`Devices: ${rows.length} rows`);
    } catch (e) {
        Logger.log('Devices fetch failed: ' + e.toString());
    }
}

function fetchSearchAppearance_(ss, startDate, endDate) {
    try {
        const response = SearchConsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate_(startDate),
                endDate: formatDate_(endDate),
                dimensions: ['searchAppearance'],
                rowLimit: 10
            }
        });

        const rows = (response.rows || []).map(function(row) {
            return [
                row.keys[0],
                row.clicks,
                row.impressions,
                (row.ctr * 100).toFixed(2),
                row.position.toFixed(1)
            ];
        });

        writeSheet_(ss, 'SearchAppearance', rows);
        Logger.log(`SearchAppearance: ${rows.length} rows`);
    } catch (e) {
        Logger.log('SearchAppearance fetch failed: ' + e.toString());
    }
}

function fetchPositionDistribution_(ss, startDate, endDate) {
    try {
        const response = SearchConsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate_(startDate),
                endDate: formatDate_(endDate),
                dimensions: ['page'],
                rowLimit: 5000
            }
        });

        const buckets = POSITION_BUCKETS.map(function(b) {
            return { label: b.label, queries: 0, impressions: 0, clicks: 0 };
        });

        (response.rows || []).forEach(function(row) {
            const pos = row.position;
            const bucket = buckets.find(function(b) { return pos >= b.min && pos <= b.max; });
            if (bucket) {
                bucket.queries += 1;
                bucket.impressions += row.impressions;
                bucket.clicks += row.clicks;
            }
        });

        const rows = buckets.map(function(b) {
            return [b.label, b.queries, b.impressions, b.clicks];
        });

        writeSheet_(ss, 'PositionDistribution', rows);
        Logger.log(`PositionDistribution: ${rows.length} rows`);
    } catch (e) {
        Logger.log('PositionDistribution fetch failed: ' + e.toString());
    }
}

function fetchSitemaps_(ss) {
    try {
        const sitemaps = SearchConsole.sitemaps.list(SITE_URL);
        const rows = (sitemaps.sitemapEntry || []).map(function(sm) {
            return [
                sm.path,
                sm.lastSubmitted || 'N/A',
                sm.lastDownloaded || 'N/A',
                sm.errors || 0,
                sm.warnings || 0
            ];
        });
        writeSheet_(ss, 'Sitemaps', rows);
        Logger.log(`Sitemaps: ${rows.length} entries`);
    } catch (e) {
        Logger.log('Sitemaps fetch failed: ' + e.toString());
    }
}

function fetchInspection_(ss) {
    try {
        const inspection = SearchConsole.urlInspection.index.inspect({
            siteUrl: SITE_URL,
            inspectionUrl: SITE_URL
        });
        const result = inspection.inspectionResult;

        const rows = [[
            SITE_URL,
            result.lastCrawledTime || 'N/A',
            result.indexStatusResult?.verdict || 'UNKNOWN',
            result.indexStatusResult?.coverageState || 'UNKNOWN'
        ]];
        writeSheet_(ss, 'Inspection', rows);
        Logger.log('Inspection: 1 row');
    } catch (e) {
        Logger.log('Inspection fetch failed: ' + e.toString());
    }
}

// ============================================
// WEB APP / API ENDPOINT
// ============================================

/**
 * Serve data as JSON to the dashboard
 * Deploy as Web App to expose this endpoint
 */
/**
 * Site Analysis Proxy — fetches CORS-blocked sources server-side
 * Called via ?type=siteanalysis_<kind>&url=<optional>
 *   kind ∈ { rdap, wayback, sitemap, pagespeed, og, headers }
 */
function siteAnalysisProxy(e) {
    const kind = String(e.parameter.kind || '').toLowerCase();
    const targetUrl = e.parameter.url || 'https://weedistillery.com';
    const apiKey = e.parameter.pagespeedKey || '';

    let payload = { ok: false, kind: kind, error: null, source: null, fetched_at: new Date().toISOString() };

    try {
        switch (kind) {
            case 'rdap': {
                const domain = e.parameter.domain || 'weedistillery.com';
                const resp = UrlFetchApp.fetch('https://rdap.org/domain/' + domain, {
                    muteHttpExceptions: true,
                    followRedirects: true,
                });
                if (resp.getResponseCode() !== 200) throw new Error('RDAP HTTP ' + resp.getResponseCode());
                const data = JSON.parse(resp.getContentText());
                const events = data.events || [];
                payload.ok = true;
                payload.source = 'rdap.org';
                payload.data = {
                    registrar: ((data.entities || [])
                        .filter(function(x) { return (x.roles || []).indexOf('registrar') >= 0; })
                        .map(function(x) {
                            const v = x.vcardArray && x.vcardArray[1];
                            if (!v) return null;
                            const fn = v.find(function(c) { return c[0] === 'fn'; });
                            return fn ? fn[3] : null;
                        })
                        .filter(Boolean)[0]) || 'unknown',
                    registered:    ((events.find(function(x){return x.eventAction==='registration'})||{}).eventDate) || null,
                    expires:       ((events.find(function(x){return x.eventAction==='expiration'})||{}).eventDate) || null,
                    last_changed:  ((events.find(function(x){return x.eventAction==='last changed'})||{}).eventDate) || null,
                    status: (data.status || []).filter(function(s){return s.indexOf('client') !== 0;})
                };
                break;
            }

            case 'wayback': {
                const cdxUrl = 'https://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(targetUrl)
                              + '&output=json&fl=timestamp,statuscode&from=19950101&to=20991231';
                const resp = UrlFetchApp.fetch(cdxUrl, { muteHttpExceptions: true });
                if (resp.getResponseCode() !== 200) throw new Error('Wayback HTTP ' + resp.getResponseCode());
                const cdx = JSON.parse(resp.getContentText());
                let count = 0, oldest = null, newest = null;
                if (cdx.length > 1) {
                    count = cdx.length - 1;
                    oldest = cdx[1][0];
                    newest = cdx[cdx.length - 1][0];
                }
                // Try latest available
                let availableUrl = null, availableTs = null;
                try {
                    const availResp = UrlFetchApp.fetch('https://archive.org/wayback/available?url=' + encodeURIComponent(targetUrl));
                    if (availResp.getResponseCode() === 200) {
                        const a = JSON.parse(availResp.getContentText());
                        if (a.archived_snapshots && a.archived_snapshots.closest) {
                            availableUrl = a.archived_snapshots.closest.url;
                            availableTs  = a.archived_snapshots.closest.timestamp;
                        }
                    }
                } catch(e) {}
                payload.ok = true;
                payload.source = 'archive.org';
                payload.data = {
                    snapshot_count: count,
                    oldest_snapshot: oldest,
                    newest_snapshot: newest,
                    available_url: availableUrl,
                    available_timestamp: availableTs,
                };
                break;
            }

            case 'sitemap': {
                const resp = UrlFetchApp.fetch(targetUrl + '/sitemap.xml', { muteHttpExceptions: true });
                if (resp.getResponseCode() !== 200) throw new Error('Sitemap HTTP ' + resp.getResponseCode());
                const xml = resp.getContentText();
                const locs = [];
                const re = /<loc>(.*?)<\/loc>/g;
                let m;
                while ((m = re.exec(xml)) !== null) locs.push(m[1]);
                const lastmods = [];
                const re2 = /<lastmod>(.*?)<\/lastmod>/g;
                while ((m = re2.exec(xml)) !== null) lastmods.push(m[1]);
                const isIndex = /<sitemapindex/i.test(xml);
                // If it's an index, follow the child sitemaps for a full count
                let totalUrls = locs.length;
                let childSitemaps = [];
                if (isIndex) {
                    childSitemaps = locs;
                    for (const childUrl of childSitemaps.slice(0, 5)) {
                        try {
                            const childResp = UrlFetchApp.fetch(childUrl, { muteHttpExceptions: true });
                            if (childResp.getResponseCode() === 200) {
                                const childXml = childResp.getContentText();
                                const childLocs = (childXml.match(/<loc>(.*?)<\/loc>/g) || []);
                                totalUrls += childLocs.length;
                            }
                        } catch (e) {}
                    }
                }
                payload.ok = true;
                payload.source = 'self';
                payload.data = {
                    type: isIndex ? 'index' : 'urlset',
                    is_index: isIndex,
                    url_count: locs.length,
                    total_urls: totalUrls,
                    child_sitemaps: childSitemaps,
                    lastmods: lastmods.slice(0, 10),
                    bytes: xml.length,
                };
                break;
            }

            case 'robots': {
                const resp = UrlFetchApp.fetch(targetUrl + '/robots.txt', { muteHttpExceptions: true });
                if (resp.getResponseCode() !== 200) throw new Error('Robots HTTP ' + resp.getResponseCode());
                const txt = resp.getContentText();
                const lines = txt.split('\n').filter(function(l){return l.trim() && !l.startsWith('#');});
                const userAgents = [];
                const disallowed = [];
                const allowed = [];
                const sitemaps = [];
                lines.forEach(function(l) {
                    const idx = l.indexOf(':');
                    if (idx < 0) return;
                    const key = l.substring(0, idx).trim().toLowerCase();
                    const val = l.substring(idx + 1).trim();
                    if (key === 'user-agent') userAgents.push(val);
                    else if (key === 'disallow' && val) disallowed.push(val);
                    else if (key === 'allow' && val) allowed.push(val);
                    else if (key === 'sitemap') sitemaps.push(val);
                });
                payload.ok = true;
                payload.source = 'self';
                payload.data = {
                    user_agents: Array.from(new Set(userAgents)),
                    disallowed: disallowed,
                    allowed: allowed,
                    sitemaps: Array.from(new Set(sitemaps)),
                    bytes: txt.length,
                    raw: txt.substring(0, 3000),
                };
                break;
            }

            case 'pagespeed': {
                const psUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
                            + '?url=' + encodeURIComponent(targetUrl)
                            + '&strategy=' + (e.parameter.strategy || 'mobile')
                            + '&category=performance,seo,accessibility,best-practices'
                            + (apiKey ? '&key=' + apiKey : '');
                const resp = UrlFetchApp.fetch(psUrl, { muteHttpExceptions: true });
                if (resp.getResponseCode() !== 200) throw new Error('PageSpeed HTTP ' + resp.getResponseCode() + ' (add pagespeedKey=YOUR_KEY to URL for higher quota)');
                const j = JSON.parse(resp.getContentText());
                const cats = (j.lighthouseResult && j.lighthouseResult.categories) || {};
                const audits = (j.lighthouseResult && j.lighthouseResult.audits) || {};
                payload.ok = true;
                payload.source = 'googleapis.com';
                payload.data = {
                    performance:    Math.round((cats.performance && cats.performance.score || 0) * 100),
                    seo:            Math.round((cats.seo && cats.seo.score || 0) * 100),
                    accessibility:  Math.round((cats.accessibility && cats.accessibility.score || 0) * 100),
                    best_practices: Math.round((cats['best-practices'] && cats['best-practices'].score || 0) * 100),
                    lcp: (audits['largest-contentful-paint'] && audits['largest-contentful-paint'].displayValue) || '?',
                    cls: (audits['cumulative-layout-shift'] && audits['cumulative-layout-shift'].displayValue) || '?',
                    tbt: (audits['total-blocking-time'] && audits['total-blocking-time'].displayValue) || '?',
                    fcp: (audits['first-contentful-paint'] && audits['first-contentful-paint'].displayValue) || '?',
                    speed_index: (audits['speed-index'] && audits['speed-index'].displayValue) || '?',
                };
                break;
            }

            case 'og': {
                const resp = UrlFetchApp.fetch(targetUrl, { muteHttpExceptions: true, followRedirects: true });
                if (resp.getResponseCode() !== 200) throw new Error('OG HTTP ' + resp.getResponseCode());
                const html = resp.getContentText();
                payload.ok = true;
                payload.source = 'self';
                payload.data = extractOpenGraph_(html, targetUrl);
                break;
            }

            case 'headers': {
                const resp = UrlFetchApp.fetch(targetUrl, {
                    muteHttpExceptions: true,
                    followRedirects: true,
                    method: 'head',
                });
                payload.ok = true;
                payload.source = 'self';
                payload.data = {
                    status: resp.getResponseCode(),
                    headers: resp.getHeaders(),
                };
                break;
            }

            case 'schema': {
                const resp = UrlFetchApp.fetch(targetUrl, { muteHttpExceptions: true });
                if (resp.getResponseCode() !== 200) throw new Error('Schema HTTP ' + resp.getResponseCode());
                const html = resp.getContentText();
                const types = {};
                const re = /"@type"\s*:\s*"([^"]+)"/g;
                let m;
                while ((m = re.exec(html)) !== null) types[m[1]] = (types[m[1]] || 0) + 1;
                const blocks = (html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || []).length;
                payload.ok = true;
                payload.source = 'self';
                payload.data = {
                    types: types,
                    jsonld_blocks: blocks,
                    type_list: Object.keys(types),
                };
                break;
            }

            default:
                payload.error = 'Unknown kind: ' + kind + '. Use one of: rdap, wayback, sitemap, robots, pagespeed, og, headers, schema';
        }
    } catch (err) {
        payload.error = String(err && err.message ? err.message : err);
        payload.fetched_at = new Date().toISOString();
    }

    return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Extract Open Graph + Twitter Card metadata from HTML.
 * Returns structured object for the OG preview card.
 */
function extractOpenGraph_(html, pageUrl) {
    const og = {};
    const twitter = {};
    const standard = {};

    // Match <meta property="og:..." content="...">
    const ogRe = /<meta\s+[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
    let m;
    while ((m = ogRe.exec(html)) !== null) og[m[1]] = m[2];

    // Some sites flip order: <meta content="..." property="og:...">
    const ogRe2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:([^"']+)["']/gi;
    while ((m = ogRe2.exec(html)) !== null) og[m[2]] = m[1];

    // Twitter Card
    const twRe = /<meta\s+[^>]*name=["']twitter:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
    while ((m = twRe.exec(html)) !== null) twitter[m[1]] = m[2];
    const twRe2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']twitter:([^"']+)["']/gi;
    while ((m = twRe2.exec(html)) !== null) twitter[m[2]] = m[1];

    // Standard meta tags
    const descRe = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i;
    if ((m = descRe.exec(html)) !== null) standard.description = m[1];
    const descRe2 = /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i;
    if ((m = descRe2.exec(html)) !== null) standard.description = m[1];
    const titleRe = /<title>(.*?)<\/title>/i;
    if ((m = titleRe.exec(html)) !== null) standard.title = m[1].trim();

    // Canonical
    const canonRe = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i;
    if ((m = canonRe.exec(html)) !== null) standard.canonical = m[1];
    const canonRe2 = /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i;
    if ((m = canonRe2.exec(html)) !== null) standard.canonical = m[1];

    // Favicon
    const faviconRe = /<link\s+rel=["']icon["']\s+(?:[^>]*href=["']([^"']+)["']|type=["']([^"']+)["'])/i;
    if ((m = faviconRe.exec(html)) !== null) standard.favicon = (m[1] || m[2]) || null;

    // Resolve image URL to absolute
    const resolveUrl = (u) => {
        if (!u) return null;
        if (/^https?:\/\//.test(u)) return u;
        if (u.startsWith('//')) return 'https:' + u;
        if (u.startsWith('/')) {
            try { return new URL(u, pageUrl).href; } catch(e) { return u; }
        }
        return u;
    };

    // Fallback to standard description if no og:description
    const description = og.description || twitter.description || standard.description || '';
    const title = og.title || twitter.title || standard.title || pageUrl;
    const image = resolveUrl(og.image || twitter.image || twitter['image:src'] || null);

    return {
        url: pageUrl,
        canonical: standard.canonical || pageUrl,
        title: title,
        description: description,
        image: image,
        site_name: og['site_name'] || '',
        type: og.type || 'website',
        locale: og.locale || '',
        twitter_card: twitter.card || '',
        twitter_site: twitter.site || '',
        twitter_creator: twitter.creator || '',
        favicon: resolveUrl(standard.favicon),
        og_count: Object.keys(og).length,
        twitter_count: Object.keys(twitter).length,
    };
}


function doGet(e) {
    const ssId = getSpreadsheetId_();
    const ss = SpreadsheetApp.openById(ssId);

    const type = (e && e.parameter && e.parameter.type) || 'performance';
    const days = parseInt((e && e.parameter && e.parameter.days) || '90');

    let result = {};

    try {
        switch (type) {
            case 'performance':
                result = getPerformanceData_(ss, days);
                break;
            case 'queries':
                result = getQueriesData_(ss, days);
                break;
            case 'pages':
                result = getPagesData_(ss, days);
                break;
            case 'countries':
                result = getCountriesData_(ss);
                break;
            case 'devices':
                result = getDevicesData_(ss);
                break;
            case 'search-appearance':
                result = getSearchAppearanceData_(ss);
                break;
            case 'position-distribution':
                result = getPositionDistributionData_(ss);
                break;
            case 'sitemaps':
                result = getSitemapsData_(ss);
                break;
            case 'inspection':
                result = getInspectionData_(ss);
                break;
            case 'all':
                result = {
                    performance: getPerformanceData_(ss, days),
                    queries: getQueriesData_(ss, days),
                    pages: getPagesData_(ss, days),
                    countries: getCountriesData_(ss),
                    devices: getDevicesData_(ss),
                    searchAppearance: getSearchAppearanceData_(ss),
                    positionDistribution: getPositionDistributionData_(ss),
                    sitemaps: getSitemapsData_(ss),
                    inspection: getInspectionData_(ss),
                    lastUpdated: getLastRefresh_(ss)
                };
                break;
            default:
                result = { error: 'Unknown data type: ' + type };
        }
    } catch (err) {
        result = { error: err.toString() };
    }

    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// DATA RETRIEVAL HELPERS
// ============================================

function getPerformanceData_(ss, days) {
    const sheet = ss.getSheetByName('Performance');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(function(row) {
        const obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        return obj;
    });

    // Filter to last N days
    const cutoffDate = new Date(Date.now() - days * 86400000);
    return rows.filter(function(r) {
        return new Date(r.date) >= cutoffDate;
    });
}

function getQueriesData_(ss, days) {
    return getSheetAsJson_(ss, 'Queries');
}

function getPagesData_(ss, days) {
    return getSheetAsJson_(ss, 'Pages');
}

function getCountriesData_(ss) {
    return getSheetAsJson_(ss, 'Countries');
}

function getDevicesData_(ss) {
    return getSheetAsJson_(ss, 'Devices');
}

function getSearchAppearanceData_(ss) {
    return getSheetAsJson_(ss, 'SearchAppearance');
}

function getPositionDistributionData_(ss) {
    return getSheetAsJson_(ss, 'PositionDistribution');
}

function getSitemapsData_(ss) {
    return getSheetAsJson_(ss, 'Sitemaps');
}

function getInspectionData_(ss) {
    return getSheetAsJson_(ss, 'Inspection');
}

function getLastRefresh_(ss) {
    try {
        const config = ss.getSheetByName('Config');
        for (let i = 1; i < config.getLastRow(); i++) {
            const row = config.getRange(i + 1, 1, 1, 2).getValues()[0];
            if (row[0] === 'last_refresh') return row[1];
        }
    } catch (e) {}
    return null;
}

function updateLastRefresh_(ss) {
    const config = ss.getSheetByName('Config');
    let found = false;
    for (let i = 1; i < config.getLastRow(); i++) {
        if (config.getRange(i + 1, 1).getValue() === 'last_refresh') {
            config.getRange(i + 1, 2).setValue(new Date().toISOString());
            found = true;
            break;
        }
    }
    if (!found) {
        config.appendRow(['last_refresh', new Date().toISOString()]);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function writeSheet_(ss, sheetName, rows) {
    if (!rows || rows.length === 0) {
        Logger.log(`No data to write to ${sheetName}`);
        return;
    }
    const sheet = ss.getSheetByName(sheetName);

    // Clear existing data (except headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
    }

    // Write new data
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

    // Auto-resize columns
    sheet.autoResizeColumns(1, Math.min(rows[0].length, 10));
}

function getSheetAsJson_(ss, sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0];
    return data.slice(1).map(function(row) {
        const obj = {};
        headers.forEach(function(h, i) {
            obj[h] = row[i];
        });
        return obj;
    });
}

function getSpreadsheetId_() {
    // Hardcoded for now (replace with your actual ID)
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (id) return id;

    // Fallback: find by name
    const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
    if (files.hasNext()) {
        return files.next().getId();
    }
    throw new Error('Spreadsheet not found. Run setupSpreadsheet() first.');
}

function formatDate_(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// ============================================
// ALTERNATIVE: Simple HTTPS Endpoint (no GSC yet)
// ============================================

/**
 * If you don't have GSC API access yet, use this static endpoint
 * Returns realistic mock data that matches the dashboard
 */
function doGetMock(e) {
    const type = (e && e.parameter && e.parameter.type) || 'all';
    const days = parseInt((e && e.parameter && e.parameter.days) || '90');

    const mockData = generateMockData_(days);

    let result = {};
    if (type === 'all') {
        result = mockData;
    } else {
        result[type] = mockData[type];
    }

    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function generateMockData_(days) {
    const endDate = new Date();
    const performance = [];
    const queries = [];
    const pages = [];

    // Generate daily performance
    let cumulativeClicks = 10;
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate.getTime() - i * 86400000);
        const dateStr = Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');

        // Simulate growth
        const growthFactor = 1 + ((days - i) / days) * 5;
        const clicks = Math.floor(cumulativeClicks * growthFactor * (0.8 + Math.random() * 0.4));
        const impressions = clicks * 50 + Math.floor(Math.random() * 100);
        const ctr = ((clicks / impressions) * 100).toFixed(2);
        const position = (15 - (growthFactor - 1) * 2 + Math.random()).toFixed(1);

        performance.push({ date: dateStr, clicks, impressions, ctr, position });
    }

    // Top queries
    const queryData = [
        { query: 'cannabis delivery burlington', clicks: 45, impressions: 1200, ctr: 3.75, position: 8.2 },
        { query: 'cannabis delivery oakville', clicks: 38, impressions: 1100, ctr: 3.45, position: 9.1 },
        { query: 'cannabis delivery milton', clicks: 22, impressions: 800, ctr: 2.75, position: 12.4 },
        { query: 'weed delivery brampton', clicks: 18, impressions: 950, ctr: 1.89, position: 14.2 },
        { query: 'cannabis delivery mississauga', clicks: 15, impressions: 720, ctr: 2.08, position: 13.8 }
    ];
    queryData.forEach(function(q) { queries.push(q); });

    // Top pages
    const pageData = [
        { page: 'https://weedistillery.com/', clicks: 120, impressions: 5500, ctr: 2.18, position: 6.5 },
        { page: 'https://weedistillery.com/shop/', clicks: 85, impressions: 3200, ctr: 2.66, position: 8.1 },
        { page: 'https://weedistillery.com/weed-delivery-locations/weed-delivery-brampton/', clicks: 18, impressions: 560, ctr: 3.21, position: 11.5 },
        { page: 'https://weedistillery.com/weed-delivery-locations/weed-delivery-mississauga/', clicks: 15, impressions: 480, ctr: 3.13, position: 12.0 },
        { page: 'https://weedistillery.com/contact-us/', clicks: 12, impressions: 350, ctr: 3.43, position: 9.8 }
    ];
    pageData.forEach(function(p) { pages.push(p); });

    return {
        performance: performance,
        queries: queries,
        pages: pages,
        countries: [
            { country: 'can', clicks: 245, impressions: 8500, ctr: 2.88, position: 8.2 },
            { country: 'usa', clicks: 28, impressions: 1100, ctr: 2.55, position: 12.5 },
            { country: 'gbr', clicks: 12, impressions: 450, ctr: 2.67, position: 15.0 }
        ],
        devices: [
            { device: 'DESKTOP', clicks: 180, impressions: 6200, ctr: 2.90, position: 9.5 },
            { device: 'MOBILE', clicks: 105, impressions: 3850, ctr: 2.73, position: 11.2 }
        ],
        searchAppearance: [
            { appearance: 'AMP', clicks: 0, impressions: 0, ctr: 0, position: 0 },
            { appearance: 'BLUE_LINK', clicks: 285, impressions: 10050, ctr: 2.84, position: 10.2 }
        ],
        positionDistribution: [
            { bucket: 'Top 3', queries: 5, impressions: 250, clicks: 45 },
            { bucket: 'Top 10', queries: 18, impressions: 1200, clicks: 85 },
            { bucket: 'Top 20', queries: 32, impressions: 2100, clicks: 78 },
            { bucket: 'Top 50', queries: 88, impressions: 5800, clicks: 52 },
            { bucket: 'Top 100', queries: 65, impressions: 3500, clicks: 25 }
        ],
        sitemaps: [
            { sitemap: 'https://weedistillery.com/sitemap.xml', lastSubmitted: new Date().toISOString(), lastDownloaded: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/post-sitemap.xml', lastSubmitted: new Date().toISOString(), lastDownloaded: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/page-sitemap.xml', lastSubmitted: new Date().toISOString(), lastDownloaded: new Date().toISOString(), errors: 0, warnings: 0 },
            { sitemap: 'https://weedistillery.com/product-sitemap.xml', lastSubmitted: new Date().toISOString(), lastDownloaded: new Date().toISOString(), errors: 0, warnings: 0 }
        ],
        inspection: {
            inspectedUrl: SITE_URL,
            indexed: true,
            verdict: 'PASS',
            coverageState: 'Indexed, not submitted in sitemap',
            lastCrawled: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'mock'
    };
}