// WeeDistillery Marketing Dashboard - LIVE DATA + ARCHITECTURE
// Primary: helper API (live, with approve/reject + approve-to-publish)
// Fallback: GitHub Pages cached data
// Architecture: link graph that powers the blog template

const HELPER_URL = 'https://847731ecdb503089-223-185-54-142.serveousercontent.com';
const GITHUB_FALLBACK_URL = 'https://smilingkunal.github.io/weedistillery-dashboard/data/dashboard-data.json';
const ARCH_URL = 'https://smilingkunal.github.io/weedistillery-dashboard/data/content-architecture.json';
const GSC_GAP_URL = 'https://smilingkunal.github.io/weedistillery-dashboard/data/gsc-gap-data.json';

let jobsData = [];
let stats = {};
let architecture = null;
let gscGapData = null;
let currentBlogFilter = 'all';
let lastDataSource = '';

async function init() {
  await Promise.all([loadJobs(), loadArchitecture(), loadGscGap()]);
  setupTabs();
  setupBlogFilters();
  renderStats();
  renderOpportunities();
  renderBlogs();
  renderArchitecture();

  setInterval(async () => {
    await loadJobs();
    renderStats();
    renderOpportunities();
    renderBlogs();
  }, 30000);
}

async function loadJobs() {
  // Try live helper
  try {
    const res = await fetch(HELPER_URL + '/dashboard-data', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        jobsData = data.jobs || [];
        stats = data.stats || {};
        lastDataSource = 'live';
        updateSourceIndicator();
        return;
      }
    }
  } catch (e) {
    console.log('Live failed, trying GitHub:', e.message);
  }
  // GitHub fallback
  try {
    const res = await fetch(GITHUB_FALLBACK_URL + '?bust=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data.success || data.jobs) {
        jobsData = data.jobs || [];
        stats = data.stats || {};
        lastDataSource = 'cached';
        updateSourceIndicator();
        return;
      }
    }
  } catch (e) {
    lastDataSource = 'offline';
    updateSourceIndicator();
  }
}

async function loadArchitecture() {
  // Try live helper first
  try {
    const res = await fetch(HELPER_URL + '/architecture', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.topical_map) {
        architecture = data;
        return;
      }
    }
  } catch (e) {
    console.log('Live arch failed, trying GitHub:', e.message);
  }
  // GitHub fallback
  try {
    const res = await fetch(ARCH_URL + '?bust=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data.topical_map) {
        architecture = data;
        return;
      }
    }
  } catch (e) {
    console.log('GitHub arch fallback failed:', e.message);
  }
}

async function loadGscGap() {
  try {
    const res = await fetch(GSC_GAP_URL + '?bust=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data.opportunities) {
        gscGapData = data;
        renderGscGap();
      }
    }
  } catch (e) {
    console.log('GSC gap load failed:', e.message);
  }
}

