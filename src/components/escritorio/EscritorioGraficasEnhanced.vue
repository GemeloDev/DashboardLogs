<template>
  <div v-show="refreshing" class="dashboard-refresh-indicator">
    <q-spinner size="16px" color="cyan" />
    <span>{{ t('diagnostic.updatingData') }}</span>
  </div>
  <!-- Hero superior -->
  <div
    v-if="!loading && (shouldShowPanel(DASHBOARD_PANEL_IDS.EVENT_TYPES) || shouldShowPanel(DASHBOARD_PANEL_IDS.COVERAGE))"
    class="q-mb-lg"
  >
    <section class="dashboard-hero" :class="{ 'dashboard-hero--popup': popupMode }">
      <div v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.EVENT_TYPES)" class="dashboard-hero__left">
        <q-card flat bordered class="dashboard-hero__events-card text-white">
          <div class="dashboard-hero__section-head">
            <div>
              <div class="hero-side-title">{{ t('dashboard.topFunctions') }}</div>
              <div class="hero-side-subtitle">
                {{ t('dashboard.periodLogsProcessed', { count: formatMetric(funcUsage.total) }) }}
              </div>
            </div>

            <DashboardPopoutButton
              v-if="showInternalPopouts"
              :section-id="DASHBOARD_SECTION_IDS.FUNCTIONS"
            />
            <div class="hero-total-pill">
              <div class="hero-total-pill__label">
                {{ t('dashboard.historicalTotalDatabase') }}
              </div>
              <div class="hero-total-pill__value">{{ formatMetric(historicalTotalLogs) }}</div>
            </div>
          </div>

          <div class="dashboard-hero__events-grid">
            <q-card
              v-for="it in funcUsage.items"
              :key="it.name"
              flat
              bordered
              class="func-subcard func-clickable"
              clickable
              v-ripple
              :class="{ 'func-subcard--active': selectedEventType === it.name }"
              @click="onEventTypeCardClick(it.name)"
            >
              <div class="func-subcard__head">
                <span class="func-dot" :style="{ background: it.color }"></span>
                <div class="func-subcard__title ellipsis">{{ it.name }}</div>
                <div class="func-subcard__count">{{ it.count }}</div>
              </div>

              <q-linear-progress
                :value="it.ratio"
                :color="it.qColor"
                track-color="grey-9"
                rounded
                size="9px"
              />

              <div class="func-subcard__meta">
                <span>{{ it.pct + t('dashboard.ofTotal') }}</span>
                <span>{{ it.count }}/{{ funcUsage.total }}</span>
              </div>
            </q-card>
          </div>
        </q-card>
      </div>

      <q-card
        v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.COVERAGE)"
        flat
        bordered
        class="dashboard-hero__donut-card text-white"
      >
        <div class="hero-side-top">
          <div class="hero-side-icon">
            <q-icon name="donut_large" size="24px" />
          </div>
          <div>
            <div class="hero-side-title">{{ t('dashboard.coverageFunctions') }}</div>
            <div class="hero-side-subtitle">{{ t('dashboard.distributionBySystem') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.FUNCTIONS"
          />
        </div>

        <div class="dashboard-hero__donut-wrap">
          <div class="dashboard-hero__donut-visual">
            <canvas ref="coverageDonutCanvas"></canvas>
            <div class="donut-center-overlay">
              <div class="donut-pct donut-pct--hero">{{ donutCenterPct }}</div>
              <div class="donut-sub donut-sub--hero">{{ donutCenterLabel }}</div>
            </div>
          </div>

          <div class="dashboard-hero__donut-summary">
            <div class="mini-metric--compact">
              <div class="mini-metric__label">{{ t('dashboard.mostActiveEvent') }}</div>
              <div class="mini-metric__value dashboard-hero__top-name">
                {{ funcUsage.topName || t('dashboard.noData') }}
              </div>
            </div>

            <div class="mini-metric--compact">
              <div class="mini-metric__label">{{ t('dashboard.participationMain') }}</div>
              <div class="mini-metric__value">{{ funcUsage.topPct }}%</div>
            </div>
          </div>
        </div>
      </q-card>
    </section>
  </div>

  <!-- Widget Actividad de Hoy -->
  <ActivityTodayWidget
    v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.ACTIVITY)"
    ref="activityWidgetRef"
    :popup-mode="popupMode"
    :show-popout="showInternalPopouts"
  />

  <!-- Locaciones + Etiquetas + Outcomes -->
  <div
    v-if="
      !loading &&
      (
        (shouldShowPanel(DASHBOARD_PANEL_IDS.OFFICES) && topOffices.items.length) ||
        (shouldShowPanel(DASHBOARD_PANEL_IDS.TAGS) && topTags.items.length) ||
        (shouldShowPanel(DASHBOARD_PANEL_IDS.OUTCOMES) && topOutcomes.items.length)
      )
    "
    class="row q-col-gutter-md q-mb-md items-stretch"
  >
    <div
      :class="[thirdColumnClass, 'toplist-col']"
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.OFFICES) && topOffices.items.length"
    >
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="apartment" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Top Oficinas / Sucursales</div>
            <div class="toplist-subtitle text-grey-5">Lugares físicos desde donde se usa la app</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TOPLISTS"
          />
        </div>
        <div
          v-for="it in topOffices.items"
          :key="it.label"
          class="q-mb-md toplist-row"
          clickable
          v-ripple
          @click="openConsoleWithFilter('location.name', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="cyan"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>

    <div
      :class="[thirdColumnClass, 'toplist-col']"
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.TAGS) && topTags.items.length"
    >
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="sell" color="purple" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Origen de Tráfico</div>
            <div class="toplist-subtitle text-grey-5">
              Distribución de librerías y componentes (Axios, Auth, UI)
            </div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TOPLISTS"
          />
        </div>
        <div
          v-for="it in topTags.items"
          :key="it.label"
          class="q-mb-md toplist-row"
          clickable
          v-ripple
          @click="openConsoleWithFilter('tags', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="purple"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>

    <div
      :class="[thirdColumnClass, 'toplist-col']"
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.OUTCOMES) && topOutcomes.items.length"
    >
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="insights" color="pink" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Estatus de Transacciones</div>
            <div class="toplist-subtitle text-grey-5">Proporción de operaciones.</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TOPLISTS"
          />
        </div>
        <div
          v-for="it in topOutcomes.items"
          :key="it.label"
          class="q-mb-md toplist-row"
          clickable
          v-ripple
          @click="openConsoleWithFilter('outcome', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="pink"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>
  </div>

  <!-- Status a travÃ©s del tiempo -->
  <div
    v-show="!loading && shouldShowPanel(DASHBOARD_PANEL_IDS.STATUS_TIMELINE)"
    class="row q-col-gutter-md q-mb-md"
  >
    <div class="col-12">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="fact_check" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('common.status') }}</div>
            <div class="toplist-subtitle text-grey-5">{{ t('dashboard.subtitleStatus') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.STATUS"
          />
        </div>
        <div
          id="chart-estados"
          class="status-line-wrap"
          :class="{ 'status-line-wrap--popup': popupMode }"
        >
          <apexchart
            type="line"
            height="100%"
            :options="statusApexOptions"
            :series="statusApexSeries"
          />
        </div>
      </q-card>
    </div>
  </div>

  <!-- Severidad + HTTP -->
  <div
    v-if="
      !loading &&
      (
        shouldShowPanel(DASHBOARD_PANEL_IDS.SEVERITY) ||
        shouldShowPanel(DASHBOARD_PANEL_IDS.HTTP)
      )
    "
    class="row q-col-gutter-md q-mb-md items-stretch"
  >
    <div
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.SEVERITY)"
      :class="severityColumnClass"
    >
      <q-card flat bordered class="toplist-card q-pa-lg text-white" style="height: 100%">
        <div class="row items-center q-mb-md">
          <q-icon name="warning" color="orange" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('common.severity') }}</div>
            <div class="toplist-subtitle text-grey-5">{{ t('dashboard.subtitleSeverity') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts && !shouldShowPanel(DASHBOARD_PANEL_IDS.HTTP)"
            :section-id="DASHBOARD_SECTION_IDS.SEVERITY_HTTP"
          />
        </div>
        <div class="severity-pie-wrap">
          <canvas ref="severityPieCanvas"></canvas>
        </div>
      </q-card>
    </div>

    <div
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.HTTP)"
      :class="halfColumnClass"
    >
      <q-card flat bordered class="toplist-card q-pa-lg text-white" style="height: 100%">
        <div class="row items-center q-mb-md">
          <q-icon name="crisis_alert" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">
              {{ t('dashboard.operationImpact') }}
              <q-icon name="info" size="16px" class="q-ml-xs text-grey-6" style="cursor: pointer">
                <q-tooltip>Estimación del número de personas afectadas por fallos en el sistema y el tiempo de retraso acumulado en sus tareas diarias.</q-tooltip>
              </q-icon>
            </div>
            <div class="toplist-subtitle text-grey-5">{{ t('dashboard.operationImpactSubtitle') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.SEVERITY_HTTP"
          />
        </div>
        <div class="impact-widget">
          <div class="impact-grid">
            <div
              class="impact-cell impact-cell--clickable"
              role="button"
              tabindex="0"
              @click="showAffectedUsersModal = true"
              @keydown.enter="showAffectedUsersModal = true"
              @keydown.space.prevent="showAffectedUsersModal = true"
            >
              <q-icon name="groups" size="28px" class="text-orange impact-cell__icon" />
              <div class="impact-cell__value">{{ operationImpact.affectedUsers }}</div>
              <div class="impact-cell__label">{{ t('dashboard.affectedUsersToday') }}</div>
            </div>
            <div class="impact-cell">
              <q-icon name="timer" size="28px" class="text-cyan impact-cell__icon" />
              <div class="impact-cell__value">{{ operationImpact.delayMinutes }} min</div>
              <div class="impact-cell__label">{{ t('dashboard.estimatedDelay') }}</div>
            </div>
            <div class="impact-cell impact-cell--wide">
              <div class="impact-cell__label">{{ t('dashboard.serviceStatus') }}</div>
              <q-badge
                :color="healthColor(operationImpact.status)"
                class="impact-status-badge text-weight-bold q-mt-xs"
              >
                <span class="impact-pulse" :class="healthPulseClass(operationImpact.status)" />
                {{ operationImpact.statusLabel }}
              </q-badge>
            </div>
          </div>
          <div class="impact-caption text-grey-5 q-mt-md">
            {{ t('dashboard.operationImpactCaption') }}
          </div>
        </div>
      </q-card>
    </div>
  </div>

  <q-dialog
    v-model="showAffectedUsersModal"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="affected-users-dialog">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="row items-center no-wrap">
          <q-icon name="warning" color="warning" size="24px" class="q-mr-sm" />
          <div>
            <div class="text-h5 text-bold text-white">Impacto en Usuarios</div>
            <div class="text-caption text-grey-5">
              Usuarios con fallos registrados.
            </div>
          </div>
        </div>
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
          color="grey-5"
          aria-label="Cerrar"
        />
      </q-card-section>

      <q-separator class="q-my-md bg-grey-9" />

      <q-card-section class="q-pa-md affected-users-dialog__body">
        <q-list
          v-if="affectedUsersTodayList.length"
          separator
          class="affected-users-list rounded-borders"
        >
          <q-item
            v-for="user in affectedUsersTodayList"
            :key="user.key"
            class="q-py-md"
          >
            <q-item-section avatar>
              <q-avatar
                color="red-10"
                text-color="red-4"
                icon="person_off"
                font-size="20px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-bold text-white">
                {{ user.fullName || user.username }}
              </q-item-label>
              <q-item-label caption class="text-grey-5">
                Usuario:
                <span class="text-grey-3">{{ user.username || user.fullName }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="red-9" class="text-bold q-pa-xs">
                {{ user.errorCount }}
                {{ user.errorCount === 1 ? 'error hoy' : 'errores hoy' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-grey-5 text-center q-py-lg">
          No hay usuarios con fallos registrados hoy.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-dark-page">
        <q-btn v-close-popup label="Entendido" color="primary" flat no-caps />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Series: por Dí­a, Semana y Mes -->
  <div
    v-show="
      !loading &&
      (
        shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_DAY) ||
        shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_WEEK) ||
        shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_MONTH)
      )
    "
    class="row q-col-gutter-md q-mb-md"
  >
    <div
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_DAY)"
      :class="thirdColumnClass"
    >
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="timeline" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('dashboard.eventsByDay') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TIME_SERIES"
          />
        </div>
        <div class="chart-wrap">
          <apexchart
            type="line"
            height="100%"
            :options="eventsDayApexOptions"
            :series="eventsDayApexSeries"
          />
        </div>
      </q-card>
    </div>

    <div
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_WEEK)"
      :class="thirdColumnClass"
    >
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="date_range" color="purple" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('dashboard.eventsByWeek') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TIME_SERIES"
          />
        </div>
        <div class="chart-wrap">
          <apexchart
            type="line"
            height="100%"
            :options="eventsWeekApexOptions"
            :series="eventsWeekApexSeries"
          />
        </div>
      </q-card>
    </div>

    <div
      v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.EVENTS_MONTH)"
      :class="thirdColumnClass"
    >
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="calendar_month" color="pink" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('dashboard.eventsByMonth') }}</div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showInternalPopouts"
            :section-id="DASHBOARD_SECTION_IDS.TIME_SERIES"
          />
        </div>
        <div class="chart-wrap">
          <apexchart
            type="line"
            height="100%"
            :options="eventsMonthApexOptions"
            :series="eventsMonthApexSeries"
          />
        </div>
      </q-card>
    </div>
  </div>

  <!-- Mapa geográfico / Dispositivos -->
  <div v-if="shouldShowPanel(DASHBOARD_PANEL_IDS.GEO) && hasMapData" class="q-mt-xl">
    <div class="row items-center q-mb-md">
      <div>
        <div class="toplist-title">{{ t('dashboard.panelGeoDevices') }}</div>
        <div class="toplist-subtitle text-grey-5">{{ t('dashboard.mapType') }}</div>
      </div>
      <q-space />
      <DashboardPopoutButton
        v-if="showInternalPopouts"
        :section-id="DASHBOARD_SECTION_IDS.GEO_DEVICES"
      />
    </div>
    <!-- Toggle solo visible cuando existen ambos tipos de datos -->
    <div v-if="hasGeoData && hasDevicesData" class="flex justify-center q-mb-md">
      <q-btn-toggle
        v-model="mapView"
        dense
        unelevated
        class="map-view-toggle"
        text-color="grey-5"
        toggle-color="orange-9"
        :options="[
          { label: t('dashboard.mapType'), value: 'logs'    },
          { label: t('dashboard.mapType_devices'), value: 'devices' },
        ]"
      />
    </div>

    <ConsoleGeoMap
      v-if="mapView === 'logs'"
      :points="geoPoints"
    />

    <ConsoleDevicesMap
      v-if="mapView === 'devices'"
      :devices="devicePoints"
      :logs="activeLogs"
      @select-device="onDeviceClick"
    />
  </div>

  <q-inner-loading
    :showing="loading"
    :label="t('common.loading')"
    dark
    label-class="text-teal"
    label-style="font-size: 1.1em"
  >
    <q-spinner-gears size="50px" color="orange-9" />
  </q-inner-loading>
