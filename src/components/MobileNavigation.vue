<template>
  <div class="mobile-navigation">
    <!-- Mobile Bottom Navigation -->
    <q-footer 
      v-if="isMobile && showBottomNav" 
      class="mobile-bottom-nav"
      :class="[
        isDarkMode ? 'bg-dark' : 'bg-white',
        { 'keyboard-open': isKeyboardOpen }
      ]"
    >
      <q-tabs
        v-model="activeTab"
        class="mobile-nav-tabs"
        :class="isDarkMode ? 'text-white' : 'text-grey-8'"
        indicator-color="primary"
        active-color="primary"
        align="justify"
        dense
      >
        <q-tab
          v-for="item in bottomNavItems"
          :key="item.name"
          :name="item.name"
          :icon="item.icon"
          :label="item.label"
          @click="navigateToRoute(item.route)"
          class="mobile-nav-tab"
        >
          <q-badge
            v-if="item.badge"
            color="red"
            text-color="white"
            floating
            rounded
          >
            {{ item.badge }}
          </q-badge>
        </q-tab>
      </q-tabs>
    </q-footer>

    <!-- Mobile Floating Action Button -->
    <q-page-sticky 
      v-if="isMobile && showFab"
      position="bottom-right" 
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="showQuickActions = true"
        class="mobile-fab"
      >
        <q-tooltip anchor="top middle" self="bottom middle">
          Quick Actions
        </q-tooltip>
      </q-btn>
    </q-page-sticky>

    <!-- Quick Actions Menu -->
    <q-dialog v-model="showQuickActions" position="bottom">
      <q-card class="mobile-quick-actions">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Quick Actions</div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md">
            <div 
              v-for="action in quickActions"
              :key="action.name"
              class="col-4 text-center"
            >
              <q-btn
                round
                size="lg"
                :color="action.color"
                :icon="action.icon"
                @click="handleQuickAction(action)"
                class="q-mb-sm"
              />
              <div class="text-caption">{{ action.label }}</div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showQuickActions = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Mobile Search Overlay -->
    <q-dialog 
      v-model="showMobileSearch" 
      position="top"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="width: 100%; max-width: none; margin: 0;">
        <q-card-section class="q-pa-md">
          <q-input
            v-model="searchQuery"
            placeholder="Search reservations, guests, rooms..."
            outlined
            dense
            autofocus
            clearable
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn 
                flat 
                round 
                dense 
                icon="close" 
                @click="closeMobileSearch"
              />
            </template>
          </q-input>
          
          <!-- Search Suggestions -->
          <div v-if="searchSuggestions.length > 0" class="q-mt-md">
            <q-list>
              <q-item
                v-for="suggestion in searchSuggestions"
                :key="suggestion.id"
                clickable
                @click="selectSuggestion(suggestion)"
              >
                <q-item-section avatar>
                  <q-icon :name="suggestion.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ suggestion.title }}</q-item-label>
                  <q-item-label caption>{{ suggestion.subtitle }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Mobile Menu Drawer -->
    <q-drawer
      v-model="showMobileMenu"
      side="right"
      overlay
      behavior="mobile"
      :width="280"
      class="mobile-menu-drawer"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- User Profile Section -->
          <q-item class="q-mb-md">
            <q-item-section avatar>
              <q-avatar size="50px">
                <img :src="userAvatar" alt="User Avatar">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ userName }}</q-item-label>
              <q-item-label caption>{{ userRole }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-separator class="q-mb-md" />
          
          <!-- Menu Items -->
          <q-item
            v-for="item in mobileMenuItems"
            :key="item.name"
            clickable
            @click="navigateToRoute(item.route)"
            class="mobile-menu-item"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="item.badge">
              <q-badge color="red" rounded>{{ item.badge }}</q-badge>
            </q-item-section>
          </q-item>
          
          <q-separator class="q-my-md" />
          
          <!-- Settings and Logout -->
          <q-item clickable @click="navigateToRoute('/settings')">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable @click="handleLogout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useMobile } from '../composables/useMobile'
import { useAuthStore } from '../stores/auth'
import { useDarkMode } from '../composables/useDarkMode'

// Props
const props = defineProps({
  showBottomNav: {
    type: Boolean,
    default: true
  },
  showFab: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['search', 'quick-action'])

// Composables
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { isMobile, hapticFeedback, setupTouchGestures, isKeyboardOpen } = useMobile()
const authStore = useAuthStore()
const { isDarkMode } = useDarkMode()

// Reactive state
const activeTab = ref('dashboard')
const showQuickActions = ref(false)
const showMobileSearch = ref(false)
const showMobileMenu = ref(false)
const searchQuery = ref('')
const searchSuggestions = ref([])
const isSwipeEnabled = ref(true)
const swipeThreshold = ref(50)

// Touch gesture cleanup function
let gestureCleanup = null

// Computed properties
const userName = computed(() => authStore.user?.name || 'User')
const userRole = computed(() => authStore.user?.roles?.[0] || 'Guest')
const userAvatar = computed(() => authStore.user?.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png')

// Bottom navigation items
const bottomNavItems = computed(() => [
  {
    name: 'dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard'
  },
  {
    name: 'reservations',
    icon: 'hotel',
    label: 'Bookings',
    route: '/reservations',
    badge: 3 // Example badge
  },
  {
    name: 'rooms',
    icon: 'meeting_room',
    label: 'Rooms',
    route: '/rooms'
  },
  {
    name: 'guests',
    icon: 'people',
    label: 'Guests',
    route: '/guests'
  },
  {
    name: 'more',
    icon: 'more_horiz',
    label: 'More',
    route: null // Opens menu instead
  }
])

// Quick actions
const quickActions = ref([
  {
    name: 'new-reservation',
    icon: 'add_business',
    label: 'New Booking',
    color: 'primary',
    route: '/reservations/create'
  },
  {
    name: 'check-in',
    icon: 'login',
    label: 'Check In',
    color: 'positive',
    action: 'check-in'
  },
  {
    name: 'check-out',
    icon: 'logout',
    label: 'Check Out',
    color: 'warning',
    action: 'check-out'
  },
  {
    name: 'room-status',
    icon: 'cleaning_services',
    label: 'Room Status',
    color: 'info',
    route: '/rooms/status'
  },
  {
    name: 'search',
    icon: 'search',
    label: 'Search',
    color: 'secondary',
    action: 'search'
  },
  {
    name: 'reports',
    icon: 'analytics',
    label: 'Reports',
    color: 'purple',
    route: '/reports'
  }
])

// Mobile menu items
const mobileMenuItems = computed(() => [
  {
    name: 'calendar',
    icon: 'calendar_month',
    label: 'Calendar',
    route: '/reservations/calendar'
  },
  {
    name: 'finance',
    icon: 'account_balance_wallet',
    label: 'Finance',
    route: '/finance'
  },
  {
    name: 'reports',
    icon: 'analytics',
    label: 'Reports',
    route: '/reports'
  },
  {
    name: 'admin',
    icon: 'admin_panel_settings',
    label: 'Admin',
    route: '/admin',
    badge: authStore.hasRole('admin') ? null : undefined
  },
  {
    name: 'support',
    icon: 'support',
    label: 'Support',
    route: '/support'
  },
  {
    name: 'help',
    icon: 'help',
    label: 'Help',
    route: '/help'
  }
])

// Watch route changes to update active tab
watch(() => route.path, (newPath) => {
  const pathSegments = newPath.split('/')
  const mainSection = pathSegments[1] || 'dashboard'
  
  // Update active tab based on current route
  const tabItem = bottomNavItems.value.find(item => 
    item.route && item.route.includes(mainSection)
  )
  if (tabItem) {
    activeTab.value = tabItem.name
  }
}, { immediate: true })

// Methods
const navigateToRoute = (route) => {
  if (!route) {
    // Open mobile menu for "More" tab
    showMobileMenu.value = true
    return
  }
  
  hapticFeedback('light')
  router.push(route)
  
  // Close any open dialogs
  showQuickActions.value = false
  showMobileMenu.value = false
}

const handleQuickAction = (action) => {
  hapticFeedback('medium')
  
  if (action.route) {
    navigateToRoute(action.route)
  } else if (action.action) {
    switch (action.action) {
      case 'search':
        showQuickActions.value = false
        showMobileSearch.value = true
        break
      case 'check-in':
        emit('quick-action', 'check-in')
        showQuickActions.value = false
        break
      case 'check-out':
        emit('quick-action', 'check-out')
        showQuickActions.value = false
        break
      default:
        emit('quick-action', action.action)
        showQuickActions.value = false
    }
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    closeMobileSearch()
  }
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
  searchQuery.value = ''
  searchSuggestions.value = []
}

const selectSuggestion = (suggestion) => {
  hapticFeedback('light')
  if (suggestion.route) {
    navigateToRoute(suggestion.route)
  }
  closeMobileSearch()
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'Successfully logged out',
      position: 'top'
    })
    router.push('/login')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Logout failed',
      position: 'top'
    })
  }
  showMobileMenu.value = false
}

