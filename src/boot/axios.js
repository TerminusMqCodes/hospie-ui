import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Laravel API base URL - adjust based on environment
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api'
  : '/api' // Use relative URL for proxy to work

// Create API instance for Laravel backend
const api = axios.create({ 
  baseURL,
  timeout: 0, // Disable timeout (wait indefinitely) - set to a number in ms if you want a timeout
  // timeout: 30000, // Alternative: 30 second timeout
  // timeout: 60000, // Alternative: 60 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true // Enable cookies for session-based authentication
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're making a guest portal request
    const isGuestPortalRequest = config.url?.startsWith('/guest-portal') || 
                                 window.location.pathname.startsWith('/guest-portal')
    
    if (isGuestPortalRequest) {
      // Use guest portal token
      const guestToken = localStorage.getItem('guest_portal_token')
      if (guestToken) {
        config.headers.Authorization = `Bearer ${guestToken}`
      }
    } else {
      // Use regular auth token
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if we're in guest portal context
      const isGuestPortal = window.location.pathname.startsWith('/guest-portal')
      
      if (isGuestPortal) {
        // Clear guest portal auth data
        localStorage.removeItem('guest_portal_token')
        localStorage.removeItem('guest_portal_guest')
        
        // Don't redirect automatically - let the component handle it
        console.warn('Guest portal authentication expired')
      } else {
        // Regular auth - redirect to main login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    } else if (error.response?.status === 423) {
      // Session is locked - this will be handled by the session store
      console.info('Session is locked')
    }
    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
