<template>
  <div v-if="isElectron" class="electron-window-controls" :class="{ 'fullscreen-mode': isFullscreen }" :data-platform="platform">
    <!-- Drag area for window movement -->
    <div class="window-drag-area"></div>
    
    <!-- Window controls -->
    <div class="window-controls">
      <!-- App title and icon -->
      <div class="app-title">
        <q-icon name="hotel" size="20px" class="app-icon" />
        <span class="title-text">Hospie PMS</span>
      </div>
      
      <!-- Control buttons -->
      <div class="control-buttons">
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="minimize"
          class="control-btn minimize-btn"
          @click="minimizeWindow"
        >
          <q-tooltip>Minimize (Ctrl+M)</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          size="sm"
          :icon="isMaximized ? 'crop_din' : 'crop_square'"
          class="control-btn maximize-btn"
          @click="toggleMaximize"
        >
          <q-tooltip>{{ isMaximized ? 'Restore' : 'Maximize' }}</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          size="sm"
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          class="control-btn fullscreen-btn"
          @click="toggleFullscreen"
        >
          <q-tooltip>{{ isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)' }}</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="close"
          class="control-btn close-btn"
          @click="closeWindow"
        >
          <q-tooltip>Close (Ctrl+W)</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive state
const isElectron = ref(false)
const isMaximized = ref(false)
const isFullscreen = ref(false)
const platform = ref('')

// Check if running in Electron
onMounted(() => {
  const electronAPI = window.electronAPI
  isElectron.value = electronAPI?.isElectron || false
  platform.value = electronAPI?.platform || ''
  
  if (isElectron.value) {
    // Listen for window state changes
    window.addEventListener('resize', () => {
      checkMaximized()
      checkFullscreen()
    })
    
    // Listen for fullscreen changes
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F11') {
        setTimeout(checkFullscreen, 100)
      }
    })
    
    checkMaximized()
    checkFullscreen()
  }
})

onUnmounted(() => {
  if (isElectron.value) {
    window.removeEventListener('resize', () => {
      checkMaximized()
      checkFullscreen()
    })
  }
})

// Window control methods
const minimizeWindow = async () => {
  const electronAPI = window.electronAPI
  if (electronAPI) {
    await electronAPI.minimizeWindow()
  }
}

const toggleMaximize = async () => {
  const electronAPI = window.electronAPI
  if (electronAPI) {
    await electronAPI.maximizeWindow()
    setTimeout(checkMaximized, 100) // Check state after animation
  }
}

const closeWindow = async () => {
  const electronAPI = window.electronAPI
  if (electronAPI) {
    await electronAPI.closeWindow()
  }
}

const toggleFullscreen = async () => {
  const electronAPI = window.electronAPI
  if (electronAPI) {
    const newFullscreenState = await electronAPI.toggleFullscreen()
    isFullscreen.value = newFullscreenState
  }
}

const checkMaximized = () => {
  // Simple check based on window size
  const isFullSize = window.innerWidth >= (screen.width - 100) && window.innerHeight >= (screen.height - 100)
  isMaximized.value = isFullSize
}

const checkFullscreen = () => {
  // Check if in fullscreen mode
  isFullscreen.value = window.innerWidth === screen.width && window.innerHeight === screen.height
}
</script>

<style scoped lang="scss">
.electron-window-controls {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 9999;
  pointer-events: none;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  /* Enhanced glass effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  
  /* Smooth transitions */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Hide in fullscreen mode */
  &.fullscreen-mode {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
  }
}

.window-drag-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 200px; // Leave space for controls
  height: 100%;
  -webkit-app-region: drag;
  pointer-events: auto;
}

.window-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
  pointer-events: auto;
  -webkit-app-region: no-drag;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  .app-icon {
    color: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  .title-text {
    user-select: none;
  }
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    transition: all 0.3s ease;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: scale(1.05);
    
    &::before {
      width: 40px;
      height: 40px;
    }
  }
  
  &:active {
    transform: scale(0.95);
    
    &::before {
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
    }
  }
  
  .q-icon {
    font-size: 16px;
  }
}

.minimize-btn {
  &:hover {
    background: rgba(255, 193, 7, 0.2);
    color: #FFC107;
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  }
}

.maximize-btn {
  &:hover {
    background: rgba(76, 175, 80, 0.2);
    color: #4CAF50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  }
}

.fullscreen-btn {
  &:hover {
    background: rgba(33, 150, 243, 0.2);
    color: #2196F3;
    box-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
  }
}

.close-btn {
  &:hover {
    background: rgba(244, 67, 54, 0.2);
    color: #F44336;
    box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
  }
}

/* Platform specific adjustments */
.electron-window-controls[data-platform="darwin"] {
  .control-buttons {
    order: -1;
    gap: 8px;
  }
  
  .app-title {
    justify-self: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .window-drag-area {
    left: 80px;
    right: 0;
  }
  
  .control-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    
    &.close-btn {
      background: #ff5f57;
      &:hover {
        background: #ff3b30;
      }
    }
    
    &.minimize-btn {
      background: #ffbd2e;
      &:hover {
        background: #ff9500;
      }
    }
    
    &.maximize-btn {
      background: #28ca42;
      &:hover {
        background: #30d158;
      }
    }
    
    .q-icon {
      display: none;
    }
  }
}

.electron-window-controls[data-platform="win32"] {
  .control-buttons {
    margin-right: -8px;
  }
  
  .control-btn {
    border-radius: 0;
    width: 46px;
    height: 32px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .close-btn:hover {
    background: #e81123;
    color: white;
  }
}

/* Dark mode support */
.body--dark {
  .electron-window-controls {
    background: rgba(0, 0, 0, 0.3);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .control-btn {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

/* Enhanced animations */
@keyframes windowControlPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.control-btn:focus {
  animation: windowControlPulse 0.3s ease-in-out;
}

/* Hide on mobile/non-electron */
@media (max-width: 768px) {
  .electron-window-controls {
    display: none;
  }
}
</style>