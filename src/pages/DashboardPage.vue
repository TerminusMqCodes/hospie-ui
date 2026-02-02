<template>
  <q-page class="q-pa-md dashboard-page">
    <div class="row q-col-gutter-lg">
      <!-- Welcome Section -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-h4 text-weight-light welcome-title">
                  {{ $t('pages.dashboard.welcome', { name: authStore.userName }) }}
                </div>
                <div class="text-subtitle1 q-mt-sm welcome-subtitle">
                  {{ $t('pages.dashboard.welcomeSubtitle') }}
                </div>
              </div>
              <div class="col-auto">
                <ConnectionStatus />
                <RealtimeUpdates 
                  class="q-ml-md"
                  @action-clicked="handleRealtimeAction"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Stats Cards -->
      <div class="col-12">
        <div class="row q-col-gutter-md stats-grid">
          <div class="col-12 col-sm-6">
            <q-card class="stat-card" @click="$router.push('/reservations')">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6 stat-title">{{ $t('pages.dashboard.todaysArrivals') }}</div>
                    <div class="text-h4 text-primary stat-value">{{ dashboardStats.arrivals }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="flight_land" size="40px" color="primary" class="stat-icon" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card class="stat-card" @click="$router.push('/reservations')">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6 stat-title">{{ $t('pages.dashboard.departures') }}</div>
                    <div class="text-h4 text-secondary stat-value">{{ dashboardStats.departures }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="flight_takeoff" size="40px" color="secondary" class="stat-icon" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card class="stat-card" @click="$router.push('/rooms/status')">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6 stat-title">{{ $t('pages.dashboard.occupancy') }}</div>
                    <div class="text-h4 text-positive stat-value">{{ dashboardStats.occupancy }}%</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="hotel" size="40px" color="positive" class="stat-icon" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card class="stat-card" @click="$router.push('/finance')">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6 stat-title">{{ $t('pages.dashboard.revenue') }}</div>
                    <div class="text-h4 text-accent stat-value">${{ formatNumber(dashboardStats.revenue) }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="attach_money" size="40px" color="accent" class="stat-icon" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Automated Invoicing Dashboard -->
      <div class="col-12">
        <AutomatedInvoicingDashboard />
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-lg-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('pages.dashboard.quickActions') }}</div>
            <div class="row q-col-gutter-sm quick-actions">
              <div class="col-6 col-sm-3 col-lg-6">
                <q-btn 
                  color="primary" 
                  icon="add" 
                  :label="$t('pages.dashboard.newReservation')" 
                  class="full-width"
                  @click="$router.push('/reservations/create')"
                />
              </div>
              <div class="col-6 col-sm-3 col-lg-6">
                <q-btn 
                  color="secondary" 
                  icon="hotel" 
                  :label="$t('pages.dashboard.roomStatus')" 
                  outline
                  class="full-width"
                  @click="$router.push('/rooms/status')"
                />
              </div>
              <div class="col-6 col-sm-3 col-lg-6">
                <q-btn 
                  color="accent" 
                  icon="person_add" 
                  :label="$t('pages.dashboard.checkIn')" 
                  outline
                  class="full-width"
                  @click="showCheckInDialog = true"
                />
              </div>
              <div class="col-6 col-sm-3 col-lg-6">
                <q-btn 
                  color="info" 
                  icon="logout" 
                  :label="$t('pages.dashboard.checkOut')" 
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
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('pages.dashboard.recentActivity') }}</div>
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
        <q-card class="full-height">
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
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Status Overview</div>
            <div class="row q-gutter-sm room-status-grid">
              <div class="col-6 col-sm-3">
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
              
              <div class="col-6 col-sm-3">
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
              
              <div class="col-6 col-sm-3">
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
              
              <div class="col-6 col-sm-3">
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
    <q-dialog 
      v-model="showCheckInDialog"
      transition-show="scale"
      transition-hide="scale"
      class="glass-dialog-backdrop"
    >
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
            :label="$t('pages.dashboard.checkIn')" 
            @click="quickCheckIn"
            :disable="!selectedReservation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Quick Check-Out Dialog -->
    <q-dialog 
      v-model="showCheckOutDialog"
      transition-show="scale"
      transition-hide="scale"
      class="glass-dialog-backdrop"
    >
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
            :label="$t('pages.dashboard.checkOut')" 
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
import { useI18n } from 'vue-i18n'
import AutomatedInvoicingDashboard from 'src/components/AutomatedInvoicingDashboard.vue'
import ConnectionStatus from 'src/components/WebSocket/ConnectionStatus.vue'
import RealtimeUpdates from 'src/components/WebSocket/RealtimeUpdates.vue'
import analyticsService from 'src/services/analyticsService'
import { useRoomUpdates, useReservationUpdates } from 'src/composables/useWebSocket'

