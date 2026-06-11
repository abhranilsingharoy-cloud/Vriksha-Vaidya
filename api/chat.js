const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // CORS Headers for local testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, context, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured on the server. Please add it to your Vercel Environment Variables.' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash for blazing fast inference
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are the Vriksha Vaidya AI Botanist, an expert agronomist AI embedded in a modern web application.
Your goal is to answer the user's questions regarding plant diseases, prevention, and treatment.

CRITICAL INSTRUCTIONS:
1. You MUST use the provided CONTEXT DATABASE below to answer the user's question accurately.
2. If the user's question is completely unrelated to agriculture, plants, or the app, politely decline to answer.
3. Keep your answers relatively concise, professional, and directly actionable.
4. Format your response beautifully using Markdown (bolding, bullet points).

--- CONTEXT DATABASE ---
${context}
------------------------
`;

    // Construct history array for Gemini
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am the Vriksha Vaidya AI Botanist. I will use the provided context to answer the user's questions accurately and professionally." }],
      }
    ];

    // Append prior user history if any
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response. The server encountered an issue connecting to the AI." });
  }
};
