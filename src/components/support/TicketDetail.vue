<template>
  <div class="ticket-detail">
    <q-card v-if="ticket" class="liquid-glass-card">
      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="row items-center q-gutter-md">
          <div class="col">
            <div class="text-h6">
              {{ formatTicketNumber(ticket.ticket_number) }} - {{ ticket.title }}
            </div>
            <div class="text-caption text-grey-7">
              {{ $t('support.createdAt') }}: {{ formatDate(ticket.created_at) }}
            </div>
          </div>
          
          <div class="col-auto">
            <q-chip
              :color="getStatusColor(ticket.status)"
              text-color="white"
              :label="$t(`support.statuses.${ticket.status}`)"
            />
          </div>
          
          <div class="col-auto">
            <q-chip
              :color="getPriorityColor(ticket.priority)"
              text-color="white"
              :icon="getPriorityIcon(ticket.priority)"
              :label="$t(`support.priorities.${ticket.priority}`)"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Ticket Info -->
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-md-8 col-sm-12">
            <div class="text-subtitle2 q-mb-sm">{{ $t('support.description') }}</div>
            <div class="text-body2 q-mb-md" style="white-space: pre-wrap;">
              {{ ticket.description }}
            </div>
            
            <!-- Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length" class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">{{ $t('support.attachments') }}</div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-for="attachment in ticket.attachments"
                  :key="attachment.id"
                  :label="attachment.original_filename"
                  icon="mdi-attachment"
                  clickable
                  @click="downloadAttachment(attachment)"
                />
              </div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-12">
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('support.category') }}</q-item-label>
                  <q-item-label>{{ $t(`support.categories.${ticket.category}`) }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('support.source') }}</q-item-label>
                  <q-item-label>{{ $t(`support.sources.${ticket.source}`) }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-if="ticket.assigned_to_user">
                <q-item-section>
                  <q-item-label caption>{{ $t('support.assignedTo') }}</q-item-label>
                  <q-item-label>{{ ticket.assigned_to_user.name }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-if="ticket.sla_due_at">
                <q-item-section>
                  <q-item-label caption>{{ $t('support.slaDue') }}</q-item-label>
                  <q-item-label
                    :class="{
                      'text-red': isOverdue(ticket.sla_due_at),
                      'text-orange': isNearDue(ticket.sla_due_at)
                    }"
                  >
                    {{ formatDate(ticket.sla_due_at) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-if="ticket.resolved_at">
                <q-item-section>
                  <q-item-label caption>{{ $t('support.resolvedAt') }}</q-item-label>
                  <q-item-label>{{ formatDate(ticket.resolved_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          v-if="canUpdateStatus"
          :label="$t('support.updateStatus')"
          color="primary"
          outline
          @click="showStatusDialog = true"
        />
        <q-btn
          :label="$t('support.addMessage')"
          color="primary"
          @click="showMessageDialog = true"
        />
        <q-btn
          :label="$t('support.addAttachment')"
          color="secondary"
          outline
          @click="showAttachmentDialog = true"
        />
      </q-card-actions>
    </q-card>

    <!-- Messages -->
    <q-card v-if="ticket && ticket.messages" class="liquid-glass-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ $t('support.messages') }} ({{ ticket.messages.length }})
        </div>
        
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="message in ticket.messages"
            :key="message.id"
            :color="message.sender_type === 'agent' ? 'primary' : 'secondary'"
            :icon="message.sender_type === 'agent' ? 'mdi-account-tie' : 'mdi-account'"
          >
            <template v-slot:title>
              <div class="row items-center q-gutter-sm">
                <span class="text-weight-medium">
                  {{ message.sender_name || $t(`support.${message.sender_type}`) }}
                </span>
                <q-chip
                  v-if="message.is_internal"
                  :label="$t('support.internal')"
                  size="sm"
                  color="orange"
                  text-color="white"
                />
              </div>
            </template>
            
            <template v-slot:subtitle>
              {{ formatDate(message.created_at) }}
            </template>
            
            <div class="text-body2" style="white-space: pre-wrap;">
              {{ message.content }}
            </div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>

    <!-- Status Update Dialog -->
    <q-dialog v-model="showStatusDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('support.updateStatus') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newStatus"
            :options="statusOptions"
            :label="$t('support.newStatus')"
            outlined
            emit-value
            map-options
          />
          
          <q-input
            v-model="statusNote"
            :label="$t('support.statusNote')"
            type="textarea"
            rows="3"
            outlined
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" flat @click="showStatusDialog = false" />
          <q-btn
            :label="$t('common.update')"
            color="primary"
            @click="updateStatus"
            :loading="statusLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Message Dialog -->
    <q-dialog v-model="showMessageDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('support.addMessage') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newMessage"
            :label="$t('support.message')"
            type="textarea"
            rows="5"
            outlined
            autofocus
          />
          
          <q-checkbox
            v-model="isInternalMessage"
            :label="$t('support.internalMessage')"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" flat @click="showMessageDialog = false" />
          <q-btn
            :label="$t('support.addMessage')"
            color="primary"
            @click="addMessage"
            :loading="messageLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Attachment Dialog -->
    <q-dialog v-model="showAttachmentDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('support.addAttachment') }}</div>
        </q-card-section>

        <q-card-section>
          <q-file
            v-model="newAttachment"
            :label="$t('support.selectFile')"
            outlined
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
            max-file-size="10485760"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-attachment" />
            </template>
          </q-file>
          
          <q-input
            v-model="attachmentDescription"
            :label="$t('support.description')"
            outlined
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" flat @click="showAttachmentDialog = false" />
          <q-btn
            :label="$t('support.addAttachment')"
            color="primary"
            @click="addAttachment"
            :loading="attachmentLoading"
            :disable="!newAttachment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { useSupportStore } from 'src/stores/support'
import supportService from 'src/services/supportService'

export default {
  name: 'TicketDetail',
  
  props: {
    ticket: {
      type: Object,
      default: null
    }
  },

  emits: ['ticket-updated'],

  setup(props, { emit }) {
    const { t } = useI18n()
    const supportStore = useSupportStore()
    
    // Dialog states
    const showStatusDialog = ref(false)
    const showMessageDialog = ref(false)
    const showAttachmentDialog = ref(false)
    
    // Loading states
    const statusLoading = ref(false)
    const messageLoading = ref(false)
    const attachmentLoading = ref(false)
    
    // Form data
    const newStatus = ref('')
    const statusNote = ref('')
    const newMessage = ref('')
    const isInternalMessage = ref(false)
    const newAttachment = ref(null)
    const attachmentDescription = ref('')

    const statusOptions = computed(() => [
      { label: t('support.statuses.open'), value: 'open' },
      { label: t('support.statuses.in_progress'), value: 'in_progress' },
      { label: t('support.statuses.pending_customer'), value: 'pending_customer' },
      { label: t('support.statuses.resolved'), value: 'resolved' },
      { label: t('support.statuses.closed'), value: 'closed' }
    ])

    const canUpdateStatus = computed(() => {
      return props.ticket && props.ticket.status !== 'closed'
    })

    const formatTicketNumber = (ticketNumber) => {
      return supportService.formatTicketNumber(ticketNumber)
    }

    const getStatusColor = (status) => {
      return supportService.getTicketStatusColor(status)
    }

    const getPriorityColor = (priority) => {
      return supportService.getPriorityColor(priority)
    }

    const getPriorityIcon = (priority) => {
      return supportService.getPriorityIcon(priority)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
    }

    const isOverdue = (dueDate) => {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    }

    const isNearDue = (dueDate) => {
      if (!dueDate) return false
      const due = new Date(dueDate)
      const now = new Date()
      const hoursDiff = (due - now) / (1000 * 60 * 60)
      return hoursDiff > 0 && hoursDiff <= 2
    }

    const updateStatus = async () => {
      if (!props.ticket || !newStatus.value) return
      
      statusLoading.value = true
      
      try {
        await supportStore.updateTicket(props.ticket.id, {
          status: newStatus.value,
          status_note: statusNote.value
        })
        
        emit('ticket-updated')
        showStatusDialog.value = false
        newStatus.value = ''
        statusNote.value = ''
        
      } catch (error) {
        console.error('Failed to update status:', error)
      } finally {
        statusLoading.value = false
      }
    }

    const addMessage = async () => {
      if (!props.ticket || !newMessage.value.trim()) return
      
      messageLoading.value = true
      
      try {
        await supportStore.addMessage(props.ticket.id, {
          content: newMessage.value,
          is_internal: isInternalMessage.value
        })
        
        emit('ticket-updated')
        showMessageDialog.value = false
        newMessage.value = ''
        isInternalMessage.value = false
        
      } catch (error) {
        console.error('Failed to add message:', error)
      } finally {
        messageLoading.value = false
      }
    }

    const addAttachment = async () => {
      if (!props.ticket || !newAttachment.value) return
      
      attachmentLoading.value = true
      
      try {
        await supportStore.addAttachment(
          props.ticket.id,
          newAttachment.value,
          attachmentDescription.value
        )
        
        emit('ticket-updated')
        showAttachmentDialog.value = false
        newAttachment.value = null
        attachmentDescription.value = ''
        
      } catch (error) {
        console.error('Failed to add attachment:', error)
      } finally {
        attachmentLoading.value = false
      }
    }

    const downloadAttachment = (attachment) => {
      // Create download link
      const link = document.createElement('a')
      link.href = attachment.file_path
      link.download = attachment.original_filename
      link.click()
    }

    return {
      showStatusDialog,
      showMessageDialog,
      showAttachmentDialog,
      statusLoading,
      messageLoading,
      attachmentLoading,
      newStatus,
      statusNote,
      newMessage,
      isInternalMessage,
      newAttachment,
      attachmentDescription,
      statusOptions,
      canUpdateStatus,
      formatTicketNumber,
      getStatusColor,
      getPriorityColor,
      getPriorityIcon,
      formatDate,
      isOverdue,
      isNearDue,
      updateStatus,
      addMessage,
      addAttachment,
      downloadAttachment
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-detail {
  .liquid-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>