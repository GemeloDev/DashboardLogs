import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import authService from '../services/authService.js'

function isAuthenticated() {
  return authService.checkSession()
}

function getDefaultRoute(user) {
  const allowedFlow = authService.getAllowedFlow(user)
  return allowedFlow === 'santoro' ? '/santoro/inicio' : '/client/escritorio'
}

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const authenticated = isAuthenticated()

    if (to.meta.requiresAuth && !authenticated) {
      next('/login')
      return
    }

    if (!authenticated) {
      next()
      return
    }

    const user = authService.user
    const defaultRoute = getDefaultRoute(user)
    const canAccessSantoro = authService.canAccessSantoroFlow(user)

    const isAdmin =
      user?.authz?.roles?.includes('ORG_ADMIN') ||
      user?.authz?.roles?.includes('ORG_OWNER')

    // Bloqueo de acceso a flujo santoro
    if (to.meta.flow === 'santoro' && !canAccessSantoro) {
      next('/client/escritorio')
      return
    }

    // Si además requiere admin
    if (to.meta.requiresAdmin && !isAdmin) {
      next(defaultRoute)
      return
    }

    // Si intenta ir a login estando autenticado
    if (to.path === '/login') {
      next(defaultRoute)
      return
    }

    // Entradas genéricas
    if (to.path === '/' || to.path === '/dashboard' || to.path === '/logs') {
      next(defaultRoute)
      return
    }

    next()
  })

  return Router
})
