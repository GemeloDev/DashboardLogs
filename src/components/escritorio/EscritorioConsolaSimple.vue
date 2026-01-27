<template>
  <q-dialog
    v-model="mostrarConsola"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarConsola"
  >
    <q-card class="console-modal-card console-dialog-fullscreen text-white">
      <q-card-section class="console-header bg-dark-10">
        <div class="row">
          <div class="col">
            <div class="card-title q-mt-md">
              <q-icon name="history_edu" class="q-mr-sm" color="primary" />
              Bitácora de Eventos de Pasaportes
              <q-chip
                v-if="logs.length || rawLogs.length"
                color="primary"
                text-color="white"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ logs.length }} / {{ rawLogs.length }} eventos
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm">
              <span v-if="logs.length !== rawLogs.length" class="text-amber">
                <q-icon name="filter_alt" /> Filtros activos
              </span>
              <span v-else>Mostrando todos los registros</span>
            </div>
          </div>

          <div class="col-auto">
            <q-btn icon="minimize" flat round color="grey-4" @click="cerrarConsola" class="q-mr-sm">
              <q-tooltip>Minimizar</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarConsola">
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </div>

          <div class="col-12 q-pt-md">
            <q-expansion-item
              class="filter-expansion-modern"
              v-model="filtrosToggle"
              header-style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);"
              header-class="text-weight-bold text-white"
              expand-separator
              hide-expand-icon
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="tune" color="cyan-4" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white text-weight-bold">
                    Panel de Filtros Dinámicos
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center">
                    <q-icon
                      :name="filtrosToggle ? 'expand_less' : 'expand_more'"
                      color="cyan-4"
                      size="20px"
                    />
                  </div>
                </q-item-section>
              </template>

              <DinamicFilters ref="filtroRef" :datos-origen="rawLogs" @filtrar="onLogsFiltrados" />
            </q-expansion-item>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="console-body">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-grid color="primary" size="80px" />
          <div class="q-mt-lg text-h6">Cargando logs...</div>
        </div>

        <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="filter_list_off" size="100px" color="grey-7" />
          <div class="text-h6 text-grey-5 q-mt-md">
            No se encontraron registros con los filtros actuales
          </div>
        </div>

        <div v-else>
          <div class="row justify-center items-stretch q-gutter-sm">
            <div
              v-for="(log, index) in logsPaginados"
              :key="log.id || index"
              class="col-xs-12 col-sm-12 col-auto width-responsive"
            >
              <ConsoleCard :log="log" @click="mostrarDetalleLog" />
            </div>
          </div>
        </div>
      </q-card-section>
      <div class="pagination-section">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <div class="pagination-info text-caption text-grey-4">
              Mostrando {{ (paginaActual - 1) * registrosPorPagina + 1 }} -
              {{ Math.min(paginaActual * registrosPorPagina, logs.length) }}
              de {{ logs.length }} registros
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4 text-center">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="7"
              direction-links
              color="primary"
              active-design="flat"
              active-color="white"
              active-text-color="primary"
              size="sm"
              @update:model-value="scrollArriba"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>

  <DetailDialog v-model="modalDetalle" :log="logSeleccionado" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
// import { MockPassportService } from 'src/data/MockLogsService' -> Datos para hacer pruebas en lugar del endpoint
import DinamicFilters from '../blocks/DinamicFilters.vue'
import ConsoleCard from '../blocks/ConsoleCard.vue'
import DetailDialog from '../blocks/DetailDialog.vue'
import { ChartDataService } from 'src/services/chartDataService'

const $q = useQuasar()

// --- ESTADO ---
const mostrarConsola = ref(false)
const loading = ref(false)
const filtrosToggle = ref(true)
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const filtroRef = ref(null)

// --- DATOS ---
const rawLogs = ref([]) // 🗄️ Fuente de verdad (Todos los datos de la API)
const logs = ref([]) // 👁️ Datos visualizados (Filtrados)

// --- PAGINACIÓN ---
const paginaActual = ref(1)
const registrosPorPagina = ref(25)

// --- COMPUTED ---
const logsPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value
  const fin = inicio + registrosPorPagina.value
  return logs.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(logs.value.length / registrosPorPagina.value) || 1
})

// --- FUNCIONES PRINCIPALES ---
/**
 * Abre la consola y decide qué datos cargar
 * @param {Array|null} dataGrafica - Datos opcionales si vienen de un click en gráfica
 */
