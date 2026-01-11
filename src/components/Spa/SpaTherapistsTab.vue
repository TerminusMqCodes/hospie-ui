<template>
  <div class="spa-therapists-tab">
    <div class="tab-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <h6 class="tab-title">Spa Therapists</h6>
          <p class="tab-subtitle">Manage therapist profiles and schedules</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Add Therapist"
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
              placeholder="Search therapists..."
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
              v-model="specialtyFilter"
              :options="specialtyOptions"
              label="Specialty"
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

      <!-- Therapists Grid -->
      <div class="therapists-grid" v-if="!loading">
        <div
          v-for="therapist in filteredTherapists"
          :key="therapist.id"
          class="therapist-card"
        >
          <q-card class="therapist-item">
            <div class="therapist-header">
              <q-avatar size="80px" class="therapist-avatar">
                <img :src="therapist.avatar || '/default-avatar.jpg'" :alt="therapist.name" />
              </q-avatar>
              <div class="therapist-status" :class="`status-${therapist.status}`">
                {{ therapist.status }}
              </div>
            </div>
            
            <q-card-section>
              <div class="therapist-info">
                <h6 class="therapist-name">{{ therapist.name }}</h6>
                <div class="therapist-title">{{ therapist.title }}</div>
                
                <div class="therapist-details">
                  <div class="detail-item">
                    <q-icon name="work" size="sm" />
                    <span>{{ therapist.experience }} years experience</span>
                  </div>
                  <div class="detail-item">
                    <q-icon name="star" size="sm" color="amber" />
                    <span>{{ therapist.rating || 'N/A' }} rating</span>
                  </div>
                  <div class="detail-item">
                    <q-icon name="phone" size="sm" />
                    <span>{{ therapist.phone }}</span>
                  </div>
                  <div class="detail-item">
                    <q-icon name="email" size="sm" />
                    <span>{{ therapist.email }}</span>
                  </div>
                </div>
                
                <div class="therapist-specialties">
                  <div class="specialties-label">Specialties:</div>
                  <div class="specialties-list">
                    <q-chip
                      v-for="specialty in therapist.specialties"
                      :key="specialty"
                      size="sm"
                      color="primary"
                      text-color="white"
                    >
                      {{ specialty }}
                    </q-chip>
                  </div>
                </div>
                
                <div class="therapist-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ therapist.appointmentsToday || 0 }}</div>
                    <div class="stat-label">Today</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ therapist.appointmentsWeek || 0 }}</div>
                    <div class="stat-label">This Week</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ therapist.revenue || 0 }}%</div>
                    <div class="stat-label">Utilization</div>
                  </div>
                </div>
                
                <div class="therapist-availability">
                  <div class="availability-label">Today's Schedule:</div>
                  <div class="availability-info">
                    <q-icon 
                      :name="therapist.isAvailable ? 'check_circle' : 'cancel'"
                      :color="therapist.isAvailable ? 'positive' : 'negative'"
                    />
                    <span>{{ therapist.todaySchedule || 'Not scheduled' }}</span>
                  </div>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn
                flat
                icon="schedule"
                color="primary"
                @click="$emit('schedule', therapist)"
                tooltip="Manage Schedule"
              />
              <q-btn
                flat
                icon="edit"
                color="primary"
                @click="$emit('edit', therapist)"
                tooltip="Edit Profile"
              />
              <q-btn
                flat
                icon="more_vert"
                color="grey"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable @click="viewPerformance(therapist)">
                      <q-item-section avatar>
                        <q-icon name="analytics" />
                      </q-item-section>
                      <q-item-section>View Performance</q-item-section>
                    </q-item>
                    <q-item clickable @click="manageLeave(therapist)">
                      <q-item-section avatar>
                        <q-icon name="event_busy" />
                      </q-item-section>
                      <q-item-section>Manage Leave</q-item-section>
                    </q-item>
                    <q-item clickable @click="sendMessage(therapist)">
                      <q-item-section avatar>
                        <q-icon name="message" />
                      </q-item-section>
                      <q-item-section>Send Message</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable @click="toggleStatus(therapist)">
                      <q-item-section avatar>
                        <q-icon :name="therapist.status === 'active' ? 'pause' : 'play_arrow'" />
                      </q-item-section>
                      <q-item-section>
                        {{ therapist.status === 'active' ? 'Deactivate' : 'Activate' }}
                      </q-item-section>
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
        <p>Loading therapists...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredTherapists.length === 0" class="empty-state">
        <q-icon name="people" size="4rem" color="grey-5" />
        <h6>No therapists found</h6>
        <p>Add your first therapist to get started</p>
        <q-btn
          color="primary"
          icon="add"
          label="Add Therapist"
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
  therapists: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'create', 'edit', 'schedule'])

