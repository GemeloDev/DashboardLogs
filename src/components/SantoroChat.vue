<!-- 🚀 SANTORO AI ASSISTANT - Next Generation Interface -->
<template>
  <div class="santoro-container">
    <!-- AI Assistant FAB - Futuristic Design -->
    <q-fab
      v-if="!chatAbierto"
      color="primary"
      icon="psychology"
      direction="up"
      class="santoro-ai-fab"
      @click="abrirChat"
    >
      <div class="santoro-ai-pulse"></div>
      <q-tooltip class="bg-primary text-white text-weight-medium">
        🧠 Santoro AI Assistant
      </q-tooltip>
    </q-fab>

    <!-- AI Chat Interface - Glassmorphism Design -->
    <q-card v-if="chatAbierto" class="santoro-ai-window">
      <!-- Compact Neural Header -->
      <div class="santoro-compact-header">
        <!-- AI Identity -->
        <div class="santoro-ai-identity">
          <div class="santoro-brain-mini">
            <q-icon name="psychology" class="brain-icon-mini" />
          </div>
          <div class="ai-info">
            <div class="santoro-ai-name">Santoro IA</div>
            <div class="ai-status">
              <div class="status-dot"></div>
              <span>En línea</span>
            </div>
          </div>
        </div>

        <!-- Control Matrix -->
        <div class="santoro-control-matrix">
          <!-- Voice Neural Link -->
          <SantoroVoiceControls
            ref="voiceControlsRef"
            @texto-reconocido="procesarTextoVoz"
            @inicio-escucha="onInicioEscucha"
            @fin-escucha="onFinEscucha"
            @error-voz="onErrorVoz"
            :mostrar-configuracion="false"
            :mostrar-visualizador="false"
            class="neural-control"
          />

          <!-- System Controls -->
          <q-btn icon="tune" flat round size="sm" class="neural-btn" @click="mostrarConfigApiKey">
            <q-tooltip>Configurar API</q-tooltip>
          </q-btn>

          <q-btn
            icon="fullscreen_exit"
            flat
            round
            size="sm"
            class="neural-btn"
            @click="minimizarChat"
          >
            <q-tooltip>Minimizar</q-tooltip>
          </q-btn>

          <q-btn
            icon="close"
            flat
            round
            size="sm"
            class="neural-btn neural-close"
            @click="cerrarChat"
          >
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Neural Communication Stream -->
      <div class="santoro-neural-stream" ref="mensajesContainer">
        <!-- AI Initialization Message -->
        <div v-if="mensajes.length === 0" class="neural-init-message">
          <div class="ai-welcome-container">
            <div class="ai-core-animation">
              <div class="core-ring ring-1"></div>
              <div class="core-ring ring-2"></div>
              <div class="core-ring ring-3"></div>
              <q-icon name="psychology" class="core-icon" />
            </div>
            <div class="ai-welcome-text">
              <h3 class="neural-title">Santoro IA Inicializado</h3>
              <p class="neural-subtitle">Inteligencia Avanzada Lista</p>
              <div class="capabilities-matrix">
                <div class="capability-node">
                  <q-icon name="search" />
                  <span>Análisis de Errores</span>
                </div>
                <div class="capability-node">
                  <q-icon name="analytics" />
                  <span>Insights de Datos</span>
                </div>
                <div class="capability-node">
                  <q-icon name="filter_alt" />
                  <span>Filtrado Inteligente</span>
                </div>
                <div class="capability-node">
                  <q-icon name="auto_fix_high" />
                  <span>Acciones Automáticas</span>
                </div>
              </div>
              <div class="interaction-modes">
                <div class="mode-indicator">
                  <q-icon name="keyboard" />
                  <span>Texto</span>
                </div>
                <div class="mode-indicator active">
                  <q-icon name="record_voice_over" />
                  <span>Voz</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Stream -->
        <div
          v-for="(mensaje, index) in mensajes"
          :key="index"
          :class="['neural-message', mensaje.tipo === 'usuario' ? 'user-neural' : 'ai-neural']"
        >
          <!-- Neural Avatar -->
          <div class="neural-avatar">
            <div class="avatar-core">
              <q-icon
                :name="mensaje.tipo === 'usuario' ? 'person' : 'psychology'"
                :class="mensaje.tipo === 'usuario' ? 'user-icon' : 'ai-icon'"
              />
            </div>
            <div class="neural-pulse"></div>
          </div>

          <!-- Message Container -->
          <div class="neural-bubble">
            <!-- Message Content -->
            <div class="neural-content" v-html="mensaje.texto"></div>

            <!-- Action Quantum Buttons -->
            <div v-if="mensaje.acciones && mensaje.acciones.length > 0" class="quantum-actions">
              <q-btn
                v-for="accion in mensaje.acciones"
                :key="accion"
                unelevated
                dense
                class="quantum-btn"
                :label="formatearAccion(accion)"
                @click="ejecutarAccion(accion)"
              >
                <div class="quantum-glow"></div>
              </q-btn>
            </div>

            <!-- Neural Timestamp -->
            <div class="neural-timestamp">{{ mensaje.hora }}</div>
          </div>
        </div>

        <!-- AI Thinking Animation -->
        <div v-if="santoroEscribiendo" class="ai-thinking">
          <div class="neural-avatar">
            <div class="avatar-core">
              <q-icon name="psychology" class="ai-icon" />
            </div>
            <div class="neural-pulse active"></div>
          </div>
          <div class="neural-bubble thinking">
            <div class="thought-waves">
              <div class="thought-wave wave-a"></div>
              <div class="thought-wave wave-b"></div>
              <div class="thought-wave wave-c"></div>
            </div>
            <div class="thinking-text">Procesando patrones neurales...</div>
          </div>
        </div>
      </div>

      <!-- Neural Input Interface - Clean & Elegant -->
      <div class="neural-input-zone">
        <!-- Input Matrix -->
        <div class="input-matrix">
          <!-- Text Input Container -->
          <div class="neural-input-container">
            <q-input
              ref="inputTexto"
              v-model="mensajeTexto"
              placeholder="💬 Escribe tu mensaje aquí..."
              filled
              dark
              @keyup.enter="enviarMensaje"
              :disable="santoroEscribiendo"
              class="neural-text-input"
              input-class="neural-input-field"
              bg-color="grey-9"
              color="white"
              label-color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="edit" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Send Button -->
          <div class="neural-send-container">
            <q-btn
              round
              unelevated
              :color="mensajeTexto.trim() ? 'primary' : 'grey-7'"
              icon="send"
              size="md"
              @click="enviarMensaje"
              :disable="!mensajeTexto.trim() || santoroEscribiendo"
              class="neural-send-btn"
            >
              <div class="send-neural-glow"></div>
              <div class="send-pulse-ring"></div>
            </q-btn>
          </div>
        </div>

        <!-- Voice Status Indicator -->
        <div v-if="escuchandoVoz" class="voice-neural-status">
          <div class="voice-wave-container">
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
          </div>
          <div class="voice-status-text">
            <q-icon name="mic" />
            <span>Escuchando...</span>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import santoroAI from '../services/santoroAI.js'
