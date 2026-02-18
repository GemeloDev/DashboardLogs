<template>
  <q-card class="enhanced-graphics-container q-pa-md">
    <div class="text-h6 row items-center q-mb-lg text-white">
      <q-icon name="dashboard" size="28px" class="q-mr-sm" color="primary" />
      <span>Dashboard Dinámico</span>
      <q-space />
      <q-spinner v-if="loading" color="primary" size="24px" />
      <div v-else class="text-caption text-grey-5 q-ml-sm">
        {{ logsFiltrados.length }} registros procesados
        <q-btn-dropdown round color="secondary" icon="upload" class="no-arrow q-mr-xs">
          <q-list>
            <q-item clickable v-close-popup @click="exportPdfGraficas()">
              <q-item-section>
                <q-item-label>Resumen PDF</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- ✅ KPI CARDS (estilo screenshots) -->
    <div class="row q-gutter-y-md q-mb-lg justify-center">
      <q-card flat bordered class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm">
        <div class="column items-center">
          <q-icon name="format_list_numbered" color="primary" size="xl" />
          <div class="text-subtitle1 q-mt-sm">Total</div>
          <div class="text-h5">{{ kpis.total }}</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.success"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="check_circle_outline" class="text-positive" size="xl" />
          <div class="text-subtitle1 q-mt-sm">Éxitos</div>
          <div class="text-h5">{{ kpis.success }}</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.failure"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="cancel" color="orange" size="xl" />
          <div class="text-subtitle1 q-mt-sm">Fallos</div>
          <div class="text-h5">{{ kpis.failure }}</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.errors"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="error_outline" color="red" size="xl" />
          <div class="text-subtitle1 q-mt-sm">Errores</div>
          <div class="text-h5">{{ kpis.errors }}</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.blocked"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="block" color="amber" size="xl" />
          <div class="text-subtitle1 q-mt-sm">Bloqueados</div>
          <div class="text-h5">{{ kpis.blocked }}</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.avgLatencyMs"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="speed" color="blue" size="xl" />
          <div class="text-subtitle2 q-mt-sm">Avg Latencia</div>
          <div class="text-h5">{{ kpis.avgLatencyMs }} ms</div>
        </div>
      </q-card>

      <q-card
        v-if="kpis.p95LatencyMs"
        flat
        bordered
        class="kpi-card col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
      >
        <div class="column items-center">
          <q-icon name="query_stats" color="cyan" size="xl" />
          <div class="text-subtitle2 q-mt-sm">P95 Latencia</div>
          <div class="text-h5">{{ kpis.p95LatencyMs }} ms</div>
        </div>
      </q-card>
    </div>

    <!-- ✅ GOLD CHARTS con distribución jerárquica -->
    <div v-if="!loading" class="row q-col-gutter-md">
      <div
        v-for="(def, i) in goldChartDefs"
        :key="def.id"
        :class="i === 0 ? 'col-12 col-lg-8' : 'col-12 col-md-6 col-lg-4'"
      >
        <DynamicChartCard :definition="def" :logs="logsFiltrados" :ref="setChartRef(`gold:${def.id}`)" :color-index="i" />
      </div>
    </div>

    <!-- ✅ EXTRA CHARTS con mosaico -->
    <div v-if="!loading && extraFields.length" class="row q-col-gutter-md q-mt-md">
      <div class="col-12">
        <div class="text-subtitle1 text-grey-4 q-mb-sm">Métricas seleccionadas</div>
      </div>

      <div
        v-for="(field, idx) in extraFields"
        :key="field"
        :class="idx < 2 ? 'col-12 col-md-6 col-lg-6' : 'col-12 col-md-4'"
      >
        <DynamicChartCard :field-key="field" :logs="logsFiltrados" :ref="setChartRef(`gold:${field}`)" :color-index="idx + 20" />
      </div>
    </div>

    <div v-if="!loading && !goldChartDefs.length" class="col-12 text-center q-pa-xl text-grey-5">
      <q-icon name="tune" size="48px" />
      <div class="text-h6">No hay datos suficientes para gráficas</div>
      <div>Revisa el rango de fechas o la fuente de logs.</div>
    </div>

    <div v-if="hasGeoLogs" class="q-mt-md">
      <ConsoleGeoMap :logs="logsFiltrados" />
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, inject /* nextTick */ } from 'vue'
import DynamicChartCard from '../blocks/DynamicChartCard.vue'
import ExportService from 'src/services/exportService'
import ConsoleGeoMap from '../blocks/ConsoleGeoMap.vue'

