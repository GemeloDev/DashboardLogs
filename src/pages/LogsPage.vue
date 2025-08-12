<template>
  <q-layout>
    <q-page class="q-pa-md" style="background-color: #121826">
      <q-card flat bordered class="q-pa-md" style="background-color: #121826">
        <div v-if="!modoSeleccionado">
          <!-- <div class="row q-col-gutter-md q-mt-xl justify-center">
            <q-card
              flat
              bordered
              class="col-12 col-md-4 q-pa-xl text-white q-mx-md selector-card"
              @click="seleccionarModo('mobile')"
              style="
                background: linear-gradient(135deg, #1e1e2f 80%, #2c2c44 100%);
                border-radius: 24px;
                cursor: pointer;
                transition: box-shadow 0.2s;
                box-shadow: 0 2px 16px #0004;
              "
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
                transition: box-shadow 0.2s;
                box-shadow: 0 2px 16px #0004;
              "
            >
              <div class="column items-center">
                <q-icon name="desktop_windows" color="secondary" size="100px" />
                <div class="text-h4 q-mt-md">Escritorio</div>
                <div class="text-body1 q-mt-md text-center">
                  Visualiza el flujo completo del plan de desarrollo y funcionalidades avanzadas.
                </div>
              </div>
            </q-card>
          </div> -->
        </div>
        <div v-else-if="modoSeleccionado === 'mobile'">
          <div class="row q-mt-md justify-end">
            <q-btn
              color="accent"
              icon="arrow_back"
              label="Regresar al selector"
              @click="modoSeleccionado = null"
              flat
              rounded
              class="q-mb-md"
            />
          </div>
          <!-- Aquí va el flujo actual de la app -->
          <div class="text-h3 text-white text-center">Logs Biométricos</div>
          <log-filters @filter="onFilter" />
          <div class="row q-col-gutter-md q-mt-md justify-center">
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
          <div class="row q-col-gutter-md q-mt-lg justify-center">
            <br />
            <div class="col-12 col-lg-6 q-mx-sm text-white">
              <!-- Funcionalidades más usadas -->
              <q-card style="background-color: #1e1e2f">
                <q-card-section>
                  <div class="text-h6 text-center">Funcionalidades más usadas</div>
                  <div class="chart-wrapper">
                    <canvas
                      ref="funcionalidadesChartRef"
                      style="height: 420px; max-width: 100%"
                    ></canvas>
                  </div>
                </q-card-section>
              </q-card>
              <!--Fin de la grafica resultado De-->
            </div>
            <br />
            <div class="col-12 col-lg-6 q-mx-sm text-white">
              <!-- Tiempo de Respuesta Promedio -->
              <q-card style="background-color: #1e1e2f">
                <q-card-section>
                  <div class="text-h6 text-center">Tiempo de Respuesta Promedio</div>
                  <div class="chart-wrapper">
                    <canvas ref="chartTiempoRef" style="height: 420px; max-width: 100%"></canvas>
                  </div>
                </q-card-section>
              </q-card>
              <!--Fin de la grafica timpo de respuesta promedio-->
            </div>
            <br />
            <div class="col-12 col-lg-6 q-mx-sm text-white">
              <!-- Resultado del Evento -->
              <q-card style="background-color: #1e1e2f">
                <q-card-section>
                  <div class="text-h6 text-center">Resultado del Evento</div>
                  <div class="chart-wrapper">
                    <canvas ref="ovalChartRef" style="height: 420px; max-width: 100%"></canvas>
                  </div>
                </q-card-section>
              </q-card>
              <!--Fin de la grafica resultado Del evento-->
            </div>
          </div>
          <br />
          <!-- Tabla de logs de dispositivos de usuarios -->
          <div class="col-12 col-lg-6 q-mx-sm text-white">
            <div class="text-h6 text-center">Dispositivos de Usuarios</div>
            <log-table :logs="logs" class="q-mt-lg" />
          </div>
          <!-- Fin de la tabla de logs de dispositivos de usuarios -->
        </div>
        <div v-else-if="modoSeleccionado === 'escritorio'">
          <div class="row q-mt-md justify-end">
            <q-btn
              color="accent"
              icon="arrow_back"
              label="Regresar al selector"
              @click="modoSeleccionado = null"
              flat
              rounded
              class="q-mb-md"
            />
          </div>
          <escritorio-flujo />
        </div>
        import EscritorioFlujo from 'components/escritorio/FlujoEscritorio.vue'
        <div class="text-h3 text-white text-center">Logs Biométricos</div>
        <log-filters @filter="onFilter" />
        <div class="row q-col-gutter-md q-mt-md justify-center">
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
        <div class="row q-col-gutter-md q-mt-lg justify-center">
          <br />
          <div class="col-12 col-lg-6 q-mx-sm text-white">
            <!-- Funcionalidades más usadas -->
            <q-card style="background-color: #1e1e2f">
              <q-card-section>
                <div class="text-h6 text-center">Funcionalidades más usadas</div>
                <div class="chart-wrapper">
                  <canvas
                    ref="funcionalidadesChartRef"
                    style="height: 420px; max-width: 100%"
                  ></canvas>
                </div>
              </q-card-section>
            </q-card>
            <!--Fin de la grafica resultado De-->
          </div>
          <br />
          <div class="col-12 col-lg-6 q-mx-sm text-white">
            <!-- Tiempo de Respuesta Promedio -->
            <q-card style="background-color: #1e1e2f">
              <q-card-section>
                <div class="text-h6 text-center">Tiempo de Respuesta Promedio</div>
                <div class="chart-wrapper">
                  <canvas ref="chartTiempoRef" style="height: 420px; max-width: 100%"></canvas>
                </div>
              </q-card-section>
            </q-card>
            <!--Fin de la grafica timpo de respuesta promedio-->
          </div>
          <br />
          <div class="col-12 col-lg-6 q-mx-sm text-white">
            <!-- Resultado del Evento -->
            <q-card style="background-color: #1e1e2f">
              <q-card-section>
                <div class="text-h6 text-center">Resultado del Evento</div>
                <div class="chart-wrapper">
                  <canvas ref="ovalChartRef" style="height: 420px; max-width: 100%"></canvas>
                </div>
              </q-card-section>
            </q-card>
            <!--Fin de la grafica resultado Del evento-->
          </div>
        </div>
        <br />
        <!-- Tabla de logs de dispositivos de usuarios -->
        <div class="col-12 col-lg-6 q-mx-sm text-white">
          <div class="text-h6 text-center">Dispositivos de Usuarios</div>
          <log-table :logs="logs" class="q-mt-lg" />
        </div>
        <!-- Fin de la tabla de logs de dispositivos de usuarios -->
      </q-card>
    </q-page>
  </q-layout>
</template>


<script setup>
import { ref, nextTick } from 'vue'
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

const counters = ref({
  Offline: 0,
  Total: 0,
  Sincronizados: 0,
})

const modoSeleccionado = ref(null)

// function seleccionarModo(modo) {
//   modoSeleccionado.value = modo
// }

if (typeof window !== 'undefined') {
  window.addEventListener('cambiar-flujo', (e) => {
    modoSeleccionado.value = e.detail
  })
}

// Esta función se ejecuta cuando haces clic en "Filtrar"
async function onFilter() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
  await cargarValidadosTFLITE()
  await cargarPorcentajeOffline(start_date, end_date)
  await cargarTiempoRespuestaPromedio(start_date, end_date)
  await cargarOvalAlineado()
  await cargarFuncionalidadesMasUsadas()
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
async function cargarTiempoRespuestaPromedio() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
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
  }
}

