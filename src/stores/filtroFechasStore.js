// stores/filtroFechasStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFiltroFechasStore = defineStore(
  'filtroFechas',
  () => {
    const fechaInicio = ref('')
    const fechaFin = ref('')

    function setFechas(inicio, fin) {
      fechaInicio.value = inicio
      fechaFin.value = fin
    }

    return { fechaInicio, fechaFin, setFechas }
  },
  {
    persist: {
      storage: localStorage,
      paths: ['fechaInicio', 'fechaFin'],
    },
  },
)