function renderGscGap() {
  const container = document.getElementById('gsc-gap-content');
  if (!container || !gscGapData) return;
  const opps = gscGapData.opportunities || [];
  const totals = gscGapData.totals || {};

  // Summary
  let html = '<div style="margin-bottom: 20px; padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;">';
  html += `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
    <div><strong>${opps.length}</strong> real queries</div>
    <div><strong>${totals.impressions || 0}</strong> total impressions</div>
    <div><strong>${totals.clicks || 0}</strong> total clicks</div>
    <div><strong>${totals.ctr || 0}%</strong> avg CTR</div>
  </div>`;
  html += `<div style="font-size: 12px; color: var(--text-secondary);">Source: Google Search Console. Period: ${gscGapData.period || 'byProperty'}. Updated: ${gscGapData.last_updated ? new Date(gscGapData.last_updated).toLocaleDateString() : 'unknown'}.</div>`;
  html += '</div>';

  // Cluster summary
  if (gscGapData.cluster_summary) {
    html += '<h3 style="margin-bottom: 12px;">By Cluster</h3>';
    html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">';
    for (const [cluster, info] of Object.entries(gscGapData.cluster_summary)) {
      html += `<div style="padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;">
        <div style="font-weight: 600; color: var(--accent);">${cluster}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">${info.count} queries · ${info.total_impressions} imp · avg pos ${info.avg_position}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Top: "${info.top_query}"</div>
      </div>`;
    }
    html += '</div>';
  }

  // Top opportunities
  html += '<h3 style="margin-bottom: 12px;">Top 10 Real Opportunities</h3>';
  html += '<table class="opps-table"><thead><tr><th>#</th><th>Type</th><th>Query</th><th>Imp</th><th>Pos</th><th>Score</th><th>Cluster</th></tr></thead><tbody>';
  for (let i = 0; i < Math.min(10, opps.length); i++) {
    const o = opps[i];
    const typeClass = o.type === 'quick_win' ? 'priority-high' : (o.type === 'content_gap' ? 'priority-medium' : 'priority-low');
    html += `<tr>
      <td>${i + 1}</td>
      <td><span class="priority-badge ${typeClass}">${o.type.replace('_', ' ')}</span></td>
      <td><strong>${escapeHtml(o.query)}</strong></td>
      <td>${o.impressions}</td>
      <td>${o.position.toFixed(1)}</td>
      <td>${o.opportunity_score}</td>
      <td>${escapeHtml(o.cluster || 'unmapped')}</td>
    </tr>`;
  }
  html += '</tbody></table>';

  // All opportunities
  html += '<h3 style="margin: 24px 0 12px;">All Queries</h3>';
  html += '<table class="opps-table"><thead><tr><th>Query</th><th>Imp</th><th>Clicks</th><th>Pos</th><th>CTR</th><th>Cluster</th></tr></thead><tbody>';
  for (const o of opps) {
    html += `<tr>
      <td>${escapeHtml(o.query)}</td>
      <td>${o.impressions}</td>
      <td>${o.clicks}</td>
      <td>${o.position.toFixed(1)}</td>
      <td>${o.ctr.toFixed(1)}%</td>
      <td>${escapeHtml(o.cluster || 'unmapped')}</td>
    </tr>`;
  }
  html += '</tbody></table>';

  container.innerHTML = html;
}

function updateSourceIndicator() {
  const el = document.getElementById('data-source');
  if (!el) return;
  if (lastDataSource === 'live') {
    el.textContent = '🟢 Live';
    el.style.color = 'var(--accent)';
  } else if (lastDataSource === 'cached') {
    el.textContent = '🟡 Cached (last update from GitHub)';
    el.style.color = 'var(--warn)';
  } else {
    el.textContent = '🔴 Offline';
    el.style.color = 'var(--danger)';
  }
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      if (!tabName || tab.disabled) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tabName).classList.add('active');
    });
  });
}

function setupBlogFilters() {
  const filterSelect = document.getElementById('blog-filter');
  if (filterSelect) filterSelect.addEventListener('change', e => {
    currentBlogFilter = e.target.value;
    renderBlogs();
  });
  document.getElementById('blog-show-real')?.addEventListener('change', renderBlogs);
  document.getElementById('blog-show-placeholder')?.addEventListener('change', renderBlogs);
}

function renderStats() {
  const drafts = jobsData.filter(j => j.approval_status === 'pending_approval').length;
  document.getElementById('blogs-badge').textContent = drafts || jobsData.length;
  document.getElementById('opps-badge').textContent = jobsData.length;
}

