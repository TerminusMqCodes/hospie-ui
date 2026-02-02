<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">{{ t('navigation.housekeeping') }}</div>
    <div class="text-body1">
      {{ t('status.processing') }}...
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>