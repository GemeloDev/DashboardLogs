<template>
  <!-- Modal de Diagnóstico Avanzado -->
  <q-dialog
    v-model="mostrarDiagnostico"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarDiagnostico"
    persistent
  >
    <q-card class="premium-modal-container bg-black text-white overflow-hidden">
      <!-- Header Premium con Efectos Holográficos -->
      <q-card-section class="premium-header position-relative overflow-hidden">
        <!-- Contenido Principal del Header -->
        <div class="row items-center justify-between position-relative z-index-10">
          <div class="col">
            <!-- Título Holográfico -->
            <div class="flex items-center q-mb-md">
              <q-icon name="medical_services" class="text-blue-4 q-mr-md" size="3rem" />
              <div>
                <h3 class="holographic-title q-my-none text-h4 text-weight-bold">
                  CENTRO DE DIAGNÓSTICO TÉCNICO
                </h3>
                <div class="text-grey-4">Sistema Avanzado de Análisis con IA y Soporte Técnico</div>
              </div>
            </div>

            <!-- Indicadores de Estado Premium -->
            <div class="status-indicators">
              <div class="status-card">
                <q-icon name="cloud_done" class="text-green-4" />
                <div>
                  <div class="status-value">{{ estadisticasTime.errores }}</div>
                  <div class="status-label">Errores Activos</div>
                </div>
              </div>

              <div class="status-card">
                <q-icon name="people" class="text-blue-4" />
                <div>
                  <div class="status-value">{{ estadisticasTime.sesiones }}</div>
                  <div class="status-label">Sesiones</div>
                </div>
              </div>

              <div class="status-card">
                <q-icon name="analytics" class="text-purple-4" />
                <div>
                  <div class="status-value">{{ estadisticasTime.analisis }}</div>
                  <div class="status-label">Análisis</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-auto">
            <q-btn
              flat
              round
              icon="close"
              size="lg"
              @click="cerrarDiagnostico"
              class="text-grey-4 hover-white"
            />
          </div>
        </div>

        <!-- Navegación Premium -->
        <div class="premium-tabs-container q-mt-lg">
          <q-tabs
            v-model="tabActiva"
            class="premium-tabs"
            indicator-color="transparent"
            active-color="white"
            align="justify"
          >
            <q-tab name="busqueda" class="premium-tab" content-class="premium-tab-content">
              <div class="tab-content-wrapper">
                <q-icon name="search" class="tab-icon" />
                <div class="tab-label">Búsqueda Inteligente</div>
                <div class="tab-indicator"></div>
              </div>
            </q-tab>

            <q-tab name="errorCode" class="premium-tab" content-class="premium-tab-content">
              <div class="tab-content-wrapper">
                <q-icon name="error" class="tab-icon" />
                <div class="tab-label">Código de Error</div>
                <div class="tab-indicator"></div>
              </div>
            </q-tab>

            <q-tab name="session" class="premium-tab" content-class="premium-tab-content">
              <div class="tab-content-wrapper">
                <q-icon name="account_circle" class="tab-icon" />
                <div class="tab-label">Sesión de Usuario</div>
                <div class="tab-indicator"></div>
              </div>
            </q-tab>

            <q-tab name="soporte" class="premium-tab" content-class="premium-tab-content">
              <div class="tab-content-wrapper">
                <q-icon name="support_agent" class="tab-icon" />
                <div class="tab-label">Centro de Soporte</div>
                <div class="tab-indicator"></div>
              </div>
            </q-tab>

            <q-tab name="resultados" class="premium-tab" content-class="premium-tab-content">
              <div class="tab-content-wrapper">
                <q-icon name="analytics" class="tab-icon" />
                <div class="tab-label">Resultados Avanzados</div>
                <div class="tab-indicator"></div>
              </div>
            </q-tab>
          </q-tabs>
        </div>
      </q-card-section>

      <!-- Contenido Premium de Pestañas -->
      <q-card-section class="premium-content-area">
        <q-tab-panels v-model="tabActiva" animated class="premium-panels">
          <!-- BÚSQUEDA INTELIGENTE -->
          <q-tab-panel name="busqueda" class="premium-panel">
            <div class="premium-search-container">
              <!-- Header de Búsqueda -->
              <div class="search-header-premium">
                <div class="search-title-container">
                  <q-icon name="auto_awesome" class="search-main-icon" />
                  <div>
                    <h4 class="search-title">Búsqueda Inteligente Avanzada</h4>
                    <p class="search-subtitle">
                      Sistema de análisis con IA para diagnóstico instantáneo y preciso
                    </p>
                  </div>
                </div>
              </div>

              <!-- Barra de Búsqueda Premium -->
              <div class="premium-search-bar">
                <q-input
                  v-model="busquedaRapida"
                  class="search-input-premium"
                  placeholder="Ingresa código de error, baseCode, token de sesión o ID de usuario..."
                  @keyup.enter="realizarBusquedaRapida"
                  standout="bg-grey-9 text-white"
                  input-class="text-white text-h6"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" class="search-icon-premium" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      round
                      dense
                      flat
                      icon="auto_fix_high"
                      class="search-ai-btn"
                      @click="toggleAyuda"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Sugerencias Inteligentes -->
              <div class="ai-suggestions-premium">
                <div class="suggestions-header">
                  <q-icon name="psychology" class="suggestions-icon" />
                  <h5 class="suggestions-title">Sugerencias Inteligentes de IA</h5>
                </div>
                <div class="suggestions-grid">
                  <div
                    v-for="sugerencia in sugerenciasInteligentes"
                    :key="sugerencia.id"
                    class="suggestion-chip"
                    @click="aplicarSugerencia(sugerencia)"
                  >
                    <q-icon :name="sugerencia.icon" class="suggestion-icon" />
                    <div class="suggestion-content">
                      <div class="suggestion-label">{{ sugerencia.label }}</div>
                      <div class="suggestion-value">{{ sugerencia.value }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Estadísticas en Tiempo Real -->
              <div class="realtime-stats">
                <div class="stats-header">
                  <q-icon name="trending_up" class="stats-icon" />
                  <h5 class="stats-title">Estadísticas en Tiempo Real</h5>
                </div>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ estadisticasTime.errores }}</div>
                    <div class="stat-label">Errores</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ estadisticasTime.sesiones }}</div>
                    <div class="stat-label">Sesiones</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ estadisticasTime.analisis }}</div>
                    <div class="stat-label">Análisis</div>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción Rápida -->
              <div class="q-mt-lg text-center">
                <q-btn
                  color="blue-6"
                  size="lg"
                  icon="search"
                  label="Realizar Búsqueda Avanzada"
                  @click="realizarBusquedaRapida"
                  :loading="cargandoBusqueda"
                  class="q-mr-md"
                />
                <q-btn
                  color="purple-6"
                  size="lg"
                  icon="settings"
                  label="Configuración Avanzada"
                  @click="abrirConfigAvanzada"
                  flat
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- CÓDIGO DE ERROR -->
          <q-tab-panel name="errorCode">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">🔍 Análisis de Código de Error</div>
                <div class="text-caption text-grey-4 q-mb-lg">Formato: USR02808190918-SUC001</div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formulario.errorCode"
                      label="Código de Error"
                      placeholder="USR02808190918-SUC001"
                      dark
                      outlined
                      @keyup.enter="consultarCodigoError"
                    >
                      <template v-slot:prepend>
                        <q-icon name="error" color="red-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn
                      color="red-5"
                      icon="search"
                      label="Consultar"
                      @click="consultarCodigoError"
                      :loading="cargandoError"
                      size="lg"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultados -->
                <div v-if="resultadoError" class="q-mt-lg">
                  <q-card class="bg-grey-7">
                    <q-card-section>
                      <div class="text-h6 text-red-4">📋 Resultado del Análisis</div>
                      <div class="q-mt-md">
                        <div><strong>Código:</strong> {{ resultadoError.errorCode }}</div>
                        <div><strong>Descripción:</strong> {{ resultadoError.description }}</div>
                        <div><strong>Severidad:</strong> {{ resultadoError.severity }}</div>
                        <div><strong>Usuario:</strong> {{ resultadoError.user }}</div>
                        <div>
                          <strong>Fecha:</strong> {{ formatearFecha(resultadoError.timestamp) }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- SESIÓN DE USUARIO -->
          <q-tab-panel name="session">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">👤 Análisis de Sesión de Usuario</div>
                <div class="text-caption text-grey-4 q-mb-lg">BaseCode: USR02808191331</div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formulario.sessionToken"
                      label="BaseCode de Sesión"
                      placeholder="USR02808191331"
                      dark
                      outlined
                      @keyup.enter="consultarSesion"
                    >
                      <template v-slot:prepend>
                        <q-icon name="account_circle" color="blue-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn
                      color="blue-5"
                      icon="search"
                      label="Consultar"
                      @click="consultarSesion"
                      :loading="cargandoSesion"
                      size="lg"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultados -->
                <div v-if="resultadoSesion" class="q-mt-lg">
                  <q-card class="bg-grey-7">
                    <q-card-section>
                      <div class="text-h6 text-blue-4">👤 Información de Sesión</div>
                      <div class="q-mt-md">
                        <div><strong>BaseCode:</strong> {{ resultadoSesion.baseCode }}</div>
                        <div><strong>Usuario:</strong> {{ resultadoSesion.userName }}</div>
                        <div><strong>Estado:</strong> {{ resultadoSesion.status }}</div>
                        <div>
                          <strong>Última Actividad:</strong>
                          {{ formatearFecha(resultadoSesion.lastActivity) }}
                        </div>
                        <div><strong>Sucursal:</strong> {{ resultadoSesion.branch }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- CENTRO DE SOPORTE -->
          <q-tab-panel name="soporte">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">🎧 Centro de Soporte Técnico</div>
                <div class="text-caption text-grey-4 q-mb-lg">
                  Código de Soporte para Mesa de Ayuda
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formulario.supportCode"
                      label="Código de Soporte"
                      placeholder="SUP-2024-001234"
                      dark
                      outlined
                      @keyup.enter="consultarSoporte"
                    >
                      <template v-slot:prepend>
                        <q-icon name="support_agent" color="green-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn
                      color="green-5"
                      icon="search"
                      label="Consultar"
                      @click="consultarSoporte"
                      :loading="cargandoSoporte"
                      size="lg"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultados -->
                <div v-if="resultadoSoporte" class="q-mt-lg">
                  <q-card class="bg-grey-7">
                    <q-card-section>
                      <div class="text-h6 text-green-4">🎧 Información de Soporte</div>
                      <div class="q-mt-md">
                        <div><strong>Código:</strong> {{ resultadoSoporte.supportCode }}</div>
                        <div><strong>Problema:</strong> {{ resultadoSoporte.issue }}</div>
                        <div><strong>Estado:</strong> {{ resultadoSoporte.status }}</div>
                        <div><strong>Técnico:</strong> {{ resultadoSoporte.technician }}</div>
                        <div>
                          <strong>Fecha:</strong> {{ formatearFecha(resultadoSoporte.created) }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- RESULTADOS AVANZADOS -->
          <q-tab-panel name="resultados">
            <div v-if="hayResultados">
              <div class="text-h5 q-mb-lg text-center">📊 Resultados del Análisis Completo</div>

              <!-- Mostrar todos los resultados disponibles -->
              <div class="row q-col-gutter-lg">
                <div v-if="resultadoError" class="col-12 col-md-6">
                  <q-card class="bg-red-9">
                    <q-card-section>
                      <div class="text-h6">🔍 Código de Error</div>
                      <div class="q-mt-md">
                        <div>
                          <strong>{{ resultadoError.errorCode }}</strong>
                        </div>
                        <div>{{ resultadoError.description }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div v-if="resultadoSesion" class="col-12 col-md-6">
                  <q-card class="bg-blue-9">
                    <q-card-section>
                      <div class="text-h6">👤 Sesión de Usuario</div>
                      <div class="q-mt-md">
                        <div>
                          <strong>{{ resultadoSesion.baseCode }}</strong>
                        </div>
                        <div>{{ resultadoSesion.userName }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div v-if="resultadoSoporte" class="col-12 col-md-6">
                  <q-card class="bg-green-9">
                    <q-card-section>
                      <div class="text-h6">🎧 Soporte Técnico</div>
                      <div class="q-mt-md">
                        <div>
                          <strong>{{ resultadoSoporte.supportCode }}</strong>
                        </div>
                        <div>{{ resultadoSoporte.issue }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
            <div v-else class="text-center q-pa-xl">
              <q-icon name="search" size="4rem" class="text-grey-6" />
              <div class="text-h6 q-mt-md text-grey-4">
                Realiza una búsqueda para ver los resultados aquí
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { DiagnosticService } from '../../services/diagnosticService.js'

// Props y emits
const props = defineProps({
  codigo: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['cerrar'])

// Quasar
const $q = useQuasar()

// Estado del componente
const mostrarDiagnostico = ref(false)
const mostrarAyuda = ref(false)
const tabActiva = ref('busqueda')
const diagnosticoActivo = ref('')

// Formularios
const busquedaRapida = ref('')
const formulario = ref({
  errorCode: '',
  sessionToken: '',
  supportCode: '',
  device: '',
  user: '',
})

// Datos para la interfaz premium
const sugerenciasInteligentes = ref([
  { id: 1, icon: 'person', label: 'Usuario ID', value: 'USR02808190918' },
  { id: 2, icon: 'error', label: 'Error Crítico', value: 'ERR-500-CRITICAL' },
  { id: 3, icon: 'security', label: 'Token Sesión', value: 'TOKEN-' },
  { id: 4, icon: 'code', label: 'BaseCode', value: 'USR02808190918-SUC001' },
])

const estadisticasTime = ref({
  errores: 12,
  sesiones: 48,
  analisis: 156,
})

// Estados de carga
const cargandoBusqueda = ref(false)
const cargandoError = ref(false)
const cargandoSesion = ref(false)
const cargandoSoporte = ref(false)

// Resultados
const resultadoError = ref(null)
const resultadoSesion = ref(null)
const resultadoSoporte = ref(null)

// Computed
const hayResultados = computed(() => {
  return (
    (resultadoError.value && resultadoError.value.success) ||
    (resultadoSesion.value && resultadoSesion.value.success) ||
    (resultadoSoporte.value && resultadoSoporte.value.success)
  )
})

// Watchers
watch(
  () => props.codigo,
  (nuevoCodigo) => {
    if (nuevoCodigo) {
      busquedaRapida.value = nuevoCodigo
      realizarBusquedaRapida()
    }
  }
)

// Métodos principales
const abrirDiagnostico = (codigo = '') => {
  mostrarDiagnostico.value = true

  if (codigo) {
    busquedaRapida.value = codigo
    diagnosticoActivo.value = codigo
    setTimeout(() => realizarBusquedaRapida(), 100)
  }
}

const cerrarDiagnostico = () => {
  mostrarDiagnostico.value = false
  diagnosticoActivo.value = ''
  emit('cerrar')
}

// Funciones para la interfaz premium
function aplicarSugerencia(sugerencia) {
  busquedaRapida.value = sugerencia.value
  realizarBusquedaRapida()
}

function toggleAyuda() {
  mostrarAyuda.value = !mostrarAyuda.value
}

function abrirConfigAvanzada() {
  $q.notify({
    type: 'info',
    message: 'Configuración avanzada',
    caption: 'Próximamente disponible',
    icon: 'settings',
    position: 'top-right',
  })
}

const realizarBusquedaRapida = async () => {
  if (!busquedaRapida.value.trim()) return

  cargandoBusqueda.value = true

  try {
    const codigo = busquedaRapida.value.trim()
    diagnosticoActivo.value = codigo

    // Determinar tipo de código
    if (codigo.includes('-')) {
      // Es un código de error
      formulario.value.errorCode = codigo
      tabActiva.value = 'errorCode'
      await consultarCodigoError()
    } else if (codigo.startsWith('USR') && !codigo.includes('-')) {
      // Es un baseCode de sesión
      formulario.value.sessionToken = codigo
      tabActiva.value = 'session'
      await consultarSesion()
    } else {
      // Buscar en ambos
      await Promise.all([consultarCodigoError(codigo), consultarSesion(codigo)])
      tabActiva.value = 'resultados'
    }

    $q.notify({
      type: 'positive',
      message: 'Búsqueda completada',
      caption: `Análisis de: ${codigo}`,
      icon: 'search',
      position: 'top-right',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error en búsqueda',
      caption: error.message,
      position: 'top-right',
    })
  } finally {
    cargandoBusqueda.value = false
  }
}

const consultarCodigoError = async (codigo = null) => {
  const errorCode = codigo || formulario.value.errorCode
  if (!errorCode || !String(errorCode).trim()) return

  cargandoError.value = true

  try {
    console.log(`🔍 Consultando código de error: ${errorCode}`)
    resultadoError.value = await DiagnosticService.getErrorCodeDetails(errorCode)

    $q.notify({
      type: 'positive',
      message: 'Código de error consultado',
      icon: 'error',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta:', error.message)
    resultadoError.value = DiagnosticService.getSampleErrorData(errorCode)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor (CORS)',
      position: 'top-right',
    })
  } finally {
    cargandoError.value = false
  }
}

const consultarSesion = async (codigo = null) => {
  const baseCode = codigo || formulario.value.sessionToken
  if (!baseCode || !String(baseCode).trim()) return

  cargandoSesion.value = true

  try {
    console.log(`🔍 Consultando sesión por baseCode: ${baseCode}`)
    resultadoSesion.value = await DiagnosticService.getSessionDetails(baseCode)

    $q.notify({
      type: 'positive',
      message: 'Sesión consultada',
      icon: 'account_circle',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta:', error.message)
    resultadoSesion.value = DiagnosticService.getSampleSessionData(baseCode)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor (CORS)',
      position: 'top-right',
    })
  } finally {
    cargandoSesion.value = false
  }
}

const consultarSoporte = async () => {
  if (!formulario.value.supportCode) return

  cargandoSoporte.value = true

  try {
    console.log(`🔍 Consultando soporte: ${formulario.value.supportCode}`)
    resultadoSoporte.value = await DiagnosticService.getSupportDetails(formulario.value.supportCode)

    $q.notify({
      type: 'positive',
      message: 'Información de soporte consultada',
      icon: 'support_agent',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta:', error.message)
    resultadoSoporte.value = DiagnosticService.getSampleSupportData(formulario.value.supportCode)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor (CORS)',
      position: 'top-right',
    })
  } finally {
    cargandoSoporte.value = false
  }
}


const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'

  try {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fecha
  }
}

// Exponer métodos para uso externo
defineExpose({
  abrirDiagnostico,
  cerrarDiagnostico,
})
</script>

<style lang="scss" scoped>
// Premium Diagnostic Modal Styles
.premium-modal-container {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(13, 13, 13, 0.98) 50%,
    rgba(0, 0, 0, 0.95) 100%
  );
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(59, 130, 246, 0.1) 0%,
      transparent 25%,
      transparent 75%,
      rgba(59, 130, 246, 0.1) 100%
    );
    border-radius: inherit;
    z-index: -1;
  }

  // Partículas de fondo
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(2px 2px at 20px 30px, rgba(59, 130, 246, 0.3), transparent),
      radial-gradient(1px 1px at 40px 70px, rgba(34, 197, 94, 0.2), transparent),
      radial-gradient(1px 1px at 90px 40px, rgba(168, 85, 247, 0.2), transparent),
      radial-gradient(2px 2px at 130px 80px, rgba(236, 72, 153, 0.2), transparent);
    background-size: 200px 200px;
    animation: particleFloat 20s linear infinite;
    pointer-events: none;
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  100% {
    transform: translateY(-200px) rotate(360deg);
  }
}

// Header Premium con Efecto Holográfico
.premium-header {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.8) 50%,
      transparent 100%
    );
    animation: scanLine 3s ease-in-out infinite;
  }
}

