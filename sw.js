// ============================================================
// Air Taxi 2099 — Service Worker
// Bump CACHE_VERSION to match GAME_VERSION in index.html
// when you push an update. Everything else is automatic.
// ============================================================

const CACHE_VERSION = '1.1.5';
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

// ── Fetch: cache-first with background refresh ────────────────
//
// Everything, including index.html, is served from cache immediately
// when available, with a network refresh kicked off in the background
// for next time. index.html used to be network-first so that version
// bumps were "detected immediately," but that isn't actually how
// updates get picked up here — bumping CACHE_VERSION changes sw.js
// itself, which the browser diffs on its own and installs a new SW
// that re-fetches a fresh index.html into a new cache (see 'install'
// above); the banner then appears once that new SW is waiting.
// Network-first on every load just meant every normal visit had to
// wait on a full ~8MB fetch (this game embeds its music inline)
// before falling back to cache — painfully slow on a flaky
// connection, and outright broken with none at all.
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(cacheFirstWithRefresh(event.request));
});

async function cacheFirstWithRefresh(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Kick off a background refresh regardless
  const networkFetch = fetch(request)
    .then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
    .catch(() => null);

  // Return cached immediately if we have it
  if (cached) return cached;

  // Nothing cached yet (e.g. very first visit) — wait for the network,
  // and fail gracefully if that has nothing either.
  const networkRes = await networkFetch;
  return networkRes || new Response('Offline — please connect once to load Air Taxi 2099 for the first time.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// ── Message: SKIP_WAITING ────────────────────────────────────
// Sent by the update banner when the player taps "reload"
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
