/**
 * DIAMORA PROPERTIES — EXECUTIVE ADMIN DASHBOARD JAVASCRIPT
 * Full-featured luxury admin portal with dual-mode support:
 * - Live Express/MongoDB API (Custom endpoint or `http://localhost:5000/api`)
 * - Smart LocalStorage fallback for instant standalone offline testing
 */

function getApiBase() {
  const custom = localStorage.getItem('diamora_api_endpoint');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + '/api';
  }
  return 'http://localhost:5000/api';
}

let API_BASE = getApiBase();

// Security helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Pre-seeded fallback luxury properties for immediate offline testing
const DEFAULT_SAMPLE_PROPERTIES = [
  {
    _id: 'prop-1',
    title: 'Palm Jumeirah Waterfront Beach Villa',
    description: 'Ultra-luxury waterfront estate with private beach frontage, infinity pool, sunken firepit lounge, and panoramic skyline views.',
    price: 48000000,
    location: 'Palm Jumeirah, Dubai',
    propertyType: 'Villa',
    bedrooms: 6,
    bathrooms: 7,
    area: 12400,
    imageUrl: 'assets/properties/palm-villa.jpg',
    status: 'Available'
  },
  {
    _id: 'prop-2',
    title: 'Saadiyat Cultural District Townhouse',
    description: 'Contemporary travertine stone townhouse with private plunge pool courtyard, steps from Louvre Abu Dhabi and pristine beach.',
    price: 22500000,
    location: 'Saadiyat Island, Abu Dhabi',
    propertyType: 'Townhouse',
    bedrooms: 4,
    bathrooms: 5,
    area: 5800,
    imageUrl: 'assets/properties/saadiyat-townhouse.jpg',
    status: 'Available'
  },
  {
    _id: 'prop-3',
    title: 'Dubai Hills Golf & Skyline Mansion',
    description: 'Striking 3-tier architectural mansion overlooking championship golf greens with unobstructed Downtown Dubai skyline vistas.',
    price: 36500000,
    location: 'Dubai Hills Estate, Dubai',
    propertyType: 'Mansion',
    bedrooms: 5,
    bathrooms: 6,
    area: 9600,
    imageUrl: 'assets/properties/dubai-hills-mansion.jpg',
    status: 'Available'
  },
  {
    _id: 'prop-4',
    title: 'Downtown Burj Crown Sky Penthouse',
    description: 'Full-floor duplex penthouse crowning an ultra-prime tower with private cantilevered sky pool and 360-degree vistas of Burj Khalifa.',
    price: 65000000,
    location: 'Downtown Dubai, Dubai',
    propertyType: 'Penthouse',
    bedrooms: 5,
    bathrooms: 7,
    area: 14200,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    status: 'Off-Market'
  },
  {
    _id: 'prop-5',
    title: 'Al Bateen Royal Waterfront Residence',
    description: 'Sovereign waterfront villa nestled in the historic royal enclave of Al Bateen with private 90ft yacht berth and landscaped majlis.',
    price: 42000000,
    location: 'Al Bateen, Abu Dhabi',
    propertyType: 'Villa',
    bedrooms: 6,
    bathrooms: 8,
    area: 11500,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    status: 'Available'
  },
  {
    _id: 'prop-6',
    title: 'Yas Island Waterfront Signature Suite',
    description: 'High-yield investment suite directly overlooking Yas Marina circuit with branded concierge services and private access to beach club.',
    price: 8500000,
    location: 'Yas Island, Abu Dhabi',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 3,
    area: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    status: 'Available'
  }
];

// Empty initial inquiries
const DEFAULT_SAMPLE_INQUIRIES = [];

// State variables
let properties = [];
let blogPosts = [];
let inquiries = [];
let isLiveApiConnected = false;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const propertiesTbody = document.getElementById('properties-tbody');
const inquiriesTbody = document.getElementById('inquiries-tbody');

const propertyModal = document.getElementById('property-modal');
const propertyForm = document.getElementById('property-form');
const btnOpenAddModal = document.getElementById('btn-open-add-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const modalTitle = document.getElementById('modal-title');

const propSearchInput = document.getElementById('prop-search-input');
const inqSearchInput = document.getElementById('inq-search-input');
const inqStatusFilter = document.getElementById('inq-status-filter');
const btnRefreshInquiries = document.getElementById('btn-refresh-inquiries');
const btnExportProperties = document.getElementById('btn-export-properties');
const btnExportInquiries = document.getElementById('btn-export-inquiries');

const systemStatusDot = document.getElementById('system-status-dot');
const systemStatusText = document.getElementById('system-status-text');
const btnPingApi = document.getElementById('btn-ping-api');
const pingResult = document.getElementById('ping-result');
const btnResetData = document.getElementById('btn-reset-data');
const customApiInput = document.getElementById('custom-api-endpoint');
const btnSaveApiEndpoint = document.getElementById('btn-save-api-endpoint');

// Lifecycle Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Populate custom endpoint input if set
  if (customApiInput) {
    customApiInput.value = localStorage.getItem('diamora_api_endpoint') || '';
  }

  // Check API connectivity
  await checkApiHealth();

  // Check auth session
  const token = localStorage.getItem('diamora_token');
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }

  // Setup Event Listeners
  initEventListeners();
});

let dashboardLivePollTimer = null;

