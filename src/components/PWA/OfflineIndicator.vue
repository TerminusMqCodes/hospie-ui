<template>
  <transition
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <q-banner
      v-if="!isOnline"
      class="bg-warning text-dark offline-banner"
      dense
    >
      <template v-slot:avatar>
        <q-icon name="cloud_off" />
      </template>
      
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-body2 text-weight-medium">
            You're offline
          </div>
          <div class="text-caption">
            {{ offlineMessage }}
          </div>
        </div>
        
        <div class="col-auto q-ml-md" v-if="pendingSyncCount > 0">
          <q-chip
            :label="`${pendingSyncCount} pending`"
            color="orange"
            text-color="white"
            size="sm"
            icon="sync"
          />
        </div>
      </div>
      
      <template v-slot:action>
        <q-btn
          flat
          dense
          icon="refresh"
          @click="checkConnection"
          :loading="checking"
        />
      </template>
    </q-banner>
  </transition>

  <!-- Sync Status -->
  <transition
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <q-banner
      v-if="isOnline && syncInProgress"
      class="bg-info text-white sync-banner"
      dense
    >
      <template v-slot:avatar>
        <q-icon name="sync" class="rotating" />
      </template>
      
      <div class="text-body2">
        Syncing {{ pendingSyncCount }} items...
      </div>
      
      <template v-slot:action>
        <q-linear-progress
          :value="syncProgress"
          color="white"
          size="4px"
          class="sync-progress"
        />
      </template>
    </q-banner>
  </transition>

  <!-- Connection Restored -->
  <transition
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <q-banner
      v-if="showConnectionRestored"
      class="bg-positive text-white"
      dense
    >
      <template v-slot:avatar>
        <q-icon name="wifi" />
      </template>
      
      <div class="text-body2">
        Connection restored!
      </div>
    </q-banner>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useOfflineStore } from '../../stores/offline'
import { usePWA } from '../../composables/usePWA'

const offlineStore = useOfflineStore()
const { isOnline } = usePWA()

const checking = ref(false)
const showConnectionRestored = ref(false)
const syncProgress = ref(0)

const pendingSyncCount = computed(() => offlineStore.pendingSyncCount)
const syncInProgress = computed(() => offlineStore.syncInProgress)

const offlineMessage = computed(() => {
  if (pendingSyncCount.value > 0) {
    return `${pendingSyncCount.value} changes will sync when connection is restored`
  }
  return 'Some features may be limited'
})

const checkConnection = async () => {
  checking.value = true
  
  try {
    // Try to fetch a small resource to test connectivity
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    if (response.ok) {
      // Connection is working, update online status
      offlineStore.updateOnlineStatus(true)
    }
  } catch (error) {
    console.log('Still offline')
  } finally {
    checking.value = false
  }
}

// Watch for online status changes
watch(isOnline, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // Just came back online
    showConnectionRestored.value = true
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      showConnectionRestored.value = false
    }, 3000)
  }
})

// Simulate sync progress
watch(syncInProgress, (inProgress) => {
  if (inProgress) {
    syncProgress.value = 0
    const interval = setInterval(() => {
      syncProgress.value += 0.1
      if (syncProgress.value >= 1 || !syncInProgress.value) {
        clearInterval(interval)
        syncProgress.value = 1
      }
    }, 200)
  }
})

onMounted(() => {
  // Initialize offline store
  offlineStore.initialize()
})
</script>

<style lang="scss" scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.sync-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9998;
}

.sync-progress {
  width: 100px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Animations
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.slideInDown {
  animation-name: slideInDown;
}

.slideOutUp {
  animation-name: slideOutUp;
}

@keyframes slideInDown {
  from {
    transform: translate3d(0, -100%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes slideOutUp {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(0, -100%, 0);
  }
}
</style>