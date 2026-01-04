<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Guest Management</div>
                <div class="text-subtitle2">Manage guest profiles and preferences</div>
              </div>
              <q-btn 
                color="primary" 
                icon="person_add" 
                label="New Guest" 
                @click="showCreateDialog = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Search and Filters -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md items-end">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="searchQuery"
                  label="Search guests"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterGuests"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-2">
                <q-select
                  v-model="loyaltyFilter"
                  :options="loyaltyOptions"
                  label="Loyalty Tier"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterGuests"
                />
              </div>
              
              <div class="col-12 col-md-2">
                <q-select
                  v-model="statusFilter"
                  :options="statusOptions"
                  label="Status"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterGuests"
                />
              </div>
              
              <div class="col-12 col-md-2">
                <q-btn
                  color="secondary"
                  icon="clear"
                  label="Clear"
                  outline
                  @click="clearFilters"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Guest Statistics -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Guest Statistics</div>
            <div class="row q-gutter-md">
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ guestStats.total }}</div>
                  <div class="text-subtitle2">Total Guests</div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-positive">{{ guestStats.vip }}</div>
                  <div class="text-subtitle2">VIP Guests</div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-info">{{ guestStats.returning }}</div>
                  <div class="text-subtitle2">Returning Guests</div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-warning">{{ guestStats.newThisMonth }}</div>
                  <div class="text-subtitle2">New This Month</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Guest List -->
      <div class="col-12">
        <q-card>
          <q-table
            :rows="filteredGuests"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar size="40px" class="q-mr-md">
                    <img v-if="props.row.avatar" :src="props.row.avatar" />
                    <q-icon v-else name="person" />
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.name }}</div>
                    <div class="text-caption text-grey-6">{{ props.row.email }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-loyalty="props">
              <q-td :props="props">
                <q-badge 
                  :color="getLoyaltyColor(props.row.loyalty_tier)"
                  :label="props.row.loyalty_tier"
                />
                <div class="text-caption">{{ props.row.loyalty_points }} pts</div>
              </q-td>
            </template>

            <template v-slot:body-cell-stays="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.total_stays }}</div>
                <div class="text-caption text-grey-6">Last: {{ formatDate(props.row.last_stay) }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-preferences="props">
              <q-td :props="props">
                <div v-if="props.row.preferences && props.row.preferences.length">
                  <q-chip 
                    v-for="pref in props.row.preferences.slice(0, 2)" 
                    :key="pref"
                    size="sm"
                    color="grey-3"
                    text-color="grey-8"
                  >
                    {{ pref }}
                  </q-chip>
                  <q-chip 
                    v-if="props.row.preferences.length > 2"
                    size="sm"
                    color="grey-3"
                    text-color="grey-8"
                  >
                    +{{ props.row.preferences.length - 2 }}
                  </q-chip>
                </div>
                <div v-else class="text-grey-6">None</div>
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
                    @click="viewGuest(props.row)"
                  >
                    <q-tooltip>View Profile</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    flat 
                    round 
                    icon="edit" 
                    size="sm"
                    @click="editGuest(props.row)"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    flat 
                    round 
                    icon="hotel" 
                    size="sm"
                    color="primary"
                    @click="createReservation(props.row)"
                  >
                    <q-tooltip>New Reservation</q-tooltip>
                  </q-btn>
                  
                  <q-btn 
                    flat 
                    round 
                    icon="email" 
                    size="sm"
                    color="secondary"
                    @click="sendMessage(props.row)"
                  >
                    <q-tooltip>Send Message</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Create Guest Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Create New Guest</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="newGuest.first_name"
                label="First Name *"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newGuest.last_name"
                label="Last Name *"
                outlined
                dense
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="newGuest.email"
                label="Email *"
                type="email"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newGuest.phone"
                label="Phone"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="newGuest.date_of_birth"
                label="Date of Birth"
                type="date"
                outlined
                dense
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="newGuest.nationality"
                label="Nationality"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateDialog = false" />
          <q-btn 
            color="primary" 
            label="Create" 
            @click="createGuest"
            :loading="creating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Guest Details Dialog -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Guest Profile</div>
        </q-card-section>

        <q-card-section v-if="selectedGuest">
          <div class="row q-gutter-md">
            <div class="col-12 text-center">
              <q-avatar size="80px">
                <img v-if="selectedGuest.avatar" :src="selectedGuest.avatar" />
                <q-icon v-else name="person" />
              </q-avatar>
              <div class="text-h6 q-mt-sm">{{ selectedGuest.name }}</div>
              <q-badge 
                :color="getLoyaltyColor(selectedGuest.loyalty_tier)"
                :label="selectedGuest.loyalty_tier"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Email</q-item-label>
                    <q-item-label>{{ selectedGuest.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Phone</q-item-label>
                    <q-item-label>{{ selectedGuest.phone || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Nationality</q-item-label>
                    <q-item-label>{{ selectedGuest.nationality || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div class="col-12 col-md-6">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Total Stays</q-item-label>
                    <q-item-label>{{ selectedGuest.total_stays }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Loyalty Points</q-item-label>
                    <q-item-label>{{ selectedGuest.loyalty_points }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Last Stay</q-item-label>
                    <q-item-label>{{ formatDate(selectedGuest.last_stay) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div class="col-12" v-if="selectedGuest.preferences && selectedGuest.preferences.length">
              <q-item>
                <q-item-section>
                  <q-item-label overline>Preferences</q-item-label>
                  <div class="q-gutter-xs">
                    <q-chip 
                      v-for="pref in selectedGuest.preferences" 
                      :key="pref"
                      color="primary"
                      text-color="white"
                    >
                      {{ pref }}
                    </q-chip>
                  </div>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showDetailsDialog = false" />
          <q-btn 
            color="secondary" 
            label="Edit Profile" 
            @click="editGuest(selectedGuest)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// Reactive data
const loading = ref(false)
const creating = ref(false)
const searchQuery = ref('')
const loyaltyFilter = ref(null)
const statusFilter = ref(null)
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedGuest = ref(null)

const newGuest = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  nationality: ''
})

// Mock data - in real app this would come from API
const guests = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    nationality: 'USA',
    loyalty_tier: 'Gold',
    loyalty_points: 2500,
    total_stays: 12,
    last_stay: '2024-01-15',
    preferences: ['Non-smoking', 'High floor', 'Late checkout'],
    avatar: null
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0456',
    nationality: 'Canada',
    loyalty_tier: 'Platinum',
    loyalty_points: 5200,
    total_stays: 25,
    last_stay: '2024-01-20',
    preferences: ['Ocean view', 'King bed', 'Welcome amenities'],
    avatar: null
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@email.com',
    phone: '+1-555-0789',
    nationality: 'UK',
    loyalty_tier: 'Silver',
    loyalty_points: 1200,
    total_stays: 6,
    last_stay: '2024-01-10',
    preferences: ['Quiet room', 'Ground floor'],
    avatar: null
  }
])

// Table configuration
const columns = [
  {
    name: 'name',
    label: 'Guest',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'loyalty',
    label: 'Loyalty',
    field: 'loyalty_tier',
    align: 'center'
  },
  {
    name: 'stays',
    label: 'Stays',
    field: 'total_stays',
    align: 'center'
  },
  {
    name: 'preferences',
    label: 'Preferences',
    field: 'preferences',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center'
  }
]

const loyaltyOptions = [
  { label: 'Bronze', value: 'Bronze' },
  { label: 'Silver', value: 'Silver' },
  { label: 'Gold', value: 'Gold' },
  { label: 'Platinum', value: 'Platinum' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'VIP', value: 'vip' },
  { label: 'Inactive', value: 'inactive' }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Computed properties
const filteredGuests = computed(() => {
  let filtered = guests.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(guest => 
      guest.name.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query)
    )
  }

  if (loyaltyFilter.value) {
    filtered = filtered.filter(guest => guest.loyalty_tier === loyaltyFilter.value.value)
  }

  return filtered
})

const guestStats = computed(() => {
  return {
    total: guests.value.length,
    vip: guests.value.filter(g => g.loyalty_tier === 'Platinum').length,
    returning: guests.value.filter(g => g.total_stays > 1).length,
    newThisMonth: guests.value.filter(g => {
      const lastStay = new Date(g.last_stay)
      const thisMonth = new Date()
      return lastStay.getMonth() === thisMonth.getMonth() && 
             lastStay.getFullYear() === thisMonth.getFullYear()
    }).length
  }
})

// Methods
const onRequest = () => {
  // Handle pagination in real app
}

const filterGuests = () => {
  // Filtering is handled by computed property
}

const clearFilters = () => {
  searchQuery.value = ''
  loyaltyFilter.value = null
  statusFilter.value = null
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const getLoyaltyColor = (tier) => {
  const colors = {
    Bronze: 'brown',
    Silver: 'grey',
    Gold: 'amber',
    Platinum: 'purple'
  }
  return colors[tier] || 'grey'
}

const viewGuest = (guest) => {
  selectedGuest.value = guest
  showDetailsDialog.value = true
}

const editGuest = (guest) => {
  router.push(`/guests/edit/${guest.id}`)
}

const createReservation = (guest) => {
  router.push(`/reservations/create?guest_id=${guest.id}`)
}

const sendMessage = (guest) => {
  $q.notify({
    type: 'info',
    message: `Message feature for ${guest.name} coming soon`
  })
}

const createGuest = async () => {
  creating.value = true
  try {
    // In real app, call API
    const guest = {
      id: guests.value.length + 1,
      name: `${newGuest.value.first_name} ${newGuest.value.last_name}`,
      email: newGuest.value.email,
      phone: newGuest.value.phone,
      nationality: newGuest.value.nationality,
      loyalty_tier: 'Bronze',
      loyalty_points: 0,
      total_stays: 0,
      last_stay: null,
      preferences: [],
      avatar: null
    }
    
    guests.value.unshift(guest)
    
    $q.notify({
      type: 'positive',
      message: 'Guest created successfully'
    })
    
    showCreateDialog.value = false
    
    // Reset form
    newGuest.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      nationality: ''
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to create guest'
    })
  } finally {
    creating.value = false
  }
}

// Lifecycle
onMounted(() => {
  // In real app, fetch guests from API
})
</script>