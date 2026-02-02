import { api } from 'boot/axios'

class SpaService {
  // Appointments
  async getAppointments(params = {}) {
    return await api.get('/spa/appointments', { params })
  }

  async getAppointment(id) {
    return await api.get(`/spa/appointments/${id}`)
  }

  async createAppointment(data) {
    return await api.post('/spa/appointments', data)
  }

  async updateAppointment(id, data) {
    return await api.put(`/spa/appointments/${id}`, data)
  }

  async cancelAppointment(id) {
    return await api.post(`/spa/appointments/${id}/cancel`)
  }

  async confirmAppointment(id) {
    return await api.post(`/spa/appointments/${id}/confirm`)
  }

  async checkInAppointment(id) {
    return await api.post(`/spa/appointments/${id}/check-in`)
  }

  async completeAppointment(id, data = {}) {
    return await api.post(`/spa/appointments/${id}/complete`, data)
  }

  async rescheduleAppointment(id, data) {
    return await api.post(`/spa/appointments/${id}/reschedule`, data)
  }

  // Services
  async getServices(params = {}) {
    return await api.get('/spa/services', { params })
  }

  async getService(id) {
    return await api.get(`/spa/services/${id}`)
  }

  async createService(data) {
    return await api.post('/spa/services', data)
  }

  async updateService(id, data) {
    return await api.put(`/spa/services/${id}`, data)
  }

  async deleteService(id) {
    return await api.delete(`/spa/services/${id}`)
  }

  // Therapists
  async getTherapists(params = {}) {
    return await api.get('/spa/therapists', { params })
  }

  async getTherapist(id) {
    return await api.get(`/spa/therapists/${id}`)
  }

  async createTherapist(data) {
    return await api.post('/spa/therapists', data)
  }

  async updateTherapist(id, data) {
    return await api.put(`/spa/therapists/${id}`, data)
  }

  async deleteTherapist(id) {
    return await api.delete(`/spa/therapists/${id}`)
  }

  // Rooms
  async getRooms(params = {}) {
    return await api.get('/spa/rooms', { params })
  }

  async getRoom(id) {
    return await api.get(`/spa/rooms/${id}`)
  }

  async createRoom(data) {
    return await api.post('/spa/rooms', data)
  }

  async updateRoom(id, data) {
    return await api.put(`/spa/rooms/${id}`, data)
  }

  async deleteRoom(id) {
    return await api.delete(`/spa/rooms/${id}`)
  }

  // Packages
  async getPackages(params = {}) {
    return await api.get('/spa/packages', { params })
  }

  async getPackage(id) {
    return await api.get(`/spa/packages/${id}`)
  }

  async createPackage(data) {
    return await api.post('/spa/packages', data)
  }

  async updatePackage(id, data) {
    return await api.put(`/spa/packages/${id}`, data)
  }

  async deletePackage(id) {
    return await api.delete(`/spa/packages/${id}`)
  }

  // Availability
  async getAvailableSlots(params) {
    return await api.get('/spa/available-slots', { params })
  }

  async checkSlotAvailability(data) {
    return await api.post('/spa/check-slot-availability', data)
  }

  async getAlternativeSlots(params) {
    return await api.get('/spa/alternative-slots', { params })
  }

  async getAvailabilitySummary(params = {}) {
    return await api.get('/spa/availability-summary', { params })
  }

  // Scheduling
  async getSchedules(params = {}) {
    return await api.get('/spa/scheduling/schedules', { params })
  }

  async createSchedule(data) {
    return await api.post('/spa/scheduling/schedules', data)
  }

  async updateSchedule(id, data) {
    return await api.put(`/spa/scheduling/schedules/${id}`, data)
  }

  async deleteSchedule(id) {
    return await api.delete(`/spa/scheduling/schedules/${id}`)
  }

  async blockAvailability(data) {
    return await api.post('/spa/scheduling/block-availability', data)
  }

  async getWorkloadBalance(params = {}) {
    return await api.get('/spa/scheduling/workload-balance', { params })
  }

  async autoAssignTherapist(data) {
    return await api.post('/spa/scheduling/auto-assign-therapist', data)
  }

  // Inventory
  async getInventory(params = {}) {
    return await api.get('/spa/inventory', { params })
  }

  async getInventoryItem(id) {
    return await api.get(`/spa/inventory/${id}`)
  }

  async createInventoryItem(data) {
    return await api.post('/spa/inventory', data)
  }

  async updateInventoryItem(id, data) {
    return await api.put(`/spa/inventory/${id}`, data)
  }

  async deleteInventoryItem(id) {
    return await api.delete(`/spa/inventory/${id}`)
  }

  async updateStock(id, data) {
    return await api.post(`/spa/inventory/${id}/update-stock`, data)
  }

  async getStockAlerts() {
    return await api.get('/spa/inventory/stock-alerts')
  }

  async reorderItem(id, data) {
    return await api.post(`/spa/inventory/${id}/reorder`, data)
  }

  // Analytics & Stats
  async getStats(params = {}) {
    return await api.get('/spa/stats', { params })
  }

  async getRevenue(params = {}) {
    return await api.get('/spa/analytics/revenue', { params })
  }

  async getUtilization(params = {}) {
    return await api.get('/spa/analytics/utilization', { params })
  }

  async getTherapistPerformance(params = {}) {
    return await api.get('/spa/analytics/therapist-performance', { params })
  }

  async getServicePopularity(params = {}) {
    return await api.get('/spa/analytics/service-popularity', { params })
  }

  // Reports
  async generateReport(type, params = {}) {
    return await api.get(`/spa/reports/${type}`, { params })
  }

  async exportReport(type, format, params = {}) {
    return await api.get(`/spa/reports/${type}/export`, {
      params: { ...params, format },
      responseType: 'blob'
    })
  }
}

export default new SpaService()