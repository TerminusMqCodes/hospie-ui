<template>
  <DashboardWidget
    title="Staff Performance"
    :subtitle="`${performanceData.totalStaff} active staff members`"
    :loading="loading"
    :error="error"
    size="large"
    :actions="[
      { name: 'export', icon: 'download', tooltip: 'Export Report' },
      { name: 'manage', icon: 'people', tooltip: 'Manage Staff' }
    ]"
    @refresh="fetchPerformanceData"
    @action="handleAction"
  >
    <div class="performance-display">
      <!-- Performance Overview -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="performance-card overall">
            <q-card-section class="text-center">
              <div class="performance-icon">
                <q-icon name="trending_up" size="md" />
              </div>
              <div class="performance-score">{{ performanceData.overallScore }}%</div>
              <div class="performance-label">Overall Performance</div>
              <div class="performance-change" :class="performanceData.overallChange >= 0 ? 'positive' : 'negative'">
                <q-icon :name="performanceData.overallChange >= 0 ? 'arrow_upward' : 'arrow_downward'" />
                {{ Math.abs(performanceData.overallChange) }}%
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="performance-card productivity">
            <q-card-section class="text-center">
              <div class="performance-icon">
                <q-icon name="speed" size="md" />
              </div>
              <div class="performance-score">{{ performanceData.productivity }}%</div>
              <div class="performance-label">Productivity</div>
              <div class="performance-metric">{{ performanceData.tasksCompleted }} tasks/day</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="performance-card satisfaction">
            <q-card-section class="text-center">
              <div class="performance-icon">
                <q-icon name="sentiment_satisfied" size="md" />
              </div>
              <div class="performance-score">{{ performanceData.satisfaction }}/5</div>
              <div class="performance-label">Guest Satisfaction</div>
              <div class="performance-metric">{{ performanceData.reviews }} reviews</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-card class="performance-card attendance">
            <q-card-section class="text-center">
              <div class="performance-icon">
                <q-icon name="schedule" size="md" />
              </div>
              <div class="performance-score">{{ performanceData.attendance }}%</div>
              <div class="performance-label">Attendance</div>
              <div class="performance-metric">{{ performanceData.onTimeRate }}% on-time</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Department Performance -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col-md-6">
          <q-card class="department-performance">
            <q-card-section>
              <div class="section-title">Department Performance</div>
              <canvas ref="departmentCanvas" height="200"></canvas>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-6">
          <q-card class="top-performers">
            <q-card-section>
              <div class="section-title">Top Performers</div>
              <div class="performers-list">
                <div
                  v-for="(performer, index) in performanceData.topPerformers"
                  :key="performer.id"
                  class="performer-item"
                >
                  <div class="performer-rank">{{ index + 1 }}</div>
                  <q-avatar size="40px" class="performer-avatar">
                    <img :src="performer.avatar" :alt="performer.name" />
                  </q-avatar>
                  <div class="performer-info">
                    <div class="performer-name">{{ performer.name }}</div>
                    <div class="performer-department">{{ performer.department }}</div>
                  </div>
                  <div class="performer-score">
                    <div class="score-number">{{ performer.score }}%</div>
                    <q-linear-progress
                      :value="performer.score / 100"
                      color="primary"
                      size="4px"
                      class="q-mt-xs"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Performance Metrics Grid -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col-md-8">
          <q-card class="performance-trends">
            <q-card-section>
              <div class="section-header">
                <div class="section-title">Performance Trends</div>
                <q-btn-toggle
                  v-model="selectedPeriod"
                  :options="periodOptions"
                  @update:model-value="updateTrendChart"
                  size="sm"
                  outline
                />
              </div>
              <canvas ref="trendCanvas" height="250"></canvas>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-md-4">
          <q-card class="performance-alerts">
            <q-card-section>
              <div class="section-title">Performance Alerts</div>
              <div class="alerts-list">
                <div
                  v-for="alert in performanceData.alerts"
                  :key="alert.id"
                  :class="['alert-item', `alert-${alert.type}`]"
                >
                  <q-icon :name="getAlertIcon(alert.type)" />
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-message">{{ alert.message }}</div>
                    <div class="alert-time">{{ formatTime(alert.time) }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Staff Performance Table -->
      <div class="staff-performance-table">
        <q-card>
          <q-card-section>
            <div class="section-header">
              <div class="section-title">Staff Performance Details</div>
              <q-input
                v-model="searchQuery"
                placeholder="Search staff..."
                outlined
                dense
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            
            <q-table
              :rows="filteredStaff"
              :columns="staffColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 10 }"
              class="performance-table"
            >
              <template v-slot:body-cell-avatar="props">
                <q-td :props="props">
                  <q-avatar size="32px">
                    <img :src="props.row.avatar" :alt="props.row.name" />
                  </q-avatar>
                </q-td>
              </template>
              
              <template v-slot:body-cell-performance="props">
                <q-td :props="props">
                  <div class="performance-cell">
                    <div class="performance-number">{{ props.row.performance }}%</div>
                    <q-linear-progress
                      :value="props.row.performance / 100"
                      :color="getPerformanceColor(props.row.performance)"
                      size="4px"
                    />
                  </div>
                </q-td>
              </template>
              
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="getStatusColor(props.row.status)"
                    :label="props.row.status"
                  />
                </q-td>
              </template>
              
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    icon="visibility"
                    flat
                    dense
                    @click="viewStaffDetails(props.row)"
                    tooltip="View Details"
                  />
                  <q-btn
                    icon="edit"
                    flat
                    dense
                    @click="editStaff(props.row)"
                    tooltip="Edit"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
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
const searchQuery = ref('')
const departmentCanvas = ref(null)
const trendCanvas = ref(null)
let departmentChart = null
let trendChart = null

const periodOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' }
]

