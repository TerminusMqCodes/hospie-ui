<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 800px;">
      <q-card class="q-pa-lg" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <h1 class="text-h4 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Tell us about your property
          </h1>
          <p class="text-body1" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Let's start with some basic information about your hotel or property.
          </p>
        </div>

        <!-- Form -->
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Property Information -->
          <div class="row q-col-gutter-md">
            <!-- Property Name -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Property Name *"
                outlined
                :rules="[val => !!val || 'Property name is required']"
                hint="The name of your hotel or property"
                :dark="isDarkMode"
              />
            </div>

            <!-- Subdomain -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.subdomain"
                label="Subdomain *"
                outlined
                :rules="[
                  val => !!val || 'Subdomain is required',
                  val => val.length >= 3 || 'Subdomain must be at least 3 characters',
                  val => /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/.test(val) || 'Invalid subdomain format'
                ]"
                hint="Your unique URL: https://your-subdomain.hospie.com"
                @update:model-value="onSubdomainChange"
                :dark="isDarkMode"
              >
                <template v-slot:prepend>
                  <span :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">https://</span>
                </template>
                <template v-slot:append>
                  <span :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">.hospie.com</span>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Custom Domain (Optional) -->
          <q-input
            v-model="form.domain"
            label="Custom Domain (Optional)"
            outlined
            :dark="isDarkMode"
            hint="If you have your own domain (e.g., booking.yourhotel.com)"
          />

          <!-- Contact Information -->
          <q-separator class="q-my-lg" />
          
          <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Contact Information
          </h3>
          
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.contact_name"
                label="Contact Name *"
                outlined
                :rules="[val => !!val || 'Contact name is required']"
                :dark="isDarkMode"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.contact_email"
                label="Contact Email *"
                type="email"
                outlined
                :rules="[
                  val => !!val || 'Email is required',
                  val => /.+@.+\..+/.test(val) || 'Please enter a valid email'
                ]"
                :dark="isDarkMode"
              />
            </div>
          </div>

          <q-input
            v-model="form.contact_phone"
            label="Contact Phone"
            outlined
            class="q-mt-md"
            hint="Include country code (e.g., +1 555-123-4567)"
            :dark="isDarkMode"
          />

          <!-- Property Details -->
          <q-separator class="q-my-lg" />
          
          <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Property Details
          </h3>
          
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.property_type"
                :options="propertyTypeOptions"
                label="Property Type *"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Property type is required']"
                :dark="isDarkMode"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="form.company_size"
                :options="companySizeOptions"
                label="Company Size *"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Company size is required']"
                :dark="isDarkMode"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.rooms_count"
                label="Number of Rooms *"
                type="number"
                outlined
                :rules="[
                  val => !!val || 'Number of rooms is required',
                  val => val > 0 || 'Must be greater than 0',
                  val => val <= 10000 || 'Maximum 10,000 rooms supported'
                ]"
                :dark="isDarkMode"
              />
            </div>
          </div>

          <!-- Location -->
          <q-separator class="q-my-lg" />
          
          <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Location
          </h3>
          
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.country"
                :options="countryOptions"
                label="Country *"
                outlined
                emit-value
                map-options
                use-input
                input-debounce="300"
                :dark="isDarkMode"
                @filter="filterCountries"
                :rules="[val => !!val || 'Country is required']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.city"
                label="City *"
                outlined
                :rules="[val => !!val || 'City is required']"
                :dark="isDarkMode"
              />
            </div>
          </div>

          <q-input
            v-model="form.address"
            label="Address"
            outlined
            class="q-mt-md"
            hint="Full address of your property"
            :dark="isDarkMode"
          />

          <!-- Additional Information -->
          <q-separator class="q-my-lg" />
          
          <h3 class="text-h6 text-weight-medium q-mb-md" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Additional Information
          </h3>
          
          <q-input
            v-model="form.website"
            label="Website"
            outlined
            hint="Your property's website URL"
            :dark="isDarkMode"
          />

          <q-input
            v-model="form.description"
            label="Description"
            type="textarea"
            outlined
            rows="3"
            class="q-mt-md"
            hint="Brief description of your property (optional)"
            :dark="isDarkMode"
          />

          <!-- Terms and Conditions -->
          <q-separator class="q-my-lg" />
          
          <div class="q-gutter-sm">
            <q-checkbox
              v-model="form.terms_accepted"
              :rules="[val => !!val || 'You must accept the Terms of Service']"
              :dark="isDarkMode"
            >
              <span class="text-body2">
                I accept the 
                <a href="#" class="text-primary text-decoration-none">Terms of Service</a>
              </span>
            </q-checkbox>

            <q-checkbox
              v-model="form.privacy_accepted"
              :rules="[val => !!val || 'You must accept the Privacy Policy']"
              :dark="isDarkMode"
            >
              <span class="text-body2">
                I accept the 
                <a href="#" class="text-primary text-decoration-none">Privacy Policy</a>
              </span>
            </q-checkbox>

            <q-checkbox 
              v-model="form.marketing_consent"
              :dark="isDarkMode"
            >
              <span class="text-body2">
                I would like to receive marketing emails and updates about new features
              </span>
            </q-checkbox>
          </div>

          <!-- Error Display -->
          <q-banner 
            v-if="error" 
            class="q-mt-md" 
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
  name: '',
  subdomain: '',
  domain: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  company_size: '',
  property_type: '',
  rooms_count: null,
  country: '',
  city: '',
  address: '',
  website: '',
  description: '',
  terms_accepted: false,
  privacy_accepted: false,
  marketing_consent: false
})

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const config = computed(() => onboardingStore.config)

const propertyTypeOptions = computed(() => {
  if (!config.value?.property_types) return []
  return Object.entries(config.value.property_types).map(([value, label]) => ({
    label,
    value
  }))
})

const companySizeOptions = computed(() => {
  if (!config.value?.company_sizes) return []
  return Object.entries(config.value.company_sizes).map(([value, label]) => ({
    label,
    value
  }))
})

const countryOptions = ref([])
const allCountries = computed(() => {
  if (!config.value?.countries) return []
  return Object.entries(config.value.countries).map(([value, label]) => ({
    label,
    value
  }))
})

// Watch for config changes and update country options
watch(allCountries, (newCountries) => {
  countryOptions.value = newCountries
}, { immediate: true })

const filterCountries = (val, update) => {
  update(() => {
    if (val === '') {
      countryOptions.value = allCountries.value
    } else {
      const needle = val.toLowerCase()
      countryOptions.value = allCountries.value.filter(
        country => country.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const onSubdomainChange = (val) => {
  // Convert to lowercase and replace spaces with hyphens
  form.value.subdomain = val.toLowerCase().replace(/\s+/g, '-')
}

const onSubmit = async () => {
  const success = await onboardingStore.processStep1(form.value)
  if (success) {
    router.push('/onboarding/step2')
  }
}

const goBack = () => {
  router.push('/onboarding')
}

onMounted(async () => {
  // Initialize if not already done
  if (!onboardingStore.config) {
    await onboardingStore.initialize()
  }
  
  // Load existing step data
  await onboardingStore.loadStepData(1)
  
  // Populate form with existing data
  if (Object.keys(onboardingStore.step1Data).length > 0) {
    Object.assign(form.value, onboardingStore.step1Data)
  }
})
</script>