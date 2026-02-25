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
import Chart from 'chart.js/auto'

const props = defineProps({
  logs: { type: Array, default: () => [] },
  definition: { type: Object, default: null },
  colorIndex: { type: Number, default: 0 },
})

const chartCanvas = ref(null)
let chartInstance = null

// ---------- Helpers ----------
const formatMonthLabelEs = (year, month1to12) => {
  // month1to12: 1..12
  const d = new Date(Date.UTC(year, month1to12 - 1, 1))

  // "feb 2026" (es-MX). Usa month:'long' si quieres "febrero 2026"
  const s = new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
  }).format(d)

  // Capitalizar primera letra: "Feb 2026"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

const pad2 = (n) => String(n).padStart(2, '0')

const toYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

// ISO week helpers (para ordenar bien semanas)
function getISOWeekYearAndWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}

// ---------- Aesthetic ----------
const accentPalette = ['#22d3ee', '#a78bfa', '#ff9f43', '#29d3c2', '#ff5c8a']
const accentColor = computed(() => accentPalette[props.colorIndex % accentPalette.length])

// ---------- Definition ----------
const timeKey = computed(() => props.definition?.timeKey || 'eventTime')
const bucket = computed(() => props.definition?.timeBucket || 'day')

const title = computed(() => props.definition?.title || 'Eventos por tiempo y acumulado')
const iconName = computed(() => props.definition?.icon || 'timeline')

const timeLabel = computed(() => {
  const b = bucket.value
  if (b === 'year') return 'Por año + acumulado'
  if (b === 'month') return 'Por mes + acumulado'
  if (b === 'week') return 'Por semana + acumulado'
  return 'Por día + acumulado'
})

const totalLogs = computed(() => (props.logs || []).length)

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
      const y = d.getFullYear()
      key = String(y)
      label = String(y)
    } else if (bucket.value === 'month') {
      const y = d.getFullYear()
      const mNum = d.getMonth() + 1
      const m = pad2(mNum)
      key = `${y}-${m}` // ✅ se mantiene ordenable
      label = formatMonthLabelEs(y, mNum) // ✅ "Feb 2026"
    } else if (bucket.value === 'week') {
      const { year, week } = getISOWeekYearAndWeek(d)
      const w = pad2(week)
      key = `${year}-W${w}` // ordenable
      label = `Semana ${w}-${year}`
    } else {
      // day
      key = toYMD(d) // ordenable
      label = toYMD(d)
    }

    const prev = counts.get(key)
    if (prev) prev.count += 1
    else counts.set(key, { label, count: 1 })
  }

  const keys = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b))
  const labels = keys.map((k) => counts.get(k)?.label || k)
  const data = keys.map((k) => counts.get(k)?.count || 0)

  const cum = []
  let acc = 0
  for (const v of data) {
    acc += v
    cum.push(acc)
  }

  return { labels, data, cum }
}

const chartPayload = computed(() => buildTimeseries())

const hasData = computed(() => (chartPayload.value.labels || []).length > 0)

// ---------- Render Chart.js (ONLY time series) ----------
const renderChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = chartCanvas.value.getContext('2d')
  const payload = chartPayload.value

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
          borderRadius: 8,
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
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: 'rgba(255,255,255,0.78)' },
        },
        tooltip: {
          titleColor: '#fff',
          bodyColor: '#fff',
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
