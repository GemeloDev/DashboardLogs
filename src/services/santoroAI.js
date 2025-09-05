// 🤖 SANTORO IA SERVICE - Tu Asistente Inteligente Avanzado
// Sistema completo de IA con capacidades como Google Assistant

import santoroIntegrator from './santoroIntegrator.js'
import { santoroActionController } from './santoroActionController.js'
import { santoroRouterController } from './santoroRouterController.js'
import { santoroModalController } from './santoroModalController.js'
import { santoroComponentController } from './santoroComponentController.js'
import { santoroGeminiIntegration } from './santoroGeminiIntegration.js'

class SantoroAI {
  constructor() {
    // 🔑 API Key de Google Gemini
    this.apiKey = null
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

    // 🎛️ Controladores del sistema
    this.controladores = {
      accion: santoroActionController,
      router: santoroRouterController,
      modal: santoroModalController,
      componente: santoroComponentController,
      gemini: santoroGeminiIntegration
    }

    // 🧠 Contexto del sistema - Capacidades completas como Google Assistant
    this.systemContext = {
      apis: {
        diagnosticos: 'Información de códigos de error, sesiones y soporte técnico',
        eventos: 'Eventos del sistema, abiertos, fallidos, por tipo',
        estadisticas: 'Métricas, duraciones, dispositivos, tendencias',
        usuarios: 'Información de usuarios y sesiones'
      },
      comandos: {
        buscar: 'Buscar información en los datos',
        abrir: 'Abrir modal o sección específica',
        navegar: 'Cambiar de página o pestaña',
        filtrar: 'Aplicar filtros por fecha, usuario, tipo',
        analizar: 'Análisis de patrones y tendencias',
        exportar: 'Generar reportes',
        controlar: 'Control avanzado de componentes UI'
      },
      capacidades: {
        voz: 'Reconocimiento y síntesis de voz',
        navegacion: 'Control completo de rutas y tabs',
        modales: 'Apertura y control de ventanas emergentes',
        componentes: 'Manipulación de elementos UI específicos',
        integracion: 'Conexión con APIs externas y Google Gemini'
      }
    }

    // 🔧 Estado de configuración
    this.configurado = false
  }

  // 🚀 INICIALIZAR SISTEMA COMPLETO
  async inicializar(configuracion = {}) {
    try {
      console.log('🚀 Inicializando Santoro AI Sistema Completo...')

      // Configurar Gemini si se proporciona API key
      if (configuracion.geminiApiKey) {
        this.configurarGemini(configuracion.geminiApiKey)
      }

      // Inicializar controladores
      if (this.controladores.componente) {
        this.controladores.componente.inicializar()
      }

      // Configurar contexto del sistema
      if (configuracion.contextoSistema) {
        this.controladores.gemini.configurar(
          configuracion.geminiApiKey,
          configuracion.contextoSistema
        )
      }

      this.configurado = true
      console.log('✅ Santoro AI Sistema Completamente Inicializado')

      return {
        exito: true,
        mensaje: 'Sistema Santoro inicializado con todas las capacidades',
        controladores: Object.keys(this.controladores),
        capacidades: Object.keys(this.systemContext.capacidades)
      }

    } catch (error) {
      console.error('❌ Error inicializando Santoro:', error)
      return { exito: false, error: error.message }
    }
  }

  // 🔑 CONFIGURAR GEMINI
  configurarGemini(apiKey) {
    this.apiKey = apiKey
    this.controladores.gemini.configurar(apiKey, this.systemContext)
    console.log('🔑 Gemini AI configurado')
  }

