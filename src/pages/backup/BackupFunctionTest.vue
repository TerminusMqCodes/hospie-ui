<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Backup System Function Test</div>
            <div class="text-subtitle2">Testing all backup management functions</div>
          </q-card-section>
          
          <q-card-section>
            <div class="q-gutter-md">
              <!-- Statistics Test -->
              <q-btn 
                color="primary" 
                label="Test Statistics" 
                @click="testStatistics"
                :loading="loadingStats"
              />
              
              <!-- Backup List Test -->
              <q-btn 
                color="secondary" 
                label="Test Backup List" 
                @click="testBackupList"
                :loading="loadingList"
              />
              
              <!-- Create Backup Test -->
              <q-btn 
                color="positive" 
                label="Test Create Backup" 
                @click="testCreateBackup"
                :loading="loadingCreate"
              />
              
              <!-- Schedules Test -->
              <q-btn 
                color="info" 
                label="Test Schedules" 
                @click="testSchedules"
                :loading="loadingSchedules"
              />
              
              <!-- Create Schedule Test -->
              <q-btn 
                color="purple" 
                label="Test Create Schedule" 
                @click="testCreateSchedule"
                :loading="loadingCreateSchedule"
              />
              
              <!-- Validate Backup Test -->
              <q-btn 
                color="orange" 
                label="Test Validate Backup" 
                @click="testValidateBackup"
                :loading="loadingValidate"
                :disable="!testBackupId"
              />
              
              <!-- Download Test -->
              <q-btn 
                color="teal" 
                label="Test Download" 
                @click="testDownload"
                :loading="loadingDownload"
                :disable="!testBackupId"
              />
              
              <!-- Delete Test -->
              <q-btn 
                color="negative" 
                label="Test Delete" 
                @click="testDelete"
                :loading="loadingDelete"
                :disable="!testBackupId"
              />
            </div>
          </q-card-section>
          
          <q-card-section v-if="results.length > 0">
            <div class="text-h6">Test Results:</div>
            <div v-for="(result, index) in results" :key="index" class="q-mt-sm">
              <q-expansion-item
                :icon="result.success ? 'check_circle' : 'error'"
                :label="result.test"
                :caption="result.status"
                :header-class="result.success ? 'text-positive' : 'text-negative'"
              >
                <q-card>
                  <q-card-section>
                    <div><strong>URL:</strong> {{ result.url }}</div>
                    <div><strong>Method:</strong> {{ result.method || 'GET' }}</div>
                    <div><strong>Status:</strong> {{ result.status }}</div>
                    <div v-if="result.payload"><strong>Payload:</strong> {{ JSON.stringify(result.payload, null, 2) }}</div>
                    <div v-if="result.data"><strong>Response:</strong> {{ JSON.stringify(result.data, null, 2) }}</div>
                    <div v-if="result.error" class="text-negative"><strong>Error:</strong> {{ result.error }}</div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { backupService } from 'src/services/backupService'

const loadingStats = ref(false)
const loadingList = ref(false)
const loadingCreate = ref(false)
const loadingSchedules = ref(false)
const loadingCreateSchedule = ref(false)
const loadingValidate = ref(false)
const loadingDownload = ref(false)
const loadingDelete = ref(false)
const results = ref([])
const testBackupId = ref(null)
const testScheduleId = ref(null)

const addResult = (test, success, status, data = null, error = null, url = '', method = 'GET', payload = null) => {
  results.value.push({
    test,
    success,
    status,
    data,
    error,
    url,
    method,
    payload,
    timestamp: new Date().toLocaleTimeString()
  })
}

const testStatistics = async () => {
  loadingStats.value = true
  try {
    const data = await backupService.getStatistics()
    addResult('Statistics', true, 'Success', data, null, '/backups/statistics')
  } catch (error) {
    addResult('Statistics', false, 'Failed', null, error.message, '/backups/statistics')
  } finally {
    loadingStats.value = false
  }
}

