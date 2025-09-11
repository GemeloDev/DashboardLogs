/**
 * SantoroAssistantIntegrator
 * Integrador principal para el asistente IA con precisión absoluta
 * Combina detección de contexto, control de filtros y ejecución de acciones
 */

import { santoroContextMaster } from './santoroContextMaster.js'
import { procesarComandoFiltroFechas } from './santoroFiltroDateIntegration.js'

export class SantoroAssistantIntegrator {
  constructor() {
    this.contextMaster = santoroContextMaster
    this.comandosEjecutandose = new Set()
    this.historialAcciones = []
    this.patrones = this.inicializarPatrones()
  }

  inicializarPatrones() {
    return {
      // Patrones para detectar intenciones
      cambiarFlujo: {
        escritorio: /(?:cambiar?|ir|abrir|mostrar).*(escritorio|desktop|pc)/i,
        movil: /(?:cambiar?|ir|abrir|mostrar).*(móvil|movil|mobile|celular|teléfono)/i
      },

      abrirModulo: {
        diagnostico: /(?:abrir?|mostrar|ir a).*(diagnóstico|diagnostico|diagnostic)/i,
        eventos: /(?:abrir?|mostrar|ir a).*(eventos|events)/i,
        estadisticas: /(?:abrir?|mostrar|ir a).*(estadísticas|estadisticas|stats)/i,
        eventosFallidos: /(?:abrir?|mostrar|ir a).*(eventos?\s*fallidos|failed\s*events)/i
      },

      aplicarFiltros: {
        ultimoMes: /(?:último|ultimo)\s*mes|mes\s*(?:actual|pasado)/i,
        ultimos7: /(?:últimos?|ultimos?)\s*7\s*días?|última?\s*semana/i,
        hoy: /hoy|día\s*actual|today/i,
        ayer: /ayer|yesterday/i,
        errores: /errores?|error|fallo|failed|ERROR/i,
        logins: /login|acceso|ingreso|autenticación/i,
        exportaciones: /export|exportación|exportaciones/i
      },

      acciones: {
        mostrar: /(?:mostrar|muestra|ver|visualizar|enseñar)/i,
        filtrar: /(?:filtrar|filtro|filter)/i,
        abrir: /(?:abrir|abre|open)/i,
        cambiar: /(?:cambiar|cambia|switch|ir a)/i
      }
    }
  }

  // ========== PROCESAMIENTO PRINCIPAL ==========

  async procesarComando(comando, contextoAdicional = {}) {
    const comandoId = Date.now().toString()

    try {
      // Evitar comandos duplicados
      if (this.comandosEjecutandose.has(comando.toLowerCase().trim())) {
        return {
          exito: false,
          mensaje: 'Comando ya en ejecución, por favor espera...',
          codigo: 'COMANDO_DUPLICADO'
        }
      }

      this.comandosEjecutandose.add(comando.toLowerCase().trim())

      // Actualizar contexto
      const contextoActual = this.contextMaster.obtenerContextoCompleto()
      const contextoCompleto = { ...contextoActual, ...contextoAdicional }

      console.log('🎯 Procesando comando:', comando)
      console.log('📍 Contexto detectado:', contextoCompleto)

      // Analizar intención
      const intencion = this.analizarIntencion(comando)
      console.log('🧠 Intención detectada:', intencion)

      // Ejecutar acción según la intención
      const resultado = await this.ejecutarSegunIntencion(intencion, comando, contextoCompleto)

      // Registrar en historial
      this.historialAcciones.push({
        id: comandoId,
        comando,
        intencion,
        resultado,
        contexto: contextoCompleto,
        timestamp: new Date().toISOString()
      })

      return resultado

    } catch (error) {
      console.error('❌ Error procesando comando:', error)
      return {
        exito: false,
        error: error.message,
        mensaje: 'Error interno al procesar el comando',
        contexto: this.contextMaster.obtenerContextoCompleto()
      }
    } finally {
      this.comandosEjecutandose.delete(comando.toLowerCase().trim())
    }
  }

