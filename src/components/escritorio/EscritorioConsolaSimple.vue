<template>
  <q-dialog
    v-model="consoleStore.consoleOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarConsola"
    @hide="cerrarConsola"
  >
    <q-card class="console-modal-card console-dialog-fullscreen text-white">
      <q-card-section class="console-header bg-dark-10">
        <div class="row">
          <div class="col">
            <div class="card-title q-mt-md">
              <q-icon name="history_edu" class="q-mr-sm" color="primary" />
              {{ t('consoleSimple.title') }} - {{ currentSystem }}
              <q-chip
                v-if="logs.length || rawLogs.length"
                color="primary"
                text-color="color-orange-santoro"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ t('consoleSimple.eventsCounter', { visible: logs.length, total: serverTotalElements }) }}
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm">
              <span v-if="logs.length !== rawLogs.length" class="text-amber">
                <q-icon name="filter_alt" /> {{ t('consoleSimple.activeFilters') }}
              </span>
              <span v-else>{{ t('consoleSimple.showingAllRecords') }}</span>
            </div>
          </div>

          <div class="col-auto">
            <q-btn-dropdown round color="secondary" icon="upload" class="no-arrow q-mr-xs">
              <q-list>
                <q-item clickable v-close-popup @click="exportLogs('excel')">
                  <q-item-section>
                    <q-item-label>{{ t('consoleSimple.exportExcel') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportLogs('json')">
                  <q-item-section>
                    <q-item-label>{{ t('consoleSimple.exportJson') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportLogs('csv')">
                  <q-item-section>
                    <q-item-label>{{ t('consoleSimple.exportCsv') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportLogs('txt')">
                  <q-item-section>
                    <q-item-label>{{ t('consoleSimple.exportTxt') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn icon="minimize" flat round color="grey-4" @click="cerrarConsola" class="q-mr-sm">
              <q-tooltip>{{ t('consoleSimple.minimizeTooltip') }}</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarConsola">
              <q-tooltip>{{ t('consoleSimple.closeTooltip') }}</q-tooltip>
            </q-btn>
          </div>

          <div class="col-12 q-pt-md">
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
                    {{ t('consoleSimple.filterPanelTitle') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center">
                    <q-icon
                      :name="filtrosToggle ? 'expand_less' : 'expand_more'"
                      color="cyan-4"
                      size="20px"
                    />
                  </div>
                </q-item-section>
              </template>

              <DinamicFilters
                ref="filtroRef"
                :datos-origen="rawLogs"
                @campos-seleccionados="onFiltrosPayload"
                @camposSeleccionados="onFiltrosPayload"
              />
            </q-expansion-item>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="console-body">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-grid color="primary" size="80px" />
          <div class="q-mt-lg text-h6">{{ t('consoleSimple.loadingLogs') }}</div>
        </div>

        <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="filter_list_off" size="100px" color="grey-7" />
          <div class="text-h6 text-grey-5 q-mt-md">
            {{ t('consoleSimple.emptyLogs') }}
          </div>
        </div>

        <div v-else>
          <div class="row justify-center items-stretch q-gutter-sm">
            <div
              v-for="(log, index) in logsPaginados"
              :key="log.id || index"
              class="col-xs-12 col-sm-12 col-auto width-responsive"
            >
              <ConsoleCard :log="log" @click="!authService.hasRole('VIEWER') ? mostrarDetalleLog(log) : ''" />
            </div>
          </div>
        </div>
      </q-card-section>
      <div class="pagination-section">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <div class="pagination-info text-caption text-grey-4">
              {{
                t('consoleSimple.paginationSummary', {
                  from: (paginaActual - 1) * registrosPorPagina + 1,
                  to: Math.min(paginaActual * registrosPorPagina, serverTotalElements),
                  total: serverTotalElements,
                })
              }}
            </div>

            <div v-if="loadingMore" class="text-caption text-grey-5 q-mt-xs">
              <q-spinner-dots size="18px" class="q-mr-sm" /> {{ t('consoleSimple.loadingMoreEvents') }}
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4 text-center">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="7"
              direction-links
              color="primary"
              active-design="flat"
              active-color="white"
              active-text-color="primary"
              size="sm"
              @update:model-value="onPageChanged"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>

  <DetailDialog v-model="modalDetalle" :log="logSeleccionado" />
</template>

<script setup>
import { ref, computed, inject, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import DinamicFilters from '../blocks/DinamicFilters.vue'
import ConsoleCard from '../blocks/ConsoleCard.vue'
import DetailDialog from '../blocks/DetailDialog.vue'
import { ChartDataService } from 'src/services/chartDataService'
import { useConsoleFiltersStore } from 'src/stores/consoleFilters.store'
import ConsoleExportService from 'src/services/consoleExportService'
import authService from 'src/services/authService'

const $q = useQuasar()
const { t } = useI18n()

const filtrosGlobales = inject('filtrosGlobales', ref(null))

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
// Claves que el backend acepta como query params (filtros server-side).
// Todo lo que DinamicFilters emita con estas claves se envía al backend;
// el resto se filtra client-side.
const SERVER_FILTER_KEYS = new Set(['eventType', 'status', 'severity', 'outcome'])

// ─── ESTADO ───────────────────────────────────────────────────────────────────
const consoleStore = useConsoleFiltersStore()
const loading = ref(false)
const filtrosToggle = ref(true)
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const filtroRef = ref(null)

// ─── DATOS ────────────────────────────────────────────────────────────────────
const baseLogs = ref([])       // lo que regresa el backend (ya filtrado por server params)
const rawLogs = ref([])        // fuente para DinamicFilters (= baseLogs, ya no se filtra rango en cliente)
const logs = ref([])           // vista final tras filtros client-side
const lastPayload = ref(null)  // último payload de DinamicFilters

// Filtros server-side activos (para detectar cambios y decidir re-fetch)
const activeServerParams = ref({
  fromDate: '',
  toDate: '',
  eventType: '',
  status: '',
  severity: '',
  outcome: '',
  sortDir: 'DESC',
})

// ─── PAGINACIÓN ───────────────────────────────────────────────────────────────
const paginaActual = ref(1)
const registrosPorPagina = ref(25)
const serverPage = ref(-1)
const serverTotalPages = ref(1)
const serverTotalElements = ref(0)
const pageSize = ref(500)
const loadingMore = ref(false)
const isChartDataMode = ref(false)

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const logsPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value
  const fin = inicio + registrosPorPagina.value
  return logs.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(logs.value.length / registrosPorPagina.value) || 1
})

const hasMore = computed(() => serverPage.value + 1 < serverTotalPages.value)

const currentSystem = computed(() => filtrosGlobales?.value?.system || '')

const logsToExport = computed(() => {
  return Array.isArray(logs.value) ? logs.value : []
})

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getDeep = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : null), obj)

function mergeUniqueById(target, incoming) {
  const map = new Map((Array.isArray(target) ? target : []).map((x) => [x?.id, x]))
  for (const it of Array.isArray(incoming) ? incoming : []) {
    const key = it?.id ?? `${it?.caseId ?? ''}-${it?.eventTime ?? ''}-${Math.random()}`
    if (!map.has(key)) map.set(key, it)
  }
  return Array.from(map.values())
}

/**
 * Extrae los parámetros server-side desde el payload de DinamicFilters.
 * Retorna { serverParams, clientPayload }.
 */
function splitPayload(payload) {
  if (!payload) return { serverParams: {}, clientPayload: null }

  const { busqueda = '', rangoFechas, _visibleFields, ...values } = payload

  const serverParams = {}
  const clientValues = {}

  for (const [k, v] of Object.entries(values)) {
    if (SERVER_FILTER_KEYS.has(k) && v != null && v !== '') {
      serverParams[k] = v
    } else {
      clientValues[k] = v
    }
  }

  // Rango de fechas → server-side
  const from = rangoFechas?.from || ''
  const to = rangoFechas?.to || ''
  if (from) serverParams.fromDate = from
  if (to) serverParams.toDate = to

  const clientPayload = { busqueda, _visibleFields, ...clientValues }

  return { serverParams, clientPayload }
}

/**
 * Filtra items SOLO con las claves que el backend NO maneja.
 */
function aplicarFiltrosClientSide(items, payload) {
  if (!payload) return items || []

  const { busqueda = '', _visibleFields, ...values } = payload
  const search = (busqueda || '').trim().toLowerCase()

  let out = Array.isArray(items) ? items : []

  out = out.filter((log) => {
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue
      if (SERVER_FILTER_KEYS.has(k)) continue

      const actual = getDeep(log, k)

      if (Array.isArray(actual)) {
        const norm = actual.map((x) => String(x))
        if (!norm.includes(String(v))) return false
        continue
      }

      if (String(actual) !== String(v)) return false
    }
    return true
  })

  if (search) out = out.filter((l) => JSON.stringify(l).toLowerCase().includes(search))

  console.log('Filtrado client-side:', { payload, total: items?.length ?? 0, filtrados: out.length, _visibleFields })
  return out
}

// ─── VISTA ────────────────────────────────────────────────────────────────────
function recomputarVista({ resetPage = true } = {}) {
  rawLogs.value = baseLogs.value

  const { clientPayload } = splitPayload(lastPayload.value)
  logs.value = aplicarFiltrosClientSide(rawLogs.value, clientPayload)

  if (resetPage) paginaActual.value = 1
}

function resetServerPaging() {
  baseLogs.value = []
  serverPage.value = -1
  serverTotalPages.value = 1
  serverTotalElements.value = 0
}

// ─── COMUNICACIÓN CON BACKEND ─────────────────────────────────────────────────
function buildFetchParams(page) {
  const params = {
    system: currentSystem.value,
    page,
    size: pageSize.value,
  }

  const sp = activeServerParams.value
  if (sp.fromDate)  params.fromDate  = sp.fromDate
  if (sp.toDate)    params.toDate    = sp.toDate
  if (sp.sortDir)   params.sortDir   = sp.sortDir
  if (sp.eventType) params.eventType = sp.eventType
  if (sp.status)    params.status    = sp.status
  if (sp.severity)  params.severity  = sp.severity
  if (sp.outcome)   params.outcome   = sp.outcome

  return params
}

async function fetchPage(page, { resetPage = false } = {}) {
  const params = buildFetchParams(page)
  const resp = await ChartDataService.getLogsEvents(params)

  serverPage.value        = Number(resp?.page ?? resp?.currentPage ?? page)
  serverTotalPages.value  = Number(resp?.totalPages ?? 1)
  serverTotalElements.value = Number(resp?.totalElements ?? resp?.totalItems ?? 0)

  const items = Array.isArray(resp?.items) ? resp.items : []
  baseLogs.value = mergeUniqueById(baseLogs.value, items)

  recomputarVista({ resetPage })
}

async function cargarPaginaInicial() {
  loading.value = true
  try {
    resetServerPaging()
    await fetchPage(0, { resetPage: true })
  } finally {
    loading.value = false
  }
}

async function cargarMas() {
  if (!hasMore.value || loadingMore.value || isChartDataMode.value) return
  loadingMore.value = true
  try {
    await fetchPage(serverPage.value + 1, { resetPage: false })
  } finally {
    loadingMore.value = false
  }
}

/**
 * Detecta si los parámetros server-side cambiaron.
 * Si cambiaron, actualiza activeServerParams y retorna true → necesita re-fetch.
 */
function applyServerParams(newParams) {
  const prev = activeServerParams.value
  let changed = false

  for (const key of ['fromDate', 'toDate', 'eventType', 'status', 'severity', 'outcome']) {
    if ((newParams[key] || '') !== (prev[key] || '')) {
      changed = true
      break
    }
  }

  if (changed) {
    activeServerParams.value = {
      ...prev,
      fromDate:  newParams.fromDate  || '',
      toDate:    newParams.toDate    || '',
      eventType: newParams.eventType || '',
      status:    newParams.status    || '',
      severity:  newParams.severity  || '',
      outcome:   newParams.outcome   || '',
    }
  }

  return changed
}

// ─── FUNCIONES PRINCIPALES (expuestas) ────────────────────────────────────────
const abrirConsola = async (dataGrafica = null) => {
  if (Array.isArray(dataGrafica) && dataGrafica.length > 0) {
    isChartDataMode.value = true
    baseLogs.value = [...dataGrafica]
    serverTotalElements.value = dataGrafica.length
    serverTotalPages.value = 1
    serverPage.value = 0
    lastPayload.value = null
    recomputarVista()
  } else {
    isChartDataMode.value = false
    await cargarPaginaInicial()
  }

  consoleStore.consoleOpen = true
  filtrosToggle.value = true
  paginaActual.value = 1

  setTimeout(() => { filtrosToggle.value = false }, 600)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ensureDinamicFiltersReady() {
  for (let i = 0; i < 20; i++) {
    if (filtroRef.value?.applyChartFilter) return true
    await nextTick()
    await sleep(50)
  }
  return false
}

const abrirConsolaConFiltros = async (selections = []) => {
  let range = null
  const other = []

  for (const sel of selections) {
    if (!sel?.fieldKey) continue
    if (sel.fieldKey === 'rangoFechas') range = sel.value
    else other.push(sel)
  }

  isChartDataMode.value = false

  // Pre-aplicar server params antes de la primera carga
  const preServerParams = { ...activeServerParams.value }
  if (range?.from) preServerParams.fromDate = range.from
  if (range?.to)   preServerParams.toDate   = range.to

  for (const sel of other) {
    if (SERVER_FILTER_KEYS.has(sel.fieldKey)) {
      preServerParams[sel.fieldKey] = sel.value
    }
  }

  applyServerParams(preServerParams)

  loading.value = true
  try {
    await cargarPaginaInicial()
  } finally {
    loading.value = false
  }

  consoleStore.consoleOpen = true
  filtrosToggle.value = true
  paginaActual.value = 1

  await nextTick()
  const ok = await ensureDinamicFiltersReady()
  if (!ok) return

  if (range?.from || range?.to) {
    filtroRef.value?.setRangoFechas?.({ from: range.from || '', to: range.to || '' })
  }

  for (const sel of other) {
    filtroRef.value.applyChartFilter(sel.fieldKey, sel.value)
  }
}

const abrirConsolaConFiltro = async (fieldKey, value) => {
  // Si el filtro es server-side, pre-aplicarlo antes de cargar
  if (SERVER_FILTER_KEYS.has(fieldKey)) {
    applyServerParams({ ...activeServerParams.value, [fieldKey]: value })
  }

  if (!consoleStore.consoleOpen) {
    await abrirConsola()
  } else {
    if (!baseLogs.value.length && !isChartDataMode.value) {
      await cargarPaginaInicial()
    }
  }

  filtrosToggle.value = true
  await nextTick()

  const ok = await ensureDinamicFiltersReady()
  if (!ok) {
    console.warn('⚠️ DinamicFilters no estuvo listo para aplicar filtro')
    return
  }

  filtroRef.value.applyChartFilter(fieldKey, value)
}

const abrirConsolaConDataYFiltros = async (dataGrafica = [], selections = []) => {
  await abrirConsola(dataGrafica)

  filtrosToggle.value = true
  await nextTick()
  const ok = await ensureDinamicFiltersReady()
  if (!ok) return

  const rangeSel = selections.find((s) => s?.fieldKey === 'rangoFechas')
  if (rangeSel?.value) {
    filtroRef.value?.setRangoFechas?.(rangeSel.value)
    await nextTick()
  }

  for (const sel of selections) {
    if (!sel?.fieldKey || sel.fieldKey === 'rangoFechas') continue
    filtroRef.value?.applyChartFilter?.(sel.fieldKey, sel.value)
  }
}

// ─── HANDLER FILTROS DESDE DinamicFilters ─────────────────────────────────────
const onFiltrosPayload = async (payload) => {
  lastPayload.value = payload

  // Modo gráfica: solo filtrar client-side
  if (isChartDataMode.value) {
    recomputarVista({ resetPage: true })
    return
  }

  // Separar parámetros server vs client
  const { serverParams } = splitPayload(payload)
  const needsRefetch = applyServerParams(serverParams)

  if (needsRefetch) {
    // Server params cambiaron → re-fetch desde página 0
    await cargarPaginaInicial()
  } else {
    // Solo cambiaron filtros client-side → recomputar localmente
    recomputarVista({ resetPage: true })
  }
}

// ─── PAGINACIÓN UI ────────────────────────────────────────────────────────────
const onPageChanged = async () => {
  scrollArriba()

  if (!consoleStore.consoleOpen) return
  if (isChartDataMode.value) return

  const atLastPage = paginaActual.value >= totalPaginas.value
  if (atLastPage && hasMore.value && !loadingMore.value) {
    await cargarMas()
  }
}

// ─── EXPORTACIÓN ──────────────────────────────────────────────────────────────
function exportLogs(format) {
  try {
    const items = logsToExport.value
    const base = `logs-${currentSystem.value || 'all'}`

    if (format === 'excel') return ConsoleExportService.exportExcel(items, base)
if (format === 'csv')   return ConsoleExportService.exportCSV(items, base)
if (format === 'json')  return ConsoleExportService.exportJSON(items, base)
if (format === 'txt')   return ConsoleExportService.exportTXT(items, base)

    throw new Error(t('consoleSimple.unsupportedFormat'))
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e.message || t('consoleSimple.exportError') })
  }
}

// ─── MISC ─────────────────────────────────────────────────────────────────────
const cerrarConsola = () => {
  consoleStore.consoleOpen = false
  logs.value = []
  rawLogs.value = []
  baseLogs.value = []
  lastPayload.value = null
  isChartDataMode.value = false
  resetServerPaging()
  activeServerParams.value = {
    fromDate: '', toDate: '', eventType: '', status: '',
    severity: '', outcome: '', sortDir: 'DESC',
  }
}

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true
}

const scrollArriba = () => {
  const container = document.querySelector('.console-body')
  if (container) container.scrollTop = 0
}

// ─── WATCHERS ─────────────────────────────────────────────────────────────────
watch(currentSystem, async () => {
  if (!consoleStore.consoleOpen) return
  if (isChartDataMode.value) return
  await cargarPaginaInicial()
})

watch(
  () => consoleStore.pendingSelection,
  async (sel) => {
    if (!sel) return

    consoleStore.openConsole?.()

    if (!baseLogs.value.length && !isChartDataMode.value) {
      await cargarPaginaInicial()
    }

    filtrosToggle.value = true
    await nextTick()
    filtroRef.value?.applyChartFilter?.(sel.fieldKey, sel.value)

    consoleStore.clearPending()
  },
  { immediate: true, flush: 'post' },
)

// ─── EXPOSE ───────────────────────────────────────────────────────────────────
defineExpose({
  abrirConsola,
  abrirConsolaConFiltro,
  abrirConsolaConFiltros,
  abrirConsolaConDataYFiltros,
  cerrarConsola,
})
</script>

<style lang="scss" scoped>
.console-modal-card {
  background: rgb(29, 29, 43);
  height: 100vh;
  display: flex;
  flex-direction: column;
  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
}

.console-body {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

// Grid Responsivo
.responsive-logs-grid {
  display: grid;
  gap: 14px;
  padding: 14px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 100%;
  overflow-x: hidden;
  transition: opacity 0.2s ease-in-out;
}

.width-responsive {
  width: 323px;
  @media (max-width: 600px) {
    width: 100%;
  }
}

// Estilos de los controles en cabecera
.console-controls {
  padding: 12px 16px;

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
  @media (min-width: 768px) and (max-width: 1024px) {
    .row {
      margin: -6px;
      > div {
        padding: 6px;
      }
    }
  }
}

// Responsive Grid Adjustments
@media (min-width: 768px) and (max-width: 1024px) {
  .responsive-logs-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: 12px;
    padding: 12px;
  }
}

// Paginación "Sticky" (Fijada abajo)
.pagination-section {
  // Posicionamiento
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100; // Asegura que flote sobre los items de la lista

  // Estilos visuales
  padding: 16px 24px;
  background: rgba(29, 29, 43, 0.95); // Fondo semitransparente oscuro (ajusta al color de tu tema)
  backdrop-filter: blur(8px); // Efecto de desenfoque estilo "Glass"
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4); // Sombra hacia arriba para dar profundidad

  .pagination-info {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 767px) {
      text-align: center;
      margin-bottom: 8px;
    }
  }

  .q-pagination {
    // Estilos personalizados para los botones de paginación
    .q-btn {
      font-weight: 600;
      opacity: 0.8;
      transition: all 0.2s ease;

      &.q-btn--active {
        opacity: 1;
        transform: scale(1.1);
        font-weight: 700;
        background: rgba(255, 255, 255, 0.15); // Fondo sutil para el activo
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      &:hover:not(.disabled) {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Ajustes Responsivos
@media (max-width: 768px) {
  .pagination-section {
    padding: 12px 16px; // Reducir padding en móviles

    .row {
      flex-direction: column-reverse; // Pone la paginación arriba del texto en móviles
      gap: 12px;

      .col-12 {
        text-align: center;
        padding: 0; // Resetear gutter
      }
    }
  }
}

// Expansion Item Moderno
.filter-expansion-modern {
  .q-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    &:hover {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(42, 82, 152, 0.3);
      animation: filter-glow 2s infinite;
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

.no-arrow :deep(.q-btn-dropdown__arrow-container) {
  display: none;
}

@keyframes filter-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.6);
  }
}
</style>
