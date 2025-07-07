<template>
  <q-card class="stats-container q-pa-lg q-mt-md">
    <!-- KPIs Section -->
    <div class="q-pa-md kpi-section">
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
    </div>

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
    <div class="row q-col-gutter-md q-mt-md geo-func-section">
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

      <!-- Mapa con Geolocalización -->
      <q-card flat bordered class="col-12 col-md-6"
        style="background-color: #1e1e2f; border-radius: 12px; color: white;">
        <q-card-section>
          <div class="text-subtitle1 text-center">Ubicación de eventos</div>
          <div id="mapaEventos" style="height: 300px; border-radius: 12px;"></div>
        </q-card-section>
      </q-card>
    </div>


  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, ArcElement, DoughnutController
} from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDuracionPromedioFuncionalidad } from 'src/services/api' // 👈 nuevo servicio
import { getDispositivosMasUsados } from 'src/services/api'

Chart.register(BarController, BarElement, CategoryScale, DoughnutController, LinearScale, Tooltip, ArcElement)

const tiemposFuncionalidad = ref([])

const kpis = [
  { label: 'Duración Promedio', value: '520 seg', icon: 'schedule', color: 'text-info' },
  { label: 'Funcionalidad más usada', value: 'Validación Facial', icon: 'insights', color: 'text-accent' },
  { label: 'Día con más uso', value: '2025-06-28', icon: 'event', color: 'text-positive' },
  { label: 'Repeticiones por Día', value: '12', icon: 'repeat', color: 'text-warning' }
]

const barChart = ref(null)
const chart = ref(null)
const deviceChart = ref(null)

// Función para convertir "HH:MM:SS" en segundos
function tiempoASegundos(tiempoStr) {
  const [hh, mm, ss] = tiempoStr.split(':').map(Number)
  return (hh * 3600) + (mm * 60) + ss
}

onMounted(async () => {
  await renderDeviceChart()
  try {
    const respuesta = await getDuracionPromedioFuncionalidad({
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30'
    })

    tiemposFuncionalidad.value = respuesta.map(item => ({
      funcionalidad: item.funcionalidad.replace(/_/g, ' '), // Opcional: reemplaza _ por espacio
      totalSegundos: tiempoASegundos(item.duracion)
    }))

    renderCharts()
  } catch (error) {
    console.error('Error al obtener datos:', error)
  }

  // Mapa con Leaflet
  const map = L.map('mapaEventos').setView([19.4326, -99.1332], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(map)
  L.marker([19.4326, -99.1332]).addTo(map).bindPopup('Evento en CDMX').openPopup()
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
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30'
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
  max-width: 200px;
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
