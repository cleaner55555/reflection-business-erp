// ── Enhanced Service Worker for Reflection ERP PWA ──────────────────────────
// Version: v3 — cache-first static, network-first API, offline fallback

const CACHE_NAME = 'reflection-v3';
const DATA_CACHE = 'reflection-data-v3';
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-72.svg',
  '/icons/icon-96.svg',
  '/icons/icon-128.svg',
  '/icons/icon-144.svg',
  '/icons/icon-152.svg',
  '/icons/icon-192.svg',
  '/icons/icon-384.svg',
  '/icons/icon-512.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Don't fail install if some assets are unavailable
        console.warn('[SW] Some static assets failed to cache');
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-HTTP(S)
  if (request.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;

  // API requests: Network-first, fallback to cache, then offline response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Static assets (images, fonts, styles, scripts): Cache-first, stale-while-revalidate
  if (['image', 'font', 'style', 'script'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigation requests: Network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/') || offlineFallback())
        )
    );
    return;
  }

  // Default: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || offlineFallback()))
  );
});

// ─── Network-first with cache for API ───────────────────────────────────────
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch (error) {
    // Try data cache first, then static cache
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline JSON response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Nema internet konekcije. Podaci će biti sinhronizovani kada se povežete.',
        offline: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }
}

// ─── Stale-while-revalidate for static assets ───────────────────────────────
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        cache.put(request, clone);
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ─── Offline fallback ───────────────────────────────────────────────────────
async function offlineFallback() {
  const offlinePage = await caches.match(OFFLINE_URL);
  if (offlinePage) return offlinePage;

  return new Response(
    `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reflection ERP — Van mreže</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #fafafa; color: #18181b;
      padding: 1rem; text-align: center;
    }
    .container { max-width: 400px; }
    .icon { font-size: 4rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #71717a; line-height: 1.6; margin-bottom: 1.5rem; }
    button {
      background: #09090b; color: white; border: none;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-size: 1rem; cursor: pointer;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Van mreže</h1>
    <p>Niste povezani na internet. Reflection ERP će raditi sa keširanim podacima. Povežite se za sinhronizaciju.</p>
    <button onclick="window.location.reload()">Pokušaj ponovo</button>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
  );
}

// ─── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'Reflection ERP',
    body: 'Nova notifikacija',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg',
    url: '/',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // Fallback to default data
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [200, 100, 200, 100, 200],
      data: { url: data.url || '/' },
      tag: 'reflection-notification',
      renotify: true,
      actions: [
        { action: 'open', title: 'Otvori' },
        { action: 'dismiss', title: 'Zatvori' },
      ],
    })
  );
});

// ─── Notification Click ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ─── Background Sync ────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

async function syncOfflineActions() {
  // Replay queued offline POST/PUT/DELETE requests
  try {
    const db = await openIndexedDB();
    if (!db) return;

    const tx = db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    const actions = await idbGetAll(store);

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers || { 'Content-Type': 'application/json' },
          body: action.body,
        });
        if (response.ok) {
          store.delete(action.id);
        }
      } catch {
        // Will retry on next sync event
      }
    }

    db.close();
  } catch (error) {
    console.warn('[SW] Background sync failed:', error);
  }
}

async function syncBookmarks() {
  // Placeholder for bookmark sync
}

// ─── Periodic Background Sync ───────────────────────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-data') {
    event.waitUntil(refreshData());
  }
});

async function refreshData() {
  // Refresh key API endpoints in the background
  const endpoints = ['/api/health'];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const cache = await caches.open(DATA_CACHE);
        await cache.put(endpoint, response.clone());
      }
    } catch {
      // Silently fail — will retry next time
    }
  }
}

// ─── IndexedDB helpers ──────────────────────────────────────────────────────
function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('reflection-offline', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offline-queue')) {
          db.createObjectStore('offline-queue', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbGetAll(store: IDBObjectStore): Promise<any[]> {
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

// ─── Message handler (for communication with main thread) ───────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(DATA_CACHE);
  }
});
