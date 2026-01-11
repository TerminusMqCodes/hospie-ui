// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'dark-mode', 'websocket', 'firebase', 'pwa'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            ssr: ctx.modeName === 'ssr',

            // you need to set i18n resource including paths !
            include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
          },
        ],

        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      port: 9001, // Set the development server port to 9001
      open: true, // opens browser window automatically
      proxy: {
        '/api': {
          target: 'http://localhost:80', // Laravel development server via Docker
          changeOrigin: true,
          secure: false,
          logLevel: 'debug' // Add logging to debug proxy issues
        }
      }
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        brand: {
          primary: '#c45865',
          secondary: '#d68691',
          accent: '#9C27B0',

          dark: '#1d1d1d',
          'dark-page': '#121212',

          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        }
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'InjectManifest', // Use custom service worker
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      injectPwaMetaTags: true,
      
      // PWA Manifest configuration
      extendManifestJson (json) {
        json.name = 'Hospie PMS'
        json.short_name = 'Hospie'
        json.description = 'Modern Property Management System for Hotels and Hospitality'
        json.display = 'standalone'
        json.orientation = 'any'
        json.theme_color = '#c45865'
        json.background_color = '#ffffff'
        json.start_url = '/'
        json.scope = '/'
        json.categories = ['business', 'productivity', 'utilities']
        json.lang = 'en-US'
        
        // Enhanced shortcuts
        json.shortcuts = [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View main dashboard',
            url: '/dashboard',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Reservations',
            short_name: 'Bookings',
            description: 'Manage reservations',
            url: '/reservations',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Rooms',
            short_name: 'Rooms',
            description: 'Room management',
            url: '/rooms',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Guests',
            short_name: 'Guests',
            description: 'Guest management',
            url: '/guests',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
        
        // Protocol handlers for deep linking
        json.protocol_handlers = [
          {
            protocol: 'web+hospie',
            url: '/?handler=%s'
          }
        ]
        
        // File handlers
        json.file_handlers = [
          {
            action: '/import',
            accept: {
              'text/csv': ['.csv'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            }
          }
        ]
        
        // Share target for receiving shared content
        json.share_target = {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'files',
                accept: ['image/*', 'text/csv', '.pdf']
              }
            ]
          }
        }
      },

      // Custom service worker with advanced features
      extendInjectManifestOptions (cfg) {
        cfg.exclude = cfg.exclude || []
        cfg.exclude.push(/\.map$/)
        cfg.exclude.push(/manifest\.json$/)
        cfg.exclude.push(/firebase-messaging-sw\.js$/)
        
        // Include additional files for offline use
        cfg.additionalManifestEntries = [
          { url: '/offline.html', revision: null },
          { url: '/firebase-messaging-sw.js', revision: null }
        ]
        
        // Advanced caching strategies
        cfg.runtimeCaching = [
          // API calls - Network First with offline fallback
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hospie-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          },
          
          // Images - Cache First with long expiration
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hospie-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // Static assets - Stale While Revalidate
          {
            urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hospie-static-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // Google Fonts - Stale While Revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          
          // Google Fonts WebFonts - Cache First
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
      
      // iOS specific configuration
      iosStatusBarPadding: true,
      
      // Android specific configuration
      androidVersionCode: '10001',
      
      // Capacitor plugins configuration
      capacitorCliPreparationHooks: [
        'capacitor:copy:before',
        'capacitor:copy:after'
      ],
      
      // Additional Capacitor configuration
      extendCapacitorConf (capacitorConf) {
        // iOS configuration
        capacitorConf.ios = capacitorConf.ios || {}
        capacitorConf.ios.scheme = 'hospie'
        capacitorConf.ios.contentInset = 'automatic'
        capacitorConf.ios.backgroundColor = '#c45865'
        
        // Android configuration
        capacitorConf.android = capacitorConf.android || {}
        capacitorConf.android.allowMixedContent = true
        capacitorConf.android.captureInput = true
        capacitorConf.android.webContentsDebuggingEnabled = true
        capacitorConf.android.backgroundColor = '#c45865'
        
        // Server configuration for development
        if (process.env.NODE_ENV === 'development') {
          capacitorConf.server = {
            url: 'http://localhost:9001',
            cleartext: true
          }
        }
        
        // Plugins configuration
        capacitorConf.plugins = capacitorConf.plugins || {}
        
        // Push Notifications
        capacitorConf.plugins.PushNotifications = {
          presentationOptions: ['badge', 'sound', 'alert']
        }
        
        // Local Notifications
        capacitorConf.plugins.LocalNotifications = {
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#c45865',
          sound: 'beep.wav'
        }
        
        // Camera
        capacitorConf.plugins.Camera = {
          permissions: ['camera', 'photos']
        }
        
        // Geolocation
        capacitorConf.plugins.Geolocation = {
          permissions: ['location']
        }
        
        // App
        capacitorConf.plugins.App = {
          launchUrl: 'hospie://app'
        }
        
        // Status Bar
        capacitorConf.plugins.StatusBar = {
          style: 'dark',
          backgroundColor: '#c45865'
        }
        
        // Splash Screen
        capacitorConf.plugins.SplashScreen = {
          launchShowDuration: 2000,
          backgroundColor: '#c45865',
          showSpinner: true,
          spinnerColor: '#ffffff'
        }
        
        // Keyboard
        capacitorConf.plugins.Keyboard = {
          resize: 'body',
          style: 'dark',
          resizeOnFullScreen: true
        }
        
        // Haptics
        capacitorConf.plugins.Haptics = {}
        
        // Network
        capacitorConf.plugins.Network = {}
        
        // Device
        capacitorConf.plugins.Device = {}
        
        // File system
        capacitorConf.plugins.Filesystem = {
          iosDangerouslyAllowFileAccess: true
        }
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'hu.terminusmq.hospie.ui',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  }
})
