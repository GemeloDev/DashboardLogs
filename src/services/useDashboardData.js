import { computed, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { onSocketConnect, subscribeToNewLogs, subscribeToTopic } from './socketService'
import DashboardService from 'src/services/dashboardService'
import { CatalogService } from 'src/services/catalogService'
import authService from './authService'

// ─── Datos de los 5 endpoints ────────────────────────────────────────────────
const statsData = ref(null)
const todayStatsData = ref(null)
const seriesData = ref(null)
const httpData = ref(null)
const geoData = ref(null)
const devicesData = ref(null)
const attendanceAnomaliesData = ref(null)
const catalogHealthMap = ref({})
export const dashboardCache = reactive({})

// Solo estos estados son válidos como filtro para el endpoint de dispositivos
const DEVICE_VALID_STATUSES = new Set(['ONLINE', 'OFFLINE'])
const SYSTEM_CODE_ALIASES = {
  CITAS_GUYANA: 'CITA_GUYANA',
}

export const SYSTEM_PROJECT_IDS = Object.freeze({
  ESTRUCTURA_ELECTORAL: 1,
  ESCUCHA: 2,
})

export function normalizeSystemCode(system, fallback = '') {
  const raw = system?.code || system?.value || system || fallback
  const normalized = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
  return SYSTEM_CODE_ALIASES[normalized] || normalized
}

export function resolveSystemProjectId(system, projectMap = {}, fallback = 1) {
  const systemCode = normalizeSystemCode(system)
  const value = SYSTEM_PROJECT_IDS[systemCode] ?? projectMap?.[systemCode] ?? fallback
  const numericId = Number(value)
  return Number.isFinite(numericId) && numericId > 0 ? numericId : fallback
}

// ── Auto-refresh por WebSocket ────────────────────────────────────────────────
let wsSubscription = null // suscripción activa al topic
let refreshDebounce = null // timer para evitar múltiples refreshes seguidos
let activeDashboardSubscription = null
let socketConnectUnsubscribe = null
let systemHealthSubscription = null
let globalLogsSubscription = null
//let pendingRefresh    = false  // indica que hay datos nuevos pero aún no se refrescó
const newLogsCount = ref(0) // cuántos logs nuevos llegaron sin refrescar
const refreshTick = ref(0)

// ─── Estado único de carga ────────────────────────────────────────────────────
const loading = ref(false)
const refreshing = ref(false)
const hasFetchedOnce = ref(false)

// Fuente reactiva y normalizada para cualquier consumidor que necesite
// representar o exportar exactamente los KPIs del periodo actualmente cargado.
const metrics = computed(() => {
  const stats = statsData.value || todayStatsData.value || {}
  const totalEvents = Number(stats.totalEvents || 0)
  const errorRate = Number(stats.errorRate || 0)

  return {
    totalEvents,
    errorRate: Number.isFinite(errorRate) ? errorRate : 0,
    errorCount: Number(stats.errorCount || 0),
    successCount: Number(stats.successCount ?? Math.max(totalEvents - Number(stats.errorCount || 0), 0)),
    healthStatus: stats.healthStatus || stats.systemHealth || 'STABLE',
  }
})

// ─── Concurrencia: solo la última petición aplica ─────────────────────────────
// Cada llamada a fetchAll incrementa `fetchSeq`. Las respuestas de una llamada
// anterior se descartan aunque lleguen después que las de la llamada vigente.
// si el número ya no coincide con el actual se descarta la respuesta (stale).
let fetchSeq = 0
let lastFetchedSystem = ''
let lastStatsRangeKey = ''
let analyticsAbortController = null
let lastRealtimeFetchTime = 0
let realtimeRefreshInFlight = false
const REALTIME_REFRESH_INTERVAL_MS = 10_000

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

export function getSafeDashboardRange(rangeKey) {
  const now = new Date()
  const from = new Date(now)
  const normalizedRange = String(rangeKey || '').trim().toLowerCase()

  if (['all', 'historico', 'histórico', '1970'].includes(normalizedRange)) {
    // Los agregados de las gráficas no deben consultar todo el histórico.
    from.setFullYear(now.getFullYear() - 1)
  } else if (normalizedRange === '30d') {
    from.setDate(now.getDate() - 30)
  } else if (normalizedRange === '7d') {
    from.setDate(now.getDate() - 7)
  } else {
    from.setHours(0, 0, 0, 0)
  }

  return { from: from.toISOString(), to: now.toISOString() }
}

function hasCachedDashboardData() {
  return !!(
    statsData.value ||
    todayStatsData.value ||
    seriesData.value ||
    httpData.value ||
    geoData.value ||
    devicesData.value
  )
}

function isTimeoutError(error) {
  return (
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ETIMEDOUT' ||
    String(error?.message || '')
      .toLowerCase()
      .includes('timeout')
  )
}

function isCanceledRequest(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
}

function cancelPendingDashboardRequests() {
  if (!analyticsAbortController) return
  analyticsAbortController.abort()
  analyticsAbortController = null
  fetchSeq += 1
}

function renewAnalyticsAbortController() {
  cancelPendingDashboardRequests()
  analyticsAbortController = new AbortController()
  return analyticsAbortController
}

function notifyDashboardError(error) {
  const timedOut = isTimeoutError(error)

  Notify.create({
    type: 'warning',
    icon: timedOut ? 'schedule' : 'warning',
    message: timedOut
      ? 'El dashboard está tardando más de lo esperado en responder.'
      : 'No fue posible cargar los datos del dashboard.',
    caption: timedOut
      ? 'La consulta no se completó en 60 segundos. Intenta nuevamente en unos momentos.'
      : 'Conservamos la aplicación disponible para que puedas volver a intentarlo.',
    position: 'top-right',
    timeout: 7000,
  })
}

function normalizeStats(data) {
  if (!data || typeof data !== 'object') return null

  const breakdown = data.breakdown || data.eventBreakdown || data.activityBreakdown || {}
  const totalEvents = Number(data.totalEvents ?? data.total ?? breakdown.total ?? 0)
  const errorCount = Number(
    data.errorCount ??
      data.failedEvents ??
      data.failureCount ??
      data.failures ??
      breakdown.errorCount ??
      breakdown.failed ??
      breakdown.failures ??
      0,
  )
  const successCount = Number(
    data.successCount ??
      data.successfulEvents ??
      data.successes ??
      breakdown.successCount ??
      breakdown.successful ??
      breakdown.successes ??
      Math.max(totalEvents - errorCount, 0),
  )
  const rawErrorRate = Number(
    data.errorRate ??
      data.globalErrorRate ??
      breakdown.errorRate ??
      (totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0),
  )
  const errorRate = Number.isFinite(rawErrorRate) ? rawErrorRate : 0

  // `healthStatus` es la propiedad canónica del endpoint stats. Se conservan
  // aliases para respuestas anteriores del backend.
  const reportedHealth = String(
    data.healthStatus ?? data.systemHealth ?? data.health ?? data.status ?? '',
  )
    .trim()
    .toUpperCase()
  const healthStatus = ['CRITICAL', 'CRIT'].includes(reportedHealth)
    ? 'CRITICAL'
    : ['WARNING', 'WARN', 'ALERT', 'ALERTA'].includes(reportedHealth)
      ? 'WARNING'
      : ['INACTIVE', 'OFFLINE', 'DISABLED'].includes(reportedHealth)
        ? 'INACTIVE'
        : ['STABLE', 'HEALTHY', 'OK'].includes(reportedHealth)
          ? 'STABLE'
          : errorRate >= 15
            ? 'CRITICAL'
            : errorRate > 0
              ? 'WARNING'
              : 'STABLE'

  return {
    ...data,
    totalEvents,
    errorCount,
    successCount,
    errorRate,
    healthStatus,
    systemHealth: healthStatus,
    totalHistoricalLogs: Number(data.totalHistoricalLogs ?? data.totalProcessedLogs ?? 0),
  }
}

function normalizeCatalogHealthMap(healthMap = {}) {
  return Object.fromEntries(
    Object.entries(healthMap).map(([system, health]) => {
      const rawRate = Number(health?.errorRate ?? 0)
      // CatalogService entrega siempre porcentajes, independientemente de la
      // escala usada por el endpoint de catálogo.
      const errorRate = Number.isFinite(rawRate) ? Number(rawRate.toFixed(2)) : 0
      const rawStatus = String(health?.status || '')
        .trim()
        .toUpperCase()
      const status = ['CRITICAL', 'CRIT'].includes(rawStatus)
        ? 'CRITICAL'
        : ['WARNING', 'WARN', 'ALERT', 'ALERTA'].includes(rawStatus)
          ? 'WARNING'
          : ['INACTIVE', 'OFFLINE', 'DISABLED'].includes(rawStatus)
            ? 'INACTIVE'
            : ['STABLE', 'HEALTHY', 'OK'].includes(rawStatus)
              ? 'STABLE'
              : errorRate > 15
                ? 'CRITICAL'
                : errorRate > 5
                  ? 'WARNING'
                  : 'STABLE'

      return [normalizeSystemCode(system), { ...health, status, errorRate }]
    }),
  )
}

async function fetchAll(filters = {}, options = {}) {
  const sys = normalizeSystemCode(filters?.system)
  if (!sys) return

  const requestController = renewAnalyticsAbortController()
  const signal = requestController.signal
  const systemChanged = !!sys && sys !== lastFetchedSystem
  const rawFrom = String(filters?.rangoFechas?.from || '').trim()
  const rawTo = String(filters?.rangoFechas?.to || '').trim()
  const fullHistory =
    filters?.range === 'ALL' ||
    filters?.rangoFechas?.range === 'ALL' ||
    filters?.rangoFechas?.option === 'all' ||
    (!rawFrom && !rawTo && !filters?.rangoFechas?.option)
  const range = fullHistory ? 'ALL' : undefined
  const safeDashboardRange = fullHistory ? getSafeDashboardRange('ALL') : null
  const from = safeDashboardRange?.from || toIsoStart(rawFrom)
  const to = safeDashboardRange?.to || toIsoEnd(rawTo)
  const today = new Date()
  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayFrom = toIsoStart(todayYmd)
  const todayTo = toIsoEnd(todayYmd)
  const preserveExistingData = !!options?.preserveExistingData
  const statsRangeKey = `${sys}|${range || ''}|${from}|${to}`
  const statsRangeChanged = statsRangeKey !== lastStatsRangeKey

  lastFetchedSystem = sys
  lastStatsRangeKey = statsRangeKey

  const seq = ++fetchSeq
  const cached = dashboardCache[statsRangeKey]
  const silent = !!options?.silent || preserveExistingData || !!cached

  if (cached) {
    statsData.value = cached.statsData
    todayStatsData.value = cached.todayStatsData
    seriesData.value = cached.seriesData
    httpData.value = cached.httpData
    geoData.value = cached.geoData
    devicesData.value = cached.devicesData
    attendanceAnomaliesData.value = cached.attendanceAnomaliesData
    catalogHealthMap.value = cached.catalogHealthMap || {}
    hasFetchedOnce.value = true
  }

  loading.value = !silent
  refreshing.value = silent

  if (!silent) {
    statsData.value = null
    todayStatsData.value = null
    seriesData.value = null
    httpData.value = null
    geoData.value = null
    devicesData.value = null
    attendanceAnomaliesData.value = null
  } else if (!cached && statsRangeChanged && !preserveExistingData) {
    // No mostrar estadísticas del rango anterior mientras responde /stats.
    statsData.value = null
  }

  const requestedDeviceStatus = String(filters?.values?.status || '').toUpperCase()
  const deviceStatus =
    !systemChanged && DEVICE_VALID_STATUSES.has(requestedDeviceStatus)
      ? requestedDeviceStatus
      : undefined

  let errorNotified = false
  const reportError = (dataset, error) => {
    if (seq !== fetchSeq) return
    if (isCanceledRequest(error)) return
    console.error(`Dashboard ${dataset} error:`, error?.message || error)
    if (!silent && !errorNotified) {
      errorNotified = true
      notifyDashboardError(error)
    }
  }

  const loadWidget = async (name, request) => {
    try {
      return { ok: true, value: await request }
    } catch (error) {
      reportError(name, error)
      return { ok: false, error }
    }
  }

  try {
    const [statsRes, todayRes, healthRes, seriesRes, httpRes, geoRes, devicesRes, anomaliesRes] =
      await Promise.all([
        loadWidget('stats', DashboardService.getStats({ system: sys, from, to, range, signal })),
        loadWidget(
          'today-stats',
          DashboardService.getStats({ system: sys, from: todayFrom, to: todayTo, signal }),
        ),
        loadWidget(
          'catalog-health',
          CatalogService.loadHealth({ system: sys, from, to, range, signal }),
        ),
        loadWidget('series', DashboardService.getSeries({ system: sys, from, to, range, signal })),
        loadWidget('http', DashboardService.getHttp({ system: sys, from, to, range, signal })),
        loadWidget('geo', DashboardService.getGeo({ system: sys, from, to, range, signal })),
        loadWidget(
          'devices',
          DashboardService.getDevices({ system: sys, status: deviceStatus, signal }),
        ),
        loadWidget(
          'attendance-anomalies',
          DashboardService.getAttendanceAnomalies({ system: sys, signal }),
        ),
      ])

    if (seq !== fetchSeq) return

    if (statsRes.ok) statsData.value = normalizeStats(statsRes.value)
    if (todayRes.ok) todayStatsData.value = normalizeStats(todayRes.value)
    if (seriesRes.ok) seriesData.value = seriesRes.value ?? null
    if (httpRes.ok) httpData.value = httpRes.value ?? null
    if (geoRes.ok) geoData.value = geoRes.value ?? null
    if (devicesRes.ok) devicesData.value = devicesRes.value ?? null
    if (anomaliesRes.ok) attendanceAnomaliesData.value = anomaliesRes.value ?? null
    if (healthRes.ok) catalogHealthMap.value = normalizeCatalogHealthMap(healthRes.value)

    if (statsData.value) {
      catalogHealthMap.value = {
        ...catalogHealthMap.value,
        [sys.toUpperCase()]: CatalogService.updateSystemHealth(sys, statsData.value),
      }
    }

    dashboardCache[statsRangeKey] = {
      statsData: statsData.value,
      todayStatsData: todayStatsData.value,
      seriesData: seriesData.value,
      httpData: httpData.value,
      geoData: geoData.value,
      devicesData: devicesData.value,
      attendanceAnomaliesData: attendanceAnomaliesData.value,
      catalogHealthMap: catalogHealthMap.value,
      updatedAt: Date.now(),
    }
  } finally {
    if (seq === fetchSeq) {
      hasFetchedOnce.value = true
      loading.value = false
      refreshing.value = false
    }
  }
}

function fetchSilent(filters = {}) {
  return fetchAll(filters, { silent: true, preserveExistingData: true })
}

// Actualiza únicamente los datasets que alimentan las gráficas. A diferencia de
// fetchAll, no limpia ni vuelve a consultar los KPIs/actividad en tiempo real.
// El histórico de los agregados se limita a un año para proteger la base de datos.
async function fetchAnalytics(filters = {}) {
  const sys = normalizeSystemCode(filters?.system)
  if (!sys) return
  const requestController = renewAnalyticsAbortController()
  const signal = requestController.signal
  lastFetchedSystem = sys

  const fullHistory =
    filters?.range === 'ALL' ||
    filters?.rangoFechas?.range === 'ALL' ||
    filters?.rangoFechas?.option === 'all'
  const range = fullHistory ? 'ALL' : undefined
  const safeDashboardRange = fullHistory ? getSafeDashboardRange('ALL') : null
  const from = safeDashboardRange?.from || toIsoStart(filters?.rangoFechas?.from || '')
  const to = safeDashboardRange?.to || toIsoEnd(filters?.rangoFechas?.to || '')
  const seq = ++fetchSeq

  refreshing.value = hasCachedDashboardData()

  let errorNotified = false
  const reportError = (dataset, error) => {
    if (seq !== fetchSeq) return
    if (isCanceledRequest(error)) return
    console.error(`Dashboard ${dataset} error:`, error?.message || error)
    if (!errorNotified) {
      errorNotified = true
      notifyDashboardError(error)
    }
  }

  const loadDataset = async (name, request, target) => {
    try {
      const data = await request
      if (seq === fetchSeq) {
        target.value = name === 'stats' ? normalizeStats(data) : (data ?? null)
      }
      return data
    } catch (error) {
      reportError(name, error)
      return null
    }
  }

  try {
    await Promise.allSettled([
      loadDataset(
        'stats',
        DashboardService.getStats({ system: sys, from, to, range, signal }),
        statsData,
      ),
      loadDataset(
        'series',
        DashboardService.getSeries({ system: sys, from, to, range, signal }),
        seriesData,
      ),
      loadDataset(
        'http',
        DashboardService.getHttp({ system: sys, from, to, range, signal }),
        httpData,
      ),
      loadDataset(
        'geo',
        DashboardService.getGeo({ system: sys, from, to, range, signal }),
        geoData,
      ),
    ])
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

function scheduleRealtimeRefresh(payload = {}) {
  if (!activeDashboardSubscription) return

  const payloadSystem = normalizeSystemCode(
    payload.system || payload.systemName || payload.log?.system || payload.data?.system,
  )
  const activeSystem = normalizeSystemCode(activeDashboardSubscription.system)

  if (payloadSystem && payloadSystem !== activeSystem) return

  const realtimeEvent = payload?.log || payload?.event || payload?.data?.log || payload?.data || payload
  activeDashboardSubscription.onRealtimeEvent?.(realtimeEvent)

  newLogsCount.value += Number(payload.count || 1)
  if (refreshDebounce || realtimeRefreshInFlight) return

  const elapsed = Date.now() - lastRealtimeFetchTime
  const delay = Math.max(300, REALTIME_REFRESH_INTERVAL_MS - elapsed)
  refreshDebounce = setTimeout(async () => {
    refreshDebounce = null
    const { getFilters, onRefreshExtra } = activeDashboardSubscription || {}
    if (!getFilters) return

    realtimeRefreshInFlight = true
    lastRealtimeFetchTime = Date.now()
    newLogsCount.value = 0
    try {
      await fetchSilent(getFilters() || {})
      await onRefreshExtra?.()
      refreshTick.value += 1
    } finally {
      realtimeRefreshInFlight = false
    }
  }, delay)
}

function applyRealtimeSystemHealth(payload) {
  try {
    CatalogService.applyRealtimeHealth(payload)
  } catch (error) {
    console.error('Error procesando frame de WebSocket:', error)
  }
}

function subscribeGlobalRealtimeTopics() {
  try {
    systemHealthSubscription?.unsubscribe?.()
    globalLogsSubscription?.unsubscribe?.()
  } catch (error) {
    console.warn('[STOMP] No fue posible limpiar una suscripción anterior:', error)
  }
  systemHealthSubscription = subscribeToTopic('/topic/system-health', applyRealtimeSystemHealth)
  globalLogsSubscription = subscribeToTopic('/topic/logs', scheduleRealtimeRefresh)
}

function unsubscribeSystem() {
  clearDashboardSubscription()
  clearRefreshDebounce()
  activeDashboardSubscription = null

  newLogsCount.value = 0
}

function resetDashboardData() {
  unsubscribeSystem()
  cancelPendingDashboardRequests()
  statsData.value = null
  todayStatsData.value = null
  seriesData.value = null
  httpData.value = null
  geoData.value = null
  devicesData.value = null
  attendanceAnomaliesData.value = null
  catalogHealthMap.value = {}
  loading.value = false
  refreshing.value = false
  newLogsCount.value = 0
  refreshTick.value = 0
  hasFetchedOnce.value = false
  lastFetchedSystem = ''
  lastStatsRangeKey = ''
  lastRealtimeFetchTime = 0
  realtimeRefreshInFlight = false
  fetchSeq += 1
}

function resubscribeActiveDashboardTopic() {
  if (!activeDashboardSubscription) return

  clearDashboardSubscription()

  const { tenantId, system } = activeDashboardSubscription
  if (!tenantId || !system) return

  wsSubscription = subscribeToNewLogs(tenantId, system, scheduleRealtimeRefresh)
}

function ensureSocketConnectResubscribe() {
  if (socketConnectUnsubscribe) return

  socketConnectUnsubscribe = onSocketConnect(() => {
    subscribeGlobalRealtimeTopics()
    resubscribeActiveDashboardTopic()
  })
}

function subscribeSystem(system, getFilters, onRefreshExtra, onRealtimeEvent) {
  clearDashboardSubscription()
  clearRefreshDebounce()

  const tenantId =
    authService.user?.tenantId ||
    authService.user?.authz?.tenantId ||
    authService.user?.organization?.id

  activeDashboardSubscription = {
    tenantId,
    system: normalizeSystemCode(system),
    getFilters,
    onRefreshExtra,
    onRealtimeEvent,
  }
  ensureSocketConnectResubscribe()
  subscribeGlobalRealtimeTopics()
  resubscribeActiveDashboardTopic()
}

export function useDashboardData() {
  return {
    loading,
    refreshing,
    metrics,
    statsData,
    todayStatsData,
    seriesData,
    httpData,
    geoData,
    devicesData,
    attendanceAnomaliesData,
    catalogHealthMap,
    hasFetchedOnce,
    fetchAll,
    fetchSilent,
    fetchAnalytics,
    cancelPendingDashboardRequests,
    subscribeSystem,
    unsubscribeSystem,
    resetDashboardData,
    newLogsCount,
    refreshTick,
  }
}
