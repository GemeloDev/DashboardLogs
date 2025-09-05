<template>
  <div class="santoro-voice-controls">
    <!-- Botón principal de voz -->
    <q-btn
      :icon="estadoVoz.escuchando ? 'mic' : 'mic_none'"
      :color="estadoVoz.escuchando ? 'red' : 'primary'"
      :loading="inicializando"
      round
      glossy
      :class="{
        'pulse-animation': estadoVoz.escuchando,
        'speaking-animation': estadoVoz.hablando,
      }"
      @click="alternarEscucha"
      :disable="!estadoVoz.escuchandoDisponible || !estadoVoz.permisos"
      size="md"
    >
      <q-tooltip>
        {{ estadoVoz.escuchando ? 'Clic para dejar de escuchar' : 'Clic para activar micrófono' }}
      </q-tooltip>
    </q-btn>

    <!-- Botón de silenciar -->
    <q-btn
      v-if="estadoVoz.hablando"
      icon="volume_off"
      color="orange"
      round
      flat
      size="sm"
      @click="silenciar"
      class="q-ml-xs"
    >
      <q-tooltip>Silenciar Santoro</q-tooltip>
    </q-btn>

    <!-- Botón de control de voz automática -->
    <q-btn
      :icon="estadoVoz.vozAutomaticaActivada ? 'record_voice_over' : 'voice_over_off'"
      :color="estadoVoz.vozAutomaticaActivada ? 'green' : 'grey'"
      round
      flat
      size="sm"
      @click="alternarVozAutomatica"
      class="q-ml-xs"
    >
      <q-tooltip>
        {{
          estadoVoz.vozAutomaticaActivada
            ? 'Desactivar respuestas automáticas de voz'
            : 'Activar respuestas automáticas de voz'
        }}
      </q-tooltip>
    </q-btn>

    <!-- Indicador de estado -->
    <div class="voice-status-indicator q-mt-xs">
      <div v-if="estadoVoz.escuchando" class="status-text listening">🎤 Escuchando...</div>
      <div v-else-if="estadoVoz.hablando" class="status-text speaking">🗣️ Hablando...</div>
      <div v-else-if="!estadoVoz.escuchandoDisponible" class="status-text unavailable">
        ⚠️ Voz no disponible
      </div>
      <div v-else-if="!estadoVoz.permisos" class="status-text no-permissions">
        🔒 Sin permisos de micrófono
      </div>
      <div v-else class="status-text ready">✅ Listo para escuchar</div>
    </div>

    <!-- Panel de configuración de voz -->
    <q-expansion-item
      v-if="mostrarConfiguracion"
      icon="settings"
      label="Configuración de Voz"
      dense
      class="q-mt-sm voice-config-panel"
    >
      <!-- Volumen -->
      <div class="config-section">
        <label class="config-label">🔊 Volumen:</label>
        <q-slider
          v-model="configuracion.volumen"
          :min="0"
          :max="1"
          :step="0.1"
          @update:model-value="actualizarConfiguracion"
          color="primary"
          class="q-mb-sm"
        />
      </div>

      <!-- Velocidad -->
      <div class="config-section">
        <label class="config-label">⚡ Velocidad:</label>
        <q-slider
          v-model="configuracion.velocidad"
          :min="0.5"
          :max="2"
          :step="0.1"
          @update:model-value="actualizarConfiguracion"
          color="primary"
          class="q-mb-sm"
        />
      </div>

      <!-- Tono -->
      <div class="config-section">
        <label class="config-label">🎵 Tono:</label>
        <q-slider
          v-model="configuracion.tono"
          :min="0.5"
          :max="2"
          :step="0.1"
          @update:model-value="actualizarConfiguracion"
          color="primary"
          class="q-mb-sm"
        />
      </div>

      <!-- Selector de voz -->
      <div class="config-section" v-if="vocesDisponibles.length > 0">
        <label class="config-label">🎭 Voz:</label>
        <q-select
          v-model="configuracion.vozSeleccionada"
          :options="vocesDisponibles"
          option-label="name"
          option-value="name"
          emit-value
          map-options
          @update:model-value="cambiarVoz"
          dense
          class="q-mb-sm"
        />
      </div>

      <!-- Botón de prueba -->
      <q-btn
        label="🧪 Probar Voz"
        color="secondary"
        size="sm"
        @click="probarVoz"
        :loading="probando"
        class="full-width"
      />
    </q-expansion-item>

    <!-- Visualizador de ondas de sonido (opcional) -->
    <div v-if="estadoVoz.escuchando && mostrarVisualizador" class="voice-visualizer q-mt-sm">
      <div class="sound-wave">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { santoroVoiceService } from '../services/santoroVoiceService.js'