const authStore = useAuthStore()
const { t: $t } = useI18n()

// Reactive data
const showCheckInDialog = ref(false)
const showCheckOutDialog = ref(false)
const selectedReservation = ref(null)
const selectedCheckOut = ref(null)
const loading = ref(false)

// Dashboard stats - will be loaded from API, with fallback values
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

const handleRealtimeAction = (action) => {
  switch (action.type) {
    case 'room_details':
      // Navigate to room details
      console.log('Navigate to room details:', action.roomId)
      break
    case 'reservation_details':
      // Navigate to reservation details
      console.log('Navigate to reservation details:', action.reservationId)
      break
    default:
      console.log('Unknown action:', action)
  }
}

const quickCheckIn = async () => {
  if (!selectedReservation.value) return
  
  try {
    // In real app, call API
    console.log(`${selectedReservation.value.guest_name} checked in successfully`)
    
    showCheckInDialog.value = false
    selectedReservation.value = null
    
    // Update stats
    dashboardStats.value.arrivals--
    roomStats.value.available--
    roomStats.value.occupied++
    
  } catch {
    console.error('Failed to check in guest')
  }
}

const quickCheckOut = async () => {
  if (!selectedCheckOut.value) return
  
  try {
    // In real app, call API
    console.log(`${selectedCheckOut.value.guest_name} checked out successfully`)
    
    showCheckOutDialog.value = false
    selectedCheckOut.value = null
    
    // Update stats
    dashboardStats.value.departures--
    roomStats.value.occupied--
    roomStats.value.cleaning++
    
  } catch {
    console.error('Failed to check out guest')
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
})

// WebSocket integration for real-time updates
useRoomUpdates((roomData) => {
  console.log('Dashboard: Room status changed:', roomData)
  
  // Update room stats based on status changes
  updateRoomStatsFromWebSocket(roomData)
  
  // Add to recent activities
  addRecentActivity({
    id: `room-${roomData.room_id}-${Date.now()}`,
    title: `Room ${roomData.room_number} status changed`,
    description: `${roomData.old_status} → ${roomData.new_status}`,
    time: new Date(),
    icon: getRoomStatusIcon(roomData.new_status),
    color: getRoomStatusColor(roomData.new_status)
  })
})

useReservationUpdates((type, reservationData) => {
  console.log('Dashboard: Reservation update:', type, reservationData)
  
  // Update dashboard stats based on reservation changes
  updateReservationStatsFromWebSocket(type, reservationData)
  
  // Add to recent activities
  const activityConfig = getReservationActivityConfig(type, reservationData)
  if (activityConfig) {
    addRecentActivity(activityConfig)
  }
})

// WebSocket helper methods
const updateRoomStatsFromWebSocket = (roomData) => {
  const { old_status, new_status } = roomData
  
  // Decrease old status count
  if (old_status === 'available') roomStats.value.available--
  else if (old_status === 'occupied') roomStats.value.occupied--
  else if (old_status === 'cleaning') roomStats.value.cleaning--
  else if (old_status === 'maintenance') roomStats.value.maintenance--
  
  // Increase new status count
  if (new_status === 'available') roomStats.value.available++
  else if (new_status === 'occupied') roomStats.value.occupied++
  else if (new_status === 'cleaning') roomStats.value.cleaning++
  else if (new_status === 'maintenance') roomStats.value.maintenance++
  
  // Update occupancy percentage
  const totalRooms = roomStats.value.available + roomStats.value.occupied + 
                    roomStats.value.cleaning + roomStats.value.maintenance
  if (totalRooms > 0) {
    dashboardStats.value.occupancy = Math.round((roomStats.value.occupied / totalRooms) * 100)
  }
}

