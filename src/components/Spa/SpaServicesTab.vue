<template>
  <div class="spa-services-tab">
    <div class="tab-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <h6 class="tab-title">Spa Services</h6>
          <p class="tab-subtitle">Manage spa treatments and service packages</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Add Service"
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
              placeholder="Search services..."
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
              v-model="categoryFilter"
              :options="categoryOptions"
              label="Category"
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
        </div>
      </div>

      <!-- Services Grid -->
      <div class="services-grid" v-if="!loading">
        <div
          v-for="service in filteredServices"
          :key="service.id"
          class="service-card"
        >
          <q-card class="service-item">
            <div class="service-image">
              <img :src="service.image || '/spa-default.jpg'" :alt="service.name" />
              <div class="service-status" :class="`status-${service.status}`">
                {{ service.status }}
              </div>
            </div>
            
            <q-card-section>
              <div class="service-header">
                <h6 class="service-name">{{ service.name }}</h6>
                <div class="service-price">${{ service.price }}</div>
              </div>
              
              <div class="service-details">
                <div class="service-category">
                  <q-icon name="category" size="sm" />
                  {{ service.category }}
                </div>
                <div class="service-duration">
                  <q-icon name="schedule" size="sm" />
                  {{ service.duration }} min
                </div>
              </div>
              
              <p class="service-description">{{ service.description }}</p>
              
              <div class="service-stats">
                <div class="stat-item">
                  <span class="stat-label">Bookings:</span>
                  <span class="stat-value">{{ service.bookings || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Rating:</span>
                  <span class="stat-value">
                    <q-icon name="star" color="amber" />
                    {{ service.rating || 'N/A' }}
                  </span>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn
                flat
                icon="edit"
                color="primary"
                @click="$emit('edit', service)"
              />
              <q-btn
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(service)"
              />
              <q-btn
                flat
                icon="more_vert"
                color="grey"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable @click="duplicateService(service)">
                      <q-item-section avatar>
                        <q-icon name="content_copy" />
                      </q-item-section>
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>
                    <q-item clickable @click="toggleStatus(service)">
                      <q-item-section avatar>
                        <q-icon :name="service.status === 'active' ? 'pause' : 'play_arrow'" />
                      </q-item-section>
                      <q-item-section>
                        {{ service.status === 'active' ? 'Deactivate' : 'Activate' }}
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
        <p>Loading services...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredServices.length === 0" class="empty-state">
        <q-icon name="spa" size="4rem" color="grey-5" />
        <h6>No services found</h6>
        <p>Create your first spa service to get started</p>
        <q-btn
          color="primary"
          icon="add"
          label="Add Service"
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
  services: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'create', 'edit', 'delete'])

const $q = useQuasar()

const searchQuery = ref('')
const categoryFilter = ref(null)
const statusFilter = ref(null)

const categoryOptions = [
  'Massage',
  'Facial',
  'Body Treatment',
  'Wellness',
  'Package'
]

const statusOptions = [
  'active',
  'inactive',
  'maintenance'
]

const filteredServices = computed(() => {
  let filtered = props.services

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(service => service.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(service => service.status === statusFilter.value)
  }

  return filtered
})

const confirmDelete = (service) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${service.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('delete', service.id)
  })
}

const duplicateService = (service) => {
  const duplicated = {
    ...service,
    id: null,
    name: `${service.name} (Copy)`
  }
  emit('create', duplicated)
}

const toggleStatus = (service) => {
  const newStatus = service.status === 'active' ? 'inactive' : 'active'
  emit('edit', { ...service, status: newStatus })
}
</script>

<style lang="scss" scoped>
.spa-services-tab {
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
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    
    .service-card {
      .service-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .service-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .service-status {
            position: absolute;
            top: 12px;
            right: 12px;
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
            
            &.status-maintenance {
              background: #ff9800;
              color: white;
            }
          }
        }
        
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          
          .service-name {
            margin: 0;
            font-weight: 600;
            color: var(--q-dark);
            flex: 1;
          }
          
          .service-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--q-primary);
            margin-left: 12px;
          }
        }
        
        .service-details {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          
          .service-category,
          .service-duration {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.875rem;
            color: var(--q-dark);
            opacity: 0.8;
          }
        }
        
        .service-description {
          font-size: 0.875rem;
          color: var(--q-dark);
          opacity: 0.8;
          margin-bottom: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .service-stats {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            
            .stat-label {
              font-size: 0.75rem;
              color: var(--q-dark);
              opacity: 0.7;
            }
            
            .stat-value {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
              display: flex;
              align-items: center;
              gap: 2px;
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
  .spa-services-tab {
    .services-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>