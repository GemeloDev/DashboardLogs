/**
 * ════════════════════════════════════════════════════════════════
 * SERVICIO DE WEBSOCKET NATIVO CON STOMP
 * ════════════════════════════════════════════════════════════════
 *
 * Maneja conexiones WebSocket usando el protocolo STOMP sobre
 * Usa el transporte WebSocket nativo y reconexión automática.
 *
 * ════════════════════════════════════════════════════════════════
 */

import { Client } from '@stomp/stompjs'
import { getJWTData } from './cookieService'
import { WS_BASE_URL, isDebug, isDevelopment } from 'src/config/env'

const DEFAULT_BROKER_URL = WS_BASE_URL || 'ws://187.188.66.56:8040/ws'

export function getWsUrl(configuredUrl = '') {
  if (configuredUrl) return configuredUrl
  if (isDevelopment) return DEFAULT_BROKER_URL
  if (typeof window === 'undefined') return DEFAULT_BROKER_URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

class SocketService {
  constructor() {
    this.client = null
    this.subscriptions = new Map()
    this.subscriptionSeq = 0
    this.connectListeners = new Set()
  }

  connect(onConnectedCallback, brokerURL = '') {
    if (this.client && this.client.active) {
      if (typeof onConnectedCallback === 'function' && this.client.connected) {
        onConnectedCallback()
      }
      return
    }

    const wsUrl = getWsUrl(brokerURL)
    this.client = new Client({
      brokerURL: wsUrl,
      // Dar tiempo al backend para recuperarse antes de reintentar STOMP.
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (isDebug) console.log('[STOMP Debug]', str)
      },
      onConnect: (frame) => {
        console.log('✅ STOMP conectado (nativo):', frame)
        this.connectListeners.forEach((listener) => {
          try {
            listener(this.client)
          } catch (err) {
            console.error('[STOMP] Error en listener de conexión:', err)
          }
        })
        if (typeof onConnectedCallback === 'function') onConnectedCallback(frame)
      },
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message'])
      },
      onWebSocketError: (event) => {
        console.warn('⚠️ Error de conexión WebSocket nativo:', event)
      },
      onWebSocketClose: (event) => {
        // Las suscripciones STOMP dejan de ser válidas al cerrar el transporte.
        // Los listeners de conexión las restauran después del reconnect.
        this.subscriptions.clear()
        console.warn('❌ STOMP desconectado:', event.reason || 'Conexión cerrada')
      },
    })

    this.client.activate()
  }

  isConnected() {
    return !!this.client?.connected
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) {
      console.warn(`[STOMP] Suscripción omitida; WebSocket no disponible: ${topic}`)
      return null
    }

    const stompSubscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body)
        callback(data, message)
      } catch {
        callback(message.body, message)
      }
    })

    const subscriptionKey = `${topic}#${++this.subscriptionSeq}`
    const subscription = {
      unsubscribe: () => {
        stompSubscription.unsubscribe()
        this.subscriptions.delete(subscriptionKey)
      },
    }
    this.subscriptions.set(subscriptionKey, subscription)
    return subscription
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    this.subscriptions.clear()
  }
}

const socketService = new SocketService()

// ════════════════════════════════════════════════════════════════
// API pública compatible con el resto de la aplicación
// ════════════════════════════════════════════════════════════════

export function onSocketConnect(listener) {
  if (typeof listener !== 'function') return () => {}
  socketService.connectListeners.add(listener)
  return () => socketService.connectListeners.delete(listener)
}

export function connectSocket({ endpoint = '', onConnected } = {}) {
  socketService.connect(onConnected, endpoint)
  return socketService.client
}

export function connect(onConnectedCallback) {
  socketService.connect(onConnectedCallback)
}

export function isSocketConnected() {
  return socketService.isConnected()
}

export function ensureSocketConnected(options = {}) {
  if (!isSocketConnected()) {
    connectSocket(options)
  }
  return socketService.client
}

export function restartSocketConnection(options = {}) {
  socketService.disconnect()
  return connectSocket(options)
}

export function initializeSocket(
  subscribeTopic = 'qr-login/',
  onMessageReceived = () => {},
  { endpoint = '' } = {},
) {
  if (socketService.client) {
    socketService.disconnect()
  }

  socketService.connect(() => {
    const topic = `/topic/${subscribeTopic}`
    console.log('Suscribiéndose a:', topic)

    socketService.subscribe(topic, (payload) => {
      console.log('[STOMP] Mensaje recibido en topic:', topic)
      console.log('[STOMP] Payload completo:', JSON.stringify(payload, null, 2))

      const jwtData = payload?.accessToken ? getJWTData(payload.accessToken) : null
      console.log('[STOMP] JWT decodificado:', JSON.stringify(jwtData, null, 2))

      onMessageReceived({ payload, data: jwtData })
    })
  }, endpoint)
}

export function subscribeToAlerts(tenantId, onAlert = () => {}) {
  const topic = `/topic/alerts/${tenantId}`
  if (!isSocketConnected()) return null

  return socketService.subscribe(topic, (payload) => {
    if (payload?.type === 'ALERT_CRIT') onAlert(payload)
  })
}

export function subscribeToNewLogs(tenantId, system, onNewLogs = () => {}) {
  const topic = `/topic/dashboard/${tenantId}/${system}`
  if (!isSocketConnected()) return null

  return socketService.subscribe(topic, (payload) => {
    if (payload?.type === 'NEW_LOGS') onNewLogs(payload)
  })
}

export function subscribeToTopic(topic, callback = () => {}) {
  if (!isSocketConnected()) return null

  const sub = socketService.subscribe(topic, callback)
  return {
    unsubscribe() {
      sub?.unsubscribe?.()
    },
  }
}

export { subscribeToTopic as subscribe }

export function disconnectSocket() {
  socketService.disconnect()
  console.log('🔌 STOMP desconectado manualmente')
}

export function getSocket() {
  return socketService.client
}

export default socketService
