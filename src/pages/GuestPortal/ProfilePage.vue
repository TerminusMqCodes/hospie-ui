<template>
  <q-page class="q-pa-md" :class="{ 'bg-grey-9': $q.dark.isActive, 'bg-grey-1': !$q.dark.isActive }">
    <div class="row q-gutter-md">
      <!-- Profile Header -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h5 q-mb-md">
              <q-icon name="person" class="q-mr-sm" />
              My Profile
            </div>
            <div class="text-subtitle2" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
              Manage your personal information and preferences
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Personal Information -->
      <div class="col-md-8 col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h6 q-mb-md">Personal Information</div>
            
            <q-form @submit="updateProfile" class="q-gutter-md">
              <div class="row q-gutter-md">
                <q-input
                  v-model="profileForm.first_name"
                  label="First Name"
                  outlined
                  class="col"
                  :rules="[val => !!val || 'First name is required']"
                />
                <q-input
                  v-model="profileForm.last_name"
                  label="Last Name"
                  outlined
                  class="col"
                  :rules="[val => !!val || 'Last name is required']"
                />
              </div>

              <q-input
                v-model="profileForm.email"
                label="Email Address"
                type="email"
                outlined
                readonly
                hint="Email cannot be changed. Contact front desk if needed."
              />

              <q-input
                v-model="profileForm.phone"
                label="Phone Number"
                outlined
                mask="(###) ###-####"
                unmasked-value
              />

              <q-input
                v-model="profileForm.date_of_birth"
                label="Date of Birth"
                type="date"
                outlined
              />

              <div class="row q-gutter-md">
                <q-input
                  v-model="profileForm.address"
                  label="Address"
                  outlined
                  class="col-12"
                />
                <q-input
                  v-model="profileForm.city"
                  label="City"
                  outlined
                  class="col"
                />
                <q-input
                  v-model="profileForm.country"
                  label="Country"
                  outlined
                  class="col"
                />
              </div>

              <div class="row q-gutter-md">
                <q-input
                  v-model="profileForm.emergency_contact_name"
                  label="Emergency Contact Name"
                  outlined
                  class="col"
                />
                <q-input
                  v-model="profileForm.emergency_contact_phone"
                  label="Emergency Contact Phone"
                  outlined
                  class="col"
                  mask="(###) ###-####"
                />
              </div>

              <div class="row q-gutter-md">
                <q-select
                  v-model="profileForm.preferred_language"
                  :options="languageOptions"
                  label="Preferred Language"
                  outlined
                  emit-value
                  map-options
                  class="col"
                />
                <q-select
                  v-model="profileForm.preferred_currency"
                  :options="currencyOptions"
                  label="Preferred Currency"
                  outlined
                  emit-value
                  map-options
                  class="col"
                />
              </div>

              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  label="Update Profile"
                  color="primary"
                  :loading="profileLoading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Preferences & Settings -->
      <div class="col-md-4 col-12">
        <q-card class="q-mb-md" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h6 q-mb-md">Room Preferences</div>
            
            <q-form @submit="updatePreferences">
              <q-select
                v-model="preferencesForm.room_preferences"
                :options="roomPreferenceOptions"
                label="Room Preferences"
                outlined
                multiple
                use-chips
                emit-value
                map-options
              />

              <q-select
                v-model="preferencesForm.dietary_restrictions"
                :options="dietaryOptions"
                label="Dietary Restrictions"
                outlined
                multiple
                use-chips
                emit-value
                map-options
                class="q-mt-md"
              />

              <q-select
                v-model="preferencesForm.accessibility_needs"
                :options="accessibilityOptions"
                label="Accessibility Needs"
                outlined
                multiple
                use-chips
                emit-value
                map-options
                class="q-mt-md"
              />

              <q-input
                v-model="preferencesForm.special_requests"
                label="Special Requests"
                type="textarea"
                outlined
                rows="3"
                class="q-mt-md"
                hint="Any additional requests or notes"
              />

              <div class="q-mt-md">
                <q-btn
                  type="submit"
                  label="Update Preferences"
                  color="secondary"
                  :loading="preferencesLoading"
                  size="sm"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Communication Preferences -->
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h6 q-mb-md">Communication Preferences</div>
            
            <q-form @submit="updateCommunicationPreferences">
              <q-toggle
                v-model="communicationForm.email_notifications"
                label="Email Notifications"
                class="q-mb-sm"
              />
              
              <q-toggle
                v-model="communicationForm.sms_notifications"
                label="SMS Notifications"
                class="q-mb-sm"
              />
              
              <q-toggle
                v-model="communicationForm.marketing_emails"
                label="Marketing Emails"
                class="q-mb-sm"
              />
              
              <q-toggle
                v-model="communicationForm.newsletter_subscription"
                label="Newsletter Subscription"
                class="q-mb-md"
              />

              <div>
                <q-btn
                  type="submit"
                  label="Update Communication"
                  color="accent"
                  :loading="communicationLoading"
                  size="sm"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const profileLoading = ref(false)
