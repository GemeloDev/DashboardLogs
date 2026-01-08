<template>
  <!-- KPI Total de Logs -->
  <q-card
    :class="[
      'kpi-card',
      {
        'gradient-blue': props.tiposDatos === 'todos',
        'gradient-red': props.tiposDatos === 'rechazados',
        'gradient-green': props.tiposDatos === 'emitidos',
        'gradient-cyan': props.tiposDatos === 'enTramite',
        'gradient-orange': props.tiposDatos === 'cancelados',
      },
    ]"
  >
    <q-card-section class="q-pa-lg">
      <div class="kpi-content">
        <div class="kpi-icon-container">
          <q-icon name="analytics" size="36px" class="kpi-icon" />
        </div>
        <div class="kpi-data">
          <div class="kpi-title">Total {{ props.tiposDatos === 'todos' ? '' : props.tiposDatos  }}</div>
          <div class="kpi-value">{{ props.totalLogs }}</div>
          <div class="kpi-subtitle">Último período</div>
        </div>
      </div>
      <q-tooltip>
        <div class="text-body2">
          <div class="text-weight-bold">Total de Logs Registrados</div>
          <div>Click para ver todos los logs</div>
        </div>
      </q-tooltip>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  totalLogs: {
    type: Number,
    required: true,
  },
  tiposDatos: {
    type: String,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
// Estilos para KPIs
.kpi-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.gradient-blue {
    background: linear-gradient(145deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.1) 100%);
    border-color: rgba(33, 150, 243, 0.3);
  }

  &.gradient-green {
    background: linear-gradient(145deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.1) 100%);
    border-color: rgba(76, 175, 80, 0.3);
  }

  &.gradient-red {
    background: linear-gradient(145deg, rgba(244, 67, 54, 0.2) 0%, rgba(211, 47, 47, 0.1) 100%);
    border-color: rgba(244, 67, 54, 0.3);
  }

  &.gradient-orange {
    background: linear-gradient(145deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
    border-color: rgba(255, 152, 0, 0.3);
  }

  &.gradient-cyan {
    background: linear-gradient(145deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 150, 136, 0.1) 100%);
    border-color: rgba(0, 188, 212, 0.3);
  }
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.kpi-icon {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.kpi-data {
  flex: 1;
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

// Responsive para KPIs
@media (max-width: 768px) {
  .kpi-content {
    gap: 12px;
  }

  .kpi-icon-container {
    width: 48px;
    height: 48px;
  }

  .kpi-icon {
    font-size: 24px;
  }

  .kpi-value {
    font-size: 1.5rem;
  }

  .kpi-title {
    font-size: 0.8rem;
  }

  .kpi-subtitle {
    font-size: 0.7rem;
  }
}
</style>
