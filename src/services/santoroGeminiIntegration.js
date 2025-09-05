// 🧠 SANTORO GEMINI INTEGRATION - IA Súper Avanzada
// Integración completa con Google Gemini AI para comprensión avanzada

import axios from 'axios'

class SantoroGeminiIntegration {
  constructor() {
    this.apiKey = null
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    this.configurado = false
    this.contextoSistema = null
  }

  // 🔧 CONFIGURACIÓN inicial
  configurar(apiKey, contextoSistema) {
    this.apiKey = apiKey
    this.configurado = !!apiKey
    this.contextoSistema = contextoSistema || this.getContextoSistemaPorDefecto()

    console.log('🤖 Gemini AI configurado:', this.configurado)
    return this.configurado
  }

  // 🧠 PROCESAMIENTO principal con Gemini
  async procesarComandoAvanzado(comando, contexto = {}) {
    if (!this.configurado) {
      console.warn('🚫 Gemini no configurado, usando procesamiento local')
      return await this.procesarComandoLocal(comando)
    }

    try {
      console.log('🧠 Procesando con Gemini AI:', comando)

      // Construir prompt optimizado
      const prompt = this.construirPromptAvanzado(comando, contexto)

      // Llamar a Gemini API
      const respuestaGemini = await this.llamarGeminiAPI(prompt)

      if (respuestaGemini) {
        // Procesar respuesta de Gemini
        const resultadoProcesado = this.procesarRespuestaGemini(respuestaGemini)

        if (resultadoProcesado.exito) {
          return resultadoProcesado
        }
      }

      // Fallback a procesamiento local si Gemini falla
      console.warn('🔄 Gemini falló, usando procesamiento local')
      return await this.procesarComandoLocal(comando)

    } catch (error) {
      console.error('💥 Error en Gemini AI:', error)
      return await this.procesarComandoLocal(comando)
    }
  }

  // 🔨 CONSTRUCCIÓN de prompt optimizado
  construirPromptAvanzado(comando, contexto) {
    return `${this.contextoSistema}

ENTRADA DEL USUARIO: "${comando}"

CONTEXTO ADICIONAL:
${contexto.usuario ? `- Usuario: ${contexto.usuario}` : ''}
${contexto.pagina ? `- Página actual: ${contexto.pagina}` : ''}
${contexto.filtros ? `- Filtros activos: ${JSON.stringify(contexto.filtros)}` : ''}
${contexto.datosRecientes ? `- Datos recientes: ${contexto.datosRecientes.slice(0, 3).map(d => d.descripcion || d.mensaje || '').join(', ')}` : ''}

INSTRUCCIONES:
1. Analiza la intención del usuario
2. Determina qué acciones específicas necesita
3. Genera una respuesta útil y natural
4. Si se necesitan datos específicos, inclúyelos en "datos_necesarios"
5. Si hay acciones a ejecutar, inclúyelas en "acciones"

RESPUESTA REQUERIDA (JSON válido):
{
    "intencion": "descripción de lo que quiere el usuario",
    "confianza": 0.95,
    "respuesta_usuario": "respuesta natural y amigable para el usuario",
    "acciones": [
        {
            "tipo": "nombre_accion",
            "parametros": {},
            "prioridad": 1
        }
    ],
    "datos_necesarios": [
        "tipo_de_dato_si_se_necesita"
    ],
    "aclaraciones": [
        "preguntas adicionales si necesitas más información"
    ]
}`
  }

  // 🌐 LLAMADA a la API de Gemini
  async llamarGeminiAPI(prompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "text/plain"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      )

