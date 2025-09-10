/**
 * SantoroSystemInitializer - Inicializador del Sistema Mega Preciso
 * Punto de entrada único para todo el sistema de asistente IA
 */

// Importar todos los componentes del sistema mega preciso
import { santoroActionControllerPreciso } from './santoroActionControllerPreciso.js'
import { santoroAssistantIntegratorMegaPreciso } from './santoroAssistantIntegratorMegaPreciso.js'
import { santoroAssistantExample } from './santoroAssistantExample.js'

class SantoroSystemInitializer {
    constructor() {
        this.componentes = {
            actionController: null,
            integrator: null,
            example: null,
            contextStore: null
        }

        this.inicializado = false
        this.estado = 'inicializando'

        this.autoInicializar()
    }

    async autoInicializar() {
        try {
            console.log('🚀 Inicializando Sistema Santoro Mega Preciso...')
            this.estado = 'inicializando'

            // Esperar a que el DOM esté listo
            await this.esperarDOM()

            // Inicializar componentes en orden
            await this.inicializarComponentes()

            // Conectar componentes
            await this.conectarComponentes()

            // Configurar sistema global
            this.configurarSistemaGlobal()

            this.inicializado = true
            this.estado = 'listo'

            console.log('✅ Sistema Santoro Mega Preciso inicializado exitosamente')

            // Emitir evento de sistema listo
            this.emitirEventoSistemaListo()

        } catch (error) {
            console.error('❌ Error inicializando sistema:', error)
            this.estado = 'error'
            this.manejarErrorInicializacion(error)
        }
    }

