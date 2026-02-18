import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import authService from '../services/authService.js'

function isAuthenticated() {
  return authService.checkSession()
}

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Guardia de navegación global
  Router.beforeEach((to, from, next) => {
    const authenticated = isAuthenticated()

    // Si la ruta requiere autenticación y no está autenticado
    if (to.meta.requiresAuth && !authenticated) {
      console.log('🔒 Acceso denegado - Redirigiendo a login')
      next('/login')
      return
    }

    // Si la ruta requiere ser admin
    if (to.meta.requiresAdmin && authenticated) {
      const user = authService.user
      const isAdmin = user?.authz?.roles.includes('ORG_ADMIN') || user?.authz?.roles.includes('ORG_OWNER')

      if (!isAdmin) {
        console.log('🚫 Acceso denegado - Se requiere rol de administrador')
        next('/escritorio')
        return
      }
    }

    // Si está autenticado y trata de acceder al login, redirigir al dashboard
    if (to.path === '/login' && authenticated) {
      console.log('✅ Usuario autenticado - Redirigiendo a dashboard')
      next('/dashboard')
      return
    }

    // Si accede a la raíz y está autenticado, redirigir al dashboard
    if (to.path === '/' && authenticated) {
      next('/dashboard')
      return
    }

    // Si accede a la raíz y no está autenticado, redirigir al login
    if (to.path === '/' && !authenticated) {
      next('/login')
      return
    }

    next()
  })

  return Router
})
