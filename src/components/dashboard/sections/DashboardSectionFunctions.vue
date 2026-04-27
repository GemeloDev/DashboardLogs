<template>
  <DashboardSectionShell
    :section-id="DASHBOARD_SECTION_IDS.FUNCTIONS"
    :popup-mode="isPopup"
    :show-popout="showPopout"
  >
    <EscritorioGraficasEnhanced
      :popup-mode="isPopup"
      :visible-panels="visiblePanels"
      :show-internal-popouts="false"
      :top-event-limit="topEventLimit"
    />
  </DashboardSectionShell>
</template>

<script setup>
import { computed } from 'vue'
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
const visiblePanels = [DASHBOARD_PANEL_IDS.EVENT_TYPES, DASHBOARD_PANEL_IDS.COVERAGE]
const topEventLimit = computed(() => (isPopup.value ? 999 : 12))
</script>
