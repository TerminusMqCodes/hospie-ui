<template>
  <div class="connection-status">
    <q-chip 
      :color="statusColor" 
      :text-color="textColor"
      :icon="statusIcon"
      size="sm"
      class="connection-chip"
    >
      {{ statusText }}
    </q-chip>
    
    <q-tooltip v-if="showTooltip">
      <div class="connection-tooltip">
        <div><strong>Status:</strong> {{ connectionState }}</div>
        <div v-if="socketId"><strong>Socket ID:</strong> {{ socketId }}</div>
        <div><strong>Channels:</strong> {{ channelCount }}</div>
        <div v-if="lastError"><strong>Last Error:</strong> {{ lastError.message }}</div>
      </div>
    </q-tooltip>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useWebSocket } from 'src/composables/useWebSocket'

export default {
  name: 'ConnectionStatus',
  
  props: {
    showTooltip: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const { 
      isConnected, 
      connectionState, 
      channelCount, 
      lastError,
      getConnectionInfo 
    } = useWebSocket()

    const statusColor = computed(() => {
      switch (connectionState.value) {
        case 'connected': return 'positive'
        case 'connecting': return 'warning'
        case 'disconnected': return 'grey'
        case 'error': return 'negative'
        default: return 'grey'
      }
    })

    const textColor = computed(() => {
      return connectionState.value === 'disconnected' ? 'grey-8' : 'white'
    })

    const statusIcon = computed(() => {
      switch (connectionState.value) {
        case 'connected': return 'wifi'
        case 'connecting': return 'wifi_find'
        case 'disconnected': return 'wifi_off'
        case 'error': return 'error'
        default: return 'help'
      }
    })

    const statusText = computed(() => {
      switch (connectionState.value) {
        case 'connected': return 'Connected'
        case 'connecting': return 'Connecting...'
        case 'disconnected': return 'Offline'
        case 'error': return 'Error'
        default: return 'Unknown'
      }
    })

    const socketId = computed(() => {
      const info = getConnectionInfo()
      return info.socket_id
    })

    return {
      isConnected,
      connectionState,
      channelCount,
      lastError,
      statusColor,
      textColor,
      statusIcon,
      statusText,
      socketId
    }
  }
}
</script>

<style lang="sass" scoped>
.connection-status
  display: inline-block

.connection-chip
  cursor: help

.connection-tooltip
  font-size: 12px
  line-height: 1.4
  
  div
    margin-bottom: 2px
    
    &:last-child
      margin-bottom: 0
</style>