<template>
  <q-card
    class="filtros-fechas q-pa-lg q-mb-md"
    style="
      background: linear-gradient(145deg, #1e1e2f 0%, #2a2a40 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    "
  >
    <div class="column text-white">
      <!-- Header con icono y título -->
      <div class="col row justify-between content-center pt-responsive">
        <div class="col-sm-10 col-md-8 content-center q-ml-lg">
          <p class="text-h6 text-white">
            <q-icon name="date_range" size="20px" color="blue-4" class="q-mr-sm" />
            Filtrar por Período
          </p>
        </div>
        <!-- Botón para resetear al mes actual -->
        <div class="col-sm-1 col-md-1 q-ml-md text-right">
          <q-btn flat round icon="refresh" color="blue-4" size="sm" @click="resetearAMesActual">
            <q-tooltip class="bg-blue-9">Mes actual</q-tooltip>
          </q-btn>
        </div>
      </div>
      <!-- Filtros de fecha responsivos -->
      <div class="col q-my-md">
        <div class="row">
          <!-- Rango de Fechas -->
          <div class="col-12">
            <q-input
              v-model="rangoFechasTexto"
              label="Fechas"
              filled
              dark
              color="primary"
              clearable
              readonly
              dense
            >
              <template v-slot:prepend>
                <q-icon name="date_range" color="amber" />
              </template>
              <template v-slot:append>
                <q-icon name="calendar_month" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="rangoFechas" range mask="YYYY-MM-DD" dark>
                      <div class="row items-center justify-end q-pa-sm">
                        <q-btn
                          label="Limpiar"
                          color="negative"
                          flat
                          size="sm"
                          @click="rangoFechas = null"
                          class="q-mr-sm"
                        />
                        <q-btn v-close-popup label="Aplicar" color="primary" flat size="sm" />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Indicador del período seleccionado -->
      <div class="col">
        <div class="row q-gutter-md footer-logs justify-between">
          <div class="col-sm-12 col-md-auto">
            <div class="text-blue-4 text-caption text-weight-medium">
              Período: {{ formatearPeriodo() }}
            </div>
            <div class="text-grey-5 text-caption">
              {{ calcularDiasSeleccionados() }} días seleccionados
            </div>
          </div>
          <!-- Botón aplicar filtros -->
          <div class="col-sm-12 col-md-auto text-right">
            <q-btn
              label="Aplicar"
              icon="filter_list"
              color="blue-6"
              unelevated
              rounded
              :loading="cargando"
              :disable="!fechasValidas"
              @click="aplicarFiltros"
            />
            <!-- Botón de filtros rápidos -->
            <q-btn-dropdown flat rounded icon="schedule" color="blue-4" dropdown-icon="expand_more">
              <q-list dense class="q-pa-none">
                <q-item clickable v-close-popup @click="seleccionarPeriodo('hoy')">
                  <q-item-section avatar>
                    <q-icon name="today" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">Hoy</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="seleccionarPeriodo('ayer')">
                  <q-item-section avatar>
                    <q-icon name="yesterday" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">Ayer</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos7')">
                  <q-item-section avatar>
                    <q-icon name="date_range" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">Últimos 7 días</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos30')">
                  <q-item-section avatar>
                    <q-icon name="calendar_month" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">Últimos 30 días</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator class="bg-grey-7" />

                <q-item clickable v-close-popup @click="seleccionarPeriodo('mesActual')">
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="green-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">Mes actual</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useFiltroFechasStore } from 'src/stores/filtroFechasStore'

// Store y estado
const store = useFiltroFechasStore()
const $q = useQuasar()
const emit = defineEmits(['filter', 'filtro-aplicado', 'filtro-error', 'filtro-estado'])

// Estados reactivos
const rangoFechas = ref(null)
const cargando = ref(false)

// Computed properties
const fechasValidas = computed(() => {
  return rangoFechas.value && rangoFechas.value.from && rangoFechas.value.to
})

const rangoFechasTexto = computed(() => {
  if (!rangoFechas.value) return ''
  if (typeof rangoFechas.value === 'string') return rangoFechas.value
  if (rangoFechas.value.from && rangoFechas.value.to) {
    return `${rangoFechas.value.from} - ${rangoFechas.value.to}`
  }
  return rangoFechas.value.from || ''
})

// Funciones de validación
const validarFecha = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  return selectedDate <= today
}

