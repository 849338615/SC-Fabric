document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('three-cyber-core');
  if (!container || typeof THREE === 'undefined') return;

  // 1. Scene Setup
  const scene = new THREE.Scene();
  
  // 2. Camera Setup
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 7; // Pulled back significantly to prevent native clipping

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // performance
  container.appendChild(renderer.domElement);

  // 4. Geometry & Materials
  // A. Core: Smooth Liquid Glass Shell
  const coreGeometry = new THREE.SphereGeometry(0.8, 64, 64);
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1e6ca0, // Vibrant blue base
    emissive: 0x0a3c8a,
    emissiveIntensity: 0.7,
    roughness: 0.0, // Perfectly smooth glass
    metalness: 0.2, // Lower metalness allows more internal light out
    transmission: 0.95,
    thickness: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transparent: true,
    opacity: 1.0
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);

  // B. High-Energy Nucleus (Intensely glowing orb inside the glass)
  const innerGeometry = new THREE.SphereGeometry(0.65, 32, 32);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x00e5c8,
    transparent: true,
    opacity: 0.9
  });
  const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
  core.add(innerCore); // Anchored inside so the glass refracts it

  // C. Inner Quantum Rings (Sleek tech gyroscope lines)
  const ringGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(1.2 + i * 0.15, 0.008, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5c8,
      transparent: true,
      opacity: 0.8 - (i * 0.1),
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    ring.userData = { 
      speedX: (Math.random() - 0.5) * 0.012, 
      speedY: (Math.random() - 0.5) * 0.012 
    };
    ringGroup.add(ring);
  }

  // D. Subtle Outer Holographic Grid (High Res Wireframe Sphere)
  const gridGeo = new THREE.SphereGeometry(1.6, 32, 32);
  const edges = new THREE.EdgesGeometry(gridGeo);
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x4a7cff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  const shell = new THREE.LineSegments(edges, gridMat); // Retaining 'shell' variable binding for GSAP

  // D. Particle Vector Orbit - High Density Structured Cloud
  const particleCount = 2000;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for(let i = 0; i < particleCount; i++) {
    // Distribute precisely on defined orbital volumes for structured 'data shell' look
    const isInnerShell = Math.random() > 0.6;
    const r = isInnerShell ? (1.8 + Math.random() * 0.3) : (2.5 + Math.random() * 6.5);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos((Math.random() * 2) - 1.0);
    
    particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  // Helper explicitly renders perfect circular particles instead of default squares
  const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  };

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00e5c8, // Shifted to vibrant cyan
    size: 0.07, // Enlarged slightly for higher visibility
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);

  // Add elements to specialized Groups for independent scaling
  const dataCoreGroup = new THREE.Group();
  const shellGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  
  dataCoreGroup.add(core); // Core remains fixed scale
  dataCoreGroup.add(ringGroup); // Rings rotate internally
  
  shellGroup.add(shell);
  particleGroup.add(particles);
  
  dataCoreGroup.add(shellGroup);
  dataCoreGroup.add(particleGroup); // Combine so rotations affect everything together
  scene.add(dataCoreGroup);

  // Shrink the entire payload slightly relative to standard size scale as requested
  dataCoreGroup.scale.set(0.85, 0.85, 0.85);

  // 5. Lighting - Upgraded for Glass Refractions
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4a7cff, 4);
  scene.add(hemiLight);

  const pointLight = new THREE.PointLight(0x00e5c8, 30, 20);
  pointLight.position.set(0, 0, 0); // Ignites the glass core from the inside out
  scene.add(pointLight);

  const keyLight = new THREE.PointLight(0xffffff, 20, 20);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);

  // 6. Animation Loop (Passive Rotation)
  const clock = new THREE.Clock();
  
  const animate = () => {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Smooth, premium idle rotations
    core.rotation.y = elapsedTime * 0.08;
    core.rotation.x = elapsedTime * 0.04;
    
    // Rotate internal rings independently
    ringGroup.children.forEach(ring => {
      ring.rotation.x += ring.userData.speedX;
      ring.rotation.y += ring.userData.speedY;
    });
    
    shell.rotation.y = -elapsedTime * 0.05;
    shell.rotation.z = elapsedTime * 0.02;
    
    particles.rotation.y = elapsedTime * 0.03;
    particles.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
    
    // Core breathing effect
    const scaleBreathing = 1 + Math.sin(elapsedTime * 1.5) * 0.015;
    core.scale.set(scaleBreathing, scaleBreathing, scaleBreathing);
    
    // Ambient floating
    dataCoreGroup.position.y = Math.sin(elapsedTime) * 0.15;

    renderer.render(scene, camera);
  };
  
  animate();

  // 7. Responsive Resizing
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 8. GSAP ScrollTrigger "ScrollyTelling" Integration
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Wireframe expands very minimally so it stays tight to the core
    shellGroup.scale.set(1.4, 1.4, 1.4);
    
    // Particles expand massively into the section above
    particleGroup.scale.set(6, 6, 6);

    // Condense the orbital scatter down to proper shell size
    gsap.to([shellGroup.scale, particleGroup.scale], {
      x: 1, y: 1, z: 1,
      scrollTrigger: {
        trigger: '.why-titan',
        start: "top 110%", // Trigger slightly before it enters
        end: "top 30%",
        scrub: 1.5,
      }
    });

    // Epic spin of the entire geometric cluster
    gsap.to(dataCoreGroup.rotation, {
      y: Math.PI * 3.5,
      z: Math.PI / 4,
      scrollTrigger: {
        trigger: '.why-titan',
        start: "top 110%",
        end: "bottom top",
        scrub: 1.5,
      }
    });
  }
});
