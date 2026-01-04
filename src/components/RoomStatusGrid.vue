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
import { useRoomUpdates } from 'src/composables/useWebSocket'

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

const emit = defineEmits(['cell-click', 'booking-click', 'room-select', 'room-updated'])

// Mobile-specific reactive data
const selectedDate = ref(new Date())

// WebSocket integration for real-time room updates
useRoomUpdates((roomData) => {
  // Find the room in our current list and update it
  const roomIndex = props.rooms.findIndex(room => room.id === roomData.room_id)
  if (roomIndex !== -1) {
    // Emit event to parent to update the room data
    emit('room-updated', {
      roomId: roomData.room_id,
      oldStatus: roomData.old_status,
      newStatus: roomData.new_status,
      reason: roomData.reason,
      changedBy: roomData.changed_by,
      changedAt: roomData.changed_at
    })
    
    // Show visual feedback for the status change
    $q.notify({
      type: getRoomStatusNotificationType(roomData.new_status),
      message: `Room ${roomData.room_number} status changed`,
      caption: `${roomData.old_status} → ${roomData.new_status}`,
      position: 'top-right',
      timeout: 3000,
      actions: [
        { icon: 'close', color: 'white', round: true, handler: () => {} }
      ]
    })
  }
})

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

const getRoomStatusNotificationType = (status) => {
  const types = {
    available: 'positive',
    occupied: 'info',
    maintenance: 'warning',
    cleaning: 'info',
    out_of_order: 'negative'
  }
  return types[status] || 'info'
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Enhanced Mobile View Styles */
.mobile-room-view {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.mobile-header {
  margin-bottom: 20px;
  
  .text-h6 {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.4rem;
    margin-bottom: 16px;
  }
  
  .q-select {
    .q-field__control {
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: rgba(25, 118, 210, 0.5);
        background: rgba(255, 255, 255, 0.9);
      }
      
      &:focus-within {
        border-color: var(--q-primary);
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        background: white;
      }
    }
  }
}

.mobile-rooms {
  display: grid;
  gap: 16px;
}

.mobile-room-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-3px) scale(1.01);
  }
  
  .q-card-section {
    padding: 20px;
  }
  
  .text-h6 {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.2rem;
    margin-bottom: 4px;
  }
  
  .text-caption {
    color: #64748b;
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .text-body2 {
    color: #475569;
    font-weight: 500;
    margin-bottom: 8px;
    
    .q-icon {
      color: #64748b;
      margin-right: 8px;
    }
  }
  
  .q-badge {
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.mobile-room--available {
  border-left: 6px solid #10b981;
  
  &:hover {
    border-left-color: #059669;
  }
}

.mobile-room--occupied {
  border-left: 6px solid #3b82f6;
  
  &:hover {
    border-left-color: #2563eb;
  }
}

.mobile-room--maintenance {
  border-left: 6px solid #f59e0b;
  
  &:hover {
    border-left-color: #d97706;
  }
}

.mobile-room--cleaning {
  border-left: 6px solid #06b6d4;
  
  &:hover {
    border-left-color: #0891b2;
  }
}

.mobile-room--out_of_order {
  border-left: 6px solid #ef4444;
  
  &:hover {
    border-left-color: #dc2626;
  }
}

.mobile-booking-info {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 12px;
  margin-top: 12px;
}

.mobile-booking {
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .booking-guest {
    font-weight: 700;
    margin-bottom: 2px;
  }
  
  .booking-dates {
    font-size: 0.75rem;
    opacity: 0.8;
    font-weight: 500;
  }
}

/* Enhanced Desktop Grid Styles */
.desktop-grid {
  width: 100%;
  background: white;
}

.grid-header {
  display: flex;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.room-column-header {
  width: 220px;
  padding: 20px;
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-column-header {
  flex: 1;
  padding: 20px 12px;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(25, 118, 210, 0.05);
  }
  
  &.today {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    font-weight: 700;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    }
  }
}

.date-day {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 0.8;
}

.date-number {
  font-size: 1.3rem;
  font-weight: 800;
  margin-top: 4px;
}

.grid-body {
  max-height: 600px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
}

.room-row {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 90px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.02), rgba(25, 118, 210, 0.05));
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.room-info {
  width: 220px;
  padding: 20px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 2px;
    background: linear-gradient(180deg, transparent, rgba(25, 118, 210, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .room-row:hover &::after {
    opacity: 1;
  }
}

.room-number {
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 6px;
  color: #1e293b;
}

.room-type {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 10px;
  font-weight: 500;
}

.booking-cells {
  display: flex;
  flex: 1;
}

.date-cell {
  flex: 1;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 90px;
  position: relative;
  cursor: pointer;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.1));
    transform: scale(1.02);
  }
  
  &.today {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    }
  }
  
  &.weekend {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  }
  
  &.past {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.booking-block {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 3;
  }
}

