<template>
  <q-card class="filters-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h6">
          <q-icon name="filter_list" size="28px" class="q-mr-sm" color="primary" />
          Filtros Avanzados
        </div>
        <!-- <q-btn flat color="negative" icon="close" label="Cerrar" v-close-popup /> -->
      </div>

      <div v-if="resumenFiltros.length" class="q-mt-sm text-caption text-grey-4">
        <q-icon name="info" size="18px" class="q-mr-xs" color="info" />
        <span>Filtros activos: {{ resumenFiltros.join(', ') }}</span>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Rango de Fechas - OBLIGATORIO -->
        <div class="col-12">
          <q-input
            v-model="rangoFechasTexto"
            label="Rango de Fechas *"
            filled
            dark
            color="primary"
            readonly
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="date_range" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer" color="primary">
                <q-popup-proxy cover>
                  <q-date v-model="filtro.rangoFechas" range dark color="primary">
                    <!-- <div class="row items-center justify-end q-pa-sm">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div> -->
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Oficina -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.oficina"
            :options="oficinasFilter.filteredOptions.value"
            option-value="value"
            option-label="label"
            label="Oficina"
            filled
            dark
            color="primary"
            clearable
            use-input
            input-debounce="300"
            @filter="oficinasFilter.filterOptions"
            class="custom-select"
            :loading="loadingCatalogos"
          >
            <template v-slot:prepend>
              <q-icon name="business" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay oficinas disponibles </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Usuario -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.usuario"
            :options="usuariosFilter.filteredOptions.value"
            option-value="value"
            option-label="label"
            label="Usuario"
            filled
            dark
            color="primary"
            clearable
            use-input
            input-debounce="300"
            @filter="filtrarUsuarios"
            class="custom-select"
            :loading="loadingCatalogos"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay usuarios disponibles </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Dispositivo -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.dispositivo"
            :options="dispositivosFilter.filteredOptions.value"
            option-value="value"
            option-label="label"
            label="Dispositivo"
            filled
            dark
            color="primary"
            clearable
            use-input
            input-debounce="300"
            @filter="dispositivosFilter.filterOptions"
            class="custom-select"
            :loading="loadingCatalogos"
          >
            <template v-slot:prepend>
              <q-icon name="devices" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay dispositivos disponibles </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Escáner -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.escaner"
            :options="escanersFilter.filteredOptions.value"
            option-value="value"
            option-label="label"
            label="Escáner"
            filled
            dark
            color="primary"
            clearable
            use-input
            input-debounce="300"
            @filter="escanersFilter.filterOptions"
            class="custom-select"
            :loading="loadingCatalogos"
          >
            <template v-slot:prepend>
              <q-icon name="qr_code_scanner" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay escáneres disponibles </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Tipo de Proceso -->
        <!-- <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.proceso"
            :options="procesosOptions"
            option-value="value"
            option-label="label"
            label="Tipo de Proceso"
            filled
            dark
            color="primary"
            clearable
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="settings" color="primary" />
            </template>
          </q-select>
        </div> -->

        <!-- Tipo de Log -->
        <!-- <div class="col-12 col-md-6">
          <q-select
            v-model="filtro.tipoLog"
            :options="tiposLogOptions"
            option-value="value"
            option-label="label"
            label="Tipo de Log"
            filled
            dark
            color="primary"
            clearable
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="bug_report" color="primary" />
            </template>
          </q-select>
        </div> -->
      </div>

      <div class="q-mt-xl text-center">
        <q-btn
          color="primary"
          label="Aplicar Filtros"
          icon="filter_alt"
          size="lg"
          @click="aplicarFiltros"
          :loading="loadingFiltros"
          class="q-px-xl"
        />
        <q-btn
          color="grey-7"
          label="Limpiar"
          icon="clear"
          size="lg"
          flat
          @click="limpiarFiltros"
          class="q-ml-md"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { CatalogService } from '../../services/catalogService'
import { useFilterableSelect } from '../../composables/useFilterableSelect'

const $q = useQuasar()
const emit = defineEmits(['filtrar', 'close'])

// Estados de loading
const loadingFiltros = ref(false)
const loadingCatalogos = ref(false)

// Opciones para los selects
const oficinasOptions = ref([])
const usuariosOptions = ref([])
const dispositivosOptions = ref([])
const escanersOptions = ref([])
const procesosOptions = ref([])
const tiposLogOptions = ref([])

// Hooks para filtrado de selects
const usuariosFilter = useFilterableSelect(usuariosOptions)
const oficinasFilter = useFilterableSelect(oficinasOptions)
const dispositivosFilter = useFilterableSelect(dispositivosOptions)
const escanersFilter = useFilterableSelect(escanersOptions)

// Filtros principales
const filtro = ref({
  rangoFechas: null,
  oficina: null,
  usuario: null,
  dispositivo: null,
  escaner: null,
  proceso: null,
  tipoLog: null,
})

// Watchers para inicializar filtros cuando se cargan las opciones
watch(usuariosOptions, () => usuariosFilter.initializeOptions(), { immediate: true })
watch(oficinasOptions, () => oficinasFilter.initializeOptions(), { immediate: true })
watch(dispositivosOptions, () => dispositivosFilter.initializeOptions(), { immediate: true })
watch(escanersOptions, () => escanersFilter.initializeOptions(), { immediate: true })