const loading = ref(false)
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const logsGlobales = inject('logsGlobales', ref([]))
const chartRefs = ref(new Map())

const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

const hasField = (items, path) => {
  for (const it of items || []) {
    const v = getDeep(it, path)
    if (v != null && v !== '') return true
  }
  return false
}

const setChartRef = (key) => (el) => {
  //  Llamar al componente en mount, y con null en unMount
  if (el) chartRefs.value.set(key, el)
  else chartRefs.value.delete(key)
}

function exportPdfGraficas() {
  const charts = (chartRefs.value || [])
    .map((c) => ({
      title: c?.title || 'Gráfica',
      image: c?.getChartPng?.({ withLegend: true }), // 👈 aquí
    }))
    .filter(x => x.image)

  ExportService.exportConsoleChartsPDF({
    title: 'Reporte de Consola',
    subtitle: 'KPIs por status + gráficas',
    logs: logsFiltrados.value,
    charts
  })
}

const logsFiltrados = computed(() => {
  let out = logsGlobales.value || []

  const values = filtrosGlobales.value?.values || {}
  const search = (filtrosGlobales.value?.busqueda || '').trim().toLowerCase()

  // selects
  out = out.filter((log) => {
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue
      if (String(getDeep(log, k)) !== String(v)) return false
    }
    return true
  })

  // búsqueda global
  if (search) out = out.filter((l) => JSON.stringify(l).toLowerCase().includes(search))

  return out
})

