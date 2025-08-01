<template>
  <q-card class="graphics-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-lg">
        <q-icon name="bar_chart" size="32px" class="q-mr-sm" color="primary" />
        Dashboard de Gráficas Dinámicas
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Gráfica de Errores -->
        <div class="col-12 col-lg-6">
          <q-card class="chart-container error-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="error_outline" size="24px" class="q-mr-sm text-red-5" />
                <div class="text-h6">Errores del Sistema</div>
                <q-space />
                <q-chip color="red" text-color="white" size="sm">
                  {{ totalErrores }} errores
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="erroresChart"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Escaneos -->
        <div class="col-12 col-lg-6">
          <q-card class="chart-container scan-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="qr_code_scanner" size="24px" class="q-mr-sm text-blue-5" />
                <div class="text-h6">Escaneos por Tipo</div>
                <q-space />
                <q-chip color="blue" text-color="white" size="sm">
                  {{ totalEscanos }} escaneos
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="escanosChart"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Registros -->
        <div class="col-12 col-lg-6">
          <q-card class="chart-container register-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="how_to_reg" size="24px" class="q-mr-sm text-green-5" />
                <div class="text-h6">Registros Completados</div>
                <q-space />
                <q-chip color="green" text-color="white" size="sm">
                  {{ totalRegistros }} registros
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="registrosChart"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Nueva Gráfica de Login -->
        <div class="col-12 col-lg-6">
          <q-card class="chart-container login-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="login" size="24px" class="q-mr-sm text-purple-5" />
                <div class="text-h6">Intentos de Login</div>
                <q-space />
                <q-chip color="purple" text-color="white" size="sm">
                  {{ totalLogins }} intentos
                </q-chip>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="loginChart"></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref, onMounted, watch, defineEmits, computed } from 'vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

const erroresChart = ref(null)
const escanosChart = ref(null)
const registrosChart = ref(null)
const loginChart = ref(null)

const chartInstanceErrores = ref(null)
const chartInstanceEscanos = ref(null)
const chartInstanceRegistros = ref(null)
const chartInstanceLogin = ref(null)

const datosErrores = ref([])
const datosEscanos = ref([])
const datosRegistros = ref([])
const datosLogins = ref([])

const emit = defineEmits(['detalle'])
const props = defineProps({ filtros: Object })

// Computed para mostrar totales
const totalErrores = computed(() =>
  datosErrores.value.reduce((acc, item) => acc + item.cantidad, 0)
)
const totalEscanos = computed(() =>
  datosEscanos.value.reduce((acc, item) => acc + item.cantidad, 0)
)
const totalRegistros = computed(() =>
  datosRegistros.value.reduce((acc, item) => acc + item.cantidad, 0)
)
const totalLogins = computed(() =>
  datosLogins.value.reduce((acc, item) => acc + item.exitosos + item.fallidos, 0)
)

watch(
  () => props.filtros,
  (val) => {
    cargarGraficas(val)
  }
)

onMounted(() => {
  cargarGraficas(props.filtros)
})

async function cargarGraficas(filtros) {
  await Promise.all([
    cargarErrores(filtros),
    cargarEscanos(filtros),
    cargarRegistros(filtros),
    cargarLogins(filtros),
  ])
}

async function cargarErrores(filtros) {
  try {
    const res = await axios.get('http://localhost:8005/api/logs/filter', {
      params: {
        type: 'ERROR',
        fromDate: filtros?.rangoFechas?.from,
        toDate: filtros?.rangoFechas?.to,
        oficinaId: filtros?.oficina,
        personId: filtros?.usuario,
      },
    })
    datosErrores.value = procesarDatosPorFecha(res.data)
  } catch {
    datosErrores.value = [
      { fecha: '2024-06-01', cantidad: 5, detalles: [{ msg: 'Error de conexión' }] },
      { fecha: '2024-06-02', cantidad: 2, detalles: [{ msg: 'Error de autenticación' }] },
      { fecha: '2024-06-03', cantidad: 8, detalles: [{ msg: 'Error de validación' }] },
    ]
  }
  renderErroresChart(datosErrores.value)
}

