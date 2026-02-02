<template>
  <router-view />
  
  <!-- Dynamic Theme Component -->
  <DynamicTheme />
  
  <!-- Session Management Components -->
  <SessionLock />
  <SessionWarning />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSessionManager } from './composables/useSessionManager'
import { useBranding } from './composables/useBranding'
import SessionLock from './components/SessionLock.vue'
import SessionWarning from './components/SessionWarning.vue'
import DynamicTheme from './components/DynamicTheme.vue'

const authStore = useAuthStore()
const { initializeSession } = useSessionManager()
const { initializeBranding } = useBranding()

// Initialize session management when app starts
onMounted(async () => {
  // Initialize auth state if token exists
  if (localStorage.getItem('auth_token') && !authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // Initialize session management if authenticated
  if (authStore.isAuthenticated) {
    await initializeSession()
    
    // Initialize branding system
    try {
      await initializeBranding()
    } catch (error) {
      console.warn('Failed to initialize branding:', error)
    }
  }
})
</script>
