<template>
  <div class="attendance-anomalies-widget q-mb-lg">
    <q-card flat bordered class="anomalies-summary-card text-white">
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-auto">
          <div
            class="anomalies-summary-card__icon"
            :class="{ 'anomalies-summary-card__icon--alert': hasAnomalies }"
          >
            <q-icon :name="summaryIcon" size="32px" />
          </div>
        </div>

        <div class="col-12 col-sm">
          <div class="text-h5 text-weight-bold">{{ summaryTitle }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">{{ summarySubtitle }}</div>
        </div>

        <div class="col-auto anomalies-summary-card__actions">
          <q-badge
            rounded
            :color="hasAnomalies ? 'negative' : 'positive'"
            class="anomalies-summary-card__badge"
          >
            {{
              hasAnomalies
                ? `🚨 ${totalAnomalies} Inconsistencias Detectadas`
                : '✓ Sin irregularidades hoy'
            }}
          </q-badge>
          <q-btn
            no-caps
            unelevated
            icon="fact_check"
            label="Revisar Auditoría"
            class="anomalies-summary-card__button"
            :loading="loading && !anomalies"
            @click="dialogOpen = true"
          />
        </div>
      </q-card-section>
    </q-card>

    <AttendanceAnomaliesDialog v-model="dialogOpen" :anomalies="anomalies" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AttendanceAnomaliesDialog from './AttendanceAnomaliesDialog.vue'

const props = defineProps({
  anomalies: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const dialogOpen = ref(false)
const supportsAttendance = computed(() => props.anomalies?.supportsAttendance !== false)
const summaryTitle = computed(() =>
  supportsAttendance.value
    ? 'Anomalías e Inconsistencias de Asistencia'
    : 'Monitoreo de Actividad y Usuarios Inactivos',
)
const summarySubtitle = computed(() =>
  supportsAttendance.value
    ? 'Validación automática de cierres, jornadas y actividad reciente de empleados.'
    : 'Detección automática de inactividad de usuarios en la plataforma.',
)
const summaryIcon = computed(() => (supportsAttendance.value ? 'warning' : 'person_off'))
const list = (...values) => values.find(Array.isArray) || []
const orphanClosures = computed(() =>
  list(
    props.anomalies?.orphanClosures,
    props.anomalies?.orphanCheckouts,
    props.anomalies?.cierresHuerfanos,
  ),
)
const incompleteShifts = computed(() =>
  list(
    props.anomalies?.incompleteShifts,
    props.anomalies?.incompleteWorkdays,
    props.anomalies?.jornadasIncompletas,
  ),
)
const ghostUsers = computed(() =>
  list(
    props.anomalies?.ghostUsers,
    props.anomalies?.inactiveUsers,
    props.anomalies?.usuariosFantasma,
  ),
)
const calculatedTotal = computed(
  () => orphanClosures.value.length + incompleteShifts.value.length + ghostUsers.value.length,
)
const totalAnomalies = computed(() => {
  const reported = Number(props.anomalies?.totalAnomalies)
  return Number.isFinite(reported) ? reported : calculatedTotal.value
})
const hasAnomalies = computed(() => totalAnomalies.value > 0)
</script>

<style scoped lang="scss">
.anomalies-summary-card {
  border-radius: 20px;
  border-color: rgba(245, 158, 11, 0.2);
  background:
    radial-gradient(circle at 90% 10%, rgba(239, 68, 68, 0.12), transparent 28%),
    linear-gradient(145deg, rgba(21, 24, 33, 0.98), rgba(10, 12, 18, 0.98));
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}
.anomalies-summary-card__icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  color: #4ade80;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.2);
}
.anomalies-summary-card__icon--alert {
  color: #fb7185;
  background: rgba(239, 68, 68, 0.13);
  border-color: rgba(251, 113, 133, 0.22);
}
.anomalies-summary-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.anomalies-summary-card__badge {
  padding: 8px 12px;
  font-size: 0.75rem;
}
.anomalies-summary-card__button {
  min-height: 42px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(90deg, #d97706, #ea580c);
}
@media (max-width: 700px) {
  .anomalies-summary-card__actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }
  .anomalies-summary-card__badge {
    align-self: flex-start;
  }
}
</style>
