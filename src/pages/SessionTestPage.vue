<template>
  <q-page class="q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="session-test-card">
          <q-card-section class="text-center">
            <q-icon name="security" size="64px" color="primary" class="q-mb-md" />
            <h4 class="text-h4 q-mb-sm">Session Lock Test</h4>
            <p class="text-grey-7">
              Test the automatic and manual session lock functionality
            </p>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="q-gutter-md">
              <!-- Session Status -->
              <q-card flat bordered class="status-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="info" class="q-mr-sm" />
                    Session Status
                  </div>
                  
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-chip 
                        :color="sessionStore.isLocked ? 'negative' : 'positive'"
                        text-color="white"
                        icon="lock"
                      >
                        {{ sessionStore.isLocked ? 'LOCKED' : 'ACTIVE' }}
                      </q-chip>
                    </div>
                    
                    <div class="col">
                      <div class="text-caption text-grey-7">Last Activity</div>
                      <div class="text-body2">{{ formatLastActivity }}</div>
                    </div>
                  </div>

                  <div v-if="!sessionStore.isLocked" class="q-mt-md">
                    <div class="text-caption text-grey-7">Time until timeout</div>
                    <q-linear-progress 
                      :value="timeoutProgress" 
                      color="primary"
                      size="8px"
                      class="q-mt-xs"
                    />
                    <div class="text-body2 q-mt-xs">
                      {{ Math.ceil((sessionStore.timeoutMinutes * 60 - elapsedSeconds) / 60) }} minutes remaining
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Settings -->
              <q-card flat bordered class="settings-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="settings" class="q-mr-sm" />
                    Session Settings
                  </div>
                  
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="timeoutMinutes"
                        type="number"
                        label="Timeout (minutes)"
                        outlined
                        dense
                        min="1"
                        max="60"
                        @update:model-value="updateSettings"
                      />
                    </div>
                    
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="warningMinutes"
                        type="number"
                        label="Warning (minutes)"
                        outlined
                        dense
                        min="1"
                        :max="timeoutMinutes - 1"
                        @update:model-value="updateSettings"
                      />
                    </div>
                  </div>

                  <div class="q-mt-md">
                    <q-toggle
                      v-model="autoLockEnabled"
                      label="Auto-lock enabled"
                      @update:model-value="updateSettings"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Test Actions -->
              <q-card flat bordered class="actions-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="play_arrow" class="q-mr-sm" />
                    Test Actions
                  </div>
                  
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-btn
                        color="negative"
                        icon="lock"
                        label="Manual Lock"
                        @click="handleManualLock"
                        :disable="sessionStore.isLocked"
                        class="full-width"
                      />
                    </div>
                    
                    <div class="col-12 col-sm-6">
                      <q-btn
                        color="warning"
                        icon="warning"
                        label="Trigger Warning"
                        @click="triggerWarning"
                        :disable="sessionStore.isLocked"
                        class="full-width"
                      />
                    </div>
                  </div>

                  <div class="q-mt-md">
                    <q-btn
                      color="info"
                      icon="refresh"
                      label="Simulate Activity"
                      @click="simulateActivity"
                      :disable="sessionStore.isLocked"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Instructions -->
              <q-card flat bordered class="instructions-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="help" class="q-mr-sm" />
                    How to Test
                  </div>
                  
                  <q-list>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="timer" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Automatic Lock</q-item-label>
                        <q-item-label caption>
                          Wait {{ timeoutMinutes }} minutes without any activity to see automatic lock
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="warning" color="warning" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Warning Dialog</q-item-label>
                        <q-item-label caption>
                          You'll get a warning {{ warningMinutes }} minute(s) before automatic lock
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="touch_app" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Activity Tracking</q-item-label>
                        <q-item-label caption>
                          Mouse movement, clicks, keyboard input, and scrolling reset the timer
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="lock" color="negative" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Manual Lock</q-item-label>
                        <q-item-label caption>
                          Use the "Manual Lock" button or the lock option in the user menu
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useSessionStore } from 'src/stores/session'

const $q = useQuasar()
const sessionStore = useSessionStore()

// Reactive data
const timeoutMinutes = ref(sessionStore.timeoutMinutes)
const warningMinutes = ref(sessionStore.warningMinutes)
const autoLockEnabled = ref(sessionStore.autoLockEnabled)
const elapsedSeconds = ref(0)
const updateInterval = ref(null)

// Computed properties
const formatLastActivity = computed(() => {
  if (!sessionStore.lastActivity) return 'Unknown'
  return date.formatDate(new Date(sessionStore.lastActivity), 'HH:mm:ss')
})

const timeoutProgress = computed(() => {
  const totalSeconds = sessionStore.timeoutMinutes * 60
  return Math.min(1, elapsedSeconds.value / totalSeconds)
})

// Methods
const updateSettings = () => {
  sessionStore.updateSettings({
    timeoutMinutes: timeoutMinutes.value,
    warningMinutes: warningMinutes.value,
    autoLockEnabled: autoLockEnabled.value
  })
}

const handleManualLock = async () => {
  try {
    await sessionStore.lockSession('manual')
    $q.notify({
      type: 'info',
      message: 'Session locked manually',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to lock session',
      position: 'top'
    })
  }
}

const triggerWarning = () => {
  // Manually trigger warning for testing
  sessionStore.showWarningDialog()
  $q.notify({
    type: 'warning',
    message: 'Warning dialog triggered for testing',
    position: 'top'
  })
}

const simulateActivity = () => {
  sessionStore.handleActivity()
  elapsedSeconds.value = 0
  $q.notify({
    type: 'positive',
    message: 'Activity simulated - timer reset',
    position: 'top'
  })
}

const updateElapsedTime = () => {
  if (!sessionStore.isLocked && sessionStore.lastActivity) {
    const now = Date.now()
    const lastActivity = new Date(sessionStore.lastActivity).getTime()
    elapsedSeconds.value = Math.floor((now - lastActivity) / 1000)
  }
}

// Lifecycle
onMounted(() => {
  // Update elapsed time every second
  updateInterval.value = setInterval(updateElapsedTime, 1000)
  updateElapsedTime()
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style lang="scss" scoped>
.session-test-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-card,
.settings-card,
.actions-card,
.instructions-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.q-chip {
  font-weight: 600;
  font-size: 0.9rem;
}

.q-btn {
  font-weight: 500;
  border-radius: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.q-linear-progress {
  border-radius: 4px;
}

.q-list .q-item {
  border-radius: 8px;
  margin-bottom: 4px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}
</style>