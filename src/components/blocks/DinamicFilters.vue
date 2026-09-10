<template>
  <q-card class="filters-card">
    <q-card-section class="console-controls">
      <div class="row flex justify-center q-col-gutter-md q-mb-md border-bottom q-pb-md">
        <div class="col-12 col-md-12">
          <q-select
            v-model="camposVisibles"
            :options="configFiltros"
            :loading="loading"
            :label="t('consoleSimple.filtersConfigLabel')"
            option-value="key"
            option-label="label"
            multiple
            filled
            dark
            dense
            emit-value
            map-options
            use-chips
            stack-label
            color="secondary"
          >
            <template v-slot:selected-item="scope">
              <q-chip
                removable
                dense
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                color="secondary"
                text-color="white"
                class="q-ma-none q-mr-sm q-my-sm"
              >
                {{ scope.opt.label }}
              </q-chip>
            </template>

            <template v-slot:prepend>
              <q-icon name="tune" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="filtrosSeleccionados.busqueda"
            :label="t('consoleSimple.quickSearchLabel')"
            filled
            dark
            dense
            color="primary"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="row justify-center col-12">
          <q-input
            v-model="rangoFechasTexto"
            :label="t('consoleSimple.dateRangeLabel')"
            filled
            dark
            dense
            color="primary"
            clearable
            readonly
            class="custom-select col-12 full-width q-ma-sm"
          >
            <template v-slot:prepend>
              <q-icon name="date_range" color="primary" />
            </template>

            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer q-mr-sm" color="primary">
                <q-popup-proxy cover>
                  <q-date
                    v-model="filtrosSeleccionados.rangoFechas"
                    range
                    dark
                    color="primary"
                    mask="YYYY-MM-DD"
                  />
                </q-popup-proxy>
              </q-icon>

              <q-btn-dropdown
                flat
                dense
                rounded
                icon="schedule"
                color="blue-4"
                dropdown-icon="expand_more"
                no-caps
              >
                <q-list dense class="q-pa-none">
                  <q-item clickable v-close-popup @click="seleccionarPeriodo('hoy')">
                    <q-item-section avatar>
                      <q-icon name="today" color="blue-4" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-caption">{{ t('consoleSimple.quickPeriodToday') }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="seleccionarPeriodo('ayer')">
                    <q-item-section avatar>
                      <q-icon name="yesterday" color="blue-4" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-caption">{{ t('consoleSimple.quickPeriodYesterday') }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos7')">
                    <q-item-section avatar>
                      <q-icon name="date_range" color="blue-4" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-caption">{{ t('consoleSimple.quickPeriodLast7Days') }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="seleccionarPeriodo('ultimos30')">
                    <q-item-section avatar>
                      <q-icon name="calendar_month" color="blue-4" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-caption">{{ t('consoleSimple.quickPeriodLast30Days') }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator class="bg-grey-7" />

                  <q-item clickable v-close-popup @click="seleccionarPeriodo('mesActual')">
                    <q-item-section avatar>
                      <q-icon name="calendar_today" color="green-4" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-caption">{{ t('consoleSimple.quickPeriodCurrentMonth') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
          </q-input>
        </div>
      </div>

      <div class="row flex justify-center q-col-gutter-md transition-group">
        <div
          v-for="filtro in filtrosRenderizables"
          :key="filtro.key"
          class="col-12 col-sm-6 col-md-2"
        >
          <q-select
            v-model="filtrosSeleccionados[filtro.key]"
            :options="filtro.options"
            :label="filtro.label"
            filled
            dark
            dense
            color="primary"
            clearable
            options-dense
            transition-show="jump-up"
            transition-hide="jump-down"
          >
            <template v-slot:prepend>
              <q-icon :name="filtro.icon" color="primary" size="xs" />
            </template>

            <template v-slot:no-option>
              <q-item><q-item-section class="text-grey">{{ t('consoleSimple.noOptionData') }}</q-item-section></q-item>
            </template>
          </q-select>
        </div>

        <div
          v-if="filtrosRenderizables.length === 0"
          class="col-12 text-center text-grey-5 q-py-sm"
        >
          <q-icon name="info" /> {{ t('consoleSimple.selectFiltersHint') }}
        </div>
        <div v-else class="col-12 flex justify-center">
          <q-btn
            color="primary"
            :label="t('consoleSimple.applyFilters')"
            icon="filter_alt"
            size="md"
            @click="emitirFiltros"
            :loading="loading"
          />
          <q-btn
            class="q-ml-md"
            color="grey-7"
            :label="t('consoleSimple.clearFilters')"
            icon="clear"
            size="md"
            flat
            @click="limpiarFiltros"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { FilterMetadataService } from 'src/services/filterMetadataService'

