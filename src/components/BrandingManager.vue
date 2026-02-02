<template>
  <div class="branding-manager">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="palette" class="q-mr-sm" />
          Branding Management
        </div>
        <div class="text-body2 text-grey-7">
          Customize your hotel's branding including colors, logo, and email templates.
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-md">Loading branding configuration...</div>
    </div>

    <!-- Error State -->
    <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
      <template v-slot:action>
        <q-btn flat label="Retry" @click="refreshBranding" />
        <q-btn flat label="Dismiss" @click="clearError" />
      </template>
    </q-banner>

    <!-- Branding Configuration -->
    <div v-if="isLoaded" class="row q-gutter-md">
      <!-- Color Scheme -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="color_lens" class="q-mr-sm" />
              Color Scheme
            </div>
            
            <div class="q-gutter-md">
              <div class="row q-gutter-sm">
                <div class="col">
                  <q-input
                    v-model="colorForm.primary"
                    label="Primary Color"
                    :rules="[colorRule]"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="colorForm.primary" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col">
                  <q-input
                    v-model="colorForm.secondary"
                    label="Secondary Color"
                    :rules="[colorRule]"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="colorForm.secondary" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              
              <div class="row q-gutter-sm">
                <div class="col">
                  <q-input
                    v-model="colorForm.accent"
                    label="Accent Color"
                    :rules="[colorRule]"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="colorForm.accent" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col">
                  <q-input
                    v-model="colorForm.success"
                    label="Success Color"
                    :rules="[colorRule]"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="colorForm.success" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
            
            <!-- Color Preview -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Preview</div>
              <div class="row q-gutter-sm">
                <div
                  v-for="(color, name) in colorForm"
                  :key="name"
                  class="color-preview"
                  :style="{ backgroundColor: color }"
                  :title="`${name}: ${color}`"
                >
                  <div class="color-label">{{ name }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn
              flat
              label="Reset"
              @click="resetColors"
              :disable="isUpdating"
            />
            <q-btn
              color="primary"
              label="Update Colors"
              @click="saveColors"
              :loading="isUpdating"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Logo Management -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="image" class="q-mr-sm" />
              Logo
            </div>
            
            <!-- Current Logo -->
            <div v-if="logoUrl" class="q-mb-md text-center">
              <div class="text-subtitle2 q-mb-sm">Current Logo</div>
              <img
                :src="logoUrl"
                alt="Current Logo"
                class="current-logo"
                style="max-width: 200px; max-height: 100px; object-fit: contain;"
              />
            </div>
            
            <!-- Logo Upload -->
            <q-file
              v-model="logoFile"
              label="Upload New Logo"
              accept="image/*"
              max-file-size="2097152"
              @rejected="onLogoRejected"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
            
            <!-- Logo Preview -->
            <div v-if="logoPreview" class="q-mt-md text-center">
              <div class="text-subtitle2 q-mb-sm">Preview</div>
              <img
                :src="logoPreview"
                alt="Logo Preview"
                class="logo-preview"
                style="max-width: 200px; max-height: 100px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn
              flat
              label="Remove Logo"
              @click="removeLogo"
              :disable="!logoUrl || isUpdating"
            />
            <q-btn
              color="primary"
              label="Upload Logo"
              @click="saveLogo"
              :disable="!logoFile"
              :loading="isUpdating"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Email Branding -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="email" class="q-mr-sm" />
              Email Branding
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="emailForm.header_text"
                  label="Email Header Text"
                  hint="Text displayed at the top of emails"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="emailForm.support_email"
                  label="Support Email"
                  type="email"
                  hint="Contact email for support"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="emailForm.footer_text"
                  label="Email Footer Text"
                  type="textarea"
                  rows="3"
                  hint="Text displayed at the bottom of emails"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="emailForm.signature"
                  label="Email Signature"
                  type="textarea"
                  rows="4"
                  hint="Signature added to emails"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn
              flat
              label="Reset"
              @click="resetEmailBranding"
              :disable="isUpdating"
            />
            <q-btn
              color="primary"
              label="Update Email Branding"
              @click="saveEmailBranding"
              :loading="isUpdating"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Custom Domain -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="domain" class="q-mr-sm" />
              Custom Domain
            </div>
            
            <q-input
              v-model="domainForm.domain"
              label="Custom Domain"
              hint="e.g., booking.yourhotel.com"
              :rules="[domainRule]"
            />
            
            <div v-if="customDomain" class="q-mt-md">
              <q-chip color="positive" text-color="white" icon="check">
                Current: {{ customDomain }}
              </q-chip>
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn
              flat
              label="Remove Domain"
              @click="removeDomain"
              :disable="!customDomain || isUpdating"
            />
            <q-btn
              color="primary"
              label="Update Domain"
              @click="saveDomain"
              :loading="isUpdating"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Actions -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="settings" class="q-mr-sm" />
              Actions
            </div>
            
            <div class="row q-gutter-md">
              <q-btn
                color="secondary"
                icon="preview"
                label="Preview Changes"
                @click="showPreview"
                :disable="isUpdating"
              />
              <q-btn
                color="info"
                icon="phone_android"
                label="Generate Mobile Config"
                @click="generateMobileConfig"
                :disable="isUpdating"
              />
              <q-btn
                color="warning"
                icon="refresh"
                label="Reset All Branding"
                @click="confirmResetAll"
                :disable="isUpdating"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreviewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Branding Preview</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section>
          <div class="preview-container" :style="previewStyles">
            <div class="preview-header">
              <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="preview-logo" />
              <h2>{{ tenantName || 'Your Hotel' }}</h2>
            </div>
            <div class="preview-content">
              <q-btn color="primary" label="Primary Button" class="q-mr-md" />
              <q-btn color="secondary" label="Secondary Button" class="q-mr-md" />
              <q-btn color="accent" label="Accent Button" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reset Confirmation Dialog -->
    <q-dialog v-model="showResetDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to reset all branding to defaults?</span>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="warning" label="Reset All" @click="performResetAll" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBranding } from 'src/composables/useBranding'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Use branding composable
const {
  tenantName,
  colors,
  logoUrl,
  emailBranding,
  customDomain,
  isLoaded,
  isLoading,
  isUpdating,
  error,
  updateColors,
  updateLogo,
  updateEmailBranding,
  updateCustomDomain,
  resetBranding,
  generateManifest,
  refreshBranding,
  clearError
} = useBranding()

// Form data
const colorForm = ref({
  primary: '#1976d2',
  secondary: '#26a69a',
  accent: '#9c27b0',
  success: '#21ba45',
  error: '#c10015',
  warning: '#f2c037',
  info: '#31ccec'
})

const emailForm = ref({
  header_text: '',
  footer_text: '',
  support_email: '',
  signature: ''
})

const domainForm = ref({
  domain: ''
})

// File handling
const logoFile = ref(null)
const logoPreview = ref(null)

// Dialog states
const showPreviewDialog = ref(false)
const showResetDialog = ref(false)

// Preview styles
const previewStyles = computed(() => {
  return {
    '--q-primary': colorForm.value.primary,
    '--q-secondary': colorForm.value.secondary,
    '--q-accent': colorForm.value.accent,
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px'
  }
})

// Validation rules
const colorRule = (val) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return colorRegex.test(val) || 'Please enter a valid hex color (e.g., #1976d2)'
}