function showLogin() {
  if (dashboardLivePollTimer) clearInterval(dashboardLivePollTimer);
  loginScreen.style.display = 'flex';
  dashboardScreen.style.display = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'flex';
  loadDashboardData();

  // Real-Time Lead Polling (Every 6 seconds)
  if (dashboardLivePollTimer) clearInterval(dashboardLivePollTimer);
  dashboardLivePollTimer = setInterval(async () => {
    const token = localStorage.getItem('diamora_token');
    if (token && isLiveApiConnected) {
      await fetchInquiries();
      await fetchBlogPosts();
      updateMetricCards();
    }
  }, 6000);
}

/**
 * =========================================================================
 * API & DATA LAYER (Live Express API + LocalStorage Fallback)
 * =========================================================================
 */
async function checkApiHealth() {
  API_BASE = getApiBase();
  if (!API_BASE) {
    isLiveApiConnected = false;
    if (systemStatusDot) systemStatusDot.classList.add('offline');
    if (systemStatusText) systemStatusText.textContent = 'Standalone Mode (Local Storage)';
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      isLiveApiConnected = true;
      if (systemStatusDot) systemStatusDot.classList.remove('offline');
      if (systemStatusText) systemStatusText.textContent = `Connected: ${API_BASE}`;
      return true;
    }
  } catch (err) {
    isLiveApiConnected = false;
    if (systemStatusDot) systemStatusDot.classList.add('offline');
    if (systemStatusText) systemStatusText.textContent = 'Standalone Mode (Local Storage)';
    return false;
  }
}

async function loadDashboardData() {
  await Promise.all([fetchProperties(), fetchInquiries(), fetchBlogPosts()]);
  updateMetricCards();
}

