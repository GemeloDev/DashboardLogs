// 🎛️ SANTORO COMPONENT CONTROLLER - Control Avanzado de UI
// Control específico de componentes para acciones precisas como Google Assistant

import { nextTick } from 'vue'
import { useQuasar } from 'quasar'

class SantoroComponentController {
    constructor() {
        this.q = null
        this.componentes = new Map()
        this.tabs = new Map()
        this.filtros = new Map()
        this.configurado = false
    }

    // 🔧 INICIALIZAR CONTROLADOR
    inicializar() {
        this.q = useQuasar()
        this.configurado = true
        console.log('🎛️ Component Controller inicializado')
    }

    // 📝 REGISTRAR COMPONENTE
    registrarComponente(id, referencia, metadatos = {}) {
        this.componentes.set(id, {
            ref: referencia,
            metadata: metadatos,
            activo: false,
            ultimoUso: null
        })

        console.log(`📝 Componente registrado: ${id}`)
    }

    // 🎯 EJECUTAR ACCIÓN EN COMPONENTE
    async ejecutarAccionComponente(accion) {
        if (!this.configurado) {
            console.warn('⚠️ Component Controller no configurado')
            return { exito: false, error: 'No configurado' }
        }

        try {
            console.log('🎯 Ejecutando acción en componente:', accion)

            switch (accion.tipo) {
                case 'tab':
                    return await this.controlarTabs(accion)

                case 'filtro':
                    return await this.controlarFiltros(accion)

                case 'tabla':
                    return await this.controlarTabla(accion)

                case 'grafico':
                    return await this.controlarGrafico(accion)

                case 'busqueda':
                    return await this.controlarBusqueda(accion)

                case 'dropdown':
                    return await this.controlarDropdown(accion)

                case 'dialog':
                    return await this.controlarDialog(accion)

                default:
                    return await this.accionGenerica(accion)
            }

        } catch (error) {
            console.error('❌ Error ejecutando acción:', error)
            return { exito: false, error: error.message }
        }
    }

    // 🗂️ CONTROLAR TABS
    async controlarTabs(accion) {
        const { destino, operacion = 'activar' } = accion

        switch (operacion) {
            case 'activar':
                return await this.activarTab(destino)

            case 'cerrar':
                return await this.cerrarTab(destino)

            case 'nueva':
                return await this.nuevaTab(destino)

            default:
                return { exito: false, error: 'Operación no válida' }
        }
    }

