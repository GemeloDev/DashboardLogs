<template>
  <div v-if="system" class="q-mb-lg">
    <q-card flat bordered class="today-card text-white q-pa-lg">

      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="today-pulse q-mr-sm" :class="hasActivity ? 'today-pulse--active' : ''" />
        <div class="col">
          <div class="today-title">Actividad de hoy</div>
          <div class="today-subtitle text-grey-5">
            Últimas 24 horas · {{ system }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            flat dense round
            icon="refresh"
            color="grey-5"
            size="sm"
            :loading="loading"
            @click="fetchToday"
          >
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-btn
            flat dense
            label="Ver todos"
            color="cyan"
            size="sm"
            class="q-ml-sm"
            @click="openConsoleToday"
          />
        </div>
      </div>

      <!-- KPIs -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6 col-md-3">
          <div class="today-kpi">
            <div class="today-kpi__label">Total eventos</div>
            <div class="today-kpi__value">{{ total }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="today-kpi">
            <div class="today-kpi__label">Error rate</div>
            <div class="today-kpi__value" :class="errorRateColor">{{ errorRatePct }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="today-kpi today-kpi--red">
            <div class="today-kpi__label">Failures</div>
            <div class="today-kpi__value text-red-4">{{ failures }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="today-kpi today-kpi--green">
            <div class="today-kpi__label">Successes</div>
            <div class="today-kpi__value text-green-4">{{ successes }}</div>
          </div>
        </div>
      </div>

      <!-- Feed de logs recientes -->
      <div v-if="recentLogs.length" class="today-feed">
        <div class="today-feed__title q-mb-sm text-grey-5 text-caption">
          Logs más recientes
        </div>
        <div
          v-for="log in recentLogs"
          :key="log.id"
          class="today-feed__row"
          @click="openLogInConsole(log)"
        >
          <!-- Indicador de status -->
          <div class="today-feed__dot" :class="dotClass(log.status)" />

          <!-- Contenido -->
          <div class="col today-feed__content">
            <div class="row items-center no-wrap">
              <span class="today-feed__type q-mr-xs">{{ log.eventType }}</span>
              <q-chip
                dense
                size="xs"
                :color="statusColor(log.status)"
                text-color="white"
                class="q-ml-xs"
              >
                {{ log.status }}
              </q-chip>
              <q-chip
                v-if="log.outcome && log.outcome !== 'N/A'"
                dense size="xs"
                :color="outcomeColor(log.outcome)"
                text-color="white"
                class="q-ml-xs"
              >
                {{ log.outcome }}
              </q-chip>
            </div>
            <div class="today-feed__msg text-grey-5">
              {{ truncate(log.message, 90) }}
            </div>
          </div>

          <!-- Tiempo -->
          <div class="today-feed__time text-grey-6">
            {{ timeAgo(log.eventTime) }}
          </div>
        </div>
      </div>

      <!-- Sin actividad -->
      <div v-else-if="!loading" class="today-empty">
        <q-icon name="check_circle" color="green" size="24px" class="q-mr-sm" />
        <span class="text-grey-5">Sin actividad en las últimas 24 horas</span>
      </div>

      <!-- Loading -->
      <div v-if="loading && !recentLogs.length" class="today-empty">
        <q-spinner color="cyan" size="20px" class="q-mr-sm" />
        <span class="text-grey-5">Cargando actividad...</span>
      </div>

    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, onBeforeUnmount } from 'vue'
import { axiosInstance } from 'src/services/axiosConfig'

// ── Injects ───────────────────────────────────────────────────────────────────
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const openConsole     = inject('openConsole', null)

// ── Estado ────────────────────────────────────────────────────────────────────
const loading    = ref(false)
const recentLogs = ref([])
const total      = ref(0)
const failures   = ref(0)
const successes  = ref(0)

const system = computed(() =>
  String(filtrosGlobales.value?.system || '').trim()
)

// ── Auto-refresh cada 2 minutos ───────────────────────────────────────────────
let refreshTimer = null

onMounted(() => {
  refreshTimer = setInterval(fetchToday, 2 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchToday() {
  if (!system.value) return

  loading.value = true
  try {
    const now  = new Date()
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const to   = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const response = await axiosInstance.get('/api/logs/events', {
      params: {
        system:  system.value,
        fromDate: from,
        toDate:   to,
        page:    0,
        size:    8,
        sortBy:  'eventTime',
        sortDir: 'DESC',
      },
    })

    const data = response?.data?.data || {}
    recentLogs.value = data.items || []

    // Calcular KPIs desde los items
    const allItems = recentLogs.value
    total.value    = data.totalElements || allItems.length
    failures.value = allItems.filter(l =>
      l.outcome === 'FAILURE' || l.status === 'ERROR').length
    successes.value = allItems.filter(l =>
      l.outcome === 'SUCCESS' || l.status === 'OK').length

    // Para el error rate real pedimos el total con más items
    if (data.totalElements > 0) {
      await fetchKpis(from, to)
    }

  } catch (e) {
    console.error('[ActivityWidget] Error:', e.message)
  } finally {
    loading.value = false
  }
}

async function fetchKpis(from, to) {
  try {
    const response = await axiosInstance.get('/api/logs/events', {
      params: {
        system:   system.value,
        fromDate: from,
        toDate:   to,
        page:     0,
        size:     1000,
        sortBy:   'eventTime',
        sortDir:  'DESC',
      },
    })
    const data  = response?.data?.data || {}
    const items = data.items || []

    total.value    = data.totalElements || items.length
    failures.value = items.filter(l =>
      l.outcome === 'FAILURE' || l.status === 'ERROR').length
    successes.value = items.filter(l =>
      l.outcome === 'SUCCESS' || l.status === 'OK').length
  } catch (e) {
    // silencioso — los KPIs del primer fetch son suficientes
    console.error('[ActivityWidget] Error:', e.message)
  }
}

// ── Watch: refetch cuando cambia el sistema ───────────────────────────────────
watch(system, (val, old) => {
  if (val && val !== old) fetchToday()
}, { immediate: true })

// ── Computed ──────────────────────────────────────────────────────────────────
const hasActivity = computed(() => total.value > 0)

const errorRate = computed(() =>
  total.value > 0 ? failures.value / total.value : 0
)

const errorRatePct = computed(() =>
  `${(errorRate.value * 100).toFixed(1)}%`
)

const errorRateColor = computed(() => {
  const r = errorRate.value
  if (r >= 0.15) return 'text-red-4'
  if (r >= 0.05) return 'text-orange-4'
  return 'text-green-4'
})

// ── Helpers de UI ─────────────────────────────────────────────────────────────
function dotClass(status) {
  if (status === 'ERROR')   return 'today-feed__dot--red'
  if (status === 'WARN')    return 'today-feed__dot--orange'
  if (status === 'OK')      return 'today-feed__dot--green'
  return 'today-feed__dot--grey'
}

function statusColor(status) {
  if (status === 'ERROR')   return 'red-8'
  if (status === 'WARN')    return 'orange-8'
  if (status === 'OK')      return 'green-8'
  return 'grey-7'
}

function outcomeColor(outcome) {
  if (outcome === 'FAILURE') return 'red-9'
  if (outcome === 'SUCCESS') return 'green-9'
  return 'grey-7'
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

function timeAgo(isoDate) {
  if (!isoDate) return ''
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function openConsoleToday() {
  const now  = new Date()
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const to   = now.toISOString().slice(0, 10)
  openConsole?.({ fieldKey: 'rangoFechas', value: { from, to } })
}

function openLogInConsole(log) {
  openConsole?.({ fieldKey: 'eventType', value: log.eventType })
}

defineExpose({ fetchToday })

</script>

<style lang="scss" scoped>
.today-card {
  background: linear-gradient(160deg, rgba(34, 211, 238, 0.06), rgba(255, 255, 255, 0.02));
  border-radius: 22px;
  border: 1px solid rgba(34, 211, 238, 0.18) !important;
  box-shadow: 0 8px 26px rgba(34, 211, 238, 0.08);
}

.today-title {
  font-size: 18px;
  font-weight: 700;
}

.today-subtitle {
  font-size: 12px;
  margin-top: 2px;
}

// Indicador pulsante
.today-pulse {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;

  &--active {
    background: #22c55e;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
    animation: pulse-dot 1.8s infinite;
  }
}

@keyframes pulse-dot {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

// KPIs
.today-kpi {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 12px 14px;
  text-align: center;

  &__label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__value {
    font-size: 22px;
    font-weight: 800;
    margin-top: 4px;
    color: #fff;
  }
}

// Feed
.today-feed {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;

  &__title {
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 120ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    margin-top: 5px;
    flex-shrink: 0;

    &--red    { background: #ef4444; }
    &--orange { background: #f97316; }
    &--green  { background: #22c55e; }
    &--grey   { background: #6b7280; }
  }

  &__type {
    font-size: 12px;
    font-weight: 700;
    color: #22d3ee;
    white-space: nowrap;
  }

  &__msg {
    font-size: 11px;
    margin-top: 2px;
    line-height: 1.4;
  }

  &__time {
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 3px;
  }
}

// Empty state
.today-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  font-size: 13px;
}
</style>
