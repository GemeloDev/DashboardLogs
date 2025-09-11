<template>
  <q-page class="dashboard-mobile-page bg-dark text-white">
    <!-- Header Mobile Optimizado -->
    <div class="mobile-header bg-gradient-to-r from-grey-9 to-grey-8 q-pa-md">
      <div class="text-center">
        <div class="text-h4 text-weight-bold q-mb-sm">
          <q-icon name="phone_android" class="q-mr-sm" color="green-4" size="36px" />
          📱 Dashboard Mobile
        </div>
        <div class="text-body1 text-green-3">🎯 Optimizado para dispositivos móviles</div>
      </div>
    </div>

    <!-- Métricas Móviles en Cards Verticales -->
    <div class="mobile-metrics q-pa-md">
      <div class="row q-gutter-sm">
        <div class="col-6">
          <q-card class="bg-gradient-to-br from-blue-7 to-blue-8 text-white text-center">
            <q-card-section class="q-pa-md">
              <q-icon name="analytics" size="32px" color="blue-3" />
              <div class="text-h6 q-mt-sm">1,247</div>
              <div class="text-caption">Logs</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="bg-gradient-to-br from-green-7 to-green-8 text-white text-center">
            <q-card-section class="q-pa-md">
              <q-icon name="trending_up" size="32px" color="green-3" />
              <div class="text-h6 q-mt-sm">98.5%</div>
              <div class="text-caption">Uptime</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-gutter-sm q-mt-sm">
        <div class="col-6">
          <q-card class="bg-gradient-to-br from-orange-7 to-orange-8 text-white text-center">
            <q-card-section class="q-pa-md">
              <q-icon name="warning" size="32px" color="orange-3" />
              <div class="text-h6 q-mt-sm">23</div>
              <div class="text-caption">Alertas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="bg-gradient-to-br from-purple-7 to-purple-8 text-white text-center">
            <q-card-section class="q-pa-md">
              <q-icon name="people" size="32px" color="purple-3" />
              <div class="text-h6 q-mt-sm">156</div>
              <div class="text-caption">Usuarios</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Gráfica Mobile Simplificada -->
    <div class="mobile-chart q-pa-md">
      <q-card class="bg-grey-9 text-white">
        <q-card-section>
          <div class="text-h6 q-mb-md">📊 Resumen de Actividad</div>
          <div class="chart-mobile-container" style="height: 200px">
            <div class="flex flex-center" style="height: 100%">
              <div class="text-center">
                <q-icon name="insights" size="48px" color="cyan-4" />
                <div class="text-body1 q-mt-sm">Gráfica Móvil</div>
                <div class="text-caption text-grey-5">Datos en tiempo real</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Lista de Logs Móvil -->
    <div class="mobile-logs q-pa-md">
      <q-card class="bg-grey-9 text-white">
        <q-card-section>
          <div class="text-h6 q-mb-md">📝 Logs Recientes</div>

          <!-- Lista optimizada para móvil -->
          <q-list>
            <q-item
              v-for="log in logsMobile"
              :key="log.id"
              class="q-mb-sm bg-grey-8 rounded-borders"
            >
              <q-item-section avatar>
                <q-icon :name="getLogIcon(log.level)" :color="getLogColor(log.level)" size="24px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-white">{{ log.message }}</q-item-label>
                <q-item-label caption class="text-grey-4">
                  {{ log.timestamp }} | {{ log.source }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip
                  :color="log.level === 'INFO' ? 'green' : log.level === 'ERROR' ? 'red' : 'orange'"
                  text-color="white"
                  dense
                  size="sm"
                >
                  {{ log.level }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Botón Ver Más -->
          <div class="text-center q-mt-md">
            <q-btn
              color="primary"
              icon="expand_more"
              label="Ver más logs"
              @click="cargarMasLogs"
              outline
              class="full-width"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Acciones Rápidas Mobile -->
    <div class="mobile-actions q-pa-md">
      <q-card class="bg-grey-9 text-white">
        <q-card-section>
          <div class="text-h6 q-mb-md">⚡ Acciones Rápidas</div>

          <div class="row q-gutter-sm">
            <div class="col-6">
              <q-btn
                color="primary"
                icon="refresh"
                label="Actualizar"
                @click="actualizarMobile"
                class="full-width"
                stack
                unelevated
              />
            </div>
            <div class="col-6">
              <q-btn
                color="secondary"
                icon="download"
                label="Exportar"
                @click="exportarMobile"
                class="full-width"
                stack
                unelevated
              />
            </div>
          </div>

          <div class="row q-gutter-sm q-mt-sm">
            <div class="col-6">
              <q-btn
                color="deep-purple"
                icon="medical_services"
                label="Diagnóstico"
                to="/diagnostico"
                class="full-width"
                stack
                outline
              />
            </div>
            <div class="col-6">
              <q-btn
                color="cyan"
                icon="desktop_windows"
                label="Vista Desktop"
                @click="irADesktop"
                class="full-width"
                stack
                outline
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Estado del Sistema Mobile -->
    <div class="mobile-status q-pa-md q-pb-xl">
      <q-card class="bg-grey-9 text-white">
        <q-card-section>
          <div class="text-h6 q-mb-md">🔧 Estado del Sistema</div>

          <div class="q-gutter-md">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon name="memory" color="blue-4" size="20px" />
                <span class="q-ml-sm text-body2">CPU</span>
              </div>
              <div class="row items-center">
                <span class="text-body2 q-mr-sm">45%</span>
                <q-linear-progress value="0.45" color="blue" style="width: 80px" size="8px" />
              </div>
            </div>

            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon name="storage" color="green-4" size="20px" />
                <span class="q-ml-sm text-body2">RAM</span>
              </div>
              <div class="row items-center">
                <span class="text-body2 q-mr-sm">62%</span>
                <q-linear-progress value="0.62" color="green" style="width: 80px" size="8px" />
              </div>
            </div>

            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon name="hard_drive_2" color="orange-4" size="20px" />
                <span class="q-ml-sm text-body2">Disco</span>
              </div>
              <div class="row items-center">
                <span class="text-body2 q-mr-sm">78%</span>
                <q-linear-progress value="0.78" color="orange" style="width: 80px" size="8px" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// Datos optimizados para móvil
const logsMobile = ref([
  {
    id: 1,
    timestamp: '14:30',
    level: 'INFO',
    message: 'Usuario autenticado',
    source: 'Auth',
  },
  {
    id: 2,
    timestamp: '14:28',
    level: 'ERROR',
    message: 'Fallo en BD',
    source: 'DB',
  },
  {
    id: 3,
    timestamp: '14:25',
    level: 'WARN',
    message: 'Cache expirando',
    source: 'Cache',
  },
  {
    id: 4,
    timestamp: '14:22',
    level: 'INFO',
    message: 'Sistema iniciado',
    source: 'Core',
  },
])

// Funciones auxiliares
const getLogIcon = (level) => {
  switch (level) {
    case 'ERROR':
      return 'error'
    case 'WARN':
      return 'warning'
    case 'INFO':
      return 'info'
    default:
      return 'circle'
  }
}

const getLogColor = (level) => {
  switch (level) {
    case 'ERROR':
      return 'red-4'
    case 'WARN':
      return 'orange-4'
    case 'INFO':
      return 'blue-4'
    default:
      return 'grey-4'
  }
}

// Funciones de acción
const cargarMasLogs = () => {
  $q.notify({
    type: 'info',
    message: '📱 Cargando más logs...',
    position: 'top',
  })
}

const actualizarMobile = () => {
  $q.notify({
    type: 'positive',
    message: '📱 Dashboard móvil actualizado',
    position: 'top',
  })
}

const exportarMobile = () => {
  $q.notify({
    type: 'info',
    message: '📊 Exportando datos móviles...',
    position: 'top',
  })
}

const irADesktop = () => {
  router.push('/dashboard-desktop')
}

onMounted(() => {
  $q.notify({
    type: 'positive',
    message: '📱 Dashboard Mobile cargado',
    position: 'top',
  })
})
</script>

<style scoped>
.dashboard-mobile-page {
  min-height: 100vh;
  padding-bottom: 80px; /* Space for mobile navigation */
}

.mobile-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.mobile-metrics .q-card {
  min-height: 100px;
}

.chart-mobile-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.q-item {
  border-radius: 8px;
}

/* Asegurar que los botones stack se vean bien */
.q-btn.stack {
  min-height: 60px;
}

/* Optimizaciones para pantallas muy pequeñas */
@media (max-width: 360px) {
  .mobile-metrics .text-h6 {
    font-size: 1rem;
  }

  .mobile-metrics .text-caption {
    font-size: 0.7rem;
  }
}
</style>