const $q = useQuasar()
const { t } = useI18n()
const filtrosGlobales = inject('filtrosGlobales', null)

// DinamicFilters.vue
const props = defineProps({
  datosOrigen: { type: Array, default: null },
  autoEmitOnMounted: { type: Boolean, default: true },
})

const emit = defineEmits(['filtrar', 'camposSeleccionados', 'campos-seleccionados', 'clear-filters'])

const loading = ref(false)
const logsGlobales = inject('logsGlobales', ref([]))
const configFiltros = ref([])
const hydratedOnce = ref(false)
const camposVisibles = ref(['status', 'severity', 'outcome', 'eventType'])

const filtrosSeleccionados = ref({
  busqueda: '',
  rangoFechas: {
    from: '',
    to: '',
  },
})

const sourceItems = computed(() => {
  if (Array.isArray(props.datosOrigen) && props.datosOrigen.length) return props.datosOrigen
  const lg = logsGlobales?.value
  return Array.isArray(lg) ? lg : []
})

// 4. COMPUTED: Filtros Renderizables
// Este es el que usaremos en el v-for del HTML. Mantiene el orden de configFiltros.
const filtrosRenderizables = computed(() => {
  return configFiltros.value.filter((f) => camposVisibles.value.includes(f.key))
})

const rangoFechasTexto = computed(() => {
  if (!filtrosSeleccionados.value.rangoFechas) return ''
  if (typeof filtrosSeleccionados.value.rangoFechas === 'string')
    return filtrosSeleccionados.value.rangoFechas
  if (filtrosSeleccionados.value.rangoFechas.from && filtrosSeleccionados.value.rangoFechas.to) {
    return `${filtrosSeleccionados.value.rangoFechas.from} - ${filtrosSeleccionados.value.rangoFechas.to}`
  }
  return filtrosSeleccionados.value.rangoFechas.from || ''
})

function normalizarRangoFechas(range = { from: '', to: '' }) {
  if (typeof range === 'string') {
    const value = range.trim()
    return { from: value, to: value }
  }

  const from = String(range?.from || '').trim()
  const to = String(range?.to || '').trim()
  const single = from || to

  return {
    from: from || single,
    to: to || single,
  }
}

function setRangoFechas(range = { from: '', to: '' }) {
  const { from, to } = normalizarRangoFechas(range)

  // 1) actualiza el modelo real
  filtrosSeleccionados.value.rangoFechas = { from, to }

  // 3) opcional: si quieres que dispare el filtrado inmediatamente desde el mismo DinamicFilters
  // emitirPayloadYFiltrar()
}

const getDeep = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : null), obj)

const pushValue = (v, set) => {
  if (v == null) return
  if (Array.isArray(v)) {
    v.forEach((x) => pushValue(x, set))
    return
  }
  if (typeof v === 'object') return // ignorar objetos
  set.add(String(v))
}

const generarOpcionesDesdeDatos = (items) => {
  if (!items || !items.length) return

  configFiltros.value.forEach((filtro) => {
    const valoresUnicos = new Set()

    items.forEach((item) => {
      const valor = getDeep(item, filtro.key)
      pushValue(valor, valoresUnicos)
    })

    filtro.options = Array.from(valoresUnicos).sort()
  })
}

const obtenerClavesDesdeColeccion = (items = []) => {
  const claves = new Set()
  const sample = Array.isArray(items) ? items.slice(0, 500) : []

  sample.forEach((item) => {
    obtenerClavesProfundas(item).forEach((key) => claves.add(key))
  })

  return Array.from(claves)
}

