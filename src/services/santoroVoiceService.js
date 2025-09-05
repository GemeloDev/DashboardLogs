// 🎤 SANTORO VOICE SERVICE - Síntesis y Reconocimiento de Voz
// Proporciona capacidades de voz avanzadas para Santoro AI

import { reactive } from 'vue'

class SantoroVoiceService {
  constructor() {
    // Estado reactivo del servicio de voz
    this.estado = reactive({
      // Síntesis de voz
      vozDisponible: false,
      hablando: false,
      vozConfigurada: null,
      voces: [],
      volumen: 0.8,
      velocidad: 1.0,
      tono: 1.0,

      // Reconocimiento de voz
      escuchandoDisponible: false,
      escuchando: false,
      reconocimientoConfigurado: null,
      idioma: 'es-ES',
      continuo: false,

      // Estado general
      soportado: false,
      permisos: false,
      error: null,

      // 🔊 Control de voz automática
      vozAutomaticaActivada: true, // Nueva opción para controlar respuestas automáticas
      responderConVoz: true
    })

    // Callbacks
    this.callbacks = new Map()
    this.onResultCallback = null
    this.onErrorCallback = null
    this.onStartCallback = null
    this.onEndCallback = null

    // Inicializar
    this.inicializar()
  }

  // 🚀 INICIALIZAR servicio
  async inicializar() {
    console.log('🎤 Inicializando servicio de voz...')

    try {
      // Verificar soporte
      await this.verificarSoporte()

      // Configurar síntesis
      if (this.estado.vozDisponible) {
        await this.configurarSintesis()
      }

      // Configurar reconocimiento
      if (this.estado.escuchandoDisponible) {
        await this.configurarReconocimiento()
      }

      console.log('✅ Servicio de voz inicializado:', {
        sintesis: this.estado.vozDisponible,
        reconocimiento: this.estado.escuchandoDisponible
      })

    } catch (error) {
      console.error('❌ Error inicializando servicio de voz:', error)
      this.estado.error = error.message
    }
  }

