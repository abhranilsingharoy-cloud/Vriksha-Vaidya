// ── FILE: js/model-loader.js ─────────────────────────────
import { CONFIG } from './config.js';

export class ModelLoader {
  constructor(statusCallback) {
    this.statusCallback = statusCallback || (() => {});
  }

  async load() {
    try {
      this.statusCallback({ state: 'initializing', progress: 0, message: 'Setting up WebGL...' });
      
      try {
        await tf.setBackend('webgl');
      } catch(e) {
        console.warn('WebGL failed, trying WASM');
        try {
          await tf.setBackend('wasm');
        } catch(e2) {
          console.warn('WASM failed, trying CPU');
          await tf.setBackend('cpu');
        }
      }
      
      await tf.ready();
      
      let model;
      const modelUrl = CONFIG.MODEL_URL;
      const idbPath = `indexeddb://${CONFIG.MODEL_IDB_KEY}`;
      
      try {
        this.statusCallback({ state: 'checking_cache', progress: 10, message: 'Checking cache...' });
        model = await tf.loadLayersModel(idbPath);
        this.statusCallback({ state: 'cached', progress: 100, message: 'Model loaded from cache ✓' });
      } catch (e) {
        this.statusCallback({ state: 'downloading', progress: 20, message: 'Downloading model...' });
        
        // Simulating onProgress as tf.loadLayersModel native onProgress is sometimes unreliable
        // In a real setup, we would pass {onProgress: (frac) => ...} 
        model = await tf.loadLayersModel(modelUrl, {
          onProgress: (fraction) => {
            this.statusCallback({ 
              state: 'downloading', 
              progress: fraction * 100, 
              message: `Downloading model... ${Math.round(fraction * 100)}%` 
            });
          }
        });
        
        this.statusCallback({ state: 'saving', progress: 90, message: 'Saving to cache...' });
        try {
          await model.save(idbPath);
        } catch(saveErr) {
          console.warn('Could not save model to IndexedDB:', saveErr);
        }
      }

      this.statusCallback({ state: 'warming_up', progress: 95, message: 'Warming up model...' });
      
      // Warm up
      tf.tidy(() => {
        const dummy = tf.zeros([1, CONFIG.INPUT_SIZE, CONFIG.INPUT_SIZE, 3]);
        model.predict(dummy);
      });
      
      this.statusCallback({ state: 'ready', progress: 100, message: 'Model ready ✓' });
      return model;
      
    } catch (error) {
      console.error('Failed to load model:', error);
      this.statusCallback({ state: 'error', progress: 0, message: 'Failed to load AI model.' });
      throw error;
    }
  }

  getBackendInfo() {
    return tf.getBackend().toUpperCase();
  }
}
