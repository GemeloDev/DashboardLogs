<template>
  <q-card class="filters-card">
    <q-card-section class="console-controls">
      <div class="row flex justify-center q-col-gutter-md q-mb-md border-bottom q-pb-md">
        <div class="col-12 col-md-12">
          <q-select
            v-model="camposVisibles"
            :options="configFiltros"
            :loading="loading"
            label="⚙️ Configurar filtros visibles"
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
            label="Búsqueda rápida..."
            filled
            dark
            dense
            color="primary"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12">
          <q-input
            v-model="rangoFechasTexto"
            label="Rango de Fechas *"
            filled
            dark
            dense
            color="primary"
            clearable
            readonly
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="date_range" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer" color="primary">
                <q-popup-proxy cover>
                  <q-date v-model="filtrosSeleccionados.rangoFechas" range dark color="primary"> </q-date>
                </q-popup-proxy>
              </q-icon>
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
              <q-item><q-item-section class="text-grey">Sin datos</q-item-section></q-item>
            </template>
          </q-select>
        </div>

        <div
          v-if="filtrosRenderizables.length === 0"
          class="col-12 text-center text-grey-5 q-py-sm"
        >
          <q-icon name="info" /> Selecciona filtros en el configurador superior
        </div>
        <div v-else class="col-12 flex justify-center">
          <q-btn
            color="primary"
            label="Aplicar Filtros"
            icon="filter_alt"
            size="md"
            @click="emitirFiltros"
            :loading="loadingFiltros"
          />
          <q-btn
            class="q-ml-md"
            color="grey-7"
            label="Limpiar"
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
// import { MockPassportService } from 'src/data/MockLogsService'
import { ChartDataService } from 'src/services/chartDataService'
import { ref, computed, onMounted, watch } from 'vue'

const $q = useQuasar()
const emit = defineEmits(['filtrar', 'camposSeleccionados'])

const logs = ref([])
const loading = ref(false)

// 1. CATÁLOGO MAESTRO: Define todos los filtros disponibles
const configFiltros = ref([])

// 2. MODELO DEL MULTI-SELECT: Controla qué filtros se ven
// Inicializamos con los keys que queremos ver por defecto
const camposVisibles = ref(['status', 'severity', 'location.name', 'eventType'])

// 3. MODELO DE VALORES: Donde se guardan las selecciones (ej: status: 'EMITIDO')
const filtrosSeleccionados = ref({
  busqueda: '',
  rangoFechas: {
    from: '',
    to: ''
  },
  fields: camposVisibles.value
})

// 4. COMPUTED: Filtros Renderizables
// Este es el que usaremos en el v-for del HTML. Mantiene el orden de configFiltros.
const filtrosRenderizables = computed(() => {
  return configFiltros.value.filter((f) => camposVisibles.value.includes(f.key))
})

const rangoFechasTexto = computed(() => {
  if (!filtrosSeleccionados.value.rangoFechas) return ''
  if (typeof filtrosSeleccionados.value.rangoFechas === 'string') return filtrosSeleccionados.value.rangoFechas
  if (filtrosSeleccionados.value.rangoFechas.from && filtrosSeleccionados.value.rangoFechas.to) {
    return `${filtrosSeleccionados.value.rangoFechas.from} - ${filtrosSeleccionados.value.rangoFechas.to}`
  }
  return filtrosSeleccionados.value.rangoFechas.from || ''
})

// 5. LIMPIEZA AUTOMÁTICA
// Si el usuario oculta un filtro, debemos limpiar su valor seleccionado
// para evitar que filtre datos en segundo plano.
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

// 3. MOTOR DE EXTRACCIÓN: Lee tu Mock y llena las opciones
const generarOpcionesDesdeDatos = (items) => {
  if (!items || !items.length) return

  // Recorremos nuestra configuración de filtros
  configFiltros.value.forEach((filtro) => {
    const valoresUnicos = new Set()

    items.forEach((item) => {
      // Magia para leer propiedades anidadas (ej: item['office']['officeName'])
      const valor = filtro.key.split('.').reduce((obj, k) => (obj ? obj[k] : null), item)

      if (valor) valoresUnicos.add(valor)
    })

    // Asignamos las opciones encontradas al filtro correspondiente
    filtro.options = Array.from(valoresUnicos).sort()
  })

  console.log('✅ Filtros generados:', configFiltros.value)
}

