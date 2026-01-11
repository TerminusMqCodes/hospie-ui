// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'hospie-pms.firebaseapp.com',
  projectId: 'hospie-pms',
  storageBucket: 'hospie-pms.appspot.com',
  messagingSenderId: '123456789',
  appId: 'your-app-id',
  measurementId: 'G-XXXXXXXXXX'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const { notification, data } = payload
  
  const notificationTitle = notification?.title || 'Hospie PMS'
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    tag: data?.tag || 'hospie-notification',
    data: data || {},
    requireInteraction: data?.requireInteraction === 'true',
    actions: []
  }

  // Add actions based on notification type
  if (data?.type === 'reservation') {
    notificationOptions.actions = [
      {
        action: 'view',
        title: 'View Reservation',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  } else if (data?.type === 'room_status') {
    notificationOptions.actions = [
      {
        action: 'view',
        title: 'View Room',
        icon: '/icons/room-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const data = event.notification.data
  const action = event.action
  
  if (action === 'dismiss') {
    return
  }

  // Determine URL based on notification data and action
  let url = '/'
  
  if (data.type === 'reservation') {
    if (data.reservationId) {
      url = `/reservations/${data.reservationId}`
    } else {
      url = '/reservations'
    }
  } else if (data.type === 'room_status') {
    if (data.roomId) {
      url = `/rooms/${data.roomId}`
    } else {
      url = '/rooms'
    }
  } else if (data.type === 'guest_message') {
    if (data.guestId) {
      url = `/guests/${data.guestId}`
    } else {
      url = '/guests'
    }
  } else if (data.type === 'payment') {
    url = '/finance/payments'
  } else if (data.type === 'maintenance') {
    url = '/maintenance'
  } else {
    url = '/dashboard'
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
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

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Track notification dismissal
  const data = event.notification.data
  if (data?.trackingId) {
    fetch('/api/push-notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trackingId: data.trackingId,
        action: 'dismissed'
      })
    }).catch(console.error)
  }
})