  analizarIntencion(comando) {
    const comandoLower = comando.toLowerCase()
    const intenciones = []

    // Detectar cambio de flujo
    if (this.patrones.cambiarFlujo.escritorio.test(comandoLower)) {
      intenciones.push({ tipo: 'cambiar_flujo', destino: 'escritorio', confianza: 0.9 })
    }
    if (this.patrones.cambiarFlujo.movil.test(comandoLower)) {
      intenciones.push({ tipo: 'cambiar_flujo', destino: 'movil', confianza: 0.9 })
    }

    // Detectar apertura de módulos
    Object.entries(this.patrones.abrirModulo).forEach(([modulo, patron]) => {
      if (patron.test(comandoLower)) {
        intenciones.push({ tipo: 'abrir_modulo', modulo, confianza: 0.85 })
      }
    })

    // Detectar filtros
    const filtrosDetectados = []
    Object.entries(this.patrones.aplicarFiltros).forEach(([filtro, patron]) => {
      if (patron.test(comandoLower)) {
        filtrosDetectados.push(filtro)
      }
    })

    if (filtrosDetectados.length > 0) {
      intenciones.push({
        tipo: 'aplicar_filtros',
        filtros: filtrosDetectados,
        confianza: 0.8
      })
    }

    // Detectar acciones compuestas
    if (this.patrones.acciones.mostrar.test(comandoLower) && filtrosDetectados.length > 0) {
      intenciones.push({
        tipo: 'mostrar_con_filtros',
        filtros: filtrosDetectados,
        confianza: 0.95
      })
    }

    return intenciones.length > 0 ? intenciones : [{ tipo: 'desconocido', confianza: 0.1 }]
  }

  async ejecutarSegunIntencion(intenciones, comandoOriginal, contexto) {
    // Ordenar por confianza
    const intencionPrincipal = intenciones.sort((a, b) => b.confianza - a.confianza)[0]

    switch (intencionPrincipal.tipo) {
      case 'cambiar_flujo':
        return await this.ejecutarCambioFlujo(intencionPrincipal, contexto)

      case 'abrir_modulo':
        return await this.ejecutarAperturaModulo(intencionPrincipal, contexto)

      case 'aplicar_filtros':
        return await this.ejecutarAplicacionFiltros(intencionPrincipal, contexto)

      case 'mostrar_con_filtros':
        return await this.ejecutarMostrarConFiltros(intencionPrincipal, contexto)

      default:
        return await this.ejecutarComandoGenerico(comandoOriginal, contexto)
    }
  }

  // ========== EJECUTORES ESPECÍFICOS ==========

  async ejecutarCambioFlujo(intencion, contexto) {
    const flujoDestino = intencion.destino
    const flujoActual = contexto.flujo

    if (flujoActual === flujoDestino) {
      return {
        exito: true,
        mensaje: `Ya te encuentras en el flujo de ${flujoDestino}`,
        accion: 'ninguna',
        contexto: contexto
      }
    }

    try {
      const resultado = flujoDestino === 'escritorio'
        ? await this.contextMaster.ejecutarAccion('cambiar_a_escritorio')
        : await this.contextMaster.ejecutarAccion('cambiar_a_movil')

      return {
        ...resultado,
        flujo_anterior: flujoActual,
        flujo_actual: flujoDestino
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        mensaje: `Error al cambiar al flujo de ${flujoDestino}`,
        contexto: contexto
      }
    }
  }

  async ejecutarAperturaModulo(intencion, contexto) {
    const modulo = intencion.modulo
    const flujoActual = contexto.flujo

    // Verificar si el módulo es compatible con el flujo actual
    const compatibilidad = this.verificarCompatibilidadModulo(modulo, flujoActual)

    if (!compatibilidad.compatible) {
      // Intentar cambio de flujo automático si es necesario
      if (compatibilidad.flujoRequerido) {
        const cambioFlujo = await this.ejecutarCambioFlujo(
          { destino: compatibilidad.flujoRequerido },
          contexto
        )

        if (!cambioFlujo.exito) {
          return {
            exito: false,
            mensaje: `El módulo '${modulo}' requiere el flujo '${compatibilidad.flujoRequerido}' pero no se pudo cambiar`,
            contexto: contexto
          }
        }
      }
    }

    try {
      const resultado = await this.contextMaster.ejecutarAccion(`abrir_${modulo}`)
      return {
        ...resultado,
        modulo_solicitado: modulo,
        flujo_utilizado: flujoActual
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        mensaje: `Error al abrir el módulo '${modulo}'`,
        contexto: contexto
      }
    }
  }