// Fetch Properties
async function fetchProperties() {
  if (isLiveApiConnected) {
    try {
      const res = await fetch(`${API_BASE}/properties`);
      if (res.ok) {
        properties = await res.json();
        renderPropertiesTable(properties);
        return;
      }
    } catch (e) {
      console.warn('API error, falling back to local properties', e);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem('diamora_properties');
  if (stored) {
    properties = JSON.parse(stored);
  } else {
    properties = [...DEFAULT_SAMPLE_PROPERTIES];
    localStorage.setItem('diamora_properties', JSON.stringify(properties));
  }
  renderPropertiesTable(properties);
}

// Fetch Inquiries
async function fetchInquiries() {
  const token = localStorage.getItem('diamora_token');
  if (isLiveApiConnected && token) {
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        inquiries = await res.json();
        renderInquiriesTable(inquiries);
        return;
      }
    } catch (e) {
      console.warn('API error, falling back to local inquiries', e);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem('diamora_inquiries');
  if (stored) {
    inquiries = JSON.parse(stored);
  } else {
    inquiries = [...DEFAULT_SAMPLE_INQUIRIES];
    localStorage.setItem('diamora_inquiries', JSON.stringify(inquiries));
  }
  renderInquiriesTable(inquiries);
}

/**
 * =========================================================================
 * RENDERING FUNCTIONS
 * =========================================================================
 */
function updateMetricCards() {
  const totalPropsEl = document.getElementById('stat-total-props');
  const totalValueEl = document.getElementById('stat-total-value');
  const availablePropsEl = document.getElementById('stat-available-props');
  const totalLeadsEl = document.getElementById('stat-total-leads');
  const propCountBadge = document.getElementById('badge-prop-count');
  const inqCountBadge = document.getElementById('badge-inq-count');

  const totalCount = properties.length;
  const availableCount = properties.filter(p => p.status === 'Available').length;
  const grossValue = properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

  if (totalPropsEl) totalPropsEl.textContent = totalCount;
  if (propCountBadge) propCountBadge.textContent = totalCount;
  if (availablePropsEl) availablePropsEl.textContent = availableCount;
  if (totalLeadsEl) totalLeadsEl.textContent = inquiries.length;
  if (inqCountBadge) inqCountBadge.textContent = inquiries.length;
  const badgeBlogCount = document.getElementById('badge-blog-count');
  if (badgeBlogCount) badgeBlogCount.textContent = blogPosts.length;
  const statTotalBlogs = document.getElementById('stat-total-blogs');
  if (statTotalBlogs) statTotalBlogs.textContent = blogPosts.filter(p => p.status === 'published').length;

  if (totalValueEl) {
    if (grossValue >= 1000000) {
      totalValueEl.textContent = `AED ${(grossValue / 1000000).toFixed(1)}M`;
    } else {
      totalValueEl.textContent = `AED ${grossValue.toLocaleString()}`;
    }
  }
}

function renderPropertiesTable(list) {
  if (!propertiesTbody) return;
  propertiesTbody.innerHTML = '';

  if (!list || list.length === 0) {
    propertiesTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
          No property listings found. Click "Add New Property" to create one.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(prop => {
    const tr = document.createElement('tr');
    
    // Status Badge Styling
    let badgeClass = 'badge-available';
    if (prop.status === 'Off-Market' || prop.status === 'Reserved') badgeClass = 'badge-offmarket';
    if (prop.status === 'Sold') badgeClass = 'badge-sold';

    // Format Image Path for preview inside dashboard/
    let imgSrc = prop.imageUrl || 'assets/properties/palm-villa.jpg';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('../')) {
      imgSrc = '../' + imgSrc;
    }

    const safeTitle = escapeHtml(prop.title || '');
    const safeLoc = escapeHtml(prop.location || 'UAE');
    const safeType = escapeHtml(prop.propertyType || 'Villa');
    const safeStatus = escapeHtml(prop.status || 'Available');
    const safeId = escapeHtml(prop._id || '');
    const videoBadge = prop.videoUrl && prop.videoUrl.trim() ? '<span class="badge-video-tour" title="Includes Walkthrough Video Tour">🎥 Video</span>' : '';

    tr.innerHTML = `
      <td>
        <div class="prop-cell-title">
          <img src="${imgSrc}" alt="${safeTitle}" class="prop-cell-thumb" onerror="this.src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&q=80'">
          <div>
            <div class="prop-cell-name">${safeTitle} ${videoBadge}</div>
            <div class="prop-cell-meta">${prop.area ? Number(prop.area).toLocaleString() + ' sq ft' : ''}</div>
          </div>
        </div>
      </td>
      <td>${safeLoc}</td>
      <td><strong>${safeType}</strong></td>
      <td>${prop.bedrooms || 0} Beds · ${prop.bathrooms || 0} Baths</td>
      <td><span class="gold-text" style="font-weight: 700;">AED ${Number(prop.price || 0).toLocaleString()}</span></td>
      <td><span class="badge ${badgeClass}">${safeStatus}</span></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 8px;">
          <button type="button" class="btn-edit" onclick="openEditModal('${safeId}')">Edit</button>
          <button type="button" class="btn-danger" onclick="deletePropertyItem('${safeId}')">Delete</button>
        </div>
      </td>
    `;
    propertiesTbody.appendChild(tr);
  });
}

function renderInquiriesTable(list) {
  if (!inquiriesTbody) return;
  inquiriesTbody.innerHTML = '';

  if (!list || list.length === 0) {
    inquiriesTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
          No client inquiries matching criteria.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(inq => {
    const tr = document.createElement('tr');
    const dateFormatted = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

    const safeName = escapeHtml(inq.name || 'Private VIP Client');
    const safeEmail = escapeHtml(inq.email || '');
    const safePhone = escapeHtml(inq.phone || '');
    const safeType = escapeHtml(inq.type || 'Consultation');
    const safeBudget = escapeHtml(inq.budget || 'Any Budget');
    const safeIntent = escapeHtml(inq.intent || 'Investment');
    const safeMsg = escapeHtml(inq.message || inq.propertyTitle || 'Direct VIP consultation booking.');
    const safeStatus = escapeHtml(inq.status || 'New');
    const safeId = escapeHtml(inq._id || '');

    tr.innerHTML = `
      <td>
        <div class="prop-cell-name">${safeName}</div>
        <div class="prop-cell-meta"><a href="mailto:${safeEmail}" style="color: var(--gold-light);">${safeEmail}</a> ${safePhone ? '· ' + safePhone : ''}</div>
      </td>
      <td><span style="text-transform: capitalize; font-weight: 600;">${safeType}</span></td>
      <td>
        <div><strong>${safeBudget}</strong></div>
        <div class="prop-cell-meta">${safeIntent}</div>
      </td>
      <td style="max-width: 240px; font-size: 0.8rem; color: var(--text-muted);">
        ${safeMsg}
      </td>
      <td>${dateFormatted}</td>
      <td>
        <select onchange="updateInquiryStatus('${safeId}', this.value)" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
          <option value="New" ${safeStatus === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${safeStatus === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Qualified" ${safeStatus === 'Qualified' ? 'selected' : ''}>Qualified</option>
          <option value="Closed" ${safeStatus === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td style="text-align: right;">
        <button type="button" class="btn-danger" onclick="deleteInquiryItem('${safeId}')">Remove</button>
      </td>
    `;
    inquiriesTbody.appendChild(tr);
  });
}

function filterInquiries() {
  const q = inqSearchInput ? inqSearchInput.value.toLowerCase().trim() : '';
  const status = inqStatusFilter ? inqStatusFilter.value : 'all';

  const filtered = inquiries.filter(inq => {
    const matchStatus = status === 'all' || inq.status === status;
    const matchQuery = !q || (
      (inq.name && inq.name.toLowerCase().includes(q)) ||
      (inq.email && inq.email.toLowerCase().includes(q)) ||
      (inq.phone && inq.phone.toLowerCase().includes(q)) ||
      (inq.message && inq.message.toLowerCase().includes(q)) ||
      (inq.type && inq.type.toLowerCase().includes(q))
    );
    return matchStatus && matchQuery;
  });

  renderInquiriesTable(filtered);
}

// CSV Export Helpers
function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPropertiesToCSV() {
  if (!properties.length) {
    showToast('No properties to export');
    return;
  }
  const headers = ['ID', 'Title', 'Location', 'Property Type', 'Price (AED)', 'Bedrooms', 'Bathrooms', 'Area (sq ft)', 'Status', 'Image URL', 'Description'];
  const rows = properties.map(p => [
    p._id || '',
    `"${(p.title || '').replace(/"/g, '""')}"`,
    `"${(p.location || '').replace(/"/g, '""')}"`,
    `"${(p.propertyType || '').replace(/"/g, '""')}"`,
    p.price || 0,
    p.bedrooms || 0,
    p.bathrooms || 0,
    p.area || 0,
    `"${(p.status || 'Available').replace(/"/g, '""')}"`,
    `"${(p.imageUrl || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`diamora-portfolio-${new Date().toISOString().split('T')[0]}.csv`, csv);
  showToast('Portfolio CSV exported successfully');
}

function exportInquiriesToCSV() {
  if (!inquiries.length) {
    showToast('No inquiries to export');
    return;
  }
  const headers = ['ID', 'Date', 'Type', 'Client Name', 'Email', 'Phone', 'Target Budget', 'Intent', 'Status', 'Message'];
  const rows = inquiries.map(inq => [
    inq._id || '',
    inq.createdAt || '',
    `"${(inq.type || 'Consultation').replace(/"/g, '""')}"`,
    `"${(inq.name || '').replace(/"/g, '""')}"`,
    `"${(inq.email || '').replace(/"/g, '""')}"`,
    `"${(inq.phone || '').replace(/"/g, '""')}"`,
    `"${(inq.budget || '').replace(/"/g, '""')}"`,
    `"${(inq.intent || '').replace(/"/g, '""')}"`,
    `"${(inq.status || 'New').replace(/"/g, '""')}"`,
    `"${(inq.message || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`diamora-vip-leads-${new Date().toISOString().split('T')[0]}.csv`, csv);
  showToast('VIP Leads CSV exported successfully');
}

/**
 * =========================================================================
 * EVENT LISTENERS & USER ACTIONS
 * =========================================================================
 */
function initEventListeners() {
  // Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('diamora_token');
      showToast('Logged out successfully');
      showLogin();
    });
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.dash-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === targetId ? 'block' : 'none';
      });
    });
  });

  // Modal Open / Close
  if (btnOpenAddModal) {
    btnOpenAddModal.addEventListener('click', openAddModal);
  }
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }
  if (btnCancelModal) {
    btnCancelModal.addEventListener('click', closeModal);
  }

  // Property Form Submit (Add / Edit)
  if (propertyForm) {
    propertyForm.addEventListener('submit', handlePropertySubmit);
  }

  // Initialize Media Upload Dropzones (Images & Videos)
  initMediaUploadListeners();

  // Property Search
  if (propSearchInput) {
    propSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = properties.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.propertyType && p.propertyType.toLowerCase().includes(q))
      );
      renderPropertiesTable(filtered);
    });
  }

  // Inquiries Search & Filter
  if (inqSearchInput) {
    inqSearchInput.addEventListener('input', filterInquiries);
  }
  if (inqStatusFilter) {
    inqStatusFilter.addEventListener('change', filterInquiries);
  }

  if (btnRefreshInquiries) {
    btnRefreshInquiries.addEventListener('click', async () => {
      await fetchInquiries();
      showToast('Leads refreshed');
    });
  }

  // CSV Export Buttons
  if (btnExportProperties) {
    btnExportProperties.addEventListener('click', exportPropertiesToCSV);
  }
  if (btnExportInquiries) {
    btnExportInquiries.addEventListener('click', exportInquiriesToCSV);
  }

  // Custom API Endpoint Save
  if (btnSaveApiEndpoint) {
    btnSaveApiEndpoint.addEventListener('click', async () => {
      const val = customApiInput ? customApiInput.value.trim() : '';
      if (val) {
        localStorage.setItem('diamora_api_endpoint', val);
        showToast('Saved custom API endpoint');
      } else {
        localStorage.removeItem('diamora_api_endpoint');
        showToast('Reset to default API endpoint');
      }
      await checkApiHealth();
    });
  }

  // Ping API
  if (btnPingApi) {
    btnPingApi.addEventListener('click', async () => {
      const targetApi = getApiBase() || 'http://localhost:5000/api';
      pingResult.innerHTML = `<span style="color: var(--text-muted);">Pinging ${escapeHtml(targetApi)}/health...</span>`;
      try {
        const res = await fetch(`${targetApi}/health`);
        const data = await res.json();
        pingResult.innerHTML = `<span style="color: var(--emerald-accent);">✅ Status: ${escapeHtml(data.status)} | DB: ${escapeHtml(data.database)} | Time: ${new Date().toLocaleTimeString()}</span>`;
        isLiveApiConnected = true;
        if (systemStatusDot) systemStatusDot.classList.remove('offline');
        if (systemStatusText) systemStatusText.textContent = `Connected: ${targetApi}`;
      } catch (err) {
        pingResult.innerHTML = `<span style="color: #f87171;">⚠️ Cannot connect to backend server (${escapeHtml(targetApi)}). Operating in local storage mode.</span>`;
        isLiveApiConnected = false;
        if (systemStatusDot) systemStatusDot.classList.add('offline');
        if (systemStatusText) systemStatusText.textContent = 'Standalone Mode (Local Storage)';
      }
    });
  }

  // Create New Admin Form
  const formCreateAdmin = document.getElementById('form-create-admin');
  if (formCreateAdmin) {
    formCreateAdmin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('new-admin-username');
      const passwordInput = document.getElementById('new-admin-password');
      const resultDiv = document.getElementById('create-admin-result');
      const btn = document.getElementById('btn-create-admin');

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const token = localStorage.getItem('diamora_token');

      if (!token) {
        resultDiv.innerHTML = '<span style="color: #f87171;">⚠️ Session expired. Please log in again.</span>';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creating...';
      resultDiv.innerHTML = '';

      try {
        const res = await fetch(`${API_BASE}/auth/create-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          resultDiv.innerHTML = `<span style="color: var(--emerald-accent);">✅ ${escapeHtml(data.message)}</span>`;
          formCreateAdmin.reset();
          showToast(`Admin "${username}" created`);
        } else {
          resultDiv.innerHTML = `<span style="color: #f87171;">⚠️ ${escapeHtml(data.message || 'Failed to create admin')}</span>`;
        }
      } catch (err) {
        resultDiv.innerHTML = `<span style="color: #f87171;">⚠️ Error connecting to server</span>`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Admin User';
      }
    });
  }

  // Change Password Form
  const formChangePassword = document.getElementById('form-change-password');
  if (formChangePassword) {
    formChangePassword.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassInput = document.getElementById('current-password');
      const newPassInput = document.getElementById('new-password');
      const resultDiv = document.getElementById('change-password-result');
      const btn = document.getElementById('btn-change-password');

      const currentPassword = currentPassInput.value.trim();
      const newPassword = newPassInput.value.trim();
      const token = localStorage.getItem('diamora_token');

      if (!token) {
        resultDiv.innerHTML = '<span style="color: #f87171;">⚠️ Session expired. Please log in again.</span>';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Updating...';
      resultDiv.innerHTML = '';

      try {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          resultDiv.innerHTML = `<span style="color: var(--emerald-accent);">✅ ${escapeHtml(data.message)}</span>`;
          formChangePassword.reset();
          showToast('Password updated successfully');
        } else {
          resultDiv.innerHTML = `<span style="color: #f87171;">⚠️ ${escapeHtml(data.message || 'Failed to update password')}</span>`;
        }
      } catch (err) {
        resultDiv.innerHTML = `<span style="color: #f87171;">⚠️ Error connecting to server</span>`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Update Password';
      }
    });
  }

  // Sync & Clear Local Cache
  if (btnResetData) {
    btnResetData.addEventListener('click', async () => {
      localStorage.removeItem('diamora_properties');
      localStorage.removeItem('diamora_inquiries');
      showToast('Syncing with live database...');
      await loadDashboardData();
      showToast('Dashboard synchronized with database');
    });
  }
}

