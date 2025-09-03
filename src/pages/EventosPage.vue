<template>
  <q-page class="q-pa-md" style="background-color: #121826">
    <!-- Indicador de carga general para mobile -->
    <q-inner-loading
      :showing="loadingCharts && modoSeleccionado === 'mobile'"
      label="Cargando eventos..."
      label-class="text-white"
      color="primary"
      size="50px"
    />

    <!-- Componente de filtros de fechas -->
    <LogFilters @filter="actualizarDatos" />

    <div class="q-pa-md">
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Eventos por MES -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-6 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section class="text-subtitle1 text-center">Eventos por Mes</q-card-section>
            <q-inner-loading
              :showing="loadingCharts && modoSeleccionado === 'mobile'"
              label="Cargando..."
              label-class="text-white"
              color="primary"
              size="30px"
            />
            <q-card-section style="height: 500px">
              <canvas ref="eventosPorMesChart" />
            </q-card-section>
          </q-card>
        </div>
        <!--Fin eventos por MES-->
        <!-- Eventos por SEMANA -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-6 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section class="text-subtitle1 text-center">Eventos por Semana</q-card-section>
            <q-inner-loading
              :showing="loadingCharts && modoSeleccionado === 'mobile'"
              label="Cargando..."
              label-class="text-white"
              color="primary"
              size="30px"
            />
            <q-card-section style="height: 500px">
              <canvas ref="chartSemana" />
            </q-card-section>
          </q-card>
        </div>
        <!--Fin eventos por SEMANA-->
      </div>
      <div class="row q-col-gutter-md">
        <!-- Eventos por DÍA -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-6 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section class="text-subtitle1 text-center">Eventos por Día</q-card-section>
            <q-inner-loading
              :showing="loadingCharts && modoSeleccionado === 'mobile'"
              label="Cargando..."
              label-class="text-white"
              color="primary"
              size="30px"
            />
            <q-card-section style="height: 500px">
              <canvas ref="chartDia" />
            </q-card-section>
          </q-card>
        </div>
        <!--Fin eventos por DÍA-->
        <!-- Eventos por TIPO -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-6 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section class="text-subtitle1 text-center">Eventos por Tipo</q-card-section>
            <q-inner-loading
              :showing="loadingCharts && modoSeleccionado === 'mobile'"
              label="Cargando..."
              label-class="text-white"
              color="primary"
              size="30px"
            />
            <q-card-section style="height: 500px">
              <canvas ref="chartPorTipo" />
            </q-card-section>
          </q-card>
        </div>
        <!--Fin eventos por TIPO-->
        <!--Eventos con alta respuesta-->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-6 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section>
              <div class="text-h6 text-center">Eventos con Alta Respuesta</div>
              <q-inner-loading
                :showing="loadingCharts && modoSeleccionado === 'mobile'"
                label="Cargando..."
                label-class="text-white"
                color="primary"
                size="30px"
              />
              <canvas ref="eventosTiempoChartRef" style="height: 400px; max-width: 100%"></canvas>
            </q-card-section>
          </q-card>
        </div>
        <!--Fin eventos con alta respuesta-->
        <!--Duración de uso por día-->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="col-12 col-md-12 q-mx-sm text-white"
            style="background-color: #1e1e2f"
          >
            <q-card-section>
              <div class="text-h6 text-center">Duración de Uso por Día</div>
              <q-inner-loading
                :showing="loadingCharts && modoSeleccionado === 'mobile'"
                label="Cargando..."
                label-class="text-white"
                color="primary"
                size="30px"
              />
              <canvas ref="chartTiempoUsoRef" style="height: 400px; max-width: 100%"></canvas>
            </q-card-section>
          </q-card>
        </div>
        <!--Fin duración de uso por día-->
        <!-- Funcionalidades más Usadas-->
        <div class="col-12 col-md-6">
          <div class="table-wrapper">
            <q-card flat bordered class="q-pa-md text-white" style="background-color: #1e1e2f">
              <q-card-section>
                <div class="text-h6 text-center q-mb-md">Funcionalidades más Usadas</div>
                <EventosAbiertosTable :eventos="eventosAbiertos" />
              </q-card-section>
            </q-card>
          </div>
        </div>
        <!--Fin Funcionalidades más Usadas-->
        <!-- Funcionalidades Múltiples Usos -->
        <div class="col-12 col-md-6">
          <div class="table-wrapper">
            <q-card flat bordered class="q-pa-md text-white" style="background-color: #1e1e2f">
              <q-card-section>
                <div class="text-h6 text-center q-mb-md">Funcionalidades Múltiples Usos</div>
                <FuncionalidadesMulTable :logs="funcionalidadesMultiplesUsos" />
              </q-card-section>
            </q-card>
          </div>
        </div>
        <!--Fin Funcionalidades Múltiples Usos-->
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed, inject } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Filler,
} from 'chart.js'
import {
  getEventosPorDia,
  getEventosPorMes,
  getEventosPorSemana,
  getEventosPorTipo,
  getEventosTiempoRespuesta,
  getMayorTiempoUsoFuncionalidad,
  getEventosAbiertos,
  getFuncionalidadesMultiplesUsos,
} from 'src/services/api'
import EventosAbiertosTable from 'src/components/EventosAbiertosTable.vue'
import FuncionalidadesMulTable from 'src/components/FuncionalidadesMulTable.vue'
import LogFilters from 'src/components/LogFilters.vue'

