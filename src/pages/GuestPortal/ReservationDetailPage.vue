<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Back Button -->
      <div class="col-12">
        <q-btn 
          flat 
          icon="arrow_back" 
          label="Back to Reservations"
          @click="$router.push('/guest-portal/reservations')"
          class="q-mb-md"
        />
      </div>

      <!-- Reservation Details -->
      <div class="col-12" v-if="reservation">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">
              Reservation #{{ reservation.confirmation_number }}
              <q-chip 
                :color="getStatusColor(reservation.status)" 
                text-color="white" 
                class="q-ml-sm"
              >
                {{ getStatusLabel(reservation.status) }}
              </q-chip>
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-md-6 col-12">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Check-in</q-item-label>
                      <q-item-label caption>
                        {{ formatDate(reservation.check_in_date) }}
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
                        {{ formatDate(reservation.check_out_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item v-if="reservation.room">
                    <q-item-section avatar>
                      <q-icon name="meeting_room" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Room</q-item-label>
                      <q-item-label caption>
                        {{ reservation.room.room_number }} - {{ reservation.room.room_type }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              
              <div class="col-md-6 col-12">
                <div class="text-h6 text-primary q-mb-md">
                  Total: ${{ reservation.total_amount?.toLocaleString() || '0' }}
                </div>
                
                <div class="q-gutter-sm">
                  <q-btn 
                    v-if="canRequestEarlyCheckIn"
                    color="primary" 
                    label="Request Early Check-in" 
                    icon="schedule"
                    @click="showEarlyCheckIn = true"
                  />
                  
                  <q-btn 
                    v-if="canRequestLateCheckOut"
                    color="secondary" 
                    label="Request Late Check-out" 
                    icon="schedule"
                    @click="showLateCheckOut = true"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div class="col-12" v-else-if="loading">
        <q-card>
          <q-card-section class="text-center">
            <q-spinner-dots size="50px" color="primary" />
            <div class="q-mt-md">Loading reservation details...</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Error State -->
      <div class="col-12" v-else>
        <q-card>
          <q-card-section class="text-center">
            <q-icon name="error" size="64px" color="grey-5" />
            <div class="text-h6 q-mt-md text-grey-6">Reservation not found</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Early Check-in Dialog -->
    <q-dialog v-model="showEarlyCheckIn">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Request Early Check-in</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="earlyCheckInTime"
            label="Requested Time"
            type="datetime-local"
            outlined
          />
          <q-input
            v-model="earlyCheckInMessage"
            label="Message (Optional)"
            type="textarea"
            outlined
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn 
            label="Submit Request" 
            color="primary" 
            @click="submitEarlyCheckIn"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Late Check-out Dialog -->
    <q-dialog v-model="showLateCheckOut">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Request Late Check-out</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="lateCheckOutTime"
            label="Requested Time"
            type="datetime-local"
            outlined
          />
          <q-input
            v-model="lateCheckOutMessage"
            label="Message (Optional)"
            type="textarea"
            outlined
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn 
            label="Submit Request" 
            color="primary" 
            @click="submitLateCheckOut"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const route = useRoute()
const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)
const submitting = ref(false)
const reservation = ref(null)
const showEarlyCheckIn = ref(false)
const showLateCheckOut = ref(false)
const earlyCheckInTime = ref('')
const earlyCheckInMessage = ref('')
const lateCheckOutTime = ref('')
const lateCheckOutMessage = ref('')

const canRequestEarlyCheckIn = computed(() => {
  return reservation.value?.status === 'confirmed' && 
         new Date(reservation.value.check_in_date) > new Date()
})

const canRequestLateCheckOut = computed(() => {
  return ['confirmed', 'checked_in'].includes(reservation.value?.status)
})

onMounted(() => {
  loadReservationDetails()
})

const loadReservationDetails = async () => {
  loading.value = true
  
  try {
    const data = await guestPortalStore.loadReservationDetails(route.params.id)
    reservation.value = data
    
  } catch (error) {
    console.error('Failed to load reservation details:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Failed to load reservation details',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

const getStatusLabel = (status) => {
  const labels = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out'
  }
  return labels[status] || status
}

const submitEarlyCheckIn = async () => {
  if (!earlyCheckInTime.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a requested time',
      position: 'top'
    })
    return
  }

  submitting.value = true

  try {
    await guestPortalStore.requestEarlyCheckIn(reservation.value.id, {
      requested_time: earlyCheckInTime.value,
      message: earlyCheckInMessage.value
    })

    $q.notify({
      type: 'positive',
      message: 'Early check-in request submitted successfully',
      position: 'top'
    })

    showEarlyCheckIn.value = false
    earlyCheckInTime.value = ''
    earlyCheckInMessage.value = ''

  } catch (error) {
    console.error('Early check-in request error:', error)
    
    const message = error.response?.data?.message || 'Failed to submit early check-in request'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

const submitLateCheckOut = async () => {
  if (!lateCheckOutTime.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a requested time',
      position: 'top'
    })
    return
  }

  submitting.value = true

  try {
    await guestPortalStore.requestLateCheckOut(reservation.value.id, {
      requested_time: lateCheckOutTime.value,
      message: lateCheckOutMessage.value
    })

    $q.notify({
      type: 'positive',
      message: 'Late check-out request submitted successfully',
      position: 'top'
    })

    showLateCheckOut.value = false
    lateCheckOutTime.value = ''
    lateCheckOutMessage.value = ''

  } catch (error) {
    console.error('Late check-out request error:', error)
    
    const message = error.response?.data?.message || 'Failed to submit late check-out request'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}
</script>