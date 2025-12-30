<template>
  <q-page class="q-pa-md reservation-page">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between header-row">
              <div class="header-info">
                <div class="text-h6">Reservations</div>
                <div class="text-subtitle2">Manage hotel reservations</div>
              </div>
              <q-btn 
                color="primary" 
                icon="add" 
                :label="$q.screen.gt.xs ? 'New Reservation' : ''"
                class="new-reservation-btn"
                @click="$router.push('/reservations/create')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Filters -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md items-end filters-row">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="bookingStore.filters.search"
                  label="Search guest name or confirmation"
                  outlined
                  dense
                  clearable
                  @update:model-value="onFilterChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model="bookingStore.filters.status"
                  :options="statusOptions"
                  label="Status"
                  outlined
                  dense
                  clearable
                  @update:model-value="onFilterChange"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-2">
                <q-input
                  v-model="bookingStore.filters.start_date"
                  label="From Date"
                  type="date"
                  outlined
                  dense
                  @update:model-value="onFilterChange"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-2">
                <q-input
                  v-model="bookingStore.filters.end_date"
                  label="To Date"
                  type="date"
                  outlined
                  dense
                  @update:model-value="onFilterChange"
                />
              </div>
              
              <div class="col-12 col-sm-12 col-md-2">
                <q-btn
                  color="secondary"
                  icon="clear"
                  :label="$q.screen.gt.xs ? 'Clear' : ''"
                  outline
                  class="full-width-mobile"
                  @click="clearFilters"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reservations Table -->
      <div class="col-12">
        <q-card>
          <!-- Mobile Card View -->
          <div v-if="$q.screen.lt.md" class="mobile-reservations">
            <q-card-section v-if="bookingStore.loading" class="text-center">
              <q-spinner size="40px" />
              <div class="q-mt-sm">Loading reservations...</div>
            </q-card-section>
            
            <div v-else>
              <q-card 
                v-for="reservation in bookingStore.reservations" 
                :key="reservation.id"
                class="q-ma-sm reservation-mobile-card"
                bordered
                flat
              >
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="col">
                      <div class="text-weight-bold">{{ reservation.guest?.name || 'N/A' }}</div>
                      <div class="text-caption text-grey-6">{{ reservation.guest?.email }}</div>
                    </div>
                    <div class="col-auto">
                      <q-badge 
                        :color="getStatusColor(reservation.status)"
                        :label="getStatusLabel(reservation.status)"
                      />
                    </div>
                  </div>
                  
                  <div class="q-mt-sm">
                    <div class="text-body2">
                      <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
                      {{ formatDate(reservation.check_in_date) }} - {{ formatDate(reservation.check_out_date) }}
                    </div>
                    <div class="text-body2 q-mt-xs">
                      <q-icon name="hotel" size="xs" class="q-mr-xs" />
                      {{ reservation.room_type?.name || 'N/A' }}
                    </div>
                    <div class="text-body2 q-mt-xs">
                      <q-icon name="attach_money" size="xs" class="q-mr-xs" />
                      ${{ reservation.total_amount }}
                    </div>
                  </div>
                  
                  <div class="row q-mt-md q-gutter-xs">
                    <q-btn 
                      flat 
                      dense 
                      icon="visibility" 
                      size="sm"
                      color="primary"
                      @click="viewReservation(reservation)"
                    >
                      <q-tooltip>View</q-tooltip>
                    </q-btn>
                    
                    <q-btn 
                      flat 
                      dense 
                      icon="edit" 
                      size="sm"
                      color="secondary"
                      @click="editReservation(reservation)"
                    >
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    
                    <q-btn 
                      v-if="reservation.status === 'confirmed'"
                      flat 
                      dense 
                      icon="login" 
                      size="sm"
                      color="positive"
                      @click="checkInGuest(reservation)"
                    >
                      <q-tooltip>Check In</q-tooltip>
                    </q-btn>
                    
                    <q-btn 
                      v-if="reservation.status === 'checked_in'"
                      flat 
                      dense 
                      icon="logout" 
                      size="sm"
                      color="info"
                      @click="checkOutGuest(reservation)"
                    >
                      <q-tooltip>Check Out</q-tooltip>
                    </q-btn>
                    
                    <q-btn 
                      v-if="['pending', 'confirmed'].includes(reservation.status)"
                      flat 
                      dense 
                      icon="cancel" 
                      size="sm"
                      color="negative"
                      @click="cancelReservation(reservation)"
                    >
                      <q-tooltip>Cancel</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
              
              <div v-if="bookingStore.reservations.length === 0" class="text-center q-pa-lg">
                <q-icon size="3em" name="sentiment_dissatisfied" class="text-grey-5" />
                <div class="text-grey-7 q-mt-sm">No reservations found</div>
              </div>
            </div>
          </div>
          
          <!-- Desktop Table View -->
          <q-table
            v-else
            :rows="bookingStore.reservations"
            :columns="columns"
            :loading="bookingStore.loading"
            :pagination="pagination"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <template v-slot:body-cell-guest="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.guest?.name || 'N/A' }}</div>
                <div class="text-caption text-grey-6">{{ props.row.guest?.email }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-dates="props">
              <q-td :props="props">
                <div>{{ formatDate(props.row.check_in_date) }}</div>
                <div class="text-caption text-grey-6">to {{ formatDate(props.row.check_out_date) }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge 
                  :color="getStatusColor(props.row.status)"
                  :label="getStatusLabel(props.row.status)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                <div class="text-weight-medium">${{ props.row.total_amount }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn 
                    flat 
                    round 
                    icon="visibility" 
                    size="sm"
                    @click="viewReservation(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    flat 
                    round 
                    icon="edit" 
                    size="sm"
                    @click="editReservation(props.row)"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    v-if="props.row.status === 'confirmed'"
                    flat 
                    round 
                    icon="login" 
                    size="sm"
                    color="positive"
                    @click="checkInGuest(props.row)"
                  >
                    <q-tooltip>Check In</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    v-if="props.row.status === 'checked_in'"
                    flat 
                    round 
                    icon="logout" 
                    size="sm"
                    color="secondary"
                    @click="checkOutGuest(props.row)"
                  >
                    <q-tooltip>Check Out</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    v-if="['pending', 'confirmed'].includes(props.row.status)"
                    flat 
                    round 
                    icon="cancel" 
                    size="sm"
                    color="negative"
                    @click="cancelReservation(props.row)"
                  >
                    <q-tooltip>Cancel</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span>No reservations found</span>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Reservation Details Dialog -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card class="details-dialog">
        <q-card-section>
          <div class="text-h6">Reservation Details</div>
        </q-card-section>

        <q-card-section v-if="selectedReservation">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Guest</q-item-label>
                    <q-item-label>{{ selectedReservation.guest?.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Email</q-item-label>
                    <q-item-label>{{ selectedReservation.guest?.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Phone</q-item-label>
                    <q-item-label>{{ selectedReservation.guest?.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div class="col-12 col-md-6">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Check-in</q-item-label>
                    <q-item-label>{{ formatDate(selectedReservation.check_in_date) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Check-out</q-item-label>
                    <q-item-label>{{ formatDate(selectedReservation.check_out_date) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Total Amount</q-item-label>
                    <q-item-label class="text-h6">${{ selectedReservation.total_amount }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showDetailsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBookingStore } from 'src/stores/booking'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const bookingStore = useBookingStore()
const $q = useQuasar()
const router = useRouter()

// Reactive data
const showDetailsDialog = ref(false)
const selectedReservation = ref(null)

// Table configuration
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
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
    name: 'dates',
    label: 'Stay Dates',
    field: 'check_in_date',
    align: 'left'
  },
  {
    name: 'room_type',
    label: 'Room Type',
    field: row => row.room_type?.name || 'N/A',
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'total_amount',
    align: 'right'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center'
  }
]

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' }
]

const pagination = computed(() => bookingStore.pagination)

// Methods
const onRequest = (props) => {
  const { page, rowsPerPage } = props.pagination
  bookingStore.pagination.page = page
  bookingStore.pagination.rowsPerPage = rowsPerPage
  bookingStore.fetchReservations()
}

const onFilterChange = () => {
  bookingStore.pagination.page = 1
  bookingStore.fetchReservations()
}

const clearFilters = () => {
  bookingStore.clearFilters()
  bookingStore.fetchReservations()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    checked_in: 'green',
    checked_out: 'grey',
    cancelled: 'red',
    no_show: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  }
  return labels[status] || status
}

const viewReservation = (reservation) => {
  selectedReservation.value = reservation
  showDetailsDialog.value = true
}

const editReservation = (reservation) => {
  router.push(`/reservations/edit/${reservation.id}`)
}

const checkInGuest = async (reservation) => {
  try {
    await bookingStore.checkInGuest(reservation.id)
    $q.notify({
      type: 'positive',
      message: 'Guest checked in successfully'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to check in guest'
    })
  }
}

const checkOutGuest = async (reservation) => {
  try {
    await bookingStore.checkOutGuest(reservation.id)
    $q.notify({
      type: 'positive',
      message: 'Guest checked out successfully'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to check out guest'
    })
  }
}

const cancelReservation = (reservation) => {
  $q.dialog({
    title: 'Cancel Reservation',
    message: 'Are you sure you want to cancel this reservation?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await bookingStore.cancelBooking(reservation.id, {
        reason: 'Cancelled by staff'
      })
      $q.notify({
        type: 'positive',
        message: 'Reservation cancelled successfully'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to cancel reservation'
      })
    }
  })
}

// Lifecycle
onMounted(() => {
  bookingStore.fetchReservations()
})
</script>

<style scoped>
.reservation-page {
  padding: 16px;
}

.header-row {
  flex-wrap: wrap;
  gap: 16px;
}

.header-info {
  flex: 1;
  min-width: 200px;
}

.new-reservation-btn {
  min-width: 48px;
}

.filters-row {
  align-items: stretch;
}

.full-width-mobile {
  width: 100%;
}

.mobile-reservations {
  padding: 8px;
}

.reservation-mobile-card {
  margin-bottom: 8px;
  border-left: 4px solid #e0e0e0;
  transition: all 0.2s ease;
}

.reservation-mobile-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.details-dialog {
  min-width: 300px;
  max-width: 90vw;
  width: 600px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .reservation-page {
    padding: 8px;
  }
  
  .header-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .new-reservation-btn {
    width: 100%;
    margin-top: 8px;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filters-row > div {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 8px;
  }
  
  .details-dialog {
    margin: 16px;
    width: calc(100vw - 32px);
  }
}

@media (max-width: 600px) {
  .reservation-mobile-card .q-card-section {
    padding: 12px;
  }
  
  .row.q-gutter-md > div {
    margin-bottom: 8px;
  }
}

@media (max-width: 400px) {
  .reservation-page {
    padding: 4px;
  }
  
  .mobile-reservations {
    padding: 4px;
  }
  
  .reservation-mobile-card {
    margin: 4px;
  }
}
</style>