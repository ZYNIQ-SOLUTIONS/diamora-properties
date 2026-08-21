/**
 * Diamora Properties — Main Script (Light Luxury Theme)
 * GSAP & ScrollTrigger Animations + Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize GSAP & Register Plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGsapAnimations();
  } else {
    console.warn('GSAP or ScrollTrigger not loaded; falling back to static presentation.');
  }

  // 2. Initialize UI Interactions
  initBackToTop();
  initNewsletterForm();
});

/**
 * GSAP Scroll-Driven and Reveal Animations
 */
function initGsapAnimations() {
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

  // Floating WhatsApp Button Entrance & Scale
  if (document.querySelector('.floating-whatsapp-btn')) {
    gsap.from('.floating-whatsapp-btn', {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Subscribing...</span>
    `;
    submitBtn.disabled = true;

    // Simulate luxury confirmation
    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Joined VIP List</span>
      `;
      submitBtn.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
      input.value = '';
      input.placeholder = 'Thank you for joining our private network.';

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        input.placeholder = 'Enter your email for private listings...';
      }, 4000);
    }, 1000);
  });
}