const updateReservationStatsFromWebSocket = (type, reservationData) => {
  const today = new Date().toDateString()
  const checkInDate = new Date(reservationData.check_in_date).toDateString()
  const checkOutDate = new Date(reservationData.check_out_date).toDateString()
  
  if (type === 'created') {
    // If check-in is today, increment arrivals
    if (checkInDate === today) {
      dashboardStats.value.arrivals++
    }
    
    // If check-out is today, increment departures
    if (checkOutDate === today) {
      dashboardStats.value.departures++
    }
    
    // Update revenue (assuming total_amount is available)
    if (reservationData.total_amount) {
      dashboardStats.value.revenue += reservationData.total_amount
    }
  } else if (type === 'cancelled') {
    // Decrease counts if applicable
    if (checkInDate === today) {
      dashboardStats.value.arrivals = Math.max(0, dashboardStats.value.arrivals - 1)
    }
    if (checkOutDate === today) {
      dashboardStats.value.departures = Math.max(0, dashboardStats.value.departures - 1)
    }
  }
}

const getRoomStatusIcon = (status) => {
  const icons = {
    available: 'check_circle',
    occupied: 'hotel',
    cleaning: 'cleaning_services',
    maintenance: 'build',
    out_of_order: 'error'
  }
  return icons[status] || 'help'
}

const getRoomStatusColor = (status) => {
  const colors = {
    available: 'positive',
    occupied: 'negative',
    cleaning: 'warning',
    maintenance: 'info',
    out_of_order: 'negative'
  }
  return colors[status] || 'grey'
}

const getReservationActivityConfig = (type, reservationData) => {
  const configs = {
    created: {
      id: `reservation-created-${reservationData.reservation_id}-${Date.now()}`,
      title: 'New reservation created',
      description: `${reservationData.guest_name} - Room ${reservationData.room_number}`,
      time: new Date(),
      icon: 'event',
      color: 'primary'
    },
    cancelled: {
      id: `reservation-cancelled-${reservationData.reservation_id}-${Date.now()}`,
      title: 'Reservation cancelled',
      description: `${reservationData.guest_name} - ${reservationData.confirmation_number}`,
      time: new Date(),
      icon: 'event_busy',
      color: 'negative'
    },
    updated: {
      id: `reservation-updated-${reservationData.reservation_id}-${Date.now()}`,
      title: 'Reservation updated',
      description: `${reservationData.guest_name} - Room ${reservationData.room_number}`,
      time: new Date(),
      icon: 'edit',
      color: 'info'
    }
  }
  return configs[type]
}

const addRecentActivity = (activity) => {
  // Add to the beginning of the array
  recentActivities.value.unshift(activity)
  
  // Keep only the latest 10 activities
  if (recentActivities.value.length > 10) {
    recentActivities.value = recentActivities.value.slice(0, 10)
  }
}

// Methods
const loadDashboardData = async () => {
  loading.value = true
  try {
    // Load dashboard overview from API
    const dashboardData = await analyticsService.getDashboardOverview()
    
    // Update dashboard stats
    dashboardStats.value = {
      arrivals: dashboardData.today?.arrivals || 0,
      departures: dashboardData.today?.departures || 0,
      occupancy: Math.round(dashboardData.today?.occupancy_rate || 0),
      revenue: dashboardData.today?.revenue || 0
    }

    // Update room stats
    if (dashboardData.room_status) {
      roomStats.value = {
        available: dashboardData.room_status.available?.count || 0,
        occupied: dashboardData.room_status.occupied?.count || 0,
        cleaning: dashboardData.room_status.cleaning?.count || 0,
        maintenance: dashboardData.room_status.maintenance?.count || 0
      }
    }

    // Update recent bookings if available
    if (dashboardData.recent_bookings) {
      // Convert recent bookings to activities format
      const bookingActivities = dashboardData.recent_bookings.map((booking, index) => ({
        id: `booking-${booking.id}`,
        title: `New reservation: ${booking.guest_name}`,
        description: `${booking.room_type} - ${booking.check_in} to ${booking.check_out}`,
        time: new Date(Date.now() - (index + 1) * 30 * 60 * 1000), // Mock time
        icon: 'event',
        color: 'primary'
      }))
      
      // Merge with existing activities
      recentActivities.value = [...bookingActivities, ...recentActivities.value.slice(0, 4 - bookingActivities.length)]
    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    
    // Show user-friendly error message
    console.warn('Dashboard data could not be loaded. Using offline mode.')
    
    // Keep the existing mock data as fallback
    // This allows the dashboard to still be functional even when API is down
    
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
/* Import liquid glass styles */
@import 'src/css/liquid-glass.scss';

.dashboard-page {
  padding: 16px;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  
  /* Animated gradient background */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #00f2fe 100%
    );
    background-size: 400% 400%;
    animation: gradientFlow 20s ease infinite;
    z-index: -1;
  }
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Welcome Card - Enhanced Liquid Glass Style */
.welcome-card {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Animated gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(102, 126, 234, 0.1) 25%,
      rgba(156, 39, 176, 0.1) 50%,
      transparent 70%
    );
    animation: welcomeShimmer 8s ease-in-out infinite;
  }
  
  /* Colorful accent line */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      rgba(33, 150, 243, 0.8) 0%,
      rgba(156, 39, 176, 0.8) 25%,
      rgba(255, 152, 0, 0.8) 50%,
      rgba(76, 175, 80, 0.8) 75%,
      rgba(0, 188, 212, 0.8) 100%
    );
    background-size: 200% 100%;
    animation: accentFlow 5s linear infinite;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 25px 70px rgba(102, 126, 234, 0.5),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  }
}

