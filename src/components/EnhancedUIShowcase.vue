<template>
  <q-page class="enhanced-ui-showcase q-pa-md">
    <div class="showcase-container">
      <!-- Header -->
      <div class="showcase-header q-mb-xl">
        <h1 class="text-gradient showcase-title">Enhanced UI/UX Showcase</h1>
        <p class="showcase-subtitle">Demonstrating the improved design system with modern micro-interactions</p>
      </div>

      <!-- Enhanced Buttons Section -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Buttons</h2>
        <div class="row q-gutter-md">
          <q-btn color="primary" label="Primary Button" class="btn-gradient" />
          <q-btn color="secondary" label="Glass Button" class="btn-glass" />
          <q-btn color="accent" label="Soft Button" class="btn-soft" />
          <q-btn color="positive" label="Large Button" class="btn-lg" />
          <q-btn color="warning" label="Small Button" class="btn-sm" />
        </div>
      </section>

      <!-- Enhanced Cards Section -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Cards</h2>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-card class="card-interactive card-glass">
              <q-card-section>
                <div class="text-h6">Interactive Glass Card</div>
                <div class="text-subtitle2">Hover to see the effect</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="card-interactive card-gradient">
              <q-card-section>
                <div class="text-h6">Gradient Card</div>
                <div class="text-subtitle2">With smooth animations</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="card-interactive card-elevated">
              <q-card-section>
                <div class="text-h6">Elevated Card</div>
                <div class="text-subtitle2">Enhanced shadows</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </section>

      <!-- Enhanced Form Elements -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Form Elements</h2>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input 
              v-model="sampleText" 
              label="Standard Input" 
              outlined 
              class="q-mb-md"
            />
            <q-input 
              v-model="sampleText2" 
              label="Floating Input" 
              outlined 
              class="field-floating q-mb-md"
            />
            <q-input 
              v-model="sampleText3" 
              label="Minimal Input" 
              class="field-minimal"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedOption"
              :options="options"
              label="Enhanced Select"
              outlined
              class="q-mb-md"
            />
            <q-slider
              v-model="sliderValue"
              :min="0"
              :max="100"
              label
              class="q-mb-md"
            />
          </div>
        </div>
      </section>

      <!-- Enhanced Badges and Chips -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Badges & Chips</h2>
        <div class="row q-gutter-md items-center">
          <q-badge color="primary" label="Standard Badge" />
          <q-badge color="secondary" label="Pulse Badge" class="badge-pulse" />
          <q-badge color="positive" label="Dot Badge" class="badge-dot" />
          
          <q-chip color="primary" text-color="white" label="Standard Chip" />
          <q-chip color="secondary" text-color="white" label="Glass Chip" class="chip-glass" />
          <q-chip color="accent" text-color="white" label="Hover Chip" removable />
        </div>
      </section>

      <!-- Enhanced Loading States -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Loading States</h2>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <div class="loading-skeleton" style="height: 100px; margin-bottom: 16px;"></div>
            <div class="text-center">Skeleton Loading</div>
          </div>
          
          <div class="col-12 col-md-4">
            <div class="text-center">
              <q-spinner-dots size="40px" color="primary" class="loading-pulse" />
              <div class="q-mt-md">Pulse Loading</div>
            </div>
          </div>
          
          <div class="col-12 col-md-4">
            <div class="text-center">
              <q-spinner-ball size="40px" color="secondary" class="loading-bounce" />
              <div class="q-mt-md">Bounce Loading</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Enhanced Animations -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Animations</h2>
        <div class="row q-gutter-md">
          <q-btn 
            color="primary" 
            label="Fade In Up" 
            @click="triggerAnimation('fadeInUp')"
            class="animate-fade-in-up"
          />
          <q-btn 
            color="secondary" 
            label="Scale In" 
            @click="triggerAnimation('scaleIn')"
            class="animate-scale-in"
          />
          <q-btn 
            color="accent" 
            label="Slide In" 
            @click="triggerAnimation('slideInUp')"
            class="animate-slide-in-up"
          />
        </div>
        
        <div class="animation-demo-area q-mt-lg">
          <div 
            v-if="showAnimationDemo"
            :class="currentAnimation"
            class="animation-demo-box"
          >
            Animation Demo
          </div>
        </div>
      </section>

      <!-- Enhanced Utility Classes -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Enhanced Utility Classes</h2>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <div class="glass-effect q-pa-md rounded-lg text-center">
              Glass Effect
            </div>
          </div>
          
          <div class="col-12 col-md-3">
            <div class="gradient-bg q-pa-md rounded-lg text-center text-white">
              Gradient Background
            </div>
          </div>
          
          <div class="col-12 col-md-3">
            <div class="shadow-xl q-pa-md rounded-lg text-center bg-white">
              Enhanced Shadow
            </div>
          </div>
          
          <div class="col-12 col-md-3">
            <div class="hover-lift q-pa-md rounded-lg text-center bg-white border-primary">
              Hover Lift
            </div>
          </div>
        </div>
      </section>

      <!-- Enhanced Mobile Components -->
      <section class="showcase-section q-mb-xl">
        <h2 class="section-title">Mobile-Enhanced Components</h2>
        <div class="mobile-enhanced">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-card class="card-interactive">
                <q-card-section>
                  <div class="text-h6">Mobile-Optimized Card</div>
                  <div class="text-subtitle2">Touch-friendly interactions</div>
                </q-card-section>
                <q-card-actions>
                  <q-btn color="primary" label="Touch Me" />
                  <q-btn color="secondary" label="Or Me" outline />
                </q-card-actions>
              </q-card>
            </div>
            
            <div class="col-12 col-md-6">
              <q-list bordered class="rounded-lg">
                <q-item clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon name="star" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Enhanced List Item</q-item-label>
                    <q-item-label caption>With better touch targets</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon name="favorite" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Another Item</q-item-label>
                    <q-item-label caption>Smooth animations</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </section>

      <!-- Performance Note -->
      <section class="showcase-section">
        <q-card class="performance-note">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="speed" class="q-mr-sm" />
              Performance Optimizations
            </div>
            <ul class="performance-list">
              <li>Reduced motion support for accessibility</li>
              <li>Hardware-accelerated animations using transform and opacity</li>
              <li>Efficient CSS custom properties for theming</li>
              <li>Optimized hover states with will-change property</li>
              <li>Responsive design with mobile-first approach</li>
            </ul>
          </q-card-section>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// Reactive data
