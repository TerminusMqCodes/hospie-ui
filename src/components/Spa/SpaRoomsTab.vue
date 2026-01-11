<template>
  <div class="spa-rooms-tab">
    <div class="tab-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <h6 class="tab-title">Spa Rooms</h6>
          <p class="tab-subtitle">Manage treatment rooms and facilities</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Add Room"
            @click="$emit('create')"
          />
        </div>
      </div>
    </div>

    <q-separator />

    <div class="tab-content q-pa-md">
      <!-- Filters -->
      <div class="filters-section q-mb-md">
        <div class="row q-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="searchQuery"
              placeholder="Search rooms..."
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="typeFilter"
              :options="typeOptions"
              label="Room Type"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="availabilityFilter"
              :options="availabilityOptions"
              label="Availability"
              outlined
              dense
              clearable
            />
          </div>
        </div>
      </div>

      <!-- Rooms Grid -->
      <div class="rooms-grid" v-if="!loading">
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card"
        >
          <q-card class="room-item" :class="`status-${room.status}`">
            <div class="room-image">
              <img :src="room.image || '/spa-room-default.jpg'" :alt="room.name" />
              <div class="room-status" :class="`status-${room.status}`">
                {{ getStatusLabel(room.status) }}
              </div>
              <div class="room-number">{{ room.number }}</div>
            </div>
            
            <q-card-section>
              <div class="room-header">
                <h6 class="room-name">{{ room.name }}</h6>
                <div class="room-type">{{ room.type }}</div>
              </div>
              
              <div class="room-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <q-icon name="square_foot" size="sm" />
                    <span>{{ room.size }} sq ft</span>
                  </div>
                  <div class="detail-item">
                    <q-icon name="people" size="sm" />
                    <span>{{ room.capacity }} guests</span>
                  </div>
                </div>
                
                <div class="room-amenities">
                  <div class="amenities-label">Amenities:</div>
                  <div class="amenities-list">
                    <q-chip
                      v-for="amenity in room.amenities"
                      :key="amenity"
                      size="sm"
                      outline
                      color="primary"
                    >
                      {{ amenity }}
                    </q-chip>
                  </div>
                </div>
                
                <div class="room-schedule">
                  <div class="schedule-label">Today's Schedule:</div>
                  <div class="schedule-info">
                    <div v-if="room.currentAppointment" class="current-appointment">
                      <q-icon name="schedule" color="primary" />
                      <span>{{ room.currentAppointment.time }} - {{ room.currentAppointment.service }}</span>
                    </div>
                    <div v-else class="no-appointment">
                      <q-icon name="check_circle" color="positive" />
                      <span>Available</span>
                    </div>
                  </div>
                  
                  <div v-if="room.nextAppointment" class="next-appointment">
                    <div class="next-label">Next:</div>
                    <div class="next-info">
                      {{ room.nextAppointment.time }} - {{ room.nextAppointment.service }}
                    </div>
                  </div>
                </div>
                
                <div class="room-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ room.utilizationToday || 0 }}%</div>
                    <div class="stat-label">Today's Utilization</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ room.appointmentsToday || 0 }}</div>
                    <div class="stat-label">Appointments</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${{ room.revenueToday || 0 }}</div>
                    <div class="stat-label">Revenue</div>
                  </div>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn
                flat
                icon="schedule"
                color="primary"
                @click="viewSchedule(room)"
                tooltip="View Schedule"
              />
              <q-btn
                flat
                icon="edit"
                color="primary"
                @click="$emit('edit', room)"
                tooltip="Edit Room"
              />
              <q-btn
                flat
                :icon="getStatusIcon(room.status)"
                :color="getStatusColor(room.status)"
                @click="toggleRoomStatus(room)"
                :tooltip="getStatusAction(room.status)"
              />
              <q-btn
                flat
                icon="more_vert"
                color="grey"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable @click="viewAnalytics(room)">
                      <q-item-section avatar>
                        <q-icon name="analytics" />
                      </q-item-section>
                      <q-item-section>View Analytics</q-item-section>
                    </q-item>
                    <q-item clickable @click="scheduleMaintenance(room)">
                      <q-item-section avatar>
                        <q-icon name="build" />
                      </q-item-section>
                      <q-item-section>Schedule Maintenance</q-item-section>
                    </q-item>
                    <q-item clickable @click="manageEquipment(room)">
                      <q-item-section avatar>
                        <q-icon name="inventory_2" />
                      </q-item-section>
                      <q-item-section>Manage Equipment</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable @click="duplicateRoom(room)">
                      <q-item-section avatar>
                        <q-icon name="content_copy" />
                      </q-item-section>
                      <q-item-section>Duplicate Room</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <q-spinner-gears size="50px" color="primary" />
        <p>Loading rooms...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredRooms.length === 0" class="empty-state">
        <q-icon name="room_service" size="4rem" color="grey-5" />
        <h6>No rooms found</h6>
        <p>Add your first spa room to get started</p>
        <q-btn
          color="primary"
          icon="add"
          label="Add Room"
          @click="$emit('create')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  rooms: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'create', 'edit', 'status'])

