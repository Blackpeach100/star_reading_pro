/*
  Star Reading PWA - Service Worker
  © 2024 Star Reading. All Rights Reserved.
*/

const CACHE_NAME = 'star-reading-v9';

// キャッシュするファイル一覧
const CACHE_FILES = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700;800&display=swap'
];

// インストール時：ファイルをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(() => {});
    })
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// フェッチ時：キャッシュ優先、なければネット取得してキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return response;
      }).catch(() => cached);
    })
  );
});
