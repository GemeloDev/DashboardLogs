<template>
  <!-- ✅ Funcionalidades más usadas -->
  <div v-if="!loading" class="q-mb-lg">
    <q-card flat bordered class="func-wrap text-white q-pa-lg">
      <div class="flex items-center q-col-gutter-md">
        <div class="col-auto">
          <div class="donut" :style="donutStyle">
            <div class="donut-inner">
              <div class="donut-pct">{{ donutCenterPct }}</div>
              <div class="donut-sub text-grey-5">{{ donutCenterLabel }}</div>
            </div>
          </div>
        </div>

        <div class="col">
          <div
            class="text-subtitle1 text-grey-4"
            :class="$q.platform.is.mobile ? 'text-subtitle2' : ''"
          >
            Funcionalidades más usadas
          </div>
          <div class="text-caption text-grey-5">
            <span v-if="funcUsage.topName">
              Top: <span class="text-white">{{ funcUsage.topName }}</span> ({{ funcUsage.topPct }}%)
            </span>
            <span v-else>Sin datos</span>
          </div>
        </div>

        <div class="col-auto text-right">
          <div class="text-caption text-grey-5 q-mt-md">Total procesados</div>
          <div class="text-h3 text-weight-bold" :class="$q.platform.is.mobile ? 'text-h4' : ''">
            {{ funcUsage.total }}
          </div>
        </div>
      </div>

      <div class="row justify-center q-col-gutter-md">
        <div v-for="it in funcUsage.items" :key="it.name" class="col-12 col-md-2">
          <q-card
            flat bordered
            class="func-subcard q-pa-md func-clickable"
            clickable v-ripple
            :class="{ 'func-subcard--active': selectedEventType === it.name }"
            @click="onEventTypeCardClick(it.name)"
          >
            <div class="flex items-center q-mb-sm">
              <span class="func-dot q-mr-sm" :style="{ background: it.color }"></span>
              <div class="text-subtitle2 ellipsis" style="max-width: 70%">{{ it.name }}</div>
              <q-space />
              <div class="text-h6 text-weight-bold">{{ it.count }}</div>
            </div>
            <q-linear-progress :value="it.ratio" :color="it.qColor" track-color="grey-9" rounded size="10px" />
            <div class="row justify-between q-mt-xs text-caption text-grey-5">
              <div>{{ it.pct }}% del total</div>
              <div>{{ it.count }}/{{ funcUsage.total }}</div>
            </div>
          </q-card>
        </div>
      </div>
    </q-card>
  </div>

  <!-- ✅ Locaciones + Etiquetas + Outcomes -->
  <div
    v-if="!loading && (topOffices.items.length || topTags.items.length || topOutcomes.items.length)"
    class="row q-col-gutter-md q-mb-md items-stretch"
  >
    <div class="col-12 col-md-4 toplist-col" v-if="topOffices.items.length">
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="apartment" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Locaciones</div>
            <div class="toplist-subtitle text-grey-5">Top locaciones</div>
          </div>
        </div>
        <div
          v-for="it in topOffices.items" :key="it.label"
          class="q-mb-md toplist-row" clickable v-ripple
          @click="openConsoleWithFilter('location.name', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress :value="it.ratioToMax" color="cyan" track-color="grey-9" rounded size="8px" class="q-mt-xs" />
        </div>
      </q-card>
    </div>

    <div class="col-12 col-md-4 toplist-col" v-if="topTags.items.length">
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="sell" color="purple" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Etiquetas</div>
            <div class="toplist-subtitle text-grey-5">Distribución de eventos</div>
          </div>
        </div>
        <div
          v-for="it in topTags.items" :key="it.label"
          class="q-mb-md toplist-row" clickable v-ripple
          @click="openConsoleWithFilter('tags', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress :value="it.ratioToMax" color="purple" track-color="grey-9" rounded size="8px" class="q-mt-xs" />
        </div>
      </q-card>
    </div>

    <div class="col-12 col-md-4 toplist-col" v-if="topOutcomes.items.length">
      <q-card flat bordered class="toplist-card toplist-card--full q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="insights" color="pink" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Resultados de eventos (outcome)</div>
            <div class="toplist-subtitle text-grey-5">Top valores</div>
          </div>
        </div>
        <div
          v-for="it in topOutcomes.items" :key="it.label"
          class="q-mb-md toplist-row" clickable v-ripple
          @click="openConsoleWithFilter('outcome', it.label)"
        >
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress :value="it.ratioToMax" color="pink" track-color="grey-9" rounded size="8px" class="q-mt-xs" />
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Status a través del tiempo -->
  <div v-show="!loading" class="row q-col-gutter-md q-mb-md">
    <div class="col-12">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="fact_check" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Estatus</div>
            <div class="toplist-subtitle text-grey-5">Comportamiento a través del tiempo</div>
          </div>
        </div>
        <div class="status-line-wrap">
          <canvas ref="statusLineCanvas"></canvas>
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Severidad + HTTP -->
  <div v-if="!loading" class="row q-col-gutter-md q-mb-md items-stretch">
    <div :class="hasHttpData ? 'col-12 col-md-6' : 'col-12'">
      <q-card flat bordered class="toplist-card q-pa-lg text-white" style="height: 100%">
        <div class="row items-center q-mb-md">
          <q-icon name="warning" color="orange" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Severidad</div>
            <div class="toplist-subtitle text-grey-5">Distribución por nivel</div>
          </div>
        </div>
        <div class="severity-pie-wrap">
          <canvas ref="severityPieCanvas"></canvas>
        </div>
      </q-card>
    </div>

    <div v-if="hasHttpData" class="col-12 col-md-6">
      <q-card flat bordered class="toplist-card q-pa-lg text-white" style="height: 100%">
        <div class="row items-center q-mb-md">
          <q-icon name="http" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">HTTP</div>
            <div class="toplist-subtitle text-grey-5">Latencia p95 (ms) por statusCode, separado por método</div>
          </div>
        </div>
        <div class="http-radar-wrap">
          <canvas ref="httpRadarCanvas"></canvas>
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Series: por Día, Semana y Mes -->
  <div v-show="!loading" class="row q-col-gutter-md q-mb-md">
    <div class="col-sm-12 col-md-4">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="timeline" color="cyan" size="18px" class="q-mr-sm" />
          <div><div class="toplist-title">Eventos por Día</div></div>
        </div>
        <div class="chart-wrap">
          <canvas ref="eventsDayCanvas"></canvas>
        </div>
      </q-card>
    </div>

    <div class="col-sm-12 col-md-4">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="date_range" color="purple" size="18px" class="q-mr-sm" />
          <div><div class="toplist-title">Eventos por Semana</div></div>
        </div>
        <div class="chart-wrap">
          <canvas ref="eventsWeekCanvas"></canvas>
        </div>
      </q-card>
    </div>

    <div class="col-sm-12 col-md-4">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="calendar_month" color="pink" size="18px" class="q-mr-sm" />
          <div><div class="toplist-title">Eventos por Mes</div></div>
        </div>
        <div class="chart-wrap">
          <canvas ref="eventsMonthCanvas"></canvas>
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Mapa geográfico -->
  <div v-if="hasGeoData" class="q-mt-xl">
    <ConsoleGeoMap :points="geoPoints" @select-point="onGeoClick" />
  </div>

  <q-inner-loading
    :showing="loading"
    label="Cargando..."
    dark
    label-class="text-teal"
    label-style="font-size: 1.1em"
  >
    <q-spinner-gears size="50px" color="orange-9" />
  </q-inner-loading>
