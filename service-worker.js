const CACHE_NAME = 'todolist-cache-v3';
const urlsToCache = [
    'https://brinahfah.github.io/Todolist_pwa/',
    'https://brinahfah.github.io/Todolist_pwa/index.html',
    'https://brinahfah.github.io/Todolist_pwa/style.css',
    'https://brinahfah.github.io/Todolist_pwa/script.js',
    'https://brinahfah.github.io/Todolist_pwa/manifest.json',
    'https://brinahfah.github.io/Todolist_pwa/images/icon-192x192.png',
    'https://brinahfah.github.io/Todolist_pwa/icon-512x512.png'
];

// Événement d'installation : mise en cache des ressources essentielles
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Mise en cache des ressources.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Événement de récupération : interception des requêtes et tentative de réponse depuis le cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la ressource est en cache, on la renvoie
                if (response) {
                    return response;
                }
                // Sinon, on la récupère depuis le réseau
                return fetch(event.request).then(
                    response => {
                        // On vérifie si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // On clone la réponse pour pouvoir la mettre en cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Événement d'activation : gestion des anciennes versions du cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});