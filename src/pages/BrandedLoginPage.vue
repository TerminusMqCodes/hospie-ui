<template>
  <q-page class="branded-login-page">
    <div class="login-container">
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
        <div class="bg-shape bg-shape-3"></div>
      </div>

      <!-- Login Card -->
      <q-card class="login-card glass-effect">
        <!-- Logo and Branding -->
        <q-card-section class="login-header text-center">
          <div class="logo-container">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              :alt="`${tenantName} Logo`"
              class="login-logo"
            />
            <q-icon
              v-else
              name="business"
              size="64px"
              class="default-logo"
              :color="primaryColor"
            />
          </div>
          <h1 class="login-title">
            {{ tenantName || 'Hotel Management System' }}
          </h1>
          <p class="login-subtitle">
            Sign in to your account
          </p>
        </q-card-section>

        <!-- Login Form -->
        <q-card-section class="login-form">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <!-- Email Field -->
            <q-input
              v-model="loginForm.email"
              type="email"
              label="Email Address"
              outlined
              :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Invalid email format']"
              class="brand-field"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Password Field -->
            <q-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              outlined
              :rules="[val => !!val || 'Password is required']"
              class="brand-field"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Remember Me -->
            <div class="row items-center justify-between">
              <q-checkbox
                v-model="loginForm.remember"
                label="Remember me"
                class="brand-checkbox"
              />
              <q-btn
                flat
                no-caps
                label="Forgot password?"
                class="text-primary"
                @click="goToForgotPassword"
              />
            </div>

            <!-- Login Button -->
            <q-btn
              type="submit"
              :loading="isLoading"
              class="full-width brand-btn-primary"
              size="lg"
              no-caps
            >
              <span v-if="!isLoading">Sign In</span>
              <span v-else>Signing In...</span>
            </q-btn>
          </q-form>
        </q-card-section>

        <!-- Additional Actions -->
        <q-card-section class="login-footer text-center">
          <div class="text-body2 text-grey-6 q-mb-md">
            Don't have an account?
          </div>
          <q-btn
            flat
            no-caps
            label="Create Account"
            class="text-primary"
            @click="goToRegister"
          />
        </q-card-section>

        <!-- Branding Footer -->
        <q-card-section v-if="isCustomized" class="branding-footer text-center">
          <div class="text-caption text-grey-5">
            Powered by {{ tenantName }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Language Selector -->
      <div class="language-selector">
        <q-btn-dropdown
          flat
          dense
          :label="currentLanguage"
          icon="language"
          class="text-white"
        >
          <q-list>
            <q-item
              v-for="lang in languages"
              :key="lang.code"
              clickable
              v-close-popup
              @click="changeLanguage(lang.code)"
            >
              <q-item-section avatar>
                <q-avatar size="24px">
                  <img :src="lang.flag" :alt="lang.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section>{{ lang.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Theme Toggle -->
      <div class="theme-toggle">
        <q-btn
          flat
          round
          dense
          :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
          class="text-white"
          @click="toggleTheme"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useBranding } from 'src/composables/useBranding'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const {
  tenantName,
  logoUrl,
  colors,
  isCustomized,
  initializeBranding
} = useBranding()

// Form data
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

// UI state
const showPassword = ref(false)
const isLoading = ref(false)

// Language support
const currentLanguage = ref('English')
const languages = ref([
  { code: 'en', name: 'English', flag: '/flags/us.png' },
  { code: 'es', name: 'Español', flag: '/flags/es.png' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.png' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.png' }
])

// Computed properties
const primaryColor = computed(() => colors.value?.primary || '#1976d2')
const isDarkMode = computed(() => $q.dark.isActive)

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
      remember: loginForm.value.remember
    })
    
    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top-right'
    })
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Login failed',
      position: 'top-right'
    })
  } finally {
    isLoading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}

