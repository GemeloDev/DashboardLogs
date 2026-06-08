<template>
  <div class="flujo-escritorio">
    <!-- KPIs -->

    <!-- Graficas Mejoradas -->
    <div class="q-mb-lg">
      <EscritorioGraficasEnhanced @detalle="mostrarDetalle" />
    </div>

    <!-- Modal de detalle de grafica -->
    <EscritorioDetalleModal v-model="modalDetalle" :detalles="detalleSeleccionado" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EscritorioGraficasEnhanced from './EscritorioGraficasEnhanced.vue'
// import EscritorioConsola from './EscritorioConsola.vue'
import EscritorioDetalleModal from './EscritorioDetalleModal.vue'

const modalDetalle = ref(false)
const detalleSeleccionado = ref([])

// Funcion para mostrar detalles de una grafica
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
