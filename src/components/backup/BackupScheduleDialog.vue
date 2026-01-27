<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="liquid-glass-card" style="min-width: 700px; max-width: 900px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('backup.scheduleManagement') }}</div>
        <q-space />
        <q-btn
          icon="add"
          color="primary"
          flat
          round
          @click="showCreateForm = true"
        >
          <q-tooltip>{{ $t('backup.addSchedule') }}</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Create/Edit Form -->
        <q-slide-transition>
          <q-card v-show="showCreateForm" class="q-mb-md" flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">
                {{ editingSchedule ? $t('backup.editSchedule') : $t('backup.addSchedule') }}
              </div>
              
              <q-form @submit="saveSchedule" class="q-gutter-md">
                <div class="row q-gutter-md">
                  <div class="col">
                    <q-select
                      v-model="scheduleForm.backup_type"
                      :options="backupTypeOptions"
                      :label="$t('backup.backupType')"
                      outlined
                      :rules="[val => !!val || $t('validation.required')]"
                    />
                  </div>
                  <div class="col">
                    <q-select
                      v-model="scheduleForm.frequency"
                      :options="frequencyOptions"
                      :label="$t('backup.frequency')"
                      outlined
                      :rules="[val => !!val || $t('validation.required')]"
                    />
                  </div>
                  <div class="col">
                    <q-input
                      v-model="scheduleForm.time"
                      :label="$t('backup.time')"
                      outlined
                      type="time"
                      :rules="[val => !!val || $t('validation.required')]"
                    />
                  </div>
                </div>

                <q-toggle
                  v-model="scheduleForm.is_active"
                  :label="$t('backup.isActive')"
                  color="primary"
                />

                <div class="row justify-end q-gutter-sm">
                  <q-btn
                    :label="$t('common.cancel')"
                    color="grey"
                    flat
                    @click="cancelEdit"
                  />
                  <q-btn
                    :label="editingSchedule ? $t('common.update') : $t('common.create')"
                    color="primary"
                    type="submit"
                    :loading="saving"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-slide-transition>

        <!-- Schedules List -->
        <q-table
          :rows="schedules"
          :columns="columns"
          :loading="loading"
          row-key="id"
          class="liquid-glass-table"
          :no-data-label="$t('backup.noSchedules')"
        >
          <template v-slot:body-cell-backup_type="props">
            <q-td :props="props">
              <q-chip
                :color="getTypeColor(props.value)"
                text-color="white"
                :label="$t(`backup.types.${props.value}`)"
                size="sm"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-frequency="props">
            <q-td :props="props">
              <q-chip
                color="info"
                text-color="white"
                :label="$t(`backup.frequencies.${props.value}`)"
                size="sm"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.value"
                @update:model-value="toggleSchedule(props.row)"
                color="primary"
                :loading="togglingIds.includes(props.row.id)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-next_run_at="props">
            <q-td :props="props">
              <div v-if="props.value">
                {{ formatDate(props.value) }}
              </div>
              <div v-else class="text-grey-6">
                {{ $t('backup.notScheduled') }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-last_run_at="props">
            <q-td :props="props">
              <div v-if="props.value">
                {{ formatDate(props.value) }}
              </div>
              <div v-else class="text-grey-6">
                {{ $t('backup.neverRun') }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  icon="edit"
                  size="sm"
                  flat
                  round
                  color="primary"
                  @click="editSchedule(props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  icon="delete"
                  size="sm"
                  flat
                  round
                  color="negative"
                  @click="confirmDeleteSchedule(props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { backupService, BackupSchedule } from 'src/services/backupService'
import { formatDate } from 'src/utils/formatters'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': []
}>()
const { t } = useI18n()
const $q = useQuasar()

const loading = ref(false)
const saving = ref(false)
const schedules = ref<BackupSchedule[]>([])
const showCreateForm = ref(false)
const editingSchedule = ref<BackupSchedule | null>(null)
const togglingIds = ref<number[]>([])

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const scheduleForm = ref({
  backup_type: null,
  frequency: null,
  time: '02:00',
  is_active: true
})

const columns = computed(() => [
  {
    name: 'backup_type',
    label: t('backup.backupType'),
    field: 'backup_type',
    align: 'left'
  },
  {
    name: 'frequency',
    label: t('backup.frequency'),
    field: 'frequency',
    align: 'left'
  },
  {
    name: 'time',
    label: t('backup.time'),
    field: 'time',
    align: 'left'
  },
  {
    name: 'is_active',
    label: t('backup.status'),
    field: 'is_active',
    align: 'center'
  },
  {
    name: 'next_run_at',
    label: t('backup.nextRun'),
    field: 'next_run_at',
    align: 'left'
  },
  {
    name: 'last_run_at',
    label: t('backup.lastRun'),
    field: 'last_run_at',
    align: 'left'
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'actions',
    align: 'center'
  }
])

const backupTypeOptions = computed(() => [
  { label: t('backup.types.full'), value: 'full' },
  { label: t('backup.types.incremental'), value: 'incremental' },
  { label: t('backup.types.export'), value: 'export' }
])

const frequencyOptions = computed(() => [
  { label: t('backup.frequencies.daily'), value: 'daily' },
  { label: t('backup.frequencies.weekly'), value: 'weekly' },
  { label: t('backup.frequencies.monthly'), value: 'monthly' }
])

const getTypeColor = (type: string) => {
  const colors = {
    full: 'primary',
    incremental: 'secondary',
    export: 'info'
  }
  return colors[type] || 'grey'
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const response = await backupService.getSchedules()
    schedules.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.loadSchedulesFailed'),
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

const saveSchedule = async () => {
  saving.value = true
  try {
    const payload = {
      backup_type: scheduleForm.value.backup_type.value,
      frequency: scheduleForm.value.frequency.value,
      time: scheduleForm.value.time,
      is_active: scheduleForm.value.is_active
    }

    if (editingSchedule.value) {
      await backupService.updateSchedule(editingSchedule.value.id, payload)
      $q.notify({
        type: 'positive',
        message: t('backup.scheduleUpdated')
      })
    } else {
      await backupService.createSchedule(payload)
      $q.notify({
        type: 'positive',
        message: t('backup.scheduleCreated')
      })
    }

    await loadSchedules()
    cancelEdit()
    emit('updated')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.saveScheduleFailed'),
      caption: error.message
    })
  } finally {
    saving.value = false
  }
}

