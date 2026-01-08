<template>
  <q-card class="enhanced-graphics-container">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="analytics" size="28px" class="q-mr-sm" color="primary" />
        Dashboard Analítico de Logs
      </div>

      <!-- Primera fila: KPIs Dashboard Mejorados -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- KPI Usuarios Activos -->
        <div class="col-12 col-sm-6 col-lg-3">
          <KPITotalLogs
            :totalLogs="totalEmitidos"
            :tiposDatos="'emitidos'"
            @click="abrirConsolaGeneral('login')"
          />
        </div>
        <!-- KPI Errores -->
        <div class="col-12 col-sm-6 col-lg-3">
          <KPITotalLogs
            :totalLogs="totalRechazados"
            :tiposDatos="'rechazados'"
            @click="abrirConsolaGeneral('errores')"
          />
        </div>
        <!-- KPI Escaneos -->
        <div class="col-12 col-sm-6 col-lg-3">
          <KPITotalLogs
            :totalLogs="totalCancelados"
            :tiposDatos="'cancelados'"
            @click="abrirConsolaGeneral('escaneos')"
          />
        </div>
        <!-- KPI Total de Logs -->
        <div class="col-12 col-sm-6 col-lg-3">
          <KPITotalLogs
            :totalLogs="totalEnTramite"
            :tiposDatos="'enTramite'"
            @click="abrirConsolaGeneral('todos')"
          />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Gráfica de Summary -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card summary-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="description" size="24px" class="q-mr-sm text-blue-6" />
                <div class="chart-title">
                  <p class="text-h6">Evolución de Trámites</p>
                  <p class="text-caption text-grey-6">Comportamiento diario por estatus</p>
                </div>
                <q-space />
                <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="totalGeneralPasaportes > 0"
                    color="blue"
                    text-color="white"
                    size="sm"
                    icon="analytics"
                  >
                    {{ totalGeneralPasaportes }} trámites
                  </q-chip>
                  <q-chip v-else color="grey" text-color="white" size="sm" icon="info">
                    Sin datos
                  </q-chip>
                  <q-spinner v-if="loadGeneralPasaportes" color="blue" size="20px" />
                </div>
              </div>
            </q-card-section>

            <q-card-section class="chart-content">
              <canvas ref="canvaTotalPasaportes" class="responsive-canvas" height="320"></canvas>

              <div v-if="loadGeneralPasaportes" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="blue" />
                <div class="q-mt-sm">Cargando histórico de pasaportes...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de Oficinas -->
        <div class="col-12 col-lg-6">
          <q-card class="enhanced-chart-card tramites-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="business" size="24px" class="q-mr-sm text-indigo-6" />

                <div class="chart-title">
                  <div class="text-h6">Trámites por Oficina</div>
                  <div class="text-caption text-grey-6">Distribución de estatus por sede</div>
                </div>

                <q-space />

                <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="totalTramitesOficinas > 0"
                    color="indigo"
                    text-color="white"
                    size="sm"
                    icon="folder_shared"
                  >
                    {{ totalTramitesOficinas }} trámites
                  </q-chip>

                  <q-chip
                    v-else-if="!loadingOficinas"
                    color="grey"
                    text-color="white"
                    size="sm"
                    icon="info"
                  >
                    Sin datos
                  </q-chip>

                  <q-spinner v-if="loadingOficinas" color="indigo" size="20px" />
                </div>
              </div>
            </q-card-section>

            <q-card-section class="chart-content">
              <canvas ref="canvasOficinas" class="responsive-canvas" height="320"></canvas>

              <div v-if="loadingOficinas" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="indigo" />
                <div class="q-mt-sm">Cargando datos por oficina...</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfica de información de pasaportes por PROCESO -->
        <div class="col-12">
          <q-card class="enhanced-chart-card time-chart">
            <q-card-section class="chart-header">
              <div class="row items-center">
                <q-icon name="settings" size="24px" class="q-mr-sm text-amber-6" />
                <div class="chart-title">
                  <div class="text-h6">Trámites</div>
                  <div class="text-caption text-grey-6">Totales de los procesos por tipo de trámite</div>
                </div>
                <q-space />
                <div class="row q-gutter-xs">
                  <div class="row items-center q-gutter-xs">
                  <q-chip
                    v-if="totalProcesos > 0"
                    color="indigo"
                    text-color="white"
                    size="sm"
                    icon="folder_shared"
                  >
                    {{ totalProcesos }} procesos
                  </q-chip>
                  <q-chip
                    v-else-if="!loadingProcesos"
                    color="grey"
                    text-color="white"
                    size="sm"
                    icon="info"
                  >
                    Sin datos
                  </q-chip>
                  <q-spinner v-if="loadingProcesos" color="indigo" size="20px" />
                </div>
                </div>
                <q-spinner v-if="loadingProcesos" color="amber" size="20px" class="q-ml-sm" />
              </div>
            </q-card-section>
            <q-card-section class="chart-content">
              <canvas ref="canvasProcesos" class="responsive-canvas" height="320"></canvas>
              <div v-if="loadingProcesos" class="chart-loading-overlay">
                <q-spinner-ios size="40px" color="indigo" />
                <div class="q-mt-sm">Cargando datos por trámite...</div>
              </div>
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
import KPITotalLogs from '../blocks/KPITotalLogs.vue'

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

