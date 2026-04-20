<template>
  <q-card class="modern-card text-white session-card q-mt-lg">
    <q-card-section class="row card-body q-pb-none">
      <div class="col-12 q-pt-md q-pl-md">
        <div class="row items-center q-mb-md">
          <q-icon name="history_edu" size="md" class="q-mr-sm text-blue-4" />
          <p class="text-h5 text-bold text-white no-margin">{{ resultados.header.system + ' | #' + resultados.header.caseId }}</p>
        </div>
      </div>
    </q-card-section>
    <q-separator dark spaced class="q-mx-lg" />
    <q-card-section class="col card-body q-pt-none">
      <div class="q-px-md">
        <q-timeline color="secondary" class="session-timeline">
          <q-timeline-entry heading>
            <strong class="text-h6 text-bold text-grey-4">{{ t('diagnostic.eventTitle') }}</strong>
          </q-timeline-entry>
          <div style="
            max-height: 350px;
            overflow-x: auto;
            margin: 0;
            padding: 16px;
            "
          >
            <q-timeline-entry
              v-for="(log, index) in resultados.items"
              :key="log.id || index"
              :title="log.operationType"
              :subtitle="formatearFecha(log.eventTime)"
              :color="getStatusColor(log.status)"
              :icon="getStatusIcon(log.status)"
            >
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-card class="kpi-card" :class="getGradientClass(log.status)">
                    <q-card-section class="q-pa-md">
                      <div class="kpi-content">
                        <div class="kpi-icon-container">
                          <q-icon name="info" size="sm" class="kpi-icon" />
                        </div>
                        <div class="kpi-data">
                          <div class="kpi-title text-white">{{ t('diagnostic.systemMessage') }}</div>
                          <div class="kpi-value text-body1">{{ log.message }}</div>
                          <div
                            v-if="log.reasonDescription"
                            class="kpi-subtitle text-italic q-mt-xs"
                          >
                            "{{ log.reasonDescription }}"
                          </div>
                        </div>
                        <q-chip
                          dense
                          :color="getSeverityColor(log.severity)"
                          text-color="white"
                          class="text-bold shadow-2"
                        >
                          {{ log.severity }}
                        </q-chip>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-sm-6">
                      <div v-if="existUbication(log)" class="detail-box">
                        <div class="text-caption text-grey-5 q-mb-xs">📍 {{ t('common.ubication') }}</div>
                        <div class="text-body2 text-bold" v-if="log.locationName">{{ log.locationName || t('diagnostic.noUbication') }}</div>
                        <div class="text-caption text-grey-4" v-if="log.locationId">ID: {{ log.locationId }}</div>
                        <div class="text-caption text-blue-3 q-mt-xs">
                          <q-icon name="devices" v-if="log.outcome" />{{ t('common.output') }}: {{ log.outcome }}
                        </div>
                      </div>
                      <div v-else class="detail-box">
                        <div class="text-caption text-grey-5 q-mb-xs">📍 {{ t('common.ubication') }}</div>
                        <div class="text-body2 text-bold">{{ t('diagnostic.noUbication') }}</div>
                      </div>
                    </div>

                    <div class="col-12 col-sm-6">
                      <div v-if="log.actorId" class="detail-box">
                        <div class="text-caption text-grey-5 q-mb-xs">👤 {{ t('common.operator') }}</div>
                        <div class="text-caption text-orange-3 q-mt-xs">#ID: {{ log.actorId }}</div>
                        <div class="text-body2 text-bold">{{ log.actorFullName }}</div>
                        <div class="text-caption text-cyan-4">
                          {{ t('common.username') }}: {{ log.actorUsername }}
                        </div>
                      </div>
                      <div v-else class="detail-box">
                        <div class="text-caption text-grey-5 q-mb-xs">👤 {{ t('common.operator') }}</div>
                        <div class="text-body2 text-bold">{{ t('diagnostic.noOperator') }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="technical-footer row q-gutter-x-md q-gutter-y-sm">
                    <div class="tech-item">
                      <q-icon name="fingerprint" color="blue-4" />
                      <span class="q-ml-xs text-caption">ID: {{ log.id.substring(0, 8) }}...</span>
                      <q-tooltip>{{ log.id }}</q-tooltip>
                    </div>

                    <div v-if="log.reasonCode" class="tech-item text-red-3">
                      <q-icon name="bug_report" />
                      <span class="q-ml-xs text-caption text-bold">{{ t('common.reasonCode') }}: {{ log.reasonCode }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </q-timeline-entry>
          </div>
        </q-timeline>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const { resultados } = defineProps({
  resultados: {
    type: Object,
    required: true,
    default: () => ({ items: [] }),
  },
})

// --- Helpers de Formato ---

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return ''
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fechaISO))
}

