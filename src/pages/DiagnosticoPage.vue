<template>
  <q-page class="diagnostic-page text-white">
    <!-- Header Principal - Estilo EscritorioPage -->
    <div class="diagnostic-header bg-gradient-to-r from-grey-9 to-grey-8 q-pa-lg">
      <div class="container">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-8">
            <div class="text-h3 diagnostic-title q-my-md">
              🔬 <span class="diagnostic-title-text">Centro de Diagnóstico Técnico</span>
            </div>
            <div class="text-h6 text-blue-3 diagnostic-subtitle q-mb-md">
              <span class="diagnostic-subtitle-text"
                >🛡️ Sistema de Análisis de Errores y Sesiones | 📊 Reportes Avanzados</span
              >
            </div>

            <!-- Indicadores de Estado Simplificados -->
            <div class="row q-gutter-sm diagnostic-chips-container">
              <q-chip
                color="green-6"
                text-color="white"
                icon="wifi"
                size="sm"
                class="diagnostic-status-chip"
              >
                🟢 Conectado
              </q-chip>

              <q-chip
                v-if="diagnosticoActivo"
                color="blue-5"
                text-color="white"
                size="sm"
                icon="auto_fix_high"
                class="diagnostic-chip"
              >
                <span>✨ {{ diagnosticoActivo }}</span>
              </q-chip>
            </div>
          </div>

          <!-- Acciones Rápidas Simplificadas -->
          <div class="col-12 col-md-4">
            <div class="row q-gutter-sm justify-end diagnostic-actions">
              <q-btn
                color="primary"
                icon="refresh"
                label="Actualizar"
                @click="actualizarDatos"
                :loading="cargando"
                unelevated
                class="diagnostic-action-btn"
              />
              <q-btn
                color="secondary"
                icon="download"
                label="Exportar"
                @click="mostrarDialogoExportacion"
                :disable="!hayDatosParaExportar"
                unelevated
                class="diagnostic-action-btn"
              />
              <q-btn
                color="info"
                icon="help_outline"
                label="Ayuda"
                @click="mostrarAyuda"
                flat
                class="diagnostic-action-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="diagnostic-content q-pa-lg">
      <div class="container">
        <!-- Pestañas de Diagnóstico -->
        <q-tabs
          v-model="tabActiva"
          dense
          class="bg-grey-7 text-grey-2 q-mb-lg diagnostic-tabs"
          active-color="blue-4"
          indicator-color="blue-4"
          align="justify"
        >
          <q-tab name="busqueda" icon="search" label="🔍 Búsqueda Rápida" />
          <q-tab name="caseId" icon="timer" label="⏰ Análisis de Sesión" />
        </q-tabs>

        <!-- Contenido de Pestañas MODERNIZADO -->
        <q-tab-panels v-model="tabActiva" animated keep-alive class="modern-tab-panels">
          <!-- BÚSQUEDA RÁPIDA MODERNA -->
          <q-tab-panel name="busqueda" class="modern-tab-panel">
            <div class="modern-search-panel">
              <div class="modern-card">
                <div class="card-header">
                  <div class="header-icon">
                    <q-icon name="search" size="32px" color="blue-4" />
                  </div>
                  <div class="header-content">
                    <h3 class="card-title">Búsqueda Rápida de Diagnóstico</h3>
                    <p class="card-subtitle">
                      Ingresa cualquier código para iniciar el análisis automático
                    </p>
                  </div>
                </div>

                <div class="card-body">
                  <div class="modern-input-group">
                    <q-input
                      v-model="busquedaRapida"
                      class="modern-input"
                      placeholder="⚡Ejemplo: fwp6c5iztZvA"
                      dark
                      borderless
                      @keyup.enter="realizarBusquedaRapida"
                    >
                    </q-input>
                    <q-btn
                      class="search-action-btn"
                      icon="send"
                      @click="realizarBusquedaRapida"
                      :loading="cargandoBusqueda"
                      unelevated
                      size="lg"
                    />
                  </div>

                  <!-- Ejemplos de códigos modernos -->
                  <div class="examples-section">
                    <h4 class="examples-title">Ejemplos de códigos</h4>
                    <div class="examples-grid">
                      <div class="example-chip token-code" @click="busquedaRapida = 'fwp6c5iztZvA'">
                        <q-icon name="account_circle" size="16px" />
                        <span>fwp6c5iztZvA</span>
                        <div class="chip-glow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="caseId" class="no-margin no-padding">
            <q-card class="modern-card text-white session-card">
              <q-card-section>
                <div class="card-header">
                  <div class="header-icon">
                    <q-icon name="data_object" size="32px" color="blue-4" />
                  </div>
                  <div class="header-content">
                    <h3 class="card-title">Busqueda Rápida por ID de Sesión</h3>
                    <p class="card-subtitle">
                      Asegurese de estar en el sistema correcto y posteriormente ingrese el código
                      que desea visualizar.
                    </p>
                  </div>
                </div>

                <div class="card-body">
                  <div class="modern-input-group">
                    <q-input
                      v-model="formulario.caseId"
                      class="modern-input"
                      placeholder="Ej: fwp6c5iztZvA"
                      dark
                      borderless
                      @keyup.enter="() => consultarCaseId()"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="blue-4" size="20px" />
                      </template>
                    </q-input>
                    <q-btn
                      class="search-action-btn"
                      icon="send"
                      @click="() => consultarCaseId()"
                      :loading="cargandoBusqueda"
                      unelevated
                      size="lg"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Resultados de la consulta por tokén de sesión -->
            <div class="row q-mt-md">
              <div class="col-xs-12 col-sm-12 col-md-12">
                <ResultadosByToken
                  v-if="resultadoCaseId"
                  :resultados="resultadoCaseId.data"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Loading Overlay -->
    <q-inner-loading
      :showing="cargando"
      color="blue-5"
      size="50px"
      label="Procesando diagnóstico..."
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { DiagnosticService } from '../services/diagnosticService.js'
import ResultadosByToken from 'src/components/escritorio/resultadosEscritorio/ResultadosByToken.vue'

