import { defineBoot } from '#q-app/wrappers'
import { useBrandingStore } from 'src/stores/branding'
import { useAuthStore } from 'src/stores/auth'

export default defineBoot(async ({ app, router }) => {
  const brandingStore = useBrandingStore()
  const authStore = useAuthStore()

  // Initialize branding system
  const initializeBranding = async () => {
    try {
      // Always try to load branding (now supports public access)
      await brandingStore.loadTenantBranding()
    } catch (error) {
      console.warn('Failed to initialize branding:', error)
      // Don't throw error to prevent app from breaking
      // Use default branding instead
      brandingStore.setDefaultBranding()
    }
  }

  // Watch for authentication changes
  const unwatchAuth = authStore.$subscribe((mutation, state) => {
    if (state.isAuthenticated && !brandingStore.isLoaded) {
      initializeBranding()
    } else if (!state.isAuthenticated && !brandingStore.isLoaded) {
      // Load public branding even when not authenticated
      initializeBranding()
    }
  })

  // Initialize branding immediately (public endpoint supports this)
  await initializeBranding()

  // Router navigation guard to refresh branding if needed
  router.beforeEach(async (to, from, next) => {
    // Refresh branding on navigation if it's stale
    if (brandingStore.needsRefresh()) {
      try {
        await brandingStore.refreshIfNeeded()
      } catch (error) {
        console.warn('Failed to refresh branding during navigation:', error)
      }
    }
    next()
  })

  // Apply branding to document on route changes
  router.afterEach(() => {
    if (brandingStore.isLoaded) {
      brandingStore.applyBranding()
    }
  })

  // Cleanup on app unmount
  app.config.globalProperties.$brandingCleanup = () => {
    unwatchAuth()
  }
})