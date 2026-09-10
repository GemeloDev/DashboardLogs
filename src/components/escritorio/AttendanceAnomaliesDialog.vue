<template>
  <q-dialog
    :model-value="modelValue"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card dark class="attendance-dialog text-white">
      <q-card-section class="attendance-dialog__header row items-center no-wrap">
        <div>
          <div class="text-h6 text-weight-bold">
            {{ supportsAttendance ? 'Auditoría de Asistencia' : 'Monitoreo de Inactividad' }}
          </div>
          <div class="text-caption text-grey-5">
            {{
              supportsAttendance
                ? 'Inconsistencias detectadas automáticamente'
                : 'Usuarios sin actividad reciente en la plataforma'
            }}
          </div>
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" color="grey-5" aria-label="Cerrar" />
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        dense
        no-caps
        align="justify"
        active-color="white"
        indicator-color="orange"
        class="attendance-tabs"
      >
        <q-tab v-if="supportsAttendance" name="orphan" icon="link_off">
          <span>Cierres Huérfanos</span
          ><q-badge color="negative" rounded>{{ orphanClosures.length }}</q-badge>
        </q-tab>
        <q-tab v-if="supportsAttendance" name="incomplete" icon="pending_actions">
          <span>Jornadas Incompletas</span
          ><q-badge color="orange-8" rounded>{{ incompleteShifts.length }}</q-badge>
        </q-tab>
        <q-tab name="ghost" icon="person_off">
          <span>{{
            supportsAttendance ? 'Usuarios Fantasma' : 'Usuarios Inactivos / Fantasma'
          }}</span
          ><q-badge color="amber-8" text-color="black" rounded>{{ ghostUsers.length }}</q-badge>
        </q-tab>
      </q-tabs>

      <q-separator dark />

      <q-tab-panels v-model="activeTab" animated class="attendance-panels">
        <q-tab-panel v-if="supportsAttendance" name="orphan" class="q-pa-lg">
          <div v-if="orphanClosures.length" class="anomaly-list">
            <article
              v-for="(item, index) in orphanClosures"
              :key="item.id || `orphan-${index}`"
              class="anomaly-card anomaly-card--red"
            >
              <div class="anomaly-card__icon"><q-icon name="logout" size="22px" /></div>
              <div class="anomaly-card__body">
                <div class="text-subtitle2 text-weight-bold">{{ userName(item) }}</div>
                <div class="anomaly-meta">
                  <q-icon name="schedule" /> Intento: {{ formatDateTime(eventDate(item)) }}
                </div>
                <div class="anomaly-meta"><q-icon name="devices" /> {{ deviceName(item) }}</div>
              </div>
              <q-btn
                no-caps
                outline
                color="red-4"
                icon="person_search"
                label="Auditar Usuario"
                @click="auditUser(item)"
              />
            </article>
          </div>
          <EmptyAnomalies v-else label="No hay cierres huérfanos detectados." />
        </q-tab-panel>

        <q-tab-panel v-if="supportsAttendance" name="incomplete" class="q-pa-lg">
          <div v-if="incompleteShifts.length" class="anomaly-list">
            <article
              v-for="(item, index) in incompleteShifts"
              :key="item.id || `shift-${index}`"
              class="anomaly-card anomaly-card--orange"
            >
              <div class="anomaly-card__icon"><q-icon name="more_time" size="22px" /></div>
              <div class="anomaly-card__body">
                <div class="text-subtitle2 text-weight-bold">{{ userName(item) }}</div>
                <div class="anomaly-meta">
                  <q-icon name="login" /> Entrada: {{ formatDateTime(startDate(item)) }}
                </div>
              </div>
              <q-chip color="orange-9" text-color="white" icon="timer" class="text-weight-bold">
                {{ elapsedHours(item) }} h fuera de rango
              </q-chip>
            </article>
          </div>
          <EmptyAnomalies v-else label="No hay jornadas incompletas." />
        </q-tab-panel>

        <q-tab-panel name="ghost" class="q-pa-lg">
          <div v-if="ghostUsers.length" class="anomaly-list">
            <article
              v-for="(item, index) in ghostUsers"
              :key="item.id || `ghost-${index}`"
              class="anomaly-card anomaly-card--yellow"
            >
              <div class="anomaly-card__icon"><q-icon name="person_off" size="22px" /></div>
              <div class="anomaly-card__body">
                <div class="text-subtitle2 text-weight-bold">{{ userName(item) }}</div>
                <div class="anomaly-meta">
                  <q-icon name="history" /> Última actividad:
                  {{ formatDateTime(lastActivity(item)) }}
                </div>
              </div>
              <q-chip color="grey-8" text-color="amber-3" icon="hourglass_empty">
                {{ inactiveHours(item) }} h sin actividad
              </q-chip>
            </article>
          </div>
          <EmptyAnomalies
            v-else
            label="Todos los empleados activos registraron actividad reciente."
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, defineComponent, h, inject, ref, watch } from 'vue'
import { QIcon } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  anomalies: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])
const openUserAudit = inject('openUserAudit', null)
const activeTab = ref('orphan')
const supportsAttendance = computed(() => props.anomalies?.supportsAttendance !== false)