//Funcion para renderizar el gráfico de tiempo promedio>
async function renderChartTiempo() {
  if (chartTiempoInstance) chartTiempoInstance.destroy()
  await nextTick()
  const ctx = chartTiempoRef.value?.getContext?.('2d')
  if (!ctx) return
  if (!Array.isArray(tiempoPromedioData.value)) {
    console.warn('⚠️ No es un array válido:', tiempoPromedioData.value)
    return
  }
  const labels = tiempoPromedioData.value.map((e) => e.tipoEvento)
  const valores = tiempoPromedioData.value.map((e) => e.tiempoPromedioMs)
  const backgroundColors = valores.map((ms) => {
    if (ms < 300) return '#66bb6a' // verde
    if (ms < 400) return '#ffa726' // naranja
    return '#ef5350' // rojo
  })
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
            font: { size: 12 },
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
            font: { size: 12 },
          },
        },
      },
    },
  })
}

// Función para cargar los datos de Oval Alineado
async function cargarOvalAlineado() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
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
  }
}

// Función para renderizar el gráfico de Oval Alineado
function renderChartOval() {
  if (!ovalChartRef.value) {
    console.warn('⚠️ ovalChartRef no está montado aún.')
    return
  }
  if (ovalChartInstance) {
    ovalChartInstance.destroy()
  }
  const labels = ovalAlineadoData.value.map((d) => d.ovalAlineado)
  const values = ovalAlineadoData.value.map((d) => d.total)
  ovalChartInstance = new Chart(ovalChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Oval Alineado',
          data: values,
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#ffffff' },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
      },
    },
  })
}

// Función para cargar las funcionalidades más usadas
async function cargarFuncionalidadesMasUsadas() {
  const start_date = filtroFechasStore.fechaInicio
  const end_date = filtroFechasStore.fechaFin
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
  }
}

// Función para renderizar el gráfico de funcionalidades más usadas
function renderChartFuncionalidades(labels, data) {
  if (!funcionalidadesChartRef.value) {
    console.warn('funcionalidadesChartRef no está montado aún.')
    return
  }
  if (chartFuncionalidadesInstance) {
    chartFuncionalidadesInstance.destroy()
  }
  chartFuncionalidadesInstance = new Chart(funcionalidadesChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Duración (segundos)',
          data,
          backgroundColor: '#42A5F5',
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
              const val = ctx.raw
              const minutes = Math.floor(val / 60)
              const seconds = val % 60
              return `Duración: ${minutes}m ${seconds}s`
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
      },
    },
  })
}
</script>