  // 🎯 MÉTODO PRINCIPAL - Procesa las preguntas del usuario con IA Avanzada
  async procesarPregunta(pregunta, contextoActual = null) {
    try {
      console.log('🤖 Santoro AI procesando:', pregunta)

      // 🧠 Usar Gemini Integration para procesamiento avanzado
      const resultado = await this.controladores.gemini.procesarComandoAvanzado(
        pregunta,
        {
          paginaActual: contextoActual?.pagina,
          usuario: contextoActual?.usuario,
          timestamp: new Date().toISOString()
        }
      )

      // 🎯 Ejecutar acciones identificadas
      if (resultado.exito && resultado.acciones?.length > 0) {
        const resultadosAcciones = await this.ejecutarAcciones(resultado.acciones)

        return {
          respuesta: resultado.respuesta,
          acciones: resultadosAcciones,
          intencion: resultado.intencion,
          confianza: resultado.confianza,
          fuente: resultado.fuente || 'gemini',
          exito: true
        }
      }

      // 🔄 Fallback a procesamiento local si es necesario
      if (!resultado.exito && resultado.fallback) {
        return await this.procesarLocal(pregunta, contextoActual)
      }

      return {
        respuesta: resultado.respuesta || 'No pude procesar tu solicitud completamente.',
        exito: resultado.exito,
        intencion: resultado.intencion,
        fuente: resultado.fuente || 'local'
      }

    } catch (error) {
      console.error('❌ Error procesando pregunta:', error)

      // Fallback a procesamiento local en caso de error
      return await this.procesarLocal(pregunta, contextoActual)
    }
  }

  // ⚡ EJECUTAR ACCIONES IDENTIFICADAS
  async ejecutarAcciones(acciones) {
    const resultados = []

    for (const accion of acciones) {
      try {
        let resultado = null

        switch (accion.tipo) {
          case 'navegar':
            resultado = await this.controladores.router.navegarA(
              accion.destino,
              accion.parametros
            )
            break

          case 'modal':
            resultado = await this.controladores.modal.abrirModal(
              accion.destino,
              accion.parametros
            )
            break

          case 'buscar':
            resultado = await santoroIntegrator.ejecutarAccion('buscar', accion.parametros)
            break

          case 'exportar':
            resultado = await this.controladores.accion.ejecutarAccion({
              tipo: 'exportar',
              ...accion.parametros
            })
            break

          case 'componente':
            resultado = await this.controladores.componente.ejecutarAccionComponente(accion)
            break

          case 'analizar':
            resultado = await santoroIntegrator.ejecutarAccion('analizar', accion.parametros)
            break

          default:
            resultado = await this.controladores.accion.ejecutarAccion(accion)
        }

        resultados.push({
          accion: accion.tipo,
          destino: accion.destino,
          resultado,
          exito: resultado?.exito !== false
        })

      } catch (error) {
        console.error(`❌ Error ejecutando acción ${accion.tipo}:`, error)
        resultados.push({
          accion: accion.tipo,
          error: error.message,
          exito: false
        })
      }
    }

    return resultados
  }

  // 🔧 PROCESAMIENTO LOCAL (fallback)

  // 🏗️ Construye el prompt para la IA
  construirPrompt(pregunta, contexto) {
    return `
        Eres SANTORO, un asistente IA especializado en análisis de logs y diagnósticos técnicos.

        CONTEXTO DEL SISTEMA:
        - Tienes acceso a APIs de: ${Object.keys(this.systemContext.apis).join(', ')}
        - Puedes ejecutar: ${Object.keys(this.systemContext.comandos).join(', ')}
        - Contexto actual: ${contexto?.pagina || 'diagnóstico'}

        INSTRUCCIONES:
        1. Analiza la pregunta del usuario
        2. Identifica qué API necesitas usar
        3. Determina qué acciones ejecutar
        4. Responde de forma conversacional y útil

        PREGUNTA DEL USUARIO: "${pregunta}"

        Responde en formato JSON:
        {
            "entendimiento": "lo que entendiste",
            "api_necesaria": "qué API usar",
            "parametros": {"filtros": "que necesitas"},
            "acciones": ["que acciones ejecutar"],
            "respuesta_usuario": "respuesta conversacional"
        }
        `
  }

