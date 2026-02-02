import api from 'boot/axios'

export default {
  // Get all templates
  async getTemplates(params = {}) {
    const response = await api.get('/custom-reports/templates', { params })
    return response.data
  },

  // Get single template
  async getTemplate(id) {
    const response = await api.get(`/custom-reports/templates/${id}`)
    return response.data
  },

  // Create template
  async createTemplate(data) {
    const response = await api.post('/custom-reports/templates', data)
    return response.data
  },

  // Update template
  async updateTemplate(id, data) {
    const response = await api.put(`/custom-reports/templates/${id}`, data)
    return response.data
  },

  // Delete template
  async deleteTemplate(id) {
    const response = await api.delete(`/custom-reports/templates/${id}`)
    return response.data
  },

  // Generate report
  async generateReport(templateId, data) {
    const response = await api.post(`/custom-reports/templates/${templateId}/generate`, data)
    return response.data
  },

  // Preview report
  async previewReport(templateId, data) {
    const response = await api.post(`/custom-reports/templates/${templateId}/preview`, data)
    return response.data
  },

  // Schedule report
  async scheduleReport(templateId, data) {
    const response = await api.post(`/custom-reports/templates/${templateId}/schedule`, data)
    return response.data
  },

  // Get scheduled reports
  async getScheduledReports(params = {}) {
    const response = await api.get('/custom-reports/scheduled', { params })
    return response.data
  }
}
