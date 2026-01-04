import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useGuestUIPreferences } from 'src/composables/useGuestUIPreferences'

export const useGuestPortalStore = defineStore('guestPortal', {
  state: () => ({
    isAuthenticated: false,
    guest: null,
    token: null,
    currentReservation: null,
    dashboardData: null,
    profile: null,
    reservations: [],
    messages: [],
    loyaltyInfo: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    guestName: (state) => state.guest?.full_name || '',
    guestTier: (state) => state.guest?.guest_tier || 'standard',
    isVip: (state) => state.guest?.is_vip || false,
    loyaltyPoints: (state) => state.guest?.loyalty_points || 0
  },

  actions: {
    setAuth(authData) {
      this.isAuthenticated = true
      this.guest = authData.guest
      this.token = authData.token
      this.currentReservation = authData.reservation
      
      // Store in localStorage (axios interceptor will handle the token)
      localStorage.setItem('guest_portal_token', authData.token)
      localStorage.setItem('guest_portal_guest', JSON.stringify(authData.guest))
      
      // Initialize UI preferences after successful login
      const { initializePreferences } = useGuestUIPreferences()
      initializePreferences()
    },

    async loadFromStorage() {
      const token = localStorage.getItem('guest_portal_token')
      const guestData = localStorage.getItem('guest_portal_guest')
      
      if (token && guestData) {
        this.token = token
        this.guest = JSON.parse(guestData)
        this.isAuthenticated = true
        
        // Initialize UI preferences after authentication
        const { initializePreferences } = useGuestUIPreferences()
        await initializePreferences()
      }
    },

    async login(credentials) {
      const response = await api.post('/guest-portal/login', credentials)
      
      if (response.data.success) {
        this.setAuth(response.data.data)
        return response.data
      }
      
      throw new Error(response.data.message || 'Login failed')
    },

    async logout() {
      try {
        if (this.token) {
          await api.post('/guest-portal/logout')
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
      }
    },

    clearAuth() {
      this.isAuthenticated = false
      this.guest = null
      this.token = null
      this.currentReservation = null
      this.dashboardData = null
      this.profile = null
      this.reservations = []
      this.messages = []
      this.loyaltyInfo = null
      
      // Clear from localStorage
      localStorage.removeItem('guest_portal_token')
      localStorage.removeItem('guest_portal_guest')
    },

    async loadDashboard() {
      try {
        const response = await api.get('/guest-portal/dashboard')
        
        if (response.data.success) {
          this.dashboardData = response.data.data
          // Update guest info from dashboard
          if (response.data.data.guest) {
            this.guest = { ...this.guest, ...response.data.data.guest }
          }
          return response.data.data
        }
        
        throw new Error('Failed to load dashboard')
      } catch (error) {
        // If it's a 401 error, clear auth and let the component handle redirect
        if (error.response?.status === 401) {
          this.clearAuth()
        }
        throw error
      }
    },

    async loadProfile() {
      const response = await api.get('/guest-portal/profile')
      
      if (response.data.success) {
        this.profile = response.data.data
        return response.data.data
      }
      
      throw new Error('Failed to load profile')
    },

    async updateProfile(profileData) {
      const response = await api.put('/guest-portal/profile', profileData)
      
      if (response.data.success) {
        this.profile = { ...this.profile, guest: response.data.data }
        this.guest = { ...this.guest, ...response.data.data }
        return response.data.data
      }
      
      throw new Error('Failed to update profile')
    },

    async updatePreferences(preferences) {
      const response = await api.put('/guest-portal/preferences', preferences)
      
      if (response.data.success) {
        if (this.profile) {
          this.profile.preferences = response.data.data
        }
        return response.data.data
      }
      
      throw new Error('Failed to update preferences')
    },

    async updateCommunicationPreferences(preferences) {
      const response = await api.put('/guest-portal/communication-preferences', preferences)
      
      if (response.data.success) {
        if (this.profile) {
          this.profile.communication_preferences = response.data.data
        }
        return response.data.data
      }
      
      throw new Error('Failed to update communication preferences')
    },

    async loadReservations(status = 'all') {
      const response = await api.get('/guest-portal/reservations', {
        params: { status }
      })
      
      if (response.data.success) {
        this.reservations = response.data.data
        return response.data.data
      }
      
      throw new Error('Failed to load reservations')
    },

    async loadReservationDetails(reservationId) {
      const response = await api.get(`/guest-portal/reservations/${reservationId}`)
      
      if (response.data.success) {
        return response.data.data
      }
      
      throw new Error('Failed to load reservation details')
    },

    async requestEarlyCheckIn(reservationId, requestData) {
      const response = await api.post(`/guest-portal/reservations/${reservationId}/early-checkin`, requestData)
      
      if (response.data.success) {
        return response.data
      }
      
      throw new Error('Failed to submit early check-in request')
    },

    async requestLateCheckOut(reservationId, requestData) {
      const response = await api.post(`/guest-portal/reservations/${reservationId}/late-checkout`, requestData)
      
      if (response.data.success) {
        return response.data
      }
      
      throw new Error('Failed to submit late check-out request')
    },

    async submitServiceRequest(requestData) {
      const response = await api.post('/guest-portal/service-request', requestData)
      
      if (response.data.success) {
        return response.data
      }
      
      throw new Error('Failed to submit service request')
    },

    async loadMessages() {
      const response = await api.get('/guest-portal/messages')
      
      if (response.data.success) {
        this.messages = response.data.data
        return response.data.data
      }
      
      throw new Error('Failed to load messages')
    },

    async sendMessage(messageData) {
      const response = await api.post('/guest-portal/messages', messageData)
      
      if (response.data.success) {
        // Reload messages to get the updated list
        await this.loadMessages()
        return response.data
      }
      
      throw new Error('Failed to send message')
    },

    async loadLoyaltyInfo() {
      const response = await api.get('/guest-portal/loyalty')
      
      if (response.data.success) {
        this.loyaltyInfo = response.data.data
        return response.data.data
      }
      
      throw new Error('Failed to load loyalty information')
    }
  }
})