// --- Helpers de UI basados en Estatus ---
const getGradientClass = (status) => {
  const map = {
    // Éxito / Correcto (Green / Positive)
    ALLOWED: 'gradient-green',
    APPROVED: 'gradient-green',
    COMPLETED: 'green-7',
    CONFIRMED: 'teal',
    VALIDATED: 'gradient-green',
    SUCCESS: 'gradient-green',

    // Error / Bloqueo (Red / Negative)
    ERROR: 'gradient-red',
    BLOCKED: 'gradient-red',
    FAILED: 'gradient-red',
    REJECTED: 'gradient-red',

    // Advertencia / Revisión (Amber / Warning)
    WARNING: 'gradient-orange',
    WARN: 'gradient-orange',
    FLAGGED: 'gradient-orange',

    // Proceso / Informativo (Blue / Info / Primary)
    INFO: 'gradient-blue',
    IN_PROGRESS: 'gradient-blue',
  }
  return map[status] || 'gradient-blue'
}

const getSeverityColor = (severity) => {
  severity.toUpperCase()
  const map = {
    CRITICAL: 'red',
    HIGH: 'red',
    LOW: 'orange',
    MEDIUM: 'green',
  }

  return map[severity] || 'blue'
}

const getStatusColor = (status) => {
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
}

const getStatusIcon = (status) => {
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
    WARN: 'warning', // Triángulo de alerta (Algo requiere atención)

    // En Proceso
    IN_PROGRESS: 'hourglass_empty', // Reloj de arena (o 'sync' para rotación)
  }
  return map[status] || 'info'
}

const existUbication = (log) => {
  return log.locationName || log.locationId
}
</script>

<style lang="scss" scoped>
// Variables para el glassmorphism
:root {
  --gradient-card: linear-gradient(135deg, rgba(30, 30, 47, 0.95) 0%, rgba(45, 45, 60, 0.98) 100%);
  --border-glass: 1px solid rgba(255, 255, 255, 0.08);
}

.modern-card {
  background: #1e1e2f; // Fallback
  background: var(--gradient-card);
  border: var(--border-glass);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

// Estilos de Pastillas de información (Header)
.info-pill {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Timeline adjustments
.session-timeline {
  width: 100%;
}

// KPI / Message Card Gradients
.kpi-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gradient-blue {
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.15) 0%, rgba(21, 101, 192, 0.05) 100%);
  border-left: 4px solid #2196f3;
}
.gradient-green {
  background: linear-gradient(90deg, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.05) 100%);
  border-left: 4px solid #4caf50;
}
.gradient-red {
  background: linear-gradient(90deg, rgba(244, 67, 54, 0.15) 0%, rgba(198, 40, 40, 0.05) 100%);
  border-left: 4px solid #f44336;
}
.gradient-orange {
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.15) 0%, rgba(230, 81, 0, 0.05) 100%);
  border-left: 4px solid #ff9800;
}
.gradient-cyan {
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 96, 100, 0.05) 100%);
  border-left: 4px solid #00bcd4;
}

.kpi-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.kpi-icon-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-data {
  flex: 1;
}

// Cajas de detalle (Ubicación / Operador)
.detail-box {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

// Footer técnico
.technical-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  margin-top: 4px;
}

.tech-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 8px;
  border-radius: 4px;
}

// Scrollbars
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
