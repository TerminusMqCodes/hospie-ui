<template>
  <div class="fullscreen bg-accent text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        🚫
      </div>

      <div class="text-h2" style="opacity:.4">
        {{ $t('pages.unauthorized.title') }}
      </div>

      <div class="text-h5 q-mt-md">
        {{ message || $t('pages.unauthorized.message') }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/dashboard"
        :label="$t('pages.unauthorized.goToDashboard')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t: $t } = useI18n()

const message = computed(() => route.query.message)
</script>