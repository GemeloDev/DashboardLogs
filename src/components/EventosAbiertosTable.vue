<template>
  <div class="chart-wrappe">
    <q-table :rows="eventos" :columns="columns" row-key="usuario" flat bordered dense class="my-table text-white"
      :pagination="{ rowsPerPage: 10 }" :rows-per-page-options="[5, 10, 25, 50]"
      style="max-height: 350px; min-width: 100%;" virtual-scroll />
  </div>
</template>

<script setup>
defineProps({
  eventos: {
    type: Array,
    default: () => []
  }
})

const columns = [
  { name: 'funcionalidad', label: 'Funcionalidad', field: 'funcionalidad', align: 'left', sortable: true },
  { name: 'fechaEntrada', label: 'Fecha Entrada', field: 'fechaEntrada', align: 'left' },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' }
]
</script>
<style scoped>
.my-table {
  background-color: #1e1e2f;
  border-radius: 12px;
}

.chart-wrappe {
  max-width: 100%;
}
</style>
