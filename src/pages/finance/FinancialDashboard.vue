<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Financial Dashboard</div>
                <div class="text-subtitle2">Revenue and financial analytics</div>
              </div>
              <div class="row q-gutter-sm">
                <q-select
                  v-model="selectedPeriod"
                  :options="periodOptions"
                  label="Period"
                  outlined
                  dense
                  style="min-width: 150px"
                  @update:model-value="updateFinancialData"
                />
                <q-btn 
                  color="primary" 
                  icon="refresh" 
                  label="Refresh" 
                  @click="refreshData"
                />
                <q-btn 
                  color="secondary" 
                  icon="download" 
                  label="Export" 
                  outline
                  @click="exportReport"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Key Metrics -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Key Financial Metrics</div>
            <div class="row q-gutter-md">
              <div class="col-6 col-md-3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <q-icon name="attach_money" size="40px" color="positive" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">${{ formatNumber(financialData.totalRevenue) }}</div>
                    <div class="metric-label">Total Revenue</div>
                    <div class="metric-change positive">
                      <q-icon name="trending_up" />
                      +{{ financialData.revenueGrowth }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <q-icon name="hotel" size="40px" color="info" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">${{ formatNumber(financialData.adr) }}</div>
                    <div class="metric-label">ADR (Avg Daily Rate)</div>
                    <div class="metric-change positive">
                      <q-icon name="trending_up" />
                      +{{ financialData.adrGrowth }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <q-icon name="analytics" size="40px" color="secondary" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">${{ formatNumber(financialData.revpar) }}</div>
                    <div class="metric-label">RevPAR</div>
                    <div class="metric-change positive">
                      <q-icon name="trending_up" />
                      +{{ financialData.revparGrowth }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <q-icon name="percent" size="40px" color="warning" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ financialData.occupancyRate }}%</div>
                    <div class="metric-label">Occupancy Rate</div>
                    <div class="metric-change positive">
                      <q-icon name="trending_up" />
                      +{{ financialData.occupancyGrowth }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Revenue Chart -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Revenue Trend</div>
            <div class="chart-container">
              <canvas ref="revenueChart" width="400" height="200"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Revenue Breakdown -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Revenue Breakdown</div>
            <div class="revenue-breakdown">
              <div class="breakdown-item">
                <div class="breakdown-label">
                  <q-icon name="hotel" color="primary" />
                  Room Revenue
                </div>
                <div class="breakdown-value">${{ formatNumber(financialData.roomRevenue) }}</div>
                <div class="breakdown-percentage">{{ calculatePercentage(financialData.roomRevenue) }}%</div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-label">
                  <q-icon name="restaurant" color="secondary" />
                  F&B Revenue
                </div>
                <div class="breakdown-value">${{ formatNumber(financialData.fbRevenue) }}</div>
                <div class="breakdown-percentage">{{ calculatePercentage(financialData.fbRevenue) }}%</div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-label">
                  <q-icon name="spa" color="accent" />
                  Spa Revenue
                </div>
                <div class="breakdown-value">${{ formatNumber(financialData.spaRevenue) }}</div>
                <div class="breakdown-percentage">{{ calculatePercentage(financialData.spaRevenue) }}%</div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-label">
                  <q-icon name="more_horiz" color="info" />
                  Other Revenue
                </div>
                <div class="breakdown-value">${{ formatNumber(financialData.otherRevenue) }}</div>
                <div class="breakdown-percentage">{{ calculatePercentage(financialData.otherRevenue) }}%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Transactions -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Transactions</div>
            <q-list>
              <q-item 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="q-pa-sm"
              >
                <q-item-section avatar>
                  <q-icon 
                    :name="getTransactionIcon(transaction.type)" 
                    :color="getTransactionColor(transaction.type)"
                  />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ transaction.description }}</q-item-label>
                  <q-item-label caption>{{ transaction.guest_name }} • {{ formatDate(transaction.date) }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-item-label class="text-weight-medium">
                    ${{ formatNumber(transaction.amount) }}
                  </q-item-label>
                  <q-badge 
                    :color="getStatusColor(transaction.status)"
                    :label="transaction.status"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Outstanding Invoices -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Outstanding Invoices</div>
            <q-list>
              <q-item 
                v-for="invoice in outstandingInvoices" 
                :key="invoice.id"
                class="q-pa-sm"
              >
                <q-item-section>
                  <q-item-label>Invoice #{{ invoice.id }}</q-item-label>
                  <q-item-label caption>{{ invoice.guest_name }} • Due: {{ formatDate(invoice.due_date) }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-item-label class="text-weight-medium">
                    ${{ formatNumber(invoice.amount) }}
                  </q-item-label>
                  <q-badge 
                    :color="getInvoiceStatusColor(invoice)"
                    :label="getInvoiceStatusLabel(invoice)"
                  />
                </q-item-section>
                
                <q-item-section side>
                  <q-btn 
                    flat 
                    round 
                    icon="send" 
                    size="sm"
                    @click="sendInvoiceReminder(invoice)"
                  >
                    <q-tooltip>Send Reminder</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Payment Methods -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Payment Methods</div>
            <div class="payment-methods">
              <div class="payment-method">
                <q-icon name="credit_card" color="primary" size="24px" />
                <div class="payment-info">
                  <div class="payment-label">Credit Cards</div>
                  <div class="payment-amount">${{ formatNumber(paymentMethods.creditCard) }}</div>
                </div>
                <div class="payment-percentage">{{ calculatePaymentPercentage(paymentMethods.creditCard) }}%</div>
              </div>
              
              <div class="payment-method">
                <q-icon name="account_balance" color="secondary" size="24px" />
                <div class="payment-info">
                  <div class="payment-label">Bank Transfer</div>
                  <div class="payment-amount">${{ formatNumber(paymentMethods.bankTransfer) }}</div>
                </div>
                <div class="payment-percentage">{{ calculatePaymentPercentage(paymentMethods.bankTransfer) }}%</div>
              </div>
              
              <div class="payment-method">
                <q-icon name="money" color="positive" size="24px" />
                <div class="payment-info">
                  <div class="payment-label">Cash</div>
                  <div class="payment-amount">${{ formatNumber(paymentMethods.cash) }}</div>
                </div>
                <div class="payment-percentage">{{ calculatePaymentPercentage(paymentMethods.cash) }}%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="row q-gutter-sm">
              <q-btn 
                color="primary" 
                icon="receipt" 
                label="Generate Report" 
                @click="generateReport"
              />
              <q-btn 
                color="secondary" 
                icon="payment" 
                label="Process Payment" 
                outline
                @click="processPayment"
              />
              <q-btn 
                color="accent" 
                icon="send" 
                label="Send Invoices" 
                outline
                @click="sendInvoices"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const selectedPeriod = ref({ label: 'This Month', value: 'month' })
const revenueChart = ref(null)

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' }
]

// Mock financial data
const financialData = ref({
  totalRevenue: 125000,
  revenueGrowth: 12.5,
  adr: 185,
  adrGrowth: 8.2,
  revpar: 142,
  revparGrowth: 15.3,
  occupancyRate: 78,
  occupancyGrowth: 5.8,
  roomRevenue: 85000,
  fbRevenue: 25000,
  spaRevenue: 10000,
  otherRevenue: 5000
})

const recentTransactions = ref([
  {
    id: 1,
    type: 'room',
    description: 'Room 101 - 3 nights',
    guest_name: 'John Doe',
    amount: 555,
    status: 'paid',
    date: '2024-01-20'
  },
  {
    id: 2,
    type: 'fb',
    description: 'Restaurant charges',
    guest_name: 'Jane Smith',
    amount: 125,
    status: 'pending',
    date: '2024-01-20'
  },
  {
    id: 3,
    type: 'spa',
    description: 'Spa treatment',
    guest_name: 'Robert Johnson',
    amount: 200,
    status: 'paid',
    date: '2024-01-19'
  }
])

const outstandingInvoices = ref([
  {
    id: 1001,
    guest_name: 'Alice Brown',
    amount: 450,
    due_date: '2024-01-25',
    days_overdue: 0
  },
  {
    id: 1002,
    guest_name: 'Bob Wilson',
    amount: 320,
    due_date: '2024-01-18',
    days_overdue: 2
  },
  {
    id: 1003,
    guest_name: 'Carol Davis',
    amount: 680,
    due_date: '2024-01-15',
    days_overdue: 5
  }
])

const paymentMethods = ref({
  creditCard: 85000,
  bankTransfer: 30000,
  cash: 10000
})

// Computed properties
const totalPayments = computed(() => {
  return paymentMethods.value.creditCard + 
         paymentMethods.value.bankTransfer + 
         paymentMethods.value.cash
})

// Methods
const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const calculatePercentage = (amount) => {
  return Math.round((amount / financialData.value.totalRevenue) * 100)
}

const calculatePaymentPercentage = (amount) => {
  return Math.round((amount / totalPayments.value) * 100)
}

const getTransactionIcon = (type) => {
  const icons = {
    room: 'hotel',
    fb: 'restaurant',
    spa: 'spa',
    other: 'more_horiz'
  }
  return icons[type] || 'receipt'
}

const getTransactionColor = (type) => {
  const colors = {
    room: 'primary',
    fb: 'secondary',
    spa: 'accent',
    other: 'info'
  }
  return colors[type] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    paid: 'positive',
    pending: 'warning',
    overdue: 'negative'
  }
  return colors[status] || 'grey'
}

