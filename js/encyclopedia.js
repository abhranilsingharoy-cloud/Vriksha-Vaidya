// ── FILE: js/encyclopedia.js ─────────────────────────────
import { DISEASE_DB } from './disease-db.js';
import { trapFocus, releaseFocus } from './accessibility.js';

export class Encyclopedia {
  constructor(gridEl, filterBarEl, searchEl, drawerEl) {
    this.gridEl = gridEl;
    this.filterBarEl = filterBarEl;
    this.searchEl = searchEl;
    this.drawerEl = drawerEl;
    
    this.diseases = Object.values(DISEASE_DB);
    this.activeCrop = 'all';
    this.activeSeverity = 'all';
    this.searchTerm = '';
    
    this.lastFocusedCard = null;
    this.releaseFocusFn = null;
  }

  init() {
    this.setupFilters();
    this.setupSearch();
    this.setupDrawer();
    this.renderCards();
    
    // Setup intersection observer for scroll animations
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    Array.from(this.gridEl.children).forEach(child => this.observer.observe(child));
  }

  setupFilters() {
    // Extract unique crops
    const crops = [...new Set(this.diseases.map(d => d.crop))].sort();
    
    const cropContainer = document.getElementById('crop-filters');
    if (!cropContainer) return;

    let html = `<button class="pill active" data-crop="all">All Crops</button>`;
    crops.forEach(c => {
      html += `<button class="pill" data-crop="${c}">${c}</button>`;
    });
    cropContainer.innerHTML = html;

    // Bind crop filters
    cropContainer.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      cropContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      this.activeCrop = e.target.dataset.crop;
      this.applyFilters();
    });

    // Bind severity filters
    const severityContainer = document.getElementById('severity-filters');
    if (severityContainer) {
      severityContainer.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        severityContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.activeSeverity = e.target.dataset.severity;
        this.applyFilters();
      });
    }
  }

  setupSearch() {
    if (!this.searchEl) return;
    
    let timeout;
    this.searchEl.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.searchTerm = e.target.value.toLowerCase();
        this.applyFilters();
      }, 200);
    });
  }

  setupDrawer() {
    const closeBtn = document.getElementById('drawer-close');
    const backdrop = document.getElementById('drawer-backdrop');
    
    const closeHandler = () => this.closeDrawer();
    
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    if (backdrop) backdrop.addEventListener('click', closeHandler);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawerEl.classList.contains('is-open')) {
        closeHandler();
      }
    });
  }

  renderCards() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    
    this.diseases.forEach((d, i) => {
      const isHealthy = d.isHealthy;
      const severityClass = `severity-${d.severity}`;
      
      const card = document.createElement('div');
      card.className = `disease-card glass-card ${isHealthy ? 'is-healthy' : ''}`;
      card.dataset.crop = d.crop;
      card.dataset.severity = d.severity;
      card.dataset.name = d.disease.toLowerCase();
      card.tabIndex = 0;
      card.setAttribute('data-animate', '');
      card.style.transitionDelay = `${(i % 10) * 50}ms`; // staggered entry
      
      card.innerHTML = `
        <div class="disease-card-header">
          <div class="disease-card-title">
            <span>${d.emoji}</span>
            <h4>${d.disease}</h4>
          </div>
        </div>
        <div style="margin-bottom: 1rem;">
          ${!isHealthy ? `<span class="severity-badge ${severityClass}">${d.severity}</span>` : '<span class="severity-badge severity-Low">Healthy</span>'}
          <span class="text-small text-muted" style="margin-left: 0.5rem;">${d.crop}</span>
        </div>
        <p class="text-small text-muted" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${d.description}</p>
      `;

      const openHandler = () => this.openDrawer(d, card);
      card.addEventListener('click', openHandler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });

      this.gridEl.appendChild(card);
      if (this.observer) this.observer.observe(card);
    });
  }

  applyFilters() {
    if (!this.gridEl) return;
    const cards = this.gridEl.querySelectorAll('.disease-card');
    
    cards.forEach(card => {
      const matchCrop = this.activeCrop === 'all' || card.dataset.crop === this.activeCrop;
      const matchSeverity = this.activeSeverity === 'all' || card.dataset.severity === this.activeSeverity;
      const matchSearch = this.searchTerm === '' || 
                          card.dataset.name.includes(this.searchTerm) || 
                          card.dataset.crop.toLowerCase().includes(this.searchTerm);
      
      if (matchCrop && matchSeverity && matchSearch) {
        card.style.display = 'block';
        // Force reflow and transition opacity
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 300);
      }
    });
  }

  openDrawer(disease, triggerCard) {
    this.lastFocusedCard = triggerCard;
    const content = document.getElementById('drawer-content');
    if (!content) return;
    
    const isHealthy = disease.isHealthy;
    
    let html = `
      <div class="drawer-header">
        <div class="drawer-emoji">${disease.emoji}</div>
        <h2 style="margin-bottom: 0.5rem;">${disease.disease}</h2>
        <p class="text-muted">Crop: ${disease.crop}</p>
        ${!isHealthy ? `<div style="margin-top: 1rem;"><span class="severity-badge severity-${disease.severity}">${disease.severity} Risk</span></div>` : ''}
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h3 class="text-primary" style="margin-bottom: 0.5rem;">Overview</h3>
        <p class="text-muted">${disease.description}</p>
        ${!isHealthy ? `<p class="text-muted" style="margin-top: 1rem;"><strong>Symptoms:</strong> ${disease.symptoms}</p>` : ''}
      </div>
    `;

    if (!isHealthy) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 class="text-primary" style="margin-bottom: 0.5rem;">Action Plan</h3>
          <div style="padding: 1rem; background: rgba(255,68,68,0.1); border-left: 3px solid var(--danger-red); margin-bottom: 1rem;">
            <strong>Immediate Step:</strong> ${disease.immediateAction}
          </div>
          
          ${disease.chemical ? `
            <div style="margin-bottom: 1rem;">
              <h4 class="text-primary">Chemical Treatment</h4>
              <ul class="text-muted">
                <li><strong>Agent:</strong> ${disease.chemical.ingredient}</li>
                <li><strong>Rate:</strong> ${disease.chemical.rate}</li>
                <li><strong>Frequency:</strong> ${disease.chemical.frequency}</li>
              </ul>
            </div>
          ` : ''}
          
          ${disease.organic ? `
            <div>
              <h4 class="text-primary">Organic Alternative</h4>
              <ul class="text-muted">
                <li><strong>Remedy:</strong> ${disease.organic.remedy}</li>
                <li><strong>Apply:</strong> ${disease.organic.application}</li>
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    html += `
      <div style="margin-bottom: 2rem;">
        <h3 class="text-primary" style="margin-bottom: 0.5rem;">Prevention & Care</h3>
        <ul class="text-muted" style="list-style: disc; padding-left: 1.5rem;">
          ${disease.prevention.map(p => `<li style="margin-bottom: 0.5rem;">${p}</li>`).join('')}
        </ul>
      </div>
      
      <div class="qr-container">
        <div id="drawer-qr"></div>
      </div>
      <p class="text-center text-small text-muted" style="margin-top: 1rem;">Scan to read more on Wikipedia</p>
    `;
    
    content.innerHTML = html;
    
    // Generate QR
    if (window.QRCode) {
      new QRCode(document.getElementById('drawer-qr'), {
        text: disease.wikiUrl,
        width: 128,
        height: 128,
        colorDark: '#39ff6e',
        colorLight: '#0a1a0e'
      });
    }

    this.drawerEl.classList.add('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'false');
    
    this.releaseFocusFn = trapFocus(this.drawerEl);
  }

  closeDrawer() {
    this.drawerEl.classList.remove('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'true');
    
    if (this.releaseFocusFn) {
      this.releaseFocusFn();
      this.releaseFocusFn = null;
    }
    
    if (this.lastFocusedCard) {
      this.lastFocusedCard.focus();
    }
  }
}
