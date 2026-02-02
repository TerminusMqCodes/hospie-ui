<template>
  <q-card-section>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="form.email"
        :label="$t('pages.auth.login.email')"
        type="email"
        :rules="[val => !!val || $t('pages.auth.login.emailRequired'), val => isValidEmail(val) || $t('pages.user_profile.validEmail')]"
        :loading="authStore.loading"
      />
      
      <q-input
        filled
        v-model="form.password"
        :label="$t('pages.auth.login.password')"
        :type="showPassword ? 'text' : 'password'"
        :rules="[val => !!val || $t('pages.auth.login.passwordRequired')]"
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
        <q-checkbox v-model="form.remember" :label="$t('pages.auth.login.rememberMe')" />
        <q-btn 
          flat 
          no-caps 
          color="primary" 
          :label="$t('pages.auth.login.forgotPassword')" 
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
          :label="$t('pages.auth.login.loginButton')"
          type="submit"
          :loading="authStore.loading"
        />
      </div>

      <div class="text-center q-pt-lg">
        <q-btn 
          flat 
          no-caps 
          color="grey-6" 
          :label="`${$t('pages.auth.login.noAccount')} ${$t('pages.auth.login.signUp')}`" 
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
import { useI18n } from 'vue-i18n'
import ApiConnectionTest from 'src/components/ApiConnectionTest.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t: $t } = useI18n()

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