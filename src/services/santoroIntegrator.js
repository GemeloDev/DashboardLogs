// 🔗 SANTORO INTEGRATOR - Conecta IA con APIs reales del sistema
// Este archivo ejecuta las acciones que Santoro decide hacer

import { DiagnosticService } from './diagnosticService.js'
import {
    getEventosAbiertos,
    getEventosPorTipo,
    getEventosPorDia,
    getEventosPorMes,
    getEventosPorSemana
} from './api.js'

class SantoroIntegrator {
    constructor() {
        this.contextoActual = null
        this.resultadosCache = new Map()
    }

    // 🎯 MÉTODO PRINCIPAL - Ejecuta acciones basadas en la intención de la IA
    async ejecutarAccion(intencion, parametros) {
        console.log('🚀 Santoro ejecutando acción:', intencion, parametros)

        try {
            switch (intencion) {
                case 'buscar_errores':
                    return await this.buscarErrores(parametros)

                case 'buscar_sesion':
                    return await this.buscarSesion(parametros)

                case 'obtener_eventos':
                    return await this.obtenerEventos(parametros)

                case 'analizar_patron':
                    return await this.analizarPatrones(parametros)

                case 'filtrar_por_fecha':
                    return await this.filtrarPorFecha(parametros)

                case 'buscar_usuario':
                    return await this.buscarUsuario(parametros)

                default:
                    return {
                        exito: false,
                        mensaje: `No sé cómo ejecutar la acción: ${intencion}`,
                        datos: null
                    }
            }
        } catch (error) {
            console.error('❌ Error ejecutando acción:', error)
            return {
                exito: false,
                mensaje: 'Tuve un problema ejecutando esa acción. ¿Puedes intentar de nuevo?',
                error: error.message
            }
        }
    }

    // 🔍 BUSCAR ERRORES
    async buscarErrores(parametros) {
        const { codigo } = parametros

        if (codigo) {
            // Buscar por código específico
            const resultado = await DiagnosticService.getErrorCodeDetails(codigo)

            if (resultado.success) {
                const datos = resultado.data
                return {
                    exito: true,
                    mensaje: `Encontré ${datos.length} registro(s) para el código ${codigo}`,
                    datos: datos,
                    resumen: resultado.summary,
                    accionesDisponibles: ['ver_detalles', 'mostrar_grafico', 'buscar_relacionados', 'exportar']
                }
            } else {
                return {
                    exito: false,
                    mensaje: `No encontré información para el código ${codigo}`,
                    datos: null
                }
            }
        }

        // Si no hay código específico, buscar por otros criterios
        return {
            exito: true,
            mensaje: 'Para buscar errores necesito más información. ¿Podrías darme un código de error específico?',
            datos: null,
            sugerencias: ['Código de error completo', 'Código base (baseCode)', 'Usuario específico']
        }
    }

    // 👤 BUSCAR SESIÓN
    async buscarSesion(parametros) {
        const { baseCode } = parametros

        if (baseCode) {
            const resultado = await DiagnosticService.getSessionDetails(baseCode)

            if (resultado.success) {
                const datos = resultado.data
                return {
                    exito: true,
                    mensaje: `Encontré ${datos.length} evento(s) en la sesión ${baseCode}`,
                    datos: datos,
                    resumen: {
                        usuario: resultado.summary.user,
                        oficina: resultado.summary.office,
                        procesos: resultado.summary.processes,
                        tiposError: resultado.summary.errorTypes,
                        rangoFechas: resultado.summary.dateRange
                    },
                    accionesDisponibles: ['ver_timeline', 'mostrar_grafico', 'analizar_errores', 'exportar']
                }
            } else {
                return {
                    exito: false,
                    mensaje: `No encontré información para la sesión ${baseCode}`,
                    datos: null
                }
            }
        }

        return {
            exito: false,
            mensaje: 'Para buscar una sesión necesito el código base (baseCode)',
            sugerencias: ['Ej: USR02808190918']
        }
    }

    // 📊 OBTENER EVENTOS
    async obtenerEventos(parametros) {
        const { periodo, filtros } = parametros

        let resultado
        let mensaje

        try {
            switch (periodo) {
                case 'dia':
                case 'diario':
                case 'hoy':
                    resultado = await getEventosPorDia(filtros || {})
                    mensaje = 'Eventos del día obtenidos'
                    break

                case 'semana':
                case 'semanal':
                    resultado = await getEventosPorSemana(filtros || {})
                    mensaje = 'Eventos de la semana obtenidos'
                    break

                case 'mes':
                case 'mensual':
                    resultado = await getEventosPorMes(filtros || {})
                    mensaje = 'Eventos del mes obtenidos'
                    break

                case 'abiertos':
                    resultado = await getEventosAbiertos(filtros || {})
                    mensaje = 'Eventos abiertos obtenidos'
                    break

                default:
                    resultado = await getEventosPorTipo(filtros || {})
                    mensaje = 'Eventos por tipo obtenidos'
            }

            return {
                exito: true,
                mensaje: `✅ ${mensaje}. Encontré ${resultado?.length || 0} registro(s)`,
                datos: resultado,
                accionesDisponibles: ['mostrar_grafico', 'exportar', 'abrir_filtros', 'ver_detalles']
            }

        } catch (error) {
            return {
                exito: false,
                mensaje: `Error obteniendo eventos: ${error.message}`,
                datos: null
            }
        }
    }

