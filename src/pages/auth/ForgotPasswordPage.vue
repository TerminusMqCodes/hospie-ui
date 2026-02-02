<template>
  <q-card-section>
    <div class="text-center q-pb-lg">
      <div class="text-h6">{{ $t('pages.auth.forgotPassword.title') }}</div>
      <div class="text-caption text-grey-7">{{ $t('pages.auth.forgotPassword.checkEmail') }}</div>
    </div>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="form.email"
        :label="$t('pages.auth.forgotPassword.email')"
        type="email"
        :rules="[val => !!val || $t('pages.auth.login.emailRequired'), val => isValidEmail(val) || $t('pages.user_profile.validEmail')]"
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
          :label="$t('pages.auth.forgotPassword.sendResetLink')"
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
          :label="$t('pages.auth.forgotPassword.backToLogin')" 
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

    successMessage.value = $t('pages.auth.forgotPassword.resetLinkSent')
    
    $q.notify({
      type: 'positive',
      message: $t('pages.auth.forgotPassword.resetLinkSent'),
      position: 'top'
    })

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch {
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