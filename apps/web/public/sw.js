// Self-unregistering service worker for development
// This removes any previously registered SW and clears caches

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    ])
  );
});

self.addEventListener('fetch', () => {
  // Do nothing — let the network handle everything
});
