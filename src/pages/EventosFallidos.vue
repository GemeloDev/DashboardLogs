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
    <div class="text-h4 text-white text-center q-mb-lg text-bold">Eventos Fallidos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card
          flat
          bordered
          class="q-pa-lg text-white q-mb-md resumen-card"
          style="
            background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(55, 65, 81, 0.25);
          "
        >
          <div class="row items-center q-mb-md">
            <q-icon name="assessment" size="28px" color="white" class="q-mr-sm" />
            <div class="text-h5 text-weight-bold">Resumen Ejecutivo</div>
          </div>

          <div class="row q-col-gutter-md">
            <!-- KPI Principal -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                class="kpi-card text-center q-pa-md"
                style="background: rgba(255, 255, 255, 0.1); border-radius: 12px"
              >
                <q-icon name="error_outline" size="32px" color="red-6" class="q-mb-sm" />
                <div class="text-h4 text-weight-bold text-red-6">{{ logs.length }}</div>
                <div class="text-caption text-grey-3">Total Eventos Fallidos</div>
              </q-card>
            </div>

            <!-- Última Fecha -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                class="kpi-card text-center q-pa-md"
                style="background: rgba(255, 255, 255, 0.1); border-radius: 12px"
              >
                <q-icon name="schedule" size="32px" color="blue-4" class="q-mb-sm" />
                <div class="text-h5 text-weight-bold">
                  {{ logs[0]?.fecha ? formatearFecha(logs[0].fecha) : 'N/A' }}
                </div>
                <div class="text-caption text-grey-3">Último Evento</div>
              </q-card>
            </div>

            <!-- Estados Dinámicos -->
            <div
              v-for="estado in eventosPorEstado.slice(0, 2)"
              :key="estado.resultadoEvento"
              class="col-12 col-sm-6 col-md-3"
            >
              <q-card
                class="kpi-card text-center q-pa-md"
                style="background: rgba(255, 255, 255, 0.1); border-radius: 12px"
              >
                <q-icon
                  :name="getIconoEstado(estado.resultadoEvento)"
                  size="32px"
                  :color="getColorEstado(estado.resultadoEvento)"
                  class="q-mb-sm"
                />
                <div
                  class="text-h5 text-weight-bold"
                  :class="'text-' + getColorEstado(estado.resultadoEvento)"
                >
                  {{ estado.total }}
                </div>
                <div class="text-caption text-grey-3">{{ estado.resultadoEvento }}</div>
              </q-card>
            </div>
          </div>

          <!-- Estados adicionales si hay más de 2 -->
          <div v-if="eventosPorEstado.length > 2" class="row q-col-gutter-md q-mt-sm">
            <div
              v-for="estado in eventosPorEstado.slice(2)"
              :key="estado.resultadoEvento"
              class="col-12 col-sm-6 col-md-3"
            >
              <q-card
                class="kpi-card text-center q-pa-md"
                style="background: rgba(255, 255, 255, 0.1); border-radius: 12px"
              >
                <q-icon
                  :name="getIconoEstado(estado.resultadoEvento)"
                  size="28px"
                  :color="getColorEstado(estado.resultadoEvento)"
                  class="q-mb-sm"
                />
                <div
                  class="text-h6 text-weight-bold"
                  :class="'text-' + getColorEstado(estado.resultadoEvento)"
                >
                  {{ estado.total }}
                </div>
                <div class="text-caption text-grey-3">{{ estado.resultadoEvento }}</div>
              </q-card>
            </div>
          </div>
        </q-card>


      </div>
          <!-- Título de tabla mejorado con colores profesionales -->
        <!-- <q-card
          flat
          class="q-pa-md text-center q-mb-sm tabla-header"
          style="
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
            border-radius: 12px 12px 0 0;
            box-shadow: 0 4px 16px rgba(75, 85, 99, 0.25);
          "
        >
          <div class="row items-center justify-center">
            <q-icon name="table_view"  color="white" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold text-white">Detalle de Eventos Fallidos</div>
            <q-chip
              color="white"
              text-color="primary"
              :label="`${logs.length} registros`"
              class="q-ml-md"
            />
          </div>
        </q-card> -->
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="q-pa-md text-white grafica-dispositivos-card"
          style="
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(31, 41, 55, 0.3);
          "
        >
          <div class="row items-center justify-center q-mb-md">
            <q-icon name="pie_chart" size="24px" color="white" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Distribución por Estado</div>
          </div>

          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando..."
            label-class="text-white"
            color="white"
            size="30px"
          />

          <!-- Contenedor con altura fija para controlar crecimiento -->
          <div
            class="chart-container"
            style="position: relative; height: 280px; max-height: 280px; overflow: hidden"
          >
            <canvas ref="chartPorEstado"></canvas>
          </div>
        </q-card>
      </div>
        <EventosFallidosTable :logs="logs" />

    </div>
  </q-page>
