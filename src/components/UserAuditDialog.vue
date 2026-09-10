<template>
  <q-dialog
    :model-value="modelValue"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card dark class="user-audit-card">
      <q-card-section class="user-audit-card__header row items-center no-wrap">
        <q-avatar size="58px" class="user-audit-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" />
          <span v-else>{{ initials }}</span>
        </q-avatar>

        <div class="col q-ml-md audit-user-copy">
          <div class="text-h5 text-weight-bold ellipsis">{{ displayName }}</div>
          <div class="text-caption text-grey-5 ellipsis">@{{ username }}</div>
        </div>

        <q-btn v-close-popup flat round dense icon="close" color="grey-5" aria-label="Cerrar" />
      </q-card-section>

      <q-separator dark />

      <q-card-section class="q-pa-lg">
        <q-badge
          rounded
          :color="auditData.isActiveToday ? 'positive' : 'negative'"
          class="audit-status-badge q-mb-lg"
        >
          <q-icon
            :name="auditData.isActiveToday ? 'bolt' : 'schedule'"
            size="16px"
            class="q-mr-xs"
          />
          {{
            auditData.isActiveToday
              ? `ACTIVIDAD HOY - ${auditData.totalEventsToday || 0} eventos`
              : 'SIN ACTIVIDAD HOY'
          }}
        </q-badge>

        <div class="audit-detail-list">
          <div class="audit-detail-row">
            <q-icon name="history" color="cyan-4" size="22px" />
            <div>
              <div class="audit-detail-label">Último Registro</div>
              <div class="audit-detail-value">{{ lastConnectionLabel }}</div>
            </div>
          </div>

          <div class="audit-detail-row">
            <q-icon name="devices" color="deep-purple-3" size="22px" />
            <div>
              <div class="audit-detail-label">Dispositivo &amp; IP</div>
              <div class="audit-detail-value">
                {{ auditData.lastDevice || 'Dispositivo desconocido' }} · IP:
                {{ auditData.lastIp || 'No disponible' }}
              </div>
            </div>
          </div>

          <div class="audit-detail-row">
            <q-icon name="event_note" color="orange-4" size="22px" />
            <div>
              <div class="audit-detail-label">Último Evento</div>
              <div class="audit-detail-value">
                {{ auditData.lastEventType || 'Sin evento' }} -
                {{ auditData.lastEventOutcome || 'APPROVED' }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-px-lg">
        <q-expansion-item
          v-model="certificateOptionsOpen"
          dense
          dark
          icon="tune"
          label="Configurar Certificado PDF"
          header-class="certificate-options__header"
          class="certificate-options"
        >
          <div class="certificate-options__body">
            <div class="certificate-date-grid">
              <q-input
                v-model="selectedFromDate"
                dark
                dense
                outlined
                type="date"
                label="Fecha Inicio"
                stack-label
                :max="selectedToDate || undefined"
              />
              <q-input
                v-model="selectedToDate"
                dark
                dense
                outlined
                type="date"
                label="Fecha Fin"
                stack-label
                :min="selectedFromDate || undefined"
              />
            </div>
            <q-input
              v-model="auditReason"
              dark
              dense
              outlined
              clearable
              maxlength="180"
              label="Motivo (opcional)"
              placeholder="Auditoría Administrativa de Asistencia / Aclaración de Falta"
              class="q-mt-sm"
            />
          </div>
        </q-expansion-item>
      </q-card-section>

      <q-card-actions class="audit-actions q-px-lg q-pb-lg">
        <q-btn
          no-caps
          unelevated
          label="Ver Línea de Tiempo Completa"
          class="audit-action-btn"
          @click="openTimeline"
        />
        <q-btn
          no-caps
          unelevated
          color="negative"
          icon="picture_as_pdf"
          label="Generar Certificado PDF"
          class="audit-certificate-btn"
          :loading="certificateLoading"
          :disable="!certificateUsername"
          @click="downloadCertificate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { axiosInstance } from 'src/services/axiosConfig'

const $q = useQuasar()
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const certificateLoading = ref(false)
const certificateOptionsOpen = ref(false)
const selectedFromDate = ref('')
const selectedToDate = ref('')
const auditReason = ref('')

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'open-timeline'])

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '')
const auditData = computed(() => props.user?.auditData || props.user?.audit || props.user || {})

const displayName = computed(() =>
  String(
    firstValue(
      props.user?.name,
      props.user?.fullName,
      props.user?.displayName,
      props.user?.nombre,
      'Usuario',
    ),
  ),
)
const username = computed(() =>
  String(
    firstValue(
      props.user?.username,
      props.user?.userName,
      props.user?.email,
      props.user?.usuario,
      'sin usuario',
    ),
  ),
)
const certificateUsername = computed(() =>
  String(
    firstValue(auditData.value?.username, auditData.value?.userName, username.value, ''),
  ).trim(),
)
const activeSystem = computed(() => String(filtrosGlobales.value?.system || '').trim())
const avatarUrl = computed(() =>
  firstValue(props.user?.avatarUrl, props.user?.avatar, props.user?.photoUrl, props.user?.picture),
)
const initials = computed(() =>
  displayName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(''),
)

