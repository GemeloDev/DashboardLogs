<template>
  <div class="chart-wrapper">

    <q-table :rows="logs" :columns="columns" row-key="usuario" dense flat bordered class="my-table" />
  </div>
</template>

<script setup>
defineProps({ logs: Array })

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true },
  { name: 'usuario', label: 'Usuario', field: 'usuario' },
  { name: 'dispositivo', label: 'Dispositivo', field: 'dispositivo' },
  { name: 'tipo', label: 'Tipo Evento', field: 'tipoEvento' },
  { name: 'android', label: 'Versión Android', field: 'versionAndroidDispositivo' }
]
</script>
