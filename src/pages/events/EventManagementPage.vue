<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <h4 class="q-ma-none text-weight-bold">Event Management</h4>
            <p class="text-grey-6 q-mb-none">Manage events, spaces, and bookings</p>
          </div>
          <q-btn 
            color="primary" 
            icon="add" 
            label="New Event" 
            @click="showCreateEventDialog = true"
            unelevated
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ stats.totalEvents }}</div>
                <div class="text-caption text-grey-6">Total Events</div>
              </div>
              <div class="col-auto">
                <q-icon name="event" size="32px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">{{ stats.upcomingEvents }}</div>
                <div class="text-caption text-grey-6">Upcoming Events</div>
              </div>
              <div class="col-auto">
                <q-icon name="schedule" size="32px" color="positive" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ stats.activeSpaces }}</div>
                <div class="text-caption text-grey-6">Active Spaces</div>
              </div>
              <div class="col-auto">
                <q-icon name="meeting_room" size="32px" color="warning" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-info">{{ stats.monthlyRevenue }}</div>
                <div class="text-caption text-grey-6">Monthly Revenue</div>
              </div>
              <div class="col-auto">
                <q-icon name="attach_money" size="32px" color="info" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Main Content -->
      <div class="col-12">
        <q-card>
          <q-tabs v-model="activeTab" class="text-grey-6" active-color="primary" indicator-color="primary">
            <q-tab name="events" label="Events" icon="event" />
            <q-tab name="spaces" label="Event Spaces" icon="meeting_room" />
            <q-tab name="equipment" label="Equipment" icon="devices" />
            <q-tab name="catering" label="Catering" icon="restaurant" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Events Tab -->
            <q-tab-panel name="events">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">Events</div>
                    <q-input 
                      v-model="eventSearch" 
                      placeholder="Search events..." 
                      outlined 
                      dense 
                      style="width: 300px"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  
                  <q-table
                    :rows="filteredEvents"
                    :columns="eventColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-chip 
                          :color="getStatusColor(props.value)" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ props.value }}
                        </q-chip>
                      </q-td>
                    </template>
                    
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn flat round icon="edit" size="sm" @click="editEvent(props.row)" />
                        <q-btn flat round icon="delete" size="sm" @click="deleteEvent(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>

            <!-- Event Spaces Tab -->
            <q-tab-panel name="spaces">
              <div class="row q-gutter-md">
                <div class="col-12 col-md-6" v-for="space in eventSpaces" :key="space.id">
                  <q-card class="space-card">
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-h6">{{ space.name }}</div>
                          <div class="text-caption text-grey-6">{{ space.description }}</div>
                        </div>
                        <div class="col-auto">
                          <q-chip 
                            :color="space.is_available ? 'positive' : 'negative'" 
                            text-color="white"
                          >
                            {{ space.is_available ? 'Available' : 'Occupied' }}
                          </q-chip>
                        </div>
                      </div>
                      <div class="q-mt-md">
                        <div class="text-body2">
                          <strong>Capacity:</strong> {{ space.capacity }} people
                        </div>
                        <div class="text-body2">
                          <strong>Hourly Rate:</strong> ${{ space.hourly_rate }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Equipment Tab -->
            <q-tab-panel name="equipment">
              <div class="text-h6 q-mb-md">Event Equipment</div>
              <div class="row q-gutter-md">
                <div class="col-12 col-md-4" v-for="equipment in eventEquipment" :key="equipment.id">
                  <q-card>
                    <q-card-section>
                      <div class="text-subtitle1">{{ equipment.name }}</div>
                      <div class="text-caption text-grey-6">{{ equipment.description }}</div>
                      <div class="q-mt-sm">
                        <q-chip 
                          :color="equipment.is_available ? 'positive' : 'negative'" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ equipment.is_available ? 'Available' : 'In Use' }}
                        </q-chip>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Catering Tab -->
            <q-tab-panel name="catering">
              <div class="text-h6 q-mb-md">Catering Services</div>
              <div class="row q-gutter-md">
                <div class="col-12">
                  <q-table
                    :rows="cateringServices"
                    :columns="cateringColumns"
                    row-key="id"
                    :pagination="{ rowsPerPage: 10 }"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Create Event Dialog -->
    <q-dialog v-model="showCreateEventDialog">
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Create New Event</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="createEvent">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input v-model="newEvent.name" label="Event Name" outlined required />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newEvent.start_date" label="Start Date" type="date" outlined required />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newEvent.end_date" label="End Date" type="date" outlined required />
              </div>
              <div class="col-12">
                <q-select 
                  v-model="newEvent.event_type_id" 
                  :options="eventTypes" 
                  option-value="id" 
                  option-label="name" 
                  label="Event Type" 
                  outlined 
                  required 
                />
              </div>
              <div class="col-12">
                <q-input v-model="newEvent.description" label="Description" type="textarea" outlined />
              </div>
            </div>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateEventDialog = false" />
          <q-btn color="primary" label="Create" @click="createEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { eventService } from '../../services/eventService'

