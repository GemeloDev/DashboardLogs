<template>
  <div class="no-data-message" :class="{ 'animate-pulse': animated }">
    <div class="no-data-content">
      <q-icon
        :name="icon"
        :size="iconSize"
        :color="iconColor"
        class="no-data-icon"
        :class="{ 'animate-bounce': animated }"
      />
      <div class="no-data-text">
        <h3 class="no-data-title">{{ title }}</h3>
        <p class="no-data-subtitle">{{ subtitle }}</p>
        <p v-if="description" class="no-data-description">{{ description }}</p>
      </div>
      <div v-if="showAction" class="no-data-action">
        <q-btn
          :color="actionColor"
          :icon="actionIcon"
          :label="actionLabel"
          :flat="actionFlat"
          :rounded="actionRounded"
          @click="$emit('action')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No hay datos disponibles',
  },
  subtitle: {
    type: String,
    default: 'No se encontraron registros para mostrar',
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'info',
  },
  iconSize: {
    type: String,
    default: '64px',
  },
  iconColor: {
    type: String,
    default: 'grey-5',
  },
  animated: {
    type: Boolean,
    default: true,
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionLabel: {
    type: String,
    default: 'Reintentar',
  },
  actionIcon: {
    type: String,
    default: 'refresh',
  },
  actionColor: {
    type: String,
    default: 'primary',
  },
  actionFlat: {
    type: Boolean,
    default: true,
  },
  actionRounded: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['action'])
</script>

<style scoped>
.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(30, 30, 47, 0.8) 0%, rgba(40, 40, 60, 0.8) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.no-data-content {
  text-align: center;
  max-width: 400px;
}

.no-data-icon {
  margin-bottom: 24px;
  opacity: 0.7;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.no-data-text {
  color: #ffffff;
}

.no-data-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.no-data-subtitle {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #b0b0b0;
  opacity: 0.9;
}

.no-data-description {
  font-size: 0.95rem;
  color: #909090;
  line-height: 1.5;
  margin-bottom: 24px;
}

.no-data-action {
  margin-top: 24px;
}

/* Animaciones */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* Responsive */
@media (max-width: 600px) {
  .no-data-message {
    min-height: 250px;
    padding: 24px;
  }

  .no-data-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .no-data-title {
    font-size: 1.3rem;
  }

  .no-data-subtitle {
    font-size: 1rem;
  }
}
</style>
