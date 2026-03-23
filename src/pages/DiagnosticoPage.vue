<template>
  <q-page class="diagnostic-page text-white">
    <!-- Header Principal -->
    <div class="diagnostic-header bg-gradient-to-r from-grey-9 to-grey-8 q-pa-lg">
      <div class="container">
        <!-- IMPORTANTE: q-row-gutter para separación vertical cuando se apilan -->
        <div class="row items-center q-col-gutter-md q-row-gutter-md">
          <!-- Izquierda: título + subtítulo -->
          <div class="col-12 col-md-8 diagnostic-header-left">
            <div class="text-white text-bold diagnostic-title-block">
              <span class="text-h4">🔬</span>
              <div class="diagnostic-title-main"><span style="color: var(--orange-accent);">Centro de Diagnóstico</span> Técnico</div>

              <div class="text-blue-3 diagnostic-subtitle">
                🛡️ Sistema de Análisis de Errores y Sesiones | 📊 Reportes Avanzados
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="col-12 col-md-4 diagnostic-header-actions">
            <div class="row q-col-gutter-sm q-row-gutter-sm justify-center justify-md-end">
              <!-- XS: col-12 (stack); SM: 6/6; MD: auto -->
              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Actualizar"
                  @click="actualizarDatos"
                  :loading="cargando"
                  unelevated
                  class="diagnostic-action-btn full-width"
                />
              </div>

              <div class="col-12 col-sm-6 col-md-auto">
                <q-btn
                  color="secondary"
                  icon="download"
                  label="Exportar"
                  @click="mostrarDialogoExportacion"
                  :disable="!hayDatosParaExportar"
                  unelevated
                  class="diagnostic-action-btn full-width"
                />
              </div>
            </div>
          </div>

          <!-- Chips (SIEMPRE en su propia fila y centrados) -->
          <div class="col-12">
            <div class="row q-gutter-sm diagnostic-header-chips">
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
        </div>
      </div>
    </div>

    <!-- Contenido ÚNICO: Buscador + Timeline -->
    <div class="diagnostic-content q-pa-lg">
      <div class="container">
        <!-- Buscador (SOLO este input) -->
        <div class="modern-search-panel">
          <div class="modern-card">
            <div class="card-header">
              <div class="header-icon">
                <q-icon name="search" size="32px" color="cyan-1" />
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
                />
                <q-btn
                  class="search-action-btn"
                  icon="send"
                  @click="realizarBusquedaRapida"
                  :loading="cargandoBusqueda"
                  unelevated
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline / Resultados debajo -->
        <div class="row q-mt-md">
          <div class="col-12">
            <ResultadosByToken
              v-if="resultadoCaseId?.ok && (resultadoCaseId?.data?.items?.length || 0) > 0"
              :resultados="resultadoCaseId.data"
            />

            <q-banner
              v-else
              class="q-mt-md"
              rounded
              dense
              style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
              "
            >
              <template v-slot:avatar>
                <q-icon name="info" color="info" />
              </template>
              Ingresa un <b>caseId</b> y presiona enviar para visualizar la línea del tiempo.
            </q-banner>
          </div>
        </div>
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
import { ref, computed, inject } from 'vue'
import { useQuasar } from 'quasar'
import { DiagnosticService } from '../services/diagnosticService.js'
import ResultadosByToken from 'src/components/escritorio/resultadosEscritorio/ResultadosByToken.vue'

const $q = useQuasar()
const filtrosGlobales = inject('filtrosGlobales', ref(null))

// Estado
const cargando = ref(false)
const diagnosticoActivo = ref('')
const busquedaRapida = ref('')
const cargandoBusqueda = ref(false)
const cargandoSesion = ref(false)

const formulario = ref({ caseId: '' })
const resultadoCaseId = ref(null)

// Export habilitado si hay items
const hayDatosParaExportar = computed(() => {
  return !!(resultadoCaseId.value?.ok && (resultadoCaseId.value?.data?.items?.length || 0) > 0)
})

