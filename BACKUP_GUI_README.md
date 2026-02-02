# Backup Management GUI

A comprehensive backup management interface for the Hospie PMS SaaS platform built with Quasar/Vue.js.

## Features

### 🎯 Core Functionality
- **Backup Management**: Create, view, download, and delete backups
- **Schedule Management**: Automated backup scheduling with configurable frequency
- **Restore Functionality**: Point-in-time recovery with confirmation dialogs
- **Backup Validation**: Integrity checking with detailed error reporting
- **Statistics Dashboard**: Visual overview of backup status and metrics

### 🎨 User Interface
- **Modern Design**: Liquid glass effect with backdrop blur
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme adaptation
- **Multilingual**: English and Hungarian translations included
- **Accessibility**: ARIA labels and keyboard navigation support

### 🔧 Technical Features
- **TypeScript Support**: Full type safety with interfaces
- **Service Layer**: Clean API abstraction with error handling
- **Component Architecture**: Reusable dialog components
- **State Management**: Reactive data with Vue 3 Composition API
- **File Handling**: Automatic download with proper MIME types

## File Structure

```
hospie-ui/src/
├── pages/backup/
│   ├── BackupManagementPage.vue     # Main backup management interface
│   └── BackupDemoPage.vue           # Demo/preview page
├── components/backup/
│   ├── CreateBackupDialog.vue       # Backup creation dialog
│   ├── BackupScheduleDialog.vue     # Schedule management dialog
│   └── RestoreBackupDialog.vue      # Restore confirmation dialog
├── services/
│   └── backupService.ts             # API service layer
├── utils/
│   └── formatters.ts                # Utility functions for formatting
└── i18n/
    ├── en-US/index.js               # English translations
    └── hu-HU/index.js               # Hungarian translations
```

## Components

### BackupManagementPage.vue
Main dashboard with:
- Statistics cards showing backup metrics
- Filterable table of backup history
- Action buttons for backup operations
- Integration with all dialog components

### CreateBackupDialog.vue
Backup creation interface with:
- Backup type selection (Full, Incremental, Export)
- Type-specific options (date ranges, table selection)
- Form validation and error handling
- Progress indication

### BackupScheduleDialog.vue
Schedule management with:
- CRUD operations for backup schedules
- Frequency configuration (Daily, Weekly, Monthly)
- Active/inactive toggle functionality
- Next run time calculation

### RestoreBackupDialog.vue
Restore functionality with:
- Backup information display
- Point-in-time recovery options
- Safety confirmations and warnings
- Validation of restore parameters

## API Integration

The GUI integrates with the Laravel backend through the `backupService`:

```typescript
// Get all backups with filtering
const backups = await backupService.getBackups({
  page: 1,
  per_page: 10,
  type: 'full',
  status: 'completed'
})

// Create a new backup
const backup = await backupService.createBackup({
  backup_type: 'full',
  options: {}
})

// Download a backup
await backupService.downloadBackup(backupId)

// Restore from backup
await backupService.restoreBackup({
  backup_id: backupId,
  point_in_time: '2024-01-26T10:00:00'
})
```

## Translations

### English (en-US)
Complete translations for all UI elements, messages, and error states.

### Hungarian (hu-HU)
Full Hungarian localization with proper grammar and terminology.

### Adding New Languages
1. Create new language file in `src/i18n/[locale]/index.js`
2. Add backup translations following the existing structure
3. Register the locale in the i18n configuration

## Styling

### Liquid Glass Effect
```css
.liquid-glass-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
```

### Responsive Design
- Mobile-first approach
- Breakpoint-aware layouts
- Touch-friendly interactions
- Optimized for various screen sizes

## Usage

### Navigation
Access the backup management through:
1. Main menu → Backup (Admin/Super-admin only)
2. Direct URL: `/backup`

### Permissions
- **View**: Admin, Super-admin roles
- **Create**: Admin, Super-admin roles
- **Restore**: Admin, Super-admin roles
- **Schedule**: Admin, Super-admin roles

### Workflow
1. **View Statistics**: Dashboard shows backup overview
2. **Create Backup**: Use "Create Backup" button
3. **Schedule Backups**: Use "Schedules" button
4. **Restore Data**: Click restore icon on completed backups
5. **Download**: Click download icon for local copies

## Error Handling

### User-Friendly Messages
- Clear error descriptions
- Actionable error messages
- Progress indicators for long operations
- Confirmation dialogs for destructive actions

### Network Resilience
- Automatic retry for failed requests
- Offline state detection
- Graceful degradation of features
- Loading states and skeleton screens

## Development

### Prerequisites
- Node.js 16+
- Quasar CLI
- Vue 3 with Composition API
- TypeScript support

### Setup
```bash
cd hospie-ui
npm install
npm run dev
```

### Testing
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## Backend Requirements

The GUI expects the following API endpoints:

### Backups
- `GET /api/backups` - List backups
- `POST /api/backups` - Create backup
- `GET /api/backups/{id}` - Get backup details
- `DELETE /api/backups/{id}` - Delete backup
- `GET /api/backups/{id}/download` - Download backup
- `POST /api/backups/{id}/restore` - Restore backup
- `POST /api/backups/{id}/validate` - Validate backup
- `GET /api/backups/statistics` - Get statistics

### Schedules
- `GET /api/backups/schedules` - List schedules
- `POST /api/backups/schedules` - Create schedule
- `PUT /api/backups/schedules/{id}` - Update schedule
- `DELETE /api/backups/schedules/{id}` - Delete schedule
- `PATCH /api/backups/schedules/{id}/toggle` - Toggle schedule

## Security

### Authentication
- JWT token-based authentication
- Role-based access control
- Tenant isolation for multi-tenant setup

### Data Protection
- CSRF protection
- Input validation and sanitization
- Secure file download handling
- Audit logging for backup operations

## Performance

### Optimization
- Lazy loading of components
- Virtual scrolling for large lists
- Debounced search and filters
- Efficient state management

### Caching
- API response caching
- Component-level caching
- Static asset optimization
- Service worker for offline support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow Vue 3 Composition API patterns
2. Use TypeScript for type safety
3. Add translations for new features
4. Include unit tests for components
5. Follow the existing code style
6. Update documentation for changes

## License

This backup management GUI is part of the Hospie PMS SaaS platform.