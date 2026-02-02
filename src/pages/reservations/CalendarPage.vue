<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">{{ $t('pages.reservations.calendar.title') }}</div>
                <div class="text-subtitle2">Visual reservation management</div>
              </div>
              <div class="row q-gutter-sm">
                <q-btn-toggle
                  v-model="viewMode"
                  :options="viewOptions"
                  color="primary"
                  @update:model-value="changeView"
                />
                <q-btn 
                  color="primary" 
                  icon="add" 
                  :label="$t('pages.dashboard.newReservation')" 
                  @click="showCreateDialog = true"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Calendar Navigation -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="row items-center q-gutter-md">
                <q-btn 
                  flat 
                  round 
                  icon="chevron_left" 
                  @click="previousPeriod"
                />
                <div class="text-h6">{{ currentPeriodLabel }}</div>
                <q-btn 
                  flat 
                  round 
                  icon="chevron_right" 
                  @click="nextPeriod"
                />
                <q-btn 
                  flat 
                  label="Today" 
                  @click="goToToday"
                />
              </div>
              
              <div class="row items-center q-gutter-sm">
                <q-select
                  v-model="selectedRoomType"
                  :options="roomTypeOptions"
                  label="Room Type"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterByRoomType"
                />
                <q-btn 
                  flat 
                  icon="refresh" 
                  @click="refreshCalendar"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Calendar Grid -->
      <div class="col-12">
        <q-card>
          <q-card-section class="q-pa-none">
            <!-- Week View -->
            <div v-if="viewMode === 'week'" class="calendar-container">
              <RoomStatusGrid
                :rooms="filteredRooms"
                :dates="weekDates"
                :bookings="bookings"
                @cell-click="createBooking"
                @booking-click="viewBooking"
              />
            </div>

            <!-- Month View -->
            <div v-else-if="viewMode === 'month'" class="month-calendar">
              <div class="month-header">
                <div 
                  v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
                  :key="day"
                  class="month-day-header"
                >
                  {{ day }}
                </div>
              </div>
              
              <div class="month-body">
                <div 
                  v-for="week in monthWeeks" 
                  :key="week[0].toISOString()"
                  class="month-week"
                >
                  <div 
                    v-for="date in week"
                    :key="date.toISOString()"
                    class="month-date-cell"
                    :class="{ 
                      'today': isToday(date),
                      'other-month': !isSameMonth(date),
                      'weekend': isWeekend(date)
                    }"
                    @click="selectDate(date)"
                  >
                    <div class="date-number">{{ date.getDate() }}</div>
                    <div class="bookings-summary">
                      <div class="occupancy-bar">
                        <div 
                          class="occupancy-fill"
                          :style="{ width: getOccupancyPercentage(date) + '%' }"
                        ></div>
                      </div>
                      <div class="booking-count">
                        {{ getBookingCount(date) }} bookings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Calendar Legend -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Legend</div>
            <div class="row q-gutter-md">
              <div class="legend-item">
                <div class="legend-color booking-confirmed"></div>
                <span>Confirmed</span>
              </div>
              <div class="legend-item">
                <div class="legend-color booking-pending"></div>
                <span>Pending</span>
              </div>
              <div class="legend-item">
                <div class="legend-color booking-checkedin"></div>
                <span>Checked In</span>
              </div>
              <div class="legend-item">
                <div class="legend-color booking-cancelled"></div>
                <span>Cancelled</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Booking Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Create New Booking</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12">
              <q-select
                v-model="newBooking.guest_id"
                :options="guestOptions"
                label="Guest"
                outlined
                dense
                use-input
                @filter="filterGuests"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newBooking.check_in"
                label="Check-in Date"
                type="date"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newBooking.check_out"
                label="Check-out Date"
                type="date"
                outlined
                dense
              />
            </div>
            
            <div class="col-12">
              <q-select
                v-model="newBooking.room_id"
                :options="availableRoomOptions"
                label="Room"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newBooking.adults"
                label="Adults"
                type="number"
                outlined
                dense
                min="1"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newBooking.children"
                label="Children"
                type="number"
                outlined
                dense
                min="0"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateDialog = false" />
          <q-btn 
            color="primary" 
            label="Create Booking" 
            @click="createBookingSubmit"
            :loading="creating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import RoomStatusGrid from 'src/components/RoomStatusGrid.vue'

const $q = useQuasar()
const router = useRouter()

// Reactive data
const loading = ref(false)
const creating = ref(false)
const viewMode = ref('week')
const currentDate = ref(new Date())
const selectedRoomType = ref(null)
const showCreateDialog = ref(false)

const newBooking = ref({
  guest_id: null,
  check_in: '',
  check_out: '',
  room_id: null,
  adults: 1,
  children: 0
})