// --- Integración con tu función de carga ---
// Cuando cargues tu Mock, llama a la función generadora:
const cargarLogs = async () => {
  loading.value = true

  // ... tu lógica de carga del Mock ...
  // const response = await MockPassportService.getAll()
  const response = await ChartDataService.getAll()
  logs.value = response.data.items

  if (logs.value) {
    // 1. Molde de los logs
    const primerLog = logs.value[0]
    const claves = obtenerClavesProfundas(primerLog)

    // (Opcional) Filtrar las claves que no se desean
    const clavesIgnoradas = [
      'id',
      'tenantId',
      'date',
      'meta.requestId',
      'geoPoint.type',
      'person.id',
      'eventTime',
      'system',
    ]
    const clavesFiltrables = claves.filter((k) => !clavesIgnoradas.includes(k))

    // 2. Configuración dínamica
    configFiltros.value = clavesFiltrables.map((key) => ({
      key,
      label: formatearLabel(key),
      icon: adivinarIcono(key),
      options: [], //  Se llena con función
    }))

    // Pasamos los datos crudos para que se generen los filtros
    generarOpcionesDesdeDatos(logs.value)

    if (camposVisibles.value.length === 0) {
      camposVisibles.value = configFiltros.value
        .slice(0, 5) //  Tomar los primeros 5
        .map((f) => f.key)
    }
  }

  loading.value = false
}

const emitirFiltros = () => {
  const payload = {}

  // 1. Agregar campos fijos (Búsqueda y Fechas) que siempre están en la UI
  // Si no tienen valor, los mandamos como string vacío o null según prefieras
  payload.busqueda = filtrosSeleccionados.value.busqueda || ''
  payload.rangoFechas = filtrosSeleccionados.value.rangoFechas || ''

  // 2. Iterar SOLO sobre los campos que el usuario decidió ver (camposVisibles)
  camposVisibles.value.forEach((key) => {
    const valor = filtrosSeleccionados.value[key]

    // Si tiene valor lo asignamos, si es null/undefined asignamos ''
    payload[key] = (valor !== null && valor !== undefined) ? valor : ''
  })

  console.log('📤 Enviando filtros limpios:', payload)

  // 3. Emitir los eventos
  emit('camposSeleccionados', payload)
  emit('filtrar', logsFiltrados.value)
}

// 4. COMPUTED DE FILTRADO DINÁMICO
// Esta función filtra los logs basándose en lo que haya en 'filtrosSeleccionados'
const logsFiltrados = computed(() => {
  // 1. Obtenemos los valores de los filtros
  const filtros = filtrosSeleccionados.value

  // 2. Verificamos si hay AL MENOS UN filtro con valor (que no sea null ni vacío)
  const hayFiltrosActivos = Object.values(filtros).some(
    (valor) => valor !== null && valor !== undefined && valor !== '',
  )

  // 3. OPTIMIZACIÓN: Si no hay filtros, retornamos todo el array inmediatamente
  // Esto evita recorrer miles de registros innecesariamente
  if (!hayFiltrosActivos) {
    return logs.value
  }

  // 4. Si hay filtros, ejecutamos la lógica de filtrado
  return logs.value.filter((log) => {
    for (const [key, valorSeleccionado] of Object.entries(filtros)) {
      // Solo comparamos si este filtro específico tiene valor
      if (valorSeleccionado) {
        // Obtenemos el valor del log (soporta 'office.name')
        const valorLog = key.split('.').reduce((obj, k) => (obj ? obj[k] : null), log)

        // Si no coinciden, descartamos el registro
        if (valorLog !== valorSeleccionado) {
          return false
        }
      }
    }
    return true // Pasó todas las validaciones activas
  })
})

// A. Función recursiva para obtener claves tipo "office.officeName"
const obtenerClavesProfundas = (obj, prefix = '') => {
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
const formatearLabel = (key) => {
  // 1. Tomamos solo la última parte si tiene puntos (ej: office.name -> name)
  // Opcional: si quieres el path completo, quita esta línea
  // const lastPart = key.split('.').pop()

  // 2. Insertar espacio antes de mayúsculas y capitalizar
  return key
    .replace(/([A-Z])/g, ' $1') // espacio antes de Mayúscula
    .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
    .replace(/\./g, ' › ') // Reemplazar puntos por flechas visuales
}

// C. Asignar iconos según el nombre del campo
const adivinarIcono = (key) => {
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
  // Limpiamos el modelo
  filtrosSeleccionados.value = {
      busqueda: '',
      rangoFechas: ''
  }
  // Emitimos usando la misma lógica para que llegue limpio
  emitirFiltros()

  $q.notify({ type: 'info', message: 'Filtros limpiados', position: 'top' })
}

onMounted(async () => {
  cargarLogs()
  emitirFiltros()
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
</style>
