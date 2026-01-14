<template>
  <q-layout view="hHh lpR fFf" :class="isDarkMode ? 'bg-dark' : 'bg-grey-1'">
    <q-header elevated :class="isDarkMode ? 'bg-dark text-white' : 'bg-white text-grey-8'" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm toolbar-menu-btn"
        />

        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <q-icon name="hotel" size="24px" color="primary" class="q-mr-sm" />
          <span class="q-ml-sm brand-text">Hospie PMS</span>
        </q-toolbar-title>

        <q-space />

        <q-input 
          v-if="$q.screen.gt.sm" 
          class="GNL__toolbar-input" 
          outlined 
          dense 
          v-model="search" 
          color="bg-grey-7 shadow-1" 
          placeholder="Search reservations, guests, rooms..."
          clearable
        >
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              aria-label="Advanced Search"
              icon="tune"
              class="search-options-btn"
            >
              <q-tooltip>Advanced Search</q-tooltip>
              <q-menu anchor="bottom end" self="top end">
                <div class="q-pa-md advanced-search-menu" style="width: 400px">
                  <div class="text-body2 text-grey q-mb-md">
                    Advanced Search Options
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      Guest Name
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="exactPhrase" placeholder="Enter guest name" />
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      Room Number
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="hasWords" placeholder="Enter room number" />
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      Date Range
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="byWebsite" type="date" />
                    </div>
                  </div>

                  <div class="col-12 q-pt-lg row justify-end">
                    <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" label="Search" v-close-popup />
                    <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" @click="onClear" label="Clear" v-close-popup />
                  </div>
                </div>
              </q-menu>
            </q-btn>
          </template>
        </q-input>

        <!-- Mobile Search Button -->
        <q-btn 
          v-if="$q.screen.lt.md" 
          flat 
          round 
          dense 
          icon="search" 
          @click="showMobileSearch = true"
        >
          <q-tooltip>Search</q-tooltip>
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- PWA Install Button -->
          <q-btn 
            v-if="isInstallable && !isInstalled" 
            round 
            dense 
            flat 
            color="primary" 
            icon="get_app"
            @click="installPWA"
            class="install-pwa-btn"
          >
            <q-tooltip>Install Hospie PMS</q-tooltip>
          </q-btn>

          <!-- Offline Indicator -->
          <q-btn 
            v-if="!isOnline" 
            round 
            dense 
            flat 
            color="warning" 
            icon="wifi_off"
            @click="$router.push('/offline')"
            class="offline-indicator"
          >
            <q-tooltip>You are offline</q-tooltip>
          </q-btn>

          <!-- WebSocket Connection Status -->
          <ConnectionStatus class="q-mr-sm" />

          <!-- Mobile-optimized toolbar buttons -->
          <q-btn 
            v-if="$q.screen.gt.sm" 
            round 
            dense 
            flat 
            color="text-grey-7" 
            icon="apps"
            class="apps-menu-btn"
          >
            <q-tooltip>Applications</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="apps-menu">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-body2 text-grey q-mb-md text-center">
                  Hospie SaaS Services
                </div>
                <div class="row q-gutter-sm">
                  <div class="col-5" v-for="app in applications" :key="app.name">
                    <q-card 
                      flat 
                      bordered 
                      class="app-card cursor-pointer" 
                      @click="openApplication(app)"
                      :class="isDarkMode ? 'bg-grey-9 text-white' : 'bg-white'"
                    >
                      <q-card-section class="text-center q-pa-md">
                        <q-icon 
                          :name="app.icon" 
                          size="32px" 
                          :color="app.color"
                          class="q-mb-sm"
                        />
                        <div class="text-caption text-weight-medium">
                          {{ app.name }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
          
          <DarkModeToggle />
          
          <q-btn round dense flat color="text-grey-7" icon="notifications" class="notifications-btn">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="notifications-menu">
              <div class="q-pa-md" style="width: 300px; max-height: 400px;">
                <div class="text-h6 q-mb-md">Notifications</div>
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="hotel" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>New reservation</q-item-label>
                      <q-item-label caption>John Doe - Room 101</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption>2m ago</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="cleaning_services" color="warning" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Room ready</q-item-label>
                      <q-item-label caption>Room 205 cleaned</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption>5m ago</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="text-center q-mt-md">
                  <q-btn flat color="primary" label="View All" size="sm" />
                </div>
              </div>
            </q-menu>
          </q-btn>
          
          <q-btn round flat class="user-menu-btn">
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-tooltip>{{ authStore.userName || 'Account' }}</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="user-menu">
              <q-list style="min-width: 250px">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar size="40px">
                      <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ authStore.userName }}</q-item-label>
                    <q-item-label caption>{{ authStore.userEmail }}</q-item-label>
                    <q-item-label caption v-if="authStore.userRoles.length > 0">
                      <q-chip 
                        v-for="role in authStore.userRoles" 
                        :key="role" 
                        size="sm" 
                        color="primary" 
                        text-color="white"
                        class="q-mr-xs q-mt-xs"
                      >
                        {{ role }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$router.push('/profile')" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Profile</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$router.push('/settings')" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Settings</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLockSession" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="lock" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Lock Session</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleLogout" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Logout</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :class="isDarkMode ? 'bg-dark' : 'bg-white'"
      :width="280"
      :breakpoint="1024"
      :overlay="$q.screen.lt.lg"
      :persistent="$q.screen.gt.md"
      class="main-drawer"
    >
      <q-scroll-area class="fit">
        <q-list padding :class="isDarkMode ? 'text-white' : 'text-grey-8'">
          <!-- Primary Navigation -->
          <q-item-label header class="text-weight-bold text-primary q-mb-sm">
            Main Menu
          </q-item-label>
          
          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks1" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
            :class="{ 'active-nav-item': $route.path === link.route }"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="link.badge">
              <q-badge color="red" rounded>{{ link.badge }}</q-badge>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-md" />

          <!-- Secondary Navigation -->
          <q-item-label header class="text-weight-bold text-secondary q-mb-sm">
            Management
          </q-item-label>

          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks2" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
            :class="{ 'active-nav-item': $route.path === link.route }"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="link.badge">
              <q-badge color="red" rounded>{{ link.badge }}</q-badge>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-md" />

          <!-- Additional Links -->
          <q-item-label header class="text-weight-bold text-grey-6 q-mb-sm">
            More
          </q-item-label>

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links3" :key="link.text" clickable>
            <q-item-section>
              <q-item-label>{{ link.text }} <q-icon v-if="link.icon" :name="link.icon" /></q-item-label>
            </q-item-section>
          </q-item>

          <!-- Footer Links -->
          <div class="q-mt-xl q-pa-md">
            <div class="flex flex-center q-gutter-xs">
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Privacy">Privacy</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Terms">Terms</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="About">About Hospie</a>
            </div>
            <div class="text-center q-mt-sm text-caption text-grey-5">
              Version 1.0.0
            </div>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Under Development Modal -->
    <UnderDevelopmentModal 
      v-model="showUnderDevelopmentModal"
      :feature-name="selectedFeature"
      :expected-date="expectedDate"
      @notification-requested="handleNotificationRequest"
    />

    <!-- Mobile Search Dialog -->
    <q-dialog v-model="showMobileSearch" position="top">
      <q-card style="width: 100%; max-width: 400px">
        <q-card-section class="q-pb-none">
          <q-input
            v-model="search"
            label="Search"
            outlined
            dense
            autofocus
            clearable
            @keyup.enter="performMobileSearch"
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
                @click="showMobileSearch = false"
              />
            </template>
          </q-input>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showMobileSearch = false" 
          />
          <q-btn 
            color="primary" 
            label="Search" 
            @click="performMobileSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDarkMode } from '../composables/useDarkMode'
import { useAuthStore } from '../stores/auth'
import { useSessionStore } from '../stores/session'
import { usePWA } from '../composables/usePWA'
import DarkModeToggle from '../components/DarkModeToggle.vue'
import UnderDevelopmentModal from '../components/UnderDevelopmentModal.vue'
import ConnectionStatus from '../components/WebSocket/ConnectionStatus.vue'

export default {
  name: 'MainLayout',

  components: {
    DarkModeToggle,
    UnderDevelopmentModal,
    ConnectionStatus
  },

  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    const sessionStore = useSessionStore()
    
    // PWA functionality
    const { isOnline, isInstallable, isInstalled, installPWA, checkForUpdates } = usePWA()
    
    const leftDrawerOpen = ref(false)
    const search = ref('')
    const showAdvanced = ref(false)
    const showDateOptions = ref(false)
    const exactPhrase = ref('')
    const hasWords = ref('')
    const excludeWords = ref('')
    const byWebsite = ref('')
    const byDate = ref('Any time')
    const showMobileSearch = ref(false)

    // Under Development Modal
    const showUnderDevelopmentModal = ref(false)
    const selectedFeature = ref('')
    const expectedDate = ref('2026.01.01.')

    // Dark mode functionality
    const { isDarkMode, loadDarkModePreference } = useDarkMode()

    // Load dark mode preference on component mount
    onMounted(() => {
      loadDarkModePreference()
      // Initialize auth state if needed
      if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
        authStore.initializeAuth()
      }
    })

    function onClear () {
      exactPhrase.value = ''
      hasWords.value = ''
      excludeWords.value = ''
      byWebsite.value = ''
      byDate.value = 'Any time'
    }

    function changeDate (option) {
      byDate.value = option
      showDateOptions.value = false
    }

    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    function openApplication (app) {
      // Show under development modal instead of navigating
      selectedFeature.value = app.name
      showUnderDevelopmentModal.value = true
    }

    function handleNotificationRequest (featureName) {
      console.log('Notification requested for:', featureName)
      // Itt lehet implementálni az értesítés kérés logikáját
      // Például: API hívás a backend felé
    }

    async function handleLogout () {
      try {
        // Cleanup session management before logout
        sessionStore.destroy()
        
        await authStore.logout()
        
        $q.notify({
          type: 'positive',
          message: 'Successfully logged out',
          position: 'top'
        })
        
        router.push('/login')
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Logout failed',
          position: 'top'
        })
      }
    }

    async function handleLockSession () {
      try {
        await sessionStore.lockSession('manual')
        
        $q.notify({
          type: 'info',
          message: 'Session locked',
          position: 'top'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to lock session',
          position: 'top'
        })
      }
    }

    // Computed properties for filtered navigation links
    const filteredLinks1 = computed(() => {
      return links1.filter(link => {
        if (link.permission) {
          return authStore.hasPermission(link.permission)
        }
        if (link.roles) {
          return authStore.hasAnyRole(link.roles)
        }
        return true
      })
    })

    const filteredLinks2 = computed(() => {
      return links2.filter(link => {
        if (link.permission) {
          return authStore.hasPermission(link.permission)
        }
        if (link.roles) {
          return authStore.hasAnyRole(link.roles)
        }
        return true
      })
    })

    function performMobileSearch() {
      // Implement mobile search logic
      console.log('Mobile search:', search.value)
      showMobileSearch.value = false
    }

    function navigateToRoute(route) {
      if (route) {
        router.push(route)
        // Close drawer on mobile after navigation
        if ($q.screen.lt.lg) {
          leftDrawerOpen.value = false
        }
      }
    }

    // Define navigation links
    const links1 = [
      { icon: 'dashboard', text: 'Dashboard', route: '/dashboard' },
      { icon: 'hotel', text: 'Reservations', route: '/reservations', permission: 'reservations.view' },
      { icon: 'calendar_month', text: 'Calendar', route: '/reservations/calendar', permission: 'reservations.view' },
      { icon: 'meeting_room', text: 'Rooms', route: '/rooms', permission: 'rooms.view' },
      { icon: 'cleaning_services', text: 'Housekeeping', route: '/housekeeping', roles: ['admin', 'manager', 'housekeeping'] },
      { icon: 'people', text: 'Guests', route: '/guests', permission: 'guests.view' },
      { icon: 'spa', text: 'Spa Management', route: '/spa', permission: 'spa.view' },
      { icon: 'event', text: 'Events', route: '/events', permission: 'events.view' }
    ]

    const links2 = [
      { icon: 'account_balance_wallet', text: 'Finance', route: '/finance', permission: 'finance.view' },
      { icon: 'receipt', text: 'Invoices', route: '/finance/invoices', permission: 'invoices.view' },
      { icon: 'payment', text: 'Payments', route: '/finance/payments', permission: 'payments.view' },
      { icon: 'point_of_sale', text: 'POS', route: '/pos', permission: 'pos.view' },
      { icon: 'analytics', text: 'Reports', route: '/reports', permission: 'reports.view' },
      { icon: 'insights', text: 'Analytics', route: '/analytics', permission: 'analytics.view' },
      { icon: 'eco', text: 'Sustainability', route: '/sustainability', permission: 'sustainability.view' },
      { icon: 'attach_money', text: 'Rate Management', route: '/rates', permission: 'rates.view' },
      { icon: 'hub', text: 'Channel Manager', route: '/channel-manager', permission: 'channel_manager.view' },
      { icon: 'list_alt', text: 'Waitlist', route: '/waitlist', permission: 'waitlist.view' },
      { icon: 'shield', text: 'GDPR', route: '/gdpr', roles: ['admin', 'super-admin'] },
      { icon: 'admin_panel_settings', text: 'Admin', route: '/admin', roles: ['admin', 'super-admin'] },
      { icon: 'settings', text: 'Settings', route: '/pwa-settings' }
    ]

    return {
      authStore,
      leftDrawerOpen,
      search,
      showAdvanced,
      showDateOptions,
      exactPhrase,
      hasWords,
      excludeWords,
      byWebsite,
      byDate,
      isDarkMode,
      showUnderDevelopmentModal,
      selectedFeature,
      expectedDate,
      showMobileSearch,
      filteredLinks1,
      filteredLinks2,
      // PWA functionality
      isOnline,
      isInstallable,
      isInstalled,
      installPWA,
      checkForUpdates,
      navigateToRoute,
      performMobileSearch,

      applications: [
        { 
          name: 'HospiePAY', 
          icon: 'payment', 
          color: 'primary',
          route: '/hospiepay'
        },
        { 
          name: 'ChannelManager', 
          icon: 'hub', 
          color: 'secondary',
          route: '/channel-manager'
        },
        { 
          name: 'Előfizetés', 
          icon: 'subscriptions', 
          color: 'info',
          route: '/subscription'
        },
        { 
          name: 'Beállítások', 
          icon: 'settings', 
          color: 'warning',
          route: '/settings'
        }
      ],

      links1: [
        { icon: 'dashboard', text: 'Dashboard', route: '/dashboard' },
        { icon: 'hotel', text: 'Reservations', route: '/reservations', permission: 'reservations.view' },
        { icon: 'calendar_month', text: 'Calendar', route: '/reservations/calendar', permission: 'reservations.view' },
        { icon: 'meeting_room', text: 'Rooms', route: '/rooms', permission: 'rooms.view' },
        { icon: 'cleaning_services', text: 'Housekeeping', route: '/housekeeping', roles: ['admin', 'manager', 'housekeeping'] },
        { icon: 'people', text: 'Guests', route: '/guests', permission: 'guests.view' },
        { icon: 'spa', text: 'Spa Management', route: '/spa', permission: 'spa.view' },
        { icon: 'event', text: 'Events', route: '/events', permission: 'events.view' }
      ],
      links2: [
        { icon: 'account_balance_wallet', text: 'Finance', route: '/finance', permission: 'finance.view' },
        { icon: 'receipt', text: 'Invoices', route: '/finance/invoices', permission: 'invoices.view' },
        { icon: 'payment', text: 'Payments', route: '/finance/payments', permission: 'payments.view' },
        { icon: 'point_of_sale', text: 'POS', route: '/pos', permission: 'pos.view' },
        { icon: 'analytics', text: 'Reports', route: '/reports', permission: 'reports.view' },
        { icon: 'insights', text: 'Analytics', route: '/analytics', permission: 'analytics.view' },
        { icon: 'eco', text: 'Sustainability', route: '/sustainability', permission: 'sustainability.view' },
        { icon: 'attach_money', text: 'Rate Management', route: '/rates', permission: 'rates.view' },
        { icon: 'hub', text: 'Channel Manager', route: '/channel-manager', permission: 'channel_manager.view' },
        { icon: 'list_alt', text: 'Waitlist', route: '/waitlist', permission: 'waitlist.view' },
        { icon: 'shield', text: 'GDPR', route: '/gdpr', roles: ['admin', 'super-admin'] },
        { icon: 'admin_panel_settings', text: 'Admin', route: '/admin', roles: ['admin', 'super-admin'] },
        { icon: 'settings', text: 'Settings', route: '/pwa-settings' }
      ],
      links3: [
        { icon: '', text: 'Language & region' },
        { icon: '', text: 'Settings' },
        { icon: 'open_in_new', text: 'Get the Android app' },
        { icon: 'open_in_new', text: 'Get the iOS app' },
        { icon: '', text: 'Send feedback' },
        { icon: 'open_in_new', text: 'Help' }
      ],

      onClear,
      changeDate,
      toggleLeftDrawer,
      openApplication,
      handleNotificationRequest,
      handleLogout,
      handleLockSession
    }
  }
}
</script>

