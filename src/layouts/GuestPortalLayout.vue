<template>
  <q-layout view="lHh Lpr lFf" class="guest-portal-layout">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="lt-md"
        />

        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="hotel" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Guest Portal</span>
        </q-toolbar-title>

        <!-- Desktop Navigation -->
        <div class="row q-gutter-sm gt-sm">
          <q-btn 
            flat 
            no-caps
            label="Dashboard" 
            icon="dashboard"
            :to="{ name: 'guest-portal-dashboard' }"
            :class="{ 'bg-white text-primary': $route.name === 'guest-portal-dashboard' }"
          />
          <q-btn 
            flat 
            no-caps
            label="Reservations" 
            icon="event"
            :to="{ name: 'guest-portal-reservations' }"
            :class="{ 'bg-white text-primary': $route.name?.includes('reservations') }"
          />
          <q-btn 
            flat 
            no-caps
            label="Messages" 
            icon="message"
            :to="{ name: 'guest-portal-messages' }"
            :class="{ 'bg-white text-primary': $route.name === 'guest-portal-messages' }"
          />
          <q-btn 
            flat 
            no-caps
            label="Profile" 
            icon="person"
            :to="{ name: 'guest-portal-profile' }"
            :class="{ 'bg-white text-primary': $route.name === 'guest-portal-profile' }"
          />
        </div>

        <!-- User Menu -->
        <q-btn-dropdown 
          flat 
          round 
          dense 
          icon="account_circle"
          class="q-ml-sm"
        >
          <q-list style="min-width: 200px">
            <q-item-label header class="text-weight-bold">
              {{ guestPortalStore.guestName || 'Guest' }}
            </q-item-label>
            
            <q-item 
              clickable 
              v-close-popup 
              :to="{ name: 'guest-portal-profile' }"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-close-popup 
              :to="{ name: 'guest-portal-loyalty' }"
            >
              <q-item-section avatar>
                <q-icon name="loyalty" />
              </q-item-section>
              <q-item-section>Loyalty Program</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item 
              clickable 
              v-close-popup 
              @click="showUIPreferences = true"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>UI Preferences</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item 
              clickable 
              v-close-popup 
              @click="logout"
            >
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Mobile Navigation Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :breakpoint="1024"
      :width="280"
      class="bg-white"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-weight-bold text-primary">
            Navigation
          </q-item-label>

          <q-item 
            clickable 
            v-ripple
            :to="{ name: 'guest-portal-dashboard' }"
            :active="$route.name === 'guest-portal-dashboard'"
            active-class="text-primary bg-blue-1"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple
            :to="{ name: 'guest-portal-reservations' }"
            :active="$route.name?.includes('reservations')"
            active-class="text-primary bg-blue-1"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>Reservations</q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple
            :to="{ name: 'guest-portal-messages' }"
            :active="$route.name === 'guest-portal-messages'"
            active-class="text-primary bg-blue-1"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="message" />
            </q-item-section>
            <q-item-section>Messages</q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple
            :to="{ name: 'guest-portal-profile' }"
            :active="$route.name === 'guest-portal-profile'"
            active-class="text-primary bg-blue-1"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Profile</q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple
            :to="{ name: 'guest-portal-loyalty' }"
            :active="$route.name === 'guest-portal-loyalty'"
            active-class="text-primary bg-blue-1"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="loyalty" />
            </q-item-section>
            <q-item-section>Loyalty Program</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item 
            clickable 
            v-ripple
            @click="logout"
          >
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="guest-portal-content">
      <router-view />
    </q-page-container>

    <!-- UI Preferences Dialog -->
    <UIPreferencesDialog v-model="showUIPreferences" />

    <!-- Guest Info Footer (Mobile) -->
    <q-footer elevated class="bg-grey-1 text-dark lt-md" v-if="guestPortalStore.isLoggedIn">
      <q-toolbar class="justify-center q-py-xs">
        <div class="text-center">
          <div class="text-caption text-weight-medium">
            Welcome, {{ guestPortalStore.guestName || 'Guest' }}
          </div>
          <div class="text-caption text-grey-6">
            {{ getTierDisplayName(guestPortalStore.guestTier) }} Member
            <q-chip 
              v-if="guestPortalStore.isVip" 
              color="amber" 
              text-color="black" 
              icon="star" 
              size="xs" 
              class="q-ml-xs"
            >
              VIP
            </q-chip>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useGuestPortalStore } from 'src/stores/guestPortal'
import { useGuestUIPreferences } from 'src/composables/useGuestUIPreferences'
import UIPreferencesDialog from 'src/components/GuestPortal/UIPreferencesDialog.vue'

const router = useRouter()
const $q = useQuasar()
const { locale } = useI18n()
const guestPortalStore = useGuestPortalStore()
const { initializePreferences, uiLanguage } = useGuestUIPreferences()

const leftDrawerOpen = ref(false)
const showUIPreferences = ref(false)

// Watch for language changes and update i18n locale
watch(uiLanguage, (newLang) => {
  locale.value = newLang
}, { immediate: true })

onMounted(async () => {
  // Load guest data from storage if available
  await guestPortalStore.loadFromStorage()
  
  // Initialize UI preferences
  await initializePreferences()
  
  // If not authenticated, redirect to login
  if (!guestPortalStore.isLoggedIn) {
    router.push('/guest-portal/login')
  }
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
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

const logout = async () => {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await guestPortalStore.logout()
      
      $q.notify({
        type: 'positive',
        message: 'Logged out successfully',
        position: 'top'
      })
      
      router.push('/guest-portal/login')
    } catch (error) {
      console.error('Logout error:', error)
      
      $q.notify({
        type: 'negative',
        message: 'Error during logout',
        position: 'top'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.guest-portal-layout {
  .q-header {
    .q-toolbar {
      min-height: 64px;
    }
    
    .q-btn {
      border-radius: 8px;
      
      &.bg-white {
        color: var(--q-primary) !important;
        font-weight: 500;
      }
    }
  }
  
  .q-drawer {
    .q-list {
      .q-item {
        border-radius: 8px;
        margin: 2px 8px;
        
        &.q-router-link--active {
          font-weight: 500;
        }
        
        .body--dark & {
          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          &.q-router-link--active {
            background: rgba(var(--q-primary-rgb), 0.2);
            color: var(--q-primary);
          }
        }
      }
    }
  }
  
  .guest-portal-content {
    background: #f5f5f5;
    min-height: calc(100vh - 64px);
    
    .body--dark & {
      background: #1d1d1d;
    }
  }
  
  .q-footer {
    .q-toolbar {
      min-height: 48px;
    }
  }
}

// Mobile specific styles
@media (max-width: 1023px) {
  .guest-portal-layout {
    .guest-portal-content {
      min-height: calc(100vh - 64px - 48px); // header + footer
    }
  }
}

// Desktop specific styles  
@media (min-width: 1024px) {
  .guest-portal-layout {
    .q-drawer {
      display: none; // Hide drawer on desktop since we have top nav
    }
  }
}
</style>