const loading = ref(false)

// Referencias de canvas
const escaneosChart = ref(null)
const canvaTotalPasaportes = ref(null)
const canvasOficinas = ref(null)
const canvasProcesos = ref(null)
const erroresChart = ref(null)

//  Constantes para el almacenamiento del array "data"
const datosOficinas = ref([])
const datosProcesos = ref([])

// Referencia de la consola
const consolaRef = ref(null)

// Instancias de Chart.js
const chartInstances = ref({
  pasaportes: null,
  oficinas: null,
  procesos: null,
  exportaciones: null,
  tiempos: null,
  escaneos: null,
  login: null,
  registro: null,
  errores: null,
})

// Estados de loading
const loadingExportaciones = ref(false)
const loadingProcesos = ref(false)
const loadingEscaneos = ref(false)
const loadGeneralPasaportes = ref(false)
const loadingOficinas = ref(false)
const loadingErrores = ref(false)

// Datos procesados
const datosEscaneos = ref({ series: [], categorias: [], detalles: [] })
const datosLogin = ref({ series: [], categorias: [], detalles: [] })
const datosRegistro = ref({ series: [], categorias: [], detalles: [] })
const datosErrores = ref({ series: [], categorias: [], detalles: [] })

// Datos procesados - summary
const resumenPasaportes = ref({
  emitidos: 0,
  enTramite: 0,
  rechazados: 0,
  cancelados: 0,
})

// Computed para loading general
const loadingGeneral = computed(
  () =>
    loadingExportaciones.value ||
    loadingProcesos.value ||
    loadingEscaneos.value ||
    loadGeneralPasaportes.value ||
    loadingOficinas.value ||
    loadingErrores.value
)

// Función para consumir el servicio y actualizar el estado
const cargarResumenPasaportes = async () => {
  loading.value = true
  try {
    // Llamamos a tu servicio estático pasando los filtros actuales
    // Nota: Asegúrate de que 'filtros' sea tu objeto reactivo donde guardas fechas, oficina, etc.
    const respuesta = await ChartDataService.getPassportsSummary({
      ...props.filtros,
      ...filtrosGlobales.value,
    })

    if (respuesta && respuesta.data && respuesta.ok) {
      resumenPasaportes.value = respuesta.data.totales
    } else {
      // Valores por defecto si falla o viene vacío
      resumenPasaportes.value = { emitidos: 0, enTramite: 0, rechazados: 0, cancelados: 0 }
    }
  } catch (error) {
    console.error('Error cargando KPIs:', error)
  } finally {
    loading.value = false
  }
}

// Computed Properties para los KPIs individuales (Mapeo directo del JSON)
const totalEmitidos = computed(() => resumenPasaportes.value.emitidos || 0)
const totalEnTramite = computed(() => resumenPasaportes.value.enTramite || 0)
const totalRechazados = computed(() => resumenPasaportes.value.rechazados || 0)
const totalCancelados = computed(() => resumenPasaportes.value.cancelados || 0)

// Computed para el TOTAL GENERAL (Suma de todos los estatus)
const totalGeneralPasaportes = computed(() => {
  return totalEmitidos.value + totalEnTramite.value + totalRechazados.value + totalCancelados.value
})

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
        // ...(datosExportaciones.value.detalles || []),
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
      // datos = datosExportaciones.value.detalles || []
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
  // console.log('Detalles de exportaciones:', datosExportaciones.value.detalles)

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