const domainRule = (val) => {
  if (!val) return true
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  return domainRegex.test(val) || 'Please enter a valid domain (e.g., booking.yourhotel.com)'
}

// Watch for logo file changes
watch(logoFile, (newFile) => {
  if (newFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(newFile)
  } else {
    logoPreview.value = null
  }
})

// Watch for branding changes and update forms
watch(colors, (newColors) => {
  if (newColors) {
    Object.assign(colorForm.value, newColors)
  }
}, { immediate: true })

watch(emailBranding, (newEmailBranding) => {
  if (newEmailBranding) {
    Object.assign(emailForm.value, newEmailBranding)
  }
}, { immediate: true })

watch(customDomain, (newDomain) => {
  if (newDomain) {
    domainForm.value.domain = newDomain
  }
}, { immediate: true })

// Methods
const saveColors = async () => {
  try {
    await updateColors(colorForm.value)
  } catch (error) {
    console.error('Failed to save colors:', error)
  }
}

const resetColors = () => {
  colorForm.value = {
    primary: '#1976d2',
    secondary: '#26a69a',
    accent: '#9c27b0',
    success: '#21ba45',
    error: '#c10015',
    warning: '#f2c037',
    info: '#31ccec'
  }
}

const saveLogo = async () => {
  if (!logoFile.value) return
  
  try {
    await updateLogo(logoFile.value)
    logoFile.value = null
    logoPreview.value = null
  } catch (error) {
    console.error('Failed to save logo:', error)
  }
}

const removeLogo = async () => {
  // Implementation would depend on backend API
  $q.notify({
    type: 'info',
    message: 'Logo removal feature coming soon',
    position: 'top-right'
  })
}

const onLogoRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `File rejected: ${rejectedEntries[0].failedPropValidation}`,
    position: 'top-right'
  })
}

const saveEmailBranding = async () => {
  try {
    await updateEmailBranding(emailForm.value)
  } catch (error) {
    console.error('Failed to save email branding:', error)
  }
}

const resetEmailBranding = () => {
  emailForm.value = {
    header_text: '',
    footer_text: '',
    support_email: '',
    signature: ''
  }
}

const saveDomain = async () => {
  if (!domainForm.value.domain) return
  
  try {
    await updateCustomDomain(domainForm.value.domain)
  } catch (error) {
    console.error('Failed to save domain:', error)
  }
}

const removeDomain = async () => {
  try {
    await updateCustomDomain('')
    domainForm.value.domain = ''
  } catch (error) {
    console.error('Failed to remove domain:', error)
  }
}

const showPreview = () => {
  showPreviewDialog.value = true
}

const generateMobileConfig = async () => {
  try {
    const manifest = await generateManifest()
    
    $q.dialog({
      title: 'Mobile App Configuration',
      message: 'Mobile app configuration generated successfully!',
      html: true,
      ok: 'Download',
      cancel: 'Close'
    }).onOk(() => {
      // Download manifest file
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'manifest.json'
      a.click()
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    console.error('Failed to generate mobile config:', error)
  }
}

const confirmResetAll = () => {
  showResetDialog.value = true
}

const performResetAll = async () => {
  try {
    await resetBranding()
    showResetDialog.value = false
    
    // Reset forms
    resetColors()
    resetEmailBranding()
    domainForm.value.domain = ''
  } catch (error) {
    console.error('Failed to reset branding:', error)
  }
}

// Initialize component
onMounted(() => {
  if (!isLoaded.value) {
    refreshBranding()
  }
})
</script>

<style lang="scss" scoped>
.branding-manager {
  .color-preview {
    width: 60px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.1);
    
    .color-label {
      font-size: 10px;
      font-weight: 500;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      text-transform: capitalize;
    }
  }
  
  .current-logo,
  .logo-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    background: white;
  }
  
  .preview-container {
    .preview-header {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      margin-bottom: 20px;
      
      .preview-logo {
        max-height: 60px;
        margin-bottom: 10px;
      }
      
      h2 {
        margin: 0;
        color: var(--q-primary);
      }
    }
    
    .preview-content {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
  }
}
</style>