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

// Reset : retire la classe visible sur tous les messages au chargement
messages.forEach(msg => msg.classList.remove('visible'));

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

const chatTrigger = document.querySelector('.problem');
if (chatTrigger) chatObserver.observe(chatTrigger);

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

function toggleAutre(select) {
  const input = document.getElementById('autre-detail');
  if (select.value === 'Autre') {
    input.style.display = 'block';
    input.style.maxHeight = '0';
    input.style.opacity = '0';
    input.style.overflow = 'hidden';
    input.style.transition = 'max-height 0.4s ease, opacity 0.4s ease, margin-top 0.4s ease';
    setTimeout(() => {
      input.style.maxHeight = '60px';
      input.style.opacity = '1';
      input.style.marginTop = '8px';
    }, 10);
  } else {
    input.style.maxHeight = '0';
    input.style.opacity = '0';
    input.style.marginTop = '0';
    setTimeout(() => {
      input.style.display = 'none';
    }, 400);
  }
}

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

// ===========================
// ORBES INTERACTIVES
// ===========================

const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

let targetX = 0, targetY = 0;
let currentX1 = 0, currentY1 = 0;
let currentX2 = 0, currentY2 = 0;

document.addEventListener('mousemove', (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 150;
  targetY = (e.clientY / window.innerHeight - 0.5) * 150;
});

function animateOrbs() {
  currentX1 += (targetX - currentX1) * 0.05;
  currentY1 += (targetY - currentY1) * 0.05;
  currentX2 += (-targetX - currentX2) * 0.03;
  currentY2 += (-targetY - currentY2) * 0.03;

  if (orb1) orb1.style.transform = `translate(${currentX1}px, ${currentY1}px)`;
  if (orb2) orb2.style.transform = `translate(${currentX2}px, ${currentY2}px)`;

  requestAnimationFrame(animateOrbs);
}

animateOrbs();
