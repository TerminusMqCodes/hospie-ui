<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Reports & Analytics</div>
                <div class="text-subtitle2">Comprehensive analytics and reporting dashboard</div>
              </div>
              <div class="row q-gutter-sm">
                <q-btn 
                  color="primary" 
                  icon="analytics" 
                  label="Export Data" 
                  outline
                  @click="showExportDialog = true"
                />
                <q-btn 
                  color="secondary" 
                  icon="refresh" 
                  label="Refresh" 
                  @click="refreshData"
                  :loading="refreshing"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Analytics Dashboard Component -->
      <div class="col-12">
        <AnalyticsDashboard ref="analyticsDashboard" />
      </div>
    </div>

    <!-- Export Dialog -->
    <q-dialog v-model="showExportDialog">
      <q-card class="export-dialog">
        <q-card-section>
          <div class="text-h6">Export Report Data</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="exportType"
              :options="exportOptions"
              label="Report Type"
              outlined
            />
            
            <q-select
              v-model="exportFormat"
              :options="formatOptions"
              label="Format"
              outlined
            />
            
            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="exportStartDate"
                  type="date"
                  label="Start Date"
                  outlined
                />
              </div>
              <div class="col">
                <q-input
                  v-model="exportEndDate"
                  type="date"
                  label="End Date"
                  outlined
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showExportDialog = false" />
          <q-btn 
            color="primary" 
            label="Export" 
            @click="exportData"
            :loading="exporting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import AnalyticsDashboard from 'src/components/AnalyticsDashboard.vue'

const $q = useQuasar()

// Reactive data
const analyticsDashboard = ref(null)
const showExportDialog = ref(false)
const refreshing = ref(false)
const exporting = ref(false)

// Export options
const exportType = ref('revenue')
const exportFormat = ref('excel')
const exportStartDate = ref('')
const exportEndDate = ref('')

const exportOptions = [
  { label: 'Revenue Report', value: 'revenue' },
  { label: 'Occupancy Report', value: 'occupancy' },
  { label: 'Reservation Report', value: 'reservations' },
  { label: 'Guest Analytics', value: 'guests' },
  { label: 'Room Performance', value: 'rooms' },
  { label: 'Financial Summary', value: 'financial' }
]

const formatOptions = [
  { label: 'Excel (.xlsx)', value: 'excel' },
  { label: 'PDF Report', value: 'pdf' },
  { label: 'CSV Data', value: 'csv' }
]

// Methods
const refreshData = async () => {
  refreshing.value = true
  try {
    if (analyticsDashboard.value && analyticsDashboard.value.loadAllData) {
      await analyticsDashboard.value.loadAllData()
    }
    $q.notify({
      type: 'positive',
      message: 'Analytics data refreshed successfully'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh analytics data'
    })
  } finally {
    refreshing.value = false
  }
}

const exportData = async () => {
  exporting.value = true
  try {
    // This would call the export API endpoint
    // For now, show a placeholder message
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    $q.notify({
      type: 'info',
      message: 'Export functionality will be available in the next update'
    })
    
    showExportDialog.value = false
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to export data'
    })
  } finally {
    exporting.value = false
  }
}

// Initialize export dates
const today = new Date()
exportEndDate.value = today.toISOString().split('T')[0]
exportStartDate.value = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
</script>

<style scoped>
.export-dialog {
  min-width: 400px;
  max-width: 90vw;
}

@media (max-width: 768px) {
  .export-dialog {
    margin: 16px;
  }
}
</style>