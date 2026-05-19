// ── Offline Queue ────────────────────────────────────────────────────────────
// Queues API requests made while offline and replays them when back online.
// Uses IndexedDB for persistence so queued actions survive page refreshes.

'use client'

export interface QueuedRequest {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: Record<string, string>
  body: string
  timestamp: number
  retries: number
  maxRetries: number
}

const DB_NAME = 'reflection-offline'
const DB_VERSION = 1
const STORE_NAME = 'offline-queue'
const SYNC_EVENT = 'sync-offline-actions'

let dbPromise: Promise<IDBDatabase | null> | null = null

// ─── IndexedDB ──────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.warn('[OfflineQueue] Failed to open IndexedDB')
        resolve(null)
      }
    } catch {
      resolve(null)
    }
  })

  return dbPromise
}

async function getAllQueued(): Promise<QueuedRequest[]> {
  const db = await openDB()
  if (!db) return []

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => resolve([])
  })
}

async function addQueued(request: QueuedRequest): Promise<void> {
  const db = await openDB()
  if (!db) return

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(request)
    tx.oncomplete = () => {
      notifyChange()
      resolve()
    }
    tx.onerror = () => resolve()
  })
}

async function removeQueued(id: string): Promise<void> {
  const db = await openDB()
  if (!db) return

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => {
      notifyChange()
      resolve()
    }
    tx.onerror = () => resolve()
  })
}

async function clearAllQueued(): Promise<void> {
  const db = await openDB()
  if (!db) return

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    tx.oncomplete = () => {
      notifyChange()
      resolve()
    }
    tx.onerror = () => resolve()
  })
}

// ─── Change listeners (for UI reactivity) ───────────────────────────────────

type Listener = (count: number) => void
const listeners = new Set<Listener>()

function notifyChange() {
  getPendingCount().then((count) => {
    listeners.forEach((fn) => {
      try {
        fn(count)
      } catch {}
    })
  })
}

export function subscribeToOfflineQueue(fn: Listener): () => void {
  listeners.add(fn)
  // Immediately send current count
  getPendingCount().then((count) => {
    try {
      fn(count)
    } catch {}
  })
  return () => {
    listeners.delete(fn)
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Generate a unique ID for queued requests */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Add a request to the offline queue.
 * Should be called when a fetch fails due to being offline.
 */
export async function queueRequest(
  url: string,
  method: QueuedRequest['method'],
  body?: unknown,
  headers?: Record<string, string>,
  maxRetries = 3
): Promise<QueuedRequest> {
  const request: QueuedRequest = {
    id: generateId(),
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    timestamp: Date.now(),
    retries: 0,
    maxRetries,
  }

  await addQueued(request)
  return request
}

/** Get count of pending queued requests */
export async function getPendingCount(): Promise<number> {
  const items = await getAllQueued()
  return items.length
}

/** Get all queued requests (for display purposes) */
export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  const items = await getAllQueued()
  return items.sort((a, b) => b.timestamp - a.timestamp)
}

/** Remove a specific queued request */
export async function removeRequest(id: string): Promise<void> {
  await removeQueued(id)
}

/** Clear all queued requests */
export async function clearQueue(): Promise<void> {
  await clearAllQueued()
}

/**
 * Process all queued requests.
 * Call this when coming back online.
 */
export async function processQueue(): Promise<{
  processed: number
  failed: number
  errors: string[]
}> {
  const items = await getAllQueued()
  let processed = 0
  let failed = 0
  const errors: string[] = []

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.method !== 'DELETE' ? item.body : undefined,
      })

      if (response.ok) {
        await removeQueued(item.id)
        processed++
      } else {
        item.retries++
        if (item.retries >= item.maxRetries) {
          await removeQueued(item.id)
          errors.push(`${item.method} ${item.url}: HTTP ${response.status}`)
          failed++
        } else {
          await addQueued(item)
        }
      }
    } catch (error) {
      item.retries++
      if (item.retries >= item.maxRetries) {
        await removeQueued(item.id)
        errors.push(`${item.method} ${item.url}: ${String(error)}`)
        failed++
      } else {
        await addQueued(item)
      }
    }
  }

  return { processed, failed, errors }
}

/**
 * Enhanced fetch that falls back to offline queue on failure.
 * Use this instead of raw fetch for mutations.
 */
export async function offlineAwareFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // If we're back online, process any queued requests
    if (navigator.onLine) {
      processQueue().catch(() => {})
    }

    return response
  } catch (error) {
    // Only queue mutation requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
      const body = options.body
      const headers: Record<string, string> = {}
      if (options.headers) {
        const h = options.headers
        if (h instanceof Headers) {
          h.forEach((v, k) => { headers[k] = v })
        } else if (Array.isArray(h)) {
          h.forEach(([k, v]) => { headers[k] = v })
        } else {
          Object.assign(headers, h)
        }
      }

      await queueRequest(
        url,
        options.method?.toUpperCase() as QueuedRequest['method'] || 'POST',
        typeof body === 'string' ? body : undefined,
        headers
      )

      // Return a fake "accepted" response
      return new Response(
        JSON.stringify({
          queued: true,
          message: 'Zahtev je u redu za sinhronizaciju. Biće poslat kada se povežete na internet.',
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    throw error
  }
}

// ─── Online/Offline Detection ───────────────────────────────────────────────

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

type OnlineStatusListener = (online: boolean) => void
const statusListeners = new Set<OnlineStatusListener>()
let statusInitialized = false

export function subscribeToOnlineStatus(fn: OnlineStatusListener): () => void {
  statusListeners.add(fn)

  if (!statusInitialized && typeof window !== 'undefined') {
    statusInitialized = true
    window.addEventListener('online', () => {
      statusListeners.forEach((l) => l(true))
      // Auto-process queue when back online
      processQueue().catch(() => {})
    })
    window.addEventListener('offline', () => {
      statusListeners.forEach((l) => l(false))
    })
  }

  return () => {
    statusListeners.delete(fn)
  }
}

// ─── Register Service Worker Background Sync ────────────────────────────────

export async function registerBackgroundSync(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    if ('sync' in registration) {
      await (registration as any).sync.register(SYNC_EVENT)
      return true
    }
  } catch {}

  return false
}