  async ejecutarAplicacionFiltros(intencion, contexto) {
    const filtros = intencion.filtros
    const resultados = []

    for (const filtro of filtros) {
      try {
        let resultado

        switch (filtro) {
          case 'ultimoMes':
          case 'ultimos30':
            resultado = await procesarComandoFiltroFechas('últimos 30 días', contexto)
            break
          case 'ultimos7':
            resultado = await procesarComandoFiltroFechas('últimos 7 días', contexto)
            break
          case 'hoy':
            resultado = await procesarComandoFiltroFechas('hoy', contexto)
            break
          case 'ayer':
            resultado = await procesarComandoFiltroFechas('ayer', contexto)
            break
          case 'errores':
            resultado = await this.aplicarFiltroTipo('ERROR')
            break
          case 'logins':
            resultado = await this.aplicarFiltroTipo('LOGIN')
            break
          default:
            resultado = { exito: false, mensaje: `Filtro '${filtro}' no implementado` }
        }

        resultados.push({ filtro, ...resultado })
      } catch (error) {
        resultados.push({
          filtro,
          exito: false,
          error: error.message
        })
      }
    }

    const exitosos = resultados.filter(r => r.exito)
    const fallidos = resultados.filter(r => !r.exito)

    return {
      exito: exitosos.length > 0,
      filtros_aplicados: exitosos.length,
      filtros_fallidos: fallidos.length,
      mensaje: exitosos.length > 0
        ? `${exitosos.length} filtro(s) aplicado(s) exitosamente`
        : 'No se pudo aplicar ningún filtro',
      detalles: resultados,
      contexto: contexto
    }
  }

  async ejecutarMostrarConFiltros(intencion, contexto) {
    // 1. Aplicar filtros primero
    const filtrosResult = await this.ejecutarAplicacionFiltros(intencion, contexto)

    if (!filtrosResult.exito) {
      return filtrosResult
    }

    // 2. Determinar qué mostrar según el contexto
    let mostrarResult

    if (contexto.flujo === 'escritorio') {
      // En escritorio: actualizar gráficas y/o abrir consola
      mostrarResult = await this.actualizarVisualizacionEscritorio(intencion.filtros)
    } else {
      // En móvil: mostrar en la vista correspondiente
      mostrarResult = await this.actualizarVisualizacionMovil(intencion.filtros)
    }

    return {
      exito: true,
      mensaje: `Filtros aplicados y visualización actualizada`,
      filtros: filtrosResult,
      visualizacion: mostrarResult,
      contexto: contexto
    }
  }

