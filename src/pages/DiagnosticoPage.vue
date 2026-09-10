<template>
  <q-page class="diagnostic-page text-white">
    <!-- Header Principal -->
    <div class="diagnostic-header bg-gradient-to-r from-grey-9 to-grey-8">
      <div class="container">
        <q-card flat bordered class="dashboard-hero__title-card text-white">
          <div class="diagnostic-header__top row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="diagnostic-eyebrow">
                <q-icon name="medical_services" size="18px" color="cyan-4" />
                <span>{{ t('diagnostic.technicalDiagnostic') }}</span>
              </div>
              <h1 class="hero-title q-mt-md q-mb-sm">
                {{ t('diagnostic.titlePageDiagnosticLineOne') }}
                <span class="orange-santoro">{{ t('layout.diagnostic') }}</span>
                <br />
                {{ t('diagnostic.titlePageDiagnosticLineTwo') }}
              </h1>

              <p class="diagnostic-subtitle q-mb-none">
                {{ t('diagnostic.subtitlePageDiagnostic') }}
              </p>
            </div>

            <div class="col-12 col-md-auto diagnostic-header-actions">
              <div class="row q-col-gutter-sm q-row-gutter-sm">
                <div class="col-12 col-sm-6 col-md-auto">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    :label="t('common.update')"
                    @click="actualizarDatos"
                    :loading="cargando || loadingAnalytics"
                    unelevated
                    class="diagnostic-action-btn full-width"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="diagnostic-meta q-mt-lg">
            <div class="row q-gutter-sm diagnostic-header-chips">
              <q-chip
                dense
                color="green-6"
                text-color="white"
                icon="wifi"
                size="sm"
                class="diagnostic-status-chip"
              >
                {{ t('common.connected') }}
              </q-chip>

              <q-chip
                v-if="diagnosticoActivo"
                dense
                color="blue-5"
                text-color="white"
                size="sm"
                icon="auto_fix_high"
                class="diagnostic-status-chip"
              >
                {{ diagnosticoActivo }}
              </q-chip>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="diagnostic-content q-pa-lg">
      <div class="container">
        <!-- Selector de rango de fechas -->
        <div class="row q-mb-md">
          <div class="col-12">
            <DateRangeFilter v-model="dateRange" @update:date-range="onDateRangeChange" />
          </div>
        </div>

        <!-- KPIs Globales de la Empresa -->
        <div class="row q-col-gutter-md q-mb-lg">
          <!-- KPI 1: Salud Global -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="bg-dark text-white border-subtle kpi-card">
              <q-card-section class="kpi-card__section">
                <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                  Salud Global de la Empresa
                </div>
                <div class="kpi-badge-wrap q-mt-sm">
                  <q-badge
                    :color="executiveSummary.globalHealth === 'STABLE' ? 'positive' : 'negative'"
                    class="kpi-health-badge text-weight-bold"
                  >
                    <span
                      class="kpi-pulse"
                      :class="healthPulseClass(executiveSummary.globalHealth)"
                    />
                    {{ executiveSummary.globalHealth || 'INACTIVE' }}
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- KPI 2: Total de Eventos Globales -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="bg-dark text-white border-subtle kpi-card">
              <q-card-section class="kpi-card__section">
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                    Total de Eventos Globales
                  </div>
                  <q-icon name="analytics" size="22px" class="text-orange" />
                </div>
                <div class="text-h4 text-bold q-mt-sm">
                  {{ formatNumber(executiveSummary.totalGlobalEvents || 0) }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- KPI 3: Tasa de Error Global -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="bg-dark text-white border-subtle kpi-card">
              <q-card-section class="kpi-card__section">
                <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                  Tasa de Error Global
                </div>
                <div
                  class="text-h4 text-bold q-mt-sm"
                  :class="errorRateColorClass(executiveSummary.globalErrorRate)"
                >
                  {{ executiveSummary.globalErrorRate || 0 }}%
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- KPI 4: Casos Activos Totales -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="bg-dark text-white border-subtle kpi-card">
              <q-card-section class="kpi-card__section">
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                    Casos Activos Totales
                  </div>
                  <q-icon name="devices_other" size="22px" class="text-cyan" />
                </div>
                <div class="text-h4 text-bold q-mt-sm">
                  {{ formatNumber(globalActiveCases) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Cartel Gerencial Global -->
        <div class="row q-mb-xl">
          <div class="col-12">
            <q-card
              flat
              bordered
              class="live-summary-card"
              :class="healthSurfaceClass(globalSummary.globalStatus)"
            >
              <q-card-section class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <q-icon
                    :name="globalLiveSummary.icon"
                    :color="globalLiveSummary.color"
                    size="48px"
                    class="live-summary-card__icon"
                  />
                </div>
                <div class="col">
                  <div class="text-h5 text-weight-bold text-white">
                    {{ globalLiveSummary.title }}
                  </div>
                  <div class="text-subtitle1 text-grey-4 q-mt-xs">
                    {{ globalLiveSummary.text }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- SECCIÓN A: Grid de Sistemas y Top 5 Fricción Organizacional -->
        <section class="global-health-section q-mb-xl">
          <div class="row items-center q-mb-md">
            <div class="col-12 col-md-auto">
              <h2 class="section-title">Salud Global de la Empresa</h2>
              <p class="section-subtitle text-grey-5">
                Panorama operativo de todos los sistemas registrados
              </p>
            </div>
          </div>

          <q-inner-loading :showing="loadingAnalytics && !executiveData" color="cyan" />

          <div class="row q-col-gutter-lg">
            <!-- Grid de Sistemas -->
            <div class="col-12 col-md-7">
              <q-card flat class="bg-dark text-white border-subtle section-card">
                <q-card-section class="section-card__header">
                  <div class="text-h6">Sistemas Monitoreados</div>
                  <div class="text-caption text-grey-5">{{ analyticsDateRangeLabel }}</div>
                </q-card-section>

                <q-card-section>
                  <q-inner-loading :showing="loadingAnalytics" color="cyan" />

                  <div v-if="monitoredSystems.length" class="row q-col-gutter-md">
                    <div v-for="sys in monitoredSystems" :key="sys.code" class="col-12 col-sm-6">
                      <q-card flat bordered class="system-mini-card">
                        <q-card-section>
                          <div class="row items-start justify-between q-mb-sm">
                            <div>
                              <div class="text-subtitle1 text-weight-bold">
                                {{ sys.name || sys.code }}
                              </div>
                              <div class="text-caption text-grey-5">
                                {{ sys.label || sys.code }}
                              </div>
                            </div>
                            <q-badge
                              :color="healthColor(sys.status)"
                              :label="healthLabel(sys.status)"
                              class="text-weight-bold"
                            />
                          </div>

                          <div class="row items-center q-gutter-sm q-mb-sm">
                            <div class="text-caption text-grey-5">Tasa de error:</div>
                            <div class="text-subtitle2 text-weight-bold">
                              {{ sys.errorRate || 0 }}%
                            </div>
                          </div>

                          <q-linear-progress
                            :value="Math.min(Number(sys.errorRate || 0) / 100, 1)"
                            size="10px"
                            rounded
                            :color="healthColor(sys.status)"
                            track-color="grey-8"
                            class="q-mt-sm"
                          />

                          <div class="row justify-between text-caption text-grey-5 q-mt-sm">
                            <div>
                              {{ formatNumber(sys.errorEvents ?? 0) }} errores de
                              {{ formatNumber(sys.totalEvents ?? 0) }} eventos
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>

                  <div v-else-if="!loadingAnalytics" class="text-grey-5 text-center q-py-lg">
                    Sin datos de sistemas
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Top 5 Fricción Organizacional -->
            <div class="col-12 col-md-5">
              <q-card flat class="bg-dark text-white border-subtle section-card">
                <q-card-section class="section-card__header">
                  <div class="text-h6">Top 5 Fricción Organizacional</div>
                  <div class="text-caption text-grey-5">
                    Eventos fallidos más graves en toda la empresa
                  </div>
                </q-card-section>

                <q-card-section class="relative-position">
                  <q-inner-loading :showing="loadingAnalytics" color="cyan" class="bg-dark" />

                  <q-list v-if="topFrictionItems.length" class="friction-list" separator>
                    <q-item
                      v-for="event in topFrictionItems"
                      :key="`${event.eventCode}-${event.rank}`"
                      clickable
                      v-ripple
                      class="friction-item friction-item--clickable q-px-sm"
                      @click="openAiDiagnosis(event)"
                    >
                      <q-item-section avatar>
                        <q-badge :color="rankColor(event.rank)" class="rank-badge text-weight-bold">
                          #{{ event.rank }}
                        </q-badge>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-bold text-white">
                          {{
                            event.description &&
                            event.description !== 'Evento con fallos reportados.'
                              ? event.description
                              : getEventTitle(event.eventCode)
                          }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-6">
                          <q-chip
                            size="xs"
                            color="grey-9"
                            text-color="grey-4"
                            class="q-ma-none q-ml-none"
                          >
                            {{ getEventTitle(event.eventCode) }}
                          </q-chip>
                        </q-item-label>
                        <q-item-label caption class="text-grey-5">
                          {{ event.topLocation }} · {{ event.system }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <div class="row items-center q-gutter-md">
                          <div class="text-center">
                            <div class="text-caption text-grey-5">Ocurrencias</div>
                            <div class="text-subtitle2 text-weight-bold text-orange">
                              {{ event.occurrenceCount }}
                            </div>
                          </div>
                          <div class="text-center">
                            <div class="text-caption text-grey-5">
                              <q-icon name="person" size="12px" class="q-mr-xs" />
                              Afectados
                            </div>
                            <div class="text-subtitle2 text-weight-bold text-white">
                              {{ event.affectedCases }}
                            </div>
                          </div>
                          <q-btn
                            flat
                            round
                            dense
                            icon="auto_awesome"
                            color="primary"
                            aria-label="Abrir diagnóstico de IA"
                            @click.stop="openAiDiagnosis(event)"
                          >
                            <q-tooltip>Diagnóstico con IA</q-tooltip>
                          </q-btn>
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div v-else-if="!loadingAnalytics" class="text-grey-5 text-center q-py-lg">
                    Sin eventos de fricción organizacional
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Loading Overlay -->
    <q-inner-loading
      :showing="cargando || loadingAnalytics"
      color="blue-5"
      size="50px"
      :label="t('diagnostic.proccessDiagnostic')"
      class="diagnostic-page-loading"
    />

    <AiDiagnosisModal v-model="showAiDiagnosisModal" :event="selectedEventForDiagnosis" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { AnalyticsService } from '../services/analyticsService.js'
import { CatalogService, catalogSystems as cachedCatalogSystems } from 'src/services/catalogService'
import DateRangeFilter from 'src/components/escritorio/DateRangeFilter.vue'
import AiDiagnosisModal from 'src/components/escritorio/AiDiagnosisModal.vue'
import { getEventTitle as translateEventCode } from 'src/helpers/eventDictionary'
import { useI18n } from 'vue-i18n'
import { isSocketConnected, onSocketConnect, subscribeToTopic } from 'src/services/socketService'
import { DIAGNOSTICS_REQUEST_TIMEOUT, getIsoDateRange } from 'src/composables/useDiagnostics'

const $q = useQuasar()

// Estado
const cargando = ref(false)
const diagnosticoActivo = ref('')
const { t } = useI18n()
const getEventTitle = translateEventCode

// === SECCIÓN A: SALUD GLOBAL DE LA EMPRESA ===
const executiveData = ref(null)
const catalogData = ref({ sistemas: [], healthMap: {} })
const topFrictionalEvents = ref([])
const loadingAnalytics = ref(false)
const selectedEventForDiagnosis = ref(null)
const showAiDiagnosisModal = ref(false)

const today = formatDate(new Date())
const dateRange = ref({
  from: today,
  to: today,
  option: 'today',
})

const analyticsDateRangeLabel = computed(() => {
  if (dateRange.value?.range === 'ALL' || dateRange.value?.option === 'all') {
    return 'Histórico Completo'
  }
  return `${dateRange.value.from} → ${dateRange.value.to}`
})

function normalizeStatus(status, errorRate = 0, active = true) {
  if (active === false) return 'INACTIVE'
  const normalized = String(status || '')
    .trim()
    .toUpperCase()
  if (['INACTIVE', 'INACTIVO', 'OFFLINE', 'DISABLED'].includes(normalized)) return 'INACTIVE'
  if (['CRITICAL', 'CRIT', 'CRÍTICO'].includes(normalized)) return 'CRITICAL'
  if (['WARNING', 'WARN', 'ALERT', 'ALERTA'].includes(normalized)) return 'WARNING'
  if (['STABLE', 'HEALTHY', 'OK'].includes(normalized)) return 'STABLE'
  if (Number(errorRate) > 10) return 'CRITICAL'
  if (Number(errorRate) > 0) return 'WARNING'
  return 'STABLE'
}

function catalogRate(value) {
  const rate = Number(value || 0)
  return Number((Math.abs(rate) <= 1 ? rate * 100 : rate).toFixed(2))
}

const globalSummary = computed(() => {
  const executive = executiveData.value || {}
  const executiveSystems = Array.isArray(executive.systems) ? executive.systems : []
  const executiveByName = new Map(
    executiveSystems.map((system) => [
      String(system?.systemCode || system?.system || system?.code || '')
        .trim()
        .toUpperCase(),
      system,
    ]),
  )
  const mergedSystems = []

  const catalogSystems = Array.isArray(catalogData.value?.sistemas)
    ? catalogData.value.sistemas
    : []

  catalogSystems.forEach((catalogSystem) => {
    const name = String(catalogSystem?.name || catalogSystem?.label || catalogSystem?.value || '').trim()
    const key = String(catalogSystem?.code || catalogSystem?.value || name)
      .trim()
      .toUpperCase()
    const rangeSystem = executiveByName.get(key)
    const catalogHealth = catalogData.value?.healthMap?.[key] || {}
    const errorRate = rangeSystem
      ? Number(rangeSystem.errorRate || 0)
      : catalogRate(catalogHealth.errorRate ?? catalogSystem.errorRate)
    const totalEvents = Number(
      rangeSystem?.totalEvents ?? rangeSystem?.totalLogs ?? catalogHealth.totalEvents ?? 0,
    )
    const errorCount = Number(
      rangeSystem?.errorCount ??
        rangeSystem?.errorEvents ??
        catalogHealth.errorCount ??
        catalogHealth.errorEvents ??
        Math.round((totalEvents * errorRate) / 100),
    )

    mergedSystems.push({
      ...catalogSystem,
      ...catalogHealth,
      ...(rangeSystem || {}),
      system: rangeSystem?.system || key,
      systemLabel: rangeSystem?.systemLabel || catalogSystem?.label || name,
      status: normalizeStatus(
        catalogHealth.status ?? rangeSystem?.status ?? catalogSystem.status,
        errorRate,
        catalogSystem?.active,
      ),
      errorRate,
      errorCount,
      totalEvents,
    })
    executiveByName.delete(key)
  })

  executiveByName.forEach((system) => {
    const errorRate = Number(system?.errorRate || 0)
    mergedSystems.push({
      ...system,
      status: normalizeStatus(system?.status, errorRate),
      errorRate,
      errorCount: Number(system?.errorCount ?? system?.errorEvents ?? 0),
      totalEvents: Number(system?.totalEvents || 0),
    })
  })

  const topMetrics = executive.topMetrics || {}
  const summedEvents = mergedSystems.reduce((sum, system) => sum + system.totalEvents, 0)
  const summedErrors = mergedSystems.reduce((sum, system) => sum + system.errorCount, 0)
  const totalGlobalEvents = Number(
    executive.totalGlobalEvents ?? topMetrics.totalGlobalEvents ?? topMetrics.totalEvents ?? summedEvents,
  )
  const totalGlobalErrors = Number(
    executive.errorEvents ??
      executive.errorCount ??
      topMetrics.errorEvents ??
      topMetrics.errorCount ??
      summedErrors,
  )
  const calculatedErrorRate = totalGlobalEvents > 0 ? (totalGlobalErrors / totalGlobalEvents) * 100 : 0
  const globalErrorRate = Number(
    Number(executive.globalErrorRate ?? topMetrics.globalErrorRate ?? calculatedErrorRate).toFixed(2),
  )
  const executiveHealth =
    executive.globalHealth ??
    executive.globalStatus ??
    topMetrics.globalHealth ??
    topMetrics.globalStatus
  const globalStatus = executiveHealth
    ? normalizeStatus(executiveHealth, globalErrorRate)
    : mergedSystems.some((system) => system.status === 'CRITICAL')
      ? 'CRITICAL'
      : mergedSystems.some((system) => system.status === 'WARNING')
        ? 'WARNING'
        : normalizeStatus(null, globalErrorRate)

  return {
    totalGlobalEvents,
    globalErrorRate,
    globalStatus,
    globalActiveCases: Number(topMetrics.activeCases ?? executive.activeCases ?? 0),
    systems: mergedSystems,
  }
})

const catalogSystems = computed(() => {
  const loadedSystems = catalogData.value?.sistemas || []
  return loadedSystems.length ? loadedSystems : cachedCatalogSystems.value
})

const executiveSummary = computed(() => {
  const executive = executiveData.value || {}
  const topMetrics = executive.topMetrics || {}
  const rawHealth =
    executive.globalHealth ??
    executive.globalStatus ??
    topMetrics.globalHealth ??
    topMetrics.globalStatus

  return {
    ...executive,
    totalGlobalEvents: Number(
      executive.totalGlobalEvents ?? topMetrics.totalGlobalEvents ?? topMetrics.totalEvents ?? 0,
    ),
    globalErrorRate: Number(executive.globalErrorRate ?? topMetrics.globalErrorRate ?? 0),
    globalHealth: rawHealth ? normalizeStatus(rawHealth) : 'INACTIVE',
  }
})

const monitoredSystems = computed(() => {
  const currentHealthMap = catalogData.value?.healthMap || {}
  const executiveSystems = Array.isArray(executiveData.value?.systems)
    ? executiveData.value.systems
    : []
  const executiveByCode = new Map(
    executiveSystems.map((system) => [
      String(system?.systemCode || system?.system || system?.code || '')
        .trim()
        .toUpperCase(),
      system,
    ]),
  )

  return catalogSystems.value.map((system) => {
    const code = String(system?.code || system?.value || system?.name || '')
      .trim()
      .toUpperCase()
    const metrics = {
      ...(executiveByCode.get(code) || {}),
      ...(currentHealthMap[code] || {}),
    }

    return {
      ...system,
      code,
      status: metrics.status || metrics.healthStatus || 'INACTIVE',
      errorRate: Number(metrics.errorRate ?? 0),
      errorEvents: Number(metrics.errorEvents ?? metrics.errorCount ?? 0),
      totalEvents: Number(metrics.totalEvents ?? metrics.totalLogs ?? 0),
    }
  })
})

const topFrictionItems = computed(() => (topFrictionalEvents.value || []).slice(0, 5))

const globalActiveCases = computed(() => globalSummary.value.globalActiveCases)

function statusFromErrorRate(errorRate) {
  const rate = Number(errorRate)
  if (rate >= 15) return 'CRITICAL'
  if (rate >= 5) return 'WARNING'
  return 'STABLE'
}

const globalLiveSummary = computed(() => {
  const status = globalSummary.value.globalStatus
  const attentionCount = globalSummary.value.systems.filter((system) =>
    ['CRITICAL', 'WARNING'].includes(system.status),
  ).length

  if (status === 'CRITICAL') {
    return {
      icon: 'error',
      color: 'negative',
      title: 'Estatus Organizacional: Atención Crítica Requerida',
      text: `Se detectaron ${attentionCount} sistemas con atención requerida.`,
    }
  }

  if (status === 'WARNING') {
    return {
      icon: 'warning',
      color: 'orange-8',
      title: 'Estatus Organizacional: Atención Requerida',
      text: `Se detectaron ${attentionCount} sistemas con atención requerida.`,
    }
  }

  return {
    icon: 'check_circle',
    color: 'positive',
    title: '✓ Operación Estable',
    text: 'Todos los sistemas operan dentro de los parámetros normales.',
  }
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatNumber(value) {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat().format(value)
}

function healthColor(status) {
  switch (status) {
    case 'CRITICAL':
      return 'negative'
    case 'WARNING':
      return 'warning'
    case 'STABLE':
      return 'positive'
    case 'INACTIVE':
      return 'grey-7'
    default:
      return 'grey'
  }
}

function healthLabel(status) {
  const normalized = normalizeStatus(status)
  return ['STABLE', 'WARNING', 'CRITICAL', 'INACTIVE'].includes(normalized)
    ? normalized
    : 'INACTIVE'
}

function healthSurfaceClass(status) {
  if (status === 'CRITICAL') return 'health-surface--critical'
  if (status === 'WARNING') return 'health-surface--warning'
  return 'health-surface--stable'
}

function healthPulseClass(status) {
  switch (status) {
    case 'CRITICAL':
      return 'kpi-pulse--critical'
    case 'WARNING':
      return 'kpi-pulse--warning'
    case 'STABLE':
      return 'kpi-pulse--stable'
    default:
      return ''
  }
}

function errorRateColorClass(rate) {
  if (rate === undefined || rate === null) return 'text-grey'
  switch (statusFromErrorRate(rate)) {
    case 'CRITICAL':
      return 'text-negative'
    case 'WARNING':
      return 'text-warning'
    default:
      return 'text-positive'
  }
}

function rankColor(rank) {
  switch (rank) {
    case 1:
      return 'negative'
    case 2:
      return 'orange'
    case 3:
      return 'warning'
    default:
      return 'grey'
  }
}

function openAiDiagnosis(eventItem) {
  selectedEventForDiagnosis.value = eventItem
  showAiDiagnosisModal.value = true
}

let analyticsLoadSeq = 0

async function loadAllAnalytics(selectedRange = dateRange.value) {
  const seq = ++analyticsLoadSeq
  loadingAnalytics.value = true
  try {
    const tabKey =
      selectedRange?.range === 'ALL' ? 'all' : selectedRange?.option || 'today'
    const { from, to } = getIsoDateRange(tabKey, selectedRange)
    const requestConfig = { timeout: DIAGNOSTICS_REQUEST_TIMEOUT }
    const [executiveResult, frictionResult, catalogResult] = await Promise.allSettled([
      AnalyticsService.getExecutiveSummary(from, to, undefined, requestConfig),
      AnalyticsService.getTopFrictionalEvents(from, to, undefined, requestConfig),
      CatalogService.fetchCatalogs({
        from,
        to,
        range: tabKey === 'all' ? 'ALL' : undefined,
        timeout: DIAGNOSTICS_REQUEST_TIMEOUT,
      }),
    ])

    if (seq !== analyticsLoadSeq) return

    if (executiveResult.status === 'fulfilled') {
      executiveData.value = executiveResult.value?.data || executiveResult.value || null
    } else {
      console.warn('Error cargando resumen ejecutivo:', executiveResult.reason)
      executiveData.value = null
    }

    if (frictionResult.status === 'fulfilled') {
      const friction = frictionResult.value?.data || frictionResult.value || {}
      topFrictionalEvents.value = friction.events || []
    } else {
      console.warn('Error cargando fricción organizacional:', frictionResult.reason)
      topFrictionalEvents.value = []
    }

    if (catalogResult.status === 'fulfilled') {
      const nextCatalog = catalogResult.value || {}
      catalogData.value = {
        sistemas: nextCatalog.sistemas?.length
          ? nextCatalog.sistemas
          : catalogData.value?.sistemas || cachedCatalogSystems.value,
        healthMap: Object.keys(nextCatalog.healthMap || {}).length
          ? nextCatalog.healthMap
          : catalogData.value?.healthMap || {},
      }
    } else {
      console.warn('Error cargando catálogo de salud:', catalogResult.reason)
    }
  } catch (err) {
    console.error('Error cargando analíticas globales:', err)
    executiveData.value = null
    topFrictionalEvents.value = []
  } finally {
    if (seq === analyticsLoadSeq) loadingAnalytics.value = false
  }
}

async function onDateRangeChange(range) {
  dateRange.value = range
  await loadAllAnalytics(range)
}

const actualizarDatos = async () => {
  cargando.value = true
  diagnosticoActivo.value = t('diagnostic.updatingData')
  try {
    await loadAllAnalytics(dateRange.value)
    $q.notify({
      type: 'positive',
      message: t('diagnostic.updateSuccess'),
      position: 'top-right',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('diagnostic.updateError'),
      position: 'top-right',
    })
  } finally {
    cargando.value = false
    diagnosticoActivo.value = ''
  }
}

let systemHealthSubscription = null
let socketConnectUnsubscribe = null

function safelyUnsubscribe(subscription, label) {
  if (!subscription) return
  try {
    if (typeof subscription === 'function') {
      subscription()
    } else if (typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe()
    }
  } catch (error) {
    console.warn(`[DiagnosticoPage] Error al desuscribir ${label}:`, error)
  }
}

function applyRealtimeSystemHealth(payload) {
  const raw = payload?.data ?? payload
  const updates = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.systemsHealth)
      ? raw.systemsHealth
      : raw
        ? [raw]
        : []
  if (!updates.length) return

  const nextHealthMap = { ...(catalogData.value?.healthMap || {}) }
  updates.forEach((health) => {
    const systemName =
      health?.systemCode || health?.system || health?.code || health?.systemName || health?.name
    if (!systemName) return
    const key = String(systemName).trim().toUpperCase()
    const normalized = CatalogService.updateSystemHealth(systemName, health, { ratio: true })
    if (normalized) nextHealthMap[key] = normalized
  })

  catalogData.value = {
    ...(catalogData.value || {}),
    healthMap: nextHealthMap,
  }
}

function subscribeSystemHealth() {
  safelyUnsubscribe(systemHealthSubscription, 'salud de sistemas anterior')
  systemHealthSubscription = subscribeToTopic('/topic/system-health', applyRealtimeSystemHealth)
}

onMounted(() => {
  loadAllAnalytics(dateRange.value)

  socketConnectUnsubscribe = onSocketConnect(subscribeSystemHealth)
  if (isSocketConnected()) subscribeSystemHealth()
})

onBeforeUnmount(() => {
  safelyUnsubscribe(systemHealthSubscription, 'salud de sistemas')
  safelyUnsubscribe(socketConnectUnsubscribe, 'listener de reconexión')
  systemHealthSubscription = null
  socketConnectUnsubscribe = null
})
</script>

<style lang="scss" scoped>
.diagnostic-page {
  min-height: 100vh;
  position: relative;
}

.diagnostic-page-loading {
  position: fixed;
  z-index: 4000;
  background: rgba(5, 5, 5, 0.62);
  backdrop-filter: blur(2px);
}

.orange-santoro {
  color: #e97132;
}

.diagnostic-header {
  padding: 24px 0 12px;
}

.dashboard-hero__title-card {
  background: transparent;
  border-radius: 26px;
  padding: 28px 30px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.hero-title {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.diagnostic-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.diagnostic-header-actions {
  position: static !important;
}

.diagnostic-subtitle {
  max-width: 760px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.diagnostic-header-chips {
  flex-wrap: wrap;
}

.diagnostic-meta {
  display: flex;
  flex-wrap: wrap;
}

.diagnostic-status-chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Botones: que el texto NO se salga y no se rompa */
.diagnostic-action-btn {
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  height: 44px;
  min-width: 0;
  max-width: 100%;
}

.diagnostic-action-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  max-width: 100%;
  min-width: 0;
}

.diagnostic-action-btn :deep(.q-btn__content .block) {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Card + input (reusando tu look moderno) */
// Cards modernos
.modern-card {
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  transition: var(--transition-smooth);

  .card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      flex: 1;

      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem 0;
      }

      .card-subtitle {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }

  .card-body {
    padding: 2rem;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.5rem 0;
  }

  .card-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.card-body {
  padding: 2rem;
}

.modern-input-group {
  display: flex;
  gap: 1rem;

  .modern-input {
    flex: 1;

    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      min-height: 56px;
      padding-left: 1%;
      transition: all 0.25s ease;

      &:hover {
        border-color: rgba(52, 121, 211, 0.5);
        background: rgba(255, 255, 255, 0.08);
      }
    }

    :deep(.q-field__native),
    :deep(.q-field__input) {
      color: #fff;
      font-size: 1rem;
      font-weight: 500;
    }
  }

  .search-action-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 16px;
    padding: 0 2rem;
    box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(79, 172, 254, 0.4);
    }
  }
}

/* MOBILE: centrar todo y compactar tipografía */
@media (max-width: 600px) {
  .dashboard-hero__title-card {
    padding: 20px 18px;
    border-radius: 22px;
  }

  .diagnostic-header__top {
    row-gap: 16px;
  }

  .diagnostic-subtitle {
    font-size: 0.95rem;
  }

  .diagnostic-action-btn {
    height: 36px;
    font-size: 0.85rem;
    letter-spacing: 0.2px; /* ayuda a que no “reviente” */
  }

  .modern-card .card-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .modern-input-group {
    display: grid;
  }
}

/* SECCIÓN A: Salud Global de la Empresa */
.global-health-section {
  padding-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  font-size: 0.95rem;
  margin: 0;
}

.section-card {
  border-radius: 20px;
  height: 100%;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.section-card__header {
  padding-bottom: 8px;
}

.system-mini-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.12);
  }
}

.friction-list {
  background: transparent;
}

.friction-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin-bottom: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.friction-item--clickable {
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(34, 211, 238, 0.75);
    outline-offset: 2px;
  }
}

.rank-badge {
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 8px;
}

/* KPIs globales */
.kpi-card {
  border-radius: 16px;
  height: 100%;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  }
}

.kpi-card__section {
  padding: 20px;
}

.kpi-badge-wrap {
  display: flex;
}

.kpi-health-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 1rem;
  border-radius: 10px;
}

.kpi-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
  animation: pulse 1.6s infinite;
}

.kpi-pulse--critical {
  color: #ff4d4f;
}

.kpi-pulse--warning {
  color: #ffcc00;
}

.kpi-pulse--stable {
  color: #21ba45;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.7;
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px transparent;
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 transparent;
    opacity: 0;
  }
}

.live-summary-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.health-surface--critical {
  background: linear-gradient(135deg, rgba(193, 0, 21, 0.32), rgba(35, 8, 12, 0.96));
  border-color: rgba(193, 0, 21, 0.82);
}

.health-surface--warning {
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.3), rgba(40, 20, 8, 0.96));
  border-color: rgba(233, 113, 50, 0.85);
}

.health-surface--stable {
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.24), rgba(8, 35, 16, 0.96));
  border-color: rgba(33, 186, 69, 0.75);
}

.live-summary-card__icon {
  animation: pulse-soft 1.8s infinite;
}

@keyframes pulse-soft {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.letter-spacing-sm {
  letter-spacing: 0.04em;
}
</style>
