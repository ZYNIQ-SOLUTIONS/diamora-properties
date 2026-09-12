import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Admin Feature: Brochure Extraction & Auto-Fill Verification', () => {
  it('verifies brochureExtractor utility exists with expected export functions', async () => {
    const extractor = await import('../../api/utils/brochureExtractor.js');
    assert.ok(typeof extractor.processBrochure === 'function', 'processBrochure function exists');
    assert.ok(typeof extractor.extractTextFromPdf === 'function', 'extractTextFromPdf function exists');
    assert.ok(typeof extractor.extractImagesFromPdf === 'function', 'extractImagesFromPdf function exists');
    assert.ok(typeof extractor.analyzeBrochureWithAI === 'function', 'analyzeBrochureWithAI function exists');
  });

  it('verifies /api/projects/extract-brochure route exists and enforces authentication', () => {
    const routeCode = fs.readFileSync('api/routes/projects.js', 'utf8');
    assert.ok(routeCode.includes("router.post('/extract-brochure', auth"), 'Route must be protected with auth middleware');
    assert.ok(routeCode.includes('processBrochure'), 'Route must invoke processBrochure handler');
  });

  it('verifies dashboard/index.html includes PDF brochure upload and extraction UI elements', () => {
    const html = fs.readFileSync('dashboard/index.html', 'utf8');
    assert.ok(html.includes('id="projectBrochureFileInput"'), 'File input for PDF brochure exists');
    assert.ok(html.includes('id="btnBrowseBrochure"'), 'Browse brochure button exists');
    assert.ok(html.includes('id="btnExtractBrochure"'), 'Extract info button exists');
    assert.ok(html.includes('id="brochureExtractionStatus"'), 'Extraction status message container exists');
  });

  it('verifies dashboard/dashboard.js has listeners and auto-fill population logic', () => {
    const js = fs.readFileSync('dashboard/dashboard.js', 'utf8');
    assert.ok(js.includes('initBrochureExtractionListeners'), 'Brochure listeners function exists');
    assert.ok(js.includes('handleBrochurePdfUpload'), 'Brochure PDF upload handler exists');
    assert.ok(js.includes('triggerBrochureExtraction'), 'Extraction trigger function exists');
    assert.ok(js.includes('applyExtractedBrochureData'), 'Form auto-fill function exists');
    assert.ok(js.includes('populateGalleryUploader'), 'Auto-fill populates photo gallery');
  });
});
