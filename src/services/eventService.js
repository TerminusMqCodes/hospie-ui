import { api } from '../boot/axios'

export const eventService = {
  // Events
  async getEvents() {
    return api.get('/events')
  },

  async getEvent(id) {
    return api.get(`/api/events/${id}`)
  },

  async createEvent(eventData) {
    return api.post('/events', eventData)
  },

  async updateEvent(id, eventData) {
    return api.put(`/api/events/${id}`, eventData)
  },

  async deleteEvent(id) {
    return api.delete(`/api/events/${id}`)
  },

  // Event Types
  async getEventTypes() {
    return api.get('/event-types')
  },

  async createEventType(typeData) {
    return api.post('/event-types', typeData)
  },

  // Event Spaces
  async getEventSpaces() {
    return api.get('/event-spaces')
  },

  async getEventSpace(id) {
    return api.get(`/api/event-spaces/${id}`)
  },

  async createEventSpace(spaceData) {
    return api.post('/event-spaces', spaceData)
  },

  async updateEventSpace(id, spaceData) {
    return api.put(`/api/event-spaces/${id}`, spaceData)
  },

  async deleteEventSpace(id) {
    return api.delete(`/api/event-spaces/${id}`)
  },

  // Event Space Bookings
  async getEventSpaceBookings() {
    return api.get('/event-space-bookings')
  },

  async createEventSpaceBooking(bookingData) {
    return api.post('/event-space-bookings', bookingData)
  },

  async updateEventSpaceBooking(id, bookingData) {
    return api.put(`/api/event-space-bookings/${id}`, bookingData)
  },

  async deleteEventSpaceBooking(id) {
    return api.delete(`/api/event-space-bookings/${id}`)
  },

  // Event Equipment
  async getEventEquipment() {
    return api.get('/event-equipment')
  },

  async createEventEquipment(equipmentData) {
    return api.post('/event-equipment', equipmentData)
  },

  async updateEventEquipment(id, equipmentData) {
    return api.put(`/api/event-equipment/${id}`, equipmentData)
  },

  async deleteEventEquipment(id) {
    return api.delete(`/api/event-equipment/${id}`)
  },

  // Event Equipment Bookings
  async getEventEquipmentBookings() {
    return api.get('/event-equipment-bookings')
  },

  async createEventEquipmentBooking(bookingData) {
    return api.post('/event-equipment-bookings', bookingData)
  },

  // Event Staff Assignments
  async getEventStaffAssignments() {
    return api.get('/event-staff-assignments')
  },

  async createEventStaffAssignment(assignmentData) {
    return api.post('/event-staff-assignments', assignmentData)
  },

  async updateEventStaffAssignment(id, assignmentData) {
    return api.put(`/api/event-staff-assignments/${id}`, assignmentData)
  },

  async deleteEventStaffAssignment(id) {
    return api.delete(`/api/event-staff-assignments/${id}`)
  },

  // Event Catering
  async getCateringServices() {
    return api.get('/event-catering')
  },

  async createCateringService(cateringData) {
    return api.post('/event-catering', cateringData)
  },

  async updateCateringService(id, cateringData) {
    return api.put(`/api/event-catering/${id}`, cateringData)
  },

  async deleteCateringService(id) {
    return api.delete(`/api/event-catering/${id}`)
  },

  // Event Timeline
  async getEventTimeline(eventId) {
    return api.get(`/api/events/${eventId}/timeline`)
  },

  async createEventTimelineItem(eventId, timelineData) {
    return api.post(`/api/events/${eventId}/timeline`, timelineData)
  },

  async updateEventTimelineItem(eventId, timelineId, timelineData) {
    return api.put(`/api/events/${eventId}/timeline/${timelineId}`, timelineData)
  },

  async deleteEventTimelineItem(eventId, timelineId) {
    return api.delete(`/api/events/${eventId}/timeline/${timelineId}`)
  },

  // Event Contracts
  async getEventContracts() {
    return api.get('/event-contracts')
  },

  async createEventContract(contractData) {
    return api.post('/event-contracts', contractData)
  },

  async updateEventContract(id, contractData) {
    return api.put(`/api/event-contracts/${id}`, contractData)
  },

  async deleteEventContract(id) {
    return api.delete(`/api/event-contracts/${id}`)
  },

  // Event Invoices
  async getEventInvoices() {
    return api.get('/event-invoices')
  },

  async createEventInvoice(invoiceData) {
    return api.post('/event-invoices', invoiceData)
  },

  async updateEventInvoice(id, invoiceData) {
    return api.put(`/api/event-invoices/${id}`, invoiceData)
  },

  async deleteEventInvoice(id) {
    return api.delete(`/api/event-invoices/${id}`)
  },

  // Event Coordination
  async getEventCoordination(eventId) {
    return api.get(`/api/events/${eventId}/coordination`)
  },

  async updateEventCoordination(eventId, coordinationData) {
    return api.put(`/api/events/${eventId}/coordination`, coordinationData)
  },

  // Event Billing
  async getEventBilling(eventId) {
    return api.get(`/api/events/${eventId}/billing`)
  },

  async updateEventBilling(eventId, billingData) {
    return api.put(`/api/events/${eventId}/billing`, billingData)
  },

  // Event Availability
  async checkEventAvailability(spaceId, startDate, endDate) {
    return api.get('/event-availability', {
      params: {
        space_id: spaceId,
        start_date: startDate,
        end_date: endDate
      }
    })
  }
}
