<template>
  <br>
  <div>
    <EventosFallidosTable :logs="logs" />
  </div>
  <br>
  <div class="q-pa-md">
    <q-card flat bordered class="col-12 col-sm-6 col-md-4 q-pa-md text-white q-mx-sm"
      style="background-color: #1e1e2f; border-radius: 12px; max-width: 400px;">
      <div class="text-subtitle1 text-center">Dispositivos más usados</div>
      <canvas ref="chartPorEstado" style="height: 250px;" />
    </q-card>
  </div>


</template>

<script setup>
import EventosFallidosTable from 'src/components/EventosFallidosTable.vue'
import { ref, onMounted } from 'vue'
import { getEventosFallidos, getEventosPorEstado } from 'src/services/api'
import Chart from 'chart.js/auto'

const logs = ref([])
const chartPorEstado = ref(null)



onMounted(async () => {
  await renderEventosPorEstadoChart()
  const payload = {
    resultado: 'FALLIDO',
    fechaInicio: '2025-01-20',
    fechaFin: '2025-06-30'
  }

  logs.value = await getEventosFallidos(payload)
  console.log('Logs de eventos fallidos:', logs.value)
})

async function renderEventosPorEstadoChart() {
  try {
    const payload = {
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30'
    }

    const data = await getEventosPorEstado(payload)
    console.log('Datos recibidos para eventos por estado:', data)

    const labels = data.map(d => d.resultadoEvento)
    const valores = data.map(d => d.total)

    new Chart(chartPorEstado.value, {
      type: 'doughnut', // también puedes usar 'pie'
      data: {
        labels: labels,
        datasets: [{
          label: 'Eventos por Estado',
          data: valores,
          backgroundColor: ['#66bb6a', '#ef5350', '#ffa726', '#42a5f5'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#fff' },
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const value = context.parsed
                const percentage = ((value / total) * 100).toFixed(1)
                return `${context.label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    })

  } catch (error) {
    console.error('Error al cargar eventos por estado:', error)
  }
}



</script>
