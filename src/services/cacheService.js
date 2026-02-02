/**
 * Advanced Caching Service
 * Provides multi-level caching with TTL, compression, and storage management
 */

export class CacheService {
  constructor(options = {}) {
    this.options = {
      defaultTTL: options.defaultTTL || 300000, // 5 minutes
      maxSize: options.maxSize || 100, // Maximum number of entries
      compression: options.compression || false,
      storage: options.storage || 'memory', // 'memory', 'localStorage', 'sessionStorage'
      prefix: options.prefix || 'hospie_cache_',
      ...options
    }

    this.memoryCache = new Map()
    this.timestamps = new Map()
    this.accessCount = new Map()
    this.hitCount = 0
    this.missCount = 0

    this.init()
  }

  init() {
    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Every minute

    // Listen for storage events (for cross-tab synchronization)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this))
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  set(key, value, ttl = null) {
    const actualTTL = ttl || this.options.defaultTTL
    const expiryTime = Date.now() + actualTTL
    const cacheKey = this.getCacheKey(key)

    const cacheEntry = {
      value: this.options.compression ? this.compress(value) : value,
      compressed: this.options.compression,
      expiry: expiryTime,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0
    }

    // Store in memory cache
    this.memoryCache.set(cacheKey, cacheEntry)
    this.timestamps.set(cacheKey, expiryTime)
    this.accessCount.set(cacheKey, 0)

    // Store in persistent storage if configured
    if (this.options.storage !== 'memory') {
      this.setInStorage(cacheKey, cacheEntry)
    }

    // Enforce size limits
    this.enforceSizeLimit()

    return true
  }

  /**
   * Get a value from cache
   */
  get(key) {
    const cacheKey = this.getCacheKey(key)
    let cacheEntry = null

    // Try memory cache first
    if (this.memoryCache.has(cacheKey)) {
      cacheEntry = this.memoryCache.get(cacheKey)
    } else if (this.options.storage !== 'memory') {
      // Try persistent storage
      cacheEntry = this.getFromStorage(cacheKey)
      if (cacheEntry) {
        // Restore to memory cache
        this.memoryCache.set(cacheKey, cacheEntry)
        this.timestamps.set(cacheKey, cacheEntry.expiry)
      }
    }

    if (!cacheEntry) {
      this.missCount++
      return null
    }

    // Check if expired
    if (this.isExpired(cacheEntry)) {
      this.delete(key)
      this.missCount++
      return null
    }

    // Update access statistics
    cacheEntry.accessed = Date.now()
    cacheEntry.accessCount++
    this.accessCount.set(cacheKey, cacheEntry.accessCount)
    this.hitCount++

    // Return decompressed value if needed
    const value = cacheEntry.compressed ? this.decompress(cacheEntry.value) : cacheEntry.value
    return value
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Delete a specific key
   */
  delete(key) {
    const cacheKey = this.getCacheKey(key)
    
    this.memoryCache.delete(cacheKey)
    this.timestamps.delete(cacheKey)
    this.accessCount.delete(cacheKey)

    if (this.options.storage !== 'memory') {
      this.deleteFromStorage(cacheKey)
    }

    return true
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.memoryCache.clear()
    this.timestamps.clear()
    this.accessCount.clear()
    this.hitCount = 0
    this.missCount = 0

    if (this.options.storage !== 'memory') {
      this.clearStorage()
    }
  }

  /**
   * Get or set pattern - if key exists return it, otherwise set and return new value
   */
  async getOrSet(key, factory, ttl = null) {
    let value = this.get(key)
    
    if (value === null) {
      try {
        value = typeof factory === 'function' ? await factory() : factory
        this.set(key, value, ttl)
      } catch (error) {
        console.error('Cache factory function failed:', error)
        throw error
      }
    }
    
    return value
  }

  /**
   * Set multiple values at once
   */
  setMultiple(entries, ttl = null) {
    const results = {}
    
    for (const [key, value] of Object.entries(entries)) {
      results[key] = this.set(key, value, ttl)
    }
    
    return results
  }

  /**
   * Get multiple values at once
   */
  getMultiple(keys) {
    const results = {}
    
    for (const key of keys) {
      results[key] = this.get(key)
    }
    
    return results
  }

  /**
   * Increment a numeric value in cache
   */
  increment(key, amount = 1, ttl = null) {
    const current = this.get(key) || 0
    const newValue = current + amount
    this.set(key, newValue, ttl)
    return newValue
  }

  /**
   * Decrement a numeric value in cache
   */
  decrement(key, amount = 1, ttl = null) {
    return this.increment(key, -amount, ttl)
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount
    const hitRatio = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0

    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatio: Math.round(hitRatio * 100) / 100,
      totalEntries: this.memoryCache.size,
      memoryUsage: this.getMemoryUsage(),
      oldestEntry: this.getOldestEntry(),
      mostAccessed: this.getMostAccessedEntry()
    }
  }

  /**
   * Get all cache keys
   */
  keys() {
    return Array.from(this.memoryCache.keys()).map(key => 
      key.startsWith(this.options.prefix) ? key.slice(this.options.prefix.length) : key
    )
  }

  /**
   * Get cache size
   */
  size() {
    return this.memoryCache.size
  }

  /**
   * Flush expired entries
   */
  cleanup() {
    const now = Date.now()
    const expiredKeys = []

    for (const [key, expiry] of this.timestamps.entries()) {
      if (now > expiry) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => {
      const originalKey = key.startsWith(this.options.prefix) ? key.slice(this.options.prefix.length) : key
      this.delete(originalKey)
    })

    return expiredKeys.length
  }

  /**
   * Export cache data
   */
  export() {
    const data = {}
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isExpired(entry)) {
        const originalKey = key.startsWith(this.options.prefix) ? key.slice(this.options.prefix.length) : key
        data[originalKey] = {
          value: entry.compressed ? this.decompress(entry.value) : entry.value,
          expiry: entry.expiry,
          created: entry.created
        }
      }
    }
    
