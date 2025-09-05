// 🎯 SANTORO FILTERS CONTROLLER - Control Inteligente de Filtros
// Permite a Santoro AI controlar filtros automáticamente

import { useFiltroFechasStore } from 'src/stores/filtroFechasStore.js'

class SantoroFiltersController {
    constructor() {
        this.filtrosDisponibles = {
            fechas: {
                hoy: 'Filtrar por hoy',
                ayer: 'Filtrar por ayer',
                semanaActual: 'Filtrar por esta semana',
                mesActual: 'Filtrar por este mes',
                ultimosSieteDias: 'Filtrar por últimos 7 días',
                ultimosTreintaDias: 'Filtrar por últimos 30 días',
                personalizado: 'Rango personalizado'
            },
            usuarios: ['Todos', 'Usuario específico'],
            tipos: ['Todos', 'Error', 'Warning', 'Info', 'Debug'],
            modulos: ['Todos', 'Sistema', 'Usuario', 'Red', 'Base de Datos']
        }

        this.componentesRef = new Map() // Referencias a componentes
    }

    // 🔗 REGISTRAR componentes de filtros
    registrarComponenteFiltros(nombre, componenteRef) {
        this.componentesRef.set(nombre, componenteRef)
        console.log(`📌 Componente de filtros registrado: ${nombre}`)
    }

    // 📅 APLICAR FILTROS DE FECHA INTELIGENTES
    async aplicarFiltroFecha(tipoFiltro) {
        console.log(`🎯 Aplicando filtro de fecha: ${tipoFiltro}`)

        const store = useFiltroFechasStore()
        const hoy = new Date()
        let fechaInicio, fechaFin

        switch (tipoFiltro.toLowerCase()) {
            case 'hoy':
                fechaInicio = fechaFin = this.formatearFecha(hoy)
                break

            case 'ayer': {
                const ayer = new Date(hoy)
                ayer.setDate(hoy.getDate() - 1)
                fechaInicio = fechaFin = this.formatearFecha(ayer)
                break
            }

            case 'semana actual':
            case 'esta semana': {
                const inicioSemana = new Date(hoy)
                inicioSemana.setDate(hoy.getDate() - hoy.getDay())
                fechaInicio = this.formatearFecha(inicioSemana)
                fechaFin = this.formatearFecha(hoy)
                break
            }

            case 'mes actual':
            case 'este mes':
                fechaInicio = this.formatearFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
                fechaFin = this.formatearFecha(hoy)
                break

            case 'ultimos 7 dias':
            case 'ultima semana': {
                const hace7Dias = new Date(hoy)
                hace7Dias.setDate(hoy.getDate() - 7)
                fechaInicio = this.formatearFecha(hace7Dias)
                fechaFin = this.formatearFecha(hoy)
                break
            }

            case 'ultimos 30 dias':
            case 'ultimo mes': {
                const hace30Dias = new Date(hoy)
                hace30Dias.setDate(hoy.getDate() - 30)
                fechaInicio = this.formatearFecha(hace30Dias)
                fechaFin = this.formatearFecha(hoy)
                break
            }

            default:
                console.warn(`⚠️ Filtro de fecha no reconocido: ${tipoFiltro}`)
                return false
        }

        // Aplicar al store
        store.setFechas(fechaInicio, fechaFin)

        // Notificar a los componentes registrados
        await this.notificarCambioFiltros({
            fechaInicio,
            fechaFin,
            tipo: tipoFiltro
        })

        return {
            exito: true,
            mensaje: `Filtro aplicado: ${tipoFiltro}`,
            fechaInicio,
            fechaFin,
            descripcion: `${fechaInicio} - ${fechaFin}`
        }
    }

