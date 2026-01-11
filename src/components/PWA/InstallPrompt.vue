<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="install-prompt-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Install Hospie PMS</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row items-center q-gutter-md">
          <q-avatar size="64px">
            <img src="/icons/icon-192x192.png" alt="Hospie PMS" />
          </q-avatar>
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">
              Get the full Hospie PMS experience
            </div>
            <div class="text-body2 text-grey-7">
              Install our app for faster access, offline capabilities, and push notifications.
            </div>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-body2 text-weight-medium q-mb-sm">Features:</div>
          <div class="row q-gutter-sm">
            <q-chip
              v-for="feature in features"
              :key="feature.label"
              :icon="feature.icon"
              :label="feature.label"
              color="primary"
              text-color="white"
              size="sm"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Not now"
          color="grey-7"
          @click="dismiss"
        />
        <q-btn
          unelevated
          label="Install"
          color="primary"
          icon="get_app"
          @click="install"
          :loading="installing"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePWA } from '../../composables/usePWA'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'installed', 'dismissed'])

const { isInstallable, installPWA, isInstalled } = usePWA()
const installing = ref(false)

const showDialog = computed({
  get: () => props.modelValue && isInstallable.value && !isInstalled.value,
  set: (value) => emit('update:modelValue', value)
})

const features = ref([
  { icon: 'offline_bolt', label: 'Offline Access' },
  { icon: 'notifications', label: 'Push Notifications' },
  { icon: 'speed', label: 'Faster Loading' },
  { icon: 'home_screen', label: 'Home Screen' }
])

const install = async () => {
  installing.value = true
  try {
    await installPWA()
    emit('installed')
    showDialog.value = false
  } catch (error) {
    console.error('Installation failed:', error)
  } finally {
    installing.value = false
  }
}

const dismiss = () => {
  emit('dismissed')
  showDialog.value = false
  
  // Don't show again for 7 days
  localStorage.setItem('pwa_install_dismissed', Date.now().toString())
}

onMounted(() => {
  // Check if user previously dismissed the prompt
  const dismissed = localStorage.getItem('pwa_install_dismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed)
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    
    if (Date.now() - dismissedTime < sevenDays) {
      // Still within dismissal period
      return
    }
  }
})
</script>

<style lang="scss" scoped>
.install-prompt-card {
  min-width: 350px;
  max-width: 500px;
}

@media (max-width: 600px) {
  .install-prompt-card {
    min-width: 300px;
    margin: 16px;
  }
}
</style>