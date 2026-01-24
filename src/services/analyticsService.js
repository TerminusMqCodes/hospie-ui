import { api } from 'boot/axios'

class AnalyticsService {
  /**
   * Get dashboard overview data
   */
  async getDashboardOverview() {
    try {
      const response = await api.get('/reports/dashboard')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error)
      throw error
    }
  }

  /**
   * Get occupancy report
   */
  async getOccupancyReport(startDate, endDate, groupBy = 'day') {
    try {
      const response = await api.get('/reports/occupancy', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch occupancy report:', error)
      throw error
    }
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(startDate, endDate, groupBy = 'day', currency = 'USD') {
    try {
      const response = await api.get('/reports/revenue', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy,
          currency: currency
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch revenue report:', error)
      throw error
    }
  }

  /**
   * Get reservation analytics
   */
  async getReservationReport(startDate, endDate, groupBy = 'day') {
    try {
      const response = await api.get('/reports/reservations', {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch reservation report:', error)
      throw error
    }
  }

  /**
   * Get guest analytics
   */
  async getGuestAnalytics(startDate = null, endDate = null, groupBy = 'tier') {
    try {
      const params = { group_by: groupBy }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await api.get('/reports/guests', { params })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch guest analytics:', error)
      throw error
    }
  }

  /**
   * Get room performance report
   */
  async getRoomPerformanceReport(startDate, endDate, roomTypeId = null) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      }
      if (roomTypeId) params.room_type_id = roomTypeId

      const response = await api.get('/reports/room-performance', { params })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch room performance report:', error)
      throw error
    }
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(startDate, endDate, currency = 'USD') {
    try {
      const response = await api.get('/reports/financial-summary', {
        params: {
          start_date: startDate,
          end_date: endDate,
          currency: currency
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch financial summary:', error)
      throw error
    }
  }

  /**
   * Get booking source analysis
   */
  async getBookingSourceAnalysis(startDate, endDate) {
    try {
      const response = await api.get('/reports/booking-sources', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch booking source analysis:', error)
      throw error
    }
  }

  /**
   * Get daily operations report
   */
  async getDailyOperationsReport(date = null) {
    try {
      const params = {}
      if (date) params.date = date

      const response = await api.get('/reports/daily-operations', { params })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch daily operations report:', error)
      throw error
    }
  }
}

export default new AnalyticsService()
export { AnalyticsService }
export const analyticsService = new AnalyticsService()