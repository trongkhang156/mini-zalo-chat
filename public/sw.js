// sw.js
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        // Nếu tab đã mở thì focus lại
        return clientList[0].focus();
      }
      // Nếu chưa mở thì mở mới
      return clients.openWindow("/");
    })
  );
});
