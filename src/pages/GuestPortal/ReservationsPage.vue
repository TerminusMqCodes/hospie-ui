<template>
  <q-page class="q-pa-md" :class="{ 'bg-grey-9': $q.dark.isActive, 'bg-grey-1': !$q.dark.isActive }">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h5 q-mb-md">
              <q-icon name="event" class="q-mr-sm" />
              My Reservations
            </div>
            <div class="text-subtitle2" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
              View and manage your hotel reservations
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Filter Tabs -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8': $q.dark.isActive }">
          <q-tabs
            v-model="activeTab"
            dense
            :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey': !$q.dark.isActive }"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="all" label="All Reservations" />
            <q-tab name="upcoming" label="Upcoming" />
            <q-tab name="current" label="Current Stay" />
            <q-tab name="past" label="Past Stays" />
          </q-tabs>
        </q-card>
      </div>

      <!-- Reservations List -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section v-if="loading" class="text-center">
            <q-spinner-dots size="50px" color="primary" />
            <div class="q-mt-md">Loading reservations...</div>
          </q-card-section>

          <q-card-section v-else-if="filteredReservations.length === 0" class="text-center">
            <q-icon name="event_busy" size="64px" :color="$q.dark.isActive ? 'grey-5' : 'grey-5'" />
            <div class="text-h6 q-mt-md" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">No reservations found</div>
            <div class="text-body2" :class="{ 'text-grey-5': $q.dark.isActive, 'text-grey-5': !$q.dark.isActive }">
              {{ getEmptyMessage() }}
            </div>
          </q-card-section>

          <q-list v-else separator>
            <q-item
              v-for="reservation in filteredReservations"
              :key="reservation.id"
              clickable
              @click="viewReservation(reservation.id)"
              class="q-pa-md"
              :class="{ 'bg-grey-7': $q.dark.isActive && reservation.id % 2 === 0 }"
            >
              <q-item-section>
                <q-item-label class="text-h6">
                  Reservation #{{ reservation.confirmation_number }}
                  <q-chip 
                    :color="getStatusColor(reservation.status)" 
                    text-color="white" 
                    size="sm" 
                    class="q-ml-sm"
                  >
                    {{ getStatusLabel(reservation.status) }}
                  </q-chip>
                </q-item-label>
                
                <q-item-label caption class="q-mt-sm">
                  <div class="row q-gutter-md">
                    <div class="col-auto">
                      <q-icon name="event" size="sm" class="q-mr-xs" />
                      {{ formatDateRange(reservation.check_in_date, reservation.check_out_date) }}
                    </div>
                    <div class="col-auto" v-if="reservation.room">
                      <q-icon name="meeting_room" size="sm" class="q-mr-xs" />
                      Room {{ reservation.room.room_number }}
                    </div>
                    <div class="col-auto">
                      <q-icon name="people" size="sm" class="q-mr-xs" />
                      {{ reservation.adults }} Adult{{ reservation.adults > 1 ? 's' : '' }}
                      <span v-if="reservation.children > 0">
                        , {{ reservation.children }} Child{{ reservation.children > 1 ? 'ren' : '' }}
                      </span>
                    </div>
                  </div>
                </q-item-label>

                <q-item-label caption class="q-mt-sm" v-if="reservation.special_requests">
                  <q-icon name="note" size="sm" class="q-mr-xs" />
                  {{ reservation.special_requests }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-right">
                  <div class="text-h6 text-primary">
                    ${{ reservation.total_amount?.toLocaleString() || '0' }}
                  </div>
                  <div class="text-caption" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
                    {{ getNights(reservation.check_in_date, reservation.check_out_date) }} night{{ getNights(reservation.check_in_date, reservation.check_out_date) > 1 ? 's' : '' }}
                  </div>
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="chevron_right"
                  :color="$q.dark.isActive ? 'grey-4' : 'grey-6'"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const router = useRouter()
const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)
const activeTab = ref('all')
const reservations = ref([])

onMounted(() => {
  loadReservations()
})

watch(activeTab, () => {
  loadReservations()
})

const filteredReservations = computed(() => {
  const now = new Date()
  
  switch (activeTab.value) {
    case 'upcoming':
      return reservations.value.filter(r => 
        new Date(r.check_in_date) > now && 
        ['confirmed', 'pending'].includes(r.status)
      )
    case 'current':
      return reservations.value.filter(r => 
        new Date(r.check_in_date) <= now && 
        new Date(r.check_out_date) >= now &&
        r.status === 'checked_in'
      )
    case 'past':
      return reservations.value.filter(r => 
        new Date(r.check_out_date) < now || 
        ['checked_out', 'completed', 'cancelled'].includes(r.status)
      )
    default:
      return reservations.value
  }
})

const loadReservations = async () => {
  loading.value = true
  
  try {
    const data = await guestPortalStore.loadReservations()
    reservations.value = data
    
  } catch (error) {
    console.error('Failed to load reservations:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Failed to load reservations',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const viewReservation = (reservationId) => {
  router.push(`/guest-portal/reservations/${reservationId}`)
}

const formatDateRange = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  
  const options = { 
    month: 'short', 
    day: 'numeric',
    year: checkInDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  }
  
  return `${checkInDate.toLocaleDateString('en-US', options)} - ${checkOutDate.toLocaleDateString('en-US', options)}`
}

const getNights = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = Math.abs(checkOutDate - checkInDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getStatusColor = (status) => {
  const colors = {
    'confirmed': 'green',
    'pending': 'orange',
    'cancelled': 'red',
    'checked_in': 'blue',
    'checked_out': 'grey',
    'completed': 'purple',
    'no_show': 'red-8'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out',
    'completed': 'Completed',
    'no_show': 'No Show'
  }
  return labels[status] || status
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'upcoming':
      return 'You have no upcoming reservations.'
    case 'current':
      return 'You are not currently checked in.'
    case 'past':
      return 'You have no past reservations.'
    default:
      return 'You have no reservations yet.'
  }
}
</script>