function renderOpportunities() {
  const tbody = document.getElementById('opps-tbody');
  if (!tbody) return;
  if (jobsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No jobs in pipeline yet.</td></tr>';
    return;
  }
  tbody.innerHTML = jobsData.map((job, idx) => {
    const source = job.gap_source || 'topic_cluster';
    const keyword = job.keyword || '(no keyword)';
    const created = job.created_at ? new Date(job.created_at).toLocaleDateString() : '';
    const blogReady = job.blog_status === 'ready';
    const imageReady = job.image_status === 'ready';
    const published = job.approval_status === 'published';
    return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td><span class="priority-badge ${published ? 'priority-low' : blogReady && imageReady ? 'priority-high' : 'priority-medium'}">${published ? 'published' : blogReady && imageReady ? 'ready' : 'pending'}</span></td>
        <td>
          <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(keyword)}</div>
          <div style="color: var(--text-secondary); font-size: 12px;">Cluster: ${escapeHtml(job.cluster || '')}</div>
          <div style="margin-top: 6px;">
            <span class="cat-badge">blog:${escapeHtml(job.blog_status)}</span>
            <span class="cat-badge">img:${escapeHtml(job.image_status)}</span>
            ${job.approval_status ? `<span class="cat-badge">${escapeHtml(job.approval_status)}</span>` : ''}
          </div>
        </td>
        <td><span class="cat-badge">${escapeHtml(source)}</span></td>
        <td>${created}</td>
        <td><span class="cat-badge">${escapeHtml(job.gap_id)}</span></td>
        <td>
          ${job.wp_draft_url ? `<a href="${job.wp_draft_url}" target="_blank" class="btn-secondary">Draft</a>` : '<span class="cat-badge">no draft</span>'}
          ${job.wp_live_url ? `<a href="${job.wp_live_url}" target="_blank" class="btn-grab">Live ↗</a>` : ''}
        </td>
      </tr>`;
  }).join('');
}

function renderBlogs() {
  const list = document.getElementById('blog-list');
  if (!list) return;
  const showReal = document.getElementById('blog-show-real')?.checked ?? true;
  const showPlaceholder = document.getElementById('blog-show-placeholder')?.checked ?? true;

  let filtered = jobsData.filter(b => {
    if (currentBlogFilter !== 'all' && b.approval_status !== currentBlogFilter) return false;
    const isPlaceholder = !b.image_url || b.featured_image_source === 'placeholder';
    if (!isPlaceholder && !showReal) return false;
    if (isPlaceholder && !showPlaceholder) return false;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="loading">No blogs in pipeline yet.</div>';
    return;
  }

  list.innerHTML = filtered.map(blog => {
    const isPending = blog.approval_status === 'pending_approval';
    const isPublished = blog.approval_status === 'published';
    const isPlaceholder = !blog.image_url || blog.featured_image_source === 'placeholder';
    const dateLabel = blog.published_at ? new Date(blog.published_at).toLocaleDateString() : (blog.draft_created_at ? new Date(blog.draft_created_at).toLocaleDateString() : new Date(blog.created_at).toLocaleDateString());
    const title = blog.draft_title || blog.blog_meta_title || blog.keyword || '(no title)';
    const excerpt = blog.blog_excerpt || (blog.blog_text ? blog.blog_text.slice(0, 200) + '...' : '(no content yet)');
    const wc = blog.blog_word_count || 0;
    const imageSrc = blog.image_url || '';
    return `
      <div class="blog-card">
        <div class="blog-card-image ${isPlaceholder ? 'placeholder' : ''}" style="background-image: url('${imageSrc}');">
          <span class="img-badge">${isPlaceholder ? '⚠️ NO IMG' : '📷 Real'}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${escapeHtml(blog.cluster || 'no cluster')}</span>
            ${wc ? `<span>${wc} words</span>` : ''}
            <span>${dateLabel}</span>
          </div>
          <div class="blog-card-title">${escapeHtml(title)}</div>
          <div class="blog-card-excerpt">${escapeHtml(excerpt)}</div>
          <div class="blog-card-actions">
            ${blog.wp_draft_url ? `<a href="${blog.wp_draft_url}" target="_blank" class="btn-secondary">Open Draft</a>` : ''}
            ${isPending ? `<button class="btn-approve" data-id="${escapeHtml(blog.gap_id)}">✓ Approve</button><button class="btn-reject" data-id="${escapeHtml(blog.gap_id)}">✗ Reject</button>` : ''}
            ${blog.approval_status ? `<span class="status-pill status-${escapeHtml(blog.approval_status)}">${formatStatus(blog.approval_status)}</span>` : ''}
          </div>
          ${isPublished && blog.wp_live_url ? `<div style="margin-top: 8px; font-size: 12px;"><a href="${blog.wp_live_url}" target="_blank" style="color: var(--accent);">${blog.wp_live_url}</a></div>` : ''}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', e => approveBlog(e.target.dataset.id));
  });
  list.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', e => rejectBlog(e.target.dataset.id));
  });
}

