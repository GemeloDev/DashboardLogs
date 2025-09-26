<template>
  <q-card class="enhanced-graphics-container">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="analytics" size="28px" class="q-mr-sm" color="primary" />
        Dashboard Analítico de Logs
      </div>

      <!-- Primera fila: KPIs Dashboard Mejorados -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- KPI Total de Logs -->
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card gradient-blue" @click="abrirConsolaGeneral('todos')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="analytics" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Total Logs</div>
                  <div class="kpi-value">{{ totalLogs }}</div>
                  <div class="kpi-subtitle">Último período</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Total de Logs Registrados</div>
                  <div>Click para ver todos los logs</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI Usuarios Activos -->
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card gradient-green" @click="abrirConsolaGeneral('login')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="verified_user" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Logins</div>
                  <div class="kpi-value">{{ totalLogin }}</div>
                  <div class="kpi-subtitle">Autenticaciones</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Logins del Sistema</div>
                  <div>Click para ver detalles de autenticación</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI Errores -->
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card gradient-red" @click="abrirConsolaGeneral('errores')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="bug_report" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Total Errores</div>
                  <div class="kpi-value">{{ totalErrores }}</div>
                  <div class="kpi-subtitle">Sistema</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Errores del Sistema</div>
                  <div>Click para ver detalles de errores</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI Escaneos -->
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="kpi-card gradient-cyan" @click="abrirConsolaGeneral('escaneos')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="qr_code_scanner" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Escaneos</div>
                  <div class="kpi-value">{{ totalEscaneos }}</div>
                  <div class="kpi-subtitle">INE y Pasaporte</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Total de Escaneos</div>
                  <div>Click para ver historial de escaneos</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Segunda fila: KPIs adicionales -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- KPI Exportaciones -->
        <div class="col-12 col-md-6">
          <q-card class="kpi-card gradient-orange" @click="abrirConsolaGeneral('exportaciones')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="file_download" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Exportaciones</div>
                  <div class="kpi-value">{{ totalExportaciones }}</div>
                  <div class="kpi-subtitle">Archivos</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Total de Exportaciones</div>
                  <div>Click para ver historial de exportaciones</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI Logins Exitosos -->
        <div class="col-12 col-md-6">
          <q-card class="kpi-card gradient-green" @click="abrirConsolaGeneral('login')">
            <q-card-section class="q-pa-lg">
              <div class="kpi-content">
                <div class="kpi-icon-container">
                  <q-icon name="verified_user" size="36px" class="kpi-icon" />
                </div>
                <div class="kpi-data">
                  <div class="kpi-title">Logins Exitosos</div>
                  <div class="kpi-value">{{ totalLoginExitosos }}</div>
                  <div class="kpi-subtitle">Autenticaciones</div>
                </div>
              </div>
              <q-tooltip>
                <div class="text-body2">
                  <div class="text-weight-bold">Logins Exitosos</div>
                  <div>Click para ver detalles de autenticación exitosa</div>
                </div>
              </q-tooltip>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Gráfica de Exportaciones Mejorada -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card export-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="file_download" size="24px" class="q-mr-sm text-orange-6" />
                <div class="chart-title">
                  <div class="text-h6">Exportaciones por Formato</div>
                  <div class="text-caption text-grey-6">Análisis de formatos de exportación</div>
                </div>
                <q-space />
                <q-chip
                  v-if="!datosExportaciones.isEmpty && totalExportaciones > 0"
                  color="orange"
                  text-color="white"
                  size="sm"
                  icon="assessment"
                >
                  {{ totalExportaciones }} exportaciones
                </q-chip>
                <q-chip
                  v-else-if="datosExportaciones.isEmpty"
                  color="grey"
                  text-color="white"
                  size="sm"
                  icon="info"
                >
                  Sin datos
                </q-chip>
                <q-spinner v-if="loadingExportaciones" color="orange" size="20px" class="q-ml-sm" />
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="exportacionesChart" height="320"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Tiempos Mejorada -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card time-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="speed" size="24px" class="q-mr-sm text-amber-6" />
                <div class="chart-title">
                  <div class="text-h6">Tiempos de Respuesta</div>
                  <div class="text-caption text-grey-6">Rendimiento promedio por proceso</div>
                </div>
                <q-space />
                <div class="row q-gutter-xs">
                  <q-chip color="indigo" text-color="white" size="sm" v-if="promedios.QR">
                    QR: {{ promedios.QR?.toFixed(2) }}s
                  </q-chip>
                  <q-chip color="pink" text-color="white" size="sm" v-if="promedios.MRZ">
                    MRZ: {{ promedios.MRZ?.toFixed(2) }}s
                  </q-chip>
                </div>
                <q-spinner v-if="loadingTiempos" color="amber" size="20px" class="q-ml-sm" />
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="tiemposChart" height="320"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Escaneos Mejorada -->
        <div class="col-12">
          <q-card class="enhanced-chart-card scan-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="qr_code_scanner" size="24px" class="q-mr-sm text-cyan-6" />
                <div class="chart-title">
                  <div class="text-h6">Actividad de Escaneos</div>
                  <div class="text-caption text-grey-6">Volumen de escaneos QR y MRZ por día</div>
                </div>
                <q-space />
                <q-chip
                  v-if="!datosEscaneos.isEmpty && totalEscaneos > 0"
                  color="cyan"
                  text-color="white"
                  size="sm"
                  icon="qr_code"
                >
                  {{ totalEscaneos }} escaneos
                </q-chip>
                <q-chip
                  v-else-if="datosEscaneos.isEmpty"
                  color="grey"
                  text-color="white"
                  size="sm"
                  icon="info"
                >
                  Sin datos
                </q-chip>
                <q-spinner v-if="loadingEscaneos" color="cyan" size="20px" class="q-ml-sm" />
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="escaneosChart" height="280"></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Segunda fila de gráficas: Login y Registro -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <!-- Gráfica de Login -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card login-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="login" size="24px" class="q-mr-sm text-green-6" />
                <div class="chart-title">
                  <div class="text-h6">Autenticación</div>
                  <div class="text-caption text-grey-6">Éxito vs Fallos de login</div>
                </div>
                <q-space />
                <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="!datosLogin.isEmpty && totalLogin > 0"
                    color="green"
                    text-color="white"
                    size="sm"
                    icon="verified_user"
                  >
                    {{ totalLogin }} logins
                  </q-chip>
                  <q-chip
                    v-else-if="datosLogin.isEmpty"
                    color="grey"
                    text-color="white"
                    size="sm"
                    icon="info"
                  >
                    Sin datos
                  </q-chip>
                  <q-spinner v-if="loadingLogin" color="green" size="20px" />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="loginChart" class="responsive-canvas" height="320"></canvas>
              <div v-if="loadingLogin" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="green" />
                <div class="q-mt-sm">Cargando datos de login...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Registro -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card registro-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="person_add" size="24px" class="q-mr-sm text-blue-6" />
                <div class="chart-title">
                  <div class="text-h6">Registros</div>
                  <div class="text-caption text-grey-6">Actividad de registro</div>
                </div>
                <q-space />
                <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="!datosRegistro.isEmpty && totalRegistro > 0"
                    color="blue"
                    text-color="white"
                    size="sm"
                    icon="person_add"
                  >
                    {{ totalRegistro }} registros
                  </q-chip>
                  <q-chip
                    v-else-if="datosRegistro.isEmpty"
                    color="grey"
                    text-color="white"
                    size="sm"
                    icon="info"
                  >
                    Sin datos
                  </q-chip>
                  <q-spinner v-if="loadingRegistro" color="blue" size="20px" />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="registroChart" class="responsive-canvas" height="320"></canvas>
              <div v-if="loadingRegistro" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="blue" />
                <div class="q-mt-sm">Cargando datos de registro...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tercera fila: Gráfica de Errores ocupando toda la columna -->
      <div class="row q-col-gutter-md q-mt-md">
        <!-- Gráfica de Errores -->
        <div class="col-12">
          <q-card class="enhanced-chart-card errores-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="error" size="24px" class="q-mr-sm text-red-6" />
                <div class="chart-title">
                  <div class="text-h6">Errores del Sistema</div>
                  <div class="text-caption text-grey-6">
                    Monitoreo detallado de errores por fecha
                  </div>
                </div>
                <q-space />
                <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="!datosErrores.isEmpty && totalErrores > 0"
                    color="red"
                    text-color="white"
                    size="sm"
                    icon="bug_report"
                  >
                    {{ totalErrores }} errores
                  </q-chip>
                  <q-chip
                    v-else-if="datosErrores.isEmpty"
                    color="grey"
                    text-color="white"
                    size="sm"
                    icon="info"
                  >
                    Sin datos
                  </q-chip>
                  <q-spinner v-if="loadingErrores" color="red" size="20px" />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="erroresChart" class="responsive-canvas" height="250"></canvas>
              <div v-if="loadingErrores" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="red" />
                <div class="q-mt-sm">Cargando datos de errores...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Loading overlay -->
      <q-inner-loading :showing="loadingGeneral">
        <q-spinner-gears size="50px" color="primary" />
        <div class="q-mt-md text-center">Cargando datos analíticos...</div>
      </q-inner-loading>
    </q-card-section>

    <!-- Consola de Logs Mejorada -->
    <EscritorioConsola ref="consolaRef" :filtros="filtros" />
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount, inject } from 'vue'
import { useQuasar } from 'quasar'
import Chart from 'chart.js/auto'
import { ChartDataService } from '../../services/chartDataService'
import EscritorioConsola from './EscritorioConsolaSimple.vue'

