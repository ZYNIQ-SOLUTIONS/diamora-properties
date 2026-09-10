import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const projectsRoutePath = path.join(rootDir, 'api/routes/projects.js');

/**
 * Sample dataset modeling the 7 verified Diamora off-plan developments
 */
function createSampleProjects() {
  return [
    {
      _id: '507f1f77bcf86cd799439011',
      title: 'The Row Saadiyat',
      slug: 'the-row-saadiyat',
      developer: 'Aldar Properties',
      city: 'Abu Dhabi',
      location: 'Saadiyat Cultural District, Abu Dhabi',
      startingPrice: 3700000,
      status: 'New Launch',
      isFeatured: true,
      propertyTypes: ['Villas', 'Mansions'],
      description: 'Exclusive beachfront residences in Abu Dhabi cultural hub.',
      createdAt: new Date('2026-01-01T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439012',
      title: 'Sobha City Abu Dhabi',
      slug: 'sobha-city-abu-dhabi',
      developer: 'Sobha Realty',
      city: 'Abu Dhabi',
      location: 'Al Reem Island, Abu Dhabi',
      startingPrice: 1500000,
      status: 'New Launch',
      isFeatured: true,
      propertyTypes: ['Apartments', 'Villas'],
      description: 'Master-planned urban sanctuary by Sobha with lagoon views.',
      createdAt: new Date('2026-01-02T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439013',
      title: 'Tilal Binghatti Dubai',
      slug: 'tilal-binghatti-dubai',
      developer: 'Binghatti Developers',
      city: 'Dubai',
      location: 'Business Bay, Dubai',
      startingPrice: 1100000,
      status: 'New Launch',
      isFeatured: true,
      propertyTypes: ['Apartments', 'Penthouses'],
      description: 'Signature architectural towers with luxury private jacuzzis.',
      createdAt: new Date('2026-01-03T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439014',
      title: 'Manchester City Yas Residences',
      slug: 'manchester-city-yas-residences',
      developer: 'Aldar Properties',
      city: 'Abu Dhabi',
      location: 'Yas Island, Abu Dhabi',
      startingPrice: 1950000,
      status: 'New Launch',
      isFeatured: true,
      propertyTypes: ['Apartments', 'Townhouses'],
      description: 'Branded sports-luxury lifestyle residences on Yas Island.',
      createdAt: new Date('2026-01-04T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439015',
      title: 'The Wilds Dubai',
      slug: 'the-wilds-dubai',
      developer: 'Al Barari Group',
      city: 'Dubai',
      location: 'Al Barari, Dubai',
      startingPrice: 3800000,
      status: 'Under Construction',
      isFeatured: false,
      propertyTypes: ['Villas', 'Mansions'],
      description: 'Botanical haven of bespoke luxury estates surrounded by lush greenery.',
      createdAt: new Date('2026-01-05T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439016',
      title: 'Mercedes-Benz Places Dubai',
      slug: 'mercedes-benz-places-dubai',
      developer: 'Binghatti Developers',
      city: 'Dubai',
      location: 'Downtown Dubai, Dubai',
      startingPrice: 8800000,
      status: 'Under Construction',
      isFeatured: true,
      propertyTypes: ['Penthouses', 'Duplexes'],
      description: 'Automotive luxury tower facing the Burj Khalifa.',
      createdAt: new Date('2026-01-06T10:00:00Z')
    },
    {
      _id: '507f1f77bcf86cd799439017',
      title: 'Sila at Masdar City',
      slug: 'sila-masdar-city',
      developer: 'Reportage Properties',
      city: 'Abu Dhabi',
      location: 'Masdar City, Abu Dhabi',
      startingPrice: 890000,
      status: 'Under Construction',
      isFeatured: false,
      propertyTypes: ['Townhouses', 'Villas'],
      description: 'Eco-conscious sustainable townhouses in Masdar City.',
      createdAt: new Date('2026-01-07T10:00:00Z')
    }
  ];
}

/**
 * Filter predicate evaluating MongoDB query conditions in-memory
 */
function matchMongoQuery(doc, query) {
  for (const key of Object.keys(query)) {
    if (key === 'city') {
      if (doc.city !== query.city) return false;
    } else if (key === 'developer') {
      if (query.developer instanceof RegExp) {
        if (!query.developer.test(doc.developer)) return false;
      } else if (doc.developer !== query.developer) {
        return false;
      }
    } else if (key === 'status') {
      if (doc.status !== query.status) return false;
    } else if (key === 'isFeatured') {
      if (doc.isFeatured !== query.isFeatured) return false;
    } else if (key === 'propertyTypes') {
      if (query.propertyTypes?.$in) {
        const matches = query.propertyTypes.$in.some(t => doc.propertyTypes?.includes(t));
        if (!matches) return false;
      }
    } else if (key === 'startingPrice') {
      if (query.startingPrice.$gte !== undefined && doc.startingPrice < query.startingPrice.$gte) return false;
      if (query.startingPrice.$lte !== undefined && doc.startingPrice > query.startingPrice.$lte) return false;
    } else if (key === '$or') {
      const orMatched = query.$or.some(subQuery => {
        for (const f of Object.keys(subQuery)) {
          const val = String(doc[f] || '');
          const cond = subQuery[f];
          if (cond instanceof RegExp) {
            if (cond.test(val)) return true;
          } else if (cond && typeof cond === 'object' && cond.$regex) {
            const re = new RegExp(cond.$regex, cond.$options || '');
            if (re.test(val)) return true;
          } else if (val === String(cond)) {
            return true;
          }
        }
        return false;
      });
      if (!orMatched) return false;
    } else if (key === '_id') {
      if (query._id?.$ne && String(doc._id) === String(query._id.$ne)) return false;
      if (query._id?.$nin && query._id.$nin.some(id => String(id) === String(doc._id))) return false;
    }
  }
  return true;
}

/**
 * Sorts array of documents based on sort object
 */
function sortDocs(docs, sortOption) {
  const sort = sortOption || {};
  return [...docs].sort((a, b) => {
    if (sort.startingPrice !== undefined) {
      return sort.startingPrice === 1
        ? a.startingPrice - b.startingPrice
        : b.startingPrice - a.startingPrice;
    }
    if (sort.isFeatured !== undefined) {
      if (a.isFeatured !== b.isFeatured) {
        return b.isFeatured ? 1 : -1;
      }
    }
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

/**
 * Creates a mock Project model backed by an in-memory collection
 */
function createMockProjectModel(initialDocs = []) {
  let collection = [...initialDocs];
  let lastCapturedQuery = null;
  let lastCapturedSort = null;

  class MockQuery {
    constructor(matching) {
      this._matching = matching;
      this._sortOption = null;
      this._skipCount = 0;
      this._limitCount = null;
    }
    sort(s) {
      this._sortOption = s;
      lastCapturedSort = s;
      return this;
    }
    skip(n) {
      this._skipCount = n;
      return this;
    }
    limit(n) {
      this._limitCount = n;
      return this;
    }
    then(resolve, reject) {
      try {
        let result = sortDocs(this._matching, this._sortOption);
        if (this._skipCount) result = result.slice(this._skipCount);
        if (this._limitCount !== null) result = result.slice(0, this._limitCount);
        return Promise.resolve(result).then(resolve, reject);
      } catch (err) {
        return Promise.reject(err).catch(reject);
      }
    }
  }

  class MockProject {
    constructor(data) {
      this._id = data._id || '507f1f77bcf86cd799439999';
      Object.assign(this, data);
    }

    async save() {
      const idx = collection.findIndex(p => String(p._id) === String(this._id));
      if (idx >= 0) {
        collection[idx] = { ...this };
      } else {
        collection.push({ ...this });
      }
      return this;
    }

    static find(query = {}) {
      lastCapturedQuery = query;
      const matching = collection.filter(doc => matchMongoQuery(doc, query));
      return new MockQuery(matching);
    }

    static async countDocuments(query = {}) {
      return collection.filter(doc => matchMongoQuery(doc, query)).length;
    }

    static async findById(id) {
      const found = collection.find(p => String(p._id) === String(id));
      return found ? new MockProject(found) : null;
    }

    static async findOne(query = {}) {
      let found = null;
      if (query.slug) {
        found = collection.find(p => p.slug === query.slug.toLowerCase());
      } else {
        found = collection.find(doc => matchMongoQuery(doc, query));
      }
      return found ? new MockProject(found) : null;
    }

    static async findByIdAndDelete(id) {
      const idx = collection.findIndex(p => String(p._id) === String(id));
      if (idx >= 0) {
        return collection.splice(idx, 1)[0];
      }
      return null;
    }
  }

  return {
    MockProject,
    getCollection: () => collection,
    getLastQuery: () => lastCapturedQuery,
    getLastSort: () => lastCapturedSort
  };
}

/**
 * Loads api/routes/projects.js into a sandboxed environment
 */
function loadProjectsRoute(options = {}) {
  const routes = {
    get: new Map(),
    post: new Map(),
    put: new Map(),
    delete: new Map()
  };

  const mockRouter = {
    get: (p, ...h) => routes.get.set(p, h),
    post: (p, ...h) => routes.post.set(p, h),
    put: (p, ...h) => routes.put.set(p, h),
    delete: (p, ...h) => routes.delete.set(p, h)
  };

  const mockMongoose = {
    Types: {
      ObjectId: {
        isValid: (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)
      }
    }
  };

  const code = fs.readFileSync(projectsRoutePath, 'utf8');
  const moduleObj = { exports: {} };

  const customRequire = (id) => {
    if (id === 'express') return { Router: () => mockRouter };
    if (id === 'mongoose') return mockMongoose;
    if (id.endsWith('Project')) return options.mockProject;
    if (id.endsWith('auth')) {
      return (req, res, next) => {
        if (options.unauthenticated) {
          return res.status(401).json({ message: 'No token, authorization denied' });
        }
        req.user = { id: 'admin1', username: 'admin' };
        next();
      };
    }
    return require(id);
  };

  const fn = new Function('require', 'module', 'exports', 'console', code);
  fn(customRequire, moduleObj, moduleObj.exports, {
    ...console,
    error: () => {},
    warn: () => {},
    log: () => {}
  });

  return { routes };
}

function createMockResponse() {
  return {
    _status: 200,
    _data: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(data) {
      this._data = data;
      return this;
    }
  };
}

describe('Projects Backend REST API Baseline Suite', () => {
  it('verifies api/routes/projects.js exists and exports an Express router', () => {
    assert.ok(fs.existsSync(projectsRoutePath), 'api/routes/projects.js must exist');
    const content = fs.readFileSync(projectsRoutePath, 'utf8');
    assert.ok(content.includes('router.get'), 'projects.js registers GET routes');
    assert.ok(content.includes('router.post'), 'projects.js registers POST routes');
    assert.ok(content.includes('router.put'), 'projects.js registers PUT routes');
    assert.ok(content.includes('router.delete'), 'projects.js registers DELETE routes');
  });

  describe('GET /api/projects Query Parameter Parsing & Filtering', () => {
    it('filters projects by specific city and ignores "all" and "All UAE"', async () => {
      const sample = createSampleProjects();
      const { MockProject, getLastQuery } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // 1. Specific city: Dubai
      const resDubai = createMockResponse();
      await handler({ query: { city: 'Dubai' } }, resDubai);
      assert.equal(resDubai._status, 200);
      assert.equal(resDubai._data.success, true);
      assert.equal(resDubai._data.projects.length, 3);
      for (const p of resDubai._data.projects) {
        assert.equal(p.city, 'Dubai');
      }

      // 2. Specific city: Abu Dhabi
      const resAD = createMockResponse();
      await handler({ query: { city: 'Abu Dhabi' } }, resAD);
      assert.equal(resAD._status, 200);
      assert.equal(resAD._data.projects.length, 4);
      for (const p of resAD._data.projects) {
        assert.equal(p.city, 'Abu Dhabi');
      }

      // 3. Ignored city: "all"
      const resAll = createMockResponse();
      await handler({ query: { city: 'all' } }, resAll);
      assert.equal(resAll._data.total, 7);
      assert.equal(getLastQuery().city, undefined);

      // 4. Ignored city: "All UAE"
      const resAllUAE = createMockResponse();
      await handler({ query: { city: 'All UAE' } }, resAllUAE);
      assert.equal(resAllUAE._data.total, 7);
      assert.equal(getLastQuery().city, undefined);
    });

    it('filters projects by developer with case-insensitive regex', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // Filter Aldar Properties (2 projects)
      const resAldar = createMockResponse();
      await handler({ query: { developer: 'Aldar Properties' } }, resAldar);
      assert.equal(resAldar._data.total, 2);
      for (const p of resAldar._data.projects) {
        assert.equal(p.developer, 'Aldar Properties');
      }

      // Filter Sobha Realty (1 project)
      const resSobha = createMockResponse();
      await handler({ query: { developer: 'Sobha Realty' } }, resSobha);
      assert.equal(resSobha._data.total, 1);
      assert.equal(resSobha._data.projects[0].developer, 'Sobha Realty');

      // Filter Binghatti Developers (2 projects)
      const resBinghatti = createMockResponse();
      await handler({ query: { developer: 'Binghatti Developers' } }, resBinghatti);
      assert.equal(resBinghatti._data.total, 2);
    });

    it('filters projects by status and featured flags', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // Filter New Launch status (4 projects)
      const resNew = createMockResponse();
      await handler({ query: { status: 'New Launch' } }, resNew);
      assert.equal(resNew._data.total, 4);

      // Filter Under Construction status (3 projects)
      const resConst = createMockResponse();
      await handler({ query: { status: 'Under Construction' } }, resConst);
      assert.equal(resConst._data.total, 3);

      // Filter isFeatured: true (5 projects)
      const resFeatured = createMockResponse();
      await handler({ query: { featured: 'true' } }, resFeatured);
      assert.equal(resFeatured._data.total, 5);
      for (const p of resFeatured._data.projects) {
        assert.equal(p.isFeatured, true);
      }
    });

    it('filters projects by startingPrice bounds (minPrice and maxPrice)', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // minPrice = 1.5M, maxPrice = 3.0M -> Sobha City (1.5M), Manchester City Yas (1.95M)
      const resRange = createMockResponse();
      await handler({ query: { minPrice: '1500000', maxPrice: '3000000' } }, resRange);
      assert.equal(resRange._data.total, 2);
      for (const p of resRange._data.projects) {
        assert.ok(p.startingPrice >= 1500000 && p.startingPrice <= 3000000);
      }

      // maxPrice only: under 1.5M -> Tilal Binghatti (1.1M), Sila Masdar (890K)
      const resUnder15 = createMockResponse();
      await handler({ query: { maxPrice: '1499999' } }, resUnder15);
      assert.equal(resUnder15._data.total, 2);

      // minPrice only: above 3.0M -> The Row (3.7M), The Wilds (3.8M), Mercedes-Benz (8.8M)
      const resAbove30 = createMockResponse();
      await handler({ query: { minPrice: '3000000' } }, resAbove30);
      assert.equal(resAbove30._data.total, 3);
    });

    it('filters projects by propertyType ($in condition)', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      const resPenthouses = createMockResponse();
      await handler({ query: { propertyType: 'Penthouses' } }, resPenthouses);
      assert.equal(resPenthouses._data.total, 2);
      for (const p of resPenthouses._data.projects) {
        assert.ok(p.propertyTypes.includes('Penthouses'));
      }
    });

    it('performs full-text regex search on title, developer, location, description', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // Match by title
      const resTitle = createMockResponse();
      await handler({ query: { search: 'Saadiyat' } }, resTitle);
      assert.equal(resTitle._data.total, 1);
      assert.equal(resTitle._data.projects[0].slug, 'the-row-saadiyat');

      // Match by location
      const resLoc = createMockResponse();
      await handler({ query: { search: 'Yas Island' } }, resLoc);
      assert.equal(resLoc._data.total, 1);
      assert.equal(resLoc._data.projects[0].slug, 'manchester-city-yas-residences');

      // Match by developer
      const resDev = createMockResponse();
      await handler({ query: { search: 'Binghatti' } }, resDev);
      assert.equal(resDev._data.total, 2);

      // Non-matching term
      const resEmpty = createMockResponse();
      await handler({ query: { search: 'NonExistentSkyScraper12345' } }, resEmpty);
      assert.equal(resEmpty._data.total, 0);
      assert.equal(resEmpty._data.projects.length, 0);
    });
  });

  describe('Sorting & Pagination Contracts', () => {
    it('applies price_asc, price_desc, and featured sort options', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // 1. price_asc: ascending price
      const resAsc = createMockResponse();
      await handler({ query: { sort: 'price_asc' } }, resAsc);
      const ascPrices = resAsc._data.projects.map(p => p.startingPrice);
      assert.equal(ascPrices[0], 890000);
      assert.equal(ascPrices[ascPrices.length - 1], 8800000);

      // 2. price_desc: descending price
      const resDesc = createMockResponse();
      await handler({ query: { sort: 'price_desc' } }, resDesc);
      const descPrices = resDesc._data.projects.map(p => p.startingPrice);
      assert.equal(descPrices[0], 8800000);
      assert.equal(descPrices[descPrices.length - 1], 890000);

      // 3. featured: featured projects first
      const resFeat = createMockResponse();
      await handler({ query: { sort: 'featured' } }, resFeat);
      const featProjects = resFeat._data.projects;
      const firstNonFeatIndex = featProjects.findIndex(p => !p.isFeatured);
      assert.ok(firstNonFeatIndex > 0, 'Featured projects precede non-featured');
      for (let i = 0; i < firstNonFeatIndex; i++) {
        assert.equal(featProjects[i].isFeatured, true);
      }
    });

    it('handles pagination parameters returning correct page, total, totalPages, and slice', async () => {
      const sample = createSampleProjects(); // 7 items
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/')[0];

      // Page 1 with limit 2
      const resPage1 = createMockResponse();
      await handler({ query: { page: '1', limit: '2' } }, resPage1);
      assert.equal(resPage1._data.page, 1);
      assert.equal(resPage1._data.total, 7);
      assert.equal(resPage1._data.totalPages, 4);
      assert.equal(resPage1._data.projects.length, 2);

      // Page 2 with limit 2
      const resPage2 = createMockResponse();
      await handler({ query: { page: '2', limit: '2' } }, resPage2);
      assert.equal(resPage2._data.page, 2);
      assert.equal(resPage2._data.projects.length, 2);

      // Ensure page 1 and page 2 projects are disjoint
      const idsPage1 = new Set(resPage1._data.projects.map(p => p._id));
      for (const p of resPage2._data.projects) {
        assert.ok(!idsPage1.has(p._id), 'Paginated pages do not overlap');
      }

      // Last page (page 4 with limit 2) has 1 item
      const resPage4 = createMockResponse();
      await handler({ query: { page: '4', limit: '2' } }, resPage4);
      assert.equal(resPage4._data.projects.length, 1);
    });
  });

  describe('GET /api/projects/featured', () => {
    it('returns featured developments with fallback fill to ensure minimum count', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/featured')[0];

      const res = createMockResponse();
      await handler({}, res);

      assert.equal(res._status, 200);
      assert.equal(res._data.success, true);
      assert.ok(Array.isArray(res._data.projects));
      assert.ok(res._data.projects.length >= 3, 'Featured endpoint returns at least 3 developments');
    });
  });

  describe('GET /api/projects/:idOrSlug Single Project Lookup', () => {
    it('retrieves project by lowercase slug with 3 related projects', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/:idOrSlug')[0];

      const res = createMockResponse();
      await handler({ params: { idOrSlug: 'the-row-saadiyat' } }, res);

      assert.equal(res._status, 200);
      assert.equal(res._data.success, true);
      assert.equal(res._data.project.slug, 'the-row-saadiyat');
      assert.equal(res._data.project.title, 'The Row Saadiyat');
      assert.ok(Array.isArray(res._data.related), 'Returns related developments array');
      assert.ok(res._data.related.length <= 3);

      // Related projects should share city ('Abu Dhabi') or developer ('Aldar Properties')
      for (const rel of res._data.related) {
        assert.notEqual(String(rel._id), '507f1f77bcf86cd799439011');
        assert.ok(rel.city === 'Abu Dhabi' || rel.developer === 'Aldar Properties');
      }
    });

    it('retrieves project by MongoDB ObjectId', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/:idOrSlug')[0];

      const res = createMockResponse();
      await handler({ params: { idOrSlug: '507f1f77bcf86cd799439016' } }, res);

      assert.equal(res._status, 200);
      assert.equal(res._data.project.title, 'Mercedes-Benz Places Dubai');
    });

    it('returns HTTP 404 when project slug or ID is not found', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.get.get('/:idOrSlug')[0];

      const res = createMockResponse();
      await handler({ params: { idOrSlug: 'non-existent-development-slug' } }, res);

      assert.equal(res._status, 404);
      assert.equal(res._data.message, 'Project not found');
    });
  });

  describe('Admin CRUD Operations & Authentication', () => {
    it('rejects POST /api/projects without authentication (HTTP 401)', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject, unauthenticated: true });
      const authMiddleware = routes.post.get('/')[0];

      const res = createMockResponse();
      await authMiddleware({}, res, () => {});

      assert.equal(res._status, 401);
      assert.equal(res._data.message, 'No token, authorization denied');
    });

    it('creates project with sanitized numerical startingPrice and propertyTypes array', async () => {
      const sample = createSampleProjects();
      const { MockProject, getCollection } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.post.get('/')[1];

      const newProjectData = {
        title: 'Palm Crescent Mansions',
        developer: 'Nakheel',
        city: 'Dubai',
        location: 'Palm Jumeirah, Dubai',
        startingPrice: '12500000', // String should be converted to number
        propertyTypes: 'Mansions, Waterfront Villas, Penthouses', // Comma string should be split
        handoverDate: 'Q4 2028',
        paymentPlan: '60/40',
        heroImage: 'https://images.unsplash.com/photo-1512917774080',
        description: 'Ultra-exclusive private island estates on Palm Jumeirah.'
      };

      const res = createMockResponse();
      await handler({ body: newProjectData }, res);

      assert.equal(res._status, 201);
      assert.equal(res._data.success, true);
      assert.equal(res._data.project.title, 'Palm Crescent Mansions');
      assert.equal(typeof res._data.project.startingPrice, 'number');
      assert.equal(res._data.project.startingPrice, 12500000);
      assert.deepEqual(res._data.project.propertyTypes, ['Mansions', 'Waterfront Villas', 'Penthouses']);

      assert.equal(getCollection().length, 8, 'Collection incremented to 8 projects');
    });

    it('updates existing project fields via PUT /api/projects/:idOrSlug', async () => {
      const sample = createSampleProjects();
      const { MockProject, getCollection } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.put.get('/:idOrSlug')[1];

      const res = createMockResponse();
      await handler({
        params: { idOrSlug: 'the-row-saadiyat' },
        body: {
          startingPrice: '4200000',
          status: 'Under Construction'
        }
      }, res);

      assert.equal(res._status, 200);
      assert.equal(res._data.success, true);
      assert.equal(res._data.project.startingPrice, 4200000);
      assert.equal(res._data.project.status, 'Under Construction');

      const updated = getCollection().find(p => p.slug === 'the-row-saadiyat');
      assert.equal(updated.startingPrice, 4200000);
      assert.equal(updated.status, 'Under Construction');
    });

    it('deletes project via DELETE /api/projects/:idOrSlug', async () => {
      const sample = createSampleProjects();
      const { MockProject, getCollection } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });
      const handler = routes.delete.get('/:idOrSlug')[1];

      const res = createMockResponse();
      await handler({ params: { idOrSlug: 'sila-masdar-city' } }, res);

      assert.equal(res._status, 200);
      assert.equal(res._data.success, true);
      assert.equal(res._data.message, 'Project deleted successfully');

      assert.equal(getCollection().length, 6, 'Collection reduced to 6 projects');
      assert.equal(getCollection().find(p => p.slug === 'sila-masdar-city'), undefined);
    });

    it('returns HTTP 404 on PUT or DELETE for non-existent project', async () => {
      const sample = createSampleProjects();
      const { MockProject } = createMockProjectModel(sample);
      const { routes } = loadProjectsRoute({ mockProject: MockProject });

      // PUT 404
      const putHandler = routes.put.get('/:idOrSlug')[1];
      const resPut = createMockResponse();
      await putHandler({ params: { idOrSlug: 'non-existent-xyz' }, body: {} }, resPut);
      assert.equal(resPut._status, 404);

      // DELETE 404
      const delHandler = routes.delete.get('/:idOrSlug')[1];
      const resDel = createMockResponse();
      await delHandler({ params: { idOrSlug: 'non-existent-xyz' } }, resDel);
      assert.equal(resDel._status, 404);
    });
  });

  describe('Server Error Resilience (HTTP 500)', () => {
    it('handles unexpected database query failure gracefully with HTTP 500', async () => {
      const BrokenModel = {
        find: () => {
          throw new Error('MongoDB Connection Pool Dropped');
        },
        countDocuments: () => {
          throw new Error('MongoDB Connection Pool Dropped');
        }
      };

      const { routes } = loadProjectsRoute({ mockProject: BrokenModel });
      const handler = routes.get.get('/')[0];

      const res = createMockResponse();
      await handler({ query: {} }, res);

      assert.equal(res._status, 500);
      assert.equal(res._data.message, 'Server Error fetching projects');
    });
  });
});
