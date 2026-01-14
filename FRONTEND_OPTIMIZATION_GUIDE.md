# Frontend Performance Optimization Guide

## Aktuális Állapot

A Quasar Vue.js frontend optimalizációja a következő területekre fókuszál:
- Code splitting és lazy loading
- Bundle optimization
- Caching strategies
- Performance monitoring

## 1. Code Splitting és Lazy Loading

### 1.1 Route-based Code Splitting

A route-based code splitting már implementálva van a router konfigurációban:

```javascript
// src/router/routes.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/DashboardPage.vue') // Lazy loaded
      }
    ]
  }
]
```

### 1.2 Component-based Lazy Loading

```javascript
// Lazy load heavy components
export default {
  components: {
    HeavyChart: () => import('components/charts/HeavyChart.vue'),
    DataTable: () => import('components/tables/DataTable.vue')
  }
}
```

### 1.3 Dynamic Imports for Libraries

```javascript
// Lazy load heavy libraries
async function loadChartLibrary() {
  const { Chart } = await import('chart.js')
  return Chart
}
```

## 2. Bundle Optimization

### 2.1 Quasar Configuration

```javascript
// quasar.config.js
module.exports = configure(function (ctx) {
  return {
    build: {
      // Optimize chunks
      chainWebpack(chain) {
        chain.optimization.splitChunks({
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            quasar: {
              test: /[\\/]node_modules[\\/]quasar[\\/]/,
              name: 'quasar',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true
            }
          }
        })
      },
      
      // Enable tree shaking
      analyze: ctx.mode.spa,
      
      // Minification
      minify: true,
      
      // Source maps only in development
      sourcemap: ctx.dev,
      
      // Gzip compression
      gzip: true,
      
      // Modern build for modern browsers
      modern: true
    }
  }
})
```

### 2.2 Tree Shaking Optimization

```javascript
// Import only what you need
import { debounce } from 'lodash-es'
// Instead of: import _ from 'lodash'

// Quasar components
import { QBtn, QCard } from 'quasar'
// Instead of importing all components
```

### 2.3 Bundle Analysis

```bash
# Analyze bundle size
quasar build --analyze

# Check bundle composition
npm run build:analyze
```

## 3. Caching Strategies

### 3.1 HTTP Caching Headers

```javascript
// quasar.config.js - PWA configuration
pwa: {
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.hospie\.com\/api\//,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      }
    ]
  }
}
```

### 3.2 Application-level Caching

```javascript
// src/services/cacheService.js
export class CacheService {
  constructor() {
    this.cache = new Map()
    this.ttl = new Map()
  }

  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000))
  }

  get(key) {
    if (this.isExpired(key)) {
      this.delete(key)
      return null
    }
    return this.cache.get(key)
  }

  isExpired(key) {
    const expiry = this.ttl.get(key)
    return expiry && Date.now() > expiry
  }

  delete(key) {
    this.cache.delete(key)
    this.ttl.delete(key)
  }

  clear() {
    this.cache.clear()
    this.ttl.clear()
  }
}
```

### 3.3 Pinia Store Caching

```javascript
// src/stores/cache.js
import { defineStore } from 'pinia'

export const useCacheStore = defineStore('cache', {
  state: () => ({
    cache: new Map(),
    timestamps: new Map()
  }),

  actions: {
    set(key, data, ttl = 300000) { // 5 minutes default
      this.cache.set(key, data)
      this.timestamps.set(key, Date.now() + ttl)
    },

    get(key) {
      if (this.isExpired(key)) {
        this.remove(key)
        return null
      }
      return this.cache.get(key)
    },

    isExpired(key) {
      const expiry = this.timestamps.get(key)
      return expiry && Date.now() > expiry
    },

    remove(key) {
      this.cache.delete(key)
      this.timestamps.delete(key)
    }
  }
})
```

## 4. Performance Monitoring

### 4.1 Performance Metrics Collection

```javascript
// src/services/performanceService.js
export class PerformanceService {
  constructor() {
    this.metrics = []
    this.observer = null
    this.init()
  }

  init() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry)
        }
      })
      
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
    }

    // Core Web Vitals
    this.measureCoreWebVitals()
  }

  recordMetric(entry) {
    const metric = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    this.sendToAnalytics(metric)
  }

  measureCoreWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordWebVital('FCP', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordWebVital('LCP', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.recordWebVital('CLS', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  recordWebVital(name, value) {
    const vital = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href
    }

    console.log(`Core Web Vital - ${name}:`, value)
    this.sendToAnalytics(vital)
  }

  sendToAnalytics(data) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: data.name,
        metric_value: data.value || data.duration,
        custom_parameter: data.type
      })
    }
  }

  getMetrics() {
    return this.metrics
  }

  getAverageLoadTime() {
    const navigationEntries = this.metrics.filter(m => m.type === 'navigation')
    if (navigationEntries.length === 0) return 0
    
    const totalTime = navigationEntries.reduce((sum, entry) => sum + entry.duration, 0)
    return totalTime / navigationEntries.length
  }
}
```

### 4.2 Component Performance Monitoring

