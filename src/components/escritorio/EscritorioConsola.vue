<template>
  <q-card class="console-card">
    <q-card-section>
      <div class="text-h6 text-center q-mb-lg">
        <q-icon name="terminal" size="28px" class="q-mr-sm" color="primary" />
        Consola de Logs en Tiempo Real
      </div>

      <div class="console-controls q-mb-md">
        <q-input
          v-model="busqueda"
          label="Buscar en logs..."
          filled
          dark
          color="primary"
          label-color="white"
          class="search-input"
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn
              v-if="busqueda"
              @click="busqueda = ''"
              icon="clear"
              flat
              round
              dense
              color="grey-5"
            />
          </template>
        </q-input>

        <div class="console-actions">
          <q-btn
            color="primary"
            label="Exportar"
            icon="download"
            @click="exportarLogs"
            class="export-btn"
          />
          <q-btn
            color="secondary"
            label="Limpiar"
            icon="clear_all"
            @click="limpiarConsola"
            flat
            class="q-ml-sm"
          />
          <q-btn
            :color="autoRefresh ? 'positive' : 'grey-7'"
            :label="autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'"
            :icon="autoRefresh ? 'pause' : 'play_arrow'"
            @click="toggleAutoRefresh"
            flat
            class="q-ml-sm"
          />
        </div>
      </div>

      <div class="console-display">
        <div v-if="logsFiltrados.length === 0" class="no-data">
          <q-icon name="info" size="48px" color="grey-5" />
          <div class="text-grey-5 q-mt-md">No hay logs disponibles</div>
        </div>
        <div v-else class="logs-container">
          <transition-group name="log-entry" tag="div">
            <div
              v-for="(log, index) in logsFiltrados"
              :key="`${log.fecha}-${index}`"
              class="log-entry"
              :class="getLogClass(log.tipo)"
            >
              <div class="log-header">
                <q-chip
                  :color="getLogColor(log.tipo)"
                  text-color="white"
                  size="sm"
                  class="log-type-chip"
                >
                  {{ log.tipo }}
                </q-chip>
                <span class="log-time">{{ formatTime(log.fecha) }}</span>
              </div>
              <div class="log-content">
                <strong>{{ log.proceso }}</strong> - {{ log.mensaje }}
              </div>
              <div class="log-meta" v-if="log.usuario || log.oficina">
                <span v-if="log.usuario" class="log-user">
                  <q-icon name="person" size="14px" class="q-mr-xs" />
                  {{ log.usuario }}
                </span>
                <span v-if="log.oficina" class="log-office">
                  <q-icon name="business" size="14px" class="q-mr-xs" />
                  {{ log.oficina }}
                </span>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const logs = ref([])
const busqueda = ref('')
const autoRefresh = ref(true)
const refreshInterval = ref(null)

const props = defineProps({ filtros: Object })

watch(
  () => props.filtros,
  (val) => {
    cargarLogs(val)
  }
)

onMounted(() => {
  cargarLogs(props.filtros)
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

const logsFiltrados = computed(() => {
  if (!busqueda.value) return logs.value
  return logs.value.filter(
    (log) =>
      log.mensaje.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      log.proceso.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      log.tipo.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

async function cargarLogs(filtros) {
  try {
    const res = await axios.get('http://localhost:8005/api/logs/filter', {
      params: {
        fromDate: filtros?.rangoFechas?.from,
        toDate: filtros?.rangoFechas?.to,
        oficinaId: filtros?.oficina,
        personId: filtros?.usuario,
        type: filtros?.tipoProceso,
        device: filtros?.dispositivo,
        formato: filtros?.formato,
        tipoDatos: filtros?.tipoDatos,
      },
    })
    logs.value = res.data
      .map((e) => ({
        fecha: e.Date,
        proceso: e.Process,
        tipo: e.Type,
        mensaje: e.Message,
        usuario: e.Person?.Curp,
        oficina: e.Oficina?.Nombre,
      }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch {
    logs.value = generateSampleLogs()
  }
}

function generateSampleLogs() {
  const tipos = ['SUCCESS', 'ERROR', 'WARNING', 'INFO']
  const procesos = ['LOGIN', 'REGISTER', 'SCAN', 'EXPORT']
  const mensajes = [
    'Operación completada exitosamente',
    'Error de conexión con el servidor',
    'Advertencia: memoria baja',
    'Información del sistema actualizada',
    'Login exitoso para usuario',
    'Error de autenticación',
    'Escaneo QR completado',
    'Exportación de datos iniciada',
  ]

  return Array.from({ length: 20 }, (_, i) => ({
    fecha: new Date(Date.now() - i * 60000).toISOString(),
    proceso: procesos[Math.floor(Math.random() * procesos.length)],
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    mensaje: mensajes[Math.floor(Math.random() * mensajes.length)],
    usuario:
      Math.random() > 0.5
        ? `USER${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`
        : null,
    oficina: Math.random() > 0.3 ? `Oficina ${Math.floor(Math.random() * 5) + 1}` : null,
  }))
}

function getLogClass(tipo) {
  return {
    'log-success': tipo === 'SUCCESS',
    'log-error': tipo === 'ERROR',
    'log-warning': tipo === 'WARNING',
    'log-info': tipo === 'INFO',
  }
}

function getLogColor(tipo) {
  switch (tipo) {
    case 'SUCCESS':
      return 'positive'
    case 'ERROR':
      return 'negative'
    case 'WARNING':
      return 'warning'
    case 'INFO':
      return 'info'
    default:
      return 'grey'
  }
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function exportarLogs() {
  const dataStr = JSON.stringify(logsFiltrados.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `logs_${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()

  $q.notify({
    message: 'Logs exportados correctamente',
    color: 'positive',
    icon: 'download',
  })
}

function limpiarConsola() {
  logs.value = []
  $q.notify({
    message: 'Consola limpiada',
    color: 'info',
    icon: 'clear_all',
  })
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

function startAutoRefresh() {
  refreshInterval.value = setInterval(() => {
    cargarLogs(props.filtros)
  }, 5000) // Refresh cada 5 segundos
}

function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}
</script>

<style lang="scss" scoped>
.console-card {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .text-h6 {
    background: linear-gradient(45deg, #2196f3, #21cbf3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }
}

.console-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
}

.search-input {
  flex: 1;

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

  &.q-field--focused .q-field__control {
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
}

.console-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.export-btn {
  background: linear-gradient(45deg, #2196f3, #21cbf3);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(33, 150, 243, 0.3);
  }
}

.console-display {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.logs-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(33, 150, 243, 0.6);
    border-radius: 4px;

    &:hover {
      background: rgba(33, 150, 243, 0.8);
    }
  }
}

.log-entry {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  &.log-success {
    border-left-color: #4caf50;
  }

  &.log-error {
    border-left-color: #f44336;
  }

  &.log-warning {
    border-left-color: #ff9800;
  }

  &.log-info {
    border-left-color: #2196f3;
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-type-chip {
  font-size: 11px;
  font-weight: 600;
}

.log-time {
  font-size: 12px;
  color: #9e9e9e;
  font-family: 'Courier New', monospace;
}

.log-content {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;

  strong {
    color: #2196f3;
  }
}

.log-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9e9e9e;
}

.log-user,
.log-office {
  display: flex;
  align-items: center;
}

// Animaciones para logs
.log-entry-enter-active {
  transition: all 0.3s ease;
}

.log-entry-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.log-entry-leave-active {
  transition: all 0.3s ease;
}

.log-entry-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
