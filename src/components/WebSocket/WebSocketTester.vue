<template>
  <q-card class="websocket-tester">
    <q-card-section>
      <div class="text-h6">
        <q-icon name="wifi" class="q-mr-sm" />
        WebSocket Connection Tester
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-md">
        <!-- Connection Status -->
        <div class="col-12">
          <ConnectionStatus show-tooltip />
        </div>

        <!-- Test Buttons -->
        <div class="col-12">
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              icon="wifi"
              label="Test Connection"
              @click="testConnection"
              :loading="loading.connection"
            />
            
            <q-btn
              color="secondary"
              icon="meeting_room"
              label="Test Room Status"
              @click="testRoomStatus"
              :loading="loading.room"
            />
            
            <q-btn
              color="accent"
              icon="event"
              label="Test Reservation"
              @click="testReservation"
              :loading="loading.reservation"
            />
            
            <q-btn
              color="info"
              icon="cleaning_services"
              label="Test Housekeeping"
              @click="testHousekeeping"
              :loading="loading.housekeeping"
            />
            
            <q-btn
              color="warning"
              icon="build"
              label="Test Maintenance"
              @click="testMaintenance"
              :loading="loading.maintenance"
            />
          </div>
        </div>

        <!-- Connection Info -->
        <div class="col-12">
          <q-expansion-item
            icon="info"
            label="Connection Information"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <pre class="connection-info">{{ JSON.stringify(connectionInfo, null, 2) }}</pre>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Test Results -->
        <div class="col-12" v-if="testResults.length > 0">
          <q-list bordered separator>
            <q-item-label header>Test Results</q-item-label>
            <q-item
              v-for="result in testResults"
              :key="result.id"
              class="test-result-item"
            >
              <q-item-section avatar>
                <q-icon
                  :name="result.success ? 'check_circle' : 'error'"
                  :color="result.success ? 'positive' : 'negative'"
                />
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ result.test }}</q-item-label>
                <q-item-label caption>
                  {{ result.message }}
                </q-item-label>
                <q-item-label caption class="text-grey-6">
                  {{ formatTime(result.timestamp) }}
                </q-item-label>
              </q-item-section>
              
              <q-item-section side v-if="result.data">
                <q-btn
                  flat
                  dense
                  icon="code"
                  @click="showResultData(result)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>

    <!-- Result Data Dialog -->
    <q-dialog v-model="showDataDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Test Result Data</div>
        </q-card-section>
        
        <q-card-section>
          <pre class="result-data">{{ JSON.stringify(selectedResult?.data, null, 2) }}</pre>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'
import { date } from 'quasar'
import ConnectionStatus from './ConnectionStatus.vue'

