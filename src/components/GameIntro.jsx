import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { dispose } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { setCustomData, setPerf } from 'r3f-perf';

/**
 * Earth's Descent: A Cinematic Journey
 * v3 - AQI Awareness, Enhanced Story, Dual Messages, Premium AQI Panel
 */
export default function GameIntro({ onComplete, onNavigate }) {
  const containerRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState('loading');
  const [skipVisible, setSkipVisible] = useState(false);
  const [awarenessText, setAwarenessText] = useState('');
  const [showAwarenessText, setShowAwarenessText] = useState(false);
  // NEW: second cinematic message
  const [secondAwarenessText, setSecondAwarenessText] = useState('');
  const [showSecondAwareness, setShowSecondAwareness] = useState(false);
  // AQI Panel
  const [showAqiPanel, setShowAqiPanel] = useState(false);
  const [aqiAnimated, setAqiAnimated] = useState(false);
  const { progress: assetProgress } = useProgress();

  const currentSceneRef = useRef('loading');
  const showAwarenessTextRef = useRef(false);
  const loadingProgressRef = useRef(0);
  const assetProgressRef = useRef(0);

  useEffect(() => {
    assetProgressRef.current = Number.isFinite(assetProgress)
      ? Math.max(0, Math.min(100, assetProgress))
      : 0;
  }, [assetProgress]);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

  // ─── Procedural Earth Textures (Canvas) ────────────────────────────────────
  const buildEarthTexture = (highQuality = true) => {
    const size = highQuality ? 2048 : 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, size);
    oceanGrad.addColorStop(0, '#071425');
    oceanGrad.addColorStop(0.4, '#0d2a52');
    oceanGrad.addColorStop(0.7, '#0a2244');
    oceanGrad.addColorStop(1, '#050f1a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, size);

    // Ocean shimmer
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < (highQuality ? 150 : 80); i++) {
      const y = Math.random() * size;
      const grad = ctx.createLinearGradient(0, y, size, y + 10);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, '#7ecef2');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, size, 2);
    }
    ctx.globalAlpha = 1;

    const drawContinent = (pts, col, roughness = 0.6) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * size, pts[0][1] * size);
      for (let i = 1; i < pts.length; i++) {
        const mx = ((pts[i - 1][0] + pts[i][0]) / 2) * size;
        const my = ((pts[i - 1][1] + pts[i][1]) / 2) * size;
        ctx.quadraticCurveTo(
          pts[i - 1][0] * size + (Math.random() - 0.5) * 36 * roughness,
          pts[i - 1][1] * size + (Math.random() - 0.5) * 36 * roughness,
          mx, my
        );
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    };

    // Improved continent shapes with more points for realism
    // North America
    drawContinent([
      [0.04,0.14],[0.09,0.11],[0.14,0.10],[0.20,0.12],[0.26,0.11],[0.30,0.15],
      [0.32,0.19],[0.30,0.24],[0.27,0.29],[0.29,0.34],[0.26,0.40],
      [0.20,0.44],[0.16,0.47],[0.12,0.43],[0.08,0.38],[0.05,0.30],[0.03,0.22]
    ], '#3e6b27', 0.7);
    // Greenland
    drawContinent([
      [0.37,0.05],[0.43,0.03],[0.50,0.05],[0.52,0.09],[0.48,0.14],[0.42,0.15],[0.37,0.12]
    ], '#6f8f67', 0.38);
    // South America
    drawContinent([
      [0.19,0.44],[0.25,0.46],[0.30,0.50],[0.32,0.57],[0.30,0.64],[0.27,0.72],
      [0.24,0.80],[0.20,0.87],[0.16,0.85],[0.13,0.78],[0.12,0.70],[0.14,0.60],[0.15,0.52]
    ], '#356020', 0.72);
    // Europe
    drawContinent([
      [0.44,0.13],[0.49,0.10],[0.55,0.11],[0.58,0.15],[0.57,0.20],
      [0.53,0.24],[0.49,0.25],[0.45,0.23],[0.42,0.19]
    ], '#4a7a2e', 0.6);
    // Africa
    drawContinent([
      [0.46,0.25],[0.50,0.22],[0.56,0.22],[0.62,0.27],[0.65,0.33],[0.65,0.42],
      [0.62,0.52],[0.58,0.62],[0.54,0.72],[0.50,0.76],[0.46,0.72],[0.43,0.60],
      [0.43,0.48],[0.44,0.37]
    ], '#4f7c2a', 0.65);
    // Middle East / West Asia bump
    drawContinent([
      [0.58,0.22],[0.64,0.20],[0.68,0.24],[0.67,0.32],[0.61,0.33],[0.57,0.28]
    ], '#5a7830', 0.55);
    // Asia (main body)
    drawContinent([
      [0.57,0.12],[0.65,0.10],[0.74,0.11],[0.84,0.13],[0.92,0.18],[0.96,0.24],
      [0.94,0.32],[0.90,0.38],[0.86,0.42],[0.80,0.46],[0.74,0.50],[0.68,0.48],
      [0.64,0.42],[0.62,0.34],[0.60,0.26],[0.57,0.20]
    ], '#44722a', 0.65);
    // Indian peninsula
    drawContinent([
      [0.70,0.38],[0.74,0.36],[0.78,0.40],[0.77,0.48],[0.73,0.55],[0.69,0.52],[0.68,0.44]
    ], '#3d6b23', 0.6);
    // South East Asia / Indonesia hint
    drawContinent([
      [0.82,0.48],[0.88,0.46],[0.94,0.48],[0.96,0.54],[0.90,0.57],[0.84,0.55]
    ], '#416a26', 0.7);
    // Australia
    drawContinent([
      [0.80,0.60],[0.87,0.57],[0.94,0.60],[0.96,0.67],[0.93,0.74],[0.86,0.78],
      [0.80,0.77],[0.76,0.70],[0.77,0.63]
    ], '#567830', 0.5);

    // Mountains overlay
    ctx.globalAlpha = 0.30;
    for (let i = 0; i < (highQuality ? 22 : 12); i++) {
      const x = Math.random() * size, y = Math.random() * size * 0.7;
      const r = 18 + Math.random() * 55;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, '#8B7355');
      grad.addColorStop(0.5, '#6b5a3e');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r * 0.55, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Icecaps
    ctx.fillStyle = '#d8eaf5';
    ctx.globalAlpha = 0.88;
    ctx.fillRect(0, 0, size, size * 0.05);
    ctx.fillRect(0, size * 0.93, size, size * 0.07);
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(c);
  };

  const buildCloudTexture = (highQuality = true) => {
    const size = highQuality ? 1024 : 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < (highQuality ? 220 : 130); i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const rx = 28 + Math.random() * 85, ry = 12 + Math.random() * 32;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
      grad.addColorStop(0, 'rgba(255,255,255,0.92)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.38)');
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
    const clusters = [
      [0.15,0.35],[0.42,0.25],[0.65,0.20],[0.72,0.35],
      [0.50,0.45],[0.22,0.55],[0.08,0.28],[0.82,0.28],[0.35,0.40]
    ];
    clusters.forEach(([cx, cy]) => {
      for (let i = 0; i < (highQuality ? 65 : 40); i++) {
        const x = cx * size + (Math.random() - 0.5) * size * 0.12;
        const y = cy * size + (Math.random() - 0.5) * size * 0.08;
        const col = ['#ffffc8','#ffee88','#ffe0a0','#80DEEA'][Math.floor(Math.random() * 4)];
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.35 + Math.random() * 0.65;
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
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size * 0.28, size);
    ctx.fillRect(size * 0.33, 0, size * 0.58, size * 0.8);
    return new THREE.CanvasTexture(c);
  };

  const buildMoonTexture = (highQuality = true) => {
    const size = highQuality ? 1024 : 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const base = ctx.createRadialGradient(size*0.38,size*0.32,size*0.08,size*0.5,size*0.5,size*0.68);
    base.addColorStop(0, '#cfd1d5');
    base.addColorStop(0.55, '#b2b5ba');
    base.addColorStop(1, '#8a9098');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    // Mare (dark plains)
    [[0.38,0.44,0.12,0.08],[0.60,0.35,0.09,0.06],[0.45,0.62,0.08,0.05]].forEach(([mx,my,rw,rh]) => {
      const mg = ctx.createRadialGradient(mx*size,my*size,0,mx*size,my*size,rw*size);
      mg.addColorStop(0,'rgba(80,85,95,0.55)');
      mg.addColorStop(1,'rgba(80,85,95,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(mx*size,my*size,rw*size,rh*size,0,0,Math.PI*2);
      ctx.fill();
    });
    const craterCount = highQuality ? 580 : 340;
    for (let i = 0; i < craterCount; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const r = (highQuality ? 1.8 : 1.4) + Math.random() * (highQuality ? 20 : 13);
      const crater = ctx.createRadialGradient(x-r*0.25,y-r*0.22,0,x,y,r);
      crater.addColorStop(0, 'rgba(240,243,248,0.32)');
      crater.addColorStop(0.55, 'rgba(116,120,128,0.36)');
      crater.addColorStop(1, 'rgba(50,55,63,0)');
      ctx.fillStyle = crater;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  };

  // UPGRADED: More cinematic info card
  const buildInfoCardTexture = () => {
    const w = 1024, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    // Dark glass background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, 'rgba(4,8,16,0.88)');
    bg.addColorStop(1, 'rgba(8,15,28,0.82)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Outer border
    ctx.strokeStyle = 'rgba(128,222,234,0.32)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(8, 8, w-16, h-16);
    // Inner border
    ctx.strokeStyle = 'rgba(128,222,234,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, w-44, h-44);

    // Corner accents
    const corners = [[22,22],[w-22,22],[22,h-22],[w-22,h-22]];
    corners.forEach(([cx,cy],i) => {
      ctx.strokeStyle = 'rgba(128,222,234,0.7)';
      ctx.lineWidth = 2.5;
      const d = 18;
      ctx.beginPath();
      if(i===0){ ctx.moveTo(cx,cy+d); ctx.lineTo(cx,cy); ctx.lineTo(cx+d,cy); }
      if(i===1){ ctx.moveTo(cx-d,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+d); }
      if(i===2){ ctx.moveTo(cx,cy-d); ctx.lineTo(cx,cy); ctx.lineTo(cx+d,cy); }
      if(i===3){ ctx.moveTo(cx-d,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy-d); }
      ctx.stroke();
    });

    // Glow
    const glow = ctx.createRadialGradient(w*0.5,h*0.5,0,w*0.5,h*0.5,w*0.55);
    glow.addColorStop(0,'rgba(128,222,234,0.10)');
    glow.addColorStop(1,'rgba(128,222,234,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,w,h);

    // Label
    ctx.fillStyle = 'rgba(128,222,234,0.70)';
    ctx.font = '500 22px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('◈  EARTH BRIEFING  ◈', 68, 96);

    // Divider line
    ctx.strokeStyle = 'rgba(128,222,234,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(68, 116); ctx.lineTo(w-68, 116); ctx.stroke();

    // Main title
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.font = '700 52px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('This is our Mother Earth', 68, 220);

    // Subtitle
    ctx.fillStyle = 'rgba(196,228,244,0.92)';
    ctx.font = '400 36px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('— 4.5 billion years old', 68, 290);

    // Body
    ctx.fillStyle = 'rgba(128,222,234,0.55)';
    ctx.font = '300 22px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('A fragile world of oceans, forests & life-sustaining air.', 68, 368);

    // Bottom status dots
    ['OCEANS 71%','ATMOSPHERE','BIODIVERSITY','CLIMATE'].forEach((lbl,i) => {
      const dx = 68 + i * 224;
      ctx.fillStyle = i===0?'#2196F3':i===1?'#4CAF50':i===2?'#8BC34A':'#FF9800';
      ctx.beginPath(); ctx.arc(dx, 430, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(200,220,240,0.6)';
      ctx.font = '300 16px Helvetica Neue, Arial, sans-serif';
      ctx.fillText(lbl, dx+12, 435);
    });

    return new THREE.CanvasTexture(c);
  };

  const buildIndustrialWallTexture = () => {
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#6a5c4e';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 22) {
      ctx.fillStyle = `rgba(${80+(Math.random()*30|0)},${70+(Math.random()*20|0)},${60+(Math.random()*15|0)},0.30)`;
      ctx.fillRect(0, y, size, 2);
    }
    for (let i = 0; i < 2800; i++) {
      const g = 60+(Math.random()*45|0);
      ctx.fillStyle = `rgba(${g},${g-4},${g-10},0.14)`;
      ctx.fillRect(Math.random()*size, Math.random()*size, 2, 2);
    }
    // Pollution stains around "windows"
    for (let i = 0; i < 30; i++) {
      const wx = Math.random() * size, wy = Math.random() * size * 0.8;
      const stain = ctx.createRadialGradient(wx, wy, 0, wx, wy+30, 40);
      stain.addColorStop(0, 'rgba(10,8,5,0.55)');
      stain.addColorStop(1, 'rgba(10,8,5,0)');
      ctx.fillStyle = stain;
      ctx.fillRect(wx-30, wy, 60, 55);
    }
    for (let i = 0; i < 38; i++) {
      const sx=Math.random()*size, sy=Math.random()*size*0.7, len=70+Math.random()*220;
      const grad = ctx.createLinearGradient(sx,sy,sx,sy+len);
      grad.addColorStop(0,'rgba(10,8,5,0.55)');
      grad.addColorStop(1,'rgba(10,8,5,0)');
      ctx.strokeStyle=grad; ctx.lineWidth=4+Math.random()*6;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+(Math.random()-0.5)*28,sy+len); ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  };

  const buildCityTerrain = (highQuality = true) => {
    const terrainSize = highQuality ? 12000 : 9000;
    const terrainSegments = highQuality ? 180 : 120;
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    const pos = geometry.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const fract=(v)=>v-Math.floor(v);
    const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453123);
    const lerp=(a,b,t)=>a+(b-a)*t;
    const smooth=(t)=>t*t*(3-2*t);
    const valueNoise2D=(x,y)=>{
      const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const a=hash(xi,yi),b=hash(xi+1,yi),c2=hash(xi,yi+1),d=hash(xi+1,yi+1);
      const ux=smooth(xf),uy=smooth(yf);
      return lerp(lerp(a,b,ux),lerp(c2,d,ux),uy);
    };
    const fbm=(x,y,oct=5)=>{
      let v=0,amp=0.6,freq=1,sum=0;
      for(let i=0;i<oct;i++){v+=valueNoise2D(x*freq,y*freq)*amp;sum+=amp;amp*=0.5;freq*=2;}
      return v/Math.max(sum,0.0001);
    };
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),z=pos.getY(i);
      const dist=Math.sqrt(x*x+z*z);
      const broad=fbm(x*0.00055,z*0.00055,5)*260;
      const detail=fbm(x*0.0022,z*0.0022,4)*55;
      const mountainMask=THREE.MathUtils.smoothstep(dist,2300,5600);
      const ridgeBase=1-Math.abs(fbm(x*0.0011,z*0.0011,5)*2-1);
      const ridgeSharp=Math.pow(Math.max(ridgeBase,0),2.2);
      const peakNoise=Math.pow(fbm(x*0.00038,z*0.00038,4),1.8);
      let height=broad+detail-120+mountainMask*(ridgeSharp*340+peakNoise*180-110);
      const cityFlatten=1-THREE.MathUtils.smoothstep(dist,1200,2700);
      height=THREE.MathUtils.lerp(height,-6,cityFlatten*0.95);
      pos.setZ(i,height);
      const h=height;
      let r=0.20,g=0.28,b=0.17;
      if(mountainMask>0.5&&h>55&&h<170){r=0.15;g=0.24;b=0.13;}
      if(h>80){r=0.34;g=0.37;b=0.30;}
      if(h>170){r=0.58;g=0.60;b=0.62;}
      if(h>280){r=0.80;g=0.82;b=0.84;}
      if(h<-18){r=0.16;g=0.22;b=0.16;}
      colors[i*3]=r;colors[i*3+1]=g;colors[i*3+2]=b;
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
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
    const enableFog = false;
    const enableSmog = true;
    const qualityScale = qualityTier === 'high' ? 1 : 0.72;
    const maxPixelRatio = Math.min(window.devicePixelRatio, qualityTier === 'high' ? 1.75 : 1.25);
    const minPixelRatio = qualityTier === 'high' ? 1 : 0.8;
    let dynamicPixelRatio = maxPixelRatio;

    const skyColor = new THREE.Color(0x000005);
    const descentFog = enableFog ? new THREE.FogExp2(skyColor.clone(), 0) : null;
    const viewVec = new THREE.Vector3();
    const smokeWorldPos = new THREE.Vector3();

    const scene = new THREE.Scene();
    scene.background = skyColor;
    scene.fog = descentFog;

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 20000);
    const camTarget = new THREE.Vector3();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', precision: 'highp' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dynamicPixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    setPerf({ gl: renderer, scene });

    const markDynamic = (o) => { o.userData.dynamic = true; return o; };
    const freezeStaticTransforms = (root) => {
      root.traverse((obj) => {
        if (!obj?.isObject3D || obj.userData.dynamic) return;
        obj.matrixAutoUpdate = false;
        obj.updateMatrix();
      });
    };

    // ── Lighting ──
    const sunLight = new THREE.DirectionalLight(0xffcc88, 8.0);
    sunLight.position.set(1800, 400, 800);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(qualityTier === 'high' ? 2048 : 1024, qualityTier === 'high' ? 2048 : 1024);
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 6000;
    sunLight.shadow.camera.left = -2200;
    sunLight.shadow.camera.right = 2200;
    sunLight.shadow.camera.top = 2200;
    sunLight.shadow.camera.bottom = -2200;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x2255aa, 1.2);
    fillLight.position.set(-400, -100, -400);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x112244, 0.8);
    scene.add(ambientLight);

    const auroraLight = new THREE.PointLight(0x00ffc8, 3.0, 3000);
    auroraLight.position.set(-1000, 500, -1000);
    scene.add(auroraLight);

    const rimLight = new THREE.DirectionalLight(0x4488ff, 2.5);
    rimLight.position.set(800, 200, -800);
    scene.add(rimLight);

    const atmosLight = new THREE.PointLight(0x80DEEA, 1.5, 2000);
    atmosLight.position.set(0, 0, -800);
    scene.add(atmosLight);

    // ── Nebula Background ──
    const nebulaGroup = new THREE.Group();
    markDynamic(nebulaGroup);
    [0x020304, 0x03050a, 0x02040a].forEach(col => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(9000, qualityTier === 'high' ? 28 : 20, qualityTier === 'high' ? 28 : 20),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: qualityTier === 'high' ? 0.012 : 0.008, side: THREE.BackSide, blending: THREE.NormalBlending, depthWrite: false })
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      nebulaGroup.add(mesh);
    });
    scene.add(nebulaGroup);

    // ── Stars ──
    const makeStarField = (count, size, spread, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const r = spread[0] + Math.random() * (spread[1] - spread[0]);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[i*3]=r*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=r*Math.cos(phi);
        sizes[i] = 0.5 + Math.random() * size;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size, transparent: true, sizeAttenuation: true, opacity: 1 }));
    };
    const starsSmall = makeStarField(Math.floor(5000*qualityScale), 1.5, [5000,9000], 0xaabbcc);
    const starsBright = makeStarField(Math.floor(800*qualityScale), 3.5, [4000,7000], 0xffffff);
    const starsGroup = new THREE.Group();
    markDynamic(starsGroup);
    starsGroup.add(starsSmall, starsBright);
    scene.add(starsGroup);

    // ── High-Fidelity Earth ──
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, 0, -800);

    const highQuality = qualityTier === 'high';
    const earthTex = buildEarthTexture(highQuality);
    const cloudTex = buildCloudTexture(highQuality);
    const cloudTexSoft = buildCloudTexture(highQuality);
    const nightTex = buildNightTexture(highQuality);
    const specTex = buildSpecularTexture(highQuality);
    const moonTex = buildMoonTexture(highQuality);
    const infoCardTex = buildInfoCardTexture();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const tunedAnisotropy = Math.min(maxAnisotropy, qualityTier === 'high' ? 8 : 4);
    [earthTex, cloudTex, cloudTexSoft, nightTex, moonTex, infoCardTex].forEach(tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = tunedAnisotropy;
    });
    specTex.anisotropy = tunedAnisotropy;

    const earthGeo = new THREE.SphereGeometry(100, qualityTier === 'high' ? 96 : 72, qualityTier === 'high' ? 96 : 72);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex, specularMap: specTex,
      specular: new THREE.Color(0x4488aa), shininess: 45,
      emissiveMap: nightTex, emissive: new THREE.Color(0xffa040), emissiveIntensity: 0.5,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    markDynamic(earthMesh);
    earthGroup.add(earthMesh);

    const cloudGeo = new THREE.SphereGeometry(101.8, qualityTier === 'high' ? 72 : 48, qualityTier === 'high' ? 72 : 48);
    const cloudMat = new THREE.MeshPhongMaterial({ map: cloudTex, alphaMap: cloudTex, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.NormalBlending });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    markDynamic(clouds);
    earthGroup.add(clouds);

    const cloudsHigh = new THREE.Mesh(
      new THREE.SphereGeometry(103.4, qualityTier === 'high' ? 56 : 42, qualityTier === 'high' ? 56 : 42),
      new THREE.MeshPhongMaterial({ map: cloudTexSoft, alphaMap: cloudTexSoft, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.NormalBlending })
    );
    markDynamic(cloudsHigh);
    earthGroup.add(cloudsHigh);

    // Floating Info Card
    const infoCardGroup = new THREE.Group();
    markDynamic(infoCardGroup);
    infoCardGroup.position.set(0, 66, 240);
    const infoCard = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 180),
      new THREE.MeshBasicMaterial({ map: infoCardTex, transparent: true, opacity: 0.96, depthWrite: false })
    );
    const infoCardGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 204),
      new THREE.MeshBasicMaterial({ color: 0x80deea, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    infoCardGlow.position.z = -2;
    infoCardGroup.add(infoCardGlow, infoCard);
    scene.add(infoCardGroup);

    // Moon
    const moonOrbit = new THREE.Group();
    markDynamic(moonOrbit);
    moonOrbit.rotation.set(0.34, 0.2, -0.14);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(26, qualityTier === 'high' ? 56 : 40, qualityTier === 'high' ? 56 : 40),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.96, metalness: 0.02, bumpMap: moonTex, bumpScale: 0.85 })
    );
    markDynamic(moon);
    moon.castShadow = qualityTier === 'high';
    moon.receiveShadow = true;
    moon.position.set(250, 24, 30);
    moonOrbit.add(moon);
    earthGroup.add(moonOrbit);

    // Satellites
    const satBodyGeo = new THREE.CylinderGeometry(2.6, 2.6, 12, 12);
    const satPanelGeo = new THREE.BoxGeometry(14, 0.42, 5.2);
    const satArmGeo = new THREE.CylinderGeometry(0.26, 0.26, 8, 6);
    const satDishGeo = new THREE.ConeGeometry(2.2, 1.8, 10);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0xaeb6c1, roughness: 0.45, metalness: 0.7 });
    const satPanelMat = new THREE.MeshStandardMaterial({ color: 0x2b6ea3, roughness: 0.35, metalness: 0.6 });
    const satAntennaMat = new THREE.MeshStandardMaterial({ color: 0xd9dde3, roughness: 0.2, metalness: 0.85 });
    const createSatellite = () => {
      const sat = new THREE.Group();
      const body = new THREE.Mesh(satBodyGeo, satBodyMat);
      body.rotation.z = Math.PI / 2;
      sat.add(body);
      const leftPanel = new THREE.Mesh(satPanelGeo, satPanelMat);
      leftPanel.position.set(-12, 0, 0);
      const rightPanel = leftPanel.clone();
      rightPanel.position.x = 12;
      sat.add(leftPanel, rightPanel);
      const arm = new THREE.Mesh(satArmGeo, satAntennaMat);
      arm.rotation.z = Math.PI / 2; arm.position.set(0, 0, 3.6);
      sat.add(arm);
      const dish = new THREE.Mesh(satDishGeo, satAntennaMat);
      dish.position.set(4.2, 0, 3.6); dish.rotation.z = -Math.PI / 2;
      sat.add(dish);
      return sat;
    };
    const satellitePivots = [];
    const satelliteOrbits = [
      { radius: 188, speed: 0.22, tilt: [0.24,0.10,0.30], phase: 0.3 },
      { radius: 212, speed: 0.18, tilt: [0.45,-0.12,-0.22], phase: 1.5 },
      { radius: 236, speed: 0.14, tilt: [0.62,0.18,0.11], phase: 2.4 },
      { radius: 265, speed: 0.12, tilt: [0.83,-0.08,0.27], phase: 3.1 },
    ];
    satelliteOrbits.forEach((cfg, i) => {
      const pivot = new THREE.Group();
      markDynamic(pivot);
      pivot.rotation.set(cfg.tilt[0], cfg.tilt[1], cfg.tilt[2]);
      const sat = createSatellite();
      markDynamic(sat);
      sat.position.set(cfg.radius, 10+i*6, 0);
      sat.rotation.set(0.1*i, cfg.phase, -0.15*i);
      sat.userData.spin = cfg.speed * 1.35;
      pivot.userData.orbitSpeed = cfg.speed;
      pivot.userData.sat = sat;
      pivot.add(sat);
      earthGroup.add(pivot);
      satellitePivots.push(pivot);
    });

    // Atmosphere shader
    const atmosphereVS = `
      uniform vec3 viewVector; uniform float power; uniform float time;
      varying float fresnel; varying vec3 vNormal; varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        vViewPosition = -mvPosition.xyz; vNormal = normalize(normalMatrix * normal);
        vec3 vView = normalize(normalMatrix * viewVector);
        fresnel = pow(1.0 - abs(dot(vNormal, vView)), power);
        fresnel *= 1.0 + sin(time * 0.5) * 0.1;
        gl_Position = projectionMatrix * mvPosition;
      }`;
    const atmosphereFS = `
      uniform vec3 glowColor; uniform float time;
      varying float fresnel; varying vec3 vNormal; varying vec3 vViewPosition;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float rim = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
        vec3 color = glowColor * fresnel + glowColor * rim * 0.3;
        float alpha = fresnel * 0.9 + rim * 0.2;
        gl_FragColor = vec4(color, alpha);
      }`;
    const atmosMat = new THREE.ShaderMaterial({
      uniforms: { viewVector: { value: new THREE.Vector3() }, glowColor: { value: new THREE.Color(0x55aaff) }, power: { value: 2.8 }, time: { value: 0 } },
      vertexShader: atmosphereVS, fragmentShader: atmosphereFS,
      side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(108, qualityTier === 'high' ? 48 : 36, qualityTier === 'high' ? 48 : 36), atmosMat);
    earthGroup.add(atmosphere);

    const outerGlowMat = atmosMat.clone();
    outerGlowMat.uniforms = { viewVector: { value: new THREE.Vector3() }, glowColor: { value: new THREE.Color(0x80DEEA) }, power: { value: 4.0 }, time: { value: 0 } };
    outerGlowMat.side = THREE.BackSide;
    const outerGlow = new THREE.Mesh(new THREE.SphereGeometry(115, qualityTier === 'high' ? 48 : 36, qualityTier === 'high' ? 48 : 36), outerGlowMat);
    earthGroup.add(outerGlow);
    scene.add(earthGroup);

    // ── Pollution Ring ──
    const pollutionGroup = new THREE.Group();
    pollutionGroup.position.copy(earthGroup.position);
    pollutionGroup.visible = enableSmog;
    const pollutionParticles = [];
    const pollGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const pollutionCount = enableSmog ? Math.floor(350 * qualityScale) : 0;
    for (let i = 0; i < pollutionCount; i++) {
      const r = 126 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * 0.55;
      const col = [0x3a332a, 0x2a2520, 0x4a3a28][i % 3];
      const p = new THREE.Mesh(pollGeo, new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0, roughness: 1 }));
      markDynamic(p);
      p.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
      pollutionParticles.push({ mesh: p, theta, r, phi, speed: 0.1+Math.random()*0.35 });
      pollutionGroup.add(p);
    }
    scene.add(pollutionGroup);

    // ── City ──
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -800);
    cityGroup.visible = false;

    const makeWindowTex = (cols, rows, litFrac) => {
      const tw=256, th=512;
      const cv=document.createElement('canvas'); cv.width=tw; cv.height=th;
      const cx=cv.getContext('2d');
      cx.fillStyle='#0a0e1a'; cx.fillRect(0,0,tw,th);
      const cw=tw/cols, ch=th/rows;
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        if(Math.random()>litFrac) continue;
        cx.fillStyle=Math.random()>0.4?'#ffee90':'#a0e8ff';
        cx.globalAlpha=0.55+Math.random()*0.45;
        cx.fillRect(c*cw+1,r*ch+1,cw-2,ch-2);
      }
      cx.globalAlpha=1;
      return new THREE.CanvasTexture(cv);
    };

    const makeRoadTex = () => {
      const s=512; const cv=document.createElement('canvas'); cv.width=s; cv.height=s;
      const cx=cv.getContext('2d');
      cx.fillStyle='#141414'; cx.fillRect(0,0,s,s);
      for(let i=0;i<3000;i++){
        const gv=60+Math.random()*30|0;
        cx.fillStyle=`rgba(${gv},${gv},${gv},0.25)`;
        cx.fillRect(Math.random()*s,Math.random()*s,1,1);
      }
      cx.strokeStyle='#c8a800'; cx.lineWidth=3; cx.setLineDash([]);
      cx.beginPath(); cx.moveTo(s*0.49,0); cx.lineTo(s*0.49,s); cx.stroke();
      cx.beginPath(); cx.moveTo(s*0.51,0); cx.lineTo(s*0.51,s); cx.stroke();
      cx.strokeStyle='#e8e8e8'; cx.lineWidth=2; cx.setLineDash([30,30]);
      [0.25,0.75].forEach(lx=>{ cx.beginPath(); cx.moveTo(s*lx,0); cx.lineTo(s*lx,s); cx.stroke(); });
      cx.setLineDash([]);
      return new THREE.CanvasTexture(cv);
    };

    const makeSidewalkTex = () => {
      const s=256; const cv=document.createElement('canvas'); cv.width=s; cv.height=s;
      const cx=cv.getContext('2d');
      cx.fillStyle='#2a2a2a'; cx.fillRect(0,0,s,s);
      cx.strokeStyle='#1a1a1a'; cx.lineWidth=1;
      for(let x=0;x<=s;x+=32){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,s);cx.stroke();}
      for(let y=0;y<=s;y+=32){cx.beginPath();cx.moveTo(0,y);cx.lineTo(s,y);cx.stroke();}
      return new THREE.CanvasTexture(cv);
    };

    const roadTex = makeRoadTex();
    const sidewalkTex = makeSidewalkTex();
    [roadTex, sidewalkTex].forEach(tex => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = tunedAnisotropy;
    });
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.set(1, 8);
    sidewalkTex.wrapS = sidewalkTex.wrapT = THREE.RepeatWrapping; sidewalkTex.repeat.set(4, 20);

    const cityGround = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.98 })
    );
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.receiveShadow = true;
    cityGroup.add(cityGround);

    const terrainGeometry = buildCityTerrain(highQuality);
    const cityTerrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0.04, envMapIntensity: 0.2 }));
    cityTerrain.rotation.x = -Math.PI / 2;
    cityTerrain.position.y = -8;
    cityTerrain.receiveShadow = true;
    cityGroup.add(cityTerrain);

    // Mountain Forest
    const createMountainForest = (terrainGeo, hqMode) => {
      const posAttr = terrainGeo.getAttribute('position');
      const normalAttr = terrainGeo.getAttribute('normal');
      const candidates = [];
      const maxDist = hqMode ? 5850 : 4400;
      const density = hqMode ? 0.42 : 0.34;
      for (let i = 0; i < posAttr.count; i++) {
        const lx=posAttr.getX(i), ly=posAttr.getY(i), h=posAttr.getZ(i);
        const dist=Math.hypot(lx,ly);
        if(dist<2300||dist>maxDist) continue;
        if(h<70||h>300) continue;
        const up=normalAttr.getZ(i);
        if(up<0.6||up>0.97) continue;
        if(Math.random()>density) continue;
        candidates.push(i);
      }
      if(candidates.length===0) return null;
      const treeTarget = hqMode ? 3200 : 1800;
      const treeCount = Math.min(treeTarget, candidates.length);
      const forestGroup = new THREE.Group();
      const trunkGeo=new THREE.CylinderGeometry(0.55,0.85,6,6);
      const canopyGeo=new THREE.ConeGeometry(2.8,8.5,7);
      const trunkMat=new THREE.MeshStandardMaterial({color:0x4b3621,roughness:0.9});
      const canopyMat=new THREE.MeshStandardMaterial({color:0x1e4f22,roughness:0.95});
      const trunkMesh=new THREE.InstancedMesh(trunkGeo,trunkMat,treeCount);
      const canopyMesh=new THREE.InstancedMesh(canopyGeo,canopyMat,treeCount);
      trunkMesh.castShadow=hqMode; trunkMesh.receiveShadow=true;
      canopyMesh.castShadow=hqMode; canopyMesh.receiveShadow=true;
      const dummy=new THREE.Object3D();
      for(let i=0;i<treeCount;i++){
        const idx=candidates[(i*8191+(Math.random()*candidates.length|0))%candidates.length];
        const lx=posAttr.getX(idx),ly=posAttr.getY(idx),h=posAttr.getZ(idx);
        const baseY=h-8, worldZ=-ly;
        const trunkScale=0.75+Math.random()*0.9, trunkH=6*trunkScale;
        dummy.position.set(lx,baseY+trunkH*0.5,worldZ);
        dummy.rotation.set(0,Math.random()*Math.PI*2,0);
        dummy.scale.setScalar(trunkScale); dummy.updateMatrix();
        trunkMesh.setMatrixAt(i,dummy.matrix);
        const cs=trunkScale*(1.05+Math.random()*0.25), cy=trunkScale*(1.05+Math.random()*0.25);
        dummy.position.set(lx,baseY+trunkH+(8.5*cy)*0.35,worldZ);
        dummy.rotation.set(0,Math.random()*Math.PI*2,0);
        dummy.scale.set(cs,cy,cs); dummy.updateMatrix();
        canopyMesh.setMatrixAt(i,dummy.matrix);
      }
      trunkMesh.instanceMatrix.needsUpdate=true; canopyMesh.instanceMatrix.needsUpdate=true;
      forestGroup.add(trunkMesh,canopyMesh);
      return forestGroup;
    };
    const mountainForest = createMountainForest(terrainGeometry, highQuality);
    if (mountainForest) cityGroup.add(mountainForest);

    // Roads + sidewalks
    const roadW=28, swW=8;
    const roadsideOffsetBase=roadW/2+swW+2;
    const roadMat3D=new THREE.MeshStandardMaterial({map:roadTex,roughness:0.92,metalness:0.02});
    const swMat=new THREE.MeshStandardMaterial({map:sidewalkTex,roughness:0.85,color:0x333333});
    const curbMat=new THREE.MeshStandardMaterial({color:0x888888,roughness:0.7});
    const stripeMat=new THREE.MeshBasicMaterial({color:0xdddddd});
    const roadGeoH=new THREE.PlaneGeometry(6000,roadW);
    const roadGeoV=new THREE.PlaneGeometry(roadW,6000);
    const swGeoH=new THREE.BoxGeometry(6000,0.3,swW);
    const swGeoV=new THREE.BoxGeometry(swW,0.3,6000);
    const curbGeo=new THREE.BoxGeometry(6000,0.5,1.2);
    const stripeGeo=new THREE.PlaneGeometry(roadW*0.82,1.6);
    const gridHalf=qualityTier==='high'?12:9;
    for(let i=-gridHalf;i<=gridHalf;i++){
      const gz=i*100;
      const road=new THREE.Mesh(roadGeoH,roadMat3D); road.rotation.x=-Math.PI/2; road.position.set(0,0.15,gz); road.receiveShadow=true; cityGroup.add(road);
      const roadV=new THREE.Mesh(roadGeoV,roadMat3D); roadV.rotation.x=-Math.PI/2; roadV.position.set(gz,0.15,0); roadV.receiveShadow=true; cityGroup.add(roadV);
      [-1,1].forEach(side=>{
        const sw=new THREE.Mesh(swGeoH,swMat); sw.position.set(0,0.15,gz+side*(roadW/2+swW/2)); sw.receiveShadow=true; cityGroup.add(sw);
        const swV=new THREE.Mesh(swGeoV,swMat); swV.position.set(gz+side*(roadW/2+swW/2),0.15,0); cityGroup.add(swV);
        const curb=new THREE.Mesh(curbGeo,curbMat); curb.position.set(0,0.25,gz+side*(roadW/2)); cityGroup.add(curb);
      });
      if(qualityTier==='high'&&i%2===0){
        for(let j=-gridHalf;j<=gridHalf;j+=2){
          for(let s=0;s<3;s++){
            const stripe=new THREE.Mesh(stripeGeo,stripeMat);
            stripe.rotation.x=-Math.PI/2;
            stripe.position.set(j*100,0.2,gz-roadW*0.28+s*3.3);
            cityGroup.add(stripe);
          }
        }
      }
    }

    // Curved intersections
    const intersectionCount=(gridHalf*2+1)*(gridHalf*2+1);
    const turnConfigs=[{sx:1,sz:1,start:Math.PI},{sx:1,sz:-1,start:Math.PI*0.5},{sx:-1,sz:1,start:Math.PI*1.5},{sx:-1,sz:-1,start:0}];
    const turnPatchMat=new THREE.MeshStandardMaterial({color:0x161616,roughness:0.94,metalness:0.02});
    const turnGuideMat=new THREE.MeshBasicMaterial({color:0xe6e6e6,transparent:true,opacity:0.36,depthWrite:false});
    const laneRadiusOuter=roadW*0.365, guideInnerA=roadW*0.245, guideOuterA=roadW*0.263, guideInnerB=roadW*0.338, guideOuterB=roadW*0.356;
    const turnDummy=new THREE.Object3D();
    turnConfigs.forEach(cfg=>{
      const turnPatchGeo=new THREE.CircleGeometry(laneRadiusOuter,24,cfg.start,Math.PI*0.5);
      const turnGuideGeoA=new THREE.RingGeometry(guideInnerA,guideOuterA,24,1,cfg.start,Math.PI*0.5);
      const turnGuideGeoB=new THREE.RingGeometry(guideInnerB,guideOuterB,24,1,cfg.start,Math.PI*0.5);
      const tPM=new THREE.InstancedMesh(turnPatchGeo,turnPatchMat,intersectionCount);
      const tGMA=new THREE.InstancedMesh(turnGuideGeoA,turnGuideMat,intersectionCount);
      const tGMB=new THREE.InstancedMesh(turnGuideGeoB,turnGuideMat,intersectionCount);
      tPM.receiveShadow=true;
      let idx=0;
      for(let xi=-gridHalf;xi<=gridHalf;xi++) for(let zi=-gridHalf;zi<=gridHalf;zi++){
        const cx=xi*100+cfg.sx*(roadW*0.5), cz=zi*100+cfg.sz*(roadW*0.5);
        turnDummy.position.set(cx,0.16,cz); turnDummy.rotation.set(-Math.PI/2,0,0); turnDummy.scale.set(1,1,1); turnDummy.updateMatrix();
        tPM.setMatrixAt(idx,turnDummy.matrix);
        turnDummy.position.y=0.205; turnDummy.updateMatrix();
        tGMA.setMatrixAt(idx,turnDummy.matrix); tGMB.setMatrixAt(idx,turnDummy.matrix);
        idx+=1;
      }
      tPM.instanceMatrix.needsUpdate=true; tGMA.instanceMatrix.needsUpdate=true; tGMB.instanceMatrix.needsUpdate=true;
      cityGroup.add(tPM,tGMA,tGMB);
    });

    // Buildings
    const windowMats = [];
    const windowTexPool = Array.from({ length: qualityTier==='high'?10:6 }, (_,idx) =>
      makeWindowTex(8+(idx%5), 16+(idx%6), qualityTier==='high'?0.68:0.62)
    );
    windowTexPool.forEach(tex => { tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=tunedAnisotropy; });
    const bStyles=[
      {body:0x1a2535,m:0.82,r:0.12},{body:0x2c1e14,m:0.05,r:0.80},
      {body:0x141c28,m:0.90,r:0.08},{body:0x1e2b1e,m:0.20,r:0.65},
    ];
    const buildingCount=qualityTier==='high'?420:240;
    for(let i=0;i<buildingCount;i++){
      const sty=bStyles[i%bStyles.length], isTow=i<60;
      const w=isTow?20+Math.random()*22:12+Math.random()*24;
      const d=isTow?20+Math.random()*22:12+Math.random()*24;
      const h=isTow?120+Math.random()*260:18+Math.random()*90;
      const blockSpan=Math.max(18,100-roadW-swW*2-10);
      const cellX=(Math.floor(Math.random()*(gridHalf*2+1))-gridHalf)*100;
      const cellZ=(Math.floor(Math.random()*(gridHalf*2+1))-gridHalf)*100;
      const alongXRoad=Math.random()>0.5, side=Math.random()>0.5?1:-1;
      const edgeOffset=roadsideOffsetBase+(alongXRoad?d:w)*0.5+Math.random()*6;
      const bx=alongXRoad?cellX+side*edgeOffset:cellX+(Math.random()-0.5)*blockSpan;
      const bz=alongXRoad?cellZ+(Math.random()-0.5)*blockSpan:cellZ+side*edgeOffset;
      const bg=new THREE.Group(); bg.position.set(bx,0,bz);
      const podH=Math.min(h*0.18,22);
      const pod=new THREE.Mesh(new THREE.BoxGeometry(w*1.35,podH,d*1.35),new THREE.MeshStandardMaterial({color:sty.body,roughness:sty.r+0.1,metalness:sty.m-0.1}));
      pod.position.y=podH/2; pod.castShadow=qualityTier==='high'&&i<120; pod.receiveShadow=true; bg.add(pod);
      const shaftMat=new THREE.MeshStandardMaterial({color:sty.body,roughness:sty.r,metalness:sty.m});
      const shaft=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),shaftMat);
      shaft.position.y=podH+h/2; shaft.castShadow=qualityTier==='high'&&i<120; shaft.receiveShadow=true; bg.add(shaft);
      if(isTow&&h>150){
        const tH=h*0.35, tY=podH+h*0.62;
        const tier=new THREE.Mesh(new THREE.BoxGeometry(w*0.7,tH,d*0.7),shaftMat.clone());
        tier.position.y=tY+tH/2; tier.castShadow=qualityTier==='high'&&i<120; bg.add(tier);
        const spire=new THREE.Mesh(new THREE.CylinderGeometry(0.3,1.5,h*0.12,6),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.9,roughness:0.1}));
        spire.position.y=tY+tH+h*0.06; spire.castShadow=qualityTier==='high'&&i<120; bg.add(spire);
      }
      const wTex=windowTexPool[i%windowTexPool.length];
      const windowFaceGeo=new THREE.PlaneGeometry(w,h);
      [[0,podH+h/2,d/2+0.2,0],[0,podH+h/2,-(d/2+0.2),Math.PI],[w/2+0.2,podH+h/2,0,-Math.PI/2],[-(w/2+0.2),podH+h/2,0,Math.PI/2]].forEach(([fx,fy,fz,ry])=>{
        const wm=new THREE.MeshBasicMaterial({map:wTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
        windowMats.push(wm);
        const wf=new THREE.Mesh(windowFaceGeo,wm); wf.position.set(fx,fy,fz); wf.rotation.y=ry; bg.add(wf);
      });
      const rY=podH+h;
      for(let r=0;r<(qualityTier==='high'?(2+Math.random()*3|0):(1+Math.random()*2|0));r++){
        const ac=new THREE.Mesh(new THREE.BoxGeometry(2.5+Math.random()*3,1.5,2+Math.random()*2),new THREE.MeshStandardMaterial({color:0x888888,roughness:0.7}));
        ac.position.set((Math.random()-0.5)*w*0.7,rY+0.75,(Math.random()-0.5)*d*0.7); bg.add(ac);
      }
      if(Math.random()>0.75&&!isTow){
        const wt=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,5,8),new THREE.MeshStandardMaterial({color:0x8B6914,roughness:0.9}));
        wt.position.set((Math.random()-0.5)*w*0.5,rY+2.5,(Math.random()-0.5)*d*0.5); bg.add(wt);
        const wtR=new THREE.Mesh(new THREE.ConeGeometry(2.5,2,8),new THREE.MeshStandardMaterial({color:0x6B4F10,roughness:0.9}));
        wtR.position.set(wt.position.x,rY+6.5,wt.position.z); bg.add(wtR);
      }
      if(Math.random()>0.6){
        const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,8+Math.random()*10,4),new THREE.MeshStandardMaterial({color:0x555555,metalness:0.8}));
        ant.position.set(0,rY+5,0); bg.add(ant);
      }
      const prt=new THREE.Mesh(new THREE.BoxGeometry(w+0.6,1.2,d+0.6),new THREE.MeshStandardMaterial({color:sty.body,roughness:0.6}));
      prt.position.y=rY+0.6; bg.add(prt);
      cityGroup.add(bg);
    }

    // Vehicles
    const vehicles = [];
    const carShadowEnabled = qualityTier==='high'&&!isMobile;
    const carSpecs=[
      {bw:4.6,bh:1.0,bd:9.0,rh:0.9,rOff:-0.3},{bw:5.0,bh:1.2,bd:9.5,rh:1.2,rOff:0.0},
      {bw:5.2,bh:1.0,bd:14,rh:0.8,rOff:1.8},{bw:5.0,bh:1.5,bd:10,rh:1.5,rOff:0.0},
    ];
    const carBodyGeos=carSpecs.map(sp=>new THREE.BoxGeometry(sp.bw,sp.bh,sp.bd));
    const carCabGeos=carSpecs.map(sp=>new THREE.BoxGeometry(sp.bw*0.82,sp.rh,sp.bd*0.52));
    const carWindowGeos=carSpecs.map(sp=>new THREE.PlaneGeometry(sp.bw*0.78,sp.rh*0.88));
    const carUndersideGeos=carSpecs.map(sp=>new THREE.BoxGeometry(sp.bw*0.88,0.4,sp.bd*0.88));
    const carWheelGeo=new THREE.CylinderGeometry(1,1,0.7,16);
    const carRimGeo=new THREE.CylinderGeometry(0.55,0.55,0.75,8);
    const carHeadLightGeo=new THREE.BoxGeometry(0.9,0.5,0.3);
    const carTailLightGeo=new THREE.BoxGeometry(0.8,0.4,0.3);
    const sharedCarGlassMat=new THREE.MeshStandardMaterial({color:0x88ccff,roughness:0.05,metalness:0.1,transparent:true,opacity:0.55});
    const sharedCarTireMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:0.95});
    const sharedCarRimMat=new THREE.MeshStandardMaterial({color:0xbbbbbb,metalness:0.9,roughness:0.2});
    const sharedHeadLightMat=new THREE.MeshBasicMaterial({color:0xffffee});
    const sharedTailLightMat=new THREE.MeshBasicMaterial({color:0xff2200});
    const sharedCarUndersideMat=new THREE.MeshStandardMaterial({color:0x080808});
    const makeCar=(bodyColor,type,isRed)=>{
      const g=new THREE.Group(), sp=carSpecs[type];
      const bMat=new THREE.MeshStandardMaterial({color:bodyColor,roughness:0.25,metalness:0.82,emissive:isRed?0x330000:0,emissiveIntensity:isRed?0.3:0});
      const body=new THREE.Mesh(carBodyGeos[type],bMat); body.position.y=sp.bh/2+1.2; body.castShadow=carShadowEnabled; body.receiveShadow=true; g.add(body);
      if(type!==2){
        const cab=new THREE.Mesh(carCabGeos[type],bMat); cab.position.set(0,sp.bh+sp.rh/2+1.2,sp.rOff); cab.castShadow=carShadowEnabled; g.add(cab);
        const ws=new THREE.Mesh(carWindowGeos[type],sharedCarGlassMat); ws.position.set(0,sp.bh+sp.rh/2+1.2,sp.rOff+sp.bd*0.26+0.05); ws.rotation.x=0.18*Math.PI/2; g.add(ws);
        const wsR=ws.clone(); wsR.position.z=sp.rOff-sp.bd*0.26-0.05; wsR.rotation.x=-0.18*Math.PI/2; g.add(wsR);
      }
      [[-sp.bw/2-0.15,1.0,sp.bd*0.33],[sp.bw/2+0.15,1.0,sp.bd*0.33],[-sp.bw/2-0.15,1.0,-sp.bd*0.33],[sp.bw/2+0.15,1.0,-sp.bd*0.33]].forEach(([wx,wy,wz])=>{
        const ti=new THREE.Mesh(carWheelGeo,sharedCarTireMat); ti.rotation.z=Math.PI/2; ti.position.set(wx,wy,wz); ti.castShadow=carShadowEnabled; g.add(ti);
        const ri=new THREE.Mesh(carRimGeo,sharedCarRimMat); ri.rotation.z=Math.PI/2; ri.position.set(wx,wy,wz); g.add(ri);
      });
      [-sp.bw*0.32,sp.bw*0.32].forEach(hx=>{
        const hl=new THREE.Mesh(carHeadLightGeo,sharedHeadLightMat); hl.position.set(hx,sp.bh/2+1.2,sp.bd/2+0.1); g.add(hl);
        const tl=new THREE.Mesh(carTailLightGeo,sharedTailLightMat); tl.position.set(hx,sp.bh/2+1.2,-sp.bd/2-0.1); g.add(tl);
      });
      const und=new THREE.Mesh(carUndersideGeos[type],sharedCarUndersideMat); und.position.y=0.9; g.add(und);
      return g;
    };
    const carPalette=[0xc0392b,0x2980b9,0x27ae60,0xf39c12,0x8e44ad,0x2c3e50,0xecf0f1,0x1abc9c,0x34495e,0xe67e22];
    for(let i=0;i<(qualityTier==='high'?170:90);i++){
      const isRed=i===0, type=isRed?3:Math.floor(Math.random()*4);
      const col=isRed?0xff0000:carPalette[Math.floor(Math.random()*carPalette.length)];
      const vg=makeCar(col,type,isRed); markDynamic(vg);
      const lane=(Math.floor(Math.random()*26)-13)*100+(Math.random()>0.5?7:-7);
      vg.position.set(lane,0,(Math.random()-0.5)*5500);
      vehicles.push({mesh:vg,speed:2.2+Math.random()*3.8,isRed});
      cityGroup.add(vg);
    }
    const redVan=vehicles[0].mesh;

    // Street lights
    const poleMat2=new THREE.MeshStandardMaterial({color:0x555555,metalness:0.7});
    const bulbMat2=new THREE.MeshBasicMaterial({color:0xffe88a});
    const poleGeo=new THREE.CylinderGeometry(0.25,0.3,18,6);
    const armGeo=new THREE.BoxGeometry(5,0.3,0.3);
    const bulbGeo=new THREE.SphereGeometry(0.6,8,8);
    const lightStep=qualityTier==='high'?3:4;
    for(let i=-12;i<=12;i+=lightStep) for(let j=-12;j<=12;j+=lightStep){
      const px=i*100+18,pz=j*100+18;
      const pole=new THREE.Mesh(poleGeo,poleMat2); pole.position.set(px,9,pz); pole.castShadow=true; cityGroup.add(pole);
      const arm=new THREE.Mesh(armGeo,poleMat2); arm.position.set(px+2.5,18.2,pz); cityGroup.add(arm);
      const bulb=new THREE.Mesh(bulbGeo,bulbMat2); bulb.position.set(px+5,17.5,pz); cityGroup.add(bulb);
      if(qualityTier==='high'&&(i+j)%9===0){
        const lamp=new THREE.PointLight(0xffe0a0,0.9,140); lamp.position.set(px+5,17,pz); cityGroup.add(lamp);
      }
    }

    // ── UPGRADED Industrial Zone (haveli-style, worn textures, heavy smoke) ──
    const industrialZone = new THREE.Group();
    industrialZone.position.set(-1200, 0, -800);

    // Old haveli-style factory buildings
    const haveliTex = buildIndustrialWallTexture();
    haveliTex.colorSpace = THREE.SRGBColorSpace;
    haveliTex.anisotropy = tunedAnisotropy;
    haveliTex.wrapS = haveliTex.wrapT = THREE.RepeatWrapping;
    haveliTex.repeat.set(4, 2);

    const factoryMat = new THREE.MeshStandardMaterial({ map: haveliTex, roughness: 0.95, metalness: 0.02 });
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xcc2200 });
    const chimneyRefs = [];

    for (let i = 0; i < 12; i++) {
      const factGroup = new THREE.Group();
      factGroup.position.set(0, 0, i * 220);

      // Main factory body (haveli-style wider, flatter)
      const mainBody = new THREE.Mesh(new THREE.BoxGeometry(260, 55, 190), factoryMat);
      mainBody.position.y = 27.5; mainBody.castShadow = true; mainBody.receiveShadow = true;
      factGroup.add(mainBody);

      // Ornamental top parapet (haveli style)
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(270, 8, 198), new THREE.MeshStandardMaterial({ color: 0x4a3528, roughness: 0.9 }));
      parapet.position.y = 59; factGroup.add(parapet);

      // Arched window details on facade
      for (let w = 0; w < 6; w++) {
        const archBase = new THREE.Mesh(new THREE.BoxGeometry(16, 22, 2), new THREE.MeshStandardMaterial({ color: 0x1a1010, roughness: 0.9 }));
        archBase.position.set(-100 + w*40, 22, 96); factGroup.add(archBase);
        // Arch top
        const archTop = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 2, 8, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1a1010 }));
        archTop.rotation.set(Math.PI/2, 0, 0); archTop.position.set(-100+w*40, 36, 96); factGroup.add(archTop);
      }

      // Black soot stains dripping from top
      for (let s = 0; s < 8; s++) {
        const stainH = 10 + Math.random() * 20;
        const stain = new THREE.Mesh(
          new THREE.PlaneGeometry(3 + Math.random() * 4, stainH),
          new THREE.MeshBasicMaterial({ color: 0x070505, transparent: true, opacity: 0.55, depthWrite: false })
        );
        stain.position.set(-110 + s * 32 + Math.random() * 14, 55 - stainH / 2, 96.5);
        factGroup.add(stain);
      }

      // Chimneys — taller, more menacing
      const chimneyCount = 2 + (i % 3);
      for (let ch = 0; ch < chimneyCount; ch++) {
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(8 + Math.random() * 4, 11 + Math.random() * 3, 120 + Math.random() * 40, 16),
          chimneyMat
        );
        chimney.position.set(-60 + ch * 60, 90 + chimney.geometry.parameters.height / 2, (Math.random() - 0.5) * 100);
        chimney.castShadow = true;
        // Warning bands
        for (let b = 0; b < 3; b++) {
          const band = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 4, 16), bandMat);
          band.position.y = -chimney.geometry.parameters.height * 0.3 + b * 22;
          chimney.add(band);
        }
        chimneyRefs.push(chimney);
        factGroup.add(chimney);
      }

      industrialZone.add(factGroup);
    }

    // IMPROVED Smoke — denser, darker, volumetric illusion
    const smokeParticles = [];
    const smokeGeo = new THREE.SphereGeometry(3.5, 8, 8);
    const smokeCount = enableSmog ? (qualityTier === 'high' ? 520 : 300) : 0;
    for (let i = 0; i < smokeCount; i++) {
      // Varying smoke sizes for depth illusion
      const smokeScale = 0.6 + Math.random() * 1.8;
      const smokeDark = Math.random() > 0.4; // Mix of dark and very dark
      const s = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({
        color: smokeDark ? 0x0f0f0f : 0x1e1a16,
        transparent: true, opacity: 0
      }));
      markDynamic(s);
      s.scale.setScalar(smokeScale);
      smokeParticles.push({
        mesh: s, life: Math.random() * 5, maxLife: 3.5 + Math.random() * 5,
        vx: (Math.random() - 0.5) * 1.8, vy: 1.8 + Math.random() * 4, vz: (Math.random() - 0.5) * 1.8,
        stackIdx: Math.floor(Math.random() * chimneyRefs.length),
        baseScale: smokeScale,
      });
      cityGroup.add(s);
    }

    // Ambient smog layer over the whole city
    const ambientSmog = [];
    const ambientSmogGeo = new THREE.SphereGeometry(3.2, 8, 8);
    const ambientSmogMat = new THREE.MeshBasicMaterial({ color: 0x1e1a14, transparent: true, opacity: 0.18, depthWrite: false });
    const ambientSmogCount = enableSmog ? (qualityTier === 'high' ? 260 : 160) : 0;
    for (let i = 0; i < ambientSmogCount; i++) {
      const puff = new THREE.Mesh(ambientSmogGeo, ambientSmogMat);
      markDynamic(puff);
      const px = (Math.random() - 0.5) * 5200;
      const pz = (Math.random() - 0.5) * 5200;
      const py = 3 + Math.random() * 22;
      puff.position.set(px, py, pz);
      const baseScale = 1.4 + Math.random() * 3.2;
      puff.scale.setScalar(baseScale);
      ambientSmog.push({
        mesh: puff, baseY: py, maxY: py + 12 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.24, vy: 0.10 + Math.random() * 0.18, vz: (Math.random() - 0.5) * 0.24,
        phase: Math.random() * Math.PI * 2, baseScale,
      });
      cityGroup.add(puff);
    }

    cityGroup.add(industrialZone);
    scene.add(cityGroup);

    // ── Animation Loop ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId;

    const stateEvents = {
      loadingDone: false,
      gameplayTriggered: false,
      awarenessShown: false,
      awarenessHidden: false,
      secondAwarenessShown: false,
      secondAwarenessHidden: false,
      aqiPanelShown: false,
      cityVisible: false,
    };

    let targetCamPos = new THREE.Vector3(0, 36, 1220);
    let targetLookAt = new THREE.Vector3(0, 0, -800);
    let cameraLerpSpeed = 2.5;
    let dprSampleCount = 0, dprDeltaSum = 0, dprAdjustTimer = 0;
    let frameCounter = 0, adaptiveQualityLevel = 0;

    camera.position.copy(targetCamPos);
    freezeStaticTransforms(scene);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();
      frameCounter += 1;
      dprSampleCount += 1; dprDeltaSum += delta; dprAdjustTimer += delta;

      if (dprAdjustTimer >= 1.2 && dprSampleCount > 0) {
        const avgDelta = dprDeltaSum / dprSampleCount;
        const avgFps = 1 / Math.max(avgDelta, 0.0001);
        setCustomData(avgFps);
        dprSampleCount = 0; dprDeltaSum = 0; dprAdjustTimer = 0;
        if (avgDelta > (1/45) && dynamicPixelRatio > minPixelRatio) {
          dynamicPixelRatio = Math.max(minPixelRatio, dynamicPixelRatio - 0.1);
          renderer.setPixelRatio(dynamicPixelRatio); renderer.setSize(window.innerWidth, window.innerHeight, false);
        } else if (avgDelta < (1/56) && dynamicPixelRatio < maxPixelRatio) {
          dynamicPixelRatio = Math.min(maxPixelRatio, dynamicPixelRatio + 0.05);
          renderer.setPixelRatio(dynamicPixelRatio); renderer.setSize(window.innerWidth, window.innerHeight, false);
        }
        if (avgDelta > (1/38)) adaptiveQualityLevel = Math.min(2, adaptiveQualityLevel + 1);
        else if (avgDelta < (1/52)) adaptiveQualityLevel = Math.max(0, adaptiveQualityLevel - 1);
      }

      const smokeUpdateModulo = adaptiveQualityLevel === 0 ? 1 : adaptiveQualityLevel === 1 ? 2 : 3;
      const pollutionUpdateModulo = adaptiveQualityLevel === 2 ? 2 : 1;
      const nebulaSpeedScale = adaptiveQualityLevel === 2 ? 0.55 : adaptiveQualityLevel === 1 ? 0.75 : 1;
      const lightAnimScale = adaptiveQualityLevel === 2 ? 0.75 : adaptiveQualityLevel === 1 ? 0.88 : 1;

      // Loading bar
      if (time < 2) {
        const prog = Math.min(100, Math.floor(Math.max((time / 2) * 100, assetProgressRef.current)));
        if (prog !== loadingProgressRef.current) { loadingProgressRef.current = prog; setLoadingProgress(prog); }
      } else if (!stateEvents.loadingDone) {
        stateEvents.loadingDone = true;
        setCurrentScene('intro'); setSkipVisible(true); currentSceneRef.current = 'intro';
      }

      // ── Camera Shot Sequence ──
      if (time < 15) {
        const t = THREE.MathUtils.clamp((time - 2) / 13, 0, 1);
        const et = easeInOutSine(t);
        targetCamPos.set(0, THREE.MathUtils.lerp(14, 6, et), THREE.MathUtils.lerp(1700, -650, et));
        targetLookAt.copy(earthGroup.position);
        cameraLerpSpeed = 2.05;
        skyColor.setRGB(0.0, 0.0, 0.02);
        if (descentFog) { descentFog.color.copy(skyColor); descentFog.density = 0; }
        starsSmall.material.opacity = 1; starsBright.material.opacity = 1;
        earthMesh.material.opacity = 1; earthMesh.material.transparent = false;
        clouds.material.opacity = 0.08;

        // Info card floats and bobs gently
        infoCardGroup.visible = time > 3 && time < 13;
        if (infoCardGroup.visible) {
          const cardT = (time - 3) / 10;
          infoCardGroup.position.y = 66 + Math.sin(time * 0.8) * 3;
          infoCardGroup.rotation.y = Math.sin(time * 0.4) * 0.04;
          // Fade in/out
          const cardFade = cardT < 0.15 ? cardT / 0.15 : cardT > 0.82 ? 1 - (cardT - 0.82) / 0.18 : 1;
          infoCard.material.opacity = 0.96 * cardFade;
          infoCardGlow.material.opacity = 0.12 * cardFade;
        }
      }

      if (enableSmog && time >= 12 && time < 20) {
        const t = (time - 12) / 8;
        const smoothT = easeInOutSine(t);
        pollutionGroup.children.forEach((p, i) => {
          if (p.material) {
            const delay = i * 0.002;
            const adjustedT = Math.max(0, smoothT - delay);
            p.material.opacity = Math.min(0.8, adjustedT * 1.3);
            p.rotation.y += delta * 0.1; p.rotation.x += delta * 0.05;
          }
        });
      }

      if (time >= 15 && time < 21) {
        const t = (time - 15) / 6, et = easeInOutSine(t);
        targetCamPos.set(0, THREE.MathUtils.lerp(6, -120, et), THREE.MathUtils.lerp(-650, -840, et));
        targetLookAt.copy(earthGroup.position);
        cameraLerpSpeed = 2.5;
        const skyR = THREE.MathUtils.lerp(0.0, 0.30, et);
        const skyG = THREE.MathUtils.lerp(0.0, 0.52, et);
        const skyB = THREE.MathUtils.lerp(0.02, 0.76, et);
        skyColor.setRGB(skyR, skyG, skyB);
        if (descentFog) { descentFog.color.copy(skyColor); descentFog.density = et * 0.0032; }
        starsSmall.material.opacity = Math.max(0, 1 - et * 1.25);
        starsBright.material.opacity = Math.max(0, 1 - et * 1.25);
        earthMesh.material.opacity = Math.max(0.35, 1 - et * 0.75);
        earthMesh.material.transparent = true;
        clouds.material.opacity = THREE.MathUtils.lerp(0.08, 0.88, et);
        if (time > 20.2 && !stateEvents.cityVisible) {
          stateEvents.cityVisible = true;
          cityGroup.visible = true; earthGroup.visible = false;
          windowMats.forEach(m => { m.opacity = 0.08 + Math.random() * 0.55; });
        }
      }

      if (time >= 21 && time < 27) {
        const t = (time-21)/6, et = easeOutCubic(t);
        targetCamPos.set(0, 500 - et * 460, -500 + et * 620);
        targetLookAt.set(0, 0, 1500);
        cameraLerpSpeed = 2.0;
      }

      if (time >= 28 && time < 34) {
        const carPos = redVan.position;
        targetCamPos.set(carPos.x + 18, carPos.y + 14, carPos.z - 65);
        targetLookAt.set(carPos.x, carPos.y + 2, carPos.z + 300);
        cameraLerpSpeed = 4.0;
      }

      if (time >= 33 && time < 39) {
        targetCamPos.set(-980, 160, -180);
        targetLookAt.set(-1200, 50, -800);
        cameraLerpSpeed = 1.0;
      }

      // ── NEW: AQI Awareness Scene (Gods-eye finale with emotional lighting) ──
      if (time >= 38 && time < 50) {
        const t = THREE.MathUtils.clamp((time - 38) / 12, 0, 1);
        const et = easeInOutSine(t);

        // Dramatic wide pullback — see the full city + mountains
        targetCamPos.set(
          THREE.MathUtils.lerp(500, 680, et),
          THREE.MathUtils.lerp(850, 1100, et),
          THREE.MathUtils.lerp(820, 1050, et)
        );
        targetLookAt.set(0, 0, 0);
        cameraLerpSpeed = 0.55;

        // EMOTIONAL LIGHTING SHIFT — warm→sickly orange/red for pollution awareness
        // No postprocessing needed: just blend tone mapping exposure + light colors
        const pollutionBlend = THREE.MathUtils.clamp((time - 38) / 8, 0, 1);
        const warmSick = easeInOutSine(pollutionBlend);

        // Shift sun to sickly orange-red
        sunLight.color.setRGB(
          THREE.MathUtils.lerp(1.0, 1.0, warmSick),
          THREE.MathUtils.lerp(0.80, 0.42, warmSick),
          THREE.MathUtils.lerp(0.53, 0.10, warmSick)
        );
        sunLight.intensity = THREE.MathUtils.lerp(6.0, 3.8, warmSick);

        // Ambient shifts towards hazy brown
        ambientLight.color.setRGB(
          THREE.MathUtils.lerp(0.07, 0.16, warmSick),
          THREE.MathUtils.lerp(0.13, 0.10, warmSick),
          THREE.MathUtils.lerp(0.27, 0.05, warmSick)
        );

        // Sky color shifts to a hazy smog orange
        skyColor.setRGB(
          THREE.MathUtils.lerp(0.05, 0.22, warmSick),
          THREE.MathUtils.lerp(0.06, 0.12, warmSick),
          THREE.MathUtils.lerp(0.08, 0.04, warmSick)
        );
        scene.background = skyColor;

        // Tone mapping exposure — slightly overexposed then crushed for drama
        renderer.toneMappingExposure = THREE.MathUtils.lerp(1.4, 1.1, warmSick);

        // Show AQI panel at time ~40
        if (time > 40 && !stateEvents.aqiPanelShown) {
          stateEvents.aqiPanelShown = true;
          setShowAqiPanel(true);
          setAqiAnimated(true);
        }

        // First awareness message
        if (time > 39 && !stateEvents.awarenessShown) {
          stateEvents.awarenessShown = true;
          setAwarenessText("A fragile balance between human achievement and nature's heartbeat.");
          setShowAwarenessText(true);
          showAwarenessTextRef.current = true;
        }
        if (time >= 43.5 && !stateEvents.awarenessHidden) {
          stateEvents.awarenessHidden = true;
          setShowAwarenessText(false);
        }

        // Second awareness message — urgent call to action
        if (time > 44.5 && !stateEvents.secondAwarenessShown) {
          stateEvents.secondAwarenessShown = true;
          setSecondAwarenessText("If we do not act now, this balance will collapse.");
          setShowSecondAwareness(true);
        }
        if (time >= 49 && !stateEvents.secondAwarenessHidden) {
          stateEvents.secondAwarenessHidden = true;
          setShowSecondAwareness(false);
          setShowAqiPanel(false);
        }

        if (time > 49.5 && !stateEvents.gameplayTriggered) {
          stateEvents.gameplayTriggered = true;
          setCurrentScene('gameplay');
          currentSceneRef.current = 'gameplay';
        }
      }

      // Smooth Camera
      const smoothDelta = Math.min(1, cameraLerpSpeed * delta);
      camera.position.lerp(targetCamPos, smoothDelta);
      camTarget.lerp(targetLookAt, smoothDelta);
      if (time < 21) {
        camTarget.copy(earthGroup.position);
      } else {
        camTarget.x += Math.sin(time * 0.7) * 0.02;
        camTarget.y += Math.cos(time * 0.9) * 0.02;
      }
      camera.lookAt(camTarget);

      // Per-frame updates
      starsGroup.rotation.y += delta * 0.004;
      const nebulaMotionScale = time < 21 ? 0.08 : 1;
      nebulaGroup.children.forEach((n, i) => {
        n.rotation.y += delta * (0.0007 + i * 0.0003) * nebulaSpeedScale * nebulaMotionScale;
        n.rotation.x += delta * (0.00008 + i * 0.00004) * nebulaSpeedScale * nebulaMotionScale;
      });
      earthMesh.rotation.y += delta * 0.10;
      clouds.rotation.y += delta * 0.14;

      // Satellite orbits
      satellitePivots.forEach(pivot => {
        pivot.rotation.y += delta * pivot.userData.orbitSpeed * 0.28;
        if (pivot.userData.sat) pivot.userData.sat.rotation.y += delta * pivot.userData.sat.userData.spin * 0.18;
      });
      moonOrbit.rotation.y += delta * 0.06;

      // Light animation (only pre-AQI scene)
      if (time < 38) {
        sunLight.intensity = 6.0 + Math.sin(time * 0.8) * 0.4 * lightAnimScale;
        auroraLight.intensity = 3.0 + Math.sin(time * 1.2) * 0.5 * lightAnimScale;
        rimLight.intensity = 2.5 + Math.sin(time * 0.6) * 0.3 * lightAnimScale;
        atmosLight.intensity = 1.5 + Math.sin(time * 1.0) * 0.2 * lightAnimScale;
        sunLight.color.setRGB(1.0, 0.80, 0.53);
        ambientLight.color.setRGB(0.07, 0.13, 0.27);
      }

      viewVec.subVectors(camera.position, earthGroup.position).normalize();
      atmosphere.material.uniforms.viewVector.value.copy(viewVec);
      atmosphere.material.uniforms.time.value = time;
      outerGlow.material.uniforms.viewVector.value.copy(viewVec);
      outerGlow.material.uniforms.time.value = time;

      if (enableSmog && frameCounter % pollutionUpdateModulo === 0) {
        pollutionParticles.forEach(p => {
          p.theta += delta * p.speed * 0.12;
          p.mesh.position.x = p.r * Math.sin(p.phi) * Math.cos(p.theta);
          p.mesh.position.z = p.r * Math.sin(p.phi) * Math.sin(p.theta);
        });
      }

      if (cityGroup.visible) {
        vehicles.forEach(v => {
          v.mesh.position.z += v.speed * delta * 62;
          if (v.mesh.position.z > 2600) v.mesh.position.z = -2600;
        });

        if (enableSmog && frameCounter % smokeUpdateModulo === 0) {
          smokeParticles.forEach(s => {
            s.life += delta;
            if (s.life > s.maxLife) {
              s.life = 0;
              const chimney = chimneyRefs[s.stackIdx];
              if (chimney) {
                chimney.getWorldPosition(smokeWorldPos);
                s.mesh.position.copy(smokeWorldPos);
              }
              s.mesh.scale.setScalar(s.baseScale);
            } else {
              s.mesh.position.x += s.vx;
              s.mesh.position.y += s.vy;
              s.mesh.position.z += s.vz;
              const prog = s.life / s.maxLife;
              // Smoke billows, expands, and darkens as it rises
              s.mesh.material.opacity = Math.sin(prog * Math.PI) * 0.52;
              const expansionScale = s.baseScale * (1 + prog * 14);
              s.mesh.scale.setScalar(expansionScale);
              // Drift direction
              s.vx += (Math.random() - 0.5) * 0.02;
              s.vz += (Math.random() - 0.5) * 0.02;
            }
          });
        }

        if (enableSmog) {
          ambientSmog.forEach(p => {
            p.mesh.position.x += p.vx * delta * 8;
            p.mesh.position.y += p.vy * delta * 8;
            p.mesh.position.z += p.vz * delta * 8;
            const pulse = 0.88 + Math.sin(time * 0.65 + p.phase) * 0.12;
            p.mesh.scale.setScalar(p.baseScale * pulse);
            if (p.mesh.position.y > p.maxY || Math.abs(p.mesh.position.x) > 2800 || Math.abs(p.mesh.position.z) > 2800) {
              p.mesh.position.set((Math.random() - 0.5) * 5000, p.baseY, (Math.random() - 0.5) * 5000);
            }
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      dynamicPixelRatio = Math.min(window.devicePixelRatio, maxPixelRatio);
      renderer.setPixelRatio(dynamicPixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.domElement.remove();
      scene.clear();
      dispose(scene);
      renderer.renderLists.dispose();
      renderer.dispose();
      [earthTex, cloudTex, cloudTexSoft, nightTex, specTex, moonTex, roadTex, sidewalkTex, haveliTex, infoCardTex, ...windowTexPool].forEach(t => t?.dispose());
    };
  }, []);

  const handleSkip = () => {
    if (onComplete) onComplete();
    if (onNavigate) {
      onNavigate('/login');
    } else {
      window.location.href = '/login';
    }
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

      {/* NEW: Second urgent awareness message */}
      {showSecondAwareness && (
        <div className="gi-awareness gi-awareness--urgent">
          <p className="gi-awareness-text gi-awareness-text--urgent">{secondAwarenessText}</p>
          <p className="gi-awareness-cta">We must step up to save our city.</p>
        </div>
      )}

      {/* NEW: AQI Panel */}
      {showAqiPanel && (
        <div className={`gi-aqi-panel ${aqiAnimated ? 'gi-aqi-panel--visible' : ''}`}>
          <div className="gi-aqi-header">
            <span className="gi-aqi-icon">◈</span>
            <span className="gi-aqi-title">AIR QUALITY INDEX</span>
            <span className="gi-aqi-icon">◈</span>
          </div>
          <div className="gi-aqi-divider" />
          <div className="gi-aqi-rows">
            {/* City AQI — danger */}
            <div className="gi-aqi-row gi-aqi-row--danger">
              <div className="gi-aqi-location">
                <span className="gi-aqi-dot gi-aqi-dot--danger" />
                <span className="gi-aqi-loc-label">CITY CENTER</span>
              </div>
              <div className="gi-aqi-value-group">
                <span className="gi-aqi-value gi-aqi-value--danger">
                  <span className="gi-aqi-num">158</span>
                  <span className="gi-aqi-unit">AQI</span>
                </span>
                <span className="gi-aqi-badge gi-aqi-badge--danger">UNHEALTHY</span>
              </div>
              <div className="gi-aqi-bar-wrap">
                <div className="gi-aqi-bar gi-aqi-bar--danger" style={{ '--target-w': '79%' }} />
              </div>
              <div className="gi-aqi-details">
                <span>PM2.5: <b>68 μg/m³</b></span>
                <span>NO₂: <b>142 ppb</b></span>
                <span>CO: <b>4.2 ppm</b></span>
              </div>
            </div>

            {/* Industrial AQI — hazardous */}
            <div className="gi-aqi-row gi-aqi-row--hazard">
              <div className="gi-aqi-location">
                <span className="gi-aqi-dot gi-aqi-dot--hazard" />
                <span className="gi-aqi-loc-label">INDUSTRIAL ZONE</span>
              </div>
              <div className="gi-aqi-value-group">
                <span className="gi-aqi-value gi-aqi-value--hazard">
                  <span className="gi-aqi-num">214</span>
                  <span className="gi-aqi-unit">AQI</span>
                </span>
                <span className="gi-aqi-badge gi-aqi-badge--hazard">VERY UNHEALTHY</span>
              </div>
              <div className="gi-aqi-bar-wrap">
                <div className="gi-aqi-bar gi-aqi-bar--hazard" style={{ '--target-w': '95%' }} />
              </div>
              <div className="gi-aqi-details">
                <span>PM2.5: <b>122 μg/m³</b></span>
                <span>SO₂: <b>88 ppb</b></span>
                <span>CO: <b>9.8 ppm</b></span>
              </div>
            </div>

            {/* Mountain AQI — clean */}
            <div className="gi-aqi-row gi-aqi-row--clean">
              <div className="gi-aqi-location">
                <span className="gi-aqi-dot gi-aqi-dot--clean" />
                <span className="gi-aqi-loc-label">MOUNTAIN ZONE</span>
              </div>
              <div className="gi-aqi-value-group">
                <span className="gi-aqi-value gi-aqi-value--clean">
                  <span className="gi-aqi-num">24</span>
                  <span className="gi-aqi-unit">AQI</span>
                </span>
                <span className="gi-aqi-badge gi-aqi-badge--clean">GOOD</span>
              </div>
              <div className="gi-aqi-bar-wrap">
                <div className="gi-aqi-bar gi-aqi-bar--clean" style={{ '--target-w': '12%' }} />
              </div>
              <div className="gi-aqi-details">
                <span>PM2.5: <b>6 μg/m³</b></span>
                <span>O₃: <b>22 ppb</b></span>
                <span>CO: <b>0.2 ppm</b></span>
              </div>
            </div>
          </div>

          <div className="gi-aqi-footer">
            <span className="gi-aqi-pulse" />
            <span className="gi-aqi-footer-text">LIVE MONITORING · Updated every 60s</span>
          </div>
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

        .gi-loading {
          position: absolute; inset: 0;
          background: #020810;
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          animation: gi-fadeIn 0.4s ease;
        }
        .gi-loading-inner { text-align: center; }

        .gi-title {
          font-size: clamp(40px, 5.5vw, 72px);
          font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
          background: linear-gradient(135deg, #ffffff 0%, #80DEEA 45%, #2e4374 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 36px;
          animation: gi-pulse 4s ease-in-out infinite;
        }
        @keyframes gi-pulse {
          0%,100% { filter: brightness(1) drop-shadow(0 0 20px rgba(128,222,234,0.4)); }
          25% { filter: brightness(1.2) drop-shadow(0 0 28px rgba(128,222,234,0.6)); }
          50% { filter: brightness(1.6) drop-shadow(0 0 32px rgba(128,222,234,0.8)); }
          75% { filter: brightness(1.3) drop-shadow(0 0 24px rgba(128,222,234,0.5)); }
        }

        .gi-bar-track {
          width: min(420px, 80vw); height: 2px;
          background: rgba(128,222,234,0.18); margin: 0 auto; position: relative; overflow: hidden;
        }
        .gi-bar-track::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(128,222,234,0.15), transparent);
          animation: gi-shimmer 1.8s linear infinite;
        }
        @keyframes gi-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .gi-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2e4374, #80DEEA, #4a90e2);
          box-shadow: 0 0 14px #80DEEA, 0 0 28px rgba(128,222,234,0.4), inset 0 0 8px rgba(255,255,255,0.2);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }
        .gi-bar-fill::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: gi-barShine 2s linear infinite;
        }
        @keyframes gi-barShine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .gi-loading-pct {
          margin-top: 16px; font-size: 11px; letter-spacing: 0.35em;
          color: rgba(128,222,234,0.5); font-variant-numeric: tabular-nums;
        }

        .gi-skip {
          position: absolute; top: 36px; right: 36px;
          color: #80DEEA; background: rgba(0,0,0,0.45);
          border: 1px solid rgba(128,222,234,0.28); padding: 11px 22px;
          cursor: pointer; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          backdrop-filter: blur(12px); transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .gi-skip:hover {
          background: #80DEEA; color: #000;
          box-shadow: 0 0 22px rgba(128,222,234,0.5), 0 8px 24px rgba(128,222,234,0.3);
          transform: translateY(-2px); border-color: #80DEEA;
        }

        .gi-awareness {
          position: absolute; bottom: 90px; width: 100%;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          pointer-events: none; z-index: 50;
        }
        .gi-awareness--urgent { bottom: 80px; }
        .gi-awareness-text {
          color: #fff; font-size: clamp(12px, 1.4vw, 20px);
          font-weight: 200; letter-spacing: 0.32em; text-transform: uppercase;
          text-align: center; max-width: 720px; padding: 16px 24px;
          opacity: 0; animation: gi-awarenessAnim 5.5s forwards;
          text-shadow: 0 0 30px rgba(128,222,234,0.4), 0 0 60px rgba(128,222,234,0.2);
          background: linear-gradient(135deg, rgba(128,222,234,0.08), rgba(46,67,116,0.08));
          backdrop-filter: blur(8px); border-radius: 4px;
          border: 1px solid rgba(128,222,234,0.2);
        }
        .gi-awareness-text--urgent {
          color: #ffb347;
          text-shadow: 0 0 30px rgba(255,100,30,0.5), 0 0 60px rgba(255,80,0,0.3);
          background: linear-gradient(135deg, rgba(255,80,20,0.08), rgba(180,40,10,0.08));
          border-color: rgba(255,120,30,0.3);
          letter-spacing: 0.28em;
          animation: gi-awarenessUrgent 5.5s forwards;
        }
        .gi-awareness-cta {
          color: rgba(255,200,100,0.9); font-size: clamp(10px, 1.1vw, 15px);
          letter-spacing: 0.4em; text-transform: uppercase; font-weight: 600;
          opacity: 0; animation: gi-awarenessAnim 5.5s 0.4s forwards;
          text-shadow: 0 0 20px rgba(255,150,30,0.6);
        }
        @keyframes gi-awarenessAnim {
          0%   { opacity:0; transform:translateY(18px) scale(0.95); filter:blur(4px); }
          18%  { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
          78%  { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
          100% { opacity:0; transform:translateY(-14px) scale(1.05); filter:blur(2px); }
        }
        @keyframes gi-awarenessUrgent {
          0%   { opacity:0; transform:translateY(22px) scale(0.94); filter:blur(6px); }
          15%  { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
          80%  { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
          100% { opacity:0; transform:translateY(-16px) scale(1.04); filter:blur(3px); }
        }

        /* ── AQI Panel ── */
        .gi-aqi-panel {
          position: absolute; top: 50%; right: 32px;
          transform: translateY(-50%) translateX(140%);
          width: clamp(280px, 28vw, 420px);
          background: rgba(4, 6, 12, 0.88);
          border: 1px solid rgba(255, 120, 30, 0.28);
          backdrop-filter: blur(18px);
          z-index: 60;
          opacity: 0;
          transition: transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease;
          box-shadow: 0 0 60px rgba(255,80,20,0.12), inset 0 0 40px rgba(0,0,0,0.4);
        }
        .gi-aqi-panel--visible {
          transform: translateY(-50%) translateX(0);
          opacity: 1;
        }

        .gi-aqi-header {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 20px 10px;
        }
        .gi-aqi-icon { color: rgba(255,140,60,0.7); font-size: 11px; }
        .gi-aqi-title {
          font-size: 10px; letter-spacing: 0.38em; font-weight: 600;
          color: rgba(255,180,80,0.9); text-transform: uppercase;
        }
        .gi-aqi-divider {
          height: 1px; margin: 0 20px 14px;
          background: linear-gradient(90deg, transparent, rgba(255,120,40,0.3), transparent);
        }

        .gi-aqi-rows { display: flex; flex-direction: column; gap: 0; }

        .gi-aqi-row {
          padding: 12px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
        }
        .gi-aqi-row::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px;
        }
        .gi-aqi-row--danger::before { background: linear-gradient(180deg, #ff7e00, #ff4400); }
        .gi-aqi-row--hazard::before { background: linear-gradient(180deg, #cc0000, #880000); }
        .gi-aqi-row--clean::before { background: linear-gradient(180deg, #00e676, #00b248); }

        .gi-aqi-location {
          display: flex; align-items: center; gap: 7px; margin-bottom: 8px;
        }
        .gi-aqi-dot {
          width: 7px; height: 7px; border-radius: 50%;
          animation: gi-dotPulse 2s ease-in-out infinite;
        }
        .gi-aqi-dot--danger { background: #ff7e00; box-shadow: 0 0 8px #ff7e00; }
        .gi-aqi-dot--hazard { background: #cc0000; box-shadow: 0 0 8px #cc0000; animation-delay: 0.4s; }
        .gi-aqi-dot--clean  { background: #00e676; box-shadow: 0 0 8px #00e676; animation-delay: 0.8s; }
        @keyframes gi-dotPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.35); }
        }

        .gi-aqi-loc-label {
          font-size: 8.5px; letter-spacing: 0.36em; font-weight: 600;
          color: rgba(200,210,230,0.65); text-transform: uppercase;
        }

        .gi-aqi-value-group {
          display: flex; align-items: center; gap: 10px; margin-bottom: 9px;
        }
        .gi-aqi-value {
          display: flex; align-items: baseline; gap: 3px;
        }
        .gi-aqi-num {
          font-size: clamp(28px, 3.2vw, 40px);
          font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .gi-aqi-unit {
          font-size: 9px; letter-spacing: 0.25em; font-weight: 500;
          color: rgba(200,210,230,0.5); align-self: flex-end; margin-bottom: 4px;
        }
        .gi-aqi-value--danger .gi-aqi-num { color: #ff9500; text-shadow: 0 0 20px rgba(255,149,0,0.5); }
        .gi-aqi-value--hazard .gi-aqi-num { color: #ff4444; text-shadow: 0 0 20px rgba(255,68,68,0.5); }
        .gi-aqi-value--clean  .gi-aqi-num { color: #00e676; text-shadow: 0 0 20px rgba(0,230,118,0.5); }

        .gi-aqi-badge {
          font-size: 7.5px; letter-spacing: 0.28em; font-weight: 700;
          padding: 3px 8px; border-radius: 2px; text-transform: uppercase;
        }
        .gi-aqi-badge--danger  { background: rgba(255,120,0,0.15); color: #ff9500; border: 1px solid rgba(255,120,0,0.3); }
        .gi-aqi-badge--hazard  { background: rgba(200,0,0,0.15); color: #ff5555; border: 1px solid rgba(200,0,0,0.3); }
        .gi-aqi-badge--clean   { background: rgba(0,200,100,0.12); color: #00e676; border: 1px solid rgba(0,200,100,0.25); }

        .gi-aqi-bar-wrap {
          height: 3px; background: rgba(255,255,255,0.07); border-radius: 2px;
          overflow: hidden; margin-bottom: 8px;
        }
        .gi-aqi-bar {
          height: 100%; border-radius: 2px; width: 0;
          animation: gi-barGrow 1.2s 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes gi-barGrow { to { width: var(--target-w); } }
        .gi-aqi-bar--danger  { background: linear-gradient(90deg, #ff9500, #ff4400); box-shadow: 0 0 8px rgba(255,120,0,0.5); }
        .gi-aqi-bar--hazard  { background: linear-gradient(90deg, #ff4444, #cc0000); box-shadow: 0 0 8px rgba(200,0,0,0.5); }
        .gi-aqi-bar--clean   { background: linear-gradient(90deg, #00e676, #00b248); box-shadow: 0 0 8px rgba(0,200,100,0.4); }

        .gi-aqi-details {
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .gi-aqi-details span {
          font-size: 9px; letter-spacing: 0.12em; color: rgba(160,175,200,0.55);
        }
        .gi-aqi-details b { color: rgba(200,215,235,0.8); font-weight: 600; }

        .gi-aqi-footer {
          padding: 10px 20px 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .gi-aqi-pulse {
          width: 6px; height: 6px; border-radius: 50%; background: #00e676;
          box-shadow: 0 0 8px #00e676;
          animation: gi-dotPulse 1.4s ease-in-out infinite;
        }
        .gi-aqi-footer-text {
          font-size: 8px; letter-spacing: 0.3em; color: rgba(128,200,160,0.45);
          text-transform: uppercase;
        }

        /* ── Finale ── */
        .gi-finale {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(10,17,40,0.82) 0%, rgba(0,0,0,0.97) 100%);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          animation: gi-finaleIn 2.8s ease forwards;
        }
        @keyframes gi-finaleIn { from { opacity:0; filter:blur(24px); } to { opacity:1; filter:blur(0); } }
        .gi-finale-inner { text-align: center; max-width: 960px; padding: 0 24px; }

        .gi-title--finale {
          font-size: clamp(48px, 7vw, 100px);
          margin-bottom: 24px; text-shadow: 0 0 40px rgba(128,222,234,0.35);
        }

        .gi-subtitle {
          color: rgba(128,222,234,0.8);
          font-size: clamp(11px, 1.2vw, 16px);
          letter-spacing: 0.28em; margin-bottom: 52px; font-weight: 300;
        }

        .gi-start {
          padding: 18px 56px; background: transparent; color: #fff;
          border: 1px solid #80DEEA;
          font-size: 11px; font-weight: 800; letter-spacing: 0.45em; text-transform: uppercase;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 4px 16px rgba(128,222,234,0.2);
        }
        .gi-start::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #80DEEA, #4a90e2);
          transform: translateX(-101%);
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); z-index: -1;
        }
        .gi-start:hover {
          color: #000;
          box-shadow: 0 0 44px rgba(128,222,234,0.55), 0 8px 32px rgba(128,222,234,0.3), inset 0 0 20px rgba(255,255,255,0.2);
          transform: translateY(-3px) scale(1.02); border-color: #4a90e2;
        }
        .gi-start:hover::before { transform: translateX(0); }
        .gi-start:active { transform: translateY(-1px) scale(1.01); }

        @media (max-width: 900px) {
          .gi-aqi-panel {
            top: auto; bottom: 16px; right: 16px;
            transform: translateY(140%);
            width: min(92vw, 380px);
          }
          .gi-aqi-panel--visible { transform: translateY(0); }
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
          .gi-skip { top: max(12px, env(safe-area-inset-top)); right: 12px; padding: 9px 12px; font-size: 8px; letter-spacing: 0.18em; }
          .gi-bar-track { width: min(86vw, 340px); }
          .gi-title--finale { font-size: clamp(30px, 9.6vw, 54px); margin-bottom: 16px; }
          .gi-subtitle { font-size: 11px; line-height: 1.6; letter-spacing: 0.12em; margin-bottom: 24px; }
          .gi-start { width: min(88vw, 360px); padding: 14px 12px; letter-spacing: 0.2em; font-size: 10px; }
          .gi-aqi-panel { right: 8px; left: 8px; width: auto; }
          .gi-aqi-details { gap: 8px; }
        }

        @keyframes gi-fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}
