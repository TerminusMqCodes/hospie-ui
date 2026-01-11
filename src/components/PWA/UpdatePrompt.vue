<template>
  <q-banner
    v-if="showUpdateBanner"
    class="bg-primary text-white"
    dense
  >
    <template v-slot:avatar>
      <q-icon name="system_update" />
    </template>
    
    <div class="text-body2">
      A new version of Hospie PMS is available!
    </div>
    
    <template v-slot:action>
      <q-btn
        flat
        dense
        label="Update"
        @click="updateApp"
        :loading="updating"
      />
      <q-btn
        flat
        dense
        icon="close"
        @click="dismissUpdate"
      />
    </template>
  </q-banner>

  <!-- Update Progress Dialog -->
  <q-dialog v-model="showUpdateDialog" persistent>
    <q-card class="update-dialog">
      <q-card-section class="row items-center">
        <q-avatar color="primary" text-color="white" icon="system_update" />
        <span class="q-ml-sm text-h6">Updating Hospie PMS</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body2 q-mb-md">
          Please wait while we update the app to the latest version...
        </div>
        
        <q-linear-progress
          :value="updateProgress"
          color="primary"
          size="8px"
          class="q-mb-sm"
        />
        
        <div class="text-caption text-center">
          {{ Math.round(updateProgress * 100) }}% complete
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const showUpdateBanner = ref(false)
const showUpdateDialog = ref(false)
const updating = ref(false)
const updateProgress = ref(0)
let updateAvailable = false
let registration = null

const updateApp = async () => {
  if (!updateAvailable || !registration) return

  updating.value = true
  showUpdateBanner.value = false
  showUpdateDialog.value = true
  
  try {
    // Simulate update progress
    const progressInterval = setInterval(() => {
      updateProgress.value += 0.1
      if (updateProgress.value >= 1) {
        clearInterval(progressInterval)
      }
    }, 100)

    // Skip waiting and activate new service worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    // Wait for the new service worker to take control
    await new Promise((resolve) => {
      const handleControllerChange = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        resolve()
      }
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    })

    // Reload the page to get the new version
    window.location.reload()
  } catch (error) {
    console.error('Update failed:', error)
    
    $q.notify({
      message: 'Update failed. Please refresh the page manually.',
      color: 'negative',
      icon: 'error',
      timeout: 5000
    })
    
    showUpdateDialog.value = false
    updating.value = false
  }
}

const dismissUpdate = () => {
  showUpdateBanner.value = false
  
  // Don't show again for this session
  sessionStorage.setItem('update_dismissed', 'true')
}

const handleServiceWorkerUpdate = (event) => {
  registration = event.detail
  updateAvailable = true
  
  // Don't show if user dismissed it this session
  if (sessionStorage.getItem('update_dismissed')) {
    return
  }
  
  showUpdateBanner.value = true
}

onMounted(() => {
  // Listen for service worker updates
  window.addEventListener('swUpdated', handleServiceWorkerUpdate)
  
  // Check if there's already an update available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && reg.waiting) {
        registration = reg
        updateAvailable = true
        
        if (!sessionStorage.getItem('update_dismissed')) {
          showUpdateBanner.value = true
        }
      }
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('swUpdated', handleServiceWorkerUpdate)
})
</script>

<style lang="scss" scoped>
.update-dialog {
  min-width: 300px;
}

@media (max-width: 600px) {
  .update-dialog {
    margin: 16px;
  }
}
</style>