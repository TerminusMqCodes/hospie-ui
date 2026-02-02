import api from 'boot/axios'

export default {
  // Get guest notifications
  async getGuestNotifications(params = {}) {
    const response = await api.get('/notifications/guest-notifications', { params })
    return response.data
  },

  // Mark as read
  async markAsRead(notificationId) {
    const response = await api.post(`/notifications/${notificationId}/mark-read`)
    return response.data
  },

  // Send reservation confirmation
  async sendReservationConfirmation(reservationId) {
    const response = await api.post(`/notifications/reservations/${reservationId}/confirmation`)
    return response.data
  },

  // Send check-in reminder
  async sendCheckInReminder(reservationId) {
    const response = await api.post(`/notifications/reservations/${reservationId}/checkin-reminder`)
    return response.data
  },

  // Send check-out reminder
  async sendCheckOutReminder(reservationId) {
    const response = await api.post(`/notifications/reservations/${reservationId}/checkout-reminder`)
    return response.data
  },

  // Send daily reminders
  async sendDailyReminders() {
    const response = await api.post('/notifications/send-daily-reminders')
    return response.data
  },

  // Get notification stats
  async getStats(params = {}) {
    const response = await api.get('/notifications/stats', { params })
    return response.data
  },

  // Send bulk notifications
  async sendBulk(data) {
    const response = await api.post('/notifications/bulk', data)
    return response.data
  },

  // Test configuration
  async testConfiguration() {
    const response = await api.get('/notifications/test-configuration')
    return response.data
  },

  // Guest notification preferences
  async getPreferences(guestId) {
    const response = await api.get(`/guests/${guestId}/notifications/preferences`)
    return response.data
  },

  async updatePreferences(guestId, data) {
    const response = await api.put(`/guests/${guestId}/notifications/preferences`, data)
    return response.data
  },

  async getHistory(guestId, params = {}) {
    const response = await api.get(`/guests/${guestId}/notifications/history`, { params })
    return response.data
  }
}
