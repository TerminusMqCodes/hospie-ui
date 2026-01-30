<template>
  <q-page class="edit-ticket-page">
    <div class="container q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <q-btn
            :label="$t('common.back')"
            icon="mdi-arrow-left"
            flat
            @click="$router.go(-1)"
            class="q-mb-sm"
          />
          <h1 class="text-h4 q-ma-none">{{ $t('support.editTicket') }}</h1>
        </div>
      </div>

      <!-- Edit Form -->
      <q-card v-if="ticket" class="liquid-glass-card">
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
                  v-model="form.status"
                  :options="statusOptions"
                  :label="$t('support.status')"
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

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                :label="$t('common.cancel')"
                color="grey-7"
                outline
                @click="$router.go(-1)"
              />
              <q-btn
                :label="$t('common.save')"
                color="primary"
                type="submit"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Loading -->
      <div v-else-if="ticketLoading" class="text-center q-pa-xl">
        <q-spinner-dots size="2em" color="primary" />
        <div class="text-body2 text-grey-6 q-mt-md">
          {{ $t('support.loadingTicket') }}
        </div>
      </div>

      <!-- Error -->
      <div v-else class="text-center q-pa-xl">
        <q-icon name="mdi-alert-circle" size="4em" color="red" />
        <div class="text-h6 text-red q-mt-md">
          {{ $t('support.ticketNotFound') }}
        </div>
        <q-btn
          :label="$t('support.backToTickets')"
          color="primary"
          class="q-mt-md"
          @click="$router.push('/support')"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSupportStore } from 'src/stores/support'

export default {
  name: 'EditTicketPage',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const $q = useQuasar()
    const supportStore = useSupportStore()
    
    const loading = ref(false)
    const ticketLoading = ref(false)
    
    const form = ref({
      title: '',
      description: '',
      priority: 'normal',
      category: 'general',
      status: 'open',
      contact_name: '',
      contact_email: '',
      contact_phone: ''
    })

    const ticket = computed(() => supportStore.currentTicket)
    const ticketId = computed(() => route.params.id)

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

    const statusOptions = computed(() => [
      { label: t('support.statuses.open'), value: 'open' },
      { label: t('support.statuses.in_progress'), value: 'in_progress' },
      { label: t('support.statuses.pending_customer'), value: 'pending_customer' },
      { label: t('support.statuses.resolved'), value: 'resolved' },
      { label: t('support.statuses.closed'), value: 'closed' }
    ])

    const loadTicket = async () => {
      if (!ticketId.value) return
      
      ticketLoading.value = true
      try {
        await supportStore.fetchTicket(ticketId.value)
      } catch (error) {
        console.error('Failed to load ticket:', error)
      } finally {
        ticketLoading.value = false
      }
    }

    const populateForm = () => {
      if (!ticket.value) return
      
      form.value = {
        title: ticket.value.title || '',
        description: ticket.value.description || '',
        priority: ticket.value.priority || 'normal',
        category: ticket.value.category || 'general',
        status: ticket.value.status || 'open',
        contact_name: ticket.value.contact_name || '',
        contact_email: ticket.value.contact_email || '',
        contact_phone: ticket.value.contact_phone || ''
      }
    }

    const onSubmit = async () => {
      if (!ticket.value) return
      
      loading.value = true
      
      try {
        await supportStore.updateTicket(ticket.value.id, form.value)
        
        $q.notify({
          type: 'positive',
          message: t('support.ticketUpdatedSuccess'),
          position: 'top-right'
        })

        // Navigate back to ticket detail
        router.push(`/support/tickets/${ticket.value.id}`)
        
      } catch (error) {
        console.error('Failed to update ticket:', error)
        $q.notify({
          type: 'negative',
          message: t('support.ticketUpdateError'),
          position: 'top-right'
        })
      } finally {
        loading.value = false
      }
    }

    // Watch for ticket changes to populate form
    watch(ticket, (newTicket) => {
      if (newTicket) {
        populateForm()
      }
    }, { immediate: true })

    onMounted(() => {
      loadTicket()
    })

    return {
      loading,
      ticketLoading,
      form,
      ticket,
      priorityOptions,
      categoryOptions,
      statusOptions,
      onSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-ticket-page {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .liquid-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>