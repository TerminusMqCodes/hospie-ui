import { api } from 'src/boot/axios'

/**
 * Branding Service
 * Handles all branding-related API calls and tenant customization
 */
class BrandingService {
  /**
   * Get tenant branding configuration
   * @returns {Promise<Object>} Branding configuration
   */
  async getTenantBranding() {
    try {
      const response = await api.get('/branding')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch tenant branding:', error)
      throw error
    }
  }

  /**
   * Update tenant color scheme
   * @param {Object} colors - Color configuration
   * @returns {Promise<Object>} Updated branding
   */
  async updateColors(colors) {
    try {
      const response = await api.post('/branding/colors', { colors })
      return response.data.data
    } catch (error) {
      console.error('Failed to update colors:', error)
      throw error
    }
  }

  /**
   * Update tenant logo
   * @param {File} logoFile - Logo file to upload
   * @returns {Promise<Object>} Updated branding
   */
  async updateLogo(logoFile) {
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)
      
      const response = await api.post('/branding/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to update logo:', error)
      throw error
    }
  }

  /**
   * Update email branding
   * @param {Object} emailBranding - Email branding configuration
   * @returns {Promise<Object>} Updated branding
   */
  async updateEmailBranding(emailBranding) {
    try {
      const response = await api.post('/branding/email-branding', { email_branding: emailBranding })
      return response.data.data
    } catch (error) {
      console.error('Failed to update email branding:', error)
      throw error
    }
  }

  /**
   * Get CSS variables for tenant branding
   * @returns {Promise<Object>} CSS variables
   */
  async getCssVariables() {
    try {
      const response = await api.get('/branding/css-variables')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch CSS variables:', error)
      throw error
    }
  }

  /**
   * Get email template variables
   * @returns {Promise<Object>} Email variables
   */
  async getEmailVariables() {
    try {
      const response = await api.get('/branding/email-variables')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch email variables:', error)
      throw error
    }
  }

  /**
   * Preview branding changes
   * @param {Object} previewData - Preview configuration
   * @returns {Promise<Object>} Preview data
   */
  async previewBranding(previewData) {
    try {
      const response = await api.post('/branding/preview', previewData)
      return response.data.data
    } catch (error) {
      console.error('Failed to preview branding:', error)
      throw error
    }
  }

  /**
   * Reset branding to defaults
   * @returns {Promise<Object>} Reset confirmation
   */
  async resetBranding() {
    try {
      const response = await api.post('/branding/reset')
      return response.data
    } catch (error) {
      console.error('Failed to reset branding:', error)
      throw error
    }
  }

  /**
   * Generate PWA manifest with tenant branding
   * @returns {Promise<Object>} PWA manifest
   */
  async generateManifest() {
    try {
      const response = await api.get('/branding/manifest')
      return response.data
    } catch (error) {
      console.error('Failed to generate manifest:', error)
      throw error
    }
  }

  /**
   * Generate mobile app configuration
   * @returns {Promise<Object>} Mobile app config
   */
  async generateMobileAppConfig() {
    try {
      const response = await api.post('/branding/mobile-app')
      return response.data.data
    } catch (error) {
      console.error('Failed to generate mobile app config:', error)
      throw error
    }
  }

  /**
   * Update custom domain
   * @param {string} domain - Custom domain
   * @returns {Promise<Object>} Updated branding
   */
  async updateCustomDomain(domain) {
    try {
      const response = await api.post('/branding/domain', { domain })
      return response.data.data
    } catch (error) {
      console.error('Failed to update custom domain:', error)
      throw error
    }
  }
}

export default new BrandingService()