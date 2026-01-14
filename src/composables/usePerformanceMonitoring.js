import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import { performanceService } from 'src/services/performanceService'

/**
 * Vue composable for component-level performance monitoring
 */
export function usePerformanceMonitoring(componentName) {
  const startTime = ref(0)
  const mountTime = ref(0)
  const renderCount = ref(0)
  const isMonitoring = ref(false)

  let observer = null
  let renderObserver = null

  const performanceData = computed(() => ({
    componentName,
    mountTime: mountTime.value,
    renderCount: renderCount.value,
    averageRenderTime: renderCount.value > 0 ? mountTime.value / renderCount.value : 0
  }))

  onMounted(() => {
    startTime.value = performance.now()
    isMonitoring.value = true
    
    // Mark component mount start
    performanceService.markStart(`${componentName}-mount`)
    
    // Set up render performance monitoring
    setupRenderMonitoring()
    
    // Measure mount time after next tick
    nextTick(() => {
      const endTime = performance.now()
      mountTime.value = endTime - startTime.value
      
      performanceService.markEnd(`${componentName}-mount`)
      
      console.log(`${componentName} mounted in ${mountTime.value.toFixed(2)}ms`)
    })
  })

  onUnmounted(() => {
    isMonitoring.value = false
    
    if (observer) {
      observer.disconnect()
    }
    
    if (renderObserver) {
      renderObserver.disconnect()
    }
    
    // Record final performance data
    performanceService.recordMetric('component', {
      name: componentName,
      mountTime: mountTime.value,
      renderCount: renderCount.value,
      lifecycle: 'unmounted'
    })
  })

  function setupRenderMonitoring() {
    if (!('PerformanceObserver' in window)) return

    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes(componentName)) {
            renderCount.value++
            
            performanceService.recordMetric('render', {
              component: componentName,
              duration: entry.duration,
              startTime: entry.startTime,
              renderNumber: renderCount.value
            })
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure'] })
    } catch (error) {
      console.warn('Render monitoring not supported:', error)
    }
  }

  // Public methods for manual performance tracking
  function markStart(operation) {
    if (!isMonitoring.value) return
    performanceService.markStart(`${componentName}-${operation}`)
  }

  function markEnd(operation) {
    if (!isMonitoring.value) return
    performanceService.markEnd(`${componentName}-${operation}`)
  }

  function trackAsyncOperation(name, promise) {
    if (!isMonitoring.value) return promise

    const startTime = performance.now()
    
    return promise
      .then(result => {
        const duration = performance.now() - startTime
        
        performanceService.recordMetric('async', {
          component: componentName,
          operation: name,
          duration,
          success: true
        })
        
        return result
      })
      .catch(error => {
        const duration = performance.now() - startTime
        
        performanceService.recordMetric('async', {
          component: componentName,
          operation: name,
          duration,
          success: false,
          error: error.message
        })
        
        throw error
      })
  }

  function trackUserInteraction(eventType, handler) {
    return function(...args) {
      const startTime = performance.now()
      
      try {
        const result = handler.apply(this, args)
        
        // Handle both sync and async handlers
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            const duration = performance.now() - startTime
            recordInteraction(eventType, duration, true)
          })
        } else {
          const duration = performance.now() - startTime
          recordInteraction(eventType, duration, true)
          return result
        }
      } catch (error) {
        const duration = performance.now() - startTime
        recordInteraction(eventType, duration, false, error.message)
        throw error
      }
    }
  }

  function recordInteraction(eventType, duration, success, error = null) {
    performanceService.recordMetric('interaction', {
      component: componentName,
      eventType,
      duration,
      success,
      error,
      timestamp: Date.now()
    })
  }

  return {
    // Reactive data
    performanceData,
    isMonitoring,
    mountTime,
    renderCount,
    
    // Methods
    markStart,
    markEnd,
    trackAsyncOperation,
    trackUserInteraction
  }
}

/**
 * Composable for tracking API call performance
 */
export function useApiPerformanceTracking() {
  const activeRequests = ref(new Map())
  const requestStats = ref({
    total: 0,
    successful: 0,
    failed: 0,
    averageTime: 0,
    slowRequests: 0
  })

  function trackRequest(url, options = {}) {
    const requestId = `${Date.now()}-${Math.random()}`
    const startTime = performance.now()
    
    activeRequests.value.set(requestId, {
      url,
      startTime,
      method: options.method || 'GET'
    })

    return {
      requestId,
      complete: (success = true, response = null) => {
        const request = activeRequests.value.get(requestId)
        if (!request) return

        const duration = performance.now() - request.startTime
        activeRequests.value.delete(requestId)

        // Update stats
        requestStats.value.total++
        if (success) {
          requestStats.value.successful++
        } else {
          requestStats.value.failed++
        }

        // Track slow requests (>2 seconds)
        if (duration > 2000) {
          requestStats.value.slowRequests++
        }

        // Update average time
        requestStats.value.averageTime = 
          (requestStats.value.averageTime * (requestStats.value.total - 1) + duration) / 
          requestStats.value.total

        // Record in performance service
        performanceService.recordMetric('api', {
          url: request.url,
          method: request.method,
          duration,
          success,
          status: response?.status,
          size: response?.size || 0
        })
      }
    }
  }

  function getActiveRequestCount() {
    return activeRequests.value.size
  }

  function clearStats() {
    requestStats.value = {
      total: 0,
      successful: 0,
      failed: 0,
      averageTime: 0,
      slowRequests: 0
    }
  }

  return {
    activeRequests: computed(() => activeRequests.value),
    requestStats: computed(() => requestStats.value),
    trackRequest,
    getActiveRequestCount,
    clearStats
  }
}

/**
 * Composable for memory usage monitoring
 */
export function useMemoryMonitoring() {
  const memoryInfo = ref({})
  const isSupported = ref(false)

  onMounted(() => {
    isSupported.value = 'memory' in performance
    
    if (isSupported.value) {
      updateMemoryInfo()
      
      // Update memory info every 30 seconds
      const interval = setInterval(updateMemoryInfo, 30000)
      
      onUnmounted(() => {
        clearInterval(interval)
      })
    }
  })

  function updateMemoryInfo() {
    if (!isSupported.value) return

    const memory = performance.memory
    memoryInfo.value = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      timestamp: Date.now()
    }

    // Warn if memory usage is high
    if (memoryInfo.value.usedPercentage > 80) {
      console.warn('High memory usage detected:', memoryInfo.value.usedPercentage.toFixed(2) + '%')
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    memoryInfo: computed(() => memoryInfo.value),
    isSupported,
    updateMemoryInfo,
    formatBytes
  }
}

/**
 * Composable for Core Web Vitals monitoring
 */
export function useWebVitals() {
  const vitals = ref({})
  const isLoading = ref(true)

  onMounted(() => {
    // Get initial vitals
    updateVitals()
    
    // Update vitals periodically
    const interval = setInterval(updateVitals, 5000)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  })

  function updateVitals() {
    vitals.value = performanceService.getWebVitals()
    isLoading.value = false
  }

  function getVitalRating(name, value) {
    return performanceService.getVitalRating(name, value)
  }

  function getVitalColor(rating) {
    const colors = {
      good: 'positive',
      'needs-improvement': 'warning',
      poor: 'negative',
      unknown: 'grey'
    }
    return colors[rating] || 'grey'
  }

  return {
    vitals: computed(() => vitals.value),
    isLoading,
    updateVitals,
    getVitalRating,
    getVitalColor
  }
}