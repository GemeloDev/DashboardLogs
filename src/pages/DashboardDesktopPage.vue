<template>
  <q-page class="dashboard-desktop-page bg-dark text-white">
    <!-- Header Desktop -->
    <div class="dashboard-header bg-gradient-to-r from-grey-9 to-grey-8 q-pa-xl">
      <div class="container">
        <div class="row items-center q-gutter-lg">
          <div class="col">
            <div class="text-h2 text-weight-bold q-mb-md">
              <q-icon name="dashboard" class="q-mr-md" color="blue-4" size="56px" />
              🖥️ Dashboard Escritorio
            </div>
            <div class="text-h5 text-blue-3 q-mb-lg">
              📊 Panel de Control Avanzado | 🎯 Optimizado para Pantallas Grandes
            </div>

            <!-- Métricas en Grid Grande -->
            <div class="row q-gutter-lg">
              <div class="col-3">
                <q-card class="bg-gradient-to-br from-blue-8 to-blue-9 text-white">
                  <q-card-section class="text-center q-pa-lg">
                    <q-icon name="analytics" size="48px" color="blue-3" />
                    <div class="text-h4 q-mt-md">1,247</div>
                    <div class="text-subtitle1">Logs Procesados</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-3">
                <q-card class="bg-gradient-to-br from-green-8 to-green-9 text-white">
                  <q-card-section class="text-center q-pa-lg">
                    <q-icon name="trending_up" size="48px" color="green-3" />
                    <div class="text-h4 q-mt-md">98.5%</div>
                    <div class="text-subtitle1">Disponibilidad</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-3">
                <q-card class="bg-gradient-to-br from-orange-8 to-orange-9 text-white">
                  <q-card-section class="text-center q-pa-lg">
                    <q-icon name="warning" size="48px" color="orange-3" />
                    <div class="text-h4 q-mt-md">23</div>
                    <div class="text-subtitle1">Alertas Activas</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-3">
                <q-card class="bg-gradient-to-br from-purple-8 to-purple-9 text-white">
                  <q-card-section class="text-center q-pa-lg">
                    <q-icon name="people" size="48px" color="purple-3" />
                    <div class="text-h4 q-mt-md">156</div>
                    <div class="text-subtitle1">Usuarios Activos</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal Desktop -->
    <div class="dashboard-content q-pa-xl">
      <div class="container">
        <div class="row q-gutter-lg">
          <!-- Panel Izquierdo - Gráficas -->
          <div class="col-8">
            <q-card class="bg-grey-9 text-white">
              <q-card-section>
                <div class="text-h5 q-mb-lg">📈 Análisis de Rendimiento en Tiempo Real</div>
                <div class="dashboard-chart-container" style="height: 400px">
                  <!-- Aquí irían las gráficas grandes para escritorio -->
                  <div class="flex flex-center" style="height: 100%">
                    <div class="text-center">
                      <q-icon name="show_chart" size="80px" color="blue-4" />
                      <div class="text-h6 q-mt-md">Gráficas Interactivas</div>
                      <div class="text-body2 text-grey-5">Optimizadas para pantallas grandes</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Tabla de Datos Detallada -->
            <q-card class="bg-grey-9 text-white q-mt-lg">
              <q-card-section>
                <div class="text-h6 q-mb-md">📋 Logs Recientes - Vista Detallada</div>
                <q-table
                  :rows="logsData"
                  :columns="columnsDesktop"
                  row-key="id"
                  dark
                  flat
                  bordered
                  :pagination="{ rowsPerPage: 10 }"
                  class="desktop-table"
                >
                  <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                      <q-chip
                        :color="props.value === 'success' ? 'green' : 'red'"
                        text-color="white"
                        dense
                      >
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Panel Derecho - Controles y Widgets -->
          <div class="col-4">
            <!-- Widget de Estado del Sistema -->
            <q-card class="bg-grey-9 text-white q-mb-lg">
              <q-card-section>
                <div class="text-h6 q-mb-md">🔧 Estado del Sistema</div>
                <div class="q-gutter-md">
                  <div class="row items-center">
                    <q-icon name="memory" color="blue-4" size="24px" />
                    <span class="q-ml-sm">CPU: 45%</span>
                    <q-linear-progress
                      value="0.45"
                      color="blue"
                      class="q-ml-auto"
                      style="width: 100px"
                    />
                  </div>
                  <div class="row items-center">
                    <q-icon name="storage" color="green-4" size="24px" />
                    <span class="q-ml-sm">RAM: 62%</span>
                    <q-linear-progress
                      value="0.62"
                      color="green"
                      class="q-ml-auto"
                      style="width: 100px"
                    />
                  </div>
                  <div class="row items-center">
                    <q-icon name="hard_drive_2" color="orange-4" size="24px" />
                    <span class="q-ml-sm">Disco: 78%</span>
                    <q-linear-progress
                      value="0.78"
                      color="orange"
                      class="q-ml-auto"
                      style="width: 100px"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Acciones Rápidas Desktop -->
            <q-card class="bg-grey-9 text-white q-mb-lg">
              <q-card-section>
                <div class="text-h6 q-mb-md">⚡ Acciones Rápidas</div>
                <div class="q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    label="Actualizar Dashboard"
                    @click="actualizarDashboard"
                    class="full-width"
                    unelevated
                  />
                  <q-btn
                    color="secondary"
                    icon="download"
                    label="Exportar Reporte"
                    @click="exportarReporte"
                    class="full-width"
                    unelevated
                  />
                  <q-btn
                    color="info"
                    icon="settings"
                    label="Configuración"
                    @click="abrirConfiguracion"
                    class="full-width"
                    flat
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Widget de Navegación -->
            <q-card class="bg-grey-9 text-white">
              <q-card-section>
                <div class="text-h6 q-mb-md">🧭 Navegación Rápida</div>
                <div class="q-gutter-sm">
                  <q-btn
                    color="cyan"
                    icon="phone_android"
                    label="Ver Versión Mobile"
                    @click="irAMobile"
                    class="full-width"
                    outline
                  />
                  <q-btn
                    color="deep-purple"
                    icon="medical_services"
                    label="Diagnóstico"
                    to="/diagnostico"
                    class="full-width"
                    outline
                  />
                  <q-btn
                    color="teal"
                    icon="analytics"
                    label="Estadísticas"
                    to="/estadisticas"
                    class="full-width"
                    outline
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// Datos mock para la tabla
const logsData = ref([
  {
    id: 1,
    timestamp: '2025-09-11 14:30:25',
    level: 'INFO',
    message: 'Usuario autenticado correctamente',
    source: 'AuthService',
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2025-09-11 14:28:12',
    level: 'ERROR',
    message: 'Fallo en conexión a base de datos',
    source: 'DatabaseService',
    status: 'error',
  },
  {
    id: 3,
    timestamp: '2025-09-11 14:25:45',
    level: 'WARN',
    message: 'Cache expirando en 5 minutos',
    source: 'CacheService',
    status: 'warning',
  },
])

