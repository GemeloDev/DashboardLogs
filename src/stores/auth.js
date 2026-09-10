import { defineStore } from 'pinia'
import { axiosInstance } from 'src/services/axiosConfig'
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  readSession,
  updateStoredTokens,
} from 'src/services/sessionStorage'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const session = readSession()

    return {
      accessToken: session?.token?.accessToken || null,
      refreshToken: session?.token?.refreshToken || null,
      isAuthenticated: session?.isAuthenticated || false,
      sessionType: session?.sessionType || null,
      timestamp: session?.timestamp || null,
      user: session?.user || null,
    }
  },

  getters: {
    // El fallback al storage cubre logins realizados antes de instanciar Pinia.
    getAccessToken: (state) => state.accessToken || getStoredAccessToken(),
    getRefreshToken: (state) => state.refreshToken || getStoredRefreshToken(),
    getUser: (state) => state.user,
    /** Agregar los métodos que considere indispensables */
  },

  actions: {
    //  Se llama al inicar sesión y después de un refresco exitoso
    setTokens(newAccessToken, newRefreshToken) {
      this.accessToken = newAccessToken
      this.refreshToken = newRefreshToken || this.refreshToken
      this.isAuthenticated = true

      updateStoredTokens(newAccessToken, newRefreshToken)

      //  Establecer el header por defecto para peticiones inmediatas
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
    },

    syncTokensFromSession() {
      this.accessToken = getStoredAccessToken()
      this.refreshToken = getStoredRefreshToken()
      this.isAuthenticated = Boolean(this.accessToken)
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.sessionType = null
      this.timestamp = null
      this.user = null

      clearStoredSession()
      delete axiosInstance.defaults.headers.common['Authorization']

      // ** Redirección al login: Usa el router de Vue/Quasar aquí **
    },
  },
})
