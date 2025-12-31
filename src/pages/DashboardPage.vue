<template>
  <q-page class="q-pa-md dashboard-page">
    <div class="row q-gutter-lg">
      <!-- Welcome Section -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section>
            <div class="text-h4 text-weight-light welcome-title">
              Welcome back, {{ authStore.userName }}! 👋
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm welcome-subtitle">
              Here's what's happening with your property today
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" @click="$router.push('/reservations')">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 stat-title">Today's Arrivals</div>
                <div class="text-h4 text-primary stat-value">{{ dashboardStats.arrivals }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="flight_land" size="40px" color="primary" class="stat-icon" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" @click="$router.push('/reservations')">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 stat-title">Departures</div>
                <div class="text-h4 text-secondary stat-value">{{ dashboardStats.departures }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="flight_takeoff" size="40px" color="secondary" class="stat-icon" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" @click="$router.push('/rooms/status')">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 stat-title">Occupancy</div>
                <div class="text-h4 text-positive stat-value">{{ dashboardStats.occupancy }}%</div>
              </div>
              <div class="col-auto">
                <q-icon name="hotel" size="40px" color="positive" class="stat-icon" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" @click="$router.push('/finance')">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 stat-title">Revenue</div>
                <div class="text-h4 text-accent stat-value">${{ formatNumber(dashboardStats.revenue) }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="attach_money" size="40px" color="accent" class="stat-icon" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Automated Invoicing Dashboard -->
      <div class="col-12">
        <AutomatedInvoicingDashboard />
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="row q-gutter-sm quick-actions">
              <div class="col-12 col-sm-6 col-md-3 col-lg-6">
                <q-btn 
                  color="primary" 
                  icon="add" 
                  label="New Reservation" 
                  class="full-width"
                  @click="$router.push('/reservations/create')"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3 col-lg-6">
                <q-btn 
                  color="secondary" 
                  icon="hotel" 
                  label="Room Status" 
                  outline
                  class="full-width"
                  @click="$router.push('/rooms/status')"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3 col-lg-6">
                <q-btn 
                  color="accent" 
                  icon="person_add" 
                  label="Check In" 
                  outline
                  class="full-width"
                  @click="showCheckInDialog = true"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3 col-lg-6">
                <q-btn 
                  color="info" 
                  icon="logout" 
                  label="Check Out" 
                  outline
                  class="full-width"
                  @click="showCheckOutDialog = true"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Activity</div>
            <q-list>
              <q-item v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <q-item-section avatar>
                  <q-icon :name="activity.icon" :color="activity.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="activity-title">{{ activity.title }}</q-item-label>
                  <q-item-label caption class="activity-description">{{ activity.description }} • {{ formatTime(activity.time) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Today's Schedule -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Today's Schedule</div>
            <q-timeline color="primary" class="schedule-timeline">
              <q-timeline-entry
                v-for="event in todaysSchedule"
                :key="event.id"
                :title="event.title"
                :subtitle="event.time"
                :icon="event.icon"
                :color="event.color"
                class="schedule-entry"
              >
                <div class="schedule-description">{{ event.description }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>

      <!-- Room Status Overview -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Status Overview</div>
            <div class="row q-gutter-md room-status-grid">
              <div class="col-6 col-sm-3 col-lg-6">
                <div class="text-center room-status-item">
                  <q-circular-progress
                    :value="roomStats.available"
                    size="60px"
                    :thickness="0.15"
                    color="positive"
                    track-color="grey-3"
                  >
                    <div class="text-h6">{{ roomStats.available }}</div>
                  </q-circular-progress>
                  <div class="text-caption q-mt-xs">Available</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-3 col-lg-6">
                <div class="text-center room-status-item">
                  <q-circular-progress
                    :value="roomStats.occupied"
                    size="60px"
                    :thickness="0.15"
                    color="negative"
                    track-color="grey-3"
                  >
                    <div class="text-h6">{{ roomStats.occupied }}</div>
                  </q-circular-progress>
                  <div class="text-caption q-mt-xs">Occupied</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-3 col-lg-6">
                <div class="text-center room-status-item">
                  <q-circular-progress
                    :value="roomStats.cleaning"
                    size="60px"
                    :thickness="0.15"
                    color="warning"
                    track-color="grey-3"
                  >
                    <div class="text-h6">{{ roomStats.cleaning }}</div>
                  </q-circular-progress>
                  <div class="text-caption q-mt-xs">Cleaning</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-3 col-lg-6">
                <div class="text-center room-status-item">
                  <q-circular-progress
                    :value="roomStats.maintenance"
                    size="60px"
                    :thickness="0.15"
                    color="info"
                    track-color="grey-3"
                  >
                    <div class="text-h6">{{ roomStats.maintenance }}</div>
                  </q-circular-progress>
                  <div class="text-caption q-mt-xs">Maintenance</div>
                </div>
              </div>
            </div>
            
            <div class="q-mt-md text-center">
              <q-btn 
                color="primary" 
                label="View Full Status" 
                outline 
                class="full-width-mobile"
                @click="$router.push('/rooms/status')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Check-In Dialog -->
    <q-dialog v-model="showCheckInDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Quick Check-In</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedReservation"
            :options="todaysArrivals"
            option-label="guest_name"
            option-value="id"
            label="Select Reservation"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCheckInDialog = false" />
          <q-btn 
            color="primary" 
            label="Check In" 
            @click="quickCheckIn"
            :disable="!selectedReservation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Quick Check-Out Dialog -->
    <q-dialog v-model="showCheckOutDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Quick Check-Out</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedCheckOut"
            :options="todaysDepartures"
            option-label="guest_name"
            option-value="id"
            label="Select Guest"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCheckOutDialog = false" />
          <q-btn 
            color="secondary" 
            label="Check Out" 
            @click="quickCheckOut"
            :disable="!selectedCheckOut"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import AutomatedInvoicingDashboard from 'src/components/AutomatedInvoicingDashboard.vue'

const authStore = useAuthStore()
const $q = useQuasar()

// Reactive data
const showCheckInDialog = ref(false)
const showCheckOutDialog = ref(false)
const selectedReservation = ref(null)
const selectedCheckOut = ref(null)

// Mock data - in real app this would come from API
const dashboardStats = ref({
  arrivals: 12,
  departures: 8,
  occupancy: 85,
  revenue: 2450
})

const roomStats = ref({
  available: 15,
  occupied: 45,
  cleaning: 8,
  maintenance: 2
})

const recentActivities = ref([
  {
    id: 1,
    title: 'John Doe checked in',
    description: 'Room 101',
    time: new Date(Date.now() - 2 * 60 * 1000),
    icon: 'check_circle',
    color: 'positive'
  },
  {
    id: 2,
    title: 'New reservation created',
    description: 'Jane Smith',
    time: new Date(Date.now() - 15 * 60 * 1000),
    icon: 'event',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Room 205 cleaning completed',
    description: 'Housekeeping',
    time: new Date(Date.now() - 60 * 60 * 1000),
    icon: 'cleaning_services',
    color: 'warning'
  },
  {
    id: 4,
    title: 'Payment received',
    description: '$450 from Robert Johnson',
    time: new Date(Date.now() - 90 * 60 * 1000),
    icon: 'payment',
    color: 'accent'
  }
])

const todaysSchedule = ref([
  {
    id: 1,
    title: 'Morning Briefing',
    time: '09:00 AM',
    description: 'Daily staff meeting',
    icon: 'groups',
    color: 'primary'
  },
  {
    id: 2,
    title: 'VIP Guest Arrival',
    time: '02:00 PM',
    description: 'Mr. Anderson - Suite 501',
    icon: 'star',
    color: 'accent'
  },
  {
    id: 3,
    title: 'Maintenance Check',
    time: '04:00 PM',
    description: 'HVAC system inspection',
    icon: 'build',
    color: 'info'
  }
])

const todaysArrivals = ref([
  { id: 1, guest_name: 'John Doe', room: '101', time: '2:00 PM' },
  { id: 2, guest_name: 'Jane Smith', room: '205', time: '3:30 PM' },
  { id: 3, guest_name: 'Bob Wilson', room: '301', time: '4:15 PM' }
])

const todaysDepartures = ref([
  { id: 1, guest_name: 'Alice Brown', room: '102', time: '11:00 AM' },
  { id: 2, guest_name: 'Carol Davis', room: '203', time: '12:00 PM' }
])

// Methods
const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number)
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

const quickCheckIn = async () => {
  if (!selectedReservation.value) return
  
  try {
    // In real app, call API
    $q.notify({
      type: 'positive',
      message: `${selectedReservation.value.guest_name} checked in successfully`
    })
    
    showCheckInDialog.value = false
    selectedReservation.value = null
    
    // Update stats
    dashboardStats.value.arrivals--
    roomStats.value.available--
    roomStats.value.occupied++
    
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to check in guest'
    })
  }
}

const quickCheckOut = async () => {
  if (!selectedCheckOut.value) return
  
  try {
    // In real app, call API
    $q.notify({
      type: 'positive',
      message: `${selectedCheckOut.value.guest_name} checked out successfully`
    })
    
    showCheckOutDialog.value = false
    selectedCheckOut.value = null
    
    // Update stats
    dashboardStats.value.departures--
    roomStats.value.occupied--
    roomStats.value.cleaning++
    
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to check out guest'
    })
  }
}

// Lifecycle
onMounted(() => {
  // In real app, fetch dashboard data from API
})
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-title {
  font-size: 2rem;
}

.welcome-subtitle {
  font-size: 1rem;
}

.stat-card {
  height: 120px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-title {
  font-size: 1rem;
}

.stat-value {
  font-size: 1.8rem;
}

.stat-icon {
  font-size: 40px;
}

.quick-actions .q-btn {
  min-height: 48px;
}

.activity-item {
  padding: 8px 0;
}

.activity-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.activity-description {
  font-size: 0.8rem;
}

.schedule-timeline {
  padding-left: 0;
}

.schedule-entry {
  margin-bottom: 16px;
}

.schedule-description {
  font-size: 0.9rem;
  color: #666;
}

.room-status-grid {
  justify-content: center;
}

.room-status-item {
  padding: 8px;
}

.dialog-card {
  min-width: 300px;
  max-width: 90vw;
}

.full-width-mobile {
  width: 100%;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 8px;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .stat-card {
    height: 100px;
  }
  
  .stat-title {
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    font-size: 32px;
  }
  
  .quick-actions .q-btn {
    font-size: 0.8rem;
    min-height: 40px;
  }
  
  .room-status-item .q-circular-progress {
    transform: scale(0.8);
  }
  
  .dialog-card {
    margin: 16px;
  }
}

@media (max-width: 600px) {
  .row.q-gutter-lg > div {
    margin-bottom: 16px;
  }
  
  .col-12.col-sm-6.col-md-3,
  .col-12.col-lg-6 {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .q-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 400px) {
  .stat-card .q-card-section {
    padding: 12px;
  }
  
  .welcome-card .q-card-section {
    padding: 16px;
  }
  
  .room-status-grid {
    justify-content: space-around;
  }
  
  .room-status-item .q-circular-progress {
    transform: scale(0.7);
  }
}
</style>