<style lang="sass">
.GNL
  &__toolbar
    height: 64px
    backdrop-filter: blur(20px)
    border-bottom: 1px solid rgba(0, 0, 0, 0.08)
    background: rgba(255, 255, 255, 0.95)
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

  &__toolbar-input
    width: 55%
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    
    @media (max-width: 768px)
      width: 100%
    
    .q-field__control
      border-radius: 24px
      background: rgba(255, 255, 255, 0.8)
      backdrop-filter: blur(10px)
      border: 1px solid rgba(0, 0, 0, 0.1)
      transition: all 0.3s ease
      
    &:focus-within
      transform: scale(1.02)
      .q-field__control
        background: rgba(255, 255, 255, 0.95)
        border-color: var(--q-primary)
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1)

  &__drawer-item
    line-height: 24px
    border-radius: 12px
    margin: 4px 12px 4px 0
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    position: relative
    overflow: hidden
    
    &::before
      content: ''
      position: absolute
      top: 0
      left: -100%
      width: 100%
      height: 100%
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)
      transition: left 0.5s ease
    
    &:hover
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.12))
      transform: translateX(6px) scale(1.02)
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15)
      
      &::before
        left: 100%
    
    &.active-nav-item
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(25, 118, 210, 0.18))
      border-left: 4px solid var(--q-primary)
      transform: translateX(4px)
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2)
      
      &::after
        content: ''
        position: absolute
        right: 8px
        top: 50%
        transform: translateY(-50%)
        width: 4px
        height: 4px
        background: var(--q-primary)
        border-radius: 50%
        animation: pulse 2s infinite
      
      .q-item__section--avatar .q-icon
        color: var(--q-primary)
        transform: scale(1.1)
      
      .q-item__label
        color: var(--q-primary)
        font-weight: 600

    .q-item__section--avatar
      .q-icon
        color: #5f6368
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
        
        &:hover
          transform: scale(1.1) rotate(5deg)

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    position: relative
    
    &::after
      content: ''
      position: absolute
      bottom: -2px
      left: 0
      width: 0
      height: 2px
      background: var(--q-primary)
      transition: width 0.3s ease
    
    &:hover
      color: var(--q-primary)
      transform: translateY(-1px)
      
      &::after
        width: 100%

