//The code below belongs in a service worker

const CACHE_NAME = "resource-cache";
const PRECACHE_ASSETS = [
  "./", // Alias for index.html
  "./index.html",
  "./apple-touch-icon.png",
];

// 1. Install Event: Pre-cache assets for "Cache Only" and "Cache First" demos
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }),
  );
});

// 2. Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// --- STRATEGIES ---

// Strategy A: Cache Only
// Good for: Generic offline fallbacks, static assets that never change.
const cacheOnly = (request) => {
  return caches.match(request).then((response) => {
    return response || new Response("Item not in cache!", { status: 404 });
  });
};

// Strategy B: Network Only
// Good for: Real-time API calls, non-get requests (POST), analytics.
const networkOnly = (request) => {
  return fetch(request).catch(() => {
    return new Response("Network error (You are offline)", { status: 503 });
  });
};

// Strategy C: Cache First (Falling back to Network)
// Good for: Images, fonts, scripts (things that don't change often).
const cacheFirst = (request) => {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) return cachedResponse;
    return fetch(request).then((networkResponse) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
    });
  });
};

// 3. Fetch Event: Router Logic
self.addEventListener("fetch", (event) => {
  event.respondWith(cacheOnly(event.request));
});
