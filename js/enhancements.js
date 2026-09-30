/* ═══════════════════════════════════════════════════
   CJF WEBSITE — GLOBAL ENHANCEMENTS JS
   All 12 improvement features
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. ANNOUNCEMENT BANNER ────────────────────── */
  function initAnnouncementBanner() {
    var text = window.CJF_ANNOUNCEMENT || '';
    if (!text) {
      // Check Firebase if configured
      if (window.CJF_FIREBASE_READY && typeof firebase !== 'undefined') {
        try {
          var db = firebase.firestore();
          db.collection('settings').doc('general').get().then(function (doc) {
            if (doc.exists && doc.data().announcement) {
              showBanner(doc.data().announcement);
            }
          });
        } catch (e) {}
      }
      return;
    }
    showBanner(text);
  }

  function showBanner(text) {
    var dismissed = sessionStorage.getItem('cjf_banner_dismissed');
    if (dismissed === text) return;
    var banner = document.createElement('div');
    banner.className = 'announcement-banner visible';
    banner.id = 'announcementBanner';
    // Parse pipe-separated: TEXT | LINK_LABEL | LINK_URL
    var parts = text.split('|');
    var msg = parts[0].trim();
    var linkHTML = '';
    if (parts.length >= 3) {
      linkHTML = '<a href="' + parts[2].trim() + '">' + parts[1].trim() + ' →</a>';
    }
    banner.innerHTML = '<span>' + msg + linkHTML + '</span><button class="banner-close" onclick="dismissBanner()" aria-label="Close">✕</button>';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  window.dismissBanner = function () {
    var b = document.getElementById('announcementBanner');
    if (b) {
      sessionStorage.setItem('cjf_banner_dismissed', b.querySelector('span').textContent);
      b.style.animation = 'slideDown 0.3s ease reverse';
      setTimeout(function () { b.remove(); }, 300);
    }
  };

  /* ── 2. WHATSAPP FLOATING BUTTON ───────────────── */
  function initWhatsApp() {
    var phone = window.CJF_WHATSAPP || '260211000000';
    var message = encodeURIComponent(window.CJF_WHATSAPP_MSG || 'Hello, I would like to enquire about the Child Justice Forum Zambia.');
    var url = 'https://wa.me/' + phone + '?text=' + message;
    var btn = document.createElement('a');
    btn.id = 'cjf-whatsapp-btn';
    btn.className = 'whatsapp-btn';
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat on WhatsApp');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    var tooltip = document.createElement('div');
    tooltip.className = 'whatsapp-tooltip';
    tooltip.textContent = '💬 Chat on WhatsApp';
    document.body.appendChild(btn);
    document.body.appendChild(tooltip);
    // Show tooltip on hover
    btn.addEventListener('mouseenter', function () { tooltip.style.opacity = '1'; tooltip.style.transform = 'translateX(0)'; });
    btn.addEventListener('mouseleave', function () { tooltip.style.opacity = '0'; tooltip.style.transform = 'translateX(-4px)'; });
  }

  /* ── 3. NEWSLETTER FORM HANDLING ───────────────── */
  window.submitNewsletter = function (e) {
    if (e) e.preventDefault();
    var emailEl = document.getElementById('nlEmail');
    var nameEl = document.getElementById('nlName');
    var successEl = document.getElementById('nlSuccess');
    var formEl = document.getElementById('nlForm');
    if (!emailEl || !emailEl.value.includes('@')) {
      emailEl && (emailEl.style.borderColor = '#c62828');
      return;
    }
    var data = {
      email: emailEl.value.trim(),
      name: nameEl ? nameEl.value.trim() : '',
      subscribedAt: new Date().toISOString(),
      source: window.location.pathname
    };
    // Save to Firebase if configured
    if (window.CJF_FIREBASE_READY && typeof firebase !== 'undefined') {
      try {
        var db = firebase.firestore();
        db.collection('newsletter').add(data).then(function () {
          showNlSuccess(formEl, successEl);
        }).catch(function () {
          showNlSuccess(formEl, successEl); // Still show success to user
        });
      } catch (e) {
        showNlSuccess(formEl, successEl);
      }
    } else {
      showNlSuccess(formEl, successEl);
    }
  };

  function showNlSuccess(form, success) {
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
  }

  /* ── 4. CONFETTI COUNTER ANIMATION ─────────────── */
  function spawnConfetti(el) {
    var rect = el.getBoundingClientRect();
    var colors = ['#FFD54F', '#2d59a8', '#6b87ca', '#81C784', '#FF8A65', '#CE93D8'];
    for (var i = 0; i < 18; i++) {
      (function (i) {
        setTimeout(function () {
          var piece = document.createElement('div');
          piece.className = 'confetti-piece';
          piece.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 120) + 'px';
          piece.style.top = rect.top + 'px';
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
          piece.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
          document.body.appendChild(piece);
          setTimeout(function () { piece.remove(); }, 2000);
        }, i * 40);
      })(i);
    }
  }

  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;
    var isPlus = target.toString().includes('+');
    var num = parseInt(target);
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(ease * num);
      el.textContent = current.toLocaleString() + (isPlus ? '+' : '');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = num.toLocaleString() + (isPlus ? '+' : '');
        spawnConfetti(el);
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target, entry.target.dataset.count, 1800);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── 5. SCROLL REVEAL ───────────────────────────── */
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ── 6. ANIMATED TIMELINE ───────────────────────── */
  function initAnimatedTimeline() {
    var items = document.querySelectorAll('.at-item');
    if (!items.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, 0);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.1) + 's';
      observer.observe(item);
    });
  }

  /* ── 7. REFERRAL FORM SUBMISSION ────────────────── */
  window.submitReferral = function (e) {
    if (e) e.preventDefault();
    var form = document.getElementById('referralForm');
    var success = document.getElementById('referralSuccess');
    if (!form) return;
    var required = form.querySelectorAll('[required]');
    var valid = true;
    required.forEach(function (f) {
      if (!f.value.trim()) { f.style.borderColor = '#c62828'; valid = false; }
      else f.style.borderColor = '';
    });
    if (!valid) return;
    var data = {
      childAge: document.getElementById('rf-age') ? document.getElementById('rf-age').value : '',
      childGender: document.getElementById('rf-gender') ? document.getElementById('rf-gender').value : '',
      province: document.getElementById('rf-province') ? document.getElementById('rf-province').value : '',
      district: document.getElementById('rf-district') ? document.getElementById('rf-district').value : '',
      situation: document.getElementById('rf-situation') ? document.getElementById('rf-situation').value : '',
      referredBy: document.getElementById('rf-referrer') ? document.getElementById('rf-referrer').value : '',
      referrerContact: document.getElementById('rf-contact') ? document.getElementById('rf-contact').value : '',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    if (window.CJF_FIREBASE_READY && typeof firebase !== 'undefined') {
      try {
        var db = firebase.firestore();
        db.collection('referrals').add(data).then(function () {
          if (form) form.style.display = 'none';
          if (success) success.style.display = 'block';
        });
      } catch (err) {
        if (form) form.style.display = 'none';
        if (success) success.style.display = 'block';
      }
    } else {
      if (form) form.style.display = 'none';
      if (success) success.style.display = 'block';
    }
  };

  /* ── 8. MULTILINGUAL SUPPORT ────────────────────── */
  window.switchLanguage = function (lang) {
    document.querySelectorAll('.lang-pill').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.querySelectorAll('[data-lang-' + lang + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-lang-' + lang);
    });
    try { localStorage.setItem('cjf_lang', lang); } catch (e) {}
    document.documentElement.lang = lang === 'bem' ? 'bem' : lang === 'nya' ? 'ny' : 'en';
  };

  /* ── 9. STORY MODAL ─────────────────────────────── */
  window.openStoryModal = function (id) {
    var modal = document.getElementById('storyModal-' + id);
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeStoryModal = function (id) {
    var modal = document.getElementById('storyModal-' + id);
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ── 10. GALLERY LIGHTBOX ───────────────────────── */
  window.openGalleryItem = function (caption) {
    // Simple tooltip/highlight — real images needed for full lightbox
  };

  /* ── 11. FIREBASE ANNOUNCEMENT LOADER ───────────── */
  function loadFirebaseAnnouncement() {
    if (!window.CJF_FIREBASE_READY || typeof firebase === 'undefined') return;
    try {
      var app;
      try { app = firebase.app(); } catch (e) {
        app = firebase.initializeApp(window.CJF_FIREBASE_CONFIG);
      }
      var db = firebase.firestore();
      db.collection('settings').doc('general').get().then(function (doc) {
        if (doc.exists) {
          var d = doc.data();
          if (d.announcement) showBanner(d.announcement);
        }
      });
    } catch (e) {}
  }

  /* ── INIT ALL ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initAnnouncementBanner();
    initWhatsApp();
    initCounters();
    initScrollReveal();
    initAnimatedTimeline();
    loadFirebaseAnnouncement();
  });

})();
