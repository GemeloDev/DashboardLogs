<template>
  <q-card class="enhanced-graphics-container q-pa-md">

    <div class="text-h6 row items-center q-mb-lg text-white">
      <q-icon name="dashboard" size="28px" class="q-mr-sm" color="primary" />
      <span>Dashboard Dinámico</span>
      <q-space />
      <q-spinner v-if="loading" color="primary" size="24px" />
      <div v-else class="text-caption text-grey-5 q-ml-sm">
        {{ logsData.length }} registros procesados
      </div>
    </div>

    <div v-if="!loading" class="row justify-center q-col-gutter-md">

      <div
        v-for="(field, index) in camposGraficables"
        :key="field"
        class="col-12 col-md-6 col-lg-4"
      >
        <DynamicChartCard
          :field-key="field"
          :logs="logsData"
          :color-index="index"
        />
      </div>

      <div v-if="camposGraficables.length === 0" class="col-12 text-center q-pa-xl text-grey-5">
        <q-icon name="tune" size="48px" />
        <div class="text-h6">No hay métricas seleccionadas</div>
        <div>Configura los "Campos Visibles" en el filtro superior para ver gráficas.</div>
      </div>

    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="n in 3" :key="n" class="col-12 col-md-4">
        <q-skeleton height="250px" class="bg-grey-9" square style="border-radius:12px" />
      </div>
    </div>

    <div class="q-mt-xl">
       <EscritorioConsola ref="consolaRef" />
    </div>

  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useQuasar } from 'quasar'
import { ChartDataService } from 'src/services/chartDataService'
import DynamicChartCard from '../blocks/DynamicChartCard.vue' // El componente hijo que creamos arriba
import EscritorioConsola from './EscritorioConsolaSimple.vue'

const $q = useQuasar()
const filtrosGlobales = inject('filtrosGlobales', ref({})) // Inyección reactiva

const loading = ref(false)
const logsData = ref([])
const consolaRef = ref(null)

// Obtenemos la lista de campos que el usuario quiere ver
// Asumiendo que DinamicFilters emite un objeto que tiene la propiedad 'fields' (array de strings)
const camposGraficables = computed(() => {
  // Si no hay campos definidos en filtros, usamos unos por defecto para no mostrar vacío
  const fields = Object.keys(filtrosGlobales.value.fields) || []

  // Filtramos campos que no tienen sentido graficar (ej: fechas exactas, IDs únicos)
  const blacklist = ['id', 'date', 'eventTime', 'message', 'meta.requestId', 'busqueda', 'rangoFechas']
  return fields.filter(f => !blacklist.includes(f))
})

const cargarDatos = async () => {
  loading.value = true
  try {
    // 1. Construir parámetros URL dinámicamente
    // Usamos la función estática que creamos anteriormente en ChartDataService
    const params = ChartDataService.buildFilterParams ?
                   ChartDataService.buildFilterParams(filtrosGlobales.value) :
                   filtrosGlobales.value

    // 2. Llamada a API
    const response = await ChartDataService.getAll(params)

    if (response && response.data && response.data.items) {
      logsData.value = response.data.items
    } else {
      logsData.value = []
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    $q.notify({ type: 'negative', message: 'Error obteniendo datos' })
  } finally {
    loading.value = false
  }
}

// Reaccionar a cambios en los filtros globales
watch(
  () => filtrosGlobales.value,
  () => { cargarDatos() },
  { deep: true }
)

onMounted(() => {
  cargarDatos()
})
</script>

<style lang="scss" scoped>
.enhanced-graphics-container {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80vh;
}
</style>