</template>

<script setup>
import { ref, computed, inject, watch, nextTick, onBeforeUnmount } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ConsoleGeoMap from '../blocks/ConsoleGeoMap.vue'
import ConsoleDevicesMap from '../blocks/ConsoleDevicesMap.vue'
import Chart from 'chart.js/auto'
import ActivityTodayWidget from './ActivityTodayWidget.vue'
import DashboardPopoutButton from 'src/components/dashboard/DashboardPopoutButton.vue'
import { DASHBOARD_PANEL_IDS } from 'src/constants/dashboardPanels'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const apexchart = VueApexCharts

const props = defineProps({
  visiblePanels: {
    type: Array,
    default: null,
  },
  popupMode: {
    type: Boolean,
    default: false,
  },
  showInternalPopouts: {
    type: Boolean,
    default: true,
  },
  topEventLimit: {
    type: Number,
    default: 12,
  },
})

// Injects â”€â”€
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const logsGlobales = inject('logsGlobales', ref([]))
const openConsole = inject('openConsole', null)
const selectedSystem = computed(() => String(filtrosGlobales.value?.system || '').trim())
const isTrustValueSelected = computed(() => selectedSystem.value === 'TRUSTVALUE')
const activeLogs = computed(() =>
  (Array.isArray(logsGlobales.value) ? logsGlobales.value : []).filter(
    (log) =>
      !selectedSystem.value ||
      !String(log?.system || '').trim() ||
      String(log.system).trim() === selectedSystem.value,
  ),
)

