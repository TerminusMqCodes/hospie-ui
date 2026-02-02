<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h4 q-mb-md">Shortcuts Test Page</div>
      
      <q-card class="q-pa-md" style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Shortcuts Test & Debug</div>
          <div class="text-subtitle2 text-grey-6 q-mb-md">
            Real-time keyboard shortcut testing and debugging
          </div>
          <div class="q-mt-md">
            <q-btn 
              color="primary" 
              @click="showShortcuts = true"
              label="Open Shortcuts Dialog"
              icon="keyboard"
              class="q-mr-sm"
            />
            <q-btn 
              color="secondary" 
              @click="clearResults"
              label="Clear Results"
              icon="clear"
              outline
            />
          </div>
          <div class="q-mt-md system-info">
            <div><strong>Electron Mode:</strong> {{ isElectron ? 'Yes' : 'No' }}</div>
            <div><strong>ElectronAPI:</strong> {{ !!electronAPI ? 'Available' : 'Not Available' }}</div>
            <div><strong>Platform:</strong> {{ platform }}</div>
            <div><strong>User Agent:</strong> {{ userAgent.substring(0, 50) }}...</div>
          </div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-h6 q-mb-md">Live Keyboard Event Monitor</div>
          <div class="text-caption q-mb-sm">Press any key combination to see if it's detected:</div>
          <div class="test-results">
            <div v-if="testResults.length === 0" class="text-grey-6 text-center q-pa-md">
              Press any key combination...
            </div>
            <div v-for="result in testResults" :key="result.id" class="test-result">
              <span class="test-time">{{ result.time }}</span>
              <span class="test-key" :class="result.status">{{ result.key }}</span>
              <span class="test-action">{{ result.action }}</span>
              <span class="test-status" :class="result.status">{{ result.status }}</span>
            </div>
          </div>
          <div class="q-mt-sm">
            <q-btn 
              size="sm"
              color="secondary" 
              @click="clearResults"
              label="Clear Results"
              icon="clear"
              outline
            />
          </div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-h6">API Function Tests</div>
          <div class="text-subtitle2 text-grey-6 q-mb-md">
            Test individual Electron API functions
          </div>
          <div class="q-gutter-sm">
            <q-btn 
              size="sm"
              color="primary" 
              @click="testFocusSearch"
              label="Test Focus Search"
              icon="search"
            />
            <q-btn 
              size="sm"
              color="secondary" 
              @click="testMinimize"
              label="Test Minimize"
              icon="minimize"
            />
            <q-btn 
              size="sm"
              color="accent" 
              @click="testToggleTheme"
              label="Test Toggle Theme"
              icon="palette"
            />
            <q-btn 
              size="sm"
              color="warning" 
              @click="testCopyUrl"
              label="Test Copy URL"
              icon="content_copy"
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- Test Shortcuts Help Dialog -->
      <ShortcutsHelp v-model="showShortcuts" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ShortcutsHelp from '../components/ShortcutsHelp.vue'

const showShortcuts = ref(false)
const testResults = ref([])
const isElectron = ref(false)
const electronAPI = ref(null)
const platform = ref(navigator.platform)
const userAgent = ref(navigator.userAgent)

onMounted(() => {
  electronAPI.value = window.electronAPI
  isElectron.value = electronAPI.value?.isElectron || false
  
  console.log('ShortcutsTest mounted')
  console.log('isElectron:', isElectron.value)
  console.log('electronAPI:', electronAPI.value)
})

const addTestResult = (key, action, status = 'detected') => {
  testResults.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    key,
    action,
    status
  })
  
  // Keep only last 15 results
  if (testResults.value.length > 15) {
    testResults.value = testResults.value.slice(0, 15)
  }
}

const clearResults = () => {
  testResults.value = []
}

// API test functions
const testFocusSearch = () => {
  if (electronAPI.value && electronAPI.value.focusSearch) {
    const result = electronAPI.value.focusSearch()
    addTestResult('API Test', `Focus Search: ${result ? 'Success' : 'Failed'}`, result ? 'handled' : 'failed')
  } else {
    addTestResult('API Test', 'Focus Search: API not available', 'failed')
  }
}