const reconstruirDesdeLogs = (items) => {
  if (!items || !items.length) {
    configFiltros.value = []
    return
  }

  const claves = obtenerClavesDesdeColeccion(items)

  // No queremos filtros que ya existen fuera (system) o que explotan cardinalidad (eventTime, payload, ids)
  const ignoradasExactas = new Set([
    'id',
    'tenantId',
    'schemaVersion',
    'system', // 👈 ya lo filtras en MainLayout
    'eventTime', // 👈 rango lo filtra backend
    'message',
    'meta.requestId',
    'geo.type',
    'geo.coordinates',
  ])

  const clavesFiltrables = claves
    .filter((k) => !ignoradasExactas.has(k))
    .filter((k) => k !== 'payload' && !k.startsWith('payload.')) // 👈 fuera payload completo

  configFiltros.value = clavesFiltrables.map((key) => ({
    key,
    label: formatearLabel(key),
    icon: adivinarIcono(key),
    options: [],
  }))

  generarOpcionesDesdeDatos(items)
  configFiltros.value = configFiltros.value.filter((f) => f.options.length)

  // Mantener campos visibles si aún existen
  const setKeys = new Set(configFiltros.value.map((f) => f.key))
  camposVisibles.value = camposVisibles.value.filter((k) => setKeys.has(k))

  // Defaults si quedó vacío
  if (camposVisibles.value.length === 0) {
    camposVisibles.value = [
      'status',
      'severity',
      'location.name',
      'location.country',
      'eventType',
      'outcome',
    ].filter((k) => setKeys.has(k))
  }

  // Limpiar selecciones inválidas (si el valor ya no existe en options)
  configFiltros.value.forEach((f) => {
    const selected = filtrosSeleccionados.value[f.key]
    if (selected && Array.isArray(f.options) && !f.options.includes(String(selected))) {
      filtrosSeleccionados.value[f.key] = ''
    }
  })
}

function aplicarFiltrosLocal(items, payload) {
  const { busqueda = '', rangoFechas, _visibleFields, ...values } = payload
  const search = (busqueda || '').trim().toLowerCase()

  console.log('✅ Payload para el filtrado de datos: ', {
    busqueda,
    rangoFechas,
    _visibleFields,
    values,
  })

  let out = items || []
  // selects
  out = out.filter((log) => {
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue
      const actual = getDeep(log, k)

      //  Si el campo es array, el filtro debe matchear "includes"
      if (Array.isArray(actual)) {
        const norm = actual.map((x) => String(x))
        if (!norm.includes(String(v))) return false
        continue
      }

      if (String(actual) !== String(v)) return false
    }
    return true
  })

  // búsqueda
  if (search) out = out.filter((l) => JSON.stringify(l).toLowerCase().includes(search))

  return out
}

const emitirFiltros = () => {
  const payload = {
    _visibleFields: camposVisibles.value,
    busqueda: filtrosSeleccionados.value.busqueda || '',
    rangoFechas: normalizarRangoFechas(filtrosSeleccionados.value.rangoFechas),
  }

  filtrosRenderizables.value.forEach((f) => {
    const v = filtrosSeleccionados.value[f.key]
    if (v != null && v !== '') payload[f.key] = v
  })

  emit('campos-seleccionados', payload)
  emit('camposSeleccionados', payload)
  emit('filtrar', aplicarFiltrosLocal(sourceItems.value, payload))
}

function applyChartFilter(fieldKey, value) {
  if (!fieldKey) return

  //  1) Asegurar que el campo esté visible
  if (!camposVisibles.value.includes(fieldKey)) {
    camposVisibles.value.push(fieldKey)
  }

  //  2) Asegurar que exista el filtro en config
  let filtro = configFiltros.value.find((f) => f.key === fieldKey)
  if (!filtro) {
    filtro = {
      key: fieldKey,
      label: formatearLabel(fieldKey),
      icon: adivinarIcono(fieldKey),
      options: [],
    }
    configFiltros.value.push(filtro)
  }

  //  3) Intentar machear por case-insensitive contra options (por tu .toUppperCase() en buildCategorical)
  const optMatch = (filtro.options || []).find(
    (o) => String(o).toUpperCase() === String(value).toUpperCase(),
  )

  const finalValue = optMatch ?? value

  //  4) Asegurar que el valor exista en options (para que el q-select lo muestre)
  if (finalValue && !filtro.options.includes(finalValue)) {
    filtro.options.push(finalValue)
    filtro.options.sort()
  }

  // 5) Setear el filtro seleccionado
  filtrosSeleccionados.value[fieldKey] = finalValue

  emitirFiltros()
}

