const CACHE_NAME = "max-ai-shell-v4";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/max-ai-favicon-v3.ico",
  "/max-ai-apple-touch-v3.png",
  "/max-ai-icon-192-v3.png",
  "/max-ai-icon-512-v3.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  const isStaticAsset =
    ["script", "style", "image", "font"].includes(request.destination) ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".webmanifest");

  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse.ok) {
          return networkResponse;
        }

        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse));
        return networkResponse;
      });
    }),
  );
});
