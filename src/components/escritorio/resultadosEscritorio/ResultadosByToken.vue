<template>
  <q-card class="modern-card text-white session-card q-mt-lg">
    <q-card-section v-if="passportData" class="row card-body q-pb-none">
      <div class="col-12 q-pt-md q-pl-md">
        <div class="row items-center q-mb-md">
          <q-icon name="history_edu" size="md" class="q-mr-sm text-blue-4" />
          <p class="text-h5 text-bold text-white no-margin">Historial del Trámite</p>
        </div>
      </div>

      <div class="col-12 q-px-md">
        <div class="passport-info-container row q-col-gutter-sm">
          <div class="col-12 col-md-12">
             <p class="text-h6 text-white no-margin">
              📄 Pasaporte: <span class="text-blue-3">{{ passportData.passportNumber }}</span>
            </p>
          </div>

          <div class="col-6 col-sm-4">
            <div class="info-pill">
              <q-icon name="badge" size="xs" class="q-mr-xs text-grey-4" />
              <span>ID: {{ passportData.personId }}</span>
            </div>
          </div>
          <div class="col-6 col-sm-4">
            <div class="info-pill">
              <q-icon name="person" size="xs" class="q-mr-xs text-grey-4" />
              <span class="ellipsis">{{ passportData.fullName }}</span>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="info-pill">
              <q-icon name="flag" size="xs" class="q-mr-xs text-grey-4" />
              <span>{{ passportData.nationality }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator dark spaced class="q-mx-lg" />

    <q-card-section class="col card-body q-pt-none">
      <div class="q-px-md q-py-md">
        <q-timeline color="secondary" class="session-timeline">

          <q-timeline-entry heading>
            <strong class="text-h6 text-bold text-grey-4">Eventos Registrados</strong>
          </q-timeline-entry>

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
                        <div class="kpi-title text-white">Mensaje del Sistema</div>
                        <div class="kpi-value text-body1">{{ log.message }}</div>
                        <div v-if="log.reasonDescription" class="kpi-subtitle text-italic q-mt-xs">
                          "{{ log.reasonDescription }}"
                        </div>
                      </div>
                      <q-chip
                        dense
                        :color="getStatusColor(log.status)"
                        text-color="white"
                        class="text-bold shadow-2"
                      >
                        {{ log.status }}
                      </q-chip>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12">
                <div class="row q-col-gutter-sm">

                  <div class="col-12 col-sm-6">
                    <div class="detail-box">
                      <div class="text-caption text-grey-5 q-mb-xs">📍 Ubicación</div>
                      <div class="text-body2 text-bold">{{ log.officeName }}</div>
                      <div class="text-caption text-grey-4">ID: {{ log.officeId }}</div>
                      <div class="text-caption text-blue-3 q-mt-xs">
                        <q-icon name="devices" /> Canal: {{ log.channel }}
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-sm-6">
                    <div class="detail-box">
                      <div class="text-caption text-grey-5 q-mb-xs">👤 Operador</div>
                      <div class="text-body2 text-bold">{{ log.userFullName || 'Sistema' }}</div>
                      <div class="text-caption text-grey-4">{{ log.username }}</div>
                      <div class="text-caption text-orange-3 q-mt-xs" v-if="log.elapsedSeconds">
                        <q-icon name="timer" /> Duración: {{ log.elapsedSeconds }}s
                      </div>
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
                    <span class="q-ml-xs text-caption text-bold">Code: {{ log.reasonCode }}</span>
                  </div>

                </div>
              </div>

            </div>
          </q-timeline-entry>

        </q-timeline>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { date } from 'quasar' // Usamos utilidades de fecha de Quasar si están disponibles, sino usar JS nativo

// const props = defineProps({
//   passportData: {
//     type: Object,
//     required: true,
//     default: () => ({})
//   },
//   resultados: {
//     type: Object,
//     required: true,
//     default: () => ({ items: [] })
//   }
// })

// --- Helpers de Formato ---

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return ''
  // Formato: 18 Dic 2025, 18:20
  return date.formatDate(fechaISO, 'D MMM YYYY, HH:mm a')
}

// --- Helpers de UI basados en Estatus ---

const getStatusColor = (status) => {
  if (!status) return 'grey'
  const s = status.toUpperCase()
  if (s === 'EMITIDO' || s === 'EMITIDOS') return 'green'
  if (s === 'RECHAZADO' || s === 'RECHAZADOS') return 'red'
  if (s === 'ENTRAMITE' || s === 'EN TRAMITE') return 'cyan'
  if (s === 'CANCELADO' || s === 'CANCELADOS') return 'orange'
  return 'blue'
}

const getStatusIcon = (status) => {
  if (!status) return 'circle'
  const s = status.toUpperCase()
  if (s.includes('EMITIDO')) return 'check_circle'
  if (s.includes('RECHAZADO')) return 'cancel'
  if (s.includes('TRAMITE')) return 'pending_actions'
  if (s.includes('CANCELADO')) return 'block'
  return 'info'
}

const getGradientClass = (status) => {
  if (!status) return 'gradient-blue'
  const s = status.toUpperCase()
  if (s.includes('EMITIDO')) return 'gradient-green'
  if (s.includes('RECHAZADO')) return 'gradient-red'
  if (s.includes('TRAMITE')) return 'gradient-cyan'
  if (s.includes('CANCELADO')) return 'gradient-orange'
  return 'gradient-blue'
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

.gradient-blue { background: linear-gradient(90deg, rgba(33, 150, 243, 0.15) 0%, rgba(21, 101, 192, 0.05) 100%); border-left: 4px solid #2196F3; }
.gradient-green { background: linear-gradient(90deg, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.05) 100%); border-left: 4px solid #4CAF50; }
.gradient-red { background: linear-gradient(90deg, rgba(244, 67, 54, 0.15) 0%, rgba(198, 40, 40, 0.05) 100%); border-left: 4px solid #F44336; }
.gradient-orange { background: linear-gradient(90deg, rgba(255, 152, 0, 0.15) 0%, rgba(230, 81, 0, 0.05) 100%); border-left: 4px solid #FF9800; }
.gradient-cyan { background: linear-gradient(90deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 96, 100, 0.05) 100%); border-left: 4px solid #00BCD4; }

.kpi-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.kpi-icon-container {
  background: rgba(255,255,255,0.1);
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
  background: rgba(255,255,255,0.03);
  padding: 4px 8px;
  border-radius: 4px;
}

// Scrollbars
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
</style>
