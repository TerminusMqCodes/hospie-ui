import { api } from 'boot/axios'
import { Notify } from 'quasar'

class SupportService {
  constructor() {
    this.baseUrl = '/support' // Eltávolítjuk a /api prefix-et, mert az axios-ban már be van állítva
  }

  // Ticket Management
  async getTickets(params = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/tickets`, { params })
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch support tickets', error)
      throw error
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await api.get(`${this.baseUrl}/tickets/${ticketId}`)
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch ticket details', error)
      throw error
    }
  }

  async createTicket(ticketData) {
    try {
      const response = await api.post(`${this.baseUrl}/tickets`, ticketData)
      Notify.create({
        type: 'positive',
        message: 'Support ticket created successfully',
        position: 'top-right'
      })
      return response.data
    } catch (error) {
      this.handleError('Failed to create support ticket', error)
      throw error
    }
  }

  async updateTicket(ticketId, updateData) {
    try {
      const response = await api.put(`${this.baseUrl}/tickets/${ticketId}`, updateData)
      Notify.create({
        type: 'positive',
        message: 'Ticket updated successfully',
        position: 'top-right'
      })
      return response.data
    } catch (error) {
      this.handleError('Failed to update ticket', error)
      throw error
    }
  }

  // Messages
  async addMessage(ticketId, messageData) {
    try {
      const response = await api.post(`${this.baseUrl}/tickets/${ticketId}/messages`, messageData)
      return response.data
    } catch (error) {
      this.handleError('Failed to add message', error)
      throw error
    }
  }

  // Attachments
  async addAttachment(ticketId, file, description = '') {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description)

      const response = await api.post(
        `${this.baseUrl}/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      Notify.create({
        type: 'positive',
        message: 'File attached successfully',
        position: 'top-right'
      })
      
      return response.data
    } catch (error) {
      this.handleError('Failed to attach file', error)
      throw error
    }
  }

  // FAQ
  async getFaqContent(category = null, language = 'en') {
    try {
      const params = { category, language }
      const response = await api.get(`${this.baseUrl}/faq`, { params })
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch FAQ content', error)
      throw error
    }
  }

  async searchFaq(query, category = null, language = 'en') {
    try {
      const params = { q: query, category, language }
      const response = await api.get(`${this.baseUrl}/faq/search`, { params })
      return response.data
    } catch (error) {
      this.handleError('Failed to search FAQ', error)
      throw error
    }
  }

  // Live Chat
  async initializeLiveChat(chatData) {
    try {
      const response = await api.post(`${this.baseUrl}/live-chat/init`, chatData)
      return response.data
    } catch (error) {
      this.handleError('Failed to initialize live chat', error)
      throw error
    }
  }

  // Metrics and Analytics
  async getMetrics(period = 'month', category = null) {
    try {
      const params = { period, category }
      const response = await api.get(`${this.baseUrl}/metrics`, { params })
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch support metrics', error)
      throw error
    }
  }

  async getStatistics() {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch support statistics', error)
      throw error
    }
  }

  // SaaS-specific endpoints
  async getSaasAnalytics(period = 'month') {
    try {
      const params = { period }
      const response = await api.get(`${this.baseUrl}/analytics/saas`, { params })
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch SaaS analytics', error)
      throw error
    }
  }

  async getTenantDashboard() {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard/tenant`)
      return response.data
    } catch (error) {
      this.handleError('Failed to fetch tenant dashboard', error)
      throw error
    }
  }

  // System tickets (for automatic error reporting)
  async createSystemTicket(errorData) {
    try {
      const response = await api.post(`${this.baseUrl}/tickets/system`, errorData)
      return response.data
    } catch (error) {
      console.error('Failed to create system ticket:', error)
      // Don't show user notification for system tickets
      throw error
    }
  }

  // Utility methods
  getTicketStatusColor(status) {
    const statusColors = {
      'open': 'orange',
      'in_progress': 'blue',
      'pending_customer': 'amber',
      'resolved': 'green',
      'closed': 'grey'
    }
    return statusColors[status] || 'grey'
  }

  getTicketStatusIcon(status) {
    const statusIcons = {
      'open': 'mdi-ticket',
      'in_progress': 'mdi-progress-clock',
      'pending_customer': 'mdi-account-clock',
      'resolved': 'mdi-check-circle',
      'closed': 'mdi-archive'
    }
    return statusIcons[status] || 'mdi-help-circle'
  }

  getPriorityColor(priority) {
    const priorityColors = {
      'low': 'green',
      'normal': 'blue',
      'high': 'orange',
      'critical': 'red'
    }
    return priorityColors[priority] || 'blue'
  }

  getPriorityIcon(priority) {
    const priorityIcons = {
      'low': 'mdi-arrow-down',
      'normal': 'mdi-minus',
      'high': 'mdi-arrow-up',
      'critical': 'mdi-alert'
    }
    return priorityIcons[priority] || 'mdi-minus'
  }

  formatTicketNumber(ticketNumber) {
    return `#${ticketNumber}`
  }

  handleError(message, error) {
    console.error(message, error)
    
    let errorMessage = message
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top-right',
      timeout: 5000
    })
  }
}

export default new SupportService()