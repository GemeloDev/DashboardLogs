import { axiosInstance } from './axiosConfig'
import { CATALOGS, EVA } from './endpoints'

export class CatalogService {

  static async fetchCatalogs() {
    try {
      // Cargar sistemas y salud en paralelo
      const [catalogResponse, healthResponse] = await Promise.allSettled([
        axiosInstance.get(EVA.CATALOGS_SYSTEMS),
        axiosInstance.get(CATALOGS.HEALT),
      ])

      const items = catalogResponse.status === 'fulfilled'
              ? (catalogResponse.value.data?.data || []) : []

      const healthList = healthResponse.status === 'fulfilled'
              ? (healthResponse.value.data?.data || []) : []

      // Crear mapa de salud por sistema (status normalizado para la UI)
      const healthMap = {}
      healthList.forEach(h => {
        if (h?.system) {
          healthMap[h.system] = {
            ...h,
            status: this._normalizeStatus(h.status),
          }
        }
      })

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

  static _normalizeStatus(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'CRITICAL' || s === 'ERROR' || s === 'FATAL') return 'CRIT'
    if (s === 'WARN' || s === 'WARNING') return 'WARN'
    if (s === 'HEALTHY' || s === 'OK') return 'HEALTHY'
    if (s === 'INACTIVE') return 'INACTIVE'
    return s || 'INACTIVE'
  }

  static _extractSistemas(items, healthMap = {}) {
    const sistemas = items
      .map(item => item.name)
      .filter(Boolean)
      .map(name => ({
        value:     name,
        label:     name,
        status:    healthMap[name]?.status    || 'INACTIVE',
        errorRate: healthMap[name]?.errorRate || 0,
      }))

    if (sistemas.length) return sistemas

    // Fallback temporal: si el catálogo de sistemas falla o regresa vacío,
    // derivar la lista directamente desde el endpoint de systems-health.
    return Object.entries(healthMap).map(([name, h]) => ({
      value:     name,
      label:     name,
      status:    h.status || 'INACTIVE',
      errorRate: h.errorRate || 0,
    }))
  }

  static _extractNombresSimples(items) {
    return items.map(item => item.name).filter(Boolean)
  }
}
