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
        const opacity = Math.max(0.4, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2));
        const zIndex = Math.round(100 + 50 * Math.cos(radian));

        node.style.left = (cx + x - 28) + 'px';
        node.style.top = (cy + y - 28) + 'px';
        node.style.zIndex = node.classList.contains('active') ? 200 : zIndex;
        node.style.opacity = node.classList.contains('active') ? 1 : opacity;
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


  // ─── TESTIMONIAL MARQUEE — HOVER TO PAUSE ─────────
  const marqueeInner = document.querySelector('.marquee-3d-inner');
  if (marqueeInner) {
    marqueeInner.addEventListener('mouseenter', () => {
      marqueeInner.classList.add('paused');
    });
    marqueeInner.addEventListener('mouseleave', () => {
      marqueeInner.classList.remove('paused');
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

})();
