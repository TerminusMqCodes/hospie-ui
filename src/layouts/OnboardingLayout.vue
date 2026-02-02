<template>
  <q-layout view="lHh Lpr lFf" :class="isDarkMode ? 'bg-dark' : 'bg-grey-1'">
    <!-- Header -->
    <q-header elevated :class="isDarkMode ? 'bg-dark text-white' : 'bg-white text-grey-8'" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-toolbar-title class="row items-center no-wrap" shrink>
          <q-icon name="hotel" size="24px" color="primary" class="q-mr-sm" />
          <span class="q-ml-sm brand-text">Hospie PMS</span>
        </q-toolbar-title>
        
        <q-space />
        
        <div class="text-subtitle2 text-grey-6">
          Need help? 
          <a href="mailto:support@hospie.com" class="text-primary text-decoration-none">
            Contact Support
          </a>
        </div>
      </q-toolbar>
      
      <!-- Progress Bar -->
      <div v-if="showProgress" :class="isDarkMode ? 'bg-dark border-t border-grey-8' : 'bg-grey-1 border-t border-grey-3'">
        <div class="q-pa-md">
          <div class="flex items-center justify-between q-mb-sm">
            <span :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'" class="text-caption">
              Step {{ currentStep }} of 4
            </span>
            <span :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'" class="text-caption">
              {{ progress }}% Complete
            </span>
          </div>
          
          <q-linear-progress 
            :value="progress / 100" 
            color="primary" 
            :track-color="isDarkMode ? 'grey-8' : 'grey-3'"
            size="8px"
            rounded
          />
          
          <div class="flex justify-between q-mt-sm">
            <div 
              v-for="step in 4" 
              :key="step"
              class="flex items-center"
            >
              <q-icon 
                :name="getStepIcon(step)"
                :color="getStepColor(step)"
                size="sm"
              />
              <span 
                class="text-caption q-ml-xs"
                :class="getStepTextColor(step)"
              >
                {{ getStepLabel(step) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <div :class="isDarkMode ? 'bg-dark' : 'bg-grey-1'" class="min-h-screen flex items-center justify-center q-pa-md">
        <div class="w-full" style="max-width: 1200px;">
          <router-view />
        </div>
      </div>
    </q-page-container>

    <!-- Footer -->
    <q-footer :class="isDarkMode ? 'bg-dark border-t border-grey-8 text-grey-4' : 'bg-grey-1 border-t border-grey-3 text-grey-6'">
      <div class="q-pa-md text-center">
        <div class="text-caption">
          &copy; {{ new Date().getFullYear() }} Hospie PMS. All rights reserved.
        </div>
        <div class="q-mt-xs">
          <a href="#" :class="isDarkMode ? 'text-grey-4 hover:text-grey-2' : 'text-grey-6 hover:text-grey-8'" class="text-decoration-none q-mx-sm">
            Privacy Policy
          </a>
          <a href="#" :class="isDarkMode ? 'text-grey-4 hover:text-grey-2' : 'text-grey-6 hover:text-grey-8'" class="text-decoration-none q-mx-sm">
            Terms of Service
          </a>
          <a href="#" :class="isDarkMode ? 'text-grey-4 hover:text-grey-2' : 'text-grey-6 hover:text-grey-8'" class="text-decoration-none q-mx-sm">
            Support
          </a>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useOnboardingStore } from 'src/stores/onboarding'
import { useDarkMode } from 'src/composables/useDarkMode'

const onboardingStore = useOnboardingStore()
const { isDarkMode } = useDarkMode()

const showProgress = computed(() => {
  return onboardingStore.currentStep > 0
})

const currentStep = computed(() => onboardingStore.currentStep)
const progress = computed(() => onboardingStore.progress)

const getStepIcon = (step) => {
  if (onboardingStore.isStepCompleted(step)) {
    return 'check_circle'
  } else if (step === onboardingStore.currentStep) {
    return 'radio_button_checked'
  } else {
    return 'radio_button_unchecked'
  }
}

const getStepColor = (step) => {
  if (onboardingStore.isStepCompleted(step)) {
    return 'positive'
  } else if (step === onboardingStore.currentStep) {
    return 'primary'
  } else {
    return isDarkMode.value ? 'grey-6' : 'grey-4'
  }
}

const getStepTextColor = (step) => {
  if (onboardingStore.isStepCompleted(step)) {
    return isDarkMode.value ? 'text-positive' : 'text-positive'
  } else if (step === onboardingStore.currentStep) {
    return isDarkMode.value ? 'text-primary' : 'text-primary'
  } else {
    return isDarkMode.value ? 'text-grey-6' : 'text-grey-5'
  }
}

const getStepLabel = (step) => {
  const labels = {
    1: 'Basic Info',
    2: 'Plan Selection',
    3: 'Configuration',
    4: 'Review'
  }
  return labels[step]
}
</script>

<style scoped>
.GNL__toolbar {
  min-height: 64px;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

/* Consistent with MainLayout styling */
.q-toolbar {
  padding: 0 16px;
}

.q-footer {
  min-height: 60px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .brand-text {
    font-size: 1.1rem;
  }
  
  .q-toolbar {
    padding: 0 8px;
  }
}
</style>