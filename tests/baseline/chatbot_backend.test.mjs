import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const chatRoutePath = path.join(rootDir, 'api/routes/chat.js');

/**
 * Loads the actual api/routes/chat.js module with controlled mock dependencies.
 */
function loadChatRoute(options = {}) {
  const routes = { get: new Map(), post: new Map(), put: new Map() };
  const mockRouter = {
    get: (p, ...h) => routes.get.set(p, h),
    post: (p, ...h) => routes.post.set(p, h),
    put: (p, ...h) => routes.put.set(p, h)
  };

  const code = fs.readFileSync(chatRoutePath, 'utf8');
  const moduleObj = { exports: {} };

  const customRequire = (id) => {
    if (id === 'express') return { Router: () => mockRouter };
    if (id === '@google/genai') return { GoogleGenAI: options.MockGoogleGenAI || class {} };
    if (id.endsWith('Property')) return options.mockProperty || { find: async () => [] };
    if (id.endsWith('Inquiry')) return options.MockInquiry || class { async save() { return this; } };
    if (id.endsWith('ChatSetting')) {
      return options.mockChatSetting || {
        findOne: () => ({
          lean: () => null,
          then: (cb) => Promise.resolve(null).then(cb)
        }),
        findOneAndUpdate: async (filter, update) => update
      };
    }
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

  const proc = { env: { ...options.env } };
  const fn = new Function('require', 'module', 'exports', 'process', 'console', code);
  fn(customRequire, moduleObj, moduleObj.exports, proc, {
    ...console,
    error: () => {},
    warn: () => {},
    log: () => {}
  });

  return { routes, code };
}

function createMockResponse() {
  const res = {
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
  return res;
}

describe('Chatbot Backend API Baseline Suite', () => {
  it('verifies api/routes/chat.js exists with genuine route implementation', () => {
    assert.ok(fs.existsSync(chatRoutePath), 'api/routes/chat.js must exist');
    const content = fs.readFileSync(chatRoutePath, 'utf8');
    assert.ok(content.includes('router.post'), 'chat.js registers POST route');
    assert.ok(content.includes('submitLead'), 'chat.js defines submitLead tool');
    assert.ok(content.includes('DEFAULT_SYSTEM_PROMPT'), 'chat.js defines default system prompt');
  });

  describe('POST /api/chat Payload & API Key Validation', () => {
    it('returns HTTP 503 when GEMINI_API_KEY environment variable is missing', async () => {
      const { routes } = loadChatRoute({ env: {} });
      const handler = routes.post.get('/')[0];
      const res = createMockResponse();

      await handler({ body: { messages: [{ role: 'user', parts: [{ text: 'Hello' }] }] } }, res);

      assert.equal(res._status, 503, 'Must return HTTP 503');
      assert.equal(res._data?.error, 'AI service is currently unavailable (Missing API Key).');
    });

    it('returns HTTP 400 when messages array is missing or empty', async () => {
      const { routes } = loadChatRoute({ env: { GEMINI_API_KEY: 'mock-key-123' } });
      const handler = routes.post.get('/')[0];

      // Missing messages field
      const res1 = createMockResponse();
      await handler({ body: {} }, res1);
      assert.equal(res1._status, 400, 'Must return HTTP 400 for empty body');
      assert.equal(res1._data?.error, 'Invalid request format. "messages" array is required.');

      // Empty messages array
      const res2 = createMockResponse();
      await handler({ body: { messages: [] } }, res2);
      assert.equal(res2._status, 400, 'Must return HTTP 400 for empty array');
      assert.equal(res2._data?.error, 'Invalid request format. "messages" array is required.');

      // Non-array messages
      const res3 = createMockResponse();
      await handler({ body: { messages: 'not-an-array' } }, res3);
      assert.equal(res3._status, 400, 'Must return HTTP 400 for non-array messages');
    });
  });

  describe('Prompt Interpolation & Browsing Context', () => {
    it('verifies formatSystemPrompt and buildPageContextText logic', () => {
      const { code } = loadChatRoute({ env: { GEMINI_API_KEY: 'mock-key' } });

      // Extract formatSystemPrompt
      const matchFmt = code.match(/function formatSystemPrompt\([\s\S]*?\n\}/);
      assert.ok(matchFmt, 'formatSystemPrompt function found');
      const formatSystemPrompt = new Function('template', 'propertiesText', 'pageContextText', `
        ${matchFmt[0]}
        return formatSystemPrompt(template, propertiesText, pageContextText);
      `);

      // Extract buildPageContextText
      const matchCtx = code.match(/function buildPageContextText\([\s\S]*?\n\}/);
      assert.ok(matchCtx, 'buildPageContextText function found');
      const buildPageContextText = new Function('context', `
        ${matchCtx[0]}
        return buildPageContextText(context);
      `);

      // 1. buildPageContextText with empty context
      const defaultCtx = buildPageContextText(null);
      assert.ok(defaultCtx.includes('The client is browsing the Diamora Properties digital platform.'));

      // 2. buildPageContextText with detailed context
      const fullCtx = buildPageContextText({
        pageTitle: 'Ultra-Luxury Villas | Diamora',
        pagePath: '/properties.html?type=Villa',
        pageUrl: 'https://diamora.properties/properties.html?type=Villa'
      });
      assert.ok(fullCtx.includes('- Page Title: "Ultra-Luxury Villas | Diamora"'));
      assert.ok(fullCtx.includes('- Current URL Path: /properties.html?type=Villa'));
      assert.ok(fullCtx.includes('- Full URL: https://diamora.properties/properties.html?type=Villa'));

      // 3. formatSystemPrompt replacing placeholders
      const template = 'Advisory: {properties} and context: {pageContext}';
      const prompt = formatSystemPrompt(template, '- Sobha City 1.5M', fullCtx);
      assert.ok(prompt.includes('- Sobha City 1.5M'));
      assert.ok(prompt.includes('Ultra-Luxury Villas'));
      assert.ok(!prompt.includes('{properties}'));
      assert.ok(!prompt.includes('{pageContext}'));

      // 4. formatSystemPrompt appending when placeholders missing
      const noPlaceholders = 'Fixed system prompt instructions.';
      const appended = formatSystemPrompt(noPlaceholders, '- Aldar Yas 1.95M', 'Viewing Yas Island');
      assert.ok(appended.includes('Available Properties Portfolio:\n- Aldar Yas 1.95M'));
      assert.ok(appended.includes('Viewing Yas Island'));
    });
  });

  describe('Tool Declaration & Lead Generation (submitLead)', () => {
    it('defines submitLead tool schema matching required VIP lead parameters', async () => {
      let capturedConfig = null;
      class MockGenAI {
        get chats() {
          return {
            create: (opts) => {
              capturedConfig = opts.config;
              return {
                sendMessage: async () => ({
                  text: 'Here are prime villas matching your criteria.',
                  functionCalls: []
                })
              };
            }
          };
        }
      }

      const { routes } = loadChatRoute({
        env: { GEMINI_API_KEY: 'mock-key' },
        MockGoogleGenAI: MockGenAI
      });

      const handler = routes.post.get('/')[0];
      const res = createMockResponse();

      await handler({
        body: {
          messages: [{ role: 'user', parts: [{ text: 'Show me Palm villas' }] }]
        }
      }, res);

      assert.ok(capturedConfig, 'Model config passed to Google GenAI');
      const tool = capturedConfig.tools[0].functionDeclarations[0];
      assert.equal(tool.name, 'submitLead', 'Tool name is submitLead');
      assert.equal(tool.parameters.type, 'object');
      assert.deepEqual(tool.parameters.required, ['email'], 'Email is required parameter');
      assert.ok(tool.parameters.properties.name, 'name property declared');
      assert.ok(tool.parameters.properties.email, 'email property declared');
      assert.ok(tool.parameters.properties.phone, 'phone property declared');
      assert.ok(tool.parameters.properties.notes, 'notes property declared');
    });

    it('executes submitLead tool, persists Inquiry to DB, and returns model response', async () => {
      const savedInquiries = [];
      class MockInquiry {
        constructor(data) {
          Object.assign(this, data);
        }
        async save() {
          savedInquiries.push(this);
          return this;
        }
      }

      let functionResponsePayload = null;
      class ToolCallingGenAI {
        get chats() {
          return {
            create: () => {
              let turns = 0;
              return {
                sendMessage: async (arg) => {
                  turns++;
                  if (turns === 1) {
                    // Simulate model calling submitLead
                    return {
                      functionCalls: [{
                        name: 'submitLead',
                        args: {
                          name: 'Rashid Al Nuaimi',
                          email: 'rashid@investments.ae',
                          phone: '+971 50 888 9999',
                          notes: 'Looking for AED 15M+ Waterfront Penthouse'
                        }
                      }]
                    };
                  } else {
                    // Capture functionResponse passed back to model
                    functionResponsePayload = arg;
                    return {
                      text: 'Thank you Rashid. Your private advisory consultation has been confirmed with our senior client office.'
                    };
                  }
                }
              };
            }
          };
        }
      }

      const { routes } = loadChatRoute({
        env: { GEMINI_API_KEY: 'mock-key' },
        MockGoogleGenAI: ToolCallingGenAI,
        MockInquiry
      });

      const handler = routes.post.get('/')[0];
      const res = createMockResponse();

      await handler({
        body: {
          messages: [{ role: 'user', parts: [{ text: 'My email is rashid@investments.ae and phone is +971 50 888 9999' }] }],
          context: { pageTitle: 'Palm Jumeirah Residences' }
        }
      }, res);

      // Verify Inquiry model was instantiated and saved
      assert.equal(savedInquiries.length, 1, 'Exactly one Inquiry saved');
      const lead = savedInquiries[0];
      assert.equal(lead.type, 'property_inquiry');
      assert.equal(lead.name, 'Rashid Al Nuaimi');
      assert.equal(lead.email, 'rashid@investments.ae');
      assert.equal(lead.phone, '+971 50 888 9999');
      assert.equal(lead.status, 'New');

      // Verify functionResponse was fed back to model
      assert.ok(functionResponsePayload, 'Function response passed to model');
      assert.equal(functionResponsePayload.message[0].functionResponse.name, 'submitLead');
      assert.equal(functionResponsePayload.message[0].functionResponse.response.success, true);

      // Verify final response
      assert.equal(res._status, 200);
      assert.ok(res._data.text.includes('Thank you Rashid'));
    });
  });

  describe('Fault-Tolerant Fallback Handling', () => {
    it('returns graceful fallback with WhatsApp advisory contact when all candidate models fail', async () => {
      class FailingGenAI {
        get chats() {
          return {
            create: () => ({
              sendMessage: async () => {
                throw new Error('API Resource Exhausted or Network Failure');
              }
            })
          };
        }
      }

      const { routes } = loadChatRoute({
        env: { GEMINI_API_KEY: 'mock-key' },
        MockGoogleGenAI: FailingGenAI
      });

      const handler = routes.post.get('/')[0];
      const res = createMockResponse();

      await handler({
        body: {
          messages: [{ role: 'user', parts: [{ text: 'What is the price of Saadiyat villas?' }] }]
        }
      }, res);

      assert.equal(res._status, 200, 'Returns HTTP 200 graceful fallback');
      assert.ok(res._data.text, 'Contains text response');
      assert.ok(res._data.text.includes('+971 50 676 0668'), 'Contains direct WhatsApp contact line');
      assert.ok(res._data.text.includes('info@diamora.properties'), 'Contains email contact');
    });
  });

  describe('Admin Settings Routes (/api/chat/settings)', () => {
    it('GET /api/chat/settings requires authentication and returns active prompt', async () => {
      // Unauthenticated test
      const { routes: unauthRoutes } = loadChatRoute({ unauthenticated: true });
      const getHandlerUnauth = unauthRoutes.get.get('/settings')[0];
      const resUnauth = createMockResponse();
      await getHandlerUnauth({}, resUnauth);
      assert.equal(resUnauth._status, 401, 'Rejects unauthenticated GET /settings');

      // Authenticated test
      const mockChatSetting = {
        findOne: async () => ({
          key: 'default_bot',
          systemPrompt: 'Active custom prompt',
          temperature: 0.65
        })
      };
      const { routes: authRoutes } = loadChatRoute({ mockChatSetting });
      const getHandlerAuth = authRoutes.get.get('/settings')[1]; // second middleware is route handler
      const resAuth = createMockResponse();
      await getHandlerAuth({}, resAuth);

      assert.equal(resAuth._status, 200);
      assert.ok(resAuth._data.setting, 'Contains setting object');
      assert.ok(resAuth._data.defaultPrompt, 'Contains defaultPrompt reference');
    });

    it('PUT /api/chat/settings validates non-empty prompt and clamps temperature', async () => {
      let savedSetting = null;
      const mockChatSetting = {
        findOneAndUpdate: async (filter, update) => {
          savedSetting = update;
          return { key: 'default_bot', ...update };
        }
      };

      const { routes } = loadChatRoute({ mockChatSetting });
      const putHandler = routes.put.get('/settings')[1];

      // Empty prompt check
      const res1 = createMockResponse();
      await putHandler({ body: { systemPrompt: '   ', temperature: 0.8 }, user: { username: 'admin' } }, res1);
      assert.equal(res1._status, 400);
      assert.equal(res1._data.error, 'System prompt cannot be empty.');

      // Valid update with temperature clamp (> 1.0 clamped to 1.0)
      const res2 = createMockResponse();
      await putHandler({
        body: { systemPrompt: 'Valid custom prompt for AI concierge', temperature: 1.5 },
        user: { username: 'admin' }
      }, res2);
      assert.equal(res2._status, 200);
      assert.equal(savedSetting.systemPrompt, 'Valid custom prompt for AI concierge');
      assert.equal(savedSetting.temperature, 1.0, 'Temperature clamped to 1.0 max');
    });
  });
});
