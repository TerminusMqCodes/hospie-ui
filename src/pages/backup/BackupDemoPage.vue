<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">
              🚧 {{ $t('backup.title') }} - Demo Mode
            </div>
            <div class="text-body1 text-center q-mb-lg text-grey-6">
              {{ $t('backup.subtitle') }}
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-h6 q-mb-md">Demo Features:</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Backup Management Interface</q-item-label>
                  <q-item-label caption>Complete GUI for managing backups</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Create Backup Dialog</q-item-label>
                  <q-item-label caption>Full, incremental, and export backup types</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Schedule Management</q-item-label>
                  <q-item-label caption>Automated backup scheduling</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Restore Functionality</q-item-label>
                  <q-item-label caption>Point-in-time recovery options</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Multilingual Support</q-item-label>
                  <q-item-label caption>English and Hungarian translations</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator class="q-my-lg" />

            <div class="text-center">
              <q-btn
                color="primary"
                size="lg"
                icon="backup"
                :label="$t('backup.title')"
                @click="$router.push('/backup')"
              />
            </div>

            <div class="text-caption text-center q-mt-md text-grey-6">
              Note: This will redirect to the actual backup management page.<br>
              Backend API integration is required for full functionality.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// eslint-disable-next-line no-unused-vars
const { t } = useI18n()
</script>

<style scoped>
.liquid-glass-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
</style>