/**
 * =========================================================================
 * AUTHENTICATION (Live API)
 * =========================================================================
 */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const submitBtn = document.getElementById('login-submit-btn');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Verifying...</span>';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok && data.token) {
      localStorage.setItem('diamora_token', data.token);
      loginError.style.display = 'none';
      if (window.LogRocket) {
        try {
          window.LogRocket.identify(username, { name: username, role: 'Executive Admin' });
        } catch (e) {}
      }
      showToast('Welcome to Diamora Executive Portal');
      showDashboard();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Enter Portal</span>';
      return;
    } else {
      loginError.textContent = data.message || 'Invalid username or password.';
      loginError.style.display = 'block';
    }
  } catch (err) {
    console.error('API authentication error', err);
    loginError.textContent = 'Unable to connect to authentication server. Please check your connection.';
    loginError.style.display = 'block';
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>Enter Portal</span>';
}

// Client-Side Smart Image Compressor (Sub-Second High-Res WebP Optimizer)
async function smartCompressImage(file) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 800 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 2400; // Ultra-sharp 4K display ceiling

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob && blob.size < file.size) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + '.webp';
            const compressedFile = new File([blob], cleanName, { type: 'image/webp' });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/webp', 0.88);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// Preset image selection
window.selectPresetImage = function(url) {
  const imgInput = document.getElementById('imageUrl');
  if (imgInput) imgInput.value = url;
  updateImagePreview(url);
};