const getInvoiceStatusColor = (invoice) => {
  if (invoice.days_overdue > 0) return 'negative'
  if (invoice.days_overdue === 0) return 'warning'
  return 'positive'
}

const getInvoiceStatusLabel = (invoice) => {
  if (invoice.days_overdue > 0) return `${invoice.days_overdue} days overdue`
  if (invoice.days_overdue === 0) return 'Due today'
  return 'Pending'
}

const updateFinancialData = () => {
  // In real app, fetch data based on selected period
  $q.notify({
    type: 'info',
    message: `Updated data for ${selectedPeriod.value.label}`
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    // In real app, fetch fresh data from API
    await new Promise(resolve => setTimeout(resolve, 1000))
    $q.notify({
      type: 'positive',
      message: 'Financial data refreshed'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh data'
    })
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  $q.notify({
    type: 'info',
    message: 'Export functionality coming soon'
  })
}

const generateReport = () => {
  $q.notify({
    type: 'info',
    message: 'Report generation coming soon'
  })
}

const processPayment = () => {
  $q.notify({
    type: 'info',
    message: 'Payment processing coming soon'
  })
}

const sendInvoices = () => {
  $q.notify({
    type: 'info',
    message: 'Invoice sending coming soon'
  })
}

const sendInvoiceReminder = (invoice) => {
  $q.notify({
    type: 'positive',
    message: `Reminder sent to ${invoice.guest_name}`
  })
}

// Lifecycle
onMounted(() => {
  // In real app, fetch financial data from API
})
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.metric-icon {
  margin-right: 16px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #333;
}

.metric-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 0.8em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #4caf50;
}

.metric-change.negative {
  color: #f44336;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.breakdown-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.breakdown-value {
  font-weight: bold;
  color: #333;
}

.breakdown-percentage {
  font-size: 0.9em;
  color: #666;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.payment-info {
  flex: 1;
}

.payment-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.payment-amount {
  font-weight: bold;
  color: #333;
}

.payment-percentage {
  font-size: 0.9em;
  color: #666;
}
</style>