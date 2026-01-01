import { describe, it, expect, vi, beforeEach } from 'vitest'
import analyticsService from '../analyticsService'
import { api } from 'boot/axios'

// Mock the axios api
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn()
  }
}))

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardOverview', () => {
    it('should fetch dashboard overview data', async () => {
      const mockData = {
        data: {
          data: {
            today: {
              arrivals: 5,
              departures: 3,
              in_house: 12,
              revenue: 1500,
              occupancy_rate: 75
            }
          }
        }
      }

      api.get.mockResolvedValue(mockData)

      const result = await analyticsService.getDashboardOverview()

      expect(api.get).toHaveBeenCalledWith('/reports/dashboard')
      expect(result).toEqual(mockData.data.data)
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')
      api.get.mockRejectedValue(error)

      await expect(analyticsService.getDashboardOverview()).rejects.toThrow('API Error')
    })
  })

  describe('getRevenueReport', () => {
    it('should fetch revenue report with correct parameters', async () => {
      const mockData = {
        data: {
          data: {
            summary: { total_revenue: 5000 },
            data: []
          }
        }
      }

      api.get.mockResolvedValue(mockData)

      const result = await analyticsService.getRevenueReport('2024-01-01', '2024-01-31', 'day', 'USD')

      expect(api.get).toHaveBeenCalledWith('/reports/revenue', {
        params: {
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          group_by: 'day',
          currency: 'USD'
        }
      })
      expect(result).toEqual(mockData.data.data)
    })
  })

  describe('getOccupancyReport', () => {
    it('should fetch occupancy report with default groupBy', async () => {
      const mockData = {
        data: {
          data: {
            summary: { average_occupancy: 80 },
            data: []
          }
        }
      }

      api.get.mockResolvedValue(mockData)

      const result = await analyticsService.getOccupancyReport('2024-01-01', '2024-01-31')

      expect(api.get).toHaveBeenCalledWith('/reports/occupancy', {
        params: {
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          group_by: 'day'
        }
      })
      expect(result).toEqual(mockData.data.data)
    })
  })
})