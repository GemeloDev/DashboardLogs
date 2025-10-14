<template>
  <q-layout>
    <q-page class="q-pa-md" style="background-color: #121826">
      <q-card flat class="q-pa-md" style="background-color: #121826">
        <div v-if="!modoSeleccionado">
          <transition name="fade" mode="out-in">
            <div class="row q-col-gutter-md q-mt-xl justify-center" v-if="!modoSeleccionado">
              <q-card
                flat
                bordered
                class="col-12 col-md-4 q-pa-xl text-white q-mx-md selector-card"
                @click="seleccionarModo('mobile')"
                style="
                  background: linear-gradient(135deg, #1e1e2f 80%, #2c2c44 100%);
                  border-radius: 24px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 16px #0004;
                "
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 32px #0008'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 16px #0004'"
              >
                <div class="column items-center">
                  <q-icon name="smartphone" color="primary" size="100px" />
                  <div class="text-h4 q-mt-md">Mobile</div>
                  <div class="text-body1 q-mt-md text-center">
                    Accede desde tu dispositivo móvil para visualizar logs y estadísticas en tiempo
                    real.
                  </div>
                </div>
              </q-card>
              <q-card
                flat
                bordered
                class="col-12 col-md-4 q-pa-xl text-white q-mx-md selector-card"
                @click="seleccionarModo('escritorio')"
                style="
                  background: linear-gradient(135deg, #232345 80%, #2c2c44 100%);
                  border-radius: 24px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 16px #0004;
                "
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 32px #0008'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 16px #0004'"
              >
                <div class="column items-center">
                  <q-icon name="desktop_windows" color="secondary" size="100px" />
                  <div class="text-h4 q-mt-md">Escritorio</div>
                  <div class="text-body1 q-mt-md text-center">
                    Visualiza el flujo completo del plan de desarrollo y funcionalidades avanzadas.
                  </div>
                </div>
              </q-card>
            </div>
          </transition>
        </div>
        <div v-else-if="modoSeleccionado === 'mobile'">
          <transition name="slide-fade" mode="out-in">
            <div class="mobile-content" v-if="modoSeleccionado === 'mobile'">
              <!-- Aquí va el flujo actual de la app -->
              <div class="text-h3 text-white text-center q-mb-lg text-bold">Logs Biométricos</div>

              <!-- Mensaje cuando no hay datos -->
              <!-- <div v-if="noHayDatos" class="q-mb-lg">
                <NoDataMessage
                  title="No hay datos disponibles"
                  subtitle="No se encontraron registros en el período seleccionado"
                  description="Intenta cambiar las fechas en los filtros para ver más información"
                  icon="analytics"
                  icon-color="primary"
                  :animated="true"
                />
              </div> -->

              <div>
                <log-filters @filter="onFilter" />
                <div class="row q-gutter-y-md q-mt-md justify-center">
                  <!-- Usuarios Offline -->
                  <q-card
                    flat
                    bordered
                    class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
                    style="background-color: #1e1e2f; border-radius: 12px"
                  >
                    <div class="column items-center">
                      <q-icon name="cloud_off" color="orange" size="xl" />
                      <div class="text-subtitle1 q-mt-sm">Offline</div>
                      <div class="text-h5">{{ counters.Offline }}</div>
                    </div>
                  </q-card>
                  <!-- Fin usuarios Offline -->
                  <!-- Usuarios validados de TFLIFE -->
                  <q-card
                    flat
                    bordered
                    class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
                    style="background-color: #1e1e2f; border-radius: 12px"
                  >
                    <div class="column items-center">
                      <q-icon name="check_circle_outline" size="xl" class="text-positive q-mb-sm" />
                      <div class="text-subtitle2 q-mt-sm">Validados TFLIFE</div>
                      <div class="text-h5">{{ validadosTFLITE }}</div>
                    </div>
                  </q-card>
                  <!-- Fin Usuarios validados de TFLIFE -->
                  <!-- Porcentaje Offline -->
                  <q-card
                    flat
                    bordered
                    class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
                    style="background-color: #1e1e2f; border-radius: 12px"
                  >
                    <div class="column items-center">
                      <q-icon name="percent" color="blue" size="xl" />
                      <div class="text-subtitle1 q-mt-sm">% Offline</div>
                      <div class="text-h5">{{ porcentajeOffline.toFixed(1) }}%</div>
                    </div>
                  </q-card>
                  <!-- Fin Porcentaje Offline -->
                </div>

                <div class="row justify-center q-gutter-sm q-mt-lg">
                  <q-card
                    class="col-12 row justify-center text-white q-pa-md q-gutter-y-sm cardMobile"
                  >
                    <div class="col-sm-12 col-md-6 col-lg-6 text-white">
                      <!-- Funcionalidades más usadas -->
                      <q-card class="no-shadow" style="background-color: #1e1e2f">
                        <q-card-section>
                          <div class="text-h6 text-center">Funcionalidades más usadas</div>
                          <div class="canvaResponsive">
                            <canvas ref="funcionalidadesChartRef"></canvas>
                          </div>
                          <div
                            v-if="!funcionalidadesData || funcionalidadesData.length === 0"
                            class="no-data-overlay"
                          >
                            <NoDataMessage
                              title="Sin datos de funcionalidades"
                              subtitle="No se encontraron registros de uso de funcionalidades"
                              description="Los datos aparecerán aquí cuando se utilicen las diferentes funcionalidades del sistema"
                              icon="apps"
                              icon-color="blue"
                              :animated="true"
                            />
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-sm-12 col-md-6 col-lg-6 text-white">
                      <!-- Tiempo de Respuesta Promedio -->
                      <q-card class="no-shadow" style="background-color: #1e1e2f">
                        <q-card-section>
                          <div class="text-h6 text-center">Tiempo de Respuesta Promedio</div>
                          <div class="canvaResponsive">
                            <canvas ref="chartTiempoRef"></canvas>
                          </div>
                          <div
                            v-if="!tiempoPromedioData || tiempoPromedioData.length === 0"
                            class="no-data-overlay"
                          >
                            <NoDataMessage
                              title="Sin datos de rendimiento"
                              subtitle="No se encontraron mediciones de tiempo de respuesta"
                              description="Los datos de rendimiento aparecerán aquí cuando se realicen operaciones en el sistema"
                              icon="speed"
                              icon-color="green"
                              :animated="true"
                            />
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-sm-12 col-md-6 col-lg-6 q-mx-sm text-white">
                      <!-- Resultado del Evento -->
                      <q-card class="no-shadow" style="background-color: #1e1e2f">
                        <q-card-section>
                          <div class="text-h6 text-center">Resultado del Evento</div>
                          <div class="canvaResponsive">
                            <canvas ref="ovalChartRef"></canvas>
                          </div>
                          <div
                            v-if="!ovalAlineadoData || ovalAlineadoData.length === 0"
                            class="no-data-overlay"
                          >
                            <NoDataMessage
                              title="Sin datos de eventos"
                              subtitle="No se encontraron resultados de eventos"
                              description="Los resultados de eventos aparecerán aquí cuando se procesen operaciones"
                              icon="event"
                              icon-color="purple"
                              :animated="true"
                            />
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </q-card>
                </div>
                <br />
                <!-- Tabla de logs de dispositivos de usuarios -->
                <div class="col-12 col-lg-6 q-mx-sm text-white">
                  <div class="text-h6 text-center">Dispositivos de Usuarios</div>
                  <div v-if="!logs || logs.length === 0" class="q-mt-lg">
                    <NoDataMessage
                      title="Sin registros de dispositivos"
                      subtitle="No se encontraron logs de dispositivos de usuarios"
                      description="Los registros aparecerán aquí cuando los usuarios utilicen sus dispositivos"
                      icon="devices"
                      icon-color="orange"
                      :animated="true"
                    />
                  </div>
                  <log-table v-else :logs="logs" class="q-mt-lg" />
                </div>
                <!-- Fin de la tabla de logs de dispositivos de usuarios -->
              </div>
            </div>
          </transition>
        </div>
        <div v-else-if="modoSeleccionado === 'escritorio'">
          <transition name="slide-fade" mode="out-in">
            <div class="escritorio-content" v-if="modoSeleccionado === 'escritorio'">
              <FlujoEscritorio />
            </div>
          </transition>
        </div>
      </q-card>
    </q-page>

    <!-- Indicador de carga al cambiar de modo -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
      <div class="q-mt-md text-white">Cambiando de vista...</div>
    </q-inner-loading>
  </q-layout>
</template>


<script setup>
import { ref, nextTick, inject, computed, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import {
  getUsuariosOffline,
  getUsuariosDispositivosDia,
  getValidadosTFLite,
  getPorcentajeOffline,
  getTiempoRespuestaPromedio,
  getOvalAlineado,
  getFuncionalidadesMasUsadas,
} from 'src/services/api'
import LogFilters from 'components/LogFilters.vue'
import LogTable from 'components/LogTable.vue'
import FlujoEscritorio from '../components/escritorio/FlujoEscritorio.vue'
import NoDataMessage from 'components/NoDataMessage.vue'
import { useFiltroFechasStore } from 'src/stores/filtroFechasStore'

const logs = ref([])
const validadosTFLITE = ref(0)
const porcentajeOffline = ref(0)
let chartTiempoInstance = null
const tiempoPromedioData = ref(0)
const chartTiempoRef = ref(null)
const ovalAlineadoData = ref([])
const ovalChartRef = ref(null)
let ovalChartInstance = null
const funcionalidadesData = ref([])
let chartFuncionalidadesInstance = null
const funcionalidadesChartRef = ref(null)
const filtroFechasStore = useFiltroFechasStore()

// Inyectar el estado del flujo desde el layout padre
const selectedFlow = inject('selectedFlow', ref('mobile'))

// Usar computed para determinar el modo seleccionado basado en el flujo inyectado
const modoSeleccionado = computed(() =>
  selectedFlow.value === 'escritorio' ? 'escritorio' : 'mobile'
)

const loading = ref(false)
const loadingCharts = ref(false)

// Función para volver al selector de modos
// function volverAlSelector() {
//   selectedFlow.value = null
// }

// Función para seleccionar el modo
function seleccionarModo(modo) {
  loading.value = true
  selectedFlow.value = modo
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const counters = ref({
  Offline: 0,
  Total: 0,
  Sincronizados: 0,
})

// Computed para verificar si no hay datos
// const noHayDatos = computed(() => {
//   return (
//     counters.value.Offline === 0 &&
//     validadosTFLITE.value === 0 &&
//     porcentajeOffline.value === 0 &&
//     (!logs.value || logs.value.length === 0) &&
//     (!tiempoPromedioData.value || tiempoPromedioData.value.length === 0) &&
//     (!ovalAlineadoData.value || ovalAlineadoData.value.length === 0) &&
//     (!funcionalidadesData.value || funcionalidadesData.value.length === 0)
//   )
// })

// Inicializar con modo mobile por defecto
onMounted(() => {
  if (!selectedFlow.value) {
    selectedFlow.value = 'mobile'
    setTimeout(() => {
      onFilter()
      // Inicializar gráficas vacías
      renderChartTiempo()
      renderChartOval()
      renderChartFuncionalidades([], [])
    }, 500)
  }
})

// Watcher para actualizar gráficas automáticamente cuando cambien las fechas
watch(
  () => [filtroFechasStore.fechaInicio, filtroFechasStore.fechaFin],
  async (newDates, oldDates) => {
    if (
      modoSeleccionado.value === 'mobile' &&
      (newDates[0] !== oldDates[0] || newDates[1] !== oldDates[1])
    ) {
      console.log('📅 Fechas cambiadas en mobile, actualizando gráficas:', {
        old: oldDates,
        new: newDates,
      })
      await actualizarContadoresYGraficas(newDates[0], newDates[1])
    }
  },
  { immediate: false }
)
async function onFilter() {
  if (loadingCharts.value) return // Evitar múltiples llamadas simultáneas

  loadingCharts.value = true

  try {
    const start_date = filtroFechasStore.fechaInicio
    const end_date = filtroFechasStore.fechaFin
    await cargarValidadosTFLITE()
    await cargarPorcentajeOffline(start_date, end_date)
    await cargarTiempoRespuestaPromedio(start_date, end_date)
    await cargarOvalAlineado(start_date, end_date)
    await cargarFuncionalidadesMasUsadas(start_date, end_date)
    const payload = {
      offline: true,
      fechaInicio: start_date,
      fechaFin: end_date,
    }
    try {
      console.log('Payload enviado:', payload)
      // 🔸 Usuarios Offline
      const respuesta = await getUsuariosOffline(payload)
      console.log('Respuesta offline:', respuesta)
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        counters.value.Offline = respuesta[0].total
        console.log('Nuevo valor offline:', counters.value.Offline)
      } else {
        counters.value.Offline = 0
      }
      // 🔸 Usuarios por dispositivo (solo con la fecha de inicio)
      const respuestaDispositivos = await getUsuariosDispositivosDia()
      console.log('Respuesta dispositivos (sin filtrar):', respuestaDispositivos)
      const datosFiltrados = respuestaDispositivos.filter((item) => {
        const fechaItem = new Date(item.fecha)
        return fechaItem >= new Date(start_date) && fechaItem <= new Date(end_date)
      })
      logs.value = datosFiltrados
    } catch (error) {
      console.error('Error al obtener datos:', error)
      counters.value.Offline = 0
    }

    // Siempre renderizar las gráficas, incluso si hay errores
    setTimeout(() => {
      renderChartTiempo()
      renderChartOval()
      renderChartFuncionalidades(
        funcionalidadesData.value?.map((d) => d.funcionalidad) || [],
        funcionalidadesData.value?.map((d) => {
          const [h, m, s] = d.duracion.split(':').map(Number)
          return h * 3600 + m * 60 + s
        }) || []
      )
    }, 100)
  } finally {
    loadingCharts.value = false
  }
}

// Función para actualizar contadores y gráficas cuando cambien las fechas
async function actualizarContadoresYGraficas(start_date, end_date) {
  if (loadingCharts.value) return // Evitar múltiples llamadas simultáneas

  loadingCharts.value = true

  try {
    console.log('🔄 Actualizando contadores y gráficas con fechas:', { start_date, end_date })

    // Actualizar contadores
    await Promise.all([
      cargarValidadosTFLITE(),
      cargarPorcentajeOffline(start_date, end_date),
      // Actualizar usuarios offline
      (async () => {
        const payload = { offline: true, fechaInicio: start_date, fechaFin: end_date }
        const respuesta = await getUsuariosOffline(payload)
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          counters.value.Offline = respuesta[0].total
        } else {
          counters.value.Offline = 0
        }
      })(),
      // Actualizar logs de dispositivos
      (async () => {
        const respuestaDispositivos = await getUsuariosDispositivosDia()
        const datosFiltrados = respuestaDispositivos.filter((item) => {
          const fechaItem = new Date(item.fecha)
          return fechaItem >= new Date(start_date) && fechaItem <= new Date(end_date)
        })
        logs.value = datosFiltrados
      })(),
    ])

    // Actualizar gráficas
    await actualizarGraficasConFechas(start_date, end_date)
  } catch (error) {
    console.error('❌ Error al actualizar contadores y gráficas:', error)
  } finally {
    loadingCharts.value = false
  }
}

// Función separada para actualizar gráficas con fechas específicas
async function actualizarGraficasConFechas(start_date, end_date) {
  try {
    console.log('🔄 Actualizando gráficas con fechas específicas:', { start_date, end_date })

    await Promise.all([
      cargarTiempoRespuestaPromedio(start_date, end_date),
      cargarOvalAlineado(start_date, end_date),
      cargarFuncionalidadesMasUsadas(start_date, end_date),
    ])

    // Re-renderizar gráficas con delay para asegurar que los datos estén listos
    setTimeout(() => {
      renderChartTiempo()
      renderChartOval()
      renderChartFuncionalidades(
        funcionalidadesData.value?.map((d) => d.funcionalidad) || [],
        funcionalidadesData.value?.map((d) => {
          const [h, m, s] = d.duracion.split(':').map(Number)
          return h * 3600 + m * 60 + s
        }) || []
      )
    }, 200)
  } catch (error) {
    console.error('❌ Error al actualizar gráficas con fechas:', error)
  }
}

// Funcion cargar validados TFLITE
async function cargarValidadosTFLITE() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
  try {
    const respuestaValidados = await getValidadosTFLite({
      validado: true,
      fechaInicio: start_date,
      fechaFin: end_date,
    })
    console.log('Respuesta validados TFLITE:', respuestaValidados)
    validadosTFLITE.value =
      Array.isArray(respuestaValidados) && respuestaValidados.length > 0
        ? respuestaValidados[0].total
        : 0
  } catch (e) {
    console.error('Error al obtener validados TFLITE:', e)
    validadosTFLITE.value = 0
  }
}

// Funcion cargar porcentaje offline
async function cargarPorcentajeOffline() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
  try {
    const respuesta = await getPorcentajeOffline({
      offline: true,
      clave: 'EXITO',
      fechaInicio: start_date,
      fechaFin: end_date,
    })
    console.log('Respuesta porcentaje offline:', respuesta)
    porcentajeOffline.value =
      Array.isArray(respuesta) && respuesta.length > 0 ? Number(respuesta[0].porcentaje) : 0
  } catch (e) {
    console.error('Error al obtener porcentaje offline:', e)
    porcentajeOffline.value = 0
  }
}

