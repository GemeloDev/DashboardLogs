<template>
  <div class="q-pa-md">
    <q-table :rows="eventos" :columns="columns" row-key="usuario" flat bordered dense class="text-white"
      style="background-color: #1e1e2f;" />
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
