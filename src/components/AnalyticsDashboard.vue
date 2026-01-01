<template>
  <div class="analytics-dashboard">
    <!-- Date Range Selector -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div class="col-auto">
                <div class="text-h6">Analytics Dashboard</div>
              </div>
              <div class="col-auto">
                <q-select
                  v-model="selectedPeriod"
                  :options="periodOptions"
                  label="Time Period"
                  outlined
                  dense
                  @update:model-value="onPeriodChange"
                />
              </div>
              <div class="col-auto">
                <q-input
                  v-model="customStartDate"
                  type="date"
                  label="Start Date"
                  outlined
                  dense
                  :disable="selectedPeriod !== 'custom'"
                />
              </div>
              <div class="col-auto">
                <q-input
                  v-model="customEndDate"
                  type="date"
                  label="End Date"
                  outlined
                  dense
                  :disable="selectedPeriod !== 'custom'"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Refresh"
                  @click="loadAllData"
                  :loading="loading"
                />
              </div>
              <div class="col-auto">
                <q-chip 
                  v-if="isOfflineMode"
                  color="warning" 
                  text-color="white" 
                  icon="cloud_off"
                  label="Offline Mode - Sample Data"
                />
                <q-chip 
                  v-else-if="!loading"
                  color="positive" 
                  text-color="white" 
                  icon="cloud_done"
                  label="Live Data"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle2 text-grey-6">Total Revenue</div>
                <div class="text-h5 text-primary">
                  ${{ formatNumber(metrics.totalRevenue) }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="attach_money" size="40px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle2 text-grey-6">Avg Occupancy</div>
                <div class="text-h5 text-secondary">
                  {{ formatPercent(metrics.avgOccupancy) }}%
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="hotel" size="40px" color="secondary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle2 text-grey-6">Total Reservations</div>
                <div class="text-h5 text-positive">
                  {{ formatNumber(metrics.totalReservations) }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="event" size="40px" color="positive" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle2 text-grey-6">Avg Daily Rate</div>
                <div class="text-h5 text-accent">
                  ${{ formatNumber(metrics.avgDailyRate) }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="trending_up" size="40px" color="accent" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Revenue Chart -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Revenue Trend</div>
            <div v-if="revenueChartData.length > 0" class="chart-container">
              <canvas ref="revenueChart"></canvas>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-lg">
              No revenue data available for selected period
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Occupancy Chart -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Occupancy Rate</div>
            <div v-if="occupancyChartData.length > 0" class="chart-container">
              <canvas ref="occupancyChart"></canvas>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-lg">
              No occupancy data available for selected period
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Booking Sources and Guest Analytics -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Booking Sources -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Booking Sources</div>
            <div v-if="bookingSources.length > 0">
              <div v-for="source in bookingSources" :key="source.source" class="q-mb-sm">
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-body1">{{ source.source || 'Direct' }}</div>
                    <div class="text-caption text-grey-6">
                      {{ source.reservations }} reservations
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="text-body1 text-weight-medium">
                      ${{ formatNumber(source.revenue) }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ formatPercent(source.revenue_percentage) }}%
                    </div>
                  </div>
                </div>
                <q-linear-progress
                  :value="source.revenue_percentage / 100"
                  color="primary"
                  class="q-mt-xs"
                />
              </div>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-lg">
              No booking source data available
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Guest Analytics -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Guest Analytics</div>
            <div v-if="guestAnalytics.summary" class="q-gutter-md">
              <div class="row q-gutter-md">
                <div class="col-6">
                  <div class="text-center">
                    <div class="text-h4 text-primary">{{ guestAnalytics.summary.total_guests }}</div>
                    <div class="text-caption">Total Guests</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <div class="text-h4 text-secondary">{{ guestAnalytics.summary.new_guests }}</div>
                    <div class="text-caption">New Guests</div>
                  </div>
                </div>
              </div>
              <div class="row q-gutter-md">
                <div class="col-6">
                  <div class="text-center">
                    <div class="text-h4 text-positive">{{ guestAnalytics.summary.returning_guests }}</div>
                    <div class="text-caption">Returning</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <div class="text-h4 text-accent">{{ guestAnalytics.summary.vip_guests }}</div>
                    <div class="text-caption">VIP Guests</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-lg">
              No guest analytics available
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Room Performance Table -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Performance</div>
            <q-table
              v-if="roomPerformance.data && roomPerformance.data.length > 0"
              :rows="roomPerformance.data"
              :columns="roomColumns"
              row-key="room_id"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
            >
              <template v-slot:body-cell-utilization_rate="props">
                <q-td :props="props">
                  <q-linear-progress
                    :value="props.value / 100"
                    :color="getUtilizationColor(props.value)"
                    class="q-mt-sm"
                  />
                  <div class="text-center q-mt-xs">{{ formatPercent(props.value) }}%</div>
                </q-td>
              </template>
              <template v-slot:body-cell-total_revenue="props">
                <q-td :props="props">
                  ${{ formatNumber(props.value) }}
                </q-td>
              </template>
              <template v-slot:body-cell-revenue_per_available_room="props">
                <q-td :props="props">
                  ${{ formatNumber(props.value) }}
                </q-td>
              </template>
              <template v-slot:body-cell-average_daily_rate="props">
                <q-td :props="props">
                  ${{ formatNumber(props.value) }}
                </q-td>
              </template>
            </q-table>
            <div v-else class="text-center text-grey-6 q-pa-lg">
              No room performance data available
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import analyticsService from 'src/services/analyticsService'
import Chart from 'chart.js/auto'

// Reactive data
const loading = ref(false)
const selectedPeriod = ref('last_30_days')
const customStartDate = ref('')
const customEndDate = ref('')
const isOfflineMode = ref(false)

// Chart refs
const revenueChart = ref(null)
const occupancyChart = ref(null)
let revenueChartInstance = null
let occupancyChartInstance = null

// Data
const metrics = ref({
  totalRevenue: 0,
  avgOccupancy: 0,
  totalReservations: 0,
  avgDailyRate: 0
})

const revenueChartData = ref([])
const occupancyChartData = ref([])
const bookingSources = ref([])
const guestAnalytics = ref({})
const roomPerformance = ref({})

// Options
const periodOptions = [
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom Range', value: 'custom' }
]

const roomColumns = [
  { name: 'room_number', label: 'Room', field: 'room_number', align: 'left', sortable: true },
  { name: 'room_type', label: 'Type', field: 'room_type', align: 'left', sortable: true },
  { name: 'utilization_rate', label: 'Utilization', field: 'utilization_rate', align: 'center', sortable: true },
  { name: 'total_revenue', label: 'Revenue', field: 'total_revenue', align: 'right', sortable: true },
  { name: 'revenue_per_available_room', label: 'RevPAR', field: 'revenue_per_available_room', align: 'right', sortable: true },
  { name: 'average_daily_rate', label: 'ADR', field: 'average_daily_rate', align: 'right', sortable: true }
]

// Methods
const formatNumber = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat().format(Math.round(number))
}

const formatPercent = (number) => {
  if (!number) return '0'
  return Math.round(number * 100) / 100
}

const getUtilizationColor = (rate) => {
  if (rate >= 80) return 'positive'
  if (rate >= 60) return 'warning'
  return 'negative'
}

const getDateRange = () => {
  const today = new Date()
  let startDate, endDate

  switch (selectedPeriod.value) {
    case 'last_7_days':
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      endDate = today
      break
    case 'last_30_days':
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      endDate = today
      break
    case 'last_3_months':
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      endDate = today
      break
    case 'this_year':
      startDate = new Date(today.getFullYear(), 0, 1)
      endDate = today
      break
    case 'custom':
      startDate = new Date(customStartDate.value)
      endDate = new Date(customEndDate.value)
      break
    default:
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      endDate = today
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

const onPeriodChange = () => {
  if (selectedPeriod.value === 'custom') {
    const today = new Date()
    customEndDate.value = today.toISOString().split('T')[0]
    customStartDate.value = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  } else {
    loadAllData()
  }
}

const loadAllData = async () => {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange()
    
    console.log(`📊 Loading analytics data for ${startDate} to ${endDate}...`)
    
    // Load all analytics data in parallel with individual error handling
    const results = await Promise.allSettled([
      analyticsService.getRevenueReport(startDate, endDate, 'day'),
      analyticsService.getOccupancyReport(startDate, endDate, 'day'),
      analyticsService.getReservationReport(startDate, endDate, 'day'),
      analyticsService.getBookingSourceAnalysis(startDate, endDate),
      analyticsService.getGuestAnalytics(startDate, endDate),
      analyticsService.getRoomPerformanceReport(startDate, endDate)
    ])

    // Process results and handle individual failures gracefully
    const [
      revenueResult,
      occupancyResult,
      reservationResult,
      bookingSourceResult,
      guestResult,
      roomResult
    ] = results

    // Check if all requests failed (likely server not running)
    const failedCount = results.filter(result => result.status === 'rejected').length
    const allFailed = failedCount === results.length
    
    if (allFailed) {
      console.warn('🔴 All API requests failed - Laravel server may not be running')
      console.warn('📱 Switching to offline mode with sample data')
      
      // Use comprehensive sample data when all APIs fail
      loadSampleData()
      return
    }

    // Update metrics with available data
    const revenueData = revenueResult.status === 'fulfilled' ? revenueResult.value : { summary: {}, data: [] }
    const occupancyData = occupancyResult.status === 'fulfilled' ? occupancyResult.value : { summary: {}, data: [] }
    const reservationData = reservationResult.status === 'fulfilled' ? reservationResult.value : { summary: {}, data: [] }

    metrics.value = {
      totalRevenue: revenueData.summary?.total_revenue || 0,
      avgOccupancy: occupancyData.summary?.average_occupancy || 0,
      totalReservations: reservationData.summary?.total_reservations || 0,
      avgDailyRate: reservationData.summary?.average_reservation_value || 0
    }

    // Update chart data
    revenueChartData.value = revenueData.data || []
    occupancyChartData.value = occupancyData.data || []
    
    // Update other data
    bookingSources.value = bookingSourceResult.status === 'fulfilled' ? bookingSourceResult.value.data || [] : []
    guestAnalytics.value = guestResult.status === 'fulfilled' ? guestResult.value || {} : {}
    roomPerformance.value = roomResult.status === 'fulfilled' ? roomResult.value || {} : {}

    // Update charts
    await nextTick()
    updateCharts()

    // Show warning if some data failed to load
    if (failedCount > 0) {
      console.warn(`⚠️ Some analytics data could not be loaded (${failedCount} failed). Please check your connection.`)
    } else {
      console.log('✅ All analytics data loaded successfully')
      isOfflineMode.value = false
    }

  } catch (error) {
    console.error('❌ Failed to load analytics data:', error)
    console.warn('📱 Loading sample data for offline mode')
    loadSampleData()
  } finally {
    loading.value = false
  }
}

// Add sample data loading function
const loadSampleData = () => {
  console.log('📊 Loading sample analytics data...')
  isOfflineMode.value = true
  
  // Sample metrics
  metrics.value = {
    totalRevenue: 45750,
    avgOccupancy: 78.5,
    totalReservations: 156,
    avgDailyRate: 125.50
  }
  
  // Sample revenue chart data
  revenueChartData.value = [
    { period: 'Dec 2', reservation_revenue: 2450 },
    { period: 'Dec 3', reservation_revenue: 3200 },
    { period: 'Dec 4', reservation_revenue: 2800 },
    { period: 'Dec 5', reservation_revenue: 3600 },
    { period: 'Dec 6', reservation_revenue: 4100 },
    { period: 'Dec 7', reservation_revenue: 3850 },
    { period: 'Dec 8', reservation_revenue: 4200 }
  ]
  
  // Sample occupancy chart data
  occupancyChartData.value = [
    { period: 'Dec 2', occupancy_rate: 75 },
    { period: 'Dec 3', occupancy_rate: 82 },
    { period: 'Dec 4', occupancy_rate: 68 },
    { period: 'Dec 5', occupancy_rate: 85 },
    { period: 'Dec 6', occupancy_rate: 92 },
    { period: 'Dec 7', occupancy_rate: 78 },
    { period: 'Dec 8', occupancy_rate: 88 }
  ]
  
  // Sample booking sources
  bookingSources.value = [
    { source: 'Direct', reservations: 45, revenue: 15750, revenue_percentage: 34.4 },
    { source: 'Booking.com', reservations: 38, revenue: 13200, revenue_percentage: 28.8 },
    { source: 'Expedia', reservations: 28, revenue: 9800, revenue_percentage: 21.4 },
    { source: 'Airbnb', reservations: 22, revenue: 7000, revenue_percentage: 15.3 }
  ]
  
  // Sample guest analytics
  guestAnalytics.value = {
    summary: {
      total_guests: 156,
      new_guests: 89,
      returning_guests: 67,
      vip_guests: 12
    }
  }
  
  // Sample room performance
  roomPerformance.value = {
    data: [
      { room_id: 101, room_number: '101', room_type: 'Standard', utilization_rate: 85, total_revenue: 2450, revenue_per_available_room: 122.5, average_daily_rate: 145 },
      { room_id: 102, room_number: '102', room_type: 'Deluxe', utilization_rate: 92, total_revenue: 3200, revenue_per_available_room: 160, average_daily_rate: 175 },
      { room_id: 201, room_number: '201', room_type: 'Suite', utilization_rate: 78, total_revenue: 4100, revenue_per_available_room: 205, average_daily_rate: 265 }
    ]
  }
  
  // Update charts with sample data
  nextTick(() => {
    updateCharts()
  })
  
  console.log('✅ Sample analytics data loaded successfully')
}

const updateCharts = () => {
  updateRevenueChart()
  updateOccupancyChart()
}

const updateRevenueChart = () => {
  if (!revenueChart.value || revenueChartData.value.length === 0) return

  const ctx = revenueChart.value.getContext('2d')
  
  if (revenueChartInstance) {
    revenueChartInstance.destroy()
  }

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: revenueChartData.value.map(item => item.period),
      datasets: [{
        label: 'Revenue',
        data: revenueChartData.value.map(item => item.reservation_revenue),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + formatNumber(value)
            }
          }
        }
      }
    }
  })
}

const updateOccupancyChart = () => {
  if (!occupancyChart.value || occupancyChartData.value.length === 0) return

  const ctx = occupancyChart.value.getContext('2d')
  
  if (occupancyChartInstance) {
    occupancyChartInstance.destroy()
  }

  occupancyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: occupancyChartData.value.map(item => item.period),
      datasets: [{
        label: 'Occupancy Rate',
        data: occupancyChartData.value.map(item => item.occupancy_rate),
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        borderColor: '#9c27b0',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.analytics-dashboard {
  padding: 0;
}

.metric-card {
  height: 120px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-container canvas {
  max-height: 300px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
  
  .metric-card {
    height: 100px;
  }
}
</style>