async function cargarEscanos(filtros) {
  try {
    const res = await axios.get('http://localhost:8005/api/logs/summary', {
      params: {
        fromDate: filtros?.rangoFechas?.from,
        toDate: filtros?.rangoFechas?.to,
        oficinaId: filtros?.oficina,
        personId: filtros?.usuario,
      },
    })
    datosEscanos.value = res.data.MatchedLogs.map((e) => ({
      fecha: e.EndDate?.split('T')[0],
      tipo: e.Process,
      cantidad: 1,
      detalles: [e],
    }))
  } catch {
    datosEscanos.value = [
      { fecha: '2024-06-01', tipo: 'QR', cantidad: 15, detalles: [{ msg: 'Scan QR exitoso' }] },
      { fecha: '2024-06-02', tipo: 'MRZ', cantidad: 12, detalles: [{ msg: 'Scan MRZ exitoso' }] },
      { fecha: '2024-06-03', tipo: 'OCR', cantidad: 8, detalles: [{ msg: 'Scan OCR exitoso' }] },
    ]
  }
  renderEscanosChart(datosEscanos.value)
}

async function cargarRegistros(filtros) {
  try {
    const res = await axios.get('http://localhost:8005/api/logs/filter', {
      params: {
        process: 'REGISTER',
        fromDate: filtros?.rangoFechas?.from,
        toDate: filtros?.rangoFechas?.to,
        oficinaId: filtros?.oficina,
        personId: filtros?.usuario,
      },
    })
    datosRegistros.value = procesarDatosPorFecha(res.data)
  } catch {
    datosRegistros.value = [
      { fecha: '2024-06-01', cantidad: 6, detalles: [{ msg: 'Registro exitoso' }] },
      { fecha: '2024-06-02', cantidad: 4, detalles: [{ msg: 'Registro completado' }] },
      { fecha: '2024-06-03', cantidad: 9, detalles: [{ msg: 'Registro validado' }] },
    ]
  }
  renderRegistrosChart(datosRegistros.value)
}

async function cargarLogins(filtros) {
  try {
    const [exitososRes, fallidosRes] = await Promise.all([
      axios.get('http://localhost:8005/api/logs/filter', {
        params: {
          type: 'SUCCESS',
          process: 'LOGIN',
          fromDate: filtros?.rangoFechas?.from,
          toDate: filtros?.rangoFechas?.to,
          oficinaId: filtros?.oficina,
        },
      }),
      axios.get('http://localhost:8005/api/logs/filter', {
        params: {
          type: 'ERROR',
          process: 'LOGIN',
          fromDate: filtros?.rangoFechas?.from,
          toDate: filtros?.rangoFechas?.to,
          oficinaId: filtros?.oficina,
        },
      }),
    ])

    const exitosos = procesarDatosPorFecha(exitososRes.data)
    const fallidos = procesarDatosPorFecha(fallidosRes.data)

    datosLogins.value = combinarDatosLogin(exitosos, fallidos)
  } catch {
    datosLogins.value = [
      { fecha: '2024-06-01', exitosos: 25, fallidos: 3, detalles: [] },
      { fecha: '2024-06-02', exitosos: 30, fallidos: 1, detalles: [] },
      { fecha: '2024-06-03', exitosos: 22, fallidos: 5, detalles: [] },
    ]
  }
  renderLoginChart(datosLogins.value)
}

function procesarDatosPorFecha(data) {
  const agrupados = {}
  data.forEach((item) => {
    const fecha = item.Date?.split('T')[0] || '2024-06-01'
    if (!agrupados[fecha]) {
      agrupados[fecha] = { fecha, cantidad: 0, detalles: [] }
    }
    agrupados[fecha].cantidad++
    agrupados[fecha].detalles.push(item)
  })
  return Object.values(agrupados)
}

function combinarDatosLogin(exitosos, fallidos) {
  const fechas = new Set([...exitosos.map((e) => e.fecha), ...fallidos.map((f) => f.fecha)])
  return Array.from(fechas).map((fecha) => ({
    fecha,
    exitosos: exitosos.find((e) => e.fecha === fecha)?.cantidad || 0,
    fallidos: fallidos.find((f) => f.fecha === fecha)?.cantidad || 0,
    detalles: [
      ...(exitosos.find((e) => e.fecha === fecha)?.detalles || []),
      ...(fallidos.find((f) => f.fecha === fecha)?.detalles || []),
    ],
  }))
}

