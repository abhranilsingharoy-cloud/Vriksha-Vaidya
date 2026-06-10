// ── FILE: js/results.js ─────────────────────────────
export class ResultsRenderer {
  constructor(panelEl) {
    this.panelEl = panelEl;
    this.currentResult = null;
  }

  render(topResults) {
    this.currentResult = topResults[0];
    
    if (topResults[0].confidence < 0.45) {
      this.renderLowConfidence();
    } else {
      this.renderDiagnosis(topResults);
    }
  }

  renderDiagnosis(topResults) {
    const primary = topResults[0];
    const disease = primary.disease;
    
    const isHealthy = disease.isHealthy;
    const severityClass = `severity-${disease.severity}`;
    
    const html = `
      <div class="result-card ${isHealthy ? 'is-healthy' : 'is-diseased'}">
        <div class="result-header" id="result-header">
          <div class="result-emoji">${disease.emoji}</div>
          <h3 class="result-title">${disease.disease}</h3>
          ${!isHealthy ? `<span class="severity-badge ${severityClass}">${disease.severity} Risk</span>` : ''}
          <p class="text-muted" style="margin-top: 0.5rem;">Detected on ${disease.crop}</p>
        </div>
        
        <div style="padding: 2rem;">
          <div class="gauge-container">
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle class="gauge-bg" cx="60" cy="60" r="54"></circle>
              <circle class="gauge-fill ${this.getGaugeClass(primary.confidence)}" cx="60" cy="60" r="54" stroke-dasharray="0 339.3" id="confidence-arc"></circle>
            </svg>
            <div class="gauge-text">
              <span class="gauge-perc">${(primary.confidence * 100).toFixed(0)}%</span>
              <span class="text-small text-muted">Match</span>
            </div>
          </div>
          
          <div class="prediction-bars">
            <h4 class="text-small text-muted" style="margin-bottom: 1rem;">Top Predictions</h4>
            ${topResults.map((r, i) => `
              <div class="bar-wrap">
                <div class="bar-label">
                  <span>${r.disease.disease}</span>
                  <span class="text-data">${(r.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="--target-width: ${r.confidence * 100}%" id="bar-${i}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="result-accordions">
          ${this.buildAccordions(disease)}
        </div>
        
        <div class="result-actions">
          <button class="btn btn-secondary" id="share-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share
          </button>
        </div>
      </div>
    `;

    this.panelEl.innerHTML = html;

    // Trigger animations
    requestAnimationFrame(() => {
      const arc = document.getElementById('confidence-arc');
      if (arc) arc.style.strokeDasharray = `${primary.confidence * 339.3} 339.3`;
      
      topResults.forEach((r, i) => {
        const bar = document.getElementById(`bar-${i}`);
        if (bar) {
          setTimeout(() => {
            bar.style.animation = 'bar-expand 0.6s ease forwards';
          }, i * 100);
        }
      });
    });

    document.dispatchEvent(new CustomEvent('result-ready', { 
      detail: { isHealthy: isHealthy, topResults: topResults } 
    }));
  }

  buildAccordions(disease) {
    if (disease.isHealthy) {
      return `
        <div class="accordion-item">
          <button class="accordion-trigger" aria-expanded="false" data-accordion-trigger>Plant Care Profile</button>
          <div class="accordion-content" data-accordion-content>
            <div class="accordion-inner">
              <p>${disease.description}</p>
              <h5 style="margin-top: 1rem; color: var(--text-primary);">Maintenance Tips</h5>
              <ul style="list-style: disc; padding-left: 1.5rem; margin-top: 0.5rem;">
                ${disease.prevention.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="accordion-item">
        <button class="accordion-trigger" aria-expanded="false" data-accordion-trigger>Symptoms & Causes</button>
        <div class="accordion-content" data-accordion-content>
          <div class="accordion-inner">
            <p><strong>Cause:</strong> ${disease.cause}</p>
            <p style="margin-top: 0.5rem;">${disease.description}</p>
            <p style="margin-top: 0.5rem;"><strong>Symptoms:</strong> ${disease.symptoms}</p>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <button class="accordion-trigger" aria-expanded="false" data-accordion-trigger>Treatment Guide</button>
        <div class="accordion-content" data-accordion-content>
          <div class="accordion-inner">
            <div style="padding: 1rem; background: rgba(57,255,110,0.1); border-left: 3px solid var(--biolum); margin-bottom: 1rem;">
              <strong>Immediate Action:</strong> ${disease.immediateAction}
            </div>
            ${disease.chemical ? `
              <h5 style="color: var(--text-primary);">Chemical Control</h5>
              <p><strong>Agent:</strong> ${disease.chemical.ingredient}</p>
              <p><strong>Rate:</strong> ${disease.chemical.rate}</p>
              <p style="margin-bottom: 1rem;"><strong>Freq:</strong> ${disease.chemical.frequency}</p>
            ` : ''}
            ${disease.organic ? `
              <h5 style="color: var(--text-primary);">Organic Control</h5>
              <p><strong>Remedy:</strong> ${disease.organic.remedy}</p>
              <p><strong>Apply:</strong> ${disease.organic.application}</p>
            ` : ''}
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <button class="accordion-trigger" aria-expanded="false" data-accordion-trigger>Prevention</button>
        <div class="accordion-content" data-accordion-content>
          <div class="accordion-inner">
            <ul style="list-style: disc; padding-left: 1.5rem;">
              ${disease.prevention.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <button class="accordion-trigger" aria-expanded="false" data-accordion-trigger>Weather Spread Risk <span id="weather-risk-badge"></span></button>
        <div class="accordion-content" data-accordion-content>
          <div class="accordion-inner" id="weather-risk-content">
            <p>Fetching local weather data...</p>
          </div>
        </div>
      </div>
    `;
  }

  renderLowConfidence() {
    this.panelEl.innerHTML = `
      <div class="result-card low-confidence-card">
        <div class="result-emoji" style="margin-bottom: 1rem;">🤔</div>
        <h3>Low Confidence Match</h3>
        <p class="text-muted">The model is less than 45% confident. Please try taking a better photo.</p>
        
        <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 1.5rem; margin-top: 1.5rem; text-align: left;">
          <h4 class="text-primary">Photography Tips</h4>
          <ul class="text-muted" style="list-style: disc; padding-left: 1.5rem; margin-top: 0.5rem;">
            <li>Ensure leaf fills 70% of frame</li>
            <li>Shoot in natural daylight — avoid shadows</li>
            <li>Keep camera steady, tap to focus before capture</li>
            <li>Use a plain background if possible</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderError(message) {
    this.panelEl.innerHTML = `
      <div class="result-card low-confidence-card" style="border-color: var(--danger-red);">
        <div class="result-emoji" style="margin-bottom: 1rem;">⚠️</div>
        <h3>Analysis Error</h3>
        <p class="text-muted">${message}</p>
      </div>
    `;
  }

  getGaugeClass(confidence) {
    if (confidence > 0.8) return 'gauge-high';
    if (confidence > 0.5) return 'gauge-mid';
    return 'gauge-low';
  }

  getCurrentResult() {
    return this.currentResult;
  }

  updateWeatherRisk(riskData) {
    if (!riskData) return;
    
    const badge = document.getElementById('weather-risk-badge');
    const content = document.getElementById('weather-risk-content');
    
    if (badge) {
      badge.innerHTML = `<span class="severity-badge severity-${riskData.risk}" style="margin-left: 0.5rem;">${riskData.risk} Risk</span>`;
    }
    
    if (content) {
      content.innerHTML = `
        <p>${riskData.message}</p>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <div style="background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: var(--radius-sm); flex: 1;">
            <div class="text-small text-muted">Humidity</div>
            <div class="text-primary font-mono">${riskData.humidity}%</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: var(--radius-sm); flex: 1;">
            <div class="text-small text-muted">Temperature</div>
            <div class="text-primary font-mono">${riskData.temp}°C</div>
          </div>
        </div>
      `;
    }
  }

  clear() {
    this.currentResult = null;
    this.panelEl.innerHTML = `
      <div class="empty-state">
        <img src="assets/icons/scan-icon.svg" alt="" class="empty-icon">
        <h3>Awaiting Scan</h3>
        <p>Results will appear here once the analysis is complete.</p>
      </div>
    `;
  }
}
