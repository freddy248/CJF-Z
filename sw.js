//  CJF Website — Service Worker
//  Strategy: network-first for HTML, cache-first for assets
//  Safari-safe: never call respondWith with null/undefined

const CACHE_NAME = 'cjf-v4';
const SHELL_URLS = [
  '/',
  '/childrens-corner',
  '/news-and-events',
  '/resources',
  '/about',
  '/contact',
  '/css/styles.css',
  '/css/enhancements.css',
  '/js/main.js',
  '/js/enhancements.js',
  '/js/announcement.js',
  '/images/cjf-logo-colour.png',
  '/images/cjf-logo-nav-colour.png',
  '/favicon.ico',
];

// Install: pre-cache shell (non-blocking — failures don't kill SW)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(SHELL_URLS.map(u => cache.add(u).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: ALWAYS respond — never let respondWith receive null
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // ── Only handle GET requests ──────────────────────────
  if (req.method !== 'GET') return; // let browser handle non-GET natively

  // ── Skip cross-origin (Firebase, CDN, Fonts) ─────────
  // Do NOT call event.respondWith for cross-origin — let browser fetch natively
  if (url.origin !== self.location.origin) return;

  // ── HTML pages: network-first, cache fallback ─────────
  if (req.destination === 'document' || req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(req, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          // Offline fallback: return a minimal offline message
          return new Response(
            '<html><body style="font-family:sans-serif;padding:40px;text-align:center">' +
            '<h2>You are offline</h2><p>Please check your connection and try again.</p>' +
            '</body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // ── CSS / JS / Images / Fonts: cache-first, network fallback ──
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(response => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(req, response.clone()));
          }
          return response;
        })
        .catch(() => new Response('', { status: 408, statusText: 'Network error' }));
    })
  );
});
