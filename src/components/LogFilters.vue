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
import { onMounted } from 'vue'

import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFiltroFechasStore } from 'src/stores/filtroFechasStore'

const store = useFiltroFechasStore()
const start = ref('')
const end = ref('')

const $q = useQuasar()
const emit = defineEmits(['filter'])


function emitFilter() {
  if (!start.value || !end.value) {
    $q.notify({ type: 'negative', message: 'Selecciona ambas fechas' })
    return
  }

  store.setFechas(start.value, end.value)
  emit('filter')
}

onMounted(() => {
  if (store.fechaInicio && store.fechaFin) {
    start.value = store.fechaInicio
    end.value = store.fechaFin
    emitFilter()
  }
})

</script>
