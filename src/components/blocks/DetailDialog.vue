<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale">
    <q-card class="log-detail-modal no-scroll-visual">

      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="dialog-icon">
            <q-icon name="manage_search" size="24px" color="white" />
          </div>
          <div>
            <h2>Ficha técnica de log</h2>
            <p>Detalle completo del evento de acceso</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense class="dialog-close-btn" v-close-popup />
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Body -->
      <q-card-section class="modal-body scroll">
        <div v-if="log" class="row q-col-gutter-md">

          <!-- Columna izquierda: Usuario & Estados -->
          <div class="col-xs-12 col-md-6 q-gutter-y-md">

            <!-- Actor -->
            <div class="form-field">
              <label class="field-label">
                <q-icon name="account_circle" size="18px" class="field-icon--blue" />
                Usuario | Actor
              </label>
              <div v-if="log.actor" class="info-card">
                <div class="info-row">
                  <q-icon name="badge" size="15px" class="tint--blue" />
                  <span class="info-primary">{{ log?.actor?.id ?? 'Sin dato' }}</span>
                </div>
                <div class="info-secondary">{{ log?.actor?.fullName ?? 'Sin dato' }}</div>
                <div class="info-caption">👤 {{ log?.actor?.username || 'Sin dato' }}</div>
                <div class="info-row q-mt-xs">
                  <span class="info-caption">Tipo:</span>
                  <span class="status-chip status-chip--cyan">{{ log?.actor?.type }}</span>
                </div>
              </div>
              <div v-else class="info-card info-card--empty">
                SIN DATOS DEL ACTOR
              </div>
            </div>

            <!-- Estados -->
            <div class="form-field">
              <label class="field-label">
                <q-icon name="rule" size="18px" class="field-icon--red" />
                Estados
              </label>
              <div class="info-card">
                <div class="chips-row">
                  <q-chip
                    v-if="log.status"
                    :color="getColor(log.status)"
                    text-color="white"
                    icon="flag"
                    class="text-weight-bold"
                  >
                    {{ log.status }}
                  </q-chip>
                  <q-chip
                    v-if="log.outcome"
                    :color="getOutcomeColor(log.outcome)"
                    text-color="white"
                    size="sm"
                  >
                    {{ log?.outcome || 'Sin dato' }}
                  </q-chip>
                  <q-chip
                    v-if="log.severity && log.severity !== 'INFO'"
                    :icon="getSeverityIcon(log.severity)"
                    class="bg-grey-9 text-white"
                    size="sm"
                  >
                    {{ log?.severity || 'Sin dato' }}
                  </q-chip>
                  <span v-if="log.environment" class="status-chip status-chip--outline">
                    ENV: {{ log?.environment || 'Sin dato' }}
                  </span>
                  <q-chip
                    v-if="log.http?.statusCode"
                    :color="getHttpColor(log.http?.statusCode || '000')"
                    text-color="white"
                    size="sm"
                    icon="http"
                  >
                    {{ log.http?.statusCode || 'Sin dato' }}
                  </q-chip>
                  <q-chip
                    v-if="log.reason?.code"
                    color="deep-orange"
                    text-color="white"
                    size="sm"
                    icon="warning"
                  >
                    {{ log.reason?.code || 'Sin dato' }}
                  </q-chip>
                  <template v-if="log.tags && log.tags.length">
                    <span
                      v-for="tag in log.tags"
                      :key="tag"
                      class="status-chip status-chip--purple"
                    >
                      #{{ tag }}
                    </span>
                  </template>
                </div>
              </div>
            </div>

          </div>

          <!-- Columna derecha: Sistema -->
          <div class="col-xs-12 col-md-6">
            <div class="form-field">
              <label class="field-label">
                <q-icon name="computer" size="18px" class="field-icon--orange" />
                Sistema
              </label>
              <div class="info-card">

                <div class="info-row info-row--between">
                  <span class="status-chip status-chip--green text-weight-bold">
                    {{ log.system || 'SYSTEM' }}
                  </span>
                  <span class="info-caption">{{ log?.environment ?? 'Sin dato' }}</span>
                </div>

                <div class="section-divider">Software</div>
                <div class="info-row info-row--wrap">
                  <div class="kv-pair">
                    <span class="kv-key">App</span>
                    <span class="status-chip status-chip--cyan">{{ log?.meta?.sourceApp || 'Sin dato' }}</span>
                  </div>
                  <div class="kv-pair">
                    <span class="kv-key">Versión</span>
                    <span class="status-chip status-chip--cyan">{{ log.meta?.build || 'Sin dato' }}</span>
                  </div>
                  <div class="kv-pair">
                    <span class="kv-key">Schema</span>
                    <span class="status-chip status-chip--cyan">v{{ log?.schemaVersion || 'Sin dato' }}</span>
                  </div>
                </div>

                <div class="section-divider">Hardware & Red</div>
                <div class="info-row info-row--wrap">
                  <div class="device-chip">
                    <span class="device-chip__key">Dispositivo</span>
                    <span class="device-chip__val">{{ log.meta?.deviceId || 'Sin dispositivo' }}</span>
                  </div>
                  <div class="device-chip">
                    <span class="device-chip__key">IP</span>
                    <span class="device-chip__val device-chip__val--muted">{{ log.meta?.ip || 'Sin IP registrada' }}</span>
                  </div>
                </div>

                <template v-if="log.http">
                  <div class="section-divider">Salud | API</div>
                  <div class="http-card">
                    <div class="http-card__method">
                      <q-icon name="dns" size="14px" class="tint--blue" />
                      <span class="http-card__verb">{{ log.http?.method || 'Sin método' }}</span>
                    </div>
                    <div class="http-card__path" :title="log.http?.path || 'Sin url'">
                      {{ log.http?.path || 'Endpoint no localizado' }}
                    </div>
                    <div class="http-card__meta">
                      <span class="info-caption">
                        Status:
                        <span :class="getHttpColorClass(log.http?.statusCode || '000')">
                          {{ log.http?.statusCode || '###' }}
                        </span>
                      </span>
                      <span class="info-caption">⏱ {{ log.http?.latencyMs || '0' }}ms</span>
                    </div>
                  </div>
                </template>

              </div>
            </div>
          </div>
        </div>

        <!-- Bloques JSON -->
        <div v-if="log" class="row q-col-gutter-md q-mt-xs">

          <!-- Payload -->
          <div v-if="log.payload" class="col-12 col-md-6 flex column">
            <div class="json-section col flex column">
              <div class="json-section__header">
                <q-icon name="notes" size="15px" class="tint--blue" />
                <span class="json-label json-label--blue">PAYLOAD</span>
              </div>
              <div class="json-wrapper col flex column">
                <q-btn
                  icon="content_copy"
                  flat round dense size="sm"
                  class="copy-btn"
                  @click="copiarPayload(log.payload)"
                >
                  <q-tooltip class="glass-tooltip">Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content fit scroll">{{ JSON.stringify(log.payload, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Meta + Correlación -->
          <div class="col-12 col-md-6 q-gutter-y-md">
            <div v-if="log.meta" class="json-section">
              <div class="json-section__header">
                <q-icon name="notes" size="15px" class="tint--green" />
                <span class="json-label json-label--green">META</span>
              </div>
              <div class="json-wrapper">
                <q-btn
                  v-if="log.meta"
                  icon="content_copy"
                  flat round dense size="sm"
                  class="copy-btn"
                  @click="copiarPayload(log.meta)"
                >
                  <q-tooltip class="glass-tooltip">Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content">{{ JSON.stringify(log.meta, null, 2) }}</pre>
              </div>
            </div>

            <div v-if="log.correlation" class="json-section">
              <div class="json-section__header">
                <q-icon name="notes" size="15px" class="tint--pink" />
                <span class="json-label json-label--pink">CORRELACIÓN</span>
              </div>
              <div class="json-wrapper">
                <q-btn
                  v-if="log.correlation"
                  icon="content_copy"
                  flat round dense size="sm"
                  class="copy-btn"
                  @click="copiarPayload(log.correlation)"
                >
                  <q-tooltip class="glass-tooltip">Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content">{{ JSON.stringify(log.correlation, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Objeto completo -->
          <div class="col-12">
            <div class="json-section">
              <div class="json-section__header">
                <q-icon name="data_object" size="15px" style="color: rgba(255,255,255,0.58)" />
                <span class="json-label json-label--white">Objeto Completo</span>
              </div>
              <div class="json-wrapper">
                <q-btn
                  v-if="log"
                  icon="content_copy"
                  flat round dense size="sm"
                  class="copy-btn"
                  @click="copiarPayload(log)"
                >
                  <q-tooltip class="glass-tooltip">Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content" style="max-height: 300px">{{ JSON.stringify(log, null, 2) }}</pre>
              </div>
            </div>
          </div>

        </div>

        <div v-else class="empty-state">No hay datos seleccionados</div>
      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  log: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const copiarPayload = async (datos) => {
  if (!datos) return
  try {
    const texto = JSON.stringify(datos, null, 2)
    await navigator.clipboard.writeText(texto)
    $q.notify({
      type: 'positive',
      message: 'JSON copiado al portapapeles',
      position: 'top',
      timeout: 2000,
    })
  } catch (err) {
    console.error('Error al copiar: ', err)
    $q.notify({
      type: 'negative',
      message: 'Error al copiar el JSON',
      position: 'top',
    })
  }
}