const performanceData = ref({
  totalStaff: 0,
  overallScore: 0,
  overallChange: 0,
  productivity: 0,
  satisfaction: 0,
  attendance: 0,
  tasksCompleted: 0,
  reviews: 0,
  onTimeRate: 0,
  topPerformers: [],
  departments: [],
  alerts: [],
  staff: [],
  trendData: []
})

const staffColumns = [
  { name: 'avatar', label: '', field: 'avatar', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'department', label: 'Department', field: 'department', align: 'left', sortable: true },
  { name: 'position', label: 'Position', field: 'position', align: 'left', sortable: true },
  { name: 'performance', label: 'Performance', field: 'performance', align: 'center', sortable: true },
  { name: 'tasks', label: 'Tasks', field: 'tasksCompleted', align: 'center', sortable: true },
  { name: 'rating', label: 'Rating', field: 'guestRating', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const filteredStaff = computed(() => {
  if (!searchQuery.value) return performanceData.value.staff
  
  const query = searchQuery.value.toLowerCase()
  return performanceData.value.staff.filter(staff => 
    staff.name.toLowerCase().includes(query) ||
    staff.department.toLowerCase().includes(query) ||
    staff.position.toLowerCase().includes(query)
  )
})

const fetchPerformanceData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data
    performanceData.value = {
      totalStaff: 45,
      overallScore: 87,
      overallChange: 5.2,
      productivity: 92,
      satisfaction: 4.3,
      attendance: 96,
      tasksCompleted: 28,
      reviews: 156,
      onTimeRate: 94,
      topPerformers: [
        {
          id: 1,
          name: 'Sarah Johnson',
          department: 'Housekeeping',
          score: 98,
          avatar: 'https://cdn.quasar.dev/img/avatar2.jpg'
        },
        {
          id: 2,
          name: 'Mike Chen',
          department: 'Front Desk',
          score: 95,
          avatar: 'https://cdn.quasar.dev/img/avatar3.jpg'
        },
        {
          id: 3,
          name: 'Emma Wilson',
          department: 'Restaurant',
          score: 93,
          avatar: 'https://cdn.quasar.dev/img/avatar4.jpg'
        },
        {
          id: 4,
          name: 'David Brown',
          department: 'Maintenance',
          score: 91,
          avatar: 'https://cdn.quasar.dev/img/avatar5.jpg'
        },
        {
          id: 5,
          name: 'Lisa Garcia',
          department: 'Spa',
          score: 89,
          avatar: 'https://cdn.quasar.dev/img/avatar6.jpg'
        }
      ],
      departments: [
        { name: 'Housekeeping', performance: 92, staff: 12 },
        { name: 'Front Desk', performance: 88, staff: 8 },
        { name: 'Restaurant', performance: 85, staff: 15 },
        { name: 'Maintenance', performance: 90, staff: 6 },
        { name: 'Spa', performance: 87, staff: 4 }
      ],
      alerts: [
        {
          id: 1,
          type: 'warning',
          title: 'Low Performance Alert',
          message: 'John Doe performance dropped below 70%',
          time: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: 2,
          type: 'info',
          title: 'Training Reminder',
          message: '5 staff members need safety training',
          time: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          id: 3,
          type: 'success',
          title: 'Achievement',
          message: 'Housekeeping team exceeded targets',
          time: new Date(Date.now() - 1000 * 60 * 60 * 4)
        }
      ],
      staff: generateMockStaff(),
      trendData: generateMockTrendData()
    }
    
    await nextTick()
    updateCharts()
  } catch (err) {
    error.value = 'Failed to load performance data'
    console.error('Performance data error:', err)
  } finally {
    loading.value = false
  }
}

