const CACHE_NAME = 'melodify-cache-v1';
const MUSIC_CACHE_NAME = 'melodify-music-cache-v1';
console.log('Service Worker Loaded');

// Assets to cache initially
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
];


self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    self.clients.claim(),
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== MUSIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  console.log('Fetching:', request.url);

 
  
  if ( url.pathname.includes('')) {
    event.respondWith(
      caches.open(MUSIC_CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response; // Return cached response
      }
      return fetch(request);
    })
  );
});

