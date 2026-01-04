<template>
  <q-page class="q-pa-md" :class="{ 'bg-grey-9': $q.dark.isActive, 'bg-grey-1': !$q.dark.isActive }">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card class="text-white" :class="$q.dark.isActive ? 'bg-gradient-to-r-dark' : 'bg-gradient-to-r'">
          <q-card-section>
            <div class="text-h5 q-mb-md">
              <q-icon name="loyalty" class="q-mr-sm" />
              Loyalty Program
            </div>
            <div class="text-subtitle1">
              {{ getTierDisplayName(loyaltyInfo?.current_tier) }} Member
              <q-chip 
                v-if="guestPortalStore.isVip" 
                color="amber" 
                text-color="black" 
                icon="star" 
                class="q-ml-sm"
              >
                VIP
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Current Status -->
      <div class="col-md-8 col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h6 q-mb-md">Your Status</div>
            
            <div class="row q-gutter-md q-mb-lg">
              <div class="col-md-4 col-12 text-center">
                <div class="text-h4 text-primary">
                  {{ loyaltyInfo?.current_points?.toLocaleString() || 0 }}
                </div>
                <div class="text-caption text-grey-6">Current Points</div>
              </div>
              
              <div class="col-md-4 col-12 text-center">
                <div class="text-h4 text-secondary">
                  {{ loyaltyInfo?.total_stays || 0 }}
                </div>
                <div class="text-caption text-grey-6">Total Stays</div>
              </div>
              
              <div class="col-md-4 col-12 text-center">
                <div class="text-h4 text-green">
                  ${{ loyaltyInfo?.total_spent?.toLocaleString() || 0 }}
                </div>
                <div class="text-caption text-grey-6">Total Spent</div>
              </div>
            </div>

            <!-- Progress to Next Tier -->
            <div v-if="loyaltyInfo?.next_tier" class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">
                Progress to {{ getTierDisplayName(loyaltyInfo.next_tier) }}
              </div>
              
              <q-linear-progress 
                :value="getProgressPercentage()" 
                size="20px" 
                color="primary"
                class="q-mb-sm"
              />
              
              <div class="text-caption" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
                {{ loyaltyInfo.points_to_next_tier?.toLocaleString() || 0 }} more points needed
              </div>
            </div>

            <!-- Tier Benefits -->
            <div v-if="loyaltyInfo?.tier_benefits">
              <div class="text-subtitle1 q-mb-sm">
                Your {{ getTierDisplayName(loyaltyInfo.current_tier) }} Benefits
              </div>
              
              <q-list dense>
                <q-item 
                  v-for="benefit in loyaltyInfo.tier_benefits" 
                  :key="benefit"
                >
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ benefit }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tier Information -->
      <div class="col-md-4 col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="text-h6 q-mb-md">Membership Tiers</div>
            
            <q-list>
              <q-item 
                v-for="tier in tiers" 
                :key="tier.name"
                :class="{ 
                  'bg-blue-1': tier.name === loyaltyInfo?.current_tier && !$q.dark.isActive,
                  'bg-blue-9': tier.name === loyaltyInfo?.current_tier && $q.dark.isActive
                }"
              >
                <q-item-section avatar>
                  <q-icon 
                    :name="tier.icon" 
                    :color="tier.color"
                    size="md"
                  />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ tier.displayName }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ tier.requirement }}
                  </q-item-label>
                </q-item-section>
                
                <q-item-section side v-if="tier.name === loyaltyInfo?.current_tier">
                  <q-chip color="primary" text-color="white" size="sm">
                    Current
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div class="col-12" v-if="loading">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section class="text-center">
            <q-spinner-dots size="50px" color="primary" />
            <div class="q-mt-md">Loading loyalty information...</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)
const loyaltyInfo = ref(null)

const tiers = [
  {
    name: 'standard',
    displayName: 'Standard',
    requirement: '0+ points',
    icon: 'person',
    color: 'grey'
  },
  {
    name: 'silver',
    displayName: 'Silver',
    requirement: '5,000+ points',
    icon: 'star',
    color: 'grey-6'
  },
  {
    name: 'gold',
    displayName: 'Gold',
    requirement: '10,000+ points',
    icon: 'star',
    color: 'amber'
  },
  {
    name: 'platinum',
    displayName: 'Platinum',
    requirement: '25,000+ points',
    icon: 'star',
    color: 'blue-grey'
  },
  {
    name: 'diamond',
    displayName: 'Diamond',
    requirement: '50,000+ points',
    icon: 'diamond',
    color: 'light-blue'
  }
]

onMounted(() => {
  loadLoyaltyInfo()
})

const loadLoyaltyInfo = async () => {
  loading.value = true
  
  try {
    const data = await guestPortalStore.loadLoyaltyInfo()
    loyaltyInfo.value = data
    
  } catch (error) {
    console.error('Failed to load loyalty information:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Failed to load loyalty information',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const getTierDisplayName = (tier) => {
  const tierNames = {
    'standard': 'Standard',
    'silver': 'Silver',
    'gold': 'Gold',
    'platinum': 'Platinum',
    'diamond': 'Diamond'
  }
  return tierNames[tier] || 'Standard'
}

const getProgressPercentage = () => {
  if (!loyaltyInfo.value?.next_tier) return 1 // Already at highest tier
  
  const currentPoints = loyaltyInfo.value.current_points || 0
  const pointsToNext = loyaltyInfo.value.points_to_next_tier || 0
  
  // Calculate points needed for next tier
  const nextTierPoints = currentPoints + pointsToNext
  
  // Calculate current tier minimum points
  const tierMinimums = {
    'standard': 0,
    'silver': 5000,
    'gold': 10000,
    'platinum': 25000,
    'diamond': 50000
  }
  
  const currentTierMin = tierMinimums[loyaltyInfo.value.current_tier] || 0
  const progress = (currentPoints - currentTierMin) / (nextTierPoints - currentTierMin)
  
  return Math.max(0, Math.min(1, progress))
}
</script>

<style scoped>
.bg-gradient-to-r {
  background: linear-gradient(to right, #8b5cf6, #3b82f6);
}

.bg-gradient-to-r-dark {
  background: linear-gradient(to right, #6d28d9, #1e40af);
}
</style>