  async ejecutarComandoGenerico(comando, contexto) {
    // Intentar con el procesador de filtros genérico
    try {
      const resultado = await procesarComandoFiltroFechas(comando, contexto)
      if (resultado.exito) {
        return resultado
      }
    } catch {
      // Continuar con otros métodos si falla
    }

    // Si no se pudo procesar, dar sugerencias
    return {
      exito: false,
      mensaje: 'No pude entender tu solicitud. ¿Podrías ser más específico?',
      sugerencias: this.generarSugerencias(contexto),
      contexto: contexto
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  verificarCompatibilidadModulo(modulo, flujo) {
    const compatibilidades = {
      'diagnostico': { flujos: ['escritorio'], preferido: 'escritorio' },
      'eventos': { flujos: ['movil', 'escritorio'], preferido: 'movil' },
      'eventosFallidos': { flujos: ['movil', 'escritorio'], preferido: 'movil' },
      'estadisticas': { flujos: ['escritorio'], preferido: 'escritorio' }
    }

    const config = compatibilidades[modulo]
    if (!config) {
      return { compatible: true } // Módulo desconocido, asumir compatible
    }

    const compatible = config.flujos.includes(flujo)

    return {
      compatible,
      flujoRequerido: compatible ? null : config.preferido,
      flujosSoportados: config.flujos
    }
  }

  async aplicarFiltroTipo(tipo) {
    // Intentar aplicar filtro de tipo en componentes disponibles
    const componentes = this.contextMaster.contextoActual.componentes

    if (componentes.filtrosAvanzados) {
      try {
        componentes.filtrosAvanzados.aplicarFiltroTipo(tipo)
        return {
          exito: true,
          mensaje: `Filtro de tipo '${tipo}' aplicado`,
          tipo: tipo
        }
      } catch (error) {
        return {
          exito: false,
          error: error.message,
          mensaje: `Error al aplicar filtro de tipo '${tipo}'`
        }
      }
    }

    // Si no hay componente de filtros avanzados, usar evento global
    const evento = new CustomEvent('aplicar-filtro-tipo', {
      detail: { tipo }
    })
    document.dispatchEvent(evento)

    return {
      exito: true,
      mensaje: `Evento de filtro '${tipo}' enviado`,
      tipo: tipo,
      metodo: 'evento_global'
    }
  }

  async actualizarVisualizacionEscritorio(filtros) {
    const componentes = this.contextMaster.contextoActual.componentes
    const acciones = []

    // Actualizar gráficas si están disponibles
    if (componentes.graficas && componentes.graficas.actualizarGraficas) {
      try {
        await componentes.graficas.actualizarGraficas()
        acciones.push('graficas_actualizadas')
      } catch (error) {
        acciones.push(`error_graficas: ${error.message}`)
      }
    }

    // Abrir consola si hay filtros de errores
    if (filtros.includes('errores') && componentes.consola) {
      try {
        componentes.consola.abrirConsola([], 'Errores filtrados', { tipo: 'ERROR' })
        acciones.push('consola_abierta')
      } catch (error) {
        acciones.push(`error_consola: ${error.message}`)
      }
    }

    return {
      acciones_ejecutadas: acciones,
      flujo: 'escritorio'
    }
  }

  async actualizarVisualizacionMovil(filtros) {
    // En móvil, principalmente actualizar la vista actual
    const evento = new CustomEvent('actualizar-vista-movil', {
      detail: { filtros }
    })
    document.dispatchEvent(evento)

    return {
      accion: 'vista_movil_actualizada',
      filtros: filtros,
      flujo: 'movil'
    }
  }

  generarSugerencias(contexto) {
    const sugerencias = []

    // Sugerencias según el flujo
    if (contexto.flujo === 'escritorio') {
      sugerencias.push(
        'abrir diagnóstico',
        'mostrar errores del último mes',
        'filtrar por últimos 7 días',
        'cambiar a móvil'
      )
    } else if (contexto.flujo === 'movil') {
      sugerencias.push(
        'abrir eventos',
        'mostrar eventos fallidos',
        'filtrar por hoy',
        'cambiar a escritorio'
      )
    } else {
      sugerencias.push(
        'ir a escritorio',
        'ir a móvil',
        'mostrar datos de hoy',
        'filtrar último mes'
      )
    }

    return sugerencias
  }

  // ========== INFORMACIÓN Y DEBUG ==========

  obtenerEstadoCompleto() {
    return {
      contexto: this.contextMaster.obtenerContextoCompleto(),
      comandos_ejecutandose: Array.from(this.comandosEjecutandose),
      historial_reciente: this.historialAcciones.slice(-5),
      patrones_disponibles: Object.keys(this.patrones)
    }
  }

  obtenerCapacidadesActuales() {
    const contexto = this.contextMaster.obtenerContextoCompleto()
    const capacidades = this.contextMaster.obtenerCapacidades()

    return {
      contexto_actual: contexto,
      capacidades_detectadas: capacidades,
      acciones_disponibles: [
        'cambiar_flujo',
        'abrir_modulo',
        'aplicar_filtros',
        'mostrar_con_filtros'
      ],
      precision_contexto: this.calcularPrecisionContexto()
    }
  }

  calcularPrecisionContexto() {
    const contexto = this.contextMaster.obtenerContextoCompleto()
    let precision = 0

    // Puntuación por cada elemento detectado correctamente
    if (contexto.flujo && contexto.flujo !== 'unknown') precision += 25
    if (contexto.modulo && contexto.modulo !== 'unknown') precision += 25
    if (contexto.vista && contexto.vista !== 'unknown') precision += 15
    if (contexto.componentes_conectados.length > 0) precision += 20
    if (contexto.modales_abiertos.length >= 0) precision += 15

    return Math.min(precision, 100)
  }
}

// Instancia global
export const santoroAssistantIntegrator = new SantoroAssistantIntegrator()

// Función de inicialización completa
export const inicializarAsistenteCompleto = () => {
  // Inicializar el context master
  santoroContextMaster.actualizarContextoCompleto()

  // Hacer disponible globalmente
  if (typeof window !== 'undefined') {
    window.santoroAssistant = santoroAssistantIntegrator
    window.santoroContext = santoroContextMaster

    // Función de debug global
    window.debugAssistant = () => {
      console.log('🔍 Estado del Asistente:', santoroAssistantIntegrator.obtenerEstadoCompleto())
      console.log('🎯 Capacidades Actuales:', santoroAssistantIntegrator.obtenerCapacidadesActuales())
    }
  }

  console.log('🚀 Asistente IA completamente inicializado con precisión absoluta')
  return santoroAssistantIntegrator
}