function updateImagePreview(url) {
  const container = document.getElementById('imagePreviewContainer');
  const img = document.getElementById('imagePreviewImg');
  if (!container || !img) return;
  if (url && url.trim()) {
    let src = url.trim();
    if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')) {
      src = '../' + src;
    }
    img.src = src;
    container.style.display = 'block';
  } else {
    img.src = '';
    container.style.display = 'none';
  }
}

function updateVideoPreview(url) {
  const container = document.getElementById('videoPreviewContainer');
  const video = document.getElementById('videoPreviewPlayer');
  if (!container || !video) return;
  if (url && url.trim()) {
    video.src = url.trim();
    container.style.display = 'block';
  } else {
    video.src = '';
    container.style.display = 'none';
  }
}

function updateBlogImagePreview(url) {
  const container = document.getElementById('blogImagePreviewContainer');
  const img = document.getElementById('blogImagePreviewImg');
  if (!container || !img) return;
  if (url && url.trim()) {
    let src = url.trim();
    if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')) {
      src = '../' + src;
    }
    img.src = src;
    container.style.display = 'block';
  } else {
    img.src = '';
    container.style.display = 'none';
  }
}

async function handleBlogImageUpload(file) {
  if (!file) return;

  const progressWrapper = document.getElementById('blogImageUploadProgress');
  const progressFill = document.getElementById('blogImageProgressFill');

  if (progressWrapper) progressWrapper.style.display = 'block';
  if (progressFill) progressFill.style.width = '20%';

  const token = localStorage.getItem('diamora_token');
  if (!token) {
    showToast('Session expired. Please log in again.');
    if (progressWrapper) progressWrapper.style.display = 'none';
    return;
  }

  let payloadFile = file;
  if (file.type.startsWith('image/')) {
    if (progressFill) progressFill.style.width = '40%';
    payloadFile = await smartCompressImage(file);
  }

  const formData = new FormData();
  formData.append('file', payloadFile);

  try {
    if (progressFill) progressFill.style.width = '70%';
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (progressFill) progressFill.style.width = '90%';
    const data = await res.json();

    if (res.ok && data.url) {
      if (progressFill) progressFill.style.width = '100%';
      const blogCoverInput = document.getElementById('blog-cover');
      if (blogCoverInput) blogCoverInput.value = data.url;
      updateBlogImagePreview(data.url);
      showToast('Blog cover uploaded successfully');
    } else {
      showToast(data.message || 'Image upload failed');
    }
  } catch (err) {
    console.error('Blog image upload error:', err);
    showToast('Failed to upload blog image. Check server connection.');
  } finally {
    setTimeout(() => {
      if (progressWrapper) progressWrapper.style.display = 'none';
      if (progressFill) progressFill.style.width = '0%';
    }, 600);
  }
}

