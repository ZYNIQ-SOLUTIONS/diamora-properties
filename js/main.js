/**
 * DIAMORA PROPERTIES — MAIN JAVASCRIPT
 * Abu Dhabi Drone Sequence (Canvas + GSAP ScrollTrigger)
 * Interactive Context Map (Leaflet + CartoDB Voyager)
 * Brand Loading Sequence & Micro-interactions
 */

// Register GSAP plugins immediately if available
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Abu Dhabi Drone Sequence (Hero Canvas)
  initHeroSequence();

  // 2. Initialize Interactive Context Map
  initInteractiveMap();

  // 3. Initialize Brand Loading Animation Sequence
  initBrandLoader();

  // 4. Initialize UI Interactions
  initBackToTop();
  initNewsletterForm();
});

/**
 * =========================================================================
 * 1. ABU DHABI DRONE VIEW IMAGE SEQUENCE (HERO CANVAS + GSAP SCROLLTRIGGER)
 * =========================================================================
 */
function initHeroSequence() {
  const canvas = document.getElementById('hero-drone-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const frameCount = 30;
  const currentFrame = index =>
    `assets/images/abudhabi_drone_view/frame_${String(index + 1).padStart(3, '0')}.png`;

  const images = [];
  const droneSeq = { frame: 0 };
  let lastValidFrame = 0;

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

    // Gracefully fallback to closest loaded image if frame is buffering
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = images[lastValidFrame] || images[0];
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;
    lastValidFrame = targetIndex;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate background-size: cover
    const hRatio = canvas.width / img.naturalWidth;
    const vRatio = canvas.height / img.naturalWidth * (img.naturalWidth / img.naturalHeight);
    const ratio = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const centerShiftX = (canvas.width - img.naturalWidth * ratio) / 2;
    const centerShiftY = (canvas.height - img.naturalHeight * ratio) / 2;

    context.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      centerShiftX,
      centerShiftY,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );
  }

  // Preload all frames
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      if (i === 0) {
        render();
      }
    };
    images.push(img);
  }

  // Initial sizing
  resizeCanvas();

  // Debounced Resize Listener
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 100);
  });

  // Setup GSAP ScrollTrigger Sequence
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // 1. Scrub Drone Video Frames on Scroll
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

    // 2. Bidirectional Text Overlay Parallax (Fade Out on Down, Fade In on Up)
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

    // 3. Scroll Prompt Quick Fade Out
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

/**
 * =========================================================================
 * 2. INTERACTIVE CONTEXT MAP (ABU DHABI CORNICHE & AL BATEEN SECTOR)
 * =========================================================================
 */
let leafletMapInstance = null;
let landmarkMarkers = [];

function initInteractiveMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  if (leafletMapInstance) {
    leafletMapInstance.invalidateSize();
    return;
  }

  // Prevent default Leaflet icon 404 warnings
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/logos/diamora-icon.svg',
      iconUrl: 'assets/logos/diamora-icon.svg',
      shadowUrl: ''
    });
  } catch (e) {
    // Ignore fallback
  }

  const targetLat = 24.4820317;
  const targetLng = 54.3496455;

  leafletMapInstance = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    preferCanvas: true
  }).setView([24.4780, 54.3496], 14);

  // CartoDB Voyager High-Definition Tile Layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  }).addTo(leafletMapInstance);

  // Investment Perimeter Rings (1.5KM & 3.2KM)
  L.circle([targetLat, targetLng], {
    radius: 1500,
    color: '#D4AF37',
    weight: 1.5,
    opacity: 0.65,
    fillColor: '#D4AF37',
    fillOpacity: 0.04,
    dashArray: '6, 8'
  }).addTo(leafletMapInstance);

  L.circle([targetLat, targetLng], {
    radius: 3200,
    color: '#8C6A18',
    weight: 1,
    opacity: 0.35,
    fillOpacity: 0.01,
    dashArray: '4, 10'
  }).addTo(leafletMapInstance);

  // Master Diamora Sovereign SVG Pin
  const diamoraSvgPin = `
    <div class="custom-map-pin">
      <div class="marker-shadow-pulse"></div>
      <svg class="marker-graphic" width="104" height="104" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 0)">
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
          <line x1="25" y1="65" x2="25" y2="92" stroke="#FFF" stroke-width="1.5" opacity="0.5"/>
          <line x1="75" y1="65" x2="75" y2="92" stroke="#FFF" stroke-width="1.5" opacity="0.5"/>
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
      <div class="popup-desc">Sovereign advisory & investment headquarters in Al Markaziyah West.</div>
      <div class="popup-meta">P.O. Box 92813 • 025848478</div>
    </div>
  `);

  // Surrounding Luxury Landmarks
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

    const marker = L.marker(item.coords, { icon: icon }).addTo(leafletMapInstance);
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

  // Filter Buttons
  const filterButtons = document.querySelectorAll('.chip-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
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

  setTimeout(() => {
    if (leafletMapInstance) leafletMapInstance.invalidateSize();
  }, 300);

  window.addEventListener('resize', () => {
    if (leafletMapInstance) {
      leafletMapInstance.invalidateSize();
    }
  });
}

