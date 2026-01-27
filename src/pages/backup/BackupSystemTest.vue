<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Backup System Test</div>
            <div class="text-subtitle2">Testing backup service URLs and functionality</div>
          </q-card-section>
          
          <q-card-section>
            <div class="q-gutter-md">
              <q-btn 
                color="primary" 
                label="Test Statistics" 
                @click="testStatistics"
                :loading="loadingStats"
              />
              
              <q-btn 
                color="secondary" 
                label="Test Backup List" 
                @click="testBackupList"
                :loading="loadingList"
              />
              
              <q-btn 
                color="positive" 
                label="Test Create Backup" 
                @click="testCreateBackup"
                :loading="loadingCreate"
              />
            </div>
          </q-card-section>
          
          <q-card-section v-if="results.length > 0">
            <div class="text-h6">Test Results:</div>
            <div v-for="(result, index) in results" :key="index" class="q-mt-sm">
              <q-chip 
                :color="result.success ? 'positive' : 'negative'"
                text-color="white"
                :label="result.test"
              />
              <div class="q-ml-md q-mt-xs">
                <div><strong>URL:</strong> {{ result.url }}</div>
                <div><strong>Status:</strong> {{ result.status }}</div>
                <div v-if="result.data"><strong>Data:</strong> {{ JSON.stringify(result.data, null, 2) }}</div>
                <div v-if="result.error" class="text-negative"><strong>Error:</strong> {{ result.error }}</div>
              </div>
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
const results = ref([])

const testStatistics = async () => {
  loadingStats.value = true
  try {
    const data = await backupService.getStatistics()
    results.value.push({
      test: 'Statistics',
      url: '/backups-statistics-test',
      success: true,
      status: 'Success',
      data: data
    })
  } catch (error) {
    results.value.push({
      test: 'Statistics',
      url: '/backups-statistics-test',
      success: false,
      status: 'Failed',
      error: error.message
    })
  } finally {
    loadingStats.value = false
  }
}

const testBackupList = async () => {
  loadingList.value = true
  try {
    const data = await backupService.getBackups()
    results.value.push({
      test: 'Backup List',
      url: '/backups-test',
      success: true,
      status: 'Success',
      data: data
    })
  } catch (error) {
    results.value.push({
      test: 'Backup List',
      url: '/backups-test',
      success: false,
      status: 'Failed',
      error: error.message
    })
  } finally {
    loadingList.value = false
  }
}

const testCreateBackup = async () => {
  loadingCreate.value = true
  try {
    const data = await backupService.createBackup({ backup_type: 'full' })
    results.value.push({
      test: 'Create Backup',
      url: '/backup-create-simple',
      success: true,
      status: 'Success',
      data: data
    })
  } catch (error) {
    results.value.push({
      test: 'Create Backup',
      url: '/backup-create-simple',
      success: false,
      status: 'Failed',
      error: error.message
    })
  } finally {
    loadingCreate.value = false
  }
}
</script>