// API data
const rooms = ref([])
const bookings = ref([])
const guests = ref([])
const calendarData = ref(null)

// View options
const viewOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
]

// Computed properties
const weekDates = computed(() => {
  const dates = []
  const startOfWeek = new Date(currentDate.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(date)
  }
  
  return dates
})

const monthWeeks = computed(() => {
  const weeks = []
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  
  // Start from the beginning of the week containing the first day
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  // End at the end of the week containing the last day
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  
  let currentWeekStart = new Date(startDate)
  
  while (currentWeekStart <= endDate) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      week.push(date)
    }
    weeks.push(week)
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }
  
  return weeks
})

const currentPeriodLabel = computed(() => {
  if (viewMode.value === 'week') {
    const start = weekDates.value[0]
    const end = weekDates.value[6]
    return `${formatDate(start)} - ${formatDate(end)}`
  } else {
    return currentDate.value.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }
})

const filteredRooms = computed(() => {
  if (!selectedRoomType.value) return rooms.value
  return rooms.value.filter(room => room.room_type?.name === selectedRoomType.value.value)
})

const roomTypeOptions = computed(() => {
  const types = [...new Set(rooms.value.map(room => room.room_type?.name).filter(Boolean))]
  return types.map(type => ({ label: type, value: type }))
})

const guestOptions = computed(() => guests.value)

const availableRoomOptions = computed(() => {
  return rooms.value
    .filter(room => room.status === 'available')
    .map(room => ({
      label: `${room.room_number} (${room.room_type?.name || 'Unknown'})`,
      value: room.id
    }))
})

// API Methods
const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms')
    if (response.data.success) {
      rooms.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching rooms:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch rooms'
    })
  }
}

const fetchGuests = async () => {
  try {
    const response = await api.get('/guests')
    if (response.data.success) {
      guests.value = response.data.data.map(guest => ({
        label: `${guest.first_name} ${guest.last_name}`,
        value: guest.id,
        email: guest.email
      }))
    }
  } catch (error) {
    console.error('Error fetching guests:', error)
  }
}

const fetchCalendarData = async () => {
  loading.value = true
  try {
    const month = currentDate.value.toISOString().slice(0, 7) // YYYY-MM format
    const params = { month }
    
    if (selectedRoomType.value) {
      params.room_type = selectedRoomType.value.value
    }

    const response = await api.get('/reservations/availability-calendar', { params })
    
    if (response.data.success) {
      calendarData.value = response.data.data
      // Transform calendar data to match our booking format
      bookings.value = []
      
      if (calendarData.value.calendar) {
        Object.entries(calendarData.value.calendar).forEach(([, dayData]) => {
          if (dayData.reservations) {
            dayData.reservations.forEach(reservation => {
              const existingBooking = bookings.value.find(b => b.id === reservation.id)
              if (!existingBooking) {
                bookings.value.push({
                  id: reservation.id,
                  room_id: reservation.room_id,
                  guest_name: reservation.guest_name || `${reservation.guest?.first_name} ${reservation.guest?.last_name}`,
                  check_in: reservation.check_in_date,
                  check_out: reservation.check_out_date,
                  nights: reservation.nights || 1,
                  status: reservation.status
                })
              }
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch calendar data'
    })
  } finally {
    loading.value = false
  }
}

// Methods
const changeView = () => {
  fetchCalendarData()
}

const previousPeriod = () => {
  if (viewMode.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() - 7)
  } else {
    currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  }
  currentDate.value = new Date(currentDate.value)
  fetchCalendarData()
}

const nextPeriod = () => {
  if (viewMode.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() + 7)
  } else {
    currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  }
  currentDate.value = new Date(currentDate.value)
  fetchCalendarData()
}

const goToToday = () => {
  currentDate.value = new Date()
  fetchCalendarData()
}

const refreshCalendar = async () => {
  await fetchCalendarData()
  $q.notify({
    type: 'positive',
    message: 'Calendar refreshed'
  })
}

const filterByRoomType = () => {
  fetchCalendarData()
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isWeekend = (date) => {
  return date.getDay() === 0 || date.getDay() === 6
}

const isPast = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const isSameMonth = (date) => {
  return date.getMonth() === currentDate.value.getMonth()
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const getOccupancyPercentage = (date) => {
  if (!calendarData.value?.calendar) return 0
  
  const dateStr = date.toISOString().split('T')[0]
  const dayData = calendarData.value.calendar[dateStr]
  
  if (!dayData) return 0
  
  const totalRooms = rooms.value.length
  const occupiedRooms = dayData.reservations?.length || 0
  
  return Math.round((occupiedRooms / totalRooms) * 100)
}

const getBookingCount = (date) => {
  if (!calendarData.value?.calendar) return 0
  
  const dateStr = date.toISOString().split('T')[0]
  const dayData = calendarData.value.calendar[dateStr]
  
  return dayData?.reservations?.length || 0
}

const createBooking = (room, date) => {
  if (isPast(date)) return
  
  newBooking.value.room_id = room.id
  newBooking.value.check_in = date.toISOString().split('T')[0]
  showCreateDialog.value = true
}

const selectDate = (date) => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(date)
    viewMode.value = 'week'
  }
}

const viewBooking = (booking) => {
  router.push(`/reservations/${booking.id}`)
}

const filterGuests = (val, update) => {
  update(async () => {
    if (val === '') {
      await fetchGuests()
      return
    }

    try {
      const response = await api.get('/guests', {
        params: { search: val, per_page: 10 }
      })
      
      if (response.data.success) {
        guests.value = response.data.data.map(guest => ({
          label: `${guest.first_name} ${guest.last_name}`,
          value: guest.id,
          email: guest.email
        }))
      }
    } catch (error) {
      console.error('Error searching guests:', error)
    }
  })
}

const createBookingSubmit = async () => {
  creating.value = true
  try {
    const bookingData = {
      guest_id: newBooking.value.guest_id,
      room_id: newBooking.value.room_id,
      check_in_date: newBooking.value.check_in,
      check_out_date: newBooking.value.check_out,
      adults: newBooking.value.adults,
      children: newBooking.value.children,
      booking_source: 'direct'
    }

    const response = await api.post('/bookings', bookingData)
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Booking created successfully'
      })
      
      showCreateDialog.value = false
      
      // Reset form
      newBooking.value = {
        guest_id: null,
        check_in: '',
        check_out: '',
        room_id: null,
        adults: 1,
        children: 0
      }
      
      // Refresh calendar data
      await fetchCalendarData()
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create booking'
    })
  } finally {
    creating.value = false
  }
}