@keyframes welcomeShimmer {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
}

@keyframes accentFlow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Stat Cards - Enhanced Liquid Glass with Vibrant Colors */
.stat-card {
  height: 140px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
  
  /* Liquid glass effect with color tints */
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.3),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
  
  position: relative;
  overflow: hidden;
  
  /* Color overlay based on stat type */
  &:nth-child(1) {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(255, 255, 255, 0.12)) !important;
    border-color: rgba(33, 150, 243, 0.3);
    
    .stat-icon {
      color: #2196F3;
      filter: drop-shadow(0 4px 12px rgba(33, 150, 243, 0.5));
    }
    
    .stat-value {
      color: #2196F3;
      text-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
    }
  }
  
  &:nth-child(2) {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(255, 255, 255, 0.12)) !important;
    border-color: rgba(156, 39, 176, 0.3);
    
    .stat-icon {
      color: #9C27B0;
      filter: drop-shadow(0 4px 12px rgba(156, 39, 176, 0.5));
    }
    
    .stat-value {
      color: #9C27B0;
      text-shadow: 0 2px 8px rgba(156, 39, 176, 0.4);
    }
  }
  
  &:nth-child(3) {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(255, 255, 255, 0.12)) !important;
    border-color: rgba(76, 175, 80, 0.3);
    
    .stat-icon {
      color: #4CAF50;
      filter: drop-shadow(0 4px 12px rgba(76, 175, 80, 0.5));
    }
    
    .stat-value {
      color: #4CAF50;
      text-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
    }
  }
  
  &:nth-child(4) {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 255, 255, 0.12)) !important;
    border-color: rgba(255, 152, 0, 0.3);
    
    .stat-icon {
      color: #FF9800;
      filter: drop-shadow(0 4px 12px rgba(255, 152, 0, 0.5));
    }
    
    .stat-value {
      color: #FF9800;
      text-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.03);
    background: rgba(255, 255, 255, 0.18) !important;
    box-shadow: 
      0 20px 50px rgba(31, 38, 135, 0.4),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
    
    &::before {
      left: 100%;
    }
    
    .stat-icon {
      transform: scale(1.2) rotate(10deg);
    }
    
    .stat-value {
      transform: scale(1.05);
    }
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
  }
}

