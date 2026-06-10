// ── FILE: js/inference.js ─────────────────────────────
import { CLASS_LABELS, CONFIG } from './config.js';
import { DISEASE_DB } from './disease-db.js';

export async function runInference(model, imageElement) {
  if (!model) throw new Error("Model is not loaded yet.");

  return tf.tidy(() => {
    // Create a square offscreen canvas for resizing
    const canvas = new OffscreenCanvas(CONFIG.INPUT_SIZE, CONFIG.INPUT_SIZE);
    const ctx = canvas.getContext('2d');
    
    // Draw the image, cropping to fit the square (center crop)
    const minDim = Math.min(imageElement.width, imageElement.height);
    const startX = (imageElement.width - minDim) / 2;
    const startY = (imageElement.height - minDim) / 2;
    
    ctx.drawImage(
      imageElement, 
      startX, startY, minDim, minDim, 
      0, 0, CONFIG.INPUT_SIZE, CONFIG.INPUT_SIZE
    );

    // Tensor creation + normalization
    const imgTensor = tf.browser.fromPixels(canvas);
    
    // MobileNet expects inputs in range [-1, 1]
    const normalized = imgTensor
      .toFloat()
      .sub(127.5)
      .div(127.5)
      .expandDims(0); // [1, 224, 224, 3]

    // Forward pass
    const logits = model.predict(normalized);
    const probs = tf.softmax(logits);

    // Top-3 results
    const { values, indices } = tf.topk(probs, CONFIG.TOP_K);
    const topValues = Array.from(values.dataSync());
    const topIndices = Array.from(indices.dataSync());

    return topIndices.map((idx, i) => {
      const label = CLASS_LABELS[idx];
      return {
        label: label,
        disease: DISEASE_DB[label],
        confidence: topValues[i]
      };
    });
  });
}

export function validateConfidence(topResult) {
  if (topResult.confidence < CONFIG.CONFIDENCE_THRESHOLD) return 'low';
  if (topResult.confidence < 0.70) return 'uncertain';
  return 'confident';
}

export function checkMemoryLeak(before, after, callSite) {
  if (after.numTensors > before.numTensors + 2) {
    console.warn(`Tensor leak at ${callSite}: ${before.numTensors} → ${after.numTensors}`);
  }
}
