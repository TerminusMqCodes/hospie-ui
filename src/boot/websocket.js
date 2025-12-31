import { boot } from 'quasar/wrappers'
import Pusher from 'pusher-js'
import { useWebSocketStore } from 'src/stores/websocket'

export default boot(({ app }) => {
  // Check if Pusher configuration is available
  const pusherAppKey = process.env.VITE_PUSHER_APP_KEY
  const pusherCluster = process.env.VITE_PUSHER_APP_CLUSTER || 'mt1'
  const pusherHost = process.env.VITE_PUSHER_HOST || 'localhost'
  const pusherPort = process.env.VITE_PUSHER_PORT || '6001'
  const pusherScheme = process.env.VITE_PUSHER_SCHEME || 'http'

  // Only initialize Pusher if we have a valid app key
  if (!pusherAppKey || pusherAppKey === 'your-pusher-app-key-here') {
    console.warn('[WebSocket] Pusher app key not configured. WebSocket features will be disabled.')
    
    // Initialize WebSocket store with null pusher (disabled state)
    const webSocketStore = useWebSocketStore()
    webSocketStore.initialize(null)
    
    // Provide a mock pusher object to prevent errors
    const mockPusher = {
      subscribe: () => ({
        bind: () => {},
        unbind: () => {}
      }),
      unsubscribe: () => {},
      disconnect: () => {}
    }
    
    app.config.globalProperties.$pusher = mockPusher
    app.provide('pusher', mockPusher)
    return
  }

  try {
    // Configure Pusher with proper error handling
    const pusher = new Pusher(pusherAppKey, {
      cluster: pusherCluster,
      wsHost: pusherHost,
      wsPort: parseInt(pusherPort),
      wssPort: parseInt(pusherPort),
      forceTLS: pusherScheme === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      }
    })

    // Handle connection events
    pusher.connection.bind('connected', () => {
      console.log('[WebSocket] Connected to Pusher')
    })

    pusher.connection.bind('error', (error) => {
      console.warn('[WebSocket] Pusher connection error:', error)
    })

    pusher.connection.bind('disconnected', () => {
      console.log('[WebSocket] Disconnected from Pusher')
    })

    // Initialize WebSocket store
    const webSocketStore = useWebSocketStore()
    webSocketStore.initialize(pusher)

    // Make pusher available globally
    app.config.globalProperties.$pusher = pusher
    app.provide('pusher', pusher)

    console.log('[WebSocket] Pusher initialized successfully')
  } catch (error) {
    console.error('[WebSocket] Failed to initialize Pusher:', error)
    
    // Initialize WebSocket store with null pusher (disabled state)
    const webSocketStore = useWebSocketStore()
    webSocketStore.initialize(null)
    
    // Provide a mock pusher object to prevent errors
    const mockPusher = {
      subscribe: () => ({
        bind: () => {},
        unbind: () => {}
      }),
      unsubscribe: () => {},
      disconnect: () => {}
    }
    
    app.config.globalProperties.$pusher = mockPusher
    app.provide('pusher', mockPusher)
  }
})