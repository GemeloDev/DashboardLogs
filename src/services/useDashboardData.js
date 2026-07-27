import { ref } from 'vue'
import { onSocketConnect, subscribeToNewLogs } from './socketService'
import DashboardService from 'src/services/dashboardService'
import authService from './authService'

// ─── Datos de los 5 endpoints ────────────────────────────────────────────────
const statsData   = ref(null)
const seriesData  = ref(null)
const httpData    = ref(null)
const geoData     = ref(null)
const devicesData = ref(null)

// ─── Errores de los 5 endpoints ──────────────────────────────────────────────
const statsError   = ref(null)
const seriesError  = ref(null)
const httpError    = ref(null)
const geoError     = ref(null)
const devicesError = ref(null)

// Solo estos estados son válidos como filtro para el endpoint de dispositivos
const DEVICE_VALID_STATUSES = new Set(['ONLINE', 'OFFLINE'])

// ── Auto-refresh por WebSocket ────────────────────────────────────────────────
let wsSubscription = null // suscripción activa al topic
let refreshDebounce = null // timer para evitar múltiples refreshes seguidos
let activeDashboardSubscription = null
let socketConnectUnsubscribe = null
let reconnectResubscribeTimer = null
//let pendingRefresh    = false  // indica que hay datos nuevos pero aún no se refrescó
const newLogsCount = ref(0) // cuántos logs nuevos llegaron sin refrescar
const refreshTick = ref(0)

// ─── Estado único de carga ────────────────────────────────────────────────────
const loading = ref(false)
const refreshing = ref(false)
const hasFetchedOnce = ref(false)

// ─── Concurrencia: solo la última petición aplica ─────────────────────────────
// Cada llamada a fetchAll incrementa `fetchSeq`. Al resolver Promise.allSettled,
// si el número ya no coincide con el actual se descarta la respuesta (stale).
let fetchSeq = 0
let fetchAbortController = null

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

function isCancelError(err) {
  return (
    err?.code === 'ERR_CANCELED' ||
    err?.name === 'CanceledError' ||
    err?.name === 'AbortError' ||
    err?.message === 'canceled'
  )
}

function formatRequestError(err, endpoint) {
  if (isCancelError(err)) return null
  if (err?.code === 'ECONNABORTED') {
    return `${endpoint}: tiempo de espera agotado`
  }
  const message = err?.response?.data?.message || err?.message || 'Error desconocido'
  const status = err?.response?.status
  return status ? `${endpoint}: ${message} (${status})` : `${endpoint}: ${message}`
}

function hasCachedDashboardData() {
  return !!(
    statsData.value ||
    seriesData.value ||
    httpData.value ||
    geoData.value ||
    devicesData.value
  )
}

async function fetchAll(filters = {}, options = {}) {
  const sys = String(filters?.system || '').trim()
  const from = toIsoStart(filters?.rangoFechas?.from || '')
  const to = toIsoEnd(filters?.rangoFechas?.to || '')
  const preserveExistingData = !!options?.preserveExistingData
  const isIncrementalRefresh = preserveExistingData && hasCachedDashboardData()

  if (!sys) return

  fetchAbortController?.abort()
  fetchAbortController = new AbortController()
  const signal = fetchAbortController.signal

  const seq = ++fetchSeq
  loading.value = !isIncrementalRefresh
  refreshing.value = isIncrementalRefresh

  if (!isIncrementalRefresh) {
    statsData.value = null
    seriesData.value = null
    httpData.value = null
    geoData.value = null
    devicesData.value = null
  }

  // Limpiar errores previos al inicio de una nueva carga
  statsError.value = null
  seriesError.value = null
  httpError.value = null
  geoError.value = null
  devicesError.value = null

  const deviceStatus = DEVICE_VALID_STATUSES.has(String(filters?.values?.status || '').toUpperCase())
    ? String(filters.values.status).toUpperCase()
    : undefined

  try {
    const [rStats, rSeries, rHttp, rGeo, rDevices] = await Promise.allSettled([
      DashboardService.getStats({ system: sys, from, to, signal }),
      DashboardService.getSeries({ system: sys, from, to, signal }),
      DashboardService.getHttp({ system: sys, from, to, signal }),
      DashboardService.getGeo({ system: sys, from, to, signal }),
      DashboardService.getDevices({ system: sys, status: deviceStatus, signal }),
    ])

    if (seq !== fetchSeq) return

    statsData.value = rStats.status === 'fulfilled' ? (rStats.value ?? null) : null
    seriesData.value = rSeries.status === 'fulfilled' ? (rSeries.value ?? null) : null
    httpData.value = rHttp.status === 'fulfilled' ? (rHttp.value ?? null) : null
    geoData.value = rGeo.status === 'fulfilled' ? (rGeo.value ?? null) : null
    devicesData.value = rDevices.status === 'fulfilled' ? (rDevices.value ?? null) : null

    statsError.value = rStats.status === 'rejected' ? formatRequestError(rStats.reason, 'stats') : null
    seriesError.value = rSeries.status === 'rejected' ? formatRequestError(rSeries.reason, 'series') : null
    httpError.value = rHttp.status === 'rejected' ? formatRequestError(rHttp.reason, 'http') : null
    geoError.value = rGeo.status === 'rejected' ? formatRequestError(rGeo.reason, 'geo') : null
    devicesError.value = rDevices.status === 'rejected' ? formatRequestError(rDevices.reason, 'devices') : null
  } catch (err) {
    if (seq !== fetchSeq) return
    console.error('Dashboard fetchAll error:', err?.message || err)
  } finally {
    if (seq === fetchSeq) {
      hasFetchedOnce.value = true
      loading.value = false
      refreshing.value = false
    }
  }
}