const $q = useQuasar()

const searchQuery = ref('')
const typeFilter = ref(null)
const statusFilter = ref(null)
const availabilityFilter = ref(null)

const typeOptions = [
  'Massage Room',
  'Facial Room',
  'Couples Room',
  'VIP Suite',
  'Relaxation Room',
  'Steam Room',
  'Sauna'
]

const statusOptions = [
  'available',
  'occupied',
  'maintenance',
  'cleaning',
  'out-of-order'
]

const availabilityOptions = [
  'available',
  'busy',
  'maintenance'
]

const filteredRooms = computed(() => {
  let filtered = props.rooms

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(room =>
      room.name.toLowerCase().includes(query) ||
      room.number.toLowerCase().includes(query) ||
      room.type.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(room => room.type === typeFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(room => room.status === statusFilter.value)
  }

  if (availabilityFilter.value) {
    filtered = filtered.filter(room => {
      if (availabilityFilter.value === 'available') return room.status === 'available'
      if (availabilityFilter.value === 'busy') return room.status === 'occupied'
      if (availabilityFilter.value === 'maintenance') return ['maintenance', 'cleaning', 'out-of-order'].includes(room.status)
      return true
    })
  }

  return filtered
})

const getStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    cleaning: 'Cleaning',
    'out-of-order': 'Out of Order'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    available: 'check_circle',
    occupied: 'cancel',
    maintenance: 'build',
    cleaning: 'cleaning_services',
    'out-of-order': 'error'
  }
  return icons[status] || 'help'
}

