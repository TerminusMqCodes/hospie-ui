export default {
  // General messages
  failed: 'Action failed',
  success: 'Action was successful',
  
  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    calendar: 'Calendar',
    rooms: 'Rooms',
    guests: 'Guests',
    housekeeping: 'Housekeeping',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    analytics: 'Analytics',
    finance: 'Finance',
    spa: 'Spa & Wellness',
    spaManagement: 'Spa Management',
    events: 'Events',
    pos: 'Point of Sale',
    rates: 'Rates',
    rateManagement: 'Rate Management',
    admin: 'Administration',
    guestPortal: 'Guest Portal',
    invoices: 'Invoices',
    payments: 'Payments',
    sustainability: 'Sustainability',
    channelManager: 'Channel Manager',
    waitlist: 'Waitlist',
    gdpr: 'GDPR',
    backup: 'Backup',
    branding: 'Branding',
    electronTest: 'Electron Test',
    shortcutsTest: 'Shortcuts Test',
    electronFeatures: 'Electron Features',
    support: 'Support'
  },
  
  // General actions
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    view: 'View',
    print: 'Print',
    send: 'Send',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset'
  },
  
  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    processing: 'Processing',
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    cleaning: 'Cleaning'
  },
  
  // Forms
  forms: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters',
    phone: 'Please enter a valid phone number',
    date: 'Please enter a valid date',
    number: 'Please enter a number',
    min: 'Minimum {min} characters required',
    max: 'Maximum {max} characters allowed'
  },
  
  // Date and time
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
    selectDate: 'Select date',
    selectTime: 'Select time'
  },
  
  // Error messages
  errors: {
    general: 'An error occurred',
    network: 'Network error',
    unauthorized: 'Unauthorized',
    forbidden: 'Access denied',
    notFound: 'Not found',
    serverError: 'Server error',
    timeout: 'Request timeout',
    validation: 'Validation error'
  },
  
  // Confirmations
  confirmations: {
    delete: 'Are you sure you want to delete this?',
    save: 'Are you sure you want to save the changes?',
    cancel: 'Are you sure you want to cancel? Unsaved changes will be lost.',
    logout: 'Are you sure you want to logout?'
  },
  
  // Language
  language: {
    select: 'Select language',
    hungarian: 'Hungarian',
    english: 'English'
  },
  
  // Search
  search: {
    placeholder: 'Search reservations, guests, rooms...',
    advanced: 'Advanced Search',
    advancedOptions: 'Advanced Search Options',
    guestName: 'Guest Name',
    roomNumber: 'Room Number',
    dateRange: 'Date Range',
    clear: 'Clear'
  },

  // Applications
  applications: {
    title: 'Hospie SaaS Services',
    hospiePay: 'HospiePAY',
    channelManager: 'ChannelManager',
    subscription: 'Subscription',
    settings: 'Settings'
  },

  // Menu sections
  menu: {
    main: 'Main Menu',
    management: 'Management',
    more: 'More'
  },

  // Footer
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    about: 'About Hospie',
    version: 'Version 1.0.0'
  },

  // Notifications
  notifications: {
    title: 'Notifications',
    newReservation: 'New reservation',
    roomReady: 'Room ready',
    viewAll: 'View All',
    install: 'Install Hospie PMS',
    offline: 'You are offline',
    lockSession: 'Lock Session',
    sessionLocked: 'Session locked',
    sessionLockFailed: 'Failed to lock session',
    logoutSuccess: 'Successfully logged out',
    logoutFailed: 'Logout failed'
  },

  // Tooltips
  tooltips: {
    menu: 'Menu',
    search: 'Search',
    advancedSearch: 'Advanced Search',
    applications: 'Applications',
    notifications: 'Notifications',
    keyboardShortcuts: 'Keyboard Shortcuts (Ctrl+?)',
    electronMode: 'Electron Mode',
    browserMode: 'Browser Mode'
  },

  // Mobile
  mobile: {
    search: 'Search',
    cancel: 'Cancel'
  },

  // Links
  links: {
    languageRegion: 'Language & region',
    getAndroidApp: 'Get the Android app',
    getIosApp: 'Get the iOS app',
    sendFeedback: 'Send feedback',
    help: 'Help'
  },

  pages: {
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back, {name}! 👋',
      welcomeSubtitle: 'Here\'s what\'s happening with your property today',
      todaysArrivals: 'Today\'s Arrivals',
      departures: 'Departures',
      occupancy: 'Occupancy',
      revenue: 'Revenue',
      quickActions: 'Quick Actions',
      newReservation: 'New Reservation',
      roomStatus: 'Room Status',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      recentActivity: 'Recent Activity',
      todaysSchedule: 'Today\'s Schedule',
      roomStatusOverview: 'Room Status Overview',
      available: 'Available',
      occupied: 'Occupied',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      viewFullStatus: 'View Full Status',
      quickCheckIn: 'Quick Check-In',
      quickCheckOut: 'Quick Check-Out',
      selectReservation: 'Select Reservation',
      selectGuest: 'Select Guest'
    },

    // Profile
    user_profile: {
      title: 'User Profile',
      fullName: 'Full Name',
      email: 'Email',
      updateProfile: 'Update Profile',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      accountActions: 'Account Actions',
      logoutAllDevices: 'Logout All Devices',
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      validEmail: 'Please enter a valid email',
      currentPasswordRequired: 'Current password is required',
      newPasswordRequired: 'New password is required',
      passwordMinLength: 'Password must be at least 8 characters',
      confirmPasswordRequired: 'Please confirm your password',
      passwordsNotMatch: 'Passwords do not match',
      profileUpdated: 'Profile updated successfully!',
      profileUpdateFailed: 'Failed to update profile',
      passwordChanged: 'Password changed successfully!',
      passwordChangeFailed: 'Failed to change password',
      loggedOutAllDevices: 'Logged out from all devices successfully',
      logoutAllFailed: 'Logout failed'
    },

    // Error pages
    error_not_found: {
      title: 'Oops. Nothing here...',
      goHome: 'Go Home'
    },

    unauthorized: {
      title: 'Unauthorized',
      message: 'You do not have permission to access this page.',
      goToDashboard: 'Go to Dashboard'
    },

    // Auth pages
    auth: {
      login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        loginButton: 'Login',
        noAccount: 'Don\'t have an account?',
        signUp: 'Sign up',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        invalidCredentials: 'Invalid email or password'
      },
      register: {
        title: 'Register',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        agreeTerms: 'I agree to the terms and conditions',
        registerButton: 'Register',
        alreadyHaveAccount: 'Already have an account?',
        signIn: 'Sign in',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        termsRequired: 'You must agree to the terms and conditions'
      },
      forgotPassword: {
        title: 'Reset Password',
        email: 'Email',
        sendResetLink: 'Send Reset Link',
        backToLogin: 'Back to Login',
        resetLinkSent: 'Reset link sent!',
        checkEmail: 'Check your email for further instructions.'
      }
    },

    // Reservations
    reservations: {
      title: 'Reservations',
      list: {
        title: 'Reservation List',
        searchPlaceholder: 'Search reservations...',
        guestName: 'Guest Name',
        room: 'Room',
        checkIn: 'Check In',
        checkOut: 'Check Out',
        status: 'Status',
        actions: 'Actions',
        from_date: 'From date',
        to_date: 'To date',
        loading: 'Loading reservations...',
        not_found: 'No reservations found'
      },
      create: {
        title: 'Create New Reservation',
        guestInformation: 'Guest Information',
        reservationDetails: 'Reservation Details',
        roomSelection: 'Room Selection',
        paymentInformation: 'Payment Information'
      },
      edit: {
        title: 'Edit Reservation',
        updateReservation: 'Update Reservation'
      },
      calendar: {
        title: 'Reservation Calendar',
        monthView: 'Month View',
        weekView: 'Week View',
        dayView: 'Day View'
      }
    },

    // Rooms
    rooms: {
      title: 'Rooms',
      roomNumber: 'Room Number',
      roomType: 'Room Type',
      status: 'Status',
      guest: 'Guest',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      clean: 'Clean',
      maintenance: 'Maintenance'
    },

    // Guests
    guests: {
      title: 'Guests',
      guestName: 'Guest Name',
      email: 'Email',
      phone: 'Phone',
      nationality: 'Nationality',
      lastVisit: 'Last Visit',
      totalStays: 'Total Stays'
    },

    // Housekeeping
    housekeeping: {
      title: 'Housekeeping',
      roomNumber: 'Room Number',
      status: 'Status',
      assignedTo: 'Assigned To',
      priority: 'Priority',
      notes: 'Notes'
    },

    // Reports
    reports: {
      title: 'Reports',
      occupancyReport: 'Occupancy Report',
      revenueReport: 'Revenue Report',
      guestReport: 'Guest Report',
      roomReport: 'Room Report',
      dateRange: 'Date Range',
      generateReport: 'Generate Report'
    },

    // Settings
    settings: {
      title: 'Settings',
      general: 'General',
      notifications: 'Notifications',
      security: 'Security',
      integrations: 'Integrations',
      backup: 'Backup'
    },

    // Analytics
    analytics: {
      title: 'Analytics',
      overview: 'Overview',
      performance: 'Performance',
      trends: 'Trends',
      forecasting: 'Forecasting'
    },

    // Finance
    finance: {
      title: 'Finance',
      revenue: 'Revenue',
      expenses: 'Expenses',
      profit: 'Profit',
      invoices: 'Invoices',
      payments: 'Payments'
    },

    // SPA & Wellness
    spa: {
      title: 'Spa & Wellness',
      treatments: 'Treatments',
      appointments: 'Appointments',
      therapists: 'Therapists',
      packages: 'Packages'
    },

    // Events
    events: {
      title: 'Events',
      eventName: 'Event Name',
      date: 'Date',
      venue: 'Venue',
      capacity: 'Capacity',
      bookings: 'Bookings'
    },

    // POS
    pos: {
      title: 'Point of Sale',
      products: 'Products',
      sales: 'Sales',
      inventory: 'Inventory',
      transactions: 'Transactions'
    },

    // Rates
    rates: {
      title: 'Rates',
      roomType: 'Room Type',
      baseRate: 'Base Rate',
      seasonalRates: 'Seasonal Rates',
      discounts: 'Discounts'
    },

    // Admin
    admin: {
      title: 'Administration',
      users: 'Users',
      roles: 'Roles',
      permissions: 'Permissions',
      systemSettings: 'System Settings'
    },

    // Guest Portal
    guestPortal: {
      title: 'Guest Portal',
      welcome: 'Welcome',
      services: 'Services',
      requests: 'Requests',
      feedback: 'Feedback'
    },

    // Invoices
    invoices: {
      title: 'Invoices',
      invoiceNumber: 'Invoice Number',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      customer: 'Customer'
    },

    // Sustainability
    sustainability: {
      title: 'Sustainability',
      energyUsage: 'Energy Usage',
      waterUsage: 'Water Usage',
      wasteManagement: 'Waste Management',
      carbonFootprint: 'Carbon Footprint'
    },

    // Channel Manager
    channelManager: {
      title: 'Channel Manager',
      channels: 'Channels',
      inventory: 'Inventory',
      rates: 'Rates',
      bookings: 'Bookings'
    },

    // Waitlist
    waitlist: {
      title: 'Waitlist',
      guestName: 'Guest Name',
      requestedDates: 'Requested Dates',
      roomType: 'Room Type',
      priority: 'Priority'
    },

    // GDPR
    gdpr: {
      title: 'GDPR',
      dataProtection: 'Data Protection',
      consent: 'Consent',
      dataRequests: 'Data Requests',
      compliance: 'Compliance'
    }
  },

  // Common
  common: {
    actions: 'Actions',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },

  // Validation
  validation: {
    required: 'This field is required'
  },

  // Backup Management
  backup: {
    title: 'Backup Management',
    subtitle: 'Manage your data backups and recovery options',
    createBackup: 'Create Backup',
    schedules: 'Schedules',
    backupHistory: 'Backup History',
    
    // Statistics
    totalBackups: 'Total Backups',
    completedBackups: 'Completed',
    failedBackups: 'Failed',
    totalSize: 'Total Size',
    
    // Types
    type: 'Type',
    backupType: 'Backup Type',
    types: {
      full: 'Full Backup',
      incremental: 'Incremental',
      export: 'Data Export'
    },
    typeDescriptions: {
      full: 'Complete backup of all tenant data',
      incremental: 'Backup of changes since last backup',
      export: 'Export specific data for analysis'
    },
    
    // Status
    status: {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      failed: 'Failed'
    },
    
    // Actions
    create: 'Create',
    download: 'Download',
    restore: 'Restore',
    validate: 'Validate',
    filterByType: 'Filter by Type',
    filterByStatus: 'Filter by Status',
    
    // Properties
    fileSize: 'File Size',
    createdAt: 'Created At',
    
    // Create Backup Dialog
    exportOptions: 'Export Options',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    tablesToExport: 'Tables to Export',
    tablesHint: 'Leave empty to export all tables',
    incrementalOptions: 'Incremental Options',
    sinceDate: 'Since Date',
    sinceHint: 'Leave empty to use last backup date',
    
    // Tables
    tables: {
      rooms: 'Rooms',
      room_types: 'Room Types',
      reservations: 'Reservations',
      guests: 'Guests',
      payments: 'Payments',
      invoices: 'Invoices',
      events: 'Events',
      spa_appointments: 'Spa Appointments',
      pos_transactions: 'POS Transactions',
      communication_history: 'Communication History'
    },
    
    // Schedule Management
    scheduleManagement: 'Schedule Management',
    addSchedule: 'Add Schedule',
    editSchedule: 'Edit Schedule',
    frequency: 'Frequency',
    time: 'Time',
    isActive: 'Active',
    nextRun: 'Next Run',
    lastRun: 'Last Run',
    notScheduled: 'Not Scheduled',
    neverRun: 'Never Run',
    noSchedules: 'No schedules configured',
    
    frequencies: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    },
    
    // Restore Dialog
    restoreBackup: 'Restore Backup',
    backupInformation: 'Backup Information',
    restoreWarning: 'Warning!',
    restoreWarningMessage: 'This action will replace all current data with the backup data. This cannot be undone.',
    usePointInTime: 'Use Point-in-Time Recovery',
    pointInTime: 'Point in Time',
    pointInTimeHint: 'Restore data as it was at this specific time',
    confirmRestore: 'I understand that this will replace all current data',
    mustConfirm: 'You must confirm to proceed',
    invalidPointInTime: 'Point in time cannot be after backup creation date',
    
    // Messages
    createSuccess: 'Backup creation started',
    createSuccessCaption: 'The backup will be processed in the background',
    downloadStarted: 'Download started',
    deleteSuccess: 'Backup deleted successfully',
    restoreSuccess: 'Restore completed successfully',
    restoreSuccessCaption: 'Your data has been restored from the backup',
    validationSuccess: 'Backup validation passed',
    validationFailed: 'Backup validation failed',
    scheduleCreated: 'Schedule created successfully',
    scheduleUpdated: 'Schedule updated successfully',
    scheduleDeleted: 'Schedule deleted successfully',
    scheduleActivated: 'Schedule activated',
    scheduleDeactivated: 'Schedule deactivated',
    
    // Confirmations
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this {type} backup?',
    confirmDeleteSchedule: 'Confirm Delete Schedule',
    confirmDeleteScheduleMessage: 'Are you sure you want to delete this {type} {frequency} backup schedule?',
    
    // Validation Errors
    validationErrors: {
      file_exists: 'File not found',
      size_match: 'File size mismatch',
      checksum_valid: 'Checksum validation failed',
      readable: 'File is not readable'
    },
    
    // Errors
    errors: {
      loadFailed: 'Failed to load backups',
      createFailed: 'Failed to create backup',
      downloadFailed: 'Failed to download backup',
      deleteFailed: 'Failed to delete backup',
      restoreFailed: 'Failed to restore backup',
      validationFailed: 'Failed to validate backup',
      loadSchedulesFailed: 'Failed to load schedules',
      saveScheduleFailed: 'Failed to save schedule',
      deleteScheduleFailed: 'Failed to delete schedule',
      toggleScheduleFailed: 'Failed to toggle schedule'
    }
  },

  // Support System
  support: {
    // General
    supportCenter: 'Support Center',
    supportCenterDescription: 'Get help and manage your support tickets',
    createTicket: 'Create Ticket',
    myTickets: 'My Tickets',
    faq: 'FAQ',
    contact: 'Contact',
    dashboard: 'Dashboard',
    liveChat: 'Live Chat',
    
    // Ticket Management
    ticketDetails: 'Ticket Details',
    editTicket: 'Edit Ticket',
    ticketNumber: 'Ticket Number',
    title: 'Title',
    description: 'Description',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    source: 'Source',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    resolvedAt: 'Resolved At',
    slaDue: 'SLA Due',
    assignedTo: 'Assigned To',
    
    // Ticket Status
    statuses: {
      open: 'Open',
      in_progress: 'In Progress',
      pending_customer: 'Pending Customer',
      resolved: 'Resolved',
      closed: 'Closed'
    },
    
    // Ticket Priority
    priorities: {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      critical: 'Critical'
    },
    
    // Ticket Categories
    categories: {
      technical: 'Technical',
      billing: 'Billing',
      account: 'Account',
      feature_request: 'Feature Request',
      general: 'General'
    },
    
    // Ticket Sources
    sources: {
      web: 'Web',
      email: 'Email',
      phone: 'Phone',
      chat: 'Chat',
      system: 'System'
    },
    
    // Actions
    viewTicket: 'View Ticket',
    updateStatus: 'Update Status',
    newStatus: 'New Status',
    statusNote: 'Status Note',
    addMessage: 'Add Message',
    addAttachment: 'Add Attachment',
    message: 'Message',
    internalMessage: 'Internal Message',
    selectFile: 'Select File',
    selectFiles: 'Select Files',
    attachments: 'Attachments',
    messages: 'Messages',
    internal: 'Internal',
    agent: 'Agent',
    customer: 'Customer',
    
    // Contact Information
    contactInformation: 'Contact Information',
    contactName: 'Contact Name',
    contactEmail: 'Contact Email',
    contactPhone: 'Contact Phone',
    
    // System Information
    systemInformation: 'System Information',
    browser: 'Browser',
    operatingSystem: 'Operating System',
    currentPage: 'Current Page',
    timestamp: 'Timestamp',
    
    // Dashboard
    totalTickets: 'Total Tickets',
    openTickets: 'Open Tickets',
    slaCompliance: 'SLA Compliance',
    avgResponseTime: 'Avg Response Time',
    ticketsByStatus: 'Tickets by Status',
    ticketsByPriority: 'Tickets by Priority',
    recentTickets: 'Recent Tickets',
    viewAll: 'View All',
    noRecentTickets: 'No recent tickets',
    
    // SaaS Metrics
    tenantHealth: 'Tenant Health',
    healthScore: 'Health Score',
    selfServiceUsage: 'Self-Service Usage',
    faqViews: 'FAQ Views',
    chatSessions: 'Chat Sessions',
    escalationRate: 'Escalation Rate',
    ticketsEscalated: 'Tickets Escalated',
    
    // FAQ
    searchFaq: 'Search FAQ',
    searchResults: 'Search Results',
    noFaqResults: 'No FAQ results found',
    noFaqResultsHint: 'Try different keywords or create a support ticket',
    loadingFaq: 'Loading FAQ...',
    language: 'Language',
    lastUpdated: 'Last Updated',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',
    feedbackThanks: 'Thank you for your feedback!',
    
    // Live Chat
    online: 'Online',
    sessionId: 'Session ID',
    connectedAt: 'Connected At',
    typeMessage: 'Type a message...',
    chatMinimized: 'Chat minimized',
    chatWelcomeMessage: 'Hello! How can I help you today?',
    chatInitError: 'Failed to initialize chat',
    
    // Quick Actions
    quickActions: {
      needHelp: 'Need Help',
      needHelpMessage: 'I need help with something',
      technicalIssue: 'Technical Issue',
      technicalIssueMessage: 'I\'m experiencing a technical problem',
      billing: 'Billing Question',
      billingMessage: 'I have a question about billing',
      featureRequest: 'Feature Request',
      featureRequestMessage: 'I\'d like to request a new feature'
    },
    
    // Agent Responses
    agentResponses: {
      help: 'I\'d be happy to help you! Can you provide more details about what you need assistance with?',
      technical: 'I understand you\'re experiencing a technical issue. Can you describe what\'s happening and any error messages you\'re seeing?',
      billing: 'I can help with billing questions. What specific information do you need about your account or charges?',
      feature: 'Thank you for the feature request! Can you tell me more about what functionality you\'d like to see?',
      default: 'Thank you for contacting support. I\'ll do my best to help you with your question.'
    },
    
    // Contact Section
    email: 'Email',
    phone: 'Phone',
    liveChatAvailable: 'Available 24/7',
    startChat: 'Start Chat',
    businessHours: 'Business Hours',
    businessHoursDetails: 'Mon-Fri 9:00 AM - 6:00 PM CET',
    supportChannels: 'Support Channels',
    documentation: 'Documentation',
    documentationDescription: 'Browse our comprehensive guides',
    community: 'Community Forum',
    communityDescription: 'Connect with other users',
    videoTutorials: 'Video Tutorials',
    videoTutorialsDescription: 'Watch step-by-step guides',
    scheduleCall: 'Schedule a Call',
    scheduleCallDescription: 'Book a one-on-one session',
    emergencySupport: 'Emergency Support',
    emergencySupportDescription: 'For critical issues requiring immediate attention',
    emergencyContact: 'Emergency Contact',
    expectedResponseTimes: 'Expected Response Times',
    copiedToClipboard: 'Copied to clipboard',
    copyFailed: 'Failed to copy',
    
    // Filters and Search
    searchTickets: 'Search tickets...',
    clearFilters: 'Clear Filters',
    noTickets: 'No tickets found',
    
    // Loading and Error States
    loadingTicket: 'Loading ticket...',
    ticketNotFound: 'Ticket not found',
    backToTickets: 'Back to Tickets',
    
    // Success Messages
    ticketCreatedSuccess: 'Support ticket created successfully',
    ticketUpdatedSuccess: 'Ticket updated successfully',
    
    // Error Messages
    ticketCreatedError: 'Failed to create support ticket',
    ticketUpdateError: 'Failed to update ticket',
    fileRejected: '{count} file(s) rejected. Maximum size: {maxSize}',
    
    // Validation
    required: 'This field is required'
  }
}
