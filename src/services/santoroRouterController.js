// 🧭 SANTORO ROUTER CONTROLLER - Control total de navegación
// Permite a Santoro navegar entre páginas, abrir pestañas, cambiar rutas

import { useQuasar } from 'quasar'

class SantoroRouterController {
  constructor() {
    this.router = null
    this.rutas = {
      // Páginas principales
      'dashboard': '/logs',
      'logs': '/logs',
      'estadisticas': '/estadisticas',
      'eventos': '/eventos',
      'eventos-fallidos': '/eventos-fallidos',
      'diagnostico': '/diagnostico',
      'demo': '/santoro-demo',

      // Alias en español
      'inicio': '/logs',
      'principal': '/logs',
      'reportes': '/estadisticas',
      'graficas': '/estadisticas',
      'errores': '/eventos-fallidos',
      'fallos': '/eventos-fallidos',
      'analisis': '/diagnostico',
      'pruebas': '/santoro-demo'
    }

    this.pestañas = new Map() // Para controlar pestañas específicas
  }

  // 🎯 INICIALIZAR con router de Vue
  inicializar(router) {
    this.router = router
    console.log('🧭 Router Controller inicializado')
  }

  // 🚀 NAVEGAR A PÁGINA
  async navegarA(destino, parametros = {}) {
    console.log('🧭 Navegando a:', destino, parametros)

    const $q = useQuasar()

    // Normalizar destino
    const destinoNormalizado = this.normalizarDestino(destino)
    const ruta = this.rutas[destinoNormalizado]

    if (!ruta) {
      return {
        exito: false,
        mensaje: `No conozco la página "${destino}". Páginas disponibles: ${Object.keys(this.rutas).join(', ')}`
      }
    }

    if (!this.router) {
      return {
        exito: false,
        mensaje: 'Router no inicializado'
      }
    }

    try {
      // Mostrar indicador de navegación
      $q.loading.show({
        message: `🧭 Navegando a ${destino}...`,
        spinnerColor: 'purple'
      })

      // Navegar
      await this.router.push({
        path: ruta,
        query: parametros.filtros || {}
      })

      // Ocultar loading
      setTimeout(() => {
        $q.loading.hide()
        $q.notify({
          type: 'positive',
          message: `🎯 Has llegado a: ${destino}`,
          position: 'top-right',
          timeout: 2000
        })
      }, 800)

      return {
        exito: true,
        mensaje: `Navegación completada a ${destino}`,
        rutaFinal: ruta,
        accionEjecutada: 'navegar'
      }

    } catch (error) {
      $q.loading.hide()
      console.error('Error navegando:', error)
      return {
        exito: false,
        mensaje: `Error navegando a ${destino}: ${error.message}`
      }
    }
  }

  // 📑 ABRIR PESTAÑA ESPECÍFICA
  async abrirPestaña(pagina, pestaña, parametros = {}) {
    console.log('📑 Abriendo pestaña:', pagina, pestaña)

    // Primero navegar a la página
    const navegacion = await this.navegarA(pagina)
    if (!navegacion.exito) {
      return navegacion
    }

    // Luego activar la pestaña específica
    return await this.activarPestaña(pestaña, parametros)
  }

  // 🎯 ACTIVAR PESTAÑA (para componentes con tabs)
  async activarPestaña(nombrePestaña, parametros = {}) {
    const $q = useQuasar()

    // Mapeo de pestañas conocidas
    const pestañasMap = {
      // Diagnóstico
      'busqueda': 'busqueda',
      'error': 'errorCode',
      'codigo': 'errorCode',
      'sesion': 'session',
      'usuario': 'session',
      'soporte': 'soporte',
      'resultados': 'resultados',

      // Eventos
      'abiertos': 'abiertos',
      'fallidos': 'fallidos',
      'tipos': 'tipos',
      'estadisticas': 'stats'
    }

    const pestañaNormalizada = pestañasMap[nombrePestaña.toLowerCase()] || nombrePestaña

    // Emitir evento global para cambiar pestaña
    window.dispatchEvent(new CustomEvent('santoro-cambiar-pestaña', {
      detail: {
        pestaña: pestañaNormalizada,
        parametros: parametros
      }
    }))

    $q.notify({
      type: 'info',
      message: `📑 Cambiando a pestaña: ${nombrePestaña}`,
      position: 'top-right'
    })

    return {
      exito: true,
      mensaje: `Pestaña "${nombrePestaña}" activada`,
      accionEjecutada: 'cambiar_pestaña'
    }
  }

