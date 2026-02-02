<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <h4 class="q-ma-none text-weight-bold">Advanced Analytics</h4>
            <p class="text-grey-6 q-mb-none">Real-time KPIs, custom reports, and performance insights</p>
          </div>
          <div class="row q-gutter-sm">
            <q-btn 
              color="primary" 
              icon="add" 
              label="Custom Report" 
              @click="showCreateReportDialog = true"
              unelevated
            />
            <q-btn 
              color="secondary" 
              icon="schedule" 
              label="Schedule Report" 
              @click="showScheduleDialog = true"
              unelevated
            />
          </div>
        </div>
      </div>

      <!-- Real-time KPI Cards -->
      <div class="col-12 col-md-3">
        <q-card class="kpi-card revenue-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">${{ kpis.revenue }}</div>
                <div class="text-caption text-grey-6">Total Revenue</div>
                <div class="text-caption" :class="kpis.revenueTrend > 0 ? 'text-positive' : 'text-negative'">
                  {{ kpis.revenueTrend > 0 ? '+' : '' }}{{ kpis.revenueTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="attach_money" size="32px" color="positive" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="kpi-card occupancy-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ kpis.occupancy }}%</div>
                <div class="text-caption text-grey-6">Occupancy Rate</div>
                <div class="text-caption" :class="kpis.occupancyTrend > 0 ? 'text-positive' : 'text-negative'">
                  {{ kpis.occupancyTrend > 0 ? '+' : '' }}{{ kpis.occupancyTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="hotel" size="32px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="kpi-card adr-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-info">${{ kpis.adr }}</div>
                <div class="text-caption text-grey-6">Average Daily Rate</div>
                <div class="text-caption" :class="kpis.adrTrend > 0 ? 'text-positive' : 'text-negative'">
                  {{ kpis.adrTrend > 0 ? '+' : '' }}{{ kpis.adrTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="trending_up" size="32px" color="info" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="kpi-card satisfaction-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ kpis.satisfaction }}</div>
                <div class="text-caption text-grey-6">Guest Satisfaction</div>
                <div class="text-caption" :class="kpis.satisfactionTrend > 0 ? 'text-positive' : 'text-negative'">
                  {{ kpis.satisfactionTrend > 0 ? '+' : '' }}{{ kpis.satisfactionTrend }} vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="sentiment_satisfied" size="32px" color="warning" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Main Analytics Content -->
      <div class="col-12">
        <q-card>
          <q-tabs v-model="activeTab" class="text-grey-6" active-color="primary" indicator-color="primary">
            <q-tab name="dashboard" label="Dashboard" icon="dashboard" />
            <q-tab name="reports" label="Custom Reports" icon="assessment" />
            <q-tab name="scheduled" label="Scheduled Reports" icon="schedule" />
            <q-tab name="templates" label="Report Templates" icon="description" />
            <q-tab name="performance" label="Performance Metrics" icon="speed" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Dashboard Tab -->
            <q-tab-panel name="dashboard">
              <div class="row q-gutter-md">
                <!-- Revenue Chart -->
                <div class="col-12 col-md-8">
                  <q-card class="chart-card">
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Revenue Trends</div>
                      <div class="chart-placeholder">
                        <div class="text-center text-grey-6 q-pa-xl">
                          <q-icon name="show_chart" size="64px" />
                          <div class="q-mt-md">Revenue chart visualization</div>
                          <div class="text-caption">Integration with Chart.js needed</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Top Metrics -->
                <div class="col-12 col-md-4">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Top Performing Metrics</div>
                      <q-list>
                        <q-item v-for="metric in topMetrics" :key="metric.name">
                          <q-item-section avatar>
                            <q-icon :name="metric.icon" :color="metric.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ metric.name }}</q-item-label>
                            <q-item-label caption>{{ metric.value }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-chip 
                              :color="metric.trend > 0 ? 'positive' : 'negative'" 
                              text-color="white" 
                              size="sm"
                            >
                              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
                            </q-chip>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Occupancy Heatmap -->
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Occupancy Heatmap</div>
                      <div class="chart-placeholder" style="height: 250px;">
                        <div class="text-center text-grey-6 q-pa-xl">
                          <q-icon name="grid_view" size="48px" />
                          <div class="q-mt-md">Occupancy heatmap</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Performance Alerts -->
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Performance Alerts</div>
                      <q-list>
                        <q-item v-for="alert in performanceAlerts" :key="alert.id">
                          <q-item-section avatar>
                            <q-icon 
                              :name="alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'" 
                              :color="alert.severity === 'high' ? 'negative' : alert.severity === 'medium' ? 'warning' : 'info'" 
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ alert.title }}</q-item-label>
                            <q-item-label caption>{{ alert.description }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-item-label caption>{{ alert.time }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Custom Reports Tab -->
            <q-tab-panel name="reports">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">Custom Reports</div>
                    <q-input 
                      v-model="reportSearch" 
                      placeholder="Search reports..." 
                      outlined 
                      dense 
                      style="width: 300px"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  
                  <q-table
                    :rows="filteredCustomReports"
                    :columns="reportColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-chip 
                          :color="getReportStatusColor(props.value)" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ props.value }}
                        </q-chip>
                      </q-td>
                    </template>
                    
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn flat round icon="play_arrow" size="sm" @click="runReport(props.row)" />
                        <q-btn flat round icon="edit" size="sm" @click="editReport(props.row)" />
                        <q-btn flat round icon="download" size="sm" @click="downloadReport(props.row)" />
                        <q-btn flat round icon="delete" size="sm" @click="deleteReport(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>

            <!-- Scheduled Reports Tab -->
            <q-tab-panel name="scheduled">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Scheduled Reports</div>
                  <q-table
                    :rows="scheduledReports"
                    :columns="scheduledColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-chip 
                          :color="props.value === 'active' ? 'positive' : 'grey'" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ props.value }}
                        </q-chip>
                      </q-td>
                    </template>
                    
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn 
                          flat 
                          round 
                          :icon="props.row.status === 'active' ? 'pause' : 'play_arrow'" 
                          size="sm" 
                          @click="toggleScheduledReport(props.row)" 
                        />
                        <q-btn flat round icon="edit" size="sm" @click="editScheduledReport(props.row)" />
                        <q-btn flat round icon="delete" size="sm" @click="deleteScheduledReport(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>

            <!-- Report Templates Tab -->
            <q-tab-panel name="templates">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Report Templates</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-4" v-for="template in reportTemplates" :key="template.id">
                      <q-card class="template-card">
                        <q-card-section>
                          <div class="row items-center">
                            <div class="col">
                              <div class="text-subtitle1 text-weight-bold">{{ template.name }}</div>
                              <div class="text-caption text-grey-6">{{ template.description }}</div>
                            </div>
                            <div class="col-auto">
                              <q-icon :name="template.icon" size="24px" :color="template.color" />
                            </div>
                          </div>
                          <div class="q-mt-md">
                            <q-chip 
                              v-for="tag in template.tags" 
                              :key="tag" 
                              size="sm" 
                              color="grey-3" 
                              text-color="grey-8" 
                              class="q-mr-xs"
                            >
                              {{ tag }}
                            </q-chip>
                          </div>
                        </q-card-section>
                        <q-card-actions>
                          <q-btn flat color="primary" @click="useTemplate(template)">Use Template</q-btn>
                          <q-btn flat color="grey-6" @click="previewTemplate(template)">Preview</q-btn>
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Performance Metrics Tab -->
            <q-tab-panel name="performance">
              <div class="row q-gutter-md">
                <!-- Performance Overview -->
                <div class="col-12">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Performance Metrics Tracking</div>
                      <div class="row q-gutter-md">
                        <div class="col-12 col-md-3" v-for="metric in performanceMetrics" :key="metric.name">
                          <div class="performance-metric-card">
                            <div class="text-h5 text-weight-bold" :class="`text-${metric.color}`">
                              {{ metric.value }}{{ metric.unit }}
                            </div>
                            <div class="text-subtitle2">{{ metric.name }}</div>
                            <div class="text-caption text-grey-6">{{ metric.description }}</div>
                            <q-linear-progress 
                              :value="metric.progress / 100" 
                              :color="metric.color" 
                              size="4px" 
                              class="q-mt-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Data Aggregation Status -->
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Data Aggregation Status</div>
                      <q-list>
                        <q-item v-for="source in dataSources" :key="source.name">
                          <q-item-section avatar>
                            <q-icon 
                              :name="source.status === 'connected' ? 'check_circle' : 'error'" 
                              :color="source.status === 'connected' ? 'positive' : 'negative'" 
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ source.name }}</q-item-label>
                            <q-item-label caption>Last sync: {{ source.lastSync }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-btn 
                              flat 
                              round 
                              icon="refresh" 
                              size="sm" 
                              @click="refreshDataSource(source)" 
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Real-time KPI Updates -->
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Real-time KPI Updates</div>
                      <q-list>
                        <q-item v-for="update in realtimeUpdates" :key="update.id">
                          <q-item-section avatar>
                            <q-avatar :color="update.type === 'increase' ? 'positive' : 'negative'" text-color="white" size="sm">
                              <q-icon :name="update.type === 'increase' ? 'trending_up' : 'trending_down'" />
                            </q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ update.metric }}</q-item-label>
                            <q-item-label caption>{{ update.change }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-item-label caption>{{ update.time }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Create Report Dialog -->
    <q-dialog v-model="showCreateReportDialog">
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Create Custom Report</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="createCustomReport">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input v-model="newReport.name" label="Report Name" outlined required />
              </div>
              <div class="col-12">
                <q-input v-model="newReport.description" label="Description" type="textarea" outlined />
              </div>
              <div class="col-12">
                <q-select 
                  v-model="newReport.template_id" 
                  :options="reportTemplates" 
                  option-value="id" 
                  option-label="name" 
                  label="Template" 
                  outlined 
                />
              </div>
              <div class="col-12">
                <q-input v-model="newReport.parameters" label="Parameters (JSON)" type="textarea" outlined />
              </div>
            </div>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateReportDialog = false" />
          <q-btn color="primary" label="Create" @click="createCustomReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Schedule Report Dialog -->
    <q-dialog v-model="showScheduleDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Schedule Report</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="scheduleReport">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-select 
                  v-model="newSchedule.report_id" 
                  :options="customReports" 
                  option-value="id" 
                  option-label="name" 
                  label="Report" 
                  outlined 
                  required 
                />
              </div>
              <div class="col-12">
                <q-select 
                  v-model="newSchedule.frequency" 
                  :options="frequencyOptions" 
                  label="Frequency" 
                  outlined 
                  required 
                />
              </div>
              <div class="col-12">
                <q-input v-model="newSchedule.recipients" label="Recipients (comma separated)" outlined required />
              </div>
            </div>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showScheduleDialog = false" />
          <q-btn color="primary" label="Schedule" @click="scheduleReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { analyticsService } from '../../services/analyticsService'

export default {
  name: 'AnalyticsPage',
  
  setup() {
    const $q = useQuasar()
    
    const loading = ref(false)
    const activeTab = ref('dashboard')
    const reportSearch = ref('')
    const showCreateReportDialog = ref(false)
    const showScheduleDialog = ref(false)
    
    const kpis = ref({
      revenue: '125,430',
      revenueTrend: 8.5,
      occupancy: 78,
      occupancyTrend: 3.2,
      adr: 185,
      adrTrend: 5.1,
      satisfaction: 4.6,
      satisfactionTrend: 0.2
    })
    
    const topMetrics = ref([
      { name: 'RevPAR', value: '$144.30', trend: 12.5, icon: 'trending_up', color: 'positive' },
      { name: 'ADR', value: '$185.00', trend: 5.1, icon: 'attach_money', color: 'info' },
      { name: 'Occupancy', value: '78%', trend: 3.2, icon: 'hotel', color: 'primary' },
      { name: 'Guest Score', value: '4.6/5', trend: 4.3, icon: 'star', color: 'warning' }
    ])
    
    const performanceAlerts = ref([
      {
        id: 1,
        title: 'Low Occupancy Alert',
        description: 'Occupancy dropped below 70% threshold',
        severity: 'high',
        time: '5 min ago'
      },
      {
        id: 2,
        title: 'Revenue Target',
        description: 'Monthly revenue target 85% achieved',
        severity: 'medium',
        time: '1 hour ago'
      },
      {
        id: 3,
        title: 'Guest Satisfaction',
        description: 'Average rating improved to 4.6',
        severity: 'low',
        time: '2 hours ago'
      }
    ])
    
    const customReports = ref([])
    const scheduledReports = ref([])
    const reportTemplates = ref([])
    const performanceMetrics = ref([])
    const dataSources = ref([])
    const realtimeUpdates = ref([])
    
    const newReport = ref({
      name: '',
      description: '',
      template_id: null,
      parameters: '{}'
    })
    
    const newSchedule = ref({
      report_id: null,
      frequency: '',
      recipients: ''
    })
    
    const frequencyOptions = [
      'daily',
      'weekly',
      'monthly',
      'quarterly'
    ]
    
    // Table columns
    const reportColumns = [
      { name: 'name', label: 'Report Name', field: 'name', align: 'left' },
      { name: 'description', label: 'Description', field: 'description', align: 'left' },
      { name: 'template', label: 'Template', field: row => row.template?.name || 'Custom', align: 'left' },
      { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: '', align: 'center' }
    ]
    
    const scheduledColumns = [
      { name: 'report_name', label: 'Report', field: row => row.report?.name || 'N/A', align: 'left' },
      { name: 'frequency', label: 'Frequency', field: 'frequency', align: 'left' },
      { name: 'recipients', label: 'Recipients', field: 'recipients', align: 'left' },
      { name: 'next_run', label: 'Next Run', field: 'next_run', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'actions', label: 'Actions', field: '', align: 'center' }
    ]
    
    const filteredCustomReports = computed(() => {
      if (!reportSearch.value) return customReports.value
      return customReports.value.filter(report => 
        report.name.toLowerCase().includes(reportSearch.value.toLowerCase())
      )
    })
    
    function getReportStatusColor(status) {
      const colors = {
        'draft': 'grey',
        'active': 'positive',
        'running': 'warning',
        'completed': 'info',
        'failed': 'negative'
      }
      return colors[status] || 'grey'
    }
    
    async function loadData() {
      loading.value = true
      try {
        const [
          reportsData,
          scheduledData,
          templatesData,
          metricsData
        ] = await Promise.all([
          analyticsService.getCustomReports(),
          analyticsService.getScheduledReports(),
          analyticsService.getReportTemplates(),
          analyticsService.getPerformanceMetrics()
        ])
        
        customReports.value = reportsData.data || []
        scheduledReports.value = scheduledData.data || []
        reportTemplates.value = templatesData.data || []
        performanceMetrics.value = metricsData.data || []
        
        // Mock data for demo
        dataSources.value = [
          { name: 'PMS Database', status: 'connected', lastSync: '2 min ago' },
          { name: 'Payment Gateway', status: 'connected', lastSync: '5 min ago' },
          { name: 'Channel Manager', status: 'error', lastSync: '1 hour ago' },
          { name: 'Guest Feedback', status: 'connected', lastSync: '10 min ago' }
        ]
        
        realtimeUpdates.value = [
          { id: 1, metric: 'Revenue', change: '+$2,450', type: 'increase', time: '1 min ago' },
          { id: 2, metric: 'Occupancy', change: '+2.3%', type: 'increase', time: '3 min ago' },
          { id: 3, metric: 'Cancellations', change: '+3', type: 'decrease', time: '5 min ago' }
        ]
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to load analytics data'
        })
      } finally {
        loading.value = false
      }
    }
    
    async function createCustomReport() {
      try {
        await analyticsService.createCustomReport(newReport.value)
        $q.notify({
          type: 'positive',
          message: 'Report created successfully'
        })
        showCreateReportDialog.value = false
        newReport.value = { name: '', description: '', template_id: null, parameters: '{}' }
        loadData()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to create report'
        })
      }
    }
    
    async function scheduleReport() {
      try {
        await analyticsService.createScheduledReport(newSchedule.value)
        $q.notify({
          type: 'positive',
          message: 'Report scheduled successfully'
        })
        showScheduleDialog.value = false
        newSchedule.value = { report_id: null, frequency: '', recipients: '' }
        loadData()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to schedule report'
        })
      }
    }
    
    function runReport() {
      $q.notify({
        type: 'info',
        message: 'Running report...'
      })
    }
    
    function editReport() {
      $q.notify({
        type: 'info',
        message: 'Edit functionality coming soon'
      })
    }
    
    function downloadReport() {
      $q.notify({
        type: 'info',
        message: 'Download functionality coming soon'
      })
    }
    
    function deleteReport() {
      $q.notify({
        type: 'info',
        message: 'Delete functionality coming soon'
      })
    }
    
    function toggleScheduledReport(report) {
      $q.notify({
        type: 'info',
        message: `${report.status === 'active' ? 'Pausing' : 'Activating'} scheduled report`
      })
    }
    
    function editScheduledReport() {
      $q.notify({
        type: 'info',
        message: 'Edit functionality coming soon'
      })
    }
    
    function deleteScheduledReport() {
      $q.notify({
        type: 'info',
        message: 'Delete functionality coming soon'
      })
    }
    
    function useTemplate(template) {
      newReport.value.template_id = template.id
      showCreateReportDialog.value = true
    }
    
    function previewTemplate() {
      $q.notify({
        type: 'info',
        message: 'Preview functionality coming soon'
      })
    }
    
    function refreshDataSource(source) {
      $q.notify({
        type: 'info',
        message: `Refreshing ${source.name}...`
      })
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      loading,
      activeTab,
      reportSearch,
      showCreateReportDialog,
      showScheduleDialog,
      kpis,
      topMetrics,
      performanceAlerts,
      customReports,
      scheduledReports,
      reportTemplates,
      performanceMetrics,
      dataSources,
      realtimeUpdates,
      newReport,
      newSchedule,
      frequencyOptions,
      reportColumns,
      scheduledColumns,
      filteredCustomReports,
      getReportStatusColor,
      createCustomReport,
      scheduleReport,
      runReport,
      editReport,
      downloadReport,
      deleteReport,
      toggleScheduledReport,
      editScheduledReport,
      deleteScheduledReport,
      useTemplate,
      previewTemplate,
      refreshDataSource
    }
  }
}
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.chart-card {
  min-height: 400px;
}

.chart-placeholder {
  min-height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}

.template-card {
  transition: transform 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
}

.performance-metric-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: transform 0.2s;
}

.performance-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>