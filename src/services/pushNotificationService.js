import firebaseService from './firebaseService'
import offlineStorage from './offlineStorage'

class PushNotificationService {
  constructor() {
    this.isEnabled = false
    this.subscription = null
    this.notificationQueue = []
  }

  // Initialize push notification service
  async initialize() {
    try {
      await firebaseService.initialize()
      
      // Check if notifications were previously enabled
      const wasEnabled = await offlineStorage.getSetting('push_notifications_enabled')
      if (wasEnabled) {
        await this.enable()
      }
      
      console.log('Push notification service initialized')
    } catch (error) {
      console.error('Failed to initialize push notification service:', error)
    }
  }

  // Enable push notifications
  async enable() {
    try {
      if (!firebaseService.isNotificationSupported()) {
        throw new Error('Push notifications are not supported in this browser')
      }

      // Request permission and get token
      const token = await firebaseService.subscribeToPush()
      
      this.isEnabled = true
      this.subscription = { token }
      
      // Save preference
      await offlineStorage.setSetting('push_notifications_enabled', true)
      await offlineStorage.setSetting('fcm_token', token)
      
      console.log('Push notifications enabled')
      return token
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
      throw error
    }
  }

  // Disable push notifications
  async disable() {
    try {
      await firebaseService.unsubscribeFromPush()
      
      this.isEnabled = false
      this.subscription = null
      
      // Save preference
      await offlineStorage.setSetting('push_notifications_enabled', false)
      await offlineStorage.setSetting('fcm_token', null)
      
      console.log('Push notifications disabled')
    } catch (error) {
      console.error('Failed to disable push notifications:', error)
      throw error
    }
  }

  // Check if notifications are enabled
  async isNotificationEnabled() {
    const enabled = await offlineStorage.getSetting('push_notifications_enabled')
    return enabled === true
  }

