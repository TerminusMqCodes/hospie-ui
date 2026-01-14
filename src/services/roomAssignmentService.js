import api from 'boot/axios'

export default {
  // Auto assign room
  async autoAssign(reservationId, data = {}) {
    const response = await api.post(`/room-assignments/reservations/${reservationId}/auto-assign`, data)
    return response.data
  },

  // Manual assign room
  async manualAssign(reservationId, data) {
    const response = await api.post(`/room-assignments/reservations/${reservationId}/manual-assign`, data)
    return response.data
  },

  // Reassign room
  async reassign(reservationId, data) {
    const response = await api.post(`/room-assignments/reservations/${reservationId}/reassign`, data)
    return response.data
  },

  // Unassign room
  async unassign(reservationId) {
    const response = await api.post(`/room-assignments/reservations/${reservationId}/unassign`)
    return response.data
  },

  // Get suggestions
  async getSuggestions(reservationId, params = {}) {
    const response = await api.get(`/room-assignments/reservations/${reservationId}/suggestions`, { params })
    return response.data
  },

  // Bulk assign
  async bulkAssign(data) {
    const response = await api.post('/room-assignments/bulk-assign', data)
    return response.data
  }
}
