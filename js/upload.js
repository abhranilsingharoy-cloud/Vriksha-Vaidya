// ── FILE: js/upload.js ─────────────────────────────
export class UploadManager {
  constructor(dropZoneEl, fileInputEl, previewEl, clearBtn) {
    this.dropZoneEl = dropZoneEl;
    this.fileInputEl = fileInputEl;
    this.previewEl = previewEl;
    this.clearBtn = clearBtn;
    
    this.currentImageDataURL = null;
    this.imageElement = null;
  }

  init() {
    this.dropZoneEl.addEventListener('click', () => {
      if (!this.currentImageDataURL) this.fileInputEl.click();
    });

    this.fileInputEl.addEventListener('change', (e) => {
      if (e.target.files.length) this.handleFile(e.target.files[0]);
    });

    this.dropZoneEl.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZoneEl.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZoneEl.addEventListener('drop', this.handleDrop.bind(this));

    document.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.type.indexOf('image') === 0) {
          const blob = item.getAsFile();
          this.handleFile(blob);
          break;
        }
      }
    });

    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZoneEl.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZoneEl.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZoneEl.classList.remove('drag-over');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  handleFile(file) {
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  setPreview(dataURL) {
    this.currentImageDataURL = dataURL;
    this.previewEl.src = dataURL;
    this.previewEl.classList.remove('hidden');
    this.clearBtn.classList.remove('hidden');
    
    const content = this.dropZoneEl.querySelector('.drop-content');
    if (content) content.classList.add('hidden');
    
    const img = new Image();
    img.onload = () => {
      this.imageElement = img;
      document.dispatchEvent(new CustomEvent('image-ready', { detail: { image: img } }));
      
      const btn = document.getElementById('analyse-btn');
      if (btn) btn.disabled = false;
    };
    img.src = dataURL;
  }

  setFromCanvas(canvas) {
    this.setPreview(canvas.toDataURL('image/jpeg', 0.9));
  }

  clear() {
    this.currentImageDataURL = null;
    this.imageElement = null;
    this.previewEl.src = '';
    this.previewEl.classList.add('hidden');
    this.clearBtn.classList.add('hidden');
    this.fileInputEl.value = '';
    
    const content = this.dropZoneEl.querySelector('.drop-content');
    if (content) content.classList.remove('hidden');
    
    const btn = document.getElementById('analyse-btn');
    if (btn) btn.disabled = true;
    
    document.dispatchEvent(new CustomEvent('image-cleared'));
  }

  getImageElement() {
    return this.imageElement;
  }

  getImageDataURL() {
    return this.currentImageDataURL;
  }
}
