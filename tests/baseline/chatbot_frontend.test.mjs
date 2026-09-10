import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Lightweight DOM simulation for headless Node.js testing of js/chatbot.js
 */
function createChatbotDOMEnvironment(initialStorage = {}) {
  const elementsById = new Map();
  const elementsByClass = new Map();

  class ClassList {
    constructor(elem) {
      this.elem = elem;
    }
    add(...cls) {
      cls.forEach(c => {
        this.elem._classes.add(c);
        if (!elementsByClass.has(c)) elementsByClass.set(c, new Set());
        elementsByClass.get(c).add(this.elem);
      });
    }
    remove(...cls) {
      cls.forEach(c => {
        this.elem._classes.delete(c);
        if (elementsByClass.has(c)) elementsByClass.get(c).delete(this.elem);
      });
    }
    contains(c) {
      return this.elem._classes.has(c);
    }
    toggle(c, force) {
      if (force !== undefined) {
        if (force) this.add(c);
        else this.remove(c);
        return force;
      }
      if (this.contains(c)) {
        this.remove(c);
        return false;
      }
      this.add(c);
      return true;
    }
  }

  class Element {
    constructor(tag = 'div', id = '') {
      this.tagName = tag.toUpperCase();
      this.id = id;
      this._classes = new Set();
      this.classList = new ClassList(this);
      this.attributes = new Map();
      this.style = {};
      this.childNodes = [];
      this.parentNode = null;
      this._listeners = new Map();
      this.value = '';
      this.disabled = false;
      this.placeholder = '';
      this._textContent = '';
      this._innerHTML = '';
      this.scrollHeight = 1000;
      this.scrollTop = 0;
      if (id) elementsById.set(id, this);
    }

    focus() {}

    setAttribute(name, val) {
      this.attributes.set(name, String(val));
      if (name === 'id') {
        this.id = String(val);
        elementsById.set(this.id, this);
      }
      if (name === 'placeholder') {
        this.placeholder = String(val);
      }
      if (name === 'value') {
        this.value = String(val);
      }
      if (name === 'class') {
        String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
      }
    }

    getAttribute(name) {
      return this.attributes.has(name) ? this.attributes.get(name) : null;
    }

    removeAttribute(name) {
      if (name === 'id') elementsById.delete(this.id);
      this.attributes.delete(name);
    }

    hasAttribute(name) {
      return this.attributes.has(name);
    }

    addEventListener(type, cb) {
      if (!this._listeners.has(type)) this._listeners.set(type, []);
      this._listeners.get(type).push(cb);
    }

    removeEventListener(type, cb) {
      if (this._listeners.has(type)) {
        this._listeners.set(type, this._listeners.get(type).filter(fn => fn !== cb));
      }
    }

    dispatchEvent(event) {
      if (!event.target) event.target = this;
      const cbs = this._listeners.get(event.type) || [];
      for (const cb of cbs) cb(event);
      if (event.bubbles && this.parentNode) {
        this.parentNode.dispatchEvent(event);
      }
      return !event.defaultPrevented;
    }

    closest(selector) {
      let curr = this;
      while (curr && curr !== document) {
        if (selector.startsWith('.') && curr.classList && curr.classList.contains(selector.slice(1))) return curr;
        if (selector.startsWith('#') && curr.id === selector.slice(1)) return curr;
        curr = curr.parentNode;
      }
      return null;
    }

    querySelector(sel) {
      const all = this.querySelectorAll(sel);
      return all[0] || null;
    }

    querySelectorAll(sel) {
      const results = [];
      const walk = (node) => {
        for (const child of node.childNodes) {
          if (child.tagName === '#TEXT') continue;
          let match = false;
          if (sel.startsWith('.')) {
            if (child.classList && child.classList.contains(sel.slice(1))) match = true;
          } else if (sel.startsWith('#')) {
            if (child.id === sel.slice(1)) match = true;
          } else if (child.tagName === sel.toUpperCase()) {
            match = true;
          }
          if (match) results.push(child);
          walk(child);
        }
      };
      walk(this);
      return results;
    }

    appendChild(child) {
      child.parentNode = this;
      this.childNodes.push(child);
      return child;
    }

    insertBefore(newChild, refChild) {
      newChild.parentNode = this;
      const idx = this.childNodes.indexOf(refChild);
      if (idx === -1) {
        this.childNodes.push(newChild);
      } else {
        this.childNodes.splice(idx, 0, newChild);
      }
      return newChild;
    }

    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.childNodes.indexOf(this);
        if (idx !== -1) this.parentNode.childNodes.splice(idx, 1);
        this.parentNode = null;
      }
      if (this.id) elementsById.delete(this.id);
      for (const c of this._classes) {
        if (elementsByClass.has(c)) elementsByClass.get(c).delete(this);
      }
    }

    get textContent() {
      if (this._textContent) return this._textContent;
      let text = '';
      for (const child of this.childNodes) {
        text += child.textContent;
      }
      return text;
    }

    set textContent(v) {
      this._textContent = String(v);
      this.childNodes = [];
    }

    get innerHTML() {
      return this._innerHTML;
    }

    set innerHTML(v) {
      this._innerHTML = String(v);
      const parsed = parseNodes(v);
      this.childNodes = [];
      for (const node of parsed) {
        this.appendChild(node);
      }
    }
  }

  function parseNodes(htmlString) {
    const root = new Element('ROOT');
    const stack = [root];
    const tokenRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9\-]+)((?:\s+[a-zA-Z0-9\-:_]+(?:=(?:\"[^\"]*\"|'[^']*'|[^\s>]+))?)*)\s*(\/)?>|([^<]+)/g;
    let match;
    const voidElements = new Set(['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);

    while ((match = tokenRegex.exec(htmlString)) !== null) {
      const [full, isClose, tagName, rawAttrs, isSelfClose, textContent] = match;
      if (full.startsWith('<!--')) continue;

      if (textContent) {
        if (textContent.trim()) {
          const textNode = new Element('#TEXT');
          textNode.textContent = textContent;
          stack[stack.length - 1].appendChild(textNode);
        }
        continue;
      }

      if (isClose) {
        const tagUpper = tagName.toUpperCase();
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tagName === tagUpper) {
            stack.length = i;
            break;
          }
        }
        continue;
      }

      const elem = new Element(tagName);
      if (rawAttrs) {
        const attrRegex = /([a-zA-Z0-9\-:_]+)(?:=(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
          const name = attrMatch[1];
          let val = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
          val = val
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
          elem.setAttribute(name, val);
        }
      }

      stack[stack.length - 1].appendChild(elem);

      if (!isSelfClose && !voidElements.has(elem.tagName)) {
        stack.push(elem);
      }
    }

    return root.childNodes;
  }

  const document = {
    body: new Element('BODY'),
    getElementById: (id) => elementsById.get(id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('.')) {
        const set = elementsByClass.get(sel.slice(1));
        if (set && set.size > 0) return set.values().next().value;
      } else if (sel.startsWith('#')) {
        return elementsById.get(sel.slice(1)) || null;
      }
      return document.body.querySelector(sel);
    },
    querySelectorAll: (sel) => document.body.querySelectorAll(sel),
    createElement: (tag) => new Element(tag),
    addEventListener: (event, cb) => {
      if (event === 'DOMContentLoaded') setTimeout(cb, 0);
    }
  };

  document.body.insertAdjacentHTML = (pos, html) => {
    const nodes = parseNodes(html);
    for (const node of nodes) {
      document.body.appendChild(node);
      const walk = (n) => {
        if (n.id) elementsById.set(n.id, n);
        for (const c of n.childNodes) walk(c);
      };
      walk(node);
    }
  };

  const storage = new Map(Object.entries(initialStorage));
  const sessionStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear()
  };

  class Event {
    constructor(type, opts = {}) {
      this.type = type;
      this.bubbles = opts.bubbles || false;
      this.cancelable = opts.cancelable || false;
      this.defaultPrevented = false;
      this.target = null;
    }
    preventDefault() { this.defaultPrevented = true; }
    stopPropagation() {}
  }

  let capturedFetchCalls = [];
  const fetchMock = async (url, opts = {}) => {
    const payload = opts.body ? JSON.parse(opts.body) : null;
    capturedFetchCalls.push({ url, opts, payload });
    return {
      ok: true,
      json: async () => ({
        text: 'Thank you for your inquiry regarding luxury UAE developments. A private client advisor will attend to you shortly.'
      })
    };
  };

  const window = {
    location: {
      href: 'https://diamora.properties/projects.html',
      pathname: '/projects.html',
      search: '',
      hostname: 'localhost'
    },
    innerWidth: 1024,
    speechSynthesis: null,
    SpeechRecognition: null,
    webkitSpeechRecognition: null,
    sessionStorage,
    Event,
    document,
    confirm: () => true,
    fetch: fetchMock
  };

  return {
    document,
    window,
    sessionStorage,
    elementsById,
    elementsByClass,
    Event,
    fetchMock,
    getCapturedFetches: () => capturedFetchCalls
  };
}

describe('Chatbot Frontend Baseline Suite', () => {
  const chatbotJsPath = path.join(rootDir, 'js/chatbot.js');
  const chatbotJsCode = fs.readFileSync(chatbotJsPath, 'utf8');

  it('verifies chatbot.js exists with non-empty content', () => {
    assert.ok(chatbotJsCode.length > 5000, 'chatbot.js must contain implementation code');
  });

  it('injects complete chatbot DOM structure and core landmarks', async () => {
    const env = createChatbotDOMEnvironment();
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: env.window.confirm,
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);

    // Wait for DOMContentLoaded handler
    await new Promise(resolve => setTimeout(resolve, 50));

    // 1. Root Container
    const container = env.document.getElementById('chatbotContainer');
    assert.ok(container, '#chatbotContainer must be inserted into DOM');
    assert.ok(container.classList.contains('chatbot-container'), 'Container has .chatbot-container class');

    // 2. Teaser Badge
    const teaser = env.document.getElementById('chatbotTeaser');
    assert.ok(teaser, '#chatbotTeaser must be present');
    assert.ok(teaser.textContent.includes('AI 24/7'), 'Teaser contains "AI 24/7" badge');
    assert.ok(teaser.textContent.includes('Ask Diamora Private AI'), 'Teaser contains banner text');

    // 3. Floating Trigger Button
    const toggle = env.document.getElementById('chatbotToggle');
    assert.ok(toggle, '#chatbotToggle must be present');
    assert.equal(toggle.getAttribute('aria-label'), 'Open Diamora Real Estate AI Assistant');
    assert.ok(env.document.getElementById('chatbotIconChat'), '#chatbotIconChat is present');
    assert.ok(env.document.getElementById('chatbotIconClose'), '#chatbotIconClose is present');

    // 4. Chatbot Window & Header
    const chatWindow = env.document.getElementById('chatbotWindow');
    assert.ok(chatWindow, '#chatbotWindow must be present');
    assert.ok(env.document.getElementById('chatbotAvatar'), '#chatbotAvatar must be present');
    assert.equal(env.document.getElementById('chatbotAvatar').textContent, 'D');
    assert.ok(env.document.getElementById('chatbotStatusText'), '#chatbotStatusText must be present');
    assert.equal(env.document.getElementById('chatbotStatusText').textContent, 'Active • Private UAE Advisory');

    // Header Action Buttons
    const resetBtn = env.document.getElementById('chatbotReset');
    assert.ok(resetBtn, '#chatbotReset must be present');
    assert.equal(resetBtn.getAttribute('aria-label'), 'Start New Conversation');
    const closeBtn = env.document.getElementById('chatbotClose');
    assert.ok(closeBtn, '#chatbotClose must be present');
    assert.equal(closeBtn.getAttribute('aria-label'), 'Close Chat');

    // 5. Messages Stream & Suggestions Container
    const messages = env.document.getElementById('chatbotMessages');
    assert.ok(messages, '#chatbotMessages must be present');
    assert.ok(env.document.getElementById('chatbotSuggestions'), '#chatbotSuggestions must be present');

    // 6. Typing Indicator
    const typing = env.document.getElementById('typingIndicator');
    assert.ok(typing, '#typingIndicator must be present');
    const dots = typing.querySelectorAll('.typing-dot');
    assert.equal(dots.length, 3, 'Typing indicator must have 3 dots');

    // 7. Input Form, Voice Button, and Submit Button
    const form = env.document.getElementById('chatbotForm');
    assert.ok(form, '#chatbotForm must be present');
    const input = env.document.getElementById('chatbotInput');
    assert.ok(input, '#chatbotInput must be present');
    assert.equal(input.placeholder, 'Type your inquiry or select an option above...');
    assert.ok(input.hasAttribute('required'), '#chatbotInput must have required attribute');

    const voiceBtn = env.document.getElementById('chatbotVoiceBtn');
    assert.ok(voiceBtn, '#chatbotVoiceBtn must be present');
    assert.ok(env.document.getElementById('voiceIconMic'), '#voiceIconMic must be present');
    assert.ok(env.document.getElementById('voiceIconStop'), '#voiceIconStop must be present');

    const submitBtn = env.document.getElementById('chatbotSubmit');
    assert.ok(submitBtn, '#chatbotSubmit must be present');
    assert.equal(submitBtn.getAttribute('aria-label'), 'Send message');
  });

  it('renders exactly 4 suggestion quick chips with expected data-prompt attributes', async () => {
    const env = createChatbotDOMEnvironment();
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: env.window.confirm,
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);
    await new Promise(resolve => setTimeout(resolve, 50));

    const chips = env.document.querySelectorAll('.chat-chip');
    assert.equal(chips.length, 4, 'Must render exactly 4 suggestion chips');

    const expectedPrompts = [
      'Show me prime Palm Jumeirah & waterfront properties',
      'How do I qualify for the UAE 10-Year Golden Visa via real estate?',
      'What are the highest-yielding off-plan projects right now?',
      'I want to speak directly with a licensed Diamora private advisor'
    ];

    chips.forEach((chip, idx) => {
      const prompt = chip.getAttribute('data-prompt');
      assert.equal(prompt, expectedPrompts[idx], `Chip ${idx} prompt matches specification`);
    });
  });

  it('submits message and captures full payload when a suggestion chip is clicked', async () => {
    const env = createChatbotDOMEnvironment();
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: env.window.confirm,
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);
    await new Promise(resolve => setTimeout(resolve, 50));

    const firstChip = env.document.querySelector('.chat-chip');
    assert.ok(firstChip, 'Suggestion chip exists');

    // Click chip
    const clickEvent = new env.Event('click', { bubbles: true, cancelable: true });
    firstChip.dispatchEvent(clickEvent);

    // Wait for async fetch to execute and resolve
    await new Promise(resolve => setTimeout(resolve, 100));

    const calls = env.getCapturedFetches();
    assert.equal(calls.length, 1, 'Exactly one fetch request dispatched on chip click');

    const { url, payload } = calls[0];
    assert.ok(url.includes('/api/chat'), 'API request targets /api/chat');
    assert.ok(Array.isArray(payload.messages), 'Payload contains messages array');
    assert.equal(payload.messages[0].role, 'user');
    assert.equal(payload.messages[0].parts[0].text, 'Show me prime Palm Jumeirah & waterfront properties');
    assert.equal(payload.wantAudio, false, 'wantAudio is false by default in text flow');
    assert.equal(typeof payload.context, 'object');
    assert.equal(payload.context.pagePath, '/projects.html');
  });

  it('formats markdown safely with formatMarkdown rules', () => {
    // Extract formatMarkdown logic from chatbotJsCode
    const match = chatbotJsCode.match(/const formatMarkdown = \((.*?)\) => \{([\s\S]*?)\n  \};/);
    assert.ok(match, 'formatMarkdown function must be present in chatbot.js');

    const formatMarkdown = new Function(match[1], match[2]);

    // Test 1: HTML entity escaping (XSS defense baseline)
    const rawXSS = '<script>alert("XSS")</script>&<b>bold</b>';
    const escaped = formatMarkdown(rawXSS);
    assert.ok(!escaped.includes('<script>'), 'Raw script tags must be escaped');
    assert.ok(escaped.includes('&lt;script&gt;'), '< converted to &lt;');
    assert.ok(escaped.includes('&amp;'), '& converted to &amp;');

    // Test 2: Bold formatting
    const boldInput = 'Explore **The Row Saadiyat** in Abu Dhabi.';
    const boldOutput = formatMarkdown(boldInput);
    assert.equal(boldOutput, 'Explore <strong>The Row Saadiyat</strong> in Abu Dhabi.');

    // Test 3: Bullet points
    const bulletAsterisk = '* 5 Bedrooms\n* Private Beachfront';
    assert.equal(formatMarkdown(bulletAsterisk), '• 5 Bedrooms<br>• Private Beachfront');

    const bulletDash = '- 10% Downpayment\n- Flexible 60/40 Plan';
    assert.equal(formatMarkdown(bulletDash), '• 10% Downpayment<br>• Flexible 60/40 Plan');

    // Test 4: Line breaks
    const breaks = 'Paragraph 1\n\nParagraph 2\nSingle break';
    assert.equal(formatMarkdown(breaks), 'Paragraph 1<br><br>Paragraph 2<br>Single break');

    // Test 5: Empty input
    assert.equal(formatMarkdown(''), '');
    assert.equal(formatMarkdown(null), '');
  });

  it('transitions voice state machine and updates UI elements', () => {
    // Extract setVoiceState function logic from chatbot.js
    const match = chatbotJsCode.match(/const setVoiceState = \((.*?)\) => \{([\s\S]*?)\n  \};/);
    assert.ok(match, 'setVoiceState must be defined in chatbot.js');

    const env = createChatbotDOMEnvironment();
    // Simulate DOM elements referenced by setVoiceState
    const voiceBtn = env.document.createElement('button');
    const voiceIconMic = env.document.createElement('span');
    const voiceIconStop = env.document.createElement('span');
    const chatInput = env.document.createElement('input');
    const chatbotAvatar = env.document.createElement('div');
    const chatbotStatusText = env.document.createElement('span');

    let voiceState = 'idle';
    const setVoiceStateFn = new Function(
      'state',
      'voiceState',
      'voiceBtn',
      'voiceIconMic',
      'voiceIconStop',
      'chatInput',
      'chatbotAvatar',
      'chatbotStatusText',
      `
      let vState = state;
      ${match[2]}
      return vState;
      `
    );

    // 1. Transition to 'listening'
    setVoiceStateFn('listening', voiceState, voiceBtn, voiceIconMic, voiceIconStop, chatInput, chatbotAvatar, chatbotStatusText);
    assert.ok(voiceBtn.classList.contains('active'), 'voiceBtn has active class when listening');
    assert.ok(voiceBtn.classList.contains('listening'), 'voiceBtn has listening class when listening');
    assert.equal(voiceIconMic.style.display, 'none', 'Mic icon hidden when listening');
    assert.equal(voiceIconStop.style.display, '', 'Stop icon shown when listening');
    assert.equal(chatInput.disabled, true, 'Input disabled when listening');
    assert.equal(chatInput.placeholder, '🎙️ Listening… speak now');
    assert.equal(chatbotStatusText.textContent, '🎙️ Listening…');

    // 2. Transition to 'processing'
    setVoiceStateFn('processing', voiceState, voiceBtn, voiceIconMic, voiceIconStop, chatInput, chatbotAvatar, chatbotStatusText);
    assert.ok(voiceBtn.classList.contains('processing'), 'voiceBtn has processing class');
    assert.equal(chatbotStatusText.textContent, '⏳ Processing…');

    // 3. Transition to 'speaking'
    setVoiceStateFn('speaking', voiceState, voiceBtn, voiceIconMic, voiceIconStop, chatInput, chatbotAvatar, chatbotStatusText);
    assert.ok(voiceBtn.classList.contains('speaking'), 'voiceBtn has speaking class');
    assert.ok(chatbotAvatar.classList.contains('speaking'), 'chatbotAvatar has speaking class');
    assert.equal(chatbotStatusText.textContent, '🔊 Speaking…');

    // 4. Return to 'idle'
    setVoiceStateFn('idle', voiceState, voiceBtn, voiceIconMic, voiceIconStop, chatInput, chatbotAvatar, chatbotStatusText);
    assert.ok(!voiceBtn.classList.contains('active'), 'voiceBtn active removed on idle');
    assert.equal(chatInput.disabled, false, 'Input re-enabled on idle');
    assert.equal(chatInput.placeholder, 'Type your inquiry or select an option above...');
    assert.equal(chatbotStatusText.textContent, 'Active • Private UAE Advisory');
  });

  it('persists messages to sessionStorage using specified storage keys', async () => {
    const env = createChatbotDOMEnvironment();
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: env.window.confirm,
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);
    await new Promise(resolve => setTimeout(resolve, 50));

    // Baseline storage keys check
    const STORAGE_MSGS_KEY = 'diamora_chat_rendered_v2';
    const STORAGE_HISTORY_KEY = 'diamora_chat_history_v2';

    // Verify initial welcome message was persisted
    const initialRendered = env.sessionStorage.getItem(STORAGE_MSGS_KEY);
    assert.ok(initialRendered, 'Initial welcome message persisted to sessionStorage');
    const parsedInitial = JSON.parse(initialRendered);
    assert.equal(parsedInitial.length, 1);
    assert.equal(parsedInitial[0].sender, 'bot');
    assert.ok(parsedInitial[0].text.includes('Welcome to <strong>Diamora Properties</strong>'));

    // Trigger a user message submit
    const chatInput = env.document.getElementById('chatbotInput');
    chatInput.value = 'Inquiring about Golden Visa investments';
    const chatForm = env.document.getElementById('chatbotForm');
    chatForm.dispatchEvent(new env.Event('submit', { bubbles: true, cancelable: true }));

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify updated storage contains welcome + user message + bot response
    const updatedRendered = JSON.parse(env.sessionStorage.getItem(STORAGE_MSGS_KEY));
    assert.equal(updatedRendered.length, 3, 'Rendered storage holds 3 messages');
    assert.equal(updatedRendered[1].sender, 'user');
    assert.equal(updatedRendered[1].text, 'Inquiring about Golden Visa investments');
    assert.equal(updatedRendered[2].sender, 'bot');

    const history = JSON.parse(env.sessionStorage.getItem(STORAGE_HISTORY_KEY));
    assert.ok(Array.isArray(history), 'History stored in sessionStorage');
    assert.equal(history[0].role, 'user');
  });

  it('rehydrates chat from sessionStorage on initial load', async () => {
    const preloadedMessages = [
      { text: 'Welcome to Diamora', sender: 'bot', time: Date.now() - 1000 },
      { text: 'Tell me about Abu Dhabi', sender: 'user', time: Date.now() - 500 }
    ];
    const preloadedHistory = [
      { role: 'user', parts: [{ text: 'Tell me about Abu Dhabi' }] }
    ];

    const initialStorage = {
      'diamora_chat_rendered_v2': JSON.stringify(preloadedMessages),
      'diamora_chat_history_v2': JSON.stringify(preloadedHistory),
      'diamora_chat_is_open_v2': 'true'
    };

    const env = createChatbotDOMEnvironment(initialStorage);
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: env.window.confirm,
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);
    await new Promise(resolve => setTimeout(resolve, 50));

    const renderedMsgs = env.document.querySelectorAll('.chat-message');
    assert.equal(renderedMsgs.length, 2, 'Rehydrated 2 messages into the DOM');
    assert.ok(renderedMsgs[1].textContent.includes('Tell me about Abu Dhabi'));
  });

  it('resets conversation, clears storage, and restores default welcome message', async () => {
    const env = createChatbotDOMEnvironment();
    const sandbox = {
      document: env.document,
      window: env.window,
      sessionStorage: env.sessionStorage,
      Event: env.Event,
      confirm: () => true, // Confirm reset
      fetch: env.window.fetch,
      console: { ...console, warn: () => {}, error: () => {} },
      setTimeout,
      clearTimeout,
      Date
    };

    vm.createContext(sandbox);
    vm.runInContext(chatbotJsCode, sandbox);
    await new Promise(resolve => setTimeout(resolve, 50));

    // Send a message first
    const chatInput = env.document.getElementById('chatbotInput');
    chatInput.value = 'Can I buy property in Saadiyat?';
    const chatForm = env.document.getElementById('chatbotForm');
    chatForm.dispatchEvent(new env.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now trigger reset button
    const resetBtn = env.document.getElementById('chatbotReset');
    resetBtn.dispatchEvent(new env.Event('click', { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 50));

    const msgs = env.document.querySelectorAll('.chat-message');
    assert.equal(msgs.length, 1, 'Only the default welcome message remains in DOM');
    assert.ok(
      msgs[0].innerHTML.includes('&lt;strong&gt;Diamora Properties&lt;/strong&gt;') ||
      msgs[0].textContent.includes('Diamora Properties'),
      'Welcome message restored'
    );

    // Check that suggestion chips are visible again
    const suggestions = env.document.getElementById('chatbotSuggestions');
    assert.equal(suggestions.style.display, 'flex');
  });
});
