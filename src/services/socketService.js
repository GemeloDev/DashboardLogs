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
