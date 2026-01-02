<template>
  <q-page class="flex flex-center bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="q-pa-md" style="max-width: 400px; width: 100%">
      <q-card class="q-pa-lg shadow-lg">
        <q-card-section class="text-center">
          <div class="text-h4 text-primary q-mb-md">
            <q-icon name="hotel" size="md" class="q-mr-sm" />
            Guest Portal
          </div>
          <div class="text-subtitle1 text-grey-7 q-mb-lg">
            Access your reservation details
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.email"
              type="email"
              label="Email Address"
              outlined
              :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Please enter a valid email']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="form.confirmation_number"
              label="Confirmation Number"
              outlined
              :rules="[val => !!val || 'Confirmation number is required']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="confirmation_number" />
              </template>
            </q-input>

            <div class="q-mt-lg">
              <q-btn
                type="submit"
                label="Access Portal"
                color="primary"
                size="lg"
                class="full-width"
                :loading="loading"
                :disable="!form.email || !form.confirmation_number"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-caption text-grey-6">
            Need help? Contact our front desk at
            <a href="tel:+1234567890" class="text-primary">+1 (234) 567-890</a>
          </div>
        </q-card-section>
      </q-card>

      <!-- Help Dialog -->
      <q-dialog v-model="showHelp">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Need Help?</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-body2 q-mb-md">
              To access your guest portal, you'll need:
            </div>
            <ul class="text-body2">
              <li>The email address used for your reservation</li>
              <li>Your reservation confirmation number</li>
            </ul>
            <div class="text-body2 q-mt-md">
              You can find your confirmation number in your booking confirmation email
              or by contacting our front desk.
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Got it" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <!-- Help Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="help"
        color="secondary"
        @click="showHelp = true"
        class="shadow-lg"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const router = useRouter()
const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)
const showHelp = ref(false)

const form = reactive({
  email: '',
  confirmation_number: ''
})

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const onSubmit = async () => {
  loading.value = true
  
  try {
    const response = await api.post('/guest-portal/login', form)
    
    if (response.data.success) {
      // Store authentication data
      guestPortalStore.setAuth(response.data.data)
      
      $q.notify({
        type: 'positive',
        message: 'Welcome! Redirecting to your dashboard...',
        position: 'top'
      })
      
      // Redirect to dashboard
      router.push('/guest-portal/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
}

.body--dark .bg-gradient-to-br {
  background: linear-gradient(to bottom right, #1a1a2e, #16213e);
}

.body--dark .q-card {
  background: #2d2d2d;
  color: #ffffff;
}

.body--dark .text-grey-6 {
  color: #9e9e9e !important;
}

.body--dark .text-grey-7 {
  color: #757575 !important;
}
</style>