// Enhanced button styles with advanced micro-interactions
.toolbar-menu-btn,
.install-pwa-btn,
.offline-indicator,
.apps-menu-btn,
.notifications-btn,
.user-menu-btn
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  position: relative
  overflow: hidden
  border-radius: 12px
  
  &::before
    content: ''
    position: absolute
    top: 50%
    left: 50%
    width: 0
    height: 0
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)
    border-radius: 50%
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1)
    transform: translate(-50%, -50%)
    pointer-events: none
  
  &:hover
    background: rgba(0, 0, 0, 0.06)
    transform: scale(1.08) translateY(-1px)
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12)
    
    &::before
      width: 60px
      height: 60px
  
  &:active
    transform: scale(1.02) translateY(0)
    
    &::before
      width: 80px
      height: 80px
      background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)

// Enhanced brand text with gradient animation
.brand-text
  font-weight: 700
  font-size: 1.2rem
  background: linear-gradient(45deg, var(--q-primary), var(--q-secondary), var(--q-accent))
  background-size: 200% 200%
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  background-clip: text
  animation: gradientShift 3s ease-in-out infinite
  position: relative
  
  &::after
    content: ''
    position: absolute
    bottom: -2px
    left: 0
    width: 100%
    height: 2px
    background: linear-gradient(45deg, var(--q-primary), var(--q-secondary))
    border-radius: 1px
    opacity: 0.3

