/**
 * DIAMORA PROPERTIES — MAIN JAVASCRIPT
 * Exact Brand Loader, Interactive Context Map & GSAP ScrollTrigger Sequence
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Interactive Context Map (Light Mode)
  initInteractiveMap();

  // 2. Initialize Brand Loading Animation Sequence
  initBrandLoader();

  // 3. Initialize UI Interactions
  initBackToTop();
  initNewsletterForm();
});

/**
 * Interactive Context Map (Al Markaziyah West / Al Bateen Sector)
 */
let leafletMapInstance = null;

function initInteractiveMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  // Target Coordinates (Al Markaziyah West / Al Bateen Sector)
  const targetLat = 24.4820317;
  const targetLng = 54.3496455;

  // Initialize Map with smooth settings (scrollWheelZoom disabled for smooth page scroll)
  leafletMapInstance = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false
  }).setView([targetLat, targetLng], 15);

  // Standard OpenStreetMap tiles (filtered to Diamond Alabaster in CSS)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors | Diamora Properties'
  }).addTo(leafletMapInstance);

  // Define exact Monogram SVG string for the custom animated pin
  const diamoraSvgPin = `
    <div class="custom-map-pin">
      <div class="marker-shadow-pulse"></div>
      <svg class="marker-graphic" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 0)">
          <!-- Facets referencing global defs -->
          <polygon points="50,10 90,40 50,45 10,40" fill="#0A0C10" opacity="0.8"/>
          <polygon points="50,0 0,42 0,100 50,55" fill="url(#m-facetLeft)"/>
          <polygon points="50,0 0,42 0,100 50,55" fill="#000" opacity="0.3"/> 
          <polygon points="50,0 100,42 100,100 50,55" fill="url(#m-facetRight)"/>
          <polygon points="50,0 20,22 50,45 80,22" fill="#FFFBEA"/>
          <polygon points="50,0 20,22 50,22" fill="#FFF0BE" opacity="0.7"/>
          <polygon points="50,0 80,22 50,22" fill="#FFFFFF" opacity="0.9"/>
          <polygon points="20,22 50,45 50,22" fill="#D4AF37" opacity="0.5"/>
          <polygon points="80,22 50,45 50,22" fill="#FBE6A2" opacity="0.8"/>
          <polygon points="46,43 54,43 54,100 46,100" fill="#030406"/>
          
          <!-- Lines referencing global defs -->
          <line x1="50" y1="45" x2="50" y2="100" stroke="url(#m-gold1)" stroke-width="1.5" filter="url(#m-glow)"/>
          <line x1="25" y1="65" x2="25" y2="92" stroke="#FFF" stroke-width="1.5" opacity="0.4"/>
          <line x1="75" y1="65" x2="75" y2="92" stroke="#FFF" stroke-width="1.5" opacity="0.4"/>
          <line x1="50" y1="0" x2="0" y2="42" stroke="#FFF" stroke-width="2" opacity="0.6"/>
          <line x1="50" y1="0" x2="100" y2="42" stroke="#FFF" stroke-width="2" opacity="0.8"/>
        </g>
      </svg>
      <div class="marker-label">
        <div class="marker-title">DIAMORA</div>
        <div class="marker-subtitle">PROPERTIES</div>
      </div>
    </div>
  `;

  // Create custom DivIcon
  const diamoraIcon = L.divIcon({
    className: 'diamora-marker',
    html: diamoraSvgPin,
    iconSize: [120, 150],
    iconAnchor: [60, 125]
  });

  // Add Marker to Map
  L.marker([targetLat, targetLng], { icon: diamoraIcon }).addTo(leafletMapInstance);

  // Add Zoom Control to Bottom Left
  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMapInstance);

  // Invalidate size on window resize
  window.addEventListener('resize', () => {
    if (leafletMapInstance) {
      leafletMapInstance.invalidateSize();
    }
  });
}

/**
 * Exact Brand Loading Animation Sequence
 */
function initBrandLoader() {
  const loader = document.getElementById('loader-wrapper');
  if (!loader) {
    initPageAnimations();
    return;
  }

  // Prevent scroll during loader sequence
  document.body.style.overflow = 'hidden';

  const animationDuration = 4200; // ms for full stroke drawing + lockup slide

  const completeLoading = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        onComplete: () => {
          document.body.classList.add('loaded');
          document.body.style.overflow = '';
          loader.style.display = 'none';

          // Ensure map dimensions refresh after curtain opens
          if (leafletMapInstance) {
            leafletMapInstance.invalidateSize();
          }

          initPageAnimations();
        }
      });
    } else {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      document.body.classList.add('loaded');
      document.body.style.overflow = '';

      if (leafletMapInstance) {
        leafletMapInstance.invalidateSize();
      }

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
 * GSAP ScrollTrigger Page Animations
 */
function initPageAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Map Panels Reveal
  if (document.querySelector('.header-panel')) {
    gsap.from('.header-panel', {
      x: -40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2
    });
  }

  if (document.querySelector('.coord-panel')) {
    gsap.from('.coord-panel', {
      x: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3
    });
  }

  // Pre-Footer CTA Card ScrollTrigger Reveal
  if (document.querySelector('.cta-card')) {
    gsap.from('.cta-card', {
      scrollTrigger: {
        trigger: '.pre-footer-cta',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  }

  // Main Footer Columns Staggered Reveal
  if (document.querySelector('.footer-top-grid')) {
    gsap.from('.footer-col', {
      scrollTrigger: {
        trigger: '.main-footer',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out'
    });
  }

  // Footer Trust Strip & Bottom Bar Reveal
  if (document.querySelector('.footer-trust-strip')) {
    gsap.from('.footer-trust-strip, .footer-bottom-bar', {
      scrollTrigger: {
        trigger: '.footer-trust-strip',
        start: 'top 95%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.75,
      stagger: 0.15,
      ease: 'power2.out'
    });
  }

  // Floating WhatsApp Button Entrance
  if (document.querySelector('.floating-whatsapp-btn')) {
    gsap.from('.floating-whatsapp-btn', {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'back.out(1.7)'
    });
  }
}

/**
 * Back to Top Smooth Scroll Handler
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

/**
 * VIP Newsletter Subscription Feedback Handling
 */
function initNewsletterForm() {
  const form = document.getElementById('vipNewsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('.btn-subscribe');
    const originalText = submitBtn.innerHTML;

    if (!input || !input.value) return;

    // Loading State
    submitBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Subscribing...</span>
    `;
    submitBtn.disabled = true;

    // Simulate luxury confirmation
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
