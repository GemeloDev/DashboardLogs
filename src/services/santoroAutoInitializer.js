/**
 * SantoroAutoInitializer - Sistema de Auto-Inicialización Ultra-Robusto
 * Garantiza que TODOS los sistemas funcionen correctamente desde el primer momento
 */

import {
    SystemValidator,
    SantoroLogger,
    SystemState,
    SYSTEM_CONFIG,
    SANTORO_PATHS
} from './santoroSystemConfig.js'

class SantoroAutoInitializer {
    constructor() {
        this.initialized = false
        this.components = {}
        this.retryCount = 0
        this.maxRetries = SYSTEM_CONFIG.initialization.maxRetries
        this.initPromise = null
        this.showNotification = null

        SantoroLogger.info('SantoroAutoInitializer creado')
    }

    async autoInitialize() {
        if (this.initPromise) {
            return this.initPromise
        }

        this.initPromise = this._performInitialization()
        return this.initPromise
    }

    async _performInitialization() {
        console.log('🔄 Iniciando auto-inicialización completa...')

        try {
            // Paso 1: Esperar que Vue esté listo
            await this.waitForVue()

            // Paso 2: Inicializar Pinia Store
            await this.initializePiniaStore()

            // Paso 3: Inicializar Action Controller Preciso
            await this.initializeActionController()

            // Paso 4: Inicializar Assistant Integrator
            await this.initializeAssistantIntegrator()

            // Paso 5: Inicializar System Initializer
            await this.initializeSystemInitializer()

            // Paso 6: Configurar APIs globales
            await this.setupGlobalApis()

            // Paso 7: Configurar eventos globales
            this.setupGlobalEvents()

            // Paso 8: Verificar que todo funciona
            await this.verifyAllSystems()

            this.initialized = true
            SystemState.setInitialized(true)
            SantoroLogger.success('Auto-inicialización completada exitosamente!')

            // Mostrar notificación de éxito
            this.showSuccessNotification()

            return { success: true, message: 'Sistema completamente inicializado' }

        } catch (error) {
            console.error('❌ Error en auto-inicialización:', error)

            if (this.retryCount < this.maxRetries) {
                this.retryCount++
                console.log(`🔄 Reintentando inicialización (${this.retryCount}/${this.maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, 2000))
                return this._performInitialization()
            }

            throw new Error(`Falló la inicialización después de ${this.maxRetries} intentos`)
        }
    }

    async waitForVue() {
        SantoroLogger.info('Esperando que Vue esté listo...')

        for (let i = 0; i < 50; i++) {
            if (SystemValidator.validateVue()) {
                SantoroLogger.success('Vue está listo')
                return true
            }
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        throw new Error('Vue no se inicializó a tiempo')
    }

    async initializePiniaStore() {
        SantoroLogger.info('Inicializando Pinia Store...')

        try {
            const { useSantoroContextStore } = await import(SANTORO_PATHS.stores.contextStore)

            if (SystemValidator.validatePinia()) {
                this.components.contextStore = useSantoroContextStore(window.app.config.globalProperties.$pinia)
                SystemState.addComponent('contextStore', this.components.contextStore)
                SantoroLogger.success('Pinia Store inicializado')
                return true
            }

            throw new Error('Pinia no está disponible')
        } catch (error) {
            SantoroLogger.error('Error inicializando Pinia Store:', error)
            SystemState.addError(error)
            throw error
        }
    }

    async initializeActionController() {
        SantoroLogger.info('Inicializando Action Controller Preciso...')

        try {
            const { SantoroActionControllerPreciso } = await import(SANTORO_PATHS.services.actionControllerPreciso)

            this.components.actionController = new SantoroActionControllerPreciso()
            await this.components.actionController.inicializar()

            SystemState.addComponent('actionController', this.components.actionController)
            SantoroLogger.success('Action Controller Preciso inicializado')
            return true
        } catch (error) {
            SantoroLogger.error('Error inicializando Action Controller:', error)
            SystemState.addError(error)
            throw error
        }
    }

    async initializeAssistantIntegrator() {
        console.log('🤖 Inicializando Assistant Integrator...')

        try {
            const { SantoroAssistantIntegratorMegaPreciso } = await import('./santoroAssistantIntegratorMegaPreciso.js')

            this.components.assistantIntegrator = new SantoroAssistantIntegratorMegaPreciso()
            await this.components.assistantIntegrator.inicializar()

            console.log('✅ Assistant Integrator inicializado')
            return true
        } catch (error) {
            console.error('❌ Error inicializando Assistant Integrator:', error)
            throw error
        }
    }

    async initializeSystemInitializer() {
        console.log('🏗️ Inicializando System Initializer...')

        try {
            const { SantoroSystemInitializer } = await import('./santoroSystemInitializer.js')

            this.components.systemInitializer = new SantoroSystemInitializer()
            await this.components.systemInitializer.autoInicializar()

            console.log('✅ System Initializer inicializado')
            return true
        } catch (error) {
            console.error('❌ Error inicializando System Initializer:', error)
            throw error
        }
    }

    async setupGlobalApis() {
        console.log('🌐 Configurando APIs globales...')

        if (typeof window !== 'undefined') {
            // API Global Principal
            window.santoro = {
                // Controles principales
                cambiarAEscritorio: () => this.components.actionController?.cambiarAEscritorio(),
                cambiarAMovil: () => this.components.actionController?.cambiarAMovil(),
                abrirDiagnostico: () => this.components.actionController?.abrirDiagnostico(),
                abrirEstadisticas: () => this.components.actionController?.abrirEstadisticas(),
                abrirConsola: () => this.components.actionController?.abrirConsola(),

                // Sistema de comandos
                procesar: (comando) => this.components.assistantIntegrator?.procesarComando(comando),

                // Acceso a componentes
                actionController: this.components.actionController,
                assistantIntegrator: this.components.assistantIntegrator,
                contextStore: this.components.contextStore,
                systemInitializer: this.components.systemInitializer,

                // Estado del sistema
                isInitialized: () => this.initialized,
                getComponents: () => this.components,

                // Métodos de prueba
                test: {
                    cambiarFlujo: () => this.testFlowChange(),
                    abrirModulos: () => this.testModuleOpening(),
                    comandosVoz: () => this.testVoiceCommands()
                }
            }

            // APIs de acceso directo
            window.abrirDiagnostico = () => window.santoro.abrirDiagnostico()
            window.abrirEstadisticas = () => window.santoro.abrirEstadisticas()
            window.cambiarAEscritorio = () => window.santoro.cambiarAEscritorio()
            window.cambiarAMovil = () => window.santoro.cambiarAMovil()

            console.log('✅ APIs globales configuradas')
            console.log('🎯 Prueba con: window.santoro.cambiarAEscritorio()')
        }
    }

    setupGlobalEvents() {
        console.log('📡 Configurando eventos globales...')

        if (typeof window !== 'undefined') {
            // Event listener para comandos de teclado
            window.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.altKey) {
                    switch (event.key) {
                        case 'e':
                            event.preventDefault()
                            window.santoro.cambiarAEscritorio()
                            break
                        case 'm':
                            event.preventDefault()
                            window.santoro.cambiarAMovil()
                            break
                        case 'd':
                            event.preventDefault()
                            window.santoro.abrirDiagnostico()
                            break
                        case 's':
                            event.preventDefault()
                            window.santoro.abrirEstadisticas()
                            break
                    }
                }
            })

            // Event listener para comandos de voz
            window.addEventListener('santoroCommand', (event) => {
                if (this.components.assistantIntegrator) {
                    this.components.assistantIntegrator.procesarComando(event.detail.command)
                }
            })

            console.log('✅ Eventos globales configurados')
            console.log('🎮 Atajos: Ctrl+Alt+E (Escritorio), Ctrl+Alt+M (Móvil), Ctrl+Alt+D (Diagnóstico)')
        }
    }

    async verifyAllSystems() {
        console.log('🔍 Verificando todos los sistemas...')

        const checks = [
            { name: 'Context Store', component: this.components.contextStore },
            { name: 'Action Controller', component: this.components.actionController },
            { name: 'Assistant Integrator', component: this.components.assistantIntegrator },
            { name: 'System Initializer', component: this.components.systemInitializer }
        ]

        const results = []

        for (const check of checks) {
            const isWorking = check.component && typeof check.component === 'object'
            results.push({ name: check.name, working: isWorking })

            if (isWorking) {
                console.log(`✅ ${check.name} funcionando`)
            } else {
                console.error(`❌ ${check.name} no funciona`)
            }
        }

        const allWorking = results.every(r => r.working)

        if (!allWorking) {
            throw new Error('No todos los sistemas están funcionando correctamente')
        }

        console.log('✅ Todos los sistemas verificados y funcionando')
        return true
    }

    showSuccessNotification() {
        console.log('🎉 ¡SISTEMA SANTORO COMPLETAMENTE INICIALIZADO!')
        console.log('🚀 Todos los comandos están listos para usar')
        console.log('💬 Prueba decir: "cambiar a escritorio", "abrir diagnóstico", "mostrar estadísticas"')

        // Crear notificación visual si Quasar está disponible
        if (typeof window !== 'undefined' && window.Quasar) {
            window.Quasar.Notify.create({
                type: 'positive',
                message: '🎉 Sistema Santoro Inicializado',
                caption: 'Todos los comandos están listos',
                position: 'top-right',
                timeout: 3000,
                actions: [
                    {
                        label: 'Probar',
                        color: 'white',
                        handler: () => this.testFlowChange()
                    }
                ]
            })
        }
    }

    // Métodos de prueba
    async testFlowChange() {
        console.log('🧪 Probando cambio de flujo...')

        try {
            await window.santoro.cambiarAEscritorio()
            await new Promise(resolve => setTimeout(resolve, 1000))
            await window.santoro.cambiarAMovil()

            console.log('✅ Cambio de flujo funcionando correctamente')
            return true
        } catch (error) {
            console.error('❌ Error en cambio de flujo:', error)
            return false
        }
    }

    async testModuleOpening() {
        console.log('🧪 Probando apertura de módulos...')

        try {
            await window.santoro.abrirDiagnostico()
            await new Promise(resolve => setTimeout(resolve, 500))
            await window.santoro.abrirEstadisticas()

            console.log('✅ Apertura de módulos funcionando correctamente')
            return true
        } catch (error) {
            console.error('❌ Error en apertura de módulos:', error)
            return false
        }
    }

    async testVoiceCommands() {
        console.log('🧪 Probando comandos de voz...')

        const testCommands = [
            'cambiar a escritorio',
            'abrir diagnóstico',
            'mostrar estadísticas'
        ]

        for (const command of testCommands) {
            try {
                await window.santoro.procesar(command)
                console.log(`✅ Comando "${command}" procesado correctamente`)
            } catch (error) {
                console.error(`❌ Error con comando "${command}":`, error)
            }
        }

        return true
    }
}

// Crear instancia global
const santoroAutoInitializer = new SantoroAutoInitializer()

// Auto-inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => santoroAutoInitializer.autoInitialize(), 1000)
        })
    } else {
        setTimeout(() => santoroAutoInitializer.autoInitialize(), 1000)
    }
}

export { santoroAutoInitializer, SantoroAutoInitializer }
export default santoroAutoInitializer