  // Get notification preferences
  async getNotificationPreferences() {
    const preferences = await offlineStorage.getSetting('notification_preferences')
    return preferences || {
      reservations: true,
      roomStatus: true,
      guestMessages: true,
      payments: true,
      maintenance: true,
      alerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      sound: true,
      vibration: true
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    await offlineStorage.setSetting('notification_preferences', preferences)
    
    // Send preferences to server
    try {
      await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(preferences)
      })
    } catch (error) {
      console.error('Failed to sync notification preferences:', error)
    }
  }

  // Check if notifications should be shown (quiet hours, etc.)
  async shouldShowNotification(type) {
    const preferences = await this.getNotificationPreferences()
    
    // Check if this type is enabled
    if (!preferences[type]) {
      return false
    }
    
    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      
      const startTime = this.parseTime(preferences.quietHours.start)
      const endTime = this.parseTime(preferences.quietHours.end)
      
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) {
          return false
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false
        }
      }
    }
    
    return true
  }

  // Parse time string (HH:MM) to minutes
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Send notification to server
  async sendNotification(notification) {
    try {
      const response = await fetch('/api/push-notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(notification)
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  // Queue notification for offline sending
  async queueNotification(notification) {
    this.notificationQueue.push({
      ...notification,
      timestamp: new Date().toISOString()
    })
    
    // Store in offline storage
    await offlineStorage.addToSyncQueue('notification_send', notification)
  }

  // Process notification queue when online
  async processNotificationQueue() {
    if (!navigator.onLine || this.notificationQueue.length === 0) {
      return
    }

    const queue = [...this.notificationQueue]
    this.notificationQueue = []

    for (const notification of queue) {
      try {
        await this.sendNotification(notification)
      } catch (error) {
        console.error('Failed to send queued notification:', error)
        // Re-queue failed notifications
        this.notificationQueue.push(notification)
      }
    }
  }

  // Create notification templates
  createReservationNotification(reservation, type = 'new') {
    const templates = {
      new: {
        title: 'New Reservation',
        body: `New booking for ${reservation.guest_name} - Room ${reservation.room_number}`,
        data: {
          type: 'reservation',
          reservationId: reservation.id,
          action: 'view'
        }
      },
      checkin: {
        title: 'Check-in Reminder',
        body: `${reservation.guest_name} is checking in today - Room ${reservation.room_number}`,
        data: {
          type: 'reservation',
          reservationId: reservation.id,
          action: 'checkin'
        }
      },
      checkout: {
        title: 'Check-out Reminder',
        body: `${reservation.guest_name} is checking out today - Room ${reservation.room_number}`,
        data: {
          type: 'reservation',
          reservationId: reservation.id,
          action: 'checkout'
        }
      },
      cancelled: {
        title: 'Reservation Cancelled',
        body: `Booking cancelled for ${reservation.guest_name} - Room ${reservation.room_number}`,
        data: {
          type: 'reservation',
          reservationId: reservation.id,
          action: 'view'
        }
      }
    }

    return templates[type] || templates.new
  }

  createRoomStatusNotification(room, status) {
    const statusMessages = {
      maintenance: `Room ${room.room_number} requires maintenance`,
      cleaning: `Room ${room.room_number} is ready for cleaning`,
      ready: `Room ${room.room_number} is ready for guests`,
      occupied: `Room ${room.room_number} is now occupied`,
      out_of_order: `Room ${room.room_number} is out of order`
    }

    return {
      title: 'Room Status Update',
      body: statusMessages[status] || `Room ${room.room_number} status changed to ${status}`,
      data: {
        type: 'room_status',
        roomId: room.id,
        status: status
      }
    }
  }

  createPaymentNotification(payment, type = 'received') {
    const templates = {
      received: {
        title: 'Payment Received',
        body: `Payment of ${payment.amount} ${payment.currency} received from ${payment.guest_name}`,
        data: {
          type: 'payment',
          paymentId: payment.id,
          action: 'view'
        }
      },
      failed: {
        title: 'Payment Failed',
        body: `Payment of ${payment.amount} ${payment.currency} failed for ${payment.guest_name}`,
        data: {
          type: 'payment',
          paymentId: payment.id,
          action: 'retry'
        }
      },
      refund: {
        title: 'Refund Processed',
        body: `Refund of ${payment.amount} ${payment.currency} processed for ${payment.guest_name}`,
        data: {
          type: 'payment',
          paymentId: payment.id,
          action: 'view'
        }
      }
    }

    return templates[type] || templates.received
  }

  createMaintenanceNotification(maintenance) {
    return {
      title: 'Maintenance Alert',
      body: `${maintenance.title} - ${maintenance.priority} priority`,
      data: {
        type: 'maintenance',
        maintenanceId: maintenance.id,
        priority: maintenance.priority
      }
    }
  }

  createGuestMessageNotification(message) {
    return {
      title: 'New Guest Message',
      body: `Message from ${message.guest_name}: ${message.message.substring(0, 50)}...`,
      data: {
        type: 'guest_message',
        messageId: message.id,
        guestId: message.guest_id
      }
    }
  }

  // Send specific notification types
  async sendReservationNotification(reservation, type = 'new') {
    const shouldShow = await this.shouldShowNotification('reservations')
    if (!shouldShow) return

    const notification = this.createReservationNotification(reservation, type)
    
    if (navigator.onLine) {
      return await this.sendNotification(notification)
    } else {
      await this.queueNotification(notification)
    }
  }

  async sendRoomStatusNotification(room, status) {
    const shouldShow = await this.shouldShowNotification('roomStatus')
    if (!shouldShow) return

    const notification = this.createRoomStatusNotification(room, status)
    
    if (navigator.onLine) {
      return await this.sendNotification(notification)
    } else {
      await this.queueNotification(notification)
    }
  }

  async sendPaymentNotification(payment, type = 'received') {
    const shouldShow = await this.shouldShowNotification('payments')
    if (!shouldShow) return

    const notification = this.createPaymentNotification(payment, type)
    
    if (navigator.onLine) {
      return await this.sendNotification(notification)
    } else {
      await this.queueNotification(notification)
    }
  }

  async sendMaintenanceNotification(maintenance) {
    const shouldShow = await this.shouldShowNotification('maintenance')
    if (!shouldShow) return

    const notification = this.createMaintenanceNotification(maintenance)
    
    if (navigator.onLine) {
      return await this.sendNotification(notification)
    } else {
      await this.queueNotification(notification)
    }
  }

  async sendGuestMessageNotification(message) {
    const shouldShow = await this.shouldShowNotification('guestMessages')
    if (!shouldShow) return

    const notification = this.createGuestMessageNotification(message)
    
    if (navigator.onLine) {
      return await this.sendNotification(notification)
    } else {
      await this.queueNotification(notification)
    }
  }

  // Test notification
  async testNotification() {
    return await firebaseService.testNotification()
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await fetch('/api/push-notifications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get notification stats:', error)
    }

    return {
      sent: 0,
      delivered: 0,
      clicked: 0,
      failed: 0
    }
  }
}

export const pushNotificationService = new PushNotificationService()
export default pushNotificationService