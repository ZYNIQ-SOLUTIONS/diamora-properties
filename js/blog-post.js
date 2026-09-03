document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') 
    ? window.location.origin + '/api' 
    : 'http://localhost:5000/api';

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    window.location.href = '/blog.html';
    return;
  }

  async function fetchPost() {
    try {
      const res = await fetch(`${API_BASE}/blog/${slug}`);
      if (!res.ok) throw new Error('Post not found');
      const post = await res.json();
      renderPost(post);
    } catch (err) {
      console.error(err);
      document.getElementById('post-container').innerHTML = '<p style="text-align:center;padding:100px;">Article not found. <a href="/blog.html">Return to Blog</a></p>';
    }
  }

  function renderPost(post) {
    // Update Meta SEO tags
    document.title = post.seoTitle || `${post.title} | Diamora Properties`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", post.seoDescription || post.excerpt);

    // Update DOM
    document.getElementById('post-category').textContent = post.category;
    document.getElementById('post-title').textContent = post.title;
    
    const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('post-date').textContent = date;
    document.getElementById('post-read-time').textContent = `${post.readTime} min read`;
    
    const img = document.getElementById('post-hero-img');
    img.src = post.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80';
    img.alt = post.title;

    document.getElementById('post-content').innerHTML = post.content || '';

    // Scroll progress bar
    const progressBar = document.getElementById('reading-progress');
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (progressBar) progressBar.style.width = scrolled + '%';
    });
  }

  fetchPost();
});
