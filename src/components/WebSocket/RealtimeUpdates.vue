<template>
  <div class="realtime-updates">
    <q-card v-if="showUpdates && updates.length > 0" class="updates-card">
      <q-card-section class="q-pb-none">
        <div class="text-subtitle2 text-grey-7">
          <q-icon name="update" class="q-mr-xs" />
          Real-time Updates
        </div>
      </q-card-section>
      
      <q-card-section class="q-pt-sm">
        <q-list dense>
          <q-item 
            v-for="update in recentUpdates" 
            :key="update.id"
            class="update-item"
          >
            <q-item-section avatar>
              <q-icon 
                :name="getUpdateIcon(update.type)" 
                :color="getUpdateColor(update.type)"
                size="sm"
              />
            </q-item-section>
            
            <q-item-section>
              <q-item-label class="text-body2">
                {{ update.message }}
              </q-item-label>
              <q-item-label caption>
                {{ formatTime(update.timestamp) }}
              </q-item-label>
            </q-item-section>
            
            <q-item-section side v-if="update.action">
              <q-btn 
                flat 
                dense 
                size="sm" 
                :label="update.action.label"
                @click="handleAction(update.action)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      
      <q-card-actions align="right" v-if="updates.length > maxVisible">
        <q-btn 
          flat 
          size="sm" 
          color="primary"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Show Less' : `Show All (${updates.length})` }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from 'src/composables/useWebSocket'
import { date } from 'quasar'

export default {
  name: 'RealtimeUpdates',
  
  props: {
    maxVisible: {
      type: Number,
      default: 5
    },
    showUpdates: {
      type: Boolean,
      default: true
    },
    autoHide: {
      type: Number,
      default: 10000 // Auto hide after 10 seconds
    }
  },

  emits: ['update-received'],

  setup(props, { emit }) {
    const { 
      subscribeToRoomUpdates, 
      subscribeToReservationUpdates,
      unsubscribeFromChannel 
    } = useWebSocket()
    
    const updates = ref([])
    const showAll = ref(false)
    let updateCounter = 0

    const recentUpdates = computed(() => {
      const sorted = [...updates.value].sort((a, b) => b.timestamp - a.timestamp)
      return showAll.value ? sorted : sorted.slice(0, props.maxVisible)
    })

    function addUpdate(type, message, data = {}) {
      const update = {
        id: ++updateCounter,
        type,
        message,
        timestamp: Date.now(),
        data,
        action: data.action || null
      }
      
      updates.value.unshift(update)
      emit('update-received', update)
      
      // Auto-remove old updates
      if (updates.value.length > 50) {
        updates.value = updates.value.slice(0, 50)
      }
      
      // Auto-hide individual updates
      if (props.autoHide > 0) {
        setTimeout(() => {
          const index = updates.value.findIndex(u => u.id === update.id)
          if (index > -1) {
            updates.value.splice(index, 1)
          }
        }, props.autoHide)
      }
    }

    function handleRoomUpdate(data) {
      const message = `Room ${data.room_number} status changed to ${data.new_status}`
      addUpdate('room_status', message, {
        ...data,
        action: data.new_status === 'out_of_order' ? {
          label: 'View Details',
          type: 'room_details',
          roomId: data.room_id
        } : null
      })
    }

    function handleReservationUpdate(type, data) {
      let message = ''
      let updateType = 'reservation'
      
      switch (type) {
        case 'created':
          message = `New reservation: ${data.guest_name} - Room ${data.room_number}`
          updateType = 'reservation_created'
          break
        case 'cancelled':
          message = `Reservation cancelled: ${data.guest_name} - ${data.confirmation_number}`
          updateType = 'reservation_cancelled'
          break
        case 'updated':
          message = `Reservation updated: ${data.guest_name}`
          updateType = 'reservation_updated'
          break
      }
      
      addUpdate(updateType, message, {
        ...data,
        action: {
          label: 'View',
          type: 'reservation_details',
          reservationId: data.reservation_id
        }
      })
    }

    function getUpdateIcon(type) {
      const icons = {
        room_status: 'meeting_room',
        reservation_created: 'add_circle',
        reservation_cancelled: 'cancel',
        reservation_updated: 'edit',
        maintenance: 'build',
        housekeeping: 'cleaning_services',
        payment: 'payment',
        guest: 'person'
      }
      return icons[type] || 'info'
    }

    function getUpdateColor(type) {
      const colors = {
        room_status: 'blue',
        reservation_created: 'green',
        reservation_cancelled: 'orange',
        reservation_updated: 'blue',
        maintenance: 'red',
        housekeeping: 'purple',
        payment: 'teal',
        guest: 'indigo'
      }
      return colors[type] || 'grey'
    }

    function formatTime(timestamp) {
      return date.formatDate(timestamp, 'HH:mm:ss')
    }

    function handleAction(action) {
      // Emit action to parent component
      emit('action-clicked', action)
    }

    onMounted(() => {
      // Subscribe to real-time updates
      subscribeToRoomUpdates(handleRoomUpdate)
      subscribeToReservationUpdates(handleReservationUpdate)
    })

    onUnmounted(() => {
      // Clean up subscriptions
      unsubscribeFromChannel('rooms')
      unsubscribeFromChannel('reservations')
    })

    return {
      updates,
      recentUpdates,
      showAll,
      getUpdateIcon,
      getUpdateColor,
      formatTime,
      handleAction
    }
  }
}
</script>

<style lang="sass" scoped>
.realtime-updates
  position: relative

.updates-card
  max-width: 400px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)

.update-item
  border-radius: 8px
  margin-bottom: 4px
  transition: background-color 0.2s ease
  
  &:hover
    background-color: rgba(0, 0, 0, 0.02)
</style>