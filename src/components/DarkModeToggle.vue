<template>
  <q-btn 
    :round="round"
    :dense="dense"
    :flat="flat"
    :color="isDarkMode ? 'yellow-6' : 'grey-8'" 
    :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
    @click="toggleDarkMode"
    :size="size"
  >
    <q-tooltip>{{ isDarkMode ? 'Világos mód' : 'Sötét mód' }}</q-tooltip>
  </q-btn>
</template>

<script>
import { onMounted } from 'vue'
import { useDarkMode } from '../composables/useDarkMode'

export default {
  name: 'DarkModeToggle',
  
  props: {
    round: {
      type: Boolean,
      default: true
    },
    dense: {
      type: Boolean,
      default: true
    },
    flat: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'md'
    }
  },

  setup() {
    const { isDarkMode, toggleDarkMode, loadDarkModePreference } = useDarkMode()

    onMounted(() => {
      loadDarkModePreference()
    })

    return {
      isDarkMode,
      toggleDarkMode
    }
  }
}
</script>