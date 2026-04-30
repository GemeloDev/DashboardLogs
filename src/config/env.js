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

import { Capacitor } from '@capacitor/core'

// ─── Detección de Ambiente ───────────────────────────────────────
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const isDevelopment = NODE_ENV === 'development'
export const isProduction = NODE_ENV === 'production'
export const isDebug = process.env.DEBUG_MODE === 'true' || isDevelopment

const isBrowserRuntime = typeof window !== 'undefined'
const isLiveReloadRuntime =
  isDevelopment && isBrowserRuntime && window.location.port === '9000'
const isPackagedNativeRuntime = Capacitor.isNativePlatform() && !isLiveReloadRuntime

// ─── URLs del Backend ─────────────────────────────────────────────
export const API_BASE_URL = resolveApiBaseURL()
export const WS_BASE_URL = resolveWebSocketURL()

// ─── Configuración de la Aplicación ──────────────────────────────
export const APP_NAME = process.env.APP_NAME || 'Dashboard Logs'
export const APP_VERSION = process.env.APP_VERSION || '1.0.0'
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10)

// ─── WebSocket ────────────────────────────────────────────────────
export const SOCKET_TOPIC = process.env.SOCKET_TOPIC || '/topic/qr-login'

/**
 * Genera la URL de WebSocket basándose en el API_BASE_URL
 * Si no se proporciona WS_BASE_URL, se calcula automáticamente
 */
function resolveApiBaseURL() {
  if (isDevelopment && !isPackagedNativeRuntime) {
    return '/api'
  }

  return process.env.API_BASE_URL || '/api'
}

function resolveWebSocketURL() {
  if (isDevelopment && !isPackagedNativeRuntime) {
    return getDefaultWebSocketURL('/api')
  }

  return process.env.WS_BASE_URL || getDefaultWebSocketURL(API_BASE_URL)
}

function getDefaultWebSocketURL(apiBaseURL) {
  // Si API_BASE_URL es relativa, usar el host actual
  if (apiBaseURL.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws`
  }

  try {
    // Si API_BASE_URL es absoluta, extraer el host y construir WS URL
    const apiUrl = new URL(apiBaseURL)
    const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProtocol}//${apiUrl.host}/ws`
  } catch {
    // Fallback si la URL no es válida
    return 'ws://localhost:8080/ws'
  }
}

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
