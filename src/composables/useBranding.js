import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useBrandingStore } from 'src/stores/branding'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

/**
 * Branding Composable
 * Provides reactive branding functionality and theme management
 */
export function useBranding() {
  const brandingStore = useBrandingStore()
  const authStore = useAuthStore()
  const $q = useQuasar()

  // Reactive getters
  const tenantName = computed(() => brandingStore.tenantName)
  const tenantId = computed(() => brandingStore.tenantId)
  const branding = computed(() => brandingStore.branding)
  const colors = computed(() => brandingStore.colors)
  const logo = computed(() => brandingStore.logo)
  const logoUrl = computed(() => brandingStore.logoUrl)
  const emailBranding = computed(() => brandingStore.emailBranding)
  const customDomain = computed(() => brandingStore.customDomain)
  const isLoaded = computed(() => brandingStore.isLoaded)
  const isCustomized = computed(() => brandingStore.isCustomized)
  const isLoading = computed(() => brandingStore.loading)
  const isUpdating = computed(() => brandingStore.updating)
  const error = computed(() => brandingStore.error)
  const quasarTheme = computed(() => brandingStore.quasarTheme)

  /**
   * Initialize branding system
   */
  const initializeBranding = async () => {
    try {
      // Always try to load branding (now supports public access)
      await brandingStore.loadTenantBranding()
    } catch (error) {
      console.warn('Failed to initialize branding, using defaults:', error)
      // Use default branding instead of failing
      brandingStore.setDefaultBranding()
    }
  }

  /**
   * Update tenant colors
   */
  const updateColors = async (colorConfig) => {
    try {
      await brandingStore.updateColors(colorConfig)
      
      // Show success notification
      $q.notify({
        type: 'positive',
        message: 'Colors updated successfully',
        position: 'top-right'
      })
      
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update colors',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Update tenant logo
   */
  const updateLogo = async (logoFile) => {
    try {
      await brandingStore.updateLogo(logoFile)
      
      $q.notify({
        type: 'positive',
        message: 'Logo updated successfully',
        position: 'top-right'
      })
      
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update logo',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Update email branding
   */
  const updateEmailBranding = async (emailConfig) => {
    try {
      await brandingStore.updateEmailBranding(emailConfig)
      
      $q.notify({
        type: 'positive',
        message: 'Email branding updated successfully',
        position: 'top-right'
      })
      
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update email branding',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Update custom domain
   */
  const updateCustomDomain = async (domain) => {
    try {
      await brandingStore.updateCustomDomain(domain)
      
      $q.notify({
        type: 'positive',
        message: 'Custom domain updated successfully',
        position: 'top-right'
      })
      
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update custom domain',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Preview branding changes
   */
  const previewBranding = async (previewData) => {
    try {
      const preview = await brandingStore.previewBranding(previewData)
      return preview
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to generate preview',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Reset branding to defaults
   */
  const resetBranding = async () => {
    try {
      await brandingStore.resetBranding()
      
      $q.notify({
        type: 'positive',
        message: 'Branding reset to defaults successfully',
        position: 'top-right'
      })
      
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to reset branding',
        position: 'top-right'
      })
      throw error
    }
  }

  /**
   * Generate PWA manifest
   */
  const generateManifest = async () => {
    try {
      const manifest = await brandingStore.generateManifest()
      return manifest
    } catch (error) {
      console.error('Failed to generate manifest:', error)
      throw error
    }
  }

  /**
   * Apply theme to Quasar
   */
  const applyQuasarTheme = () => {
    const theme = quasarTheme.value
    
    // Update Quasar's color palette
    Object.entries(theme).forEach(([key, value]) => {
      if ($q.config && $q.config.brand) {
        $q.config.brand[key] = value
      }
    })
  }

  /**
   * Get CSS variable value
   */
  const getCssVariable = (variableName) => {
    const root = document.documentElement
    return getComputedStyle(root).getPropertyValue(variableName).trim()
  }

  /**
   * Set CSS variable value
   */
  const setCssVariable = (variableName, value) => {
    const root = document.documentElement
    root.style.setProperty(variableName, value)
  }

  /**
   * Get brand colors for components
   */
  const getBrandColors = () => {
    return {
      primary: colors.value.primary || '#1976d2',
      secondary: colors.value.secondary || '#26a69a',
      accent: colors.value.accent || '#9c27b0',
      positive: colors.value.success || '#21ba45',
      negative: colors.value.error || '#c10015',
      info: colors.value.info || '#31ccec',
      warning: colors.value.warning || '#f2c037'
    }
  }

  /**
   * Check if dark mode should be used based on branding
   */
  const shouldUseDarkMode = computed(() => {
    // You can implement logic here to determine if dark mode should be used
    // based on the branding colors or user preferences
    return false
  })

  /**
   * Generate dynamic styles based on branding
   */
  const getDynamicStyles = () => {
    const brandColors = getBrandColors()
    
    return {
      '--q-primary': brandColors.primary,
      '--q-secondary': brandColors.secondary,
      '--q-accent': brandColors.accent,
      '--q-positive': brandColors.positive,
      '--q-negative': brandColors.negative,
      '--q-info': brandColors.info,
      '--q-warning': brandColors.warning,
      '--brand-logo-url': logoUrl.value ? `url(${logoUrl.value})` : 'none'
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    brandingStore.clearError()
  }

  /**
   * Refresh branding data
   */
  const refreshBranding = async () => {
    try {
      await brandingStore.loadTenantBranding()
    } catch (error) {
      console.error('Failed to refresh branding:', error)
    }
  }

  // Watch for authentication changes
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated && !isLoaded.value) {
        initializeBranding()
      } else if (!isAuthenticated && !isLoaded.value) {
        // Load public branding even when not authenticated
        initializeBranding()
      }
    },
    { immediate: true }
  )

  // Watch for branding changes and apply them
  watch(
    () => brandingStore.isApplied,
    (isApplied) => {
      if (isApplied) {
        applyQuasarTheme()
      }
    }
  )

  // Auto-refresh branding periodically
  let refreshInterval = null
  
  onMounted(() => {
    // Refresh branding every 5 minutes if user is active
    refreshInterval = setInterval(() => {
      if (authStore.isAuthenticated && document.visibilityState === 'visible') {
        brandingStore.refreshIfNeeded()
      }
    }, 5 * 60 * 1000) // 5 minutes
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })

  return {
    // State
    tenantName,
    tenantId,
    branding,
    colors,
    logo,
    logoUrl,
    emailBranding,
    customDomain,
    isLoaded,
    isCustomized,
    isLoading,
    isUpdating,
    error,
    quasarTheme,
    shouldUseDarkMode,

    // Actions
    initializeBranding,
    updateColors,
    updateLogo,
    updateEmailBranding,
    updateCustomDomain,
    previewBranding,
    resetBranding,
    generateManifest,
    refreshBranding,
    clearError,

    // Utilities
    getBrandColors,
    getDynamicStyles,
    getCssVariable,
    setCssVariable,
    applyQuasarTheme
  }
}