/**
 * Servicio de Autenticación Centralizado
 */

import axios from 'axios'
import { ref, computed } from 'vue'
import { AUTH_ENDPOINTS, DEFAULT_CONFIG } from './apiEndpoints.js'
import { storeJWTInCookie, deleteJWTFromCookie } from './cookieService.js'
import { axiosInstance } from './axiosConfig.js'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const SESSION_KEY = 'dashboardLogsSession'

export const useAuthService = () => {
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    deleteJWTFromCookie()
    currentUser.value = null
    isAuthenticated.value = false
  }

  const initializeAuth = () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (session && session.isAuthenticated === true) {
          currentUser.value = session.user
          isAuthenticated.value = true
          console.log('🔄 Sesión restaurada:', {
            name: session.user.name,
            roles: session.user.roles || [],
            isAdmin: (session.user.authz.roles || []).includes('ORG_ADMIN'),
          })
        }
      }
    } catch (error) {
      console.error('❌ Error al inicializar autenticación:', error)
      clearSession()
    }
  }

  const register = async (userData) => {
    try {
      console.log(' Iniciando registro:', { name: userData.name, email: userData.email })
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: DEFAULT_CONFIG.headers,
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      })
      const data = await response.json()
      console.log(' Respuesta del registro:', data)
      return {
        success: data.status === true,
        message:
          data.message ||
          (data.status ? 'Usuario registrado correctamente' : 'Error en el registro'),
        data: data.data,
      }
    } catch (error) {
      console.error(' Error en registro:', error)
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: null,
      }
    }
  }

  const login = async (credentials, mantenerSesion = true) => {
    try {
      // Crear headers con X-Tenant
      const headers = {
        ...DEFAULT_CONFIG.headers,
      }

      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })
      const data = await response.json()
      console.log('📥 Respuesta del login:', data)

      if (data.ok && data.data) {
        const userData = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          authz: {
            permissions: data.data.authz.permissions,
            roles: data.data.authz.roles,
            systems: data.data.authz.systems,
          },
          tenantId: data.data.tenantId || null,
          loginTime: new Date().toISOString(),
        }

        if (userData?.authz?.systems && userData?.authz?.systems.length !== 0) {
          localStorage.setItem(
            'dashboardFlow',
            JSON.stringify({ currentFlow: 'escritorio', system: userData?.authz?.systems[0] }),
          )
        }

        console.log('👤 Usuario con roles:', {
          name: userData.name,
          authz: userData.authz,
          tenantId: userData.tenantId,
          isAdmin: userData.authz.roles.includes('ORG_ADMIN'),
        })

        // Guardar JWT en cookie para interceptores de axios
        if (data.data.token) {
          storeJWTInCookie(data.data.token)
          console.log('🍪 JWT guardado en cookie')
        }

        currentUser.value = userData
        isAuthenticated.value = true
        const sessionData = {
          user: userData,
          token: {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          },
          isAuthenticated: true,
          sessionType: mantenerSesion ? 'persistent' : 'temporary',
          timestamp: Date.now(),
        }
        if (mantenerSesion) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
        }
        console.log('✅ Login exitoso con roles guardados:', userData)
        return { success: true, message: data.message || 'Login exitoso', user: userData }
      } else {
        return { success: false, message: data.message || 'Credenciales inválidas', user: null }
      }
    } catch (error) {
      console.error(' Error en login:', error)
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        user: null,
      }
    }
  }

  const loginByQR = async (credentials /* mantenerSesion = true */) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('dashboardLogsSession'))
      const { token } = tokens
      console.log('AccessToken del usuario:', token.accessToken)
      console.log('Token del QR:', credentials.qrToken)

      const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN_QR, {
        qrToken: credentials.qrToken,
      })

      const data = response
      console.log('📥 Respuesta del login:', data)
      return data
    } catch (error) {
      console.error(' Error en login:', error)
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        user: null,
      }
    }
  }

  const buildSession = (data) => {
    const userData = {
      id: data.data.uid,
      name: data.data.name,
      email: data.data.email,
      authz: {
        permissions: data.data.perms,
        roles: data.data.roles,
        systems: data.data.systems,
      },
      tenantId: data.data.tenantId || null,
      loginTime: new Date().toISOString(),
    }

    // Guardar JWT en cookie para interceptores de axios
    if (data.payload.accessToken) {
      storeJWTInCookie(data.payload.accessToken)
      console.log('🍪 JWT guardado en cookie')
    }

    if (userData?.authz?.systems && userData?.authz?.systems !== 0) {
      localStorage.setItem(
        'dashboardFlow',
        JSON.stringify({ currentFlow: 'escritorio', system: userData?.authz?.systems[0] }),
      )
    }

    const sessionData = {
      user: userData,
      token: {
        accessToken: data.payload.accessToken,
        refreshToken: data.payload.refreshToken,
      },
      isAuthenticated: true,
      sessionType: 'persistent',
      timestamp: Date.now(),
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    console.log('✅ Login exitoso con roles guardados:', userData)
    return { success: true, message: data.payload.message || 'Login exitoso', user: userData }
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem('dashboardFlow')
      deleteJWTFromCookie()
      currentUser.value = null
      isAuthenticated.value = false
      console.log('🚪 Logout exitoso')
      return { success: true }
    } catch (error) {
      console.error(' Error en logout:', error)
      return { success: false, error: error.message }
    }
  }

  const checkSession = () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
      if (!sessionData) {
        clearSession()
        return false
      }
      const session = JSON.parse(sessionData)
      if (session && session.isAuthenticated === true) {
        currentUser.value = session.user
        isAuthenticated.value = true
        return true
      } else {
        clearSession()
        return false
      }
    } catch (error) {
      console.error(' Error al verificar sesión:', error)
      clearSession()
      return false
    }
  }

  const refreshAuthToken = (accessToken) => {
    try {
      const responseRefresh = axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken: accessToken,
      })

      console.log('🔄 Refrescando token:', responseRefresh)
    } catch (error) {
      console.log('🧱 Algo salió mal al momento de refrescar el token', error)
      clearSession()
    }
  }

  const user = computed(() => currentUser.value)
  const authenticated = computed(() => isAuthenticated.value)
  initializeAuth()

  return {
    user,
    authenticated,
    currentUser,
    isAuthenticated,
    register,
    login,
    loginByQR,
    logout,
    buildSession,
    initializeAuth,
    clearSession,
    checkSession,
    refreshAuthToken,
  }
}

export const authService = (() => {
  const service = useAuthService()
  return {
    get user() {
      return service.currentUser.value
    },
    get isAuthenticated() {
      return service.isAuthenticated.value
    },
    get userName() {
      return service.currentUser.value?.name || 'Usuario'
    },
    get userEmail() {
      return service.currentUser.value?.email || 'Sin email'
    },
    register: service.register,
    login: service.login,
    loginByQR: service.loginByQR,
    logout: service.logout,
    initializeAuth: service.initializeAuth,
    buildSession: service.buildSession,
    clearSession: service.clearSession,
    checkSession: service.checkSession,
    refreshAuthToken: service.refreshAuthToken,
  }
})()

export default authService
