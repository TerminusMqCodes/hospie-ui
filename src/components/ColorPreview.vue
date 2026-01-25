<template>
  <q-card flat bordered class="color-preview-card">
    <q-card-section>
      <div class="text-subtitle1 q-mb-md">Színek Előnézete</div>
      
      <!-- Color Swatches -->
      <div class="color-swatches q-mb-md">
        <div class="row q-gutter-sm">
          <div 
            v-for="(value, key) in colors" 
            :key="key"
            class="color-swatch"
            :style="{ backgroundColor: value }"
            :title="`${key}: ${value}`"
          >
            <div class="color-label">{{ getColorLabel(key) }}</div>
          </div>
        </div>
      </div>
      
      <!-- UI Preview -->
      <div class="ui-preview">
        <!-- Header Preview -->
        <div class="preview-header" :style="{ backgroundColor: colors.primary, color: 'white' }">
          <div class="preview-logo">
            <q-icon name="business" size="20px" />
          </div>
          <div class="preview-title">Hotel Dashboard</div>
          <div class="preview-actions">
            <q-btn 
              flat 
              round 
              icon="notifications" 
              size="sm" 
              :style="{ color: 'white' }"
            />
            <q-btn 
              flat 
              round 
              icon="account_circle" 
              size="sm" 
              :style="{ color: 'white' }"
            />
          </div>
        </div>
        
        <!-- Content Preview -->
        <div class="preview-content" :style="{ backgroundColor: colors.background }">
          <!-- Cards -->
          <div class="preview-cards">
            <div class="preview-card" :style="{ backgroundColor: colors.surface }">
              <div class="card-header" :style="{ color: colors.primary }">
                <q-icon name="hotel" />
                <span>Foglalások</span>
              </div>
              <div class="card-content">
                <div class="metric-value" :style="{ color: colors.primary }">24</div>
                <div class="metric-label">Mai érkezések</div>
              </div>
            </div>
            
            <div class="preview-card" :style="{ backgroundColor: colors.surface }">
              <div class="card-header" :style="{ color: colors.secondary }">
                <q-icon name="room_service" />
                <span>Szobák</span>
              </div>
              <div class="card-content">
                <div class="metric-value" :style="{ color: colors.secondary }">18</div>
                <div class="metric-label">Elérhető szobák</div>
              </div>
            </div>
          </div>
          
          <!-- Buttons Preview -->
          <div class="preview-buttons q-mt-md">
            <q-btn 
              :style="{ backgroundColor: colors.primary, color: 'white' }"
              label="Elsődleges"
              no-caps
            />
            <q-btn 
              :style="{ backgroundColor: colors.secondary, color: 'white' }"
              label="Másodlagos"
              no-caps
            />
            <q-btn 
              :style="{ backgroundColor: colors.success, color: 'white' }"
              label="Siker"
              no-caps
            />
            <q-btn 
              :style="{ backgroundColor: colors.warning, color: 'white' }"
              label="Figyelem"
              no-caps
            />
            <q-btn 
              :style="{ backgroundColor: colors.error, color: 'white' }"
              label="Hiba"
              no-caps
            />
          </div>
          
          <!-- Status Indicators -->
          <div class="preview-status q-mt-md">
            <div class="status-item">
              <q-chip 
                :style="{ backgroundColor: colors.success, color: 'white' }"
                icon="check_circle"
                label="Aktív"
              />
            </div>
            <div class="status-item">
              <q-chip 
                :style="{ backgroundColor: colors.warning, color: 'white' }"
                icon="warning"
                label="Várakozik"
              />
            </div>
            <div class="status-item">
              <q-chip 
                :style="{ backgroundColor: colors.error, color: 'white' }"
                icon="error"
                label="Hiba"
              />
            </div>
            <div class="status-item">
              <q-chip 
                :style="{ backgroundColor: colors.info, color: 'white' }"
                icon="info"
                label="Információ"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Color Harmony Analysis -->
      <div class="color-harmony q-mt-md">
        <div class="text-body2 q-mb-sm">Színharmónia Elemzés</div>
        <div class="harmony-indicators">
          <q-chip 
            :color="getContrastRating(colors.primary, '#ffffff') >= 4.5 ? 'positive' : 'negative'"
            text-color="white"
            size="sm"
            :icon="getContrastRating(colors.primary, '#ffffff') >= 4.5 ? 'check' : 'close'"
          >
            Kontrasztarány: {{ getContrastRating(colors.primary, '#ffffff').toFixed(1) }}:1
          </q-chip>
          
          <q-chip 
            :color="isColorBlindFriendly() ? 'positive' : 'warning'"
            text-color="white"
            size="sm"
            :icon="isColorBlindFriendly() ? 'visibility' : 'visibility_off'"
          >
            {{ isColorBlindFriendly() ? 'Színvak-barát' : 'Ellenőrizze a színvak-barátságot' }}
          </q-chip>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  colors: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// Color label mapping
