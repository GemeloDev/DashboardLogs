// 🌐 SANTORO CONTEXT INTEGRATION
// Integración completa del sistema de contexto con el asistente IA

import { santoroActionController } from './santoroActionController.js'
import { santoroContextManager } from './santoroModalControllerSimple.js'

class SantoroContextIntegration {
  constructor() {
    // 🎯 Sistema de contexto inteligente
    this.contextoCache = new Map()
    this.ultimaActualizacion = null
    this.intervalosActualizacion = new Map()

    // 🤖 Configuración del asistente
    this.configuracionAsistente = {
      actualizacionAutomatica: true,
      intervalosMonitoreo: 2000, // 2 segundos
      maxHistorialContexto: 20,
      notificarCambiosImportantes: true
    }

    // 🔄 Inicializar integración
    this.inicializar()
  }

  // 🚀 INICIALIZAR INTEGRACIÓN
  inicializar() {
    console.log('🌐 Inicializando integración de contexto con asistente...')

    // Configurar monitoreo automático
    this.iniciarMonitoreoContexto()

    // Configurar listeners para cambios importantes
    this.configurarListenersContexto()

    console.log('✅ Integración de contexto inicializada')
  }

  // 🔄 INICIAR MONITOREO DE CONTEXTO
  iniciarMonitoreoContexto() {
    if (this.configuracionAsistente.actualizacionAutomatica) {
      this.intervalosActualizacion.set('principal', setInterval(() => {
        this.actualizarContextoParaAsistente()
      }, this.configuracionAsistente.intervalosMonitoreo))
    }
  }

  // 🎧 CONFIGURAR LISTENERS PARA CAMBIOS IMPORTANTES
  configurarListenersContexto() {
    // Cambios de página
    window.addEventListener('santoro-pagina-cambiada', (event) => {
      this.notificarCambioContexto('navegacion', event.detail)
    })

    // Cambios de modal
    window.addEventListener('santoro-modal-abierto', (event) => {
      this.notificarCambioContexto('modal_abierto', event.detail)
    })

    window.addEventListener('santoro-modal-cerrado', (event) => {
      this.notificarCambioContexto('modal_cerrado', event.detail)
    })

    // Cambios de filtros
    window.addEventListener('santoro-filtro-aplicado', (event) => {
      this.notificarCambioContexto('filtro_aplicado', event.detail)
    })

    // Cambios de flujo
    window.addEventListener('santoro-cambiar-flujo', (event) => {
      this.notificarCambioContexto('cambio_flujo', event.detail)
    })
  }

  // 📢 NOTIFICAR CAMBIO DE CONTEXTO
  notificarCambioContexto(tipoChange, detalles) {
    if (this.configuracionAsistente.notificarCambiosImportantes) {
      console.log(`🔄 Cambio de contexto detectado: ${tipoChange}`, detalles)

      // Actualizar contexto inmediatamente
      this.actualizarContextoParaAsistente()

      // Emitir evento para el asistente
      window.dispatchEvent(new CustomEvent('santoro-contexto-actualizado', {
        detail: {
          tipoChange,
          detalles,
          contextoActual: this.obtenerContextoCompleto(),
          timestamp: new Date()
        }
      }))
    }
  }

  // 🔄 ACTUALIZAR CONTEXTO PARA ASISTENTE
  actualizarContextoParaAsistente() {
    try {
      const contextoCompleto = this.obtenerContextoCompleto()

      // Cachear contexto
      this.contextoCache.set('actual', contextoCompleto)
      this.ultimaActualizacion = new Date()

      // Mantener historial limitado
      this.mantenergHistorialContexto(contextoCompleto)

    } catch (error) {
      console.error('Error actualizando contexto para asistente:', error)
    }
  }

  // 📚 MANTENER HISTORIAL DE CONTEXTO
  mantenergHistorialContexto(contextoActual) {
    if (!this.contextoCache.has('historial')) {
      this.contextoCache.set('historial', [])
    }

    const historial = this.contextoCache.get('historial')
    historial.push({
      contexto: contextoActual,
      timestamp: new Date()
    })

    // Mantener solo las últimas N entradas
    if (historial.length > this.configuracionAsistente.maxHistorialContexto) {
      historial.splice(0, historial.length - this.configuracionAsistente.maxHistorialContexto)
    }

    this.contextoCache.set('historial', historial)
  }

