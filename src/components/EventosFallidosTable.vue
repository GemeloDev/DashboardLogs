<template>
  <div class="chart-wrapper">
    <q-table :rows="logs" :columns="columns" row-key="usuario" dense flat bordered class="my-table"
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
  { name: 'resultado', label: 'Resultado Evento', field: 'resultadoEvento', sortable: true },
  { name: 'usuario', label: 'Usuario', field: 'usuario' },
  { name: 'dispositivo', label: 'Dispositivo', field: 'dispositivo' },
  { name: 'tipo', label: 'Tipo Evento', field: 'tipoEvento' },
  { name: 'android', label: 'Versión Android', field: 'versionAndroidDispositivo' }
]
</script>
