<template>
  <div class="dashboard-section-shell" :class="{ 'dashboard-section-shell--popup': popupMode }">
    <div v-if="showPopout" class="dashboard-section-shell__action">
      <DashboardPopoutButton :section-id="sectionId" />
    </div>
    <slot />
  </div>
</template>

<script setup>
import DashboardPopoutButton from 'src/components/dashboard/DashboardPopoutButton.vue'

defineProps({
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
