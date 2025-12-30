<template>
  <div class="room-status-grid">
    <!-- Mobile View -->
    <div v-if="$q.screen.lt.md" class="mobile-room-view">
      <div class="mobile-header">
        <div class="text-h6 q-mb-md">Room Status</div>
        <q-select
          v-model="selectedDate"
          :options="dateOptions"
          label="Select Date"
          outlined
          dense
          class="q-mb-md"
        />
      </div>
      
      <div class="mobile-rooms">
        <q-card 
          v-for="room in rooms" 
          :key="room.id"
          class="mobile-room-card q-mb-sm"
          :class="getMobileRoomClass(room.status)"
          @click="selectRoom(room)"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-h6">{{ room.room_number }}</div>
                <div class="text-caption text-grey-6">{{ room.room_type?.name || 'Unknown' }}</div>
              </div>
              <div class="col-auto">
                <q-badge 
                  :color="getRoomStatusColor(room.status)"
                  :label="room.status"
                />
              </div>
            </div>
            
            <div v-if="room.guest_name" class="q-mt-sm">
              <div class="text-body2">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                {{ room.guest_name }}
              </div>
            </div>
            
            <div class="mobile-booking-info q-mt-sm">
              <div 
                v-for="booking in getBookingsForRoom(room.id)"
                :key="booking.id"
                class="mobile-booking"
                :class="getBookingClass(booking)"
              >
                <div class="booking-guest">{{ booking.guest_name }}</div>
                <div class="booking-dates">{{ formatBookingDates(booking) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
    <!-- Desktop Grid View -->
    <div v-else class="desktop-grid">
      <div class="grid-header">
        <div class="room-column-header">Rooms</div>
        <div 
          v-for="date in dates" 
          :key="date.toISOString()"
          class="date-column-header"
          :class="{ 'today': isToday(date) }"
        >
          <div class="date-day">{{ formatDay(date) }}</div>
          <div class="date-number">{{ date.getDate() }}</div>
        </div>
      </div>
      
      <div class="grid-body">
        <div 
          v-for="room in rooms" 
          :key="room.id"
          class="room-row"
        >
          <div class="room-info">
            <div class="room-number">{{ room.room_number }}</div>
            <div class="room-type">{{ room.room_type?.name || 'Unknown' }}</div>
            <q-badge 
              :color="getRoomStatusColor(room.status)"
              :label="room.status"
              class="q-mt-xs"
            />
          </div>
          
          <div class="booking-cells">
            <div 
              v-for="date in dates" 
              :key="`${room.id}-${date.toISOString()}`"
              class="date-cell"
              :class="{ 
                'today': isToday(date),
                'weekend': isWeekend(date),
                'past': isPast(date)
              }"
              @click="onCellClick(room, date)"
            >
              <div 
                v-for="booking in getBookingsForRoomAndDate(room.id, date)"
                :key="booking.id"
                class="booking-block"
                :class="getBookingClass(booking)"
                @click.stop="onBookingClick(booking)"
              >
                <div class="booking-guest">{{ booking.guest_name }}</div>
                <div class="booking-nights">{{ booking.nights }}n</div>
              </div>
              
              <!-- Room maintenance indicator -->
              <div 
                v-if="room.status === 'maintenance' || room.status === 'out_of_order'"
                class="maintenance-indicator"
              >
                <q-icon name="build" size="xs" />
              </div>
              
              <!-- Cleaning indicator -->
              <div 
                v-if="room.status === 'cleaning'"
                class="cleaning-indicator"
              >
                <q-icon name="cleaning_services" size="xs" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  rooms: {
    type: Array,
    required: true
  },
  dates: {
    type: Array,
    required: true
  },
  bookings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cell-click', 'booking-click', 'room-select'])

// Mobile-specific reactive data
const selectedDate = ref(new Date())

// Computed properties
const dateOptions = computed(() => {
  return props.dates.map(date => ({
    label: formatDateOption(date),
    value: date
  }))
})

// Methods
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

const formatDay = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

const formatDateOption = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatBookingDates = (booking) => {
  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)
  return `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
}

const getRoomStatusColor = (status) => {
  const colors = {
    available: 'positive',
    occupied: 'primary',
    maintenance: 'warning',
    cleaning: 'info',
    out_of_order: 'negative'
  }
  return colors[status] || 'grey'
}

const getMobileRoomClass = (status) => {
  return `mobile-room--${status}`
}

const getBookingsForRoom = (roomId) => {
  return props.bookings.filter(booking => booking.room_id === roomId)
}

const getBookingsForRoomAndDate = (roomId, date) => {
  return props.bookings.filter(booking => {
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    return booking.room_id === roomId && 
           date >= checkIn && 
           date < checkOut
  })
}

const getBookingClass = (booking) => {
  return `booking-${booking.status}`
}

const selectRoom = (room) => {
  emit('room-select', room)
}

const onCellClick = (room, date) => {
  emit('cell-click', { room, date })
}

const onBookingClick = (booking) => {
  emit('booking-click', booking)
}
</script>

<style scoped>
.room-status-grid {
  min-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

/* Mobile View Styles */
.mobile-room-view {
  padding: 16px;
}

.mobile-header {
  margin-bottom: 16px;
}

.mobile-room-card {
  border-left: 4px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.mobile-room-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.mobile-room--available {
  border-left-color: #4caf50;
}

.mobile-room--occupied {
  border-left-color: #2196f3;
}

.mobile-room--maintenance {
  border-left-color: #ff9800;
}

.mobile-room--cleaning {
  border-left-color: #00bcd4;
}

.mobile-room--out_of_order {
  border-left-color: #f44336;
}

.mobile-booking-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
}

.mobile-booking {
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.mobile-booking .booking-guest {
  font-weight: bold;
}

.mobile-booking .booking-dates {
  font-size: 10px;
  opacity: 0.8;
}

/* Desktop Grid Styles */
.desktop-grid {
  width: 100%;
}

.grid-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  background: #f5f5f5;
}

.room-column-header {
  width: 200px;
  padding: 16px;
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
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
  font-weight: 500;
}

.date-number {
  font-size: 18px;
  font-weight: bold;
  margin-top: 4px;
}

.grid-body {
  max-height: 500px;
  overflow-y: auto;
}

.room-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  min-height: 80px;
}

.room-row:hover {
  background: #f9f9f9;
}

.room-info {
  width: 200px;
  padding: 16px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.room-number {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.room-type {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.booking-cells {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  z-index: 2;
}

.booking-block:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.booking-confirmed {
  background: #4caf50;
  color: white;
}

.booking-pending {
  background: #ff9800;
  color: white;
}

.booking-checked_in {
  background: #2196f3;
  color: white;
}

.booking-checked_out {
  background: #9e9e9e;
  color: white;
}

.booking-cancelled {
  background: #f44336;
  color: white;
}

.booking-no_show {
  background: #795548;
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

.maintenance-indicator,
.cleaning-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 2px;
  z-index: 1;
}

.maintenance-indicator {
  color: #ff9800;
}

.cleaning-indicator {
  color: #2196f3;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .mobile-room-view {
    padding: 8px;
  }
  
  .mobile-room-card .q-card-section {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .mobile-room-view {
    padding: 4px;
  }
  
  .mobile-room-card {
    margin-bottom: 4px;
  }
}

/* Hide desktop view on mobile */
@media (max-width: 768px) {
  .desktop-grid {
    display: none;
  }
}

/* Hide mobile view on desktop */
@media (min-width: 769px) {
  .mobile-room-view {
    display: none;
  }
}
</style>