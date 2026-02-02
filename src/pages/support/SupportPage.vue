<template>
  <q-page class="support-page">
    <div class="container q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 q-ma-none">{{ $t('support.supportCenter') }}</h1>
          <p class="text-subtitle1 text-grey-7 q-mt-sm">
            {{ $t('support.supportCenterDescription') }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            :label="$t('support.createTicket')"
            color="primary"
            icon="mdi-plus"
            @click="showCreateDialog = true"
          />
        </div>
      </div>

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="dashboard" :label="$t('support.dashboard')" icon="mdi-view-dashboard" />
        <q-tab name="tickets" :label="$t('support.myTickets')" icon="mdi-ticket" />
        <q-tab name="faq" :label="$t('support.faq')" icon="mdi-help-circle" />
        <q-tab name="contact" :label="$t('support.contact')" icon="mdi-phone" />
      </q-tabs>

      <q-separator class="q-mb-lg" />

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <!-- Dashboard -->
        <q-tab-panel name="dashboard" class="q-pa-none">
          <SupportDashboard
            @view-all-tickets="activeTab = 'tickets'"
            @view-ticket="viewTicket"
          />
        </q-tab-panel>

        <!-- My Tickets -->
        <q-tab-panel name="tickets" class="q-pa-none">
          <TicketList
            :tickets="tickets"
            :loading="ticketsLoading"
            :pagination="pagination"
            :filters="filters"
            @request="onTicketsRequest"
            @filter-change="onFiltersChange"
            @view-ticket="viewTicket"
            @edit-ticket="editTicket"
          />
        </q-tab-panel>

        <!-- FAQ -->
        <q-tab-panel name="faq" class="q-pa-none">
          <FaqSection @create-ticket="showCreateDialog = true" />
        </q-tab-panel>

        <!-- Contact -->
        <q-tab-panel name="contact" class="q-pa-none">
          <ContactSection />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Create Ticket Dialog -->
    <CreateTicketDialog
      v-model="showCreateDialog"
      @ticket-created="onTicketCreated"
    />

    <!-- Ticket Detail Dialog -->
    <q-dialog
      v-model="showTicketDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="liquid-glass-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('support.ticketDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTicketDialog = false" />
        </q-card-section>

        <q-card-section>
          <TicketDetail
            :ticket="selectedTicket"
            @ticket-updated="onTicketUpdated"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Live Chat Widget -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="mdi-chat"
        color="primary"
        @click="initializeLiveChat"
        :loading="chatLoading"
      >
        <q-tooltip>{{ $t('support.liveChat') }}</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <!-- Live Chat Dialog -->
    <q-dialog
      v-model="showChatDialog"
      position="bottom-right"
      :maximized="$q.screen.lt.sm"
    >
      <q-card style="width: 400px; height: 500px;" class="liquid-glass-card">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ $t('support.liveChat') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeLiveChat" />
        </q-card-section>

        <q-card-section class="col q-pa-none">
          <LiveChatWidget
            v-if="liveChatSession"
            :session="liveChatSession"
            @close="closeLiveChat"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useSupportStore } from 'src/stores/support'

// Components
import SupportDashboard from 'src/components/support/SupportDashboard.vue'
import TicketList from 'src/components/support/TicketList.vue'
import TicketDetail from 'src/components/support/TicketDetail.vue'
import FaqSection from 'src/components/support/FaqSection.vue'
import CreateTicketDialog from 'src/components/support/CreateTicketDialog.vue'
import ContactSection from 'src/components/support/ContactSection.vue'
import LiveChatWidget from 'src/components/support/LiveChatWidget.vue'

export default {
  name: 'SupportPage',
  
  components: {
    SupportDashboard,
    TicketList,
    TicketDetail,
    FaqSection,
    CreateTicketDialog,
    ContactSection,
    LiveChatWidget
  },

  setup() {
    const { t } = useI18n()
    const $q = useQuasar()
    const router = useRouter()
    const supportStore = useSupportStore()
    
    const activeTab = ref('dashboard')
    const showCreateDialog = ref(false)
    const showTicketDialog = ref(false)
    const showChatDialog = ref(false)
    const selectedTicket = ref(null)
    const chatLoading = ref(false)
    
    // Computed properties from store
    const tickets = computed(() => supportStore.tickets)
    const ticketsLoading = computed(() => supportStore.ticketsLoading)
    const pagination = computed(() => supportStore.pagination)
    const filters = computed(() => supportStore.filters)
    const liveChatSession = computed(() => supportStore.liveChatSession)

    const onTicketsRequest = async (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      
      supportStore.setPagination({
        page,
        rowsPerPage,
        sortBy,
        descending
      })
      
      await supportStore.fetchTickets()
    }

    const onFiltersChange = (newFilters) => {
      supportStore.setFilters(newFilters)
      supportStore.fetchTickets()
    }

    const viewTicket = async (ticket) => {
      selectedTicket.value = ticket
      
      // Load full ticket details
      await supportStore.fetchTicket(ticket.id)
      selectedTicket.value = supportStore.currentTicket
      
      showTicketDialog.value = true
    }

    const editTicket = () => {
      // Navigate to edit page or show edit dialog
      router.push('/support/tickets/edit')
    }

    const onTicketCreated = () => {
      // Refresh tickets list
      supportStore.fetchTickets()
      
      // Switch to tickets tab
      activeTab.value = 'tickets'
      
      $q.notify({
        type: 'positive',
        message: t('support.ticketCreatedSuccess'),
        position: 'top-right'
      })
    }

    const onTicketUpdated = () => {
      // Refresh current ticket and tickets list
      if (selectedTicket.value) {
        supportStore.fetchTicket(selectedTicket.value.id)
      }
      supportStore.fetchTickets()
    }

    const initializeLiveChat = async () => {
      chatLoading.value = true
      
      try {
        const chatData = {
          user_role: 'customer',
          page_url: window.location.href,
          metadata: {
            browser: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
        
        await supportStore.initializeLiveChat(chatData)
        showChatDialog.value = true
        
      } catch (error) {
        console.error('Failed to initialize live chat:', error)
        $q.notify({
          type: 'negative',
          message: t('support.chatInitError'),
          position: 'top-right'
        })
      } finally {
        chatLoading.value = false
      }
    }

    const closeLiveChat = () => {
      showChatDialog.value = false
      supportStore.closeLiveChat()
    }

    onMounted(() => {
      // Load initial data based on active tab
      if (activeTab.value === 'tickets') {
        supportStore.fetchTickets()
      }
    })

    return {
      activeTab,
      showCreateDialog,
      showTicketDialog,
      showChatDialog,
      selectedTicket,
      chatLoading,
      tickets,
      ticketsLoading,
      pagination,
      filters,
      liveChatSession,
      onTicketsRequest,
      onFiltersChange,
      viewTicket,
      editTicket,
      onTicketCreated,
      onTicketUpdated,
      initializeLiveChat,
      closeLiveChat
    }
  }
}
</script>

<style lang="scss" scoped>
.support-page {
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