import santoroActionController from '../services/santoroActionController.js'
import SantoroVoiceControls from './SantoroVoiceControls.vue'

// 📱 Estado del Chat
const chatAbierto = ref(false)
const mensajes = ref([])
const mensajeTexto = ref('')
const santoroEscribiendo = ref(false)
const escuchandoVoz = ref(false)
const esMobile = ref(false)

// 📚 Referencias DOM
const mensajesContainer = ref(null)
const inputTexto = ref(null)
const voiceControlsRef = ref(null)

// 🎤 Speech Recognition (legacy - ahora usa el servicio)
let recognition = null

// � Detectar responsive
const detectarDispositivo = () => {
  esMobile.value = window.innerWidth <= 768
}

// 🎧 Listener para resize
const onResize = () => {
  detectarDispositivo()
  // Si se cambia a mobile y hay modal abierto, cerrarlo
  if (esMobile.value && chatAbierto.value) {
    console.log('📱 Detectado cambio a móvil, ajustando interfaz...')
  }
}

// �🚀 MÉTODOS PRINCIPALES

// Abrir chat
const abrirChat = () => {
  chatAbierto.value = true
  nextTick(() => {
    // Enfocar el input principal
    if (inputTexto.value) {
      console.log('🔍 Debug: Input encontrado, enfocando...')
      enfocarInput()
    }
  })
}

