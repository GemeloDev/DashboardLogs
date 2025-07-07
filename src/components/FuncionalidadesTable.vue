<template>
  <div>
    <q-card>
      <q-table :rows="funcionalidadesUsos" :columns="columnsFuncionalidadesUsos" row-key="id" flat bordered dense
        class="text-white" style="background-color: #1e1e2f;" />
    </q-card>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { getFuncionalidadesUsos } from 'src/services/api'

const funcionalidadesUsos = ref([])

const columnsFuncionalidadesUsos = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'funcionalidad', label: 'Funcionalidad', field: 'funcionalidad', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true }
]

onMounted(async () => {
  try {
    const response = await getFuncionalidadesUsos()
    funcionalidadesUsos.value = response
  } catch (error) {
    console.error('Error al cargar funcionalidades:', error)
  }
})
</script>
