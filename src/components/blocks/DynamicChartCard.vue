<template>
  <q-card :class="['enhanced-chart-card h-100', { 'is-donut': showDonutCards }]">
    <q-card-section class="chart-header q-pb-none">
      <div class="row items-center">
        <q-icon :name="iconName" size="24px" class="q-mr-sm" :style="{ color: accentColor }" />

        <div class="chart-title">
          <div class="text-subtitle text-weight-bold text-white">
            {{ title }}
          </div>

          <div class="text-caption text-grey-5">
            <template v-if="mode === 'categorical'"> {{ uniqueCount }} valores únicos </template>
            <template v-else-if="mode === 'numericByCategory'">
              {{ groupByLabel }} • {{ aggLabel }}
            </template>
            <template v-else>
              {{ timeLabel }}
            </template>
          </div>
        </div>

        <q-space />

        <q-chip dense color="grey-9" text-color="grey-4" size="sm"> Total: {{ totalLogs }} </q-chip>
      </div>
    </q-card-section>

    <q-card-section class="chart-content relative-position">
      <!-- Área fija para el canvas (para que el donut quede centrado como en tu imagen) -->
      <div class="chart-wrap relative-position">
        <canvas ref="chartCanvas"></canvas>

        <div v-if="!hasData" class="absolute-full flex flex-center text-grey-6 bg-transparent">
          <div class="text-center">
            <q-icon name="bar_chart" size="40px" style="opacity: 0.3" />
            <div class="text-caption">Sin datos para mostrar</div>
          </div>
        </div>
      </div>

      <!-- Tarjetas “pie” (solo cuando es donut) -->
      <div v-if="showDonutCards" class="donut-cards q-mt-md">
        <div
          v-for="it in donutCards"
          :key="it.label"
          class="donut-card"
          :style="donutCardStyle(it.color)"
        >
          <div class="row items-center no-wrap donut-card-top">
            <q-icon name="lens" size="14px" class="q-mr-sm" :style="{ color: it.color }" />
            <div class="donut-card-value">{{ it.value }}</div>
          </div>

          <div class="donut-card-label">
            {{ it.label }}
          </div>
        </div>
      </div>

      <!-- Barra “Total” estilo screenshot (opcional, si no la quieres bórrala) -->
      <div v-if="showDonutCards" class="donut-total q-mt-sm">Total: {{ totalLogs }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useConsoleFiltersStore } from 'src/stores/consoleFilters.store'

const props = defineProps({
  // modo “legacy”
  fieldKey: { type: String, default: '' },
  logs: { type: Array, default: () => [] },
  colorIndex: { type: Number, default: 0 },

  // modo “nuevo”
  definition: { type: Object, default: null },
})

const consoleStore = useConsoleFiltersStore()

const chartCanvas = ref(null)
let chartInstance = null

// ---------------------------
// Helpers
// ---------------------------
const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v)
const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const pad2 = (n) => String(n).padStart(2, '0')
const toYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const percentile = (arr, p) => {
  if (!arr.length) return null
  const a = [...arr].sort((x, y) => x - y)
  const idx = Math.ceil((p / 100) * a.length) - 1
  return a[Math.max(0, Math.min(a.length - 1, idx))]
}

const pushValue = (v, list) => {
  if (v == null) return
  if (Array.isArray(v)) return v.forEach((x) => pushValue(x, list))
  if (typeof v === 'object') return
  list.push(String(v))
}

const formatLabel = (key) =>
  String(key || '')
    .replace(/\./g, ' › ')
    .replace(/([A-Z])/g, ' $1')
    .trim()