// Cerrar chat
const cerrarChat = () => {
  chatAbierto.value = false
  mensajeTexto.value = ''
  if (recognition) {
    recognition.stop()
    escuchandoVoz.value = false
  }
  // Asegurar que se cierre completamente
  console.log('🔒 Chat cerrado completamente')
}

// Minimizar chat
const minimizarChat = () => {
  chatAbierto.value = false
  console.log('📱 Chat minimizado')
  chatAbierto.value = false
}

// Re-enfocar input de texto
const enfocarInput = () => {
  nextTick(() => {
    if (inputTexto.value && chatAbierto.value) {
      try {
        inputTexto.value.focus()
        console.log('✅ Input enfocado correctamente')
      } catch (error) {
        console.warn('⚠️ Error enfocando input:', error)
      }
    }
  })
}

// 💬 Enviar mensaje
const enviarMensaje = async () => {
  if (!mensajeTexto.value.trim()) return

  // Agregar mensaje del usuario
  const mensajeUsuario = {
    tipo: 'usuario',
    texto: mensajeTexto.value,
    hora: new Date().toLocaleTimeString(),
  }
  mensajes.value.push(mensajeUsuario)

  // Limpiar input
  const pregunta = mensajeTexto.value
  mensajeTexto.value = ''

  // Scroll hacia abajo
  await scrollHaciaAbajo()

  // Santoro "está escribiendo"
  santoroEscribiendo.value = true

  try {
    // 🤖 Procesar con Santoro IA
    const respuesta = await santoroAI.procesarPregunta(pregunta, {
      pagina: 'diagnostico',
      usuario: 'actual',
    })

    // Simular delay de escritura (más realista)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Agregar respuesta de Santoro
    const textoRespuesta =
      typeof respuesta.respuesta === 'string'
        ? respuesta.respuesta
        : respuesta.mensaje || 'Acción ejecutada correctamente'

    const mensajeSantoro = {
      tipo: 'bot',
      texto: textoRespuesta,
      acciones: Array.isArray(respuesta.acciones)
        ? respuesta.acciones.map((acc) => acc.accion || acc.tipo || acc)
        : [],
      datos: respuesta.datos,
      hora: new Date().toLocaleTimeString(),
    }
    mensajes.value.push(mensajeSantoro)

    // 🗣️ Hacer que Santoro hable su respuesta (FORZADO para depuración)
    setTimeout(async () => {
      if (voiceControlsRef.value) {
        const estadoVoz = voiceControlsRef.value.estadoVoz
        console.log('🔊 Estado de voz automática:', {
          disponible: !!estadoVoz,
          vozAutomaticaActivada: estadoVoz?.vozAutomaticaActivada,
          responderConVoz: estadoVoz?.responderConVoz,
          vozDisponible: estadoVoz?.vozDisponible,
        })

        // ACTIVAR VOZ AUTOMÁTICA SI NO ESTÁ ACTIVADA
        if (estadoVoz && !estadoVoz.vozAutomaticaActivada) {
          console.log('🔧 Activando voz automática...')
          voiceControlsRef.value.activarVozAutomatica()
        }

        // HABLAR SIEMPRE (para depuración)
        console.log('🗣️ Forzando habla de Santoro...')
        await hablarRespuesta(textoRespuesta)
      }
    }, 500) // Pequeño delay para que se muestre el mensaje primero
  } catch (error) {
    console.error('Error procesando mensaje:', error)

    // Mensaje de error amigable
    const mensajeError = {
      tipo: 'bot',
      texto: 'Ups, tuve un pequeño problema. ¿Puedes intentar de nuevo?',
      hora: new Date().toLocaleTimeString(),
    }
    mensajes.value.push(mensajeError)
  }

  santoroEscribiendo.value = false
  await scrollHaciaAbajo()

  // Re-enfocar el input para permitir escritura continua
  enfocarInput()
}

// 🎤 MÉTODOS DE VOZ MEJORADOS

