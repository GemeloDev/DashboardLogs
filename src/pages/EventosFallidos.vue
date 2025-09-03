<template>
  <q-page class="q-mb-md" style="background-color: #121826">
    <!-- Indicador de carga general para mobile -->
    <q-inner-loading
      :showing="loadingCharts && modoSeleccionado === 'mobile'"
      label="Cargando eventos fallidos..."
      label-class="text-white"
      color="primary"
      size="50px"
    />

    <!-- Componente de filtros de fechas -->
    <LogFilters @filter="actualizarDatos" />

    <br />
    <div class="text-h4 text-white text-center q-mb-md">Eventos Fallidos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card
          flat
          bordered
          class="q-pa-md text-white q-mb-md"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 q-mb-sm text-center">Resumen</div>
          <br />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div>
                Total eventos fallidos: <b>{{ logs.length }}</b>
              </div>
            </div>
            <div class="col-6">
              <div>
                Última fecha: <b>{{ logs[0]?.fecha || 'N/A' }}</b>
              </div>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div v-for="estado in eventosPorEstado" :key="estado.resultadoEvento" class="col-6">
              <div>
                {{ estado.resultadoEvento }}: <b>{{ estado.total }}</b>
              </div>
            </div>
          </div>
        </q-card>
        <div class="text-subtitle1 text-center q-mb-sm text-white">Tabla de Eventos Fallidos</div>
        <br />
        <EventosFallidosTable :logs="logs" />
      </div>
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="q-pa-md text-white"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 text-center">Dispositivos más usados</div>
          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando..."
            label-class="text-white"
            color="primary"
            size="30px"
          />
          <canvas ref="chartPorEstado" style="height: 250px" />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import EventosFallidosTable from 'src/components/EventosFallidosTable.vue'
import LogFilters from 'src/components/LogFilters.vue'
import { ref, onMounted, watch, computed, inject } from 'vue'
import { getEventosFallidos, getEventosPorEstado } from 'src/services/api'
import Chart from 'chart.js/auto'

const logs = ref([])
const chartPorEstado = ref(null)
const eventosPorEstado = ref([])

// Variables para mobile flow
const loadingCharts = ref(false)
const flow = inject('flow')
const modoSeleccionado = computed(() => flow?.value || 'desktop')

// Función principal para actualizar todos los datos
async function actualizarDatos() {
  if (modoSeleccionado.value === 'mobile') {
    loadingCharts.value = true
    console.log('📱 Mobile: Actualizando eventos fallidos...')
  }

  try {
    // Cargar datos de eventos fallidos
    const payload = {
      resultado: 'FALLIDO',
      fechaInicio: '2025-01-20',
      fechaFin: '2025-06-30',
    }
    logs.value = await getEventosFallidos(payload)
    console.log('Logs de eventos fallidos:', logs.value)

    // Renderizar gráfica
    await renderEventosPorEstadoChart()

    if (modoSeleccionado.value === 'mobile') {
      console.log('✅ Mobile: Eventos fallidos actualizados correctamente')
    }
  } catch (error) {
    console.error('❌ Error al actualizar eventos fallidos:', error)
  } finally {
    if (modoSeleccionado.value === 'mobile') {
      loadingCharts.value = false
    }
  }
}

onMounted(() => {
  actualizarDatos()
})

// Watcher para cambios de fecha en mobile
watch(
  () => flow?.value,
  (newFlow, oldFlow) => {
    if (newFlow === 'mobile' && oldFlow !== 'mobile') {
      console.log('📱 Detectado cambio a modo mobile en EventosFallidos')
      actualizarDatos()
    }
  },
  { immediate: false }
)

async function renderEventosPorEstadoChart() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
    }
    const data = await getEventosPorEstado(payload)
    eventosPorEstado.value = data
    console.log('Datos recibidos para eventos por estado:', data)
    const labels = data.map((d) => d.resultadoEvento)
    const valores = data.map((d) => d.total)

    new Chart(chartPorEstado.value, {
      type: 'doughnut', // también puedes usar 'pie'
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Eventos por Estado',
            data: valores,
            backgroundColor: ['#66bb6a', '#ef5350', '#ffa726', '#42a5f5'],
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#fff' },
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const value = context.parsed
                const percentage = ((value / total) * 100).toFixed(1)
                return `${context.label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al cargar eventos por estado:', error)
  }
}
</script>

<style scoped>
/* Estilos responsivos para móviles */
@media (max-width: 768px) {
  .q-mb-md {
    margin-bottom: 8px !important;
  }

  .q-pa-md {
    padding: 8px !important;
  }

  .q-card {
    margin-bottom: 16px !important;
    border-radius: 8px !important;
  }

  /* Ajustes para la gráfica en móvil */
  canvas {
    max-width: 100% !important;
    height: auto !important;
  }

  /* Mejorar indicadores de carga en móvil */
  .q-inner-loading {
    z-index: 10;
  }

  /* Ajustes para texto en móvil */
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-subtitle1 {
    font-size: 1rem !important;
  }
}

@media (max-width: 480px) {
  .q-mb-md {
    margin-bottom: 4px !important;
  }

  .q-pa-md {
    padding: 4px !important;
  }

  /* Ajustes adicionales para móviles pequeños */
  .text-h4 {
    font-size: 1.25rem !important;
  }

  .text-subtitle1 {
    font-size: 0.9rem !important;
  }

  canvas {
    height: 200px !important;
  }

  /* Mejorar espaciado en móviles */
  .row {
    margin: 0 !important;
  }

  .col-6 {
    padding: 4px !important;
  }
}
</style>
