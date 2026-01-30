<template>
  <div class="ticket-list">
    <!-- Filters -->
    <q-card flat class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="localFilters.search"
              :placeholder="$t('support.searchTickets')"
              outlined
              dense
              clearable
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-magnify" />
              </template>
            </q-input>
          </div>
          
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="localFilters.status"
              :options="statusOptions"
              :placeholder="$t('support.status')"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="localFilters.priority"
              :options="priorityOptions"
              :placeholder="$t('support.priority')"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="localFilters.category"
              :options="categoryOptions"
              :placeholder="$t('support.category')"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="col-auto">
            <q-btn
              :label="$t('support.clearFilters')"
              color="grey-7"
              outline
              @click="clearFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tickets Table -->
    <q-table
      :rows="tickets"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      row-key="id"
      flat
      class="liquid-glass-table"
    >
      <template v-slot:body-cell-ticket_number="props">
        <q-td :props="props">
          <q-btn
            :label="formatTicketNumber(props.value)"
            color="primary"
            flat
            dense
            @click="$emit('view-ticket', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            :label="$t(`support.statuses.${props.value}`)"
            size="sm"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip
            :color="getPriorityColor(props.value)"
            text-color="white"
            :icon="getPriorityIcon(props.value)"
            :label="$t(`support.priorities.${props.value}`)"
            size="sm"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          {{ formatDate(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-sla_due_at="props">
        <q-td :props="props">
          <span
            :class="{
              'text-red': isOverdue(props.value),
              'text-orange': isNearDue(props.value)
            }"
          >
            {{ formatDate(props.value) }}
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              icon="mdi-eye"
              color="primary"
              flat
              dense
              @click="$emit('view-ticket', props.row)"
            >
              <q-tooltip>{{ $t('support.viewTicket') }}</q-tooltip>
            </q-btn>
            <q-btn
              icon="mdi-pencil"
              color="orange"
              flat
              dense
              @click="$emit('edit-ticket', props.row)"
            >
              <q-tooltip>{{ $t('support.editTicket') }}</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-7 q-gutter-sm">
          <q-icon size="2em" name="mdi-ticket-outline" />
          <span>{{ $t('support.noTickets') }}</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import supportService from 'src/services/supportService'

export default {
  name: 'TicketList',
  
  props: {
    tickets: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      })
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['request', 'filter-change', 'view-ticket', 'edit-ticket'],

  setup(props, { emit }) {
    const { t } = useI18n()
    
    const localFilters = ref({ ...props.filters })

    const columns = computed(() => [
      {
        name: 'ticket_number',
        label: t('support.ticketNumber'),
        field: 'ticket_number',
        align: 'left',
        sortable: true
      },
      {
        name: 'title',
        label: t('support.title'),
        field: 'title',
        align: 'left',
        sortable: true
      },
      {
        name: 'status',
        label: t('support.status'),
        field: 'status',
        align: 'center',
        sortable: true
      },
      {
        name: 'priority',
        label: t('support.priority'),
        field: 'priority',
        align: 'center',
        sortable: true
      },
      {
        name: 'category',
        label: t('support.category'),
        field: 'category',
        align: 'left',
        sortable: true
      },
      {
        name: 'created_at',
        label: t('support.createdAt'),
        field: 'created_at',
        align: 'left',
        sortable: true
      },
      {
        name: 'sla_due_at',
        label: t('support.slaDue'),
        field: 'sla_due_at',
        align: 'left',
        sortable: true
      },
      {
        name: 'actions',
        label: t('common.actions'),
        field: 'actions',
        align: 'center'
      }
    ])

    const statusOptions = computed(() => [
      { label: t('support.statuses.open'), value: 'open' },
      { label: t('support.statuses.in_progress'), value: 'in_progress' },
      { label: t('support.statuses.pending_customer'), value: 'pending_customer' },
      { label: t('support.statuses.resolved'), value: 'resolved' },
      { label: t('support.statuses.closed'), value: 'closed' }
    ])

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

    // Watch for prop changes
    watch(() => props.filters, (newFilters) => {
      localFilters.value = { ...newFilters }
    }, { deep: true })

    const onRequest = (requestProp) => {
      emit('request', requestProp)
    }

    const onFilterChange = () => {
      emit('filter-change', localFilters.value)
    }

    const clearFilters = () => {
      localFilters.value = {
        search: '',
        status: null,
        priority: null,
        category: null
      }
      onFilterChange()
    }

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
      return hoursDiff > 0 && hoursDiff <= 2 // Within 2 hours
    }

    return {
      localFilters,
      columns,
      statusOptions,
      priorityOptions,
      categoryOptions,
      onRequest,
      onFilterChange,
      clearFilters,
      formatTicketNumber,
      getStatusColor,
      getPriorityColor,
      getPriorityIcon,
      formatDate,
      isOverdue,
      isNearDue
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-list {
  .liquid-glass-table {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>