/**
 * DIAMORA PROPERTIES — MAIN JAVASCRIPT
 * Light Mode Preloader & GSAP ScrollTrigger Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Light Mode Loading Animation
  initPreloader();

  // 2. Initialize UI Interactions
  initBackToTop();
  initNewsletterForm();
});

/**
 * Luxury Light Mode Loading Animation (Preloader)
 */
function initPreloader() {
  const preloader = document.getElementById('diamoraPreloader');
  if (!preloader) {
    initPageAnimations();
    return;
  }

  // Disable scroll during preloader
  document.body.style.overflow = 'hidden';

  const counterEl = document.getElementById('preloaderCounter');
  const progressBar = document.getElementById('preloaderBar');
  const emblem = document.querySelector('.preloader-emblem svg');
  const title = document.querySelector('.preloader-brand-title');
  const tagline = document.querySelector('.preloader-tagline');

  const counterObj = { val: 0 };

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({
      onComplete: () => {
        dismissPreloader();
      }
    });

    // Emblem & Text Entrance
    tl.from(emblem, {
      scale: 0.6,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
    .from(title, {
      y: 15,
      opacity: 0,
      letterSpacing: '0.15em',
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .from(tagline, {
      y: 10,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    
    // Counter & Progress Bar Animation (0 to 100)
    .to(counterObj, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        const rounded = Math.floor(counterObj.val);
        if (counterEl) counterEl.textContent = `${rounded < 10 ? '0' + rounded : rounded}%`;
        if (progressBar) progressBar.style.width = `${counterObj.val}%`;
      }
    }, '-=0.3')
    
    // Emblem Glow Pulse at 100%
    .to(emblem, {
      scale: 1.08,
      filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.6))',
      duration: 0.35,
      ease: 'power2.out'
    })
    .to(emblem, {
      scale: 1,
      filter: 'drop-shadow(0 4px 15px rgba(212, 175, 55, 0.25))',
      duration: 0.25
    });

  } else {
    // Fallback if GSAP is not yet ready
    setTimeout(() => {
      dismissPreloader();
    }, 1500);
  }

  function dismissPreloader() {
    if (typeof gsap !== 'undefined') {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
          initPageAnimations();
        }
      });
    } else {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }
  }

  // Safety timer to prevent any freeze
  setTimeout(() => {
    if (preloader.style.display !== 'none') {
      dismissPreloader();
    }
  }, 4000);
}

/**
 * GSAP ScrollTrigger Page Animations
 */
function initPageAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

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
      delay: 0.3,
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
