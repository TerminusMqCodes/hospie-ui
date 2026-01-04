<template>
  <q-card
    class="mobile-card"
    :class="[
      {
        'clickable': clickable,
        'swipeable': swipeable,
        'elevated': elevated,
        'loading': loading
      },
      cardClass
    ]"
    @click="handleClick"
    v-touch-swipe.horizontal="handleSwipe"
  >
    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Card header -->
    <q-card-section v-if="title || subtitle || $slots.header" class="card-header">
      <slot name="header">
        <div class="text-h6" v-if="title">{{ title }}</div>
        <div class="text-subtitle2 text-grey-6" v-if="subtitle">{{ subtitle }}</div>
      </slot>
    </q-card-section>

    <!-- Card content -->
    <q-card-section class="card-content">
      <slot>
        <div v-if="content">{{ content }}</div>
      </slot>
    </q-card-section>

    <!-- Card actions -->
    <q-card-actions v-if="$slots.actions || actions.length > 0" class="card-actions">
      <slot name="actions">
        <q-btn
          v-for="action in actions"
          :key="action.name"
          :color="action.color || 'primary'"
          :flat="action.flat !== false"
          :label="action.label"
          :icon="action.icon"
          @click="handleAction(action)"
        />
      </slot>
    </q-card-actions>

    <!-- Swipe indicators -->
    <div v-if="swipeable" class="swipe-indicators">
      <q-icon name="swipe" class="swipe-icon" />
    </div>
  </q-card>
</template>

<script setup>
import { useMobile } from '../composables/useMobile'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  },
  swipeable: {
    type: Boolean,
    default: false
  },
  elevated: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  cardClass: {
    type: [String, Array, Object],
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['click', 'swipe', 'action'])

// Composables
const { isMobile, hapticFeedback } = useMobile()

// Methods
const handleClick = (event) => {
  if (props.clickable) {
    if (isMobile.value) {
      hapticFeedback('light')
    }
    emit('click', event)
  }
}

const handleSwipe = ({ direction }) => {
  if (props.swipeable) {
    if (isMobile.value) {
      hapticFeedback('medium')
    }
    emit('swipe', { direction })
  }
}

const handleAction = (action) => {
  if (isMobile.value) {
    hapticFeedback('light')
  }
  emit('action', action)
}
</script>

<style lang="scss" scoped>
.mobile-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &.clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.swipeable {
    touch-action: pan-y;
    
    .swipe-indicators {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0.3;
      
      .swipe-icon {
        font-size: 16px;
        color: var(--q-primary);
      }
    }
  }

  &.elevated {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.loading {
    pointer-events: none;
  }

  .card-header {
    padding: 16px 16px 8px 16px;
    
    @media (max-width: 768px) {
      padding: 12px 12px 6px 12px;
    }
  }

  .card-content {
    padding: 8px 16px;
    
    @media (max-width: 768px) {
      padding: 6px 12px;
    }
  }

  .card-actions {
    padding: 8px 16px 16px 16px;
    
    @media (max-width: 768px) {
      padding: 6px 12px 12px 12px;
    }
  }
}

// Dark mode support
.body--dark {
  .mobile-card {
    &.clickable:hover {
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.08);
    }
  }
}

// Animation improvements
@keyframes cardPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.mobile-card.loading {
  animation: cardPulse 2s infinite ease-in-out;
}

// Responsive improvements
@media (max-width: 600px) {
  .mobile-card {
    border-radius: 8px;
    margin: 8px;
  }
}
</style>