  // 📊 OBTENER CONTEXTO COMPLETO
  obtenerContextoCompleto() {
    try {
      // Obtener contexto de ActionController
      const reporteSituacion = santoroActionController.obtenerReporteSituacionActual()

      // Obtener contexto de ContextManager
      const contextoManager = santoroContextManager?.obtenerContextoParaAsistente() || {
        resumen: 'Context manager no disponible',
        contextoDetallado: {},
        timestamp: new Date()
      }

      // Combinar información
      const contextoCompleto = {
        // 📍 Ubicación y navegación
        ubicacion: reporteSituacion.ubicacion || {},

        // 🎭 Interfaz y componentes
        interfaz: {
          ...reporteSituacion.interfaz,
          modalesDetallados: Array.from(contextoManager.contextoDetallado.modalesAbiertos || []),
          componentesDetallados: Array.from(contextoManager.contextoDetallado.componentesVisibles || [])
        },

        // 🔍 Filtros y búsquedas
        filtros: {
          ...reporteSituacion.filtros,
          historialBusquedas: contextoManager.contextoDetallado.ultimasAcciones
            ?.filter(a => a.categoria === 'filtro' || a.categoria === 'busqueda')
            ?.slice(-5) || []
        },

        // ⚡ Estado del sistema
        estado: {
          ...reporteSituacion.estado,
          rendimiento: contextoManager.contextoDetallado.rendimiento || {},
          memoriaUso: this.calcularUsoMemoria()
        },

        // 🎯 Capacidades contextuales
        capacidades: {
          ...reporteSituacion.capacidades,
          accionesDisponibles: this.obtenerAccionesDisponibles(reporteSituacion),
          restricciones: this.obtenerRestricciones(reporteSituacion)
        },

        // 📝 Resumen para IA
        resumenParaIA: this.generarResumenParaIA(reporteSituacion, contextoManager),

        // ⏰ Metadatos
        metadatos: {
          timestamp: new Date(),
          version: '1.0.0',
          fuentes: ['ActionController', 'ContextManager'],
          confiabilidad: this.calcularConfiabilidadContexto(reporteSituacion, contextoManager)
        }
      }

      return contextoCompleto

    } catch (error) {
      console.error('Error obteniendo contexto completo:', error)
      return {
        error: true,
        mensaje: 'Error obteniendo contexto',
        timestamp: new Date()
      }
    }
  }