// Watch for date changes to refresh calendar
watch(currentDate, () => {
  fetchCalendarData()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchRooms(),
    fetchGuests(),
    fetchCalendarData()
  ])
})
</script>

<style scoped>
.calendar-container {
  min-height: 600px;
}

.calendar-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  background: #f5f5f5;
}

.room-column-header {
  width: 200px;
  padding: 16px;
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
}

.date-column-header {
  flex: 1;
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  min-width: 120px;
}

.date-column-header.today {
  background: #e3f2fd;
  color: #1976d2;
}

.date-day {
  font-size: 12px;
  text-transform: uppercase;
}

.date-number {
  font-size: 18px;
  font-weight: bold;
}

.calendar-body {
  max-height: 500px;
  overflow-y: auto;
}

.room-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  min-height: 80px;
}

.room-info {
  width: 200px;
  padding: 16px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
}

.room-number {
  font-weight: bold;
  font-size: 16px;
}

.room-type {
  font-size: 12px;
  color: #666;
}

.booking-grid {
  display: flex;
  flex: 1;
}

.date-cell {
  flex: 1;
  border-right: 1px solid #e0e0e0;
  min-height: 80px;
  position: relative;
  cursor: pointer;
  min-width: 120px;
}

.date-cell:hover {
  background: #f0f0f0;
}

.date-cell.today {
  background: #e3f2fd;
}

.date-cell.weekend {
  background: #f9f9f9;
}

.date-cell.past {
  background: #f5f5f5;
  cursor: not-allowed;
}

.booking-block {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.booking-confirmed {
  background: #4caf50;
  color: white;
}

.booking-pending {
  background: #ff9800;
  color: white;
}

.booking-checkedin {
  background: #2196f3;
  color: white;
}

.booking-cancelled {
  background: #f44336;
  color: white;
}

.booking-guest {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-nights {
  font-size: 10px;
  opacity: 0.8;
}

/* Month View Styles */
.month-calendar {
  min-height: 600px;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.month-day-header {
  padding: 16px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
}

.month-body {
  display: flex;
  flex-direction: column;
}

.month-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e0e0e0;
}

.month-date-cell {
  min-height: 120px;
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
}

.month-date-cell:hover {
  background: #f0f0f0;
}

.month-date-cell.today {
  background: #e3f2fd;
}

.month-date-cell.other-month {
  color: #ccc;
  background: #fafafa;
}

.month-date-cell.weekend {
  background: #f9f9f9;
}

.date-number {
  font-weight: bold;
  margin-bottom: 8px;
}

.bookings-summary {
  margin-top: 8px;
}

.occupancy-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.occupancy-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

.booking-count {
  font-size: 10px;
  color: #666;
}

/* Legend */
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>