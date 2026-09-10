import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const projectsJsPath = path.join(rootDir, 'js/projects.js');

function createProjectsDOMEnvironment() {
  const elements = new Map();

  function getOrCreate(id, tag = 'div', initialVal = '') {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        tagName: tag.toUpperCase(),
        value: initialVal,
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
          _set: new Set(),
          add(c) { this._set.add(c); },
          remove(c) { this._set.delete(c); },
          contains(c) { return this._set.has(c); },
          toggle(c, f) {
            if (f !== undefined) {
              if (f) this._set.add(c); else this._set.delete(c);
              return f;
            }
            if (this._set.has(c)) { this._set.delete(c); return false; }
            this._set.add(c); return true;
          }
        },
        getAttribute(attr) { return null; },
        setAttribute(attr, val) {},
        addEventListener(evt, cb) {}
      });
    }
    return elements.get(id);
  }

  // Pre-seed filter control elements
  getOrCreate('projectSearchInput', 'input', '');
  getOrCreate('filterDeveloper', 'select', 'all');
  getOrCreate('filterStatus', 'select', 'all');
  getOrCreate('filterPrice', 'select', 'all');
  getOrCreate('filterSort', 'select', 'featured');
  getOrCreate('projectsCount', 'span', '');
  getOrCreate('projectsArchiveGrid', 'div', '');
  getOrCreate('projectsEmptyState', 'div', '');
  getOrCreate('btnResetFilters', 'button', '');

  const document = {
    getElementById: (id) => getOrCreate(id),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      classList: { add: () => {} },
      appendChild: () => {}
    }),
    addEventListener: () => {}
  };

  const window = {
    location: { search: '' },
    document,
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => { throw new Error('Simulated offline mode'); }
  };

  return { elements, document, window, getElem: (id) => getOrCreate(id) };
}

