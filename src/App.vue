<template>
  <router-view />
  
  <!-- Session Management Components -->
  <SessionLock />
  <SessionWarning />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSessionManager } from './composables/useSessionManager'
import SessionLock from './components/SessionLock.vue'
import SessionWarning from './components/SessionWarning.vue'

const authStore = useAuthStore()
const { initializeSession } = useSessionManager()

// Initialize session management when app starts
onMounted(async () => {
  // Initialize auth state if token exists
  if (localStorage.getItem('auth_token') && !authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // Initialize session management if authenticated
  if (authStore.isAuthenticated) {
    await initializeSession()
  }
})
</script>
