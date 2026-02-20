// InstantRyde Service Worker
const CACHE_NAME = 'instantryde-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    const options = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/pwa-icons/icon-192.png',
      badge: '/pwa-icons/badge-72.png',
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

    event.waitUntil(
      self.registration.showNotification(data.title || 'InstantRyde', options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // Fallback for text data
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('InstantRyde', {
        body: text,
        icon: '/pwa-icons/icon-192.png',
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  // Handle action clicks
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
      // If we already have a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
          });
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message handler for subscription updates
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch handler - network first strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache GET requests
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
        });
        
        return response;
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(event.request);
      })
  );
});
