/**
 * Servicio de Autenticación Centralizado
 * Maneja todas las operaciones relacionadas con autenticación y sesión de usuario
 */

import { ref, computed } from 'vue'

// Estado reactivo global de la autenticación
const currentUser = ref(null)
const isAuthenticated = ref(false)

// Claves para el almacenamiento
const SESSION_KEY = 'dashboardLogsSession'

/**
 * Servicio de autenticación con estado reactivo
 */
export const useAuthService = () => {

    /**
     * Inicializar la sesión desde el almacenamiento
     */
    const initializeAuth = () => {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY) ||
                sessionStorage.getItem(SESSION_KEY)

            if (sessionData) {
                const session = JSON.parse(sessionData)

                if (session && session.isAuthenticated === true) {
                    currentUser.value = session.user
                    isAuthenticated.value = true

                    console.log('🔐 Sesión restaurada:', {
                        email: session.user?.email,
                        nombre: session.user?.nombre
                    })
                }
            }
        } catch (error) {
            console.error('❌ Error al inicializar autenticación:', error)
            clearSession()
        }
    }

    /**
     * Realizar login y guardar sesión
     */
    const login = (credentials, mantenerSesion = true) => {
        try {
            const sessionData = {
                isAuthenticated: true,
                user: {
                    email: credentials.email,
                    nombre: credentials.nombre || credentials.email.split('@')[0] || 'Usuario'
                },
                mantenerSesion,
                timestamp: new Date().toISOString()
            }

            // Guardar en el almacenamiento apropiado
            const storage = mantenerSesion ? localStorage : sessionStorage
            storage.setItem(SESSION_KEY, JSON.stringify(sessionData))

            // Actualizar estado reactivo
            currentUser.value = sessionData.user
            isAuthenticated.value = true

            console.log('✅ Login exitoso:', {
                email: sessionData.user.email,
                nombre: sessionData.user.nombre,
                mantenerSesion
            })

            return { success: true, user: sessionData.user }
        } catch (error) {
            console.error('❌ Error en login:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Realizar logout y limpiar toda la sesión
     */
    const logout = () => {
        try {
            // Limpiar ambos tipos de almacenamiento
            localStorage.removeItem(SESSION_KEY)
            sessionStorage.removeItem(SESSION_KEY)

            // Limpiar estado reactivo
            currentUser.value = null
            isAuthenticated.value = false

            console.log('🚪 Logout exitoso - Sesión limpiada')

            return { success: true }
        } catch (error) {
            console.error('❌ Error en logout:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Limpiar sesión (usado internamente)
     */
    const clearSession = () => {
        localStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        currentUser.value = null
        isAuthenticated.value = false
    }

    /**
     * Verificar si hay una sesión válida
     */
    const checkSession = () => {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY) ||
                sessionStorage.getItem(SESSION_KEY)

            if (!sessionData) {
                clearSession()
                return false
            }

            const session = JSON.parse(sessionData)

            if (session && session.isAuthenticated === true) {
                // Verificar que no sea muy antigua (opcional)
                const timestamp = new Date(session.timestamp)
                const now = new Date()
                const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24)

                // Si la sesión tiene más de 30 días, considerarla expirada
                if (daysDiff > 30) {
                    console.log('⚠️ Sesión expirada por tiempo')
                    clearSession()
                    return false
                }

                return true
            }

            clearSession()
            return false
        } catch (error) {
            console.error('❌ Error verificando sesión:', error)
            clearSession()
            return false
        }
    }

    /**
     * Obtener información del usuario actual
     */
    const getUserInfo = () => {
        return currentUser.value
    }

    /**
     * Actualizar información del usuario
     */
    const updateUserInfo = (newUserInfo) => {
        if (!isAuthenticated.value) {
            console.warn('⚠️ No se puede actualizar usuario - no autenticado')
            return false
        }

        try {
            const sessionData = localStorage.getItem(SESSION_KEY) ||
                sessionStorage.getItem(SESSION_KEY)

            if (sessionData) {
                const session = JSON.parse(sessionData)
                session.user = { ...session.user, ...newUserInfo }

                const storage = session.mantenerSesion ? localStorage : sessionStorage
                storage.setItem(SESSION_KEY, JSON.stringify(session))

                currentUser.value = session.user

                console.log('✅ Información de usuario actualizada:', session.user)
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Error actualizando usuario:', error)
            return false
        }
    }

    // Propiedades computadas
    const userName = computed(() => currentUser.value?.nombre || 'Usuario')
    const userEmail = computed(() => currentUser.value?.email || '')

    return {
        // Estado reactivo
        currentUser: computed(() => currentUser.value),
        isAuthenticated: computed(() => isAuthenticated.value),
        userName,
        userEmail,

        // Métodos
        initializeAuth,
        login,
        logout,
        checkSession,
        getUserInfo,
        updateUserInfo,
        clearSession
    }
}

// Instancia global del servicio (singleton)
let authServiceInstance = null

/**
 * Obtener la instancia singleton del servicio de autenticación
 */
export const getAuthService = () => {
    if (!authServiceInstance) {
        authServiceInstance = useAuthService()
        // Inicializar automáticamente
        authServiceInstance.initializeAuth()
    }
    return authServiceInstance
}

// Exportar también como default
export default {
    useAuthService,
    getAuthService
}