const sampleText = ref('')
const sampleText2 = ref('')
const sampleText3 = ref('')
const selectedOption = ref(null)
const sliderValue = ref(50)
const showAnimationDemo = ref(false)
const currentAnimation = ref('')

const options = [
  'Option 1',
  'Option 2', 
  'Option 3'
]

// Methods
const triggerAnimation = (animationType) => {
  showAnimationDemo.value = false
  currentAnimation.value = ''
  
  setTimeout(() => {
    currentAnimation.value = `animate-${animationType}`
    showAnimationDemo.value = true
  }, 100)
  
  setTimeout(() => {
    showAnimationDemo.value = false
  }, 2000)
}
</script>

<style scoped>
.enhanced-ui-showcase {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.showcase-container {
  max-width: 1200px;
  margin: 0 auto;
}

.showcase-header {
  text-align: center;
  padding: 40px 0;
}

.showcase-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--hospie-primary), var(--hospie-secondary), var(--hospie-accent));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
}

.showcase-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
}

.showcase-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--hospie-primary), var(--hospie-secondary));
    border-radius: 2px;
  }
}

.animation-demo-area {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
}

.animation-demo-box {
  background: linear-gradient(135deg, var(--hospie-primary), var(--hospie-secondary));
  color: white;
  padding: 20px 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.performance-note {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.performance-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    padding: 8px 0;
    position: relative;
    padding-left: 24px;
    color: #475569;
    font-weight: 500;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--hospie-positive);
      font-weight: 700;
    }
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .showcase-title {
    font-size: 2rem;
  }
  
  .showcase-subtitle {
    font-size: 1rem;
  }
  
  .showcase-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.4rem;
  }
}

/* Dark mode support */
.body--dark {
  .enhanced-ui-showcase {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .showcase-section {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .section-title {
    color: #f1f5f9;
  }
  
  .showcase-subtitle {
    color: #94a3b8;
  }
  
  .animation-demo-area {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .performance-note {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  .performance-list li {
    color: #cbd5e1;
  }
}
</style>