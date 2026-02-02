<template>
  <div class="performance-dashboard">
    <div class="row q-gutter-md">
      <!-- Core Web Vitals -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="speed" class="q-mr-sm" />
              Core Web Vitals
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-12 col-md-3">
                <q-circular-progress
                  :value="getFCPScore()"
                  size="80px"
                  :thickness="0.15"
                  :color="getVitalColor('FCP', vitals.FCP?.value)"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="text-center">
                    <div class="text-caption">FCP</div>
                    <div class="text-body2">{{ formatTime(vitals.FCP?.value) }}</div>
                  </div>
                </q-circular-progress>
                <div class="text-center text-caption">First Contentful Paint</div>
              </div>
              
              <div class="col-12 col-md-3">
                <q-circular-progress
                  :value="getLCPScore()"
                  size="80px"
                  :thickness="0.15"
                  :color="getVitalColor('LCP', vitals.LCP?.value)"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="text-center">
                    <div class="text-caption">LCP</div>
                    <div class="text-body2">{{ formatTime(vitals.LCP?.value) }}</div>
                  </div>
                </q-circular-progress>
                <div class="text-center text-caption">Largest Contentful Paint</div>
              </div>
              
              <div class="col-12 col-md-3">
                <q-circular-progress
                  :value="getCLSScore()"
                  size="80px"
                  :thickness="0.15"
                  :color="getVitalColor('CLS', vitals.CLS?.value)"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="text-center">
                    <div class="text-caption">CLS</div>
                    <div class="text-body2">{{ formatCLS(vitals.CLS?.value) }}</div>
                  </div>
                </q-circular-progress>
                <div class="text-center text-caption">Cumulative Layout Shift</div>
              </div>
              
              <div class="col-12 col-md-3">
                <q-circular-progress
                  :value="getFIDScore()"
                  size="80px"
                  :thickness="0.15"
                  :color="getVitalColor('FID', vitals.FID?.value)"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="text-center">
                    <div class="text-caption">FID</div>
                    <div class="text-body2">{{ formatTime(vitals.FID?.value) }}</div>
                  </div>
                </q-circular-progress>
                <div class="text-center text-caption">First Input Delay</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Performance Metrics -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="analytics" class="q-mr-sm" />
              Performance Metrics
            </div>
            
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>Cache Hit Ratio</q-item-label>
                  <q-linear-progress
                    :value="cacheStats.hitRatio / 100"
                    color="positive"
                    class="q-mt-sm"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ cacheStats.hitRatio }}%</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>API Success Rate</q-item-label>
                  <q-linear-progress
                    :value="apiStats.successRate / 100"
                    :color="apiStats.successRate > 95 ? 'positive' : apiStats.successRate > 90 ? 'warning' : 'negative'"
                    class="q-mt-sm"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ apiStats.successRate }}%</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Average API Response</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ formatTime(apiStats.averageTime) }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Active Requests</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ apiStats.activeRequests }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Memory Usage -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="memory" class="q-mr-sm" />
              Memory Usage
            </div>
            
            <div v-if="memoryInfo.isSupported">
              <div class="text-center q-mb-md">
                <q-circular-progress
                  :value="memoryInfo.usedPercentage"
                  size="100px"
                  :thickness="0.15"
                  :color="getMemoryColor(memoryInfo.usedPercentage)"
                  track-color="grey-3"
                  show-value
                  class="q-ma-md"
                >
                  {{ Math.round(memoryInfo.usedPercentage) }}%
                </q-circular-progress>
              </div>
              
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label>Used Heap</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatBytes(memoryInfo.usedJSHeapSize) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label>Total Heap</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatBytes(memoryInfo.totalJSHeapSize) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label>Heap Limit</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatBytes(memoryInfo.jsHeapSizeLimit) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div v-else class="text-center text-grey-6">
              Memory monitoring not supported in this browser
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Performance Timeline -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="timeline" class="q-mr-sm" />
              Performance Timeline
            </div>
            
            <div class="performance-timeline">
              <div 
                v-for="metric in recentMetrics" 
                :key="metric.id"
                class="timeline-item"
                :class="getMetricClass(metric)"
              >
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-title">{{ metric.name }}</div>
                  <div class="timeline-details">
                    {{ metric.details }}
                  </div>
                  <div class="timeline-time">{{ formatTimestamp(metric.timestamp) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Actions -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Actions</div>
            
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="refresh"
                label="Refresh Metrics"
                @click="refreshMetrics"
                :loading="refreshing"
              />
              
              <q-btn
                color="secondary"
                icon="clear_all"
                label="Clear Cache"
                @click="clearCache"
              />
              
              <q-btn
                color="info"
                icon="download"
                label="Export Data"
                @click="exportData"
              />
              
              <q-btn
                color="warning"
                icon="bug_report"
                label="Run Performance Test"
                @click="runPerformanceTest"
                :loading="testing"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useWebVitals, useMemoryMonitoring, useApiPerformanceTracking } from 'src/composables/usePerformanceMonitoring'
import { useCache } from 'src/services/cacheService'
import { performanceService } from 'src/services/performanceService'

const $q = useQuasar()

// Composables
const { vitals, updateVitals, getVitalRating } = useWebVitals()
const { memoryInfo, formatBytes } = useMemoryMonitoring()
const { requestStats } = useApiPerformanceTracking()
const { cache, getStats: getCacheStats } = useCache()

// State
const refreshing = ref(false)
const testing = ref(false)
const cacheStats = ref({})
const recentMetrics = ref([])
let updateInterval = null

// Computed
const apiStats = computed(() => {
  const stats = requestStats.value
  return {
    successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 100,
    averageTime: Math.round(stats.averageTime),
    activeRequests: 0, // This would come from the tracking composable
    slowRequests: stats.slowRequests
  }
})

// Methods
function getFCPScore() {
  const value = vitals.value.FCP?.value || 0
  return Math.max(0, Math.min(100, 100 - (value / 1800) * 100))
}

function getLCPScore() {
  const value = vitals.value.LCP?.value || 0
  return Math.max(0, Math.min(100, 100 - (value / 2500) * 100))
}

function getCLSScore() {
  const value = vitals.value.CLS?.value || 0
  return Math.max(0, Math.min(100, 100 - (value / 0.1) * 100))
}

function getFIDScore() {
  const value = vitals.value.FID?.value || 0
  return Math.max(0, Math.min(100, 100 - (value / 100) * 100))
}

function getVitalColor(name, value) {
  if (!value) return 'grey'
  
  const rating = getVitalRating(name, value)
  const colors = {
    good: 'positive',
    'needs-improvement': 'warning',
    poor: 'negative'
  }
  return colors[rating] || 'grey'
}

function getMemoryColor(percentage) {
  if (percentage < 60) return 'positive'
  if (percentage < 80) return 'warning'
  return 'negative'
}

function formatTime(ms) {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatCLS(value) {
  if (!value) return 'N/A'
  return value.toFixed(3)
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function getMetricClass(metric) {
  const classes = {
    good: 'timeline-good',
    warning: 'timeline-warning',
    error: 'timeline-error'
  }
  return classes[metric.type] || 'timeline-default'
}

async function refreshMetrics() {
  refreshing.value = true
  
  try {
    updateVitals()
    cacheStats.value = getCacheStats()
    
    // Get recent performance metrics
    const summary = performanceService.getPerformanceSummary()
    updateRecentMetrics(summary)
    
    $q.notify({
      type: 'positive',
      message: 'Performance metrics refreshed'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh metrics'
    })
  } finally {
    refreshing.value = false
  }
}

function clearCache() {
  $q.dialog({
    title: 'Clear Cache',
    message: 'Are you sure you want to clear all cached data?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    cache.clear()
    cacheStats.value = getCacheStats()
    
    $q.notify({
      type: 'positive',
      message: 'Cache cleared successfully'
    })
  })
}

function exportData() {
  const data = {
    vitals: vitals.value,
    cacheStats: cacheStats.value,
    apiStats: apiStats.value,
    memoryInfo: memoryInfo.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  $q.notify({
    type: 'positive',
    message: 'Performance data exported'
  })
}

async function runPerformanceTest() {
  testing.value = true
  
  try {
    // Simulate various performance tests
    const tests = [
      { name: 'DOM Query Performance', test: testDOMQueries },
      { name: 'Memory Allocation', test: testMemoryAllocation },
      { name: 'Rendering Performance', test: testRenderingPerformance }
    ]
    
    for (const { name, test } of tests) {
      const startTime = performance.now()
      await test()
      const duration = performance.now() - startTime
      
      recentMetrics.value.unshift({
        id: Date.now() + Math.random(),
        name,
        details: `Completed in ${duration.toFixed(2)}ms`,
        timestamp: Date.now(),
        type: duration > 100 ? 'warning' : 'good'
      })
    }
    
    $q.notify({
      type: 'positive',
      message: 'Performance tests completed'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Performance tests failed'
    })
  } finally {
    testing.value = false
  }
}

function testDOMQueries() {
  // Test DOM query performance
  for (let i = 0; i < 1000; i++) {
    document.querySelectorAll('div')
  }
}

function testMemoryAllocation() {
  // Test memory allocation
  const arrays = []
  for (let i = 0; i < 1000; i++) {
    arrays.push(new Array(1000).fill(i))
  }
}

function testRenderingPerformance() {
  return new Promise(resolve => {
    // Test rendering performance
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

function updateRecentMetrics(summary) {
  // Add new metrics based on summary
  if (summary.longTaskCount > 0) {
    recentMetrics.value.unshift({
      id: Date.now(),
      name: 'Long Tasks Detected',
      details: `${summary.longTaskCount} long tasks (${summary.totalLongTaskTime.toFixed(2)}ms total)`,
      timestamp: Date.now(),
      type: 'warning'
    })
  }
  
  if (summary.slowResources > 0) {
    recentMetrics.value.unshift({
      id: Date.now() + 1,
      name: 'Slow Resources',
      details: `${summary.slowResources} resources loaded slowly`,
      timestamp: Date.now(),
      type: 'warning'
    })
  }
  
  // Keep only last 20 metrics
  if (recentMetrics.value.length > 20) {
    recentMetrics.value = recentMetrics.value.slice(0, 20)
  }
}

// Lifecycle
onMounted(() => {
  refreshMetrics()
  
  // Update metrics every 30 seconds
  updateInterval = setInterval(refreshMetrics, 30000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.performance-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.performance-timeline {
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -15px;
  top: 20px;
  bottom: -10px;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-marker {
  position: absolute;
  left: -20px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #2196f3;
}

.timeline-good .timeline-marker {
  background-color: #4caf50;
}

.timeline-warning .timeline-marker {
  background-color: #ff9800;
}

.timeline-error .timeline-marker {
  background-color: #f44336;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.timeline-details {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.timeline-time {
  color: #999;
  font-size: 12px;
}
</style>