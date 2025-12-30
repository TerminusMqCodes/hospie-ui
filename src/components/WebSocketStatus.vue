<template>
  <q-chip 
    :color="statusColor"
    text-color="white"
    :icon="statusIcon"
    size="sm"
    class="websocket-status"
    :class="{ 'pulse': !isConnected }"
    @click="showDetails = true"
  >
    {{ statusText }}
    <q-tooltip>
      Click for WebSocket details
    </q-tooltip>
  </q-chip>

  <!-- WebSocket Details Dialog -->
  <q-dialog v-model="showDetails">
    <q-card class="websocket-details">
      <q-card-section>
        <div class="text-h6">WebSocket Connection Status</div>
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon 
                :name="statusIcon" 
                :color="statusColor"
                size="md"
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

          <q-item v-if="lastError">
            <q-item-section avatar>
              <q-icon name="error" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Last Error</q-item-label>
              <q-item-label caption>{{ lastError.message || 'Unknown error' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="info" color="info" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Connection Info</q-item-label>
              <q-item-label caption>
                <div v-if="connectionInfo.socket_id">
                  Socket ID: {{ connectionInfo.socket_id }}
                </div>
                <div v-if="connectionInfo.channels">
                  Channels: {{ connectionInfo.channels.join(', ') }}
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          v-if="!isConnected"
          flat 
          label="Reconnect" 
          color="primary" 
          @click="handleReconnect"
        />
        <q-btn 
          flat 
          label="Close" 
          color="primary" 
          @click="showDetails = false" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useWebSocket } from 'src/composables/useWebSocket'

const $q = useQuasar()
const showDetails = ref(false)

const {
  isConnected,
  connectionState,
  channelCount,
  lastError,
  reconnect,
  getConnectionInfo
} = useWebSocket()

const connectionInfo = computed(() => getConnectionInfo())

const statusColor = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'positive'
    case 'connecting':
      return 'warning'
    case 'disconnected':
    case 'disconnecting':
      return 'negative'
    case 'error':
      return 'negative'
    default:
      return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'wifi'
    case 'connecting':
      return 'wifi_find'
    case 'disconnected':
    case 'disconnecting':
      return 'wifi_off'
    case 'error':
      return 'wifi_off'
    default:
      return 'help'
  }
})

const statusText = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting'
    case 'disconnected':
      return 'Disconnected'
    case 'disconnecting':
      return 'Disconnecting'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
})

const handleReconnect = () => {
  reconnect()
  $q.notify({
    type: 'info',
    message: 'Attempting to reconnect...'
  })
  showDetails.value = false
}
</script>

<style scoped>
.websocket-status {
  cursor: pointer;
  transition: all 0.3s ease;
}

.websocket-status:hover {
  transform: scale(1.05);
}

.websocket-status.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.websocket-details {
  min-width: 300px;
  max-width: 90vw;
  width: 400px;
}
</style>