  // 🧠 GENERAR RESUMEN PARA IA
  generarResumenParaIA(reporteSituacion, contextoManager) {
    const partes = []

    try {
      // 📍 UBICACIÓN Y NAVEGACIÓN DETALLADA
      const pagina = reporteSituacion.ubicacion?.pagina || contextoManager.contextoDetallado?.paginaActual || 'desconocida'
      const vista = reporteSituacion.ubicacion?.vista || contextoManager.contextoDetallado?.tipoVista || 'desktop'
      const ruta = reporteSituacion.ubicacion?.ruta || contextoManager.contextoDetallado?.rutaCompleta || window.location.pathname
      const hash = reporteSituacion.ubicacion?.hash || contextoManager.contextoDetallado?.hashURL || window.location.hash

      partes.push(`Usuario en página "${pagina}" usando vista ${vista}`)

      if (ruta && ruta !== '/') {
        partes.push(`Ruta actual: ${ruta}`)
      }

      if (hash) {
        partes.push(`Sección: ${hash.replace('#', '')}`)
      }

      // 🎭 ESTADO DE INTERFAZ COMPLETO
      const modalesReporte = reporteSituacion.interfaz?.modalesAbiertos || []
      const modalesManager = Array.from(contextoManager.contextoDetallado?.modalesAbiertos || [])
      const todosLosModales = [...new Set([...modalesReporte, ...modalesManager])]

      if (todosLosModales.length > 0) {
        partes.push(`Modales activos: ${todosLosModales.join(', ')}`)
      } else {
        partes.push('Sin modales abiertos')
      }

      // 🖥️ COMPONENTES VISIBLES
      const componentesVisibles = Array.from(contextoManager.contextoDetallado?.componentesVisibles || [])
      if (componentesVisibles.length > 0) {
        partes.push(`Componentes visibles: ${componentesVisibles.join(', ')}`)
      }

      // 🔍 FILTROS Y BÚSQUEDAS DETALLADOS
      const filtrosReporte = reporteSituacion.filtros?.aplicados || {}
      const filtrosManager = Object.fromEntries(contextoManager.contextoDetallado?.filtrosAplicados || new Map())
      const todosLosFiltros = { ...filtrosReporte, ...filtrosManager }
      const filtrosActivos = Object.keys(todosLosFiltros)

      if (filtrosActivos.length > 0) {
        const detallesFiltros = Object.entries(todosLosFiltros)
          .map(([key, value]) => `${key}="${value}"`)
          .join(', ')
        partes.push(`Filtros aplicados: ${detallesFiltros}`)
      } else {
        partes.push('Sin filtros aplicados')
      }

      // 🔎 BÚSQUEDA ACTIVA
      const busquedaActiva = contextoManager.contextoDetallado?.busquedaActiva || reporteSituacion.filtros?.busquedaActiva
      if (busquedaActiva) {
        partes.push(`Búsqueda activa: "${busquedaActiva}"`)
      }

      // ⚡ OPERACIONES EN CURSO DETALLADAS
      const operacionesReporte = reporteSituacion.estado?.operacionesEnCurso || []
      const operacionesManager = Array.from(contextoManager.contextoDetallado?.operacionesEnCurso || [])
      const todasLasOperaciones = [...new Set([...operacionesReporte, ...operacionesManager])]

      if (todasLasOperaciones.length > 0) {
        partes.push(`Operaciones en curso: ${todasLasOperaciones.join(', ')}`)
      }

      // 👤 INFORMACIÓN DE USUARIO Y SESIÓN
      const sesionActiva = contextoManager.contextoDetallado?.sesionActiva
      const ultimaActividad = contextoManager.contextoDetallado?.ultimaActividad

      if (sesionActiva !== undefined) {
        partes.push(`Sesión: ${sesionActiva ? 'activa' : 'inactiva'}`)
      }

      if (ultimaActividad) {
        const tiempoInactivo = new Date() - new Date(ultimaActividad)
        const minutosInactivo = Math.floor(tiempoInactivo / 60000)
        if (minutosInactivo > 5) {
          partes.push(`Inactivo por ${minutosInactivo} minutos`)
        }
      }

      // 🎯 CAPACIDADES Y PERMISOS DETALLADOS
      const capacidades = []
      const permisos = Array.from(contextoManager.contextoDetallado?.permisos || [])

      if (reporteSituacion.capacidades?.puedeNavegar) capacidades.push('navegación')
      if (reporteSituacion.capacidades?.puedeAbrirModales) capacidades.push('modales')
      if (reporteSituacion.capacidades?.puedeAplicarFiltros) capacidades.push('filtros')
      if (reporteSituacion.capacidades?.puedeUsarVoz || contextoManager.contextoDetallado?.vocesDisponibles) capacidades.push('voz')
      if (reporteSituacion.capacidades?.puedeExportar) capacidades.push('exportación')

      if (capacidades.length > 0) {
        partes.push(`Capacidades: ${capacidades.join(', ')}`)
      }

      if (permisos.length > 0) {
        partes.push(`Permisos: ${permisos.join(', ')}`)
      }

      // 🌐 ESTADO DE CONEXIÓN Y RENDIMIENTO
      const conexion = reporteSituacion.estado?.conexion || contextoManager.contextoDetallado?.estadoConexion || 'unknown'
      if (conexion !== 'online') {
        partes.push(`Conexión: ${conexion}`)
      }

      const rendimiento = contextoManager.contextoDetallado?.rendimiento
      if (rendimiento && rendimiento.fps < 30) {
        partes.push(`Rendimiento bajo: ${rendimiento.fps} FPS`)
      }

      // 📱 INFORMACIÓN DE DISPOSITIVO
      const dimensiones = contextoManager.contextoDetallado?.dimensionesPantalla || reporteSituacion.interfaz?.dimensionesPantalla
      if (dimensiones) {
        partes.push(`Pantalla: ${dimensiones.ancho}x${dimensiones.alto}`)
      }

      // 🔔 NOTIFICACIONES Y ERRORES RECIENTES
      const erroresRecientes = contextoManager.contextoDetallado?.erroresRecientes || []
      if (erroresRecientes.length > 0) {
        partes.push(`Errores recientes: ${erroresRecientes.length}`)
      }

      const notificacionesActivas = contextoManager.contextoDetallado?.notificacionesActivas || []
      if (notificacionesActivas.length > 0) {
        partes.push(`Notificaciones activas: ${notificacionesActivas.length}`)
      }

      // 📊 PAGINACIÓN Y DATOS EN PANTALLA
      const paginacion = contextoManager.contextoDetallado?.paginacionActual
      if (paginacion && paginacion.total > 0) {
        partes.push(`Página ${paginacion.pagina} de ${Math.ceil(paginacion.total / paginacion.porPagina)} (${paginacion.total} elementos)`)
      }

      // 🎮 INTERACCIONES RECIENTES
      const ultimasAcciones = contextoManager.contextoDetallado?.ultimasAcciones || []
      if (ultimasAcciones.length > 0) {
        const ultimaAccion = ultimasAcciones[ultimasAcciones.length - 1]
        const tiempoUltimaAccion = new Date() - new Date(ultimaAccion.timestamp)
        if (tiempoUltimaAccion < 30000) { // Menos de 30 segundos
          partes.push(`Última acción: ${ultimaAccion.accion} (${ultimaAccion.categoria})`)
        }
      }

      // 🤖 ESTADO DEL ASISTENTE
      const asistenteDiponible = contextoManager.contextoDetallado?.asistenteDiponible
      const configuracionIA = contextoManager.contextoDetallado?.configuracionIA

      if (asistenteDiponible === false) {
        partes.push('Asistente temporalmente no disponible')
      }

      if (configuracionIA) {
        partes.push('IA configurada y lista')
      }

    } catch (error) {
      console.warn('Error generando resumen para IA:', error)
      partes.push('Error generando resumen completo del contexto')
    }

    // Si no hay información, indicar estado mínimo
    if (partes.length === 0) {
      partes.push('Contexto mínimo disponible - sistema en estado básico')
    }

    return partes.join('. ') + '.'
  }

