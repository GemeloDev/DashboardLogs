// 🎭 SANTORO MODAL CONTROLLER - Versión simplificada sin useQuasar
// Control completo de modales y diálogos

class SantoroModalController {
  constructor() {
    this.modalesActivos = new Map()
    this.componentesRegistrados = new Map()
    this.notificationCallback = null

    // 🛡️ Sistema de seguimiento y seguridad
    this.historialModales = []
    this.operacionesEnCurso = new Map()

    // 🔧 Configuración de seguridad
    this.configuracionSeguridad = {
      requiereConfirmacionParaCerrar: ['diagnostico', 'configuracion'],
      verificarDatosNoGuardados: true,
      permitirCierreForzado: true,
      tiempoEsperaOperaciones: 5000 // 5 segundos
    }

    // 🔄 Inicializar listeners para seguimiento
    this.inicializarSeguimientoModales()
  }

  // 🔧 CONFIGURAR CALLBACK DE NOTIFICACIONES
  configurarNotificaciones(callback) {
    this.notificationCallback = callback
  }

  // 🔄 INICIALIZAR SEGUIMIENTO DE MODALES
  inicializarSeguimientoModales() {
    // Listener para cuando se abren modales
    window.addEventListener('santoro-modal-abierto', (event) => {
      const { tipo, parametros } = event.detail || {}
      if (tipo) {
        this.modalesActivos.set(tipo, {
          abierto: new Date(),
          parametros,
          operacionesCriticas: []
        })
        this.historialModales.push({
          accion: 'abrir',
          tipo,
          timestamp: new Date(),
          parametros
        })
      }
    })

    // Listener para cuando se cierran modales
    window.addEventListener('santoro-modal-cerrado', (event) => {
      const { tipo, razon } = event.detail || {}
      if (tipo) {
        this.modalesActivos.delete(tipo)
        this.historialModales.push({
          accion: 'cerrar',
          tipo,
          timestamp: new Date(),
          razon
        })
      }
    })

    // Listener para operaciones críticas
    window.addEventListener('santoro-operacion-critica', (event) => {
      const { tipo, estado, modal } = event.detail || {}
      if (modal && this.modalesActivos.has(modal)) {
        const modalData = this.modalesActivos.get(modal)
        if (estado === 'iniciada') {
          modalData.operacionesCriticas.push(tipo)
        } else if (estado === 'finalizada') {
          modalData.operacionesCriticas = modalData.operacionesCriticas.filter(op => op !== tipo)
        }
        this.modalesActivos.set(modal, modalData)
      }
    })

    console.log('🔄 Sistema de seguimiento de modales inicializado')
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

  // 📝 REGISTRAR COMPONENTE que tiene modales
  registrarComponente(nombre, instancia, metodos = {}) {
    console.log(`🎭 Registrando componente modal: ${nombre}`)
    this.componentesRegistrados.set(nombre, {
      instancia,
      metodos,
      activo: true
    })
  }

  // 🔓 ABRIR MODAL ESPECÍFICO
  async abrirModal(tipoModal, parametros = {}) {
    console.log('🔓 Abriendo modal:', tipoModal, parametros)

    try {
      switch (tipoModal.toLowerCase()) {
        case 'diagnostico':
        case 'diagnóstico':
          return await this.abrirDiagnostico(parametros)

        case 'detalle':
        case 'detalles':
          return await this.abrirDetalle(parametros)

        case 'filtros':
        case 'filtro':
          return await this.abrirFiltros(parametros)

        case 'gemini':
        case 'ia':
        case 'ai':
          return await this.abrirConfiguracionGemini(parametros)

        case 'ayuda':
        case 'help':
          return await this.abrirAyuda(parametros)

        default:
          return await this.abrirModalGenerico(tipoModal, parametros)
      }
    } catch (error) {
      console.error('Error abriendo modal:', error)
      return {
        exito: false,
        mensaje: `Error abriendo modal ${tipoModal}: ${error.message}`
      }
    }
  }

  // 🏥 ABRIR MODAL DE DIAGNÓSTICO
  async abrirDiagnostico(parametros = {}) {
    try {
      // Registrar modal como activo
      this.modalesActivos.set('diagnostico', {
        abierto: new Date(),
        parametros,
        operacionesCriticas: []
      })

      // Intentar usar componente registrado
      const diagnostico = this.componentesRegistrados.get('diagnostico')
      if (diagnostico && diagnostico.metodos.abrir) {
        diagnostico.metodos.abrir(parametros)

        // Notificar que se abrió el modal
        window.dispatchEvent(new CustomEvent('santoro-modal-abierto', {
          detail: { tipo: 'diagnostico', parametros }
        }))

        return {
          exito: true,
          mensaje: 'Modal de diagnóstico abierto',
          accionEjecutada: 'abrir_diagnostico'
        }
      }

      // Fallback: Emitir evento global
      window.dispatchEvent(new CustomEvent('santoro-abrir-diagnostico', {
        detail: parametros
      }))

      // Notificar que se abrió el modal
      window.dispatchEvent(new CustomEvent('santoro-modal-abierto', {
        detail: { tipo: 'diagnostico', parametros }
      }))

      this.mostrarNotificacion('info', '🏥 Abriendo diagnóstico avanzado...', 'top-right')

      return {
        exito: true,
        mensaje: 'Diagnóstico solicitado via evento',
        accionEjecutada: 'abrir_diagnostico'
      }
    } catch (error) {
      console.error('Error abriendo diagnóstico:', error)
      return {
        exito: false,
        mensaje: `Error abriendo diagnóstico: ${error.message}`
      }
    }
  }

  // 🤖 ABRIR CONFIGURACIÓN DE GEMINI AI
  async abrirConfiguracionGemini(parametros = {}) {
    try {
      // Intentar usar componente registrado
      const geminiConfig = this.componentesRegistrados.get('gemini-config')
      if (geminiConfig && geminiConfig.metodos.abrir) {
        geminiConfig.metodos.abrir(parametros)
        return {
          exito: true,
          mensaje: 'Modal de configuración de Gemini AI abierto',
          accionEjecutada: 'abrir_configuracion_gemini'
        }
      }

      // Fallback: Emitir evento global
      window.dispatchEvent(new CustomEvent('santoro-abrir-gemini-config', {
        detail: parametros
      }))

      this.mostrarNotificacion('info', '🤖 Abriendo configuración de Gemini AI...', 'top-right')

      return {
        exito: true,
        mensaje: 'Configuración de Gemini AI solicitada',
        accionEjecutada: 'abrir_configuracion_gemini'
      }
    } catch (error) {
      console.error('Error abriendo configuración Gemini:', error)
      return {
        exito: false,
        mensaje: `Error abriendo configuración Gemini: ${error.message}`
      }
    }
  }

  // 💡 ABRIR AYUDA
  async abrirAyuda() {
    this.mostrarNotificacion('info', '💡 Abriendo ayuda del sistema...', 'top')

    window.dispatchEvent(new CustomEvent('santoro-abrir-ayuda'))

    return {
      exito: true,
      mensaje: 'Ayuda solicitada',
      accionEjecutada: 'abrir_ayuda'
    }
  }

  // 📂 ABRIR DETALLE
  async abrirDetalle(parametros = {}) {
    window.dispatchEvent(new CustomEvent('santoro-abrir-detalle', {
      detail: parametros
    }))

    this.mostrarNotificacion('info', '📂 Abriendo detalles...', 'top')

    return {
      exito: true,
      mensaje: 'Detalle solicitado',
      accionEjecutada: 'abrir_detalle'
    }
  }

  // 🔍 ABRIR FILTROS
  async abrirFiltros(parametros = {}) {
    window.dispatchEvent(new CustomEvent('santoro-abrir-filtros', {
      detail: parametros
    }))

    this.mostrarNotificacion('info', '🔍 Abriendo filtros...', 'top')

    return {
      exito: true,
      mensaje: 'Filtros solicitados',
      accionEjecutada: 'abrir_filtros'
    }
  }

  // 🎯 ABRIR MODAL GENÉRICO
  async abrirModalGenerico(tipo, parametros = {}) {
    window.dispatchEvent(new CustomEvent(`santoro-abrir-${tipo}`, {
      detail: parametros
    }))

    this.mostrarNotificacion('info', `Abriendo ${tipo}...`, 'top')

    return {
      exito: true,
      mensaje: `${tipo} solicitado`,
      accionEjecutada: `abrir_${tipo}`
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚪 FUNCIONES DE CERRAR MODALES - Sistema completo y seguro
  // ═══════════════════════════════════════════════════════════════════════════════

  // 🔒 CERRAR MODAL ESPECÍFICO con validaciones de seguridad
  async cerrarModal(tipoModal, parametros = {}) {
    console.log('🔒 Cerrando modal:', tipoModal, parametros)

    try {
      // Validar estado antes de cerrar
      const validacion = await this.validarCierreModal(tipoModal, parametros)
      if (!validacion.seguro) {
        return {
          exito: false,
          mensaje: validacion.razon,
          requiereConfirmacion: validacion.requiereConfirmacion,
          accionEjecutada: `cerrar_${tipoModal}`,
          advertencias: validacion.advertencias
        }
      }

      switch (tipoModal.toLowerCase()) {
        case 'diagnostico':
          return await this.cerrarDiagnostico(parametros)

        case 'configuracion':
        case 'gemini':
        case 'configuracion-gemini':
          return await this.cerrarConfiguracionGemini(parametros)

        case 'ayuda':
          return await this.cerrarAyuda(parametros)

        case 'detalle':
        case 'detalles':
          return await this.cerrarDetalle(parametros)

        case 'filtros':
        case 'filtros-avanzados':
          return await this.cerrarFiltros(parametros)

        default:
          return await this.cerrarModalGenerico(tipoModal, parametros)
      }
    } catch (error) {
      console.error('Error cerrando modal:', error)
      return {
        exito: false,
        mensaje: `Error cerrando modal ${tipoModal}: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🛡️ VALIDAR CIERRE DE MODAL - Sistema de seguridad
  async validarCierreModal(tipoModal, parametros = {}) {
    console.log('🛡️ Validando cierre de modal:', tipoModal)

    const validacion = {
      seguro: true,
      razon: '',
      requiereConfirmacion: false,
      advertencias: []
    }

    try {
      // 1. Verificar si el modal está realmente abierto
      const componente = this.componentesRegistrados.get(tipoModal.toLowerCase())
      if (componente && componente.metodos.estaAbierto) {
        const abierto = await componente.metodos.estaAbierto()
        if (!abierto) {
          validacion.seguro = false
          validacion.razon = `El modal ${tipoModal} no está abierto actualmente`
          return validacion
        }
      }

      // 2. Verificar operaciones críticas en curso
      if (parametros.forzar !== true) {
        const operacionesCriticas = await this.detectarOperacionesCriticas(tipoModal)
        if (operacionesCriticas.length > 0) {
          validacion.requiereConfirmacion = true
          validacion.advertencias.push(`Operaciones en curso: ${operacionesCriticas.join(', ')}`)

          // Si no hay confirmación explícita, no es seguro cerrar
          if (!parametros.confirmado) {
            validacion.seguro = false
            validacion.razon = 'Hay operaciones críticas en curso. Use confirmado: true para forzar el cierre.'
          }
        }
      }

      // 3. Verificar datos sin guardar
      const datosNoGuardados = await this.verificarDatosNoGuardados(tipoModal)
      if (datosNoGuardados.hayDatos) {
        validacion.requiereConfirmacion = true
        validacion.advertencias.push('Hay cambios sin guardar que se perderán')

        if (!parametros.descartarCambios && !parametros.confirmado) {
          validacion.seguro = false
          validacion.razon = 'Hay cambios sin guardar. Use descartarCambios: true o confirmado: true'
        }
      }

      // 4. Verificar dependencias de otros modales
      const dependencias = await this.verificarDependenciasModales(tipoModal)
      if (dependencias.length > 0) {
        validacion.advertencias.push(`Cerrará también: ${dependencias.join(', ')}`)
      }

      return validacion

    } catch (error) {
      console.error('Error validando cierre de modal:', error)
      validacion.seguro = true // En caso de error, permitir el cierre
      validacion.advertencias.push('No se pudo validar completamente el estado del modal')
      return validacion
    }
  }

  // 🔍 DETECTAR OPERACIONES CRÍTICAS
  async detectarOperacionesCriticas(tipoModal) {
    const operaciones = []

    try {
      // Verificar exportaciones en curso
      if (window.exportandoDatos) {
        operaciones.push('exportación de datos')
      }

      // Verificar procesamiento de filtros
      if (window.aplicandoFiltros) {
        operaciones.push('aplicación de filtros')
      }

      // Verificar análisis en curso
      if (window.analizandoDatos) {
        operaciones.push('análisis de datos')
      }

      // Verificar carga de archivos
      if (window.cargandoArchivos) {
        operaciones.push('carga de archivos')
      }

      // Verificaciones específicas por tipo de modal
      switch (tipoModal.toLowerCase()) {
        case 'diagnostico':
          if (window.ejecutandoDiagnostico) {
            operaciones.push('diagnóstico del sistema')
          }
          break

        case 'configuracion':
        case 'gemini':
          if (window.probandoConexionIA) {
            operaciones.push('prueba de conexión IA')
          }
          break
      }

    } catch (error) {
      console.warn('Error detectando operaciones críticas:', error)
    }

    return operaciones
  }

  // 💾 VERIFICAR DATOS NO GUARDADOS
  async verificarDatosNoGuardados(tipoModal) {
    const resultado = {
      hayDatos: false,
      detalles: []
    }

    try {
      const componente = this.componentesRegistrados.get(tipoModal.toLowerCase())

      if (componente && componente.metodos.tieneCambiosSinGuardar) {
        const cambios = await componente.metodos.tieneCambiosSinGuardar()
        if (cambios) {
          resultado.hayDatos = true
          resultado.detalles.push('Configuraciones modificadas')
        }
      }

      // Verificar formularios con datos
      const formularios = typeof document !== 'undefined' ?
        document.querySelectorAll(`[data-modal="${tipoModal}"] form input, [data-modal="${tipoModal}"] form textarea`) : []
      let camposConDatos = 0
      formularios.forEach(campo => {
        if (campo.value && campo.value.trim() !== '') {
          camposConDatos++
        }
      })

      if (camposConDatos > 0) {
        resultado.hayDatos = true
        resultado.detalles.push(`${camposConDatos} campos con datos`)
      }

    } catch (error) {
      console.warn('Error verificando datos no guardados:', error)
    }

    return resultado
  }

  // 🔗 VERIFICAR DEPENDENCIAS DE MODALES
  async verificarDependenciasModales(tipoModal) {
    const dependencias = []

    try {
      // Mapeo de dependencias entre modales
      const mapaDepedencias = {
        'diagnostico': ['detalle', 'ayuda'],
        'configuracion': ['ayuda'],
        'filtros': ['detalle']
      }

      const deps = mapaDepedencias[tipoModal.toLowerCase()] || []

      for (const dep of deps) {
        const componente = this.componentesRegistrados.get(dep)
        if (componente && componente.metodos.estaAbierto) {
          const abierto = await componente.metodos.estaAbierto()
          if (abierto) {
            dependencias.push(dep)
          }
        }
      }

    } catch (error) {
      console.warn('Error verificando dependencias:', error)
    }

    return dependencias
  }

  // 🏥 CERRAR MODAL DE DIAGNÓSTICO
  async cerrarDiagnostico(parametros = {}) {
    try {
      console.log('🏥 Cerrando modal de diagnóstico...')

      // Intentar usar componente registrado
      const diagnostico = this.componentesRegistrados.get('diagnostico')
      if (diagnostico && diagnostico.metodos.cerrar) {
        const resultado = await diagnostico.metodos.cerrar(parametros)
        if (resultado && resultado.exito) {
          this.modalesActivos.delete('diagnostico')
          this.mostrarNotificacion('success', '✅ Diagnóstico cerrado correctamente', 'top')
          return {
            exito: true,
            mensaje: 'Diagnóstico cerrado via componente',
            accionEjecutada: 'cerrar_diagnostico'
          }
        }
      }

      // Fallback: Emitir evento global
      window.dispatchEvent(new CustomEvent('santoro-cerrar-diagnostico', {
        detail: parametros
      }))

      this.modalesActivos.delete('diagnostico')
      this.mostrarNotificacion('success', '🏥 Diagnóstico cerrado', 'top')

      return {
        exito: true,
        mensaje: 'Diagnóstico cerrado via evento',
        accionEjecutada: 'cerrar_diagnostico'
      }

    } catch (error) {
      console.error('Error cerrando diagnóstico:', error)
      return {
        exito: false,
        mensaje: `Error cerrando diagnóstico: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🤖 CERRAR CONFIGURACIÓN DE GEMINI AI
  async cerrarConfiguracionGemini(parametros = {}) {
    try {
      console.log('🤖 Cerrando configuración de Gemini AI...')

      const config = this.componentesRegistrados.get('configuracion-gemini')
      if (config && config.metodos.cerrar) {
        const resultado = await config.metodos.cerrar(parametros)
        if (resultado && resultado.exito) {
          this.modalesActivos.delete('configuracion-gemini')
          this.mostrarNotificacion('success', '✅ Configuración cerrada', 'top')
          return {
            exito: true,
            mensaje: 'Configuración de IA cerrada via componente',
            accionEjecutada: 'cerrar_configuracion_gemini'
          }
        }
      }

      // Fallback: Emitir evento global
      window.dispatchEvent(new CustomEvent('santoro-cerrar-configuracion-gemini', {
        detail: parametros
      }))

      this.modalesActivos.delete('configuracion-gemini')
      this.mostrarNotificacion('success', '🤖 Configuración de IA cerrada', 'top')

      return {
        exito: true,
        mensaje: 'Configuración de IA cerrada via evento',
        accionEjecutada: 'cerrar_configuracion_gemini'
      }

    } catch (error) {
      console.error('Error cerrando configuración de Gemini:', error)
      return {
        exito: false,
        mensaje: `Error cerrando configuración de IA: ${error.message}`,
        error: error.message
      }
    }
  }

  // 💡 CERRAR AYUDA
  async cerrarAyuda(parametros = {}) {
    try {
      window.dispatchEvent(new CustomEvent('santoro-cerrar-ayuda', {
        detail: parametros
      }))

      this.modalesActivos.delete('ayuda')
      this.mostrarNotificacion('success', '💡 Ayuda cerrada', 'top')

      return {
        exito: true,
        mensaje: 'Ayuda cerrada',
        accionEjecutada: 'cerrar_ayuda'
      }

    } catch (error) {
      console.error('Error cerrando ayuda:', error)
      return {
        exito: false,
        mensaje: `Error cerrando ayuda: ${error.message}`,
        error: error.message
      }
    }
  }

  // 📂 CERRAR DETALLE
  async cerrarDetalle(parametros = {}) {
    try {
      window.dispatchEvent(new CustomEvent('santoro-cerrar-detalle', {
        detail: parametros
      }))

      this.modalesActivos.delete('detalle')
      this.mostrarNotificacion('success', '📂 Detalle cerrado', 'top')

      return {
        exito: true,
        mensaje: 'Detalle cerrado',
        accionEjecutada: 'cerrar_detalle'
      }

    } catch (error) {
      console.error('Error cerrando detalle:', error)
      return {
        exito: false,
        mensaje: `Error cerrando detalle: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🔍 CERRAR FILTROS
  async cerrarFiltros(parametros = {}) {
    try {
      const filtros = this.componentesRegistrados.get('filtros')
      if (filtros && filtros.metodos.cerrar) {
        const resultado = await filtros.metodos.cerrar(parametros)
        if (resultado && resultado.exito) {
          this.modalesActivos.delete('filtros')
          this.mostrarNotificacion('success', '✅ Filtros cerrados', 'top')
          return {
            exito: true,
            mensaje: 'Filtros cerrados via componente',
            accionEjecutada: 'cerrar_filtros'
          }
        }
      }

      window.dispatchEvent(new CustomEvent('santoro-cerrar-filtros', {
        detail: parametros
      }))

      this.modalesActivos.delete('filtros')
      this.mostrarNotificacion('success', '🔍 Filtros cerrados', 'top')

      return {
        exito: true,
        mensaje: 'Filtros cerrados',
        accionEjecutada: 'cerrar_filtros'
      }

    } catch (error) {
      console.error('Error cerrando filtros:', error)
      return {
        exito: false,
        mensaje: `Error cerrando filtros: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🎯 CERRAR MODAL GENÉRICO
  async cerrarModalGenerico(tipo, parametros = {}) {
    try {
      window.dispatchEvent(new CustomEvent(`santoro-cerrar-${tipo}`, {
        detail: parametros
      }))

      this.modalesActivos.delete(tipo)
      this.mostrarNotificacion('success', `${tipo} cerrado`, 'top')

      return {
        exito: true,
        mensaje: `${tipo} cerrado`,
        accionEjecutada: `cerrar_${tipo}`
      }

    } catch (error) {
      console.error(`Error cerrando ${tipo}:`, error)
      return {
        exito: false,
        mensaje: `Error cerrando ${tipo}: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🚪 CERRAR TODOS LOS MODALES (función de emergencia)
  async cerrarTodosLosModales(parametros = {}) {
    console.log('🚪 Cerrando todos los modales...')

    const resultados = []
    const modalesAbiertos = Array.from(this.modalesActivos.keys())

    if (modalesAbiertos.length === 0) {
      return {
        exito: true,
        mensaje: 'No hay modales abiertos',
        accionEjecutada: 'cerrar_todos_modales'
      }
    }

    for (const modal of modalesAbiertos) {
      try {
        const resultado = await this.cerrarModal(modal, {
          ...parametros,
          forzar: true,
          confirmado: true
        })
        resultados.push({ modal, resultado })
      } catch (error) {
        console.error(`Error cerrando modal ${modal}:`, error)
        resultados.push({ modal, error: error.message })
      }
    }

    const exitosos = resultados.filter(r => r.resultado?.exito).length
    const fallidos = resultados.length - exitosos

    this.mostrarNotificacion(
      fallidos === 0 ? 'success' : 'warning',
      `🚪 Cerrados ${exitosos}/${resultados.length} modales`,
      'top'
    )

    return {
      exito: fallidos === 0,
      mensaje: `Cerrados ${exitosos} de ${resultados.length} modales`,
      accionEjecutada: 'cerrar_todos_modales',
      detalles: resultados
    }
  }

  // 📊 OBTENER ESTADO DE MODALES
  obtenerEstadoModales() {
    return {
      activos: Array.from(this.modalesActivos.keys()),
      registrados: Array.from(this.componentesRegistrados.keys()),
      cantidad: this.modalesActivos.size
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🛠️ FUNCIONES AVANZADAS DE CONTROL Y UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════

  // 🎯 CONTROLAR MODAL ESPECÍFICO (abrir/cerrar inteligente)
  async controlarModal(accion, tipoModal, parametros = {}) {
    console.log(`🎯 Controlando modal: ${accion} ${tipoModal}`, parametros)

    try {
      switch (accion.toLowerCase()) {
        case 'abrir':
        case 'mostrar':
        case 'activar':
          return await this.abrirModalEspecifico(tipoModal, parametros)

        case 'cerrar':
        case 'ocultar':
        case 'desactivar':
          return await this.cerrarModal(tipoModal, parametros)

        case 'alternar':
        case 'toggle':
          return await this.alternarModal(tipoModal, parametros)

        case 'estado':
        case 'verificar':
          return this.verificarEstadoModal(tipoModal)

        default:
          return {
            exito: false,
            mensaje: `Acción no reconocida: ${accion}`,
            accionesDisponibles: ['abrir', 'cerrar', 'alternar', 'estado']
          }
      }
    } catch (error) {
      console.error('Error controlando modal:', error)
      return {
        exito: false,
        mensaje: `Error ejecutando ${accion} en ${tipoModal}: ${error.message}`,
        error: error.message
      }
    }
  }

  // 🔄 ALTERNAR MODAL (abrir si está cerrado, cerrar si está abierto)
  async alternarModal(tipoModal, parametros = {}) {
    console.log('🔄 Alternando modal:', tipoModal)

    const estaAbierto = this.modalesActivos.has(tipoModal.toLowerCase())

    if (estaAbierto) {
      return await this.cerrarModal(tipoModal, parametros)
    } else {
      return await this.abrirModalEspecifico(tipoModal, parametros)
    }
  }

  // 🔍 VERIFICAR ESTADO DE MODAL ESPECÍFICO
  verificarEstadoModal(tipoModal) {
    const tipo = tipoModal.toLowerCase()
    const estaAbierto = this.modalesActivos.has(tipo)
    const modalData = this.modalesActivos.get(tipo)

    return {
      exito: true,
      modal: tipo,
      abierto: estaAbierto,
      desde: modalData?.abierto || null,
      parametros: modalData?.parametros || null,
      operacionesCriticas: modalData?.operacionesCriticas || [],
      tieneOperacionesCriticas: (modalData?.operacionesCriticas || []).length > 0
    }
  }

  // 🚀 ABRIR MODAL ESPECÍFICO (router inteligente)
  async abrirModalEspecifico(tipoModal, parametros = {}) {
    switch (tipoModal.toLowerCase()) {
      case 'diagnostico':
        return await this.abrirDiagnostico(parametros)

      case 'configuracion':
      case 'gemini':
      case 'configuracion-gemini':
        return await this.abrirConfiguracionGemini(parametros)

      case 'ayuda':
        return await this.abrirAyuda(parametros)

      case 'detalle':
      case 'detalles':
        return await this.abrirDetalle(parametros)

      case 'filtros':
      case 'filtros-avanzados':
        return await this.abrirFiltros(parametros)

      default:
        return await this.abrirModalGenerico(tipoModal, parametros)
    }
  }

  // 📝 REGISTRO DE OPERACIONES CRÍTICAS
  registrarOperacionCritica(tipoOperacion, modalAfectado, estado = 'iniciada') {
    console.log(`📝 Registrando operación crítica: ${tipoOperacion} en ${modalAfectado} - ${estado}`)

    // Emitir evento para el sistema de seguimiento
    window.dispatchEvent(new CustomEvent('santoro-operacion-critica', {
      detail: {
        tipo: tipoOperacion,
        modal: modalAfectado,
        estado: estado,
        timestamp: new Date()
      }
    }))

    // Registrar en operaciones en curso
    const clave = `${modalAfectado}_${tipoOperacion}`
    if (estado === 'iniciada') {
      this.operacionesEnCurso.set(clave, {
        tipo: tipoOperacion,
        modal: modalAfectado,
        inicio: new Date()
      })
    } else if (estado === 'finalizada') {
      this.operacionesEnCurso.delete(clave)
    }
  }

  // 🧹 LIMPIAR ESTADO (función de mantenimiento)
  limpiarEstado() {
    console.log('🧹 Limpiando estado del controlador de modales...')

    // Limpiar modales obsoletos (abiertos hace más de 1 hora)
    const hace1Hora = new Date(Date.now() - 60 * 60 * 1000)
    const modalesObsoletos = []

    for (const [tipo, data] of this.modalesActivos.entries()) {
      if (data.abierto < hace1Hora) {
        modalesObsoletos.push(tipo)
      }
    }

    modalesObsoletos.forEach(tipo => {
      this.modalesActivos.delete(tipo)
      console.log(`🗑️ Modal obsoleto removido: ${tipo}`)
    })

    // Limpiar historial (mantener solo últimas 50 entradas)
    if (this.historialModales.length > 50) {
      this.historialModales = this.historialModales.slice(-50)
    }

    // Limpiar operaciones en curso obsoletas
    const operacionesObsoletas = []
    for (const [clave, operacion] of this.operacionesEnCurso.entries()) {
      if (operacion.inicio < hace1Hora) {
        operacionesObsoletas.push(clave)
      }
    }

    operacionesObsoletas.forEach(clave => {
      this.operacionesEnCurso.delete(clave)
    })

    return {
      exito: true,
      mensaje: 'Estado limpiado correctamente',
      eliminados: {
        modales: modalesObsoletos.length,
        operaciones: operacionesObsoletas.length,
        historialRecortado: this.historialModales.length === 50
      }
    }
  }

  // 📊 OBTENER ESTADÍSTICAS COMPLETAS
  obtenerEstadisticas() {
    const ahora = new Date()
    const hace24h = new Date(ahora - 24 * 60 * 60 * 1000)

    // Estadísticas del historial
    const historialReciente = this.historialModales.filter(h => h.timestamp > hace24h)
    const aperturas = historialReciente.filter(h => h.accion === 'abrir').length
    const cierres = historialReciente.filter(h => h.accion === 'cerrar').length

    // Modales más utilizados
    const conteoTipos = {}
    historialReciente.forEach(h => {
      conteoTipos[h.tipo] = (conteoTipos[h.tipo] || 0) + 1
    })

    const tiposMasUsados = Object.entries(conteoTipos)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      estado: {
        modalesActivos: this.modalesActivos.size,
        componentesRegistrados: this.componentesRegistrados.size,
        operacionesEnCurso: this.operacionesEnCurso.size
      },
      actividad24h: {
        aperturas,
        cierres,
        totalEventos: historialReciente.length
      },
      modalesMasUsados: tiposMasUsados.map(([tipo, count]) => ({ tipo, usos: count })),
      tiempoPromedio: this.calcularTiempoPromedioModales(),
      salud: {
        operacionesObsoletas: Array.from(this.operacionesEnCurso.values())
          .filter(op => op.inicio < hace24h).length,
        modalesZombi: Array.from(this.modalesActivos.values())
          .filter(modal => modal.abierto < hace24h).length
      }
    }
  }

  // ⏱️ CALCULAR TIEMPO PROMEDIO DE MODALES
  calcularTiempoPromedioModales() {
    const pares = []
    const historialOrdenado = [...this.historialModales].sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 0; i < historialOrdenado.length - 1; i++) {
      const actual = historialOrdenado[i]
      const siguiente = historialOrdenado[i + 1]

      if (actual.accion === 'abrir' && siguiente.accion === 'cerrar' && actual.tipo === siguiente.tipo) {
        const duracion = siguiente.timestamp - actual.timestamp
        pares.push({ tipo: actual.tipo, duracion })
      }
    }

    if (pares.length === 0) return null

    const promedioPorTipo = {}
    pares.forEach(par => {
      if (!promedioPorTipo[par.tipo]) {
        promedioPorTipo[par.tipo] = []
      }
      promedioPorTipo[par.tipo].push(par.duracion)
    })

    Object.keys(promedioPorTipo).forEach(tipo => {
      const duraciones = promedioPorTipo[tipo]
      const promedio = duraciones.reduce((a, b) => a + b, 0) / duraciones.length
      promedioPorTipo[tipo] = Math.round(promedio / 1000) // en segundos
    })

    return promedioPorTipo
  }

  // 🎛️ CONFIGURAR SISTEMA
  configurarSistema(nuevaConfiguracion = {}) {
    this.configuracionSeguridad = {
      ...this.configuracionSeguridad,
      ...nuevaConfiguracion
    }

    console.log('🎛️ Configuración actualizada:', this.configuracionSeguridad)

    return {
      exito: true,
      mensaje: 'Configuración actualizada',
      configuracion: this.configuracionSeguridad
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// � SISTEMA DE CONTEXTO GLOBAL EN TIEMPO REAL
// Mantiene al asistente siempre actualizado del estado del usuario
// ═══════════════════════════════════════════════════════════════════════════════

class SantoroContextManager {
  constructor() {
    // �🎯 Estado del contexto actual
    this.contextoActual = {
      // 📱 Información de navegación
      paginaActual: 'dashboard',
      rutaCompleta: window.location.pathname || '/',
      parametrosURL: new URLSearchParams(window.location.search),
      hashURL: window.location.hash,

      // 🖥️ Estado de vista
      tipoVista: 'desktop', // desktop, mobile, tablet
      dimensionesPantalla: {
        ancho: window.innerWidth,
        alto: window.innerHeight
      },

      // 🎭 Modales y componentes activos
      modalesAbiertos: new Set(),
      componentesVisibles: new Set(),
      dialogosActivos: new Set(),

      // 🔍 Filtros y búsquedas activas
      filtrosAplicados: new Map(),
      busquedaActiva: null,
      ordenamientoActivo: null,
      paginacionActual: { pagina: 1, total: 0, porPagina: 20 },

      // 📊 Datos y estado
      datosEnPantalla: null,
      operacionesEnCurso: new Set(),
      erroresRecientes: [],
      notificacionesActivas: [],

      // 👤 Estado del usuario
      permisos: new Set(),
      preferenciasUsuario: {},
      sesionActiva: true,
      ultimaActividad: new Date(),

      // 🎮 Interacciones recientes
      ultimasAcciones: [],
      historialNavegacion: [],
      elementosFocalizados: [],

      // ⚡ Rendimiento y conexión
      estadoConexion: navigator.onLine ? 'online' : 'offline',
      rendimiento: { fps: 60, memoria: 0 },

      // 🤖 Estado del asistente
      asistenteDiponible: true,
      vocesDisponibles: false,
      configuracionIA: null
    }

    // 🔄 Sistema de actualización automática
    this.observadores = new Map()
    this.intervalos = new Map()
    this.ultimaActualizacion = new Date()

    // 🚀 Inicializar sistema
    this.inicializarContexto()
  }

  // 🚀 INICIALIZAR SISTEMA DE CONTEXTO
  inicializarContexto() {
    console.log('🌐 Inicializando Sistema de Contexto Global...')

    // 1. Detectar estado inicial
    this.detectarEstadoInicial()

    // 2. Configurar observadores
    this.configurarObservadores()

    // 3. Iniciar monitoreo
    this.iniciarMonitoreoAutomatico()

    // 4. Configurar listeners de eventos
    this.configurarListeners()

    console.log('✅ Sistema de Contexto inicializado:', this.obtenerResumenContexto())
  }

  // 🔍 DETECTAR ESTADO INICIAL
  detectarEstadoInicial() {
    try {
      // Detectar página actual
      this.actualizarPaginaActual()

      // Detectar tipo de vista
      this.actualizarTipoVista()

      // Detectar modales abiertos
      this.detectarModalesAbiertos()

      // Detectar filtros aplicados
      this.detectarFiltrosAplicados()

      // Detectar permisos
      this.detectarPermisos()

      // Detectar estado de componentes
      this.detectarComponentesVisibles()

    } catch (error) {
      console.error('Error detectando estado inicial:', error)
    }
  }

  // 📱 ACTUALIZAR PÁGINA ACTUAL
  actualizarPaginaActual() {
    const ruta = window.location.pathname
    const hash = window.location.hash

    // Mapear rutas a páginas conocidas
    const mapaRutas = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/logs': 'logs',
      '/eventos': 'eventos',
      '/estadisticas': 'estadisticas',
      '/diagnostico': 'diagnostico',
      '/escritorio': 'escritorio',
      '/mobile': 'mobile'
    }

    this.contextoActual.paginaActual = mapaRutas[ruta] || 'desconocida'
    this.contextoActual.rutaCompleta = ruta
    this.contextoActual.hashURL = hash
    this.contextoActual.parametrosURL = new URLSearchParams(window.location.search)

    // Detectar sub-secciones por hash
    if (hash.includes('escritorio')) {
      this.contextoActual.paginaActual = 'escritorio'
    } else if (hash.includes('mobile')) {
      this.contextoActual.paginaActual = 'mobile'
    }
  }

  // 🖥️ ACTUALIZAR TIPO DE VISTA
  actualizarTipoVista() {
    const ancho = window.innerWidth

    if (ancho < 768) {
      this.contextoActual.tipoVista = 'mobile'
    } else if (ancho < 1024) {
      this.contextoActual.tipoVista = 'tablet'
    } else {
      this.contextoActual.tipoVista = 'desktop'
    }

    this.contextoActual.dimensionesPantalla = {
      ancho: window.innerWidth,
      alto: window.innerHeight
    }
  }

  // 🎭 DETECTAR MODALES ABIERTOS
  detectarModalesAbiertos() {
    this.contextoActual.modalesAbiertos.clear()

    // Buscar elementos de modales visibles
    const selectoresModales = [
      '.q-dialog[aria-hidden="false"]',
      '.modal.show',
      '.q-card.modal-active',
      '[data-modal-visible="true"]',
      '.santoro-modal.active'
    ]

    selectoresModales.forEach(selector => {
      try {
        const elementos = typeof document !== 'undefined' ? document.querySelectorAll(selector) : []
        elementos.forEach(elemento => {
          const tipo = elemento.getAttribute('data-modal-type') ||
            elemento.classList[0] ||
            'modal-generico'
          this.contextoActual.modalesAbiertos.add(tipo)
        })
      } catch (error) {
        console.warn('SantoroContextManager: Error detectando modales con selector:', selector, error)
      }
    })

    // Integrar con SantoroModalController
    if (window.santoroModalController) {
      const estadoModales = window.santoroModalController.obtenerEstadoModales()
      estadoModales.activos.forEach(modal => {
        this.contextoActual.modalesAbiertos.add(modal)
      })
    }
  }

  // 🔍 DETECTAR FILTROS APLICADOS
  detectarFiltrosAplicados() {
    this.contextoActual.filtrosAplicados.clear()

    try {
      // Buscar en formularios de filtros
      const filtros = typeof document !== 'undefined' ?
        document.querySelectorAll('[data-filtro], .filtro-activo, .q-field input, .q-select') : []

      filtros.forEach(filtro => {
        const nombre = filtro.getAttribute('data-filtro') ||
          filtro.getAttribute('name') ||
          filtro.id
        const valor = filtro.value || filtro.textContent

        if (nombre && valor && valor.trim() !== '') {
          this.contextoActual.filtrosAplicados.set(nombre, valor)
        }
      })

      // Buscar en store de filtros (si existe)
      if (window.filtroFechasStore) {
        const storeFiltros = window.filtroFechasStore.obtenerFiltros?.()
        if (storeFiltros) {
          Object.entries(storeFiltros).forEach(([key, value]) => {
            if (value) {
              this.contextoActual.filtrosAplicados.set(key, value)
            }
          })
        }
      }

    } catch (error) {
      console.warn('Error detectando filtros:', error)
    }
  }

  // 👤 DETECTAR PERMISOS
  detectarPermisos() {
    this.contextoActual.permisos.clear()

    // Detectar por elementos visibles
    const elementosConPermisos = typeof document !== 'undefined' ?
      document.querySelectorAll('[data-permiso], .permiso-activo') : []
    elementosConPermisos.forEach(elemento => {
      const permiso = elemento.getAttribute('data-permiso')
      if (permiso) {
        this.contextoActual.permisos.add(permiso)
      }
    })

    // Permisos básicos siempre disponibles
    this.contextoActual.permisos.add('ver_dashboard')
    this.contextoActual.permisos.add('usar_asistente')
  }

  // 🎯 DETECTAR COMPONENTES VISIBLES
  detectarComponentesVisibles() {
    this.contextoActual.componentesVisibles.clear()

    const componentesConocidos = [
      'escritorio-consola',
      'diagnostico',
      'log-table',
      'estadisticas',
      'filtros',
      'ayuda',
      'configuracion'
    ]

    componentesConocidos.forEach(componente => {
      try {
        const elemento = typeof document !== 'undefined' ?
          document.querySelector(`[data-component="${componente}"], .${componente}`) : null
        if (elemento && this.esVisible(elemento)) {
          this.contextoActual.componentesVisibles.add(componente)
        }
      } catch (error) {
        console.warn('SantoroContextManager: Error detectando componente:', componente, error)
      }
    })
  }

  // 👁️ VERIFICAR SI ELEMENTO ES VISIBLE
  esVisible(elemento) {
    if (!elemento) return false

    const estilo = window.getComputedStyle(elemento)
    return estilo.display !== 'none' &&
      estilo.visibility !== 'hidden' &&
      estilo.opacity !== '0' &&
      elemento.offsetWidth > 0 &&
      elemento.offsetHeight > 0
  }

  // 🔄 CONFIGURAR OBSERVADORES
  configurarObservadores() {
    // Observer para cambios en el DOM
    this.observadores.set('dom', new MutationObserver((mutations) => {
      let hayModales = false
      let hayFiltros = false

      mutations.forEach(mutation => {
        // Detectar cambios en modales
        if (mutation.target.classList?.contains('q-dialog') ||
          mutation.target.getAttribute?.('data-modal-type')) {
          hayModales = true
        }

        // Detectar cambios en filtros
        if (mutation.target.classList?.contains('filtro') ||
          mutation.target.getAttribute?.('data-filtro')) {
          hayFiltros = true
        }
      })

      if (hayModales) this.detectarModalesAbiertos()
      if (hayFiltros) this.detectarFiltrosAplicados()
    }))

    // Iniciar observación con validación
    try {
      if (typeof document !== 'undefined' && document.body) {
        this.observadores.get('dom').observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'data-modal-type', 'data-filtro', 'aria-hidden']
        })
      }
    } catch (error) {
      console.warn('SantoroContextManager: Error configurando observer DOM:', error)
    }

    // Observer para cambios de tamaño con validación
    try {
      this.observadores.set('resize', new ResizeObserver(() => {
        this.actualizarTipoVista()
      }))

      if (typeof document !== 'undefined' && document.documentElement) {
        this.observadores.get('resize').observe(document.documentElement)
      }
    } catch (error) {
      console.warn('SantoroContextManager: Error configurando resize observer:', error)
    }
  }

  // 🎧 CONFIGURAR LISTENERS
  configurarListeners() {
    // Cambios de ruta
    window.addEventListener('popstate', () => {
      this.actualizarPaginaActual()
      this.registrarAccion('navegacion', 'cambio_ruta')
    })

    // Cambios de hash
    window.addEventListener('hashchange', () => {
      this.actualizarPaginaActual()
      this.registrarAccion('navegacion', 'cambio_hash')
    })

    // Estado de conexión
    window.addEventListener('online', () => {
      this.contextoActual.estadoConexion = 'online'
    })

    window.addEventListener('offline', () => {
      this.contextoActual.estadoConexion = 'offline'
    })

    // Actividad del usuario (solo si document está disponible)
    if (typeof document !== 'undefined' && document.addEventListener) {
      ['click', 'keypress', 'scroll', 'mousemove'].forEach(evento => {
        try {
          document.addEventListener(evento, () => {
            this.contextoActual.ultimaActividad = new Date()
          }, { passive: true })
        } catch (error) {
          console.warn(`No se pudo agregar listener para ${evento}:`, error)
        }
      })
    }

    // Eventos personalizados del sistema
    window.addEventListener('santoro-filtro-aplicado', (event) => {
      const { filtro, valor } = event.detail || {}
      if (filtro) {
        this.contextoActual.filtrosAplicados.set(filtro, valor)
        this.registrarAccion('filtro', 'aplicado', { filtro, valor })
      }
    })

    window.addEventListener('santoro-pagina-cambiada', (event) => {
      const { pagina } = event.detail || {}
      if (pagina) {
        this.contextoActual.paginaActual = pagina
        this.registrarAccion('navegacion', 'cambio_pagina', { pagina })
      }
    })
  }

  // ⏰ INICIAR MONITOREO AUTOMÁTICO
  iniciarMonitoreoAutomatico() {
    // Actualización cada 5 segundos
    this.intervalos.set('principal', setInterval(() => {
      this.actualizarContextoCompleto()
    }, 5000))

    // Actualización rápida cada segundo
    this.intervalos.set('rapido', setInterval(() => {
      this.actualizarContextoRapido()
    }, 1000))
  }

  // 🔄 ACTUALIZAR CONTEXTO COMPLETO
  actualizarContextoCompleto() {
    try {
      this.detectarEstadoInicial()
      this.ultimaActualizacion = new Date()
    } catch (error) {
      console.error('Error actualizando contexto completo:', error)
    }
  }

  // ⚡ ACTUALIZAR CONTEXTO RÁPIDO
  actualizarContextoRapido() {
    try {
      // Solo elementos que cambian frecuentemente
      this.contextoActual.ultimaActividad = new Date()

      // Limpiar acciones antiguas (mantener solo últimas 10)
      if (this.contextoActual.ultimasAcciones.length > 10) {
        this.contextoActual.ultimasAcciones = this.contextoActual.ultimasAcciones.slice(-10)
      }

    } catch (error) {
      console.warn('Error en actualización rápida:', error)
    }
  }

  // 📝 REGISTRAR ACCIÓN
  registrarAccion(categoria, accion, detalles = {}) {
    this.contextoActual.ultimasAcciones.push({
      categoria,
      accion,
      detalles,
      timestamp: new Date()
    })
  }

  // 🎯 OBTENER CONTEXTO ACTUAL COMPLETO
  obtenerContextoCompleto() {
    return {
      ...this.contextoActual,
      ultimaActualizacion: this.ultimaActualizacion,
      sistemaActivo: true
    }
  }

  // 📊 OBTENER RESUMEN DEL CONTEXTO
  obtenerResumenContexto() {
    return {
      pagina: this.contextoActual.paginaActual,
      vista: this.contextoActual.tipoVista,
      modalesAbiertos: Array.from(this.contextoActual.modalesAbiertos),
      filtrosActivos: Object.fromEntries(this.contextoActual.filtrosAplicados),
      componentesVisibles: Array.from(this.contextoActual.componentesVisibles),
      ultimaActividad: this.contextoActual.ultimaActividad,
      conexion: this.contextoActual.estadoConexion
    }
  }

  // 🔍 OBTENER CONTEXTO PARA ASISTENTE
  obtenerContextoParaAsistente() {
    const contexto = this.obtenerResumenContexto()

    // Generar descripción legible para el asistente
    const descripcion = []

    descripcion.push(`El usuario está actualmente en la página "${contexto.pagina}"`)
    descripcion.push(`usando vista ${contexto.vista}`)

    if (contexto.modalesAbiertos.length > 0) {
      descripcion.push(`con los siguientes modales abiertos: ${contexto.modalesAbiertos.join(', ')}`)
    } else {
      descripcion.push('sin modales abiertos')
    }

    if (Object.keys(contexto.filtrosActivos).length > 0) {
      const filtros = Object.entries(contexto.filtrosActivos)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      descripcion.push(`con los siguientes filtros aplicados: ${filtros}`)
    } else {
      descripcion.push('sin filtros aplicados')
    }

    if (contexto.componentesVisibles.length > 0) {
      descripcion.push(`Los componentes visibles son: ${contexto.componentesVisibles.join(', ')}`)
    }

    return {
      resumen: descripcion.join(' '),
      contextoDetallado: contexto,
      timestamp: new Date()
    }
  }

  // 🧹 LIMPIAR RECURSOS
  destruir() {
    // Detener observadores
    this.observadores.forEach(observer => observer.disconnect())
    this.observadores.clear()

    // Limpiar intervalos
    this.intervalos.forEach(interval => clearInterval(interval))
    this.intervalos.clear()

    console.log('🧹 Sistema de Contexto destruido')
  }
}

// 🎯 Instancias globales
export const santoroModalController = new SantoroModalController()
export const santoroContextManager = new SantoroContextManager()

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.santoroContextManager = santoroContextManager
  window.santoroModalController = santoroModalController
}

export default santoroModalController
