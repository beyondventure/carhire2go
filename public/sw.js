// InstantRyde Push Service Worker
const CACHE_NAME = 'instantryde-static-v4';
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2', '.ico'];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      )
    )
  );
  return self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/pwa-icons/icon-512.png',
      badge: '/pwa-icons/icon-72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        bookingId: data.bookingId,
        type: data.type,
        dateOfArrival: Date.now(),
      },
      actions: data.actions || [],
      tag: data.tag || 'instantryde-notification',
      renotify: true,
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(data.title || 'InstantRyde', options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('InstantRyde', {
        body: text,
        icon: '/pwa-icons/icon-512.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  if (event.action) {
    switch (event.action) {
      case 'view':
        targetUrl = data.url || '/';
        break;
      case 'dismiss':
        return;
      default:
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data });
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache static assets only (never cache HTML navigations to avoid stale app/404 boot issues)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';
  if (isNavigation) return;

  const isStaticAsset = STATIC_EXTENSIONS.some((ext) => requestUrl.pathname.endsWith(ext));
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