// Procesar texto reconocido por voz
const procesarTextoVoz = (texto) => {
  console.log('🎤 Texto reconocido por voz:', texto)
  mensajeTexto.value = texto

  // Procesar automáticamente después de un segundo
  setTimeout(() => {
    if (mensajeTexto.value.trim()) {
      console.log('🚀 Auto-procesando mensaje de voz:', mensajeTexto.value)
      enviarMensaje()
    }
  }, 1000) // Esperar 1 segundo antes de procesar
}

// Inicio de escucha
const onInicioEscucha = () => {
  escuchandoVoz.value = true
  console.log('🎧 Iniciando escucha de voz...')
}

// Fin de escucha
const onFinEscucha = () => {
  escuchandoVoz.value = false
  console.log('🛑 Fin de escucha de voz - procesando en 1 segundo...')
}

// Error de voz
const onErrorVoz = (error) => {
  console.error('❌ Error de voz:', error)
  escuchandoVoz.value = false

  // Mostrar mensaje de error amigable
  const mensajeError = {
    tipo: 'santoro',
    texto:
      '⚠️ Hubo un problema con el reconocimiento de voz. Intenta de nuevo o escribe tu pregunta.',
    hora: new Date().toLocaleTimeString(),
    acciones: [],
  }
  mensajes.value.push(mensajeError)
}

// Hablar respuesta de Santoro
const hablarRespuesta = async (texto) => {
  console.log('🎤 hablarRespuesta iniciada con:', texto?.substring(0, 50) + '...')

  if (!voiceControlsRef.value) {
    console.error('❌ voiceControlsRef no está disponible')
    return
  }

  try {
    // Limpiar texto de emojis y caracteres especiales para mejor síntesis
    const textoLimpio = texto
      .replace(/🤖|💡|🔍|📊|🏥|⚡|🎯|🔧|📈|📋|⚠️|🧭|🔄|🏷️|🗣️|🎤|🛑|✅|❌/gu, '')
      .replace(/\*\*/g, '')
      .replace(/\n/g, ' ')
      .trim()

    console.log('🗣️ Santoro intentará hablar:', textoLimpio.substring(0, 100) + '...')

    // Verificar estado del servicio de voz
    const estadoVoz = voiceControlsRef.value.estadoVoz
    console.log('🔊 Estado del servicio de voz:', {
      vozDisponible: estadoVoz?.vozDisponible,
      hablando: estadoVoz?.hablando,
      vozConfigurada: estadoVoz?.vozConfigurada?.name,
    })

    const resultado = await voiceControlsRef.value.hablar(textoLimpio)
    console.log('🎯 Resultado de hablar:', resultado)
  } catch (error) {
    console.error('❌ Error en hablarRespuesta:', error)
  }
}

// ⚡ Ejecutar acción sugerida
const ejecutarAccion = async (accion) => {
  console.log('🚀 Ejecutando acción:', accion)

  // Mostrar que Santoro está procesando
  santoroEscribiendo.value = true

  try {
    // Obtener el último mensaje con datos
    const ultimoMensaje = mensajes.value
      .slice()
      .reverse()
      .find((m) => m.tipo === 'bot' && m.datos)

    const datos = ultimoMensaje?.datos
    const parametros = { origen: 'chat_santoro' }

    // 🎯 EJECUTAR ACCIÓN REAL EN LA UI
    const tipoAccion = typeof accion === 'string' ? accion : accion.accion || accion.tipo
    const resultado = await santoroActionController.ejecutarAccion(tipoAccion, parametros, datos)

    // Agregar respuesta sobre la acción ejecutada
    const mensajeRespuesta = {
      tipo: 'bot',
      texto: resultado.mensaje,
      accionEjecutada: resultado.accionEjecutada,
      hora: new Date().toLocaleTimeString(),
      // Si la acción generó nuevas acciones disponibles
      acciones: resultado.accionesDisponibles || [],
    }

    mensajes.value.push(mensajeRespuesta)

    // Si hay datos adicionales, ofrecerlos
    if (resultado.datosAdicionales) {
      setTimeout(() => {
        const mensajeSeguimiento = {
          tipo: 'bot',
          texto: '¿Te gustaría ver más detalles o realizar otra acción?',
          acciones: ['ver_mas_detalles', 'nueva_busqueda', 'exportar_resultados'],
          hora: new Date().toLocaleTimeString(),
        }
        mensajes.value.push(mensajeSeguimiento)
        scrollHaciaAbajo()
      }, 1000)
    }
  } catch (error) {
    console.error('Error ejecutando acción:', error)

    const mensajeError = {
      tipo: 'bot',
      texto: `Hubo un problema ejecutando "${formatearAccion(
        accion
      )}". ¿Quieres intentar algo diferente?`,
      acciones: ['mostrar_ayuda', 'nueva_busqueda'],
      hora: new Date().toLocaleTimeString(),
    }
    mensajes.value.push(mensajeError)
  }

  santoroEscribiendo.value = false
  await scrollHaciaAbajo()
}