.stats-grid {
  margin-bottom: 0;
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  /* Liquid glass effect for all cards */
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(31, 38, 135, 0.35),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.35);
  }
  
  .q-card__section {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .text-h6 {
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 48px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.95;
  filter: drop-shadow(0 2px 6px rgba(255, 255, 255, 0.3));
}

.quick-actions {
  .q-btn {
    min-height: 56px;
    border-radius: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    /* Glass button effect */
    background: rgba(255, 255, 255, 0.15) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    color: white !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      transition: all 0.4s ease;
      transform: translate(-50%, -50%);
    }
    
    /* Color-specific glows */
    &:nth-child(1) {
      border-color: rgba(33, 150, 243, 0.4) !important;
      box-shadow: 0 4px 16px rgba(33, 150, 243, 0.2);
      
      &:hover {
        box-shadow: 0 8px 32px rgba(33, 150, 243, 0.4);
        border-color: rgba(33, 150, 243, 0.6) !important;
      }
    }
    
    &:nth-child(2) {
      border-color: rgba(156, 39, 176, 0.4) !important;
      box-shadow: 0 4px 16px rgba(156, 39, 176, 0.2);
      
      &:hover {
        box-shadow: 0 8px 32px rgba(156, 39, 176, 0.4);
        border-color: rgba(156, 39, 176, 0.6) !important;
      }
    }
    
    &:nth-child(3) {
      border-color: rgba(255, 152, 0, 0.4) !important;
      box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
      
      &:hover {
        box-shadow: 0 8px 32px rgba(255, 152, 0, 0.4);
        border-color: rgba(255, 152, 0, 0.6) !important;
      }
    }
    
    &:nth-child(4) {
      border-color: rgba(0, 188, 212, 0.4) !important;
      box-shadow: 0 4px 16px rgba(0, 188, 212, 0.2);
      
      &:hover {
        box-shadow: 0 8px 32px rgba(0, 188, 212, 0.4);
        border-color: rgba(0, 188, 212, 0.6) !important;
      }
    }
    
    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.25) !important;
      
      &::before {
        width: 300px;
        height: 300px;
      }
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.activity-item {
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 8px;
  
  /* Light glass effect for list items */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    transition: width 0.3s ease;
    border-radius: 12px 0 0 12px;
  }
  
  /* Color-coded left border based on activity type */
  &:nth-child(1) {
    &::after {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.6), rgba(76, 175, 80, 0.3));
    }
    
    .q-icon {
      color: #4CAF50;
      filter: drop-shadow(0 2px 6px rgba(76, 175, 80, 0.4));
    }
  }
  
  &:nth-child(2) {
    &::after {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.6), rgba(33, 150, 243, 0.3));
    }
    
    .q-icon {
      color: #2196F3;
      filter: drop-shadow(0 2px 6px rgba(33, 150, 243, 0.4));
    }
  }
  
  &:nth-child(3) {
    &::after {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.6), rgba(255, 152, 0, 0.3));
    }
    
    .q-icon {
      color: #FF9800;
      filter: drop-shadow(0 2px 6px rgba(255, 152, 0, 0.4));
    }
  }
  
  &:nth-child(4) {
    &::after {
      background: linear-gradient(135deg, rgba(156, 39, 176, 0.6), rgba(156, 39, 176, 0.3));
    }
    
    .q-icon {
      color: #9C27B0;
      filter: drop-shadow(0 2px 6px rgba(156, 39, 176, 0.4));
    }
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    
    &::after {
      width: 4px;
    }
  }
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.activity-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
}

.schedule-timeline {
  padding-left: 0;
  
  .q-timeline__entry {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: -20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, 
        rgba(33, 150, 243, 0.6), 
        rgba(156, 39, 176, 0.6));
      border-radius: 1px;
      box-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
    }
    
    /* Color-coded dots */
    &:nth-child(1) {
      .q-timeline__dot {
        background: rgba(33, 150, 243, 0.3);
        border-color: #2196F3;
        box-shadow: 0 0 15px rgba(33, 150, 243, 0.5);
      }
    }
    
    &:nth-child(2) {
      .q-timeline__dot {
        background: rgba(255, 152, 0, 0.3);
        border-color: #FF9800;
        box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
      }
    }
    
    &:nth-child(3) {
      .q-timeline__dot {
        background: rgba(0, 188, 212, 0.3);
        border-color: #00BCD4;
        box-shadow: 0 0 15px rgba(0, 188, 212, 0.5);
      }
    }
  }
  
  .q-timeline__dot {
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
}

