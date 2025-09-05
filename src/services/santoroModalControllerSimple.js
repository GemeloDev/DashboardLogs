// 🎭 SANTORO MODAL CONTROLLER - Versión simplificada sin useQuasar
// Control completo de modales y diálogos

class SantoroModalController {
    constructor() {
        this.modalesActivos = new Map()
        this.componentesRegistrados = new Map()
        this.notificationCallback = null
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
            // Intentar usar componente registrado
            const diagnostico = this.componentesRegistrados.get('diagnostico')
            if (diagnostico && diagnostico.metodos.abrir) {
                diagnostico.metodos.abrir(parametros)
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
}

// 🎯 Instancia global
export const santoroModalController = new SantoroModalController()
export default santoroModalController
