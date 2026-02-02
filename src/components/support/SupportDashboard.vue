<template>
  <div class="support-dashboard">
    <!-- Overview Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="liquid-glass-card stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-primary">{{ totalTickets }}</div>
                <div class="text-subtitle2 text-grey-7">{{ $t('support.totalTickets') }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="mdi-ticket" size="2em" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="liquid-glass-card stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-orange">{{ openTickets }}</div>
                <div class="text-subtitle2 text-grey-7">{{ $t('support.openTickets') }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="mdi-ticket-outline" size="2em" color="orange" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="liquid-glass-card stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-green">{{ Math.round(slaCompliance) }}%</div>
                <div class="text-subtitle2 text-grey-7">{{ $t('support.slaCompliance') }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="mdi-clock-check" size="2em" color="green" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="liquid-glass-card stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-blue">{{ averageResponseTime }}h</div>
                <div class="text-subtitle2 text-grey-7">{{ $t('support.avgResponseTime') }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="mdi-timer" size="2em" color="blue" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Ticket Status Distribution -->
      <div class="col-md-6 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.ticketsByStatus') }}</div>
            <div class="chart-container">
              <canvas ref="statusChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Priority Distribution -->
      <div class="col-md-6 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.ticketsByPriority') }}</div>
            <div class="chart-container">
              <canvas ref="priorityChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- SaaS Metrics -->
    <div v-if="saasAnalytics" class="row q-gutter-md q-mb-lg">
      <div class="col-md-4 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.tenantHealth') }}</div>
            <div class="text-center">
              <q-circular-progress
                :value="saasAnalytics.tenant_health_score || 0"
                size="120px"
                :thickness="0.15"
                color="primary"
                track-color="grey-3"
                class="q-ma-md"
              >
                <div class="text-h5">{{ Math.round(saasAnalytics.tenant_health_score || 0) }}</div>
                <div class="text-caption">{{ $t('support.healthScore') }}</div>
              </q-circular-progress>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-4 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.selfServiceUsage') }}</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('support.faqViews') }}</q-item-label>
                  <q-item-label caption>
                    {{ saasAnalytics.self_service_usage?.faq_views || 0 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('support.chatSessions') }}</q-item-label>
                  <q-item-label caption>
                    {{ saasAnalytics.self_service_usage?.chat_sessions || 0 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-4 col-sm-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('support.escalationRate') }}</div>
            <div class="text-center">
              <div class="text-h4" :class="getEscalationColor(saasAnalytics.escalation_rate)">
                {{ saasAnalytics.escalation_rate || 0 }}%
              </div>
              <div class="text-caption text-grey-7">
                {{ $t('support.ticketsEscalated') }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Tickets -->
    <div class="row">
      <div class="col-12">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">{{ $t('support.recentTickets') }}</div>
              </div>
              <div class="col-auto">
                <q-btn
                  :label="$t('support.viewAll')"
                  color="primary"
                  flat
                  @click="$emit('view-all-tickets')"
                />
              </div>
            </div>
            
            <q-list separator>
              <q-item
                v-for="ticket in recentTickets"
                :key="ticket.id"
                clickable
                @click="$emit('view-ticket', ticket)"
              >
                <q-item-section avatar>
                  <q-avatar
                    :color="getStatusColor(ticket.status)"
                    text-color="white"
                    :icon="getStatusIcon(ticket.status)"
                  />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>
                    {{ formatTicketNumber(ticket.ticket_number) }} - {{ ticket.title }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t(`support.categories.${ticket.category}`) }} • 
                    {{ formatDate(ticket.created_at) }}
                  </q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-chip
                    :color="getPriorityColor(ticket.priority)"
                    text-color="white"
                    :label="$t(`support.priorities.${ticket.priority}`)"
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            
            <div v-if="!recentTickets.length" class="text-center q-pa-md text-grey-7">
              {{ $t('support.noRecentTickets') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { useSupportStore } from 'src/stores/support'
import supportService from 'src/services/supportService'

export default {
  name: 'SupportDashboard',
  
  emits: ['view-all-tickets', 'view-ticket'],

  setup() {
    const { t } = useI18n()
    const supportStore = useSupportStore()
    
    const statusChart = ref(null)
    const priorityChart = ref(null)
    
    const statistics = computed(() => supportStore.statistics)
    const saasAnalytics = computed(() => supportStore.saasAnalytics)
    const recentTickets = computed(() => supportStore.tickets.slice(0, 5))
    
    // Computed statistics
    const totalTickets = computed(() => supportStore.totalTickets)
    const openTickets = computed(() => supportStore.openTickets.length)
    const slaCompliance = computed(() => supportStore.slaCompliance)
    const averageResponseTime = computed(() => supportStore.averageResponseTime)

    const getStatusColor = (status) => {
      return supportService.getTicketStatusColor(status)
    }

    const getStatusIcon = (status) => {
      return supportService.getTicketStatusIcon(status)
    }

    const getPriorityColor = (priority) => {
      return supportService.getPriorityColor(priority)
    }

    const formatTicketNumber = (ticketNumber) => {
      return supportService.formatTicketNumber(ticketNumber)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
    }

    const getEscalationColor = (rate) => {
      if (rate > 20) return 'text-red'
      if (rate > 10) return 'text-orange'
      return 'text-green'
    }

    const createStatusChart = async () => {
      await nextTick()
      
      if (!statusChart.value || !statistics.value) return
      
      // This would use Chart.js or similar library
      // For now, we'll just prepare the data structure
      const statusData = {
        labels: [
          t('support.statuses.open'),
          t('support.statuses.in_progress'),
          t('support.statuses.resolved'),
          t('support.statuses.closed')
        ],
        datasets: [{
          data: [
            supportStore.openTickets.length,
            supportStore.inProgressTickets.length,
            supportStore.resolvedTickets.length,
            statistics.value.ticket_counts?.closed || 0
          ],
          backgroundColor: ['#ff9800', '#2196f3', '#4caf50', '#9e9e9e']
        }]
      }
      
      // Initialize chart here with Chart.js
      console.log('Status chart data:', statusData)
    }

    const createPriorityChart = async () => {
      await nextTick()
      
      if (!priorityChart.value || !statistics.value) return
      
      const priorityData = {
        labels: [
          t('support.priorities.low'),
          t('support.priorities.normal'),
          t('support.priorities.high'),
          t('support.priorities.critical')
        ],
        datasets: [{
          data: [
            statistics.value.by_priority?.low || 0,
            statistics.value.by_priority?.normal || 0,
            statistics.value.by_priority?.high || 0,
            statistics.value.by_priority?.critical || 0
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336']
        }]
      }
      
      // Initialize chart here with Chart.js
      console.log('Priority chart data:', priorityData)
    }

    const loadDashboardData = async () => {
      try {
        // Load recent tickets
        await supportStore.fetchTickets({ limit: 5 })
        
        // Load statistics
        await supportStore.fetchStatistics()
        
        // Load SaaS analytics
        await supportStore.fetchSaasAnalytics()
        
        // Create charts
        await createStatusChart()
        await createPriorityChart()
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      statusChart,
      priorityChart,
      statistics,
      saasAnalytics,
      recentTickets,
      totalTickets,
      openTickets,
      slaCompliance,
      averageResponseTime,
      getStatusColor,
      getStatusIcon,
      getPriorityColor,
      formatTicketNumber,
      formatDate,
      getEscalationColor
    }
  }
}
</script>

<style lang="scss" scoped>
.support-dashboard {
  .liquid-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .stat-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  .chart-container {
    height: 300px;
    position: relative;
  }
}
</style>