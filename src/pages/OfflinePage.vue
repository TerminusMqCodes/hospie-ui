<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-icon 
        name="cloud_off" 
        size="120px" 
        color="grey-5" 
        class="q-mb-md"
      />
      
      <h4 class="text-h4 q-mb-md text-grey-7">
        You're Offline
      </h4>
      
      <p class="text-body1 q-mb-lg text-grey-6 max-width">
        Don't worry! You can still view cached data and perform basic operations.
        Your changes will sync when you're back online.
      </p>

      <div class="q-mb-lg">
        <q-chip 
          v-if="isOnline" 
          color="positive" 
          text-color="white" 
          icon="wifi"
        >
          Back Online
        </q-chip>
        <q-chip 
          v-else 
          color="warning" 
          text-color="white" 
          icon="wifi_off"
        >
          Offline Mode
        </q-chip>
      </div>

      <div class="q-gutter-md">
        <q-btn 
          color="primary" 
          label="Try Again" 
          icon="refresh"
          @click="checkConnection"
          :loading="checking"
        />
        
        <q-btn 
          flat 
          color="primary" 
          label="Go to Dashboard" 
          icon="dashboard"
          @click="$router.push('/dashboard')"
        />
      </div>

      <div class="q-mt-xl">
        <q-list class="offline-features">
          <q-item-label header class="text-grey-7">
            Available Offline Features:
          </q-item-label>
          
          <q-item>
            <q-item-section avatar>
              <q-icon name="visibility" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>View cached reservations</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section avatar>
              <q-icon name="hotel" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Check room status</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>View guest information</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isOnline = ref(navigator.onLine)
const checking = ref(false)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  
  if (isOnline.value) {
    $q.notify({
      message: 'Connection restored!',
      color: 'positive',
      icon: 'wifi',
      timeout: 3000
    })
  }
}

const checkConnection = async () => {
  checking.value = true
  
  try {
    // Try to fetch a small resource to check connectivity
    await fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    isOnline.value = true
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

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.max-width {
  max-width: 400px;
  margin: 0 auto;
}

.offline-features {
  max-width: 300px;
  margin: 0 auto;
}
</style>