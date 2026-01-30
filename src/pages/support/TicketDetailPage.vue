<template>
  <q-page class="ticket-detail-page">
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
          <h1 class="text-h4 q-ma-none">{{ $t('support.ticketDetails') }}</h1>
        </div>
      </div>

      <!-- Ticket Detail Component -->
      <TicketDetail
        v-if="ticket"
        :ticket="ticket"
        @ticket-updated="onTicketUpdated"
      />

      <!-- Loading -->
      <div v-else-if="loading" class="text-center q-pa-xl">
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSupportStore } from 'src/stores/support'
import TicketDetail from 'src/components/support/TicketDetail.vue'

export default {
  name: 'TicketDetailPage',
  
  components: {
    TicketDetail
  },

  setup() {
    const route = useRoute()
    const supportStore = useSupportStore()
    
    const loading = ref(false)
    
    const ticket = computed(() => supportStore.currentTicket)
    const ticketId = computed(() => route.params.id)

    const loadTicket = async () => {
      if (!ticketId.value) return
      
      loading.value = true
      try {
        await supportStore.fetchTicket(ticketId.value)
      } catch (error) {
        console.error('Failed to load ticket:', error)
      } finally {
        loading.value = false
      }
    }

    const onTicketUpdated = () => {
      // Reload ticket data
      loadTicket()
    }

    onMounted(() => {
      loadTicket()
    })

    return {
      loading,
      ticket,
      onTicketUpdated
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-detail-page {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>