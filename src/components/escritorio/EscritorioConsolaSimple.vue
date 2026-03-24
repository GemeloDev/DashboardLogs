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
              Bitácora de Eventos - {{ currentSystem }}
              <q-chip
                v-if="logs.length || rawLogs.length"
                color="primary"
                text-color="color-orange-santoro"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ logs.length }} / {{ rawLogs.length }} eventos
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm">
              <span v-if="logs.length !== rawLogs.length" class="text-amber">
                <q-icon name="filter_alt" /> Filtros activos
              </span>
              <span v-else>Mostrando todos los registros</span>
            </div>
          </div>

          <div class="col-auto">
            <q-btn-dropdown round color="secondary" icon="upload" class="no-arrow q-mr-xs">
              <q-list>
                <q-item clickable v-close-popup @click="exportLogs('excel')">
                  <q-item-section>
                    <q-item-label>Excel (.xlsx)</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportLogs('json')">
                  <q-item-section>
                    <q-item-label>JSON (.json)</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportLogs('txt')">
                  <q-item-section>
                    <q-item-label>Texto (.txt)</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn icon="minimize" flat round color="grey-4" @click="cerrarConsola" class="q-mr-sm">
              <q-tooltip>Minimizar</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarConsola">
              <q-tooltip>Cerrar</q-tooltip>
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
                    Panel de Filtros Dinámicos
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
          <div class="q-mt-lg text-h6">Cargando logs...</div>
        </div>

        <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="filter_list_off" size="100px" color="grey-7" />
          <div class="text-h6 text-grey-5 q-mt-md">
            No se encontraron registros con los filtros actuales
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
              Mostrando {{ (paginaActual - 1) * registrosPorPagina + 1 }} -
              {{ Math.min(paginaActual * registrosPorPagina, logs.length) }}
              de {{ logs.length }} registros
            </div>

            <div v-if="loadingMore" class="text-caption text-grey-5 q-mt-xs">
              <q-spinner-dots size="18px" class="q-mr-sm" /> Cargando más eventos...
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
import DinamicFilters from '../blocks/DinamicFilters.vue'
import ConsoleCard from '../blocks/ConsoleCard.vue'
import DetailDialog from '../blocks/DetailDialog.vue'
import { ChartDataService } from 'src/services/chartDataService'
import { useConsoleFiltersStore } from 'src/stores/consoleFilters.store'
import ConsoleExportService from 'src/services/consoleExportService'
import authService from 'src/services/authService'

const $q = useQuasar()

const filtrosGlobales = inject('filtrosGlobales', ref(null))

// --- ESTADO ---
const consoleStore = useConsoleFiltersStore()
const loading = ref(false)
const filtrosToggle = ref(true)
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const filtroRef = ref(null)

// --- DATOS ---
const baseLogs = ref([]) // ✅ fuente de verdad: lo que regresa el backend (ya filtrado por system) - acumulador (lo que ya descargaste del backend)
const rawLogs = ref([]) // fuente para DinamicFilters (ya con rango aplicado)
const logs = ref([]) // vista final
const lastPayload = ref(null)

// --- PAGINACIÓN ---
const paginaActual = ref(1)
const registrosPorPagina = ref(25)
const serverPage = ref(-1) // última page cargada (0-based). -1 = ninguna
const serverTotalPages = ref(1)
const serverTotalElements = ref(0)
const pageSize = ref(500) // tamaño recomendado (200/300/500)
const loadingMore = ref(false)
const isChartDataMode = ref(false) // si abres con dataGrafica, no paginamos backend

// --- COMPUTED ---
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

const globalRange = computed(() => filtrosGlobales?.value?.rangoFechas || { from: '', to: '' })

const logsToExport = computed(() => {
  return Array.isArray(logs.value) ? logs.value : []
})

const getDeep = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : null), obj)

function mergeUniqueById(target, incoming) {
  const map = new Map((Array.isArray(target) ? target : []).map((x) => [x?.id, x]))
  for (const it of Array.isArray(incoming) ? incoming : []) {
    const key = it?.id ?? `${it?.caseId ?? ''}-${it?.eventTime ?? ''}-${Math.random()}`
    if (!map.has(key)) map.set(key, it)
  }
  return Array.from(map.values())
}

