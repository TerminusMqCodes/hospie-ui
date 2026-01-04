<template>
  <q-card-section>
    <q-form @submit="onSubmit" class="q-gutter-md">
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
        :rules="[val => !!val || 'Password is required']"
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

      <div class="row justify-between items-center">
        <q-checkbox v-model="form.remember" label="Remember me" />
        <q-btn 
          flat 
          no-caps 
          color="primary" 
          label="Forgot Password?" 
          @click="$router.push('/forgot-password')"
        />
      </div>

      <div v-if="authStore.error" class="text-negative text-center">
        {{ authStore.error }}
      </div>

      <div>
        <q-btn
          unelevated
          color="primary"
          size="lg"
          class="full-width"
          label="Login"
          type="submit"
          :loading="authStore.loading"
        />
      </div>

      <div class="text-center q-pt-lg">
        <q-btn 
          flat 
          no-caps 
          color="grey-6" 
          label="Don't have an account? Register" 
          @click="$router.push('/register')"
        />
      </div>
    </q-form>
  </q-card-section>
  
  <!-- API Connection Test (Development Only) -->
  <q-separator />
  <q-card-section>
    <ApiConnectionTest />
  </q-card-section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import ApiConnectionTest from 'src/components/ApiConnectionTest.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const onSubmit = async () => {
  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    })

    // Small delay to ensure store is updated
    await new Promise(resolve => setTimeout(resolve, 100))

    // Redirect to intended page or dashboard
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    await router.push(redirect)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

onMounted(() => {
  // Clear any previous errors
  authStore.clearError()
})
</script>