// Funcion cargar tiempo de respuesta promedio
async function cargarTiempoRespuestaPromedio(start_date, end_date) {
  try {
    const data = await getTiempoRespuestaPromedio({
      fechaInicio: start_date,
      fechaFin: end_date,
    })
    console.log('Respuesta tiempo promedio cruda:', data)
    // Fuerza a convertir a array real por si viene como objeto numerado
    const valores = Array.isArray(data) ? data : Object.values(data)
    tiempoPromedioData.value = valores
    if (!Array.isArray(tiempoPromedioData.value)) {
      console.warn('Los datos de tiempo promedio no son un array:', tiempoPromedioData.value)
      return
    }
    await renderChartTiempo()
  } catch (e) {
    console.error('Error al obtener tiempo promedio:', e)
    tiempoPromedioData.value = []
    await renderChartTiempo()
  }
}

//Funcion para renderizar el gráfico de tiempo promedio>
async function renderChartTiempo() {
  if (chartTiempoInstance) chartTiempoInstance.destroy()
  await nextTick()
  const ctx = chartTiempoRef.value?.getContext?.('2d')
  if (!ctx) return

  let labels = []
  let valores = []
  let backgroundColors = []

  if (Array.isArray(tiempoPromedioData.value) && tiempoPromedioData.value.length > 0) {
    labels = tiempoPromedioData.value.map((e) => e.tipoEvento)
    valores = tiempoPromedioData.value.map((e) => e.tiempoPromedioMs)
    backgroundColors = valores.map((ms) => {
      if (ms < 300) return '#66bb6a' // verde
      if (ms < 400) return '#ffa726' // naranja
      return '#ef5350' // rojo
    })
  } else {
    // Datos por defecto cuando no hay información
    labels = ['Sin datos']
    valores = [0]
    backgroundColors = ['#666']
  }

  chartTiempoInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Tiempo Promedio (Login)',
          data: valores,
          backgroundColor: backgroundColors,
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } },
        tooltip: {
          callbacks: {
            label: (context) => {
              const ms = context.parsed.y
              if (ms === 0 && labels[0] === 'Sin datos') {
                return 'No hay datos disponibles'
              }
              return `Tiempo Promedio: ${ms.toFixed(0)} ms (${(ms / 1000).toFixed(2)} s)`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#ccc',
            maxRotation: 25,
            minRotation: 0,
            font: { weight: 'bold' },
          },
          grid: { color: '#444' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#ccc' },
          grid: { color: '#444' },
          title: {
            display: true,
            text: 'Milisegundos',
            color: '#ccc',
            font: { weight: 'bold' },
          },
        },
      },
    },
  })
}

