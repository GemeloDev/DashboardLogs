<template>
  <q-card
    class="log-card fit cursor-pointer log-card-santoro"
    bordered
    flat
    @click="$emit('click', log)"
  >
    <!-- Header de la card mejorado -->
    <q-card-section class="log-card-header">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-chip
            :color="statusColor"
            text-color="white"
            size="md"
            :icon="statusIcon"
            class="text-weight-bold"
          >
            {{ log.status || 'INFO' }}
          </q-chip>
        </div>

        <div class="col-auto">
          <div class="timestamp-section">
            <q-icon name="schedule" color="grey-4" size="16px" class="q-mr-xs" />
            <span class="text-caption text-grey-4 text-weight-medium">
              {{ formatDate(log.eventTime) }}
            </span>
          </div>
        </div>
      </div>
      <div class="row items-center justify-between q-mt-sm">
        <!-- Tipo de evento -->
        <div class="text-subtitle2 text-white ellipsis">
          <q-icon name="settings_applications" color="primary" />
          {{ log.eventType }}
        </div>
        <div class="col-auto">
          <!-- Identificador del expediente -->
          <q-chip dense color="grey-7" text-color="white" size="sm" icon="tag" class="log-id-chip">
            {{ log.caseId }}
          </q-chip>
        </div>
      </div>
    </q-card-section>

    <!-- Contenido principal de la card -->
    <q-card-section class="log-card-content">
      <!-- Información del actor mejorada -->
      <div>
        <div v-if="log.actor" class="enhanced-section">
          <div class="section-header">
            <q-icon name="person" color="green-4" size="20px" class="q-mr-sm" />
            <div class="text-weight-bold text-green-4 section-title">
              Actor | Usuario del Sistema
            </div>
          </div>
          <div class="section-content">
            <div v-if="log.actor.fullName" class="detail-item">
              <span class="detail-label">Nombre:</span>
              <span class="detail-value">{{ log.actor.fullName }}</span>
            </div>
            <div v-if="log.actor.username" class="detail-item">
              <span class="detail-label">Username:</span>
              <span class="detail-value">{{ log.actor.username }}</span>
            </div>

            <!-- Información adicional del usuario si está disponible -->
            <div v-if="log.actor.type" class="detail-item justify-between">
              <span class="detail-label">Rol:</span>
              <q-chip outline dense color="green-6" text-color="white" size="sm">
                {{ log.actor.type }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Información de la oficina mejorada -->
        <div v-if="log.location?.id" class="enhanced-section">
          <div class="section-header">
            <q-icon name="business" color="orange-4" size="20px" class="q-mr-sm" />
            <div class="text-weight-bold text-orange-4 section-title">Ubicación | Locación</div>
          </div>
          <div class="section-content">
            <div v-if="log.location.name" class="detail-item">
              <span class="detail-label">Oficina:</span>
              <span class="detail-value">
                {{ log.location.name }}
              </span>
            </div>
            <div v-if="log.location.city" class="detail-item">
              <span class="detail-label">Dirección:</span>
              <span class="detail-value">{{ log.location.city }}</span>
            </div>

            <!-- Información adicional de ubicación -->
            <div v-if="log.location.country" class="detail-item justify-between">
              <span class="detail-label">Código:</span>
              <q-chip dense color="orange-6" text-color="white" size="sm">
                {{ log.location.country }}
              </q-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del dispositivo -->
      <div v-if="log.meta" class="log-device-section enhanced-section q-mt-sm">
        <div class="section-header">
          <q-icon name="devices" color="purple-4" size="20px" class="q-mr-sm" />
          <div class="text-weight-bold text-purple-4 section-title">Sistema & Dispositivos</div>
        </div>
        <div class="section-content">
          <div v-if="deviceLabel" class="detail-item">
            <span class="detail-label">Dispositivo:</span>
            <span class="detail-value">{{ deviceLabel }}</span>
          </div>
          <div v-if="log.meta.sourceApp" class="detail-item">
            <span class="detail-label">Sistema:</span>
            <span class="detail-value">{{ log.meta?.sourceApp || 'N/A' }}</span>
          </div>
          <div v-if="log.meta?.ip" class="detail-item">
            <span class="detail-label">IP:</span>
            <span class="detail-value">{{ log.meta?.ip || 'N/A' }}</span>
          </div>
          <div v-if="log.meta?.requestId" class="detail-item">
            <span class="detail-label">:</span>
            <q-chip dense color="purple" text-color="white" size="sm" class="log-id-chip">
              {{ log.correlation?.requestId || 'N/A' }}
            </q-chip>
          </div>
        </div>
      </div>

      <!-- Información acerca del campo "http" -->
      <div v-if="log.http" class="http-mini-card q-pa-sm q-my-sm rounded-borders">
        <div class="row items-center q-mb-xs">
          <q-icon name="dns" size="xs" class="q-mr-xs text-blue-3" />
          <div class="text-caption text-blue-3 text-weight-bold text-uppercase">
            {{ log.http.method }}
          </div>
        </div>

        <div class="text-body2 text-white text-weight-bold ellipsis" :title="log.http.path">
          {{ log.http.path }}
        </div>

        <div class="row items-center q-mt-xs">
          <div class="text-caption text-grey-5 q-mr-sm">
            Status:
            <span :class="getHttpColorClass(log.http.statusCode)">
              {{ log.http.statusCode }}
            </span>
          </div>
          <div class="text-caption text-grey-6">⏱ {{ log.http.latencyMs }}ms</div>
        </div>
      </div>
      <!-- Información del mensaje obligatorio -->
      <div class="q-mt-sm">
        <div class="row items-center q-mb-xs q-ml-sm">
          <q-icon name="message" color="amber-4" size="18px" class="q-mr-sm" />
          <div class="text-weight-medium text-amber-4">Mensaje</div>
        </div>
        <div class="error-content q-ml-md text-caption ellipsis-2-lines">
          {{ log.message }}
        </div>
      </div>
      <!-- Etiquetas | Tags -->
      <div v-if="log.tags" class="q-mt-sm">
        <div class="row items-center q-mb-xs q-ml-sm">
          <q-icon name="cloud" color="pink" size="18px" class="q-mr-sm" />
          <div class="text-weight-medium text-pink-4">Etiquetas | Tags</div>
        </div>
        <q-chip
          v-for="(tag, index) in log.tags"
          :key="index"
          dense
          color="pink-8"
          text-color="white"
          size="sm"
          class="log-id-chip"
        >
          {{ tag }}
        </q-chip>
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  log: { type: Object, required: true },
})