function setBusqueda(value = '') {
  filtrosSeleccionados.value.busqueda = String(value)
  emitirFiltros()
}

//  Ya está el defineExpose
defineExpose({ applyChartFilter, setRangoFechas, setBusqueda })

// A. Función recursiva para obtener claves tipo "office.officeName"
function obtenerClavesProfundas(obj, prefix = '') {
  let keys = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      // Si es un objeto y no es null ni array, seguimos profundizando
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys = keys.concat(obtenerClavesProfundas(value, newKey))
      } else {
        // Si es primitivo (string, number, boolean) o null, lo agregamos
        keys.push(newKey)
      }
    }
  }
  return keys
}

// B. Función para hacer bonitos los labels (CamelCase -> Texto Legible)
function formatearLabel(key) {
  // 1. Tomamos solo la última parte si tiene puntos (ej: office.name -> name)
  // Opcional: si quieres el path completo, quita esta línea
  // const lastPart = key.split('.').pop()

  // 2. Insertar espacio antes de mayúsculas y capitalizar
  return key
    .replace(/([A-Z])/g, ' $1') // espacio antes de Mayúscula
    .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
    .replace(/\./g, t('consoleSimple.fieldPathSeparator')) // Reemplazar puntos por flechas visuales
}

// C. Asignar iconos según el nombre del campo
function adivinarIcono(key) {
  const k = key.toLowerCase()
  if (k.includes('time') || k.includes('date')) return 'event'
  if (k.includes('user') || k.includes('person')) return 'person'
  if (k.includes('location')) return 'business'
  if (k.includes('id')) return 'fingerprint'
  if (k.includes('status')) return 'rule'
  if (k.includes('outcome')) return 'chat'
  return 'filter_alt' // Default
}

const limpiarFiltros = () => {
  const base = { busqueda: '', rangoFechas: { from: '', to: '' } }

  // reiniciar también valores de los campos visibles
  camposVisibles.value.forEach((k) => {
    base[k] = ''
  })

  filtrosSeleccionados.value = base

  emit('clear-filters')
  $q.notify({ type: 'info', message: t('consoleSimple.filtersCleared'), position: 'top' })
}

//  Helpers para fechas (evita UTC/toISOString que puede cambiar el día)
const pad2 = (n) => String(n).padStart(2, '0')
const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0,0,0,0)
  return x
}

const toYMDLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const seleccionarPeriodo = (periodo, aplicar = true) => {
  const hoy = startOfDay(new Date())

  let inicioDate = null
  let finDate = null

  switch (periodo) {
    case 'hoy':{
      inicioDate = new Date(hoy)
      finDate = new Date(hoy)
      break;
    }

    case 'ayer': {
      const ayer = new Date(hoy)
      ayer.setDate(ayer.getDate() - 1)
      inicioDate = ayer
      finDate = ayer
      break;
    }

    case 'ultimos7':{
      const start = new Date(hoy)
      start.setDate(start.getDate() - 6) // hoy esta dentro de los 7 días
      inicioDate = start
      finDate = new Date(hoy)
      break;
    }

    case 'ultimos30':{
      const start = new Date(hoy)
      start.setDate(start.getDate() - 29) // hoy está dentro de los 30 días
      inicioDate = start
      finDate = new Date(hoy)
      break;
    }

    case 'mesActual': {
      inicioDate = startOfDay(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
      finDate = new Date(hoy) // mes de la fecha
      break;
    }

    default: {
      console.warn('DinamicFilters periodo no soportado: ', periodo)
      return;
    }
  }
  const from = toYMDLocal(inicioDate)
  const to = toYMDLocal(finDate)

  filtrosSeleccionados.value.rangoFechas = { from, to }

  // Para que el quick period aplique en caliente:
  if (aplicar) emitirFiltros()
}

function hasRange(r) {
  if (!r) return false
  if (typeof r === 'string') return r.trim() !== ''
  return !!(r.from || r.to)
}

const hidratarDesdeGlobales = () => {
  const fg = filtrosGlobales?.value
  if (!fg) return

  // 1) visibles
  if (Array.isArray(fg.visibleFields) && fg.visibleFields.length) {
    camposVisibles.value = [...fg.visibleFields]
  }

  // 2) busqueda (solo si viene algo real)
  if (typeof fg.busqueda === 'string' && fg.busqueda.trim() !== '') {
    filtrosSeleccionados.value.busqueda = fg.busqueda
  }

  // ✅ 3) rango: SOLO si global trae rango real, si no, NO pises lo que ya eligió el usuario
  if (hasRange(fg.rangoFechas)) {
    const { from, to } = normalizarRangoFechas(fg.rangoFechas)
    filtrosSeleccionados.value.rangoFechas = { from, to }
  }

  // 4) values: aplica solo los que tengan valor real
  const vals = fg.values || {}
  for (const [k, v] of Object.entries(vals)) {
    if (v != null && String(v).trim() !== '') {
      filtrosSeleccionados.value[k] = v
    }
  }
}

const backendConfigLoaded = ref(false)

const cargarConfigDesdeBackend = async () => {
  try {
    loading.value = true
    const system = filtrosGlobales?.value?.system || null
    const data = await FilterMetadataService.getFilterConfig(system)

    if (data?.filters && Array.isArray(data.filters)) {
      configFiltros.value = data.filters.map((f) => ({
        key: f.key,
        label: f.label,
        icon: f.icon || 'filter_alt',
        options: f.options || [],
      }))

      const setKeys = new Set(configFiltros.value.map((f) => f.key))
      camposVisibles.value = camposVisibles.value.filter((k) => setKeys.has(k))

      if (camposVisibles.value.length === 0) {
        camposVisibles.value = ['status', 'severity', 'eventType', 'outcome'].filter((k) =>
          setKeys.has(k)
        )
      }

      backendConfigLoaded.value = true
      return true
    }
    return false
  } catch (err) {
    console.warn('No se pudo cargar config de filtros desde backend, usando fallback local:', err?.message)
    return false
  } finally {
    loading.value = false
  }
}

watch(camposVisibles, (nuevos, viejos) => {
  // Encontramos qué campo se eliminó
  const eliminados = viejos.filter((x) => !nuevos.includes(x))

  eliminados.forEach((key) => {
    if (filtrosSeleccionados.value[key]) {
      delete filtrosSeleccionados.value[key] // Borramos el valor del filtro
      console.log(`🧹 Filtro oculto y limpiado: ${key}`)
    }
  })
})

watch(
  sourceItems,
  async (items) => {
    if (!backendConfigLoaded.value) {
      const loaded = await cargarConfigDesdeBackend()
      if (loaded) {
        if (!hydratedOnce.value) {
          hidratarDesdeGlobales()
          hydratedOnce.value = true
        }
        return
      }
    }

    if (!backendConfigLoaded.value) {
      reconstruirDesdeLogs(items)
    }

    // ✅ solo una vez (evita que se borre el rango al aplicar filtros)
    if (!hydratedOnce.value) {
      hidratarDesdeGlobales()
      hydratedOnce.value = true
    }
  },
  { immediate: true },
)

onMounted(() => {
  hidratarDesdeGlobales()
  // OJO: si estás en modal, NO auto-emitas aquí si eso te cierra el modal
  // emitirFiltros()
})
</script>

<style lang="scss" scoped>
.log-card {
  background: #2b2b3d;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  &.log-card-success {
    border-left: 4px solid #4caf50;
  }
  &.log-card-error {
    border-left: 4px solid #f44336;
  }
  &.log-card-warning {
    border-left: 4px solid #9e9e9e;
  }
  &.log-card-info {
    border-left: 4px solid #2196f3;
  }
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

.filters-card {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-select {
  .q-field__control {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(33, 150, 243, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .q-field__native,
  .q-field__input {
    color: white;
  }
}

.custom-select {
  .q-field__control {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(33, 150, 243, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .q-field__native,
  .q-field__input {
    color: white;
  }
}

.q-list {
  background: #1e1e2f !important;
}
</style>
