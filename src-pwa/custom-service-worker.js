/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// API Routes - Network First with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'hospie-api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
)

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'hospie-images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// Static assets - Stale While Revalidate
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'hospie-static-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Background Sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync())
  }
})

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    tag: data.tag || 'hospie-notification',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const data = event.notification.data
  let url = '/'

  // Determine URL based on notification data
  if (data.type === 'reservation' && data.reservationId) {
    url = `/reservations/${data.reservationId}`
  } else if (data.type === 'room_status' && data.roomId) {
    url = `/rooms/${data.roomId}`
  } else if (data.type === 'guest_message' && data.guestId) {
    url = `/guests/${data.guestId}`
  } else if (data.type === 'payment') {
    url = '/finance/payments'
  } else if (data.type === 'maintenance') {
    url = '/maintenance'
  } else {
    url = '/dashboard'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Background sync function
async function performBackgroundSync() {
  try {
    // Open IndexedDB to get sync queue
    const db = await openIndexedDB()
    const syncQueue = await getSyncQueue(db)
    
    if (syncQueue.length === 0) return

    // Process sync items
    for (const item of syncQueue) {
      try {
        await processSyncItem(item)
        await markAsSynced(db, item.id)
      } catch (error) {
        console.error('Sync failed for item:', item, error)
        await incrementRetryCount(db, item.id)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HospiePMS', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function getSyncQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    const index = store.index('synced')
    const request = index.getAll(false)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function markAsSynced(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    const getRequest = store.get(itemId)
    
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (item) {
        item.synced = true
        item.syncedAt = new Date().toISOString()
        const putRequest = store.put(item)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

function incrementRetryCount(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    const getRequest = store.get(itemId)
    
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1
        item.lastRetry = new Date().toISOString()
        const putRequest = store.put(item)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

async function processSyncItem(item) {
  const { type, data } = item
  const token = await getAuthToken()
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }

  let url
  switch (type) {
    case 'reservation_create':
      url = '/api/reservations'
      break
    case 'reservation_update':
      url = `/api/reservations/${data.id}`
      options.method = 'PUT'
      break
    case 'room_status_update':
      url = `/api/rooms/${data.roomId}/status`
      options.body = JSON.stringify({ status: data.status })
      break
    case 'guest_create':
      url = '/api/guests'
      break
    case 'guest_update':
      url = `/api/guests/${data.id}`
      options.method = 'PUT'
      break
    default:
      throw new Error(`Unknown sync type: ${type}`)
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

async function getAuthToken() {
  // Try to get token from IndexedDB or localStorage
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['settings'], 'readonly')
    const store = transaction.objectStore('settings')
    const request = store.get('auth_token')
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
      request.onerror = () => resolve(null)
    })
  } catch (error) {
    return null
  }
}

// Offline page fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await createHandlerBoundToURL('/index.html')({ event })
    } catch (error) {
      return caches.match('/offline.html')
    }
  }
)

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  )
}
