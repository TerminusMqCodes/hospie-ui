/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and application performance metrics
 */

export class PerformanceService {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isInitialized = false
    this.init()
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    this.setupPerformanceObservers()
    this.measureCoreWebVitals()
    this.trackNavigationTiming()
  }

  setupPerformanceObservers() {
    if (!('PerformanceObserver' in window)) return

    // Navigation timing
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', {
            name: entry.name,
            type: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart
          })
        }
      })
      
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    } catch (error) {
      console.warn('Navigation observer not supported:', error)
    }

    // Resource timing
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) { // Only track slow resources
            this.recordMetric('resource', {
              name: entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize,
              cached: entry.transferSize === 0
            })
          }
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (error) {
      console.warn('Resource observer not supported:', error)
    }

    // Long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('longtask', {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration
          })
        }
      })
      
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      console.warn('Long task observer not supported:', error)
    }
  }

  measureCoreWebVitals() {
    // First Contentful Paint (FCP)
    this.measureFCP()
    
    // Largest Contentful Paint (LCP)
    this.measureLCP()
    
    // Cumulative Layout Shift (CLS)
    this.measureCLS()
    
    // First Input Delay (FID)
    this.measureFID()
  }

  measureFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordWebVital('FCP', entry.startTime)
            observer.disconnect()
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FCP measurement not supported:', error)
    }
  }

  measureLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordWebVital('LCP', lastEntry.startTime)
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP measurement not supported:', error)
    }
  }

  measureCLS() {
    try {
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value
              sessionEntries.push(entry)
            } else {
              sessionValue = entry.value
              sessionEntries = [entry]
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue
              this.recordWebVital('CLS', clsValue)
            }
          }
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS measurement not supported:', error)
    }
  }

  measureFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordWebVital('FID', entry.processingStart - entry.startTime)
          observer.disconnect()
        }
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID measurement not supported:', error)
    }
  }

  trackNavigationTiming() {
    if (!performance.timing) return

    const timing = performance.timing
    const navigationStart = timing.navigationStart

    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ssl: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
      ttfb: timing.responseStart - navigationStart,
      download: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart,
      totalTime: timing.loadEventEnd - navigationStart
    }

    this.recordMetric('timing', metrics)
  }

  recordMetric(category, data) {
    const timestamp = Date.now()
    const metric = {
      category,
      data,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    if (!this.metrics.has(category)) {
      this.metrics.set(category, [])
    }

    const categoryMetrics = this.metrics.get(category)
    categoryMetrics.push(metric)

    // Keep only last 100 metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.splice(0, categoryMetrics.length - 100)
    }

    // Send to analytics if available
    this.sendToAnalytics(metric)
  }

  recordWebVital(name, value) {
    const vital = {
      name,
      value: Math.round(value),
      timestamp: Date.now(),
      url: window.location.href,
      rating: this.getVitalRating(name, value)
    }

    this.recordMetric('webvitals', vital)
    
    console.log(`Core Web Vital - ${name}:`, {
      value: vital.value,
      rating: vital.rating
    })
  }

  getVitalRating(name, value) {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    }

    const threshold = thresholds[name]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  sendToAnalytics(metric) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_category: metric.category,
        metric_name: metric.data.name || metric.category,
        metric_value: metric.data.value || metric.data.duration,
        custom_parameter_1: metric.data.rating || 'unknown'
      })
    }

    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      this.sendToCustomAnalytics(metric)
    }
  }

  async sendToCustomAnalytics(metric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      })
    } catch (error) {
      console.warn('Failed to send performance metric:', error)
    }
  }

  // Public API methods
  getMetrics(category = null) {
    if (category) {
      return this.metrics.get(category) || []
    }
    
    const allMetrics = {}
    for (const [key, value] of this.metrics.entries()) {
      allMetrics[key] = value
    }
    return allMetrics
  }

  getWebVitals() {
    const vitals = this.getMetrics('webvitals')
    const latest = {}
    
    vitals.forEach(vital => {
      if (!latest[vital.data.name] || vital.timestamp > latest[vital.data.name].timestamp) {
        latest[vital.data.name] = vital.data
      }
    })
    
    return latest
  }

  getPerformanceSummary() {
    const webVitals = this.getWebVitals()
    const timing = this.getMetrics('timing')
    const resources = this.getMetrics('resource')
    const longTasks = this.getMetrics('longtask')

    return {
      webVitals,
      timing: timing[timing.length - 1]?.data || {},
      resourceCount: resources.length,
      slowResources: resources.filter(r => r.data.duration > 1000).length,
      longTaskCount: longTasks.length,
      totalLongTaskTime: longTasks.reduce((sum, task) => sum + task.data.duration, 0),
      timestamp: Date.now()
    }
  }

  markStart(name) {
    performance.mark(`${name}-start`)
  }

  markEnd(name) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    if (measure) {
      this.recordMetric('custom', {
        name,
        duration: measure.duration,
        startTime: measure.startTime
      })
    }
  }

  clearMetrics() {
    this.metrics.clear()
    performance.clearMarks()
    performance.clearMeasures()
  }

  destroy() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        console.warn('Error disconnecting observer:', error)
      }
    })
    this.observers = []
    this.clearMetrics()
    this.isInitialized = false
  }
}

// Singleton instance
export const performanceService = new PerformanceService()

// Vue composable
export function usePerformanceMonitoring() {
  return {
    performanceService,
    markStart: (name) => performanceService.markStart(name),
    markEnd: (name) => performanceService.markEnd(name),
    getMetrics: (category) => performanceService.getMetrics(category),
    getWebVitals: () => performanceService.getWebVitals(),
    getSummary: () => performanceService.getPerformanceSummary()
  }
}