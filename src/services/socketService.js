/**
 * ════════════════════════════════════════════════════════════════
 * SERVICIO DE WEBSOCKET CON STOMP
 * ════════════════════════════════════════════════════════════════
 *
 * Maneja conexiones WebSocket usando el protocolo STOMP.
 * La URL del WebSocket se obtiene de la configuración central.
 *
 * ════════════════════════════════════════════════════════════════
 */

import { Client } from '@stomp/stompjs'
import { getJWTData } from './cookieService'
import { WS_BASE_URL, isDebug } from 'src/config/env'

let stompClient = null
let connected = false

// URL del WebSocket desde configuración central
const brokerURL = WS_BASE_URL

if (isDebug) {
  console.log('🔌 WebSocket URL configurada:', brokerURL)
}

/**
 * Convierte un "eventName" en un destino STOMP para suscribirse
 */
function eventToDestination(eventName) {
  return `/topic/${eventName}`
}

/**
 * Conecta el STOMP sin suscribirse a ningún topic específico.
 * Útil para inicializar la conexión en el dashboard.
 */
export function connectSocket({ endpoint = brokerURL, debug = isDebug, reconnectDelay = 3000 } = {}) {
  if (stompClient && connected) return // ya conectado

  stompClient = new Client({
    brokerURL: endpoint,
    reconnectDelay,
    debug: (msg) => { if (debug) console.log('[STOMP DEBUG]', msg) },
    onConnect: () => {
      connected = true
      console.log('✅ STOMP dashboard conectado.')
    },
    onStompError: (frame) => {
      console.error('🚨 Error STOMP:', frame.headers['message'])
    },
    onWebSocketClose: (evt) => {
      connected = false
      console.warn('❌ STOMP desconectado:', evt.reason || 'Conexión cerrada')
    },
    onWebSocketError: (err) => {
      console.error('🚨 Error WebSocket:', err)
    },
  })

  stompClient.activate()
}

/**
 * Inicializa STOMP sobre WebSocket
 */
export function initializeSocket(
  subscribeTopic = 'qr-login/',
  onMessageReceived = () => {},
  { endpoint = brokerURL, debug = isDebug, reconnectDelay = 3000 } = {},
) {
  if (stompClient && connected) return stompClient

  stompClient = new Client({
    brokerURL: endpoint,
    reconnectDelay,
    debug: (msg) => {
      if (debug) console.log('[STOMP DEBUG]', msg)
    },
    onConnect: () => {
      connected = true
      console.log('✅ STOMP conectado exitosamente.')

      const topic = eventToDestination(subscribeTopic)
      console.log('Suscribiéndose a:', topic)

      stompClient.subscribe(topic, (message) => {
        console.log(`Received:`, JSON.parse(message.body))
        const payload = JSON.parse(message.body)
        const data = getJWTData(payload.accessToken)
        onMessageReceived({
          payload,
          data,
        })
      })
    },
    onStompError: (frame) => {
      console.error('🚨 Error STOMP:', frame.headers['message'])
      console.error('Detalles:', frame.body)
    },
    onWebSocketClose: (evt) => {
      connected = false
      console.warn('❌ STOMP desconectado:', evt.reason || 'Conexión cerrada')
    },
    onWebSocketError: (err) => {
      console.error('🚨 Error WebSocket:', err)
    },
  })

  stompClient.activate()
  return stompClient
}

// Suscribirse a alertas de un tenant especifico
export function subscribeToAlerts(tenantId, onAlert = () => {}) {
  if (!stompClient || !connected) {
    // Reintentar cuando se conecte
    setTimeout(() => subscribeToAlerts(tenantId, onAlert), 2000)
    return
  }

  const topic = `/topic/alerts/${tenantId}`
  console.log('[STOMP] Suscribiéndose a alertas:', topic)

  stompClient.subscribe(topic, (message) => {
    try {
      const payload = JSON.parse(message.body)
      if (payload.type === 'ALERT_CRIT') {
        onAlert(payload)
      }
    } catch (e) {
      console.error('[STOMP] Error parseando alerta:', e)
    }
  })
}

/**
 * Suscribirse a nuevos logs de un sistema específico.
 */
export function subscribeToNewLogs(tenantId, system, onNewLogs = () => {}, _retries = 0) {
  // Máximo 5 reintentos (10 segundos) para evitar loops
  if (!stompClient || !connected) {
    if (_retries >= 5) {
      console.warn('[STOMP] No se pudo suscribir a', system, '— sin conexión después de 5 intentos')
      return null
    }
    const timer = setTimeout( 
      () => subscribeToNewLogs(tenantId, system, onNewLogs, _retries + 1),
      2000
    )
    // Devolver objeto cancelable para que subscribeSystem pueda limpiar el retry
    return { unsubscribe: () => clearTimeout(timer) }
  }

  const topic = `/topic/dashboard/${tenantId}/${system}`
  console.log('[STOMP] Suscribiéndose a nuevos logs:', topic)

  const subscription = stompClient.subscribe(topic, (message) => {
    try {
      const payload = JSON.parse(message.body)
      if (payload.type === 'NEW_LOGS') {
        onNewLogs(payload)
      }
    } catch (e) {
      console.error('[STOMP] Error parseando mensaje de logs:', e)
    }
  })

  return subscription
}

/**
 * Cerrar conexión STOMP
 */
export function disconnectSocket() {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    connected = false
    console.log('🔌 STOMP desconectado manualmente')
  }
}

/**
 * Obtener el cliente STOMP directamente (para usos avanzados)
 */
export function getSocket() {
  return stompClient
}
