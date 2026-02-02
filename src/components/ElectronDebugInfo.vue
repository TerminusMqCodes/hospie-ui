<template>
  <div class="electron-debug-info" v-if="showDebug">
    <q-card flat bordered class="debug-card">
      <q-card-section class="q-pa-sm">
        <div class="text-caption">
          <div><strong>Electron:</strong> {{ isElectron ? 'Yes' : 'No' }}</div>
          <div><strong>API:</strong> {{ !!electronAPI ? 'Available' : 'Missing' }}</div>
          <div><strong>Dev:</strong> {{ isDev ? 'Yes' : 'No' }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const electronAPI = ref(null)
const isElectron = ref(false)
const isDev = ref(process.env.DEV)
const showDebug = computed(() => isDev.value)

onMounted(() => {
  electronAPI.value = window.electronAPI
  isElectron.value = electronAPI.value?.isElectron || false
  
  console.log('ElectronDebugInfo:', {
    isElectron: isElectron.value,
    electronAPI: !!electronAPI.value,
    isDev: isDev.value
  })
})
</script>

<style scoped>
.electron-debug-info {
  position: fixed;
  top: 50px;
  right: 10px;
  z-index: 9998;
  max-width: 200px;
}

.debug-card {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 11px;
}
</style>