<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="auto_awesome" class="q-mr-sm" />
        Automated Invoicing
      </div>

      <!-- Status Overview -->
      <div class="row q-gutter-md q-mb-md">
        <q-card flat bordered class="col">
          <q-card-section class="text-center">
            <div class="text-h4 text-primary">{{ todayStats.generated || 0 }}</div>
            <div class="text-caption">Generated Today</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="col">
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ todayStats.pending || 0 }}</div>
            <div class="text-caption">Pending Checkout</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="col">
          <q-card-section class="text-center">
            <div class="text-h4 text-negative">{{ overdueStats.count || 0 }}</div>
            <div class="text-caption">Overdue Invoices</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Automation Schedule -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">Automation Schedule</div>
        <q-list dense bordered>
          <q-item>
            <q-item-section avatar>
              <q-icon name="schedule" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Daily Invoice Generation</q-item-label>
              <q-item-label caption>10:00 AM - Generate invoices for today's checkouts</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="green" label="Active" />
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section avatar>
              <q-icon name="email" color="blue" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Overdue Reminders</q-item-label>
              <q-item-label caption>11:00 AM - Send reminders for overdue invoices</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="green" label="Active" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="backup" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Catch-up Generation</q-item-label>
              <q-item-label caption>2:00 AM - Generate missed invoices from previous day</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="green" label="Active" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Manual Actions -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">Manual Actions</div>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            icon="play_arrow"
            label="Generate Today's Invoices"
            @click="generateTodayInvoices"
            :loading="generating.today"
          />
          <q-btn
            color="orange"
            icon="email"
            label="Send Overdue Reminders"
            @click="sendOverdueReminders"
            :loading="generating.reminders"
          />
          <q-btn
            color="blue"
            icon="history"
            label="Generate for Date"
            @click="showDateDialog = true"
          />
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="recentActivity.length > 0">
        <div class="text-subtitle1 q-mb-sm">Recent Activity</div>
        <q-list dense>
          <q-item v-for="activity in recentActivity" :key="activity.id">
            <q-item-section avatar>
              <q-icon 
                :name="getActivityIcon(activity.type)" 
                :color="getActivityColor(activity.type)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ activity.message }}</q-item-label>
              <q-item-label caption>{{ formatDateTime(activity.created_at) }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="activity.status">
              <q-badge 
                :color="activity.status === 'success' ? 'green' : 'red'"
                :label="activity.status"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>

    <!-- Generate for Date Dialog -->
    <q-dialog v-model="showDateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Generate Invoices for Date</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="selectedDate"
            label="Checkout Date"
            type="date"
            :max="today"
          />
          <q-checkbox
            v-model="autoFinalize"
            label="Auto-finalize and send emails"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDateDialog = false" />
          <q-btn
            color="primary"
            label="Generate"
            @click="generateForDate"
            :loading="generating.date"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'

// Data
const todayStats = ref({})
const overdueStats = ref({})
const recentActivity = ref([])
const generating = ref({
  today: false,
  reminders: false,
  date: false
})

// Dialog
const showDateDialog = ref(false)
const selectedDate = ref('')
const autoFinalize = ref(true)

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Methods
const loadStats = async () => {
  try {
    // Load today's invoice generation stats
    const todayResponse = await api.get('/invoices', {
      params: {
        start_date: today.value,
        end_date: today.value
      }
    })
    
    todayStats.value = {
      generated: todayResponse.data.pagination?.total || 0
    }

    // Load pending checkouts for today
    const checkoutsResponse = await api.get('/reservations', {
      params: {
        checkout_date: today.value,
        status: 'confirmed'
      }
    })
    
    todayStats.value.pending = checkoutsResponse.data.pagination?.total || 0

    // Load overdue invoices
    const overdueResponse = await api.get('/invoices/overdue')
    overdueStats.value = {
      count: overdueResponse.data.count || 0
    }

  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadRecentActivity = async () => {
  try {
    // This would typically come from a dedicated activity log endpoint
    // For now, we'll simulate with recent invoices
    const response = await api.get('/invoices', {
      params: {
        per_page: 5,
        sort_by: 'created_at',
        sort_direction: 'desc'
      }
    })

    recentActivity.value = response.data.data.map(invoice => ({
      id: invoice.id,
      type: 'invoice_generated',
      message: `Invoice #${invoice.invoice_number} generated for ${invoice.guest?.first_name} ${invoice.guest?.last_name}`,
      created_at: invoice.created_at,
      status: 'success'
    }))

  } catch (error) {
    console.error('Failed to load recent activity:', error)
  }
}

const generateTodayInvoices = async () => {
  generating.value.today = true
  try {
    // This would call a backend endpoint that triggers the invoice generation command
    const response = await api.post('/invoices/generate-batch', {
      checkout_date: today.value,
      auto_finalize: true
    })

    console.log(`Generated ${response.data.generated || 0} invoices successfully`)

    loadStats()
    loadRecentActivity()

  } catch (error) {
    console.error('Failed to generate invoices:', error.response?.data?.message || error.message)
  } finally {
    generating.value.today = false
  }
}

const sendOverdueReminders = async () => {
  generating.value.reminders = true
  try {
    const response = await api.post('/invoices/send-overdue-reminders')

    console.log(`Sent ${response.data.sent || 0} overdue reminders`)

    loadStats()

  } catch {
    console.error('Failed to send overdue reminders')
  } finally {
    generating.value.reminders = false
  }
}

const generateForDate = async () => {
  if (!selectedDate.value) {
    console.error('Please select a date')
    return
  }

  generating.value.date = true
  try {
    const response = await api.post('/invoices/generate-batch', {
      checkout_date: selectedDate.value,
      auto_finalize: autoFinalize.value
    })

    console.log(`Generated ${response.data.generated || 0} invoices for ${selectedDate.value}`)

    showDateDialog.value = false
    selectedDate.value = ''
    loadStats()
    loadRecentActivity()

  } catch (error) {
    console.error('Failed to generate invoices:', error.response?.data?.message || error.message)
  } finally {
    generating.value.date = false
  }
}

const getActivityIcon = (type) => {
  const icons = {
    invoice_generated: 'receipt',
    reminder_sent: 'email',
    payment_received: 'payment',
    invoice_cancelled: 'cancel'
  }
  return icons[type] || 'info'
}

const getActivityColor = (type) => {
  const colors = {
    invoice_generated: 'primary',
    reminder_sent: 'blue',
    payment_received: 'green',
    invoice_cancelled: 'red'
  }
  return colors[type] || 'grey'
}

const formatDateTime = (dateTime) => {
  return dateTime ? new Date(dateTime).toLocaleString() : ''
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadRecentActivity()
  
  // Set default selected date to today
  selectedDate.value = today.value
})
</script>