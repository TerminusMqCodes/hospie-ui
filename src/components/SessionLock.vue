<template>
  <q-dialog
    v-model="sessionStore.isLocked"
    persistent
    no-esc-dismiss
    no-backdrop-dismiss
    maximized
    class="session-lock-dialog"
  >
    <q-card class="session-lock-card">
      <div class="session-lock-background">
        <div class="session-lock-content">
          <!-- Lock Icon and Header -->
          <div class="text-center q-mb-xl">
            <q-icon
              name="lock"
              size="80px"
              color="white"
              class="q-mb-md lock-icon"
            />
            <h4 class="text-white q-mb-sm session-title">
              Session Locked
            </h4>
            <p class="text-white-7 session-subtitle">
              {{ sessionStore.getLockReasonText(sessionStore.lockedReason) }}
            </p>
          </div>

          <!-- Unlock Form -->
          <q-card class="unlock-form-card">
            <q-card-section class="q-pa-xl">
              <q-form @submit="handleUnlock" class="q-gutter-md">
                <div class="text-center q-mb-lg">
                  <h6 class="q-ma-none text-grey-8">
                    Enter your password to unlock
                  </h6>
                </div>

                <q-input
                  v-model="password"
                  type="password"
                  label="Password"
                  outlined
                  dense
                  :loading="sessionStore.unlockLoading"
                  :error="!!sessionStore.unlockError"
                  :error-message="sessionStore.unlockError"
                  autocomplete="current-password"
                  class="unlock-password-input"
                  @keyup.enter="handleUnlock"
                  ref="passwordInput"
                >
                  <template v-slot:prepend>
                    <q-icon name="key" />
                  </template>
                </q-input>

                <div class="text-center q-mt-lg">
                  <q-btn
                    type="submit"
                    color="primary"
                    size="lg"
                    :loading="sessionStore.unlockLoading"
                    :disable="!password || sessionStore.unlockLoading"
                    class="unlock-btn"
                    no-caps
                  >
                    <q-icon name="lock_open" class="q-mr-sm" />
                    Unlock Session
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Lock Time Info -->
          <div class="text-center q-mt-lg">
            <p class="text-white-5 text-caption">
              Locked at: {{ formatLockTime }}
            </p>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useSessionStore } from 'src/stores/session'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

const $q = useQuasar()
const sessionStore = useSessionStore()

// Reactive data
const password = ref('')
const passwordInput = ref(null)

// Computed properties
const formatLockTime = computed(() => {
  if (!sessionStore.lockedAt) return 'Unknown'
  return date.formatDate(new Date(sessionStore.lockedAt), 'YYYY-MM-DD HH:mm:ss')
})

// Methods
const handleUnlock = async () => {
  if (!password.value) {
    $q.notify({
      type: 'negative',
      message: 'Please enter your password',
      position: 'top'
    })
    return
  }

  try {
    await sessionStore.unlockSession(password.value)
    
    // Success notification
    $q.notify({
      type: 'positive',
      message: 'Session unlocked successfully!',
      position: 'top'
    })
    
    // Clear password
    password.value = ''
    
  } catch {
    // Error is already handled in the store
    // Focus back to password input
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  }
}

// Focus password input when dialog opens
onMounted(() => {
  if (sessionStore.isLocked) {
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  }
})

// Watch for lock state changes to focus input
watch(() => sessionStore.isLocked, (isLocked) => {
  if (isLocked) {
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  } else {
    // Clear password when unlocked
    password.value = ''
    sessionStore.clearUnlockError()
  }
})
</script>

<style lang="scss" scoped>
.session-lock-dialog {
  .q-dialog__inner {
    padding: 0;
  }
}

.session-lock-card {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.session-lock-background {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.session-lock-content {
  width: 100%;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lock-icon {
  opacity: 0.9;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.session-title {
  font-weight: 600;
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.session-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.unlock-form-card {
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.unlock-password-input {
  :deep(.q-field__control) {
    height: 56px;
  }
  
  :deep(.q-field__native) {
    font-size: 1.1rem;
  }
}

.unlock-btn {
  min-width: 200px;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
  }
}

// Mobile responsiveness
@media (max-width: 480px) {
  .session-lock-background {
    padding: 1rem;
  }
  
  .session-lock-content {
    max-width: 100%;
  }
  
  .session-title {
    font-size: 1.5rem;
  }
  
  .unlock-form-card {
    .q-card-section {
      padding: 1.5rem !important;
    }
  }
}
</style>