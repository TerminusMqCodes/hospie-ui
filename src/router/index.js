import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Navigation guards
  Router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    
    // Handle guest portal routes separately
    if (to.path.startsWith('/guest-portal')) {
      const { useGuestPortalStore } = await import('src/stores/guestPortal')
      const guestPortalStore = useGuestPortalStore()
      
      // Initialize guest auth from storage
      await guestPortalStore.loadFromStorage()
      
      if (to.meta.requiresGuestAuth) {
        if (!guestPortalStore.isLoggedIn) {
          next('/guest-portal/login')
          return
        }
      } else if (to.name === 'guest-portal-login' && guestPortalStore.isLoggedIn) {
        next('/guest-portal/dashboard')
        return
      }
      
      next()
      return
    }
    
    // Initialize auth state from localStorage if not already done
    if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
      authStore.initializeAuth()
    }
    
    // If user is authenticated but user data is stale, refresh it
    if (authStore.isAuthenticated && authStore.user && !authStore.user.roles) {
      try {
        await authStore.fetchUser()
      } catch (error) {
        console.warn('Failed to refresh user data:', error)
      }
    }
    
    // Check if route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!authStore.isAuthenticated) {
        // Redirect to login page
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
      
      // Check role requirements
      const requiredRoles = to.meta.roles
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = authStore.hasAnyRole(requiredRoles)
        if (!hasRequiredRole) {
          next({
            path: '/unauthorized',
            query: { message: 'Insufficient role permissions' }
          })
          return
        }
      }
      
      // Check permission requirements
      const requiredPermissions = to.meta.permissions
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermission = authStore.hasAnyPermission(requiredPermissions)
        if (!hasRequiredPermission) {
          next({
            path: '/unauthorized',
            query: { message: 'Insufficient permissions' }
          })
          return
        }
      }
      
      // Check admin requirement
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({
          path: '/unauthorized',
          query: { message: 'Admin access required' }
        })
        return
      }
      
      next()
    } else if (to.matched.some(record => record.meta.requiresGuest)) {
      // Routes that should only be accessible to guests (not logged in users)
      if (authStore.isAuthenticated) {
        next({ path: '/dashboard' })
      } else {
        next()
      }
    } else {
      next()
    }
  })

  return Router
})
