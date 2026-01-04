import { register } from 'register-service-worker'
import { Notify } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    console.log('Hospie PMS is ready to work offline.')
  },

  registered (/* registration */) {
    console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    console.log('Content has been cached for offline use.')
    if (typeof Notify !== 'undefined') {
      Notify.create({
        message: 'App is ready to work offline',
        color: 'positive',
        icon: 'cloud_done',
        timeout: 3000
      })
    }
  },

  updatefound (/* registration */) {
    console.log('New content is downloading.')
    if (typeof Notify !== 'undefined') {
      Notify.create({
        message: 'Downloading app update...',
        color: 'info',
        icon: 'cloud_download',
        timeout: 3000
      })
    }
  },

  updated (/* registration */) {
    console.log('New content is available; please refresh.')
    if (typeof Notify !== 'undefined') {
      Notify.create({
        message: 'App updated! Refresh to get the latest version.',
        color: 'warning',
        icon: 'refresh',
        timeout: 0,
        actions: [
          {
            label: 'Refresh',
            color: 'white',
            handler: () => {
              window.location.reload()
            }
          },
          {
            label: 'Later',
            color: 'white'
          }
        ]
      })
    }
  },

  offline () {
    console.log('No internet connection found. App is running in offline mode.')
    if (typeof Notify !== 'undefined') {
      Notify.create({
        message: 'You are offline. Some features may be limited.',
        color: 'warning',
        icon: 'cloud_off',
        timeout: 5000
      })
    }
  },

  error (err) {
    console.error('Error during service worker registration:', err)
    if (typeof Notify !== 'undefined') {
      Notify.create({
        message: 'Service worker registration failed',
        color: 'negative',
        icon: 'error',
        timeout: 5000
      })
    }
  }
})
