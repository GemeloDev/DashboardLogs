import { reactive, ref } from 'vue'
import { axiosInstance } from './axiosConfig'
import { CATALOGS, EVA } from './endpoints'

// Fuente reactiva exclusiva del selector superior. Las consultas del dashboard
// usan mapas locales y nunca deben escribir en este ref.
export const globalMenuHealth = ref({})
export const systemColorsMap = reactive({})
export const catalogSystems = ref([])
let catalogFetchSeq = 0

function withSafeHealthRange(filters = {}) {
  if (filters.from || filters.to) return filters

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return {
    ...filters,
    from: startOfDay.toISOString(),
    to: now.toISOString(),
  }
}

export class CatalogService {
  static clearCache() {
    catalogFetchSeq += 1
    catalogSystems.value = []
    globalMenuHealth.value = {}
    Object.keys(systemColorsMap).forEach((key) => delete systemColorsMap[key])
  }

  static get healthMap() {
    return globalMenuHealth.value
  }

  static get systemsHealth() {
    return Object.values(globalMenuHealth.value)
  }

  static healthColor(health = {}) {
    const status = String(health.status || health.healthStatus || '').toUpperCase()
    const rate = Number(health.errorRate || 0)
    const total = Number(health.totalEvents24h ?? health.totalEvents ?? 0)

    if (status === 'INACTIVE' || total === 0) return 'grey-6'
    if (status === 'CRITICAL' || rate > 10) return 'negative'
    if (status === 'WARNING' || status === 'ALERTA' || rate > 0) return 'warning'
    return 'positive'
  }

  static async loadSystemColors(filters = {}) {
    const healthMap = await this.loadHealth(filters)
    Object.entries(healthMap).forEach(([systemName, health]) => {
      // Merge por clave: nunca se reemplaza ni se vacía el mapa global.
      systemColorsMap[systemName] = this.healthColor(health)
    })
    return systemColorsMap
  }

  static normalizeStatus(status, errorRate = 0) {
    const normalized = String(status || '')
      .trim()
      .toUpperCase()
    if (['INACTIVE', 'OFFLINE', 'DISABLED'].includes(normalized)) return 'INACTIVE'
    if (['CRITICAL', 'CRIT', 'CRÍTICO'].includes(normalized)) return 'CRITICAL'
    if (['WARNING', 'WARN', 'ALERT', 'ALERTA'].includes(normalized)) return 'WARNING'
    if (['STABLE', 'HEALTHY', 'OK'].includes(normalized)) return 'STABLE'
    if (Number(errorRate) >= 15) return 'CRITICAL'
    if (Number(errorRate) > 0) return 'WARNING'
    return 'STABLE'
  }

  static updateSystemHealth(system, health = {}, { ratio = false } = {}) {
    const key = String(
      system || health.systemCode || health.system || health.code || health.systemName || health.name || '',
    )
      .trim()
      .toUpperCase()
    if (!key) return null

    const rawRate = Number(health.errorRate ?? 0)
    const errorRate = Number.isFinite(rawRate)
      ? Number((ratio && Math.abs(rawRate) <= 1 ? rawRate * 100 : rawRate).toFixed(2))
      : 0
    const status = this.normalizeStatus(health.healthStatus ?? health.status ?? 'INACTIVE', errorRate)
    const rawTotalEvents24h = Number(
      health.totalEvents24h ??
        health.totalEventos24h ??
        health.totalEvents ??
        health.totalEventos ??
        health.totalLogs ??
        0,
    )
    const totalEvents24h = Number.isFinite(rawTotalEvents24h) ? rawTotalEvents24h : 0
    const rawErrorEvents = Number(health.errorEvents ?? health.errorCount ?? 0)
    const errorEvents = Number.isFinite(rawErrorEvents) ? rawErrorEvents : 0
    const normalized = {
      ...health,
      system: key,
      systemCode: key,
      status,
      healthStatus: status,
      errorRate,
      totalEvents: totalEvents24h,
      totalEvents24h,
      errorEvents,
      errorCount: errorEvents,
    }

    return normalized
  }

  static applyRealtimeHealth(payload) {
    const raw = payload?.data ?? payload
    const items = Array.isArray(raw) ? raw : raw ? [raw] : []
    const nextHealthMap = { ...globalMenuHealth.value }

    items.forEach((health) => {
      const systemCode =
        health?.systemCode || health?.system || health?.code || health?.systemName || health?.name
      const key = String(systemCode || '')
        .trim()
        .toUpperCase()
      if (!key) return

      const normalized = this.updateSystemHealth(key, health, { ratio: true })
      nextHealthMap[key] = normalized
      systemColorsMap[key] = this.healthColor(normalized)
    })

    globalMenuHealth.value = nextHealthMap
    return nextHealthMap
  }

  static updateSystemsHealth(healthList = []) {
    if (!Array.isArray(healthList)) return {}

    return Object.fromEntries(
      healthList
        .map((health) => {
          const systemCode =
            health?.systemCode || health?.system || health?.code || health?.systemName || health?.name
          const key = String(systemCode || '')
            .trim()
            .toUpperCase()
          return key ? [key, this.updateSystemHealth(key, health, { ratio: true })] : null
        })
        .filter(Boolean),
    )
  }

