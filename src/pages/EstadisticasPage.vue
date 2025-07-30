<template>
  <q-page class="q-pa-md" style="background-color: #121826;">
    <q-card class="stats-container q-pa-lg q-mt-md">
      <!-- KPIs Section -->
      <!-- <div class="q-pa-md kpi-section">
      <div class="row q-col-gutter-md q-mb-md">
        <q-card v-for="kpi in kpis" :key="kpi.label" flat bordered
          class="col-12 col-sm-6 col-md-3 text-center kpi-card">
          <q-card-section>
            <q-icon :name="kpi.icon" size="32px" :class="kpi.color" />
            <div class="text-subtitle2 q-mt-sm">{{ kpi.label }}</div>
            <div class="text-h6">{{ kpi.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div> -->
      <!-- Bar Chart Section -->
      <div class="q-pa-md">
        <q-card flat bordered class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px;">
          <div class="text-subtitle1 text-center q-mb-sm">Tiempo total por Funcionalidad</div>
          <canvas ref="barChart" height="200" />
        </q-card>
      </div>

      <!--Barra de dispositivos mas usados-->
      <div class="q-pa-md">
        <q-card flat bordered class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px;">
          <div class="text-subtitle1 text-center">Dispositivos más usados</div>
          <canvas ref="deviceChart" height="300" />
        </q-card>
      </div>

      <!-- Donut Chart Section -->
      <!-- Sección inferior dividida en dos columnas -->
      <!-- Donut Chart: Uso por funcionalidad -->
      <q-card flat bordered class="col-12 col-md-6 chart-card donut-chart-card"
        style="background-color: #1e1e2f; border-radius: 12px; color: white;">
        <q-card-section>
          <div class="text-subtitle1 text-center q-mb-sm">Uso por Funcionalidad</div>
          <div class="flex flex-center">
            <canvas ref="chart" class="donut-canvas" />
          </div>
        </q-card-section>
      </q-card>
      <br>

      <!-- Gráfico de Funcionalidades por Tipo de Evento -->
      <div class="row q-col-gutter-md q-mb-md justify-center">
        <q-card v-for="func in funcionalidades" :key="func.clave" flat bordered
          class="col-12 col-sm-6 col-md-3 chart-card"
          style="background-color: #1e1e2f; color: white; max-width: 300px;">
          <q-card-section>
            <div class="text-subtitle1 text-center q-mb-sm">{{ func.clave }}</div>
            <div class="flex flex-center">
              <canvas :ref="el => setPieRef(func.clave, el)" class="pie-canvas" height="200" width="200"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <br>
      <!-- Mapa con Geolocalización -->
      <q-card flat bordered class="q-pa-md text-white" style="background-color: #1e1e2f;">
        <q-card-section>
          <div class="text-h6 text-center">Mapa de Eventos Biométricos</div>
          <div id="mapaEventos" style="height: 400px;"></div>
        </q-card-section>
      </q-card>

      <q-card class="q-ma-md" style="background: #1e1e2f; color: white;">
        <q-card-section class="text-h6">Estados con Procesos Fallidos</q-card-section>
        <q-separator />
        <q-list dense>
          <q-item v-for="estado in fallosPorEstado" :key="estado.estado">
            <q-item-section>
              <div class="text-subtitle1">{{ estado.estado }}</div>
              <q-list v-if="estado.tipos">
                <q-item v-for="(cantidad, tipo) in estado.tipos" :key="tipo" class="q-ml-md">
                  <q-item-section class="text-caption text-red">
                    {{ tipo }}: {{ cantidad }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>


    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, ArcElement, DoughnutController, PieController
} from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDuracionPromedioFuncionalidad } from 'src/services/api'
import { getDispositivosMasUsados } from 'src/services/api'
import { getEventoBiometricofindAllByFilter } from 'src/services/api'
import { getFuncionalidadesEstado } from 'src/services/api'
import { useFiltroFechasStore } from 'src/stores/filtroFechasStore'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'


Chart.register(BarController, BarElement, CategoryScale, DoughnutController, LinearScale, Tooltip, ArcElement, PieController)

const tiemposFuncionalidad = ref([])

// const kpis = [
//   { label: 'Duración Promedio', value: '520 seg', icon: 'schedule', color: 'text-info' },
//   { label: 'Funcionalidad más usada', value: 'Validación Facial', icon: 'insights', color: 'text-accent' },
//   { label: 'Día con más uso', value: '2025-06-28', icon: 'event', color: 'text-positive' },
//   { label: 'Repeticiones por Día', value: '12', icon: 'repeat', color: 'text-warning' }
// ]

const filtroFechasStore = useFiltroFechasStore

const fallosPorEstado = ref([])

const barChart = ref(null)
const chart = ref(null)
const deviceChart = ref(null)


const funcionalidades = ref([])
const pieRefs = ref({})

function setPieRef(clave, el) {
  if (el) pieRefs.value[clave] = el
}

// Función para convertir "HH:MM:SS" en segundos
function tiempoASegundos(tiempoStr) {
  const [hh, mm, ss] = tiempoStr.split(':').map(Number)
  return (hh * 3600) + (mm * 60) + ss
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
})

// Función para convertir coordenadas GPS en nombre de estado
// (usa tu reverse-geocoding favorito; aquí un ejemplo con Nominatim)
async function gpsToEstado(gps) {
  const [lat, lon] = gps.split(',').map(Number)
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
  const data = await res.json()
  return data.address?.state || 'Desconocido'
}

