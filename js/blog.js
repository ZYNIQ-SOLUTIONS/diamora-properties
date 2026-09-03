document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') 
    ? window.location.origin + '/api' 
    : 'http://localhost:5000/api';

  const blogGrid = document.getElementById('blog-grid');
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const searchInput = document.getElementById('blog-search-input');
  let currentCategory = 'all';
  let searchQuery = '';
  let searchTimer = null;

  async function fetchPosts() {
    try {
      if (blogGrid) {
        blogGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--blog-muted); font-size: 0.95rem;">Loading sovereign market intelligence...</div>';
      }
      let url = `${API_BASE}/blog?status=published&limit=50`;
      if (currentCategory !== 'all') {
        url += `&category=${encodeURIComponent(currentCategory)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      const data = await res.json();
      renderPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      if (blogGrid) blogGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--blog-muted);">Failed to load insights. Please try again later.</div>';
    }
  }

  function renderPosts(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';
    
    if (posts.length === 0) {
      blogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(20, 21, 27, 0.6); border: 1px dashed var(--blog-border); border-radius: 12px;">
          <p style="color: var(--blog-gold); font-family: 'Cinzel', serif; font-size: 1.2rem; margin-bottom: 8px;">No Insights Found</p>
          <p style="color: var(--blog-muted); font-size: 0.9rem; margin-bottom: 20px;">No articles currently match your search or filter criteria.</p>
          <button type="button" onclick="window.resetBlogFilters()" style="background: var(--blog-gold); color: #000; border: none; padding: 8px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Reset Filters</button>
        </div>
      `;
      return;
    }

    posts.forEach(post => {
      const a = document.createElement('a');
      const postSlug = post.slug || post._id;
      a.href = `blog-post.html?slug=${encodeURIComponent(postSlug)}`;
      a.className = 'blog-card';
      
      const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      a.innerHTML = `
        <img src="${post.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'}" alt="${post.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'" loading="lazy">
        <div class="blog-card-content">
          <div class="blog-card-category">${post.category || 'Market Insights'}</div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${post.excerpt || ''}</p>
          <div class="blog-card-meta">
            <span>${date}</span>
            <span>${post.readTime || 1} min read</span>
          </div>
        </div>
      `;
      blogGrid.appendChild(a);
    });
  }

  // Reset helper
  window.resetBlogFilters = function() {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    filterBtns.forEach(b => {
      b.classList.toggle('active', (b.dataset.category || 'all') === 'all');
    });
    fetchPosts();
  };

  // Search input with debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        fetchPosts();
      }, 350);
    });
  }

  // Filter category events
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category || 'all';
      fetchPosts();
    });
  });

  // Init
  fetchPosts();
});
