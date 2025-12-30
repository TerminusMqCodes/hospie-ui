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
          class="q-mr-sm"
        />

        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">Hospie PMS</span>
        </q-toolbar-title>

        <q-space />

        <q-input 
          v-if="$q.screen.gt.sm" 
          class="GNL__toolbar-input" 
          outlined 
          dense 
          v-model="search" 
          color="bg-grey-7 shadow-1" 
          placeholder="Keresés..."
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
              aria-label="Menu"
              icon="arrow_drop_down"
            >
              <q-menu anchor="bottom end" self="top end">
                <div class="q-pa-md" style="width: 400px">
                  <div class="text-body2 text-grey q-mb-md">
                    Részletes keresés
                  </div>

                  <div class="row items-center">
                    <div class="col-3 text-subtitle2 text-grey">
                      Exact phrase
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="exactPhrase" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Has words
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="hasWords" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Exclude words
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="excludeWords" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Website
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="byWebsite" />
                    </div>

                    <div class="col-12 q-pt-lg row justify-end">
                      <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" label="Keresés" v-close-popup />
                      <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" @click="onClear" label="Törlés" v-close-popup />
                    </div>
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
          <!-- Mobile-optimized toolbar buttons -->
          <q-btn 
            v-if="$q.screen.gt.sm" 
            round 
            dense 
            flat 
            color="text-grey-7" 
            icon="apps"
          >
            <q-tooltip>Alkalmazások</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="apps-menu">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-body2 text-grey q-mb-md text-center">
                  Hospie SaaS Szolgáltatások
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
          
          <q-btn round dense flat color="text-grey-7" icon="notifications">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Értesítések</q-tooltip>
          </q-btn>
          
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-tooltip>{{ authStore.userName || 'Saját fiók' }}</q-tooltip>
            <q-menu anchor="bottom end" self="top end">
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
                <q-item clickable v-close-popup @click="$router.push('/profile')">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Profil</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$router.push('/settings')">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Beállítások</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Kijelentkezés</q-item-label>
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
    >
      <q-scroll-area class="fit">
        <q-list padding :class="isDarkMode ? 'text-white' : 'text-grey-8'">
          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks1" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks2" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links3" :key="link.text" clickable>
            <q-item-section>
              <q-item-label>{{ link.text }} <q-icon v-if="link.icon" :name="link.icon" /></q-item-label>
            </q-item-section>
          </q-item>

          <div class="q-mt-md">
            <div class="flex flex-center q-gutter-xs">
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Privacy">Adatvédelem</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Terms">ÁSZF</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="About">A Hospie-ról</a>
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
import DarkModeToggle from '../components/DarkModeToggle.vue'
import UnderDevelopmentModal from '../components/UnderDevelopmentModal.vue'

export default {
  name: 'MainLayout',

  components: {
    DarkModeToggle,
    UnderDevelopmentModal
  },

  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    
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
      { icon: 'people', text: 'Guests', route: '/guests', permission: 'guests.view' }
    ]

    const links2 = [
      { icon: 'account_balance_wallet', text: 'Finance', route: '/finance', permission: 'invoices.view' },
      { icon: 'analytics', text: 'Reports', route: '/reports', permission: 'reports.view' },
      { icon: 'admin_panel_settings', text: 'Admin', route: '/admin', roles: ['admin', 'super-admin'] },
      { icon: 'settings', text: 'Settings', route: '/settings' },
      { icon: 'support', text: 'Support', route: '/support' },
      { icon: 'help', text: 'Help', route: '/help' }
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
        { icon: 'people', text: 'Guests', route: '/guests', permission: 'guests.view' }
      ],
      links2: [
        { icon: 'account_balance_wallet', text: 'Finance', route: '/finance', permission: 'invoices.view' },
        { icon: 'analytics', text: 'Reports', route: '/reports', permission: 'reports.view' },
        { icon: 'admin_panel_settings', text: 'Admin', route: '/admin', roles: ['admin', 'super-admin'] },
        { icon: 'settings', text: 'Settings', route: '/settings' },
        { icon: 'support', text: 'Support', route: '/support' },
        { icon: 'help', text: 'Help', route: '/help' }
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
      handleLogout
    }
  }
}
</script>

<style lang="sass">
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%
    
    @media (max-width: 768px)
      width: 100%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

.app-card
  transition: all 0.2s ease
  min-height: 80px
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

.apps-menu
  .q-menu
    border-radius: 8px

// Mobile-specific styles
@media (max-width: 768px)
  .q-toolbar
    padding: 0 8px
    
  .q-toolbar__title
    font-size: 1rem
    
  .q-drawer
    .q-list
      padding: 8px 0
      
  .q-item
    min-height: 48px
    padding: 8px 16px
    
  .q-btn
    min-width: 40px
    
  .q-avatar
    font-size: 20px

// Responsive grid improvements
@media (max-width: 600px)
  .row.q-gutter-md > div
    margin-bottom: 16px
    
  .col-12.col-md-3,
  .col-12.col-md-4,
  .col-12.col-md-6
    width: 100% !important
    max-width: 100% !important
</style>