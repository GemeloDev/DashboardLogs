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
            <div class="text-subtitle2 text-grey-4 q-mt-sm" v-if="F">
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

      <!-- Controles centralizados con dropdowns responsive -->
      <q-card-section class="console-controls-section bg-grey-8">
        <!-- Buscador principal centrado -->
        <div class="row justify-center q-mb-md">
          <div class="col-12 col-md-8 col-lg-6">
            <q-input
              v-model="busqueda"
              label="Buscar en logs (mensaje, proceso, oficina)..."
              filled
              dark
              color="primary"
              debounce="300"
              class="enhanced-search-input"
              clearable
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Dropdowns de filtros centralizados -->
        <div class="row justify-center q-col-gutter-md">
          <div class="col-auto">
            <!-- Dropdown de Oficinas -->
            <q-btn-dropdown
              color="primary"
              icon="business"
              :label="oficinaSeleccionada || 'Oficina'"
              dropdown-icon="keyboard_arrow_down"
              dense
              unelevated
              class="dropdown-filter"
            >
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroOficina = null
                    oficinaSeleccionada = null
                  }"
                >
                  <q-item-section>
                    <q-item-label>Todas las oficinas</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-for="oficina in oficinasDisponibles"
                  :key="oficina"
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroOficina = null
                    oficinaSeleccionada = null
                  }"
                >
                  <q-item-section>
                    <q-item-label>{{ oficina }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <div class="col-auto">
            <!-- Dropdown de Usuarios -->
            <q-btn-dropdown
              color="secondary"
              icon="person"
              :label="usuarioSeleccionado || 'Usuario'"
              dropdown-icon="keyboard_arrow_down"
              dense
              unelevated
              class="dropdown-filter"
            >
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroUsuario = null
                    usuarioSeleccionado = null
                  }
                  "
                >
                  <q-item-section>
                    <q-item-label>Todos los usuarios</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-for="usuario in usuariosDisponibles"
                  :key="usuario"
                  clickable
                  v-close-popup
                  @click=" () => {
                    filtroUsuario = usuario
                    usuarioSeleccionado = usuario
                  }
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ usuario }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <div class="col-auto">
            <!-- Dropdown de Tipos de Log -->
            <q-btn-dropdown
              color="info"
              icon="category"
              :label="tipoSeleccionado || 'Tipo'"
              dropdown-icon="keyboard_arrow_down"
              dense
              unelevated
              class="dropdown-filter"
            >
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroTipo = []
                    tipoSeleccionado = null
                  }
                  "
                >
                  <q-item-section>
                    <q-item-label>Todos los tipos</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-for="tipo in tiposDisponibles"
                  :key="tipo.value"
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroTipo = [tipo.value]
                    tipoSeleccionado = tipo.label
                  }
                  "
                >
                  <q-item-section>
                    <q-item-label>
                      <q-icon :name="tipo.icon" :color="tipo.color" class="q-mr-sm" />
                      {{ tipo.label }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <div class="col-auto">
            <!-- Dropdown de Fechas -->
            <q-btn-dropdown
              color="accent"
              icon="event"
              :label="rangoFechaSeleccionado || 'Fecha'"
              dropdown-icon="keyboard_arrow_down"
              dense
              unelevated
              class="dropdown-filter"
            >
              <q-list dense>
                <q-item clickable v-close-popup @click="aplicarRangoFecha('hoy')">
                  <q-item-section>
                    <q-item-label>Hoy</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="aplicarRangoFecha('ayer')">
                  <q-item-section>
                    <q-item-label>Ayer</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="aplicarRangoFecha('semana')">
                  <q-item-section>
                    <q-item-label>Esta semana</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="aplicarRangoFecha('mes')">
                  <q-item-section>
                    <q-item-label>Este mes</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  @click="() => {
                    filtroFecha = null
                    rangoFechaSeleccionado = null
                  }
                  "
                >
                  <q-item-section>
                    <q-item-label>Todas las fechas</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <!-- Botones de acción -->
          <div class="col-auto">
            <q-btn
              color="positive"
              icon="download"
              label="Exportar"
              @click="exportarLogs"
              :disable="!logsFiltrados.length"
              dense
              unelevated
              class="q-mr-sm"
            />
            <q-btn
              color="warning"
              icon="filter_alt_off"
              label="Limpiar"
              @click="limpiarTodosFiltros"
              :disable="!hayFiltrosActivos"
              dense
              flat
            />
          </div>
        </div>

        <!-- Indicadores de filtros activos -->
        <div v-if="hayFiltrosActivos" class="row justify-center q-mt-md">
          <div class="col-auto">
            <q-chip
              v-if="oficinaSeleccionada"
              removable
              @remove="() => {
                filtroOficina = null
                oficinaSeleccionada = null
              }
              "
              color="primary"
              text-color="white"
              icon="business"
              size="sm"
            >
              {{ oficinaSeleccionada }}
            </q-chip>
            <q-chip
              v-if="usuarioSeleccionado"
              removable
              @remove="
                filtroUsuario = null
                usuarioSeleccionado = null
              "
              color="secondary"
              text-color="white"
              icon="person"
              size="sm"
            >
              {{ usuarioSeleccionado }}
            </q-chip>
            <q-chip
              v-if="tipoSeleccionado"
              removable
              @remove="
                filtroTipo = []
                tipoSeleccionado = null
              "
              color="info"
              text-color="white"
              icon="category"
              size="sm"
            >
              {{ tipoSeleccionado }}
            </q-chip>
            <q-chip
              v-if="rangoFechaSeleccionado"
              removable
              @remove="
                filtroFecha = null
                rangoFechaSeleccionado = null
              "
              color="accent"
              text-color="white"
              icon="event"
              size="sm"
            >
              {{ rangoFechaSeleccionado }}
            </q-chip>
          </div>
        </div>
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

          <!-- Lista de logs mejorada con optimización de rendimiento -->
          <div v-else class="enhanced-logs-list">
            <!-- Información de rendimiento -->
            <div
              v-if="logsFiltrados.length > 1000"
              class="performance-info q-pa-sm bg-orange-1 text-orange-8 rounded-borders q-mb-md"
            >
              <q-icon name="info" class="q-mr-sm" />
              Mostrando {{ logsFiltrados.length }} logs. Para mejor rendimiento, considera usar
              filtros más específicos.
            </div>

            <q-virtual-scroll
              :items="logsFiltrados"
              separator
              v-slot="{ item: log }"
              class="logs-virtual-scroll"
              :virtual-scroll-item-size="120"
              :virtual-scroll-sticky-size-start="0"
              :virtual-scroll-sticky-size-end="0"
              :virtual-scroll-slice-ratio-before="2"
              :virtual-scroll-slice-ratio-after="2"
              style="max-height: 70vh"
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
                    <div class="log-process" v-if="log.process">
                      <q-icon name="settings" size="16px" class="q-mr-xs text-blue-4" />
                      <span class="process-name">{{ log.process }}</span>
                    </div>
                  </div>

                  <div class="log-metadata" v-if="log.Oficina || log.Usuario">
                    <div class="metadata-item" v-if="log.Oficina">
                      <q-icon name="business" size="14px" class="q-mr-xs text-green-4" />
                      <span>{{ log.Oficina.nombre }}</span>
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
          <div class="log-detail-item" v-if="logSeleccionado.process">
            <strong>Proceso:</strong>
            <span>{{ logSeleccionado.process }}</span>
          </div>
          <div class="log-detail-item" v-if="logSeleccionado.oficina">
            <strong>Oficina:</strong>
            <span>{{ logSeleccionado.oficina.nombre }}</span>
          </div>
          <div class="log-detail-item log-detail-message">
            <strong>Mensaje:</strong>
            <pre>{{ logSeleccionado.message }}</pre>
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

