const CACHE_NAME = 'bunbabe-v1';
const ASSETS = [
  'index.html',
  'about.html',
  'shop.html',
  'contact.html',
  'care.html',
  'admin.html',
  'checkout.html',
  'style.css',
  'cart.js',
  'spreadsheet.js',
  'logo.png',
  'manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets 🧶');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
