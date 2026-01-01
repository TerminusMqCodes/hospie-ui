import { api } from 'boot/axios'

/**
 * Test if the Laravel backend is running and accessible
 */
export async function testApiConnection() {
  try {
    console.log('🔍 Testing API connection to /api/test...')
    const response = await api.get('/test') // Removed timeout
    console.log('✅ API Connection Test SUCCESS:', response.data)
    return {
      success: true,
      data: response.data,
      message: 'API is accessible and responding'
    }
  } catch (error) {
    console.error('❌ API Connection Test FAILED:', error)
    
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'timeout',
        message: 'API request timed out - Laravel server is not responding on port 8000'
      }
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'network',
        message: 'Network error - Laravel server is not running on http://localhost:8000'
      }
    } else if (error.response) {
      return {
        success: false,
        error: `http_${error.response.status}`,
        message: `HTTP ${error.response.status}: ${error.response.statusText}`
      }
    } else {
      return {
        success: false,
        error: 'unknown',
        message: error.message || 'Unknown API error'
      }
    }
  }
}

/**
 * Test direct connection to Laravel server (bypassing proxy)
 */
export async function testDirectConnection() {
  try {
    console.log('🔍 Testing direct connection to http://localhost:8000/api/test...')
    const response = await fetch('http://localhost:8000/api/test', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Direct Connection Test SUCCESS:', data)
      return {
        success: true,
        data: data,
        message: 'Direct connection to Laravel server successful'
      }
    } else {
      return {
        success: false,
        error: `http_${response.status}`,
        message: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    console.error('❌ Direct Connection Test FAILED:', error)
    return {
      success: false,
      error: 'connection_failed',
      message: 'Cannot connect to Laravel server directly - server is not running'
    }
  }
}

/**
 * Test authentication endpoints
 */
export async function testAuthEndpoints() {
  try {
    console.log('🔍 Testing auth endpoints...')
    // Test if we can reach the auth endpoints (this should return validation errors, not 500)
    const response = await api.post('/auth/login', {}) // Removed timeout
    return { success: true, message: 'Auth endpoints accessible' }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Validation error is expected - means the endpoint is working
      console.log('✅ Auth endpoints working (validation error expected)')
      return { success: true, message: 'Auth endpoints accessible (validation working)' }
    } else if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'timeout', message: 'Auth endpoints timed out' }
    } else {
      return { success: false, error: error.response?.status || 'unknown', message: error.message }
    }
  }
}

/**
 * Comprehensive API health check
 */
export async function runFullApiTest() {
  console.log('🚀 Running comprehensive API health check...')
  
  const results = {
    proxy_test: await testApiConnection(),
    direct_test: await testDirectConnection(),
    auth_test: await testAuthEndpoints()
  }
  
  const allPassed = Object.values(results).every(result => result.success)
  
  console.log('📊 API Health Check Results:', results)
  
  return {
    success: allPassed,
    results: results,
    summary: allPassed ? 'All API tests passed' : 'Some API tests failed'
  }
}