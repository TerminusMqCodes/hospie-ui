import { inject, onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from 'src/stores/websocket'

export function useWebSocket() {
  const webSocketStore = useWebSocketStore()
  const pusher = inject('pusher', null) // Make it optional

  return {
    // Store state
    isConnected: webSocketStore.isConnected,
    connectionState: webSocketStore.connectionState,
    isReady: webSocketStore.isReady,
    channelCount: webSocketStore.channelCount,
    lastError: webSocketStore.lastError,

    // Store actions
    subscribeToChannel: webSocketStore.subscribeToChannel,
    unsubscribeFromChannel: webSocketStore.unsubscribeFromChannel,
    subscribeToRoomUpdates: webSocketStore.subscribeToRoomUpdates,
    subscribeToReservationUpdates: webSocketStore.subscribeToReservationUpdates,
    subscribeToStaffChannel: webSocketStore.subscribeToStaffChannel,
    disconnect: webSocketStore.disconnect,
    reconnect: webSocketStore.reconnect,
    getConnectionInfo: webSocketStore.getConnectionInfo,

    // Direct pusher access
    pusher
  }
}

export function useRoomUpdates(callback) {
  const { subscribeToRoomUpdates, unsubscribeFromChannel } = useWebSocket()
  let channel = null

  onMounted(() => {
    channel = subscribeToRoomUpdates(callback)
  })

  onUnmounted(() => {
    if (channel) {
      unsubscribeFromChannel('rooms')
    }
  })

  return {
    channel
  }
}

export function useReservationUpdates(callback) {
  const { subscribeToReservationUpdates, unsubscribeFromChannel } = useWebSocket()
  let channel = null

  onMounted(() => {
    channel = subscribeToReservationUpdates(callback)
  })

  onUnmounted(() => {
    if (channel) {
      unsubscribeFromChannel('reservations')
    }
  })

  return {
    channel
  }
}

export function useStaffUpdates(department, callback) {
  const { subscribeToStaffChannel, unsubscribeFromChannel } = useWebSocket()
  let channel = null

  onMounted(() => {
    channel = subscribeToStaffChannel(department, callback)
  })

  onUnmounted(() => {
    if (channel) {
      unsubscribeFromChannel(`private-staff.${department}`)
    }
  })

  return {
    channel
  }
}