const lastConnection = computed(() =>
  firstValue(
    auditData.value?.lastConnection,
    auditData.value?.lastSeen,
    auditData.value?.lastEventAt,
    auditData.value?.lastRecord,
    props.user?.lastConnection,
    props.user?.lastSeen,
    props.user?.lastEventAt,
    props.user?.lastRecord,
    auditData.value?.timestamp,
    auditData.value?.eventTime,
  ),
)

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function elapsed(date) {
  const diff = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Hace unos segundos'
  if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
  const months = Math.floor(days / 30)
  return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`
}

const lastConnectionLabel = computed(() => {
  const date = parseDate(lastConnection.value)
  if (!date) return 'Sin registros disponibles'
  const formatted = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
  return `${elapsed(date)} - ${formatted}`
})

function toDateInputValue(rawDate) {
  const date = parseDate(rawDate) || new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initializeCertificateForm() {
  const initialDate = toDateInputValue(lastConnection.value)
  selectedFromDate.value = initialDate
  selectedToDate.value = initialDate
  auditReason.value = ''
  certificateOptionsOpen.value = false
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) initializeCertificateForm()
  },
  { immediate: true },
)

function openTimeline() {
  emit('open-timeline', props.user)
  emit('update:modelValue', false)
}

function safeFilePart(value) {
  return String(value || 'usuario')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
}

function formatToIsoString(dateVal, isEndOfDay = false) {
  if (!dateVal) {
    return isEndOfDay ? new Date().toISOString() : new Date(0).toISOString()
  }

  if (typeof dateVal === 'string' && dateVal.includes('T')) return dateVal

  const simpleDateMatch =
    typeof dateVal === 'string' ? dateVal.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null
  const date = simpleDateMatch
    ? new Date(
        Number(simpleDateMatch[1]),
        Number(simpleDateMatch[2]) - 1,
        Number(simpleDateMatch[3]),
      )
    : new Date(dateVal)
  if (Number.isNaN(date.getTime())) {
    return isEndOfDay ? new Date().toISOString() : new Date(0).toISOString()
  }

  if (isEndOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }
  return date.toISOString()
}

async function downloadCertificate() {
  if (!certificateUsername.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un usuario para generar el certificado.',
    })
    return
  }

  if (!selectedFromDate.value || !selectedToDate.value) {
    certificateOptionsOpen.value = true
    $q.notify({ type: 'warning', message: 'Selecciona las fechas del certificado.' })
    return
  }

  if (selectedFromDate.value > selectedToDate.value) {
    certificateOptionsOpen.value = true
    $q.notify({ type: 'warning', message: 'La fecha de inicio no puede ser posterior a la final.' })
    return
  }

  certificateLoading.value = true
  let objectUrl = ''
  try {
    const payload = {
      username: certificateUsername.value,
      system: activeSystem.value || 'TRUSTVALUE',
      fromDate: formatToIsoString(selectedFromDate.value, false),
      toDate: formatToIsoString(selectedToDate.value, true),
      reason: auditReason.value?.trim() || 'Auditoría Administrativa de Asistencia',
    }
    const response = await axiosInstance.post('/api/analytics/reports/audit-certificate', payload, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.setAttribute(
      'download',
      `Certificado_Auditoria_${safeFilePart(certificateUsername.value)}.pdf`,
    )
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      icon: 'verified_user',
      message: 'El documento firmado fue generado correctamente.',
      position: 'top',
    })
  } catch (error) {
    console.error('[UserAuditDialog] Error generando certificado PDF:', error)
    $q.notify({ type: 'negative', message: 'Error generando certificado PDF', position: 'top' })
  } finally {
    if (objectUrl) window.URL.revokeObjectURL(objectUrl)
    certificateLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.user-audit-card {
  width: min(520px, calc(100vw - 24px));
  border-radius: 22px;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 100% 0, rgba(124, 58, 237, 0.2), transparent 34%),
    linear-gradient(160deg, #111827 0%, #080b12 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.65);
}

.user-audit-card__header {
  padding: 22px 24px;
}
.user-audit-avatar {
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #06b6d4, #7c3aed 58%, #ec4899);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}
.audit-user-copy {
  min-width: 0;
}
.audit-status-badge {
  padding: 8px 12px;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
}
.audit-detail-list {
  display: grid;
  gap: 12px;
}
.audit-detail-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 13px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.audit-detail-label {
  margin-bottom: 2px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.audit-detail-value {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.audit-action-btn {
  min-height: 46px;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(90deg, #06b6d4, #7c3aed 58%, #ec4899);
}
.certificate-options {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
}
.certificate-options :deep(.certificate-options__header) {
  min-height: 44px;
  color: rgba(255, 255, 255, 0.8);
}
.certificate-options__body {
  padding: 4px 14px 14px;
}
.certificate-date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.audit-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.audit-actions .q-btn {
  min-height: 46px;
  margin: 0;
  border-radius: 13px;
}
.audit-certificate-btn {
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.18);
}
@media (max-width: 520px) {
  .audit-actions {
    grid-template-columns: 1fr;
  }
  .certificate-date-grid {
    grid-template-columns: 1fr;
  }
}
</style>
