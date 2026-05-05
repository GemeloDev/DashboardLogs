<template>
  <q-page class="escritorio-page text-white">
    <!-- Header de Escritorio -->
    <header class="dashboard-header q-py-xl">
      <div class="dashboard-header__wrap">
        <q-card flat bordered class="dashboard-hero__title-card text-white">
        <h1 class="hero-title">
          {{ t('dashboard.titlePageDashboard') }}
          <br />
          <span class="color-orange-santoro">{{ t('dashboard.subtitlePageDashboard') }}</span>
        </h1>
        </q-card>
      </div>
    </header>

    <!-- Contenido Principal: Gráficas Enhanced -->
    <div class="container q-px-md q-pb-xl">
      <DashboardSectionsBoard />
    </div>
  </q-page>
</template>

<script setup>
import DashboardSectionsBoard from 'src/components/dashboard/DashboardSectionsBoard.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.escritorio-page {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.dashboard-header__wrap,
.container {
  width: 100%;
  max-width: min(1400px, 100%);
  min-width: 0;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
}

.dashboard-hero__title-card {
  background: transparent;
}

.hero-title {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

/* En móvil reduce márgenes/padding un poco */
@media (max-width: 599px) {
  .dashboard-header__wrap,
  .container {
    padding-left: 12px;
    padding-right: 12px;
    overflow-x: hidden;
  }

  .dashboard-hero__title-card {
    background: transparent;
  }
}
</style>
