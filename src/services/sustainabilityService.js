import { api } from '../boot/axios'

export const sustainabilityService = {
  // Sustainability Metrics
  async getSustainabilityMetrics() {
    return api.get('/sustainability-metrics')
  },

  async createSustainabilityMetric(metricData) {
    return api.post('/sustainability-metrics', metricData)
  },

  async updateSustainabilityMetric(id, metricData) {
    return api.put(`/sustainability-metrics/${id}`, metricData)
  },

  async deleteSustainabilityMetric(id) {
    return api.delete(`/sustainability-metrics/${id}`)
  },

  // Carbon Footprint
  async getCarbonFootprints() {
    return api.get('/carbon-footprints')
  },

  async getCarbonFootprint(id) {
    return api.get(`/carbon-footprints/${id}`)
  },

  async createCarbonFootprint(footprintData) {
    return api.post('/carbon-footprints', footprintData)
  },

  async updateCarbonFootprint(id, footprintData) {
    return api.put(`/carbon-footprints/${id}`, footprintData)
  },

  async deleteCarbonFootprint(id) {
    return api.delete(`/carbon-footprints/${id}`)
  },

  // Energy Consumption
  async getEnergyConsumptions() {
    return api.get('/energy-consumptions')
  },

  async getEnergyConsumption(id) {
    return api.get(`/energy-consumptions/${id}`)
  },

  async createEnergyConsumption(consumptionData) {
    return api.post('/energy-consumptions', consumptionData)
  },

  async updateEnergyConsumption(id, consumptionData) {
    return api.put(`/energy-consumptions/${id}`, consumptionData)
  },

  async deleteEnergyConsumption(id) {
    return api.delete(`/energy-consumptions/${id}`)
  },

  // Water Usage
  async getWaterUsages() {
    return api.get('/water-usages')
  },

  async getWaterUsage(id) {
    return api.get(`/water-usages/${id}`)
  },

  async createWaterUsage(usageData) {
    return api.post('/water-usages', usageData)
  },

  async updateWaterUsage(id, usageData) {
    return api.put(`/water-usages/${id}`, usageData)
  },

  async deleteWaterUsage(id) {
    return api.delete(`/water-usages/${id}`)
  },

  // Waste Tracking
  async getWasteTrackings() {
    return api.get('/waste-trackings')
  },

  async getWasteTracking(id) {
    return api.get(`/waste-trackings/${id}`)
  },

  async createWasteTracking(wasteData) {
    return api.post('/waste-trackings', wasteData)
  },

  async updateWasteTracking(id, wasteData) {
    return api.put(`/waste-trackings/${id}`, wasteData)
  },

  async deleteWasteTracking(id) {
    return api.delete(`/waste-trackings/${id}`)
  },

  // Sustainability Goals
  async getSustainabilityGoals() {
    return api.get('/sustainability-goals')
  },

  async getSustainabilityGoal(id) {
    return api.get(`/sustainability-goals/${id}`)
  },

  async createSustainabilityGoal(goalData) {
    return api.post('/sustainability-goals', goalData)
  },

  async updateSustainabilityGoal(id, goalData) {
    return api.put(`/sustainability-goals/${id}`, goalData)
  },

  async deleteSustainabilityGoal(id) {
    return api.delete(`/sustainability-goals/${id}`)
  },

  // ESG Reports
  async getESGReports() {
    return api.get('/esg-reports')
  },

  async getESGReport(id) {
    return api.get(`/esg-reports/${id}`)
  },

  async generateESGReport(reportData = {}) {
    return api.post('/esg-reports/generate', reportData)
  },

  async updateESGReport(id, reportData) {
    return api.put(`/esg-reports/${id}`, reportData)
  },

  async deleteESGReport(id) {
    return api.delete(`/esg-reports/${id}`)
  },

  async downloadESGReport(id) {
    return api.get(`/esg-reports/${id}/download`, {
      responseType: 'blob'
    })
  },

  // Carbon Offsets
  async getCarbonOffsets() {
    return api.get('/carbon-offsets')
  },

  async createCarbonOffset(offsetData) {
    return api.post('/carbon-offsets', offsetData)
  },

  async updateCarbonOffset(id, offsetData) {
    return api.put(`/carbon-offsets/${id}`, offsetData)
  },

  async deleteCarbonOffset(id) {
    return api.delete(`/carbon-offsets/${id}`)
  },

  // Energy Efficiency Recommendations
  async getEnergyRecommendations() {
    return api.get('/energy-efficiency-recommendations')
  },

  async createEnergyRecommendation(recommendationData) {
    return api.post('/energy-efficiency-recommendations', recommendationData)
  },

  async updateEnergyRecommendation(id, recommendationData) {
    return api.put(`/energy-efficiency-recommendations/${id}`, recommendationData)
  },

  async deleteEnergyRecommendation(id) {
    return api.delete(`/energy-efficiency-recommendations/${id}`)
  },

  // Water Quality Metrics
  async getWaterQualityMetrics() {
    return api.get('/water-quality-metrics')
  },

  async createWaterQualityMetric(metricData) {
    return api.post('/water-quality-metrics', metricData)
  },

  async updateWaterQualityMetric(id, metricData) {
    return api.put(`/water-quality-metrics/${id}`, metricData)
  },

  async deleteWaterQualityMetric(id) {
    return api.delete(`/water-quality-metrics/${id}`)
  },

  // Analytics and Reporting
  async getSustainabilityAnalytics(params = {}) {
    return api.get('/sustainability/analytics', { params })
  },

  async getCarbonFootprintAnalytics(params = {}) {
    return api.get('/carbon-footprint/analytics', { params })
  },

  async getEnergyAnalytics(params = {}) {
    return api.get('/energy-monitoring/analytics', { params })
  },

  async getWaterAnalytics(params = {}) {
    return api.get('/water-analytics', { params })
  },

  // Dashboard Data
  async getSustainabilityDashboard() {
    return api.get('/sustainability/dashboard')
  },

  async getSustainabilityScore() {
    return api.get('/sustainability/score')
  },

  async getSustainabilityTrends(period = 'month') {
    return api.get('/sustainability/trends', {
      params: { period }
    })
  },

  // Benchmarking
  async getSustainabilityBenchmarks() {
    return api.get('/sustainability/benchmarks')
  },

  async compareSustainabilityMetrics(comparisonData) {
    return api.post('/sustainability/compare', comparisonData)
  },

  // Alerts and Notifications
  async getSustainabilityAlerts() {
    return api.get('/sustainability/alerts')
  },

  async createSustainabilityAlert(alertData) {
    return api.post('/sustainability/alerts', alertData)
  },

  async updateSustainabilityAlert(id, alertData) {
    return api.put(`/sustainability/alerts/${id}`, alertData)
  },

  async deleteSustainabilityAlert(id) {
    return api.delete(`/sustainability/alerts/${id}`)
  }
}