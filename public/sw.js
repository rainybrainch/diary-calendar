/**
 * Service Worker - オフラインキャッシュとインストール機能
 */

const CACHE_NAME = 'forest-note-v1.4.0';
const ASSETS_TO_CACHE = [
  '/',
  '/input/quick',
  '/calendar',
  '/cards',
  '/achievements',
  '/manifest.json',
];

// インストール：必要なアセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // キャッシュ失敗時も続行（ネットワーク優先でフォールバック）
      });
    })
  );
  self.skipWaiting();
});

// アクティベート：古いキャッシュ削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ：ネットワーク優先、フォールバックでキャッシュ
self.addEventListener('fetch', (event) => {
  // GET リクエストのみ対象
  if (event.request.method !== 'GET') {
    return;
  }

  // API リクエストはネットワーク優先
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // ページリクエスト：ネットワーク優先 → キャッシュ
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功レスポンスをキャッシュ
        if (response.ok && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワーク失敗時はキャッシュ
        return caches.match(event.request) ||
          new Response('Offline', { status: 503 });
      })
  );
});

// メッセージ受信：キャッシュクリア等
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
