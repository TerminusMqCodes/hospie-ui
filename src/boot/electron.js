import { boot } from 'quasar/wrappers'

// Electron-specific functionality
export default boot(({ app, router }) => {
  // Check if running in Electron
  const electronAPI = window.electronAPI
  const isElectron = electronAPI?.isElectron || false
  
  console.log('Boot file loading, isElectron:', isElectron)
  
  if (isElectron && electronAPI) {
    console.log('Running in Electron mode with enhanced features')
    
    // Add Electron-specific global properties
    app.config.globalProperties.$electron = electronAPI
    app.config.globalProperties.$isElectron = true
    
    // Wait for DOM to be ready before applying fixes
    const applyElectronFixes = () => {
      console.log('Applying Electron fixes from boot file...')
      
      // Add Electron-specific CSS class to body
      document.body.classList.add('electron-app')
      
      // Add platform-specific class
      if (electronAPI.platform) {
        document.body.classList.add(`platform-${electronAPI.platform}`)
      }
      
      // Ensure main app is visible
      const qApp = document.querySelector('#q-app')
      if (qApp) {
        console.log('Found #q-app in boot file')
        qApp.style.visibility = 'visible'
        qApp.style.opacity = '1'
        qApp.style.display = 'block'
      }
      
      // Force visibility of all major components
      const mainLayout = document.querySelector('.q-layout')
      if (mainLayout) {
        mainLayout.style.visibility = 'visible'
        mainLayout.style.opacity = '1'
      }
      
      console.log('Electron fixes applied from boot file')
    }
    
    // Apply fixes when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyElectronFixes)
    } else {
      applyElectronFixes()
    }
    
    // Also apply fixes after a delay to ensure Vue has rendered
    setTimeout(applyElectronFixes, 500)
    setTimeout(applyElectronFixes, 1500)
    
    // Handle external links in Electron
    document.addEventListener('click', (event) => {
      const target = event.target
      const link = target.closest('a')
      if (link && link.href && link.target === '_blank') {
        event.preventDefault()
        electronAPI.openExternal(link.href)
      }
    })
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Log all key events for debugging
      const keyCombo = []
      if (event.ctrlKey) keyCombo.push('Ctrl')
      if (event.metaKey) keyCombo.push('Cmd')
      if (event.shiftKey) keyCombo.push('Shift')
      if (event.altKey) keyCombo.push('Alt')
      keyCombo.push(event.key)
      
      console.log('🎹 Key pressed:', keyCombo.join('+'), 'Code:', event.code, 'KeyCode:', event.keyCode)
      
      // F11 - Toggle fullscreen
      if (event.key === 'F11') {
        event.preventDefault()
        console.log('✅ F11 handled in boot file')
        electronAPI.toggleFullscreen()
      }
      
      // Ctrl/Cmd + R - Reload (development only)
      if ((event.ctrlKey || event.metaKey) && event.key === 'r' && process.env.DEV) {
        event.preventDefault()
        if (electronAPI.devReload) {
          electronAPI.devReload()
        } else {
          window.location.reload()
        }
      }
      
      // Ctrl/Cmd + Shift + R - Hard reload (development only)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R' && process.env.DEV) {
        event.preventDefault()
        if (electronAPI.devHardReload) {
          electronAPI.devHardReload()
        }
      }
      
      // F5 - Reload (Windows style, development only)
      if (event.key === 'F5' && process.env.DEV) {
        event.preventDefault()
        if (electronAPI.devReload) {
          electronAPI.devReload()
        } else {
          window.location.reload()
        }
      }
      
      // F12 - Toggle DevTools (development only)
      if (event.key === 'F12' && process.env.DEV) {
        event.preventDefault()
        if (electronAPI.devToggleDevTools) {
          electronAPI.devToggleDevTools()
        }
      }
      
      // Ctrl/Cmd + Shift + I - Toggle DevTools (development only)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I' && process.env.DEV) {
        event.preventDefault()
        if (electronAPI.devToggleDevTools) {
          electronAPI.devToggleDevTools()
        }
      }
      
      // Ctrl/Cmd + M - Minimize
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault()
        electronAPI.minimizeWindow()
      }
      
      // Ctrl/Cmd + Shift + M - Maximize/Restore
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault()
        electronAPI.maximizeWindow()
      }
      
      // Ctrl/Cmd + W - Close window
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        event.preventDefault()
        electronAPI.closeWindow()
      }
      
      // Alt + F4 - Close window (Windows)
      if (event.altKey && event.key === 'F4') {
        event.preventDefault()
        electronAPI.closeWindow()
      }
      
      // Ctrl/Cmd + Plus - Zoom in
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault()
        electronAPI.zoomIn()
      }
      
      // Ctrl/Cmd + Minus - Zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault()
        electronAPI.zoomOut()
      }
      
      // Ctrl/Cmd + 0 - Reset zoom
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault()
        electronAPI.zoomReset()
      }
      
      // Ctrl/Cmd + F - Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        console.log('✅ Ctrl+F handled in boot file')
        if (electronAPI.focusSearch) {
          const result = electronAPI.focusSearch()
          console.log('Focus search result:', result)
        } else {
          console.log('❌ electronAPI.focusSearch not available')
        }
      }
      
      // Ctrl/Cmd + M - Minimize
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault()
        console.log('✅ Ctrl+M handled in boot file')
        if (electronAPI.minimizeWindow) {
          electronAPI.minimizeWindow()
        } else {
          console.log('❌ electronAPI.minimizeWindow not available')
        }
      }
      
      // Ctrl/Cmd + K - Command palette
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        electronAPI.openCommandPalette()
      }
      
      // Ctrl/Cmd + Shift + H - Go to home
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault()
        electronAPI.navigateTo('/')
      }
      
      // Ctrl/Cmd + Shift + B - Go to reservations
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'B') {
        event.preventDefault()
        electronAPI.navigateTo('/reservations')
      }
      
      // Ctrl/Cmd + Shift + G - Go to guests
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'G') {
        event.preventDefault()
        electronAPI.navigateTo('/guests')
      }
      
      // Ctrl/Cmd + Shift + O - Go to rooms
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'O') {
        event.preventDefault()
        electronAPI.navigateTo('/rooms')
      }
      
      // Ctrl/Cmd + Shift + C - Copy URL
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault()
        electronAPI.copyToClipboard(window.location.href)
      }
      
      // Ctrl/Cmd + Shift + T - Toggle theme
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        electronAPI.toggleTheme()
      }
      
      // Ctrl/Cmd + P - Print
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault()
        electronAPI.printPage()
      }
      
      // Ctrl/Cmd + S - Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        electronAPI.triggerSave()
      }
      
      // Escape - Close modals
      if (event.key === 'Escape') {
        electronAPI.closeModals()
      }
      
      // Ctrl/Cmd + ? - Show shortcuts help
      if ((event.ctrlKey || event.metaKey) && (event.key === '?' || event.key === '/')) {
        event.preventDefault()
        // Dispatch custom event to show shortcuts help
        const shortcutsEvent = new CustomEvent('show-shortcuts-help')
        document.dispatchEvent(shortcutsEvent)
      }
    })
    
    // Handle window focus/blur for better UX
    window.addEventListener('focus', () => {
      document.body.classList.add('window-focused')
    })
    
    window.addEventListener('blur', () => {
      document.body.classList.remove('window-focused')
    })
    
    // Enhanced error handling
    window.addEventListener('error', (event) => {
      console.error('Electron app error:', event.error)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
    })
    
    // Router navigation enhancements for Electron
    router.beforeEach((to, from, next) => {
      console.log(`Navigating from ${from.path} to ${to.path}`)
      next()
    })
    
    // Add custom CSS for Electron enhancements
    const electronStyles = document.createElement('style')
    electronStyles.textContent = `
      .electron-app {
        /* Enhanced scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Prevent text selection in window controls */
        .electron-window-controls {
          user-select: none;
          -webkit-user-select: none;
        }
        
        /* Enhanced focus states */
        &.window-focused {
          .q-header {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }
        
        /* Ensure main content is visible */
        #q-app {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .q-layout {
          visibility: visible !important;
          opacity: 1 !important;
        }
      }
      
      /* Dark mode adjustments */
      .body--dark.electron-app {
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    `
    document.head.appendChild(electronStyles)
    
  } else {
    // Running in browser
    app.config.globalProperties.$isElectron = false
    console.log('Running in browser mode')
  }
})