<template>
  <!-- Modal de Consola Mejorada -->
  <q-dialog
    v-model="mostrarConsola"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="console-modal"
  >
    <q-card class="enhanced-console-card bg-dark text-white">
      <q-card-section class="console-header-section bg-grey-9">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5">
              <q-icon name="terminal" size="32px" class="q-mr-sm" color="primary" />
              Consola de Logs del Sistema
              <q-chip
                v-if="logs.length"
                color="primary"
                text-color="white"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ logsFiltrados.length }} / {{ logs.length }} registros
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm" v-if="filtroActual">
              {{ filtroActual }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              icon="close"
              flat
              round
              color="white"
              size="md"
              @click="cerrarConsola"
              class="q-mr-sm"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Controles mejorados de búsqueda y filtros -->
      <q-card-section class="console-controls-section bg-grey-8">
        <div class="row q-col-gutter-md">
          <!-- Buscador principal mejorado -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="busqueda"
              label="Buscar en logs (mensaje, proceso, oficina)..."
              filled
              dark
              color="primary"
              debounce="300"
              class="enhanced-search-input"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn
                  icon="filter_list"
                  flat
                  round
                  dense
                  color="primary"
                  @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
                  :class="{ 'bg-primary': mostrarFiltrosAvanzados }"
                />
              </template>
            </q-input>
          </div>

          <!-- Filtros rápidos por tipo -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroTipo"
              :options="tiposDisponibles"
              label="Filtrar por tipo"
              filled
              dark
              color="primary"
              clearable
              multiple
              use-chips
              emit-value
              map-options
            />
          </div>

          <!-- Acciones -->
          <div class="col-12 col-md-2">
            <div class="console-actions">
              <q-btn
                color="positive"
                icon="download"
                label="Exportar"
                @click="exportarLogs"
                :disable="!logsFiltrados.length"
                class="full-width q-mb-xs"
              />
              <q-btn
                color="warning"
                icon="clear_all"
                label="Limpiar"
                @click="limpiarConsola"
                flat
                :disable="!logs.length"
                class="full-width"
              />
            </div>
          </div>
        </div>

        <!-- Filtros avanzados expandibles -->
        <q-slide-transition>
          <div v-show="mostrarFiltrosAvanzados" class="advanced-filters q-mt-md">
            <q-separator color="grey-6" class="q-mb-md" />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filtroOficina"
                  label="Filtrar por oficina..."
                  filled
                  dark
                  color="secondary"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filtroProceso"
                  label="Filtrar por proceso..."
                  filled
                  dark
                  color="secondary"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="settings" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filtroFecha"
                  label="Filtrar por fecha específica..."
                  filled
                  dark
                  color="secondary"
                  clearable
                  type="date"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>

      <!-- Contenedor principal de logs mejorado -->
      <q-card-section class="console-body-section flex-1">
        <div class="enhanced-console-container">
          <!-- Estado de carga -->
          <div v-if="loading && !logs.length" class="loading-container text-center q-pa-xl">
            <q-spinner-grid color="primary" size="80px" />
            <div class="q-mt-lg text-h6">Cargando logs del sistema...</div>
            <div class="text-grey-4">Obteniendo datos desde el servidor</div>
          </div>

          <!-- Estado vacío -->
          <div v-else-if="!logs.length" class="empty-container text-center q-pa-xl">
            <q-icon name="inbox" size="120px" color="grey-6" />
            <div class="q-mt-lg text-h5 text-grey-4">No hay logs disponibles</div>
            <div class="text-grey-5 q-mt-sm">
              No se encontraron registros con los filtros seleccionados
            </div>
            <q-btn
              color="primary"
              label="Actualizar"
              icon="refresh"
              @click="cargarLogs"
              class="q-mt-lg"
            />
          </div>

          <!-- Lista de logs mejorada -->
          <div v-else class="enhanced-logs-list">
            <q-virtual-scroll
              :items="logsFiltrados"
              separator
              v-slot="{ item: log }"
              class="logs-virtual-scroll"
              :virtual-scroll-item-size="120"
              :virtual-scroll-sticky-size-start="0"
              :virtual-scroll-sticky-size-end="0"
            >
              <div
                :class="[
                  'enhanced-log-entry',
                  `log-type-${(log.Type || 'info').toLowerCase()}`,
                  { 'log-entry-hover': true },
                ]"
                @click="mostrarDetalleLog(log)"
              >
                <div class="log-entry-header">
                  <div class="log-timestamp">
                    <q-icon name="access_time" size="16px" class="q-mr-xs" />
                    <span class="timestamp-text">{{ formatearFechaCompleta(log.Date) }}</span>
                  </div>
                  <div class="log-type-badge">
                    <q-chip
                      :color="getColorTipo(log.Type)"
                      text-color="white"
                      size="sm"
                      dense
                      :icon="getIconoTipo(log.Type)"
                    >
                      {{ log.Type || 'INFO' }}
                    </q-chip>
                  </div>
                </div>

                <div class="log-entry-content">
                  <div class="log-main-info">
                    <div class="log-process" v-if="log.Process">
                      <q-icon name="settings" size="16px" class="q-mr-xs text-blue-4" />
                      <span class="process-name">{{ log.Process }}</span>
                    </div>
                  </div>

                  <div class="log-metadata" v-if="log.Oficina || log.Usuario">
                    <div class="metadata-item" v-if="log.Oficina">
                      <q-icon name="business" size="14px" class="q-mr-xs text-green-4" />
                      <span>{{ log.Oficina.Nombre || log.Oficina }}</span>
                    </div>
                    <div class="metadata-item" v-if="log.Usuario">
                      <q-icon name="person" size="14px" class="q-mr-xs text-purple-4" />
                      <span>{{ log.Usuario }}</span>
                    </div>
                  </div>
                </div>

                <div class="log-entry-actions">
                  <q-btn
                    icon="visibility"
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    @click.stop="mostrarDetalleLog(log)"
                  >
                    <q-tooltip>Ver detalles completos</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-virtual-scroll>
          </div>
        </div>
      </q-card-section>

      <!-- Footer mejorado con estadísticas -->
      <q-card-section class="console-footer-section bg-grey-9">
        <div class="row items-center">
          <div class="col">
            <div class="footer-stats">
              <span class="text-caption text-grey-4">
                Mostrando {{ logsFiltrados.length }} de {{ logs.length }} logs
              </span>
              <q-chip
                v-if="busqueda || filtroTipo?.length || filtroOficina || filtroProceso"
                color="orange"
                text-color="white"
                size="sm"
                dense
                class="q-ml-sm"
                icon="filter_alt"
              >
                Filtros activos
              </q-chip>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              icon="refresh"
              flat
              round
              color="primary"
              @click="cargarLogs"
              :loading="loading"
              size="md"
            >
              <q-tooltip>Actualizar logs</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Modal de detalle de log -->
  <q-dialog v-model="modalDetalle">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Detalle del Log</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="logSeleccionado">
        <div class="log-detail-grid">
          <div class="log-detail-item">
            <strong>Fecha:</strong>
            <span>{{ formatearFechaCompleta(logSeleccionado.Date) }}</span>
          </div>
          <div class="log-detail-item">
            <strong>Tipo:</strong>
            <q-chip :color="getColorTipo(logSeleccionado.Type)" text-color="white" size="sm">
              {{ logSeleccionado.Type }}
            </q-chip>
          </div>
          <div class="log-detail-item" v-if="logSeleccionado.Process">
            <strong>Proceso:</strong>
            <span>{{ logSeleccionado.Process }}</span>
          </div>
          <div class="log-detail-item" v-if="logSeleccionado.Oficina">
            <strong>Oficina:</strong>
            <span>{{ logSeleccionado.Oficina.Nombre }}</span>
          </div>
          <div class="log-detail-item log-detail-message">
            <strong>Mensaje:</strong>
            <pre>{{ logSeleccionado.Message }}</pre>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { buildConsolaLogsQuery } from '../../services/endpoints'