</template>

<script setup>
import { ref, computed, inject, watch, /* onMounted, */ nextTick, onBeforeUnmount } from 'vue'
import ConsoleGeoMap from '../blocks/ConsoleGeoMap.vue'
import Chart from 'chart.js/auto'
import DashboardService from 'src/services/dashboardService'

// ─── Injects ──────────────────────────────────────────────────────────────────
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const openConsole     = inject('openConsole', null)

// ─── Estado único de carga ────────────────────────────────────────────────────
const loading = ref(false)

// ─── Datos de los 4 endpoints ────────────────────────────────────────────────
const statsData  = ref(null)
const seriesData = ref(null)
const httpData   = ref(null)
const geoData    = ref(null)

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

// ─── Query key unificado ──────────────────────────────────────────────────────
// Un solo computed agrupa los tres parámetros relevantes.
// El watch sobre este string es la única fuente que dispara fetchAll.
const queryKey = computed(() => {
  const sys  = String(filtrosGlobales.value?.system || '').trim()
  const from = filtrosGlobales.value?.rangoFechas?.from || ''
  const to   = filtrosGlobales.value?.rangoFechas?.to   || ''
  return `${sys}|${from}|${to}`
})

// ─── fetchAll: orquesta los 4 endpoints en paralelo ───────────────────────────
async function fetchAll() {
  const sys  = String(filtrosGlobales.value?.system || '').trim()
  const from = toIsoStart(filtrosGlobales.value?.rangoFechas?.from || '')
  const to   = toIsoEnd(filtrosGlobales.value?.rangoFechas?.to   || '')

  if (!sys) return

  // Tomar número de secuencia para esta invocación
  const seq = ++fetchSeq

  loading.value = true
  // Limpiar datos anteriores para evitar mostrar stale UI mientras carga
  statsData.value  = null
  seriesData.value = null
  httpData.value   = null
  geoData.value    = null

  try {
    const [rStats, rSeries, rHttp, rGeo] = await Promise.allSettled([
      DashboardService.getStats({ system: sys, from, to }),
      DashboardService.getSeries({ system: sys }),
      DashboardService.getHttp({ system: sys }),
      DashboardService.getGeo({ system: sys }),
    ])

    // Descartar si una petición más reciente ya inició
    if (seq !== fetchSeq) return

    statsData.value  = rStats.status  === 'fulfilled' ? (rStats.value  ?? null) : null
    seriesData.value = rSeries.status === 'fulfilled' ? (rSeries.value ?? null) : null
    httpData.value   = rHttp.status   === 'fulfilled' ? (rHttp.value   ?? null) : null
    geoData.value    = rGeo.status    === 'fulfilled' ? (rGeo.value    ?? null) : null

  } catch (err) {
    if (seq !== fetchSeq) return
    console.error('❌ Dashboard fetchAll error:', err.message)
  } finally {
    if (seq === fetchSeq) {
      loading.value = false
      await nextTick()
      redrawCharts()
    }
  }
}