// Función para cargar los datos de Oval Alineado
async function cargarOvalAlineado(start_date, end_date) {
  try {
    const data = await getOvalAlineado({
      fechaInicio: start_date,
      fechaFin: end_date,
    })
    console.log('Respuesta oval alineado:', data)
    // Aseguramos que sea un array válido
    const valores = Array.isArray(data) ? data : Object.values(data)
    ovalAlineadoData.value = valores
    // Espera que se monte el canvas antes de graficar
    await nextTick()
    renderChartOval()
  } catch (e) {
    console.error('Error al obtener oval alineado:', e)
    ovalAlineadoData.value = []
    await nextTick()
    renderChartOval()
  }
}

// Función para renderizar el gráfico de Oval Alineado
function renderChartOval() {
  if (!ovalChartRef.value) {
    console.warn('⚠️ ovalChartRef no está montado aún.')
    // Reintentar después de un breve delay
    setTimeout(() => {
      if (ovalChartRef.value) {
        renderChartOval()
      }
    }, 100)
    return
  }
  if (ovalChartInstance) {
    ovalChartInstance.destroy()
  }

  let labels = []
  let values = []

  if (Array.isArray(ovalAlineadoData.value) && ovalAlineadoData.value.length > 0) {
    labels = ovalAlineadoData.value.map((d) => d.ovalAlineado)
    values = ovalAlineadoData.value.map((d) => d.total)
  } else {
    // Datos por defecto cuando no hay información
    labels = ['Sin datos']
    values = [0]
  }

  ovalChartInstance = new Chart(ovalChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Oval Alineado',
          data: values,
          backgroundColor: values[0] === 0 ? ['#666'] : ['#4CAF50', '#FFC107', '#F44336'],
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#ffffff' },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (values[0] === 0 && labels[0] === 'Sin datos') {
                return 'No hay datos disponibles'
              }
              return `${ctx.label}: ${ctx.parsed.y}`
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#ccc', font: { weight: 'bold' } }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc', font: { weight: 'bold' } }, grid: { color: '#444' } },
      },
    },
  })
}

