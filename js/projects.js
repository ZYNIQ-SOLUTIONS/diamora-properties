/**
 * DIAMORA PROPERTIES — OFF-PLAN PROJECTS ARCHIVE CONTROLLER
 * Full client-side interactive search, filtering, and rendering
 * Direct benchmark from herorealestate.ae with Diamora brand styling
 */

function getDiamoraApiEndpoint() {
  const custom = localStorage.getItem('diamora_api_endpoint');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + '/api';
  }
  return 'http://localhost:5000/api';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FALLBACK_PROJECTS = [
  {
    _id: 'the-row-saadiyat',
    title: 'The Row Saadiyat',
    slug: 'the-row-saadiyat',
    tagline: 'Live front row in the heart of Saadiyat Cultural District',
    developer: 'Aldar Properties',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2024/01/Nikki-Beach-Residences-Aldar-Properties-Logo.png',
    location: 'Saadiyat Cultural District, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 3700000,
    handoverDate: '29 Jan 2030',
    paymentPlan: '65/35 Milestone Plan',
    downPayment: '5%',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://herorealestate.ae/wp-content/uploads/07b-scaled.jpg',
    propertyTypes: ['Luxury Apartments', 'Residences with Maid & Study']
  },
  {
    _id: 'sobha-city-abu-dhabi',
    title: 'Sobha City Abu Dhabi',
    slug: 'sobha-city-abu-dhabi',
    tagline: 'Luxury Apartments, Villas & Townhouses with crystal lagoons',
    developer: 'Sobha Realty',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2025/05/logo-shouba-hartland-II.png',
    location: 'Al Shamkha, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1500000,
    handoverDate: 'Q4 2027',
    paymentPlan: '60/40 Flexible Milestone Plan',
    downPayment: '10%',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
    propertyTypes: ['Apartments', 'Villas', 'Townhouses']
  },
  {
    _id: 'tilal-binghatti-dubai',
    title: 'Tilal Binghatti Dubai',
    slug: 'tilal-binghatti-dubai',
    tagline: 'Futuristic architectural suites overlooking Dubai Creek & Burj Khalifa',
    developer: 'Binghatti Developers',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2025/08/Binghatti-Ivory.svg',
    location: 'Al Jaddaf Waterfront, Dubai',
    city: 'Dubai',
    startingPrice: 1100000,
    handoverDate: 'Q2 2026',
    paymentPlan: '70/30 Easy Installment Plan',
    downPayment: '20%',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85',
    propertyTypes: ['Luxury Suites', 'Penthouses']
  },
  {
    _id: 'manchester-city-yas-residences',
    title: 'Manchester City Yas Residences',
    slug: 'manchester-city-yas-residences',
    tagline: 'World-first official Manchester City branded residences by Aldar',
    developer: 'Aldar Properties',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2024/01/Nikki-Beach-Residences-Aldar-Properties-Logo.png',
    location: 'Yas Island, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1950000,
    handoverDate: 'Q1 2028',
    paymentPlan: '65/35 Milestone Plan',
    downPayment: '10%',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85',
    propertyTypes: ['Branded Apartments', 'Duplexes']
  },
  {
    _id: 'the-wilds-dubai',
    title: 'The Wilds at Al Barari',
    slug: 'the-wilds-dubai',
    tagline: 'Botanical sanctuary villas immersed in tranquil waterways and nature',
    developer: 'Al Barari Group',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2025/06/wilds_logo_white_en.webp',
    location: 'Al Barari, Dubai',
    city: 'Dubai',
    startingPrice: 3800000,
    handoverDate: 'Q3 2027',
    paymentPlan: '60/40 Plan',
    downPayment: '15%',
    status: 'New Launch',
    isFeatured: false,
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85',
    propertyTypes: ['Villas', 'Mansions']
  },
  {
    _id: 'mercedes-benz-places-dubai',
    title: 'Mercedes-Benz Places by Binghatti',
    slug: 'mercedes-benz-places-dubai',
    tagline: 'Sensual Purity and automotive luxury architecture in Downtown Dubai',
    developer: 'Binghatti Developers',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/Mercedes-Benz-Places-logo-2.webp',
    location: 'Downtown Dubai, Dubai',
    city: 'Dubai',
    startingPrice: 8800000,
    handoverDate: 'Q4 2026',
    paymentPlan: '70/30 Milestone Plan',
    downPayment: '20%',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
    propertyTypes: ['Sky Penthouses', 'Triplex Mansions']
  },
  {
    _id: 'sila-masdar-city',
    title: 'Sila at Masdar City',
    slug: 'sila-masdar-city',
    tagline: 'Eco-conscious net-zero sustainable luxury suites in Abu Dhabi',
    developer: 'Reportage Properties',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2024/01/logo-Reportage-Properties-white.png',
    location: 'Masdar City, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 890000,
    handoverDate: 'Q1 2027',
    paymentPlan: '40/60 Flexible Plan',
    downPayment: '10%',
    status: 'Under Construction',
    isFeatured: false,
    heroImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85',
    propertyTypes: ['Studios', 'Apartments', 'Townhouses']
  }
];