export default {
  name: 'WebSocketTester',
  
  components: {
    ConnectionStatus
  },

  setup() {
    const loading = ref({
      connection: false,
      room: false,
      reservation: false,
      housekeeping: false,
      maintenance: false
    })
    
    const testResults = ref([])
    const connectionInfo = ref({})
    const showDataDialog = ref(false)
    const selectedResult = ref(null)
    let resultCounter = 0

    const addTestResult = (test, success, message, data = null) => {
      testResults.value.unshift({
        id: ++resultCounter,
        test,
        success,
        message,
        data,
        timestamp: new Date()
      })
      
      // Keep only last 10 results
      if (testResults.value.length > 10) {
        testResults.value = testResults.value.slice(0, 10)
      }
    }

    const testConnection = async () => {
      loading.value.connection = true
      
      try {
        const response = await api.post('/websocket/test-connection')
        
        addTestResult(
          'Connection Test',
          response.data.success,
          response.data.message,
          response.data
        )
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'WebSocket connection test successful'
          })
        }
      } catch (error) {
        addTestResult(
          'Connection Test',
          false,
          error.response?.data?.message || error.message,
          error.response?.data
        )
        
        Notify.create({
          type: 'negative',
          message: 'WebSocket connection test failed'
        })
      } finally {
        loading.value.connection = false
      }
    }

    const testRoomStatus = async () => {
      loading.value.room = true
      
      try {
        // Use a mock room ID - in real app, get from rooms list
        const response = await api.post('/websocket/test-room-status', {
          room_id: 1,
          new_status: 'cleaning',
          reason: 'Test room status change'
        })
        
        addTestResult(
          'Room Status Test',
          response.data.success,
          response.data.message,
          response.data
        )
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Room status change event sent'
          })
        }
      } catch (error) {
        addTestResult(
          'Room Status Test',
          false,
          error.response?.data?.message || error.message,
          error.response?.data
        )
        
        Notify.create({
          type: 'negative',
          message: 'Room status test failed'
        })
      } finally {
        loading.value.room = false
      }
    }

    const testReservation = async () => {
      loading.value.reservation = true
      
      try {
        // Use a mock reservation ID - in real app, get from reservations list
        const response = await api.post('/websocket/test-reservation', {
          event_type: 'created',
          reservation_id: 1
        })
        
        addTestResult(
          'Reservation Test',
          response.data.success,
          response.data.message,
          response.data
        )
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Reservation event sent'
          })
        }
      } catch (error) {
        addTestResult(
          'Reservation Test',
          false,
          error.response?.data?.message || error.message,
          error.response?.data
        )
        
        Notify.create({
          type: 'negative',
          message: 'Reservation test failed'
        })
      } finally {
        loading.value.reservation = false
      }
    }

    const testHousekeeping = async () => {
      loading.value.housekeeping = true
      
      try {
        const response = await api.post('/websocket/test-housekeeping', {
          room_id: 1,
          assigned_to: 1, // Mock user ID
          task_type: 'checkout_cleaning',
          notes: 'Test housekeeping task assignment'
        })
        
        addTestResult(
          'Housekeeping Test',
          response.data.success,
          response.data.message,
          response.data
        )
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Housekeeping task event sent'
          })
        }
      } catch (error) {
        addTestResult(
          'Housekeeping Test',
          false,
          error.response?.data?.message || error.message,
          error.response?.data
        )
        
        Notify.create({
          type: 'negative',
          message: 'Housekeeping test failed'
        })
      } finally {
        loading.value.housekeeping = false
      }
    }

    const testMaintenance = async () => {
      loading.value.maintenance = true
      
      try {
        const response = await api.post('/websocket/test-maintenance', {
          room_id: 1,
          maintenance_type: 'hvac_repair',
          scheduled_date: new Date().toISOString(),
          assigned_to: 1, // Mock user ID
          description: 'Test maintenance scheduling',
          priority: 'medium'
        })
        
        addTestResult(
          'Maintenance Test',
          response.data.success,
          response.data.message,
          response.data
        )
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Maintenance scheduling event sent'
          })
        }
      } catch (error) {
        addTestResult(
          'Maintenance Test',
          false,
          error.response?.data?.message || error.message,
          error.response?.data
        )
        
        Notify.create({
          type: 'negative',
          message: 'Maintenance test failed'
        })
      } finally {
        loading.value.maintenance = false
      }
    }

    const loadConnectionInfo = async () => {
      try {
        const response = await api.get('/websocket/connection-info')
        connectionInfo.value = response.data
      } catch (error) {
        console.error('Failed to load connection info:', error)
      }
    }

    const showResultData = (result) => {
      selectedResult.value = result
      showDataDialog.value = true
    }

    const formatTime = (timestamp) => {
      return date.formatDate(timestamp, 'HH:mm:ss')
    }

    onMounted(() => {
      loadConnectionInfo()
    })

    return {
      loading,
      testResults,
      connectionInfo,
      showDataDialog,
      selectedResult,
      testConnection,
      testRoomStatus,
      testReservation,
      testHousekeeping,
      testMaintenance,
      showResultData,
      formatTime
    }
  }
}
</script>

<style lang="sass" scoped>
.websocket-tester
  max-width: 800px

.connection-info,
.result-data
  background: #f5f5f5
  padding: 12px
  border-radius: 4px
  font-size: 12px
  line-height: 1.4
  overflow-x: auto
  white-space: pre-wrap

.test-result-item
  &:hover
    background-color: rgba(0, 0, 0, 0.02)
</style>