const $q = useQuasar()
const route = useRoute()
const currentSystem = inject('selectedSystem', '')

// Estado principal
const tabActiva = ref('busqueda')
const cargando = ref(false)
const diagnosticoActivo = ref('')

// Estados EXACTOS al modal original
const busquedaRapida = ref('')
const cargandoBusqueda = ref(false)

const formulario = ref({
  caseId: '',
  // errorCode: '',
  // sessionToken: '',
  // supportCode: '',
  // tokenCode: '',
  // device: '',
  // user: '',
})

// Resultados EXACTOS al modal
const cargandoSesion = ref(false)

// Estados de búsqueda
const busquedaAvanzada = ref({
  texto: '',
  tipo: [],
  periodo: null,
})
const busquedaCargando = ref(false)
const resultadosBusqueda = ref([])

// Estados de análisis de errores
const analisisError = ref({
  codigo: '',
})
const analisisCargando = ref(false)
const erroresRecientes = ref([])
const resultadoError = ref(null)
const resultadoCaseId = ref(null)

// Estados de gestión de sesiones
const gestionSesion = ref({
  usuario: '',
  estado: null,
})

// Computed para verificar si hay datos para exportar
const hayDatosParaExportar = computed(() => {
  return (
    (resultadoCaseId.value?.success && resultadoCaseId.value?.data?.length > 0)
    //  Más códigos de error o sesión
  )
})

// Métodos principales
const actualizarDatos = async () => {
  cargando.value = true
  diagnosticoActivo.value = 'Actualizando datos'

  try {
    // Simular carga de datos
    await new Promise((resolve) => setTimeout(resolve, 2000))

    $q.notify({
      type: 'positive',
      message: '✅ Datos actualizados correctamente',
      position: 'top-right',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: '❌ Error actualizando datos',
      position: 'top-right',
    })
  } finally {
    cargando.value = false
    diagnosticoActivo.value = ''
  }
}

const ejecutarBusquedaAvanzada = async () => {
  if (!busquedaAvanzada.value.texto.trim()) return

  busquedaCargando.value = true
  diagnosticoActivo.value = 'Búsqueda avanzada'

  try {
    // Simular búsqueda en API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Datos de ejemplo
    resultadosBusqueda.value = [
      {
        Type: 'ERROR',
        Message: 'Error de conexión con base de datos',
        Date: new Date(),
        Process: 'AuthService',
      },
      {
        Type: 'WARNING',
        Message: 'Tiempo de respuesta elevado',
        Date: new Date(),
        Process: 'ApiController',
      },
      {
        Type: 'INFO',
        Message: 'Usuario autenticado correctamente',
        Date: new Date(),
        Process: 'LoginService',
      },
    ]

    $q.notify({
      type: 'positive',
      message: `🔍 Encontrados ${resultadosBusqueda.value.length} resultados`,
      position: 'top-right',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: '❌ Error en la búsqueda',
      position: 'top-right',
    })
  } finally {
    busquedaCargando.value = false
    diagnosticoActivo.value = ''
  }
}

