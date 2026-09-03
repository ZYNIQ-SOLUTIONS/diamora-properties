document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') 
    ? window.location.origin + '/api' 
    : 'http://localhost:5000/api';

  const blogGrid = document.getElementById('blog-grid');
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  let currentCategory = 'all';

  async function fetchPosts() {
    try {
      let url = `${API_BASE}/blog?status=published`;
      if (currentCategory !== 'all') {
        url += `&category=${encodeURIComponent(currentCategory)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      const data = await res.json();
      renderPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      if (blogGrid) blogGrid.innerHTML = '<p style="text-align:center;width:100%;">Failed to load insights. Please try again later.</p>';
    }
  }

  function renderPosts(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';
    
    if (posts.length === 0) {
      blogGrid.innerHTML = '<p style="text-align:center;width:100%;color:var(--blog-muted);">No insights available in this category yet.</p>';
      return;
    }

    posts.forEach(post => {
      const a = document.createElement('a');
      a.href = `/blog-post.html?slug=${post.slug}`;
      a.className = 'blog-card';
      
      const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      a.innerHTML = `
        <img src="${post.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'}" alt="${post.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'">
        <div class="blog-card-content">
          <div class="blog-card-category">${post.category}</div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${post.excerpt}</p>
          <div class="blog-card-meta">
            <span>${date}</span>
            <span>${post.readTime} min read</span>
          </div>
        </div>
      `;
      blogGrid.appendChild(a);
    });
  }

  // Filter events
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