@keyframes gradientShift
  0%, 100%
    background-position: 0% 50%
  50%
    background-position: 100% 50%

// Enhanced app cards with 3D effects
.app-card
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)
  min-height: 90px
  border-radius: 16px
  position: relative
  overflow: hidden
  
  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))
    opacity: 0
    transition: opacity 0.3s ease
  
  &:hover
    transform: translateY(-6px) scale(1.05) rotateX(5deg)
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2)
    
    &::before
      opacity: 1
    
    .q-icon
      transform: scale(1.2) rotate(10deg)
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))

// Enhanced menus with glassmorphism
.apps-menu,
.notifications-menu,
.user-menu
  .q-menu
    border-radius: 16px
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15)
    backdrop-filter: blur(20px)
    background: rgba(255, 255, 255, 0.9)
    border: 1px solid rgba(255, 255, 255, 0.3)
    overflow: hidden
    
    &::before
      content: ''
      position: absolute
      top: 0
      left: 0
      right: 0
      height: 1px
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)

.advanced-search-menu
  border-radius: 12px
  background: rgba(255, 255, 255, 0.95)
  backdrop-filter: blur(15px)
  border: 1px solid rgba(255, 255, 255, 0.3)

// Enhanced menu items with ripple effects
.menu-item
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  border-radius: 12px
  margin: 4px 8px
  position: relative
  overflow: hidden
  
  &::before
    content: ''
    position: absolute
    top: 50%
    left: 50%
    width: 0
    height: 0
    background: radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)
    border-radius: 50%
    transition: all 0.4s ease
    transform: translate(-50%, -50%)
    pointer-events: none
  
  &:hover
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.12))
    transform: translateX(6px) scale(1.02)
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15)
    
    &::before
      width: 200px
      height: 200px