const parseGeoLight = (geo) => {
  if (!geo) return null

  // GeoJSON Point
  if (typeof geo === 'object' && geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
    const [lng, lat] = geo.coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  // {lat,lng} | {lat,lon} | {latitude,longitude}
  if (typeof geo === 'object' && !Array.isArray(geo)) {
    const lat = Number(geo.lat ?? geo.latitude)
    const lng = Number(geo.lng ?? geo.lon ?? geo.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  // Array [a,b]
  if (Array.isArray(geo) && geo.length >= 2) {
    const a = Number(geo[0]), b = Number(geo[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null
    // deducción por rangos
    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lng: b }
    if (bIsLat) return { lat: b, lng: a }
  }

  // String "lat,lng"
  if (typeof geo === 'string') {
    const parts = geo.split(',').map((s) => Number(s.trim()))
    if (parts.length === 2 && parts.every(Number.isFinite)) {
      const [a, b] = parts
      const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
      const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
      if (aIsLat) return { lat: a, lng: b }
      if (bIsLat) return { lat: b, lng: a }
    }
  }

  return null
}

const logsConGeo = computed(() =>
  (logsFiltrados.value || []).filter((l) => !!parseGeoLight(l.geo))
)

const hasGeoLogs = computed(() => logsConGeo.value.length > 0)

// -----------------------
// “Campos oro” (catálogo)
// -----------------------
const GOLD_CATEGORICAL = [
  'eventType',
  'status',
  'outcome',
  'severity',
  'environment',
  'location.country',
  'location.city',
  'location.name',
  'http.method',
  'http.path',
  'http.statusCode',
  'reason.code',
  'payload.paymentMethod',
  'payload.currency',
  'payload.customer.segment',
  'meta.operatorShift',
  'tags', // array -> conteo por tag
]

// const GOLD_NUMERIC = [
//   'http.latencyMs',
//   'sla.elapsedSeconds',
//   'payload.amount',
//   'payload.risk.score',
//   'payload.attemptsLast10Min',
//   'geo.accuracyMeters',
// ]

const blacklist = new Set([
  'id',
  'tenantId',
  'schemaVersion',
  'message',
  'meta.requestId',
  'system',
  'caseId',
  'correlation.requestId',
  'correlation.traceId',
  'correlation.spanId',
  'payload.maskedPan',
  'geo.coordinates',
])

// -----------------------
// KPI cards
// -----------------------
const percentile = (arr, p) => {
  if (!arr.length) return 0
  const a = [...arr].sort((x, y) => x - y)
  const idx = Math.ceil((p / 100) * a.length) - 1
  return a[Math.max(0, Math.min(a.length - 1, idx))]
}

const kpis = computed(() => {
  const items = logsFiltrados.value || []
  const total = items.length

  const success = items.filter(
    (l) => String(getDeep(l, 'status')).toUpperCase() === 'SUCCESS' || String(getDeep(l, 'outcome')).toUpperCase() === 'SUCCESS',
  ).length
  const failure = items.filter(
    (l) => String(getDeep(l, 'severity')).toUpperCase() === 'CRITICAL' || String(getDeep(l, 'outcome')).toUpperCase() === 'CANCELED',
  ).length
  const errors = items.filter((l) => String(getDeep(l, 'status')).toUpperCase() === 'ERROR' || String(getDeep(l, 'outcome')).toUpperCase() === 'FAILURE').length

  const blocked = items.filter((l) => {
    const code = Number(getDeep(l, 'http.statusCode'))
    const tags = getDeep(l, 'tags')
    const hasBlockedTag =
      Array.isArray(tags) && tags.map((x) => String(x).toLowerCase()).includes('blocked')
    return code === 403 || hasBlockedTag
  }).length

  const lat = items
    .map((l) => Number(getDeep(l, 'http.latencyMs')))
    .filter((n) => Number.isFinite(n))

  const avgLatencyMs = lat.length ? Math.round(lat.reduce((s, x) => s + x, 0) / lat.length) : 0
  const p95LatencyMs = lat.length ? Math.round(percentile(lat, 95)) : 0

  return { total, success, failure, errors, blocked, avgLatencyMs, p95LatencyMs }
})

// -----------------------
// Gold chart defs
// -----------------------
const goldChartDefs = computed(() => {
  const items = logsFiltrados.value || []

  const defs = []

  // Conteos “oro” (solo si el campo existe en los datos)
  const addCat = (id, field, title, icon) => {
    if (hasField(items, field)) defs.push({ id, mode: 'categorical', field, title, icon, topN: 10 })
  }

  addCat('eventType', 'eventType', 'Funcionalidades más usadas', 'apps')
  addCat('outcome', 'outcome', 'Resultado del Evento', 'check_circle')
  addCat('severity', 'severity', 'Severidad', 'warning')
  addCat('location', 'location.name', 'Oficinas', 'apartment')
  addCat('httpStatus', 'http.statusCode', 'HTTP Status', 'http')
  addCat('reason', 'reason.code', 'Top Razones', 'report_problem')
  addCat('tags', 'tags', 'Etiquetas', 'tag')

  // Tiempo promedio (avg latencyMs por eventType) tipo tu screenshot
  if (hasField(items, 'http.latencyMs') && hasField(items, 'eventType')) {
    defs.push({
      id: 'avgLatencyByType',
      mode: 'numericByCategory',
      title: 'Tiempo de Respuesta Promedio',
      icon: 'speed',
      groupBy: 'eventType',
      valueKey: 'http.latencyMs',
      agg: 'avg',
      datasetLabel: 'Tiempo Promedio',
      unit: 'ms',
      yTitle: 'Milisegundos',
      topN: 10,
    })
  }

  // Serie de tiempo + acumulado (día)
  if (hasField(items, 'eventTime')) {
    defs.push({
      id: 'eventsByDay',
      mode: 'timeseries',
      title: 'Eventos por Día y Acumulado',
      icon: 'timeline',
      timeKey: 'eventTime',
      timeBucket: 'day',
    })
  }

  // Serie por semana (opcional, se ve como tu gráfica de semanas)
  if (hasField(items, 'eventTime')) {
    defs.push({
      id: 'eventsByWeek',
      mode: 'timeseries',
      title: 'Eventos por Semana y Acumulado',
      icon: 'date_range',
      timeKey: 'eventTime',
      timeBucket: 'week',
    })
  }

  return defs
})

// -----------------------
// Extras seleccionados en DinamicFilters (pero filtrados)
// -----------------------
const extraFields = computed(() => {
  const fields = filtrosGlobales.value?.visibleFields || []

  // Solo oro + no blacklist
  const allowed = fields
    .filter((f) => !blacklist.has(f))
    .filter((f) => GOLD_CATEGORICAL.includes(f)) // extras solo categóricos (para evitar ruido)

  // Evitar duplicados con los gold charts fijos
  const goldShown = new Set(goldChartDefs.value.map((d) => d.field).filter(Boolean))
  return allowed.filter((f) => !goldShown.has(f))
})

// styling de KPI cards
</script>

<style lang="scss" scoped>
.enhanced-graphics-container {
  background: linear-gradient(145deg, #121826, #1a1f2e);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 85vh;
  padding: 24px;
}

.kpi-card {
  background: linear-gradient(160deg, #1e1e2f, #2a2f45);
  border-radius: 14px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  text-align: center;
}
.kpi-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.6);
}

.kpi-card .text-h5 {
  font-weight: 600;
  color: #fff;
}

.q-toolbar-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
}
.no-arrow :deep(.q-btn-dropdown__arrow-container) {
  display: none;
}
</style>