// Expose methods for parent components
defineExpose({
  openSearch: () => { showMobileSearch.value = true },
  openQuickActions: () => { showQuickActions.value = true },
  openMenu: () => { showMobileMenu.value = true }
})

// Setup touch gestures for swipe navigation
onMounted(() => {
  if (isMobile.value && isSwipeEnabled.value) {
    const bottomNav = document.querySelector('.mobile-bottom-nav')
    if (bottomNav) {
      gestureCleanup = setupTouchGestures(bottomNav, {
        swipeLeft: () => {
          // Navigate to next tab
          const currentIndex = bottomNavItems.value.findIndex(item => item.name === activeTab.value)
          const nextIndex = (currentIndex + 1) % bottomNavItems.value.length
          const nextTab = bottomNavItems.value[nextIndex]
          if (nextTab.route) {
            hapticFeedback('light')
            navigateToRoute(nextTab.route)
          }
        },
        swipeRight: () => {
          // Navigate to previous tab
          const currentIndex = bottomNavItems.value.findIndex(item => item.name === activeTab.value)
          const prevIndex = currentIndex === 0 ? bottomNavItems.value.length - 1 : currentIndex - 1
          const prevTab = bottomNavItems.value[prevIndex]
          if (prevTab.route) {
            hapticFeedback('light')
            navigateToRoute(prevTab.route)
          }
        },
        swipeUp: () => {
          // Open quick actions on swipe up
          hapticFeedback('medium')
          showQuickActions.value = true
        }
      })
    }
  }
})

