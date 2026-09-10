import { test, describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Robust lightweight HTML parser and query engine for UI structure assertions
 */
function parseHTML(htmlString) {
  const elements = [];
  const idMap = new Map();
  const classMap = new Map();
  const tagMap = new Map();

  const tagRegex = /<([a-zA-Z0-9\-]+)((?:\s+[a-zA-Z0-9\-:_]+(?:=(?:\"[^\"]*\"|'[^']*'|[^\s>]+))?)*)\s*(\/)?>/g;
  let match;
  while ((match = tagRegex.exec(htmlString)) !== null) {
    const [fullTag, tagName, rawAttrs, isSelfClosing] = match;
    const attrs = new Map();
    if (rawAttrs) {
      const attrRegex = /([a-zA-Z0-9\-:_]+)(?:=(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+)))?/g;
      let aMatch;
      while ((aMatch = attrRegex.exec(rawAttrs)) !== null) {
        attrs.set(aMatch[1].toLowerCase(), aMatch[2] ?? aMatch[3] ?? aMatch[4] ?? '');
      }
    }
    const node = {
      tagName: tagName.toLowerCase(),
      attrs,
      getAttribute: (k) => attrs.get(k.toLowerCase()) ?? null,
      hasAttribute: (k) => attrs.has(k.toLowerCase()),
      id: attrs.get('id') || null,
      classList: (attrs.get('class') || '').split(/\s+/).filter(Boolean)
    };
    elements.push(node);
    if (node.id) idMap.set(node.id, node);
    for (const c of node.classList) {
      if (!classMap.has(c)) classMap.set(c, []);
      classMap.get(c).push(node);
    }
    const tagLower = node.tagName;
    if (!tagMap.has(tagLower)) tagMap.set(tagLower, []);
    tagMap.get(tagLower).push(node);
  }

  function matchesSelector(el, selector) {
    const sel = selector.trim();
    if (sel.startsWith('#')) {
      return el.id === sel.slice(1);
    }
    if (sel.startsWith('.')) {
      return el.classList.includes(sel.slice(1));
    }
    // Handle tag[attr="val"] or [attr="val"]
    const attrMatch = sel.match(/^([a-zA-Z0-9\-]*)(?:\[([a-zA-Z0-9\-:_]+)(?:=(?:\"([^\"]*)\"|'([^']*)'|([^\]]+)))?\])?$/);
    if (attrMatch && (attrMatch[1] || attrMatch[2])) {
      const [_, tag, attrName, v1, v2, v3] = attrMatch;
      if (tag && el.tagName !== tag.toLowerCase()) return false;
      if (!attrName) return true;
      if (!el.hasAttribute(attrName)) return false;
      const expectedVal = v1 ?? v2 ?? v3;
      if (expectedVal !== undefined) {
        return el.getAttribute(attrName) === expectedVal;
      }
      return true;
    }
    if (sel.includes('.')) {
      const [tag, cls] = sel.split('.');
      return el.tagName === tag.toLowerCase() && el.classList.includes(cls);
    }
    return el.tagName === sel.toLowerCase();
  }

  return {
    raw: htmlString,
    elements,
    getElementById: (id) => idMap.get(id) || null,
    getElementsByClassName: (cls) => classMap.get(cls) || [],
    getElementsByTagName: (tag) => tagMap.get(tag.toLowerCase()) || [],
    querySelector: (sel) => elements.find(el => matchesSelector(el, sel)) || null,
    querySelectorAll: (sel) => elements.filter(el => matchesSelector(el, sel))
  };
}

describe('UI Rendering & Layout Baseline Suite', () => {
  const readPage = (filename) => {
    const filePath = path.join(rootDir, filename);
    assert.ok(fs.existsSync(filePath), `${filename} must exist in repository root`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.length > 1000, `${filename} must contain non-trivial HTML`);
    return parseHTML(content);
  };

  describe('1. Landing Page (index.html) Structural Integrity', () => {
    let doc;
    before(() => {
      doc = readPage('index.html');
    });

    it('contains valid page title, meta SEO, and OpenGraph tags', () => {
      assert.ok(doc.raw.includes('<title>Diamora Properties | Luxury Real Estate'), 'Page title matches brand');
      assert.ok(doc.raw.includes('name="description"'), 'Meta description exists');
      assert.ok(doc.raw.includes('name="keywords"'), 'Meta keywords exist');
      assert.ok(doc.raw.includes('property="og:title"'), 'og:title exists');
      assert.ok(doc.raw.includes('property="og:description"'), 'og:description exists');
      assert.ok(doc.raw.includes('property="og:image"'), 'og:image exists');
      assert.ok(doc.raw.includes('rel="canonical"'), 'Canonical link exists');
      assert.ok(doc.raw.includes('href="https://diamora.properties/"'), 'Canonical URL points to domain root');
    });

    it('renders preloader awakening wrapper and fill elements', () => {
      const preloader = doc.getElementById('loader-wrapper');
      assert.ok(preloader, '#loader-wrapper must exist');
      assert.equal(preloader.getAttribute('aria-label'), 'Loading Diamora Properties');

      assert.ok(doc.getElementById('loaderFillBar'), '#loaderFillBar exists');
      assert.ok(doc.getElementById('loaderPercentText'), '#loaderPercentText exists');
    });

    it('renders top contact bar with verified direct advisory channels', () => {
      const topBar = doc.getElementById('top-bar');
      assert.ok(topBar, '#top-bar must exist');

      const phoneLink = doc.querySelector('a[href="tel:+97125848478"]');
      assert.ok(phoneLink, 'Telephone advisory link tel:+97125848478 exists');

      const waLink = doc.querySelector('a[href="https://wa.me/971506760668"]');
      assert.ok(waLink, 'WhatsApp direct link https://wa.me/971506760668 exists');

      const emailLink = doc.querySelector('a[href="mailto:info@diamora.properties"]');
      assert.ok(emailLink, 'Email advisory link mailto:info@diamora.properties exists');

      assert.ok(doc.raw.includes('Licensed Real Estate Advisory · UAE'), 'Regulatory UAE tag present');
      assert.ok(doc.raw.includes('Abu Dhabi &amp; Dubai') || doc.raw.includes('Abu Dhabi & Dubai'), 'Emirates coverage tag present');
    });

    it('renders main navigation header with logo, progress bar, links, and mobile drawer', () => {
      const mainNav = doc.getElementById('main-nav');
      assert.ok(mainNav, '#main-nav must exist');
      assert.equal(mainNav.getAttribute('role'), 'banner');

      assert.ok(doc.getElementById('navProgressBar'), '#navProgressBar exists');
      assert.ok(doc.getElementById('navProgressFill'), '#navProgressFill exists');

      // Logo
      const logoImg = doc.querySelector('img[src="assets/logos/diamora-navbar-gold.png"]');
      assert.ok(logoImg, 'Navbar gold logo assets/logos/diamora-navbar-gold.png is present');

      // Navigation links
      assert.ok(doc.querySelector('a[href="projects.html"]'), 'Nav link to projects.html exists');
      assert.ok(doc.querySelector('a[href="properties.html"]'), 'Nav link to properties.html exists');
      assert.ok(doc.querySelector('a[href="blog.html"]'), 'Nav link to blog.html exists');
      assert.ok(doc.querySelector('a[href="#properties"]'), 'Nav link to #properties exists');
      assert.ok(doc.querySelector('a[href="#about"]'), 'Nav link to #about exists');
      assert.ok(doc.querySelector('a[href="#location-map"]'), 'Nav link to #location-map exists');
      assert.ok(doc.querySelector('a[href="#why-diamora"]'), 'Nav link to #why-diamora exists');

      // CTA & Mobile controls
      const navCta = doc.getElementById('navCta');
      assert.ok(navCta, '#navCta button exists');
      assert.equal(navCta.getAttribute('href'), '#consult');

      const navToggle = doc.getElementById('navToggle');
      assert.ok(navToggle, '#navToggle hamburger button exists');
      assert.equal(navToggle.getAttribute('aria-controls'), 'mobileMenu');

      const mobileMenu = doc.getElementById('mobileMenu');
      assert.ok(mobileMenu, '#mobileMenu drawer exists');
      assert.equal(mobileMenu.getAttribute('role'), 'dialog');
    });

    it('renders hero live search form and filter select elements', () => {
      const hero = doc.getElementById('hero-home');
      assert.ok(hero, '#hero-home section exists');

      const form = doc.getElementById('heroPropertySearchForm');
      assert.ok(form, '#heroPropertySearchForm exists');

      assert.ok(doc.getElementById('propSearchKeyword'), '#propSearchKeyword input exists');
      assert.ok(doc.getElementById('filterLocation'), '#filterLocation select exists');
      assert.ok(doc.getElementById('filterType'), '#filterType select exists');
      assert.ok(doc.getElementById('filterBudget'), '#filterBudget select exists');
      assert.ok(doc.getElementById('btnExecuteSearch'), '#btnExecuteSearch button exists');
    });

    it('renders flagship off-plan developments section and grid', () => {
      const offplanSection = doc.getElementById('off-plan-projects');
      assert.ok(offplanSection, '#off-plan-projects section exists');
      assert.ok(doc.getElementById('offplan-heading'), '#offplan-heading exists');
      assert.ok(doc.getElementById('offplanProjectsGrid'), '#offplanProjectsGrid exists');
    });

    it('renders signature properties catalog section and controls', () => {
      const propSection = doc.getElementById('properties');
      assert.ok(propSection, '#properties section exists');
      assert.ok(doc.getElementById('properties-title'), '#properties-title exists');
      assert.ok(doc.getElementById('propertiesGrid'), '#propertiesGrid exists');
      assert.ok(doc.getElementById('noPropResults'), '#noPropResults exists');
      assert.ok(doc.getElementById('btnResetFilters'), '#btnResetFilters exists');
    });

    it('renders about & heritage section with architectural SVG blueprint canvas', () => {
      const about = doc.getElementById('about');
      assert.ok(about, '#about section exists');
      assert.ok(doc.getElementById('about-heritage-title'), '#about-heritage-title exists');
      assert.ok(doc.getElementById('architectureBlueprintFrame'), '#architectureBlueprintFrame exists');
      assert.ok(doc.getElementById('architecture-svg'), '#architecture-svg canvas exists');
    });

    it('renders geolocation hub and interactive map canvas', () => {
      const mapSection = doc.getElementById('location-map');
      assert.ok(mapSection, '#location-map section exists');
      assert.ok(doc.getElementById('location-map-title'), '#location-map-title exists');
      assert.ok(doc.getElementById('map'), '#map canvas exists');
      assert.ok(doc.getElementById('vipNewsletterForm'), '#vipNewsletterForm exists');
      assert.ok(doc.getElementById('vip-email'), '#vip-email input exists');
    });

    it('renders Why Diamora key pillars and developer partners sections', () => {
      const pillars = doc.getElementById('why-diamora');
      assert.ok(pillars, '#why-diamora section exists');
      assert.ok(doc.getElementById('pillars-title'), '#pillars-title exists');

      const partners = doc.getElementById('partners');
      assert.ok(partners, '#partners section exists');
      assert.ok(doc.getElementById('partners-title'), '#partners-title exists');
      assert.ok(doc.raw.includes('partners-track'), 'Partners marquee track exists');
    });

    it('renders consultation booking form with all required form inputs', () => {
      const consult = doc.getElementById('consult');
      assert.ok(consult, '#consult section exists');
      assert.ok(doc.getElementById('consult-title'), '#consult-title exists');

      const form = doc.getElementById('consultForm');
      assert.ok(form, '#consultForm exists');
      assert.ok(form.hasAttribute('novalidate'), '#consultForm has novalidate attribute');

      // Required fields
      const nameInput = doc.getElementById('cf-name');
      assert.ok(nameInput && nameInput.hasAttribute('required'), '#cf-name is required');

      const phoneInput = doc.getElementById('cf-phone');
      assert.ok(phoneInput && phoneInput.hasAttribute('required'), '#cf-phone is required');

      const emailInput = doc.getElementById('cf-email');
      assert.ok(emailInput && emailInput.hasAttribute('required'), '#cf-email is required');

      const budgetSelect = doc.getElementById('cf-budget');
      assert.ok(budgetSelect && budgetSelect.hasAttribute('required'), '#cf-budget is required');

      const intentSelect = doc.getElementById('cf-intent');
      assert.ok(intentSelect && intentSelect.hasAttribute('required'), '#cf-intent is required');

      const messageInput = doc.getElementById('cf-message');
      assert.ok(messageInput, '#cf-message exists');

      const submitBtn = doc.getElementById('consultSubmitBtn');
      assert.ok(submitBtn, '#consultSubmitBtn exists');
      assert.ok(doc.getElementById('formBtnText'), '#formBtnText exists');
    });

    it('renders main footer with gold logo, social links, legal navigation, and back-to-top button', () => {
      const footer = doc.querySelector('footer.main-footer');
      assert.ok(footer, 'footer.main-footer must exist');
      assert.equal(footer.getAttribute('role'), 'contentinfo');

      const footerLogo = doc.querySelector('img[src="assets/logos/diamora-footer-gold.png"]');
      assert.ok(footerLogo, 'Footer gold logo assets/logos/diamora-footer-gold.png exists');

      // Legal links
      assert.ok(doc.querySelector('a[href="privacy.html"]'), 'privacy.html legal link exists');
      assert.ok(doc.querySelector('a[href="terms.html"]'), 'terms.html legal link exists');
      assert.ok(doc.querySelector('a[href="aml.html"]'), 'aml.html legal link exists');
      assert.ok(doc.querySelector('a[href="cookies.html"]'), 'cookies.html legal link exists');

      const backToTop = doc.getElementById('backToTopBtn');
      assert.ok(backToTop, '#backToTopBtn exists');
    });

    it('renders floating WhatsApp button and critical script tags', () => {
      const waBtn = doc.querySelector('a.floating-whatsapp-btn');
      assert.ok(waBtn, 'Floating WhatsApp button exists');
      assert.equal(waBtn.getAttribute('href'), 'https://wa.me/971506760668');

      // Critical external and internal scripts
      assert.ok(doc.raw.includes('leaflet.js'), 'Leaflet script tag exists');
      assert.ok(doc.raw.includes('gsap.min.js'), 'GSAP script tag exists');
      assert.ok(doc.raw.includes('ScrollTrigger.min.js'), 'ScrollTrigger script tag exists');
      assert.ok(doc.raw.includes('anime.min.js'), 'Anime.js script tag exists');
      assert.ok(doc.raw.includes('js/main.js'), 'main.js script tag exists');
      assert.ok(doc.raw.includes('js/chatbot.js'), 'chatbot.js script tag exists');
    });
  });

  describe('2. Projects Archive Page (projects.html) Structural Integrity', () => {
    let doc;
    before(() => {
      doc = readPage('projects.html');
    });

    it('renders top contact bar, main navigation, and mobile menu', () => {
      assert.ok(doc.getElementById('top-bar'), '#top-bar exists in projects.html');
      assert.ok(doc.getElementById('main-nav'), '#main-nav exists in projects.html');
      assert.ok(doc.getElementById('navProgressBar'), '#navProgressBar exists');
      assert.ok(doc.getElementById('navCta'), '#navCta exists');
      assert.ok(doc.getElementById('navToggle'), '#navToggle exists');
      assert.ok(doc.getElementById('mobileMenu'), '#mobileMenu exists');
    });

    it('renders quick Emirate city pills selector with exact 4 city options', () => {
      const container = doc.getElementById('cityPillsContainer');
      assert.ok(container, '#cityPillsContainer exists');

      const pills = doc.querySelectorAll('.city-pill');
      assert.equal(pills.length, 4, 'Must contain 4 city pills');

      const cities = pills.map(p => p.getAttribute('data-city'));
      assert.ok(cities.includes('all'), 'data-city="all" pill exists');
      assert.ok(cities.includes('Dubai'), 'data-city="Dubai" pill exists');
      assert.ok(cities.includes('Abu Dhabi'), 'data-city="Abu Dhabi" pill exists');
      assert.ok(cities.includes('Ras Al Khaimah'), 'data-city="Ras Al Khaimah" pill exists');
    });

    it('renders search and filter form with all specified controls', () => {
      const form = doc.getElementById('projectSearchForm');
      assert.ok(form, '#projectSearchForm exists');

      assert.ok(doc.getElementById('projectSearchInput'), '#projectSearchInput search input exists');
      assert.ok(doc.getElementById('filterDeveloper'), '#filterDeveloper select exists');
      assert.ok(doc.getElementById('filterStatus'), '#filterStatus select exists');
      assert.ok(doc.getElementById('filterPrice'), '#filterPrice select exists');
      assert.ok(doc.getElementById('filterSort'), '#filterSort select exists');
    });

    it('renders result count bar, reset button, offplan grid, and empty state', () => {
      assert.ok(doc.getElementById('projectsCount'), '#projectsCount result count exists');
      assert.ok(doc.getElementById('btnResetFilters'), '#btnResetFilters reset button exists');
      assert.ok(doc.getElementById('projectsArchiveGrid'), '#projectsArchiveGrid exists');
      assert.ok(doc.getElementById('projectsEmptyState'), '#projectsEmptyState empty state container exists');
    });

    it('includes essential scripts js/projects.js and js/chatbot.js', () => {
      assert.ok(doc.raw.includes('js/projects.js'), 'js/projects.js script tag exists');
      assert.ok(doc.raw.includes('js/chatbot.js'), 'js/chatbot.js script tag exists');
    });
  });

  describe('3. Properties Catalog Page (properties.html) Structural Integrity', () => {
    let doc;
    before(() => {
      doc = readPage('properties.html');
    });

    it('renders navigation landmarks and top bar', () => {
      assert.ok(doc.getElementById('top-bar'), '#top-bar exists in properties.html');
      assert.ok(doc.getElementById('main-nav'), '#main-nav exists in properties.html');
      assert.ok(doc.getElementById('navCta'), '#navCta exists');
      assert.ok(doc.getElementById('navToggle'), '#navToggle exists');
      assert.ok(doc.getElementById('mobileMenu'), '#mobileMenu exists');
    });

    it('renders catalog search controls and filter inputs', () => {
      assert.ok(doc.getElementById('catalogSearchStage'), '#catalogSearchStage exists');
      assert.ok(doc.getElementById('catalogPropertySearchForm'), '#catalogPropertySearchForm exists');
      assert.ok(doc.getElementById('propSearchKeyword'), '#propSearchKeyword input exists');
      assert.ok(doc.getElementById('filterLocation'), '#filterLocation select exists');
      assert.ok(doc.getElementById('filterType'), '#filterType select exists');
      assert.ok(doc.getElementById('filterBudget'), '#filterBudget select exists');
      assert.ok(doc.getElementById('btnExecuteSearch'), '#btnExecuteSearch button exists');
      assert.ok(doc.getElementById('btnResetFilters'), '#btnResetFilters button exists');
    });

    it('renders catalog result counter and catalog grid container', () => {
      assert.ok(doc.getElementById('catalogResultsCount'), '#catalogResultsCount exists');
      assert.ok(doc.getElementById('countNum'), '#countNum dynamic count element exists');
      assert.ok(doc.getElementById('catalogGrid'), '#catalogGrid exists');
    });

    it('renders video tour modal backdrop, title, and video player element', () => {
      assert.ok(doc.getElementById('videoModal'), '#videoModal exists');
      assert.ok(doc.getElementById('videoModalTitle'), '#videoModalTitle exists');
      assert.ok(doc.getElementById('catalogVideoPlayer'), '#catalogVideoPlayer video element exists');
    });

    it('renders footer, back-to-top button, and chatbot script inclusion', () => {
      assert.ok(doc.getElementById('backToTopBtn'), '#backToTopBtn exists');
      assert.ok(doc.raw.includes('js/chatbot.js'), 'js/chatbot.js script tag exists');
    });
  });

  describe('4. Project Detail Page (project-detail.html) Structural Integrity', () => {
    let doc;
    before(() => {
      doc = readPage('project-detail.html');
    });

    it('contains dynamic title and OpenGraph metadata hooks', () => {
      assert.ok(doc.getElementById('pageTitle'), '#pageTitle title element exists');
      assert.ok(doc.getElementById('metaDescription'), '#metaDescription meta element exists');
      assert.ok(doc.getElementById('ogTitle'), '#ogTitle meta element exists');
      assert.ok(doc.getElementById('ogDescription'), '#ogDescription meta element exists');
      assert.ok(doc.getElementById('ogImage'), '#ogImage meta element exists');
    });

    it('renders breadcrumb and hero elements', () => {
      assert.ok(doc.getElementById('breadcrumbCurrent'), '#breadcrumbCurrent exists');

      const hero = doc.getElementById('projectHeroSection');
      assert.ok(hero, '#projectHeroSection exists');

      assert.ok(doc.getElementById('pdetailHeroImg'), '#pdetailHeroImg exists');
      assert.ok(doc.getElementById('pdetailDevBadge'), '#pdetailDevBadge exists');
      assert.ok(doc.getElementById('pdetailDevLogo'), '#pdetailDevLogo exists');
      assert.ok(doc.getElementById('pdetailDevName'), '#pdetailDevName exists');
      assert.ok(doc.getElementById('pdetailStatusPill'), '#pdetailStatusPill exists');
      assert.ok(doc.getElementById('pdetailTitle'), '#pdetailTitle exists');
      assert.ok(doc.getElementById('pdetailTagline'), '#pdetailTagline exists');
    });

    it('renders specification ribbon and primary action buttons', () => {
      assert.ok(doc.getElementById('pdetailPrice'), '#pdetailPrice exists');
      assert.ok(doc.getElementById('pdetailHandover'), '#pdetailHandover exists');
      assert.ok(doc.getElementById('pdetailPaymentPlan'), '#pdetailPaymentPlan exists');
      assert.ok(doc.getElementById('pdetailDownPayment'), '#pdetailDownPayment exists');
      assert.ok(doc.getElementById('pdetailLocation'), '#pdetailLocation exists');
      assert.ok(doc.getElementById('pdetailBedrooms'), '#pdetailBedrooms exists');

      assert.ok(doc.getElementById('btnOpenBrochure'), '#btnOpenBrochure exists');
      assert.ok(doc.getElementById('pdetailWhatsappBtn'), '#pdetailWhatsappBtn exists');
    });

    it('renders sticky navigation bar and all core detail content sections', () => {
      assert.ok(doc.getElementById('pdetailStickyNav'), '#pdetailStickyNav exists');
      assert.ok(doc.getElementById('overviewSection'), '#overviewSection exists');
      assert.ok(doc.getElementById('pdetailDescription'), '#pdetailDescription exists');
      assert.ok(doc.getElementById('pdetailHighlightsList'), '#pdetailHighlightsList exists');
      assert.ok(doc.getElementById('gallerySection'), '#gallerySection exists');
      assert.ok(doc.getElementById('pdetailGalleryGrid'), '#pdetailGalleryGrid exists');
      assert.ok(doc.getElementById('unitsSection'), '#unitsSection exists');
      assert.ok(doc.getElementById('pdetailUnitsGrid'), '#pdetailUnitsGrid exists');
      assert.ok(doc.getElementById('pdetailUnitsTableWrap'), '#pdetailUnitsTableWrap exists');
      assert.ok(doc.getElementById('pdetailUnitsTableBody'), '#pdetailUnitsTableBody exists');
      assert.ok(doc.getElementById('paymentPlanSection'), '#paymentPlanSection exists');
      assert.ok(doc.getElementById('amenitiesSection'), '#amenitiesSection exists');
      assert.ok(doc.getElementById('locationSection'), '#locationSection exists');
      assert.ok(doc.getElementById('faqsSection'), '#faqsSection exists');
    });

    it('renders brochure request modal with lead form and required input fields', () => {
      const brochureModal = doc.getElementById('brochureModal');
      assert.ok(brochureModal, '#brochureModal exists');

      assert.ok(doc.getElementById('btnCloseBrochureModal'), '#btnCloseBrochureModal close button exists');
      assert.ok(doc.getElementById('brochureLeadForm'), '#brochureLeadForm exists');

      const nameInput = doc.getElementById('brochureName');
      assert.ok(nameInput && nameInput.hasAttribute('required'), '#brochureName is required');

      const emailInput = doc.getElementById('brochureEmail');
      assert.ok(emailInput && emailInput.hasAttribute('required'), '#brochureEmail is required');

      const phoneInput = doc.getElementById('brochurePhone');
      assert.ok(phoneInput && phoneInput.hasAttribute('required'), '#brochurePhone is required');
    });

    it('renders lightbox image viewer modal with close button and caption', () => {
      const lightbox = doc.getElementById('lightboxModal');
      assert.ok(lightbox, '#lightboxModal exists');
      assert.ok(doc.getElementById('btnCloseLightbox'), '#btnCloseLightbox close button exists');
      assert.ok(doc.getElementById('lightboxImg'), '#lightboxImg image element exists');
      assert.ok(doc.getElementById('lightboxCaption'), '#lightboxCaption caption container exists');
    });

    it('includes essential scripts js/project-detail.js and js/chatbot.js', () => {
      assert.ok(doc.raw.includes('js/project-detail.js'), 'js/project-detail.js script tag exists');
      assert.ok(doc.raw.includes('js/chatbot.js'), 'js/chatbot.js script tag exists');
    });
  });

  describe('5. Cross-Page Architectural & Brand Consistency', () => {
    const pages = ['index.html', 'projects.html', 'properties.html', 'project-detail.html'];
    const docs = pages.map(p => ({ filename: p, doc: readPage(p) }));

    it('consistently includes official gold navbar and footer logos across all pages', () => {
      for (const { filename, doc } of docs) {
        const navLogo = doc.querySelector('img[src="assets/logos/diamora-navbar-gold.png"]');
        assert.ok(navLogo, `Navbar gold logo present on ${filename}`);

        const footerLogo = doc.querySelector('img[src="assets/logos/diamora-footer-gold.png"]');
        assert.ok(footerLogo, `Footer gold logo present on ${filename}`);
      }
    });

    it('consistently links to verified Diamora WhatsApp desk across all pages', () => {
      for (const { filename, doc } of docs) {
        assert.ok(doc.raw.includes('971506760668'), `WhatsApp number present on ${filename}`);
      }
    });

    it('consistently integrates js/chatbot.js script on every public page', () => {
      for (const { filename, doc } of docs) {
        assert.ok(doc.raw.includes('js/chatbot.js'), `chatbot.js integrated on ${filename}`);
      }
    });
  });
});
