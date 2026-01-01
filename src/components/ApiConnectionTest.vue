<template>
  <q-card class="q-ma-md">
    <q-card-section>
      <div class="text-h6">🔧 API Connection Diagnostics</div>
      <div class="text-caption">Test Laravel backend connectivity and troubleshoot issues</div>
    </q-card-section>

    <q-card-section>
      <div class="q-gutter-md">
        <q-btn 
          color="primary" 
          label="Run Full API Test" 
          icon="play_arrow"
          @click="runFullTest"
          :loading="testing"
        />
        
        <q-btn 
          color="secondary" 
          label="Test Direct Connection" 
          icon="link"
          @click="testDirect"
          :loading="testingDirect"
        />
        
        <q-btn 
          color="accent" 
          label="Test Proxy Connection" 
          icon="swap_horiz"
          @click="testProxy"
          :loading="testingProxy"
        />
      </div>

      <!-- Server Status Indicator -->
      <div v-if="serverStatus" class="q-mt-md">
        <q-banner 
          :class="serverStatus.success ? 'bg-positive text-white' : 'bg-negative text-white'"
          :icon="serverStatus.success ? 'check_circle' : 'error'"
        >
          <div class="text-subtitle1">{{ serverStatus.title }}</div>
          <div>{{ serverStatus.message }}</div>
        </q-banner>
      </div>

      <!-- Test Results -->
      <div v-if="results.length > 0" class="q-mt-md">
        <div class="text-subtitle2">🧪 Test Results:</div>
        <div v-for="(result, index) in results" :key="index" class="q-mt-sm">
          <q-expansion-item
            :icon="result.success ? 'check_circle' : 'error'"
            :label="result.test"
            :caption="result.message"
            :header-class="result.success ? 'text-positive' : 'text-negative'"
          >
            <q-card>
              <q-card-section>
                <div class="text-body2">
                  <strong>Status:</strong> {{ result.success ? '✅ Success' : '❌ Failed' }}
                </div>
                <div class="text-body2">
                  <strong>Message:</strong> {{ result.message }}
                </div>
                <div v-if="result.error" class="text-body2">
                  <strong>Error:</strong> {{ result.error }}
                </div>
                <div v-if="result.data" class="q-mt-sm">
                  <strong>Response Data:</strong>
                  <pre class="bg-grey-2 q-pa-sm text-caption">{{ JSON.stringify(result.data, null, 2) }}</pre>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>

      <!-- Troubleshooting Guide -->
      <div v-if="showTroubleshooting" class="q-mt-md">
        <q-separator />
        <div class="q-mt-md">
          <div class="text-subtitle2">🛠️ Troubleshooting Guide:</div>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="terminal" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Start Laravel Server</q-item-label>
                <q-item-label caption>
                  Run: <code>cd hospie-pms && php artisan serve --port=8000</code>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-icon name="person_add" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Create Test User</q-item-label>
                <q-item-label caption>
                  Run: <code>cd hospie-pms && php artisan user:create-test</code>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-icon name="storage" color="accent" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Setup Database</q-item-label>
                <q-item-label caption>
                  Run: <code>cd hospie-pms && php artisan migrate --seed</code>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-icon name="open_in_browser" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Test Direct Access</q-item-label>
                <q-item-label caption>
                  Visit: <a href="http://localhost:8000/api/test" target="_blank">http://localhost:8000/api/test</a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { testApiConnection, testDirectConnection, testAuthEndpoints, runFullApiTest } from 'src/utils/apiTest'

const testing = ref(false)
const testingDirect = ref(false)
const testingProxy = ref(false)
const results = ref([])
const serverStatus = ref(null)
const showTroubleshooting = ref(false)

const runFullTest = async () => {
  testing.value = true
  results.value = []
  
  try {
    const fullTest = await runFullApiTest()
    
    // Add individual test results
    Object.entries(fullTest.results).forEach(([testName, result]) => {
      results.value.push({
        test: testName.replace('_', ' ').toUpperCase(),
        success: result.success,
        message: result.message,
        error: result.error,
        data: result.data
      })
    })
    
    // Set server status
    if (fullTest.results.direct_test.success) {
      serverStatus.value = {
        success: true,
        title: '🟢 Laravel Server is Running',
        message: 'Server is accessible on http://localhost:8000'
      }
    } else if (fullTest.results.proxy_test.success) {
      serverStatus.value = {
        success: true,
        title: '🟡 Proxy Connection Working',
        message: 'API accessible through Quasar proxy'
      }
    } else {
      serverStatus.value = {
        success: false,
        title: '🔴 Laravel Server Not Accessible',
        message: 'Please start the Laravel server: php artisan serve --port=8000'
      }
      showTroubleshooting.value = true
    }
    
  } catch (error) {
    results.value.push({
      test: 'FULL TEST',
      success: false,
      message: error.message,
      error: 'test_failed'
    })
    showTroubleshooting.value = true
  } finally {
    testing.value = false
  }
}

const testDirect = async () => {
  testingDirect.value = true
  try {
    const result = await testDirectConnection()
    results.value.unshift({
      test: 'Direct Connection',
      success: result.success,
      message: result.message,
      error: result.error,
      data: result.data
    })
  } catch (error) {
    results.value.unshift({
      test: 'Direct Connection',
      success: false,
      message: error.message,
      error: 'test_error'
    })
  } finally {
    testingDirect.value = false
  }
}

const testProxy = async () => {
  testingProxy.value = true
  try {
    const result = await testApiConnection()
    results.value.unshift({
      test: 'Proxy Connection',
      success: result.success,
      message: result.message,
      error: result.error,
      data: result.data
    })
  } catch (error) {
    results.value.unshift({
      test: 'Proxy Connection',
      success: false,
      message: error.message,
      error: 'test_error'
    })
  } finally {
    testingProxy.value = false
  }
}
</script>