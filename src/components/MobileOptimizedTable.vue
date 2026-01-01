<template>
  <div class="mobile-optimized-table">
    <!-- Desktop Table View -->
    <q-table
      v-if="!isMobile"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      row-key="id"
      class="desktop-table"
    >
      <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </q-table>

    <!-- Mobile Card View -->
    <div v-else class="mobile-cards">
      <!-- Search and Filter Bar -->
      <div class="mobile-table-header q-mb-md">
        <q-input
          v-model="searchQuery"
          placeholder="Search..."
          outlined
          dense
          clearable
          class="mobile-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <q-btn
          flat
          round
          dense
          icon="filter_list"
          @click="showFilters = true"
          class="q-ml-sm"
        >
          <q-badge v-if="activeFiltersCount > 0" color="primary" floating>
            {{ activeFiltersCount }}
          </q-badge>
        </q-btn>
        
        <q-btn
          flat
          round
          dense
          icon="sort"
          @click="showSortOptions = true"
          class="q-ml-sm"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mobile-loading">
        <q-card v-for="n in 3" :key="n" class="mobile-card-skeleton q-mb-md">
          <q-card-section>
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="40%" class="q-mt-sm" />
            <q-skeleton type="text" width="80%" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Mobile Cards -->
      <div v-else-if="filteredRows.length > 0" class="mobile-cards-container">
        <q-card
          v-for="row in paginatedRows"
          :key="row.id"
          class="mobile-card q-mb-md"
          clickable
          @click="onRowClick(row)"
        >
          <q-card-section>
            <!-- Primary Information -->
            <div class="mobile-card-header">
              <div class="mobile-card-title">
                {{ getCardTitle(row) }}
              </div>
              <div class="mobile-card-status">
                <slot name="status" :row="row">
                  <q-badge
                    v-if="getCardStatus(row)"
                    :color="getStatusColor(getCardStatus(row))"
                    :label="getCardStatus(row)"
                  />
                </slot>
              </div>
            </div>

            <!-- Secondary Information -->
            <div class="mobile-card-content q-mt-sm">
              <div
                v-for="field in mobileFields"
                :key="field.name"
                class="mobile-card-field"
              >
                <span class="mobile-card-label">{{ field.label }}:</span>
                <span class="mobile-card-value">
                  <slot :name="`body-cell-${field.name}`" :row="row" :value="row[field.name]">
                    {{ formatFieldValue(row[field.name], field) }}
                  </slot>
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="hasActions" class="mobile-card-actions q-mt-md">
              <slot name="actions" :row="row">
                <q-btn
                  flat
                  dense
                  icon="edit"
                  @click.stop="onEdit(row)"
                  class="q-mr-sm"
                />
                <q-btn
                  flat
                  dense
                  icon="delete"
                  @click.stop="onDelete(row)"
                />
              </slot>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-else class="mobile-empty-state text-center q-pa-lg">
        <q-icon name="inbox" size="4rem" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-6">No data available</div>
        <div class="text-body2 text-grey-5">
          {{ searchQuery ? 'No results found for your search' : 'No items to display' }}
        </div>
      </div>

      <!-- Mobile Pagination -->
      <div v-if="filteredRows.length > itemsPerPage" class="mobile-pagination q-mt-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="5"
          direction-links
          boundary-links
          color="primary"
          size="sm"
        />
      </div>
    </div>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilters" position="bottom">
      <q-card class="mobile-filters-card">
        <q-card-section>
          <div class="text-h6">Filters</div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <slot name="filters" :filters="filters" :updateFilter="updateFilter">
            <!-- Default filter implementation -->
            <div v-for="filter in availableFilters" :key="filter.name" class="q-mb-md">
              <q-select
                v-if="filter.type === 'select'"
                v-model="filters[filter.name]"
                :options="filter.options"
                :label="filter.label"
                outlined
                dense
                clearable
              />
              <q-input
                v-else-if="filter.type === 'text'"
                v-model="filters[filter.name]"
                :label="filter.label"
                outlined
                dense
                clearable
              />
              <q-range
                v-else-if="filter.type === 'range'"
                v-model="filters[filter.name]"
                :min="filter.min"
                :max="filter.max"
                :label="filter.label"
                label-always
              />
            </div>
          </slot>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Clear All" @click="clearFilters" />
          <q-btn flat label="Close" @click="showFilters = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Sort Options Dialog -->
    <q-dialog v-model="showSortOptions" position="bottom">
      <q-card class="mobile-sort-card">
        <q-card-section>
          <div class="text-h6">Sort By</div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <q-list>
            <q-item
              v-for="option in sortOptions"
              :key="option.value"
              clickable
              @click="setSortOption(option)"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="currentSort"
                  :val="option.value"
                  color="primary"
                />
              </q-item-section>
            </q-item>
          </q-list>
          
          <q-separator class="q-my-md" />
          
          <q-btn-toggle
            v-model="sortDirection"
            :options="[
              { label: 'Ascending', value: 'asc', icon: 'arrow_upward' },
              { label: 'Descending', value: 'desc', icon: 'arrow_downward' }
            ]"
            color="primary"
            toggle-color="primary"
            outline
            class="full-width"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showSortOptions = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMobile } from '../composables/useMobile'