// Funciones para crear gráficas
const crearGraficaPasaportes = async () => {
  if (!canvaTotalPasaportes.value) return

  loadGeneralPasaportes.value = true

  try {
    // 1. Limpiar gráfica anterior si existe
    if (chartInstances.value.pasaportes) {
      chartInstances.value.pasaportes.destroy()
    }

    // 2. Obtener los datos (asumiendo que 'resumenPasaportes' ya tiene la data del endpoint anterior)
    const datosRaw = await ChartDataService.getPassportsSummary(filtrosGlobales.value)
    console.log('✅ Datos de la gráficaPasaportes', datosRaw.data.porDia)

    // Validación si no hay datos
    if (datosRaw.data.porDia.length === 0) {
      // Opcional: Mostrar notificación o dejar gráfica vacía
      $q.notify({
        type: 'info',
        message: 'Sin datos del comportamiento por estatus',
        caption: 'No se encontraron exportaciones para el período seleccionado',
        icon: 'info',
        position: 'top-right',
        timeout: 3000,
      })
      return
    }

    // 3. Preparar Labels (Eje X) y Datasets (Eje Y)
    const etiquetas = datosRaw.data.porDia.map((d) => d.fecha) // Eje X: Fechas

    // Configuramos los 4 datasets basados en el objeto
    const datasets = [
      {
        label: 'Emitidos',
        data: datosRaw.data.porDia.map((d) => d.emitidos),
        borderColor: '#4CAF50', // Verde
        backgroundColor: '#4CAF50',
        pointBackgroundColor: '#4CAF50',
        tension: 0.4,
      },
      {
        label: 'En Trámite',
        data: datosRaw.data.porDia.map((d) => d.enTramite),
        borderColor: '#2196F3', // Azul
        backgroundColor: '#2196F3',
        pointBackgroundColor: '#2196F3',
        tension: 0.4,
      },
      {
        label: 'Rechazados',
        data: datosRaw.data.porDia.map((d) => d.rechazados),
        borderColor: '#F44336', // Rojo
        backgroundColor: '#F44336',
        pointBackgroundColor: '#F44336',
        tension: 0.4,
      },
      {
        label: 'Cancelados',
        data: datosRaw.data.porDia.map((d) => d.cancelados),
        borderColor: '#9E9E9E', // Gris
        backgroundColor: '#9E9E9E',
        pointBackgroundColor: '#9E9E9E',
        tension: 0.4,
        borderDash: [5, 5], // Línea punteada para cancelados
      },
    ]

    // 4. Configuración de Chart.js
    const config = {
      type: 'line',
      data: {
        labels: etiquetas,
        // Agregamos estilos comunes a todos los datasets
        datasets: datasets.map((ds) => ({
          ...ds,
          fill: false,
          borderWidth: 2,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
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
              padding: 15,
              font: { size: 11 },
              color: '#ffffff', // Ajustar según tu tema (oscuro/claro)
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#2196F3',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => `📅 ${context[0].label}`,
              label: (context) => {
                const value = context.raw
                const label = context.dataset.label
                let icon = '📄'
                if (label === 'Emitidos') icon = '✅'
                if (label === 'Rechazados') icon = '❌'
                if (label === 'En Trámite') icon = '⏳'
                if (label === 'Cancelados') icon = '🚫'

                return `${icon} ${label}: ${value}`
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha de Registro',
              font: { weight: 'bold', size: 12 },
              color: '#666',
            },
            grid: {
              display: false, // Más limpio sin grid vertical
            },
            ticks: {
              color: '#666',
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              callback: function (value) {
                const label = this.getLabelForValue(value)
                if (label) {
                  // Formato corto: 15 Mar
                  const date = new Date(label)
                  // Ajuste zona horaria simple para visualización
                  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
                  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                }
                return label
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Cantidad de Trámites',
              font: { weight: 'bold', size: 12 },
              color: '#666',
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              borderDash: [5, 5],
            },
            ticks: {
              color: '#666',
              stepSize: 1, // Solo números enteros para pasaportes
              font: { size: 11 },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index', // Muestra tooltips de todas las series al pasar por el eje X
        },
      },
    }

    // 5. Crear la instancia
    chartInstances.value.pasaportes = new Chart(canvaTotalPasaportes.value, config)
  } catch (error) {
    console.error('Error creando gráfica de pasaportes:', error)
  } finally {
    loadGeneralPasaportes.value = false
  }
}

// Función para crear gráfica de Oficinas
const crearGraficaOficinas = async (filtros = null) => {
  if (!canvasOficinas.value) return

  loadingOficinas.value = true

  try {
    // 1. Limpieza de instancia previa
    if (chartInstances.value.oficinas) {
      chartInstances.value.oficinas.destroy()
    }

    // 2. Obtención de datos
    const respuesta = await ChartDataService.getPassportsByOffice(filtros)
    datosOficinas.value = respuesta || []

    // 3. Validaciones
    if (!datosOficinas.value || datosOficinas.value.length === 0) {
      return
    }

    // -----------------------------------------------------------
    // PASO A: FILTRADO POR OFICINA (Define las columnas / Eje X)
    // -----------------------------------------------------------
    const oficinaFiltroId = filtros?.oficina?.value
    console.log('ℹ️ Filtros activos: ', filtros)

    // Si hay oficina seleccionada, filtramos el array. Si no, usamos todos.
    const datosFinales = oficinaFiltroId
      ? datosOficinas.value.filter(d => d.officeId === oficinaFiltroId)
      : datosOficinas.value

    // Generamos las etiquetas del Eje X basadas en los datos YA filtrados
    const etiquetas = datosFinales.map(d => d.officeName)


    // -----------------------------------------------------------
    // PASO B: SELECCIÓN DE ESTATUS (Define las series / Barras)
    // -----------------------------------------------------------

    // Mapa de configuración (Asegúrate que las keys coincidan con filtros.estatus.value)
    const mapaConfiguracion = {
      'EMITIDO':    { keyData: 'emitidos',   label: 'Emitidos',    color: '#4CAF50', border: '#388E3C' },
      'ENTRAMITE':  { keyData: 'enTramite',  label: 'En Trámite',  color: '#2196F3', border: '#1976D2' }, // Verifica si es 'ENTRAMITE' o 'EN_TRAMITE' en tu filtro
      'CANCELADO':  { keyData: 'cancelados', label: 'Cancelados',  color: '#9E9E9E', border: '#616161' },
      'RECHAZADO':  { keyData: 'rechazados', label: 'Rechazados',  color: '#F44336', border: '#D32F2F' },
    }

    const estatusFiltroValue = filtros?.estatus?.value
    let definicionesAUsar = []

    if (estatusFiltroValue && mapaConfiguracion[estatusFiltroValue]) {
      // Si hay estatus seleccionado, solo mostramos esa barra
      definicionesAUsar = [mapaConfiguracion[estatusFiltroValue]]
    } else {
      // Si no, mostramos todas las barras
      definicionesAUsar = Object.values(mapaConfiguracion)
    }

    // -----------------------------------------------------------
    // PASO C: GENERACIÓN DE DATASETS
    // -----------------------------------------------------------
    const datasets = definicionesAUsar.map(config => ({
      label: config.label,
      // IMPORTANTE: Usamos 'datosFinales' (el array filtrado por oficina)
      data: datosFinales.map(d => d[config.keyData]),
      backgroundColor: config.color,
      borderColor: config.border,
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.6
    }))

    // -----------------------------------------------------------
    // PASO D: CONFIGURACIÓN CHART.JS
    // -----------------------------------------------------------
    const config = {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 },
              color: '#ffffff', // Ajusta según tu tema
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#5C6BC0',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              title: (context) => `🏢 ${context[0].label}`,
              label: (context) => {
                const label = context.dataset.label
                const value = context.raw
                if (value === 0) return null
                return ` ${label}: ${value}`
              },
              afterBody: (context) => {
                // CORRECCIÓN CRÍTICA:
                // Usamos 'datosFinales' y no 'datosOficinas.value'
                // para que el índice coincida con la barra que se está mostrando.
                const index = context[0].dataIndex
                const oficina = datosFinales[index]

                if (!oficina) return ''

                const total = (oficina.emitidos || 0) +
                              (oficina.enTramite || 0) +
                              (oficina.rechazados || 0) +
                              (oficina.cancelados || 0)
                return `\n📊 Total Oficina: ${total}`
              }
            }
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false },
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: function(val) {
                const label = this.getLabelForValue(val);
                // Truncado de texto si es muy largo
                return label.length > 15 ? label.substr(0, 15) + '...' : label;
              }
            }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              borderDash: [5, 5]
            },
            ticks: {
              color: '#666',
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Cantidad de Trámites'
            }
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        onClick: (event, elements) => {
           if (elements.length > 0) {
             const index = elements[0].index
             // También usamos datosFinales aquí para obtener la oficina correcta al hacer click
             const oficinaSeleccionada = datosFinales[index]
             console.log('Oficina clickeada:', oficinaSeleccionada.officeName)
           }
        }
      },
    }

    chartInstances.value.oficinas = new Chart(canvasOficinas.value, config)
  } catch (error) {
    console.error('Error creando gráfica de oficinas:', error)
  } finally {
    loadingOficinas.value = false
  }
}

