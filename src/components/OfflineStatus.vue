<template>
  <div class="offline-status">
    <!-- Offline Banner -->
    <q-banner 
      v-if="!offlineStore.isOnline" 
      class="bg-warning text-dark"
      dense
    >
      <template v-slot:avatar>
        <q-icon name="wifi_off" />
      </template>
      
      <div class="row items-center">
        <div class="col">
          <strong>Offline Mode</strong> - 
          {{ offlineStore.pendingSyncCount }} changes pending sync
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            dense 
            label="Retry" 
            icon="refresh"
            @click="retryConnection"
            :loading="checking"
          />
        </div>
      </div>
    </q-banner>

    <!-- Sync Status Banner -->
    <q-banner 
      v-else-if="offlineStore.hasOfflineChanges && !offlineStore.syncInProgress" 
      class="bg-info text-white"
      dense
    >
      <template v-slot:avatar>
        <q-icon name="sync" />
      </template>
      
      <div class="row items-center">
        <div class="col">
          <strong>Sync Available</strong> - 
          {{ offlineStore.pendingSyncCount }} changes ready to sync
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            dense 
            label="Sync Now" 
            icon="cloud_upload"
            @click="syncNow"
            :loading="offlineStore.syncInProgress"
          />
        </div>
      </div>
    </q-banner>

    <!-- Syncing Banner -->
    <q-banner 
      v-else-if="offlineStore.syncInProgress" 
      class="bg-primary text-white"
      dense
    >
      <template v-slot:avatar>
        <q-spinner color="white" size="20px" />
      </template>
      
      <div>
        <strong>Syncing...</strong> - 
        Uploading {{ offlineStore.pendingSyncCount }} changes
      </div>
    </q-banner>

    <!-- Floating Action Button for Sync -->
    <q-page-sticky 
      v-if="showSyncFab"
      position="bottom-right" 
      :offset="[18, 18]"
    >
      <q-btn 
        fab 
        :icon="syncIcon" 
        :color="syncColor"
        @click="handleSyncAction"
        :loading="offlineStore.syncInProgress"
      >
        <q-tooltip>{{ syncTooltip }}</q-tooltip>
        
        <q-badge 
          v-if="offlineStore.pendingSyncCount > 0"
          color="red" 
          text-color="white" 
          floating
        >
          {{ offlineStore.pendingSyncCount }}
        </q-badge>
      </q-btn>
    </q-page-sticky>

    <!-- Sync Status Dialog -->
    <q-dialog v-model="showSyncDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon 
            :name="syncDialogIcon" 
            :color="syncDialogColor" 
            size="24px" 
            class="q-mr-sm"
          />
          <div class="text-h6">Sync Status</div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="row justify-between">
              <span>Connection Status:</span>
              <q-chip 
                :color="offlineStore.isOnline ? 'positive' : 'warning'"
                text-color="white"
                :icon="offlineStore.isOnline ? 'wifi' : 'wifi_off'"
              >
                {{ offlineStore.isOnline ? 'Online' : 'Offline' }}
              </q-chip>
            </div>
          </div>

          <div class="q-mb-md">
            <div class="row justify-between">
              <span>Pending Changes:</span>
              <q-chip color="info" text-color="white">
                {{ offlineStore.pendingSyncCount }}
              </q-chip>
            </div>
          </div>

          <div class="q-mb-md" v-if="offlineStore.lastSyncTime">
            <div class="row justify-between">
              <span>Last Sync:</span>
              <span class="text-caption">
                {{ formatDate(offlineStore.lastSyncTime) }}
              </span>
            </div>
          </div>

          <div v-if="storageInfo">
            <div class="text-subtitle2 q-mb-sm">Offline Storage:</div>
            <div class="q-pl-md">
              <div v-for="(count, store) in storageInfo" :key="store" class="row justify-between">
                <span class="text-capitalize">{{ store }}:</span>
                <span>{{ count }} items</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Clear Offline Data" 
            color="negative"
            @click="clearOfflineData"
            :loading="clearing"
          />
          <q-btn 
            flat 
            label="Close" 
            color="primary" 
            v-close-popup 
          />
          <q-btn 
            v-if="offlineStore.canSync && offlineStore.hasOfflineChanges"
            label="Sync Now" 
            color="primary"
            @click="syncNow"
            :loading="offlineStore.syncInProgress"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useOfflineStore } from '../stores/offline'

