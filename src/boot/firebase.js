import { boot } from 'quasar/wrappers'
import firebaseService from '../services/firebaseService'
import pushNotificationService from '../services/pushNotificationService'
import backgroundSyncService from '../services/backgroundSyncService'
import capacitorService from '../services/capacitorService'

export default boot(async ({ app, router }) => {
  try {
    // Set router instances
    firebaseService.setRouterInstance(router)
    capacitorService.setRouterInstance(router)
    
    // Set Quasar instance for notifications
    firebaseService.setQuasarInstance(app.config.globalProperties.$q)
    
    // Initialize Capacitor services first (native platform detection)
    await capacitorService.initialize()
    
    // Initialize Firebase services
    await firebaseService.initialize()
    await pushNotificationService.initialize()
    await backgroundSyncService.initialize()
    
    // Initialize native push notifications if on mobile
    if (capacitorService.isNativePlatform()) {
      await capacitorService.initializePushNotifications()
    }
    
    // Make services available globally
    app.config.globalProperties.$firebase = firebaseService
    app.config.globalProperties.$pushNotifications = pushNotificationService
    app.config.globalProperties.$backgroundSync = backgroundSyncService
    app.config.globalProperties.$capacitor = capacitorService
    
    console.log('Firebase, PWA, and Capacitor services initialized')
  } catch (error) {
    console.error('Failed to initialize services:', error)
  }
})