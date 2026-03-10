<template>
  <q-page class="escritorio-page text-white">
    <!-- Header de Escritorio -->
    <header class="escritorio-hero q-px-md q-py-xl">
      <div class="container">
        <div class="text-center">
          <div class="escritorio-title text-h3 text-sm-h3 text-md-h3 text-weight-bold q-mb-sm">
            Dashboard de Escritorio
          </div>

          <div
            class="escritorio-subtitle text-subtitle1 text-sm-h6 text-weight-bold text-blue-3 q-mb-sm"
          >
            Panel de Control Avanzado
          </div>

          <div class="text-h5 q-mt-xs">📊</div>
        </div>
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
</script>

<style lang="scss" scoped>
.escritorio-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* header adaptativo */
.escritorio-hero {
  /* evita que se “salga” y mantiene proporción */
  width: 100%;
  max-width: 100%;
}

/* tu container */
.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* mejora legibilidad y evita saltos feos */
.escritorio-title {
  padding-top: 25px;
  padding-bottom: 15px;
  // line-height: 1.15;
  word-break: break-word;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.18);
}

/* En móvil reduce márgenes/padding un poco */
@media (max-width: 599px) {
  .escritorio-hero {
    padding-top: 25px !important;
    padding-bottom: 20px !important;
  }

  .escritorio-subtitle {
    padding-top: 25px !important;
  }
}
</style>
