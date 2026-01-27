<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="liquid-glass-card" style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('backup.createBackup') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="createBackup" class="q-gutter-md">
          <q-select
            v-model="form.backup_type"
            :options="backupTypeOptions"
            :label="$t('backup.backupType')"
            outlined
            :rules="[val => !!val || $t('validation.required')]"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="getTypeIcon(scope.opt.value)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Export Options -->
          <div v-if="form.backup_type?.value === 'export'" class="q-gutter-md">
            <q-separator />
            <div class="text-subtitle2">{{ $t('backup.exportOptions') }}</div>
            
            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="form.options.date_from"
                  :label="$t('backup.dateFrom')"
                  outlined
                  type="date"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="form.options.date_to"
                  :label="$t('backup.dateTo')"
                  outlined
                  type="date"
                />
              </div>
            </div>

            <q-select
              v-model="form.options.tables"
              :options="tableOptions"
              :label="$t('backup.tablesToExport')"
              outlined
              multiple
              use-chips
              clearable
              :hint="$t('backup.tablesHint')"
            />
          </div>

          <!-- Incremental Options -->
          <div v-if="form.backup_type?.value === 'incremental'" class="q-gutter-md">
            <q-separator />
            <div class="text-subtitle2">{{ $t('backup.incrementalOptions') }}</div>
            
            <q-input
              v-model="form.options.since"
              :label="$t('backup.sinceDate')"
              outlined
              type="datetime-local"
              :hint="$t('backup.sinceHint')"
            />
          </div>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              :label="$t('common.cancel')"
              color="grey"
              flat
              v-close-popup
            />
            <q-btn
              :label="$t('backup.create')"
              color="primary"
              type="submit"
              :loading="loading"
              :disable="!form.backup_type"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { backupService } from 'src/services/backupService'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const { t } = useI18n()
const $q = useQuasar()

const loading = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  backup_type: null,
  options: {
    date_from: '',
    date_to: '',
    tables: [],
    since: ''
  }
})

const backupTypeOptions = computed(() => [
  {
    label: t('backup.types.full'),
    value: 'full',
    description: t('backup.typeDescriptions.full')
  },
  {
    label: t('backup.types.incremental'),
    value: 'incremental',
    description: t('backup.typeDescriptions.incremental')
  },
  {
    label: t('backup.types.export'),
    value: 'export',
    description: t('backup.typeDescriptions.export')
  }
])

const tableOptions = computed(() => [
  { label: t('backup.tables.rooms'), value: 'rooms' },
  { label: t('backup.tables.room_types'), value: 'room_types' },
  { label: t('backup.tables.reservations'), value: 'reservations' },
  { label: t('backup.tables.guests'), value: 'guests' },
  { label: t('backup.tables.payments'), value: 'payments' },
  { label: t('backup.tables.invoices'), value: 'invoices' },
  { label: t('backup.tables.events'), value: 'events' },
  { label: t('backup.tables.spa_appointments'), value: 'spa_appointments' },
  { label: t('backup.tables.pos_transactions'), value: 'pos_transactions' },
  { label: t('backup.tables.communication_history'), value: 'communication_history' }
])

const getTypeIcon = (type: string) => {
  const icons = {
    full: 'storage',
    incremental: 'update',
    export: 'file_download'
  }
  return icons[type] || 'backup'
}

const createBackup = async () => {
  loading.value = true
  try {
    const payload = {
      backup_type: form.value.backup_type.value,
      options: {}
    }

    // Add type-specific options
    if (form.value.backup_type.value === 'export') {
      if (form.value.options.date_from) {
        payload.options.date_from = form.value.options.date_from
      }
      if (form.value.options.date_to) {
        payload.options.date_to = form.value.options.date_to
      }
      if (form.value.options.tables?.length) {
        payload.options.tables = form.value.options.tables.map(t => t.value)
      }
    } else if (form.value.backup_type.value === 'incremental') {
      if (form.value.options.since) {
        payload.options.since = form.value.options.since
      }
    }

    await backupService.createBackup(payload)
    
    $q.notify({
      type: 'positive',
      message: t('backup.createSuccess'),
      caption: t('backup.createSuccessCaption')
    })

    emit('created')
    showDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.createFailed'),
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    backup_type: null,
    options: {
      date_from: '',
      date_to: '',
      tables: [],
      since: ''
    }
  }
}

// Reset form when dialog closes
watch(showDialog, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.liquid-glass-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
</style>