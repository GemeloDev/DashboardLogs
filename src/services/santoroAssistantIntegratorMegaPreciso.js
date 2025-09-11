/**
 * SantoroAssistantIntegratorMegaPreciso - Integrador Ultra Preciso del Asistente
 * Sistema completo con precisión absoluta usando Pinia Store
 */

import { santoroActionControllerPreciso } from './santoroActionControllerPreciso.js'
import { santoroFiltroDateController } from './santoroFiltroDateController.js'

export class SantoroAssistantIntegratorMegaPreciso {
    constructor() {
        this.actionController = santoroActionControllerPreciso
        this.filtroController = santoroFiltroDateController
        this.comandosEnProceso = new Set()
        this.historialComandos = []
        this.patrones = this.inicializarPatrones()

        this.inicializar()
    }

    async inicializar() {
        console.log('🚀 Inicializando SantoroAssistantIntegratorMegaPreciso...')

        // Configurar event listeners
        this.configurarEventListeners()

        // Esperar a que el action controller esté listo
        await this.esperarActionController()

        console.log('✅ SantoroAssistantIntegratorMegaPreciso listo')
    }

    async esperarActionController() {
        let intentos = 0
        const maxIntentos = 20

        while (intentos < maxIntentos) {
            if (this.actionController) {
                console.log('✅ ActionController conectado')
                return true
            }

            await new Promise(resolve => setTimeout(resolve, 500))
            intentos++
        }

        console.warn('⚠️ ActionController no disponible, usando modo fallback')
        return false
    }

    configurarEventListeners() {
        // Listener para comandos del asistente
        document.addEventListener('santoro-comando', (event) => {
            const { comando, parametros } = event.detail
            this.procesarComando(comando, parametros)
        })

        // Listener para respuestas de acciones
        document.addEventListener('santoro-respuesta-accion', (event) => {
            this.manejarRespuestaAccion(event.detail)
        })
    }

