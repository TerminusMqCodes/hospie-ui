<template>
  <q-card class="notification-settings">
    <q-card-section>
      <div class="text-h6 q-mb-md">Notification Settings</div>
      
      <!-- Main Toggle -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Push Notifications</q-item-label>
          <q-item-label caption>
            Receive notifications about important updates
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="notificationsEnabled"
            @update:model-value="toggleNotifications"
            :loading="toggling"
          />
        </q-item-section>
      </q-item>

      <q-separator class="q-my-md" />

      <!-- Notification Types -->
      <div v-if="notificationsEnabled">
        <div class="text-subtitle2 q-mb-sm">Notification Types</div>
        
        <q-item
          v-for="type in notificationTypes"
          :key="type.key"
          tag="label"
          v-ripple
        >
          <q-item-section>
            <q-item-label>{{ type.label }}</q-item-label>
            <q-item-label caption>{{ type.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="preferences[type.key]"
              @update:model-value="updatePreferences"
            />
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- Quiet Hours -->
        <div class="text-subtitle2 q-mb-sm">Quiet Hours</div>
        
        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>Enable Quiet Hours</q-item-label>
            <q-item-label caption>
              Disable notifications during specified hours
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="preferences.quietHours.enabled"
              @update:model-value="updatePreferences"
            />
          </q-item-section>
        </q-item>

        <div v-if="preferences.quietHours.enabled" class="q-px-md">
          <div class="row q-gutter-md q-mt-sm">
            <div class="col">
              <q-input
                v-model="preferences.quietHours.start"
                type="time"
                label="Start Time"
                outlined
                dense
                @update:model-value="updatePreferences"
              />
            </div>
            <div class="col">
              <q-input
                v-model="preferences.quietHours.end"
                type="time"
                label="End Time"
                outlined
                dense
                @update:model-value="updatePreferences"
              />
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Sound & Vibration -->
        <div class="text-subtitle2 q-mb-sm">Sound & Vibration</div>
        
        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>Sound</q-item-label>
            <q-item-label caption>Play sound for notifications</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="preferences.sound"
              @update:model-value="updatePreferences"
            />
          </q-item-section>
        </q-item>

        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>Vibration</q-item-label>
            <q-item-label caption>Vibrate for notifications</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="preferences.vibration"
              @update:model-value="updatePreferences"
            />
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>

    <q-card-actions align="right" v-if="notificationsEnabled">
      <q-btn
        flat
        label="Test Notification"
        color="primary"
        @click="testNotification"
        :loading="testing"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import pushNotificationService from '../../services/pushNotificationService'

const $q = useQuasar()

const notificationsEnabled = ref(false)
const toggling = ref(false)
const testing = ref(false)
const preferences = ref({
  reservations: true,
  roomStatus: true,
  guestMessages: true,
  payments: true,
  maintenance: true,
  alerts: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  sound: true,
  vibration: true
})

const notificationTypes = ref([
  {
    key: 'reservations',
    label: 'Reservations',
    description: 'New bookings, check-ins, and check-outs'
  },
  {
    key: 'roomStatus',
    label: 'Room Status',
    description: 'Room maintenance and cleaning updates'
  },
  {
    key: 'guestMessages',
    label: 'Guest Messages',
    description: 'Messages and requests from guests'
  },
  {
    key: 'payments',
    label: 'Payments',
    description: 'Payment confirmations and failures'
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    description: 'Maintenance alerts and updates'
  },
  {
    key: 'alerts',
    label: 'System Alerts',
    description: 'Important system notifications'
  }
])

const toggleNotifications = async (enabled) => {
  toggling.value = true
  
  try {
    if (enabled) {
      await pushNotificationService.enable()
      $q.notify({
        message: 'Push notifications enabled',
        color: 'positive',
        icon: 'notifications_active'
      })
    } else {
      await pushNotificationService.disable()
      $q.notify({
        message: 'Push notifications disabled',
        color: 'info',
        icon: 'notifications_off'
      })
    }
  } catch (error) {
    console.error('Failed to toggle notifications:', error)
    
    // Revert the toggle
    notificationsEnabled.value = !enabled
    
    $q.notify({
      message: error.message || 'Failed to update notification settings',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    toggling.value = false
  }
}

const updatePreferences = async () => {
  try {
    await pushNotificationService.updateNotificationPreferences(preferences.value)
  } catch (error) {
    console.error('Failed to update preferences:', error)
    
    $q.notify({
      message: 'Failed to save preferences',
      color: 'negative',
      icon: 'error'
    })
  }
}

const testNotification = async () => {
  testing.value = true
  
  try {
    await pushNotificationService.testNotification()
    
    $q.notify({
      message: 'Test notification sent!',
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    console.error('Failed to send test notification:', error)
    
    $q.notify({
      message: error.message || 'Failed to send test notification',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    testing.value = false
  }
}

onMounted(async () => {
  try {
    // Check if notifications are enabled
    notificationsEnabled.value = await pushNotificationService.isNotificationEnabled()
    
    // Load preferences
    const savedPreferences = await pushNotificationService.getNotificationPreferences()
    preferences.value = { ...preferences.value, ...savedPreferences }
  } catch (error) {
    console.error('Failed to load notification settings:', error)
  }
})
</script>

<style lang="scss" scoped>
.notification-settings {
  max-width: 500px;
}
</style>