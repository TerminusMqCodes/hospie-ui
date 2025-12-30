<template>
  <div class="mobile-test-component responsive-padding">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="responsive-title">Mobile Responsiveness Test</div>
        <div class="responsive-subtitle">Screen Size: {{ screenSize }}</div>
        <div class="text-caption">Breakpoint: {{ currentBreakpoint }}</div>
      </q-card-section>
    </q-card>

    <!-- Responsive Grid Test -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6">Responsive Card 1</div>
            <div class="text-body2">This card adapts to screen size</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6">Responsive Card 2</div>
            <div class="text-body2">Mobile-first design</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-h6">Responsive Card 3</div>
            <div class="text-body2">Touch-friendly interface</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Button Test -->
    <div class="row q-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6 col-md-auto">
        <q-btn 
          color="primary" 
          icon="smartphone" 
          :label="$q.screen.gt.xs ? 'Mobile Optimized' : ''"
          class="full-width-mobile"
        />
      </div>
      
      <div class="col-12 col-sm-6 col-md-auto">
        <q-btn 
          color="secondary" 
          icon="tablet" 
          :label="$q.screen.gt.xs ? 'Tablet Ready' : ''"
          class="full-width-mobile"
          outline
        />
      </div>
      
      <div class="col-12 col-sm-6 col-md-auto">
        <q-btn 
          color="accent" 
          icon="desktop_windows" 
          :label="$q.screen.gt.xs ? 'Desktop Compatible' : ''"
          class="full-width-mobile"
          outline
        />
      </div>
    </div>

    <!-- Visibility Test -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Responsive Visibility</div>
            
            <div class="show-on-mobile">
              <q-banner class="bg-positive text-white">
                <template v-slot:avatar>
                  <q-icon name="smartphone" />
                </template>
                This message only shows on mobile devices
              </q-banner>
            </div>
            
            <div class="hide-on-mobile">
              <q-banner class="bg-info text-white">
                <template v-slot:avatar>
                  <q-icon name="desktop_windows" />
                </template>
                This message is hidden on mobile devices
              </q-banner>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Form Test -->
    <div class="row q-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Responsive Form</div>
            
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="testForm.name"
                  label="Name"
                  outlined
                  dense
                />
              </div>
              
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="testForm.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                />
              </div>
              
              <div class="col-12">
                <q-select
                  v-model="testForm.category"
                  :options="categoryOptions"
                  label="Category"
                  outlined
                  dense
                />
              </div>
              
              <div class="col-12">
                <q-btn 
                  color="primary" 
                  label="Submit" 
                  class="full-width-mobile"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Screen Information</div>
            
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>Width</q-item-label>
                  <q-item-label caption>{{ $q.screen.width }}px</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Height</q-item-label>
                  <q-item-label caption>{{ $q.screen.height }}px</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Mobile</q-item-label>
                  <q-item-label caption>{{ $q.screen.lt.sm ? 'Yes' : 'No' }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Tablet</q-item-label>
                  <q-item-label caption>{{ $q.screen.gt.xs && $q.screen.lt.md ? 'Yes' : 'No' }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>Desktop</q-item-label>
                  <q-item-label caption>{{ $q.screen.gt.sm ? 'Yes' : 'No' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const testForm = ref({
  name: '',
  email: '',
  category: null
})

const categoryOptions = [
  'Mobile Development',
  'Web Development',
  'UI/UX Design',
  'Backend Development'
]

// Computed properties
const screenSize = computed(() => {
  return `${$q.screen.width} x ${$q.screen.height}`
})

const currentBreakpoint = computed(() => {
  if ($q.screen.xs) return 'Extra Small (xs)'
  if ($q.screen.sm) return 'Small (sm)'
  if ($q.screen.md) return 'Medium (md)'
  if ($q.screen.lg) return 'Large (lg)'
  if ($q.screen.xl) return 'Extra Large (xl)'
  return 'Unknown'
})
</script>

<style scoped>
.mobile-test-component {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  height: 120px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .stat-card {
    height: 100px;
  }
}
</style>