<template>
  <q-page class="q-pa-md">
    <div class="row justify-cente
      <!-- Connection Status -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">WebSocket Connection Test</div>
            
            <div class="row items-center q-gutter-md q-mb-md">
              <WebSocketStatus />
              <q-btn
                color="primary"
                label="Test Connection"
                @click="testConnection"
                :loading="testing"
              />
              <q-btn
                color="secondary"
                label="Reconnect"
                @click="reconnect"
                :disable="isConnected"
              />
            </div>

            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon 
                    :name="isConnected ? 'wifi' : 'wifi_off'" 
                    :color="isConnected ? 'positive' : 'negative'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Connection Status</q-item-label>
                  <q-item-label caption>{{ connectionState }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="router" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Active Channels</q-item-label>
                  <q-item-label caption>{{ channelCount }} subscribed</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="connectionInfo.socket_id">
                <q-item-section avatar>
                  <q-icon name="fingerprint" color="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Socket ID</q-item-label>
                  <q-item-label caption>{{ connectionInfo.socket_id }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Test Controls -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Test Room Status Updates</div>
            
            <q-form @submit="testRoomStatusUpdate" class="q-gutter-md">
              <q-select
                v-model="selectedRoom"
                :options="roomOptions"
                option-label="label"
                option-value="value"
                label="Select Room"
                emit-value
                map-options
              />
              
              <q-select
                v-model="newStatus"
                :options="statusOptions"
                label="New Status"
              />
              
              <q-input
                v-model="statusReason"
                label="Reason (optional)"
                type="textarea"
                rows="2"
              />
              
              <q-btn
                type="submit"
                color="primary"
                label="Send Test Update"
                :loading="sendingUpdate"
                :disable="!selectedRoom || !newStatus"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Test Housekeeping -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Test Housekeeping Tasks</div>
            
            <q-form @submit="testHousekeepingTask" class="q-gutter-md">
              <q-select
                v-model="housekeepingRoom"
                :options="roomOptions"
                option-label="label"
                option-value="value"
                label="Select Room"
                emit-value
                map-options
              />
              
              <q-select
                v-model="taskType"
                :options="taskTypeOptions"
                label="Task Type"
              />
              
              <q-select
                v-model="taskPriority"
                :options="priorityOptions"
                label="Priority"
              />
              
              <q-input
                v-model="taskNotes"
                label="Notes (optional)"
                type="textarea"
                rows="2"
              />
              
              <q-btn
                type="submit"
                color="secondary"
                label="Send Housekeeping Task"
                :loading="sendingTask"
                :disable="!housekeepingRoom || !taskType"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Event Log -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Real-time Event Log</div>
              <q-btn
                flat
                round
                icon="clear"
                @click="clearEventLog"
                color="negative"
              >
                <q-tooltip>Clear log</q-tooltip>
              </q-btn>
            </div>
            
            <div class="event-log">
              <div 
                v-for="(event, index) in eventLog" 
                :key="index"
                class="event-item q-pa-sm q-mb-sm"
                :class="getEventClass(event.type)"
              >
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-weight-bold">{{ event.type }}</div>
                    <div class="text-caption">{{ event.timestamp }}</div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="expand_more"
                      @click="event.expanded = !event.expanded"
                    />
                  </div>
                </div>
                
                <div v-if="event.expanded" class="q-mt-sm">
                  <pre class="event-data">{{ JSON.stringify(event.data, null, 2) }}</pre>
                </div>
              </div>
              
              <div v-if="eventLog.length === 0" class="text-center text-grey-5 q-pa-lg">
                No events received yet. Try sending a test update above.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useWebSocket, useRoomUpdates, useStaffUpdates } from 'src/composables/useWebSocket'
import WebSocketStatus from 'src/components/WebSocketStatus.vue'

const $q = useQuasar()

// WebSocket composable
const {
  isConnected,
  connectionState,
  channelCount,
  reconnect,
  getConnectionInfo
} = useWebSocket()

// State
const testing = ref(false)
const sendingUpdate = ref(false)
const sendingTask = ref(false)
const eventLog = ref([])
const rooms = ref([])

// Form data
const selectedRoom = ref(null)
const newStatus = ref(null)
const statusReason = ref('')
const housekeepingRoom = ref(null)
const taskType = ref(null)
const taskPriority = ref('normal')
const taskNotes = ref('')

// Options
const statusOptions = [
  'available',
  'occupied',
  'cleaning',
  'maintenance',
  'out_of_order'
]

const taskTypeOptions = [
  'cleaning',
  'deep_cleaning',
  'maintenance',
  'inspection',
  'setup'
]

const priorityOptions = [
  'low',
  'normal',
  'high',
  'urgent'
]

// Computed
const connectionInfo = computed(() => getConnectionInfo())

const roomOptions = computed(() => {
  return rooms.value.map(room => ({
    label: `Room ${room.number} (${room.room_type?.name || 'Standard'})`,
    value: room.id
  }))
})

// WebSocket event handlers
useRoomUpdates((data) => {
  addEventToLog('room.status.changed', data)
})

useStaffUpdates('housekeeping', (type, data) => {
  addEventToLog(`housekeeping.${type}`, data)
})

useStaffUpdates('frontdesk', (type, data) => {
  addEventToLog(`frontdesk.${type}`, data)
})

// Methods
const testConnection = async () => {
  testing.value = true
  try {
    const response = await api.get('/websocket/test')
    
    $q.notify({
      type: 'positive',
      message: 'WebSocket test successful',
      caption: response.data.message
    })
    
    addEventToLog('connection.test', response.data)
  } catch (error) {
    console.error('WebSocket test failed:', error)
    $q.notify({
      type: 'negative',
      message: 'WebSocket test failed',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    testing.value = false
  }
}

const testRoomStatusUpdate = async () => {
  sendingUpdate.value = true
  try {
    const response = await api.post('/websocket/test-room-status', {
      room_id: selectedRoom.value,
      new_status: newStatus.value,
      reason: statusReason.value || null
    })
    
    $q.notify({
      type: 'positive',
      message: 'Room status update sent',
      caption: response.data.message
    })
    
    // Reset form
    selectedRoom.value = null
    newStatus.value = null
    statusReason.value = ''
  } catch (error) {
    console.error('Failed to send room status update:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to send update',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    sendingUpdate.value = false
  }
}

const testHousekeepingTask = async () => {
  sendingTask.value = true
  try {
    const response = await api.post('/websocket/test-housekeeping', {
      room_id: housekeepingRoom.value,
      task_type: taskType.value,
      priority: taskPriority.value,
      notes: taskNotes.value || null
    })
    
    $q.notify({
      type: 'positive',
      message: 'Housekeeping task sent',
      caption: response.data.message
    })
    
    // Reset form
    housekeepingRoom.value = null
    taskType.value = null
    taskPriority.value = 'normal'
    taskNotes.value = ''
  } catch (error) {
    console.error('Failed to send housekeeping task:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to send task',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    sendingTask.value = false
  }
}

const addEventToLog = (type, data) => {
  eventLog.value.unshift({
    type,
    data,
    timestamp: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    expanded: false
  })
  
  // Keep only last 50 events
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

const clearEventLog = () => {
  eventLog.value = []
}

const getEventClass = (eventType) => {
  if (eventType.includes('error')) return 'event-error'
  if (eventType.includes('room')) return 'event-room'
  if (eventType.includes('housekeeping')) return 'event-housekeeping'
  if (eventType.includes('reservation')) return 'event-reservation'
  return 'event-default'
}

const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms')
    rooms.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.event-log {
  max-height: 400px;
  overflow-y: auto;
}

.event-item {
  border-radius: 4px;
  border-left: 4px solid #ddd;
}

.event-error {
  background-color: #ffebee;
  border-left-color: #f44336;
}

.event-room {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.event-housekeeping {
  background-color: #fff3e0;
  border-left-color: #ff9800;
}

.event-reservation {
  background-color: #e8f5e8;
  border-left-color: #4caf50;
}

.event-default {
  background-color: #f5f5f5;
  border-left-color: #9e9e9e;
}

.event-data {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>