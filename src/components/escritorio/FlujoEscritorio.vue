<template>
  <div class="flujo-escritorio">
    <!-- Botón para abrir el modal de filtros avanzados -->
    <div class="q-mb-lg text-right">
      <q-btn
        color="primary"
        icon="filter_list"
        label="Filtros avanzados"
        @click="modalFiltros = true"
      />
    </div>

    <!-- Modal de filtros avanzados -->
    <q-dialog v-model="modalFiltros">
      <EscritorioFiltros @filtrar="onFiltrar" @close="modalFiltros = false" />
    </q-dialog>

    <!-- KPIs -->


    <!-- Gráficas Mejoradas -->
    <div class="q-mb-lg">
      <EscritorioGraficasEnhanced :filtros="filtrosGlobales" @detalle="mostrarDetalle" />
    </div>

    <!-- Consola -->
    <div class="q-mb-lg">
   //   <EscritorioConsola :filtros="filtrosGlobales" />
    </div>

    <!-- Modal de detalle de gráfica -->
    <EscritorioDetalleModal v-model="modalDetalle" :detalles="detalleSeleccionado" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EscritorioGraficasEnhanced from './EscritorioGraficasEnhanced.vue'
import EscritorioConsola from './EscritorioConsola.vue'
import EscritorioFiltros from './EscritorioFiltros.vue'
import EscritorioDetalleModal from './EscritorioDetalleModal.vue'

// Estado de filtros globales
const filtrosGlobales = ref({})
const modalDetalle = ref(false)
const detalleSeleccionado = ref([])
const modalFiltros = ref(false)

// Función para aplicar filtros desde el componente de filtros
function onFiltrar(filtros) {
  console.log('Aplicando filtros en flujo:', filtros)
  filtrosGlobales.value = {
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin,
    oficina: filtros.oficina,
    usuario: filtros.usuario,
    dispositivo: filtros.dispositivo,
    escaner: filtros.escaner,
    proceso: filtros.proceso,
    tipoLog: filtros.tipoLog,
  }
  modalFiltros.value = false
}

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
