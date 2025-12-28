<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Admin Dashboard</div>
            <div class="text-subtitle2">System administration and management</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Stats -->
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ totalUsers }}</div>
            <div class="text-subtitle2">Total Users</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ totalRoles }}</div>
            <div class="text-subtitle2">Total Roles</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ totalPermissions }}</div>
            <div class="text-subtitle2">Total Permissions</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Active</div>
            <div class="text-subtitle2">System Status</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Admin Actions -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="row q-gutter-md">
              <q-btn 
                color="primary" 
                icon="people" 
                label="Manage Users" 
                @click="$router.push('/admin/users')"
              />
              <q-btn 
                color="secondary" 
                icon="admin_panel_settings" 
                label="Manage Roles" 
                @click="$router.push('/admin/roles')"
              />
              <q-btn 
                color="info" 
                icon="settings" 
                label="System Settings" 
                @click="$router.push('/admin/settings')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

const totalUsers = ref(0)
const totalRoles = ref(0)
const totalPermissions = ref(0)

onMounted(async () => {
  try {
    // Load basic stats
    const roles = await authStore.getRoles()
    const permissions = await authStore.getPermissions()
    
    totalRoles.value = roles.length
    totalPermissions.value = permissions.length
    
    // TODO: Add API call to get user count
    totalUsers.value = 15 // Placeholder
  } catch (error) {
    console.error('Failed to load admin stats:', error)
  }
})
</script>