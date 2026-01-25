<template>
  <q-header class="branded-header" :class="headerClass">
    <q-toolbar class="brand-toolbar">
      <!-- Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="toggleLeftDrawer"
        class="q-mr-sm"
      />

      <!-- Logo and Title -->
      <div class="header-brand">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="`${tenantName} Logo`"
          class="header-logo"
        />
        <q-toolbar-title class="header-title">
          {{ tenantName || 'Hotel Management System' }}
        </q-toolbar-title>
      </div>

      <q-space />

      <!-- User Actions -->
      <div class="header-actions">
        <!-- Notifications -->
        <q-btn
          flat
          dense
          round
          icon="notifications"
          class="q-mr-sm"
        >
          <q-badge
            v-if="notificationCount > 0"
            color="negative"
            floating
            rounded
          >
            {{ notificationCount }}
          </q-badge>
          
          <q-menu>
            <q-list style="min-width: 300px">
              <q-item-label header>Notifications</q-item-label>
              <q-separator />
              
              <q-item
                v-for="notification in notifications"
                :key="notification.id"
                clickable
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon :name="notification.icon" :color="notification.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ notification.title }}</q-item-label>
                  <q-item-label caption>{{ notification.message }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ formatTime(notification.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-separator />
              <q-item clickable>
                <q-item-section>
                  <q-item-label class="text-center text-primary">
                    View All Notifications
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- User Menu -->
        <q-btn
          flat
          dense
          round
          class="user-menu-btn"
        >
          <q-avatar size="32px" color="white" text-color="primary">
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="userName"
            />
            <span v-else>{{ userInitials }}</span>
          </q-avatar>
          
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item-label header>
                <div class="text-weight-bold">{{ userName }}</div>
                <div class="text-caption">{{ userEmail }}</div>
              </q-item-label>
              <q-separator />
              
              <q-item clickable @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              
              <q-item clickable @click="goToSettings">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>
              
              <q-item
                v-if="canManageBranding"
                clickable
                @click="goToBranding"
              >
                <q-item-section avatar>
                  <q-icon name="palette" />
                </q-item-section>
                <q-item-section>Branding</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable @click="toggleDarkMode">
                <q-item-section avatar>
                  <q-icon :name="isDarkMode ? 'light_mode' : 'dark_mode'" />
                </q-item-section>
                <q-item-section>
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBranding } from 'src/composables/useBranding'
import { useAuthStore } from 'src/stores/auth'

// Props
defineProps({
  leftDrawerOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggle-left-drawer'])

// Composables
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const {
  tenantName,
  logoUrl,
  isLoaded
} = useBranding()

// Mock notifications (replace with actual notification system)
const notifications = ref([
  {
    id: 1,
    title: 'New Reservation',
    message: 'Room 101 booked for tonight',
    icon: 'hotel',
    color: 'positive',
    created_at: new Date()
  },
  {
    id: 2,
    title: 'Check-out Reminder',
    message: '3 guests checking out today',
    icon: 'schedule',
    color: 'warning',
    created_at: new Date(Date.now() - 30 * 60 * 1000)
  }
])

// Computed properties
const notificationCount = computed(() => notifications.value.length)

const userName = computed(() => authStore.userName || 'User')
const userEmail = computed(() => authStore.userEmail || '')
const userAvatar = computed(() => authStore.user?.avatar || null)

const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const canManageBranding = computed(() => {
  return authStore.hasPermission('manage_branding') || authStore.isAdmin
})

const isDarkMode = computed(() => $q.dark.isActive)

const headerClass = computed(() => {
  return {
    'branded-header--loaded': isLoaded.value,
    'branded-header--dark': isDarkMode.value
  }
})

// Methods
const toggleLeftDrawer = () => {
  emit('toggle-left-drawer')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToBranding = () => {
  router.push('/admin/branding')
}

const toggleDarkMode = () => {
  $q.dark.toggle()
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<style lang="scss" scoped>
.branded-header {
  transition: all 0.3s ease;
  
  .brand-toolbar {
    padding: 0 16px;
    min-height: 64px;
    
    @media (max-width: 768px) {
      min-height: 56px;
      padding: 0 8px;
    }
  }
  
  .header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .header-logo {
      height: 40px;
      width: auto;
      max-width: 120px;
      object-fit: contain;
      
      @media (max-width: 768px) {
        height: 32px;
        max-width: 100px;
      }
    }
    
    .header-title {
      font-weight: 600;
      font-size: 1.25rem;
      
      @media (max-width: 768px) {
        font-size: 1.1rem;
      }
      
      @media (max-width: 480px) {
        display: none;
      }
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .user-menu-btn {
      .q-avatar {
        border: 2px solid rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.05);
        }
      }
    }
  }
  
  // Enhanced styling when branding is loaded
  &.branded-header--loaded {
    .brand-toolbar {
      background: var(--brand-gradient-primary, linear-gradient(135deg, #1976d2, #42a5f5));
      box-shadow: 0 2px 8px var(--brand-shadow-primary, rgba(25, 118, 210, 0.3));
    }
    
    .header-title {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
  
  // Dark mode adjustments
  &.branded-header--dark {
    .brand-toolbar {
      background: var(--brand-primary, #1976d2);
    }
    
    .user-menu-btn .q-avatar {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .branded-header {
    .header-actions {
      gap: 4px;
      
      .q-btn {
        min-width: 40px;
        min-height: 40px;
      }
    }
  }
}

@media (max-width: 480px) {
  .branded-header {
    .header-brand {
      gap: 8px;
      
      .header-logo {
        height: 28px;
        max-width: 80px;
      }
    }
  }
}

// Animation enhancements
.branded-header {
  .q-btn {
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .header-logo {
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

// Menu styling
:deep(.q-menu) {
  .q-list {
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    .q-item {
      border-radius: 4px;
      margin: 2px 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
        transform: translateX(2px);
      }
    }
  }
}
</style>