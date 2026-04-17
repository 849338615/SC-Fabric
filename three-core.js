// ═══════════════════════════════════════════════════════════════════════════
// DATA VAULT CORE — Cinematic Scroll-Animated Data Security Visualization
// ═══════════════════════════════════════════════════════════════════════════
// Replaces the Three.js globe with a layered encryption architecture:
//   Layer 0: Inner Core — glowing data nucleus (icosahedron)
//   Layer 1: Encryption Ring — rotating hexagonal lattice shield
//   Layer 2: Key Orbit — floating key geometry orbiting the core
//   Layer 3: Data Flow — particle streams between layers
//   Layer 4: Outer Shell — wireframe dodecahedron sentinel boundary
//
// Scroll-driven: layers scatter on approach → condense into unified vault
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('three-cyber-core');
  if (!container || typeof THREE === 'undefined') return;

  // ── Scene, Camera, Renderer ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // ── Color Palette ──
  const TEAL       = 0x00e5c8;
  const BLUE       = 0x4a7cff;
  const DEEP_BLUE  = 0x1a3a8a;
  const CYAN       = 0x00b4d8;
  const WHITE      = 0xffffff;

  // ── Helper: Create circular particle texture ──
  const createGlowTexture = (color = '255,255,255') => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${color},1)`);
    gradient.addColorStop(0.3, `rgba(${color},0.6)`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  };

  // ── Master Group ──
  const vaultGroup = new THREE.Group();
  scene.add(vaultGroup);
  vaultGroup.scale.set(0.9, 0.9, 0.9);

  // ════════════════════════════════════════════
  // LAYER 0: INNER DATA CORE — Glowing Nucleus
  // ════════════════════════════════════════════
  const coreGroup = new THREE.Group();
  
  // Inner solid core — icosahedron for "data crystal"
  const coreGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: TEAL,
    emissive: TEAL,
    emissiveIntensity: 0.8,
    roughness: 0.0,
    metalness: 0.3,
    transmission: 0.6,
    thickness: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transparent: true,
    opacity: 0.95
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreGroup.add(coreMesh);

  // Core wireframe overlay for "digital data" feel
  const coreWireGeo = new THREE.IcosahedronGeometry(0.52, 1);
  const coreEdges = new THREE.EdgesGeometry(coreWireGeo);
  const coreWireMat = new THREE.LineBasicMaterial({
    color: WHITE,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const coreWire = new THREE.LineSegments(coreEdges, coreWireMat);
  coreGroup.add(coreWire);

  // Core point light — illuminates from within
  const coreLight = new THREE.PointLight(TEAL, 15, 12);
  coreGroup.add(coreLight);

  vaultGroup.add(coreGroup);

  // ════════════════════════════════════════════
  // LAYER 1: ENCRYPTION LATTICE — Hexagonal Shield Rings
  // ════════════════════════════════════════════
  const latticeGroup = new THREE.Group();

  // Create 3 concentric hexagonal torus rings at different axes
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(1.1 + i * 0.18, 0.012, 6, 6);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? TEAL : (i === 1 ? CYAN : BLUE),
      transparent: true,
      opacity: 0.7 - i * 0.1,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);

    // Each ring on a distinct axis for gyroscope effect
    if (i === 0) { ring.rotation.x = 0; }
    if (i === 1) { ring.rotation.x = Math.PI / 2.2; ring.rotation.z = Math.PI / 6; }
    if (i === 2) { ring.rotation.x = Math.PI / 3; ring.rotation.y = Math.PI / 4; }

    ring.userData = {
      speedX: (0.008 + i * 0.003) * (i % 2 === 0 ? 1 : -1),
      speedY: (0.006 + i * 0.002) * (i % 2 === 0 ? -1 : 1),
      baseOpacity: 0.7 - i * 0.1
    };
    latticeGroup.add(ring);
  }

  // Add hexagonal "shield nodes" at ring intersections
  const shieldNodeGeo = new THREE.OctahedronGeometry(0.04, 0);
  const shieldNodeMat = new THREE.MeshBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const r = 1.1 + (i % 3) * 0.18;
    const node = new THREE.Mesh(shieldNodeGeo, shieldNodeMat.clone());
    node.position.set(
      r * Math.cos(angle),
      r * Math.sin(angle) * Math.cos(i * 0.5),
      r * Math.sin(angle) * Math.sin(i * 0.5)
    );
    node.userData = { orbitAngle: angle, orbitRadius: r, orbitSpeed: 0.005 + (i % 3) * 0.002, axis: i % 3 };
    latticeGroup.add(node);
  }

  vaultGroup.add(latticeGroup);

  // ════════════════════════════════════════════
  // LAYER 2: KEY ORBIT — Floating Key Geometries
  // ════════════════════════════════════════════
  const keyOrbitGroup = new THREE.Group();

  // Create 5 floating "key" shapes — stylized geometric keys
  const createKeyShape = () => {
    const group = new THREE.Group();

    // Key body: elongated box
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.04, 0.02);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: TEAL,
      emissive: TEAL,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Key head: small octahedron
    const headGeo = new THREE.OctahedronGeometry(0.035, 0);
    const headMat = new THREE.MeshBasicMaterial({
      color: WHITE,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.x = -0.07;
    group.add(head);

    // Key teeth: small boxes
    for (let t = 0; t < 2; t++) {
      const toothGeo = new THREE.BoxGeometry(0.015, 0.025, 0.02);
      const tooth = new THREE.Mesh(toothGeo, bodyMat.clone());
      tooth.position.set(0.03 + t * 0.025, -0.025, 0);
      group.add(tooth);
    }

    return group;
  };

  for (let k = 0; k < 5; k++) {
    const key = createKeyShape();
    const angle = (k / 5) * Math.PI * 2;
    const r = 1.8;

    key.position.set(
      r * Math.cos(angle),
      (Math.random() - 0.5) * 0.6,
      r * Math.sin(angle)
    );
    key.rotation.z = angle + Math.PI / 2;
    key.userData = {
      orbitAngle: angle,
      orbitRadius: r,
      orbitSpeed: 0.004,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 0.6 + Math.random() * 0.4
    };
    keyOrbitGroup.add(key);
  }

  vaultGroup.add(keyOrbitGroup);

  // ════════════════════════════════════════════
  // LAYER 3: DATA FLOW — Streaming Particles
  // ════════════════════════════════════════════
  const particleGroup = new THREE.Group();

  // Inner shell particles (tight cluster around core)
  const innerParticleCount = 600;
  const innerPositions = new Float32Array(innerParticleCount * 3);
  const innerSizes = new Float32Array(innerParticleCount);

  for (let i = 0; i < innerParticleCount; i++) {
    const r = 0.7 + Math.random() * 1.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    innerPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    innerPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    innerPositions[i * 3 + 2] = r * Math.cos(phi);
    innerSizes[i] = 0.03 + Math.random() * 0.05;
  }

  const innerParticleGeo = new THREE.BufferGeometry();
  innerParticleGeo.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
  // Note: PointsMaterial doesnt support per-particle size without shaders, use uniform size
  const innerParticleMat = new THREE.PointsMaterial({
    color: TEAL,
    size: 0.06,
    map: createGlowTexture('0,229,200'),
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const innerParticles = new THREE.Points(innerParticleGeo, innerParticleMat);
  particleGroup.add(innerParticles);

  // Outer sentinel particles (wide field, smaller, dimmer)
  const outerParticleCount = 1200;
  const outerPositions = new Float32Array(outerParticleCount * 3);

  for (let i = 0; i < outerParticleCount; i++) {
    const isShell = Math.random() > 0.5;
    const r = isShell ? (2.2 + Math.random() * 0.5) : (3.0 + Math.random() * 5.0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    outerPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    outerPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    outerPositions[i * 3 + 2] = r * Math.cos(phi);
  }

  const outerParticleGeo = new THREE.BufferGeometry();
  outerParticleGeo.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
  const outerParticleMat = new THREE.PointsMaterial({
    color: BLUE,
    size: 0.04,
    map: createGlowTexture('74,124,255'),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outerParticles = new THREE.Points(outerParticleGeo, outerParticleMat);
  particleGroup.add(outerParticles);

  vaultGroup.add(particleGroup);

  // ════════════════════════════════════════════
  // LAYER 4: OUTER SENTINEL SHELL — Wireframe Dodecahedron
  // ════════════════════════════════════════════
  const shellGroup = new THREE.Group();

  const shellGeo = new THREE.DodecahedronGeometry(2.0, 0);
  const shellEdges = new THREE.EdgesGeometry(shellGeo);
  const shellMat = new THREE.LineBasicMaterial({
    color: BLUE,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const shellMesh = new THREE.LineSegments(shellEdges, shellMat);
  shellGroup.add(shellMesh);

  // Secondary inner shell — dodecahedron rotated for interlocking pattern
  const shell2Geo = new THREE.DodecahedronGeometry(1.7, 0);
  const shell2Edges = new THREE.EdgesGeometry(shell2Geo);
  const shell2Mat = new THREE.LineBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const shell2Mesh = new THREE.LineSegments(shell2Edges, shell2Mat);
  shell2Mesh.rotation.y = Math.PI / 5;
  shell2Mesh.rotation.x = Math.PI / 7;
  shellGroup.add(shell2Mesh);

  // Vertex highlight nodes on outer shell
  const shellVertices = shellGeo.getAttribute('position');
  const vertexNodeGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const vertexNodeMat = new THREE.MeshBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  // Track unique vertices (dodecahedron has repeated verts)
  const uniqueVerts = new Set();
  for (let i = 0; i < shellVertices.count; i++) {
    const key = `${shellVertices.getX(i).toFixed(2)},${shellVertices.getY(i).toFixed(2)},${shellVertices.getZ(i).toFixed(2)}`;
    if (!uniqueVerts.has(key)) {
      uniqueVerts.add(key);
      const node = new THREE.Mesh(vertexNodeGeo, vertexNodeMat);
      node.position.set(shellVertices.getX(i), shellVertices.getY(i), shellVertices.getZ(i));
      shellGroup.add(node);
    }
  }

  vaultGroup.add(shellGroup);

  // ════════════════════════════════════════════
  // LAYER 5: DATA STREAM LINES — Connecting Core to Shell
  // ════════════════════════════════════════════
  const streamGroup = new THREE.Group();

  // Create radial "data stream" lines from core to shell vertices
  const streamMat = new THREE.LineBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending
  });

  let vertIdx = 0;
  uniqueVerts.forEach(key => {
    if (vertIdx % 3 === 0) { // Only draw every 3rd for subtlety
      const [x, y, z] = key.split(',').map(Number);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const line = new THREE.LineSegments(lineGeo, streamMat);
      streamGroup.add(line);
    }
    vertIdx++;
  });

  vaultGroup.add(streamGroup);

  // ════════════════════════════════════════════
  // LIGHTING — Cinematic 3-Point Setup
  // ════════════════════════════════════════════
  const ambient = new THREE.AmbientLight(WHITE, 1.5);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(WHITE, DEEP_BLUE, 3);
  scene.add(hemi);

  const keyLight = new THREE.PointLight(WHITE, 15, 20);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(BLUE, 8, 15);
  rimLight.position.set(-4, -2, -5);
  scene.add(rimLight);

  // ════════════════════════════════════════════
  // ANIMATION LOOP — Premium Idle Motion
  // ════════════════════════════════════════════
  const clock = new THREE.Clock();

  let vaultVisible = true;
  let vaultRafId = 0;
  const vaultIO = new IntersectionObserver(([entry]) => {
    vaultVisible = entry.isIntersecting;
    if (vaultVisible && !vaultRafId) {
      clock.start();
      vaultRafId = requestAnimationFrame(animate);
    }
  }, { threshold: 0 });
  if (container) vaultIO.observe(container);

  const animate = () => {
    if (!vaultVisible) { vaultRafId = 0; return; }
    vaultRafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Core breathing
    const coreScale = 1 + Math.sin(t * 1.8) * 0.03;
    coreGroup.scale.set(coreScale, coreScale, coreScale);
    coreGroup.rotation.y = t * 0.15;
    coreGroup.rotation.x = Math.sin(t * 0.3) * 0.1;

    // Lattice ring rotation (gyroscope)
    latticeGroup.children.forEach(child => {
      if (child.userData.speedX !== undefined) {
        child.rotation.x += child.userData.speedX;
        child.rotation.y += child.userData.speedY;
      }
      // Orbit shield nodes
      if (child.userData.orbitAngle !== undefined) {
        child.userData.orbitAngle += child.userData.orbitSpeed;
        const a = child.userData.orbitAngle;
        const r = child.userData.orbitRadius;
        const ax = child.userData.axis;
        if (ax === 0) {
          child.position.set(r * Math.cos(a), r * Math.sin(a), 0);
        } else if (ax === 1) {
          child.position.set(0, r * Math.cos(a), r * Math.sin(a));
        } else {
          child.position.set(r * Math.sin(a), 0, r * Math.cos(a));
        }
      }
    });

    // Key orbit rotation
    keyOrbitGroup.children.forEach(key => {
      const ud = key.userData;
      if (ud.orbitAngle !== undefined) {
        ud.orbitAngle += ud.orbitSpeed;
        const a = ud.orbitAngle;
        const r = ud.orbitRadius;
        key.position.x = r * Math.cos(a);
        key.position.z = r * Math.sin(a);
        key.position.y = Math.sin(t * ud.floatSpeed + ud.floatPhase) * 0.3;
        key.rotation.y = a + Math.PI / 2;
        // Subtle scale pulse
        const kScale = 1 + Math.sin(t * 2 + ud.floatPhase) * 0.1;
        key.scale.set(kScale, kScale, kScale);
      }
    });

    // Particle rotation
    innerParticles.rotation.y = t * 0.06;
    innerParticles.rotation.z = Math.sin(t * 0.2) * 0.05;
    outerParticles.rotation.y = t * 0.02;
    outerParticles.rotation.x = Math.sin(t * 0.15) * 0.03;

    // Shell rotation (slow, majestic)
    shellMesh.rotation.y = -t * 0.04;
    shellMesh.rotation.z = t * 0.015;
    shell2Mesh.rotation.y = t * 0.03 + Math.PI / 5;
    shell2Mesh.rotation.z = -t * 0.01 + Math.PI / 7;

    // Stream group subtle breathing
    streamGroup.rotation.y = t * 0.01;

    // Ambient floating of entire vault
    vaultGroup.position.y = Math.sin(t * 0.6) * 0.12;

    // Core light pulse
    coreLight.intensity = 12 + Math.sin(t * 2) * 5;

    renderer.render(scene, camera);
  };

  vaultRafId = requestAnimationFrame(animate);

  // ════════════════════════════════════════════
  // RESPONSIVE
  // ════════════════════════════════════════════
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // ════════════════════════════════════════════
  // GSAP SCROLL ANIMATION — Cinematic Assembly
  // ════════════════════════════════════════════
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

    // Initial scattered state — layers exploded outward
    latticeGroup.scale.set(2.5, 2.5, 2.5);
    latticeGroup.children.forEach(child => {
      if (child.material) child.material.opacity = 0;
    });

    keyOrbitGroup.scale.set(3.5, 3.5, 3.5);
    keyOrbitGroup.children.forEach(key => {
      key.traverse(child => {
        if (child.material) child.material.opacity = 0;
      });
    });

    shellGroup.scale.set(4.0, 4.0, 4.0);
    shellGroup.children.forEach(child => {
      if (child.material) child.material.opacity = 0;
    });

    particleGroup.scale.set(5.0, 5.0, 5.0);

    streamGroup.children.forEach(child => {
      if (child.material) child.material.opacity = 0;
    });

    coreGroup.scale.set(0.3, 0.3, 0.3);

    // ── Phase 1: Core ignites + inner particles condense ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.why-titan',
        start: 'top 120%',
        end: 'top 10%',
        scrub: 1.5,
      }
    });

    // Core scales up from tiny seed to full size
    tl.to(coreGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.3,
      ease: 'power2.out'
    }, 0);

    // Particles condense from massive cloud to tight orbit
    tl.to(particleGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0.05);

    // Lattice rings condense and fade in
    tl.to(latticeGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 0.15);

    latticeGroup.children.forEach(child => {
      if (child.material && child.userData.baseOpacity !== undefined) {
        tl.to(child.material, {
          opacity: child.userData.baseOpacity,
          duration: 0.3,
        }, 0.15);
      } else if (child.material) {
        tl.to(child.material, {
          opacity: 0.9,
          duration: 0.3,
        }, 0.15);
      }
    });

    // Key orbit condenses and reveals
    tl.to(keyOrbitGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 0.25);

    keyOrbitGroup.children.forEach(key => {
      key.traverse(child => {
        if (child.material) {
          tl.to(child.material, {
            opacity: child === key.children[0] ? 0.9 : 0.8,
            duration: 0.3,
          }, 0.3);
        }
      });
    });

    // Outer shell condenses last (sentinel boundary closes)
    tl.to(shellGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'power3.inOut'
    }, 0.35);

    shellGroup.children.forEach(child => {
      if (child.material) {
        const targetOpacity = child === shellMesh ? 0.3 : (child === shell2Mesh ? 0.2 : 0.6);
        tl.to(child.material, {
          opacity: targetOpacity,
          duration: 0.3,
        }, 0.4);
      }
    });

    // Data streams fade in last
    streamGroup.children.forEach(child => {
      if (child.material) {
        tl.to(child.material, {
          opacity: 0.08,
          duration: 0.2,
        }, 0.5);
      }
    });

    // ── Phase 2: Continuous epic rotation through section ──
    gsap.to(vaultGroup.rotation, {
      y: Math.PI * 3,
      z: Math.PI / 5,
      scrollTrigger: {
        trigger: '.why-titan',
        start: 'top 120%',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }
});
