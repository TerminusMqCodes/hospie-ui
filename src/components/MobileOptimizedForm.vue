<template>
  <div class="mobile-optimized-form" :class="{ 'keyboard-open': isKeyboardOpen }">
    <q-form @submit="onSubmit" @reset="onReset" class="mobile-form">
      <slot :form-data="formData" :errors="errors" :loading="loading">
        <!-- Default form content if no slot provided -->
        <div class="form-section">
          <q-input
            v-model="formData.name"
            label="Name"
            outlined
            dense
            :error="!!errors.name"
            :error-message="errors.name"
            class="mobile-input"
          />
        </div>
      </slot>
      
      <!-- Sticky form actions for mobile -->
      <div class="form-actions" :class="{ 'sticky': isMobile && stickyActions }">
        <q-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disable="!isFormValid"
          class="submit-btn"
          :class="{ 'full-width': isMobile }"
        >
          <q-icon name="save" class="q-mr-sm" />
          {{ submitLabel }}
        </q-btn>
        
        <q-btn
          v-if="showReset"
          type="reset"
          color="secondary"
          outline
          :disable="loading"
          class="reset-btn"
          :class="{ 'full-width': isMobile }"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          {{ resetLabel }}
        </q-btn>
        
        <q-btn
          v-if="showCancel"
          color="grey"
          flat
          :disable="loading"
          @click="onCancel"
          class="cancel-btn"
          :class="{ 'full-width': isMobile }"
        >
          <q-icon name="close" class="q-mr-sm" />
          {{ cancelLabel }}
        </q-btn>
      </div>
    </q-form>
    
    <!-- Mobile keyboard spacer -->
    <div v-if="isMobile && isKeyboardOpen" class="keyboard-spacer"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useMobile } from '../composables/useMobile'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  submitLabel: {
    type: String,
    default: 'Save'
  },
  resetLabel: {
    type: String,
    default: 'Reset'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  stickyActions: {
    type: Boolean,
    default: true
  },
  autoFocus: {
    type: Boolean,
    default: false
  },
  validateOnChange: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit', 'reset', 'cancel', 'validate'])

// Composables
const { isMobile, isKeyboardOpen, hapticFeedback } = useMobile()

// Reactive state
const formData = ref({ ...props.modelValue })
const isFormValid = ref(true)


// Watch for external model changes
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue }
}, { deep: true })

// Watch for form data changes
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
  
  if (props.validateOnChange) {
    validateForm()
  }
}, { deep: true })

// Methods
const validateForm = () => {
  // Basic validation - can be extended
  const hasErrors = Object.keys(props.errors).length > 0
  const hasRequiredFields = Object.values(formData.value).some(value => 
    value !== null && value !== undefined && value !== ''
  )
  
  isFormValid.value = !hasErrors && hasRequiredFields
  emit('validate', { valid: isFormValid.value, data: formData.value })
}

const onSubmit = () => {
  if (isMobile.value) {
    hapticFeedback('success')
  }
  
  emit('submit', formData.value)
}

const onReset = () => {
  if (isMobile.value) {
    hapticFeedback('light')
  }
  
  formData.value = {}
  emit('reset')
}

const onCancel = () => {
  if (isMobile.value) {
    hapticFeedback('light')
  }
  
  emit('cancel')
}

const focusFirstInput = () => {
  if (props.autoFocus) {
    const firstInput = document.querySelector('.mobile-optimized-form input, .mobile-optimized-form textarea')
    if (firstInput) {
      firstInput.focus()
    }
  }
}

// Handle keyboard events for better mobile UX
const handleKeyboardEvents = (event) => {
  if (isMobile.value) {
    // Handle Enter key on mobile
    if (event.key === 'Enter' && !event.shiftKey) {
      const activeElement = document.activeElement
      if (activeElement && activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault()
        
        // Find next input or submit if last
        const inputs = Array.from(document.querySelectorAll('.mobile-optimized-form input, .mobile-optimized-form textarea, .mobile-optimized-form select'))
        const currentIndex = inputs.indexOf(activeElement)
        
        if (currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus()
        } else {
          // Submit form if on last input
          onSubmit()
        }
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  focusFirstInput()
  document.addEventListener('keydown', handleKeyboardEvents)
  validateForm()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardEvents)
})

// Expose methods
defineExpose({
  validate: validateForm,
  reset: onReset,
  focus: focusFirstInput
})
</script>

<style lang="scss" scoped>
.mobile-optimized-form {
  .mobile-form {
    padding-bottom: 80px; // Space for sticky actions
    
    .form-section {
      margin-bottom: 16px;
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
    }
    
    .mobile-input {
      :deep(.q-field__control) {
        min-height: 48px; // Touch-friendly height
        
        @media (max-width: 768px) {
          min-height: 44px;
        }
      }
      
      :deep(input) {
        font-size: 16px; // Prevents zoom on iOS
      }
    }
  }
  
  .form-actions {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: white;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    
    &.sticky {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
      
      // Safe area support
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 8px;
      
      .q-btn {
        min-height: 44px;
        
        &.full-width {
          width: 100%;
        }
      }
    }
  }
  
  .keyboard-spacer {
    height: 80px; // Additional space when keyboard is open
  }
  
  &.keyboard-open {
    .form-actions.sticky {
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }
  }
}

// Dark mode support
.body--dark {
  .mobile-optimized-form {
    .form-actions {
      background: var(--q-color-dark);
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}

// Animation improvements
.submit-btn {
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.reset-btn, .cancel-btn {
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

// Loading state improvements
.mobile-form {
  &.loading {
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>