// Nuevos estados para dropdowns centralizados
const oficinaSeleccionada = ref(null)
const usuarioSeleccionado = ref(null)
const tipoSeleccionado = ref(null)
const rangoFechaSeleccionado = ref(null)
const filtroUsuario = ref(null)

// Computed principal con filtros mejorados y optimizados
const logsFiltrados = computed(() => {
  console.log('🔍 Aplicando filtros locales:', {
    busqueda: busqueda.value,
    filtroTipo: filtroTipo.value,
    filtroOficina: filtroOficina.value,
    filtroProceso: filtroProceso.value,
    filtroFecha: filtroFecha.value,
    totalLogs: logs.value.length,
  })

  let logsResultado = [...logs.value]

  // Filtro de búsqueda de texto
  if (busqueda.value && busqueda.value.trim()) {
    const needle = busqueda.value.toLowerCase().trim()
    logsResultado = logsResultado.filter(
      (log) =>
        (log.Message || '').toLowerCase().includes(needle) ||
        (log.Type || '').toLowerCase().includes(needle) ||
        (log.Process || '').toLowerCase().includes(needle) ||
        (log.Oficina?.Nombre || log.oficina || '').toLowerCase().includes(needle) ||
        (log.Usuario || log.usuario || '').toLowerCase().includes(needle) ||
        (log.Dispositivo || log.device || '').toLowerCase().includes(needle)
    )
  }

  // Filtro por tipo
  if (filtroTipo.value && filtroTipo.value.length > 0) {
    logsResultado = logsResultado.filter((log) =>
      filtroTipo.value.includes((log.Type || 'INFO').toUpperCase())
    )
  }

  // Filtro por oficina
  if (filtroOficina.value && filtroOficina.value.trim()) {
    const oficinaFilter = filtroOficina.value.toLowerCase().trim()
    logsResultado = logsResultado.filter((log) =>
      (log.Oficina?.Nombre || log.oficina || '').toLowerCase().includes(oficinaFilter)
    )
  }

  // Filtro por proceso
  if (filtroProceso.value && filtroProceso.value.trim()) {
    const procesoFilter = filtroProceso.value.toLowerCase().trim()
    logsResultado = logsResultado.filter((log) =>
      (log.Process || log.proceso || '').toLowerCase().includes(procesoFilter)
    )
  }

  // Filtro por fecha específica
  if (filtroFecha.value) {
    logsResultado = logsResultado.filter((log) => {
      const logDate = new Date(log.Date || log.fecha)
      const filterDate = new Date(filtroFecha.value)

      if (isNaN(logDate.getTime()) || isNaN(filterDate.getTime())) {
        return false
      }

      return logDate.toDateString() === filterDate.toDateString()
    })
  }

  // Nuevos filtros de dropdown
  // Filtro por oficina seleccionada (dropdown)
  if (oficinaSeleccionada.value) {
    logsResultado = logsResultado.filter((log) => {
      const logOficina = log.Oficina?.Nombre || log.oficina || log.OficinaNombre || ''
      return logOficina.trim() === oficinaSeleccionada.value.trim()
    })
  }

  // Filtro por usuario seleccionado (dropdown)
  if (usuarioSeleccionado.value) {
    logsResultado = logsResultado.filter((log) => {
      const logUsuario = log.Usuario || log.usuario || log.Person?.nombres || ''
      return logUsuario.trim() === usuarioSeleccionado.value.trim()
    })
  }

  // Filtro por usuario adicional
  if (filtroUsuario.value) {
    const usuarioFilter = filtroUsuario.value.toLowerCase().trim()
    logsResultado = logsResultado.filter((log) => {
      const logUsuario = log.Usuario || log.usuario || log.Person?.nombres || ''
      return logUsuario.toLowerCase().includes(usuarioFilter)
    })
  }

  console.log('✅ Filtros aplicados:', {
    resultados: logsResultado.length,
    original: logs.value.length,
    filtrosActivos: {
      busqueda: !!busqueda.value,
      tipo: !!(filtroTipo.value && filtroTipo.value.length),
      oficina: !!filtroOficina.value,
      proceso: !!filtroProceso.value,
      fecha: !!filtroFecha.value,
      oficinaDropdown: !!oficinaSeleccionada.value,
      usuarioDropdown: !!usuarioSeleccionado.value,
      tipoDropdown: !!tipoSeleccionado.value,
      fechaDropdown: !!rangoFechaSeleccionado.value,
    },
  })

  return logsResultado
})