  // 🎯 OBTENER ACCIONES DISPONIBLES
  obtenerAccionesDisponibles(reporteSituacion) {
    const acciones = []

    try {
      const pagina = reporteSituacion.ubicacion?.pagina
      const modalesAbiertos = reporteSituacion.interfaz?.modalesAbiertos || []
      const operacionesEnCurso = reporteSituacion.estado?.operacionesEnCurso || []

      // Navegación siempre disponible
      acciones.push('navegar_a', 'cambiar_flujo')

      // Modales según contexto
      if (modalesAbiertos.length === 0) {
        acciones.push('abrir_diagnostico', 'abrir_ayuda', 'abrir_filtros')
      } else {
        acciones.push('cerrar_modal', 'cerrar_todos_modales')
      }

      // Filtros en páginas apropiadas
      if (['logs', 'eventos', 'estadisticas'].includes(pagina)) {
        acciones.push('aplicar_filtro', 'limpiar_filtros')
      }

      // Export si no hay operaciones en curso
      if (!operacionesEnCurso.includes('exportando')) {
        acciones.push('exportar', 'generar_reporte')
      }

      // Búsquedas
      acciones.push('buscar', 'buscar_relacionados')

    } catch (error) {
      console.warn('Error obteniendo acciones disponibles:', error)
    }

    return acciones
  }