const $q = useQuasar()
const offlineStore = useOfflineStore()

// Props
const props = defineProps({
  showFab: {
    type: Boolean,
    default: true
  },
  showBanner: {
    type: Boolean,
    default: true
  }
})

// State
const checking = ref(false)
const clearing = ref(false)
const showSyncDialog = ref(false)
const storageInfo = ref(null)

// Computed
const showSyncFab = computed(() => {
  return props.showFab && (
    !offlineStore.isOnline || 
    offlineStore.hasOfflineChanges ||
    offlineStore.syncInProgress
  )
})

const syncIcon = computed(() => {
  if (offlineStore.syncInProgress) return 'sync'
  if (!offlineStore.isOnline) return 'wifi_off'
  if (offlineStore.hasOfflineChanges) return 'cloud_upload'
  return 'cloud_done'
})

const syncColor = computed(() => {
  if (offlineStore.syncInProgress) return 'primary'
  if (!offlineStore.isOnline) return 'warning'
  if (offlineStore.hasOfflineChanges) return 'info'
  return 'positive'
})

const syncTooltip = computed(() => {
  if (offlineStore.syncInProgress) return 'Syncing...'
  if (!offlineStore.isOnline) return 'Offline - Click for details'
  if (offlineStore.hasOfflineChanges) return `Sync ${offlineStore.pendingSyncCount} changes`
  return 'All synced'
})

const syncDialogIcon = computed(() => {
  if (offlineStore.syncInProgress) return 'sync'
  if (!offlineStore.isOnline) return 'wifi_off'
  return 'info'
})

const syncDialogColor = computed(() => {
  if (offlineStore.syncInProgress) return 'primary'
  if (!offlineStore.isOnline) return 'warning'
  return 'info'
})

// Methods
const retryConnection = async () => {
  checking.value = true
  
  try {
    // Try to fetch a small resource to check connectivity
    await fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    offlineStore.updateOnlineStatus(true)
    
    $q.notify({
      message: 'Connection restored!',
      color: 'positive',
      icon: 'wifi',
      timeout: 3000
    })
  } catch {
    $q.notify({
      message: 'Still offline. Please check your connection.',
      color: 'warning',
      icon: 'wifi_off',
      timeout: 3000
    })
  } finally {
    checking.value = false
  }
}

const syncNow = async () => {
  try {
    await offlineStore.syncData()
    
    $q.notify({
      message: 'Data synchronized successfully!',
      color: 'positive',
      icon: 'cloud_done',
      timeout: 3000
    })
  } catch {
    $q.notify({
      message: 'Sync failed. Please try again.',
      color: 'negative',
      icon: 'sync_problem',
      timeout: 5000
    })
  }
}

const handleSyncAction = async () => {
  if (!offlineStore.isOnline) {
    showSyncDialog.value = true
    await loadStorageInfo()
  } else if (offlineStore.hasOfflineChanges) {
    await syncNow()
  } else {
    showSyncDialog.value = true
    await loadStorageInfo()
  }
}

const clearOfflineData = async () => {
  $q.dialog({
    title: 'Clear Offline Data',
    message: 'This will remove all offline data. Are you sure?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    clearing.value = true
    
    try {
      await offlineStore.clearOfflineData()
      
      $q.notify({
        message: 'Offline data cleared successfully',
        color: 'positive',
        icon: 'delete_sweep',
        timeout: 3000
      })
      
      showSyncDialog.value = false
    } catch {
      $q.notify({
        message: 'Failed to clear offline data',
        color: 'negative',
        icon: 'error',
        timeout: 3000
      })
    } finally {
      clearing.value = false
    }
  })
}

const loadStorageInfo = async () => {
  try {
    storageInfo.value = await offlineStore.getStorageInfo()
  } catch {
    console.error('Failed to load storage info')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Lifecycle
// Removed onMounted as offlineStore initialization is handled elsewhere
</script>

<style scoped>
.offline-status {
  position: relative;
}

.q-banner {
  border-radius: 0;
}

.q-page-sticky {
  z-index: 2000;
}
</style>