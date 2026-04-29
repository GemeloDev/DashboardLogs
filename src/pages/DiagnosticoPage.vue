<template>
  <q-page class="diagnostic-page text-white">
    <!-- Header Principal -->
    <div class="diagnostic-header bg-gradient-to-r from-grey-9 to-grey-8">
      <div class="container">
        <q-card flat bordered class="dashboard-hero__title-card text-white">
          <div class="diagnostic-header__top row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="diagnostic-eyebrow">
                <q-icon name="medical_services" size="18px" color="cyan-4" />
                <span>{{ t('diagnostic.technicalDiagnostic') }}</span>
              </div>
              <h1 class="hero-title q-mt-md q-mb-sm">
                {{ t('diagnostic.titlePageDiagnosticLineOne') }}
                <span class="orange-santoro">{{ t('layout.diagnostic') }}</span>
                <br />
                {{ t('diagnostic.titlePageDiagnosticLineTwo') }}
              </h1>

              <p class="diagnostic-subtitle q-mb-none">
                {{ t('diagnostic.subtitlePageDiagnostic') }}
              </p>
            </div>

            <div class="col-12 col-md-auto diagnostic-header-actions">
              <div class="row q-col-gutter-sm q-row-gutter-sm">
                <div class="col-12 col-sm-6 col-md-auto">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    :label="t('common.update')"
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
                    :label="t('common.export')"
                    @click="mostrarDialogoExportacion"
                    :disable="!hayDatosParaExportar"
                    unelevated
                    class="diagnostic-action-btn full-width"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="diagnostic-meta q-mt-lg">
            <div class="row q-gutter-sm diagnostic-header-chips">
              <q-chip
                dense
                color="green-6"
                text-color="white"
                icon="wifi"
                size="sm"
                class="diagnostic-status-chip"
              >
                {{ t('common.connected') }}
              </q-chip>

              <q-chip
                v-if="diagnosticoActivo"
                dense
                color="blue-5"
                text-color="white"
                size="sm"
                icon="auto_fix_high"
                class="diagnostic-status-chip"
              >
                {{ diagnosticoActivo }}
              </q-chip>
            </div>
          </div>
        </q-card>
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
                <h3 class="card-title">{{ t('diagnostic.fastSearchTitle') }}</h3>
                <p class="card-subtitle">
                  {{ t('diagnostic.subFastSearchTitle') }}
                </p>
              </div>
            </div>

            <div class="card-body">
              <div class="modern-input-group">
                <q-input
                  v-model="busquedaRapida"
                  class="modern-input"
                  :placeholder="t('diagnostic.fastSearchPlaceholder')"
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
              {{ t('diagnostic.preDiagnosticMessage') }}
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
      :label="t('diagnostic.proccessDiagnostic')"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useQuasar } from 'quasar'
import { DiagnosticService } from '../services/diagnosticService.js'
import ResultadosByToken from 'src/components/escritorio/resultadosEscritorio/ResultadosByToken.vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const filtrosGlobales = inject('filtrosGlobales', ref(null))

// Estado
const cargando = ref(false)
const diagnosticoActivo = ref('')
const busquedaRapida = ref('')
const cargandoBusqueda = ref(false)
const cargandoSesion = ref(false)
const { t } = useI18n()

const formulario = ref({ caseId: '' })
const resultadoCaseId = ref(null)

// Export habilitado si hay items
const hayDatosParaExportar = computed(() => {
  return !!(resultadoCaseId.value?.ok && (resultadoCaseId.value?.data?.items?.length || 0) > 0)
})

const actualizarDatos = async () => {
  cargando.value = true
  diagnosticoActivo.value = t('diagnostic.updatingData')
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    $q.notify({
      type: 'positive',
      message: t('diagnostic.updateSuccess'),
      position: 'top-right',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('diagnostic.updateError'),
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
  diagnosticoActivo.value = t('diagnostic.queryingSession', { caseId })

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
      message: t('diagnostic.sessionConsulted'),
      icon: 'code',
      position: 'top-right',
    })
  } catch (error) {
    console.error('❌ Error en consulta de sesión:', error?.message)
    resultadoCaseId.value = DiagnosticService.getSampleSessionData(caseId)

    $q.notify({
      type: 'warning',
      message: t('diagnostic.usingSampleData'),
      caption: t('diagnostic.serverConnectionError'),
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
      message: t('diagnostic.noExportData'),
      caption: t('diagnostic.queryBeforeExport'),
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
                <span style="background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${t('diagnostic.exportDialogTitle')}</span>
              </h3>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
            <div id="export-pdf" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">📄</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">PDF</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">${t('diagnostic.exportPdfSubtitle')}</p>
              </div>
            </div>

            <div id="export-excel" style="background: linear-gradient(135deg, #059669 0%, #065f46 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">📊</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">EXCEL</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">${t('diagnostic.exportExcelSubtitle')}</p>
              </div>
            </div>

            <div id="export-json" style="background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%); color: white; padding: 28px; border-radius: 16px; cursor: pointer;">
              <div style="text-align:center;">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">💻</div>
                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">JSON</h4>
                <p style="margin: 12px 0 0 0; font-size: 0.9rem; opacity: 0.9;">${t('diagnostic.exportJsonSubtitle')}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 18px; padding: 14px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; text-align: center;">
              ${t('diagnostic.exportDialogHint')}
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
        message: t('diagnostic.noExportData'),
        caption: t('diagnostic.queryBeforeExport'),
        position: 'top-right',
      })
      return
    }

    const items = resultadoCaseId.value.data.items

    const { ExportService } = await import('../services/exportService.js')
    await ExportService.exportSession(items, formato)

    $q.notify({
      type: 'positive',
      message: t('diagnostic.exportSuccess', { format: formato.toUpperCase() }),
      caption: t('diagnostic.exportSuccessCaption'),
      position: 'top-right',
      timeout: 3000,
    })
  } catch (error) {
    console.error('Error en exportación:', error)
    $q.notify({
      type: 'negative',
      message: t('diagnostic.exportError'),
      caption: error?.message || t('diagnostic.exportErrorCaption'),
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

.orange-santoro {
  color: #e97132;
}

.diagnostic-header {
  padding: 24px 0 12px;
}

.dashboard-hero__title-card {
  background: transparent;
  border-radius: 26px;
  padding: 28px 30px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.hero-title {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.diagnostic-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.diagnostic-header-actions {
  position: static !important;
}

.diagnostic-subtitle {
  max-width: 760px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.diagnostic-header-chips {
  flex-wrap: wrap;
}

.diagnostic-meta {
  display: flex;
  flex-wrap: wrap;
}

.diagnostic-status-chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  .dashboard-hero__title-card {
    padding: 20px 18px;
    border-radius: 22px;
  }

  .diagnostic-header__top {
    row-gap: 16px;
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
