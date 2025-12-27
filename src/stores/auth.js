import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('auth_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || null
  },

  actions: {
    // Register new user
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/auth/register', userData)
        
        this.user = response.data.user
        this.token = response.data.token
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('auth_token', this.token)
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Login user
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/auth/login', credentials)
        
        this.user = response.data.user
        this.token = response.data.token
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('auth_token', this.token)
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Logout user
    async logout() {
      this.loading = true
      
      try {
        if (this.token) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        console.warn('Logout API call failed:', error)
      } finally {
        // Clear state and localStorage regardless of API call result
        this.user = null
        this.token = null
        this.error = null
        this.loading = false
        
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
      }
    },

    // Logout from all devices
    async logoutAll() {
      this.loading = true
      
      try {
        if (this.token) {
          await api.post('/auth/logout-all')
        }
      } catch (error) {
        console.warn('Logout all API call failed:', error)
      } finally {
        // Clear state and localStorage regardless of API call result
        this.user = null
        this.token = null
        this.error = null
        this.loading = false
        
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
      }
    },

    // Get current user profile
    async fetchUser() {
      if (!this.token) return null
      
      this.loading = true
      
      try {
        const response = await api.get('/auth/user')
        this.user = response.data.user
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return this.user
      } catch (error) {
        // If token is invalid, clear auth state
        if (error.response?.status === 401) {
          this.clearAuth()
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // Refresh token
    async refreshToken() {
      if (!this.token) return null
      
      try {
        const response = await api.post('/auth/refresh-token')
        this.token = response.data.token
        
        // Update localStorage
        localStorage.setItem('auth_token', this.token)
        
        return this.token
      } catch (error) {
        // If refresh fails, clear auth state
        this.clearAuth()
        throw error
      }
    },

    // Clear authentication state
    clearAuth() {
      this.user = null
      this.token = null
      this.error = null
      this.loading = false
      
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Initialize auth state from localStorage
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    }
  }
})