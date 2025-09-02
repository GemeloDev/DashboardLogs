<template>
  <q-page class="diagnostic-page">
    <div class="page-container">
      <!-- Header de la página -->
      <div class="page-header q-pa-lg">
        <div class="row items-center">
          <div class="col">
            <h4 class="page-title q-ma-none">
              <q-icon name="bug_report" class="q-mr-md" color="red-5" size="2rem" />
              Centro de Diagnóstico Técnico
            </h4>
            <p class="page-subtitle q-ma-none q-mt-sm text-grey-6">
              Análisis de códigos de error, sesiones y soporte técnico especializado
            </p>
          </div>
          <!-- <div class="col-auto">
            <q-btn
              color="primary"
              icon="dashboard"
              label="Volver al Dashboard"
              @click="$router.push('/logs')"
              outline
            />
          </div> -->
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="page-content q-pa-lg">
        <EscritorioDiagnostico ref="diagnosticoComponent" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import EscritorioDiagnostico from '../components/escritorio/EscritorioDiagnostico.vue'

const route = useRoute()
const diagnosticoComponent = ref(null)

onMounted(() => {
  // Si hay un código en los query params, abrirlo automáticamente
  const codigo = route.query.code || route.query.error || route.query.session

  if (codigo && diagnosticoComponent.value) {
    setTimeout(() => {
      diagnosticoComponent.value.abrirDiagnostico(codigo)
    }, 100)
  } else {
    // Abrir directamente el modal de diagnóstico
    setTimeout(() => {
      diagnosticoComponent.value?.abrirDiagnostico()
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
.diagnostic-page {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.page-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 2rem;
}

.page-subtitle {
  color: #b0b0b0;
  font-size: 1.1rem;
}

.page-content {
  position: relative;
}

@media (max-width: 768px) {
  .page-header {
    .row {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}
</style>
