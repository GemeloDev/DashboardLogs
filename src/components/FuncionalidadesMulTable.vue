<template>
  <div class="chart-wrapper">
    <q-table :rows="logs" :columns="columns" row-key="usuario" flat bordered dense class="my-table text-white"
      :pagination="{ rowsPerPage: 10 }" :rows-per-page-options="[5, 10, 25, 50]" />
  </div>
</template>

<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

const columns = [
  { name: 'funcionalidad', label: 'Funcionalidad', field: 'funcionalidad', align: 'left' },
  {
    name: 'fecha',
    label: 'Fecha Entrada',
    field: row => row.fecha?.split('T')[0] || row.fecha,
    align: 'left',
    sortable: true
  },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' }
]
</script>

<style scoped>
.my-table {
  background-color: #1e1e2f;
}
</style>
