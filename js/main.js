// ── FILE: js/main.js ─────────────────────────────
import { CONFIG, CLASS_LABELS } from './config.js';
import { DISEASE_DB } from './disease-db.js';
import { ThreeScene } from './three-scene.js';
import { ModelLoader } from './model-loader.js';
import { runInference, validateConfidence, checkMemoryLeak } from './inference.js';
import { CameraManager } from './camera.js';
import { UploadManager } from './upload.js';
import { ResultsRenderer } from './results.js';
import { Accordion } from './accordion.js';
import { Encyclopedia } from './encyclopedia.js';
import { HistoryManager } from './history.js';
import { WeatherService } from './weather.js';
import { Navigation } from './navigation.js';
import { AnimationManager } from './animations.js';
import { ShareManager } from './share.js';
import { initSkipLink, announceToScreenReader } from './accessibility.js';
import { ChatBot } from './chat-ui.js';

async function init() {
  initSkipLink();

  const chatBot = new ChatBot();
  chatBot.init();

  const scene = new ThreeScene(document.getElementById('bg-canvas'));
  scene.init();

  const nav = new Navigation(document.getElementById('main-nav'));
  nav.init();

  const anim = new AnimationManager();
  anim.initScrollAnimations();

  const statusEl = document.getElementById('model-status');
  const statusText = statusEl.querySelector('.status-text');

  const loader = new ModelLoader((status) => {
    statusText.textContent = status.message;
    if (status.state === 'ready') {
      statusEl.classList.add('ready');
    }
  });

  let model = null;
  try {
    model = await loader.load();
  } catch(e) {
    statusText.textContent = "Offline Mode - Model failed to load.";
  }

  const upload = new UploadManager(
    document.getElementById('drop-zone'),
    document.getElementById('file-input'),
    document.getElementById('image-preview'),
    document.getElementById('clear-btn')
  );
  upload.init();

  const camera = new CameraManager(
    document.getElementById('camera-modal'),
    document.getElementById('camera-video'),
    document.getElementById('capture-btn'),
    document.getElementById('camera-close')
  );

  const results = new ResultsRenderer(
    document.getElementById('results-panel')
  );

  const encyclopedia = new Encyclopedia(
    document.getElementById('disease-grid'),
    document.getElementById('filter-bar'),
    document.getElementById('disease-search'),
    document.getElementById('disease-drawer')
  );
  encyclopedia.init();

  const history = new HistoryManager();
  history.renderTimeline(document.getElementById('history-timeline'));
  history.renderStats(document.getElementById('history-stats'));

  const weather = new WeatherService();
  const share = new ShareManager();

  // ── EVENT BINDING ────────────────────────────────────────

  document.getElementById('analyse-btn').addEventListener('click', async () => {
    const img = upload.getImageElement();
    if (!img) return;
    if (!model) {
      alert("AI Model is not loaded. Cannot perform inference.");
      return;
    }

    setAnalysingState(true);
    
    // Check tf memory before
    let memoryBefore;
    if (window.tf) memoryBefore = tf.memory();

    try {
      const topResults = await runInference(model, img);
      
      if (window.tf) checkMemoryLeak(memoryBefore, tf.memory(), 'analyse-btn');

      const confidence = validateConfidence(topResults[0]);
      results.render(topResults);
      
      // Init accordions in the newly rendered HTML
      const accordion = new Accordion(document.getElementById('results-panel'));
      accordion.init();
      
      // Bind share button
      const shareBtn = document.getElementById('share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          share.share(results.getCurrentResult(), upload.getImageDataURL());
        });
      }

      if (confidence !== 'low') {
        const isHealthy = topResults[0].disease.isHealthy;
        scene.triggerScanBurst(isHealthy);
        scene.setDiseaseMode(!isHealthy);

        const weatherRisk = await weather.getSpreadRisk(topResults[0].disease);
        results.updateWeatherRisk(weatherRisk);

        history.saveResult(upload.getImageDataURL(), topResults);
        history.renderTimeline(document.getElementById('history-timeline'));
        history.renderStats(document.getElementById('history-stats'));

        announceToScreenReader(
          `Diagnosis complete: ${topResults[0].disease.disease} detected with ${(topResults[0].confidence*100).toFixed(0)}% confidence.`
        );
      }
    } catch (err) {
      console.error('Inference error:', err);
      results.renderError(err.message || 'An unknown error occurred during inference.');
    } finally {
      setAnalysingState(false);
    }
  });

  document.getElementById('open-camera-btn').addEventListener('click', (e) => {
    camera.open(e.currentTarget);
  });

  document.getElementById('capture-btn').addEventListener('click', async () => {
    const canvas = await camera.capture();
    upload.setFromCanvas(canvas);
  });

  document.addEventListener('result-ready', (e) => {
    anim.triggerConfetti(document.getElementById('result-header'));
    if (e.detail.isHealthy) {
      anim.triggerHealthyRipple(document.getElementById('result-header'));
    }
  });

  document.addEventListener('history-changed', () => {
    history.renderStats(document.getElementById('history-stats'));
  });

  anim.animateCounters();
}

function setAnalysingState(loading) {
  const btn = document.getElementById('analyse-btn');
  if (btn) {
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    btn.textContent = loading ? 'Analysing…' : '🔬 Analyse Leaf';
  }
}

document.addEventListener('DOMContentLoaded', init);
