<template>
  <q-page class="q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-lg">User Profile</div>
            
            <q-form @submit="onUpdateProfile" class="q-gutter-md">
              <q-input
                filled
                v-model="form.name"
                label="Full Name"
                :rules="[val => !!val || 'Name is required']"
                :loading="loading"
              />
              
              <q-input
                filled
                v-model="form.email"
                label="Email"
                type="email"
                :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Please enter a valid email']"
                :loading="loading"
              />

              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Update Profile"
                  type="submit"
                  :loading="loading"
                />
                <q-btn
                  color="grey-6"
                  label="Cancel"
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
            <div class="text-h6 q-mb-lg">Change Password</div>
            
            <q-form @submit="onChangePassword" class="q-gutter-md">
              <q-input
                filled
                v-model="passwordForm.currentPassword"
                label="Current Password"
                :type="showCurrentPassword ? 'text' : 'password'"
                :rules="[val => !!val || 'Current password is required']"
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
                label="New Password"
                :type="showNewPassword ? 'text' : 'password'"
                :rules="[val => !!val || 'New password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
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
                label="Confirm New Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="[val => !!val || 'Please confirm your password', val => val === passwordForm.newPassword || 'Passwords do not match']"
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
                  label="Change Password"
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
            <div class="text-h6 q-mb-lg">Account Actions</div>
            
            <div class="row q-gutter-sm">
              <q-btn
                color="warning"
                label="Logout All Devices"
                outline
                @click="onLogoutAll"
                :loading="logoutLoading"
              />
              <q-btn
                color="negative"
                label="Logout"
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

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

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
      message: 'Profile updated successfully!',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile',
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
      message: 'Password changed successfully!',
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
      message: 'Failed to change password',
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
      message: 'Logged out successfully',
      position: 'top'
    })
    router.push('/login')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Logout failed',
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
      message: 'Logged out from all devices successfully',
      position: 'top'
    })
    router.push('/login')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Logout failed',
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