const changeLanguage = (langCode) => {
  // Implementation for language change
  const lang = languages.value.find(l => l.code === langCode)
  if (lang) {
    currentLanguage.value = lang.name
    // Here you would typically update the i18n locale
  }
}

const toggleTheme = () => {
  $q.dark.toggle()
}

// Initialize branding on mount
onMounted(async () => {
  try {
    await initializeBranding()
  } catch (error) {
    console.warn('Failed to load branding for login page:', error)
  }
})
</script>

<style lang="scss" scoped>
.branded-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--brand-primary, #1976d2) 0%, 
    var(--brand-secondary, #26a69a) 100%
  );
  position: relative;
  overflow: hidden;
  
  .login-container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 400px;
    padding: 20px;
  }
  
  .background-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    
    .bg-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      
      &.bg-shape-1 {
        width: 300px;
        height: 300px;
        top: -150px;
        right: -150px;
        animation: float 6s ease-in-out infinite;
      }
      
      &.bg-shape-2 {
        width: 200px;
        height: 200px;
        bottom: -100px;
        left: -100px;
        animation: float 8s ease-in-out infinite reverse;
      }
      
      &.bg-shape-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        left: -75px;
        animation: float 10s ease-in-out infinite;
      }
    }
  }
  
  .login-card {
    border-radius: 16px;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .login-header {
      padding: 32px 24px 24px;
      
      .logo-container {
        margin-bottom: 16px;
        
        .login-logo {
          max-height: 80px;
          max-width: 200px;
          object-fit: contain;
        }
        
        .default-logo {
          opacity: 0.8;
        }
      }
      
      .login-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--brand-primary, #1976d2);
      }
      
      .login-subtitle {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
      }
    }
    
    .login-form {
      padding: 0 24px 24px;
      
      .brand-field {
        .q-field__control {
          border-radius: 12px;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: var(--brand-primary, #1976d2);
          }
        }
        
        &.q-field--focused .q-field__control {
          border-color: var(--brand-primary, #1976d2);
          box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb, 25, 118, 210), 0.2);
        }
      }
      
      .brand-checkbox {
        .q-checkbox__inner {
          color: var(--brand-primary, #1976d2);
        }
      }
      
      .brand-btn-primary {
        background: linear-gradient(135deg, 
          var(--brand-primary, #1976d2), 
          var(--brand-secondary, #26a69a)
        );
        color: white;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(var(--q-primary-rgb, 25, 118, 210), 0.3);
        }
        
        &:active {
          transform: translateY(-1px);
        }
      }
    }
    
    .login-footer {
      padding: 0 24px 24px;
    }
    
    .branding-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(0, 0, 0, 0.02);
    }
  }
  
  .language-selector {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 3;
  }
  
  .theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 3;
  }
}

// Dark mode adjustments
.body--dark {
  .branded-login-page {
    .login-card {
      background: rgba(30, 30, 30, 0.95);
      color: white;
      
      .login-title {
        color: var(--brand-primary, #42a5f5);
      }
      
      .login-subtitle {
        color: #ccc;
      }
      
      .branding-footer {
        background: rgba(255, 255, 255, 0.05);
        border-top-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .branded-login-page {
    padding: 16px;
    
    .login-container {
      max-width: 100%;
    }
    
    .login-card {
      .login-header {
        padding: 24px 16px 16px;
        
        .login-title {
          font-size: 1.25rem;
        }
      }
      
      .login-form {
        padding: 0 16px 16px;
      }
      
      .login-footer {
        padding: 0 16px 16px;
      }
      
      .branding-footer {
        padding: 12px 16px;
      }
    }
    
    .language-selector,
    .theme-toggle {
      top: 16px;
    }
    
    .language-selector {
      left: 16px;
    }
    
    .theme-toggle {
      right: 16px;
    }
  }
}

// Animations
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// Enhanced focus states
.q-field:focus-within,
.q-btn:focus {
  outline: 2px solid var(--brand-primary, #1976d2);
  outline-offset: 2px;
  border-radius: 12px;
}
</style>