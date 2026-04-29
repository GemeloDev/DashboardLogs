/**
 * Servicio de Autenticación Centralizado
 */

import axios from 'axios'
import { ref, computed } from 'vue'
import { AUTH, REQUEST_CONFIG } from './endpoints.js'
import { storeJWTInCookie, deleteJWTFromCookie } from './cookieService.js'
import { axiosInstance } from './axiosConfig.js'

const currentUser = ref(null)
const isAuthenticated = ref(false)
const SESSION_KEY = 'dashboardLogsSession'
const DEFAULT_PREFS = { flow: 'client', system: 'DASHBOARD' }
const SANTORO_DOMAIN = '@grupo-santoro.com.mx'
const DASHBOARD_SYNC_CHANNEL = 'dashboard-multipanel-sync-v1'
const DASHBOARD_SHARED_STORE_KEY = 'dashboardShared'

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

        if (session && session.isAuthenticated && session.user) {
          const roles = session.user?.authz?.roles || []
          currentUser.value = {
            ...session.user,
            isAdmin: roles.includes('ORG_OWNER'),
          }

          isAuthenticated.value = true

          console.log('🔄 Sesión restaurada:', {
            name: currentUser.value?.name,
            roles,
            permissions: currentUser.value?.authz?.permissions || [],
            isAdmin: currentUser.value?.isAdmin,
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
      const response = await fetch(AUTH.REGISTER, {
        method: 'POST',
        headers: REQUEST_CONFIG.headers,
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
        ...REQUEST_CONFIG.headers,
      }

      const response = await fetch(AUTH.LOGIN, {
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
          organization: {...data.data.organization},
          loginTime: new Date().toISOString(),
          mustChangePassword: data.data.mustChangePassword
        }

        const initialFlow = getAllowedFlow(userData)
        console.log(initialFlow)

        if (userData?.authz?.systems && userData?.authz?.systems.length !== 0) {
          localStorage.setItem(
            'dashboardFlow',
            JSON.stringify({ flow: initialFlow, system: userData?.authz?.systems[0] }),
          )
        }

        console.log('👤 Usuario con roles:', {
          name: userData.name,
          authz: userData.authz,
          tenantId: userData.tenantId,
          isAdmin:
            userData.authz.roles.includes('ORG_ADMIN') ||
            userData.authz.roles.includes('ORG_OWNER'),
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
        return { success: true, message: data.message || 'Login exitoso', user: userData, mustChangePassword: userData.mustChangePassword }
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

      const response = await axiosInstance.post(AUTH.LOGIN_QR, {
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

  const loadPrefs = () => {
    try {
      const raw = localStorage.getItem('dashboardFlow')
      const allowedFlow = getAllowedFlow()

      if (!raw) {
        return {
          ...DEFAULT_PREFS,
          flow: allowedFlow,
        }
      }

      const p = JSON.parse(raw)

      return {
        flow: sanitizeFlow(p.flow, currentUser.value),
        system: p.system ?? DEFAULT_PREFS.system,
      }
    } catch {
      return {
        ...DEFAULT_PREFS,
        flow: getAllowedFlow(),
      }
    }
  }

  const savePrefs = (flow, system) => {
    const safeFlow = sanitizeFlow(flow, currentUser.value)
    localStorage.setItem('dashboardFlow', JSON.stringify({ flow: safeFlow, system }))
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

    const initialFlow = getAllowedFlow(userData)

    if (userData?.authz?.systems && userData?.authz?.systems.length !== 0) {
      localStorage.setItem(
        'dashboardFlow',
        JSON.stringify({ flow: initialFlow, system: userData?.authz?.systems[0] }),
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
      localStorage.removeItem(DASHBOARD_SYNC_CHANNEL)
      localStorage.removeItem(DASHBOARD_SHARED_STORE_KEY)
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

        const prefs = loadPrefs()
        savePrefs(prefs.flow, prefs.system)

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
      const responseRefresh = axios.post(AUTH.REFRESH_TOKEN, {
        refreshToken: accessToken,
      })

      console.log('🔄 Refrescando token:', responseRefresh)
    } catch (error) {
      console.log('🧱 Algo salió mal al momento de refrescar el token', error)
      clearSession()
    }
  }

  /**
   * Helpers de permisos/roles
   */
  const getPermissions = () => currentUser.value?.authz?.permissions || []
  const getRoles = () => currentUser.value?.authz.roles || []

  const hasPermission = (permissions) => {
    if (!permissions) return true
    return getPermissions().includes(permissions)
  }

  const hasAnyPermissions = (permissions = []) => {
    if (!permissions || permissions.length === 0) return true
    const perms = getPermissions()
    return permissions.some((p) => perms.includes(p))
  }

  const hasAllPermissions = (permissions = []) => {
    if (!permissions || permissions.length === 0) return true
    const perms = getPermissions()
    return permissions.every((p) => perms.includes(p))
  }

  const hasRole = (role) => {
    if (!role) return true
    return getRoles().includes(role)
  }

  const hasAnyRole = (roles = []) => {
    if (!roles || roles.length === 0) return true
    const r = getRoles()
    return roles.some((x) => r.includes(x))
  }

  /**
   * Método "can" universal:
   * - string => permiso único
   * - array => ALL permisos
   * - objeto => control fino (any/all/roles)
   */

  const can = (rule) => {
    if (!rule) return true

    //  Si no hay sesión válida, no autoriza
    if (!isAuthenticated.value) return false

    if (typeof rule === 'string') return hasPermission(rule)

    if (Array.isArray(rule)) return hasAllPermissions(rule)

    //  rule: { any, all, rolesAny, rolesAlll }
    const any = rule.any ? hasAnyPermissions(rule.any) : true
    const all = rule.all ? hasAllPermissions(rule.all) : true

    const rolesAny = rule.rolesAny ? hasAnyRole(rule.rolesAny) : true
    const rolesAll = rule.rolesAll
      ? (rule.rolesAll || []).every((x) => getRoles().includes(x))
      : true

    return any && all && rolesAny && rolesAll
  }

  const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string') return ''
    return email.trim().toLowerCase()
  }

  const isSantoroEmail = (email) => {
    return normalizeEmail(email).endsWith(SANTORO_DOMAIN)
  }

  const canAccessSantoroFlow = (userParam = currentUser.value) => {
    const email = userParam?.email || ''
    return isSantoroEmail(email)
  }

  const canAccessClientFlow = (userParam = currentUser.value) => {
    return !!userParam
  }

  const getAllowedFlow = (userParam = currentUser.value) => {
    return canAccessSantoroFlow(userParam) ? 'santoro' : 'client'
  }

  const sanitizeFlow = (flow, userParam = currentUser.value) => {
    const allowedFlow = getAllowedFlow(userParam)

    if (flow === 'santoro') {
      return canAccessSantoroFlow(userParam) ? 'santoro' : 'client'
    }

    if (flow === 'client') {
      return 'client'
    }

    return allowedFlow
  }

  const getCurrentFlow = () => {
    const prefs = loadPrefs()
    return sanitizeFlow(prefs.flow, currentUser.value)
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
    loadPrefs,
    savePrefs,

    //  ✅ Nuevos
    getPermissions,
    getRoles,
    hasPermission,
    hasAnyPermissions,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    can,

    //  Flujo santoro/client
    getCurrentFlow,
    normalizeEmail,
    isSantoroEmail,
    canAccessSantoroFlow,
    canAccessClientFlow,
    getAllowedFlow,
    sanitizeFlow,
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
    loadPrefs: service.loadPrefs,
    savePrefs: service.savePrefs,

    //  Roles / Permisos
    getPermissions: service.getPermissions,
    getRoles: service.getRoles,
    hasPermission: service.hasPermission,
    hasAnyPermission: service.hasAnyPermissions,
    hasAllPermissions: service.hasAllPermissions,
    hasRole: service.hasRole,
    hasAnyRole: service.hasAnyRole,
    can: service.can,

    //  Flujo santoro/client
    normalizeEmail: service.normalizeEmail,
    isSantoroEmail: service.isSantoroEmail,
    canAccessSantoroFlow: service.canAccessSantoroFlow,
    canAccessClientFlow: service.canAccessClientFlow,
    getAllowedFlow: service.getAllowedFlow,
    sanitizeFlow: service.sanitizeFlow,
    getCurrentFlow: service.getCurrentFlow,
  }
})()

export default authService
