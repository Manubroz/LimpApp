const CACHE_NAME = 'limpapp-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',   // Corrigido de app.js para script.js
  './dados.json',   // Adicionado para garantir o funcionamento offline da simulação
  './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});