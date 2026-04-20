import { ref } from 'vue'
import { subscribeToNewLogs } from './socketService'
import DashboardService from 'src/services/dashboardService'
import authService from './authService'

// ─── Datos de los 4 endpoints ────────────────────────────────────────────────
const statsData  = ref(null)
const seriesData = ref(null)
const httpData   = ref(null)
const geoData    = ref(null)

// ── Auto-refresh por WebSocket ────────────────────────────────────────────────
let wsSubscription = null // suscripción activa al topic
let refreshDebounce = null // timer para evitar múltiples refreshes seguidos
//let pendingRefresh    = false  // indica que hay datos nuevos pero aún no se refrescó
const newLogsCount = ref(0) // cuántos logs nuevos llegaron sin refrescar

// ─── Estado único de carga ────────────────────────────────────────────────────
const loading = ref(false)

// ─── Concurrencia: solo la última petición aplica ─────────────────────────────
// Cada llamada a fetchAll incrementa `fetchSeq`. Al resolver Promise.allSettled,
// si el número ya no coincide con el actual se descarta la respuesta (stale).
let fetchSeq = 0

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
const toIsoStart = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return raw.includes('T') ? raw : `${raw}T00:00:00Z`
}
const toIsoEnd = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return raw.includes('T') ? raw : `${raw}T23:59:59Z`
}

async function fetchAll(filters = {}) {
  const sys = String(filters?.system || '').trim()
  const from = toIsoStart(filters?.rangoFechas?.from || '')
  const to = toIsoEnd(filters?.rangoFechas?.to || '')

  if (!sys) return

  const seq = ++fetchSeq
  loading.value = true

  statsData.value = null
  seriesData.value = null
  httpData.value = null
  geoData.value = null

  try {
    const [rStats, rSeries, rHttp, rGeo] = await Promise.allSettled([
      DashboardService.getStats({ system: sys, from, to }),
      DashboardService.getSeries({ system: sys }),
      DashboardService.getHttp({ system: sys }),
      DashboardService.getGeo({ system: sys }),
    ])

    if (seq !== fetchSeq) return

    statsData.value = rStats.status === 'fulfilled' ? (rStats.value ?? null) : null
    seriesData.value = rSeries.status === 'fulfilled' ? (rSeries.value ?? null) : null
    httpData.value = rHttp.status === 'fulfilled' ? (rHttp.value ?? null) : null
    geoData.value = rGeo.status === 'fulfilled' ? (rGeo.value ?? null) : null
  } catch (err) {
    if (seq !== fetchSeq) return
    console.error('Dashboard fetchAll error:', err?.message || err)
  } finally {
    if (seq === fetchSeq) loading.value = false
  }
}

// ── Suscribirse al WebSocket del sistema seleccionado ─────────────────────────
function unsubscribeSystem() {
  if (wsSubscription) {
    try {
      wsSubscription.unsubscribe()
    } catch (e) {
      console.error('[useDashboardData] Error al cancelar suscripción:', e)
    }
    wsSubscription = null
  }

  if (refreshDebounce) {
    clearTimeout(refreshDebounce)
    refreshDebounce = null
  }

  newLogsCount.value = 0
}

function subscribeSystem(system, getFilters, onRefreshExtra) {
  unsubscribeSystem()

  const tenantId =
    authService.user?.tenantId ||
    authService.user?.authz?.tenantId ||
    authService.user?.organization?.id

  if (!tenantId || !system) return

  wsSubscription = subscribeToNewLogs(tenantId, system, (payload) => {
    newLogsCount.value += payload.count || 1

    if (refreshDebounce) clearTimeout(refreshDebounce)
    refreshDebounce = setTimeout(async () => {
      newLogsCount.value = 0
      await fetchAll(getFilters?.() || {})
      onRefreshExtra?.()
    }, 3000)
  })
}

export function useDashboardData() {
  return {
    loading,
    statsData,
    seriesData,
    httpData,
    geoData,
    fetchAll,
    subscribeSystem,
    unsubscribeSystem,
    newLogsCount,
  }
}

