<template>
  <DashboardSectionShell
    v-if="hasContent"
    :section-id="DASHBOARD_SECTION_IDS.TOPLISTS"
    :popup-mode="isPopup"
    :show-popout="false"
  >
    <EscritorioGraficasEnhanced
      :popup-mode="isPopup"
      :visible-panels="visiblePanels"
      :show-internal-popouts="showPopout"
    />
  </DashboardSectionShell>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import EscritorioGraficasEnhanced from 'src/components/escritorio/EscritorioGraficasEnhanced.vue'
import DashboardSectionShell from './DashboardSectionShell.vue'
import { DASHBOARD_PANEL_IDS } from 'src/constants/dashboardPanels'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'

const props = defineProps({
  mode: {
    type: String,
    default: 'dashboard',
  },
  showPopout: {
    type: Boolean,
    default: true,
  },
})

const isPopup = computed(() => props.mode === 'popup')
const visiblePanels = [
  DASHBOARD_PANEL_IDS.OFFICES,
  DASHBOARD_PANEL_IDS.TAGS,
  DASHBOARD_PANEL_IDS.OUTCOMES,
]
const statsData = inject('dashboardStatsData', ref(null))
const filtrosGlobales = inject('filtrosGlobales', ref({}))

const normalizeFilterValue = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    label: String(row?.value ?? row?.label ?? ''),
    count: Number(row?.count || 0),
  }))

const hasRows = (rows) => normalizeRows(rows).length > 0
const hasOutcomeRows = computed(() => {
  const selectedOutcome = normalizeFilterValue(filtrosGlobales.value?.values?.outcome)
  const rows = normalizeRows(statsData.value?.outcomes)
  if (!selectedOutcome) return rows.length > 0
  return rows.some((row) => normalizeFilterValue(row.label) === selectedOutcome)
})

const hasContent = computed(
  () =>
    hasRows(statsData.value?.topLocations) ||
    hasRows(statsData.value?.topTags) ||
    hasOutcomeRows.value,
)
</script>
