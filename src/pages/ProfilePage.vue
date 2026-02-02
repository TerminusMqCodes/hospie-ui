<template>
  <q-page class="q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-lg">{{ $t('pages.user_profile.title') }}</div>
            
            <q-form @submit="onUpdateProfile" class="q-gutter-md">
              <q-input
                filled
                v-model="form.name"
                :label="$t('pages.user_profile.fullName')"
                :rules="[val => !!val || $t('pages.user_profile.nameRequired')]"
                :loading="loading"
              />
              
              <q-input
                filled
                v-model="form.email"
                :label="$t('pages.user_profile.email')"
                type="email"
                :rules="[val => !!val || $t('pages.user_profile.emailRequired'), val => isValidEmail(val) || $t('pages.user_profile.validEmail')]"
                :loading="loading"
              />

              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  :label="$t('pages.user_profile.updateProfile')"
                  type="submit"
                  :loading="loading"
                />
                <q-btn
                  color="grey-6"
                  :label="$t('actions.cancel')"
                  outline
                  @click="resetForm"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Change Password Section -->
        <q-card class="q-mt-lg">
          <q-card-section>
            <div class="text-h6 q-mb-lg">{{ $t('pages.user_profile.changePassword') }}</div>
            
            <q-form @submit="onChangePassword" class="q-gutter-md">
              <q-input
                filled
                v-model="passwordForm.currentPassword"
                :label="$t('pages.user_profile.currentPassword')"
                :type="showCurrentPassword ? 'text' : 'password'"
                :rules="[val => !!val || $t('pages.user_profile.currentPasswordRequired')]"
                :loading="passwordLoading"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showCurrentPassword = !showCurrentPassword"
                  />
                </template>
              </q-input>
              
              <q-input
                filled
                v-model="passwordForm.newPassword"
                :label="$t('pages.user_profile.newPassword')"
                :type="showNewPassword ? 'text' : 'password'"
                :rules="[val => !!val || $t('pages.user_profile.newPasswordRequired'), val => val.length >= 8 || $t('pages.user_profile.passwordMinLength')]"
                :loading="passwordLoading"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showNewPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>

              <q-input
                filled
                v-model="passwordForm.confirmPassword"
                :label="$t('pages.user_profile.confirmPassword')"
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="[val => !!val || $t('pages.user_profile.confirmPasswordRequired'), val => val === passwordForm.newPassword || $t('pages.user_profile.passwordsNotMatch')]"
                :loading="passwordLoading"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>

              <div class="row q-gutter-sm">
                <q-btn
                  color="secondary"
                  :label="$t('pages.user_profile.changePassword')"
                  type="submit"
                  :loading="passwordLoading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Account Actions -->
        <q-card class="q-mt-lg">
          <q-card-section>
            <div class="text-h6 q-mb-lg">{{ $t('pages.user_profile.accountActions') }}</div>
            
            <div class="row q-gutter-sm">
              <q-btn
                color="warning"
                :label="$t('pages.user_profile.logoutAllDevices')"
                outline
                @click="onLogoutAll"
                :loading="logoutLoading"
              />
              <q-btn
                color="negative"
                :label="$t('navigation.logout')"
                outline
                @click="onLogout"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
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
const { t } = useI18n()

const loading = ref(false)
const passwordLoading = ref(false)
const logoutLoading = ref(false)

const form = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const resetForm = () => {
  form.value.name = authStore.user?.name || ''
  form.value.email = authStore.user?.email || ''
}

const onUpdateProfile = async () => {
  loading.value = true
  try {
    // This would be an API call to update profile
    // For now, just show success message
    $q.notify({
      type: 'positive',
      message: t('pages.user_profile.profileUpdated'),
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.user_profile.profileUpdateFailed'),
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onChangePassword = async () => {
  passwordLoading.value = true
  try {
    // This would be an API call to change password
    // For now, just show success message
    $q.notify({
      type: 'positive',
      message: t('pages.user_profile.passwordChanged'),
      position: 'top'
    })
    
    // Reset password form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.user_profile.passwordChangeFailed'),
      position: 'top'
    })
  } finally {
    passwordLoading.value = false
  }
}

const onLogout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: t('notifications.logoutSuccess'),
      position: 'top'
    })
    router.push('/login')
  } catch {
    $q.notify({
      type: 'negative',
      message: t('notifications.logoutFailed'),
      position: 'top'
    })
  }
}

const onLogoutAll = async () => {
  logoutLoading.value = true
  try {
    await authStore.logoutAll()
    $q.notify({
      type: 'positive',
      message: t('pages.user_profile.loggedOutAllDevices'),
      position: 'top'
    })
    router.push('/login')
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.user_profile.logoutAllFailed'),
      position: 'top'
    })
  } finally {
    logoutLoading.value = false
  }
}

onMounted(() => {
  resetForm()
})
</script>