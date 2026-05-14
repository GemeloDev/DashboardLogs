<template>
  <div class="dashboard-section-skeleton" :class="`dashboard-section-skeleton--${variant}`">
    <q-card flat bordered class="dashboard-section-skeleton__card q-pa-lg">
      <div class="row items-start justify-between q-mb-lg">
        <div class="col">
          <q-skeleton type="text" width="210px" height="28px" class="skeleton-line" />
          <q-skeleton type="text" width="300px" height="18px" class="skeleton-line q-mt-xs" />
        </div>
        <q-skeleton type="QBtn" width="34px" height="34px" class="skeleton-line" />
      </div>

      <div v-if="variant === 'functions'" class="dashboard-section-skeleton__functions">
        <div class="dashboard-section-skeleton__grid">
          <q-skeleton
            v-for="item in 6"
            :key="item"
            height="104px"
            class="dashboard-section-skeleton__block"
          />
        </div>
        <q-skeleton height="320px" class="dashboard-section-skeleton__block" />
      </div>

      <div v-else-if="variant === 'toplists'" class="row q-col-gutter-md">
        <div v-for="column in 3" :key="column" class="col-12 col-md-4">
          <q-skeleton height="260px" class="dashboard-section-skeleton__block" />
        </div>
      </div>

      <div v-else-if="variant === 'timeSeries'" class="row q-col-gutter-md">
        <div v-for="column in 3" :key="column" class="col-12 col-md-4">
          <q-skeleton height="260px" class="dashboard-section-skeleton__block" />
        </div>
      </div>

      <div v-else-if="variant === 'severityHttp'" class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-skeleton height="430px" class="dashboard-section-skeleton__block" />
        </div>
        <div class="col-12 col-md-6">
          <q-skeleton height="430px" class="dashboard-section-skeleton__block" />
        </div>
      </div>

      <q-skeleton
        v-else
        :height="variant === 'geoDevices' ? '520px' : '320px'"
        class="dashboard-section-skeleton__block"
      />
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})
</script>

<style scoped lang="scss">
.dashboard-section-skeleton__card {
  color: white;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 34%),
    linear-gradient(145deg, rgba(12, 12, 12, 0.92), rgba(20, 12, 8, 0.88));
}

.dashboard-section-skeleton__functions {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  gap: 22px;
}

.dashboard-section-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.dashboard-section-skeleton__block,
.skeleton-line {
  border-radius: 14px;
  opacity: 0.72;
}

@media (max-width: 900px) {
  .dashboard-section-skeleton__functions {
    grid-template-columns: 1fr;
  }

  .dashboard-section-skeleton__grid {
    grid-template-columns: 1fr;
  }
}
</style>
