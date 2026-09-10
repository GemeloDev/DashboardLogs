/**
 * ════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN CENTRAL DE VARIABLES DE ENTORNO
 * ════════════════════════════════════════════════════════════════
 *
 * ÚNICO PUNTO DE VERDAD para todas las configuraciones del proyecto.
 *
 * Lee variables de:
 *   - .env                 (común a todos los ambientes)
 *   - .env.development     (solo en desarrollo)
 *   - .env.production      (solo en producción)
 *
 * Todas las variables de entorno están disponibles en `process.env`
 * gracias a la configuración de Quasar.
 *
 * IMPORTANTE:
 * - Todos los servicios deben importar desde AQUÍ
 * - NO importar process.env directamente en otros archivos
 * - NO hardcodear URLs en ningún lugar
 *
 * Uso:
 *   import { API_BASE_URL, WS_BASE_URL, isProduction } from 'src/config/env'
 * ════════════════════════════════════════════════════════════════
 */

// ─── Detección de Ambiente ───────────────────────────────────────
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const isDevelopment = NODE_ENV === 'development'
export const isProduction = NODE_ENV === 'production'
export const isDebug = process.env.DEBUG_MODE === 'true' || isDevelopment

// ─── URLs del Backend ─────────────────────────────────────────────
// URL base sanitizada: elimina barras diagonales al final para evitar //.
const rawApiUrl = (process.env.API_BASE_URL || 'http://187.188.66.56:8040').replace(/\/+$/, '')
const rawWsUrl = (process.env.WS_BASE_URL || 'ws://187.188.66.56:8040/ws').replace(/\/+$/, '')

// En desarrollo local usamos el proxy de Vite para evitar contenido mixto.
// En producción u otros ambientes se usa la URL absoluta del backend.
export const API_BASE_URL = isDevelopment ? '/api' : rawApiUrl
export const WS_BASE_URL = isDevelopment ? 'ws://187.188.66.56:8040/ws' : rawWsUrl

// ─── Configuración de la Aplicación ──────────────────────────────
export const APP_NAME = process.env.APP_NAME || 'Dashboard Logs'
export const APP_VERSION = process.env.APP_VERSION || '1.0.0'
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10)

// ─── WebSocket ────────────────────────────────────────────────────
export const SOCKET_TOPIC = process.env.SOCKET_TOPIC || '/topic/qr-login'

/**
 * Objeto de configuración global
 * Útil para pasar toda la configuración de una vez
 */
export const config = {
  env: NODE_ENV,
  isDevelopment,
  isProduction,
  isDebug,
  app: {
    name: APP_NAME,
    version: APP_VERSION,
  },
  api: {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
  },
  websocket: {
    baseURL: WS_BASE_URL,
    topic: SOCKET_TOPIC,
  },
}

/**
 * Log de configuración (solo en modo debug)
 */
if (isDebug) {
  console.group('🔧 Configuración del Ambiente')
  console.log('Ambiente:', NODE_ENV)
  console.log('API Base URL:', API_BASE_URL)
  console.log('WebSocket URL:', WS_BASE_URL)
  console.log('Debug Mode:', isDebug)
  console.groupEnd()
}

export default config