onUnmounted(() => {
  if (gestureCleanup) {
    gestureCleanup()
  }
})
</script>

<style lang="scss" scoped>
.mobile-navigation {
  .mobile-bottom-nav {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    
    .mobile-nav-tabs {
      height: 60px;
      
      .mobile-nav-tab {
        min-height: 60px;
        font-size: 0.75rem;
        
        .q-tab__content {
          min-height: 60px;
        }
        
        .q-tab__icon {
          font-size: 1.2rem;
          margin-bottom: 2px;
        }
        
        .q-tab__label {
          font-size: 0.7rem;
          line-height: 1;
        }
      }
    }
  }
  
  .mobile-fab {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .mobile-quick-actions {
    border-radius: 16px 16px 0 0;
    
    .q-btn {
      width: 60px;
      height: 60px;
    }
  }
  
  .mobile-menu-drawer {
    .mobile-menu-item {
      border-radius: 8px;
      margin: 4px 8px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  }
}

// Dark mode styles
.body--dark {
  .mobile-bottom-nav {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
  
  .mobile-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }
}

// Safe area support for devices with notches
@supports (padding: env(safe-area-inset-bottom)) {
  .mobile-bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

// Animation improvements
.mobile-nav-tab {
  transition: all 0.2s ease;
}

.mobile-fab {
  transition: transform 0.2s ease;
}

// Responsive adjustments
@media (max-width: 400px) {
  .mobile-nav-tab {
    .q-tab__label {
      font-size: 0.65rem;
    }
    
    .q-tab__icon {
      font-size: 1.1rem;
    }
  }
  
  .mobile-quick-actions {
    .q-btn {
      width: 50px;
      height: 50px;
    }
  }
}
</style>