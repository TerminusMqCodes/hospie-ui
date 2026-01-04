<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h4 class="q-my-none">Invoice Management</h4>
        <p class="text-grey-6 q-mb-none">Manage and track all invoices</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Create Invoice"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <q-select
            v-model="filters.status"
            :options="statusOptions"
            label="Status"
            clearable
            style="min-width: 150px"
            @update:model-value="loadInvoices"
          />
          <q-input
            v-model="filters.search"
            label="Search invoices..."
            debounce="500"
            clearable
            style="min-width: 200px"
            @update:model-value="loadInvoices"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-input
            v-model="filters.start_date"
            label="Start Date"
            type="date"
            clearable
            @update:model-value="loadInvoices"
          />
          <q-input
            v-model="filters.end_date"
            label="End Date"
            type="date"
            clearable
            @update:model-value="loadInvoices"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Statistics Cards -->
    <div class="row q-gutter-md q-mb-md">
      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Total Invoices</div>
          <div class="text-h4 text-primary">{{ statistics.total_invoices || 0 }}</div>
        </q-card-section>
      </q-card>
      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Total Amount</div>
          <div class="text-h4 text-green">{{ statistics.total_amount || '$0.00' }}</div>
        </q-card-section>
      </q-card>
      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Paid Amount</div>
          <div class="text-h4 text-positive">{{ statistics.paid_amount || '$0.00' }}</div>
        </q-card-section>
      </q-card>
      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Overdue Amount</div>
          <div class="text-h4 text-negative">{{ statistics.overdue_amount || '$0.00' }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Invoices Table -->
    <q-table
      :rows="invoices"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      row-key="id"
      binary-state-sort
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="getStatusColor(props.value)"
            :label="props.value"
            class="text-capitalize"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-guest="props">
        <q-td :props="props">
          <div>
            <div class="text-weight-medium">{{ props.row.guest?.first_name }} {{ props.row.guest?.last_name }}</div>
            <div class="text-grey-6 text-caption">{{ props.row.guest?.email }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-amount="props">
        <q-td :props="props">
          <div class="text-weight-medium">${{ props.value?.toFixed(2) }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              dense
              icon="visibility"
              @click="viewInvoice(props.row)"
              color="primary"
            >
              <q-tooltip>View Invoice</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="edit"
              @click="editInvoice(props.row)"
              color="orange"
              v-if="props.row.status === 'draft'"
            >
              <q-tooltip>Edit Invoice</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="email"
              @click="sendInvoiceEmail(props.row)"
              color="blue"
              v-if="['pending', 'overdue'].includes(props.row.status)"
            >
              <q-tooltip>Send Email</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="payment"
              @click="markAsPaid(props.row)"
              color="green"
              v-if="['pending', 'overdue'].includes(props.row.status)"
            >
              <q-tooltip>Mark as Paid</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Create Invoice Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Create New Invoice</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newInvoice.reservation_id"
            :options="reservationOptions"
            option-value="id"
            option-label="label"
            label="Select Reservation"
            emit-value
            map-options
            use-input
            @filter="filterReservations"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateDialog = false" />
          <q-btn
            color="primary"
            label="Create"
            @click="createInvoice"
            :loading="creating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// Data
const invoices = ref([])
const statistics = ref({})
const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const reservationOptions = ref([])

// Filters
const filters = ref({
  status: null,
  search: '',
  start_date: null,
  end_date: null
})

// New invoice form
const newInvoice = ref({
  reservation_id: null
})

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

// Status options
const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Table columns
const columns = [
  {
    name: 'invoice_number',
    label: 'Invoice #',
    field: 'invoice_number',
    align: 'left',
    sortable: true
  },
  {
    name: 'guest',
    label: 'Guest',
    field: 'guest',
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'total_amount',
    align: 'right',
    sortable: true
  },
  {
    name: 'issue_date',
    label: 'Issue Date',
    field: 'issue_date',
    align: 'center',
    sortable: true,
    format: (val) => val ? new Date(val).toLocaleDateString() : ''
  },
  {
    name: 'due_date',
    label: 'Due Date',
    field: 'due_date',
    align: 'center',
    sortable: true,
    format: (val) => val ? new Date(val).toLocaleDateString() : ''
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center'
  }
]

// Methods
const loadInvoices = async (props = {}) => {
  loading.value = true
  try {
    const { page = 1, rowsPerPage = 15, sortBy, descending } = props.pagination || pagination.value

    const params = {
      page,
      per_page: rowsPerPage,
      ...filters.value
    }

    if (sortBy) {
      params.sort_by = sortBy
      params.sort_direction = descending ? 'desc' : 'asc'
    }

    const response = await api.get('/invoices', { params })
    
    invoices.value = response.data.data
    pagination.value = {
      ...pagination.value,
      page: response.data.pagination.current_page,
      rowsPerPage: response.data.pagination.per_page,
      rowsNumber: response.data.pagination.total
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load invoices'
    })
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await api.get('/invoices/statistics', {
      params: {
        start_date: filters.value.start_date,
        end_date: filters.value.end_date
      }
    })
    statistics.value = response.data.data
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

const loadReservations = async () => {
  try {
    const response = await api.get('/reservations', {
      params: {
        status: 'confirmed',
        per_page: 100
      }
    })
    
    reservationOptions.value = response.data.data.map(reservation => ({
      id: reservation.id,
      label: `${reservation.guest_name} - ${reservation.check_in_date} to ${reservation.check_out_date}`,
      ...reservation
    }))
  } catch (error) {
    console.error('Failed to load reservations:', error)
  }
}

const filterReservations = (val, update) => {
  update(() => {
    if (val === '') {
      loadReservations()
    } else {
      const needle = val.toLowerCase()
      reservationOptions.value = reservationOptions.value.filter(
        option => option.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const createInvoice = async () => {
  if (!newInvoice.value.reservation_id) {
    $q.notify({
      type: 'negative',
      message: 'Please select a reservation'
    })
    return
  }

  creating.value = true
  try {
    await api.post('/invoices', newInvoice.value)
    
    $q.notify({
      type: 'positive',
      message: 'Invoice created successfully'
    })
    
    showCreateDialog.value = false
    newInvoice.value = { reservation_id: null }
    loadInvoices()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create invoice'
    })
  } finally {
    creating.value = false
  }
}

const viewInvoice = (invoice) => {
  // Navigate to invoice detail page
  // This would be implemented with vue-router
  console.log('View invoice:', invoice)
}

const editInvoice = (invoice) => {
  // Navigate to invoice edit page
  console.log('Edit invoice:', invoice)
}

const sendInvoiceEmail = async (invoice) => {
  try {
    await api.post(`/invoices/${invoice.id}/send-email`)
    
    $q.notify({
      type: 'positive',
      message: 'Invoice email sent successfully'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to send invoice email'
    })
  }
}

const markAsPaid = async (invoice) => {
  $q.dialog({
    title: 'Mark as Paid',
    message: `Mark invoice #${invoice.invoice_number} as paid?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.post(`/invoices/${invoice.id}/mark-paid`)
      
      $q.notify({
        type: 'positive',
        message: 'Invoice marked as paid'
      })
      
      loadInvoices()
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to mark invoice as paid'
      })
    }
  })
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    pending: 'orange',
    paid: 'green',
    overdue: 'red',
    cancelled: 'grey-6'
  }
  return colors[status] || 'grey'
}

const onRequest = (props) => {
  loadInvoices(props)
}

// Lifecycle
onMounted(() => {
  loadInvoices()
  loadStatistics()
  loadReservations()
})
</script>