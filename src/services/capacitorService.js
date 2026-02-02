import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

class CapacitorService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform()
    this.platform = Capacitor.getPlatform()
    this.deviceInfo = null
    this.networkStatus = null
  }

  // Initialize Capacitor services
  async initialize() {
    if (!this.isNative) {
      console.log('Running in web mode - Capacitor features limited')
      return
    }

    try {
      // Get device info
      this.deviceInfo = await Device.getInfo()
      
      // Get network status
      this.networkStatus = await Network.getStatus()
      
      // Setup app listeners
      this.setupAppListeners()
      
      // Setup network listeners
      this.setupNetworkListeners()
      
      // Setup keyboard listeners
      this.setupKeyboardListeners()
      
      // Initialize status bar
      await this.initializeStatusBar()
      
      // Hide splash screen
      await SplashScreen.hide()
      
      console.log('Capacitor services initialized')
    } catch (error) {
      console.error('Failed to initialize Capacitor services:', error)
    }
  }

  // Setup app event listeners
  setupAppListeners() {
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive)
      
      // Handle app becoming active/inactive
      if (isActive) {
        this.onAppActive()
      } else {
        this.onAppInactive()
      }
    })

    App.addListener('appUrlOpen', (event) => {
      console.log('App opened with URL:', event.url)
      this.handleDeepLink(event.url)
    })

    App.addListener('backButton', ({ canGoBack }) => {
      console.log('Back button pressed, can go back:', canGoBack)
      
      if (canGoBack) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })
  }

  // Setup network listeners
  setupNetworkListeners() {
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status)
      this.networkStatus = status
      
      // Emit custom event for app to handle
      window.dispatchEvent(new CustomEvent('networkStatusChange', {
        detail: status
      }))
    })
  }

  // Setup keyboard listeners
  setupKeyboardListeners() {
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('Keyboard will show with height:', info.keyboardHeight)
      document.body.classList.add('keyboard-open')
    })

    Keyboard.addListener('keyboardDidShow', (info) => {
      console.log('Keyboard did show with height:', info.keyboardHeight)
    })

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide')
      document.body.classList.remove('keyboard-open')
    })

    Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard did hide')
    })
  }

  // Initialize status bar
  async initializeStatusBar() {
    if (this.platform === 'ios' || this.platform === 'android') {
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#c45865' })
    }
  }

  // Handle app becoming active
  onAppActive() {
    // Refresh data, check for updates, etc.
    window.dispatchEvent(new CustomEvent('appActive'))
  }

  // Handle app becoming inactive
  onAppInactive() {
    // Save state, pause operations, etc.
    window.dispatchEvent(new CustomEvent('appInactive'))
  }

  // Handle deep links
  handleDeepLink(url) {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      const params = Object.fromEntries(urlObj.searchParams)
      
      // Navigate to the appropriate route
      const router = this.$router
      if (router) {
        router.push({ path, query: params })
      }
      
      // Emit event for custom handling
      window.dispatchEvent(new CustomEvent('deepLink', {
        detail: { url, path, params }
      }))
    } catch (error) {
      console.error('Failed to handle deep link:', error)
    }
  }

  // Camera functions
  async takePhoto(options = {}) {
    if (!this.isNative) {
      throw new Error('Camera not available in web mode')
    }

    try {
      const defaultOptions = {
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      }

      const image = await Camera.getPhoto({
        ...defaultOptions,
        ...options
      })

      return {
        dataUrl: image.dataUrl,
        webPath: image.webPath,
        format: image.format
      }
    } catch (error) {
      console.error('Failed to take photo:', error)
      throw error
    }
  }

  async selectFromGallery(options = {}) {
    if (!this.isNative) {
      throw new Error('Gallery not available in web mode')
    }

    try {
      const defaultOptions = {
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      }

      const image = await Camera.getPhoto({
        ...defaultOptions,
        ...options
      })

      return {
        dataUrl: image.dataUrl,
        webPath: image.webPath,
        format: image.format
      }
    } catch (error) {
      console.error('Failed to select from gallery:', error)
      throw error
    }
  }

  // Geolocation functions
  async getCurrentPosition(options = {}) {
    try {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000
      }

      const coordinates = await Geolocation.getCurrentPosition({
        ...defaultOptions,
        ...options
      })

      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        altitude: coordinates.coords.altitude,
        heading: coordinates.coords.heading,
        speed: coordinates.coords.speed,
        timestamp: coordinates.timestamp
      }
    } catch (error) {
      console.error('Failed to get current position:', error)
      throw error
    }
  }

  async watchPosition(callback, options = {}) {
    try {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000
      }

      const watchId = await Geolocation.watchPosition({
        ...defaultOptions,
        ...options
      }, callback)

      return watchId
    } catch (error) {
      console.error('Failed to watch position:', error)
      throw error
    }
  }

  async clearWatch(watchId) {
    try {
      await Geolocation.clearWatch({ id: watchId })
    } catch (error) {
      console.error('Failed to clear watch:', error)
    }
  }

  // Haptics functions
  async vibrate(type = 'medium') {
    if (!this.isNative) return

    try {
      const impactStyles = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }

      await Haptics.impact({ style: impactStyles[type] || ImpactStyle.Medium })
    } catch (error) {
      console.error('Failed to vibrate:', error)
    }
  }

  async vibrateNotification() {
    if (!this.isNative) return

    try {
      await Haptics.notification({ type: 'SUCCESS' })
    } catch (error) {
      console.error('Failed to vibrate notification:', error)
    }
  }

  // Push notification functions
  async initializePushNotifications() {
    if (!this.isNative) return

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions()
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }
      
      if (permStatus.receive !== 'granted') {
        throw new Error('Push notification permission denied')
      }

      // Register for push notifications
      await PushNotifications.register()

      // Setup listeners
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value)
        this.onPushRegistration(token.value)
      })

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error)
      })

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification)
        this.onPushNotificationReceived(notification)
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification)
        this.onPushNotificationActionPerformed(notification)
      })

    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      throw error
    }
  }

  onPushRegistration(token) {
    // Send token to server
    window.dispatchEvent(new CustomEvent('pushRegistration', {
      detail: { token }
    }))
  }

  onPushNotificationReceived(notification) {
    // Handle foreground notification
    window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
      detail: notification
    }))
  }

  onPushNotificationActionPerformed(notification) {
    // Handle notification tap
    window.dispatchEvent(new CustomEvent('pushNotificationActionPerformed', {
      detail: notification
    }))
  }

  // Local notification functions
  async scheduleLocalNotification(notification) {
    if (!this.isNative) return

    try {
      await LocalNotifications.schedule({
        notifications: [notification]
      })
    } catch (error) {
      console.error('Failed to schedule local notification:', error)
      throw error
    }
  }

  async cancelLocalNotifications(ids) {
    if (!this.isNative) return

    try {
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) })
    } catch (error) {
      console.error('Failed to cancel local notifications:', error)
    }
  }

  // File system functions
  async writeFile(path, data, options = {}) {
    if (!this.isNative) {
      throw new Error('File system not available in web mode')
    }

    try {
      const defaultOptions = {
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      }

      await Filesystem.writeFile({
        path,
        data,
        ...defaultOptions,
        ...options
      })
    } catch (error) {
      console.error('Failed to write file:', error)
      throw error
    }
  }

  async readFile(path, options = {}) {
    if (!this.isNative) {
      throw new Error('File system not available in web mode')
    }

    try {
      const defaultOptions = {
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      }

      const result = await Filesystem.readFile({
        path,
        ...defaultOptions,
        ...options
      })

      return result.data
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  }

  async deleteFile(path, options = {}) {
    if (!this.isNative) {
      throw new Error('File system not available in web mode')
    }

    try {
      const defaultOptions = {
        directory: Directory.Documents
      }

      await Filesystem.deleteFile({
        path,
        ...defaultOptions,
        ...options
      })
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }

  // Utility functions
  isNativePlatform() {
    return this.isNative
  }

  getPlatform() {
    return this.platform
  }

  getDeviceInfo() {
    return this.deviceInfo
  }

  getNetworkStatus() {
    return this.networkStatus
  }

  async getAppInfo() {
    try {
      return await App.getInfo()
    } catch (error) {
      console.error('Failed to get app info:', error)
      return null
    }
  }

  async exitApp() {
    if (this.isNative) {
      await App.exitApp()
    }
  }

  // Set router instance for navigation
  setRouterInstance(router) {
    this.$router = router
  }
}

export const capacitorService = new CapacitorService()
export default capacitorService