// Columnas optimizadas para escritorio
const columnsDesktop = [
  {
    name: 'timestamp',
    required: true,
    label: 'Fecha y Hora',
    align: 'left',
    field: 'timestamp',
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'level',
    align: 'center',
    label: 'Nivel',
    field: 'level',
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'source',
    align: 'left',
    label: 'Fuente',
    field: 'source',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'message',
    align: 'left',
    label: 'Mensaje',
    field: 'message',
    sortable: false,
  },
  {
    name: 'status',
    align: 'center',
    label: 'Estado',
    field: 'status',
    sortable: true,
    style: 'width: 120px',
  },
]

// Funciones
const actualizarDashboard = () => {
  $q.notify({
    type: 'positive',
    message: '🔄 Dashboard actualizado correctamente',
    position: 'top-right',
  })
}

const exportarReporte = () => {
  $q.notify({
    type: 'info',
    message: '📊 Generando reporte detallado...',
    position: 'top-right',
  })
}

const abrirConfiguracion = () => {
  $q.notify({
    type: 'info',
    message: '⚙️ Abriendo configuración avanzada',
    position: 'top-right',
  })
}

const irAMobile = () => {
  router.push('/dashboard-mobile')
}

onMounted(() => {
  // Simular carga de datos
  $q.notify({
    type: 'positive',
    message: '🖥️ Dashboard Desktop cargado',
    position: 'top-right',
  })
})
</script>

<style scoped>
.dashboard-desktop-page {
  min-height: 100vh;
}

.dashboard-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.desktop-table {
  font-size: 14px;
}

.desktop-table th {
  background: rgba(255, 255, 255, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
