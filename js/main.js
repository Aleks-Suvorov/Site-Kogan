/* =============================================================
   KOGAN SELF DEFENSE — main.js
   Handles: loader, nav, particles, counters, reveal,
            testimonial slider, gallery lightbox, back-to-top
============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     LOADER
  ----------------------------------------------------------- */
  const loader = document.getElementById('loader');

  function removeLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 700);
  }

  if (document.readyState === 'complete') {
    setTimeout(removeLoader, 1800);
  } else {
    window.addEventListener('load', () => setTimeout(removeLoader, 1800));
  }

  /* -----------------------------------------------------------
     YEAR
  ----------------------------------------------------------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const nav       = document.getElementById('nav');
  const toggle    = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');
  const navLinks   = document.querySelectorAll('.nav__link');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');

  // Scroll → solid nav
  function onNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Back-to-top visibility
    const btt = document.getElementById('backToTop');
    if (btt) {
      btt.classList.toggle('visible', window.scrollY > 500);
    }
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // Hamburger toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id], div[id]');
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;

  function setActiveNav() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= navH + 60) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------------------
     BACK TO TOP
  ----------------------------------------------------------- */
  const btt = document.getElementById('backToTop');
  if (btt) {
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* -----------------------------------------------------------
     PARTICLE SYSTEM (hero canvas)
  ----------------------------------------------------------- */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x     = Math.random() * canvas.width;
        this.y     = canvas.height + Math.random() * 200;
        this.size  = Math.random() * 2.5 + 0.5;
        this.speed = Math.random() * 0.8 + 0.3;
        this.drift = (Math.random() - 0.5) * 0.6;
        this.life  = 1;
        this.decay = Math.random() * 0.004 + 0.002;
        // Vary between deep red and bright red
        const r = Math.round(180 + Math.random() * 75);
        const g = Math.round(Math.random() * 20);
        this.color = `${r},${g},0`;
      }
      update() {
        this.y    -= this.speed;
        this.x    += this.drift;
        this.life -= this.decay;
        if (this.life <= 0 || this.y < -10) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        ctx.fillStyle = `rgba(${this.color},${this.life})`;
        ctx.shadowColor = `rgba(${this.color},0.5)`;
        ctx.shadowBlur = this.size * 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle());

    // Spread initial positions
    particles.forEach(p => { p.y = Math.random() * canvas.height; });

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* -----------------------------------------------------------
     INTERSECTION OBSERVER — reveal + stat counters
  ----------------------------------------------------------- */
  // Reveal elements
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  // Stat counters
  const statNums = document.querySelectorAll('.stat-num[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach(el => counterObserver.observe(el));

  /* -----------------------------------------------------------
     TESTIMONIAL SLIDER
  ----------------------------------------------------------- */
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');

  if (track && dotsWrap && prevBtn && nextBtn) {
    const cards      = track.querySelectorAll('.testi-card');
    const total      = cards.length;
    let current      = 0;
    let autoTimer    = null;
    let perView      = getPerView();

    function getPerView() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1100) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, total - perView);
    }

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        btn.className = 'testi-dot' + (i === current ? ' active' : '');
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const cardWidth = cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap || '0');
      track.style.transform = `translateX(-${current * cardWidth}px)`;
      updateDots();
    }

    function goNext() { goTo(current < maxIndex() ? current + 1 : 0); }
    function goPrev() { goTo(current > 0 ? current - 1 : maxIndex()); }

    prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
    nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

    function startAuto() {
      autoTimer = setInterval(goNext, 5000);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
      resetAuto();
    }, { passive: true });

    // Init
    buildDots();
    startAuto();

    // Rebuild on resize
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        perView = getPerView();
        if (current > maxIndex()) current = maxIndex();
        buildDots();
        goTo(current);
      }, 200);
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     GALLERY LIGHTBOX
  ----------------------------------------------------------- */
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn    = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.gallery-item__inner').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img || !img.src || img.src === window.location.href) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 400);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* -----------------------------------------------------------
     HERO PARALLAX (subtle)
  ----------------------------------------------------------- */
  const heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity   = 1 - (scrolled / window.innerHeight) * 1.1;
      }
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     PROGRAM CARD — touch fallback (mobile tap to reveal)
  ----------------------------------------------------------- */
  if ('ontouchstart' in window) {
    document.querySelectorAll('.program-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('tapped');
        // Untap others
        document.querySelectorAll('.program-card.tapped').forEach(other => {
          if (other !== card) other.classList.remove('tapped');
        });
      });
    });
  }

  /* -----------------------------------------------------------
     NAV phone number — hide text on scroll for cleanliness
     Already handled in CSS, but ensure proper mobile state
  ----------------------------------------------------------- */

  /* -----------------------------------------------------------
     FAQ ACCORDION
  ----------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(i => i.classList.remove('open'));
      // Open this one if it wasn't open
      if (!isOpen) item.classList.add('open');
    });
  });

  /* -----------------------------------------------------------
     KEYBOARD ACCESSIBILITY — close menus on Escape
  ----------------------------------------------------------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (toggle && mobileMenu) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

})();