// Computed para el texto del rango de fechas
const rangoFechasTexto = computed(() => {
  if (!filtro.value.rangoFechas) return ''
  if (typeof filtro.value.rangoFechas === 'string') return filtro.value.rangoFechas
  if (filtro.value.rangoFechas.from && filtro.value.rangoFechas.to) {
    return `${filtro.value.rangoFechas.from} - ${filtro.value.rangoFechas.to}`
  }
  return filtro.value.rangoFechas.from || ''
})

// Computed para el resumen de filtros activos
const resumenFiltros = computed(() => {
  const activos = []
  if (filtro.value.rangoFechas) activos.push('Fechas')
  if (filtro.value.oficina) activos.push('Oficina')
  if (filtro.value.usuario) activos.push('Usuario')
  if (filtro.value.dispositivo) activos.push('Dispositivo')
  if (filtro.value.escaner) activos.push('Escáner')
  if (filtro.value.proceso) activos.push('Proceso')
  if (filtro.value.tipoLog) activos.push('Tipo Log')
  return activos
})

// Validar que las fechas estén seleccionadas
const validarFiltros = () => {
  if (!filtro.value.rangoFechas) {
    $q.notify({
      type: 'negative',
      message: 'Debe seleccionar un rango de fechas',
      position: 'top',
    })
    return false
  }
  return true
}

// Función para filtrar usuarios (ahora usando el hook)
const filtrarUsuarios = (val, update, abort) => {
  usuariosFilter.filterOptions(val, update, abort)
}

// Aplicar filtros (simplificado)
const aplicarFiltros = () => {
  if (!validarFiltros()) return

  loadingFiltros.value = true

  const filtrosParaEmitir = construirFiltros()
  emit('filtrar', filtrosParaEmitir)

  $q.notify({
    type: 'positive',
    message: 'Filtros aplicados correctamente',
    position: 'top',
  })

  loadingFiltros.value = false
}

// Construir objeto de filtros normalizado
const construirFiltros = () => {
  let fechaInicio, fechaFin

  // Función auxiliar para normalizar formato de fecha
  const normalizarFecha = (fecha) => {
    if (!fecha) return null

    // Si ya está en formato YYYY-MM-DD, mantenerlo
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha
    }

    // Si está en formato YYYY/MM/DD, convertir a YYYY-MM-DD
    if (typeof fecha === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(fecha)) {
      return fecha.replace(/\//g, '-')
    }

    // Si es un objeto Date, convertir a formato ISO
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0]
    }

    // Intentar crear Date y convertir
    try {
      const date = new Date(fecha)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn('Error normalizando fecha:', fecha, error)
    }

    return null
  }

  if (typeof filtro.value.rangoFechas === 'string') {
    const fechaNormalizada = normalizarFecha(filtro.value.rangoFechas)
    fechaInicio = fechaFin = fechaNormalizada
  } else if (filtro.value.rangoFechas) {
    fechaInicio = normalizarFecha(filtro.value.rangoFechas.from)
    fechaFin = normalizarFecha(filtro.value.rangoFechas.to) || fechaInicio
  }

  // Función auxiliar para extraer solo el valor
  const extraerValor = (item) => {
    if (!item) return null
    return typeof item === 'object' && item.value !== undefined ? item.value : item
  }

  return {
    fechaInicio,
    fechaFin,
    oficina: extraerValor(filtro.value.oficina),
    usuario: extraerValor(filtro.value.usuario),
    dispositivo: extraerValor(filtro.value.dispositivo),
    escaner: extraerValor(filtro.value.escaner),
    proceso: extraerValor(filtro.value.proceso),
    tipoLog: extraerValor(filtro.value.tipoLog),
  }
}

// Limpiar filtros
const limpiarFiltros = () => {
  filtro.value = {
    rangoFechas: getFechaRangoDefault(),
    oficina: null,
    usuario: null,
    dispositivo: null,
    escaner: null,
    proceso: null,
    tipoLog: null,
  }

  $q.notify({
    type: 'info',
    message: 'Filtros limpiados',
    position: 'top',
  })
}

// Función para obtener rango de fechas por defecto (último mes)
const getFechaRangoDefault = () => {
  const hoy = new Date()
  const hace30Dias = new Date()
  hace30Dias.setDate(hoy.getDate() - 30)

  // Asegurar formato YYYY-MM-DD
  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    from: formatearFecha(hace30Dias),
    to: formatearFecha(hoy),
  }
}

// Cargar datos iniciales
onMounted(async () => {
  loadingCatalogos.value = true
  try {
    // Cargar opciones de catálogos estáticos
    procesosOptions.value = CatalogService.getTiposProceso()
    tiposLogOptions.value = CatalogService.getTiposLog()

    // Cargar opciones dinámicas
    const [oficinas, usuarios, dispositivos, escaners] = await Promise.all([
      CatalogService.cargarOficinas(),
      CatalogService.cargarPersonas(),
      CatalogService.cargarDispositivos(),
      CatalogService.cargarEscaneres(),
    ])

    oficinasOptions.value = oficinas
    usuariosOptions.value = usuarios
    dispositivosOptions.value = dispositivos
    escanersOptions.value = escaners

    // Establecer fecha por defecto
    filtro.value.rangoFechas = getFechaRangoDefault()
  } catch (error) {
    console.error('Error cargando catálogos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error cargando opciones de filtros',
      position: 'top',
    })
  } finally {
    loadingCatalogos.value = false
  }
})
</script>

<style lang="scss" scoped>
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
</style>
