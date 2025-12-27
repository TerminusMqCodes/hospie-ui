<template>
  <q-card-section>
    <div class="text-center q-pb-lg">
      <div class="text-h6">Forgot Password</div>
      <div class="text-caption text-grey-7">Enter your email to receive a password reset link</div>
    </div>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="form.email"
        label="Email"
        type="email"
        :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Please enter a valid email']"
        :loading="authStore.loading"
      />

      <div v-if="authStore.error" class="text-negative text-center">
        {{ authStore.error }}
      </div>

      <div v-if="successMessage" class="text-positive text-center">
        {{ successMessage }}
      </div>

      <div>
        <q-btn
          unelevated
          color="primary"
          size="lg"
          class="full-width"
          label="Send Reset Link"
          type="submit"
          :loading="authStore.loading"
          :disable="!!successMessage"
        />
      </div>

      <div class="text-center q-pt-lg">
        <q-btn 
          flat 
          no-caps 
          color="grey-6" 
          label="Back to Login" 
          @click="$router.push('/login')"
        />
      </div>
    </q-form>
  </q-card-section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: ''
})

const successMessage = ref('')

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const onSubmit = async () => {
  try {
    await authStore.forgotPassword(form.value.email)

    successMessage.value = 'Password reset link sent to your email!'
    
    $q.notify({
      type: 'positive',
      message: 'Password reset link sent successfully!',
      position: 'top'
    })

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: authStore.error || 'Failed to send reset link',
      position: 'top'
    })
  }
}

onMounted(() => {
  // Clear any previous errors
  authStore.clearError()
})
</script>