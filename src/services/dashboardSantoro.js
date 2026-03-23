import { API_SANTORO_DASHBOARD } from './apiEndpoints'
import { axiosInstance } from './axiosConfig'

export class DashboardSantoro {
  static async getStats() {
    try {
      const response = await axiosInstance.get(`${API_SANTORO_DASHBOARD.STATS}`)
      console.log('ℹ️ Estadísticas consultadas: ', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al consultar estadísticas', error.message)
      return
    }
  }
}