    // 🎯 APLICAR FILTROS POR COMANDO DE VOZ/TEXTO
    async procesarComandoFiltro(comando) {
        const comandoLower = comando.toLowerCase()

        // Detectar tipo de filtro solicitado
        if (comandoLower.includes('filtrar') || comandoLower.includes('mostrar')) {

            // Filtros de fecha
            if (comandoLower.includes('hoy')) {
                return await this.aplicarFiltroFecha('hoy')
            }
            if (comandoLower.includes('ayer')) {
                return await this.aplicarFiltroFecha('ayer')
            }
            if (comandoLower.includes('semana')) {
                return await this.aplicarFiltroFecha('semana actual')
            }
            if (comandoLower.includes('mes')) {
                return await this.aplicarFiltroFecha('mes actual')
            }
            if (comandoLower.includes('7 dias') || comandoLower.includes('ultimos dias')) {
                return await this.aplicarFiltroFecha('ultimos 7 dias')
            }
            if (comandoLower.includes('30 dias') || comandoLower.includes('ultimo mes')) {
                return await this.aplicarFiltroFecha('ultimos 30 dias')
            }
        }

        // Abrir panel de filtros
        if (comandoLower.includes('abrir filtros') || comandoLower.includes('mostrar filtros')) {
            return await this.abrirPanelFiltros()
        }

        return {
            exito: false,
            mensaje: 'No se reconoció el comando de filtro',
            sugerencias: [
                'Filtrar por hoy',
                'Mostrar últimos 7 días',
                'Filtrar por esta semana',
                'Abrir filtros'
            ]
        }
    }

    // 📱 ABRIR PANEL DE FILTROS
    async abrirPanelFiltros() {
        // Intentar abrir/expandir el componente de filtros si existe
        const filtrosComponent = this.componentesRef.get('filtros-principales')

        if (filtrosComponent) {
            // Si es un q-expansion-item o similar, expandirlo
            if (typeof filtrosComponent.show === 'function') {
                filtrosComponent.show()
            }

            return {
                exito: true,
                mensaje: 'Panel de filtros abierto',
                accion: 'panel_abierto'
            }
        }

        return {
            exito: false,
            mensaje: 'No se pudo abrir el panel de filtros'
        }
    }

    // 📊 OBTENER ESTADO ACTUAL DE FILTROS
    obtenerEstadoFiltros() {
        const store = useFiltroFechasStore()

        return {
            fechaInicio: store.fechaInicio,
            fechaFin: store.fechaFin,
            activo: !!store.fechaInicio && !!store.fechaFin,
            descripcion: store.fechaInicio && store.fechaFin
                ? `${store.fechaInicio} - ${store.fechaFin}`
                : 'Sin filtros aplicados'
        }
    }

    // 🔔 NOTIFICAR cambios a componentes registrados
    async notificarCambioFiltros(filtros) {
        for (const [nombre, componente] of this.componentesRef.entries()) {
            try {
                if (typeof componente.aplicarFiltros === 'function') {
                    await componente.aplicarFiltros(filtros)
                }

                // Emitir eventos si el componente lo soporta
                if (typeof componente.$emit === 'function') {
                    componente.$emit('filter', filtros)
                }
            } catch (error) {
                console.warn(`⚠️ Error notificando a componente ${nombre}:`, error)
            }
        }
    }

    // 🛠️ UTILIDADES
    formatearFecha(fecha) {
        const year = fecha.getFullYear()
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0')
        const day = fecha.getDate().toString().padStart(2, '0')
        return `${year}/${month}/${day}`
    }

    // 📋 OBTENER FILTROS DISPONIBLES
    obtenerFiltrosDisponibles() {
        return this.filtrosDisponibles
    }

    // 💡 GENERAR SUGERENCIAS DE FILTROS
    generarSugerenciasFiltros() {
        return [
            '🗓️ Filtrar por hoy',
            '📅 Mostrar esta semana',
            '📊 Filtrar últimos 7 días',
            '📈 Mostrar este mes',
            '🔍 Abrir panel de filtros',
            '🔄 Resetear filtros'
        ]
    }

    // 🔄 RESETEAR FILTROS
    async resetearFiltros() {
        const store = useFiltroFechasStore()
        store.resetearAMesActual()

        await this.notificarCambioFiltros({
            fechaInicio: store.fechaInicio,
            fechaFin: store.fechaFin,
            tipo: 'reset'
        })

        return {
            exito: true,
            mensaje: 'Filtros reseteados al mes actual',
            accion: 'reset_realizado'
        }
    }
}

// 🎯 Instancia global
export const santoroFiltersController = new SantoroFiltersController()
export default santoroFiltersController
