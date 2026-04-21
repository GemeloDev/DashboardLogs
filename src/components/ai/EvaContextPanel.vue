<template>
  <div class="eva-context-panel q-pa-md">
    <div class="eva-panel-header">
      <div>
        <div class="eva-panel-title">{{ eva.contextPanel.title }}</div>
        <div class="eva-panel-subtitle">
          {{ t('evaWorkspace.workspaceSubtitle') }}
        </div>
      </div>

      <q-btn
        flat
        round
        dense
        icon="close"
        color="grey-4"
        @click="eva.clearContextPanel()"
      />
    </div>

    <div v-if="eva.loading" class="column items-center q-py-xl">
      <q-spinner color="primary" size="40px" />
      <div class="q-mt-md text-grey-5">{{ t('evaWorkspace.loadingAnalysis') }}</div>
    </div>

    <div v-else-if="eva.contextPanel.mode === 'empty'" class="eva-empty-state">
      <q-icon name="auto_awesome" size="48px" class="q-mb-md" />
      <div class="text-subtitle1">{{ t('evaWorkspace.emptyContextTitle') }}</div>
      <div class="text-caption text-grey-5 q-mt-sm">
        {{ t('evaWorkspace.emptyContextBody') }}
      </div>
    </div>

    <div v-else-if="eva.contextPanel.mode === 'insight'" class="eva-panel-body">
      <q-card flat bordered class="eva-panel-card">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.executiveSummary') }}</div>
          <div class="eva-main-text q-mt-sm">
            {{ insightNarrative }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="eva-panel-card q-mt-md" v-if="insightBullets.length">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.keyPoints') }}</div>
          <div
            v-for="item in insightBullets"
            :key="item"
            class="eva-list-item"
          >
            • {{ item }}
          </div>
        </q-card-section>
      </q-card>

      <q-card
        v-if="aiDeepAnalysis"
        flat
        bordered
        class="eva-panel-card q-mt-md eva-ai-card"
      >
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon name="auto_awesome" color="purple-3" size="18px" class="q-mr-xs" />
            <span class="eva-section-title" style="color: #c084fc; margin-bottom: 0">
              {{ t('evaWorkspace.aiAnalysisTitle') }}
            </span>
            <q-badge
              color="purple-9"
              text-color="purple-2"
              label="GPT-4o mini"
              class="q-ml-sm"
              style="font-size: 10px"
            />
          </div>

          <div class="row items-center q-mb-md">
            <span class="text-caption text-grey-5">{{ t('evaWorkspace.dominantEvent') }}</span>
            <q-chip
              dense
              color="indigo-9"
              text-color="indigo-2"
              size="sm"
              class="q-ml-sm"
            >
              {{ aiDeepAnalysis.dominantEventType }}
            </q-chip>
            <span class="text-caption text-grey-5 q-ml-sm">
              {{ t('evaWorkspace.occurrences', { count: fmtNumber(aiDeepAnalysis.dominantCount) }) }}
            </span>
          </div>

          <div v-if="aiDeepSummary">
            <div class="eva-ai-label">{{ t('evaWorkspace.whatIsHappening') }}</div>
            <div class="eva-ai-text q-mt-xs">{{ aiDeepSummary }}</div>
          </div>

          <div v-if="aiDeepSuggestions.length" class="q-mt-md">
            <div class="eva-ai-label">{{ t('evaWorkspace.specificActions') }}</div>
            <div
              v-for="(sug, i) in aiDeepSuggestions"
              :key="i"
              class="eva-ai-suggestion q-mt-xs"
            >
              {{ sug }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="eva.contextPanel.mode === 'alert'" class="eva-panel-body">
      <div class="eva-kpi-row">
        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.alertsLabel') }}</div>
          <div class="eva-kpi-value">{{ fmtNumber(alertItems.length) }}</div>
        </div>
      </div>

      <q-card flat bordered class="eva-panel-card q-mt-md">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.recentAlerts') }}</div>

          <div v-if="!alertItems.length" class="text-grey-5 q-mt-md">
            {{ t('evaWorkspace.noAlerts') }}
          </div>

          <div
            v-for="item in alertItems"
            :key="item.id"
            class="eva-alert-row"
          >
            <div class="row items-center justify-between">
              <div class="text-weight-bold">
                {{ item.status || t('evaWorkspace.notAvailable') }}
              </div>
              <q-chip
                dense
                size="sm"
                :color="alertColor(item.status)"
                text-color="white"
              >
                {{ item.status || t('evaWorkspace.notAvailable') }}
              </q-chip>
            </div>

            <div class="text-caption q-mt-xs text-grey-5">
              {{ fmtDate(item.windowFromLocal) || fmtDate(item.bucketStartLocal) || t('evaWorkspace.noDate') }}
            </div>

            <div class="text-caption q-mt-xs text-grey-4">
              {{ item.granularity || '' }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="eva.contextPanel.mode === 'trend'" class="eva-panel-body">
      <div class="eva-kpi-row">
        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.statusLabel') }}</div>
          <div class="eva-kpi-value">
            <q-chip
              dense
              :color="trendStatusColor"
              text-color="white"
            >
              {{ trendStatus }}
            </q-chip>
          </div>
        </div>

        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.errorRateLabel') }}</div>
          <div class="eva-kpi-value">{{ trendErrorRate }}</div>
        </div>
      </div>

      <q-card flat bordered class="eva-panel-card q-mt-md" v-if="trendWarnings.length">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.warningsTitle') }}</div>
          <div
            v-for="txt in trendWarnings"
            :key="txt"
            class="eva-list-item"
          >
            • {{ txt }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="eva-panel-card q-mt-md" v-if="trendRecommendations.length">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.recommendationsTitle') }}</div>
          <div
            v-for="txt in trendRecommendations"
            :key="txt"
            class="eva-list-item"
          >
            • {{ txt }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="eva.contextPanel.mode === 'chart'" class="eva-panel-body">
      <div class="eva-kpi-row">
        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.systemLabel') }}</div>
          <div class="eva-kpi-value eva-kpi-value--small">
            {{ chartSystem }}
          </div>
        </div>

        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.granularityLabel') }}</div>
          <div class="eva-kpi-value">{{ evaContext.granularity || '-' }}</div>
        </div>

        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.rangeLabel') }}</div>
          <div class="eva-kpi-value">
            {{ resolvedRangeLabel }}
          </div>
        </div>

        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.pointsLabel') }}</div>
          <div class="eva-kpi-value">
            {{ fmtNumber(chartPoints.length) }}
          </div>
        </div>

        <div class="eva-kpi-card">
          <div class="eva-kpi-label">{{ t('evaWorkspace.maxErrorRateLabel') }}</div>
          <div class="eva-kpi-value">
            {{ chartMaxErrorRate }}
          </div>
        </div>
      </div>

      <q-card flat bordered class="eva-panel-card q-mt-md">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="localSystem"
              :options="systemOptions"
              dark
              outlined
              dense
              :label="t('evaWorkspace.systemLabel')"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="localGranularity"
              :options="granularityOptions"
              dark
              outlined
              dense
              :label="t('evaWorkspace.granularityLabel')"
            />
          </div>

          <div class="col-12">
            <q-btn
              color="primary"
              :label="t('evaWorkspace.updateChart')"
              icon="refresh"
              @click="reloadChart"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="eva-panel-card q-mt-md">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.historicalSeries') }}</div>

          <div v-if="chartPoints.length === 0" class="text-grey-5 q-mt-md">
            {{ t('evaWorkspace.noChartPoints') }}
          </div>

          <div v-else class="eva-apex-wrap q-mt-md">
            <apexchart
              type="line"
              height="320"
              :options="chartOptions"
              :series="chartSeries"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="eva-panel-card q-mt-md" v-if="chartPoints.length">
        <q-card-section>
          <div class="eva-section-title">{{ t('evaWorkspace.pointDetailTitle') }}</div>

          <div
            v-for="point in chartPoints"
            :key="point.bucketStart"
            class="eva-chart-detail-row"
          >
            <div class="eva-chart-detail-date">{{ fmtDate(point.bucketStartLocal) }}</div>
            <div class="eva-chart-detail-metrics">
              <span>{{ t('evaWorkspace.pointErrorRate', { value: pct(point.errorRate) }) }}</span>
              <span>{{ t('evaWorkspace.pointErrorCount', { value: fmtNumber(point.errorCount ?? 0) }) }}</span>
              <span>{{ t('evaWorkspace.pointTotal', { value: fmtNumber(point.total ?? 0) }) }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'

const apexchart = VueApexCharts
const eva = useEvaStore()
const { t, locale } = useI18n()

const localSystem = ref(eva.selectedSystem)
const localGranularity = ref(eva.selectedGranularity)

const granularityOptions = computed(() => [
  { label: t('evaWorkspace.daily'), value: 'daily' },
  { label: t('evaWorkspace.hourly'), value: 'hourly' },
])

const systemOptions = computed(() => eva.systemOptions)

watch(localSystem, (val) => eva.setSelectedSystem(val))
watch(localGranularity, (val) => eva.setSelectedGranularity(val))

const payloadData = computed(() => eva.contextPanel.payload || {})
const evaContext = computed(() => payloadData.value?.evaContext || {})

const insightNarrative = computed(() => {
  const narrative = payloadData.value?.pretty?.executiveNarrative

  // Ignorar si es un placeholder de tipo o demasiado corto
  if (narrative && narrative !== 'string' && narrative.trim().length > 15) {
    return narrative
  }

  // Fallback: usar los bullets del executiveSummary como narrativa
  const bullets =
    payloadData.value?.base?.executiveSummary ||
    payloadData.value?.pretty?.executiveSummary ||
    payloadData.value?.executiveSummary

  if (Array.isArray(bullets) && bullets.length > 0) {
    return bullets.join('\n')
  }

  // Fallback final: construir desde los puntos clave si existen
  const keyPoints = insightBullets.value
  if (keyPoints.length > 0) {
    return keyPoints.join('\n')
  }

  // return 'Sin resumen disponible.'
  return (
    payloadData.value?.pretty?.executiveNarrative ||
    (Array.isArray(payloadData.value?.base?.executiveSummary)
      ? payloadData.value.base.executiveSummary.join(' ')
      : null) ||
    t('evaWorkspace.noSummary')
  )
})

const insightBullets = computed(() => {
  return (
    payloadData.value?.pretty?.executiveBullets ||
    payloadData.value?.base?.executiveSummary ||
    []
  )
})

const aiDeepAnalysis = computed(() => payloadData.value?.base?.aiDeepAnalysis || null)
const aiDeepSummary = computed(() => aiDeepAnalysis.value?.aiSummary || null)

const aiDeepSuggestions = computed(() => {
  const raw = aiDeepAnalysis.value?.aiSuggestions
  if (!raw) return []
  return raw.split(/\n/).map((s) => s.trim()).filter((s) => s.length > 0)
})

const alertItems = computed(() => payloadData.value?.content || [])
const trendWarnings = computed(() => payloadData.value?.warnings || [])
const trendRecommendations = computed(() => payloadData.value?.recommendations || [])
const trendStatus = computed(() => payloadData.value?.status || 'INFO')
const trendErrorRate = computed(() => pct(payloadData.value?.errorRate || 0))

const trendStatusColor = computed(() => {
  if (trendStatus.value === 'CRIT') return 'negative'
  if (trendStatus.value === 'WARN') return 'warning'
  return 'primary'
})

const chartPoints = computed(() => payloadData.value?.points || [])
const chartSystem = computed(() => payloadData.value?.system || localSystem.value || t('evaWorkspace.notAvailable'))

const chartMaxErrorRate = computed(() => {
  if (!chartPoints.value.length) return '0.00%'
  const max = Math.max(...chartPoints.value.map((p) => Number(p.errorRate || 0)))
  return pct(max)
})

const resolvedRangeLabel = computed(() => {
  if (evaContext.value.rangeLabel) return evaContext.value.rangeLabel
  if (evaContext.value.granularity === 'hourly') {
    return t('evaWorkspace.hoursRange', { count: evaContext.value.hours || 24 })
  }
  const count = evaContext.value.days || 30
  return t(count === 1 ? 'evaWorkspace.daysRangeOne' : 'evaWorkspace.daysRangeOther', { count })
})

const chartSeries = computed(() => [
  {
    name: t('evaWorkspace.errorRateLabel'),
    data: chartPoints.value.map((point) => Number((Number(point.errorRate || 0) * 100).toFixed(2))),
  },
  {
    name: t('evaWorkspace.pointErrorCount', { value: '' }).replace(': ', '').trim(),
    data: chartPoints.value.map((point) => Number(point.errorCount || 0)),
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 320,
    toolbar: {
      show: true,
    },
    zoom: {
      enabled: true,
    },
    background: 'transparent',
    foreColor: '#cfe3ff',
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  legend: {
    labels: {
      colors: '#cfe3ff',
    },
  },
  xaxis: {
    categories: chartPoints.value.map((point) => shortLabel(point.bucketStartLocal)),
    labels: {
      style: {
        colors: '#a9bbd3',
      },
    },
  },
  yaxis: [
    {
      title: {
        text: t('evaWorkspace.errorRateLabel'),
        style: {
          color: '#cfe3ff',
        },
      },
      labels: {
        style: {
          colors: '#a9bbd3',
        },
      },
    },
    {
      opposite: true,
      title: {
        text: t('evaWorkspace.pointErrorCount', { value: '' }).replace(': ', '').trim(),
        style: {
          color: '#cfe3ff',
        },
      },
      labels: {
        style: {
          colors: '#a9bbd3',
        },
      },
    },
  ],
  tooltip: {
    theme: 'dark',
  },
  colors: ['#00d4ff', '#7c4dff'],
  markers: {
    size: 4,
    strokeWidth: 0,
  },
}))

function fmtNumber(value) {
  return new Intl.NumberFormat(locale.value).format(Number(value || 0))
}

function pct(v) {
  return new Intl.NumberFormat(locale.value, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v || 0))
}

function fmtDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function shortLabel(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: '2-digit',
  }).format(d)
}

function alertColor(status) {
  if (status === 'CRIT') return 'negative'
  if (status === 'WARN') return 'warning'
  return 'primary'
}

async function reloadChart() {
  try {
    eva.setLoading(true)

    const granularity = localGranularity.value?.value || localGranularity.value
    const system = localSystem.value?.value || localSystem.value

    const res = await EvaService.getMetricsSeries({
      granularity,
      system,
      days: granularity === 'daily' ? eva.selectedDays : undefined,
      hours: granularity === 'hourly' ? eva.selectedHours : undefined,
      tz: eva.selectedTz,
    })

    const payload = res?.data?.data || {}

    eva.setContextPanel('chart', t('evaWorkspace.chartTitle', { system }), payload)
    eva.addAssistantMessage(t('evaWorkspace.chartUpdated', { system }), 'chart', {
      raw: payload,
      meta: {
        system,
        points: payload?.points?.length || 0,
      },
    })
  } catch (error) {
    console.error(error)
    eva.addAssistantMessage(t('evaWorkspace.chartUpdateError'), 'text')
  } finally {
    eva.setLoading(false)
  }
}
</script>

<style scoped>
.eva-context-panel {
  height: 100%;
  overflow-y: auto;
  color: #eaf0ff;
}

.eva-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.eva-panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.eva-panel-subtitle {
  font-size: 12px;
  color: rgba(234, 240, 255, 0.65);
  margin-top: 4px;
}

.eva-empty-state {
  min-height: 320px;
  border: 1px dashed rgba(255,255,255,0.14);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.02);
  color: rgba(234,240,255,0.75);
  text-align: center;
}

.eva-panel-body {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
}

.eva-panel-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  color: #eaf0ff;
}

.eva-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #9fc3ff;
  margin-bottom: 8px;
}