const generateMockStaff = () => {
  const departments = ['Housekeeping', 'Front Desk', 'Restaurant', 'Maintenance', 'Spa']
  const positions = ['Manager', 'Supervisor', 'Staff', 'Senior Staff', 'Trainee']
  const statuses = ['Active', 'On Break', 'Training', 'Vacation']
  
  return Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    name: `Staff Member ${i + 1}`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    performance: Math.floor(Math.random() * 40) + 60,
    tasksCompleted: Math.floor(Math.random() * 20) + 10,
    guestRating: (Math.random() * 2 + 3).toFixed(1),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    avatar: `https://cdn.quasar.dev/img/avatar${(i % 6) + 1}.jpg`
  }))
}

const generateMockTrendData = () => {
  const periods = selectedPeriod.value === 'week' ? 7 : 
                 selectedPeriod.value === 'month' ? 30 : 90
  
  return Array.from({ length: periods }, (_, i) => ({
    label: selectedPeriod.value === 'week' ? `Day ${i + 1}` :
           selectedPeriod.value === 'month' ? `${i + 1}` : `Week ${i + 1}`,
    overall: Math.floor(Math.random() * 20) + 80,
    productivity: Math.floor(Math.random() * 25) + 75,
    satisfaction: Math.floor(Math.random() * 30) + 70,
    attendance: Math.floor(Math.random() * 15) + 85
  }))
}

const updateCharts = () => {
  updateDepartmentChart()
  updateTrendChart()
}

const updateDepartmentChart = () => {
  if (!departmentCanvas.value) return
  
  const ctx = departmentCanvas.value.getContext('2d')
  
  if (departmentChart) {
    departmentChart.destroy()
  }
  
  departmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: performanceData.value.departments.map(d => d.name),
      datasets: [{
        label: 'Performance %',
        data: performanceData.value.departments.map(d => d.performance),
        backgroundColor: [
          '#1976d2',
          '#388e3c',
          '#f57c00',
          '#7b1fa2',
          '#d32f2f'
        ],
        borderRadius: 4
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

const updateTrendChart = () => {
  if (!trendCanvas.value) return
  
  const ctx = trendCanvas.value.getContext('2d')
  
  if (trendChart) {
    trendChart.destroy()
  }
  
  const trendData = generateMockTrendData()
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.map(t => t.label),
      datasets: [
        {
          label: 'Overall',
          data: trendData.map(t => t.overall),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4
        },
        {
          label: 'Productivity',
          data: trendData.map(t => t.productivity),
          borderColor: '#388e3c',
          backgroundColor: 'rgba(56, 142, 60, 0.1)',
          tension: 0.4
        },
        {
          label: 'Satisfaction',
          data: trendData.map(t => t.satisfaction),
          borderColor: '#f57c00',
          backgroundColor: 'rgba(245, 124, 0, 0.1)',
          tension: 0.4
        },
        {
          label: 'Attendance',
          data: trendData.map(t => t.attendance),
          borderColor: '#7b1fa2',
          backgroundColor: 'rgba(123, 31, 162, 0.1)',
          tension: 0.4
        }
      ]
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
          position: 'top'
        }
      }
    }
  })
}

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'success': return 'check_circle'
    default: return 'info'
  }
}

const getPerformanceColor = (performance) => {
  if (performance >= 90) return 'positive'
  if (performance >= 75) return 'warning'
  return 'negative'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'positive'
    case 'On Break': return 'warning'
    case 'Training': return 'info'
    case 'Vacation': return 'purple'
    default: return 'grey'
  }
}