/**
 * =========================================================================
 * 3. BRAND LOADER INTRO SEQUENCE
 * =========================================================================
 */
function initBrandLoader() {
  const loader = document.getElementById('loader-wrapper');
  if (!loader) {
    initPageAnimations();
    return;
  }

  const animationDuration = 4000;

  const completeLoading = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        onComplete: () => {
          document.body.classList.add('loaded');
          loader.style.display = 'none';

          if (leafletMapInstance) {
            leafletMapInstance.invalidateSize();
          }

          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }

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

  setTimeout(completeLoading, animationDuration);

  // Safety fallback
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      completeLoading();
    }
  }, 5500);
}

/**
 * =========================================================================
 * 4. GSAP SCROLLTRIGGER ANIMATIONS FOR NEXT SECTIONS
 * =========================================================================
 */
function initPageAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Map Canvas & Grid Entrance
  if (document.querySelector('.interactive-map-section')) {
    gsap.from('#map', {
      opacity: 0,
      scale: 0.985,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    gsap.from('.blueprint-grid', {
      opacity: 0,
      y: 40,
      duration: 1.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Floating Header & Coord Panels
  if (document.querySelector('.header-panel')) {
    gsap.from('.header-panel', {
      x: -35,
      opacity: 0,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  if (document.querySelector('.coord-panel')) {
    gsap.from('.coord-panel', {
      x: 35,
      opacity: 0,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Floating CTA Card
  if (document.querySelector('.map-floating-cta')) {
    gsap.from('.map-floating-cta', {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 40%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Main Footer Columns
  if (document.querySelector('.footer-top-grid')) {
    gsap.from('.footer-col', {
      scrollTrigger: {
        trigger: '.main-footer',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 35,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }

  // Footer Trust Strip & Bottom Bar
  if (document.querySelector('.footer-trust-strip')) {
    gsap.from('.footer-trust-strip, .footer-bottom-bar', {
      scrollTrigger: {
        trigger: '.footer-trust-strip',
        start: 'top 95%',
        toggleActions: 'play none none reverse'
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out'
    });
  }

  // Floating WhatsApp Button
  if (document.querySelector('.floating-whatsapp-btn')) {
    gsap.from('.floating-whatsapp-btn', {
      scale: 0.7,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: '.interactive-map-section',
        start: 'top 80%',
        toggleActions: 'play reverse play reverse'
      }
    });
  }
}

/**
 * =========================================================================
 * 5. BACK TO TOP & FORMS
 * =========================================================================
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function initNewsletterForm() {
  const form = document.getElementById('vipNewsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('.btn-subscribe');
    const originalText = submitBtn.innerHTML;

    if (!input || !input.value) return;

    submitBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Subscribing...</span>
    `;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Joined VIP List</span>
      `;
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      submitBtn.style.color = '#ffffff';
      input.value = '';
      input.placeholder = 'Thank you for joining our private network.';

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
        input.placeholder = 'Enter your email for private listings...';
      }, 4000);
    }, 900);
  });
}