    inicializarPatrones() {
        return {
            // NAVEGACIÓN Y CAMBIO DE FLUJO
            cambioEscritorio: [
                /(?:cambiar?|ir|pasar|switch).{0,10}(?:a|al)?\s*(?:flujo\s*de\s*)?escritorio/i,
                /(?:abr[ie]|mostrar|ver).{0,10}(?:el\s*)?escritorio/i,
                /(?:modo|vista|version)\s*(?:de\s*)?escritorio/i,
                /escritorio(?:\s*mode?)?/i
            ],

            cambioMovil: [
                /(?:cambiar?|ir|pasar|switch).{0,10}(?:a|al)?\s*(?:flujo\s*de\s*)?(?:movil|móvil|mobile)/i,
                /(?:abr[ie]|mostrar|ver).{0,10}(?:el\s*)?(?:movil|móvil|mobile)/i,
                /(?:modo|vista|version)\s*(?:de\s*)?(?:movil|móvil|mobile)/i,
                /(?:movil|móvil|mobile)(?:\s*mode?)?/i
            ],

            // MÓDULOS ESPECÍFICOS
            abrirDiagnostico: [
                /(?:abr[ie]|mostrar|ver|cargar).{0,15}(?:el\s*)?diagn[oó]stico/i,
                /diagn[oó]stico/i,
                /(?:ir|navegar)\s*(?:a|al)\s*diagn[oó]stico/i,
                /(?:módulo|seccion)\s*(?:de\s*)?diagn[oó]stico/i
            ],

            abrirEventos: [
                /(?:abr[ie]|mostrar|ver|cargar).{0,15}(?:los\s*)?eventos?/i,
                /eventos?(?:\s*abiertos?)?/i,
                /(?:ir|navegar)\s*(?:a|al)\s*eventos?/i,
                /(?:módulo|seccion)\s*(?:de\s*)?eventos?/i
            ],

            abrirEventosFallidos: [
                /(?:abr[ie]|mostrar|ver|cargar).{0,15}eventos?\s*fallidos?/i,
                /eventos?\s*(?:con\s*)?(?:error|fall[aá]ron|fallidos?)/i,
                /(?:ir|navegar)\s*(?:a|al)\s*eventos?\s*fallidos?/i,
                /fallidos?/i
            ],

            abrirEstadisticas: [
                /(?:abr[ie]|mostrar|ver|cargar).{0,15}(?:las\s*)?estad[íi]sticas?/i,
                /estad[íi]sticas?/i,
                /(?:ir|navegar)\s*(?:a|al)\s*estad[íi]sticas?/i,
                /(?:módulo|seccion)\s*(?:de\s*)?estad[íi]sticas?/i
            ],

            // FILTROS DE FECHA
            filtroMesActual: [
                /(?:filtrar?|mostrar).{0,15}(?:del\s*|el\s*)?mes\s*actual/i,
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?este\s*mes/i,
                /mes\s*actual/i,
                /este\s*mes/i
            ],

            filtroUltimoMes: [
                /(?:filtrar?|mostrar).{0,15}(?:del\s*)?(?:último|ultimo)\s*mes/i,
                /(?:filtrar?|mostrar).{0,15}mes\s*(?:pasado|anterior)/i,
                /(?:último|ultimo)\s*mes/i,
                /mes\s*pasado/i
            ],

            filtroHoy: [
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?hoy/i,
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?(?:el\s*)?d[íi]a\s*de\s*hoy/i,
                /hoy/i,
                /(?:el\s*)?d[íi]a\s*de\s*hoy/i
            ],

            filtroAyer: [
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?ayer/i,
                /ayer/i
            ],

            filtroSemanaActual: [
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?(?:la\s*)?semana\s*actual/i,
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?esta\s*semana/i,
                /semana\s*actual/i,
                /esta\s*semana/i
            ],

            filtroUltimos7Dias: [
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?(?:los\s*)?(?:últimos|ultimos)\s*(?:7|siete)\s*d[íi]as/i,
                /(?:últimos|ultimos)\s*(?:7|siete)\s*d[íi]as/i
            ],

            filtroUltimos30Dias: [
                /(?:filtrar?|mostrar).{0,15}(?:de\s*)?(?:los\s*)?(?:últimos|ultimos)\s*(?:30|treinta)\s*d[íi]as/i,
                /(?:últimos|ultimos)\s*(?:30|treinta)\s*d[íi]as/i
            ],

            // ACCIONES GENERALES
            resetearFiltros: [
                /(?:resetear?|limpiar|quitar|eliminar).{0,15}(?:los\s*)?filtros?/i,
                /(?:todos\s*los\s*)?filtros?\s*(?:off|quitar|eliminar)/i,
                /sin\s*filtros?/i,
                /mostrar\s*todo/i
            ]
        }
    }

    async procesarComando(comando, parametros = {}) {
        const comandoId = `${comando}-${Date.now()}`

        if (this.comandosEnProceso.has(comandoId)) {
            return { exito: false, mensaje: 'Comando ya en proceso' }
        }

        this.comandosEnProceso.add(comandoId)

        try {
            console.log(`🎯 Procesando comando: "${comando}"`)

            // Registrar en historial
            this.historialComandos.push({
                comando,
                parametros,
                timestamp: new Date(),
                id: comandoId
            })

            // Analizar intención con mega precisión
            const intencion = this.analizarIntencionMegaPrecisa(comando)

            if (!intencion.reconocida) {
                return {
                    exito: false,
                    mensaje: `No entendí el comando: "${comando}"`,
                    sugerencias: this.obtenerSugerencias(comando)
                }
            }

            // Verificar contexto actual para precisión máxima
            const contextoActual = this.actionController.obtenerContextoPreciso()
            console.log('📍 Contexto actual:', contextoActual)

            // Ejecutar según intención con validación de contexto
            const resultado = await this.ejecutarSegunIntencionPrecisa(intencion, parametros)

            return resultado

        } catch (error) {
            console.error('❌ Error procesando comando:', error)

            return {
                exito: false,
                error: error.message,
                mensaje: `Error ejecutando: "${comando}"`
            }
        } finally {
            this.comandosEnProceso.delete(comandoId)
        }
    }

