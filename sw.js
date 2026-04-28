const CACHE_NAME = "scanwise-v4";

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

// FETCH INTELIGENTE (NO ROMPE NADA)
self.addEventListener("fetch", (event) => {

  const url = new URL(event.request.url);

  // 🚫 NO tocar recursos externos (API, librerías, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 🚫 NO tocar peticiones dinámicas (por seguridad)
  if (event.request.method !== "GET") {
    return;
  }

  // ✅ SOLO cachear tu app
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});