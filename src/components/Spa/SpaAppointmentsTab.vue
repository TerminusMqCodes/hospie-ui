<template>
  <div class="spa-appointments-tab">
    <!-- Filters and Actions -->
    <div class="tab-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <div class="row q-gutter-md items-center">
            <div class="col-auto">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                clearable
                style="min-width: 150px"
                @update:model-value="applyFilters"
              />
            </div>
            <div class="col-auto">
              <q-select
                v-model="filters.therapist"
                :options="therapistOptions"
                label="Therapist"
                outlined
                dense
                clearable
                style="min-width: 150px"
                @update:model-value="applyFilters"
              />
            </div>
            <div class="col-auto">
              <q-input
                v-model="filters.date"
                type="date"
                label="Date"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
              />
            </div>
          </div>
        </div>
        <div class="col-auto">
          <q-btn-group>
            <q-btn
              color="primary"
              icon="add"
              label="New Appointment"
              @click="$emit('create')"
            />
            <q-btn
              color="secondary"
              icon="refresh"
              @click="$emit('refresh')"
              :loading="loading"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Appointments Table -->
    <div class="appointments-table q-pa-md">
      <q-table
        :rows="filteredAppointments"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @request="onRequest"
        binary-state-sort
        class="appointments-data-table"
      >
        <!-- Status Column -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.value)"
              :label="props.value"
              class="status-badge"
            />
          </q-td>
        </template>

        <!-- Guest Column -->
        <template v-slot:body-cell-guest="props">
          <q-td :props="props">
            <div class="guest-info">
              <div class="guest-name">{{ props.row.guest_name }}</div>
              <div class="guest-contact">{{ props.row.guest_phone }}</div>
            </div>
          </q-td>
        </template>

        <!-- Service Column -->
        <template v-slot:body-cell-service="props">
          <q-td :props="props">
            <div class="service-info">
              <div class="service-name">{{ props.row.service_name }}</div>
              <div class="service-duration">{{ props.row.duration }} min</div>
            </div>
          </q-td>
        </template>

        <!-- Therapist Column -->
        <template v-slot:body-cell-therapist="props">
          <q-td :props="props">
            <div class="therapist-info">
              <q-avatar size="32px" class="q-mr-sm">
                <img :src="props.row.therapist_avatar || '/default-avatar.png'" />
              </q-avatar>
              <div>
                <div class="therapist-name">{{ props.row.therapist_name }}</div>
                <div class="therapist-specialization">{{ props.row.therapist_specialization }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Time Column -->
        <template v-slot:body-cell-time="props">
          <q-td :props="props">
            <div class="time-info">
              <div class="appointment-date">{{ formatDate(props.row.appointment_date) }}</div>
              <div class="appointment-time">{{ props.row.start_time }} - {{ props.row.end_time }}</div>
            </div>
          </q-td>
        </template>

        <!-- Price Column -->
        <template v-slot:body-cell-price="props">
          <q-td :props="props">
            <div class="price-info">
              <div class="price-amount">${{ props.value }}</div>
              <div class="price-status" :class="props.row.payment_status">
                {{ props.row.payment_status }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn-group flat>
              <q-btn
                icon="edit"
                size="sm"
                flat
                @click="$emit('edit', props.row)"
                :disable="props.row.status === 'completed' || props.row.status === 'cancelled'"
              >
                <q-tooltip>Edit Appointment</q-tooltip>
              </q-btn>
              
              <q-btn
                icon="check"
                size="sm"
                flat
                color="positive"
                @click="confirmAppointment(props.row)"
                v-if="props.row.status === 'pending'"
              >
                <q-tooltip>Confirm Appointment</q-tooltip>
              </q-btn>
              
              <q-btn
                icon="login"
                size="sm"
                flat
                color="primary"
                @click="checkInAppointment(props.row)"
                v-if="props.row.status === 'confirmed' && isToday(props.row.appointment_date)"
              >
                <q-tooltip>Check In</q-tooltip>
              </q-btn>
              
              <q-btn
                icon="done_all"
                size="sm"
                flat
                color="accent"
                @click="completeAppointment(props.row)"
                v-if="props.row.status === 'in_progress'"
              >
                <q-tooltip>Complete</q-tooltip>
              </q-btn>
              
              <q-btn
                icon="cancel"
                size="sm"
                flat
                color="negative"
                @click="cancelAppointment(props.row)"
                v-if="props.row.status !== 'completed' && props.row.status !== 'cancelled'"
              >
                <q-tooltip>Cancel Appointment</q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="spa" />
            <span>No appointments found</span>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import spaService from 'src/services/spaService'

const props = defineProps({
  appointments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'create', 'edit', 'cancel'])

const $q = useQuasar()

// Reactive data
const filters = ref({
  status: null,
  therapist: null,
  date: null
})

const pagination = ref({
  sortBy: 'appointment_date',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Table columns
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center'
  },
  {
    name: 'guest',
    label: 'Guest',
    field: 'guest_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'service',
    label: 'Service',
    field: 'service_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'therapist',
    label: 'Therapist',
    field: 'therapist_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'time',
    label: 'Date & Time',
    field: 'appointment_date',
    sortable: true,
    align: 'left'
  },
  {
    name: 'price',
    label: 'Price',
    field: 'total_price',
    sortable: true,
    align: 'right'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center'
  }
]

// Options for filters
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' }
]

const therapistOptions = computed(() => {
  const therapists = [...new Set(props.appointments.map(apt => apt.therapist_name))]
  return therapists.map(name => ({ label: name, value: name }))
})

// Computed
const filteredAppointments = computed(() => {
  let filtered = [...props.appointments]

  if (filters.value.status) {
    filtered = filtered.filter(apt => apt.status === filters.value.status)
  }

  if (filters.value.therapist) {
    filtered = filtered.filter(apt => apt.therapist_name === filters.value.therapist)
  }

  if (filters.value.date) {
    filtered = filtered.filter(apt => apt.appointment_date === filters.value.date)
  }

  return filtered
})

// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'MMM DD, YYYY')
}