const testMinimize = () => {
  if (electronAPI.value && electronAPI.value.minimizeWindow) {
    electronAPI.value.minimizeWindow()
    addTestResult('API Test', 'Minimize Window: Called', 'handled')
  } else {
    addTestResult('API Test', 'Minimize Window: API not available', 'failed')
  }
}

const testToggleTheme = () => {
  if (electronAPI.value && electronAPI.value.toggleTheme) {
    const result = electronAPI.value.toggleTheme()
    addTestResult('API Test', `Toggle Theme: ${result ? 'Success' : 'Failed'}`, result ? 'handled' : 'failed')
  } else {
    addTestResult('API Test', 'Toggle Theme: API not available', 'failed')
  }
}

const testCopyUrl = () => {
  if (electronAPI.value && electronAPI.value.copyToClipboard) {
    electronAPI.value.copyToClipboard(window.location.href)
    addTestResult('API Test', 'Copy URL: Called', 'handled')
  } else {
    addTestResult('API Test', 'Copy URL: API not available', 'failed')
  }
}

// Enhanced keyboard event monitoring
document.addEventListener('keydown', (event) => {
  const keyCombo = []
  if (event.ctrlKey) keyCombo.push('Ctrl')
  if (event.metaKey) keyCombo.push('Cmd')
  if (event.shiftKey) keyCombo.push('Shift')
  if (event.altKey) keyCombo.push('Alt')
  keyCombo.push(event.key)
  
  const keyString = keyCombo.join('+')
  
  console.log('ShortcutsTest detected:', keyString)
  
  // Check if this is a known shortcut
  let action = 'Key pressed'
  let status = 'detected'
  
  // Test specific shortcuts
  if (keyString === 'F11') {
    action = 'Toggle Fullscreen'
    status = 'handled'
  } else if (keyString.includes('Ctrl+f') || keyString.includes('Cmd+f')) {
    action = 'Focus Search'
    status = 'handled'
    event.preventDefault()
  } else if (keyString.includes('Ctrl+m') || keyString.includes('Cmd+m')) {
    action = 'Minimize Window'
    status = 'handled'
  } else if (keyString.includes('Ctrl+?') || keyString.includes('Cmd+?') || keyString.includes('Ctrl+/') || keyString.includes('Cmd+/')) {
    action = 'Show Shortcuts Help'
    status = 'handled'
    event.preventDefault()
    showShortcuts.value = true
  } else if (keyString.includes('Ctrl+k') || keyString.includes('Cmd+k')) {
    action = 'Command Palette'
    status = 'handled'
  } else if (keyString.includes('Shift+H') && (keyString.includes('Ctrl') || keyString.includes('Cmd'))) {
    action = 'Navigate to Home'
    status = 'handled'
  } else if (keyString.includes('Shift+B') && (keyString.includes('Ctrl') || keyString.includes('Cmd'))) {
    action = 'Navigate to Reservations'
    status = 'handled'
  } else if (keyString.includes('Shift+G') && (keyString.includes('Ctrl') || keyString.includes('Cmd'))) {
    action = 'Navigate to Guests'
    status = 'handled'
  } else if (keyString.includes('Shift+O') && (keyString.includes('Ctrl') || keyString.includes('Cmd'))) {
    action = 'Navigate to Rooms'
    status = 'handled'
  } else if (keyString === 'Escape') {
    action = 'Close Modals'
    status = 'handled'
  }
  
  addTestResult(keyString, action, status)
})
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

.test-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background: #f9f9f9;
}

.test-result {
  display: flex;
  gap: 8px;
  padding: 2px 0;
  font-size: 12px;
  font-family: monospace;
}

.test-time {
  color: #666;
  min-width: 80px;
}

.test-key {
  color: #0066cc;
  font-weight: bold;
  min-width: 100px;
}

.test-action {
  color: #333;
}

.test-status {
  font-weight: bold;
  font-size: 11px;
  
  &.detected {
    color: #ff9800;
  }
  
  &.handled {
    color: #4caf50;
  }
  
  &.failed {
    color: #f44336;
  }
}

.test-key {
  &.detected {
    color: #ff9800;
  }
  
  &.handled {
    color: #4caf50;
  }
  
  &.failed {
    color: #f44336;
  }
}

.system-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  
  div {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>