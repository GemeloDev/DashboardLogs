<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="mostrarGuia"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      @escape-key="cerrarGuia"
    >
      <q-card class="diagnostic-modal bg-grey text-white">

        <q-card-section class="diagnostic-header bg-gradient-to-r from-grey-8 to-grey-7">
          <div class="row items-center">
          <div class="col">
            <div class="text-h5 diagnostic-title">
              <q-icon name="medical_services" class="q-mr-sm diagnostic-icon" color="cyan-4" />
              🔬 Centro de Diagnóstico Técnico Avanzado
              <q-chip
                v-if="diagnosticoActivo"
                color="cyan-5"
                text-color="white"
                size="md"
                class="q-ml-md diagnostic-chip"
                icon="auto_fix_high"
              >
                <span class="diagnostic-glow">✨ Análisis: {{ diagnosticoActivo }}</span>
              </q-chip>
            </div>
            <div class="text-subtitle2 text-cyan-3 q-mt-sm diagnostic-subtitle">
              🛡️ Sistema de Soporte Técnico en Tiempo Real | 🔍 Análisis de Errores & Sesiones
            </div>

            <!-- Indicadores de Estado -->
            <div class="row q-mt-sm q-gutter-sm">
              <q-chip
                dense
                color="green-6"
                text-color="white"
                icon="wifi"
                class="diagnostic-status-chip"
              >
                🟢 API Conectada
              </q-chip>

              <q-chip
                dense
                color="purple-6"
                text-color="white"
                icon="security"
                class="diagnostic-status-chip"
              >
                🛡️ Modo Seguro
              </q-chip>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              icon="minimize"
              flat
              round
              color="grey-4"
              @click="mostrarAyuda"
              class="q-mr-sm"
            >
              <q-tooltip>Minimizar diagnóstico</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarGuia">
              <q-tooltip>Cerrar diagnóstico</q-tooltip>
            </q-btn>
          </div>
        </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>

import { ref } from 'vue';

const mostrarGuia = ref(false);

const abrirGuia = () => {
  mostrarGuia.value = true;
}

const cerrarGuia = () => {
  mostrarGuia.value = false;
}

defineExpose({
  abrirGuia
})

</script>
