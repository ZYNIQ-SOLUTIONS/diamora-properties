const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction for the bot
const getSystemInstruction = (propertiesText) => `
You are a friendly, professional, and helpful real estate consultant bot for Diamora Properties in the UAE.
Your goal is to assist clients with their property search, answer questions about the UAE real estate market, and ultimately collect their contact information (name, email, phone) to pass on to our human consultants.

Here are the currently available properties:
${propertiesText}

UAE Real Estate Market Rules & Guidelines (Brief):
- Foreigners can own property in designated freehold areas in Dubai and Abu Dhabi.
- Buying property usually requires a 20% down payment for expats.
- The Golden Visa is available for property investments of AED 2 million or more.
- No property tax, but there is a 4% DLD (Dubai Land Department) transfer fee on purchases.

Guidelines for your behavior:
1. Be polite, concise, and enthusiastic.
2. If asked about properties, recommend from the available properties list.
3. Once the user shows interest, ask for their name, email, and phone number so a consultant can get in touch with more details.
4. When you have gathered their name, email, and phone number, YOU MUST use the \`submitLead\` tool to save their details into our system.
5. After calling the tool, confirm with the user that their details have been passed to our consultants who will reach out shortly.
`;

router.post('/', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service is currently unavailable (Missing API Key).' });
    }

    const { messages } = req.body; // Expect an array of objects: { role: 'user' | 'model', parts: [{ text: '...' }] }
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format. "messages" array is required.' });
    }

    // Fetch available properties
    const properties = await Property.find({ status: 'Available' });
    const propertiesText = properties.map(p => 
      `- ${p.title} (${p.propertyType}) in ${p.location}: $${p.price}. ${p.bedrooms} Beds, ${p.bathrooms} Baths, ${p.area} sqft. Description: ${p.description}`
    ).join('\n');

    // Define the tool for saving leads
    const submitLeadTool = {
      name: 'submitLead',
      description: "Submit a new lead to the Diamora Properties dashboard. Call this ONLY when you have collected the user's email, and preferably name and phone number as well.",
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
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash'];

    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const activeChat = ai.chats.create({
          model: modelName,
          config: {
            systemInstruction: getSystemInstruction(propertiesText),
            tools: [{ functionDeclarations: [submitLeadTool] }],
            temperature: 0.7,
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
              message: notes || 'Lead captured by AI Bot',
              status: 'New'
            });
            await newInquiry.save();

            // Send the function response back to the model
            response = await activeChat.sendMessage({
              message: [{
                functionResponse: {
                  name: 'submitLead',
                  response: { success: true, message: 'Lead saved successfully.' }
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
    // Graceful fallback response so the user always receives helpful guidance
    return res.json({
      text: "Thank you for reaching out to Diamora Properties. Our consultants are currently assisting other high-value investors. Please contact us directly via WhatsApp at +971 50 676 0668 or email info@diamora.properties, and we will prepare a bespoke portfolio for you immediately."
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

module.exports = router;
