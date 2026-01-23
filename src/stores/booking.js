import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    reservations: [],
    currentReservation: null,
    roomTypes: [],
    bookingSummary: null,
    availabilityData: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      booking_source: '',
      start_date: '',
      end_date: '',
      room_type: ''
    },
    pagination: {
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0
    }
  }),

  getters: {
    // Filter reservations by status
    reservationsByStatus: (state) => (status) => {
      return state.reservations.filter(r => r.status === status)
    },

    // Get today's arrivals
    todaysArrivals: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.reservations.filter(r => 
        r.check_in_date === today && r.status === 'confirmed'
      )
    },

    // Get today's departures
    todaysDepartures: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.reservations.filter(r => 
        r.check_out_date === today && r.status === 'checked_in'
      )
    },

    // Get current in-house guests
    currentStays: (state) => {
      return state.reservations.filter(r => r.status === 'checked_in')
    },

    // Check if booking form is valid
    isBookingFormValid: (state) => {
      if (!state.bookingSummary) return false
      const summary = state.bookingSummary
      return summary.booking_details && 
             summary.rate_calculation && 
             summary.availability && 
             summary.availability.is_available
    }
  },

  actions: {
    // Fetch reservations with filters
    async fetchReservations(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: this.pagination.page,
          per_page: this.pagination.rowsPerPage
        }

        const response = await api.get('/reservations', { params: queryParams })
        
        if (response.data.success) {
          this.reservations = response.data.data
          this.pagination.rowsNumber = response.data.pagination.total
          this.pagination.page = response.data.pagination.current_page
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch reservations'
        console.error('Error fetching reservations:', error)
      } finally {
        this.loading = false
      }
    },

    // Get booking summary
    async getBookingSummary(bookingData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/bookings/summary', bookingData)
        
        if (response.data.success) {
          this.bookingSummary = response.data.data
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get booking summary'
        console.error('Error getting booking summary:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create booking
    async createBooking(bookingData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/bookings', bookingData)
        
        if (response.data.success) {
          // Add to reservations list
          this.reservations.unshift(response.data.data.reservation)
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create booking'
        console.error('Error creating booking:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Check availability
    async checkAvailability(checkInDate, checkOutDate, roomType = null) {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          check_in_date: checkInDate,
          check_out_date: checkOutDate
        }
        
        if (roomType) {
          params.room_type = roomType
        }

        const response = await api.get('/reservations/check-availability', { params })
        
        if (response.data.success) {
          this.availabilityData = response.data.data
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check availability'
        console.error('Error checking availability:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Calculate rates
    async calculateRates(rateData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/reservations/calculate-rates', { params: rateData })
        
        if (response.data.success) {
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to calculate rates'
        console.error('Error calculating rates:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch room types
    async fetchRoomTypes() {
      try {
        const response = await api.get('/rooms/room-types')
        
        if (response.data.success) {
          this.roomTypes = response.data.data
          return response.data.data
        }
      } catch (error) {
        console.error('Error fetching room types:', error)
        throw error
      }
    },

    // Check in guest
    async checkInGuest(reservationId, checkInData = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post(`/bookings/${reservationId}/check-in`, checkInData)
        
        if (response.data.success) {
          // Update reservation in list
          const index = this.reservations.findIndex(r => r.id === reservationId)
          if (index !== -1) {
            this.reservations[index] = response.data.data.reservation
          }
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check in guest'
        console.error('Error checking in guest:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Check out guest
    async checkOutGuest(reservationId, checkOutData = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post(`/bookings/${reservationId}/check-out`, checkOutData)
        
        if (response.data.success) {
          // Update reservation in list
          const index = this.reservations.findIndex(r => r.id === reservationId)
          if (index !== -1) {
            this.reservations[index] = response.data.data.reservation
          }
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check out guest'
        console.error('Error checking out guest:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cancel booking
    async cancelBooking(reservationId, cancellationData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post(`/bookings/${reservationId}/cancel`, cancellationData)
        
        if (response.data.success) {
          // Update reservation in list
          const index = this.reservations.findIndex(r => r.id === reservationId)
          if (index !== -1) {
            this.reservations[index] = response.data.data.reservation
          }
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to cancel booking'
        console.error('Error cancelling booking:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get availability calendar
    async fetchAvailabilityCalendar(month, roomType = null) {
      this.loading = true
      this.error = null
      
      try {
        const params = { month }
        if (roomType) {
          params.room_type = roomType
        }

        const response = await api.get('/reservations/availability-calendar', { params })
        
        if (response.data.success) {
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch availability calendar'
        console.error('Error fetching availability calendar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get calendar reservations for a specific date range
    async fetchCalendarReservations(startDate, endDate, roomType = null) {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          start_date: startDate,
          end_date: endDate
        }
        
        if (roomType) {
          params.room_type = roomType
        }

        const response = await api.get('/reservations', { params })
        
        if (response.data.success) {
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch calendar reservations'
        console.error('Error fetching calendar reservations:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchReservationStatistics(startDate = null, endDate = null) {
      try {
        const params = {}
        if (startDate) params.start_date = startDate
        if (endDate) params.end_date = endDate

        const response = await api.get('/reservations/statistics', { params })
        
        if (response.data.success) {
          return response.data.data
        }
      } catch (error) {
        console.error('Error fetching reservation statistics:', error)
        throw error
      }
    },

    // Update filters
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    // Clear filters
    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        booking_source: '',
        start_date: '',
        end_date: '',
        room_type: ''
      }
    },

    // Set current reservation
    setCurrentReservation(reservation) {
      this.currentReservation = reservation
    },

    // Clear current reservation
    clearCurrentReservation() {
      this.currentReservation = null
    },

    // Clear booking summary
    clearBookingSummary() {
      this.bookingSummary = null
    }
  }
})