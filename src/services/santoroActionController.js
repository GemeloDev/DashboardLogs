// 🎯 SANTORO ACTION CONTROLLER - Ejecuta acciones reales en la UI
// Este archivo conecta las decisiones de Santoro con cambios visuales reales

import { reactive } from 'vue'
import { santoroFiltersController } from './santoroFiltersController.js'

class SantoroActionController {
  constructor() {
    this.componentes = new Map() // Registro de componentes disponibles
    this.estado = reactive({
      accionEnProceso: false,
      ultimaAccion: null,
      resultadoVisible: false
    })

    this.callbacks = new Map() // Callbacks para acciones específicas
    this.notificationCallback = null // Callback para notificaciones
  }

  // 🔧 CONFIGURAR CALLBACK DE NOTIFICACIONES
  configurarNotificaciones(callback) {
    this.notificationCallback = callback
  }

  // 🔔 MOSTRAR NOTIFICACIÓN
  mostrarNotificacion(tipo, mensaje, posicion = 'top') {
    try {
      if (this.notificationCallback) {
        this.notificationCallback({ type: tipo, message: mensaje, position: posicion })
      } else {
        console.log(`🔔 ${tipo.toUpperCase()}: ${mensaje}`)
      }
    } catch {
      console.log(`🔔 ${tipo.toUpperCase()}: ${mensaje}`)
    }
  }

  // 📋 REGISTRAR COMPONENTE para que Santoro pueda controlarlo
  registrarComponente(nombre, instancia, metodos = {}) {
    console.log(`🔗 Registrando componente: ${nombre}`)
    this.componentes.set(nombre, {
      instancia,
      metodos,
      disponible: true
    })
  }

