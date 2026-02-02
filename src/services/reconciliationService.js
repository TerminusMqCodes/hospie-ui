import api from 'boot/axios'

export default {
  // Reconcile payments
  async reconcilePayments(data) {
    const response = await api.post('/reconciliation/payments', data)
    return response.data
  },

  // Reconcile payouts
  async reconcilePayouts(data) {
    const response = await api.post('/reconciliation/payouts', data)
    return response.data
  },

  // Generate report
  async generateReport(data) {
    const response = await api.post('/reconciliation/report', data)
    return response.data
  },

  // Auto fix discrepancies
  async autoFix(data) {
    const response = await api.post('/reconciliation/auto-fix', data)
    return response.data
  },

  // Get dashboard
  async getDashboard(params = {}) {
    const response = await api.get('/reconciliation/dashboard', { params })
    return response.data
  },

  // Get history
  async getHistory(params = {}) {
    const response = await api.get('/reconciliation/history', { params })
    return response.data
  }
}