const getHttpColorClass = (code) => {
  if (code >= 200 && code < 300) return 'http-ok'
  if (code >= 300 && code < 400) return 'http-redirect'
  if (code >= 400) return 'http-error'
  return 'http-unknown'
}

const getColor = (val) => {
  const v = (val || '').toUpperCase()
  if (['APPROVED', 'SUCCESS', 'COMPLETED', 'VALIDATED'].includes(v)) return 'positive'
  if (['REJECTED', 'FAILURE', 'FAILED', 'BLOCKED', 'ERROR'].includes(v)) return 'negative'
  if (['IN_PROGRESS', 'PENDING'].includes(v)) return 'primary'
  if (['WARNING', 'WARN'].includes(v)) return 'warning'
  return 'grey-7'
}

const getOutcomeColor = (val) => {
  return val === 'SUCCESS' ? 'green-5' : val === 'FAILURE' ? 'red-5' : 'grey'
}

const getHttpColor = (code) => {
  if (code >= 200 && code < 300) return 'green'
  if (code >= 400 && code < 500) return 'orange'
  if (code >= 500) return 'red'
  return 'grey'
}

const getSeverityIcon = (val) => {
  const v = (val || '').toUpperCase()
  if (v === 'CRITICAL' || v === 'FATAL') return 'gpp_bad'
  if (v === 'ERROR') return 'error'
  if (v === 'WARN') return 'warning_amber'
  return 'info'
}
</script>

