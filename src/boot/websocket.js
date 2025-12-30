import { boot } from 'quasar/wrappers'
import Pusher from 'pusher-js'
import { useWebSocketStore } from 'src/stores/websocket'

export default boot(({ app }) => {
  // Configure Pusher
  const pusher = new Pusher(process.env.VITE_PUSHER_APP_KEY, {
    cluster: process.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: process.env.VITE_PUSHER_HOST,
    wsPort: process.env.VITE_PUSHER_PORT,
    wssPort: process.env.VITE_PUSHER_PORT,
    forceTLS: process.env.VITE_PUSHER_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    }
  })

  // Initialize WebSocket store
  const webSocketStore = useWebSocketStore()
  webSocketStore.initialize(pusher)

  // Make pusher available globally
  app.config.globalProperties.$pusher = pusher
  app.provide('pusher', pusher)
})