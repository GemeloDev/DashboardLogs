/**
 * Configuración de Axios con Interceptores
 * Inyecta automáticamente headers de autenticación
 */

import axios from 'axios'
import { getJWTFromCookie } from './cookieService'

// Crear instancia de axios
export const axiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Request Interceptor - Inyecta JWT automáticamente
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener JWT de la cookie
        const token = getJWTFromCookie()

        if (token) {
            // Agregar Bearer Token en Authorization header
            config.headers.Authorization = `Bearer ${token}`
            console.log('🔐 Token JWT agregado al header:', `Bearer ${token.substring(0, 20)}...`)
        }

        // Obtener tenantId del localStorage
        const sessionData = localStorage.getItem('dashboardLogsSession')
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData)
                if (session.user?.tenantId) {
                    config.headers['X-Tenant'] = session.user.tenantId
                    console.log('🏢 Tenant ID agregado al header:', session.user.tenantId)
                }
            } catch (error) {
                console.warn('⚠️ Error al parsear sesión:', error)
            }
        }

        return config
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error)
        return Promise.reject(error)
    }
)

// Response Interceptor - Maneja errores globalmente
axiosInstance.interceptors.response.use(
    (response) => {
        // Log de respuestas exitosas
        console.log('✅ Respuesta recibida:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        })
        return response
    },
    (error) => {
        console.error('❌ Error en respuesta:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        })

        // Manejo específico de errores
        if (error.response?.status === 401) {
            console.warn('🔒 No autorizado - Token inválido o expirado')
            // Limpiar sesión si el token es inválido
            localStorage.removeItem('dashboardLogsSession')
            // Opcional: redirigir al login
            // window.location.href = '/login'
        }

        if (error.response?.status === 403) {
            console.warn('🚫 Acceso denegado - Permisos insuficientes')
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
