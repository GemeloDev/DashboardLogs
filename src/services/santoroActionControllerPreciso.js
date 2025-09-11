/**
 * SantoroActionControllerPreciso - Controlador de Acciones Ultra Preciso
 * Versión mejorada con Pinia Store para máxima precisión en detección de contexto
 */

export class SantoroActionControllerPreciso {
    constructor() {
        this.contextStore = null
        this.accionesEnProceso = new Set()
        this.timeouts = new Map()
        this.components = new Map()
        this.notificationCallback = null

        this.inicializar()
    }

    async inicializar() {
        console.log('🎯 Inicializando SantoroActionControllerPreciso...')

        // Configurar event listeners globales
        this.configurarEventListeners()

        // Intentar conectar con Pinia store
        await this.conectarContextStore()
    }

    async conectarContextStore() {
        try {
            if (typeof window !== 'undefined') {
                // Esperar a que el store esté disponible
                let intentos = 0
                const maxIntentos = 10

                while (intentos < maxIntentos) {
                    try {
                        const storeModule = await import('../stores/santoroContextStore.js')
                        if (storeModule && storeModule.useSantoroContextStore) {
                            this.contextStore = storeModule.useSantoroContextStore()
                            console.log('✅ Context Store conectado exitosamente')
                            break
                        }
                    } catch (error) {
                        console.warn(`Intento ${intentos + 1} de conectar store:`, error.message)
                    }

                    intentos++
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }

                if (!this.contextStore) {
                    console.warn('⚠️ No se pudo conectar con el Context Store, usando fallback')
                }
            }
        } catch (error) {
            console.error('Error conectando Context Store:', error)
        }
    }

    configurarEventListeners() {
        // Listener para cambios de ruta
        window.addEventListener('popstate', () => {
            this.actualizarContexto()
        })

        // Listener para eventos personalizados de Vue Router
        document.addEventListener('vue-router-navigation', (event) => {
            const { to, from } = event.detail
            this.manejarCambioRuta(to, from)
        })

        // Listener para cambios de componentes
        document.addEventListener('vue-component-mounted', (event) => {
            const { componentName, instance } = event.detail
            this.manejarMontajeComponente(componentName, instance)
        })
    }

    // ========== ACCIONES PRINCIPALES ==========

    async cambiarAEscritorio() {
        const accionId = 'cambiar-escritorio'

        if (this.accionesEnProceso.has(accionId)) {
            return { exito: false, mensaje: 'Cambio ya en proceso' }
        }

        this.accionesEnProceso.add(accionId)

        try {
            console.log('🎯 Iniciando cambio a escritorio...')

            // 1. Verificar estado actual con máxima precisión
            const contextoActual = this.obtenerContextoPreciso()
            const rutaActual = window.location.pathname

            if (rutaActual.includes('/escritorio')) {
                return {
                    exito: true,
                    mensaje: 'Ya te encuentras en el flujo de escritorio',
                    contexto: contextoActual,
                    ruta: rutaActual,
                    accion: 'ninguna'
                }
            }

            // 2. Navegar a la ruta de escritorio
            const rutaDestino = '/escritorio'
            console.log('🚀 Navegando a:', rutaDestino)

            try {
                // Intentar usar Vue Router si está disponible
                if (window.__VUE_ROUTER_INSTANCE__) {
                    await window.__VUE_ROUTER_INSTANCE__.push(rutaDestino)
                } else {
                    // Fallback a navegación directa
                    window.history.pushState({}, '', rutaDestino)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                }
            } catch (error) {
                console.warn('Error en navegación router, usando fallback:', error)
                window.location.href = rutaDestino
            }

            // 3. Emitir eventos para notificar el cambio
            window.dispatchEvent(new CustomEvent('santoro-cambiar-flujo', {
                detail: {
                    flujo: 'escritorio',
                    rutaAnterior: rutaActual,
                    rutaDestino,
                    metodo: 'programatico'
                }
            }))

            // 4. Verificar cambio exitoso con timeout
            await this.esperarCambioRuta('/escritorio', 3000)

            const nuevoContexto = this.obtenerContextoPreciso()

            this.registrarAccionExitosa('cambio_flujo', {
                rutaAnterior: rutaActual,
                rutaDestino,
                flujoNuevo: 'escritorio'
            })

            return {
                exito: true,
                mensaje: 'Cambiado al flujo de escritorio exitosamente',
                contexto: nuevoContexto,
                rutaAnterior: rutaActual,
                rutaDestino
            }

        } catch (error) {
            console.error('❌ Error cambiando a escritorio:', error)

            return {
                exito: false,
                error: error.message,
                mensaje: 'No se pudo cambiar al flujo de escritorio',
                contexto: this.obtenerContextoPreciso()
            }
        } finally {
            this.accionesEnProceso.delete(accionId)
        }
    }

