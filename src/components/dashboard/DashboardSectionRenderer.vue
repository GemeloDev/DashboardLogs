<template>
  <component
    :is="resolvedComponent"
    v-if="resolvedComponent"
    :mode="mode"
    :show-popout="showPopout"
  />
</template>

<script setup>
import { computed } from 'vue'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'
import DashboardSectionFunctions from './sections/DashboardSectionFunctions.vue'
import DashboardSectionActivity from './sections/DashboardSectionActivity.vue'
import DashboardSectionToplists from './sections/DashboardSectionToplists.vue'
import DashboardSectionStatus from './sections/DashboardSectionStatus.vue'
import DashboardSectionSeverityHttp from './sections/DashboardSectionSeverityHttp.vue'
import DashboardSectionTimeSeries from './sections/DashboardSectionTimeSeries.vue'
import DashboardSectionGeoDevices from './sections/DashboardSectionGeoDevices.vue'

const props = defineProps({
  sectionId: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: 'dashboard',
  },
  showPopout: {
    type: Boolean,
    default: true,
  },
})

const componentBySection = {
  [DASHBOARD_SECTION_IDS.FUNCTIONS]: DashboardSectionFunctions,
  [DASHBOARD_SECTION_IDS.ACTIVITY]: DashboardSectionActivity,
  [DASHBOARD_SECTION_IDS.TOPLISTS]: DashboardSectionToplists,
  [DASHBOARD_SECTION_IDS.STATUS]: DashboardSectionStatus,
  [DASHBOARD_SECTION_IDS.SEVERITY_HTTP]: DashboardSectionSeverityHttp,
  [DASHBOARD_SECTION_IDS.TIME_SERIES]: DashboardSectionTimeSeries,
  [DASHBOARD_SECTION_IDS.GEO_DEVICES]: DashboardSectionGeoDevices,
}

const resolvedComponent = computed(() => componentBySection[props.sectionId] || null)
</script>
