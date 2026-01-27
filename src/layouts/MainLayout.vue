<template>
  <q-layout view="hHh lpR fFf" :class="isDarkMode ? 'bg-dark' : 'bg-grey-1'">
    <!-- Electron Window Controls -->
    <ElectronWindowControls />
    
    <q-header elevated :class="isDarkMode ? 'bg-dark text-white' : 'bg-white text-grey-8'" height-hint="64" :style="electronHeaderStyle">
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
          :placeholder="t('search.placeholder')"
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
              <q-tooltip>{{ t('tooltips.advancedSearch') }}</q-tooltip>
              <q-menu anchor="bottom end" self="top end">
                <div class="q-pa-md advanced-search-menu" style="width: 400px">
                  <div class="text-body2 text-grey q-mb-md">
                    {{ t('search.advancedOptions') }}
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      {{ t('search.guestName') }}
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="exactPhrase" :placeholder="t('search.guestName')" />
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      {{ t('search.roomNumber') }}
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="hasWords" :placeholder="t('search.roomNumber')" />
                    </div>
                  </div>

                  <div class="row items-center q-mb-md">
                    <div class="col-3 text-subtitle2 text-grey">
                      {{ t('search.dateRange') }}
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="byWebsite" type="date" />
                    </div>
                  </div>

                  <div class="col-12 q-pt-lg row justify-end">
                    <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" :label="t('actions.search')" v-close-popup />
                    <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" @click="onClear" :label="t('search.clear')" v-close-popup />
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
          <q-tooltip>{{ t('tooltips.search') }}</q-tooltip>
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
            <q-tooltip>{{ t('notifications.install') }}</q-tooltip>
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
            <q-tooltip>{{ t('notifications.offline') }}</q-tooltip>
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
            <q-tooltip>{{ t('tooltips.applications') }}</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="apps-menu">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-body2 text-grey q-mb-md text-center">
                  {{ t('applications.title') }}
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
          
          <!-- Language Selector -->
          <LanguageSelector class="q-mr-sm" />
          
          <DarkModeToggle />
          
          <!-- Debug Info (temporary) -->
          <q-btn 
            v-if="isDev"
            round 
            dense 
            flat 
            color="text-grey-7" 
            :icon="isElectron ? 'desktop_windows' : 'web'"
            class="debug-electron-btn"
          >
            <q-tooltip>{{ isElectron ? t('tooltips.electronMode') : t('tooltips.browserMode') }}</q-tooltip>
          </q-btn>
          
          <!-- Shortcuts Help Button -->
          <q-btn 
            round 
            dense 
            flat 
            color="text-grey-7" 
            icon="keyboard"
            @click="showShortcutsHelp = true"
            class="shortcuts-help-btn"
          >
            <q-tooltip>{{ t('tooltips.keyboardShortcuts') }}</q-tooltip>
          </q-btn>
          
          <q-btn round dense flat color="text-grey-7" icon="notifications" class="notifications-btn">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>{{ t('tooltips.notifications') }}</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="notifications-menu">
              <div class="q-pa-md" style="width: 300px; max-height: 400px;">
                <div class="text-h6 q-mb-md">{{ t('notifications.title') }}</div>
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="hotel" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ t('notifications.newReservation') }}</q-item-label>
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
                      <q-item-label>{{ t('notifications.roomReady') }}</q-item-label>
                      <q-item-label caption>Room 205 cleaned</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption>5m ago</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="text-center q-mt-md">
                  <q-btn flat color="primary" :label="t('notifications.viewAll')" size="sm" />
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
                    <q-item-label>{{ t('navigation.profile') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$router.push('/settings')" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('navigation.settings') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="language" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('language.select') }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <LanguageSelector />
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLockSession" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="lock" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('notifications.lockSession') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleLogout" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('navigation.logout') }}</q-item-label>
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
            {{ t('menu.main') }}
          </q-item-label>
          
          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks1" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
            :class="{ 'active-nav-item': $route.path === link.route }"
            :data-electron-only="link.electronOnly"
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
            {{ t('menu.management') }}
          </q-item-label>

          <q-item 
            class="GNL__drawer-item" 
            v-ripple 
            v-for="link in filteredLinks2" 
            :key="link.text" 
            clickable
            @click="navigateToRoute(link.route)"
            :class="{ 'active-nav-item': $route.path === link.route }"
            :data-electron-only="link.electronOnly"
            :data-dev-only="link.devOnly"
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
            {{ t('menu.more') }}
          </q-item-label>

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links3" :key="link.text" clickable>
            <q-item-section>
              <q-item-label>{{ link.text }} <q-icon v-if="link.icon" :name="link.icon" /></q-item-label>
            </q-item-section>
          </q-item>

          <!-- Footer Links -->
          <div class="q-mt-xl q-pa-md">
            <div class="flex flex-center q-gutter-xs">
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" :aria-label="t('footer.privacy')">{{ t('footer.privacy') }}</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" :aria-label="t('footer.terms')">{{ t('footer.terms') }}</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" :aria-label="t('footer.about')">{{ t('footer.about') }}</a>
            </div>
            <div class="text-center q-mt-sm text-caption text-grey-5">
              {{ t('footer.version') }}
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
            :label="t('mobile.search')"
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
            :label="t('mobile.cancel')" 
            @click="showMobileSearch = false" 
          />
          <q-btn 
            color="primary" 
            :label="t('mobile.search')" 
            @click="performMobileSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Shortcuts Help Dialog -->
    <ShortcutsHelp v-model="showShortcutsHelp" />
    
    <!-- Debug Info (development only) -->
    <ElectronDebugInfo />
  </q-layout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import { useAuthStore } from '../stores/auth'
