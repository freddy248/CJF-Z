/**
 * CJF Notification Bell
 * Shows a shaking bell on nav links when admin publishes new content.
 * Reads lastUpdated timestamps from Firestore settings/notifications.
 * Clears the bell when the user visits that page.
 */
(function(){
  // Map: page href fragment → Firestore field name in settings/notifications
  var PAGE_KEYS = {
    'news.html':            'news',
    'resources.html':       'resources',
    'memories.html':        'memories',
    'impact-stories.html':  'impact_stories',
    'childrens-corner.html':'audio_stories'
  };

  var LS_PREFIX = 'cjf_seen_';

  // CSS injected once
  var styleId = 'cjf-bell-style';
  function injectStyle(){
    if(document.getElementById(styleId)) return;
    var s = document.createElement('style');
    s.id = styleId;
    s.textContent = [
      '.cjf-bell-badge{',
        'display:inline-flex;align-items:center;gap:3px;',
        'margin-left:5px;font-size:13px;',
        'animation:cjfBellShake 0.6s ease infinite;',
        'transform-origin:top center;',
        'vertical-align:middle;',
      '}',
      '@keyframes cjfBellShake{',
        '0%,100%{transform:rotate(0deg);}',
        '15%{transform:rotate(18deg);}',
        '30%{transform:rotate(-16deg);}',
        '45%{transform:rotate(12deg);}',
        '60%{transform:rotate(-8deg);}',
        '75%{transform:rotate(5deg);}',
      '}',
      '.cjf-bell-dot{',
        'width:7px;height:7px;border-radius:50%;',
        'background:#e63946;display:inline-block;',
        'box-shadow:0 0 0 2px rgba(230,57,70,0.3);',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  // Add bell to all nav links matching a key
  function addBell(hrefKey){
    var links = document.querySelectorAll('a[href="'+hrefKey+'"], a[href*="/'+hrefKey+'"]');
    links.forEach(function(link){
      if(link.querySelector('.cjf-bell-badge')) return; // already has bell
      var badge = document.createElement('span');
      badge.className = 'cjf-bell-badge';
      badge.title = 'New content available!';
      badge.innerHTML = '🔔<span class="cjf-bell-dot"></span>';
      link.appendChild(badge);
    });
  }

  // Remove bell from nav links for a key
  function removeBell(hrefKey){
    var links = document.querySelectorAll('a[href="'+hrefKey+'"], a[href*="/'+hrefKey+'"]');
    links.forEach(function(link){
      var badge = link.querySelector('.cjf-bell-badge');
      if(badge) badge.remove();
    });
  }

  // Mark current page as seen (store the timestamp we last saw)
  function markCurrentPageSeen(pageKey, ts){
    try{ localStorage.setItem(LS_PREFIX + pageKey, ts); }catch(e){}
  }

  // Get last-seen timestamp for a page key
  function getLastSeen(pageKey){
    try{ return localStorage.getItem(LS_PREFIX + pageKey) || '0'; }catch(e){ return '0'; }
  }

  // Detect which page we're on now
  function currentPageKey(){
    var path = location.pathname;
    for(var href in PAGE_KEYS){
      if(path.indexOf(href) !== -1) return PAGE_KEYS[href];
    }
    return null;
  }

  function run(){
    if(typeof firebase === 'undefined' || !window.CJF_FIREBASE_CONFIG) return;
    try{
      var app;
      try{ app = firebase.app(); }catch(e){ app = firebase.initializeApp(CJF_FIREBASE_CONFIG); }
      var db = firebase.firestore(app);

      db.collection('settings').doc('notifications').get().then(function(doc){
        if(!doc.exists) return;
        var data = doc.data();
        injectStyle();

        for(var hrefKey in PAGE_KEYS){
          var fieldKey = PAGE_KEYS[hrefKey];
          var serverTs = data[fieldKey] || '0';
          var seenTs   = getLastSeen(fieldKey);

          if(serverTs > seenTs){
            addBell(hrefKey);
          } else {
            removeBell(hrefKey);
          }
        }

        // Mark current page as seen
        var curKey = currentPageKey();
        if(curKey && data[curKey]){
          markCurrentPageSeen(curKey, data[curKey]);
          // Remove bell for current page immediately
          for(var k in PAGE_KEYS){
            if(PAGE_KEYS[k] === curKey){ removeBell(k); break; }
          }
        }
      }).catch(function(e){ console.warn('CJF bell:', e.message); });

    }catch(e){ console.warn('CJF bell init:', e.message); }
  }

  // Wait for Firebase to be ready (announcement.js sets CJF_FIREBASE_READY)
  var attempts = 0;
  function tryRun(){
    if(window.CJF_FIREBASE_READY && typeof firebase !== 'undefined'){
      run();
    } else if(++attempts < 30){
      setTimeout(tryRun, 300);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', tryRun);
  } else {
    tryRun();
  }
})();
