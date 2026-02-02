<template>
  <DashboardWidget
    title="Revenue Tracking"
    :subtitle="`Period: ${selectedPeriod}`"
    :loading="loading"
    :error="error"
    size="large"
    :actions="[
      { name: 'export', icon: 'download', tooltip: 'Export Data' },
      { name: 'settings', icon: 'settings', tooltip: 'Settings' }
    ]"
    @refresh="fetchRevenueData"
    @action="handleAction"
  >
    <div class="revenue-display">
      <!-- Period Selector -->
      <div class="period-selector q-mb-md">
        <q-btn-toggle
          v-model="selectedPeriod"
          :options="periodOptions"
          @update:model-value="fetchRevenueData"
          color="primary"
          outline
        />
      </div>

      <!-- Revenue Summary Cards -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="revenue-card total">
            <q-card-section>
              <div class="revenue-icon">
                <q-icon name="attach_money" size="md" />
              </div>
              <div class="revenue-amount">${{ formatNumber(revenueData.total) }}</div>
              <div class="revenue-label">Total Revenue</div>
              <div class="revenue-change" :class="revenueData.totalChange >= 0 ? 'positive' : 'negative'">
                <q-icon :name="revenueData.totalChange >= 0 ? 'trending_up' : 'trending_down'" />
                {{ Math.abs(revenueData.totalChange) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="revenue-card rooms">
            <q-card-section>
              <div class="revenue-icon">
                <q-icon name="hotel" size="md" />
              </div>
              <div class="revenue-amount">${{ formatNumber(revenueData.rooms) }}</div>
              <div class="revenue-label">Room Revenue</div>
              <div class="revenue-percentage">{{ roomRevenuePercentage }}%</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="revenue-card services">
            <q-card-section>
              <div class="revenue-icon">
                <q-icon name="room_service" size="md" />
              </div>
              <div class="revenue-amount">${{ formatNumber(revenueData.services) }}</div>
              <div class="revenue-label">Services</div>
              <div class="revenue-percentage">{{ serviceRevenuePercentage }}%</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="revenue-card other">
            <q-card-section>
              <div class="revenue-icon">
                <q-icon name="more_horiz" size="md" />
              </div>
              <div class="revenue-amount">${{ formatNumber(revenueData.other) }}</div>
              <div class="revenue-label">Other</div>
              <div class="revenue-percentage">{{ otherRevenuePercentage }}%</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="revenue-chart q-mb-md">
        <div class="chart-header">
          <div class="chart-title">Revenue Trend</div>
          <q-btn-toggle
            v-model="chartType"
            :options="chartTypeOptions"
            @update:model-value="updateChart"
            size="sm"
            outline
          />
        </div>
        <canvas ref="revenueCanvas" height="300"></canvas>
      </div>

      <!-- Revenue Breakdown -->
      <div class="row q-gutter-md">
        <div class="col-md-6">
          <q-card class="breakdown-card">
            <q-card-section>
              <div class="breakdown-title">Revenue by Source</div>
              <canvas ref="pieCanvas" height="200"></canvas>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-6">
          <q-card class="breakdown-card">
            <q-card-section>
              <div class="breakdown-title">Top Performing Categories</div>
              <div class="category-list">
                <div
                  v-for="category in revenueData.topCategories"
                  :key="category.name"
                  class="category-item"
                >
                  <div class="category-info">
                    <div class="category-name">{{ category.name }}</div>
                    <div class="category-amount">${{ formatNumber(category.amount) }}</div>
                  </div>
                  <div class="category-bar">
                    <div
                      class="category-progress"
                      :style="{ width: `${category.percentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import DashboardWidget from './DashboardWidget.vue'

Chart.register(...registerables)

const loading = ref(false)
const error = ref(null)
const selectedPeriod = ref('week')
const chartType = ref('line')
const revenueCanvas = ref(null)
const pieCanvas = ref(null)
let revenueChart = null
let pieChart = null

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' }
]

const chartTypeOptions = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
  { label: 'Area', value: 'area' }
]

const revenueData = ref({
  total: 0,
  totalChange: 0,
  rooms: 0,
  services: 0,
  other: 0,
  trend: [],
  topCategories: []
})

const roomRevenuePercentage = computed(() => {
  return revenueData.value.total > 0 
    ? Math.round((revenueData.value.rooms / revenueData.value.total) * 100)
    : 0
})

const serviceRevenuePercentage = computed(() => {
  return revenueData.value.total > 0 
    ? Math.round((revenueData.value.services / revenueData.value.total) * 100)
    : 0
})

const otherRevenuePercentage = computed(() => {
  return revenueData.value.total > 0 
    ? Math.round((revenueData.value.other / revenueData.value.total) * 100)
    : 0
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

const fetchRevenueData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data
    revenueData.value = {
      total: 125000,
      totalChange: 12.5,
      rooms: 85000,
      services: 30000,
      other: 10000,
      trend: generateMockTrend(),
      topCategories: [
        { name: 'Standard Rooms', amount: 45000, percentage: 100 },
        { name: 'Deluxe Rooms', amount: 40000, percentage: 89 },
        { name: 'Restaurant', amount: 18000, percentage: 40 },
        { name: 'Spa Services', amount: 12000, percentage: 27 },
        { name: 'Conference Rooms', amount: 10000, percentage: 22 }
      ]
    }
    
    await nextTick()
    updateCharts()
  } catch (err) {
    error.value = 'Failed to load revenue data'
    console.error('Revenue data error:', err)
  } finally {
    loading.value = false
  }
}