    analizarIntencionMegaPrecisa(comando) {
        const intencion = {
            reconocida: false,
            accion: null,
            parametros: {},
            confianza: 0
        }

        // Buscar patrones con puntuación de confianza
        for (const [nombreAccion, patrones] of Object.entries(this.patrones)) {
            for (const patron of patrones) {
                const match = comando.match(patron)
                if (match) {
                    const confianza = this.calcularConfianza(match, comando)

                    if (confianza > intencion.confianza) {
                        intencion.reconocida = true
                        intencion.accion = nombreAccion
                        intencion.confianza = confianza
                        intencion.match = match
                        intencion.parametros = this.extraerParametros(match, comando, nombreAccion)
                    }
                }
            }
        }

        console.log(`🔍 Intención analizada:`, intencion)
        return intencion
    }

    calcularConfianza(match, comando) {
        let confianza = 50 // Base

        // Más confianza si el match es más específico
        if (match[0].length / comando.length > 0.7) {
            confianza += 30
        } else if (match[0].length / comando.length > 0.5) {
            confianza += 20
        } else if (match[0].length / comando.length > 0.3) {
            confianza += 10
        }

        // Más confianza si es match completo
        if (match[0].trim().toLowerCase() === comando.trim().toLowerCase()) {
            confianza += 40
        }

        // Más confianza si contiene palabras clave exactas
        const palabrasClave = ['diagnostico', 'eventos', 'estadisticas', 'escritorio', 'movil']
        for (const palabra of palabrasClave) {
            if (comando.toLowerCase().includes(palabra)) {
                confianza += 15
            }
        }

        return Math.min(confianza, 100)
    }

    extraerParametros(match, comando, accion) {
        const parametros = {}

        // Extraer parámetros específicos según la acción
        switch (accion) {
            case 'filtroMesActual':
                parametros.tipo = 'mes actual'
                break
            case 'filtroUltimoMes':
                parametros.tipo = 'mes pasado'
                break
            case 'filtroHoy':
                parametros.tipo = 'hoy'
                break
            case 'filtroAyer':
                parametros.tipo = 'ayer'
                break
            case 'filtroSemanaActual':
                parametros.tipo = 'semana actual'
                break
            case 'filtroUltimos7Dias':
                parametros.tipo = 'ultimos 7 dias'
                break
            case 'filtroUltimos30Dias':
                parametros.tipo = 'ultimos 30 dias'
                break
        }

        return parametros
    }

    async ejecutarSegunIntencionPrecisa(intencion, parametros) {
        const { accion, parametros: paramIntencion } = intencion
        const paramFinales = { ...paramIntencion, ...parametros }

        console.log(`🚀 Ejecutando acción: ${accion}`)

        try {
            switch (accion) {
                // CAMBIOS DE FLUJO
                case 'cambioEscritorio':
                    return await this.actionController.cambiarAEscritorio()

                case 'cambioMovil':
                    return await this.actionController.cambiarAMovil()

                // MÓDULOS
                case 'abrirDiagnostico':
                    return await this.actionController.abrirModulo('diagnostico')

                case 'abrirEventos':
                    return await this.actionController.abrirModulo('eventos')

                case 'abrirEventosFallidos':
                    return await this.actionController.abrirModulo('eventos-fallidos')

                case 'abrirEstadisticas':
                    return await this.actionController.abrirModulo('estadisticas')

                // FILTROS
                case 'filtroMesActual':
                case 'filtroUltimoMes':
                case 'filtroHoy':
                case 'filtroAyer':
                case 'filtroSemanaActual':
                case 'filtroUltimos7Dias':
                case 'filtroUltimos30Dias':
                    return await this.aplicarFiltroFecha(paramFinales.tipo)

                case 'resetearFiltros':
                    return await this.resetearFiltros()

                default:
                    return {
                        exito: false,
                        mensaje: `Acción no implementada: ${accion}`,
                        intencion
                    }
            }
        } catch (error) {
            console.error(`❌ Error ejecutando ${accion}:`, error)

            return {
                exito: false,
                error: error.message,
                mensaje: `Error en ${accion}: ${error.message}`,
                intencion
            }
        }
    }

