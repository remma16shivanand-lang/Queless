const CACHE_NAME = 'qgo-v1';
const ASSETS = [
  '/QGo/',
  '/QGo/index.html',
  '/QGo/queue.html',
  '/QGo/admin.html',
  '/QGo/register.html',
  '/QGo/manifest.json'
];

// Install — cache all core files
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', function(e) {
  // Skip Firebase and external requests — always fetch live
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('fonts.google') ||
      e.request.url.includes('cdnjs')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache new pages as we visit them
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        return caches.match('/QGo/index.html');
      });
    })
  );
});

// Push notifications
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : { title: 'QGo', body: "It's your turn!" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/QGo/icon-192.png',
      badge: '/QGo/icon-192.png',
      vibrate: [300, 100, 300],
      tag: 'qgo-notification',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Go Now!' }
      ]
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow('/QGo/queue.html'));
});
