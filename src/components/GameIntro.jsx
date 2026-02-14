import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as THREE from 'three';

export default function GameIntro({ onComplete }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState('loading');
  const [skipVisible, setSkipVisible] = useState(false);
  const [awarenessText, setAwarenessText] = useState('');
  const [showAwarenessText, setShowAwarenessText] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('🎬 Game Intro Starting...');

    // Scene setup - Space background (black)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // Fog disabled initially (space has no fog) - will enable when entering atmosphere

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting - Optimized
    const ambientLight = new THREE.AmbientLight(0xffa366, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa66, 3.5);
    sunLight.position.set(200, 100, 150);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.left = -500;
    sunLight.shadow.camera.right = 500;
    sunLight.shadow.camera.top = 500;
    sunLight.shadow.camera.bottom = -500;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 1000;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x6699cc, 1.5);
    fillLight.position.set(-100, 50, -50);
    scene.add(fillLight);

    const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c39, 1.0);
    scene.add(skyLight);

    // Enhanced Starfield with twinkling effect
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starTwinkle = new Float32Array(starCount); // For twinkling animation

    for (let i = 0; i < starCount; i++) {
      const radius = 400 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = -radius * Math.cos(phi) - 200;
      starSizes[i] = 1 + Math.random() * 3;
      starTwinkle[i] = Math.random() * Math.PI * 2; // Random phase for twinkling
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.5,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.userData.twinklePhases = starTwinkle;
    scene.add(stars);

    // REALISTIC VOLUMETRIC CLOUDS
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 80;

      const cloudCluster = new THREE.Group();

      const mainCloud = new THREE.Mesh(
        new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.95,
          shininess: 10
        })
      );
      mainCloud.scale.set(2.2, 0.8, 1.4);
      cloudCluster.add(mainCloud);

      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(15 + Math.random() * 10, 10, 10),
          new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.85,
            shininess: 5
          })
        );

        puff.position.x = (Math.random() - 0.5) * 40;
        puff.position.y = (Math.random() - 0.5) * 15;
        puff.position.z = (Math.random() - 0.5) * 25;
        puff.scale.set(
          1 + Math.random() * 0.5,
          0.6 + Math.random() * 0.3,
          1 + Math.random() * 0.4
        );

        cloudCluster.add(puff);
      }

      cloudCluster.position.x = Math.cos(angle) * radius;
      cloudCluster.position.y = Math.sin(angle) * radius;
      cloudCluster.position.z = -100;

      cloudGroup.add(cloudCluster);
    }
    scene.add(cloudGroup);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(60, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2266dd,
      emissive: 0x1144aa,
      emissiveIntensity: 0.5,
      shininess: 50
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, 0, -400);
    scene.add(earth);

    // Continents
    const continentGroup = new THREE.Group();
    const continentMaterials = {
      green1: new THREE.MeshStandardMaterial({ color: 0x3fa34d, roughness: 0.9, metalness: 0.0 }),
      green2: new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.9, metalness: 0.0 }),
      green3: new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.9, metalness: 0.0 }),
      green4: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.9, metalness: 0.0 }),
      green5: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9, metalness: 0.0 }),
      green6: new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.9, metalness: 0.0 })
    };

    const createFlatContinent = (lat, lon, width, height, materialKey) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 60.5;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const geometry = new THREE.PlaneGeometry(width, height);
      const patch = new THREE.Mesh(geometry, continentMaterials[materialKey]);
      patch.position.set(x, y, z);
      patch.lookAt(0, 0, 0);

      return patch;
    };

    [
      createFlatContinent(40, -100, 28, 20, 'green1'),
      createFlatContinent(50, -95, 22, 18, 'green2'),
      createFlatContinent(35, -110, 18, 14, 'green3'),
      createFlatContinent(-15, -60, 24, 18, 'green2'),
      createFlatContinent(-25, -55, 20, 16, 'green4'),
      createFlatContinent(50, 10, 30, 22, 'green5'),
      createFlatContinent(55, 20, 18, 16, 'green3'),
      createFlatContinent(0, 20, 26, 18, 'green4'),
      createFlatContinent(-10, 25, 22, 20, 'green2'),
      createFlatContinent(30, 80, 24, 16, 'green3'),
      createFlatContinent(45, 100, 28, 20, 'green1'),
      createFlatContinent(20, 75, 20, 14, 'green5'),
      createFlatContinent(-25, 135, 18, 14, 'green6'),
    ].forEach(c => continentGroup.add(c));

    continentGroup.position.copy(earth.position);
    scene.add(continentGroup);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(65, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x6699ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.copy(earth.position);
    scene.add(atmosphere);

    // Earth clouds
    const earthCloudGroup = new THREE.Group();
    const earthCloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      shininess: 5
    });

    for (let i = 0; i < 25; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 63;

      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(3 + Math.random() * 2, 6, 6),
        earthCloudMaterial.clone()
      );

      cloud.position.x = radius * Math.sin(theta) * Math.cos(phi);
      cloud.position.y = radius * Math.sin(theta) * Math.sin(phi);
      cloud.position.z = radius * Math.cos(theta);
      cloud.scale.set(1.5, 0.8, 1);

      earthCloudGroup.add(cloud);
    }
    earthCloudGroup.position.copy(earth.position);
    scene.add(earthCloudGroup);

    // POLLUTION LAYER - Swirling particles around atmosphere
    const pollutionGroup = new THREE.Group();
    const pollutionCount = 80;

    for (let i = 0; i < pollutionCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 66 + Math.random() * 4; // Just outside atmosphere

      const pollutionColors = [0x4a4a4a, 0x555555, 0x666666, 0x8B4513, 0x5a4a3a];
      const pollution = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + Math.random() * 2, 5, 5),
        new THREE.MeshBasicMaterial({
          color: pollutionColors[Math.floor(Math.random() * pollutionColors.length)],
          transparent: true,
          opacity: 0
        })
      );

      pollution.position.x = radius * Math.sin(theta) * Math.cos(phi);
      pollution.position.y = radius * Math.sin(theta) * Math.sin(phi);
      pollution.position.z = radius * Math.cos(theta);
      pollution.scale.set(2, 1, 1.5);

      pollution.userData = {
        orbitSpeed: 0.1 + Math.random() * 0.2,
        orbitPhase: Math.random() * Math.PI * 2,
        baseRadius: radius
      };

      pollutionGroup.add(pollution);
    }
    pollutionGroup.position.copy(earth.position);
    scene.add(pollutionGroup);

    // CITY GROUP
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -800);
    cityGroup.visible = false;

    // Materials
    const cityMaterials = {
      ground: new THREE.MeshStandardMaterial({ color: 0x4a7c39, roughness: 0.9, metalness: 0.0 }),
      dirt: new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.95 }),
      road: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.05 }),
      roadMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      edgeLine: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
      window: new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2244aa,
        emissiveIntensity: 0.3
      })
    };

    // Ground
    const cityGround = new THREE.Mesh(
      new THREE.PlaneGeometry(800, 800),
      cityMaterials.ground
    );
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.position.y = -10;
    cityGround.receiveShadow = true;
    cityGroup.add(cityGround);

    // Dirt patches
    for (let i = 0; i < 20; i++) {
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(5 + Math.random() * 10, 12),
        cityMaterials.dirt
      );
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        (Math.random() - 0.5) * 700,
        -9.9,
        (Math.random() - 0.5) * 700
      );
      patch.receiveShadow = true;
      cityGroup.add(patch);
    }

    // Roads
    for (let i = -3; i <= 3; i++) {
      const roadH = new THREE.Mesh(new THREE.PlaneGeometry(800, 14), cityMaterials.road);
      roadH.rotation.x = -Math.PI / 2;
      roadH.position.set(0, -9.5, i * 120);
      cityGroup.add(roadH);

      const roadV = new THREE.Mesh(new THREE.PlaneGeometry(14, 800), cityMaterials.road);
      roadV.rotation.x = -Math.PI / 2;
      roadV.position.set(i * 120, -9.5, 0);
      cityGroup.add(roadV);

      for (let j = -15; j <= 15; j += 2) {
        const marking = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), cityMaterials.roadMarking);
        marking.rotation.x = -Math.PI / 2;
        marking.position.set(0, -9.45, i * 120 + j * 15);
        cityGroup.add(marking);

        const markingV = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 6), cityMaterials.roadMarking);
        markingV.rotation.x = -Math.PI / 2;
        markingV.position.set(i * 120 + j * 15, -9.45, 0);
        cityGroup.add(markingV);
      }

      const edgeLine1 = new THREE.Mesh(new THREE.PlaneGeometry(800, 0.5), cityMaterials.edgeLine);
      edgeLine1.rotation.x = -Math.PI / 2;
      edgeLine1.position.set(5, -9.45, i * 120);
      cityGroup.add(edgeLine1);

      const edgeLine2 = new THREE.Mesh(new THREE.PlaneGeometry(800, 0.5), cityMaterials.edgeLine);
      edgeLine2.rotation.x = -Math.PI / 2;
      edgeLine2.position.set(-5, -9.45, i * 120);
      cityGroup.add(edgeLine2);
    }

    // Buildings (abbreviated for space - includes all building code)
    const buildingGroup = new THREE.Group();
    const buildingColors = [
      0xdc143c, 0xff6347, 0xff4500, 0xffa500, 0xffd700,
      0x32cd32, 0x228b22, 0x4169e1, 0x1e90ff, 0x00bfff,
      0x9370db, 0xba55d3, 0xff1493, 0xff69b4, 0x00ced1,
      0x20b2aa, 0xffa07a, 0xf08080
    ];

    for (let i = 0; i < 120; i++) {
      const width = 15 + Math.random() * 25;
      const height = 20 + Math.random() * 60;
      const depth = 15 + Math.random() * 25;

      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.6,
        metalness: 0.3
      });

      if (Math.random() > 0.5) {
        const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffff00];
        buildingMaterial.emissive = new THREE.Color(lightColors[Math.floor(Math.random() * lightColors.length)]);
        buildingMaterial.emissiveIntensity = 0.4;
      }

      const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMaterial);

      const blockX = Math.floor(Math.random() * 7) - 3;
      const blockZ = Math.floor(Math.random() * 7) - 3;
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetZ = (Math.random() - 0.5) * 80;

      building.position.set(blockX * 120 + offsetX, height / 2 - 10, blockZ * 120 + offsetZ);
      building.castShadow = true;
      building.receiveShadow = true;
      buildingGroup.add(building);
    }
    cityGroup.add(buildingGroup);

    // Vehicles
    const vehicleGroup = new THREE.Group();
    const vehicleColors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffff00, 0xff6600, 0xff0066, 0x00ff99, 0x9900ff];

    for (let i = 0; i < 30; i++) {
      const vehicle = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 5),
        new THREE.MeshStandardMaterial({
          color: vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
          roughness: 0.3,
          metalness: 0.7
        })
      );

      const isHorizontal = Math.random() > 0.5;
      const roadIndex = Math.floor(Math.random() * 7) - 3;

      if (isHorizontal) {
        vehicle.position.set((Math.random() - 0.5) * 700, -9, roadIndex * 120);
        vehicle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
      } else {
        vehicle.position.set(roadIndex * 120, -9, (Math.random() - 0.5) * 700);
        vehicle.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      }

      vehicle.userData = {
        isHorizontal,
        speed: 0.5 + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        roadIndex
      };

      vehicle.castShadow = true;
      vehicle.receiveShadow = true;
      vehicleGroup.add(vehicle);
    }
    cityGroup.add(vehicleGroup);

    // Birds
    const birdGroup = new THREE.Group();
    for (let i = 0; i < 15; i++) {
      const birdShape = new THREE.Group();
      const birdMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });

      const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 3), birdMat);
      leftWing.rotation.z = Math.PI / 4;
      leftWing.position.x = -0.8;
      birdShape.add(leftWing);

      const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 3), birdMat);
      rightWing.rotation.z = -Math.PI / 4;
      rightWing.position.x = 0.8;
      birdShape.add(rightWing);

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 4, 4), birdMat);
      birdShape.add(body);

      birdShape.position.set((Math.random() - 0.5) * 600, 20 + Math.random() * 80, (Math.random() - 0.5) * 600);

      birdShape.userData = {
        speed: 5 + Math.random() * 10,
        direction: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 2).normalize(),
        flapPhase: Math.random() * Math.PI * 2
      };

      birdGroup.add(birdShape);
    }
    cityGroup.add(birdGroup);

    // Industrial Zone
    const industrialZone = new THREE.Group();
    industrialZone.position.set(-350, 0, -200);

    for (let i = 0; i < 6; i++) {
      const factoryWidth = 40 + Math.random() * 30;
      const factoryHeight = 30 + Math.random() * 40;
      const factoryDepth = 40 + Math.random() * 30;

      const factory = new THREE.Mesh(
        new THREE.BoxGeometry(factoryWidth, factoryHeight, factoryDepth),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, metalness: 0.4 })
      );

      factory.position.set((i % 3) * 80 - 80, factoryHeight / 2 - 10, Math.floor(i / 3) * 80);
      factory.castShadow = true;
      factory.receiveShadow = true;
      industrialZone.add(factory);

      // Smokestacks
      const numStacks = 3 + Math.floor(Math.random() * 2);
      for (let s = 0; s < numStacks; s++) {
        const stack = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2.5, 20, 6),
          new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8, metalness: 0.3 })
        );

        stack.position.set(
          factory.position.x + (Math.random() - 0.5) * factoryWidth * 0.7,
          factory.position.y + factoryHeight / 2 + 10,
          factory.position.z + (Math.random() - 0.5) * factoryDepth * 0.7
        );

        stack.castShadow = true;
        industrialZone.add(stack);
      }
    }
    cityGroup.add(industrialZone);

    // Smoke particles
    const smokeGroup = new THREE.Group();
    for (let i = 0; i < 250; i++) {
      const isIndustrial = i < 180;
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(isIndustrial ? 1.5 + Math.random() * 2.5 : 0.8 + Math.random() * 1.2, 6, 6),
        new THREE.MeshBasicMaterial({ color: isIndustrial ? 0x4a4a4a : 0x666666, transparent: true, opacity: 0 })
      );

      if (isIndustrial) {
        smoke.position.set(-350 + (Math.random() - 0.5) * 250, -5 + Math.random() * 40, -200 + (Math.random() - 0.5) * 200);
      } else {
        smoke.position.set((Math.random() - 0.5) * 600, -5 + Math.random() * 30, (Math.random() - 0.5) * 600);
      }

      smoke.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * (isIndustrial ? 0.15 : 0.08),
          (isIndustrial ? 0.25 : 0.15) + Math.random() * 0.35,
          (Math.random() - 0.5) * (isIndustrial ? 0.15 : 0.08)
        ),
        life: Math.random() * 4,
        maxLife: isIndustrial ? 6 + Math.random() * 5 : 4 + Math.random() * 3,
        isIndustrial: isIndustrial
      };

      smokeGroup.add(smoke);
    }
    cityGroup.add(smokeGroup);

    scene.add(cityGroup);

    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, -100);

    // Animation
    let time = 0;
    let phase = 'loading';
    let phaseStartTime = 0;
    const clock = new THREE.Clock();
    let followVehicle = null;

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      if (phase === 'loading') {
        const progress = Math.min(time / 2, 1);
        setLoadingProgress(Math.floor(progress * 100));
        if (time >= 2) {
          phase = 'clouds-opening';
          phaseStartTime = time;
          setCurrentScene('intro');
          setSkipVisible(true);
        }
      }
      else if (phase === 'clouds-opening') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 3, 1);

        // Show welcome text
        if (phaseTime > 0.5 && phaseTime < 2.8) {
          setShowAwarenessText(true);
          setAwarenessText('Welcome to Eco-Tracker App');
        } else if (phaseTime >= 2.8) {
          setShowAwarenessText(false);
        }

        cloudGroup.children.forEach((cloudCluster, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = 80 + progress * 220;
          cloudCluster.position.x = Math.cos(angle) * distance;
          cloudCluster.position.y = Math.sin(angle) * distance;
          cloudCluster.children.forEach(cloud => { cloud.material.opacity = 0.95 - progress * 0.95; });
          cloudCluster.rotation.z = progress * 0.2;
          const scale = 1 + progress * 0.3;
          cloudCluster.scale.set(scale, scale, scale);
        });

        if (phaseTime >= 3) { phase = 'earth-rotation'; phaseStartTime = time; }
      }
      else if (phase === 'earth-rotation') {
        const phaseTime = time - phaseStartTime;
        earth.rotation.y += delta * 0.4;
        continentGroup.rotation.y += delta * 0.4;
        pollutionGroup.rotation.y += delta * 0.35;

        // Show pollution particles gradually
        pollutionGroup.children.forEach((p, i) => {
          p.material.opacity = Math.min(0.5, phaseTime * 0.2);
        });

        if (phaseTime >= 3) { phase = 'zoom-earth'; phaseStartTime = time; }
      }
      else if (phase === 'zoom-earth') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 4, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Show CO2 statistics text
        if (phaseTime > 0.5 && phaseTime < 3.5) {
          setShowAwarenessText(true);
          setAwarenessText('Every day 100+ million tonnes of CO2 and other gases are released from human activities');
        } else if (phaseTime >= 3.5) {
          setShowAwarenessText(false);
        }

        camera.position.z = 100 - easeProgress * 300;
        camera.lookAt(0, 0, -400);
        earth.rotation.y += delta * 0.3;
        continentGroup.rotation.y += delta * 0.3;
        pollutionGroup.rotation.y += delta * 0.25;
        earthCloudGroup.children.forEach(cloud => { cloud.material.opacity = easeProgress * 0.7; });
        earthCloudGroup.rotation.y += delta * 0.2;

        // Pollution becomes more visible as we zoom in
        pollutionGroup.children.forEach(p => {
          p.material.opacity = 0.5 + easeProgress * 0.3;
        });

        if (phaseTime >= 4) { phase = 'atmosphere'; phaseStartTime = time; }
      }
      else if (phase === 'atmosphere') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 3, 1);

        camera.position.z = -200 - progress * 350;
        camera.lookAt(0, 0, -800);
        starMaterial.opacity = 1 - progress * 0.8;
        earthCloudGroup.children.forEach(cloud => { cloud.material.opacity = 0.7 + progress * 0.2; });

        // Fade pollution as we enter atmosphere
        pollutionGroup.children.forEach(p => {
          p.material.opacity = Math.max(0, 0.8 - progress * 0.8);
        });

        // Transition background from black to sky blue
        const r = progress * 0.53;
        const g = progress * 0.81;
        const b = progress * 0.92;
        scene.background.setRGB(r, g, b);

        if (phaseTime >= 3) { phase = 'reveal-city'; phaseStartTime = time; }
      }
      else if (phase === 'reveal-city') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 4, 1);

        // Show contributors text
        if (phaseTime > 0.8 && phaseTime < 3.5) {
          setShowAwarenessText(true);
          setAwarenessText('Major contributors are urban cities and industrial sites');
        } else if (phaseTime >= 3.5) {
          setShowAwarenessText(false);
        }

        if (phaseTime > 0.5 && !cityGroup.visible) { cityGroup.visible = true; }

        camera.position.y = -progress * 100 + 200;
        camera.position.z = -550 - progress * 200;
        camera.lookAt(0, 0, -800);

        earthCloudGroup.children.forEach(cloud => { cloud.material.opacity = 0.9 - progress * 0.9; });
        earth.material.opacity = 1 - progress * 0.5;
        earth.material.transparent = true;
        continentGroup.children.forEach(continent => {
          continent.material.opacity = 1 - progress * 0.5;
          continent.material.transparent = true;
        });

        if (phaseTime >= 4) { phase = 'drone-overview'; phaseStartTime = time; }
      }
      else if (phase === 'drone-overview') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 5, 1);

        const sweepAngle = progress * Math.PI * 0.5;
        camera.position.x = 200 * Math.sin(sweepAngle);
        camera.position.y = 200 - progress * 50;
        camera.position.z = -600 - 200 * Math.cos(sweepAngle);
        camera.lookAt(0, 0, -800);

        vehicleGroup.children.forEach(vehicle => {
          const { isHorizontal, speed, direction } = vehicle.userData;
          if (isHorizontal) {
            vehicle.position.x += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.x) > 400) vehicle.position.x = -400 * direction;
          } else {
            vehicle.position.z += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.z) > 400) vehicle.position.z = -400 * direction;
          }
        });

        if (phaseTime >= 5) {
          followVehicle = vehicleGroup.children[0];
          phase = 'vehicle-perspective';
          phaseStartTime = time;
        }
      }
      else if (phase === 'vehicle-perspective') {
        const phaseTime = time - phaseStartTime;

        if (followVehicle) {
          const offset = new THREE.Vector3(0, 3, 15);
          offset.applyQuaternion(followVehicle.quaternion);
          camera.position.copy(followVehicle.position).add(offset);

          const lookAhead = followVehicle.position.clone();
          const forwardVector = new THREE.Vector3(0, 0, -10);
          forwardVector.applyQuaternion(followVehicle.quaternion);
          lookAhead.add(forwardVector);
          lookAhead.y += 1;
          camera.lookAt(lookAhead);

          const { isHorizontal, speed, direction } = followVehicle.userData;
          if (isHorizontal) {
            followVehicle.position.x += speed * direction * delta * 20;
          } else {
            followVehicle.position.z += speed * direction * delta * 20;
          }
        }

        vehicleGroup.children.forEach(vehicle => {
          if (vehicle === followVehicle) return;
          const { isHorizontal, speed, direction } = vehicle.userData;
          if (isHorizontal) {
            vehicle.position.x += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.x) > 400) vehicle.position.x = -400 * direction;
          } else {
            vehicle.position.z += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.z) > 400) vehicle.position.z = -400 * direction;
          }
        });

        if (phaseTime >= 4) { phase = 'transition-to-drone'; phaseStartTime = time; }
      }
      else if (phase === 'transition-to-drone') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 3, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        if (followVehicle) {
          const startPos = followVehicle.position.clone();
          startPos.y += 3; startPos.z += 15;
          const endPos = new THREE.Vector3(100, 120, -700);
          camera.position.lerpVectors(startPos, endPos, easeProgress);

          const lookAtStart = followVehicle.position.clone();
          lookAtStart.y += 1;
          const lookAtEnd = new THREE.Vector3(-350, 0, -200 - 800);
          const currentLookAt = new THREE.Vector3().lerpVectors(lookAtStart, lookAtEnd, easeProgress);
          camera.lookAt(currentLookAt);

          const { isHorizontal, speed, direction } = followVehicle.userData;
          if (isHorizontal) {
            followVehicle.position.x += speed * direction * delta * 20;
          } else {
            followVehicle.position.z += speed * direction * delta * 20;
          }
        }

        vehicleGroup.children.forEach(vehicle => {
          const { isHorizontal, speed, direction } = vehicle.userData;
          if (isHorizontal) {
            vehicle.position.x += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.x) > 400) vehicle.position.x = -400 * direction;
          } else {
            vehicle.position.z += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.z) > 400) vehicle.position.z = -400 * direction;
          }
        });

        if (phaseTime >= 3) { phase = 'industrial-approach'; phaseStartTime = time; }
      }
      else if (phase === 'industrial-approach') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 4, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const startPos = new THREE.Vector3(100, 120, -700);
        const endPos = new THREE.Vector3(-350, 80, -200 - 800 + 150);
        camera.position.lerpVectors(startPos, endPos, easeProgress);
        camera.lookAt(-350, 20, -200 - 800);

        smokeGroup.children.forEach(smoke => {
          smoke.userData.life += delta;
          if (smoke.userData.life > smoke.userData.maxLife) {
            if (smoke.userData.isIndustrial) {
              smoke.position.set(-350 + (Math.random() - 0.5) * 250, -5 + Math.random() * 10, -200 + (Math.random() - 0.5) * 200);
            } else {
              smoke.position.set((Math.random() - 0.5) * 600, -5 + Math.random() * 5, (Math.random() - 0.5) * 600);
            }
            smoke.userData.life = 0;
            smoke.material.opacity = 0;
          } else {
            smoke.position.add(smoke.userData.velocity);
            const opacityMult = smoke.userData.isIndustrial ? 0.6 : 0.4;
            smoke.material.opacity = Math.min(opacityMult, smoke.userData.life * 0.15) * Math.max(0, 1 - smoke.userData.life / smoke.userData.maxLife);
            smoke.scale.setScalar(1 + smoke.userData.life * (smoke.userData.isIndustrial ? 0.4 : 0.2));
          }
        });

        if (phaseTime >= 4) { phase = 'industrial-focus'; phaseStartTime = time; }
      }
      else if (phase === 'industrial-focus') {
        const phaseTime = time - phaseStartTime;

        // Show industrial sector statistics
        if (phaseTime > 0.5 && phaseTime < 4.5) {
          setShowAwarenessText(true);
          setAwarenessText('Industrial sector contributes about 51% of CO₂ emissions in India');
        } else if (phaseTime >= 4.5) {
          setShowAwarenessText(false);
        }

        const orbitAngle = phaseTime * 0.2;
        const orbitRadius = 120;
        camera.position.x = -350 + Math.cos(orbitAngle) * orbitRadius;
        camera.position.y = 60 + Math.sin(phaseTime * 0.3) * 20;
        camera.position.z = -200 - 800 + Math.sin(orbitAngle) * orbitRadius;
        camera.lookAt(-350, 30, -200 - 800);

        smokeGroup.children.forEach(smoke => {
          smoke.userData.life += delta;
          if (smoke.userData.life > smoke.userData.maxLife) {
            if (smoke.userData.isIndustrial) {
              smoke.position.set(-350 + (Math.random() - 0.5) * 250, -5 + Math.random() * 10, -200 + (Math.random() - 0.5) * 200);
            } else {
              smoke.position.set((Math.random() - 0.5) * 600, -5 + Math.random() * 5, (Math.random() - 0.5) * 600);
            }
            smoke.userData.life = 0;
            smoke.material.opacity = 0;
          } else {
            smoke.position.add(smoke.userData.velocity);
            const opacityMult = smoke.userData.isIndustrial ? 0.7 : 0.4;
            smoke.material.opacity = Math.min(opacityMult, smoke.userData.life * 0.15) * Math.max(0, 1 - smoke.userData.life / smoke.userData.maxLife);
            smoke.scale.setScalar(1 + smoke.userData.life * (smoke.userData.isIndustrial ? 0.5 : 0.2));
          }
        });

        if (phaseTime >= 5) { phase = 'final-pullback'; phaseStartTime = time; }
      }
      else if (phase === 'final-pullback') {
        const phaseTime = time - phaseStartTime;
        const progress = Math.min(phaseTime / 4, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const startPos = new THREE.Vector3(-350 + Math.cos(phaseTime * 0.2) * 120, 60, -200 - 800 + Math.sin(phaseTime * 0.2) * 120);
        const endPos = new THREE.Vector3(0, 180, -750);
        camera.position.lerpVectors(startPos, endPos, easeProgress);
        camera.lookAt(0, 0, -800);

        birdGroup.children.forEach(bird => {
          const { speed, direction } = bird.userData;
          bird.position.x += direction.x * speed * delta;
          bird.position.y += direction.y * speed * delta * 0.3;
          bird.position.z += direction.z * speed * delta;

          bird.userData.flapPhase += delta * 10;
          const flapAngle = Math.sin(bird.userData.flapPhase) * 0.5;
          bird.children[0].rotation.z = Math.PI / 4 + flapAngle;
          bird.children[1].rotation.z = -Math.PI / 4 - flapAngle;

          if (Math.abs(bird.position.x) > 350) bird.userData.direction.x *= -1;
          if (Math.abs(bird.position.z) > 350) bird.userData.direction.z *= -1;
          if (bird.position.y < 20 || bird.position.y > 100) bird.userData.direction.y *= -1;
        });

        smokeGroup.children.forEach(smoke => {
          smoke.userData.life += delta;
          if (smoke.userData.life > smoke.userData.maxLife) {
            if (smoke.userData.isIndustrial) {
              smoke.position.set(-350 + (Math.random() - 0.5) * 250, -5 + Math.random() * 10, -200 + (Math.random() - 0.5) * 200);
            } else {
              smoke.position.set((Math.random() - 0.5) * 600, -5 + Math.random() * 5, (Math.random() - 0.5) * 600);
            }
            smoke.userData.life = 0;
            smoke.material.opacity = 0;
          } else {
            smoke.position.add(smoke.userData.velocity);
            const opacityMult = smoke.userData.isIndustrial ? 0.5 : 0.4;
            smoke.material.opacity = Math.min(opacityMult, smoke.userData.life * 0.1) * Math.max(0, 1 - smoke.userData.life / smoke.userData.maxLife);
            smoke.scale.setScalar(1 + smoke.userData.life * (smoke.userData.isIndustrial ? 0.3 : 0.2));
          }
        });

        vehicleGroup.children.forEach(vehicle => {
          const { isHorizontal, speed, direction } = vehicle.userData;
          if (isHorizontal) {
            vehicle.position.x += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.x) > 400) vehicle.position.x = -400 * direction;
          } else {
            vehicle.position.z += speed * direction * delta * 20;
            if (Math.abs(vehicle.position.z) > 400) vehicle.position.z = -400 * direction;
          }
        });

        if (phaseTime >= 4) {
          phase = 'complete';
          if (onComplete) {
            onComplete();
          } else {
            setCurrentScene('gameplay');
          }
        }
      }

      stars.rotation.y += delta * 0.01;
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    } 
    navigate("/login");
  };

  return (
    <div className="game-intro-container">
      <div ref={containerRef} className="canvas-container"></div>

      {currentScene === 'loading' && (
        <div className="loading-screen">
          <div className="loading-content">
            <h1 className="game-title">EARTH'S LAST HOPE</h1>
            <div className="loading-bar">
              <div className="loading-fill" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="loading-text">Loading... {loadingProgress}%</p>
          </div>
        </div>
      )}

      {currentScene === 'intro' && skipVisible && (
        <button className="skip-button" onClick={handleSkip}>
          Skip Intro →
        </button>
      )}

      {/* Premium Awareness Text Overlay */}
      {showAwarenessText && (
        <div className="awareness-overlay">
          <div className="awareness-text-container">
            <h2 className="awareness-text">{awarenessText}</h2>
          </div>
        </div>
      )}

      {currentScene === 'gameplay' && (
        <div className="gameplay-ui">
          <div className="gameplay-content">
            <h2 className="gameplay-title">Welcome to the City</h2>
            <p className="gameplay-subtitle">Your mission to save Earth begins here...</p>
            <button className="start-button" onClick={handleSkip}>Start Game</button>
          </div>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .game-intro-container { width: 100vw; height: 100vh; overflow: hidden; background: #000000; position: relative; }
        .canvas-container { width: 100%; height: 100%; }
        .loading-screen { position: absolute; inset: 0; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); display: flex; align-items: center; justify-content: center; z-index: 10; }
        .loading-content { text-align: center; max-width: 600px; padding: 20px; }
        .game-title { font-size: 64px; font-weight: 900; background: linear-gradient(135deg, #4a90e2, #50c878); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 40px; letter-spacing: 4px; text-transform: uppercase; animation: titleGlow 2s ease-in-out infinite; }
        @keyframes titleGlow { 0%, 100% { filter: drop-shadow(0 0 20px rgba(74, 144, 226, 0.5)); } 50% { filter: drop-shadow(0 0 30px rgba(80, 200, 120, 0.7)); } }
        .loading-bar { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        .loading-fill { height: 100%; background: linear-gradient(90deg, #4a90e2, #50c878); border-radius: 10px; transition: width 0.3s ease; box-shadow: 0 0 20px rgba(74, 144, 226, 0.6); }
        .loading-text { color: rgba(255, 255, 255, 0.7); font-size: 16px; font-weight: 500; letter-spacing: 2px; }
        .skip-button { position: absolute; bottom: 40px; right: 40px; padding: 14px 28px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 30px; color: #ffffff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; z-index: 10; }
        .skip-button:hover { background: rgba(255, 255, 255, 0.2); transform: translateX(5px); }
        .gameplay-ui { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10; }
        .gameplay-content { text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .gameplay-title { font-size: 48px; font-weight: 800; color: #ffffff; margin-bottom: 16px; }
        .gameplay-subtitle { font-size: 18px; color: rgba(255, 255, 255, 0.8); margin-bottom: 32px; }
        .start-button { padding: 16px 48px; background: linear-gradient(135deg, #4a90e2, #50c878); border: none; border-radius: 30px; color: #ffffff; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 24px rgba(74, 144, 226, 0.4); }
        .start-button:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(74, 144, 226, 0.6); }
        @media (max-width: 768px) { .game-title { font-size: 40px; } .skip-button { bottom: 20px; right: 20px; padding: 12px 24px; } .gameplay-title { font-size: 36px; } .awareness-text { font-size: 24px !important; } }
        
        /* PREMIUM AWARENESS TEXT OVERLAY */
        .awareness-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 15;
          pointer-events: none;
          animation: fadeInOverlay 0.5s ease-out;
        }
        
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .awareness-text-container {
          max-width: 900px;
          padding: 30px 50px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .awareness-text {
          font-size: 36px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 3px;
          line-height: 1.4;
          background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 30%, #f472b6 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textGlow 2s ease-in-out infinite, scaleIn 0.6s ease-out;
          text-shadow: none;
        }
        
        @keyframes textGlow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 60px rgba(124, 58, 237, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(244, 114, 182, 0.7)) drop-shadow(0 0 80px rgba(251, 191, 36, 0.5));
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
