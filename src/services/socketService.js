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
const connectListeners = new Set()

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

function notifyConnectListeners() {
  connectListeners.forEach((listener) => {
    try {
      listener(stompClient)
    } catch (err) {
      console.error('[STOMP] Error en listener de conexión:', err)
    }
  })
}

export function onSocketConnect(listener) {
  if (typeof listener !== 'function') return () => {}
  connectListeners.add(listener)
  return () => connectListeners.delete(listener)
}

/**
 * Conecta el STOMP sin suscribirse a ningún topic específico.
 * Útil para inicializar la conexión en el dashboard.
 */
export function connectSocket({ endpoint = brokerURL, debug = isDebug, reconnectDelay = 3000 } = {}) {
  if (stompClient?.connected && connected) return stompClient
  if (stompClient?.active) return stompClient

  stompClient = new Client({
    brokerURL: endpoint,
    reconnectDelay,
    debug: (msg) => { if (debug) console.log('[STOMP DEBUG]', msg) },
    onConnect: () => {
      connected = true
      notifyConnectListeners()
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
  return stompClient
}

export function isSocketConnected() {
  return !!stompClient?.connected && connected
}

export function ensureSocketConnected(options = {}) {
  if (isSocketConnected()) return stompClient

  if (!stompClient || !stompClient.active) {
    return connectSocket(options)
  }

  return stompClient
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
      notifyConnectListeners()
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
 * El backend envía mensajes a este topic cuando llegan logs nuevos.
 */
export function subscribeToNewLogs(tenantId, system, onNewLogs = () => {}) {
  if (!stompClient || !connected) {
    ensureSocketConnected()
    let cancelled = false
    let subscription = null
    const retry = () => {
      if (cancelled) return
      if (!isSocketConnected()) {
        setTimeout(retry, 2000)
        return
      }
      subscription = subscribeToNewLogs(tenantId, system, onNewLogs)
    }

    setTimeout(retry, 2000)
    return {
      unsubscribe() {
        cancelled = true
        subscription?.unsubscribe?.()
      },
    }
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

  return subscription // guardar para poder desuscribirse al cambiar de sistema
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
