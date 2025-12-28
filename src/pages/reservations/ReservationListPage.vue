<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Reservations</div>
                <div class="text-subtitle2">Manage hotel reservations</div>
              </div>
              <q-btn 
                color="primary" 
                icon="add" 
                label="New Reservation" 
                @click="$router.push('/reservations/create')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Reservation List</div>
            <div class="text-body1 text-grey-6">
              Reservation management functionality will be implemented in the next development phase.
            </div>
            <div class="q-mt-md">
              <q-btn 
                color="info" 
                icon="info" 
                label="Coming Soon" 
                disable
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Placeholder component for reservation list
</script>