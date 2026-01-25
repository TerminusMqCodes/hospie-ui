import { defineStore } from 'pinia'
import brandingService from 'src/services/brandingService'

export const useBrandingStore = defineStore('branding', {
  state: () => ({
    // Tenant branding configuration
    tenantBranding: null,
    
    // CSS variables for dynamic theming
    cssVariables: '',
    variablesObject: {},
    
    // Email template variables
    emailVariables: {},
    
    // Loading states
    loading: false,
    updating: false,
    
    // Error handling
    error: null,
    
    // Cache timestamp
    lastUpdated: null,
    
    // Applied branding state
    isApplied: false
  }),

  getters: {
    // Get tenant information
    tenantName: (state) => state.tenantBranding?.tenant_name || '',
    tenantId: (state) => state.tenantBranding?.tenant_id || null,
    
    // Get branding configuration
    branding: (state) => state.tenantBranding?.branding || {},
    
    // Get color scheme
    colors: (state) => state.tenantBranding?.branding?.colors || {},
    primaryColor: (state) => state.tenantBranding?.branding?.colors?.primary || '#1976d2',
    secondaryColor: (state) => state.tenantBranding?.branding?.colors?.secondary || '#26a69a',
    accentColor: (state) => state.tenantBranding?.branding?.colors?.accent || '#9c27b0',
    
    // Get logo information
    logo: (state) => state.tenantBranding?.branding?.logo || null,
    logoUrl: (state) => state.tenantBranding?.branding?.logo?.url || null,
    
    // Get email branding
    emailBranding: (state) => state.tenantBranding?.branding?.email || {},
    
    // Get custom domain
    customDomain: (state) => state.tenantBranding?.branding?.custom_domain || null,
    
    // Check if branding is loaded
    isLoaded: (state) => !!state.tenantBranding,
    
    // Check if branding has been customized
    isCustomized: (state) => {
      const branding = state.tenantBranding?.branding
      return !!(branding?.colors || branding?.logo || branding?.email || branding?.custom_domain)
    },
    
    // Get theme configuration for Quasar
    quasarTheme: (state) => {
      const colors = state.tenantBranding?.branding?.colors || {}
      return {
        primary: colors.primary || '#1976d2',
        secondary: colors.secondary || '#26a69a',
        accent: colors.accent || '#9c27b0',
        positive: colors.success || '#21ba45',
        negative: colors.error || '#c10015',
        info: colors.info || '#31ccec',
        warning: colors.warning || '#f2c037',
        dark: colors.dark || '#1d1d1d',
        'dark-page': colors['dark-page'] || '#121212'
      }
    }
  },

  actions: {
    /**
     * Load tenant branding configuration
     */
    async loadTenantBranding() {
      if (this.loading) return
      
      this.loading = true
      this.error = null
      
      try {
        const data = await brandingService.getTenantBranding()
        this.tenantBranding = data
        this.lastUpdated = new Date()
        
        // Load CSS variables
        await this.loadCssVariables()
        
        // Apply branding to the UI
        this.applyBranding()
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load tenant branding'
        console.error('Failed to load tenant branding:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Load CSS variables for dynamic theming
     */
    async loadCssVariables() {
      try {
        const data = await brandingService.getCssVariables()
        this.cssVariables = data.css_variables || ''
        this.variablesObject = data.variables_object || {}
        return data
      } catch (error) {
        console.error('Failed to load CSS variables:', error)
        throw error
      }
    },

    /**
     * Load email template variables
     */
    async loadEmailVariables() {
      try {
        const data = await brandingService.getEmailVariables()
        this.emailVariables = data.email_variables || {}
        return data
      } catch (error) {
        console.error('Failed to load email variables:', error)
        throw error
      }
    },

    /**
     * Update tenant colors
     */
    async updateColors(colors) {
      this.updating = true
      this.error = null
      
      try {
        const data = await brandingService.updateColors(colors)
        
        // Update local state
        if (this.tenantBranding) {
          this.tenantBranding.branding = {
            ...this.tenantBranding.branding,
            colors: data.colors
          }
        }
        
        // Reload CSS variables and apply branding
        await this.loadCssVariables()
        this.applyBranding()
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update colors'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Update tenant logo
     */
    async updateLogo(logoFile) {
      this.updating = true
      this.error = null
      
      try {
        const data = await brandingService.updateLogo(logoFile)
        
        // Update local state
        if (this.tenantBranding) {
          this.tenantBranding.branding = {
            ...this.tenantBranding.branding,
            logo: data.logo
          }
        }
        
        // Apply branding changes
        this.applyBranding()
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update logo'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Update email branding
     */
    async updateEmailBranding(emailBranding) {
      this.updating = true
      this.error = null
      
      try {
        const data = await brandingService.updateEmailBranding(emailBranding)
        
        // Update local state
        if (this.tenantBranding) {
          this.tenantBranding.branding = {
            ...this.tenantBranding.branding,
            email: data.email_branding
          }
        }
        
        // Reload email variables
        await this.loadEmailVariables()
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update email branding'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Update custom domain
     */
    async updateCustomDomain(domain) {
      this.updating = true
      this.error = null
      
      try {
        const data = await brandingService.updateCustomDomain(domain)
        
        // Update local state
        if (this.tenantBranding) {
          this.tenantBranding.branding = {
            ...this.tenantBranding.branding,
            custom_domain: data.custom_domain
          }
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update custom domain'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Preview branding changes
     */
    async previewBranding(previewData) {
      try {
        const data = await brandingService.previewBranding(previewData)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to preview branding'
        throw error
      }
    },

    /**
     * Reset branding to defaults
     */
    async resetBranding() {
      this.updating = true
      this.error = null
      
      try {
        await brandingService.resetBranding()
        
        // Reload branding configuration
        await this.loadTenantBranding()
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reset branding'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Generate PWA manifest
     */
    async generateManifest() {
      try {
        const manifest = await brandingService.generateManifest()
        return manifest
      } catch (error) {
        console.error('Failed to generate manifest:', error)
        throw error
      }
    },

    /**
     * Generate mobile app configuration
     */
    async generateMobileAppConfig() {
      try {
        const config = await brandingService.generateMobileAppConfig()
        return config
      } catch (error) {
        console.error('Failed to generate mobile app config:', error)
        throw error
      }
    },

    /**
     * Apply branding to the UI
     */
    applyBranding() {
      if (!this.tenantBranding) return
      
      const colors = this.colors
      const logo = this.logo
      
      // Apply CSS variables to document root
      if (this.cssVariables) {
        this.applyCssVariables()
      }
      
      // Update document title
      if (this.tenantName) {
        document.title = `${this.tenantName} - Hotel Management System`
      }
      
      // Update favicon if logo exists
      if (logo?.url) {
        this.updateFavicon(logo.url)
      }
      
      // Update meta theme color
      if (colors.primary) {
        this.updateMetaThemeColor(colors.primary)
      }
      
      // Apply Quasar theme
      this.applyQuasarTheme()
      
      this.isApplied = true
    },

    /**
     * Apply CSS variables to document
     */
    applyCssVariables() {
      const root = document.documentElement
      
      // Apply variables from the CSS variables string
      if (this.cssVariables && typeof this.cssVariables === 'string') {
        // Parse CSS variables and apply them
        const variables = this.parseCssVariables(this.cssVariables)
        Object.entries(variables).forEach(([property, value]) => {
          root.style.setProperty(property, value)
        })
      } else if (this.cssVariables) {
        console.warn('applyCssVariables: cssVariables is not a string:', this.cssVariables)
      }
      
      // Apply variables from the variables object
      Object.entries(this.variablesObject).forEach(([property, value]) => {
        if (property.startsWith('--')) {
          root.style.setProperty(property, value)
        } else {
          root.style.setProperty(`--${property}`, value)
        }
      })
    },

    /**
     * Parse CSS variables string
     */
    parseCssVariables(cssString) {
      const variables = {}
      
      // Add type checking to prevent errors
      if (!cssString || typeof cssString !== 'string') {
        console.warn('parseCssVariables: cssString is not a valid string:', cssString)
        return variables
      }
      
      const lines = cssString.split('\n')
      
      lines.forEach(line => {
        const trimmed = line.trim()
        if (trimmed.includes(':')) {
          const [property, value] = trimmed.split(':').map(s => s.trim())
          if (property.startsWith('--') && value.endsWith(';')) {
            variables[property] = value.slice(0, -1) // Remove semicolon
          }
        }
      })
      
      return variables
    },

    /**
     * Update favicon
     */
    updateFavicon(iconUrl) {
      let favicon = document.querySelector('link[rel="icon"]')
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = iconUrl
    },

    /**
     * Update meta theme color
     */
    updateMetaThemeColor(color) {
      let metaTheme = document.querySelector('meta[name="theme-color"]')
      if (!metaTheme) {
        metaTheme = document.createElement('meta')
        metaTheme.name = 'theme-color'
        document.head.appendChild(metaTheme)
      }
      metaTheme.content = color
    },

    /**
     * Apply Quasar theme colors
     */
    applyQuasarTheme() {
      // This would typically be handled by Quasar's theme system
      // For now, we'll apply CSS custom properties that Quasar can use
      const theme = this.quasarTheme
      const root = document.documentElement
      
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--q-${key}`, value)
      })
    },

    /**
     * Set default branding when tenant branding fails to load
     */
    setDefaultBranding() {
      this.tenantBranding = {
        tenant_id: null,
        tenant_name: 'Hospie PMS',
        branding: {
          colors: {
            primary: '#c45865',
            secondary: '#d68691',
            accent: '#9C27B0',
            background: '#ffffff',
            surface: '#f5f5f5',
            error: '#C10015',
            warning: '#F2C037',
            info: '#31CCEC',
            success: '#21BA45',
          },
          logo: {
            url: null,
            alt: 'Hospie PMS',
          },
          custom_domain: null,
          email: {
            header_text: null,
            footer_text: null,
            support_email: null,
            signature: null,
          },
        },
        css_variables: this.generateDefaultCssVariables(),
        email_variables: {},
      }
      
      this.cssVariables = this.generateDefaultCssVariables()
      this.variablesObject = this.tenantBranding.branding.colors
      this.lastUpdated = new Date()
      
      // Apply the default branding
      this.applyBranding()
    },

    /**
     * Generate default CSS variables
     */
    generateDefaultCssVariables() {
      const colors = {
        primary: '#c45865',
        secondary: '#d68691',
        accent: '#9C27B0',
        background: '#ffffff',
        surface: '#f5f5f5',
        error: '#C10015',
        warning: '#F2C037',
        info: '#31CCEC',
        success: '#21BA45',
      }
      
      let cssString = ''
      Object.entries(colors).forEach(([key, value]) => {
        cssString += `--color-${key}: ${value};\n`
        cssString += `--q-${key}: ${value};\n`
      })
      
      return cssString
    },

    /**
     * Clear branding state
     */
    clearBranding() {
      this.tenantBranding = null
      this.cssVariables = ''
      this.variablesObject = {}
      this.emailVariables = {}
      this.error = null
      this.lastUpdated = null
      this.isApplied = false
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Check if branding needs refresh
     */
    needsRefresh(maxAge = 5 * 60 * 1000) { // 5 minutes default
      if (!this.lastUpdated) return true
      return Date.now() - this.lastUpdated.getTime() > maxAge
    },

    /**
     * Refresh branding if needed
     */
    async refreshIfNeeded() {
      if (this.needsRefresh()) {
        await this.loadTenantBranding()
      }
    }
  }
})