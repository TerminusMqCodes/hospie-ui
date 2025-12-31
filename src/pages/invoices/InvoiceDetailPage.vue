<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md" v-if="invoice">
      <div>
        <h4 class="q-my-none">Invoice #{{ invoice.invoice_number }}</h4>
        <p class="text-grey-6 q-mb-none">
          {{ invoice.guest?.first_name }} {{ invoice.guest?.last_name }}
        </p>
      </div>
      <div class="q-gutter-sm">
        <q-btn
          color="primary"
          icon="email"
          label="Send Email"
          @click="sendEmail"
          v-if="['pending', 'overdue'].includes(invoice.status)"
        />
        <q-btn
          color="green"
          icon="payment"
          label="Mark as Paid"
          @click="markAsPaid"
          v-if="['pending', 'overdue'].includes(invoice.status)"
        />
        <q-btn
          color="orange"
          icon="edit"
          label="Edit"
          @click="editInvoice"
          v-if="invoice.status === 'draft'"
        />
        <q-btn
          flat
          icon="print"
          label="Print"
          @click="printInvoice"
        />
      </div>
    </div>

    <div class="row q-gutter-md" v-if="invoice">
      <!-- Invoice Details -->
      <div class="col-md-8 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Invoice Details</div>
            
            <!-- Status Badge -->
            <div class="q-mb-md">
              <q-badge
                :color="getStatusColor(invoice.status)"
                :label="invoice.status"
                class="text-capitalize text-h6"
              />
            </div>

            <!-- Invoice Info -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Invoice Number</q-item-label>
                      <q-item-label class="text-weight-medium">
                        #{{ invoice.invoice_number }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Issue Date</q-item-label>
                      <q-item-label>
                        {{ formatDate(invoice.issue_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Due Date</q-item-label>
                      <q-item-label>
                        {{ formatDate(invoice.due_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col" v-if="invoice.reservation">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Reservation</q-item-label>
                      <q-item-label class="text-weight-medium">
                        #{{ invoice.reservation.id }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Check-in</q-item-label>
                      <q-item-label>
                        {{ formatDate(invoice.reservation.check_in_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Check-out</q-item-label>
                      <q-item-label>
                        {{ formatDate(invoice.reservation.check_out_date) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Line Items -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Line Items</div>
              <q-table
                :rows="invoice.line_items || []"
                :columns="lineItemColumns"
                flat
                hide-pagination
                :rows-per-page-options="[0]"
              >
                <template v-slot:body-cell-total="props">
                  <q-td :props="props">
                    <div class="text-weight-medium">${{ props.value?.toFixed(2) }}</div>
                  </q-td>
                </template>
              </q-table>
            </div>

            <!-- Totals -->
            <div class="row justify-end">
              <div class="col-md-4 col-6">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Subtotal</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>${{ invoice.subtotal?.toFixed(2) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="invoice.discount_amount > 0">
                    <q-item-section>
                      <q-item-label>Discount</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-negative">
                        -${{ invoice.discount_amount?.toFixed(2) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Tax</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>${{ invoice.tax_amount?.toFixed(2) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-h6">Total</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-weight-bold text-h6">
                        ${{ invoice.total_amount?.toFixed(2) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="invoice.notes" class="q-mt-md">
              <div class="text-subtitle1 q-mb-sm">Notes</div>
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-body2">{{ invoice.notes }}</div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-md-4 col-12">
        <!-- Guest Information -->
        <q-card class="q-mb-md" v-if="invoice.guest">
          <q-card-section>
            <div class="text-h6 q-mb-md">Guest Information</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Name</q-item-label>
                  <q-item-label class="text-weight-medium">
                    {{ invoice.guest.first_name }} {{ invoice.guest.last_name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ invoice.guest.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="invoice.guest.phone">
                <q-item-section>
                  <q-item-label caption>Phone</q-item-label>
                  <q-item-label>{{ invoice.guest.phone }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Payment History -->
        <q-card v-if="invoice.payments && invoice.payments.length > 0">
          <q-card-section>
            <div class="text-h6 q-mb-md">Payment History</div>
            <q-list dense>
              <q-item v-for="payment in invoice.payments" :key="payment.id">
                <q-item-section>
                  <q-item-label>
                    ${{ payment.amount?.toFixed(2) }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ formatDate(payment.processed_at) }} - {{ payment.payment_method }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    :color="payment.status === 'completed' ? 'green' : 'orange'"
                    :label="payment.status"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Quick Actions -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="q-gutter-sm">
              <q-btn
                flat
                color="primary"
                icon="add"
                label="Add Line Item"
                @click="showAddLineItem = true"
                v-if="invoice.status === 'draft'"
                class="full-width"
              />
              <q-btn
                flat
                color="orange"
                icon="percent"
                label="Apply Discount"
                @click="showDiscountDialog = true"
                v-if="invoice.status === 'draft'"
                class="full-width"
              />
              <q-btn
                flat
                color="green"
                icon="check"
                label="Finalize Invoice"
                @click="finalizeInvoice"
                v-if="invoice.status === 'draft'"
                class="full-width"
              />
              <q-btn
                flat
                color="negative"
                icon="cancel"
                label="Cancel Invoice"
                @click="cancelInvoice"
                v-if="['draft', 'pending'].includes(invoice.status)"
                class="full-width"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-center" style="height: 400px">
      <q-spinner size="50px" color="primary" />
    </div>

    <!-- Add Line Item Dialog -->
    <q-dialog v-model="showAddLineItem" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Line Item</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newLineItem.description"
            label="Description"
            class="q-mb-md"
          />
          <q-select
            v-model="newLineItem.type"
            :options="lineItemTypes"
            label="Type"
            class="q-mb-md"
          />
          <div class="row q-gutter-md">
            <q-input
              v-model.number="newLineItem.quantity"
              label="Quantity"
              type="number"
              min="1"
              class="col"
            />
            <q-input
              v-model.number="newLineItem.unit_price"
              label="Unit Price"
              type="number"
              min="0"
              step="0.01"
              class="col"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showAddLineItem = false" />
          <q-btn
            color="primary"
            label="Add"
            @click="addLineItem"
            :loading="addingLineItem"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Discount Dialog -->
    <q-dialog v-model="showDiscountDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Apply Discount</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.number="discountAmount"
            label="Discount Amount"
            type="number"
            min="0"
            step="0.01"
            class="q-mb-md"
          />
          <q-input
            v-model="discountReason"
            label="Reason (optional)"
            type="textarea"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDiscountDialog = false" />
          <q-btn
            color="primary"
            label="Apply"
            @click="applyDiscount"
            :loading="applyingDiscount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const route = useRoute()
const $q = useQuasar()

// Data
const invoice = ref(null)
const loading = ref(false)
const showAddLineItem = ref(false)
const showDiscountDialog = ref(false)
const addingLineItem = ref(false)
const applyingDiscount = ref(false)

// Forms
const newLineItem = ref({
  description: '',
  type: 'service',
  quantity: 1,
  unit_price: 0
})

const discountAmount = ref(0)
const discountReason = ref('')

// Options
const lineItemTypes = [
  { label: 'Service', value: 'service' },
  { label: 'Fee', value: 'fee' },
  { label: 'Tax', value: 'tax' },
  { label: 'Other', value: 'other' }
]

// Table columns for line items
const lineItemColumns = [
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left'
  },
  {
    name: 'quantity',
    label: 'Qty',
    field: 'quantity',
    align: 'center'
  },
  {
    name: 'unit_price',
    label: 'Unit Price',
    field: 'unit_price',
    align: 'right',
    format: (val) => `$${val?.toFixed(2)}`
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total_price',
    align: 'right'
  }
]

// Methods
const loadInvoice = async () => {
  loading.value = true
  try {
    const response = await api.get(`/invoices/${route.params.id}`)
    invoice.value = response.data.data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load invoice'
    })
  } finally {
    loading.value = false
  }
}

const sendEmail = async () => {
  try {
    await api.post(`/invoices/${invoice.value.id}/send-email`)
    $q.notify({
      type: 'positive',
      message: 'Invoice email sent successfully'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to send invoice email'
    })
  }
}

const markAsPaid = async () => {
  $q.dialog({
    title: 'Mark as Paid',
    message: `Mark invoice #${invoice.value.invoice_number} as paid?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.post(`/invoices/${invoice.value.id}/mark-paid`)
      $q.notify({
        type: 'positive',
        message: 'Invoice marked as paid'
      })
      loadInvoice()
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to mark invoice as paid'
      })
    }
  })
}

const finalizeInvoice = async () => {
  try {
    await api.post(`/invoices/${invoice.value.id}/finalize`)
    $q.notify({
      type: 'positive',
      message: 'Invoice finalized successfully'
    })
    loadInvoice()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to finalize invoice'
    })
  }
}

const cancelInvoice = async () => {
  $q.dialog({
    title: 'Cancel Invoice',
    message: `Are you sure you want to cancel invoice #${invoice.value.invoice_number}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.post(`/invoices/${invoice.value.id}/cancel`)
      $q.notify({
        type: 'positive',
        message: 'Invoice cancelled successfully'
      })
      loadInvoice()
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to cancel invoice'
      })
    }
  })
}

const addLineItem = async () => {
  if (!newLineItem.value.description || !newLineItem.value.unit_price) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields'
    })
    return
  }

  addingLineItem.value = true
  try {
    await api.post(`/invoices/${invoice.value.id}/add-line-item`, newLineItem.value)
    
    $q.notify({
      type: 'positive',
      message: 'Line item added successfully'
    })
    
    showAddLineItem.value = false
    newLineItem.value = {
      description: '',
      type: 'service',
      quantity: 1,
      unit_price: 0
    }
    loadInvoice()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to add line item'
    })
  } finally {
    addingLineItem.value = false
  }
}

const applyDiscount = async () => {
  if (!discountAmount.value || discountAmount.value <= 0) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a valid discount amount'
    })
    return
  }

  applyingDiscount.value = true
  try {
    await api.put(`/invoices/${invoice.value.id}`, {
      discount_amount: discountAmount.value,
      discount_reason: discountReason.value
    })
    
    $q.notify({
      type: 'positive',
      message: 'Discount applied successfully'
    })
    
    showDiscountDialog.value = false
    discountAmount.value = 0
    discountReason.value = ''
    loadInvoice()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to apply discount'
    })
  } finally {
    applyingDiscount.value = false
  }
}

const editInvoice = () => {
  // Navigate to edit page
  console.log('Edit invoice')
}

const printInvoice = () => {
  // Implement print functionality
  window.print()
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    pending: 'orange',
    paid: 'green',
    overdue: 'red',
    cancelled: 'grey-6'
  }
  return colors[status] || 'grey'
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : ''
}

// Lifecycle
onMounted(() => {
  loadInvoice()
})
</script>