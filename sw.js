const CACHE_NAME = 'field-app-v1';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// ដំឡើង Service Worker និងរក្សាទុក File ក្នុង Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// បើក App ដោយប្រើទិន្នន័យពី Cache ពេល Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