export default {
  name: 'EventManagementPage',
  
  setup() {
    const $q = useQuasar()
    
    const loading = ref(false)
    const activeTab = ref('events')
    const eventSearch = ref('')
    const showCreateEventDialog = ref(false)
    
    const stats = ref({
      totalEvents: 0,
      upcomingEvents: 0,
      activeSpaces: 0,
      monthlyRevenue: '$0'
    })
    
    const events = ref([])
    const eventSpaces = ref([])
    const eventEquipment = ref([])
    const cateringServices = ref([])
    const eventTypes = ref([])
    
    const newEvent = ref({
      name: '',
      start_date: '',
      end_date: '',
      event_type_id: null,
      description: ''
    })
    
    const eventColumns = [
      { name: 'name', label: 'Event Name', field: 'name', align: 'left' },
      { name: 'type', label: 'Type', field: row => row.event_type?.name || 'N/A', align: 'left' },
      { name: 'start_date', label: 'Start Date', field: 'start_date', align: 'left' },
      { name: 'end_date', label: 'End Date', field: 'end_date', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: '', align: 'center' }
    ]
    
    const cateringColumns = [
      { name: 'menu_type', label: 'Menu Type', field: 'menu_type', align: 'left' },
      { name: 'price_per_person', label: 'Price per Person', field: 'price_per_person', align: 'left' },
      { name: 'minimum_guests', label: 'Min Guests', field: 'minimum_guests', align: 'center' },
      { name: 'is_available', label: 'Available', field: 'is_available', align: 'center' }
    ]
    
    const filteredEvents = computed(() => {
      if (!eventSearch.value) return events.value
      return events.value.filter(event => 
        event.name.toLowerCase().includes(eventSearch.value.toLowerCase())
      )
    })
    
    function getStatusColor(status) {
      const colors = {
        'planned': 'info',
        'confirmed': 'positive',
        'in_progress': 'warning',
        'completed': 'grey',
        'cancelled': 'negative'
      }
      return colors[status] || 'grey'
    }
    
    async function loadData() {
      loading.value = true
      try {
        const [eventsData, spacesData, equipmentData, cateringData, typesData] = await Promise.all([
          eventService.getEvents(),
          eventService.getEventSpaces(),
          eventService.getEventEquipment(),
          eventService.getCateringServices(),
          eventService.getEventTypes()
        ])
        
        events.value = eventsData.data || []
        eventSpaces.value = spacesData.data || []
        eventEquipment.value = equipmentData.data || []
        cateringServices.value = cateringData.data || []
        eventTypes.value = typesData.data || []
        
        // Update stats
        stats.value = {
          totalEvents: events.value.length,
          upcomingEvents: events.value.filter(e => new Date(e.start_date) > new Date()).length,
          activeSpaces: eventSpaces.value.filter(s => s.is_available).length,
          monthlyRevenue: '$' + (Math.random() * 50000).toFixed(0)
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load event data'
        })
      } finally {
        loading.value = false
      }
    }
    
    async function createEvent() {
      try {
        await eventService.createEvent(newEvent.value)
        $q.notify({
          type: 'positive',
          message: 'Event created successfully'
        })
        showCreateEventDialog.value = false
        newEvent.value = { name: '', start_date: '', end_date: '', event_type_id: null, description: '' }
        loadData()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to create event'
        })
      }
    }
    
    function editEvent(event) {
      // TODO: Implement edit functionality
      $q.notify({
        type: 'info',
        message: 'Edit functionality coming soon'
      })
    }
    
    function deleteEvent(event) {
      // TODO: Implement delete functionality
      $q.notify({
        type: 'info',
        message: 'Delete functionality coming soon'
      })
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      loading,
      activeTab,
      eventSearch,
      showCreateEventDialog,
      stats,
      events,
      eventSpaces,
      eventEquipment,
      cateringServices,
      eventTypes,
      newEvent,
      eventColumns,
      cateringColumns,
      filteredEvents,
      getStatusColor,
      createEvent,
      editEvent,
      deleteEvent
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.space-card {
  transition: transform 0.2s;
}

.space-card:hover {
  transform: translateY(-2px);
}
</style>