    async cambiarAMovil() {
        const accionId = 'cambiar-movil'

        if (this.accionesEnProceso.has(accionId)) {
            return { exito: false, mensaje: 'Cambio ya en proceso' }
        }

        this.accionesEnProceso.add(accionId)

        try {
            console.log('📱 Iniciando cambio a móvil...')

            const contextoActual = this.obtenerContextoPreciso()
            const rutaActual = window.location.pathname

            if (rutaActual.includes('/mobile')) {
                return {
                    exito: true,
                    mensaje: 'Ya te encuentras en el flujo móvil',
                    contexto: contextoActual,
                    ruta: rutaActual,
                    accion: 'ninguna'
                }
            }

            // Navegar a la ruta de mobile
            const rutaDestino = '/mobile'
            console.log('🚀 Navegando a:', rutaDestino)

            try {
                // Intentar usar Vue Router si está disponible
                if (window.__VUE_ROUTER_INSTANCE__) {
                    await window.__VUE_ROUTER_INSTANCE__.push(rutaDestino)
                } else {
                    // Fallback a navegación directa
                    window.history.pushState({}, '', rutaDestino)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                }
            } catch (error) {
                console.warn('Error en navegación router, usando fallback:', error)
                window.location.href = rutaDestino
            }

            // Emitir eventos para notificar el cambio
            window.dispatchEvent(new CustomEvent('santoro-cambiar-flujo', {
                detail: {
                    flujo: 'mobile',
                    rutaAnterior: rutaActual,
                    rutaDestino,
                    metodo: 'programatico'
                }
            }))

            // Verificar cambio exitoso
            await this.esperarCambioRuta('/mobile', 3000)

            const nuevoContexto = this.obtenerContextoPreciso()

            this.registrarAccionExitosa('cambio_flujo', {
                rutaAnterior: rutaActual,
                rutaDestino,
                flujoNuevo: 'mobile'
            })

            return {
                exito: true,
                mensaje: 'Cambiado al flujo móvil exitosamente',
                contexto: nuevoContexto,
                rutaAnterior: rutaActual,
                rutaDestino
            }

        } catch (error) {
            console.error('❌ Error cambiando a móvil:', error)

            return {
                exito: false,
                error: error.message,
                mensaje: 'No se pudo cambiar al flujo móvil',
                contexto: this.obtenerContextoPreciso()
            }
        } finally {
            this.accionesEnProceso.delete(accionId)
        }
    }

