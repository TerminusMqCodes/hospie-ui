import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { useQuasar } from 'quasar'

class FirebaseService {
  constructor() {
    this.app = null
    this.messaging = null
    this.vapidKey = process.env.FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY_HERE'
    this.isInitialized = false
    this.$q = null
  }

  // Firebase configuration
  getFirebaseConfig() {
    return {
      apiKey: process.env.FIREBASE_API_KEY || 'your-api-key',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'hospie-pms.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'hospie-pms',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'hospie-pms.appspot.com',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: process.env.FIREBASE_APP_ID || 'your-app-id',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX'
    }
  }

  // Initialize Firebase
  async initialize() {
    if (this.isInitialized) return

    try {
      // Initialize Firebase app
      this.app = initializeApp(this.getFirebaseConfig())
      
      // Initialize messaging if supported
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.messaging = getMessaging(this.app)
        this.setupMessageListener()
        this.isInitialized = true
        console.log('Firebase initialized successfully')
      } else {
        console.warn('Push messaging is not supported in this browser')
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error)
      throw error
    }
  }

  // Setup message listener for foreground messages
  setupMessageListener() {
    if (!this.messaging) return

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload)
      this.handleForegroundMessage(payload)
    })
  }

  // Handle foreground messages
  handleForegroundMessage(payload) {
    const { notification, data } = payload

    if (this.$q) {
      this.$q.notify({
        message: notification?.title || 'New notification',
        caption: notification?.body || '',
        color: 'primary',
        icon: this.getNotificationIcon(data?.type),
        timeout: 5000,
        actions: [
          {
            label: 'View',
            color: 'white',
            handler: () => {
              this.handleNotificationClick(data)
            }
          },
          {
            label: 'Dismiss',
            color: 'white'
          }
        ]
      })
    }

    // Play notification sound if enabled
    this.playNotificationSound()
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const iconMap = {
      reservation: 'event',
      room_status: 'hotel',
      guest_message: 'message',
      payment: 'payment',
      maintenance: 'build',
      alert: 'warning',
      default: 'notifications'
    }
    return iconMap[type] || iconMap.default
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(console.error)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  // Handle notification click
  handleNotificationClick(data) {
    if (!data) return

    // Navigate based on notification type
    const router = this.$router
    if (!router) return

    switch (data.type) {
      case 'reservation':
        if (data.reservationId) {
          router.push(`/reservations/${data.reservationId}`)
        } else {
          router.push('/reservations')
        }
        break
      case 'room_status':
        if (data.roomId) {
          router.push(`/rooms/${data.roomId}`)
        } else {
          router.push('/rooms')
        }
        break
      case 'guest_message':
        if (data.guestId) {
          router.push(`/guests/${data.guestId}`)
        } else {
          router.push('/guests')
        }
        break
      case 'payment':
        router.push('/finance/payments')
        break
      case 'maintenance':
        router.push('/maintenance')
        break
      default:
        router.push('/dashboard')
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied')
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Get FCM token
  async getToken() {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        throw new Error('Notification permission not granted')
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      })

      if (token) {
        console.log('FCM token generated:', token)
        return token
      } else {
        throw new Error('No registration token available')
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error)
      throw error
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      const token = await this.getToken()
      
      // Send token to backend
      await this.sendTokenToServer(token)
      
      // Store token locally
      localStorage.setItem('fcm_token', token)
      
      return token
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  // Send token to server
  async sendTokenToServer(token) {
    try {
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          token,
          device_type: this.getDeviceType(),
          user_agent: navigator.userAgent,
          endpoint: 'fcm'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to register push subscription')
      }

      console.log('Push subscription registered successfully')
    } catch (error) {
      console.error('Failed to send token to server:', error)
      throw error
    }
  }

  // Get device type
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/android/.test(userAgent)) {
      return 'android'
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    } else if (/windows/.test(userAgent)) {
      return 'windows'
    } else if (/mac/.test(userAgent)) {
      return 'mac'
    } else {
      return 'web'
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      const token = localStorage.getItem('fcm_token')
      if (!token) return

      // Remove token from server
      await fetch('/api/push-subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ token })
      })

      // Remove token from local storage
      localStorage.removeItem('fcm_token')
      
      console.log('Unsubscribed from push notifications')
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      throw error
    }
  }

  // Check if notifications are supported and enabled
  isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Get notification permission status
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  // Set Quasar instance for notifications
  setQuasarInstance(q) {
    this.$q = q
  }

  // Set router instance for navigation
  setRouterInstance(router) {
    this.$router = router
  }

  // Test notification
  async testNotification() {
    if (!this.isNotificationSupported()) {
      throw new Error('Notifications not supported')
    }

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      throw new Error('Notification permission not granted')
    }

    // Show test notification
    new Notification('Hospie PMS Test', {
      body: 'Push notifications are working correctly!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-128x128.png',
      tag: 'test-notification',
      requireInteraction: false
    })
  }
}

export const firebaseService = new FirebaseService()
export default firebaseService