      return response.data
    } catch (error) {
      console.error('❌ Error llamando Gemini API:', error.response?.data || error.message)
      throw error
    }
  }

  // 🔍 PROCESAMIENTO de respuesta de Gemini
  procesarRespuestaGemini(respuesta) {
    try {
      // Extraer solo el contenido JSON, eliminando markdown si existe
      let contenido = respuesta.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!contenido) {
        throw new Error('Respuesta vacía de Gemini')
      }

      // Limpiar respuesta de markdown si está envuelta
      contenido = contenido.trim()

      // Si la respuesta viene envuelta en ```json, extraer solo el JSON
      if (contenido.includes('```json')) {
        const match = contenido.match(/```json\s*([\s\S]*?)\s*```/)
        if (match) {
          contenido = match[1].trim()
        }
      }

      // Si empieza con ``` sin json, también limpiar
      if (contenido.startsWith('```') && !contenido.startsWith('```json')) {
        contenido = contenido.replace(/^```[\w]*\s*/, '').replace(/```$/, '').trim()
      }

      // Intentar parsear JSON
      const respuestaJSON = JSON.parse(contenido)

      // Validar estructura
      if (!respuestaJSON.intencion || !respuestaJSON.respuesta_usuario) {
        throw new Error('Estructura de respuesta inválida')
      }

      return {
        exito: true,
        intencion: respuestaJSON.intencion,
        confianza: respuestaJSON.confianza || 0.8,
        acciones: respuestaJSON.acciones || [],
        respuesta: respuestaJSON.respuesta_usuario,
        aclaraciones: respuestaJSON.aclaraciones || [],
        datosNecesarios: respuestaJSON.datos_necesarios || [],
        fuente: 'gemini'
      }

    } catch (error) {
      console.error('Error procesando respuesta Gemini:', error)

      // Si no se puede parsear, usar procesamiento local
      return {
        exito: false,
        error: error.message,
        fallback: true
      }
    }
  }

  // 🏠 PROCESAMIENTO local como fallback
  async procesarComandoLocal(comando) {
    console.log('🔍 Analizando pregunta localmente...')

    // Patrones de reconocimiento de intención
    const patrones = {
      // Navegación
      navegacion: [
        /(?:abre?|abrir|ir a|navegar?|mostrar?)\s*(diagnostico|diagnóstico|filtros?|ayuda|dashboard|reportes?)/i,
        /(?:ve a|dirigir?se?)\s*(diagnostico|diagnóstico|filtros?|ayuda)/i
      ],

      // Configuración
      configuracion: [
        /(?:configura?r?|establecer?)\s*(gemini|ia|ai|clave|apikey|api[\s-]?key)/i,
        /(?:conectar?|configurar?)\s*(?:con)?\s*gemini/i
      ],

      // Búsqueda y análisis
      busqueda: [
        /(?:busca?r?|encontrar?|analizar?)\s*(.+)/i,
        /(?:muestra?r?|ver)\s*(.+)/i,
        /(?:filtrar?|filtros?)\s*(.+)/i
      ],

      // Ayuda
      ayuda: [
        /(?:ayuda|help|que puedes hacer|comandos?)/i,
        /(?:como|cómo)\s*(.+)/i
      ],

      // Saludos
      saludo: [
        /^(?:hola|hello|hi|buenas?|saludos?)$/i
      ]
    }

    // Detectar intención
    const intencion = this.detectarPatron(comando, patrones)

    // Generar respuesta local
    return await this.generarRespuestaLocal(intencion, comando)
  }

  // 🎯 DETECTAR patrón de comando
  detectarPatron(texto, patrones) {
    for (const [intencion, expresiones] of Object.entries(patrones)) {
      for (const regex of expresiones) {
        if (regex.test(texto)) {
          return intencion
        }
      }
    }
    return 'general'
  }

  // 🏗️ GENERAR respuesta local
  async generarRespuestaLocal(intencion, comando) {
    switch (intencion) {
      case 'navegacion':
        return await this.procesarNavegacionLocal(comando)

      case 'configuracion':
        return {
          exito: true,
          intencion: 'configurar_gemini',
          respuesta: '🤖 Te ayudo a configurar Gemini AI. Necesitarás tu API Key de Google.',
          acciones: [{ tipo: 'abrir_configuracion_gemini', parametros: {}, prioridad: 1 }],
          fuente: 'local'
        }

      case 'ayuda':
        return {
          exito: true,
          intencion: 'mostrar_ayuda',
          respuesta: '💡 Aquí tienes toda la información sobre mis comandos y funcionalidades.',
          acciones: [{ tipo: 'mostrar_ayuda', parametros: {}, prioridad: 1 }],
          fuente: 'local'
        }

      case 'saludo':
        return {
          exito: true,
          intencion: 'saludo',
          respuesta: '👋 ¡Hola! Soy Santoro, tu asistente inteligente. ¿En qué te puedo ayudar hoy?',
          acciones: [],
          fuente: 'local'
        }

      default:
        return {
          exito: true,
          intencion: 'general',
          respuesta: `🔍 Entiendo que quieres: "${comando}". ¿Podrías ser más específico sobre qué acción necesitas?`,
          acciones: [],
          aclaraciones: ['¿Qué tipo de información específica necesitas?', '¿Hay algún módulo particular al que quieres acceder?'],
          fuente: 'local'
        }
    }
  }

  // 🧭 PROCESAMIENTO de navegación local
  async procesarNavegacionLocal(comando) {
    const navegaciones = {
      'diagnostico': { accion: 'abrir_diagnostico', mensaje: '🏥 Abriendo diagnóstico avanzado...' },
      'diagnóstico': { accion: 'abrir_diagnostico', mensaje: '🏥 Abriendo diagnóstico avanzado...' },
      'filtros': { accion: 'abrir_filtros', mensaje: '🔍 Abriendo filtros inteligentes...' },
      'ayuda': { accion: 'mostrar_ayuda', mensaje: '💡 Mostrando ayuda completa...' },
      'dashboard': { accion: 'abrir_dashboard', mensaje: '📊 Cargando dashboard principal...' },
      'reportes': { accion: 'generar_reporte', mensaje: '📊 Preparando generador de reportes...' }
    }

    for (const [clave, config] of Object.entries(navegaciones)) {
      if (comando.toLowerCase().includes(clave)) {
        return {
          exito: true,
          intencion: `abrir_${clave}`,
          respuesta: config.mensaje,
          acciones: [{ tipo: config.accion, parametros: {}, prioridad: 1 }],
          fuente: 'local'
        }
      }
    }

    return {
      exito: true,
      intencion: 'navegacion_general',
      respuesta: '🧭 ¿A dónde quieres ir? Puedo abrir: diagnóstico, filtros, ayuda, dashboard o reportes.',
      acciones: [],
      fuente: 'local'
    }
  }

  // 🏗️ CONTEXTO del sistema por defecto
  getContextoSistemaPorDefecto() {
    return `Eres SANTORO, un asistente de IA especializado en análisis de logs y diagnósticos de sistemas.

PERSONALIDAD:
- Eres profesional, eficiente y amigable
- Siempre intentas resolver problemas de forma proactiva
- Das respuestas claras y estructuradas
- Usas emojis para hacer las conversaciones más amigables

CAPACIDADES:
- Análisis de logs y eventos del sistema
- Diagnósticos técnicos avanzados
- Generación de reportes y exportaciones
- Navegación por módulos del dashboard
- Configuración de filtros inteligentes
- Búsquedas contextuales

MÓDULOS DISPONIBLES:
- Diagnóstico: Análisis profundo del sistema
- Filtros: Búsquedas y filtros inteligentes
- Dashboard: Visualización de métricas
- Reportes: Exportación de datos
- Configuración: Ajustes del sistema

ACCIONES PRINCIPALES que puedes ejecutar:
- abrir_diagnostico: Abrir módulo de diagnóstico
- abrir_filtros: Abrir panel de filtros
- mostrar_ayuda: Mostrar ayuda del sistema
- generar_reporte: Crear reportes
- abrir_dashboard: Ir al dashboard principal
- abrir_configuracion_gemini: Configurar IA avanzada

Siempre responde en JSON válido con la estructura exacta solicitada.`
  }

  // 🧪 MÉTODO de prueba
  async probarConexion() {
    if (!this.configurado) {
      return { exito: false, mensaje: 'API Key no configurada' }
    }

    try {
      const respuesta = await this.procesarComandoAvanzado('¿Estás funcionando correctamente?')
      return {
        exito: true,
        mensaje: 'Conexión con Gemini exitosa',
        respuesta: respuesta
      }
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error en la conexión',
        error: error.message
      }
    }
  }
}

// 🎯 Instancia global
export const santoroGeminiIntegration = new SantoroGeminiIntegration()
export default santoroGeminiIntegration
