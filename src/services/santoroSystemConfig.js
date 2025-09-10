/**
 * SantoroSystemConfig - Configuración Global del Sistema
 * Asegura que todos los imports y dependencias estén correctamente configurados
 */

// Configuración de rutas de archivos
export const SANTORO_PATHS = {
  stores: {
    contextStore: '../stores/santoroContextStore.js'
  },
  services: {
    actionController: './santoroActionController.js',
    actionControllerPreciso: './santoroActionControllerPreciso.js',
    assistantIntegrator: './santoroAssistantIntegratorMegaPreciso.js',
    systemInitializer: './santoroSystemInitializer.js',
    autoInitializer: './santoroAutoInitializer.js',
    filtroDateController: './santoroFiltroDateController.js',
    modalController: './santoroModalControllerSimple.js',
    voiceService: './santoroVoiceService.js'
  },
  components: {
    escritorioDiagnostico: '../components/escritorio/EscritorioDiagnostico.vue',
    escritorioGraficas: '../components/escritorio/EscritorioGraficasEnhanced.vue',
    escritorioConsola: '../components/escritorio/EscritorioConsola.vue'
  }
}

// Configuración de APIs globales
export const GLOBAL_API_CONFIG = {
  // Comandos principales
  commands: {
    'cambiar a escritorio': 'cambiarAEscritorio',
    'cambiar a móvil': 'cambiarAMovil',
    'cambiar a mobile': 'cambiarAMovil',
    'ir a escritorio': 'cambiarAEscritorio',
    'ir a móvil': 'cambiarAMovil',
    'abrir diagnóstico': 'abrirDiagnostico',
    'mostrar diagnóstico': 'abrirDiagnostico',
    'abrir estadísticas': 'abrirEstadisticas',
    'mostrar estadísticas': 'abrirEstadisticas',
    'abrir consola': 'abrirConsola',
    'mostrar consola': 'abrirConsola'
  },

  // Atajos de teclado
  shortcuts: {
    'Ctrl+Alt+E': 'cambiarAEscritorio',
    'Ctrl+Alt+M': 'cambiarAMovil',
    'Ctrl+Alt+D': 'abrirDiagnostico',
    'Ctrl+Alt+S': 'abrirEstadisticas',
    'Ctrl+Alt+C': 'abrirConsola'
  },

  // Eventos personalizados
  events: {
    flowChange: 'santoro-cambiar-flujo',
    openModule: 'santoro-abrir-modulo',
    processCommand: 'santoro-comando',
    systemReady: 'santoro-sistema-listo'
  }
}

// Configuración de timeouts y reintentos
export const SYSTEM_CONFIG = {
  initialization: {
    maxRetries: 5,
    retryDelay: 2000,
    componentLoadTimeout: 10000,
    systemReadyTimeout: 15000
  },

  api: {
    responseTimeout: 5000,
    commandProcessingTimeout: 10000
  },

  ui: {
    notificationTimeout: 3000,
    transitionDelay: 300,
    modalOpenDelay: 100
  }
}

// Funciones de utilidad para validar el sistema
export const SystemValidator = {
  /**
   * Valida que Vue esté disponible
   */
  validateVue() {
    return typeof window !== 'undefined' &&
      window.app &&
      window.app.config &&
      window.app.config.globalProperties
  },

  /**
   * Valida que Pinia esté disponible
   */
  validatePinia() {
    return this.validateVue() &&
      window.app.config.globalProperties.$pinia
  },

  /**
   * Valida que Quasar esté disponible
   */
  validateQuasar() {
    return typeof window !== 'undefined' &&
      window.Quasar
  },

  /**
   * Valida que un componente esté disponible
   */
  async validateComponent(componentPath) {
    try {
      const module = await import(componentPath)
      return module && Object.keys(module).length > 0
    } catch (error) {
      console.error(`Error validando componente ${componentPath}:`, error)
      return false
    }
  },

  /**
   * Valida que el DOM esté listo
   */
  validateDOMReady() {
    return typeof document !== 'undefined' &&
      document.readyState === 'complete'
  },

  /**
   * Ejecuta todas las validaciones básicas
   */
  async validateAll() {
    const checks = [
      { name: 'Vue', validator: () => this.validateVue() },
      { name: 'Pinia', validator: () => this.validatePinia() },
      { name: 'Quasar', validator: () => this.validateQuasar() },
      { name: 'DOM', validator: () => this.validateDOMReady() }
    ]

    const results = {}

    for (const check of checks) {
      try {
        results[check.name] = await check.validator()
      } catch (error) {
        console.error(`Error validando ${check.name}:`, error)
        results[check.name] = false
      }
    }

    return results
  }
}

// Configuración de logs
export const LOG_CONFIG = {
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },

  currentLevel: 2, // INFO por defecto

  prefix: '[SANTORO]',

  colors: {
    ERROR: '#f44336',
    WARN: '#ff9800',
    INFO: '#2196f3',
    DEBUG: '#4caf50'
  }
}

// Logger personalizado
export const SantoroLogger = {
  error(...args) {
    if (LOG_CONFIG.currentLevel >= LOG_CONFIG.levels.ERROR) {
      console.error(`${LOG_CONFIG.prefix} ERROR:`, ...args)
    }
  },

  warn(...args) {
    if (LOG_CONFIG.currentLevel >= LOG_CONFIG.levels.WARN) {
      console.warn(`${LOG_CONFIG.prefix} WARN:`, ...args)
    }
  },

  info(...args) {
    if (LOG_CONFIG.currentLevel >= LOG_CONFIG.levels.INFO) {
      console.log(`${LOG_CONFIG.prefix} INFO:`, ...args)
    }
  },

  debug(...args) {
    if (LOG_CONFIG.currentLevel >= LOG_CONFIG.levels.DEBUG) {
      console.log(`${LOG_CONFIG.prefix} DEBUG:`, ...args)
    }
  },

  success(...args) {
    console.log(`%c${LOG_CONFIG.prefix} SUCCESS:`, `color: ${LOG_CONFIG.colors.DEBUG}`, ...args)
  }
}

// Configuración de estado del sistema
export const SystemState = {
  initialized: false,
  components: {},
  errors: [],

  setInitialized(value) {
    this.initialized = value
    if (value) {
      SantoroLogger.success('Sistema completamente inicializado')
    }
  },

  addComponent(name, component) {
    this.components[name] = component
    SantoroLogger.info(`Componente ${name} registrado`)
  },

  addError(error) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message || error,
      stack: error.stack
    })
    SantoroLogger.error('Error registrado:', error)
  },

  getStatus() {
    return {
      initialized: this.initialized,
      componentCount: Object.keys(this.components).length,
      errorCount: this.errors.length,
      components: Object.keys(this.components)
    }
  }
}

export default {
  SANTORO_PATHS,
  GLOBAL_API_CONFIG,
  SYSTEM_CONFIG,
  SystemValidator,
  LOG_CONFIG,
  SantoroLogger,
  SystemState
}