// 🔑 CONFIGURACIÓN DE API KEY
const mostrarConfigApiKey = () => {
  import('quasar').then(({ Dialog }) => {
    Dialog.create({
      title: '🔑 Configurar API Key de Gemini',
      message: 'Ingresa tu API Key de Google Gemini para habilitar funciones avanzadas de IA:',
      prompt: {
        model: '',
        type: 'text',
        placeholder: 'AIzaSy...',
        hint: 'La API Key se guardará solo durante esta sesión',
      },
      cancel: true,
      persistent: true,
    }).onOk((apiKey) => {
      if (apiKey && apiKey.trim()) {
        configurarApiKey(apiKey.trim())
      }
    })
  })
}

const configurarApiKey = async (apiKey) => {
  try {
    // Importar el servicio de Gemini
    const { santoroGeminiIntegration } = await import('src/services/santoroGeminiIntegration.js')

    // Configurar la nueva API Key
    const exito = santoroGeminiIntegration.cambiarApiKey(apiKey)

    if (exito) {
      // Probar la conexión
      const prueba = await santoroGeminiIntegration.probarConexion()

      if (prueba.exito) {
        import('quasar').then(({ Notify }) => {
          Notify.create({
            message: '✅ API Key configurada correctamente',
            color: 'positive',
            icon: 'check_circle',
            position: 'top',
          })
        })
      } else {
        import('quasar').then(({ Notify }) => {
          Notify.create({
            message: '⚠️ API Key configurada pero hay problemas de conexión',
            color: 'warning',
            icon: 'warning',
            position: 'top',
          })
        })
      }
    } else {
      import('quasar').then(({ Notify }) => {
        Notify.create({
          message: '❌ Error configurando API Key',
          color: 'negative',
          icon: 'error',
          position: 'top',
        })
      })
    }
  } catch (error) {
    console.error('Error configurando API Key:', error)
    import('quasar').then(({ Notify }) => {
      Notify.create({
        message: '❌ Error configurando API Key',
        color: 'negative',
        icon: 'error',
        position: 'top',
      })
    })
  }
}

// 🎨 Formatear nombres de acciones
const formatearAccion = (accion) => {
  const formatos = {
    // Visualización
    mostrar_grafico: '📊 Ver Gráfico',
    ver_grafico: '📊 Ver Gráfico',
    abrir_dashboard: '📈 Abrir Dashboard',

    // Detalles y análisis
    ver_detalles: '🔍 Ver Detalles',
    mostrar_detalles: '🔍 Ver Detalles',
    ver_timeline: '⏱️ Ver Timeline',
    analizar_errores: '🔬 Analizar Errores',
    buscar_relacionados: '🔗 Buscar Relacionados',

    // Exportación
    exportar: '📁 Exportar',
    generar_reporte: '📄 Generar Reporte',
    exportar_resultados: '💾 Exportar Resultados',

    // Filtros
    abrir_filtros: '🔍 Filtros Avanzados',
    filtrar_mas: '🎯 Más Filtros',
    aplicar_filtro_fecha: '📅 Filtrar por Fecha',

    // Navegación
    abrir_diagnostico: '🏥 Abrir Diagnóstico',
    mostrar_formulario_busqueda: '🔍 Búsqueda Avanzada',
    abrir_filtro_fechas: '📅 Filtros de Fecha',

    // Ayuda y opciones
    mostrar_ayuda: '💡 Ver Ayuda',
    mostrar_sugerencias: '💭 Ver Sugerencias',
    nueva_busqueda: '🔄 Nueva Búsqueda',
    ver_mas_detalles: '📋 Más Detalles',
  }
  return formatos[accion] || `🔧 ${accion}`
}

