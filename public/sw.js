// sw.js

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // Bypass waiting
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Lắng nghe notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Optional: background push messages (nếu sau này dùng push API)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Mini Zalo Chat';
  const options = {
    body: data.body || '',
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/906/906349.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
