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
      <EscritorioGraficasEnhanced />
    </div>
  </q-page>
</template>

<script setup>
import EscritorioGraficasEnhanced from '../components/escritorio/EscritorioGraficasEnhanced.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.escritorio-page {
  min-height: 100vh;
}

.dashboard-header__wrap,
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
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
  .dashboard-hero__title-card {
    background: transparent;
  }
}
</style>
