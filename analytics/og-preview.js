// Weedistillery Open Graph Preview — fetches meta + renders social-card mockups
const OG_TARGET_URL = 'https://weedistillery.com';

async function loadOpenGraphPreview() {
    const container = document.getElementById('og-preview-content');
    if (!container) return;
    container.classList.add('loading');

    let data = null;
    // Try Apps Script proxy first (no CORS issues)
    if (typeof ANALYSIS_PROXY_URL === 'string' && ANALYSIS_PROXY_URL && ANALYSIS_PROXY_URL.length > 5) {
        try {
            const url = `${ANALYSIS_PROXY_URL}?type=og&url=${encodeURIComponent(OG_TARGET_URL)}`;
            const r = await fetch(url);
            if (r.ok) {
                const j = await r.json();
                if (j.ok && j.data) data = j.data;
            }
        } catch (e) { /* fall through */ }
    }
    // Fallback: direct fetch (may hit CORS for some sites, but WP usually serves OG correctly)
    if (!data) {
        try {
            const r = await fetch(OG_TARGET_URL);
            if (r.ok) {
                const html = await r.text();
                data = parseOGFromHTML(html, OG_TARGET_URL);
            }
        } catch (e) {
            container.classList.remove('loading');
            container.innerHTML = `
                <div class="card-error">
                    Open Graph preview requires Apps Script proxy deployed.
                    <div class="card-footer"><small>Both direct fetch and proxy failed. CORS usually blocks browser→target-site OG reads.</small></div>
                </div>
            `;
            return;
        }
    }

    container.classList.remove('loading');
    renderOGPreview(container, data);
}

// Standalone HTML OG parser (fallback when proxy not available)
function parseOGFromHTML(html, pageUrl) {
    const og = {};
    const twitter = {};
    let m;
    const ogRe1 = /<meta\s+[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
    while ((m = ogRe1.exec(html)) !== null) og[m[1]] = m[2];
    const ogRe2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:([^"']+)["']/gi;
    while ((m = ogRe2.exec(html)) !== null) og[m[2]] = m[1];
    const twRe1 = /<meta\s+[^>]*name=["']twitter:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
    while ((m = twRe1.exec(html)) !== null) twitter[m[1]] = m[2];
    const twRe2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']twitter:([^"']+)["']/gi;
    while ((m = twRe2.exec(html)) !== null) twitter[m[2]] = m[1];
    let title = (/<title>(.*?)<\/title>/i.exec(html) || [])[1] || pageUrl;
    let description = (/name=["']description["']\s+content=["']([^"']*)/i.exec(html) || [])[1] || '';
    const resolveUrl = (u) => {
        if (!u) return null;
        if (/^https?:\/\//.test(u)) return u;
        if (u.startsWith('//')) return 'https:' + u;
        if (u.startsWith('/')) { try { return new URL(u, pageUrl).href; } catch(e) { return u; } }
        return u;
    };
    return {
        url: pageUrl,
        title: og.title || twitter.title || title,
        description: og.description || twitter.description || description,
        image: resolveUrl(og.image || twitter.image || twitter['image:src']),
        site_name: og.site_name || '',
        type: og.type || 'website',
        twitter_card: twitter.card || '',
        twitter_site: twitter.site || '',
        og_count: Object.keys(og).length,
        twitter_count: Object.keys(twitter).length,
    };
}

function renderOGPreview(container, data) {
    const title = data.title || OG_TARGET_URL;
    const desc = (data.description || '').substring(0, 200);
    const image = data.image;
    const site = data.site_name || 'weedistillery.com';
    const url = OG_TARGET_URL;

    // Image fallback (use favicon if no OG image)
    const imageEl = image
        ? `<div class="og-card__image" style="background-image:url('${escapeHtml(image)}')"></div>`
        : `<div class="og-card__image og-card__image--placeholder"><i class="fas fa-cannabis"></i></div>`;

    container.innerHTML = `
        <div class="og-preview-grid">
            <!-- Twitter / X Card -->
            <div class="og-preview-tile">
                <div class="og-preview-tile__platform"><i class="fab fa-twitter"></i> Twitter / X</div>
                <div class="og-card og-card--twitter">
                    ${imageEl}
                    <div class="og-card__domain">${escapeHtml(site)}</div>
                    <div class="og-card__title">${escapeHtml(title)}</div>
                    <div class="og-card__desc">${escapeHtml(desc)}</div>
                </div>
            </div>

            <!-- Facebook / LinkedIn / Slack Card -->
            <div class="og-preview-tile">
                <div class="og-preview-tile__platform"><i class="fab fa-facebook"></i> Facebook / LinkedIn</div>
                <div class="og-card og-card--fb">
                    ${imageEl}
                    <div class="og-card__body">
                        <div class="og-card__domain">${escapeHtml(site.replace(/^https?:\/\//, ''))}</div>
                        <div class="og-card__title">${escapeHtml(title)}</div>
                        <div class="og-card__desc">${escapeHtml(desc)}</div>
                    </div>
                </div>
            </div>

            <!-- iMessage / WhatsApp link -->
            <div class="og-preview-tile">
                <div class="og-preview-tile__platform"><i class="fas fa-comment"></i> iMessage / WhatsApp</div>
                <div class="og-card og-card--imessage">
                    <div class="og-card__domain">${escapeHtml(url)}</div>
                    <div class="og-card__title">${escapeHtml(title)}</div>
                    <div class="og-card__desc">${escapeHtml(desc.substring(0, 80))}...</div>
                    ${image ? `<div class="og-card__thumb" style="background-image:url('${escapeHtml(image)}')"></div>` : ''}
                </div>
            </div>
        </div>

        <details class="og-meta-debug">
            <summary><i class="fas fa-code"></i> Raw OG / Twitter metadata (${data.og_count + data.twitter_count} tags)</summary>
            <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
        </details>

        <div class="og-preview-tips">
            <strong><i class="fas fa-lightbulb"></i> Tips:</strong>
            ${image ? '' : '<span class="og-tip-warn">⚠ No og:image set — social shares will look plain. Add a 1200×630 image.</span>'}
            ${desc.length < 100 ? '<span class="og-tip-warn">⚠ Description is short. Aim for 150–200 chars.</span>' : ''}
            ${desc.length > 200 ? '<span class="og-tip-warn">⚠ Description will be truncated on Twitter.</span>' : ''}
            ${data.og_count < 5 ? '<span class="og-tip-warn">⚠ Few OG tags found — add og:title, og:description, og:image, og:url.</span>' : '<span class="og-tip-ok">✓ Open Graph tags look complete.</span>'}
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
