// ═══════════════════════════════════════════
// Child Justice Forum Zambia — Main JS v3.0
// Brand: Saphire #2d59a8 | Indigo #6b87ca
// ═══════════════════════════════════════════

// ── MODAL SYSTEM ──────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
  // trap focus
  const firstFocusable = overlay.querySelector('button, a, input');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
  }
});

// ── HEADER SCROLL ─────────────────────────
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE NAV ────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

// ── SCROLL REVEAL ─────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.program-card, .news-card, .info-card, .partner-full-card, ' +
  '.resource-card, .hero-stat-card, .stakeholder, .partner-chip, ' +
  '.pillar-badge, .timeline-item, .mt-item, .mprov, .mpl-item'
).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.5s ${Math.min(i * 0.04, 0.4)}s ease, transform 0.5s ${Math.min(i * 0.04, 0.4)}s ease`;
  revealObs.observe(el);
});

// ── COUNTER ANIMATION ─────────────────────
function animateCount(el, target, suffix) {
  const dur = 1600;
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
    el.textContent = Math.floor(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const countObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const count = parseInt(el.getAttribute('data-count') || el.textContent);
      const suffix = el.getAttribute('data-suffix') || '';
      if (!isNaN(count)) animateCount(el, count, suffix);
      countObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.sn[data-count]').forEach(el => countObs.observe(el));

// ── FORM SUCCESS ──────────────────────────
window.handleSubmit = function(e) {
  if (e) e.preventDefault();
  const el = document.getElementById('formSuccess');
  if (el) {
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// ── DOWNLOAD BUTTON: disabled tooltip ─────
document.querySelectorAll('.res-download-btn.disabled').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // show tooltip
    let tip = btn.querySelector('.dl-tip');
    if (!tip) {
      tip = document.createElement('span');
      tip.className = 'dl-tip';
      tip.textContent = 'File not uploaded yet — see guide above';
      tip.style.cssText = 'position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#333;color:white;padding:6px 12px;border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;z-index:100;';
      btn.style.position = 'relative';
      btn.appendChild(tip);
      setTimeout(() => tip.remove(), 2500);
    }
  });
});