// Enhanced search options button with rotation
.search-options-btn
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  border-radius: 50%
  
  &:hover
    background: rgba(0, 0, 0, 0.06)
    transform: rotate(180deg) scale(1.1)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

// Enhanced notifications menu with animations
.notifications-menu
  .q-item
    border-radius: 12px
    margin: 4px 8px
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    position: relative
    
    &::after
      content: ''
      position: absolute
      left: 0
      top: 0
      bottom: 0
      width: 0
      background: linear-gradient(135deg, var(--q-primary), var(--q-secondary))
      transition: width 0.3s ease
      border-radius: 12px 0 0 12px
    
    &:hover
      background: rgba(0, 0, 0, 0.04)
      transform: translateX(4px)
      
      &::after
        width: 4px

// Enhanced main drawer with gradient background
.main-drawer
  .q-drawer__content
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.98) 0%, 
      rgba(248, 250, 252, 0.95) 50%,
      rgba(240, 245, 251, 0.92) 100%)
    backdrop-filter: blur(10px)
  
  .q-item-label[header]
    font-size: 0.75rem
    text-transform: uppercase
    letter-spacing: 1.5px
    font-weight: 600
    position: relative
    
    &::after
      content: ''
      position: absolute
      bottom: -4px
      left: 0
      width: 24px
      height: 2px
      background: linear-gradient(90deg, var(--q-primary), var(--q-secondary))
      border-radius: 1px

