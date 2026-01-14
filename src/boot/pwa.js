import { boot } from 'quasar/wrappers'

export default boot(async ({ app }) => {
  // PWA features with usePWA composable
  try {
    // Try to initialize offline store
    const { useOfflineStore } = await import('../stores/offline')
    const offlineStore = useOfflineStore()
    await offlineStore.initialize()
    app.config.globalProperties.$offline = offlineStore
    console.log('Offline store initialized')
  } catch (error) {
    console.log('Offline store not available:', error.message)
  }
  
  // Setup basic PWA event listeners
  if ('serviceWorker' in navigator) {
    window.addEventListener('beforeinstallprompt', () => {
      console.log('PWA install prompt available')
      // The usePWA composable will handle this in components
    })
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully')
    })
  }
  
  console.log('PWA boot completed')
})