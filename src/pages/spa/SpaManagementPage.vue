<template>
  <q-page class="spa-management-page">
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h1 class="page-title">Spa & Wellness Management</h1>
          <p class="page-subtitle">Manage appointments, therapists, and spa services</p>
        </div>
        <div class="col-auto">
          <q-btn-group>
            <q-btn
              color="primary"
              icon="add"
              label="New Appointment"
              @click="showNewAppointmentDialog = true"
            />
            <q-btn
              color="secondary"
              icon="schedule"
              label="Manage Schedule"
              outline
              @click="$router.push('/spa/schedule')"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="event" size="md" color="primary" />
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ spaStats.todayAppointments }}</div>
                <div class="stat-label">Today's Appointments</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="people" size="md" color="secondary" />
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ spaStats.activeTherapists }}</div>
                <div class="stat-label">Active Therapists</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="attach_money" size="md" color="positive" />
              </div>
              <div class="stat-details">
                <div class="stat-value">${{ formatNumber(spaStats.todayRevenue) }}</div>
                <div class="stat-label">Today's Revenue</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="room_service" size="md" color="accent" />
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ spaStats.availableRooms }}</div>
                <div class="stat-label">Available Rooms</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <q-card class="main-content-card">
      <q-tabs
        v-model="activeTab"
        class="text-primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="appointments" icon="event" label="Appointments" />
        <q-tab name="services" icon="spa" label="Services" />
        <q-tab name="therapists" icon="people" label="Therapists" />
        <q-tab name="rooms" icon="room_service" label="Rooms" />
        <q-tab name="inventory" icon="inventory" label="Inventory" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Appointments Tab -->
        <q-tab-panel name="appointments" class="q-pa-none">
          <SpaAppointmentsTab
            :appointments="appointments"
            :loading="appointmentsLoading"
            @refresh="loadAppointments"
            @create="showNewAppointmentDialog = true"
            @edit="editAppointment"
            @cancel="cancelAppointment"
          />
        </q-tab-panel>

        <!-- Services Tab -->
        <q-tab-panel name="services" class="q-pa-none">
          <SpaServicesTab
            :services="services"
            :loading="servicesLoading"
            @refresh="loadServices"
            @create="showNewServiceDialog = true"
            @edit="editService"
            @delete="deleteService"
          />
        </q-tab-panel>

        <!-- Therapists Tab -->
        <q-tab-panel name="therapists" class="q-pa-none">
          <SpaTherapistsTab
            :therapists="therapists"
            :loading="therapistsLoading"
            @refresh="loadTherapists"
            @create="showNewTherapistDialog = true"
            @edit="editTherapist"
            @schedule="manageTherapistSchedule"
          />
        </q-tab-panel>

        <!-- Rooms Tab -->
        <q-tab-panel name="rooms" class="q-pa-none">
          <SpaRoomsTab
            :rooms="rooms"
            :loading="roomsLoading"
            @refresh="loadRooms"
            @create="showNewRoomDialog = true"
            @edit="editRoom"
            @status="updateRoomStatus"
          />
        </q-tab-panel>

        <!-- Inventory Tab -->
        <q-tab-panel name="inventory" class="q-pa-none">
          <SpaInventoryTab
            :inventory="inventory"
            :loading="inventoryLoading"
            @refresh="loadInventory"
            @create="showNewInventoryDialog = true"
            @edit="editInventoryItem"
            @reorder="reorderItem"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- New Appointment Dialog -->
    <q-dialog v-model="showNewAppointmentDialog" persistent>
      <SpaAppointmentDialog
        :appointment="null"
        :services="services"
        :therapists="therapists"
        :rooms="rooms"
        @save="saveAppointment"
        @cancel="showNewAppointmentDialog = false"
      />
    </q-dialog>

    <!-- Edit Appointment Dialog -->
    <q-dialog v-model="showEditAppointmentDialog" persistent>
      <SpaAppointmentDialog
        :appointment="selectedAppointment"
        :services="services"
        :therapists="therapists"
        :rooms="rooms"
        @save="updateAppointment"
        @cancel="showEditAppointmentDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import SpaAppointmentsTab from 'src/components/Spa/SpaAppointmentsTab.vue'
