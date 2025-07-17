<template>
  <q-card class="q-pa-lg q-mb-md"
    style="background: #1e1e2f; border-radius: 12px; box-shadow: 0 2px 12px rgba(234, 242, 248);">
    <div class="text-h6 text-white text-center q-mb-md">
      Filtrar Eventos Biométricos
    </div>

    <div class="row q-col-gutter-md">
      <q-input v-model="start" label="Desde" type="date" dense filled class="col-12 col-md-6" label-color="white"
        color="white" input-class="text-white" />
      <q-input v-model="end" label="Hasta" type="date" dense filled class="col-12 col-md-6" label-color="white"
        color="white" input-class="text-white" />
    </div>

    <div class="row justify-center q-mt-md">
      <q-btn label="Filtrar" @click="emitFilter" color="teal" icon="filter_list" class="q-px-md text-white" unelevated
        rounded />
    </div>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const emit = defineEmits(['filter'])
const start = ref('')
const end = ref('')

const $q = useQuasar()


function emitFilter() {
  if (!start.value || !end.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes seleccionar ambas fechas para filtrar',
      position: 'top'
    })
    return
  }

  emit('filter', {
    fechaInicio: start.value,
    fechaFin: end.value
  })
}



</script>
