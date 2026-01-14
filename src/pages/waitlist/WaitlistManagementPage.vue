<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h4">Waitlist Management</div>
          <div class="text-subtitle2 text-grey-7">Manage guest waitlists and convert to reservations</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="Add to Waitlist" @click="showAddDialog = true" />
        </div>
      </div>

      <!-- Statistics -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.total || 0 }}</div>
              <div class="text-caption text-grey-7">Total Waitlist Entries</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.converted || 0 }}</div>
              <div class="text-caption text-grey-7">Converted to Reservations</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.conversion_rate || 0 }}%</div>
              <div class="text-caption text-grey-7">Conversion Rate</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Waitlist Table -->
      <q-card flat bordered>
        <q-table
          :rows="waitlists"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-priority="props">
            <q-td :props="props">
              <q-badge :color="getPriorityColor(props.row.priority)">
                {{ props.row.priority }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="check" color="positive" @click="convertToReservation(props.row)" 
                     v-if="props.row.status === 'active'" />
              <q-btn flat dense icon="arrow_upward" color="primary" @click="increasePriority(props.row.id)" 
                     v-if="props.row.status === 'active'" />
              <q-btn flat dense icon="schedule" color="primary" @click="extendWaitlist(props.row)" 
                     v-if="props.row.status === 'active'" />
              <q-btn flat dense icon="delete" color="negative" @click="deleteWaitlist(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Add Dialog -->
      <q-dialog v-model="showAddDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">Add to Waitlist</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="saveWaitlist">
              <q-input
                v-model="waitlistForm.guest_name"
                label="Guest Name"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="waitlistForm.guest_email"
                type="email"
                label="Email"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="waitlistForm.check_in_date"
                type="date"
                label="Desired Check-in Date"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="waitlistForm.check_out_date"
                type="date"
                label="Desired Check-out Date"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-select
                v-model="waitlistForm.priority"
                :options="['low', 'medium', 'high', 'urgent']"
                label="Priority"
                outlined
                dense
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showAddDialog = false" />
                <q-btn label="Save" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Convert Dialog -->
      <q-dialog v-model="showConvertDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">Convert to Reservation</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="confirmConvert">
              <q-select
                v-model="convertForm.room_id"
                :options="availableRooms"
                label="Select Room"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model.number="convertForm.rate"
                type="number"
                label="Rate"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => val > 0 || 'Must be greater than 0']"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showConvertDialog = false" />
                <q-btn label="Convert" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import waitlistService from 'src/services/waitlistService'

export default {
  name: 'WaitlistManagementPage',
  setup() {
    const $q = useQuasar()
    const waitlists = ref([])
    const statistics = ref({})
    const loading = ref(false)
    const showAddDialog = ref(false)
    const showConvertDialog = ref(false)
    const selectedWaitlist = ref(null)
    const availableRooms = ref([])

    const waitlistForm = ref({
      guest_name: '',
      guest_email: '',
      check_in_date: '',
      check_out_date: '',
      priority: 'medium'
    })

    const convertForm = ref({
      room_id: null,
      rate: 0
    })

    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    const columns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'guest_name', label: 'Guest', field: 'guest_name', align: 'left' },
      { name: 'check_in_date', label: 'Check-in', field: 'check_in_date', align: 'left' },
      { name: 'check_out_date', label: 'Check-out', field: 'check_out_date', align: 'left' },
      { name: 'priority', label: 'Priority', field: 'priority', align: 'center' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const getPriorityColor = (priority) => {
      const colors = {
        low: 'grey',
        medium: 'blue',
        high: 'orange',
        urgent: 'red'
      }
      return colors[priority] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        active: 'positive',
        converted: 'blue',
        expired: 'grey',
        cancelled: 'negative'
      }
      return colors[status] || 'grey'
    }

    const loadWaitlists = async () => {
      loading.value = true
      try {
        const response = await waitlistService.getWaitlists()
        waitlists.value = response.data
        pagination.value.rowsNumber = response.total
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load waitlists' })
      } finally {
        loading.value = false
      }
    }

    const loadStatistics = async () => {
      try {
        const response = await waitlistService.getStatistics()
        statistics.value = response.data
      } catch (error) {
        console.error('Failed to load statistics', error)
      }
    }

    const saveWaitlist = async () => {
      try {
        await waitlistService.createWaitlist(waitlistForm.value)
        $q.notify({ type: 'positive', message: 'Added to waitlist successfully' })
        showAddDialog.value = false
        loadWaitlists()
        loadStatistics()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to add to waitlist' })
      }
    }

    const convertToReservation = (waitlist) => {
      selectedWaitlist.value = waitlist
      showConvertDialog.value = true
    }

    const confirmConvert = async () => {
      try {
        await waitlistService.convertToReservation(selectedWaitlist.value.id, convertForm.value)
        $q.notify({ type: 'positive', message: 'Converted to reservation successfully' })
        showConvertDialog.value = false
        loadWaitlists()
        loadStatistics()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to convert to reservation' })
      }
    }

    const increasePriority = async (id) => {
      try {
        await waitlistService.increasePriority(id)
        $q.notify({ type: 'positive', message: 'Priority increased' })
        loadWaitlists()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to increase priority' })
      }
    }

    const extendWaitlist = async (waitlist) => {
      $q.dialog({
        title: 'Extend Waitlist',
        message: 'Enter number of days to extend:',
        prompt: {
          model: '7',
          type: 'number'
        },
        cancel: true
      }).onOk(async (days) => {
        try {
          await waitlistService.extendWaitlist(waitlist.id, { days: parseInt(days) })
          $q.notify({ type: 'positive', message: 'Waitlist extended' })
          loadWaitlists()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to extend waitlist' })
        }
      })
    }

    const deleteWaitlist = async (id) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this waitlist entry?',
        cancel: true
      }).onOk(async () => {
        try {
          await waitlistService.deleteWaitlist(id)
          $q.notify({ type: 'positive', message: 'Waitlist entry deleted' })
          loadWaitlists()
          loadStatistics()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to delete waitlist entry' })
        }
      })
    }

    const onRequest = (props) => {
      pagination.value = props.pagination
      loadWaitlists()
    }

    onMounted(() => {
      loadWaitlists()
      loadStatistics()
    })

    return {
      waitlists,
      statistics,
      loading,
      showAddDialog,
      showConvertDialog,
      selectedWaitlist,
      availableRooms,
      waitlistForm,
      convertForm,
      pagination,
      columns,
      getPriorityColor,
      getStatusColor,
      saveWaitlist,
      convertToReservation,
      confirmConvert,
      increasePriority,
      extendWaitlist,
      deleteWaitlist,
      onRequest
    }
  }
}
</script>