// Props
const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
  },
  mobileFields: {
    type: Array,
    default: () => []
  },
  titleField: {
    type: String,
    default: 'name'
  },
  statusField: {
    type: String,
    default: 'status'
  },
  hasActions: {
    type: Boolean,
    default: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  availableFilters: {
    type: Array,
    default: () => []
  },
  sortOptions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['request', 'row-click', 'edit', 'delete'])

// Composables
const { isMobile, hapticFeedback } = useMobile()

// Reactive state
const searchQuery = ref('')
const showFilters = ref(false)
const showSortOptions = ref(false)
const filters = ref({})
const currentSort = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)

// Computed properties
const filteredRows = computed(() => {
  let filtered = [...props.rows]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(query)
      )
    })
  }
  
  // Apply custom filters
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      filtered = filtered.filter(row => {
        if (Array.isArray(value)) {
          return value.includes(row[key])
        }
        return String(row[key]).toLowerCase().includes(String(value).toLowerCase())
      })
    }
  })
  
  // Apply sorting
  if (currentSort.value) {
    filtered.sort((a, b) => {
      const aVal = a[currentSort.value]
      const bVal = b[currentSort.value]
      
      let comparison = 0
      if (aVal > bVal) comparison = 1
      if (aVal < bVal) comparison = -1
      
      return sortDirection.value === 'desc' ? -comparison : comparison
    })
  }
  
  return filtered
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredRows.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / props.itemsPerPage)
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length
})

// Methods
const getCardTitle = (row) => {
  return row[props.titleField] || 'Untitled'
}

const getCardStatus = (row) => {
  return row[props.statusField]
}

const getStatusColor = (status) => {
  const statusColors = {
    active: 'positive',
    inactive: 'negative',
    pending: 'warning',
    confirmed: 'positive',
    cancelled: 'negative',
    completed: 'info'
  }
  return statusColors[status?.toLowerCase()] || 'grey'
}

const formatFieldValue = (value, field) => {
  if (field.format === 'date' && value) {
    return new Date(value).toLocaleDateString()
  }
  if (field.format === 'currency' && value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
  return value || '-'
}

const onRequest = (props) => {
  emit('request', props)
}

const onRowClick = (row) => {
  hapticFeedback('light')
  emit('row-click', row)
}

const onEdit = (row) => {
  hapticFeedback('medium')
  emit('edit', row)
}

const onDelete = (row) => {
  hapticFeedback('heavy')
  emit('delete', row)
}

const updateFilter = (filterName, value) => {
  filters.value[filterName] = value
}

const clearFilters = () => {
  filters.value = {}
  searchQuery.value = ''
  currentPage.value = 1
}

const setSortOption = (option) => {
  currentSort.value = option.value
  currentPage.value = 1
  showSortOptions.value = false
}

// Watch for pagination changes
watch(currentPage, () => {
  hapticFeedback('light')
})

// Watch for search changes
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style lang="scss" scoped>
.mobile-optimized-table {
  .mobile-table-header {
    display: flex;
    align-items: center;
    
    .mobile-search {
      flex: 1;
    }
  }
  
  .mobile-card {
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .mobile-card-title {
        font-weight: 600;
        font-size: 1.1rem;
        flex: 1;
      }
      
      .mobile-card-status {
        margin-left: 12px;
      }
    }
    
    .mobile-card-content {
      .mobile-card-field {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        
        .mobile-card-label {
          font-weight: 500;
          color: var(--q-color-grey-7);
          font-size: 0.9rem;
          flex: 1;
        }
        
        .mobile-card-value {
          font-weight: 400;
          text-align: right;
          flex: 1;
        }
      }
    }
    
    .mobile-card-actions {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--q-color-grey-3);
      padding-top: 12px;
      margin-top: 12px;
    }
  }
  
  .mobile-card-skeleton {
    .q-skeleton {
      border-radius: 4px;
    }
  }
  
  .mobile-empty-state {
    padding: 60px 20px;
  }
  
  .mobile-pagination {
    display: flex;
    justify-content: center;
  }
  
  .mobile-filters-card,
  .mobile-sort-card {
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    overflow-y: auto;
  }
}

// Dark mode adjustments
.body--dark {
  .mobile-card {
    .mobile-card-actions {
      border-top-color: var(--q-color-grey-8);
    }
    
    .mobile-card-label {
      color: var(--q-color-grey-4);
    }
  }
}

// Small mobile adjustments
@media (max-width: 400px) {
  .mobile-card {
    .mobile-card-header {
      flex-direction: column;
      align-items: flex-start;
      
      .mobile-card-status {
        margin-left: 0;
        margin-top: 8px;
      }
    }
    
    .mobile-card-field {
      flex-direction: column;
      align-items: flex-start;
      
      .mobile-card-value {
        text-align: left;
        margin-top: 2px;
      }
    }
  }
}
</style>