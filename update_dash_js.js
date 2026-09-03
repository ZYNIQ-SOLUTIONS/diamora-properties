const fs = require('fs');

let js = fs.readFileSync('dashboard/dashboard.js', 'utf8');

// 1. Add blog state array
js = js.replace('let properties = [];', 'let properties = [];\nlet blogPosts = [];');

// 2. Add blog to loadDashboardData
js = js.replace('await Promise.all([fetchProperties(), fetchInquiries()]);', 'await Promise.all([fetchProperties(), fetchInquiries(), fetchBlogPosts()]);');

// 3. Add blog to live polling
js = js.replace('await fetchInquiries();\n      updateMetricCards();', 'await fetchInquiries();\n      await fetchBlogPosts();\n      updateMetricCards();');

// 4. Update metrics
js = js.replace('if (inqCountBadge) inqCountBadge.textContent = inquiries.length;', 'if (inqCountBadge) inqCountBadge.textContent = inquiries.length;\n  const badgeBlogCount = document.getElementById(\'badge-blog-count\');\n  if (badgeBlogCount) badgeBlogCount.textContent = blogPosts.length;\n  const statTotalBlogs = document.getElementById(\'stat-total-blogs\');\n  if (statTotalBlogs) statTotalBlogs.textContent = blogPosts.filter(p => p.status === \'published\').length;');

// 5. Append all the rest of the blog logic
const blogLogic = `
/**
 * =========================================================================
 * BLOG MANAGEMENT LOGIC
 * =========================================================================
 */
const blogTbody = document.getElementById('blog-tbody');
const blogModal = document.getElementById('blog-modal');
const blogForm = document.getElementById('blog-form');
const btnOpenBlogModal = document.getElementById('btn-open-blog-modal');
const btnCloseBlogModal = document.getElementById('btn-close-blog-modal');
const btnCancelBlogModal = document.getElementById('btn-cancel-blog-modal');
const blogModalTitle = document.getElementById('blog-modal-title');
const blogSearchInput = document.getElementById('blog-search-input');
const blogStatusFilter = document.getElementById('blog-status-filter');

if (btnOpenBlogModal) btnOpenBlogModal.addEventListener('click', () => openBlogModal());
if (btnCloseBlogModal) btnCloseBlogModal.addEventListener('click', closeBlogModal);
if (btnCancelBlogModal) btnCancelBlogModal.addEventListener('click', closeBlogModal);
if (blogSearchInput) blogSearchInput.addEventListener('input', filterBlogPosts);
if (blogStatusFilter) blogStatusFilter.addEventListener('change', filterBlogPosts);
if (blogForm) blogForm.addEventListener('submit', handleBlogSubmit);

async function fetchBlogPosts() {
  if (isLiveApiConnected) {
    try {
      const res = await fetch(\`\${API_BASE}/blog?limit=100\`);
      if (res.ok) {
        const data = await res.json();
        blogPosts = data.posts || [];
        renderBlogTable(blogPosts);
        return;
      }
    } catch (e) {
      console.warn('API error fetching blogs');
    }
  }
  // Local fallback
  const stored = localStorage.getItem('diamora_blogs');
  if (stored) {
    blogPosts = JSON.parse(stored);
  } else {
    blogPosts = [];
  }
  renderBlogTable(blogPosts);
}

function renderBlogTable(list) {
  if (!blogTbody) return;
  blogTbody.innerHTML = '';
  if (!list || list.length === 0) {
    blogTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">No blog posts found.</td></tr>';
    return;
  }
  list.forEach(post => {
    const tr = document.createElement('tr');
    let badgeClass = post.status === 'published' ? 'badge-available' : 'badge-offmarket';
    const dateFormatted = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft';
    tr.innerHTML = \`
      <td>
        <div class="prop-cell-title">
          <img src="\${post.coverImage || 'https://via.placeholder.com/150'}" alt="Cover" class="prop-cell-thumb" onerror="this.src='https://via.placeholder.com/150'">
          <div>
            <div class="prop-cell-name">\${escapeHtml(post.title)}</div>
            <div class="prop-cell-meta">\${dateFormatted}</div>
          </div>
        </div>
      </td>
      <td>\${escapeHtml(post.category)}</td>
      <td><span class="badge \${badgeClass}">\${escapeHtml(post.status)}</span></td>
      <td>\${post.readTime || 1} min</td>
      <td>\${post.views || 0}</td>
      <td style="text-align: right;">
        <button type="button" class="btn-edit" onclick="openBlogModal('\${post._id}')">Edit</button>
        <button type="button" class="btn-danger" onclick="deleteBlogPost('\${post._id}')">Delete</button>
      </td>
    \`;
    blogTbody.appendChild(tr);
  });
}

function filterBlogPosts() {
  const q = blogSearchInput ? blogSearchInput.value.toLowerCase().trim() : '';
  const status = blogStatusFilter ? blogStatusFilter.value : 'all';
  const filtered = blogPosts.filter(p => {
    const matchStatus = status === 'all' || p.status === status;
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });
  renderBlogTable(filtered);
}

function openBlogModal(id = null) {
  blogForm.reset();
  if (id) {
    blogModalTitle.textContent = 'Edit Blog Post';
    const post = blogPosts.find(p => p._id === id);
    if (post) {
      document.getElementById('blog-id').value = post._id;
      document.getElementById('blog-title').value = post.title;
      document.getElementById('blog-category').value = post.category;
      document.getElementById('blog-status').value = post.status;
      document.getElementById('blog-excerpt').value = post.excerpt;
      document.getElementById('blog-cover').value = post.coverImage || '';
      document.getElementById('blog-content').value = post.content || '';
      document.getElementById('blog-featured').checked = post.featured;
    }
  } else {
    blogModalTitle.textContent = 'Add New Blog Post';
    document.getElementById('blog-id').value = '';
  }
  blogModal.style.display = 'flex';
}

function closeBlogModal() {
  blogModal.style.display = 'none';
}

async function handleBlogSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('blog-id').value;
  const data = {
    title: document.getElementById('blog-title').value,
    category: document.getElementById('blog-category').value,
    status: document.getElementById('blog-status').value,
    excerpt: document.getElementById('blog-excerpt').value,
    coverImage: document.getElementById('blog-cover').value,
    content: document.getElementById('blog-content').value,
    featured: document.getElementById('blog-featured').checked
  };

  const token = localStorage.getItem('diamora_token');
  try {
    const url = id ? \`\${API_BASE}/blog/\${id}\` : \`\${API_BASE}/blog\`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast('Blog post saved');
      closeBlogModal();
      fetchBlogPosts();
      updateMetricCards();
    } else {
      const err = await res.json();
      showToast('Error: ' + err.message);
    }
  } catch (error) {
    showToast('Failed to save blog post');
  }
}

async function deleteBlogPost(id) {
  if (!confirm('Delete this blog post?')) return;
  const token = localStorage.getItem('diamora_token');
  try {
    const res = await fetch(\`\${API_BASE}/blog/\${id}\`, {
      method: 'DELETE',
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (res.ok) {
      showToast('Blog post deleted');
      fetchBlogPosts();
      updateMetricCards();
    }
  } catch (error) {
    showToast('Delete failed');
  }
}
`;

js = js + '\n' + blogLogic;

fs.writeFileSync('dashboard/dashboard.js', js);
console.log('dashboard.js updated successfully.');
