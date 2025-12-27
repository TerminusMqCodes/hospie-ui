<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="window-height window-width row justify-center items-center">
        <div class="column q-pa-lg">
          <div class="row">
            <q-card square bordered class="q-pa-lg shadow-1">
              <q-card-section class="text-center q-pb-lg">
                <div class="text-h4 text-grey-9">Hospie PMS</div>
                <div class="text-caption text-grey-7">Property Management System</div>
              </q-card-section>
              
              <router-view />
            </q-card>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Authentication layout for login, register, forgot password pages
</script>

<style scoped>
.q-card {
  width: 400px;
  max-width: 90vw;
}
</style>