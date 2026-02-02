import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const platform = process.platform
let mainWindow

async function createWindow () {
  console.log('Creating enhanced Electron window...')

  // Enhanced window configuration
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: true, // Show immediately like before
    frame: false, // Borderless window
    titleBarStyle: 'hidden', // Hide title bar on macOS
    backgroundColor: '#1976d2',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: process.env.NODE_ENV === 'production', // Enable in production
      allowRunningInsecureContent: process.env.NODE_ENV !== 'production', // Only in development
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      )
    }
  })

  console.log('Window created, loading app...')

  // Load the Quasar app
  const devUrl = 'http://localhost:9001'
  console.log('Loading Quasar app from:', devUrl)

  try {
    await mainWindow.loadURL(devUrl)
    console.log('Quasar app loaded successfully')
    
    // Additional check to ensure content is loaded
    mainWindow.webContents.executeJavaScript(`
      console.log('Initial content check...')
      console.log('Document ready state:', document.readyState)
      console.log('Body innerHTML length:', document.body.innerHTML.length)
      console.log('Has #q-app:', !!document.querySelector('#q-app'))
    `)
    
  } catch (error) {
    console.error('Failed to load Quasar app:', error)
    
    // Try to reload after a delay
    setTimeout(async () => {
      console.log('Retrying to load app...')
      try {
        await mainWindow.loadURL(devUrl)
        console.log('App loaded successfully on retry')
      } catch (retryError) {
        console.error('Failed to load app on retry:', retryError)
      }
    }, 2000)
  }

  // Force show and focus
  mainWindow.show()
  mainWindow.focus()
  
  console.log('Window should be visible')
  console.log('Window bounds:', mainWindow.getBounds())
  console.log('Window visible:', mainWindow.isVisible())

  // Show window when ready (backup)
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready-to-show event fired')
    mainWindow.show()
    mainWindow.focus()
    
    // Ensure window controls are visible
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        console.log('Checking for window controls...')
        const controls = document.querySelector('.electron-window-controls')
        if (controls) {
          console.log('Window controls found')
          controls.style.display = 'block'
          controls.style.visibility = 'visible'
          controls.style.opacity = '1'
        } else {
          console.log('Window controls not found')
        }
      `)
    }, 2000)
  })

  // Enhanced event listeners
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready!')
    
    // Wait a bit for Vue to initialize, then apply fixes
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        console.log('Applying Electron CSS fixes...')
        
        // Fix visibility issues
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        document.body.classList.add('electron-app')
        
        const qApp = document.querySelector('#q-app')
        if (qApp) {
          console.log('Found #q-app element')
          qApp.style.minHeight = '100vh'
          qApp.style.visibility = 'visible'
          qApp.style.opacity = '1'
          qApp.style.display = 'block'
        } else {
          console.log('No #q-app element found')
        }
        
        // Make sure all elements are visible
        const allElements = document.querySelectorAll('*')
        allElements.forEach(el => {
          if (el.style.visibility === 'hidden') el.style.visibility = 'visible'
          if (el.style.opacity === '0') el.style.opacity = '1'
          if (el.style.display === 'none') el.style.display = 'block'
        })
        
        // Add platform-specific class
        document.body.classList.add('platform-${platform}')
        
        // Force a repaint
        document.body.style.transform = 'translateZ(0)'
        
        console.log('Enhanced CSS fixes applied for Electron')
        console.log('Body classes:', document.body.className)
        console.log('App element:', document.querySelector('#q-app'))
      `)
    }, 1000) // Wait 1 second for Vue to initialize
  })

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Prevent new window creation (security)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Handle external links
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.origin !== devUrl && !process.env.DEV) {
      event.preventDefault()
      shell.openExternal(navigationUrl)
    }
  })

  return mainWindow
}