// HEX -> RGBA (para fondos de tarjetas)
const hexToRgba = (hex, a = 0.18) => {
  const h = String(hex || '')
    .replace('#', '')
    .trim()
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// ---------------------------
// Paleta / estética
// ---------------------------
const accentPalette = ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26C6DA', '#FFCA28']

const donutColors = ['#4CAF50', '#F44336', '#FFC107', '#2196F3', '#9C27B0', '#00BCD4', '#FF9800']

const accentColor = computed(() => accentPalette[props.colorIndex % accentPalette.length])

const latencyColor = (ms) => {
  if (!isNumber(ms)) return '#666'
  if (ms < 300) return '#66BB6A'
  if (ms < 400) return '#FFA726'
  return '#EF5350'
}

// ---------------------------
// Modo / definición
// ---------------------------
const mode = computed(() => props.definition?.mode || 'categorical')
const field = computed(() => props.definition?.field || props.fieldKey)

const title = computed(() => props.definition?.title || formatLabel(field.value))
const iconName = computed(() => props.definition?.icon || getIconForField(field.value))

const groupByLabel = computed(() => formatLabel(props.definition?.groupBy || ''))
const aggLabel = computed(() => {
  const agg = props.definition?.agg || 'avg'
  return agg === 'p95' ? 'P95' : agg.toUpperCase()
})
const timeLabel = computed(() => {
  const g = props.definition?.timeBucket || 'day'
  return g === 'month'
    ? 'Por mes + acumulado'
    : g === 'week'
      ? 'Por semana + acumulado'
      : 'Por día + acumulado'
})

const totalLogs = computed(() => (props.logs || []).length)

// ---------------------------
// Data builders
// ---------------------------
function buildCategorical() {
  const counts = {}
  const items = props.logs || []

  for (const log of items) {
    const raw = getDeep(log, field.value)
    const values = []
    pushValue(raw, values)

    if (!values.length) values.push('N/A')

    for (const v of values) {
      const k = String(v || 'N/A').toUpperCase()
      counts[k] = (counts[k] || 0) + 1
    }
  }

  const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  const top = keys.slice(0, props.definition?.topN || 10)

  return {
    labels: top,
    data: top.map((k) => counts[k]),
    fullData: counts,
  }
}

function buildNumericByCategory() {
  const groupBy = props.definition?.groupBy
  const valueKey = props.definition?.valueKey
  const agg = props.definition?.agg || 'avg'
  const topN = props.definition?.topN || 10

  const buckets = new Map()
  const items = props.logs || []

  for (const log of items) {
    const g = getDeep(log, groupBy)
    const v = getDeep(log, valueKey)

    const gv = String(g ?? 'N/A').toUpperCase()
    const num = toNumber(v)
    if (num == null) continue

    if (!buckets.has(gv)) buckets.set(gv, [])
    buckets.get(gv).push(num)
  }

  const rows = []
  for (const [k, arr] of buckets.entries()) {
    let metric = null
    if (agg === 'p95') metric = percentile(arr, 95)
    else metric = arr.reduce((s, x) => s + x, 0) / arr.length

    rows.push({ key: k, metric, count: arr.length })
  }

  rows.sort((a, b) => (b.metric ?? 0) - (a.metric ?? 0))
  const top = rows.slice(0, topN).reverse()

  return {
    labels: top.map((r) => r.key),
    data: top.map((r) => Math.round(r.metric ?? 0)),
    meta: top,
  }
}

function buildTimeseries() {
  const timeKey = props.definition?.timeKey || 'eventTime'
  const bucket = props.definition?.timeBucket || 'day'

  const counts = new Map()
  const items = props.logs || []

  for (const log of items) {
    const raw = getDeep(log, timeKey)
    if (!raw) continue
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) continue

    let label = ''
    if (bucket === 'month') {
      label = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
    } else if (bucket === 'week') {
      const oneJan = new Date(d.getFullYear(), 0, 1)
      const dayOfYear = Math.floor((d - oneJan) / 86400000) + 1
      const week = Math.ceil(dayOfYear / 7)
      label = `Semana ${pad2(week)}-${d.getFullYear()}`
    } else {
      label = toYMD(d)
    }

    counts.set(label, (counts.get(label) || 0) + 1)
  }

  const labels = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b))
  const data = labels.map((l) => counts.get(l) || 0)

  const cum = []
  let acc = 0
  for (const v of data) {
    acc += v
    cum.push(acc)
  }

  return { labels, data, cum }
}

const chartPayload = computed(() => {
  if (mode.value === 'numericByCategory') return buildNumericByCategory()
  if (mode.value === 'timeseries') return buildTimeseries()
  return buildCategorical()
})

const hasData = computed(() => {
  if (mode.value === 'timeseries') return (chartPayload.value.labels || []).length > 0
  return (chartPayload.value.data || []).length > 0
})

const uniqueCount = computed(() => Object.keys(chartPayload.value.fullData || {}).length)

// Donut only: <= 5
const isDonut = computed(
  () => mode.value === 'categorical' && (chartPayload.value.labels || []).length <= 5,
)