const crearGraficaProceso = async (filtros = null) => {
  if(!canvasProcesos.value) return

  loadingProcesos.value = true

  try {
    //  1. Limpieza de instancia previa
    if(chartInstances.value.procesos) {
      chartInstances.value.procesos.destroy()
    }

    //  2. Obtención de datos
    const respuesta = await ChartDataService.getPassportsByStatus()
    datosProcesos.value = respuesta || []

    //  3. Validaciones
    if(!datosProcesos.value || datosProcesos.value.length === 0) return

    const tramiteFiltro = filtros?.proceso?.value

    //  Si hay proceso seleccionado, filtramos el array. Si no, se usan todos.
    const datosProcesosFiltrado = tramiteFiltro
      ? datosProcesos.value.filter(d => d.tramiteType === tramiteFiltro)
      : datosProcesos.value

    //  Generamos las etiquetas del eje X basadas en los datos YA filtrados
    const etiquetas = datosProcesosFiltrado.map(d => d.tramiteType)

    // Mapa de configuración (Asegúrate que las keys coincidan con filtros.estatus.value)
    const mapaConfiguracion = {
      'EMITIDO':    { keyData: 'emitidos',   label: 'Emitidos',    color: '#4CAF50', border: '#388E3C' },
      'ENTRAMITE':  { keyData: 'enTramite',  label: 'En Trámite',  color: '#2196F3', border: '#1976D2' }, // Verifica si es 'ENTRAMITE' o 'EN_TRAMITE' en tu filtro
      'CANCELADO':  { keyData: 'cancelados', label: 'Cancelados',  color: '#9E9E9E', border: '#616161' },
      'RECHAZADO':  { keyData: 'rechazados', label: 'Rechazados',  color: '#F44336', border: '#D32F2F' },
    }

    const estatusFiltroValue = filtros?.estatus?.value
    let definicionesAUsar = []

    if (estatusFiltroValue && mapaConfiguracion[estatusFiltroValue]) {
      // Si hay estatus seleccionado, solo mostramos esa barra
      definicionesAUsar = [mapaConfiguracion[estatusFiltroValue]]
    } else {
      // Si no, mostramos todas las barras
      definicionesAUsar = Object.values(mapaConfiguracion)
    }

    // -----------------------------------------------------------
    // PASO C: GENERACIÓN DE DATASETS
    // -----------------------------------------------------------
    const datasets = definicionesAUsar.map(config => ({
      label: config.label,
      data: datosProcesosFiltrado.map(d => d[config.keyData]),
      backgroundColor: config.color,
      borderColor: config.border,
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.6
    }))

    // -----------------------------------------------------------
    // PASO D: CONFIGURACIÓN CHART.JS
    // -----------------------------------------------------------
    const config = {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 },
              color: '#ffffff', // Ajusta según tu tema
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 30, 47, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#5C6BC0',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              title: (context) => `🏢 ${context[0].label}`,
              label: (context) => {
                const label = context.dataset.label
                const value = context.raw
                if (value === 0) return null
                return ` ${label}: ${value}`
              },
              afterBody: (context) => {
                const index = context[0].dataIndex
                const proceso = datosProcesos[index]

                if (!proceso) return ''

                const total = (proceso.emitidos || 0) +
                              (proceso.enTramite || 0) +
                              (proceso.rechazados || 0) +
                              (proceso.cancelados || 0)
                return `\n📊 Total Procesos: ${total}`
              }
            }
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false },
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: function(val) {
                const label = this.getLabelForValue(val);
                // Truncado de texto si es muy largo
                return label.length > 15 ? label.substr(0, 15) + '...' : label;
              }
            }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              borderDash: [5, 5]
            },
            ticks: {
              color: '#666',
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Cantidad de Trámites'
            }
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        onClick: (event, elements) => {
           if (elements.length > 0) {
             const index = elements[0].index
             // También usamos datosFinales aquí para obtener la oficina correcta al hacer click
             const procesoSeleccionado = datosProcesos.value[index]
             console.log('Proceso seleccionado:', procesoSeleccionado.tramiteType)
           }
        }
      },
    }

    chartInstances.value.procesos = new Chart(canvasProcesos.value, config)

  } catch (error) {
    console.error('Error creando gráfica de oficinas:', error)
  } finally {
    loadingProcesos.value = false
  }
}