const getStatusColor = (status) => {
  const colors = {
    available: 'positive',
    occupied: 'negative',
    maintenance: 'warning',
    cleaning: 'info',
    'out-of-order': 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusAction = (status) => {
  const actions = {
    available: 'Mark as Occupied',
    occupied: 'Mark as Available',
    maintenance: 'Complete Maintenance',
    cleaning: 'Complete Cleaning',
    'out-of-order': 'Mark as Available'
  }
  return actions[status] || 'Change Status'
}

const toggleRoomStatus = (room) => {
  let newStatus = 'available'
  
  if (room.status === 'available') {
    newStatus = 'occupied'
  } else if (room.status === 'occupied') {
    newStatus = 'available'
  } else if (room.status === 'maintenance') {
    newStatus = 'available'
  } else if (room.status === 'cleaning') {
    newStatus = 'available'
  }
  
  emit('status', { ...room, status: newStatus })
}

const viewSchedule = (room) => {
  $q.notify({
    type: 'info',
    message: `Viewing schedule for ${room.name}`
  })
}

const viewAnalytics = (room) => {
  $q.notify({
    type: 'info',
    message: `Viewing analytics for ${room.name}`
  })
}

const scheduleMaintenance = (room) => {
  $q.notify({
    type: 'info',
    message: `Scheduling maintenance for ${room.name}`
  })
}

const manageEquipment = (room) => {
  $q.notify({
    type: 'info',
    message: `Managing equipment for ${room.name}`
  })
}

const duplicateRoom = (room) => {
  const duplicated = {
    ...room,
    id: null,
    name: `${room.name} (Copy)`,
    number: `${room.number}-Copy`
  }
  emit('create', duplicated)
}
</script>

<style lang="scss" scoped>
.spa-rooms-tab {
  .tab-header {
    background: rgba(0, 0, 0, 0.02);
    
    .tab-title {
      margin: 0;
      font-weight: 600;
      color: var(--q-primary);
    }
    
    .tab-subtitle {
      margin: 4px 0 0 0;
      color: var(--q-dark);
      opacity: 0.7;
    }
  }
  
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
    
    .room-card {
      .room-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        &.status-available {
          border-left-color: #4caf50;
        }
        
        &.status-occupied {
          border-left-color: #f44336;
        }
        
        &.status-maintenance {
          border-left-color: #ff9800;
        }
        
        &.status-cleaning {
          border-left-color: #2196f3;
        }
        
        &.status-out-of-order {
          border-left-color: #9c27b0;
        }
        
        .room-image {
          position: relative;
          height: 180px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .room-status {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            
            &.status-available {
              background: #4caf50;
              color: white;
            }
            
            &.status-occupied {
              background: #f44336;
              color: white;
            }
            
            &.status-maintenance {
              background: #ff9800;
              color: white;
            }
            
            &.status-cleaning {
              background: #2196f3;
              color: white;
            }
            
            &.status-out-of-order {
              background: #9c27b0;
              color: white;
            }
          }
          
          .room-number {
            position: absolute;
            top: 12px;
            left: 12px;
            padding: 6px 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 8px;
            font-weight: 600;
          }
        }
        
        .room-header {
          margin-bottom: 12px;
          
          .room-name {
            margin: 0 0 4px 0;
            font-weight: 600;
            color: var(--q-dark);
          }
          
          .room-type {
            font-size: 0.875rem;
            color: var(--q-primary);
          }
        }
        
        .room-details {
          .detail-row {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            
            .detail-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 0.875rem;
              color: var(--q-dark);
              opacity: 0.8;
            }
          }
          
          .room-amenities {
            margin-bottom: 16px;
            
            .amenities-label {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
              margin-bottom: 6px;
            }
            
            .amenities-list {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
          }
          
          .room-schedule {
            margin-bottom: 16px;
            
            .schedule-label {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
              margin-bottom: 6px;
            }
            
            .schedule-info {
              .current-appointment,
              .no-appointment {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.875rem;
                margin-bottom: 4px;
              }
            }
            
            .next-appointment {
              font-size: 0.75rem;
              color: var(--q-dark);
              opacity: 0.7;
              
              .next-label {
                font-weight: 600;
                margin-bottom: 2px;
              }
            }
          }
          
          .room-stats {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 8px;
            
            .stat-item {
              text-align: center;
              
              .stat-value {
                font-size: 1rem;
                font-weight: bold;
                color: var(--q-primary);
                line-height: 1;
              }
              
              .stat-label {
                font-size: 0.7rem;
                color: var(--q-dark);
                opacity: 0.7;
                margin-top: 2px;
              }
            }
          }
        }
      }
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    
    p {
      margin-top: 16px;
      color: var(--q-dark);
      opacity: 0.7;
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    
    h6 {
      margin: 16px 0 8px 0;
      color: var(--q-dark);
    }
    
    p {
      margin-bottom: 24px;
      color: var(--q-dark);
      opacity: 0.7;
    }
  }
}

@media (max-width: 768px) {
  .spa-rooms-tab {
    .rooms-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>