// Einfacher Cache-First-Service-Worker mit Laufzeit-Caching.
// CACHE_VERSION bei jeder inhaltlichen Änderung hochzählen, damit alte Caches verworfen werden.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'einheitenrechner-' + CACHE_VERSION;

const PRECACHE_URLS = [
  'index.html',
  'style.css',
  'converter.js',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
