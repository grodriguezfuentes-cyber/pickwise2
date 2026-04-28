const CACHE_NAME = "scanwise-v1";

const urlsToCache = [
  "/pickwise2/",
  "/pickwise2/index.html",
  "/pickwise2/styles.css",
  "/pickwise2/script.js",
  "/pickwise2/icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});