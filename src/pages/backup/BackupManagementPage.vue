<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <h4 class="q-my-none text-weight-bold">{{ $t('backup.title') }}</h4>
            <p class="text-grey-6 q-mb-none">{{ $t('backup.subtitle') }}</p>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              icon="backup"
              :label="$t('backup.createBackup')"
              @click="showCreateBackupDialog = true"
              :loading="loading"
            />
            <q-btn
              color="secondary"
              icon="schedule"
              :label="$t('backup.schedules')"
              @click="showScheduleDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="col-12">
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <q-card class="liquid-glass-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ statistics.total_backups || 0 }}</div>
                    <div class="text-grey-6">{{ $t('backup.totalBackups') }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="storage" size="2rem" color="primary" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="liquid-glass-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ statistics.completed_backups || 0 }}</div>
                    <div class="text-grey-6">{{ $t('backup.completedBackups') }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="check_circle" size="2rem" color="positive" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="liquid-glass-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ formatFileSize(statistics.total_size) }}</div>
                    <div class="text-grey-6">{{ $t('backup.totalSize') }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="folder_zip" size="2rem" color="info" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="liquid-glass-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ statistics.failed_backups || 0 }}</div>
                    <div class="text-grey-6">{{ $t('backup.failedBackups') }}</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="error" size="2rem" color="negative" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Backup List -->
      <div class="col-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">{{ $t('backup.backupHistory') }}</div>
              <div class="row q-gutter-sm">
                <q-select
                  v-model="filter.type"
                  :options="typeOptions"
                  :label="$t('backup.filterByType')"
                  dense
                  outlined
                  clearable
                  style="min-width: 150px"
                  @update:model-value="loadBackups"
                />
                <q-select
                  v-model="filter.status"
                  :options="statusOptions"
                  :label="$t('backup.filterByStatus')"
                  dense
                  outlined
                  clearable
                  style="min-width: 150px"
                  @update:model-value="loadBackups"
                />
                <q-btn
                  icon="refresh"
                  flat
                  round
                  @click="loadBackups"
                  :loading="loading"
                />
              </div>
            </div>

            <q-table
              :rows="backups"
              :columns="columns"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              row-key="id"
              class="liquid-glass-table"
            >
              <template v-slot:body-cell-type="props">
                <q-td :props="props">
                  <q-chip
                    :color="getTypeColor(props.value)"
                    text-color="white"
                    :label="$t(`backup.types.${props.value}`)"
                    size="sm"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
                    text-color="white"
                    :label="$t(`backup.status.${props.value}`)"
                    size="sm"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-file_size="props">
                <q-td :props="props">
                  {{ formatFileSize(props.value) }}
                </q-td>
              </template>

              <template v-slot:body-cell-created_at="props">
                <q-td :props="props">
                  {{ formatDate(props.value) }}
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <div class="row q-gutter-xs">
                    <q-btn
                      v-if="props.row.status === 'completed'"
                      icon="download"
                      size="sm"
                      flat
                      round
                      color="primary"
                      @click="downloadBackup(props.row)"
                      :loading="downloadingIds.includes(props.row.id)"
                    >
                      <q-tooltip>{{ $t('backup.download') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'completed'"
                      icon="restore"
                      size="sm"
                      flat
                      round
                      color="warning"
                      @click="openRestoreDialog(props.row)"
                    >
                      <q-tooltip>{{ $t('backup.restore') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'completed'"
                      icon="verified"
                      size="sm"
                      flat
                      round
                      color="info"
                      @click="validateBackup(props.row)"
                      :loading="validatingIds.includes(props.row.id)"
                    >
                      <q-tooltip>{{ $t('backup.validate') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      size="sm"
                      flat
                      round
                      color="negative"
                      @click="confirmDelete(props.row)"
                    >
                      <q-tooltip>{{ $t('backup.delete') }}</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Backup Dialog -->
    <CreateBackupDialog
      v-model="showCreateBackupDialog"
      @created="onBackupCreated"
    />

    <!-- Schedule Dialog -->
    <BackupScheduleDialog
      v-model="showScheduleDialog"
      @updated="loadSchedules"
    />

    <!-- Restore Dialog -->
    <RestoreBackupDialog
      v-model="showRestoreDialog"
      :backup="selectedBackup"
      @restored="onBackupRestored"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { backupService } from 'src/services/backupService'
import CreateBackupDialog from 'src/components/backup/CreateBackupDialog.vue'
import BackupScheduleDialog from 'src/components/backup/BackupScheduleDialog.vue'
import RestoreBackupDialog from 'src/components/backup/RestoreBackupDialog.vue'
import { formatFileSize, formatDate } from 'src/utils/formatters'

const { t } = useI18n()
const $q = useQuasar()

// State
const loading = ref(false)
const backups = ref([])
const statistics = ref({})
const showCreateBackupDialog = ref(false)
const showScheduleDialog = ref(false)
const showRestoreDialog = ref(false)
const selectedBackup = ref(null)
const downloadingIds = ref([])
const validatingIds = ref([])

// Filters
const filter = ref({
  type: null,
  status: null
})

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Table columns
const columns = computed(() => [
  {
    name: 'type',
    label: t('backup.type'),
    field: 'backup_type',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: t('backup.status'),
    field: 'status',
    align: 'left',
    sortable: true
  },
  {
    name: 'file_size',
    label: t('backup.fileSize'),
    field: 'file_size',
    align: 'right',
    sortable: true
  },
  {
    name: 'created_at',
    label: t('backup.createdAt'),
    field: 'created_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'actions',
    align: 'center'
  }
])

// Filter options
const typeOptions = computed(() => [
  { label: t('backup.types.full'), value: 'full' },
  { label: t('backup.types.incremental'), value: 'incremental' },
  { label: t('backup.types.export'), value: 'export' }
])

const statusOptions = computed(() => [
  { label: t('backup.status.pending'), value: 'pending' },
  { label: t('backup.status.in_progress'), value: 'in_progress' },
  { label: t('backup.status.completed'), value: 'completed' },
  { label: t('backup.status.failed'), value: 'failed' }
])

// Methods
const loadBackups = async (props = null) => {
  loading.value = true
  try {
    const params = {
      page: props?.pagination?.page || pagination.value.page,
      per_page: props?.pagination?.rowsPerPage || pagination.value.rowsPerPage,
      sort_by: props?.pagination?.sortBy || pagination.value.sortBy,
      sort_desc: props?.pagination?.descending !== false,
      type: filter.value.type?.value,
      status: filter.value.status?.value
    }

    const response = await backupService.getBackups(params)
    backups.value = response.data
    pagination.value.rowsNumber = response.total
    
    if (props) {
      pagination.value = props.pagination
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.loadFailed'),
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    statistics.value = await backupService.getStatistics()
  } catch (error) {
    console.error('Failed to load backup statistics:', error)
  }
}

const loadSchedules = async () => {
  // This function is called when schedules are updated
  // We don't need to do anything here since we're not displaying schedules on this page
  // The BackupScheduleDialog handles its own data loading
}

const onRequest = (props) => {
  loadBackups(props)
}

const getTypeColor = (type) => {
  const colors = {
    full: 'primary',
    incremental: 'secondary',
    export: 'info'
  }
  return colors[type] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'positive',
    failed: 'negative'
  }
  return colors[status] || 'grey'
}

const downloadBackup = async (backup) => {
  downloadingIds.value.push(backup.id)
  try {
    await backupService.downloadBackup(backup.id)
    $q.notify({
      type: 'positive',
      message: t('backup.downloadStarted')
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.downloadFailed'),
      caption: error.message
    })
  } finally {
    downloadingIds.value = downloadingIds.value.filter(id => id !== backup.id)
  }
}

const openRestoreDialog = (backup) => {
  selectedBackup.value = backup
  showRestoreDialog.value = true
}

const validateBackup = async (backup) => {
  validatingIds.value.push(backup.id)
  try {
    const result = await backupService.validateBackup(backup.id)
    
    if (result.valid) {
      $q.notify({
        type: 'positive',
        message: t('backup.validationSuccess')
      })
    } else {
      $q.notify({
        type: 'negative',
        message: t('backup.validationFailed'),
        caption: Object.entries(result.checks)
          .filter(([, value]) => !value)
          .map(([key]) => t(`backup.validationErrors.${key}`))
          .join(', ')
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('backup.errors.validationFailed'),
      caption: error.message
    })
  } finally {
    validatingIds.value = validatingIds.value.filter(id => id !== backup.id)
  }
}

const confirmDelete = (backup) => {
  $q.dialog({
    title: t('backup.confirmDelete'),
    message: t('backup.confirmDeleteMessage', { type: backup.backup_type }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await backupService.deleteBackup(backup.id)
      $q.notify({
        type: 'positive',
        message: t('backup.deleteSuccess')
      })
      loadBackups()
      loadStatistics()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('backup.errors.deleteFailed'),
        caption: error.message
      })
    }
  })
}

const onBackupCreated = () => {
  loadBackups()
  loadStatistics()
  $q.notify({
    type: 'positive',
    message: t('backup.createSuccess')
  })
}

const onBackupRestored = () => {
  $q.notify({
    type: 'positive',
    message: t('backup.restoreSuccess')
  })
}

// Lifecycle
onMounted(() => {
  loadBackups()
  loadStatistics()
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