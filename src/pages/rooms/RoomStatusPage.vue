<template>
  <q-page class="q-pa-md room-status-page">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between header-row">
              <div class="header-info">
                <div class="text-h6">Room Status Dashboard</div>
                <div class="text-subtitle2">Real-time room status management</div>
              </div>
              <div class="row q-gutter-sm header-actions">
                <q-btn 
                  color="primary" 
                  icon="refresh" 
                  :label="$q.screen.gt.xs ? 'Refresh' : ''"
                  @click="refreshRoomStatus"
                />
                <q-btn 
                  color="secondary" 
                  icon="settings" 
                  :label="$q.screen.gt.xs ? 'Settings' : ''"
                  outline
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Room Status Summary -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Status Summary</div>
            <div class="row q-gutter-md status-summary">
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <q-circular-progress
                    :value="roomStats.available"
                    size="80px"
                    :thickness="0.15"
                    color="positive"
                    track-color="grey-3"
                    class="q-ma-md status-progress"
                  >
                    <div class="text-h6 status-number">{{ roomStats.available }}</div>
                  </q-circular-progress>
                  <div class="text-subtitle2 status-label">Available</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <q-circular-progress
                    :value="roomStats.occupied"
                    size="80px"
                    :thickness="0.15"
                    color="negative"
                    track-color="grey-3"
                    class="q-ma-md status-progress"
                  >
                    <div class="text-h6 status-number">{{ roomStats.occupied }}</div>
                  </q-circular-progress>
                  <div class="text-subtitle2 status-label">Occupied</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <q-circular-progress
                    :value="roomStats.cleaning"
                    size="80px"
                    :thickness="0.15"
                    color="warning"
                    track-color="grey-3"
                    class="q-ma-md status-progress"
                  >
                    <div class="text-h6 status-number">{{ roomStats.cleaning }}</div>
                  </q-circular-progress>
                  <div class="text-subtitle2 status-label">Cleaning</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <q-circular-progress
                    :value="roomStats.maintenance"
                    size="80px"
                    :thickness="0.15"
                    color="info"
                    track-color="grey-3"
                    class="q-ma-md status-progress"
                  >
                    <div class="text-h6 status-number">{{ roomStats.maintenance }}</div>
                  </q-circular-progress>
                  <div class="text-subtitle2 status-label">Maintenance</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <q-circular-progress
                    :value="roomStats.outOfOrder"
                    size="80px"
                    :thickness="0.15"
                    color="grey"
                    track-color="grey-3"
                    class="q-ma-md status-progress"
                  >
                    <div class="text-h6 status-number">{{ roomStats.outOfOrder }}</div>
                  </q-circular-progress>
                  <div class="text-subtitle2 status-label">Out of Order</div>
                </div>
              </div>
              
              <div class="col-6 col-sm-4 col-md-2">
                <div class="text-center status-item">
                  <div class="text-h4 q-ma-md occupancy-rate">{{ occupancyRate }}%</div>
                  <div class="text-subtitle2 status-label">Occupancy Rate</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Floor View -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md floor-header">
              <div class="text-h6">Floor View</div>
              <q-select
                v-model="selectedFloor"
                :options="floorOptions"
                label="Select Floor"
                outlined
                dense
                class="floor-select"
                @update:model-value="filterRoomsByFloor"
              />
            </div>
            
            <div class="room-grid">
              <div 
                v-for="room in filteredRooms" 
                :key="room.id"
                class="room-card"
                :class="getRoomCardClass(room.status)"
                @click="selectRoom(room)"
              >
                <div class="room-number">{{ room.room_number }}</div>
                <div class="room-type">{{ room.room_type?.name }}</div>
                <div class="room-status">
                  <q-badge 
                    :color="getRoomStatusColor(room.status)"
                    :label="getRoomStatusLabel(room.status)"
                  />
                </div>
                <div v-if="room.guest_name" class="guest-name">
                  {{ room.guest_name }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Room Actions -->
      <div class="col-12" v-if="selectedRoom">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Actions - {{ selectedRoom.room_number }}</div>
            <div class="row q-gutter-sm room-actions">
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  v-if="selectedRoom.status === 'available'"
                  color="negative" 
                  icon="hotel" 
                  label="Mark Occupied" 
                  class="full-width-mobile"
                  @click="updateRoomStatus('occupied')"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  v-if="selectedRoom.status === 'occupied'"
                  color="warning" 
                  icon="cleaning_services" 
                  label="Start Cleaning" 
                  class="full-width-mobile"
                  @click="updateRoomStatus('cleaning')"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  v-if="selectedRoom.status === 'cleaning'"
                  color="positive" 
                  icon="check_circle" 
                  label="Cleaning Complete" 
                  class="full-width-mobile"
                  @click="updateRoomStatus('available')"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  color="info" 
                  icon="build" 
                  label="Maintenance" 
                  class="full-width-mobile"
                  @click="updateRoomStatus('maintenance')"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  color="grey" 
                  icon="block" 
                  label="Out of Order" 
                  class="full-width-mobile"
                  @click="updateRoomStatus('out_of_order')"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn 
                  color="primary" 
                  icon="visibility" 
                  label="View Details" 
                  outline
                  class="full-width-mobile"
                  @click="viewRoomDetails"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Room Details Dialog -->
    <q-dialog v-model="showRoomDialog" persistent>
      <q-card class="room-details-dialog">
        <q-card-section>
          <div class="text-h6">Room {{ selectedRoom?.room_number }} Details</div>
        </q-card-section>

        <q-card-section v-if="selectedRoom">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label overline>Room Type</q-item-label>
                <q-item-label>{{ selectedRoom.room_type?.name }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label overline>Floor</q-item-label>
                <q-item-label>{{ selectedRoom.floor }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label overline>Status</q-item-label>
                <q-item-label>
                  <q-badge 
                    :color="getRoomStatusColor(selectedRoom.status)"
                    :label="getRoomStatusLabel(selectedRoom.status)"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="selectedRoom.guest_name">
              <q-item-section>
                <q-item-label overline>Current Guest</q-item-label>
                <q-item-label>{{ selectedRoom.guest_name }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="selectedRoom.amenities">
              <q-item-section>
                <q-item-label overline>Amenities</q-item-label>
                <q-item-label>{{ selectedRoom.amenities.join(', ') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showRoomDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const selectedRoom = ref(null)
const selectedFloor = ref('All Floors')
const showRoomDialog = ref(false)
const loading = ref(false)

// Mock data - in real app this would come from API
const rooms = ref([
  { id: 1, room_number: '101', floor: 1, status: 'available', room_type: { name: 'Standard' }, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 2, room_number: '102', floor: 1, status: 'occupied', room_type: { name: 'Standard' }, guest_name: 'John Doe', amenities: ['WiFi', 'TV', 'AC'] },
  { id: 3, room_number: '103', floor: 1, status: 'cleaning', room_type: { name: 'Deluxe' }, amenities: ['WiFi', 'TV', 'AC', 'Minibar'] },
  { id: 4, room_number: '201', floor: 2, status: 'available', room_type: { name: 'Suite' }, amenities: ['WiFi', 'TV', 'AC', 'Minibar', 'Balcony'] },
  { id: 5, room_number: '202', floor: 2, status: 'maintenance', room_type: { name: 'Standard' }, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 6, room_number: '203', floor: 2, status: 'out_of_order', room_type: { name: 'Deluxe' }, amenities: ['WiFi', 'TV', 'AC', 'Minibar'] },
  { id: 7, room_number: '301', floor: 3, status: 'occupied', room_type: { name: 'Suite' }, guest_name: 'Jane Smith', amenities: ['WiFi', 'TV', 'AC', 'Minibar', 'Balcony'] },
  { id: 8, room_number: '302', floor: 3, status: 'available', room_type: { name: 'Standard' }, amenities: ['WiFi', 'TV', 'AC'] }
])

// Computed properties
const floorOptions = computed(() => {
  const floors = [...new Set(rooms.value.map(room => room.floor))].sort()
  return ['All Floors', ...floors.map(floor => `Floor ${floor}`)]
})

const filteredRooms = computed(() => {
  if (selectedFloor.value === 'All Floors') {
    return rooms.value
  }
  const floorNumber = parseInt(selectedFloor.value.replace('Floor ', ''))
  return rooms.value.filter(room => room.floor === floorNumber)
})

const roomStats = computed(() => {
  const stats = {
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
    outOfOrder: 0
  }
  
  rooms.value.forEach(room => {
    switch (room.status) {
      case 'available':
        stats.available++
        break
      case 'occupied':
        stats.occupied++
        break
      case 'cleaning':
        stats.cleaning++
        break
      case 'maintenance':
        stats.maintenance++
        break
      case 'out_of_order':
        stats.outOfOrder++
        break
    }
  })
  
  return stats
})

const occupancyRate = computed(() => {
  const totalRooms = rooms.value.length
  const occupiedRooms = roomStats.value.occupied
  return totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
})

// Methods
const refreshRoomStatus = async () => {
  loading.value = true
  try {
    // In real app, fetch from API
    await new Promise(resolve => setTimeout(resolve, 1000))
    $q.notify({
      type: 'positive',
      message: 'Room status refreshed'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh room status'
    })
  } finally {
    loading.value = false
  }
}

const filterRoomsByFloor = () => {
  // Filter is handled by computed property
}

const selectRoom = (room) => {
  selectedRoom.value = room
}

const getRoomCardClass = (status) => {
  return `room-card--${status}`
}

const getRoomStatusColor = (status) => {
  const colors = {
    available: 'positive',
    occupied: 'negative',
    cleaning: 'warning',
    maintenance: 'info',
    out_of_order: 'grey'
  }
  return colors[status] || 'grey'
}

const getRoomStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    occupied: 'Occupied',
    cleaning: 'Cleaning',
    maintenance: 'Maintenance',
    out_of_order: 'Out of Order'
  }
  return labels[status] || status
}

const updateRoomStatus = async (newStatus) => {
  if (!selectedRoom.value) return
  
  try {
    // In real app, call API
    selectedRoom.value.status = newStatus
    
    $q.notify({
      type: 'positive',
      message: `Room ${selectedRoom.value.room_number} status updated to ${getRoomStatusLabel(newStatus)}`
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update room status'
    })
  }
}

const viewRoomDetails = () => {
  showRoomDialog.value = true
}

// Lifecycle
onMounted(() => {
  // In real app, fetch rooms from API
})
</script>

<style scoped>
.room-status-page {
  padding: 16px;
}

.header-row {
  flex-wrap: wrap;
  gap: 16px;
}

.header-info {
  flex: 1;
  min-width: 200px;
}

.header-actions {
  flex-wrap: wrap;
}

.status-summary {
  justify-content: center;
}

.status-item {
  padding: 8px;
}

.status-progress {
  margin: 16px auto;
}

.status-number {
  font-size: 1.2rem;
}

.status-label {
  font-size: 0.9rem;
}

.occupancy-rate {
  margin: 16px auto;
  font-size: 2rem;
}

.floor-header {
  flex-wrap: wrap;
  gap: 16px;
}

.floor-select {
  min-width: 150px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.room-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.room-card--available {
  border-color: #4caf50;
  background: #f1f8e9;
}

.room-card--occupied {
  border-color: #f44336;
  background: #ffebee;
}

.room-card--cleaning {
  border-color: #ff9800;
  background: #fff3e0;
}

.room-card--maintenance {
  border-color: #2196f3;
  background: #e3f2fd;
}

.room-card--out_of_order {
  border-color: #9e9e9e;
  background: #fafafa;
}

.room-number {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 8px;
}

.room-type {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.room-status {
  margin-bottom: 8px;
}

.guest-name {
  font-size: 0.8em;
  color: #333;
  font-style: italic;
}

.room-actions {
  flex-wrap: wrap;
}

.full-width-mobile {
  width: 100%;
}

.room-details-dialog {
  min-width: 300px;
  max-width: 90vw;
  width: 500px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .room-status-page {
    padding: 8px;
  }
  
  .header-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .q-btn {
    flex: 1;
  }
  
  .status-summary {
    justify-content: space-around;
  }
  
  .status-progress {
    transform: scale(0.8);
    margin: 8px auto;
  }
  
  .status-number {
    font-size: 1rem;
  }
  
  .status-label {
    font-size: 0.8rem;
  }
  
  .occupancy-rate {
    font-size: 1.5rem;
    margin: 8px auto;
  }
  
  .floor-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .floor-select {
    width: 100%;
  }
  
  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .room-card {
    padding: 12px;
  }
  
  .room-number {
    font-size: 1.2em;
  }
  
  .room-actions {
    flex-direction: column;
  }
  
  .room-actions > div {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 8px;
  }
  
  .room-details-dialog {
    margin: 16px;
    width: calc(100vw - 32px);
  }
}

@media (max-width: 600px) {
  .status-summary > div {
    width: 50% !important;
    max-width: 50% !important;
  }
  
  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .room-card {
    padding: 8px;
  }
  
  .room-number {
    font-size: 1em;
  }
  
  .room-type {
    font-size: 0.8em;
  }
}

@media (max-width: 400px) {
  .room-status-page {
    padding: 4px;
  }
  
  .status-progress {
    transform: scale(0.7);
  }
  
  .room-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>