const showDonutCards = computed(() => isDonut.value && hasData.value)

const donutCards = computed(() => {
  const p = chartPayload.value
  const labels = p.labels || []
  const data = p.data || []
  return labels.map((label, i) => ({
    label,
    value: data[i] ?? 0,
    color: donutColors[i % donutColors.length],
  }))
})

const donutCardStyle = (color) => ({
  borderLeftColor: color,
  background: hexToRgba(color, 0.16),
})

// ---------------------------
// Icon mapping
// ---------------------------
const getIconForField = (key) => {
  const k = String(key || '').toLowerCase()
  if (k.includes('status')) return 'rule'
  if (k.includes('outcome')) return 'check_circle'
  if (k.includes('sever')) return 'warning'
  if (k.includes('eventtype')) return 'category'
  if (k.includes('location') || k.includes('geo')) return 'place'
  if (k.includes('actor') || k.includes('user')) return 'person'
  if (k.includes('http.status')) return 'http'
  if (k.includes('latency') || k.includes('elapsed')) return 'speed'
  if (k.includes('reason')) return 'report_problem'
  return 'bar_chart'
}

// ---------------------------
// Render Chart.js
// ---------------------------
const renderChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = chartCanvas.value.getContext('2d')
  const payload = chartPayload.value

  // --- CATEGÓRICO ---
  if (mode.value === 'categorical') {
    const catCount = payload.labels.length
    const type = catCount <= 5 ? 'doughnut' : 'bar'
    const indexAxis = type === 'bar' ? (catCount >= 10 ? 'y' : 'x') : 'x'

    const usePerCategoryColors = type === 'doughnut' || (type === 'bar' && indexAxis === 'x')
    const bg = usePerCategoryColors
      ? payload.labels.map((_, i) => donutColors[i % donutColors.length])
      : '#42A5F5'

    chartInstance = new Chart(ctx, {
      type,
      data: {
        labels: payload.labels,
        datasets: [
          {
            label: 'Registros',
            data: payload.data,
            backgroundColor: bg,
            borderColor: '#2c2c44',
            borderWidth: 2,
            borderRadius: type === 'bar' ? 5 : 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis,

        onHover: (event, elements) => {
          const el = event?.native?.target
          if (el) el.style.cursor = elements?.length ? 'pointer' : 'default'
        },

        onClick: (event) => {
          //  solo tiene sentido categorico
          const points = chartInstance?.getElementsAtEventForMode(
            event,
            'nearest',
            { intersect: true },
            true,
          )

          if (!points?.length) return

          const idx = points[0].index
          const label = chartInstance.data.labels?.[idx]
          if (label == null) return
          console.log('ℹ️ Valor para filtros seleccionado: ', {
            fieldKey: field.value,
            value: String(label)
          })

          consoleStore.selectFromChart(field.value, String(label))
        },

        // Donut “look”
        cutout: type === 'doughnut' ? '58%' : undefined,

        plugins: {
          legend: {
            // ocultamos legend del chart y usamos tarjetas abajo
            display: type !== 'doughnut',
            position: 'right',
            labels: { color: '#fff', boxWidth: 12 },
          },
          tooltip: { enabled: true },
        },

        scales:
          type === 'bar'
            ? indexAxis === 'y'
              ? // Horizontal
                {
                  x: { grid: { color: '#444', ticks: { color: '#ccc' } } },
                  y: { grid: { display: false }, ticks: { color: '#ccc', autoSkip: false } },
                }
              : {
                  x: { grid: { display: false }, ticks: { color: '#ccc', autoSkip: false } },
                  y: { beginAtZero: true, grid: { color: '#444' }, ticks: { color: '#ccc' } },
                }
            : { x: { display: false }, y: { display: false } },

        devicePixelRatio: 2,
      },
    })

    return
  }

  // --- NUMÉRICO AGRUPADO ---
  if (mode.value === 'numericByCategory') {
    const valueKey = props.definition?.valueKey || ''
    const isLatency = String(valueKey).toLowerCase().includes('latency')
    const colors = payload.data.map((v) => (isLatency ? latencyColor(v) : accentColor.value))

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: payload.labels,
        datasets: [
          {
            label: props.definition?.datasetLabel || 'Métrica',
            data: payload.data,
            backgroundColor: colors,
            borderRadius: 5,
          },
        ],
      },
      options: {
        devicePixelRatio: 2,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#fff' } },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed.y
                const unit = props.definition?.unit || ''
                return `${props.definition?.datasetLabel || 'Valor'}: ${v}${unit ? ` ${unit}` : ''}`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#ccc', maxRotation: 25, minRotation: 0, font: { weight: 'bold' } },
            grid: { color: '#444' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
            title: props.definition?.yTitle
              ? {
                  display: true,
                  text: props.definition.yTitle,
                  color: '#ccc',
                  font: { weight: 'bold' },
                }
              : { display: false },
          },
        },
      },
    })
    return
  }

  // --- TIME SERIES + ACUMULADO ---
  const barColor = '#AB47BC'
  const lineColor = '#42A5F5'

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: payload.labels,
      datasets: [
        {
          type: 'bar',
          label: 'Eventos',
          data: payload.data,
          backgroundColor: barColor,
          borderRadius: 5,
        },
        {
          type: 'line',
          label: 'Acumulado',
          data: payload.cum,
          borderColor: lineColor,
          backgroundColor: 'transparent',
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      devicePixelRatio: 2,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: {
          ticks: { color: '#ccc', maxRotation: 25, minRotation: 0, font: { weight: 'bold' } },
          grid: { color: '#444' },
        },
        y: { beginAtZero: true, ticks: { color: '#ccc' }, grid: { color: '#444' } },
      },
    },
  })
}

