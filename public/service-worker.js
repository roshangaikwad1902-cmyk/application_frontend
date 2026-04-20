const CACHE_NAME = "hh-admin-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install Event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[PWA] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log("[PWA] Removing old cache", key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch Event (Network first, then cache)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
