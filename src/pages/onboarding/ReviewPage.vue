<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 900px;">
      <q-card class="q-pa-lg" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <h1 class="text-h4 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Review & Complete
          </h1>
          <p class="text-body1" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Please review your information before we create your account.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner-dots size="50px" color="primary" />
          <p class="text-body1 q-mt-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Loading review data...
          </p>
        </div>

        <!-- Review Content -->
        <div v-else-if="reviewData" class="q-gutter-lg">
          <!-- Property Information -->
          <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <h3 class="text-h6 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                  <q-icon name="hotel" class="q-mr-sm" />
                  Property Information
                </h3>
                <q-btn
                  @click="editStep(1)"
                  color="primary"
                  outline
                  size="sm"
                  icon="edit"
                  label="Edit"
                />
              </div>
              
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Property Name
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.name }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Subdomain
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.subdomain }}.hospie.com
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item v-if="reviewData.step1?.domain">
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Custom Domain
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.domain }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Property Type
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ formatPropertyType(reviewData.step1?.property_type) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Number of Rooms
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.rooms_count }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Contact Person
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.contact_name }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Email
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.contact_email }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item v-if="reviewData.step1?.contact_phone">
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Phone
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.contact_phone }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Location
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ reviewData.step1?.city }}, {{ formatCountry(reviewData.step1?.country) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Selected Plan -->
          <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <h3 class="text-h6 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                  <q-icon name="workspace_premium" class="q-mr-sm" />
                  Selected Plan
                </h3>
                <q-btn
                  @click="editStep(2)"
                  color="primary"
                  outline
                  size="sm"
                  icon="edit"
                  label="Edit"
                />
              </div>
              
              <q-card v-if="selectedPlan" :class="isDarkMode ? 'bg-grey-9' : 'bg-white'" class="plan-review-card" bordered>
                <q-card-section>
                  <div class="row items-start justify-between">
                    <div class="col">
                      <div class="row items-center q-mb-sm">
                        <h4 class="text-h6 text-weight-bold" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ selectedPlan.name }}
                        </h4>
                        <q-chip 
                          v-if="selectedPlan.is_popular" 
                          color="primary" 
                          text-color="white" 
                          size="sm"
                          class="q-ml-sm"
                        >
                          POPULAR
                        </q-chip>
                      </div>
                      
                      <p class="text-body2 q-mb-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        {{ selectedPlan.description }}
                      </p>
                      
                      <div class="row q-col-gutter-lg">
                        <div class="col-12 col-md-6">
                          <div class="text-h5 text-weight-bold text-primary q-mb-xs">
                            €{{ getDisplayPrice() }}
                            <span class="text-body2" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                              /{{ reviewData.step2?.billing_interval }}
                            </span>
                          </div>
                          
                          <q-chip color="blue" text-color="white" size="sm" icon="schedule">
                            {{ selectedPlan.trial_days }}-day free trial
                          </q-chip>
                        </div>
                        
                        <div class="col-12 col-md-6">
                          <h5 class="text-subtitle2 text-weight-medium q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                            Key Features:
                          </h5>
                          <q-list dense>
                            <q-item 
                              v-for="feature in selectedPlan.features.slice(0, 4)" 
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
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card>

          <!-- Configuration -->
          <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <h3 class="text-h6 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                  <q-icon name="settings" class="q-mr-sm" />
                  System Configuration
                </h3>
                <q-btn
                  @click="editStep(3)"
                  color="primary"
                  outline
                  size="sm"
                  icon="edit"
                  label="Edit"
                />
              </div>
              
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Timezone
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ getTimezoneLabel(reviewData.step3?.timezone) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Currency
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ getCurrencyLabel(reviewData.step3?.currency) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Language
                        </q-item-label>
                        <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          {{ getLanguageLabel(reviewData.step3?.language) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Demo Data
                        </q-item-label>
                        <q-item-label class="text-weight-medium row items-center" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          <q-icon 
                            :name="reviewData.step3?.demo_data ? 'check_circle' : 'cancel'"
                            :color="reviewData.step3?.demo_data ? 'positive' : 'negative'"
                            size="sm"
                            class="q-mr-xs"
                          />
                          {{ reviewData.step3?.demo_data ? 'Yes' : 'No' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                          Marketing Emails
                        </q-item-label>
                        <q-item-label class="text-weight-medium row items-center" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                          <q-icon 
                            :name="reviewData.step3?.marketing_emails ? 'check_circle' : 'cancel'"
                            :color="reviewData.step3?.marketing_emails ? 'positive' : 'negative'"
                            size="sm"
                            class="q-mr-xs"
                          />
                          {{ reviewData.step3?.marketing_emails ? 'Yes' : 'No' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Next Steps Preview -->
          <q-card :class="isDarkMode ? 'bg-blue-9' : 'bg-blue-1'" flat>
            <q-card-section>
              <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                <q-icon name="rocket_launch" class="q-mr-sm" />
                What happens next?
              </h3>
              
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-timeline :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                    <q-timeline-entry
                      title="Account Creation"
                      subtitle="We'll create your tenant account and set up your environment"
                      icon="account_circle"
                      color="primary"
                    />
                    
                    <q-timeline-entry
                      title="Welcome Email"
                      subtitle="You'll receive login credentials and next steps"
                      icon="email"
                      color="primary"
                    />
                  </q-timeline>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-timeline :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                    <q-timeline-entry
                      title="System Setup"
                      subtitle="Your PMS will be configured with your preferences"
                      icon="settings"
                      color="primary"
                    />
                    
                    <q-timeline-entry
                      title="Ready to Use"
                      subtitle="Start managing your property immediately"
                      icon="check_circle"
                      color="positive"
                    />
                  </q-timeline>
                </div>
              </div>
            </q-card-section>
          </q-card>

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
              @click="completeOnboarding"
              color="positive"
              size="lg"
              class="q-px-xl"
              :loading="completing"
              unelevated
            >
              <q-icon name="check" class="q-mr-sm" />
              Create My Account
            </q-btn>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center q-py-xl">
          <q-icon name="error" color="negative" size="50px" />
          <p class="text-body1 q-mt-md" :class="isDarkMode ? 'text-negative' : 'text-negative'">
            {{ error }}
          </p>
          <q-btn 
            @click="loadReviewData" 
            color="primary" 
            label="Try Again" 
            class="q-mt-md"
          />
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

const reviewData = ref(null)
const completing = ref(false)

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const config = computed(() => onboardingStore.config)

const selectedPlan = computed(() => {
  if (!reviewData.value?.selected_plan) return null
  return reviewData.value.selected_plan
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

const formatPropertyType = (type) => {
  if (!type || !config.value?.property_types) return type
  return config.value.property_types[type] || type
}

const formatCountry = (country) => {
  if (!country || !config.value?.countries) return country
  return config.value.countries[country] || country
}

const getTimezoneLabel = (timezone) => {
  if (!timezone || !config.value?.timezones) return timezone
  return config.value.timezones[timezone] || timezone
}

const getCurrencyLabel = (currency) => {
  if (!currency || !config.value?.currencies) return currency
  const info = config.value.currencies[currency]
  return info ? `${info.name} (${info.symbol})` : currency
}

const getLanguageLabel = (language) => {
  if (!language || !config.value?.languages) return language
  return config.value.languages[language] || language
}

const getDisplayPrice = () => {
  if (!selectedPlan.value || !reviewData.value?.step2) return '0'
  
  const plan = selectedPlan.value
  const interval = reviewData.value.step2.billing_interval
  
  if (interval === 'yearly') {
    return Math.floor(plan.price * 12 * 0.8) // 20% discount for yearly
  }
  return Math.floor(plan.price)
}

const loadReviewData = async () => {
  try {
    reviewData.value = await onboardingStore.getReviewData()
  } catch (err) {
    console.error('Failed to load review data:', err)
  }
}

const editStep = (step) => {
  router.push(`/onboarding/step${step}`)
}

const completeOnboarding = async () => {
  completing.value = true
  try {
    const result = await onboardingStore.completeOnboarding()
    if (result) {
      router.push('/onboarding/success')
    }
  } finally {
    completing.value = false
  }
}

const goBack = () => {
  router.push('/onboarding/step3')
}

onMounted(async () => {
  // Check if we can access this step
  if (!onboardingStore.allStepsCompleted) {
    router.push('/onboarding/step1')
    return
  }
  
  // Initialize if not already done
  if (!onboardingStore.config) {
    await onboardingStore.initialize()
  }
  
  // Load review data
  await loadReviewData()
})
</script>

<style scoped>
.plan-review-card {
  border: 2px solid var(--q-primary);
}

.dark .plan-review-card {
  border-color: var(--q-primary);
}
</style>