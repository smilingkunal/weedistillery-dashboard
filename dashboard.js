// WeeDistillery Marketing Dashboard - JS
// Loads mock data, renders tabs, handles inline approve/reject

let oppsData = [];
let blogsData = [];
let currentBlogFilter = 'all';

async function init() {
  await Promise.all([loadOpportunities(), loadBlogs()]);
  setupTabs();
  setupBlogFilters();
  renderOpportunities();
  renderBlogs();
}

async function loadOpportunities() {
  try {
    const res = await fetch('data/opportunities.json');
    const data = await res.json();
    oppsData = data.opportunities || [];
    const stats = data.stats || {};
    if (document.getElementById('opps-badge')) document.getElementById('opps-badge').textContent = oppsData.length;
    if (document.getElementById('stat-high')) document.getElementById('stat-high').textContent = stats.high_impact || 0;
    if (document.getElementById('stat-medium')) document.getElementById('stat-medium').textContent = stats.medium_impact || 0;
    if (document.getElementById('stat-low')) document.getElementById('stat-low').textContent = stats.low_impact || 0;
    if (document.getElementById('stat-uplift')) {
      const total = oppsData.reduce((sum, o) => {
        const m = (o.est_traffic_uplift || '').match(/\+(\d+)/);
        return sum + (m ? parseInt(m[1]) : 0);
      }, 0);
      document.getElementById('stat-uplift').textContent = '+' + total;
    }
  } catch (e) {
    console.error('Failed to load opportunities:', e);
  }
}

