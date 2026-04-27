import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
          
          // Check for updates every 5 minutes
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('[SW] New version activated');
                  // Show update notification (optional)
                  if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    }
  }, []);
}