</template>

<script setup>
import EventosFallidosTable from 'src/components/EventosFallidosTable.vue'
import LogFilters from 'src/components/LogFilters.vue'
import { ref, onMounted, onBeforeUnmount, watch, computed, inject } from 'vue'
import { getEventosFallidos, getEventosPorEstado } from 'src/services/api'
import Chart from 'chart.js/auto'

const logs = ref([])
const chartPorEstado = ref(null)
const eventosPorEstado = ref([])

// Variables para mobile flow
const loadingCharts = ref(false)
const flow = inject('flow', ref('desktop')) // 🔧 Valor por defecto para evitar warning
const modoSeleccionado = computed(() => flow?.value || 'desktop')

// Instancia de Chart.js para gestión de memoria
let chartPorEstadoInstance = null

// 🔥 FUNCIÓN ROBUSTA: Destruir gráfico existente y limpiar registro global
function destroyChartPorEstado() {
  console.log('🧹 Iniciando limpieza ROBUSTA de gráficos en EventosFallidos...')

  try {
    if (chartPorEstadoInstance && typeof chartPorEstadoInstance.destroy === 'function') {
      try {
        chartPorEstadoInstance.destroy()
        console.log('✅ Gráfico de eventos por estado destruido correctamente')
      } catch (error) {
        console.warn('⚠️ Error destruyendo gráfico de eventos por estado:', error)
      }
      chartPorEstadoInstance = null
    }

    // 🚀 LIMPIAR REGISTRO GLOBAL DE CHART.JS
    if (window.Chart && window.Chart.instances) {
      Object.keys(window.Chart.instances).forEach((id) => {
        const instance = window.Chart.instances[id]
        if (instance && typeof instance.destroy === 'function') {
          try {
            instance.destroy()
            console.log(`🔥 Instancia global ${id} eliminada (EventosFallidos)`)
          } catch (error) {
            console.warn(`⚠️ Error eliminando instancia global ${id} (EventosFallidos):`, error)
          }
        }
      })
      // Limpiar el objeto de instancias
      window.Chart.instances = {}
      console.log('🧹 Registro global de Chart.js limpiado (EventosFallidos)')
    }

    // Limpiar canvas específico de EventosFallidos
    const canvas = document.getElementById('eventosPorEstadoChart')
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
      canvas.removeAttribute('data-chartjs-id')
      canvas.style.display = 'block'
      canvas.style.position = 'relative'
      canvas.style.height = 'auto'
      canvas.style.width = 'auto'
    }

    console.log('🧹 Limpieza ROBUSTA completada en EventosFallidos')
  } catch (error) {
    console.error('❌ Error durante la limpieza robusta en EventosFallidos:', error)
  }
}

