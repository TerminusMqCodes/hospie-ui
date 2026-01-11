<template>
  <div class="spa-inventory-tab">
    <div class="tab-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <h6 class="tab-title">Spa Inventory</h6>
          <p class="tab-subtitle">Manage products, supplies, and equipment</p>
        </div>
        <div class="col-auto">
          <q-btn-group>
            <q-btn
              color="primary"
              icon="add"
              label="Add Item"
              @click="$emit('create')"
            />
            <q-btn
              color="secondary"
              icon="download"
              label="Export"
              outline
              @click="exportInventory"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <q-separator />

    <div class="tab-content q-pa-md">
      <!-- Filters and Stats -->
      <div class="inventory-overview q-mb-md">
        <div class="row q-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="stat-card low-stock">
              <q-card-section>
                <div class="stat-content">
                  <q-icon name="warning" size="md" />
                  <div class="stat-info">
                    <div class="stat-value">{{ lowStockCount }}</div>
                    <div class="stat-label">Low Stock Items</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="stat-card total-value">
              <q-card-section>
                <div class="stat-content">
                  <q-icon name="attach_money" size="md" />
                  <div class="stat-info">
                    <div class="stat-value">${{ formatNumber(totalInventoryValue) }}</div>
                    <div class="stat-label">Total Value</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="stat-card total-items">
              <q-card-section>
                <div class="stat-content">
                  <q-icon name="inventory" size="md" />
                  <div class="stat-info">
                    <div class="stat-value">{{ totalItems }}</div>
                    <div class="stat-label">Total Items</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="stat-card categories">
              <q-card-section>
                <div class="stat-content">
                  <q-icon name="category" size="md" />
                  <div class="stat-info">
                    <div class="stat-value">{{ uniqueCategories }}</div>
                    <div class="stat-label">Categories</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section q-mb-md">
        <div class="row q-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="searchQuery"
              placeholder="Search inventory..."
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
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="stockFilter"
              :options="stockOptions"
              label="Stock Level"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-btn-toggle
              v-model="viewMode"
              :options="viewModeOptions"
              outline
              color="primary"
            />
          </div>
        </div>
      </div>

      <!-- Inventory Table View -->
      <div v-if="viewMode === 'table' && !loading" class="inventory-table">
        <q-table
          :rows="filteredInventory"
          :columns="inventoryColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 20 }"
          class="inventory-data-table"
        >
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-avatar size="40px" square>
                <img :src="props.row.image || '/product-default.jpg'" :alt="props.row.name" />
              </q-avatar>
            </q-td>
          </template>
          
          <template v-slot:body-cell-stock="props">
            <q-td :props="props">
              <div class="stock-cell">
                <div class="stock-info">
                  <span class="current-stock">{{ props.row.currentStock }}</span>
                  <span class="stock-unit">{{ props.row.unit }}</span>
                </div>
                <q-linear-progress
                  :value="props.row.currentStock / props.row.maxStock"
                  :color="getStockColor(props.row.currentStock, props.row.minStock)"
                  size="4px"
                  class="q-mt-xs"
                />
              </div>
            </q-td>
          </template>
          
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                :label="props.row.status"
              />
            </q-td>
          </template>
          
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                icon="edit"
                color="primary"
                @click="$emit('edit', props.row)"
                tooltip="Edit Item"
              />
              <q-btn
                flat
                icon="add_shopping_cart"
                color="secondary"
                @click="$emit('reorder', props.row)"
                tooltip="Reorder"
                :disable="props.row.status === 'discontinued'"
              />
              <q-btn
                flat
                icon="more_vert"
                color="grey"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable @click="adjustStock(props.row)">
                      <q-item-section avatar>
                        <q-icon name="tune" />
                      </q-item-section>
                      <q-item-section>Adjust Stock</q-item-section>
                    </q-item>
                    <q-item clickable @click="viewHistory(props.row)">
                      <q-item-section avatar>
                        <q-icon name="history" />
                      </q-item-section>
                      <q-item-section>View History</q-item-section>
                    </q-item>
                    <q-item clickable @click="setReorderPoint(props.row)">
                      <q-item-section avatar>
                        <q-icon name="notifications" />
                      </q-item-section>
                      <q-item-section>Set Reorder Point</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Inventory Grid View -->
      <div v-if="viewMode === 'grid' && !loading" class="inventory-grid">
        <div
          v-for="item in filteredInventory"
          :key="item.id"
          class="inventory-card"
        >
          <q-card class="inventory-item" :class="getItemClass(item)">
            <div class="item-image">
              <img :src="item.image || '/product-default.jpg'" :alt="item.name" />
              <div class="item-status" :class="`status-${item.status}`">
                {{ item.status }}
              </div>
            </div>
            
            <q-card-section>
              <div class="item-header">
                <h6 class="item-name">{{ item.name }}</h6>
                <div class="item-sku">SKU: {{ item.sku }}</div>
              </div>
              
              <div class="item-details">
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ item.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Supplier:</span>
                  <span class="detail-value">{{ item.supplier }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cost:</span>
                  <span class="detail-value">${{ item.unitCost }}</span>
                </div>
              </div>
              
              <div class="stock-info">
                <div class="stock-header">
                  <span class="stock-label">Stock Level</span>
                  <span class="stock-value">{{ item.currentStock }} {{ item.unit }}</span>
                </div>
                <q-linear-progress
                  :value="item.currentStock / item.maxStock"
                  :color="getStockColor(item.currentStock, item.minStock)"
                  size="8px"
                  class="q-mt-xs"
                />
                <div class="stock-limits">
                  <span class="min-stock">Min: {{ item.minStock }}</span>
                  <span class="max-stock">Max: {{ item.maxStock }}</span>
                </div>
              </div>
              
              <div class="item-actions">
                <q-btn
                  flat
                  icon="remove"
                  color="negative"
                  @click="adjustStock(item, -1)"
                  :disable="item.currentStock <= 0"
                />
                <q-btn
                  flat
                  icon="add"
                  color="positive"
                  @click="adjustStock(item, 1)"
                />
                <q-btn
                  flat
                  icon="add_shopping_cart"
                  color="primary"
                  @click="$emit('reorder', item)"
                  :disable="item.status === 'discontinued'"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <q-spinner-gears size="50px" color="primary" />
        <p>Loading inventory...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredInventory.length === 0" class="empty-state">
        <q-icon name="inventory" size="4rem" color="grey-5" />
        <h6>No inventory items found</h6>
        <p>Add your first inventory item to get started</p>
        <q-btn
          color="primary"
          icon="add"
          label="Add Item"
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
  inventory: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'create', 'edit', 'reorder'])

