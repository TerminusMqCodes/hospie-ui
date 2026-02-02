import api from 'boot/axios'

export default {
  // Get supported types
  async getSupportedTypes() {
    const response = await api.get('/data/import/types')
    return response.data
  },

  // Download template
  async downloadTemplate(type) {
    const response = await api.get('/data/import/template', {
      params: { type },
      responseType: 'blob'
    })
    return response.data
  },

  // Validate import
  async validateImport(data) {
    const response = await api.post('/data/import/validate', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Import data
  async importData(data) {
    const response = await api.post('/data/import', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Get import history
  async getImportHistory(params = {}) {
    const response = await api.get('/data/import/history', { params })
    return response.data
  }
}