// Función para abrir la consola con datos específicos de un punto de la gráfica
// const abrirConsolaConDatos = (fecha, tipoGrafica, detalles) => {
//   console.log('🎯 CLICK DETECTADO EN GRÁFICA:', { fecha, tipoGrafica, detalles: detalles?.length })
//   console.log('📋 MUESTRA DE DATOS RECIBIDOS:', detalles?.slice(0, 2))

//   // 🔍 Log para ver todos los campos disponibles en los datos de la API
//   if (detalles && detalles.length > 0) {
//     console.log('🔍 CAMPOS DISPONIBLES EN DATOS DE API:', Object.keys(detalles[0]))
//     console.log('🔍 DETALLE PRIMER ITEM DE API:', detalles[0])
//   }

//   if (!consolaRef.value) {
//     console.warn('❌ Referencia de consola no disponible')
//     return
//   }

//   // Filtrar los logs de la fecha específica
//   const logsFecha = detalles.filter((detalle) => detalle.fecha === fecha)
//   console.log(`📊 Logs encontrados para ${fecha}:`, logsFecha.length)
//   console.log('🔍 DETALLE DE LOGS FILTRADOS:', logsFecha.slice(0, 2))

//   if (logsFecha.length === 0) {
//     // Si no hay logs específicos de esa fecha, mostrar mensaje
//     const mensajeNoData = [
//       {
//         Date: fecha,
//         Type: 'INFO',
//         Process: tipoGrafica.toUpperCase(),
//         Message: `No se encontraron logs detallados para esta fecha en ${tipoGrafica}`,
//         Oficina: { Nombre: 'Sistema' },
//         Usuario: 'Sistema',
//         Dispositivo: 'N/A',
//       },
//     ]

