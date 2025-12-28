<template>
  <q-card-section>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="form.name"
        label="Full Name"
        :rules="[val => !!val || 'Name is required']"
        :loading="authStore.loading"
      />
      
      <q-input
        filled
        v-model="form.email"
        label="Email"
        type="email"
        :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Please enter a valid email']"
        :loading="authStore.loading"
      />
      
      <q-input
        filled
        v-model="form.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        :rules="[val => !!val || 'Password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
        :loading="authStore.loading"
      >
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-input
        filled
        v-model="form.password_confirmation"
        label="Confirm Password"
        :type="showPasswordConfirm ? 'text' : 'password'"
        :rules="[val => !!val || 'Please confirm your password', val => val === form.password || 'Passwords do not match']"
        :loading="authStore.loading"
      >
        <template v-slot:append>
          <q-icon
            :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPasswordConfirm = !showPasswordConfirm"
          />
        </template>
      </q-input>

      <div v-if="authStore.error" class="text-negative text-center">
        {{ authStore.error }}
      </div>

      <div>
        <q-btn
          unelevated
          color="primary"
          size="lg"
          class="full-width"
          label="Register"
          type="submit"
          :loading="authStore.loading"
        />
      </div>

      <div class="text-center q-pt-lg">
        <q-btn 
          flat 
          no-caps 
          color="grey-6" 
          label="Already have an account? Login" 
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
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const onSubmit = async () => {
  try {
    await authStore.register(form.value)

    $q.notify({
      type: 'positive',
      message: 'Registration successful! Welcome to Hospie PMS!',
      position: 'top'
    })

    // Redirect to dashboard
    router.push('/dashboard')
  } catch {
    $q.notify({
      type: 'negative',
      message: authStore.error || 'Registration failed',
      position: 'top'
    })
  }
}

onMounted(() => {
  // Clear any previous errors
  authStore.clearError()
})
</script>