.eva-main-text {
  font-size: 14px;
  line-height: 1.6;
  color: #ffffff;
  white-space: pre-line;
}

.eva-list-item {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(234,240,255,0.88);
  margin-top: 6px;
}

.eva-kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.eva-kpi-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 14px;
}

.eva-kpi-label {
  font-size: 12px;
  color: rgba(234,240,255,0.65);
}

.eva-kpi-value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 8px;
  color: #ffffff;
}

.eva-kpi-value--small {
  font-size: 16px;
  line-height: 1.3;
}

.eva-alert-row {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  margin-top: 10px;
}

.eva-apex-wrap {
  width: 100%;
}

.eva-chart-detail-row {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.eva-chart-detail-row:last-child {
  border-bottom: none;
}

.eva-chart-detail-date {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.eva-chart-detail-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(234,240,255,0.78);
}

.eva-ai-card {
  border: 1px solid rgba(192, 132, 252, 0.25) !important;
  background: rgba(139, 92, 246, 0.06) !important;
}

.eva-ai-label {
  font-size: 12px;
  font-weight: 700;
  color: #c084fc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.eva-ai-text {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(234, 240, 255, 0.9);
  white-space: pre-line;
}

.eva-ai-suggestion {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(234, 240, 255, 0.85);
  margin-top: 6px;
  padding-left: 8px;
  border-left: 2px solid rgba(192, 132, 252, 0.4);
}

@media (max-width: 900px) {
  .eva-kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
