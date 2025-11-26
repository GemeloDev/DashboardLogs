/**
 * Servicio de Autenticación Centralizado
 */
import { ref, computed } from 'vue'
import { AUTH_ENDPOINTS, DEFAULT_CONFIG } from './apiEndpoints.js'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const SESSION_KEY = 'dashboardLogsSession'

export const useAuthService = () => {
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
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
            isAdmin: (session.user.roles || []).includes('ADMIN')
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
          password: userData.password
        })
      })
      const data = await response.json()
      console.log(' Respuesta del registro:', data)
      return {
        success: data.status === true,
        message: data.message || (data.status ? 'Usuario registrado correctamente' : 'Error en el registro'),
        data: data.data
      }
    } catch (error) {
      console.error(' Error en registro:', error)
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: null
      }
    }
  }

  const login = async (credentials, mantenerSesion = true) => {
    try {
      // Obtener tenantId del QR escaneado
      const qrTenantId = localStorage.getItem('qr_tenant_id')

      console.log(' Iniciando login:', {
        email: credentials.email,
        tenantId: qrTenantId || 'No disponible'
      })

      // Crear headers con X-Tenant
      const headers = {
        ...DEFAULT_CONFIG.headers
      }

      if (qrTenantId) {
        headers['X-Tenant'] = qrTenantId
        console.log('🏢 Enviando Tenant ID en header:', qrTenantId)
      } else {
        console.warn('⚠️ No se encontró Tenant ID del QR')
      }

      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      })
      const data = await response.json()
      console.log('📥 Respuesta del login:', data)

      if (data.ok && data.data) {
        const userData = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          roles: data.data.roles || [],
          tenantId: data.data.tenantId || qrTenantId || null,
          loginTime: new Date().toISOString()
        }

        console.log('👤 Usuario con roles:', {
          name: userData.name,
          roles: userData.roles,
          tenantId: userData.tenantId,
          isAdmin: userData.roles.includes('ADMIN')
        })

        currentUser.value = userData
        isAuthenticated.value = true
        const sessionData = {
          user: userData,
          isAuthenticated: true,
          sessionType: mantenerSesion ? 'persistent' : 'temporary',
          timestamp: Date.now()
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
      return { success: false, message: 'Error de conexión. Verifica tu conexión a internet.', user: null }
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      currentUser.value = null
      isAuthenticated.value = false
      console.log(' Logout exitoso')
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

  const user = computed(() => currentUser.value)
  const authenticated = computed(() => isAuthenticated.value)
  initializeAuth()

  return { user, authenticated, currentUser, isAuthenticated, register, login, logout, initializeAuth, clearSession, checkSession }
}

export const authService = (() => {
  const service = useAuthService()
  return {
    get user() { return service.currentUser.value },
    get isAuthenticated() { return service.isAuthenticated.value },
    get userName() { return service.currentUser.value?.name || 'Usuario' },
    get userEmail() { return service.currentUser.value?.email || 'Sin email' },
    register: service.register,
    login: service.login,
    logout: service.logout,
    initializeAuth: service.initializeAuth,
    clearSession: service.clearSession,
    checkSession: service.checkSession
  }
})()

export default authService