.schedule-entry {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateX(4px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.schedule-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.room-status-grid {
  justify-content: center;
  gap: 16px;
}

.room-status-item {
  padding: 16px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  
  /* Color glow effect based on status */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    transition: all 0.4s ease;
    transform: translate(-50%, -50%);
    opacity: 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    &::before {
      width: 120%;
      height: 120%;
      opacity: 0.1;
    }
    
    .q-circular-progress {
      transform: scale(1.1);
    }
  }
  
  /* Available - Green glow */
  &:nth-child(1) {
    &::before {
      background: radial-gradient(circle, rgba(76, 175, 80, 0.4), transparent);
    }
    
    .q-circular-progress {
      filter: drop-shadow(0 4px 12px rgba(76, 175, 80, 0.3));
    }
  }
  
  /* Occupied - Red glow */
  &:nth-child(2) {
    &::before {
      background: radial-gradient(circle, rgba(244, 67, 54, 0.4), transparent);
    }
    
    .q-circular-progress {
      filter: drop-shadow(0 4px 12px rgba(244, 67, 54, 0.3));
    }
  }
  
  /* Cleaning - Orange glow */
  &:nth-child(3) {
    &::before {
      background: radial-gradient(circle, rgba(255, 152, 0, 0.4), transparent);
    }
    
    .q-circular-progress {
      filter: drop-shadow(0 4px 12px rgba(255, 152, 0, 0.3));
    }
  }
  
  /* Maintenance - Blue glow */
  &:nth-child(4) {
    &::before {
      background: radial-gradient(circle, rgba(33, 150, 243, 0.4), transparent);
    }
    
    .q-circular-progress {
      filter: drop-shadow(0 4px 12px rgba(33, 150, 243, 0.3));
    }
  }
  
  .q-circular-progress {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .text-caption {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.dialog-card {
  min-width: 320px;
  max-width: 90vw;
  border-radius: 20px;
  
  /* Glass modal effect */
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  
  .text-h6 {
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    font-weight: 700;
  }
  
  .q-field {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    :deep(.q-field__native),
    :deep(.q-field__label) {
      color: white;
    }
    
    :deep(.q-field__control):hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  .q-btn {
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

/* Enhanced Dialog Backdrop */
:deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Dialog scale animation enhancement */
:deep(.q-dialog) {
  .dialog-card {
    animation: dialogScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes dialogScaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.full-width-mobile {
  width: 100%;
  border-radius: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Glass button */
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.25) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

/* Enhanced mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .stat-card {
    height: 120px;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
    }
  }
  
  .stat-title {
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .stat-icon {
    font-size: 36px;
  }
  
  .quick-actions .q-btn {
    font-size: 0.85rem;
    min-height: 48px;
    border-radius: 12px;
  }
  
  .room-status-item {
    padding: 12px;
    
    .q-circular-progress {
      transform: scale(0.85);
    }
  }
  
  .dialog-card {
    margin: 20px;
    border-radius: 16px;
  }
  
  .full-height {
    border-radius: 16px;
  }
}

@media (max-width: 600px) {
  .row.q-gutter-lg > div {
    margin-bottom: 20px;
  }
  
  .col-12.col-sm-6.col-md-3,
  .col-12.col-lg-6 {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .quick-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .quick-actions .q-btn {
    width: 100%;
    margin-bottom: 0;
  }
  
  .room-status-grid {
    justify-content: space-around;
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .dashboard-page {
    padding: 8px;
  }
  
  .stat-card .q-card-section {
    padding: 16px;
  }
  
  .welcome-card .q-card-section {
    padding: 20px;
  }
  
  .room-status-item .q-circular-progress {
    transform: scale(0.75);
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.4rem;
  }
}

/* Enhanced animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glassShimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.welcome-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) {
  animation: slideInLeft 0.6s ease-out 0.1s both;
}

.stat-card:nth-child(2) {
  animation: slideInLeft 0.6s ease-out 0.2s both;
}

.stat-card:nth-child(3) {
  animation: slideInRight 0.6s ease-out 0.3s both;
}

.stat-card:nth-child(4) {
  animation: slideInRight 0.6s ease-out 0.4s both;
}

/* Enhanced dark mode support - Liquid Glass */
.body--dark {
  .dashboard-page {
    &::before {
      background: linear-gradient(
        135deg,
        #1a1a2e 0%,
        #16213e 25%,
        #0f3460 50%,
        #533483 75%,
        #6a4c93 100%
      );
    }
  }
  
  .welcome-card {
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .welcome-title {
      color: white;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    
    .welcome-subtitle {
      color: rgba(255, 255, 255, 0.85);
    }
  }
  
  .stat-card {
    background: rgba(0, 0, 0, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.15);
    
    &:hover {
      background: rgba(0, 0, 0, 0.35) !important;
      border-color: rgba(255, 255, 255, 0.25);
    }
  }
  
  .full-height {
    background: rgba(0, 0, 0, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.15);
    
    &:hover {
      background: rgba(0, 0, 0, 0.3) !important;
    }
  }
  
  .activity-item {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
  
  .room-status-item {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .dialog-card {
    background: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 
      0 30px 80px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
  }
  
  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.75) !important;
  }
}

/* Enhanced accessibility */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .quick-actions .q-btn,
  .activity-item,
  .schedule-entry,
  .room-status-item {
    transition: none !important;
    animation: none !important;
  }
  
  .welcome-card::before {
    animation: none !important;
  }
}

/* Enhanced focus states */
.stat-card:focus,
.quick-actions .q-btn:focus {
  outline: 3px solid var(--q-primary);
  outline-offset: 2px;
}

/* Enhanced loading states */
.loading-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 16px;
  height: 140px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>