const actualizarDatos = async () => {
  cargando.value = true
  diagnosticoActivo.value = 'Actualizando datos'
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
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

// === BÚSQUEDA RÁPIDA (SOLO caseId) ===
const realizarBusquedaRapida = async () => {
  const caseId = String(busquedaRapida.value || '').trim()
  if (!caseId) return

  cargandoBusqueda.value = true
  try {
    formulario.value.caseId = caseId
    await consultarCaseId(caseId)
  } finally {
    cargandoBusqueda.value = false
  }
}

const consultarCaseId = async (codigo = null) => {
  const caseId = String(codigo || formulario.value.caseId || '').trim()
  if (!caseId) return

  cargandoSesion.value = true
  diagnosticoActivo.value = `Consultando sesión: ${caseId}`

  try {
    const system = filtrosGlobales.value?.system
    console.log(`🔍 Consultando sesión '${system}' por caseId: ${caseId}`)

    resultadoCaseId.value = await DiagnosticService.getCaseId(caseId, system)

    // Top 10 recientes
    const items = resultadoCaseId.value?.data?.items
    const sortedItems = getTop10RecentEvents(items)
    if (resultadoCaseId.value?.data) resultadoCaseId.value.data.items = sortedItems

    $q.notify({
      type: 'positive',
      message: 'Sesión consultada',
      icon: 'code',
      position: 'top-right',
    })
  } catch (error) {
    console.error('❌ Error en consulta de sesión:', error?.message)
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
  if (!Array.isArray(items)) return []
  const sorted = [...items].sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
  return sorted.slice(0, 15)
}

// === EXPORTACIONES ===
const mostrarDialogoExportacion = () => {
  const tieneSesiones = hayDatosParaExportar.value
  if (!tieneSesiones) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos disponibles para exportar',
      caption: 'Realiza primero una consulta por caseId',
      position: 'top-right',
    })
    return
  }

  const dialogRef = $q.dialog({
    message: `
      <div style="padding: 0; margin: 0;">
        <div style="border-radius: 20px;">
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); color: white; padding: 24px; border-radius: 16px; margin-bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 1;">
              <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700;">
                <span style="background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">✨ Exportación Avanzada de Datos</span>
              </h3>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
            <div id="export-pdf" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">📄</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">PDF</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Reporte detallado</p>
              </div>
            </div>

            <div id="export-excel" style="background: linear-gradient(135deg, #059669 0%, #065f46 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">📊</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">EXCEL</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Timeline + datos</p>
              </div>
            </div>

            <div id="export-json" style="background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">💻</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">JSON</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Datos técnicos</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 18px; padding: 14px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; text-align: center;">
              💡 PDF para reporte, Excel para análisis, JSON para integración.
            </p>
          </div>
        </div>
      </div>
    `,
    html: true,
    persistent: false,
    ok: false,
    style:
      'padding: 0; margin: 0; color: #ffff; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); border-radius: 12px;',
  })

  setTimeout(() => {
    const pdfBtn = document.getElementById('export-pdf')
    const excelBtn = document.getElementById('export-excel')
    const jsonBtn = document.getElementById('export-json')

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

    if (!hayDatosParaExportar.value) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos disponibles para exportar',
        caption: 'Realiza primero una consulta por caseId',
        position: 'top-right',
      })
      return
    }

    const items = resultadoCaseId.value.data.items

    const { ExportService } = await import('../services/exportService.js')
    await ExportService.exportSession(items, formato)

    $q.notify({
      type: 'positive',
      message: `Exportación ${formato.toUpperCase()} completada`,
      caption: 'Sesión exportada correctamente',
      position: 'top-right',
      timeout: 3000,
    })
  } catch (error) {
    console.error('Error en exportación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error en la exportación',
      caption: error?.message || 'No se pudo completar la exportación',
      position: 'top-right',
    })
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="scss" scoped>
.diagnostic-page {
  min-height: 100vh;
}

/* Evita conflictos con clases globales tipo header-actions */
.diagnostic-header-actions {
  position: static !important;
}

/* Bloque de título */
.diagnostic-title-block {
  text-align: left;
}

.diagnostic-title-main {
  font-size: 3rem;
  line-height: 1.1;
  margin-top: 6px;
}

.diagnostic-subtitle {
  margin-top: 10px;
  font-size: 1.05rem;
  line-height: 1.25;
  font-weight: 600;
  opacity: 0.95;
}

/* Chips */
.diagnostic-header-chips {
  flex-wrap: wrap;
}

/* Botones: que el texto NO se salga y no se rompa */
.diagnostic-action-btn {
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  height: 44px;
  min-width: 0;
  max-width: 100%;
}

.diagnostic-action-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  max-width: 100%;
  min-width: 0;
}

.diagnostic-action-btn :deep(.q-btn__content .block) {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Card + input (reusando tu look moderno) */
// Cards modernos
.modern-card {
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

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

.card-body {
  padding: 2rem;
}

.modern-input-group {
  display: flex;
  gap: 1rem;

  .modern-input {
    flex: 1;

    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      min-height: 56px;
      padding-left: 1%;
      transition: all 0.25s ease;

      &:hover {
        border-color: rgba(52, 121, 211, 0.5);
        background: rgba(255, 255, 255, 0.08);
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
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 16px;
    padding: 0 2rem;
    box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(79, 172, 254, 0.4);
    }
  }
}

/* MOBILE: centrar todo y compactar tipografía */
@media (max-width: 600px) {
  .diagnostic-title-block {
    text-align: center;
  }

  .diagnostic-title-main {
    font-size: 2.7rem;
  }

  .diagnostic-subtitle {
    font-size: 0.95rem;
  }

  .diagnostic-action-btn {
    height: 36px;
    font-size: 0.85rem;
    letter-spacing: 0.2px; /* ayuda a que no “reviente” */
  }

  .modern-card .card-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .modern-input-group {
    display: grid;
  }
}
</style>
