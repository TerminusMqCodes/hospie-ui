<template>
  <q-card class="appointment-dialog" style="min-width: 600px; max-width: 90vw;">
    <q-card-section class="dialog-header">
      <div class="text-h6">{{ isEditing ? 'Edit Appointment' : 'New Appointment' }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="handleSubmit" class="q-gutter-md">
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.service_id"
              :options="serviceOptions"
              option-label="name"
              option-value="id"
              label="Service *"
              emit-value
              map-options
              :rules="[val => !!val || 'Service is required']"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.therapist_id"
              :options="therapistOptions"
              option-label="name"
              option-value="id"
              label="Therapist"
              emit-value
              map-options
              clearable
            />
          </div>
        </div>
        
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.appointment_date"
              type="date"
              label="Date *"
              :rules="[val => !!val || 'Date is required']"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.appointment_time"
              type="time"
              label="Time *"
              :rules="[val => !!val || 'Time is required']"
            />
          </div>
        </div>
        
        <q-input
          v-model="form.notes"
          type="textarea"
          label="Notes"
          rows="3"
        />
      </q-form>
    </q-card-section>
    
    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="$emit('close')" />
      <q-btn 
        color="primary" 
        :label="isEditing ? 'Update' : 'Create'"
        @click="handleSubmit"
        :loading="loading"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  appointment: {
    type: Object,
    default: null
  },
  services: {
    type: Array,
    default: () => []
  },
  therapists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const form = ref({
  service_id: null,
  therapist_id: null,
  appointment_date: '',
  appointment_time: '',
  notes: ''
})

const isEditing = computed(() => !!props.appointment)

const serviceOptions = computed(() => props.services)
const therapistOptions = computed(() => props.therapists)

watch(() => props.appointment, (newAppointment) => {
  if (newAppointment) {
    form.value = { ...newAppointment }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    service_id: null,
    therapist_id: null,
    appointment_date: '',
    appointment_time: '',
    notes: ''
  }
}

async function handleSubmit() {
  loading.value = true
  
  try {
    emit('save', { ...form.value })
  } finally {
    loading.value = false
  }
}
</script>