const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const handleAction = (action) => {
  switch (action) {
    case 'export':
      exportReport()
      break
    case 'manage':
      manageStaff()
      break
  }
}

const exportReport = () => {
  console.log('Exporting performance report...')
}

const manageStaff = () => {
  console.log('Opening staff management...')
}

const viewStaffDetails = (staff) => {
  console.log('Viewing staff details:', staff)
}

const editStaff = (staff) => {
  console.log('Editing staff:', staff)
}

onMounted(() => {
  fetchPerformanceData()
})

onUnmounted(() => {
  if (departmentChart) {
    departmentChart.destroy()
  }
  if (trendChart) {
    trendChart.destroy()
  }
})
</script>

<style lang="scss" scoped>
.performance-display {
  .performance-card {
    height: 100%;
    
    &.overall {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
    }
    
    &.productivity {
      background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
      color: white;
    }
    
    &.satisfaction {
      background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
      color: white;
    }
    
    &.attendance {
      background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
      color: white;
    }
    
    .performance-icon {
      text-align: center;
      margin-bottom: 8px;
      opacity: 0.8;
    }
    
    .performance-score {
      font-size: 1.8rem;
      font-weight: bold;
      text-align: center;
      line-height: 1;
    }
    
    .performance-label {
      font-size: 0.875rem;
      text-align: center;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    .performance-change {
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
    
    .performance-metric {
      text-align: center;
      margin-top: 8px;
      font-size: 0.875rem;
      opacity: 0.8;
    }
  }
  
  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--q-dark);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .search-input {
      width: 250px;
    }
  }
  
  .department-performance {
    height: 100%;
  }
  
  .top-performers {
    height: 100%;
    
    .performers-list {
      .performer-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        
        &:last-child {
          border-bottom: none;
        }
        
        .performer-rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--q-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
          margin-right: 12px;
        }
        
        .performer-avatar {
          margin-right: 12px;
        }
        
        .performer-info {
          flex: 1;
          
          .performer-name {
            font-weight: 600;
            color: var(--q-dark);
            margin-bottom: 2px;
          }
          
          .performer-department {
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.7;
          }
        }
        
        .performer-score {
          text-align: right;
          min-width: 60px;
          
          .score-number {
            font-weight: bold;
            color: var(--q-primary);
            margin-bottom: 4px;
          }
        }
      }
    }
  }
  
  .performance-trends {
    height: 100%;
  }
  
  .performance-alerts {
    height: 100%;
    
    .alerts-list {
      max-height: 300px;
      overflow-y: auto;
      
      .alert-item {
        display: flex;
        align-items: flex-start;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        
        &.alert-warning {
          background: rgba(255, 152, 0, 0.1);
          border-left: 4px solid #ff9800;
        }
        
        &.alert-error {
          background: rgba(244, 67, 54, 0.1);
          border-left: 4px solid #f44336;
        }
        
        &.alert-success {
          background: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4caf50;
        }
        
        &.alert-info {
          background: rgba(33, 150, 243, 0.1);
          border-left: 4px solid #2196f3;
        }
        
        .q-icon {
          margin-right: 12px;
          margin-top: 2px;
        }
        
        .alert-content {
          flex: 1;
          
          .alert-title {
            font-weight: 600;
            color: var(--q-dark);
            margin-bottom: 4px;
          }
          
          .alert-message {
            font-size: 0.875rem;
            color: var(--q-dark);
            opacity: 0.8;
            margin-bottom: 4px;
          }
          
          .alert-time {
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.6;
          }
        }
      }
    }
  }
  
  .staff-performance-table {
    .performance-table {
      .performance-cell {
        .performance-number {
          font-weight: bold;
          margin-bottom: 4px;
        }
      }
    }
  }
}

.body--dark .performance-display {
  .performer-item {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .alert-item {
    &.alert-warning {
      background: rgba(255, 152, 0, 0.2);
    }
    
    &.alert-error {
      background: rgba(244, 67, 54, 0.2);
    }
    
    &.alert-success {
      background: rgba(76, 175, 80, 0.2);
    }
    
    &.alert-info {
      background: rgba(33, 150, 243, 0.2);
    }
  }
}
</style>