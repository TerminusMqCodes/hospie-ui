import api from 'boot/axios'

export default {
  // Get all subscriptions
  async getSubscriptions(params = {}) {
    const response = await api.get('/subscriptions', { params })
    return response.data
  },

  // Get single subscription
  async getSubscription(id) {
    const response = await api.get(`/subscriptions/${id}`)
    return response.data
  },

  // Create subscription
  async createSubscription(data) {
    const response = await api.post('/subscriptions', data)
    return response.data
  },

  // Update subscription
  async updateSubscription(id, data) {
    const response = await api.put(`/subscriptions/${id}`, data)
    return response.data
  },

  // Get available plans
  async getPlans() {
    const response = await api.get('/subscriptions/plans')
    return response.data
  },

  // Get statistics
  async getStatistics(params = {}) {
    const response = await api.get('/subscriptions/statistics', { params })
    return response.data
  },

  // Create setup intent
  async createSetupIntent() {
    const response = await api.post('/subscriptions/setup-intent')
    return response.data
  },

  // Cancel subscription
  async cancelSubscription(id) {
    const response = await api.post(`/subscriptions/${id}/cancel`)
    return response.data
  },

  // Resume subscription
  async resumeSubscription(id) {
    const response = await api.post(`/subscriptions/${id}/resume`)
    return response.data
  },

  // Update quantity
  async updateQuantity(id, data) {
    const response = await api.post(`/subscriptions/${id}/update-quantity`, data)
    return response.data
  },

  // Swap price
  async swapPrice(id, data) {
    const response = await api.post(`/subscriptions/${id}/swap-price`, data)
    return response.data
  },

  // Sync subscription
  async syncSubscription(id) {
    const response = await api.post(`/subscriptions/${id}/sync`)
    return response.data
  },

  // Get invoices
  async getInvoices(id, params = {}) {
    const response = await api.get(`/subscriptions/${id}/invoices`, { params })
    return response.data
  },

  // Create usage record
  async createUsageRecord(subscriptionItemId, data) {
    const response = await api.post(`/subscriptions/items/${subscriptionItemId}/usage`, data)
    return response.data
  }
}
