<template>
  <q-card
    :class="[
      'dashboard-widget',
      { 'widget-loading': loading },
      `widget-size-${size}`,
      customClass
    ]"
    :style="customStyle"
  >
    <q-card-section class="widget-header" v-if="showHeader">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="widget-title">{{ title }}</div>
          <div class="widget-subtitle" v-if="subtitle">{{ subtitle }}</div>
        </div>
        <div class="col-auto">
          <q-btn-group flat v-if="actions.length > 0">
            <q-btn
              v-for="action in actions"
              :key="action.name"
              :icon="action.icon"
              :label="action.label"
              flat
              dense
              @click="$emit('action', action.name)"
              :tooltip="action.tooltip"
            />
          </q-btn-group>
          <q-btn
            v-if="refreshable"
            icon="refresh"
            flat
            dense
            @click="$emit('refresh')"
            :loading="loading"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator v-if="showHeader" />

    <q-card-section class="widget-content" :class="contentClass">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <div v-if="error" class="widget-error">
        <q-icon name="error" size="md" color="negative" />
        <div class="error-message">{{ error }}</div>
        <q-btn
          label="Retry"
          color="primary"
          outline
          @click="$emit('retry')"
          class="q-mt-md"
        />
      </div>

      <slot v-else-if="!loading" />
    </q-card-section>

    <q-card-actions v-if="$slots.actions" align="right">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<script setup>

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  loading: {
    type: Boolean,
    default: false
  },
  error: String,
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'extra-large'].includes(value)
  },
  refreshable: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  actions: {
    type: Array,
    default: () => []
  },
  customClass: String,
  customStyle: Object,
  contentClass: String
})

defineEmits(['refresh', 'retry', 'action'])
</script>

<style lang="scss" scoped>
.dashboard-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.widget-loading {
    opacity: 0.8;
  }

  .widget-header {
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .widget-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--q-primary);
    }

    .widget-subtitle {
      font-size: 0.875rem;
      color: var(--q-dark);
      opacity: 0.7;
      margin-top: 2px;
    }
  }

  .widget-content {
    flex: 1;
    position: relative;
    padding: 16px;

    .widget-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;

      .error-message {
        margin-top: 8px;
        color: var(--q-negative);
        font-size: 0.875rem;
      }
    }
  }

  &.widget-size-small {
    min-height: 200px;
  }

  &.widget-size-medium {
    min-height: 300px;
  }

  &.widget-size-large {
    min-height: 400px;
  }

  &.widget-size-extra-large {
    min-height: 500px;
  }
}

.body--dark .dashboard-widget {
  .widget-header {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>