// ── Suscribirse al WebSocket del sistema seleccionado ─────────────────────────
function clearDashboardSubscription() {
  if (wsSubscription) {
    try {
      wsSubscription.unsubscribe()
    } catch (e) {
      console.error('[useDashboardData] Error al cancelar suscripción:', e)
    }
    wsSubscription = null
  }
}

function clearRefreshDebounce() {
  if (refreshDebounce) {
    clearTimeout(refreshDebounce)
    refreshDebounce = null
  }
}

function clearReconnectResubscribeTimer() {
  if (reconnectResubscribeTimer) {
    clearTimeout(reconnectResubscribeTimer)
    reconnectResubscribeTimer = null
  }
}

function unsubscribeSystem() {
  clearDashboardSubscription()
  clearRefreshDebounce()
  clearReconnectResubscribeTimer()
  activeDashboardSubscription = null

  newLogsCount.value = 0
}

function resetDashboardData() {
  fetchAbortController?.abort()
  unsubscribeSystem()
  statsData.value = null
  seriesData.value = null
  httpData.value = null
  geoData.value = null
  devicesData.value = null
  statsError.value = null
  seriesError.value = null
  httpError.value = null
  geoError.value = null
  devicesError.value = null
  loading.value = false
  refreshing.value = false
  newLogsCount.value = 0
  refreshTick.value = 0
  hasFetchedOnce.value = false
  fetchSeq += 1
}

function resubscribeActiveDashboardTopic() {
  if (!activeDashboardSubscription) return

  clearDashboardSubscription()

  const { tenantId, system, getFilters, onRefreshExtra } = activeDashboardSubscription
  if (!tenantId || !system) return

  wsSubscription = subscribeToNewLogs(tenantId, system, (payload) => {
    newLogsCount.value += payload.count || 1

    if (refreshDebounce) clearTimeout(refreshDebounce)
    refreshDebounce = setTimeout(async () => {
      newLogsCount.value = 0
      await fetchAll(getFilters?.() || {}, { preserveExistingData: true })
      await onRefreshExtra?.()
      refreshTick.value += 1
    }, 3000)
  })
}

function ensureSocketConnectResubscribe() {
  if (socketConnectUnsubscribe) return

  socketConnectUnsubscribe = onSocketConnect(() => {
    clearReconnectResubscribeTimer()
    reconnectResubscribeTimer = setTimeout(() => {
      resubscribeActiveDashboardTopic()
    }, 0)
  })
}

function subscribeSystem(system, getFilters, onRefreshExtra) {
  clearDashboardSubscription()
  clearRefreshDebounce()
  clearReconnectResubscribeTimer()

  const tenantId =
    authService.user?.tenantId ||
    authService.user?.authz?.tenantId ||
    authService.user?.organization?.id

  activeDashboardSubscription = { tenantId, system, getFilters, onRefreshExtra }
  ensureSocketConnectResubscribe()
  resubscribeActiveDashboardTopic()
}

export function useDashboardData() {
  return {
    loading,
    refreshing,
    statsData,
    seriesData,
    httpData,
    geoData,
    devicesData,
    statsError,
    seriesError,
    httpError,
    geoError,
    devicesError,
    hasFetchedOnce,
    fetchAll,
    subscribeSystem,
    unsubscribeSystem,
    resetDashboardData,
    newLogsCount,
    refreshTick,
  }
}