import { useSessionStore } from '../stores/session'
import { usePWA } from '../composables/usePWA'
import DarkModeToggle from '../components/DarkModeToggle.vue'
import LanguageSelector from '../components/LanguageSelector.vue'
import UnderDevelopmentModal from '../components/UnderDevelopmentModal.vue'
import ConnectionStatus from '../components/WebSocket/ConnectionStatus.vue'
import ElectronWindowControls from '../components/ElectronWindowControls.vue'
import ShortcutsHelp from '../components/ShortcutsHelp.vue'
import ElectronDebugInfo from '../components/ElectronDebugInfo.vue'

export default {
  name: 'MainLayout',

  components: {
    DarkModeToggle,
    LanguageSelector,
    UnderDevelopmentModal,
    ConnectionStatus,
    ElectronWindowControls,
    ShortcutsHelp,
    ElectronDebugInfo
  },

  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const { t } = useI18n()
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

    // Shortcuts Help
    const showShortcutsHelp = ref(false)

    // Dark mode functionality
    const { isDarkMode, loadDarkModePreference } = useDarkMode()

    // Electron functionality
    const isElectron = ref(false)
    const isDev = ref(process.env.DEV)
    
    // Check if running in Electron
    onMounted(() => {
      const electronAPI = window.electronAPI
      isElectron.value = electronAPI?.isElectron || false
      
      console.log('MainLayout mounted - isElectron:', isElectron.value)
      console.log('ElectronAPI available:', !!electronAPI)
      
      loadDarkModePreference()
      // Initialize auth state if needed
      if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
        authStore.initializeAuth()
      }
      
      // Listen for Electron events
      if (isElectron.value && electronAPI?.onOpenSettings) {
        electronAPI.onOpenSettings(() => {
          router.push('/pwa-settings')
        })
      }
      
      // Listen for shortcuts help event
      document.addEventListener('show-shortcuts-help', () => {
        showShortcutsHelp.value = true
      })
    })

    // Computed style for header when in Electron
    const electronHeaderStyle = computed(() => {
      if (isElectron.value) {
        return {
          paddingTop: '40px' // Add space for window controls
        }
      }
      return {}
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
          message: t('notifications.logoutSuccess'),
          position: 'top'
        })
        
        router.push('/login')
      } catch {
        $q.notify({
          type: 'negative',
          message: t('notifications.logoutFailed'),
          position: 'top'
        })
      }
    }

    async function handleLockSession () {
      try {
        await sessionStore.lockSession('manual')
        
        $q.notify({
          type: 'info',
          message: t('notifications.sessionLocked'),
          position: 'top'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: t('notifications.sessionLockFailed'),
          position: 'top'
        })
      }
    }

    // Computed properties for filtered navigation links
    const filteredLinks1 = computed(() => {
      return links1.value.filter(link => {
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
      return links2.value.filter(link => {
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

    // Define navigation links as computed properties for reactivity
    const links1 = computed(() => [
      { icon: 'dashboard', text: t('navigation.dashboard'), route: '/dashboard' },
      { icon: 'hotel', text: t('navigation.reservations'), route: '/reservations', permission: 'reservations.view' },
      { icon: 'calendar_month', text: t('navigation.calendar'), route: '/reservations/calendar', permission: 'reservations.view' },
      { icon: 'meeting_room', text: t('navigation.rooms'), route: '/rooms', permission: 'rooms.view' },
      { icon: 'cleaning_services', text: t('navigation.housekeeping'), route: '/housekeeping', roles: ['admin', 'manager', 'housekeeping'] },
      { icon: 'people', text: t('navigation.guests'), route: '/guests', permission: 'guests.view' },
      { icon: 'spa', text: t('navigation.spa'), route: '/spa', permission: 'spa.view' },
      { icon: 'event', text: t('navigation.events'), route: '/events', permission: 'events.view' },
      ...(isElectron.value ? [
        { icon: 'desktop_windows', text: t('navigation.electronTest'), route: '/electron-test', electronOnly: true }
      ] : [])
    ])

    const links2 = computed(() => [
      { icon: 'account_balance_wallet', text: t('navigation.finance'), route: '/finance', permission: 'finance.view' },
      { icon: 'receipt', text: t('navigation.invoices'), route: '/finance/invoices', permission: 'invoices.view' },
      { icon: 'payment', text: t('navigation.payments'), route: '/finance/payments', permission: 'payments.view' },
      { icon: 'point_of_sale', text: t('navigation.pos'), route: '/pos', permission: 'pos.view' },
      { icon: 'analytics', text: t('navigation.reports'), route: '/reports', permission: 'reports.view' },
      { icon: 'insights', text: t('navigation.analytics'), route: '/analytics', permission: 'analytics.view' },
      { icon: 'eco', text: t('navigation.sustainability'), route: '/sustainability', permission: 'sustainability.view' },
      { icon: 'attach_money', text: t('navigation.rates'), route: '/rates', permission: 'rates.view' },
      { icon: 'hub', text: t('navigation.channelManager'), route: '/channel-manager', permission: 'channel_manager.view' },
      { icon: 'list_alt', text: t('navigation.waitlist'), route: '/waitlist', permission: 'waitlist.view' },
      { icon: 'shield', text: t('navigation.gdpr'), route: '/gdpr', roles: ['admin', 'super-admin'] },
      { icon: 'backup', text: t('navigation.backup'), route: '/backup', roles: ['admin', 'super-admin'] },
      { icon: 'palette', text: t('navigation.branding'), route: '/admin/branding', roles: ['admin', 'super-admin'] },
      { icon: 'admin_panel_settings', text: t('navigation.admin'), route: '/admin', roles: ['admin', 'super-admin'] },
      // Development/Testing links
      ...(isDev.value ? [
        { icon: 'desktop_windows', text: t('navigation.electronTest'), route: '/electron-test', devOnly: true },
        { icon: 'keyboard', text: t('navigation.shortcutsTest'), route: '/shortcuts-test', devOnly: true }
      ] : []),
      // Electron-specific links (when in Electron mode)
      ...(isElectron.value ? [
        { icon: 'bolt', text: t('navigation.electronFeatures'), route: '/electron-test', electronOnly: true }
      ] : []),
      { icon: 'settings', text: t('navigation.settings'), route: '/pwa-settings' }
    ])

    return {
      // i18n
      t,
      
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
      // Electron functionality
      isElectron,
      isDev,
      electronHeaderStyle,
      showShortcutsHelp,
      navigateToRoute,
      performMobileSearch,

      applications: [
        { 
          name: t('applications.hospiePay'), 
          icon: 'payment', 
          color: 'primary',
          route: '/hospiepay'
        },
        { 
          name: t('applications.channelManager'), 
          icon: 'hub', 
          color: 'secondary',
          route: '/channel-manager'
        },
        { 
          name: t('applications.subscription'), 
          icon: 'subscriptions', 
          color: 'info',
          route: '/subscription'
        },
        { 
          name: t('applications.settings'), 
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
      links3: computed(() => [
        { icon: '', text: t('links.languageRegion') },
        { icon: '', text: t('navigation.settings') },
        { icon: 'open_in_new', text: t('links.getAndroidApp') },
        { icon: 'open_in_new', text: t('links.getIosApp') },
        { icon: '', text: t('links.sendFeedback') },
        { icon: 'open_in_new', text: t('links.help') }
      ]),

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

// Electron-specific and development menu items styling
.electron-app, .q-layout
  .main-drawer
    .q-item
      &[data-electron-only="true"], &[data-dev-only="true"]
        background: rgba(25, 118, 210, 0.05)
        border-left: 3px solid var(--q-primary)
        margin: 2px 8px
        border-radius: 6px
        
        .q-icon
          color: var(--q-primary)
        
        .q-item-label
          font-weight: 500
          color: var(--q-primary)
        
        &:hover
          background: rgba(25, 118, 210, 0.1)
          transform: translateX(2px)
          transition: all 0.2s ease
        
        &[data-electron-only="true"]::before
          content: '⚡'
          position: absolute
          right: 8px
          top: 50%
          transform: translateY(-50%)
          font-size: 12px
          opacity: 0.7
        
        &[data-dev-only="true"]::before
          content: '🔧'
          position: absolute
          right: 8px
          top: 50%
          transform: translateY(-50%)
          font-size: 12px
          opacity: 0.7

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