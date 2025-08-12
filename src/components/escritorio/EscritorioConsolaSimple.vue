<template>
  <!-- Modal de Consola Mejorada -->
  <q-dialog
    v-model="mostrarConsola"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="console-modal-card bg-dark text-white">
      <!-- Header -->
      <q-card-section class="console-header bg-grey-9">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5">
              <q-icon name="terminal" class="q-mr-sm" color="primary" />
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
            <q-btn icon="close" flat round color="white" @click="cerrarConsola" />
          </div>
        </div>
      </q-card-section>

      <!-- Controles -->
      <q-card-section class="console-controls bg-grey-8">
        <div class="row q-col-gutter-md">
          <!-- Primera fila: Búsqueda -->
          <div class="col-12 col-md-8">
            <q-input
              v-model="busqueda"
              label="Buscar en logs..."
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
          <div class="col-12 col-md-4">
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
            <q-btn color="warning" icon="clear_all" label="Limpiar" @click="limpiarConsola" flat />
          </div>

          <!-- Segunda fila: Filtros avanzados -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroOficina"
              :options="opcionesOficinas"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Filtrar por Oficina"
              filled
              dark
              color="primary"
              clearable
              use-input
              @filter="filtrarOficinas"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="orange" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroUsuario"
              :options="opcionesUsuarios"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Filtrar por Usuario"
              filled
              dark
              color="primary"
              clearable
              use-input
              @filter="filtrarUsuarios"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="green" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroTipo"
              :options="opcionesTipos"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Filtrar por Tipo"
              filled
              dark
              color="primary"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="category" color="blue" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="textoRangoFechas"
              label="Filtrar por Rango de Fechas"
              filled
              dark
              color="primary"
              clearable
              readonly
            >
              <template v-slot:prepend>
                <q-icon name="date_range" color="purple" />
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

        <!-- Indicadores de filtros activos -->
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

      <!-- Contenido -->
      <q-card-section class="console-body">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-grid color="primary" size="80px" />
          <div class="q-mt-lg text-h6">Cargando logs...</div>
        </div>

        <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="inbox" size="120px" color="grey-6" />
          <div class="q-mt-lg text-h5 text-grey-4">No hay logs disponibles</div>
        </div>

        <div v-else class="logs-container">
          <div
            v-for="(log, index) in logsFiltrados"
            :key="index"
            :class="['log-item', `log-${(log.Type || 'info').toLowerCase()}`]"
            @click="mostrarDetalleLog(log)"
          >
            <div class="log-header">
              <!-- <div class="log-time">
                <q-icon name="access_time" size="16px" class="q-mr-xs" />
                {{ formatearFechaCompleta(log.date || log.Fecha || log.FechaCreacion) }}
              </div> -->
              <q-chip
                :color="getColorTipo(log.Type || log.Tipo || log.EventType)"
                text-color="white"
                size="sm"
                dense
              >
                {{ log.Type || log.Tipo || log.EventType || 'INFO' }}
              </q-chip>
            </div>

            <div class="log-content">
              <div class="log-process" v-if="log.Process || log.Proceso">
                <q-icon name="settings" size="16px" class="q-mr-xs text-blue-4" />
                <strong>{{ log.Process || log.Proceso }}</strong>
              </div>

              <!-- Información del usuario y oficina mejorada -->
              <div class="log-info-grid q-mt-sm">
                <!-- Usuario -->
                <div v-if="obtenerNombreUsuario(log)" class="log-user-info">
                  <div class="user-details">
                    <q-icon name="person" size="14px" class="q-mr-xs text-green-4" />
                    <strong>Usuario:</strong>
                    {{ obtenerNombreUsuario(log) }}
                  </div>
                </div>

                <!-- Oficina -->
                <div v-if="obtenerNombreOficina(log)" class="office-info q-mt-xs">
                  <div class="office-details">
                    <q-icon name="business" size="14px" class="q-mr-xs text-orange-4" />
                    <strong>Oficina:</strong> {{ obtenerNombreOficina(log) }}
                    <span v-if="obtenerDireccionOficina(log)" class="text-grey-5 q-ml-xs">
                      - {{ obtenerDireccionOficina(log) }}
                    </span>
                  </div>
                </div>

                <!-- Dispositivo y Escáner - Solo mostrar si hay datos reales -->
                <div
                  v-if="obtenerInfoDispositivo(log).hasDevice || obtenerInfoDispositivo(log).hasScanner"
                  class="log-device-info q-mt-xs"
                >
                  <div class="device-details">
                    <q-icon name="devices" size="14px" class="q-mr-xs text-purple-4" />
                    <span v-if="obtenerInfoDispositivo(log).hasDevice">
                      <strong>Dispositivo:</strong> {{ obtenerInfoDispositivo(log).device }}
                    </span>
                    <span v-if="obtenerInfoDispositivo(log).hasScanner" class="q-ml-sm">
                      <span v-if="obtenerInfoDispositivo(log).hasDevice"> | </span>
                      <q-icon name="qr_code_scanner" size="12px" class="q-mr-xs text-cyan-4" />
                      <strong>Escáner:</strong> {{ obtenerInfoDispositivo(log).scanner }}
                    </span>
                  </div>
                </div>

                <!-- Fecha completa y detallada -->
                <div class="log-datetime-info q-mt-xs">
                  <div class="datetime-details">
                    <q-icon name="schedule" size="14px" class="q-mr-xs text-indigo-4" />
                    <strong>Fecha:</strong>
                    {{
                      formatearFechaCompleta(log.date || log.Date || log.Fecha || log.FechaCreacion)
                    }}
                  </div>
                </div>

                <!-- Mensaje completo -->
                <div v-if="obtenerMensajeCompleto(log)" class="log-full-message q-mt-xs">
                  <div class="message-details">
                    <q-icon name="message" size="14px" class="q-mr-xs text-amber-4" />
                    <strong>Mensaje:</strong>
                    <span class="message-text">{{ obtenerMensajeCompleto(log) }}</span>
                  </div>
                </div>

                <!-- Información adicional si está disponible -->
                <div v-if="log.Estado || log.Status" class="log-status-info q-mt-xs">
                  <div class="status-details">
                    <q-icon name="info" size="14px" class="q-mr-xs text-blue-4" />
                    <strong>Estado:</strong> {{ log.Estado || log.Status }}
                  </div>
                </div>
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
              Mostrando {{ logsFiltrados.length }} de {{ logs.length }} logs
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

    <!-- Modal de detalle -->
    <q-dialog v-model="modalDetalle">
      <q-card style="min-width: 700px; max-width: 900px" class="bg-dark text-white">
        <q-card-section class="bg-grey-9">
          <div class="text-h6 flex items-center">
            <q-icon name="info" class="q-mr-sm" />
            Detalle del Log
          </div>
        </q-card-section>

        <q-card-section v-if="logSeleccionado" class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <!-- Información básica -->
            <div class="col-12 col-md-6">
              <q-list dark separator>
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="indigo" name="schedule" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Fecha y Hora Completa</q-item-label>
                    <q-item-label caption>{{
                      formatearFechaCompleta(
                        logSeleccionado.Date ||
                          logSeleccionado.Fecha ||
                          logSeleccionado.FechaCreacion
                      )
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon :color="getColorTipo(logSeleccionado.Type)" name="label" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Tipo</q-item-label>
                    <q-item-label caption>{{
                      logSeleccionado.Type ||
                      logSeleccionado.Tipo ||
                      logSeleccionado.EventType ||
                      'INFO'
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.Process || logSeleccionado.Proceso">
                  <q-item-section avatar>
                    <q-icon color="green" name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Proceso</q-item-label>
                    <q-item-label caption>{{
                      logSeleccionado.Process || logSeleccionado.Proceso
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <!-- Información del dispositivo y escáner -->
                <q-item v-if="obtenerInfoDispositivo(logSeleccionado).hasDevice">
                  <q-item-section avatar>
                    <q-icon color="purple" name="devices" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Dispositivo</q-item-label>
                    <q-item-label caption>{{
                      obtenerInfoDispositivo(logSeleccionado).device
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="obtenerInfoDispositivo(logSeleccionado).hasScanner">
                  <q-item-section avatar>
                    <q-icon color="cyan" name="qr_code_scanner" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Escáner</q-item-label>
                    <q-item-label caption>{{
                      obtenerInfoDispositivo(logSeleccionado).scanner
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Información del usuario y oficina -->
            <div class="col-12 col-md-6">
              <q-list dark separator>
                <q-item v-if="obtenerNombreUsuario(log)">
                  <q-item-section avatar>
                    <q-icon color="green" name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Usuario</q-item-label>
                    <q-item-label caption>{{ obtenerNombreUsuario(logSeleccionado) }}</q-item-label>
                    <q-item-label caption v-if="logSeleccionado.person?.curp" class="text-grey-5">
                      CURP: {{ logSeleccionado.person.curp }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="obtenerNombreOficina(logSeleccionado)">
                  <q-item-section avatar>
                    <q-icon color="orange" name="business" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Oficina</q-item-label>
                    <q-item-label caption>{{ obtenerNombreOficina(logSeleccionado) }}</q-item-label>
                    <q-item-label
                      caption
                      v-if="obtenerDireccionOficina(logSeleccionado)"
                      class="text-grey-5"
                    >
                      {{ obtenerDireccionOficina(logSeleccionado) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.device">
                  <q-item-section avatar>
                    <q-icon color="purple" name="computer" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Device</q-item-label>
                    <q-item-label caption>{{ logSeleccionado.device }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.scanDevice">
                  <q-item-section avatar>
                    <q-icon color="blue" name="scanner" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Scan Device</q-item-label>
                    <q-item-label caption>{{ logSeleccionado.scanDevice }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Mensaje completo -->
          <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm flex items-center">
              <q-icon name="message" class="q-mr-sm" color="amber" />
              Mensaje completo
            </div>
            <q-card dark class="bg-grey-8">
              <q-card-section>
                <pre class="log-message-detail">{{ obtenerMensajeCompleto(logSeleccionado) }}</pre>
              </q-card-section>
            </q-card>
          </div>

          <!-- Información técnica adicional si está disponible -->
          <div
            v-if="
              logSeleccionado.TrackingCode ||
              logSeleccionado.ID ||
              logSeleccionado.Estado ||
              logSeleccionado.Status
            "
            class="q-mt-lg"
          >
            <div class="text-subtitle2 q-mb-sm flex items-center">
              <q-icon name="info" class="q-mr-sm" color="blue" />
              Información técnica
            </div>
            <q-card dark class="bg-grey-8">
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div v-if="logSeleccionado.TrackingCode" class="col-6">
                    <strong>Tracking Code:</strong> {{ logSeleccionado.TrackingCode }}
                  </div>
                  <div v-if="logSeleccionado.ID" class="col-6">
                    <strong>ID:</strong> {{ logSeleccionado.ID }}
                  </div>
                  <div v-if="logSeleccionado.Estado || logSeleccionado.Status" class="col-6">
                    <strong>Estado:</strong> {{ logSeleccionado.Estado || logSeleccionado.Status }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-9">
          <q-btn flat label="Cerrar" color="primary" @click="modalDetalle = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { API_BASE_URL } from '../../services/apiConfig.js'
import { CatalogService } from '../../services/catalogService.js'

const $q = useQuasar()

// Estado
const mostrarConsola = ref(false)
const loading = ref(false)
const logs = ref([])
const busqueda = ref('')
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const filtroActual = ref('')
const datosDesdeGrafica = ref(false)

// Filtros avanzados
const filtroOficina = ref(null)
const filtroUsuario = ref(null)
const filtroTipo = ref(null)
const rangoFechas = ref(null)

// 📅 VALIDAR Y FORMATEAR FECHA A ISO (YYYY-MM-DD)
const validarYFormatearFecha = (fecha) => {
  if (!fecha) return null

  try {
    // Si ya está en formato ISO correcto, devolver tal como está
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fecha
    }

    // Si está en formato YYYY/MM/DD, convertir a YYYY-MM-DD
    if (typeof fecha === 'string' && fecha.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      return fecha.replace(/\//g, '-')
    }

    // Si es un objeto Date, convertir a formato ISO
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0]
    }

    // Intentar parsear como fecha y convertir
    const fechaObj = new Date(fecha)
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj.toISOString().split('T')[0]
    }

    console.warn(`⚠️ Formato de fecha no válido: ${fecha}`)
    return null
  } catch (error) {
    console.error(`❌ Error al formatear fecha ${fecha}:`, error)
    return null
  }
}

const opcionesOficinas = ref([])
const opcionesUsuarios = ref([])
const opcionesTipos = ref([
  { label: 'Todos', value: null },
  { label: 'Login', value: 'Login' },
  { label: 'Registro', value: 'Registro' },
  { label: 'Error', value: 'Error' },
  { label: 'Exportación', value: 'Exportacion' },
  { label: 'Sincronización', value: 'Sincronizacion' },
  { label: 'Operación', value: 'Operacion' },
  { label: 'Autenticación', value: 'Autenticacion' },
  { label: 'Validación', value: 'Validacion' },
  { label: 'Info', value: 'Info' },
  { label: 'Warning', value: 'Warning' },
  { label: 'Success', value: 'Success' },
])
// 🗂️ MAPEO DE OFICINAS Y PERSONAS: Para convertir nombres a IDs
const mapaOficinas = ref(new Map()) // nombre -> id
const mapaPersonas = ref(new Map()) // nombre -> id
const oficinasFull = ref([])
const usuariosFull = ref([])

// Computed para el texto del rango de fechas
const textoRangoFechas = computed(() => {
  if (!rangoFechas.value) return ''

  if (typeof rangoFechas.value === 'string') {
    return rangoFechas.value
  }

  if (rangoFechas.value.from && rangoFechas.value.to) {
    return `${rangoFechas.value.from} - ${rangoFechas.value.to}`
  }

  return rangoFechas.value.from || rangoFechas.value.to || ''
})

// Computed para logs filtrados - CORREGIDO
const logsFiltrados = computed(() => {
  let resultado = logs.value

  // ✅ VERIFICACIÓN SEGURA: Si no hay logs, devolver array vacío
  if (!resultado || resultado.length === 0) {
    return []
  }

  // ✅ VERIFICACIÓN DE FILTROS ACTIVOS (solo los que realmente filtran)
  const hayBusqueda = busqueda.value && busqueda.value.trim() !== ''
  const hayFiltroOficina = filtroOficina.value && filtroOficina.value.trim() !== ''
  const hayFiltroUsuario = filtroUsuario.value && filtroUsuario.value.trim() !== ''
  const hayFiltroTipo = filtroTipo.value && filtroTipo.value.trim() !== ''
  const hayFiltroFechas = rangoFechas.value && (rangoFechas.value.from || rangoFechas.value.to)

  // ✅ SOLUCIÓN: Si no hay ningún filtro aplicado, mostrar TODOS los logs
  if (
    !hayBusqueda &&
    !hayFiltroOficina &&
    !hayFiltroUsuario &&
    !hayFiltroTipo &&
    !hayFiltroFechas
  ) {
    return resultado // Mostrar todos sin limitación
  }

  // Filtro por búsqueda de texto mejorado
  if (busqueda.value) {
    const needle = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (log) =>
        (log.Message || log.Mensaje || '').toLowerCase().includes(needle) ||
        (log.Type || log.Tipo || log.EventType || '').toLowerCase().includes(needle) ||
        (log.Process || log.Proceso || '').toLowerCase().includes(needle) ||
        obtenerNombreOficina(log).toLowerCase().includes(needle) ||
        obtenerNombreUsuario(log).toLowerCase().includes(needle) ||
        (log.TrackingCode || log.Device || log.Dispositivo || '').toLowerCase().includes(needle)
    )
  }

  // Filtro por oficina mejorado
  if (filtroOficina.value) {
    resultado = resultado.filter((log) => {
      const oficina = obtenerNombreOficina(log)
      return oficina && oficina.toLowerCase().includes(filtroOficina.value.toLowerCase())
    })
  }

  // Filtro por usuario mejorado
  if (filtroUsuario.value) {
    resultado = resultado.filter((log) => {
      const usuario = obtenerNombreUsuario(log)
      return usuario && usuario.toLowerCase().includes(filtroUsuario.value.toLowerCase())
    })
  }

  // Filtro por tipo mejorado
  if (filtroTipo.value) {
    resultado = resultado.filter((log) => {
      const tipo = log.Type || log.Tipo || log.EventType || ''
      return tipo.toLowerCase() === filtroTipo.value.toLowerCase()
    })
  }

  // ✅ FILTRO POR FECHAS SIMPLIFICADO
  if (hayFiltroFechas) {
    resultado = resultado.filter((log) => {
      const fecha = log.Date || log.Fecha || log.FechaCreacion
      if (!fecha) return true // Incluir logs sin fecha para evitar perder datos

      try {
        const logDate = new Date(fecha).toISOString().split('T')[0]

        if (typeof rangoFechas.value === 'string') {
          return logDate === rangoFechas.value
        }

        if (rangoFechas.value.from && rangoFechas.value.to) {
          return logDate >= rangoFechas.value.from && logDate <= rangoFechas.value.to
        }

        if (rangoFechas.value.from) {
          return logDate >= rangoFechas.value.from
        }

        if (rangoFechas.value.to) {
          return logDate <= rangoFechas.value.to
        }

        return true
      } catch {
        return true // Incluir en caso de error
      }
    })
  }

  return resultado
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

  if (filtroUsuario.value) {
    const usuario = opcionesUsuarios.value.find((u) => u.value === filtroUsuario.value)
    filtros.push({
      key: 'usuario',
      label: `Usuario: ${usuario?.label || filtroUsuario.value}`,
      color: 'green',
      icon: 'person',
    })
  }

  if (filtroTipo.value) {
    const tipo = opcionesTipos.value.find((t) => t.value === filtroTipo.value)
    filtros.push({
      key: 'tipo',
      label: `Tipo: ${tipo?.label || filtroTipo.value}`,
      color: 'blue',
      icon: 'category',
    })
  }

  if (rangoFechas.value) {
    filtros.push({
      key: 'fecha',
      label: `Fechas: ${textoRangoFechas.value}`,
      color: 'purple',
      icon: 'date_range',
    })
  }

  return filtros
})

// Funciones auxiliares para obtener información de logs
const obtenerNombreOficina = (log) => {
  return (
    log.oficina?.nombre || // ← Campo real de la API /logs/filter
    log.oficina?.Nombre || // ← Respaldo con mayúscula
    log.oficina?.Descripcion || // ← Respaldo alternativo
    log.Oficina?.Nombre || // ← Respaldo estructura anterior
    log.Oficina?.Descripcion || // ← Respaldo estructura anterior
    log.Oficina  // ← Valor por defecto
  )
}

const obtenerDireccionOficina = (log) => {
  return (
    log.oficina?.direccion || // ← Campo real de la API /logs/filter
    log.oficina?.Direccion || // ← Respaldo con mayúscula
    log.Oficina?.direccion || // ← Respaldo estructura anterior
    log.Oficina?.Direccion || // ← Respaldo estructura anterior
    'No especificada' // ← Valor por defecto
  )
}

const obtenerNombreUsuario = (log) => {
  // Construir nombre completo de la persona de la API /logs/filter
  if (log.person) {
    const nombres = log.person.nombres || ''
    const apellido1 = log.person.primerApellido || ''
    const apellido2 = log.person.segundoApellido || ''

    // Si tiene nombres, formar nombre completo
    if (nombres.trim()) {
      return `${nombres} ${apellido1} ${apellido2}`.trim()
    }

    // Si no tiene nombres pero tiene CURP, usar CURP
    if (log.person.curp) {
      return log.person.curp
    }
  }

  // Respaldos para estructuras anteriores
  return (
    log.PersonaCompleta?.NombreCompleto ||
    log.Usuario?.Nombre ||
    log.Usuario?.NombreCompleto ||
    log.Usuario ||
    'No especificado' // ← Valor por defecto
  )
}

// Función mejorada para obtener información completa del dispositivo y escáner
const obtenerInfoDispositivo = (log) => {
  // 🔧 PRIORIDAD: Datos de API directa (estructura moderna)
  let device = log.device || log.Device
  let scanner = log.scanDevice || log.ScanDevice

  // 🔧 FALLBACK: Datos de gráficas (estructura legacy)
  if (!device && log.Dispositivo) {
    if (typeof log.Dispositivo === 'object' && log.Dispositivo.Nombre) {
      device = log.Dispositivo.Nombre
    } else if (typeof log.Dispositivo === 'string') {
      device = log.Dispositivo
    }
  }

  // 🔧 FALLBACK ADICIONAL: SOLO campos reales
  if (!device && log.TrackingCode && log.TrackingCode.trim() !== '') {
    device = log.TrackingCode
  }

  if (!scanner) {
    if (log.escaner && log.escaner.trim() !== '') {
      scanner = log.escaner
    } else if (log.Escaner && log.Escaner.trim() !== '') {
      scanner = log.Escaner
    } else if (log.scanner && log.scanner.trim() !== '') {
      scanner = log.scanner
    }
  }

  // 🔧 VALIDACIÓN: Determinar si hay datos reales
  const hasDevice = device && device !== 'No especificado' && device.trim() !== ''
  const hasScanner = scanner && scanner !== null && scanner.trim() !== ''

  return {
    device: hasDevice ? device : null,
    scanner: hasScanner ? scanner : null,
    hasDevice,
    hasScanner,
  }
}

// Función para formatear fecha completa con más detalle
const formatearFechaCompleta = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    let date

    // 🔧 CASO 1: Formato "31/07/2025, 15:55" (datos de gráficas)
    if (typeof fecha === 'string' && fecha.includes('/') && fecha.includes(',')) {
      const [fechaParte, horaParte] = fecha.split(', ')
      const [dia, mes, año] = fechaParte.split('/')

      if (dia && mes && año && horaParte) {
        const fechaISO = `${año}-${mes.padStart(2, '0')}-${dia.padStart(
          2,
          '0'
        )}T${horaParte.trim()}:00`
        date = new Date(fechaISO)
      } else {
        throw new Error('Formato de fecha incompleto')
      }
    }
    // 🔧 CASO 2: Formato "7/31/2025, 3:44:45 PM" (datos de gráficas con AM/PM)
    else if (
      typeof fecha === 'string' &&
      fecha.includes('/') &&
      (fecha.includes('AM') || fecha.includes('PM'))
    ) {
      date = new Date(fecha)
    }
    // 🔧 CASO 3: Formato ISO "2025-07-22T08:00:01" (datos de API directa)
    else if (typeof fecha === 'string' && fecha.includes('T')) {
      date = new Date(fecha)
    }
    // 🔧 CASO 4: Otros formatos
    else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ Fecha no válida: "${fecha}". Mostrando texto original.`)
      return fecha // Devolver el texto original si no se puede parsear
    }

    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch (error) {
    console.warn(`⚠️ Error al formatear fecha "${fecha}":`, error.message)
    return fecha // Devolver el texto original en caso de error
  }
}

// Función para obtener mensaje completo del log
const obtenerMensajeCompleto = (log) => {
  // 🔧 PRIORIDAD: Buscar en múltiples campos con orden de preferencia
  const mensaje =
    log.message || // API directa moderna
    log.Message || // Datos de gráficas
    log.Mensaje || // Campos alternativos
    log.description ||
    log.Description ||
    log.Descripcion ||
    log.Process || // Fallback al proceso si no hay mensaje
    log.Proceso ||
    log.Type || // Último recurso: el tipo
    log.Tipo ||
    log.EventType

  if (!mensaje || mensaje.trim() === '') {
    return 'Sin mensaje disponible'
  }

  return mensaje.trim()
}

// Funciones principales mejoradas
const abrirConsola = (logsData = null, filtroTexto = '') => {
  mostrarConsola.value = true

  if (logsData && logsData.length > 0) {
    // 🔧 NORMALIZAR DATOS: Detectar si vienen de gráficas y convertir campos
    const datosNormalizados = normalizarDatosLogs(logsData)

    logs.value = datosNormalizados
    filtroActual.value = filtroTexto
    datosDesdeGrafica.value = true
    console.log(
      '📊 Consola abierta desde gráfica con',
      datosNormalizados.length,
      'logs normalizados'
    )
    // Actualizar opciones de filtros cuando se cargan nuevos datos
    obtenerOpcionesUnicas()
  } else {
    datosDesdeGrafica.value = false
    console.log('🔄 Consola abierta - cargando datos desde API')
    cargarLogsDesdeAPI(false)
  }
}

// 🔧 NUEVA FUNCIÓN: Normalizar datos de gráficas SIN GENERAR DATOS FAKE
const normalizarDatosLogs = (logsOriginales) => {
  console.log('🔄 NORMALIZANDO DATOS DE GRÁFICAS (SOLO DATOS REALES):', logsOriginales.length, 'registros')

  // 📊 DEBUG: Mostrar estructura de los primeros 3 logs para análisis
  console.log('📊 ANÁLISIS DE ESTRUCTURA DE DATOS DESDE GRÁFICAS:')
  logsOriginales.slice(0, 3).forEach((log, index) => {
    console.log(`📋 Log ${index + 1} completo:`, JSON.stringify(log, null, 2))
    console.log(`🔍 Campos de dispositivo en Log ${index + 1}:`, {
      device: log.device,
      Device: log.Device,
      Dispositivo: log.Dispositivo,
      scanDevice: log.scanDevice,
      ScanDevice: log.ScanDevice,
      escaner: log.escaner,
      Escaner: log.Escaner,
      TrackingCode: log.TrackingCode
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
        if (typeof log.Dispositivo === 'object' && log.Dispositivo.Nombre && log.Dispositivo.Nombre !== 'No especificado') {
          logNormalizado.device = log.Dispositivo.Nombre
        } else if (typeof log.Dispositivo === 'string' && log.Dispositivo !== 'No especificado' && log.Dispositivo.trim() !== '') {
          logNormalizado.device = log.Dispositivo
        }
      }
      // SOLO usar Device o TrackingCode si son valores reales
      if (!logNormalizado.device && log.Device && log.Device !== 'No especificado' && log.Device.trim() !== '') {
        logNormalizado.device = log.Device
      }
      if (!logNormalizado.device && log.TrackingCode && log.TrackingCode.trim() !== '') {
        logNormalizado.device = log.TrackingCode
      }
    }

    // 🔧 NORMALIZAR SCANNER: SOLO si existe un valor real - NO GENERAR FAKE
    if (!logNormalizado.scanDevice) {
      if (log.scanDevice && log.scanDevice.trim() !== '') {
        logNormalizado.scanDevice = log.scanDevice
      } else if (log.ScanDevice && log.ScanDevice.trim() !== '') {
        logNormalizado.scanDevice = log.ScanDevice
      } else if (log.escaner && log.escaner.trim() !== '') {
        logNormalizado.scanDevice = log.escaner
      } else if (log.Escaner && log.Escaner.trim() !== '') {
        logNormalizado.scanDevice = log.Escaner
      }
      // NO GENERAR DATOS FAKE - dejar como undefined si no existen
    }

    // 🔧 NORMALIZAR OTROS CAMPOS
    logNormalizado.message = logNormalizado.message || log.Message || log.Mensaje
    logNormalizado.process = logNormalizado.process || log.Process || log.Proceso
    logNormalizado.type = logNormalizado.type || log.Type || log.Tipo

    // 🔧 NORMALIZAR FECHA: Mantener ambas para compatibilidad
    if (log.Date && !logNormalizado.date) {
      logNormalizado.date = log.Date
    }

    if (index < 3) {
      console.log(`🔄 Log ${index + 1} normalizado:`, {
        original: {
          Dispositivo: log.Dispositivo,
          Device: log.Device,
          Date: log.Date,
          Message: log.Message,
        },
        normalizado: {
          device: logNormalizado.device,
          scanDevice: logNormalizado.scanDevice,
          date: logNormalizado.date,
          message: logNormalizado.message,
        },
      })
    }

    return logNormalizado
  })
}

const cerrarConsola = () => {
  mostrarConsola.value = false
  busqueda.value = ''
  filtroActual.value = ''
  datosDesdeGrafica.value = false
  // Limpiar filtros al cerrar
  limpiarTodosFiltros()
}

// Función robusta para cargar logs desde API con manejo de errores mejorado
const cargarLogsDesdeAPI = async (rangoExtendido = false) => {
  loading.value = true
  try {
    console.log('🌐 Cargando logs desde API...')

    // Crear payload con filtros activos y validaciones
    const payload = {}

    // Agregar filtros de fecha con validación y formato correcto
    if (rangoFechas.value) {
      if (typeof rangoFechas.value === 'string') {
        // Validar y convertir formato de fecha
        const fechaFormateada = validarYFormatearFecha(rangoFechas.value)
        if (fechaFormateada) {
          payload.fechaInicio = fechaFormateada
          payload.fechaFin = fechaFormateada
        }
      } else if (rangoFechas.value.from && rangoFechas.value.to) {
        // 🔧 FORMATO CORRECTO: Asegurar formato ISO YYYY-MM-DD
        payload.fechaInicio = validarYFormatearFecha(rangoFechas.value.from)
        payload.fechaFin = validarYFormatearFecha(rangoFechas.value.to)
      }
    }

    // Si no hay fechas válidas, usar rango según el contexto
    if (!payload.fechaInicio || !payload.fechaFin) {
      const hoy = new Date()
      const fechaInicio = new Date()

      if (rangoExtendido) {
        // Para consola directa, usar último mes para obtener más datos
        fechaInicio.setDate(hoy.getDate() - 30)
        console.log('📅 Usando rango extendido: últimos 30 días')
      } else {
        // Para otros casos, usar últimos 7 días
        fechaInicio.setDate(hoy.getDate() - 7)
        console.log('📅 Usando rango estándar: últimos 7 días')
      }

      payload.fechaInicio = fechaInicio.toISOString().split('T')[0]
      payload.fechaFin = hoy.toISOString().split('T')[0]
    }

    console.log('📅 Rango de fechas final:', `${payload.fechaInicio} al ${payload.fechaFin}`)

    // Agregar otros filtros con validación
    if (filtroTipo.value && filtroTipo.value.trim() !== '') {
      payload.tipo = filtroTipo.value.trim()
    }

    if (filtroOficina.value && filtroOficina.value.trim() !== '') {
      payload.oficina = filtroOficina.value.trim()
    }

    if (filtroUsuario.value && filtroUsuario.value.trim() !== '') {
      payload.usuario = filtroUsuario.value.trim()
    }

    console.log('📡 Enviando parámetros validados a API /logs/filter:', payload)

    // 🔧 CONSTRUIR PARÁMETROS CON FORMATO CORRECTO (YYYY-MM-DD)
    const params = new URLSearchParams({
      fromDate: payload.fechaInicio || '2025-01-01',
      toDate: payload.fechaFin || '2025-12-31',
    })

    console.log('🗓️ FECHAS FINALES PARA API:')
    console.log('├── fromDate:', params.get('fromDate'))
    console.log('└── toDate:', params.get('toDate'))

    // Agregar filtros adicionales si están presentes
    if (payload.tipo && payload.tipo.trim() !== '') {
      params.append('type', payload.tipo.trim())
    }
    if (payload.proceso && payload.proceso.trim() !== '') {
      params.append('process', payload.proceso.trim())
    }
    if (payload.oficina && payload.oficina.trim() !== '') {
      // 🔧 CORREGIR: Convertir nombre de oficina a ID
      const oficinaId = obtenerIdOficina(payload.oficina.trim())
      if (oficinaId) {
        params.append('oficinaId', oficinaId.toString())
        console.log(`🏢 Oficina: "${payload.oficina}" → ID: ${oficinaId}`)
      } else {
        console.warn(`⚠️ No se encontró ID para oficina: "${payload.oficina}"`)
      }
    }
    if (payload.usuario && payload.usuario.trim() !== '') {
      // 🔧 CORREGIR: Convertir nombre de persona a ID
      const personaId = obtenerIdPersona(payload.usuario.trim())
      if (personaId) {
        params.append('personId', personaId.toString())
        console.log(`👤 Usuario: "${payload.usuario}" → ID: ${personaId}`)
      } else {
        console.warn(`⚠️ No se encontró ID para persona: "${payload.usuario}"`)
      }
    }

    console.log('🚀 URL completa:', `${API_BASE_URL}/logs/filter?${params}`)

    // Llamar al mismo endpoint que usan las gráficas (puerto 8024)
    const response = await Promise.race([
      axios.get(`${API_BASE_URL}/logs/filter?${params}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout después de 30 segundos')), 30000)
      ),
    ])

    console.log('📊 Respuesta API:', {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
      dataType: typeof response.data,
      muestra: Array.isArray(response.data) ? response.data.slice(0, 2) : response.data,
    })

    // 📋 LOG DETALLADO: Mostrar estructura completa de los primeros registros
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('📋 ESTRUCTURA DETALLADA DE LOS DATOS RECIBIDOS:')
      console.log('├── Total de registros:', response.data.length)
      console.log('├── Primer registro completo:', JSON.stringify(response.data[0], null, 2))

      if (response.data.length > 1) {
        console.log('├── Segundo registro completo:', JSON.stringify(response.data[1], null, 2))
      }

      // Analizar campos disponibles
      const camposDisponibles = Object.keys(response.data[0])
      console.log('├── Campos disponibles:', camposDisponibles)

      // Verificar estructura de person y oficina
      if (response.data[0].person) {
        console.log('├── Estructura person:', Object.keys(response.data[0].person))
      }
      if (response.data[0].oficina) {
        console.log('├── Estructura oficina:', Object.keys(response.data[0].oficina))
      }

      console.log('└── Dispositivos encontrados:')
      response.data.slice(0, 5).forEach((log, index) => {
        console.log(
          `    ${index + 1}. Device: "${log.device || 'N/A'}" | ScanDevice: "${
            log.scanDevice || 'N/A'
          }"`
        )
      })
    }

    if (
      response.data &&
      response.data !== 'PRO FEATURE ONLY' &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      logs.value = response.data
      console.log('✅ Logs cargados desde API:', logs.value.length, 'registros')

      // 🔍 DEBUG: Analizar fechas en los logs cargados
      console.log('📅 ANÁLISIS DE FECHAS EN LOGS CARGADOS:')
      const fechasEncontradas = logs.value.slice(0, 10).map((log) => ({
        Date: log.Date,
        Fecha: log.Fecha,
        FechaCreacion: log.FechaCreacion,
        fechaFinal: log.Date || log.Fecha || log.FechaCreacion,
      }))
      console.log('├── Muestra de fechas (primeros 10):', fechasEncontradas)

      const fechasUnicas = [
        ...new Set(
          logs.value.map((log) => {
            const fecha = log.Date || log.Fecha || log.FechaCreacion
            return fecha ? new Date(fecha).toISOString().split('T')[0] : 'SIN_FECHA'
          })
        ),
      ].slice(0, 10)
      console.log('├── Fechas únicas encontradas (muestra):', fechasUnicas)
      console.log(
        '└── Total logs con fecha válida:',
        logs.value.filter((log) => log.Date || log.Fecha || log.FechaCreacion).length
      )

      filtroActual.value = `Datos cargados desde API (${logs.value.length} registros) del ${payload.fechaInicio} al ${payload.fechaFin}`

      // Actualizar opciones de filtros
      obtenerOpcionesUnicas()

      $q.notify({
        type: 'positive',
        message: `${logs.value.length} logs cargados desde la API`,
        position: 'top',
      })
    } else {
      // Sin datos válidos de la API - mostrar mensaje sin datos
      console.log('⚠️ API sin datos válidos, mostrando mensaje de no hay datos')
      logs.value = []
      filtroActual.value = `Sin datos disponibles del ${payload.fechaInicio} al ${payload.fechaFin}`

      $q.notify({
        type: 'info',
        message: 'No hay datos disponibles para los filtros seleccionados',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('❌ Error al cargar logs desde API:', error)

    // NO cargar datos de muestra, mostrar mensaje de error
    logs.value = []
    filtroActual.value = 'Error al cargar datos'

    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos desde la API. No hay datos disponibles.',
      position: 'top',
      timeout: 4000,
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
  console.log('├── Rango fechas:', rangoFechas.value)
  console.log('├── Filtros aplicados:', {
    tipo: filtroTipo.value,
    oficina: filtroOficina.value,
    usuario: filtroUsuario.value,
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
const cargarOficinasDelCatalogo = async () => {
  try {
    console.log('🏢 Cargando oficinas del catálogo...')
    const oficinasFromAPI = await CatalogService.cargarOficinas()

    // Actualizar el mapa para conversión nombre -> ID
    mapaOficinas.value.clear()
    oficinasFromAPI.forEach((oficina) => {
      mapaOficinas.value.set(oficina.label, oficina.value)
    })

    console.log('🗂️ Mapa de oficinas creado:', Object.fromEntries(mapaOficinas.value))

    // Actualizar opciones para los selectores
    oficinasFull.value = oficinasFromAPI
    opcionesOficinas.value = [...oficinasFull.value]

    return oficinasFromAPI.length > 0
  } catch (error) {
    console.error('❌ Error cargando oficinas del catálogo:', error)
    return false
  }
}

// CARGAR PERSONAS DEL CATÁLOGO
const cargarPersonasDelCatalogo = async () => {
  try {
    console.log('👥 Cargando personas del catálogo...')
    const personasFromAPI = await CatalogService.cargarPersonas()

    // Actualizar el mapa para conversión nombre -> ID
    mapaPersonas.value.clear()
    personasFromAPI.forEach((persona) => {
      // Extraer solo el nombre sin CURP para el mapeo
      const nombreSinCurp = persona.label.split(' (')[0]
      mapaPersonas.value.set(nombreSinCurp, persona.value)
      // También mapear con el label completo por si acaso
      mapaPersonas.value.set(persona.label, persona.value)
    })

    console.log('🗂️ Mapa de personas creado:', Object.fromEntries(mapaPersonas.value))

    // Actualizar opciones para los selectores
    usuariosFull.value = personasFromAPI
    opcionesUsuarios.value = [...usuariosFull.value]

    return personasFromAPI.length > 0
  } catch (error) {
    console.error('❌ Error cargando personas del catálogo:', error)
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

// Funciones de filtrado mejoradas
const obtenerOpcionesUnicas = () => {
  console.log('🔍 OBTENIENDO OPCIONES ÚNICAS DE', logs.value.length, 'LOGS')
  console.log('📊 Muestra de datos para análisis:', logs.value.slice(0, 2))

  // Obtener oficinas únicas con múltiples campos
  const oficinasUnicas = [
    ...new Set(
      logs.value
        .filter((log) => {
          const oficina = obtenerNombreOficina(log)
          return oficina && oficina.toString().trim() !== '' && oficina !== 'No especificada'
        })
        .map((log) => obtenerNombreOficina(log))
    ),
  ].sort()

  console.log('🏢 Oficinas encontradas:', oficinasUnicas.length, '→', oficinasUnicas)

  // Agregar opciones predeterminadas si no hay datos de la API
  if (oficinasUnicas.length === 0) {
    console.log('⚠️ No se encontraron oficinas en los datos, agregando opciones predeterminadas')
    oficinasUnicas.push(
      'Oficina Aguascalientes',
      'Oficina Baja California',
      'Oficina CDMX',
      'Oficina Guadalajara',
      'Oficina Monterrey'
    )
  }

  oficinasFull.value = oficinasUnicas.map((oficina) => ({
    label: oficina,
    value: oficina,
  }))
  opcionesOficinas.value = [...oficinasFull.value]

  // Obtener usuarios únicos con múltiples campos
  const usuariosUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const usuario = obtenerNombreUsuario(log)
          return usuario && usuario.toString().trim() !== '' && usuario !== 'No especificado'
        })
        .map((log) => obtenerNombreUsuario(log))
    ),
  ].sort()

  console.log('👥 Usuarios encontrados:', usuariosUnicos.length, '→', usuariosUnicos.slice(0, 5))

  // Agregar opciones predeterminadas si no hay datos de la API
  if (usuariosUnicos.length === 0) {
    console.log('⚠️ No se encontraron usuarios en los datos, agregando opciones predeterminadas')
    usuariosUnicos.push(
      'STEVE ALVAREZ ZEPETA',
      'CARLOS HERNANDEZ ROJAS',
      'ANA GARCIA LOPEZ',
      'LUIS MARTINEZ VEGA',
      'MARIA RODRIGUEZ SILVA'
    )
  }

  usuariosFull.value = usuariosUnicos.map((usuario) => ({
    label: usuario,
    value: usuario,
  }))
  opcionesUsuarios.value = [...usuariosFull.value]

  // 🆕 OBTENER DISPOSITIVOS ÚNICOS con soporte para múltiples estructuras
  const devicesUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.hasDevice
        })
        .map((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.device
        })
    ),
  ].sort()

  console.log('📱 Devices encontrados:', devicesUnicos.length, '→', devicesUnicos)

  // 🆕 OBTENER SCAN DEVICES ÚNICOS con soporte para múltiples estructuras
  const scanDevicesUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.hasScanner
        })
        .map((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.scanner
        })
    ),
  ].sort()

  console.log('🔍 ScanDevices encontrados:', scanDevicesUnicos.length, '→', scanDevicesUnicos)

  console.log(
    '✅ OPCIONES FINALES:',
    '\n├── Oficinas:',
    opcionesOficinas.value.length,
    '\n├── Usuarios:',
    opcionesUsuarios.value.length,
    '\n├── Devices:',
    devicesUnicos.length,
    '\n└── ScanDevices:',
    scanDevicesUnicos.length
  )
}

const filtrarOficinas = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesOficinas.value = oficinasFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesOficinas.value = oficinasFull.value.filter(
        (oficina) => oficina.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filtrarUsuarios = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesUsuarios.value = usuariosFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesUsuarios.value = usuariosFull.value.filter(
        (usuario) => usuario.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const limpiarFiltro = (key) => {
  switch (key) {
    case 'oficina':
      filtroOficina.value = null
      break
    case 'usuario':
      filtroUsuario.value = null
      break
    case 'tipo':
      filtroTipo.value = null
      break
    case 'fecha':
      rangoFechas.value = null
      break
  }

  // Si no hay datos de gráfica, recargar desde API con nuevos filtros
  if (!datosDesdeGrafica.value) {
    cargarLogsDesdeAPI(false)
  }
}

const limpiarTodosFiltros = () => {
  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipo.value = null
  rangoFechas.value = null
  busqueda.value = ''

  // Si no hay datos de gráfica, recargar desde API
  if (!datosDesdeGrafica.value) {
    cargarLogsDesdeAPI(false)
  }
}

const cargarLogs = () => {
  if (datosDesdeGrafica.value) {
    console.log('📊 Usando datos de gráfica existentes')
    return
  }
  cargarLogsDesdeAPI(false)
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    let date

    // Manejar el formato específico "31/07/2025, 15:55" (campo "Fecha" de la API)
    if (typeof fecha === 'string' && fecha.includes('/') && fecha.includes(',')) {
      // Formato: "31/07/2025, 15:55" -> convertir a formato ISO
      const [fechaParte, horaParte] = fecha.split(', ')
      const [dia, mes, año] = fechaParte.split('/')

      // Validar que tenemos todos los componentes
      if (dia && mes && año && horaParte) {
        const fechaISO = `${año}-${mes.padStart(2, '0')}-${dia.padStart(
          2,
          '0'
        )}T${horaParte.trim()}:00`
        date = new Date(fechaISO)
      } else {
        throw new Error('Formato de fecha incompleto')
      }
    } else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ Fecha no válida en formatearFecha: "${fecha}". Mostrando texto original.`)
      return fecha // Devolver el texto original si no se puede parsear
    }

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn(`⚠️ Error al formatear fecha en formatearFecha "${fecha}":`, error.message)
    return fecha // Devolver el texto original en caso de error
  }
}

const getColorTipo = (tipo) => {
  const colores = {
    ERROR: 'negative',
    SUCCESS: 'positive',
    WARNING: 'warning',
    INFO: 'info',
    LOGIN: 'blue',
    REGISTRO: 'green',
    EXPORTACION: 'purple',
    AUTENTICACION: 'indigo',
    VALIDACION: 'teal',
    OPERACION: 'brown',
  }
  return colores[(tipo || 'INFO').toUpperCase()] || 'info'
}

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true
}

const limpiarConsola = () => {
  logs.value = []
  busqueda.value = ''
  filtroActual.value = ''
  datosDesdeGrafica.value = false
  limpiarTodosFiltros()
  $q.notify({
    type: 'info',
    message: 'Consola limpiada - ahora se cargarán datos desde la API',
    position: 'top',
  })
  // Después de limpiar, cargar datos frescos desde API
  cargarLogsDesdeAPI(false)
}

// Función de exportación mejorada con múltiples formatos
const exportarLogs = (formato = 'json') => {
  if (!logsFiltrados.value.length) return

  try {
    const datosExport = logsFiltrados.value.map((log) => ({
      Fecha: formatearFecha(log.Date || log.Fecha || log.FechaCreacion),
      Tipo: log.Type || log.Tipo || log.EventType || 'INFO',
      Proceso: log.Process || log.Proceso || '',
      Mensaje: log.Message || log.Mensaje || '',
      Usuario: obtenerNombreUsuario(log),
      Oficina: obtenerNombreOficina(log),
      Dispositivo: log.TrackingCode || log.Device || log.Dispositivo || '',
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
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            )
            .join(',')
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
              }\n${log.Mensaje}\n${'='.repeat(80)}\n`
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
  console.log('🚀 ABRIENDO CONSOLA DIRECTA DESDE SIDEBAR - versión mejorada con fechas automáticas')
  mostrarConsola.value = true
  filtroActual.value = 'Consola directa - Logs con rango de fechas automático'
  datosDesdeGrafica.value = false

  // 🏢 Cargar oficinas del catálogo para el mapeo ID-nombre
  await cargarOficinasDelCatalogo()

  // 👥 Cargar personas del catálogo para el mapeo ID-nombre
  await cargarPersonasDelCatalogo()

  // � DEBUG: Limpiar TODOS los filtros para verificar problema
  console.log('🧹 LIMPIANDO TODOS LOS FILTROS PARA DEBUGGING')
  rangoFechas.value = null
  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipo.value = null
  busqueda.value = ''

  // Limpiar otros filtros pero mantener fechas
  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipo.value = null
  busqueda.value = ''

  // Cargar datos frescos desde API con el rango de fechas inicializado
  await cargarLogsDesdeAPI(true)
}

const obtenerIdPersona = (nombrePersona) => {
  if (!nombrePersona) return null
  const id = mapaPersonas.value.get(nombrePersona)
  console.log(`👤 Convertir "${nombrePersona}" → ID: ${id}`)
  return id
}

// 👀 WATCHER: Recargar datos automáticamente cuando cambien las fechas
watch(
  () => rangoFechas.value,
  (nuevasfechas, fechasAnteriores) => {
    // Solo ejecutar si la consola está abierta y hay fechas válidas
    if (mostrarConsola.value && nuevasfechas && !loading.value) {
      console.log('📅 CAMBIO DE FECHAS DETECTADO - Recargando datos automáticamente')
      console.log('├── Fechas anteriores:', fechasAnteriores)
      console.log('└── Fechas nuevas:', nuevasfechas)

      // Recargar datos con un pequeño delay para evitar múltiples llamadas
      setTimeout(() => {
        if (!loading.value) {
          cargarLogsDesdeAPI(false)
        }
      }, 300)
    }
  },
  { deep: true } // Para detectar cambios en objetos anidados
)

// Exposición de funciones
defineExpose({
  abrirConsola,
  abrirConsolaDirecta,
  cerrarConsola,
  mostrarConsola,
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
</style>