describe('Project Filtering Unit & DOM Baseline Suite', () => {
  let env;
  let context;
  let FALLBACK_PROJECTS;

  beforeEach(() => {
    env = createProjectsDOMEnvironment();
    let code = fs.readFileSync(projectsJsPath, 'utf8');

    // Attach internal variables and functions to window for hermetic test execution
    code += `
      window.FALLBACK_PROJECTS = FALLBACK_PROJECTS;
      window.applyFilters = applyFilters;
      window.renderProjects = renderProjects;
      window.getAllProjects = () => allProjects;
      window.setAllProjects = (arr) => { allProjects = arr; };
      window.getCurrentCityFilter = () => currentCityFilter;
      window.setCurrentCityFilter = (city) => { currentCityFilter = city; };
    `;

    context = {
      window: env.window,
      document: env.document,
      localStorage: env.window.localStorage,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout
    };

    vm.createContext(context);
    vm.runInContext(code, context);

    FALLBACK_PROJECTS = context.window.FALLBACK_PROJECTS;
    context.window.setAllProjects([...FALLBACK_PROJECTS]);
  });

  describe('Fallback Dataset Integrity', () => {
    it('contains exactly 7 verified developments with required fields', () => {
      assert.equal(FALLBACK_PROJECTS.length, 7, 'Must contain 7 fallback developments');

      const slugs = FALLBACK_PROJECTS.map(p => p.slug);
      assert.ok(slugs.includes('the-row-saadiyat'));
      assert.ok(slugs.includes('sobha-city-abu-dhabi'));
      assert.ok(slugs.includes('tilal-binghatti-dubai'));
      assert.ok(slugs.includes('manchester-city-yas-residences'));
      assert.ok(slugs.includes('the-wilds-dubai'));
      assert.ok(slugs.includes('mercedes-benz-places-dubai'));
      assert.ok(slugs.includes('sila-masdar-city'));

      for (const p of FALLBACK_PROJECTS) {
        assert.ok(p.title, `Project ${p.slug} must have a title`);
        assert.ok(p.developer, `Project ${p.slug} must have a developer`);
        assert.ok(p.city, `Project ${p.slug} must have a city`);
        assert.ok(p.location, `Project ${p.slug} must have a location`);
        assert.ok(typeof p.startingPrice === 'number' && p.startingPrice > 0, `Project ${p.slug} has valid startingPrice`);
        assert.ok(['New Launch', 'Under Construction', 'Handover Soon'].includes(p.status), `Project ${p.slug} has valid status`);
        assert.ok(typeof p.isFeatured === 'boolean', `Project ${p.slug} has boolean isFeatured`);
      }
    });
  });

  describe('City Filtering Logic', () => {
    it('filters projects by Dubai', () => {
      context.window.setCurrentCityFilter('Dubai');
      context.window.applyFilters();

      const countText = env.getElem('projectsCount').textContent;
      assert.equal(countText, 'Showing 3 off-plan developments');
    });

    it('filters projects by Abu Dhabi', () => {
      context.window.setCurrentCityFilter('Abu Dhabi');
      context.window.applyFilters();

      const countText = env.getElem('projectsCount').textContent;
      assert.equal(countText, 'Showing 4 off-plan developments');
    });

    it('returns all 7 projects when city is "all"', () => {
      context.window.setCurrentCityFilter('all');
      context.window.applyFilters();

      const countText = env.getElem('projectsCount').textContent;
      assert.equal(countText, 'Showing 7 off-plan developments');
    });

    it('handles case-insensitive city matching', () => {
      context.window.setCurrentCityFilter('dubai');
      context.window.applyFilters();

      const countText = env.getElem('projectsCount').textContent;
      assert.equal(countText, 'Showing 3 off-plan developments');
    });
  });

  describe('Developer Filter Logic', () => {
    it('filters by Aldar Properties (2 projects)', () => {
      env.getElem('filterDeveloper').value = 'Aldar Properties';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
    });

    it('filters by Sobha Realty (1 project)', () => {
      env.getElem('filterDeveloper').value = 'Sobha Realty';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
    });

    it('filters by Binghatti Developers (2 projects)', () => {
      env.getElem('filterDeveloper').value = 'Binghatti Developers';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
    });

    it('filters by Al Barari Group (1 project)', () => {
      env.getElem('filterDeveloper').value = 'Al Barari Group';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
    });

    it('filters by Reportage Properties (1 project)', () => {
      env.getElem('filterDeveloper').value = 'Reportage Properties';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
    });
  });

  describe('Status Filter Logic', () => {
    it('filters by "New Launch" (4 projects)', () => {
      env.getElem('filterStatus').value = 'New Launch';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 4 off-plan developments');
    });

    it('filters by "Under Construction" (3 projects)', () => {
      env.getElem('filterStatus').value = 'Under Construction';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 3 off-plan developments');
    });
  });

  describe('Starting Price Range Filter Logic', () => {
    it('filters "under15" (< 1.5M AED) returning 2 projects', () => {
      env.getElem('filterPrice').value = 'under15';
      context.window.applyFilters();

      // Tilal Binghatti (1.1M), Sila Masdar (890K)
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
    });

    it('filters "15to30" (1.5M - 3.0M AED) returning 2 projects', () => {
      env.getElem('filterPrice').value = '15to30';
      context.window.applyFilters();

      // Sobha City (1.5M), Manchester City Yas (1.95M)
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
    });

    it('filters "above30" (> 3.0M AED) returning 3 projects', () => {
      env.getElem('filterPrice').value = 'above30';
      context.window.applyFilters();

      // The Row Saadiyat (3.7M), The Wilds (3.8M), Mercedes-Benz Places (8.8M)
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 3 off-plan developments');
    });
  });

  describe('Free-Text Keyword Search Logic', () => {
    it('matches by location: "Yas Island"', () => {
      env.getElem('projectSearchInput').value = 'Yas Island';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Manchester City Yas Residences'));
    });

    it('matches by developer name: "Binghatti"', () => {
      env.getElem('projectSearchInput').value = 'Binghatti';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Tilal Binghatti Dubai'));
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Mercedes-Benz Places'));
    });

    it('matches by property type: "penthouse"', () => {
      env.getElem('projectSearchInput').value = 'penthouse';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 2 off-plan developments');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Tilal Binghatti'));
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Mercedes-Benz Places'));
    });

    it('matches by district: "Saadiyat"', () => {
      env.getElem('projectSearchInput').value = 'Saadiyat';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('The Row Saadiyat'));
    });

    it('shows empty state when no developments match search query', () => {
      env.getElem('projectSearchInput').value = 'NonExistentLuxuryProject12345';
      context.window.applyFilters();

      assert.equal(env.getElem('projectsCount').textContent, 'Showing 0 off-plan developments');
      assert.equal(env.getElem('projectsEmptyState').style.display, 'block');
    });
  });

  describe('Combined Multi-Filter Scenarios', () => {
    it('combines City + Developer + Price + Status filters', () => {
      context.window.setCurrentCityFilter('Dubai');
      env.getElem('filterDeveloper').value = 'Binghatti Developers';
      env.getElem('filterPrice').value = 'above30';
      env.getElem('filterStatus').value = 'Under Construction';

      context.window.applyFilters();

      // Exactly Mercedes-Benz Places by Binghatti (8.8M, Under Construction, Dubai)
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Mercedes-Benz Places'));
    });

    it('combines Abu Dhabi + Aldar Properties + 1.5M-3M budget', () => {
      context.window.setCurrentCityFilter('Abu Dhabi');
      env.getElem('filterDeveloper').value = 'Aldar Properties';
      env.getElem('filterPrice').value = '15to30';

      context.window.applyFilters();

      // Manchester City Yas Residences (1.95M, Aldar, Abu Dhabi)
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 1 off-plan development');
      assert.ok(env.getElem('projectsArchiveGrid').innerHTML.includes('Manchester City Yas Residences'));
    });
  });

  describe('Sorting Logic', () => {
    it('sorts by price-asc (lowest price first)', () => {
      env.getElem('filterSort').value = 'price-asc';
      context.window.applyFilters();

      const gridHtml = env.getElem('projectsArchiveGrid').innerHTML;
      const silaPos = gridHtml.indexOf('Sila at Masdar City'); // 890K
      const mbPos = gridHtml.indexOf('Mercedes-Benz Places'); // 8.8M
      assert.ok(silaPos !== -1 && mbPos !== -1);
      assert.ok(silaPos < mbPos, 'Sila (890K) must precede Mercedes-Benz (8.8M)');
    });

    it('sorts by price-desc (highest price first)', () => {
      env.getElem('filterSort').value = 'price-desc';
      context.window.applyFilters();

      const gridHtml = env.getElem('projectsArchiveGrid').innerHTML;
      const silaPos = gridHtml.indexOf('Sila at Masdar City'); // 890K
      const mbPos = gridHtml.indexOf('Mercedes-Benz Places'); // 8.8M
      assert.ok(silaPos !== -1 && mbPos !== -1);
      assert.ok(mbPos < silaPos, 'Mercedes-Benz (8.8M) must precede Sila (890K)');
    });

    it('sorts by featured (featured projects first)', () => {
      env.getElem('filterSort').value = 'featured';
      context.window.applyFilters();

      const gridHtml = env.getElem('projectsArchiveGrid').innerHTML;
      const featuredPos = gridHtml.indexOf('The Row Saadiyat'); // isFeatured: true
      const nonFeaturedPos = gridHtml.indexOf('The Wilds at Al Barari'); // isFeatured: false
      assert.ok(featuredPos !== -1 && nonFeaturedPos !== -1);
      assert.ok(featuredPos < nonFeaturedPos, 'Featured project precedes non-featured project');
    });
  });

  describe('Reset Filter Functionality', () => {
    it('resets all filter controls and restores all 7 developments', () => {
      // Apply strict filters first
      context.window.setCurrentCityFilter('Dubai');
      env.getElem('projectSearchInput').value = 'Waterfront';
      env.getElem('filterDeveloper').value = 'Binghatti Developers';
      env.getElem('filterStatus').value = 'Under Construction';
      env.getElem('filterPrice').value = 'under15';
      env.getElem('filterSort').value = 'price-desc';
      context.window.applyFilters();

      // Trigger reset
      context.window.resetProjectFilters();

      assert.equal(context.window.getCurrentCityFilter(), 'all', 'City filter reset to "all"');
      assert.equal(env.getElem('projectSearchInput').value, '', 'Search input cleared');
      assert.equal(env.getElem('filterDeveloper').value, 'all', 'Developer reset to "all"');
      assert.equal(env.getElem('filterStatus').value, 'all', 'Status reset to "all"');
      assert.equal(env.getElem('filterPrice').value, 'all', 'Price reset to "all"');
      assert.equal(env.getElem('filterSort').value, 'featured', 'Sort reset to "featured"');
      assert.equal(env.getElem('projectsCount').textContent, 'Showing 7 off-plan developments');
    });
  });

  describe('Card Rendering & XSS Escaping', () => {
    it('escapes special characters in project properties to prevent XSS injection', () => {
      const maliciousProject = {
        _id: 'xss-project',
        slug: 'xss-test',
        title: '<script>alert("xss-title")</script>',
        tagline: '<img src=x onerror=alert(1)>',
        developer: '<b>Hacked Developer</b>',
        location: '<a href="javascript:alert(1)">Saadiyat</a>',
        city: 'Dubai',
        startingPrice: 2000000,
        handoverDate: '<svg onload=alert(1)>',
        paymentPlan: '50/50',
        downPayment: '10%',
        status: 'New Launch',
        isFeatured: true,
        heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        propertyTypes: ['Villas']
      };

      context.window.renderProjects([maliciousProject]);

      const gridHtml = env.getElem('projectsArchiveGrid').innerHTML;
      assert.ok(!gridHtml.includes('<script>'), 'Unescaped <script> tag must NOT exist in DOM');
      assert.ok(!gridHtml.includes('<img src=x onerror'), 'Unescaped <img> event handler must NOT exist');
      assert.ok(!gridHtml.includes('<a href="javascript:'), 'Unescaped <a> javascript link must NOT exist');
      assert.ok(gridHtml.includes('&lt;script&gt;'), '<script> properly HTML-escaped to &lt;script&gt;');
      assert.ok(gridHtml.includes('&lt;img src=x onerror=alert(1)&gt;'), 'HTML tags escaped');
      assert.ok(gridHtml.includes('&lt;a href=&quot;javascript:alert(1)&quot;&gt;'), 'Anchor tag escaped');
    });
  });
});