//     consolaRef.value.abrirConsola(
//       mensajeNoData,
//       `${tipoGrafica} - ${fecha} (Sin datos detallados)`,
//       props.filtros
//     )
//     return
//   }
//   console.log(logsFecha, 'logsFecha')
//   // Convertir los detalles al formato esperado por la consola con información completa
//   const logsFormateados = logsFecha.map((detalle) => ({
//     Date: detalle.fechaCompleta || detalle.fecha,
//     Type: detalle.type,
//     type: detalle.type,
//     Process: detalle.process,
//     Message: detalle.message || detalle.Message || `Evento de ${tipoGrafica}`,
//     Oficina: {
//       Nombre:
//         (typeof detalle.oficina === 'string' ? detalle.oficina : detalle.oficina?.nombre) ||
//         'No especificada',
//       Direccion: detalle.oficina?.direccion || detalle.Oficina?.Direccion || 'No especificada',
//     },
//     Usuario:
//       detalle.usuario ||
//       detalle.Usuario ||
//       detalle.person?.curp ||
//       detalle.person?.nombres ||
//       'No especificado',
//     Dispositivo: detalle.device || detalle.Dispositivo || detalle.device || 'No especificado',
//     Escaner: detalle.scanDevice,
//     // 🔥 CAMPOS EXACTOS COMO EN LA CONSOLA DEL NAVBAR 🔥
//     ErrorCode: detalle.errorCode,
//     SessionToken: detalle.sessionToken,
//     // Información adicional para mejor contexto
//     PersonaCompleta: detalle.person
//       ? {
//           CURP: detalle.person.curp || 'No disponible',
//           Nombres: detalle.person.nombres || 'No disponible',
//           PrimerApellido: detalle.person.primerApellido || 'No disponible',
//           SegundoApellido: detalle.person.segundoApellido || 'No disponible',
//         }
//       : null,
//     TrackingCode: detalle.trackingCode || detalle.TrackingCode || null,
//     ID: detalle.id || detalle.ID || null,
//     // Campos adicionales útiles
//     Proceso: detalle.process || detalle.Process || 'No especificado',
//     Hora: detalle.hora || 'No especificada',
//   }))