const isToday = (dateString) => {
  const today = date.formatDate(new Date(), 'YYYY-MM-DD')
  return dateString === today
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    in_progress: 'purple',
    completed: 'green',
    cancelled: 'red',
    no_show: 'grey'
  }
  return colors[status] || 'grey'
}

const applyFilters = () => {
  // Filters are applied automatically via computed property
  pagination.value.page = 1
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
}

const confirmAppointment = async (appointment) => {
  try {
    await spaService.confirmAppointment(appointment.id)
    $q.notify({
      type: 'positive',
      message: 'Appointment confirmed successfully'
    })
    emit('refresh')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to confirm appointment'
    })
  }
}

const checkInAppointment = async (appointment) => {
  try {
    await spaService.checkInAppointment(appointment.id)
    $q.notify({
      type: 'positive',
      message: 'Guest checked in successfully'
    })
    emit('refresh')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to check in guest'
    })
  }
}

const completeAppointment = async (appointment) => {
  try {
    await spaService.completeAppointment(appointment.id)
    $q.notify({
      type: 'positive',
      message: 'Appointment completed successfully'
    })
    emit('refresh')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to complete appointment'
    })
  }
}

const cancelAppointment = (appointment) => {
  $q.dialog({
    title: 'Cancel Appointment',
    message: `Are you sure you want to cancel the appointment for ${appointment.guest_name}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('cancel', appointment.id)
  })
}
</script>

<style lang="scss" scoped>
.spa-appointments-tab {
  .tab-header {
    background: rgba(0, 0, 0, 0.02);
  }

  .appointments-data-table {
    .status-badge {
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .guest-info {
      .guest-name {
        font-weight: 600;
        color: var(--q-primary);
      }
      .guest-contact {
        font-size: 0.85rem;
        color: var(--q-dark);
        opacity: 0.7;
      }
    }

    .service-info {
      .service-name {
        font-weight: 500;
      }
      .service-duration {
        font-size: 0.85rem;
        color: var(--q-dark);
        opacity: 0.7;
      }
    }

    .therapist-info {
      display: flex;
      align-items: center;
      
      .therapist-name {
        font-weight: 500;
      }
      .therapist-specialization {
        font-size: 0.85rem;
        color: var(--q-dark);
        opacity: 0.7;
      }
    }

    .time-info {
      .appointment-date {
        font-weight: 500;
      }
      .appointment-time {
        font-size: 0.85rem;
        color: var(--q-dark);
        opacity: 0.7;
      }
    }

    .price-info {
      text-align: right;
      
      .price-amount {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .price-status {
        font-size: 0.75rem;
        text-transform: uppercase;
        
        &.paid {
          color: var(--q-positive);
        }
        &.pending {
          color: var(--q-warning);
        }
        &.overdue {
          color: var(--q-negative);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .spa-appointments-tab {
    .tab-header .row {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  }
}
</style>