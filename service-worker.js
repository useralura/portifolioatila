const CACHE_NAME = 'tradutor-cache-v1';
const urlsToCache = [
    '/tradutor/',
    '/tradutor/index.html',
    '/tradutor/styles.css',
    '/tradutor/script.js',
    '/tradutor/palavras.csv'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Abrindo cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;  // Retorna a resposta cacheada, se encontrada
                }
                return fetch(event.request);  // Caso contrário, busca na rede
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (!cacheWhitelist.includes(key)) {
                    return caches.delete(key);  // Deleta caches antigos
                }
            }));
        })
    );
});
