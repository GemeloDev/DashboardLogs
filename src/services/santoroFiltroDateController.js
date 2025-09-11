/**
 * SantoroFiltroDateController
 * Controlador para el asistente IA que maneja todos los filtros de fechas
 * Proporciona control total sobre el filtro de fechas desde cualquier módulo
 */

export class SantoroFiltroDateController {
  constructor() {
    this.filtroRef = null
    this.contextoActual = {
      modulo: null,
      flujo: 'escritorio', // o 'movil'
      filtrosActivos: []
    }
  }

  // ========== CONFIGURACIÓN ==========

  /**
   * Conecta el controlador con la referencia del componente LogFilters
   * @param {Object} filtroRef - Referencia del componente LogFilters
   */
  conectarFiltro(filtroRef) {
    this.filtroRef = filtroRef
    console.log('🔗 SantoroFiltroDateController conectado al filtro de fechas')
  }

  /**
   * Actualiza el contexto actual (módulo, flujo, etc.)
   * @param {Object} contexto - { modulo, flujo, filtrosActivos }
   */
  actualizarContexto(contexto) {
    this.contextoActual = { ...this.contextoActual, ...contexto }
    console.log('📍 Contexto actualizado:', this.contextoActual)
  }

  // ========== MÉTODOS DE CONSULTA PARA IA ==========

