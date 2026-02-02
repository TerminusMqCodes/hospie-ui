<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h4">Custom Report Builder</div>
          <div class="text-subtitle2 text-grey-7">Create and manage custom reports</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="New Template" @click="showTemplateDialog = true" />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Templates List -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Report Templates</div>
              <q-list separator>
                <q-item 
                  v-for="template in templates" 
                  :key="template.id"
                  clickable
                  @click="selectTemplate(template)"
                  :active="selectedTemplate?.id === template.id"
                >
                  <q-item-section>
                    <q-item-label>{{ template.name }}</q-item-label>
                    <q-item-label caption>{{ template.description }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn flat dense icon="edit" color="primary" @click.stop="editTemplate(template)" />
                      <q-btn flat dense icon="delete" color="negative" @click.stop="deleteTemplate(template.id)" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Report Builder -->
        <div class="col-12 col-md-8">
          <q-card flat bordered v-if="selectedTemplate">
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ selectedTemplate.name }}</div>
              
              <!-- Data Source -->
              <q-select
                v-model="reportConfig.data_source"
                :options="dataSources"
                label="Data Source"
                outlined
                dense
                class="q-mb-md"
              />

              <!-- Fields Selection -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Select Fields</div>
                <q-select
                  v-model="reportConfig.fields"
                  :options="availableFields"
                  label="Fields"
                  outlined
                  dense
                  multiple
                  use-chips
                />
              </div>

              <!-- Filters -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Filters</div>
                <q-list bordered separator>
                  <q-item v-for="(filter, index) in reportConfig.filters" :key="index">
                    <q-item-section>
                      <q-select
                        v-model="filter.field"
                        :options="availableFields"
                        label="Field"
                        dense
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-select
                        v-model="filter.operator"
                        :options="['=', '!=', '>', '<', '>=', '<=', 'like', 'in']"
                        label="Operator"
                        dense
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-input
                        v-model="filter.value"
                        label="Value"
                        dense
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense icon="delete" color="negative" @click="removeFilter(index)" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-btn flat color="primary" icon="add" label="Add Filter" @click="addFilter" class="q-mt-sm" />
              </div>

              <!-- Grouping -->
              <q-select
                v-model="reportConfig.group_by"
                :options="availableFields"
                label="Group By"
                outlined
                dense
                multiple
                use-chips
                class="q-mb-md"
              />

              <!-- Sorting -->
              <q-select
                v-model="reportConfig.order_by"
                :options="availableFields"
                label="Order By"
                outlined
                dense
                class="q-mb-md"
              />

              <!-- Actions -->
              <div class="row q-gutter-sm">
                <q-btn color="primary" label="Preview" @click="previewReport" />
                <q-btn color="primary" label="Generate" @click="generateReport" />
                <q-btn color="secondary" label="Schedule" @click="showScheduleDialog = true" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered v-else>
            <q-card-section class="text-center text-grey-7">
              <q-icon name="description" size="64px" class="q-mb-md" />
              <div>Select a template to start building your report</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Template Dialog -->
      <q-dialog v-model="showTemplateDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ editingTemplate ? 'Edit Template' : 'New Template' }}</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="saveTemplate">
              <q-input
                v-model="templateForm.name"
                label="Template Name"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="templateForm.description"
                label="Description"
                type="textarea"
                outlined
                dense
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showTemplateDialog = false" />
                <q-btn label="Save" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Schedule Dialog -->
      <q-dialog v-model="showScheduleDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">Schedule Report</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="scheduleReport">
              <q-select
                v-model="scheduleForm.frequency"
                :options="['daily', 'weekly', 'monthly']"
                label="Frequency"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="scheduleForm.time"
                type="time"
                label="Time"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="scheduleForm.recipients"
                label="Recipients (comma separated emails)"
                outlined
                dense
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showScheduleDialog = false" />
                <q-btn label="Schedule" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import customReportService from 'src/services/customReportService'

export default {
  name: 'CustomReportBuilderPage',
  setup() {
    const $q = useQuasar()
    const templates = ref([])
    const selectedTemplate = ref(null)
    const editingTemplate = ref(null)
    const showTemplateDialog = ref(false)
    const showScheduleDialog = ref(false)
    const dataSources = ref(['reservations', 'guests', 'rooms', 'invoices', 'payments'])
    const availableFields = ref([])

    const templateForm = ref({
      name: '',
      description: ''
    })

    const reportConfig = ref({
      data_source: null,
      fields: [],
      filters: [],
      group_by: [],
      order_by: null
    })

    const scheduleForm = ref({
      frequency: 'daily',
      time: '09:00',
      recipients: ''
    })

    const loadTemplates = async () => {
      try {
        const response = await customReportService.getTemplates()
        templates.value = response.data
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load templates' })
      }
    }

    const selectTemplate = async (template) => {
      selectedTemplate.value = template
      try {
        const response = await customReportService.getTemplate(template.id)
        reportConfig.value = response.data.config || reportConfig.value
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load template details' })
      }
    }

    const editTemplate = (template) => {
      editingTemplate.value = template
      templateForm.value = { ...template }
      showTemplateDialog.value = true
    }

    const saveTemplate = async () => {
      try {
        if (editingTemplate.value) {
          await customReportService.updateTemplate(editingTemplate.value.id, templateForm.value)
          $q.notify({ type: 'positive', message: 'Template updated' })
        } else {
          await customReportService.createTemplate(templateForm.value)
          $q.notify({ type: 'positive', message: 'Template created' })
        }
        showTemplateDialog.value = false
        loadTemplates()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to save template' })
      }
    }

    const deleteTemplate = async (id) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this template?',
        cancel: true
      }).onOk(async () => {
        try {
          await customReportService.deleteTemplate(id)
          $q.notify({ type: 'positive', message: 'Template deleted' })
          loadTemplates()
        } catch {
          $q.notify({ type: 'negative', message: 'Failed to delete template' })
        }
      })
    }

    const addFilter = () => {
      reportConfig.value.filters.push({
        field: null,
        operator: '=',
        value: ''
      })
    }

    const removeFilter = (index) => {
      reportConfig.value.filters.splice(index, 1)
    }

    const previewReport = async () => {
      try {
        await customReportService.previewReport(selectedTemplate.value.id, reportConfig.value)
        $q.notify({ type: 'positive', message: 'Preview generated' })
        // Show preview in dialog or new window
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to preview report' })
      }
    }

    const generateReport = async () => {
      try {
        await customReportService.generateReport(selectedTemplate.value.id, reportConfig.value)
        $q.notify({ type: 'positive', message: 'Report generated successfully' })
        // Download or display report
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to generate report' })
      }
    }

    const scheduleReport = async () => {
      try {
        await customReportService.scheduleReport(selectedTemplate.value.id, {
          ...reportConfig.value,
          ...scheduleForm.value
        })
        $q.notify({ type: 'positive', message: 'Report scheduled successfully' })
        showScheduleDialog.value = false
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to schedule report' })
      }
    }

    onMounted(() => {
      loadTemplates()
    })

    return {
      templates,
      selectedTemplate,
      editingTemplate,
      showTemplateDialog,
      showScheduleDialog,
      dataSources,
      availableFields,
      templateForm,
      reportConfig,
      scheduleForm,
      selectTemplate,
      editTemplate,
      saveTemplate,
      deleteTemplate,
      addFilter,
      removeFilter,
      previewReport,
      generateReport,
      scheduleReport
    }
  }
}
</script>
