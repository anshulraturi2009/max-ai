export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Install support should fail quietly rather than disrupting chat.
    });
  });
}