    async aplicarFiltroFecha(tipoFiltro) {
        try {
            const resultado = await this.filtroController.aplicarFiltroFecha(tipoFiltro)

            return {
                exito: resultado.exito,
                mensaje: resultado.mensaje,
                accionEjecutada: 'aplicar_filtro_fecha',
                datos: resultado
            }
        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error aplicando filtro de fecha'
            }
        }
    }

    async resetearFiltros() {
        try {
            const resultado = await this.filtroController.resetearFiltros()

            return {
                exito: resultado.exito,
                mensaje: resultado.mensaje,
                accionEjecutada: 'resetear_filtros',
                datos: resultado
            }
        } catch (error) {
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error reseteando filtros'
            }
        }
    }

    obtenerSugerencias(comando) {
        const sugerencias = []

        // Sugerencias basadas en palabras clave
        if (comando.toLowerCase().includes('escritorio')) {
            sugerencias.push('cambiar a escritorio', 'abrir escritorio')
        }

        if (comando.toLowerCase().includes('movil') || comando.toLowerCase().includes('móvil')) {
            sugerencias.push('cambiar a móvil', 'abrir móvil')
        }

        if (comando.toLowerCase().includes('diagnostico')) {
            sugerencias.push('abrir diagnóstico', 'mostrar diagnóstico')
        }

        if (comando.toLowerCase().includes('evento')) {
            sugerencias.push('abrir eventos', 'mostrar eventos', 'eventos fallidos')
        }

        if (comando.toLowerCase().includes('estadistic')) {
            sugerencias.push('abrir estadísticas', 'mostrar estadísticas')
        }

        if (comando.toLowerCase().includes('filtro') || comando.toLowerCase().includes('mes') || comando.toLowerCase().includes('fecha')) {
            sugerencias.push('filtrar mes actual', 'filtrar último mes', 'resetear filtros')
        }

        return sugerencias.slice(0, 3) // Máximo 3 sugerencias
    }

    manejarRespuestaAccion(respuesta) {
        console.log('📬 Respuesta de acción:', respuesta)

        // Emitir evento para que el asistente procese la respuesta
        const evento = new CustomEvent('santoro-respuesta-procesada', {
            detail: {
                respuesta,
                timestamp: new Date()
            }
        })

        document.dispatchEvent(evento)
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    obtenerEstadoActual() {
        return {
            comandosEnProceso: Array.from(this.comandosEnProceso),
            historialComandos: this.historialComandos.slice(-10), // Últimos 10
            contextoActual: this.actionController.obtenerContextoPreciso(),
            timestamp: new Date()
        }
    }

    limpiarHistorial() {
        this.historialComandos = []
        console.log('🧹 Historial de comandos limpiado')
    }

    configurarNotificaciones(callback) {
        this.actionController.configurarNotificaciones(callback)
    }

    // ========== MÉTODOS DE PRUEBA ==========

    async probarComando(comando) {
        console.log(`🧪 Probando comando: "${comando}"`)

        const resultado = await this.procesarComando(comando)

        console.log('🧪 Resultado de prueba:', resultado)

        return resultado
    }

    async probarTodosLosComandos() {
        const comandosPrueba = [
            'cambiar a escritorio',
            'cambiar a móvil',
            'abrir diagnóstico',
            'abrir eventos',
            'abrir estadísticas',
            'filtrar mes actual',
            'filtrar último mes',
            'resetear filtros'
        ]

        const resultados = []

        for (const comando of comandosPrueba) {
            console.log(`\n🧪 Probando: "${comando}"`)

            const resultado = await this.probarComando(comando)
            resultados.push({ comando, resultado })

            // Esperar un poco entre comandos
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log('\n📊 Resumen de pruebas:', resultados)

        return resultados
    }
}

// Instancia global
export const santoroAssistantIntegratorMegaPreciso = new SantoroAssistantIntegratorMegaPreciso()

// Función de auto-inicialización
export const inicializarAssistantIntegratorMegaPreciso = async () => {
    console.log('🚀 Inicializando AssistantIntegratorMegaPreciso...')

    await santoroAssistantIntegratorMegaPreciso.inicializar()

    console.log('✅ AssistantIntegratorMegaPreciso listo para usar')

    return santoroAssistantIntegratorMegaPreciso
}

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Esperar a que la página esté cargada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarAssistantIntegratorMegaPreciso)
    } else {
        // Ya está cargada, inicializar inmediatamente
        setTimeout(inicializarAssistantIntegratorMegaPreciso, 1000)
    }
}

// Mantener compatibilidad
export const santoroAssistantIntegrator = santoroAssistantIntegratorMegaPreciso
export default santoroAssistantIntegratorMegaPreciso