// Estado Ãºnico de carga
const loading = inject('dashboardLoading', ref(false))
const refreshing = inject('dashboardRefreshing', ref(false))

// Datos de los 5 endpoints
const statsData = inject('dashboardStatsData', ref(null))
const seriesData = inject('dashboardSeriesData', ref(null))
const httpData = inject('dashboardHttpData', ref(null))
const geoData = inject('dashboardGeoData', ref(null))
const devicesData = inject('dashboardDevicesData', ref(null))

const activityWidgetRef = ref(null)
const showAffectedUsersModal = ref(false)
const visiblePanelSet = computed(() =>
  props.visiblePanels?.length ? new Set(props.visiblePanels) : null,
)
const shouldShowPanel = (panelId) =>
  !visiblePanelSet.value || visiblePanelSet.value.has(panelId)
const halfColumnClass = computed(() => (props.popupMode ? 'col-12' : 'col-12 col-md-6'))
const thirdColumnClass = computed(() => (props.popupMode ? 'col-12' : 'col-12 col-md-4'))

// Flags derivados de la API
const severityColumnClass = computed(() =>
  props.popupMode || !shouldShowPanel(DASHBOARD_PANEL_IDS.HTTP) ? 'col-12' : 'col-12 col-md-6',
)

function healthColor(status) {
  switch (status) {
    case 'CRITICAL':
      return 'negative'
    case 'WARNING':
      return 'warning'
    case 'STABLE':
      return 'positive'
    default:
      return 'grey'
  }
}

function healthPulseClass(status) {
  switch (status) {
    case 'CRITICAL':
      return 'impact-pulse--critical'
    case 'WARNING':
      return 'impact-pulse--warning'
    case 'STABLE':
      return 'impact-pulse--stable'
    default:
      return ''
  }
}

const operationImpact = computed(() => {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const logsTodayOnly = activeLogs.value.filter((log) => {
    const rawDate =
      log?.timestamp ||
      log?.createdAt ||
      log?.date ||
      log?.eventTime ||
      log?.fechaHoraDia
    const logDate = new Date(rawDate)
    const isToday = Number.isFinite(logDate.getTime()) && logDate >= startOfToday
    const isCurrentSystem =
      !selectedSystem.value ||
      !String(log?.system || '').trim() ||
      String(log.system).trim() === selectedSystem.value
    const outcome = String(log?.outcome || '').toUpperCase()
    const status = String(log?.status || '').toUpperCase()
    const level = String(log?.level || '').toUpperCase()
    const isError =
      outcome === 'FAILURE' ||
      status === 'REJECTED' ||
      level === 'ERROR' ||
      level === 'CRITICAL'

    return isToday && isCurrentSystem && isError
  })

  const affectedUsersMap = new Map()

  logsTodayOnly.forEach((log) => {
    const username = String(log?.actor?.username || log?.username || '').trim()
    const fullName = String(log?.actor?.fullName || log?.actorName || '').trim()
    const name = fullName || username
    if (!name) return

    const key = String(
      log?.actor?.username ||
      log?.actor?.fullName ||
      log?.actorName ||
      log?.username,
    )
      .trim()
      .toLowerCase()
    const current = affectedUsersMap.get(key) || {
      key,
      name,
      username,
      fullName,
      errorCount: 0,
      systems: new Set(),
    }
    current.errorCount += 1
    if (log?.system || selectedSystem.value) {
      current.systems.add(String(log?.system || selectedSystem.value))
    }
    affectedUsersMap.set(key, current)
  })

  const users = [...affectedUsersMap.values()]
    .map((user) => ({
      ...user,
      systems: [...user.systems],
    }))
    .sort((a, b) => b.errorCount - a.errorCount || a.name.localeCompare(b.name))
  const affectedUsers = affectedUsersMap.size

  const hasImpact = affectedUsers > 0
  const status = hasImpact ? 'WARNING' : 'STABLE'

  return {
    affectedUsers,
    delayMinutes: affectedUsers * 5,
    status,
    statusLabel: hasImpact ? 'Atención Requerida' : 'Operando con normalidad',
    statusColor: hasImpact ? 'warning' : 'positive',
    users,
  }
})

