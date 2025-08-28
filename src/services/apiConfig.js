// Configuración centralizada de la URL base
// En desarrollo usamos el proxy configurado en quasar.config.js (/api -> http://187.188.66.56:8024/api)
// Use a relative base URL so the frontend can call `/api/...` (same origin).
// En producción asegúrate de que el backend acepte las peticiones desde el origen
// donde despliegues la aplicación. Si el backend está en otro origen, el servidor
// debe devolver los headers de respuesta adecuados (por ejemplo Access-Control-Allow-Origin)
export const API_BASE_URL = '/api'

// Configuración global de axios: sólo headers de petición válidos.
// Nota: NO debemos enviar Access-Control-Allow-* desde el cliente — esos son headers
// de respuesta que debe devolver el servidor.
export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Helper: construir configuración de petición para axios
// - token: string de bearer token (opcional)
// - withCredentials: true si necesitas enviar cookies/credenciales
// Uso: axios.get(`${API_BASE_URL}/ruta`, buildApiConfig({ token, withCredentials: true }))
export function buildApiConfig({ token = null, withCredentials = false } = {}) {
  const headers = { ...API_CONFIG.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  return {
    ...API_CONFIG,
    headers,
    withCredentials,
  }
}

// NOTA: No añadas Access-Control-Allow-* en el cliente. Esos headers deben
// ser devueltos por el servidor en la respuesta. El cliente solo debe
// enviar los headers de petición (Content-Type, Authorization, etc.) y, si
// es necesario, activar withCredentials para cookies.
