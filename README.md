<div align="center">
  <img src="assets/icons/leaf-logo.svg" alt="Vriksha Vaidya Logo" width="120" />
  <h1>Vriksha Vaidya</h1>
  <p><strong>Advanced Offline AI for Plant Disease Detection</strong></p>

  <p>
    <a href="https://vriksha-vaidya.vercel.app/" target="_blank">View Live Demo</a>
    ·
    <a href="https://github.com/abhranilsingharoy-cloud/Vriksha-Vaidya/issues">Report Bug</a>
    ·
    <a href="https://github.com/abhranilsingharoy-cloud/Vriksha-Vaidya/issues">Request Feature</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/TensorFlow.js-Powered-FF6F00?logo=tensorflow" alt="TensorFlow.js">
    <img src="https://img.shields.io/badge/Three.js-WebGL-000000?logo=three.js" alt="Three.js">
  </p>
</div>

<hr />

## 📖 Overview

**Vriksha Vaidya** is a professional-grade, browser-native application designed to empower farmers and botanists with instantaneous plant disease diagnostics. Powered by an ultra-optimized MobileNet neural network running completely offline via **TensorFlow.js**, it can accurately detect up to 38 distinct plant diseases securely on your device.

Featuring a cutting-edge **3D Glassmorphic UI** built with WebGL and native CSS, Vriksha Vaidya delivers both blazing-fast AI inference and a visually stunning user experience—all without relying on a backend server.

---

## ✨ Core Features

* 🧠 **Zero-Latency Edge AI:** Real-time inference using TensorFlow.js (WASM / WebGL hardware acceleration).
* 🔒 **100% Privacy-First:** No images or data are ever uploaded to a server. Inference happens exclusively in your browser.
* 🌿 **Broad Botanical Coverage:** Detects **38 different classes** of plant conditions (healthy and diseased) across multiple crop species.
* 📱 **Progressive & Responsive:** Fully functional on mobile devices, tablets, and desktops with deep touch gesture support.
* 🌌 **Interactive 3D UI:** Engineered with Three.js environmental physics, deep CSS parallax rendering, and Vanilla-Tilt dynamics.
* 📚 **Disease Encyclopedia:** Comprehensive offline database providing symptoms, causes, and actionable treatment recommendations.
* 🗂️ **Local Storage History:** Automatically saves and tracks your past scans in the browser via IndexedDB and LocalStorage for future reference.

---

## 🛠️ Architecture & Tech Stack

Vriksha Vaidya is built to demonstrate the immense power of the modern open web, utilizing a pure vanilla stack strictly enforcing **Separation of Concerns**. No heavy frontend frameworks. No backend APIs.

* **Core Engine:** Vanilla JavaScript (ES6 Modules)
* **AI & Machine Learning:** TensorFlow.js (`@tensorflow/tfjs`)
* **Styling & Layout:** Modular Vanilla CSS3 (Custom Variables, Flexbox, Grid, Advanced Keyframes)
* **3D Visuals & Physics:** Three.js (r128), Vanilla-Tilt.js
* **Storage:** HTML5 LocalStorage & IndexedDB API

---

## 🚀 Getting Started

Because Vriksha Vaidya is entirely client-side, running it locally requires zero build steps or package managers. 

### Prerequisites
A modern web browser (Chrome, Edge, Firefox, Safari) and a simple local server to bypass standard CORS module restrictions.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhranilsingharoy-cloud/Vriksha-Vaidya.git
   cd Vriksha-Vaidya
   ```

2. **Serve locally:**
   You can use any local server. If you have Python installed:
   ```bash
   python -m http.server 8080
   ```
   Or using Node.js (`npx`):
   ```bash
   npx serve .
   ```

3. **Open the App:**
   Navigate to `http://localhost:8080` in your browser.

---

## 📂 Project Structure

```text
Vriksha-Vaidya/
├── index.html               # Main application entry point
├── assets/                  # Icons, SVGs, and brand images
├── css/                     # Modular styling system
│   ├── animations.css       # 3D transforms & CSS Keyframes
│   ├── components.css       # Buttons, badges, and shared UI elements
│   ├── layout.css           # Grid layouts and Glassmorphic panels
│   └── ...                  # Section-specific stylesheets
└── js/                      # Core Application Logic
    ├── config.js            # Global configuration and AI Model mapping
    ├── main.js              # Application bootstrapper
    ├── model-loader.js      # TensorFlow.js initialization and IDB caching
    ├── inference.js         # Vision tensor manipulation and forward pass logic
    ├── three-scene.js       # Three.js WebGL terrain rendering
    └── ...                  # Isolated modular logic (history, scanner, etc.)
```

---

## 🌐 Deployment

This project is inherently designed as a static site and is ready to be deployed to any static hosting provider like **Vercel**, **Netlify**, or **GitHub Pages**. 

For Vercel:
1. Import your GitHub repository to Vercel.
2. Select **"Other"** as the Framework Preset.
3. Click **Deploy**. Vercel will instantly host your app globally!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Developed By

**Abhranil Singha Roy**  
Passionate about bridging the gap between cutting-edge Artificial Intelligence and practical, accessible tools for the real world. 