watch(
  [() => props.modelValue, supportsAttendance],
  ([isOpen, attendanceEnabled]) => {
    if (!attendanceEnabled) {
      activeTab.value = 'ghost'
    } else if (isOpen) {
      activeTab.value = 'orphan'
    }
  },
  { immediate: true },
)

const EmptyAnomalies = defineComponent({
  props: { label: { type: String, required: true } },
  setup(innerProps) {
    return () =>
      h('div', { class: 'attendance-empty' }, [
        h(QIcon, { name: 'check_circle', color: 'positive', size: '34px' }),
        h('span', innerProps.label),
      ])
  },
})

const firstArray = (...values) => values.find(Array.isArray) || []
const orphanClosures = computed(() =>
  firstArray(
    props.anomalies?.orphanClosures,
    props.anomalies?.orphanCheckouts,
    props.anomalies?.cierresHuerfanos,
  ),
)
const incompleteShifts = computed(() =>
  firstArray(
    props.anomalies?.incompleteShifts,
    props.anomalies?.incompleteWorkdays,
    props.anomalies?.jornadasIncompletas,
  ),
)
const ghostUsers = computed(() =>
  firstArray(
    props.anomalies?.ghostUsers,
    props.anomalies?.inactiveUsers,
    props.anomalies?.usuariosFantasma,
  ),
)

const value = (...values) =>
  values.find((entry) => entry !== undefined && entry !== null && entry !== '')
const userName = (item) =>
  value(
    item?.user?.name,
    item?.user?.fullName,
    item?.employeeName,
    item?.fullName,
    item?.name,
    item?.username,
    'Usuario desconocido',
  )
const deviceName = (item) =>
  value(
    item?.device,
    item?.deviceModel,
    item?.deviceName,
    item?.lastDevice,
    'Dispositivo desconocido',
  )
const eventDate = (item) =>
  value(item?.attemptedAt, item?.checkoutAttemptAt, item?.eventTime, item?.timestamp, item?.date)
const startDate = (item) =>
  value(item?.checkInAt, item?.startTime, item?.entryTime, item?.startedAt)
const lastActivity = (item) =>
  value(item?.lastActivityAt, item?.lastSeen, item?.lastEventAt, item?.lastRecordAt)

function parseDate(raw) {
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
function formatDateTime(raw) {
  const date = parseDate(raw)
  if (!date) return 'No disponible'
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}
function hoursSince(raw) {
  const date = parseDate(raw)
  return date ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 3600000)) : 0
}
const elapsedHours = (item) =>
  Number(
    value(
      item?.hoursOutOfRange,
      item?.elapsedHours,
      item?.hoursElapsed,
      hoursSince(startDate(item)),
    ),
  ) || 0
const inactiveHours = (item) =>
  Number(
    value(
      item?.inactiveHours,
      item?.hoursWithoutActivity,
      item?.hoursSinceLastActivity,
      hoursSince(lastActivity(item)),
    ),
  ) || 0

function auditUser(item) {
  const source = item?.user || item
  openUserAudit?.({
    ...source,
    name: userName(item),
    username: value(source?.username, item?.username, item?.employeeUsername, item?.userName),
    auditData: item?.auditData || source?.auditData || item,
  })
}
</script>

<style scoped lang="scss">
.attendance-dialog {
  width: min(920px, calc(100vw - 24px));
  max-width: 920px;
  max-height: min(780px, calc(100vh - 32px));
  border-radius: 22px;
  overflow: hidden;
  background: #0d111b;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.attendance-dialog__header {
  padding: 20px 24px;
  background: linear-gradient(100deg, rgba(234, 88, 12, 0.12), rgba(127, 29, 29, 0.08));
}
.attendance-tabs {
  background: rgba(255, 255, 255, 0.025);
}
.attendance-tabs :deep(.q-tab__content) {
  gap: 6px;
}
.attendance-panels {
  min-height: 360px;
  max-height: 570px;
  overflow-y: auto;
  color: #fff;
  background: transparent;
}
.anomaly-list {
  display: grid;
  gap: 12px;
}
.anomaly-card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 15px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.anomaly-card__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
}
.anomaly-card--red .anomaly-card__icon {
  color: #fb7185;
  background: rgba(239, 68, 68, 0.14);
}
.anomaly-card--orange .anomaly-card__icon {
  color: #fb923c;
  background: rgba(249, 115, 22, 0.14);
}
.anomaly-card--yellow .anomaly-card__icon {
  color: #facc15;
  background: rgba(234, 179, 8, 0.12);
}
.anomaly-card__body {
  min-width: 0;
}
.anomaly-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.78rem;
}
.attendance-empty {
  min-height: 250px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.58);
  text-align: center;
}
@media (max-width: 700px) {
  .attendance-tabs :deep(.q-tab__label) {
    font-size: 0.68rem;
  }
  .anomaly-card {
    grid-template-columns: 40px minmax(0, 1fr);
  }
  .anomaly-card > .q-btn,
  .anomaly-card > .q-chip {
    grid-column: 1 / -1;
    justify-self: stretch;
  }
}
</style>
