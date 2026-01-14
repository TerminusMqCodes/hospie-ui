import api from 'boot/axios'

export default {
  // Send message
  async sendMessage(data) {
    const response = await api.post('/chatbot/messages', data)
    return response.data
  },

  // Get conversation
  async getConversation(conversationId) {
    const response = await api.get(`/chatbot/conversations`, {
      params: { conversation_id: conversationId }
    })
    return response.data
  },

  // Escalate conversation
  async escalateConversation(data) {
    const response = await api.post('/chatbot/escalate', data)
    return response.data
  },

  // Get analytics
  async getAnalytics(params = {}) {
    const response = await api.get('/chatbot/analytics', { params })
    return response.data
  },

  // Provide feedback
  async provideFeedback(data) {
    const response = await api.post('/chatbot/feedback', data)
    return response.data
  },

  // Admin functions
  async getActiveConversations(params = {}) {
    const response = await api.get('/admin/chatbot/conversations', { params })
    return response.data
  },

  async getPendingEscalations(params = {}) {
    const response = await api.get('/admin/chatbot/escalations', { params })
    return response.data
  },

  async acknowledgeEscalation(escalationId) {
    const response = await api.post(`/admin/chatbot/escalations/${escalationId}/acknowledge`)
    return response.data
  },

  async resolveEscalation(escalationId, data) {
    const response = await api.post(`/admin/chatbot/escalations/${escalationId}/resolve`, data)
    return response.data
  }
}