async function handleFileUpload(file, mediaType) {
  if (!file) return;

  const isVideo = mediaType === 'video' || file.type.startsWith('video/');
  const progressWrapper = document.getElementById(isVideo ? 'videoUploadProgress' : 'imageUploadProgress');
  const progressFill = document.getElementById(isVideo ? 'videoProgressFill' : 'imageProgressFill');

  if (progressWrapper) progressWrapper.style.display = 'block';
  if (progressFill) progressFill.style.width = '20%';

  const token = localStorage.getItem('diamora_token');
  if (!token) {
    showToast('Session expired. Please log in again.');
    if (progressWrapper) progressWrapper.style.display = 'none';
    return;
  }

  // Optimize and compress images before dispatching across network
  let payloadFile = file;
  if (!isVideo && file.type.startsWith('image/')) {
    if (progressFill) progressFill.style.width = '40%';
    payloadFile = await smartCompressImage(file);
  }

  const formData = new FormData();
  formData.append('file', payloadFile);

  try {
    if (progressFill) progressFill.style.width = '70%';
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (progressFill) progressFill.style.width = '90%';
    const data = await res.json();

    if (res.ok && data.url) {
      if (progressFill) progressFill.style.width = '100%';
      if (isVideo) {
        document.getElementById('videoUrl').value = data.url;
        updateVideoPreview(data.url);
        showToast('Property video uploaded successfully');
      } else {
        document.getElementById('imageUrl').value = data.url;
        updateImagePreview(data.url);
        showToast('Property image uploaded successfully');
      }
    } else {
      showToast(data.message || 'Media upload failed');
    }
  } catch (err) {
    console.error('Media upload error:', err);
    showToast('Failed to upload media. Check server connection.');
  } finally {
    setTimeout(() => {
      if (progressWrapper) progressWrapper.style.display = 'none';
      if (progressFill) progressFill.style.width = '0%';
    }, 600);
  }
}

function initMediaUploadListeners() {
  // Image Upload
  const imageDropzone = document.getElementById('imageDropzone');
  const imageFileInput = document.getElementById('imageFileInput');
  const imageUrlInput = document.getElementById('imageUrl');
  const btnRemoveImage = document.getElementById('btnRemoveImage');

  if (imageDropzone && imageFileInput) {
    imageDropzone.addEventListener('click', () => imageFileInput.click());
    
    imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageDropzone.classList.add('dragover');
    });

    imageDropzone.addEventListener('dragleave', () => {
      imageDropzone.classList.remove('dragover');
    });

    imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0], 'image');
      }
    });

    imageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], 'image');
      }
    });
  }

  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', (e) => updateImagePreview(e.target.value));
  }

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
      if (imageUrlInput) imageUrlInput.value = '';
      updateImagePreview('');
    });
  }

  // Video Upload
  const videoDropzone = document.getElementById('videoDropzone');
  const videoFileInput = document.getElementById('videoFileInput');
  const videoUrlInput = document.getElementById('videoUrl');
  const btnRemoveVideo = document.getElementById('btnRemoveVideo');

  if (videoDropzone && videoFileInput) {
    videoDropzone.addEventListener('click', () => videoFileInput.click());

    videoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      videoDropzone.classList.add('dragover');
    });

    videoDropzone.addEventListener('dragleave', () => {
      videoDropzone.classList.remove('dragover');
    });

    videoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      videoDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0], 'video');
      }
    });

    videoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], 'video');
      }
    });
  }

  if (videoUrlInput) {
    videoUrlInput.addEventListener('input', (e) => updateVideoPreview(e.target.value));
  }

  if (btnRemoveVideo) {
    btnRemoveVideo.addEventListener('click', () => {
      if (videoUrlInput) videoUrlInput.value = '';
      updateVideoPreview('');
    });
  }

  // Blog Image Upload
  const blogImageDropzone = document.getElementById('blogImageDropzone');
  const blogImageFileInput = document.getElementById('blogImageFileInput');
  const blogCoverInput = document.getElementById('blog-cover');
  const btnRemoveBlogImage = document.getElementById('btnRemoveBlogImage');

  if (blogImageDropzone && blogImageFileInput) {
    blogImageDropzone.addEventListener('click', () => blogImageFileInput.click());

    blogImageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      blogImageDropzone.classList.add('dragover');
    });

    blogImageDropzone.addEventListener('dragleave', () => {
      blogImageDropzone.classList.remove('dragover');
    });

    blogImageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      blogImageDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleBlogImageUpload(e.dataTransfer.files[0]);
      }
    });

    blogImageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleBlogImageUpload(e.target.files[0]);
      }
    });
  }

  if (blogCoverInput) {
    blogCoverInput.addEventListener('input', (e) => updateBlogImagePreview(e.target.value));
  }

  if (btnRemoveBlogImage) {
    btnRemoveBlogImage.addEventListener('click', () => {
      if (blogCoverInput) blogCoverInput.value = '';
      updateBlogImagePreview('');
    });
  }
}

/**
 * =========================================================================
 * PROPERTY CRUD ACTIONS
 * =========================================================================
 */