  // 🚀 EJECUTAR ACCIÓN PRINCIPAL
  async ejecutarAccion(nombreAccion, parametros = {}, datos = null) {
    console.log('🎯 Ejecutando acción UI:', nombreAccion, parametros)

    this.estado.accionEnProceso = true
    this.estado.ultimaAccion = nombreAccion

    try {
      let resultado

      switch (nombreAccion) {
        // 📊 ACCIONES DE GRÁFICOS Y VISUALIZACIÓN
        case 'ver_grafico':
        case 'mostrar_grafico':
          resultado = await this.mostrarGrafico(datos, parametros)
          break

        case 'abrir_dashboard':
          resultado = await this.abrirDashboard(parametros.tipo)
          break

        // 📁 ACCIONES DE EXPORTACIÓN
        case 'exportar':
        case 'generar_reporte':
          resultado = await this.exportarDatos(datos, parametros)
          break

        // 🔍 ACCIONES DE FILTROS
        case 'filtrar_mas':
        case 'abrir_filtros':
          resultado = await this.abrirFiltros(parametros)
          break

        case 'aplicar_filtro_fecha':
        case 'filtrar_fecha':
        case 'filtrar_por_fecha':
          resultado = await this.aplicarFiltroFecha(parametros)
          break

        case 'filtrar_hoy':
          resultado = await this.aplicarFiltroFecha({ tipo: 'hoy' })
          break

        case 'filtrar_ayer':
          resultado = await this.aplicarFiltroFecha({ tipo: 'ayer' })
          break

        case 'filtrar_semana':
        case 'filtrar_esta_semana':
          resultado = await this.aplicarFiltroFecha({ tipo: 'semana actual' })
          break

        case 'filtrar_mes':
        case 'filtrar_este_mes':
          resultado = await this.aplicarFiltroFecha({ tipo: 'mes actual' })
          break

        case 'filtrar_ultimos_7_dias':
        case 'filtrar_semana_pasada':
          resultado = await this.aplicarFiltroFecha({ tipo: 'ultimos 7 dias' })
          break

        case 'filtrar_ultimos_30_dias':
        case 'filtrar_mes_pasado':
          resultado = await this.aplicarFiltroFecha({ tipo: 'ultimos 30 dias' })
          break

        case 'resetear_filtros':
        case 'limpiar_filtros':
          resultado = await this.resetearFiltros()
          break

        // 🖥️ ACCIONES DE CONTROL DE ESCRITORIO
        case 'cerrar_consola':
        case 'cerrar_diagnostico':
          resultado = await this.cerrarConsola(parametros)
          break

        case 'cerrar_modal_filtros':
        case 'cerrar_filtros':
        case 'cerrar_modal':
          resultado = await this.cerrarModalFiltros(parametros)
          break

        case 'minimizar_escritorio':
        case 'minimizar_flujo':
          resultado = await this.minimizarEscritorio(parametros)
          break

        case 'maximizar_escritorio':
        case 'maximizar_flujo':
          resultado = await this.maximizarEscritorio(parametros)
          break

        // 🔍 ACCIONES DE BÚSQUEDA Y DIAGNÓSTICO
        case 'ver_detalles':
        case 'mostrar_detalles':
          resultado = await this.mostrarDetalles(datos, parametros)
          break

        case 'abrir_diagnostico':
          resultado = await this.abrirDiagnostico(parametros)
          break

        case 'abrir_consola':
        case 'mostrar_consola':
          resultado = await this.abrirConsola(parametros)
          break

        case 'cambiar_flujo':
        case 'cambiar_vista':
          resultado = await this.cambiarFlujo(parametros)
          break

        case 'aplicar_filtro':
        case 'filtrar_por':
          resultado = await this.aplicarFiltro(parametros)
          break

        case 'navegar_a':
        case 'ir_a':
          resultado = await this.navegarA(parametros)
          break

        case 'buscar_relacionados':
          resultado = await this.buscarRelacionados(datos, parametros)
          break

        // 📈 ACCIONES DE ANÁLISIS
        case 'ver_timeline':
        case 'mostrar_timeline':
          resultado = await this.mostrarTimeline(datos, parametros)
          break

        case 'analizar_errores':
          resultado = await this.analizarErrores(datos, parametros)
          break

        // 💡 ACCIONES DE AYUDA
        case 'mostrar_ayuda':
          resultado = await this.mostrarAyuda(parametros)
          break

        case 'mostrar_sugerencias':
          resultado = await this.mostrarSugerencias(datos, parametros)
          break

        default:
          console.warn(`⚠️ Acción no reconocida: ${nombreAccion}`)
          resultado = {
            exito: false,
            mensaje: `No sé cómo ejecutar: ${nombreAccion}`,
            accionEjecutada: nombreAccion
          }
      }

      this.estado.resultadoVisible = true
      return resultado

    } catch (error) {
      console.error('❌ Error ejecutando acción:', error)
      return {
        exito: false,
        mensaje: `Error ejecutando ${nombreAccion}: ${error.message}`,
        error: true
      }
    } finally {
      this.estado.accionEnProceso = false
    }
  }

  // 📊 MOSTRAR GRÁFICO
  async mostrarGrafico(datos) {
    if (!datos || datos.length === 0) {
      this.mostrarNotificacion('warning', '📊 No hay datos para mostrar en el gráfico', 'top-right')
      return { exito: false, mensaje: 'Sin datos para graficar' }
    }

    // Emitir evento para abrir gráfico
    window.dispatchEvent(new CustomEvent('santoro-mostrar-grafico', {
      detail: { datos }
    }))

    this.mostrarNotificacion('positive', '📊 Gráfico generado exitosamente', 'top-right')

    return {
      exito: true,
      mensaje: `Gráfico mostrado con ${datos.length} registros`,
      accionEjecutada: 'mostrar_grafico'
    }
  }

  // 📁 EXPORTAR DATOS
  async exportarDatos(datos) {
    if (!datos || datos.length === 0) {
      this.mostrarNotificacion('warning', '📁 No hay datos para exportar', 'top-right')
      return { exito: false, mensaje: 'Sin datos para exportar' }
    }

    // Simular exportación con notificación de loading
    this.mostrarNotificacion('info', 'Generando reporte...', 'top')

    // Simular delay de exportación
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Crear archivo de ejemplo (en una implementación real usarías tus datos)
    const contenidoCSV = this.generarCSV(datos)
    this.descargarArchivo(contenidoCSV, `santoro-reporte-${Date.now()}.csv`)

    this.mostrarNotificacion('positive', `📁 Reporte exportado con ${datos.length} registros`, 'top-right')

    return {
      exito: true,
      mensaje: `Exportación completada: ${datos.length} registros`,
      accionEjecutada: 'exportar'
    }
  }

