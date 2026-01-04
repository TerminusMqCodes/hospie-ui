import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const isDarkMode = ref(false)

export function useDarkMode() {
  const $q = useQuasar()

  // Initialize dark mode from Quasar's current state
  isDarkMode.value = $q.dark.isActive

  // Watch for changes and update Quasar's dark mode
  watch(isDarkMode, (newValue) => {
    $q.dark.set(newValue)
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(newValue))
  })

  // Load saved preference from localStorage
  const loadDarkModePreference = () => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      const savedValue = JSON.parse(saved)
      isDarkMode.value = savedValue
      $q.dark.set(savedValue)
    } else {
      // If no preference saved, use system preference or default to light
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      isDarkMode.value = prefersDark
      $q.dark.set(prefersDark)
      localStorage.setItem('darkMode', JSON.stringify(prefersDark))
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  return {
    isDarkMode,
    toggleDarkMode,
    loadDarkModePreference
  }
}