    async esperarDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve)
            } else {
                resolve()
            }
        })
    }

    async inicializarComponentes() {
        console.log('🔧 Inicializando componentes...')

        // 1. Action Controller Preciso
        try {
            this.componentes.actionController = santoroActionControllerPreciso
            await this.esperarComponente(() => this.componentes.actionController, 'ActionController')
            console.log('✅ ActionController inicializado')
        } catch (error) {
            console.warn('⚠️ Error inicializando ActionController:', error)
        }

        // 2. Assistant Integrator Mega Preciso
        try {
            this.componentes.integrator = santoroAssistantIntegratorMegaPreciso
            await this.esperarComponente(() => this.componentes.integrator?.actionController, 'Integrator')
            console.log('✅ Integrator inicializado')
        } catch (error) {
            console.warn('⚠️ Error inicializando Integrator:', error)
        }

        // 3. Example System
        try {
            this.componentes.example = santoroAssistantExample
            await this.esperarComponente(() => this.componentes.example?.integrator, 'Example')
            console.log('✅ Example System inicializado')
        } catch (error) {
            console.warn('⚠️ Error inicializando Example System:', error)
        }

        // 4. Context Store (dinámico)
        try {
            await this.inicializarContextStore()
            console.log('✅ Context Store inicializado')
        } catch (error) {
            console.warn('⚠️ Context Store no disponible:', error)
        }
    }

    async inicializarContextStore() {
        // Intentar conectar con Pinia store
        let intentos = 0
        const maxIntentos = 10

        while (intentos < maxIntentos) {
            try {
                const storeModule = await import('../stores/santoroContextStore.js')
                if (storeModule && storeModule.useSantoroContextStore) {
                    this.componentes.contextStore = storeModule.useSantoroContextStore()
                    return true
                }
            } catch {
                console.log(`Intento ${intentos + 1} de conectar Context Store...`)
            }

            intentos++
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return false
    }

    async esperarComponente(condicion, nombre, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout esperando ${nombre}`))
            }, timeout)

            const verificar = () => {
                if (condicion()) {
                    clearTimeout(timeoutId)
                    resolve(true)
                } else {
                    setTimeout(verificar, 500)
                }
            }

            verificar()
        })
    }

    async conectarComponentes() {
        console.log('🔗 Conectando componentes...')

        // Conectar integrator con action controller
        if (this.componentes.integrator && this.componentes.actionController) {
            this.componentes.integrator.actionController = this.componentes.actionController
        }

        // Conectar example con integrator
        if (this.componentes.example && this.componentes.integrator) {
            this.componentes.example.integrator = this.componentes.integrator
        }

        // Conectar todos con context store si está disponible
        if (this.componentes.contextStore) {
            if (this.componentes.actionController) {
                this.componentes.actionController.contextStore = this.componentes.contextStore
            }
            if (this.componentes.integrator) {
                this.componentes.integrator.contextStore = this.componentes.contextStore
            }
        }
    }

    configurarSistemaGlobal() {
        console.log('🌐 Configurando sistema global...')

        // Exponer sistema globalmente
        if (typeof window !== 'undefined') {
            window.santoroPreciso = {
                system: this,
                actionController: this.componentes.actionController,
                integrator: this.componentes.integrator,
                example: this.componentes.example,
                contextStore: this.componentes.contextStore,

                // Métodos de conveniencia
                ejecutarComando: (comando) => this.ejecutarComando(comando),
                obtenerEstado: () => this.obtenerEstado(),
                probarSistema: () => this.probarSistema(),
                reiniciar: () => this.reiniciar()
            }

            // Métodos legacy para compatibilidad
            window.santoroComando = (comando) => this.ejecutarComando(comando)
            window.santoroEstado = () => this.obtenerEstado()
            window.santoroPrueba = () => this.probarSistema()
        }

        // Configurar event listeners globales
        this.configurarEventListeners()
    }

    configurarEventListeners() {
        // Listener para comandos directos
        document.addEventListener('santoro-comando-directo', async (event) => {
            const { comando, parametros } = event.detail
            await this.ejecutarComando(comando, parametros)
        })

        // Listener para reinicio del sistema
        document.addEventListener('santoro-reiniciar-sistema', () => {
            this.reiniciar()
        })

        // Listener para cambios de contexto
        document.addEventListener('santoro-contexto-cambiado', (event) => {
            this.manejarCambioContexto(event.detail)
        })

        // Atajos de teclado globales
        document.addEventListener('keydown', (event) => {
            // Ctrl + Shift + S para activar asistente
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault()
                this.activarAsistente()
            }

            // Ctrl + Shift + D para mostrar estado del sistema
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault()
                this.mostrarEstado()
            }
        })
    }

    emitirEventoSistemaListo() {
        const evento = new CustomEvent('santoro-sistema-listo', {
            detail: {
                sistema: this,
                componentes: this.componentes,
                estado: this.estado,
                timestamp: new Date()
            }
        })

        document.dispatchEvent(evento)
    }

    // ========== MÉTODOS PÚBLICOS ==========

    async ejecutarComando(comando, parametros = {}) {
        if (!this.inicializado) {
            console.warn('⚠️ Sistema no inicializado')
            return { exito: false, mensaje: 'Sistema no inicializado' }
        }

        try {
            if (this.componentes.integrator) {
                return await this.componentes.integrator.procesarComando(comando, parametros)
            } else {
                throw new Error('Integrator no disponible')
            }
        } catch (error) {
            console.error('❌ Error ejecutando comando:', error)
            return {
                exito: false,
                error: error.message,
                mensaje: `Error: ${error.message}`
            }
        }
    }

    obtenerEstado() {
        return {
            inicializado: this.inicializado,
            estado: this.estado,
            componentes: {
                actionController: !!this.componentes.actionController,
                integrator: !!this.componentes.integrator,
                example: !!this.componentes.example,
                contextStore: !!this.componentes.contextStore
            },
            estadoDetallado: {
                actionController: this.componentes.actionController ? 'disponible' : 'no disponible',
                integrator: this.componentes.integrator ? 'conectado' : 'desconectado',
                contextStore: this.componentes.contextStore ? 'conectado' : 'no disponible',
                example: this.componentes.example ? 'activo' : 'inactivo'
            },
            timestamp: new Date().toLocaleString()
        }
    }

    async probarSistema() {
        console.log('🧪 Iniciando prueba completa del sistema...')

        if (!this.inicializado) {
            return { exito: false, mensaje: 'Sistema no inicializado' }
        }

        try {
            if (this.componentes.integrator && this.componentes.integrator.probarTodosLosComandos) {
                const resultado = await this.componentes.integrator.probarTodosLosComandos()
                console.log('📊 Resultado de prueba del sistema:', resultado)
                return resultado
            } else {
                // Prueba básica manual
                const comandosPrueba = [
                    'cambiar a escritorio',
                    'cambiar a móvil',
                    'abrir diagnóstico'
                ]

                const resultados = []

                for (const comando of comandosPrueba) {
                    const resultado = await this.ejecutarComando(comando)
                    resultados.push({ comando, resultado })
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }

                return {
                    exito: true,
                    mensaje: 'Prueba básica completada',
                    resultados
                }
            }
        } catch (error) {
            console.error('❌ Error en prueba del sistema:', error)
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error en prueba del sistema'
            }
        }
    }

    async reiniciar() {
        console.log('🔄 Reiniciando sistema...')

        this.inicializado = false
        this.estado = 'reiniciando'

        // Limpiar componentes
        this.componentes = {
            actionController: null,
            integrator: null,
            example: null,
            contextStore: null
        }

        // Reinicializar
        await this.autoInicializar()
    }

    activarAsistente() {
        if (this.componentes.example && this.componentes.example.activarAsistente) {
            this.componentes.example.activarAsistente()
        } else {
            const comando = prompt('🎯 Santoro Assistant Mega Preciso\n\nIngresa tu comando:')
            if (comando && comando.trim()) {
                this.ejecutarComando(comando.trim())
            }
        }
    }

    mostrarEstado() {
        const estado = this.obtenerEstado()
        console.log('📊 Estado del sistema:', estado)

        if (this.componentes.example && this.componentes.example.mostrarRespuesta) {
            this.componentes.example.mostrarRespuesta({
                exito: true,
                mensaje: `Sistema ${this.estado} - ${Object.values(estado.componentes).filter(Boolean).length}/4 componentes activos`,
                datos: estado
            })
        } else {
            alert(`Estado del sistema:\n${JSON.stringify(estado, null, 2)}`)
        }
    }

    manejarCambioContexto(detalles) {
        console.log('🔄 Contexto cambiado:', detalles)

        // Actualizar todos los componentes que necesiten saber del cambio
        if (this.componentes.actionController && this.componentes.actionController.actualizarContexto) {
            this.componentes.actionController.actualizarContexto()
        }
    }

    manejarErrorInicializacion(error) {
        console.error('💥 Error crítico en inicialización:', error)

        // Intentar modo de recuperación
        setTimeout(() => {
            console.log('🔧 Intentando recuperación automática...')
            this.reiniciar()
        }, 5000)
    }
}

// Instancia global del sistema
export const santoroSystemInitializer = new SantoroSystemInitializer()

// Auto-inicializar cuando se importe
console.log('🎯 Sistema Santoro Mega Preciso importado y auto-inicializando...')

export default santoroSystemInitializer