  // 🔍 ABRIR FILTROS
  async abrirFiltros() {
    try {
      const resultado = await santoroFiltersController.abrirPanelFiltros()

      if (resultado.exito) {
        this.mostrarNotificacion('positive', '🔍 Panel de filtros abierto', 'top')
      } else {
        // Fallback: emitir evento personalizado
        window.dispatchEvent(new CustomEvent('santoro-abrir-filtros-avanzados'))
        this.mostrarNotificacion('info', '🔍 Abriendo filtros...', 'top')
      }

      return {
        exito: true,
        mensaje: 'Panel de filtros abierto',
        accionEjecutada: 'abrir_filtros'
      }
    } catch (error) {
      console.error('Error abriendo filtros:', error)
      return {
        exito: false,
        mensaje: 'Error al abrir filtros'
      }
    }
  }

  // 📅 APLICAR FILTRO DE FECHA
  async aplicarFiltroFecha(parametros) {
    try {
      const tipoFiltro = parametros.tipo || parametros.filtro || 'mes actual'
      const resultado = await santoroFiltersController.aplicarFiltroFecha(tipoFiltro)

      if (resultado.exito) {
        this.mostrarNotificacion('positive', `✅ ${resultado.mensaje}`, 'top')

        return {
          exito: true,
          mensaje: resultado.mensaje,
          accionEjecutada: 'aplicar_filtro_fecha',
          datos: {
            fechaInicio: resultado.fechaInicio,
            fechaFin: resultado.fechaFin,
            descripcion: resultado.descripcion
          }
        }
      } else {
        this.mostrarNotificacion('warning', '⚠️ No se pudo aplicar el filtro', 'top')
        return {
          exito: false,
          mensaje: 'No se pudo aplicar el filtro de fecha'
        }
      }
    } catch (error) {
      console.error('Error aplicando filtro de fecha:', error)
      return {
        exito: false,
        mensaje: 'Error al aplicar filtro de fecha'
      }
    }
  }

  // 🔄 RESETEAR FILTROS
  async resetearFiltros() {
    try {
      const resultado = await santoroFiltersController.resetearFiltros()

      if (resultado.exito) {
        this.mostrarNotificacion('positive', `🔄 ${resultado.mensaje}`, 'top')

        return {
          exito: true,
          mensaje: resultado.mensaje,
          accionEjecutada: 'resetear_filtros'
        }
      } else {
        return {
          exito: false,
          mensaje: 'No se pudo resetear los filtros'
        }
      }
    } catch (error) {
      console.error('Error reseteando filtros:', error)
      return {
        exito: false,
        mensaje: 'Error al resetear filtros'
      }
    }
  }

  // 🔍 MOSTRAR DETALLES
  async mostrarDetalles(datos) {
    if (!datos) {
      return { exito: false, mensaje: 'No hay detalles para mostrar' }
    }

    // Emitir evento con detalles
    window.dispatchEvent(new CustomEvent('santoro-mostrar-detalles', {
      detail: { datos }
    }))

    this.mostrarNotificacion('info', '🔍 Mostrando detalles...', 'top')

    return {
      exito: true,
      mensaje: 'Detalles mostrados',
      accionEjecutada: 'mostrar_detalles'
    }
  }

  // 🏥 ABRIR DIAGNÓSTICO
  async abrirDiagnostico(parametros) {
    const diagnostico = this.componentes.get('diagnostico')

    if (diagnostico && diagnostico.metodos.abrir) {
      diagnostico.metodos.abrir(parametros)
      return {
        exito: true,
        mensaje: 'Diagnóstico abierto',
        accionEjecutada: 'abrir_diagnostico'
      }
    }

    // Fallback: Navegar a la página de diagnóstico
    try {
      // Emitir evento para navegación
      window.dispatchEvent(new CustomEvent('santoro-navegar', {
        detail: { ruta: '/diagnostico', parametros }
      }))

      this.mostrarNotificacion('positive', '🏥 Abriendo módulo de diagnóstico...', 'top-right')

      return {
        exito: true,
        mensaje: '🏥 Navegando al módulo de diagnóstico...',
        accionEjecutada: 'abrir_diagnostico'
      }
    } catch (error) {
      console.error('Error abriendo diagnóstico:', error)
      return {
        exito: false,
        mensaje: 'Error abriendo diagnóstico: ' + error.message,
        accionEjecutada: 'abrir_diagnostico'
      }
    }
  }

