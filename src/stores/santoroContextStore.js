/**
 * Store de Contexto del Asistente IA - Pinia
 * Manejo de estado preciso y robusto para el contexto de la aplicación
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useSantoroContextStore = defineStore('santoroContext', () => {
    // ========== STATE ==========

    // Estado principal del contexto
    const contextoActual = ref({
        flujo: 'escritorio', // 'escritorio' | 'movil'
        modulo: 'dashboard', // 'dashboard' | 'eventos' | 'estadisticas' | 'diagnostico' | 'logs'
        vista: 'desktop', // 'desktop' | 'tablet' | 'mobile'
        ruta: '/', // Ruta actual
        timestamp: null
    })

    // Referencias de componentes
    const componentesRefs = ref({
        filtroFechas: null,
        graficas: null,
        consola: null,
        diagnostico: null,
        sidebar: null,
        layout: null
    })

    // Estado de modales
    const modalesAbiertos = ref(new Set())

    // Estado de filtros aplicados
    const filtrosAplicados = ref({
        fechas: null,
        tipos: [],
        usuarios: [],
        oficinas: []
    })

    // Historial de acciones
    const historialAcciones = ref([])

    // Estado de carga
    const cargando = ref(false)

    // ========== GETTERS ==========

    const flujoActual = computed(() => contextoActual.value.flujo)
    const moduloActual = computed(() => contextoActual.value.modulo)
    const vistaActual = computed(() => contextoActual.value.vista)
    const rutaActual = computed(() => contextoActual.value.ruta)

    const esMobile = computed(() => vistaActual.value === 'mobile')
    const esTablet = computed(() => vistaActual.value === 'tablet')
    const esDesktop = computed(() => vistaActual.value === 'desktop')

    const esFlujoEscritorio = computed(() => flujoActual.value === 'escritorio')
    const esFlujoMovil = computed(() => flujoActual.value === 'movil')

    const hayModalesAbiertos = computed(() => modalesAbiertos.value.size > 0)
    const listaModalesAbiertos = computed(() => Array.from(modalesAbiertos.value))

    const componentesConectados = computed(() => {
        return Object.keys(componentesRefs.value).filter(
            key => componentesRefs.value[key] !== null
        )
    })

    // Capacidades disponibles según el contexto
    const capacidadesDisponibles = computed(() => {
        const caps = {
            cambiarFlujo: true,
            abrirModulos: [],
            aplicarFiltros: [],
            ejecutarAcciones: []
        }

        if (esFlujoEscritorio.value) {
            caps.abrirModulos.push('diagnostico', 'estadisticas-avanzadas', 'reportes')
            caps.aplicarFiltros.push('fechas-avanzadas', 'tipos-detallados', 'exportacion')
            caps.ejecutarAcciones.push('generar-reportes', 'analisis-profundo', 'exportar-datos')
        }

        if (esFlujoMovil.value) {
            caps.abrirModulos.push('eventos', 'eventos-fallidos', 'estadisticas-basicas')
            caps.aplicarFiltros.push('fechas-basicas', 'tipos-simples')
            caps.ejecutarAcciones.push('consultar-rapido', 'filtrar-basico')
        }

        // Capacidades según componentes conectados
        if (componentesRefs.value.filtroFechas) {
            caps.aplicarFiltros.push('fechas-precision')
        }
        if (componentesRefs.value.consola) {
            caps.ejecutarAcciones.push('abrir-consola')
        }
        if (componentesRefs.value.graficas) {
            caps.ejecutarAcciones.push('actualizar-graficas')
        }

        return caps
    })

    // ========== ACTIONS ==========

    // Actualizar contexto completo
    function actualizarContexto(nuevoContexto) {
        const contextoAnterior = { ...contextoActual.value }

        contextoActual.value = {
            ...contextoActual.value,
            ...nuevoContexto,
            timestamp: new Date().toISOString()
        }

        // Registrar cambios importantes
        if (contextoAnterior.flujo !== contextoActual.value.flujo) {
            console.log(`🔄 Cambio de flujo: ${contextoAnterior.flujo} → ${contextoActual.value.flujo}`)
            registrarAccion('cambio_flujo', {
                anterior: contextoAnterior.flujo,
                nuevo: contextoActual.value.flujo
            })
        }

        if (contextoAnterior.modulo !== contextoActual.value.modulo) {
            console.log(`📱 Cambio de módulo: ${contextoAnterior.modulo} → ${contextoActual.value.modulo}`)
            registrarAccion('cambio_modulo', {
                anterior: contextoAnterior.modulo,
                nuevo: contextoActual.value.modulo
            })
        }

        return contextoActual.value
    }

    // Detectar contexto automáticamente
    function detectarContexto() {
        const contextoDetectado = {
            vista: detectarVista(),
            flujo: detectarFlujo(),
            modulo: detectarModulo(),
            ruta: detectarRuta()
        }

        return actualizarContexto(contextoDetectado)
    }

    // Cambiar flujo específicamente
    function cambiarFlujo(nuevoFlujo) {
        if (!['escritorio', 'movil'].includes(nuevoFlujo)) {
            throw new Error(`Flujo inválido: ${nuevoFlujo}`)
        }

        console.log(`🎯 Cambiando flujo a: ${nuevoFlujo}`)

        return actualizarContexto({ flujo: nuevoFlujo })
    }

    // Cambiar módulo específicamente
    function cambiarModulo(nuevoModulo) {
        const modulosValidos = ['dashboard', 'eventos', 'estadisticas', 'diagnostico', 'logs']

        if (!modulosValidos.includes(nuevoModulo)) {
            throw new Error(`Módulo inválido: ${nuevoModulo}`)
        }

        console.log(`📱 Cambiando módulo a: ${nuevoModulo}`)

        return actualizarContexto({ modulo: nuevoModulo })
    }

    // Conectar componente
    function conectarComponente(nombre, referencia) {
        componentesRefs.value[nombre] = referencia
        console.log(`🔗 Componente '${nombre}' conectado`)

        registrarAccion('componente_conectado', { nombre })
    }

    // Desconectar componente
    function desconectarComponente(nombre) {
        componentesRefs.value[nombre] = null
        console.log(`🔌 Componente '${nombre}' desconectado`)

        registrarAccion('componente_desconectado', { nombre })
    }

    // Gestión de modales
    function abrirModal(nombreModal) {
        modalesAbiertos.value.add(nombreModal)
        console.log(`🪟 Modal '${nombreModal}' abierto`)

        registrarAccion('modal_abierto', { modal: nombreModal })
    }

    function cerrarModal(nombreModal) {
        modalesAbiertos.value.delete(nombreModal)
        console.log(`❌ Modal '${nombreModal}' cerrado`)

        registrarAccion('modal_cerrado', { modal: nombreModal })
    }

    function cerrarTodosLosModales() {
        const modalesCerrados = Array.from(modalesAbiertos.value)
        modalesAbiertos.value.clear()
        console.log(`🚫 Todos los modales cerrados: ${modalesCerrados.join(', ')}`)

        registrarAccion('todos_modales_cerrados', { modales: modalesCerrados })
    }

    // Gestión de filtros
    function aplicarFiltro(tipoFiltro, valorFiltro) {
        filtrosAplicados.value[tipoFiltro] = valorFiltro
        console.log(`🔍 Filtro '${tipoFiltro}' aplicado:`, valorFiltro)

        registrarAccion('filtro_aplicado', {
            tipo: tipoFiltro,
            valor: valorFiltro
        })
    }

    function limpiarFiltros() {
        const filtrosAnteriores = { ...filtrosAplicados.value }
        filtrosAplicados.value = {
            fechas: null,
            tipos: [],
            usuarios: [],
            oficinas: []
        }
        console.log('🧹 Filtros limpiados')

        registrarAccion('filtros_limpiados', { anteriores: filtrosAnteriores })
    }

    // Registrar acción en el historial
    function registrarAccion(tipo, datos = {}) {
        const accion = {
            id: Date.now(),
            tipo,
            datos,
            contexto: { ...contextoActual.value },
            timestamp: new Date().toISOString()
        }

        historialAcciones.value.push(accion)

        // Mantener solo las últimas 50 acciones
        if (historialAcciones.value.length > 50) {
            historialAcciones.value.shift()
        }

        return accion
    }

    // ========== DETECTORS ==========

    function detectarVista() {
        if (typeof window === 'undefined') return 'desktop'

        const width = window.innerWidth
        if (width <= 768) return 'mobile'
        if (width <= 1024) return 'tablet'
        return 'desktop'
    }

    function detectarFlujo() {
        // Métodos más específicos de detección

        // 1. Revisar elementos del DOM
        const selectoresEscritorio = [
            '.flujo-escritorio',
            '[data-flujo="escritorio"]',
            '.desktop-flow',
            '.escritorio-container'
        ]

        const selectoresMovil = [
            '.flujo-movil',
            '[data-flujo="movil"]',
            '.mobile-flow',
            '.movil-container'
        ]

        // Buscar elementos visibles de escritorio
        for (const selector of selectoresEscritorio) {
            const elemento = document.querySelector(selector)
            if (elemento && esElementoVisible(elemento)) {
                return 'escritorio'
            }
        }

        // Buscar elementos visibles de móvil
        for (const selector of selectoresMovil) {
            const elemento = document.querySelector(selector)
            if (elemento && esElementoVisible(elemento)) {
                return 'movil'
            }
        }

        // 2. Revisar la URL actual
        const url = window.location.href.toLowerCase()
        if (url.includes('/escritorio') || url.includes('/desktop')) return 'escritorio'
        if (url.includes('/movil') || url.includes('/mobile')) return 'movil'

        // 3. Revisar localStorage/sessionStorage
        const flujoGuardado = localStorage.getItem('santoro-flujo-actual')
        if (flujoGuardado && ['escritorio', 'movil'].includes(flujoGuardado)) {
            return flujoGuardado
        }

        // 4. Fallback basado en el tamaño de pantalla
        const vista = detectarVista()
        return vista === 'mobile' ? 'movil' : 'escritorio'
    }

    function detectarModulo() {
        // Detectar módulo por elementos específicos en el DOM
        const modulosSelectores = {
            'diagnostico': [
                '.diagnostico-page',
                '[data-page="diagnostico"]',
                '.q-page[class*="diagnostico"]',
                '.modal-diagnostico[aria-hidden="false"]'
            ],
            'eventos': [
                '.eventos-page',
                '[data-page="eventos"]',
                '.q-page[class*="eventos"]',
                '.eventos-container'
            ],
            'estadisticas': [
                '.estadisticas-page',
                '[data-page="estadisticas"]',
                '.q-page[class*="estadisticas"]',
                '.estadisticas-container'
            ],
            'logs': [
                '.logs-page',
                '[data-page="logs"]',
                '.q-page[class*="logs"]',
                '.logs-container'
            ]
        }

        for (const [modulo, selectores] of Object.entries(modulosSelectores)) {
            for (const selector of selectores) {
                const elemento = document.querySelector(selector)
                if (elemento && esElementoVisible(elemento)) {
                    return modulo
                }
            }
        }

        // Fallback: revisar URL
        const url = window.location.href.toLowerCase()
        if (url.includes('/diagnostico')) return 'diagnostico'
        if (url.includes('/eventos')) return 'eventos'
        if (url.includes('/estadisticas')) return 'estadisticas'
        if (url.includes('/logs')) return 'logs'

        return 'dashboard'
    }

    function detectarRuta() {
        return typeof window !== 'undefined' ? window.location.pathname : '/'
    }

    function esElementoVisible(elemento) {
        if (!elemento) return false

        const style = window.getComputedStyle(elemento)
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            elemento.offsetParent !== null
    }

    // ========== WATCHERS ==========

    // Detectar cambios automáticamente
    if (typeof window !== 'undefined') {
        // Observer para cambios en el DOM
        const observer = new MutationObserver(() => {
            detectarContexto()
        })

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-flujo', 'data-page', 'aria-hidden']
            })
        }

        // Observer para cambios de tamaño
        window.addEventListener('resize', () => {
            detectarContexto()
        })

        // Observer para cambios de URL
        window.addEventListener('popstate', () => {
            detectarContexto()
        })

        // Detección inicial
        setTimeout(() => {
            detectarContexto()
        }, 100)
    }

    // Watch para guardar flujo en localStorage
    watch(flujoActual, (nuevoFlujo) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('santoro-flujo-actual', nuevoFlujo)
        }
    })

    // ========== RETURN ==========

    return {
        // State
        contextoActual,
        componentesRefs,
        modalesAbiertos,
        filtrosAplicados,
        historialAcciones,
        cargando,

        // Getters
        flujoActual,
        moduloActual,
        vistaActual,
        rutaActual,
        esMobile,
        esTablet,
        esDesktop,
        esFlujoEscritorio,
        esFlujoMovil,
        hayModalesAbiertos,
        listaModalesAbiertos,
        componentesConectados,
        capacidadesDisponibles,

        // Actions
        actualizarContexto,
        detectarContexto,
        cambiarFlujo,
        cambiarModulo,
        conectarComponente,
        desconectarComponente,
        abrirModal,
        cerrarModal,
        cerrarTodosLosModales,
        aplicarFiltro,
        limpiarFiltros,
        registrarAccion,

        // Utilities
        detectarVista,
        detectarFlujo,
        detectarModulo,
        detectarRuta,
        esElementoVisible
    }
})
