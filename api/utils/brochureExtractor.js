const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const { GoogleGenAI } = require('@google/genai');

/**
 * Extracts raw text from a PDF file using pdftotext.
 * Caps at first 30 pages to prevent memory exhaustion on giant brochures.
 */
async function extractTextFromPdf(pdfPath) {
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-l', '30', pdfPath, '-'], {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000
    });
    return stdout || '';
  } catch (err) {
    console.warn('[brochureExtractor] pdftotext warning:', err.message);
    return '';
  }
}

/**
 * Extracts embedded images and renders page previews from the brochure PDF.
 * Converts extracted images and renders high-quality web-ready images into /uploads.
 */
async function extractImagesFromPdf(pdfPath, uploadsDir) {
  const images = [];
  const uniquePrefix = `brochure_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tempDir = path.join(uploadsDir, `temp_${uniquePrefix}`);

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Render top brochure pages as high-res images (up to 8 pages) using pdftoppm
    try {
      const pagePrefix = path.join(tempDir, 'page');
      await execFileAsync('pdftoppm', ['-png', '-r', '150', '-l', '8', pdfPath, pagePrefix], {
        timeout: 45000
      });
    } catch (err) {
      console.warn('[brochureExtractor] pdftoppm page rendering warning:', err.message);
    }

    // Step 2: Extract embedded photos (up to 20 images) using pdfimages
    try {
      const imgPrefix = path.join(tempDir, 'img');
      await execFileAsync('pdfimages', ['-png', '-l', '15', pdfPath, imgPrefix], {
        timeout: 45000
      });
    } catch (err) {
      console.warn('[brochureExtractor] pdfimages extraction warning:', err.message);
    }

    // Read all generated images from tempDir
    const files = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
    
    // Sort and filter files by size (keep images with reasonable size > 35KB to skip tiny icons/bullets)
    const validFiles = files
      .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
      .map(f => {
        const fullPath = path.join(tempDir, f);
        const stat = fs.statSync(fullPath);
        return { name: f, fullPath, size: stat.size };
      })
      .filter(f => f.size > 35 * 1024) // > 35KB
      .sort((a, b) => b.size - a.size); // largest files first (renderings, photos)

    // Move up to 12 best quality images to /uploads
    const maxToKeep = Math.min(validFiles.length, 12);
    for (let i = 0; i < maxToKeep; i++) {
      const file = validFiles[i];
      const targetFilename = `diamora_extracted_${uniquePrefix}_${i + 1}.png`;
      const targetPath = path.join(uploadsDir, targetFilename);
      fs.copyFileSync(file.fullPath, targetPath);
      images.push({
        url: `/uploads/${targetFilename}`,
        filename: targetFilename,
        size: file.size
      });
    }
  } catch (err) {
    console.error('[brochureExtractor] Image extraction error:', err);
  } finally {
    // Clean up temporary directory
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {}
  }

  return images;
}

/**
 * Uses Gemini AI to analyze the brochure text and extract structured project data.
 */
async function analyzeBrochureWithAI(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Limit raw text to first 35,000 characters to fit context comfortably
  const cleanSnippet = (rawText || '').substring(0, 35000);

  const prompt = `You are an expert real estate data extraction assistant for Diamora Properties, a luxury UAE brokerage.
Analyze the following official real estate developer brochure text and extract all project information into a clean, valid JSON object.

Output ONLY valid JSON matching this exact structure (no markdown fences, no explanatory text, just raw parseable JSON):
{
  "title": "string (The official name of the project/development)",
  "developer": "string (Master developer company name, e.g. Aldar, Sobha Realty, Emaar, Binghatti, Reportage)",
  "tagline": "string (Short luxury marketing subtitle or tagline)",
  "city": "Dubai" | "Abu Dhabi" | "Ras Al Khaimah" | "Sharjah" | "International",
  "location": "string (District / community, e.g. Saadiyat Cultural District, Downtown Dubai, Yas Island)",
  "startingPrice": number or null (e.g. 1500000. Do not include AED or commas, only numeric number),
  "handoverDate": "string (e.g. Q4 2027, 2028, or month/year)",
  "paymentPlan": "string (e.g. 60/40, 70/30, 80/20, or 1% Monthly)",
  "downPayment": "string (e.g. 10%, 20%)",
  "bedrooms": "string (e.g. 1, 2, 3 & 4 Bedrooms, Studios to Penthouses)",
  "status": "New Launch" | "Under Construction" | "Handover Soon",
  "propertyTypes": ["string", "string"] (e.g. ["Apartments", "Villas", "Penthouses", "Townhouses"]),
  "permitNumber": "string (Regulatory or DMT/DLD permit number if present)",
  "ownership": "string (e.g. 100% Freehold - All Nationalities)",
  "description": "string (Comprehensive 2-4 paragraph project narrative describing the master development, architectural vision, luxury specifications, and lifestyle)",
  "highlights": ["string", "string", "string", "string"] (4 to 8 compelling bullet points, one per item),
  "amenities": ["string", "string", "string"] (list of luxury lifestyle amenities, facilities, and services mentioned),
  "coordinates": {
    "lat": number or null (approximate latitude if known for the community),
    "lng": number or null (approximate longitude if known for the community)
  }
}

BROCHURE TEXT CONTENT:
${cleanSnippet || 'No text extracted from brochure.'}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt
  });

  const responseText = response.text || '';
  
  // Clean JSON output (strip ```json and ``` if returned)
  let cleanJsonStr = responseText.trim();
  if (cleanJsonStr.startsWith('```')) {
    cleanJsonStr = cleanJsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }

  try {
    return JSON.parse(cleanJsonStr);
  } catch (parseErr) {
    console.error('[brochureExtractor] Failed to parse JSON response from Gemini:', cleanJsonStr);
    throw new Error('AI analysis succeeded but returned invalid JSON format.');
  }
}

/**
 * Main orchestrator: extracts text, extracts images, runs AI analysis, and returns combined payload.
 */
async function processBrochure(pdfPath, uploadsDir, brochureUrl) {
  // Step 1: Text extraction
  const rawText = await extractTextFromPdf(pdfPath);

  // Step 2: Image extraction
  const extractedImages = await extractImagesFromPdf(pdfPath, uploadsDir);

  // Step 3: AI structured data extraction
  let aiData = {};
  if (rawText && rawText.trim().length > 30) {
    try {
      aiData = await analyzeBrochureWithAI(rawText);
    } catch (aiErr) {
      console.warn('[brochureExtractor] AI extraction warning:', aiErr.message);
      aiData = {
        title: '',
        description: rawText.substring(0, 500)
      };
    }
  } else {
    // If text was too short or rasterized, fallback with extracted images
    aiData = {
      title: '',
      description: 'Extracted from visual PDF brochure.'
    };
  }

  const imageUrls = extractedImages.map(img => img.url);

  return {
    success: true,
    data: {
      ...aiData,
      brochureUrl: brochureUrl || '',
      heroImage: imageUrls[0] || '',
      gallery: imageUrls
    },
    rawTextLength: rawText.length,
    imagesCount: extractedImages.length
  };
}

module.exports = {
  extractTextFromPdf,
  extractImagesFromPdf,
  analyzeBrochureWithAI,
  processBrochure
};
