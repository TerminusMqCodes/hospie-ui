const routes = [
  // Public routes (guest only)
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresGuest: true }
      }
    ],
  },
  {
    path: '/register',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/auth/RegisterPage.vue'),
        meta: { requiresGuest: true }
      }
    ],
  },
  {
    path: '/forgot-password',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
        meta: { requiresGuest: true }
      }
    ],
  },

  // Unauthorized access page
  {
    path: '/unauthorized',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/UnauthorizedPage.vue')
      }
    ],
  },

  // Protected routes (authenticated users only)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        redirect: '/dashboard'
      },
      { 
        path: 'dashboard', 
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true }
      }
    ],
  },

  // Admin routes
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'super-admin']
    },
    children: [
      { 
        path: '', 
        redirect: '/admin/dashboard'
      },
      { 
        path: 'dashboard', 
        component: () => import('pages/admin/AdminDashboardPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin', 'super-admin']
        }
      },
      { 
        path: 'users', 
        component: () => import('pages/admin/UserManagementPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['users.view']
        }
      },
      { 
        path: 'roles', 
        component: () => import('pages/admin/RoleManagementPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin', 'super-admin']
        }
      }
    ],
  },

  // PMS specific routes with role-based access
  {
    path: '/reservations',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/reservations/ReservationListPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['reservations.view']
        }
      },
      { 
        path: 'create', 
        component: () => import('pages/reservations/CreateReservationPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['reservations.create']
        }
      },
      { 
        path: ':id/edit', 
        component: () => import('pages/reservations/EditReservationPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['reservations.update']
        }
      }
    ],
  },

  // Room management routes
  {
    path: '/rooms',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/rooms/RoomListPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['rooms.view']
        }
      },
      { 
        path: 'status', 
        component: () => import('pages/rooms/RoomStatusPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin', 'manager', 'receptionist', 'housekeeping']
        }
      }
    ],
  },

  // Guest management routes
  {
    path: '/guests',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/guests/GuestListPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['guests.view']
        }
      }
    ],
  },

  // Financial routes
  {
    path: '/finance',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'invoices', 
        component: () => import('pages/finance/InvoiceListPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['invoices.view']
        }
      },
      { 
        path: 'payments', 
        component: () => import('pages/finance/PaymentListPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['payments.view']
        }
      }
    ],
  },

  // Reports routes
  {
    path: '/reports',
    component: () => import('layouts/MainLayout.vue'),
    meta: { 
      requiresAuth: true,
      permissions: ['reports.view']
    },
    children: [
      { 
        path: '', 
        component: () => import('pages/reports/ReportsPage.vue'),
        meta: { 
          requiresAuth: true,
          permissions: ['reports.view']
        }
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
