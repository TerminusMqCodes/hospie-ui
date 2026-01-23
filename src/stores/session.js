import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useSessionStore = defineStore('session', {
  state: () => ({
    isLocked: false,
    lockedAt: null,
    lockedReason: null,
    lastActivity: Date.now(),
    timeoutMinutes: 3,
    warningMinutes: 1,
    showWarning: false,
    timeUntilTimeout: 0,
    
    // Timers
    timeoutId: null,
    warningTimeoutId: null,
    checkIntervalId: null,
    activityIntervalId: null,
    
    // Settings
    autoLockEnabled: true,
    checkInterval: 30000, // 30 seconds
    activityInterval: 60000, // 1 minute
    
    // UI State
    unlockLoading: false,
    unlockError: null
  }),

  getters: {
    isSessionActive: (state) => !state.isLocked,
    timeUntilTimeoutFormatted: (state) => {
      const minutes = Math.floor(state.timeUntilTimeout / 60)
      const seconds = state.timeUntilTimeout % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    shouldShowWarning: (state) => {
      return state.showWarning && state.timeUntilTimeout <= (state.warningMinutes * 60)
    }
  },

  actions: {
    // Initialize session management
    async initialize() {
      if (!this.autoLockEnabled) return
      
      this.setupActivityTracking()
      this.startSessionCheck()
      this.startActivityHeartbeat()
      await this.loadSessionStatus()
    },

    // Setup activity event listeners
    setupActivityTracking() {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      
      events.forEach(event => {
        document.addEventListener(event, this.handleActivity, { passive: true })
      })
    },

    // Handle user activity
    handleActivity() {
      if (this.isLocked) return
      
      this.lastActivity = Date.now()
      this.hideWarning()
      this.resetTimeout()
    },

    // Reset timeout timers
    resetTimeout() {
      // Clear existing timeouts
      if (this.timeoutId) clearTimeout(this.timeoutId)
      if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId)

      // Set warning timeout
      const warningTime = (this.timeoutMinutes - this.warningMinutes) * 60 * 1000
      this.warningTimeoutId = setTimeout(() => {
        this.showWarningDialog()
      }, warningTime)

      // Set lock timeout
      const lockTime = this.timeoutMinutes * 60 * 1000
      this.timeoutId = setTimeout(() => {
        this.lockSession('timeout')
      }, lockTime)
    },

    // Load session status from API
    async loadSessionStatus() {
      try {
        const response = await api.get('/session/status')
        if (response.data?.data) {
          const data = response.data.data
          this.timeoutMinutes = data.timeout_minutes || 3
          this.isLocked = data.is_locked
          this.lockedAt = data.locked_at
          this.lockedReason = data.locked_reason
          
          if (this.isLocked) {
            this.showLockScreen()
          } else {
            this.resetTimeout()
          }
        }
      } catch (error) {
        console.error('Failed to load session status:', error)
        if (error.response?.status === 423) {
          // Session is locked
          this.isLocked = true
          this.lockedReason = 'timeout'
          this.showLockScreen()
        }
      }
    },

    // Start periodic session status check
    startSessionCheck() {
      this.checkIntervalId = setInterval(async () => {
        try {
          const response = await api.get('/session/status')
          if (response.data?.data?.is_locked && !this.isLocked) {
            this.isLocked = true
            this.lockedReason = response.data.data.locked_reason
            this.showLockScreen()
          }
        } catch (error) {
          if (error.response?.status === 423) {
            // Session is locked
            this.isLocked = true
            this.lockedReason = 'timeout'
            this.showLockScreen()
          }
        }
      }, this.checkInterval)
    },

    // Start activity heartbeat
    startActivityHeartbeat() {
      this.activityIntervalId = setInterval(async () => {
        if (!this.isLocked) {
          try {
            await api.post('/session/activity')
          } catch (error) {
            if (error.response?.status === 423) {
              this.isLocked = true
              this.lockedReason = 'timeout'
              this.showLockScreen()
            }
          }
        }
      }, this.activityInterval)
    },

    // Show warning dialog
    showWarningDialog() {
      if (this.isLocked) return
      
      this.showWarning = true
      
      // Start countdown
      let remainingSeconds = this.warningMinutes * 60
      this.timeUntilTimeout = remainingSeconds
      
      const countdownInterval = setInterval(() => {
        remainingSeconds--
        this.timeUntilTimeout = remainingSeconds
        
        if (remainingSeconds <= 0 || this.isLocked) {
          clearInterval(countdownInterval)
        }
      }, 1000)
    },

    // Hide warning dialog
    hideWarning() {
      this.showWarning = false
      this.timeUntilTimeout = 0
    },

    // Show lock screen
    showLockScreen() {
      this.isLocked = true
      this.hideWarning()
      
      // Clear all timeouts and intervals
      if (this.timeoutId) clearTimeout(this.timeoutId)
      if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId)
    },

    // Lock session manually
    async lockSession(reason = 'manual') {
      try {
        await api.post('/session/lock')
        this.isLocked = true
        this.lockedReason = reason
        this.lockedAt = new Date().toISOString()
        this.showLockScreen()
      } catch (error) {
        console.error('Failed to lock session:', error)
        throw error
      }
    },

    // Unlock session with password
    async unlockSession(password) {
      this.unlockLoading = true
      this.unlockError = null
      
      try {
        await api.post('/session/unlock', { password })
        
        // Success - unlock session
        this.isLocked = false
        this.lockedAt = null
        this.lockedReason = null
        this.unlockError = null
        
        // Resume session management
        this.resetTimeout()
        
        return true
      } catch (error) {
        let errorMessage = 'Failed to unlock session.'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        this.unlockError = errorMessage
        throw error
      } finally {
        this.unlockLoading = false
      }
    },

    // Continue session (dismiss warning)
    continueSession() {
      this.hideWarning()
      this.handleActivity()
    },

    // Get lock reason text
    getLockReasonText(reason) {
      switch (reason) {
        case 'timeout':
          return 'Your session was locked due to inactivity.'
        case 'manual':
          return 'You manually locked your session.'
        case 'security':
          return 'Your session was locked for security reasons.'
        default:
          return 'Your session is currently locked.'
      }
    },

    // Clear unlock error
    clearUnlockError() {
      this.unlockError = null
    },

    // Destroy session management
    destroy() {
      // Clear all timeouts and intervals
      if (this.timeoutId) clearTimeout(this.timeoutId)
      if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId)
      if (this.checkIntervalId) clearInterval(this.checkIntervalId)
      if (this.activityIntervalId) clearInterval(this.activityIntervalId)
      
      // Remove event listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.removeEventListener(event, this.handleActivity)
      })
      
      // Reset state
      this.isLocked = false
      this.showWarning = false
      this.unlockError = null
    },

    // Update settings
    updateSettings(settings) {
      if (settings.timeoutMinutes) this.timeoutMinutes = settings.timeoutMinutes
      if (settings.warningMinutes) this.warningMinutes = settings.warningMinutes
      if (settings.autoLockEnabled !== undefined) this.autoLockEnabled = settings.autoLockEnabled
      
      // Restart timers with new settings
      if (this.autoLockEnabled && !this.isLocked) {
        this.resetTimeout()
      }
    }
  }
})