// ---------------------------
// Lifecycle
// ---------------------------
watch(
  () => [props.logs, props.fieldKey, props.definition],
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  renderChart()
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})

defineExpose({
  getChartPng: (opts = {}) => {
    const { withLegend = false } = opts
    if (!chartInstance?.toBase64Image) {
      const canvas = chartCanvas.value
      return canvas ? canvas.toDataURL('image/png', 1) : null
    }

    // Solo para donut: prendemos legend temporal y lo hacemos con "label: value"
    if (withLegend && chartInstance.config?.type === 'doughnut') {
      const prevDisplay = chartInstance.options?.plugins?.legend?.display
      const prevGen = chartInstance.options?.plugins?.legend?.labels?.generateLabels
      const prevColor = chartInstance.options?.plugins?.legend?.labels?.color

      chartInstance.options.plugins.legend.display = true
      chartInstance.options.plugins.legend.position = 'right'
      chartInstance.options.plugins.legend.labels = chartInstance.options.plugins.legend.labels || {}
      chartInstance.options.plugins.legend.labels.color = '#111'

      chartInstance.options.plugins.legend.labels.generateLabels = (chart) => {
        const ds = chart.data.datasets?.[0]
        const data = ds?.data || []
        const bg = ds?.backgroundColor || []
        return (chart.data.labels || []).map((label, i) => ({
          text: `${label}: ${data[i] ?? 0}`,
          fillStyle: Array.isArray(bg) ? bg[i] : bg,
          strokeStyle: '#2c2c44',
          lineWidth: 1,
          hidden: false,
          index: i
        }))
      }

      chartInstance.update()

      const img = chartInstance.toBase64Image('image/png', 1)

      // restaurar
      chartInstance.options.plugins.legend.display = prevDisplay
      chartInstance.options.plugins.legend.labels.generateLabels = prevGen
      chartInstance.options.plugins.legend.labels.color = prevColor
      chartInstance.update()

      return img
    }

    return chartInstance.toBase64Image('image/png', 1)
  }
})

</script>

<style lang="scss" scoped>
.enhanced-chart-card {
  background: linear-gradient(145deg, #1e1e2f, #2c2c44);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.25s ease;
}
.enhanced-chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.7);
}

.chart-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
}

.chart-content {
  padding: 12px;
}

/* Área del canvas para centrar donut como en la imagen */
.chart-wrap {
  height: 240px;
}

/* Si es donut, reducimos un poquito el alto del canvas para que quepan tarjetas */
.enhanced-chart-card.is-donut .chart-wrap {
  height: 210px;
}

/* Tarjetas tipo “pie” */
.donut-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.donut-card {
  border-radius: 10px;
  padding: 10px 12px;
  border-left: 4px solid transparent;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

.donut-card-top {
  margin-bottom: 2px;
}

.donut-card-value {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.donut-card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.3px;
  text-transform: none;
}

/* Barra total estilo screenshot */
.donut-total {
  text-align: center;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
}
</style>
