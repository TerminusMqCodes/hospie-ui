import { boot } from 'quasar/wrappers'
import { usePWA } from '../composables/usePWA'
import { useOfflineStore } from '../stores/offline'

export default boot(async ({ app }) => {
  // Initialize PWA composable
  const pwa = usePWA()
  
  // Initialize offline store
  const offlineStore = useOfflineStore()
  await offlineStore.initialize()
  
  // Make PWA utilities available globally
  app.config.globalProperties.$pwa = pwa
  app.config.globalProperties.$offline = offlineStore
  
  // Setup global PWA event listeners
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available')
  })
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully')
  })
  
  console.log('PWA boot completed')
})