// Computed para tipos disponibles con iconos y colores
const tiposDisponibles = computed(() => {
  const tipos = new Set()
  logs.value.forEach((log) => {
    tipos.add((log.Type || 'INFO').toUpperCase())
  })

  const tipoConfig = {
    ERROR: { icon: 'error', color: 'negative' },
    WARNING: { icon: 'warning', color: 'orange' },
    INFO: { icon: 'info', color: 'info' },
    SUCCESS: { icon: 'check_circle', color: 'positive' },
    DEBUG: { icon: 'bug_report', color: 'purple' },
  }

  return Array.from(tipos).map((tipo) => ({
    label: tipo,
    value: tipo,
    icon: tipoConfig[tipo]?.icon || 'circle',
    color: tipoConfig[tipo]?.color || 'grey',
  }))
})

// Computed para oficinas disponibles
const oficinasDisponibles = computed(() => {
  const oficinas = new Set()
  logs.value.forEach((log) => {
    const oficina = log.Oficina?.Nombre || log.oficina || log.OficinaNombre
    if (oficina && oficina.trim()) {
      oficinas.add(oficina.trim())
    }
  })
  return Array.from(oficinas).sort()
})

// Computed para usuarios disponibles
const usuariosDisponibles = computed(() => {
  const usuarios = new Set()
  logs.value.forEach((log) => {
    const usuario = log.Usuario || log.usuario || log.Person?.nombres
    if (usuario && usuario.trim()) {
      usuarios.add(usuario.trim())
    }
  })
  return Array.from(usuarios).sort()
})

