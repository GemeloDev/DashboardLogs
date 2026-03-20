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

  //  Empresas / Organizations
  static async getEmpresas() {
    try {
      const response = await axiosInstance.get(`${API_SANTORO_DASHBOARD.EMPRESAS}`)
      console.log('✅ Empresas obtenidas correctamente: ', response.data)
      return response.data
    } catch (error) {
      return error.message
    }
  }

  static async getEmpresasById(id) {
    try {
      const response = await axiosInstance.get(`${API_SANTORO_DASHBOARD.EMPRESAS}/${id}`)
      console.log('✅ Empresa obtenida correctamente: ', response.data)
      return response.data
    } catch (error) {
      return error.message
    }
  }

  static async createEmpresas(payload) {
    try {
      const response = await axiosInstance.post(`${API_SANTORO_DASHBOARD.EMPRESAS}`, {
        payload
      })

      return response.data
    } catch (error) {
      return error.message
    }
  }
}
