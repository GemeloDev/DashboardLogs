<template>
  <q-card class="timechart-card">
    <q-card-section class="timechart-header q-pb-none">
      <div class="row items-center">
        <q-icon :name="iconName" size="20px" class="q-mr-sm" :style="{ color: accentColor }" />

        <div class="timechart-title">
          <div class="text-subtitle1 text-weight-bold text-white">
            {{ title }}
          </div>
          <div class="text-caption text-grey-5">
            {{ timeLabel }}
          </div>
        </div>

        <q-space />

        <q-chip dense color="grey-9" text-color="grey-4" size="sm"> Total: {{ totalLogs }} </q-chip>
      </div>
    </q-card-section>

    <q-card-section class="timechart-content">
      <div class="chart-wrap relative-position">
        <canvas ref="chartCanvas"></canvas>

        <div v-if="!hasData" class="absolute-full flex flex-center text-grey-6">
          <div class="text-center">
            <q-icon name="timeline" size="40px" style="opacity: 0.25" />
            <div class="text-caption">Sin datos para mostrar</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inject } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  logs: { type: Array, default: () => [] },
  definition: { type: Object, default: null },
  colorIndex: { type: Number, default: 0 },
})

const chartCanvas = ref(null)
let chartInstance = null
// ya existe en MainLayout: provide('openConsole', openConsole)
const openConsole = inject('openConsole', null)

// ---------- Helpers ----------
const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

const pad2 = (n) => String(n).padStart(2, '0')
const toYMDLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

// ISO week helpers (para ordenar bien semanas)
function getISOWeekYearAndWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}

// ---------- helpers fechas (YYYY-MM-DD) ----------
const endOfMonthYMD_Local = (year, month1to12) => {
  const dt = new Date(Number(year), Number(month1to12), 0)
  return toYMDLocal(dt)
}

function isoWeekStartYMD_Local(year, week) {
  const y = Number(year)
  const w = Number(week)
  const simple = new Date(y, 0, 1 + (w - 1) * 7)
  const dow = simple.getDay() // 0 dom..6 sab
  const monday = new Date(simple)
  const diff = dow <= 4 ? 1 - dow : 8 - dow
  monday.setDate(simple.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return toYMDLocal(monday)
}

function addDaysYMD_Local(ymd, days) {
  const [y, m, d] = String(ymd).split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + Number(days || 0))
  return toYMDLocal(dt)
}

function rangeFromKey(bucket, key) {
  const k = String(key || '').trim()

  if (bucket === 'day') {
    // YYYY-MM-DD
    return { from: k, to: k }
  }

  if (bucket === 'week') {
    // YYYY-W##
    const m = k.match(/^(\d{4})-W(\d{2})$/i)
    if (!m) return null
    const from = isoWeekStartYMD_Local(m[1], m[2])
    const to = addDaysYMD_Local(from, 6)
    return { from, to }
  }

  if (bucket === 'month') {
    // YYYY-MM
    const m = k.match(/^(\d{4})-(\d{2})$/)
    if (!m) return null
    const year = m[1]
    const mm = m[2]
    const from = `${year}-${mm}-01`
    const to = endOfMonthYMD_Local(year, Number(mm))
    return { from, to }
  }

  return null
}

// ---------- Aesthetic (1 color por gráfica) ----------
const BUCKET_COLORS = {
  day: '#22d3ee', // cyan (Oficinas vibe)
  week: '#a78bfa', // purple
  month: '#ff5c8a', // pink
  year: '#fbbf24', // amber
}

const accentColor = computed(() => BUCKET_COLORS[bucket.value] || '#22d3ee')

// ---------- Definition ----------
const timeKey = computed(() => props.definition?.timeKey || 'eventTime')
const bucket = computed(() => props.definition?.timeBucket || 'day')

const title = computed(() => props.definition?.title || 'Eventos por tiempo')
const iconName = computed(() => props.definition?.icon || 'timeline')

const timeLabel = computed(() => {
  const b = bucket.value
  if (b === 'year') return 'Por año'
  if (b === 'month') return 'Por mes'
  if (b === 'week') return 'Por semana'
  return 'Por día'
})

