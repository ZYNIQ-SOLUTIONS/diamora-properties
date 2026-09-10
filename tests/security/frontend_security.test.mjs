import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Milestone 3: Frontend Security Verification', () => {
  it('verifies DOMPurify is loaded in blog-post.html', () => {
    const html = fs.readFileSync('blog-post.html', 'utf8');
    assert.ok(html.includes('purify.min.js'), 'DOMPurify script tag must be included in blog-post.html');
  });

  it('verifies DOMPurify sanitization in js/blog-post.js', () => {
    const js = fs.readFileSync('js/blog-post.js', 'utf8');
    assert.ok(js.includes('DOMPurify.sanitize'), 'DOMPurify.sanitize must be called in js/blog-post.js');
    assert.ok(js.includes('FORBID_ATTR'), 'Attributes like onerror/onload must be forbidden');
  });

  it('verifies Helmet CSP in api/server.js includes cdn.jsdelivr.net', () => {
    const serverJs = fs.readFileSync('api/server.js', 'utf8');
    assert.ok(serverJs.includes('https://cdn.jsdelivr.net'), 'Helmet scriptSrc must permit cdn.jsdelivr.net');
  });

  it('verifies escapeHtml is consistently applied in js/projects.js', () => {
    const js = fs.readFileSync('js/projects.js', 'utf8');
    assert.ok(js.includes('function escapeHtml'), 'projects.js must declare escapeHtml');
    assert.ok(js.includes('escapeHtml(proj.title'), 'title must be escaped');
    assert.ok(js.includes('escapeHtml(proj.developer'), 'developer must be escaped');
  });

  it('verifies escapeHtml is consistently applied in js/project-detail.js', () => {
    const js = fs.readFileSync('js/project-detail.js', 'utf8');
    assert.ok(js.includes('function escapeHtml'), 'project-detail.js must declare escapeHtml');
    assert.ok(js.includes('escapeHtml(proj.description'), 'description must be escaped');
  });

  it('verifies chatbot escapes inputs and user text in js/chatbot.js', () => {
    const js = fs.readFileSync('js/chatbot.js', 'utf8');
    assert.ok(js.includes('msgDiv.textContent = text'), 'User text must be assigned safely via textContent');
    assert.ok(js.includes('&amp;') && js.includes('&lt;') && js.includes('&gt;'), 'Markdown formatting must escape HTML entities');
  });
});
