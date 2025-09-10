/**
 * SantoroContextMaster
 * Controlador maestro para el asistente IA con detección precisa de contexto
 * y control total sobre todos los módulos, filtros y flujos
 */

export class SantoroContextMaster {
    constructor() {
        this.contextoActual = {
            flujo: null, // 'escritorio' | 'movil'
            modulo: null, // 'dashboard' | 'eventos' | 'estadisticas' | 'diagnostico'
            vista: null, // 'desktop' | 'tablet' | 'mobile'
            componentes: {
                filtroFechas: null,
                graficas: null,
                consola: null,
                diagnostico: null
            },
            modalesAbiertos: [],
            filtrosAplicados: {},
            ultimaAccion: null
        }

        this.detectores = {
            flujo: null,
            vista: null,
            modulo: null
        }

        this.inicializarDetectores()
    }

    // ========== DETECCIÓN DE CONTEXTO ==========

    inicializarDetectores() {
        // Detector de vista (responsive)
        this.detectores.vista = () => {
            if (typeof window === 'undefined') return 'desktop'

            const width = window.innerWidth
            if (width <= 768) return 'mobile'
            if (width <= 1024) return 'tablet'
            return 'desktop'
        }

        // Detector de flujo (escritorio vs móvil)
        this.detectores.flujo = () => {
            // Buscar elementos específicos del flujo de escritorio
            const elementosEscritorio = [
                '[data-flujo="escritorio"]',
                '.flujo-escritorio',
                '.escritorio-container',
                '.dashboard-escritorio'
            ]

            // Buscar elementos específicos del flujo móvil
            const elementosMovil = [
                '[data-flujo="movil"]',
                '.flujo-movil',
                '.mobile-container',
                '.dashboard-movil'
            ]

            for (const selector of elementosEscritorio) {
                const elemento = document.querySelector(selector)
                if (elemento && this.esVisible(elemento)) {
                    return 'escritorio'
                }
            }

            for (const selector of elementosMovil) {
                const elemento = document.querySelector(selector)
                if (elemento && this.esVisible(elemento)) {
                    return 'movil'
                }
            }

            // Fallback basado en la URL o elementos específicos
            const url = window.location.href
            if (url.includes('escritorio') || url.includes('desktop')) return 'escritorio'
            if (url.includes('movil') || url.includes('mobile')) return 'movil'

            // Fallback basado en el ancho de pantalla
            return this.detectores.vista() === 'mobile' ? 'movil' : 'escritorio'
        }

        // Detector de módulo actual
        this.detectores.modulo = () => {
            // Buscar por selectores específicos de cada módulo
            const modulos = {
                'diagnostico': [
                    '[data-modulo="diagnostico"]',
                    '.diagnostico-container',
                    '.modal-diagnostico',
                    'div[class*="diagnostico"]'
                ],
                'eventos': [
                    '[data-modulo="eventos"]',
                    '.eventos-container',
                    '.eventos-page',
                    'div[class*="eventos"]'
                ],
                'estadisticas': [
                    '[data-modulo="estadisticas"]',
                    '.estadisticas-container',
                    '.estadisticas-page',
                    'div[class*="estadisticas"]'
                ],
                'dashboard': [
                    '[data-modulo="dashboard"]',
                    '.dashboard-container',
                    '.main-dashboard',
                    'div[class*="dashboard"]'
                ]
            }

            for (const [modulo, selectores] of Object.entries(modulos)) {
                for (const selector of selectores) {
                    const elemento = document.querySelector(selector)
                    if (elemento && this.esVisible(elemento)) {
                        return modulo
                    }
                }
            }

            // Fallback basado en la URL
            const url = window.location.href.toLowerCase()
            if (url.includes('diagnostico')) return 'diagnostico'
            if (url.includes('eventos')) return 'eventos'
            if (url.includes('estadisticas')) return 'estadisticas'

            return 'dashboard'
        }

        // Configurar observador de cambios
        this.configurarObservadores()
    }

