/* =============================================================
   KOGAN SELF DEFENSE — main.js  (v4)
============================================================= */
(function () {
  'use strict';

  /* ── LOADER ─────────────────────────────────────────────── */
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

  /* ── NAV ─────────────────────────────────────────────────── */
  const nav         = document.getElementById('nav');
  const burger      = document.getElementById('navBurger');
  const drawer      = document.getElementById('navDrawer');
  const navLinks    = document.querySelectorAll('.nl');
  const drawerLinks = document.querySelectorAll('.nd-link');

  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const btt = document.getElementById('btt');
    if (btt) btt.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawerLinks.forEach(l => l.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* Active nav on scroll */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  function setActiveNav() {
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= navH + 60) current = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });

  /* Back to top */
  const btt = document.getElementById('btt');
  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Escape closes drawer + lightbox */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (burger && drawer) {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  /* ── PARTICLE SYSTEM ─────────────────────────────────────── */
  const canvas = document.getElementById('sparks');
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
        ctx.fillStyle   = `rgba(${this.color},${this.life})`;
        ctx.shadowColor = `rgba(${this.color},0.5)`;
        ctx.shadowBlur  = this.size * 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle());
    particles.forEach(p => { p.y = Math.random() * canvas.height; });

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ── REVEAL + COUNTERS ───────────────────────────────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const start  = performance.now();
    const dur    = 1800;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.sstat__n[data-count]').forEach(el => counterObs.observe(el));

  /* ── TESTIMONIAL SLIDER ──────────────────────────────────── */
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');

  if (track && dotsWrap && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.testi-card');
    const total = cards.length;
    let current   = 0;
    let perView   = getPerView();
    let autoTimer = null;

    function getPerView() {
      if (window.innerWidth < 768)  return 1;
      if (window.innerWidth < 1100) return 2;
      return 3;
    }
    function maxIndex() { return Math.max(0, total - perView); }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex(); i++) {
        const btn = document.createElement('button');
        btn.className = 'testi-dot' + (i === current ? ' active' : '');
        btn.setAttribute('aria-label', `Slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
    }
    function updateDots() {
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    function goTo(i) {
      current = Math.max(0, Math.min(i, maxIndex()));
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const w   = cards[0].offsetWidth + gap;
      track.style.transform = `translateX(-${current * w}px)`;
      updateDots();
    }
    function goNext() { goTo(current < maxIndex() ? current + 1 : 0); }
    function goPrev() { goTo(current > 0 ? current - 1 : maxIndex()); }
    function startAuto() { autoTimer = setInterval(goNext, 5000); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }

    prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
    nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
      resetAuto();
    }, { passive: true });

    buildDots();
    startAuto();

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

  /* ── GALLERY LIGHTBOX ────────────────────────────────────── */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbClose  = document.getElementById('lbClose');

  if (lightbox && lbImg) {
    document.querySelectorAll('.gi').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img || !img.src || img.src === window.location.href) return;
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lbImg.src = ''; }, 400);
    }
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ── HERO PARALLAX ───────────────────────────────────────── */
  const heroBody = document.querySelector('.hero__body');
  if (heroBody) {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      if (s < window.innerHeight) {
        heroBody.style.transform = `translateY(${s * 0.14}px)`;
        heroBody.style.opacity   = 1 - (s / window.innerHeight) * 1.1;
      }
    }, { passive: true });
  }

  /* ── PROGRAM CARD — mobile tap reveal ───────────────────── */
  if ('ontouchstart' in window) {
    document.querySelectorAll('.prog-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('tapped');
        document.querySelectorAll('.prog-card.tapped').forEach(other => {
          if (other !== card) other.classList.remove('tapped');
        });
      });
    });
  }

  /* ── FAQ ACCORDION ───────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

})();
