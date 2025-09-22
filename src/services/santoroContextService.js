// 🧠 SANTORO CONTEXT SERVICE - Conciencia contextual para Santoro AI
// Mantiene el estado actual del usuario y proporciona información contextual

import { reactive } from 'vue'

class SantoroContextService {
  constructor() {
    // Estado contextual global
    this.contexto = reactive({
      // 📍 Ubicación actual
      ruta: '/login',
      rutaAnterior: null,
      modulo: 'inicio',

      // 🔄 Estado de flujo
      flujo: 'mobile', // 'mobile' | 'escritorio'
      flujoAnterior: 'mobile',

      // 🏷️ Estado de filtros
      filtros: {},
      filtrosActivos: false,

      // 📊 Estado de datos
      datosVisiables: null,
      tipoVista: null, // 'tabla', 'graficas', 'consola', etc.

      // ⏰ Contexto temporal
      ultimaAccion: null,
      tiempoUltimaAccion: null,

      // 🎯 Capacidades disponibles
      accionesDisponibles: [],
      filtrosDisponibles: [],

      // 🧭 Historial de navegación
      historial: []
    })

    // Callbacks para cambios de contexto
    this.callbacks = new Map()

    // Inicializar
    this.inicializar()
  }

  // 🚀 INICIALIZAR servicio
  inicializar() {
    // Escuchar cambios de ruta con múltiples métodos
    window.addEventListener('popstate', () => {
      setTimeout(() => this.actualizarContextoRuta(), 100)
    })

    // Observar cambios en la URL cada segundo para capturar navegación manual
    setInterval(() => {
      this.actualizarContextoRuta()
    }, 1000)

    // Escuchar eventos de Vue Router si está disponible
    if (window.router) {
      window.router.afterEach(() => {
        setTimeout(() => this.actualizarContextoRuta(), 100)
      })
    }

    // Detectar ruta inicial
    this.actualizarContextoRuta()

    // Cargar contexto desde localStorage si existe
    this.cargarContextoPersistente()

    console.log('🧠 Santoro Context Service inicializado con detección automática de cambios')
  }

  // 📍 ACTUALIZAR contexto de ruta
  actualizarContextoRuta() {
    const rutaAnterior = this.contexto.ruta
    const rutaActual = window.location.pathname

    if (rutaAnterior !== rutaActual) {
      this.contexto.rutaAnterior = rutaAnterior
      this.contexto.ruta = rutaActual
      this.contexto.modulo = this.extraerModulo(rutaActual)

      // Agregar al historial
      this.contexto.historial.push({
        ruta: rutaActual,
        modulo: this.contexto.modulo,
        timestamp: Date.now()
      })

      // Mantener solo los últimos 10 elementos del historial
      if (this.contexto.historial.length > 10) {
        this.contexto.historial = this.contexto.historial.slice(-10)
      }

      // Actualizar acciones disponibles según el módulo
      this.actualizarAccionesDisponibles()

      // Ejecutar callbacks
      this.ejecutarCallbacks('cambio_ruta', { rutaAnterior, rutaActual })

      console.log('🧭 Contexto actualizado:', {
        modulo: this.contexto.modulo,
        ruta: rutaActual,
        flujo: this.contexto.flujo
      })
    }
  }

