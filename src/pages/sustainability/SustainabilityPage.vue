<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <h4 class="q-ma-none text-weight-bold">Sustainability Dashboard</h4>
            <p class="text-grey-6 q-mb-none">Monitor environmental impact and sustainability goals</p>
          </div>
          <q-btn 
            color="positive" 
            icon="eco" 
            label="Generate ESG Report" 
            @click="generateESGReport"
            unelevated
          />
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="col-12 col-md-3">
        <q-card class="metric-card carbon-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-negative">{{ metrics.carbonFootprint }}</div>
                <div class="text-caption text-grey-6">CO₂ Emissions (kg)</div>
                <div class="text-caption" :class="metrics.carbonTrend > 0 ? 'text-negative' : 'text-positive'">
                  {{ metrics.carbonTrend > 0 ? '+' : '' }}{{ metrics.carbonTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="cloud" size="32px" color="negative" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="metric-card energy-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ metrics.energyConsumption }}</div>
                <div class="text-caption text-grey-6">Energy (kWh)</div>
                <div class="text-caption" :class="metrics.energyTrend > 0 ? 'text-negative' : 'text-positive'">
                  {{ metrics.energyTrend > 0 ? '+' : '' }}{{ metrics.energyTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="flash_on" size="32px" color="warning" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="metric-card water-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-info">{{ metrics.waterUsage }}</div>
                <div class="text-caption text-grey-6">Water (L)</div>
                <div class="text-caption" :class="metrics.waterTrend > 0 ? 'text-negative' : 'text-positive'">
                  {{ metrics.waterTrend > 0 ? '+' : '' }}{{ metrics.waterTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="water_drop" size="32px" color="info" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="metric-card waste-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-brown">{{ metrics.wasteGenerated }}</div>
                <div class="text-caption text-grey-6">Waste (kg)</div>
                <div class="text-caption" :class="metrics.wasteTrend > 0 ? 'text-negative' : 'text-positive'">
                  {{ metrics.wasteTrend > 0 ? '+' : '' }}{{ metrics.wasteTrend }}% vs last month
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="delete" size="32px" color="brown" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Main Content Tabs -->
      <div class="col-12">
        <q-card>
          <q-tabs v-model="activeTab" class="text-grey-6" active-color="primary" indicator-color="primary">
            <q-tab name="overview" label="Overview" icon="dashboard" />
            <q-tab name="carbon" label="Carbon Footprint" icon="cloud" />
            <q-tab name="energy" label="Energy" icon="flash_on" />
            <q-tab name="water" label="Water" icon="water_drop" />
            <q-tab name="waste" label="Waste" icon="delete" />
            <q-tab name="goals" label="Goals" icon="flag" />
            <q-tab name="reports" label="ESG Reports" icon="assessment" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Overview Tab -->
            <q-tab-panel name="overview">
              <div class="row q-gutter-md">
                <!-- Sustainability Score -->
                <div class="col-12 col-md-6">
                  <q-card class="sustainability-score-card">
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Sustainability Score</div>
                      <div class="text-center">
                        <q-circular-progress
                          :value="sustainabilityScore"
                          size="120px"
                          :thickness="0.15"
                          color="positive"
                          track-color="grey-3"
                          class="q-ma-md"
                        >
                          <div class="text-h4 text-weight-bold text-positive">{{ sustainabilityScore }}</div>
                        </q-circular-progress>
                        <div class="text-subtitle2 text-grey-6">Out of 100</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Recent Activities -->
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Recent Activities</div>
                      <q-list>
                        <q-item v-for="activity in recentActivities" :key="activity.id">
                          <q-item-section avatar>
                            <q-icon :name="activity.icon" :color="activity.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ activity.title }}</q-item-label>
                            <q-item-label caption>{{ activity.description }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-item-label caption>{{ activity.date }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Monthly Trends Chart -->
                <div class="col-12">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Monthly Trends</div>
                      <div class="chart-placeholder">
                        <div class="text-center text-grey-6 q-pa-xl">
                          <q-icon name="show_chart" size="64px" />
                          <div class="q-mt-md">Chart visualization would be displayed here</div>
                          <div class="text-caption">Integration with Chart.js or similar library needed</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Carbon Footprint Tab -->
            <q-tab-panel name="carbon">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Carbon Footprint Tracking</div>
                  <q-table
                    :rows="carbonFootprints"
                    :columns="carbonColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-emission_factor="props">
                      <q-td :props="props">
                        {{ props.value }} kg CO₂
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>

            <!-- Energy Tab -->
            <q-tab-panel name="energy">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Energy Consumption</div>
                  <q-table
                    :rows="energyConsumptions"
                    :columns="energyColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  />
                </div>
                
                <!-- Energy Efficiency Recommendations -->
                <div class="col-12">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Energy Efficiency Recommendations</div>
                      <q-list>
                        <q-item v-for="recommendation in energyRecommendations" :key="recommendation.id">
                          <q-item-section avatar>
                            <q-icon name="lightbulb" color="warning" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ recommendation.title }}</q-item-label>
                            <q-item-label caption>{{ recommendation.description }}</q-item-label>
                            <q-item-label caption>
                              Potential savings: {{ recommendation.potential_savings }} kWh/month
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-chip 
                              :color="getPriorityColor(recommendation.priority)" 
                              text-color="white" 
                              size="sm"
                            >
                              {{ recommendation.priority }}
                            </q-chip>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Water Tab -->
            <q-tab-panel name="water">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Water Usage Tracking</div>
                  <q-table
                    :rows="waterUsages"
                    :columns="waterColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  />
                </div>
                
                <!-- Water Quality Metrics -->
                <div class="col-12">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6 q-mb-md">Water Quality Metrics</div>
                      <div class="row q-gutter-md">
                        <div class="col-12 col-md-4" v-for="metric in waterQualityMetrics" :key="metric.id">
                          <q-card class="water-quality-card">
                            <q-card-section>
                              <div class="text-subtitle1">{{ metric.parameter_name }}</div>
                              <div class="text-h5 text-weight-bold">{{ metric.value }} {{ metric.unit }}</div>
                              <div class="text-caption text-grey-6">
                                Standard: {{ metric.standard_range }}
                              </div>
                              <q-chip 
                                :color="metric.is_within_standard ? 'positive' : 'negative'" 
                                text-color="white" 
                                size="sm" 
                                class="q-mt-sm"
                              >
                                {{ metric.is_within_standard ? 'Within Standard' : 'Out of Range' }}
                              </q-chip>
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Waste Tab -->
            <q-tab-panel name="waste">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">Waste Tracking</div>
                  <q-table
                    :rows="wasteTrackings"
                    :columns="wasteColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-recycled="props">
                      <q-td :props="props">
                        <q-chip 
                          :color="props.value ? 'positive' : 'negative'" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ props.value ? 'Yes' : 'No' }}
                        </q-chip>
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>

            <!-- Goals Tab -->
            <q-tab-panel name="goals">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">Sustainability Goals</div>
                    <q-btn 
                      color="primary" 
                      icon="add" 
                      label="New Goal" 
                      @click="showCreateGoalDialog = true"
                      unelevated
                    />
                  </div>
                  
                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6" v-for="goal in sustainabilityGoals" :key="goal.id">
                      <q-card class="goal-card">
                        <q-card-section>
                          <div class="row items-center justify-between">
                            <div class="text-subtitle1 text-weight-bold">{{ goal.title }}</div>
                            <q-chip 
                              :color="getGoalStatusColor(goal.status)" 
                              text-color="white" 
                              size="sm"
                            >
                              {{ goal.status }}
                            </q-chip>
                          </div>
                          <div class="text-body2 text-grey-6 q-mt-sm">{{ goal.description }}</div>
                          
                          <div class="q-mt-md">
                            <div class="text-caption text-grey-6">Progress</div>
                            <q-linear-progress 
                              :value="goal.current_value / goal.target_value" 
                              color="primary" 
                              size="8px" 
                              class="q-mt-xs"
                            />
                            <div class="text-caption q-mt-xs">
                              {{ goal.current_value }} / {{ goal.target_value }} {{ goal.unit }}
                            </div>
                          </div>
                          
                          <div class="text-caption text-grey-6 q-mt-sm">
                            Target Date: {{ formatDate(goal.target_date) }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ESG Reports Tab -->
            <q-tab-panel name="reports">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-h6 q-mb-md">ESG Reports</div>
                  <q-table
                    :rows="esgReports"
                    :columns="reportColumns"
                    row-key="id"
                    :loading="loading"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn flat round icon="download" size="sm" @click="downloadReport(props.row)" />
                        <q-btn flat round icon="visibility" size="sm" @click="viewReport(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Create Goal Dialog -->
    <q-dialog v-model="showCreateGoalDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Create Sustainability Goal</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="createGoal">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input v-model="newGoal.title" label="Goal Title" outlined required />
              </div>
              <div class="col-12">
                <q-input v-model="newGoal.description" label="Description" type="textarea" outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newGoal.target_value" label="Target Value" type="number" outlined required />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newGoal.unit" label="Unit" outlined required />
              </div>
              <div class="col-12">
                <q-input v-model="newGoal.target_date" label="Target Date" type="date" outlined required />
              </div>
            </div>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateGoalDialog = false" />
          <q-btn color="primary" label="Create" @click="createGoal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { sustainabilityService } from '../../services/sustainabilityService'

export default {
  name: 'SustainabilityPage',
  
  setup() {
    const $q = useQuasar()
    
    const loading = ref(false)
    const activeTab = ref('overview')
    const showCreateGoalDialog = ref(false)
    
    const metrics = ref({
      carbonFootprint: '2,450',
      carbonTrend: -5.2,
      energyConsumption: '15,680',
      energyTrend: -2.1,
      waterUsage: '45,230',
      waterTrend: -8.5,
      wasteGenerated: '890',
      wasteTrend: -12.3
    })
    
    const sustainabilityScore = ref(78)
    
    const recentActivities = ref([
      {
        id: 1,
        title: 'Energy Audit Completed',
        description: 'Monthly energy consumption review',
        date: '2 hours ago',
        icon: 'flash_on',
        color: 'warning'
      },
      {
        id: 2,
        title: 'Water Usage Optimized',
        description: 'Implemented water-saving measures',
        date: '1 day ago',
        icon: 'water_drop',
        color: 'info'
      },
      {
        id: 3,
        title: 'Waste Recycling Goal Met',
        description: '85% recycling rate achieved',
        date: '3 days ago',
        icon: 'recycling',
        color: 'positive'
      }
    ])
    
    const carbonFootprints = ref([])
    const energyConsumptions = ref([])
    const waterUsages = ref([])
    const wasteTrackings = ref([])
    const sustainabilityGoals = ref([])
    const esgReports = ref([])
    const energyRecommendations = ref([])
    const waterQualityMetrics = ref([])
    
    const newGoal = ref({
      title: '',
      description: '',
      target_value: null,
      unit: '',
      target_date: ''
    })
    
    // Table columns
    const carbonColumns = [
      { name: 'source', label: 'Source', field: 'source', align: 'left' },
      { name: 'activity_type', label: 'Activity Type', field: 'activity_type', align: 'left' },
      { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
      { name: 'emission_factor', label: 'Emissions', field: 'emission_factor', align: 'right' },
      { name: 'recorded_at', label: 'Date', field: 'recorded_at', align: 'left' }
    ]
    
    const energyColumns = [
      { name: 'source', label: 'Source', field: 'source', align: 'left' },
      { name: 'consumption_kwh', label: 'Consumption (kWh)', field: 'consumption_kwh', align: 'right' },
      { name: 'cost', label: 'Cost', field: 'cost', align: 'right' },
      { name: 'recorded_at', label: 'Date', field: 'recorded_at', align: 'left' }
    ]
    
    const waterColumns = [
      { name: 'source', label: 'Source', field: 'source', align: 'left' },
      { name: 'usage_liters', label: 'Usage (L)', field: 'usage_liters', align: 'right' },
      { name: 'cost', label: 'Cost', field: 'cost', align: 'right' },
      { name: 'recorded_at', label: 'Date', field: 'recorded_at', align: 'left' }
    ]
    
    const wasteColumns = [
      { name: 'waste_type', label: 'Type', field: 'waste_type', align: 'left' },
      { name: 'quantity_kg', label: 'Quantity (kg)', field: 'quantity_kg', align: 'right' },
      { name: 'recycled', label: 'Recycled', field: 'recycled', align: 'center' },
      { name: 'disposal_method', label: 'Disposal Method', field: 'disposal_method', align: 'left' },
      { name: 'recorded_at', label: 'Date', field: 'recorded_at', align: 'left' }
    ]
    
    const reportColumns = [
      { name: 'report_type', label: 'Type', field: 'report_type', align: 'left' },
      { name: 'period_start', label: 'Period Start', field: 'period_start', align: 'left' },
      { name: 'period_end', label: 'Period End', field: 'period_end', align: 'left' },
      { name: 'generated_at', label: 'Generated', field: 'generated_at', align: 'left' },
      { name: 'actions', label: 'Actions', field: '', align: 'center' }
    ]
    
    function getPriorityColor(priority) {
      const colors = {
        'high': 'negative',
        'medium': 'warning',
        'low': 'info'
      }
      return colors[priority] || 'grey'
    }
    
    function getGoalStatusColor(status) {
      const colors = {
        'active': 'primary',
        'completed': 'positive',
        'overdue': 'negative',
        'paused': 'grey'
      }
      return colors[status] || 'grey'
    }
    
    function formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
    
    async function loadData() {
      loading.value = true
      try {
        const [
          carbonData,
          energyData,
          waterData,
          wasteData,
          goalsData,
          reportsData,
          recommendationsData,
          qualityData
        ] = await Promise.all([
          sustainabilityService.getCarbonFootprints(),
          sustainabilityService.getEnergyConsumptions(),
          sustainabilityService.getWaterUsages(),
          sustainabilityService.getWasteTrackings(),
          sustainabilityService.getSustainabilityGoals(),
          sustainabilityService.getESGReports(),
          sustainabilityService.getEnergyRecommendations(),
          sustainabilityService.getWaterQualityMetrics()
        ])
        
        carbonFootprints.value = carbonData.data || []
        energyConsumptions.value = energyData.data || []
        waterUsages.value = waterData.data || []
        wasteTrackings.value = wasteData.data || []
        sustainabilityGoals.value = goalsData.data || []
        esgReports.value = reportsData.data || []
        energyRecommendations.value = recommendationsData.data || []
        waterQualityMetrics.value = qualityData.data || []
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load sustainability data'
        })
      } finally {
        loading.value = false
      }
    }
    
    async function createGoal() {
      try {
        await sustainabilityService.createSustainabilityGoal(newGoal.value)
        $q.notify({
          type: 'positive',
          message: 'Goal created successfully'
        })
        showCreateGoalDialog.value = false
        newGoal.value = { title: '', description: '', target_value: null, unit: '', target_date: '' }
        loadData()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to create goal'
        })
      }
    }
    
    async function generateESGReport() {
      try {
        await sustainabilityService.generateESGReport()
        $q.notify({
          type: 'positive',
          message: 'ESG report generation started'
        })
        loadData()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to generate ESG report'
        })
      }
    }
    
    function downloadReport(report) {
      // TODO: Implement download functionality
      $q.notify({
        type: 'info',
        message: 'Download functionality coming soon'
      })
    }
    
    function viewReport(report) {
      // TODO: Implement view functionality
      $q.notify({
        type: 'info',
        message: 'View functionality coming soon'
      })
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      loading,
      activeTab,
      showCreateGoalDialog,
      metrics,
      sustainabilityScore,
      recentActivities,
      carbonFootprints,
      energyConsumptions,
      waterUsages,
      wasteTrackings,
      sustainabilityGoals,
      esgReports,
      energyRecommendations,
      waterQualityMetrics,
      newGoal,
      carbonColumns,
      energyColumns,
      waterColumns,
      wasteColumns,
      reportColumns,
      getPriorityColor,
      getGoalStatusColor,
      formatDate,
      createGoal,
      generateESGReport,
      downloadReport,
      viewReport
    }
  }
}
</script>

<style scoped>
.metric-card {
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.sustainability-score-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
}

.goal-card {
  transition: transform 0.2s;
}

.goal-card:hover {
  transform: translateY(-2px);
}

.water-quality-card {
  transition: transform 0.2s;
}

.water-quality-card:hover {
  transform: translateY(-2px);
}

.chart-placeholder {
  min-height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
</style>