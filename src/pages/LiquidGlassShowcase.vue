<template>
  <q-page class="liquid-glass-showcase">
    <!-- Animált háttér -->
    <div class="animated-background"></div>

    <div class="q-pa-lg">
      <div class="row q-col-gutter-lg">
        
        <!-- Fejléc -->
        <div class="col-12">
          <div class="glass-card text-center">
            <h1 class="text-h3 text-white q-mb-sm">Liquid Glass UI</h1>
            <p class="text-subtitle1 glass-text-muted">
              iOS stílusú glassmorphism Quasar-ban
            </p>
          </div>
        </div>

        <!-- Kártyák különböző intenzitással -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="liquid-glass-light liquid-glass-rounded liquid-glass-animated liquid-glass-hover q-pa-md">
            <q-icon name="wb_sunny" size="48px" class="text-white q-mb-sm" />
            <div class="text-h6 text-white">Light</div>
            <div class="glass-text-muted">Könnyű elmosódás</div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="liquid-glass-medium liquid-glass-rounded liquid-glass-animated liquid-glass-hover q-pa-md">
            <q-icon name="filter_drama" size="48px" class="text-white q-mb-sm" />
            <div class="text-h6 text-white">Medium</div>
            <div class="glass-text-muted">Közepes elmosódás</div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="liquid-glass-heavy liquid-glass-rounded liquid-glass-animated liquid-glass-hover q-pa-md">
            <q-icon name="nights_stay" size="48px" class="text-white q-mb-sm" />
            <div class="text-h6 text-white">Heavy</div>
            <div class="glass-text-muted">Erős elmosódás</div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="liquid-glass-dark liquid-glass-rounded liquid-glass-animated liquid-glass-hover q-pa-md">
            <q-icon name="dark_mode" size="48px" class="text-white q-mb-sm" />
            <div class="text-h6 text-white">Dark</div>
            <div class="glass-text-muted">Sötét változat</div>
          </div>
        </div>

        <!-- Interaktív elemek -->
        <div class="col-12 col-md-6">
          <div class="glass-card">
            <h5 class="text-h5 text-white q-mb-md">Űrlap elemek</h5>
            
            <q-input
              dark
              outlined
              v-model="name"
              label="Név"
              class="q-mb-md glass-input-field"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              dark
              outlined
              v-model="email"
              type="email"
              label="Email"
              class="q-mb-md glass-input-field"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-btn
              unelevated
              class="glass-button full-width"
              label="Küldés"
              icon-right="send"
            />
          </div>
        </div>

        <!-- Lista glass hatással -->
        <div class="col-12 col-md-6">
          <div class="glass-card">
            <h5 class="text-h5 text-white q-mb-md">Értesítések</h5>
            
            <q-list dark>
              <q-item
                v-for="notification in notifications"
                :key="notification.id"
                class="liquid-glass-light liquid-glass-rounded q-mb-sm"
                clickable
              >
                <q-item-section avatar>
                  <q-avatar :color="notification.color" text-color="white">
                    <q-icon :name="notification.icon" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-white">{{ notification.title }}</q-item-label>
                  <q-item-label caption class="glass-text-muted">
                    {{ notification.time }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Statisztikák -->
        <div class="col-12">
          <div class="row q-col-gutter-md">
            <div class="col-6 col-sm-3" v-for="stat in stats" :key="stat.label">
              <div class="liquid-glass liquid-glass-rounded liquid-glass-animated liquid-glass-hover q-pa-md text-center">
                <div class="text-h4 text-white">{{ stat.value }}</div>
                <div class="glass-text-muted">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal példa -->
        <div class="col-12">
          <div class="glass-card text-center">
            <q-btn
              unelevated
              class="glass-button"
              label="Glass Modal megnyitása"
              icon="open_in_new"
              @click="showModal = true"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- Glass Modal -->
    <q-dialog 
      v-model="showModal"
      transition-show="scale"
      transition-hide="scale"
      class="glass-dialog-backdrop"
    >
      <q-card class="glass-modal" style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6 text-white">Glass Modal</div>
        </q-card-section>

        <q-card-section class="glass-text-white">
          Ez egy glassmorphism stílusú modal ablak.
          Az elmosódott háttér és az áttetsző felület
          modern, iOS-szerű megjelenést biztosít.
          
          <div class="q-mt-md q-pa-md liquid-glass-light liquid-glass-rounded">
            <strong>Új funkció:</strong> A modal most sötétített, 
            elmosódott backdrop-pal rendelkezik, ami jobban kiemeli 
            a tartalmat a háttérből!
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat class="glass-button" label="Bezárás" v-close-popup />
          <q-btn unelevated class="glass-button" label="Mentés" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const showModal = ref(false)

const notifications = [
  { id: 1, title: 'Új foglalás', time: '5 perce', icon: 'event', color: 'primary' },
  { id: 2, title: 'Fizetés beérkezett', time: '10 perce', icon: 'payment', color: 'positive' },
  { id: 3, title: 'Vendég üzenet', time: '1 órája', icon: 'message', color: 'info' }
]

const stats = [
  { value: '156', label: 'Foglalások' },
  { value: '89%', label: 'Kihasználtság' },
  { value: '4.8', label: 'Értékelés' },
  { value: '€12.5k', label: 'Bevétel' }
]
</script>

<style scoped lang="scss">
.liquid-glass-showcase {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.animated-background {
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
  animation: gradientFlow 20s ease infinite;
  z-index: -1;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.glass-input-field {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
  }

  :deep(.q-field__native),
  :deep(.q-field__label) {
    color: white;
  }

  :deep(.q-field__control):before {
    border-color: rgba(255, 255, 255, 0.3);
  }

  :deep(.q-field__control):hover:before {
    border-color: rgba(255, 255, 255, 0.5);
  }
}
</style>