// Computed para verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return !!(
    busqueda.value ||
    (filtroTipo.value && filtroTipo.value.length > 0) ||
    filtroOficina.value ||
    filtroProceso.value ||
    filtroFecha.value ||
    oficinaSeleccionada.value ||
    usuarioSeleccionado.value ||
    tipoSeleccionado.value ||
    rangoFechaSeleccionado.value ||
    filtroUsuario.value
  )
})

// Watchers mejorados
watch(
  () => props.filtros,
  () => {
    if (mostrarConsola.value) {
      console.log('🔄 Filtros del prop cambiaron, recargando logs...')
      cargarLogs()
    }
  },
  { deep: true }
)

// Watcher para filtros de la UI que requieren nueva petición
watch(
  [filtroTipo],
  () => {
    if (mostrarConsola.value && logs.value.length > 0) {
      console.log('🔄 Filtro de tipo cambió, recargando logs para aplicar en servidor...')
      // Debounce para evitar muchas peticiones
      setTimeout(() => {
        cargarLogs()
      }, 500)
    }
  },
  { deep: true }
)

// Los filtros locales (búsqueda, oficina, proceso, fecha) se aplican en tiempo real
// sin necesidad de recargar datos del servidor

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
  console.log('🧹 Limpiando filtros de la consola...')

  busqueda.value = ''
  filtroTipo.value = []
  filtroOficina.value = ''
  filtroProceso.value = ''
  filtroFecha.value = ''
  filtroActual.value = ''
  mostrarFiltrosAvanzados.value = false

  // Notificar al usuario
  $q.notify({
    type: 'info',
    message: 'Filtros limpiados',
    position: 'top',
    timeout: 1500,
  })

  // Si la consola está abierta y no tiene logs de gráfica, recargar
  if (mostrarConsola.value && (!props.logsIniciales || props.logsIniciales.length === 0)) {
    console.log('🔄 Recargando logs después de limpiar filtros...')
    cargarLogs()
  }
}

// Métodos para los nuevos dropdowns centralizados
const limpiarTodosFiltros = () => {
  console.log('🧹 Limpiando todos los filtros incluyendo dropdowns...')

  // Filtros originales
  busqueda.value = ''
  filtroTipo.value = []
  filtroOficina.value = ''
  filtroProceso.value = ''
  filtroFecha.value = ''
  filtroActual.value = ''
  mostrarFiltrosAvanzados.value = false

  // Nuevos filtros de dropdowns
  oficinaSeleccionada.value = null
  usuarioSeleccionado.value = null
  tipoSeleccionado.value = null
  rangoFechaSeleccionado.value = null
  filtroUsuario.value = null

  // Notificar al usuario
  $q.notify({
    type: 'info',
    message: 'Todos los filtros limpiados',
    position: 'top',
    timeout: 1500,
  })

  // Si la consola está abierta y no tiene logs de gráfica, recargar
  if (mostrarConsola.value && (!props.logsIniciales || props.logsIniciales.length === 0)) {
    console.log('🔄 Recargando logs después de limpiar todos los filtros...')
    cargarLogs()
  }
}

