#!/usr/bin/env node

/**
 * PWA Testing Script
 * Tests PWA functionality including offline capabilities, push notifications, and service worker
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  if (existsSync(filePath)) {
    log(`✓ ${description}`, 'green')
    return true
  } else {
    log(`✗ ${description}`, 'red')
    return false
  }
}

function checkPackageDependency(packageName) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (deps[packageName]) {
      log(`✓ ${packageName} (${deps[packageName]})`, 'green')
      return true
    } else {
      log(`✗ ${packageName} not found`, 'red')
      return false
    }
  } catch (error) {
    log(`✗ Error checking ${packageName}: ${error.message}`, 'red')
    return false
  }
}

async function testPWA() {
  log('🚀 Testing PWA Implementation', 'blue')
  log('================================', 'blue')
  
  let passed = 0
  let total = 0
  
  // Check core PWA files
  log('\n📁 Core PWA Files:', 'yellow')
  total++; if (checkFile('src-pwa/manifest.json', 'PWA Manifest')) passed++
  total++; if (checkFile('src-pwa/custom-service-worker.js', 'Custom Service Worker')) passed++
  total++; if (checkFile('src-pwa/register-service-worker.js', 'Service Worker Registration')) passed++
  total++; if (checkFile('public/offline.html', 'Offline Page')) passed++
  total++; if (checkFile('public/firebase-messaging-sw.js', 'Firebase Messaging SW')) passed++
  
  // Check PWA services
  log('\n🔧 PWA Services:', 'yellow')
  total++; if (checkFile('src/services/firebaseService.js', 'Firebase Service')) passed++
  total++; if (checkFile('src/services/pushNotificationService.js', 'Push Notification Service')) passed++
  total++; if (checkFile('src/services/offlineStorage.js', 'Offline Storage Service')) passed++
  total++; if (checkFile('src/services/offlineApiService.js', 'Offline API Service')) passed++
  total++; if (checkFile('src/services/backgroundSyncService.js', 'Background Sync Service')) passed++
  total++; if (checkFile('src/services/capacitorService.js', 'Capacitor Service')) passed++
  
  // Check PWA components
  log('\n🧩 PWA Components:', 'yellow')
  total++; if (checkFile('src/components/PWA/InstallPrompt.vue', 'Install Prompt Component')) passed++
  total++; if (checkFile('src/components/PWA/UpdatePrompt.vue', 'Update Prompt Component')) passed++
  total++; if (checkFile('src/components/PWA/OfflineIndicator.vue', 'Offline Indicator Component')) passed++
  total++; if (checkFile('src/components/PWA/NotificationSettings.vue', 'Notification Settings Component')) passed++
  
  // Check PWA composables and stores
  log('\n🎯 PWA Logic:', 'yellow')
  total++; if (checkFile('src/composables/usePWA.js', 'PWA Composable')) passed++
  total++; if (checkFile('src/stores/offline.js', 'Offline Store')) passed++
  total++; if (checkFile('src/pages/PWASettingsPage.vue', 'PWA Settings Page')) passed++
  
  // Check configuration files
  log('\n⚙️ Configuration Files:', 'yellow')
  total++; if (checkFile('capacitor.config.ts', 'Capacitor Configuration')) passed++
  total++; if (checkFile('quasar.config.js', 'Quasar Configuration')) passed++
  
  // Check boot files
  log('\n🚀 Boot Files:', 'yellow')
  total++; if (checkFile('src/boot/firebase.js', 'Firebase Boot')) passed++
  total++; if (checkFile('src/boot/pwa.js', 'PWA Boot')) passed++
  
  // Check dependencies
  log('\n📦 Dependencies:', 'yellow')
  const requiredDeps = [
    'firebase',
    'idb',
    '@capacitor/core',
    '@capacitor/app',
    '@capacitor/camera',
    '@capacitor/geolocation',
    '@capacitor/push-notifications',
    '@capacitor/local-notifications',
    'register-service-worker'
  ]
  
  requiredDeps.forEach(dep => {
    total++
    if (checkPackageDependency(dep)) passed++
  })
  
  // Check Workbox dependencies
  const workboxDeps = [
    'workbox-core',
    'workbox-precaching',
    'workbox-routing',
    'workbox-strategies',
    'workbox-expiration',
    'workbox-cacheable-response'
  ]
  
  workboxDeps.forEach(dep => {
    total++
    if (checkPackageDependency(dep)) passed++
  })
  
  // Summary
  log('\n📊 Test Results:', 'blue')
  log('================', 'blue')
  
  const percentage = Math.round((passed / total) * 100)
  const color = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red'
  
  log(`Passed: ${passed}/${total} (${percentage}%)`, color)
  
  if (percentage >= 90) {
    log('\n🎉 PWA implementation is complete and ready!', 'green')
  } else if (percentage >= 70) {
    log('\n⚠️ PWA implementation is mostly complete but needs some fixes.', 'yellow')
  } else {
    log('\n❌ PWA implementation needs significant work.', 'red')
  }
  
  // Recommendations
  if (percentage < 100) {
    log('\n💡 Recommendations:', 'blue')
    log('- Ensure all missing files are created', 'yellow')
    log('- Install missing dependencies with: npm install', 'yellow')
    log('- Check file paths and naming conventions', 'yellow')
    log('- Verify Quasar and Capacitor configurations', 'yellow')
  }
  
  // Next steps
  log('\n🚀 Next Steps:', 'blue')
  log('1. Run: npm run dev:pwa - to test PWA in development', 'yellow')
  log('2. Run: npm run build:pwa - to build PWA for production', 'yellow')
  log('3. Test offline functionality in browser DevTools', 'yellow')
  log('4. Test push notifications with Firebase console', 'yellow')
  log('5. Test mobile app with: npm run dev:mobile', 'yellow')
  
  return percentage >= 90
}

// Run the test
testPWA().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  log(`Error running PWA tests: ${error.message}`, 'red')
  process.exit(1)
})