// Registramos los componentes necesarios
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Filler
)

// Variables para mobile flow
const loadingCharts = ref(false)
const flow = inject('flow')
const modoSeleccionado = computed(() => flow?.value || 'desktop')

// Referencia al canvas
const eventosPorMesChart = ref(null)
const chartDia = ref(null)
const chartSemana = ref(null)
const chartPorTipo = ref(null)
const eventosTiempoRespuesta = ref([])
const eventosTiempoChartRef = ref(null)
let eventosTiempoChartInstance = null
const tiempoUsoPorDia = ref([])
let chartTiempoUsoInstance = null
const chartTiempoUsoRef = ref(null)
const eventosAbiertos = ref([])
const funcionalidadesMultiplesUsos = ref([])

// Función principal para actualizar todos los datos
async function actualizarDatos() {
  if (modoSeleccionado.value === 'mobile') {
    loadingCharts.value = true
    console.log('📱 Mobile: Actualizando gráficas de eventos...')
  }

  try {
    // Ejecutar todas las funciones de renderizado en paralelo
    await Promise.all([
      renderEventosPorMesChart(),
      renderEventosDia(),
      renderEventosSemana(),
      renderEventosPorTipoChart(),
      cargarEventosTiempoRespuesta(),
      cargarTiempoUsoPorDia(),
      cargarEventosAbiertos(),
      cargarFuncionalidadesMultiplesUsos(),
    ])

    if (modoSeleccionado.value === 'mobile') {
      console.log('✅ Mobile: Gráficas de eventos actualizadas correctamente')
    }
  } catch (error) {
    console.error('❌ Error al actualizar gráficas de eventos:', error)
  } finally {
    if (modoSeleccionado.value === 'mobile') {
      loadingCharts.value = false
    }
  }
}

// Watcher para cambios de fecha en mobile
watch(
  () => flow?.value,
  (newFlow, oldFlow) => {
    if (newFlow === 'mobile' && oldFlow !== 'mobile') {
      console.log('📱 Detectado cambio a modo mobile en EventosPage')
      actualizarDatos()
    }
  },
  { immediate: false }
)

// Convertir duración en formato HH:MM:SS a segundos
function convertirDuracionASegundos(duracionStr) {
  const [hh, mm, ss] = duracionStr.split(':').map(Number)
  return hh * 3600 + mm * 60 + ss
}

// Funcion para formatear el mes
function formatearMes(mesISO) {
  const fecha = new Date(mesISO + '-01')
  return fecha.toLocaleString('es-MX', { month: 'short', year: 'numeric' }).replace('.', '')
}

