
//  CJF Children's Corner — Service Worker (PWA)
//  Brand: #2E59A8 Primary Blue | #FFD54F Gold
//  Strategy: Cache-first for shell, network-first for data

const CACHE_NAME = 'cjf-cc-v3';
const SHELL_URLS = [
  '/childrens-corner',          // Vercel cleanUrls=true strips .html
  '/css/styles.css',
  '/css/enhancements.css',
  '/js/main.js',
  '/js/enhancements.js',
  '/js/announcement.js',
  '/images/cjf-logo-colour.png',
  '/images/cjf-logo-nav-colour.png',
  '/favicon.ico',
  // Google Fonts cached on first load
];

// Install: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for shell, network-first for API ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests (Firebase, Fonts CDN)
  if (url.origin !== location.origin) {
    // For Google Fonts: try network, fall back gracefully
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
              cache.put(event.request, response.clone());
              return response;
            }).catch(() => new Response('', { status: 200 }));
          })
        )
      );
    }
    return;
  }

  // HTML pages: network-first (fresh content), cache fallback
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS/JS/Images: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for offline report submissions
self.addEventListener('sync', event => {
  if (event.tag === 'cjf-offline-report') {
    event.waitUntil(syncOfflineReports());
  }
});

async function syncOfflineReports() {
  const db = await openReportDB();
  const tx = db.transaction('pending', 'readwrite');
  const store = tx.objectStore('pending');
  const all = await idbGetAll(store);
  for (const report of all) {
    try {
      await submitReportToFirebase(report);
      const dtx = db.transaction('pending', 'readwrite');
      dtx.objectStore('pending').delete(report.id);
    } catch (e) {
      // Will retry on next sync
    }
  }
}

function openReportDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('cjf-reports', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
    req.onsuccess = e => res(e.target.result);
    req.onerror = rej;
  });
}

function idbGetAll(store) {
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = e => res(e.target.result);
    req.onerror = rej;
  });
}

async function submitReportToFirebase(report) {
  // This will be called when connectivity is restored
  // Firebase SDK not available in SW — use REST API
  const url = `https://firestore.googleapis.com/v1/projects/${report.projectId}/databases/(default)/documents/incident_reports`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        situation: { stringValue: report.situation || '' },
        location: { stringValue: report.location || '' },
        ageGroup: { stringValue: report.ageGroup || '' },
        language: { stringValue: report.language || 'en' },
        timestamp: { timestampValue: report.timestamp },
        status: { stringValue: 'pending' }
      }
    })
  });
}
