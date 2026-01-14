import api from 'boot/axios'

export default {
  // Get all communications
  async getCommunications(params = {}) {
    const response = await api.get('/communications', { params })
    return response.data
  },

  // Get single communication
  async getCommunication(id) {
    const response = await api.get(`/communications/${id}`)
    return response.data
  },

  // Create communication
  async createCommunication(data) {
    const response = await api.post('/communications', data)
    return response.data
  },

  // Reply to communication
  async reply(id, data) {
    const response = await api.post(`/communications/${id}/reply`, data)
    return response.data
  },

  // Assign communication
  async assign(id, data) {
    const response = await api.post(`/communications/${id}/assign`, data)
    return response.data
  },

  // Update status
  async updateStatus(id, data) {
    const response = await api.patch(`/communications/${id}/status`, data)
    return response.data
  },

  // Mark as read
  async markAsRead(id) {
    const response = await api.post(`/communications/${id}/mark-read`)
    return response.data
  },

  // Get statistics
  async getStatistics(params = {}) {
    const response = await api.get('/communications/statistics', { params })
    return response.data
  },

  // Get templates
  async getTemplates() {
    const response = await api.get('/communications/templates')
    return response.data
  },

  // Send bulk messages
  async sendBulkMessages(data) {
    const response = await api.post('/communications/bulk-messages', data)
    return response.data
  },

  // Get guest history
  async getGuestHistory(guestId, params = {}) {
    const response = await api.get(`/communications/guests/${guestId}/history`, { params })
    return response.data
  },

  // Communication Templates
  async getAllTemplates(params = {}) {
    const response = await api.get('/communication-templates', { params })
    return response.data
  },

  async getTemplate(id) {
    const response = await api.get(`/communication-templates/${id}`)
    return response.data
  },

  async createTemplate(data) {
    const response = await api.post('/communication-templates', data)
    return response.data
  },

  async updateTemplate(id, data) {
    const response = await api.put(`/communication-templates/${id}`, data)
    return response.data
  },

  async deleteTemplate(id) {
    const response = await api.delete(`/communication-templates/${id}`)
    return response.data
  },

  async cloneTemplate(id) {
    const response = await api.post(`/communication-templates/${id}/clone`)
    return response.data
  },

  async testTemplate(id, data) {
    const response = await api.post(`/communication-templates/${id}/test`, data)
    return response.data
  },

  async getTriggerEvents() {
    const response = await api.get('/communication-templates/trigger-events')
    return response.data
  },

  async getTemplateStats() {
    const response = await api.get('/communication-templates/stats')
    return response.data
  }
}