function openAddModal() {
  propertyForm.reset();
  document.getElementById('property-id').value = '';
  if (document.getElementById('videoUrl')) document.getElementById('videoUrl').value = '';
  updateImagePreview('');
  updateVideoPreview('');
  modalTitle.textContent = 'Add New Luxury Property';
  propertyModal.classList.add('open');
}

function openEditModal(id) {
  const prop = properties.find(p => p._id === id);
  if (!prop) return;

  document.getElementById('property-id').value = prop._id;
  document.getElementById('title').value = prop.title || '';
  document.getElementById('propertyType').value = prop.propertyType || 'Villa';
  document.getElementById('price').value = prop.price || '';
  document.getElementById('location').value = prop.location || '';
  document.getElementById('status').value = prop.status || 'Available';
  document.getElementById('bedrooms').value = prop.bedrooms || '';
  document.getElementById('bathrooms').value = prop.bathrooms || '';
  document.getElementById('area').value = prop.area || '';
  document.getElementById('imageUrl').value = prop.imageUrl || '';
  if (document.getElementById('videoUrl')) {
    document.getElementById('videoUrl').value = prop.videoUrl || '';
  }
  document.getElementById('description').value = prop.description || '';

  updateImagePreview(prop.imageUrl || '');
  updateVideoPreview(prop.videoUrl || '');

  modalTitle.textContent = 'Edit Property Asset';
  propertyModal.classList.add('open');
}

function closeModal() {
  propertyModal.classList.remove('open');
}

async function handlePropertySubmit(e) {
  e.preventDefault();
  const id = document.getElementById('property-id').value;
  const propertyData = {
    title: document.getElementById('title').value.trim(),
    propertyType: document.getElementById('propertyType').value,
    price: Number(document.getElementById('price').value),
    location: document.getElementById('location').value.trim(),
    status: document.getElementById('status').value,
    bedrooms: Number(document.getElementById('bedrooms').value),
    bathrooms: Number(document.getElementById('bathrooms').value),
    area: Number(document.getElementById('area').value),
    imageUrl: document.getElementById('imageUrl').value.trim(),
    videoUrl: document.getElementById('videoUrl') ? document.getElementById('videoUrl').value.trim() : '',
    description: document.getElementById('description').value.trim()
  };

  const token = localStorage.getItem('diamora_token');

  // Try API first if live
  if (isLiveApiConnected && token) {
    try {
      const url = id ? `${API_BASE}/properties/${id}` : `${API_BASE}/properties`;
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      if (res.ok) {
        closeModal();
        await fetchProperties();
        updateMetricCards();
        showToast(id ? 'Property updated successfully' : 'New property added to portfolio');
        return;
      }
    } catch (err) {
      console.warn('API error during save, saving locally', err);
    }
  }

  // LocalStorage Fallback Save
  if (id) {
    const idx = properties.findIndex(p => p._id === id);
    if (idx !== -1) {
      properties[idx] = { ...properties[idx], ...propertyData };
    }
  } else {
    const newProp = {
      _id: 'prop-' + Date.now(),
      ...propertyData
    };
    properties.unshift(newProp);
  }

  localStorage.setItem('diamora_properties', JSON.stringify(properties));
  closeModal();
  renderPropertiesTable(properties);
  updateMetricCards();
  showToast(id ? 'Property updated locally' : 'New property added to catalog');
}

window.openEditModal = openEditModal;

window.deletePropertyItem = async function(id) {
  if (!confirm('Are you sure you want to delete this property from the portfolio?')) return;

  const token = localStorage.getItem('diamora_token');
  if (isLiveApiConnected && token) {
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchProperties();
        updateMetricCards();
        showToast('Property deleted');
        return;
      }
    } catch (err) {
      console.warn('API error during delete, deleting locally', err);
    }
  }

  // LocalStorage Fallback
  properties = properties.filter(p => p._id !== id);
  localStorage.setItem('diamora_properties', JSON.stringify(properties));
  renderPropertiesTable(properties);
  updateMetricCards();
  showToast('Property listing removed');
};

/**
 * =========================================================================
 * INQUIRY MANAGEMENT
 * =========================================================================
 */
window.updateInquiryStatus = async function(id, newStatus) {
  const token = localStorage.getItem('diamora_token');
  if (isLiveApiConnected && token) {
    try {
      await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('API error updating inquiry status', e);
    }
  }

  // Local state
  const item = inquiries.find(inq => inq._id === id);
  if (item) {
    item.status = newStatus;
    localStorage.setItem('diamora_inquiries', JSON.stringify(inquiries));
    showToast(`Lead status updated to "${newStatus}"`);
  }
};

window.deleteInquiryItem = async function(id) {
  if (!confirm('Are you sure you want to remove this lead record?')) return;

  const token = localStorage.getItem('diamora_token');
  if (isLiveApiConnected && token) {
    try {
      await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.warn('API error deleting inquiry', e);
    }
  }

  inquiries = inquiries.filter(inq => inq._id !== id);
  localStorage.setItem('diamora_inquiries', JSON.stringify(inquiries));
  renderInquiriesTable(inquiries);
  updateMetricCards();
  showToast('Lead record removed');
};

/**
 * Toast helper
 */