const abrirConsola = async (dataGrafica = null) => {
  mostrarConsola.value = true
  filtrosToggle.value = true
  paginaActual.value = 1

  if (dataGrafica && dataGrafica.length > 0) {
    // Escenario 1: Datos vienen desde una gráfica
    console.log('📊 Cargando datos desde gráfica:', dataGrafica.length)
    rawLogs.value = [...dataGrafica]
    logs.value = [...dataGrafica]
  } else {
    // Escenario 2: Carga inicial completa desde API
    await cargarLogsDesdeAPI()
  }

  setTimeout(() => {
    filtrosToggle.value = false
  }, 1000)
}

const cargarLogsDesdeAPI = async () => {
  loading.value = true
  try {
    console.log('🌐 Obteniendo datos del servidor...')
    // Simulamos parámetros de fecha por defecto
    // const response = await MockPassportService.getAll() -> archivo con logs de prueba en lugar del endpoint en servidor
    const response = await ChartDataService.getAll()

    if (response.data.items && Array.isArray(response.data.items)) {
      rawLogs.value = response.data.items
      logs.value = response.data.items
      console.log(`✅ ${rawLogs.value.length} registros cargados.`)
    } else {
      logs.value = []
      rawLogs.value = []
    }
  } catch (error) {
    console.error('❌ Error API:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

/**
 * ⚡ Callback que ejecuta el componente hijo <DinamicFilters>
 */
const onLogsFiltrados = (resultadosFiltrados) => {
  console.log('⚡ Actualizando vista con filtros:', resultadosFiltrados.length)
  logs.value = resultadosFiltrados
  paginaActual.value = 1
}

const cerrarConsola = () => {
  mostrarConsola.value = false
  // Opcional: Limpiar datos al cerrar
  logs.value = []
  rawLogs.value = []
}

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true
}

const scrollArriba = () => {
  const container = document.querySelector('.console-body')
  if (container) container.scrollTop = 0
}

defineExpose({
  abrirConsola,
  cerrarConsola,
})
</script>

<style lang="scss" scoped>
.console-modal-card {
  background: rgb(29, 29, 43);
  height: 100vh;
  display: flex;
  flex-direction: column;
  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
}

.console-body {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

// Grid Responsivo
.responsive-logs-grid {
  display: grid;
  gap: 14px;
  padding: 14px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 100%;
  overflow-x: hidden;
  transition: opacity 0.2s ease-in-out;
}

.width-responsive {
  width: 323px;
  @media (max-width: 600px) {
    width: 100%;
  }
}

// Estilos de los controles en cabecera
.console-controls {
  padding: 12px 16px;

  @media (min-width: 768px) and (max-width: 1024px) {
    .q-field--dense {
      .q-field__control {
        min-height: 40px;
      }
      .q-field__label {
        font-size: 13px;
      }
    }
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    .row {
      margin: -6px;
      > div {
        padding: 6px;
      }
    }
  }
}

// Responsive Grid Adjustments
@media (min-width: 768px) and (max-width: 1024px) {
  .responsive-logs-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: 12px;
    padding: 12px;
  }
}

// Paginación "Sticky" (Fijada abajo)
.pagination-section {
  // Posicionamiento
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100; // Asegura que flote sobre los items de la lista

  // Estilos visuales
  padding: 16px 24px;
  background: rgba(29, 29, 43, 0.95); // Fondo semitransparente oscuro (ajusta al color de tu tema)
  backdrop-filter: blur(8px); // Efecto de desenfoque estilo "Glass"
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4); // Sombra hacia arriba para dar profundidad

  .pagination-info {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 767px) {
      text-align: center;
      margin-bottom: 8px;
    }
  }

  .q-pagination {
    // Estilos personalizados para los botones de paginación
    .q-btn {
      font-weight: 600;
      opacity: 0.8;
      transition: all 0.2s ease;

      &.q-btn--active {
        opacity: 1;
        transform: scale(1.1);
        font-weight: 700;
        background: rgba(255, 255, 255, 0.15); // Fondo sutil para el activo
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      &:hover:not(.disabled) {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Ajustes Responsivos
@media (max-width: 768px) {
  .pagination-section {
    padding: 12px 16px; // Reducir padding en móviles

    .row {
      flex-direction: column-reverse; // Pone la paginación arriba del texto en móviles
      gap: 12px;

      .col-12 {
        text-align: center;
        padding: 0; // Resetear gutter
      }
    }
  }
}

// Expansion Item Moderno
.filter-expansion-modern {
  .q-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    &:hover {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(42, 82, 152, 0.3);
      animation: filter-glow 2s infinite;
    }
  }

  .q-expansion-item__container {
    .q-expansion-item__content {
      background: rgba(255, 255, 255, 0.02) !important;
      border-radius: 0 0 12px 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: none;
    }
  }
}

@keyframes filter-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.6);
  }
}
</style>
