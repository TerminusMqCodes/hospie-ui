<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Role Management</div>
                <div class="text-subtitle2">Manage system roles and permissions</div>
              </div>
              <q-btn 
                color="primary" 
                icon="add" 
                label="Create Role" 
                @click="showCreateDialog = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Roles List -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <q-table
              :rows="roles"
              :columns="columns"
              row-key="id"
              :loading="loading"
              flat
              bordered
            >
              <template v-slot:body-cell-permissions="props">
                <q-td :props="props">
                  <q-chip 
                    v-for="permission in props.row.permissions.slice(0, 3)" 
                    :key="permission.name"
                    size="sm"
                    color="grey-3"
                    class="q-mr-xs"
                  >
                    {{ permission.name }}
                  </q-chip>
                  <q-chip 
                    v-if="props.row.permissions.length > 3"
                    size="sm"
                    color="grey-5"
                    class="q-mr-xs"
                  >
                    +{{ props.row.permissions.length - 3 }} more
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn 
                    flat 
                    round 
                    color="primary" 
                    icon="edit" 
                    size="sm"
                    @click="editRole(props.row)"
                  />
                  <q-btn 
                    flat 
                    round 
                    color="negative" 
                    icon="delete" 
                    size="sm"
                    @click="confirmDeleteRole(props.row)"
                    :disable="props.row.name === 'super-admin'"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create/Edit Role Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editingRole ? 'Edit Role' : 'Create Role' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="roleForm.name"
            label="Role Name"
            outlined
            :readonly="editingRole && editingRole.name === 'super-admin'"
          />

          <div class="text-subtitle2 q-mt-md q-mb-sm">Permissions</div>
          <div class="row q-gutter-sm">
            <q-checkbox
              v-for="permission in availablePermissions"
              :key="permission.name"
              v-model="roleForm.selectedPermissions"
              :val="permission.name"
              :label="permission.name"
              class="col-12 col-sm-6"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDialog" />
          <q-btn 
            color="primary" 
            :label="editingRole ? 'Update' : 'Create'" 
            @click="saveRole"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete the role "{{ roleToDelete?.name }}"?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeleteDialog = false" />
          <q-btn 
            color="negative" 
            label="Delete" 
            @click="deleteRole"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const roles = ref([])
const availablePermissions = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingRole = ref(null)
const roleToDelete = ref(null)

const roleForm = ref({
  name: '',
  selectedPermissions: []
})

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Role Name',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'permissions',
    label: 'Permissions',
    align: 'left',
    field: 'permissions'
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center'
  }
]

async function loadRoles() {
  loading.value = true
  try {
    roles.value = await authStore.getRoles()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load roles'
    })
  } finally {
    loading.value = false
  }
}

async function loadPermissions() {
  try {
    availablePermissions.value = await authStore.getPermissions()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load permissions'
    })
  }
}

function editRole(role) {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    selectedPermissions: role.permissions.map(p => p.name)
  }
  showCreateDialog.value = true
}

function confirmDeleteRole(role) {
  roleToDelete.value = role
  showDeleteDialog.value = true
}

async function saveRole() {
  saving.value = true
  try {
    const roleData = {
      name: roleForm.value.name,
      permissions: roleForm.value.selectedPermissions
    }

    if (editingRole.value) {
      await authStore.updateRole(editingRole.value.id, roleData)
      $q.notify({
        type: 'positive',
        message: 'Role updated successfully'
      })
    } else {
      await authStore.createRole(roleData)
      $q.notify({
        type: 'positive',
        message: 'Role created successfully'
      })
    }

    closeDialog()
    await loadRoles()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to save role'
    })
  } finally {
    saving.value = false
  }
}

async function deleteRole() {
  deleting.value = true
  try {
    await authStore.deleteRole(roleToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: 'Role deleted successfully'
    })
    showDeleteDialog.value = false
    await loadRoles()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to delete role'
    })
  } finally {
    deleting.value = false
  }
}

function closeDialog() {
  showCreateDialog.value = false
  editingRole.value = null
  roleForm.value = {
    name: '',
    selectedPermissions: []
  }
}

onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadPermissions()
  ])
})
</script>