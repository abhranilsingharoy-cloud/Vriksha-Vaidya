# Vriksha Vaidya

Vriksha Vaidya is a comprehensive, visually stunning, multi-file plant disease detection website running entirely on the client-side. It utilizes TensorFlow.js for in-browser machine learning inference and Three.js for a beautiful, biopunk-inspired "Living Canopy" 3D background.

## Features
- **Offline Capable:** The entire inference runs inside the browser via WebGL/WASM. No data ever leaves the device.
- **38 Disease Classes:** Supports a wide range of crops including Apple, Cherry, Corn, Grape, Tomato, and more.
- **Biopunk Design System:** Neon bioluminescence and glassmorphism layered over a realtime 3D living canopy.
- **Local History & Encyclopedia:** Save previous scans, review past detections, and read actionable agricultural advice for 38 conditions.

## Setup
Because this project utilizes ES2022 Modules (`<script type="module">`), opening the `index.html` directly from the filesystem (`file:///`) may cause CORS issues depending on the browser. 

To run the project locally, serve the directory with a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js (if installed)
npx serve .
```

Then navigate to `http://localhost:8000` in your web browser.

## Technologies Used
- HTML5 / CSS3 (Custom Modules)
- Vanilla JavaScript (ES2022 Modules)
- TensorFlow.js 4.x
- Three.js r128
- MobileNetV3-Small (fine-tuned on PlantVillage)
