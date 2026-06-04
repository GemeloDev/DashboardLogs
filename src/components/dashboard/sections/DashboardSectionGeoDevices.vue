<template>
  <div class="row justify-center" :class="{ 'quintana-roo-map-section--popup': isPopup }">
    <div :class="isPopup ? 'col-12' : 'col-12 col-md-6'">
      <q-card flat bordered class="toplist-card quintana-roo-map-card q-pa-md text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="map" color="primary" size="20px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">{{ t('dashboard.quintanaRooMapTitle') }}</div>
            <div class="toplist-subtitle text-grey-5">
              {{ t('dashboard.quintanaRooMapSubtitle') }}
            </div>
          </div>
          <q-space />
          <DashboardPopoutButton
            v-if="showPopout && !isPopup"
            :section-id="DASHBOARD_SECTION_IDS.GEO_DEVICES"
          />
        </div>
        <QuintanaRooMap />
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardPopoutButton from 'src/components/dashboard/DashboardPopoutButton.vue'
import QuintanaRooMap from 'src/components/blocks/QuintanaRooMap.vue'
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

const { t } = useI18n()
const isPopup = computed(() => props.mode === 'popup')
</script>

<style scoped lang="scss">
.quintana-roo-map-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  overflow: hidden;
  padding: 24px;
}

.quintana-roo-map-section--popup {
  width: 100%;

  .quintana-roo-map-card {
    min-height: calc(100vh - 190px);
  }

  :deep(.qrm-map) {
    height: calc(100vh - 300px);
    min-height: 560px;
  }
}

@media (max-width: 760px) {
  .quintana-roo-map-section--popup {
    .quintana-roo-map-card {
      min-height: calc(100vh - 150px);
    }

    :deep(.qrm-map) {
      height: calc(100vh - 260px);
      min-height: 460px;
    }
  }
}
</style>
