import { api } from 'src/boot/axios'

export class SessionService {
  /**
   * Get current session status
   */
  static async getStatus() {
    try {
      const response = await api.get('/session/status')
      return response.data
    } catch (error) {
      console.error('Failed to get session status:', error)
      throw error
    }
  }

  /**
   * Lock session manually
   */
  static async lock() {
    try {
      const response = await api.post('/session/lock')
      return response.data
    } catch (error) {
      console.error('Failed to lock session:', error)
      throw error
    }
  }

  /**
   * Unlock session with password
   */
  static async unlock(password) {
    try {
      const response = await api.post('/session/unlock', { password })
      return response.data
    } catch (error) {
      console.error('Failed to unlock session:', error)
      throw error
    }
  }

  /**
   * Update session activity (heartbeat)
   */
  static async updateActivity() {
    const response = await api.post('/session/activity')
    return response.data
  }

  /**
   * Check if error indicates session is locked
   */
  static isSessionLockedError(error) {
    return error.response?.status === 423
  }

  /**
   * Check if error indicates authentication failure
   */
  static isAuthError(error) {
    return error.response?.status === 401
  }
}

export default SessionService