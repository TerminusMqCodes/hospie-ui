import { api } from 'boot/axios'
import offlineStorage from './offlineStorage'
import { Notify } from 'quasar'

class OfflineApiService {
  constructor() {
    this.isOnline = navigator.onLine
    this.setupEventListeners()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async syncWhenOnline() {
    if (this.isOnline) {
      try {
        await offlineStorage.syncWithServer(this)
        Notify.create({
          message: 'Data synchronized successfully',
          color: 'positive',
          icon: 'sync',
          timeout: 3000
        })
      } catch (error) {
        console.error('Sync failed:', error)
        Notify.create({
          message: 'Sync failed. Will retry later.',
          color: 'warning',
          icon: 'sync_problem',
          timeout: 3000
        })
      }
    }
  }

  // Generic API call with offline fallback
  async apiCall(method, endpoint, data = null, options = {}) {
    const { 
      useCache = true
    } = options

    // Try online first
    if (this.isOnline) {
      try {
        const response = await api[method](endpoint, data)
        
        // Cache successful responses
        if (useCache && method === 'get') {
          await offlineStorage.cacheApiResponse(endpoint, response.data)
        }
        
        return response.data
      } catch (error) {
        console.error(`API call failed: ${method} ${endpoint}`, error)
        
        // If network error, fall back to offline
        if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
          this.isOnline = false
          return await this.handleOfflineRequest(method, endpoint, data, options)
        }
        
        throw error
      }
    }

    // Handle offline request
    return await this.handleOfflineRequest(method, endpoint, data, options)
  }

  async handleOfflineRequest(method, endpoint, data, options) {
    const { useCache = true } = options

    // For GET requests, try to return cached data
    if (method === 'get' && useCache) {
      const cached = await offlineStorage.getCachedApiResponse(endpoint, 5 * 60 * 1000)
      if (cached) {
        return cached
      }
    }

    // For write operations, queue for later sync
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      await offlineStorage.addToSyncQueue('offline_action', {
        method,
        endpoint,
        data,
        timestamp: new Date().toISOString()
      })

      Notify.create({
        message: 'Changes saved offline. Will sync when online.',
        color: 'info',
        icon: 'cloud_off',
        timeout: 3000
      })

      return { success: true, offline: true }
    }

