const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('dashboard/index.html', 'utf8');

// Insert Blog Stat Card
const statCardHtml = `
        <div class="stat-card">
          <div class="stat-card-title">Published Blog Posts</div>
          <div class="stat-card-val" id="stat-total-blogs">0</div>
          <div class="stat-card-sub" style="color: var(--gold-light);">
            Market Insights & News
          </div>
        </div>
`;
html = html.replace('</section>\n\n      <!-- Navigation Tabs -->', statCardHtml + '      </section>\n\n      <!-- Navigation Tabs -->');

// Insert Blog Tab Button
const tabButtonHtml = `
        <button type="button" class="dash-tab-btn" data-tab="tab-blog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Blog Management</span>
          <span class="tab-badge" id="badge-blog-count">0</span>
        </button>
`;
html = html.replace('<!-- =====================================================================', tabButtonHtml + '\n      <!-- =====================================================================');

// Insert Blog Tab Pane
const tabPaneHtml = `
      <!-- =====================================================================
           TAB 4: BLOG MANAGEMENT
           ===================================================================== -->
      <section id="tab-blog" class="tab-pane" style="display: none;">
        <div class="control-bar">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="blog-search-input" placeholder="Search blog posts...">
          </div>
          
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <select id="blog-status-filter" class="form-select" style="padding: 7px 12px; font-size: 0.82rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-gold); border-radius: var(--radius-xs);">
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button type="button" id="btn-open-blog-modal" class="btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add New Post</span>
            </button>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="dash-table" id="blog-table">
              <thead>
                <tr>
                  <th>Post Detail</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Read Time</th>
                  <th>Views</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="blog-tbody">
                <!-- Rows injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
`;
html = html.replace('<!-- =====================================================================\n           TAB 3: SYSTEM & DATABASE SETTINGS', tabPaneHtml + '\n      <!-- =====================================================================\n           TAB 3: SYSTEM & DATABASE SETTINGS');

// Insert Blog Modal
const blogModalHtml = `
  <!-- =========================================================================
       4. BLOG MODAL (ADD / EDIT)
       ========================================================================= -->
  <div id="blog-modal" class="modal-backdrop" style="display: none;">
    <div class="modal-content" style="max-width: 900px;">
      <div class="modal-header">
        <h3 id="blog-modal-title" class="font-serif">Add New Blog Post</h3>
        <button type="button" id="btn-close-blog-modal" class="modal-close-btn">&times;</button>
      </div>

      <form id="blog-form">
        <input type="hidden" id="blog-id">

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="blog-title" class="form-label">Post Title</label>
          <input type="text" id="blog-title" class="form-input" required>
        </div>

        <div class="modal-grid-2" style="margin-bottom: 16px;">
          <div class="form-group">
            <label for="blog-category" class="form-label">Category</label>
            <select id="blog-category" class="form-select" required>
              <option value="Market Insights">Market Insights</option>
              <option value="Investment Tips">Investment Tips</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="UAE Property News">UAE Property News</option>
              <option value="Area Guides">Area Guides</option>
              <option value="Developer News">Developer News</option>
              <option value="Buyer Guides">Buyer Guides</option>
              <option value="Legal & Finance">Legal & Finance</option>
            </select>
          </div>
          <div class="form-group">
            <label for="blog-status" class="form-label">Status</label>
            <select id="blog-status" class="form-select" required>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="blog-excerpt" class="form-label">Excerpt (Short Summary)</label>
          <textarea id="blog-excerpt" class="form-textarea" rows="2" required></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="blog-cover" class="form-label">Cover Image URL</label>
          <input type="text" id="blog-cover" class="form-input" placeholder="https://...">
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="blog-content" class="form-label">Content (HTML)</label>
          <textarea id="blog-content" class="form-textarea" rows="10" required></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label"><input type="checkbox" id="blog-featured"> Featured Post</label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button type="button" id="btn-cancel-blog-modal" class="btn-secondary">Cancel</button>
          <button type="submit" id="blog-save-btn" class="btn-primary">Save Post</button>
        </div>
      </form>
    </div>
  </div>
`;
html = html.replace('<!-- Toast Notification -->', blogModalHtml + '\n  <!-- Toast Notification -->');

fs.writeFileSync('dashboard/index.html', html);
console.log('index.html updated successfully.');