const analizarError = async () => {
  if (!analisisError.value.codigo.trim()) return

  analisisCargando.value = true
  diagnosticoActivo.value = `Analizando error: ${analisisError.value.codigo}`

  try {
    console.log(`🔍 Consultando código de error: ${analisisError.value.codigo}`)
    const resultado = await DiagnosticService.getErrorCodeDetails(analisisError.value.codigo)

    if (resultado.success && resultado.data.length > 0) {
      // Usar los datos reales del servicio
      erroresRecientes.value = resultado.data.map((record) => ({
        Message: record.message || record.descripcion || 'Error desconocido',
        Date: record.fecha || record.timestamp || new Date(),
        Process: record.proceso || record.servicio || 'Sistema',
        Code: analisisError.value.codigo,
        User: record.person?.nombreCompleto || 'Usuario desconocido',
        Office: record.oficina?.nombre || 'Oficina no especificada',
        BaseCode: record.baseCode,
        SessionToken: record.sessionToken,
      }))

      // Guardar resultado completo para mostrar detalles
      resultadoError.value = resultado

      $q.notify({
        type: 'positive',
        message: `🔍 Encontrados ${resultado.data.length} registros para error: ${analisisError.value.codigo}`,
        position: 'top-right',
      })
    } else {
      $q.notify({
        type: 'warning',
        message: `⚠️ No se encontraron registros para el código: ${analisisError.value.codigo}`,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.log('🔄 Error en consulta:', error.message)
    // Usar datos de muestra como fallback igual que el modal original
    const sampleData = DiagnosticService.getSampleErrorData(analisisError.value.codigo)
    erroresRecientes.value =
      sampleData.data?.map((record) => ({
        Message: record.message || record.descripcion || 'Error de ejemplo',
        Date: record.fecha || new Date(),
        Process: record.proceso || 'Sistema',
        Code: analisisError.value.codigo,
        User: record.person?.nombreCompleto || 'Usuario de prueba',
        Office: record.oficina?.nombre || 'Oficina de prueba',
      })) || []

    resultadoError.value = sampleData

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo - Error de conectividad',
      position: 'top-right',
    })
  } finally {
    analisisCargando.value = false
    diagnosticoActivo.value = ''
  }
}

// FUNCIONES EXACTAS AL MODAL ORIGINAL
const realizarBusquedaRapida = async () => {
  if (!busquedaRapida.value.trim()) return

  cargandoBusqueda.value = true

  try {
    // Determinar si es código 'caseId' (exacto al modal)
    if (busquedaRapida.value) {
      // Es token de sesión
      // Es caseId para el timeline
      formulario.value.caseId = busquedaRapida.value
      tabActiva.value = 'caseId'
      await consultarCaseId()
    }
  } finally {
    cargandoBusqueda.value = false
  }
}

const consultarCaseId = async (codigo = null) => {
  const caseId = codigo || formulario.value.caseId
  if (!caseId || !String(caseId).trim()) return

  cargandoSesion.value = true

  try {
    console.log(`🔍 Consultando sesión de '${currentSystem.value}' por caseId: ${caseId}`)
    resultadoCaseId.value = await DiagnosticService.getCaseId(caseId, currentSystem.value)

    const sortedItems = getTop10RecentEvents(resultadoCaseId.value.data.items)

    resultadoCaseId.value.data.items = sortedItems

    $q.notify({
      type: 'positive',
      message: 'Sesión consultada',
      icon: 'code',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta de sesión:', error.message)
    resultadoCaseId.value = DiagnosticService.getSampleSessionData(caseId)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor',
      position: 'top-right',
    })
  } finally {
    cargandoSesion.value = false
  }
}

const getTop10RecentEvents = (items) => {
  //  isArray?
  if(!Array.isArray(items)){
    console.error('El parametro proporcionado no es un array válido,')
    return []
  }

  //  Crear una copia para no mutar el array original y ordenarlo
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.eventTime);
    const dateB = new Date(b.eventTime);

    // Ordenar descendente (del más reciente al más antiguo)
    return dateB - dateA;
  })

  //  Retornamos solo los primeros 10 elementos
  return sortedItems.slice(0, 10);
}

