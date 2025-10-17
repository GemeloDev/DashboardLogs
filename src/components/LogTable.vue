<template>
  <q-card dark class="info-card q-pa-md">
    <div class="text-h5 q-mb-sm text-center text-weight-bold q-mt-md q-mb-lg">
      <q-icon name="list" class="q-mr-sm" />
      Dispositivos de Usuarios
    </div>
    <q-item
      v-for="(log, index) in logs"
      :key="index"
      class="q-py-sm device-item"
      style="
        background: rgba(255, 255, 255, 0.1);
        margin-bottom: 6px;
        border-radius: 8px;
        min-height: 40px;
      "
    >
      <q-item-section avatar style="min-width: 32px">
        <q-icon name="smartphone" size="sm" color="white" />
      </q-item-section>
      <q-item-section>
        <div class="text-body2 text-weight-medium text-white">
          {{ log.dispositivo }} | {{ log.usuario }}
        </div>
      </q-item-section>
      <q-item-section side style="padding-left: 8px">
        <q-badge
          color="green"
          :label="`Android ${log.versionAndroidDispositivo}`"
          class="text-weight-bold"
          style="font-size: 0.7rem; min-width: 24px"
        />
      </q-item-section>
      <q-item-section side style="padding-left: 8px">
        <q-badge
          color="blue"
          :label="`${log.fecha}`"
          class="text-weight-bold"
          style="font-size: 0.7rem; min-width: 24px"
        />
      </q-item-section>
      <q-item-section side style="padding-left: 8px">
        <q-badge
          color="orange"
          :label="`${log.tipoEvento}`"
          class="text-weight-bold"
          style="font-size: 0.7rem; min-width: 24px"
        />
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup>
defineProps({ logs: Array })
</script>


<style setup>
/* Items de eventos */
.device-item {
  transition: all 0.2s ease;
}

.device-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.info-card {
  background: linear-gradient(160deg, rgba(33, 102, 130, 1) 50%, rgba(0, 73, 105, 1) 100%);
  border-radius: 16px;
  min-height: 280px;
  height: 500px !important;
  box-shadow: 0 8px 32px #004969;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

/* Mejoras visuales para el contenedor de informacin */
.info-container {
  transition: all 0.3s ease;
}

.info-container:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-2px);
}

/* Mejoras para items de lista */
.device-item {
  transition: all 0.2s ease;
}

.device-item:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .info-card{
    margin: 0% !important;
  }

  .device-item {
    display: flex;
    flex-direction: column;
    min-height: auto !important;
    justify-items: flex-start;
    align-items: flex-start
  }
}
</style>
