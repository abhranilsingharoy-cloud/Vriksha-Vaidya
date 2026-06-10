// ── FILE: js/camera.js ─────────────────────────────
export class CameraManager {
  constructor(modalEl, videoEl, captureBtn, closeBtn) {
    this.modalEl = modalEl;
    this.videoEl = videoEl;
    this.captureBtn = captureBtn;
    this.closeBtn = closeBtn;
    
    this.stream = null;
    this.track = null;
    this.triggerBtn = null; // element that opened the modal
    
    this.closeBtn.addEventListener('click', () => this.close());
  }

  async open(triggerEl = null) {
    if (triggerEl) this.triggerBtn = triggerEl;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      
      this.videoEl.srcObject = this.stream;
      this.track = this.stream.getVideoTracks()[0];
      
      this.modalEl.classList.add('is-open');
      this.modalEl.setAttribute('aria-hidden', 'false');
      
      // Trap focus in a real implementation via accessibility.js
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please ensure permissions are granted.');
    }
  }

  capture() {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoEl.videoWidth;
      canvas.height = this.videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.videoEl, 0, 0);
      
      this.close();
      resolve(canvas);
    });
  }

  async toggleTorch() {
    if (!this.track) return;
    
    const capabilities = this.track.getCapabilities();
    if (capabilities.torch) {
      const settings = this.track.getSettings();
      try {
        await this.track.applyConstraints({
          advanced: [{ torch: !settings.torch }]
        });
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  }

  close() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.track = null;
    }
    this.videoEl.srcObject = null;
    
    this.modalEl.classList.remove('is-open');
    this.modalEl.setAttribute('aria-hidden', 'true');
    
    if (this.triggerBtn) {
      this.triggerBtn.focus();
    }
  }
}