  // 🔍 ABRIR CON FILTROS
  async abrirConFiltros(pagina, filtros) {
    console.log('🔍 Abriendo con filtros:', pagina, filtros)

    const parametros = {
      filtros: this.procesarFiltros(filtros)
    }

    return await this.navegarA(pagina, parametros)
  }

  // 🏠 IR A PÁGINA DE INICIO
  async irAInicio() {
    return await this.navegarA('dashboard')
  }

  // ⬅️ NAVEGAR ATRÁS
  async navegarAtras() {
    if (!this.router) {
      return { exito: false, mensaje: 'Router no disponible' }
    }

    try {
      this.router.back()
      return {
        exito: true,
        mensaje: 'Navegando hacia atrás',
        accionEjecutada: 'navegar_atras'
      }
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error navegando atrás: ${error.message}`
      }
    }
  }

  // 🛠️ MÉTODOS AUXILIARES

  normalizarDestino(destino) {
    return destino.toLowerCase()
      .replace(/\s+/g, '') // Quitar espacios
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
  }

  procesarFiltros(filtros) {
    const filtrosNormalizados = {}

    // Procesar filtros de fecha
    if (filtros.fecha) {
      const fechas = this.procesarFecha(filtros.fecha)
      filtrosNormalizados.fechaInicio = fechas.inicio
      filtrosNormalizados.fechaFin = fechas.fin
    }

    // Procesar otros filtros
    if (filtros.usuario) filtrosNormalizados.usuario = filtros.usuario
    if (filtros.tipo) filtrosNormalizados.tipo = filtros.tipo
    if (filtros.codigo) filtrosNormalizados.codigo = filtros.codigo

    return filtrosNormalizados
  }

  procesarFecha(fechaTexto) {
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(hoy.getDate() - 1)

    switch (fechaTexto.toLowerCase()) {
      case 'hoy':
        return {
          inicio: hoy.toISOString().split('T')[0],
          fin: hoy.toISOString().split('T')[0]
        }
      case 'ayer':
        return {
          inicio: ayer.toISOString().split('T')[0],
          fin: ayer.toISOString().split('T')[0]
        }
      case 'semana': {
        const inicioSemana = new Date(hoy)
        inicioSemana.setDate(hoy.getDate() - 7)
        return {
          inicio: inicioSemana.toISOString().split('T')[0],
          fin: hoy.toISOString().split('T')[0]
        }
      }
      default:
        return {
          inicio: fechaTexto,
          fin: fechaTexto
        }
    }
  }

  // 📋 OBTENER ESTADO ACTUAL
  obtenerEstadoActual() {
    if (!this.router) return null

    return {
      rutaActual: this.router.currentRoute.value.path,
      paginaActual: this.obtenerNombrePagina(this.router.currentRoute.value.path),
      parametros: this.router.currentRoute.value.query
    }
  }

  obtenerNombrePagina(ruta) {
    const rutaInversa = Object.entries(this.rutas).find(([, path]) => path === ruta)
    return rutaInversa ? rutaInversa[0] : 'desconocida'
  }

  // 📚 OBTENER PÁGINAS DISPONIBLES
  obtenerPaginasDisponibles() {
    return Object.keys(this.rutas)
  }
}

// 🎯 Instancia global
export const santoroRouterController = new SantoroRouterController()
export default santoroRouterController
