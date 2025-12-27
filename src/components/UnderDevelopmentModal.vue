<template>
  <q-dialog v-model="showModal" persistent>
    <q-card class="under-development-card" style="min-width: 400px">
      <q-card-section class="text-center q-pb-none">
        <q-icon 
          name="construction" 
          size="64px" 
          color="warning" 
          class="q-mb-md"
        />
        <div class="text-h6 text-weight-bold q-mb-sm">
          Fejlesztés alatt
        </div>
        <div class="text-subtitle2 text-grey-7">
          {{ featureName }}
        </div>
      </q-card-section>

      <q-card-section class="text-center">
        <p class="text-body2 q-mb-md">
          Ez a funkció jelenleg fejlesztés alatt áll. Hamarosan elérhető lesz!
        </p>
        <div class="row items-center justify-center q-gutter-sm q-mb-md">
          <q-icon name="schedule" size="16px" color="info" />
          <span class="text-caption text-info">
            Várható megjelenés: {{ expectedDate }}
          </span>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pt-none">
        <q-btn 
          flat 
          label="Értesítés kérése" 
          color="primary" 
          icon="notifications"
          @click="requestNotification"
          class="q-mr-sm"
        />
        <q-btn 
          unelevated 
          label="Rendben" 
          color="primary" 
          @click="closeModal"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'UnderDevelopmentModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    featureName: {
      type: String,
      default: 'Ez a funkció'
    },
    expectedDate: {
      type: String,
      default: '2026.01.01.'
    }
  },

  emits: ['update:modelValue', 'notification-requested'],

  setup(props, { emit }) {
    const showModal = ref(props.modelValue)

    watch(() => props.modelValue, (newValue) => {
      showModal.value = newValue
    })

    watch(showModal, (newValue) => {
      emit('update:modelValue', newValue)
    })

    const closeModal = () => {
      showModal.value = false
    }

    const requestNotification = () => {
      emit('notification-requested', props.featureName)
      // Itt lehet implementálni az értesítés kérés logikáját
      closeModal()
    }

    return {
      showModal,
      closeModal,
      requestNotification
    }
  }
}
</script>

<style lang="scss" scoped>
.under-development-card {
  border-radius: 12px;
  
  .q-icon {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>