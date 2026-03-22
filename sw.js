// sw.js - Service Worker สำหรับ SMART QA FACTORY Audit App

const CACHE_NAME = "qa-audit-cache-v1";
const urlsToCache = [
  "./",
  "./audit_app.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
];

// ติดตั้ง Service Worker และ cache ไฟล์พื้นฐาน
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// เปิดใช้งาน Service Worker และลบ cache เก่า
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ดักจับการร้องขอ (fetch) และตอบกลับจาก cache ก่อน
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // ถ้ามีใน cache → ใช้เลย
      if (response) {
        return response;
      }
      // ถ้าไม่มี → ดึงจาก network แล้วเก็บลง cache
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