function renderArchitecture() {
  const container = document.getElementById('architecture-content');
  if (!container) return;
  if (!architecture) {
    container.innerHTML = '<div class="loading">Loading link graph...</div>';
    return;
  }
  const tm = architecture.topical_map || {};
  const cats = architecture.product_categories || [];
  const posts = architecture.existing_posts || [];

  let html = `<div style="margin-bottom: 24px;">
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${architecture.totals.products}</div><div class="stat-label">Real products</div></div>
      <div class="stat-card"><div class="stat-value">${architecture.totals.product_categories}</div><div class="stat-label">Product categories</div></div>
      <div class="stat-card"><div class="stat-value">${architecture.totals.existing_posts}</div><div class="stat-label">Existing posts</div></div>
      <div class="stat-card highlight"><div class="stat-value">${Object.keys(tm).length}</div><div class="stat-label">Active topic clusters</div></div>
    </div>
  </div>`;

  html += '<h3 style="margin-bottom: 12px;">Topic Clusters → Hub Categories → Products</h3>';

  for (const [clusterKey, cluster] of Object.entries(tm)) {
    const products = cluster.product_samples || [];
    const relatedPosts = cluster.related_existing_posts || [];
    html += `
      <div class="cluster-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 600; font-size: 15px; color: var(--accent);">${clusterKey}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Hub: <a href="${cluster.hub_category_url}" target="_blank">${cluster.hub_category_name}</a></div>
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Linked products (${products.length})</div>
          ${products.length === 0 ? '<div style="font-size: 12px; color: var(--text-muted);">No products yet</div>' : products.map(p => `<a href="${p}" target="_blank" class="cat-badge" style="margin: 2px; text-decoration: none; display: inline-block;">${p.split('/product/')[1]?.slice(0, 40) || p.slice(-30)}...</a>`).join('')}
        </div>
        <div>
          <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Related existing posts (${relatedPosts.length})</div>
          ${relatedPosts.length === 0 ? '<div style="font-size: 12px; color: var(--text-muted);">None yet</div>' : `<div style="font-size: 12px;">${relatedPosts.slice(0, 3).map(p => `<a href="${p}" target="_blank" style="color: var(--text-secondary); display: block; padding: 2px 0;">${p.split('/').slice(-2, -1)[0] || p}</a>`).join('')}${relatedPosts.length > 3 ? `<div style="color: var(--text-muted);">+${relatedPosts.length - 3} more</div>` : ''}</div>`}
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
          <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Sample blog topics for this cluster</div>
          ${(cluster.blog_topic_examples || []).map(t => `<div style="font-size: 12px; color: var(--text-primary); padding: 2px 0;">• ${escapeHtml(t)}</div>`).join('')}
        </div>
      </div>`;
  }

  container.innerHTML = html;
}

async function approveBlog(gapId) {
  if (!confirm(`Approve and publish ${gapId}?`)) return;
  try {
    const res = await fetch(HELPER_URL + '/approve', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({gap_id: gapId}) });
    const data = await res.json();
    if (data.success) { alert(`✅ Published! ${data.wp_live_url || ''}`); await loadJobs(); renderBlogs(); renderOpportunities(); }
    else { alert(`Failed: ${data.error || 'unknown'}`); }
  } catch (e) { alert('Network error: ' + e.message); }
}

async function rejectBlog(gapId) {
  if (!confirm(`Reject and delete ${gapId}?`)) return;
  try {
    const res = await fetch(HELPER_URL + '/reject', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({gap_id: gapId}) });
    const data = await res.json();
    if (data.success) { alert('❌ Rejected'); await loadJobs(); renderBlogs(); renderOpportunities(); }
    else { alert(`Failed: ${data.error || 'unknown'}`); }
  } catch (e) { alert('Network error: ' + e.message); }
}

function formatStatus(s) {
  return {'pending_approval': 'Pending', 'published': 'Published', 'rejected': 'Rejected', 'failed': 'Failed', 'writing': 'Writing', 'generating': 'Generating', 'pending': 'Pending'}[s] || s;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}

document.addEventListener('DOMContentLoaded', init);