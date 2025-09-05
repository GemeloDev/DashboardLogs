// 🎭 SANTORO MODAL CONTROLLER - Control completo de modales y diálogos
// Permite a Santoro abrir, cerrar y controlar cualquier modal del sistema

import { useQuasar } from 'quasar'

class SantoroModalController {
    constructor() {
        this.modalesActivos = new Map()
        this.componentesRegistrados = new Map()
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

                case 'busqueda':
                case 'búsqueda':
                case 'search':
                    return await this.abrirBusqueda(parametros)

                case 'exportar':
                case 'export':
                    return await this.abrirExportacion(parametros)

                case 'ayuda':
                case 'help':
                    return await this.abrirAyuda(parametros)

                case 'configuracion':
                case 'configuración':
                case 'settings':
                    return await this.abrirConfiguracion(parametros)

                case 'grafico':
                case 'gráfico':
                case 'chart':
                    return await this.abrirGrafico(parametros)

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
        const $q = useQuasar()

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

        $q.notify({
            type: 'info',
            message: '🏥 Abriendo diagnóstico avanzado...',
            position: 'top-right'
        })

        return {
            exito: true,
            mensaje: 'Abriendo modal de diagnóstico',
            accionEjecutada: 'abrir_diagnostico'
        }
    }

    // 🔍 ABRIR MODAL DE DETALLE
    async abrirDetalle(parametros = {}) {
        const $q = useQuasar()

        if (!parametros.datos) {
            return {
                exito: false,
                mensaje: 'No hay datos para mostrar en el detalle'
            }
        }

        const detalleHTML = this.formatearDatosDetalle(parametros.datos)

        $q.dialog({
            title: '🔍 Detalles - Santoro IA',
            message: detalleHTML,
            html: true,
            style: 'max-width: 90vw; max-height: 80vh',
            ok: 'Cerrar',
            class: 'santoro-modal-detalle'
        })

        return {
            exito: true,
            mensaje: 'Modal de detalle abierto',
            accionEjecutada: 'mostrar_detalle'
        }
    }

    // 🔍 ABRIR FILTROS AVANZADOS
    async abrirFiltros() {
        const $q = useQuasar()

        $q.dialog({
            title: '🔍 Filtros Inteligentes - Santoro',
            message: `
                <div style="line-height: 1.6;">
                    <h6>⚡ Filtros Rápidos</h6>
                    <div class="q-gutter-sm q-mb-md">
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--outline text-primary" onclick="window.santoroFiltrar('hoy')">Hoy</button>
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--outline text-primary" onclick="window.santoroFiltrar('ayer')">Ayer</button>
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--outline text-primary" onclick="window.santoroFiltrar('semana')">Esta Semana</button>
                    </div>

                    <h6>🎯 Filtros por Tipo</h6>
                    <div class="q-gutter-sm">
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--outline text-secondary" onclick="window.santoroFiltrar('errores')">Solo Errores</button>
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--outline text-secondary" onclick="window.santoroFiltrar('exitosos')">Solo Exitosos</button>
                    </div>
                </div>
            `,
            html: true,
            persistent: false,
            ok: 'Cerrar'
        })

        // Configurar callbacks globales para los botones
        window.santoroFiltrar = (tipo) => {
            this.aplicarFiltroRapido(tipo)
        }

        return {
            exito: true,
            mensaje: 'Filtros avanzados abiertos',
            accionEjecutada: 'abrir_filtros'
        }
    }

    // 🔍 ABRIR BÚSQUEDA AVANZADA
    async abrirBusqueda(parametros = {}) {
        const $q = useQuasar()

        $q.dialog({
            title: '🔍 Búsqueda Inteligente - Santoro',
            prompt: {
                model: parametros.valorInicial || '',
                label: 'Búsqueda inteligente',
                hint: 'Ej: error USR123, eventos de ayer, usuario Juan',
                type: 'text'
            },
            ok: 'Buscar',
            cancel: 'Cancelar'
        }).onOk((busqueda) => {
            if (busqueda) {
                this.ejecutarBusquedaInteligente(busqueda)
            }
        })

        return {
            exito: true,
            mensaje: 'Búsqueda avanzada abierta',
            accionEjecutada: 'abrir_busqueda'
        }
    }

