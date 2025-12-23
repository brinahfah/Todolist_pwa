const CACHE_NAME = 'todolist-cache-v5';

const urlsToCache = [
  '/Todolist_pwa/',
  '/Todolist_pwa/index.html',
  '/Todolist_pwa/style.css',
  '/Todolist_pwa/script.js',
  '/Todolist_pwa/manifest.json',
  '/Todolist_pwa/images/icon-192x192.png',
  '/Todolist_pwa/images/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
