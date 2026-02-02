import api from 'boot/axios'

export default {
  // Get outlets
  async getOutlets() {
    const response = await api.get('/pos/outlets')
    return response.data
  },

  // Process transaction
  async processTransaction(data) {
    const response = await api.post('/pos/transactions', data)
    return response.data
  },

  // Get transaction
  async getTransaction(transactionId) {
    const response = await api.get(`/pos/transactions/${transactionId}`)
    return response.data
  },

  // Process refund
  async processRefund(transactionId, data) {
    const response = await api.post(`/pos/transactions/${transactionId}/refund`, data)
    return response.data
  },

  // Void transaction
  async voidTransaction(transactionId) {
    const response = await api.post(`/pos/transactions/${transactionId}/void`)
    return response.data
  },

  // Validate room
  async validateRoom(data) {
    const response = await api.post('/pos/validate-room', data)
    return response.data
  },

  // Post pending charges
  async postPendingCharges(data) {
    const response = await api.post('/pos/post-pending-charges', data)
    return response.data
  },

  // Get pending charges
  async getPendingCharges(params = {}) {
    const response = await api.get('/pos/pending-charges', { params })
    return response.data
  },

  // Get daily summary
  async getDailySummary(params = {}) {
    const response = await api.get('/pos/daily-summary', { params })
    return response.data
  },

  // Get end of day report
  async getEndOfDayReport(params = {}) {
    const response = await api.get('/pos/end-of-day-report', { params })
    return response.data
  },

  // Get analytics
  async getAnalytics(params = {}) {
    const response = await api.get('/pos/analytics', { params })
    return response.data
  }
}
