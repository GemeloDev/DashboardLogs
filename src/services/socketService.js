// stompSocketService.js
import { Client } from '@stomp/stompjs'
import { getJWTData } from './cookieService'
import { API_BASE_URL } from './apiConfig'

let stompClient = null
let connected = false

// Construir URL del WebSocket desde la configuración del API
function getWebSocketURL() {
  // Si API_BASE_URL es una ruta relativa (desarrollo), usar el host actual
  if (API_BASE_URL.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    return `${protocol}://${host}/ws`
  }

  // Si es una URL absoluta (producción), extraer el host y usar wss
  try {
    const apiUrl = new URL(API_BASE_URL)
    // Convertir https://api-logs.grupo-santoro.com.mx/api -> wss://api-logs.grupo-santoro.com.mx/ws
    const protocol = apiUrl.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${apiUrl.host}/ws`
  } catch (e) {
    console.error('Error al construir WebSocket URL:', e)
    // Fallback
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    return `${protocol}://${host}/ws`
  }
}

const brokerURL = getWebSocketURL()

console.log('🔌 WebSocket URL configurada:', brokerURL)

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
  { endpoint = brokerURL, debug = false, reconnectDelay = 3000 } = {},
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