  // 🔍 VERIFICAR soporte
  async verificarSoporte() {
    // Verificar síntesis de voz
    this.estado.vozDisponible = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

    // Verificar reconocimiento de voz
    this.estado.escuchandoDisponible = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

    this.estado.soportado = this.estado.vozDisponible || this.estado.escuchandoDisponible

    if (!this.estado.soportado) {
      throw new Error('Navegador no soporta funcionalidades de voz')
    }

    // Solicitar permisos para micrófono si es necesario
    if (this.estado.escuchandoDisponible) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.estado.permisos = true
        stream.getTracks().forEach(track => track.stop()) // Liberar inmediatamente
      } catch (error) {
        console.warn('⚠️ Permisos de micrófono no concedidos:', error)
        this.estado.permisos = false
      }
    }
  }

  // 🗣️ CONFIGURAR síntesis de voz
  async configurarSintesis() {
    if (!this.estado.vozDisponible) return

    // Esperar a que las voces estén disponibles
    await this.esperarVoces()

    // Buscar la mejor voz masculina en español
    let vozSeleccionada = null

    // Prioridades de voz (de mayor a menor preferencia)
    const prioridadesVoz = [
      // Voces Microsoft (Windows)
      { regex: /Microsoft.*Pablo.*Spanish/i, genero: 'male' },
      { regex: /Microsoft.*Jorge.*Spanish/i, genero: 'male' },
      { regex: /Microsoft.*Spanish.*Male/i, genero: 'male' },

      // Voces Google (Chrome)
      { regex: /Google.*español.*hombre/i, genero: 'male' },
      { regex: /Google.*Spanish.*Male/i, genero: 'male' },

      // Cualquier voz masculina en español
      { regex: /es-.*male/i, genero: 'male' },
      { regex: /spanish.*male/i, genero: 'male' },

      // Fallback: cualquier voz en español
      { regex: /es-/i, genero: 'any' },
      { regex: /spanish/i, genero: 'any' }
    ]

    // Buscar por prioridad
    for (const prioridad of prioridadesVoz) {
      vozSeleccionada = this.estado.voces.find(voz =>
        prioridad.regex.test(voz.name + ' ' + voz.lang)
      )
      if (vozSeleccionada) {
        console.log(`🎯 Voz seleccionada por prioridad (${prioridad.genero}):`, vozSeleccionada.name)
        break
      }
    }

    // Si no encontramos nada, usar la primera disponible
    if (!vozSeleccionada && this.estado.voces.length > 0) {
      vozSeleccionada = this.estado.voces[0]
      console.log('🔄 Usando voz por defecto:', vozSeleccionada.name)
    }

    this.estado.vozConfigurada = vozSeleccionada

    // Configurar parámetros optimizados para claridad
    this.estado.volumen = 0.9
    this.estado.velocidad = 0.95  // Ligeramente más lento para mejor comprensión
    this.estado.tono = 1.0

    console.log('🗣️ Voz configurada:', {
      nombre: vozSeleccionada?.name,
      idioma: vozSeleccionada?.lang,
      configuracion: {
        volumen: this.estado.volumen,
        velocidad: this.estado.velocidad,
        tono: this.estado.tono
      }
    })
  }

  // ⏳ ESPERAR a que las voces estén disponibles
  async esperarVoces() {
    return new Promise((resolve) => {
      const obtenerVoces = () => {
        this.estado.voces = window.speechSynthesis.getVoices()
        if (this.estado.voces.length > 0) {
          resolve()
        } else {
          setTimeout(obtenerVoces, 100)
        }
      }

      window.speechSynthesis.addEventListener('voiceschanged', obtenerVoces)
      obtenerVoces()
    })
  }

  // 🎧 CONFIGURAR reconocimiento de voz
  async configurarReconocimiento() {
    if (!this.estado.escuchandoDisponible || !this.estado.permisos) return

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.estado.reconocimientoConfigurado = new SpeechRecognition()

      const recognition = this.estado.reconocimientoConfigurado

      // Configuración
      recognition.lang = this.estado.idioma
      recognition.continuous = this.estado.continuo
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      // Event listeners
      recognition.onstart = () => {
        this.estado.escuchando = true
        console.log('🎧 Iniciando escucha...')
        this.ejecutarCallback('inicio_escucha')
        if (this.onStartCallback) this.onStartCallback()
      }

      recognition.onresult = (event) => {
        let transcript = ''
        let isFinal = false

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          transcript += result[0].transcript

          if (result.isFinal) {
            isFinal = true
          }
        }

        console.log('🎤 Texto reconocido:', transcript, isFinal ? '(final)' : '(temporal)')

        if (isFinal && transcript.trim()) {
          this.ejecutarCallback('texto_reconocido', { texto: transcript.trim() })
          if (this.onResultCallback) this.onResultCallback(transcript.trim())
        }
      }

      recognition.onerror = (event) => {
        console.error('❌ Error reconocimiento:', event.error)
        this.estado.error = event.error
        this.ejecutarCallback('error_reconocimiento', { error: event.error })
        if (this.onErrorCallback) this.onErrorCallback(event.error)
      }

      recognition.onend = () => {
        this.estado.escuchando = false
        console.log('🛑 Reconocimiento terminado')
        this.ejecutarCallback('fin_escucha')
        if (this.onEndCallback) this.onEndCallback()
      }

      console.log('🎧 Reconocimiento de voz configurado')

    } catch (error) {
      console.error('❌ Error configurando reconocimiento:', error)
      this.estado.error = error.message
    }
  }

  // 🗣️ HABLAR texto con mejor calidad
  async hablar(texto, opciones = {}) {
    if (!this.estado.vozDisponible) {
      console.warn('⚠️ Síntesis de voz no disponible')
      return false
    }

    try {
      // Detener cualquier speech anterior
      window.speechSynthesis.cancel()

      // Esperar un poco para que se cancele completamente
      await new Promise(resolve => setTimeout(resolve, 100))

      // Limpiar texto para mejor síntesis
      const textoLimpio = this.limpiarTextoParaVoz(texto)

      const utterance = new SpeechSynthesisUtterance(textoLimpio)

      // Configurar voz
      if (this.estado.vozConfigurada) {
        utterance.voice = this.estado.vozConfigurada
      }

      // Configurar parámetros optimizados
      utterance.volume = opciones.volumen || this.estado.volumen
      utterance.rate = opciones.velocidad || this.estado.velocidad
      utterance.pitch = opciones.tono || this.estado.tono
      utterance.lang = opciones.idioma || this.estado.vozConfigurada?.lang || 'es-ES'

      // Event listeners
      utterance.onstart = () => {
        this.estado.hablando = true
        console.log('🗣️ Iniciando síntesis de voz:', textoLimpio.substring(0, 50) + '...')
        this.ejecutarCallback('inicio_habla', { texto: textoLimpio })
      }

      utterance.onend = () => {
        this.estado.hablando = false
        console.log('✅ Síntesis de voz completada')
        this.ejecutarCallback('fin_habla', { texto: textoLimpio })
      }

      utterance.onerror = (event) => {
        this.estado.hablando = false
        console.error('❌ Error en síntesis de voz:', event.error)
        this.ejecutarCallback('error_habla', { error: event.error })

        // Reintentar con configuración básica
        if (!opciones.reintento) {
          console.log('🔄 Reintentando síntesis con configuración básica...')
          return this.hablar(textoLimpio, { ...opciones, reintento: true, velocidad: 1.0 })
        }
      }

      // Iniciar síntesis
      window.speechSynthesis.speak(utterance)

      return true

    } catch (error) {
      console.error('❌ Error en síntesis de voz:', error)
      return false
    }
  }

  // 🧹 LIMPIAR texto para mejor síntesis de voz
  limpiarTextoParaVoz(texto) {
    return texto
      // Remover emojis usando unicode ranges
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remover markdown
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      // Remover saltos de línea múltiples
      .replace(/\n+/g, ' ')
      // Limpiar espacios múltiples
      .replace(/\s+/g, ' ')
      // Trim
      .trim()
  }

  // 🎧 INICIAR escucha
  async iniciarEscucha() {
    if (!this.estado.escuchandoDisponible || !this.estado.permisos) {
      console.warn('⚠️ Reconocimiento de voz no disponible o sin permisos')
      return false
    }

    if (this.estado.escuchando) {
      console.warn('⚠️ Ya se está escuchando')
      return false
    }

    try {
      this.estado.reconocimientoConfigurado.start()
      return true
    } catch (error) {
      console.error('❌ Error iniciando escucha:', error)
      return false
    }
  }

  // 🛑 DETENER escucha
  detenerEscucha() {
    if (!this.estado.escuchando) return false

    try {
      this.estado.reconocimientoConfigurado.stop()
      return true
    } catch (error) {
      console.error('❌ Error deteniendo escucha:', error)
      return false
    }
  }

  // 🔇 SILENCIAR síntesis
  silenciar() {
    if (this.estado.hablando) {
      window.speechSynthesis.cancel()
      this.estado.hablando = false
      console.log('🔇 Síntesis silenciada')
    }
  }

  // 🔊 CONTROLAR voz automática
  alternarVozAutomatica() {
    this.estado.vozAutomaticaActivada = !this.estado.vozAutomaticaActivada
    this.estado.responderConVoz = this.estado.vozAutomaticaActivada
    console.log('🔊 Voz automática:', this.estado.vozAutomaticaActivada ? 'ACTIVADA' : 'DESACTIVADA')
    return this.estado.vozAutomaticaActivada
  }

  activarVozAutomatica() {
    this.estado.vozAutomaticaActivada = true
    this.estado.responderConVoz = true
    console.log('🔊 Voz automática ACTIVADA')
    return true
  }

  desactivarVozAutomatica() {
    this.estado.vozAutomaticaActivada = false
    this.estado.responderConVoz = false
    console.log('🔇 Voz automática DESACTIVADA')
    return false
  }

  // ⚙️ CONFIGURAR parámetros
  configurar(opciones = {}) {
    if (opciones.volumen !== undefined) {
      this.estado.volumen = Math.max(0, Math.min(1, opciones.volumen))
    }

    if (opciones.velocidad !== undefined) {
      this.estado.velocidad = Math.max(0.1, Math.min(2, opciones.velocidad))
    }

    if (opciones.tono !== undefined) {
      this.estado.tono = Math.max(0, Math.min(2, opciones.tono))
    }

    if (opciones.idioma) {
      this.estado.idioma = opciones.idioma
      if (this.estado.reconocimientoConfigurado) {
        this.estado.reconocimientoConfigurado.lang = opciones.idioma
      }
    }

    if (opciones.continuo !== undefined) {
      this.estado.continuo = opciones.continuo
      if (this.estado.reconocimientoConfigurado) {
        this.estado.reconocimientoConfigurado.continuous = opciones.continuo
      }
    }

    console.log('⚙️ Configuración actualizada:', opciones)
  }

  // 🎯 CONFIGURAR callbacks
  configurarCallbacks(callbacks = {}) {
    if (callbacks.onResult) this.onResultCallback = callbacks.onResult
    if (callbacks.onError) this.onErrorCallback = callbacks.onError
    if (callbacks.onStart) this.onStartCallback = callbacks.onStart
    if (callbacks.onEnd) this.onEndCallback = callbacks.onEnd
  }

  // 📋 REGISTRAR callback
  registrarCallback(evento, callback) {
    if (!this.callbacks.has(evento)) {
      this.callbacks.set(evento, [])
    }
    this.callbacks.get(evento).push(callback)
  }

  // 🚀 EJECUTAR callbacks
  ejecutarCallback(evento, datos = {}) {
    const callbacks = this.callbacks.get(evento) || []
    callbacks.forEach(callback => {
      try {
        callback(datos)
      } catch (error) {
        console.error(`Error ejecutando callback ${evento}:`, error)
      }
    })
  }

  // 📊 OBTENER estado
  obtenerEstado() {
    return {
      ...this.estado,
      voces: this.estado.voces.map(voz => ({
        name: voz.name,
        lang: voz.lang,
        default: voz.default
      }))
    }
  }

  // 🎵 OBTENER voces disponibles
  obtenerVoces() {
    return this.estado.voces.map(voz => ({
      name: voz.name,
      lang: voz.lang,
      default: voz.default,
      localService: voz.localService
    }))
  }
 
  // 🔧 CAMBIAR voz
  cambiarVoz(nombreVoz) {
    const voz = this.estado.voces.find(v => v.name === nombreVoz)
    if (voz) {
      this.estado.vozConfigurada = voz
      console.log('🔧 Voz cambiada a:', nombreVoz)
      return true
    }
    return false
  }

  // 🧪 PRUEBA de funcionalidades
  async probarVoz() {
    const resultados = {
      sintesis: false,
      reconocimiento: false,
      permisos: this.estado.permisos
    }

    // Probar síntesis
    if (this.estado.vozDisponible) {
      resultados.sintesis = await this.hablar('Hola, soy Santoro, tu asistente inteligente con voz.')
    }

    // Probar reconocimiento (sin iniciar, solo verificar disponibilidad)
    resultados.reconocimiento = this.estado.escuchandoDisponible && this.estado.permisos

    return resultados
  }

  // 🎤 MODO conversación (alternar entre hablar y escuchar)
  async iniciarConversacion() {
    if (!this.estado.vozDisponible || !this.estado.escuchandoDisponible || !this.estado.permisos) {
      console.warn('⚠️ Conversación requiere síntesis y reconocimiento con permisos')
      return false
    }

    console.log('💬 Iniciando modo conversación...')

    await this.hablar('¡Hola! Ahora puedes hablarme directamente. Di "Santoro" para activarme.')

    // Configurar escucha continua
    this.configurar({ continuo: true })

    return await this.iniciarEscucha()
  }
}

// 🎯 Instancia global
export const santoroVoiceService = new SantoroVoiceService()
export default santoroVoiceService
