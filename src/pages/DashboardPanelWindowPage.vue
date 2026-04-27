<template>
  <div class="dashboard-panel-window text-white">
    <DashboardDataProvider>
      <div class="dashboard-panel-window__shell">
        <section class="dashboard-panel-window__hero">
          <div>
            <div class="dashboard-panel-window__eyebrow">{{ t('dashboard.openWindowLabel') }}</div>
            <h1 class="dashboard-panel-window__title">{{ sectionTitle }}</h1>
            <p class="dashboard-panel-window__subtitle">
              {{ t('dashboard.popupSyncSubtitle') }}
            </p>
          </div>
        </section>

        <ChartDrivenFilters class="q-mb-lg" />

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
    </DashboardDataProvider>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
}

.dashboard-panel-window__eyebrow {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-panel-window__title {
  margin: 10px 0 8px;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.02;
  font-weight: 900;
}

.dashboard-panel-window__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  max-width: 760px;
  line-height: 1.6;
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
}
</style>
