<template>
  <div class="dashboard-sections-board">
    <DashboardSectionRenderer
      v-for="sectionId in sectionOrder"
      :key="sectionId"
      :section-id="sectionId"
      mode="dashboard"
      :show-popout="true"
    />
  </div>
</template>

<script setup>
import DashboardSectionRenderer from './DashboardSectionRenderer.vue'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'

const sectionOrder = [
  DASHBOARD_SECTION_IDS.FUNCTIONS,
  DASHBOARD_SECTION_IDS.ACTIVITY,
  DASHBOARD_SECTION_IDS.TOPLISTS,
  DASHBOARD_SECTION_IDS.STATUS,
  DASHBOARD_SECTION_IDS.SEVERITY_HTTP,
  DASHBOARD_SECTION_IDS.TIME_SERIES,
  DASHBOARD_SECTION_IDS.GEO_DEVICES,
]
</script>

<style scoped lang="scss">
.dashboard-sections-board {
  display: grid;
  gap: 24px;
}
</style>