@keyframes scanLine {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(0%);
  }
}

.holographic-title {
  background: linear-gradient(
    45deg,
    #3b82f6 0%,
    #22c55e 25%,
    #a855f7 50%,
    #ec4899 75%,
    #3b82f6 100%
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: holographicShift 4s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
}

@keyframes holographicShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

// Indicadores de Estado Premium
.status-indicators {
  display: flex;
  gap: 16px;

  .status-card {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    padding: 12px 16px;
    min-width: 120px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;

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
        rgba(59, 130, 246, 0.1) 50%,
        transparent 100%
      );
      transition: left 0.5s ease;
    }

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);

      &::before {
        left: 100%;
      }
    }

    .status-value {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .status-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
}

// Pestañas Premium
.premium-tabs-container {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  padding: 8px;
  backdrop-filter: blur(10px);
}

.premium-tab {
  position: relative;
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &.q-tab--active {
    background: rgba(59, 130, 246, 0.15);

    &::before {
      opacity: 1;
    }

    .tab-indicator {
      transform: scaleX(1);
    }
  }

  &:hover:not(.q-tab--active) {
    background: rgba(255, 255, 255, 0.05);
  }
}

.tab-content-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  position: relative;

  .tab-icon {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
  }

  .tab-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6 0%, #22c55e 50%, #a855f7 100%);
    transition: transform 0.3s ease;
  }
}

