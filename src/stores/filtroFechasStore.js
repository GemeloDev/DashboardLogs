// stores/filtroFechasStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Función para obtener fechas del mes actual
function obtenerFechasMesActual() {
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  return {
    inicio: primerDiaMes.toISOString().split('T')[0], // YYYY-MM-DD
    fin: hoy.toISOString().split('T')[0] // YYYY-MM-DD
  }
}

export const useFiltroFechasStore = defineStore(
  'filtroFechas',
  () => {
    // Inicializar con fechas del mes actual
    const fechasDefecto = obtenerFechasMesActual()
    const fechaInicio = ref(fechasDefecto.inicio)
    const fechaFin = ref(fechasDefecto.fin)

    function setFechas(inicio, fin) {
      fechaInicio.value = inicio
      fechaFin.value = fin
    }

    // Función para resetear a fechas del mes actual
    function resetearAMesActual() {
      const fechasActuales = obtenerFechasMesActual()
      fechaInicio.value = fechasActuales.inicio
      fechaFin.value = fechasActuales.fin
    }

    // Función para obtener fechas formateadas para APIs
    function obtenerFechasFormateadas() {
      return {
        fechaInicio: fechaInicio.value,
        fechaFin: fechaFin.value
      }
    }

    return {
      fechaInicio,
      fechaFin,
      setFechas,
      resetearAMesActual,
      obtenerFechasFormateadas
    }
  },
  {
    persist: {
      storage: localStorage,
      paths: ['fechaInicio', 'fechaFin'],
    },
  },
)
export const useKpiStore = defineStore('kpi', () => {
  const escanos = ref(0)
  const errores = ref(0)
  const exportaciones = ref(0)
  const logins = ref(0)

  function setKpis(kpis) {
    if (kpis.escanos !== undefined) escanos.value = kpis.escanos
    if (kpis.errores !== undefined) errores.value = kpis.errores
    if (kpis.exportaciones !== undefined) exportaciones.value = kpis.exportaciones
    if (kpis.logins !== undefined) logins.value = kpis.logins
  }

  return {
    escanos,
    errores,
    exportaciones,
    logins,
    setKpis
  }
})
