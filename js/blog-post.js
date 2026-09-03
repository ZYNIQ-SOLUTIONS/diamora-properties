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
      const token = localStorage.getItem('diamora_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/blog/${encodeURIComponent(slug)}`, { headers });
      if (!res.ok) throw new Error('Post not found');
      const post = await res.json();
      renderPost(post);
    } catch (err) {
      console.error(err);
      document.getElementById('post-container').innerHTML = `
        <div style="text-align:center; padding:120px 20px; max-width:600px; margin:0 auto;">
          <p style="font-family: 'Cinzel', serif; font-size: 1.5rem; color: var(--blog-gold); margin-bottom: 12px;">Article Not Found</p>
          <p style="color: var(--blog-muted); margin-bottom: 24px;">The requested market briefing may have been relocated or updated.</p>
          <a href="blog.html" style="color: var(--blog-gold); text-decoration: none; border: 1px solid var(--blog-gold); padding: 10px 24px; border-radius: 30px; display: inline-block;">Return to Market Insights</a>
        </div>
      `;
    }
  }

  function renderPost(post) {
    // Update Meta SEO tags
    document.title = post.seoTitle || `${post.title} | Diamora Properties`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", post.seoDescription || post.excerpt);

    // Update DOM
    document.getElementById('post-category').textContent = post.category;
    const titleEl = document.getElementById('post-title');
    titleEl.textContent = post.title;
    titleEl.setAttribute('dir', 'auto');
    
    const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('post-date').textContent = date;
    document.getElementById('post-read-time').textContent = `${post.readTime} min read`;
    const authorEl = document.getElementById('post-author');
    if (authorEl) authorEl.textContent = post.author || 'Diamora Properties';
    
    const img = document.getElementById('post-hero-img');
    img.src = post.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80';
    img.alt = post.title;

    const postContentEl = document.getElementById('post-content');
    postContentEl.setAttribute('dir', 'auto');
    postContentEl.innerHTML = renderDiamoraArticleContent(post.content || '');

  function renderDiamoraArticleContent(raw) {
    if (!raw || !raw.trim()) return '';
    const trimmed = raw.trim();

    // If content contains standard HTML block tags, render as direct clean HTML
    const hasHtmlTags = /<\/?(div|p|h[1-6]|ul|ol|li|table|tr|td|th|article|section|blockquote|header|footer|span|strong|b|em|i|img)[\s>]/i.test(trimmed);
    if (hasHtmlTags) {
      return trimmed;
    }

    // Otherwise render as Markdown
    if (window.marked && typeof window.marked.parse === 'function') {
      try {
        return window.marked.parse(trimmed, { gfm: true, breaks: true });
      } catch (err) {
        return trimmed.replace(/\n/g, '<br>');
      }
    }

    return trimmed.replace(/\n/g, '<br>');
  }

    // Scroll progress bar
    const progressBar = document.getElementById('reading-progress');
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (progressBar) progressBar.style.width = scrolled + '%';
    });

    // Back to top button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  fetchPost();
});