    async abrirModulo(nombreModulo) {
        const accionId = `abrir-${nombreModulo}`

        if (this.accionesEnProceso.has(accionId)) {
            return { exito: false, mensaje: 'Apertura ya en proceso' }
        }

        this.accionesEnProceso.add(accionId)

        try {
            console.log(`🎯 Abriendo módulo: ${nombreModulo}`)

            const contextoActual = this.obtenerContextoPreciso()

            // Verificar si ya estamos en el módulo
            if (contextoActual.modulo === nombreModulo) {
                return {
                    exito: true,
                    mensaje: `Ya te encuentras en el módulo de ${nombreModulo}`,
                    contexto: contextoActual,
                    accion: 'ninguna'
                }
            }

            // Verificar compatibilidad con el flujo actual
            const compatibilidad = this.verificarCompatibilidadModulo(nombreModulo, contextoActual.flujo)

            if (!compatibilidad.compatible) {
                // Cambiar flujo automáticamente si es necesario
                if (compatibilidad.flujoRecomendado) {
                    console.log(`🔄 Cambiando a ${compatibilidad.flujoRecomendado} para ${nombreModulo}`)

                    const resultadoCambio = compatibilidad.flujoRecomendado === 'escritorio'
                        ? await this.cambiarAEscritorio()
                        : await this.cambiarAMovil()

                    if (!resultadoCambio.exito) {
                        throw new Error(`No se pudo cambiar al flujo ${compatibilidad.flujoRecomendado}`)
                    }
                }
            }

            // Buscar métodos para abrir el módulo
            const metodosApertura = await this.buscarMetodosAperturaModulo(nombreModulo)

            if (metodosApertura.length === 0) {
                throw new Error(`No se encontraron métodos para abrir ${nombreModulo}`)
            }

            // Ejecutar apertura
            for (const metodo of metodosApertura) {
                try {
                    await this.ejecutarMetodoAperturaModulo(metodo, nombreModulo)

                    // Verificar apertura exitosa
                    await this.esperarCambioModulo(nombreModulo, 5000)

                    const nuevoContexto = this.obtenerContextoPreciso()

                    if (nuevoContexto.modulo === nombreModulo || this.validarModuloAbierto(nombreModulo)) {
                        this.registrarAccionExitosa('modulo_abierto', {
                            moduloAnterior: contextoActual.modulo,
                            moduloNuevo: nombreModulo,
                            metodo: metodo.tipo
                        })

                        return {
                            exito: true,
                            mensaje: `Módulo ${nombreModulo} abierto exitosamente`,
                            contexto: nuevoContexto,
                            metodo_usado: metodo.tipo
                        }
                    }
                } catch (error) {
                    console.warn(`Método ${metodo.tipo} falló:`, error.message)
                    continue
                }
            }

            throw new Error('Todos los métodos de apertura fallaron')

        } catch (error) {
            console.error(`❌ Error abriendo ${nombreModulo}:`, error)

            return {
                exito: false,
                error: error.message,
                mensaje: `No se pudo abrir el módulo ${nombreModulo}`,
                contexto: this.obtenerContextoPreciso()
            }
        } finally {
            this.accionesEnProceso.delete(accionId)
        }
    }

    // ========== MÉTODOS DE DETECCIÓN PRECISA ==========

    obtenerContextoPreciso() {
        try {
            if (this.contextStore) {
                return this.contextStore.detectarContexto()
            }

            // Fallback: detección manual precisa
            return this.detectarContextoManual()
        } catch (error) {
            console.warn('Error obteniendo contexto preciso:', error)
            return this.detectarContextoManual()
        }
    }

    detectarContextoManual() {
        const contexto = {
            flujo: 'desconocido',
            modulo: 'desconocido',
            componentes: [],
            modales: [],
            timestamp: new Date()
        }

        // Detectar flujo por DOM
        if (document.querySelector('.q-drawer--mobile') ||
            document.querySelector('[data-flujo="movil"]') ||
            window.innerWidth < 768) {
            contexto.flujo = 'movil'
        } else if (document.querySelector('.escritorio-layout') ||
            document.querySelector('[data-flujo="escritorio"]') ||
            document.querySelector('.flujo-escritorio')) {
            contexto.flujo = 'escritorio'
        }

        // Detectar módulo activo
        if (document.querySelector('.diagnostico-page') ||
            document.querySelector('.modal-diagnostico[aria-hidden="false"]')) {
            contexto.modulo = 'diagnostico'
        } else if (document.querySelector('.eventos-page')) {
            contexto.modulo = 'eventos'
        } else if (document.querySelector('.estadisticas-page')) {
            contexto.modulo = 'estadisticas'
        }

        // Detectar modales abiertos
        const modalesAbiertos = Array.from(document.querySelectorAll('.q-dialog[aria-hidden="false"]'))
            .map(modal => modal.className)
        contexto.modales = modalesAbiertos

        return contexto
    }

    // ========== MÉTODOS DE BÚSQUEDA ==========

