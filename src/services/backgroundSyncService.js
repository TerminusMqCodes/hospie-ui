import offlineStorage from './offlineStorage'
import offlineApiService from './offlineApiService'

class BackgroundSyncService {
  constructor() {
    this.syncInProgress = false
    this.syncInterval = null
    this.conflictResolutionStrategy = 'server_wins' // 'server_wins', 'client_wins', 'merge', 'manual'
    this.maxRetries = 3
    this.retryDelay = 5000 // 5 seconds
  }

  // Initialize background sync
  async initialize() {
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('background-sync')
        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }

    // Set up periodic sync for browsers that don't support background sync
    this.setupPeriodicSync()

    // Listen for online events
    window.addEventListener('online', () => {
      this.performSync()
    })
  }

  // Setup periodic sync as fallback
  setupPeriodicSync() {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.performSync()
      }
    }, 30000)
  }

  // Perform background sync
  async performSync() {
    if (this.syncInProgress || !navigator.onLine) {
      return
    }

    this.syncInProgress = true
    console.log('Starting background sync...')

    try {
      // Get pending sync items
      const syncQueue = await offlineStorage.getSyncQueue()
      
      if (syncQueue.length === 0) {
        console.log('No items to sync')
        return
      }

      console.log(`Syncing ${syncQueue.length} items...`)

      // Process sync queue
      for (const item of syncQueue) {
        await this.processSyncItem(item)
      }

      // Sync data from server
      await this.syncFromServer()

      console.log('Background sync completed successfully')
    } catch (error) {
      console.error('Background sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Process individual sync item
  async processSyncItem(item) {
    try {
      let success = false
      let retryCount = 0

      while (!success && retryCount < this.maxRetries) {
        try {
          await this.executeSyncOperation(item)
          await offlineStorage.markAsSynced(item.id)
          success = true
          console.log(`Synced item: ${item.type}`)
        } catch (error) {
          retryCount++
          console.error(`Sync attempt ${retryCount} failed for item ${item.id}:`, error)
          
          if (retryCount < this.maxRetries) {
            await this.delay(this.retryDelay * retryCount) // Exponential backoff
          } else {
            // Handle conflict or permanent failure
            await this.handleSyncFailure(item, error)
          }
        }
      }
    } catch (error) {
      console.error('Failed to process sync item:', error)
    }
  }

  // Execute sync operation based on type
  async executeSyncOperation(item) {
    const { type, data } = item

    switch (type) {
      case 'reservation_create':
        return await offlineApiService.createReservation(data)
      
      case 'reservation_update':
        return await offlineApiService.updateReservation(data.id, data)
      
      case 'reservation_delete':
        return await offlineApiService.deleteReservation(data.id)
      
      case 'room_status_update':
        return await offlineApiService.updateRoomStatus(data.roomId, data.status)
      
      case 'guest_create':
        return await offlineApiService.createGuest(data)
      
      case 'guest_update':
        return await offlineApiService.updateGuest(data.id, data)
      
      case 'invoice_create':
        return await offlineApiService.createInvoice(data)
      
      case 'invoice_update':
        return await offlineApiService.updateInvoice(data.id, data)
      
      case 'payment_create':
        return await offlineApiService.createPayment(data)
      
      case 'notification_send':
        return await this.sendNotification(data)
      
      default:
        console.warn(`Unknown sync operation type: ${type}`)
    }
  }

  // Send notification
  async sendNotification(data) {
    const response = await fetch('/api/push-notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to send notification')
    }

    return await response.json()
  }

  // Handle sync failure
  async handleSyncFailure(item, error) {
    console.error(`Permanent sync failure for item ${item.id}:`, error)
    
    // Increment retry count
    await offlineStorage.incrementRetryCount(item.id)
    
    // Check if we should handle conflicts
    if (error.status === 409) { // Conflict
      await this.handleConflict(item, error)
    } else if (error.status === 404) { // Not found
      // Item was deleted on server, remove from queue
      await offlineStorage.delete('syncQueue', item.id)
    } else {
      // Other errors - keep in queue for manual resolution
      console.log(`Item ${item.id} kept in queue for manual resolution`)
    }
  }

  // Handle data conflicts
  async handleConflict(item, error) {
    const serverData = error.data
    const localData = item.data

    switch (this.conflictResolutionStrategy) {
      case 'server_wins':
        // Accept server version, discard local changes
        await this.acceptServerVersion(item, serverData)
        break
      
      case 'client_wins':
        // Force update with local version
        await this.forceLocalVersion(item)
        break
      
      case 'merge':
        // Attempt to merge changes
        await this.mergeVersions(item, serverData, localData)
        break
      
      case 'manual':
        // Store conflict for manual resolution
        await this.storeConflict(item, serverData, localData)
        break
    }
  }

  // Accept server version
  async acceptServerVersion(item, serverData) {
    const { type } = item
    const storeName = this.getStoreNameFromType(type)
    
    if (storeName && serverData) {
      await offlineStorage.put(storeName, serverData)
    }
    
    // Mark as synced
    await offlineStorage.markAsSynced(item.id)
  }

  // Force local version
  async forceLocalVersion(item) {
    // Retry the operation with force flag
    try {
      await this.executeSyncOperation({
        ...item,
        force: true
      })
      await offlineStorage.markAsSynced(item.id)
    } catch (error) {
      console.error('Failed to force local version:', error)
    }
  }

  // Merge versions
  async mergeVersions(item, serverData, localData) {
    try {
      const mergedData = this.mergeData(serverData, localData)
      
      // Update with merged data
      await this.executeSyncOperation({
        ...item,
        data: mergedData
      })
      
      // Update local storage
      const storeName = this.getStoreNameFromType(item.type)
      if (storeName) {
        await offlineStorage.put(storeName, mergedData)
      }
      
      await offlineStorage.markAsSynced(item.id)
    } catch (error) {
      console.error('Failed to merge versions:', error)
      // Fall back to manual resolution
      await this.storeConflict(item, serverData, localData)
    }
  }

  // Store conflict for manual resolution
  async storeConflict(item, serverData, localData) {
    const conflict = {
      id: `conflict_${item.id}_${Date.now()}`,
      syncItemId: item.id,
      type: item.type,
      serverData,
      localData,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    await offlineStorage.put('conflicts', conflict)
    console.log('Conflict stored for manual resolution:', conflict.id)
  }

  // Merge data objects
  mergeData(serverData, localData) {
    // Simple merge strategy - prefer local changes for user-modified fields
    const merged = { ...serverData }
    
    // Fields that should prefer local changes
    const localPreferredFields = [
      'notes', 'special_requests', 'preferences', 'custom_fields'
    ]
    
    localPreferredFields.forEach(field => {
      if (localData[field] !== undefined) {
        merged[field] = localData[field]
      }
    })
    
    // Use latest timestamp
    if (localData.updated_at && serverData.updated_at) {
      if (new Date(localData.updated_at) > new Date(serverData.updated_at)) {
        merged.updated_at = localData.updated_at
      }
    }
    
    return merged
  }

  // Get store name from sync type
  getStoreNameFromType(type) {
    const typeMap = {
      reservation_create: 'reservations',
      reservation_update: 'reservations',
      guest_create: 'guests',
      guest_update: 'guests',
      invoice_create: 'invoices',
      invoice_update: 'invoices'
    }
    
    return typeMap[type]
  }

  // Sync data from server
  async syncFromServer() {
    try {
      // Get last sync timestamp
      const lastSync = await offlineStorage.getSetting('lastServerSync')
      const timestamp = lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
      
      // Fetch updated data from server
      const updates = await this.fetchServerUpdates(timestamp)
      
      // Apply updates to local storage
      await this.applyServerUpdates(updates)
      
      // Update last sync timestamp
      await offlineStorage.setSetting('lastServerSync', new Date().toISOString())
    } catch (error) {
      console.error('Failed to sync from server:', error)
    }
  }

  // Fetch updates from server
  async fetchServerUpdates(since) {
    const response = await fetch(`/api/sync/updates?since=${encodeURIComponent(since)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch server updates')
    }

    return await response.json()
  }

  // Apply server updates to local storage
  async applyServerUpdates(updates) {
    const { reservations, rooms, guests, invoices } = updates

    if (reservations?.length) {
      await offlineStorage.bulkSaveReservations(reservations)
    }

    if (rooms?.length) {
      await offlineStorage.bulkSaveRooms(rooms)
    }

    if (guests?.length) {
      await offlineStorage.bulkSaveGuests(guests)
    }

    if (invoices?.length) {
      for (const invoice of invoices) {
        await offlineStorage.saveInvoice(invoice)
      }
    }
  }

  // Get sync status
  async getSyncStatus() {
    const syncQueue = await offlineStorage.getSyncQueue()
    const conflicts = await offlineStorage.getAll('conflicts')
    const lastSync = await offlineStorage.getSetting('lastServerSync')

    return {
      pendingItems: syncQueue.length,
      conflicts: conflicts?.filter(c => !c.resolved).length || 0,
      lastSync,
      inProgress: this.syncInProgress
    }
  }

  // Get conflicts for manual resolution
  async getConflicts() {
    const conflicts = await offlineStorage.getAll('conflicts')
    return conflicts?.filter(c => !c.resolved) || []
  }

  // Resolve conflict
  async resolveConflict(conflictId, resolution, data = null) {
    const conflict = await offlineStorage.get('conflicts', conflictId)
    if (!conflict) {
      throw new Error('Conflict not found')
    }

    switch (resolution) {
      case 'accept_server':
        await this.acceptServerVersion(
          { id: conflict.syncItemId, type: conflict.type },
          conflict.serverData
        )
        break
      
      case 'accept_local':
        await this.forceLocalVersion({
          id: conflict.syncItemId,
          type: conflict.type,
          data: conflict.localData
        })
        break
      
      case 'use_custom':
        if (!data) {
          throw new Error('Custom data required for custom resolution')
        }
        await this.executeSyncOperation({
          id: conflict.syncItemId,
          type: conflict.type,
          data
        })
        break
    }

    // Mark conflict as resolved
    conflict.resolved = true
    conflict.resolvedAt = new Date().toISOString()
    conflict.resolution = resolution
    await offlineStorage.put('conflicts', conflict)

    // Remove from sync queue
    await offlineStorage.delete('syncQueue', conflict.syncItemId)
  }

  // Set conflict resolution strategy
  setConflictResolutionStrategy(strategy) {
    const validStrategies = ['server_wins', 'client_wins', 'merge', 'manual']
    if (validStrategies.includes(strategy)) {
      this.conflictResolutionStrategy = strategy
    } else {
      throw new Error(`Invalid strategy: ${strategy}`)
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    window.removeEventListener('online', this.performSync)
  }
}

export const backgroundSyncService = new BackgroundSyncService()
export default backgroundSyncService