const mostrarDialogoExportacion = () => {
  // Determinar qué datos están disponibles
  const tieneSesiones = resultadoCaseId.value?.success && resultadoCaseId.value?.data?.length > 0

  if (!tieneSesiones) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos disponibles para exportar',
      caption: 'Realiza primero una consulta de código de error o sesión',
      position: 'top-right',
    })
    return
  }

  const dialogRef = $q.dialog({
    title: 'Exportar Datos de Diagnóstico',
    message: `
      <div style="padding: 0; margin: 0;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 32px; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.2);">

          <!-- Header con gradiente y efecto glassmorphism -->
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); color: white; padding: 24px; border-radius: 16px; margin-bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%); pointer-events: none;"></div>
            <div style="position: relative; z-index: 1;">
              <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <span style="background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">✨ Exportación Avanzada de Datos</span>
              </h3>

            </div>
          </div>

          <!-- Grid de opciones de exportación -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">

            <!-- Opción PDF -->
            <div id="export-pdf" style="
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
              color: white;
              padding: 28px;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
              border: 1px solid rgba(255, 255, 255, 0.1);
              position: relative;
              overflow: hidden;
            "
            onmouseover="
              this.style.transform='translateY(-8px) scale(1.02)';
              this.style.boxShadow='0 16px 40px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              this.style.borderColor='rgba(255,255,255,0.3)';
            "
            onmouseout="
              this.style.transform='translateY(0) scale(1)';
              this.style.boxShadow='0 8px 32px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              this.style.borderColor='rgba(255,255,255,0.1)';
            ">
              <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); transition: left 0.6s ease;"></div>
              <div style="position: relative; z-index: 1; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">📄</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: 0.5px;">PDF PROFESIONAL</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9; line-height: 1.4;">Reporte detallado con diseño profesional y línea de tiempo</p>
              </div>
            </div>

            <!-- Opción Excel -->
            <div id="export-excel" style="
              background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
              color: white;
              padding: 28px;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 8px 32px rgba(5, 150, 105, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
              border: 1px solid rgba(255, 255, 255, 0.1);
              position: relative;
              overflow: hidden;
            "
            onmouseover="
              this.style.transform='translateY(-8px) scale(1.02)';
              this.style.boxShadow='0 16px 40px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              this.style.borderColor='rgba(255,255,255,0.3)';
            "
            onmouseout="
              this.style.transform='translateY(0) scale(1)';
              this.style.boxShadow='0 8px 32px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              this.style.borderColor='rgba(255,255,255,0.1)';
            ">
              <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); transition: left 0.6s ease;"></div>
              <div style="position: relative; z-index: 1; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">📊</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: 0.5px;">EXCEL TIMELINE</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9; line-height: 1.4;">Análisis cronológico y datos estructurados</p>
              </div>
            </div>

            <!-- Opción JSON -->
            <div id="export-json" style="
              background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%);
              color: white;
              padding: 28px;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 8px 32px rgba(29, 78, 216, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
              border: 1px solid rgba(255, 255, 255, 0.1);
              position: relative;
              overflow: hidden;
            "
            onmouseover="
              this.style.transform='translateY(-8px) scale(1.02)';
              this.style.boxShadow='0 16px 40px rgba(29,78,216,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              this.style.borderColor='rgba(255,255,255,0.3)';
            "
            onmouseout="
              this.style.transform='translateY(0) scale(1)';
              this.style.boxShadow='0 8px 32px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              this.style.borderColor='rgba(255,255,255,0.1)';
            ">
              <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); transition: left 0.6s ease;"></div>
              <div style="position: relative; z-index: 1; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">💻</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: 0.5px;">JSON TÉCNICO</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9; line-height: 1.4;">Datos estructurados completos para desarrollo</p>
              </div>
            </div>
          </div>

          <!-- Footer con información adicional -->
          <div style="margin-top: 24px; padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; text-align: center; line-height: 1.5;">
              💡 <strong>Tip:</strong> El formato PDF incluye visualizaciones gráficas, Excel permite análisis avanzado y JSON es ideal para integración técnica.
            </p>
          </div>
        </div>
      </div>
    `,
    html: true,
    persistent: false,
    ok: false,
    cancel: {
      label: '✕ Cancelar',
      color: 'grey-6',
      flat: true,
      style: 'border-radius: 12px; padding: 12px 24px; font-weight: 600; letter-spacing: 0.5px;',
    },
    class: 'export-dialog-custom',
  })

  // Agregar event listeners después de que el diálogo se renderice
  setTimeout(() => {
    const pdfBtn = document.getElementById('export-pdf')
    const excelBtn = document.getElementById('export-excel')
    const jsonBtn = document.getElementById('export-json')

    // Agregar efecto shimmer on hover
    const addShimmerEffect = (element) => {
      if (element) {
        element.addEventListener('mouseenter', () => {
          const shimmer = element.querySelector('div[style*="left: -100%"]')
          if (shimmer) {
            shimmer.style.left = '100%'
            setTimeout(() => {
              shimmer.style.left = '-100%'
            }, 600)
          }
        })
      }
    }

    addShimmerEffect(pdfBtn)
    addShimmerEffect(excelBtn)
    addShimmerEffect(jsonBtn)

    if (pdfBtn)
      pdfBtn.onclick = () => {
        exportarDatos('pdf')
        dialogRef.hide()
      }
    if (excelBtn)
      excelBtn.onclick = () => {
        exportarDatos('excel')
        dialogRef.hide()
      }
    if (jsonBtn)
      jsonBtn.onclick = () => {
        exportarDatos('json')
        dialogRef.hide()
      }
  }, 100)
}

const exportarDatos = async (formato) => {
  try {
    cargando.value = true

    // Determinar qué datos exportar según la pestaña activa y datos disponibles
    let datosExportar = null
    let tipoExportacion = ''

    if (tabActiva.value === 'errorCode' && resultadoError.value?.success) {
      datosExportar = resultadoError.value
      tipoExportacion = 'error'
    } else if (tabActiva.value === 'caseId' && resultadoCaseId.value?.success) {
      datosExportar = resultadoCaseId.value
      tipoExportacion = 'caseId'
    } else {
      // Auto-detectar los datos disponibles
      if (resultadoError.value?.success && resultadoError.value?.data?.length > 0) {
        datosExportar = resultadoError.value
        tipoExportacion = 'error'
      } else if (resultadoCaseId.value?.success && resultadoCaseId.value?.data?.length > 0) {
        datosExportar = resultadoCaseId.value
        tipoExportacion = 'session'
      }
    }

    if (!datosExportar) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos disponibles para exportar',
        caption: 'Realiza primero una consulta de código de error o sesión',
        position: 'top-right',
      })
      return
    }

    // Importar el servicio dinámicamente
    const { ExportService } = await import('../services/exportService.js')

    // Realizar la exportación según el tipo
    if (tipoExportacion === 'error') {
      await ExportService.exportErrorCode(datosExportar, formato)
    } else {
      await ExportService.exportSession(datosExportar, formato)
    }

    $q.notify({
      type: 'positive',
      message: `Exportacion ${formato.toUpperCase()} completada exitosamente`,
      caption: `Datos de ${
        tipoExportacion === 'error' ? 'codigo de error' : 'sesion'
      } exportados correctamente`,
      position: 'top-right',
      timeout: 3000,
    })
  } catch (error) {
    console.error('Error en exportación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error en la exportacion',
      caption: error.message || 'No se pudo completar la exportacion',
      position: 'top-right',
    })
  } finally {
    cargando.value = false
  }
}