    async buscarMetodosCambioFlujo(flujoDestino) {
        const metodos = []

        // 1. Buscar botones en la interfaz con selectores específicos
        const selectoresBotones = flujoDestino === 'escritorio'
            ? [
                '[data-action="cambiar-escritorio"]',
                '.btn-escritorio',
                '.toggle-escritorio',
                '[onclick*="escritorio"]',
                '.q-btn[data-flujo="escritorio"]'
            ]
            : [
                '[data-action="cambiar-movil"]',
                '.btn-movil',
                '.toggle-movil',
                '[onclick*="movil"]',
                '.q-btn[data-flujo="movil"]'
            ]

        for (const selector of selectoresBotones) {
            const elemento = document.querySelector(selector)
            if (elemento && this.esElementoVisible(elemento)) {
                metodos.push({
                    tipo: 'click_boton',
                    elemento,
                    selector,
                    prioridad: 10
                })
            }
        }

        // 2. Buscar métodos en componentes Vue registrados
        const componentes = this.components

        for (const [nombre, componente] of componentes) {
            const metodoLayout = flujoDestino === 'escritorio'
                ? componente.instancia?.cambiarAEscritorio
                : componente.instancia?.cambiarAMovil

            if (typeof metodoLayout === 'function') {
                metodos.push({
                    tipo: 'metodo_componente',
                    metodo: metodoLayout,
                    componente: nombre,
                    prioridad: 20
                })
            }
        }

        // 3. Router push
        const rutaDestino = flujoDestino === 'escritorio' ? '/logs#escritorio' : '/logs#movil'
        metodos.push({
            tipo: 'router_push',
            ruta: rutaDestino,
            prioridad: 5
        })

        // 4. Evento personalizado
        metodos.push({
            tipo: 'evento_personalizado',
            evento: 'cambiar-flujo',
            datos: { flujo: flujoDestino },
            prioridad: 15
        })

        // Ordenar por prioridad
        return metodos.sort((a, b) => b.prioridad - a.prioridad)
    }

    async buscarMetodosAperturaModulo(nombreModulo) {
        const metodos = []

        // 1. Buscar elementos específicos del módulo
        const selectoresModulo = this.obtenerSelectoresModulo(nombreModulo)

        for (const selector of selectoresModulo) {
            const elemento = document.querySelector(selector)
            if (elemento && this.esElementoVisible(elemento)) {
                metodos.push({
                    tipo: 'click_elemento',
                    elemento,
                    selector,
                    prioridad: 15
                })
            }
        }

        // 2. Buscar en el sidebar/menú
        const selectoresSidebar = [
            `[data-modulo="${nombreModulo}"]`,
            `.menu-${nombreModulo}`,
            `.sidebar-${nombreModulo}`,
            `[href*="${nombreModulo}"]`,
            `.q-item[data-target="${nombreModulo}"]`
        ]

        for (const selector of selectoresSidebar) {
            const elemento = document.querySelector(selector)
            if (elemento && this.esElementoVisible(elemento)) {
                metodos.push({
                    tipo: 'click_sidebar',
                    elemento,
                    selector,
                    prioridad: 20
                })
            }
        }

        // 3. Router push
        const rutaModulo = this.obtenerRutaModulo(nombreModulo)
        if (rutaModulo) {
            metodos.push({
                tipo: 'router_push',
                ruta: rutaModulo,
                prioridad: 10
            })
        }

        // 4. Método de componente
        const metodosComponente = this.buscarMetodoEnComponentes(nombreModulo)
        metodos.push(...metodosComponente)

        // 5. Evento personalizado
        metodos.push({
            tipo: 'evento_personalizado',
            evento: 'abrir-modulo',
            datos: { modulo: nombreModulo },
            prioridad: 12
        })

        return metodos.sort((a, b) => b.prioridad - a.prioridad)
    }

    // ========== MÉTODOS DE EJECUCIÓN ==========

    async ejecutarMetodoCambioFlujo(metodo, flujoDestino) {
        console.log(`🔧 Ejecutando método ${metodo.tipo} para ${flujoDestino}`)

        switch (metodo.tipo) {
            case 'click_boton':
                metodo.elemento.click()
                break

            case 'metodo_componente':
                await metodo.metodo()
                break

            case 'router_push':
                if (this.$router) {
                    await this.$router.push(metodo.ruta)
                } else if (window.history) {
                    window.history.pushState({}, '', metodo.ruta)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                }
                break

            case 'evento_personalizado': {
                const evento = new CustomEvent(metodo.evento, {
                    detail: metodo.datos
                })
                document.dispatchEvent(evento)
                break
            }

            default:
                throw new Error(`Método ${metodo.tipo} no implementado`)
        }

        // Forzar actualización del contexto
        if (this.contextStore) {
            this.contextStore.cambiarFlujo(flujoDestino)
        }
    }

