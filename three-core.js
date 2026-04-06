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
  // Inner glowing core
  const coreGeometry = new THREE.IcosahedronGeometry(1.0, 1);
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0x4a7cff,
    emissive: 0x4a7cff,
    emissiveIntensity: 0.3,
    shininess: 100,
    flatShading: true,
    transparent: true,
    opacity: 0.9
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  
  // Outer Wireframe Shell
  const shellGeometry = new THREE.IcosahedronGeometry(1.6, 1);
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: 0x00e5c8,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);

  // Particle Vector Orbit - Enlarged vastly to spill outside
  const particleCount = 500;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for(let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    // creating a sphere distribution of particles around the core
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 2.5 + Math.random() * 8.5; // Massive orbital radius
    
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00e5c8,
    size: 0.04,
    transparent: true,
    opacity: 0.8
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);

  // Add elements to specialized Groups for independent scaling
  const dataCoreGroup = new THREE.Group();
  const shellGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  
  dataCoreGroup.add(core); // Core remains fixed scale
  
  shellGroup.add(shell);
  particleGroup.add(particles);
  
  dataCoreGroup.add(shellGroup);
  dataCoreGroup.add(particleGroup); // Combine so rotations affect everything together
  scene.add(dataCoreGroup);

  // Shrink the entire payload slightly relative to standard size scale as requested
  dataCoreGroup.scale.set(0.85, 0.85, 0.85);

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x4a7cff, 2, 10);
  pointLight.position.set(3, 3, 3);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x00e5c8, 2, 10);
  pointLight2.position.set(-3, -3, -3);
  scene.add(pointLight2);

  // 6. Animation Loop (Passive Rotation)
  const clock = new THREE.Clock();
  
  const animate = () => {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Subtle idle rotations
    core.rotation.y = elapsedTime * 0.3;
    core.rotation.x = elapsedTime * 0.15;
    
    shell.rotation.y = -elapsedTime * 0.1;
    shell.rotation.z = elapsedTime * 0.05;
    
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.z = Math.sin(elapsedTime * 0.2) * 0.1;
    
    // Core breathing effect
    const scaleBreathing = 1 + Math.sin(elapsedTime * 2) * 0.05;
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
