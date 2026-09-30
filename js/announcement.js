// CJF ANNOUNCEMENT — Scrolling Ticker + Modal
(function() {

  const style = document.createElement('style');
  style.textContent = `
    #cjf-ticker {
      display: none;
      position: relative;
      z-index: 1100;
      overflow: hidden;
      height: 38px;
      font-family: 'Jost', sans-serif;
      cursor: pointer;
      background: linear-gradient(90deg,#1e3f7a,#2d59a8);
    }
    #cjf-ticker-track {
      display: flex;
      align-items: center;
      height: 100%;
      white-space: nowrap;
      animation: tickerScroll 30s linear infinite;
    }
    #cjf-ticker:hover #cjf-ticker-track { animation-play-state: paused; }
    @keyframes tickerScroll {
      0%   { transform: translateX(100vw); }
      100% { transform: translateX(-100%); }
    }
    #cjf-ticker-content {
      font-size: 13.5px;
      font-weight: 700;
      color: white;
      letter-spacing: 0.02em;
    }
    .ann-ticker-item { display: inline; }
    .ann-ticker-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 2px 9px;
      border-radius: 20px;
      margin-right: 8px;
      background: rgba(255,255,255,0.2);
      color: white;
      vertical-align: middle;
    }
    .ann-ticker-sep {
      margin: 0 24px;
      opacity: 0.4;
      font-size: 16px;
    }
    .ann-ticker-hint {
      font-size: 11px;
      opacity: 0.7;
      margin-left: 8px;
    }
    #cjf-ticker-close {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 24px; height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
      transition: background .2s;
    }
    #cjf-ticker-close:hover { background: rgba(255,255,255,0.4); }

    /* MODAL */
    #cjf-ann-modal { display:none; position:fixed; inset:0; background:rgba(14,31,63,.72); z-index:9999; align-items:center; justify-content:center; padding:20px; }
    #cjf-ann-modal.open { display:flex; }
    #cjf-ann-modal-box { background:white; border-radius:20px; max-width:580px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 40px 100px rgba(14,31,63,.4); position:relative; animation:modalPop .3s ease; }
    @keyframes modalPop { from{transform:scale(.92);opacity:0} to{transform:scale(1);opacity:1} }
    #cjf-ann-modal-img { width:100%; max-height:320px; object-fit:cover; border-radius:20px 20px 0 0; display:none; }
    #cjf-ann-modal-body { padding:28px 32px 32px; }
    .ann-modal-item { border-bottom: 1px solid #eef1f8; padding-bottom: 24px; margin-bottom: 24px; }
    .ann-modal-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
    .ann-modal-tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:20px; margin-bottom:10px; font-family:'Jost',sans-serif; }
    .ann-tag-event{background:#e3ecf8;color:#1e3f7a} .ann-tag-urgent{background:#fce4e4;color:#b71c1c} .ann-tag-info{background:#fff3e0;color:#e65100} .ann-tag-success{background:#e8f5e9;color:#1b5e20}
    .ann-modal-title { font-size:20px; font-weight:800; color:#0e1f3f; margin-bottom:8px; font-family:'Jost',sans-serif; line-height:1.3; }
    .ann-modal-dates { font-size:12px; color:#8a9ab8; font-weight:600; margin-bottom:10px; font-family:'Jost',sans-serif; }
    .ann-modal-desc { font-size:15px; color:#4a5f80; line-height:1.8; margin-bottom:14px; font-family:'Jost',sans-serif; white-space:pre-line; }
    .ann-modal-link { display:inline-block; background:#2d59a8; color:white; padding:10px 22px; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; font-family:'Jost',sans-serif; transition:background .2s; }
    .ann-modal-link:hover { background:#1e3f7a; color:white; }
    #cjf-ann-modal-close-btn { background:#f0f4fb; color:#4a5f80; padding:12px 22px; border-radius:8px; border:none; font-weight:700; font-size:14px; font-family:'Jost',sans-serif; cursor:pointer; margin-top:8px; }
    #cjf-ann-modal-close-x { position:absolute; top:14px; right:16px; background:rgba(255,255,255,.9); border:none; width:34px; height:34px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,.15); z-index:10; }
    @media(max-width:600px){ #cjf-ann-modal-body{padding:20px} .ann-modal-title{font-size:17px} }
  `;
  document.head.appendChild(style);

  const ticker = document.createElement('div');
  ticker.id = 'cjf-ticker';
  ticker.innerHTML = `
    <div id="cjf-ticker-track">
      <div id="cjf-ticker-content"></div>
    </div>
    <button id="cjf-ticker-close" title="Dismiss all">✕</button>`;
  ticker.addEventListener('click', function(e) {
    if (e.target.closest('#cjf-ticker-close')) return;
    document.getElementById('cjf-ann-modal').classList.add('open');
  });

  const modal = document.createElement('div');
  modal.id = 'cjf-ann-modal';
  modal.innerHTML = `
    <div id="cjf-ann-modal-box">
      <button id="cjf-ann-modal-close-x" onclick="document.getElementById('cjf-ann-modal').classList.remove('open')">✕</button>
      <div id="cjf-ann-modal-body">
        <div id="cjf-ann-modal-items"></div>
        <button id="cjf-ann-modal-close-btn" onclick="document.getElementById('cjf-ann-modal').classList.remove('open')">Close</button>
      </div>
    </div>`;
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });

  function inject() {
    var header = document.querySelector('.header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(ticker, header.nextSibling);
    } else {
      var topbar = document.querySelector('.topbar');
      var ref = topbar || document.body.firstChild;
      if (topbar) topbar.parentNode.insertBefore(ticker, topbar.nextSibling);
      else document.body.insertAdjacentElement('afterbegin', ticker);
    }
    document.body.appendChild(modal);
  }

  function isExpired(ann) {
    var expiry = ann.eventStartDate || ann.expiryDate;
    if (!expiry) return false;
    return new Date().toISOString().slice(0,10) > expiry;
  }

  function buildTickerText(announcements) {
    var typeLabels = { event:'📅', urgent:'🚨', info:'ℹ️', success:'✅' };
    // Build one long string with all announcements separated by dividers, repeated 3x
    var parts = announcements.map(function(ann) {
      var emoji = typeLabels[ann.type] || '📢';
      var text = emoji + ' ' + (ann.message || ann.title || '');
      if (ann.eventStartDate) {
        var d = new Date(ann.eventStartDate);
        text += ' · Starts ' + d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
      }
      if (ann.eventEndDate) {
        var d2 = new Date(ann.eventEndDate);
        text += ' – Ends ' + d2.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
      }
      return text;
    });
    var single = parts.join('     ✦     ');
    return single + '     ✦✦✦     ' + single + '     ✦✦✦     ' + single;
  }

  function buildModal(announcements) {
    var typeLabels = { event:'📅 Event', urgent:'🚨 Urgent', info:'ℹ️ Info', success:'✅ Announcement' };
    var html = '';
    announcements.forEach(function(ann) {
      var type = ann.type || 'event';
      html += '<div class="ann-modal-item">';
      if (ann.imageUrl) html += '<img src="' + ann.imageUrl + '" alt="" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:14px"/>';
      html += '<div class="ann-modal-tag ann-tag-' + type + '">' + (typeLabels[type]||'📢 Announcement') + '</div>';
      html += '<div class="ann-modal-title">' + (ann.title || ann.message || '') + '</div>';
      var dates = '';
      if (ann.eventStartDate) {
        var ds = new Date(ann.eventStartDate);
        dates += '📅 Starts: ' + ds.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      }
      if (ann.eventEndDate) {
        var de = new Date(ann.eventEndDate);
        if (dates) dates += '  ·  ';
        dates += 'Ends: ' + de.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      }
      if (dates) html += '<div class="ann-modal-dates">' + dates + '</div>';
      if (ann.description) html += '<div class="ann-modal-desc">' + ann.description + '</div>';
      if (ann.title && ann.message && ann.description !== ann.message) html += '<div class="ann-modal-desc">' + ann.message + '</div>';
      if (ann.linkText && ann.linkUrl) {
        html += '<a class="ann-modal-link" href="' + ann.linkUrl + '" target="' + (ann.linkUrl.startsWith('http')?'_blank':'_self') + '">' + ann.linkText + ' →</a>';
      }
      html += '</div>';
    });
    document.getElementById('cjf-ann-modal-items').innerHTML = html;
  }

  function showTicker(announcements, sessionKey) {
    if (sessionStorage.getItem('cjf-ann-dismissed-all-' + sessionKey)) return;

    document.getElementById('cjf-ticker-close').onclick = function(e) {
      e.stopPropagation();
      sessionStorage.setItem('cjf-ann-dismissed-all-' + sessionKey, '1');
      ticker.style.display = 'none';
    };

    document.getElementById('cjf-ticker-content').textContent = buildTickerText(announcements);
    buildModal(announcements);

    // Use urgency colour from first announcement
    var type = announcements[0].type || 'event';
    var colours = { event:'linear-gradient(90deg,#1e3f7a,#2d59a8)', urgent:'linear-gradient(90deg,#b71c1c,#c62828)', info:'linear-gradient(90deg,#e65100,#f57c00)', success:'linear-gradient(90deg,#1b5e20,#2e7d32)' };
    ticker.style.background = colours[type] || colours.event;

    // Adjust scroll speed based on content length
    var len = document.getElementById('cjf-ticker-content').textContent.length;
    var duration = Math.max(20, Math.min(60, len / 8));
    ticker.querySelector('#cjf-ticker-track').style.animationDuration = duration + 's';

    ticker.style.display = 'block';
  }

  function loadAnnouncements() {
    try {
      if (!firebase.apps.length) firebase.initializeApp(CJF_FIREBASE_CONFIG);
    } catch(e) {}

    try {
      var db = firebase.firestore();
      db.collection('announcements').get().then(function(snap) {
        var today = new Date().toISOString().slice(0,10);
        var active = snap.docs
          .map(function(d) { return d.data(); })
          .filter(function(a) {
            if (!a.active) return false;
            // RULE 1: Show immediately from when admin saves it (no start-date gating).
            // Only hide BEFORE showFromDate if the admin explicitly set a future date.
            if (a.showFromDate && today < a.showFromDate) return false;
            // RULE 2: Hide AFTER the end/expiry date has passed.
            // Uses eventStartDate (confusingly named — it's actually the event day = expiry)
            // or the dedicated expiryDate field, whichever is set.
            var expiry = a.expiryDate || a.eventStartDate || null;
            if (expiry && today > expiry) return false;
            // No end date set = show indefinitely until admin deactivates it
            return true;
          });
        if (!active.length) return;
        // Session key = comma-joined titles so dismissal resets when announcements change
        var sessionKey = active.map(function(a){ return a.title||a.message||''; }).join(',');
        showTicker(active, sessionKey);
      }).catch(function(e) {
        console.warn('CJF Ann: query failed:', e.message);
      });
    } catch(e) {
      console.warn('CJF Ann: firestore failed:', e.message);
    }
  }

  function init() {
    inject();
    var attempts = 0;
    var interval = setInterval(function() {
      attempts++;
      if (window.CJF_FIREBASE_READY && typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
        clearInterval(interval);
        loadAnnouncements();
      }
      if (attempts >= 50) clearInterval(interval);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
