<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="full-width" style="max-width: 800px;">
      <q-card class="q-pa-lg text-center" :class="isDarkMode ? 'bg-dark' : 'bg-white'">
        <!-- Success Animation -->
        <div class="q-mb-xl">
          <div class="success-icon-container q-mx-auto q-mb-md">
            <q-icon name="check_circle" color="positive" size="80px" />
          </div>
          <h1 class="text-h3 text-weight-bold q-mb-sm" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
            Welcome to Hospie PMS!
          </h1>
          <p class="text-h6" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            Your account has been created successfully
          </p>
        </div>

        <!-- Account Information -->
        <q-card v-if="completionData" :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat class="q-mb-lg text-left">
          <q-card-section>
            <h3 class="text-h6 text-weight-medium q-mb-md text-center" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
              Your Account Details
            </h3>
            
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Property Name
                      </q-item-label>
                      <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                        {{ completionData.tenant?.name }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section>
                      <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Your URL
                      </q-item-label>
                      <q-item-label class="text-weight-medium">
                        <a 
                          :href="completionData.tenant?.url" 
                          target="_blank" 
                          class="text-primary text-decoration-none"
                        >
                          {{ completionData.tenant?.url }}
                        </a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section>
                      <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Status
                      </q-item-label>
                      <q-item-label class="text-weight-medium row items-center" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                        <q-icon name="check_circle" color="positive" size="sm" class="q-mr-xs" />
                        {{ completionData.tenant?.status }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Admin Email
                      </q-item-label>
                      <q-item-label class="text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                        {{ completionData.admin_credentials?.email }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section>
                      <q-item-label caption :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                        Temporary Password
                      </q-item-label>
                      <q-item-label>
                        <q-chip 
                          :class="isDarkMode ? 'bg-warning text-grey-9' : 'bg-warning text-white'"
                          size="md"
                          icon="key"
                        >
                          {{ completionData.admin_credentials?.temp_password }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
            
            <!-- Important Notice -->
            <q-banner 
              class="q-mt-md" 
              :class="isDarkMode ? 'bg-warning text-grey-9' : 'bg-warning text-white'"
              rounded
            >
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              <div class="text-weight-bold">Important Security Notice</div>
              <div class="q-mt-xs">
                This is a temporary password. You'll be prompted to change it when you first log in for security reasons.
                Please save these credentials in a secure location.
              </div>
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Next Steps -->
        <q-card :class="isDarkMode ? 'bg-blue-9' : 'bg-blue-1'" flat class="q-mb-lg text-left">
          <q-card-section>
            <h3 class="text-h6 text-weight-medium q-mb-md text-center" :class="isDarkMode ? 'text-blue-2' : 'text-blue-9'">
              Next Steps
            </h3>
            
            <div class="q-gutter-md">
              <q-card 
                v-for="(step, index) in nextSteps" 
                :key="index"
                :class="isDarkMode ? 'bg-grey-9' : 'bg-white'"
                bordered
              >
                <q-card-section class="row items-start q-gutter-md">
                  <q-avatar color="primary" text-color="white" size="md">
                    {{ index + 1 }}
                  </q-avatar>
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
                      {{ step.title }}
                    </div>
                    <div class="text-body2 q-mt-xs" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
                      {{ step.description }}
                    </div>
                    <q-btn
                      v-if="step.action"
                      :href="step.url"
                      target="_blank"
                      color="primary"
                      outline
                      size="sm"
                      class="q-mt-sm"
                      :icon="step.icon"
                      :label="step.action"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <!-- Welcome Email Notice -->
        <q-card :class="isDarkMode ? 'bg-positive' : 'bg-green-1'" flat class="q-mb-lg">
          <q-card-section class="text-center">
            <div class="row items-center justify-center q-gutter-sm q-mb-sm">
              <q-icon name="email" :color="isDarkMode ? 'white' : 'positive'" size="md" />
              <h3 class="text-h6 text-weight-medium" :class="isDarkMode ? 'text-white' : 'text-positive'">
                Check Your Email
              </h3>
            </div>
            <p class="text-body2" :class="isDarkMode ? 'text-green-1' : 'text-positive'">
              We've sent a welcome email with detailed instructions and additional resources to help you get started.
              If you don't see it in your inbox, please check your spam folder.
            </p>
          </q-card-section>
        </q-card>

        <!-- Support Information -->
        <q-card :class="isDarkMode ? 'bg-grey-8' : 'bg-grey-1'" flat class="q-mb-lg">
          <q-card-section>
            <h3 class="text-h6 text-weight-medium q-mb-md text-center" :class="isDarkMode ? 'text-white' : 'text-grey-9'">
              Need Help?
            </h3>
            <p class="text-body2 q-mb-md text-center" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
              Our support team is here to help you succeed. Here are some resources to get you started:
            </p>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="book" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        <a href="#" class="text-primary text-decoration-none">Complete User Guide</a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="play_circle" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        <a href="#" class="text-primary text-decoration-none">Video Tutorials</a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="chat" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label :class="isDarkMode ? 'text-grey-3' : 'text-grey-8'">
                        Live Chat (Available 24/7)
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="email" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        <a href="mailto:support@hospie.com" class="text-primary text-decoration-none">
                          support@hospie.com
                        </a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="phone" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label :class="isDarkMode ? 'text-grey-3' : 'text-grey-8'">
                        +1 (555) 123-HOSPIE
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="help" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        <a href="#" class="text-primary text-decoration-none">FAQ & Knowledge Base</a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Main Action -->
        <div class="q-gutter-md q-mb-lg">
          <q-btn
            v-if="completionData?.admin_credentials?.login_url"
            :href="completionData.admin_credentials.login_url"
            target="_blank"
            color="positive"
            size="xl"
            class="q-px-xl q-py-md"
            unelevated
          >
            <q-icon name="login" class="q-mr-sm" />
            Access Your Dashboard
          </q-btn>
          
          <div class="text-caption" :class="isDarkMode ? 'text-grey-4' : 'text-grey-6'">
            You can also bookmark this URL: 
            <span class="text-weight-medium">{{ completionData?.tenant?.url }}</span>
          </div>
        </div>

        <!-- Pro Tip -->
        <q-banner 
          :class="isDarkMode ? 'bg-blue-9 text-blue-2' : 'bg-blue-1 text-blue-9'"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="lightbulb" color="primary" />
          </template>
          <div class="text-weight-bold">💡 Pro Tip</div>
          <div class="q-mt-xs">
            Start by adding your room types and a few sample rooms. This will help you understand how the system works 
            before importing all your data. The demo data we've included will give you a head start!
          </div>
        </q-banner>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from 'src/stores/onboarding'
import { useDarkMode } from 'src/composables/useDarkMode'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const { isDarkMode } = useDarkMode()

const completionData = computed(() => onboardingStore.completionResult)

const nextSteps = computed(() => {
  if (!completionData.value?.next_steps) return []
  
  return [
    {
      title: 'Log in to your account',
      description: 'Use your email and the temporary password provided above',
      action: 'Login Now',
      url: completionData.value.next_steps.login,
      icon: 'login'
    },
    {
      title: 'Complete your profile',
      description: 'Set up your property details and preferences',
      action: 'Setup Profile',
      url: completionData.value.next_steps.setup_profile,
      icon: 'person'
    },
    {
      title: 'Explore your dashboard',
      description: 'Get familiar with the interface and available features',
      action: 'View Dashboard',
      url: completionData.value.next_steps.dashboard,
      icon: 'dashboard'
    },
    {
      title: 'Add your rooms',
      description: 'Configure your room types and inventory',
      action: null, // Will be available after login
      url: null,
      icon: null
    }
  ]
})

onMounted(() => {
  // If no completion data, redirect to start
  if (!completionData.value) {
    router.push('/onboarding')
  }
})
</script>

<style scoped>
.success-icon-container {
  width: 120px;
  height: 120px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .success-icon-container {
  background: rgba(76, 175, 80, 0.2);
}
</style>