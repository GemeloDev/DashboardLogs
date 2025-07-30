<template>
  <q-page class="q-mb-md" style="background-color: #121826;">
    <br>
    <div class="text-h4 text-white text-center q-mb-md">Eventos Fallidos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="q-pa-md text-white q-mb-md"
          style="background-color: #1e1e2f; border-radius: 12px;">
          <div class="text-subtitle1 q-mb-sm text-center">Resumen</div>
          <br>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div>Total eventos fallidos: <b>{{ logs.length }}</b></div>
            </div>
            <div class="col-6">
              <div>Última fecha: <b>{{ logs[0]?.fecha || 'N/A' }}</b></div>
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
        <br>
        <EventosFallidosTable :logs="logs" />
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md text-white" style="background-color: #1e1e2f; border-radius: 12px;">
          <div class="text-subtitle1 text-center">Dispositivos más usados</div>
          <canvas ref="chartPorEstado" style="height: 250px;" />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import EventosFallidosTable from 'src/components/EventosFallidosTable.vue'
import { ref, onMounted } from 'vue'
import { getEventosFallidos, getEventosPorEstado } from 'src/services/api'
import Chart from 'chart.js/auto'

const logs = ref([])
const chartPorEstado = ref(null)
const eventosPorEstado = ref([])



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
    eventosPorEstado.value = data
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