function renderErroresChart(data) {
  if (chartInstanceErrores.value) chartInstanceErrores.value.destroy()
  const ctx = erroresChart.value.getContext('2d')
  chartInstanceErrores.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((e) => e.fecha),
      datasets: [
        {
          label: 'Errores por Día',
          data: data.map((e) => e.cantidad),
          backgroundColor: 'rgba(239, 83, 80, 0.8)',
          borderColor: 'rgba(239, 83, 80, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      onClick: (evt, elements) => {
        if (elements.length) {
          const idx = elements[0].index
          emit('detalle', data[idx].detalles)
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#ffffff',
            font: { size: 14 },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#ef5350',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
      },
    },
  })
}

function renderEscanosChart(data) {
  if (chartInstanceEscanos.value) chartInstanceEscanos.value.destroy()
  const ctx = escanosChart.value.getContext('2d')

  // Agrupar por tipo de escaneo
  const tiposEscaneo = data.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = 0
    acc[item.tipo] += item.cantidad
    return acc
  }, {})

  const colores = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336']

  chartInstanceEscanos.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(tiposEscaneo),
      datasets: [
        {
          label: 'Escaneos por Tipo',
          data: Object.values(tiposEscaneo),
          backgroundColor: colores,
          borderColor: '#1e1e2f',
          borderWidth: 3,
        },
      ],
    },
    options: {
      onClick: (evt, elements) => {
        if (elements.length) {
          const idx = elements[0].index
          const tipo = Object.keys(tiposEscaneo)[idx]
          const detalles = data.filter((d) => d.tipo === tipo).flatMap((d) => d.detalles)
          emit('detalle', detalles)
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { size: 12 },
            padding: 20,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
        },
      },
    },
  })
}

function renderRegistrosChart(data) {
  if (chartInstanceRegistros.value) chartInstanceRegistros.value.destroy()
  const ctx = registrosChart.value.getContext('2d')
  chartInstanceRegistros.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((e) => e.fecha),
      datasets: [
        {
          label: 'Registros Completados',
          data: data.map((e) => e.cantidad),
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    },
    options: {
      onClick: (evt, elements) => {
        if (elements.length) {
          const idx = elements[0].index
          emit('detalle', data[idx].detalles)
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#ffffff',
            font: { size: 14 },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4CAF50',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
      },
    },
  })
}

function renderLoginChart(data) {
  if (chartInstanceLogin.value) chartInstanceLogin.value.destroy()
  const ctx = loginChart.value.getContext('2d')
  chartInstanceLogin.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((e) => e.fecha),
      datasets: [
        {
          label: 'Logins Exitosos',
          data: data.map((e) => e.exitosos),
          backgroundColor: 'rgba(156, 39, 176, 0.8)',
          borderColor: 'rgba(156, 39, 176, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Logins Fallidos',
          data: data.map((e) => e.fallidos),
          backgroundColor: 'rgba(244, 67, 54, 0.8)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      onClick: (evt, elements) => {
        if (elements.length) {
          const idx = elements[0].index
          emit('detalle', data[idx].detalles)
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#ffffff',
            font: { size: 14 },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#9C27B0',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ffffff' },
        },
      },
    },
  })
}
</script>

<style lang="scss" scoped>
.graphics-card {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .text-h5 {
    background: linear-gradient(45deg, #2196f3, #21cbf3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }
}

.chart-container {
  background: rgba(30, 30, 47, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.error-chart:hover {
    box-shadow: 0 12px 24px rgba(239, 83, 80, 0.2);
  }

  &.scan-chart:hover {
    box-shadow: 0 12px 24px rgba(33, 150, 243, 0.2);
  }

  &.register-chart:hover {
    box-shadow: 0 12px 24px rgba(76, 175, 80, 0.2);
  }

  &.login-chart:hover {
    box-shadow: 0 12px 24px rgba(156, 39, 176, 0.2);
  }
}

.chart-header {
  padding: 16px 20px 8px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .text-h6 {
    font-weight: 600;
    color: white;
  }

  .q-chip {
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.chart-content {
  padding: 20px;
  height: 300px;

  canvas {
    border-radius: 8px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.chart-container:hover .q-icon {
  animation: pulse 1s infinite;
}
</style>
