import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'hu.terminusmq.hospie.ui',
  appName: 'Hospie PMS',
  webDir: 'dist/pwa',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#c45865',
      sound: 'beep.wav'
    },
    
    // Camera
    Camera: {
      permissions: ['camera', 'photos']
    },
    
    // Geolocation
    Geolocation: {
      permissions: ['location']
    },
    
    // App
    App: {
      launchUrl: 'hospie://app'
    },
    
    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#c45865'
    },
    
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#c45865',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    
    // Haptics
    Haptics: {},
    
    // Network
    Network: {},
    
    // Device
    Device: {},
    
    // File system
    Filesystem: {
      iosDangerouslyAllowFileAccess: true
    }
  },
  
  // iOS specific configuration
  ios: {
    scheme: 'hospie',
    contentInset: 'automatic',
    backgroundColor: '#c45865'
  },
  
  // Android specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#c45865'
  }
}

export default config