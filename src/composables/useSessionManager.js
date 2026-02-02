import { onMounted, onUnmounted } from 'vue'
import { useSessionStore } from 'src/stores/session'
import { useAuthStore } from 'src/stores/auth'

export function useSessionManager() {
  const sessionStore = useSessionStore()
  const authStore = useAuthStore()

  // Initialize session management when user is authenticated
  const initializeSession = async () => {
    if (authStore.isAuthenticated && !sessionStore.isLocked) {
      await sessionStore.initialize()
    }
  }

  // Cleanup session management
  const cleanupSession = () => {
    sessionStore.destroy()
  }

  // Manual lock function
  const lockSession = async () => {
    try {
      await sessionStore.lockSession('manual')
    } catch (error) {
      console.error('Failed to lock session:', error)
    }
  }

  // Auto-initialize on mount if authenticated
  onMounted(() => {
    if (authStore.isAuthenticated) {
      initializeSession()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupSession()
  })

  return {
    sessionStore,
    initializeSession,
    cleanupSession,
    lockSession,
    
    // Expose store getters and actions
    isLocked: () => sessionStore.isLocked,
    isSessionActive: () => sessionStore.isSessionActive,
    showWarning: () => sessionStore.showWarning,
    unlockSession: (password) => sessionStore.unlockSession(password),
    continueSession: () => sessionStore.continueSession(),
    updateSettings: (settings) => sessionStore.updateSettings(settings)
  }
}