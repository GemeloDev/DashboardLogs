<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="diagnostic-modal"
  >
    <q-card class="diagnostic-container">
      <!-- Header Profesional -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="analytics" size="2rem" color="primary" />
            <div>
              <h2 class="professional-title">Centro de Diagnóstico</h2>
              <p class="professional-subtitle">Análisis avanzado del sistema</p>
            </div>
          </div>

          <div class="header-controls">
            <q-input
              v-model="searchQuery"
              placeholder="Buscar en diagnósticos..."
              outlined
              dense
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn flat round dense icon="close" @click="closeModal" class="close-btn" />
          </div>
        </div>

        <!-- Indicadores de Estado -->
        <div class="status-indicators">
          <div class="row q-gutter-md">
            <div class="col-auto">
              <div class="stat-card">
                <q-icon name="error" color="negative" size="md" />
                <div>
                  <div class="stat-value">{{ totalErrores }}</div>
                  <div class="stat-label">Errores</div>
                </div>
              </div>
            </div>

            <div class="col-auto">
              <div class="stat-card">
                <q-icon name="warning" color="warning" size="md" />
                <div>
                  <div class="stat-value">{{ totalAdvertencias }}</div>
                  <div class="stat-label">Advertencias</div>
                </div>
              </div>
            </div>

            <div class="col-auto">
              <div class="stat-card">
                <q-icon name="check_circle" color="positive" size="md" />
                <div>
                  <div class="stat-value">{{ totalExitos }}</div>
                  <div class="stat-label">Exitosos</div>
                </div>
              </div>
            </div>

            <div class="col-auto">
              <div class="stat-card">
                <q-icon name="trending_up" color="info" size="md" />
                <div>
                  <div class="stat-value">{{ rendimientoSistema }}%</div>
                  <div class="stat-label">Rendimiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="content-section">
        <q-tabs
          v-model="activeTab"
          dense
          class="tabs-navigation"
          indicator-color="primary"
          active-color="primary"
          align="justify"
        >
          <q-tab name="busqueda" label="Búsqueda" icon="search" />
          <q-tab name="analisis" label="Análisis" icon="analytics" />
          <q-tab name="timeline" label="Timeline" icon="timeline" />
          <q-tab name="metricas" label="Métricas" icon="bar_chart" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated class="tab-content">
          <!-- Panel de Búsqueda -->
          <q-tab-panel name="busqueda" class="search-panel">
            <div class="panel-header">
              <h3>Búsqueda Avanzada</h3>
              <p>Utiliza filtros para encontrar eventos específicos</p>
            </div>

            <div class="search-form">
              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="busquedaAvanzada.termino"
                    label="Término de búsqueda"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-3">
                  <q-select
                    v-model="busquedaAvanzada.tipo"
                    :options="tiposEvento"
                    label="Tipo de evento"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-3">
                  <q-select
                    v-model="busquedaAvanzada.prioridad"
                    :options="prioridades"
                    label="Prioridad"
                    outlined
                    dense
                  />
                </div>
              </div>

              <div class="row q-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="busquedaAvanzada.fechaInicio"
                    label="Fecha inicio"
                    type="datetime-local"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="busquedaAvanzada.fechaFin"
                    label="Fecha fin"
                    type="datetime-local"
                    outlined
                    dense
                  />
                </div>
              </div>

              <div class="search-actions q-mt-md">
                <q-btn
                  color="primary"
                  label="Buscar"
                  icon="search"
                  @click="realizarBusqueda"
                  :loading="cargandoBusqueda"
                />
                <q-btn flat label="Limpiar" icon="clear" @click="limpiarBusqueda" />
              </div>
            </div>
          </q-tab-panel>

          <!-- Panel de Análisis -->
          <q-tab-panel name="analisis" class="analysis-panel">
            <div class="panel-header">
              <h3>Análisis del Sistema</h3>
              <p>Diagnósticos y evaluaciones en tiempo real</p>
            </div>

            <div class="analysis-grid">
              <div class="row q-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-card class="analysis-card">
                    <q-card-section>
                      <div class="card-title">
                        <q-icon name="memory" color="primary" />
                        <span>Uso de Memoria</span>
                      </div>
                      <q-linear-progress
                        :value="0.65"
                        size="20px"
                        color="primary"
                        class="q-mt-md"
                      />
                      <div class="usage-info">65% utilizada</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card class="analysis-card">
                    <q-card-section>
                      <div class="card-title">
                        <q-icon name="storage" color="warning" />
                        <span>Espacio en Disco</span>
                      </div>
                      <q-linear-progress
                        :value="0.82"
                        size="20px"
                        color="warning"
                        class="q-mt-md"
                      />
                      <div class="usage-info">82% utilizado</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Panel de Timeline -->
          <q-tab-panel name="timeline" class="timeline-panel">
            <div class="panel-header">
              <h3>Timeline de Eventos</h3>
              <p>Cronología de eventos del sistema</p>
            </div>

            <q-timeline color="primary" class="event-timeline">
              <q-timeline-entry
                v-for="evento in eventosTimeline"
                :key="evento.id"
                :title="evento.titulo"
                :subtitle="evento.fecha"
                :icon="evento.icono"
                :color="evento.color"
              >
                <div class="event-content">
                  {{ evento.descripcion }}
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-tab-panel>

          <!-- Panel de Métricas -->
          <q-tab-panel name="metricas" class="metrics-panel">
            <div class="panel-header">
              <h3>Métricas del Sistema</h3>
              <p>Estadísticas y rendimiento</p>
            </div>

            <div class="metrics-grid">
              <div class="row q-gutter-lg">
                <div class="col-12 col-md-4" v-for="metrica in metricas" :key="metrica.nombre">
                  <q-card class="metric-card">
                    <q-card-section class="text-center">
                      <q-icon :name="metrica.icono" size="3rem" :color="metrica.color" />
                      <div class="metric-value">{{ metrica.valor }}</div>
                      <div class="metric-label">{{ metrica.nombre }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Estado del modal
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Estado reactivo
const activeTab = ref('busqueda')
const searchQuery = ref('')
const cargandoBusqueda = ref(false)

// Datos de búsqueda
const busquedaAvanzada = reactive({
  termino: '',
  tipo: null,
  prioridad: null,
  fechaInicio: '',
  fechaFin: '',
})

// Opciones para selects
const tiposEvento = ['Error', 'Advertencia', 'Información', 'Crítico']
const prioridades = ['Alta', 'Media', 'Baja']

// Datos de ejemplo
const totalErrores = ref(23)
const totalAdvertencias = ref(45)
const totalExitos = ref(1247)
const rendimientoSistema = ref(87)

// Timeline de eventos
const eventosTimeline = ref([
  {
    id: 1,
    titulo: 'Error de conexión',
    fecha: '2024-01-15 14:30',
    descripcion: 'Fallo en la conexión con el servidor principal',
    icono: 'error',
    color: 'negative',
  },
  {
    id: 2,
    titulo: 'Sistema reiniciado',
    fecha: '2024-01-15 14:25',
    descripcion: 'Reinicio automático del sistema',
    icono: 'refresh',
    color: 'info',
  },
  {
    id: 3,
    titulo: 'Backup completado',
    fecha: '2024-01-15 14:00',
    descripcion: 'Copia de seguridad realizada exitosamente',
    icono: 'backup',
    color: 'positive',
  },
])

// Métricas del sistema
const metricas = ref([
  {
    nombre: 'CPU',
    valor: '45%',
    icono: 'memory',
    color: 'primary',
  },
  {
    nombre: 'Red',
    valor: '12 MB/s',
    icono: 'network_check',
    color: 'positive',
  },
  {
    nombre: 'Procesos',
    valor: '234',
    icono: 'list',
    color: 'info',
  },
])

// Métodos
const closeModal = () => {
  isOpen.value = false
}

const realizarBusqueda = async () => {
  cargandoBusqueda.value = true
  try {
    // Simular búsqueda
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Búsqueda realizada:', busquedaAvanzada)
  } finally {
    cargandoBusqueda.value = false
  }
}

const limpiarBusqueda = () => {
  busquedaAvanzada.termino = ''
  busquedaAvanzada.tipo = null
  busquedaAvanzada.prioridad = null
  busquedaAvanzada.fechaInicio = ''
  busquedaAvanzada.fechaFin = ''
}

onMounted(() => {
  console.log('Diagnóstico limpio montado')
})
</script>

<style lang="scss" scoped>
/* === ESTILOS PROFESIONALES LIMPIOS === */

.diagnostic-modal {
  .q-dialog__inner {
    padding: 0;
  }
}

.diagnostic-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
}

.header-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.professional-title {
  color: #3b82f6;
  font-weight: 600;
  font-size: 1.8rem;
  margin: 0;
}

.professional-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  min-width: 300px;

  .q-field__control {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
}

.status-indicators {
  .stat-card {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.5);
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
}

.content-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabs-navigation {
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-content {
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
}

.panel-header {
  margin-bottom: 2rem;

  h3 {
    color: #3b82f6;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.search-form {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.search-actions {
  display: flex;
  gap: 1rem;
}

.analysis-card,
.metric-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.3);
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.usage-info {
  text-align: center;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.event-timeline {
  .q-timeline__content {
    color: white;
  }
}

.event-content {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0.5rem 0;
}

.metric-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// Responsive Design
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .status-indicators {
    .row {
      margin: 0;
    }
  }

  .professional-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1rem;
  }

  .search-form {
    padding: 1rem;
  }

  .stat-card {
    padding: 0.75rem;

    .stat-value {
      font-size: 1.1rem;
    }
  }
}
</style>
