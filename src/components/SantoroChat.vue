<!-- 🤖 SANTORO CHAT COMPONENT - Interfaz Conversacional -->
<template>
  <!-- Botón Flotante para abrir Santoro -->
  <div class="santoro-container">
    <!-- FAB Button - Botón flotante -->
    <q-fab
      v-if="!chatAbierto"
      color="purple-6"
      icon="smart_toy"
      direction="up"
      class="santoro-fab"
      @click="abrirChat"
    >
      <q-tooltip class="bg-purple-8 text-white">
        // 📜 Scroll hacia abajoy Santoro, tu asistente IA
      </q-tooltip>
    </q-fab>

    <!-- Chat Window - Ventana de chat -->
    <q-card v-if="chatAbierto" class="santoro-chat-window bg-grey-9 text-white">
      <!-- Header del Chat -->
      <q-card-section class="santoro-header bg-purple-8">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">
              🤖 Santoro IA
              <q-chip dense color="green-5" text-color="white" icon="circle" class="q-ml-sm">
                Online
              </q-chip>
            </div>
            <div class="text-caption text-purple-2">Tu asistente inteligente para diagnósticos</div>
          </div>
          <div class="col-auto">
            <!-- Botón de voz -->
            <q-btn
              :icon="escuchandoVoz ? 'mic' : 'mic_none'"
              :color="escuchandoVoz ? 'red-5' : 'purple-3'"
              round
              flat
              @click="toggleVoz"
              class="q-mr-sm"
            >
              <q-tooltip>{{ escuchandoVoz ? 'Detener' : 'Hablar con' }} Santoro</q-tooltip>
            </q-btn>

            <!-- Minimizar -->
            <q-btn
              icon="remove"
              flat
              round
              color="purple-3"
              @click="minimizarChat"
              class="q-mr-sm"
            />

            <!-- Cerrar -->
            <q-btn icon="close" flat round color="red-4" @click="cerrarChat" />
          </div>
        </div>
      </q-card-section>

      <!-- Área de Mensajes -->
      <q-card-section
        ref="mensajesContainer"
        class="santoro-mensajes q-pa-md"
        style="height: 400px; overflow-y: auto"
      >
        <!-- Mensaje de bienvenida -->
        <div v-if="mensajes.length === 0" class="santoro-mensaje santoro-bot">
          <div class="santoro-avatar">🤖</div>
          <div class="santoro-texto">
            <div class="text-body2">
              ¡Hola! Soy <strong>Santoro</strong>, tu asistente IA. Puedo ayudarte con:
            </div>
            <ul class="q-mt-sm text-caption">
              <li>🔍 Buscar errores y diagnósticos</li>
              <li>📊 Analizar datos y estadísticas</li>
              <li>🎯 Filtrar información por fechas/usuarios</li>
              <li>⚡ Ejecutar acciones automáticas</li>
            </ul>
            <div class="text-caption text-purple-3 q-mt-sm">
              💡 Puedes escribir o hablar conmigo
            </div>
          </div>
        </div>

        <!-- Lista de Mensajes -->
        <div
          v-for="(mensaje, index) in mensajes"
          :key="index"
          :class="[
            'santoro-mensaje',
            mensaje.tipo === 'usuario' ? 'santoro-usuario' : 'santoro-bot',
          ]"
        >
          <!-- Avatar -->
          <div class="santoro-avatar">
            {{ mensaje.tipo === 'usuario' ? '👤' : '🤖' }}
          </div>

          <!-- Contenido del mensaje -->
          <div class="santoro-texto">
            <div class="text-body2">{{ mensaje.texto }}</div>

            <!-- Acciones sugeridas (si las hay) -->
            <div v-if="mensaje.acciones && mensaje.acciones.length > 0" class="q-mt-sm">
              <q-btn
                v-for="accion in mensaje.acciones"
                :key="accion"
                size="sm"
                color="purple-6"
                :label="formatearAccion(accion)"
                @click="ejecutarAccion(accion)"
                class="q-mr-xs q-mb-xs"
              />
            </div>

            <!-- Timestamp -->
            <div class="text-caption text-grey-5 q-mt-xs">
              {{ mensaje.hora }}
            </div>
          </div>
        </div>

        <!-- Indicador de escritura -->
        <div v-if="santoroEscribiendo" class="santoro-mensaje santoro-bot">
          <div class="santoro-avatar">🤖</div>
          <div class="santoro-texto">
            <div class="santoro-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Input de Texto -->
      <q-card-section class="santoro-input bg-grey-8">
        <q-input
          ref="inputTexto"
          v-model="mensajeTexto"
          placeholder="Escribe tu pregunta aquí... o presiona el micrófono para hablar"
          dark
          outlined
          dense
          @keyup.enter="enviarMensaje"
          :disable="santoroEscribiendo"
          class="santoro-text-input"
        >
          <template v-slot:prepend>
            <q-icon name="chat" color="purple-4" />
          </template>
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="send"
              color="purple-5"
              @click="enviarMensaje"
              :disable="!mensajeTexto.trim() || santoroEscribiendo"
            />
          </template>
        </q-input>

        <!-- Indicador de voz -->
        <div v-if="escuchandoVoz" class="text-center text-red-4 q-mt-sm text-caption">
          🎤 Escuchando... Habla ahora
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import santoroAI from '../services/santoroAI.js'
import santoroActionController from '../services/santoroActionController.js'

