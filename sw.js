const CACHE_NAME = "scanwise-v5";

const urlsToCache = [
  "/pickwise2/",
  "/pickwise2/index.html",
  "/pickwise2/styles.css",
  "/pickwise2/script.js",
  "/pickwise2/icon.png"
];

// INSTALACIÓN
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// ACTIVACIÓN
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// FETCH
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});