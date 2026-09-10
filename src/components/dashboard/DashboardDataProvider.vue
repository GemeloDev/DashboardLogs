<template>
  <slot />
</template>

<script setup>
import { computed, provide, ref, watch, onBeforeUnmount } from 'vue'
import { useDashboardData } from 'src/services/useDashboardData'
import { ChartDataService } from 'src/services/chartDataService'
import { useDashboardSharedStore } from 'src/stores/dashboardShared.store'

const props = defineProps({
  openConsole: {
    type: Function,
    default: null,
  },
  realtimeOwner: {
    type: Boolean,
    default: false,
  },
})

const dashboardStore = useDashboardSharedStore()
dashboardStore.initSync()

const filtrosGlobales = computed({
  get: () => dashboardStore.filtros,
  set: (value) => dashboardStore.setFilters(value),
})

const logsGlobales = ref([])
const eventosRaw = ref([])
const loadingLogs = ref(false)

const {
  loading: dashboardLoading,
  refreshing: dashboardRefreshing,
  statsData,
  todayStatsData,
  seriesData,
  httpData,
  geoData,
  devicesData,
  hasFetchedOnce: dashboardHasFetchedOnce,
  fetchAll,
  subscribeSystem,
  unsubscribeSystem,
} = useDashboardData()

const dashboardRefreshTick = computed(() => dashboardStore.externalRefreshTick)

provide('dashboardLoading', dashboardLoading)
provide('dashboardRefreshing', dashboardRefreshing)
provide('dashboardHasFetchedOnce', dashboardHasFetchedOnce)
provide('dashboardRefreshTick', dashboardRefreshTick)
provide('dashboardStatsData', statsData)
provide('dashboardTodayStatsData', todayStatsData)
provide('dashboardSeriesData', seriesData)
provide('dashboardHttpData', httpData)
provide('dashboardGeoData', geoData)
provide('dashboardDevicesData', devicesData)
provide('logsGlobales', logsGlobales)
provide('filtrosGlobales', filtrosGlobales)
provide('openConsole', props.openConsole)
provide('loadingLogs', loadingLogs)

const dashboardQueryKey = computed(() => {
  const sys = String(dashboardStore.filtros?.system || '').trim()
  const from = dashboardStore.filtros?.rangoFechas?.from || ''
  const to = dashboardStore.filtros?.rangoFechas?.to || ''
  return `${sys}|${from}|${to}`
})

const dateRangeKey = computed(() => {
  const from = dashboardStore.filtros?.rangoFechas?.from || ''
  const to = dashboardStore.filtros?.rangoFechas?.to || ''
  return `${from}|${to}`
})

function aplicarFiltroRangoFechas() {
  const r = dashboardStore.filtros?.rangoFechas || {}
  const from = r.from || ''
  const to = r.to || ''

  if (!from && !to) {
    logsGlobales.value = eventosRaw.value
    return
  }

  const startStr = from || to
  const endStr = to || from
  const startMs = Date.parse(`${startStr}T00:00:00.000Z`)
  const endMs = Date.parse(`${endStr}T23:59:59.999Z`)

  logsGlobales.value = eventosRaw.value.filter((eventItem) => {
    const eventDate = new Date(eventItem?.eventTime || eventItem?.fechaHoraDia || '').getTime()
    if (!Number.isFinite(eventDate)) return false
    return eventDate >= startMs && eventDate <= endMs
  })
}

async function cargarEventosDelSistema() {
  const system = String(dashboardStore.filtros?.system || '').trim()

  if (!system) {
    eventosRaw.value = []
    logsGlobales.value = []
    return
  }

  loadingLogs.value = true

  try {
    const range = dashboardStore.filtros?.rangoFechas || {}
    const today = new Date().toISOString().split('T')[0]
    const response = await ChartDataService.getLogsEvents({
      system,
      page: 0,
      size: 50,
      fromDate: range.from || range.to || today,
      toDate: range.to || range.from || today,
    })

    eventosRaw.value = response?.items || []
    aplicarFiltroRangoFechas()
  } catch (error) {
    console.error('[DashboardDataProvider] Error al cargar eventos:', error)
    eventosRaw.value = []
    logsGlobales.value = []
  } finally {
    loadingLogs.value = false
  }
}

async function refreshFromRealtime() {
  if (!dashboardStore.filtros?.system) return

  await Promise.all([
    fetchAll(dashboardStore.filtros, { preserveExistingData: true }),
    cargarEventosDelSistema(),
  ])
}

function applyRealtimeLog(newLog = {}) {
  const deviceId = String(newLog?.meta?.deviceId || newLog?.deviceId || '').trim()
  if (!deviceId) return

  const eventKey =
    newLog?.id ||
    newLog?.eventId ||
    `${deviceId}|${newLog?.eventType || ''}|${newLog?.eventTime || newLog?.timestamp || ''}`
  const exists = eventosRaw.value.some((event) => {
    const currentDeviceId = String(event?.meta?.deviceId || event?.deviceId || '').trim()
    const currentKey =
      event?.id ||
      event?.eventId ||
      `${currentDeviceId}|${event?.eventType || ''}|${event?.eventTime || event?.timestamp || ''}`
    return currentKey === eventKey
  })
  if (exists) return

  eventosRaw.value = [newLog, ...eventosRaw.value]
  aplicarFiltroRangoFechas()
}

watch(
  dashboardQueryKey,
  () => {
    if (!dashboardStore.filtros?.system) return
    fetchAll(dashboardStore.filtros)
  },
  { immediate: true },
)

watch(
  dateRangeKey,
  () => {
    aplicarFiltroRangoFechas()
  },
  { immediate: true },
)

watch(
  () => dashboardStore.filtros.system,
  (system) => {
    if (!system) {
      eventosRaw.value = []
      logsGlobales.value = []
      unsubscribeSystem()
      return
    }

    cargarEventosDelSistema()

    if (!props.realtimeOwner) return

    subscribeSystem(
      system,
      () => dashboardStore.filtros,
      async () => {
        await cargarEventosDelSistema()
        dashboardStore.announceRealtimeRefresh()
      },
      applyRealtimeLog,
    )
  },
  { immediate: true },
)

watch(
  () => dashboardStore.externalRefreshTick,
  (tick, previous) => {
    if (props.realtimeOwner || !dashboardStore.filtros?.system || tick === previous) return
    refreshFromRealtime()
  },
)

onBeforeUnmount(() => {
  if (props.realtimeOwner) {
    unsubscribeSystem()
  }
})
</script>
