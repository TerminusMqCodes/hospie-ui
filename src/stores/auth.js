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
    userId: (state) => state.user?.id || null,
    userRoles: (state) => state.user?.roles || [],
    userPermissions: (state) => state.user?.permissions || [],
    
    // Role checking helpers
    hasRole: (state) => (role) => {
      return state.user?.roles?.includes(role) || false
    },
    
    hasAnyRole: (state) => (roles) => {
      if (!Array.isArray(roles)) roles = [roles]
      return roles.some(role => state.user?.roles?.includes(role)) || false
    },
    
    hasAllRoles: (state) => (roles) => {
      if (!Array.isArray(roles)) roles = [roles]
      return roles.every(role => state.user?.roles?.includes(role)) || false
    },
    
    // Permission checking helpers
    hasPermission: (state) => (permission) => {
      // Super-admin and admin have all permissions
      if (state.user?.roles?.includes('super-admin') || state.user?.roles?.includes('admin')) {
        return true
      }
      // Check for wildcard permission
      if (state.user?.permissions?.includes('*')) {
        return true
      }
      return state.user?.permissions?.includes(permission) || false
    },
    
    hasAnyPermission: (state) => (permissions) => {
      // Super-admin and admin have all permissions
      if (state.user?.roles?.includes('super-admin') || state.user?.roles?.includes('admin')) {
        return true
      }
      // Check for wildcard permission
      if (state.user?.permissions?.includes('*')) {
        return true
      }
      if (!Array.isArray(permissions)) permissions = [permissions]
      return permissions.some(permission => state.user?.permissions?.includes(permission)) || false
    },
    
    hasAllPermissions: (state) => (permissions) => {
      // Super-admin and admin have all permissions
      if (state.user?.roles?.includes('super-admin') || state.user?.roles?.includes('admin')) {
        return true
      }
      // Check for wildcard permission
      if (state.user?.permissions?.includes('*')) {
        return true
      }
      if (!Array.isArray(permissions)) permissions = [permissions]
      return permissions.every(permission => state.user?.permissions?.includes(permission)) || false
    },
    
    // Admin checking helpers
    isAdmin: (state) => {
      return state.user?.roles?.includes('admin') || state.user?.roles?.includes('super-admin') || false
    },
    
    isSuperAdmin: (state) => {
      return state.user?.roles?.includes('super-admin') || false
    },
    
    // User type helpers
    isManager: (state) => state.user?.roles?.includes('manager') || false,
    isReceptionist: (state) => state.user?.roles?.includes('receptionist') || false,
    isHousekeeping: (state) => state.user?.roles?.includes('housekeeping') || false,
    isGuest: (state) => state.user?.roles?.includes('guest') || false
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
    },

    // Role and Permission Management Actions
    
    // Get all available roles
    async getRoles() {
      try {
        const response = await api.get('/roles')
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch roles'
        throw error
      }
    },

    // Get all available permissions
    async getPermissions() {
      try {
        const response = await api.get('/roles/permissions')
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch permissions'
        throw error
      }
    },

    // Create a new role (admin only)
    async createRole(roleData) {
      try {
        const response = await api.post('/roles', roleData)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create role'
        throw error
      }
    },

    // Update a role (admin only)
    async updateRole(roleId, roleData) {
      try {
        const response = await api.put(`/roles/${roleId}`, roleData)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update role'
        throw error
      }
    },

    // Delete a role (admin only)
    async deleteRole(roleId) {
      try {
        const response = await api.delete(`/roles/${roleId}`)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete role'
        throw error
      }
    },

    // Assign role to user (admin only)
    async assignRole(userId, role) {
      try {
        const response = await api.post('/roles/assign', {
          user_id: userId,
          role: role
        })
        
        // If assigning to current user, update local state
        if (userId === this.user?.id) {
          await this.fetchUser()
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to assign role'
        throw error
      }
    },

    // Remove role from user (admin only)
    async removeRole(userId, role) {
      try {
        const response = await api.post('/roles/remove', {
          user_id: userId,
          role: role
        })
        
        // If removing from current user, update local state
        if (userId === this.user?.id) {
          await this.fetchUser()
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to remove role'
        throw error
      }
    }
  }
})