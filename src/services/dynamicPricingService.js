import api from 'boot/axios'

export default {
  // Get room pricing
  async getRoomPricing(roomId, params = {}) {
    const response = await api.get(`/dynamic-pricing/room/${roomId}/pricing`, { params })
    return response.data
  },

  // Get demand forecast
  async getDemandForecast(roomId, params = {}) {
    const response = await api.get(`/dynamic-pricing/room/${roomId}/demand-forecast`, { params })
    return response.data
  },

  // Update all pricing
  async updateAllPricing() {
    const response = await api.post('/dynamic-pricing/update-all-pricing')
    return response.data
  },

  // Get pricing analytics
  async getPricingAnalytics(params = {}) {
    const response = await api.get('/dynamic-pricing/analytics', { params })
    return response.data
  },

  // Get model performance
  async getModelPerformance() {
    const response = await api.get('/dynamic-pricing/model-performance')
    return response.data
  },

  // Train models
  async trainModels() {
    const response = await api.post('/dynamic-pricing/train-models')
    return response.data
  },

  // Get configuration
  async getConfiguration() {
    const response = await api.get('/dynamic-pricing/configuration')
    return response.data
  },

  // Update configuration
  async updateConfiguration(data) {
    const response = await api.put('/dynamic-pricing/configuration', data)
    return response.data
  }
}
