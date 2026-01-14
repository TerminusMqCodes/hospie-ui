import api from 'boot/axios'

export default {
  // Get all properties
  async getProperties() {
    const response = await api.get('/properties')
    return response.data
  },

  // Get current property
  async getCurrentProperty() {
    const response = await api.get('/properties/current')
    return response.data
  },

  // Switch property
  async switchProperty(propertyId) {
    const response = await api.post('/properties/switch', { property_id: propertyId })
    return response.data
  },

  // Create property
  async createProperty(data) {
    const response = await api.post('/properties', data)
    return response.data
  },

  // Update property
  async updateProperty(propertyId, data) {
    const response = await api.put(`/properties/${propertyId}`, data)
    return response.data
  },

  // Get property statistics
  async getStatistics(propertyId) {
    const response = await api.get(`/properties/${propertyId}/statistics`)
    return response.data
  },

  // Get property users
  async getUsers(propertyId) {
    const response = await api.get(`/properties/${propertyId}/users`)
    return response.data
  },

  // Assign user to property
  async assignUser(propertyId, data) {
    const response = await api.post(`/properties/${propertyId}/users`, data)
    return response.data
  },

  // Update user role
  async updateUserRole(propertyId, propertyUserId, data) {
    const response = await api.put(`/properties/${propertyId}/users/${propertyUserId}`, data)
    return response.data
  },

  // Remove user from property
  async removeUser(propertyId, propertyUserId) {
    const response = await api.delete(`/properties/${propertyId}/users/${propertyUserId}`)
    return response.data
  }
}
