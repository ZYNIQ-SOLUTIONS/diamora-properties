const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const ChatSetting = require('../models/ChatSetting');
const auth = require('../middleware/auth');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_SYSTEM_PROMPT = `You are the private AI Luxury Real Estate Consultant for Diamora Properties in the UAE (Abu Dhabi & Dubai).
Your role is to offer discreet, ultra-premium advisory to sovereign wealth investors, family offices, and high-net-worth individuals exploring UAE prime real estate.

Core Objectives:
1. Provide authoritative, concise, and elegant market intelligence on Dubai and Abu Dhabi luxury properties, off-plan allocations, waterfront estates, and capital appreciation trends.
2. Answer inquiries about the UAE 10-Year Golden Visa (available for property purchases of AED 2M+), 0% personal tax, and DLD / freehold ownership regulations.
3. Guide clients towards our portfolio of curated luxury developments and recommend properties matching their preferences.
4. When the client expresses interest in a property, allocation, or private briefing, professionally invite them to share their Name, Email, and Phone Number so our licensed private client advisors can prepare a bespoke off-market portfolio.
5. Once you have collected their email (and name/phone if available), you MUST call the submitLead tool to securely register their inquiry with our private office.

Available Properties Portfolio:
{properties}

Current Browsing Context:
{pageContext}

Guidelines for your behavior:
- Tone: Sophisticated, respectful, articulate, and trustworthy (reminiscent of high-end private wealth advisory).
- Brevity: Keep responses focused, digestible, and free of fluff.
- Multilingual: If the visitor communicates in Arabic, respond in refined, professional Arabic (العربية الفصحى).
- Always use the submitLead tool once contact details are provided to confirm their private consultation.`;

function formatSystemPrompt(template, propertiesText, pageContextText) {
  let prompt = template || DEFAULT_SYSTEM_PROMPT;

  if (prompt.includes('{properties}')) {
    prompt = prompt.replace('{properties}', propertiesText || 'No current properties listed.');
  } else {
    prompt += `\n\nAvailable Properties Portfolio:\n${propertiesText || 'No current properties listed.'}`;
  }

  if (prompt.includes('{pageContext}')) {
    prompt = prompt.replace('{pageContext}', pageContextText || 'Browsing Diamora Properties.');
  } else {
    prompt += `\n\n${pageContextText}`;
  }

  return prompt;
}

function buildPageContextText(context) {
  if (!context || (!context.pageTitle && !context.pageUrl && !context.pagePath)) {
    return 'Current Visitor Browsing Context: The client is browsing the Diamora Properties digital platform.';
  }

  let text = 'Current Visitor Browsing Context:\n';
  if (context.pageTitle) {
    text += `- Page Title: "${context.pageTitle}"\n`;
  }
  if (context.pagePath) {
    text += `- Current URL Path: ${context.pagePath}\n`;
  }
  if (context.pageUrl) {
    text += `- Full URL: ${context.pageUrl}\n`;
  }
  text += 'Use this page context to give relevant, immediate answers tailored to what the client is viewing on the site right now.';
  return text;
}

// -----------------------------------------------------------------------------
// GET /api/chat/settings (Admin: Fetch current system prompt and defaults)
// -----------------------------------------------------------------------------
router.get('/settings', auth, async (req, res) => {
  try {
    let setting = await ChatSetting.findOne({ key: 'default_bot' });
    if (!setting) {
      setting = {
        key: 'default_bot',
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        temperature: 0.7
      };
    }
    res.json({
      setting,
      defaultPrompt: DEFAULT_SYSTEM_PROMPT
    });
  } catch (err) {
    console.error('Error fetching chat settings:', err);
    res.status(500).json({ error: 'Failed to retrieve chat settings' });
  }
});

