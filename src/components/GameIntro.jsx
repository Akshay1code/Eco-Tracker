import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as THREE from 'three';

/**
 * Earth's Descent: A Cinematic Journey
 * v2 - 1080p Optimized: Canvas Earth Textures, Smooth Camera, No Per-Frame setState, Bloom Sim
 */
export default function GameIntro({ onComplete }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState('loading');
  const [skipVisible, setSkipVisible] = useState(false);
  const [awarenessText, setAwarenessText] = useState('');
  const [showAwarenessText, setShowAwarenessText] = useState(false);

  // All mutable animation state in refs — NO setState in rAF loop
  const currentSceneRef = useRef('loading');
  const showAwarenessTextRef = useRef(false);
  const loadingProgressRef = useRef(0);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

  // ─── Procedural Earth Textures (Canvas) ────────────────────────────────────
  const buildEarthTexture = (highQuality = true) => {
    const size = highQuality ? 2048 : 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    // Ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, size);
    oceanGrad.addColorStop(0, '#0a1e3b');
    oceanGrad.addColorStop(0.5, '#0d2a50');
    oceanGrad.addColorStop(1, '#071629');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, size);

    // Ocean shimmer lines
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < (highQuality ? 120 : 70); i++) {
      const y = Math.random() * size;
      const grad = ctx.createLinearGradient(0, y, size, y + 10);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, '#80DEEA');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, size, 2);
    }
    ctx.globalAlpha = 1;

    // Continent shapes using filled paths
    const drawContinent = (pts, col, roughness = 0.6) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * size, pts[0][1] * size);
      for (let i = 1; i < pts.length; i++) {
        const mx = ((pts[i - 1][0] + pts[i][0]) / 2) * size;
        const my = ((pts[i - 1][1] + pts[i][1]) / 2) * size;
        ctx.quadraticCurveTo(pts[i - 1][0] * size + (Math.random() - 0.5) * 40 * roughness, pts[i - 1][1] * size + (Math.random() - 0.5) * 40 * roughness, mx, my);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    };

    // Americas
    drawContinent([[0.05,0.12],[0.18,0.08],[0.22,0.18],[0.25,0.35],[0.20,0.50],[0.15,0.60],[0.20,0.72],[0.18,0.85],[0.10,0.88],[0.06,0.78],[0.10,0.62],[0.05,0.48],[0.03,0.30],[0.02,0.18]], '#2d5a1b', 0.8);
    drawContinent([[0.05,0.12],[0.18,0.08],[0.22,0.18],[0.25,0.35],[0.20,0.50],[0.15,0.60],[0.10,0.62],[0.05,0.48],[0.03,0.30],[0.02,0.18]], '#3d6e2c');
    // Eurasia
    drawContinent([[0.35,0.08],[0.60,0.06],[0.82,0.12],[0.90,0.22],[0.88,0.38],[0.78,0.48],[0.62,0.52],[0.48,0.50],[0.38,0.42],[0.32,0.30],[0.33,0.18]], '#4a7a30', 0.7);
    drawContinent([[0.35,0.08],[0.60,0.06],[0.82,0.12],[0.90,0.22],[0.88,0.38],[0.78,0.48],[0.62,0.52],[0.48,0.50],[0.38,0.42],[0.32,0.30],[0.33,0.18]], '#3d6e2c', 0.9);
    // Africa
    drawContinent([[0.43,0.38],[0.55,0.35],[0.62,0.45],[0.64,0.58],[0.58,0.72],[0.50,0.78],[0.42,0.72],[0.38,0.58],[0.40,0.46]], '#5a8c2a');
    // Mountains overlay
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < (highQuality ? 18 : 10); i++) {
      const x = Math.random() * size, y = Math.random() * size * 0.7;
      const r = 20 + Math.random() * 50;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, '#8B7355');
      grad.addColorStop(0.5, '#6b5a3e');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Icecaps
    ctx.fillStyle = '#d8eaf5';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, size, size * 0.055);
    ctx.fillRect(0, size * 0.92, size, size * 0.08);
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(c);
  };

  const buildCloudTexture = (highQuality = true) => {
    const size = highQuality ? 1024 : 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < (highQuality ? 200 : 120); i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const rx = 30 + Math.random() * 80, ry = 15 + Math.random() * 30;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  };

  const buildNightTexture = (highQuality = true) => {
    const size = highQuality ? 1024 : 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    // City light clusters
    const clusters = [[0.15,0.35],[0.42,0.25],[0.65,0.20],[0.72,0.35],[0.50,0.45],[0.22,0.55],[0.08,0.28]];
    clusters.forEach(([cx, cy]) => {
      for (let i = 0; i < (highQuality ? 60 : 35); i++) {
        const x = cx * size + (Math.random() - 0.5) * size * 0.12;
        const y = cy * size + (Math.random() - 0.5) * size * 0.08;
        const col = ['#ffffc8','#ffee88','#ffe0a0','#80DEEA'][Math.floor(Math.random() * 4)];
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    });
    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(c);
  };

  const buildSpecularTexture = (highQuality = true) => {
    const size = highQuality ? 1024 : 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    // Default: shiny (ocean)
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    // Land areas: matte
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size * 0.28, size); // Americas
    ctx.fillRect(size * 0.33, 0, size * 0.58, size * 0.8); // Eurasia/Africa
    return new THREE.CanvasTexture(c);
  };

  // Procedural city-surrounding terrain. Center stays flatter so roads/buildings fit naturally.
  const buildCityTerrain = (highQuality = true) => {
    const terrainSize = highQuality ? 12000 : 9000;
    const terrainSegments = highQuality ? 180 : 120;
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    const pos = geometry.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);

    const fract = (v) => v - Math.floor(v);
    const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);
    const valueNoise2D = (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const a = hash(xi, yi);
      const b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1);
      const d = hash(xi + 1, yi + 1);
      const ux = smooth(xf);
      const uy = smooth(yf);
      const x1 = lerp(a, b, ux);
      const x2 = lerp(c, d, ux);
      return lerp(x1, x2, uy);
    };
    const fbm = (x, y, oct = 5) => {
      let v = 0;
      let amp = 0.6;
      let freq = 1;
      let sum = 0;
      for (let i = 0; i < oct; i++) {
        v += valueNoise2D(x * freq, y * freq) * amp;
        sum += amp;
        amp *= 0.5;
        freq *= 2;
      }
      return v / Math.max(sum, 0.0001);
    };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const dist = Math.sqrt(x * x + z * z);

      const broad = fbm(x * 0.00055, z * 0.00055, 5) * 260;
      const detail = fbm(x * 0.0022, z * 0.0022, 4) * 55;
      let height = broad + detail - 120;

      const cityFlatten = 1 - THREE.MathUtils.smoothstep(dist, 1200, 2700);
      height = THREE.MathUtils.lerp(height, -6, cityFlatten * 0.95);
      pos.setZ(i, height);

      const h = height;
      let r = 0.20, g = 0.28, b = 0.17; // dark grass
      if (h > 80) { r = 0.34; g = 0.37; b = 0.30; } // rock
      if (h > 150) { r = 0.58; g = 0.60; b = 0.62; } // high ridges
      if (h < -18) { r = 0.16; g = 0.22; b = 0.16; } // low wetland

      const ci = i * 3;
      colors[ci] = r;
      colors[ci + 1] = g;
      colors[ci + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  };

  // ─── THREE.js Scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const qualityTier = isMobile || cores <= 4 || memory <= 4 ? 'balanced' : 'high';
    const qualityScale = qualityTier === 'high' ? 1 : 0.72;

    const skyColor = new THREE.Color(0x010510);
    const descentFog = new THREE.FogExp2(skyColor.clone(), 0);
    const viewVec = new THREE.Vector3();
    const smokeWorldPos = new THREE.Vector3();

    const scene = new THREE.Scene();
    scene.background = skyColor;
    scene.fog = descentFog;

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 20000);
    const camTarget = new THREE.Vector3(); // smooth target
    const camPos = new THREE.Vector3();    // smooth position

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', precision: 'highp' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // For 1080p: force full pixel ratio, cap at 2 for perf
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityTier === 'high' ? 1.75 : 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // ── Enhanced Lighting ──
    const sunLight = new THREE.DirectionalLight(0xffcc88, 8.0);
    sunLight.position.set(600, 300, 600);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(qualityTier === 'high' ? 2048 : 1024, qualityTier === 'high' ? 2048 : 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 3000;
    sunLight.shadow.bias = -0.0002;
    sunLight.shadow.normalBias = 0.01;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x2255aa, 1.2);
    fillLight.position.set(-400, -100, -400);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x112244, 0.8);
    scene.add(ambientLight);

    const auroraLight = new THREE.PointLight(0x00ffc8, 3.0, 3000);
    auroraLight.position.set(-1000, 500, -1000);
    scene.add(auroraLight);

    // Additional rim lighting for Earth
    const rimLight = new THREE.DirectionalLight(0x4488ff, 2.5);
    rimLight.position.set(800, 200, -800);
    scene.add(rimLight);

    // Atmospheric volumetric lighting simulation
    const atmosLight = new THREE.PointLight(0x80DEEA, 1.5, 2000);
    atmosLight.position.set(0, 0, -800);
    scene.add(atmosLight);

    // ── Nebula Background ──
    const nebulaGroup = new THREE.Group();
    const nebulaCols = [0x1a2847, 0x2e4374, 0x003d33];
    nebulaCols.forEach(col => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(9000, qualityTier === 'high' ? 28 : 20, qualityTier === 'high' ? 28 : 20),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending })
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      nebulaGroup.add(mesh);
    });
    scene.add(nebulaGroup);

    // ── Stars (two layers: small & large) ──
    const makeStarField = (count, size, spread, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const r = spread[0] + Math.random() * (spread[1] - spread[0]);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.5 + Math.random() * size;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      const mat = new THREE.PointsMaterial({ color: col, size, transparent: true, sizeAttenuation: true, opacity: 1 });
      return new THREE.Points(geo, mat);
    };
    const starsSmall = makeStarField(Math.floor(5000 * qualityScale), 1.5, [5000, 9000], 0xaabbcc);
    const starsBright = makeStarField(Math.floor(800 * qualityScale), 3.5, [4000, 7000], 0xffffff);
    const starsGroup = new THREE.Group();
    starsGroup.add(starsSmall, starsBright);
    scene.add(starsGroup);

    // ── High-Fidelity Earth ──
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, 0, -800);

    const highQuality = qualityTier === 'high';
    const earthTex = buildEarthTexture(highQuality);
    const cloudTex = buildCloudTexture(highQuality);
    const nightTex = buildNightTexture(highQuality);
    const specTex  = buildSpecularTexture(highQuality);

    // Earth sphere — high segment count for 1080p
    const earthGeo = new THREE.SphereGeometry(100, qualityTier === 'high' ? 96 : 72, qualityTier === 'high' ? 96 : 72);
    // Enhanced Earth material with better lighting response
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      specularMap: specTex,
      specular: new THREE.Color(0x4488aa),
      shininess: 45,
      emissiveMap: nightTex,
      emissive: new THREE.Color(0xffa040),
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Cloud layer
    const cloudGeo = new THREE.SphereGeometry(101.8, qualityTier === 'high' ? 72 : 48, qualityTier === 'high' ? 72 : 48);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      alphaMap: cloudTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Atmosphere glow shader (fresnel)
    const atmosphereVS = `
      uniform vec3 viewVector;
      uniform float power;
      uniform float time;
      varying float fresnel;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        vec3 vView   = normalize(normalMatrix * viewVector);
        fresnel = pow(1.0 - abs(dot(vNormal, vView)), power);
        fresnel *= 1.0 + sin(time * 0.5) * 0.1; // Subtle pulsing
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const atmosphereFS = `
      uniform vec3 glowColor;
      uniform float time;
      varying float fresnel;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float rim = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
        vec3 color = glowColor * fresnel + glowColor * rim * 0.3;
        float alpha = fresnel * 0.9 + rim * 0.2;
        gl_FragColor = vec4(color, alpha);
      }
    `;
    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: { value: new THREE.Vector3() },
        glowColor:  { value: new THREE.Color(0x55aaff) },
        power:      { value: 2.8 },
        time:       { value: 0 }
      },
      vertexShader: atmosphereVS,
      fragmentShader: atmosphereFS,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(108, qualityTier === 'high' ? 48 : 36, qualityTier === 'high' ? 48 : 36), atmosMat);
    earthGroup.add(atmosphere);

    // Outer glow (back-face, larger)
    const outerGlowMat = atmosMat.clone();
    outerGlowMat.uniforms = {
      viewVector: { value: new THREE.Vector3() },
      glowColor:  { value: new THREE.Color(0x80DEEA) },
      power:      { value: 4.0 },
      time:       { value: 0 }
    };
    outerGlowMat.side = THREE.BackSide;
    const outerGlow = new THREE.Mesh(new THREE.SphereGeometry(115, qualityTier === 'high' ? 48 : 36, qualityTier === 'high' ? 48 : 36), outerGlowMat);
    earthGroup.add(outerGlow);

    scene.add(earthGroup);

    // ── Sun shadow — high-quality frustum tuned for city scale ──
    sunLight.shadow.mapSize.set(qualityTier === 'high' ? 2048 : 1024, qualityTier === 'high' ? 2048 : 1024);
    sunLight.shadow.camera.near   = 10;
    sunLight.shadow.camera.far    = 6000;
    sunLight.shadow.camera.left   = -2200;
    sunLight.shadow.camera.right  =  2200;
    sunLight.shadow.camera.top    =  2200;
    sunLight.shadow.camera.bottom = -2200;
    sunLight.shadow.bias          = -0.0003;
    sunLight.shadow.normalBias    =  0.02;
    // Low golden-hour angle — long dramatic shadows
    sunLight.position.set(1800, 400, 800);

    // ── Pollution Ring ──
    const pollutionGroup = new THREE.Group();
    pollutionGroup.position.copy(earthGroup.position);
    const pollutionParticles = [];
    const pollGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    for (let i = 0; i < Math.floor(350 * qualityScale); i++) {
      const r   = 126 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.PI / 2 + (Math.random() - 0.5) * 0.55;
      const col = [0x3a332a, 0x2a2520, 0x4a3a28][i % 3];
      const p = new THREE.Mesh(pollGeo, new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0, roughness: 1 }));
      p.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      pollutionParticles.push({ mesh: p, theta, r, phi, speed: 0.1 + Math.random() * 0.35 });
      pollutionGroup.add(p);
    }
    scene.add(pollutionGroup);

    // ── City ──
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -800);
    cityGroup.visible = false;

    // ── Canvas textures ──
    const makeWindowTex = (cols, rows, litFrac) => {
      const tw = 256, th = 512;
      const cv = document.createElement('canvas');
      cv.width = tw; cv.height = th;
      const cx = cv.getContext('2d');
      cx.fillStyle = '#0a0e1a';
      cx.fillRect(0, 0, tw, th);
      const cw = tw / cols, ch = th / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > litFrac) continue;
          cx.fillStyle = Math.random() > 0.4 ? '#ffee90' : '#a0e8ff';
          cx.globalAlpha = 0.55 + Math.random() * 0.45;
          cx.fillRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
        }
      }
      cx.globalAlpha = 1;
      return new THREE.CanvasTexture(cv);
    };

    const makeRoadTex = () => {
      const s = 512;
      const cv = document.createElement('canvas');
      cv.width = s; cv.height = s;
      const cx = cv.getContext('2d');
      cx.fillStyle = '#141414';
      cx.fillRect(0, 0, s, s);
      for (let i = 0; i < 3000; i++) {
        const gv = 60 + Math.random() * 30 | 0;
        cx.fillStyle = `rgba(${gv},${gv},${gv},0.25)`;
        cx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
      }
      cx.strokeStyle = '#c8a800'; cx.lineWidth = 3; cx.setLineDash([]);
      cx.beginPath(); cx.moveTo(s * 0.49, 0); cx.lineTo(s * 0.49, s); cx.stroke();
      cx.beginPath(); cx.moveTo(s * 0.51, 0); cx.lineTo(s * 0.51, s); cx.stroke();
      cx.strokeStyle = '#e8e8e8'; cx.lineWidth = 2; cx.setLineDash([30, 30]);
      [0.25, 0.75].forEach(lx => {
        cx.beginPath(); cx.moveTo(s * lx, 0); cx.lineTo(s * lx, s); cx.stroke();
      });
      cx.setLineDash([]);
      return new THREE.CanvasTexture(cv);
    };

    const makeSidewalkTex = () => {
      const s = 256;
      const cv = document.createElement('canvas');
      cv.width = s; cv.height = s;
      const cx = cv.getContext('2d');
      cx.fillStyle = '#2a2a2a'; cx.fillRect(0, 0, s, s);
      cx.strokeStyle = '#1a1a1a'; cx.lineWidth = 1;
      for (let x = 0; x <= s; x += 32) { cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,s); cx.stroke(); }
      for (let y = 0; y <= s; y += 32) { cx.beginPath(); cx.moveTo(0,y); cx.lineTo(s,y); cx.stroke(); }
      return new THREE.CanvasTexture(cv);
    };

    const roadTex     = makeRoadTex();
    const sidewalkTex = makeSidewalkTex();
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.set(1, 8);
    sidewalkTex.wrapS = sidewalkTex.wrapT = THREE.RepeatWrapping; sidewalkTex.repeat.set(4, 20);

    // Ground
    const cityGround = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.98 })
    );
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.receiveShadow = true;
    cityGroup.add(cityGround);

    // Procedural outskirts terrain around the city block.
    const terrainGeometry = buildCityTerrain(highQuality);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.94,
      metalness: 0.04,
      envMapIntensity: 0.2,
    });
    const cityTerrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    cityTerrain.rotation.x = -Math.PI / 2;
    cityTerrain.position.y = -8;
    cityTerrain.receiveShadow = true;
    cityGroup.add(cityTerrain);

    // Roads + sidewalks + curbs + crosswalk stripes
    const roadW = 28, swW = 8;
    const roadsideOffsetBase = roadW / 2 + swW + 2;
    const roadMat3D = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.92, metalness: 0.02 });
    const swMat     = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.85, color: 0x333333 });
    const curbMat   = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });

    const gridHalf = qualityTier === 'high' ? 12 : 9;
    for (let i = -gridHalf; i <= gridHalf; i++) {
      const gz = i * 100;
      const road = new THREE.Mesh(new THREE.PlaneGeometry(6000, roadW), roadMat3D);
      road.rotation.x = -Math.PI / 2; road.position.set(0, 0.15, gz); road.receiveShadow = true;
      cityGroup.add(road);
      const roadV = new THREE.Mesh(new THREE.PlaneGeometry(roadW, 6000), roadMat3D);
      roadV.rotation.x = -Math.PI / 2; roadV.position.set(gz, 0.15, 0); roadV.receiveShadow = true;
      cityGroup.add(roadV);
      [-1, 1].forEach(side => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(6000, 0.3, swW), swMat);
        sw.position.set(0, 0.15, gz + side * (roadW / 2 + swW / 2)); sw.receiveShadow = true;
        cityGroup.add(sw);
        const swV = new THREE.Mesh(new THREE.BoxGeometry(swW, 0.3, 6000), swMat);
        swV.position.set(gz + side * (roadW / 2 + swW / 2), 0.15, 0);
        cityGroup.add(swV);
        const curb = new THREE.Mesh(new THREE.BoxGeometry(6000, 0.5, 1.2), curbMat);
        curb.position.set(0, 0.25, gz + side * (roadW / 2));
        cityGroup.add(curb);
      });
      if (qualityTier === 'high' && i % 2 === 0) {
        for (let j = -gridHalf; j <= gridHalf; j += 2) {
          for (let s = 0; s < 3; s++) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(roadW * 0.82, 1.6), stripeMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(j * 100, 0.2, gz - roadW * 0.28 + s * 3.3);
            cityGroup.add(stripe);
          }
        }
      }
    }

    // Buildings
    const windowMats = [];
    const windowTexPool = Array.from({ length: qualityTier === 'high' ? 10 : 6 }, (_, idx) =>
      makeWindowTex(8 + (idx % 5), 16 + (idx % 6), qualityTier === 'high' ? 0.68 : 0.62)
    );
    const bStyles = [
      { body: 0x1a2535, m: 0.82, r: 0.12 },
      { body: 0x2c1e14, m: 0.05, r: 0.80 },
      { body: 0x141c28, m: 0.90, r: 0.08 },
      { body: 0x1e2b1e, m: 0.20, r: 0.65 },
    ];

    const buildingCount = qualityTier === 'high' ? 420 : 240;
    for (let i = 0; i < buildingCount; i++) {
      const sty   = bStyles[i % bStyles.length];
      const isTow = i < 60;
      const w = isTow ? 20 + Math.random() * 22 : 12 + Math.random() * 24;
      const d = isTow ? 20 + Math.random() * 22 : 12 + Math.random() * 24;
      const h = isTow ? 120 + Math.random() * 260 : 18 + Math.random() * 90;
      const blockSpan = Math.max(18, 100 - roadW - swW * 2 - 10);
      const cellX = (Math.floor(Math.random() * (gridHalf * 2 + 1)) - gridHalf) * 100;
      const cellZ = (Math.floor(Math.random() * (gridHalf * 2 + 1)) - gridHalf) * 100;
      const alongXRoad = Math.random() > 0.5;
      const side = Math.random() > 0.5 ? 1 : -1;
      const edgeOffset = roadsideOffsetBase + (alongXRoad ? d : w) * 0.5 + Math.random() * 6;
      const bx = alongXRoad
        ? cellX + side * edgeOffset
        : cellX + (Math.random() - 0.5) * blockSpan;
      const bz = alongXRoad
        ? cellZ + (Math.random() - 0.5) * blockSpan
        : cellZ + side * edgeOffset;

      const bg = new THREE.Group();
      bg.position.set(bx, 0, bz);

      const podH = Math.min(h * 0.18, 22);
      const pod  = new THREE.Mesh(new THREE.BoxGeometry(w * 1.35, podH, d * 1.35),
        new THREE.MeshStandardMaterial({ color: sty.body, roughness: sty.r + 0.1, metalness: sty.m - 0.1 }));
      pod.position.y = podH / 2; pod.castShadow = qualityTier === 'high' && i < 120; pod.receiveShadow = true;
      bg.add(pod);

      const shaftMat = new THREE.MeshStandardMaterial({ color: sty.body, roughness: sty.r, metalness: sty.m });
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), shaftMat);
      shaft.position.y = podH + h / 2; shaft.castShadow = qualityTier === 'high' && i < 120; shaft.receiveShadow = true;
      bg.add(shaft);

      if (isTow && h > 150) {
        const tH = h * 0.35, tY = podH + h * 0.62;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, tH, d * 0.7), shaftMat.clone());
        tier.position.y = tY + tH / 2; tier.castShadow = qualityTier === 'high' && i < 120;
        bg.add(tier);
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.5, h * 0.12, 6),
          new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.1 }));
        spire.position.y = tY + tH + h * 0.06; spire.castShadow = qualityTier === 'high' && i < 120;
        bg.add(spire);
      }

      // Window textures on all 4 faces
      const wTex = windowTexPool[i % windowTexPool.length];
      [[0, podH + h / 2, d / 2 + 0.2, 0],
       [0, podH + h / 2, -(d / 2 + 0.2), Math.PI],
       [w / 2 + 0.2, podH + h / 2, 0, -Math.PI / 2],
       [-(w / 2 + 0.2), podH + h / 2, 0, Math.PI / 2]
      ].forEach(([fx, fy, fz, ry]) => {
        const wm = new THREE.MeshBasicMaterial({ map: wTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        windowMats.push(wm);
        const wf = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm);
        wf.position.set(fx, fy, fz); wf.rotation.y = ry;
        bg.add(wf);
      });

      // Rooftop details
      const rY = podH + h;
      for (let r = 0; r < (qualityTier === 'high' ? (2 + Math.random() * 3 | 0) : (1 + Math.random() * 2 | 0)); r++) {
        const ac = new THREE.Mesh(new THREE.BoxGeometry(2.5 + Math.random() * 3, 1.5, 2 + Math.random() * 2),
          new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 }));
        ac.position.set((Math.random() - 0.5) * w * 0.7, rY + 0.75, (Math.random() - 0.5) * d * 0.7);
        bg.add(ac);
      }
      if (Math.random() > 0.75 && !isTow) {
        const wt = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 5, 8),
          new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.9 }));
        wt.position.set((Math.random() - 0.5) * w * 0.5, rY + 2.5, (Math.random() - 0.5) * d * 0.5);
        bg.add(wt);
        const wtR = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0x6B4F10, roughness: 0.9 }));
        wtR.position.set(wt.position.x, rY + 6.5, wt.position.z);
        bg.add(wtR);
      }
      if (Math.random() > 0.6) {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 8 + Math.random() * 10, 4),
          new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 }));
        ant.position.set(0, rY + 5, 0);
        bg.add(ant);
      }
      const prt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 1.2, d + 0.6),
        new THREE.MeshStandardMaterial({ color: sty.body, roughness: 0.6 }));
      prt.position.y = rY + 0.6;
      bg.add(prt);

      cityGroup.add(bg);
    }

    // Detailed vehicles
    const vehicles = [];
    const carShadowEnabled = qualityTier === 'high' && !isMobile;
    const makeCar = (bodyColor, type, isRed) => {
      const g = new THREE.Group();
      const sp = [
        { bw: 4.6, bh: 1.0, bd: 9.0, rh: 0.9, rOff: -0.3 },
        { bw: 5.0, bh: 1.2, bd: 9.5, rh: 1.2, rOff:  0.0 },
        { bw: 5.2, bh: 1.0, bd: 14,  rh: 0.8, rOff:  1.8 },
        { bw: 5.0, bh: 1.5, bd: 10,  rh: 1.5, rOff:  0.0 },
      ][type];
      const bMat = new THREE.MeshStandardMaterial({
        color: bodyColor, roughness: 0.25, metalness: 0.82,
        emissive: isRed ? 0x330000 : 0, emissiveIntensity: isRed ? 0.3 : 0
      });
      const gMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55 });
      const tMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
      const rMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.9, roughness: 0.2 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(sp.bw, sp.bh, sp.bd), bMat);
      body.position.y = sp.bh / 2 + 1.2; body.castShadow = carShadowEnabled; body.receiveShadow = true;
      g.add(body);

      if (type !== 2) {
        const cab = new THREE.Mesh(new THREE.BoxGeometry(sp.bw * 0.82, sp.rh, sp.bd * 0.52), bMat.clone());
        cab.position.set(0, sp.bh + sp.rh / 2 + 1.2, sp.rOff); cab.castShadow = carShadowEnabled;
        g.add(cab);
        const ws = new THREE.Mesh(new THREE.PlaneGeometry(sp.bw * 0.78, sp.rh * 0.88), gMat);
        ws.position.set(0, sp.bh + sp.rh / 2 + 1.2, sp.rOff + sp.bd * 0.26 + 0.05);
        ws.rotation.x = 0.18 * Math.PI / 2;
        g.add(ws);
        const wsR = ws.clone();
        wsR.position.z = sp.rOff - sp.bd * 0.26 - 0.05; wsR.rotation.x = -0.18 * Math.PI / 2;
        g.add(wsR);
      }
      [[-sp.bw/2-0.15,1.0, sp.bd*0.33],[sp.bw/2+0.15,1.0,sp.bd*0.33],
       [-sp.bw/2-0.15,1.0,-sp.bd*0.33],[sp.bw/2+0.15,1.0,-sp.bd*0.33]].forEach(([wx,wy,wz]) => {
        const ti = new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.7,16), tMat);
        ti.rotation.z = Math.PI/2; ti.position.set(wx,wy,wz); ti.castShadow = carShadowEnabled;
        g.add(ti);
        const ri = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.75,8), rMat);
        ri.rotation.z = Math.PI/2; ri.position.set(wx,wy,wz);
        g.add(ri);
      });
      [-sp.bw*0.32, sp.bw*0.32].forEach(hx => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.5,0.3), new THREE.MeshBasicMaterial({ color: 0xffffee }));
        hl.position.set(hx, sp.bh/2+1.2, sp.bd/2+0.1); g.add(hl);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.4,0.3), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
        tl.position.set(hx, sp.bh/2+1.2, -sp.bd/2-0.1); g.add(tl);
      });
      const und = new THREE.Mesh(new THREE.BoxGeometry(sp.bw*0.88,0.4,sp.bd*0.88),
        new THREE.MeshStandardMaterial({ color: 0x080808 }));
      und.position.y = 0.9; g.add(und);
      return g;
    };

    const carPalette = [0xc0392b,0x2980b9,0x27ae60,0xf39c12,0x8e44ad,0x2c3e50,0xecf0f1,0x1abc9c,0x34495e,0xe67e22];
    for (let i = 0; i < (qualityTier === 'high' ? 170 : 90); i++) {
      const isRed = i === 0;
      const type  = isRed ? 3 : Math.floor(Math.random() * 4);
      const col   = isRed ? 0xff0000 : carPalette[Math.floor(Math.random() * carPalette.length)];
      const vg    = makeCar(col, type, isRed);
      const lane  = (Math.floor(Math.random() * 26) - 13) * 100 + (Math.random() > 0.5 ? 7 : -7);
      vg.position.set(lane, 0, (Math.random() - 0.5) * 5500);
      vehicles.push({ mesh: vg, speed: 2.2 + Math.random() * 3.8, isRed });
      cityGroup.add(vg);
    }
    const redVan = vehicles[0].mesh;

    // Street lights
    const poleMat2 = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 });
    const bulbMat2 = new THREE.MeshBasicMaterial({ color: 0xffe88a });
    const lightStep = qualityTier === 'high' ? 3 : 4;
    for (let i = -12; i <= 12; i += lightStep) {
      for (let j = -12; j <= 12; j += lightStep) {
        const px = i * 100 + 18, pz = j * 100 + 18;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.3,18,6), poleMat2);
        pole.position.set(px,9,pz); pole.castShadow = true;
        cityGroup.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(5,0.3,0.3), poleMat2);
        arm.position.set(px+2.5,18.2,pz); cityGroup.add(arm);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8), bulbMat2);
        bulb.position.set(px+5,17.5,pz); cityGroup.add(bulb);
        if (qualityTier === 'high' && (i + j) % 9 === 0) {
          const lamp = new THREE.PointLight(0xffe0a0, 0.9, 140);
          lamp.position.set(px+5,17,pz); cityGroup.add(lamp);
        }
      }
    }

    // Industrial zone
    const industrialZone = new THREE.Group();
    industrialZone.position.set(-1200, 0, -800);
    for (let i = 0; i < 12; i++) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(250, 60, 180),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
      f.position.set(0, 30, i * 220); f.castShadow = true; f.receiveShadow = true;
      industrialZone.add(f);
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(10, 13, 110, 16),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 }));
      chimney.position.set(0, 85, 0); chimney.castShadow = true;
      f.add(chimney);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(10.5,10.5,4,16),
        new THREE.MeshStandardMaterial({ color: 0xcc2200 }));
      band.position.y = 30; chimney.add(band);
    }

    const smokeParticles = [];
    const smokeGeo = new THREE.SphereGeometry(2.5, 8, 8);
    for (let i = 0; i < (qualityTier === 'high' ? 420 : 260); i++) {
      const s = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0 }));
      smokeParticles.push({
        mesh: s, life: Math.random() * 5, maxLife: 3 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 1.2, vy: 1.5 + Math.random() * 3.5, vz: (Math.random() - 0.5) * 1.2,
        stackIdx: Math.floor(Math.random() * 12)
      });
      cityGroup.add(s);
    }
    cityGroup.add(industrialZone);
    scene.add(cityGroup);

    // ── Simulated Bloom (additive glow pass via extra render) ──
    // We render bloom-worthy objects twice with additive blending + larger scale
    // This is a lightweight approximation without post-processing pipeline.

    // ── Animation Loop ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId;

    // State machine — avoids setState in rAF
    const stateEvents = {
      loadingDone: false,
      gameplayTriggered: false,
      awarenessShown: false,
      awarenessHidden: false,
      cityVisible: false,
    };

    // Smooth camera: target positions we lerp toward
    let targetCamPos = new THREE.Vector3(350, 30, 350);
    let targetLookAt = new THREE.Vector3(0, 0, -800);
    let cameraLerpSpeed = 2.5;

    // Pre-warm camera
    camera.position.copy(targetCamPos);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05); // clamp for tab-switch spikes
      const time  = clock.getElapsedTime();

      // ── Loading bar (throttled setState) ──
      if (time < 2) {
        const prog = Math.floor((time / 2) * 100);
        if (prog !== loadingProgressRef.current) {
          loadingProgressRef.current = prog;
          setLoadingProgress(prog);
        }
      } else if (!stateEvents.loadingDone) {
        stateEvents.loadingDone = true;
        setCurrentScene('intro');
        setSkipVisible(true);
        currentSceneRef.current = 'intro';
      }

      // ── Camera Shot Sequence ──────────────────────────────────────────────
      // All shots define a target pos + lookAt; we lerp smoothly between them

      if (time < 12) {
        // Enhanced camera movement with dynamic easing
        const t  = Math.max(0, time - 2) / 10;
        const et = easeInOutSine(t);
        const radius = 350 - et * 55;
        const angle  = et * Math.PI * 0.7;
        
        // Add subtle camera shake for cinematic feel
        const shakeX = Math.sin(time * 8) * 0.5;
        const shakeY = Math.cos(time * 12) * 0.3;
        
        targetCamPos.set(
          radius * Math.sin(angle) + shakeX, 
          30 * Math.cos(angle * 0.5) + shakeY, 
          radius * Math.cos(angle)
        );
        targetLookAt.copy(earthGroup.position);
        cameraLerpSpeed = 1.5 + Math.sin(time * 0.3) * 0.2; // Dynamic lerp speed
        sunLight.intensity = 6.0 + Math.sin(time * 1.8) * 0.6;
      }

      if (time >= 10 && time < 16) {
        // Enhanced pollution emergence with smoother fade
        const t = (time - 10) / 6;
        const smoothT = easeInOutSine(t);
        pollutionGroup.children.forEach((p, i) => {
          if (p.material) {
            const delay = i * 0.002; // Staggered emergence
            const adjustedT = Math.max(0, smoothT - delay);
            p.material.opacity = Math.min(0.8, adjustedT * 1.3);
            // Add subtle rotation to pollution particles
            p.rotation.y += delta * 0.1;
            p.rotation.x += delta * 0.05;
          }
        });
      }

      if (time >= 15 && time < 23) {
        // Shot 4: Atmospheric descent — punch zoom
        const t  = (time - 15) / 8;
        const et = easeOutCubic(t);
        targetCamPos.set(
          THREE.MathUtils.lerp(200, 0,    et),
          THREE.MathUtils.lerp(30, -180,  et),
          THREE.MathUtils.lerp(200, -850, et)
        );
        targetLookAt.set(0, -800, -2600);
        cameraLerpSpeed = 3.0;

        // Sky colour shift
        const skyMix = et * et;
        const skyR = 0.04 + 0.47 * skyMix, skyG = 0.07 + 0.78 * skyMix, skyB = 0.16 + 0.92 * skyMix;
        skyColor.setRGB(skyR, skyG, skyB);
        descentFog.color.copy(skyColor);
        descentFog.density = et * 0.004;

        starsSmall.material.opacity = Math.max(0, 1 - et * 2);
        starsBright.material.opacity = Math.max(0, 1 - et * 2);

        earthMesh.material.opacity = Math.max(0, 1 - et * 1.5);
        earthMesh.material.transparent = true;
        clouds.material.opacity = Math.max(0, 0.85 - et * 1.2);
        atmosphere.material.uniforms && (atmosphere.material.transparent = true);

        if (time > 20.5 && !stateEvents.cityVisible) {
          stateEvents.cityVisible = true;
          cityGroup.visible = true;
          // Fade window lights in
          windowMats.forEach(m => { m.opacity = 0.08 + Math.random() * 0.55; });
        }
      }

      if (time >= 22 && time < 28) {
        // Shot 5: City reveal — descend over skyline
        const t  = (time - 22) / 6;
        const et = easeOutCubic(t);
        targetCamPos.set(0, 500 - et * 460, -500 + et * 620);
        targetLookAt.set(0, 0, 1500);
        cameraLerpSpeed = 2.0;
      }

      if (time >= 28 && time < 34) {
        // Shot 6: Urban tracking — chase red van
        const carPos = redVan.position;
        targetCamPos.set(carPos.x + 18, carPos.y + 14, carPos.z - 65);
        targetLookAt.set(carPos.x, carPos.y + 2, carPos.z + 300);
        cameraLerpSpeed = 4.0; // tight tracking
      }

      if (time >= 33 && time < 39) {
        // Shot 7: Industrial pan
        targetCamPos.set(-980, 160, -180);
        targetLookAt.set(-1200, 50, -800);
        cameraLerpSpeed = 1.0;
      }

      if (time >= 38 && time < 46) {
        // Shot 8-9: Gods-eye finale
        targetCamPos.set(500, 850, 820);
        targetLookAt.set(0, 0, 0);
        cameraLerpSpeed = 0.6;

        if (time > 39 && !stateEvents.awarenessShown) {
          stateEvents.awarenessShown = true;
          setAwarenessText("A fragile balance between human achievement and nature’s heartbeat.");
          setShowAwarenessText(true);
          showAwarenessTextRef.current = true;
        }
        if (time >= 44 && !stateEvents.awarenessHidden) {
          stateEvents.awarenessHidden = true;
          setShowAwarenessText(false);
        }
        if (time > 44.5 && !stateEvents.gameplayTriggered) {
          stateEvents.gameplayTriggered = true;
          setCurrentScene('gameplay');
          currentSceneRef.current = 'gameplay';
        }
      }

      // Smooth Camera Apply with enhanced easing
      const smoothDelta = Math.min(1, cameraLerpSpeed * delta);
      camera.position.lerp(targetCamPos, smoothDelta);
      camTarget.lerp(targetLookAt, smoothDelta);
      
      // Add subtle camera drift for organic feel
      const driftAmount = 0.02;
      camTarget.x += Math.sin(time * 0.7) * driftAmount;
      camTarget.y += Math.cos(time * 0.9) * driftAmount;
      
      camera.lookAt(camTarget);

      // Enhanced per-frame updates with smoother animations
      starsGroup.rotation.y += delta * 0.004;
      nebulaGroup.children.forEach((n, i) => { 
        n.rotation.y += delta * (0.015 + i * 0.008);
        n.rotation.x += delta * (0.002 + i * 0.001); // Added subtle X rotation
      });
      earthMesh.rotation.y += delta * 0.10;
      clouds.rotation.y     += delta * 0.14;
      
      // Dynamic lighting animation
      sunLight.intensity = 6.0 + Math.sin(time * 0.8) * 0.4;
      auroraLight.intensity = 3.0 + Math.sin(time * 1.2) * 0.5;
      rimLight.intensity = 2.5 + Math.sin(time * 0.6) * 0.3;
      atmosLight.intensity = 1.5 + Math.sin(time * 1.0) * 0.2;

      // Atmosphere shader uniforms with time animation
      viewVec.subVectors(camera.position, earthGroup.position).normalize();
      atmosphere.material.uniforms.viewVector.value.copy(viewVec);
      atmosphere.material.uniforms.time.value = time;
      outerGlow.material.uniforms.viewVector.value.copy(viewVec);
      outerGlow.material.uniforms.time.value = time;

      pollutionParticles.forEach(p => {
        p.theta += delta * p.speed * 0.12;
        p.mesh.position.x = p.r * Math.sin(p.phi) * Math.cos(p.theta);
        p.mesh.position.z = p.r * Math.sin(p.phi) * Math.sin(p.theta);
      });

      if (cityGroup.visible) {
        vehicles.forEach(v => {
          v.mesh.position.z += v.speed * delta * 62;
          if (v.mesh.position.z > 2600) v.mesh.position.z = -2600;
        });

        smokeParticles.forEach(s => {
          s.life += delta;
          if (s.life > s.maxLife) {
            s.life = 0;
            const factory = industrialZone.children[s.stackIdx];
            const chimney = factory?.children?.[0];
            if (chimney) {
              chimney.getWorldPosition(smokeWorldPos);
              s.mesh.position.copy(smokeWorldPos);
            }
            s.mesh.scale.setScalar(1);
          } else {
            s.mesh.position.x += s.vx;
            s.mesh.position.y += s.vy;
            s.mesh.position.z += s.vz;
            const prog = s.life / s.maxLife;
            s.mesh.material.opacity = Math.sin(prog * Math.PI) * 0.4;
            s.mesh.scale.setScalar(1 + prog * 12);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.domElement.remove();
      scene.clear();
      renderer.dispose();
      terrainGeometry.dispose();
      terrainMaterial.dispose();
      [earthTex, cloudTex, nightTex, specTex, roadTex, sidewalkTex, ...windowTexPool].forEach(t => t.dispose());
    };
  }, []);

  const handleSkip = () => {
    if (onComplete) onComplete();
    navigate('/login');
  };

  return (
    <div className="gi-root">
      <div ref={containerRef} className="gi-canvas" />

      {currentScene === 'loading' && (
        <div className="gi-loading">
          <div className="gi-loading-inner">
            <h1 className="gi-title">ECO-TRACKER</h1>
            <div className="gi-bar-track">
              <div className="gi-bar-fill" style={{ width: `${loadingProgress}%` }} />
            </div>
            <p className="gi-loading-pct">{loadingProgress}%</p>
          </div>
        </div>
      )}

      {currentScene === 'intro' && skipVisible && (
        <button className="gi-skip" onClick={handleSkip}>Skip Intro →</button>
      )}

      {showAwarenessText && (
        <div className="gi-awareness">
          <p className="gi-awareness-text">{awarenessText}</p>
        </div>
      )}

      {currentScene === 'gameplay' && (
        <div className="gi-finale">
          <div className="gi-finale-inner">
            <h1 className="gi-title gi-title--finale">EARTH&apos;S LAST HOPE</h1>
            <p className="gi-subtitle">The dawn of a new era. Your journey begins at the edge of extinction.</p>
            <button className="gi-start" onClick={handleSkip}>COMMAND THE FUTURE</button>
          </div>
        </div>
      )}

      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .gi-root {
          width: 100vw; height: 100vh; min-height: 100dvh; overflow: hidden;
          background: #000; position: relative;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .gi-canvas { width: 100%; height: 100%; display: block; }

        /* ── Loading ── */
        .gi-loading {
          position: absolute; inset: 0;
          background: #020810;
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          animation: gi-fadeIn 0.4s ease;
        }
        .gi-loading-inner { text-align: center; }

        /* ── Title ── */
        .gi-title {
          font-size: clamp(40px, 5.5vw, 72px);
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffffff 0%, #80DEEA 45%, #2e4374 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 36px;
          animation: gi-pulse 4s ease-in-out infinite;
        }
        @keyframes gi-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(128,222,234,0.4)); }
          25% { filter: brightness(1.2) drop-shadow(0 0 28px rgba(128,222,234,0.6)); }
          50%       { filter: brightness(1.6) drop-shadow(0 0 32px rgba(128,222,234,0.8)); }
          75% { filter: brightness(1.3) drop-shadow(0 0 24px rgba(128,222,234,0.5)); }
        }

        .gi-bar-track {
          width: min(420px, 80vw); height: 2px;
          background: rgba(128,222,234,0.18);
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .gi-bar-track::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(128,222,234,0.15), transparent);
          animation: gi-shimmer 1.8s linear infinite;
        }
        @keyframes gi-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .gi-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2e4374, #80DEEA, #4a90e2);
          box-shadow: 0 0 14px #80DEEA, 0 0 28px rgba(128,222,234,0.4), inset 0 0 8px rgba(255,255,255,0.2);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .gi-bar-fill::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: gi-barShine 2s linear infinite;
        }
        @keyframes gi-barShine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .gi-loading-pct {
          margin-top: 16px;
          font-size: 11px; letter-spacing: 0.35em;
          color: rgba(128,222,234,0.5);
          font-variant-numeric: tabular-nums;
        }

        /* ── Skip ── */
        .gi-skip {
          position: absolute; top: 36px; right: 36px;
          color: #80DEEA;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(128,222,234,0.28);
          padding: 11px 22px;
          cursor: pointer;
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .gi-skip:hover {
          background: #80DEEA; color: #000;
          box-shadow: 0 0 22px rgba(128,222,234,0.5), 0 8px 24px rgba(128,222,234,0.3);
          transform: translateY(-2px);
          border-color: #80DEEA;
        }

        /* ── Awareness ── */
        .gi-awareness {
          position: absolute; bottom: 90px; width: 100%;
          display: flex; justify-content: center;
          pointer-events: none; z-index: 50;
        }
        .gi-awareness-text {
          color: #fff;
          font-size: clamp(12px, 1.4vw, 20px);
          font-weight: 200; letter-spacing: 0.32em;
          text-transform: uppercase; text-align: center;
          max-width: 720px; padding: 16px 24px;
          opacity: 0;
          animation: gi-awarenessAnim 5.5s forwards;
          text-shadow: 0 0 30px rgba(128,222,234,0.4), 0 0 60px rgba(128,222,234,0.2);
          background: linear-gradient(135deg, rgba(128,222,234,0.1), rgba(46,67,116,0.1));
          backdrop-filter: blur(8px);
          border-radius: 4px;
          border: 1px solid rgba(128,222,234,0.2);
        }
        @keyframes gi-awarenessAnim {
          0%   { opacity: 0; transform: translateY(18px) scale(0.95); filter: blur(4px); }
          18%  { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          78%  { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-14px) scale(1.05); filter: blur(2px);}
        }

        /* ── Finale ── */
        .gi-finale {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(10,17,40,0.82) 0%, rgba(0,0,0,0.97) 100%);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          animation: gi-finaleIn 2.8s ease forwards;
        }
        @keyframes gi-finaleIn {
          from { opacity: 0; filter: blur(24px); }
          to   { opacity: 1; filter: blur(0);    }
        }
        .gi-finale-inner { text-align: center; max-width: 960px; padding: 0 24px; }

        .gi-title--finale {
          font-size: clamp(48px, 7vw, 100px);
          margin-bottom: 24px;
          text-shadow: 0 0 40px rgba(128,222,234,0.35);
        }

        .gi-subtitle {
          color: rgba(128,222,234,0.8);
          font-size: clamp(11px, 1.2vw, 16px);
          letter-spacing: 0.28em; margin-bottom: 52px;
          font-weight: 300;
        }

        .gi-start {
          padding: 18px 56px;
          background: transparent;
          color: #fff;
          border: 1px solid #80DEEA;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.45em; text-transform: uppercase;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(128,222,234,0.2);
        }
        .gi-start::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #80DEEA, #4a90e2);
          transform: translateX(-101%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }
        .gi-start:hover { 
          color: #000; 
          box-shadow: 0 0 44px rgba(128,222,234,0.55), 0 8px 32px rgba(128,222,234,0.3), inset 0 0 20px rgba(255,255,255,0.2);
          transform: translateY(-3px) scale(1.02);
          border-color: #4a90e2;
        }
        .gi-start:hover::before { transform: translateX(0); }
        .gi-start:active {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 0 30px rgba(128,222,234,0.4), 0 4px 16px rgba(128,222,234,0.2);
        }

        @media (max-width: 900px) {
          .gi-loading-inner { width: min(92vw, 520px); padding: 0 8px; }
          .gi-title { letter-spacing: 0.12em; margin-bottom: 24px; }
          .gi-subtitle { letter-spacing: 0.18em; margin-bottom: 34px; }
          .gi-awareness { bottom: 64px; padding: 0 10px; }
          .gi-awareness-text { letter-spacing: 0.18em; padding: 12px 14px; max-width: 100%; }
          .gi-finale-inner { width: min(96vw, 760px); }
        }

        @media (max-width: 640px) {
          .gi-root { min-height: 100svh; }
          .gi-title { font-size: clamp(28px, 9vw, 42px); letter-spacing: 0.08em; }
          .gi-skip {
            top: max(12px, env(safe-area-inset-top));
            right: 12px;
            padding: 9px 12px;
            font-size: 8px;
            letter-spacing: 0.18em;
          }
          .gi-bar-track { width: min(86vw, 340px); }
          .gi-title--finale { font-size: clamp(30px, 9.6vw, 54px); margin-bottom: 16px; }
          .gi-subtitle { font-size: 11px; line-height: 1.6; letter-spacing: 0.12em; margin-bottom: 24px; }
          .gi-start {
            width: min(88vw, 360px);
            padding: 14px 12px;
            letter-spacing: 0.2em;
            font-size: 10px;
          }
        }

        @keyframes gi-fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