const generateMockTrend = () => {
  const trend = []
  const periods = selectedPeriod.value === 'today' ? 24 : 
                 selectedPeriod.value === 'week' ? 7 :
                 selectedPeriod.value === 'month' ? 30 : 12
  
  for (let i = 0; i < periods; i++) {
    trend.push({
      label: selectedPeriod.value === 'today' ? `${i}:00` : 
             selectedPeriod.value === 'week' ? `Day ${i + 1}` :
             selectedPeriod.value === 'month' ? `${i + 1}` : `Month ${i + 1}`,
      rooms: Math.floor(Math.random() * 5000) + 2000,
      services: Math.floor(Math.random() * 2000) + 500,
      other: Math.floor(Math.random() * 1000) + 200
    })
  }
  
  return trend
}

const updateCharts = () => {
  updateRevenueChart()
  updatePieChart()
}

const updateRevenueChart = () => {
  if (!revenueCanvas.value) return
  
  const ctx = revenueCanvas.value.getContext('2d')
  
  if (revenueChart) {
    revenueChart.destroy()
  }
  
  const chartConfig = {
    type: chartType.value === 'area' ? 'line' : chartType.value,
    data: {
      labels: revenueData.value.trend.map(t => t.label),
      datasets: [
        {
          label: 'Rooms',
          data: revenueData.value.trend.map(t => t.rooms),
          borderColor: '#1976d2',
          backgroundColor: chartType.value === 'area' ? 'rgba(25, 118, 210, 0.1)' : '#1976d2',
          fill: chartType.value === 'area'
        },
        {
          label: 'Services',
          data: revenueData.value.trend.map(t => t.services),
          borderColor: '#388e3c',
          backgroundColor: chartType.value === 'area' ? 'rgba(56, 142, 60, 0.1)' : '#388e3c',
          fill: chartType.value === 'area'
        },
        {
          label: 'Other',
          data: revenueData.value.trend.map(t => t.other),
          borderColor: '#f57c00',
          backgroundColor: chartType.value === 'area' ? 'rgba(245, 124, 0, 0.1)' : '#f57c00',
          fill: chartType.value === 'area'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': $' + context.parsed.y.toLocaleString()
            }
          }
        }
      }
    }
  }
  
  revenueChart = new Chart(ctx, chartConfig)
}

const updatePieChart = () => {
  if (!pieCanvas.value) return
  
  const ctx = pieCanvas.value.getContext('2d')
  
  if (pieChart) {
    pieChart.destroy()
  }
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Rooms', 'Services', 'Other'],
      datasets: [{
        data: [
          revenueData.value.rooms,
          revenueData.value.services,
          revenueData.value.other
        ],
        backgroundColor: ['#1976d2', '#388e3c', '#f57c00'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((context.parsed / total) * 100)
              return context.label + ': $' + context.parsed.toLocaleString() + ' (' + percentage + '%)'
            }
          }
        }
      }
    }
  })
}

const updateChart = () => {
  updateRevenueChart()
}

const handleAction = (action) => {
  switch (action) {
    case 'export':
      exportData()
      break
    case 'settings':
      showSettings()
      break
  }
}

const exportData = () => {
  // Implement export functionality
  console.log('Exporting revenue data...')
}

const showSettings = () => {
  // Implement settings modal
  console.log('Showing settings...')
}

onMounted(() => {
  fetchRevenueData()
})

onUnmounted(() => {
  if (revenueChart) {
    revenueChart.destroy()
  }
  if (pieChart) {
    pieChart.destroy()
  }
})
</script>

<style lang="scss" scoped>
.revenue-display {
  .period-selector {
    display: flex;
    justify-content: center;
  }
  
  .revenue-card {
    height: 100%;
    
    &.total {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
    }
    
    &.rooms {
      background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
      color: white;
    }
    
    &.services {
      background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
      color: white;
    }
    
    &.other {
      background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
      color: white;
    }
    
    .revenue-icon {
      text-align: center;
      margin-bottom: 8px;
      opacity: 0.8;
    }
    
    .revenue-amount {
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      line-height: 1;
    }
    
    .revenue-label {
      font-size: 0.875rem;
      text-align: center;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    .revenue-change {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
      font-size: 0.875rem;
      
      &.positive {
        color: #4caf50;
      }
      
      &.negative {
        color: #f44336;
      }
      
      .q-icon {
        margin-right: 4px;
      }
    }
    
    .revenue-percentage {
      text-align: center;
      margin-top: 8px;
      font-size: 0.875rem;
      opacity: 0.8;
    }
  }
  
  .revenue-chart {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .chart-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--q-dark);
      }
    }
  }
  
  .breakdown-card {
    height: 100%;
    
    .breakdown-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--q-dark);
    }
    
    .category-list {
      .category-item {
        margin-bottom: 16px;
        
        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          
          .category-name {
            font-size: 0.875rem;
            color: var(--q-dark);
          }
          
          .category-amount {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--q-primary);
          }
        }
        
        .category-bar {
          height: 6px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
          overflow: hidden;
          
          .category-progress {
            height: 100%;
            background: linear-gradient(90deg, #1976d2, #42a5f5);
            transition: width 0.3s ease;
          }
        }
      }
    }
  }
}
</style>