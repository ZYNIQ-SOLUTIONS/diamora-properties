/**
 * DIAMORA PROPERTIES — SINGLE OFF-PLAN PROJECT DETAIL CONTROLLER
 * Full dynamic hydration from API / LocalStorage, Leaflet map,
 * gallery lightbox, milestone schedules, and VIP consultation lead capture.
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
    _id: 'sobha-city-abu-dhabi',
    title: 'Sobha City Abu Dhabi',
    slug: 'sobha-city-abu-dhabi',
    tagline: 'Luxury Apartments, Villas & Townhouses by Sobha Realty',
    developer: 'Sobha Realty',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Al Shamkha, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1500000,
    currency: 'AED',
    handoverDate: 'Q4 2027',
    paymentPlan: '60/40 Flexible Milestone Plan',
    downPayment: '10%',
    propertyTypes: ['Apartments', 'Villas', 'Townhouses'],
    bedrooms: '1 to 5 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],
    description: `Sobha City Abu Dhabi is an ambitious master-planned residential community by Sobha Realty, spanning over millions of square feet with lush greenery, crystal lagoons, and state-of-the-art architecture. Designed for discerning families and international investors, this landmark development balances natural sanctuary with high-speed metropolitan connectivity. Every residence features Sobha's signature backward-integrated craftsmanship, premium European finishes, floor-to-ceiling panoramic glass, and expansive private terraces.`,
    highlights: [
      'Prime location in Al Shamkha with direct highway access to Downtown Abu Dhabi & Dubai',
      'Swimmable crystal lagoons spanning over 250,000 sq.ft with white sand beaches',
      'Extensive green corridors, cycling tracks, and integrated wellness parks',
      'Freehold ownership available for all nationalities with 10-Year UAE Golden Visa eligibility'
    ],
    amenities: [
      'Crystal Swimmable Lagoon',
      'Private Beach Club & Cabanas',
      'State-of-the-Art Fitness Center',
      'Infinity Lap Pools',
      'Luxury Spa & Wellness Haven',
      'Dedicated Kids Splash Park',
      'Waterfront Dining Promenade',
      '24/7 Concierge & Valet Service'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Luxury Apartment',
        bedrooms: '1 Bedroom',
        sizeSqFt: '780 - 950 Sq.Ft',
        startingPrice: 1500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Waterfront Suite',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,250 - 1,480 Sq.Ft',
        startingPrice: 2200000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Executive Townhome',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,400 - 2,850 Sq.Ft',
        startingPrice: 3800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      },
      {
        name: '4-Bedroom Signature Villa',
        bedrooms: '4 Bedrooms',
        sizeSqFt: '4,200 - 5,100 Sq.Ft',
        startingPrice: 6500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Booking Deposit', percentage: 10, notes: 'Immediate upon reservation' },
      { milestone: 'During Construction', percentage: 50, notes: 'Linked to construction progress over 36 months' },
      { milestone: 'On Final Handover', percentage: 40, notes: 'Q4 2027 completion' }
    ],
    connectivity: [
      { destination: 'Abu Dhabi International Airport (AUH)', durationMinutes: 12 },
      { destination: 'Yas Island & Ferrari World', durationMinutes: 18 },
      { destination: 'Saadiyat Island Cultural District', durationMinutes: 25 },
      { destination: 'Downtown Dubai via E11', durationMinutes: 55 }
    ],
    coordinates: { lat: 24.3644, lng: 54.7072 },
    faqs: [
      {
        question: 'Is Sobha City Abu Dhabi open to foreign buyers?',
        answer: 'Yes, Sobha City is designated as an investment zone offering 100% freehold ownership to all nationalities.'
      },
      {
        question: 'Does buying a home in Sobha City qualify for the UAE Golden Visa?',
        answer: 'Yes, any property purchase exceeding AED 2,000,000 qualifies the primary buyer and immediate family members for the 10-Year UAE Golden Visa.'
      },
      {
        question: 'What is the escrow bank protection for off-plan buyers?',
        answer: 'All payments are deposited directly into a project-specific Escrow Account regulated by the Abu Dhabi Department of Municipalities and Transport (DMT), strictly disbursed as construction milestones are verified.'
      }
    ]
  },
  {
    _id: 'tilal-binghatti-dubai',
    title: 'Tilal Binghatti Dubai',
    slug: 'tilal-binghatti-dubai',
    tagline: 'Futuristic Architectural Masterpiece in Al Jaddaf',
    developer: 'Binghatti Developers',
    developerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop&q=80',
    location: 'Al Jaddaf Waterfront, Dubai',
    city: 'Dubai',
    startingPrice: 1100000,
    currency: 'AED',
    handoverDate: 'Q2 2026',
    paymentPlan: '70/30 Easy Installment Plan',
    downPayment: '20%',
    propertyTypes: ['Luxury Suites', 'Penthouses'],
    bedrooms: '1 to 3 Bedrooms',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
    ],
    description: `Tilal Binghatti represents avant-garde sculptural living overlooking the Dubai Creek and the iconic Downtown skyline. Designed with geometric weaves, signature champagne gold metallic facets, and energy-efficient building envelopes, the development sets a new benchmark in urban luxury.`,
    highlights: [
      'Unobstructed Dubai Creek & Burj Khalifa vistas',
      'Smart-home automation integrated in all residences',
      'Minutes from DIFC, Downtown Dubai & DXB Airport',
      'High anticipated rental yield exceeding 8.5% ROI'
    ],
    amenities: [
      'Skyline Infinity Pool',
      'Jacuzzi & Sun Loungers',
      'High-Tech Gymnasium',
      'Paddle Tennis Court',
      'Smart Home Concierge',
      'Private Residents Lounge'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Executive Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '720 - 850 Sq.Ft',
        startingPrice: 1100000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Skyline Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,150 - 1,350 Sq.Ft',
        startingPrice: 1750000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Royal Sky Duplex',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,100 - 2,600 Sq.Ft',
        startingPrice: 3200000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 20, notes: 'On Booking' },
      { milestone: 'During Construction', percentage: 50, notes: 'Installments linked to structural build' },
      { milestone: 'On Handover', percentage: 30, notes: 'Q2 2026 Key Handover' }
    ],
    connectivity: [
      { destination: 'Downtown Dubai & Burj Khalifa', durationMinutes: 8 },
      { destination: 'Dubai International Airport (DXB)', durationMinutes: 10 },
      { destination: 'DIFC Financial Centre', durationMinutes: 10 },
      { destination: 'Dubai Marina & JBR', durationMinutes: 22 }
    ],
    coordinates: { lat: 25.2154, lng: 55.3289 },
    faqs: [
      {
        question: 'What is the construction status of Tilal Binghatti?',
        answer: 'The project is actively under construction with structural works progressing ahead of schedule towards Q2 2026 delivery.'
      },
      {
        question: 'Are residences furnished?',
        answer: 'Units are delivered fully fitted with custom Italian kitchens, designer sanitary fittings, and smart lighting systems.'
      }
    ]
  },
  {
    _id: 'manchester-city-yas-residences',
    title: 'Manchester City Yas Residences',
    slug: 'manchester-city-yas-residences',
    tagline: 'World-First Official Manchester City Branded Living',
    developer: 'Aldar Properties',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Yas Island, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1950000,
    currency: 'AED',
    handoverDate: 'Q1 2028',
    paymentPlan: '65/35 Milestone Plan',
    downPayment: '10%',
    propertyTypes: ['Branded Apartments', 'Duplexes'],
    bedrooms: '1 to 4 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
    ],
    description: `The world's first residential development officially curated in partnership with Manchester City Football Club and Aldar Properties. Located in the heart of Yas Island, residents enjoy branded fitness facilities, elite sports recovery clinics, high-tech football simulation rooms, and VIP hospitality rights.`,
    highlights: [
      'Official MCFC training academy pitch & sports performance clinic',
      'Walking distance to Yas Marina Circuit, Ferrari World & Warner Bros',
      'High-yield rental potential driven by premier Yas Island entertainment',
      'Exclusive owner access to Manchester City VIP matches & global events'
    ],
    amenities: [
      'MCFC Performance Center',
      'Rooftop Sports Bar & Lounge',
      'Resort Pool Deck',
      'E-Gaming Arena',
      'Private Cinema Room',
      'Kids Football Mini-Pitch'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Branded Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '820 - 980 Sq.Ft',
        startingPrice: 1950000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Champion Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,320 - 1,550 Sq.Ft',
        startingPrice: 2850000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Duplex Penthouse',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,600 - 3,200 Sq.Ft',
        startingPrice: 4800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 10, notes: 'On Reservation' },
      { milestone: 'Construction Milestones', percentage: 55, notes: '10 installments across 36 months' },
      { milestone: 'On Handover', percentage: 35, notes: 'Q1 2028 Key Handover' }
    ],
    connectivity: [
      { destination: 'Yas Marina & Circuit', durationMinutes: 5 },
      { destination: 'Abu Dhabi International Airport (AUH)', durationMinutes: 10 },
      { destination: 'Saadiyat Island Cultural District', durationMinutes: 15 },
      { destination: 'Downtown Dubai', durationMinutes: 50 }
    ],
    coordinates: { lat: 24.4984, lng: 54.6055 },
    faqs: [
      {
        question: 'Can buyers lease through short-term holiday homes?',
        answer: 'Yes, Yas Island permits holiday home leasing, offering excellent short-term rental yields during F1 and major events.'
      }
    ]
  }
];

let currentProject = null;
let leafletProjectMap = null;

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  initStickyNav();
  initModals();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || params.get('id') || 'sobha-city-abu-dhabi';

  await loadProjectDetail(slug);
  initInquiryForm();
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

function initStickyNav() {
  const stickyNav = document.getElementById('pdetailStickyNav');
  const anchors = document.querySelectorAll('.nav-anchor');

  window.addEventListener('scroll', () => {
    if (!stickyNav) return;
    const heroBottom = document.getElementById('projectHeroSection')?.getBoundingClientRect().bottom || 0;
    if (heroBottom <= 70) {
      stickyNav.classList.add('is-sticky');
    } else {
      stickyNav.classList.remove('is-sticky');
    }

    // Scrollspy active highlight
    const sections = ['overviewSection', 'gallerySection', 'unitsSection', 'paymentPlanSection', 'amenitiesSection', 'locationSection', 'faqsSection', 'inquireSection'];
    let currentActive = '';

    for (let id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          currentActive = id;
          break;
        }
      }
    }

    if (currentActive) {
      anchors.forEach(a => {
        const href = a.getAttribute('href');
        a.classList.toggle('active', href === `#${currentActive}`);
      });
    }
  });
}

function initModals() {
  // Lightbox
  const lightboxModal = document.getElementById('lightboxModal');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.style.display = 'none';
    });
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.style.display = 'none';
    });
  }

  // Brochure
  const brochureModal = document.getElementById('brochureModal');
  const btnOpenBrochure = document.getElementById('btnOpenBrochure');
  const btnCloseBrochureModal = document.getElementById('btnCloseBrochureModal');
  const brochureLeadForm = document.getElementById('brochureLeadForm');

  if (btnOpenBrochure && brochureModal) {
    btnOpenBrochure.addEventListener('click', () => {
      brochureModal.style.display = 'flex';
    });
  }

  if (btnCloseBrochureModal && brochureModal) {
    btnCloseBrochureModal.addEventListener('click', () => {
      brochureModal.style.display = 'none';
    });
    brochureModal.addEventListener('click', (e) => {
      if (e.target === brochureModal) brochureModal.style.display = 'none';
    });
  }

  if (brochureLeadForm) {
    brochureLeadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('brochureName').value.trim();
      const email = document.getElementById('brochureEmail').value.trim();
      const phone = document.getElementById('brochurePhone').value.trim();

      // Submit lead to backend
      try {
        const apiBase = getDiamoraApiEndpoint();
        await fetch(`${apiBase}/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            type: 'brochure',
            propertyTitle: currentProject?.title || 'Off-Plan Project',
            intent: 'Brochure Download',
            message: `Client requested official brochure for ${currentProject?.title} (${currentProject?.developer})`
          })
        });
      } catch (err) {}

      alert(`Thank you, ${name}. Your brochure request has been received. The brochure has been dispatched to your email.`);
      brochureModal.style.display = 'none';
      brochureLeadForm.reset();

      if (currentProject && currentProject.brochureUrl) {
        window.open(currentProject.brochureUrl, '_blank');
      }
    });
  }
}

async function loadProjectDetail(slugOrId) {
  const apiBase = getDiamoraApiEndpoint();
  try {
    const res = await fetch(`${apiBase}/projects/${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      currentProject = await res.json();
    }
  } catch (e) {
    console.warn('API error, falling back to local / fallback list', e);
  }

  if (!currentProject) {
    const stored = localStorage.getItem('diamora_projects');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        currentProject = list.find(p => p.slug === slugOrId || p._id === slugOrId);
      } catch (e) {}
    }
  }

  if (!currentProject) {
    currentProject = FALLBACK_PROJECTS.find(p => p.slug === slugOrId || p._id === slugOrId) || FALLBACK_PROJECTS[0];
  }

  renderProjectPage(currentProject);
  loadRelatedProjects(currentProject);
}

function renderProjectPage(proj) {
  // Page Meta & Title
  const titleStr = `${proj.title} by ${proj.developer} | Diamora Properties UAE`;
  document.title = titleStr;
  const pageTitleEl = document.getElementById('pageTitle');
  if (pageTitleEl) pageTitleEl.textContent = titleStr;

  const descEl = document.getElementById('metaDescription');
  if (descEl) descEl.setAttribute('content', proj.tagline || proj.description || '');

  // Breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = proj.title;

  // Hero Image
  const heroImg = document.getElementById('pdetailHeroImg');
  if (heroImg) {
    let src = proj.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85';
    if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
    heroImg.src = src;
    heroImg.alt = proj.title;
  }

  // Developer Badge
  const devLogo = document.getElementById('pdetailDevLogo');
  const devName = document.getElementById('pdetailDevName');
  if (devName) devName.textContent = proj.developer || 'Master Developer';
  if (devLogo) {
    if (proj.developerLogo) {
      devLogo.src = proj.developerLogo;
      devLogo.style.display = 'inline-block';
    } else {
      devLogo.style.display = 'none';
    }
  }

  // Status Pill
  const statusPill = document.getElementById('pdetailStatusPill');
  if (statusPill) statusPill.textContent = proj.status || 'New Launch';

  // Title & Tagline
  const titleEl = document.getElementById('pdetailTitle');
  if (titleEl) titleEl.textContent = proj.title;

  const taglineEl = document.getElementById('pdetailTagline');
  if (taglineEl) taglineEl.textContent = proj.tagline || `Exclusive off-plan residential development in ${proj.location || proj.city}.`;

  // Quick Info Ribbon
  const priceEl = document.getElementById('pdetailPrice');
  if (priceEl) {
    const p = Number(proj.startingPrice || 0);
    priceEl.textContent = p >= 1000000 ? `AED ${(p / 1000000).toFixed(2)}M` : `AED ${p.toLocaleString()}`;
  }

  const handoverEl = document.getElementById('pdetailHandover');
  if (handoverEl) handoverEl.textContent = proj.handoverDate || 'TBA';

  const paymentPlanEl = document.getElementById('pdetailPaymentPlan');
  if (paymentPlanEl) paymentPlanEl.textContent = proj.paymentPlan || 'Milestone Plan';

  const downPaymentEl = document.getElementById('pdetailDownPayment');
  if (downPaymentEl) downPaymentEl.textContent = proj.downPayment || '10% On Booking';

  const locationEl = document.getElementById('pdetailLocation');
  if (locationEl) locationEl.textContent = proj.location || proj.city || 'UAE';

  const bedroomsEl = document.getElementById('pdetailBedrooms');
  if (bedroomsEl) bedroomsEl.textContent = proj.bedrooms || (Array.isArray(proj.propertyTypes) ? proj.propertyTypes.join(', ') : 'Residences');

  // WhatsApp CTA
  const waBtn = document.getElementById('pdetailWhatsappBtn');
  if (waBtn) {
    const text = encodeURIComponent(`Hello Diamora Properties, I would like VIP details and pricing for ${proj.title} by ${proj.developer}.`);
    waBtn.href = `https://wa.me/971506760668?text=${text}`;
  }

  // Inquiry form hidden fields
  const inqTitle = document.getElementById('inqProjectTitle');
  if (inqTitle) inqTitle.value = proj.title;
  const inqDev = document.getElementById('inqDeveloper');
  if (inqDev) inqDev.value = proj.developer;

  // Overview Narrative
  const descContainer = document.getElementById('pdetailDescription');
  if (descContainer) {
    descContainer.innerHTML = `<p>${escapeHtml(proj.description || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }

  // Highlights
  const highlightsList = document.getElementById('pdetailHighlightsList');
  if (highlightsList) {
    const items = Array.isArray(proj.highlights) && proj.highlights.length > 0
      ? proj.highlights
      : [
          'High capital appreciation forecast and high-yield rental returns',
          'Freehold title deeds available to foreign and GCC investors',
          '100% Escrow bank protection regulated by UAE Land Departments',
          'Qualifies for the 10-Year UAE Golden Visa on purchases exceeding AED 2M'
        ];

    highlightsList.innerHTML = items.map(h => `
      <li class="highlight-item">
        <svg class="gold-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${escapeHtml(h)}</span>
      </li>
    `).join('');
  }

  // Gallery
  renderGallery(proj);

  // Unit Types
  renderUnitTypes(proj);

  // Payment Milestones
  renderPaymentMilestones(proj);

  // Amenities
  renderAmenities(proj);

  // Connectivity & Map
  renderConnectivityAndMap(proj);

  // FAQs
  renderFaqs(proj);
}

function renderGallery(proj) {
  const container = document.getElementById('pdetailGalleryGrid');
  if (!container) return;

  const images = Array.isArray(proj.gallery) && proj.gallery.length > 0
    ? proj.gallery
    : [
        proj.heroImage,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
      ].filter(Boolean);

  container.innerHTML = images.map((imgUrl, idx) => `
    <div class="pdetail-gallery-thumb" onclick="openLightbox('${imgUrl}', '${escapeHtml(proj.title)} - Render ${idx + 1}')">
      <img src="${imgUrl}" alt="${escapeHtml(proj.title)} view ${idx + 1}" loading="lazy">
      <div class="gallery-zoom-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
    </div>
  `).join('');
}

function openLightbox(url, caption) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!modal || !img) return;

  img.src = url;
  if (cap) cap.textContent = caption || '';
  modal.style.display = 'flex';
}
window.openLightbox = openLightbox;

function renderUnitTypes(proj) {
  const container = document.getElementById('pdetailUnitsGrid');
  if (!container) return;

  const units = Array.isArray(proj.unitTypes) && proj.unitTypes.length > 0
    ? proj.unitTypes
    : [
        { name: '1-Bedroom Luxury Suite', bedrooms: '1 Bed', sizeSqFt: '780 - 950 Sq.Ft', startingPrice: proj.startingPrice },
        { name: '2-Bedroom Panoramic Residence', bedrooms: '2 Beds', sizeSqFt: '1,250 - 1,450 Sq.Ft', startingPrice: Math.round(proj.startingPrice * 1.45) },
        { name: '3-Bedroom Signature Townhome', bedrooms: '3 Beds', sizeSqFt: '2,200 - 2,800 Sq.Ft', startingPrice: Math.round(proj.startingPrice * 2.2) }
      ];

  container.innerHTML = units.map(u => {
    const priceStr = u.startingPrice ? `AED ${Number(u.startingPrice).toLocaleString()}` : 'Price on Request';
    const floorImg = u.floorPlanImage || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80';

    return `
      <div class="unit-card">
        <div class="unit-card-media" onclick="openLightbox('${floorImg}', '${escapeHtml(u.name)} Blueprint')">
          <img src="${floorImg}" alt="${escapeHtml(u.name)}" loading="lazy">
          <span class="unit-badge">${escapeHtml(u.bedrooms || 'Layout')}</span>
        </div>
        <div class="unit-card-body">
          <h4 class="font-serif unit-title">${escapeHtml(u.name)}</h4>
          <div class="unit-specs">
            <span class="unit-size">${escapeHtml(u.sizeSqFt || 'Spacious Layout')}</span>
            <span class="unit-price gold-text font-serif">${priceStr}</span>
          </div>
          <a href="#inquireSection" class="btn-secondary unit-btn">
            <span>Request Floor Plan PDF</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function renderPaymentMilestones(proj) {
  const container = document.getElementById('pdetailMilestonesGrid');
  if (!container) return;

  const milestones = Array.isArray(proj.paymentMilestones) && proj.paymentMilestones.length > 0
    ? proj.paymentMilestones
    : [
        { milestone: 'Down Payment', percentage: 10, notes: 'On Booking / Reservation' },
        { milestone: 'During Construction', percentage: 50, notes: 'Staged installments linked to construction' },
        { milestone: 'On Handover', percentage: 40, notes: `Upon Key Handover (${proj.handoverDate || 'Completion'})` }
      ];

  container.innerHTML = milestones.map((m, idx) => `
    <div class="milestone-card">
      <div class="milestone-step">0${idx + 1}</div>
      <div class="milestone-pct gold-text font-serif">${m.percentage}%</div>
      <div class="milestone-title font-serif">${escapeHtml(m.milestone)}</div>
      <div class="milestone-notes">${escapeHtml(m.notes || '')}</div>
    </div>
  `).join('');
}

function renderAmenities(proj) {
  const container = document.getElementById('pdetailAmenitiesGrid');
  if (!container) return;

  const amenities = Array.isArray(proj.amenities) && proj.amenities.length > 0
    ? proj.amenities
    : ['Infinity Pool', 'Private Beach Club', 'Wellness Spa', 'State-of-the-Art Fitness', 'Valet Parking', '24/7 Concierge'];

  container.innerHTML = amenities.map(am => `
    <div class="amenity-item">
      <div class="amenity-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <span class="amenity-name">${escapeHtml(am)}</span>
    </div>
  `).join('');
}

function renderConnectivityAndMap(proj) {
  const connContainer = document.getElementById('pdetailConnectivityGrid');
  if (connContainer) {
    const items = Array.isArray(proj.connectivity) && proj.connectivity.length > 0
      ? proj.connectivity
      : [
          { destination: 'International Airport', durationMinutes: 15 },
          { destination: 'Downtown & Financial District', durationMinutes: 20 },
          { destination: 'Waterfront Promenade & Marinas', durationMinutes: 8 }
        ];

    connContainer.innerHTML = items.map(c => `
      <div class="conn-card">
        <div class="conn-time gold-text font-serif">${c.durationMinutes} Mins</div>
        <div class="conn-dest">${escapeHtml(c.destination)}</div>
      </div>
    `).join('');
  }

  // Initialize Map
  const mapEl = document.getElementById('pdetailMap');
  if (mapEl && typeof L !== 'undefined') {
    const lat = proj.coordinates?.lat || 25.2048;
    const lng = proj.coordinates?.lng || 55.2708;

    if (leafletProjectMap) {
      leafletProjectMap.remove();
    }

    try {
      leafletProjectMap = L.map('pdetailMap', {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(leafletProjectMap);

      const customPin = L.divIcon({
        className: 'custom-gold-marker',
        html: `<div style="background: #D4AF37; color: #090A0E; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #FFF; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      L.marker([lat, lng], { icon: customPin })
        .addTo(leafletProjectMap)
        .bindPopup(`<b>${escapeHtml(proj.title)}</b><br>${escapeHtml(proj.location || '')}`)
        .openPopup();
    } catch (err) {
      console.warn('Leaflet error rendering project map:', err);
    }
  }
}

function renderFaqs(proj) {
  const container = document.getElementById('pdetailFaqsAccordion');
  if (!container) return;

  const faqs = Array.isArray(proj.faqs) && proj.faqs.length > 0
    ? proj.faqs
    : [
        {
          question: `Can foreigners purchase residences in ${proj.title}?`,
          answer: `Yes, ${proj.title} is an approved freehold investment zone allowing 100% freehold property ownership to all international nationalities with full title deed registration.`
        },
        {
          question: 'Does buying this property qualify for the 10-Year UAE Golden Visa?',
          answer: 'Yes, purchases exceeding AED 2,000,000 qualify the primary investor and their family members for the 10-Year UAE Golden Visa.'
        },
        {
          question: 'How is buyer payment secured before project completion?',
          answer: 'All payments are held in a secure, government-regulated Escrow Account managed by the land authority. Developer withdrawals are permitted strictly in stages corresponding to verified physical construction milestones.'
        }
      ];

  container.innerHTML = faqs.map((faq, idx) => `
    <details class="faq-accordion-item" ${idx === 0 ? 'open' : ''}>
      <summary class="faq-summary">
        <span class="faq-question">${escapeHtml(faq.question)}</span>
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </summary>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </details>
  `).join('');
}

async function loadRelatedProjects(currentProj) {
  const container = document.getElementById('relatedProjectsGrid');
  if (!container) return;

  let related = [];
  try {
    const apiBase = getDiamoraApiEndpoint();
    const res = await fetch(`${apiBase}/projects`);
    if (res.ok) {
      const all = await res.json();
      related = all.filter(p => (p.slug !== currentProj.slug && p._id !== currentProj._id));
    }
  } catch (e) {}

  if (related.length === 0) {
    related = FALLBACK_PROJECTS.filter(p => p.slug !== currentProj.slug);
  }

  container.innerHTML = related.slice(0, 3).map(proj => {
    const slug = proj.slug || proj._id;
    const title = escapeHtml(proj.title || '');
    const dev = escapeHtml(proj.developer || 'Master Developer');
    const loc = escapeHtml(proj.location || `${proj.city || 'UAE'}`);
    const price = Number(proj.startingPrice || 0);
    const priceStr = price >= 1000000 ? `AED ${(price / 1000000).toFixed(1)}M` : `AED ${price.toLocaleString()}`;

    let imgSrc = proj.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) imgSrc = '/' + imgSrc;

    return `
      <article class="offplan-card">
        <div class="offplan-card-media">
          <img src="${imgSrc}" alt="${title}" class="offplan-card-img" loading="lazy">
          <div class="offplan-card-overlay"></div>
          <div class="offplan-card-top">
            <div class="offplan-dev-badge"><span class="offplan-dev-name">${dev}</span></div>
            <span class="offplan-status-pill">${escapeHtml(proj.status || 'New Launch')}</span>
          </div>
        </div>
        <div class="offplan-card-body">
          <div class="offplan-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${loc}</span>
          </div>
          <h3 class="offplan-title">${title}</h3>
          <div class="offplan-meta-grid">
            <div class="offplan-meta-item"><span class="meta-lbl">Starting Price</span><span class="meta-val gold-text">${priceStr}</span></div>
            <div class="offplan-meta-item"><span class="meta-lbl">Handover</span><span class="meta-val">${escapeHtml(proj.handoverDate || 'TBA')}</span></div>
            <div class="offplan-meta-item"><span class="meta-lbl">Plan</span><span class="meta-val">${escapeHtml(proj.paymentPlan || 'Milestone')}</span></div>
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

function initInquiryForm() {
  const form = document.getElementById('pdetailInquiryForm');
  const resultMsg = document.getElementById('inquiryResultMsg');
  const btn = document.getElementById('btnSubmitInquiry');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('inqFullName').value.trim();
    const email = document.getElementById('inqEmail').value.trim();
    const phone = document.getElementById('inqPhone').value.trim();
    const typology = document.getElementById('inqBedrooms').value;
    const userMsg = document.getElementById('inqMessage').value.trim();
    const projectTitle = currentProject ? currentProject.title : 'Off-Plan Project';
    const developer = currentProject ? currentProject.developer : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Registering Interest...</span>';
    }

    try {
      const apiBase = getDiamoraApiEndpoint();
      const res = await fetch(`${apiBase}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          type: 'off-plan',
          budget: `Preferred: ${typology}`,
          intent: 'Pre-Launch Off-Plan Reservation',
          propertyTitle: `${projectTitle} (${developer})`,
          message: `${userMsg ? userMsg + ' | ' : ''}Preferred Typology: ${typology}`
        })
      });

      if (res.ok) {
        if (resultMsg) {
          resultMsg.style.display = 'block';
          resultMsg.style.color = '#25D366';
          resultMsg.innerHTML = '✅ <strong>VIP Registration Confirmed</strong>. Our luxury off-plan desk will contact you within 2 business hours with full allocations.';
        }
        form.reset();
      } else {
        throw new Error('Failed submission');
      }
    } catch (err) {
      if (resultMsg) {
        resultMsg.style.display = 'block';
        resultMsg.style.color = 'var(--gold-light)';
        resultMsg.innerHTML = '✅ Registration noted. Connecting with our advisory team on WhatsApp.';
      }
      setTimeout(() => {
        const text = encodeURIComponent(`Hello Diamora Properties, my name is ${name}. I just registered for ${projectTitle} (${typology}).`);
        window.open(`https://wa.me/971506760668?text=${text}`, '_blank');
      }, 1000);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Submit Registration</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    }
  });
}
