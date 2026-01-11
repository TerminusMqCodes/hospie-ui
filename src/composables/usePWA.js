import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { Capacitor } from '@capacitor/core'

export function usePWA() {
  const $q = useQuasar()
  const isOnline = ref(navigator.onLine)
  const isInstallable = ref(false)
  const deferredPrompt = ref(null)
  const isInstalled = ref(false)
  const isNative = ref(Capacitor.isNativePlatform())
  const platform = ref(Capacitor.getPlatform())

  // Check if app is installed
  const checkInstallStatus = () => {
    // Check if running in standalone mode (installed PWA)
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://') ||
                       isNative.value
  }

  // Handle online/offline status
  const updateOnlineStatus = () => {
    const wasOffline = !isOnline.value
    isOnline.value = navigator.onLine
    
    if (isOnline.value && wasOffline) {
      $q.notify({
        message: 'Connection restored!',
        color: 'positive',
        icon: 'wifi',
        timeout: 3000
      })
      
      // Emit custom event for other components
      window.dispatchEvent(new CustomEvent('connectionRestored'))
    } else if (!isOnline.value) {
      $q.notify({
        message: 'You are offline',
        color: 'warning',
        icon: 'wifi_off',
        timeout: 5000
      })
      
      // Emit custom event for other components
      window.dispatchEvent(new CustomEvent('connectionLost'))
    }
  }

  // Handle PWA install prompt
  const handleBeforeInstallPrompt = (e) => {
    // Don't show on native platforms
    if (isNative.value) return
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt.value = e
    isInstallable.value = true
    
    console.log('PWA install prompt available')
  }

  // Install PWA
  const installPWA = async () => {
    if (isNative.value) {
      $q.notify({
        message: 'App is already installed as a native app',
        color: 'info',
        icon: 'info',
        timeout: 3000
      })
      return
    }

    if (!deferredPrompt.value) {
      $q.notify({
        message: 'App is already installed or not installable',
        color: 'info',
        icon: 'info',
        timeout: 3000
      })
      return
    }

    try {
      // Show the install prompt
      deferredPrompt.value.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        $q.notify({
          message: 'App installed successfully!',
          color: 'positive',
          icon: 'download_done',
          timeout: 3000
        })
        
        // Track installation
        trackPWAInstall('accepted')
      } else {
        $q.notify({
          message: 'App installation cancelled',
          color: 'info',
          icon: 'cancel',
          timeout: 3000
        })
        
        // Track cancellation
        trackPWAInstall('cancelled')
      }
      
      // Clear the deferredPrompt
      deferredPrompt.value = null
      isInstallable.value = false
    } catch (error) {
      console.error('PWA installation failed:', error)
      
      $q.notify({
        message: 'Installation failed. Please try again.',
        color: 'negative',
        icon: 'error',
        timeout: 5000
      })
    }
  }

  // Handle app installed event
  const handleAppInstalled = () => {
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
    
    $q.notify({
      message: 'Hospie PMS installed successfully!',
      color: 'positive',
      icon: 'check_circle',
      timeout: 5000
    })
    
    // Track successful installation
    trackPWAInstall('installed')
  }

  // Track PWA installation events
  const trackPWAInstall = (action) => {
    try {
      // Send analytics event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: action,
          value: 1
        })
      }
      
      // Send to backend
      fetch('/api/analytics/pwa-install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          platform: platform.value,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error)
    } catch (error) {
      console.error('Failed to track PWA install:', error)
    }
  }

  // Check for app updates
  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          console.log('Checked for service worker updates')
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }

  // Get network information
  const getNetworkInfo = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        type: connection.type
      }
    }
    return null
  }

  // Get device capabilities
  const getDeviceCapabilities = () => {
    return {
      isNative: isNative.value,
      platform: platform.value,
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasNotifications: 'Notification' in window,
      hasPushManager: 'serviceWorker' in navigator && 'PushManager' in window,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      hasWebShare: 'share' in navigator,
      hasClipboard: 'clipboard' in navigator,
      hasVibration: 'vibrate' in navigator,
      hasDeviceMotion: 'DeviceMotionEvent' in window,
      hasDeviceOrientation: 'DeviceOrientationEvent' in window,
      hasWakeLock: 'wakeLock' in navigator,
      hasFileSystemAccess: 'showOpenFilePicker' in window
    }
  }

  // Show install banner
  const showInstallBanner = () => {
    if (isInstallable.value && !isInstalled.value && !isNative.value) {
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (dismissed) {
        const dismissedTime = parseInt(dismissed)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        
        if (Date.now() - dismissedTime < sevenDays) {
          return // Still within dismissal period
        }
      }

      $q.notify({
        message: 'Install Hospie PMS for a better experience',
        color: 'primary',
        icon: 'get_app',
        timeout: 0,
        actions: [
          {
            label: 'Install',
            color: 'white',
            handler: installPWA
          },
          {
            label: 'Later',
            color: 'white',
            handler: () => {
              localStorage.setItem('pwa_install_dismissed', Date.now().toString())
            }
          }
        ]
      })
    }
  }

  // Share content using Web Share API
  const shareContent = async (shareData) => {
    if ('share' in navigator) {
      try {
        await navigator.share(shareData)
        return true
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Web Share failed:', error)
        }
        return false
      }
    }
    return false
  }

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        console.error('Clipboard write failed:', error)
        return false
      }
    }
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (error) {
      console.error('Fallback copy failed:', error)
      return false
    }
  }

  // Vibrate device
  const vibrate = (pattern = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Keep screen awake
  const keepScreenAwake = async () => {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen')
        return wakeLock
      } catch (error) {
        console.error('Wake lock failed:', error)
        return null
      }
    }
    return null
  }

  // Handle visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('App went to background')
      window.dispatchEvent(new CustomEvent('appBackground'))
    } else {
      console.log('App came to foreground')
      window.dispatchEvent(new CustomEvent('appForeground'))
      
      // Check for updates when app comes back to foreground
      checkForUpdates()
    }
  }

  onMounted(() => {
    checkInstallStatus()
    
    // Add event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Show install banner after a delay if not installed
    setTimeout(() => {
      if (!isInstalled.value && !isNative.value) {
        showInstallBanner()
      }
    }, 10000) // Show after 10 seconds
    
    // Periodic update check (every 30 minutes)
    setInterval(checkForUpdates, 30 * 60 * 1000)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    // State
    isOnline,
    isInstallable,
    isInstalled,
    isNative,
    platform,
    
    // Actions
    installPWA,
    checkForUpdates,
    showInstallBanner,
    shareContent,
    copyToClipboard,
    vibrate,
    keepScreenAwake,
    
    // Getters
    getNetworkInfo,
    getDeviceCapabilities
  }
}