/* ===========================
   BONFRONT — script.js
   =========================== */

// ===========================
// SCROLL REVEAL
// ===========================

const revealElements = document.querySelectorAll(
  '.problem-grid, .features, .feature-card, .pricing-card, .garantie, .objection-inner, .contact-inner, .section-label, .section-title'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ===========================
// COUNTER ANIMATION (HERO STATS)
// ===========================

const counters = document.querySelectorAll('.stat-num');

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const duration = 1200;
      const step = target / (duration / 16);

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current);
      }, 16);

      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => countObserver.observe(el));

// ===========================
// CHAT MESSAGES ANIMATION
// ===========================

const messages = document.querySelectorAll('.msg');

const chatObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      messages.forEach(msg => {
        const delay = parseInt(msg.dataset.delay) || 0;
        setTimeout(() => {
          msg.classList.add('visible');
        }, delay);
      });
      chatObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const messagesContainer = document.querySelector('.messages');
if (messagesContainer) chatObserver.observe(messagesContainer);

// ===========================
// NAV SCROLL EFFECT
// ===========================

const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.padding = '14px 0';
  } else {
    nav.style.padding = '20px 0';
  }
}, { passive: true });

// ===========================
// FORM SUBMIT
// ===========================

const form = document.getElementById('contactForm');

// ===========================
// SMOOTH ANCHOR SCROLL
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
