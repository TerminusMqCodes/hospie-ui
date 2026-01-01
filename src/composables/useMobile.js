import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Mobile-specific composable for enhanced mobile functionality
 * Provides mobile detection, touch handling, and mobile-optimized features
 */
export function useMobile() {
  const $q = useQuasar()
  
  // Reactive state
  const isTouchDevice = ref(false)
  const orientation = ref('portrait')
  const viewportHeight = ref(window.innerHeight)
  const isKeyboardOpen = ref(false)
  const lastTouchTime = ref(0)
  
  // Computed properties
  const isMobile = computed(() => $q.screen.lt.md)
  const isTablet = computed(() => $q.screen.gt.xs && $q.screen.lt.lg)
  const isSmallMobile = computed(() => $q.screen.width < 400)
  const isLandscape = computed(() => orientation.value === 'landscape')
  const isPortrait = computed(() => orientation.value === 'portrait')
  
  // Mobile-specific breakpoints
  const breakpoints = computed(() => ({
    xs: $q.screen.xs,      // < 600px
    sm: $q.screen.sm,      // 600px - 1023px
    md: $q.screen.md,      // 1024px - 1439px
    lg: $q.screen.lg,      // 1440px - 1919px
    xl: $q.screen.xl       // > 1920px
  }))
  
  // Touch detection
  const detectTouch = () => {
    isTouchDevice.value = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0
  }
  
  // Orientation detection
  const updateOrientation = () => {
    if (screen.orientation) {
      orientation.value = screen.orientation.angle === 0 || screen.orientation.angle === 180 
        ? 'portrait' 
        : 'landscape'
    } else {
      orientation.value = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }
  }
  
  // Viewport height tracking (for mobile keyboard detection)
  const updateViewportHeight = () => {
    const currentHeight = window.innerHeight
    const heightDifference = viewportHeight.value - currentHeight
    
    // If viewport height decreased significantly, keyboard is likely open
    isKeyboardOpen.value = heightDifference > 150
    viewportHeight.value = currentHeight
  }
  
  // Prevent double-tap zoom on mobile
  const preventDoubleTabZoom = (event) => {
    const now = Date.now()
    if (now - lastTouchTime.value < 300) {
      event.preventDefault()
    }
    lastTouchTime.value = now
  }
  
  // Mobile-optimized scroll behavior
  const smoothScrollTo = (element, options = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    }
    
    if (typeof element === 'string') {
      const targetElement = document.querySelector(element)
      if (targetElement) {
        targetElement.scrollIntoView({ ...defaultOptions, ...options })
      }
    } else if (element) {
      element.scrollIntoView({ ...defaultOptions, ...options })
    }
  }
  
  // Mobile-friendly haptic feedback
  const hapticFeedback = (type = 'light') => {
    if (navigator.vibrate && isMobile.value) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 100, 50],
        warning: [20, 50, 20]
      }
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }
  
  // Safe area insets for notched devices
  const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0')
    }
  }
  
  // Mobile-optimized touch gestures
  const setupTouchGestures = (element, callbacks = {}) => {
    if (!element || !isTouchDevice.value) return
    
    let startX = 0
    let startY = 0
    let startTime = 0
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }
    
    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const endTime = Date.now()
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime
      
      // Swipe detection
      const minSwipeDistance = 50
      const maxSwipeTime = 300
      
      if (deltaTime < maxSwipeTime) {
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && callbacks.swipeRight) {
            callbacks.swipeRight(e)
          } else if (deltaX < 0 && callbacks.swipeLeft) {
            callbacks.swipeLeft(e)
          }
        } else if (Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical swipe
          if (deltaY > 0 && callbacks.swipeDown) {
            callbacks.swipeDown(e)
          } else if (deltaY < 0 && callbacks.swipeUp) {
            callbacks.swipeUp(e)
          }
        }
      }
      
      // Tap detection
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
        if (callbacks.tap) {
          callbacks.tap(e)
        }
      }
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }
  
  // Mobile performance optimization
  const optimizeForMobile = () => {
    if (isMobile.value) {
      // Reduce animations on low-end devices
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s')
      }
      
      // Optimize scroll performance
      document.addEventListener('touchstart', () => {}, { passive: true })
      document.addEventListener('touchmove', () => {}, { passive: true })
    }
  }
  
  // Setup event listeners
  onMounted(() => {
    detectTouch()
    updateOrientation()
    updateViewportHeight()
    optimizeForMobile()
    
    // Event listeners
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateViewportHeight)
    
    if (isTouchDevice.value) {
      document.addEventListener('touchend', preventDoubleTabZoom, { passive: false })
    }
    
    // CSS custom properties for safe areas
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)')
      document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)')
      document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
      document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)')
    }
  })
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('orientationchange', updateOrientation)
    window.removeEventListener('resize', updateViewportHeight)
    
    if (isTouchDevice.value) {
      document.removeEventListener('touchend', preventDoubleTabZoom)
    }
  })
  
  return {
    // State
    isTouchDevice,
    orientation,
    viewportHeight,
    isKeyboardOpen,
    
    // Computed
    isMobile,
    isTablet,
    isSmallMobile,
    isLandscape,
    isPortrait,
    breakpoints,
    
    // Methods
    smoothScrollTo,
    hapticFeedback,
    getSafeAreaInsets,
    setupTouchGestures,
    optimizeForMobile
  }
}