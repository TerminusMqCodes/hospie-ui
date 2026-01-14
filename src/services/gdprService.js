import api from 'boot/axios'

export default {
  // Request data export
  async requestExport(guestId, data = {}) {
    const response = await api.post(`/gdpr/guests/${guestId}/export`, data)
    return response.data
  },

  // Get export requests
  async getExportRequests(guestId) {
    const response = await api.get(`/gdpr/guests/${guestId}/exports`)
    return response.data
  },

  // Request data deletion
  async requestDeletion(guestId, data) {
    const response = await api.post(`/gdpr/guests/${guestId}/delete`, data)
    return response.data
  },

  // Get deletion requests
  async getDeletionRequests(guestId) {
    const response = await api.get(`/gdpr/guests/${guestId}/deletions`)
    return response.data
  },

  // Update consent
  async updateConsent(guestId, data) {
    const response = await api.post(`/gdpr/guests/${guestId}/consent`, data)
    return response.data
  },

  // Get compliance status
  async getComplianceStatus(guestId) {
    const response = await api.get(`/gdpr/guests/${guestId}/compliance`)
    return response.data
  },

  // Get audit log
  async getAuditLog(guestId, params = {}) {
    const response = await api.get(`/gdpr/guests/${guestId}/audit`, { params })
    return response.data
  },

  // Get pending deletions (admin)
  async getPendingDeletions(params = {}) {
    const response = await api.get('/gdpr/deletions/pending', { params })
    return response.data
  },

  // Approve deletion (admin)
  async approveDeletion(deletionRequestId) {
    const response = await api.post(`/gdpr/deletions/${deletionRequestId}/approve`)
    return response.data
  },

  // Reject deletion (admin)
  async rejectDeletion(deletionRequestId, data) {
    const response = await api.post(`/gdpr/deletions/${deletionRequestId}/reject`, data)
    return response.data
  }
}