function toMs(val) {
  if (val == null) return NaN
  if (typeof val === 'number') return val
  if (val instanceof Date) return val.getTime()
  return new Date(String(val)).getTime()
}

function aplicarFiltroRango(items, range = { from: '', to: '' }) {
  const { startMs, endMs } = rangeToMsLocal(range)
  if (startMs === -Infinity && endMs === Infinity) return Array.isArray(items) ? items : []

  return (Array.isArray(items) ? items : []).filter((e) => {
    const t = toMs(e?.eventTime || e?.fechaHoraDia)
    if (!Number.isFinite(t)) return false
    return t >= startMs && t <= endMs
  })
}

function aplicarPayloadLocal(items, payload) {
  if (!payload) return items || []

  const { busqueda = '', rangoFechas, _visibleFields, ...values } = payload

  console.log('✅ Payload para el filtrado de datos: ', {
    busqueda,
    rangoFechas,
    _visibleFields,
    values,
  })

  const search = (busqueda || '').trim().toLowerCase()

  let out = Array.isArray(items) ? items : []

  out = out.filter((log) => {
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue

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

  //  Busqueda
  if (search) out = out.filter((l) => JSON.stringify(l).toLowerCase().includes(search))

  return out
}

function recomputarVista({ resetPage = true } = {}) {
  const rango = lastPayload.value?.rangoFechas || globalRange.value
  rawLogs.value = aplicarFiltroRango(baseLogs.value, rango)
  logs.value = aplicarPayloadLocal(rawLogs.value, lastPayload.value)

  if (resetPage) paginaActual.value = 1
}

function resetServerPaging() {
  baseLogs.value = []
  serverPage.value = -1
  serverTotalPages.value = 1
  serverTotalElements.value = 0
}

function rangeToMsLocal(range) {
  const from = String(range?.from || '').trim()
  const to = String(range?.to || '').trim()
  if (!from && !to) return { startMs: -Infinity, endMs: Infinity }

  const startStr = from || to
  const endStr = to || from

  const startMs = new Date(`${startStr}T00:00:00`).getTime()
  const endMs = new Date(`${endStr}T23:59:59.999`).getTime()
  return { startMs, endMs }
}

// ✅ descarga páginas hasta que ya tenemos eventos con eventTime <= startMs (o hasta límites)
async function cargarHastaRango(range) {
  const { startMs } = rangeToMsLocal(range)

  resetServerPaging()
  baseLogs.value = []

  let page = 0
  let oldestFetched = Infinity

  // límites para no matar el navegador (ajusta a gusto)
  const MAX_PAGES = 40
  const MAX_ITEMS = 10000

  while (page < MAX_PAGES && baseLogs.value.length < MAX_ITEMS) {
    const resp = await ChartDataService.getLogsEvents({
      system: currentSystem.value,
      page,
      size: pageSize.value,
    })

    serverPage.value = Number(resp?.page ?? page)
    serverTotalPages.value = Number(resp?.totalPages ?? 1)
    serverTotalElements.value = Number(resp?.totalElements ?? 0)

    const items = Array.isArray(resp?.items) ? resp.items : []
    if (!items.length) break

    baseLogs.value = mergeUniqueById(baseLogs.value, items)

    // oldest de ESTA página
    let pageOldest = Infinity
    for (const it of items) {
      const t = toMs(it?.eventTime || it?.fechaHoraDia)
      if (Number.isFinite(t) && t < pageOldest) pageOldest = t
    }
    if (Number.isFinite(pageOldest) && pageOldest < oldestFetched) oldestFetched = pageOldest

    // ✅ si ya llegamos a eventos tan viejos como el inicio del rango, podemos parar
    if (oldestFetched <= startMs) break

    // si ya no hay más páginas
    if (page + 1 >= serverTotalPages.value) break

    page += 1
  }
}

function getOldestLoadedMs() {
  let oldest = Infinity
  for (const it of baseLogs.value || []) {
    const t = toMs(it?.eventTime || it?.fechaHoraDia)
    if (Number.isFinite(t) && t < oldest) oldest = t
  }
  return oldest
}

async function ensureCoverageForRange(range) {
  const { startMs } = rangeToMsLocal(range)
  if (!Number.isFinite(startMs)) return

  // Asegura que exista al menos la primera página
  if (!baseLogs.value.length) {
    await cargarPaginaInicial()
  }

  // Si ya tenemos data suficientemente vieja, no hacemos nada
  let oldest = getOldestLoadedMs()
  if (!Number.isFinite(oldest) || oldest <= startMs) return

  // Cargar más páginas hasta cubrir el inicio del rango (con límites)
  const MAX_EXTRA_PAGES = 30
  let guards = 0

  loadingMore.value = true
  try {
    while (oldest > startMs && hasMore.value && guards < MAX_EXTRA_PAGES) {
      await fetchPage(serverPage.value + 1, { resetPage: false })
      oldest = getOldestLoadedMs()
      guards++
    }
  } finally {
    loadingMore.value = false
  }
}

async function cargarPaginaInicial() {
  loading.value = true
  try {
    resetServerPaging()
    await fetchPage(0, { resetPage: true }) // ✅ reset a la página 1
  } finally {
    loading.value = false
  }
}

async function cargarMas() {
  if (!hasMore.value || loadingMore.value || isChartDataMode.value) return
  loadingMore.value = true
  try {
    await fetchPage(serverPage.value + 1, { resetPage: false }) // ✅ NO reset
  } finally {
    loadingMore.value = false
  }
}

// --- FUNCIONES PRINCIPALES ---
/**
 * Abre la consola y decide qué datos cargar
 * @param {Array|null} dataGrafica - Datos opcionales si vienen de un click en gráfica
 */
const abrirConsola = async (dataGrafica = null) => {
  if (Array.isArray(dataGrafica) && dataGrafica.length > 0) {
    // ✅ Modo "desde gráfica": no hay paginación backend
    isChartDataMode.value = true
    baseLogs.value = [...dataGrafica]
    serverTotalElements.value = dataGrafica.length
    serverTotalPages.value = 1
    serverPage.value = 0
    lastPayload.value = null
    recomputarVista()
  } else {
    // ✅ Modo "backend paginado"
    isChartDataMode.value = false
    await cargarPaginaInicial()
  }

  consoleStore.consoleOpen = true
  filtrosToggle.value = true
  paginaActual.value = 1

  setTimeout(() => {
    filtrosToggle.value = false
  }, 600)
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
  // separa rango y otros filtros
  let range = null
  const other = []

  for (const sel of selections) {
    if (!sel?.fieldKey) continue
    if (sel.fieldKey === 'rangoFechas') range = sel.value
    else other.push(sel)
  }

  isChartDataMode.value = false

  loading.value = true
  try {
    // ✅ si viene rango desde gráfica: descarga páginas hasta cubrir rango
    if (range?.from || range?.to) {
      await cargarHastaRango(range)
      // deja el rango listo en payload
      lastPayload.value = {
        ...(lastPayload.value || {}),
        rangoFechas: { from: range.from || '', to: range.to || '' },
      }
      recomputarVista({ resetPage: true })
    } else {
      // modo normal
      await cargarPaginaInicial()
    }
  } finally {
    loading.value = false
  }

  // ✅ abrir consola siempre
  consoleStore.consoleOpen = true
  filtrosToggle.value = true
  paginaActual.value = 1

  await nextTick()
  const ok = await ensureDinamicFiltersReady()
  if (!ok) return

  // ✅ refleja rango en UI
  if (range?.from || range?.to) {
    filtroRef.value?.setRangoFechas?.({ from: range.from || '', to: range.to || '' })
  }

  // ✅ aplica otros filtros (status/eventType/outcome/etc.)
  for (const sel of other) {
    filtroRef.value.applyChartFilter(sel.fieldKey, sel.value)
  }
}

// ✅ Abre consola (si hace falta) y aplica el filtro en DinamicFilters
const abrirConsolaConFiltro = async (fieldKey, value) => {
  // 1) Abre consola y asegura data
  if (!consoleStore.consoleOpen) {
    await abrirConsola()
  } else {
    // si ya está abierta pero no hay data, asegúrate de tener al menos la primera página
    if (!baseLogs.value.length && !isChartDataMode.value) {
      await cargarPaginaInicial()
    }
  }

  // 2) Abre panel filtros y espera a que el ref exista
  filtrosToggle.value = true
  await nextTick()

  const ok = await ensureDinamicFiltersReady()
  if (!ok) {
    console.warn('⚠️ DinamicFilters no estuvo listo para aplicar filtro')
    return
  }

  // 3) Aplica filtro en DinamicFilters (esto debe refrescar logs)
  filtroRef.value.applyChartFilter(fieldKey, value)

  // 4) (Opcional) cerrar panel filtros tras aplicar
  // setTimeout(() => (filtrosToggle.value = false), 500)
}

const abrirConsolaConDataYFiltros = async (dataGrafica = [], selections = []) => {
  // 1) abre en modo gráfica (isChartDataMode = true)
  await abrirConsola(dataGrafica)

  // 2) abre panel filtros y espera a que DinamicFilters esté listo
  filtrosToggle.value = true
  await nextTick()
  const ok = await ensureDinamicFiltersReady()
  if (!ok) return

  // 3) aplica selections en DinamicFilters para que el UI refleje valores
  //    (si viene rangoFechas, primero setRangoFechas para que el payload lo incluya)
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

//  fetchPage anteriormente cargarLogsDesdeApi
async function fetchPage(page, { resetPage = false } = {}) {
  const resp = await ChartDataService.getLogsEvents({
    system: currentSystem.value,
    page,
    size: pageSize.value,
  })

  serverPage.value = Number(resp?.page ?? page)
  serverTotalPages.value = Number(resp?.totalPages ?? 1)
  serverTotalElements.value = Number(resp?.totalElements ?? 0)

  const items = Array.isArray(resp?.items) ? resp.items : []
  baseLogs.value = mergeUniqueById(baseLogs.value, items)

  // ✅ si es carga inicial -> resetPage true, si es “cargar más” -> false
  recomputarVista({ resetPage })
}

const onFiltrosPayload = async (payload) => {
  lastPayload.value = payload

  const r = payload?.rangoFechas
  if (!isChartDataMode.value && (r?.from || r?.to)) {
    await ensureCoverageForRange(r)
  }

  recomputarVista({ resetPage: true })
}

function exportLogs(format) {
  try {
    const items = logsToExport.value // <-- tus logs visibles/filtrados en consola
    const base = `logs-${currentSystem.value || 'all'}`

    if (format === 'excel') return ConsoleExportService.exportExcel(items, base)
    if (format === 'json') return ConsoleExportService.exportJSON(items, base)
    if (format === 'txt') return ConsoleExportService.exportTXT(items, base)

    throw new Error('Formato no soportado')
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e.message || 'Error exportando logs' })
  }
}

const cerrarConsola = () => {
  consoleStore.consoleOpen = false
  logs.value = []
  rawLogs.value = []
  baseLogs.value = []
  lastPayload.value = null
  isChartDataMode.value = false
  resetServerPaging()
}

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true
}

