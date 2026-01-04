import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import offlineApiService from '../services/offlineApiService'
import offlineStorage from '../services/offlineStorage'

export const useOfflineStore = defineStore('offline', () => {
  // State
  const isOnline = ref(navigator.onLine)
  const syncInProgress = ref(false)
  const pendingSyncCount = ref(0)
  const lastSyncTime = ref(null)
  const offlineData = ref({
    reservations: [],
    rooms: [],
    guests: [],
    invoices: []
  })

  // Getters
  const canSync = computed(() => isOnline.value && !syncInProgress.value)
  const hasOfflineChanges = computed(() => pendingSyncCount.value > 0)
  const syncStatus = computed(() => {
    if (syncInProgress.value) return 'syncing'
    if (!isOnline.value) return 'offline'
    if (hasOfflineChanges.value) return 'pending'
    return 'synced'
  })

  // Actions
  const updateOnlineStatus = (online) => {
    isOnline.value = online
    if (online && hasOfflineChanges.value) {
      // Auto-sync when coming back online
      setTimeout(() => {
        syncData()
      }, 1000)
    }
  }

  const loadOfflineData = async () => {
    try {
      const [reservations, rooms, guests, invoices] = await Promise.all([
        offlineStorage.getReservations(),
        offlineStorage.getRooms(),
        offlineStorage.getGuests(),
        offlineStorage.getInvoices()
      ])

      offlineData.value = {
        reservations,
        rooms,
        guests,
        invoices
      }

      // Update pending sync count
      const syncQueue = await offlineStorage.getSyncQueue()
      pendingSyncCount.value = syncQueue.length

      // Get last sync time
      const lastSync = await offlineStorage.getSetting('lastSyncTime')
      lastSyncTime.value = lastSync
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }

  const syncData = async () => {
    if (!canSync.value) return

    syncInProgress.value = true
    
    try {
      await offlineApiService.forcSync()
      await loadOfflineData() // Refresh data after sync
      
      lastSyncTime.value = new Date().toISOString()
      await offlineStorage.setSetting('lastSyncTime', lastSyncTime.value)
    } catch (error) {
      console.error('Sync failed:', error)
      throw error
    } finally {
      syncInProgress.value = false
    }
  }

  const clearOfflineData = async () => {
    try {
      await offlineStorage.clearAllData()
      await loadOfflineData()
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      throw error
    }
  }

  // Data getters with offline fallback
  const getReservations = async () => {
    try {
      const data = await offlineApiService.getReservations()
      offlineData.value.reservations = data
      return data
    } catch (error) {
      console.error('Failed to get reservations:', error)
      return offlineData.value.reservations
    }
  }

  const getRooms = async () => {
    try {
      const data = await offlineApiService.getRooms()
      offlineData.value.rooms = data
      return data
    } catch (error) {
      console.error('Failed to get rooms:', error)
      return offlineData.value.rooms
    }
  }

  const getGuests = async () => {
    try {
      const data = await offlineApiService.getGuests()
      offlineData.value.guests = data
      return data
    } catch (error) {
      console.error('Failed to get guests:', error)
      return offlineData.value.guests
    }
  }

  const getDashboardData = async () => {
    try {
      return await offlineApiService.getDashboardData()
    } catch (error) {
      console.error('Failed to get dashboard data:', error)
      // Return basic offline dashboard
      return {
        reservations: {
          total: offlineData.value.reservations.length,
          today: 0,
          pending: 0
        },
        rooms: {
          total: offlineData.value.rooms.length,
          occupied: 0,
          available: 0,
          maintenance: 0
        },
        guests: {
          total: offlineData.value.guests.length,
          checkedIn: 0
        },
        offline: true
      }
    }
  }

  // CRUD operations with offline support
  const createReservation = async (reservationData) => {
    try {
      const result = await offlineApiService.createReservation(reservationData)
      await loadOfflineData() // Refresh data
      return result
    } catch (error) {
      console.error('Failed to create reservation:', error)
      throw error
    }
  }

  const updateReservation = async (id, reservationData) => {
    try {
      const result = await offlineApiService.updateReservation(id, reservationData)
      await loadOfflineData() // Refresh data
      return result
    } catch (error) {
      console.error('Failed to update reservation:', error)
      throw error
    }
  }

  const updateRoomStatus = async (roomId, status) => {
    try {
      const result = await offlineApiService.updateRoomStatus(roomId, status)
      await loadOfflineData() // Refresh data
      return result
    } catch (error) {
      console.error('Failed to update room status:', error)
      throw error
    }
  }

  const createGuest = async (guestData) => {
    try {
      const result = await offlineApiService.createGuest(guestData)
      await loadOfflineData() // Refresh data
      return result
    } catch (error) {
      console.error('Failed to create guest:', error)
      throw error
    }
  }

  // Storage info
  const getStorageInfo = async () => {
    try {
      return await offlineStorage.getStorageInfo()
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return {}
    }
  }

  // Initialize store
  const initialize = async () => {
    // Set up online/offline listeners
    window.addEventListener('online', () => updateOnlineStatus(true))
    window.addEventListener('offline', () => updateOnlineStatus(false))
    
    // Load initial offline data
    await loadOfflineData()
    
    // Auto-sync if online
    if (isOnline.value && hasOfflineChanges.value) {
      setTimeout(() => {
        syncData().catch(console.error)
      }, 2000)
    }
  }

  return {
    // State
    isOnline,
    syncInProgress,
    pendingSyncCount,
    lastSyncTime,
    offlineData,
    
    // Getters
    canSync,
    hasOfflineChanges,
    syncStatus,
    
    // Actions
    updateOnlineStatus,
    loadOfflineData,
    syncData,
    clearOfflineData,
    initialize,
    
    // Data operations
    getReservations,
    getRooms,
    getGuests,
    getDashboardData,
    createReservation,
    updateReservation,
    updateRoomStatus,
    createGuest,
    getStorageInfo
  }
})