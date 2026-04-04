const CACHE_NAME = 'portfolio-cache-v1';
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
});

// Intercepter les requêtes pour servir le cache si hors ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Redirige vers la version en cache si elle existe, sinon fait la requête réseau
        return response || fetch(event.request);
      })
  );
});