  // 🔧 Procesamiento local inteligente (mientras configuramos Gemini)
  async procesarLocal(pregunta) {
    console.log('🔍 Analizando pregunta localmente...')

    // 🎯 Palabras clave para identificar intención
    const analisis = this.analizarPregunta(pregunta)

    // 🚀 Ejecutar acción real basada en análisis
    if (analisis.intencion && analisis.parametros) {
      console.log('🎯 Ejecutando acción:', analisis.intencion, analisis.parametros)

      try {
        // Usar el integrador para ejecutar acciones reales
        const resultado = await santoroIntegrator.ejecutarAccion(
          analisis.intencion,
          analisis.parametros
        )

        if (resultado.exito) {
          return {
            respuesta: resultado.mensaje,
            acciones: resultado.accionesDisponibles || [],
            datos: resultado.datos,
            resumen: resultado.resumen,
            insights: resultado.insights,
            tipo: analisis.intencion
          }
        } else {
          return {
            respuesta: resultado.mensaje,
            acciones: resultado.sugerencias ? ['mostrar_ayuda'] : [],
            datos: null,
            sugerencias: resultado.sugerencias,
            error: false
          }
        }
      } catch (error) {
        console.error('Error ejecutando acción:', error)
        return {
          respuesta: 'Tuve un problema procesando tu solicitud. ¿Puedes ser más específico?',
          acciones: ['mostrar_ayuda'],
          datos: null,
          error: true
        }
      }
    }

    // Si no se pudo analizar, respuesta genérica
    return {
      respuesta: this.generarRespuestaGenerica(pregunta),
      acciones: ['mostrar_ayuda'],
      datos: null,
      tipo: 'consulta_general'
    }
  }

  // 🎯 Análisis avanzado de preguntas
  analizarPregunta(pregunta) {
    const preguntaLower = pregunta.toLowerCase()

    // 🔍 BÚSQUEDA DE ERRORES
    if (this.contienePatron(preguntaLower, ['busca', 'buscar', 'encuentra']) &&
      this.contienePatron(preguntaLower, ['error', 'fallo', 'problema'])) {

      const codigo = this.extraerCodigo(pregunta)
      if (codigo) {
        return {
          intencion: 'buscar_errores',
          parametros: { codigo }
        }
      }
    }

    // 👤 BÚSQUEDA DE SESIÓN/USUARIO
    if (this.contienePatron(preguntaLower, ['sesion', 'sesión', 'usuario', 'usr'])) {
      const baseCode = this.extraerBaseCode(pregunta)
      if (baseCode) {
        return {
          intencion: 'buscar_sesion',
          parametros: { baseCode }
        }
      }
    }

    // � EVENTOS
    if (this.contienePatron(preguntaLower, ['eventos', 'evento', 'actividad'])) {
      const periodo = this.extraerPeriodo(preguntaLower)
      return {
        intencion: 'obtener_eventos',
        parametros: { periodo }
      }
    }

    // 📅 FILTROS DE FECHA
    if (this.contienePatron(preguntaLower, ['ayer', 'hoy', 'semana', 'mes', 'día', 'fecha'])) {
      const fecha = this.extraerFecha(preguntaLower)
      return {
        intencion: 'filtrar_por_fecha',
        parametros: { fechaInicio: fecha, tipo: 'general' }
      }
    }

    return { intencion: null, parametros: null }
  }

  // 🛠️ MÉTODOS AUXILIARES DE ANÁLISIS

  contienePatron(texto, palabras) {
    return palabras.some(palabra => texto.includes(palabra))
  }

  extraerCodigo(texto) {
    // Buscar patrones de código como USR02808190918-SUC001
    const patrones = [
      /USR\d{11}-\w+/gi,  // USR02808190918-SUC001
      /USR\d{11}/gi,      // USR02808190918
      /\b[A-Z]{3}\d+\b/gi // Códigos genéricos
    ]

    for (const patron of patrones) {
      const coincidencia = texto.match(patron)
      if (coincidencia) {
        return coincidencia[0]
      }
    }

    return null
  }

  extraerBaseCode(texto) {
    // Buscar baseCode específicamente
    const patron = /USR\d{11}/gi
    const coincidencia = texto.match(patron)
    return coincidencia ? coincidencia[0] : null
  }

  extraerPeriodo(texto) {
    if (texto.includes('hoy') || texto.includes('día')) return 'dia'
    if (texto.includes('ayer')) return 'dia'
    if (texto.includes('semana')) return 'semana'
    if (texto.includes('mes')) return 'mes'
    if (texto.includes('abierto')) return 'abiertos'
    return 'general'
  }

  extraerFecha(texto) {
    if (texto.includes('hoy')) return 'hoy'
    if (texto.includes('ayer')) return 'ayer'
    if (texto.includes('semana')) return 'semana'
    if (texto.includes('mes')) return 'mes'
    return 'hoy'
  }