let allProjects = [];
let currentCityFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  await loadProjects();
  populateDeveloperDropdown();
  parseUrlParams();
  applyFilters();
  initEventListeners();
});

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open);
    });
  }
}

async function loadProjects() {
  const apiBase = getDiamoraApiEndpoint();
  try {
    const res = await fetch(`${apiBase}/projects`);
    if (res.ok) {
      const data = await res.json();
      allProjects = Array.isArray(data) ? data : (data.projects || data.data || []);
      if (Array.isArray(allProjects) && allProjects.length > 0) return;
    }
  } catch (err) {
    console.warn('API error, attempting local storage or fallback', err);
  }

  // Local storage check
  const local = localStorage.getItem('diamora_projects');
  if (local) {
    try {
      allProjects = JSON.parse(local);
      if (Array.isArray(allProjects) && allProjects.length > 0) return;
    } catch (e) {}
  }

  allProjects = [...FALLBACK_PROJECTS];
}

function populateDeveloperDropdown() {
  const select = document.getElementById('filterDeveloper');
  if (!select) return;

  const developers = Array.from(new Set(allProjects.map(p => p.developer).filter(Boolean))).sort();
  select.innerHTML = '<option value="all">All Developers</option>';
  developers.forEach(dev => {
    const opt = document.createElement('option');
    opt.value = dev;
    opt.textContent = dev;
    select.appendChild(opt);
  });
}

function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city');
  const dev = params.get('developer');
  const q = params.get('q');

  if (city) {
    currentCityFilter = city;
    document.querySelectorAll('.city-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-city').toLowerCase() === city.toLowerCase());
    });
  }

  if (dev) {
    const select = document.getElementById('filterDeveloper');
    if (select) select.value = dev;
  }

  if (q) {
    const input = document.getElementById('projectSearchInput');
    if (input) input.value = q;
  }
}

function initEventListeners() {
  // City Pills
  const pills = document.querySelectorAll('.city-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCityFilter = pill.getAttribute('data-city');
      applyFilters();
    });
  });

  // Inputs & Selects
  const searchInput = document.getElementById('projectSearchInput');
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  const filterDev = document.getElementById('filterDeveloper');
  if (filterDev) filterDev.addEventListener('change', applyFilters);

  const filterStatus = document.getElementById('filterStatus');
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);

  const filterPrice = document.getElementById('filterPrice');
  if (filterPrice) filterPrice.addEventListener('change', applyFilters);

  const filterSort = document.getElementById('filterSort');
  if (filterSort) filterSort.addEventListener('change', applyFilters);

  const resetBtn = document.getElementById('btnResetFilters');
  if (resetBtn) resetBtn.addEventListener('click', resetProjectFilters);
}

function resetProjectFilters() {
  currentCityFilter = 'all';
  document.querySelectorAll('.city-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-city') === 'all');
  });

  const searchInput = document.getElementById('projectSearchInput');
  if (searchInput) searchInput.value = '';

  const filterDev = document.getElementById('filterDeveloper');
  if (filterDev) filterDev.value = 'all';

  const filterStatus = document.getElementById('filterStatus');
  if (filterStatus) filterStatus.value = 'all';

  const filterPrice = document.getElementById('filterPrice');
  if (filterPrice) filterPrice.value = 'all';

  const filterSort = document.getElementById('filterSort');
  if (filterSort) filterSort.value = 'featured';

  applyFilters();
}
window.resetProjectFilters = resetProjectFilters;

