<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="liquid-glass-card" style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('backup.restoreBackup') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="backup">
        <!-- Backup Info -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">{{ $t('backup.backupInformation') }}</div>
            <div class="row q-gutter-md">
              <div class="col">
                <div class="text-caption text-grey-6">{{ $t('backup.type') }}</div>
                <q-chip
                  :color="getTypeColor(backup.backup_type)"
                  text-color="white"
                  :label="$t(`backup.types.${backup.backup_type}`)"
                  size="sm"
                />
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">{{ $t('backup.fileSize') }}</div>
                <div>{{ backup.formatted_file_size }}</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">{{ $t('backup.createdAt') }}</div>
                <div>{{ formatDate(backup.created_at) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Warning -->
        <q-banner class="bg-warning text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          <div class="text-weight-bold">{{ $t('backup.restoreWarning') }}</div>
          <div>{{ $t('backup.restoreWarningMessage') }}</div>
        </q-banner>

        <!-- Restore Options -->
        <q-form @submit="restoreBackup" class="q-gutter-md">
          <q-toggle
            v-model="usePointInTime"
            :label="$t('backup.usePointInTime')"
            color="primary"
          />

          <q-slide-transition>
            <div v-show="usePointInTime">
              <q-input
                v-model="pointInTime"
                :label="$t('backup.pointInTime')"
                outlined
                type="datetime-local"
                :hint="$t('backup.pointInTimeHint')"
                :rules="[
                  val => !usePointInTime || !!val || $t('validation.required'),
                  val => !val || isValidPointInTime(val) || $t('backup.invalidPointInTime')
                ]"
              />
            </div>
          </q-slide-transition>

          <!-- Confirmation -->
          <q-checkbox
            v-model="confirmed"
            :label="$t('backup.confirmRestore')"
            color="primary"
            :rules="[val => !!val || $t('backup.mustConfirm')]"
          />

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              :label="$t('common.cancel')"
              color="grey"
              flat
              v-close-popup
            />
            <q-btn
              :label="$t('backup.restore')"
              color="warning"
              type="submit"
              :loading="loading"
              :disable="!confirmed"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { backupService } from 'src/services/backupService'
import { formatDate } from 'src/utils/formatters'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  backup: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'restored'])

const { t } = useI18n()
const $q = useQuasar()

const loading = ref(false)
const usePointInTime = ref(false)
const pointInTime = ref('')
const confirmed = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const backup = computed(() => props.backup)

const getTypeColor = (type) => {
  const colors = {
    full: 'primary',
    incremental: 'secondary',
    export: 'info'
  }
  return colors[type] || 'grey'
}

const isValidPointInTime = (dateTime) => {
  if (!dateTime || !backup.value) return true
  
  const pointInTimeDate = new Date(dateTime)
  const backupDate = new Date(backup.value.created_at)
  const now = new Date()
  
  return pointInTimeDate <= backupDate && pointInTimeDate <= now
}

const restoreBackup = async () => {
  if (!backup.value) return

  loading.value = true
  try {
    const payload = {
      backup_id: backup.value.id,
      point_in_time: usePointInTime.value ? pointInTime.value : undefined
    }

    await backupService.restoreBackup(payload)
    
    $q.notify({
      type: 'positive',
      message: t('backup.restoreSuccess'),
      caption: t('backup.restoreSuccessCaption')
    })

    emit('restored')
    showDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.restoreFailed'),
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  usePointInTime.value = false
  pointInTime.value = ''
  confirmed.value = false
}

// Reset form when dialog closes
watch(showDialog, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Set default point in time when backup changes
watch(backup, (newBackup) => {
  if (newBackup) {
    // Set default to backup creation time
    const backupDate = new Date(newBackup.created_at)
    pointInTime.value = backupDate.toISOString().slice(0, 16)
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