// Funciones de utilidad
const formatearPeriodo = () => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to)
    return 'No seleccionado'

  const inicio = new Date(rangoFechas.value.from).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  })
  const fin = new Date(rangoFechas.value.to).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  console.log(`Periodo: ${inicio} - ${fin}`)

  return `${inicio} - ${fin}`
}

const calcularDiasSeleccionados = () => {
  if (!rangoFechas.value || !rangoFechas.value.from || !rangoFechas.value.to) return 0

  const inicio = new Date(rangoFechas.value.from)
  const fin = new Date(rangoFechas.value.to)
  const diferencia = fin.getTime() - inicio.getTime()

  return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1
}

// Función para aplicar filtros con información enriquecida para el asistente IA
const aplicarFiltros = async () => {
  if (!fechasValidas.value) {
    const errorInfo = {
      accion: 'aplicar_filtro_fechas',
      error: 'Rango de fechas inválido',
      detalles: 'No se ha seleccionado un rango de fechas válido',
      valido: false,
    }

    emit('filtro-error', errorInfo)

    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un rango de fechas válido',
      position: 'top',
    })
    return
  }

  cargando.value = true

  try {
    // Actualizar el store con las fechas seleccionadas
    store.setFechas(rangoFechas.value.from, rangoFechas.value.to)

    const diasSeleccionados = calcularDiasSeleccionados()
    const periodo = formatearPeriodo()

    // Mostrar notificación de éxito
    $q.notify({
      type: 'positive',
      message: `Filtros aplicados: ${diasSeleccionados} días`,
      position: 'top',
      timeout: 2000,
    })

    // Emitir evento básico para compatibilidad
    emit('filter', {
      fechaInicio: rangoFechas.value.from,
      fechaFin: rangoFechas.value.to,
    })

    // Emitir evento enriquecido para el asistente IA
    emit('filtro-aplicado', {
      accion: 'aplicar_filtro_fechas',
      impacto: {
        diasSeleccionados: diasSeleccionados,
        rangoValido: true,
        periodo: periodo,
        fechaInicio: rangoFechas.value.from,
        fechaFin: rangoFechas.value.to,
        timestamp: new Date().toISOString(),
      },
      mensaje: `Filtro de fechas aplicado: ${diasSeleccionados} días seleccionados (${periodo})`,
    })
  } catch (error) {
    console.error('Error al aplicar filtros:', error)

    emit('filtro-error', {
      accion: 'aplicar_filtro_fechas',
      error: error.message || 'Error desconocido',
      detalles: 'Error interno al procesar el filtro de fechas',
    })

    $q.notify({
      type: 'negative',
      message: 'Error al aplicar los filtros',
      position: 'top',
    })
  } finally {
    cargando.value = false
  }
}

// Función para resetear al mes actual
const resetearAMesActual = () => {
  store.resetearAMesActual()
  rangoFechas.value = {
    from: store.fechaInicio,
    to: store.fechaFin,
  }
  aplicarFiltros()
}

// ========== FUNCIONES PARA EL ASISTENTE IA ==========

// Función para obtener el rango de fechas actual
const getRangoFechas = () => {
  return {
    from: rangoFechas.value?.from || null,
    to: rangoFechas.value?.to || null,
    periodo: formatearPeriodo(),
    diasSeleccionados: calcularDiasSeleccionados(),
    valido: fechasValidas.value,
  }
}

// Función para establecer un rango de fechas específico
const setRangoFechas = (fechaInicio, fechaFin, aplicarInmediatamente = true) => {
  rangoFechas.value = {
    from: fechaInicio,
    to: fechaFin,
  }

  emit('filtro-estado', {
    accion: 'set_rango_fechas',
    estado: getRangoFechas(),
    mensaje: `Rango establecido: ${fechaInicio} a ${fechaFin}`,
  })

  if (aplicarInmediatamente) {
    aplicarFiltros()
  }
}

// Función para obtener el período seleccionado actual
const getPeriodoSeleccionado = () => {
  return {
    texto: formatearPeriodo(),
    diasSeleccionados: calcularDiasSeleccionados(),
    fechaInicio: rangoFechas.value?.from,
    fechaFin: rangoFechas.value?.to,
    valido: fechasValidas.value,
  }
}

// Función para validar si el rango actual es válido
const esRangoValido = () => {
  return fechasValidas.value && rangoFechas.value?.from && rangoFechas.value?.to
}

// Función para obtener información de impacto del filtro
const getImpactoFiltro = () => {
  const dias = calcularDiasSeleccionados()
  const valido = esRangoValido()

  return {
    diasSeleccionados: dias,
    rangoValido: valido,
    periodo: formatearPeriodo(),
    advertencias: !valido ? ['Rango de fechas no válido'] : [],
    sugerencias: dias > 30 ? ['Considera reducir el rango para mejor rendimiento'] : [],
  }
}

