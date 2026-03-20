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
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ─── SHUFFLE CARDS ──────────────────────────────────
  (function () {
    const stage = document.getElementById('shuffle-cards');
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll('.shuffle-card'));
    if (cards.length < 3) return;

    let positions = ['front', 'middle', 'back'];
    let isDragging = false;
    let dragStartX = 0;
    let activeDragCard = null;

    function applyPositions() {
      cards.forEach((card, i) => card.setAttribute('data-pos', positions[i]));
    }

    function shuffle() {
      const next = [...positions];
      next.unshift(next.pop()); // [back, front, middle] — back card becomes front
      positions = next;
      applyPositions();
    }

    applyPositions();

    // ── Mouse ──
    cards.forEach((card, idx) => {
      card.addEventListener('mousedown', (e) => {
        if (positions[idx] !== 'front') return;
        isDragging = true;
        dragStartX = e.clientX;
        activeDragCard = card;
        card.style.transition = 'none';
        e.preventDefault();
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !activeDragCard) return;
      const dx = e.clientX - dragStartX;
      activeDragCard.style.transform = `rotate(-6deg) translateX(${dx}px)`;
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging || !activeDragCard) return;
      const dx = e.clientX - dragStartX;
      const card = activeDragCard;
      isDragging = false;
      activeDragCard = null;
      card.style.transition = '';

      if (dx < -150) {
        card.style.transform = '';
        shuffle();
      } else {
        card.style.transform = 'rotate(-6deg) translateX(0px)';
        setTimeout(() => { card.style.transform = ''; }, 350);
      }
    });

    // ── Touch ──
    cards.forEach((card, idx) => {
      card.addEventListener('touchstart', (e) => {
        if (positions[idx] !== 'front') return;
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        activeDragCard = card;
        card.style.transition = 'none';
      }, { passive: true });
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging || !activeDragCard) return;
      const dx = e.touches[0].clientX - dragStartX;
      activeDragCard.style.transform = `rotate(-6deg) translateX(${dx}px)`;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!isDragging || !activeDragCard) return;
      const dx = e.changedTouches[0].clientX - dragStartX;
      const card = activeDragCard;
      isDragging = false;
      activeDragCard = null;
      card.style.transition = '';

      if (dx < -150) {
        card.style.transform = '';
        shuffle();
      } else {
        card.style.transform = 'rotate(-6deg) translateX(0px)';
        setTimeout(() => { card.style.transform = ''; }, 350);
      }
    });
  })();


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

})();
