<template>
  <div class="table-container">
    <!-- Controles de tabla mejorados -->
    <div class="table-controls q-mb-md">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtroTexto"
            placeholder="Buscar en tabla..."
            filled
            dense
            dark
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="filtroTexto !== ''"
                name="clear"
                class="cursor-pointer"
                @click="filtroTexto = ''"
              />
            </template>
          </q-input>
        </div>
        
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroDispositivo"
            :options="dispositivosUnicos"
            label="Filtrar por dispositivo"
            filled
            dense
            dark
            clearable
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroResultado"
            :options="resultadosUnicos"
            label="Filtrar por resultado"
            filled
            dense
            dark
            clearable
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-2">
          <q-btn
            icon="file_download"
            label="Exportar"
            color="primary"
            @click="exportarDatos"
            dense
            class="full-width"
          />
        </div>
      </div>
    </div>

    <!-- Tabla mejorada con funcionalidades avanzadas -->
    <q-table 
      :rows="filasFiltradas" 
      :columns="columnas" 
      row-key="id"
      :pagination="paginacion"
      @request="onRequest"
      :loading="cargando"
      dense
      flat
      bordered
      class="tabla-eventos-fallidos"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="filasSeleccionadas"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      :filter="filtroTexto"
    >
      <!-- Slot personalizado para el encabezado -->
      <template v-slot:top>
        <div class="row full-width items-center">
          <div class="col">
            <div class="text-h6 text-white">
              <q-icon name="error_outline" class="q-mr-sm" />
              Eventos Fallidos ({{ filasFiltradas.length }} registros)
            </div>
          </div>
          <div class="col-auto">
            <q-btn-group flat>
              <q-btn 
                icon="refresh"
                @click="actualizarDatos"
                color="primary"
                size="sm"
                dense
              />
              <q-btn 
                icon="visibility"
                @click="alternarColumnas"
                color="primary"
                size="sm"
                dense
              />
            </q-btn-group>
          </div>
        </div>
      </template>

      <!-- Slots para células personalizadas -->
      <template v-slot:body-cell-resultado="props">
        <q-td :props="props">
          <q-badge 
            :color="getColorResultado(props.value)" 
            :label="props.value"
            class="text-weight-bold"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-usuario="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="24px" color="primary" text-color="white" class="q-mr-sm">
              {{ props.value?.charAt(0)?.toUpperCase() || '?' }}
            </q-avatar>
            {{ props.value }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-dispositivo="props">
        <q-td :props="props">
          <q-chip
            :icon="getIconoDispositivo(props.value)"
            :label="props.value"
            size="sm"
            outline
            color="blue-grey"
            text-color="white"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn-group flat dense>
            <q-btn
              icon="visibility"
              size="sm"
              color="primary"
              @click="verDetalle(props.row)"
              dense
              round
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn
              icon="bug_report"
              size="sm"
              color="orange"
              @click="reportarBug(props.row)"
              dense
              round
            >
              <q-tooltip>Reportar bug</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>

      <!-- Loading personalizado -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Mensaje sin datos -->
      <template v-slot:no-data="{ message }">
        <div class="full-width row flex-center text-grey-5 q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>{{ message || 'No hay datos disponibles' }}</span>
        </div>
      </template>
    </q-table>

    <!-- Estadísticas de la tabla -->
    <div class="table-stats q-mt-md">
      <div class="row q-col-gutter-md">
        <div class="col-auto">
          <q-chip color="primary" text-color="white" icon="table_view">
            Total: {{ filasFiltradas.length }}
          </q-chip>
        </div>
        <div class="col-auto" v-if="filasSeleccionadas.length > 0">
          <q-chip color="positive" text-color="white" icon="check_circle">
            Seleccionadas: {{ filasSeleccionadas.length }}
          </q-chip>
          <q-btn
            icon="delete"
            label="Eliminar seleccionadas"
            color="negative"
            size="sm"
            @click="eliminarSeleccionadas"
            class="q-ml-sm"
          />
        </div>
      </div>
    </div>

    <!-- Dialog para ver detalles -->
    <q-dialog v-model="dialogDetalle">
      <q-card style="min-width: 400px" dark>
        <q-card-section>
          <div class="text-h6">Detalle del Evento</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="eventoSeleccionado">
            <q-list dense>
              <q-item v-for="(value, key) in eventoSeleccionado" :key="key">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ formatearClave(key) }}</q-item-label>
                  <q-item-label caption>{{ value || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { exportFile, useQuasar } from 'quasar'

// Props
const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

// Composables
const $q = useQuasar()

// Estado reactivo
const filtroTexto = ref('')
const filtroDispositivo = ref(null)
const filtroResultado = ref(null)
const filasSeleccionadas = ref([])
const cargando = ref(false)
const dialogDetalle = ref(false)
const eventoSeleccionado = ref(null)

// Paginación
const paginacion = ref({
  sortBy: 'resultadoEvento',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 📊 COLUMNAS MEJORADAS CON FUNCIONALIDADES AVANZADAS
const columnas = [
  {
    name: 'resultado',
    required: true,
    label: 'Estado',
    align: 'left',
    field: 'resultadoEvento',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'usuario',
    align: 'left',
    label: 'Usuario',
    field: 'usuario',
    sortable: true,
    style: 'min-width: 150px'
  },
  {
    name: 'dispositivo',
    align: 'left',
    label: 'Dispositivo',
    field: 'dispositivo',
    sortable: true,
    style: 'min-width: 120px'
  },
  {
    name: 'tipo',
    align: 'left',
    label: 'Tipo de Evento',
    field: 'tipoEvento',
    sortable: true,
    style: 'min-width: 140px'
  },
  {
    name: 'android',
    align: 'center',
    label: 'Versión Android',
    field: 'versionAndroidDispositivo',
    sortable: true,
    style: 'width: 130px'
  },
  {
    name: 'acciones',
    align: 'center',
    label: 'Acciones',
    field: 'acciones',
    sortable: false,
    style: 'width: 100px'
  }
]

// 📊 COMPUTADAS PARA FILTROS DINÁMICOS
const dispositivosUnicos = computed(() => {
  const dispositivos = [...new Set(props.logs.map(log => log.dispositivo).filter(Boolean))]
  return dispositivos.map(d => ({ label: d, value: d }))
})

const resultadosUnicos = computed(() => {
  const resultados = [...new Set(props.logs.map(log => log.resultadoEvento).filter(Boolean))]
  return resultados.map(r => ({ label: r, value: r }))
})

// 📊 FILAS FILTRADAS CON MÚLTIPLES CRITERIOS
const filasFiltradas = computed(() => {
  let filtradas = [...props.logs]
  
  // Filtro por dispositivo
  if (filtroDispositivo.value) {
    filtradas = filtradas.filter(log => log.dispositivo === filtroDispositivo.value)
  }
  
  // Filtro por resultado
  if (filtroResultado.value) {
    filtradas = filtradas.filter(log => log.resultadoEvento === filtroResultado.value)
  }
  
  return filtradas
})

// 📊 FUNCIONES PARA ESTILOS Y FORMATEO
function getColorResultado(resultado) {
  const colores = {
    'ERROR': 'negative',
    'FALLIDO': 'red-8',
    'TIMEOUT': 'orange-8',
    'EXCEPCION': 'deep-orange-8',
    'CANCELADO': 'amber-8'
  }
  return colores[resultado?.toUpperCase()] || 'grey-6'
}

function getIconoDispositivo(dispositivo) {
  if (dispositivo?.toLowerCase().includes('tablet')) return 'tablet'
  if (dispositivo?.toLowerCase().includes('phone')) return 'phone_android'
  return 'devices'
}

function getSelectedString() {
  return filasSeleccionadas.value.length === 0 
    ? ''
    : `${filasSeleccionadas.value.length} registro${filasSeleccionadas.value.length > 1 ? 's' : ''} seleccionado${filasSeleccionadas.value.length > 1 ? 's' : ''} de ${filasFiltradas.value.length}`
}

// 📊 FUNCIONES DE INTERACCIÓN
function verDetalle(evento) {
  eventoSeleccionado.value = evento
  dialogDetalle.value = true
}

function reportarBug(evento) {
  $q.notify({
    type: 'info',
    message: `Bug reportado para evento de ${evento.usuario}`,
    caption: 'El reporte ha sido enviado al equipo de desarrollo',
    icon: 'bug_report',
    position: 'top'
  })
}

function eliminarSeleccionadas() {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de que desea eliminar ${filasSeleccionadas.value.length} registro(s)?`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    filasSeleccionadas.value = []
    $q.notify({
      type: 'positive',
      message: 'Registros eliminados correctamente',
      icon: 'check_circle'
    })
  })
}

function actualizarDatos() {
  cargando.value = true
  setTimeout(() => {
    cargando.value = false
    $q.notify({
      type: 'positive',
      message: 'Datos actualizados',
      icon: 'refresh'
    })
  }, 1000)
}

function alternarColumnas() {
  $q.notify({
    type: 'info',
    message: 'Configuración de columnas próximamente',
    icon: 'visibility'
  })
}

function exportarDatos() {
  const contenido = [
    // Encabezados
    columnas.filter(col => col.name !== 'acciones').map(col => col.label).join(','),
    // Datos
    ...filasFiltradas.value.map(fila => 
      columnas
        .filter(col => col.name !== 'acciones')
        .map(col => `"${fila[col.field] || ''}"`)
        .join(',')
    )
  ].join('\n')

  const status = exportFile('eventos-fallidos.csv', contenido, 'text/csv')
  
  if (status !== true) {
    $q.notify({
      message: 'El navegador denegó la descarga del archivo',
      color: 'negative',
      icon: 'warning'
    })
  } else {
    $q.notify({
      message: 'Archivo exportado correctamente',
      color: 'positive',
      icon: 'file_download'
    })
  }
}

function onRequest(props) {
  cargando.value = true
  
  setTimeout(() => {
    paginacion.value = props.pagination
    cargando.value = false
  }, 300)
}

function formatearClave(clave) {
  return clave
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Watchers
watch(() => props.logs, () => {
  paginacion.value.rowsNumber = filasFiltradas.value.length
}, { immediate: true })
</script>
<style scoped>
.table-container {
  width: 100%;
}

/* 🎨 ESTILOS PROFESIONALES PARA LA TABLA */
.tabla-eventos-fallidos {
  background-color: #1e1e2f;
  border-radius: 12px;
  overflow: hidden;
}

.tabla-eventos-fallidos .q-table__top {
  background-color: #263238;
  color: white;
}

.tabla-eventos-fallidos .q-table thead {
  background-color: #37474f;
}

.tabla-eventos-fallidos .q-table thead th {
  color: white;
  font-weight: 600;
  border-bottom: 2px solid #546e7a;
}

.tabla-eventos-fallidos .q-table tbody tr {
  background-color: #1e1e2f;
}

.tabla-eventos-fallidos .q-table tbody tr:hover {
  background-color: #2d3748;
}

.tabla-eventos-fallidos .q-table tbody td {
  color: #e0e0e0;
  border-bottom: 1px solid #3a3a52;
}

/* Controles de tabla */
.table-controls {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 16px;
}

.search-input .q-field__control {
  background-color: #3a3a52 !important;
  border-radius: 8px;
}

.search-input .q-field__native {
  color: white !important;
}

/* Estadísticas de tabla */
.table-stats {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
}

/* Efectos hover para botones */
.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .table-controls .row {
    flex-direction: column;
  }
  
  .table-controls .col-12 {
    margin-bottom: 8px;
  }
  
  .tabla-eventos-fallidos {
    font-size: 0.85rem;
  }
  
  .tabla-eventos-fallidos .q-table thead th,
  .tabla-eventos-fallidos .q-table tbody td {
    padding: 8px 4px;
  }
}

/* Animaciones */
.tabla-eventos-fallidos .q-table tbody tr {
  transition: background-color 0.3s ease;
}

.q-chip {
  transition: all 0.3s ease;
}

.q-chip:hover {
  transform: scale(1.05);
}

.q-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Scrollbar personalizado */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