  /**
   * Obtiene el estado completo del filtro de fechas
   * @returns {Object} Estado completo del filtro
   */
  obtenerEstadoCompleto() {
    if (!this.filtroRef) return null

    const rangoFechas = this.filtroRef.getRangoFechas()
    const impacto = this.filtroRef.getImpactoFiltro()

    return {
      ...rangoFechas,
      impacto,
      contexto: this.contextoActual,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Obtiene información resumida para el asistente IA
   * @returns {Object} Información resumida
   */
  obtenerResumenParaIA() {
    const estado = this.obtenerEstadoCompleto()
    if (!estado) return { error: 'Filtro no conectado' }

    return {
      estado: estado.valido ? 'válido' : 'inválido',
      periodo: estado.periodo,
      diasSeleccionados: estado.diasSeleccionados,
      fechaInicio: estado.from,
      fechaFin: estado.to,
      modulo: this.contextoActual.modulo,
      flujo: this.contextoActual.flujo,
      advertencias: estado.impacto?.advertencias || [],
      sugerencias: estado.impacto?.sugerencias || []
    }
  }

  // ========== MÉTODOS DE MANIPULACIÓN PARA IA ==========

  /**
   * Aplica un rango de fechas específico
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Resultado de la operación
   */
  async aplicarRangoFechas(fechaInicio, fechaFin) {
    if (!this.filtroRef) {
      return {
        exito: false,
        error: 'Filtro no conectado',
        mensaje: 'El filtro de fechas no está disponible en este contexto'
      }
    }

    try {
      this.filtroRef.setRangoFechas(fechaInicio, fechaFin, true)
      const estado = this.obtenerResumenParaIA()

      return {
        exito: true,
        estado,
        mensaje: `Filtro aplicado: ${estado.diasSeleccionados} días seleccionados (${fechaInicio} a ${fechaFin})`
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        mensaje: 'Error al aplicar el rango de fechas'
      }
    }
  }

  /**
   * Selecciona un período rápido
   * @param {string} periodo - 'hoy', 'ayer', 'ultimos7', 'ultimos30', 'mesActual'
   * @returns {Promise<Object>} Resultado de la operación
   */
  async seleccionarPeriodoRapido(periodo) {
    if (!this.filtroRef) {
      return {
        exito: false,
        error: 'Filtro no conectado',
        mensaje: 'El filtro de fechas no está disponible en este contexto'
      }
    }

    const periodosValidos = ['hoy', 'ayer', 'ultimos7', 'ultimos30', 'mesActual']
    if (!periodosValidos.includes(periodo)) {
      return {
        exito: false,
        error: 'Período inválido',
        mensaje: `Período '${periodo}' no reconocido. Períodos válidos: ${periodosValidos.join(', ')}`
      }
    }

    try {
      this.filtroRef.seleccionarPeriodo(periodo)
      const estado = this.obtenerResumenParaIA()

      return {
        exito: true,
        estado,
        mensaje: `Período '${periodo.toUpperCase()}' seleccionado: ${estado.diasSeleccionados} días`
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        mensaje: `Error al seleccionar el período '${periodo}'`
      }
    }
  }

  /**
   * Resetea el filtro al mes actual
   * @returns {Promise<Object>} Resultado de la operación
   */
  async resetearAMesActual() {
    if (!this.filtroRef) {
      return {
        exito: false,
        error: 'Filtro no conectado',
        mensaje: 'El filtro de fechas no está disponible en este contexto'
      }
    }

    try {
      this.filtroRef.resetearAMesActual()
      const estado = this.obtenerResumenParaIA()

      return {
        exito: true,
        estado,
        mensaje: `Filtro reseteado al mes actual: ${estado.diasSeleccionados} días`
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        mensaje: 'Error al resetear el filtro'
      }
    }
  }

  // ========== MÉTODOS DE ANÁLISIS PARA IA ==========

  /**
   * Analiza el impacto del filtro actual
   * @returns {Object} Análisis del impacto
   */
  analizarImpacto() {
    const estado = this.obtenerEstadoCompleto()
    if (!estado) return { error: 'Filtro no disponible' }

    const analisis = {
      rendimiento: estado.diasSeleccionados > 30 ? 'lento' : 'óptimo',
      cobertura: estado.diasSeleccionados <= 1 ? 'muy específica' :
        estado.diasSeleccionados <= 7 ? 'específica' :
          estado.diasSeleccionados <= 30 ? 'moderada' : 'amplia',
      recomendaciones: []
    }

    if (estado.diasSeleccionados > 30) {
      analisis.recomendaciones.push('Considera reducir el rango para mejor rendimiento')
    }
    if (estado.diasSeleccionados < 1) {
      analisis.recomendaciones.push('El rango es muy específico, podrías no obtener muchos resultados')
    }
    if (!estado.valido) {
      analisis.recomendaciones.push('El rango de fechas no es válido, por favor corrígelo')
    }

    return analisis
  }

  /**
   * Sugiere acciones basadas en el contexto actual
   * @returns {Array} Lista de sugerencias
   */
  sugerirAcciones() {
    const estado = this.obtenerResumenParaIA()
    const sugerencias = []

    if (!estado.valido) {
      sugerencias.push({
        accion: 'resetear',
        descripcion: 'Resetear al mes actual',
        prioridad: 'alta'
      })
    }

    if (estado.diasSeleccionados > 30) {
      sugerencias.push({
        accion: 'reducir_rango',
        descripcion: 'Seleccionar un rango más pequeño (últimos 7 o 30 días)',
        prioridad: 'media'
      })
    }

    if (this.contextoActual.modulo === 'eventos' && estado.diasSeleccionados > 7) {
      sugerencias.push({
        accion: 'periodo_corto',
        descripcion: 'Para eventos, se recomienda un período más corto',
        prioridad: 'media'
      })
    }

    return sugerencias
  }

  // ========== RESPUESTAS ESTRUCTURADAS PARA IA ==========

  /**
   * Genera una respuesta estructurada para el asistente IA
   * @param {string} accion - Acción solicitada
   * @param {Object} parametros - Parámetros de la acción
   * @returns {Object} Respuesta estructurada en formato JSON
   */
  generarRespuestaIA(accion, parametros = {}) {
    const estado = this.obtenerResumenParaIA()
    const impacto = this.analizarImpacto()
    const sugerencias = this.sugerirAcciones()

    return {
      intencion: accion,
      confianza: 0.95,
      respuesta_usuario: this.generarMensajeUsuario(accion, parametros, estado),
      acciones: this.generarAccionesEjecutar(accion, parametros),
      estado_actual: estado,
      impacto: impacto,
      sugerencias: sugerencias,
      contexto: this.contextoActual,
      datos_necesarios: this.validarDatosNecesarios(accion, parametros),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Genera mensaje para el usuario basado en la acción
   */
  generarMensajeUsuario(accion, parametros, estado) {
    switch (accion) {
      case 'aplicar_filtro_fechas':
        return `Filtro de fechas aplicado: ${estado.diasSeleccionados} días seleccionados (${estado.periodo})`

      case 'seleccionar_periodo':
        return `Período ${parametros.periodo?.toUpperCase()} seleccionado: ${estado.diasSeleccionados} días`

      case 'consultar_estado':
        return `Estado actual del filtro: ${estado.periodo} (${estado.diasSeleccionados} días) - ${estado.estado}`

      case 'resetear_filtro':
        return `Filtro reseteado al mes actual: ${estado.diasSeleccionados} días`

      default:
        return `Acción '${accion}' procesada. Estado: ${estado.periodo}`
    }
  }

  /**
   * Genera acciones a ejecutar
   */
  generarAccionesEjecutar(accion, parametros) {
    const acciones = []

    switch (accion) {
      case 'aplicar_filtro_fechas':
        if (parametros.fechaInicio && parametros.fechaFin) {
          acciones.push({
            tipo: 'setRangoFechas',
            parametros: {
              fechaInicio: parametros.fechaInicio,
              fechaFin: parametros.fechaFin
            },
            prioridad: 1
          })
        }
        break

      case 'seleccionar_periodo':
        if (parametros.periodo) {
          acciones.push({
            tipo: 'seleccionarPeriodo',
            parametros: { periodo: parametros.periodo },
            prioridad: 1
          })
        }
        break

      case 'resetear_filtro':
        acciones.push({
          tipo: 'resetearAMesActual',
          parametros: {},
          prioridad: 1
        })
        break
    }

    return acciones
  }

  /**
   * Valida datos necesarios para la acción
   */
  validarDatosNecesarios(accion, parametros) {
    const datosNecesarios = []

    switch (accion) {
      case 'aplicar_filtro_fechas':
        if (!parametros.fechaInicio) datosNecesarios.push('fechaInicio')
        if (!parametros.fechaFin) datosNecesarios.push('fechaFin')
        break

      case 'seleccionar_periodo':
        if (!parametros.periodo) datosNecesarios.push('periodo')
        break
    }

    return datosNecesarios
  }
}

// Instancia global del controlador
export const santoroFiltroDateController = new SantoroFiltroDateController()

// Función de utilidad para inicializar el controlador
export const inicializarControladorFiltros = (filtroRef, contexto = {}) => {
  santoroFiltroDateController.conectarFiltro(filtroRef)
  santoroFiltroDateController.actualizarContexto(contexto)
  return santoroFiltroDateController
}
