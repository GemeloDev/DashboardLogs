<template>
  <!-- Modal de Consola Mejorada -->
  <q-dialog
    v-model="mostrarConsola"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarConsola"
  >
    <q-card class="console-modal-card console-dialog-fullscreen bg-dark text-white">
      <!-- Header -->
      <q-card-section class="console-header bg-grey-9">
        <div class="row">
          <div class="col">
            <div class="text-h5">
              <q-icon name="history_edu" class="q-mr-sm" color="primary" />
              Bitácora de Eventos de Pasaportes
              <q-chip
                v-if="logs.length"
                color="primary"
                text-color="white"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ logsFiltrados.length }} / {{ logs.length }} eventos
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm" v-if="filtroActual">
              {{ filtroActual }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn icon="minimize" flat round color="grey-4" @click="cerrarConsola" class="q-mr-sm">
              <q-tooltip>Minimizar consola</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarConsola">
              <q-tooltip>Cerrar consola</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 q-pt-md">
            <q-list>
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
                      🎛️ Panel de Filtros Avanzados
                    </q-item-label>
                    <q-item-label caption class="text-cyan-3">
                      {{ logsFiltrados.length }} de {{ logs.length }} registros mostrados
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center">
                      <q-badge
                        v-if="hayFiltrosActivos"
                        color="cyan-5"
                        text-color="white"
                        :label="contadorFiltrosActivos"
                        rounded
                        class="q-mr-sm"
                      />
                      <q-icon
                        :name="filtrosToggle ? 'expand_less' : 'expand_more'"
                        color="cyan-4"
                        size="20px"
                      />
                    </div>
                  </q-item-section>
                </template>
                <q-card class="bg-grey-8">
                  <!-- Controles -->
                  <q-card-section class="console-controls bg-grey-8">
                    <div class="row q-col-gutter-md">
                      <!-- Primera fila: Búsqueda -->
                      <div class="col-12 col-md-10">
                        <q-input
                          v-model="busqueda"
                          label="Buscar (Nombre, Pasaporte, ID...)"
                          filled
                          dark
                          color="primary"
                          debounce="300"
                          clearable
                        >
                          <template v-slot:prepend>
                            <q-icon name="search" color="primary" />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-2">
                        <q-btn-dropdown
                          color="positive"
                          icon="download"
                          label="Exportar"
                          :disable="!logsFiltrados.length"
                          class="q-mr-sm"
                        >
                          <q-list>
                            <q-item clickable @click="exportarLogs('excel')">
                              <q-item-section avatar>
                                <q-icon name="table_chart" color="green" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>Excel (.xlsx)</q-item-label>
                                <q-item-label caption>Archivo Excel con formato</q-item-label>
                              </q-item-section>
                            </q-item>

                            <q-item clickable @click="exportarLogs('json')">
                              <q-item-section avatar>
                                <q-icon name="code" color="blue" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>JSON (.json)</q-item-label>
                                <q-item-label caption>Formato JSON estructurado</q-item-label>
                              </q-item-section>
                            </q-item>

                            <q-item clickable @click="exportarLogs('txt')">
                              <q-item-section avatar>
                                <q-icon name="text_snippet" color="orange" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>Texto (.txt)</q-item-label>
                                <q-item-label caption>Archivo de texto plano</q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                        <q-btn
                          color="negative"
                          icon="clear_all"
                          label="Limpiar"
                          @click="limpiarTodosFiltros"
                          flat
                        />
                      </div>

                      <!-- Segunda fila: Filtros avanzados - Optimizado para responsive -->
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          emit-value
                          map-options
                          filled
                          dark
                          clearable
                          use-input
                          dense
                          v-model="filtroOficina"
                          :options="opcionesOficinas"
                          @filter="filtrarOficinas"
                          option-label="label"
                          option-value="value"
                          label="Oficina"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="business" color="orange" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          emit-value
                          map-options
                          filled
                          dark
                          clearable
                          use-input
                          dense
                          v-model="filtroDispositivo"
                          :options="opcionesCanales"
                          @filter="filtrarDispositivos"
                          option-label="label"
                          option-value="value"
                          label="Canal"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="devices" color="cyan" />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          emit-value
                          map-options
                          filled
                          dark
                          clearable
                          use-input
                          dense
                          v-model="filtroTipoLog"
                          :options="opcionesEstatus"
                          option-label="label"
                          option-value="value"
                          label="Tipo"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="rule" color="blue" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          emit-value
                          map-options
                          filled
                          dark
                          clearable
                          use-input
                          dense
                          v-model="filtroProceso"
                          :options="opcionesOperacion"
                          option-label="label"
                          option-value="value"
                          label="Proceso"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="settings" color="purple" />
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <div v-if="filtrosActivos.length" class="row q-mt-md">
                      <div class="col-12">
                        <div class="text-caption text-grey-4 q-mb-xs">Filtros activos:</div>
                        <q-chip
                          v-for="filtro in filtrosActivos"
                          :key="filtro.key"
                          :color="filtro.color"
                          text-color="white"
                          removable
                          @remove="limpiarFiltro(filtro.key)"
                          size="sm"
                          class="q-mr-xs"
                        >
                          <q-icon :name="filtro.icon" size="16px" class="q-mr-xs" />
                          {{ filtro.label }}
                        </q-chip>
                        <q-btn
                          icon="clear_all"
                          label="Limpiar todos"
                          flat
                          size="sm"
                          color="red"
                          @click="limpiarTodosFiltros"
                          class="q-ml-sm"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="console-body">
        <!-- Loader principal -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-grid color="primary" size="80px" />
          <div class="q-mt-lg text-h6">Cargando logs...</div>
        </div>

        <!-- <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="inbox" size="120px" color="grey-6" />
          <div class="q-mt-lg text-h5 text-grey-4">No hay logs disponibles</div>
        </div> -->

        <div v-else>
          <div class="row justify-center items-stretch q-gutter-sm">
            <div
              v-for="(log, index) in logsFiltrados"
              :key="log.id || index"
              class="col-xs-12 col-sm-12 col-auto width-responsive"
            >
              <q-card
                class="log-card fit cursor-pointer"
                :class="getClassByStatus(log.status)"
                @click="mostrarDetalleLog(log)"
                bordered flat
              >
                <q-card-section class="log-card-header">
                  <div class="row items-center justify-between">
                    <div class="col-auto">
                      <q-chip
                        :color="getColorStatus(log.status)"
                        text-color="white"
                        size="md"
                        :icon="getIconoTipo(log.status)"
                        class="text-weight-bold"
                      >
                        {{log.status}}
                      </q-chip>
                    </div>
                    <div class="col-auto">
                      <span class="text-caption text-blue-4 text-weight-medium"> {{ formatearFechaCorta(log.eventTime) }} </span>
                    </div>
                  </div>
                </q-card-section>

                <div class="text-subtitle2 text-white ellipsis q-pa-sm q-mt-sm">
                  <q-icon name="settings_applications" color="primary" size="xs" />
                  {{ log.operationType }}
                </div>
                <div class="q-mt-sm text-caption text-grey-3 ellipsis-2-lines" style="min-height: 32px;">
                   <span v-if="log.reason" class="text-red-3 text-weight-bold">
                     <q-icon name="warning" /> {{ log.reason.description }}
                   </span>
                   <span v-else>
                     {{ log.message }}
                   </span>
                </div>

                <q-card-section class="log-card-content">
                  <div class="log-device-section enhanced-section q-mt-sm">
                    <div class="section-header">
                      <q-icon name="person" color="cyan-4" size="20px" class="q-mr-sm" />
                      <div class="text-weight-bold text-cyan-4 section-title">
                        Sujeto e información del trámite
                      </div>
                    </div>

                    <div class="section-content">
                      <div class="q-pb-sm">
                        <q-icon name="badge" size="xs" />
                        {{ log.passport.passportNumber }}
                      </div>
                      <div class="detail-item q-pb-sm">
                        {{ log.passport.fullName }} | {{ log.passport.personId }}
                      </div>
                      <div class="detail-item">
                        <q-icon name="flag" color="cyan-3" size="16px" class="q-mr-xs" />
                        <span class="detail-label">Nacionalidad:</span>
                        <span class="detail-value">{{ log.passport.nationality }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="row q-mt-sm items-center justify-between">
                    <div class="text-caption text-grey-5 ellipsis" style="max-width: 70%">
                      <q-icon name="place" size="xs" /> {{ log.office?.officeName }}
                    </div>
                    <q-badge outline color="grey-5" :label="log.channel" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Paginación -->
          <div class="pagination-section q-mt-lg">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="pagination-info text-caption text-grey-4">
                  Mostrando {{ (paginaActual - 1) * registrosPorPagina + 1 }} -
                  {{ Math.min(paginaActual * registrosPorPagina, logsFiltrados.length) }}
                  de {{ logsFiltrados.length }} registros
                  <span class="q-ml-sm"> ({{ logs.length }} total) </span>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 text-center">
                <q-select
                  v-model="registrosPorPagina"
                  :options="[
                    { label: '25 por página', value: 25 },
                    { label: '50 por página', value: 50 },
                    { label: '100 por página', value: 100 },
                  ]"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  dense
                  dark
                  outlined
                  color="primary"
                  style="max-width: 150px; margin: 0 auto"
                  @update:model-value="paginaActual = 1"
                >
                  <template v-slot:prepend>
                    <q-icon name="view_list" size="16px" color="primary" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-4 text-right">
                <q-pagination
                  v-model="paginaActual"
                  :max="totalPaginas"
                  :max-pages="7"
                  direction-links
                  boundary-links
                  color="primary"
                  size="sm"
                  @update:model-value="cambiarPagina"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="console-footer bg-grey-9">
        <div class="row items-center">
          <div class="col">
            <span class="text-caption text-grey-4">
              Total: {{ logsFiltrados.length }} registros
              <span class="q-ml-sm"> ({{ logs.length }} sin filtrar) </span>
            </span>
          </div>
          <div class="col-auto">
            <q-btn
              icon="refresh"
              flat
              round
              color="primary"
              @click="cargarLogs"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Modal de detalle -->
  <q-dialog v-model="modalDetalle">
      <q-card style="min-width: 600px; max-width: 800px" class="bg-dark text-white">
        <q-toolbar class="bg-grey-9">
          <q-toolbar-title><q-icon name="info" class="q-mr-sm" />Detalle del Evento</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section v-if="logSeleccionado" class="q-pa-md">
          <div class="row q-col-gutter-md">

            <div class="col-12 col-md-6">
              <q-list dark separator dense>
                <q-item-label header class="text-primary">Información del Trámite</q-item-label>

                <q-item>
                  <q-item-section avatar><q-icon name="fingerprint" color="grey" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>ID Evento</q-item-label>
                    <q-item-label>{{ logSeleccionado.id }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar><q-icon name="event" color="blue" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Fecha y Hora</q-item-label>
                    <q-item-label>{{ formatearFechaCompleta(logSeleccionado.eventTime) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar><q-icon name="engineering" color="orange" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Operación</q-item-label>
                    <q-item-label>{{ logSeleccionado.operationType }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar><q-icon name="fact_check" :color="getColorStatus(logSeleccionado.status)" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Estatus</q-item-label>
                    <q-item-label class="text-weight-bold" :class="`text-${getColorStatus(logSeleccionado.status)}`">
                      {{ logSeleccionado.status }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <q-list dark separator dense>
                <q-item-label header class="text-secondary">Sujeto y Ubicación</q-item-label>

                <q-item>
                  <q-item-section avatar><q-icon name="person" color="white" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Ciudadano</q-item-label>
                    <q-item-label class="text-h6">{{ logSeleccionado.passport?.fullName }}</q-item-label>
                    <q-item-label caption>ID: {{ logSeleccionado.passport?.personId }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar><q-icon name="badge" color="white" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Pasaporte</q-item-label>
                    <q-item-label>{{ logSeleccionado.passport?.passportNumber }} ({{ logSeleccionado.passport?.nationality }})</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar><q-icon name="store" color="white" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>Oficina</q-item-label>
                    <q-item-label>{{ logSeleccionado.office?.officeName }}</q-item-label>
                    <q-item-label caption>{{ logSeleccionado.office?.province }}, {{ logSeleccionado.office?.city }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12">
              <q-separator dark class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm text-grey-4">Detalles Técnicos</div>

              <div class="row q-col-gutter-sm">
                <div class="col-12" v-if="logSeleccionado.reason">
                  <q-banner rounded class="bg-red-9 text-white">
                    <template v-slot:avatar><q-icon name="error" color="white" /></template>
                    <div class="text-weight-bold">{{ logSeleccionado.reason.code }}</div>
                    {{ logSeleccionado.reason.description }}
                  </q-banner>
                </div>

                <div class="col-12" v-else>
                  <q-banner rounded class="bg-grey-8">
                    {{ logSeleccionado.message }}
                  </q-banner>
                </div>

                <div class="col-6 col-sm-4">
                  <q-item dense>
                    <q-item-section>
                      <q-item-label caption>Operador (User)</q-item-label>
                      <q-item-label>{{ logSeleccionado.user?.fullName }} ({{ logSeleccionado.user?.username }})</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-6 col-sm-4">
                  <q-item dense>
                    <q-item-section>
                      <q-item-label caption>Canal / Source</q-item-label>
                      <q-item-label>{{ logSeleccionado.channel }} / {{ logSeleccionado.meta?.sourceApp }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-6 col-sm-4">
                  <q-item dense>
                    <q-item-section>
                      <q-item-label caption>IP Address</q-item-label>
                      <q-item-label>{{ logSeleccionado.meta?.ip }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </div>

          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { CatalogService } from '../../services/catalogService.js'
import { ChartDataService } from 'src/services/chartDataService.js'

// 📝 Props
defineProps({
  filtros: {
    type: Object,
    default: () => ({}),
  },
})

const $q = useQuasar()

// Estado
const mostrarConsola = ref(false)
const loading = ref(false)
const filtrosToggle = ref(false)
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const logs = ref([])

// FILTROS
const busqueda = ref('')
const filtroTipoLog = ref(null) // Renombrado de filtroTipo
const filtroProceso = ref(null) // Nuevo filtro de proceso
const filtroDispositivo = ref(null) // Nuevo filtro de dispositivo
const filtroOficina = ref(null)

// --- OPCIONES PARA SELECTS (Basadas en tu JSON) ---
const opcionesEstatus = [
  { label: 'Emitido', value: 'EMITIDO' },
  { label: 'Rechazado', value: 'RECHAZADO' },
  { label: 'En Trámite', value: 'ENTRAMITE' },
  { label: 'Cancelado', value: 'CANCELADO' }
]

const opcionesOperacion = [
  { label: 'Renovación', value: 'RENOVACION' },
  { label: 'Emisión', value: 'EMISION' },
  { label: 'Emergencia', value: 'EMERGENCIA' }
]

const opcionesCanales = [
  { label: 'Web', value: 'WEB' },
  { label: 'Oficina', value: 'OFICINA' },
  { label: 'Kiosko', value: 'KIOSKO' }
]

// Las oficinas se pueden llenar dinámicamente si prefieres
const opcionesOficinas = ref([])

const filtroActual = ref('')
const datosDesdeGrafica = ref(false)

// 🚀 [NUEVO] Variables para control de origen y filtros
const origenConsola = ref('') // 'sidebar' | 'graficas' | 'kpis'
const filtroTimeout = ref(null) // Para debounce de filtros

// Variables de paginación
const paginaActual = ref(1)
const registrosPorPagina = ref(50) // 50 registros por página para mejor rendimiento

// Variables de loading
const loadingFiltros = ref(false)
const loadingPaginacion = ref(false)

// 📅 VALIDAR Y FORMATEAR FECHA A ISO (YYYY-MM-DD)
const formatearFechaCorta = (isoDate) => {
    if (!isoDate) return ''
    return date.formatDate(isoDate, 'DD/MM/YYYY HH:mm')
}

const formatearFechaCompleta = (isoDate) => {
    if (!isoDate) return ''
    return date.formatDate(isoDate, 'DD MMMM YYYY, HH:mm:ss a')
}

const opcionesUsuarios = ref([])

// Opciones dinámicas para dispositivos y escáneres
const opcionesDispositivos = ref([])
const opcionesEscaners = ref([])

// 🗂️ MAPEO DE OFICINAS Y PERSONAS: Para convertir nombres a IDs
const mapaOficinas = ref(new Map()) // nombre -> id
const oficinasFull = ref([])
const dispositivosFull = ref([])

// 🧪 FUNCIÓN DE DEBUG TEMPORAL PARA DIAGNOSTICAR FILTROS
const debugearEstadoFiltros = (contexto = 'DEBUG') => {
  const estado = {
    contexto,
    timestamp: new Date().toISOString(),
    logs_totales: logs.value.length,
    logs_filtrados: logsFiltrados.value.length,
    filtros: {
      busqueda: busqueda.value,
      oficina: filtroOficina.value,
      tipoLog: filtroTipoLog.value,
      proceso: filtroProceso.value,
      dispositivo: filtroDispositivo.value,
    },
    opciones_disponibles: {
      oficinas: opcionesOficinas.value.length,
      usuarios: opcionesUsuarios.value.length,
      tiposLog: opcionesEstatus.value.length,
      procesos: opcionesOperacion.value.length,
      dispositivos: opcionesDispositivos.value.length,
      escaners: opcionesEscaners.value.length,
    },
    datos_origen: {
      datosDesdeGrafica: datosDesdeGrafica.value,
      filtroActual: filtroActual.value,
    },
  }

  console.log(`🔍 [${contexto}] ESTADO COMPLETO DE FILTROS:`, estado)
  return estado
}

// Computed para logs filtrados - CORREGIDO Y DEBUGGEADO
// --- COMPUTED: FILTRADO ---
const logsFiltrados = computed(() => {
  return logs.value.filter(log => {
    // 1. Busqueda Texto (Nombre, Pasaporte, ID)
    if (busqueda.value) {
      const term = busqueda.value.toLowerCase()
      const match =
        log.passport?.fullName?.toLowerCase().includes(term) ||
        log.passport?.passportNumber?.toLowerCase().includes(term) ||
        log.passport?.personId?.toLowerCase().includes(term) ||
        log.office?.officeName?.toLowerCase().includes(term)
      if (!match) return false
    }

    // 2. Filtros Específicos
    if (filtroTipoLog.value && log.status !== filtroTipoLog.value) return false
    if (filtroProceso.value && log.operationType !== filtroProceso.value) return false
    if (filtroDispositivo.value && log.channel !== filtroDispositivo.value) return false
    if (filtroOficina.value && log.office?.officeName !== filtroOficina.value) return false

    return true
  })
})

// Computed para filtros activos
const filtrosActivos = computed(() => {
  const filtros = []

  if (filtroOficina.value) {
    const oficina = opcionesOficinas.value.find((o) => o.value === filtroOficina.value)
    filtros.push({
      key: 'oficina',
      label: `Oficina: ${oficina?.label || filtroOficina.value}`,
      color: 'orange',
      icon: 'business',
    })
  }

  if (filtroTipoLog.value) {
    filtros.push({
      key: 'proceso',
      label: `Proceso: ${filtroTipoLog.value}`,
      color: 'orange',
      icon: 'settings',
    })
  }

  if (filtroProceso.value) {
    filtros.push({
      key: 'proceso',
      label: `Proceso: ${filtroProceso.value}`,
      color: 'orange',
      icon: 'settings',
    })
  }

  if (filtroDispositivo.value) {
    filtros.push({
      key: 'dispositivo',
      label: `Dispositivo: ${filtroDispositivo.value}`,
      color: 'teal',
      icon: 'devices',
    })
  }

  return filtros
})

// Computed para el nuevo botón de filtros mejorado
const hayFiltrosActivos = computed(() => {
  return filtrosActivos.value.length > 0
})

const contadorFiltrosActivos = computed(() => {
  return filtrosActivos.value.length
})

// Computed para paginación
const totalPaginas = computed(() => {
  return Math.ceil(logsFiltrados.value.length / registrosPorPagina.value)
})

// Función para obtener el icono según el tipo de log
const getIconoTipo = (estatus) => {
  // Normalizamos a minúsculas y quitamos espacios extra si los hubiera
  const tipoLower = (estatus || '').toLowerCase().trim()

  switch (tipoLower) {
    // ✅ Casos de Éxito
    case 'emitido':
    case 'success':
      return 'check_circle'

    // ❌ Casos de Error o Rechazo
    case 'rechazado':
    case 'error':
      return 'cancel' // O 'error'

    // ⏳ Casos de Proceso
    case 'entramite':
    case 'en tramite':
    case 'info':
      return 'pending_actions' // Más representativo que 'info' para trámites

    // 🚫 Casos de Cancelación
    case 'cancelado':
    case 'warning':
      return 'block' // O 'remove_circle'

    // ⚪ Default
    default:
      return 'help_outline' // O 'circle'
  }
}

// Funciones de paginación
const cambiarPagina = (nuevaPagina) => {
  paginaActual.value = nuevaPagina
}

// Watch para resetear la página cuando cambien los filtros
watch(
  [
    busqueda,
    filtroOficina,
    filtroTipoLog,
    filtroProceso,
    filtroDispositivo,
  ],
  () => {
    paginaActual.value = 1
  },
)

// Watch para mostrar loader cuando hay muchos logs y se aplican filtros
// También maneja el debounce para filtros API desde sidebar
let timeoutFiltros = null
watch(
  [
    busqueda,
    filtroOficina,
    filtroTipoLog,
    filtroProceso,
    filtroDispositivo,
  ],
  () => {
    // 🔄 Si el origen es sidebar, usar debounce para API
    if (origenConsola.value === 'sidebar') {
      console.log('🔄 [SIDEBAR] Filtro cambiado - Aplicando debounce para API')

      // Limpiar timeout anterior
      if (filtroTimeout.value) {
        clearTimeout(filtroTimeout.value)
      }

      // Aplicar debounce de 500ms para filtros API
      filtroTimeout.value = setTimeout(() => {
        if (mostrarConsola.value && !loading.value) {
          console.log('🚀 [SIDEBAR] Ejecutando filtrado con API después de debounce')
          cargarLogsConFiltrosAPI()
        }
      }, 500)
    }
    // 🎯 Si el origen es gráficas, usar filtrado cliente como antes
    else if (logs.value.length > 500) {
      console.log('📊 [GRAFICAS] Aplicando filtrado cliente')
      loadingFiltros.value = true

      // Limpiar timeout anterior
      if (timeoutFiltros) {
        clearTimeout(timeoutFiltros)
      }

      // Ocultar loader después de un breve delay
      timeoutFiltros = setTimeout(() => {
        loadingFiltros.value = false
      }, 300)
    }
  },
  { immediate: false },
)

// Watch para loader de paginación
watch(paginaActual, () => {
  if (logsFiltrados.value.length > 100) {
    loadingPaginacion.value = true
    setTimeout(() => {
      loadingPaginacion.value = false
    }, 200)
  }
})

// Funciones principales mejoradas
const abrirConsola = async (logsData = null, filtroTexto = '', filtrosGrafica = null) => {
  mostrarConsola.value = true

  // 🏢 Cargar oficinas del catálogo para el mapeo ID-nombre
  await cargarCatalogoFiltros()

  setTimeout(() => {
    filtrosToggle.value = true
  }, 1000)

  origenConsola.value = 'graficas' // Marcar origen desde gráficas

  if (logsData && logsData.length > 0) {
    // 🔧 NORMALIZAR DATOS: Detectar si vienen de gráficas y convertir campos
    const datosNormalizados = normalizarDatosLogs(logsData)

    logs.value = datosNormalizados
    filtroActual.value = filtroTexto
    datosDesdeGrafica.value = true

    // 🎯 APLICAR FILTROS DESDE GRÁFICAS
    if (filtrosGrafica) {
      console.log('🎯 Aplicando filtros desde gráficas:', filtrosGrafica)
      aplicarFiltrosDesdeGraficas(filtrosGrafica)
    }

    console.log(
      '📊 Consola abierta desde gráfica con',
      datosNormalizados.length,
      'logs normalizados',
    )
  } else {
    datosDesdeGrafica.value = false
    console.log('🔄 Consola abierta - cargando datos desde API')
    cargarLogsDesdeAPI(false)
  }
}

// 🔧 NUEVA FUNCIÓN: Normalizar datos de gráficas SIN GENERAR DATOS FAKE
const normalizarDatosLogs = (logsOriginales) => {
  console.log(
    '🔄 NORMALIZANDO DATOS DE GRÁFICAS (SOLO DATOS REALES):',
    logsOriginales.length,
    'registros',
  )

  // 📊 DEBUG: Mostrar estructura de los primeros 3 logs para análisis
  console.log('📊 ANÁLISIS DE ESTRUCTURA DE DATOS DESDE GRÁFICAS:')
  logsOriginales.slice(0, 3).forEach((log, index) => {
    console.log(`📋 Log ${index + 1} completo:`, JSON.stringify(log, null, 2))
    console.log(`🔍 Campos de dispositivo en Log ${index + 1}:`, {
      device: log.device,
      Dispositivo: log.Dispositivo,
      scanDevice: log.scanDevice,
      escaner: log.escaner,
      Escaner: log.Escaner,
      TrackingCode: log.TrackingCode,
    })
  })

  return logsOriginales.map((log, index) => {
    // Si ya tiene la estructura moderna de API, devolverlo tal como está
    if (log.device || log.scanDevice || (log.date && log.date.includes('T'))) {
      if (index < 3)
        console.log(`✅ Log ${index + 1} ya tiene estructura moderna:`, {
          device: log.device,
          scanDevice: log.scanDevice,
          date: log.date,
        })
      return log
    }

    // Es de gráficas, normalizar la estructura
    const logNormalizado = { ...log }

    // 🔧 NORMALIZAR DISPOSITIVO: SOLO si existe un valor real
    if (!logNormalizado.device) {
      if (log.Dispositivo) {
        if (
          typeof log.Dispositivo === 'object' &&
          log.Dispositivo.Nombre &&
          log.Dispositivo.Nombre !== 'No especificado'
        ) {
          logNormalizado.device = log.Dispositivo.Nombre
        } else if (
          typeof log.Dispositivo === 'string' &&
          log.Dispositivo !== 'No especificado' &&
          log.Dispositivo.trim() !== ''
        ) {
          logNormalizado.device = log.Dispositivo
        }
      }
      // SOLO usar Device o TrackingCode si son valores reales
      if (
        !logNormalizado.device &&
        log.device &&
        log.device !== 'No especificado' &&
        log.device.trim() !== ''
      ) {
        logNormalizado.device = log.device
      }
      if (!logNormalizado.device && log.TrackingCode && log.TrackingCode.trim() !== '') {
        logNormalizado.device = log.TrackingCode
      }
    }

    // 🔧 NORMALIZAR SCANNER: SOLO si existe un valor real - NO GENERAR FAKE
    if (!logNormalizado.scanDevice) {
      if (log.scanDevice && log.scanDevice.trim() !== '') {
        logNormalizado.scanDevice = log.scanDevice
      } else if (log.escaner && log.escaner.trim() !== '') {
        logNormalizado.scanDevice = log.escaner
      } else if (log.Escaner && log.Escaner.trim() !== '') {
        logNormalizado.scanDevice = log.Escaner
      }
      // NO GENERAR DATOS FAKE - dejar como undefined si no existen
    }

    // 🔧 NORMALIZAR OTROS CAMPOS
    logNormalizado.message = logNormalizado.message || log.Message || log.Mensaje
    logNormalizado.process = logNormalizado.process || log.process || log.Proceso
    logNormalizado.type = logNormalizado.type || log.type || log.Tipo

    // 🔧 NORMALIZAR FECHA: Mantener ambas para compatibilidad
    if (log.Date && !logNormalizado.date) {
      logNormalizado.date = log.Date
    }

    if (index < 3) {
      console.log(`🔄 Log ${index + 1} normalizado:`, {
        original: {
          Dispositivo: log.scanDevice,
          Device: log.scanDevice,
          Date: log.Date,
          Message: log.Message,
        },
        normalizado: {
          dispositivo: log.scanDevice,
          device: logNormalizado.scanDevice,
          scanDevice: logNormalizado.scanDevice,
          date: logNormalizado.date,
          message: logNormalizado.message,
        },
      })
    }

    return logNormalizado
  })
}

const aplicarFiltrosDesdeGraficas = (filtrosGrafica) => {
  console.log('🎯 Aplicando filtros desde gráficas:', filtrosGrafica)

  // Resetear filtros primero
  filtroOficina.value = null
  filtroTipoLog.value = null
  filtroProceso.value = null
  filtroDispositivo.value = null
  busqueda.value = ''

  if (filtrosGrafica.oficina) {
    filtroOficina.value = filtrosGrafica.oficina
  }

  // 🎯 FILTROS ESPECÍFICOS MEJORADOS
  if (filtrosGrafica.tipoLog) {
    // Mapear tipos específicos a los valores exactos del select
    const tipoMap = {
      ERROR: 'ERROR', // Errores de cualquier proceso
      SUCCESS: 'SUCCESS', // Éxitos (principalmente login)
      EXPORT: 'EXPORT', // Exportaciones
      START: 'START', // Inicio de escaneo
      END: 'END', // Fin exitoso de escaneo
      FIN: 'FIN', // Fin con error de escaneo
      INFO: 'INFO',
      WARNING: 'WARNING',
    }
    filtroTipoLog.value = tipoMap[filtrosGrafica.tipoLog] || filtrosGrafica.tipoLog
    console.log(`🎯 Filtro tipo aplicado: ${filtrosGrafica.tipoLog} → ${filtroTipoLog.value}`)
  }

  if (filtrosGrafica.proceso) {
    // Mapear procesos específicos a los valores exactos del select
    const procesoMap = {
      LOGIN: 'LOGIN', // Proceso de autenticación
      REGISTER: 'REGISTER', // Proceso de registro
      INE: 'INE', // Proceso de escaneo INE
      PASSPORT: 'PASSPORT', // Proceso de escaneo PASAPORTE
      SESSION: 'SESSION', // Sesiones
    }
    filtroProceso.value = procesoMap[filtrosGrafica.proceso] || filtrosGrafica.proceso
    console.log(`🎯 Filtro proceso aplicado: ${filtrosGrafica.proceso} → ${filtroProceso.value}`)
  }

  if (filtrosGrafica.dispositivo) {
    filtroDispositivo.value = filtrosGrafica.dispositivo
  }

  console.log('✅ Filtros aplicados desde gráficas:', {
    filtroOficina: filtroOficina.value,
    filtroTipoLog: filtroTipoLog.value,
    filtroProceso: filtroProceso.value,
    filtroDispositivo: filtroDispositivo.value,
  })
}

//  [NUEVA FUNCIÓN] Cargar logs con filtros desde API (para sidebar)
const cargarLogsConFiltrosAPI = async () => {
  console.log('🚀 [SIDEBAR] CARGANDO LOGS CON FILTROS DESDE API')

  loading.value = true

  try {
    // 🔧 Construir parámetros de la petición
    const params = new URLSearchParams()

    // 🏢 Oficina (enviar ID)
    if (filtroOficina.value) {
      const oficinaSeleccionada = oficinasFull.value.find((o) => o.label === filtroOficina.value)
      if (oficinaSeleccionada && oficinaSeleccionada.id) {
        params.append('oficinaId', oficinaSeleccionada.id)
      }
    }

    // ⚙️ Proceso (string directo)
    if (filtroProceso.value) {
      params.append('process', filtroProceso.value)
    }

    // 📱 Dispositivo (string directo)
    if (filtroDispositivo.value) {
      params.append('device', filtroDispositivo.value)
    }

    // 🔍 Búsqueda de texto (si existe)
    if (busqueda.value && busqueda.value.trim() !== '') {
      params.append('search', busqueda.value.trim())
    }

    console.log('📋 [SIDEBAR] Parámetros construidos:', Object.fromEntries(params))

    // 🌐 Hacer petición a la API
    // const url = `${API_BASE_URL}/logs#?${params.toString()}`
    // console.log('🔗 [SIDEBAR] URL de petición:', url)

    // const response = await axios.get(url)
    const response = []
    console.log('📦 [SIDEBAR] Respuesta recibida:', response.data?.length || 0, 'logs')

    // 🔄 Procesar respuesta
    if (response.data && Array.isArray(response.data)) {
      logs.value = response.data

      // 📝 Actualizar estado
      // filtroActual.value = `Filtros aplicados (${logs.value.length} resultados)`

      console.log('✅ [SIDEBAR] Logs cargados exitosamente:', logs.value.length)

      // 🔔 Notificación de éxito
      $q.notify({
        type: 'positive',
        message: `Se encontraron ${logs.value.length} logs con los filtros aplicados`,
        position: 'top-right',
        timeout: 2000,
      })
    } else {
      console.warn('⚠️ [SIDEBAR] Respuesta inesperada de la API:', response.data)
      logs.value = []

      $q.notify({
        type: 'warning',
        message: 'No se encontraron logs con los filtros aplicados',
        position: 'top-right',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('❌ [SIDEBAR] Error al cargar logs con filtros:', error)

    $q.notify({
      type: 'negative',
      message: 'Error al aplicar filtros. Intenta de nuevo.',
      position: 'top-right',
      timeout: 4000,
    })

    // En caso de error, mantener los logs actuales
  } finally {
    loading.value = false
  }
}

const cerrarConsola = () => {
  mostrarConsola.value = false
  busqueda.value = ''
  filtroActual.value = ''
  datosDesdeGrafica.value = false
  // Limpiar filtros al cerrar
  limpiarTodosFiltros()
}

// Función robusta para cargar logs de Pasaportes desde API
const cargarLogsDesdeAPI = async () => {
  loading.value = true
  try {
    console.log('🌐 Iniciando carga de eventos de pasaportes...')

    // 1. Definición de Fechas (Por defecto mes actual si no hay filtro)
    let fechaInicio, fechaFin

    // if (rangoFechas.value) {
    //   if (typeof rangoFechas.value === 'string') {
    //     fechaInicio = fechaFin = rangoFechas.value
    //   } else {
    //     fechaInicio = rangoFechas.value.from
    //     fechaFin = rangoFechas.value.to
    //   }
    // } else {
    //   // Si no hay fecha, últimos 30 días
    //   const hoy = new Date()
    //   const hace30dias = new Date()
    //   hace30dias.setDate(hoy.getDate() - 30)

    //   fechaInicio = hace30dias.toISOString().split('T')[0]
    //   fechaFin = hoy.toISOString().split('T')[0]
    // }

    // 2. Construcción de Parámetros URL
    // Mapeamos las variables reactivas del frontend a los params del Backend
    const params = new URLSearchParams()

    // --- Filtro: Estatus (filtroTipoLog) ---
    // Mapea a 'status' o 'dbStatus' según tu backend
    if (filtroTipoLog.value) {
      params.append('status', filtroTipoLog.value)
    }

    // --- Filtro: Operación/Proceso (filtroProceso) ---
    // Mapea a 'operationType' (RENOVACION, EMISION, etc.)
    if (filtroProceso.value) {
      params.append('operationType', filtroProceso.value)
    }

    // --- Filtro: Canal/Dispositivo (filtroDispositivo) ---
    // Mapea a 'channel' (WEB, KIOSKO, OFICINA)
    if (filtroDispositivo.value) {
      params.append('channel', filtroDispositivo.value)
    }

    // --- Filtro: Oficina (filtroOficina) ---
    // Mapea a 'officeId'. Si el value es el nombre, buscamos el ID.
    if (filtroOficina.value) {
      // Asumimos que el select devuelve el nombre o el objeto
      const nombreOficina = typeof filtroOficina.value === 'object'
        ? filtroOficina.value.label
        : filtroOficina.value

      // Intentamos obtener ID si tenemos un mapa, sino mandamos el valor directo
      const oficinaId = obtenerIdOficina(nombreOficina) || nombreOficina
      params.append('officeId', oficinaId)
    }

    // --- Búsqueda General ---
    if (busqueda.value) {
      params.append('search', busqueda.value)
    }

    console.log('📡 Params enviados:', params.toString())

    // 3. Llamada al Servicio
    // Asumimos que ChartDataService tiene un método para esto o usamos getAll genérico
    const response = await ChartDataService.getAll(params)

    // 4. Procesamiento de Respuesta
    if (response.code === 'ok' && response.data && Array.isArray(response.data.items)) {
      logs.value = response.data.items

      // Actualizamos texto informativo del filtro
      filtroActual.value = `Mostrando ${logs.value.length} eventos del ${fechaInicio} al ${fechaFin}`

      console.log(`✅ ${logs.value.length} logs cargados correctamente.`)

      // Debug: Verificación rápida de datos críticos
      if (logs.value.length > 0) {
        const muestra = logs.value[0]
        console.log('🔍 Estructura recibida (ejemplo):', {
          id: muestra.id,
          op: muestra.operationType,
          status: muestra.status,
          pasaporte: muestra.passport?.passportNumber
        })
      }

      // Notificación si no hay resultados
      if (logs.value.length === 0) {
        $q.notify({
          type: 'warning',
          message: 'No se encontraron registros con los filtros seleccionados.',
          position: 'top'
        })
      }

    } else {
      throw new Error(response.message || 'Respuesta inválida del servidor')
    }

  } catch (error) {
    console.error('❌ Error cargando logs:', error)
    logs.value = []
    filtroActual.value = 'Error de conexión'

    $q.notify({
      type: 'negative',
      message: 'Error al obtener los eventos de pasaportes',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Función global de debug para verificar estado
window.debugConsola = () => {
  console.log('🔍 ESTADO DE LA CONSOLA:')
  console.log('├── Logs cargados:', logs.value.length)
  console.log('├── Filtro actual:', filtroActual.value)
  console.log('├── Filtros aplicados:', {
    tipo: filtroTipoLog.value,
    oficina: filtroOficina.value
  })
  console.log('├── Loading:', loading.value)
  console.log('├── Consola visible:', mostrarConsola.value)
  console.log('└── Último error de API verificado')

  // Probar conexión a API
  cargarLogsDesdeAPI(false)
}

// Función de debug para probar la consola directa
window.debugConsolaDirecta = () => {
  console.log('🚀 PROBANDO CONSOLA DIRECTA desde debug')
  abrirConsolaDirecta()
}

// 🏢 CARGAR OFICINAS DEL CATÁLOGO
const cargarCatalogoFiltros = async () => {
  try {
    console.log('🏢 Cargando oficinas del catálogo...')

    const catalogo = await CatalogService.fetchCatalogs();

    catalogo.oficinas ? opcionesOficinas.value = catalogo.oficinas : opcionesOficinas.value = ['Sin oficinas disponibles']
    catalogo.dispositivos ? opcionesCanales.value = catalogo.dispositivos : opcionesCanales.value
    catalogo.estatus ? opcionesEstatus.value = catalogo.estatus : opcionesEstatus.value
    catalogo.tiposProcesos ? opcionesOperacion.value = catalogo.tiposProcesos : opcionesOperacion.value

    // Actualizar opciones para los selectores
    oficinasFull.value = catalogo.oficinas

    return catalogo.oficinas > 0
  } catch (error) {
    console.error('❌ Error cargando oficinas del catálogo:', error)
    return false
  }
}

//� OBTENER ID DE OFICINA POR NOMBRE
const obtenerIdOficina = (nombreOficina) => {
  if (!nombreOficina) return null

  const id = mapaOficinas.value.get(nombreOficina)
  console.log(`🏢 Convertir "${nombreOficina}" → ID: ${id}`)
  return id
}

const filtrarOficinas = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesOficinas.value = oficinasFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesOficinas.value = oficinasFull.value.filter(
        (oficina) => String(oficina.label).toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const filtrarDispositivos = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesDispositivos.value = dispositivosFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesDispositivos.value = dispositivosFull.value.filter(
        (dispositivo) => dispositivo.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const limpiarFiltro = (key) => {
  switch (key) {
    case 'oficina':
      filtroOficina.value = null
      break
    case 'tipo':
      filtroTipoLog.value = null
      break
    case 'proceso':
      filtroProceso.value = null
      break
    case 'dispositivo':
      filtroDispositivo.value = null
      break
  }

  // Si no hay datos de gráfica, recargar desde API con nuevos filtros
  if (!datosDesdeGrafica.value) {
    cargarLogsDesdeAPI(false)
  }
}

const limpiarTodosFiltros = () => {
    busqueda.value = ''
    filtroTipoLog.value = null
    filtroProceso.value = null
    filtroDispositivo.value = null
    filtroOficina.value = null
}

const cargarLogs = () => {
  if (datosDesdeGrafica.value) {
    console.log('📊 Usando datos de gráfica existentes')
    return
  }
  cargarLogsDesdeAPI(false)
}

const getColorStatus = (status) => {
    const map = {
        'EMITIDO': 'green',
        'RECHAZADO': 'red',
        'ENTRAMITE': 'blue',
        'CANCELADO': 'grey'
    }
    return map[status] || 'grey'
}

const getClassByStatus = (status) => {
    const map = {
        'EMITIDO': 'log-card-success',
        'RECHAZADO': 'log-card-error',
        'ENTRAMITE': 'log-card-info',
        'CANCELADO': 'log-card-warning'
    }
    return map[status] || ''
}

// Función de exportación mejorada con múltiples formatos
const exportarLogs = (formato = 'json') => {
  if (!logsFiltrados.value.length) return

  try {
    const datosExport = logsFiltrados.value.map((log) => ({
      Tipo: log.type || log.Tipo || log.EventType || 'INFO',
      Proceso: log.process || log.Proceso || '',
      Mensaje: log.Message || log.Mensaje || '',
      Dispositivo: log.device || log.Dispositivo || '',
    }))

    const timestamp = new Date().toISOString().split('T')[0]
    let contenido, mimeType, extension

    switch (formato) {
      case 'excel': {
        // Para Excel necesitaríamos una librería como xlsx, por ahora CSV
        const csvHeaders = Object.keys(datosExport[0]).join(',')
        const csvRows = datosExport.map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value,
            )
            .join(','),
        )
        contenido = csvHeaders + '\n' + csvRows.join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
        break
      }

      case 'txt': {
        contenido = datosExport
          .map(
            (log) =>
              `[${log.Fecha}] ${log.Tipo} - ${log.Proceso} - ${log.Usuario} (${log.Oficina}) - ${
                log.Dispositivo
              }\n${log.Mensaje}\n${'='.repeat(80)}\n`,
          )
          .join('\n')
        mimeType = 'text/plain'
        extension = 'txt'
        break
      }

      case 'json':
      default: {
        contenido = JSON.stringify(datosExport, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break
      }
    }

    const blob = new Blob([contenido], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `logs_${timestamp}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: `${logsFiltrados.value.length} logs exportados como ${formato.toUpperCase()}`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar los logs',
      position: 'top',
    })
  }
}

// Función específica para abrir desde sidebar con datos frescos de API
const abrirConsolaDirecta = async () => {
  console.log('🚀 ABRIENDO CONSOLA DIRECTA DESDE SIDEBAR - versión con carga API')

  setTimeout(() => {
    filtrosToggle.value = true
  }, 1000)

  // 🔧 Establecer origen como sidebar para usar filtrado API
  origenConsola.value = 'sidebar'

  mostrarConsola.value = true
  filtroActual.value = 'Consola directa - Datos cargados desde API'
  datosDesdeGrafica.value = false

  // 🏢 Cargar oficinas del catálogo para el mapeo ID-nombre
  await cargarCatalogoFiltros()

  // 🧹 LIMPIAR TODOS LOS FILTROS INCLUYENDO LOS NUEVOS
  console.log('🧹 [SIDEBAR] LIMPIANDO TODOS LOS FILTROS PARA DEBUGGING')
  filtroOficina.value = null
  filtroTipoLog.value = null
  filtroProceso.value = null
  filtroDispositivo.value = null
  busqueda.value = ''

  // 🔍 LOG DE ESTADO INICIAL DE FILTROS
  console.log('🧹 [SIDEBAR] Estado después de limpiar filtros:', {
    filtroProceso: filtroProceso.value,
    filtroDispositivo: filtroDispositivo.value,
    filtroOficina: filtroOficina.value,
    filtroTipoLog: filtroTipoLog.value,
  })

  // Cargar datos frescos desde API usando filtros con parámetros
  await cargarLogsConFiltrosAPI()

  // 🔍 DEBUG FINAL
  debugearEstadoFiltros('SIDEBAR - POST CARGA API')
}

// 👀 WATCHER: Recargar datos automáticamente cuando cambien las fechas
watch(
  (nuevasfechas, fechasAnteriores) => {
    // Solo ejecutar si la consola está abierta y hay fechas válidas
    if (mostrarConsola.value && nuevasfechas && !loading.value) {
      console.log('📅 CAMBIO DE FECHAS DETECTADO - Recargando datos automáticamente')
      console.log('├── Fechas anteriores:', fechasAnteriores)
      console.log('└── Fechas nuevas:', nuevasfechas)

      // Recargar datos con un pequeño delay para evitar múltiples llamadas
      setTimeout(() => {
        if (!loading.value) {
          // 🔄 Usar la función correcta según el origen
          if (origenConsola.value === 'sidebar') {
            console.log('📅 [SIDEBAR] Recargando con API por cambio de fechas')
            cargarLogsConFiltrosAPI()
          } else {
            console.log('📅 [GRAFICAS] Recargando con filtrado cliente por cambio de fechas')
            cargarLogsDesdeAPI(false)
          }
        }
      }, 300)
    }
  },
  { deep: true }, // Para detectar cambios en objetos anidados
)

const filtrarLogs = (e) => {
  console.log(e.tarjet.value)
}

// Exposición de funciones
defineExpose({
  abrirConsola,
  abrirConsolaDirecta,
  cerrarConsola,
  mostrarConsola,
  filtrarLogs,
})
</script>

<style lang="scss" scoped>
.console-modal-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.console-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.console-controls {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.console-body {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }

  &.log-error {
    border-left: 4px solid #f44336;
  }

  &.log-success {
    border-left: 4px solid #4caf50;
  }

  &.log-warning {
    border-left: 4px solid #ff9800;
  }

  &.log-info {
    border-left: 4px solid #2196f3;
  }

  &.log-login {
    border-left: 4px solid #2196f3;
  }

  &.log-registro {
    border-left: 4px solid #4caf50;
  }

  &.log-exportacion {
    border-left: 4px solid #9c27b0;
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-time {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
}

.log-content {
  .log-process {
    color: #81c784;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }

  .log-message {
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .log-details {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    display: flex;
    align-items: center;
  }

  .log-user-info {
    margin-top: 6px;
    padding: 8px;
    background: rgba(76, 175, 80, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(76, 175, 80, 0.3);

    .user-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .office-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(255, 152, 0, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(255, 152, 0, 0.3);

    .office-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-device-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(156, 39, 176, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(156, 39, 176, 0.3);

    .device-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .log-datetime-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(63, 81, 181, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(63, 81, 181, 0.3);

    .datetime-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-full-message {
    margin-top: 4px;
    padding: 8px;
    background: rgba(255, 193, 7, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(255, 193, 7, 0.3);

    .message-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;

      .message-text {
        margin-left: 20px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.4;
        font-family: 'Roboto Mono', monospace;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
        max-width: 100%;
        overflow-wrap: break-word;
      }
    }
  }

  .log-status-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(33, 150, 243, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(33, 150, 243, 0.3);

    .status-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-info-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.console-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.log-message-detail {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

// Estilos para información técnica en modal de detalle
.detail-tech-item {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;

  .tech-value {
    font-family: 'Courier New', monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
  }

  &.error-code-item {
    border-left: 3px solid #f44336;

    .error-code {
      color: #f44336;
      font-weight: 600;
    }
  }

  &.session-token-item {
    border-left: 3px solid #00bcd4;

    .session-token {
      color: #00bcd4;
      background: rgba(0, 188, 212, 0.1);
      border: 1px solid rgba(0, 188, 212, 0.3);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      word-break: break-all;
      line-height: 1.3;
    }
  }
}

// Estilos para el grid responsivo de cards - OPTIMIZADO
.responsive-logs-grid {
  display: grid;
  gap: 14px;
  padding: 14px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 100%;
  overflow-x: hidden;

  // Forzar redistribución consistente durante filtrado
  transition: opacity 0.2s ease-in-out;

  // Asegurar que las tarjetas mantengan posición durante filtrado
  grid-auto-flow: row;
  grid-auto-rows: min-content;

  // Optimización para prevenir saltos durante el filtrado
  &.loading-opacity {
    opacity: 0.7;
    pointer-events: none;
  }
} // Estilos para las cards de logs - OPTIMIZADO PARA ALTURA COMPACTA

.width-responsive {
  width: 323px;

  @media (max-width: 600px) {
    width: 100%;
  }
}

.log-card {
  background: #2b2b3d; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  padding: 12px;
  margin: 6px 0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  min-height: auto;
  height: auto;
  display: flex;
  flex-direction: column;

  // Restricciones de ancho para prevenir deformación
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  word-break: break-word;
  overflow: hidden;

  // Asegurar posicionamiento estable durante filtrado
  will-change: transform;
  contain: layout style;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  // Header optimizado
  .log-card-header {
    padding: 8px 0 6px 0;

    .timestamp-section {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      color: #b0b0b0;
      margin-bottom: 2px;
    }

    .log-id-chip {
      font-size: 0.7rem;
    }
  }

  // Secciones enhanced - COMPACTAS
  .enhanced-section {
    background: rgba(46, 46, 62, 0.3);
    border-radius: 6px;
    padding: 8px;
    margin: 4px 0;
    border-left: 3px solid #007bff;

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 3px;

      .section-title {
        font-size: 0.8rem;
        font-weight: 600;
      }
    }

    .section-content {
      .detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 3px;
        font-size: 0.75rem;

        .detail-label {
          color: #b0b0b0;
          font-weight: 500;
          min-width: 70px;
          margin-right: 6px;
        }

        .detail-value {
          color: #e0e0e0;
          font-family: 'Courier New', monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 1px 4px;
          border-radius: 3px;
          flex: 1;
          font-size: 0.7rem;
        }

        .q-icon {
          margin-right: 4px;
        }
      }
    }
  }

  // Colores específicos por tipo - DISEÑO ORIGINAL
  &.log-card-success { border-left: 4px solid #4caf50; }
  &.log-card-error { border-left: 4px solid #f44336; }
  &.log-card-warning { border-left: 4px solid #9e9e9e; }
  &.log-card-info { border-left: 4px solid #2196f3; }
}

.log-card-header {
  padding: 8px 12px 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.log-card-content {
  padding: 10px 0;
  line-height: 1.3;
  flex: 1;

  .log-user-section,
  .log-office-section,
  .log-device-section,
  .log-error-section,
  .log-session-section,
  .log-message-section {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    margin-bottom: 4px;

    .section-title {
      font-size: 0.8rem;
      font-weight: 600;
    }
  }

  .section-content {
    padding: 8px;
    background: rgba(46, 46, 62, 0.3);
    border-radius: 6px;
    margin: 4px 0;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
    font-size: 0.75rem;

    .detail-label {
      color: #b0b0b0;
      font-weight: 500;
      min-width: 70px;
    }

    .detail-value {
      color: #ffffff;
      font-weight: 500;
      text-align: right;
      max-width: 65%;
      word-break: break-word;
      overflow-wrap: break-word;
      font-size: 0.7rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .device-info,
  .error-content,
  .session-content,
  .message-content {
    color: #e0e0e0;
    line-height: 1.3;
    font-size: 0.75rem;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .error-content {
    background: rgba(244, 67, 54, 0.1);
    border-left: 2px solid rgba(244, 67, 54, 0.3);
    padding: 4px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    color: #f44336;
    font-size: 0.7rem;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    white-space: pre-wrap;
  }

  .session-content {
    background: rgba(0, 188, 212, 0.1);
    border-left: 2px solid rgba(0, 188, 212, 0.3);
    padding: 4px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    color: #00bcd4;
    font-size: 0.7rem;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    white-space: pre-wrap;
  }

  .message-content {
    max-height: 45px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 0.7rem;
  }
}

.log-card-footer {
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

// Estilos para la paginación
.pagination-section {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);

  .pagination-info {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      margin-bottom: 0;
    }
  }

  .q-pagination {
    color: white;

    .q-btn {
      color: rgba(255, 255, 255, 0.8);

      &.q-btn--active {
        background: rgba(25, 118, 210, 0.8);
        color: white;
      }

      &:hover {
        background: rgba(25, 118, 210, 0.3);
      }
    }
  }
}

// Estilos para loaders elegantes
.filter-loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
}

.filter-loader-content {
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.3);
  border-radius: 12px;
  padding: 24px 32px;
  text-align: center;
  backdrop-filter: blur(10px);
  animation: pulse-glow 2s ease-in-out infinite;
}

.pagination-loader {
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.loading-opacity {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(25, 118, 210, 0.5);
  }
}

// Optimizaciones responsive para filtros compactos
.console-controls {
  // Reducir padding en dispositivos medianos
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
}

// Mejorar responsive para tablets
@media (min-width: 768px) and (max-width: 1024px) {
  .responsive-logs-grid {
    // En tablets, usar minmax con límites más conservadores
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: 12px;
    padding: 12px;
  }

  .log-card {
    min-width: 0;
    max-width: 100%;
  }

  .console-controls {
    padding: 12px 16px;

    .row {
      margin: -6px;

      > div {
        padding: 6px;
      }
    }
  }

  .log-card {
    min-height: 260px;
  }
}

// Responsive adjustments
// Responsive adjustments para móviles
@media (max-width: 768px) {
  .responsive-logs-grid {
    grid-template-columns: 1fr;
    padding: 8px;
    gap: 12px;
  }

  .log-card {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    word-break: break-word;
    overflow: hidden;
  }

  .log-card-content {
    padding: 12px;
  }

  .pagination-section {
    .row {
      flex-direction: column;
      gap: 12px;

      .col-12 {
        text-align: center;
      }
    }
  }
}

// Estilos para sección de debugging
.debug-section {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.debug-fields {
  max-height: 400px;
  overflow-y: auto;

  .debug-field-item {
    display: flex;
    margin-bottom: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.03);

    &.highlight-error {
      background: rgba(244, 67, 54, 0.1);
      border-left: 3px solid #f44336;
    }

    &.highlight-token {
      background: rgba(0, 188, 212, 0.1);
      border-left: 3px solid #00bcd4;
    }

    .field-key {
      font-weight: 600;
      color: #90caf9;
      min-width: 120px;
      font-size: 12px;
    }

    .field-value {
      flex: 1;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Courier New', monospace;
      font-size: 11px;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
}

// Estilos para el botón de filtros moderno
.filter-expansion-modern {
  .q-item {
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(42, 82, 152, 0.3);
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

// Efectos de animación para el botón de filtros
@keyframes filter-glow {
  0% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.3);
  }
}

.filter-expansion-modern .q-item:hover {
  animation: filter-glow 2s infinite;
}
</style>
