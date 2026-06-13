// ── FILE: js/ai-botanist.js ─────────────────────────────
import { DISEASE_DB } from './disease-db.js';

export class AIBotanist {
  constructor() {
    this.container = document.getElementById('chatbot-container');
    this.toggleBtn = document.getElementById('chatbot-toggle');
    this.messagesEl = document.getElementById('chatbot-messages');
    this.inputEl = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
    this.typingIndicator = document.getElementById('typing-indicator');

    this.isOpen = false;
    this.history = [];
    
    // Compress the DISEASE_DB into a readable string for the LLM
    this.contextString = this.buildContextString();
  }

  buildContextString() {
    let context = "";
    Object.values(DISEASE_DB).forEach(d => {
      context += `[${d.disease} (${d.crop})]: ${d.description}. Symptoms: ${d.symptoms}. Action: ${d.immediateAction}. Prevention: ${d.prevention ? d.prevention.join(", ") : "None"}. `;
      if (d.chemical) context += `Chemical: ${d.chemical.ingredient}. `;
      if (d.organic) context += `Organic: ${d.organic.remedy}. `;
      context += "\n";
    });
    return context;
  }

  init() {
    if (!this.container) return;

    this.toggleBtn.addEventListener('click', () => this.toggleChat());
    
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      this.appendMessage('ai', "Hello! I am Vriksha Vaidya AI Botanist.<br><br>⚠️ **Setup Required:** To activate me, please **paste your Google Gemini API Key** directly into this chat. (It starts with `AIza...`). It will be saved securely in your browser!");
    } else {
      this.appendMessage('ai', "Hello! I am Vriksha Vaidya AI Botanist. How can I help you protect your crops today?");
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.container.classList.add('open');
      this.toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
      setTimeout(() => this.inputEl.focus(), 300);
    } else {
      this.container.classList.remove('open');
      this.toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }
  }

  async sendMessage() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    this.inputEl.value = '';
    this.appendMessage('user', text);

    // Client-side API Key Management
    let apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      if (text.startsWith("AIza")) {
        localStorage.setItem('gemini_api_key', text.trim());
        this.appendMessage('ai', "✅ **API Key saved securely in your browser!**<br><br>I am now fully activated. How can I help you with your crops today?");
        return;
      } else {
        this.appendMessage('ai', "⚠️ Please paste your valid Gemini API Key (starts with `AIza...`) to continue.");
        return;
      }
    }
    
    // Clear key if user types 'reset key'
    if (text.toLowerCase() === 'reset key') {
      localStorage.removeItem('gemini_api_key');
      this.history = [];
      this.appendMessage('ai', "API Key cleared. Please paste a new API Key to continue.");
      return;
    }

    // Copy history BEFORE pushing the current message
    const historyToSend = this.history.slice(-6);
    this.history.push({ role: 'user', text });

    this.showTyping(true);

    try {
      // Build contents array for direct Gemini API call
      const contents = [];
      historyToSend.forEach(msg => {
        contents.push({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
      contents.push({ role: 'user', parts: [{ text }] });

      const systemPrompt = `You are the Vriksha Vaidya AI Botanist, an expert agronomist AI embedded in a modern web application.
Your goal is to answer the user's questions regarding plant diseases, prevention, and treatment.

CRITICAL INSTRUCTIONS:
1. You MUST use the provided CONTEXT DATABASE below to answer the user's question accurately.
2. If the user's question is completely unrelated to agriculture, plants, or the app, politely decline to answer.
3. Keep your answers relatively concise, professional, and directly actionable.
4. Format your response beautifully using Markdown (bolding, bullet points).
5. MULTI-LANGUAGE SUPPORT: You must detect the language the user is speaking (e.g. English, Hindi, Bengali, Tamil, etc.) and RESPOND ENTIRELY IN THAT SAME LANGUAGE.

--- CONTEXT DATABASE ---
${this.contextString}
------------------------`;

      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents
      };

      // Direct client-side fetch, bypassing Vercel completely
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 400 && data.error?.message?.includes('API key')) {
          localStorage.removeItem('gemini_api_key');
          throw new Error("Invalid API Key. I have removed it from memory. Please paste a valid key.");
        }
        throw new Error(data.error?.message || 'Unknown API error');
      }

      this.showTyping(false);
      
      const replyText = data.candidates[0].content.parts[0].text;
      const formattedText = replyText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');

      this.appendMessage('ai', formattedText);
      this.history.push({ role: 'ai', text: replyText });

    } catch (error) {
      console.error("Chat Error Details:", error);
      this.showTyping(false);
      this.appendMessage('ai', `⚠️ **Error:** ${error.message}`);
    }
  }

  appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-bubble ${role}`;
    msg.innerHTML = text;
    
    this.messagesEl.insertBefore(msg, this.typingIndicator);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  showTyping(show) {
    if (show) {
      this.typingIndicator.classList.add('active');
    } else {
      this.typingIndicator.classList.remove('active');
    }
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}