```javascript
// src/composables/usePerformanceMonitoring.js
import { onMounted, onUnmounted } from 'vue'

export function usePerformanceMonitoring(componentName) {
  let startTime = 0
  let observer = null

  onMounted(() => {
    startTime = performance.now()
    
    // Monitor component render time
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
          console.log(`${componentName} render time:`, entry.duration)
        }
      }
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    // Mark component mount
    performance.mark(`${componentName}-mount-start`)
  })

  onUnmounted(() => {
    const endTime = performance.now()
    const mountTime = endTime - startTime
    
    performance.mark(`${componentName}-mount-end`)
    performance.measure(`${componentName}-mount`, `${componentName}-mount-start`, `${componentName}-mount-end`)
    
    console.log(`${componentName} total mount time:`, mountTime)
    
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    markStart: (operation) => performance.mark(`${componentName}-${operation}-start`),
    markEnd: (operation) => {
      performance.mark(`${componentName}-${operation}-end`)
      performance.measure(`${componentName}-${operation}`, `${componentName}-${operation}-start`, `${componentName}-${operation}-end`)
    }
  }
}
```

## 5. Image Optimization

### 5.1 Responsive Images

```vue
<template>
  <picture>
    <source 
      media="(min-width: 768px)" 
      :srcset="`${imageUrl}?w=800&f=webp`"
      type="image/webp"
    >
    <source 
      media="(min-width: 768px)" 
      :srcset="`${imageUrl}?w=800`"
    >
    <source 
      :srcset="`${imageUrl}?w=400&f=webp`"
      type="image/webp"
    >
    <img 
      :src="`${imageUrl}?w=400`" 
      :alt="altText"
      loading="lazy"
      class="responsive-image"
    >
  </picture>
</template>
```

### 5.2 Lazy Loading Images

```javascript
// src/directives/lazyLoad.js
export const lazyLoad = {
  mounted(el, binding) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = binding.value
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })

    imageObserver.observe(el)
  }
}
```

## 6. Memory Management

### 6.1 Event Listener Cleanup

```javascript
// src/composables/useEventListener.js
import { onUnmounted } from 'vue'

export function useEventListener(target, event, handler, options) {
  target.addEventListener(event, handler, options)
  
  onUnmounted(() => {
    target.removeEventListener(event, handler, options)
  })
}
```

### 6.2 Memory Leak Prevention

```javascript
// src/composables/useMemoryManagement.js
import { onUnmounted, ref } from 'vue'

export function useMemoryManagement() {
  const timers = ref([])
  const observers = ref([])
  const subscriptions = ref([])

  const addTimer = (timer) => {
    timers.value.push(timer)
  }

  const addObserver = (observer) => {
    observers.value.push(observer)
  }

  const addSubscription = (subscription) => {
    subscriptions.value.push(subscription)
  }

  onUnmounted(() => {
    // Clear all timers
    timers.value.forEach(timer => clearTimeout(timer))
    
    // Disconnect all observers
    observers.value.forEach(observer => observer.disconnect())
    
    // Unsubscribe from all subscriptions
    subscriptions.value.forEach(subscription => {
      if (typeof subscription === 'function') {
        subscription()
      } else if (subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    })
  })

  return {
    addTimer,
    addObserver,
    addSubscription
  }
}
```

## 7. Build Optimization

### 7.1 Production Build Configuration

```javascript
// quasar.config.js
module.exports = configure(function (ctx) {
  return {
    build: {
      // Production optimizations
      minify: ctx.prod,
      sourcemap: ctx.dev,
      
      // Chunk optimization
      chainWebpack(chain) {
        if (ctx.prod) {
          // Optimize chunks for better caching
          chain.optimization.splitChunks({
            chunks: 'all',
            maxInitialRequests: 10,
            maxAsyncRequests: 10,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true
              }
            }
          })

          // Preload important chunks
          chain.plugin('preload').tap(options => {
            options[0] = {
              rel: 'preload',
              include: 'initial',
              fileBlacklist: [/\.map$/, /hot-update\.js$/]
            }
            return options
          })
        }
      }
    }
  }
})
```

## 8. Runtime Performance

### 8.1 Virtual Scrolling for Large Lists

```vue
<template>
  <q-virtual-scroll
    :items="items"
    :item-size="60"
    v-slot="{ item, index }"
    style="max-height: 400px"
  >
    <q-item :key="index">
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-virtual-scroll>
</template>
```

### 8.2 Debounced Search

```javascript
// src/composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  
  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
    
    return () => clearTimeout(timer)
  })
  
  return debouncedValue
}
```

## 9. Monitoring Dashboard

### 9.1 Performance Dashboard Component

```vue
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Performance Metrics</div>
    </q-card-section>
    
    <q-card-section>
      <div class="row q-gutter-md">
        <div class="col">
          <q-stat
            :value="metrics.fcp"
            suffix="ms"
            label="First Contentful Paint"
            :color="getPerformanceColor(metrics.fcp, 1800)"
          />
        </div>
        
        <div class="col">
          <q-stat
            :value="metrics.lcp"
            suffix="ms"
            label="Largest Contentful Paint"
            :color="getPerformanceColor(metrics.lcp, 2500)"
          />
        </div>
        
        <div class="col">
          <q-stat
            :value="metrics.cls"
            label="Cumulative Layout Shift"
            :color="getPerformanceColor(metrics.cls, 0.1, true)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PerformanceService } from 'src/services/performanceService'

const metrics = ref({
  fcp: 0,
  lcp: 0,
  cls: 0
})

const performanceService = new PerformanceService()

onMounted(() => {
  // Load performance metrics
  loadMetrics()
})

function loadMetrics() {
  const webVitals = performanceService.getWebVitals()
  metrics.value = webVitals
}

function getPerformanceColor(value, threshold, reverse = false) {
  if (reverse) {
    return value <= threshold ? 'positive' : 'negative'
  }
  return value <= threshold ? 'positive' : 'negative'
}
</script>
```

Ez a frontend optimalizációs útmutató biztosítja a Quasar alkalmazás maximális teljesítményét és felhasználói élményét.