  generarRespuestaGenerica(pregunta) {
    return `Hola! Entendí que me preguntas sobre: "${pregunta}".

Puedo ayudarte con:
🔍 Buscar errores específicos (ej: "busca error USR02808190918")
👤 Información de usuarios/sesiones (ej: "sesión USR02808190918")
📊 Eventos y estadísticas (ej: "eventos de ayer")
📅 Filtrar por fechas (ej: "errores de esta semana")

¿Puedes ser más específico?`
  }

  // 🔑 Configurar API Key de Gemini
  configurarAPIKey(apiKey) {
    this.apiKey = apiKey
    console.log('✅ Santoro configurado con Gemini AI')
  }

  // 🌐 Llamada a Google Gemini (cuando tengamos API key)
  async llamarGemini() {
    // Implementaremos esto después de obtener la API key
    console.log('🚀 Llamando a Gemini AI...')
    // Por ahora, placeholder
    return {
      texto: "Respuesta de Gemini",
      acciones: [],
      datos: null,
      confianza: 0.95
    }
  }

  // 📊 OBTENER ESTADÍSTICAS DEL SISTEMA
  obtenerEstadisticasSistema() {
    return {
      configurado: this.configurado,
      geminiConfigurado: !!this.apiKey,
      controladores: {
        accion: !!this.controladores.accion,
        router: !!this.controladores.router,
        modal: !!this.controladores.modal,
        componente: this.controladores.componente?.obtenerEstado() || null,
        gemini: this.controladores.gemini?.obtenerEstadisticas() || null
      },
      capacidades: Object.keys(this.systemContext.capacidades),
      comandosDisponibles: Object.keys(this.systemContext.comandos),
      version: '2.0.0-advanced',
      ultimaActualizacion: new Date().toISOString()
    }
  }

  // 🎛️ CONTROL AVANZADO DEL SISTEMA
  async ejecutarComandoSistema(comando, parametros = {}) {
    try {
      switch (comando) {
        case 'reiniciar':
          return await this.reiniciarSistema()

        case 'diagnostico':
          return await this.ejecutarDiagnostico()

        case 'limpiar_cache':
          return await this.limpiarCache()

        case 'configurar_voz':
          return await this.configurarVoz(parametros)

        case 'modo_debug':
          return this.activarModoDebug(parametros.activar)

        default:
          return { exito: false, error: `Comando "${comando}" no reconocido` }
      }
    } catch (error) {
      return { exito: false, error: error.message }
    }
  }

  // 🔄 REINICIAR SISTEMA
  async reiniciarSistema() {
    try {
      // Limpiar estados
      this.controladores.componente?.limpiarEstado()

      // Reinicializar
      await this.inicializar({
        geminiApiKey: this.apiKey,
        contextoSistema: this.systemContext
      })

      return {
        exito: true,
        mensaje: 'Sistema Santoro reiniciado correctamente',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return { exito: false, error: error.message }
    }
  }

  // 🔍 EJECUTAR DIAGNÓSTICO
  async ejecutarDiagnostico() {
    const diagnostico = {
      sistema: this.obtenerEstadisticasSistema(),
      integraciones: {
        gemini: this.controladores.gemini?.obtenerEstadisticas(),
        integrator: true // santoroIntegrator siempre disponible
      },
      rendimiento: {
        memoriaUsada: performance.memory?.usedJSHeapSize || 'N/A',
        tiempoRespuesta: 'Óptimo',
        erroresRecientes: 0
      }
    }

    return {
      exito: true,
      diagnostico,
      recomendaciones: this.generarRecomendaciones(diagnostico)
    }
  }

  // 📝 GENERAR RECOMENDACIONES
  generarRecomendaciones(diagnostico) {
    const recomendaciones = []

    if (!diagnostico.sistema.geminiConfigurado) {
      recomendaciones.push('Configurar API key de Google Gemini para capacidades avanzadas')
    }

    if (!diagnostico.sistema.configurado) {
      recomendaciones.push('Ejecutar inicialización completa del sistema')
    }

    return recomendaciones
  }
}

// 🎯 Exportar instancia única (Singleton)
export const santoroAI = new SantoroAI()
export default santoroAI