// 📱 Estado del Chat
const chatAbierto = ref(false)
const mensajes = ref([])
const mensajeTexto = ref('')
const santoroEscribiendo = ref(false)
const escuchandoVoz = ref(false)

// 📚 Referencias DOM
const mensajesContainer = ref(null)
const inputTexto = ref(null)

// 🎤 Speech Recognition
let recognition = null

// 🚀 MÉTODOS PRINCIPALES

// Abrir chat
const abrirChat = () => {
  chatAbierto.value = true
  nextTick(() => {
    if (inputTexto.value) {
      inputTexto.value.focus()
    }
  })
}

// Cerrar chat
const cerrarChat = () => {
  chatAbierto.value = false
  if (recognition) {
    recognition.stop()
    escuchandoVoz.value = false
  }
}

// Minimizar chat
const minimizarChat = () => {
  chatAbierto.value = false
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
}

// 🎤 Toggle reconocimiento de voz
const toggleVoz = () => {
  if (!recognition) {
    inicializarReconocimientoVoz()
  }

  if (escuchandoVoz.value) {
    recognition.stop()
  } else {
    recognition.start()
  }
}

// 🎤 Inicializar Speech Recognition
const inicializarReconocimientoVoz = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech Recognition no soportado')
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'es-ES'

  recognition.onstart = () => {
    escuchandoVoz.value = true
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    mensajeTexto.value = transcript
    escuchandoVoz.value = false

    // Auto-enviar después de reconocimiento
    setTimeout(() => {
      enviarMensaje()
    }, 500)
  }

  recognition.onerror = () => {
    escuchandoVoz.value = false
  }

  recognition.onend = () => {
    escuchandoVoz.value = false
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
  inicializarReconocimientoVoz()

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
</script>

<style scoped>
/* 🎨 ESTILOS DE SANTORO CHAT */

.santoro-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.santoro-fab {
  animation: santoro-pulse 2s infinite;
}

@keyframes santoro-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.santoro-chat-window {
  width: 400px;
  height: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.santoro-header {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.santoro-mensajes {
  background: linear-gradient(180deg, #1f2937, #111827);
}

.santoro-mensaje {
  display: flex;
  margin-bottom: 16px;
  animation: santoro-message-in 0.3s ease-out;
}

@keyframes santoro-message-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.santoro-usuario {
  flex-direction: row-reverse;
}

.santoro-bot {
  flex-direction: row;
}

.santoro-avatar {
  font-size: 24px;
  margin: 0 8px;
  min-width: 32px;
}

.santoro-texto {
  background: rgba(124, 58, 237, 0.1);
  border-radius: 12px;
  padding: 12px;
  max-width: 280px;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.santoro-usuario .santoro-texto {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.santoro-typing {
  display: flex;
  gap: 4px;
}

.santoro-typing span {
  width: 6px;
  height: 6px;
  background: #a855f7;
  border-radius: 50%;
  animation: santoro-typing 1.4s infinite;
}

.santoro-typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.santoro-typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes santoro-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.santoro-input {
  border-top: 1px solid rgba(124, 58, 237, 0.2);
}

.santoro-text-input {
  transition: all 0.3s ease;
}

.santoro-text-input:focus-within {
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
}

/* 📱 Responsive */
@media (max-width: 480px) {
  .santoro-chat-window {
    width: calc(100vw - 40px);
    height: calc(100vh - 40px);
    bottom: 20px;
    right: 20px;
  }
}
</style>