  // 🚫 OBTENER RESTRICCIONES
  obtenerRestricciones(reporteSituacion) {
    const restricciones = []

    try {
      const operacionesEnCurso = reporteSituacion.estado?.operacionesEnCurso || []
      const conexion = reporteSituacion.estado?.conexion

      // Restricciones por operaciones en curso
      if (operacionesEnCurso.includes('exportando')) {
        restricciones.push('No se puede exportar mientras hay otra exportación en curso')
      }

      if (operacionesEnCurso.includes('analizando')) {
        restricciones.push('Análisis en curso, algunas acciones pueden estar limitadas')
      }

      // Restricciones por conexión
      if (conexion !== 'online') {
        restricciones.push('Funcionalidades limitadas por problemas de conexión')
      }

    } catch (error) {
      console.warn('Error obteniendo restricciones:', error)
    }

    return restricciones
  }

  // 💾 CALCULAR USO DE MEMORIA
  calcularUsoMemoria() {
    try {
      if ('memory' in performance) {
        return {
          usada: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limite: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        }
      }
    } catch (error) {
      console.warn('No se pudo obtener información de memoria:', error)
    }

    return { disponible: false }
  }

  // 📊 CALCULAR CONFIABILIDAD DEL CONTEXTO
  calcularConfiabilidadContexto(reporteSituacion, contextoManager) {
    let puntuacion = 0
    let maxPuntuacion = 0

    try {
      // Puntuación por fuentes disponibles
      if (reporteSituacion && !reporteSituacion.error) {
        puntuacion += 50
      }
      maxPuntuacion += 50

      if (contextoManager && contextoManager.contextoDetallado) {
        puntuacion += 30
      }
      maxPuntuacion += 30

      // Puntuación por completitud de datos
      if (reporteSituacion.ubicacion?.pagina) puntuacion += 5
      if (reporteSituacion.interfaz?.modalesAbiertos) puntuacion += 5
      if (reporteSituacion.filtros?.aplicados) puntuacion += 5
      if (reporteSituacion.estado?.conexion) puntuacion += 5
      maxPuntuacion += 20

      return Math.round((puntuacion / maxPuntuacion) * 100)

    } catch (error) {
      console.warn('Error calculando confiabilidad:', error)
      return 50 // Confiabilidad media por defecto
    }
  }

  // 🔍 OBTENER CONTEXTO PARA COMANDO ESPECÍFICO
  obtenerContextoParaComando(comando, parametros = {}) {
    const contextoCompleto = this.obtenerContextoCompleto()

    // Contexto específico según el comando
    const contextoEspecifico = {
      contextoGeneral: contextoCompleto.resumenParaIA,
      recomendaciones: [],
      advertencias: [],
      parametrosSugeridos: {}
    }

    try {
      switch (comando) {
        case 'cambiar_flujo': {
          const vistaActual = contextoCompleto.ubicacion?.vista
          if (parametros.flujo === vistaActual) {
            contextoEspecifico.advertencias.push(`Ya estás en vista ${vistaActual}`)
          }
          break
        }

        case 'aplicar_filtro': {
          const paginaActual = contextoCompleto.ubicacion?.pagina
          if (!['logs', 'eventos'].includes(paginaActual)) {
            contextoEspecifico.recomendaciones.push('Considera navegar a logs o eventos primero')
          }
          break
        }

        case 'exportar': {
          const operaciones = contextoCompleto.estado?.operacionesEnCurso || []
          if (operaciones.includes('exportando')) {
            contextoEspecifico.advertencias.push('Ya hay una exportación en curso')
          }
          break
        }
      }

    } catch (error) {
      console.warn('Error generando contexto específico:', error)
    }

    return contextoEspecifico
  }

  // 🧹 LIMPIAR RECURSOS
  destruir() {
    // Limpiar intervalos
    this.intervalosActualizacion.forEach(interval => clearInterval(interval))
    this.intervalosActualizacion.clear()

    // Limpiar cache
    this.contextoCache.clear()

    console.log('🧹 Integración de contexto destruida')
  }
}

// 🎯 Instancia global
export const santoroContextIntegration = new SantoroContextIntegration()

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.santoroContextIntegration = santoroContextIntegration
}

export default santoroContextIntegration
