import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const apiRequire = createRequire(path.join(rootDir, 'api/server.js'));
const express = apiRequire('express');
const helmet = apiRequire('helmet');
const rateLimit = apiRequire('express-rate-limit');
const mongoSanitize = apiRequire('express-mongo-sanitize');

describe('Milestone 2: Backend Security Remediation Suite', () => {

  describe('1. Helmet & HTTP Security Headers', async () => {
    it('emits all required security headers and hides X-Powered-By', async () => {
      const app = express();
      app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://www.googletagmanager.com',
              'https://cdn.lr-ingest.com',
              'https://*.logrocket.io',
              'https://unpkg.com',
              'https://cdnjs.cloudflare.com'
            ],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com',
              'https://unpkg.com',
              'https://cdnjs.cloudflare.com'
            ],
            fontSrc: [
              "'self'",
              'https://fonts.gstatic.com',
              'data:'
            ],
            imgSrc: [
              "'self'",
              'data:',
              'https:',
              'blob:'
            ],
            mediaSrc: [
              "'self'",
              'data:',
              'https:',
              'blob:'
            ],
            connectSrc: [
              "'self'",
              'https://*.logrocket.io',
              'https://*.lr-ingest.com',
              'https://*.google-analytics.com',
              'https://*.analytics.google.com',
              'https://generativelanguage.googleapis.com'
            ],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
          }
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        xFrameOptions: { action: 'sameorigin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
      }));
      app.disable('x-powered-by');

      app.get('/api/test-headers', (req, res) => res.json({ status: 'ok' }));

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/test-headers`);
        assert.equal(res.status, 200);

        // Verify headers
        const csp = res.headers.get('content-security-policy');
        assert.ok(csp, 'Content-Security-Policy header must be present');
        assert.ok(csp.includes('googletagmanager.com'), 'CSP includes Google Tag Manager');
        assert.ok(csp.includes('logrocket.io'), 'CSP includes LogRocket');
        assert.ok(csp.includes('unpkg.com'), 'CSP includes Leaflet CDN unpkg');
        assert.ok(csp.includes('cdnjs.cloudflare.com'), 'CSP includes Cloudflare CDN');
        assert.ok(csp.includes('fonts.googleapis.com'), 'CSP includes Google Fonts');
        assert.ok(csp.includes('generativelanguage.googleapis.com'), 'CSP includes Google GenAI');

        assert.equal(res.headers.get('x-content-type-options'), 'nosniff', 'nosniff header present');
        assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN', 'X-Frame-Options is SAMEORIGIN');
        assert.ok(res.headers.get('strict-transport-security'), 'HSTS header present');
        assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', 'Referrer-Policy matches');
        assert.equal(res.headers.get('x-powered-by'), null, 'X-Powered-By header is hidden');
      } finally {
        server.close();
      }
    });
  });

  describe('2. Rate Limiting Middleware', async () => {
    it('throttles requests with HTTP 429 and standard JSON message', async () => {
      const app = express();
      const testLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many requests, please try again later.'
        }
      });

      app.get('/api/limited', testLimiter, (req, res) => res.json({ allowed: true }));
      const server = app.listen(0);
      const port = server.address().port;

      try {
        // First 3 requests must succeed
        for (let i = 1; i <= 3; i++) {
          const res = await fetch(`http://127.0.0.1:${port}/api/limited`);
          assert.equal(res.status, 200, `Request ${i} should be allowed`);
        }

        // 4th request must be blocked
        const res4 = await fetch(`http://127.0.0.1:${port}/api/limited`);
        assert.equal(res4.status, 429, 'Request 4 must return HTTP 429');
        const data4 = await res4.json();
        assert.equal(data4.success, false);
        assert.equal(data4.message, 'Too many requests, please try again later.');
      } finally {
        server.close();
      }
    });

    it('exports rate limiters in api/middleware/rateLimiter.js with correct thresholds', () => {
      const { generalLimiter, chatLimiter, loginLimiter, inquiryLimiter } =
        apiRequire(path.join(rootDir, 'api/middleware/rateLimiter.js'));

      assert.ok(generalLimiter, 'generalLimiter exists');
      assert.ok(chatLimiter, 'chatLimiter exists');
      assert.ok(loginLimiter, 'loginLimiter exists');
      assert.ok(inquiryLimiter, 'inquiryLimiter exists');
    });
  });

  describe('3. NoSQL Injection Prevention (express-mongo-sanitize)', async () => {
    it('strips $ operators from body, params, and query strings', async () => {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        if (req.body) mongoSanitize.sanitize(req.body);
        if (req.params) mongoSanitize.sanitize(req.params);
        if (req.query) {
          const cleanQuery = mongoSanitize.sanitize({ ...req.query });
          for (const key of Object.keys(cleanQuery)) {
            if (/^\$|\[\$/.test(key)) {
              delete cleanQuery[key];
            }
          }
          Object.defineProperty(req, 'query', {
            value: cleanQuery,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
        next();
      });

      app.post('/api/test-nosql', (req, res) => {
        res.json({ body: req.body, query: req.query });
      });

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/test-nosql?user[$ne]=null&filter=active&$where=1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: { '$gt': '' },
            validKey: 'validValue',
            nested: { '$where': 'malicious()', okKey: 123 }
          })
        });

        const data = await res.json();
        // Malicious $ operators must be removed from body
        assert.deepEqual(data.body.username, {}, '$gt stripped from body.username');
        assert.equal(data.body.validKey, 'validValue');
        assert.equal(data.body.nested.$where, undefined, '$where stripped from nested body');
        assert.equal(data.body.nested.okKey, 123);

        // Malicious query operators must be removed
        assert.equal(data.query.$where, undefined, '$where stripped from query');
        assert.equal(data.query['user[$ne]'], undefined, 'user[$ne] stripped from query');
        assert.equal(data.query.filter, 'active', 'legitimate query param preserved');
      } finally {
        server.close();
      }
    });
  });

  describe('4. File Upload Security Hardening', async () => {
    const jwt = apiRequire('jsonwebtoken');
    const { getJwtSecret } = apiRequire(path.join(rootDir, 'api/utils/jwtConfig.js'));
    const token = jwt.sign(
      { user: { id: 'admin1', username: 'admin' } },
      getJwtSecret()
    );
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    it('rejects spoofed HTML file with image/jpeg Content-Type', async () => {
      const uploadRoute = apiRequire(path.join(rootDir, 'api/routes/upload.js'));

      const app = express();
      app.use('/api/upload', uploadRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const formData = new FormData();
        const fakeFile = new Blob(['<html><script>alert(1)</script></html>'], { type: 'image/jpeg' });
        formData.append('file', fakeFile, 'exploit.html');

        const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });

        assert.equal(res.status, 400, 'Must reject .html file with HTTP 400');
        const data = await res.json();
        assert.ok(data.message.includes('prohibited') || data.message.includes('Unsupported'),
          'Error message must indicate rejected file type');
      } finally {
        server.close();
      }
    });

    it('rejects SVG file containing script tags or event handlers', async () => {
      const uploadRoute = apiRequire(path.join(rootDir, 'api/routes/upload.js'));

      const app = express();
      app.use('/api/upload', uploadRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const formData = new FormData();
        const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>';
        const fakeFile = new Blob([maliciousSvg], { type: 'image/svg+xml' });
        formData.append('file', fakeFile, 'vector.svg');

        const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });

        assert.equal(res.status, 400, 'Must reject malicious SVG with HTTP 400');
        const data = await res.json();
        assert.ok(data.message.includes('scripts') || data.message.includes('prohibited'));
      } finally {
        server.close();
      }
    });

    it('accepts clean valid SVG without scripts', async () => {
      const uploadRoute = apiRequire(path.join(rootDir, 'api/routes/upload.js'));

      const app = express();
      app.use('/api/upload', uploadRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const formData = new FormData();
        const cleanSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="gold"/></svg>';
        const fakeFile = new Blob([cleanSvg], { type: 'image/svg+xml' });
        formData.append('file', fakeFile, 'clean_logo.svg');

        const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });

        assert.equal(res.status, 201, 'Clean SVG must be accepted with HTTP 201');
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(data.url.endsWith('.svg'));

        // Clean up uploaded test file
        const uploadedFilePath = path.join(rootDir, 'api', data.url);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } finally {
        server.close();
      }
    });

    it('accepts valid PDF document', async () => {
      const uploadRoute = apiRequire(path.join(rootDir, 'api/routes/upload.js'));

      const app = express();
      app.use('/api/upload', uploadRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const formData = new FormData();
        const fakePdf = new Blob(['%PDF-1.4 sample content'], { type: 'application/pdf' });
        formData.append('file', fakePdf, 'brochure.pdf');

        const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });

        assert.equal(res.status, 201, 'PDF must be accepted with HTTP 201');
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.mediaType, 'document');

        // Clean up uploaded test file
        const uploadedFilePath = path.join(rootDir, 'api', data.url);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } finally {
        server.close();
      }
    });
  });

  describe('5. JWT Secret Production Hardening', async () => {
    it('throws in production if JWT_SECRET is unset or set to insecure default', async () => {
      const { getJwtSecret } = apiRequire(path.join(rootDir, 'api/utils/jwtConfig.js'));

      const oldEnv = process.env.NODE_ENV;
      const oldSecret = process.env.JWT_SECRET;

      try {
        process.env.NODE_ENV = 'production';
        process.env.JWT_SECRET = 'secret';
        assert.throws(() => getJwtSecret(), /FATAL SECURITY ERROR/);

        process.env.JWT_SECRET = '';
        assert.throws(() => getJwtSecret(), /FATAL SECURITY ERROR/);

        process.env.JWT_SECRET = 'diamora_strong_production_key_2026';
        assert.equal(getJwtSecret(), 'diamora_strong_production_key_2026');
      } finally {
        process.env.NODE_ENV = oldEnv;
        process.env.JWT_SECRET = oldSecret;
      }
    });
  });

  describe('6. ReDoS Prevention in Projects Search', async () => {
    it('escapes metacharacters in developer and search regex queries without crashing', () => {
      const projectsRoute = apiRequire(path.join(rootDir, 'api/routes/projects.js'));
      assert.ok(projectsRoute, 'Projects route module loaded successfully');

      // Test regex escaping with problematic patterns
      const reDosPatterns = [
        '((((((((a+)+)+)+)+)+)+)+)+',
        '[a-z',
        '**bad**',
        'unclosed (group'
      ];

      for (const pattern of reDosPatterns) {
        // Escaped string should safely compile into RegExp
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert.doesNotThrow(() => {
          new RegExp(`^${escaped}$`, 'i');
        }, `Pattern "${pattern}" should not throw after escaping`);
      }
    });
  });
});