// 📜 Scroll hacia abajo
const scrollHaciaAbajo = async () => {
  await nextTick()
  if (mensajesContainer.value) {
    mensajesContainer.value.scrollTop = mensajesContainer.value.scrollHeight
  }
}

// 🎯 Inicialización
onMounted(() => {
  // Detectar dispositivo inicial
  detectarDispositivo()

  // Agregar listener para resize
  window.addEventListener('resize', onResize)

  // Registrar el componente de configuración de Gemini en el controlador de modales
  window.addEventListener('load', () => {
    try {
      // Obtener la referencia al modal de configuración desde el MainLayout
      const geminiConfigRef = document.querySelector('#gemini-config')?.geminiConfigRef

      if (geminiConfigRef) {
        // Importar y registrar en el controlador de modales
        import('src/services/santoroModalController.js').then(({ santoroModalController }) => {
          santoroModalController.registrarComponente('gemini-config', geminiConfigRef, {
            abrir: () => geminiConfigRef.value?.abrir(),
          })
          console.log('🤖 Componente Gemini registrado en modal controller')
        })
      }
    } catch (error) {
      console.error('Error registrando componente Gemini:', error)
    }
  })
})

// 🧹 Cleanup
onMounted(() => {
  return () => {
    window.removeEventListener('resize', onResize)
    if (recognition) {
      recognition.stop()
    }
  }
})
</script>

<style scoped>
/* ===== SANTORO AI FUTURISTIC INTERFACE ===== */

/* Container */
.santoro-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

/* ===== AI FAB BUTTON ===== */
.santoro-ai-fab {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: ai-float 3s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.santoro-ai-pulse {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  opacity: 0.3;
  animation: ai-pulse 2s infinite;
  z-index: -1;
}

@keyframes ai-float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-8px) rotate(1deg);
  }
  66% {
    transform: translateY(-4px) rotate(-1deg);
  }
}

@keyframes ai-pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* ===== AI WINDOW ===== */
.santoro-ai-window {
  width: 400px;
  min-height: 550px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(13, 13, 13, 0.95) 0%, rgba(25, 25, 35, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  animation: ai-window-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

@keyframes ai-window-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ===== COMPACT NEURAL HEADER ===== */
.santoro-compact-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.santoro-compact-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(102, 126, 234, 0.3) 50%,
    transparent 100%
  );
}

