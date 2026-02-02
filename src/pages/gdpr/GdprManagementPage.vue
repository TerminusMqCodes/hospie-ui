<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">GDPR Compliance Management</div>

      <q-tabs v-model="tab" class="q-mb-md">
        <q-tab name="exports" label="Data Export Requests" />
        <q-tab name="deletions" label="Deletion Requests" />
        <q-tab name="consent" label="Consent Management" />
        <q-tab name="audit" label="Audit Logs" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <!-- Export Requests -->
        <q-tab-panel name="exports">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Export Requests</div>
              <q-table
                :rows="exportRequests"
                :columns="exportColumns"
                row-key="id"
                :loading="loading"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge :color="getStatusColor(props.row.status)">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="download" color="primary" 
                           v-if="props.row.status === 'completed'"
                           @click="downloadExport(props.row)" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Deletion Requests -->
        <q-tab-panel name="deletions">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Pending Deletion Requests</div>
              <q-table
                :rows="deletionRequests"
                :columns="deletionColumns"
                row-key="id"
                :loading="loading"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge :color="getStatusColor(props.row.status)">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="check" color="positive" 
                           v-if="props.row.status === 'pending'"
                           @click="approveDeletion(props.row.id)" />
                    <q-btn flat dense icon="close" color="negative" 
                           v-if="props.row.status === 'pending'"
                           @click="rejectDeletion(props.row.id)" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Consent Management -->
        <q-tab-panel name="consent">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Guest Consent Status</div>
              <q-input
                v-model="searchGuest"
                label="Search Guest"
                outlined
                dense
                class="q-mb-md"
                @keyup.enter="searchGuestConsent"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="search" @click="searchGuestConsent" />
                </template>
              </q-input>
              
              <div v-if="selectedGuestConsent">
                <q-list bordered separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Marketing Communications</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="selectedGuestConsent.marketing" />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Data Processing</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="selectedGuestConsent.data_processing" />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Third Party Sharing</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="selectedGuestConsent.third_party" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-btn color="primary" label="Update Consent" class="q-mt-md" @click="updateConsent" />
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Audit Logs -->
        <q-tab-panel name="audit">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">GDPR Audit Logs</div>
              <q-table
                :rows="auditLogs"
                :columns="auditColumns"
                row-key="id"
                :loading="loading"
              />
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import gdprService from 'src/services/gdprService'

export default {
  name: 'GdprManagementPage',
  setup() {
    const $q = useQuasar()
    const tab = ref('exports')
    const loading = ref(false)
    const exportRequests = ref([])
    const deletionRequests = ref([])
    const auditLogs = ref([])
    const searchGuest = ref('')
    const selectedGuestConsent = ref(null)

    const exportColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'guest_name', label: 'Guest', field: 'guest_name', align: 'left' },
      { name: 'requested_at', label: 'Requested', field: 'requested_at', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const deletionColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'guest_name', label: 'Guest', field: 'guest_name', align: 'left' },
      { name: 'reason', label: 'Reason', field: 'reason', align: 'left' },
      { name: 'requested_at', label: 'Requested', field: 'requested_at', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const auditColumns = [
      { name: 'timestamp', label: 'Time', field: 'timestamp', align: 'left' },
      { name: 'action', label: 'Action', field: 'action', align: 'left' },
      { name: 'user', label: 'User', field: 'user', align: 'left' },
      { name: 'details', label: 'Details', field: 'details', align: 'left' }
    ]

    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        processing: 'blue',
        completed: 'positive',
        approved: 'positive',
        rejected: 'negative',
        failed: 'negative'
      }
      return colors[status] || 'grey'
    }

    const loadDeletionRequests = async () => {
      loading.value = true
      try {
        const response = await gdprService.getPendingDeletions()
        deletionRequests.value = response.data
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load deletion requests' })
      } finally {
        loading.value = false
      }
    }

    const approveDeletion = async (id) => {
      $q.dialog({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to approve this deletion request? This action cannot be undone.',
        cancel: true
      }).onOk(async () => {
        try {
          await gdprService.approveDeletion(id)
          $q.notify({ type: 'positive', message: 'Deletion approved' })
          loadDeletionRequests()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to approve deletion' })
        }
      })
    }

    const rejectDeletion = async (id) => {
      $q.dialog({
        title: 'Reject Deletion',
        message: 'Enter reason for rejection:',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true
      }).onOk(async (reason) => {
        try {
          await gdprService.rejectDeletion(id, { reason })
          $q.notify({ type: 'positive', message: 'Deletion rejected' })
          loadDeletionRequests()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to reject deletion' })
        }
      })
    }

    const searchGuestConsent = () => {
      // Implementation for searching guest consent
      $q.notify({ type: 'info', message: 'Search functionality to be implemented' })
    }

    const updateConsent = () => {
      // Implementation for updating consent
      $q.notify({ type: 'info', message: 'Update functionality to be implemented' })
    }

    const downloadExport = (/* exportRequest */) => {
      // Implementation for downloading export
      $q.notify({ type: 'info', message: 'Download functionality to be implemented' })
    }

    onMounted(() => {
      loadDeletionRequests()
    })

    return {
      tab,
      loading,
      exportRequests,
      deletionRequests,
      auditLogs,
      searchGuest,
      selectedGuestConsent,
      exportColumns,
      deletionColumns,
      auditColumns,
      getStatusColor,
      approveDeletion,
      rejectDeletion,
      searchGuestConsent,
      updateConsent,
      downloadExport
    }
  }
}
</script>