const $q = useQuasar()

// Props
const props = defineProps({
  filtros: {
    type: Object,
    required: true,
  },
  logsIniciales: {
    type: Array,
    default: () => [],
  },
  filtroInicial: {
    type: String,
    default: '',
  },
})

// Estado principal
const mostrarConsola = ref(false)
const loading = ref(false)
const logs = ref([])
const busqueda = ref('')
const modalDetalle = ref(false)
const logSeleccionado = ref(null)

// Estados de filtros avanzados
const mostrarFiltrosAvanzados = ref(false)
const filtroTipo = ref([])
const filtroOficina = ref('')
const filtroProceso = ref('')
const filtroFecha = ref('')
const filtroActual = ref('')

// Computed principal con filtros mejorados
const logsFiltrados = computed(() => {
  let logsResultado = [...logs.value]

  // Filtro de búsqueda de texto
  if (busqueda.value) {
    const needle = busqueda.value.toLowerCase()
    logsResultado = logsResultado.filter(
      (log) =>
        (log.Message || '').toLowerCase().includes(needle) ||
        (log.Type || '').toLowerCase().includes(needle) ||
        (log.Process || '').toLowerCase().includes(needle) ||
        (log.Oficina?.Nombre || log.oficina || '').toLowerCase().includes(needle) ||
        (log.Usuario || log.usuario || '').toLowerCase().includes(needle)
    )
  }

  // Filtro por tipo
  if (filtroTipo.value && filtroTipo.value.length > 0) {
    logsResultado = logsResultado.filter((log) =>
      filtroTipo.value.includes((log.Type || 'INFO').toUpperCase())
    )
  }

  // Filtro por oficina
  if (filtroOficina.value) {
    const oficinaFilter = filtroOficina.value.toLowerCase()
    logsResultado = logsResultado.filter((log) =>
      (log.Oficina?.Nombre || log.oficina || '').toLowerCase().includes(oficinaFilter)
    )
  }

  // Filtro por proceso
  if (filtroProceso.value) {
    const procesoFilter = filtroProceso.value.toLowerCase()
    logsResultado = logsResultado.filter((log) =>
      (log.Process || log.proceso || '').toLowerCase().includes(procesoFilter)
    )
  }

  // Filtro por fecha específica
  if (filtroFecha.value) {
    logsResultado = logsResultado.filter((log) => {
      const logDate = new Date(log.Date || log.fecha)
      const filterDate = new Date(filtroFecha.value)
      return logDate.toDateString() === filterDate.toDateString()
    })
  }

  return logsResultado
})