import SpaServicesTab from 'src/components/Spa/SpaServicesTab.vue'
import SpaTherapistsTab from 'src/components/Spa/SpaTherapistsTab.vue'
import SpaRoomsTab from 'src/components/Spa/SpaRoomsTab.vue'
import SpaInventoryTab from 'src/components/Spa/SpaInventoryTab.vue'
import SpaAppointmentDialog from 'src/components/Spa/SpaAppointmentDialog.vue'
import spaService from 'src/services/spaService'

const $q = useQuasar()

// Reactive data
const activeTab = ref('appointments')
const showNewAppointmentDialog = ref(false)
const showEditAppointmentDialog = ref(false)
const showNewServiceDialog = ref(false)
const showNewTherapistDialog = ref(false)
const showNewRoomDialog = ref(false)
const showNewInventoryDialog = ref(false)

const selectedAppointment = ref(null)

// Data arrays
const appointments = ref([])
const services = ref([])
const therapists = ref([])
const rooms = ref([])
const inventory = ref([])

// Loading states
const appointmentsLoading = ref(false)
const servicesLoading = ref(false)
const therapistsLoading = ref(false)
const roomsLoading = ref(false)
const inventoryLoading = ref(false)

// Stats
const spaStats = ref({
  todayAppointments: 0,
  activeTherapists: 0,
  todayRevenue: 0,
  availableRooms: 0
})

// Methods
const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number)
}

const loadAppointments = async () => {
  appointmentsLoading.value = true
  try {
    const response = await spaService.getAppointments()
    appointments.value = response.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load appointments'
    })
  } finally {
    appointmentsLoading.value = false
  }
}

const loadServices = async () => {
  servicesLoading.value = true
  try {
    const response = await spaService.getServices()
    services.value = response.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load services'
    })
  } finally {
    servicesLoading.value = false
  }
}

const loadTherapists = async () => {
  therapistsLoading.value = true
  try {
    const response = await spaService.getTherapists()
    therapists.value = response.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load therapists'
    })
  } finally {
    therapistsLoading.value = false
  }
}

const loadRooms = async () => {
  roomsLoading.value = true
  try {
    const response = await spaService.getRooms()
    rooms.value = response.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load rooms'
    })
  } finally {
    roomsLoading.value = false
  }
}

const loadInventory = async () => {
  inventoryLoading.value = true
  try {
    const response = await spaService.getInventory()
    inventory.value = response.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load inventory'
    })
  } finally {
    inventoryLoading.value = false
  }
}

const loadSpaStats = async () => {
  try {
    const response = await spaService.getStats()
    spaStats.value = response.data
  } catch (error) {
    console.error('Failed to load spa stats:', error)
  }
}

const editAppointment = (appointment) => {
  selectedAppointment.value = appointment
  showEditAppointmentDialog.value = true
}

const cancelAppointment = async (appointmentId) => {
  try {
    await spaService.cancelAppointment(appointmentId)
    $q.notify({
      type: 'positive',
      message: 'Appointment cancelled successfully'
    })
    await loadAppointments()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to cancel appointment'
    })
  }
}

const saveAppointment = async (appointmentData) => {
  try {
    await spaService.createAppointment(appointmentData)
    $q.notify({
      type: 'positive',
      message: 'Appointment created successfully'
    })
    showNewAppointmentDialog.value = false
    await loadAppointments()
    await loadSpaStats()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to create appointment'
    })
  }
}

const updateAppointment = async (appointmentData) => {
  try {
    await spaService.updateAppointment(selectedAppointment.value.id, appointmentData)
    $q.notify({
      type: 'positive',
      message: 'Appointment updated successfully'
    })
    showEditAppointmentDialog.value = false
    selectedAppointment.value = null
    await loadAppointments()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update appointment'
    })
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadAppointments(),
    loadServices(),
    loadTherapists(),
    loadRooms(),
    loadInventory(),
    loadSpaStats()
  ])
})
</script>

<style lang="scss" scoped>
.spa-management-page {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-header {
  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--q-primary);
    margin: 0;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--q-dark);
    opacity: 0.7;
    margin: 8px 0 0 0;
  }
}

.stat-card {
  height: 120px;
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    padding: 12px;
    border-radius: 12px;
    background: rgba(var(--q-primary-rgb), 0.1);
  }

  .stat-details {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--q-primary);
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--q-dark);
    opacity: 0.7;
  }
}

.main-content-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .spa-management-page {
    padding: 16px;
  }

  .page-header {
    .page-title {
      font-size: 2rem;
    }
  }

  .stat-card {
    height: 100px;
    
    .stat-content {
      gap: 12px;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
}
</style>