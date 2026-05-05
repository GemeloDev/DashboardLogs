import { axiosInstance } from './axiosConfig'
import { DASHBOARD, EVA } from './endpoints'
import { isDebug } from 'src/config/env'

export class CatalogService {

  static async fetchCatalogs() {
    try {
      // Cargar sistemas y salud en paralelo
      const [catalogResponse, healthResponse] = await Promise.allSettled([
        axiosInstance.get(EVA.CATALOGS_SYSTEMS),
        axiosInstance.get(DASHBOARD.SYSTEMS_HEALTH),
      ])

      if (isDebug && healthResponse.status === 'rejected') {
        console.error('[CatalogService] Error cargando salud de sistemas:', {
          url: DASHBOARD.SYSTEMS_HEALTH,
          status: healthResponse.reason?.response?.status,
          message: healthResponse.reason?.message,
        })
      }

      const items = catalogResponse.status === 'fulfilled'
              ? (catalogResponse.value.data?.data || []) : []

      const healthList = healthResponse.status === 'fulfilled'
              ? (healthResponse.value.data?.data || []) : []

      // Crear mapa de salud por sistema
      const healthMap = {}
      healthList.forEach(h => {
        if (h?.system) healthMap[h.system] = h
      })

      if (isDebug) {
        console.log('[CatalogService] healthMap:', healthMap)
        console.log(`[CatalogService] Catalogo cargado: ${items.length} sistemas.`)
      }

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
