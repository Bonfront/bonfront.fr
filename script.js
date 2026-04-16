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
// ORBES INTERACTIVES
// ===========================

const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

let mouseX = 0, mouseY = 0;
let orb1X = 0, orb1Y = 0;
let orb2X = 0, orb2Y = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateOrbs() {
  orb1X += (mouseX - orb1X) * 0.04;
  orb1Y += (mouseY - orb1Y) * 0.04;
  orb2X += (mouseX - orb2X) * 0.02;
  orb2Y += (mouseY - orb2Y) * 0.02;

  if (orb1) {
    orb1.style.transform = `translate(${(orb1X - window.innerWidth / 2) * 0.08}px, ${(orb1Y - window.innerHeight / 2) * 0.08}px)`;
  }
  if (orb2) {
    orb2.style.transform = `translate(${(orb2X - window.innerWidth / 2) * -0.06}px, ${(orb2Y - window.innerHeight / 2) * -0.06}px)`;
  }

  requestAnimationFrame(animateOrbs);
}

animateOrbs();

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