// Inyectar filtros globales desde el layout padre
const filtrosGlobales = inject('filtrosGlobales', ref({}))

// Props
const props = defineProps({
  filtros: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Quasar instance para notificaciones
const $q = useQuasar()

// Referencias de canvas
const exportacionesChart = ref(null)
const tiemposChart = ref(null)
const escaneosChart = ref(null)
const loginChart = ref(null)
const registroChart = ref(null)
const erroresChart = ref(null)

// Referencia de la consola
const consolaRef = ref(null)

// Instancias de Chart.js
const chartInstances = ref({
  exportaciones: null,
  tiempos: null,
  escaneos: null,
  login: null,
  registro: null,
  errores: null,
})

// Estados de loading
const loadingExportaciones = ref(false)
const loadingTiempos = ref(false)
const loadingEscaneos = ref(false)
const loadingLogin = ref(false)
const loadingRegistro = ref(false)
const loadingErrores = ref(false)

// Datos procesados
const datosExportaciones = ref({ series: [], categorias: [], detalles: [] })
const datosTiempos = ref({ series: [], categorias: [], detalles: [], promedios: {} })
const datosEscaneos = ref({ series: [], categorias: [], detalles: [] })
const datosLogin = ref({ series: [], categorias: [], detalles: [] })
const datosRegistro = ref({ series: [], categorias: [], detalles: [] })
const datosErrores = ref({ series: [], categorias: [], detalles: [] })

// Computed para loading general
const loadingGeneral = computed(
  () =>
    loadingExportaciones.value ||
    loadingTiempos.value ||
    loadingEscaneos.value ||
    loadingLogin.value ||
    loadingRegistro.value ||
    loadingErrores.value
)

// Computed para totales
const totalExportaciones = computed(() => {
  return datosExportaciones.value.series.reduce((total, serie) => {
    return total + serie.data.reduce((sum, valor) => sum + valor, 0)
  }, 0)
})

const totalEscaneos = computed(() => {
  return datosEscaneos.value.series.reduce((total, serie) => {
    return total + serie.data.reduce((sum, valor) => sum + valor, 0)
  }, 0)
})

const totalLogin = computed(() => {
  return datosLogin.value.series.reduce((total, serie) => {
    return total + serie.data.reduce((sum, valor) => sum + valor, 0)
  }, 0)
})

const totalRegistro = computed(() => {
  return datosRegistro.value.series.reduce((total, serie) => {
    return total + serie.data.reduce((sum, valor) => sum + valor, 0)
  }, 0)
})

const totalErrores = computed(() => {
  return datosErrores.value.series.reduce((total, serie) => {
    return total + serie.data.reduce((sum, valor) => sum + valor, 0)
  }, 0)
})

// Computed para KPIs adicionales
const totalLogs = computed(() => {
  return (
    totalExportaciones.value +
    totalLogin.value +
    totalRegistro.value +
    totalErrores.value +
    totalEscaneos.value
  )
})

const totalLoginExitosos = computed(() => {
  const serieExitosos = datosLogin.value.series.find((serie) => serie.name === 'Exitosos')
  return serieExitosos ? serieExitosos.data.reduce((sum, valor) => sum + valor, 0) : 0
})

const promedios = computed(() => datosTiempos.value.promedios)

// Función para abrir consola general desde KPIs
const abrirConsolaGeneral = (tipo) => {
  if (!consolaRef.value) {
    console.warn('❌ Referencia de consola no disponible')
    return
  }

  let datos = []
  let titulo = ''
  let filtrosEspecificos = {}
  switch (tipo) {
    case 'todos':
      datos = [
        ...datosLogin.value.detalles,
        ...datosRegistro.value.detalles,
        ...datosErrores.value.detalles,
        ...(datosExportaciones.value.detalles || []),
        ...(datosEscaneos.value.detalles || []),
      ]
      titulo = 'Todos los Logs del Sistema'
      // Sin filtros específicos - mostrar todo
      break
    case 'login':
      // Login incluye SUCCESS y ERROR del proceso LOGIN
      datos = datosLogin.value.detalles
      titulo = 'Logs de Autenticación'
      filtrosEspecificos = {
        proceso: 'LOGIN', // Filtrar solo por proceso LOGIN
      }
      break
    case 'errores':
      // Errores incluye todos los ERROR de cualquier proceso
      datos = datosErrores.value.detalles
      titulo = 'Errores del Sistema'
      filtrosEspecificos = {
        tipoLog: 'ERROR', // Filtrar solo por tipo ERROR
      }
      break
    case 'exportaciones':
      // Exportaciones incluye los de tipo EXPORT (usualmente proceso INE)
      datos = datosExportaciones.value.detalles || []
      titulo = 'Historial de Exportaciones'
      filtrosEspecificos = {
        tipoLog: 'EXPORT',
      }
      break
    case 'escaneos':
      // Escaneos incluye START, END, FIN de procesos INE y PASSPORT
      datos = datosEscaneos.value.detalles || []
      titulo = 'Actividad de Escaneos'
      filtrosEspecificos = {
        // Filtrar escaneos: tipos START, END, FIN
        proceso: 'INE', // Principalmente INE, pero pueden ser PASSPORT también
      }
      break
  }

  if (datos.length === 0) {
    datos = [
      {
        Date: new Date().toISOString(),
        Type: 'INFO',
        Process: 'SYSTEM',
        Message: `No hay datos disponibles para ${titulo}`,
        Oficina: { Nombre: 'Sistema' },
        Usuario: 'Sistema',
        Dispositivo: 'N/A',
        ErrorCode: 'NO_DATA_KPI',
        SessionToken: 'Sistema',
      },
    ]
  }
  console.log('Detalles de exportaciones:', datosExportaciones.value.detalles)

  // Función helper para obtener nombre de oficina
  const obtenerNombreOficina = (oficina) => {
    if (!oficina) return 'No especificada'
    if (typeof oficina === 'string') return oficina
    if (typeof oficina === 'object') {
      return (
        oficina.nombre ||
        oficina.Nombre ||
        oficina.descripcion ||
        oficina.Descripcion ||
        'Sin nombre'
      )
    }
    return 'No especificada'
  }

  const logsFormateados = datos.map((detalle) => ({
    Date: detalle.fechaCompleta || detalle.fecha || detalle.Date,
    Type: detalle.type,
    type: detalle.type,
    Process: detalle.process,
    Message: detalle.message || detalle.Message || `Evento de ${tipo}`,
    Oficina: {
      Nombre: obtenerNombreOficina(detalle.oficina || detalle.Oficina),
      Direccion:
        (detalle.oficina && typeof detalle.oficina === 'object' && detalle.oficina.direccion) ||
        (detalle.Oficina && typeof detalle.Oficina === 'object' && detalle.Oficina.direccion) ||
        'No especificada',
    },
    Usuario: detalle.usuario || detalle.Usuario || detalle.person?.nombres || 'No especificado',
    Dispositivo: detalle.device || detalle.Dispositivo || detalle.device || 'No especificado',
    Escaner:
      detalle.scanDevice ||
      detalle.ScanDevice ||
      detalle.escaner ||
      detalle.scanner ||
      'No especificado',
    // 🔥 CAMPOS EXACTOS COMO EN LA CONSOLA DEL NAVBAR - DESDE KPIs 🔥
    ErrorCode:
      detalle.errorCode ||
      detalle.error_code ||
      detalle.codigo_error ||
      detalle.ErrorCode ||
      detalle.Error_Code ||
      'N/A',
    SessionToken:
      detalle.sessionToken ||
      detalle.session_token ||
      detalle.Session_Token ||
      detalle.token ||
      detalle.Token ||
      'No disponible',
    // Información adicional para mejor contexto
    PersonaCompleta: detalle.person
      ? {
          CURP: detalle.person.curp || 'No disponible',
          Nombres: detalle.person.nombres || 'No disponible',
          PrimerApellido: detalle.person.primerApellido || 'No disponible',
          SegundoApellido: detalle.person.segundoApellido || 'No disponible',
        }
      : null,
    TrackingCode: detalle.trackingCode || detalle.TrackingCode || null,
    ID: detalle.id || detalle.ID || null,
    // Campos adicionales útiles
    Proceso: detalle.process,
    Hora: detalle.hora || 'No especificada',
  }))

  // 🎯 Combinar filtros del padre con filtros específicos del tipo
  const filtrosFinales = {
    ...props.filtros,
    ...filtrosEspecificos,
  }

  console.log(`🎯 Abriendo consola para ${tipo}:`, {
    datos: datos.length,
    titulo,
    filtrosEspecificos,
    filtrosFinales,
  })

  // 🔥 Log para mostrar códigos de error y tokens desde KPIs
  const codigosKPI = logsFormateados.filter((log) => log.ErrorCode !== 'N/A').length
  const tokensKPI = logsFormateados.filter((log) => log.SessionToken !== 'No disponible').length
  console.log(
    `🔥 KPI ${tipo.toUpperCase()}: ${codigosKPI} códigos de error, ${tokensKPI} session tokens`
  )

  consolaRef.value.abrirConsola(logsFormateados, titulo, filtrosFinales)
}

// Configuraciones de Chart.js con tooltips mejorados
const getChartConfig = (type, data, detalles) => {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 30, 47, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3f51b5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `📅 ${context[0].label}`
          },
          label: (context) => {
            const value = context.raw
            const label = context.dataset.label

            if (type === 'tiempos') {
              return `⏱️ ${label}: ${value.toFixed(2)} segundos promedio`
            } else {
              return `📊 ${label}: ${value} ${type === 'escaneos' ? 'escaneos' : 'exportaciones'}`
            }
          },
          afterBody: (context) => {
            const fecha = context[0].label
            const detallesFecha = detalles.filter((d) => d.fecha === fecha)

            if (detallesFecha.length > 0 && type !== 'tiempos') {
              const sample = detallesFecha.slice(0, 3)
              return sample
                .map((d) => {
                  // Función helper para obtener nombre de oficina
                  const obtenerNombreOficina = (oficina) => {
                    if (!oficina) return 'N/A'
                    if (typeof oficina === 'string') return oficina
                    if (typeof oficina === 'object') {
                      return (
                        oficina.nombre ||
                        oficina.Nombre ||
                        oficina.descripcion ||
                        oficina.Descripcion ||
                        'Sin nombre'
                      )
                    }
                    return 'N/A'
                  }

                  const oficinaNombre = obtenerNombreOficina(d.oficina)
                  return `🕐 ${d.hora} - ${oficinaNombre}`
                })
                .join('\n')
            }
            return ''
          },
          footer: () => {
            return '💡 Haz click en un punto para ver los logs detallados'
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedElement = elements[0]
        const fecha = data.categorias[clickedElement.index]
        console.log(detalles)
        abrirConsolaConDatos(fecha, type, detalles)
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fechas',
          font: { weight: 'bold' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 0,
          autoSkipPadding: 15,
          font: {
            size: 11,
          },
          callback: function (value) {
            const fecha = this.getLabelForValue(value)
            try {
              const date = new Date(fecha)
              return date.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              })
            } catch {
              return fecha
            }
          },
        },
      },
      y: {
        title: {
          display: true,
          text: type === 'tiempos' ? 'Tiempo (segundos)' : 'Cantidad',
          font: { weight: 'bold' },
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  if (type === 'exportaciones' || type === 'escaneos') {
    return {
      type: 'bar',
      data: {
        labels: data.categorias,
        datasets: data.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: serie.backgroundColor,
          borderColor: serie.borderColor,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        })),
      },
      options: baseConfig,
    }
  } else if (type === 'tiempos') {
    return {
      type: 'line',
      data: {
        labels: data.categorias,
        datasets: data.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: serie.backgroundColor + '20',
          borderColor: serie.borderColor,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: serie.borderColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        })),
      },
      options: {
        ...baseConfig,
        elements: {
          point: {
            hoverBackgroundColor: '#ffffff',
          },
        },
      },
    }
  }
}

