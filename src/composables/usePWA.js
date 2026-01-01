import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

export function usePWA() {
  const $q = useQuasar()
  const isOnline = ref(navigator.onLine)
  const isInstallable = ref(false)
  const deferredPrompt = ref(null)
  const isInstalled = ref(false)

  // Check if app is installed
  const checkInstallStatus = () => {
    // Check if running in standalone mode (installed PWA)
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://')
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
    } else if (!isOnline.value) {
      $q.notify({
        message: 'You are offline',
        color: 'warning',
        icon: 'wifi_off',
        timeout: 5000
      })
    }
  }

  // Handle PWA install prompt
  const handleBeforeInstallPrompt = (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt.value = e
    isInstallable.value = true
  }

  // Install PWA
  const installPWA = async () => {
    if (!deferredPrompt.value) {
      $q.notify({
        message: 'App is already installed or not installable',
        color: 'info',
        icon: 'info',
        timeout: 3000
      })
      return
    }

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
    } else {
      $q.notify({
        message: 'App installation cancelled',
        color: 'info',
        icon: 'cancel',
        timeout: 3000
      })
    }
    
    // Clear the deferredPrompt
    deferredPrompt.value = null
    isInstallable.value = false
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
  }

  // Check for app updates
  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        registration.update()
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
        saveData: connection.saveData
      }
    }
    return null
  }

  // Show install banner
  const showInstallBanner = () => {
    if (isInstallable.value && !isInstalled.value) {
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
            color: 'white'
          }
        ]
      })
    }
  }

  onMounted(() => {
    checkInstallStatus()
    
    // Add event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Show install banner after a delay if not installed
    setTimeout(() => {
      if (!isInstalled.value) {
        showInstallBanner()
      }
    }, 10000) // Show after 10 seconds
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  return {
    isOnline,
    isInstallable,
    isInstalled,
    installPWA,
    checkForUpdates,
    getNetworkInfo,
    showInstallBanner
  }
}