  static async loadHealth(filters = {}) {
    const safeFilters = withSafeHealthRange(filters)
    const response = await axiosInstance.get(CATALOGS.SYSTEMS_HEALTH, {
      timeout: safeFilters.timeout,
      signal: safeFilters.signal,
      params: {
        system: safeFilters.system || undefined,
        from: safeFilters.from,
        to: safeFilters.to,
        range: safeFilters.range || undefined,
      },
    })
    const payload = response.data?.data ?? response.data ?? []
    const healthList = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.systemsHealth)
        ? payload.systemsHealth
        : Array.isArray(payload.systems)
          ? payload.systems
          : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.content)
              ? payload.content
              : Object.values(payload)

    const snapshot = this.updateSystemsHealth(healthList)

    // Sólo la consulta general de 24 horas alimenta el selector. Las consultas
    // filtradas del dashboard retornan datos locales sin alterar este mapa.
    if (!safeFilters.system && !safeFilters.range) {
      globalMenuHealth.value = snapshot
    }

    return snapshot
  }

  static async loadGlobalMenuHealth(filters = {}) {
    try {
      const snapshot = await this.loadHealth(filters)
      globalMenuHealth.value = snapshot
      return snapshot
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') {
        console.warn('[CatalogService] Salud no disponible; se usará un mapa temporal vacío.')
      }
      globalMenuHealth.value = {}
      return {}
    }
  }

  static async fetchCatalogs(filters = {}) {
    const requestSeq = ++catalogFetchSeq
    try {
      // Cargar sistemas y salud en paralelo
      const [catalogResponse, healthResponse] = await Promise.allSettled([
        axiosInstance.get(EVA.CATALOGS_SYSTEMS, { timeout: filters.timeout }),
        this.loadHealth(filters),
      ])

      // Debug temporal
      // console.log('[CatalogService] catalog status:', catalogResponse.status)
      // console.log('[CatalogService] health status:', healthResponse.status)
      // if (healthResponse.status === 'fulfilled') {
      //   console.log('[CatalogService] health data:', healthResponse.value.data)
      // } else {
      //   console.error('[CatalogService] health error:', healthResponse.reason?.response?.status, healthResponse.reason?.message)
      // }

      const catalogPayload =
        catalogResponse.status === 'fulfilled' ? catalogResponse.value.data?.data || [] : []
      const items = Array.isArray(catalogPayload)
        ? catalogPayload
        : Array.isArray(catalogPayload.systems)
          ? catalogPayload.systems
          : Array.isArray(catalogPayload.items)
            ? catalogPayload.items
            : Array.isArray(catalogPayload.content)
              ? catalogPayload.content
              : []

      const healthMap =
        healthResponse.status === 'fulfilled' ? healthResponse.value : globalMenuHealth.value

      if (catalogResponse.status === 'rejected') {
        console.warn('[CatalogService] No se pudo cargar el catálogo de sistemas:', catalogResponse.reason)
      }
      if (healthResponse.status === 'rejected') {
        console.warn('[CatalogService] No se pudo cargar la salud de sistemas:', healthResponse.reason)
      }

      if (requestSeq !== catalogFetchSeq) {
        return { sistemas: [], sistemasSimple: [], healthMap: {} }
      }

      if (items.length) {
        catalogSystems.value = this._extractSistemas(items, healthMap)
      } else {
        const healthSystems = Object.keys(healthMap).map((code) => ({ code, name: code }))
        catalogSystems.value = this._extractSistemas(healthSystems, healthMap)
      }

      const resolvedSystems = this._extractSistemas(catalogSystems.value, healthMap)

      return {
        sistemas: resolvedSystems,
        sistemasSimple: this._extractNombresSimples(resolvedSystems),
        healthMap,
      }
    } catch (error) {
      console.error('[CatalogService] Error critico:', error.message)
      if (requestSeq === catalogFetchSeq) catalogSystems.value = []
      return {
        sistemas: catalogSystems.value,
        sistemasSimple: this._extractNombresSimples(catalogSystems.value),
        healthMap: globalMenuHealth.value,
      }
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
    return items
      .filter((item) => item?.systemCode || item?.code || item?.value || item?.name)
      .map((item) => {
        const code = String(item.systemCode || item.code || item.value || item.name)
          .trim()
          .toUpperCase()
        const name = item.name || item.label || code
        const health = healthMap[code]
        const catalogStatus = String(item.status || '').toUpperCase()
        const isActive = item.active !== false && !['INACTIVE', 'DISABLED'].includes(catalogStatus)

        return {
          ...item,
          code,
          name,
          value: item.value || code,
          label: name,
          active: isActive,
          status: health?.status || (isActive ? 'STABLE' : 'INACTIVE'),
          errorRate: Number(health?.errorRate ?? 0),
        }
      })
  }

  static _extractNombresSimples(items) {
    return items.map((item) => item.name).filter(Boolean)
  }
}