function showToast(message) {
  const toast = document.getElementById('dash-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}


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
      const token = localStorage.getItem('diamora_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/blog?limit=100`, { headers });
      if (res.ok) {
        const data = await res.json();
        blogPosts = data.posts || [];
        renderBlogTable(blogPosts);
        updateMetricCards();
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
  updateMetricCards();
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
    const postSlug = post.slug || post._id;
    tr.innerHTML = `
      <td>
        <div class="prop-cell-title">
          <img src="${post.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&q=80'}" alt="Cover" class="prop-cell-thumb" onerror="this.src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&q=80'">
          <div>
            <div class="prop-cell-name">${escapeHtml(post.title)}</div>
            <div class="prop-cell-meta">${dateFormatted} • ${post.author || 'Diamora Properties'}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(post.category)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(post.status)}</span></td>
      <td>${post.readTime || 1} min</td>
      <td>${post.views || 0}</td>
      <td style="text-align: right; white-space: nowrap;">
        <a href="/blog-post.html?slug=${encodeURIComponent(postSlug)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.75rem; padding: 5px 9px; text-decoration: none; display: inline-block; margin-right: 4px; border-radius: var(--radius-xs);">View</a>
        <button type="button" class="btn-edit" onclick="openBlogModal('${post._id}')">Edit</button>
        <button type="button" class="btn-danger" onclick="deleteBlogPost('${post._id}')">Delete</button>
      </td>
    `;
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
      updateBlogImagePreview(post.coverImage || '');
    }
  } else {
    blogModalTitle.textContent = 'Add New Blog Post';
    document.getElementById('blog-id').value = '';
    updateBlogImagePreview('');
  }
  switchMdMode('write');
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
    const url = id ? `${API_BASE}/blog/${id}` : `${API_BASE}/blog`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast('Blog post saved successfully');
      closeBlogModal();
      fetchBlogPosts();
      updateMetricCards();
    } else {
      const err = await res.json();
      showToast('Error: ' + (err.message || 'Failed to save post'));
    }
  } catch (error) {
    showToast('Failed to save blog post');
  }
}

async function deleteBlogPost(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  const token = localStorage.getItem('diamora_token');
  try {
    const res = await fetch(`${API_BASE}/blog/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
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

function switchMdMode(mode) {
  const textarea = document.getElementById('blog-content');
  const previewPane = document.getElementById('blog-preview-pane');
  const toolbar = document.getElementById('md-toolbar');
  const btnWrite = document.getElementById('btn-md-write');
  const btnPreview = document.getElementById('btn-md-preview');

  if (!textarea || !previewPane) return;

  if (mode === 'preview') {
    const rawContent = textarea.value || '';
    let renderedHtml = '';
    if (window.marked && typeof window.marked.parse === 'function') {
      try {
        renderedHtml = window.marked.parse(rawContent, { gfm: true, breaks: true });
      } catch (err) {
        renderedHtml = rawContent;
      }
    } else {
      renderedHtml = rawContent.replace(/\n/g, '<br>');
    }

    previewPane.innerHTML = renderedHtml || '<p style="color: var(--text-muted); font-style: italic;">No content written yet. Switch back to Write mode to draft your article.</p>';
    textarea.style.display = 'none';
    previewPane.style.display = 'block';
    if (toolbar) toolbar.style.opacity = '0.35';
    if (toolbar) toolbar.style.pointerEvents = 'none';
    if (btnPreview) btnPreview.classList.add('active');
    if (btnWrite) btnWrite.classList.remove('active');
  } else {
    textarea.style.display = 'block';
    previewPane.style.display = 'none';
    if (toolbar) toolbar.style.opacity = '1';
    if (toolbar) toolbar.style.pointerEvents = 'auto';
    if (btnWrite) btnWrite.classList.add('active');
    if (btnPreview) btnPreview.classList.remove('active');
    textarea.focus();
  }
}

function insertMarkdown(syntax) {
  const textarea = document.getElementById('blog-content');
  if (!textarea) return;

  // Make sure we are in write mode
  switchMdMode('write');

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selectedText = val.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  switch (syntax) {
    case 'h2':
      replacement = `\n## ${selectedText || 'Section Heading'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'h3':
      replacement = `\n### ${selectedText || 'Subsection Title'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'bold':
      replacement = `**${selectedText || 'bold text'}**`;
      cursorOffset = selectedText ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `*${selectedText || 'italic text'}*`;
      cursorOffset = selectedText ? replacement.length : 1;
      break;
    case 'quote':
      replacement = `\n> ${selectedText || 'Editorial quote or key takeaway'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'ul':
      replacement = `\n- ${selectedText || 'Key investment pillar'}\n- Second strategic advantage\n`;
      cursorOffset = replacement.length;
      break;
    case 'ol':
      replacement = `\n1. ${selectedText || 'Prime location overview'}\n2. Capital appreciation forecast\n`;
      cursorOffset = replacement.length;
      break;
    case 'code':
      replacement = `\n\`\`\`\n${selectedText || '// Market data or financial metric'}\n\`\`\`\n`;
      cursorOffset = replacement.length;
      break;
    case 'link':
      replacement = selectedText ? `[${selectedText}](https://example.com)` : `[Link Description](https://example.com)`;
      cursorOffset = replacement.length - 1;
      break;
    case 'image':
      replacement = `\n![${selectedText || 'Luxury Property Image'}](https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80)\n`;
      cursorOffset = replacement.length;
      break;
    case 'hr':
      replacement = `\n\n---\n\n`;
      cursorOffset = replacement.length;
      break;
    default:
      return;
  }

  textarea.value = val.substring(0, start) + replacement + val.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
}

// Expose modal, delete, and editor handlers to global window
window.openBlogModal = openBlogModal;
window.deleteBlogPost = deleteBlogPost;
window.switchMdMode = switchMdMode;
window.insertMarkdown = insertMarkdown;
