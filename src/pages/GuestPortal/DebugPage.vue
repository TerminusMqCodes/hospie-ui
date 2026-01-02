<template>
  <q-page class="q-pa-md" :class="{ 'bg-grey-9': $q.dark.isActive, 'bg-grey-1': !$q.dark.isActive }">
    <div class="q-pa-md" style="max-width: 800px; margin: 0 auto;">
      <div class="text-h4 q-mb-md text-center">Guest Portal Debug</div>
    
    <q-card class="q-mb-md" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
      <q-card-section>
        <div class="text-h6">Authentication State</div>
        <div><strong>Is Authenticated:</strong> {{ guestPortalStore.isAuthenticated }}</div>
        <div><strong>Is Logged In:</strong> {{ guestPortalStore.isLoggedIn }}</div>
        <div><strong>Has Token:</strong> {{ !!guestPortalStore.token }}</div>
        <div><strong>Guest Name:</strong> {{ guestPortalStore.guestName }}</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
      <q-card-section>
        <div class="text-h6">LocalStorage</div>
        <div><strong>Guest Portal Token:</strong> {{ localStorageToken ? 'Present' : 'Missing' }}</div>
        <div><strong>Guest Data:</strong> {{ localStorageGuest ? 'Present' : 'Missing' }}</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
      <q-card-section>
        <div class="text-h6">Actions</div>
        <q-btn 
          @click="testDashboard" 
          color="primary" 
          label="Test Dashboard API"
          :loading="dashboardLoading"
          class="q-mr-md"
        />
        <q-btn 
          @click="testDebugAuth" 
          color="secondary" 
          label="Test Debug Auth"
          :loading="debugAuthLoading"
          class="q-mr-md"
        />
        <q-btn 
          @click="reloadFromStorage" 
          color="accent" 
          label="Reload from Storage"
          class="q-mr-md"
        />
        <q-btn 
          @click="clearAuth" 
          color="negative" 
          label="Clear Auth"
        />
      </q-card-section>
    </q-card>

    <q-card v-if="dashboardResult" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
      <q-card-section>
        <div class="text-h6">Dashboard API Result</div>
        <pre :class="{ 'text-grey-3': $q.dark.isActive }">{{ JSON.stringify(dashboardResult, null, 2) }}</pre>
      </q-card-section>
    </q-card>

    <q-card v-if="error" :class="$q.dark.isActive ? 'bg-red-9 text-white' : 'bg-negative text-white'">
      <q-card-section>
        <div class="text-h6">Error</div>
        <pre>{{ error }}</pre>
      </q-card-section>
    </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGuestPortalStore } from 'src/stores/guestPortal'
import { api } from 'src/boot/axios'

const guestPortalStore = useGuestPortalStore()
const dashboardLoading = ref(false)
const debugAuthLoading = ref(false)
const dashboardResult = ref(null)
const error = ref(null)

const localStorageToken = computed(() => localStorage.getItem('guest_portal_token'))
const localStorageGuest = computed(() => localStorage.getItem('guest_portal_guest'))

const testDebugAuth = async () => {
  debugAuthLoading.value = true
  dashboardResult.value = null
  error.value = null
  
  try {
    const response = await api.get('/guest-portal/debug-auth')
    dashboardResult.value = response.data
  } catch (err) {
    error.value = err.message + '\n' + JSON.stringify(err.response?.data || {}, null, 2)
  } finally {
    debugAuthLoading.value = false
  }
}

const testDashboard = async () => {
  dashboardLoading.value = true
  dashboardResult.value = null
  error.value = null
  
  try {
    const result = await guestPortalStore.loadDashboard()
    dashboardResult.value = result
  } catch (err) {
    error.value = err.message + '\n' + JSON.stringify(err.response?.data || {}, null, 2)
  } finally {
    dashboardLoading.value = false
  }
}

const reloadFromStorage = async () => {
  await guestPortalStore.loadFromStorage()
}

const clearAuth = () => {
  guestPortalStore.clearAuth()
}

onMounted(async () => {
  await guestPortalStore.loadFromStorage()
})
</script>