//   console.log('🔄 LOGS FORMATEADOS PARA CONSOLA:', logsFormateados.slice(0, 2))
//   console.log('📋 CAMPOS DISPONIBLES EN PRIMER LOG:', Object.keys(logsFormateados[0] || {}))

//   // 🔥 Log especial para mostrar códigos de error y session tokens de la API
//   console.log(
//     '🎯 CÓDIGOS DE ERROR Y TOKENS DESDE API:',
//     logsFormateados.map((log) => ({
//       fecha: log.Date,
//       tipo: log.Type,
//       codigoError: log.ErrorCode,
//       tokenSesion: log.SessionToken,
//     }))
//   )

//   // Mostrar resumen de datos encontrados
//   const codigosEncontrados = logsFormateados.filter(
//     (log) => log['Código de Error'] !== 'N/A'
//   ).length
//   const tokensEncontrados = logsFormateados.filter(
//     (log) => log['Token de Sesión'] !== 'No disponible'
//   ).length
//   console.log(
//     `🔍 RESUMEN: ${codigosEncontrados} códigos de error, ${tokensEncontrados} session tokens encontrados`
//   )

//   // Determinar el título del filtro
//   const tipoLabel =
//     {
//       login: 'Autenticación',
//       registro: 'Registros',
//       errores: 'Errores del Sistema',
//       escaneos: 'Escaneos',
//       exportaciones: 'Exportaciones',
//       tiempos: 'Tiempos de Respuesta',
//     }[tipoGrafica] || tipoGrafica

//   const filtroTexto = `${tipoLabel} - ${fecha} (${logsFormateados.length} registros)`

//   // 🎯 Crear filtros específicos basados en el tipo de gráfica
//   let filtrosEspecificos = {}
//   switch (tipoGrafica) {
//     case 'login':
//       filtrosEspecificos = { proceso: 'LOGIN' }
//       break
//     case 'errores':
//       filtrosEspecificos = { tipoLog: 'ERROR' }
//       break
//     case 'exportaciones':
//       filtrosEspecificos = { tipoLog: 'EXPORT' }
//       break
//     case 'escaneos':
//       filtrosEspecificos = {
//         // Los escaneos pueden incluir múltiples tipos: START, END, FIN
//         proceso: 'INE', // Principalmente INE, puede ser PASSPORT también
//       }
//       break
//     case 'registro':
//       filtrosEspecificos = { proceso: 'REGISTER' }
//       break
//   }

//   // Combinar filtros originales con específicos
//   const filtrosFinales = {
//     ...props.filtros,
//     ...filtrosEspecificos,
//   }

//   // Abrir la consola con los datos filtrados Y los filtros específicos
//   consolaRef.value.abrirConsola(logsFormateados, filtroTexto, filtrosFinales)
// }

// Función para actualizar todas las gráficas
const actualizarGraficas = async (filtrosPersonalizados = null) => {
  console.log('ℹ️ Datos de filtros cargados:', filtrosGlobales)

  const filtrosAUsar = filtrosPersonalizados || { ...props.filtros, ...filtrosGlobales.value }
  console.log('🔄 ACTUALIZANDO GRÁFICAS CON FILTROS:', filtrosAUsar)

  await nextTick()
  await Promise.all([
    crearGraficaPasaportes(filtrosAUsar),
    crearGraficaOficinas(filtrosAUsar),
    crearGraficaProceso(filtrosAUsar),
    // crearGraficaExportaciones(filtrosAUsar),
    // crearGraficaEscaneos(filtrosAUsar),
    // crearGraficaErrores(filtrosAUsar),
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
    pasaportes: null,
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
    cargarResumenPasaportes()
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  await nextTick()
  actualizarGraficas()
  cargarResumenPasaportes()
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
    height: auto;
  }

  .text-caption {
    margin-top: 0px;
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

.summary-chart {
  background: linear-gradient(145deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 150, 136, 0.05) 100%);
}

.tramites-chart {
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