const colorLabels = {
  primary: 'Elsődleges',
  secondary: 'Másodlagos',
  accent: 'Hangsúly',
  background: 'Háttér',
  surface: 'Felület',
  success: 'Siker',
  error: 'Hiba',
  warning: 'Figyelem',
  info: 'Információ'
}

const getColorLabel = (key) => {
  return colorLabels[key] || key
}

// Color utility functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const getLuminance = (hex) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const getContrastRatio = (color1, color2) => {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

const getContrastRating = (foreground, background) => {
  return getContrastRatio(foreground, background)
}

const isColorBlindFriendly = () => {
  // Simple check for color blind friendliness
  // This is a basic implementation - in reality, you'd want more sophisticated analysis
  const primary = hexToRgb(props.colors.primary)
  const secondary = hexToRgb(props.colors.secondary)
  
  if (!primary || !secondary) return false
  
  // Check if colors are distinguishable for common types of color blindness
  const redDiff = Math.abs(primary.r - secondary.r)
  const greenDiff = Math.abs(primary.g - secondary.g)
  const blueDiff = Math.abs(primary.b - secondary.b)
  
  // Simple heuristic: colors should have sufficient difference in multiple channels
  return (redDiff > 50 || greenDiff > 50 || blueDiff > 50)
}
</script>

<style lang="scss" scoped>
.color-preview-card {
  .color-swatches {
    .color-swatch {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;
      border: 2px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        transform: scale(1.05);
      }
      
      .color-label {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 4px;
        margin-bottom: 4px;
        text-align: center;
        min-width: 50px;
      }
    }
  }
  
  .ui-preview {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    
    .preview-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      
      .preview-logo {
        display: flex;
        align-items: center;
      }
      
      .preview-title {
        flex: 1;
        font-weight: 500;
      }
      
      .preview-actions {
        display: flex;
        gap: 4px;
      }
    }
    
    .preview-content {
      padding: 16px;
      
      .preview-cards {
        display: flex;
        gap: 12px;
        
        .preview-card {
          flex: 1;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          
          .card-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }
          
          .card-content {
            .metric-value {
              font-size: 24px;
              font-weight: bold;
              line-height: 1;
            }
            
            .metric-label {
              font-size: 12px;
              color: #666;
              margin-top: 2px;
            }
          }
        }
      }
      
      .preview-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        
        .q-btn {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
        }
      }
      
      .preview-status {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        
        .status-item {
          .q-chip {
            font-size: 11px;
          }
        }
      }
    }
  }
  
  .color-harmony {
    .harmony-indicators {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .q-chip {
        font-size: 11px;
      }
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .color-preview-card {
    .color-swatches {
      .row {
        justify-content: center;
      }
      
      .color-swatch {
        width: 50px;
        height: 50px;
        
        .color-label {
          font-size: 9px;
          min-width: 40px;
        }
      }
    }
    
    .ui-preview {
      .preview-content {
        .preview-cards {
          flex-direction: column;
        }
        
        .preview-buttons {
          .q-btn {
            flex: 1;
            min-width: 120px;
          }
        }
      }
    }
  }
}
</style>