const CACHE_NAME = "hh-admin-cache-v2";

const staticAssets = [
  "./",
  "./index.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./favicon.svg"
];

// Install Event - Pre-cache core assets
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[PWA] Caching App Shell");
      return cache.addAll(staticAssets);
    })
  );
});

// Activate Event - Cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
            console.log("[PWA] Deleting old cache: ", key);
            return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic Stale-while-Revalidate strategy for true offline functionality
self.addEventListener("fetch", event => {
  const request = event.request;
  
  // Skip cross-origin or unusual methods
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-First for API requests to ensure real-time hotel data, with Cache-Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, resClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-While-Revalidate for UI Assets (JS, CSS, Images)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // Cache the newly fetched asset
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, resClone));
        return networkResponse;
      }).catch(error => {
        // If entirely offline and no cache match, fallback to index.html for Single Page App routing
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw error;
      });
      // Return cache immediately if available, while network fetch happens in background
      return cachedResponse || fetchPromise;
    })
  );
});
