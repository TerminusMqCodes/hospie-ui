import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const uiLanguage = ref('en')
const uiTheme = ref('auto')
const uiPreferences = ref({
  sidebar_collapsed: false,
  notifications_enabled: true,
  sound_enabled: true,
  animation_enabled: true
})

const isLoaded = ref(false)

export function useGuestUIPreferences() {
  const $q = useQuasar()

  // Computed properties
  const isDarkMode = computed(() => {
    if (uiTheme.value === 'dark') return true
    if (uiTheme.value === 'light') return false
    // Auto mode - use system preference
    return $q.dark.isActive
  })

  const availableLanguages = computed(() => [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'hu', label: 'Magyar', flag: '🇭🇺' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' }
  ])

  const availableThemes = computed(() => [
    { value: 'auto', label: 'Auto', icon: 'brightness_auto' },
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' }
  ])

  // Load preferences from backend
  const loadPreferences = async () => {
    try {
      const response = await api.get('/guest-portal/ui-preferences')
      
      if (response.data.success) {
        const data = response.data.data
        uiLanguage.value = data.ui_language || 'en'
        uiTheme.value = data.ui_theme || 'auto'
        uiPreferences.value = { ...uiPreferences.value, ...data.ui_preferences }
        
        // Apply preferences immediately
        applyLanguage(uiLanguage.value)
        applyTheme(uiTheme.value)
        
        isLoaded.value = true
      }
    } catch (error) {
      console.warn('Failed to load UI preferences:', error)
      // Load from localStorage as fallback
      loadFromLocalStorage()
    }
  }

  // Save preferences to backend
  const savePreferences = async (preferences = {}) => {
    try {
      const payload = {
        ui_language: uiLanguage.value,
        ui_theme: uiTheme.value,
        ui_preferences: uiPreferences.value,
        ...preferences
      }

      const response = await api.put('/guest-portal/ui-preferences', payload)
      
      if (response.data.success) {
        // Also save to localStorage for offline access
        saveToLocalStorage()
        return true
      }
    } catch (error) {
      console.error('Failed to save UI preferences:', error)
      // Save to localStorage as fallback
      saveToLocalStorage()
      return false
    }
  }

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('guest_ui_preferences')
      if (stored) {
        const data = JSON.parse(stored)
        uiLanguage.value = data.ui_language || 'en'
        uiTheme.value = data.ui_theme || 'auto'
        uiPreferences.value = { ...uiPreferences.value, ...data.ui_preferences }
        
        applyLanguage(uiLanguage.value)
        applyTheme(uiTheme.value)
      }
      isLoaded.value = true
    } catch (error) {
      console.warn('Failed to load UI preferences from localStorage:', error)
      isLoaded.value = true
    }
  }

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      const data = {
        ui_language: uiLanguage.value,
        ui_theme: uiTheme.value,
        ui_preferences: uiPreferences.value
      }
      localStorage.setItem('guest_ui_preferences', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save UI preferences to localStorage:', error)
    }
  }

  // Apply language - now returns the language to be set by components
  const applyLanguage = (lang) => {
    document.documentElement.lang = lang
    // Return the language so components can set it in their i18n instance
    return lang
  }

  // Apply theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      $q.dark.set(true)
    } else if (theme === 'light') {
      $q.dark.set(false)
    } else {
      // Auto mode - use system preference
      $q.dark.set('auto')
    }
  }

  // Change language
  const changeLanguage = async (lang) => {
    uiLanguage.value = lang
    applyLanguage(lang)
    await savePreferences({ ui_language: lang })
  }

  // Change theme
  const changeTheme = async (theme) => {
    uiTheme.value = theme
    applyTheme(theme)
    await savePreferences({ ui_theme: theme })
  }

  // Update specific preference
  const updatePreference = async (key, value) => {
    uiPreferences.value[key] = value
    await savePreferences({ ui_preferences: { [key]: value } })
  }

  // Initialize preferences
  const initializePreferences = async () => {
    if (!isLoaded.value) {
      // Try to load from backend first, fallback to localStorage
      const token = localStorage.getItem('guest_portal_token')
      if (token) {
        await loadPreferences()
      } else {
        loadFromLocalStorage()
      }
    }
  }

  // Watch for changes and auto-save
  watch([uiLanguage, uiTheme, uiPreferences], () => {
    if (isLoaded.value) {
      saveToLocalStorage()
    }
  }, { deep: true })

  return {
    // State
    uiLanguage,
    uiTheme,
    uiPreferences,
    isLoaded,
    
    // Computed
    isDarkMode,
    availableLanguages,
    availableThemes,
    
    // Methods
    loadPreferences,
    savePreferences,
    changeLanguage,
    changeTheme,
    updatePreference,
    initializePreferences,
    loadFromLocalStorage,
    saveToLocalStorage,
    applyLanguage,
    applyTheme
  }
}