// Computed para tipos disponibles
const tiposDisponibles = computed(() => {
  const tipos = new Set()
  logs.value.forEach((log) => {
    tipos.add((log.Type || 'INFO').toUpperCase())
  })
  return Array.from(tipos).map((tipo) => ({
    label: tipo,
    value: tipo,
  }))
})

// Watchers
watch(
  () => props.filtros,
  () => {
    if (mostrarConsola.value) {
      cargarLogs()
    }
  },
  { deep: true }
)

// Funciones principales
const abrirConsola = (logsData = null, filtroTexto = '') => {
  mostrarConsola.value = true

  if (logsData && logsData.length > 0) {
    logs.value = logsData
    filtroActual.value = filtroTexto
  } else {
    cargarLogs()
  }
}

const cerrarConsola = () => {
  mostrarConsola.value = false
  limpiarFiltros()
}

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroTipo.value = []
  filtroOficina.value = ''
  filtroProceso.value = ''
  filtroFecha.value = ''
  filtroActual.value = ''
  mostrarFiltrosAvanzados.value = false
}

// Funciones de formato mejoradas
const formatearFechaCompleta = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    const date = new Date(fecha)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return fecha
  }
}

const getColorTipo = (tipo) => {
  const tipoMap = {
    ERROR: 'negative',
    SUCCESS: 'positive',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'grey',
  }
  return tipoMap[(tipo || 'INFO').toUpperCase()] || 'info'
}

const getIconoTipo = (tipo) => {
  const iconMap = {
    ERROR: 'error',
    SUCCESS: 'check_circle',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'bug_report',
  }
  return iconMap[(tipo || 'INFO').toUpperCase()] || 'info'
}

// Función de carga de logs

// Funciones
const validarFiltros = (filtros) => {
  return filtros && filtros.fechaInicio && filtros.fechaFin
}

