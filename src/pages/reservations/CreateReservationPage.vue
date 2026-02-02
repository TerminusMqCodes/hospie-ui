<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t('pages.reservations.create.title') }}</div>
            <div class="text-subtitle2">{{ $t('pages.reservations.create.guestInformation') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-body1 text-grey-6">
              Reservation creation functionality will be implemented in the next development phase.
            </div>
            <div class="q-mt-md">
              <q-btn 
                color="primary" 
                icon="arrow_back" 
                :label="`${$t('actions.back')} ${$t('pages.reservations.title')}`" 
                @click="$router.push('/reservations')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()
</script>