const $q = useQuasar()

const searchQuery = ref('')
const categoryFilter = ref(null)
const statusFilter = ref(null)
const stockFilter = ref(null)
const viewMode = ref('table')

const categoryOptions = [
  'Oils & Lotions',
  'Towels & Linens',
  'Equipment',
  'Aromatherapy',
  'Skincare',
  'Cleaning Supplies',
  'Retail Products'
]

const statusOptions = [
  'active',
  'low-stock',
  'out-of-stock',
  'discontinued'
]

const stockOptions = [
  'in-stock',
  'low-stock',
  'out-of-stock'
]

const viewModeOptions = [
  { label: 'Table', value: 'table' },
  { label: 'Grid', value: 'grid' }
]

const inventoryColumns = [
  { name: 'image', label: '', field: 'image', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
  { name: 'supplier', label: 'Supplier', field: 'supplier', align: 'left', sortable: true },
  { name: 'stock', label: 'Stock', field: 'currentStock', align: 'center', sortable: true },
  { name: 'unitCost', label: 'Unit Cost', field: 'unitCost', align: 'right', sortable: true, format: val => `$${val}` },
  { name: 'totalValue', label: 'Total Value', field: row => row.currentStock * row.unitCost, align: 'right', sortable: true, format: val => `$${val.toFixed(2)}` },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const filteredInventory = computed(() => {
  let filtered = props.inventory

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  if (stockFilter.value) {
    filtered = filtered.filter(item => {
      if (stockFilter.value === 'in-stock') return item.currentStock > item.minStock
      if (stockFilter.value === 'low-stock') return item.currentStock <= item.minStock && item.currentStock > 0
      if (stockFilter.value === 'out-of-stock') return item.currentStock === 0
      return true
    })
  }

  return filtered
})

const lowStockCount = computed(() => {
  return props.inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length
})

const totalInventoryValue = computed(() => {
  return props.inventory.reduce((total, item) => total + (item.currentStock * item.unitCost), 0)
})

const totalItems = computed(() => {
  return props.inventory.reduce((total, item) => total + item.currentStock, 0)
})

const uniqueCategories = computed(() => {
  return new Set(props.inventory.map(item => item.category)).size
})

const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number)
}

