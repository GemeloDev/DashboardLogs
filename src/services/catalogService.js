import { axiosInstance } from './axiosConfig'
import { EVA } from './endpoints'

export class CatalogService {

  static async fetchCatalogs() {
    try {
      // Cargar sistemas y salud en paralelo
      const [catalogResponse, healthResponse] = await Promise.allSettled([
        axiosInstance.get(EVA.CATALOGS_SYSTEMS),
        axiosInstance.get('/api/logs/dashboard/systems-health'),
      ])

      // Debug temporal
      // console.log('[CatalogService] catalog status:', catalogResponse.status)
      // console.log('[CatalogService] health status:', healthResponse.status)
      // if (healthResponse.status === 'fulfilled') {
      //   console.log('[CatalogService] health data:', healthResponse.value.data)
      // } else {
      //   console.error('[CatalogService] health error:', healthResponse.reason?.response?.status, healthResponse.reason?.message)
      // }

      const items = catalogResponse.status === 'fulfilled'
              ? (catalogResponse.value.data?.data || []) : []

      const healthList = healthResponse.status === 'fulfilled'
              ? (healthResponse.value.data?.data || []) : []

      // Crear mapa de salud por sistema
      const healthMap = {}
      healthList.forEach(h => {
        if (h?.system) healthMap[h.system] = h
      })

      console.log('[CatalogService] healthMap:', healthMap)
      console.log(`[CatalogService] Catalogo cargado: ${items.length} sistemas.`)

      return {
        sistemas:       this._extractSistemas(items, healthMap),
        sistemasSimple: this._extractNombresSimples(items),
        healthMap,
      }

    } catch (error) {
      console.error('[CatalogService] Error critico:', error.message)
      return { sistemas: [], sistemasSimple: [], healthMap: {} }
    }
  }

  static _extractSistemas(items, healthMap = {}) {
    return items
      .map(item => item.name)
      .filter(Boolean)
      .map(name => ({
        value:     name,
        label:     name,
        status:    healthMap[name]?.status    || 'INACTIVE',
        errorRate: healthMap[name]?.errorRate || 0,
      }))
  }

  static _extractNombresSimples(items) {
    return items.map(item => item.name).filter(Boolean)
  }
}