const aplicarRangoFecha = (rango) => {
  console.log('📅 Aplicando rango de fecha:', rango)

  const hoy = new Date()
  let fechaInicio
  //fechaFin

  switch (rango) {
    case 'hoy': {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
   //   fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
      rangoFechaSeleccionado.value = 'Hoy'
      break
    }
    case 'ayer': {
      const ayer = new Date(hoy)
      ayer.setDate(hoy.getDate() - 1)
      fechaInicio = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate())
      //  fechaFin = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59)
      rangoFechaSeleccionado.value = 'Ayer'
      break
    }
    case 'semana': {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay())
      fechaInicio = new Date(
        inicioSemana.getFullYear(),
        inicioSemana.getMonth(),
        inicioSemana.getDate()
      )
    //  fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
      rangoFechaSeleccionado.value = 'Esta semana'
      break
    }
    case 'mes': {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      //   fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)
      rangoFechaSeleccionado.value = 'Este mes'
      break
    }
    default:
      return
  }

  // Aplicar filtro de fecha (aquí podrías integrar con tu sistema de filtros de fecha)
  filtroFecha.value = fechaInicio.toISOString().split('T')[0]

  $q.notify({
    type: 'positive',
    message: `Filtro aplicado: ${rangoFechaSeleccionado.value}`,
    position: 'top',
    timeout: 2000,
  })
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
    // Combinar filtros del prop con filtros de la UI
    const filtrosCombinados = {
      ...props.filtros,
      // Agregar filtros de la UI a la petición
      tipoLog: filtroTipo.value && filtroTipo.value.length === 1 ? filtroTipo.value[0] : undefined,
      // proceso: filtroProceso.value || props.filtros.proceso,
      // oficinaId se mantiene del props.filtros
    }

    const { url, params } = buildConsolaLogsQuery(filtrosCombinados)

    console.log('🔄 Cargando logs consola con filtros combinados:', {
      url,
      params,
      filtrosUI: {
        busqueda: busqueda.value,
        filtroTipo: filtroTipo.value,
        filtroOficina: filtroOficina.value,
        filtroProceso: filtroProceso.value,
      },
      filtrosProp: props.filtros,
    })

    const response = await axios.get(url, { params })

    if (Array.isArray(response.data)) {
      logs.value = response.data
      console.log('✅ Logs cargados:', {
        total: response.data.length,
        muestra: response.data.slice(0, 3).map((log) => ({
          Date: log.Date || log.fecha,
          Type: log.Type,
          Process: log.Process,
          Oficina: log.Oficina?.Nombre || log.oficina,
        })),
      })
    } else {
      logs.value = []
      console.warn('⚠️ Respuesta no es array:', response.data)
    }

    if (logs.value.length > 0) {
      $q.notify({
        type: 'success',
        message: `${logs.value.length} logs cargados correctamente`,
        position: 'top',
        timeout: 2000,
      })
    } else {
      $q.notify({
        type: 'info',
        message: 'No se encontraron logs con los filtros seleccionados',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('❌ Error cargando logs:', error)
    logs.value = []
    $q.notify({
      type: 'negative',
      message: 'Error cargando logs de consola',
      caption: error.message || 'Error de conexión',
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

// const limpiarConsola = () => {
//   logs.value = []
//   limpiarFiltros()
//   $q.notify({
//     type: 'info',
//     message: 'Consola limpiada',
//     position: 'top',
//   })
// }

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

// Estilos para dropdowns centralizados
.dropdown-filter {
  min-width: 120px;
  margin: 0 4px;

  .q-btn-dropdown__arrow {
    margin-left: 4px;
  }
}

.dropdown-filter .q-btn {
  font-size: 13px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Responsive para dropdowns
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

  // Dropdowns responsive
  .dropdown-filter {
    min-width: 100px;
    margin: 2px;

    .q-btn {
      font-size: 12px;
      padding: 6px 12px;
    }
  }

  // En mobile, apilar dropdowns verticalmente en pantallas muy pequeñas
  @media (max-width: 480px) {
    .row.justify-center.q-col-gutter-md {
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .col-auto {
        width: 100%;
        max-width: 200px;
      }

      .dropdown-filter {
        width: 100%;
        min-width: unset;
      }
    }
  }
}
</style>

