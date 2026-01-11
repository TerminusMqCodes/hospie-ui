<template>
  <DashboardWidget
    title="Real-time Occupancy"
    :subtitle="`Updated ${lastUpdated}`"
    :loading="loading"
    :error="error"
    size="medium"
    @refresh="fetchOccupancyData"
  >
    <div class="occupancy-display">
      <!-- Summary Cards -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col">
          <q-card class="occupancy-card occupied">
            <q-card-section class="text-center">
              <div class="occupancy-number">{{ occupancyData.occupied }}</div>
              <div class="occupancy-label">Occupied</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="occupancy-card available">
            <q-card-section class="text-center">
              <div class="occupancy-number">{{ occupancyData.available }}</div>
              <div class="occupancy-label">Available</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col">
          <q-card class="occupancy-card maintenance">
            <q-card-section class="text-center">
              <div class="occupancy-number">{{ occupancyData.maintenance }}</div>
              <div class="occupancy-label">Maintenance</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Occupancy Rate Gauge -->
      <div class="occupancy-gauge q-mb-md">
        <canvas ref="gaugeCanvas" width="200" height="100"></canvas>
        <div class="gauge-label">
          <div class="rate-percentage">{{ occupancyRate }}%</div>
          <div class="rate-text">Occupancy Rate</div>
        </div>
      </div>

      <!-- Room Status Grid -->
      <div class="room-grid">
        <div
          v-for="room in occupancyData.rooms"
          :key="room.id"
          :class="['room-item', `status-${room.status}`]"
          @click="showRoomDetails(room)"
        >
          <div class="room-number">{{ room.number }}</div>
          <div class="room-type">{{ room.type }}</div>
          <q-tooltip>
            <div>Room {{ room.number }}</div>
            <div>Type: {{ room.type }}</div>
            <div>Status: {{ room.status }}</div>
            <div v-if="room.guest">Guest: {{ room.guest }}</div>
            <div v-if="room.checkOut">Check-out: {{ room.checkOut }}</div>
          </q-tooltip>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="occupancy-trend q-mt-md">
        <div class="trend-title">24-Hour Occupancy Trend</div>
        <canvas ref="trendCanvas" height="100"></canvas>
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
const lastUpdated = ref('')
const gaugeCanvas = ref(null)
const trendCanvas = ref(null)
let gaugeChart = null
let trendChart = null
let updateInterval = null

const occupancyData = ref({
  occupied: 0,
  available: 0,
  maintenance: 0,
  rooms: [],
  trend: []
})

const occupancyRate = computed(() => {
  const total = occupancyData.value.occupied + occupancyData.value.available + occupancyData.value.maintenance
  return total > 0 ? Math.round((occupancyData.value.occupied / total) * 100) : 0
})

const fetchOccupancyData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - replace with actual API response
    occupancyData.value = {
      occupied: 45,
      available: 12,
      maintenance: 3,
      rooms: generateMockRooms(),
      trend: generateMockTrend()
    }
    
    lastUpdated.value = new Date().toLocaleTimeString()
    
    await nextTick()
    updateCharts()
  } catch (err) {
    error.value = 'Failed to load occupancy data'
    console.error('Occupancy data error:', err)
  } finally {
    loading.value = false
  }
}

const generateMockRooms = () => {
  const rooms = []
  const statuses = ['occupied', 'available', 'maintenance', 'cleaning']
  const types = ['Standard', 'Deluxe', 'Suite', 'Presidential']
  
  for (let i = 1; i <= 60; i++) {
    rooms.push({
      id: i,
      number: `${Math.floor(i / 10) + 1}${(i % 10).toString().padStart(2, '0')}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      guest: Math.random() > 0.5 ? `Guest ${i}` : null,
      checkOut: Math.random() > 0.7 ? '14:00' : null
    })
  }
  
  return rooms
}

const generateMockTrend = () => {
  const trend = []
  for (let i = 0; i < 24; i++) {
    trend.push({
      hour: i,
      occupancy: Math.floor(Math.random() * 30) + 40
    })
  }
  return trend
}

const updateCharts = () => {
  updateGaugeChart()
  updateTrendChart()
}

const updateGaugeChart = () => {
  if (!gaugeCanvas.value) return
  
  const ctx = gaugeCanvas.value.getContext('2d')
  
  if (gaugeChart) {
    gaugeChart.destroy()
  }
  
  gaugeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [occupancyRate.value, 100 - occupancyRate.value],
        backgroundColor: ['#1976d2', '#e0e0e0'],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  })
}

const updateTrendChart = () => {
  if (!trendCanvas.value) return
  
  const ctx = trendCanvas.value.getContext('2d')
  
  if (trendChart) {
    trendChart.destroy()
  }
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: occupancyData.value.trend.map(t => `${t.hour}:00`),
      datasets: [{
        label: 'Occupancy %',
        data: occupancyData.value.trend.map(t => t.occupancy),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const showRoomDetails = (room) => {
  // Emit event or show modal with room details
  console.log('Room details:', room)
}

onMounted(() => {
  fetchOccupancyData()
  
  // Auto-refresh every 30 seconds
  updateInterval = setInterval(fetchOccupancyData, 30000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  if (gaugeChart) {
    gaugeChart.destroy()
  }
  if (trendChart) {
    trendChart.destroy()
  }
})
</script>

<style lang="scss" scoped>
.occupancy-display {
  .occupancy-card {
    border-radius: 8px;
    
    &.occupied {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
    }
    
    &.available {
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
      color: white;
    }
    
    &.maintenance {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
    }
    
    .occupancy-number {
      font-size: 2rem;
      font-weight: bold;
      line-height: 1;
    }
    
    .occupancy-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
  
  .occupancy-gauge {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .gauge-label {
      position: absolute;
      text-align: center;
      
      .rate-percentage {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--q-primary);
      }
      
      .rate-text {
        font-size: 0.75rem;
        color: var(--q-dark);
        opacity: 0.7;
      }
    }
  }
  
  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
    
    .room-item {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.75rem;
      
      &:hover {
        transform: scale(1.05);
      }
      
      .room-number {
        font-weight: bold;
        line-height: 1;
      }
      
      .room-type {
        font-size: 0.6rem;
        opacity: 0.8;
      }
      
      &.status-occupied {
        background: #f44336;
        color: white;
      }
      
      &.status-available {
        background: #4caf50;
        color: white;
      }
      
      &.status-maintenance {
        background: #ff9800;
        color: white;
      }
      
      &.status-cleaning {
        background: #2196f3;
        color: white;
      }
    }
  }
  
  .occupancy-trend {
    .trend-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--q-dark);
    }
  }
}
</style>