// Enhanced mobile-specific styles with better touch targets
@media (max-width: 768px)
  .q-toolbar
    padding: 0 12px
    background: rgba(255, 255, 255, 0.95)
    backdrop-filter: blur(20px)
    
    .q-toolbar__title
      font-size: 1.1rem
      font-weight: 600
      
  .q-drawer
    .q-list
      padding: 12px 0
      
  .q-item
    min-height: 52px
    padding: 12px 20px
    border-radius: 16px
    margin: 4px 8px
    
  .q-btn
    min-width: 48px
    min-height: 48px
    border-radius: 16px
    
  .q-avatar
    font-size: 22px

// Enhanced responsive grid improvements
@media (max-width: 600px)
  .row.q-gutter-md > div
    margin-bottom: 20px
    
  .col-12.col-md-3,
  .col-12.col-md-4,
  .col-12.col-md-6
    width: 100% !important
    max-width: 100% !important

// Enhanced dark mode with better contrast and effects
.body--dark
  .GNL__toolbar
    background: rgba(18, 18, 18, 0.98)
    border-bottom-color: rgba(255, 255, 255, 0.12)
    
    .GNL__toolbar-input .q-field__control
      background: rgba(255, 255, 255, 0.1)
      border-color: rgba(255, 255, 255, 0.25)
      color: white
      
      input
        color: white
        
      .q-icon
        color: rgba(255, 255, 255, 0.7)
  
  .GNL__drawer-item
    color: rgba(255, 255, 255, 0.9)
    
    .q-item__section--avatar .q-icon
      color: rgba(255, 255, 255, 0.7)
    
    .q-item__label
      color: rgba(255, 255, 255, 0.9)
    
    &:hover
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.16))
      
      .q-item__section--avatar .q-icon
        color: var(--q-primary)
    
    &.active-nav-item
      background: linear-gradient(135deg, rgba(196, 88, 101, 0.25), rgba(196, 88, 101, 0.35))
      border-left-color: var(--q-primary)
      
      .q-item__section--avatar .q-icon
        color: var(--q-primary)
      
      .q-item__label
        color: white
  
  .main-drawer .q-drawer__content
    background: linear-gradient(180deg, 
      rgba(18, 18, 18, 0.98) 0%, 
      rgba(30, 30, 30, 0.95) 50%,
      rgba(40, 40, 40, 0.92) 100%)
  
  .q-item-label[header]
    color: rgba(255, 255, 255, 0.7)
  
  .toolbar-menu-btn,
  .install-pwa-btn,
  .offline-indicator,
  .apps-menu-btn,
  .notifications-btn,
  .user-menu-btn
    color: rgba(255, 255, 255, 0.9)
    
    &:hover
      background: rgba(255, 255, 255, 0.12)
  
  .brand-text
    color: white
  
  .apps-menu,
  .notifications-menu,
  .user-menu
    .q-menu
      background: rgba(18, 18, 18, 0.98)
      border-color: rgba(255, 255, 255, 0.2)
      
      .q-item
        color: rgba(255, 255, 255, 0.9)
        
        &:hover
          background: rgba(255, 255, 255, 0.1)
      
      .q-item-label
        color: rgba(255, 255, 255, 0.9)
      
      .q-item-label[caption]
        color: rgba(255, 255, 255, 0.6)
  
  .app-card
    background: rgba(255, 255, 255, 0.08)
    border-color: rgba(255, 255, 255, 0.15)
    color: rgba(255, 255, 255, 0.9)
    
    &:hover
      background: rgba(255, 255, 255, 0.12)
      border-color: rgba(255, 255, 255, 0.25)
    
    .text-caption
      color: rgba(255, 255, 255, 0.8)
  
  .advanced-search-menu
    background: rgba(18, 18, 18, 0.98)
    border-color: rgba(255, 255, 255, 0.2)
    
    .text-body2,
    .text-subtitle2
      color: rgba(255, 255, 255, 0.9)
    
    .q-input
      color: white
  
  .GNL__drawer-footer-link
    color: rgba(255, 255, 255, 0.7)
    
    &:hover
      color: var(--q-primary)

