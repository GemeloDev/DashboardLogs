<template>
  <q-card flat bordered class="chart-filters-card q-pa-md text-white">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col">
        <div class="text-subtitle1 text-weight-medium">{{ t('filters.titleGraphicFilters') }}</div>
        <div class="text-caption text-grey-5">
          {{ t('filters.subtitleGraphicFilters') }}
        </div>
      </div>

      <div class="col-auto">
        <q-btn
          flat
          color="grey-5"
          icon="clear_all"
          :label="t('filters.clearFilters')"
          :disable="loading"
          @click="clearAll"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-12">
        <q-input
          :model-value="dateRangeText"
          :label="t('filters.rangeDate')"
          filled
          dark
          dense
          readonly
          :loading="loading"
          clearable
          @clear="clearDateRange"
        >
          <template #prepend>
            <q-icon name="date_range" color="primary" />
          </template>

          <template #append>
            <q-icon name="calendar_today" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-date
                  v-model="localRange"
                  range
                  dark
                  color="primary"
                  mask="YYYY-MM-DD"
                  @update:model-value="onDateRangeChange"
                />
              </q-popup-proxy>
            </q-icon>

            <q-btn-dropdown
              flat
              dense
              rounded
              icon="schedule"
              color="blue-4"
              dropdown-icon="expand_more"
              no-caps
            >
              <q-list dense class="q-pa-none">
                <q-item clickable v-close-popup @click="selectPreset('hoy')">
                  <q-item-section avatar>
                    <q-icon name="today" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">{{ t('filters.today') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="selectPreset('ayer')">
                  <q-item-section avatar>
                    <q-icon name="history" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">{{ t('filters.yesterday') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="selectPreset('ultimos7')">
                  <q-item-section avatar>
                    <q-icon name="date_range" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">{{ t('filters.last7Days') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="selectPreset('ultimos30')">
                  <q-item-section avatar>
                    <q-icon name="calendar_month" color="blue-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">{{ t('filters.last30Days') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator class="bg-grey-7" />

                <q-item clickable v-close-popup @click="selectPreset('mesActual')">
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="green-4" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white text-caption">{{ t('filters.thisMonth') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-3">
        <q-select
          :model-value="selectedValues.eventType || ''"
          :options="eventTypeOptions"
          :label="t('common.eventType')"
          filled
          dark
          dense
          :loading="loading"
          clearable
          emit-value
          map-options
          option-value="value"
          option-label="label"
          @update:model-value="onChange('eventType', $event)"
        >
          <template #prepend>
            <q-icon name="timeline" color="cyan" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          :model-value="selectedValues.severity || ''"
          :options="severityOptions"
          :label="t('common.severity')"
          filled
          dark
          dense
          :loading="loading"
          clearable
          emit-value
          map-options
          option-value="value"
          option-label="label"
          @update:model-value="onChange('severity', $event)"
        >
          <template #prepend>
            <q-icon name="warning" color="orange" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          :model-value="selectedValues.status || ''"
          :options="statusOptions"
          :label="t('common.status')"
          filled
          dark
          dense
          :loading="loading"
          clearable
          emit-value
          map-options
          option-value="value"
          option-label="label"
          @update:model-value="onChange('status', $event)"
        >
          <template #prepend>
            <q-icon name="fact_check" color="teal" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          :model-value="selectedValues.outcome || ''"
          :options="outcomeOptions"
          :label="t('common.outcome')"
          filled
          dark
          dense
          :loading="loading"
          clearable
          emit-value
          map-options
          option-value="value"
          option-label="label"
          @update:model-value="onChange('outcome', $event)"
        >
          <template #prepend>
            <q-icon name="insights" color="pink" />
          </template>
        </q-select>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const filtrosGlobales = inject(
  'filtrosGlobales',
  ref({
    system: '',
    busqueda: '',
    rangoFechas: { from: '', to: '' },
    visibleFields: [],
    values: {},
  }),
)

const statsData = inject('dashboardStatsData', ref(null))
const loading = inject('dashboardLoading', ref(false))

const localRange = ref({
  from: filtrosGlobales.value?.rangoFechas?.from || '',
  to: filtrosGlobales.value?.rangoFechas?.to || '',
})

const selectedValues = computed(() => filtrosGlobales.value?.values || {})

const toOptions = (rows = []) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    label: `${row.value} (${row.count})`,
    value: row.value,
    count: row.count,
    pct: row.pct,
  }))

const eventTypeOptions = computed(() => toOptions(statsData.value?.topEventTypes))
const severityOptions = computed(() => toOptions(statsData.value?.severities))
const statusOptions = computed(() => toOptions(statsData.value?.statuses))
const outcomeOptions = computed(() => toOptions(statsData.value?.outcomes))

const dateRangeText = computed(() => {
  const from = filtrosGlobales.value?.rangoFechas?.from || ''
  const to = filtrosGlobales.value?.rangoFechas?.to || ''
  if (!from && !to) return ''
  if (from && to) return `${from} - ${to}`
  return from || to
})

function patchGlobalFilters(patch) {
  filtrosGlobales.value = {
    ...filtrosGlobales.value,
    ...patch,
    values: Object.prototype.hasOwnProperty.call(patch, 'values')
      ? { ...(patch.values || {}) }
      : { ...(filtrosGlobales.value?.values || {}) },
  }
}

function onChange(key, value) {
  const nextValues = { ...(filtrosGlobales.value?.values || {}) }

  if (value == null || value === '') delete nextValues[key]
  else nextValues[key] = value

  patchGlobalFilters({ values: nextValues })
}

function onDateRangeChange(range) {
  const from = range?.from || ''
  const to = range?.to || ''

  localRange.value = { from, to }

  patchGlobalFilters({
    rangoFechas: { from, to },
  })
}

function clearDateRange() {
  localRange.value = { from: '', to: '' }

  patchGlobalFilters({
    rangoFechas: { from: '', to: '' },
  })
}

function clearAll() {
  filtrosGlobales.value = {
    ...filtrosGlobales.value,
    rangoFechas: { from: '', to: '' },
    values: {},
  }

  localRange.value = { from: '', to: '' }
}

const pad2 = (n) => String(n).padStart(2, '0')
const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const toYMDLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function selectPreset(period) {
  const today = startOfDay(new Date())
  let fromDate = null
  let toDate = null

  switch (period) {
    case 'hoy':
      fromDate = new Date(today)
      toDate = new Date(today)
      break
    case 'ayer': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      fromDate = yesterday
      toDate = yesterday
      break
    }
    case 'ultimos7': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      fromDate = start
      toDate = new Date(today)
      break
    }
    case 'ultimos30': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      fromDate = start
      toDate = new Date(today)
      break
    }
    case 'mesActual':
      fromDate = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1))
      toDate = new Date(today)
      break
    default:
      return
  }

  onDateRangeChange({
    from: toYMDLocal(fromDate),
    to: toYMDLocal(toDate),
  })
}

watch(
  () => filtrosGlobales.value?.rangoFechas,
  (range) => {
    localRange.value = {
      from: range?.from || '',
      to: range?.to || '',
    }
  },
  { deep: true, immediate: true },
)
</script>

<style scoped lang="scss">
.chart-filters-card {
  background: linear-gradient(180deg, rgba(20, 27, 45, 0.95), rgba(14, 19, 31, 0.98));
  border-color: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