// Función principal para actualizar todos los datos
async function actualizarDatos() {
  if (modoSeleccionado.value === 'mobile') {
    loadingCharts.value = true
    console.log('📱 Mobile: Actualizando eventos fallidos...')
  }

  try {
    // 🔥 PASO 1: Destruir gráfico existente PRIMERO
    destroyChartPorEstado()
    console.log('🧹 Gráfico de estado destruido antes de actualizar')

    // 🔥 PASO 2: Cargar datos de eventos fallidos
    const payload = {
      resultado: 'FALLIDO',
      fechaInicio: '2025-01-20',
      fechaFin: '2025-06-30',
    }
    logs.value = await getEventosFallidos(payload)
    console.log('Logs de eventos fallidos:', logs.value)

    // 🔥 PASO 3: Pequeño delay para asegurar que el DOM esté listo
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 🔥 PASO 4: Renderizar gráfica después del delay
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

// Limpieza al desmontar el componente
onBeforeUnmount(() => {
  console.log('🧹 Limpiando gráficos antes de desmontar EventosFallidos')
  destroyChartPorEstado()
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

// 📊 FUNCIÓN MEJORADA: Renderizar gráfico de eventos por estado
async function renderEventosPorEstadoChart() {
  console.log('📊 Iniciando renderEventosPorEstadoChart...')

  try {
    // 🔥 PASO 1: Destruir gráfico existente ANTES de crear uno nuevo
    destroyChartPorEstado()

    // Verificar que el canvas esté disponible
    if (!chartPorEstado.value) {
      console.warn('⚠️ Canvas chartPorEstado no disponible')
      // Intentar nuevamente con delay
      setTimeout(() => {
        if (chartPorEstado.value) {
          console.log('✅ Canvas chartPorEstado encontrado en reintento')
          renderEventosPorEstadoChart()
        }
      }, 200)
      return
    }

    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
    }
    const data = await getEventosPorEstado(payload)
    eventosPorEstado.value = data
    console.log('📊 Datos recibidos para eventos por estado:', data)

    // Verificar que tengamos datos válidos
    if (!data || data.length === 0) {
      console.warn('⚠️ No hay datos para eventos por estado')
      return
    }

    const labels = data.map((d) => d.resultadoEvento)
    const valores = data.map((d) => d.total)

    console.log('🏷️ Labels eventos por estado:', labels)
    console.log('🔢 Valores eventos por estado:', valores)

    chartPorEstadoInstance = new Chart(chartPorEstado.value, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Eventos por Estado',
            data: valores,
            backgroundColor: [
              '#6b7280', // Gris profesional para éxito
              '#dc2626', // Rojo elegante para fallidos
              '#d97706', // Naranja profesional para pendiente
              '#2563eb', // Azul corporativo para procesando
              '#7c3aed', // Púrpura elegante para otros
              '#059669'  // Verde profesional para completados
            ],
            borderColor: '#1a1a1a',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#fff',
              font: {
                size: 12,
                weight: 'normal',
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
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
    console.log('✅ Gráfico eventos por estado creado exitosamente con', labels.length, 'elementos')
  } catch (error) {
    console.error('❌ Error al cargar eventos por estado:', error)
    console.error('❌ Stack trace:', error.stack)
  }
}

// 🎨 FUNCIONES DE UTILIDAD PARA EL DISEÑO

// Función para obtener iconos según el estado
function getIconoEstado(estado) {
  const iconos = {
    EXITO: 'check_circle',
    FALLIDO: 'cancel',
    CANCELADO: 'remove_circle',
    ERROR: 'error',
    PENDIENTE: 'schedule',
    PROCESANDO: 'sync',
  }
  return iconos[estado] || 'help'
}

// Función para obtener colores según el estado
function getColorEstado(estado) {
  const colores = {
    EXITO: 'green-4',
    FALLIDO: 'red-4',
    CANCELADO: 'orange-4',
    ERROR: 'red-6',
    PENDIENTE: 'blue-4',
    PROCESANDO: 'purple-4',
  }
  return colores[estado] || 'grey-4'
}

// Función para formatear fechas de manera amigable
function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  try {
    const fechaObj = new Date(fecha)
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}
</script>

<style scoped>
/* 🎨 ESTILOS MEJORADOS PARA EVENTOS FALLIDOS */

/* Animaciones suaves para las KPI cards */
.kpi-card {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15) !important;
}

/* Estilos para la tarjeta de resumen */
.resumen-card {
  position: relative;
  overflow: hidden;
}

.resumen-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.resumen-card:hover::before {
  transform: translateX(100%);
}

/* Estilos para el header de la tabla */
.tabla-header {
  position: relative;
  overflow: hidden;
}

.tabla-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 100%
  );
  border-radius: 2px;
}

/* Contenedor de gráfica con control de tamaño */
.chart-container {
  width: 100%;
  position: relative;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
  max-height: 280px !important;
}

/* Estilos para la tarjeta de gráficas */
.grafica-dispositivos-card {
  position: relative;
  overflow: hidden;
}

.grafica-dispositivos-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animaciones de entrada */
.resumen-card,
.tabla-header,
.grafica-dispositivos-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos de glow para iconos */
.q-icon {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}

.kpi-card:hover .q-icon {
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.5));
  transform: scale(1.1);
}

/* Mejoras para los chips */
.q-chip {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Mejoras para el loading */
.q-inner-loading {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3) !important;
}

/* Responsividad mejorada */
@media (max-width: 768px) {
  .q-mb-md {
    margin-bottom: 8px !important;
  }

  .kpi-card {
    margin-bottom: 12px;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h5 {
    font-size: 1.2rem !important;
  }

  .chart-container {
    height: 220px !important;
    max-height: 220px !important;
  }

  .chart-container canvas {
    max-height: 220px !important;
  }
}

@media (max-width: 480px) {
  .resumen-card {
    padding: 1rem !important;
  }

  .kpi-card {
    padding: 0.75rem !important;
  }

  .text-h6 {
    font-size: 1rem !important;
  }

  .chart-container {
    height: 200px !important;
    max-height: 200px !important;
  }

  .chart-container canvas {
    max-height: 200px !important;
  }
}
</style>