// ─── Flags derivados de la API ────────────────────────────────────────────────
const hasHttpData = computed(() => !!(httpData.value?.latencyByStatusAndMethod?.length))
const hasGeoData  = computed(() => !!(geoData.value?.points?.length))

// ─── Helpers de consola ───────────────────────────────────────────────────────
const selectedEventType = computed(() => filtrosGlobales.value?.values?.eventType || '')

function onEventTypeCardClick(eventType) {
  if (typeof openConsole === 'function') return openConsole({ fieldKey: 'eventType', value: eventType })
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail: { fieldKey: 'eventType', value: eventType } }))
}

function openConsoleWithFilter(fieldKey, value) {
  if (typeof openConsole === 'function') return openConsole({ fieldKey, value })
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail: { fieldKey, value } }))
}

// ─── Geo ──────────────────────────────────────────────────────────────────────
// Transformación directa: {lat, lon, count} → {lat, lon, weight}
// Sin agregación en frontend, tal como devuelve el endpoint /geo.
const geoPoints = computed(() =>
  (geoData.value?.points || []).map(p => ({ lat: p.lat, lon: p.lon, weight: p.count }))
)

function onGeoClick({ lat, lon }) {
  openConsole?.({ fieldKey: 'geo.coordinates', value: `${lat},${lon}` })
}

// ─── Dashboard stats helpers ──────────────────────────────────────────────────
const FUNC_COLORS = [
  { q: 'teal',   hex: '#29d3c2' }, { q: 'pink',   hex: '#ff5c8a' },
  { q: 'orange', hex: '#ff9f43' }, { q: 'cyan',   hex: '#22d3ee' },
  { q: 'purple', hex: '#a78bfa' }, { q: 'amber',  hex: '#fbbf24' },
  { q: 'green',  hex: '#22c55e' }, { q: 'red',    hex: '#ef4444' },
]

const normalizeStatRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    label: String(row?.value ?? row?.label ?? 'N/A'),
    count: Number(row?.count || 0),
    pct:   Number(row?.pct   || 0),
  }))

const toApiTopList = (rows, { topN = 4 } = {}) => {
  const list = normalizeStatRows(rows).slice(0, topN)
  if (!list.length) return { items: [] }
  const max = Math.max(...list.map((x) => x.count || 0), 1)
  return {
    items: list.map((x) => ({
      label:      x.label,
      count:      x.count,
      pct:        x.pct,
      ratioToMax: (x.count || 0) / max,
    })),
  }
}