//Funcion para obtener eventos por mes
async function renderEventosPorMesChart() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
    }
    const data = await getEventosPorMes(payload)
    const labels = data.map((item) => formatearMes(item.mes))
    const valoresBarras = data.map((item) => item.total)
    const valoresLinea = valoresBarras.map((v, i) =>
      valoresBarras.slice(0, i + 1).reduce((a, b) => a + b, 0)
    )
    new Chart(eventosPorMesChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Eventos por mes',
            data: valoresBarras,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            stack: 'stack1',
          },
          {
            type: 'line',
            label: 'Eventos acumulados',
            data: valoresLinea,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ccc',
              boxWidth: 12,
              padding: 10,
            },
          },
          title: {
            display: true,
            text: 'Eventos por Mes y Acumulado',
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
          y: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al renderizar eventos por mes:', error)
  }
}

// Funcion para obtener eventos por día
async function renderEventosDia() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
    }
    const datos = await getEventosPorDia(payload)
    const labels = datos.map((d) => d.fecha)
    const valores = datos.map((d) => d.total)
    const acumulado = valores.reduce((acc, curr, idx) => {
      acc.push((acc[idx - 1] || 0) + curr)
      return acc
    }, [])
    new Chart(chartDia.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Eventos por día',
            data: valores,
            backgroundColor: '#ab47bc',
            yAxisID: 'y',
          },
          {
            label: 'Eventos acumulados',
            data: acumulado,
            type: 'line',
            borderColor: '#42a5f5',
            tension: 0.3,
            fill: false,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#ccc' },
          },
          title: {
            display: true,
            text: 'Eventos por Día y Acumulado',
            color: '#ccc',
          },
        },
        scales: {
          x: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al graficar eventos por día:', error)
  }
}

// Funcion para obtener eventos por semana
async function renderEventosSemana() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
    }
    const datos = await getEventosPorSemana(payload)
    const labels = datos.map((d) => d.semana_iso) // ajusta según tu JSON
    const valores = datos.map((d) => d.total)
    console.log('Datos por semana:', datos)
    new Chart(chartSemana.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Eventos por semana',
            data: valores,
            fill: false, // 🔥 sin relleno
            borderColor: 'rgba(231, 76, 60)', // rosa semitransparente
            backgroundColor: 'rgba(255, 99, 132, 1)',
            tension: 0.4, // línea más curva
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { enabled: true },
          legend: {
            labels: { color: '#ccc' },
          },
        },
        scales: {
          x: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
          y: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al cargar eventos por semana:', error)
  }
}

// Funcion para obtener eventos por tipo
async function renderEventosPorTipoChart() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
    }
    const data = await getEventosPorTipo(payload)
    const labels = data.map((d) => d.tipoEvento)
    const valores = data.map((d) => d.total_eventos)
    new Chart(chartPorTipo.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Eventos por tipo',
            data: valores,
            borderColor: '#FFA726',
            backgroundColor: 'rgba(255, 167, 38, 0.2)',
            tension: 0.3,
            pointBackgroundColor: '#FFA726',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#fff' } },
          tooltip: { enabled: true },
          title: {
            display: true,
            text: 'Eventos por Tipo',
            font: { size: 16 },
          },
          scales: {
            x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
            y: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al cargar eventos abiertos:', error)
  }
}

// Funcion para obtener eventos por tiempo de respuesta
async function cargarEventosTiempoRespuesta(start_date, end_date) {
  try {
    const payload = {
      tiempoMs: 1000,
      fechaInicio: start_date,
      fechaFin: end_date,
    }
    const data = await getEventosTiempoRespuesta(payload)
    console.log('Eventos por tiempo de respuesta:', data)
    eventosTiempoRespuesta.value = data
    renderChartEventosTiempo()
  } catch (e) {
    console.error('Error al obtener eventos tiempo respuesta:', e)
    eventosTiempoRespuesta.value = []
  }
}

