/**
 * DIAMORA PROPERTIES — MAIN JAVASCRIPT v2.0
 * - Hero drone canvas sequence (GSAP ScrollTrigger)
 * - Sticky nav scroll behavior & mobile hamburger
 * - Interactive context map (Leaflet)
 * - Brand preloader sequence
 * - Consultation form handler
 * - GSAP ScrollTrigger entrance animations for all sections
 */

// Register GSAP plugins immediately
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSequence();
  initInteractiveMap();
  initBrandLoader();
  initNavBehavior();
  initBackToTop();
  initNewsletterForm();
  initConsultForm();
});

/* ==========================================================================
   1. HERO DRONE SEQUENCE (Canvas + GSAP ScrollTrigger)
   ========================================================================== */
function initHeroSequence() {
  const canvas = document.getElementById('hero-drone-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const frameCount = 30;
  const currentFrame = index =>
    `assets/images/abudhabi_drone_view/frame_${String(index + 1).padStart(3, '0')}.webp`;

  const images = [];
  const droneSeq = { frame: 0 };
  let lastValidFrame = 0;
  let isFirstFrameRendered = false;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    render();
  }

  function render() {
    const targetIndex = Math.min(Math.max(Math.round(droneSeq.frame), 0), frameCount - 1);
    let img = images[targetIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      img = images[lastValidFrame] || images[0];
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;
    lastValidFrame = targetIndex;
    isFirstFrameRendered = true;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const ratio = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const centerShiftX = (canvas.width - img.naturalWidth * ratio) / 2;
    const centerShiftY = (canvas.height - img.naturalHeight * ratio) / 2;

    context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
      centerShiftX, centerShiftY, img.naturalWidth * ratio, img.naturalHeight * ratio);
  }

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      if (!isFirstFrameRendered || i === 0) render();
    };
    images.push(img);
  }

  resizeCanvas();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 100);
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Scrub drone frames on scroll
    gsap.to(droneSeq, {
      frame: frameCount - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-sequence-section',
        start: 'top top',
        end: '+=2200',
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: render,
        onRefresh: render
      }
    });

    // Parallax fade on hero content
    gsap.to('.hero-content-overlay', {
      opacity: 0,
      y: -60,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: '.hero-sequence-section',
        start: 'top top',
        end: '+=850',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    // Scroll indicator fades quickly
    gsap.to('.scroll-indicator', {
      opacity: 0,
      y: 20,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: '.hero-sequence-section',
        start: 'top top',
        end: '+=300',
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  }
}

window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});

/* ==========================================================================
   2. INTERACTIVE CONTEXT MAP (Leaflet)
   ========================================================================== */
let leafletMapInstance = null;
let landmarkMarkers = [];

function initInteractiveMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  if (leafletMapInstance) {
    leafletMapInstance.invalidateSize();
    return;
  }

  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/logos/diamora-icon.svg',
      iconUrl: 'assets/logos/diamora-icon.svg',
      shadowUrl: ''
    });
  } catch (e) {}

  const targetLat = 24.4820317;
  const targetLng = 54.3496455;

  leafletMapInstance = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    preferCanvas: true
  }).setView([24.4780, 54.3496], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  }).addTo(leafletMapInstance);

  // Investment perimeter rings
  L.circle([targetLat, targetLng], {
    radius: 1500,
    color: '#D4AF37', weight: 1.5, opacity: 0.65,
    fillColor: '#D4AF37', fillOpacity: 0.04, dashArray: '6, 8'
  }).addTo(leafletMapInstance);

  L.circle([targetLat, targetLng], {
    radius: 3200,
    color: '#8C6A18', weight: 1, opacity: 0.35,
    fillOpacity: 0.01, dashArray: '4, 10'
  }).addTo(leafletMapInstance);

  // Diamora HQ pin
  const diamoraSvgPin = `
    <div class="custom-map-pin">
      <div class="marker-shadow-pulse"></div>
      <svg class="marker-graphic" width="104" height="104" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <polygon points="50,10 90,40 50,45 10,40" fill="#0A0C10" opacity="0.85"/>
          <polygon points="50,0 0,42 0,100 50,55" fill="url(#m-facetLeft)"/>
          <polygon points="50,0 0,42 0,100 50,55" fill="#000" opacity="0.3"/>
          <polygon points="50,0 100,42 100,100 50,55" fill="url(#m-facetRight)"/>
          <polygon points="50,0 20,22 50,45 80,22" fill="#FFFBEA"/>
          <polygon points="50,0 20,22 50,22" fill="#FFF0BE" opacity="0.7"/>
          <polygon points="50,0 80,22 50,22" fill="#FFFFFF" opacity="0.95"/>
          <polygon points="20,22 50,45 50,22" fill="#D4AF37" opacity="0.55"/>
          <polygon points="80,22 50,45 50,22" fill="#FBE6A2" opacity="0.85"/>
          <polygon points="46,43 54,43 54,100 46,100" fill="#030406"/>
          <line x1="50" y1="45" x2="50" y2="100" stroke="url(#m-gold1)" stroke-width="1.5" filter="url(#m-glow)"/>
          <line x1="50" y1="0" x2="0" y2="42" stroke="#FFF" stroke-width="2" opacity="0.7"/>
          <line x1="50" y1="0" x2="100" y2="42" stroke="#FFF" stroke-width="2" opacity="0.85"/>
        </g>
      </svg>
      <div class="marker-label">
        <div class="marker-title">DIAMORA</div>
        <div class="marker-subtitle">PROPERTIES</div>
      </div>
    </div>
  `;

  const diamoraIcon = L.divIcon({
    className: 'diamora-marker',
    html: diamoraSvgPin,
    iconSize: [120, 150],
    iconAnchor: [60, 125]
  });

  const hqMarker = L.marker([targetLat, targetLng], { icon: diamoraIcon, zIndexOffset: 1000 }).addTo(leafletMapInstance);
  hqMarker.bindPopup(`
    <div class="map-popup-card">
      <div class="popup-tag">Headquarters</div>
      <div class="popup-title">Diamora Properties</div>
      <div class="popup-desc">Sovereign advisory & investment headquarters in Al Markaziyah West, Abu Dhabi.</div>
      <div class="popup-meta">P.O. Box 92813 · 025 848 478</div>
    </div>
  `);

  // Landmark markers
  const primeLandmarks = [
    {
      name: 'Corniche Beach',
      category: 'waterfront',
      coords: [24.4715, 54.3310],
      tag: 'Prime Waterfront',
      desc: 'Iconic 8km promenade with world-class beach clubs and beachfront residences.',
      dist: '3 min'
    },
    {
      name: 'Emirates Palace',
      category: 'culture',
      coords: [24.4618, 54.3173],
      tag: 'Ultra-Luxury & Royal',
      desc: 'World-renowned 7-star palace & Presidential Court corridor.',
      dist: '6 min'
    },
    {
      name: 'Al Bateen Marina',
      category: 'marina',
      coords: [24.4532, 54.3418],
      tag: 'Yacht Club & Waterfront',
      desc: 'Exclusive private yacht berths, gourmet dining, and waterfront villas.',
      dist: '5 min'
    },
    {
      name: 'Qasr Al Hosn',
      category: 'culture',
      coords: [24.4815, 54.3548],
      tag: 'Heritage & Culture',
      desc: 'Abu Dhabi historic cultural beacon and architectural heritage quarter.',
      dist: '2 min'
    }
  ];

  primeLandmarks.forEach(item => {
    const landmarkHtml = `
      <div class="landmark-hotspot-pin" data-category="${item.category}">
        <span class="landmark-dot"></span>
        <span class="landmark-name">${item.name}</span>
        <span class="landmark-dist">${item.dist}</span>
      </div>
    `;

    const icon = L.divIcon({
      className: 'landmark-marker-wrapper',
      html: landmarkHtml,
      iconSize: [140, 36],
      iconAnchor: [70, 18]
    });

    const marker = L.marker(item.coords, { icon }).addTo(leafletMapInstance);
    marker.bindPopup(`
      <div class="map-popup-card">
        <div class="popup-tag">${item.tag}</div>
        <div class="popup-title">${item.name}</div>
        <div class="popup-desc">${item.desc}</div>
        <div class="popup-meta">Drive Time: ${item.dist} from Diamora HQ</div>
      </div>
    `);

    landmarkMarkers.push({ marker, category: item.category, coords: item.coords });
  });

  // Filter chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        leafletMapInstance.flyTo([targetLat, targetLng], 14, { duration: 1.2 });
        landmarkMarkers.forEach(lm => lm.marker.addTo(leafletMapInstance));
      } else {
        const matching = landmarkMarkers.find(lm => lm.category === filter);
        if (matching) {
          leafletMapInstance.flyTo(matching.coords, 15, { duration: 1.2 });
          matching.marker.openPopup();
        }
      }
    });
  });

  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMapInstance);

  setTimeout(() => { if (leafletMapInstance) leafletMapInstance.invalidateSize(); }, 300);

  window.addEventListener('resize', () => { if (leafletMapInstance) leafletMapInstance.invalidateSize(); });
}

/* ==========================================================================
   3. BRAND PRELOADER
   ========================================================================== */
function initBrandLoader() {
  const loader = document.getElementById('loader-wrapper');
  if (!loader) { initPageAnimations(); return; }

  const completeLoading = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        onComplete: () => {
          document.body.classList.add('loaded');
          loader.style.display = 'none';
          if (leafletMapInstance) leafletMapInstance.invalidateSize();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          initPageAnimations();
        }
      });
    } else {
      loader.style.display = 'none';
      document.body.classList.add('loaded');
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      initPageAnimations();
    }
  };

  setTimeout(completeLoading, 4400);
  // Safety fallback
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) completeLoading();
  }, 6000);
}

/* ==========================================================================
   4. NAV SCROLL BEHAVIOR & MOBILE HAMBURGER
   ========================================================================== */
