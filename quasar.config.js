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
    boot: ['electron'],

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
      
      // Production optimizations
      minify: ctx.prod,
      sourcemap: ctx.dev,
      
      // Bundle analysis
      analyze: ctx.prod && process.env.ANALYZE === 'true',
      
      // Modern build for better performance
      modern: ctx.prod,
      
      // Gzip compression
      gzip: ctx.prod,
      
      // Chunk optimization for better caching
      extendViteConf(viteConf) {
        if (ctx.prod) {
          // Optimize chunks
          viteConf.build = viteConf.build || {}
          viteConf.build.rollupOptions = viteConf.build.rollupOptions || {}
          viteConf.build.rollupOptions.output = {
            manualChunks: {
              // Vendor chunks
              'vendor-vue': ['vue', 'vue-router', 'pinia'],
              'vendor-quasar': ['quasar'],
              'vendor-utils': ['lodash-es', 'date-fns', 'axios'],
              
              // Feature-based chunks
              'charts': ['chart.js', 'chartjs-adapter-date-fns'],
              'icons': ['@quasar/extras'],
            },
            
            // Optimize chunk file names for better caching
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId
              if (facadeModuleId) {
                if (facadeModuleId.includes('node_modules')) {
                  return 'vendor/[name]-[hash].js'
                }
                if (facadeModuleId.includes('src/pages')) {
                  return 'pages/[name]-[hash].js'
                }
                if (facadeModuleId.includes('src/components')) {
                  return 'components/[name]-[hash].js'
                }
              }
              return 'chunks/[name]-[hash].js'
            },
            
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.')
              const ext = info[info.length - 1]
              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                return `images/[name]-[hash].${ext}`
              }
              if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                return `fonts/[name]-[hash].${ext}`
              }
              return `assets/[name]-[hash].${ext}`
            }
          }
          
          // Preload optimization
          viteConf.build.rollupOptions.external = viteConf.build.rollupOptions.external || []
          
          // Tree shaking optimization
          viteConf.build.rollupOptions.treeshake = {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          }
        }
        
        // Development optimizations
        if (ctx.dev) {
          viteConf.optimizeDeps = viteConf.optimizeDeps || {}
          viteConf.optimizeDeps.include = [
            'vue',
            'vue-router',
            'pinia',
            'quasar',
            'axios',
            'lodash-es'
          ]
        }
      },

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
        // Note: 'exclude' and 'runtimeCaching' are not supported in InjectManifest mode
        // These are handled in the custom service worker (src-pwa/custom-service-worker.js)
        
        // Glob patterns for files to include in precache
        cfg.globPatterns = cfg.globPatterns || []
        cfg.globPatterns.push('**/*.{js,css,html,png,jpg,jpeg,svg,gif,webp,ico,woff,woff2,ttf,eot}')
        
        // Ignore patterns (alternative to exclude)
        cfg.globIgnores = cfg.globIgnores || []
        cfg.globIgnores.push('**/*.map')
        cfg.globIgnores.push('**/manifest.json')
        cfg.globIgnores.push('**/firebase-messaging-sw.js')
        cfg.globIgnores.push('**/offline.html') // Exclude from glob to avoid duplication
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
        
        // App info
        name: 'Hospie PMS',
        productName: 'Hospie PMS',
        executableName: 'hospie-pms',
        
        // App metadata
        appBundleId: 'hu.terminusmq.hospie.pms',
        appCategoryType: 'public.app-category.business',
        appCopyright: 'Copyright © 2026 TerminusMQ. All rights reserved.',
        appVersion: '1.0.0',
        buildVersion: '1.0.0',
        
        // Platform specific
        platform: ['win32', 'darwin', 'linux'],
        arch: ['x64', 'arm64'],
        
        // Output
        out: 'dist/electron',
        overwrite: true,
        
        // App icon
        icon: 'src-electron/icons/icon',
        
        // Windows specific
        win32metadata: {
          CompanyName: 'TerminusMQ',
          FileDescription: 'Hospie PMS - Property Management System',
          OriginalFilename: 'hospie-pms.exe',
          ProductName: 'Hospie PMS',
          InternalName: 'hospie-pms'
        },
        
        // macOS specific
        darwinDarkModeSupport: true,
        
        // Ignore files/folders
        ignore: [
          /\.git/,
          /node_modules\/(?!.*\.(js|json)$)/,
          /src/,
          /public/,
          /\.env/,
          /\.quasar/,
          /quasar\.config\.js/,
          /package-lock\.json/,
          /yarn\.lock/
        ],
        
        // Prune dev dependencies
        prune: true,
        
        // Asar archive
        asar: true,
        
        // Download options
        download: {
          cacheRoot: '.electron-cache'
        }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'hu.terminusmq.hospie.pms',
        productName: 'Hospie PMS',
        copyright: 'Copyright © 2026 TerminusMQ. All rights reserved.',
        
        // Directories
        directories: {
          output: 'dist/electron-builder',
          buildResources: 'src-electron/build'
        },
        
        // Files to include
        files: [
          'dist/**/*',
          'node_modules/**/*',
          'package.json'
        ],
        
        // Files to exclude
        extraFiles: [],
        
        // Compression
        compression: 'maximum',
        
        // Auto-updater
        publish: null,
        
        // Windows configuration
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64', 'arm64']
            },
            {
              target: 'portable',
              arch: ['x64']
            }
          ],
          icon: 'src-electron/icons/icon.ico',
          requestedExecutionLevel: 'asInvoker',
          artifactName: '${productName}-${version}-${arch}.${ext}'
        },
        
        // NSIS installer (Windows)
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          allowElevation: true,
          installerIcon: 'src-electron/icons/icon.ico',
          uninstallerIcon: 'src-electron/icons/icon.ico',
          installerHeaderIcon: 'src-electron/icons/icon.ico',
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: 'Hospie PMS',
          include: 'src-electron/build/installer.nsh'
        },
        
        // macOS configuration
        mac: {
          target: [
            {
              target: 'dmg',
              arch: ['x64', 'arm64']
            },
            {
              target: 'zip',
              arch: ['x64', 'arm64']
            }
          ],
          icon: 'src-electron/icons/icon.icns',
          category: 'public.app-category.business',
          darkModeSupport: true,
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'src-electron/build/entitlements.mac.plist',
          entitlementsInherit: 'src-electron/build/entitlements.mac.plist',
          artifactName: '${productName}-${version}-${arch}.${ext}'
        },
        
        // DMG configuration (macOS)
        dmg: {
          title: 'Hospie PMS ${version}',
          icon: 'src-electron/icons/icon.icns',
          background: 'src-electron/build/background.png',
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ]
        },
        
        // Linux configuration
        linux: {
          target: [
            {
              target: 'AppImage',
              arch: ['x64', 'arm64']
            },
            {
              target: 'deb',
              arch: ['x64', 'arm64']
            },
            {
              target: 'rpm',
              arch: ['x64', 'arm64']
            }
          ],
          icon: 'src-electron/icons/',
          category: 'Office',
          desktop: {
            Name: 'Hospie PMS',
            Comment: 'Property Management System for Hotels',
            Keywords: 'hotel;pms;management;booking;reservation;',
            StartupWMClass: 'hospie-pms'
          },
          artifactName: '${productName}-${version}-${arch}.${ext}'
        },
        
        // AppImage configuration (Linux)
        appImage: {
          license: 'LICENSE'
        },
        
        // Debian package configuration (Linux)
        deb: {
          depends: ['gconf2', 'gconf-service', 'libnotify4', 'libappindicator1', 'libxtst6', 'libnss3'],
          recommends: ['pulseaudio | libasound2-dev'],
          afterInstall: 'src-electron/build/linux-after-install.sh',
          afterRemove: 'src-electron/build/linux-after-remove.sh'
        },
        
        // RPM package configuration (Linux)
        rpm: {
          depends: ['libXScrnSaver'],
          afterInstall: 'src-electron/build/linux-after-install.sh',
          afterRemove: 'src-electron/build/linux-after-remove.sh'
        }
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