    // 📈 ANALIZAR PATRONES
    async analizarPatrones(parametros) {
        const { datos } = parametros

        if (!datos || datos.length === 0) {
            return {
                exito: false,
                mensaje: 'No hay datos para analizar patrones',
                datos: null
            }
        }

        // Análisis básico de patrones
        const analisis = {
            totalRegistros: datos.length,
            fechas: this.analizarFechas(datos),
            usuarios: this.analizarUsuarios(datos),
            tipos: this.analizarTipos(datos),
            tendencias: this.analizarTendencias(datos)
        }

        return {
            exito: true,
            mensaje: `Análisis completado de ${datos.length} registros`,
            datos: analisis,
            insights: this.generarInsights(analisis),
            accionesDisponibles: ['ver_detalles', 'generar_alerta', 'exportar_analisis']
        }
    }

    // 📅 FILTRAR POR FECHA
    async filtrarPorFecha(parametros) {
        const { fechaInicio, fechaFin, tipo } = parametros

        // Convertir fechas relativas
        const fechas = this.procesarFechas(fechaInicio, fechaFin)

        const filtros = {
            fechaInicio: fechas.inicio,
            fechaFin: fechas.fin,
            ...parametros.filtrosAdicionales
        }

        // Ejecutar búsqueda con filtros de fecha
        return await this.obtenerEventos({ periodo: tipo || 'general', filtros })
    }

    // 👤 BUSCAR USUARIO
    async buscarUsuario(parametros) {
        const { nombreUsuario, baseCode } = parametros

        if (baseCode) {
            // Si tenemos baseCode, buscar sesión
            return await this.buscarSesion({ baseCode })
        }

        // Si solo tenemos nombre, buscar en múltiples fuentes
        return {
            exito: true,
            mensaje: `Buscaré información del usuario ${nombreUsuario}. ¿Tienes el código base (baseCode) para ser más específico?`,
            datos: null,
            sugerencias: ['Código base del usuario', 'Código de error específico']
        }
    }

    // 🛠️ MÉTODOS AUXILIARES

    analizarFechas(datos) {
        const fechas = datos.map(item => new Date(item.date || item.fecha))
        return {
            desde: new Date(Math.min(...fechas)),
            hasta: new Date(Math.max(...fechas)),
            diasUnicos: [...new Set(fechas.map(f => f.toDateString()))].length
        }
    }

    analizarUsuarios(datos) {
        const usuarios = datos.map(item => item.person?.nombreCompleto || item.usuario)
            .filter(Boolean)

        const frecuencia = {}
        usuarios.forEach(user => {
            frecuencia[user] = (frecuencia[user] || 0) + 1
        })

        return {
            total: usuarios.length,
            unicos: Object.keys(frecuencia).length,
            masFrecuentes: Object.entries(frecuencia)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
        }
    }

    analizarTipos(datos) {
        const tipos = datos.map(item => item.type || item.tipo).filter(Boolean)
        const frecuencia = {}

        tipos.forEach(tipo => {
            frecuencia[tipo] = (frecuencia[tipo] || 0) + 1
        })

        return {
            total: tipos.length,
            unicos: Object.keys(frecuencia),
            distribucion: frecuencia
        }
    }

    analizarTendencias(datos) {
        // Análisis simple de tendencias por fecha
        const porDia = {}

        datos.forEach(item => {
            const fecha = new Date(item.date || item.fecha).toDateString()
            porDia[fecha] = (porDia[fecha] || 0) + 1
        })

        const valores = Object.values(porDia)
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length

        return {
            promedioDiario: promedio,
            pico: Math.max(...valores),
            valle: Math.min(...valores),
            tendencia: valores.length > 1 ? (valores[valores.length - 1] > valores[0] ? 'creciente' : 'decreciente') : 'estable'
        }
    }

    generarInsights(analisis) {
        const insights = []

        if (analisis.usuarios.unicos < analisis.usuarios.total * 0.3) {
            insights.push('🔍 Hay usuarios con múltiples eventos - posible patrón de problema recurrente')
        }

        if (analisis.tendencias.tendencia === 'creciente') {
            insights.push('📈 Tendencia creciente detectada - considerar investigación preventiva')
        }

        if (analisis.tipos.unicos.length === 1) {
            insights.push('⚠️ Todos los eventos son del mismo tipo - posible problema sistemático')
        }

        return insights
    }

    procesarFechas(inicio, fin) {
        const hoy = new Date()
        const ayer = new Date(hoy)
        ayer.setDate(hoy.getDate() - 1)

        // Procesar fechas relativas
        let fechaInicio, fechaFin

        switch (inicio?.toLowerCase()) {
            case 'hoy':
                fechaInicio = new Date(hoy.setHours(0, 0, 0, 0))
                fechaFin = new Date(hoy.setHours(23, 59, 59, 999))
                break
            case 'ayer':
                fechaInicio = new Date(ayer.setHours(0, 0, 0, 0))
                fechaFin = new Date(ayer.setHours(23, 59, 59, 999))
                break
            case 'semana':
                fechaInicio = new Date(hoy)
                fechaInicio.setDate(hoy.getDate() - 7)
                fechaFin = hoy
                break
            default:
                fechaInicio = inicio ? new Date(inicio) : ayer
                fechaFin = fin ? new Date(fin) : hoy
        }

        return {
            inicio: fechaInicio.toISOString(),
            fin: fechaFin.toISOString()
        }
    }
}

// 🎯 Exportar instancia única
export const santoroIntegrator = new SantoroIntegrator()
export default santoroIntegrator