function initNavBehavior() {
  const nav = document.getElementById('main-nav');
  const toggleBtn = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!nav) return;

  // Scroll class for shadow
  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger toggle
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    // Close on mobile link click
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('mobile-open') && !nav.contains(e.target)) {
        nav.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

/* ==========================================================================
   5. GSAP SCROLL ENTRANCE ANIMATIONS
   ========================================================================== */
function initPageAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Helper: fade-up animation
  function fadeUp(selector, options = {}) {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.from(selector, {
      y: options.y || 40,
      opacity: 0,
      duration: options.duration || 0.85,
      ease: options.ease || 'power3.out',
      stagger: options.stagger || 0,
      delay: options.delay || 0,
      scrollTrigger: {
        trigger: options.trigger || selector,
        start: options.start || 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Properties section
  if (document.querySelector('.properties-section')) {
    gsap.from('.properties-section .section-header', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.properties-section', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.property-card', {
      y: 50, opacity: 0, duration: 0.75, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.properties-grid', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.properties-private-cta', {
      y: 25, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.properties-private-cta', start: 'top 90%', toggleActions: 'play none none reverse' }
    });
  }

  // Pillars section
  if (document.querySelector('.pillars-section')) {
    gsap.from('.pillars-section .section-header', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.pillars-section', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.pillar-card', {
      y: 45, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.pillar-sec-item', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: '.pillars-secondary-grid', start: 'top 90%', toggleActions: 'play none none reverse' }
    });
  }

  // Partners section
  if (document.querySelector('.partners-section')) {
    gsap.from('.partners-section .section-header', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.partners-section', start: 'top 80%', toggleActions: 'play none none reverse' }
    });
  }

  // Consult section
  if (document.querySelector('.consult-section')) {
    gsap.from('.consult-content', {
      x: -30, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.consult-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.consult-form-wrap', {
      x: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.consult-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  }

  // Map section
  if (document.querySelector('.interactive-map-section')) {
    gsap.from('#map', {
      opacity: 0, scale: 0.985, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: '.interactive-map-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.header-panel', {
      x: -35, opacity: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: '.interactive-map-section', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.coord-panel', {
      x: 35, opacity: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: '.interactive-map-section', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.map-floating-cta', {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.interactive-map-section', start: 'top 40%', toggleActions: 'play none none reverse' }
    });
  }

  // Footer
  if (document.querySelector('.main-footer')) {
    gsap.from('.footer-col', {
      y: 35, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.main-footer', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.footer-trust-strip, .footer-bottom-bar', {
      y: 20, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12,
      scrollTrigger: { trigger: '.footer-trust-strip', start: 'top 95%', toggleActions: 'play none none reverse' }
    });
  }

  // WhatsApp button entrance
  if (document.querySelector('.floating-whatsapp-btn')) {
    gsap.from('.floating-whatsapp-btn', {
      scale: 0.7, opacity: 0, duration: 0.6, ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 80%',
        toggleActions: 'play reverse play reverse'
      }
    });
  }
}

/* ==========================================================================
   6. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   7. VIP NEWSLETTER FORM
   ========================================================================== */
function initNewsletterForm() {
  const form = document.getElementById('vipNewsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('.btn-subscribe');
    const originalHTML = submitBtn.innerHTML;

    if (!input || !input.value) return;

    submitBtn.innerHTML = `<span>Subscribing…</span>`;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Joined VIP List</span>
      `;
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      submitBtn.style.color = '#ffffff';
      input.value = '';
      input.placeholder = 'Thank you for joining our private network.';

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
        input.placeholder = 'Enter your email for private listings...';
      }, 4500);
    }, 900);
  });
}

/* ==========================================================================
   8. CONSULTATION FORM
   ========================================================================== */
function initConsultForm() {
  const form = document.getElementById('consultForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      }
    });

    if (!valid) return;

    const btn = document.getElementById('consultSubmitBtn');
    const btnText = document.getElementById('formBtnText');
    if (!btn || !btnText) return;

    const originalText = btnText.textContent;
    btn.disabled = true;
    btnText.textContent = 'Sending request…';

    // Simulate async submission — replace with real endpoint
    setTimeout(() => {
      btnText.textContent = 'Request Sent!';
      btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      btn.style.color = '#ffffff';

      // Build WhatsApp deep link fallback
      const name = form.querySelector('#cf-name')?.value || '';
      const phone = form.querySelector('#cf-phone')?.value || '';
      const budget = form.querySelector('#cf-budget')?.value || '';
      const intent = form.querySelector('#cf-intent')?.value || '';
      const waMsg = encodeURIComponent(
        `Hello Diamora Properties! I'd like to book a private consultation.\n\n` +
        `Name: ${name}\nPhone: ${phone}\nBudget: AED ${budget}\nIntent: ${intent}`
      );

      setTimeout(() => {
        window.open(`https://wa.me/971551260772?text=${waMsg}`, '_blank', 'noopener,noreferrer');
        form.reset();
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        btnText.textContent = originalText;
      }, 1200);
    }, 900);
  });
}
