import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const pusher = ref(null)
  const isConnected = ref(false)
  const connectionState = ref('disconnected')
  const subscribedChannels = ref(new Map())
  const lastError = ref(null)
  const connectionInfo = ref({})

  // Getters
  const isReady = computed(() => isConnected.value && pusher.value)
  const channelCount = computed(() => subscribedChannels.value.size)

  // Actions
  function initialize(pusherInstance) {
    pusher.value = pusherInstance
    setupConnectionHandlers()
  }

  function setupConnectionHandlers() {
    if (!pusher.value) return

    pusher.value.connection.bind('connected', () => {
      isConnected.value = true
      connectionState.value = 'connected'
      lastError.value = null
      console.log('WebSocket connected')
    })

    pusher.value.connection.bind('disconnected', () => {
      isConnected.value = false
      connectionState.value = 'disconnected'
      console.log('WebSocket disconnected')
    })

    pusher.value.connection.bind('error', (error) => {
      lastError.value = error
      connectionState.value = 'error'
      console.error('WebSocket error:', error)
      
      Notify.create({
        type: 'negative',
        message: 'WebSocket connection error',
        caption: error.error?.message || 'Connection failed'
      })
    })

    pusher.value.connection.bind('state_change', (states) => {
      connectionState.value = states.current
      console.log('WebSocket state changed:', states.previous, '->', states.current)
    })
  }

  function subscribeToChannel(channelName, callbacks = {}) {
    if (!pusher.value) {
      console.error('Pusher not initialized')
      return null
    }

    // Check if already subscribed
    if (subscribedChannels.value.has(channelName)) {
      return subscribedChannels.value.get(channelName)
    }

    const channel = pusher.value.subscribe(channelName)
    subscribedChannels.value.set(channelName, channel)

    // Bind callbacks
    Object.entries(callbacks).forEach(([event, callback]) => {
      channel.bind(event, callback)
    })

    console.log(`Subscribed to channel: ${channelName}`)
    return channel
  }

  function unsubscribeFromChannel(channelName) {
    if (!pusher.value) return

    const channel = subscribedChannels.value.get(channelName)
    if (channel) {
      pusher.value.unsubscribe(channelName)
      subscribedChannels.value.delete(channelName)
      console.log(`Unsubscribed from channel: ${channelName}`)
    }
  }

  function subscribeToRoomUpdates(callback) {
    return subscribeToChannel('rooms', {
      'room.status.changed': (data) => {
        console.log('Room status changed:', data)
        callback(data)
        
        // Show notification for important status changes
        if (data.new_status === 'out_of_order') {
          Notify.create({
            type: 'warning',
            message: `Room ${data.room_number} is out of order`,
            caption: data.reason || 'No reason provided'
          })
        }
      }
    })
  }

  function subscribeToReservationUpdates(callback) {
    return subscribeToChannel('reservations', {
      'reservation.created': (data) => {
        console.log('Reservation created:', data)
        callback('created', data)
        
        Notify.create({
          type: 'positive',
          message: 'New reservation created',
          caption: `${data.guest_name} - Room ${data.room_number}`
        })
      },
      'reservation.cancelled': (data) => {
        console.log('Reservation cancelled:', data)
        callback('cancelled', data)
        
        Notify.create({
          type: 'info',
          message: 'Reservation cancelled',
          caption: `${data.guest_name} - ${data.confirmation_number}`
        })
      },
      'reservation.updated': (data) => {
        console.log('Reservation updated:', data)
        callback('updated', data)
      }
    })
  }

  function subscribeToStaffChannel(department, callback) {
    const channelName = `private-staff.${department}`
    return subscribeToChannel(channelName, {
      'room.status.changed': (data) => {
        callback('room_status', data)
      },
      'housekeeping.task.assigned': (data) => {
        callback('task_assigned', data)
        
        Notify.create({
          type: 'info',
          message: 'New housekeeping task assigned',
          caption: `Room ${data.room_number}`
        })
      },
      'maintenance.scheduled': (data) => {
        callback('maintenance_scheduled', data)
      }
    })
  }

  function disconnect() {
    if (pusher.value) {
      // Unsubscribe from all channels
      subscribedChannels.value.forEach((channel, channelName) => {
        pusher.value.unsubscribe(channelName)
      })
      subscribedChannels.value.clear()
      
      pusher.value.disconnect()
      isConnected.value = false
      connectionState.value = 'disconnected'
    }
  }

  function reconnect() {
    if (pusher.value) {
      pusher.value.connect()
    }
  }

  function getConnectionInfo() {
    if (!pusher.value) return {}
    
    return {
      state: connectionState.value,
      socket_id: pusher.value.connection.socket_id,
      activity_timeout: pusher.value.connection.activity_timeout,
      channels: Array.from(subscribedChannels.value.keys())
    }
  }

  return {
    // State
    pusher,
    isConnected,
    connectionState,
    subscribedChannels,
    lastError,
    connectionInfo,
    
    // Getters
    isReady,
    channelCount,
    
    // Actions
    initialize,
    subscribeToChannel,
    unsubscribeFromChannel,
    subscribeToRoomUpdates,
    subscribeToReservationUpdates,
    subscribeToStaffChannel,
    disconnect,
    reconnect,
    getConnectionInfo
  }
})