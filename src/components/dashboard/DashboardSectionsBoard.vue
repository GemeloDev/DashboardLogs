<template>
  <div class="dashboard-sections-board">
    <DashboardSectionRenderer
      v-for="sectionId in visibleSectionOrder"
      :key="sectionId"
      :section-id="sectionId"
      mode="dashboard"
      :show-popout="true"
    />

    <div class="row justify-center">
      <div class="col-12 col-md-6">
        <!-- Mapa de Quintana Roo (al final del panel principal, una sola vez) -->
        <q-card flat bordered class="toplist-card quintana-roo-map-card q-pa-md text-white">
          <div class="row items-center q-mb-md">
            <q-icon name="map" color="primary" size="20px" class="q-mr-sm" />
            <div>
              <div class="toplist-title">{{ t('dashboard.quintanaRooMapTitle') }}</div>
              <div class="toplist-subtitle text-grey-5">
                {{ t('dashboard.quintanaRooMapSubtitle') }}
              </div>
            </div>
          </div>
          <QuintanaRooMap />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardSectionRenderer from './DashboardSectionRenderer.vue'
import QuintanaRooMap from 'src/components/blocks/QuintanaRooMap.vue'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'
import { useDashboardSharedStore } from 'src/stores/dashboardShared.store'

const { t } = useI18n()
const dashboardStore = useDashboardSharedStore()

const sectionOrder = [
  DASHBOARD_SECTION_IDS.FUNCTIONS,
  DASHBOARD_SECTION_IDS.ACTIVITY,
  DASHBOARD_SECTION_IDS.TOPLISTS,
  DASHBOARD_SECTION_IDS.STATUS,
  DASHBOARD_SECTION_IDS.SEVERITY_HTTP,
  DASHBOARD_SECTION_IDS.TIME_SERIES,
  DASHBOARD_SECTION_IDS.GEO_DEVICES,
]

const visibleSectionOrder = computed(() =>
  sectionOrder.filter((sectionId) => !dashboardStore.isSectionPopoutOpen(sectionId)),
)
</script>

<style scoped lang="scss">
.dashboard-sections-board {
  display: grid;
  gap: 24px;
}

.quintana-roo-map-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  overflow: hidden;
  padding: 24px;
}
</style>