const mostrarAyuda = () => {
  $q.dialog({
    message: `
      <div style="padding: 0; margin: 0;">
        <div style="border-radius: 20px;">

          <!-- Header Principal con Glassmorphism -->
          <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); backdrop-filter: blur(10px); color: white; padding: 28px; border-radius: 16px; margin-bottom: 32px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%); pointer-events: none;"></div>
            <div style="position: relative; z-index: 1;">
              <h2 style="margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: 0.5px;">
                <span style="background: linear-gradient(135deg, #34d399 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🛡️ Centro de Diagnóstico Técnico</span>
              </h2>
              <p style="margin: 12px 0 0 0; opacity: 0.85; font-size: 1.1rem; font-weight: 500;">
                Guía completa para análisis avanzado de errores y sesiones
              </p>
            </div>
          </div>

          <!-- Grid de Funcionalidades -->
          <div style="display: grid; gap: 24px; margin-bottom: 32px;">
            <!-- Funcionalidades Adicionales en Grid Horizontal -->
            <div style="display: grid; gap: 20px; margin-bottom: 28px;">
              <!-- Búsqueda Rápida -->
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="font-size: 1.5rem; margin-right: 10px;">⚡</div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Búsqueda Rápida</h4>
                </div>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.9; line-height: 1.5;">
                  Detección automática del tipo de código • Resultados inmediatos • Sin configuración
                </p>
              </div>
              <!-- Exportación -->
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(5, 150, 105, 0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="font-size: 1.5rem; margin-right: 10px;">📊</div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Exportación Avanzada</h4>
                </div>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.9; line-height: 1.5;">
                  <strong>PDF</strong> Profesional • <strong>Excel</strong> con 2 hojas • <strong>JSON</strong> estructurado
                </p>
              </div>
            </div>

            <!-- Análisis de Sesiones -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
              <div style="position: relative; z-index: 1;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="font-size: 2rem; margin-right: 12px;">👤</div>
                  <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700;">Sesiones de Usuario</h3>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                  <div style="font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.5px;">
                    USR02808191331
                  </div>
                  <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 4px;">Sin sufijos adicionales</div>
                </div>
                <ul style="margin: 0; padding-left: 16px; font-size: 0.9rem; line-height: 1.6; opacity: 0.9;">
                  <li>Cronología de acciones</li>
                  <li>Seguimiento de dispositivos</li>
                  <li>Timeline con timestamps</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer con Tips -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 24px; border-radius: 16px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <div style="font-size: 1.8rem; margin-right: 12px;">💡</div>
              <h4 style="margin: 0; color: #fbbf24; font-size: 1.2rem; font-weight: 600;">Características Nuevas</h4>
            </div>
            <div style="display: grid; gap: 16px; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; line-height: 1.6;">
              <p>✨ <strong>Desglose completo:</strongBúsqueda Rápida de Diagnóstico> Todos los registros detallados</p>
              <div>📱 <strong>100% Responsivo:</strong> Móvil, tablet y desktop</div>
              <div>🎨 <strong>Diseño moderno:</strong> Efectos visuales mejorados</div>
            </div>
          </div>
        </div>
      </div>
    `,
    html: true,
    style:
      'padding: 0; margin: 0; width: 700px; color: #ffff; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); border-radius: 12px;',
    persistent: false,
    ok: {
      label: '✓ Perfecto, entendido',
      color: 'green-6',
      unelevated: true,
      style:
        'border-radius: 12px; padding: 12px 28px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);',
    },
    class: 'help-dialog-custom',
  })
}

// Inicialización
onMounted(() => {
  // Verificar parámetros de ruta
  const codigo = route.query.code || route.query.error
  const usuario = route.query.user || route.query.session
  const busqueda = route.query.search || route.query.q

  if (codigo) {
    tabActiva.value = 'errorCode'
    analisisError.value.codigo = codigo
    setTimeout(() => analizarError(), 500)
  } else if (usuario) {
    tabActiva.value = 'caseId'
    gestionSesion.value.usuario = usuario
    setTimeout(() => consultarCaseId(), 500)
  } else if (busqueda) {
    tabActiva.value = 'busqueda'
    busquedaAvanzada.value.texto = busqueda
    setTimeout(() => ejecutarBusquedaAvanzada(), 500)
  }
})
</script>