// Props
defineProps({
  mostrarConfiguracion: {
    type: Boolean,
    default: false,
  },
  mostrarVisualizador: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['texto-reconocido', 'inicio-escucha', 'fin-escucha', 'error-voz'])

// Estado reactivo
const inicializando = ref(true)
const probando = ref(false)
const estadoVoz = reactive({})
const vocesDisponibles = ref([])

// Configuración
const configuracion = reactive({
  volumen: 0.8,
  velocidad: 1.0,
  tono: 1.0,
  vozSeleccionada: null,
  idioma: 'es-ES',
  continuo: false,
})

// 🚀 INICIALIZAR componente
onMounted(async () => {
  console.log('🎤 Inicializando controles de voz...')

  try {
    // Esperar a que el servicio se inicialice
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Obtener estado actual
    actualizarEstado()

    // Obtener voces disponibles
    vocesDisponibles.value = santoroVoiceService.obtenerVoces()

    // Configurar callbacks
    configurarCallbacks()

    inicializando.value = false
  } catch (error) {
    console.error('❌ Error inicializando controles de voz:', error)
    inicializando.value = false
  }
})

// 📊 ACTUALIZAR estado desde el servicio
function actualizarEstado() {
  const estado = santoroVoiceService.obtenerEstado()
  Object.assign(estadoVoz, estado)
}

// 📞 CONFIGURAR callbacks del servicio
function configurarCallbacks() {
  // Callback para texto reconocido
  santoroVoiceService.configurarCallbacks({
    onResult: (texto) => {
      console.log('🗣️ Texto reconocido:', texto)
      emit('texto-reconocido', texto)
    },
    onError: (error) => {
      console.error('❌ Error de voz:', error)
      emit('error-voz', error)
    },
    onStart: () => {
      console.log('🎧 Iniciando escucha...')
      emit('inicio-escucha')
    },
    onEnd: () => {
      console.log('🛑 Fin de escucha')
      emit('fin-escucha')
    },
  })

  // Callbacks adicionales para actualizar estado
  santoroVoiceService.registrarCallback('inicio_escucha', actualizarEstado)
  santoroVoiceService.registrarCallback('fin_escucha', actualizarEstado)
  santoroVoiceService.registrarCallback('inicio_habla', actualizarEstado)
  santoroVoiceService.registrarCallback('fin_habla', actualizarEstado)
}

// 🎤 ALTERNAR escucha
async function alternarEscucha() {
  if (!estadoVoz.escuchandoDisponible || !estadoVoz.permisos) {
    console.warn('⚠️ Funcionalidad de voz no disponible')
    return
  }

  if (estadoVoz.escuchando) {
    // Detener escucha
    santoroVoiceService.detenerEscucha()
  } else {
    // Iniciar escucha
    const exito = await santoroVoiceService.iniciarEscucha()
    if (!exito) {
      console.error('❌ No se pudo iniciar la escucha')
    }
  }

  actualizarEstado()
}

// 🔇 SILENCIAR síntesis
function silenciar() {
  santoroVoiceService.silenciar()
  actualizarEstado()
}

// 🔊 ALTERNAR voz automática
function alternarVozAutomatica() {
  const estado = santoroVoiceService.alternarVozAutomatica()
  actualizarEstado()

  // Emitir evento para notificar al componente padre
  emit('voz-automatica-cambiada', estado)

  // Mostrar notificación
  if (estado) {
    console.log('🔊 Voz automática activada - Santoro hablará automáticamente')
  } else {
    console.log('🔇 Voz automática desactivada - Santoro solo escribirá')
  }
}

// ⚙️ ACTUALIZAR configuración
function actualizarConfiguracion() {
  santoroVoiceService.configurar({
    volumen: configuracion.volumen,
    velocidad: configuracion.velocidad,
    tono: configuracion.tono,
    idioma: configuracion.idioma,
    continuo: configuracion.continuo,
  })
}

// 🎭 CAMBIAR voz
function cambiarVoz(nombreVoz) {
  const exito = santoroVoiceService.cambiarVoz(nombreVoz)
  if (exito) {
    console.log('✅ Voz cambiada a:', nombreVoz)
  }
}

// 🧪 PROBAR voz
async function probarVoz() {
  probando.value = true
  try {
    const resultados = await santoroVoiceService.probarVoz()
    console.log('🧪 Resultados prueba:', resultados)

    if (!resultados.sintesis) {
      // Fallback si no funciona la síntesis
      console.warn('⚠️ Síntesis no funcionó')
    }
  } catch (error) {
    console.error('❌ Error probando voz:', error)
  } finally {
    probando.value = false
  }
}

// 🗣️ HABLAR (método expuesto)
async function hablar(texto, opciones = {}) {
  return await santoroVoiceService.hablar(texto, opciones)
}

// 💬 INICIAR conversación
async function iniciarConversacion() {
  return await santoroVoiceService.iniciarConversacion()
}

// Watch para actualizar estado periódicamente
watch(
  () => estadoVoz.escuchando,
  () => {
    actualizarEstado()
  },
  { flush: 'post' }
)

// Exponer métodos para el componente padre
defineExpose({
  hablar,
  alternarEscucha,
  silenciar,
  iniciarConversacion,
  actualizarEstado,
})
</script>

<style lang="scss" scoped>
.santoro-voice-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;

  // Animación de pulso para micrófono activo
  .pulse-animation {
    animation: pulse 1.5s ease-in-out infinite alternate;
  }

  // Animación para cuando está hablando
  .speaking-animation {
    animation: speaking 0.8s ease-in-out infinite alternate;
  }

  // Indicador de estado
  .voice-status-indicator {
    text-align: center;

    .status-text {
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;

      &.listening {
        color: #d32f2f;
        background: rgba(211, 47, 47, 0.1);
      }

      &.speaking {
        color: #1976d2;
        background: rgba(25, 118, 210, 0.1);
      }

      &.ready {
        color: #388e3c;
        background: rgba(56, 142, 60, 0.1);
      }

      &.unavailable,
      &.no-permissions {
        color: #f57c00;
        background: rgba(245, 124, 0, 0.1);
      }
    }
  }

  // Panel de configuración
  .voice-config-panel {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;

    .config-section {
      margin-bottom: 12px;

      .config-label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #fff;
        margin-bottom: 4px;
      }
    }
  }

  // Visualizador de ondas de sonido
  .voice-visualizer {
    width: 100%;

    .sound-wave {
      display: flex;
      justify-content: center;
      align-items: end;
      gap: 3px;
      height: 30px;

      .wave-bar {
        width: 4px;
        background: linear-gradient(to top, #1976d2, #42a5f5);
        border-radius: 2px;
        animation: wave 1.2s ease-in-out infinite;

        &:nth-child(1) {
          animation-delay: 0s;
        }
        &:nth-child(2) {
          animation-delay: 0.1s;
        }
        &:nth-child(3) {
          animation-delay: 0.2s;
        }
        &:nth-child(4) {
          animation-delay: 0.1s;
        }
        &:nth-child(5) {
          animation-delay: 0s;
        }
      }
    }
  }
}

// Animaciones
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7);
  }
  100% {
    box-shadow: 0 0 0 15px rgba(211, 47, 47, 0);
  }
}

@keyframes speaking {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
}

@keyframes wave {
  0%,
  100% {
    height: 6px;
  }
  50% {
    height: 20px;
  }
}

// Responsive
@media (max-width: 600px) {
  .santoro-voice-controls {
    .voice-config-panel {
      font-size: 12px;
    }
  }
}
</style>
