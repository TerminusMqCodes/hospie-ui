<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">User Management</div>
                <div class="text-subtitle2">Manage system users and their roles</div>
              </div>
              <q-btn 
                color="primary" 
                icon="person_add" 
                label="Add User" 
                @click="showCreateDialog = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Users List -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Users</div>
            <div class="text-body1 text-grey-6">
              User management functionality will be implemented in the next development phase.
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

    <!-- Placeholder Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add User</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body1">
            User creation functionality will be available in the next update.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showCreateDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const showCreateDialog = ref(false)
</script>