.santoro-brain-mini {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.brain-icon-mini {
  font-size: 16px;
  color: white;
}

.ai-info {
  display: flex;
  flex-direction: column;
}

.santoro-ai-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.ai-status {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: rgba(102, 126, 234, 0.8);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #00ff88;
  border-radius: 50%;
  margin-right: 6px;
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.santoro-control-matrix {
  display: flex;
  align-items: center;
  gap: 4px;
}

.neural-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.neural-btn:hover {
  color: white;
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.neural-close:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

/* ===== NEURAL HEADER (Old styles to remove) ===== */
.santoro-neural-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.santoro-neural-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(102, 126, 234, 0.5) 50%,
    transparent 100%
  );
}

/* Brain Animation */
.santoro-brain-container {
  position: relative;
  margin-right: 16px;
}

.santoro-brain-core {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.santoro-brain-icon {
  font-size: 20px;
  color: white;
}

.santoro-neural-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave {
  position: absolute;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: neural-wave 3s infinite;
}

.wave-1 {
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  animation-delay: 0s;
}

.wave-2 {
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  animation-delay: 1s;
}

.wave-3 {
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  animation-delay: 2s;
}

@keyframes neural-wave {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* AI Identity */
.santoro-ai-identity {
  flex: 1;
}

.santoro-ai-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.santoro-ai-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(102, 126, 234, 0.8);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #00ff88;
  border-radius: 50%;
  margin-right: 8px;
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* Control Matrix */
.santoro-control-matrix {
  display: flex;
  align-items: center;
  gap: 8px;
}

.neural-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.neural-btn:hover {
  color: white;
  transform: scale(1.1);
}

.neural-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.neural-btn:hover .neural-glow {
  opacity: 0.3;
  animation: glow-pulse 1.5s infinite;
}

.neural-close:hover {
  color: #ff4757;
}

.neural-close:hover .neural-glow {
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* ===== NEURAL STREAM ===== */
.santoro-neural-stream {
  flex: 1;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 20px;
  background: radial-gradient(ellipse at center top, rgba(102, 126, 234, 0.02) 0%, transparent 70%);
}

/* Custom Scrollbar */
.santoro-neural-stream::-webkit-scrollbar {
  width: 4px;
}

.santoro-neural-stream::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.05);
}

.santoro-neural-stream::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* ===== AI INITIALIZATION MESSAGE ===== */
.neural-init-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.ai-welcome-container {
  max-width: 320px;
}

.ai-core-animation {
  position: relative;
  margin-bottom: 24px;
}

.core-ring {
  position: absolute;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: core-spin 8s linear infinite;
}

.ring-1 {
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  top: 50%;
  left: 50%;
}

.ring-2 {
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  top: 50%;
  left: 50%;
  animation-delay: -2s;
}

.ring-3 {
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  top: 50%;
  left: 50%;
  animation-delay: -4s;
}

.core-icon {
  font-size: 32px;
  color: #667eea;
  z-index: 2;
  position: relative;
}

@keyframes core-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ai-welcome-text {
  color: white;
}

.neural-title {
  font-size: 24px;
  font-weight: 300;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.neural-subtitle {
  font-size: 14px;
  color: rgba(102, 126, 234, 0.8);
  margin: 0 0 24px 0;
}

.capabilities-matrix {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.capability-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.capability-node i {
  color: #667eea;
}

.interaction-modes {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.mode-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.mode-indicator.active {
  color: white;
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

/* Continue with neural messages and more styles... */

/* ===== NEURAL MESSAGES ===== */
.neural-message {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  animation: neural-message-appear 0.5s ease-out;
}

.neural-message.user-neural {
  flex-direction: row-reverse;
}

@keyframes neural-message-appear {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.neural-avatar {
  position: relative;
  margin: 0 16px;
}

.avatar-core {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.user-neural .avatar-core {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai-neural .avatar-core {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6e 100%);
}

.user-icon,
.ai-icon {
  font-size: 20px;
  color: white;
}

.neural-pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: neural-pulse 2s infinite;
}

.ai-neural .neural-pulse {
  border-color: rgba(0, 255, 136, 0.3);
}

.neural-pulse.active {
  animation: neural-pulse-active 1s infinite;
}

@keyframes neural-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
}

@keyframes neural-pulse-active {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

.neural-bubble {
  max-width: 280px;
  padding: 16px 20px;
  border-radius: 20px;
  position: relative;
  backdrop-filter: blur(10px);
}

.ai-neural .neural-bubble {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 204, 110, 0.08) 100%);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.user-neural .neural-bubble {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.neural-content {
  color: white;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.quantum-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.quantum-btn {
  position: relative;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 11px;
  transition: all 0.3s ease;
}

.quantum-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.quantum-glow {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-btn:hover .quantum-glow {
  opacity: 0.3;
}

.neural-timestamp {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

/* AI Thinking Animation */
.ai-thinking {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  animation: neural-message-appear 0.5s ease-out;
}

.ai-thinking .neural-bubble.thinking {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 204, 110, 0.05) 100%);
  border: 1px solid rgba(0, 255, 136, 0.15);
}

.thought-waves {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.thought-wave {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: thought-pulse 1.5s infinite;
}

.wave-a {
  animation-delay: 0s;
}
.wave-b {
  animation-delay: 0.3s;
}
.wave-c {
  animation-delay: 0.6s;
}

@keyframes thought-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.thinking-text {
  color: rgba(0, 255, 136, 0.8);
  font-size: 12px;
  font-style: italic;
}

/* ===== NEURAL INPUT ZONE ===== */
.neural-input-zone {
  padding: 16px;
  background: linear-gradient(135deg, rgba(13, 13, 13, 0.8) 0%, rgba(25, 25, 35, 0.8) 100%);
  border-top: 1px solid rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.input-matrix {
  display: flex;
  align-items: center;
  gap: 12px;
}

.neural-input-container {
  flex: 1;
}

.neural-text-input {
  background: rgba(35, 35, 45, 0.95) !important;
  border: 2px solid rgba(102, 126, 234, 0.6) !important;
  border-radius: 12px !important;
  padding: 0 12px !important;
  transition: all 0.3s ease !important;
  min-height: 48px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.neural-text-input .q-field__control {
  background: rgba(35, 35, 45, 0.98) !important;
  border: none !important;
  border-radius: 12px !important;
  min-height: 48px !important;
}

.neural-text-input .q-field__outlined {
  border-color: rgba(102, 126, 234, 0.6) !important;
}

.neural-text-input:focus-within,
.neural-text-input .q-field--focused .q-field__outlined {
  border-color: rgba(102, 126, 234, 1) !important;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5) !important;
  background: rgba(40, 40, 50, 0.98) !important;
}

.neural-input-field {
  color: white !important;
  font-size: 14px !important;
  padding: 14px 0 !important;
  background: transparent !important;
  line-height: 1.4 !important;
}

.neural-text-input .q-field--dark .q-field__native::placeholder {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px !important;
}

.neural-send-container {
  position: relative;
}

.neural-send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.neural-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.neural-send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.send-neural-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.neural-send-btn:hover:not(:disabled) .send-neural-glow {
  opacity: 0.6;
  animation: send-glow-pulse 1s infinite;
}

.send-pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.neural-send-btn:hover:not(:disabled) .send-pulse-ring {
  opacity: 1;
  animation: send-ring-pulse 1.5s infinite;
}

@keyframes send-glow-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes send-ring-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Voice Status */
.voice-neural-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
}

.voice-wave-container {
  display: flex;
  gap: 3px;
}

.voice-wave {
  width: 3px;
  background: #00ff88;
  border-radius: 2px;
  animation: voice-wave 1.5s infinite;
}

.voice-wave:nth-child(1) {
  height: 12px;
  animation-delay: 0s;
}
.voice-wave:nth-child(2) {
  height: 16px;
  animation-delay: 0.2s;
}
.voice-wave:nth-child(3) {
  height: 20px;
  animation-delay: 0.4s;
}

@keyframes voice-wave {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.3);
  }
}

.voice-status-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 255, 136, 0.8);
  font-size: 12px;
}

/* Voice Status */

/* Responsive Design */
@media (max-width: 768px) {
  .santoro-container {
    bottom: 10px;
    right: 10px;
  }

  .santoro-ai-window {
    width: calc(100vw - 20px);
    min-height: calc(100vh - 40px);
    max-height: calc(100vh - 40px);
    border-radius: 16px;
    position: fixed;
    bottom: 10px;
    right: 10px;
    max-width: 380px;
  }

  .santoro-neural-stream {
    min-height: 200px;
    max-height: calc(100vh - 200px);
  }

  .neural-input-zone {
    padding: 12px 16px;
  }

  .capabilities-matrix {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .capability-node {
    padding: 6px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .santoro-ai-window {
    width: 100vw;
    min-height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    bottom: 0;
    right: 0;
    max-width: none;
  }

  .santoro-neural-stream {
    min-height: calc(100vh - 180px);
    max-height: calc(100vh - 180px);
  }

  .santoro-compact-header {
    padding: 10px 12px;
  }

  .neural-input-zone {
    padding: 12px 16px;
  }

  .neural-send-btn {
    width: 44px;
    height: 44px;
  }
}

/* Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .santoro-ai-window {
    min-height: 100vh;
    max-height: 100vh;
  }

  .santoro-neural-stream {
    min-height: calc(100vh - 160px);
    max-height: calc(100vh - 160px);
  }

  .ai-welcome-container {
    padding: 20px 10px;
  }

  .neural-title {
    font-size: 20px;
  }

  .capabilities-matrix {
    margin-bottom: 16px;
  }
}
</style>
