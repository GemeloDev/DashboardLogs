

import { ref, watch, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'

export function useDashboardRealtime(systemRef, tenantIdRef, onNewLogs) {

  const isConnected = ref(false)
  let stompClient   = null
  let subscription  = null

  // ── Conectar al WebSocket ───────────────────────────────────────────────────
  function connect() {
    if (stompClient?.connected) return

    stompClient = new Client({
      brokerURL: `ws://${window.location.host}/ws`,

      onConnect: () => {
        isConnected.value = true
        subscribeToSystem(systemRef.value, tenantIdRef.value)
      },

      onDisconnect: () => {
        isConnected.value = false
      },

      onStompError: (frame) => {
        console.warn('[WS] STOMP error:', frame)
      },

      // Reconexión automática cada 5 segundos si se cae
      reconnectDelay: 5000,
    })

    stompClient.activate()
  }

  // ── Suscribirse al topic del system actual ─────────────────────────────────
  function subscribeToSystem(system, tenantId) {
    if (!system || !tenantId || !stompClient?.connected) return

    // Desuscribirse del system anterior
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }

    // El system puede tener espacios — reemplazar con _ igual que el backend
    const systemKey = system.trim().toUpperCase().replace(/\s+/g, '_')
    const topic = `/topic/dashboard/${tenantId}/${systemKey}`

    subscription = stompClient.subscribe(topic, (message) => {
      try {
        const event = JSON.parse(message.body)

        if (event.type === 'NEW_LOGS') {
          console.debug(`[WS] ${event.count} log(s) nuevo(s) en ${event.system}`)
          // Llamar el callback — el dashboard re-llama stats/series
          onNewLogs(event)
        }
      } catch (e) {
        console.warn('[WS] Error parseando mensaje:', e)
      }
    })

    console.debug(`[WS] Suscrito a ${topic}`)
  }

  // ── Cuando cambia el system, cambiar suscripción ───────────────────────────
  watch([systemRef, tenantIdRef], ([newSystem, newTenant]) => {
    if (stompClient?.connected) {
      subscribeToSystem(newSystem, newTenant)
    }
  })

  // ── Limpiar al desmontar el componente ─────────────────────────────────────
  onUnmounted(() => {
    subscription?.unsubscribe()
    stompClient?.deactivate()
    isConnected.value = false
  })

  // ── Iniciar conexión ───────────────────────────────────────────────────────
  connect()

  return { isConnected }
}