const $q = useQuasar()

const searchQuery = ref('')
const specialtyFilter = ref(null)
const statusFilter = ref(null)
const availabilityFilter = ref(null)

const specialtyOptions = [
  'Swedish Massage',
  'Deep Tissue',
  'Hot Stone',
  'Aromatherapy',
  'Facial Treatments',
  'Body Wraps',
  'Reflexology',
  'Thai Massage'
]

const statusOptions = [
  'active',
  'inactive',
  'on-leave',
  'training'
]

const availabilityOptions = [
  'available',
  'busy',
  'off-duty'
]

const filteredTherapists = computed(() => {
  let filtered = props.therapists

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(therapist =>
      therapist.name.toLowerCase().includes(query) ||
      therapist.title.toLowerCase().includes(query) ||
      therapist.email.toLowerCase().includes(query) ||
      therapist.specialties.some(s => s.toLowerCase().includes(query))
    )
  }

  if (specialtyFilter.value) {
    filtered = filtered.filter(therapist => 
      therapist.specialties.includes(specialtyFilter.value)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(therapist => therapist.status === statusFilter.value)
  }

  if (availabilityFilter.value) {
    filtered = filtered.filter(therapist => {
      if (availabilityFilter.value === 'available') return therapist.isAvailable
      if (availabilityFilter.value === 'busy') return !therapist.isAvailable && therapist.status === 'active'
      if (availabilityFilter.value === 'off-duty') return therapist.status !== 'active'
      return true
    })
  }

  return filtered
})

const viewPerformance = (therapist) => {
  $q.notify({
    type: 'info',
    message: `Viewing performance for ${therapist.name}`
  })
}

const manageLeave = (therapist) => {
  $q.notify({
    type: 'info',
    message: `Managing leave for ${therapist.name}`
  })
}

const sendMessage = (therapist) => {
  $q.notify({
    type: 'info',
    message: `Sending message to ${therapist.name}`
  })
}

const toggleStatus = (therapist) => {
  const newStatus = therapist.status === 'active' ? 'inactive' : 'active'
  emit('edit', { ...therapist, status: newStatus })
}
</script>

<style lang="scss" scoped>
.spa-therapists-tab {
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
  
  .therapists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    
    .therapist-card {
      .therapist-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .therapist-header {
          position: relative;
          display: flex;
          justify-content: center;
          padding: 20px 20px 0 20px;
          
          .therapist-avatar {
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .therapist-status {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            
            &.status-active {
              background: #4caf50;
              color: white;
            }
            
            &.status-inactive {
              background: #f44336;
              color: white;
            }
            
            &.status-on-leave {
              background: #ff9800;
              color: white;
            }
            
            &.status-training {
              background: #2196f3;
              color: white;
            }
          }
        }
        
        .therapist-info {
          text-align: center;
          
          .therapist-name {
            margin: 12px 0 4px 0;
            font-weight: 600;
            color: var(--q-dark);
          }
          
          .therapist-title {
            font-size: 0.875rem;
            color: var(--q-primary);
            margin-bottom: 16px;
          }
          
          .therapist-details {
            text-align: left;
            margin-bottom: 16px;
            
            .detail-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
              font-size: 0.875rem;
              color: var(--q-dark);
              opacity: 0.8;
            }
          }
          
          .therapist-specialties {
            margin-bottom: 16px;
            
            .specialties-label {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
              margin-bottom: 8px;
              text-align: left;
            }
            
            .specialties-list {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
          }
          
          .therapist-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 16px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 8px;
            
            .stat-item {
              text-align: center;
              
              .stat-value {
                font-size: 1.25rem;
                font-weight: bold;
                color: var(--q-primary);
                line-height: 1;
              }
              
              .stat-label {
                font-size: 0.75rem;
                color: var(--q-dark);
                opacity: 0.7;
                margin-top: 2px;
              }
            }
          }
          
          .therapist-availability {
            .availability-label {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
              margin-bottom: 8px;
              text-align: left;
            }
            
            .availability-info {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.875rem;
              color: var(--q-dark);
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
  .spa-therapists-tab {
    .therapists-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>