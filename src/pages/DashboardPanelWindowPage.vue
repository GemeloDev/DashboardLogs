<template>
  <div class="dashboard-panel-window text-white">
    <DashboardDataProvider>
      <div class="dashboard-panel-window__shell">
        <section class="dashboard-panel-window__hero">
          <div class="dashboard-panel-window__hero-row">
            <h1 class="dashboard-panel-window__title">{{ sectionTitle }}</h1>
            <q-btn
              flat
              dense
              round
              icon="filter_list"
              class="dashboard-panel-window__filters-btn"
              @click="showFiltersDialog = true"
            >
              <q-tooltip>{{ t('layout.quickFilters') }}</q-tooltip>
            </q-btn>
          </div>
        </section>

        <DashboardSectionRenderer
          v-if="sectionDefinition"
          :section-id="sectionId"
          mode="popup"
          :show-popout="false"
        />

        <q-card v-else flat bordered class="dashboard-panel-window__error text-white q-pa-xl">
          <div class="text-h6 q-mb-sm">{{ t('dashboard.windowUnavailableTitle') }}</div>
          <div class="text-grey-5">{{ t('dashboard.windowUnavailableSubtitle') }}</div>
        </q-card>
      </div>

      <q-dialog
        v-model="showFiltersDialog"
        position="top"
        transition-show="slide-down"
        transition-hide="slide-up"
      >
        <div class="dashboard-panel-window__filters-dialog q-pa-sm">
          <ChartDrivenFilters />
        </div>
      </q-dialog>
    </DashboardDataProvider>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardDataProvider from 'src/components/dashboard/DashboardDataProvider.vue'
import DashboardSectionRenderer from 'src/components/dashboard/DashboardSectionRenderer.vue'
import ChartDrivenFilters from 'src/components/blocks/ChartDrivenFilters.vue'
import { useDashboardSharedStore } from 'src/stores/dashboardShared.store'
import {
  getDashboardSectionDefinition,
  getDashboardSectionIdFromPanel,
} from 'src/constants/dashboardSections'

const route = useRoute()
const { t } = useI18n()
const dashboardStore = useDashboardSharedStore()
const showFiltersDialog = ref(false)

const sectionId = computed(() => {
  const directSection = String(route.params.section || '').trim()
  if (directSection) return directSection

  const legacyPanel = String(route.params.panel || '').trim()
  return getDashboardSectionIdFromPanel(legacyPanel) || ''
})

const sectionDefinition = computed(() => getDashboardSectionDefinition(sectionId.value))
const sectionTitle = computed(() =>
  sectionDefinition.value
    ? t(sectionDefinition.value.titleKey)
    : t('dashboard.windowUnavailableTitle'),
)

function markCurrentSectionClosed() {
  if (!sectionDefinition.value) return
  dashboardStore.markSectionPopoutClosed(sectionId.value)
}

onMounted(() => {
  if (!sectionDefinition.value) return
  dashboardStore.markSectionPopoutOpen(sectionId.value)
  window.addEventListener('beforeunload', markCurrentSectionClosed)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', markCurrentSectionClosed)
  markCurrentSectionClosed()
})
</script>

<style scoped lang="scss">
.dashboard-panel-window {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 22%),
    radial-gradient(circle at top right, rgba(233, 113, 50, 0.12), transparent 28%),
    linear-gradient(180deg, #050505 0%, #0d0705 100%);
}

.dashboard-panel-window__shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 28px 24px 32px;
}

.dashboard-panel-window__hero {
  margin-bottom: 24px;
  padding: 26px 28px;
  border-radius: 24px;
}

.dashboard-panel-window__hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-panel-window__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.02;
  font-weight: 900;
}

.q-dialog__inner--minimized > div {
  max-width: 900px;
}

.dashboard-panel-window__filters-btn {
  color: #86efac;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(233, 113, 50, 0.12);
}

.dashboard-panel-window__filters-dialog {
  width: min(1900px, 99vw);
  max-height: calc(100vh - 80px);
  overflow: auto;
}

.dashboard-panel-window__error {
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
}

@media (max-width: 760px) {
  .dashboard-panel-window__shell {
    padding: 18px 14px 24px;
  }

  .dashboard-panel-window__hero {
    padding: 20px;
    border-radius: 20px;
  }

  .dashboard-panel-window__hero-row {
    align-items: flex-start;
  }
}
</style>