.booking-confirmed {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.booking-pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.booking-checked_in {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.booking-checked_out {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.booking-cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.booking-no_show {
  background: linear-gradient(135deg, #78716c, #57534e);
  color: white;
}

.booking-guest {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.booking-nights {
  font-size: 0.7rem;
  opacity: 0.9;
  font-weight: 600;
}

.maintenance-indicator,
.cleaning-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 6px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.maintenance-indicator {
  color: #f59e0b;
}

.cleaning-indicator {
  color: #06b6d4;
}

/* Enhanced mobile responsiveness */
@media (max-width: 768px) {
  .mobile-room-view {
    padding: 12px;
  }
  
  .mobile-room-card {
    &:hover {
      transform: translateY(-3px) scale(1.01);
    }
    
    .q-card-section {
      padding: 16px;
    }
    
    .text-h6 {
      font-size: 1.1rem;
    }
  }
  
  .mobile-header .text-h6 {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .mobile-room-view {
    padding: 8px;
  }
  
  .mobile-room-card {
    margin-bottom: 12px;
    
    .q-card-section {
      padding: 12px;
    }
    
    .text-h6 {
      font-size: 1rem;
    }
  }
  
  .mobile-header {
    margin-bottom: 16px;
    
    .text-h6 {
      font-size: 1.1rem;
    }
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

/* Enhanced dark mode support */
.body--dark {
  .room-status-grid {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .mobile-room-view {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .mobile-header .text-h6 {
    color: #f1f5f9;
  }
  
  .mobile-room-card {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    
    .text-h6 {
      color: #f1f5f9;
    }
    
    .text-caption {
      color: #94a3b8;
    }
    
    .text-body2 {
      color: #cbd5e1;
    }
  }
  
  .desktop-grid {
    background: rgba(15, 23, 42, 0.9);
  }
  
  .grid-header {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  }
  
  .room-column-header {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
    color: #f1f5f9;
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .date-column-header {
    border-right-color: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    &.today {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%);
      color: #60a5fa;
    }
  }
  
  .room-row {
    border-bottom-color: rgba(255, 255, 255, 0.05);
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
    }
  }
  
  .room-info {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .room-number {
    color: #f1f5f9;
  }
  
  .room-type {
    color: #94a3b8;
  }
  
  .date-cell {
    border-right-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
    }
    
    &.today {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%);
    }
    
    &.weekend {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
    }
    
    &.past {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
    }
  }
}

/* Enhanced accessibility */
@media (prefers-reduced-motion: reduce) {
  .mobile-room-card,
  .room-row,
  .date-cell,
  .booking-block {
    transition: none !important;
    animation: none !important;
  }
}

/* Enhanced focus states */
.mobile-room-card:focus,
.date-cell:focus,
.booking-block:focus {
  outline: 3px solid var(--q-primary);
  outline-offset: 2px;
}

/* Enhanced loading states */
.loading-room-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 16px;
  height: 120px;
  margin-bottom: 16px;
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