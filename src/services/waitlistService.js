import api from 'boot/axios'

export default {
  // Get all waitlists
  async getWaitlists(params = {}) {
    const response = await api.get('/waitlists', { params })
    return response.data
  },

  // Get single waitlist
  async getWaitlist(id) {
    const response = await api.get(`/waitlists/${id}`)
    return response.data
  },

  // Create waitlist entry
  async createWaitlist(data) {
    const response = await api.post('/waitlists', data)
    return response.data
  },

  // Update waitlist
  async updateWaitlist(id, data) {
    const response = await api.put(`/waitlists/${id}`, data)
    return response.data
  },

  // Delete waitlist
  async deleteWaitlist(id) {
    const response = await api.delete(`/waitlists/${id}`)
    return response.data
  },

  // Convert to reservation
  async convertToReservation(id, data) {
    const response = await api.post(`/waitlists/${id}/convert`, data)
    return response.data
  },

  // Extend waitlist
  async extendWaitlist(id, data) {
    const response = await api.post(`/waitlists/${id}/extend`, data)
    return response.data
  },

  // Increase priority
  async increasePriority(id) {
    const response = await api.post(`/waitlists/${id}/increase-priority`)
    return response.data
  },

  // Get statistics
  async getStatistics(params = {}) {
    const response = await api.get('/waitlists/statistics', { params })
    return response.data
  },

  // Cleanup expired
  async cleanup() {
    const response = await api.post('/waitlists/cleanup')
    return response.data
  },

  // Get guest waitlists
  async getGuestWaitlists(guestId) {
    const response = await api.get(`/guests/${guestId}/waitlists`)
    return response.data
  }
}
