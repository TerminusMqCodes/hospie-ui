<template>
  <q-card-section>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="form.name"
        :label="$t('pages.auth.register.firstName')"
        :rules="[val => !!val || $t('pages.auth.register.firstNameRequired')]"
        :loading="authStore.loading"
      />
      
      <q-input
        filled
        v-model="form.email"
        :label="$t('pages.auth.register.email')"
        type="email"
        :rules="[val => !!val || $t('pages.auth.login.emailRequired'), val => isValidEmail(val) || $t('pages.user_profile.validEmail')]"
        :loading="authStore.loading"
      />
      
      <q-input
        filled
        v-model="form.password"
        :label="$t('pages.auth.register.password')"
        :type="showPassword ? 'text' : 'password'"
        :rules="[val => !!val || $t('pages.auth.login.passwordRequired'), val => val.length >= 8 || $t('pages.user_profile.passwordMinLength')]"
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
        :label="$t('pages.auth.register.confirmPassword')"
        :type="showPasswordConfirm ? 'text' : 'password'"
        :rules="[val => !!val || $t('pages.user_profile.confirmPasswordRequired'), val => val === form.password || $t('pages.user_profile.passwordsNotMatch')]"
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
          :label="$t('pages.auth.register.registerButton')"
          type="submit"
          :loading="authStore.loading"
        />
      </div>

      <div class="text-center q-pt-lg">
        <q-btn 
          flat 
          no-caps 
          color="grey-6" 
          :label="`${$t('pages.auth.register.alreadyHaveAccount')} ${$t('pages.auth.register.signIn')}`" 
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
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const { t: $t } = useI18n()

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