  // 🏗️ EXTRAER módulo de la ruta
  extraerModulo(ruta) {
    // Mapeo completo de rutas a módulos
    const mapeoRutas = {
      '/': 'dashboard',
      '/login': 'login',
      '/dashboard-desktop': 'dashboard',
      '/dashboard-mobile': 'dashboard',
      '/escritorio': 'escritorio',
      '/logs': 'logs',
      '/eventos': 'eventos',
      '/eventos-fallidos': 'eventos_fallidos',
      '/estadisticas': 'estadisticas',
      '/diagnostico': 'diagnostico',
      '/santoro-config': 'configuracion',
      '/santoro-demo': 'demo'
    }

    // Buscar coincidencia exacta primero
    if (mapeoRutas[ruta]) {
      return mapeoRutas[ruta]
    }

    // Buscar por patrones parciales
    if (ruta.includes('/dashboard')) return 'dashboard'
    if (ruta.includes('/escritorio')) return 'escritorio'
    if (ruta.includes('/logs')) return 'logs'
    if (ruta.includes('/eventos')) return 'eventos'
    if (ruta.includes('/estadisticas')) return 'estadisticas'
    if (ruta.includes('/diagnostico')) return 'diagnostico'
    if (ruta.includes('/santoro')) return 'configuracion'

    // Detectar por hash también
    const hash = window.location.hash
    if (hash.includes('/dashboard')) return 'dashboard'
    if (hash.includes('/escritorio')) return 'escritorio'
    if (hash.includes('/logs')) return 'logs'
    if (hash.includes('/eventos')) return 'eventos'
    if (hash.includes('/estadisticas')) return 'estadisticas'
    if (hash.includes('/diagnostico')) return 'diagnostico'

    return 'desconocido'
  }

  // 🎯 ACTUALIZAR acciones disponibles
  actualizarAccionesDisponibles() {
    const modulo = this.contexto.modulo
    const flujo = this.contexto.flujo

    let acciones = []
    let filtros = []

    // Acciones generales siempre disponibles
    acciones.push('cambiar_flujo', 'navegar_a', 'mostrar_ayuda')

    // Acciones específicas por módulo
    switch (modulo) {
      case 'dashboard':
        acciones.push('abrir_consola', 'aplicar_filtro', 'exportar_datos')
        filtros.push('fecha', 'nivel', 'servicio', 'limpiar')
        if (flujo === 'escritorio') {
          acciones.push('ver_graficas', 'abrir_diagnostico')
        }
        break

      case 'diagnostico':
        acciones.push('ejecutar_diagnostico', 'ver_metricas', 'aplicar_filtro')
        filtros.push('fecha', 'sistema', 'gravedad')
        break

      case 'estadisticas':
        acciones.push('cambiar_grafica', 'exportar_reporte', 'aplicar_filtro')
        filtros.push('fecha', 'tipo_evento', 'agrupacion')
        break

      case 'eventos':
        acciones.push('ver_detalle', 'filtrar_eventos', 'abrir_consola')
        filtros.push('fecha', 'tipo', 'gravedad', 'servicio')
        break

      case 'eventos_fallidos':
        acciones.push('ver_error', 'reintento', 'aplicar_filtro')
        filtros.push('fecha', 'tipo_error', 'servicio_afectado')
        break
    }

    this.contexto.accionesDisponibles = acciones
    this.contexto.filtrosDisponibles = filtros
  }

  // 🔄 CAMBIAR flujo
  cambiarFlujo(nuevoFlujo) {
    const flujoAnterior = this.contexto.flujo

    if (flujoAnterior !== nuevoFlujo) {
      this.contexto.flujoAnterior = flujoAnterior
      this.contexto.flujo = nuevoFlujo

      // Actualizar acciones disponibles
      this.actualizarAccionesDisponibles()

      // Ejecutar callbacks
      this.ejecutarCallbacks('cambio_flujo', { flujoAnterior, nuevoFlujo })

      // Persistir cambio
      this.guardarContextoPersistente()

      console.log('🔄 Flujo cambiado:', flujoAnterior, '->', nuevoFlujo)
    }
  }

  // 🏷️ ACTUALIZAR filtros
  actualizarFiltros(nuevosFiltros) {
    this.contexto.filtros = { ...nuevosFiltros }
    this.contexto.filtrosActivos = Object.keys(nuevosFiltros).length > 0

    this.ejecutarCallbacks('cambio_filtros', nuevosFiltros)
    this.guardarContextoPersistente()
  }

  // 📊 ACTUALIZAR vista de datos
  actualizarVistaDatos(datos, tipo) {
    this.contexto.datosVisiables = datos
    this.contexto.tipoVista = tipo

    this.ejecutarCallbacks('cambio_vista_datos', { datos, tipo })
  }