// ─── funcUsage ────────────────────────────────────────────────────────────────
const funcUsage = computed(() => {
  const total  = Number(statsData.value?.total || 0)
  const source = normalizeStatRows(statsData.value?.topEventTypes)

  if (!total || !source.length)
    return { total: 0, items: [], donutSegments: [], coveragePct: 0, topName: '', topPct: 0 }

  const topN    = 6
  const top     = source.slice(0, topN)
  const topSum  = top.reduce((s, x) => s + x.count, 0)
  const rest    = Math.max(0, total - topSum)

  const topItems = top.map((item, idx) => {
    const color = FUNC_COLORS[idx % FUNC_COLORS.length]
    const ratio = total ? item.count / total : 0
    return {
      name:   item.label,
      count:  item.count,
      ratio,
      pct:    Number(item.pct || Math.round(ratio * 1000) / 10),
      qColor: color.q,
      color:  color.hex,
    }
  })

  const donutSegments = [...topItems]
  if (rest > 0) {
    donutSegments.push({
      name: 'Otros', count: rest,
      ratio:  total ? rest / total : 0,
      pct:    Math.round((rest / total || 0) * 1000) / 10,
      qColor: 'grey', color: '#6b7280',
    })
  }

  const topOne = topItems[0]
  return {
    total, items: topItems, donutSegments,
    coveragePct: Math.round((topSum / total || 0) * 1000) / 10,
    topName: topOne?.name || '',
    topPct:  topOne?.pct  || 0,
  }
})

const donutCenterPct   = computed(() => `${Math.round(Number(funcUsage.value?.coveragePct || 0))}%`)
const donutCenterLabel = computed(() => {
  const segs = funcUsage.value?.donutSegments || []
  if (!segs.length) return 'Top'
  return segs.some((s) => s.name === 'Otros') ? 'Cobertura' : 'Distribución'
})
const donutStyle = computed(() => {
  const segs = funcUsage.value?.donutSegments || []
  if (!segs.length) return { background: 'conic-gradient(rgba(255,255,255,0.10) 0 100%)' }
  let acc = 0
  const stops = []
  for (const s of segs) {
    const start = acc
    const delta = (Number(s.ratio) || 0) * 100
    acc = start + delta
    stops.push(`${s.color} ${start}% ${acc}%`)
  }
  if (acc < 100) stops.push(`rgba(255,255,255,0.10) ${acc}% 100%`)
  return { background: `conic-gradient(${stops.join(', ')})` }
})

const topOffices  = computed(() => toApiTopList(statsData.value?.topLocations, { topN: 4 }))
const topTags     = computed(() => toApiTopList(statsData.value?.topTags,      { topN: 3 }))
const topOutcomes = computed(() => toApiTopList(statsData.value?.outcomes,     { topN: 3 }))

// ─── Severity pie (Chart.js) ──────────────────────────────────────────────────
const severityPieCanvas = ref(null)
let   severityPieChart  = null

const SEVERITY_ORDER  = ['DEBUG', 'INFO', 'WARN', 'WARNING', 'ERROR', 'FATAL', 'CRITICAL', 'N/A']
const SEVERITY_COLORS = {
  DEBUG: '#94a3b8', INFO: '#22d3ee', WARN: '#ff9f43', WARNING: '#ff9f43',
  ERROR: '#ef4444', FATAL: '#ff5c8a', CRITICAL: '#a78bfa', 'N/A': '#6b7280',
}

function getSeverityRows() {
  return normalizeStatRows(statsData.value?.severities)
    .map((row) => ({ label: String(row.label || 'N/A').toUpperCase(), count: row.count }))
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

  if (severityPieChart) { severityPieChart.destroy(); severityPieChart = null }

  const rows = getSeverityRows()
  if (!rows.length) return

  const labels = rows.map((r) => r.label)
  const data   = rows.map((r) => r.count)
  const colors = labels.map((l) => SEVERITY_COLORS[l] || '#29d3c2')
  const total  = data.reduce((s, x) => s + x, 0) || 1

  severityPieChart = new Chart(el.getContext('2d'), {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'rgba(15,20,32,0.85)', borderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
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
        legend:  { position: 'bottom', labels: { color: 'rgba(255,255,255,0.75)', boxWidth: 10 } },
        tooltip: {
          titleColor: '#fff', bodyColor: '#fff',
          callbacks: { label: (ctx) => `${ctx.label}: ${Number(ctx.parsed || 0)} (${Math.round((ctx.parsed / total) * 1000) / 10}%)` },
        },
      },
    },
  })
}

// ─── HTTP Radar (Chart.js) ────────────────────────────────────────────────────
const httpRadarCanvas = ref(null)
let   httpRadarChart  = null

const HTTP_METHOD_COLORS = {
  GET: '#22d3ee', POST: '#a78bfa', PUT: '#ff5c8a', DELETE: '#fbbf24',
}