defineEmits(['click'])

// UTILIDAD PARA EXTRAER DATOS ANIDADOS
const getValue = (path) => {
  if (!path) return null
  return path
    .split('.')
    .reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), props.log)
}

// --- COMPUTEOS DE ESTILOS Y LÓGICA ---
const statusColor = computed(() => {
  const status = (getValue('status') || '').toUpperCase()
  const map = {
    // Éxito / Correcto (Green / Positive)
    ALLOWED: 'green',
    APPROVED: 'green',
    COMPLETED: 'green-7',
    CONFIRMED: 'teal',
    VALIDATED: 'green',
    SUCCESS: 'green',

    // Error / Bloqueo (Red / Negative)
    ERROR: 'red',
    BLOCKED: 'red',
    FAILED: 'red',
    REJECTED: 'red-10',

    // Advertencia / Revisión (Amber / Warning)
    WARNING: 'amber',
    WARN: 'amber',
    FLAGGED: 'amber',

    // Proceso / Informativo (Blue / Info / Primary)
    INFO: 'blue',
    IN_PROGRESS: 'blue',
  }
  return map[status] || 'grey'
})

const statusIcon = computed(() => {
  const status = (getValue('status') || '').toUpperCase()
  const map = {
    // Éxito / Aprobación
    ALLOWED: 'check_circle', // Círculo con check (Permiso concedido)
    APPROVED: 'thumb_up', // Pulgar arriba o 'done'
    COMPLETED: 'task_alt', // Check de tarea completada
    CONFIRMED: 'verified', // Escudo o sello de verificado
    VALIDATED: 'fact_check', // Lista con check (Validación de datos)

    // Errores / Bloqueos
    BLOCKED: 'block', // Signo de prohibido
    FAILED: 'error', // Signo de exclamación circular
    REJECTED: 'cancel', // X en círculo (Rechazo explícito)

    // Alertas
    FLAGGED: 'warning', // Triángulo de alerta (Algo requiere atención)

    // En Proceso
    IN_PROGRESS: 'hourglass_empty', // Reloj de arena (o 'sync' para rotación)
  }
  return map[status] || 'info'
})

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  return date.formatDate(isoDate, 'DD/MM/YYYY HH:mm')
}

const getHttpColorClass = (code) => {
  if (code >= 200 && code < 300) return 'text-green-4'
  if (code >= 300 && code < 400) return 'text-cyan-4'
  if (code >= 400) return 'text-red-4'
  return 'text-grey-4'
}

const deviceLabel = computed(() => {
  const m = props.log.meta || {}
  return m.deviceId || m.deviceName || (m.platform && m.osVersion ? `${m.platform} ${m.osVersion}` : null) || ''
})
</script>

<style lang="scss" scoped>
.log-card {
  background: rgba(255, 255, 255, 0.070);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
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

  // Restricciones de ancho
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  word-break: break-word;
  overflow: hidden;

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

  // Secciones enhanced
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
          font-size: 0.8rem;
        }

        .q-icon {
          margin-right: 4px;
        }
      }
    }
  }

  // Colores específicos por tipo
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
  &.log-card-santoro {
    border-left: 4px solid var(--santoro);
  }
}

.http-mini-card {
  background-color: rgba(65, 65, 77, 0.6);
  border-radius: 8px;
  transition: background-color 0.2 ease;

  &:hover {
    background-color: rgb(46, 46, 62, 0.9);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.log-card-content {
  padding: 0px 0;
  line-height: 1.3;
  // flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .log-device-section {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
