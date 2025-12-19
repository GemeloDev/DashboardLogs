import { defineStore } from 'pinia'
import { axiosInstance } from 'src/services/axiosConfig';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: JSON.parse(localStorage.getItem('dashboardLogsSession')).token.accessToken || null,
    refreshToken: JSON.parse(localStorage.getItem('dashboardLogsSession')).token.refreshToken || null,
    isAuthenticated: JSON.parse(localStorage.getItem('dashboardLogsSession')).isAuthenticated || false,
    sessionType: JSON.parse(localStorage.getItem('dashboardLogsSession')).sessionType || null,
    timestamp: JSON.parse(localStorage.getItem('dashboardLogsSession')).timestamp || null,
    user: JSON.parse(localStorage.getItem('dashboardLogsSession')).user || '{}',
  }),

  getters: {
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUser: (state) => state.user,
    /** Agregar los métodos que considere indispensables */
  },

  actions: {

    //  Se llama al inicar sesión y después de un refresco exitoso
    setTokens(newAccessToken, newRefreshToken){
      this.accessToken = newAccessToken;
      this.refreshToken = newRefreshToken;
      this.isAuthenticated = true;

      const sessionData = JSON.parse(localStorage.getItem('dashboardLogsSession'))
      sessionData.token.accessToken = newAccessToken

      if(newRefreshToken) sessionData.token.refreshToken = newRefreshToken

      localStorage.setItem('dashboardLogsSession', JSON.stringify(sessionData))

      //  Establecer el header por defecto para peticiones inmediatas
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
    },

    logout(){
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.sessionType = null;
      this.timestamp = null;
      this.user = '{}';

      localStorage.removeItem('dashboardLogsSession')
      delete axiosInstance.defaults.headers.common['Authorization']

      // ** Redirección al login: Usa el router de Vue/Quasar aquí **
    }
  }
})