<style lang="scss" scoped>
// Estilo principal similar a EscritorioPage
.diagnostic-page {
  min-height: 100vh;
  // background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

// Header limpio y moderno
.diagnostic-header {
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  // backdrop-filter: blur(10px);
}

.diagnostic-title {
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.diagnostic-subtitle {
  font-weight: 500;
  opacity: 0.9;
}

.diagnostic-content {
  position: relative;
}

.diagnostic-actions {
  gap: 0.5rem;
}

.diagnostic-action-btn {
  border-radius: 8px;
  font-weight: 600;
}

// Chips simplificados
.diagnostic-status-chip {
  font-size: 0.85rem;
  border-radius: 16px;
}

// Pestañas más limpias
.q-tabs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Tab panels con mejor legibilidad
.q-tab-panel {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  // border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

// Cards más claras
.diagnostic-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(6, 182, 212, 0.3);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
}

// Inputs más claros
.q-field {
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;

  &.q-field--focused {
    border-color: rgba(6, 182, 212, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1) !important;
  }
}

// Botones mejorados
.q-btn {
  &.q-btn--unelevated {
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

// Estados de carga más suaves
.loading-state {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Estados de error más claros
.error-state {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
}

// Estados vacíos más amigables
.empty-state {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

// Responsive mejorado
@media (max-width: 768px) {
  .diagnostic-header {
    padding: 1rem !important;
  }

  .diagnostic-title {
    font-size: 1.5rem !important;
    text-align: center;
  }

  .diagnostic-title-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .diagnostic-subtitle {
    font-size: 0.9rem !important;
    text-align: center;
  }

  .diagnostic-subtitle-text {
    display: block;
    line-height: 1.3;
  }

  .diagnostic-chips-container {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .diagnostic-actions {
    justify-content: center !important;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .diagnostic-title {
    font-size: 1.2rem !important;
  }

  .diagnostic-title-text {
    font-size: 1.2rem;
  }

  .diagnostic-subtitle-text {
    font-size: 0.8rem;
  }

  .diagnostic-action-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

.diagnostic-chip {
  font-weight: 600;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
}

.diagnostic-glow {
  text-shadow: 0 0 10px currentColor;
}

.diagnostic-tabs {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.diagnostic-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.temporal-filter-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.temporal-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.search-result-item,
.error-item,
.session-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:hover,
.error-item:hover,
.session-item:hover {
  background-color: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  transform: translateX(8px);
}

.stat-card,
.metric-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover,
.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.support-tool-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.support-buttons .q-btn {
  transition: all 0.3s ease;
}

.support-buttons .q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.metric-value {
  font-weight: 700;
  text-shadow: 0 0 10px currentColor;
}

.info-item {
  color: #e2e8f0;
  font-size: 14px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

// ESTILOS MODERNOS AGREGADOS
// Variables modernas
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-dark: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
  --gradient-card: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  --blur-glass: blur(20px);
  --border-glass: 1px solid rgba(255, 255, 255, 0.1);
  --shadow-modern: 0 20px 40px rgba(0, 0, 0, 0.3);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Header moderno
.modern-diagnostic-header {
  position: relative;
  background: var(--gradient-dark);
  backdrop-filter: var(--blur-glass);
  border-bottom: var(--border-glass);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0.1;
    z-index: 0;
  }
}

.bg-gradient-modern {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.modern-header-wrapper {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
}

.modern-title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.modern-icon-container {
  position: relative;

  .modern-diagnostic-icon {
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.5));
    animation: float 6s ease-in-out infinite;
  }

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse-glow 3s ease-in-out infinite alternate;
  }
}

.modern-text-content {
  .modern-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, #64d1f5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }

  .modern-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-weight: 400;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

// Status cards modernos
.modern-status-grid {
  display: flex;
  gap: 1rem;

  @media (max-width: 1024px) {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.status-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 16px;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0;
    transition: var(--transition-smooth);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-modern);

    &::before {
      opacity: 1;
    }
  }

  .status-icon {
    color: #fff;
    opacity: 0.9;
  }

  .status-info {
    display: flex;
    flex-direction: column;

    .status-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-value {
      font-size: 0.9rem;
      color: #fff;
      font-weight: 600;
    }
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);

    &.pulse {
      animation: pulse-indicator 2s ease-in-out infinite;
    }
  }

  &.connected {
    border-left: 3px solid #10b981;
  }

  &.secure {
    border-left: 3px solid #8b5cf6;
  }

  &.analyzing {
    border-left: 3px solid #3b82f6;
  }
}

// Acciones modernas
.modern-actions {
  display: flex;
  gap: 0.75rem;

  @media (max-width: 1024px) {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.modern-action-btn {
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &.primary {
    background: var(--gradient-primary);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: var(--gradient-secondary);
    box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
    }
  }

  &.tertiary {
    background: var(--gradient-card);
    backdrop-filter: var(--blur-glass);
    border: var(--border-glass);

    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// Tabs modernos
.modern-tabs-container {
  margin: 2rem 0;
}

.modern-tabs {
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 20px;
  padding: 0.5rem;
  overflow: hidden;
}

.modern-tab {
  border-radius: 16px;
  transition: var(--transition-smooth);
  margin: 0 0.25rem;
  position: relative;

  .tab-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;

    .tab-label {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .tab-description {
      font-size: 0.75rem;
      opacity: 0.7;
    }
  }

  &.active {
    background: var(--gradient-primary);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  &:not(.active):hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

// Panels modernos
.modern-tab-panels {
  background: transparent;
}

.modern-tab-panel {
  padding: 0;
}

// Cards modernos
.modern-card {
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 24px;
  overflow: hidden;
  // box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  transition: var(--transition-smooth);

  .card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-primary);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      flex: 1;

      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem 0;
      }

      .card-subtitle {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }

  .card-body {
    padding: 2rem;
  }
}

// Input moderno
.modern-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  .modern-input {
    flex: 1;

    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      min-height: 56px;
      padding-left: 1%;
      transition: var(--transition-smooth);

      &:hover {
        border-color: rgba(52, 211, 153, 0.5);
        background: rgba(255, 255, 255, 0.08);
      }

      &.q-field--focused {
        border-color: #34d399;
        box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
        background: rgba(255, 255, 255, 0.1);
      }
    }

    :deep(.q-field__native),
    :deep(.q-field__input) {
      color: #fff;
      font-size: 1rem;
      font-weight: 500;
    }
  }

  .search-action-btn {
    background: var(--gradient-success);
    border-radius: 16px;
    padding: 0 2rem;
    box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
    transition: var(--transition-smooth);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(79, 172, 254, 0.4);
    }
  }
}

// Ejemplos modernos
.examples-section {
  .examples-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 1rem 0;
  }

  .examples-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .example-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    cursor: pointer;
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
    font-weight: 500;

    .chip-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      transition: left 0.5s ease;
    }

    &:hover .chip-glow {
      left: 100%;
    }

    &.error-code {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4);
      }
    }

    &.user-code {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
      }
    }

    &.token-code {
      background: linear-gradient(135deg, #9c27b0 0%, #2563eb 100%);
      box-shadow: 0 8px 32px rgba(171, 59, 246, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
      }
    }
  }
}

// Animaciones
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes pulse-indicator {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

// Responsive moderno
@media (max-width: 768px) {
  .modern-header-wrapper {
    gap: 1rem;
  }

  .modern-title-section {
    flex-direction: column;
    gap: 1rem;
  }

  .modern-text-content .modern-title {
    font-size: 1.8rem;
  }

  .modern-status-grid {
    flex-direction: column;
    width: 100%;
  }

  .status-card {
    width: 100%;
    justify-content: center;
  }

  .modern-actions {
    flex-direction: column;
    width: 100%;
  }

  .modern-action-btn {
    width: 100%;
    justify-content: center;
  }

  .modern-card .card-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .examples-grid {
    flex-direction: column;
  }

  .example-chip {
    width: 100%;
    justify-content: center;
  }
}

.log-message {
  font-weight: 500;
  margin-bottom: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #42a5f5;
}

.log-ofice {
  font-weight: 500;
  margin-bottom: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #04b949;
}

.bordered {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 12px;
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
  color: white;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.timeline-scroll {
  max-height: 300px;
  overflow-y: auto;
}

.session-timeline {
  max-height: 350px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar vertical u horizontal completo */
::-webkit-scrollbar {
  width: 9px; /* ancho de la barra (barStyle width) */
  height: 9px; /* alto si es horizontal */
}

/* Track: fondo de la barra */
::-webkit-scrollbar-track {
  background-color: #027be3; /* barStyle backgroundColor */
  border-radius: 9px; /* barStyle borderRadius */
  opacity: 0.2; /* barStyle opacity */
}

/* Thumb: la parte que se mueve */
::-webkit-scrollbar-thumb {
  background-color: #002c53; /* thumbStyle backgroundColor */
  border-radius: 5px; /* thumbStyle borderRadius */
  width: 5px; /* thumbStyle width (opcional, se suele controlar con scrollbar) */
  opacity: 0.75; /* thumbStyle opacity */
}

/* Thumb al hacer hover */
::-webkit-scrollbar-thumb:hover {
  background-color: #004883; /* color más oscuro para hover */
}
</style>

<style lang="scss" scoped>
.bg-gradient-pure-list {
  background: linear-gradient(to right, #333333, #dd1818);
}

.diagnostic-page {
  // background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.page-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 2rem;
}

.page-subtitle {
  color: #b0b0b0;
  font-size: 1.1rem;
}

.page-content {
  position: relative;
}

// Estilos específicos para el panel de sesiones mejorado
.session-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.session-input {
  .q-field__control {
    border-radius: 12px;
  }
}

.session-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.session-results {
  animation: fadeInUp 0.6s ease-out;
}

.session-header {
  .session-icon-pulse {
    animation: pulse 2s infinite;
  }

  .session-count-chip {
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  }

  .refresh-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: rotate(180deg);
    }
  }
}

.bg-gradient-red-dark {
  background: linear-gradient(to right, #c31432, #240b36);
}

.btn-error {
  background: linear-gradient(to right, #f00000, #dc281e);
  border-radius: 15px;
  width: 100%;
}

.summary-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;

  &.bg-gradient-blue {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  }

  &.bg-gradient-purple {
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  }

  &.bg-gradient-red {
    background: linear-gradient(to right, #f00000, #dc281e);
  }

  &.bg-gradient-red-dark {
    background: linear-gradient(to right, #c31432, #240b36);
  }

  .summary-item {
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }
  }
}

.session-records {
  .session-record-card {
    width: 100%;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
    transition: all 0.3s ease;
    animation: slideInUp 0.6s ease-out both;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
      border-left-color: #60a5fa;
    }
  }

  .record-type {
    .q-chip {
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  .record-message {
    line-height: 1.5;
    color: #e5e7eb;
    overflow-wrap: break-word;
  }

  .record-time {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .record-metadata {
    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 12px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      color: #9ca3af;

      .metadata-label {
        font-weight: 500;
        margin-left: 4px;
        margin-right: 6px;
        color: #d1d5db;
      }

      .metadata-value {
        color: #f3f4f6;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
    }
  }

  .detail-btn {
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: none;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
    }
  }
}

.error-state {
  .error-animation {
    .error-icon-bounce {
      animation: bounce 2s infinite;
    }
  }
}

// Animaciones
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translateY(0);
  }
  40%,
  43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  /* Header responsive */
  .diagnostic-header-section {
    padding: 1rem !important;
  }

  .diagnostic-title {
    font-size: 1.5rem !important;
    text-align: center;
  }

  .diagnostic-title-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .diagnostic-subtitle {
    font-size: 0.9rem !important;
    text-align: center;
  }

  .diagnostic-subtitle-text {
    display: block;
    line-height: 1.3;
  }

  .diagnostic-chips-container {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .diagnostic-status-chip {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .diagnostic-actions {
    justify-content: center !important;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .diagnostic-action-btn {
    min-width: auto;
    font-size: 0.85rem;
  }

  /* Sesiones y otros elementos */
  .session-header {
    .row {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }

  .summary-card {
    margin-bottom: 1rem;
  }

  .session-record-card {
    margin-bottom: 1rem;
  }

  .metadata-grid {
    grid-template-columns: 1fr !important;
  }

  .page-header {
    .row {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .diagnostic-title {
    font-size: 1.2rem !important;
  }

  .diagnostic-title-text {
    font-size: 1.2rem;
  }

  .diagnostic-subtitle-text {
    font-size: 0.8rem;
  }

  .diagnostic-action-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .modern-input-group {
    display: grid;
  }
}

/* Estilos MODERNOS personalizados para modales de diagnóstico */
:deep(.export-dialog-custom) {
  .q-dialog__inner {
    background: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(20px);
  }

  .q-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.6) !important;
    border-radius: 24px !important;
    backdrop-filter: blur(20px);
  }

  .q-card__section {
    color: white;
  }
}

:deep(.help-dialog-custom) {
  .q-dialog__inner {
    background: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(20px);
  }

  .q-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
    border: 1px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.6) !important;
    border-radius: 24px !important;
    backdrop-filter: blur(20px);
  }

  .q-card__section {
    color: white;
  }
}

/* Mejoras ULTRA-MODERNAS para todos los modales del sistema de diagnóstico */
:deep(.q-dialog) {
  .q-dialog__inner {
    background: rgba(15, 23, 42, 0.85) !important;
    backdrop-filter: blur(15px);
  }

  .q-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #334155 100%) !important;
    color: white !important;
    border-radius: 24px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow:
      0 32px 64px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px);
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.05) 0%,
        rgba(147, 51, 234, 0.05) 100%
      );
      pointer-events: none;
      z-index: 0;
    }
  }

  .q-card__section {
    color: white !important;
    position: relative;
    z-index: 1;

    &--vert {
      color: white !important;
    }
  }

  .q-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }
  }

  // Estilos específicos para títulos en modales
  .q-card__section:first-child {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px 24px 0 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(59, 130, 246, 0.5) 50%,
        transparent 100%
      );
    }
  }

  // Estilos para inputs dentro de modales
  .q-input .q-field__control {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;

    &:hover {
      border-color: rgba(59, 130, 246, 0.5) !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }

    &.q-field--focused {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }

  .q-input .q-field__native,
  .q-input .q-field__input {
    color: white !important;
  }

  .q-input .q-field__label {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  // Animaciones modernas para entrada del modal
  &.q-dialog--opened {
    animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// Animaciones personalizadas
@keyframes modalFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Efectos especiales para botones en modales
:deep(.q-dialog .q-btn--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3) !important;

  &:hover {
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4) !important;
  }
}

:deep(.q-dialog .q-btn--secondary) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3) !important;

  &:hover {
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4) !important;
  }
}

:deep(.q-dialog .q-btn--negative) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3) !important;

  &:hover {
    box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4) !important;
  }
}
</style>