const affectedUsersTodayList = computed(() => operationImpact.value.users)
const hasGeoData = computed(() => !!geoData.value?.points?.length)
const normalizeDeviceFilterValue = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
const selectedDeviceIdFilter = computed(() =>
  normalizeDeviceFilterValue(filtrosGlobales.value?.values?.deviceId),
)

function isValidDeviceForMap(device = {}) {
  return (
    device?.latitude != null &&
    device?.longitude != null &&
    Number.isFinite(+device.latitude) &&
    Number.isFinite(+device.longitude)
  )
}

function matchesSelectedDevice(device = {}) {
  return (
    !selectedDeviceIdFilter.value ||
    normalizeDeviceFilterValue(device?.deviceId) === selectedDeviceIdFilter.value
  )
}

const hasDevicesData = computed(() =>
  (devicesData.value?.devices || []).some(
    (device) => matchesSelectedDevice(device) && isValidDeviceForMap(device),
  ),
)

// Helpers de consola â”€â”€â”€
const selectedEventType = computed(() => filtrosGlobales.value?.values?.eventType || '')

function onEventTypeCardClick(eventType) {
  if (typeof openConsole === 'function')
    return openConsole({ fieldKey: 'eventType', value: eventType })
  window.dispatchEvent(
    new CustomEvent('santoro-abrir-consola', {
      detail: { fieldKey: 'eventType', value: eventType },
    }),
  )
}

function openConsoleWithFilter(fieldKey, value) {
  if (typeof openConsole === 'function') return openConsole({ fieldKey, value })
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail: { fieldKey, value } }))
}

function openConsoleWithSelection(selection) {
  if (typeof openConsole === 'function') return openConsole(selection)
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail: selection }))
}

// Geo â”€â”€
const geoPoints = computed(() =>
  (geoData.value?.points || [])
    .filter(
      (p) =>
        !isTrustValueSelected.value || p.system == null || p.system === 'TRUSTVALUE',
    )
    .map((p) => ({ lat: p.lat, lon: p.lon, weight: p.count })),
)

// Dispositivos â”€
const devicePoints = computed(() =>
  (devicesData.value?.devices || [])
    .filter((d) => matchesSelectedDevice(d) && isValidDeviceForMap(d))
    .filter((d) => !isTrustValueSelected.value || d.system === 'TRUSTVALUE')
    .map((d) => ({
      lat: +d.latitude,
      lon: +d.longitude,
      deviceId: d.deviceId,
      hostname: d.hostname || '',
      name: d.name || '',
      system: d.system || '',
      status: d.status || 'OFFLINE',
      hasError: d.hasError,
      errorCount: d.errorCount,
      errorRate: d.errorRate,
      ip: d.ip || '',
      locationName: d.locationName || '',
      lastSeen: d.lastSeen || '',
      username: d.username || d.userName || '',
      actorUsername: d.actorUsername || d.actor_username || '',
      actorName: d.actorName || d.fullName || d.userFullName || '',
      userId: d.userId || d.user_id || '',
      lastStatus: d.lastStatus || d.lastOutcome || '',
      recentLogs: Array.isArray(d.recentLogs) ? d.recentLogs : [],
    })),
)

function buildDeviceDisplayName(device = {}) {
  const name =
    device.actorName ||
    device.fullName ||
    device.username ||
    device.actorUsername ||
    device.name ||
    device.hostname ||
    device.deviceId ||
    ''
  return String(name).trim()
}

function normalizeMapDeviceId(device = {}) {
  return String(device?.deviceId || device?.id || '')
    .trim()
    .replace(/^ESC-/i, '')
}

function openDeviceLog(device) {
  const deviceId = normalizeMapDeviceId(device)
  const displayName = buildDeviceDisplayName(device)
  if (!deviceId) {
    $q.notify({
      type: 'info',
      position: 'top',
      message: 'No se pudo determinar un identificador para buscar logs de este dispositivo.',
    })
    return
  }
  const detail = { deviceId, displayName }
  if (typeof openConsole === 'function') return openConsole(detail)
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail }))
}

function onDeviceClick(device) {
  openDeviceLog(device)
}

const hasMapData = computed(() => hasGeoData.value || hasDevicesData.value)

// 'logs' muestra ConsoleGeoMap, 'devices' muestra ConsoleDevicesMap.
// Cuando solo existe un tipo de datos, se fuerza ese valor.
const mapView = ref('logs')
watch(
  [hasGeoData, hasDevicesData],
  ([geo, dev]) => {
    if (!geo && dev) mapView.value = 'devices'
    if (geo && !dev) mapView.value = 'logs'
  },
  { immediate: true },
)

watch(
  selectedDeviceIdFilter,
  (deviceId) => {
    if (deviceId && hasDevicesData.value) mapView.value = 'devices'
  },
  { immediate: true },
)

// Dashboard stats helpers â”€â”€
const FUNC_COLORS = [
  { q: 'teal', hex: '#29d3c2' },
  { q: 'pink', hex: '#ff5c8a' },
  { q: 'orange', hex: '#ff9f43' },
  { q: 'cyan', hex: '#22d3ee' },
  { q: 'purple', hex: '#a78bfa' },
  { q: 'amber', hex: '#fbbf24' },
  { q: 'green', hex: '#22c55e' },
  { q: 'red', hex: '#ef4444' },
]

const normalizeStatRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    label: String(row?.value ?? row?.label ?? t('dashboard.noData')),
    count: Number(row?.count || 0),
    pct: Number(row?.pct || 0),
  }))

const normalizeFilterValue = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const activeValueFilters = computed(() => filtrosGlobales.value?.values || {})

function filterStatRowsByKey(rows, key) {
  const selected = normalizeFilterValue(activeValueFilters.value?.[key])
  const list = normalizeStatRows(rows)
  if (!selected) return list
  return list.filter((row) => normalizeFilterValue(row.label) === selected)
}