// Renderizar el gráfico de eventos con alta respuesta
function renderChartEventosTiempo() {
  const ctx = eventosTiempoChartRef.value.getContext('2d')
  if (eventosTiempoChartInstance) {
    eventosTiempoChartInstance.destroy()
  }
  const agrupados = {}
  for (const evento of eventosTiempoRespuesta.value) {
    const tipo = evento.tipoEvento || 'UNKNOWN'
    agrupados[tipo] = (agrupados[tipo] || 0) + 1
  }
  const labels = Object.keys(agrupados)
  const values = Object.values(agrupados)
  eventosTiempoChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Eventos con alta respuesta (ms)',
          data: values,
          backgroundColor: '#ffc107',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

// Cargar el tiempo de uso por día para una funcionalidad específica
async function cargarTiempoUsoPorDia(funcionalidad, start_date, end_date) {
  try {
    const payload = {
      funcionalidad,
      fechaInicio: start_date,
      fechaFin: end_date,
    }
    const data = await getMayorTiempoUsoFuncionalidad(payload)
    tiempoUsoPorDia.value = data.map((d) => ({
      fecha: d.fecha,
      segundos: convertirDuracionASegundos(d.total),
    }))
    renderChartTiempoUso()
  } catch (e) {
    console.error('Error al obtener tiempo de uso por día:', e)
  }
}

// Renderizar el gráfico de duración de uso por día
function renderChartTiempoUso() {
  const ctx = chartTiempoUsoRef.value.getContext('2d')
  if (chartTiempoUsoInstance) {
    chartTiempoUsoInstance.destroy()
  }
  const labels = tiempoUsoPorDia.value.map((d) => d.fecha)
  const values = tiempoUsoPorDia.value.map((d) => d.segundos)
  chartTiempoUsoInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Duración de uso (segundos)',
          data: values,
          fill: false,
          borderColor: '#00bcd4',
          tension: 0.3,
          pointBackgroundColor: '#00e5ff',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

// Funcion Cargar eventos abiertos
async function cargarEventosAbiertos() {
  try {
    const payload = {
      fechaInicio: '2025-04-01',
      fechaFin: '2025-06-30',
    }
    const data = await getEventosAbiertos(payload)
    eventosAbiertos.value = data
    console.log('Eventos abiertos cargados:', data)
  } catch (error) {
    console.error('Error al obtener eventos abiertos:', error)
  }
}

// Funcion Cargar funcionalidades múltiples usos
async function cargarFuncionalidadesMultiplesUsos() {
  try {
    const data = await getFuncionalidadesMultiplesUsos()
    funcionalidadesMultiplesUsos.value = data
    console.log('Funcionalidades múltiples usos cargadas:', data)
  } catch (error) {
    console.error('Error al obtener funcionalidades múltiples usos:', error)
  }
}

onMounted(() => {
  actualizarDatos()
})
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  height: 530px;
}

/* Estilos responsivos para móviles */
@media (max-width: 768px) {
  .q-pa-md {
    padding: 8px !important;
  }

  .q-card {
    margin-bottom: 16px !important;
  }

  .q-card-section {
    padding: 12px !important;
  }

  /* Ajustes para gráficas en móvil */
  canvas {
    max-width: 100% !important;
    height: auto !important;
  }

  /* Mejorar indicadores de carga en móvil */
  .q-inner-loading {
    z-index: 10;
  }

  /* Ajustes para tarjetas de gráficas */
  .col-12 {
    padding: 4px !important;
  }

  .col-md-6 {
    margin-bottom: 16px !important;
  }
}

@media (max-width: 480px) {
  .q-pa-md {
    padding: 4px !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }

  .text-subtitle1 {
    font-size: 0.9rem !important;
  }

  /* Ajustes adicionales para móviles pequeños */
  .q-card-section {
    padding: 8px !important;
  }

  canvas {
    height: 300px !important;
  }
}
</style>
