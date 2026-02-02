import api from 'boot/axios'

export default {
  // Get all channels
  async getChannels() {
    const response = await api.get('/channel-manager/channels')
    return response.data
  },

  // Get channel configuration
  async getChannelConfig(channelId) {
    const response = await api.get(`/channel-manager/channels/${channelId}/config`)
    return response.data
  },

  // Update channel configuration
  async updateChannelConfig(channelId, data) {
    const response = await api.put(`/channel-manager/channels/${channelId}/config`, data)
    return response.data
  },

  // Sync rates
  async syncRates(channelId, data) {
    const response = await api.post(`/channel-manager/channels/${channelId}/sync-rates`, data)
    return response.data
  },

  // Sync availability
  async syncAvailability(channelId, data) {
    const response = await api.post(`/channel-manager/channels/${channelId}/sync-availability`, data)
    return response.data
  },

  // Get reservations
  async getReservations(channelId, params = {}) {
    const response = await api.get(`/channel-manager/channels/${channelId}/reservations`, { params })
    return response.data
  },

  // Get sync logs
  async getSyncLogs(params = {}) {
    const response = await api.get('/channel-manager/sync-logs', { params })
    return response.data
  },

  // Get statistics
  async getStatistics(params = {}) {
    const response = await api.get('/channel-manager/statistics', { params })
    return response.data
  },

  // Test connection
  async testConnection(channelId) {
    const response = await api.post(`/channel-manager/channels/${channelId}/test-connection`)
    return response.data
  }
}