// Funciones para crear gráficas
const crearGraficaExportaciones = async (filtros = null) => {
  if (!exportacionesChart.value) {
    console.log('❌ No hay referencia al canvas de exportaciones')
    return
  }

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  console.log('🔄 Creando gráfica de exportaciones con filtros:', filtrosAUsar)
  loadingExportaciones.value = true
  try {
    const data = await ChartDataService.getExportacionesData(filtrosAUsar)
    console.log('📊 Datos obtenidos para exportaciones:', data)
    datosExportaciones.value = data

    // Mostrar notificación apropiada según el estado de los datos
    if (data.isEmpty) {
      console.log('⚠️ Datos vacíos para exportaciones - destruyendo gráfica anterior')
      // Destruir gráfica anterior para mostrar estado vacío
      if (chartInstances.value.exportaciones) {
        chartInstances.value.exportaciones.destroy()
        chartInstances.value.exportaciones = null
      }
      $q.notify({
        type: 'info',
        message: 'Sin datos de Exportaciones',
        caption: 'No se encontraron exportaciones para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (data.esDatosDeMuestra) {
      console.log('⚠️ Mostrando datos de muestra para exportaciones')
      $q.notify({
        type: 'warning',
        message: 'Datos de Exportaciones',
        caption: 'Mostrando datos de ejemplo - No hay datos reales para el período seleccionado',
        icon: 'warning',
        position: 'top-right',
        timeout: 4000,
      })
    }

    console.log('🗑️ Destruyendo gráfica anterior de exportaciones')
    if (chartInstances.value.exportaciones) {
      chartInstances.value.exportaciones.destroy()
    }

    console.log('📈 Creando nueva gráfica de exportaciones con datos:', data.series)
    const config = getChartConfig('exportaciones', data, data.detalles)
    chartInstances.value.exportaciones = new Chart(exportacionesChart.value, config)
    console.log('✅ Gráfica de exportaciones creada exitosamente')
  } catch (error) {
    console.error('❌ Error creando gráfica de exportaciones:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de exportaciones',
      position: 'top-right',
    })
  } finally {
    loadingExportaciones.value = false
  }
}

const crearGraficaTiempos = async (filtros = null) => {
  if (!tiemposChart.value) return

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  loadingTiempos.value = true
  try {
    const data = await ChartDataService.getTiemposData(filtrosAUsar)
    datosTiempos.value = data

    // Notificar sobre el estado de los datos
    if (data.isEmpty) {
      console.log('⚠️ Datos vacíos para tiempos - destruyendo gráfica anterior')
      // Destruir gráfica anterior para mostrar estado vacío
      if (chartInstances.value.tiempos) {
        chartInstances.value.tiempos.destroy()
        chartInstances.value.tiempos = null
      }
      $q.notify({
        type: 'info',
        message: 'Sin datos de Tiempos',
        caption: 'No se encontraron datos de tiempos para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (!data.series || data.series.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Tiempos',
        caption: 'No se encontraron datos de tiempos para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    }

    if (chartInstances.value.tiempos) {
      chartInstances.value.tiempos.destroy()
    }

    const config = getChartConfig('tiempos', data, data.detalles)
    chartInstances.value.tiempos = new Chart(tiemposChart.value, config)
  } catch (error) {
    console.error('Error creando gráfica de tiempos:', error)
  } finally {
    loadingTiempos.value = false
  }
}

const crearGraficaEscaneos = async (filtros = null) => {
  if (!escaneosChart.value) return

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  loadingEscaneos.value = true
  try {
    const data = await ChartDataService.getEscaneosData(filtrosAUsar)
    datosEscaneos.value = data

    // Notificar sobre el estado de los datos
    if (data.isEmpty) {
      console.log('⚠️ Datos vacíos para escaneos - destruyendo gráfica anterior')
      // Destruir gráfica anterior para mostrar estado vacío
      if (chartInstances.value.escaneos) {
        chartInstances.value.escaneos.destroy()
        chartInstances.value.escaneos = null
      }
      $q.notify({
        type: 'info',
        message: 'Sin datos de Escaneos',
        caption: 'No se encontraron datos de escaneos para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (!data.series || data.series.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Escaneos',
        caption: 'No se encontraron datos de escaneos para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    }

    if (chartInstances.value.escaneos) {
      chartInstances.value.escaneos.destroy()
    }

    const config = getChartConfig('escaneos', data, data.detalles)
    chartInstances.value.escaneos = new Chart(escaneosChart.value, config)
  } catch (error) {
    console.error('Error creando gráfica de escaneos:', error)
  } finally {
    loadingEscaneos.value = false
  }
}

// Función para crear gráfica de login
const crearGraficaLogin = async (filtros = null) => {
  if (!loginChart.value) return

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  loadingLogin.value = true
  try {
    if (chartInstances.value.login) {
      chartInstances.value.login.destroy()
    }

    datosLogin.value = await ChartDataService.getLoginData(filtrosAUsar)
    console.log('Datos login recibidos:', datosLogin.value)

    // Notificar sobre el estado de los datos
    if (datosLogin.value.isEmpty) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Login',
        caption: 'No se encontraron logins para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (datosLogin.value.esDatosDeMuestra) {
      $q.notify({
        type: 'warning',
        message: 'Datos de Login',
        caption: 'Mostrando datos de ejemplo - No hay datos reales para el período seleccionado',
        icon: 'warning',
        position: 'top-right',
        timeout: 4000,
      })
    } else if (!datosLogin.value.series || datosLogin.value.series.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Login',
        caption: 'No se encontraron logins para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    }

    const config = {
      type: 'line',
      data: {
        labels: datosLogin.value.categorias,
        datasets: datosLogin.value.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: serie.backgroundColor,
          borderColor: serie.borderColor,
          pointBackgroundColor: serie.pointBackgroundColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: false,
          borderWidth: 3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12, weight: 'bold' },
              color: '#ffffff',
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#4CAF50',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => `📅 ${context[0].label}`,
              label: (context) => {
                const value = context.raw
                const label = context.dataset.label
                const icon = label === 'Exitosos' ? '✅' : '❌'
                return `${icon} ${label}: ${value} logins`
              },
              afterBody: (context) => {
                const fecha = context[0].label
                const detallesFecha = datosLogin.value.detalles.filter((d) => d.fecha === fecha)
                if (detallesFecha.length > 0) {
                  const sample = detallesFecha.slice(0, 2)
                  return sample
                    .map((d) => {
                      const oficinaNombre =
                        typeof d.oficina === 'string' ? d.oficina : d.oficina?.nombre || 'N/A'
                      return `🕐 ${d.hora} - ${oficinaNombre}`
                    })
                    .join('\n')
                }
                return '💡 Haz click en un punto para ver los logs detallados'
              },
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const clickedElement = elements[0]
            const fecha = datosLogin.value.categorias[clickedElement.index]
            abrirConsolaConDatos(fecha, 'login', datosLogin.value.detalles)
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fechas',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              font: { size: 11 },
              callback: function (value) {
                const label = this.getLabelForValue(value)
                // Mostrar formato de fecha más corto
                if (label) {
                  const date = new Date(label)
                  return date.toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                return label
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Número de Logins',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              stepSize: 1,
              font: { size: 11 },
            },
          },
        },
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart',
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    }

    chartInstances.value.login = new Chart(loginChart.value, config)
  } catch (error) {
    console.error('Error creando gráfica de login:', error)
  } finally {
    loadingLogin.value = false
  }
}

// Función para crear gráfica de registro
const crearGraficaRegistro = async (filtros = null) => {
  if (!registroChart.value) return

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  loadingRegistro.value = true
  try {
    if (chartInstances.value.registro) {
      chartInstances.value.registro.destroy()
    }

    datosRegistro.value = await ChartDataService.getRegistroData(filtrosAUsar)
    console.log('Datos registro recibidos:', datosRegistro.value)

    // Notificar sobre el estado de los datos
    if (datosRegistro.value.isEmpty) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Registro',
        caption: 'No se encontraron registros para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (datosRegistro.value.esDatosDeMuestra) {
      $q.notify({
        type: 'warning',
        message: 'Datos de Registro',
        caption: 'Mostrando datos de ejemplo - No hay datos reales para el período seleccionado',
        icon: 'warning',
        position: 'top-right',
        timeout: 4000,
      })
    } else if (!datosRegistro.value.series || datosRegistro.value.series.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Registro',
        caption: 'No se encontraron registros para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    }

    const config = {
      type: 'bar',
      data: {
        labels: datosRegistro.value.categorias,
        datasets: datosRegistro.value.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: serie.backgroundColor,
          borderColor: serie.borderColor,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12, weight: 'bold' },
              color: '#ffffff',
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#2196F3',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => `📅 ${context[0].label}`,
              label: (context) => {
                const value = context.raw
                const label = context.dataset.label
                const icon = label === 'Exitosos' ? '✅' : '📝'
                return `${icon} ${label}: ${value} registros`
              },
              afterBody: (context) => {
                const fecha = context[0].label
                const detallesFecha = datosRegistro.value.detalles.filter((d) => d.fecha === fecha)
                if (detallesFecha.length > 0) {
                  const sample = detallesFecha.slice(0, 2)
                  return sample
                    .map((d) => {
                      const oficinaNombre =
                        typeof d.oficina === 'string' ? d.oficina : d.oficina?.nombre || 'N/A'
                      return `🕐 ${d.hora} - ${oficinaNombre}`
                    })
                    .join('\n')
                }
                return '💡 Haz click en una barra para ver los logs detallados'
              },
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const clickedElement = elements[0]
            const fecha = datosRegistro.value.categorias[clickedElement.index]
            abrirConsolaConDatos(fecha, 'registro', datosRegistro.value.detalles)
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fechas',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              font: { size: 11 },
              callback: function (value) {
                const label = this.getLabelForValue(value)
                // Mostrar formato de fecha más corto
                if (label) {
                  const date = new Date(label)
                  return date.toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                return label
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Número de Registros',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              stepSize: 1,
              font: { size: 11 },
            },
          },
        },
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart',
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    }

    chartInstances.value.registro = new Chart(registroChart.value, config)
  } catch (error) {
    console.error('Error creando gráfica de registro:', error)
  } finally {
    loadingRegistro.value = false
  }
}

// Función para crear gráfica de errores
const crearGraficaErrores = async (filtros = null) => {
  if (!erroresChart.value) return

  const filtrosAUsar = filtros || { ...props.filtros, ...filtrosGlobales.value }
  loadingErrores.value = true
  try {
    if (chartInstances.value.errores) {
      chartInstances.value.errores.destroy()
    }

    datosErrores.value = await ChartDataService.getErroresData(filtrosAUsar)
    console.log('Datos errores recibidos:', datosErrores.value)

    // Notificar sobre el estado de los datos
    if (datosErrores.value.isEmpty) {
      console.log('⚠️ Datos vacíos para errores')
      $q.notify({
        type: 'info',
        message: 'Sin datos de Errores',
        caption: 'No se encontraron errores para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    } else if (datosErrores.value.esDatosDeMuestra) {
      $q.notify({
        type: 'warning',
        message: 'Datos de Errores',
        caption: 'Mostrando datos de ejemplo - No hay datos reales para el período seleccionado',
        icon: 'warning',
        position: 'top-right',
        timeout: 4000,
      })
    } else if (!datosErrores.value.series || datosErrores.value.series.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Sin datos de Errores',
        caption: 'No se encontraron errores para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return // No crear gráfica si no hay datos
    }

    const config = {
      type: 'line',
      data: {
        labels: datosErrores.value.categorias,
        datasets: datosErrores.value.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          borderColor: serie.borderColor,
          pointBackgroundColor: '#F44336',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12, weight: 'bold' },
              color: '#ffffff',
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#F44336',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => `📅 ${context[0].label}`,
              label: (context) => {
                const value = context.raw
                return `🚨 Errores: ${value} incidencias`
              },
              afterBody: (context) => {
                const fecha = context[0].label
                const detallesFecha = datosErrores.value.detalles.filter((d) => d.fecha === fecha)
                if (detallesFecha.length > 0) {
                  const sample = detallesFecha.slice(0, 2)
                  return sample.map((d) => `🕐 ${d.hora} - ${d.proceso}`).join('\n')
                }
                return '💡 Haz click en un punto para ver los logs detallados'
              },
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const clickedElement = elements[0]
            const fecha = datosErrores.value.categorias[clickedElement.index]
            abrirConsolaConDatos(fecha, 'errores', datosErrores.value.detalles)
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fechas',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              maxTicksLimit: 10,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 15,
              font: { size: 12 },
              callback: function (value) {
                const label = this.getLabelForValue(value)
                // Mostrar formato de fecha más corto
                if (label) {
                  const date = new Date(label)
                  return date.toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                return label
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Número de Errores',
              font: { weight: 'bold', size: 14 },
              color: '#ffffff',
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: true,
            },
            ticks: {
              color: '#ffffff',
              stepSize: 1,
              font: { size: 12 },
            },
          },
        },
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart',
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    }

    chartInstances.value.errores = new Chart(erroresChart.value, config)
  } catch (error) {
    console.error('Error creando gráfica de errores:', error)
  } finally {
    loadingErrores.value = false
  }
}

// Función para abrir la consola con datos específicos de un punto de la gráfica
const abrirConsolaConDatos = (fecha, tipoGrafica, detalles) => {
  console.log('🎯 CLICK DETECTADO EN GRÁFICA:', { fecha, tipoGrafica, detalles: detalles?.length })
  console.log('📋 MUESTRA DE DATOS RECIBIDOS:', detalles?.slice(0, 2))

  // 🔍 Log para ver todos los campos disponibles en los datos de la API
  if (detalles && detalles.length > 0) {
    console.log('🔍 CAMPOS DISPONIBLES EN DATOS DE API:', Object.keys(detalles[0]))
    console.log('🔍 DETALLE PRIMER ITEM DE API:', detalles[0])
  }

  if (!consolaRef.value) {
    console.warn('❌ Referencia de consola no disponible')
    return
  }

  // Filtrar los logs de la fecha específica
  const logsFecha = detalles.filter((detalle) => detalle.fecha === fecha)
  console.log(`📊 Logs encontrados para ${fecha}:`, logsFecha.length)
  console.log('🔍 DETALLE DE LOGS FILTRADOS:', logsFecha.slice(0, 2))

  if (logsFecha.length === 0) {
    // Si no hay logs específicos de esa fecha, mostrar mensaje
    const mensajeNoData = [
      {
        Date: fecha,
        Type: 'INFO',
        Process: tipoGrafica.toUpperCase(),
        Message: `No se encontraron logs detallados para esta fecha en ${tipoGrafica}`,
        Oficina: { Nombre: 'Sistema' },
        Usuario: 'Sistema',
        Dispositivo: 'N/A',
      },
    ]

    consolaRef.value.abrirConsola(
      mensajeNoData,
      `${tipoGrafica} - ${fecha} (Sin datos detallados)`,
      props.filtros
    )
    return
  }
  console.log(logsFecha, 'logsFecha')
  // Convertir los detalles al formato esperado por la consola con información completa
  const logsFormateados = logsFecha.map((detalle) => ({
    Date: detalle.fechaCompleta || detalle.fecha,
    Type: detalle.type,
    type: detalle.type,
    Process: detalle.process,
    Message: detalle.message || detalle.Message || `Evento de ${tipoGrafica}`,
    Oficina: {
      Nombre:
        (typeof detalle.oficina === 'string' ? detalle.oficina : detalle.oficina?.nombre) ||
        'No especificada',
      Direccion: detalle.oficina?.direccion || detalle.Oficina?.Direccion || 'No especificada',
    },
    Usuario:
      detalle.usuario ||
      detalle.Usuario ||
      detalle.person?.curp ||
      detalle.person?.nombres ||
      'No especificado',
    Dispositivo: detalle.device || detalle.Dispositivo || detalle.device || 'No especificado',
    Escaner: detalle.scanDevice,
    // 🔥 CAMPOS EXACTOS COMO EN LA CONSOLA DEL NAVBAR 🔥
    ErrorCode: detalle.errorCode,
    SessionToken: detalle.sessionToken,
    // Información adicional para mejor contexto
    PersonaCompleta: detalle.person
      ? {
          CURP: detalle.person.curp || 'No disponible',
          Nombres: detalle.person.nombres || 'No disponible',
          PrimerApellido: detalle.person.primerApellido || 'No disponible',
          SegundoApellido: detalle.person.segundoApellido || 'No disponible',
        }
      : null,
    TrackingCode: detalle.trackingCode || detalle.TrackingCode || null,
    ID: detalle.id || detalle.ID || null,
    // Campos adicionales útiles
    Proceso: detalle.process || detalle.Process || 'No especificado',
    Hora: detalle.hora || 'No especificada',
  }))

  console.log('🔄 LOGS FORMATEADOS PARA CONSOLA:', logsFormateados.slice(0, 2))
  console.log('📋 CAMPOS DISPONIBLES EN PRIMER LOG:', Object.keys(logsFormateados[0] || {}))

  // 🔥 Log especial para mostrar códigos de error y session tokens de la API
  console.log(
    '🎯 CÓDIGOS DE ERROR Y TOKENS DESDE API:',
    logsFormateados.map((log) => ({
      fecha: log.Date,
      tipo: log.Type,
      codigoError: log.ErrorCode,
      tokenSesion: log.SessionToken,
    }))
  )

  // Mostrar resumen de datos encontrados
  const codigosEncontrados = logsFormateados.filter(
    (log) => log['Código de Error'] !== 'N/A'
  ).length
  const tokensEncontrados = logsFormateados.filter(
    (log) => log['Token de Sesión'] !== 'No disponible'
  ).length
  console.log(
    `🔍 RESUMEN: ${codigosEncontrados} códigos de error, ${tokensEncontrados} session tokens encontrados`
  )

  // Determinar el título del filtro
  const tipoLabel =
    {
      login: 'Autenticación',
      registro: 'Registros',
      errores: 'Errores del Sistema',
      escaneos: 'Escaneos',
      exportaciones: 'Exportaciones',
      tiempos: 'Tiempos de Respuesta',
    }[tipoGrafica] || tipoGrafica

  const filtroTexto = `${tipoLabel} - ${fecha} (${logsFormateados.length} registros)`

  // 🎯 Crear filtros específicos basados en el tipo de gráfica
  let filtrosEspecificos = {}
  switch (tipoGrafica) {
    case 'login':
      filtrosEspecificos = { proceso: 'LOGIN' }
      break
    case 'errores':
      filtrosEspecificos = { tipoLog: 'ERROR' }
      break
    case 'exportaciones':
      filtrosEspecificos = { tipoLog: 'EXPORT' }
      break
    case 'escaneos':
      filtrosEspecificos = {
        // Los escaneos pueden incluir múltiples tipos: START, END, FIN
        proceso: 'INE', // Principalmente INE, puede ser PASSPORT también
      }
      break
    case 'registro':
      filtrosEspecificos = { proceso: 'REGISTER' }
      break
  }

  // Combinar filtros originales con específicos
  const filtrosFinales = {
    ...props.filtros,
    ...filtrosEspecificos,
  }

  // Abrir la consola con los datos filtrados Y los filtros específicos
  consolaRef.value.abrirConsola(logsFormateados, filtroTexto, filtrosFinales)
}

// Función para actualizar todas las gráficas
const actualizarGraficas = async (filtrosPersonalizados = null) => {
  const filtrosAUsar = filtrosPersonalizados || { ...props.filtros, ...filtrosGlobales.value }
  console.log('🔄 ACTUALIZANDO GRÁFICAS CON FILTROS:', filtrosAUsar)

  await nextTick()
  await Promise.all([
    crearGraficaExportaciones(filtrosAUsar),
    crearGraficaTiempos(filtrosAUsar),
    crearGraficaEscaneos(filtrosAUsar),
    crearGraficaLogin(filtrosAUsar),
    crearGraficaRegistro(filtrosAUsar),
    crearGraficaErrores(filtrosAUsar),
  ])
  console.log('✅ GRÁFICAS ACTUALIZADAS COMPLETAMENTE')
}

// Función de debug temporal
const debugActualizarGraficas = () => {
  console.log('🐛 DEBUG: Forzando actualización de gráficas')
  actualizarGraficas()
}

// Exponer función de debug globalmente (temporal)
if (typeof window !== 'undefined') {
  window.debugActualizarGraficas = debugActualizarGraficas
}

// Limpiar gráficas
const limpiarGraficas = () => {
  Object.values(chartInstances.value).forEach((chart) => {
    if (chart) chart.destroy()
  })
  chartInstances.value = {
    exportaciones: null,
    tiempos: null,
    escaneos: null,
    login: null,
    registro: null,
    errores: null,
  }
}

// Watchers
watch(
  [() => props.filtros, () => filtrosGlobales.value],
  async ([newFiltros, newFiltrosGlobales]) => {
    console.log('🔄 WATCHER: Filtros cambiaron en EscritorioGraficasEnhanced')
    console.log('📋 Props filtros:', newFiltros)
    console.log('🌐 Filtros globales:', newFiltrosGlobales)

    // Combinar filtros de props y globales
    const filtrosCombinados = { ...newFiltros, ...newFiltrosGlobales }
    console.log('🔀 Filtros combinados:', filtrosCombinados)

    await actualizarGraficas(filtrosCombinados)
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  await nextTick()
  actualizarGraficas()
})

onBeforeUnmount(() => {
  limpiarGraficas()
})
</script>

<style lang="scss" scoped>
.enhanced-graphics-container {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.enhanced-chart-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.chart-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.chart-title {
  .text-h6 {
    margin: 0;
    font-weight: 600;
  }

  .text-caption {
    margin-top: 2px;
    opacity: 0.8;
  }
}

.chart-content {
  padding-top: 20px;
  position: relative;
  min-height: 280px;

  .responsive-canvas {
    max-height: 350px;
    width: 100% !important;
    height: auto !important;
  }

  canvas {
    max-height: 350px;
    width: 100% !important;
    height: auto !important;
  }
}

.chart-loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  z-index: 10;
}

// Responsive breakpoints
@media (max-width: 1024px) {
  .chart-content {
    min-height: 250px;

    canvas,
    .responsive-canvas {
      max-height: 300px;
    }
  }

  .chart-title .text-h6 {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .chart-content {
    min-height: 220px;
    padding-top: 15px;

    canvas,
    .responsive-canvas {
      max-height: 250px;
    }
  }

  .chart-header {
    padding-bottom: 12px;
  }

  .chart-title {
    .text-h6 {
      font-size: 0.9rem;
    }

    .text-caption {
      font-size: 0.75rem;
    }
  }
}

@media (max-width: 480px) {
  .chart-content {
    min-height: 200px;

    canvas,
    .responsive-canvas {
      max-height: 220px;
    }
  }

  .chart-title .text-h6 {
    font-size: 0.8rem;
  }
}

// Mejoras responsive adicionales
@media (min-width: 1024px) and (max-width: 1439px) {
  .enhanced-graphics-container {
    .chart-content {
      min-height: 280px;

      canvas,
      .responsive-canvas {
        max-height: 320px;
      }
    }
  }
}

@media (min-width: 1440px) {
  .enhanced-graphics-container {
    .chart-content {
      min-height: 320px;

      canvas,
      .responsive-canvas {
        max-height: 380px;
      }
    }
  }
}

// Estilos para KPIs
.kpi-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.gradient-blue {
    background: linear-gradient(145deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.1) 100%);
    border-color: rgba(33, 150, 243, 0.3);
  }

  &.gradient-green {
    background: linear-gradient(145deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.1) 100%);
    border-color: rgba(76, 175, 80, 0.3);
  }

  &.gradient-red {
    background: linear-gradient(145deg, rgba(244, 67, 54, 0.2) 0%, rgba(211, 47, 47, 0.1) 100%);
    border-color: rgba(244, 67, 54, 0.3);
  }

  &.gradient-orange {
    background: linear-gradient(145deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
    border-color: rgba(255, 152, 0, 0.3);
  }

  &.gradient-cyan {
    background: linear-gradient(145deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 150, 136, 0.1) 100%);
    border-color: rgba(0, 188, 212, 0.3);
  }
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.kpi-icon {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.kpi-data {
  flex: 1;
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

// Responsive para KPIs
@media (max-width: 768px) {
  .kpi-content {
    gap: 12px;
  }

  .kpi-icon-container {
    width: 48px;
    height: 48px;
  }

  .kpi-icon {
    font-size: 24px;
  }

  .kpi-value {
    font-size: 1.5rem;
  }

  .kpi-title {
    font-size: 0.8rem;
  }

  .kpi-subtitle {
    font-size: 0.7rem;
  }
}

// Estilos específicos por tipo de gráfica
.export-chart {
  background: linear-gradient(145deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
}

.time-chart {
  background: linear-gradient(145deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 235, 59, 0.05) 100%);
}

.scan-chart {
  background: linear-gradient(145deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 150, 136, 0.05) 100%);
}

.login-chart {
  background: linear-gradient(145deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%);
}

.registro-chart {
  background: linear-gradient(145deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
}

.errores-chart {
  background: linear-gradient(145deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%);
}

// Animaciones
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.q-spinner {
  animation: pulse 2s infinite;
}
</style>
