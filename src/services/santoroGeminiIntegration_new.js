// 🧠 SANTORO GEMINI INTEGRATION - IA Súper Avanzada
// Integración completa con Google Gemini AI para comprensión avanzada

import axios from 'axios'
import { santoroContextService } from './santoroContextService.js'

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
      console.error('❌ Error con Gemini API:', error)
      return await this.procesarComandoLocal(comando)
    }
  }

  // 🔨 CONSTRUCCIÓN de prompt optimizado con contexto inteligente COMPLETO
  construirPromptAvanzado(comando, contexto) {
    // Obtener contexto actual del servicio
    const contextoActual = santoroContextService.obtenerContextoParaIA()

    // Combinar contexto proporcionado con contexto del servicio
    const contextoCompleto = {
      ...contexto,
      ...contextoActual
    }

    return `Eres SANTORO, un asistente de IA especializado en análisis de logs, diagnósticos de sistemas y TODA la funcionalidad de la aplicación web Dashboard-Logs.

🎯 CONTEXTO ACTUAL DEL USUARIO:
- Módulo actual: ${contextoCompleto.modulo || 'desconocido'}
- Ruta: ${contextoCompleto.ruta || 'desconocida'}
- Flujo activo: ${contextoCompleto.flujo || 'mobile'}
- Vista actual: ${contextoCompleto.tipoVista || 'no especificada'}
- Filtros activos: ${contextoCompleto.filtrosActivos ? 'SÍ' : 'NO'}
- Filtros aplicados: ${contextoCompleto.filtros && Object.keys(contextoCompleto.filtros).length > 0 ? JSON.stringify(contextoCompleto.filtros) : 'ninguno'}

🛠️ CAPACIDADES DISPONIBLES AHORA:
- Acciones posibles: ${contextoCompleto.accionesDisponibles?.join(', ') || 'navegación, filtrado, búsqueda, exportación, configuración, diagnóstico, análisis'}
- Filtros disponibles: ${contextoCompleto.filtrosDisponibles?.join(', ') || 'fecha, oficina, usuario, tipo, proceso, dispositivo'}
- Módulos accesibles: Dashboard Desktop, Dashboard Mobile, Escritorio, Logs, Eventos, Estadísticas, Diagnóstico, Configuración Santoro
- Flujos disponibles: Mobile, Desktop, Consola, Gráficas

💡 SUGERENCIAS CONTEXTUALES:
${contextoCompleto.sugerencias?.map(s => `- ${s}`).join('\n') || '- Navegar entre módulos usando el menú lateral\n- Aplicar filtros para análisis específicos\n- Cambiar entre flujos mobile/desktop\n- Usar búsqueda inteligente\n- Exportar datos y reportes\n- Configurar parámetros del sistema'}

⏰ HISTORIAL RECIENTE:
${contextoCompleto.historialReciente?.map(h => `- ${h.modulo} (${new Date(h.timestamp).toLocaleTimeString()})`).join('\n') || '- Sin historial reciente'}

ENTRADA DEL USUARIO: "${comando}"

CONTEXTO ADICIONAL ESPECÍFICO:
- Usuario: ${contexto.usuario || 'no especificado'}
- Datos recientes: ${contexto.datosRecientes ? contexto.datosRecientes.slice(0, 3).map(d => d.descripcion || d.mensaje || 'sin descripción').join(', ') : 'logs, eventos, estadísticas disponibles'}

INSTRUCCIONES INTELIGENTES COMPLETAS:
1. ANALIZA el contexto actual - el usuario está en "${contextoCompleto.modulo}" usando flujo "${contextoCompleto.flujo}"
2. INTERPRETA la intención considerando TODA la aplicación web - no solo logs
3. PUEDES ASISTIR EN: navegación, filtrado, búsqueda, exportación, configuración, diagnóstico, análisis, cambio de vistas, gestión de datos
4. Si pide cambiar de módulo/página, NAVEGA correctamente
5. Si pide filtros, aplica filtros contextuales del módulo actual
6. Si pide análisis, usa las herramientas de diagnóstico y estadísticas
7. Si pide configuración, accede a las opciones de configuración
8. GUÍA al usuario en CUALQUIER funcionalidad de la web
9. SUGIERE mejores flujos de trabajo y optimizaciones

CAPACIDADES COMPLETAS POR MÓDULO:
- LOGIN: autenticación, navegación inicial
- DASHBOARD: visualización KPIs, navegación rápida, resumen general
- ESCRITORIO: consola avanzada, gráficas interactivas, análisis detallado
- LOGS: filtrado avanzado, búsqueda, paginación, exportación
- EVENTOS: análisis de eventos, filtrado por tipo, seguimiento
- ESTADÍSTICAS: gráficas, métricas, comparativas, exportación de reportes
- DIAGNÓSTICO: análisis técnico, detección de problemas, recomendaciones
- CONFIGURACIÓN: parámetros del sistema, configuración de Santoro AI

TIPOS DE RESPUESTA SEGÚN CONTEXTO:
- Si está en "login": autenticar, navegar a dashboard
- Si está en "dashboard": navegar módulos, ver KPIs, cambiar flujo, acceder funciones
- Si está en "escritorio": usar consola, ver gráficas, aplicar filtros, analizar datos
- Si está en "logs": filtrar, buscar, paginar, exportar, analizar logs específicos
- Si está en "eventos": filtrar eventos, analizar patrones, exportar datos
- Si está en "estadisticas": cambiar gráficas, comparar métricas, exportar reportes
- Si está en "diagnostico": ejecutar diagnósticos, analizar problemas, ver recomendaciones
- Si está en "configuracion": modificar parámetros, configurar IA, ajustar sistema

RESPUESTA REQUERIDA (JSON válido):
{
    "intencion": "descripción específica considerando el contexto actual y TODA la aplicación",
    "confianza": 0.95,
    "respuesta_usuario": "respuesta natural explicando qué harás en el contexto actual de la aplicación completa",
    "acciones": [
        {
            "tipo": "nombre_accion_específica_del_contexto_completo",
            "parametros": {"contextual": true, "modulo": "actual_o_destino"},
            "prioridad": 1
        }
    ],
    "datos_necesarios": [],
    "aclaraciones": [
        "orientación contextual completa si es necesaria"
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
          timeout: 10000
        }
      )

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text
      }

      return null
    } catch (error) {
      console.error('Error en llamada a Gemini API:', error)
      throw error
    }
  }

  // 🔍 PROCESAR respuesta de Gemini
  procesarRespuestaGemini(respuesta) {
    try {
      let contenido = respuesta

      if (!contenido || contenido.trim().length === 0) {
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

  // 🏠 PROCESAMIENTO local inteligente con contexto
  async procesarComandoLocal(comando) {
    console.log('🔍 Analizando pregunta localmente con contexto...')

    // Obtener contexto actual
    const contextoActual = santoroContextService.obtenerContextoParaIA()
    console.log('🧭 Contexto para análisis:', contextoActual)

    // Patrones de reconocimiento contextual
    const patrones = this.obtenerPatronesContextuales(contextoActual)

    // Detectar intención
    const intencion = this.detectarPatron(comando, patrones)

    // Generar respuesta local contextual
    return await this.generarRespuestaLocalContextual(intencion, comando, contextoActual)
  }

  // 🧠 OBTENER patrones contextuales
  obtenerPatronesContextuales(contexto) {
    const patronesBase = {
      // Navegación
      navegacion: [
        /(?:abre?|abrir|ir a|navegar?|mostrar?)\s*(diagnostico|diagnóstico|filtros?|ayuda|dashboard|reportes?|consola|estadisticas|eventos)/i,
        /(?:ve a|dirigir?se?)\s*(diagnostico|diagnóstico|filtros?|ayuda|logs|eventos)/i,
        /(?:navega a|ir a)\s*(logs|estadisticas|eventos|diagnostico)/i
      ],

      // Consola específica
      consola: [
        /(?:abre?|abrir|mostrar?)\s*(?:la)?\s*consola/i,
        /(?:ver|mostrar)\s*(?:los)?\s*logs?\s*(?:en)?\s*consola/i,
        /consola\s*(?:de)?\s*logs?/i
      ],

      // Cambio de flujo/vista
      cambio_flujo: [
        /(?:cambiar?|cambiar|usar)\s*(?:a)?\s*(?:vista|flujo|modo)?\s*(mobile|movil|móvil|escritorio|desktop)/i,
        /(?:ver|mostrar)\s*(?:en)?\s*(mobile|movil|móvil|escritorio|desktop)/i,
        /(?:activar?|usar)\s*(?:modo|vista)?\s*(mobile|escritorio)/i
      ],

      // Filtros específicos
      filtros: [
        /(?:aplicar?|usar|poner)\s*(?:filtro|filtros)\s*(?:de|por)?\s*(.+)/i,
        /(?:filtrar?)\s*(?:por|de)?\s*(.+)/i,
        /(?:buscar?|mostrar)\s*(?:solo|únicamente)?\s*(.+)/i,
        /(?:ver|mostrar)\s*(?:registros|logs|datos)\s*(?:de|desde|entre)\s*(.+)/i
      ],

      // Configuración
      configuracion: [
        /(?:configura?r?|establecer?)\s*(gemini|ia|ai|clave|apikey|api[\s-]?key)/i,
        /(?:conectar?|configurar?)\s*(?:con)?\s*gemini/i
      ],

      // Búsqueda y análisis
      busqueda: [
        /(?:busca?r?|encontrar?|analizar?)\s*(.+)/i,
        /(?:muestra?r?|ver)\s*(.+)/i
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

    // Adaptar patrones según contexto
    return this.adaptarPatronesAlContexto(patronesBase, contexto)
  }

  // 🎯 ADAPTAR patrones al contexto actual
  adaptarPatronesAlContexto(patrones, contexto) {
    // Agregar patrones específicos según el módulo actual
    if (contexto.modulo === 'dashboard') {
      patrones.dashboard_especifico = [
        /(?:ver|mostrar|abrir)\s*(graficas|gráficas|metricas|métricas|charts)/i,
        /(?:exportar|descargar)\s*(datos|csv|excel)/i
      ]
    }

    if (contexto.modulo === 'diagnostico') {
      patrones.diagnostico_especifico = [
        /(?:ejecutar|correr|hacer)\s*(diagnostico|diagnóstico|chequeo)/i,
        /(?:ver|mostrar)\s*(estado|salud|health|status)/i
      ]
    }

    // Agregar patrones de flujo específicos si no está en el correcto
    if (contexto.flujo === 'mobile' && contexto.modulo === 'dashboard') {
      patrones.sugerencia_flujo = [
        /(?:ver|necesito|quiero)\s*(más|mas)\s*(opciones|funciones)/i
      ]
    }

    return patrones
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

  // 📊 GENERAR respuesta local contextual
  async generarRespuestaLocalContextual(intencion, comando, contexto) {
    // Respuestas adaptadas al contexto
    const respuesta = await this.generarRespuestaLocal(intencion, comando)

    // Enriquecer con información contextual
    if (respuesta && contexto) {
      respuesta.contexto = {
        moduloActual: contexto.modulo,
        flujoActual: contexto.flujo,
        sugerenciasContextuales: contexto.sugerencias
      }

      // Agregar sugerencias contextuales si la respuesta es general
      if (intencion === 'general' && contexto.sugerencias?.length > 0) {
        respuesta.respuesta += `\n\n💡 Según donde estás, te sugiero: ${contexto.sugerencias[0]}`
      }

      // Mejorar respuestas de cambio de flujo
      if (intencion === 'cambio_flujo') {
        respuesta.acciones = respuesta.acciones.map(accion => ({
          ...accion,
          parametros: {
            ...accion.parametros,
            contextoActual: contexto.modulo,
            necesitaNavegacion: true
          }
        }))
      }
    }

    return respuesta
  }

  // 🏗️ GENERAR respuesta local
  async generarRespuestaLocal(intencion, comando) {
    switch (intencion) {
      case 'navegacion':
        return await this.procesarNavegacionLocal(comando)

      case 'consola':
        return {
          exito: true,
          intencion: 'abrir_consola',
          respuesta: '🖥️ ¡Perfecto! Abriendo la consola de logs para que puedas ver todos los registros del sistema.',
          acciones: [{ tipo: 'abrir_consola', parametros: {}, prioridad: 1 }],
          fuente: 'local'
        }

      case 'cambio_flujo':
        return await this.procesarCambioFlujo(comando)

      case 'filtros':
        return await this.procesarFiltros(comando)

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
      'diagnostico': { accion: 'navegar_a', ruta: '/diagnostico', mensaje: '🏥 Abriendo diagnóstico avanzado...' },
      'diagnóstico': { accion: 'navegar_a', ruta: '/diagnostico', mensaje: '🏥 Abriendo diagnóstico avanzado...' },
      'estadisticas': { accion: 'navegar_a', ruta: '/estadisticas', mensaje: '📊 Abriendo estadísticas y gráficas...' },
      'eventos': { accion: 'navegar_a', ruta: '/eventos', mensaje: '📋 Mostrando eventos del sistema...' },
      'dashboard': { accion: 'navegar_a', ruta: '/logs', mensaje: '📊 Cargando dashboard principal...' },
      'logs': { accion: 'navegar_a', ruta: '/logs', mensaje: '📊 Cargando dashboard de logs...' }
    }

    for (const [clave, config] of Object.entries(navegaciones)) {
      if (comando.toLowerCase().includes(clave)) {
        return {
          exito: true,
          intencion: 'navegar_a',
          respuesta: config.mensaje,
          acciones: [{ tipo: config.accion, parametros: { ruta: config.ruta }, prioridad: 1 }],
          fuente: 'local'
        }
      }
    }

    return {
      exito: true,
      intencion: 'navegacion_general',
      respuesta: '🧭 ¿A dónde quieres ir? Puedo abrir: diagnóstico, estadísticas, eventos o el dashboard principal.',
      acciones: [],
      fuente: 'local'
    }
  }

  // 🔄 PROCESAMIENTO de cambio de flujo
  async procesarCambioFlujo(comando) {
    const comandoLower = comando.toLowerCase()

    if (comandoLower.includes('escritorio') || comandoLower.includes('desktop')) {
      return {
        exito: true,
        intencion: 'cambiar_flujo',
        respuesta: '🖥️ ¡Perfecto! Cambiando al flujo de escritorio con todas las funcionalidades avanzadas.',
        acciones: [
          { tipo: 'cambiar_flujo', parametros: { flujo: 'escritorio' }, prioridad: 1 },
          { tipo: 'navegar_a', parametros: { ruta: '/logs' }, prioridad: 2 }
        ],
        fuente: 'local'
      }
    }

    if (comandoLower.includes('mobil') || comandoLower.includes('móvil') || comandoLower.includes('movil') || comandoLower.includes('phone')) {
      return {
        exito: true,
        intencion: 'cambiar_flujo',
        respuesta: '📱 ¡Listo! Cambiando al flujo móvil optimizado para pantallas pequeñas.',
        acciones: [
          { tipo: 'cambiar_flujo', parametros: { flujo: 'mobile' }, prioridad: 1 },
          { tipo: 'navegar_a', parametros: { ruta: '/logs' }, prioridad: 2 }
        ],
        fuente: 'local'
      }
    }

    return {
      exito: true,
      intencion: 'cambio_flujo_general',
      respuesta: '🔄 ¿Qué flujo prefieres usar? Puedo configurar el modo escritorio o móvil según tus necesidades.',
      acciones: [],
      fuente: 'local'
    }
  }

  // 🏷️ PROCESAMIENTO de filtros
  async procesarFiltros(comando) {
    const comandoLower = comando.toLowerCase()

    if (comandoLower.includes('fecha') || comandoLower.includes('calendario') || comandoLower.includes('tiempo')) {
      return {
        exito: true,
        intencion: 'aplicar_filtro',
        respuesta: '📅 ¡Perfecto! Abriendo los filtros de fecha para que puedas seleccionar el rango temporal.',
        acciones: [{ tipo: 'aplicar_filtro', parametros: { tipo: 'fecha' }, prioridad: 1 }],
        fuente: 'local'
      }
    }

    if (comandoLower.includes('limpia') || comandoLower.includes('clear') || comandoLower.includes('reset') || comandoLower.includes('borrar')) {
      return {
        exito: true,
        intencion: 'aplicar_filtro',
        respuesta: '🧹 ¡Listo! Limpiando todos los filtros para mostrar toda la información disponible.',
        acciones: [{ tipo: 'aplicar_filtro', parametros: { tipo: 'limpiar' }, prioridad: 1 }],
        fuente: 'local'
      }
    }

    if (comandoLower.includes('error') || comandoLower.includes('fallo') || comandoLower.includes('failed')) {
      return {
        exito: true,
        intencion: 'aplicar_filtro',
        respuesta: '❌ Aplicando filtro para mostrar solo los eventos con errores y fallos.',
        acciones: [{ tipo: 'aplicar_filtro', parametros: { tipo: 'errores' }, prioridad: 1 }],
        fuente: 'local'
      }
    }

    return {
      exito: true,
      intencion: 'filtros_general',
      respuesta: '🏷️ ¿Qué filtros quieres aplicar? Puedo ayudarte con filtros de fecha, limpiar todos los filtros, filtrar errores, o cualquier otro tipo de filtrado.',
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
- Estadísticas: Visualización de métricas
- Eventos: Registro de eventos del sistema
- Dashboard: Vista general de logs

ACCIONES PRINCIPALES que puedes ejecutar:
- navegar_a: Ir a un módulo específico
- abrir_consola: Abrir consola de logs
- cambiar_flujo: Cambiar entre mobile/escritorio
- aplicar_filtro: Aplicar filtros específicos
- mostrar_ayuda: Mostrar ayuda del sistema

IMPORTANTE: Siempre considera el contexto actual del usuario para dar respuestas más precisas.

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