// -----------------------------------------------------------------------------
// PUT /api/chat/settings (Admin: Update system prompt and temperature)
// -----------------------------------------------------------------------------
router.put('/settings', auth, async (req, res) => {
  try {
    const { systemPrompt, temperature } = req.body;
    if (!systemPrompt || typeof systemPrompt !== 'string' || !systemPrompt.trim()) {
      return res.status(400).json({ error: 'System prompt cannot be empty.' });
    }

    const temp = typeof temperature === 'number' ? Math.max(0.0, Math.min(1.0, temperature)) : 0.7;

    const setting = await ChatSetting.findOneAndUpdate(
      { key: 'default_bot' },
      {
        systemPrompt: systemPrompt.trim(),
        temperature: temp,
        updatedBy: req.user?.username || 'admin'
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'AI Concierge prompt and settings updated successfully.',
      setting
    });
  } catch (err) {
    console.error('Error updating chat settings:', err);
    res.status(500).json({ error: 'Failed to update chat settings' });
  }
});

// -----------------------------------------------------------------------------
// POST /api/chat (Public: Send message with session history and page context)
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service is currently unavailable (Missing API Key).' });
    }

    const { messages, context } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request format. "messages" array is required.' });
    }

    // Fetch active system prompt from DB (or fallback to default)
    let chatSetting = await ChatSetting.findOne({ key: 'default_bot' }).lean();
    const promptTemplate = (chatSetting && chatSetting.systemPrompt) ? chatSetting.systemPrompt : DEFAULT_SYSTEM_PROMPT;
    const promptTemperature = (chatSetting && typeof chatSetting.temperature === 'number') ? chatSetting.temperature : 0.7;

    // Fetch available properties
    const properties = await Property.find({ status: 'Available' });
    const propertiesText = properties.map(p => 
      `- ${p.title} (${p.propertyType}) in ${p.location}: AED ${Number(p.price || 0).toLocaleString()}. ${p.bedrooms} Beds, ${p.bathrooms} Baths, ${p.area} sqft. Description: ${p.description}`
    ).join('\n');

    const pageContextText = buildPageContextText(context);
    const systemInstruction = formatSystemPrompt(promptTemplate, propertiesText, pageContextText);

    // Define the tool for saving leads
    const submitLeadTool = {
      name: 'submitLead',
      description: "Submit a new VIP lead to the Diamora Properties dashboard. Call this ONLY when you have collected the client's email, and preferably name and phone number as well.",
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the client.' },
          email: { type: 'string', description: 'The email address of the client. This is required.' },
          phone: { type: 'string', description: 'The phone number of the client.' },
          notes: { type: 'string', description: 'Any extra notes about what the client is looking for (budget, intent, property preference).' }
        },
        required: ['email']
      }
    };

    const history = messages.slice(0, -1);
    const latestMessage = messages[messages.length - 1];
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.6-flash'];

    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const activeChat = ai.chats.create({
          model: modelName,
          config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [submitLeadTool] }],
            temperature: promptTemperature,
          },
          history: history
        });

        response = await activeChat.sendMessage({ message: latestMessage.parts[0].text });

        // Check if the model decided to call a function
        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          if (call.name === 'submitLead') {
            const { name, email, phone, notes } = call.args;
            
            // Save the lead to the database
            const newInquiry = new Inquiry({
              type: 'property_inquiry',
              name: name || '',
              email: email,
              phone: phone || '',
              message: notes || `Lead captured by AI Concierge (Browsing: ${context?.pageTitle || 'Landing Page'})`,
              status: 'New'
            });
            await newInquiry.save();

            // Send the function response back to the model
            response = await activeChat.sendMessage({
              message: [{
                functionResponse: {
                  name: 'submitLead',
                  response: { success: true, message: 'VIP Lead saved successfully into Diamora Private Office CRM.' }
                }
              }]
            });
          }
        }

        if (response && response.text) {
          return res.json({ text: response.text });
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} encountered an error, falling back to next candidate:`, err.message || err);
      }
    }

    if (response && response.text) {
      return res.json({ text: response.text });
    }

    console.error('All AI Chat candidate models failed. Last error:', lastError);
    return res.json({
      text: "Thank you for reaching out to Diamora Properties. Our private advisors are currently facilitating off-market allocations. Please contact us directly via WhatsApp at +971 50 676 0668 or email info@diamora.properties, and a licensed advisor will attend to your inquiry immediately."
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

module.exports = router;
