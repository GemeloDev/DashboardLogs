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

const debugWindowLabel =
  typeof window !== 'undefined' ? window.name || 'main-window' : 'ssr-window'

const logProvider = (message, details = undefined) => {
  if (details === undefined) {
    console.info(`[DashboardDataProvider][${debugWindowLabel}] ${message}`)
    return
  }
  console.info(`[DashboardDataProvider][${debugWindowLabel}] ${message}`, details)
}

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
  seriesData,
  httpData,
  geoData,
  devicesData,
  fetchAll,
  subscribeSystem,
  unsubscribeSystem,
} = useDashboardData()

const dashboardRefreshTick = computed(() => dashboardStore.externalRefreshTick)

provide('dashboardLoading', dashboardLoading)
provide('dashboardRefreshing', dashboardRefreshing)
provide('dashboardRefreshTick', dashboardRefreshTick)
provide('dashboardStatsData', statsData)
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
  logProvider('cargarEventosDelSistema:start', { system, filtros: dashboardStore.filtros })

  if (!system) {
    eventosRaw.value = []
    logsGlobales.value = []
    logProvider('cargarEventosDelSistema:skip-no-system')
    return
  }

  loadingLogs.value = true

  try {
    const response = await ChartDataService.getLogsEvents({
      system,
      page: 0,
      size: 10000,
    })

    eventosRaw.value = response?.items || []
    aplicarFiltroRangoFechas()
    logProvider('cargarEventosDelSistema:done', {
      rawCount: eventosRaw.value.length,
      filteredCount: logsGlobales.value.length,
    })
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
  logProvider('refreshFromRealtime:start', {
    filtros: dashboardStore.filtros,
    externalRefreshTick: dashboardStore.externalRefreshTick,
  })

  await Promise.all([
    fetchAll(dashboardStore.filtros, { preserveExistingData: true }),
    cargarEventosDelSistema(),
  ])
  logProvider('refreshFromRealtime:done')
}

watch(
  dashboardQueryKey,
  () => {
    if (!dashboardStore.filtros?.system) return
    logProvider('watch:dashboardQueryKey', {
      key: dashboardQueryKey.value,
      filtros: dashboardStore.filtros,
    })
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
    logProvider('watch:filtros.system', {
      system,
      realtimeOwner: props.realtimeOwner,
      filtros: dashboardStore.filtros,
    })
    if (!system) {
      eventosRaw.value = []
      logsGlobales.value = []
      unsubscribeSystem()
      return
    }

    cargarEventosDelSistema()

    if (!props.realtimeOwner) return

    subscribeSystem(system, () => dashboardStore.filtros, async () => {
      logProvider('subscribeSystem:event', {
        system,
        filtros: dashboardStore.filtros,
      })
      await cargarEventosDelSistema()
      dashboardStore.announceRealtimeRefresh()
    })
  },
  { immediate: true },
)

watch(
  () => dashboardStore.externalRefreshTick,
  (tick, previous) => {
    logProvider('watch:externalRefreshTick', {
      tick,
      previous,
      realtimeOwner: props.realtimeOwner,
      system: dashboardStore.filtros?.system,
    })
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
