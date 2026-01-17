<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h4 q-mb-md">Electron Test Page</div>
      <div class="text-h6 q-mb-md">{{ isElectron ? 'Running in Electron' : 'Running in Browser' }}</div>
      
      <q-card class="q-pa-md" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">System Information</div>
        </q-card-section>
        
        <q-card-section>
          <div><strong>Platform:</strong> {{ platform }}</div>
          <div><strong>User Agent:</strong> {{ userAgent }}</div>
          <div><strong>Window Size:</strong> {{ windowSize.width }}x{{ windowSize.height }}</div>
          <div><strong>Screen Size:</strong> {{ screenSize.width }}x{{ screenSize.height }}</div>
          <div><strong>Electron API Available:</strong> {{ !!electronAPI }}</div>
        </q-card-section>
        
        <q-card-actions v-if="isElectron" align="center">
          <q-btn color="primary" @click="testMinimize">Minimize</q-btn>
          <q-btn color="secondary" @click="testMaximize">Toggle Maximize</q-btn>
          <q-btn color="warning" @click="testFullscreen">Toggle Fullscreen</q-btn>
        </q-card-actions>
        
        <q-card-section v-if="isElectron">
          <div class="text-h6 q-mb-md">Keyboard Shortcuts Test</div>
          <div class="text-caption q-mb-sm">Try these shortcuts:</div>
          <div class="shortcuts-list">
            <div><kbd>F11</kbd> - Toggle Fullscreen</div>
            <div><kbd>Ctrl/Cmd + M</kbd> - Minimize</div>
            <div><kbd>Ctrl/Cmd + Shift + M</kbd> - Maximize/Restore</div>
            <div><kbd>Ctrl/Cmd + F</kbd> - Focus Search</div>
            <div><kbd>Ctrl/Cmd + K</kbd> - Command Palette</div>
            <div><kbd>Ctrl/Cmd + ?</kbd> - Show All Shortcuts</div>
          </div>
        </q-card-section>
      </q-card>
      
      <div class="q-mt-md">
        <q-btn color="primary" @click="$router.push('/dashboard')">Go to Dashboard</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const electronAPI = window.electronAPI
const isElectron = computed(() => electronAPI?.isElectron || false)
const platform = ref(navigator.platform)
const userAgent = ref(navigator.userAgent)
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight })
const screenSize = ref({ width: screen.width, height: screen.height })

onMounted(() => {
  console.log('Electron Test Page mounted')
  console.log('Is Electron:', isElectron.value)
  console.log('Electron API:', electronAPI)
  
  // Update window size on resize
  window.addEventListener('resize', () => {
    windowSize.value = { width: window.innerWidth, height: window.innerHeight }
  })
})

const testMinimize = async () => {
  if (electronAPI) {
    await electronAPI.minimizeWindow()
  }
}

const testMaximize = async () => {
  if (electronAPI) {
    await electronAPI.maximizeWindow()
  }
}

const testFullscreen = async () => {
  if (electronAPI) {
    await electronAPI.toggleFullscreen()
  }
}
</script>

<style scoped>
.q-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.q-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.shortcuts-list div {
  display: flex;
  align-items: center;
  gap: 8px;
}

kbd {
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: bold;
  color: #333;
  min-width: 120px;
  text-align: center;
}
</style>