// Enhanced Global shortcuts
function setupGlobalShortcuts() {
  console.log('Setting up enhanced global shortcuts...')
  
  // === CRITICAL WINDOW CONTROLS ONLY ===
  // Only register shortcuts that must work globally, even when app is not focused
  
  // F11 - Toggle fullscreen (global)
  const f11Result = globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen()
      mainWindow.setFullScreen(!isFullScreen)
      console.log('Global F11: Fullscreen toggled:', !isFullScreen)
    }
  })
  console.log('F11 global shortcut registered:', f11Result)

  // === DEVELOPMENT SHORTCUTS (GLOBAL) ===
  
  if (process.env.NODE_ENV === 'development') {
    // F12 - Toggle DevTools (global)
    const f12Result = globalShortcut.register('F12', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools()
        console.log('Global F12: DevTools toggled')
      }
    })
    console.log('F12 global shortcut registered:', f12Result)

    // Ctrl/Cmd + Shift + I - DevTools (global alternative)
    const devToolsResult = globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools()
        console.log('Global Ctrl+Shift+I: DevTools toggled')
      }
    })
    console.log('Ctrl+Shift+I global shortcut registered:', devToolsResult)
  }

  console.log('Enhanced global shortcuts registered successfully (minimal set)')
}

// Enhanced IPC handlers for window controls and shortcuts
function setupIpcHandlers() {
  console.log('Setting up enhanced IPC handlers...')
  
  // === WINDOW CONTROLS ===
  
  // Basic window controls
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
      return true
    }
    return false
  })

  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
        return false
      } else {
        mainWindow.maximize()
        return true
      }
    }
    return false
  })

  ipcMain.handle('window-close', () => {
    if (mainWindow) {
      mainWindow.close()
      return true
    }
    return false
  })

  ipcMain.handle('window-toggle-fullscreen', () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen()
      mainWindow.setFullScreen(!isFullScreen)
      return !isFullScreen
    }
    return false
  })

  // === WINDOW STATE ===
  
  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })

  ipcMain.handle('window-is-fullscreen', () => {
    return mainWindow ? mainWindow.isFullScreen() : false
  })

  ipcMain.handle('window-is-minimized', () => {
    return mainWindow ? mainWindow.isMinimized() : false
  })

  ipcMain.handle('window-get-bounds', () => {
    return mainWindow ? mainWindow.getBounds() : null
  })

  ipcMain.handle('window-set-bounds', (event, bounds) => {
    if (mainWindow && bounds) {
      mainWindow.setBounds(bounds)
      return true
    }
    return false
  })

  // === ZOOM CONTROLS ===
  
  ipcMain.handle('window-zoom-in', () => {
    if (mainWindow) {
      return mainWindow.webContents.executeJavaScript(`
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        const newZoom = Math.min(currentZoom + 0.1, 3);
        document.body.style.zoom = newZoom;
        newZoom;
      `)
    }
    return 1
  })

  ipcMain.handle('window-zoom-out', () => {
    if (mainWindow) {
      return mainWindow.webContents.executeJavaScript(`
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        const newZoom = Math.max(currentZoom - 0.1, 0.5);
        document.body.style.zoom = newZoom;
        newZoom;
      `)
    }
    return 1
  })

  ipcMain.handle('window-zoom-reset', () => {
    if (mainWindow) {
      return mainWindow.webContents.executeJavaScript(`
        document.body.style.zoom = 1;
        1;
      `)
    }
    return 1
  })

  ipcMain.handle('window-get-zoom', () => {
    if (mainWindow) {
      return mainWindow.webContents.executeJavaScript(`
        parseFloat(document.body.style.zoom) || 1;
      `)
    }
    return 1
  })

  // === APP INFO ===
  
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('get-platform', () => {
    return platform
  })

  ipcMain.handle('get-app-name', () => {
    return app.getName()
  })

  ipcMain.handle('get-app-path', () => {
    return app.getAppPath()
  })

  // === EXTERNAL ACTIONS ===
  
  ipcMain.handle('open-external', (event, url) => {
    if (url && typeof url === 'string') {
      shell.openExternal(url)
      return true
    }
    return false
  })

  ipcMain.handle('show-item-in-folder', (event, path) => {
    if (path && typeof path === 'string') {
      shell.showItemInFolder(path)
      return true
    }
    return false
  })

  // === DEVELOPMENT TOOLS ===
  
  if (process.env.NODE_ENV === 'development') {
    ipcMain.handle('dev-reload', () => {
      if (mainWindow) {
        mainWindow.reload()
        return true
      }
      return false
    })

    ipcMain.handle('dev-hard-reload', () => {
      if (mainWindow) {
        mainWindow.webContents.reloadIgnoringCache()
        return true
      }
      return false
    })

    ipcMain.handle('dev-toggle-devtools', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools()
        return true
      }
      return false
    })

    ipcMain.handle('dev-open-devtools', () => {
      if (mainWindow) {
        mainWindow.webContents.openDevTools()
        return true
      }
      return false
    })

    ipcMain.handle('dev-close-devtools', () => {
      if (mainWindow) {
        mainWindow.webContents.closeDevTools()
        return true
      }
      return false
    })
  }

  // === PRINT & EXPORT ===
  
  ipcMain.handle('print-page', () => {
    if (mainWindow) {
      mainWindow.webContents.print()
      return true
    }
    return false
  })

  ipcMain.handle('print-to-pdf', async (event, options = {}) => {
    if (mainWindow) {
      try {
        const data = await mainWindow.webContents.printToPDF(options)
        return data
      } catch (error) {
        console.error('Print to PDF error:', error)
        return null
      }
    }
    return null
  })

  // === NOTIFICATIONS ===
  
  ipcMain.handle('show-notification', (event, options) => {
    if (options && options.title) {
      const { Notification } = require('electron')
      if (Notification.isSupported()) {
        const notification = new Notification(options)
        notification.show()
        return true
      }
    }
    return false
  })

  // === SHORTCUTS INFO ===
  
  ipcMain.handle('get-shortcuts', () => {
    return {
      window: {
        'F11': 'Toggle Fullscreen',
        'Ctrl/Cmd + M': 'Minimize Window',
        'Ctrl/Cmd + Shift + M': 'Maximize/Restore Window',
        'Ctrl/Cmd + W': 'Close Window',
        'Alt + F4': 'Close Window (Windows)'
      },
      zoom: {
        'Ctrl/Cmd + Plus': 'Zoom In',
        'Ctrl/Cmd + Minus': 'Zoom Out',
        'Ctrl/Cmd + 0': 'Reset Zoom'
      },
      navigation: {
        'Ctrl/Cmd + Shift + H': 'Go to Home',
        'Ctrl/Cmd + Shift + B': 'Go to Reservations',
        'Ctrl/Cmd + Shift + G': 'Go to Guests',
        'Ctrl/Cmd + Shift + O': 'Go to Rooms'
      },
      search: {
        'Ctrl/Cmd + F': 'Focus Search',
        'Ctrl/Cmd + K': 'Command Palette'
      },
      utility: {
        'Ctrl/Cmd + Shift + C': 'Copy URL',
        'Ctrl/Cmd + Shift + T': 'Toggle Theme',
        'Ctrl/Cmd + P': 'Print',
        'Ctrl/Cmd + S': 'Save/Export',
        'Escape': 'Close Modals'
      },
      development: process.env.NODE_ENV === 'development' ? {
        'F12': 'Toggle DevTools',
        'Ctrl/Cmd + Shift + I': 'Toggle DevTools',
        'Ctrl/Cmd + R': 'Reload',
        'Ctrl/Cmd + Shift + R': 'Hard Reload',
        'F5': 'Reload (Windows)'
      } : {}
    }
  })

  console.log('Enhanced IPC handlers registered successfully')
}

// App event handlers
app.whenReady().then(async () => {
  await createWindow()
  
  // Set up global shortcuts
  setupGlobalShortcuts()
  
  // Set up IPC handlers
  setupIpcHandlers()
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Cleanup on quit
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()
})