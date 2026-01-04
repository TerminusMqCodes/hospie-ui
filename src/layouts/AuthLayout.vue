<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="window-height window-width row justify-center items-center auth-container">
        <div class="column q-pa-lg auth-wrapper">
          <div class="row">
            <q-card square bordered class="q-pa-lg shadow-1 auth-card">
              <q-card-section class="text-center q-pb-lg">
                <div class="text-h4 text-grey-9 auth-title">Hospie PMS</div>
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
.auth-container {
  padding: 16px;
}

.auth-wrapper {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 2rem;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .auth-container {
    padding: 8px;
  }
  
  .auth-card {
    padding: 16px !important;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .q-card-section {
    padding: 16px !important;
  }
}

@media (max-width: 400px) {
  .auth-card {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .auth-container {
    padding: 0;
  }
}
</style>