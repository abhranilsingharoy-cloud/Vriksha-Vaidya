module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, context, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'The GEMINI_API_KEY is missing in Vercel. Please add it in Vercel > Settings > Environment Variables, and REDEPLOY.' 
      });
    }

    const systemPrompt = `You are the Vriksha Vaidya AI Botanist, an expert agronomist AI embedded in a modern web application.
Your goal is to answer the user's questions regarding plant diseases, prevention, and treatment.

CRITICAL INSTRUCTIONS:
1. You MUST use the provided CONTEXT DATABASE below to answer the user's question accurately.
2. If the user's question is completely unrelated to agriculture, plants, or the app, politely decline to answer.
3. Keep your answers relatively concise, professional, and directly actionable.
4. Format your response beautifully using Markdown (bolding, bullet points).
5. MULTI-LANGUAGE SUPPORT: You must detect the language the user is speaking (e.g. English, Hindi, Bengali, Tamil, etc.) and RESPOND ENTIRELY IN THAT SAME LANGUAGE.

--- CONTEXT DATABASE ---
${context}
------------------------
`;

    // Map history to Gemini's expected REST format
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents
    };

    // Raw fetch to bypass any npm SDK issues
    // Using gemini-1.5-flash which has a generous free tier
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ error: data.error?.message || 'Google Gemini API returned an error.' });
    }

    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    res.status(500).json({ error: `Server Crash: ${error.message}` });
  }
};
