<template>
  <q-card class="enhanced-chart-card h-100">
    <q-card-section class="chart-header q-pb-none">
      <div class="row items-center">
        <!-- <q-icon :name="getIconForField(fieldKey)" size="24px" class="q-mr-sm" :style="{ color: themeColor }" /> -->
        <q-icon :name="getIconForField(fieldKey)" size="24px" class="q-mr-sm" :style="{ color: themeColor }" />

        <div class="chart-title">
          <div class="text-subtitle text-weight-bold text-white text-capitalize">
            {{ formatLabel(fieldKey) }}
          </div>
          <div class="text-caption text-grey-5">
            {{ uniqueCount }} valores únicos
          </div>
        </div>

        <q-space />
        <q-chip dense color="grey-9" text-color="grey-4" size="xs">
          Total: {{ totalLogs }}
        </q-chip>
      </div>
    </q-card-section>
    <q-card-section class="chart-content relative-position">
      <canvas ref="chartCanvas"></canvas>
      <div v-if="!hasData" class="absolute-full flex flex-center text-grey-6 bg-transparent">
        <div class="text-center">
          <q-icon name="bar_chart" size="40px" style="opacity: 0.3;" />
          <div class="text-caption">Sin datos para mostrar</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  fieldKey: { type:String, required: true },
  logs: { type: Array, default: () => [] },
  colorIndex: { type: Number, default: 0 }
})

const chartCanvas = ref(null)
let chartInstance = null

//  --- Lógica de procesamiento de datos ---
//  Extraer valores anidados - Ej: location.name
const getValue = (obj, path) => {
  return path.split('.').reduce((o, k) => (o ? o[k] : null), obj) || 'N/A'
}

//  Propiedad computada para los logs del gráfico
const chartData = computed(() => {
  const counts = {}

  props.logs.forEach( log => {
    const rawVal = getValue(log, props.fieldKey)
    const key = String(rawVal).toUpperCase()  //  Normalizar
    counts[key] = (counts[key] || 0) + 1
  })

  //  Ordenar por cantidad descendente
  const sortedKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a])

  const topKeys = sortedKeys.slice(0, 10)
  return {
    labels: topKeys,
    data: topKeys.map(k => counts[k]),
    fullData: counts
  }
})

const hasData = computed(() => chartData.value.data.length > 0)
const totalLogs = computed(() => props.logs.length)
const uniqueCount = computed(() => Object.keys(chartData.value.fullData).length)

//  --- Estilos y Colores ---

//  Paletas y colores dínamicos
const palettes = [
  { main: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)', border: '#4CAF50' }, // Verde
  { main: '#2196F3', bg: 'rgba(33, 150, 243, 0.2)', border: '#2196F3' }, // Azul
  { main: '#FF9800', bg: 'rgba(255, 152, 0, 0.2)', border: '#FF9800' }, // Naranja
  { main: '#9C27B0', bg: 'rgba(156, 39, 176, 0.2)', border: '#9C27B0' }, // Morado
  { main: '#E91E63', bg: 'rgba(233, 30, 99, 0.2)',  border: '#E91E63' }, // Rosa
  { main: '#00BCD4', bg: 'rgba(0, 188, 212, 0.2)',  border: '#00BCD4' }, // Cyan
]

const currentPalette = computed(() => palettes[props.colorIndex % palettes.length])
const themeColor = computed(() => currentPalette.value.main)

const getIconForField = (key) => {
  if (key.includes('status')) return 'flaky'
  if (key.includes('sever')) return 'warning' //  severity
  if (key.includes('loc') || key.includes('geo')) return 'place'
  if (key.includes('user') || key.includes('actor')) return 'person'
  if (key.includes('device')) return 'devices'
  if (key.includes('event')) return 'category'

  return 'bar_chart'
}

const formatLabel = (key) => key.replace('.', ' › ').replace(/([A-Z])/g, ' $1')

//  --- Renderizado de Chart.js ---
const renderChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = chartCanvas.value.getContext('2d')

  //  Decidir tipo de gráfica según la cantidad de datos
  // Si son pocos datos (<5) usamos Doughnut, si son más usamos Bar
  const isFewData = chartData.value.labels.length <= 4
  const type  = isFewData ? 'doughnut' : 'bar'

  chartInstance = new Chart(ctx, {
    type,
    data: {
      labels: chartData.value.labels,
      datasets: [{
        label: 'Registros',
        data: chartData.value.data,
        backgroundColor: currentPalette.value.bg,
        borderColor: currentPalette.value.border,
        borderWidth: 1,
        borderRadius: 4,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: type === 'bar' ? 'y' : 'x', // Barras horizontales para leer mejor las etiquetas
      plugins: {
        legend: {
          display: isFewData, //  Solo mostrar leyenda en dona
          position: 'right',
          labels: { color: '#fff', boxWidth: 12 }
        },
        title: { display: false }
      },
      scales: type === 'bar' ? {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.5)' },
          ticks: { color: '#bbb' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#fff', autoSkip: 'false' }
        }
      } : {
        //  Ocultar escalas para Doughnut
        x: { display: false },
        y: { display: false }
      }
    }
  })
}

//  --- Ciclo de vida ---
watch(() => props.logs, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  nextTick(() => renderChart())
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})

</script>

<style lang="scss" scoped>
  .enhanced-chart-card {
    background-color: rgba(71, 71, 71, 0.5);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    height: 100%;
    min-height: 250px;
  }

  .chart-content {
    height: 200px;  // Altura fija para el canvas
    padding: 10px;
  }
</style>