const totalLogs = computed(() => (props.logs || []).length)

const MONTHS_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function labelFromMonthKey(key /* YYYY-MM */) {
  const m = String(key).match(/^(\d{4})-(\d{2})$/)
  if (!m) return key
  const y = m[1]
  const mm = Number(m[2]) // 1..12
  const idx = Math.max(0, Math.min(11, mm - 1))
  return `${MONTHS_ES[idx]} ${y}` // "Feb 2026"
}

// ---------- Data builder: Timeseries ONLY ----------
function buildTimeseries() {
  const counts = new Map()
  const items = props.logs || []

  for (const log of items) {
    const raw = getDeep(log, timeKey.value)
    if (!raw) continue

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) continue

    let key = ''
    let label = ''

    if (bucket.value === 'year') {
      const y = d.getUTCFullYear()
      key = String(y)
      label = String(y)
    } else if (bucket.value === 'month') {
      const y = d.getFullYear()
      const mNum = d.getMonth() + 1
      const m = pad2(mNum)
      key = `${y}-${m}`
      label = labelFromMonthKey(key)
    } else if (bucket.value === 'week') {
      const { year, week } = getISOWeekYearAndWeek(d)
      const w = pad2(week)
      key = `${year}-W${w}`
      label = `Semana ${w}-${year}`
    } else {
      key = toYMDLocal(d)
      label = toYMDLocal(d)
    }

    const prev = counts.get(key)
    if (prev) prev.count += 1
    else counts.set(key, { label, count: 1 })
  }

  const keys = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b))
  const labels = keys.map((k) => counts.get(k)?.label || k)
  const data = keys.map((k) => counts.get(k)?.count || 0)

  return { keys, labels, data }
}

const chartPayload = computed(() => buildTimeseries())

const hasData = computed(() => (chartPayload.value.labels || []).length > 0)

// ---------- Render Chart.js (ONLY time series) ----------
const renderChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = chartCanvas.value.getContext('2d')
  const payload = chartPayload.value

  const lineColor = accentColor.value

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: payload.labels,
      datasets: [
        {
          label: 'Eventos',
          data: payload.data,
          borderColor: lineColor,
          backgroundColor: lineColor + '22', // alpha suave
          borderWidth: 2,
          tension: 0.35, // curva suave
          fill: false, // ✅ solo línea + puntos
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: lineColor,
          pointBorderColor: 'rgba(15,20,32,0.9)', // se ve bien en dark
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      devicePixelRatio: 2,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },

      plugins: {
        legend: { display: false }, // ✅ innecesario (solo 1 dataset)
        tooltip: {
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (ctx) => `Eventos: ${ctx.parsed.y}`,
          },
        },
      },

      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.60)', maxRotation: 0, autoSkip: true },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(255,255,255,0.55)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },

      onHover: (event, activeEls) => {
        const t = event?.native?.target
        if (t) t.style.cursor = activeEls?.length ? 'pointer' : 'default'
      },

      onClick: (event, activeEls, chart) => {
        const els = activeEls?.length
          ? activeEls
          : chart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, true)

        if (!els?.length) return

        const i = els[0].index ?? els[0].dataIndex
        const key = payload?.keys?.[i]
        if (!key) return

        const bucket = props.definition?.timeBucket
        const range = rangeFromKey(bucket, key)
        if (!range?.from) return

        openConsole?.([{ fieldKey: 'rangoFechas', value: range }])
      },
    },
  })
}

watch(
  () => [props.logs, props.definition],
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
  getChartPng: () => {
    if (!chartInstance?.toBase64Image) {
      const canvas = chartCanvas.value
      return canvas ? canvas.toDataURL('image/png', 1) : null
    }
    return chartInstance.toBase64Image('image/png', 1)
  },
})
</script>

<style lang="scss" scoped>
/* ✅ Estilo tipo “Oficinas” */
.timechart-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.45);
}

.timechart-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 10px;
}

.timechart-content {
  padding-top: 12px;
}

.chart-wrap {
  height: 280px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 10px;
}
.chart-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 599px) {
  .chart-wrap {
    height: 240px;
  }
}
</style>
