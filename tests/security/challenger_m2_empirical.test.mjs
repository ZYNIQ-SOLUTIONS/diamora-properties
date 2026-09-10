import { test, describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const apiRequire = createRequire(path.join(rootDir, 'api/server.js'));
const express = apiRequire('express');
const jwt = apiRequire('jsonwebtoken');
const mongoSanitize = apiRequire('express-mongo-sanitize');

const {
  chatLimiter,
  loginLimiter,
  inquiryLimiter
} = apiRequire(path.join(rootDir, 'api/middleware/rateLimiter.js'));
const { getJwtSecret } = apiRequire(path.join(rootDir, 'api/utils/jwtConfig.js'));

const authRoute = apiRequire(path.join(rootDir, 'api/routes/auth.js'));
const inquiriesRoute = apiRequire(path.join(rootDir, 'api/routes/inquiries.js'));
const chatRoute = apiRequire(path.join(rootDir, 'api/routes/chat.js'));
const uploadRoute = apiRequire(path.join(rootDir, 'api/routes/upload.js'));

describe('Milestone 2 Empirical Challenger Test Suite', () => {

  describe('Challenge 1: Rate Limiting Burst Traffic Simulation', () => {

    async function resetLimiterKeys(limiter) {
      if (limiter && typeof limiter.resetKey === 'function') {
        await limiter.resetKey('127.0.0.1');
        await limiter.resetKey('::1');
        await limiter.resetKey('::ffff:127.0.0.1');
      }
    }

    it('simulates burst traffic against /api/auth/login (limit 10) and verifies HTTP 429 at request 11', async () => {
      await resetLimiterKeys(loginLimiter);

      const app = express();
      app.use(express.json());
      app.use('/api/auth/login', loginLimiter);
      app.use('/api/auth', authRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const statuses = [];
        let rateLimitPayload = null;

        for (let i = 1; i <= 12; i++) {
          const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          statuses.push(res.status);
          if (res.status === 429 && !rateLimitPayload) {
            rateLimitPayload = await res.json();
          }
        }

        // Requests 1-10 must pass limiter to route handler (HTTP 400 for empty body)
        for (let i = 0; i < 10; i++) {
          assert.equal(statuses[i], 400, `Request ${i + 1} should reach route handler (400)`);
        }

        // Requests 11 and 12 must be blocked with HTTP 429
        assert.equal(statuses[10], 429, 'Request 11 must return HTTP 429');
        assert.equal(statuses[11], 429, 'Request 12 must return HTTP 429');

        assert.deepEqual(rateLimitPayload, {
          success: false,
          message: 'Too many requests, please try again later.'
        }, '429 payload must match standard format');
      } finally {
        await resetLimiterKeys(loginLimiter);
        server.close();
      }
    });

    it('simulates burst traffic against /api/inquiries (limit 15) and verifies HTTP 429 at request 16', async () => {
      await resetLimiterKeys(inquiryLimiter);

      const app = express();
      app.use(express.json());
      app.use('/api/inquiries', inquiryLimiter);
      app.use('/api/inquiries', inquiriesRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const statuses = [];
        let rateLimitPayload = null;

        for (let i = 1; i <= 17; i++) {
          const res = await fetch(`http://127.0.0.1:${port}/api/inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          statuses.push(res.status);
          if (res.status === 429 && !rateLimitPayload) {
            rateLimitPayload = await res.json();
          }
        }

        // Requests 1-15 must pass limiter to route handler (HTTP 400 for missing email)
        for (let i = 0; i < 15; i++) {
          assert.equal(statuses[i], 400, `Request ${i + 1} should reach route handler (400)`);
        }

        // Requests 16 and 17 must be blocked with HTTP 429
        assert.equal(statuses[15], 429, 'Request 16 must return HTTP 429');
        assert.equal(statuses[16], 429, 'Request 17 must return HTTP 429');

        assert.deepEqual(rateLimitPayload, {
          success: false,
          message: 'Too many requests, please try again later.'
        });
      } finally {
        await resetLimiterKeys(inquiryLimiter);
        server.close();
      }
    });

    it('simulates burst traffic against /api/chat (limit 30) and verifies HTTP 429 at request 31', async () => {
      await resetLimiterKeys(chatLimiter);

      const app = express();
      app.use(express.json());
      app.use('/api/chat', chatLimiter);
      app.use('/api/chat', chatRoute);

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const statuses = [];
        let rateLimitPayload = null;

        for (let i = 1; i <= 32; i++) {
          const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          statuses.push(res.status);
          if (res.status === 429 && !rateLimitPayload) {
            rateLimitPayload = await res.json();
          }
        }

        // Requests 1-30 must pass limiter to route handler
        for (let i = 0; i < 30; i++) {
          assert.ok(statuses[i] === 400 || statuses[i] === 503, `Request ${i + 1} should pass rate limiter`);
        }

        // Requests 31 and 32 must be blocked with HTTP 429
        assert.equal(statuses[30], 429, 'Request 31 must return HTTP 429');
        assert.equal(statuses[31], 429, 'Request 32 must return HTTP 429');

        assert.deepEqual(rateLimitPayload, {
          success: false,
          message: 'Too many requests, please try again later.'
        });
      } finally {
        await resetLimiterKeys(chatLimiter);
        server.close();
      }
    });
  });

  describe('Challenge 2: Upload Security & Spoofing Defense', () => {
    const token = jwt.sign(
      { user: { id: 'admin_challenger', username: 'admin' } },
      getJwtSecret()
    );
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    let app;
    let server;
    let port;

    beforeEach(() => {
      app = express();
      app.use('/api/upload', uploadRoute);
      server = app.listen(0);
      port = server.address().port;
    });

    afterEach(() => {
      if (server) server.close();
    });

    async function sendUpload(filename, content, mimeType) {
      const formData = new FormData();
      const blob = new Blob([content], { type: mimeType });
      formData.append('file', blob, filename);

      const res = await fetch(`http://127.0.0.1:${port}/api/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      });

      const body = await res.json().catch(() => ({}));
      if (body.url) {
        const fullPath = path.join(rootDir, 'api', body.url);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return { status: res.status, body };
    }

    it('rejects spoofed HTML files with image MIME headers (.html with image/jpeg, image/png)', async () => {
      const res1 = await sendUpload('spoofed.html', '<html><script>alert(1)</script></html>', 'image/jpeg');
      assert.equal(res1.status, 400, 'Must reject .html with image/jpeg');
      assert.match(res1.body.message, /prohibited|unsupported/i);

      const res2 = await sendUpload('exploit.HTML', '<h1>malicious</h1>', 'image/png');
      assert.equal(res2.status, 400, 'Must reject uppercase .HTML with image/png');

      const res3 = await sendUpload('index.htm', '<html>body</html>', 'image/svg+xml');
      assert.equal(res3.status, 400, 'Must reject .htm extension');
    });

    it('rejects prohibited script extensions (.js, .php, .xhtml)', async () => {
      const res1 = await sendUpload('payload.js', 'console.log("hacked")', 'image/png');
      assert.equal(res1.status, 400);

      const res2 = await sendUpload('backdoor.php', '<?php system($_GET["cmd"]); ?>', 'image/jpeg');
      assert.equal(res2.status, 400);

      const res3 = await sendUpload('page.xhtml', '<xhtml>test</xhtml>', 'image/webp');
      assert.equal(res3.status, 400);
    });

    it('rejects spoofed image extensions with text/html MIME header', async () => {
      const res1 = await sendUpload('exploit.png', '<html><script>alert(1)</script></html>', 'text/html');
      assert.equal(res1.status, 400, 'Must reject png with text/html MIME');

      const res2 = await sendUpload('exploit.jpg', '<html><script>alert(1)</script></html>', 'text/html');
      assert.equal(res2.status, 400, 'Must reject jpg with text/html MIME');
    });

    it('rejects malicious SVGs containing <script> tags with variations in casing and whitespace', async () => {
      const payloads = [
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><sCrIpT>alert(document.cookie)</ScRiPt></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><script\nsrc="//evil.com/xss.js"></script></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><script >alert(1)</script></svg>'
      ];

      for (const payload of payloads) {
        const res = await sendUpload('vector.svg', payload, 'image/svg+xml');
        assert.equal(res.status, 400, `Payload must be rejected: ${payload}`);
        assert.match(res.body.message, /scripts|active content|prohibited/i);
      }
    });

    it('rejects malicious SVGs containing event handlers (onload, onerror, onmouseover)', async () => {
      const payloads = [
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle r="10"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><image href="bad" onerror="alert(1)"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" onmouseover = "alert(1)"/></svg>'
      ];

      for (const payload of payloads) {
        const res = await sendUpload('event.svg', payload, 'image/svg+xml');
        assert.equal(res.status, 400, `Event handler must be rejected: ${payload}`);
        assert.match(res.body.message, /scripts|active content|prohibited/i);
      }
    });

    it('rejects malicious SVGs with javascript: links, foreignObject, and animate tags', async () => {
      const payloads = [
        '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>Link</text></a></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100" height="100"><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><animate attributeName="href" values="javascript:alert(1)"/></svg>'
      ];

      for (const payload of payloads) {
        const res = await sendUpload('advanced_xss.svg', payload, 'image/svg+xml');
        assert.equal(res.status, 400, `Advanced XSS must be rejected: ${payload}`);
      }
    });

    it('rejects multiple file batch and unlinks all files if any file is malicious', async () => {
      const formData = new FormData();
      formData.append('files', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'], { type: 'image/svg+xml' }), 'clean_1.svg');
      formData.append('files', new Blob(['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'], { type: 'image/svg+xml' }), 'malicious_2.svg');

      const res = await fetch(`http://127.0.0.1:${port}/api/upload/multiple`, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      });

      assert.equal(res.status, 400, 'Batch upload must fail with HTTP 400');
      const body = await res.json();
      assert.match(body.message, /scripts|active content|rejected/i);

      // Verify no leftover files remained in upload dir
      const uploadDir = path.join(rootDir, 'api/uploads');
      const leftovers = fs.readdirSync(uploadDir).filter(f => f.includes('clean_1') || f.includes('malicious_2'));
      assert.equal(leftovers.length, 0, 'No leftover files from rejected batch should remain on disk');
    });

    it('accepts valid benign SVG and PDF files', async () => {
      const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="gold"/></svg>';
      const resSvg = await sendUpload('logo.svg', validSvg, 'image/svg+xml');
      assert.equal(resSvg.status, 201, 'Valid SVG must return HTTP 201');
      assert.equal(resSvg.body.success, true);

      const validPdf = '%PDF-1.4 brochure test content';
      const resPdf = await sendUpload('brochure.pdf', validPdf, 'application/pdf');
      assert.equal(resPdf.status, 201, 'Valid PDF must return HTTP 201');
      assert.equal(resPdf.body.success, true);
    });
  });

  describe('Challenge 3: NoSQL Injection Operator Stripping', () => {

    it('strips MongoDB operator keys ($gt, $where, $ne, $regex) from body and query', async () => {
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

      app.post('/api/challenge-nosql', (req, res) => {
        res.json({ body: req.body, query: req.query });
      });

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const attackPayload = {
          username: { '$gt': '' },
          password: { '$ne': null },
          '$where': 'sleep(5000)',
          nested: {
            deepKey: { '$regex': '.*' },
            array: [
              { '$gt': 100 },
              { validNumber: 42 }
            ]
          },
          validString: 'Diamora Luxury Properties'
        };

        const res = await fetch(`http://127.0.0.1:${port}/api/challenge-nosql?username[$gt]=admin&$where=sleep(5000)&filter=active`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attackPayload)
        });

        assert.equal(res.status, 200);
        const data = await res.json();

        // Verify body sanitization
        assert.deepEqual(data.body.username, {}, '$gt stripped from body.username');
        assert.deepEqual(data.body.password, {}, '$ne stripped from body.password');
        assert.equal(data.body.$where, undefined, '$where stripped from body root');
        assert.deepEqual(data.body.nested.deepKey, {}, '$regex stripped from nested body');
        assert.deepEqual(data.body.nested.array[0], {}, '$gt stripped from array element');
        assert.equal(data.body.nested.array[1].validNumber, 42, 'validNumber preserved in array');
        assert.equal(data.body.validString, 'Diamora Luxury Properties', 'validString preserved in body root');

        // Verify query sanitization
        assert.equal(data.query.$where, undefined, '$where stripped from query');
        assert.equal(data.query['username[$gt]'], undefined, 'username[$gt] stripped from query');
        assert.equal(data.query.filter, 'active', 'filter preserved in query');
      } finally {
        server.close();
      }
    });
  });
});