async function loadBlogs() {
  try {
    const res = await fetch('data/blogs.json');
    const data = await res.json();
    blogsData = data.drafts || [];
    const stats = data.stats || {};
    if (document.getElementById('blogs-badge')) document.getElementById('blogs-badge').textContent = blogsData.length;
    if (document.getElementById('blog-stat-drafts')) document.getElementById('blog-stat-drafts').textContent = stats.drafts_total || 0;
    if (document.getElementById('blog-stat-published')) document.getElementById('blog-stat-published').textContent = stats.published_this_week || 0;
    if (document.getElementById('blog-stat-rejected')) document.getElementById('blog-stat-rejected').textContent = stats.rejected_this_week || 0;
    if (document.getElementById('blog-stat-time')) document.getElementById('blog-stat-time').textContent = stats.avg_time_to_publish_hours + 'h';
  } catch (e) {
    console.error('Failed to load blogs:', e);
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
  document.querySelectorAll('.filter-bar input[data-filter]').forEach(cb => {
    cb.addEventListener('change', renderOpportunities);
  });
  const filterSelect = document.getElementById('blog-filter');
  if (filterSelect) filterSelect.addEventListener('change', e => {
    currentBlogFilter = e.target.value;
    renderBlogs();
  });
  document.getElementById('blog-show-real')?.addEventListener('change', renderBlogs);
  document.getElementById('blog-show-placeholder')?.addEventListener('change', renderBlogs);
}

function renderOpportunities() {
  const tbody = document.getElementById('opps-tbody');
  if (!tbody) return;

  const activeImpacts = Array.from(document.querySelectorAll('input[data-filter="impact"]:checked')).map(c => c.value);
  const activeCategories = Array.from(document.querySelectorAll('input[data-filter="category"]:checked')).map(c => c.value);

  const filtered = oppsData.filter(o =>
    activeImpacts.includes(o.impact) && activeCategories.includes(o.category)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No opportunities match your filters</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((opp, idx) => `
    <tr>
      <td><strong>${idx + 1}</strong></td>
      <td><span class="priority-badge priority-${opp.impact}">${opp.impact}</span></td>
      <td>
        <div style="font-weight: 600; margin-bottom: 4px;">${opp.title}</div>
        <div style="color: var(--text-secondary); font-size: 12px;">${opp.context}</div>
        <div style="margin-top: 6px;"><span class="cat-badge">${opp.cluster || opp.category}</span></div>
      </td>
      <td><span class="cat-badge">${opp.source}</span></td>
      <td><span class="lift">${opp.est_traffic_uplift}</span></td>
      <td><span class="cat-badge">${opp.action}</span></td>
      <td>
        <button class="btn-grab" data-id="${opp.id}" data-title="${escapeHtml(opp.title)}">
          Grab →
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-grab').forEach(btn => {
    btn.addEventListener('click', e => grabOpportunity(e.target.dataset.id, e.target.dataset.title));
  });
}

function renderBlogs() {
  const list = document.getElementById('blog-list');
  if (!list) return;

  const showReal = document.getElementById('blog-show-real')?.checked ?? true;
  const showPlaceholder = document.getElementById('blog-show-placeholder')?.checked ?? true;

  let filtered = blogsData.filter(b => {
    if (currentBlogFilter !== 'all' && b.approval_status !== currentBlogFilter) return false;
    if (b.image_source === 'pexels' && !showReal) return false;
    if (b.image_source === 'placeholder' && !showPlaceholder) return false;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="loading">No blogs match your filters</div>';
    return;
  }

  list.innerHTML = filtered.map(blog => {
    const isPending = blog.approval_status === 'pending_approval';
    const isPublished = blog.approval_status === 'published';
    const dateLabel = blog.published_at ? new Date(blog.published_at).toLocaleDateString() : new Date(blog.created_at).toLocaleDateString();

    return `
      <div class="blog-card">
        <div class="blog-card-image ${blog.image_source === 'placeholder' ? 'placeholder' : ''}" style="background-image: url('${blog.image_url}');">
          <span class="img-badge">${blog.image_source === 'placeholder' ? '⚠️ PLACEHOLDER' : '📷 Real'}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${blog.cluster}</span>
            <span>${blog.word_count} words</span>
            <span>${dateLabel}</span>
          </div>
          <div class="blog-card-title">${blog.title}</div>
          <div class="blog-card-excerpt">${blog.blog_excerpt}</div>
          <div class="blog-card-actions">
            <a href="${blog.wp_draft_url}" target="_blank" class="btn-secondary">Open in WP</a>
            ${isPending ? `
              <button class="btn-approve" data-id="${blog.gap_id}">✓ Approve</button>
              <button class="btn-reject" data-id="${blog.gap_id}">✗ Reject</button>
            ` : ''}
            <span class="status-pill status-${blog.approval_status}">${formatStatus(blog.approval_status)}</span>
          </div>
          ${isPublished && blog.wp_live_url ? `
            <div style="margin-top: 8px; font-size: 12px;">
              <a href="${blog.wp_live_url}" target="_blank" style="color: var(--accent);">${blog.wp_live_url}</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', e => approveBlog(e.target.dataset.id));
  });
  list.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', e => rejectBlog(e.target.dataset.id));
  });
}

function grabOpportunity(id, title) {
  alert(`📌 Pipeline hook would fire:\n\nSend "${title}" (${id}) to content pipeline → creates new row in content_jobs Sheet → Module A + Module B fire in parallel.\n\n(Will work once n8n pipeline ships.)`);
}

function approveBlog(gapId) {
  if (!confirm(`Approve and publish ${gapId}?\n\nThis will set the WP draft status to 'publish' and update the Sheet.`)) return;
  alert(`✅ Approve hook would fire:\n\nPOST to n8n webhook /wi-approval with cmd=APPROVE gap_id=${gapId}\n→ Module D will publish the WP draft.\n\n(Will work once n8n pipeline ships.)`);
}

function rejectBlog(gapId) {
  if (!confirm(`Reject and delete ${gapId}?\n\nThis will delete the WP draft and mark the Sheet row as rejected.`)) return;
  alert(`❌ Reject hook would fire:\n\nPOST to n8n webhook /wi-approval with cmd=REJECT gap_id=${gapId}\n→ Module D will delete the WP draft.\n\n(Will work once n8n pipeline ships.)`);
}

function formatStatus(s) {
  return {
    'pending_approval': 'Pending review',
    'published': 'Published',
    'rejected': 'Rejected',
    'failed': 'Failed',
    'writing': 'Writing',
    'generating': 'Generating',
    'pending': 'Pending'
  }[s] || s;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

document.addEventListener('DOMContentLoaded', init);