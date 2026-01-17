<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="shortcuts-help-card" style="min-width: 600px; max-width: 800px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="keyboard" class="q-mr-sm" />
          Keyboard Shortcuts
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
          <q-tab name="window" label="Window" />
          <q-tab name="navigation" label="Navigation" />
          <q-tab name="utility" label="Utility" />
          <q-tab name="development" label="Development" v-if="isDevelopment" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Window Controls -->
          <q-tab-panel name="window">
            <div class="text-subtitle2 q-mb-md">Window & Display Controls</div>
            <div class="shortcuts-grid">
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.window" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.zoom" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Navigation -->
          <q-tab-panel name="navigation">
            <div class="text-subtitle2 q-mb-md">Navigation & Search</div>
            <div class="shortcuts-grid">
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.navigation" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.search" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Utility -->
          <q-tab-panel name="utility">
            <div class="text-subtitle2 q-mb-md">Utility & Actions</div>
            <div class="shortcuts-grid">
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.utility" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Development -->
          <q-tab-panel name="development" v-if="isDevelopment">
            <div class="text-subtitle2 q-mb-md">Development Tools</div>
            <div class="shortcuts-grid">
              <div class="shortcut-item" v-for="(desc, key) in shortcuts.development" :key="key">
                <div class="shortcut-key">{{ key }}</div>
                <div class="shortcut-desc">{{ desc }}</div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive state
const activeTab = ref('window')
const shortcuts = ref({})
const isDevelopment = ref(false)

// Computed
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Load shortcuts on mount
onMounted(async () => {
  const electronAPI = window.electronAPI
  if (electronAPI && electronAPI.getShortcuts) {
    try {
      shortcuts.value = await electronAPI.getShortcuts()
      isDevelopment.value = process.env.NODE_ENV === 'development'
    } catch (error) {
      console.error('Failed to load shortcuts:', error)
      // Fallback shortcuts with complete list
      shortcuts.value = {
        window: {
          'F11': 'Toggle Fullscreen',
          'Ctrl/Cmd + M': 'Minimize Window',
          'Ctrl/Cmd + Shift + M': 'Maximize/Restore Window',
          'Ctrl/Cmd + W': 'Close Window',
          'Alt + F4': 'Close Window (Windows)'
        },
        zoom: {
          'Ctrl/Cmd + Plus': 'Zoom In',
          'Ctrl/Cmd + Minus': 'Zoom Out',
          'Ctrl/Cmd + 0': 'Reset Zoom'
        },
        navigation: {
          'Ctrl/Cmd + Shift + H': 'Go to Home/Dashboard',
          'Ctrl/Cmd + Shift + B': 'Go to Reservations',
          'Ctrl/Cmd + Shift + G': 'Go to Guests',
          'Ctrl/Cmd + Shift + O': 'Go to Rooms'
        },
        search: {
          'Ctrl/Cmd + F': 'Focus Search Input',
          'Ctrl/Cmd + K': 'Open Command Palette'
        },
        utility: {
          'Ctrl/Cmd + Shift + C': 'Copy Current URL',
          'Ctrl/Cmd + Shift + T': 'Toggle Dark/Light Theme',
          'Ctrl/Cmd + P': 'Print Page',
          'Ctrl/Cmd + S': 'Save/Export Data',
          'Ctrl/Cmd + ?': 'Show Keyboard Shortcuts',
          'Escape': 'Close Modals/Dialogs'
        },
        development: isDevelopment.value ? {
          'F12': 'Toggle Developer Tools',
          'Ctrl/Cmd + Shift + I': 'Open Developer Tools',
          'Ctrl/Cmd + R': 'Reload Application',
          'Ctrl/Cmd + Shift + R': 'Hard Reload (Clear Cache)',
          'F5': 'Reload (Windows Style)'
        } : {}
      }
    }
  } else {
    // Browser fallback
    shortcuts.value = {
      window: {
        'F11': 'Toggle Fullscreen (Browser)',
        'Ctrl/Cmd + W': 'Close Tab',
        'Ctrl/Cmd + Shift + T': 'Reopen Closed Tab'
      },
      zoom: {
        'Ctrl/Cmd + Plus': 'Zoom In',
        'Ctrl/Cmd + Minus': 'Zoom Out',
        'Ctrl/Cmd + 0': 'Reset Zoom'
      },
      navigation: {
        'Ctrl/Cmd + L': 'Focus Address Bar',
        'Alt + Left': 'Go Back',
        'Alt + Right': 'Go Forward'
      },
      search: {
        'Ctrl/Cmd + F': 'Find in Page',
        'Ctrl/Cmd + G': 'Find Next'
      },
      utility: {
        'Ctrl/Cmd + P': 'Print Page',
        'Ctrl/Cmd + S': 'Save Page',
        'F5': 'Reload Page'
      },
      development: {}
    }
    isDevelopment.value = false
  }
})
</script>

<style scoped lang="scss">
.shortcuts-help-card {
  .shortcuts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .shortcut-key {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      min-width: 120px;
      text-align: center;
    }

    .shortcut-desc {
      flex: 1;
      margin-left: 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
    }
  }
}

// Dark mode support
.body--dark {
  .shortcuts-help-card {
    .shortcut-item {
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .shortcut-key {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .shortcut-desc {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .shortcuts-help-card {
    .shortcut-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .shortcut-key {
        min-width: auto;
        align-self: flex-start;
      }

      .shortcut-desc {
        margin-left: 0;
      }
    }
  }
}
</style>