    // 📊 ABRIR MODAL DE GRÁFICO
    async abrirGrafico(parametros = {}) {
        const $q = useQuasar()

        if (!parametros.datos || parametros.datos.length === 0) {
            $q.notify({
                type: 'warning',
                message: '📊 No hay datos para mostrar en el gráfico',
                position: 'top-right'
            })
            return { exito: false, mensaje: 'Sin datos para graficar' }
        }

        // Crear contenido del gráfico
        const graficoHTML = this.generarHTMLGrafico(parametros.datos, parametros.tipo)

        $q.dialog({
            title: '📊 Gráfico Generado por Santoro',
            message: graficoHTML,
            html: true,
            style: 'min-width: 70vw; min-height: 60vh',
            ok: 'Cerrar',
            class: 'santoro-modal-grafico'
        })

        return {
            exito: true,
            mensaje: `Gráfico mostrado con ${parametros.datos.length} registros`,
            accionEjecutada: 'mostrar_grafico'
        }
    }

    // 📁 ABRIR MODAL DE EXPORTACIÓN
    async abrirExportacion(parametros = {}) {
        const $q = useQuasar()

        $q.dialog({
            title: '📁 Exportar Datos - Santoro',
            message: `
                <div style="line-height: 1.6;">
                    <h6>📊 Formatos Disponibles</h6>
                    <div class="q-gutter-sm q-mb-md">
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--unelevated bg-green text-white" onclick="window.santoroExportar('csv')">📄 CSV</button>
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--unelevated bg-blue text-white" onclick="window.santoroExportar('excel')">📊 Excel</button>
                        <button class="q-btn q-btn--dense q-btn--rounded q-btn--unelevated bg-red text-white" onclick="window.santoroExportar('pdf')">📕 PDF</button>
                    </div>

                    <p><strong>Datos a exportar:</strong> ${parametros.cantidad || 0} registros</p>
                    <p><strong>Filtros aplicados:</strong> ${parametros.filtros || 'Ninguno'}</p>
                </div>
            `,
            html: true,
            ok: 'Cancelar'
        })

        // Configurar callback de exportación
        window.santoroExportar = (formato) => {
            this.ejecutarExportacion(formato, parametros)
        }

        return {
            exito: true,
            mensaje: 'Modal de exportación abierto',
            accionEjecutada: 'abrir_exportacion'
        }
    }

    // 💡 ABRIR AYUDA
    async abrirAyuda() {
        const $q = useQuasar()

        const ayudaHTML = `
            <div style="line-height: 1.6;">
                <h6>🤖 Comandos de Santoro</h6>
                <ul>
                    <li><strong>"abre diagnóstico"</strong> - Abrir modal de diagnóstico</li>
                    <li><strong>"ve a estadísticas"</strong> - Navegar a página</li>
                    <li><strong>"busca error USR123"</strong> - Buscar códigos específicos</li>
                    <li><strong>"eventos de hoy"</strong> - Ver actividad reciente</li>
                    <li><strong>"exporta datos"</strong> - Generar reportes</li>
                    <li><strong>"abre filtros"</strong> - Filtros avanzados</li>
                </ul>

                <h6>🎯 Comandos de Navegación</h6>
                <ul>
                    <li><strong>"ve a inicio"</strong> - Página principal</li>
                    <li><strong>"abre eventos fallidos"</strong> - Página de errores</li>
                    <li><strong>"muestra estadísticas"</strong> - Gráficas y métricas</li>
                    <li><strong>"regresa"</strong> - Página anterior</li>
                </ul>

                <h6>🎤 Comandos por Voz</h6>
                <p>Presiona el micrófono y di cualquier comando</p>
            </div>
        `

        $q.dialog({
            title: '💡 Ayuda de Santoro IA',
            message: ayudaHTML,
            html: true,
            style: 'max-width: 80vw',
            ok: 'Entendido'
        })

        return {
            exito: true,
            mensaje: 'Ayuda mostrada',
            accionEjecutada: 'mostrar_ayuda'
        }
    }