// Área de Contenido Premium
.premium-content-area {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 16px;
  margin-top: 16px;
  overflow: hidden;
}

.premium-panels {
  background: transparent;

  .premium-panel {
    padding: 24px;
    background: transparent;
  }
}

// Búsqueda Inteligente Premium
.premium-search-container {
  .search-header-premium {
    margin-bottom: 24px;

    .search-title-container {
      display: flex;
      align-items: center;
      gap: 16px;

      .search-main-icon {
        font-size: 2.5rem;
        color: #3b82f6;
        animation: pulse 2s ease-in-out infinite;
      }

      .search-title {
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .search-subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
      }
    }
  }

  .premium-search-bar {
    position: relative;
    margin-bottom: 32px;

    .search-input-premium {
      .q-field__control {
        background: rgba(15, 23, 42, 0.8);
        border: 2px solid rgba(59, 130, 246, 0.3);
        border-radius: 16px;
        transition: all 0.3s ease;

        &:hover {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }
      }

      &.q-field--focused .q-field__control {
        border-color: #3b82f6;
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
      }
    }

    .search-icon-premium {
      color: rgba(59, 130, 246, 0.8);
      font-size: 1.5rem;
    }

    .search-ai-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
      color: white;
      border-radius: 50%;
      animation: aiPulse 3s ease-in-out infinite;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes aiPulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.5);
  }
}

// Sugerencias Inteligentes
.ai-suggestions-premium {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;

  .suggestions-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .suggestions-icon {
      color: #a855f7;
      font-size: 1.3rem;
      animation: pulse 2s ease-in-out infinite;
    }

    .suggestions-title {
      margin: 0;
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;

    .suggestion-chip {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
      }

      .suggestion-icon {
        color: rgba(59, 130, 246, 0.8);
      }

      .suggestion-content {
        flex: 1;

        .suggestion-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2px;
        }

        .suggestion-value {
          font-weight: 500;
          color: white;
          font-size: 0.85rem;
        }
      }
    }
  }
}

// Estadísticas en Tiempo Real
.realtime-stats {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 20px;

  .stats-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .stats-icon {
      color: #22c55e;
      font-size: 1.3rem;
      animation: pulse 2s ease-in-out infinite;
    }

    .stats-title {
      margin: 0;
      background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 1.8rem;
        font-weight: 700;
        background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  }
}
</style>
