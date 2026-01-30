import { defineStore } from 'pinia'
import supportService from 'src/services/supportService'

export const useSupportStore = defineStore('support', {
  state: () => ({
    // Tickets
    tickets: [],
    currentTicket: null,
    ticketsLoading: false,
    ticketLoading: false,
    
    // FAQ
    faqEntries: [],
    faqLoading: false,
    faqSearchResults: [],
    
    // Metrics
    metrics: null,
    statistics: null,
    saasAnalytics: null,
    tenantDashboard: null,
    metricsLoading: false,
    
    // Live Chat
    liveChatSession: null,
    liveChatActive: false,
    
    // Filters and pagination
    filters: {
      status: null,
      priority: null,
      category: null,
      search: ''
    },
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    }
  }),

  getters: {
    // Ticket getters
    openTickets: (state) => state.tickets.filter(ticket => ticket.status === 'open'),
    inProgressTickets: (state) => state.tickets.filter(ticket => ticket.status === 'in_progress'),
    resolvedTickets: (state) => state.tickets.filter(ticket => ticket.status === 'resolved'),
    
    // Priority getters
    criticalTickets: (state) => state.tickets.filter(ticket => ticket.priority === 'critical'),
    highPriorityTickets: (state) => state.tickets.filter(ticket => ticket.priority === 'high'),
    
    // Statistics getters
    totalTickets: (state) => state.tickets.length,
    averageResponseTime: (state) => state.statistics?.response_times?.average_first_response || 0,
    slaCompliance: (state) => {
      if (!state.statistics?.sla_performance) return 0
      const { breach_rate } = state.statistics.sla_performance
      return 100 - (breach_rate || 0)
    },
    
    // FAQ getters
    faqByCategory: (state) => {
      const grouped = {}
      state.faqEntries.forEach(faq => {
        if (!grouped[faq.category]) {
          grouped[faq.category] = []
        }
        grouped[faq.category].push(faq)
      })
      return grouped
    }
  },

  actions: {
    // Ticket actions
    async fetchTickets(params = {}) {
      this.ticketsLoading = true
      try {
        const response = await supportService.getTickets({
          ...params,
          ...this.filters,
          page: this.pagination.page,
          per_page: this.pagination.rowsPerPage
        })
        
        this.tickets = response.data || []
        this.pagination.rowsNumber = response.total || 0
        
        return response
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
        throw error
      } finally {
        this.ticketsLoading = false
      }
    },

    async fetchTicket(ticketId) {
      this.ticketLoading = true
      try {
        const response = await supportService.getTicket(ticketId)
        this.currentTicket = response.data
        return response
      } catch (error) {
        console.error('Failed to fetch ticket:', error)
        throw error
      } finally {
        this.ticketLoading = false
      }
    },

    async createTicket(ticketData) {
      try {
        const response = await supportService.createTicket(ticketData)
        
        // Add to local tickets array
        if (response.data) {
          this.tickets.unshift(response.data)
        }
        
        return response
      } catch (error) {
        console.error('Failed to create ticket:', error)
        throw error
      }
    },

    async updateTicket(ticketId, updateData) {
      try {
        const response = await supportService.updateTicket(ticketId, updateData)
        
        // Update local ticket
        const index = this.tickets.findIndex(t => t.id === ticketId)
        if (index !== -1 && response.data) {
          this.tickets[index] = response.data
        }
        
        // Update current ticket if it's the same
        if (this.currentTicket?.id === ticketId && response.data) {
          this.currentTicket = response.data
        }
        
        return response
      } catch (error) {
        console.error('Failed to update ticket:', error)
        throw error
      }
    },

    async addMessage(ticketId, messageData) {
      try {
        const response = await supportService.addMessage(ticketId, messageData)
        
        // Update current ticket messages if it's loaded
        if (this.currentTicket?.id === ticketId && response.data) {
          if (!this.currentTicket.messages) {
            this.currentTicket.messages = []
          }
          this.currentTicket.messages.push(response.data)
        }
        
        return response
      } catch (error) {
        console.error('Failed to add message:', error)
        throw error
      }
    },

    async addAttachment(ticketId, file, description = '') {
      try {
        const response = await supportService.addAttachment(ticketId, file, description)
        
        // Update current ticket attachments if it's loaded
        if (this.currentTicket?.id === ticketId && response.data) {
          if (!this.currentTicket.attachments) {
            this.currentTicket.attachments = []
          }
          this.currentTicket.attachments.push(response.data)
        }
        
        return response
      } catch (error) {
        console.error('Failed to add attachment:', error)
        throw error
      }
    },

    // FAQ actions
    async fetchFaqContent(category = null, language = 'en') {
      this.faqLoading = true
      try {
        const response = await supportService.getFaqContent(category, language)
        this.faqEntries = response.data || []
        return response
      } catch (error) {
        console.error('Failed to fetch FAQ content:', error)
        throw error
      } finally {
        this.faqLoading = false
      }
    },

    async searchFaq(query, category = null, language = 'en') {
      this.faqLoading = true
      try {
        const response = await supportService.searchFaq(query, category, language)
        this.faqSearchResults = response.data || []
        return response
      } catch (error) {
        console.error('Failed to search FAQ:', error)
        throw error
      } finally {
        this.faqLoading = false
      }
    },

    // Live Chat actions
    async initializeLiveChat(chatData) {
      try {
        const response = await supportService.initializeLiveChat(chatData)
        this.liveChatSession = response.data
        this.liveChatActive = true
        return response
      } catch (error) {
        console.error('Failed to initialize live chat:', error)
        throw error
      }
    },

    closeLiveChat() {
      this.liveChatSession = null
      this.liveChatActive = false
    },

    // Metrics actions
    async fetchMetrics(period = 'month', category = null) {
      this.metricsLoading = true
      try {
        const response = await supportService.getMetrics(period, category)
        this.metrics = response.data
        return response
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        throw error
      } finally {
        this.metricsLoading = false
      }
    },

    async fetchStatistics() {
      try {
        const response = await supportService.getStatistics()
        this.statistics = response.data
        return response
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
        throw error
      }
    },

    async fetchSaasAnalytics(period = 'month') {
      this.metricsLoading = true
      try {
        const response = await supportService.getSaasAnalytics(period)
        this.saasAnalytics = response.data
        return response
      } catch (error) {
        console.error('Failed to fetch SaaS analytics:', error)
        throw error
      } finally {
        this.metricsLoading = false
      }
    },

    async fetchTenantDashboard() {
      try {
        const response = await supportService.getTenantDashboard()
        this.tenantDashboard = response.data
        return response
      } catch (error) {
        console.error('Failed to fetch tenant dashboard:', error)
        throw error
      }
    },

    // Filter and pagination actions
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1 // Reset to first page when filtering
    },

    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    clearFilters() {
      this.filters = {
        status: null,
        priority: null,
        category: null,
        search: ''
      }
      this.pagination.page = 1
    },

    // Utility actions
    clearCurrentTicket() {
      this.currentTicket = null
    },

    clearFaqResults() {
      this.faqSearchResults = []
    }
  }
})