import { defineStore } from 'pinia'
import onboardingService from 'src/services/onboardingService'

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    // Configuration data
    config: null,
    plans: [],
    
    // Step data
    step1Data: {},
    step2Data: {},
    step3Data: {},
    
    // Progress tracking
    currentStep: 1,
    completedSteps: [],
    progress: 0,
    
    // UI state
    loading: false,
    error: null,
    
    // Completion data
    completionResult: null
  }),

  getters: {
    // Check if a step is completed
    isStepCompleted: (state) => (step) => {
      return state.completedSteps.includes(step)
    },
    
    // Check if we can proceed to next step
    canProceedToStep: (state) => (step) => {
      if (step === 1) return true
      return state.completedSteps.includes(step - 1)
    },
    
    // Get selected plan
    selectedPlan: (state) => {
      if (!state.step2Data.plan_id || !state.plans.length) return null
      return state.plans.find(plan => plan.id === state.step2Data.plan_id)
    },
    
    // Check if all steps are completed
    allStepsCompleted: (state) => {
      return state.completedSteps.length === 3 && 
             state.completedSteps.includes(1) && 
             state.completedSteps.includes(2) && 
             state.completedSteps.includes(3)
    }
  },

  actions: {
    // Initialize onboarding
    async initialize() {
      this.loading = true
      this.error = null
      
      try {
        // Load configuration data
        const configResponse = await onboardingService.getConfig()
        if (configResponse.success) {
          this.config = configResponse.data
        }
        
        // Load plans
        const plansResponse = await onboardingService.getPlans()
        if (plansResponse.success) {
          this.plans = plansResponse.data
        }
        
        // Load progress
        await this.loadProgress()
        
      } catch (error) {
        this.error = error.message || 'Failed to initialize onboarding'
        console.error('Onboarding initialization error:', error)
      } finally {
        this.loading = false
      }
    },
    
    // Load current progress
    async loadProgress() {
      try {
        const response = await onboardingService.getProgress()
        if (response.success) {
          this.currentStep = response.data.current_step
          this.progress = response.data.percentage
          this.completedSteps = Object.keys(response.data.steps)
            .filter(key => response.data.steps[key])
            .map(key => parseInt(key.replace('step', '')))
        }
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    },
    
    // Load step data
    async loadStepData(step) {
      try {
        let response
        switch (step) {
          case 1:
            response = await onboardingService.getStep1()
            if (response.success && response.data) {
              this.step1Data = response.data
            }
            break
          case 2:
            response = await onboardingService.getStep2()
            if (response.success && response.data) {
              this.step2Data = response.data
            }
            break
          case 3:
            response = await onboardingService.getStep3()
            if (response.success && response.data) {
              this.step3Data = response.data
            }
            break
        }
      } catch (error) {
        console.error(`Failed to load step ${step} data:`, error)
      }
    },
    
    // Process step 1
    async processStep1(data) {
      this.loading = true
      this.error = null
      
      try {
        const response = await onboardingService.processStep1(data)
        if (response.success) {
          this.step1Data = data
          this.markStepCompleted(1)
          this.currentStep = 2
          this.updateProgress()
          return true
        } else {
          this.error = response.message || 'Failed to process step 1'
          return false
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to process step 1'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Process step 2
    async processStep2(data) {
      this.loading = true
      this.error = null
      
      try {
        const response = await onboardingService.processStep2(data)
        if (response.success) {
          this.step2Data = data
          this.markStepCompleted(2)
          this.currentStep = 3
          this.updateProgress()
          return true
        } else {
          this.error = response.message || 'Failed to process step 2'
          return false
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to process step 2'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Process step 3
    async processStep3(data) {
      this.loading = true
      this.error = null
      
      try {
        const response = await onboardingService.processStep3(data)
        if (response.success) {
          this.step3Data = data
          this.markStepCompleted(3)
          this.currentStep = 4
          this.updateProgress()
          return true
        } else {
          this.error = response.message || 'Failed to process step 3'
          return false
        }
      } catch (error) {
        console.error('Step3 Store Error:', error)
        
        // Handle validation errors
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessages = Object.values(validationErrors).flat()
          this.error = errorMessages.join(', ')
        } else {
          this.error = error.response?.data?.message || error.message || 'Failed to process step 3'
        }
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Complete onboarding
    async completeOnboarding() {
      this.loading = true
      this.error = null
      
      try {
        const response = await onboardingService.complete()
        if (response.success) {
          this.completionResult = response.data
          this.markStepCompleted(4)
          this.progress = 100
          return response.data
        } else {
          this.error = response.message || 'Failed to complete onboarding'
          return false
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to complete onboarding'
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Get review data
    async getReviewData() {
      try {
        const response = await onboardingService.getReview()
        if (response.success) {
          return response.data
        }
        return null
      } catch (error) {
        console.error('Failed to get review data:', error)
        return null
      }
    },
    
    // Reset onboarding
    async resetOnboarding() {
      this.loading = true
      
      try {
        await onboardingService.reset()
        this.resetState()
      } catch (error) {
        console.error('Failed to reset onboarding:', error)
      } finally {
        this.loading = false
      }
    },
    
    // Helper methods
    markStepCompleted(step) {
      if (!this.completedSteps.includes(step)) {
        this.completedSteps.push(step)
      }
    },
    
    updateProgress() {
      this.progress = (this.completedSteps.length / 4) * 100
    },
    
    resetState() {
      this.step1Data = {}
      this.step2Data = {}
      this.step3Data = {}
      this.currentStep = 1
      this.completedSteps = []
      this.progress = 0
      this.error = null
      this.completionResult = null
    },
    
    // Navigation helpers
    goToStep(step) {
      if (this.canProceedToStep(step)) {
        this.currentStep = step
      }
    },
    
    nextStep() {
      if (this.currentStep < 4) {
        this.currentStep++
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    }
  }
})