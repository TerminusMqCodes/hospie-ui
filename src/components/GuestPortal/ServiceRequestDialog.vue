<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="room_service" class="q-mr-sm" />
          Service Request
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-select
            v-model="form.service_type"
            :options="serviceTypeOptions"
            label="Service Type"
            outlined
            emit-value
            map-options
            :rules="[val => !!val || 'Please select a service type']"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <q-select
            v-model="form.priority"
            :options="priorityOptions"
            label="Priority"
            outlined
            emit-value
            map-options
            :rules="[val => !!val || 'Please select priority level']"
          >
            <template v-slot:prepend>
              <q-icon name="priority_high" />
            </template>
          </q-select>

          <q-input
            v-model="form.title"
            label="Request Title"
            outlined
            :rules="[val => !!val || 'Title is required']"
            maxlength="255"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="title" />
            </template>
          </q-input>

          <q-input
            v-model="form.description"
            label="Description"
            type="textarea"
            outlined
            rows="4"
            :rules="[val => !!val || 'Description is required']"
            maxlength="1000"
            counter
            hint="Please provide detailed information about your request"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <div class="text-caption text-grey-6" v-if="reservation">
            <q-icon name="info" size="sm" class="q-mr-xs" />
            This request will be associated with your current reservation 
            (Room {{ reservation.room?.room_number || 'TBA' }})
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          flat 
          label="Cancel" 
          color="grey" 
          @click="closeDialog"
          :disable="loading"
        />
        <q-btn 
          label="Submit Request" 
          color="primary" 
          @click="onSubmit"
          :loading="loading"
          :disable="!isFormValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reservation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  service_type: '',
  priority: 'medium',
  title: '',
  description: ''
})

const serviceTypeOptions = [
  { label: 'Housekeeping', value: 'housekeeping', icon: 'cleaning_services' },
  { label: 'Maintenance', value: 'maintenance', icon: 'build' },
  { label: 'Concierge', value: 'concierge', icon: 'concierge_services' },
  { label: 'Room Service', value: 'room_service', icon: 'room_service' },
  { label: 'Other', value: 'other', icon: 'help' }
]

const priorityOptions = [
  { label: 'Low', value: 'low', color: 'green' },
  { label: 'Medium', value: 'medium', color: 'orange' },
  { label: 'High', value: 'high', color: 'red' },
  { label: 'Urgent', value: 'urgent', color: 'red-10' }
]

const isFormValid = computed(() => {
  return form.service_type && 
         form.priority && 
         form.title.trim() && 
         form.description.trim()
})

// Reset form when dialog opens
watch(showDialog, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

const resetForm = () => {
  form.service_type = ''
  form.priority = 'medium'
  form.title = ''
  form.description = ''
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const onSubmit = async () => {
  if (!isFormValid.value || !props.reservation) return

  loading.value = true

  try {
    const requestData = {
      reservation_id: props.reservation.id,
      service_type: form.service_type,
      priority: form.priority,
      title: form.title,
      description: form.description
    }

    await guestPortalStore.submitServiceRequest(requestData)

    $q.notify({
      type: 'positive',
      message: 'Service request submitted successfully',
      position: 'top'
    })

    emit('submitted')
    closeDialog()

  } catch (error) {
    console.error('Service request error:', error)
    
    const message = error.response?.data?.message || 'Failed to submit service request'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>