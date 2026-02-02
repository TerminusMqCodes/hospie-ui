/**
 * Enhanced preload script for Electron with comprehensive shortcuts
 */

import { contextBridge, ipcRenderer } from 'electron'

console.log('Enhanced preload script loading...')

// Expose enhanced protected methods
contextBridge.exposeInMainWorld('electronAPI', {
  // === WINDOW CONTROLS ===
  
  // Basic window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  toggleFullscreen: () => ipcRenderer.invoke('window-toggle-fullscreen'),

  // Window state
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  isFullscreen: () => ipcRenderer.invoke('window-is-fullscreen'),
  isMinimized: () => ipcRenderer.invoke('window-is-minimized'),
  getBounds: () => ipcRenderer.invoke('window-get-bounds'),
  setBounds: (bounds) => ipcRenderer.invoke('window-set-bounds', bounds),

  // === ZOOM CONTROLS ===
  
  zoomIn: () => ipcRenderer.invoke('window-zoom-in'),
  zoomOut: () => ipcRenderer.invoke('window-zoom-out'),
  zoomReset: () => ipcRenderer.invoke('window-zoom-reset'),
  getZoom: () => ipcRenderer.invoke('window-get-zoom'),

  // === APP INFO ===
  
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // === EXTERNAL ACTIONS ===
  
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),

  // === DEVELOPMENT TOOLS ===
  
  ...(process.env.NODE_ENV === 'development' ? {
    devReload: () => ipcRenderer.invoke('dev-reload'),
    devHardReload: () => ipcRenderer.invoke('dev-hard-reload'),
    devToggleDevTools: () => ipcRenderer.invoke('dev-toggle-devtools'),
    devOpenDevTools: () => ipcRenderer.invoke('dev-open-devtools'),
    devCloseDevTools: () => ipcRenderer.invoke('dev-close-devtools'),
  } : {}),

  // === PRINT & EXPORT ===
  
  printPage: () => ipcRenderer.invoke('print-page'),
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),

  // === NOTIFICATIONS ===
  
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // === SHORTCUTS INFO ===
  
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),

  // === SYSTEM INFO ===
  
  isElectron: true,
  platform: process.platform,
  
  // === UTILITY FUNCTIONS ===
  
  // Copy text to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  },

  // Read from clipboard
  readFromClipboard: async () => {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
      return ''
    }
  },

  // Get current URL
  getCurrentURL: () => window.location.href,

  // Navigate to URL
  navigateTo: (path) => {
    if (window.$router) {
      window.$router.push(path)
      return true
    }
    return false
  },

  // Focus search input
  focusSearch: () => {
    const searchInput = document.querySelector('.GNL__toolbar-input input') || 
                       document.querySelector('input[placeholder*="Search"]') ||
                       document.querySelector('input[type="search"]')
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
      return true
    }
    return false
  },

  // Toggle theme
  toggleTheme: () => {
    const darkModeToggle = document.querySelector('[data-cy="dark-mode-toggle"]') ||
                          document.querySelector('.q-dark-toggle') ||
                          document.querySelector('[aria-label*="dark"]')
    if (darkModeToggle) {
      darkModeToggle.click()
      return true
    } else {
      document.body.classList.toggle('body--dark')
      return true
    }
  },

  // Close modals
  closeModals: () => {
    const modal = document.querySelector('.q-dialog') || 
                 document.querySelector('.q-menu') ||
                 document.querySelector('[role="dialog"]')
    if (modal) {
      const closeBtn = modal.querySelector('.q-btn[aria-label*="close"]') ||
                      modal.querySelector('.q-btn[data-cy="close"]') ||
                      modal.querySelector('.close-btn')
      if (closeBtn) {
        closeBtn.click()
        return true
      }
    }
    return false
  },

  // Trigger save action
  triggerSave: () => {
    const saveBtn = document.querySelector('[data-cy="save"]') ||
                   document.querySelector('.save-btn') ||
                   document.querySelector('[aria-label*="save"]')
    if (saveBtn) {
      saveBtn.click()
      return true
    } else {
      const event = new CustomEvent('app-save')
      document.dispatchEvent(event)
      return true
    }
  },

  // Open command palette
  openCommandPalette: () => {
    const event = new CustomEvent('open-command-palette')
    document.dispatchEvent(event)
    return true
  }
})

console.log('Enhanced preload script loaded successfully with comprehensive shortcuts')