const preferencesLoading = ref(false)
const communicationLoading = ref(false)

const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  address: '',
  city: '',
  country: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  preferred_language: 'en',
  preferred_currency: 'USD'
})

const preferencesForm = reactive({
  room_preferences: [],
  dietary_restrictions: [],
  accessibility_needs: [],
  special_requests: ''
})

const communicationForm = reactive({
  email_notifications: true,
  sms_notifications: false,
  marketing_emails: false,
  newsletter_subscription: false
})

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' }
]

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' }
]

const roomPreferenceOptions = [
  { label: 'Non-smoking', value: 'non_smoking' },
  { label: 'High floor', value: 'high_floor' },
  { label: 'Ocean view', value: 'ocean_view' },
  { label: 'City view', value: 'city_view' },
  { label: 'Quiet room', value: 'quiet_room' },
  { label: 'Near elevator', value: 'near_elevator' },
  { label: 'Away from elevator', value: 'away_from_elevator' },
  { label: 'King bed', value: 'king_bed' },
  { label: 'Twin beds', value: 'twin_beds' }
]

const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-free', value: 'gluten_free' },
  { label: 'Dairy-free', value: 'dairy_free' },
  { label: 'Nut allergy', value: 'nut_allergy' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'Halal', value: 'halal' }
]

const accessibilityOptions = [
  { label: 'Wheelchair accessible', value: 'wheelchair_accessible' },
  { label: 'Hearing impaired', value: 'hearing_impaired' },
  { label: 'Visual impaired', value: 'visual_impaired' },
  { label: 'Mobility assistance', value: 'mobility_assistance' },
  { label: 'Service animal', value: 'service_animal' }
]

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    const profileData = await guestPortalStore.loadProfile()
    
    // Populate forms with loaded data
    Object.assign(profileForm, profileData.guest)
    Object.assign(preferencesForm, profileData.preferences)
    Object.assign(communicationForm, profileData.communication_preferences)
    
  } catch (error) {
    console.error('Failed to load profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load profile data',
      position: 'top'
    })
  }
}

const updateProfile = async () => {
  profileLoading.value = true
  
  try {
    await guestPortalStore.updateProfile(profileForm)
    
    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    
    const message = error.response?.data?.message || 'Failed to update profile'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    profileLoading.value = false
  }
}

const updatePreferences = async () => {
  preferencesLoading.value = true
  
  try {
    await guestPortalStore.updatePreferences(preferencesForm)
    
    $q.notify({
      type: 'positive',
      message: 'Preferences updated successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Preferences update error:', error)
    
    const message = error.response?.data?.message || 'Failed to update preferences'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    preferencesLoading.value = false
  }
}

const updateCommunicationPreferences = async () => {
  communicationLoading.value = true
  
  try {
    await guestPortalStore.updateCommunicationPreferences(communicationForm)
    
    $q.notify({
      type: 'positive',
      message: 'Communication preferences updated successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Communication preferences update error:', error)
    
    const message = error.response?.data?.message || 'Failed to update communication preferences'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    communicationLoading.value = false
  }
}
</script>