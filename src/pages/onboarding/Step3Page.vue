<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 800px;">
      <q-card class="q-pa-lg" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <h1 class="text-h4 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Configure Your System
          </h1>
          <p class="text-body1" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Set up your preferences and system settings. You can change these later in your dashboard.
          </p>
        </div>

        <!-- Form -->
        <q-form @submit="onSubmit" class="q-gutter-lg">
          <!-- Regional Settings -->
          <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat>
            <q-card-section>
              <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                <q-icon name="public" class="q-mr-sm" />
                Regional Settings
              </h3>
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.timezone"
                    :options="timezoneOptions"
                    label="Timezone *"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="filterTimezones"
                    :rules="[val => !!val || 'Timezone is required']"
                    :dark="isDarkMode"
                  >
                    <template v-slot:prepend>
                      <q-icon name="schedule" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.currency"
                    :options="currencyOptions"
                    label="Currency *"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="filterCurrencies"
                    :rules="[val => !!val || 'Currency is required']"
                    :dark="isDarkMode"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.language"
                    :options="languageOptions"
                    label="Language *"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Language is required']"
                    :dark="isDarkMode"
                  >
                    <template v-slot:prepend>
                      <q-icon name="language" />
                    </template>
                  </q-select>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- System Preferences -->
          <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat>
            <q-card-section>
              <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                <q-icon name="settings" class="q-mr-sm" />
                System Preferences
              </h3>
              
              <div class="q-gutter-md">
                <!-- Demo Data -->
                <q-card :class="isDarkMode ? 'bg-grey-9' : 'bg-white'" bordered>
                  <q-card-section class="row items-start q-gutter-md">
                    <q-checkbox v-model="form.demo_data" :dark="isDarkMode" />
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                        Include Demo Data
                      </div>
                      <div class="text-body2 q-mt-xs" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Add sample rooms, guests, and reservations to help you get started quickly. 
                        You can delete this data later.
                      </div>
                      <q-chip 
                        color="blue" 
                        text-color="white" 
                        size="sm" 
                        icon="info"
                        class="q-mt-sm"
                      >
                        Recommended for first-time users
                      </q-chip>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Marketing Emails -->
                <q-card :class="isDarkMode ? 'bg-grey-9' : 'bg-white'" bordered>
                  <q-card-section class="row items-start q-gutter-md">
                    <q-checkbox v-model="form.marketing_emails" :dark="isDarkMode" />
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                        Marketing Communications
                      </div>
                      <div class="text-body2 q-mt-xs" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Receive updates about new features, tips, and industry insights. 
                        You can unsubscribe at any time.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>

          <!-- Preview Settings -->
          <q-card :class="isDarkMode ? 'bg-blue-9' : 'bg-blue-1'" flat>
            <q-card-section>
              <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                <q-icon name="preview" class="q-mr-sm" />
                Preview Your Settings
              </h3>
              
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-list :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Timezone</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ getTimezoneLabel(form.timezone) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Currency</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ getCurrencyLabel(form.currency) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Language</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ getLanguageLabel(form.language) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-list :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Demo Data</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ form.demo_data ? 'Yes' : 'No' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Marketing Emails</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ form.marketing_emails ? 'Yes' : 'No' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Current Time</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ getCurrentTime() }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
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
              type="submit"
              color="primary"
              size="lg"
              class="q-px-xl"
              :loading="loading"
              unelevated
            >
              Continue
              <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from 'src/stores/onboarding'
import { useDarkMode } from 'src/composables/useDarkMode'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const { isDarkMode } = useDarkMode()

const form = ref({
  timezone: 'UTC',
  currency: 'EUR',
  language: 'en',
  demo_data: true,
  marketing_emails: false
})

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const config = computed(() => onboardingStore.config)

const timezoneOptions = ref([])
const currencyOptions = ref([])
const languageOptions = computed(() => {
  if (!config.value?.languages) return []
  return Object.entries(config.value.languages).map(([value, label]) => ({
    label,
    value
  }))
})

const allTimezones = computed(() => {
  if (!config.value?.timezones) return []
  return Object.entries(config.value.timezones).map(([value, label]) => ({
    label,
    value
  }))
})

const allCurrencies = computed(() => {
  if (!config.value?.currencies) return []
  return Object.entries(config.value.currencies).map(([code, info]) => ({
    label: `${info.name} (${info.symbol})`,
    value: code
  }))
})

// Watch for config changes and update options
watch(allTimezones, (newTimezones) => {
  timezoneOptions.value = newTimezones
}, { immediate: true })

watch(allCurrencies, (newCurrencies) => {
  currencyOptions.value = newCurrencies
}, { immediate: true })

const filterTimezones = (val, update) => {
  update(() => {
    if (val === '') {
      timezoneOptions.value = allTimezones.value
    } else {
      const needle = val.toLowerCase()
      timezoneOptions.value = allTimezones.value.filter(
        tz => tz.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filterCurrencies = (val, update) => {
  update(() => {
    if (val === '') {
      currencyOptions.value = allCurrencies.value
    } else {
      const needle = val.toLowerCase()
      currencyOptions.value = allCurrencies.value.filter(
        currency => currency.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
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

const getCurrentTime = () => {
  if (!form.value.timezone) return 'Select timezone'
  
  try {
    return new Date().toLocaleString('en-US', {
      timeZone: form.value.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return 'Invalid timezone'
  }
}

const onSubmit = async () => {
  const success = await onboardingStore.processStep3(form.value)
  if (success) {
    router.push('/onboarding/review')
  }
}

const goBack = () => {
  router.push('/onboarding/step2')
}

onMounted(async () => {
  // Check if we can access this step
  if (!onboardingStore.canProceedToStep(3)) {
    router.push('/onboarding/step1')
    return
  }
  
  // Initialize if not already done
  if (!onboardingStore.config) {
    await onboardingStore.initialize()
  }
  
  // Load existing step data
  await onboardingStore.loadStepData(3)
  
  // Populate form with existing data
  if (Object.keys(onboardingStore.step3Data).length > 0) {
    Object.assign(form.value, onboardingStore.step3Data)
  }
  
  // Initialize filter options
  timezoneOptions.value = allTimezones.value
  currencyOptions.value = allCurrencies.value
})
</script>