    async ejecutarMetodoAperturaModulo(metodo, nombreModulo) {
        console.log(`🔧 Ejecutando método ${metodo.tipo} para ${nombreModulo}`)

        switch (metodo.tipo) {
            case 'click_elemento':
            case 'click_sidebar':
                metodo.elemento.click()
                break

            case 'metodo_componente':
                await metodo.metodo()
                break

            case 'router_push':
                if (this.$router) {
                    await this.$router.push(metodo.ruta)
                } else if (window.history) {
                    window.history.pushState({}, '', metodo.ruta)
                    window.dispatchEvent(new PopStateEvent('popstate'))
                }
                break

            case 'evento_personalizado': {
                const evento = new CustomEvent(metodo.evento, {
                    detail: metodo.datos
                })
                document.dispatchEvent(evento)
                break
            }

            default:
                throw new Error(`Método ${metodo.tipo} no implementado`)
        }

        // Forzar actualización del contexto
        if (this.contextStore) {
            this.contextStore.cambiarModulo(nombreModulo)
        }
    }

    // ========== MÉTODOS DE VERIFICACIÓN ==========

    async esperarCambioFlujo(flujoEsperado, timeout = 3000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout esperando cambio a ${flujoEsperado}`))
            }, timeout)

            const verificar = () => {
                const contexto = this.obtenerContextoPreciso()
                if (contexto.flujo === flujoEsperado) {
                    clearTimeout(timeoutId)
                    resolve(true)
                } else {
                    setTimeout(verificar, 100)
                }
            }

            verificar()
        })
    }

    async esperarCambioRuta(rutaEsperada, timeout = 3000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout esperando ruta ${rutaEsperada}`))
            }, timeout)

            const verificar = () => {
                const rutaActual = window.location.pathname
                if (rutaActual.includes(rutaEsperada)) {
                    clearTimeout(timeoutId)
                    resolve(true)
                } else {
                    setTimeout(verificar, 100)
                }
            }

            verificar()
        })
    }

    async esperarCambioModulo(moduloEsperado, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout esperando apertura de ${moduloEsperado}`))
            }, timeout)

            const verificar = () => {
                const contexto = this.obtenerContextoPreciso()
                if (contexto.modulo === moduloEsperado || this.validarModuloAbierto(moduloEsperado)) {
                    clearTimeout(timeoutId)
                    resolve(true)
                } else {
                    setTimeout(verificar, 100)
                }
            }

            verificar()
        })
    }

    validarModuloAbierto(nombreModulo) {
        // Validaciones específicas por módulo
        const validaciones = {
            'diagnostico': () => {
                return document.querySelector('.modal-diagnostico[aria-hidden="false"]') ||
                    document.querySelector('.diagnostico-page') ||
                    document.querySelector('[data-page="diagnostico"]')
            },
            'eventos': () => {
                return document.querySelector('.eventos-page') ||
                    document.querySelector('[data-page="eventos"]')
            },
            'estadisticas': () => {
                return document.querySelector('.estadisticas-page') ||
                    document.querySelector('[data-page="estadisticas"]')
            },
            'eventos-fallidos': () => {
                return document.querySelector('.eventos-fallidos-page') ||
                    document.querySelector('[data-page="eventos-fallidos"]')
            }
        }

        const validador = validaciones[nombreModulo]
        return validador ? validador() : false
    }

    // ========== MÉTODOS AUXILIARES ==========

    verificarCompatibilidadModulo(nombreModulo, flujoActual) {
        const compatibilidades = {
            'diagnostico': {
                flujos: ['escritorio'],
                flujoRecomendado: 'escritorio'
            },
            'eventos': {
                flujos: ['movil', 'escritorio'],
                flujoRecomendado: 'movil'
            },
            'eventos-fallidos': {
                flujos: ['movil', 'escritorio'],
                flujoRecomendado: 'movil'
            },
            'estadisticas': {
                flujos: ['escritorio', 'movil'],
                flujoRecomendado: null // Ambos son válidos
            }
        }

        const config = compatibilidades[nombreModulo]
        if (!config) {
            return { compatible: true, flujoRecomendado: null }
        }

        const compatible = config.flujos.includes(flujoActual)

        return {
            compatible,
            flujoRecomendado: compatible ? null : config.flujoRecomendado,
            flujosSoportados: config.flujos
        }
    }

    obtenerSelectoresModulo(nombreModulo) {
        const selectores = {
            'diagnostico': [
                '[data-action="abrir-diagnostico"]',
                '.btn-diagnostico',
                '.abrir-diagnostico',
                '[onclick*="diagnostico"]',
                '.q-btn[data-target="diagnostico"]'
            ],
            'eventos': [
                '[data-action="abrir-eventos"]',
                '.btn-eventos',
                '.abrir-eventos',
                '[href*="/eventos"]',
                '.q-item[data-target="eventos"]'
            ],
            'estadisticas': [
                '[data-action="abrir-estadisticas"]',
                '.btn-estadisticas',
                '.abrir-estadisticas',
                '[href*="/estadisticas"]',
                '.q-item[data-target="estadisticas"]'
            ],
            'eventos-fallidos': [
                '[data-action="abrir-eventos-fallidos"]',
                '.btn-eventos-fallidos',
                '[href*="/eventos-fallidos"]',
                '.q-item[data-target="eventos-fallidos"]'
            ]
        }

        return selectores[nombreModulo] || []
    }

    obtenerRutaModulo(nombreModulo) {
        const rutas = {
            'diagnostico': '/diagnostico',
            'eventos': '/eventos',
            'estadisticas': '/estadisticas',
            'eventos-fallidos': '/eventos-fallidos'
        }

        return rutas[nombreModulo]
    }

    buscarMetodoEnComponentes(nombreModulo) {
        const metodos = []

        // Buscar métodos específicos en componentes
        this.components.forEach((componente, nombre) => {
            if (!componente || !componente.instancia) return

            const nombreMetodo = `abrir${nombreModulo.charAt(0).toUpperCase() + nombreModulo.slice(1)}`

            if (typeof componente.instancia[nombreMetodo] === 'function') {
                metodos.push({
                    tipo: 'metodo_componente',
                    metodo: componente.instancia[nombreMetodo],
                    componente: nombre,
                    prioridad: 25
                })
            }
        })

        return metodos
    }

    esElementoVisible(elemento) {
        if (!elemento) return false

        const rect = elemento.getBoundingClientRect()
        const style = window.getComputedStyle(elemento)

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            style.opacity !== '0'
        )
    }

    // ========== MÉTODOS DE GESTIÓN ==========

    actualizarContexto() {
        if (this.contextStore) {
            this.contextStore.detectarContexto()
        }
    }

    registrarAccionExitosa(tipoAccion, detalles) {
        console.log(`✅ Acción exitosa: ${tipoAccion}`, detalles)

        if (this.contextStore) {
            this.contextStore.registrarAccion(tipoAccion, detalles)
        }
    }

    manejarCambioRuta(to, from) {
        console.log(`🛤️ Cambio de ruta: ${from?.path} → ${to?.path}`)
        this.actualizarContexto()
    }

    manejarMontajeComponente(componentName, instance) {
        console.log(`🔧 Componente montado: ${componentName}`)

        // Auto-conectar componentes conocidos
        const componentesConocidos = ['filtroFechas', 'consola', 'graficas', 'diagnostico']

        if (componentesConocidos.includes(componentName)) {
            this.registrarComponente(componentName, instance)
        }
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
}

// Instancia global
export const santoroActionControllerPreciso = new SantoroActionControllerPreciso()

// Función de inicialización
export const inicializarActionControllerPreciso = () => {
    console.log('🚀 SantoroActionControllerPreciso inicializado')
    return santoroActionControllerPreciso
}

// Mantener compatibilidad con el anterior
export const santoroActionController = santoroActionControllerPreciso
export default santoroActionControllerPreciso
