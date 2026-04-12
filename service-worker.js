const CACHE_NAME = 'portfolio-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/glass-theme.css',
  '/js/main.js',
  '/js/chatbot.js'
];

// Installation du service worker et mise en cache des éléments de base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
});

// Nettoyage des anciens caches lors de l'activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Force le contrôle immédiat
});

// Stratégie "Network First" : Toujours chercher la version la plus récente en ligne
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les requêtes APIs
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la version la plus récente
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // En cas d'absence de réseau, utiliser la version en cache
        return caches.match(event.request);
      })
  );
});
