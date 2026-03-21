/* =============================================
   FABRIC — Landing Page Interactivity
   Scroll reveals, nav, form handling
   ============================================= */

(function () {
  'use strict';

  // ─── SCROLL REVEAL — INTERSECTION OBSERVER ──────────
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
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
      const email = document.getElementById('contact-email');
      const message = document.getElementById('contact-message');
      let valid = true;

      [name, email, message].forEach((field) => {
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


  // ─── TESTIMONIAL MARQUEE — CLICK TO PAUSE ─────────
  const marqueeInner = document.querySelector('.marquee-3d-inner');
  if (marqueeInner) {
    marqueeInner.addEventListener('click', () => {
      marqueeInner.classList.toggle('paused');
    });
  }

})();
