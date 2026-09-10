<template>
  <q-dialog
    :model-value="modelValue"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card
      style="width: 550px; max-width: 90vw;"
      class="bg-dark text-white border-subtle q-pa-sm"
    >
      <q-card-section class="row items-center justify-between q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon name="auto_awesome" size="28px" class="text-orange" />
          <div>
            <div class="text-h6 text-weight-bold">{{ t('aiDiagnosis.title') }}</div>
            <div v-if="event" class="text-caption text-grey-5">
              {{ event.eventCode }} · {{ event.system }}
            </div>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="grey-5"
          @click="closeModal"
        />
      </q-card-section>

      <q-separator dark />

      <q-card-section class="q-pa-md relative-position">
        <q-inner-loading :showing="loading" color="orange">
          <div class="column items-center q-gutter-md">
            <q-spinner-dots size="48px" color="orange" />
            <div class="text-subtitle2 text-center text-white">
              {{ t('aiDiagnosis.loading') }}
            </div>
          </div>
        </q-inner-loading>

        <div v-if="error && !loading" class="text-center q-py-xl">
          <q-icon name="error_outline" size="48px" color="negative" />
          <div class="text-subtitle1 text-negative q-mt-md">{{ t('aiDiagnosis.error') }}</div>
          <div class="text-caption text-grey-5">{{ error }}</div>
          <q-btn
            outline
            color="orange"
            class="q-mt-md"
            :label="t('aiDiagnosis.retry')"
            @click="loadDiagnosis"
          />
        </div>

        <div v-else-if="diagnosis && !loading" class="diagnosis-content q-gutter-sm">
          <!-- Título -->
          <q-card flat class="diagnosis-section bg-dark border-subtle">
            <q-card-section>
              <div class="text-overline text-orange text-uppercase letter-spacing-sm">
                {{ event?.system }}
              </div>
              <div class="text-h6 text-weight-bold">
                {{ diagnosis.title || `${event?.eventCode} - ${event?.system}` }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Causa Raíz -->
          <q-card flat class="diagnosis-section bg-dark border-subtle">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="bug_report" size="22px" color="negative" />
                <div class="text-subtitle2 text-weight-bold">{{ t('aiDiagnosis.rootCause') }}</div>
              </div>
              <div class="text-body2 text-grey-4">
                {{ diagnosis.rootCause || diagnosis.cause || t('aiDiagnosis.noData') }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Nivel de Impacto -->
          <q-card flat class="diagnosis-section bg-dark border-subtle">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="warning_amber" size="22px" color="warning" />
                <div class="text-subtitle2 text-weight-bold">{{ t('aiDiagnosis.impactLevel') }}</div>
              </div>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-badge
                  :color="impactColor(diagnosis.impactLevel?.severity)"
                  class="text-weight-bold"
                >
                  {{ diagnosis.impactLevel?.severity || t('aiDiagnosis.unknown') }}
                </q-badge>
              </div>
              <div class="text-body2 text-grey-4">
                {{ diagnosis.impactLevel?.description || t('aiDiagnosis.noData') }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Acción Recomendada -->
          <q-card flat class="diagnosis-section bg-dark border-subtle">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="build" size="22px" color="positive" />
                <div class="text-subtitle2 text-weight-bold">{{ t('aiDiagnosis.recommendedAction') }}</div>
              </div>
              <div class="text-body2 text-grey-4">
                {{ diagnosis.recommendedAction || diagnosis.action || t('aiDiagnosis.noData') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AnalyticsService } from 'src/services/analyticsService'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
  initialDiagnosis: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const diagnosis = ref(null)
const error = ref('')

function closeModal() {
  emit('update:modelValue', false)
}

function impactColor(severity) {
  if (!severity) return 'grey'
  const normalized = String(severity).toLowerCase()
  if (normalized.includes('crit')) return 'negative'
  if (normalized.includes('high') || normalized.includes('alto')) return 'negative'
  if (normalized.includes('warn') || normalized.includes('medium') || normalized.includes('medio')) return 'warning'
  if (normalized.includes('low') || normalized.includes('bajo')) return 'positive'
  return 'grey'
}

async function loadDiagnosis() {
  if (!props.event) return
  loading.value = true
  error.value = ''
  diagnosis.value = null

  try {
    const payload = {
      system: props.event.system,
      eventCode: props.event.eventCode,
      message: props.event.description || props.event.title || props.event.eventCode,
    }
    diagnosis.value = await AnalyticsService.explainError(payload)
  } catch (err) {
    console.error('[AiDiagnosisModal] Error al cargar diagnóstico:', err)
    error.value = err?.response?.data?.message || err.message || t('aiDiagnosis.error')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen || !props.event) return
    if (props.initialDiagnosis) {
      diagnosis.value = props.initialDiagnosis
      loading.value = false
      error.value = ''
      return
    }
    loadDiagnosis()
  },
)
</script>

<style lang="scss" scoped>
.diagnosis-section {
  border-radius: 10px;
}

.letter-spacing-sm {
  letter-spacing: 0.04em;
}
</style>