// Enhanced accessibility improvements
@media (prefers-reduced-motion: reduce)
  *,
  *::before,
  *::after
    animation-duration: 0.01ms !important
    animation-iteration-count: 1 !important
    transition-duration: 0.01ms !important

// Enhanced focus states for better accessibility
.q-btn:focus,
.q-item:focus
  outline: 3px solid var(--q-primary)
  outline-offset: 2px
  border-radius: 12px

// Enhanced loading states with skeleton animations
.loading-shimmer
  background: linear-gradient(90deg, 
    rgba(240, 240, 240, 0.8) 25%, 
    rgba(224, 224, 224, 0.8) 50%, 
    rgba(240, 240, 240, 0.8) 75%)
  background-size: 200% 100%
  animation: shimmer 2s infinite ease-in-out
  border-radius: 8px

@keyframes shimmer
  0%
    background-position: -200% 0
  100%
    background-position: 200% 0

// Enhanced notification badge with pulse animation
.q-badge
  &.notification-badge
    animation: notificationPulse 2s infinite
    box-shadow: 0 0 10px rgba(244, 67, 54, 0.5)

@keyframes notificationPulse
  0%, 100%
    transform: scale(1)
    opacity: 1
  50%
    transform: scale(1.1)
    opacity: 0.8

// Enhanced scroll behavior
.q-scroll-area
  .q-scrollarea__thumb
    background: rgba(0, 0, 0, 0.2)
    border-radius: 4px
    transition: all 0.3s ease
    
    &:hover
      background: rgba(0, 0, 0, 0.4)
      width: 8px

// Enhanced tooltip styles
.q-tooltip
  background: rgba(0, 0, 0, 0.9)
  backdrop-filter: blur(10px)
  border-radius: 8px
  font-weight: 500
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)

// Enhanced performance optimizations
.q-page
  will-change: transform
  
.q-card
  will-change: transform, box-shadow
  
.q-btn
  will-change: transform, background-color

// Enhanced print styles
@media print
  .GNL__toolbar,
  .q-drawer,
  .q-footer,
  .no-print
    display: none !important
  
  .q-page
    padding: 0 !important
    margin: 0 !important
</style>