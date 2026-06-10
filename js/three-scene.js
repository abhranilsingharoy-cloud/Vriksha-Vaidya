// ── FILE: js/three-scene.js ─────────────────────────────
import { CONFIG } from './config.js';

export class ThreeScene {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    
    this.clock = new THREE.Clock();
    this.timeUniform = { value: 0 };
    
    this.terrainMesh = null;
    this.cropMesh = null;
    this.particles = null;
    this.diseaseMode = false;
    this.diseaseLight = null;
    
    this.mouseX = 0;
    this.targetCameraX = 0;
    
    this.resizeHandler = this.debounce(this.onWindowResize.bind(this), 250);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  init() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    } catch (e) {
      console.warn('WebGL not supported, falling back to CSS background');
      this.canvas.dispatchEvent(new Event('webgl-unavailable'));
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050d07, 0.04);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x39ff6e, 0.6);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    this.orbitingLight = new THREE.PointLight(0xf5a623, 1, 20);
    this.orbitingLight.position.set(0, 4, 0);
    this.scene.add(this.orbitingLight);

    this.buildTerrain();
    this.buildCrops();
    this.buildFruits();
    this.buildParticles();

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    });

    this.animate();
  }

  buildTerrain() {
    const geometry = new THREE.PlaneGeometry(200, 200, 128, 128);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: this.timeUniform,
        color1: { value: new THREE.Color(0x0a1a0e) },
        color2: { value: new THREE.Color(0x1a4d23) },
        isDiseased: { value: 0.0 }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vHeight;
        
        // Simple noise function
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          float noise = sin(pos.x * 0.2 + time * 0.5) * cos(pos.z * 0.2 + time * 0.3);
          pos.y += noise * 1.5;
          vHeight = pos.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float isDiseased;
        varying float vHeight;
        varying vec2 vUv;
        
        void main() {
          vec3 baseColor = mix(color1, color2, (vHeight + 1.5) / 3.0);
          vec3 diseaseColor = vec3(0.5, 0.2, 0.0);
          vec3 finalColor = mix(baseColor, diseaseColor, isDiseased * 0.5);
          
          // Faint grid lines
          float gridX = step(0.98, fract(vUv.x * 50.0));
          float gridY = step(0.98, fract(vUv.y * 50.0));
          finalColor += vec3(0.1) * (gridX + gridY);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      wireframe: false
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.terrainMesh);
  }

  buildCrops() {
    // Build Trunks (Make them tall enough to stick into the undulating terrain)
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.15, 3.5, 6);
    trunkGeo.translate(0, 0, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ 
      color: 0x3d2817,
      roughness: 0.9 
    });

    // Build Canopy/Leaves
    const leavesGeo = new THREE.DodecahedronGeometry(1.2, 0);
    leavesGeo.translate(0, 1.8, 0);
    const leavesMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d7a3a,
      roughness: 0.8,
      flatShading: true
    });

    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, CONFIG.PLANT_COUNT);
    const leavesMesh = new THREE.InstancedMesh(leavesGeo, leavesMat, CONFIG.PLANT_COUNT);
    
    const dummy = new THREE.Object3D();
    const offsetArray = new Float32Array(CONFIG.PLANT_COUNT);

    for (let i = 0; i < CONFIG.PLANT_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
      
      const scale = 0.6 + Math.random() * 0.8;
      dummy.scale.setScalar(scale);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      
      trunkMesh.setMatrixAt(i, dummy.matrix);
      
      // Slight rotation variation for the canopy
      dummy.rotation.y += Math.random();
      dummy.updateMatrix();
      leavesMesh.setMatrixAt(i, dummy.matrix);
      
      offsetArray[i] = Math.random() * Math.PI * 2;
    }

    trunkMesh.geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsetArray, 1));
    leavesMesh.geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsetArray, 1));
    
    this.cropMesh = trunkMesh;
    this.scene.add(trunkMesh);
    this.scene.add(leavesMesh);
  }

  buildFruits() {
    const geo = new THREE.SphereGeometry(0.12, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0xf5a623,
      emissive: 0xf5a623,
      emissiveIntensity: 0.3
    });
    
    this.fruits = new THREE.InstancedMesh(geo, mat, CONFIG.FRUIT_COUNT);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < CONFIG.FRUIT_COUNT; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 20,
        2.5 + Math.random() * 1.5,
        (Math.random() - 0.5) * 20
      );
      dummy.updateMatrix();
      this.fruits.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(this.fruits);
  }

  buildParticles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(CONFIG.PARTICLE_COUNT * 3);
    const seeds = new Float32Array(CONFIG.PARTICLE_COUNT);

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      seeds[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { time: this.timeUniform },
      vertexShader: `
        uniform float time;
        attribute float aSeed;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += time * 0.5 * (aSeed + 0.5);
          pos.y = mod(pos.y, 8.0);
          pos.x += sin(time + aSeed * 10.0) * 0.1;
          vAlpha = (sin(time * 3.0 + aSeed * 20.0) + 1.0) * 0.5;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (4.0 + aSeed * 4.0) * (10.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          gl_FragColor = vec4(0.22, 1.0, 0.43, vAlpha * (1.0 - dist * 2.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  triggerScanBurst(isHealthy) {
    const geo = new THREE.BufferGeometry();
    const count = 400;
    const pos = new Float32Array(count * 3);
    const vel = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      vel.push({
        x: Math.cos(theta) * Math.sin(phi) * (Math.random() * 0.2 + 0.1),
        y: Math.sin(theta) * Math.sin(phi) * (Math.random() * 0.2 + 0.1),
        z: Math.cos(phi) * (Math.random() * 0.2 + 0.1)
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const color = isHealthy ? 0x39ff6e : 0xff4444;
    const mat = new THREE.PointsMaterial({
      color: color,
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    points.position.set(0, 2, 8);
    this.scene.add(points);

    let frame = 0;
    const animateBurst = () => {
      frame++;
      const positions = points.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += vel[i].x;
        positions[i * 3 + 1] += vel[i].y;
        positions[i * 3 + 2] += vel[i].z;
      }
      points.geometry.attributes.position.needsUpdate = true;
      mat.opacity = 1 - (frame / 84); // 1.4s at 60fps
      
      if (frame < 84) {
        requestAnimationFrame(animateBurst);
      } else {
        this.scene.remove(points);
        geo.dispose();
        mat.dispose();
      }
    };
    animateBurst();
  }

  setDiseaseMode(active) {
    this.diseaseMode = active;
    
    if (active && !this.diseaseLight) {
      this.diseaseLight = new THREE.PointLight(0xff4444, 2, 15);
      this.diseaseLight.position.set(0, 3, 5);
      this.scene.add(this.diseaseLight);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    
    this.timeUniform.value = elapsed;

    this.targetCameraX = this.mouseX * 2;
    this.camera.position.x += (this.targetCameraX - this.camera.position.x) * 0.05;
    
    this.orbitingLight.position.x = Math.sin(elapsed * 0.5) * 10;
    this.orbitingLight.position.z = Math.cos(elapsed * 0.5) * 10;

    if (this.diseaseMode && this.diseaseLight) {
      this.diseaseLight.intensity = 1 + Math.sin(elapsed * 4) * 0.5;
    }
    
    if (this.terrainMesh) {
      const mat = this.terrainMesh.material;
      const targetDisease = this.diseaseMode ? 1.0 : 0.0;
      mat.uniforms.isDiseased.value += (targetDisease - mat.uniforms.isDiseased.value) * 0.02;
    }

    if (this.fruits) {
      this.fruits.rotation.y = elapsed * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