    return data
  }

  /**
   * Import cache data
   */
  import(data) {
    const now = Date.now()
    let imported = 0
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry.expiry > now) {
        const ttl = entry.expiry - now
        this.set(key, entry.value, ttl)
        imported++
      }
    }
    
    return imported
  }

  // Private methods

  getCacheKey(key) {
    return `${this.options.prefix}${key}`
  }

  isExpired(entry) {
    return Date.now() > entry.expiry
  }

  compress(value) {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.warn('Failed to compress cache value:', error)
      return value
    }
  }

  decompress(value) {
    try {
      return JSON.parse(value)
    } catch (error) {
      console.warn('Failed to decompress cache value:', error)
      return value
    }
  }

  enforceSizeLimit() {
    if (this.memoryCache.size <= this.options.maxSize) return

    // Remove least recently used entries
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.accessed - b.entry.accessed)

    const toRemove = entries.slice(0, this.memoryCache.size - this.options.maxSize)
    
    toRemove.forEach(({ key }) => {
      const originalKey = key.startsWith(this.options.prefix) ? key.slice(this.options.prefix.length) : key
      this.delete(originalKey)
    })
  }

  getMemoryUsage() {
    let size = 0
    
    for (const entry of this.memoryCache.values()) {
      size += JSON.stringify(entry).length
    }
    
    return size
  }

  getOldestEntry() {
    let oldest = null
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!oldest || entry.created < oldest.created) {
        oldest = { key, created: entry.created }
      }
    }
    
    return oldest
  }

  getMostAccessedEntry() {
    let mostAccessed = null
    
    for (const [key, count] of this.accessCount.entries()) {
      if (!mostAccessed || count > mostAccessed.count) {
        mostAccessed = { key, count }
      }
    }
    
    return mostAccessed
  }

  // Storage methods

  setInStorage(key, entry) {
    try {
      const storage = this.getStorage()
      if (storage) {
        storage.setItem(key, JSON.stringify(entry))
      }
    } catch (error) {
      console.warn('Failed to set cache in storage:', error)
    }
  }

  getFromStorage(key) {
    try {
      const storage = this.getStorage()
      if (storage) {
        const item = storage.getItem(key)
        return item ? JSON.parse(item) : null
      }
    } catch (error) {
      console.warn('Failed to get cache from storage:', error)
    }
    return null
  }

  deleteFromStorage(key) {
    try {
      const storage = this.getStorage()
      if (storage) {
        storage.removeItem(key)
      }
    } catch (error) {
      console.warn('Failed to delete cache from storage:', error)
    }
  }

  clearStorage() {
    try {
      const storage = this.getStorage()
      if (storage) {
        const keys = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && key.startsWith(this.options.prefix)) {
            keys.push(key)
          }
        }
        keys.forEach(key => storage.removeItem(key))
      }
    } catch (error) {
      console.warn('Failed to clear cache storage:', error)
    }
  }

  getStorage() {
    if (typeof window === 'undefined') return null
    
    switch (this.options.storage) {
      case 'localStorage':
        return window.localStorage
      case 'sessionStorage':
        return window.sessionStorage
      default:
        return null
    }
  }

  handleStorageChange(event) {
    if (event.key && event.key.startsWith(this.options.prefix)) {
      const cacheKey = event.key
      
      if (event.newValue === null) {
        // Key was deleted
        this.memoryCache.delete(cacheKey)
        this.timestamps.delete(cacheKey)
        this.accessCount.delete(cacheKey)
      } else {
        // Key was updated
        try {
          const entry = JSON.parse(event.newValue)
          this.memoryCache.set(cacheKey, entry)
          this.timestamps.set(cacheKey, entry.expiry)
        } catch (error) {
          console.warn('Failed to sync cache from storage event:', error)
        }
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this))
    }
    
    this.clear()
  }
}

// Default cache instance
export const cache = new CacheService()

// Specialized cache instances
export const apiCache = new CacheService({
  prefix: 'hospie_api_',
  defaultTTL: 300000, // 5 minutes
  storage: 'sessionStorage'
})

export const userCache = new CacheService({
  prefix: 'hospie_user_',
  defaultTTL: 3600000, // 1 hour
  storage: 'localStorage'
})

export const tempCache = new CacheService({
  prefix: 'hospie_temp_',
  defaultTTL: 60000, // 1 minute
  storage: 'memory'
})

// Vue composable
export function useCache(type = 'default') {
  const cacheInstance = {
    default: cache,
    api: apiCache,
    user: userCache,
    temp: tempCache
  }[type] || cache

  return {
    cache: cacheInstance,
    set: (key, value, ttl) => cacheInstance.set(key, value, ttl),
    get: (key) => cacheInstance.get(key),
    has: (key) => cacheInstance.has(key),
    delete: (key) => cacheInstance.delete(key),
    clear: () => cacheInstance.clear(),
    getOrSet: (key, factory, ttl) => cacheInstance.getOrSet(key, factory, ttl),
    getStats: () => cacheInstance.getStats()
  }
}