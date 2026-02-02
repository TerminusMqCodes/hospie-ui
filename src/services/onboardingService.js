import { api } from 'src/boot/axios'

export default {
  // Get onboarding configuration data
  async getConfig() {
    const response = await api.get('/onboarding/config')
    return response.data
  },

  // Get available plans
  async getPlans() {
    const response = await api.get('/onboarding/plans')
    return response.data
  },

  // Step 1: Basic Information
  async getStep1() {
    const response = await api.get('/onboarding/step1')
    return response.data
  },

  async processStep1(data) {
    const response = await api.post('/onboarding/step1', data)
    return response.data
  },

  // Step 2: Plan Selection
  async getStep2() {
    const response = await api.get('/onboarding/step2')
    return response.data
  },

  async processStep2(data) {
    const response = await api.post('/onboarding/step2', data)
    return response.data
  },

  // Step 3: Configuration
  async getStep3() {
    const response = await api.get('/onboarding/step3')
    return response.data
  },

  async processStep3(data) {
    console.log('Sending step3 data:', data)
    try {
      const response = await api.post('/onboarding/step3', data)
      return response.data
    } catch (error) {
      console.error('Step3 API Error:', error.response?.data)
      throw error
    }
  },

  // Review and Complete
  async getReview() {
    const response = await api.get('/onboarding/review')
    return response.data
  },

  async complete() {
    const response = await api.post('/onboarding/complete')
    return response.data
  },

  // Utility methods
  async getProgress() {
    const response = await api.get('/onboarding/progress')
    return response.data
  },

  async reset() {
    const response = await api.post('/onboarding/reset')
    return response.data
  }
}