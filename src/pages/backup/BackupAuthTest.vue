<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Backup Authentication Test</div>
            <div class="text-subtitle2">Testing authentication and tenant setup for backup API</div>
          </q-card-section>
          
          <q-card-section>
            <div class="q-gutter-md">
              <q-btn 
                color="primary" 
                label="Check Auth Status" 
                @click="checkAuthStatus"
                :loading="loadingAuth"
              />
              
              <q-btn 
                color="secondary" 
                label="Test Backup API (Auth)" 
                @click="testBackupApiAuth"
                :loading="loadingBackupAuth"
              />
              
              <q-btn 
                color="positive" 
                label="Test Backup API (No Auth)" 
                @click="testBackupApiNoAuth"
                :loading="loadingBackupNoAuth"
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
                    <div><strong>Status:</strong> {{ result.status }}</div>
                    <div v-if="result.headers"><strong>Headers:</strong> {{ JSON.stringify(result.headers, null, 2) }}</div>
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
import { api } from 'src/boot/axios'

const loadingAuth = ref(false)
const loadingBackupAuth = ref(false)
const loadingBackupNoAuth = ref(false)
const results = ref([])

const addResult = (test, success, status, data = null, error = null, url = '', headers = null) => {
  results.value.push({
    test,
    success,
    status,
    data,
    error,
    url,
    headers,
    timestamp: new Date().toLocaleTimeString()
  })
}

const checkAuthStatus = async () => {
  loadingAuth.value = true
  try {
    // Check localStorage
    const authToken = localStorage.getItem('auth_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    const authData = {
      hasAuthToken: !!authToken,
      authToken: authToken ? authToken.substring(0, 20) + '...' : null,
      user: user,
      currentPropertyId: user.current_property_id
    }
    
    addResult('Auth Status Check', true, 'Success', authData, null, 'localStorage')
    
    // Test API auth endpoint
    const response = await api.get('/user')
    addResult('API Auth Test', true, 'Success', response.data, null, '/api/user')
    
  } catch (error) {
    addResult('Auth Status Check', false, 'Failed', null, error.message, '/api/user')
  } finally {
    loadingAuth.value = false
  }
}

const testBackupApiAuth = async () => {
  loadingBackupAuth.value = true
  try {
    const response = await api.get('/backups/statistics')
    addResult('Backup API (Auth)', true, 'Success', response.data, null, '/api/backups/statistics')
  } catch (error) {
    const errorData = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    }
    addResult('Backup API (Auth)', false, `Failed (${error.response?.status})`, errorData, error.message, '/api/backups/statistics')
  } finally {
    loadingBackupAuth.value = false
  }
}

const testBackupApiNoAuth = async () => {
  loadingBackupNoAuth.value = true
  try {
    const response = await api.get('/backups-statistics-test')
    addResult('Backup API (No Auth)', true, 'Success', response.data, null, '/api/backups-statistics-test')
  } catch (error) {
    const errorData = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    }
    addResult('Backup API (No Auth)', false, `Failed (${error.response?.status})`, errorData, error.message, '/api/backups-statistics-test')
  } finally {
    loadingBackupNoAuth.value = false
  }
}
</script>