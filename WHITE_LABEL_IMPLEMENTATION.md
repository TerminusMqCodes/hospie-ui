# White Label Implementation - Frontend

This document describes the white label customization system implemented for the Hospie UI frontend application.

## Overview

The white label system allows tenants to customize their hotel management interface with:
- Custom colors and themes
- Logo branding
- Email template customization
- Custom domains
- Mobile app configuration
- PWA manifest generation

## Architecture

### Core Components

1. **BrandingService** (`src/services/brandingService.js`)
   - Handles API communication with the backend branding system
   - Provides methods for CRUD operations on branding configuration

2. **BrandingStore** (`src/stores/branding.js`)
   - Pinia store for managing branding state
   - Reactive branding configuration
   - Automatic theme application

3. **useBranding Composable** (`src/composables/useBranding.js`)
   - Vue composable for easy branding integration
   - Provides reactive branding data and methods
   - Handles notifications and error states

4. **DynamicTheme Component** (`src/components/DynamicTheme.vue`)
   - Applies CSS variables based on tenant branding
   - Real-time theme updates
   - Quasar component styling integration

### Key Features

#### 1. Dynamic Theming
- CSS custom properties for real-time color updates
- Automatic Quasar theme integration
- Support for light and dark modes
- Responsive design considerations

#### 2. Logo Management
- Logo upload and display
- Automatic favicon updates
- Responsive logo sizing
- Fallback to default branding

#### 3. Email Branding
- Custom email headers and footers
- Support email configuration
- Email signature customization
- Template variable generation

#### 4. Custom Domains
- Custom domain configuration
- Domain validation
- SSL certificate management (backend)

#### 5. Mobile App Support
- PWA manifest generation
- Mobile app configuration
- Capacitor integration ready
- App store branding assets

## Implementation Details

### 1. Branding Service Integration

```javascript
import { useBranding } from 'src/composables/useBranding'

const {
  tenantName,
  logoUrl,
  colors,
  updateColors,
  updateLogo
} = useBranding()
```

### 2. Component Branding

```vue
<template>
  <q-btn class="brand-btn-primary">
    Custom Branded Button
  </q-btn>
</template>

<style>
.brand-btn-primary {
  background: var(--brand-gradient-primary);
  color: white;
}
</style>
```

### 3. Dynamic CSS Variables

The system automatically applies these CSS variables:
- `--brand-primary`: Primary brand color
- `--brand-secondary`: Secondary brand color
- `--brand-accent`: Accent color
- `--brand-logo-url`: Logo URL for CSS backgrounds
- `--brand-gradient-primary`: Primary gradient
- `--brand-shadow-primary`: Primary color shadows

### 4. Responsive Design

All branding components are mobile-responsive:
- Touch-friendly button sizes (44px minimum)
- Scalable logo displays
- Adaptive color schemes
- Mobile-optimized layouts

## Usage Examples

### Basic Branding Setup

```vue
<script setup>
import { useBranding } from 'src/composables/useBranding'

const { initializeBranding, isLoaded } = useBranding()

onMounted(async () => {
  await initializeBranding()
})
</script>
```

### Custom Branded Components

```vue
<template>
  <div class="branded-container">
    <img v-if="logoUrl" :src="logoUrl" alt="Logo" />
    <h1 class="brand-text-primary">{{ tenantName }}</h1>
    <q-btn class="brand-btn-primary">Action Button</q-btn>
  </div>
</template>

<script setup>
import { useBranding } from 'src/composables/useBranding'

const { tenantName, logoUrl } = useBranding()
</script>
```

### Admin Branding Management

```vue
<template>
  <BrandingManager />
</template>

<script setup>
import BrandingManager from 'src/components/BrandingManager.vue'
</script>
```

## API Integration

### Backend Endpoints

The frontend integrates with these backend endpoints:

- `GET /api/branding` - Get tenant branding
- `POST /api/branding/colors` - Update colors
- `POST /api/branding/logo` - Upload logo
- `POST /api/branding/email-branding` - Update email branding
- `POST /api/branding/domain` - Update custom domain
- `GET /api/branding/css-variables` - Get CSS variables
- `GET /api/branding/manifest` - Generate PWA manifest
- `POST /api/branding/reset` - Reset to defaults