const cargarLogs = async () => {
  if (!validarFiltros(props.filtros)) return

  loading.value = true
  try {
    const { url, params } = buildConsolaLogsQuery(props.filtros)
    console.log('Cargando logs consola:', { url, params })

    const response = await axios.get(url, { params })
    logs.value = Array.isArray(response.data) ? response.data : []

    if (logs.value.length) {
      $q.notify({
        type: 'success',
        message: 'Logs cargados correctamente',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error cargando logs:', error)
    logs.value = []
    $q.notify({
      type: 'negative',
      message: 'Error cargando logs de consola',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Exposición de funciones para componentes padre
defineExpose({
  abrirConsola,
  cerrarConsola,
  mostrarConsola,
})

// Montar componente
onMounted(() => {
  // Si se pasan logs iniciales, los usamos
  if (props.logsIniciales && props.logsIniciales.length > 0) {
    logs.value = props.logsIniciales
    filtroActual.value = props.filtroInicial
  }
})

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true
}

const limpiarConsola = () => {
  logs.value = []
  limpiarFiltros()
  $q.notify({
    type: 'info',
    message: 'Consola limpiada',
    position: 'top',
  })
}

const exportarLogs = () => {
  if (!logs.value.length) return

  try {
    const datosExport = logsFiltrados.value.map((log) => ({
      Fecha: formatearFechaCompleta(log.Date),
      Tipo: log.Type || 'INFO',
      Proceso: log.Process || '',
      Mensaje: log.Message || '',
      Oficina: log.Oficina?.Nombre || '',
    }))

    const contenido = JSON.stringify(datosExport, null, 2)
    const blob = new Blob([contenido], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `logs_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Logs exportados correctamente',
      position: 'top',
    })
  } catch (error) {
    console.error('Error exportando logs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar logs',
      position: 'top',
    })
  }
}

// Lifecycle
onMounted(() => {
  // Los logs se cargarán cuando lleguen los filtros
})
</script>

<style lang="scss" scoped>
.console-modal {
  .q-dialog__inner {
    padding: 0;
  }
}

.enhanced-console-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

.console-header-section {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
}

.console-controls-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 24px;
}

.enhanced-search-input {
  .q-field__control {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    min-height: 48px;
  }

  .q-field__native,
  .q-field__input {
    color: white;
    font-size: 14px;
  }

  .q-field__label {
    color: rgba(255, 255, 255, 0.7);
  }
}

.advanced-filters {
  .q-input {
    .q-field__control {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

.console-body-section {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.enhanced-console-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-container,
.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
}

.enhanced-logs-list {
  flex: 1;
  overflow: hidden;
}

.logs-virtual-scroll {
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}

.enhanced-log-entry {
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-left: 4px solid #3f51b5;
    padding-left: 20px;
  }

  &.log-type-error {
    border-left: 3px solid #f44336;
    background: rgba(244, 67, 54, 0.05);
  }

  &.log-type-success {
    border-left: 3px solid #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }

  &.log-type-warning {
    border-left: 3px solid #ff9800;
    background: rgba(255, 152, 0, 0.05);
  }

  &.log-type-info {
    border-left: 3px solid #2196f3;
    background: rgba(33, 150, 243, 0.05);
  }
}

.log-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-timestamp {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.timestamp-text {
  font-family: 'Roboto Mono', monospace;
}

.log-type-badge {
  .q-chip {
    font-weight: 600;
    font-size: 11px;
  }
}

.log-entry-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-main-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-process {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
}

.process-name {
  background: rgba(33, 150, 243, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.log-message {
  display: flex;
  align-items: flex-start;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  line-height: 1.4;
}

.message-text {
  flex: 1;
  word-break: break-word;
}

.log-metadata {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metadata-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.log-entry-actions {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.enhanced-log-entry:hover .log-entry-actions {
  opacity: 1;
}

.console-footer-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 24px;
}

.footer-stats {
  display: flex;
  align-items: center;
}

// Responsive
@media (max-width: 768px) {
  .console-header-section,
  .console-controls-section,
  .console-footer-section {
    padding: 16px;
  }

  .enhanced-log-entry {
    padding: 12px 16px;
  }

  .log-entry-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .log-metadata {
    flex-direction: column;
    gap: 8px;
  }

