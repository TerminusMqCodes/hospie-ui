<template>
  <div class="contact-section">
    <div class="row q-gutter-lg">
      <!-- Contact Information -->
      <div class="col-md-6 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.contactInformation') }}</div>
            
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="mdi-email" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('support.email') }}</q-item-label>
                  <q-item-label caption>support@hospie.com</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="mdi-content-copy"
                    flat
                    round
                    @click="copyToClipboard('support@hospie.com')"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

export default {
  name: 'ContactSection',
  
  emits: ['start-chat'],

  setup() {
    const { t } = useI18n()
    const $q = useQuasar()

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        $q.notify({
          type: 'positive',
          message: t('support.copiedToClipboard'),
          position: 'top-right'
        })
      }).catch(() => {
        $q.notify({
          type: 'negative',
          message: t('support.copyFailed'),
          position: 'top-right'
        })
      })
    }

    return {
      copyToClipboard
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-section {
  .liquid-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>
