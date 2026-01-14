<template>
  <q-page class="pwa-settings-page">
    <div class="q-pa-md">
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h5 q-mb-md">PWA & Mobile Settings</div>
              
              <!-- App Status -->
              <div class="app-status q-mb-lg">
                <div class="text-h6 q-mb-sm">App Status</div>
                
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon 
                        :name="isInstalled ? 'check_circle' : 'get_app'" 
                        :color="isInstalled ? 'positive' : 'grey'"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Installation Status</q-item-label>
                      <q-item-label caption>
                        {{ isInstalled ? 'App is installed' : 'App is not installed' }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="isInstallable && !isInstalled">
                      <q-btn
                        color="primary"
                        label="Install"
                        @click="installApp"
                        :loading="installing"
                      />
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon 
                        :name="isOnline ? 'wifi' : 'wifi_off'" 
                        :color="isOnline ? 'positive' : 'warning'"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Connection Status</q-item-label>
                      <q-item-label caption>
                        {{ isOnline ? 'Online' : 'Offline' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon 
                        :name="platform === 'android' || platform === 'ios' ? 'smartphone' : 'computer'" 
                        color="info"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Platform</q-item-label>
                      <q-item-label caption>
                        {{ platformLabel }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Push Notifications -->
              <div class="notifications-section q-mb-lg">
                <div class="text-h6 q-mb-sm">Push Notifications</div>
                
                <q-list>
                  <q-item tag="label" v-ripple>
                    <q-item-section avatar>
                      <q-toggle
                        v-model="notificationsEnabled"
                        @update:model-value="toggleNotifications"
                        color="primary"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Enable Push Notifications</q-item-label>
                      <q-item-label caption>
                        Receive notifications for reservations, messages, and alerts
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="notificationsEnabled">
                    <q-item-section>
                      <q-btn
                        flat
                        color="primary"
                        label="Test Notification"
                        icon="notifications"
                        @click="testNotification"
                        :loading="testingNotification"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>

                <!-- Notification Preferences -->
                <div v-if="notificationsEnabled" class="q-mt-md">
                  <NotificationSettings v-model="notificationPreferences" />
                </div>
              </div>

              <!-- Offline Settings -->
              <div class="offline-section q-mb-lg">
                <div class="text-h6 q-mb-sm">Offline Settings</div>
                
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon 
                        :name="syncStatus === 'synced' ? 'sync' : 'sync_problem'" 
                        :color="syncStatus === 'synced' ? 'positive' : 'warning'"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Sync Status</q-item-label>
                      <q-item-label caption>
                        {{ syncStatusLabel }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="canSync">
                      <q-btn
                        flat
                        color="primary"
                        label="Sync Now"
                        icon="sync"
                        @click="syncData"
                        :loading="syncing"
                      />
                    </q-item-section>
                  </q-item>

                  <q-item v-if="pendingSyncCount > 0">
                    <q-item-section avatar>
                      <q-icon name="cloud_queue" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Pending Changes</q-item-label>
                      <q-item-label caption>
                        {{ pendingSyncCount }} changes waiting to sync
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="storage" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Storage Usage</q-item-label>
                      <q-item-label caption>
                        {{ storageUsageText }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        color="negative"
                        label="Clear"
                        icon="delete"
                        @click="clearOfflineData"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Device Capabilities -->
              <div class="capabilities-section q-mb-lg">
                <div class="text-h6 q-mb-sm">Device Capabilities</div>
                
                <div class="row q-gutter-sm">
                  <q-chip
                    v-for="capability in deviceCapabilities"
                    :key="capability.name"
                    :icon="capability.icon"
                    :color="capability.available ? 'positive' : 'grey'"
                    :text-color="capability.available ? 'white' : 'black'"
                    :label="capability.name"
                    size="sm"
                  />
                </div>
              </div>

              <!-- App Actions -->
              <div class="actions-section">
                <div class="text-h6 q-mb-sm">App Actions</div>
                
                <div class="row q-gutter-md">
                  <q-btn
                    color="primary"
                    label="Check for Updates"
                    icon="system_update"
                    @click="checkForUpdates"
                    :loading="checkingUpdates"
                  />
                  
                  <q-btn
                    color="info"
                    label="Share App"
                    icon="share"
                    @click="shareApp"
                    v-if="canShare"
                  />
                  
                  <q-btn
                    color="secondary"
                    label="App Info"
                    icon="info"
                    @click="showAppInfo"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- App Info Dialog -->
    <q-dialog v-model="showInfoDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">App Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Version</q-item-label>
                <q-item-label caption>{{ appVersion }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>Build Date</q-item-label>
                <q-item-label caption>{{ buildDate }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>Platform</q-item-label>
                <q-item-label caption>{{ platformLabel }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>User Agent</q-item-label>
                <q-item-label caption class="text-wrap">{{ userAgent }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePWA } from '../composables/usePWA'
import { useOfflineStore } from '../stores/offline'
import pushNotificationService from '../services/pushNotificationService'
import NotificationSettings from '../components/PWA/NotificationSettings.vue'

const $q = useQuasar()
const { 
  isOnline, 
  isInstallable, 
  isInstalled, 
  platform, 
  installPWA, 
  checkForUpdates, 
  shareContent, 
  getDeviceCapabilities 
} = usePWA()

const offlineStore = useOfflineStore()

// State
const installing = ref(false)
const notificationsEnabled = ref(false)
const notificationPreferences = ref({})
const testingNotification = ref(false)
const syncing = ref(false)
const checkingUpdates = ref(false)
const showInfoDialog = ref(false)
const storageInfo = ref({})

// Computed
const platformLabel = computed(() => {
  const labels = {
    android: 'Android',
    ios: 'iOS',
    web: 'Web Browser',
    electron: 'Desktop App'
  }
  return labels[platform.value] || 'Unknown'
})

const syncStatus = computed(() => offlineStore.syncStatus)
const pendingSyncCount = computed(() => offlineStore.pendingSyncCount)
const canSync = computed(() => offlineStore.canSync)

const syncStatusLabel = computed(() => {
  switch (syncStatus.value) {
    case 'syncing': return 'Syncing data...'
    case 'offline': return 'Offline - will sync when online'
    case 'pending': return `${pendingSyncCount.value} changes pending`
    case 'synced': return 'All data synced'
    default: return 'Unknown'
  }
})

const storageUsageText = computed(() => {
  const total = Object.values(storageInfo.value).reduce((sum, count) => sum + count, 0)
  return `${total} items stored locally`
})

const deviceCapabilities = computed(() => {
  const caps = getDeviceCapabilities()
  return [
    { name: 'Camera', icon: 'camera_alt', available: caps.hasCamera },
    { name: 'GPS', icon: 'location_on', available: caps.hasGeolocation },
    { name: 'Notifications', icon: 'notifications', available: caps.hasNotifications },
    { name: 'Background Sync', icon: 'sync', available: caps.hasBackgroundSync },
    { name: 'Web Share', icon: 'share', available: caps.hasWebShare },
    { name: 'Clipboard', icon: 'content_copy', available: caps.hasClipboard },
    { name: 'Vibration', icon: 'vibration', available: caps.hasVibration }
  ]
})

const canShare = computed(() => 'share' in navigator)

const appVersion = ref(process.env.APP_VERSION || '1.0.0')
const buildDate = ref(process.env.BUILD_DATE || new Date().toISOString())
const userAgent = ref(navigator.userAgent)

// Methods
const installApp = async () => {
  installing.value = true
  try {
    await installPWA()
  } finally {
    installing.value = false
  }
}

const toggleNotifications = async (enabled) => {
  try {
    if (enabled) {
      await pushNotificationService.enable()
    } else {
      await pushNotificationService.disable()
    }
    notificationsEnabled.value = enabled
    
    $q.notify({
      message: enabled ? 'Notifications enabled' : 'Notifications disabled',
      color: 'positive',
      icon: enabled ? 'notifications_active' : 'notifications_off'
    })
  } catch (error) {
    console.error('Failed to toggle notifications:', error)
    $q.notify({
      message: 'Failed to change notification settings',
      color: 'negative',
      icon: 'error'
    })
    notificationsEnabled.value = !enabled
  }
}

const testNotification = async () => {
  testingNotification.value = true
  try {
    await pushNotificationService.testNotification()
    $q.notify({
      message: 'Test notification sent!',
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    console.error('Test notification failed:', error)
    $q.notify({
      message: 'Test notification failed',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    testingNotification.value = false
  }
}

const syncData = async () => {
  syncing.value = true
  try {
    await offlineStore.syncData()
    $q.notify({
      message: 'Data synchronized successfully',
      color: 'positive',
      icon: 'sync'
    })
  } catch (error) {
    console.error('Sync failed:', error)
    $q.notify({
      message: 'Sync failed. Please try again.',
      color: 'negative',
      icon: 'sync_problem'
    })
  } finally {
    syncing.value = false
  }
}

const clearOfflineData = () => {
  $q.dialog({
    title: 'Clear Offline Data',
    message: 'This will remove all locally stored data. Are you sure?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await offlineStore.clearOfflineData()
      await loadStorageInfo()
      $q.notify({
        message: 'Offline data cleared',
        color: 'positive',
        icon: 'delete'
      })
    } catch (error) {
      console.error('Failed to clear data:', error)
      $q.notify({
        message: 'Failed to clear data',
        color: 'negative',
        icon: 'error'
      })
    }
  })
}

const shareApp = async () => {
  const shareData = {
    title: 'Hospie PMS',
    text: 'Check out this amazing hotel management system!',
    url: window.location.origin
  }
  
  const shared = await shareContent(shareData)
  if (!shared) {
    // Fallback to copying URL
    try {
      await navigator.clipboard.writeText(window.location.origin)
      $q.notify({
        message: 'App URL copied to clipboard',
        color: 'positive',
        icon: 'content_copy'
      })
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }
}

const showAppInfo = () => {
  showInfoDialog.value = true
}

const loadStorageInfo = async () => {
  try {
    storageInfo.value = await offlineStore.getStorageInfo()
  } catch (error) {
    console.error('Failed to load storage info:', error)
  }
}

const loadNotificationSettings = async () => {
  try {
    notificationsEnabled.value = await pushNotificationService.isNotificationEnabled()
    notificationPreferences.value = await pushNotificationService.getNotificationPreferences()
  } catch (error) {
    console.error('Failed to load notification settings:', error)
    // Set defaults on error
    notificationsEnabled.value = false
    notificationPreferences.value = {
      reservations: false,
      roomStatus: false,
      guestMessages: false,
      payments: false,
      maintenance: false,
      alerts: false
    }
  }
}

onMounted(async () => {
  await Promise.all([
    loadStorageInfo(),
    loadNotificationSettings()
  ])
})
</script>

<style lang="scss" scoped>
.pwa-settings-page {
  .text-wrap {
    white-space: normal;
    word-break: break-all;
  }
}
</style>