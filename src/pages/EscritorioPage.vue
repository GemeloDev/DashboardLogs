<template>
  <q-page class="escritorio-page bg-dark text-white">
    <!-- Header de Escritorio -->
    <div class="escritorio-header bg-gradient-to-r from-grey-9 to-grey-8 q-pa-lg">
      <div class="container">
        <div class="row items-center q-col-gutter-md q-pt-md">
          <div class="col-12 col-md-8">
            <div class="text-h3 escritorio-title q-pt-lg">
              <span class="escritorio-title-text">🖥️ Dashboard de Escritorio</span>
            </div>
            <div class="text-h6 text-blue-3 escritorio-subtitle q-mb-md">
              <span class="escritorio-subtitle-text"
                >📊 Panel de Control Avanzado | 🎯 Optimizado para Pantallas Grandes</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal: Gráficas Enhanced -->
    <div class="escritorio-content q-pa-lg">
      <EscritorioGraficasEnhanced :filtros="filtros" />
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

.escritorio-header {
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}

.escritorio-title {
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.escritorio-subtitle {
  font-weight: 500;
  opacity: 0.9;
}

.escritorio-content {
  position: relative;
}

.escritorio-actions {
  gap: 0.5rem;
}

.escritorio-action-btn {
  border-radius: 8px;
  font-weight: 600;
}

// Responsive
@media (max-width: 768px) {
  .escritorio-header {
    padding: 1rem !important;
  }

  .escritorio-title {
    text-align: center;
  }

  .escritorio-title-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .escritorio-subtitle {
    font-size: 0.9rem !important;
    text-align: center;
  }

  .escritorio-subtitle-text {
    display: block;
    line-height: 1.3;
  }

  .escritorio-actions {
    justify-content: center !important;
    margin-top: 1rem;
  }

  .escritorio-action-btn {
    min-width: auto;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .escritorio-title-text {
    font-size: 1.5rem;
  }

  .escritorio-subtitle-text {
    font-size: 0.8rem;
  }

  .escritorio-action-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
