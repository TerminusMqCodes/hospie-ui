<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 1000px;">
      <q-card class="q-pa-lg" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <h1 class="text-h4 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Choose Your Plan
          </h1>
          <p class="text-body1" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Select the plan that best fits your property's needs. You can upgrade or downgrade anytime.
          </p>
        </div>

        <!-- Billing Interval Toggle -->
        <div class="text-center q-mb-xl">
          <q-btn-toggle
            v-model="billingInterval"
            :options="[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly (Save 20%)', value: 'yearly' }
            ]"
            color="primary"
            toggle-color="primary"
            unelevated
            @update:model-value="updatePricing"
          />
        </div>

        <!-- Plans Grid -->
        <div v-if="plans.length" class="row q-col-gutter-lg q-mb-xl">
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            class="col-12 col-md-4"
          >
            <q-card 
              class="plan-card cursor-pointer transition-all full-height"
              :class="[
                selectedPlanId === plan.id ? 'selected-plan' : '',
                plan.is_popular ? 'popular-plan' : '',
                isDarkMode ? 'bg-grey-9' : 'bg-white'
              ]"
              @click="selectPlan(plan.id)"
              bordered
            >
              <!-- Popular Badge -->
              <div v-if="plan.is_popular" class="popular-badge">
                <q-chip color="secondary" text-color="white" size="sm">
                  <q-icon name="star" size="xs" class="q-mr-xs" />
                  Most Popular
                </q-chip>
              </div>

              <!-- Selection Indicator -->
              <div class="absolute-top-right q-pa-md">
                <q-icon 
                  :name="selectedPlanId === plan.id ? 'radio_button_checked' : 'radio_button_unchecked'"
                  :color="selectedPlanId === plan.id ? 'primary' : 'grey-5'"
                  size="md"
                />
              </div>

              <q-card-section class="text-center q-pt-lg">
                <!-- Plan Name -->
                <h3 class="text-h6 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                  {{ plan.name }}
                </h3>

                <!-- Price -->
                <div class="q-mb-md">
                  <span class="text-h4 text-weight-bold text-primary">
                    €{{ getDisplayPrice(plan) }}
                  </span>
                  <span class="text-body2" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                    /{{ billingInterval === 'yearly' ? 'year' : 'month' }}
                  </span>
                  <div v-if="billingInterval === 'yearly'" class="text-caption text-positive q-mt-xs">
                    Save €{{ getYearlySavings(plan) }} per year
                  </div>
                </div>

                <!-- Description -->
                <p class="text-body2 q-mb-lg" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                  {{ plan.description }}
                </p>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <!-- Features -->
                <div class="q-mb-md">
                  <h4 class="text-subtitle2 text-weight-medium q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                    Features included:
                  </h4>
                  <q-list dense>
                    <q-item 
                      v-for="feature in plan.features" 
                      :key="feature"
                      class="q-px-none q-py-xs"
                    >
                      <q-item-section avatar class="q-pr-sm">
                        <q-icon name="check_circle" color="positive" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2" :class="isDarkMode ? 'text-grey-3' : 'text-grey-8'">
                          {{ formatFeature(feature) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Limits -->
                <q-separator class="q-my-md" />
                <div class="q-mb-md">
                  <h4 class="text-subtitle2 text-weight-medium q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                    Plan limits:
                  </h4>
                  <div class="row q-col-gutter-xs text-caption" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                    <div v-if="plan.limits.rooms !== undefined" class="col-6">
                      <strong>Rooms:</strong> {{ plan.limits.rooms === -1 ? 'Unlimited' : plan.limits.rooms }}
                    </div>
                    <div v-if="plan.limits.users !== undefined" class="col-6">
                      <strong>Users:</strong> {{ plan.limits.users === -1 ? 'Unlimited' : plan.limits.users }}
                    </div>
                    <div v-if="plan.limits.api_calls !== undefined" class="col-6">
                      <strong>API Calls:</strong> {{ formatNumber(plan.limits.api_calls) }}/month
                    </div>
                    <div v-if="plan.limits.data_storage !== undefined" class="col-6">
                      <strong>Storage:</strong> {{ plan.limits.data_storage }}GB
                    </div>
                  </div>
                </div>

                <!-- Trial Info -->
                <q-banner 
                  class="q-mt-md" 
                  :class="isDarkMode ? 'bg-blue-9 text-blue-2' : 'bg-blue-1 text-blue-8'"
                  rounded
                  dense
                >
                  <template v-slot:avatar>
                    <q-icon name="schedule" color="blue" />
                  </template>
                  {{ plan.trial_days }}-day free trial included
                </q-banner>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner-dots size="50px" color="primary" />
          <p class="text-body1 q-mt-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Loading plans...
          </p>
        </div>

        <!-- Error Display -->
        <q-banner 
          v-if="error" 
          class="q-mb-md" 
          :class="isDarkMode ? 'bg-negative text-white' : 'bg-red-1 text-negative'"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="error_outline" />
          </template>
          {{ error }}
        </q-banner>

        <!-- Plan Comparison -->
        <div v-if="plans.length && plans.length > 1" class="q-mb-xl">
          <q-expansion-item
            :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'"
            header-class="text-subtitle1 text-weight-medium"
            expand-separator
            icon="compare"
            label="Compare all features"
          >
            <q-card>
              <q-card-section>
                <q-markup-table>
                  <thead>
                    <tr>
                      <th class="text-left">Feature</th>
                      <th v-for="plan in plans" :key="plan.id" class="text-center">
                        {{ plan.name }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="feature in allFeatures" :key="feature">
                      <td>{{ formatFeature(feature) }}</td>
                      <td v-for="plan in plans" :key="plan.id" class="text-center">
                        <q-icon 
                          :name="plan.features.includes(feature) ? 'check_circle' : 'cancel'"
                          :color="plan.features.includes(feature) ? 'positive' : 'negative'"
                          size="sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Actions -->
        <q-separator class="q-my-lg" />
        
        <div class="row justify-between items-center">
          <q-btn
            @click="goBack"
            color="grey-7"
            outline
            size="lg"
            class="q-px-xl"
          >
            <q-icon name="arrow_back" class="q-mr-sm" />
            Back
          </q-btn>

          <q-btn
            @click="onSubmit"
            color="primary"
            size="lg"
            class="q-px-xl"
            :loading="submitting"
            :disable="!selectedPlanId"
            unelevated
          >
            Continue
            <q-icon name="arrow_forward" class="q-ml-sm" />
          </q-btn>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from 'src/stores/onboarding'
import { useDarkMode } from 'src/composables/useDarkMode'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const { isDarkMode } = useDarkMode()

const selectedPlanId = ref(null)
const billingInterval = ref('monthly')
const submitting = ref(false)

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const plans = computed(() => onboardingStore.plans)

const allFeatures = computed(() => {
  const features = new Set()
  plans.value.forEach(plan => {
    plan.features.forEach(feature => features.add(feature))
  })
  return Array.from(features).sort()
})

const formatFeature = (feature) => {
  const featureMap = {
    'basic_pms': 'Basic PMS Features',
    'advanced_reporting': 'Advanced Reporting',
    'channel_manager': 'Channel Manager',
    'dynamic_pricing': 'Dynamic Pricing',
    'api_access': 'API Access',
    'multi_property': 'Multi-Property Support',
    'white_label': 'White Label Solution',
    'priority_support': 'Priority Support',
    'advanced_integrations': 'Advanced Integrations',
    'custom_workflows': 'Custom Workflows'
  }
  return featureMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatNumber = (num) => {
  if (num === -1) return 'Unlimited'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getDisplayPrice = (plan) => {
  if (billingInterval.value === 'yearly') {
    return Math.floor(plan.price * 12 * 0.8) // 20% discount for yearly
  }
  return Math.floor(plan.price)
}

const getYearlySavings = (plan) => {
  const monthlyTotal = plan.price * 12
  const yearlyTotal = monthlyTotal * 0.8
  return Math.floor(monthlyTotal - yearlyTotal)
}

const selectPlan = (planId) => {
  selectedPlanId.value = planId
}

const updatePricing = () => {
  // Pricing updates are handled by computed properties
}

const onSubmit = async () => {
  if (!selectedPlanId.value) return
  
  submitting.value = true
  try {
    const success = await onboardingStore.processStep2({
      plan_id: selectedPlanId.value,
      billing_interval: billingInterval.value
    })
    
    if (success) {
      router.push('/onboarding/step3')
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/onboarding/step1')
}

onMounted(async () => {
  // Check if we can access this step
  if (!onboardingStore.canProceedToStep(2)) {
    router.push('/onboarding/step1')
    return
  }
  
  // Initialize if not already done
  if (!onboardingStore.plans.length) {
    await onboardingStore.initialize()
  }
  
  // Load existing step data
  await onboardingStore.loadStepData(2)
  
  // Populate form with existing data
  if (onboardingStore.step2Data.plan_id) {
    selectedPlanId.value = onboardingStore.step2Data.plan_id
  }
  if (onboardingStore.step2Data.billing_interval) {
    billingInterval.value = onboardingStore.step2Data.billing_interval
  }
})
</script>

<style scoped>
.plan-card {
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.selected-plan {
  border-color: var(--q-primary);
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
}

.popular-plan {
  border-color: var(--q-secondary);
}

.popular-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.dark .plan-card {
  border-color: rgba(255, 255, 255, 0.12);
}

.dark .plan-card:hover {
  border-color: rgba(255, 255, 255, 0.24);
}

.dark .selected-plan {
  border-color: var(--q-primary);
}
</style>