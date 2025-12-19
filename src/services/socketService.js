// stompSocketService.js
import { Client } from "@stomp/stompjs";
import { getJWTData } from "./cookieService";
// import { SOCKET } from "./apiEndpoints";

let stompClient = null;
let connected = false;

// 1. Detectar si estamos en HTTPS o HTTP para usar wss o ws
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

// 2. Obtener la IP y Puerto del navegador (ej: 192.168.100.30:9000)
const host = window.location.host;

// 3. Construir la URL completa apuntando al Proxy de Quasar
// Asegúrate de que '/ws-endpoint' coincida con lo que pusiste en quasar.config.js
const brokerURL = `${protocol}://${host}/ws`;

/**
 * Convierte un "eventName" en un destino STOMP para suscribirse
 */
function eventToDestination(eventName) {
  return `/topic/${eventName}`;
}

/**
 * Inicializa STOMP sobre WebSocket
 */
export function initializeSocket(
  subscribeTopic = 'qr-login/',
  onMessageReceived = () => { },
  {
    endpoint = brokerURL,
    debug = false,
    reconnectDelay = 3000
  } = {}
) {
  if (stompClient && connected) return stompClient;

  stompClient = new Client({
    brokerURL: endpoint,
    reconnectDelay,
    debug: msg => {
      if (debug) console.log("[STOMP DEBUG]", msg);
    },
    onConnect: () => {
      connected = true;
      console.log("✅ STOMP conectado exitosamente.");

      const topic = eventToDestination(subscribeTopic);
      console.log('Suscribiéndose a:', topic)

      stompClient.subscribe(topic, message => {
        console.log(`Received:`, JSON.parse(message.body))
        const payload = JSON.parse(message.body);
        const data = getJWTData(payload.accessToken)
        onMessageReceived({
          payload,
          data
        })
      });
    },
    onStompError: frame => {
      console.error("🚨 Error STOMP:", frame.headers["message"]);
      console.error("Detalles:", frame.body);
    },
    onWebSocketClose: evt => {
      connected = false;
      console.warn("❌ STOMP desconectado:", evt.reason || "Conexión cerrada");
    },
    onWebSocketError: err => {
      console.error("🚨 Error WebSocket:", err);
    }
  });

  stompClient.activate();
  return stompClient;
}

/**
 * Cerrar conexión STOMP
 */
export function disconnectSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    connected = false;
    console.log("🔌 STOMP desconectado manualmente");
  }
}

/**
 * Obtener el cliente STOMP directamente (para usos avanzados)
 */
export function getSocket() {
  return stompClient;
}