const filteredStatusOverTime = computed(() => {
  const selectedStatus = normalizeFilterValue(activeValueFilters.value?.status)
  const items = Array.isArray(seriesData.value?.statusOverTime)
    ? seriesData.value.statusOverTime
    : []
  if (!selectedStatus) return items
  return items.filter((row) => normalizeFilterValue(row?.status) === selectedStatus)
})

function aggregateStatusRowsByPeriod(rows, mode) {
  const map = new Map()

  const getIsoWeekLabel = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateStr

    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = utc.getUTCDay() || 7
    utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
    return `${t('dashboard.weekPrefix')} ${weekNo}-${utc.getUTCFullYear()}`
  }

  for (const row of rows) {
    const date = String(row?.date || '').trim()
    const count = Number(row?.count || 0)
    if (!date || !count) continue

    let key = date
    if (mode === 'week') key = getIsoWeekLabel(date)
    if (mode === 'month') key = `${date.slice(5, 7)}-${date.slice(0, 4)}`

    map.set(key, (map.get(key) || 0) + count)
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
}

const filteredByDay = computed(() => {
  if (activeValueFilters.value?.status) {
    return aggregateStatusRowsByPeriod(filteredStatusOverTime.value, 'day')
  }
  return Array.isArray(seriesData.value?.byDay) ? seriesData.value.byDay : []
})

const filteredByWeek = computed(() => {
  if (activeValueFilters.value?.status) {
    return aggregateStatusRowsByPeriod(filteredStatusOverTime.value, 'week')
  }
  return Array.isArray(seriesData.value?.byWeek) ? seriesData.value.byWeek : []
})

const filteredByMonth = computed(() => {
  if (activeValueFilters.value?.status) {
    return aggregateStatusRowsByPeriod(filteredStatusOverTime.value, 'month')
  }
  return Array.isArray(seriesData.value?.byMonth) ? seriesData.value.byMonth : []
})

const toApiTopList = (rows, { topN = 4 } = {}) => {
  const list = normalizeStatRows(rows).slice(0, topN)
  if (!list.length) return { items: [] }
  const max = Math.max(...list.map((x) => x.count || 0), 1)
  return {
    items: list.map((x) => ({
      label: x.label,
      count: x.count,
      pct: x.pct,
      ratioToMax: (x.count || 0) / max,
    })),
  }
}

// funcUsage
const formatMetric = (value) => new Intl.NumberFormat('es-MX').format(Number(value || 0))
const historicalTotalLogs = computed(() =>
  Number(statsData.value?.totalHistoricalLogs ?? statsData.value?.totalProcessedLogs ?? 0),
)

const funcUsage = computed(() => {
  const totalFromApi = Number(statsData.value?.totalEvents ?? statsData.value?.total ?? 0)
  const source = filterStatRowsByKey(statsData.value?.topEventTypes, 'eventType')
  const hasEventTypeFilter = !!normalizeFilterValue(activeValueFilters.value?.eventType)
  const total = hasEventTypeFilter
    ? source.reduce((sum, item) => sum + Number(item.count || 0), 0)
    : totalFromApi

  if (!total || !source.length)
    return { total: 0, items: [], donutSegments: [], coveragePct: 0, topName: '', topPct: 0 }

  const topN = props.topEventLimit > 0 ? props.topEventLimit : 12
  const top = source.slice(0, topN)
  const topSum = top.reduce((s, x) => s + x.count, 0)
  const rest = Math.max(0, total - topSum)

  const topItems = top.map((item, idx) => {
    const color = FUNC_COLORS[idx % FUNC_COLORS.length]
    const ratio = total ? item.count / total : 0
    return {
      name: item.label,
      count: item.count,
      ratio,
      pct: Number(item.pct || Math.round(ratio * 1000) / 10),
      qColor: color.q,
      color: color.hex,
    }
  })

  const donutSegments = [...topItems]
  if (rest > 0) {
    donutSegments.push({
      name: t('common.others'),
      count: rest,
      ratio: total ? rest / total : 0,
      pct: Math.round((rest / total || 0) * 1000) / 10,
      qColor: 'grey',
      color: '#6b7280',
    })
  }

  const topOne = topItems[0]
  return {
    total,
    items: topItems,
    donutSegments,
    coveragePct: Math.round((topSum / total || 0) * 1000) / 10,
    topName: topOne?.name || '',
    topPct: topOne?.pct || 0,
  }
})

const donutCenterPct = computed(() => `${Math.round(Number(funcUsage.value?.coveragePct || 0))}%`)
const donutCenterLabel = computed(() => {
  const segs = funcUsage.value?.donutSegments || []
  if (!segs.length) return t('dashboard.topLabel')
  return segs.some((s) => s.name === t('common.others'))
    ? t('dashboard.coverageFunctions')
    : t('dashboard.distributionBySystem')
})

const coverageDonutCanvas = ref(null)
let coverageDonutChart = null

async function renderCoverageDonutChart() {
  await nextTick()
  const el = coverageDonutCanvas.value
  if (!el) return

  if (coverageDonutChart) {
    coverageDonutChart.destroy()
    coverageDonutChart = null
  }

  const segments = funcUsage.value?.donutSegments || []
  if (!segments.length) return

  coverageDonutChart = new Chart(el.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: segments.map((segment) => segment.name),
      datasets: [
        {
          data: segments.map((segment) => Number(segment.count || 0)),
          backgroundColor: segments.map((segment) => segment.color),
          borderColor: 'rgba(15,20,32,0.92)',
          borderWidth: 1,
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      onHover: (event, activeEls) => {
        const target = event?.native?.target
        if (target) target.style.cursor = activeEls?.length ? 'pointer' : 'default'
      },
      onClick: (_, activeEls) => {
        if (!activeEls?.length) return
        const segment = segments[activeEls[0].index]
        if (!segment?.name || segment.name === 'Otros') return
        onEventTypeCardClick(segment.name)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (ctx) => {
              const segment = segments[ctx.dataIndex]
              return `${segment?.name || ''}: ${segment?.count || 0} (${segment?.pct || 0}%)`
            },
          },
        },
      },
    },
  })
}

const topOffices = computed(() => toApiTopList(statsData.value?.topLocations, { topN: 4 }))
const topTags = computed(() => toApiTopList(statsData.value?.topTags, { topN: 3 }))
const topOutcomes = computed(() =>
  toApiTopList(filterStatRowsByKey(statsData.value?.outcomes, 'outcome'), { topN: 3 }),
)

// Severity pie (Chart.js) â”€â”€
const severityPieCanvas = ref(null)
let severityPieChart = null

const SEVERITY_ORDER = ['DEBUG', 'INFO', 'WARN', 'WARNING', 'ERROR', 'FATAL', 'CRITICAL', 'N/A']
const SEVERITY_COLORS = {
  DEBUG: '#94a3b8',
  INFO: '#1AC8ED',
  WARN: '#ff9f43',
  WARNING: '#ff9f43',
  ERROR: '#F5222D',
  FATAL: '#ff5c8a',
  CRITICAL: '#a78bfa',
  'N/A': '#6b7280',
}