// Función para cargar las funcionalidades más usadas
async function cargarFuncionalidadesMasUsadas(start_date, end_date) {
  try {
    const data = await getFuncionalidadesMasUsadas({
      fechaInicio: start_date,
      fechaFin: end_date,
    })
    // Asegura que es un array
    const valores = Array.isArray(data) ? data : Object.values(data)
    funcionalidadesData.value = valores

    // Extrae y convierte a segundos
    const labels = valores.map((d) => d.funcionalidad)
    const duraciones = valores.map((d) => {
      const [h, m, s] = d.duracion.split(':').map(Number)
      return h * 3600 + m * 60 + s
    })
    // Dibuja la gráfica
    renderChartFuncionalidades(labels, duraciones)
  } catch (e) {
    console.error('Error al obtener funcionalidades más usadas:', e)
    funcionalidadesData.value = []
    renderChartFuncionalidades([], [])
  }
}

// Función para renderizar el gráfico de funcionalidades más usadas
function renderChartFuncionalidades(labels, data) {
  if (!funcionalidadesChartRef.value) {
    console.warn('funcionalidadesChartRef no está montado aún.')
    // Reintentar después de un breve delay
    setTimeout(() => {
      if (funcionalidadesChartRef.value) {
        renderChartFuncionalidades(labels, data)
      }
    }, 100)
    return
  }
  if (chartFuncionalidadesInstance) {
    chartFuncionalidadesInstance.destroy()
  }

  let finalLabels = labels || []
  let finalData = data || []

  if (!finalLabels.length || !finalData.length) {
    // Datos por defecto cuando no hay información
    finalLabels = ['Sin datos']
    finalData = [0]
  }

  chartFuncionalidadesInstance = new Chart(funcionalidadesChartRef.value, {
    type: 'bar',
    data: {
      labels: finalLabels,
      datasets: [
        {
          label: 'Duración (segundos)',
          data: finalData,
          backgroundColor: finalData[0] === 0 ? '#666' : '#42A5F5',
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (finalData[0] === 0 && finalLabels[0] === 'Sin datos') {
                return 'No hay datos disponibles'
              }
              const val = ctx.raw
              const minutes = Math.floor(val / 60)
              const seconds = val % 60
              return `Duración: ${minutes}m ${seconds}s`
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#ccc', font: { weight: 'bold' } }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc', font: { weight: 'bold' } }, grid: { color: '#444' } },
      },
    },
  })
}
</script>

<style scoped>
/* Transiciones suaves entre modos */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.6s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Estilos para las tarjetas del selector */
.selector-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

/* Animaciones para los iconos */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.selector-card:hover .q-icon {
  animation: pulse 0.6s ease-in-out;
}

/* Overlay para mensajes de no hay datos */
.no-data-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(18, 24, 38, 0.9);
  z-index: 10;
}

/* Mejoras visuales para las tarjetas KPI */
.kpi-card {
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.cardMobile {
  background-color: #1e1e2f; border-radius: 1rem
}

@media (max-width: 768px) {
  .canvaResponsive{
    height: 200px !important;
    width: max-content !important;
  }

  .cardMobile{
    background-color: transparent !important;
  }
}
</style>
