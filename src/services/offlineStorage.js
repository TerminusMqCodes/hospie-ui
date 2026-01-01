import { openDB } from 'idb'

class OfflineStorageService {
  constructor() {
    this.dbName = 'HospiePMS'
    this.dbVersion = 1
    this.db = null
  }

  async initDB() {
    if (this.db) return this.db

    this.db = await openDB(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Reservations store
        if (!db.objectStoreNames.contains('reservations')) {
          const reservationStore = db.createObjectStore('reservations', {
            keyPath: 'id'
          })
          reservationStore.createIndex('status', 'status')
          reservationStore.createIndex('check_in_date', 'check_in_date')
          reservationStore.createIndex('check_out_date', 'check_out_date')
        }

        // Rooms store
        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', {
            keyPath: 'id'
          })
          roomStore.createIndex('status', 'status')
          roomStore.createIndex('room_number', 'room_number')
          roomStore.createIndex('room_type', 'room_type')
        }

        // Guests store
        if (!db.objectStoreNames.contains('guests')) {
          const guestStore = db.createObjectStore('guests', {
            keyPath: 'id'
          })
          guestStore.createIndex('email', 'email')
          guestStore.createIndex('phone', 'phone')
          guestStore.createIndex('name', 'name')
        }

        // Invoices store
        if (!db.objectStoreNames.contains('invoices')) {
          const invoiceStore = db.createObjectStore('invoices', {
            keyPath: 'id'
          })
          invoiceStore.createIndex('status', 'status')
          invoiceStore.createIndex('guest_id', 'guest_id')
          invoiceStore.createIndex('created_at', 'created_at')
        }

        // Sync queue store (for offline changes)
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          })
          syncStore.createIndex('timestamp', 'timestamp')
          syncStore.createIndex('type', 'type')
          syncStore.createIndex('synced', 'synced')
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'key'
          })
        }
      }
    })

    return this.db
  }

  // Generic CRUD operations
  async get(storeName, key) {
    const db = await this.initDB()
    return await db.get(storeName, key)
  }

  async getAll(storeName) {
    const db = await this.initDB()
    return await db.getAll(storeName)
  }

  async put(storeName, data) {
    const db = await this.initDB()
    return await db.put(storeName, data)
  }

  async delete(storeName, key) {
    const db = await this.initDB()
    return await db.delete(storeName, key)
  }

  async clear(storeName) {
    const db = await this.initDB()
    return await db.clear(storeName)
  }

  // Reservations
  async getReservations() {
    return await this.getAll('reservations')
  }

  async getReservation(id) {
    return await this.get('reservations', id)
  }

  async saveReservation(reservation) {
    return await this.put('reservations', {
      ...reservation,
      lastModified: new Date().toISOString()
    })
  }

  async deleteReservation(id) {
    return await this.delete('reservations', id)
  }

  // Rooms
  async getRooms() {
    return await this.getAll('rooms')
  }

  async getRoom(id) {
    return await this.get('rooms', id)
  }

  async saveRoom(room) {
    return await this.put('rooms', {
      ...room,
      lastModified: new Date().toISOString()
    })
  }

  async updateRoomStatus(roomId, status) {
    const room = await this.getRoom(roomId)
    if (room) {
      room.status = status
      room.lastModified = new Date().toISOString()
      await this.saveRoom(room)
      
      // Add to sync queue
      await this.addToSyncQueue('room_status_update', {
        roomId,
        status,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Guests
  async getGuests() {
    return await this.getAll('guests')
  }

  async getGuest(id) {
    return await this.get('guests', id)
  }

  async saveGuest(guest) {
    return await this.put('guests', {
      ...guest,
      lastModified: new Date().toISOString()
    })
  }

  // Invoices
  async getInvoices() {
    return await this.getAll('invoices')
  }

  async getInvoice(id) {
    return await this.get('invoices', id)
  }

  async saveInvoice(invoice) {
    return await this.put('invoices', {
      ...invoice,
      lastModified: new Date().toISOString()
    })
  }

  // Sync Queue Management
  async addToSyncQueue(type, data) {
    const queueItem = {
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0
    }
    
    const db = await this.initDB()
    return await db.add('syncQueue', queueItem)
  }

  async getSyncQueue() {
    const db = await this.initDB()
    const tx = db.transaction('syncQueue', 'readonly')
    const index = tx.store.index('synced')
    return await index.getAll(false) // Get unsynced items
  }

  async markAsSynced(queueId) {
    const db = await this.initDB()
    const item = await db.get('syncQueue', queueId)
    if (item) {
      item.synced = true
      item.syncedAt = new Date().toISOString()
      await db.put('syncQueue', item)
    }
  }

  async incrementRetryCount(queueId) {
    const db = await this.initDB()
    const item = await db.get('syncQueue', queueId)
    if (item) {
      item.retryCount = (item.retryCount || 0) + 1
      item.lastRetry = new Date().toISOString()
      await db.put('syncQueue', item)
    }
  }

  // Settings
  async getSetting(key) {
    const setting = await this.get('settings', key)
    return setting ? setting.value : null
  }

  async setSetting(key, value) {
    return await this.put('settings', { key, value })
  }

  // Data synchronization
  async syncWithServer(apiService) {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync')
      return
    }

    const queue = await this.getSyncQueue()
    console.log(`Syncing ${queue.length} items...`)

    for (const item of queue) {
      try {
        await this.processSyncItem(item, apiService)
        await this.markAsSynced(item.id)
      } catch (error) {
        console.error('Sync failed for item:', item, error)
        await this.incrementRetryCount(item.id)
        
        // Remove items that failed too many times
        if (item.retryCount >= 3) {
          await this.delete('syncQueue', item.id)
        }
      }
    }
  }

  async processSyncItem(item, apiService) {
    switch (item.type) {
      case 'room_status_update':
        await apiService.updateRoomStatus(item.data.roomId, item.data.status)
        break
      case 'reservation_create':
        await apiService.createReservation(item.data)
        break
      case 'reservation_update':
        await apiService.updateReservation(item.data.id, item.data)
        break
      case 'guest_create':
        await apiService.createGuest(item.data)
        break
      case 'guest_update':
        await apiService.updateGuest(item.data.id, item.data)
        break
      default:
        console.warn('Unknown sync item type:', item.type)
    }
  }

  // Cache management
  async cacheApiResponse(endpoint, data) {
    const cacheKey = `api_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    await this.setSetting(cacheKey, {
      data,
      timestamp: new Date().toISOString()
    })
  }

  async getCachedApiResponse(endpoint, maxAge = 5 * 60 * 1000) { // 5 minutes default
    const cacheKey = `api_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    const cached = await this.getSetting(cacheKey)
    
    if (!cached) return null
    
    const age = Date.now() - new Date(cached.timestamp).getTime()
    if (age > maxAge) {
      return null // Cache expired
    }
    
    return cached.data
  }

  // Bulk operations for initial data sync
  async bulkSaveReservations(reservations) {
    const db = await this.initDB()
    const tx = db.transaction('reservations', 'readwrite')
    
    for (const reservation of reservations) {
      await tx.store.put({
        ...reservation,
        lastModified: new Date().toISOString()
      })
    }
    
    await tx.done
  }

  async bulkSaveRooms(rooms) {
    const db = await this.initDB()
    const tx = db.transaction('rooms', 'readwrite')
    
    for (const room of rooms) {
      await tx.store.put({
        ...room,
        lastModified: new Date().toISOString()
      })
    }
    
    await tx.done
  }

  async bulkSaveGuests(guests) {
    const db = await this.initDB()
    const tx = db.transaction('guests', 'readwrite')
    
    for (const guest of guests) {
      await tx.store.put({
        ...guest,
        lastModified: new Date().toISOString()
      })
    }
    
    await tx.done
  }

  // Database cleanup
  async clearAllData() {
    const db = await this.initDB()
    const storeNames = ['reservations', 'rooms', 'guests', 'invoices', 'syncQueue']
    
    for (const storeName of storeNames) {
      await this.clear(storeName)
    }
  }

  async getStorageInfo() {
    const db = await this.initDB()
    const info = {}
    
    const storeNames = ['reservations', 'rooms', 'guests', 'invoices', 'syncQueue']
    
    for (const storeName of storeNames) {
      const count = await db.count(storeName)
      info[storeName] = count
    }
    
    return info
  }
}

export const offlineStorage = new OfflineStorageService()
export default offlineStorage