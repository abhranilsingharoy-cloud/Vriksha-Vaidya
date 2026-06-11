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

    this.appendMessage('ai', "Hello! I am Vriksha Vaidya AI Botanist. How can I help you protect your crops today?");
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
    
    // Copy history BEFORE pushing the current message
    const historyToSend = this.history.slice(-6);
    this.history.push({ role: 'user', text });

    this.showTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: this.contextString,
          history: historyToSend
        })
      });

      let responseData;
      const isJson = response.headers.get('content-type')?.includes('application/json');
      
      if (isJson) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        throw new Error(`Vercel Server Error (Not JSON): ${textData.substring(0, 50)}...`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Unknown server error');
      }

      this.showTyping(false);
      
      const formattedText = responseData.reply
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');

      this.appendMessage('ai', formattedText);
      this.history.push({ role: 'ai', text: responseData.reply });

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
