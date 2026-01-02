<template>
  <q-page class="guest-dashboard-page">
    <div class="q-pa-md q-pa-lg-lg">
      <div class="row q-gutter-md">
        <!-- Welcome Header -->
        <div class="col-12">
          <q-card class="bg-primary text-white welcome-card">
            <q-card-section class="q-pa-lg">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h5 text-weight-bold">
                    Welcome back, {{ dashboardData?.guest?.full_name || 'Guest' }}!
                  </div>
                  <div class="text-subtitle1 q-mt-xs">
                    {{ getTierDisplayName(dashboardData?.guest?.guest_tier) }} Member
                    <q-chip 
                      v-if="dashboardData?.guest?.is_vip" 
                      color="amber" 
                      text-color="black" 
                      icon="star" 
                      size="sm" 
                      class="q-ml-sm"
                    >
                      VIP
                    </q-chip>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="80px" color="white" text-color="primary">
                    <q-icon name="person" size="40px" />
                  </q-avatar>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

      <!-- Current Reservation -->
      <div class="col-12" v-if="dashboardData?.current_reservation">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="hotel" class="q-mr-sm" />
              Current Stay
            </div>
            <div class="row q-gutter-md">
              <div class="col-md-6 col-12">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="meeting_room" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Room</q-item-label>
                      <q-item-label caption>
                        {{ dashboardData.current_reservation.room?.room_number || 'TBA' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Check-out</q-item-label>
                      <q-item-label caption>
                        {{ formatDate(dashboardData.current_reservation.check_out_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-md-6 col-12">
                <div class="row q-gutter-sm">
                  <q-btn 
                    color="primary" 
                    label="Request Service" 
                    icon="room_service"
                    @click="showServiceRequest = true"
                    class="col"
                  />
                  <q-btn 
                    color="secondary" 
                    label="Late Checkout" 
                    icon="schedule"
                    @click="requestLateCheckout"
                    class="col"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Stats -->
      <div class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="loyalty" class="q-mr-sm" />
              Loyalty Points
            </div>
            <div class="text-h4 text-primary">
              {{ dashboardData?.statistics?.loyalty_points?.toLocaleString() || 0 }}
            </div>
            <div class="text-caption text-grey-6">
              {{ dashboardData?.statistics?.guest_tier }} Member
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="hotel" class="q-mr-sm" />
              Total Stays
            </div>
            <div class="text-h4 text-secondary">
              {{ dashboardData?.statistics?.total_stays || 0 }}
            </div>
            <div class="text-caption text-grey-6">
              Lifetime visits
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-4 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="attach_money" class="q-mr-sm" />
              Total Spent
            </div>
            <div class="text-h4 text-green">
              ${{ dashboardData?.statistics?.total_spent?.toLocaleString() || 0 }}
            </div>
            <div class="text-caption text-grey-6">
              Lifetime value
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Upcoming Reservations -->
      <div class="col-md-6 col-12" v-if="dashboardData?.upcoming_reservations?.length">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="event_available" class="q-mr-sm" />
              Upcoming Stays
            </div>
            <q-list>
              <q-item 
                v-for="reservation in dashboardData.upcoming_reservations" 
                :key="reservation.id"
                clickable
                @click="viewReservation(reservation.id)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ formatDate(reservation.check_in_date) }} - {{ formatDate(reservation.check_out_date) }}
                  </q-item-label>
                  <q-item-label caption>
                    Reservation #{{ reservation.reservation_number }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip 
                    :color="getStatusColor(reservation.status)" 
                    text-color="white" 
                    size="sm"
                  >
                    {{ reservation.status }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Reservations -->
      <div class="col-md-6 col-12" v-if="dashboardData?.recent_reservations?.length">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="history" class="q-mr-sm" />
              Recent Stays
            </div>
            <q-list>
              <q-item 
                v-for="reservation in dashboardData.recent_reservations.slice(0, 3)" 
                :key="reservation.id"
                clickable
                @click="viewReservation(reservation.id)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ formatDate(reservation.check_in_date) }} - {{ formatDate(reservation.check_out_date) }}
                  </q-item-label>
                  <q-item-label caption>
                    Room {{ reservation.room?.room_number || 'N/A' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-rating 
                    v-model="reservation.rating" 
                    size="sm" 
                    color="amber" 
                    readonly
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="flash_on" class="q-mr-sm" />
              Quick Actions
            </div>
            <div class="row q-gutter-md">
              <q-btn 
                color="primary" 
                label="View Profile" 
                icon="person"
                @click="$router.push('/guest-portal/profile')"
              />
              <q-btn 
                color="secondary" 
                label="My Reservations" 
                icon="event"
                @click="$router.push('/guest-portal/reservations')"
              />
              <q-btn 
                color="accent" 
                label="Send Message" 
                icon="message"
                @click="$router.push('/guest-portal/messages')"
              />
              <q-btn 
                color="info" 
                label="Loyalty Program" 
                icon="loyalty"
                @click="$router.push('/guest-portal/loyalty')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Service Request Dialog -->
    <ServiceRequestDialog 
      v-model="showServiceRequest" 
      :reservation="dashboardData?.current_reservation"
      @submitted="onServiceRequestSubmitted"
    />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'
import ServiceRequestDialog from 'src/components/GuestPortal/ServiceRequestDialog.vue'

const router = useRouter()
const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const dashboardData = ref(null)
const loading = ref(false)
const showServiceRequest = ref(false)

onMounted(() => {
  loadDashboard()
})

const loadDashboard = async () => {
  loading.value = true
  try {
    const data = await guestPortalStore.loadDashboard()
    dashboardData.value = data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard data',
      position: 'top'
    })
    // If dashboard fails to load, redirect to login
    router.push('/guest-portal/login')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTierDisplayName = (tier) => {
  const tierNames = {
    'standard': 'Standard',
    'silver': 'Silver',
    'gold': 'Gold',
    'platinum': 'Platinum',
    'diamond': 'Diamond'
  }
  return tierNames[tier] || 'Standard'
}

const getStatusColor = (status) => {
  const colors = {
    'confirmed': 'green',
    'pending': 'orange',
    'cancelled': 'red',
    'checked_in': 'blue',
    'checked_out': 'grey'
  }
  return colors[status] || 'grey'
}

const viewReservation = (reservationId) => {
  router.push(`/guest-portal/reservations/${reservationId}`)
}

const requestLateCheckout = () => {
  if (!dashboardData.value?.current_reservation) return
  
  router.push({
    name: 'guest-portal-reservation-detail',
    params: { id: dashboardData.value.current_reservation.id },
    query: { action: 'late-checkout' }
  })
}

const onServiceRequestSubmitted = () => {
  $q.notify({
    type: 'positive',
    message: 'Service request submitted successfully',
    position: 'top'
  })
  showServiceRequest.value = false
}
</script>

<style lang="scss" scoped>
.guest-dashboard-page {
  background: #f5f5f5;
  min-height: 100vh;
  
  .body--dark & {
    background: #1d1d1d;
  }
  
  .welcome-card {
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    
    .body--dark & {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
  }
  
  .q-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    
    .body--dark & {
      background: #2d2d2d;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      
      .q-card-section {
        color: #ffffff;
      }
    }
    
    .q-card-section {
      .text-h6 {
        color: var(--q-primary);
        font-weight: 600;
      }
    }
  }
  
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
  }
  
  .q-chip {
    font-weight: 500;
  }
  
  // Dark mode specific styles
  .body--dark & {
    .q-list {
      .q-item {
        color: #ffffff;
        
        .q-item-section {
          color: #ffffff;
        }
      }
    }
    
    .text-grey-6 {
      color: #9e9e9e !important;
    }
    
    .text-grey-7 {
      color: #757575 !important;
    }
  }
}

// Mobile responsive adjustments
@media (max-width: 599px) {
  .guest-dashboard-page {
    .welcome-card {
      .q-card-section {
        padding: 16px;
      }
      
      .text-h5 {
        font-size: 1.25rem;
      }
      
      .q-avatar {
        width: 60px;
        height: 60px;
        
        .q-icon {
          font-size: 30px;
        }
      }
    }
  }
}
</style>