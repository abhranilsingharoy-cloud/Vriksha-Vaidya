// ── FILE: js/share.js ─────────────────────────────
export class ShareManager {
  async share(result, imageDataURL) {
    if (!result) return;
    
    const text = `Crop: ${result.disease.crop} | Disease: ${result.disease.disease} | Confidence: ${(result.confidence*100).toFixed(1)}% | Treatment: ${result.disease.immediateAction}`;
    
    const shareData = {
      title: `Vriksha Vaidya: ${result.disease.disease} detected`,
      text: text,
      url: window.location.href
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err);
          this.showCopyFallback(shareData.text);
        }
      }
    } else {
      this.showCopyFallback(shareData.text);
    }
  }

  showCopyFallback(text) {
    const oldModal = document.getElementById('share-fallback-modal');
    if (oldModal) oldModal.remove();

    const html = `
      <div id="share-fallback-modal" class="modal is-open" aria-hidden="false" role="dialog">
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-panel" style="padding: 2rem;">
          <h3 style="margin-bottom: 1rem;">Copy Result</h3>
          <textarea id="share-text-area" rows="4" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); margin-bottom: 1rem;">${text}</textarea>
          <div style="display: flex; gap: 1rem;">
            <button id="copy-text-btn" class="btn btn-primary" style="flex: 1;">Copy to Clipboard</button>
            <button id="close-share-btn" class="btn btn-secondary" style="flex: 1;">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const modal = document.getElementById('share-fallback-modal');
    const copyBtn = document.getElementById('copy-text-btn');
    const closeBtn = document.getElementById('close-share-btn');
    const textarea = document.getElementById('share-text-area');

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        copyBtn.textContent = 'Copied ✓';
        copyBtn.style.background = '#2d7a3a';
        setTimeout(() => {
          modal.remove();
        }, 1500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });

    closeBtn.addEventListener('click', () => modal.remove());
  }
}
