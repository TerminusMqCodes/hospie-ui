<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">Backup System Debug</div>
        </q-card-section>
        
        <q-card-section>
          <q-btn @click="testAuth" color="primary" :loading="loadingAuth">
            Test Authentication
          </q-btn>
          <q-btn @click="testTenant" color="secondary" :loading="loadingTenant" class="q-ml-sm">
            Test Tenant Resolution
          </q-btn>
          <q-btn @click="testBackupAPI" color="accent" :loading="loadingBackup" class="q-ml-sm">
            Test Backup API
          </q-btn>
        </q-card-section>
        
        <q-card-section v-if="results.length">
          <div class="text-subtitle1">Debug Results:</div>
          <div v-for="(result, index) in results" :key="index" class="q-mt-sm">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-weight-bold">{{ result.test }}</div>
                <div class="text-caption">{{ result.url }}</div>
                <div :class="result.success ? 'text-positive' : 'text-negative'">
                  Status: {{ result.status }}
                </div>
                <div v-if="result.data" class="q-mt-sm">
                  <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
                </div>
                <div v-if="result.error" class="text-negative q-mt-sm">
                  Error: {{ result.error }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'src/boot/axios'

const loadingAuth = ref(false)
const loadingTenant = ref(false)
const loadingBackup = ref(false)
const results = ref([])

const testAuth = async () => {
  loadingAuth.value = true
  try {
    const response = await api.get('/user')
    results.value.push({
      test: 'Authentication Test',
      url: '/api/user',
      success: true,
      status: 'Success',
      data: response.data
    })
  } catch (error) {
    results.value.push({
      test: 'Authentication Test',
      url: '/api/user',
      success: false,
      status: 'Failed',
      error: error.response?.data || error.message
    })
  } finally {
    loadingAuth.value = false
  }
}

const testTenant = async () => {
  loadingTenant.value = true
  try {
    // Test tenant resolution with a simple endpoint
    const response = await api.get('/tenant-debug', {
      headers: {
        'X-Tenant-ID': 'test-tenant-id'
      }
    })
    results.value.push({
      test: 'Tenant Resolution Test',
      url: '/api/tenant-debug',
      success: true,
      status: 'Success',
      data: response.data
    })
  } catch (error) {
    results.value.push({
      test: 'Tenant Resolution Test',
      url: '/api/tenant-debug',
      success: false,
      status: 'Failed',
      error: error.response?.data || error.message
    })
  } finally {
    loadingTenant.value = false
  }
}

const testBackupAPI = async () => {
  loadingBackup.value = true
  try {
    const response = await api.get('/backups/statistics')
    results.value.push({
      test: 'Backup API Test',
      url: '/api/backups/statistics',
      success: true,
      status: 'Success',
      data: response.data
    })
  } catch (error) {
    results.value.push({
      test: 'Backup API Test',
      url: '/api/backups/statistics',
      success: false,
      status: 'Failed',
      error: error.response?.data || error.message
    })
  } finally {
    loadingBackup.value = false
  }
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>