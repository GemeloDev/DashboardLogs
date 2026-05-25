import { axiosInstance } from './axiosConfig'
import { SANTORO } from './endpoints'

export class DashboardSantoro {
  static async getStats() {
    try {
      const response = await axiosInstance.get(SANTORO.STATS)
      return response.data
    } catch (error) {
      console.error('Error al consultar estadisticas', error.message)
      return
    }
  }

  static async getEmpresas() {
    try {
      const response = await axiosInstance.get(SANTORO.EMPRESAS)
      return response.data
    } catch (error) {
      return error.message
    }
  }

  static async getEmpresasById(id) {
    try {
      const response = await axiosInstance.get(`${SANTORO.EMPRESAS}/${id}`)
      return response.data
    } catch (error) {
      return error.message
    }
  }

  static async createEmpresas(payload) {
    try {
      const response = await axiosInstance.post(SANTORO.EMPRESAS, payload)
      return response.data
    } catch (error) {
      console.error('Error en createEmpresa()', error.message)
      return error
    }
  }

  static async statusEmpresa(empresa, status) {
    const { id } = empresa

    try {
      const response = await axiosInstance.put(`${SANTORO.EMPRESAS}/${id}/status`, {
        status,
      })
      return response.data
    } catch (error) {
      console.error('Error en statusEmpresa()', error.message)
      return error
    }
  }

  static async getUsers() {
    try {
      const response = await axiosInstance.get(SANTORO.USUARIOS)
      return response.data
    } catch (error) {
      console.error('Error al obtener usuarios getUsers(): ', error.message || error)
      return error
    }
  }

  static async getAPIKeys() {
    try {
      const response = await axiosInstance.get(SANTORO.API_KEYS)
      return response.data
    } catch (error) {
      console.error('Error al obtener api keys getAPIKeys(): ', error.message)
      return error.message
    }
  }

  static async changeStatusApiKey(empresa, apiKey, status) {
    try {
      const response = await axiosInstance.put(
        `${SANTORO.EMPRESAS}/${empresa}/api-keys/${apiKey}/status`,
        { status },
      )
      return response.data
    } catch (error) {
      console.error('Error al cambiar el estado de la API key: ', error.message)
      return error
    }
  }

  static async alertasAPIs() {
    try {
      const now = new Date()
      const sevenDaysAgo = new Date(now - 7 * 86_400_000)
      const sevenDaysLater = new Date(now.getTime() + 7 * 86_400_000)

      const response = await axiosInstance.get(SANTORO.API_KEYS)
      const keys = response.data.data.content

      return {
        expiredKeys: keys.filter((k) => new Date(k.expiresAt) < now),
        expiringKeys: keys.filter((k) => {
          const exp = new Date(k.expiresAt)
          return exp >= now && exp <= sevenDaysLater
        }),
        recentKeys: keys.filter((k) => new Date(k.createdAt) >= sevenDaysAgo),
      }
    } catch (error) {
      console.error('Error al crear alertas y seguimiento de API Keys: ', error.message)
      return error
    }
  }
}
