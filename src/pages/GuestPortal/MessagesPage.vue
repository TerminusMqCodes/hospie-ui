<template>
  <q-page class="q-pa-md" :class="{ 'bg-grey-9': $q.dark.isActive, 'bg-grey-1': !$q.dark.isActive }">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h5 q-mb-md">
                  <q-icon name="message" class="q-mr-sm" />
                  Messages
                </div>
                <div class="text-subtitle2" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
                  Communicate with hotel staff
                </div>
              </div>
              <div class="col-auto">
                <q-btn 
                  color="primary" 
                  label="New Message" 
                  icon="add"
                  @click="showNewMessage = true"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Messages List -->
      <div class="col-12">
        <q-card :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
          <q-card-section v-if="loading" class="text-center">
            <q-spinner-dots size="50px" color="primary" />
            <div class="q-mt-md">Loading messages...</div>
          </q-card-section>

          <q-card-section v-else-if="messages.length === 0" class="text-center">
            <q-icon name="message" size="64px" :color="$q.dark.isActive ? 'grey-5' : 'grey-5'" />
            <div class="text-h6 q-mt-md" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">No messages yet</div>
            <div class="text-body2" :class="{ 'text-grey-5': $q.dark.isActive, 'text-grey-5': !$q.dark.isActive }">
              Start a conversation with our hotel staff
            </div>
            <q-btn 
              color="primary" 
              label="Send First Message" 
              icon="add"
              @click="showNewMessage = true"
              class="q-mt-md"
            />
          </q-card-section>

          <q-list v-else separator>
            <q-item
              v-for="message in messages"
              :key="message.id"
              class="q-pa-md"
              :class="{ 'bg-grey-7': $q.dark.isActive && message.id % 2 === 0 }"
            >
              <q-item-section>
                <q-item-label class="text-h6">
                  {{ message.subject }}
                  <q-chip 
                    :color="getPriorityColor(message.priority)" 
                    text-color="white" 
                    size="sm" 
                    class="q-ml-sm"
                    v-if="message.priority !== 'normal'"
                  >
                    {{ message.priority }}
                  </q-chip>
                </q-item-label>
                
                <q-item-label caption class="q-mt-sm">
                  {{ message.message }}
                </q-item-label>
                
                <q-item-label caption class="q-mt-sm" :class="{ 'text-grey-4': $q.dark.isActive, 'text-grey-6': !$q.dark.isActive }">
                  <q-icon name="schedule" size="sm" class="q-mr-xs" />
                  {{ formatDate(message.created_at) }}
                  
                  <span v-if="message.reservation" class="q-ml-md">
                    <q-icon name="event" size="sm" class="q-mr-xs" />
                    Reservation #{{ message.reservation.reservation_number }}
                  </span>
                  
                  <q-chip 
                    :color="getStatusColor(message.status)" 
                    text-color="white" 
                    size="xs" 
                    class="q-ml-sm"
                  >
                    {{ getStatusLabel(message.status) }}
                  </q-chip>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon 
                  :name="getMessageTypeIcon(message.message_type)" 
                  size="md" 
                  :color="getMessageTypeColor(message.message_type)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- New Message Dialog -->
    <q-dialog v-model="showNewMessage" persistent>
      <q-card style="min-width: 400px; max-width: 600px" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="message" class="q-mr-sm" />
            Send Message
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="sendMessage" class="q-gutter-md">
            <q-select
              v-model="messageForm.reservation_id"
              :options="reservationOptions"
              label="Related Reservation (Optional)"
              outlined
              emit-value
              map-options
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-select>

            <q-input
              v-model="messageForm.subject"
              label="Subject"
              outlined
              :rules="[val => !!val || 'Subject is required']"
              maxlength="255"
              counter
            >
              <template v-slot:prepend>
                <q-icon name="title" />
              </template>
            </q-input>

            <q-input
              v-model="messageForm.message"
              label="Message"
              type="textarea"
              outlined
              rows="6"
              :rules="[val => !!val || 'Message is required']"
              maxlength="2000"
              counter
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            flat 
            label="Cancel" 
            color="grey" 
            @click="closeNewMessage"
            :disable="sending"
          />
          <q-btn 
            label="Send Message" 
            color="primary" 
            @click="sendMessage"
            :loading="sending"
            :disable="!isMessageFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGuestPortalStore } from 'src/stores/guestPortal'

const $q = useQuasar()
const guestPortalStore = useGuestPortalStore()

const loading = ref(false)
const sending = ref(false)
const showNewMessage = ref(false)
const messages = ref([])
const reservations = ref([])

const messageForm = reactive({
  reservation_id: null,
  subject: '',
  message: ''
})

const reservationOptions = computed(() => {
  return reservations.value.map(r => ({
    label: `#${r.reservation_number} - ${formatDate(r.check_in_date)}`,
    value: r.id
  }))
})

const isMessageFormValid = computed(() => {
  return messageForm.subject.trim() && messageForm.message.trim()
})

onMounted(() => {
  loadMessages()
  loadReservations()
})

const loadMessages = async () => {
  loading.value = true
  
  try {
    const data = await guestPortalStore.loadMessages()
    messages.value = data
    
  } catch (error) {
    console.error('Failed to load messages:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Failed to load messages',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const loadReservations = async () => {
  try {
    const data = await guestPortalStore.loadReservations()
    reservations.value = data
    
  } catch (error) {
    console.error('Failed to load reservations:', error)
  }
}

const sendMessage = async () => {
  if (!isMessageFormValid.value) return

  sending.value = true

  try {
    await guestPortalStore.sendMessage(messageForm)

    $q.notify({
      type: 'positive',
      message: 'Message sent successfully',
      position: 'top'
    })

    closeNewMessage()
    await loadMessages() // Reload messages

  } catch (error) {
    console.error('Send message error:', error)
    
    const message = error.response?.data?.message || 'Failed to send message'
    
    $q.notify({
      type: 'negative',
      message,
      position: 'top'
    })
  } finally {
    sending.value = false
  }
}

const closeNewMessage = () => {
  showNewMessage.value = false
  messageForm.reservation_id = null
  messageForm.subject = ''
  messageForm.message = ''
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'green',
    'normal': 'blue',
    'high': 'orange',
    'urgent': 'red'
  }
  return colors[priority] || 'blue'
}

const getStatusColor = (status) => {
  const colors = {
    'new': 'blue',
    'assigned': 'orange',
    'in_progress': 'purple',
    'resolved': 'green',
    'closed': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed'
  }
  return labels[status] || status
}

const getMessageTypeIcon = (type) => {
  const icons = {
    'inquiry': 'help',
    'complaint': 'report_problem',
    'request': 'room_service',
    'feedback': 'feedback',
    'service_request': 'build'
  }
  return icons[type] || 'message'
}

const getMessageTypeColor = (type) => {
  const colors = {
    'inquiry': 'blue',
    'complaint': 'red',
    'request': 'orange',
    'feedback': 'green',
    'service_request': 'purple'
  }
  return colors[type] || 'grey'
}
</script>