const testBackupList = async () => {
  loadingList.value = true
  try {
    const data = await backupService.getBackups()
    addResult('Backup List', true, 'Success', data, null, '/backups')
    
    // Store first backup ID for other tests
    if (data.data && data.data.length > 0) {
      testBackupId.value = data.data[0].id
    }
  } catch (error) {
    addResult('Backup List', false, 'Failed', null, error.message, '/backups')
  } finally {
    loadingList.value = false
  }
}

const testCreateBackup = async () => {
  loadingCreate.value = true
  const payload = { backup_type: 'full' }
  try {
    const data = await backupService.createBackup(payload)
    addResult('Create Backup', true, 'Success', data, null, '/backups', 'POST', payload)
    
    // Store created backup ID
    if (data.id) {
      testBackupId.value = data.id
    }
  } catch (error) {
    addResult('Create Backup', false, 'Failed', null, error.message, '/backups', 'POST', payload)
  } finally {
    loadingCreate.value = false
  }
}

const testSchedules = async () => {
  loadingSchedules.value = true
  try {
    const data = await backupService.getSchedules()
    addResult('Get Schedules', true, 'Success', data, null, '/backups/schedules')
    
    // Store first schedule ID for other tests
    if (data.data && data.data.length > 0) {
      testScheduleId.value = data.data[0].id
    }
  } catch (error) {
    addResult('Get Schedules', false, 'Failed', null, error.message, '/backups/schedules')
  } finally {
    loadingSchedules.value = false
  }
}

const testCreateSchedule = async () => {
  loadingCreateSchedule.value = true
  const payload = {
    backup_type: 'full',
    frequency: 'daily',
    time: '02:00',
    is_active: true
  }
  try {
    const data = await backupService.createSchedule(payload)
    addResult('Create Schedule', true, 'Success', data, null, '/backups/schedules', 'POST', payload)
    
    // Store created schedule ID
    if (data.id) {
      testScheduleId.value = data.id
    }
  } catch (error) {
    addResult('Create Schedule', false, 'Failed', null, error.message, '/backups/schedules', 'POST', payload)
  } finally {
    loadingCreateSchedule.value = false
  }
}

const testValidateBackup = async () => {
  if (!testBackupId.value) {
    addResult('Validate Backup', false, 'No backup ID available', null, 'Run backup list test first')
    return
  }
  
  loadingValidate.value = true
  try {
    const data = await backupService.validateBackup(testBackupId.value)
    addResult('Validate Backup', true, 'Success', data, null, `/backups/${testBackupId.value}/validate`, 'POST')
  } catch (error) {
    addResult('Validate Backup', false, 'Failed', null, error.message, `/backups/${testBackupId.value}/validate`, 'POST')
  } finally {
    loadingValidate.value = false
  }
}

const testDownload = async () => {
  if (!testBackupId.value) {
    addResult('Download Backup', false, 'No backup ID available', null, 'Run backup list test first')
    return
  }
  
  loadingDownload.value = true
  try {
    await backupService.downloadBackup(testBackupId.value)
    addResult('Download Backup', true, 'Success', 'Download started', null, `/backups/${testBackupId.value}/download`)
  } catch (error) {
    addResult('Download Backup', false, 'Failed', null, error.message, `/backups/${testBackupId.value}/download`)
  } finally {
    loadingDownload.value = false
  }
}

const testDelete = async () => {
  if (!testBackupId.value) {
    addResult('Delete Backup', false, 'No backup ID available', null, 'Run backup list test first')
    return
  }
  
  loadingDelete.value = true
  try {
    await backupService.deleteBackup(testBackupId.value)
    addResult('Delete Backup', true, 'Success', 'Backup deleted', null, `/backups/${testBackupId.value}`, 'DELETE')
    testBackupId.value = null // Clear the ID since it's deleted
  } catch (error) {
    addResult('Delete Backup', false, 'Failed', null, error.message, `/backups/${testBackupId.value}`, 'DELETE')
  } finally {
    loadingDelete.value = false
  }
}
</script>