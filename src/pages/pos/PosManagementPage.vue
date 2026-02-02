<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">Point of Sale</div>

      <div class="row q-col-gutter-md">
        <!-- Left Panel - Transaction Entry -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">New Transaction</div>
              
              <q-select
                v-model="transaction.outlet_id"
                :options="outlets"
                label="Outlet"
                outlined
                dense
                class="q-mb-md"
              />

              <q-input
                v-model="transaction.room_number"
                label="Room Number (optional)"
                outlined
                dense
                class="q-mb-md"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="search" @click="validateRoom" />
                </template>
              </q-input>

              <!-- Items -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Items</div>
                <q-list bordered separator>
                  <q-item v-for="(item, index) in transaction.items" :key="index">
                    <q-item-section>
                      <q-input v-model="item.name" label="Item" dense />
                    </q-item-section>
                    <q-item-section style="max-width: 100px">
                      <q-input v-model.number="item.quantity" type="number" label="Qty" dense />
                    </q-item-section>
                    <q-item-section style="max-width: 120px">
                      <q-input v-model.number="item.price" type="number" label="Price" dense />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense icon="delete" color="negative" @click="removeItem(index)" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-btn flat color="primary" icon="add" label="Add Item" @click="addItem" class="q-mt-sm" />
              </div>

              <!-- Total -->
              <div class="row justify-between items-center q-mb-md">
                <div class="text-h6">Total:</div>
                <div class="text-h6">${{ calculateTotal() }}</div>
              </div>

              <!-- Payment Method -->
              <q-select
                v-model="transaction.payment_method"
                :options="['cash', 'card', 'room_charge', 'mobile']"
                label="Payment Method"
                outlined
                dense
                class="q-mb-md"
              />

              <q-btn color="primary" label="Process Transaction" @click="processTransaction" class="full-width" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Panel - Summary & Actions -->
        <div class="col-12 col-md-4">
          <!-- Daily Summary -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Today's Summary</div>
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Total Sales</div>
                <div class="text-h6">${{ dailySummary.total_sales || 0 }}</div>
              </div>
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">Transactions</div>
                <div class="text-h6">{{ dailySummary.transaction_count || 0 }}</div>
              </div>
              <div>
                <div class="text-caption text-grey-7">Average Transaction</div>
                <div class="text-h6">${{ dailySummary.average_transaction || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Quick Actions -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Quick Actions</div>
              <q-btn color="primary" label="Pending Charges" @click="viewPendingCharges" class="full-width q-mb-sm" />
              <q-btn color="primary" label="End of Day Report" @click="viewEndOfDayReport" class="full-width q-mb-sm" />
              <q-btn color="primary" label="Analytics" @click="viewAnalytics" class="full-width" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Recent Transactions -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Recent Transactions</div>
          <q-table
            :rows="recentTransactions"
            :columns="transactionColumns"
            row-key="id"
            :loading="loading"
            flat
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense icon="receipt" color="primary" @click="viewTransaction(props.row)" />
                <q-btn flat dense icon="undo" color="orange" @click="refundTransaction(props.row)" />
                <q-btn flat dense icon="cancel" color="negative" @click="voidTransaction(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import posService from 'src/services/posService'

export default {
  name: 'PosManagementPage',
  setup() {
    const $q = useQuasar()
    const outlets = ref([])
    const recentTransactions = ref([])
    const dailySummary = ref({})
    const loading = ref(false)

    const transaction = ref({
      outlet_id: null,
      room_number: '',
      payment_method: 'cash',
      items: [{ name: '', quantity: 1, price: 0 }]
    })


    const transactionColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'time', label: 'Time', field: 'time', align: 'left' },
      { name: 'outlet', label: 'Outlet', field: 'outlet', align: 'left' },
      { name: 'amount', label: 'Amount', field: 'amount', align: 'right', format: val => `$${val}` },
      { name: 'payment_method', label: 'Payment', field: 'payment_method', align: 'left' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const loadOutlets = async () => {
      try {
        const response = await posService.getOutlets()
        outlets.value = response.data
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load outlets' })
      }
    }

    const loadDailySummary = async () => {
      try {
        const response = await posService.getDailySummary()
        dailySummary.value = response.data
      } catch (error) {
        console.error('Failed to load daily summary', error)
      }
    }

    const addItem = () => {
      transaction.value.items.push({ name: '', quantity: 1, price: 0 })
    }

    const removeItem = (index) => {
      transaction.value.items.splice(index, 1)
    }

    const calculateTotal = () => {
      return transaction.value.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price)
      }, 0).toFixed(2)
    }

    const validateRoom = async () => {
      if (!transaction.value.room_number) return
      
      try {
        const response = await posService.validateRoom({ room_number: transaction.value.room_number })
        if (response.success) {
          $q.notify({ type: 'positive', message: 'Room validated' })
        }
      } catch {
        $q.notify({ type: 'negative', message: 'Invalid room number' })
      }
    }

    const processTransaction = async () => {
      try {
        await posService.processTransaction({
          ...transaction.value,
          total: calculateTotal()
        })
        $q.notify({ type: 'positive', message: 'Transaction processed successfully' })
        
        // Reset form
        transaction.value = {
          outlet_id: null,
          room_number: '',
          payment_method: 'cash',
          items: [{ name: '', quantity: 1, price: 0 }]
        }
        
        loadDailySummary()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to process transaction' })
      }
    }

    const viewTransaction = () => {
      $q.notify({ type: 'info', message: 'View transaction details' })
    }

    const refundTransaction = (transaction) => {
      $q.dialog({
        title: 'Refund Transaction',
        message: 'Enter refund amount:',
        prompt: {
          model: transaction.amount,
          type: 'number'
        },
        cancel: true
      }).onOk(async (amount) => {
        try {
          await posService.processRefund(transaction.id, { amount })
          $q.notify({ type: 'positive', message: 'Refund processed' })
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to process refund' })
        }
      })
    }

    const voidTransaction = async (transaction) => {
      $q.dialog({
        title: 'Void Transaction',
        message: 'Are you sure you want to void this transaction?',
        cancel: true
      }).onOk(async () => {
        try {
          await posService.voidTransaction(transaction.id)
          $q.notify({ type: 'positive', message: 'Transaction voided' })
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to void transaction' })
        }
      })
    }

    const viewPendingCharges = () => {
      $q.notify({ type: 'info', message: 'View pending charges' })
    }

    const viewEndOfDayReport = () => {
      $q.notify({ type: 'info', message: 'View end of day report' })
    }

    const viewAnalytics = () => {
      $q.notify({ type: 'info', message: 'View analytics' })
    }

    onMounted(() => {
      loadOutlets()
      loadDailySummary()
    })

    return {
      outlets,
      recentTransactions,
      dailySummary,
      loading,
      transaction,
      transactionColumns,
      addItem,
      removeItem,
      calculateTotal,
      validateRoom,
      processTransaction,
      viewTransaction,
      refundTransaction,
      voidTransaction,
      viewPendingCharges,
      viewEndOfDayReport,
      viewAnalytics
    }
  }
}
</script>
