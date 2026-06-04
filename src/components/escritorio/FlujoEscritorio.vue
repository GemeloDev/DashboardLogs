<template>
  <div class="flujo-escritorio">
    <!-- KPIs -->

    <!-- Gráficas Mejoradas -->
    <div class="q-mb-lg">
      <EscritorioGraficasEnhanced @detalle="mostrarDetalle" />
    </div>

    <div
      v-if="!dashboardStore.isSectionPopoutOpen(DASHBOARD_SECTION_IDS.GEO_DEVICES)"
      class="row justify-center q-mb-lg"
    >
      <div class="col-12 col-md-6">
        <!-- Mapa de Quintana Roo (al final del panel principal, una sola vez) -->
        <q-card flat bordered class="quintana-roo-map-card q-pa-md text-white">
          <div class="row items-center q-mb-md">
            <q-icon name="map" color="primary" size="20px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-weight-bold">
                {{ t('dashboard.quintanaRooMapTitle') }}
              </div>
              <div class="text-caption text-grey-5">
                {{ t('dashboard.quintanaRooMapSubtitle') }}
              </div>
            </div>
            <q-space />
            <DashboardPopoutButton :section-id="DASHBOARD_SECTION_IDS.GEO_DEVICES" />
          </div>
          <QuintanaRooMap />
        </q-card>
      </div>
    </div>

    <!-- Modal de detalle de gráfica -->
    <EscritorioDetalleModal v-model="modalDetalle" :detalles="detalleSeleccionado" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EscritorioGraficasEnhanced from './EscritorioGraficasEnhanced.vue'
import DashboardPopoutButton from 'src/components/dashboard/DashboardPopoutButton.vue'
import QuintanaRooMap from 'src/components/blocks/QuintanaRooMap.vue'
import { DASHBOARD_SECTION_IDS } from 'src/constants/dashboardSections'
import { useDashboardSharedStore } from 'src/stores/dashboardShared.store'
// import EscritorioConsola from './EscritorioConsola.vue'
import EscritorioDetalleModal from './EscritorioDetalleModal.vue'

const { t } = useI18n()
const dashboardStore = useDashboardSharedStore()
const modalDetalle = ref(false)
const detalleSeleccionado = ref([])

// Función para mostrar detalles de una gráfica
function mostrarDetalle(detalles) {
  console.log('Mostrando detalle:', detalles)
  detalleSeleccionado.value = detalles
  modalDetalle.value = true
}
</script>

<style scoped>
.flujo-escritorio {
  padding: 16px;
}

.q-mb-lg {
  margin-bottom: 32px;
}

.quintana-roo-map-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  overflow: hidden;
  padding: 24px;
}
</style>
