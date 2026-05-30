// ============================================================
// Air Taxi 2099 — Service Worker
// Bump CACHE_VERSION to match GAME_VERSION in index.html
// when you push an update. Everything else is automatic.
// ============================================================

const CACHE_VERSION = '1.0.5';
const CACHE_NAME    = `air-taxi-2099-v${CACHE_VERSION}`;

// Every URL the game needs to run fully offline.
// Google Fonts are fetched & cached on first visit so they
// work offline thereafter.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap',
];

// ── Install: pre-cache all core assets ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache same-origin assets reliably; cross-origin (fonts) best-effort
      const sameOrigin = PRECACHE_URLS.filter(u => !u.startsWith('http'));
      const crossOrigin = PRECACHE_URLS.filter(u => u.startsWith('http'));

      return cache.addAll(sameOrigin).then(() =>
        Promise.allSettled(
          crossOrigin.map(url =>
            fetch(url, { mode: 'cors' })
              .then(res => res.ok ? cache.put(url, res) : null)
              .catch(() => null) // offline during install — skip fonts, game still works
          )
        )
      );
    })
  ).then(() => self.skipWaiting());
});

// ── Activate: delete old caches ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('air-taxi-2099-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first with network fallback ─────────────────
//
// Strategy per resource type:
//   index.html        → network-first (detect updates), fall back to cache
//   everything else   → cache-first (fast), refresh cache in background
//
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // index.html — network first so version bumps are detected immediately
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }

  // Everything else — cache first, update in background
  event.respondWith(cacheFirstWithRefresh(event.request));
});

async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkRes = await fetch(new Request(request.url, { cache: 'no-cache' }));
    if (networkRes.ok) {
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    // Offline — serve cached version
    const cached = await cache.match(request);
    return cached || new Response('Offline — please reconnect to load Air Taxi 2099.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function cacheFirstWithRefresh(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Kick off a background refresh regardless
  const networkFetch = fetch(request)
    .then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
    .catch(() => null);

  // Return cached immediately if we have it, otherwise wait for network
  return cached || networkFetch;
}

// ── Message: SKIP_WAITING ────────────────────────────────────
// Sent by the update banner when the player taps "reload"
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