  // �️ ABRIR CONSOLA
  async abrirConsola(parametros = {}) {
    try {
      // Emitir evento para abrir la consola
      window.dispatchEvent(new CustomEvent('santoro-abrir-consola', {
        detail: parametros
      }))

      this.mostrarNotificacion('positive', '🖥️ Abriendo consola de logs...', 'top-right')

      return {
        exito: true,
        mensaje: '🖥️ Abriendo consola de logs del sistema...',
        accionEjecutada: 'abrir_consola'
      }
    } catch (error) {
      console.error('Error abriendo consola:', error)
      return {
        exito: false,
        mensaje: 'Error abriendo consola: ' + error.message,
        accionEjecutada: 'abrir_consola'
      }
    }
  }

  // 🔄 CAMBIAR FLUJO (Mobile/Escritorio) con navegación inteligente
  async cambiarFlujo(parametros = {}) {
    try {
      const flujo = parametros.flujo || parametros.tipo || 'mobile'
      const contextoActual = parametros.contextoActual || 'dashboard'
      const necesitaNavegacion = parametros.necesitaNavegacion || false

      // Emitir evento para cambiar flujo
      window.dispatchEvent(new CustomEvent('santoro-cambiar-flujo', {
        detail: { flujo }
      }))

      const mensaje = flujo === 'mobile'
        ? '📱 Cambiando a vista móvil...'
        : '🖥️ Cambiando a vista de escritorio...'

      this.mostrarNotificacion('info', mensaje, 'top-right')

      // Si necesita navegación o no está en una ruta apropiada, navegar al dashboard
      if (necesitaNavegacion || !window.location.pathname.includes('/logs')) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('santoro-navegar', {
            detail: { ruta: '/logs', parametros: { flujo } }
          }))
        }, 500) // Dar tiempo al cambio de flujo
      }

      return {
        exito: true,
        mensaje: mensaje,
        accionEjecutada: 'cambiar_flujo',
        datos: { flujo, contextoActual, navegado: necesitaNavegacion }
      }
    } catch (error) {
      console.error('Error cambiando flujo:', error)
      return {
        exito: false,
        mensaje: 'Error cambiando flujo: ' + error.message,
        accionEjecutada: 'cambiar_flujo'
      }
    }
  }

  // 🔍 APLICAR FILTRO
  async aplicarFiltro(parametros = {}) {
    try {
      // Emitir evento para aplicar filtros
      window.dispatchEvent(new CustomEvent('santoro-aplicar-filtro', {
        detail: parametros
      }))

      const tipoFiltro = parametros.tipo || parametros.filtro || 'personalizado'
      const mensaje = `🔍 Aplicando filtro: ${tipoFiltro}...`

      this.mostrarNotificacion('info', mensaje, 'top-right')

      return {
        exito: true,
        mensaje: mensaje,
        accionEjecutada: 'aplicar_filtro',
        datos: parametros
      }
    } catch (error) {
      console.error('Error aplicando filtro:', error)
      return {
        exito: false,
        mensaje: 'Error aplicando filtro: ' + error.message,
        accionEjecutada: 'aplicar_filtro'
      }
    }
  }

  // 🧭 NAVEGAR A
  async navegarA(parametros = {}) {
    try {
      const ruta = parametros.ruta || parametros.pagina || '/'

      // Mapear nombres amigables a rutas
      const rutasDisponibles = {
        'logs': '/logs',
        'estadisticas': '/estadisticas',
        'eventos': '/eventos',
        'eventos-fallidos': '/eventos-fallidos',
        'diagnostico': '/diagnostico',
        'dashboard': '/logs'
      }

      const rutaFinal = rutasDisponibles[ruta.toLowerCase()] || ruta

      // Emitir evento de navegación
      window.dispatchEvent(new CustomEvent('santoro-navegar', {
        detail: { ruta: rutaFinal, parametros }
      }))

      this.mostrarNotificacion('info', `🧭 Navegando a ${ruta}...`, 'top-right')

      return {
        exito: true,
        mensaje: `🧭 Navegando a ${ruta}...`,
        accionEjecutada: 'navegar_a',
        datos: { ruta: rutaFinal }
      }
    } catch (error) {
      console.error('Error navegando:', error)
      return {
        exito: false,
        mensaje: 'Error navegando: ' + error.message,
        accionEjecutada: 'navegar_a'
      }
    }
  }

  // �📊 ABRIR DASHBOARD
  async abrirDashboard(tipo = 'general') {
    // Emitir evento para navegar al dashboard
    window.dispatchEvent(new CustomEvent('santoro-abrir-dashboard', {
      detail: { tipo }
    }))

    this.mostrarNotificacion('info', `📊 Cargando dashboard: ${tipo}`, 'top-right')

    return {
      exito: true,
      mensaje: `Dashboard ${tipo} cargado`,
      accionEjecutada: 'abrir_dashboard'
    }
  }

  // 💡 MOSTRAR AYUDA
  async mostrarAyuda() {
    // Emitir evento para mostrar ayuda
    window.dispatchEvent(new CustomEvent('santoro-mostrar-ayuda'))

    this.mostrarNotificacion('info', '💡 Mostrando ayuda completa...', 'top')

    return {
      exito: true,
      mensaje: 'Ayuda mostrada',
      accionEjecutada: 'mostrar_ayuda'
    }
  }

  // 🛠️ MÉTODOS AUXILIARES

  generarCSV(datos) {
    if (!Array.isArray(datos)) return 'Sin datos'

    const headers = Object.keys(datos[0] || {})
    const csvContent = [
      headers.join(','),
      ...datos.map(row => headers.map(header =>
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n')

    return csvContent
  }

  descargarArchivo(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    link.click()
    URL.revokeObjectURL(url)
  }

  formatearDetalles(datos) {
    if (Array.isArray(datos)) {
      return `
                <div>
                    <h6>📊 Resumen de Datos</h6>
                    <p><strong>Total de registros:</strong> ${datos.length}</p>
                    <p><strong>Primer registro:</strong> ${JSON.stringify(datos[0], null, 2).substring(0, 200)}...</p>
                </div>
            `
    }

    return `<pre>${JSON.stringify(datos, null, 2)}</pre>`
  }

  async procesarBusquedaInteligente(busqueda) {
    this.mostrarNotificacion('info', `🔍 Procesando: "${busqueda}"`, 'top-right')

    // Emitir evento para procesar búsqueda
    window.dispatchEvent(new CustomEvent('santoro-procesar-busqueda', {
      detail: { busqueda }
    }))
  }

  // 🖥️ FUNCIONES DE CONTROL DE ESCRITORIO

  // 🚪 CERRAR CONSOLA/DIAGNÓSTICO
  async cerrarConsola(parametros = {}) {
    try {
      // Buscar componentes de consola o diagnóstico
      const componentesConsola = ['escritorio-consola', 'diagnostico', 'flujo-escritorio']
      let cerrado = false

      for (const nombreComp of componentesConsola) {
        const componente = this.componentes.get(nombreComp)
        if (componente?.disponible) {
          // Intentar cerrar usando diferentes métodos
          if (componente.metodos.cerrar) {
            await componente.metodos.cerrar()
            cerrado = true
            this.mostrarNotificacion('success', '✅ Consola cerrada correctamente', 'top')
            break
          } else if (componente.metodos.ocultar) {
            await componente.metodos.ocultar()
            cerrado = true
            this.mostrarNotificacion('success', '✅ Diagnóstico minimizado', 'top')
            break
          }
        }
      }

      // Si no encontramos componentes específicos, emitir evento global
      if (!cerrado) {
        window.dispatchEvent(new CustomEvent('santoro-cerrar-consola', {
          detail: parametros
        }))
        cerrado = true
        this.mostrarNotificacion('info', '📱 Comando de cierre enviado', 'top')
      }

      return {
        exito: cerrado,
        mensaje: cerrado ? 'Consola cerrada correctamente' : 'No pude encontrar la consola para cerrar',
        accionEjecutada: 'cerrar_consola'
      }

    } catch (error) {
      console.error('❌ Error cerrando consola:', error)
      return {
        exito: false,
        mensaje: 'Error al intentar cerrar la consola',
        error: error.message
      }
    }
  }

  // 🔧 CERRAR MODAL DE FILTROS
  async cerrarModalFiltros(parametros = {}) {
    try {
      // Buscar componentes de modal de filtros
      const componentesFiltros = ['modal-filtros', 'filtros-avanzados', 'log-filters']
      let cerrado = false

      for (const nombreComp of componentesFiltros) {
        const componente = this.componentes.get(nombreComp)
        if (componente?.disponible) {
          if (componente.metodos.cerrar) {
            await componente.metodos.cerrar()
            cerrado = true
            this.mostrarNotificacion('success', '✅ Modal de filtros cerrado', 'top')
            break
          } else if (componente.metodos.ocultar) {
            await componente.metodos.ocultar()
            cerrado = true
            break
          }
        }
      }

      // Emitir evento global para cerrar modales
      if (!cerrado) {
        window.dispatchEvent(new CustomEvent('santoro-cerrar-modal-filtros', {
          detail: parametros
        }))
        cerrado = true
        this.mostrarNotificación('info', '🔧 Comando de cierre de filtros enviado', 'top')
      }

      return {
        exito: cerrado,
        mensaje: cerrado ? 'Modal de filtros cerrado correctamente' : 'No encontré el modal de filtros abierto',
        accionEjecutada: 'cerrar_modal_filtros'
      }

    } catch (error) {
      console.error('❌ Error cerrando modal de filtros:', error)
      return {
        exito: false,
        mensaje: 'Error al intentar cerrar el modal de filtros',
        error: error.message
      }
    }
  }

  // 📉 MINIMIZAR ESCRITORIO
  async minimizarEscritorio(parametros = {}) {
    try {
      const componente = this.componentes.get('flujo-escritorio')

      if (componente?.disponible && componente.metodos.minimizar) {
        await componente.metodos.minimizar()
        this.mostrarNotificacion('success', '📉 Escritorio minimizado', 'top')

        return {
          exito: true,
          mensaje: 'Escritorio minimizado correctamente',
          accionEjecutada: 'minimizar_escritorio'
        }
      }

      // Fallback: evento global
      window.dispatchEvent(new CustomEvent('santoro-minimizar-escritorio', {
        detail: parametros
      }))

      return {
        exito: true,
        mensaje: 'Comando de minimizar enviado',
        accionEjecutada: 'minimizar_escritorio'
      }

    } catch (error) {
      console.error('❌ Error minimizando escritorio:', error)
      return {
        exito: false,
        mensaje: 'Error al minimizar el escritorio',
        error: error.message
      }
    }
  }

  // 📈 MAXIMIZAR ESCRITORIO
  async maximizarEscritorio(parametros = {}) {
    try {
      const componente = this.componentes.get('flujo-escritorio')

      if (componente?.disponible && componente.metodos.maximizar) {
        await componente.metodos.maximizar()
        this.mostrarNotificacion('success', '📈 Escritorio maximizado', 'top')

        return {
          exito: true,
          mensaje: 'Escritorio maximizado correctamente',
          accionEjecutada: 'maximizar_escritorio'
        }
      }

      // Fallback: evento global
      window.dispatchEvent(new CustomEvent('santoro-maximizar-escritorio', {
        detail: parametros
      }))

      return {
        exito: true,
        mensaje: 'Comando de maximizar enviado',
        accionEjecutada: 'maximizar_escritorio'
      }

    } catch (error) {
      console.error('❌ Error maximizando escritorio:', error)
      return {
        exito: false,
        mensaje: 'Error al maximizar el escritorio',
        error: error.message
      }
    }
  }

  // 📞 CALLBACK REGISTRATION para acciones personalizadas
  registrarCallback(accion, callback) {
    this.callbacks.set(accion, callback)
  }

  async ejecutarCallback(accion, parametros) {
    const callback = this.callbacks.get(accion)
    if (callback) {
      return await callback(parametros)
    }
    return { exito: false, mensaje: `Callback no encontrado: ${accion}` }
  }
}

// 🎯 Instancia global
export const santoroActionController = new SantoroActionController()
export default santoroActionController