function getSeverityRows() {
  return filterStatRowsByKey(statsData.value?.severities, 'severity')
    .map((row) => ({
      label: String(row.label || t('dashboard.noData')).toUpperCase(),
      count: row.count,
    }))
    .sort((a, b) => {
      const ia = SEVERITY_ORDER.indexOf(a.label)
      const ib = SEVERITY_ORDER.indexOf(b.label)
      const ra = ia === -1 ? 999 : ia
      const rb = ib === -1 ? 999 : ib
      return ra !== rb ? ra - rb : b.count - a.count
    })
}

async function renderSeverityPieChart() {
  await nextTick()
  const el = severityPieCanvas.value
  if (!el) return

  if (severityPieChart) {
    severityPieChart.destroy()
    severityPieChart = null
  }

  const rows = getSeverityRows()
  if (!rows.length) return

  const labels = rows.map((r) => r.label)
  const data = rows.map((r) => r.count)
  const colors = labels.map((l) => SEVERITY_COLORS[l] || '#29d3c2')
  const total = data.reduce((s, x) => s + x, 0) || 1

  severityPieChart = new Chart(el.getContext('2d'), {
    type: 'pie',
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderColor: 'rgba(15,20,32,0.85)', borderWidth: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onHover: (event, activeEls) => {
        const t = event?.native?.target
        if (t) t.style.cursor = activeEls?.length ? 'pointer' : 'default'
      },
      onClick: (_, activeEls, chart) => {
        if (!activeEls?.length) return
        const severity = chart.data.labels?.[activeEls[0].index]
        if (severity) openConsoleWithFilter('severity', severity)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: ${Number(ctx.parsed || 0)} (${Math.round((ctx.parsed / total) * 1000) / 10}%)`,
          },
        },
      },
    },
  })
}

// Series temporales: día / semana / mes
const SERIES_COLORS = { day: '#22d3ee', week: '#a78bfa', month: '#ff5c8a', year: '#fbbf24' }
const STATUS_COLORS = {
  SUCCESS: '#22c55e',
  OK: '#22c55e',
  COMPLETED: '#22c55e',
  FAILED: '#ef4444',
  ERROR: '#ef4444',
  WARNING: '#ff9f43',
  WARN: '#ff9f43',
  PENDING: '#fbbf24',
  INFO: '#22d3ee',
}
const STATUS_FALLBACK_COLORS = ['#22d3ee', '#a78bfa', '#ff5c8a', '#fbbf24', '#29d3c2', '#94a3b8']

function statusColor(status, index) {
  return (
    STATUS_COLORS[String(status || '').toUpperCase()] ||
    STATUS_FALLBACK_COLORS[index % STATUS_FALLBACK_COLORS.length]
  )
}

function buildStatusApexData(items = []) {
  const map = new Map()
  const dates = new Set()
  const statuses = new Set()

  items.forEach(({ date, status, count }) => {
    if (!date || !status) return
    dates.add(date)
    statuses.add(status)
    const statusMap = map.get(status) || new Map()
    statusMap.set(date, Number(count || 0))
    map.set(status, statusMap)
  })

  const labels = Array.from(dates).sort()
  const statusList = Array.from(statuses)
  return {
    labels,
    colors: statusList.map((status, index) => statusColor(status, index)),
    series: statusList.map((status) => ({
      name: status,
      data: labels.map((date) => map.get(status)?.get(date) || 0),
    })),
  }
}

const statusApexData = computed(() => buildStatusApexData(filteredStatusOverTime.value))
const statusApexSeries = computed(() => statusApexData.value.series)

function buildSingleApexSeries(items = []) {
  return [
    {
      name: t('dashboard.eventsSeriesLabel'),
      data: items.map((item) => Number(item?.count || 0)),
    },
  ]
}

const eventsDayApexLabels = computed(() => filteredByDay.value.map((item) => item.date))
const eventsWeekApexLabels = computed(() => filteredByWeek.value.map((item) => item.date))
const eventsMonthApexLabels = computed(() => filteredByMonth.value.map((item) => item.date))
const eventsDayApexSeries = computed(() => buildSingleApexSeries(filteredByDay.value))
const eventsWeekApexSeries = computed(() => buildSingleApexSeries(filteredByWeek.value))
const eventsMonthApexSeries = computed(() => buildSingleApexSeries(filteredByMonth.value))

function buildBaseApexOptions({
  id,
  categories,
  colors,
  showLegend = false,
  onPointClick,
  xLabelStep = 1,
}) {
  const selectPoint = (config) => {
    const category = categories?.[config?.dataPointIndex]
    const seriesName = config?.w?.config?.series?.[config?.seriesIndex]?.name
    if (category) onPointClick?.({ category, seriesName })
  }

  return {
    chart: {
      id,
      type: 'line',
      background: 'transparent',
      foreColor: '#cfe3ff',
      animations: { enabled: false },
      parentHeightOffset: 0,
      toolbar: {
        show: true,
        autoSelected: 'pan',
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        export: {
          csv: { filename: id },
          svg: { filename: id },
          png: { filename: id },
        },
      },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      },
      events: {
        markerClick: (_, __, config) => selectPoint(config),
        dataPointSelection: (_, __, config) => selectPoint(config),
        click: (_, __, config) => selectPoint(config),
      },
    },
    colors,
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 3,
      strokeWidth: 0,
      hover: { size: 5 },
    },
    fill: {
      type: 'solid',
      opacity: 1,
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      strokeDashArray: 0,
      padding: { top: 0, right: 12, bottom: 0, left: 8 },
    },
    legend: {
      show: showLegend,
      position: 'bottom',
      labels: { colors: '#cfe3ff' },
      markers: { size: 8 },
    },
    tooltip: {
      theme: 'dark',
      shared: false,
      intersect: true,
      marker: { show: true },
      y: {
        formatter: (value) => `${Number(value || 0)} ${t('dashboard.eventsSeriesLabel').toLowerCase()}`,
      },
    },
    xaxis: {
      categories,
      tickAmount: Math.max(1, Math.ceil((categories?.length || 1) / xLabelStep)),
      labels: {
        trim: true,
        rotate: -35,
        style: { colors: '#9ca3af', fontSize: '11px' },
        formatter: (value, timestamp, opts) => {
          const index = opts?.i
          if (xLabelStep <= 1 || index == null) return value
          return index % xLabelStep === 0 ? value : ''
        },
      },
      axisBorder: { color: 'rgba(255,255,255,0.16)' },
      axisTicks: { color: 'rgba(255,255,255,0.16)' },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: '#9ca3af' },
        formatter: (value) => Math.round(Number(value || 0)),
      },
    },
    noData: {
      text: t('dashboard.noData'),
      align: 'center',
      verticalAlign: 'middle',
      style: { color: '#9ca3af', fontSize: '13px' },
    },
  }
}

const statusApexOptions = computed(() =>
  buildBaseApexOptions({
    id: 'dashboard-status',
    categories: statusApexData.value.labels,
    colors: statusApexData.value.colors,
    showLegend: true,
    onPointClick: ({ category, seriesName }) => {
      if (!seriesName) return
      openConsoleWithSelection([
        { fieldKey: 'status', value: seriesName },
        { fieldKey: 'rangoFechas', value: { from: category, to: category } },
      ])
    },
  }),
)

const eventsDayApexOptions = computed(() =>
  buildBaseApexOptions({
    id: 'dashboard-events-day',
    categories: eventsDayApexLabels.value,
    colors: [SERIES_COLORS.day],
    xLabelStep: Math.max(1, Math.ceil(eventsDayApexLabels.value.length / 8)),
    onPointClick: ({ category }) =>
      openConsoleWithSelection([{ fieldKey: 'rangoFechas', value: dayRange(category) }]),
  }),
)

const eventsWeekApexOptions = computed(() =>
  buildBaseApexOptions({
    id: 'dashboard-events-week',
    categories: eventsWeekApexLabels.value,
    colors: [SERIES_COLORS.week],
    xLabelStep: Math.max(1, Math.ceil(eventsWeekApexLabels.value.length / 8)),
    onPointClick: ({ category }) =>
      openConsoleWithSelection([{ fieldKey: 'rangoFechas', value: weekRange(category) }]),
  }),
)

const eventsMonthApexOptions = computed(() =>
  buildBaseApexOptions({
    id: 'dashboard-events-month',
    categories: eventsMonthApexLabels.value,
    colors: [SERIES_COLORS.month],
    onPointClick: ({ category }) =>
      openConsoleWithSelection([{ fieldKey: 'rangoFechas', value: monthRange(category) }]),
  }),
)

// Helpers de rango de fechas para click en series
function dayRange(dateStr) {
  return { from: dateStr, to: dateStr }
}

function weekRange(dateStr) {
  const fmt = (d) => d.toISOString().slice(0, 10)

  // Soporta "Semana 10-2026" (formato de la API)
  const match = String(dateStr).match(/[Ss]emana\s+(\d+)-(\d{4})/)
  if (match) {
    const week = parseInt(match[1])
    const year = parseInt(match[2])
    // El 4 de enero siempre cae en la semana 1 ISO
    const jan4 = new Date(year, 0, 4)
    const dow = jan4.getDay() || 7 // Lunes=1, Domingo=7
    const week1Mon = new Date(jan4)
    week1Mon.setDate(jan4.getDate() - (dow - 1))
    const start = new Date(week1Mon)
    start.setDate(week1Mon.getDate() + (week - 1) * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { from: fmt(start), to: fmt(end) }
  }

  // Fallback: YYYY-MM-DD (inicio de semana)
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { from: dateStr, to: dateStr }
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  return { from: dateStr, to: fmt(end) }
}

function monthRange(dateStr) {
  const parts = dateStr.split('-')
  const year = parseInt(parts[1])
  const month = parseInt(parts[0]) - 1
  const mm = String(month + 1).padStart(2, '0')
  const from = `${parts[1]}-${mm}-01`
  const to = `${parts[1]}-${mm}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
  return { from, to }
}

// redrawCharts: Punto Común para renderizar/actualizar todos los charts del dashboard
async function redrawCharts() {
  renderCoverageDonutChart()
  renderSeverityPieChart()
}

const redrawKey = computed(() =>
  JSON.stringify({
    stats: !!statsData.value,
    series: !!seriesData.value,
    http: !!httpData.value,
    geo: !!geoData.value,
    values: activeValueFilters.value || {},
  }),
)

watch(
  redrawKey,
  async () => {
    await nextTick()
    redrawCharts()
  },
  { immediate: true },
)

// Lifecycle
onBeforeUnmount(() => {
  coverageDonutChart?.destroy()
  severityPieChart?.destroy()
})
</script>

<style lang="scss" scoped>
.dashboard-refresh-indicator {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.82rem;
  font-weight: 700;
  background: rgba(6, 16, 28, 0.82);
  border: 1px solid rgba(34, 211, 238, 0.22);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  pointer-events: none;
}

@media (max-width: 640px) {
  .dashboard-refresh-indicator {
    left: 12px;
    right: 12px;
    bottom: 12px;
    justify-content: center;
  }
}

.map-view-toggle {
  background: rgba(0, 0, 0, 0.55);
  border-radius: 14px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.55);

  :deep(.q-btn) {
    border-radius: 12px;
    padding: 10px 22px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.55);
    background: transparent;
    transition: all 0.12s ease;
  }

  :deep(.q-btn:hover) {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  :deep(.q-btn.q-btn--active) {
    background: linear-gradient(180deg, #ff7a1a 0%, #d65400 100%);
    color: #ffffff;
    box-shadow: 0 10px 25px rgba(255, 122, 26, 0.35);
  }

  :deep(.q-btn .q-btn__content) {
    white-space: nowrap;
  }
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  gap: 22px;
  align-items: stretch;
  min-width: 0;
  max-width: 100%;
}

.dashboard-hero--popup {
  grid-template-columns: 1fr;
}

.dashboard-hero__left {
  display: grid;
  gap: 22px;
  min-width: 0;
  max-width: 100%;
}

.dashboard-hero__title-card,
.dashboard-hero__events-card,
.dashboard-hero__donut-card,
.toplist-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.dashboard-hero__title-card {
  border-radius: 26px;
  padding: 30px 30px 6px;
}

.dashboard-hero__events-card {
  border-radius: 26px;
  padding: 24px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.dashboard-hero__donut-card {
  border-radius: 26px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  margin-bottom: 16px;
  color: white;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-badge span {
  font-size: 0.9rem;
  font-weight: 700;
}

.hero-title {
  margin: 0 0 12px;
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.hero-title--accent {
  background: linear-gradient(90deg, #22d3ee 0%, #7c3aed 55%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.75;
  max-width: 760px;
}

.hero-side-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.hero-side-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(124, 58, 237, 0.88));
}

.hero-side-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
}

.hero-side-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.dashboard-hero__section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
}

.hero-total-pill__label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
}

.hero-total-pill__value {
  color: #fff;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 900;
  line-height: 1.05;
  margin-top: 8px;
  text-align: center;
}

.dashboard-hero__events-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.func-subcard {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 14px;
  min-width: 0;
  overflow: hidden;
}

.func-subcard__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(72px, auto);
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.func-subcard__title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  min-width: 0;
}

.func-subcard__count {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 800;
  min-width: 72px;
  text-align: right;
  white-space: nowrap;
}

.func-subcard__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.78rem;
  min-width: 0;
}