function applyFilters() {
  const searchVal = document.getElementById('projectSearchInput') ? document.getElementById('projectSearchInput').value.toLowerCase().trim() : '';
  const devVal = document.getElementById('filterDeveloper') ? document.getElementById('filterDeveloper').value : 'all';
  const statusVal = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : 'all';
  const priceVal = document.getElementById('filterPrice') ? document.getElementById('filterPrice').value : 'all';
  const sortVal = document.getElementById('filterSort') ? document.getElementById('filterSort').value : 'featured';

  let list = allProjects.filter(p => {
    // City filter
    if (currentCityFilter !== 'all') {
      if ((p.city || '').toLowerCase() !== currentCityFilter.toLowerCase()) return false;
    }

    // Developer filter
    if (devVal !== 'all') {
      if (p.developer !== devVal) return false;
    }

    // Status filter
    if (statusVal !== 'all') {
      if (p.status !== statusVal) return false;
    }

    // Starting Price filter
    const price = Number(p.startingPrice || 0);
    if (priceVal === 'under15') {
      if (price >= 1500000) return false;
    } else if (priceVal === '15to30') {
      if (price < 1500000 || price > 3000000) return false;
    } else if (priceVal === 'above30') {
      if (price < 3000000) return false;
    }

    // Search query
    if (searchVal) {
      const haystack = `${p.title || ''} ${p.developer || ''} ${p.location || ''} ${p.city || ''} ${p.tagline || ''} ${(p.propertyTypes || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(searchVal)) return false;
    }

    return true;
  });

  // Sort
  if (sortVal === 'price-asc') {
    list.sort((a, b) => Number(a.startingPrice || 0) - Number(b.startingPrice || 0));
  } else if (sortVal === 'price-desc') {
    list.sort((a, b) => Number(b.startingPrice || 0) - Number(a.startingPrice || 0));
  } else {
    // Featured first
    list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  renderProjects(list);
}

function renderProjects(list) {
  const container = document.getElementById('projectsArchiveGrid');
  const countSpan = document.getElementById('projectsCount');
  const emptyState = document.getElementById('projectsEmptyState');

  if (!container) return;

  if (countSpan) {
    countSpan.textContent = `Showing ${list.length} off-plan development${list.length === 1 ? '' : 's'}`;
  }

  if (list.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = list.map(proj => {
    const slug = proj.slug || proj._id;
    const title = escapeHtml(proj.title || '');
    const dev = escapeHtml(proj.developer || 'Master Developer');
    const loc = escapeHtml(proj.location || `${proj.city || 'UAE'}`);
    const tagline = escapeHtml(proj.tagline || (proj.description ? proj.description.substring(0, 90) + '...' : ''));
    const status = escapeHtml(proj.status || 'New Launch');
    const handover = escapeHtml(proj.handoverDate || 'TBA');
    const paymentPlan = escapeHtml(proj.paymentPlan || 'Milestone Plan');
    const price = Number(proj.startingPrice || 0);
    const priceStr = price >= 1000000 ? `AED ${(price / 1000000).toFixed(1)}M` : `AED ${price.toLocaleString()}`;

    let imgSrc = proj.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
      imgSrc = '/' + imgSrc;
    }

    const devLogo = proj.developerLogo ? `<div class="offplan-dev-emblem-wrap"><img src="${proj.developerLogo}" alt="${dev}" class="offplan-dev-emblem" loading="lazy"></div>` : '';

    return `
      <article class="offplan-card" aria-label="${title}">
        <div class="offplan-card-media">
          <img src="${imgSrc}" alt="${title}" class="offplan-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'">
          <div class="offplan-card-overlay"></div>
        </div>
        <div class="offplan-card-top">
          <div class="offplan-dev-badge">
            <span class="offplan-dev-name">${dev}</span>
          </div>
          <span class="offplan-status-pill">${status}</span>
        </div>
        <div class="offplan-card-body">
          ${devLogo}
          <div class="offplan-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>By ${dev} · ${loc}</span>
          </div>
          <h3 class="offplan-title">${title}</h3>
          <p class="offplan-tagline">${tagline}</p>
          <div class="offplan-meta-grid">
            <div class="offplan-meta-item">
              <span class="meta-lbl">Starting Price</span>
              <span class="meta-val gold-text">${priceStr}</span>
            </div>
            <div class="offplan-meta-item">
              <span class="meta-lbl">Handover</span>
              <span class="meta-val">${handover}</span>
            </div>
            <div class="offplan-meta-item">
              <span class="meta-lbl">Payment Plan</span>
              <span class="meta-val">${paymentPlan}</span>
            </div>
          </div>
          <div class="offplan-card-footer">
            <a href="project-detail.html?slug=${encodeURIComponent(slug)}" class="btn-offplan-explore">
              <span>Explore Project</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}
