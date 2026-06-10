// ── FILE: js/history.js ─────────────────────────────
import { CONFIG } from './config.js';

export class HistoryManager {
  constructor() {
    this.STORAGE_KEY = 'leafscan-history';
  }

  saveResult(imageDataURL, topResults) {
    const entry = {
      id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      imageDataURL: imageDataURL,
      disease: topResults[0].disease.disease,
      confidence: topResults[0].confidence,
      crop: topResults[0].disease.crop,
      severity: topResults[0].disease.severity,
      isHealthy: topResults[0].disease.isHealthy
    };

    let entries = this.getAll();
    entries.unshift(entry); // Add to beginning

    if (entries.length > CONFIG.HISTORY_MAX_ITEMS) {
      entries = entries.slice(0, CONFIG.HISTORY_MAX_ITEMS);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading history:', e);
      return [];
    }
  }

  deleteById(id) {
    let entries = this.getAll();
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  renderTimeline(containerEl) {
    if (!containerEl) return;
    const entries = this.getAll();
    
    if (entries.length === 0) {
      containerEl.innerHTML = `
        <div class="empty-state">
          <img src="assets/icons/scan-icon.svg" alt="" class="empty-icon">
          <h3>No Scans Yet</h3>
          <p>Your previous scan history will appear here.</p>
        </div>
      `;
      return;
    }

    // Group by date
    const groups = {
      'Today': [],
      'Yesterday': [],
      'Older': []
    };

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toDateString();
      
      if (dateStr === todayStr) {
        groups['Today'].push(entry);
      } else if (dateStr === yesterdayStr) {
        groups['Yesterday'].push(entry);
      } else {
        const monthYear = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(entry);
      }
    });

    let html = '';
    
    for (const [groupName, groupEntries] of Object.entries(groups)) {
      if (groupEntries.length === 0) continue;
      
      html += `
        <div class="date-group">
          <h3>${groupName}</h3>
          <div class="history-grid">
            ${groupEntries.map(entry => `
              <div class="history-card" data-id="${entry.id}">
                <button class="delete-btn" aria-label="Delete scan">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <div class="history-card-inner">
                  <img src="${entry.imageDataURL}" alt="" class="history-thumb">
                  <div class="history-info">
                    <h4>${entry.disease}</h4>
                    <div>
                      <span class="severity-badge ${entry.isHealthy ? 'severity-Low' : 'severity-' + entry.severity}">${entry.isHealthy ? 'Healthy' : entry.severity}</span>
                      <span class="text-small text-muted" style="margin-left: 0.5rem;">${entry.crop}</span>
                    </div>
                    <div class="history-date">${new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    containerEl.innerHTML = html;

    // Attach swipe delete listeners
    containerEl.querySelectorAll('.history-card').forEach(card => {
      this.initSwipeDelete(card, card.dataset.id);
      
      const delBtn = card.querySelector('.delete-btn');
      delBtn.addEventListener('click', () => {
        this.deleteById(card.dataset.id);
        this.renderTimeline(containerEl); // re-render
        // Trigger custom event so stats can update
        document.dispatchEvent(new CustomEvent('history-changed'));
      });
    });
  }

  renderStats(statsEl) {
    if (!statsEl) return;
    const entries = this.getAll();
    
    if (entries.length === 0) {
      statsEl.classList.add('hidden');
      return;
    }
    statsEl.classList.remove('hidden');

    const total = entries.length;
    const healthyCount = entries.filter(e => e.isHealthy).length;
    const diseasedCount = total - healthyCount;
    
    const healthyRate = Math.round((healthyCount / total) * 100) || 0;
    const diseasedRate = 100 - healthyRate;
    
    // Calculate stroke dasharray for donut chart (circumference = 314.16 for r=50)
    const healthyDash = (healthyRate / 100) * 314.16;
    const diseasedDash = (diseasedRate / 100) * 314.16;

    statsEl.innerHTML = `
      <div class="stat-item">
        <div class="text-muted text-small">Total Scans</div>
        <div class="val">${total}</div>
      </div>
      
      <div class="donut-chart">
        <svg viewBox="0 0 120 120" width="120" height="120" class="donut-svg">
          <circle class="donut-bg" cx="60" cy="60" r="50"></circle>
          <circle class="donut-healthy" cx="60" cy="60" r="50" style="stroke-dasharray: ${healthyDash} 314.16; stroke-dashoffset: 0;"></circle>
          <circle class="donut-diseased" cx="60" cy="60" r="50" style="stroke-dasharray: ${diseasedDash} 314.16; stroke-dashoffset: -${healthyDash};"></circle>
        </svg>
      </div>
      
      <div class="stat-item">
        <div class="text-muted text-small">Diseases Found</div>
        <div class="val" style="color: var(--danger-red);">${diseasedCount}</div>
      </div>
    `;
  }

  initSwipeDelete(cardEl, id) {
    const inner = cardEl.querySelector('.history-card-inner');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleStart = (e) => {
      startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      isDragging = true;
      inner.style.transition = 'none';
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      currentX = x - startX;
      
      // Only allow swipe left
      if (currentX < 0 && currentX > -100) {
        inner.style.transform = `translateX(${currentX}px)`;
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      inner.style.transition = 'transform 0.2s ease';
      
      if (currentX < -60) {
        // Snap open
        inner.style.transform = `translateX(-80px)`;
        cardEl.classList.add('swiped');
      } else {
        // Snap back
        inner.style.transform = `translateX(0)`;
        cardEl.classList.remove('swiped');
      }
      currentX = 0;
    };

    cardEl.addEventListener('touchstart', handleStart, {passive: true});
    cardEl.addEventListener('touchmove', handleMove, {passive: true});
    cardEl.addEventListener('touchend', handleEnd);
    
    // Reset if click outside
    document.addEventListener('click', (e) => {
      if (!cardEl.contains(e.target) && cardEl.classList.contains('swiped')) {
        inner.style.transform = `translateX(0)`;
        cardEl.classList.remove('swiped');
      }
    });
  }
}