.func-subcard__meta span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.func-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.dashboard-hero__donut-wrap {
  flex: 1;
  // min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  padding: 10px 0 0;
}

.dashboard-hero__donut-visual {
  position: relative;
  width: min(250px, 56vw);
  aspect-ratio: 1;
  margin: 0 auto;
}

.dashboard-hero__donut-visual canvas {
  width: 100% !important;
  height: 100% !important;
}

.donut-center-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  text-align: center;
  pointer-events: none;
  width: 100%;
  height: 100%;
  padding: 0 18%;
}

.donut-pct {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  margin-top: 0;
}

.donut-pct--hero {
  font-size: clamp(2rem, 4vw, 3rem);
}

.donut-sub {
  font-size: 10px;
  margin-top: 0;
}

.donut-sub--hero {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.1;
}

.dashboard-hero__donut-summary {
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 14px;
  width: 100%;
  margin-top: 10px;
}

.mini-metric {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-metric--compact {
  min-width: 190px;
  max-width: 240px;
  text-align: center;
}

.mini-metric__label {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.mini-metric__value {
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.1;
}

.dashboard-hero__top-name {
  word-break: break-word;
}

.toplist-card {
  border-radius: 22px;
}

.toplist-title {
  font-size: 18px;
  font-weight: 700;
}

.toplist-subtitle {
  font-size: 12px;
  margin-top: 2px;
}

.toplist-col {
  display: flex;
}

.toplist-card--full {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toplist-row {
  cursor: pointer;
  border-radius: 12px;
  transition:
    background 120ms ease,
    transform 120ms ease,
    border-color 120ms ease;
  border: 1px solid transparent;
}

.toplist-row:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.08);
}

.toplist-row:active {
  transform: translateY(0px);
}

.func-clickable {
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    border-color 120ms ease;
}

.func-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
  border-color: rgba(238, 143, 34, 0.377);
}