// Función mejorada para seleccionar período con información para IA
const seleccionarPeriodoIA = (periodo) => {
  seleccionarPeriodo(periodo)

  emit('filtro-estado', {
    accion: 'seleccionar_periodo',
    periodo: periodo,
    estado: getRangoFechas(),
    mensaje: `Período seleccionado: ${periodo.toUpperCase()}`,
  })
}

// ========== EXPOSICIÓN DE MÉTODOS PARA EL ASISTENTE IA ==========
defineExpose({
  // Métodos de consulta
  getRangoFechas,
  getPeriodoSeleccionado,
  getImpactoFiltro,
  esRangoValido,

  // Métodos de manipulación
  setRangoFechas,
  seleccionarPeriodo: seleccionarPeriodoIA,
  resetearAMesActual,
  aplicarFiltros,

  // Estados reactivos para consulta
  fechasValidas,
  rangoFechasTexto,
  cargando,

  // Funciones de utilidad
  calcularDiasSeleccionados,
  formatearPeriodo,
  validarFecha,
})

// Función para seleccionar períodos predefinidos
const seleccionarPeriodo = (periodo) => {
  const hoy = new Date()
  let inicio, fin

  switch (periodo) {
    case 'hoy': {
      inicio = fin = hoy.toISOString().split('T')[0]
      break
    }

    case 'ayer': {
      const ayer = new Date(hoy)
      ayer.setDate(ayer.getDate() - 1)
      inicio = fin = ayer.toISOString().split('T')[0]
      break
    }

    case 'ultimos7': {
      const fechaInicio7 = new Date(hoy)
      fechaInicio7.setDate(fechaInicio7.getDate() - 6)
      inicio = fechaInicio7.toISOString().split('T')[0]
      fin = hoy.toISOString().split('T')[0]
      break
    }

    case 'ultimos30': {
      const fechaInicio30 = new Date(hoy)
      fechaInicio30.setDate(fechaInicio30.getDate() - 29)
      inicio = fechaInicio30.toISOString().split('T')[0]
      fin = hoy.toISOString().split('T')[0]
      break
    }

    case 'mesActual': {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
      fin = hoy.toISOString().split('T')[0]
      break
    }

    default:
      break;

  }

  rangoFechas.value = { from: inicio, to: fin }
  aplicarFiltros()
}

// Watchers para sincronización automática
watch(rangoFechas, () => {
  if (fechasValidas.value) {
    // Auto-aplicar filtros después de 1 segundo de inactividad
    clearTimeout(window.filtroTimeout)
    window.filtroTimeout = setTimeout(() => {
      aplicarFiltros()
    }, 1000)
  }
})

// Inicialización
onMounted(() => {
  // Cargar fechas desde el store o usar fechas del mes actual
  if (store.fechaInicio && store.fechaFin) {
    rangoFechas.value = {
      from: store.fechaInicio,
      to: store.fechaFin,
    }
  } else {
    // Si no hay fechas en el store, usar mes actual
    resetearAMesActual()
    return
  }

  // Aplicar filtros iniciales
  aplicarFiltros()
})
</script>

<style scoped>
.filtros-fechas {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fecha-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.fecha-input :deep(.q-field__control:hover) {
  background: rgba(255, 255, 255, 0.08);
}

.fecha-input :deep(.q-field__control:focus-within) {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3b82f6;
}

/* Responsividad para móviles */
@media (max-width: 599px) {
  .filtros-fechas {
    padding: 1rem !important;
  }

  .text-h6 {
    font-size: 1.2rem !important;
  }

  .q-btn-dropdown {
    padding: 0.5rem !important;
  }

  .q-item {
    min-height: 40px !important;
  }
}

@media (max-width: 479px) {
  .filtros-fechas {
    padding: 0.75rem !important;
    margin-bottom: 0.75rem !important;
  }
}

.pt-responsive {
  margin-top: 15px;

  @media (max-width: 479px) {
    margin-top: 50px;
    margin-bottom: 10px;
  }
}

/* Animaciones suaves */
.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Dark theme para dropdown */
.q-list {
  background: #1e1e2f !important;
}

.q-item {
  color: white !important;
}

.q-item:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

@media (max-width: 479px) {
  .footer-logs {
    display: flex;
    justify-content: center;
  }
}
</style>
