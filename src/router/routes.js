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

  // PMS specific routes (will be added later)
  {
    path: '/reservations',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/reservations/ReservationListPage.vue'),
        meta: { requiresAuth: true }
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
