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
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      // Token expired or invalid - redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
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