### Request Headers

All API requests include:
- `Authorization: Bearer {token}` - Authentication
- `X-Tenant-ID: {tenant_id}` - Tenant identification
- `Content-Type: application/json` - JSON content

## File Structure

```
src/
├── components/
│   ├── BrandingManager.vue      # Admin branding interface
│   ├── BrandedHeader.vue        # Branded header component
│   └── DynamicTheme.vue         # Dynamic theme application
├── composables/
│   └── useBranding.js           # Branding composable
├── services/
│   └── brandingService.js       # API service
├── stores/
│   └── branding.js              # Pinia store
├── pages/
│   ├── admin/
│   │   └── BrandingPage.vue     # Admin branding page
│   └── BrandedLoginPage.vue     # Branded login example
└── boot/
    └── branding.js              # Boot file for initialization
```

## CSS Classes

### Utility Classes

- `.brand-bg-primary` - Primary background color
- `.brand-bg-secondary` - Secondary background color
- `.brand-bg-gradient` - Primary gradient background
- `.brand-text-primary` - Primary text color
- `.brand-text-secondary` - Secondary text color
- `.brand-border-primary` - Primary border color
- `.brand-shadow-primary` - Primary color shadow
- `.brand-logo` - Logo background image

### Component Classes

- `.brand-btn-primary` - Primary branded button
- `.brand-btn-secondary` - Secondary branded button
- `.brand-field` - Branded form field
- `.brand-card` - Branded card component
- `.brand-toolbar` - Branded toolbar
- `.brand-drawer` - Branded navigation drawer

## Performance Considerations

1. **Lazy Loading**: Branding is loaded only when needed
2. **Caching**: Branding data is cached for 5 minutes
3. **Debouncing**: Color updates are debounced to prevent excessive API calls
4. **CSS Variables**: Efficient theme updates without re-rendering
5. **Image Optimization**: Logo images are optimized for web delivery

## Browser Support

- Modern browsers (ES2022+)
- Chrome 115+
- Firefox 115+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

1. **File Upload Validation**: Logo uploads are validated for type and size
2. **XSS Prevention**: All user inputs are sanitized
3. **CSRF Protection**: API requests include CSRF tokens
4. **Domain Validation**: Custom domains are validated before saving
5. **Access Control**: Branding management requires appropriate permissions

## Testing

### Unit Tests
- Service method testing
- Store state management
- Composable functionality

### Integration Tests
- API integration
- Component rendering with branding
- Theme application

### E2E Tests
- Complete branding workflow
- Multi-tenant isolation
- Mobile responsiveness

## Deployment

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourhotel.com
VITE_APP_DOMAIN=yourhotel.com

# Branding Configuration
VITE_DEFAULT_LOGO_URL=/images/default-logo.png
VITE_BRANDING_CACHE_TTL=300000
```

### Build Configuration

The branding system is automatically included in the production build with:
- CSS optimization
- Image compression
- Bundle splitting for better performance

## Troubleshooting

### Common Issues

1. **Branding not loading**: Check authentication and tenant ID
2. **Colors not applying**: Verify CSS variable support
3. **Logo not displaying**: Check file permissions and CORS
4. **API errors**: Verify backend branding endpoints

### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('debug_branding', 'true')
```

## Future Enhancements

1. **Advanced Theming**: Support for custom CSS injection
2. **Font Customization**: Custom font family selection
3. **Animation Preferences**: Customizable UI animations
4. **Layout Options**: Different layout templates
5. **White Label Analytics**: Branding usage analytics
6. **Multi-language Branding**: Localized branding assets

## Contributing

When contributing to the branding system:

1. Follow the existing code patterns
2. Add appropriate TypeScript types
3. Include unit tests for new features
4. Update documentation
5. Test across different screen sizes
6. Verify accessibility compliance

## License

This white label implementation is part of the Hospie PMS system and follows the same licensing terms.