/**
 * Configuración de Axios con Interceptores
 * Inyecta automáticamente headers de autenticación
 */

import axios from 'axios'
import { boot } from 'quasar/wrappers'
import { API_BASE_URL } from 'src/config/env'
import { getJWTFromCookie } from './cookieService'
import { useAuthStore } from 'src/stores/auth'
import { AUTH } from './endpoints'
import { getStoredUser } from './sessionStorage'

// Normalizar baseURL: eliminar slash final para evitar dobles slashes al concatenar rutas
const cleanBaseURL =
  API_BASE_URL && API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL

// Crear instancia de axios
export const axiosInstance = axios.create({
  baseURL: cleanBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Limpia una URL eliminando dobles slashes, preservando el protocolo (://).
 * Defensa adicional contra URLs como http://host//path.
 */
function cleanUrl(url) {
  if (!url || typeof url !== 'string') return url
  const protocolMatch = url.match(/^([a-z][a-z0-9+.-]*:\/\/)/i)
  if (protocolMatch) {
    const protocol = protocolMatch[1]
    const rest = url.slice(protocol.length)
    return protocol + rest.replace(/\/+/g, '/')
  }
  return url.replace(/\/+/g, '/')
}

let refreshPromise = null
let appRouter = null
let sessionExpirationHandled = false

function isRefreshRequest(url = '') {
  return cleanUrl(String(url)).endsWith('/auth/refresh-token')
}

function isAuthenticationRequest(url = '') {
  return /\/auth\/(login|refresh-token|forgot-password|reset-password|accept-invite)/.test(
    cleanUrl(String(url)),
  )
}

function isTicketRequest(url = '') {
  const requestUrl = cleanUrl(String(url))
  return requestUrl.includes('escalate-ticket') || requestUrl.includes('ticket-api')
}

function isJwtExpired(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized))
    return Number(decoded.exp || 0) * 1000 <= Date.now() + 5000
  } catch {
    return false
  }
}

function handleExpiredSession(authStore) {
  if (sessionExpirationHandled) return
  sessionExpirationHandled = true
  authStore.logout()

  if (appRouter && appRouter.currentRoute?.value?.path !== '/login') {
    appRouter.replace({ path: '/login', query: { expired: 'true' } }).catch(() => {})
  } else if (!appRouter && typeof window !== 'undefined') {
    window.location.replace('/login?expired=true')
  }
}

async function refreshAccessToken(authStore) {
  if (refreshPromise) return refreshPromise

  const refreshToken = authStore.getRefreshToken
  if (!refreshToken) throw new Error('No hay refresh token disponible')

  refreshPromise = axios
    .post(AUTH.REFRESH_TOKEN, { refreshToken }, { timeout: 30000 })
    .then((response) => {
      const tokenData = response?.data?.data || response?.data?.payload || response?.data || {}
      const newAccessToken = tokenData.accessToken
      if (!newAccessToken) throw new Error('La respuesta de refresh no contiene accessToken')

      authStore.setTokens(newAccessToken, tokenData.refreshToken)
      sessionExpirationHandled = false
      return newAccessToken
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

// Request Interceptor - Inyecta JWT automáticamente y normaliza la URL
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url) {
      // Evitar duplicar el prefijo baseURL cuando los endpoints ya lo incluyen
      if (cleanBaseURL && config.url.startsWith(`${cleanBaseURL}/`)) {
        config.url = config.url.slice(cleanBaseURL.length)
      }
      config.url = cleanUrl(config.url)
    }

    if (!isRefreshRequest(config.url)) {
      const authStore = useAuthStore()
      let storeToken = authStore.getAccessToken

      // Antes de las llamadas paralelas del dashboard (incluido el cambio de
      // sistema), renueva silenciosamente un JWT vencido o próximo a vencer.
      if (storeToken && !isAuthenticationRequest(config.url) && isJwtExpired(storeToken)) {
        try {
          storeToken = await refreshAccessToken(authStore)
        } catch (refreshError) {
          handleExpiredSession(authStore)
          return Promise.reject(refreshError)
        }
      }

      if (storeToken) {
        config.headers.Authorization = `Bearer ${storeToken}`
      } else {
        const cookieToken = getJWTFromCookie()
        if (cookieToken) {
          config.headers.Authorization = `Bearer ${cookieToken}`
        }
      }
    }

    const user = getStoredUser()
    if (user?.tenantId) {
      config.headers['X-Tenant'] = user.tenantId
    }

    return config
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error)
    return Promise.reject(error)
  },
)

// Response Interceptor - Maneja errores globalmente
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config || {}
    const responseStatus = error.response?.status

    // Los rechazos del sistema de tickets pertenecen a una integración
    // externa y no significan que la sesión de la consola haya expirado.
    if (responseStatus === 401 && isTicketRequest(originalRequest.url)) {
      console.warn('[Axios Interceptor] Error 401 atrapado en Tickets. Se omite cierre de sesión.')
      return Promise.reject(error)
    }

    //  Manejo específico de errores
    if (responseStatus === 403) {
      console.warn('🚫 Acceso denegado - Permisos insuficientes')
    }

    if (
      responseStatus === 401 &&
      !originalRequest._retry &&
      !isAuthenticationRequest(originalRequest.url)
    ) {
      originalRequest._retry = true
      const authStore = useAuthStore()

      try {
        const newAccessToken = await refreshAccessToken(authStore)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        handleExpiredSession(authStore)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default boot(({ app, router }) => {
  appRouter = router
  // Configura $axiosInstance globalmente
  app.config.globalProperties.$axiosInstance = axiosInstance
})
