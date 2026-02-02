<template>
  <q-dialog
    v-model="showDialog"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="liquid-glass-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('support.createTicket') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-md-8 col-sm-12">
              <q-input
                v-model="form.title"
                :label="$t('support.title')"
                :rules="[val => !!val || $t('validation.required')]"
                outlined
                required
              />
            </div>
            
            <div class="col-md-4 col-sm-12">
              <q-select
                v-model="form.priority"
                :options="priorityOptions"
                :label="$t('support.priority')"
                :rules="[val => !!val || $t('validation.required')]"
                outlined
                emit-value
                map-options
                required
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col-md-6 col-sm-12">
              <q-select
                v-model="form.category"
                :options="categoryOptions"
                :label="$t('support.category')"
                :rules="[val => !!val || $t('validation.required')]"
                outlined
                emit-value
                map-options
                required
              />
            </div>
            
            <div class="col-md-6 col-sm-12">
              <q-select
                v-model="form.source"
                :options="sourceOptions"
                :label="$t('support.source')"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>

          <q-input
            v-model="form.description"
            :label="$t('support.description')"
            :rules="[val => !!val || $t('validation.required')]"
            type="textarea"
            rows="6"
            outlined
            required
          />

          <!-- File Attachments -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('support.attachments') }}</div>
            <q-file
              v-model="attachments"
              :label="$t('support.selectFiles')"
              multiple
              outlined
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
              max-file-size="10485760"
              @rejected="onRejected"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-attachment" />
              </template>
            </q-file>
            
            <div v-if="attachments && attachments.length" class="q-mt-sm">
              <q-chip
                v-for="(file, index) in attachments"
                :key="index"
                :label="file.name"
                removable
                @remove="removeAttachment(index)"
                color="primary"
                text-color="white"
              />
            </div>
          </div>

          <!-- Contact Information -->
          <q-expansion-item
            :label="$t('support.contactInformation')"
            icon="mdi-account-circle"
            class="q-mt-md"
          >
            <div class="q-pa-md">
              <div class="row q-gutter-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="form.contact_name"
                    :label="$t('support.contactName')"
                    outlined
                  />
                </div>
                
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="form.contact_email"
                    :label="$t('support.contactEmail')"
                    type="email"
                    outlined
                  />
                </div>
              </div>
              
              <q-input
                v-model="form.contact_phone"
                :label="$t('support.contactPhone')"
                outlined
                class="q-mt-md"
              />
            </div>
          </q-expansion-item>

          <!-- System Information (Auto-populated) -->
          <q-expansion-item
            :label="$t('support.systemInformation')"
            icon="mdi-information"
            class="q-mt-md"
          >
            <div class="q-pa-md">
              <div class="row q-gutter-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    :model-value="systemInfo.browser"
                    :label="$t('support.browser')"
                    outlined
                    readonly
                  />
                </div>
                
                <div class="col-md-6 col-sm-12">
                  <q-input
                    :model-value="systemInfo.os"
                    :label="$t('support.operatingSystem')"
                    outlined
                    readonly
                  />
                </div>
              </div>
              
              <div class="row q-gutter-md q-mt-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    :model-value="systemInfo.url"
                    :label="$t('support.currentPage')"
                    outlined
                    readonly
                  />
                </div>
                
                <div class="col-md-6 col-sm-12">
                  <q-input
                    :model-value="systemInfo.timestamp"
                    :label="$t('support.timestamp')"
                    outlined
                    readonly
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              :label="$t('common.cancel')"
              color="grey-7"
              outline
              @click="closeDialog"
            />
            <q-btn
              :label="$t('support.createTicket')"
              color="primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import { useSupportStore } from 'src/stores/support'

export default {
  name: 'CreateTicketDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'ticket-created'],

  setup(props, { emit }) {
    const { t } = useI18n()
    const $q = useQuasar()
    const supportStore = useSupportStore()
    
    const loading = ref(false)
    const attachments = ref(null)
    
    const form = ref({
      title: '',
      description: '',
      priority: 'normal',
      category: 'general',
      source: 'web',
      contact_name: '',
      contact_email: '',
      contact_phone: ''
    })

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const priorityOptions = computed(() => [
      { label: t('support.priorities.low'), value: 'low' },
      { label: t('support.priorities.normal'), value: 'normal' },
      { label: t('support.priorities.high'), value: 'high' },
      { label: t('support.priorities.critical'), value: 'critical' }
    ])

    const categoryOptions = computed(() => [
      { label: t('support.categories.technical'), value: 'technical' },
      { label: t('support.categories.billing'), value: 'billing' },
      { label: t('support.categories.account'), value: 'account' },
      { label: t('support.categories.feature_request'), value: 'feature_request' },
      { label: t('support.categories.general'), value: 'general' }
    ])

    const sourceOptions = computed(() => [
      { label: t('support.sources.web'), value: 'web' },
      { label: t('support.sources.email'), value: 'email' },
      { label: t('support.sources.phone'), value: 'phone' },
      { label: t('support.sources.chat'), value: 'chat' }
    ])

    const systemInfo = computed(() => ({
      browser: navigator.userAgent,
      os: navigator.platform,
      url: window.location.href,
      timestamp: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    }))

    const resetForm = () => {
      form.value = {
        title: '',
        description: '',
        priority: 'normal',
        category: 'general',
        source: 'web',
        contact_name: '',
        contact_email: '',
        contact_phone: ''
      }
      attachments.value = null
    }

    const closeDialog = () => {
      showDialog.value = false
      resetForm()
    }

    const removeAttachment = (index) => {
      if (attachments.value && Array.isArray(attachments.value)) {
        attachments.value.splice(index, 1)
      }
    }

    const onRejected = (rejectedEntries) => {
      $q.notify({
        type: 'negative',
        message: t('support.fileRejected', { 
          count: rejectedEntries.length,
          maxSize: '10MB'
        })
      })
    }

    const onSubmit = async () => {
      loading.value = true
      
      try {
        // Prepare ticket data
        const ticketData = {
          ...form.value,
          metadata: {
            system_info: systemInfo.value,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }

        // Create ticket
        const response = await supportStore.createTicket(ticketData)
        const ticketId = response.data.id

        // Upload attachments if any
        if (attachments.value && attachments.value.length > 0) {
          for (const file of attachments.value) {
            await supportStore.addAttachment(ticketId, file)
          }
        }

        $q.notify({
          type: 'positive',
          message: t('support.ticketCreatedSuccess'),
          position: 'top-right'
        })

        emit('ticket-created', response.data)
        closeDialog()
        
      } catch (error) {
        console.error('Failed to create ticket:', error)
        $q.notify({
          type: 'negative',
          message: t('support.ticketCreatedError'),
          position: 'top-right'
        })
      } finally {
        loading.value = false
      }
    }

    // Reset form when dialog opens
    watch(showDialog, (newVal) => {
      if (newVal) {
        resetForm()
      }
    })

    return {
      showDialog,
      loading,
      form,
      attachments,
      priorityOptions,
      categoryOptions,
      sourceOptions,
      systemInfo,
      closeDialog,
      removeAttachment,
      onRejected,
      onSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>