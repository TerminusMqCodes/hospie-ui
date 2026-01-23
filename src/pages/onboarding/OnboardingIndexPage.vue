<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 1000px;">
      <q-card class="q-pa-lg" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <q-icon name="hotel" size="80px" color="primary" class="q-mb-md" />
          <h1 class="text-h3 text-weight-bold q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Welcome to Hospie PMS
          </h1>
          <p class="text-h6 q-mb-lg" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            The complete hotel management solution that grows with your business
          </p>
        </div>

        <!-- Features Grid -->
        <div class="row q-col-gutter-md q-mb-xl">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="col-12 col-md-6"
          >
            <q-card 
              flat 
              bordered 
              class="q-pa-md full-height"
              :class="isDarkMode ? 'bg-grey-9 border-grey-8' : 'bg-grey-1 border-grey-3'"
            >
              <div class="row items-start q-gutter-md">
                <q-icon :name="feature.icon" size="32px" :color="feature.color" />
                <div class="col">
                  <h3 class="text-subtitle1 text-weight-medium q-mb-xs" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body2" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- Pricing Preview -->
        <div v-if="plans.length" class="q-mb-xl">
          <h2 class="text-h4 text-weight-bold text-center q-mb-lg" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Choose Your Plan
          </h2>
          <div class="row q-col-gutter-md">
            <div 
              v-for="plan in plans" 
              :key="plan.id"
              class="col-12 col-md-4"
            >
              <q-card 
                class="full-height relative-position"
                :class="[
                  plan.is_popular ? 'border-primary' : (isDarkMode ? 'border-grey-8' : 'border-grey-3'),
                  isDarkMode ? 'bg-grey-9' : 'bg-white'
                ]"
                :style="plan.is_popular ? 'border-width: 2px; border-style: solid;' : ''"
              >
                <q-badge 
                  v-if="plan.is_popular"
                  color="primary"
                  label="MOST POPULAR"
                  class="absolute-top-right q-ma-sm"
                />
                
                <q-card-section class="text-center">
                  <h3 class="text-h5 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                    {{ plan.name }}
                  </h3>
                  <div class="text-h3 text-weight-bold text-primary q-mb-sm">
                    ${{ Math.floor(plan.price) }}
                    <span class="text-body2 text-weight-normal" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                      /month
                    </span>
                  </div>
                  <p class="text-body2 q-mb-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                    {{ plan.description }}
                  </p>
                </q-card-section>
                
                <q-card-section>
                  <q-list dense>
                    <q-item 
                      v-for="feature in plan.features.slice(0, 4)" 
                      :key="feature"
                      class="q-pa-none"
                    >
                      <q-item-section avatar class="min-width-auto">
                        <q-icon name="check_circle" color="positive" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2" :class="isDarkMode ? 'text-grey-3' : 'text-grey-7'">
                          {{ formatFeature(feature) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner-dots size="50px" color="primary" />
          <p class="text-body1 q-mt-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Loading plans...
          </p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center q-py-xl">
          <q-icon name="error_outline" color="negative" size="50px" />
          <p class="text-body1 text-negative q-mt-md">{{ error }}</p>
          <q-btn 
            @click="initialize" 
            color="primary" 
            label="Try Again" 
            class="q-mt-md"
            outline
          />
        </div>

        <!-- CTA Section -->
        <div class="text-center" v-if="!loading && !error">
          <p class="text-body1 q-mb-lg" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Ready to transform your hotel management? Let's get started with a few quick questions.
          </p>
          <q-btn 
            @click="startOnboarding"
            color="primary"
            size="lg"
            class="q-px-xl"
            :loading="starting"
            unelevated
          >
            <q-icon name="rocket_launch" class="q-mr-sm" />
            Start Free Trial
          </q-btn>
          <p class="text-caption q-mt-md" :class="isDarkMode ? 'text-grey-5' : 'text-grey-5'">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </q-card>

      <!-- Trust Indicators -->
      <q-card class="q-mt-lg q-pa-md" :class="isDarkMode ? 'bg-grey-9' : 'bg-white'">
        <p class="text-body2 text-center q-mb-md" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
          Trusted by hotels worldwide
        </p>
        <div class="row justify-center items-center q-gutter-lg">
          <div class="flex items-center q-gutter-xs">
            <q-icon name="security" size="sm" color="positive" />
            <span class="text-caption" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
              SSL Secured
            </span>
          </div>
          <div class="flex items-center q-gutter-xs">
            <q-icon name="verified" size="sm" color="info" />
            <span class="text-caption" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
              GDPR Compliant
            </span>
          </div>
          <div class="flex items-center q-gutter-xs">
            <q-icon name="support" size="sm" color="warning" />
            <span class="text-caption" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
              24/7 Support
            </span>
          </div>
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

const starting = ref(false)

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const plans = computed(() => onboardingStore.plans)

const features = [
  {
    icon: 'event_available',
    title: 'Reservation Management',
    description: 'Handle bookings from all channels in one place',
    color: 'primary'
  },
  {
    icon: 'payment',
    title: 'Payment Processing',
    description: 'Secure payments with multiple methods',
    color: 'positive'
  },
  {
    icon: 'meeting_room',
    title: 'Room Management',
    description: 'Track room status and housekeeping in real-time',
    color: 'info'
  },
  {
    icon: 'analytics',
    title: 'Analytics & Reports',
    description: 'Detailed insights to grow your business',
    color: 'warning'
  },
  {
    icon: 'people',
    title: 'Guest Management',
    description: 'Complete guest profiles and communication',
    color: 'secondary'
  },
  {
    icon: 'hub',
    title: 'Channel Manager',
    description: 'Sync with booking platforms automatically',
    color: 'accent'
  }
]

const formatFeature = (feature) => {
  const featureMap = {
    'basic_pms': 'Alapvető PMS funkciók',
    'guest_portal': 'Vendégportál',
    'basic_reporting': 'Alapvető jelentések',
    'email_support': 'Email támogatás',
    'channel_manager': 'Channel Manager',
    'payment_integration': 'Fizetési integráció',
    'advanced_analytics': 'Részletes analitika',
    'phone_support': 'Telefonos támogatás',
    'api_access': 'API hozzáférés',
    'multi_property': 'Több ingatlan kezelése',
    'custom_integrations': 'Egyedi integrációk',
    'dedicated_support': 'Dedikált támogatás',
    'sla_guarantee': 'SLA garancia',
    'custom_development': 'Egyedi fejlesztések',
    'priority_support': 'Prioritásos támogatás'
  }
  return featureMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const initialize = async () => {
  await onboardingStore.initialize()
}

const startOnboarding = async () => {
  starting.value = true
  try {
    await router.push('/onboarding/step1')
  } finally {
    starting.value = false
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>