    // ✅ ACTIVAR TAB ESPECÍFICA
    async activarTab(tabId) {
        try {
            // Buscar tab por ID o nombre
            const tabElement = this.encontrarElemento(`[data-tab="${tabId}"]`) ||
                this.encontrarElemento(`[aria-label*="${tabId}"]`) ||
                this.encontrarElemento(`q-tab[name="${tabId}"]`)

            if (tabElement) {
                tabElement.click()
                await nextTick()

                this.tabs.set(tabId, { activa: true, activadaEn: new Date() })

                return {
                    exito: true,
                    mensaje: `Tab "${tabId}" activada`,
                    elemento: tabId
                }
            }

            // Si no se encuentra por selector, intentar por texto
            const tabPorTexto = this.encontrarElementoPorTexto(tabId, 'q-tab')
            if (tabPorTexto) {
                tabPorTexto.click()
                await nextTick()

                return {
                    exito: true,
                    mensaje: `Tab con texto "${tabId}" activada`,
                    elemento: tabId
                }
            }

            return { exito: false, error: `Tab "${tabId}" no encontrada` }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 🔍 CONTROLAR FILTROS
    async controlarFiltros(accion) {
        const { tipo, valor, operacion = 'aplicar' } = accion

        switch (tipo) {
            case 'fecha':
                return await this.aplicarFiltroFecha(valor, operacion)

            case 'usuario':
                return await this.aplicarFiltroUsuario(valor, operacion)

            case 'error':
                return await this.aplicarFiltroError(valor, operacion)

            case 'reset':
                return await this.resetearFiltros()

            default:
                return { exito: false, error: 'Tipo de filtro no válido' }
        }
    }

    // 📅 APLICAR FILTRO DE FECHA
    async aplicarFiltroFecha(valor) {
        try {
            const { desde, hasta, preseleccion } = valor

            if (preseleccion) {
                // Preselecciones como "hoy", "esta semana", etc.
                const botonPreseleccion = this.encontrarElementoPorTexto(preseleccion, 'q-btn')
                if (botonPreseleccion) {
                    botonPreseleccion.click()
                    await nextTick()

                    return {
                        exito: true,
                        mensaje: `Filtro de fecha aplicado: ${preseleccion}`,
                        filtro: { tipo: 'fecha', valor: preseleccion }
                    }
                }
            }

            // Fechas específicas
            if (desde || hasta) {
                const inputDesde = this.encontrarElemento('input[placeholder*="desde"], input[name="fecha_desde"]')
                const inputHasta = this.encontrarElemento('input[placeholder*="hasta"], input[name="fecha_hasta"]')

                if (inputDesde && desde) {
                    this.establecerValorInput(inputDesde, desde)
                }

                if (inputHasta && hasta) {
                    this.establecerValorInput(inputHasta, hasta)
                }

                // Aplicar filtro
                const btnAplicar = this.encontrarElementoPorTexto('aplicar', 'q-btn') ||
                    this.encontrarElemento('[data-action="aplicar-filtro"]')

                if (btnAplicar) {
                    btnAplicar.click()
                    await nextTick()
                }

                this.filtros.set('fecha', { desde, hasta, aplicadoEn: new Date() })

                return {
                    exito: true,
                    mensaje: `Filtro de fecha aplicado: ${desde} - ${hasta}`,
                    filtro: { tipo: 'fecha', desde, hasta }
                }
            }

            return { exito: false, error: 'Parámetros de fecha no válidos' }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 👤 APLICAR FILTRO DE USUARIO
    async aplicarFiltroUsuario(valor) {
        try {
            const selectUsuario = this.encontrarElemento('select[name*="usuario"], .q-select[data-field="usuario"]')

            if (selectUsuario) {
                // Abrir dropdown
                selectUsuario.click()
                await nextTick()

                // Buscar opción específica
                const opcion = this.encontrarElementoPorTexto(valor, '.q-item')
                if (opcion) {
                    opcion.click()
                    await nextTick()

                    this.filtros.set('usuario', { valor, aplicadoEn: new Date() })

                    return {
                        exito: true,
                        mensaje: `Filtro de usuario aplicado: ${valor}`,
                        filtro: { tipo: 'usuario', valor }
                    }
                }
            }

            return { exito: false, error: `Usuario "${valor}" no encontrado` }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 📊 CONTROLAR TABLA
    async controlarTabla(accion) {
        const { operacion, parametros = {} } = accion

        switch (operacion) {
            case 'ordenar':
                return await this.ordenarTabla(parametros.columna, parametros.direccion)

            case 'paginar':
                return await this.paginarTabla(parametros.pagina)

            case 'seleccionar':
                return await this.seleccionarFila(parametros.fila)

            case 'exportar':
                return await this.exportarTabla(parametros.formato)

            default:
                return { exito: false, error: 'Operación de tabla no válida' }
        }
    }

    // 📈 CONTROLAR GRÁFICO
    async controlarGrafico(accion) {
        const { operacion, parametros = {} } = accion

        switch (operacion) {
            case 'cambiar_tipo':
                return await this.cambiarTipoGrafico(parametros.tipo)

            case 'filtrar':
                return await this.filtrarGrafico(parametros.filtro)

            case 'exportar':
                return await this.exportarGrafico(parametros.formato)

            case 'zoom':
                return await this.zoomGrafico(parametros.nivel)

            default:
                return { exito: false, error: 'Operación de gráfico no válida' }
        }
    }

    // 🔍 CONTROLAR BÚSQUEDA
    async controlarBusqueda(accion) {
        const { termino, tipo = 'general' } = accion

        try {
            const inputBusqueda = this.encontrarElemento('input[type="search"], input[placeholder*="buscar"], .q-field--search input')

            if (inputBusqueda) {
                this.establecerValorInput(inputBusqueda, termino)

                // Disparar evento de búsqueda
                inputBusqueda.dispatchEvent(new Event('input', { bubbles: true }))

                // Buscar botón de búsqueda si existe
                const btnBuscar = this.encontrarElemento('[data-action="buscar"], .q-btn[data-search]') ||
                    this.encontrarElementoPorTexto('buscar', '.q-btn')

                if (btnBuscar) {
                    btnBuscar.click()
                    await nextTick()
                }

                return {
                    exito: true,
                    mensaje: `Búsqueda ejecutada: "${termino}"`,
                    termino,
                    tipo
                }
            }

            return { exito: false, error: 'Campo de búsqueda no encontrado' }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 📋 CONTROLAR DROPDOWN
    async controlarDropdown(accion) {
        const { selector, opcion, operacion = 'seleccionar' } = accion

        try {
            const dropdown = this.encontrarElemento(selector) ||
                this.encontrarElemento('.q-select') ||
                this.encontrarElemento('select')

            if (!dropdown) {
                return { exito: false, error: 'Dropdown no encontrado' }
            }

            // Abrir dropdown
            dropdown.click()
            await nextTick()

            if (operacion === 'seleccionar') {
                // Buscar opción específica
                const opcionElement = this.encontrarElementoPorTexto(opcion, '.q-item') ||
                    this.encontrarElementoPorTexto(opcion, 'option')

                if (opcionElement) {
                    opcionElement.click()
                    await nextTick()

                    return {
                        exito: true,
                        mensaje: `Opción "${opcion}" seleccionada`,
                        selector,
                        opcion
                    }
                }

                return { exito: false, error: `Opción "${opcion}" no encontrada` }
            }

            return { exito: false, error: 'Operación no válida' }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 💬 CONTROLAR DIALOG
    async controlarDialog(accion) {
        const { operacion } = accion

        switch (operacion) {
            case 'cerrar':
                return await this.cerrarDialog()

            case 'confirmar':
                return await this.confirmarDialog()

            case 'cancelar':
                return await this.cancelarDialog()

            default:
                return { exito: false, error: 'Operación de dialog no válida' }
        }
    }

    // 🔍 UTILIDADES DE BÚSQUEDA
    encontrarElemento(selector) {
        try {
            return document.querySelector(selector)
        } catch (error) {
            console.warn('Error buscando elemento:', selector, error)
            return null
        }
    }

    encontrarElementoPorTexto(texto, selector = '*') {
        try {
            const elementos = Array.from(document.querySelectorAll(selector))
            return elementos.find(el =>
                el.textContent?.toLowerCase().includes(texto.toLowerCase()) ||
                el.innerText?.toLowerCase().includes(texto.toLowerCase())
            )
        } catch (error) {
            console.warn('Error buscando por texto:', texto, error)
            return null
        }
    }

    establecerValorInput(input, valor) {
        try {
            input.value = valor
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.dispatchEvent(new Event('change', { bubbles: true }))
        } catch (error) {
            console.warn('Error estableciendo valor:', error)
        }
    }

    // 🗂️ RESETEAR FILTROS
    async resetearFiltros() {
        try {
            const btnReset = this.encontrarElementoPorTexto('limpiar', '.q-btn') ||
                this.encontrarElementoPorTexto('reset', '.q-btn') ||
                this.encontrarElemento('[data-action="reset"]')

            if (btnReset) {
                btnReset.click()
                await nextTick()

                this.filtros.clear()

                return {
                    exito: true,
                    mensaje: 'Todos los filtros han sido limpiados'
                }
            }

            return { exito: false, error: 'Botón de reset no encontrado' }

        } catch (error) {
            return { exito: false, error: error.message }
        }
    }

    // 📊 OBTENER ESTADO DE COMPONENTES
    obtenerEstado() {
        return {
            configurado: this.configurado,
            componentesRegistrados: this.componentes.size,
            tabsActivas: Array.from(this.tabs.entries()).filter(([, tab]) => tab.activa),
            filtrosAplicados: Array.from(this.filtros.entries()),
            ultimaAccion: this.ultimaAccion || null
        }
    }

    // 🧹 LIMPIAR ESTADO
    limpiarEstado() {
        this.tabs.clear()
        this.filtros.clear()
        this.ultimaAccion = null

        console.log('🧹 Estado del controlador limpiado')
    }
}

// 🎯 Instancia global
export const santoroComponentController = new SantoroComponentController()
export default santoroComponentController
