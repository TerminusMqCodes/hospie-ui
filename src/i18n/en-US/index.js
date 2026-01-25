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
    branding: 'Branding',
    electronTest: 'Electron Test',
    shortcutsTest: 'Shortcuts Test',
    electronFeatures: 'Electron Features'
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
  }
}
