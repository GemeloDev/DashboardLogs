<template>
  <div class="dashboard-section-shell" :class="{ 'dashboard-section-shell--popup': popupMode }">
    <div v-if="canShowPopout" class="dashboard-section-shell__action">
      <DashboardPopoutButton :section-id="sectionId" />
    </div>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import DashboardPopoutButton from 'src/components/dashboard/DashboardPopoutButton.vue'

const props = defineProps({
  sectionId: {
    type: String,
    required: true,
  },
  popupMode: {
    type: Boolean,
    default: false,
  },
  showPopout: {
    type: Boolean,
    default: true,
  },
})

const $q = useQuasar()
const canShowPopout = computed(() => props.showPopout && !$q.platform.is.mobile)
</script>

<style scoped lang="scss">
.dashboard-section-shell {
  position: relative;
}

.dashboard-section-shell__action {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
}

.dashboard-section-shell--popup .dashboard-section-shell__action {
  display: none;
}

@media (max-width: 760px) {
  .dashboard-section-shell__action {
    top: 12px;
    right: 12px;
  }
}
</style>