    configurarObservadores() {
        if (typeof window === 'undefined') return

        // Observer para cambios en el DOM
        const observer = new MutationObserver(() => {
            this.actualizarContextoCompleto()
        })

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-flujo', 'data-modulo']
            })
        }

        // Observer para cambios de tamaño
        window.addEventListener('resize', () => {
            this.actualizarContextoCompleto()
        })

        // Observer para cambios de URL
        window.addEventListener('popstate', () => {
            this.actualizarContextoCompleto()
        })
    }

    // ========== ACTUALIZACIÓN DE CONTEXTO ==========

    actualizarContextoCompleto() {
        const contextoAnterior = { ...this.contextoActual }

        // Detectar contexto actual
        this.contextoActual = {
            ...this.contextoActual,
            flujo: this.detectores.flujo(),
            modulo: this.detectores.modulo(),
            vista: this.detectores.vista(),
            timestamp: new Date().toISOString()
        }

        // Detectar modales abiertos
        this.detectarModalesAbiertos()

        // Log cambios importantes
        if (contextoAnterior.flujo !== this.contextoActual.flujo) {
            console.log(`🔄 Cambio de flujo: ${contextoAnterior.flujo} → ${this.contextoActual.flujo}`)
        }

        if (contextoAnterior.modulo !== this.contextoActual.modulo) {
            console.log(`📱 Cambio de módulo: ${contextoAnterior.modulo} → ${this.contextoActual.modulo}`)
        }

        return this.contextoActual
    }

    detectarModalesAbiertos() {
        const selectoresModales = [
            '.q-dialog[aria-hidden="false"]',
            '.modal:not(.d-none)',
            '.q-modal--opened',
            '[data-modal]:not([style*="display: none"])'
        ]

        this.contextoActual.modalesAbiertos = []

        selectoresModales.forEach(selector => {
            const modales = document.querySelectorAll(selector)
            modales.forEach(modal => {
                if (this.esVisible(modal)) {
                    const tipo = modal.getAttribute('data-modal-type') ||
                        modal.getAttribute('data-modal') ||
                        modal.className.split(' ').find(c => c.includes('modal')) ||
                        'modal-generico'
                    this.contextoActual.modalesAbiertos.push(tipo)
                }
            })
        })
    }

    // ========== UTILIDADES ==========

    esVisible(elemento) {
        if (!elemento) return false

        const style = window.getComputedStyle(elemento)
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            elemento.offsetParent !== null
    }

    // ========== CONTROL DE COMPONENTES ==========

    conectarComponente(nombre, referencia) {
        this.contextoActual.componentes[nombre] = referencia
        console.log(`🔗 Componente '${nombre}' conectado`)
    }

    obtenerComponente(nombre) {
        return this.contextoActual.componentes[nombre]
    }

    // ========== ACCIONES DEL ASISTENTE ==========

    async ejecutarAccion(accion, parametros = {}) {
        console.log(`🎯 Ejecutando acción: ${accion}`, parametros)

        // Actualizar contexto antes de ejecutar
        this.actualizarContextoCompleto()

        switch (accion) {
            case 'cambiar_a_escritorio':
                return await this.cambiarAEscritorio()

            case 'cambiar_a_movil':
                return await this.cambiarAMovil()

            case 'abrir_diagnostico':
                return await this.abrirDiagnostico()

            case 'aplicar_filtro_fechas':
                return await this.aplicarFiltroFechas(parametros)

            case 'mostrar_errores_ultimo_mes':
                return await this.mostrarErroresUltimoMes()

            case 'abrir_eventos_fallidos':
                return await this.abrirEventosFallidos()

            case 'detectar_contexto':
                return this.obtenerContextoCompleto()

            default:
                return {
                    exito: false,
                    error: `Acción '${accion}' no reconocida`,
                    contexto: this.contextoActual
                }
        }
    }

    async cambiarAEscritorio() {
        const flujoActual = this.contextoActual.flujo

        if (flujoActual === 'escritorio') {
            return {
                exito: true,
                mensaje: 'Ya te encuentras en el flujo de escritorio',
                contexto: this.contextoActual,
                accion_realizada: 'ninguna'
            }
        }

        try {
            // Buscar botón o método para cambiar a escritorio
            const botonesEscritorio = [
                '[data-action="cambiar-escritorio"]',
                '.btn-escritorio',
                '.cambiar-escritorio',
                '[onclick*="escritorio"]'
            ]

            for (const selector of botonesEscritorio) {
                const boton = document.querySelector(selector)
                if (boton && this.esVisible(boton)) {
                    boton.click()

                    // Esperar cambio
                    await new Promise(resolve => setTimeout(resolve, 500))
                    this.actualizarContextoCompleto()

                    return {
                        exito: true,
                        mensaje: 'Cambiado al flujo de escritorio exitosamente',
                        contexto: this.contextoActual,
                        accion_realizada: 'click_boton'
                    }
                }
            }

            // Si no hay botón, intentar cambio programático
            const evento = new CustomEvent('cambiar-flujo', {
                detail: { flujo: 'escritorio' }
            })
            document.dispatchEvent(evento)

            await new Promise(resolve => setTimeout(resolve, 500))
            this.actualizarContextoCompleto()

            return {
                exito: this.contextoActual.flujo === 'escritorio',
                mensaje: this.contextoActual.flujo === 'escritorio'
                    ? 'Cambiado al flujo de escritorio exitosamente'
                    : 'No se pudo cambiar al flujo de escritorio automáticamente',
                contexto: this.contextoActual,
                accion_realizada: 'evento_personalizado'
            }

        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al cambiar al flujo de escritorio',
                contexto: this.contextoActual
            }
        }
    }

    async cambiarAMovil() {
        const flujoActual = this.contextoActual.flujo

        if (flujoActual === 'movil') {
            return {
                exito: true,
                mensaje: 'Ya te encuentras en el flujo móvil',
                contexto: this.contextoActual,
                accion_realizada: 'ninguna'
            }
        }

        try {
            // Buscar botón o método para cambiar a móvil
            const botonesMovil = [
                '[data-action="cambiar-movil"]',
                '.btn-movil',
                '.cambiar-movil',
                '[onclick*="movil"]'
            ]

            for (const selector of botonesMovil) {
                const boton = document.querySelector(selector)
                if (boton && this.esVisible(boton)) {
                    boton.click()

                    await new Promise(resolve => setTimeout(resolve, 500))
                    this.actualizarContextoCompleto()

                    return {
                        exito: true,
                        mensaje: 'Cambiado al flujo móvil exitosamente',
                        contexto: this.contextoActual,
                        accion_realizada: 'click_boton'
                    }
                }
            }

            // Evento personalizado
            const evento = new CustomEvent('cambiar-flujo', {
                detail: { flujo: 'movil' }
            })
            document.dispatchEvent(evento)

            await new Promise(resolve => setTimeout(resolve, 500))
            this.actualizarContextoCompleto()

            return {
                exito: this.contextoActual.flujo === 'movil',
                mensaje: this.contextoActual.flujo === 'movil'
                    ? 'Cambiado al flujo móvil exitosamente'
                    : 'No se pudo cambiar al flujo móvil automáticamente',
                contexto: this.contextoActual,
                accion_realizada: 'evento_personalizado'
            }

        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al cambiar al flujo móvil',
                contexto: this.contextoActual
            }
        }
    }

    async abrirDiagnostico() {
        try {
            this.actualizarContextoCompleto()

            // Selectores para abrir diagnóstico según el flujo
            const selectores = this.contextoActual.flujo === 'movil'
                ? [
                    '[data-action="abrir-diagnostico-movil"]',
                    '.btn-diagnostico-mobile',
                    '.nav-diagnostico',
                    '[href*="diagnostico"]'
                ]
                : [
                    '[data-action="abrir-diagnostico"]',
                    '.btn-diagnostico',
                    '.abrir-diagnostico',
                    '[onclick*="diagnostico"]',
                    '.menu-diagnostico'
                ]

            for (const selector of selectores) {
                const elemento = document.querySelector(selector)
                if (elemento && this.esVisible(elemento)) {
                    elemento.click()

                    await new Promise(resolve => setTimeout(resolve, 1000))
                    this.actualizarContextoCompleto()

                    return {
                        exito: true,
                        mensaje: `Diagnóstico abierto exitosamente desde ${this.contextoActual.flujo}`,
                        contexto: this.contextoActual,
                        modulo_actual: this.contextoActual.modulo
                    }
                }
            }

            // Intentar abrir con evento personalizado
            const evento = new CustomEvent('abrir-modulo', {
                detail: { modulo: 'diagnostico', flujo: this.contextoActual.flujo }
            })
            document.dispatchEvent(evento)

            await new Promise(resolve => setTimeout(resolve, 1000))
            this.actualizarContextoCompleto()

            return {
                exito: this.contextoActual.modulo === 'diagnostico',
                mensaje: this.contextoActual.modulo === 'diagnostico'
                    ? 'Diagnóstico abierto exitosamente'
                    : 'No se pudo abrir el diagnóstico automáticamente',
                contexto: this.contextoActual
            }

        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al abrir el diagnóstico',
                contexto: this.contextoActual
            }
        }
    }

    async aplicarFiltroFechas(parametros) {
        const filtroComponent = this.obtenerComponente('filtroFechas')

        if (!filtroComponent) {
            return {
                exito: false,
                error: 'Componente de filtro no disponible',
                mensaje: 'El filtro de fechas no está conectado en este contexto'
            }
        }

        try {
            if (parametros.periodo) {
                // Aplicar período rápido
                filtroComponent.seleccionarPeriodo(parametros.periodo)

                return {
                    exito: true,
                    mensaje: `Filtro aplicado: ${parametros.periodo.toUpperCase()}`,
                    parametros: parametros,
                    contexto: this.contextoActual
                }
            } else if (parametros.fechaInicio && parametros.fechaFin) {
                // Aplicar rango específico
                filtroComponent.setRangoFechas(parametros.fechaInicio, parametros.fechaFin)

                return {
                    exito: true,
                    mensaje: `Filtro aplicado: ${parametros.fechaInicio} a ${parametros.fechaFin}`,
                    parametros: parametros,
                    contexto: this.contextoActual
                }
            } else {
                return {
                    exito: false,
                    error: 'Parámetros insuficientes',
                    mensaje: 'Se requiere un período o rango de fechas específico'
                }
            }
        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al aplicar el filtro de fechas'
            }
        }
    }

    async mostrarErroresUltimoMes() {
        try {
            // 1. Aplicar filtro de último mes
            const resultadoFiltro = await this.aplicarFiltroFechas({ periodo: 'ultimos30' })

            if (!resultadoFiltro.exito) {
                return resultadoFiltro
            }

            // 2. Aplicar filtro de tipo "ERROR" si hay componente de filtros avanzados
            const filtrosAvanzados = this.obtenerComponente('filtrosAvanzados')
            if (filtrosAvanzados && filtrosAvanzados.aplicarFiltroTipo) {
                filtrosAvanzados.aplicarFiltroTipo('ERROR')
            }

            // 3. Abrir consola o actualizar gráficas
            const consola = this.obtenerComponente('consola')
            const graficas = this.obtenerComponente('graficas')

            if (consola && consola.abrirConsola) {
                // Abrir consola con filtros aplicados
                consola.abrirConsola([], 'Errores del último mes', { tipo: 'ERROR' })
            } else if (graficas && graficas.actualizarGraficas) {
                // Actualizar gráficas
                graficas.actualizarGraficas()
            }

            return {
                exito: true,
                mensaje: 'Mostrando errores del último mes exitosamente',
                filtros_aplicados: {
                    fechas: 'ultimos30',
                    tipo: 'ERROR'
                },
                contexto: this.contextoActual
            }

        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al mostrar errores del último mes'
            }
        }
    }

    // ========== INFORMACIÓN PARA EL ASISTENTE ==========

    obtenerContextoCompleto() {
        this.actualizarContextoCompleto()

        return {
            flujo: this.contextoActual.flujo,
            modulo: this.contextoActual.modulo,
            vista: this.contextoActual.vista,
            modales_abiertos: this.contextoActual.modalesAbiertos,
            componentes_conectados: Object.keys(this.contextoActual.componentes)
                .filter(k => this.contextoActual.componentes[k] !== null),
            capacidades: this.obtenerCapacidades(),
            timestamp: this.contextoActual.timestamp
        }
    }

    obtenerCapacidades() {
        const capacidades = {
            cambiar_flujo: true,
            abrir_modulos: [],
            aplicar_filtros: [],
            ejecutar_acciones: []
        }

        // Capacidades según el flujo
        if (this.contextoActual.flujo === 'escritorio') {
            capacidades.abrir_modulos.push('diagnostico', 'consola', 'graficas-avanzadas')
            capacidades.aplicar_filtros.push('fechas', 'tipos', 'usuarios', 'oficinas')
            capacidades.ejecutar_acciones.push('exportar', 'analizar', 'generar-reportes')
        } else if (this.contextoActual.flujo === 'movil') {
            capacidades.abrir_modulos.push('eventos', 'eventos-fallidos', 'estadisticas-basicas')
            capacidades.aplicar_filtros.push('fechas', 'tipos-basicos')
            capacidades.ejecutar_acciones.push('filtrar', 'consultar')
        }

        // Capacidades según componentes conectados
        const componentes = this.contextoActual.componentes
        if (componentes.filtroFechas) capacidades.aplicar_filtros.push('fechas-avanzadas')
        if (componentes.consola) capacidades.ejecutar_acciones.push('abrir-consola')
        if (componentes.graficas) capacidades.ejecutar_acciones.push('actualizar-graficas')

        return capacidades
    }
}

// Instancia global
export const santoroContextMaster = new SantoroContextMaster()

// Función de inicialización
export const inicializarContextMaster = () => {
    if (typeof window !== 'undefined') {
        // Hacer disponible globalmente para debugging
        window.santoroContextMaster = santoroContextMaster

        // Actualizar contexto inicial
        santoroContextMaster.actualizarContextoCompleto()

        console.log('🚀 SantoroContextMaster inicializado', santoroContextMaster.obtenerContextoCompleto())
    }

    return santoroContextMaster
}
