<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h4">Rate Management</div>
          <div class="text-subtitle2 text-grey-7">Manage room rates and pricing</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="Add Rate" @click="showAddDialog = true" />
        </div>
      </div>

      <!-- Filters -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-select
                v-model="filters.roomType"
                :options="roomTypes"
                label="Room Type"
                clearable
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.dateFrom"
                type="date"
                label="From Date"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.dateTo"
                type="date"
                label="To Date"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn color="primary" label="Search" @click="loadRates" class="full-width" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Rates Table -->
      <q-card flat bordered>
        <q-table
          :rows="rates"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="edit" color="primary" @click="editRate(props.row)" />
              <q-btn flat dense icon="delete" color="negative" @click="deleteRate(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Add/Edit Dialog -->
      <q-dialog v-model="showAddDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ editingRate ? 'Edit Rate' : 'Add Rate' }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="saveRate">
              <q-select
                v-model="rateForm.room_type_id"
                :options="roomTypes"
                label="Room Type"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model.number="rateForm.base_rate"
                type="number"
                label="Base Rate"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => val > 0 || 'Must be greater than 0']"
              />
              <q-input
                v-model="rateForm.valid_from"
                type="date"
                label="Valid From"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="rateForm.valid_to"
                type="date"
                label="Valid To"
                outlined
                dense
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showAddDialog = false" />
                <q-btn label="Save" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import rateService from 'src/services/rateService'

export default {
  name: 'RateManagementPage',
  setup() {
    const $q = useQuasar()
    const rates = ref([])
    const loading = ref(false)
    const showAddDialog = ref(false)
    const editingRate = ref(null)
    const roomTypes = ref([])

    const filters = ref({
      roomType: null,
      dateFrom: null,
      dateTo: null
    })

    const rateForm = ref({
      room_type_id: null,
      base_rate: 0,
      valid_from: null,
      valid_to: null
    })

    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    const columns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'room_type', label: 'Room Type', field: 'room_type', align: 'left' },
      { name: 'base_rate', label: 'Base Rate', field: 'base_rate', align: 'right', format: val => `$${val}` },
      { name: 'valid_from', label: 'Valid From', field: 'valid_from', align: 'left' },
      { name: 'valid_to', label: 'Valid To', field: 'valid_to', align: 'left' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const loadRates = async () => {
      loading.value = true
      try {
        const response = await rateService.getRates(filters.value)
        rates.value = response.data
        pagination.value.rowsNumber = response.total
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load rates' })
      } finally {
        loading.value = false
      }
    }

    const saveRate = async () => {
      try {
        if (editingRate.value) {
          await rateService.updateRate(editingRate.value.id, rateForm.value)
          $q.notify({ type: 'positive', message: 'Rate updated successfully' })
        } else {
          await rateService.createRate(rateForm.value)
          $q.notify({ type: 'positive', message: 'Rate created successfully' })
        }
        showAddDialog.value = false
        loadRates()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to save rate' })
      }
    }

    const editRate = (rate) => {
      editingRate.value = rate
      rateForm.value = { ...rate }
      showAddDialog.value = true
    }

    const deleteRate = async (id) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this rate?',
        cancel: true
      }).onOk(async () => {
        try {
          await rateService.deleteRate(id)
          $q.notify({ type: 'positive', message: 'Rate deleted successfully' })
          loadRates()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to delete rate' })
        }
      })
    }

    const onRequest = (props) => {
      pagination.value = props.pagination
      loadRates()
    }

    onMounted(() => {
      loadRates()
    })

    return {
      rates,
      loading,
      showAddDialog,
      editingRate,
      roomTypes,
      filters,
      rateForm,
      pagination,
      columns,
      loadRates,
      saveRate,
      editRate,
      deleteRate,
      onRequest
    }
  }
}
</script>
