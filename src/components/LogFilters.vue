<template>
  <q-card
    class="filtros-fechas q-pa-lg q-mb-md"
    style="
      background: linear-gradient(145deg, #1e1e2f 0%, #2a2a40 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    "
  >
    <!-- Header con icono y título -->
    <div class="row items-center q-mb-lg">
      <q-icon name="date_range" size="28px" color="blue-4" class="q-mr-sm" />
      <div class="text-h6 text-white">Filtrar por Período</div>
      <q-space />
      <!-- Botón para resetear al mes actual -->
      <q-btn
        flat
        round
        icon="refresh"
        color="blue-4"
        size="sm"
        @click="resetearAMesActual"
        class="q-ml-sm"
      >
        <q-tooltip class="bg-blue-9">Mes actual</q-tooltip>
      </q-btn>
    </div>

    <!-- Filtros de fecha responsivos -->
    <div class="row q-col-gutter-md">
      <!-- Fecha de inicio -->
      <div class="col-12 col-sm-6">
        <q-input
          v-model="fechaInicio"
          label="Fecha de inicio"
          type="date"
          filled
          dense
          color="blue-4"
          label-color="blue-4"
          input-class="text-white text-weight-medium"
          class="fecha-input"
          :rules="[validarFechaInicio]"
        >
          <template v-slot:prepend>
            <q-icon name="event" color="blue-4" />
          </template>
        </q-input>
      </div>

      <!-- Fecha de fin -->
      <div class="col-12 col-sm-6">
        <q-input
          v-model="fechaFin"
          label="Fecha de fin"
          type="date"
          filled
          dense
          color="blue-4"
          label-color="blue-4"
          input-class="text-white text-weight-medium"
          class="fecha-input"
          :rules="[validarFechaFin]"
        >
          <template v-slot:prepend>
            <q-icon name="event" color="blue-4" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Botones de acciones -->
    <div class="row justify-between items-center q-mt-lg">
      <!-- Indicador del período seleccionado -->
      <div class="col-12 col-sm-6 q-mb-md q-mb-sm-none">
        <div class="text-blue-4 text-caption text-weight-medium">
          Período: {{ formatearPeriodo() }}
        </div>
        <div class="text-grey-5 text-caption">
          {{ calcularDiasSeleccionados() }} días seleccionados
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="col-12 col-sm-6 row justify-end q-gutter-sm">
        <!-- Botón aplicar filtros -->
        <q-btn
          label="Aplicar"
          icon="filter_list"
          color="blue-6"
          unelevated
          rounded
          class="q-px-lg text-weight-medium"
          :loading="cargando"
          :disable="!fechasValidas"
          @click="aplicarFiltros"
        />

        <!-- Botón de filtros rápidos -->
        <q-btn-dropdown
          flat
          rounded
          icon="schedule"
          color="blue-4"
          dropdown-icon="expand_more"
          class="q-px-md"
        >
          <q-list dense>
            <q-item clickable v-close-popup @click="seleccionarPeriodo('hoy')">
              <q-item-section avatar>
                <q-icon name="today" color="blue-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">Hoy</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="seleccionarPeriodo('ayer')">
              <q-item-section avatar>
                <q-icon name="yesterday" color="blue-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">Ayer</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos7')">
              <q-item-section avatar>
                <q-icon name="date_range" color="blue-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">Últimos 7 días</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos30')">
              <q-item-section avatar>
                <q-icon name="calendar_month" color="blue-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">Últimos 30 días</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="bg-grey-7" />

            <q-item clickable v-close-popup @click="seleccionarPeriodo('mesActual')">
              <q-item-section avatar>
                <q-icon name="calendar_today" color="green-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">Mes actual</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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
const emit = defineEmits(['filter'])

// Estados reactivos
const fechaInicio = ref('')
const fechaFin = ref('')
const cargando = ref(false)

// Computed properties
const fechasValidas = computed(() => {
  return (
    fechaInicio.value && fechaFin.value && new Date(fechaInicio.value) <= new Date(fechaFin.value)
  )
})

// Funciones de validación
const validarFechaInicio = (val) => {
  if (!val) return 'Fecha requerida'
  if (fechaFin.value && new Date(val) > new Date(fechaFin.value)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }
  return true
}

const validarFechaFin = (val) => {
  if (!val) return 'Fecha requerida'
  if (fechaInicio.value && new Date(val) < new Date(fechaInicio.value)) {
    return 'La fecha de fin debe ser posterior a la fecha de inicio'
  }
  if (new Date(val) > new Date()) {
    return 'La fecha no puede ser futura'
  }
  return true
}

// Funciones de utilidad
const formatearPeriodo = () => {
  if (!fechaInicio.value || !fechaFin.value) return 'No seleccionado'

  const inicio = new Date(fechaInicio.value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  })
  const fin = new Date(fechaFin.value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return `${inicio} - ${fin}`
}

const calcularDiasSeleccionados = () => {
  if (!fechaInicio.value || !fechaFin.value) return 0

  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)
  const diferencia = fin.getTime() - inicio.getTime()

  return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1
}

// Función para aplicar filtros
const aplicarFiltros = async () => {
  if (!fechasValidas.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, selecciona fechas válidas',
      position: 'top',
    })
    return
  }

  try {
    cargando.value = true

    // Actualizar el store
    store.setFechas(fechaInicio.value, fechaFin.value)

    // Mostrar notificación de éxito
    $q.notify({
      type: 'positive',
      message: `Filtros aplicados: ${calcularDiasSeleccionados()} días`,
      position: 'top',
      timeout: 2000,
    })

    // Emitir evento para que el componente padre actualice los datos
    emit('filter', {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
    })
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
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
  fechaInicio.value = store.fechaInicio
  fechaFin.value = store.fechaFin
  aplicarFiltros()
}

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
      return
  }

  fechaInicio.value = inicio
  fechaFin.value = fin
  aplicarFiltros()
}

// Watchers para sincronización automática
watch([fechaInicio, fechaFin], () => {
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
    fechaInicio.value = store.fechaInicio
    fechaFin.value = store.fechaFin
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

.fecha-input >>> .q-field__control {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.fecha-input >>> .q-field__control:hover {
  background: rgba(255, 255, 255, 0.08);
}

.fecha-input >>> .q-field__control:focus-within {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3b82f6;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .filtros-fechas {
    padding: 1rem !important;
  }

  .text-h6 {
    font-size: 1.2rem !important;
  }
}

@media (max-width: 479px) {
  .filtros-fechas {
    padding: 0.75rem !important;
    margin-bottom: 0.75rem !important;
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

.fecha-input {
  transition: all 0.3s ease;
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
</style>