const getStockColor = (current, min) => {
  if (current === 0) return 'negative'
  if (current <= min) return 'warning'
  return 'positive'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    'low-stock': 'warning',
    'out-of-stock': 'negative',
    discontinued: 'grey'
  }
  return colors[status] || 'grey'
}

const getItemClass = (item) => {
  if (item.currentStock === 0) return 'out-of-stock'
  if (item.currentStock <= item.minStock) return 'low-stock'
  return 'in-stock'
}

const adjustStock = (item, adjustment = null) => {
  if (adjustment !== null) {
    // Quick adjustment
    const newStock = Math.max(0, item.currentStock + adjustment)
    emit('edit', { ...item, currentStock: newStock })
  } else {
    // Open adjustment dialog
    $q.notify({
      type: 'info',
      message: `Adjusting stock for ${item.name}`
    })
  }
}

const viewHistory = (item) => {
  $q.notify({
    type: 'info',
    message: `Viewing history for ${item.name}`
  })
}

const setReorderPoint = (item) => {
  $q.notify({
    type: 'info',
    message: `Setting reorder point for ${item.name}`
  })
}

const exportInventory = () => {
  $q.notify({
    type: 'info',
    message: 'Exporting inventory data...'
  })
}
</script>

<style lang="scss" scoped>
.spa-inventory-tab {
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
  
  .inventory-overview {
    .stat-card {
      height: 80px;
      
      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 100%;
        
        .q-icon {
          color: var(--q-primary);
        }
        
        .stat-info {
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--q-primary);
            line-height: 1;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: var(--q-dark);
            opacity: 0.7;
          }
        }
      }
      
      &.low-stock .q-icon {
        color: #ff9800;
      }
    }
  }
  
  .inventory-table {
    .stock-cell {
      .stock-info {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;
        
        .current-stock {
          font-weight: 600;
        }
        
        .stock-unit {
          font-size: 0.75rem;
          opacity: 0.7;
        }
      }
    }
  }
  
  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .inventory-card {
      .inventory-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        &.in-stock {
          border-left-color: #4caf50;
        }
        
        &.low-stock {
          border-left-color: #ff9800;
        }
        
        &.out-of-stock {
          border-left-color: #f44336;
        }
        
        .item-image {
          position: relative;
          height: 120px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .item-status {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            
            &.status-active {
              background: #4caf50;
              color: white;
            }
            
            &.status-low-stock {
              background: #ff9800;
              color: white;
            }
            
            &.status-out-of-stock {
              background: #f44336;
              color: white;
            }
            
            &.status-discontinued {
              background: #9e9e9e;
              color: white;
            }
          }
        }
        
        .item-header {
          margin-bottom: 12px;
          
          .item-name {
            margin: 0 0 4px 0;
            font-weight: 600;
            color: var(--q-dark);
            font-size: 1rem;
          }
          
          .item-sku {
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.7;
          }
        }
        
        .item-details {
          margin-bottom: 16px;
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 0.875rem;
            
            .detail-label {
              color: var(--q-dark);
              opacity: 0.7;
            }
            
            .detail-value {
              color: var(--q-dark);
              font-weight: 500;
            }
          }
        }
        
        .stock-info {
          margin-bottom: 16px;
          
          .stock-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            
            .stock-label {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-dark);
            }
            
            .stock-value {
              font-size: 0.875rem;
              font-weight: 600;
              color: var(--q-primary);
            }
          }
          
          .stock-limits {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.7;
          }
        }
        
        .item-actions {
          display: flex;
          justify-content: space-around;
          margin-top: auto;
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
  .spa-inventory-tab {
    .inventory-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>