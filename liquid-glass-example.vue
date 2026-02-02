<template>
  <q-page class="liquid-glass-demo">
    <!-- Háttér gradiens -->
    <div class="background-gradient"></div>

    <!-- Liquid Glass Card példák -->
    <div class="q-pa-md row justify-center items-center" style="min-height: 100vh;">
      <div class="col-12 col-md-10 col-lg-8">
        
        <!-- Fő Glass Card -->
        <q-card class="liquid-glass-card q-mb-md">
          <q-card-section>
            <div class="text-h5 text-white">Liquid Glass Hatás</div>
            <div class="text-subtitle2 text-white-7">iOS stílusú glassmorphism</div>
          </q-card-section>
          
          <q-card-section>
            <p class="text-white-9">
              Ez egy áttetsző, elmosódott háttérrel rendelkező kártya,
              amely az iOS Liquid glass dizájnját utánozza.
            </p>
          </q-card-section>

          <q-card-actions>
            <q-btn flat class="glass-btn" label="Művelet" />
            <q-btn flat class="glass-btn" label="Részletek" />
          </q-card-actions>
        </q-card>

        <!-- Kisebb Glass Cards grid-ben -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4" v-for="i in 3" :key="i">
            <q-card class="liquid-glass-card-small">
              <q-card-section>
                <q-icon name="star" size="32px" class="text-white" />
                <div class="text-h6 text-white q-mt-sm">Funkció {{ i }}</div>
                <div class="text-white-7">Leírás itt</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Glass Input példa -->
        <q-card class="liquid-glass-card q-mt-md">
          <q-card-section>
            <q-input
              dark
              outlined
              v-model="text"
              label="Glass Input"
              class="glass-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
</script>

<style scoped lang="scss">
.liquid-glass-demo {
  position: relative;
  overflow: hidden;
}

/* Animált háttér gradiens */
.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: -1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Fő Liquid Glass Card stílus */
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 12px 40px 0 rgba(31, 38, 135, 0.45),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  }
}

/* Kisebb Glass Card */
.liquid-glass-card-small {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.12) !important;
  }
}

/* Glass Button */
.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

/* Glass Input */
.glass-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border-color: rgba(255, 255, 255, 0.3);
  }

  :deep(.q-field__native),
  :deep(.q-field__label) {
    color: white;
  }
}

/* Szöveg színek */
.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.text-white-9 {
  color: rgba(255, 255, 255, 0.9);
}
</style>
