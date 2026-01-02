<template>
  <div class="real-time-room-status">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Real-time Room Status</div>
      <div class="row items-center q-gutter-sm">
        <WebSocketStatus />
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          @click="refreshRooms"
          :loading="loading"
        >
          <q-tooltip>Refresh room status</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="row q-gutter-md">
      <div 
        v-for="room in rooms" 
        :key="room.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card 
          class="room-card"
          :class="getRoomCardClass(room)"
          @click="showRoomDetails(room)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                {{ room.number }}
              </div>
              <q-badge 
                :color="getStatusColor(room.status)"
                :label="room.status"
                class="text-capitalize"
              />
            </div>
            
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ room.room_type?.name || 'Standard' }}
            </div>
            
            <div v-if="room.current_guest" class="text-body2 q-mt-sm">
              <q-icon name="person" size="xs" class="q-mr-xs" />
              {{ room.current_guest }}
            </div>
            
            <div v-if="room.last_updated" class="text-caption text-grey-5 q-mt-xs">
              Updated: {{ formatTime(room.last_updated) }}
            </div>
          </q-card-section>

          <!-- Real-time update indicator -->
          <div 
            v-if="room.recently_updated"
            class="update-indicator"
          >
            <q-icon name="fiber_manual_record" size="xs" color="positive" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Room Details Dialog -->
    <q-dialog v-model="showDetails" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Room {{ selectedRoom?.number }} Details</div>
        </q-card-section>

        <q-card-section v-if="selectedRoom">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Status</q-item-label>
                <q-item-label caption>
                  <q-badge 
                    :color="getStatusColor(selectedRoom.status)"
                    :label="selectedRoom.status"
                    class="text-capitalize"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Room Type</q-item-label>
                <q-item-label caption>{{ selectedRoom.room_type?.name || 'Standard' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedRoom.current_guest">
              <q-item-section>
                <q-item-label>Current Guest</q-item-label>
                <q-item-label caption>{{ selectedRoom.current_guest }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Last Updated</q-item-label>
                <q-item-label caption>{{ formatDateTime(selectedRoom.last_updated) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-md">
            <q-btn-group flat>
              <q-btn 
                flat 
                label="Mark Clean" 
                color="positive"
                @click="updateRoomStatus('available')"
                :disable="selectedRoom.status === 'available'"
              />
              <q-btn 
                flat 
                label="Cleaning" 
                color="warning"
                @click="updateRoomStatus('cleaning')"
                :disable="selectedRoom.status === 'cleaning'"
              />
              <q-btn 
                flat 
                label="Maintenance" 
                color="negative"
                @click="updateRoomStatus('maintenance')"
                :disable="selectedRoom.status === 'maintenance'"
              />
            </q-btn-group>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showDetails = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useRoomUpdates } from 'src/composables/useWebSocket'
import WebSocketStatus from './WebSocketStatus.vue'

const $q = useQuasar()

// State
const rooms = ref([])
const loading = ref(false)
const showDetails = ref(false)
const selectedRoom = ref(null)
const recentlyUpdatedRooms = ref(new Set())

// WebSocket integration
useRoomUpdates((data) => {
  handleRoomUpdate(data)
})

// Computed
// (No computed properties currently used)

// Methods
const fetchRooms = async () => {
  loading.value = true
  try {
    const response = await api.get('/rooms')
    rooms.value = response.data.data.map(room => ({
      ...room,
      recently_updated: false,
      last_updated: new Date()
    }))
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load room data'
    })
  } finally {
    loading.value = false
  }
}

const refreshRooms = () => {
  fetchRooms()
}

const handleRoomUpdate = (data) => {
  console.log('Room update received:', data)
  
  // Find and update the room
  const roomIndex = rooms.value.findIndex(room => room.id === data.room_id)
  if (roomIndex !== -1) {
    const updatedRoom = {
      ...rooms.value[roomIndex],
      status: data.new_status,
      recently_updated: true,
      last_updated: new Date(data.changed_at)
    }
    
    rooms.value[roomIndex] = updatedRoom
    
    // Add to recently updated set
    recentlyUpdatedRooms.value.add(data.room_id)
    
    // Remove from recently updated after 5 seconds
    setTimeout(() => {
      recentlyUpdatedRooms.value.delete(data.room_id)
      if (rooms.value[roomIndex]) {
        rooms.value[roomIndex].recently_updated = false
      }
    }, 5000)
    
    // Show notification
    $q.notify({
      type: 'info',
      message: `Room ${data.room_number} status changed`,
      caption: `${data.old_status} → ${data.new_status}`,
      timeout: 3000
    })
  }
}

const showRoomDetails = (room) => {
  selectedRoom.value = room
  showDetails.value = true
}

const updateRoomStatus = async (newStatus) => {
  if (!selectedRoom.value) return
  
  try {
    await api.post(`/rooms/${selectedRoom.value.id}/change-status`, {
      status: newStatus,
      reason: 'Manual update from dashboard'
    })
    
    $q.notify({
      type: 'positive',
      message: 'Room status updated successfully'
    })
    
    showDetails.value = false
  } catch (error) {
    console.error('Failed to update room status:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update room status'
    })
  }
}

const getRoomCardClass = (room) => {
  const classes = ['cursor-pointer']
  
  if (room.recently_updated) {
    classes.push('room-updated')
  }
  
  switch (room.status) {
    case 'available':
      classes.push('room-available')
      break
    case 'occupied':
      classes.push('room-occupied')
      break
    case 'cleaning':
      classes.push('room-cleaning')
      break
    case 'maintenance':
      classes.push('room-maintenance')
      break
    case 'out_of_order':
      classes.push('room-out-of-order')
      break
  }
  
  return classes
}

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'positive'
    case 'occupied':
      return 'primary'
    case 'cleaning':
      return 'warning'
    case 'maintenance':
      return 'orange'
    case 'out_of_order':
      return 'negative'
    default:
      return 'grey'
  }
}

const formatTime = (dateTime) => {
  if (!dateTime) return ''
  return date.formatDate(dateTime, 'HH:mm')
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return date.formatDate(dateTime, 'YYYY-MM-DD HH:mm:ss')
}

// Lifecycle
onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.real-time-room-status {
  padding: 16px;
}

.room-card {
  position: relative;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-available {
  border-left-color: #21BA45;
}

.room-occupied {
  border-left-color: #1976D2;
}

.room-cleaning {
  border-left-color: #F2C037;
}

.room-maintenance {
  border-left-color: #FF9800;
}

.room-out-of-order {
  border-left-color: #C10015;
}

.room-updated {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 186, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 186, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 186, 69, 0);
  }
}

.update-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>