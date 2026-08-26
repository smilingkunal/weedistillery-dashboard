// WeeDistillery Marketing Dashboard - LIVE DATA version
// Reads from the helper API at https://a96e2ad4a51497.lhr.life

const HELPER_URL = 'https://32f176651988c25b-223-185-54-142.serveousercontent.com';

let jobsData = [];
let stats = {};
let currentBlogFilter = 'all';

async function init() {
  await loadJobs();
  setupTabs();
  setupBlogFilters();
  renderStats();
  renderOpportunities();
  renderBlogs();

  // Auto-refresh every 30 seconds
  setInterval(async () => {
    await loadJobs();
    renderStats();
    renderOpportunities();
    renderBlogs();
  }, 30000);
}

async function loadJobs() {
  try {
    const res = await fetch(HELPER_URL + '/dashboard-data');
    const data = await res.json();
    if (data.success) {
      jobsData = data.jobs || [];
      stats = data.stats || {};
    }
  } catch (e) {
    console.error('Failed to load jobs:', e);
    // Show helpful error in UI
    document.getElementById('helper-error')?.classList.remove('hidden');
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
  // Update the badges in the tabs
  const drafts = jobsData.filter(j => j.approval_status === 'pending_approval').length;
  document.getElementById('blogs-badge').textContent = drafts || jobsData.length;
  document.getElementById('opps-badge').textContent = jobsData.length;
}

function renderOpportunities() {
  const tbody = document.getElementById('opps-tbody');
  if (!tbody) return;

  if (jobsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No jobs yet. The pipeline will populate this when Module C runs.</td></tr>';
    return;
  }

  // Show all jobs as "opportunities" (any gap is an opportunity to act on)
  tbody.innerHTML = jobsData.map((job, idx) => {
    const source = job.gap_source || 'topic_cluster';
    const cluster = job.cluster || '';
    const keyword = job.keyword || '(no keyword)';
    const created = job.created_at ? new Date(job.created_at).toLocaleDateString() : '';
    const blogReady = job.blog_status === 'ready';
    const imageReady = job.image_status === 'ready';
    const published = job.approval_status === 'published';

    return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>
          <span class="priority-badge ${published ? 'priority-low' : blogReady && imageReady ? 'priority-high' : 'priority-medium'}">
            ${published ? 'published' : blogReady && imageReady ? 'ready' : 'pending'}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; margin-bottom: 4px;">${keyword}</div>
          <div style="color: var(--text-secondary); font-size: 12px;">Cluster: ${cluster}</div>
          <div style="margin-top: 6px;">
            <span class="cat-badge">blog:${job.blog_status}</span>
            <span class="cat-badge">img:${job.image_status}</span>
            ${job.approval_status ? `<span class="cat-badge">${job.approval_status}</span>` : ''}
          </div>
        </td>
        <td><span class="cat-badge">${source}</span></td>
        <td>${created}</td>
        <td><span class="cat-badge">${job.gap_id}</span></td>
        <td>
          ${job.wp_draft_url ? `<a href="${job.wp_draft_url}" target="_blank" class="btn-secondary">View Draft</a>` : '<span class="cat-badge">no draft yet</span>'}
          ${job.wp_live_url ? `<a href="${job.wp_live_url}" target="_blank" class="btn-grab">Live ↗</a>` : ''}
        </td>
      </tr>
    `;
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
    list.innerHTML = '<div class="loading">No blogs yet. Run the pipeline to generate content.</div>';
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
          <span class="img-badge">${isPlaceholder ? '⚠️ NO IMAGE' : '📷 Real'}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${blog.cluster || 'no cluster'}</span>
            ${wc ? `<span>${wc} words</span>` : ''}
            <span>${dateLabel}</span>
          </div>
          <div class="blog-card-title">${escapeHtml(title)}</div>
          <div class="blog-card-excerpt">${escapeHtml(excerpt)}</div>
          <div class="blog-card-actions">
            ${blog.wp_draft_url ? `<a href="${blog.wp_draft_url}" target="_blank" class="btn-secondary">Open Draft</a>` : ''}
            ${isPending ? `
              <button class="btn-approve" data-id="${blog.gap_id}">✓ Approve</button>
              <button class="btn-reject" data-id="${blog.gap_id}">✗ Reject</button>
            ` : ''}
            ${blog.approval_status ? `<span class="status-pill status-${blog.approval_status}">${formatStatus(blog.approval_status)}</span>` : ''}
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

async function approveBlog(gapId) {
  if (!confirm(`Approve and publish ${gapId}?`)) return;
  try {
    const res = await fetch(HELPER_URL + '/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gap_id: gapId }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ Published!\n\n${data.wp_live_url || ''}`);
      await loadJobs();
      renderBlogs();
      renderOpportunities();
    } else {
      alert(`Failed: ${data.error || 'unknown'}`);
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}

async function rejectBlog(gapId) {
  if (!confirm(`Reject and delete ${gapId}?`)) return;
  try {
    const res = await fetch(HELPER_URL + '/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gap_id: gapId }),
    });
    const data = await res.json();
    if (data.success) {
      alert('❌ Rejected');
      await loadJobs();
      renderBlogs();
      renderOpportunities();
    } else {
      alert(`Failed: ${data.error || 'unknown'}`);
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
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