    // If no offline handling available, throw error
    throw new Error(`Offline: Cannot ${method} ${endpoint}`)
  }

  // Reservations API
  async getReservations() {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', '/api/reservations')
        await offlineStorage.bulkSaveReservations(data)
        return data
      } catch {
        console.error('Failed to fetch reservations online, using offline data')
      }
    }
    
    return await offlineStorage.getReservations()
  }

  async getReservation(id) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', `/api/reservations/${id}`)
        await offlineStorage.saveReservation(data)
        return data
      } catch {
        console.error('Failed to fetch reservation online, using offline data')
      }
    }
    
    return await offlineStorage.getReservation(id)
  }

  async createReservation(reservationData) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('post', '/api/reservations', reservationData)
        await offlineStorage.saveReservation(data)
        return data
      } catch {
        console.error('Failed to create reservation online, saving offline')
      }
    }

    // Save offline and queue for sync
    const offlineReservation = {
      ...reservationData,
      id: `offline_${Date.now()}`,
      created_at: new Date().toISOString(),
      offline: true
    }
    
    await offlineStorage.saveReservation(offlineReservation)
    await offlineStorage.addToSyncQueue('reservation_create', offlineReservation)
    
    return offlineReservation
  }

  async updateReservation(id, reservationData) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('put', `/api/reservations/${id}`, reservationData)
        await offlineStorage.saveReservation(data)
        return data
      } catch {
        console.error('Failed to update reservation online, saving offline')
      }
    }

    // Update offline and queue for sync
    const updatedReservation = {
      ...reservationData,
      id,
      updated_at: new Date().toISOString(),
      offline: true
    }
    
    await offlineStorage.saveReservation(updatedReservation)
    await offlineStorage.addToSyncQueue('reservation_update', updatedReservation)
    
    return updatedReservation
  }

  // Rooms API
  async getRooms() {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', '/api/rooms')
        await offlineStorage.bulkSaveRooms(data)
        return data
      } catch {
        console.error('Failed to fetch rooms online, using offline data')
      }
    }
    
    return await offlineStorage.getRooms()
  }

  async getRoom(id) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', `/api/rooms/${id}`)
        await offlineStorage.saveRoom(data)
        return data
      } catch {
        console.error('Failed to fetch room online, using offline data')
      }
    }
    
    return await offlineStorage.getRoom(id)
  }

  async updateRoomStatus(roomId, status) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('patch', `/api/rooms/${roomId}/status`, { status })
        await offlineStorage.saveRoom(data)
        return data
      } catch {
        console.error('Failed to update room status online, saving offline')
      }
    }

    // Update offline
    await offlineStorage.updateRoomStatus(roomId, status)
    
    return { id: roomId, status, offline: true }
  }

  // Guests API
  async getGuests() {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', '/api/guests')
        await offlineStorage.bulkSaveGuests(data)
        return data
      } catch {
        console.error('Failed to fetch guests online, using offline data')
      }
    }
    
    return await offlineStorage.getGuests()
  }

  async getGuest(id) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', `/api/guests/${id}`)
        await offlineStorage.saveGuest(data)
        return data
      } catch {
        console.error('Failed to fetch guest online, using offline data')
      }
    }
    
    return await offlineStorage.getGuest(id)
  }

  async createGuest(guestData) {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('post', '/api/guests', guestData)
        await offlineStorage.saveGuest(data)
        return data
      } catch {
        console.error('Failed to create guest online, saving offline')
      }
    }

    // Save offline and queue for sync
    const offlineGuest = {
      ...guestData,
      id: `offline_${Date.now()}`,
      created_at: new Date().toISOString(),
      offline: true
    }
    
    await offlineStorage.saveGuest(offlineGuest)
    await offlineStorage.addToSyncQueue('guest_create', offlineGuest)
    
    return offlineGuest
  }

  // Invoices API
  async getInvoices() {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', '/api/invoices')
        // Save to offline storage
        for (const invoice of data) {
          await offlineStorage.saveInvoice(invoice)
        }
        return data
      } catch {
        console.error('Failed to fetch invoices online, using offline data')
      }
    }
    
    return await offlineStorage.getInvoices()
  }

  // Dashboard data
  async getDashboardData() {
    if (this.isOnline) {
      try {
        const data = await this.apiCall('get', '/api/dashboard', null, {
          useCache: true,
          cacheMaxAge: 2 * 60 * 1000 // 2 minutes for dashboard
        })
        return data
      } catch {
        console.error('Failed to fetch dashboard data online')
      }
    }

    // Return offline dashboard data
    const [reservations, rooms, guests] = await Promise.all([
      offlineStorage.getReservations(),
      offlineStorage.getRooms(),
      offlineStorage.getGuests()
    ])

    return {
      reservations: {
        total: reservations.length,
        today: reservations.filter(r => {
          const today = new Date().toISOString().split('T')[0]
          return r.check_in_date === today
        }).length,
        pending: reservations.filter(r => r.status === 'pending').length
      },
      rooms: {
        total: rooms.length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        available: rooms.filter(r => r.status === 'available').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length
      },
      guests: {
        total: guests.length,
        checkedIn: guests.filter(g => g.status === 'checked_in').length
      },
      offline: true
    }
  }

  // Sync status
  async getSyncStatus() {
    const queue = await offlineStorage.getSyncQueue()
    const storageInfo = await offlineStorage.getStorageInfo()
    
    return {
      pendingSync: queue.length,
      isOnline: this.isOnline,
      storageInfo,
      lastSync: await offlineStorage.getSetting('lastSyncTime')
    }
  }

  // Manual sync trigger
  async forcSync() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    await this.syncWhenOnline()
    await offlineStorage.setSetting('lastSyncTime', new Date().toISOString())
  }
}

export const offlineApiService = new OfflineApiService()
export default offlineApiService