    // 🔧 ABRIR MODAL GENÉRICO
    async abrirModalGenerico(tipo) {
        const $q = useQuasar()

        $q.dialog({
            title: `🔧 ${tipo} - Santoro`,
            message: `Modal genérico: ${tipo}`,
            ok: 'Cerrar'
        })

        return {
            exito: true,
            mensaje: `Modal ${tipo} abierto`,
            accionEjecutada: 'abrir_modal_generico'
        }
    }

    // 🛠️ MÉTODOS AUXILIARES

    formatearDatosDetalle(datos) {
        if (Array.isArray(datos)) {
            return `
                <div>
                    <h6>📊 Resumen de Datos</h6>
                    <p><strong>Total de registros:</strong> ${datos.length}</p>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <pre>${JSON.stringify(datos.slice(0, 3), null, 2)}</pre>
                        ${datos.length > 3 ? `<p><em>... y ${datos.length - 3} registros más</em></p>` : ''}
                    </div>
                </div>
            `
        }

        return `
            <div style="max-height: 400px; overflow-y: auto;">
                <pre>${JSON.stringify(datos, null, 2)}</pre>
            </div>
        `
    }

    generarHTMLGrafico(datos) {
        const stats = this.calcularEstadisticas(datos)

        return `
            <div>
                <h6>📊 Análisis Visual de Datos</h6>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div class="row">
                        <div class="col"><strong>Total:</strong> ${stats.total}</div>
                        <div class="col"><strong>Promedio:</strong> ${stats.promedio}</div>
                        <div class="col"><strong>Máximo:</strong> ${stats.maximo}</div>
                    </div>
                </div>

                <p><em>🎯 Gráfico interactivo se cargaría aquí con Chart.js</em></p>
                <p>Datos procesados: ${datos.length} registros</p>

                <div style="margin-top: 15px;">
                    <button class="q-btn q-btn--dense q-btn--rounded q-btn--unelevated bg-purple text-white" onclick="window.santoroExportarGrafico()">
                        📊 Exportar Gráfico
                    </button>
                </div>
            </div>
        `
    }

    calcularEstadisticas(datos) {
        const valores = datos.filter(d => typeof d === 'number')
        return {
            total: datos.length,
            promedio: valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : 0,
            maximo: valores.length > 0 ? Math.max(...valores) : 0
        }
    }

    async aplicarFiltroRapido(tipo) {
        const $q = useQuasar()

        $q.notify({
            type: 'info',
            message: `🎯 Aplicando filtro: ${tipo}`,
            position: 'top-right'
        })

        // Emitir evento para aplicar filtro
        window.dispatchEvent(new CustomEvent('santoro-aplicar-filtro', {
            detail: { tipo }
        }))
    }

    async ejecutarBusquedaInteligente(busqueda) {
        // Reenviar a Santoro AI para procesar
        window.dispatchEvent(new CustomEvent('santoro-busqueda-inteligente', {
            detail: { busqueda }
        }))
    }

    async ejecutarExportacion(formato) {
        const $q = useQuasar()

        $q.loading.show({ message: `📁 Exportando en formato ${formato}...` })

        // Simular exportación
        setTimeout(() => {
            $q.loading.hide()
            $q.notify({
                type: 'positive',
                message: `📁 Archivo ${formato.toUpperCase()} descargado`,
                position: 'top-right'
            })
        }, 2000)
    }
}

// 🎯 Instancia global
export const santoroModalController = new SantoroModalController()
export default santoroModalController
