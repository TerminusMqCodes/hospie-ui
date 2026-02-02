<template>
  <q-dialog
    v-model="sessionStore.showWarning"
    persistent
    no-esc-dismiss
    position="top"
    class="session-warning-dialog"
  >
    <q-card class="session-warning-card">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="warning" color="orange" size="md" class="q-mr-sm" />
        <div class="text-h6 text-orange">Session Timeout Warning</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="sessionStore.continueSession()"
        />
      </q-card-section>

      <q-card-section>
        <p class="q-mb-md">
          Your session will expire in 
          <span class="text-weight-bold text-negative">
            {{ sessionStore.timeUntilTimeoutFormatted }}
          </span> 
          due to inactivity.
        </p>
        <p class="text-grey-7 q-mb-none">
          Click anywhere or press any key to continue your session.
        </p>
      </q-card-section>

      <q-card-actions align="center" class="q-pt-none">
        <q-btn
          color="primary"
          @click="sessionStore.continueSession()"
          no-caps
          class="q-px-lg"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          Continue Session
        </q-btn>
      </q-card-actions>

      <!-- Countdown Progress -->
      <q-linear-progress
        :value="progressValue"
        color="orange"
        size="4px"
        class="warning-progress"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useSessionStore } from 'src/stores/session'

const sessionStore = useSessionStore()

// Computed properties
const progressValue = computed(() => {
  const totalWarningTime = sessionStore.warningMinutes * 60
  const remaining = sessionStore.timeUntilTimeout
  return Math.max(0, (totalWarningTime - remaining) / totalWarningTime)
})
</script>

<style lang="scss" scoped>
.session-warning-dialog {
  .q-dialog__inner {
    align-items: flex-start;
    padding-top: 2rem;
  }
}

.session-warning-card {
  min-width: 400px;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: warningSlideIn 0.3s ease-out;
}

@keyframes warningSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 8px 8px;
}

// Mobile responsiveness
@media (max-width: 480px) {
  .session-warning-card {
    min-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
}
</style>