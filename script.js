/* =============================================
   SIDECHAIN SECURITY — Landing Page Interactivity
   Scroll reveals, nav, form handling
   ============================================= */

(function () {
  'use strict';

  // ─── GSAP SCROLL PHYSICS & REVEALS ──────────────────
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Generic Section Reveals
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // Trigger when top of element hits 85% of viewport height
            toggleActions: "play none none none"
          }
        }
      );
    });

    // 2. High-end Staggered Reveals for Products Grid
    const grids = document.querySelectorAll('.products-grid, .compliance-grid, .about-differentiators');
    grids.forEach(grid => {
      const cards = grid.children;
      gsap.fromTo(cards, 
        { autoAlpha: 0, y: 50, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.4)", // Slight spring-pop effect
          stagger: 0.12,
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
          }
        }
      );
    });

    // 3. Hero Headline Interactive Spotlight & Parallax
    const heroSection = document.querySelector('.hero');
    const heroHeadline = document.querySelector('.hero h1');
    if (heroSection && heroHeadline) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        // Mouse position relative to hero section (0 to 1)
        const xPercent = (e.clientX - rect.left) / rect.width;
        const yPercent = (e.clientY - rect.top) / rect.height;

        // Calculate slight 3D tilt amount (centered at 0.5)
        const tiltX = (yPercent - 0.5) * -12; // tilt degrees up/down
        const tiltY = (xPercent - 0.5) * 16;  // tilt degrees left/right

        gsap.to(heroHeadline, {
          rotationX: tiltX,
          rotationY: tiltY,
          x: (xPercent - 0.5) * -15, // slight opposite translation
          transformPerspective: 900,
          ease: "power2.out",
          duration: 0.6
        });

        // Pass exact coordinates relative to the text block for the metallic glare spotlight
        const textRect = heroHeadline.getBoundingClientRect();
        const textX = e.clientX - textRect.left;
        const textY = e.clientY - textRect.top;

        gsap.to(heroHeadline, {
          '--mouse-x': `${textX}px`,
          '--mouse-y': `${textY}px`,
          duration: 0.1
        });
      });

      heroSection.addEventListener('mouseleave', () => {
        gsap.to(heroHeadline, {
          rotationX: 0,
          rotationY: 0,
          x: 0,
          ease: "power3.out",
          duration: 1.2
        });
        // Neutralize gradient
        gsap.to(heroHeadline, {
          '--mouse-x': `50%`,
          '--mouse-y': `50%`,
          duration: 1.2
        });
      });
    }
    // 4. The Challenge — Auto-Rotating Signal Showcase
    const challengeSection = document.querySelector('.challenge-pin-wrapper');
    if (challengeSection) {
      const cards = gsap.utils.toArray('.signal-card');
      const pips = gsap.utils.toArray('.signal-pip');
      const threatCore = document.querySelector('#threat-core');
      const statusText = document.querySelector('#status-text');
      const INTERVAL = 4000; // 4 seconds per card
      let currentIndex = 0;
      let timer = null;

      // Continuous ring rotation (always active)
      gsap.to('.core-ring', {
        rotationY: "360deg",
        rotationX: "180deg",
        rotationZ: "360deg",
        duration: 8,
        repeat: -1,
        ease: "none",
        stagger: 0.5
      });

      // Card data: accent color, visualizer state, status text
      const cardStates = [
        { accent: '#ff6b6b', secure: false, status: 'THREAT ANALYSIS...' },
        { accent: '#ffaa33', secure: false, status: 'COMPLIANCE BREACH RISK' },
        { accent: '#00e5c8', secure: true,  status: 'SECURE & COMPLIANT' }
      ];

      function activateCard(index) {
        const state = cardStates[index];

        // Cards: crossfade
        cards.forEach((card, i) => {
          card.classList.toggle('active', i === index);
          // Inject the accent CSS variable for theming each card
          const accent = card.getAttribute('data-accent');
          card.style.setProperty('--card-accent', accent);
        });

        // Pips: reset animation
        pips.forEach((pip, i) => {
          pip.classList.toggle('active', i === index);
        });

        // Visualizer state sync
        if (state.secure) {
          threatCore.classList.add('is-secure');
        } else {
          threatCore.classList.remove('is-secure');
        }
        statusText.innerText = state.status;

        currentIndex = index;
      }

      function nextCard() {
        activateCard((currentIndex + 1) % cards.length);
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(nextCard, INTERVAL);
      }

      // Pip click: jump to card
      pips.forEach((pip, i) => {
        pip.addEventListener('click', () => {
          activateCard(i);
          startTimer(); // Reset timer on manual click
        });
      });

      // Initialize: set accent vars and start
      cards.forEach(card => {
        card.style.setProperty('--card-accent', card.getAttribute('data-accent'));
      });
      activateCard(0);
      startTimer();
    }

  } else {
    // Fallback if GSAP fails to load
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }


  // ─── NAV SCROLL STATE ───────────────────────────────
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  // ─── HAMBURGER MENU ─────────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ─── SMOOTH SCROLL ──────────────────────────────────
  // Center the target section in the viewport when a nav link is clicked.
  // For sections taller than the viewport, scroll to the top with nav offset.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        // Ensure nav is in fixed/scrolled state before scrolling
        nav.classList.add('scrolled');

        const navHeight = nav.getBoundingClientRect().height;
        const sectionRect = target.getBoundingClientRect();
        const sectionHeight = sectionRect.height;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - navHeight;

        let scrollToY;
        if (sectionHeight >= availableHeight) {
          // Section is taller than available viewport — scroll its top to just below nav
          scrollToY = window.scrollY + sectionRect.top - navHeight - 20;
        } else {
          // Section is shorter — center it vertically in the available space below nav
          const offset = (availableHeight - sectionHeight) / 2;
          scrollToY = window.scrollY + sectionRect.top - navHeight - offset;
        }

        window.scrollTo({ top: Math.max(0, scrollToY), behavior: 'smooth' });
      }
    });
  });


  // ─── CONTACT FORM ───────────────────────────────────
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('contact-name');
      const company = document.getElementById('contact-company');
      const email = document.getElementById('contact-email');
      const message = document.getElementById('contact-message');
      let valid = true;

      [name, company, email, message].forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = 'rgba(255,80,80,0.5)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = 'rgba(255,80,80,0.5)';
        valid = false;
      }

      if (!valid) return;

      const submitBtn = document.getElementById('contact-submit');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      }, 1200);
    });

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      });
    });
  }


  // ─── PRICING SPOTLIGHT — CURSOR-TRACKING GLOW ──────
  const pricingCards = document.querySelectorAll('.pricing-card');

  if (pricingCards.length) {
    // Track normalized pointer position for hue shift
    let xp = 0.5;
    document.addEventListener('pointermove', function (e) {
      xp = e.clientX / window.innerWidth;
    }, { passive: true });

    pricingCards.forEach(function (card) {
      card.addEventListener('pointerenter', function () {
        card.style.setProperty('--spotlight-opacity', '1');
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--spotlight-opacity', '0');
      });

      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', x + 'px');
        card.style.setProperty('--spotlight-y', y + 'px');
        card.style.setProperty('--xp', xp.toFixed(2));
      });
    });
  }


  // ─── ORBITAL TIMELINE — ROTATION & INTERACTION ─────
  const orbitalContainer = document.getElementById('orbital-container');
  const orbitalNodes = document.querySelectorAll('.orbital-node');

  if (orbitalContainer && orbitalNodes.length) {
    let rotationAngle = 0;
    let autoRotate = true;
    let activeNodeIdx = null;
    let rotationTimer = null;
    const TOTAL = orbitalNodes.length;
    const RADIUS = 290;

    function positionNodes() {
      const cx = orbitalContainer.offsetWidth / 2;
      const cy = orbitalContainer.offsetHeight / 2;

      orbitalNodes.forEach((node, i) => {
        const angle = ((i / TOTAL) * 360 + rotationAngle) % 360;
        const radian = (angle * Math.PI) / 180;
        const x = RADIUS * Math.cos(radian);
        const y = RADIUS * Math.sin(radian);
        
        // 0 at bottom (sin=1), 1 at top (sin=-1)
        const verticalIntensity = (1 - Math.sin(radian)) / 2;
        
        const opacity = 0.7 + 0.3 * verticalIntensity;
        // The active node always has full opacity, otherwise use the calculated dimming
        node.style.opacity = node.classList.contains('active') ? 1 : opacity;
        
        // Apply a brightness glow scaling as it hits the top
        const brightness = 0.85 + 0.75 * verticalIntensity; // 0.85 at bottom, 1.6 at top
        const scale = 0.9 + 0.25 * verticalIntensity;       // 0.9 at bottom, 1.15 at top
        
        const zIndex = Math.round(100 + 50 * Math.cos(radian));

        node.style.left = (cx + x - 28) + 'px';
        node.style.top = (cy + y - 28) + 'px';
        node.style.zIndex = node.classList.contains('active') ? 200 : zIndex;
        // Do not override active node's transform so it can be handled by CSS if needed, or set it dynamically
        if (!node.classList.contains('active') && !node.classList.contains('related')) {
             node.style.transform = `scale(${scale})`;
             node.style.filter = `brightness(${brightness})`;
        } else {
             node.style.transform = 'scale(1)';
             node.style.filter = 'brightness(1.2)';
        }
      });
    }

    function startRotation() {
      if (rotationTimer) clearInterval(rotationTimer);
      rotationTimer = setInterval(() => {
        rotationAngle = (rotationAngle + 0.25) % 360;
        positionNodes();
      }, 50);
    }

    function stopRotation() {
      if (rotationTimer) {
        clearInterval(rotationTimer);
        rotationTimer = null;
      }
    }

    function centerOnNode(idx) {
      const targetAngle = (idx / TOTAL) * 360;
      rotationAngle = 270 - targetAngle;
      positionNodes();
    }

    function clearActive() {
      orbitalNodes.forEach(n => {
        n.classList.remove('active', 'related');
      });
      activeNodeIdx = null;
      autoRotate = true;
      startRotation();
    }

    function activateNode(idx) {
      // Clear all
      orbitalNodes.forEach(n => n.classList.remove('active', 'related'));

      if (activeNodeIdx === idx) {
        clearActive();
        return;
      }

      // Set active
      activeNodeIdx = idx;
      autoRotate = false;
      stopRotation();

      const node = orbitalNodes[idx];
      node.classList.add('active');

      // Highlight related
      const relatedStr = node.dataset.related || '';
      const relatedIds = relatedStr.split(',').map(Number);
      relatedIds.forEach(relIdx => {
        if (orbitalNodes[relIdx]) {
          orbitalNodes[relIdx].classList.add('related');
        }
      });

      centerOnNode(idx);
    }

    // Click handlers
    orbitalNodes.forEach((node, i) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        activateNode(i);
      });
    });

    // Click outside to deselect
    orbitalContainer.addEventListener('click', (e) => {
      if (e.target === orbitalContainer || e.target.classList.contains('orbital-ring')) {
        clearActive();
      }
    });

    // Initial position and start rotation
    positionNodes();
    startRotation();
  }


  // ─── TESTIMONIAL STARS ────────────────────────────
  const starSvg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  document.querySelectorAll('.t-card-quote').forEach((quote) => {
    const starsEl = document.createElement('div');
    starsEl.className = 't-card-stars';
    starsEl.innerHTML = starSvg.repeat(5);
    quote.parentNode.insertBefore(starsEl, quote);
  });

  // ─── TESTIMONIAL MARQUEE — CLICK TO PAUSE ─────────
  const marqueeInner = document.querySelector('.marquee-3d-inner');
  if (marqueeInner) {
    marqueeInner.addEventListener('click', () => {
      marqueeInner.classList.toggle('paused');
    });
  }

  // ─── FOOTER SVG TEXT HOVER EFFECT ─────────────────
  const footerSvg = document.getElementById('footer-hover-svg');
  const revealMask = document.getElementById('footerRevealMask');
  if (footerSvg && revealMask) {
    footerSvg.addEventListener('mousemove', (e) => {
      const rect = footerSvg.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * 100;
      const cy = ((e.clientY - rect.top) / rect.height) * 100;
      revealMask.setAttribute('cx', cx + '%');
      revealMask.setAttribute('cy', cy + '%');
    });

    footerSvg.addEventListener('mouseleave', () => {
      revealMask.setAttribute('cx', '50%');
      revealMask.setAttribute('cy', '50%');
    });
  }

  // ─── INDUSTRY SHOWCASE — GSAP ORB ANIMATIONS ────────
  const indSwitches = document.querySelectorAll('.ind-switch');
  const indPanels = document.querySelectorAll('.ind-panel');

  // Store per-panel GSAP timelines so we can kill/restart on switch
  const orbTimelines = new Map();

  function buildOrbTimeline(panel) {
    const orb = panel.querySelector('.ind-orb');
    if (!orb) return null;

    const ring = orb.querySelector('.ind-orb-ring');
    const glow = orb.querySelector('.ind-orb-glow');
    const icon = orb.querySelector('.ind-orb-icon');
    const sonars = orb.querySelectorAll('.ind-orb-sonar');

    // Read the orb's color from CSS custom property
    const orbColorRaw = getComputedStyle(orb).getPropertyValue('--orb-color').trim();
    const orbColor = orbColorRaw || '100, 160, 255';

    const master = gsap.timeline();

    // 1. Ring — slow rotation with subtle speed oscillation
    const ringTl = gsap.timeline({ repeat: -1 });
    ringTl.to(ring, {
      rotation: 360,
      duration: 20,
      ease: 'none',
    });
    // Layer a subtle scale breathe on the ring
    gsap.to(ring, {
      scale: 1.04,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // 2. Glow — organic breathing with scale + opacity
    gsap.to(glow, {
      scale: 1.15,
      opacity: 1,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    // Secondary glow shimmer — slight x/y drift
    gsap.to(glow, {
      x: 8,
      y: -6,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // 3. Sonar pulse rings — staggered expanding rings
    const sonarTl = gsap.timeline({ repeat: -1, delay: 0.5 });
    sonars.forEach((s, i) => {
      sonarTl.fromTo(s, {
        scale: 0.8,
        opacity: 0,
        borderColor: `rgba(${orbColor}, 0.6)`,
      }, {
        scale: 1.8 + (i * 0.15),
        opacity: 0,
        borderColor: `rgba(${orbColor}, 0)`,
        duration: 2.8,
        ease: 'power1.out',
        keyframes: {
          opacity: [0, 0.5, 0],
          easeEach: 'sine.inOut',
        },
      }, i * 0.9);
    });

    // 4. Icon — gentle float + subtle glow pulse
    gsap.to(icon, {
      y: -8,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    // Icon brightness pulse
    gsap.to(icon, {
      filter: `drop-shadow(0 0 12px rgba(${orbColor}, 0.5))`,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // 5. Orb container — very subtle scale breathe
    gsap.to(orb, {
      scale: 1.02,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // 6. Entry burst — plays once on switch
    const entryTl = gsap.timeline();
    entryTl
      .fromTo(orb, {
        scale: 0.85,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.4)',
      })
      .fromTo(icon, {
        scale: 0.5,
        rotation: -15,
        opacity: 0,
        filter: 'blur(8px)',
      }, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'back.out(2)',
      }, '-=0.5')
      .fromTo(glow, {
        scale: 0.3,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 0.7,
        duration: 0.9,
        ease: 'power2.out',
      }, '-=0.6')
      .fromTo(ring, {
        scale: 0.5,
        opacity: 0,
        rotation: -90,
      }, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1,
        ease: 'power2.out',
      }, '-=0.8');

    master.add(entryTl, 0);
    master.add(ringTl, 0);
    master.add(sonarTl, 0);

    return master;
  }

  function killOrbAnimations() {
    orbTimelines.forEach(tl => tl.kill());
    orbTimelines.clear();
    // Kill all tweens on orb elements
    document.querySelectorAll('.ind-orb, .ind-orb-ring, .ind-orb-glow, .ind-orb-icon, .ind-orb-sonar').forEach(el => {
      gsap.killTweensOf(el);
    });
  }

  function activatePanel(panel) {
    killOrbAnimations();
    indPanels.forEach(p => {
      p.classList.remove('active');
      p.style.animation = 'none';
    });

    void panel.offsetWidth;
    panel.style.animation = '';
    panel.classList.add('active');

    // Build GSAP orb animation for new panel
    const tl = buildOrbTimeline(panel);
    if (tl) orbTimelines.set(panel, tl);
  }

  if (indSwitches.length && indPanels.length) {
    // Switcher click handlers
    indSwitches.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.industry;
        indSwitches.forEach(s => {
          s.classList.remove('active');
          s.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const panel = document.querySelector(`.ind-panel[data-industry="${target}"]`);
        if (panel) activatePanel(panel);
      });
    });

    // Initialize the first active panel
    const firstActive = document.querySelector('.ind-panel.active');
    if (firstActive) {
      const tl = buildOrbTimeline(firstActive);
      if (tl) orbTimelines.set(firstActive, tl);
    }
  }

})();
