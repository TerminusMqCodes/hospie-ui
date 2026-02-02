// Electron API type definitions
export interface ElectronAPI {
  isElectron: boolean
  platform: string
  
  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  toggleFullscreen: () => Promise<boolean>
  
  // App info
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  
  // File operations
  showSaveDialog: (options: any) => Promise<any>
  showOpenDialog: (options: any) => Promise<any>
  
  // External links
  openExternal: (url: string) => Promise<void>
  
  // Event listeners
  onOpenSettings?: (callback: () => void) => void
  onUpdateAvailable?: (callback: (info: any) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}