import { api } from '../boot/axios'

export const sustainabilityService = {
  // Sustainability Metrics
  async getSustainabilityMetrics() {
    return api.get('/api/sustainability-metrics')
  },

  async createSustainabilityMetric(metricData) {
    return api.post('/api/sustainability-metrics', metricData)
  },

  async updateSustainabilityMetric(id, metricData) {
    return api.put(`/api/sustainability-metrics/${id}`, metricData)
  },

  async deleteSustainabilityMetric(id) {
    return api.delete(`/api/sustainability-metrics/${id}`)
  },

  // Carbon Footprint
  async getCarbonFootprints() {
    return api.get('/api/carbon-footprints')
  },

  async getCarbonFootprint(id) {
    return api.get(`/api/carbon-footprints/${id}`)
  },

  async createCarbonFootprint(footprintData) {
    return api.post('/api/carbon-footprints', footprintData)
  },

  async updateCarbonFootprint(id, footprintData) {
    return api.put(`/api/carbon-footprints/${id}`, footprintData)
  },

  async deleteCarbonFootprint(id) {
    return api.delete(`/api/carbon-footprints/${id}`)
  },

  // Energy Consumption
  async getEnergyConsumptions() {
    return api.get('/api/energy-consumptions')
  },

  async getEnergyConsumption(id) {
    return api.get(`/api/energy-consumptions/${id}`)
  },

  async createEnergyConsumption(consumptionData) {
    return api.post('/api/energy-consumptions', consumptionData)
  },

  async updateEnergyConsumption(id, consumptionData) {
    return api.put(`/api/energy-consumptions/${id}`, consumptionData)
  },

  async deleteEnergyConsumption(id) {
    return api.delete(`/api/energy-consumptions/${id}`)
  },

  // Water Usage
  async getWaterUsages() {
    return api.get('/api/water-usages')
  },

  async getWaterUsage(id) {
    return api.get(`/api/water-usages/${id}`)
  },

  async createWaterUsage(usageData) {
    return api.post('/api/water-usages', usageData)
  },

  async updateWaterUsage(id, usageData) {
    return api.put(`/api/water-usages/${id}`, usageData)
  },

  async deleteWaterUsage(id) {
    return api.delete(`/api/water-usages/${id}`)
  },

  // Waste Tracking
  async getWasteTrackings() {
    return api.get('/api/waste-trackings')
  },

  async getWasteTracking(id) {
    return api.get(`/api/waste-trackings/${id}`)
  },

  async createWasteTracking(wasteData) {
    return api.post('/api/waste-trackings', wasteData)
  },

  async updateWasteTracking(id, wasteData) {
    return api.put(`/api/waste-trackings/${id}`, wasteData)
  },

  async deleteWasteTracking(id) {
    return api.delete(`/api/waste-trackings/${id}`)
  },

  // Sustainability Goals
  async getSustainabilityGoals() {
    return api.get('/api/sustainability-goals')
  },

  async getSustainabilityGoal(id) {
    return api.get(`/api/sustainability-goals/${id}`)
  },

  async createSustainabilityGoal(goalData) {
    return api.post('/api/sustainability-goals', goalData)
  },

  async updateSustainabilityGoal(id, goalData) {
    return api.put(`/api/sustainability-goals/${id}`, goalData)
  },

  async deleteSustainabilityGoal(id) {
    return api.delete(`/api/sustainability-goals/${id}`)
  },

  // ESG Reports
  async getESGReports() {
    return api.get('/api/esg-reports')
  },

  async getESGReport(id) {
    return api.get(`/api/esg-reports/${id}`)
  },

  async generateESGReport(reportData = {}) {
    return api.post('/api/esg-reports/generate', reportData)
  },

  async updateESGReport(id, reportData) {
    return api.put(`/api/esg-reports/${id}`, reportData)
  },

  async deleteESGReport(id) {
    return api.delete(`/api/esg-reports/${id}`)
  },

  async downloadESGReport(id) {
    return api.get(`/api/esg-reports/${id}/download`, {
      responseType: 'blob'
    })
  },

  // Carbon Offsets
  async getCarbonOffsets() {
    return api.get('/api/carbon-offsets')
  },

  async createCarbonOffset(offsetData) {
    return api.post('/api/carbon-offsets', offsetData)
  },

  async updateCarbonOffset(id, offsetData) {
    return api.put(`/api/carbon-offsets/${id}`, offsetData)
  },

  async deleteCarbonOffset(id) {
    return api.delete(`/api/carbon-offsets/${id}`)
  },

  // Energy Efficiency Recommendations
  async getEnergyRecommendations() {
    return api.get('/api/energy-efficiency-recommendations')
  },

  async createEnergyRecommendation(recommendationData) {
    return api.post('/api/energy-efficiency-recommendations', recommendationData)
  },

  async updateEnergyRecommendation(id, recommendationData) {
    return api.put(`/api/energy-efficiency-recommendations/${id}`, recommendationData)
  },

  async deleteEnergyRecommendation(id) {
    return api.delete(`/api/energy-efficiency-recommendations/${id}`)
  },

  // Water Quality Metrics
  async getWaterQualityMetrics() {
    return api.get('/api/water-quality-metrics')
  },

  async createWaterQualityMetric(metricData) {
    return api.post('/api/water-quality-metrics', metricData)
  },

  async updateWaterQualityMetric(id, metricData) {
    return api.put(`/api/water-quality-metrics/${id}`, metricData)
  },

  async deleteWaterQualityMetric(id) {
    return api.delete(`/api/water-quality-metrics/${id}`)
  },

  // Analytics and Reporting
  async getSustainabilityAnalytics(params = {}) {
    return api.get('/api/sustainability/analytics', { params })
  },

  async getCarbonFootprintAnalytics(params = {}) {
    return api.get('/api/carbon-footprint/analytics', { params })
  },

  async getEnergyAnalytics(params = {}) {
    return api.get('/api/energy-monitoring/analytics', { params })
  },

  async getWaterAnalytics(params = {}) {
    return api.get('/api/water-analytics', { params })
  },

  // Dashboard Data
  async getSustainabilityDashboard() {
    return api.get('/api/sustainability/dashboard')
  },

  async getSustainabilityScore() {
    return api.get('/api/sustainability/score')
  },

  async getSustainabilityTrends(period = 'month') {
    return api.get('/api/sustainability/trends', {
      params: { period }
    })
  },

  // Benchmarking
  async getSustainabilityBenchmarks() {
    return api.get('/api/sustainability/benchmarks')
  },

  async compareSustainabilityMetrics(comparisonData) {
    return api.post('/api/sustainability/compare', comparisonData)
  },

  // Alerts and Notifications
  async getSustainabilityAlerts() {
    return api.get('/api/sustainability/alerts')
  },

  async createSustainabilityAlert(alertData) {
    return api.post('/api/sustainability/alerts', alertData)
  },

  async updateSustainabilityAlert(id, alertData) {
    return api.put(`/api/sustainability/alerts/${id}`, alertData)
  },

  async deleteSustainabilityAlert(id) {
    return api.delete(`/api/sustainability/alerts/${id}`)
  }
}