const scrollArriba = () => {
  const container = document.querySelector('.console-body')
  if (container) container.scrollTop = 0
}

const onPageChanged = async () => {
  scrollArriba()

  // si no está abierta o es modo gráfica, no autocargamos
  if (!consoleStore.consoleOpen) return
  if (isChartDataMode.value) return

  // ✅ si el usuario llegó a la última página visible
  const atLastPage = paginaActual.value >= totalPaginas.value

  if (atLastPage && hasMore.value && !loadingMore.value) {
    await cargarMas()
    // Nota: NO avanzamos automáticamente de página,
    // el usuario verá que ahora hay más páginas disponibles.
  }
}

//  Si campbia el system global mientras la consola está abierta, re-aplica system y re-aplica payload
watch(currentSystem, async () => {
  if (!consoleStore.consoleOpen) return
  if (isChartDataMode.value) return
  await cargarPaginaInicial()
})

watch(
  () => consoleStore.pendingSelection,
  async (sel) => {
    if (!sel) return

    // 1) Abre consola
    consoleStore.openConsole?.()

    //  2) asegura data cargada
    if (!baseLogs.value.length && !isChartDataMode.value) {
      await cargarPaginaInicial()
    }

    //  3) abre panel filtros y aplica filtro DynamicFilters
    filtrosToggle.value = true
    await nextTick()
    filtroRef.value?.applyChartFilter?.(sel.fieldKey, sel.value)

    //  4) limpia pending
    consoleStore.clearPending()
  },
  { immediate: true, flush: 'post' },
)

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