function buildHttpRadarFromApi(items = []) {
  const statusSet = new Set()
  const methodSet = new Set()
  const map       = {}

  items.forEach(({ statusCode, method, p95Ms }) => {
    statusSet.add(statusCode)
    methodSet.add(method)
    if (!map[method]) map[method] = {}
    map[method][statusCode] = p95Ms
  })

  const labels   = Array.from(statusSet).sort()
  const datasets = Array.from(methodSet).map((method) => ({
    label:           method,
    data:            labels.map((code) => map[method]?.[code] || 0),
    borderColor:     HTTP_METHOD_COLORS[method] || '#999',
    backgroundColor: (HTTP_METHOD_COLORS[method] || '#999') + '33',
  }))

  return { labels, datasets }
}

async function renderHttpRadar() {
  await nextTick()
  const el = httpRadarCanvas.value
  if (!el) return

  if (httpRadarChart) { httpRadarChart.destroy(); httpRadarChart = null }

  if (!httpData.value?.latencyByStatusAndMethod?.length) return

  httpRadarChart = new Chart(el, {
    type: 'radar',
    data: buildHttpRadarFromApi(httpData.value.latencyByStatusAndMethod),
    options: {
      responsive: true, maintainAspectRatio: false,
      onClick: (_, elements) => {
        if (!elements.length) return
        const el   = elements[0]
        const ds   = httpRadarChart.data.datasets[el.datasetIndex]
        const code = httpRadarChart.data.labels[el.index]
        openConsole?.([
          { fieldKey: 'http.method',     value: ds.label },
          { fieldKey: 'http.statusCode', value: code },
        ])
      },
      plugins: {
        legend:  { position: 'bottom', labels: { color: 'rgba(255,255,255,0.75)', boxWidth: 10 } },
        tooltip: {
          titleColor: '#fff', bodyColor: '#fff',
          callbacks: { label: (ctx) => `${ctx.dataset.label}: p95 ${ctx.parsed.r} ms` },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks:       { color: 'rgb(255,255,255)', backdropColor: 'transparent', backdropPadding: 0 },
          grid:        { color: 'rgba(255,255,255,0.06)' },
          angleLines:  { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { color: 'rgba(255,255,255,0.75)' },
        },
      },
    },
  })
}

// ─── Status over time (Chart.js line) ────────────────────────────────────────
const statusLineCanvas = ref(null)
let   statusLineChart  = null

function buildStatusSeriesFromApi(items = []) {
  const map      = {}
  const dates    = new Set()
  const statuses = new Set()

  items.forEach(({ date, status, count }) => {
    dates.add(date)
    statuses.add(status)
    if (!map[status]) map[status] = {}
    map[status][date] = count
  })

  const labels   = Array.from(dates).sort()
  const datasets = Array.from(statuses).map((status) => ({
    label: status,
    data:  labels.map((d) => map[status]?.[d] || 0),
    tension: 0.35,
    fill:    false,
    pointRadius:      3,
    pointHoverRadius: 5,
  }))

  return { labels, datasets }
}

async function renderStatusLine() {
  await nextTick()
  const el = statusLineCanvas.value
  if (!el) return

  if (statusLineChart) { statusLineChart.destroy(); statusLineChart = null }

  if (!seriesData.value?.statusOverTime?.length) return

  statusLineChart = new Chart(el, {
    type: 'line',
    data: buildStatusSeriesFromApi(seriesData.value.statusOverTime),
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend:  { position: 'bottom', labels: { color: 'rgba(255,255,255,0.75)', boxWidth: 10 } },
        tooltip: {
          titleColor: '#fff', bodyColor: '#fff',
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} eventos` },
        },
      },
      onClick: (_, elements) => {
        if (!elements.length) return
        const el     = elements[0]
        const ds     = statusLineChart.data.datasets[el.datasetIndex]
        const date   = statusLineChart.data.labels[el.index]
        openConsole?.([
          { fieldKey: 'status',    value: ds.label },
          { fieldKey: 'rangoFechas', value: { from: date, to: date } },
        ])
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  })
}

// ─── Series temporales: día / semana / mes ────────────────────────────────────
const eventsDayCanvas   = ref(null)
const eventsWeekCanvas  = ref(null)
const eventsMonthCanvas = ref(null)
let   eventsDayChart    = null
let   eventsWeekChart   = null
let   eventsMonthChart  = null

const SERIES_COLORS = { day: '#22d3ee', week: '#a78bfa', month: '#ff5c8a', year: '#fbbf24' }

const LINE_SCALE_OPTS = {
  x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
}

function buildSimpleSeries(items = [], color = '#22d3ee') {
  return {
    labels: items.map((i) => i.date),
    datasets: [{
      label:           'Eventos',
      data:            items.map((i) => i.count),
      borderColor:     color,
      backgroundColor: color + '33',
      tension:         0.35,
      fill:            false,
      pointRadius:      3,
      pointHoverRadius: 5,
    }],
  }
}

// ─── Helpers de rango de fechas para click en series ─────────────────────────
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
    const jan4     = new Date(year, 0, 4)
    const dow      = jan4.getDay() || 7       // 1=Lun … 7=Dom
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
  const year  = parseInt(parts[1])
  const month = parseInt(parts[0]) - 1
  const mm    = String(month + 1).padStart(2, '0')
  const from  = `${parts[1]}-${mm}-01`
  const to    = `${parts[1]}-${mm}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
  return { from, to }
}

async function renderSimpleLineChart(canvasRef, existingChart, rows, color, onClickFn = null) {
  await nextTick()
  const el = canvasRef.value
  if (!el) return null
  if (existingChart) { existingChart.destroy() }
  if (!rows?.length) return null

  const clickOpts = onClickFn
    ? {
        onHover: (event, activeEls) => {
          const t = event?.native?.target
          if (t) t.style.cursor = activeEls?.length ? 'pointer' : 'default'
        },
        onClick: (_, activeEls, chart) => {
          if (!activeEls?.length) return
          const date = chart.data.labels?.[activeEls[0].index]
          if (date) onClickFn(date)
        },
      }
    : {}

  return new Chart(el, {
    type: 'line',
    data: buildSimpleSeries(rows, color),
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: LINE_SCALE_OPTS,
      ...clickOpts,
    },
  })
}

async function renderSeriesCharts() {
  eventsDayChart   = await renderSimpleLineChart(
    eventsDayCanvas,   eventsDayChart,   seriesData.value?.byDay,   SERIES_COLORS.day,
    (date) => openConsole?.([{ fieldKey: 'rangoFechas', value: dayRange(date) }]),
  )
  eventsWeekChart  = await renderSimpleLineChart(
    eventsWeekCanvas,  eventsWeekChart,  seriesData.value?.byWeek,  SERIES_COLORS.week,
    (date) => openConsole?.([{ fieldKey: 'rangoFechas', value: weekRange(date) }]),
  )
  eventsMonthChart = await renderSimpleLineChart(
    eventsMonthCanvas, eventsMonthChart, seriesData.value?.byMonth, SERIES_COLORS.month,
    (date) => openConsole?.([{ fieldKey: 'rangoFechas', value: monthRange(date) }]),
  )
}

// ─── redrawCharts: punto único de re-render ───────────────────────────────────
async function redrawCharts() {
  renderSeverityPieChart()
  renderStatusLine()
  renderSeriesCharts()
  if (hasHttpData.value) renderHttpRadar()
}

// ─── Watch único: cualquier cambio en sistema o rango dispara fetchAll ─────────
watch(queryKey, (val, old) => {
  if (val !== old) fetchAll()
}, { immediate: true })

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onBeforeUnmount(() => {
  severityPieChart?.destroy()
  statusLineChart?.destroy()
  httpRadarChart?.destroy()
  eventsDayChart?.destroy()
  eventsWeekChart?.destroy()
  eventsMonthChart?.destroy()
})
</script>

<style lang="scss" scoped>
.func-wrap {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 18px;
  box-shadow: 0 8px 26px rgba(255, 125, 50, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.func-subcard {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.func-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.donut {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.donut-inner {
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background: #0f1420;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  text-align: center;
}

.donut-pct {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  margin-top: 5px;
}

.donut-sub {
  font-size: 10px;
  margin-top: -20px;
}

.toplist-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.45);
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
  transition: background 120ms ease, transform 120ms ease, border-color 120ms ease;
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
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
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
.status-line-wrap canvas {
  width: 100% !important;
  height: 100% !important;
  cursor: pointer;
}

.severity-pie-wrap {
  height: 450px;
}
.severity-pie-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.http-radar-wrap {
  height: 520px;
}
.http-radar-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-wrap {
  height: 280px;
}
.chart-wrap canvas {
  width: 100% !important;
  height: 100% !important;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 140ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
