<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="liquid-glass-card">
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">
              🧪 Backup API Test
            </div>

            <div class="text-center q-mb-lg">
              <q-btn
                color="primary"
                icon="play_arrow"
                label="Test Backend Connection"
                @click="testBackendConnection"
                :loading="testing"
                class="q-mr-sm"
              />
              <q-btn
                color="secondary"
                icon="backup"
                label="Test Backup Creation"
                @click="testBackupCreation"
                :loading="testingBackup"
                class="q-mr-sm"
              />
              <q-btn
                color="positive"
                icon="verified_user"
                label="Test Auth Backup"
                @click="testAuthBackup"
                :loading="testingAuth"
              />
            </div>

            <q-separator class="q-my-lg" />

            <div v-if="testResult" class="q-mb-md">
              <div class="text-h6 q-mb-sm">Test Result:</div>
              <q-card flat bordered>
                <q-card-section>
                  <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
                </q-card-section>
              </q-card>
            </div>

            <div v-if="error" class="q-mb-md">
              <div class="text-h6 q-mb-sm text-negative">Error:</div>
              <q-card flat bordered class="bg-negative text-white">
                <q-card-section>
                  <pre>{{ error }}</pre>
                </q-card-section>
              </q-card>
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-center">
              <q-btn
                color="secondary"
                icon="backup"
                label="Go to Backup Management"
                @click="$router.push('/backup')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'src/boot/axios'

const testing = ref(false)
const testingBackup = ref(false)
const testingAuth = ref(false)
const testResult = ref(null)
const error = ref(null)

const testBackendConnection = async () => {
  testing.value = true
  testResult.value = null
  error.value = null

  try {
    console.log('Testing backend connection...')
    const response = await api.get('/backup-test')
    console.log('Response:', response)
    testResult.value = response.data
  } catch (err) {
    console.error('Test failed:', err)
    error.value = {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL,
      }
    }
  } finally {
    testing.value = false
  }
}

const testBackupCreation = async () => {
  testingBackup.value = true
  testResult.value = null
  error.value = null

  try {
    console.log('Testing backup creation...')
    const response = await api.post('/backup-create-simple', {
      backup_type: 'full'
    })
    console.log('Backup creation response:', response)
    testResult.value = {
      ...response.data,
      test_type: 'simple_backup_creation'
    }
  } catch (err) {
    console.error('Backup creation test failed:', err)
    error.value = {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL,
      },
      test_type: 'simple_backup_creation'
    }
  } finally {
    testingBackup.value = false
  }
}

const testAuthBackup = async () => {
  testingAuth.value = true
  testResult.value = null
  error.value = null

  try {
    console.log('Testing authenticated backup creation...')
    const response = await api.post('/backup-auth-test', {
      backup_type: 'full'
    })
    console.log('Auth backup creation response:', response)
    testResult.value = {
      ...response.data,
      test_type: 'authenticated_backup_creation'
    }
  } catch (err) {
    console.error('Auth backup creation test failed:', err)
    error.value = {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL,
      },
      test_type: 'authenticated_backup_creation'
    }
  } finally {
    testingAuth.value = false
  }
}
</script>

<style scoped>
.liquid-glass-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>