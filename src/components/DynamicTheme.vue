<template>
  <component :is="'style'" v-if="dynamicStyles">
    {{ dynamicStyles }}
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useBranding } from 'src/composables/useBranding'

const {
  logoUrl,
  isLoaded,
  getBrandColors
} = useBranding()

// Generate dynamic CSS based on branding
const dynamicStyles = computed(() => {
  if (!isLoaded.value) return ''

  const brandColors = getBrandColors()
  
  return `
    :root {
      /* Primary brand colors */
      --q-primary: ${brandColors.primary};
      --q-secondary: ${brandColors.secondary};
      --q-accent: ${brandColors.accent};
      --q-positive: ${brandColors.positive};
      --q-negative: ${brandColors.negative};
      --q-info: ${brandColors.info};
      --q-warning: ${brandColors.warning};
      
      /* Brand-specific variables */
      --brand-primary: ${brandColors.primary};
      --brand-secondary: ${brandColors.secondary};
      --brand-accent: ${brandColors.accent};
      --brand-logo-url: ${logoUrl.value ? `url(${logoUrl.value})` : 'none'};
      
      /* Derived colors */
      --brand-primary-light: ${lightenColor(brandColors.primary, 20)};
      --brand-primary-dark: ${darkenColor(brandColors.primary, 20)};
      --brand-secondary-light: ${lightenColor(brandColors.secondary, 20)};
      --brand-secondary-dark: ${darkenColor(brandColors.secondary, 20)};
      
      /* Gradient backgrounds */
      --brand-gradient-primary: linear-gradient(135deg, ${brandColors.primary}, ${lightenColor(brandColors.primary, 10)});
      --brand-gradient-secondary: linear-gradient(135deg, ${brandColors.secondary}, ${lightenColor(brandColors.secondary, 10)});
      
      /* Shadow colors */
      --brand-shadow-primary: ${hexToRgba(brandColors.primary, 0.3)};
      --brand-shadow-secondary: ${hexToRgba(brandColors.secondary, 0.3)};
    }
    
    /* Apply branding to Quasar components */
    .q-btn--standard.q-btn--rectangle.q-btn--actionable.q-focusable.q-hoverable {
      background: var(--brand-gradient-primary);
    }
    
    .q-btn--flat.text-primary {
      color: var(--brand-primary) !important;
    }
    
    .q-btn--outline.text-primary {
      color: var(--brand-primary) !important;
      border-color: var(--brand-primary) !important;
    }
    
    .q-header {
      background: var(--brand-gradient-primary) !important;
    }
    
    .q-drawer {
      border-right: 3px solid var(--brand-primary);
    }
    
    .q-item--active {
      background: ${hexToRgba(brandColors.primary, 0.1)} !important;
      border-left: 3px solid var(--brand-primary);
    }
    
    .q-tab--active {
      color: var(--brand-primary) !important;
    }
    
    .q-tab-panels {
      border-top: 2px solid var(--brand-primary);
    }
    
    .q-field--focused .q-field__control {
      border-color: var(--brand-primary) !important;
      box-shadow: 0 0 0 2px ${hexToRgba(brandColors.primary, 0.2)} !important;
    }
    
    .q-checkbox__inner--active {
      color: var(--brand-primary) !important;
    }
    
    .q-radio__inner--active {
      color: var(--brand-primary) !important;
    }
    
    .q-toggle__inner--active {
      color: var(--brand-primary) !important;
    }
    
    .q-slider__track-container--active {
      background: var(--brand-primary) !important;
    }
    
    .q-linear-progress__track {
      background: var(--brand-primary) !important;
    }
    
    .q-circular-progress {
      color: var(--brand-primary) !important;
    }
    
    /* Custom branding classes */
    .brand-bg-primary {
      background: var(--brand-primary) !important;
    }
    
    .brand-bg-secondary {
      background: var(--brand-secondary) !important;
    }
    
    .brand-bg-gradient {
      background: var(--brand-gradient-primary) !important;
    }
    
    .brand-text-primary {
      color: var(--brand-primary) !important;
    }
    
    .brand-text-secondary {
      color: var(--brand-secondary) !important;
    }
    
    .brand-border-primary {
      border-color: var(--brand-primary) !important;
    }
    
    .brand-shadow-primary {
      box-shadow: 0 4px 12px var(--brand-shadow-primary) !important;
    }
    
    /* Logo integration */
    .brand-logo {
      background-image: var(--brand-logo-url);
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    /* Enhanced card styling with brand colors */
    .q-card.brand-card {
      border-top: 3px solid var(--brand-primary);
      transition: all 0.3s ease;
    }
    
    .q-card.brand-card:hover {
      box-shadow: 0 8px 24px var(--brand-shadow-primary);
      transform: translateY(-2px);
    }
    
    /* Enhanced button styling */
    .q-btn.brand-btn-primary {
      background: var(--brand-gradient-primary);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }
    
    .q-btn.brand-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--brand-shadow-primary);
    }
    
    .q-btn.brand-btn-secondary {
      background: var(--brand-gradient-secondary);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }
    
    .q-btn.brand-btn-secondary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--brand-shadow-secondary);
    }
    
    /* Enhanced form styling */
    .q-field.brand-field .q-field__control {
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    
    .q-field.brand-field .q-field__control:hover {
      border-color: ${hexToRgba(brandColors.primary, 0.5)};
    }
    
    .q-field.brand-field.q-field--focused .q-field__control {
      border-color: var(--brand-primary);
      background: white;
      transform: scale(1.02);
    }
    
    /* Enhanced navigation styling */
    .q-toolbar.brand-toolbar {
      background: var(--brand-gradient-primary);
      box-shadow: 0 2px 8px var(--brand-shadow-primary);
    }
    
    .q-drawer.brand-drawer {
      border-right: 3px solid var(--brand-primary);
    }
    
    .q-drawer.brand-drawer .q-item--active {
      background: ${hexToRgba(brandColors.primary, 0.1)};
      border-left: 4px solid var(--brand-primary);
      color: var(--brand-primary);
    }
    
    /* Enhanced table styling */
    .q-table.brand-table .q-th {
      background: ${hexToRgba(brandColors.primary, 0.1)};
      color: var(--brand-primary);
      font-weight: 600;
    }
    
    .q-table.brand-table .q-tr:hover {
      background: ${hexToRgba(brandColors.primary, 0.05)};
    }
    
    /* Enhanced dialog styling */
    .q-dialog .q-card.brand-dialog {
      border-top: 4px solid var(--brand-primary);
    }
    
    /* Enhanced notification styling */
    .q-notification.brand-notification {
      background: var(--brand-gradient-primary);
      color: white;
    }
    
    /* Mobile-specific branding */
    @media (max-width: 768px) {
      .q-header.brand-header {
        background: var(--brand-primary);
      }
      
      .q-btn.brand-btn-mobile {
        min-height: 44px;
        border-radius: 12px;
        background: var(--brand-gradient-primary);
      }
      
      .q-card.brand-card-mobile {
        border-radius: 16px;
        border-top: 3px solid var(--brand-primary);
      }
    }
  `
})

// Helper functions for color manipulation
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(0, 0, 0, ${alpha})`
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lightenColor(hex, percent) {
  if (!hex) return '#ffffff'
  
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

function darkenColor(hex, percent) {
  if (!hex) return '#000000'
  
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1)
}
</script>