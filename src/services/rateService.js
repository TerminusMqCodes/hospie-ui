import api from 'boot/axios'

export default {
  // Get all rates
  async getRates(params = {}) {
    const response = await api.get('/rates', { params })
    return response.data
  },

  // Get single rate
  async getRate(id) {
    const response = await api.get(`/rates/${id}`)
    return response.data
  },

  // Create rate
  async createRate(data) {
    const response = await api.post('/rates', data)
    return response.data
  },

  // Update rate
  async updateRate(id, data) {
    const response = await api.put(`/rates/${id}`, data)
    return response.data
  },

  // Delete rate
  async deleteRate(id) {
    const response = await api.delete(`/rates/${id}`)
    return response.data
  },

  // Get rate calendar
  async getRateCalendar(params = {}) {
    const response = await api.get('/rates/calendar', { params })
    return response.data
  },

  // Bulk update rates
  async bulkUpdateRates(data) {
    const response = await api.post('/rates/bulk-update', data)
    return response.data
  },

  // Get rate statistics
  async getRateStatistics(params = {}) {
    const response = await api.get('/rates/statistics', { params })
    return response.data
  }
}