// Agrupa solo los eventos FALLIDO por estado
async function agruparFallosPorEstado(eventos) {
  const cache = new Map()
  const conteo = {}

  for (const e of eventos) {
    if (e.resultadoEvento?.clave !== 'FALLIDO') continue
    const gps = e.gps
    if (!gps) continue

    let estado = cache.get(gps)
    if (!estado) {
      estado = await gpsToEstado(gps)
      cache.set(gps, estado)
    }

    const tipo = e.tipoEvento?.clave || 'Desconocido'

    if (!conteo[estado]) {
      conteo[estado] = {}
    }

    conteo[estado][tipo] = (conteo[estado][tipo] || 0) + 1
  }

  // De objeto a array para iterar en el template
  return Object.entries(conteo).map(([estado, tipos]) => ({
    estado,
    tipos
  }))
}


onMounted(async () => {
  renderDeviceChart()
  await nextTick()
  renderPiePorFuncionalidad()
  try {
    const respuesta = await getDuracionPromedioFuncionalidad({
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30'
    })
    tiemposFuncionalidad.value = respuesta.map(item => ({
      funcionalidad: item.funcionalidad.replace(/_/g, ' '),
      totalSegundos: tiempoASegundos(item.duracion)
    }))
    renderCharts()
  } catch (error) {
    console.error('Error al obtener datos de funcionalidad:', error)
  }
  try {
    const eventos = await getEventoBiometricofindAllByFilter()
    const eventosConGps = eventos
      .filter(e => typeof e.gps === 'string' && e.gps.includes(','))
      .map(e => {
        const [lat, lng] = e.gps.split(',').map(parseFloat)
        return {
          lat,
          lng,
          usuario: e.usuario?.usuario || 'Desconocido',
          detalle: e.tipoEvento?.detalle || '',
          descripcion: e.resultadoDescripcion || '',
          fecha: new Date(e.fechaHoraDia).toLocaleString()
        }
      })
    const map = L.map('mapaEventos').setView([19.4326, -99.1332], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)
    const markers = L.markerClusterGroup()
    eventosConGps.forEach(e => {
      const marker = L.marker([e.lat, e.lng]).bindPopup(`
    <strong>${e.usuario}</strong><br>
    ${e.detalle}<br>
    ${e.descripcion}<br>
    ${e.fecha}
  `)
      markers.addLayer(marker)
    })
    map.addLayer(markers)
    // ←–––––– NUEVO: agrupamos solo los FALLIDO y actualizamos la lista
    try {
      const agrupados = await agruparFallosPorEstado(eventos)
      fallosPorEstado.value = agrupados
    } catch (err) {
      console.error('Error al agrupar fallos por estado:', err)
    }
  } catch (error) {
    console.error('Error al cargar eventos para el mapa:', error)
  }
})

// Función para renderizar gráficas
function renderCharts() {
  new Chart(barChart.value, {
    type: 'bar',
    data: {
      labels: tiemposFuncionalidad.value.map(t => t.funcionalidad),
      datasets: [{
        label: 'Segundos Totales',
        data: tiemposFuncionalidad.value.map(t => t.totalSegundos),
        backgroundColor: '#26A69A'
      }]
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true } },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc' }, grid: { color: '#444' } }
      }
    }
  })

  new Chart(chart.value, {
    type: 'doughnut',
    data: {
      labels: tiemposFuncionalidad.value.map(t => t.funcionalidad),
      datasets: [{
        label: 'Distribución',
        data: tiemposFuncionalidad.value.map(t => t.totalSegundos),
        backgroundColor: ['#26A69A', '#7E57C2', '#FF7043', '#66BB6A', '#EF5350'], // puedes expandir más colores
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true }, legend: { labels: { color: '#ccc' } } }
    }
  })
}
async function renderDeviceChart() {
  try {
    const payload = {
      fechaInicio: filtroFechasStore.fechaInicio,
      fechaFin: filtroFechasStore.fechaFin
    }
    const data = await getDispositivosMasUsados(payload)

    const labels = data.map(d => d.dispositivo)
    const valores = data.map(d => d.total)

    new Chart(deviceChart.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total de usos',
          data: valores,
          backgroundColor: '#26A69A'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          tooltip: { enabled: true },
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' }
          },
          y: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error al cargar dispositivos:', error)
  }
}

// Nueva función para graficar funcionalidades por tipo de evento
function renderPiePorFuncionalidad() {
  getFuncionalidadesEstado({
    fechaInicio: filtroFechasStore.fechaInicio,
    fechaFin: filtroFechasStore.fechaFin
  }).then(async data => {
    funcionalidades.value = data
    await nextTick() // Espera a que los canvas estén en el DOM

    const colores = ['#ef5350', '#ffa726', '#42a5f5', '#66bb6a']
    const tipos = ['total_fallido', 'total_cancelado', 'total_error', 'total_exito']
    const tipoLabels = ['Fallido', 'Cancelado', 'Error', 'Éxito']

    data.forEach(func => {
      const valores = tipos.map(tipo => func[tipo])
      const ref = pieRefs.value[func.clave]
      if (ref) {
        new Chart(ref, {
          type: 'pie',
          data: {
            labels: tipoLabels,
            datasets: [{
              label: func.clave,
              data: valores,
              backgroundColor: colores,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { labels: { color: '#ccc' } },
              tooltip: { enabled: true }
            }
          }
        })
      }
    })
  })
}

</script>
<style scoped>
.stats-container {
  background: #121826;
  ;
  border-radius: 16px;
}

.kpi-card {
  background: #1e1e2f;
  border-radius: 12px;
  color: white;
}

.chart-card {
  border-radius: 10px;
  padding: 1rem;
}

.donut-canvas {
  width: 300px !important;
  height: 300px !important;
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.geo-card {
  border-radius: 12px;
  padding: 1rem;
}
</style>