const editSchedule = (schedule: BackupSchedule) => {
  editingSchedule.value = schedule
  scheduleForm.value = {
    backup_type: backupTypeOptions.value.find(opt => opt.value === schedule.backup_type),
    frequency: frequencyOptions.value.find(opt => opt.value === schedule.frequency),
    time: schedule.time,
    is_active: schedule.is_active
  }
  showCreateForm.value = true
}

const cancelEdit = () => {
  editingSchedule.value = null
  showCreateForm.value = false
  scheduleForm.value = {
    backup_type: null,
    frequency: null,
    time: '02:00',
    is_active: true
  }
}

const toggleSchedule = async (schedule: BackupSchedule) => {
  togglingIds.value.push(schedule.id)
  try {
    await backupService.toggleSchedule(schedule.id)
    await loadSchedules()
    $q.notify({
      type: 'positive',
      message: schedule.is_active 
        ? t('backup.scheduleDeactivated') 
        : t('backup.scheduleActivated')
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.toggleScheduleFailed'),
      caption: error.message
    })
  } finally {
    togglingIds.value = togglingIds.value.filter(id => id !== schedule.id)
  }
}

const confirmDeleteSchedule = (schedule: BackupSchedule) => {
  $q.dialog({
    title: t('backup.confirmDeleteSchedule'),
    message: t('backup.confirmDeleteScheduleMessage', { 
      type: t(`backup.types.${schedule.backup_type}`),
      frequency: t(`backup.frequencies.${schedule.frequency}`)
    }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await backupService.deleteSchedule(schedule.id)
      $q.notify({
        type: 'positive',
        message: t('backup.scheduleDeleted')
      })
      await loadSchedules()
      emit('updated')
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('backup.errors.deleteScheduleFailed'),
        caption: error.message
      })
    }
  })
}

// Load schedules when dialog opens
watch(showDialog, (newValue) => {
  if (newValue) {
    loadSchedules()
  } else {
    cancelEdit()
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

.liquid-glass-table {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
}
</style>