import { boot } from 'quasar/wrappers'

export default boot(async ({ app, router }) => {
  // Firebase and Capacitor services
  try {
    // Dynamically import services
    const [
      { default: firebaseService },
      { default: capacitorService }
    ] = await Promise.all([
      import('../services/firebaseService.js'),
      import('../services/capacitorService.js')
    ])

    // Initialize Capacitor first
    await capacitorService.initialize()
    capacitorService.setRouterInstance(router)

    // Initialize Firebase
    await firebaseService.initialize()
    firebaseService.setQuasarInstance(app.config.globalProperties.$q)
    firebaseService.setRouterInstance(router)

    // Make services available globally
    app.config.globalProperties.$firebase = firebaseService
    app.config.globalProperties.$capacitor = capacitorService

    console.log('Firebase and Capacitor services initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Firebase/Capacitor:', error)
    
    // Create placeholder services
    app.config.globalProperties.$firebase = {
      isInitialized: false,
      isNotificationSupported: () => false
    }
    
    app.config.globalProperties.$capacitor = {
      isNative: false,
      platform: 'web',
      isNativePlatform: () => false,
      getPlatform: () => 'web'
    }
  }
  
  // Try to initialize background sync if available
  try {
    const backgroundSyncService = await import('../services/backgroundSyncService')
    await backgroundSyncService.default.initialize()
    app.config.globalProperties.$backgroundSync = backgroundSyncService.default
    console.log('Background sync service initialized')
  } catch (error) {
    console.log('Background sync not available:', error.message)
  }
})