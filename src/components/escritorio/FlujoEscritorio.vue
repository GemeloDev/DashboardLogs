<template>
  <div class="flujo-escritorio">
    <!-- KPIs -->

    <!-- Gráficas Mejoradas -->
    <div class="q-mb-lg">
      <EscritorioGraficasEnhanced :filtros="filtrosGlobales" @detalle="mostrarDetalle" />
    </div>

    <!-- Consola -->
    <div class="q-mb-lg">
      <!-- <EscritorioConsola :filtros="filtrosGlobales" /> -->
    </div>

    <!-- Modal de detalle de gráfica -->
    <EscritorioDetalleModal v-model="modalDetalle" :detalles="detalleSeleccionado" />
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import EscritorioGraficasEnhanced from './EscritorioGraficasEnhanced.vue'
// import EscritorioConsola from './EscritorioConsola.vue'
import EscritorioDetalleModal from './EscritorioDetalleModal.vue'

// Estado de filtros globales - inyectar desde MainLayout
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const modalDetalle = ref(false)
const detalleSeleccionado = ref([])

// Watcher para debug de filtros
watch(
  filtrosGlobales,
  (newFiltros) => {
    console.log('🔄 FlujoEscritorio: Filtros globales cambiaron:', newFiltros)
  },
  { deep: true }
)

// Función para mostrar detalles de una gráfica
function mostrarDetalle(detalles) {
  console.log('Mostrando detalle:', detalles)
  detalleSeleccionado.value = detalles
  modalDetalle.value = true
}
</script>

<style scoped>
.flujo-escritorio {
  padding: 16px;
}

.q-mb-lg {
  margin-bottom: 32px;
}
</style>