<style lang="scss" scoped>
/* ─── MODAL SHELL ─── */
.log-detail-modal {
  width: 100%;
  max-width: 800px;
  min-width: min(600px, 95vw);
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.96), rgba(18, 25, 42, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);

  @media (max-width: 768px) {
    min-width: 94vw;
    max-width: 94vw;
  }
}

/* ─── HEADER ─── */
.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;

  h2 {
    margin: 0 0 4px 0;
    font-size: 1.55rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.5;
  }
}

.dialog-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 14px 30px rgba(124, 58, 237, 0.2);
  flex-shrink: 0;
}

.dialog-close-btn {
  color: rgba(255, 255, 255, 0.72);
}

.modal-separator {
  background: rgba(255, 255, 255, 0.08);
}

/* ─── BODY ─── */
.modal-body {
  padding: 24px;
  max-height: 72vh;
  overflow-y: auto;
}

/* ─── FIELD LABELS ─── */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
}

.field-icon--blue  { color: #7dd3fc; }
.field-icon--red   { color: #fca5a5; }
.field-icon--orange { color: #ffb088; }

/* tint helpers for icons inside cards */
.tint--blue  { color: #7dd3fc; }
.tint--green { color: #86efac; }
.tint--pink  { color: #f9a8d4; }

/* ─── INFO CARDS (like preview-card) ─── */
.info-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px;

  &--empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 56px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.3);
  }
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;

  &--between { justify-content: space-between; }
  &--wrap    { flex-wrap: wrap; }
}

.info-primary {
  font-weight: 700;
  font-size: 0.92rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-secondary {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.52);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-caption {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.42);
}

/* ─── SECTION DIVIDERS (inside cards) ─── */
.section-divider {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.38);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 14px 0 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ─── STATUS CHIPS (rgba pill pattern) ─── */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.6;

  &--cyan {
    background: rgba(34, 211, 238, 0.14);
    color: #a5f3fc;
    border: 1px solid rgba(34, 211, 238, 0.24);
  }

  &--purple {
    background: rgba(124, 58, 237, 0.16);
    color: #d8b4fe;
    border: 1px solid rgba(124, 58, 237, 0.26);
  }

  &--green {
    background: rgba(34, 197, 94, 0.16);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.26);
  }

  &--orange {
    background: rgba(233, 113, 50, 0.14);
    color: #ffb088;
    border: 1px solid rgba(233, 113, 50, 0.25);
  }

  &--outline {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.12);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

/* ─── KV PAIRS ─── */
.kv-pair {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.kv-key {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.42);
}

/* ─── DEVICE / IP CHIPS ─── */
.device-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 4px 12px;
  margin: 3px;
}

.device-chip__key {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.62);
}

.device-chip__val {
  font-size: 0.78rem;
  color: #ffb088;

  &--muted { color: rgba(255, 255, 255, 0.42); }
}

/* ─── HTTP MINI CARD ─── */
.http-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 14px;
}

.http-card__method {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.http-card__verb {
  font-size: 0.78rem;
  font-weight: 700;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.http-card__path {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.http-card__meta {
  display: flex;
  gap: 14px;
  align-items: center;
}

/* HTTP status color classes */
.http-ok       { color: #86efac; font-weight: 700; }
.http-redirect { color: #a5f3fc; font-weight: 700; }
.http-error    { color: #fca5a5; font-weight: 700; }
.http-unknown  { color: rgba(255,255,255,0.42); }

/* ─── JSON SECTIONS ─── */
.json-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.json-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.json-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;

  &--blue  { color: #7dd3fc; }
  &--green { color: #86efac; }
  &--pink  { color: #f9a8d4; }
  &--white { color: rgba(255, 255, 255, 0.62); }
}

.json-wrapper {
  position: relative;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;

  &:hover .copy-btn {
    opacity: 1;
  }
}

.json-content {
  margin: 0;
  padding: 16px;
  color: rgba(255, 255, 255, 0.78);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.82rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  z-index: 1;
  color: rgba(255, 255, 255, 0.42) !important;
  transition: opacity 0.2s ease, background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}

@media (hover: none) {
  .copy-btn { opacity: 1; }
}

/* ─── GLASS TOOLTIP ─── */
.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

/* ─── EMPTY STATE ─── */
.empty-state {
  text-align: center;
  padding: 32px 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.92rem;
}

/* ─── SCROLLBAR HIDDEN ─── */
.no-scroll-visual {
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