  // ⏰ REGISTRAR acción
  registrarAccion(accion, parametros = {}) {
    this.contexto.ultimaAccion = accion
    this.contexto.tiempoUltimaAccion = Date.now()

    console.log('⚡ Acción registrada:', accion, parametros)
  }

  // 🎯 OBTENER contexto para IA
  obtenerContextoParaIA() {
    return {
      // Ubicación actual
      modulo: this.contexto.modulo,
      ruta: this.contexto.ruta,
      flujo: this.contexto.flujo,

      // Estado actual
      filtrosActivos: this.contexto.filtrosActivos,
      filtros: this.contexto.filtros,
      tipoVista: this.contexto.tipoVista,

      // Capacidades
      accionesDisponibles: this.contexto.accionesDisponibles,
      filtrosDisponibles: this.contexto.filtrosDisponibles,

      // Historial reciente
      historialReciente: this.contexto.historial.slice(-3),
      ultimaAccion: this.contexto.ultimaAccion,

      // Sugerencias contextuales
      sugerencias: this.generarSugerenciasContextuales()
    }
  }

  // 💡 GENERAR sugerencias contextuales
  generarSugerenciasContextuales() {
    const modulo = this.contexto.modulo
    const flujo = this.contexto.flujo
    const filtrosActivos = this.contexto.filtrosActivos

    let sugerencias = []

    // Sugerencias por módulo
    if (modulo === 'dashboard') {
      if (flujo === 'mobile') {
        sugerencias.push('Cambiar a escritorio para más funciones')
      }
      if (!filtrosActivos) {
        sugerencias.push('Aplicar filtros para datos específicos')
      }
      sugerencias.push('Abrir consola para ver logs detallados')
    }

    if (modulo === 'diagnostico') {
      sugerencias.push('Ejecutar diagnóstico completo')
      sugerencias.push('Ver métricas del sistema')
    }

    if (modulo === 'estadisticas') {
      sugerencias.push('Cambiar tipo de gráfica')
      sugerencias.push('Exportar reporte')
    }

    return sugerencias.slice(0, 3) // Máximo 3 sugerencias
  }

  // 📁 GUARDAR contexto persistente
  guardarContextoPersistente() {
    try {
      const contextoAGuardar = {
        flujo: this.contexto.flujo,
        filtros: this.contexto.filtros,
        ultimaRuta: this.contexto.ruta
      }
      localStorage.setItem('santoroContexto', JSON.stringify(contextoAGuardar))
    } catch (error) {
      console.error('Error guardando contexto:', error)
    }
  }

  // 📂 CARGAR contexto persistente
  cargarContextoPersistente() {
    try {
      const contextoGuardado = localStorage.getItem('santoroContexto')
      if (contextoGuardado) {
        const contexto = JSON.parse(contextoGuardado)
        this.contexto.flujo = contexto.flujo || 'mobile'
        this.contexto.filtros = contexto.filtros || {}
        this.contexto.filtrosActivos = Object.keys(this.contexto.filtros).length > 0
      }
    } catch (error) {
      console.error('Error cargando contexto:', error)
    }
  }

  // 🎯 REGISTRAR callback
  registrarCallback(evento, callback) {
    if (!this.callbacks.has(evento)) {
      this.callbacks.set(evento, [])
    }
    this.callbacks.get(evento).push(callback)
  }

  // 🚀 EJECUTAR callbacks
  ejecutarCallbacks(evento, datos) {
    const callbacks = this.callbacks.get(evento) || []
    callbacks.forEach(callback => {
      try {
        callback(datos)
      } catch (error) {
        console.error(`Error ejecutando callback ${evento}:`, error)
      }
    })
  }

  // 🔍 OBTENER información específica
  obtenerModuloActual() { return this.contexto.modulo }
  obtenerFlujoActual() { return this.contexto.flujo }
  obtenerFiltrosActuales() { return this.contexto.filtros }
  obtenerAccionesDisponibles() { return this.contexto.accionesDisponibles }
  obtenerFiltrosDisponibles() { return this.contexto.filtrosDisponibles }
}

// 🎯 Instancia global
export const santoroContextService = new SantoroContextService()
export default santoroContextService