.func-subcard--active {
  border-color: rgba(34, 211, 238, 0.55) !important;
  box-shadow: 0 18px 42px rgba(34, 211, 238, 0.12);
}

.status-line-wrap {
  height: 260px;
}

.status-line-wrap--popup {
  height: clamp(560px, calc(100vh - 420px), 760px);
}

.status-line-wrap canvas,
.status-line-wrap :deep(.vue-apexcharts),
.status-line-wrap :deep(.apexcharts-canvas),
.status-line-wrap :deep(svg) {
  width: 100% !important;
  height: 100% !important;
}

.status-line-wrap :deep(.apexcharts-canvas) {
  cursor: pointer;
}

.severity-pie-wrap {
  height: 450px;
}
.severity-pie-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.impact-widget {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 380px;
}

.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.impact-cell {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &--wide {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &--clickable {
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid rgba(249, 115, 22, 0.9);
      outline-offset: 2px;
    }
  }
}

.affected-users-dialog {
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  color: #fff;
  background: #18191c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.affected-users-dialog__body {
  max-height: 56vh;
  overflow-y: auto;
}

.affected-users-list {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);

  :deep(.q-item) {
    transition: background 0.18s ease;
  }

  :deep(.q-item:hover) {
    background: rgba(255, 255, 255, 0.035);
  }
}

.impact-cell__icon {
  margin-bottom: 8px;
}

.impact-cell__value {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
}

.impact-cell__label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-top: 6px;
}

.impact-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  border-radius: 10px;
}

.impact-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
  animation: pulse 1.6s infinite;
}

.impact-pulse--critical {
  color: #ff4d4f;
}

.impact-pulse--warning {
  color: #ffcc00;
}

.impact-pulse--stable {
  color: #21ba45;
}

.impact-caption {
  font-size: 0.8rem;
  text-align: center;
}

.chart-wrap {
  height: 280px;
}

.chart-wrap canvas,
.chart-wrap :deep(.vue-apexcharts),
.chart-wrap :deep(.apexcharts-canvas),
.chart-wrap :deep(svg) {
  width: 100% !important;
  height: 100% !important;
}

.chart-wrap :deep(.apexcharts-canvas) {
  cursor: pointer;
}

.status-line-wrap,
.chart-wrap {
  :deep(.apexcharts-toolbar) {
    top: -4px !important;
    right: 0 !important;
    z-index: 4;
  }

  :deep(.apexcharts-menu) {
    background: rgba(12, 18, 31, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: #dbeafe;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.42);
  }

  :deep(.apexcharts-menu-item) {
    color: #dbeafe;
    background: transparent;
  }

  :deep(.apexcharts-menu-item:hover) {
    color: #ffffff;
    background: rgba(34, 211, 238, 0.16);
  }

  :deep(.apexcharts-toolbar svg) {
    fill: #9ca3af;
  }

  :deep(.apexcharts-toolbar .apexcharts-selected svg),
  :deep(.apexcharts-toolbar .apexcharts-pan-icon.apexcharts-selected svg),
  :deep(.apexcharts-toolbar .apexcharts-zoom-icon.apexcharts-selected svg),
  :deep(.apexcharts-toolbar > div:hover svg) {
    fill: #e5e7eb;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 140ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1240px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .dashboard-hero__events-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-hero__donut-wrap {
    min-height: 0;
  }

  .dashboard-hero__donut-card {
    order: -1;
  }
}

@media (max-width: 760px) {
  .dashboard-hero {
    width: 100%;
    overflow: hidden;
  }

  .dashboard-hero__title-card,
  .dashboard-hero__events-card,
  .dashboard-hero__donut-card {
    padding: 18px;
    border-radius: 22px;
    width: 100%;
  }

  .dashboard-hero__section-head {
    flex-direction: column;
  }

  .hero-total-pill {
    width: 100%;
    min-width: 0;
  }

  .dashboard-hero__events-grid {
    grid-template-columns: 1fr;
  }

  .func-subcard__head {
    grid-template-columns: auto minmax(0, 1fr) minmax(52px, auto);
    gap: 8px;
  }

  .func-subcard__title {
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.15;
  }

  .func-subcard__count {
    min-width: 0;
    max-width: 34vw;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1rem;
  }

  .dashboard-hero__donut-wrap {
    min-height: 0;
  }

  .dashboard-hero__donut-visual {
    width: min(220px, 68vw);
  }

  .donut-center-overlay {
    gap: 2px;
    padding: 0 20%;
  }

  .donut-pct--hero {
    font-size: clamp(1.7rem, 8vw, 2.4rem);
  }

  .donut-sub--hero {
    font-size: 0.82rem;
  }

  .mini-metric--compact {
    min-width: 0;
    width: 100%;
  }

  .hero-total-pill__value {
    text-align: center;
  }
}
</style>
