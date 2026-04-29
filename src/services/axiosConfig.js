/**
 * Configuración de Axios con Interceptores
 * Inyecta automáticamente headers de autenticación
 */

import axios from 'axios'
import { boot } from 'quasar/wrappers'
import { getJWTFromCookie } from './cookieService'
import { useAuthStore } from 'src/stores/auth'
import { AUTH } from './endpoints'

// Crear instancia de axios
export const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

//  Estado para evitar múltiples llamadas de refresco simultáneas
let isRefreshing = false
let failedQueue = []

/**
 * Función para procesar la cola de peticiones fallidas
 * @param {boolean} error - condición para considerarlo error
 * @param {token|null} token - valor del token que accedió al eventox
 */
const proccessQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request Interceptor - Inyecta JWT automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener JWT de la cookie
    const token = getJWTFromCookie()

    // Si la petición no es la de refresco, se añade el token
    if (config.url !== AUTH.REFRESH_TOKEN) {
      const authStore = useAuthStore()
      const token = authStore.getAccessToken

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

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
  },
)

// Response Interceptor - Maneja errores globalmente
axiosInstance.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })

    return response
  },
  async (error) => {
    const originalRequest = error.config
    //  Manejo específico de errores
    if (error.response?.status === 403) {
      console.warn('🚫 Acceso denegado - Permisos insuficientes')
    }

    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh-token') {
      console.warn('⚠️ AccessToken Invalido:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      })
      console.log('Refrescando token...')
      if (isRefreshing) {
        // Si ya refrescó, se manda como petición fallida a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            //  Reintentar la petición original con el nuevo token
            originalRequest.headers['Auhthorization'] = `Bearer ${token}`

            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true
      const authStore = useAuthStore()

      try {
        //  1. Llamar al endpoint de refresco
        const refreshToken = authStore.getRefreshToken //  Obtiene el token de refresco

        if (!refreshToken) {
          authStore.logout()
          return Promise.reject(error)
        }

        const response = await axios.post(AUTH.REFRESH_TOKEN, { refreshToken })

        const newAccessToken = response.data.data.accessToken
        const newRefreshToken = response.data.data.refreshToken

        //  2. Actualizar tokens en el store
        authStore.setTokens(newAccessToken, newRefreshToken)

        //  3. Reintentar la petición original con el nuevo token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`

        //  4. Procesar la cola y resolver
        proccessQueue(null, newAccessToken)
        isRefreshing = false

        //  5. Reintentar la solicitud original fallida
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // El refresco falló (ej. el Refresh Token expiró o fue revocado)
        proccessQueue(refreshError)
        authStore.logout()
        isRefreshing = false

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default boot(({ app }) => {
  // Configura $axiosInstance globalmente
  app.config.globalProperties.$axiosInstance = axiosInstance
})
